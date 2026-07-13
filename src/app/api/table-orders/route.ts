import { NextRequest, NextResponse } from 'next/server';
import type { TableOrder } from '@/store/restaurantStore';
import {
  sharedTableOrders,
  setSharedTableOrders,
  broadcastToAll,
} from '@/lib/tableOrdersState';

// ── GET — return current table orders snapshot ─────────────────────────────
export async function GET() {
  return NextResponse.json(sharedTableOrders);
}

// ── POST — upsert a single table order and broadcast ────────────────────────
export async function POST(req: NextRequest) {
  try {
    const body: TableOrder = await req.json();
    if (!body || !body.tableNumber) {
      return NextResponse.json({ success: false, error: 'Invalid payload' }, { status: 400 });
    }

    const existingIdx = sharedTableOrders.findIndex(
      (t) => t.tableNumber === body.tableNumber
    );

    if (existingIdx !== -1) {
      const updated = [...sharedTableOrders];
      updated[existingIdx] = body;
      setSharedTableOrders(updated);
    } else {
      setSharedTableOrders([body, ...sharedTableOrders]);
    }

    broadcastToAll();
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}

// ── PUT — bulk replace all table orders (full sync) ─────────────────────────
export async function PUT(req: NextRequest) {
  try {
    const body: TableOrder[] = await req.json();
    if (!Array.isArray(body)) {
      return NextResponse.json({ success: false, error: 'Expected array' }, { status: 400 });
    }

    setSharedTableOrders(body);
    broadcastToAll();
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}

// ── DELETE — clear a specific table ─────────────────────────────────────────
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const tableNumber = searchParams.get('table');
    if (!tableNumber) {
      return NextResponse.json({ success: false, error: 'Missing table param' }, { status: 400 });
    }

    setSharedTableOrders(sharedTableOrders.filter((t) => t.tableNumber !== tableNumber));
    broadcastToAll();
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}
