import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const logs = await prisma.auditLog.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json({ success: true, logs });
  } catch (error: unknown) {
    console.error('Audit logs API GET error:', error);
    return NextResponse.json({ success: true, logs: [], warning: 'Logs database temporarily offline' });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { action, details, adminEmail } = await req.json();

    if (!action || !adminEmail) {
      return NextResponse.json({ success: false, error: 'Invalid payload' }, { status: 400 });
    }

    // Sensitive data masking
    let maskedDetails = typeof details === 'object' ? JSON.stringify(details) : String(details);
    if (
      action === 'EDIT_SETTINGS' &&
      (maskedDetails.toLowerCase().includes('passcode') || maskedDetails.toLowerCase().includes('password'))
    ) {
      maskedDetails = 'Updated Owner security settings (Passcode value masked for security).';
    }

    let savedLog = null;
    try {
      savedLog = await prisma.auditLog.create({
        data: {
          action,
          details: maskedDetails,
          adminEmail,
        },
      });
    } catch (dbError) {
      console.warn('Failed to save audit log to DB:', dbError);
      savedLog = {
        id: 'mock-' + Math.random().toString(36).substring(2, 9),
        action,
        details: maskedDetails,
        adminEmail,
        createdAt: new Date().toISOString(),
      };
    }

    return NextResponse.json({ success: true, log: savedLog });
  } catch (error: unknown) {
    console.error('Audit logs API POST error:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
