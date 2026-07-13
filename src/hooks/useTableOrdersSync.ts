'use client';

import { useEffect, useRef, useState } from 'react';
import { useRestaurantStore, type TableOrder } from '@/store/restaurantStore';
import toast from 'react-hot-toast';

/**
 * useTableOrdersSync
 *
 * Subscribes to the SSE stream at /api/table-orders/stream.
 * When table orders change on the server (e.g. waiter adds a dish),
 * this hook updates the local Zustand store and shows a toast alert.
 *
 * Usage:
 *   const { isLive } = useTableOrdersSync();
 */
export function useTableOrdersSync() {
  const [isLive, setIsLive] = useState(false);
  const setTableOrders = useRestaurantStore((s) => s.setTableOrders);
  const prevOrdersRef = useRef<TableOrder[]>([]);
  const esRef = useRef<EventSource | null>(null);
  const retryTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const retryCountRef = useRef(0);

  const connect = () => {
    if (typeof window === 'undefined') return;

    // Close any existing connection
    if (esRef.current) {
      esRef.current.close();
    }

    const es = new EventSource('/api/table-orders/stream');
    esRef.current = es;

    es.onopen = () => {
      setIsLive(true);
      retryCountRef.current = 0;
    };

    es.onmessage = (event) => {
      try {
        const incoming: TableOrder[] = JSON.parse(event.data);

        // Diff against previous to detect new/changed items
        const prev = prevOrdersRef.current;

        incoming.forEach((newOrder) => {
          const oldOrder = prev.find((o) => o.tableNumber === newOrder.tableNumber);

          if (!oldOrder) {
            // Brand new table opened
            toast(`🍽️ ${newOrder.tableNumber} — opened`, {
              icon: '🟢',
              style: { background: '#1a1a1a', color: '#f5f3ee' },
            });
          } else if (newOrder.items.length > oldOrder.items.length) {
            // New dish added
            const addedCount = newOrder.items.length - oldOrder.items.length;
            toast(`${newOrder.tableNumber} — ${addedCount} new dish${addedCount > 1 ? 'es' : ''} added`, {
              icon: '🍽️',
              style: { background: '#1a1a1a', color: '#f5f3ee' },
            });
          } else if (newOrder.status === 'billed' && oldOrder.status === 'open') {
            toast(`${newOrder.tableNumber} — Bill raised`, {
              icon: '🧾',
              style: { background: '#1a1a1a', color: '#f5f3ee' },
            });
          } else if (newOrder.status === 'paid' && oldOrder.status !== 'paid') {
            toast(`${newOrder.tableNumber} — Payment received ✅`, {
              icon: '💳',
              style: { background: '#166534', color: '#fff' },
            });
          }
        });

        // Detect closed tables
        prev.forEach((oldOrder) => {
          if (!incoming.find((o) => o.tableNumber === oldOrder.tableNumber)) {
            toast(`${oldOrder.tableNumber} — Cleared`, {
              icon: '🧹',
              style: { background: '#1a1a1a', color: '#f5f3ee' },
            });
          }
        });

        prevOrdersRef.current = incoming;

        // ── Update Zustand WITHOUT triggering a broadcast back (avoid loops) ──
        setTableOrders(incoming, true /* skipBroadcast */);
      } catch {
        // Ignore parse errors (e.g. heartbeat lines)
      }
    };

    es.onerror = () => {
      setIsLive(false);
      es.close();
      esRef.current = null;

      // Exponential backoff reconnect: 1s, 2s, 4s, 8s … max 30s
      const delay = Math.min(1000 * Math.pow(2, retryCountRef.current), 30_000);
      retryCountRef.current++;
      retryTimeoutRef.current = setTimeout(connect, delay);
    };
  };

  useEffect(() => {
    connect();

    return () => {
      if (esRef.current) {
        esRef.current.close();
      }
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { isLive };
}
