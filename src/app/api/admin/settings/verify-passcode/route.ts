import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// ── Rate Limiting ────────────────────────────────────────────
const passcodeAttempts = new Map<string, { count: number; resetAt: number }>();
const MAX_PASSCODE_ATTEMPTS = 5;
const WINDOW_MS = 60 * 1000; // 1 minute

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = passcodeAttempts.get(ip);

  if (!entry || now > entry.resetAt) {
    passcodeAttempts.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return false;
  }

  entry.count++;
  if (entry.count > MAX_PASSCODE_ATTEMPTS) {
    return true;
  }

  return false;
}

export async function POST(req: NextRequest) {
  // Get client IP for rate limiting
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    || req.headers.get('x-real-ip')
    || 'unknown';

  if (isRateLimited(ip)) {
    return NextResponse.json(
      { success: false, error: 'Too many passcode attempts. Please try again in 1 minute.' },
      { status: 429 }
    );
  }

  try {
    const { passcode } = await req.json();

    if (typeof passcode !== 'string') {
      return NextResponse.json({ success: false, error: 'Invalid payload' }, { status: 400 });
    }

    let correctPasscode = process.env.ADMIN_PASSCODE || 'LondonOwner@2026';
    try {
      const dbSetting = await prisma.systemSetting.findUnique({
        where: { key: 'adminPasscode' },
      });
      if (dbSetting) {
        correctPasscode = dbSetting.value;
      }
    } catch (dbError) {
      console.warn('Failed to verify passcode from DB, using fallback:', dbError);
    }

    if (passcode === correctPasscode) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json({ success: false, error: 'Incorrect passcode' }, { status: 401 });
    }
  } catch (error: unknown) {
    console.error('Verify passcode error:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
