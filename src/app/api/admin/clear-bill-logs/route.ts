import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    // Record log of attempting to clear bill logs (logs are protected and retained)
    await prisma.auditLog.create({
      data: {
        action: 'CLEAR_BILL_LOGS',
        details: 'Attempted to clear bill modification logs. System logs are protected and retained.',
        adminEmail: `Super Admin | ${process.env.NEXT_PUBLIC_SUPER_ADMIN_EMAIL || ''}`,
      },
    }).catch(() => {});

    return NextResponse.json({
      success: true,
      message: 'Bill logs are protected and retained in system logs.',
      count: 0,
    });
  } catch (error) {
    console.error('Failed to clear bill logs:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to clear bill logs' },
      { status: 500 }
    );
  }
}
