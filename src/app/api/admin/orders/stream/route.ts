import { NextRequest, NextResponse } from 'next/server';
import { orderSubscribers } from '@/lib/ordersSseState';

const encoder = new TextEncoder();

/**
 * SSE Stream Route — GET /api/admin/orders/stream
 * Keep connection open for real-time order/KDS updates.
 */
export async function GET(request: NextRequest) {
  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      orderSubscribers.add(controller);

      // Heartbeat every 20 seconds to keep connection active
      const heartbeat = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(': heartbeat\n\n'));
        } catch {
          clearInterval(heartbeat);
          orderSubscribers.delete(controller);
        }
      }, 20_000);

      (controller as any)._heartbeat = heartbeat;
    },
    cancel(controller) {
      const hb = (controller as any)._heartbeat;
      if (hb) clearInterval(hb);
      orderSubscribers.delete(controller);
    },
  });

  return new NextResponse(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no', // Disable buffering on Nginx/Cloudflare
    },
  });
}
