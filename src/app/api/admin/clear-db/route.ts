import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    // Delete all orders from database
    await prisma.order.deleteMany({});

    // Delete all reservations from database
    await prisma.reservation.deleteMany({});

    // Delete all audit logs from database
    await prisma.auditLog.deleteMany({});

    // Record the database purge action in a fresh log
    await prisma.auditLog.create({
      data: {
        action: 'CLEAR_DATABASE',
        details: 'All orders, reservations, and historical logs were permanently cleared from the database.',
        adminEmail: 'Super Admin | thelondonshakessilchar@gmail.com',
      },
    });

    return NextResponse.json({ success: true, message: 'All database tables purged successfully.' });
  } catch (error) {
    console.error('Failed to purge database:', error);
    return NextResponse.json({ success: false, error: 'Failed to purge database' }, { status: 500 });
  }
}
