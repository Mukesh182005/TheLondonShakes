import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Rate limit to mitigate enumeration timing attacks
const checkAttempts = new Map<string, { count: number; resetAt: number }>();
const MAX_CHECK_ATTEMPTS = 15;
const CHECK_WINDOW_MS = 60 * 1000;

export async function GET(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    || request.headers.get('x-real-ip')
    || 'unknown';

  // Rate limit
  const now = Date.now();
  const entry = checkAttempts.get(ip);
  if (entry && now < entry.resetAt) {
    entry.count++;
    if (entry.count > MAX_CHECK_ATTEMPTS) {
      return NextResponse.json({ isStaff: false });
    }
  } else {
    checkAttempts.set(ip, { count: 1, resetAt: now + CHECK_WINDOW_MS });
  }

  const { searchParams } = new URL(request.url);
  const email = searchParams.get('email')?.trim().toLowerCase();

  if (!email) {
    return NextResponse.json({ isStaff: false });
  }

  // Super admin check
  const superAdminEmails = [
    (process.env.SUPER_ADMIN_EMAIL || '').toLowerCase(),
    (process.env.OWNER_EMAIL || '').toLowerCase(),
    'thelondonshakes.silchar@gmail.com',
    'abhik.dhar47@gmail.com'
  ].filter(Boolean);
  if (superAdminEmails.includes(email)) {
    return NextResponse.json({ isStaff: true });
  }

  try {
    const staff = await prisma.staffAccount.findUnique({
      where: { email },
      select: { active: true }, // Only select needed field
    });
    return NextResponse.json({ isStaff: !!staff && staff.active });
  } catch (error) {
    console.error('Error checking staff email:', error);
    // Return false on error — don't leak error details
    return NextResponse.json({ isStaff: false });
  }
}
