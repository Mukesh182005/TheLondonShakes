import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { adminDb } from '@/lib/firebase-admin';

export async function POST(req: NextRequest) {
  try {
    const { orderId, items, total, adminEmail, discountDetails, reason } = await req.json();

    if (!orderId || !Array.isArray(items) || typeof total !== 'number') {
      return NextResponse.json({ success: false, error: 'Invalid payload' }, { status: 400 });
    }

    // 1. Fetch current order to log the difference
    const originalOrder = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!originalOrder) {
      return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 });
    }

    // 2. Build detailed before/after diff for Bill Log
    const originalItems = Array.isArray(originalOrder.items) ? originalOrder.items as any[] : [];
    const originalRegular = originalItems.filter((i: any) => !i.isAdditive && i.id !== 'discount' && i.id !== 'tax-cgst' && i.id !== 'tax-sgst');
    const originalAdditives = originalItems.filter((i: any) => i.isAdditive || i.id === 'discount' || i.id === 'tax-cgst' || i.id === 'tax-sgst');

    const newRegular = items.filter((i: any) => !i.isAdditive && i.id !== 'discount' && i.id !== 'tax-cgst' && i.id !== 'tax-sgst');
    const newAdditives = items.filter((i: any) => i.isAdditive || i.id === 'discount' || i.id === 'tax-cgst' || i.id === 'tax-sgst');

    // Build item-level diffs
    const itemDiffs: string[] = [];

    // Check removed items
    originalRegular.forEach((orig: any) => {
      const match = newRegular.find((n: any) => n.id === orig.id);
      if (!match) {
        itemDiffs.push(`REMOVED: ${orig.name} ×${orig.qty} (₹${orig.price * orig.qty})`);
      } else if (match.qty !== orig.qty) {
        itemDiffs.push(`CHANGED: ${orig.name} qty ${orig.qty} → ${match.qty} (₹${orig.price * orig.qty} → ₹${match.price * match.qty})`);
      }
    });

    // Check added items
    newRegular.forEach((newItem: any) => {
      const match = originalRegular.find((o: any) => o.id === newItem.id);
      if (!match) {
        itemDiffs.push(`ADDED: ${newItem.name} ×${newItem.qty} (₹${newItem.price * newItem.qty})`);
      }
    });

    // Check additive diffs
    const additiveDiffs: string[] = [];
    originalAdditives.forEach((orig: any) => {
      const match = newAdditives.find((n: any) => n.id === orig.id);
      if (!match) {
        additiveDiffs.push(`REMOVED CHARGE: ${orig.name} (₹${orig.price})`);
      }
    });
    newAdditives.forEach((newAdd: any) => {
      const match = originalAdditives.find((o: any) => o.id === newAdd.id);
      if (!match) {
        additiveDiffs.push(`ADDED CHARGE: ${newAdd.name} (₹${newAdd.price})`);
      }
    });

    // 3. Update order in database
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: {
        items: items as object,
        total: total,
      },
    });

    // 4. Create detailed Audit Log entry for Bill Log
    try {
      const billLogDetails = JSON.stringify({
        orderId,
        reason: reason || 'Not specified',
        adminEmail: adminEmail || (process.env.SUPER_ADMIN_EMAIL || ''),
        customerName: originalOrder.customerName,
        customerPhone: originalOrder.phone,
        customerEmail: originalOrder.email,
        tableNumber: originalOrder.tableNumber || null,
        orderType: originalOrder.type,
        originalTotal: originalOrder.total,
        newTotal: total,
        totalDiff: +(total - originalOrder.total).toFixed(2),
        itemChanges: itemDiffs,
        additiveChanges: additiveDiffs,
        originalItems: originalRegular.map((i: any) => ({ name: i.name, qty: i.qty, price: i.price })),
        newItems: newRegular.map((i: any) => ({ name: i.name, qty: i.qty, price: i.price })),
        originalAdditives: originalAdditives.map((i: any) => ({ name: i.name, price: i.price })),
        newAdditives: newAdditives.map((i: any) => ({ name: i.name, price: i.price })),
        discountDetails: discountDetails || 'none',
        editedAt: new Date().toISOString(),
      });

      await prisma.auditLog.create({
        data: {
          action: 'BILL_EDITED',
          details: billLogDetails,
          adminEmail: adminEmail || (process.env.SUPER_ADMIN_EMAIL || ''),
        },
      });
    } catch (auditError) {
      console.warn('Failed to write audit log:', auditError);
    }

    // Trigger Firebase Realtime Database Update
    try {
      if (adminDb) await adminDb.ref('orders/lastUpdate').set(Date.now());
    } catch (fbErr) {
      console.error("Firebase trigger failed", fbErr);
    }

    return NextResponse.json({ success: true, order: updatedOrder });
  } catch (error: unknown) {
    console.error('Order edit API error:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
