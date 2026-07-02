import { NextRequest, NextResponse } from 'next/server';

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

  if (!ADMIN_PASSWORD) {
    console.error('ADMIN_PASSWORD environment variable is not configured.');
    return NextResponse.json(
      { error: 'Internal server configuration error' },
      { status: 500 }
    );
  }

  try {
    const { password } = await request.json();

    if (password !== ADMIN_PASSWORD) {
      return NextResponse.json({ error: 'Invalid password' }, { status: 401 });
    }

    const response = NextResponse.json({ success: true });

    const hostname = request.nextUrl.hostname;
    const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1';
    const isSecure = !isLocalhost && (request.nextUrl.protocol === 'https:' || request.headers.get('x-forwarded-proto') === 'https');

    // Set a cookie that:
    // - httpOnly: cannot be read by JavaScript
    // - secure: only sent over HTTPS (disabled for local dev)
    // - sameSite: lax protects against CSRF while allowing navigation redirects
    response.cookies.set(ADMIN_COOKIE, 'authenticated', {
      httpOnly: true,
      secure:   isSecure,
      sameSite: 'lax',
      maxAge:   COOKIE_MAX_AGE,
      path:     '/',
    });

    return response;
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}

export async function GET(request: NextRequest) {
  const session = request.cookies.get(ADMIN_COOKIE)?.value;
  if (session === 'authenticated') {
    return NextResponse.json({ authenticated: true });
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
