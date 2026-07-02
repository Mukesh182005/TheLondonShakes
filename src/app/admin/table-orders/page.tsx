'use client';

import React, { useState } from 'react';
import { useRestaurantStore, useCMSStore } from '@/store/restaurantStore';
import { Plus, Trash2, ShoppingBag, Check, X, ChefHat, Users } from 'lucide-react';
import { type CartItem, type TableOrder } from '@/store/restaurantStore';
import toast from 'react-hot-toast';

const generateAdditiveId = () => 'add-' + Math.random().toString(36).substring(2, 8);

const printThermalReceipt = (order: TableOrder) => {
  const subtotal = order.items.reduce((s: number, i: CartItem) => s + i.price * i.qty, 0);
  const additivesList = order.additives || [];
  
  const calculatedAdditives = additivesList.map((add) => {
    let val = 0;
    if (add.type === 'percentage') {
      val = Math.round(subtotal * (add.value / 100));
    } else {
      val = add.value;
    }
    return { ...add, calculatedValue: val };
  });

  const additivesSum = calculatedAdditives.reduce((sum, add) => sum + add.calculatedValue, 0);
  const grandTotal = subtotal + additivesSum;

  const dateFormatted = new Date(order.openedAt).toLocaleString('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });

  const tableNumRow = order.tableNumber 
    ? `<tr><td class="bold">Table No:</td><td>${order.tableNumber}</td></tr>` 
    : '';
  const customerNameRow = order.customerName 
    ? `<tr><td class="bold">Customer:</td><td>${order.customerName}</td></tr>` 
    : '';
  const customerPhoneRow = order.customerPhone 
    ? `<tr><td class="bold">Phone:</td><td>${order.customerPhone}</td></tr>` 
    : '';
  const customerEmailRow = order.customerEmail 
    ? `<tr><td class="bold">Email:</td><td>${order.customerEmail}</td></tr>` 
    : '';

  const itemsRows = order.items.map(item => `
    <tr>
      <td>${item.name}</td>
      <td class="text-center">${item.qty}</td>
      <td class="text-right">₹${item.price}</td>
      <td class="text-right">₹${item.price * item.qty}</td>
    </tr>
  `).join('');

  const additivesRows = calculatedAdditives.map(add => `
    <tr>
      <td colspan="3">${add.name}:</td>
      <td class="text-right">${add.calculatedValue < 0 ? '-' : ''}₹${Math.abs(add.calculatedValue)}</td>
    </tr>
  `).join('');

  const iframeHtml = `
    <html>
    <head>
      <title>Receipt - ${order.orderId || 'ORD-0000'}</title>
      <style>
        @page {
          size: 80mm auto;
          margin: 0;
        }
        body {
          font-family: 'Courier New', Courier, monospace;
          width: 74mm;
          margin: 0 auto;
          padding: 5mm 0;
          color: #000;
          background: #fff;
          font-size: 11px;
          line-height: 1.4;
        }
        .text-center { text-align: center; }
        .text-right { text-align: right; }
        .bold { font-weight: bold; }
        .logo {
          font-size: 16px;
          font-weight: bold;
          margin-bottom: 2px;
          letter-spacing: 1px;
        }
        .separator {
          border-top: 1px dashed #000;
          margin: 8px 0;
        }
        .double-separator {
          border-top: 1px double #000;
          margin: 8px 0;
        }
        .info-table, .items-table {
          width: 100%;
          border-collapse: collapse;
        }
        .info-table td {
          padding: 2px 0;
          vertical-align: top;
        }
        .items-table th, .items-table td {
          padding: 4px 0;
          text-align: left;
        }
        .items-table th {
          border-bottom: 1px solid #000;
          font-size: 10px;
        }
        .items-table td {
          font-size: 11px;
        }
        .total-row {
          font-weight: bold;
          font-size: 12px;
        }
        .footer {
          margin-top: 15px;
          font-size: 10px;
        }
      </style>
    </head>
    <body>
      <div class="text-center">
        <div class="logo">THE LONDON SHAKES</div>
        <div>& CAFÉ</div>
        <div style="font-size: 9px;">Silchar, Assam, India</div>
        <div style="font-size: 9px;">Phone: +91 98765 43210</div>
      </div>
      
      <div class="separator"></div>
      
      <table class="info-table">
        <tr>
          <td class="bold" style="width: 30%;">Bill No:</td>
          <td>${order.orderId || 'ORD-0000'}</td>
        </tr>
        <tr>
          <td class="bold">Date/Time:</td>
          <td>${dateFormatted}</td>
        </tr>
        <tr>
          <td class="bold">Service:</td>
          <td>Dine-In (In-Café)</td>
        </tr>
        ${tableNumRow}
        ${customerNameRow}
        ${customerPhoneRow}
        ${customerEmailRow}
      </table>
      
      <div class="separator"></div>
      
      <table class="items-table">
        <thead>
          <tr>
            <th>Item</th>
            <th class="text-center" style="width: 15%;">Qty</th>
            <th class="text-right" style="width: 25%;">Price</th>
            <th class="text-right" style="width: 25%;">Total</th>
          </tr>
        </thead>
        <tbody>
          ${itemsRows}
        </tbody>
      </table>
      
      <div class="separator"></div>
      
      <table class="info-table">
        <tr>
          <td colspan="3">Subtotal:</td>
          <td class="text-right">₹${subtotal.toLocaleString('en-IN')}</td>
        </tr>
        ${additivesRows}
        <tr class="total-row">
          <td colspan="3" style="font-size: 13px;">GRAND TOTAL:</td>
          <td class="text-right" style="font-size: 13px;">₹${grandTotal.toLocaleString('en-IN')}</td>
        </tr>
      </table>
      
      <div class="double-separator"></div>
      
      <div class="text-center footer">
        <div class="bold">Thank you for dining with us!</div>
        <div>Please visit again.</div>
        <div style="margin-top: 5px; font-size: 8px;">Software Powered by Antigravity</div>
      </div>
    </body>
    </html>
  `;

  const iframe = document.createElement('iframe');
  iframe.style.position = 'fixed';
  iframe.style.right = '0';
  iframe.style.bottom = '0';
  iframe.style.width = '0';
  iframe.style.height = '0';
  iframe.style.border = '0';
  document.body.appendChild(iframe);
  
  const doc = iframe.contentWindow?.document || iframe.contentDocument;
  if (doc) {
    doc.write(iframeHtml);
    doc.close();
    setTimeout(() => {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
      setTimeout(() => {
        document.body.removeChild(iframe);
      }, 1000);
    }, 500);
  }
};

export default function TableOrdersPage() {
  const menuItems    = useCMSStore((s) => s.menuItems);
  const menuCategories = useCMSStore((s) => s.menuCategories);
  const storeTables  = useCMSStore((s) => s.tables);
  const placeOrder   = useRestaurantStore((s) => s.placeOrder);
  const addToCart    = useRestaurantStore((s) => s.addToCart);
  const clearCart    = useRestaurantStore((s) => s.clearCart);

  const tableOrders = useRestaurantStore((s) => s.tableOrders);
  const setTableOrders = useRestaurantStore((s) => s.setTableOrders);

  const TABLES = storeTables.map((t) => `Table ${t.number}`);
  const [activeTable, setActiveTable] = useState<string | null>(null);
  const [menuCat, setMenuCat]         = useState<string>('shakes');
  const [showBillModal, setShowBillModal] = useState<string | null>(null);
  const [showGuestDetails, setShowGuestDetails] = useState(false);

  const openTable = (tableNumber: string) => {
    if (!tableOrders.find((t) => t.tableNumber === tableNumber)) {
      setTableOrders((prev: TableOrder[]) => [
        ...prev,
        { 
          tableNumber, 
          items: [], 
          customerName: '', 
          covers: 2, 
          status: 'open', 
          openedAt: new Date().toISOString(),
          orderId: 'ORD-' + Math.random().toString(36).substring(2, 8).toUpperCase(),
          customerPhone: '',
          customerEmail: '',
          paymentMethod: 'pay_later',
          additives: [
            { id: 'default-gst', name: 'GST (5%)', type: 'percentage', value: 5 }
          ]
        },
      ]);
    }
    setActiveTable(tableNumber);
  };

  const activeOrder = tableOrders.find((t) => t.tableNumber === activeTable);

  const addItemToTable = (item: typeof menuItems[0]) => {
    if (!activeTable) return;
    setTableOrders((prev: TableOrder[]) => prev.map((t) => {
      if (t.tableNumber !== activeTable) return t;
      const existing = t.items.find((i) => i.id === item.id);
      if (existing) {
        return { ...t, items: t.items.map((i) => i.id === item.id ? { ...i, qty: i.qty + 1 } : i) };
      }
      return { ...t, items: [...t.items, { id: item.id, name: item.name, price: item.price, qty: 1, gradient: item.gradient, image: item.image }] };
    }));
  };

  const removeItem = (tableNumber: string, itemId: string) => {
    setTableOrders((prev: TableOrder[]) => prev.map((t) => {
      if (t.tableNumber !== tableNumber) return t;
      const updated = t.items.map((i) => i.id === itemId ? { ...i, qty: i.qty - 1 } : i).filter((i) => i.qty > 0);
      return { ...t, items: updated };
    }));
  };

  const addItem = (tableNumber: string, itemId: string) => {
    setTableOrders((prev: TableOrder[]) => prev.map((t) => {
      if (t.tableNumber !== tableNumber) return t;
      return { ...t, items: t.items.map((i) => i.id === itemId ? { ...i, qty: i.qty + 1 } : i) };
    }));
  };

  const [showAddAdditive, setShowAddAdditive] = useState(false);
  const [customAddName, setCustomAddName] = useState('');
  const [customAddType, setCustomAddType] = useState<'percentage' | 'flat'>('percentage');
  const [customAddValue, setCustomAddValue] = useState('');

  const addTableAdditive = (tableNumber: string, name: string, type: 'percentage' | 'flat', value: number) => {
    const id = generateAdditiveId();
    setTableOrders((prev: TableOrder[]) => prev.map((to) => {
      if (to.tableNumber === tableNumber) {
        const current = to.additives || [];
        if (current.some(c => c.name.toLowerCase() === name.toLowerCase())) {
          toast.error(`${name} is already added to this bill.`);
          return to;
        }
        return {
          ...to,
          additives: [...current, { id, name, type, value }]
        };
      }
      return to;
    }));
  };

  const removeTableAdditive = (tableNumber: string, id: string) => {
    setTableOrders((prev: TableOrder[]) => prev.map((to) => {
      if (to.tableNumber === tableNumber) {
        const current = to.additives || [];
        const found = current.find(c => c.id === id);
        if (found) {
          toast.success(`${found.name} removed.`);
        }
        return {
          ...to,
          additives: current.filter((add) => add.id !== id)
        };
      }
      return to;
    }));
  };

  const closeTable = (tableNumber: string) => {
    setTableOrders((prev: TableOrder[]) => prev.filter((t) => t.tableNumber !== tableNumber));
    if (activeTable === tableNumber) setActiveTable(null);
  };

  const billTable = (tableNumber: string) => {
    setTableOrders((prev: TableOrder[]) => prev.map((t) => t.tableNumber === tableNumber ? { ...t, status: 'billed' as const } : t));
    setShowBillModal(tableNumber);
  };

  const markPaid = (tableNumber: string) => {
    // Place the order in the global store so KDS picks it up
    const order = tableOrders.find((t) => t.tableNumber === tableNumber);
    if (order && order.items.length > 0) {
      clearCart();
      order.items.forEach((item) => {
        for (let i = 0; i < item.qty; i++) {
          addToCart({ id: item.id, name: item.name, price: item.price, gradient: item.gradient, image: item.image });
        }
      });
      placeOrder('cod', '', {
        type: 'dine-in',
        tableNumber,
        customerName: order.customerName || `Table ${tableNumber.replace('Table ', '')}`,
        adminPlaced: true,
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
                  {order.status === 'billed' ? 'BILLED' : `${order.items.reduce((s: number, i: CartItem) => s + i.qty, 0)} items`}
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
          {!activeOrder ? (
            <div style={{ textAlign: 'center', color: 'var(--text-secondary)', marginTop: '40px' }}>
              <ShoppingBag size={28} style={{ opacity: 0.3, marginBottom: '8px' }} />
              <p style={{ fontSize: '0.8rem' }}>No table selected</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Guest Details Section */}
              <div style={{ borderBottom: '1px solid var(--dark-border)', paddingBottom: '16px' }}>
                <div 
                  style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', cursor: 'pointer' }} 
                  onClick={() => setShowGuestDetails(!showGuestDetails)}
                >
                  <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--gold)', letterSpacing: '0.15em', textTransform: 'uppercase' }}>Guest Details</span>
                  <span style={{ fontSize: '0.62rem', color: 'var(--text-secondary)' }}>{showGuestDetails ? 'Collapse ▲' : 'Edit ▼'}</span>
                </div>
                
                {!showGuestDetails && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <p style={{ fontSize: '0.78rem', color: 'var(--cream)', margin: 0 }}>
                      {activeOrder.customerName || 'Walk-in Guest'} {activeOrder.customerPhone ? `· ${activeOrder.customerPhone}` : ''}
                    </p>
                    {activeOrder.paymentMethod && (
                      <p style={{ fontSize: '0.65rem', color: 'var(--gold)', margin: 0, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                        💳 Payment: {activeOrder.paymentMethod === 'pay_later' ? 'Pay After Food' : activeOrder.paymentMethod === 'upi' ? 'UPI Scan' : activeOrder.paymentMethod === 'cod' ? 'Cash at Counter' : 'Card at Counter'}
                      </p>
                    )}
                  </div>
                )}

                {showGuestDetails && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '10px' }}>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <div style={{ flex: 1 }}>
                        <label style={{ display: 'block', fontSize: '0.55rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '4px' }}>Guest Name</label>
                        <input 
                          type="text" 
                          placeholder="e.g. Jane Doe"
                          value={activeOrder.customerName || ''}
                          onChange={(e) => {
                            setTableOrders((prev: TableOrder[]) => prev.map(to => to.tableNumber === activeTable ? { ...to, customerName: e.target.value } : to));
                          }}
                          style={{ width: '100%', padding: '6px 8px', background: 'var(--black)', border: '1px solid var(--dark-border-2)', color: 'var(--cream)', fontSize: '0.72rem', borderRadius: 0, outline: 'none' }}
                        />
                      </div>
                      <div style={{ width: '60px' }}>
                        <label style={{ display: 'block', fontSize: '0.55rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '4px' }}>Covers</label>
                        <input 
                          type="number" 
                          min="1"
                          value={activeOrder.covers || 2}
                          onChange={(e) => {
                            const val = parseInt(e.target.value) || 1;
                            setTableOrders((prev: TableOrder[]) => prev.map(to => to.tableNumber === activeTable ? { ...to, covers: val } : to));
                          }}
                          style={{ width: '100%', padding: '6px 8px', background: 'var(--black)', border: '1px solid var(--dark-border-2)', color: 'var(--cream)', fontSize: '0.72rem', borderRadius: 0, outline: 'none', textAlign: 'center' }}
                        />
                      </div>
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.55rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '4px' }}>Mobile Number</label>
                      <input 
                        type="text" 
                        placeholder="e.g. +91 98765 43210"
                        value={activeOrder.customerPhone || ''}
                        onChange={(e) => {
                          setTableOrders((prev: TableOrder[]) => prev.map(to => to.tableNumber === activeTable ? { ...to, customerPhone: e.target.value } : to));
                        }}
                        style={{ width: '100%', padding: '6px 8px', background: 'var(--black)', border: '1px solid var(--dark-border-2)', color: 'var(--cream)', fontSize: '0.72rem', borderRadius: 0, outline: 'none' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.55rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '4px' }}>Email Address</label>
                      <input 
                        type="email" 
                        placeholder="e.g. jane@example.com"
                        value={activeOrder.customerEmail || ''}
                        onChange={(e) => {
                          setTableOrders((prev: TableOrder[]) => prev.map(to => to.tableNumber === activeTable ? { ...to, customerEmail: e.target.value } : to));
                        }}
                        style={{ width: '100%', padding: '6px 8px', background: 'var(--black)', border: '1px solid var(--dark-border-2)', color: 'var(--cream)', fontSize: '0.72rem', borderRadius: 0, outline: 'none' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.55rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '4px' }}>Payment Preference</label>
                      <select 
                        value={activeOrder.paymentMethod || 'pay_later'}
                        onChange={(e) => {
                          setTableOrders((prev: TableOrder[]) => prev.map(to => to.tableNumber === activeTable ? { ...to, paymentMethod: e.target.value as TableOrder['paymentMethod'] } : to));
                        }}
                        style={{ width: '100%', padding: '6px 8px', background: 'var(--black)', border: '1px solid var(--dark-border-2)', color: 'var(--cream)', fontSize: '0.72rem', borderRadius: 0, outline: 'none' }}
                      >
                        <option value="pay_later">Pay After Food (Dine & Pay)</option>
                        <option value="upi">Scan & Pay (UPI)</option>
                        <option value="cod">Cash at Counter</option>
                        <option value="card_on_delivery">Card at Counter</option>
                      </select>
                    </div>
                  </div>
                )}
              </div>

              {/* Customer Modification Alert Banner */}
              {activeOrder.customerAlert && (
                <div style={{
                  background: 'rgba(217,119,6,0.1)',
                  border: '1px solid rgba(217,119,6,0.3)',
                  padding: '12px 14px',
                  borderRadius: 0,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.62rem', fontWeight: 800, color: '#f59e0b', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                      ⚠️ Customer Update
                    </span>
                    <button
                      onClick={() => {
                        setTableOrders((prev: TableOrder[]) => prev.map(to => to.tableNumber === activeTable ? { ...to, customerAlert: undefined } : to));
                      }}
                      style={{ background: 'none', border: 'none', color: '#f59e0b', fontSize: '0.65rem', cursor: 'pointer', fontWeight: 'bold', padding: '0 4px' }}
                    >
                      Dismiss
                    </button>
                  </div>
                  <p style={{ fontSize: '0.78rem', color: 'var(--cream)', margin: 0, fontWeight: 500 }}>
                    {activeOrder.customerAlert}
                  </p>
                </div>
              )}

              {/* Items List */}
              {activeOrder.items.length === 0 ? (
                <div style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '20px 0' }}>
                  <ShoppingBag size={24} style={{ opacity: 0.3, marginBottom: '6px' }} />
                  <p style={{ fontSize: '0.78rem' }}>No dishes added to order</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {activeOrder.items.map((item) => (
                    <div key={item.id} style={{
                      display: 'flex', alignItems: 'center', gap: '10px',
                      padding: '10px 12px', background: 'var(--dark-surface)', border: '1px solid var(--dark-border)',
                    }}>
                      <div style={{ flex: 1 }}>
                        <p style={{ fontSize: '0.92rem', fontWeight: 600, color: 'var(--cream)', marginBottom: '2px' }}>{item.name}</p>
                        <p style={{ fontSize: '0.8rem', color: 'var(--gold)' }}>₹{item.price * item.qty}</p>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <button onClick={() => removeItem(activeTable!, item.id)} style={{ width: '24px', height: '24px', background: 'var(--dark-card)', border: '1px solid var(--dark-border)', color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px' }}>−</button>
                        <span style={{ fontFamily: 'var(--font-sans)', fontSize: '0.9rem', fontWeight: 700, color: 'var(--cream)', minWidth: '22px', textAlign: 'center' }}>{item.qty}</span>
                        <button onClick={() => addItem(activeTable!, item.id)} style={{ width: '24px', height: '24px', background: 'var(--dark-card)', border: '1px solid var(--dark-border)', color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px' }}>+</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Order Footer */}
        {activeOrder && (() => {
          const subtotal = activeOrder.items.reduce((s: number, i: CartItem) => s + i.price * i.qty, 0);
          const additivesList = activeOrder.additives || [];
          
          const calculatedAdditives = additivesList.map((add) => {
            let val = 0;
            if (add.type === 'percentage') {
              val = Math.round(subtotal * (add.value / 100));
            } else {
              val = add.value;
            }
            return { ...add, calculatedValue: val };
          });

          const additivesSum = calculatedAdditives.reduce((sum, add) => sum + add.calculatedValue, 0);
          const grandTotal = subtotal + additivesSum;

          return (
            <div style={{ padding: '16px 20px', borderTop: '1px solid var(--dark-border)', flexShrink: 0, background: 'var(--dark-card-2)' }}>
              {/* Additives Section */}
              <div style={{ marginBottom: '14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--gold)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Taxes & Additives</span>
                  <button 
                    onClick={() => setShowAddAdditive(!showAddAdditive)}
                    style={{ background: 'transparent', border: 'none', color: 'var(--gold)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.65rem', fontWeight: 600 }}
                  >
                    <Plus size={11} /> {showAddAdditive ? 'Close' : 'Add Custom'}
                  </button>
                </div>

                {/* Quick Add presets */}
                <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginBottom: '10px' }}>
                  <button 
                    onClick={() => addTableAdditive(activeTable!, 'GST (5%)', 'percentage', 5)}
                    style={{ padding: '3px 6px', background: 'var(--dark-card)', border: '1px solid var(--dark-border-2)', color: 'var(--cream)', fontSize: '0.58rem', fontFamily: 'var(--font-sans)', fontWeight: 600, cursor: 'pointer' }}
                  >
                    + GST 5%
                  </button>
                  <button 
                    onClick={() => addTableAdditive(activeTable!, 'CGST (9%)', 'percentage', 9)}
                    style={{ padding: '3px 6px', background: 'var(--dark-card)', border: '1px solid var(--dark-border-2)', color: 'var(--cream)', fontSize: '0.58rem', fontFamily: 'var(--font-sans)', fontWeight: 600, cursor: 'pointer' }}
                  >
                    + CGST 9%
                  </button>
                  <button 
                    onClick={() => addTableAdditive(activeTable!, 'SGST (9%)', 'percentage', 9)}
                    style={{ padding: '3px 6px', background: 'var(--dark-card)', border: '1px solid var(--dark-border-2)', color: 'var(--cream)', fontSize: '0.58rem', fontFamily: 'var(--font-sans)', fontWeight: 600, cursor: 'pointer' }}
                  >
                    + SGST 9%
                  </button>
                  <button 
                    onClick={() => addTableAdditive(activeTable!, 'Service Tax (10%)', 'percentage', 10)}
                    style={{ padding: '3px 6px', background: 'var(--dark-card)', border: '1px solid var(--dark-border-2)', color: 'var(--cream)', fontSize: '0.58rem', fontFamily: 'var(--font-sans)', fontWeight: 600, cursor: 'pointer' }}
                  >
                    + Serv Tax 10%
                  </button>
                  <button 
                    onClick={() => addTableAdditive(activeTable!, 'Discount (10%)', 'percentage', -10)}
                    style={{ padding: '3px 6px', background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)', color: '#ef4444', fontSize: '0.58rem', fontFamily: 'var(--font-sans)', fontWeight: 600, cursor: 'pointer' }}
                  >
                    - Disc 10%
                  </button>
                </div>

                {/* Inline Additive Form */}
                {showAddAdditive && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '12px', background: 'var(--black)', border: '1px solid var(--dark-border-2)', marginBottom: '12px' }}>
                    <p style={{ fontSize: '0.62rem', fontWeight: 700, color: 'var(--gold)', margin: 0, textTransform: 'uppercase' }}>Add Custom Charge / Discount</p>
                    <input 
                      type="text" 
                      placeholder="Name (e.g. Service Charge)" 
                      value={customAddName} 
                      onChange={(e) => setCustomAddName(e.target.value)} 
                      style={{ width: '100%', padding: '6px 8px', background: 'var(--dark-card)', border: '1px solid var(--dark-border)', color: 'var(--cream)', fontSize: '0.72rem', borderRadius: 0, outline: 'none' }}
                    />
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <select 
                        value={customAddType} 
                        onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setCustomAddType(e.target.value as 'percentage' | 'flat')} 
                        style={{ flex: 1, padding: '6px', background: 'var(--dark-card)', border: '1px solid var(--dark-border)', color: 'var(--cream)', fontSize: '0.72rem', borderRadius: 0 }}
                      >
                        <option value="percentage">Percentage (%)</option>
                        <option value="flat">Flat Amount (₹)</option>
                      </select>
                      <input 
                        type="number" 
                        placeholder="Value" 
                        value={customAddValue} 
                        onChange={(e) => setCustomAddValue(e.target.value)} 
                        style={{ width: '80px', padding: '6px 8px', background: 'var(--dark-card)', border: '1px solid var(--dark-border)', color: 'var(--cream)', fontSize: '0.72rem', borderRadius: 0, outline: 'none', textAlign: 'center' }}
                      />
                    </div>
                    <button 
                      type="button" 
                      onClick={() => {
                        const val = parseFloat(customAddValue);
                        if (!customAddName.trim()) {
                          toast.error('Please enter a name');
                          return;
                        }
                        if (isNaN(val)) {
                          toast.error('Please enter a valid value');
                          return;
                        }
                        addTableAdditive(activeTable!, customAddName, customAddType, val);
                        setCustomAddName('');
                        setCustomAddValue('');
                        setShowAddAdditive(false);
                      }}
                      style={{ padding: '6px', background: 'var(--gold)', border: 'none', color: 'var(--black)', fontSize: '0.62rem', fontWeight: 700, cursor: 'pointer', textTransform: 'uppercase' }}
                    >
                      Apply Charge / Discount
                    </button>
                  </div>
                )}

                {/* Display Current Additives */}
                {calculatedAdditives.map((add) => (
                  <div key={add.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px', fontSize: '0.82rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <button 
                        onClick={() => removeTableAdditive(activeTable!, add.id)}
                        style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '2px', display: 'flex', alignItems: 'center' }}
                      >
                        <Trash2 size={10} />
                      </button>
                      <span style={{ color: 'var(--text-secondary)' }}>{add.name}</span>
                    </div>
                    <span style={{ color: add.calculatedValue < 0 ? '#ef4444' : 'var(--cream)', fontWeight: 600 }}>
                      {add.calculatedValue < 0 ? '-' : ''}₹{Math.abs(add.calculatedValue)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Total calculations */}
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.85rem', borderTop: '1px solid var(--dark-border)', paddingTop: '10px' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Subtotal</span>
                <span style={{ color: 'var(--cream)' }}>₹{subtotal.toLocaleString('en-IN')}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '14px' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--cream)' }}>Total</span>
                <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', fontWeight: 700, color: 'var(--gold)' }}>
                  ₹{grandTotal.toLocaleString('en-IN')}
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {activeOrder.status === 'open' ? (
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
                ) : (
                  <button
                    onClick={() => setShowBillModal(activeTable!)}
                    style={{
                      padding: '12px', background: 'var(--gold)',
                      border: 'none', color: 'var(--black)',
                      fontFamily: 'var(--font-sans)', fontSize: '0.72rem', fontWeight: 700,
                      letterSpacing: '0.12em', textTransform: 'uppercase', cursor: 'pointer',
                    }}
                  >
                    View / Edit Bill
                  </button>
                )}
                {activeOrder.items.length > 0 && (
                  <button
                    onClick={() => printThermalReceipt(activeOrder)}
                    style={{
                      padding: '10px', background: 'transparent', border: '1px solid var(--gold)',
                      color: 'var(--gold)', fontFamily: 'var(--font-sans)', fontSize: '0.65rem',
                      fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                    }}
                  >
                    <ShoppingBag size={12} /> Print Receipt / Save PDF
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
          );
        })()}
      </div>

      {/* Bill Modal */}
      {showBillModal && (() => {
        const order = tableOrders.find((t) => t.tableNumber === showBillModal);
        if (!order) return null;
        
        const subtotal = order.items.reduce((s: number, i: CartItem) => s + i.price * i.qty, 0);
        const additivesList = order.additives || [];
        
        const calculatedAdditives = additivesList.map((add) => {
          let val = 0;
          if (add.type === 'percentage') {
            val = Math.round(subtotal * (add.value / 100));
          } else {
            val = add.value;
          }
          return { ...add, calculatedValue: val };
        });

        const additivesSum = calculatedAdditives.reduce((sum, add) => sum + add.calculatedValue, 0);
        const grandTotal = subtotal + additivesSum;

        return (
          <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
            <div style={{ background: 'var(--dark-card)', border: '1px solid var(--dark-border)', width: '100%', maxWidth: '400px' }}>
              <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--dark-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', color: 'var(--cream)' }}>Bill — {order.tableNumber}</h2>
                <button onClick={() => setShowBillModal(null)} style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}><X size={18} /></button>
              </div>
              <div style={{ padding: '20px 24px', maxHeight: '350px', overflowY: 'auto' }}>
                <p style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--gold)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '10px' }}>Dishes</p>
                {order.items.map((item, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.85rem' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>{item.name} ×{item.qty}</span>
                    <span style={{ color: 'var(--cream)' }}>₹{item.price * item.qty}</span>
                  </div>
                ))}
                
                <div style={{ borderTop: '1px solid var(--dark-border)', marginTop: '16px', paddingTop: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '8px' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Subtotal</span>
                    <span style={{ color: 'var(--cream)' }}>₹{subtotal.toLocaleString('en-IN')}</span>
                  </div>

                  {calculatedAdditives.length > 0 && (
                    <div style={{ borderBottom: '1px solid var(--dark-border)', paddingBottom: '8px', marginBottom: '8px' }}>
                      {calculatedAdditives.map((add) => (
                        <div key={add.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '6px' }}>
                          <span style={{ color: 'var(--text-secondary)' }}>{add.name}</span>
                          <span style={{ color: add.calculatedValue < 0 ? '#ef4444' : 'var(--cream)', fontWeight: 600 }}>
                            {add.calculatedValue < 0 ? '-' : ''}₹{Math.abs(add.calculatedValue)}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '12px' }}>
                    <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.05rem', color: 'var(--cream)', fontWeight: 700 }}>Total</span>
                    <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', color: 'var(--gold)', fontWeight: 700 }}>₹{grandTotal.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>
               <div style={{ padding: '16px 24px', borderTop: '1px solid var(--dark-border)', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                 <button
                   onClick={() => printThermalReceipt(order)}
                   style={{ width: '100%', padding: '10px', background: 'transparent', border: '1px solid var(--gold)', color: 'var(--gold)', fontFamily: 'var(--font-sans)', fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                 >
                   <ShoppingBag size={14} /> Print Receipt / Save PDF
                 </button>
                 <div style={{ display: 'flex', gap: '10px', width: '100%' }}>
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
          </div>
        );
      })()}
    </div>
  );
}
