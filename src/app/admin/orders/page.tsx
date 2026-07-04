'use client';

import React, { useState, useEffect } from 'react';
import { useRestaurantStore, useCMSStore, type Order, type CartItem, type BillAdditive } from '@/store/restaurantStore';
import { CheckCircle, XCircle, Truck, ShoppingBag, Search, ChevronDown, Trash2, Plus, X, Edit, FileText } from 'lucide-react';
import { pusherClient } from '@/lib/pusher-client';
import toast from 'react-hot-toast';

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

const generateAdditiveId = () => 'add-' + Math.random().toString(36).substring(2, 8);

const printOrderReceipt = (order: Order) => {
  const regularItems = order.items.filter(i => !i.isAdditive && i.id !== 'discount' && i.id !== 'tax-cgst' && i.id !== 'tax-sgst');
  const additiveItems = order.items.filter((i: any) => i.isAdditive || i.id === 'discount' || i.id === 'tax-cgst' || i.id === 'tax-sgst');
  
  const subtotal = regularItems.reduce((s, i) => s + i.price * i.qty, 0);
  const grandTotal = order.total;

  const dateFormatted = new Date(order.createdAt).toLocaleString('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });

  const tableNumRow = order.tableNumber 
    ? `<tr><td class="bold">Table No:</td><td>${order.tableNumber}</td></tr>` 
    : '';
  const customerNameRow = `<tr><td class="bold">Customer:</td><td>${order.customerName || order.address?.name || 'Guest'}</td></tr>`;
  const customerPhoneRow = order.address?.phone
    ? `<tr><td class="bold">Phone:</td><td>${order.address.phone}</td></tr>` 
    : '';
  const customerEmailRow = order.address?.email
    ? `<tr><td class="bold">Email:</td><td>${order.address.email}</td></tr>` 
    : '';

  const itemsRows = regularItems.map(item => `
    <tr>
      <td>${item.name}</td>
      <td class="text-center">${item.qty}</td>
      <td class="text-right">₹${item.price}</td>
      <td class="text-right">₹${item.price * item.qty}</td>
    </tr>
  `).join('');

  const additivesRows = additiveItems.map(add => `
    <tr>
      <td colspan="3">${add.name}:</td>
      <td class="text-right">${add.price < 0 ? '-' : ''}₹${Math.abs(add.price)}</td>
    </tr>
  `).join('');

  const iframeHtml = `
    <html>
    <head>
      <title>Receipt - ${order.id}</title>
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
          <td>${order.id}</td>
        </tr>
        <tr>
          <td class="bold">Date/Time:</td>
          <td>${dateFormatted}</td>
        </tr>
        <tr>
          <td class="bold">Service:</td>
          <td>${order.type.toUpperCase()}</td>
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
        <div class="bold">Thank you for visiting!</div>
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

export default function OrdersPage() {
  const orders            = useRestaurantStore((s) => s.orders);
  const setOrders         = useRestaurantStore((s) => s.setOrders);
  const updateOrderStatus = useRestaurantStore((s) => s.updateOrderStatus);
  const updateOrderPaymentStatus = useRestaurantStore((s) => s.updateOrderPaymentStatus);
  const menuItems         = useCMSStore((s) => s.menuItems);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter]     = useState<string>('all');

  // Order editing states
  const [editOrder, setEditOrder] = useState<Order | null>(null);
  const [editItems, setEditItems] = useState<CartItem[]>([]);
  const [editAdditives, setEditAdditives] = useState<BillAdditive[]>([]);
  const [showAddAdditive, setShowAddAdditive] = useState(false);
  const [customAddName, setCustomAddName] = useState('');
  const [customAddType, setCustomAddType] = useState<'percentage' | 'flat'>('percentage');
  const [customAddValue, setCustomAddValue] = useState('');

  // Reason modal states
  const [showReasonModal, setShowReasonModal] = useState(false);
  const [selectedReason, setSelectedReason] = useState('Food not good');
  const [customReasonText, setCustomReasonText] = useState('');

  const loadOrders = async () => {
    try {
      const res = await fetch('/api/orders');
      const data = await res.json();
      if (Array.isArray(data)) {
        setOrders(data);
      }
    } catch (err) {
      console.warn('Failed to auto-poll orders:', err);
    }
  };

  useEffect(() => {
    // Initial fetch
    loadOrders();

    // Setup 5 seconds silent background polling
    const interval = setInterval(() => {
      loadOrders();
    }, 5000);

    // Subscribe to Pusher orders channel
    const channel = pusherClient.subscribe('orders');

    channel.bind('new-order', (newOrder: Order) => {
      setOrders((prev) => {
        if (prev.some((o) => o.id === newOrder.id)) return prev;
        return [newOrder, ...prev];
      });
      toast.success(`New order received: ${newOrder.id}`);
    });

    channel.bind('order-updated', (updatedOrder: Order) => {
      setOrders((prev) =>
        prev.map((o) => (o.id === updatedOrder.id ? updatedOrder : o))
      );
    });

    return () => {
      clearInterval(interval);
      channel.unbind_all();
      channel.unsubscribe();
    };
  }, [setOrders]);

  const startEditOrder = (order: Order) => {
    setEditOrder(order);
    setEditItems(order.items.filter(i => !i.isAdditive && i.id !== 'discount' && i.id !== 'tax-cgst' && i.id !== 'tax-sgst'));
    
    const parsedAdditives: BillAdditive[] = order.items
      .filter((i: any) => i.isAdditive || i.id === 'discount' || i.id === 'tax-cgst' || i.id === 'tax-sgst')
      .map((i: any) => ({
        id: i.id,
        name: i.name,
        type: i.type || 'flat',
        value: i.value !== undefined ? i.value : i.price
      }));
    setEditAdditives(parsedAdditives);
  };

  const addOrderAdditive = (name: string, type: 'percentage' | 'flat', value: number) => {
    const id = generateAdditiveId();
    if (editAdditives.some(a => a.name.toLowerCase() === name.toLowerCase())) {
      toast.error(`${name} is already applied.`);
      return;
    }
    setEditAdditives(prev => [...prev, { id, name, type, value }]);
  };

  const removeOrderAdditive = (id: string) => {
    setEditAdditives(prev => prev.filter(a => a.id !== id));
  };

  const saveOrderBill = () => {
    if (!editOrder) return;
    
    const origReg = editOrder.items.filter(i => !i.isAdditive && i.id !== 'discount' && i.id !== 'tax-cgst' && i.id !== 'tax-sgst');
    const origAdd = editOrder.items.filter((i: any) => i.isAdditive || i.id === 'discount' || i.id === 'tax-cgst' || i.id === 'tax-sgst');
    
    const itemsChanged = JSON.stringify(origReg) !== JSON.stringify(editItems);
    const additivesChanged = origAdd.length !== editAdditives.length || editAdditives.some((a, idx) => {
      const orig = origAdd[idx];
      if (!orig) return true;
      const calculatedVal = a.type === 'percentage' ? Math.round(editItems.reduce((s, i) => s + i.price * i.qty, 0) * (a.value / 100)) : a.value;
      return orig.name !== a.name || orig.price !== calculatedVal;
    });

    if (itemsChanged || additivesChanged) {
      setShowReasonModal(true);
    } else {
      setEditOrder(null);
    }
  };

  const confirmSaveOrderBill = async () => {
    if (!editOrder) return;
    const finalReason = selectedReason === 'Custom...' ? customReasonText : selectedReason;
    if (!finalReason.trim()) {
      toast.error('Please enter or select a reason for editing the bill.');
      return;
    }

    const subtotal = editItems.reduce((s, i) => s + i.price * i.qty, 0);
    const calculatedAdditives = editAdditives.map((add) => {
      let val = 0;
      if (add.type === 'percentage') {
        val = Math.round(subtotal * (add.value / 100));
      } else {
        val = add.value;
      }
      return { ...add, calculatedValue: val };
    });

    const additivesSum = calculatedAdditives.reduce((sum, add) => sum + add.calculatedValue, 0);
    const grandTotal = Math.max(0, subtotal + additivesSum);

    const finalItems = [...editItems];
    calculatedAdditives.forEach(add => {
      finalItems.push({
        id: add.id,
        name: add.name,
        price: add.calculatedValue,
        qty: 1,
        gradient: '',
        image: null,
        isAdditive: true,
        type: add.type,
        value: add.value
      } as any);
    });

    const discountDetails = calculatedAdditives.map(add => `${add.name}: ${add.calculatedValue < 0 ? '-' : ''}₹${Math.abs(add.calculatedValue)}`).join(', ');
    const fullDiscountDetails = `Subtotal: ₹${subtotal}, Additives: [${discountDetails}], Grand Total: ₹${grandTotal}`;

    try {
      const res = await fetch('/api/admin/orders/edit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: editOrder.id,
          items: finalItems,
          total: grandTotal,
          adminEmail: 'admin@thelondon.co.uk',
          discountDetails: fullDiscountDetails,
          reason: finalReason
        })
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`Order ${editOrder.id} bill updated successfully.`);
        loadOrders();
        setEditOrder(null);
        setShowReasonModal(false);
        setCustomReasonText('');
      } else {
        toast.error(data.error || 'Failed to update order bill.');
      }
    } catch (err) {
      console.error(err);
      toast.error('An error occurred while saving the bill.');
    }
  };

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
                  <p style={{ fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '6px' }}>Items ({order.items.filter(i => !i.isAdditive && i.id !== 'discount' && i.id !== 'tax-cgst' && i.id !== 'tax-sgst').length})</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    {order.items
                      .filter((i) => !i.isAdditive && i.id !== 'discount' && i.id !== 'tax-cgst' && i.id !== 'tax-sgst')
                      .map((item, i) => (
                        <div key={i} style={{ display: 'flex', gap: '8px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                          <span style={{ color: 'var(--gold)', fontWeight: 700, minWidth: '20px' }}>×{item.qty}</span>
                          <span>{item.name}</span>
                          <span style={{ marginLeft: 'auto', color: 'var(--cream)' }}>₹{item.price * item.qty}</span>
                        </div>
                      ))}
                    {order.items.some((i: any) => i.isAdditive || i.id === 'discount' || i.id === 'tax-cgst' || i.id === 'tax-sgst') && (
                      <div style={{ marginTop: '8px', borderTop: '1px dashed var(--dark-border)', paddingTop: '6px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        {order.items
                          .filter((i: any) => i.isAdditive || i.id === 'discount' || i.id === 'tax-cgst' || i.id === 'tax-sgst')
                          .map((item: any, i) => (
                            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                              <span>{item.name}</span>
                              <span style={{ color: item.price < 0 ? '#ef4444' : 'var(--cream)' }}>
                                {item.price < 0 ? '-' : ''}₹{Math.abs(item.price)}
                              </span>
                            </div>
                          ))}
                      </div>
                    )}
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
                    onClick={() => startEditOrder(order)}
                    style={{
                      padding: '6px 14px', background: 'rgba(212,175,55,0.12)', border: '1px solid rgba(212,175,55,0.4)',
                      color: 'var(--gold)', fontFamily: 'var(--font-sans)', fontSize: '0.62rem', fontWeight: 700,
                      letterSpacing: '0.1em', textTransform: 'uppercase', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px',
                    }}
                  >
                    <Edit size={12} /> Edit / Bill
                  </button>
                )}

                <button
                  onClick={() => printOrderReceipt(order)}
                  style={{
                    padding: '6px 14px', background: 'transparent', border: '1px solid var(--dark-border)',
                    color: 'var(--cream)', fontFamily: 'var(--font-sans)', fontSize: '0.62rem', fontWeight: 700,
                    letterSpacing: '0.1em', textTransform: 'uppercase', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px',
                  }}
                >
                  <FileText size={12} /> Print Receipt
                </button>

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

      {/* Edit Order Modal */}
      {editOrder && !showReasonModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
          <div style={{ background: 'var(--dark-card)', border: '1px solid var(--dark-border)', width: '100%', maxWidth: '480px', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--dark-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', color: 'var(--cream)', margin: 0 }}>Edit Order — {editOrder.id}</h2>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Customer: {editOrder.customerName || 'Guest'}</span>
              </div>
              <button onClick={() => setEditOrder(null)} style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}><X size={18} /></button>
            </div>
            
            <div style={{ padding: '24px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* 1. Itemized Dishes list */}
              <div>
                <p style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--gold)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '10px' }}>1. Edit Dishes</p>
                {editItems.length === 0 ? (
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontStyle: 'italic', margin: '10px 0' }}>No food items in the bill.</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {editItems.map((item) => (
                      <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: 'var(--dark-surface)', border: '1px solid var(--dark-border)' }}>
                        <div>
                          <p style={{ fontSize: '0.82rem', color: 'var(--cream)', margin: 0, fontWeight: 500 }}>{item.name}</p>
                          <span style={{ fontSize: '0.68rem', color: 'var(--text-secondary)' }}>₹{item.price} each</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <button
                            onClick={() => {
                              setEditItems(prev => prev.map(i => i.id === item.id ? { ...i, qty: i.qty - 1 } : i).filter(i => i.qty > 0));
                            }}
                            style={{ width: '22px', height: '22px', border: '1px solid var(--dark-border)', background: 'transparent', color: 'var(--cream)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem' }}
                          >
                            -
                          </button>
                          <span style={{ fontSize: '0.85rem', color: 'var(--cream)', minWidth: '16px', textAlign: 'center', fontWeight: 600 }}>{item.qty}</span>
                          <button
                            onClick={() => {
                              setEditItems(prev => prev.map(i => i.id === item.id ? { ...i, qty: i.qty + 1 } : i));
                            }}
                            style={{ width: '22px', height: '22px', border: '1px solid var(--dark-border)', background: 'transparent', color: 'var(--cream)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem' }}
                          >
                            +
                          </button>
                          <button
                            onClick={() => {
                              setEditItems(prev => prev.filter(i => i.id !== item.id));
                            }}
                            style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', marginLeft: '6px' }}
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Add New Dish Dropdown */}
              <div>
                <label style={{ display: 'block', fontSize: '0.65rem', color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '6px', fontWeight: 600 }}>+ Add Dish to Bill</label>
                <select
                  value=""
                  onChange={(e) => {
                    const dishId = e.target.value;
                    if (!dishId) return;
                    const menuItem = menuItems.find(m => m.id === dishId);
                    if (menuItem) {
                      const existing = editItems.find(i => i.id === dishId);
                      if (existing) {
                        setEditItems(prev => prev.map(i => i.id === dishId ? { ...i, qty: i.qty + 1 } : i));
                      } else {
                        setEditItems(prev => [...prev, { id: menuItem.id, name: menuItem.name, price: menuItem.price, qty: 1, gradient: menuItem.gradient, image: menuItem.image }]);
                      }
                      toast.success(`${menuItem.name} added to bill.`);
                    }
                  }}
                  style={{ width: '100%', padding: '8px 10px', background: 'var(--dark-surface)', border: '1px solid var(--dark-border)', color: 'var(--cream)', fontSize: '0.78rem', outline: 'none' }}
                >
                  <option value="">-- Choose a dish to add --</option>
                  {menuItems.map(item => (
                    <option key={item.id} value={item.id}>{item.name} — ₹{item.price}</option>
                  ))}
                </select>
              </div>

              {/* 2. Additives / Custom discounts & taxes controls */}
              <div style={{ borderTop: '1px solid var(--dark-border)', paddingTop: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <h3 style={{ fontSize: '0.65rem', color: 'var(--gold)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', margin: 0 }}>
                    2. Custom Charge / Discount
                  </h3>
                  <button
                    onClick={() => setShowAddAdditive(!showAddAdditive)}
                    style={{ padding: '2px 6px', background: 'transparent', border: '1px solid var(--gold)', color: 'var(--gold)', fontSize: '0.58rem', fontWeight: 600, fontFamily: 'var(--font-sans)', cursor: 'pointer' }}
                  >
                    {showAddAdditive ? 'Cancel' : '+ Add Custom'}
                  </button>
                </div>
                
                {/* Preset Buttons */}
                <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginBottom: '10px' }}>
                  <button 
                    onClick={() => addOrderAdditive('GST (5%)', 'percentage', 5)}
                    style={{ padding: '3px 6px', background: 'var(--dark-surface)', border: '1px solid var(--dark-border)', color: 'var(--cream)', fontSize: '0.62rem', fontFamily: 'var(--font-sans)', fontWeight: 600, cursor: 'pointer' }}
                  >
                    + GST 5%
                  </button>
                  <button 
                    onClick={() => addOrderAdditive('CGST (2.5%)', 'percentage', 2.5)}
                    style={{ padding: '3px 6px', background: 'var(--dark-surface)', border: '1px solid var(--dark-border)', color: 'var(--cream)', fontSize: '0.62rem', fontFamily: 'var(--font-sans)', fontWeight: 600, cursor: 'pointer' }}
                  >
                    + CGST 2.5%
                  </button>
                  <button 
                    onClick={() => addOrderAdditive('SGST (2.5%)', 'percentage', 2.5)}
                    style={{ padding: '3px 6px', background: 'var(--dark-surface)', border: '1px solid var(--dark-border)', color: 'var(--cream)', fontSize: '0.62rem', fontFamily: 'var(--font-sans)', fontWeight: 600, cursor: 'pointer' }}
                  >
                    + SGST 2.5%
                  </button>
                  <button 
                    onClick={() => addOrderAdditive('Discount (5%)', 'percentage', -5)}
                    style={{ padding: '3px 6px', background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)', color: '#ef4444', fontSize: '0.62rem', fontFamily: 'var(--font-sans)', fontWeight: 600, cursor: 'pointer' }}
                  >
                    - Disc 5%
                  </button>
                  <button 
                    onClick={() => addOrderAdditive('Discount (10%)', 'percentage', -10)}
                    style={{ padding: '3px 6px', background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)', color: '#ef4444', fontSize: '0.62rem', fontFamily: 'var(--font-sans)', fontWeight: 600, cursor: 'pointer' }}
                  >
                    - Disc 10%
                  </button>
                </div>

                {/* Inline Additive Form */}
                {showAddAdditive && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '10px', background: 'var(--dark-surface)', border: '1px solid var(--dark-border)', marginBottom: '10px' }}>
                    <p style={{ fontSize: '0.6rem', fontWeight: 700, color: 'var(--gold)', margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Add Custom Charge / Discount</p>
                    <input 
                      type="text" 
                      placeholder="Name (e.g. Service Charge)" 
                      value={customAddName} 
                      onChange={(e) => setCustomAddName(e.target.value)} 
                      style={{ width: '100%', padding: '5px 8px', background: 'var(--dark-card)', border: '1px solid var(--dark-border)', color: 'var(--cream)', fontSize: '0.72rem', outline: 'none' }}
                    />
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <select 
                        value={customAddType} 
                        onChange={(e: any) => setCustomAddType(e.target.value)} 
                        style={{ flex: 1, padding: '5px', background: 'var(--dark-card)', border: '1px solid var(--dark-border)', color: 'var(--cream)', fontSize: '0.72rem' }}
                      >
                        <option value="percentage">Percentage (%)</option>
                        <option value="flat">Flat Amount (₹)</option>
                      </select>
                      <input 
                        type="number" 
                        placeholder="Value (use - for discount)" 
                        value={customAddValue} 
                        onChange={(e) => setCustomAddValue(e.target.value)} 
                        style={{ width: '100px', padding: '5px 8px', background: 'var(--dark-card)', border: '1px solid var(--dark-border)', color: 'var(--cream)', fontSize: '0.72rem', outline: 'none', textAlign: 'center' }}
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
                        addOrderAdditive(customAddName, customAddType, val);
                        setCustomAddName('');
                        setCustomAddValue('');
                        setShowAddAdditive(false);
                      }}
                      style={{ padding: '5px', background: 'var(--gold)', border: 'none', color: 'var(--void)', fontSize: '0.68rem', fontWeight: 700, cursor: 'pointer', textTransform: 'uppercase', letterSpacing: '0.05em' }}
                    >
                      Apply Charge / Discount
                    </button>
                  </div>
                )}

                {/* Display Current Additives in Edit List */}
                {editAdditives.length > 0 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '10px' }}>
                    <p style={{ fontSize: '0.58rem', fontWeight: 700, color: 'var(--text-secondary)', margin: '0 0 2px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Applied Additives</p>
                    {editAdditives.map((add) => {
                      let calcVal = 0;
                      const subt = editItems.reduce((s, item) => s + item.price * item.qty, 0);
                      if (add.type === 'percentage') {
                        calcVal = Math.round(subt * (add.value / 100));
                      } else {
                        calcVal = add.value;
                      }
                      return (
                        <div key={add.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--dark-surface)', padding: '5px 10px', border: '1px solid var(--dark-border)' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <button 
                              onClick={() => removeOrderAdditive(add.id)}
                              style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '1px', display: 'flex', alignItems: 'center' }}
                            >
                              <Trash2 size={11} />
                            </button>
                            <span style={{ color: 'var(--cream)', fontSize: '0.72rem' }}>{add.name}</span>
                          </div>
                          <span style={{ color: calcVal < 0 ? '#ef4444' : 'var(--cream)', fontSize: '0.72rem', fontWeight: 600 }}>
                            {calcVal < 0 ? '-' : ''}₹{Math.abs(calcVal)}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Subtotal, tax and total summary */}
              <div style={{ borderTop: '1px dashed var(--dark-border)', paddingTop: '14px', marginTop: '10px' }}>
                <table style={{ width: '100%', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                  <tbody>
                    <tr>
                      <td style={{ paddingBottom: '4px' }}>Subtotal:</td>
                      <td style={{ textAlign: 'right', paddingBottom: '4px', color: 'var(--cream)' }}>₹{editItems.reduce((s, i) => s + i.price * i.qty, 0)}</td>
                    </tr>
                    {editAdditives.map((add) => {
                      const subt = editItems.reduce((s, i) => s + i.price * i.qty, 0);
                      const calcVal = add.type === 'percentage' ? Math.round(subt * (add.value / 100)) : add.value;
                      return (
                        <tr key={add.id}>
                          <td style={{ paddingBottom: '4px' }}>{add.name}:</td>
                          <td style={{ textAlign: 'right', paddingBottom: '4px', color: calcVal < 0 ? '#ef4444' : 'var(--cream)' }}>
                            {calcVal < 0 ? '-' : ''}₹{Math.abs(calcVal)}
                          </td>
                        </tr>
                      );
                    })}
                    <tr style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--cream)' }}>
                      <td style={{ paddingTop: '8px', borderTop: '1px solid var(--dark-border)' }}>Total:</td>
                      <td style={{ textAlign: 'right', paddingTop: '8px', borderTop: '1px solid var(--dark-border)', color: 'var(--gold)' }}>
                        ₹{
                          Math.max(0, 
                            editItems.reduce((s, i) => s + i.price * i.qty, 0) +
                            editAdditives.reduce((sum, add) => {
                              const subt = editItems.reduce((s, item) => s + item.price * item.qty, 0);
                              const calcVal = add.type === 'percentage' ? Math.round(subt * (add.value / 100)) : add.value;
                              return sum + calcVal;
                            }, 0)
                          )
                        }
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div style={{ padding: '16px 24px', borderTop: '1px solid var(--dark-border)', display: 'flex', gap: '12px' }}>
              <button
                onClick={() => setEditOrder(null)}
                style={{ flex: 1, padding: '10px', background: 'transparent', border: '1px solid var(--dark-border)', color: 'var(--text-secondary)', fontFamily: 'var(--font-sans)', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button
                onClick={saveOrderBill}
                style={{ flex: 1, padding: '10px', background: 'var(--gold)', border: 'none', color: 'var(--void)', fontFamily: 'var(--font-sans)', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer', textTransform: 'uppercase', letterSpacing: '0.05em' }}
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Reason Modal */}
      {editOrder && showReasonModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1100, background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
          <div style={{ background: 'var(--dark-card)', border: '1px solid var(--dark-border)', width: '100%', maxWidth: '380px', padding: '24px' }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', color: 'var(--cream)', margin: '0 0 8px' }}>Reason for Modification</h3>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: '0 0 16px', lineHeight: 1.4 }}>
              Auditing is enabled. Please select or type the reason for editing the bill details of order **{editOrder.id}**.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.65rem', color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '6px', fontWeight: 600 }}>Default Reason</label>
                <select
                  value={selectedReason}
                  onChange={(e) => setSelectedReason(e.target.value)}
                  style={{ width: '100%', padding: '8px 10px', background: 'var(--dark-surface)', border: '1px solid var(--dark-border)', color: 'var(--cream)', fontSize: '0.8rem', outline: 'none' }}
                >
                  <option value="Food not good">Food not good</option>
                  <option value="Stale food">Stale food</option>
                  <option value="Incorrect entry / item ordered by mistake">Incorrect entry / ordered by mistake</option>
                  <option value="Custom...">Custom reason...</option>
                </select>
              </div>

              {selectedReason === 'Custom...' && (
                <div>
                  <label style={{ display: 'block', fontSize: '0.65rem', color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '6px', fontWeight: 600 }}>Custom Explanation</label>
                  <textarea
                    rows={3}
                    placeholder="Provide description of the bill modification reason..."
                    value={customReasonText}
                    onChange={(e) => setCustomReasonText(e.target.value)}
                    style={{ width: '100%', padding: '8px 10px', background: 'var(--dark-surface)', border: '1px solid var(--dark-border)', color: 'var(--cream)', fontSize: '0.78rem', outline: 'none', resize: 'none', fontFamily: 'var(--font-sans)', boxSizing: 'border-box' }}
                  />
                </div>
              )}
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={() => setShowReasonModal(false)}
                style={{ flex: 1, padding: '8px', background: 'transparent', border: '1px solid var(--dark-border)', color: 'var(--text-secondary)', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer' }}
              >
                Back
              </button>
              <button
                onClick={confirmSaveOrderBill}
                style={{ flex: 1, padding: '8px', background: 'var(--gold)', border: 'none', color: 'var(--void)', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer', textTransform: 'uppercase', letterSpacing: '0.05em' }}
              >
                Confirm & Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
