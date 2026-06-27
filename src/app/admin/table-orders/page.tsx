'use client';

import React, { useState } from 'react';
import { useRestaurantStore, useCMSStore } from '@/store/restaurantStore';
import { Plus, Trash2, ShoppingBag, Check, X, ChefHat, Users } from 'lucide-react';
import type { CartItem } from '@/store/restaurantStore';

const TABLES = [
  'Table 1','Table 2','Table 3','Table 4','Table 5',
  'Table 6','Table 7','Table 8','Table 9','Table 10',
];

type TableOrder = {
  tableNumber: string;
  items: (CartItem & { notes?: string })[];
  customerName: string;
  covers: number;
  status: 'open' | 'billed' | 'paid';
  openedAt: string;
};

export default function TableOrdersPage() {
  const menuItems    = useCMSStore((s) => s.menuItems);
  const menuCategories = useCMSStore((s) => s.menuCategories);
  const placeOrder   = useRestaurantStore((s) => s.placeOrder);
  const addToCart    = useRestaurantStore((s) => s.addToCart);
  const clearCart    = useRestaurantStore((s) => s.clearCart);

  const [tableOrders, setTableOrders] = useState<TableOrder[]>([]);
  const [activeTable, setActiveTable] = useState<string | null>(null);
  const [menuCat, setMenuCat]         = useState<string>('shakes');
  const [showBillModal, setShowBillModal] = useState<string | null>(null);

  const openTable = (tableNumber: string) => {
    if (!tableOrders.find((t) => t.tableNumber === tableNumber)) {
      setTableOrders((prev) => [
        ...prev,
        { tableNumber, items: [], customerName: '', covers: 2, status: 'open', openedAt: new Date().toISOString() },
      ]);
    }
    setActiveTable(tableNumber);
  };

  const activeOrder = tableOrders.find((t) => t.tableNumber === activeTable);

  const addItemToTable = (item: typeof menuItems[0]) => {
    if (!activeTable) return;
    setTableOrders((prev) => prev.map((t) => {
      if (t.tableNumber !== activeTable) return t;
      const existing = t.items.find((i) => i.id === item.id);
      if (existing) {
        return { ...t, items: t.items.map((i) => i.id === item.id ? { ...i, qty: i.qty + 1 } : i) };
      }
      return { ...t, items: [...t.items, { id: item.id, name: item.name, price: item.price, qty: 1, gradient: item.gradient }] };
    }));
  };

  const removeItem = (tableNumber: string, itemId: string) => {
    setTableOrders((prev) => prev.map((t) => {
      if (t.tableNumber !== tableNumber) return t;
      const updated = t.items.map((i) => i.id === itemId ? { ...i, qty: i.qty - 1 } : i).filter((i) => i.qty > 0);
      return { ...t, items: updated };
    }));
  };

  const addItem = (tableNumber: string, itemId: string) => {
    setTableOrders((prev) => prev.map((t) => {
      if (t.tableNumber !== tableNumber) return t;
      return { ...t, items: t.items.map((i) => i.id === itemId ? { ...i, qty: i.qty + 1 } : i) };
    }));
  };

  const closeTable = (tableNumber: string) => {
    setTableOrders((prev) => prev.filter((t) => t.tableNumber !== tableNumber));
    if (activeTable === tableNumber) setActiveTable(null);
  };

  const billTable = (tableNumber: string) => {
    setTableOrders((prev) => prev.map((t) => t.tableNumber === tableNumber ? { ...t, status: 'billed' } : t));
    setShowBillModal(tableNumber);
  };

  const markPaid = (tableNumber: string) => {
    // Place the order in the global store so KDS picks it up
    const order = tableOrders.find((t) => t.tableNumber === tableNumber);
    if (order && order.items.length > 0) {
      clearCart();
      order.items.forEach((item) => {
        for (let i = 0; i < item.qty; i++) {
          addToCart({ id: item.id, name: item.name, price: item.price, gradient: item.gradient });
        }
      });
      placeOrder('cod', '', {
        type: 'dine-in',
        tableNumber,
        customerName: order.customerName || `Table ${tableNumber.replace('Table ', '')}`,
      });
    }
    closeTable(tableNumber);
    setShowBillModal(null);
  };

  const openTables  = tableOrders.filter((t) => t.status === 'open');
  const billedTables = tableOrders.filter((t) => t.status === 'billed');

  const categoryItems = menuItems.filter((i) => i.category === menuCat);

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr 320px', gap: '0', height: 'calc(100vh - 124px)', overflow: 'hidden' }}>

      {/* ── LEFT: Table Grid ─────────────────────────────────────────── */}
      <div style={{ borderRight: '1px solid var(--dark-border)', overflowY: 'auto', padding: '20px 16px' }}>
        <p style={{ fontFamily: 'var(--font-sans)', fontSize: '0.58rem', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '12px' }}>Tables</p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
          {TABLES.map((table) => {
            const order   = tableOrders.find((t) => t.tableNumber === table);
            const isOpen  = !!order;
            const isActive = activeTable === table;
            const statusColor = order?.status === 'billed' ? '#f59e0b' : isOpen ? '#10b981' : 'var(--dark-border)';
            return (
              <button
                key={table}
                onClick={() => isOpen ? setActiveTable(table) : openTable(table)}
                style={{
                  padding: '14px 8px', background: isActive ? 'rgba(197,168,92,0.1)' : isOpen ? 'rgba(16,185,129,0.05)' : 'var(--dark-surface)',
                  border: `1px solid ${isActive ? 'var(--gold)' : statusColor}`,
                  color: isActive ? 'var(--gold)' : isOpen ? 'var(--cream)' : 'var(--text-secondary)',
                  fontFamily: 'var(--font-sans)', fontSize: '0.7rem', fontWeight: 600,
                  cursor: 'pointer', transition: 'all 0.2s ease', textAlign: 'center',
                }}
              >
                <Users size={12} style={{ display: 'block', margin: '0 auto 4px' }} />
                {table.replace('Table ', 'T')}
                {order && <div style={{ fontSize: '0.55rem', marginTop: '4px', color: statusColor }}>
                  {order.status === 'billed' ? 'BILLED' : `${order.items.reduce((s,i)=>s+i.qty,0)} items`}
                </div>}
              </button>
            );
          })}
        </div>

        {/* Summary */}
        <div style={{ marginTop: '20px', padding: '14px', background: 'var(--dark-surface)', border: '1px solid var(--dark-border)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
            <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)' }}>Open</span>
            <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#10b981' }}>{openTables.length}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)' }}>Billed</span>
            <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#f59e0b' }}>{billedTables.length}</span>
          </div>
        </div>
      </div>

      {/* ── MIDDLE: Menu Items ───────────────────────────────────────── */}
      <div style={{ display: 'flex', flexDirection: 'column', overflowY: 'auto', borderRight: '1px solid var(--dark-border)' }}>
        {/* Header */}
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--dark-border)', flexShrink: 0 }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem', color: 'var(--cream)', marginBottom: '12px' }}>
            {activeTable ? `Order — ${activeTable}` : 'Select a Table to Begin'}
          </h2>
          {/* Category Pills */}
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {menuCategories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setMenuCat(cat.id)}
                style={{
                  padding: '5px 12px', background: menuCat === cat.id ? 'rgba(197,168,92,0.12)' : 'transparent',
                  border: `1px solid ${menuCat === cat.id ? 'rgba(197,168,92,0.4)' : 'var(--dark-border)'}`,
                  color: menuCat === cat.id ? 'var(--gold)' : 'var(--text-secondary)',
                  fontFamily: 'var(--font-sans)', fontSize: '0.62rem', fontWeight: 600,
                  letterSpacing: '0.1em', textTransform: 'uppercase', cursor: 'pointer',
                }}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Menu Items Grid */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px' }}>
          {!activeTable ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-secondary)', gap: '12px' }}>
              <ChefHat size={36} style={{ opacity: 0.3 }} />
              <p style={{ fontSize: '0.875rem' }}>Select or open a table to start taking orders</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '10px' }}>
              {categoryItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => addItemToTable(item)}
                  style={{
                    padding: '14px', background: 'var(--dark-card)', border: '1px solid var(--dark-border)',
                    textAlign: 'left', cursor: 'pointer', transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(197,168,92,0.4)'; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--dark-border)'; }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                    <Plus size={12} color="var(--gold)" />
                    {item.badge && (
                      <span style={{ fontSize: '0.5rem', background: 'rgba(197,168,92,0.1)', color: 'var(--gold)', padding: '1px 5px', fontWeight: 700, letterSpacing: '0.1em' }}>
                        {item.badge}
                      </span>
                    )}
                  </div>
                  <p style={{ fontFamily: 'var(--font-sans)', fontSize: '0.82rem', fontWeight: 600, color: 'var(--cream)', marginBottom: '4px', lineHeight: 1.3 }}>{item.name}</p>
                  <p style={{ fontFamily: 'var(--font-display)', fontSize: '0.9rem', color: 'var(--gold)' }}>₹{item.price}</p>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── RIGHT: Current Order ─────────────────────────────────────── */}
      <div style={{ display: 'flex', flexDirection: 'column', overflowY: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--dark-border)', flexShrink: 0 }}>
          <p style={{ fontFamily: 'var(--font-sans)', fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
            Current Order
          </p>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px' }}>
          {!activeOrder || activeOrder.items.length === 0 ? (
            <div style={{ textAlign: 'center', color: 'var(--text-secondary)', marginTop: '40px' }}>
              <ShoppingBag size={28} style={{ opacity: 0.3, marginBottom: '8px' }} />
              <p style={{ fontSize: '0.8rem' }}>No items added yet</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {activeOrder.items.map((item) => (
                <div key={item.id} style={{
                  display: 'flex', alignItems: 'center', gap: '10px',
                  padding: '10px 12px', background: 'var(--dark-surface)', border: '1px solid var(--dark-border)',
                }}>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--cream)', marginBottom: '2px' }}>{item.name}</p>
                    <p style={{ fontSize: '0.72rem', color: 'var(--gold)' }}>₹{item.price * item.qty}</p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <button onClick={() => removeItem(activeTable!, item.id)} style={{ width: '22px', height: '22px', background: 'var(--dark-card)', border: '1px solid var(--dark-border)', color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px' }}>−</button>
                    <span style={{ fontFamily: 'var(--font-sans)', fontSize: '0.82rem', fontWeight: 700, color: 'var(--cream)', minWidth: '20px', textAlign: 'center' }}>{item.qty}</span>
                    <button onClick={() => addItem(activeTable!, item.id)} style={{ width: '22px', height: '22px', background: 'var(--dark-card)', border: '1px solid var(--dark-border)', color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px' }}>+</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Order Footer */}
        {activeOrder && (
          <div style={{ padding: '16px 20px', borderTop: '1px solid var(--dark-border)', flexShrink: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '14px' }}>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>Subtotal</span>
              <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', color: 'var(--cream)' }}>
                ₹{activeOrder.items.reduce((s, i) => s + i.price * i.qty, 0).toLocaleString('en-IN')}
              </span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {activeOrder.status === 'open' && (
                <button
                  onClick={() => billTable(activeTable!)}
                  disabled={activeOrder.items.length === 0}
                  style={{
                    padding: '12px', background: activeOrder.items.length > 0 ? 'var(--gold)' : 'var(--dark-surface)',
                    border: 'none', color: activeOrder.items.length > 0 ? 'var(--black)' : 'var(--text-muted)',
                    fontFamily: 'var(--font-sans)', fontSize: '0.72rem', fontWeight: 700,
                    letterSpacing: '0.12em', textTransform: 'uppercase', cursor: activeOrder.items.length > 0 ? 'pointer' : 'not-allowed',
                  }}
                >
                  Generate Bill
                </button>
              )}
              <button
                onClick={() => closeTable(activeTable!)}
                style={{
                  padding: '10px', background: 'transparent', border: '1px solid rgba(239,68,68,0.3)',
                  color: '#ef4444', fontFamily: 'var(--font-sans)', fontSize: '0.65rem',
                  fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                }}
              >
                <Trash2 size={12} /> Clear Table
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Bill Modal */}
      {showBillModal && (() => {
        const order = tableOrders.find((t) => t.tableNumber === showBillModal);
        if (!order) return null;
        const total = order.items.reduce((s, i) => s + i.price * i.qty, 0);
        const gst   = Math.round(total * 0.05);
        return (
          <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
            <div style={{ background: 'var(--dark-card)', border: '1px solid var(--dark-border)', width: '100%', maxWidth: '400px' }}>
              <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--dark-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', color: 'var(--cream)' }}>Bill — {order.tableNumber}</h2>
                <button onClick={() => setShowBillModal(null)} style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}><X size={18} /></button>
              </div>
              <div style={{ padding: '20px 24px' }}>
                {order.items.map((item, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.85rem' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>{item.name} ×{item.qty}</span>
                    <span style={{ color: 'var(--cream)' }}>₹{item.price * item.qty}</span>
                  </div>
                ))}
                <div style={{ borderTop: '1px solid var(--dark-border)', marginTop: '12px', paddingTop: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '6px' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Subtotal</span>
                    <span style={{ color: 'var(--cream)' }}>₹{total}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '6px' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>GST (5%)</span>
                    <span style={{ color: 'var(--cream)' }}>₹{gst}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px' }}>
                    <span style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', color: 'var(--cream)' }}>Total</span>
                    <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', color: 'var(--gold)' }}>₹{total + gst}</span>
                  </div>
                </div>
              </div>
              <div style={{ padding: '16px 24px', borderTop: '1px solid var(--dark-border)', display: 'flex', gap: '10px' }}>
                <button
                  onClick={() => setShowBillModal(null)}
                  style={{ flex: 1, padding: '10px', background: 'transparent', border: '1px solid var(--dark-border)', color: 'var(--text-secondary)', fontFamily: 'var(--font-sans)', fontSize: '0.72rem', fontWeight: 600, cursor: 'pointer' }}
                >
                  Back
                </button>
                <button
                  onClick={() => markPaid(showBillModal!)}
                  style={{ flex: 1, padding: '10px', background: 'var(--gold)', border: 'none', color: 'var(--black)', fontFamily: 'var(--font-sans)', fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                >
                  <Check size={14} /> Mark Paid & Close
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
