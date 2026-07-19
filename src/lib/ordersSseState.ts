// Shared registry of SSE client controllers for KDS and cashier order screens.
type SSEController = ReadableStreamDefaultController<Uint8Array>;
export const orderSubscribers = new Set<SSEController>();
const encoder = new TextEncoder();

/**
 * Broadcasts a real-time event to all connected admin order and KDS clients.
 */
export function broadcastOrderEvent(event: string, data: any) {
  const payload = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
  const bytes = encoder.encode(payload);
  for (const ctrl of orderSubscribers) {
    try {
      ctrl.enqueue(bytes);
    } catch {
      orderSubscribers.delete(ctrl);
    }
  }
}
