import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import type { Order, CartItem } from '@/store/restaurantStore';
import { verifyAdminRequest } from '@/lib/auth-crypto';
import { adminDb } from '@/lib/firebase-admin';
import { z } from 'zod';

const OrderPostSchema = z.object({
  id: z.string().min(1).optional(),
  type: z.enum(['dine-in', 'takeaway', 'delivery', 'pickup']),
  tableNumber: z.string().optional(),
  customerName: z.string().max(100).optional(),
  address: z.object({
    name: z.string().max(100).optional(),
    phone: z.string().optional(),
    email: z.string().optional(),
    flat: z.string().optional(),
    street: z.string().optional(),
    city: z.string().optional(),
  }).optional(),
  items: z.array(z.any()).min(1),
  total: z.number().positive(),
  status: z.enum(['confirmed', 'preparing', 'out for delivery', 'delivered', 'cancelled', 'pending', 'out-for-delivery']).optional(),
  paymentMethod: z.enum(['cash', 'card', 'upi', 'cod', 'card_on_delivery', 'pay_later']).optional(),
  paymentStatus: z.enum(['unpaid', 'pending_verification', 'paid', 'pending', 'failed']).optional(),
  upiTxnId: z.string().nullable().optional(),
  receiptPhoto: z.string().nullable().optional(),
  createdAt: z.string().optional(),
});

const OrderPutSchema = z.object({
  orderId: z.string().min(1),
  status: z.enum(['confirmed', 'preparing', 'out for delivery', 'delivered', 'cancelled', 'pending', 'out-for-delivery']).optional(),
  paymentStatus: z.enum(['unpaid', 'pending_verification', 'paid', 'pending', 'failed']).optional(),
  receiptPhoto: z.string().nullable().optional(),
  customerName: z.string().max(100).optional(),
  phone: z.string().optional(),
  email: z.string().optional(),
});

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
      const isAdmin = await verifyAdminRequest(req);
      if (!isAdmin) {
        const myOrders = req.cookies.get('tls_my_orders')?.value?.split(',') || [];
        if (!myOrders.includes(orderId)) {
          return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 403 });
        }
      }
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
        adminPlaced: dbOrder.addressFlat === 'ADMIN_PLACED' || dbOrder.email === (process.env.SUPER_ADMIN_EMAIL || ''),
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
        receiptPhoto: (o as any).receiptPhoto || undefined,
        createdAt: o.createdAt.toISOString(),
        adminPlaced: o.addressFlat === 'ADMIN_PLACED' || o.email === (process.env.SUPER_ADMIN_EMAIL || ''),
        discount: (o as any).discount ?? 0,
        tax: (o as any).tax ?? 0,
        cashier: (o as any).cashier ?? 'Counter Staff',
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

    // Filter by lastClearedAt if ?all=true is not set
    const showAll = searchParams.get('all') === 'true';
    let filteredOrders = all;

    if (!showAll) {
      try {
        const lastClearedSetting = await prisma.systemSetting.findUnique({
          where: { key: 'lastClearedAt' },
        });
        if (lastClearedSetting && lastClearedSetting.value) {
          const clearTime = new Date(lastClearedSetting.value).getTime();
          filteredOrders = all.filter(
            (o) => new Date(o.createdAt).getTime() >= clearTime
          );
        }
      } catch (dbErr) {
        console.warn('Failed to retrieve lastClearedAt setting from DB:', dbErr);
      }
    }

    return NextResponse.json(filteredOrders);
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
    const rawBody = await req.json();
    const parsed = OrderPostSchema.safeParse(rawBody);
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: 'Invalid payload structure', details: parsed.error.format() }, { status: 400 });
    }
    const body: Order = rawBody as Order;

    // Input Validation
    if (!body || typeof body !== 'object') {
      return NextResponse.json({ success: false, error: 'Invalid payload structure' }, { status: 400 });
    }

    if (!body.customerName || typeof body.customerName !== 'string' || body.customerName.trim() === '') {
      if (body.type === 'dine-in' && body.tableNumber) {
        body.customerName = `Guest (${body.tableNumber})`;
        if (body.address) {
          body.address.name = body.customerName;
        }
      } else {
        return NextResponse.json({ success: false, error: 'Invalid or too long customer name' }, { status: 400 });
      }
    } else if (body.customerName.length > 100) {
      return NextResponse.json({ success: false, error: 'Customer name too long' }, { status: 400 });
    }

    if (!body.address || typeof body.address !== 'object') {
      return NextResponse.json({ success: false, error: 'Invalid address payload' }, { status: 400 });
    }

    const isDineIn = body.type === 'dine-in';
    if (!isDineIn) {
      if (!body.address.email || !isValidEmail(body.address.email)) {
        return NextResponse.json({ success: false, error: 'Invalid email address format' }, { status: 400 });
      }
      if (!body.address.phone || !isValidPhone(body.address.phone)) {
        return NextResponse.json({ success: false, error: 'Invalid phone number format' }, { status: 400 });
      }
    } else {
      if (body.address.email && body.address.email !== 'N/A' && !isValidEmail(body.address.email)) {
        return NextResponse.json({ success: false, error: 'Invalid email address format' }, { status: 400 });
      }
      if (body.address.phone && body.address.phone !== 'N/A' && !isValidPhone(body.address.phone)) {
        return NextResponse.json({ success: false, error: 'Invalid phone number format' }, { status: 400 });
      }
    }

    if (!Array.isArray(body.items) || body.items.length === 0) {
      return NextResponse.json({ success: false, error: 'Cart items list cannot be empty' }, { status: 400 });
    }

    if (typeof body.total !== 'number' || body.total <= 0) {
      return NextResponse.json({ success: false, error: 'Invalid order total value' }, { status: 400 });
    }

    // ── Server-side price recalculation ──────────────────────────────────
    try {
      const itemIds = body.items.map((i: any) => i.id).filter(Boolean);
      const dbMenuItems = await prisma.menuItem.findMany({
        where: { id: { in: itemIds } },
        select: { id: true, price: true, name: true },
      });
      const priceMap = new Map(dbMenuItems.map(m => [m.id, m.price]));

      if (priceMap.size > 0) {
        // Recalculate total from DB prices
        let serverTotal = 0;
        for (const item of body.items) {
          const dbPrice = priceMap.get(item.id);
          if (dbPrice !== undefined) {
            serverTotal += dbPrice * (item.qty || 1);
          } else {
            // Item not in DB (could be an additive/custom item) — use client price but cap it
            serverTotal += Math.min(item.price || 0, 10000) * (item.qty || 1);
          }
        }
        // Allow small rounding tolerance (₹1) but reject manipulated totals
        if (Math.abs(serverTotal - body.total) > Math.max(1, serverTotal * 0.01)) {
          console.warn(`Price mismatch: client=${body.total}, server=${serverTotal}`);
          body.total = serverTotal; // Override with server-calculated total
        }
      } else {
        // No DB items found — sanity-check the client total against item prices
        const clientCalcTotal = body.items.reduce((sum: number, i: any) => sum + (i.price || 0) * (i.qty || 1), 0);
        if (body.total > clientCalcTotal * 1.5 || body.total < clientCalcTotal * 0.5) {
          return NextResponse.json({ success: false, error: 'Order total does not match item prices' }, { status: 400 });
        }
      }
    } catch (priceErr) {
      // DB unavailable for price check — fall back to sanity check
      const clientCalcTotal = body.items.reduce((sum: number, i: any) => sum + (i.price || 0) * (i.qty || 1), 0);
      if (body.total > clientCalcTotal * 1.5 || body.total < clientCalcTotal * 0.5) {
        return NextResponse.json({ success: false, error: 'Order total does not match item prices' }, { status: 400 });
      }
    }

    if (body.receiptPhoto && typeof body.receiptPhoto === 'string') {
      const photoStr = body.receiptPhoto.trim();
      const isDataUrl = photoStr.startsWith('data:');
      const isHttpUrl = photoStr.startsWith('http://') || photoStr.startsWith('https://');

      if (!isDataUrl && !isHttpUrl) {
        return NextResponse.json({ success: false, error: 'Invalid photo format' }, { status: 400 });
      }

      if (isDataUrl) {
        const match = photoStr.match(/^data:([^;]+);base64,/);
        if (!match) {
          return NextResponse.json({ success: false, error: 'Malformed photo data URL' }, { status: 400 });
        }
        const mimeType = match[1];
        const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
        if (!allowedMimeTypes.includes(mimeType)) {
          return NextResponse.json({ success: false, error: 'File type not allowed. Please upload PNG, JPG, or WEBP.' }, { status: 400 });
        }
        const approxSize = photoStr.length * 0.75;
        const maxSizeBytes = 5 * 1024 * 1024; // 5 MB
        if (approxSize > maxSizeBytes) {
          return NextResponse.json({ success: false, error: 'Photo size exceeds maximum limit of 5MB' }, { status: 400 });
        }
      }
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
          discount: Number(body.discount || 0),
          tax: Number(body.tax || 0),
          cashier: body.cashier || 'Counter Staff',
          type: body.type,
          tableNumber: body.tableNumber || null,
          addressFlat: body.address.flat || null,
          addressStreet: body.address.street || null,
          addressCity: body.address.city || null,
          status: body.status,
          paymentMethod: body.paymentMethod,
          paymentStatus: body.paymentStatus,
          upiTxnId: body.upiTxnId || null,
          receiptPhoto: (body.receiptPhoto || null) as any,
          items: JSON.parse(JSON.stringify(body.items)), // Safely stringify/parse to fit JSON input type
        } as any
      });
      
      savedOrder = {
        ...body,
        createdAt: dbOrder.createdAt.toISOString(),
      };
    } catch (dbError: any) {
      console.error("Database failed to save order:", dbError);
      return NextResponse.json({ success: false, error: 'Failed to save order. Please try again.' }, { status: 500 });
    }

    // Keep memory orders updated (limit to 100)
    memoryOrders = [savedOrder, ...memoryOrders].slice(0, 100);

    // Trigger Firebase Realtime Database Update
    try {
      if (adminDb) await adminDb.ref('orders/lastUpdate').set(Date.now());
    } catch (fbErr) {
      console.error("Firebase trigger failed", fbErr);
    }

    const res = NextResponse.json({ success: true, order: savedOrder });

    // Store order ID in cookie for IDOR protection on GET
    const existingCookie = req.cookies.get('tls_my_orders')?.value || '';
    const myOrders = existingCookie ? existingCookie.split(',') : [];
    if (!myOrders.includes(body.id)) {
      myOrders.push(body.id);
      if (myOrders.length > 10) myOrders.shift();
      res.cookies.set('tls_my_orders', myOrders.join(','), {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 7,
      });
    }

    return res;
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

    const rawBody = await req.json();
    const parsed = OrderPutSchema.safeParse(rawBody);
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: 'Invalid payload structure', details: parsed.error.format() }, { status: 400 });
    }
    const { orderId, status, paymentStatus, receiptPhoto, customerName, phone, email } = parsed.data;

    let updatedOrder: Order | null = null;
    try {
      const updateData: Record<string, unknown> = {};
      if (status !== undefined) updateData.status = status;
      if (paymentStatus !== undefined) updateData.paymentStatus = paymentStatus;
      if (receiptPhoto !== undefined) updateData.receiptPhoto = receiptPhoto;
      if (customerName !== undefined) updateData.customerName = customerName;
      if (phone !== undefined) updateData.phone = phone;
      if (email !== undefined) updateData.email = email;

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
        receiptPhoto: (dbOrder as any).receiptPhoto || undefined,
        createdAt: dbOrder.createdAt.toISOString(),
      };
    } catch {
      // Database failed, update memory
      const existingIdx = memoryOrders.findIndex(o => o.id === orderId);
      if (existingIdx !== -1) {
        if (status) memoryOrders[existingIdx].status = status as Order['status'];
        if (paymentStatus) memoryOrders[existingIdx].paymentStatus = paymentStatus as Order['paymentStatus'];
        updatedOrder = memoryOrders[existingIdx];
      }
    }

    if (updatedOrder) {
      // Trigger Firebase Realtime Database Update
      try {
        if (adminDb) await adminDb.ref('orders/lastUpdate').set(Date.now());
      } catch (fbErr) {
        console.error("Firebase trigger failed", fbErr);
      }
      return NextResponse.json({ success: true, order: updatedOrder });
    }

    return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 });
  } catch (error: unknown) {
    console.error("Order PUT API error:", error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
