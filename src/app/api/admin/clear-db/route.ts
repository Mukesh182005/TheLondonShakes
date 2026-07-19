import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { setSharedTableOrders, broadcastToAll } from '@/lib/tableOrdersState';

export async function POST(req: NextRequest) {
  try {
    // Delete all reservations from database (as Reservations operations are cleared)
    await prisma.reservation.deleteMany({});

    // Clear shared in-memory active table orders and broadcast changes
    setSharedTableOrders([]);
    broadcastToAll();

    // Upsert lastClearedAt system setting to filter out orders from active Operations view
    await prisma.systemSetting.upsert({
      where: { key: 'lastClearedAt' },
      update: { value: new Date().toISOString() },
      create: { key: 'lastClearedAt', value: new Date().toISOString() },
    });

    // Record the database clear action in the logs (logs are retained)
    await prisma.auditLog.create({
      data: {
        action: 'CLEAR_DATABASE',
        details: 'Active operations and dashboard statistics were cleared. Historical transaction bills, analytics, and audit logs are retained.',
        adminEmail: `Super Admin | ${process.env.NEXT_PUBLIC_SUPER_ADMIN_EMAIL || ''}`,
      },
    });

    return NextResponse.json({ success: true, message: 'Database operations cleared successfully. History retained.' });
  } catch (error) {
    console.error('Failed to clear operations:', error);
    return NextResponse.json({ success: false, error: 'Failed to clear operations' }, { status: 500 });
  }
}
