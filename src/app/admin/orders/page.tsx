'use client';

import React, { useState } from 'react';
import { useRestaurantStore } from '@/store/restaurantStore';
import { CheckCircle, XCircle, Truck, ShoppingBag, Search, ChevronDown } from 'lucide-react';

const STATUS_COLOR: Record<string, string> = {
  confirmed:          '#3b82f6',
  preparing:          '#f59e0b',
  'out for delivery': '#8b5cf6',
  delivered:          '#10b981',
  cancelled:          '#ef4444',
};

const PAYMENT_COLOR: Record<string, string> = {
  unpaid:               '#ef4444',
  pending_verification: '#f59e0b',
  paid:                 '#10b981',
};

export default function OrdersPage() {
  const orders            = useRestaurantStore((s) => s.orders);
  const updateOrderStatus = useRestaurantStore((s) => s.updateOrderStatus);
  const updateOrderPaymentStatus = useRestaurantStore((s) => s.updateOrderPaymentStatus);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter]     = useState<string>('all');

  let filtered = orders.toSorted((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  if (search.trim()) {
    const q = search.toLowerCase();
    filtered = filtered.filter((o) =>
      o.id.toLowerCase().includes(q) ||
      (o.customerName || '').toLowerCase().includes(q) ||
      o.address.phone.includes(q)
    );
  }
  if (statusFilter !== 'all') filtered = filtered.filter((o) => o.status === statusFilter);
  if (typeFilter   !== 'all') filtered = filtered.filter((o) => o.type   === typeFilter);

  const nextStatus: Record<string, string> = {
    confirmed:          'preparing',
    preparing:          'out for delivery',
    'out for delivery': 'delivered',
  };

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '28px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', color: 'var(--cream)', marginBottom: '4px' }}>Live Orders</h1>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>{orders.length} total orders — {orders.filter((o) => o.status !== 'delivered' && o.status !== 'cancelled').length} active</p>
        </div>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
          <Search size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            style={{
              width: '100%', padding: '10px 14px 10px 36px',
              background: 'var(--dark-surface)', border: '1px solid var(--dark-border)',
              color: 'var(--cream)', fontFamily: 'var(--font-sans)', fontSize: '0.85rem', outline: 'none', boxSizing: 'border-box',
            }}
            placeholder="Search by order ID, name, phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        {[
          { label: 'Status', val: statusFilter, set: setStatusFilter, opts: ['all', 'confirmed', 'preparing', 'out for delivery', 'delivered', 'cancelled'] },
          { label: 'Type',   val: typeFilter,   set: setTypeFilter,   opts: ['all', 'pickup', 'delivery', 'dine-in'] },
        ].map(({ label, val, set, opts }) => (
          <div key={label} style={{ position: 'relative' }}>
            <select
              style={{
                padding: '10px 36px 10px 14px', background: 'var(--dark-surface)',
                border: '1px solid var(--dark-border)', color: 'var(--cream)',
                fontFamily: 'var(--font-sans)', fontSize: '0.82rem', outline: 'none', appearance: 'none', cursor: 'pointer',
              }}
              value={val}
              onChange={(e) => set(e.target.value)}
            >
              {opts.map((o) => <option key={o} value={o}>{o === 'all' ? `All ${label}s` : o.charAt(0).toUpperCase() + o.slice(1)}</option>)}
            </select>
            <ChevronDown size={14} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)', pointerEvents: 'none' }} />
          </div>
        ))}
      </div>

      {/* Orders List */}
      {filtered.length === 0 ? (
        <div style={{ padding: '60px', textAlign: 'center', border: '1px dashed var(--dark-border)', color: 'var(--text-secondary)' }}>
          <ShoppingBag size={36} style={{ opacity: 0.3, marginBottom: '12px' }} />
          <p style={{ fontSize: '0.875rem' }}>No orders match your filters.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {filtered.map((order) => (
            <div
              key={order.id}
              style={{
                background: 'var(--dark-card)', border: `1px solid ${STATUS_COLOR[order.status]}25`,
                padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '14px',
              }}
            >
              {/* Order Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
                  <span style={{ fontFamily: 'var(--font-sans)', fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.1em', color: 'var(--gold)' }}>
                    {order.id}
                  </span>
                  <span style={{
                    padding: '2px 8px', fontSize: '0.55rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase',
                    background: `${STATUS_COLOR[order.status]}15`, color: STATUS_COLOR[order.status], border: `1px solid ${STATUS_COLOR[order.status]}30`,
                  }}>{order.status}</span>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                    {order.type === 'delivery' ? <Truck size={12} style={{ display: 'inline', marginRight: '4px' }} /> : <ShoppingBag size={12} style={{ display: 'inline', marginRight: '4px' }} />}
                    {order.type}
                  </span>
                  {order.tableNumber && (
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>Table: {order.tableNumber}</span>
                  )}
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', color: 'var(--gold)', lineHeight: 1 }}>₹{order.total}</p>
                  <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                    {new Date(order.createdAt).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>

              {/* Customer + Items */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div>
                  <p style={{ fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '6px' }}>Customer</p>
                  <p style={{ fontSize: '0.85rem', color: 'var(--cream)', marginBottom: '2px' }}>{order.customerName || order.address.name || 'Guest'}</p>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{order.address.phone || '—'}</p>
                  {order.type === 'delivery' && order.address.street && (
                    <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                      {order.address.flat} {order.address.street}, {order.address.city}
                    </p>
                  )}
                </div>
                <div>
                  <p style={{ fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '6px' }}>Items ({order.items.length})</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    {order.items.map((item, i) => (
                      <div key={i} style={{ display: 'flex', gap: '8px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                        <span style={{ color: 'var(--gold)', fontWeight: 700, minWidth: '20px' }}>×{item.qty}</span>
                        <span>{item.name}</span>
                        <span style={{ marginLeft: 'auto', color: 'var(--cream)' }}>₹{item.price * item.qty}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', borderTop: '1px solid var(--dark-border)', paddingTop: '14px', alignItems: 'center' }}>
                {/* Payment status */}
                <span style={{
                  padding: '4px 10px', fontSize: '0.58rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase',
                  background: `${PAYMENT_COLOR[order.paymentStatus]}15`, color: PAYMENT_COLOR[order.paymentStatus],
                  border: `1px solid ${PAYMENT_COLOR[order.paymentStatus]}30`,
                }}>
                  {order.paymentMethod.toUpperCase()} — {order.paymentStatus.replace(/_/g, ' ')}
                </span>

                {order.paymentStatus === 'pending_verification' && (
                  <button
                    onClick={() => updateOrderPaymentStatus(order.id, 'paid')}
                    style={{
                      padding: '6px 14px', background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.4)',
                      color: '#10b981', fontFamily: 'var(--font-sans)', fontSize: '0.62rem', fontWeight: 700,
                      letterSpacing: '0.1em', textTransform: 'uppercase', cursor: 'pointer',
                    }}
                  >
                    ✓ Verify Payment
                  </button>
                )}

                {nextStatus[order.status] && (
                  <button
                    onClick={() => updateOrderStatus(order.id, nextStatus[order.status] as Parameters<typeof updateOrderStatus>[1])}
                    style={{
                      padding: '6px 14px', background: `${STATUS_COLOR[nextStatus[order.status]]}15`,
                      border: `1px solid ${STATUS_COLOR[nextStatus[order.status]]}40`,
                      color: STATUS_COLOR[nextStatus[order.status]],
                      fontFamily: 'var(--font-sans)', fontSize: '0.62rem', fontWeight: 700,
                      letterSpacing: '0.1em', textTransform: 'uppercase', cursor: 'pointer',
                    }}
                  >
                    → {nextStatus[order.status].charAt(0).toUpperCase() + nextStatus[order.status].slice(1)}
                  </button>
                )}

                {order.status !== 'cancelled' && order.status !== 'delivered' && (
                  <button
                    onClick={() => updateOrderStatus(order.id, 'cancelled')}
                    style={{
                      padding: '6px 14px', marginLeft: 'auto', background: 'rgba(239,68,68,0.08)',
                      border: '1px solid rgba(239,68,68,0.3)', color: '#ef4444',
                      fontFamily: 'var(--font-sans)', fontSize: '0.62rem', fontWeight: 700,
                      letterSpacing: '0.1em', textTransform: 'uppercase', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px',
                    }}
                  >
                    <XCircle size={12} /> Cancel
                  </button>
                )}

                {order.status === 'delivered' && (
                  <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '6px', color: '#10b981', fontSize: '0.72rem', fontWeight: 700 }}>
                    <CheckCircle size={14} /> Completed
                  </div>
                )}

                {order.status === 'cancelled' && (
                  <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '6px', color: '#ef4444', fontSize: '0.72rem', fontWeight: 700 }}>
                    <XCircle size={14} /> Cancelled
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
