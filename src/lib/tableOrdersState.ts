/**
 * Shared server-side state for real-time table order sync.
 * Lives in this separate module so it's not exported from the API route
 * (Next.js route files can only export HTTP verb handlers).
 */
import type { TableOrder } from '@/store/restaurantStore';

// Shared in-process table orders (survives across requests in the same process)
export let sharedTableOrders: TableOrder[] = [];

export function setSharedTableOrders(orders: TableOrder[]) {
  sharedTableOrders = orders;
}

// SSE subscriber registry — each connected browser gets its own controller
type SSEController = ReadableStreamDefaultController<Uint8Array>;
export const subscribers = new Set<SSEController>();

const encoder = new TextEncoder();

/** Push the current table orders to all connected SSE clients */
export function broadcastToAll() {
  const payload = `data: ${JSON.stringify(sharedTableOrders)}\n\n`;
  const bytes = encoder.encode(payload);
  for (const ctrl of subscribers) {
    try {
      ctrl.enqueue(bytes);
    } catch {
      // Client disconnected — remove from set
      subscribers.delete(ctrl);
    }
  }
}
