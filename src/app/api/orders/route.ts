import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { pusherServer } from '@/lib/pusher-server';
import type { Order, CartItem } from '@/store/restaurantStore';
import { verifyAdminRequest } from '@/lib/auth-crypto';

// ── Rate Limiting ────────────────────────────────────────────
const orderAttempts = new Map<string, { count: number; resetAt: number }>();
const MAX_ORDER_ATTEMPTS = 10;
const ORDER_WINDOW_MS = 60 * 1000; // 1 minute

function isOrderRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = orderAttempts.get(ip);

  if (!entry || now > entry.resetAt) {
    orderAttempts.set(ip, { count: 1, resetAt: now + ORDER_WINDOW_MS });
    return false;
  }

  entry.count++;
  if (entry.count > MAX_ORDER_ATTEMPTS) {
    return true;
  }
  return false;
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isValidPhone(phone: string): boolean {
  const clean = phone.replace(/[\s\-()]/g, '');
  return /^\+?[0-9]{7,15}$/.test(clean);
}

type DbOrder = Awaited<ReturnType<typeof prisma.order.findMany>>[number];

// Global server-side array to persist orders in Next.js hot-reload dev memory
// if database fails or is not migrated.
let memoryOrders: Order[] = [];

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const orderId = searchParams.get('id');

    if (!orderId) {
      const isAdmin = await verifyAdminRequest(req);
      if (!isAdmin) {
        return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
      }
    }

    if (orderId) {
      // Light query: Fetch only one specific order
      const dbOrder = await prisma.order.findUnique({
        where: { id: orderId },
      });
      if (!dbOrder) {
        return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 });
      }

      let parsedItems: CartItem[] = [];
      try {
        parsedItems = typeof dbOrder.items === 'string' ? JSON.parse(dbOrder.items) as CartItem[] : (dbOrder.items as unknown as CartItem[] || []);
      } catch {
        parsedItems = [];
      }

      const formattedOrder: Order = {
        id: dbOrder.id,
        items: parsedItems,
        total: dbOrder.total,
        type: dbOrder.type as Order['type'],
        customerName: dbOrder.customerName,
        tableNumber: dbOrder.tableNumber || undefined,
        address: {
          name: dbOrder.customerName,
          phone: dbOrder.phone,
          email: dbOrder.email,
          flat: dbOrder.addressFlat || '',
          street: dbOrder.addressStreet || '',
          city: dbOrder.addressCity || '',
        },
        status: dbOrder.status as Order['status'],
        paymentMethod: dbOrder.paymentMethod as Order['paymentMethod'],
        paymentStatus: dbOrder.paymentStatus as Order['paymentStatus'],
        upiTxnId: dbOrder.upiTxnId || undefined,
        createdAt: dbOrder.createdAt.toISOString(),
        adminPlaced: dbOrder.addressFlat === 'ADMIN_PLACED' || dbOrder.email === 'admin@thelondon.co.uk' || dbOrder.email === 'thelondonshakesilchar@gmail.com',
      };

      return NextResponse.json(formattedOrder);
    }

    const dbOrders = await prisma.order.findMany({
      orderBy: { createdAt: 'desc' },
    });
    
    // Convert DB models back to frontend structure
    const formatted: Order[] = (dbOrders as DbOrder[]).map((o: DbOrder) => {
      let parsedItems: CartItem[] = [];
      try {
        parsedItems = typeof o.items === 'string' ? JSON.parse(o.items) as CartItem[] : (o.items as unknown as CartItem[] || []);
      } catch {
        parsedItems = [];
      }
      return {
        id: o.id,
        items: parsedItems,
        total: o.total,
        type: o.type as Order['type'],
        customerName: o.customerName,
        tableNumber: o.tableNumber || undefined,
        address: {
          name: o.customerName,
          phone: o.phone,
          email: o.email,
          flat: o.addressFlat || '',
          street: o.addressStreet || '',
          city: o.addressCity || '',
        },
        status: o.status as Order['status'],
        paymentMethod: o.paymentMethod as Order['paymentMethod'],
        paymentStatus: o.paymentStatus as Order['paymentStatus'],
        upiTxnId: o.upiTxnId || undefined,
        createdAt: o.createdAt.toISOString(),
        adminPlaced: o.addressFlat === 'ADMIN_PLACED' || o.email === 'admin@thelondon.co.uk' || o.email === 'thelondonshakesilchar@gmail.com',
      };
    });
    
    // Merge with memory orders (ensure unique ids)
    const all = [...formatted];
    memoryOrders.forEach((mo) => {
      if (!all.some((ao) => ao.id === mo.id)) {
        all.push(mo);
      }
    });

    // Sort by date
    all.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return NextResponse.json(all);
  } catch (error) {
    console.warn("Database failed to fetch orders, falling back to memory:", error);
    return NextResponse.json(memoryOrders);
  }
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    || req.headers.get('x-real-ip')
    || 'unknown';

  if (isOrderRateLimited(ip)) {
    return NextResponse.json(
      { success: false, error: 'Too many order submissions. Please try again in 1 minute.' },
      { status: 429 }
    );
  }

  try {
    const body: Order = await req.json();

    // Input Validation
    if (!body || typeof body !== 'object') {
      return NextResponse.json({ success: false, error: 'Invalid payload structure' }, { status: 400 });
    }

    if (!body.customerName || typeof body.customerName !== 'string' || body.customerName.length > 100) {
      return NextResponse.json({ success: false, error: 'Invalid or too long customer name' }, { status: 400 });
    }

    if (!body.address || typeof body.address !== 'object') {
      return NextResponse.json({ success: false, error: 'Invalid address payload' }, { status: 400 });
    }

    if (!body.address.email || !isValidEmail(body.address.email)) {
      return NextResponse.json({ success: false, error: 'Invalid email address format' }, { status: 400 });
    }

    if (!body.address.phone || !isValidPhone(body.address.phone)) {
      return NextResponse.json({ success: false, error: 'Invalid phone number format' }, { status: 400 });
    }

    if (!Array.isArray(body.items) || body.items.length === 0) {
      return NextResponse.json({ success: false, error: 'Cart items list cannot be empty' }, { status: 400 });
    }

    if (typeof body.total !== 'number' || body.total <= 0) {
      return NextResponse.json({ success: false, error: 'Invalid order total value' }, { status: 400 });
    }
    
    // Save to database first
    let savedOrder: Order;
    try {
      const dbOrder = await prisma.order.create({
        data: {
          id: body.id,
          customerName: body.customerName,
          phone: body.address.phone,
          email: body.address.email,
          total: Number(body.total),
          type: body.type,
          tableNumber: body.tableNumber || null,
          addressFlat: body.address.flat || null,
          addressStreet: body.address.street || null,
          addressCity: body.address.city || null,
          status: body.status,
          paymentMethod: body.paymentMethod,
          paymentStatus: body.paymentStatus,
          upiTxnId: body.upiTxnId || null,
          items: JSON.parse(JSON.stringify(body.items)), // Safely stringify/parse to fit JSON input type
        }
      });
      
      savedOrder = {
        ...body,
        createdAt: dbOrder.createdAt.toISOString(),
      };
    } catch (dbError) {
      console.warn("Database failed to save order, using memory:", dbError);
      savedOrder = {
        ...body,
        createdAt: new Date().toISOString(),
      };
    }

    // Keep memory orders updated (limit to 100)
    memoryOrders = [savedOrder, ...memoryOrders].slice(0, 100);

    // Trigger Pusher real-time update
    try {
      await pusherServer.trigger('orders', 'new-order', savedOrder);
      console.log("Pusher event triggered successfully");
    } catch (pusherError) {
      console.warn("Pusher failed to trigger event:", pusherError);
    }

    return NextResponse.json({ success: true, order: savedOrder });
  } catch (error: unknown) {
    console.error("Order API error:", error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}

// Add PUT method to update order status and sync in real-time
export async function PUT(req: NextRequest) {
  try {
    const isAdmin = await verifyAdminRequest(req);
    if (!isAdmin) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { orderId, status, paymentStatus } = await req.json();

    let updatedOrder: Order | null = null;
    try {
      const updateData: Record<string, unknown> = {};
      if (status) updateData.status = status;
      if (paymentStatus) updateData.paymentStatus = paymentStatus;

      const dbOrder = await prisma.order.update({
        where: { id: orderId },
        data: updateData,
      });

      // Format updated DB order
      let parsedItems: CartItem[] = [];
      try {
        parsedItems = typeof dbOrder.items === 'string' ? JSON.parse(dbOrder.items) : (dbOrder.items as unknown as CartItem[] || []);
      } catch {
        parsedItems = [];
      }
      
      updatedOrder = {
        id: dbOrder.id,
        items: parsedItems,
        total: dbOrder.total,
        type: dbOrder.type as Order['type'],
        customerName: dbOrder.customerName,
        tableNumber: dbOrder.tableNumber || undefined,
        address: {
          name: dbOrder.customerName,
          phone: dbOrder.phone,
          email: dbOrder.email,
          flat: dbOrder.addressFlat || '',
          street: dbOrder.addressStreet || '',
          city: dbOrder.addressCity || '',
        },
        status: dbOrder.status as Order['status'],
        paymentMethod: dbOrder.paymentMethod as Order['paymentMethod'],
        paymentStatus: dbOrder.paymentStatus as Order['paymentStatus'],
        upiTxnId: dbOrder.upiTxnId || undefined,
        createdAt: dbOrder.createdAt.toISOString(),
      };
    } catch {
      // Database failed, update memory
      const existingIdx = memoryOrders.findIndex(o => o.id === orderId);
      if (existingIdx !== -1) {
        if (status) memoryOrders[existingIdx].status = status;
        if (paymentStatus) memoryOrders[existingIdx].paymentStatus = paymentStatus;
        updatedOrder = memoryOrders[existingIdx];
      }
    }

    if (updatedOrder) {
      // Trigger Pusher event for status update
      try {
        await pusherServer.trigger('orders', 'order-updated', updatedOrder);
      } catch (e) {
        console.warn("Pusher status update trigger failed:", e);
      }
      return NextResponse.json({ success: true, order: updatedOrder });
    }

    return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 });
  } catch (error: unknown) {
    console.error("Order PUT API error:", error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
