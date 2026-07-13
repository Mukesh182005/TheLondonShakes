import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    // Only delete audit logs with action 'BILL_EDITED'
    const result = await prisma.auditLog.deleteMany({
      where: { action: 'BILL_EDITED' },
    });

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
