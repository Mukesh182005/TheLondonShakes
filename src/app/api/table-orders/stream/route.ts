import { NextResponse } from 'next/server';
import { sharedTableOrders, subscribers } from '@/lib/tableOrdersState';

const encoder = new TextEncoder();

/**
 * SSE Stream — GET /api/table-orders/stream
 *
 * Each connected admin/manager/owner browser opens this endpoint.
 * The server keeps the connection alive and pushes JSON events
 * whenever table orders change (via broadcastToAll in tableOrdersState).
 */
export async function GET() {
  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      // Register this client as an SSE subscriber
      subscribers.add(controller);

      // Send the current snapshot immediately on connect
      const initial = `data: ${JSON.stringify(sharedTableOrders)}\n\n`;
      controller.enqueue(encoder.encode(initial));

      // Send a heartbeat every 25 seconds to keep the connection alive
      const heartbeat = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(': heartbeat\n\n'));
        } catch {
          clearInterval(heartbeat);
          subscribers.delete(controller);
        }
      }, 25_000);

      // Store cleanup reference on controller
      (controller as unknown as { _heartbeat: ReturnType<typeof setInterval> })._heartbeat = heartbeat;
    },
    cancel(controller) {
      // Clean up heartbeat if available
      const hb = (controller as unknown as { _heartbeat?: ReturnType<typeof setInterval> })._heartbeat;
      if (hb) clearInterval(hb);
      subscribers.delete(controller);
    },
  });

  return new NextResponse(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no', // Disable Nginx proxy buffering
    },
  });
}
