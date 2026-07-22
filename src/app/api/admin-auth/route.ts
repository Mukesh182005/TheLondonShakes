import { NextRequest, NextResponse } from 'next/server';
import { generateSessionToken, generateStaffSessionToken, verifyStaffSessionToken } from '@/lib/auth-crypto';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

// ──────────────────────────────────────────────────────────────
//  Admin password is read from environment variable.
//  Set ADMIN_PASSWORD in .env.local (never commit this file).
// ──────────────────────────────────────────────────────────────
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
const ADMIN_COOKIE   = 'tls_admin_session';
const COOKIE_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

// ── Rate Limiting ────────────────────────────────────────────
const loginAttempts = new Map<string, { count: number; resetAt: number }>();
const MAX_ATTEMPTS = 5;
const WINDOW_MS = 60 * 1000; // 1 minute

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = loginAttempts.get(ip);

  if (!entry || now > entry.resetAt) {
    loginAttempts.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return false;
  }

  entry.count++;
  if (entry.count > MAX_ATTEMPTS) {
    return true;
  }

  return false;
}

export async function POST(request: NextRequest) {
  // Get client IP for rate limiting
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    || request.headers.get('x-real-ip')
    || 'unknown';

  if (isRateLimited(ip)) {
    return NextResponse.json(
      { error: 'Too many login attempts. Please wait 1 minute.' },
      { status: 429 }
    );
  }

  try {
    const { email, password } = await request.json();
    const cleanEmail = email?.trim().toLowerCase();

    if (!cleanEmail || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    const isOwner = cleanEmail === (process.env.SUPER_ADMIN_EMAIL || '').toLowerCase();

    let token = '';

    if (isOwner) {
      let dbPasscode = process.env.ADMIN_PASSWORD || 'admin@thelondon.co.uk';
      try {
        const setting = await prisma.systemSetting.findUnique({
          where: { key: 'adminPasscode' },
        });
        if (setting && setting.value) {
          dbPasscode = setting.value;
        }
      } catch (dbErr) {
        console.warn('Database error fetching passcode setting, using environment variable fallback:', dbErr);
      }

      if (password !== dbPasscode) {
        return NextResponse.json({ error: 'Invalid password' }, { status: 401 });
      }

      token = await generateStaffSessionToken(cleanEmail, 'owner');
    } else {
      // Find staff account in the database
      const staff = await prisma.staffAccount.findUnique({
        where: { email: cleanEmail },
      });

      if (!staff) {
        return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
      }

      if (!staff.active) {
        return NextResponse.json({ error: 'This account has been deactivated' }, { status: 403 });
      }

      const passwordMatch = await bcrypt.compare(password, staff.passwordHash);
      if (!passwordMatch) {
        return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
      }

      token = await generateStaffSessionToken(staff.email, staff.role);
    }

    const response = NextResponse.json({ success: true });

    const hostname = request.nextUrl.hostname;
    const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1';
    const isSecure = !isLocalhost && (request.nextUrl.protocol === 'https:' || request.headers.get('x-forwarded-proto') === 'https');

    response.cookies.set(ADMIN_COOKIE, token, {
      httpOnly: true,
      secure:   isSecure,
      sameSite: 'strict',
      maxAge:   COOKIE_MAX_AGE,
      path:     '/',
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}

export async function GET(request: NextRequest) {
  const session = request.cookies.get(ADMIN_COOKIE)?.value;
  if (!session) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  const expectedToken = ADMIN_PASSWORD ? await generateSessionToken(ADMIN_PASSWORD) : '';
  if (session === expectedToken) {
    // Super admin — fixed display name
    return NextResponse.json({ authenticated: true, role: 'owner', name: "Maître d' London", email: process.env.SUPER_ADMIN_EMAIL || '' });
  }

  const staff = await verifyStaffSessionToken(session);
  if (staff) {
    if (staff.role === 'owner') {
      return NextResponse.json({
        authenticated: true,
        role: 'owner',
        name: "Maître d' London",
        email: staff.email
      });
    }

    // Fetch real name from DB for staff accounts
    let displayName = staff.email.split('@')[0]; // fallback
    try {
      const account = await prisma.staffAccount.findUnique({
        where: { email: staff.email },
        select: { name: true },
      });
      if (account?.name) displayName = account.name;
    } catch { /* DB unavailable, use fallback */ }

    return NextResponse.json({ authenticated: true, role: staff.role, email: staff.email, name: displayName });
  }

  return NextResponse.json({ authenticated: false }, { status: 401 });
}

export async function DELETE() {
  const response = NextResponse.json({ success: true });
  // Clear the cookie on logout
  response.cookies.set(ADMIN_COOKIE, '', {
    httpOnly: true,
    maxAge:   0,
    path:     '/',
  });
  return response;
}
