'use client';

import React, { useState, useEffect } from 'react';
import { useRestaurantStore } from '@/store/restaurantStore';
import { Timer, CheckCircle, AlertTriangle, ChefHat } from 'lucide-react';

type KDSOrder = {
  id: string;
  table: string;
  type: 'dine-in' | 'takeaway' | 'delivery';
  items: { name: string; qty: number; notes?: string }[];
  orderedAt: string;
  status: 'new' | 'preparing' | 'ready';
  priority: 'normal' | 'urgent';
};

function getElapsed(orderedAt: string) {
  const diff = Math.floor((Date.now() - new Date(orderedAt).getTime()) / 60000);
  return diff;
}

function getUrgency(min: number): 'normal' | 'almost' | 'urgent' {
  if (min >= 20) return 'urgent';
  if (min >= 12) return 'almost';
  return 'normal';
}

export default function KDSPage() {
  const orders = useRestaurantStore((s) => s.orders);
  const updateOrder = useRestaurantStore((s) => s.updateOrder);
  const [now, setNow] = useState(() => Date.now());
  const [filter, setFilter] = useState<'all' | 'new' | 'preparing' | 'ready'>('all');

  // Tick every 30s
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 30000);
    return () => clearInterval(t);
  }, []);

  const kitchenOrders: KDSOrder[] = orders
    .filter((o) => o.status !== 'delivered' && o.status !== 'cancelled')
    .map((o) => ({
      id:        o.id,
      table:     o.tableNumber || 'Takeaway',
      type:      (o.type as 'dine-in' | 'takeaway' | 'delivery') || 'takeaway',
      items:     o.items
        .filter((i) => i.id !== 'discount' && i.id !== 'tax-cgst' && i.id !== 'tax-sgst')
        .map((i) => ({ name: i.name, qty: i.qty })),
      orderedAt: o.createdAt,
      status:    (o.status === 'confirmed' ? 'new' : o.status === 'preparing' ? 'preparing' : 'ready') as 'new' | 'preparing' | 'ready',
      priority:  'normal' as 'normal' | 'urgent',
    }));

  const displayed = filter === 'all' ? kitchenOrders : kitchenOrders.filter((o) => o.status === filter);

  const bump = (orderId: string, current: 'new' | 'preparing' | 'ready') => {
    const next = current === 'new' ? 'preparing' : 'ready';
    updateOrder(orderId, next === 'preparing' ? 'preparing' : 'out for delivery');
  };

  const statusColor = { new: '#3b82f6', preparing: '#f59e0b', ready: '#10b981' };
  const statusLabel = { new: 'NEW', preparing: 'COOKING', ready: 'READY' };

  return (
    <div>
      {/* Header */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'32px', flexWrap:'wrap', gap:'16px' }}>
        <div>
          <h1 style={{ fontFamily:'var(--font-display)', fontSize:'2rem', color:'var(--cream)', marginBottom:'4px' }}>
            Kitchen Display
          </h1>
          <p style={{ fontFamily:'var(--font-sans)', fontSize:'0.78rem', color:'var(--text-secondary)' }}>
            {new Date(now).toLocaleTimeString('en-IN', { hour:'2-digit', minute:'2-digit' })} — Live queue
          </p>
        </div>

        <div style={{ display:'flex', gap:'8px', flexWrap:'wrap' }}>
          {(['all','new','preparing','ready'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                padding:    '8px 16px',
                background: filter === f ? 'rgba(197,168,92,0.12)' : 'transparent',
                border:     `1px solid ${filter === f ? 'rgba(197,168,92,0.4)' : 'var(--dark-border-2)'}`,
                color:      filter === f ? 'var(--gold)' : 'var(--text-secondary)',
                fontFamily: 'var(--font-sans)',
                fontSize:   '0.65rem',
                fontWeight: 600,
                letterSpacing:'0.15em',
                textTransform:'uppercase',
                cursor:     'pointer',
                transition: 'all 0.2s ease',
              }}
            >
              {f === 'all' ? 'All' : f === 'new' ? 'New' : f === 'preparing' ? 'Cooking' : 'Ready'}
              {' '}({f === 'all' ? kitchenOrders.length : kitchenOrders.filter((o) => o.status === f).length})
            </button>
          ))}
        </div>
      </div>

      {/* KDS Grid */}
      {displayed.length === 0 ? (
        <div style={{
          display:    'flex',
          flexDirection:'column',
          alignItems: 'center',
          justifyContent:'center',
          minHeight:  '320px',
          gap:        '16px',
          border:     '1px dashed var(--dark-border-2)',
          color:      'var(--text-secondary)',
        }}>
          <ChefHat size={40} opacity={0.3} />
          <p style={{ fontFamily:'var(--font-sans)', fontSize:'0.875rem' }}>No active orders in this queue</p>
        </div>
      ) : (
        <div style={{
          display:             'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap:                 '16px',
        }}>
          {displayed.map((order) => {
            const elapsed = getElapsed(order.orderedAt);
            const urgency = getUrgency(elapsed);
            const borderCol = urgency === 'urgent' ? 'rgba(239,68,68,0.5)' : urgency === 'almost' ? 'rgba(245,158,11,0.4)' : 'rgba(197,168,92,0.15)';
            const isReady  = order.status === 'ready';

            return (
              <div
                key={order.id}
                style={{
                  background:   'var(--dark-card-2)',
                  border:       `1px solid ${borderCol}`,
                  display:      'flex',
                  flexDirection:'column',
                  overflow:     'hidden',
                  transition:   'border-color 0.3s ease',
                  opacity:      isReady ? 0.7 : 1,
                }}
              >
                {/* Card Header */}
                <div style={{
                  padding:      '14px 18px',
                  background:   urgency === 'urgent' ? 'rgba(239,68,68,0.08)' : urgency === 'almost' ? 'rgba(245,158,11,0.06)' : 'rgba(197,168,92,0.04)',
                  borderBottom: `1px solid ${borderCol}`,
                  display:      'flex',
                  alignItems:   'center',
                  justifyContent:'space-between',
                }}>
                  <div>
                    <p style={{
                      fontFamily:    'var(--font-display)',
                      fontSize:      '1.25rem',
                      color:         'var(--cream)',
                      lineHeight:    1,
                    }}>
                      {order.table}
                    </p>
                    <p style={{
                      fontFamily:    'var(--font-sans)',
                      fontSize:      '0.6rem',
                      fontWeight:    700,
                      letterSpacing: '0.15em',
                      textTransform: 'uppercase',
                      color:         order.type === 'dine-in' ? '#10b981' : order.type === 'delivery' ? '#3b82f6' : '#f59e0b',
                      marginTop:     '2px',
                    }}>
                      {order.type}
                    </p>
                  </div>

                  <div style={{ textAlign:'right' }}>
                    <div style={{
                      display:    'flex',
                      alignItems: 'center',
                      gap:        '5px',
                      color:      urgency === 'urgent' ? '#ef4444' : urgency === 'almost' ? '#f59e0b' : 'var(--text-secondary)',
                    }}>
                      {urgency !== 'normal' && <AlertTriangle size={12} className={urgency === 'urgent' ? 'animate-kds-pulse' : ''} />}
                      <Timer size={13} />
                      <span style={{ fontFamily:'var(--font-sans)', fontSize:'0.78rem', fontWeight:700 }}>
                        {elapsed}m
                      </span>
                    </div>
                    <span style={{
                      ...{},
                      display:       'inline-block',
                      padding:       '2px 8px',
                      fontSize:      '0.55rem',
                      fontWeight:    700,
                      letterSpacing: '0.12em',
                      color:         statusColor[order.status],
                      background:    `${statusColor[order.status]}18`,
                      border:        `1px solid ${statusColor[order.status]}40`,
                      marginTop:     '4px',
                    }}>
                      {statusLabel[order.status]}
                    </span>
                  </div>
                </div>

                {/* Items */}
                <ul style={{ padding:'14px 18px', flex:1, display:'flex', flexDirection:'column', gap:'8px', listStyle:'none' }}>
                  {order.items.map((item, i) => (
                    <li key={i} style={{ display:'flex', alignItems:'flex-start', gap:'10px' }}>
                      <span style={{
                        width:      '24px',
                        height:     '24px',
                        background: 'rgba(197,168,92,0.1)',
                        border:     '1px solid rgba(197,168,92,0.2)',
                        display:    'flex',
                        alignItems: 'center',
                        justifyContent:'center',
                        fontFamily: 'var(--font-sans)',
                        fontSize:   '0.72rem',
                        fontWeight: 700,
                        color:      'var(--gold)',
                        flexShrink: 0,
                      }}>
                        {item.qty}
                      </span>
                      <div>
                        <p style={{ fontFamily:'var(--font-sans)', fontSize:'0.84rem', fontWeight:500, color:'var(--cream)' }}>
                          {item.name}
                        </p>
                        {item.notes && (
                          <p style={{ fontSize:'0.72rem', color:'#f59e0b', marginTop:'2px', fontStyle:'italic' }}>
                            ⚠ {item.notes}
                          </p>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>

                {/* Actions */}
                <div style={{ padding:'14px 18px', borderTop:'1px solid var(--dark-border)', display:'flex', gap:'8px' }}>
                  {order.status !== 'ready' ? (
                    <button
                      onClick={() => bump(order.id, order.status)}
                      style={{
                        flex:          1,
                        padding:       '10px',
                        background:    order.status === 'new' ? 'rgba(59,130,246,0.12)' : 'rgba(245,158,11,0.12)',
                        border:        `1px solid ${order.status === 'new' ? 'rgba(59,130,246,0.4)' : 'rgba(245,158,11,0.4)'}`,
                        color:         order.status === 'new' ? '#3b82f6' : '#f59e0b',
                        fontFamily:    'var(--font-sans)',
                        fontSize:      '0.65rem',
                        fontWeight:    700,
                        letterSpacing: '0.15em',
                        textTransform: 'uppercase',
                        cursor:        'pointer',
                        transition:    'all 0.2s ease',
                      }}
                    >
                      {order.status === 'new' ? 'Start Cooking' : 'Mark Ready'}
                    </button>
                  ) : (
                    <div style={{ flex:1, display:'flex', alignItems:'center', gap:'8px', color:'#10b981' }}>
                      <CheckCircle size={16} />
                      <span style={{ fontFamily:'var(--font-sans)', fontSize:'0.65rem', fontWeight:700, letterSpacing:'0.12em' }}>
                        READY TO SERVE
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
