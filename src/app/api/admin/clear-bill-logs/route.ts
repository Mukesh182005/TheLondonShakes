import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    // Only delete audit logs with action 'BILL_EDITED'
    const result = await prisma.auditLog.deleteMany({
      where: { action: 'BILL_EDITED' },
    });

    // Record log of clearing bill logs
    await prisma.auditLog.create({
      data: {
        action: 'CLEAR_BILL_LOGS',
        details: `Cleared ${result.count} bill modification log(s).`,
        adminEmail: 'Super Admin | thelondonshakessilchar@gmail.com',
      },
    }).catch(() => {});

    return NextResponse.json({
      success: true,
      message: `Cleared ${result.count} bill modification log(s).`,
      count: result.count,
    });
  } catch (error) {
    console.error('Failed to clear bill logs:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to clear bill logs' },
      { status: 500 }
    );
  }
}
