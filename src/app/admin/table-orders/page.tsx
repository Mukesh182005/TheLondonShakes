'use client';

import React, { useState, useEffect } from 'react';
import { useRestaurantStore, useCMSStore, type CartItem, type TableOrder, type Order } from '@/store/restaurantStore';
import { Plus, Trash2, ShoppingBag, Check, X, ChefHat, Users, UtensilsCrossed, Receipt } from 'lucide-react';
import { pusherClient } from '@/lib/pusher-client';
import { useTableOrdersSync } from '@/hooks/useTableOrdersSync';
import { useIsMobile } from '@/hooks/useIsMobile';
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
  const requireReceiptPhoto = useCMSStore((s) => s.requireReceiptPhoto);
  const storeTables  = useCMSStore((s) => s.tables);
  const loadSystemSettings = useCMSStore((s) => s.loadSystemSettings);
  const placeOrder   = useRestaurantStore((s) => s.placeOrder);
  const addToCart    = useRestaurantStore((s) => s.addToCart);
  const clearCart    = useRestaurantStore((s) => s.clearCart);

  const tableOrders = useRestaurantStore((s) => s.tableOrders);
  const setTableOrders = useRestaurantStore((s) => s.setTableOrders);

  const TABLES = storeTables.map((t) => `Table ${t.number}`);
  const { isLive } = useTableOrdersSync();
  const [activeTable, setActiveTable] = useState<string | null>(null);

  // Portion Selection Modal State
  const [portionSelect, setPortionSelect] = useState<{ item: typeof menuItems[0] } | null>(null);

  useEffect(() => {
    loadSystemSettings();
  }, [loadSystemSettings]);

  useEffect(() => {
    const loadAndSync = () => {
      fetch('/api/orders')
        .then((res) => res.json())
        .then((data) => {
          if (Array.isArray(data)) {
            const activeDineIn = data.filter(
              (o) => o.type === 'dine-in' && o.tableNumber && o.status !== 'delivered' && o.status !== 'cancelled'
            );
            
            setTableOrders((prev: TableOrder[]) => {
              const dbTableMap = new Map<string, TableOrder>();
              activeDineIn.forEach((order) => {
                const tableNum = order.tableNumber!;
                const parsedAdditives = order.items.filter((i: any) => i.isAdditive);
                const additivesList = parsedAdditives.length > 0
                  ? parsedAdditives.map((i: any) => ({
                      id: i.id,
                      name: i.name,
                      type: i.type || 'flat',
                      value: i.value !== undefined ? i.value : i.price
                    }))
                  : [
                      { id: 'default-gst', name: 'GST (5%)', type: 'percentage', value: 5 }
                    ];

                dbTableMap.set(tableNum, {
                  tableNumber: tableNum,
                  items: order.items.filter((i: any) => !i.isAdditive && i.id !== 'discount' && i.id !== 'tax-cgst' && i.id !== 'tax-sgst'),
                  customerName: order.customerName || `Guest (${tableNum})`,
                  covers: 2,
                  status: order.paymentStatus === 'paid' ? 'paid' : 'open',
                  openedAt: order.createdAt,
                  orderId: order.id,
                  isDbOrder: true,
                  customerPhone: order.address?.phone || '',
                  customerEmail: order.address?.email || '',
                  paymentMethod: order.paymentMethod,
                  additives: additivesList
                });
              });

              const updated: TableOrder[] = [];
              const allTableNames = storeTables.map(t => `Table ${t.number}`);
              
              allTableNames.forEach((tableNum) => {
                if (dbTableMap.has(tableNum)) {
                  const dbOrder = dbTableMap.get(tableNum)!;
                  const localDraft = prev.find(t => t.tableNumber === tableNum);
                  if (localDraft && localDraft.orderId === dbOrder.orderId) {
                    dbOrder.status = localDraft.status;
                  }
                  updated.push(dbOrder);
                } else {
                  const localDraft = prev.find(t => t.tableNumber === tableNum);
                  if (localDraft) {
                    updated.push(localDraft);
                  }
                }
              });
              return updated;
            });
          }
        })
        .catch((err) => console.warn('Failed to load table orders:', err));
    };

    // Initial load
    loadAndSync();

    // 5-second background polling as fallback
    const interval = setInterval(() => {
      loadAndSync();
    }, 5000);

    // Pusher subscription kept for backward compat (mock mode — no-op)
    const channel = pusherClient.subscribe('orders');
    channel.bind('new-order', (newOrder: Order) => {
      if (newOrder.type === 'dine-in') { loadAndSync(); }
    });
    channel.bind('order-updated', (updatedOrder: Order) => {
      if (updatedOrder.type === 'dine-in') { loadAndSync(); }
    });

    return () => {
      clearInterval(interval);
      channel.unbind_all();
      channel.unsubscribe();
    };
  }, [setTableOrders, storeTables]);
  const [menuCat, setMenuCat]         = useState<string>('shakes');
  const [showBillModal, setShowBillModal] = useState<string | null>(null);
  const [showGuestDetails, setShowGuestDetails] = useState(false);
  const isMobile = useIsMobile();
  const [mobilePanel, setMobilePanel] = useState<'tables' | 'menu' | 'bill'>('tables');

  // States for pay-before-food checkout system
  const [billPaymentMethod, setBillPaymentMethod] = useState<'cod' | 'upi' | null>(null);
  const [upiProvider, setUpiProvider] = useState<'gpay' | 'phonepe' | null>(null);
  const [receiptPhoto, setReceiptPhoto] = useState<string | null>(null);

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
          paymentMethod: 'upi',
          additives: [
            { id: 'default-gst', name: 'GST (5%)', type: 'percentage', value: 5 }
          ]
        },
      ]);
    }
    setActiveTable(tableNumber);
  };

  const activeOrder = tableOrders.find((t) => t.tableNumber === activeTable);

  const syncTableOrderToDb = async (order: TableOrder) => {
    if (!order.isDbOrder || !order.orderId) return;

    const subtotal = order.items.reduce((s, i) => s + i.price * i.qty, 0);
    const calculatedAdditives = (order.additives || []).map((add) => {
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

    const finalItems = [...order.items];
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
      await fetch('/api/admin/orders/edit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: order.orderId,
          items: finalItems,
          total: grandTotal,
          adminEmail: 'admin@thelondon.co.uk',
          discountDetails: fullDiscountDetails
        })
      });
    } catch (err) {
      console.warn('Failed to auto-sync table order modification to database:', err);
    }
  };

  const addItemWithPortion = (item: typeof menuItems[0], size?: 'small' | 'medium' | 'large', price?: number) => {
    if (!activeTable) return;
    const finalPrice = price !== undefined ? price : item.price;
    const sizeSuffix = size ? `-${size}` : '';
    const cartItemId = `${item.id}${sizeSuffix}`;
    const displayName = size ? `${item.name} (${size.toUpperCase()})` : item.name;

    setTableOrders((prev: TableOrder[]) => prev.map((t) => {
      if (t.tableNumber !== activeTable) return t;
      const existing = t.items.find((i) => i.id === cartItemId);
      let updatedTable;
      if (existing) {
        updatedTable = { ...t, items: t.items.map((i) => i.id === cartItemId ? { ...i, qty: i.qty + 1 } : i) };
      } else {
        updatedTable = { 
          ...t, 
          items: [
            ...t.items, 
            { 
              id: cartItemId, 
              name: displayName, 
              price: finalPrice, 
              qty: 1, 
              gradient: item.gradient, 
              image: item.image,
              size
            }
          ] 
        };
      }
      if (updatedTable.isDbOrder) {
        syncTableOrderToDb(updatedTable);
      }
      return updatedTable;
    }));
  };

  const addItemToTable = (item: typeof menuItems[0]) => {
    const portions = item.portions || {
      small: { available: false, price: 0 },
      medium: { available: true, price: item.price },
      large: { available: false, price: 0 }
    };
    
    const availableSizes = (['small', 'medium', 'large'] as const).filter(s => portions[s]?.available);
    
    if (availableSizes.length > 1) {
      setPortionSelect({ item });
    } else if (availableSizes.length === 1) {
      const size = availableSizes[0];
      const price = portions[size]?.price || item.price;
      addItemWithPortion(item, size, price);
    } else {
      addItemWithPortion(item);
    }
  };

  const removeItem = (tableNumber: string, itemId: string) => {
    setTableOrders((prev: TableOrder[]) => prev.map((t) => {
      if (t.tableNumber !== tableNumber) return t;
      const updatedItems = t.items.map((i) => i.id === itemId ? { ...i, qty: i.qty - 1 } : i).filter((i) => i.qty > 0);
      const updatedTable = { ...t, items: updatedItems };
      if (updatedTable.isDbOrder) {
        syncTableOrderToDb(updatedTable);
      }
      return updatedTable;
    }));
  };

  const addItem = (tableNumber: string, itemId: string) => {
    setTableOrders((prev: TableOrder[]) => prev.map((t) => {
      if (t.tableNumber !== tableNumber) return t;
      const updatedItems = t.items.map((i) => i.id === itemId ? { ...i, qty: i.qty + 1 } : i);
      const updatedTable = { ...t, items: updatedItems };
      if (updatedTable.isDbOrder) {
        syncTableOrderToDb(updatedTable);
      }
      return updatedTable;
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
        const updatedTable = {
          ...to,
          additives: [...current, { id, name, type, value }]
        };
        if (to.isDbOrder) {
          syncTableOrderToDb(updatedTable);
        }
        return updatedTable;
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
        const updatedTable = {
          ...to,
          additives: current.filter((add) => add.id !== id)
        };
        if (to.isDbOrder) {
          syncTableOrderToDb(updatedTable);
        }
        return updatedTable;
      }
      return to;
    }));
  };

  const closeTable = (tableNumber: string) => {
    setTableOrders((prev: TableOrder[]) => prev.filter((t) => t.tableNumber !== tableNumber));
    if (activeTable === tableNumber) setActiveTable(null);
  };

  const handleClearTable = (tableNumber: string) => {
    const order = tableOrders.find((t) => t.tableNumber === tableNumber);
    if (order) {
      if (order.status === 'paid') {
        if (order.isDbOrder && order.orderId) {
          useRestaurantStore.getState().updateOrderStatus(order.orderId, 'delivered');
        }
        toast.success(`Table ${tableNumber.replace('Table ', '')} completed and cleared.`);
        closeTable(tableNumber);
      } else {
        if (order.isDbOrder && order.orderId) {
          if (window.confirm(`This table has an active unpaid order (${order.orderId}). Clearing the table will cancel this order. Do you want to proceed?`)) {
            useRestaurantStore.getState().updateOrderStatus(order.orderId, 'cancelled');
            toast.success(`Order ${order.orderId} cancelled.`);
            closeTable(tableNumber);
          }
        } else {
          closeTable(tableNumber);
        }
      }
    }
  };

  const billTable = (tableNumber: string) => {
    setTableOrders((prev: TableOrder[]) => prev.map((t) => t.tableNumber === tableNumber ? { ...t, status: 'billed' as const } : t));
    setShowBillModal(tableNumber);
  };

  const markPaid = (tableNumber: string, finalPaymentMethod: 'cod' | 'upi' = 'cod') => {
    const order = tableOrders.find((t) => t.tableNumber === tableNumber);
    if (order) {
      let targetOrderId = order.orderId;
      if (order.isDbOrder && order.orderId) {
        fetch('/api/orders', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            orderId: order.orderId, 
            paymentStatus: 'paid', 
            status: 'confirmed', 
            receiptPhoto: receiptPhoto || undefined 
          }),
        }).catch(err => console.warn('Failed to upload receipt photo:', err));

        useRestaurantStore.setState((state) => ({
          orders: state.orders.map(o => o.id === order.orderId ? { 
            ...o, 
            paymentStatus: 'paid' as const, 
            status: 'confirmed' as const, 
            receiptPhoto: receiptPhoto || undefined 
          } : o)
        }));
        toast.success(`Order ${order.orderId} marked as paid.`);
      } else {
        if (order.items.length > 0) {
          clearCart();
          order.items.forEach((item) => {
            for (let i = 0; i < item.qty; i++) {
              addToCart({ id: item.id, name: item.name, price: item.price, gradient: item.gradient, image: item.image });
            }
          });
          const newId = placeOrder(finalPaymentMethod, '', {
            type: 'dine-in',
            tableNumber,
            customerName: order.customerName || `Table ${tableNumber.replace('Table ', '')}`,
            adminPlaced: true,
            receiptPhoto: receiptPhoto || undefined,
            paymentStatus: 'paid',
            status: 'confirmed',
          });
          targetOrderId = newId;
          if (newId) {
            toast.success(`Order placed and marked as paid.`);
          }
        }
      }

      // Update local state tableOrders to retain the table as active but paid!
      setTableOrders((prev: TableOrder[]) => {
        const next = prev.map((t) => t.tableNumber === tableNumber ? { ...t, status: 'paid' as const, isDbOrder: true, orderId: targetOrderId } : t);
        // Sync to other devices via API
        if (typeof window !== 'undefined') {
          fetch('/api/table-orders', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(next),
          }).catch(() => {/* silent */});
        }
        return next;
      });
    }
    setShowBillModal(null);
    // Reset payment flow states
    setBillPaymentMethod(null);
    setUpiProvider(null);
    setReceiptPhoto(null);
  };



  const openTables  = tableOrders.filter((t) => t.status === 'open');
  const billedTables = tableOrders.filter((t) => t.status === 'billed');

  const categoryItems = menuItems.filter((i) => i.category === menuCat);

  // Auto-navigate to menu panel when a table is selected on mobile
  useEffect(() => {
    if (isMobile && activeTable) {
      setMobilePanel('menu');
    }
  }, [isMobile, activeTable]);

  if (isMobile) {
    /* ══════════════════════════════════════════════════
       MOBILE LAYOUT — single panel with bottom tab bar
       ══════════════════════════════════════════════════ */
    const itemCount = activeOrder?.items.reduce((s, i) => s + i.qty, 0) || 0;
    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 60px)', overflow: 'hidden', background: 'var(--void)' }}>

        {/* ── MOBILE PANEL CONTENT ── */}
        <div style={{ flex: 1, overflowY: 'auto' }}>

          {/* TABLES PANEL */}
          {mobilePanel === 'tables' && (
            <div style={{ padding: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <p style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem', color: 'var(--cream)' }}>Tables</p>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.65rem', color: isLive ? '#10b981' : '#f59e0b', fontWeight: 600 }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: isLive ? '#10b981' : '#f59e0b', display: 'inline-block' }} />
                  {isLive ? 'LIVE' : 'RECONNECTING'}
                </span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                {TABLES.map((table) => {
                  const order   = tableOrders.find((t) => t.tableNumber === table);
                  const isOpen  = !!order;
                  const isActive = activeTable === table;
                  const statusColor = order?.status === 'billed' ? '#f59e0b' : order?.status === 'paid' ? '#10b981' : isOpen ? '#10b981' : 'var(--dark-border)';
                  return (
                    <button
                      key={table}
                      onClick={() => { isOpen ? setActiveTable(table) : openTable(table); }}
                      style={{
                        padding: '18px 8px', background: isActive ? 'rgba(197,168,92,0.1)' : isOpen ? 'rgba(16,185,129,0.05)' : 'var(--dark-surface)',
                        border: `2px solid ${isActive ? 'var(--gold)' : statusColor}`,
                        color: isActive ? 'var(--gold)' : isOpen ? 'var(--cream)' : 'var(--text-secondary)',
                        fontFamily: 'var(--font-sans)', fontSize: '0.82rem', fontWeight: 700,
                        cursor: 'pointer', textAlign: 'center',
                      }}
                    >
                      <Users size={14} style={{ display: 'block', margin: '0 auto 6px' }} />
                      {table.replace('Table ', 'T')}
                      {order && <div style={{ fontSize: '0.6rem', marginTop: '4px', color: statusColor }}>
                        {order.status === 'billed' ? 'BILLED' : order.status === 'paid' ? 'PAID' : `${order.items.reduce((s: number, i: CartItem) => s + i.qty, 0)} items`}
                      </div>}
                    </button>
                  );
                })}
              </div>
              <div style={{ marginTop: '16px', padding: '14px', background: 'var(--dark-surface)', border: '1px solid var(--dark-border)', display: 'flex', justifyContent: 'space-around' }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#10b981' }}>{openTables.length}</div>
                  <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)' }}>Open</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#f59e0b' }}>{billedTables.length}</div>
                  <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)' }}>Billed</div>
                </div>
              </div>
            </div>
          )}

          {/* MENU PANEL */}
          {mobilePanel === 'menu' && (
            <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
              <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--dark-border)', flexShrink: 0 }}>
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', color: 'var(--cream)', marginBottom: '10px' }}>
                  {activeTable ? `Order — ${activeTable}` : 'Select a Table First'}
                </h2>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  {menuCategories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setMenuCat(cat.id)}
                      style={{
                        padding: '6px 14px', background: menuCat === cat.id ? 'rgba(197,168,92,0.12)' : 'transparent',
                        border: `1px solid ${menuCat === cat.id ? 'rgba(197,168,92,0.4)' : 'var(--dark-border)'}`,
                        color: menuCat === cat.id ? 'var(--gold)' : 'var(--text-secondary)',
                        fontFamily: 'var(--font-sans)', fontSize: '0.7rem', fontWeight: 600,
                        letterSpacing: '0.08em', textTransform: 'uppercase', cursor: 'pointer',
                      }}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>
              <div style={{ flex: 1, overflowY: 'auto', padding: '12px 16px' }}>
                {!activeTable ? (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '200px', color: 'var(--text-secondary)', gap: '12px' }}>
                    <ChefHat size={32} style={{ opacity: 0.3 }} />
                    <p style={{ fontSize: '0.9rem' }}>Select a table first</p>
                    <button onClick={() => setMobilePanel('tables')} style={{ padding: '10px 20px', background: 'var(--gold)', border: 'none', color: 'var(--black)', fontFamily: 'var(--font-sans)', fontSize: '0.72rem', fontWeight: 700, cursor: 'pointer' }}>Go to Tables</button>
                  </div>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    {categoryItems.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => { addItemToTable(item); }}
                        style={{
                          padding: '16px 12px', background: 'var(--dark-card)', border: '1px solid var(--dark-border)',
                          textAlign: 'left', cursor: 'pointer',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                          <Plus size={12} color="var(--gold)" />
                          {item.badge && (
                            <span style={{ fontSize: '0.5rem', background: 'rgba(197,168,92,0.1)', color: 'var(--gold)', padding: '1px 5px', fontWeight: 700 }}>{item.badge}</span>
                          )}
                        </div>
                        <p style={{ fontFamily: 'var(--font-sans)', fontSize: '0.88rem', fontWeight: 600, color: 'var(--cream)', marginBottom: '4px', lineHeight: 1.3 }}>{item.name}</p>
                        <p style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', color: 'var(--gold)' }}>₹{item.price}</p>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* BILL PANEL */}
          {mobilePanel === 'bill' && (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--dark-border)' }}>
                <p style={{ fontFamily: 'var(--font-sans)', fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Current Order</p>
              </div>
              <div style={{ padding: '16px', overflowY: 'auto' }}>
                {!activeOrder ? (
                  <div style={{ textAlign: 'center', color: 'var(--text-secondary)', marginTop: '40px' }}>
                    <ShoppingBag size={32} style={{ opacity: 0.3, marginBottom: '12px' }} />
                    <p style={{ fontSize: '0.9rem', marginBottom: '16px' }}>No table selected</p>
                    <button onClick={() => setMobilePanel('tables')} style={{ padding: '10px 20px', background: 'var(--gold)', border: 'none', color: 'var(--black)', fontFamily: 'var(--font-sans)', fontSize: '0.72rem', fontWeight: 700, cursor: 'pointer' }}>Select a Table</button>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {/* Guest Details */}
                    <div style={{ borderBottom: '1px solid var(--dark-border)', paddingBottom: '16px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', cursor: 'pointer' }} onClick={() => setShowGuestDetails(!showGuestDetails)}>
                        <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--gold)', letterSpacing: '0.15em', textTransform: 'uppercase' }}>Guest Details</span>
                        <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)' }}>{showGuestDetails ? 'Collapse ▲' : 'Edit ▼'}</span>
                      </div>
                      {!showGuestDetails && (
                        <p style={{ fontSize: '0.85rem', color: 'var(--cream)', margin: 0 }}>{activeOrder.customerName || 'Walk-in Guest'}{activeOrder.customerPhone ? ` · ${activeOrder.customerPhone}` : ''}</p>
                      )}
                      {showGuestDetails && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '10px' }}>
                          <div>
                            <label style={{ display: 'block', fontSize: '0.6rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '6px' }}>Guest Name</label>
                            <input type="text" placeholder="e.g. Jane Doe" value={activeOrder.customerName || ''} onChange={(e) => { setTableOrders((prev: TableOrder[]) => prev.map(to => to.tableNumber === activeTable ? { ...to, customerName: e.target.value } : to)); }} style={{ width: '100%', padding: '10px 12px', background: 'var(--black)', border: '1px solid var(--dark-border-2)', color: 'var(--cream)', fontSize: '0.88rem', borderRadius: 0, outline: 'none', boxSizing: 'border-box' }} />
                          </div>
                          <div>
                            <label style={{ display: 'block', fontSize: '0.6rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '6px' }}>Mobile Number</label>
                            <input type="tel" placeholder="+91 98765 43210" value={activeOrder.customerPhone || ''} onChange={(e) => { setTableOrders((prev: TableOrder[]) => prev.map(to => to.tableNumber === activeTable ? { ...to, customerPhone: e.target.value } : to)); }} style={{ width: '100%', padding: '10px 12px', background: 'var(--black)', border: '1px solid var(--dark-border-2)', color: 'var(--cream)', fontSize: '0.88rem', borderRadius: 0, outline: 'none', boxSizing: 'border-box' }} />
                          </div>
                          <div>
                            <label style={{ display: 'block', fontSize: '0.6rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '6px' }}>Email</label>
                            <input type="email" placeholder="jane@example.com" value={activeOrder.customerEmail || ''} onChange={(e) => { setTableOrders((prev: TableOrder[]) => prev.map(to => to.tableNumber === activeTable ? { ...to, customerEmail: e.target.value } : to)); }} style={{ width: '100%', padding: '10px 12px', background: 'var(--black)', border: '1px solid var(--dark-border-2)', color: 'var(--cream)', fontSize: '0.88rem', borderRadius: 0, outline: 'none', boxSizing: 'border-box' }} />
                          </div>
                        </div>
                      )}
                    </div>
                    {/* Items */}
                    {activeOrder.items.length === 0 ? (
                      <div style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '20px 0' }}>
                        <ShoppingBag size={24} style={{ opacity: 0.3, marginBottom: '8px' }} />
                        <p style={{ fontSize: '0.85rem' }}>No items yet — go to Menu tab</p>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {activeOrder.items.map((item) => (
                          <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px', background: 'var(--dark-surface)', border: '1px solid var(--dark-border)' }}>
                            <div style={{ flex: 1 }}>
                              <p style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--cream)', marginBottom: '2px' }}>{item.name}</p>
                              <p style={{ fontSize: '0.85rem', color: 'var(--gold)' }}>₹{item.price * item.qty}</p>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <button onClick={() => removeItem(activeTable!, item.id)} style={{ width: '32px', height: '32px', background: 'var(--dark-card)', border: '1px solid var(--dark-border)', color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}>−</button>
                              <span style={{ fontFamily: 'var(--font-sans)', fontSize: '1rem', fontWeight: 700, color: 'var(--cream)', minWidth: '26px', textAlign: 'center' }}>{item.qty}</span>
                              <button onClick={() => addItem(activeTable!, item.id)} style={{ width: '32px', height: '32px', background: 'var(--dark-card)', border: '1px solid var(--dark-border)', color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}>+</button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    {/* Totals & Action */}
                    {(() => {
                      const subtotal = activeOrder.items.reduce((s: number, i: CartItem) => s + i.price * i.qty, 0);
                      const additivesList = activeOrder.additives || [];
                      const calculatedAdditives = additivesList.map((add) => {
                        let val = 0;
                        if (add.type === 'percentage') { val = Math.round(subtotal * (add.value / 100)); } else { val = add.value; }
                        return { ...add, calculatedValue: val };
                      });
                      const additivesSum = calculatedAdditives.reduce((sum, add) => sum + add.calculatedValue, 0);
                      const grandTotal = subtotal + additivesSum;
                      return (
                        <div style={{ borderTop: '1px solid var(--dark-border)', paddingTop: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                          {calculatedAdditives.map((add) => (
                            <div key={add.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <button onClick={() => removeTableAdditive(activeTable!, add.id)} style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '2px' }}><Trash2 size={12} /></button>
                                <span style={{ color: 'var(--text-secondary)' }}>{add.name}</span>
                              </div>
                              <span style={{ color: add.calculatedValue < 0 ? '#ef4444' : 'var(--cream)', fontWeight: 600 }}>{add.calculatedValue < 0 ? '-' : ''}₹{Math.abs(add.calculatedValue)}</span>
                            </div>
                          ))}
                          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                            {[['GST (5%)', 5], ['CGST (9%)', 9], ['SGST (9%)', 9], ['Service Tax (10%)', 10]].map(([label, val]) => (
                              <button key={String(label)} onClick={() => addTableAdditive(activeTable!, String(label), 'percentage', Number(val))} style={{ padding: '5px 10px', background: 'var(--dark-card)', border: '1px solid var(--dark-border-2)', color: 'var(--cream)', fontSize: '0.65rem', fontFamily: 'var(--font-sans)', fontWeight: 600, cursor: 'pointer' }}>+ {label}</button>
                            ))}
                            <button onClick={() => addTableAdditive(activeTable!, 'Discount (10%)', 'percentage', -10)} style={{ padding: '5px 10px', background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)', color: '#ef4444', fontSize: '0.65rem', fontFamily: 'var(--font-sans)', fontWeight: 600, cursor: 'pointer' }}>- Disc 10%</button>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                            <span style={{ color: 'var(--text-secondary)' }}>Subtotal</span>
                            <span style={{ color: 'var(--cream)' }}>₹{subtotal.toLocaleString('en-IN')}</span>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--cream)' }}>Total</span>
                            <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', fontWeight: 700, color: 'var(--gold)' }}>₹{grandTotal.toLocaleString('en-IN')}</span>
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '4px' }}>
                            {activeOrder.status === 'open' ? (
                              <button onClick={() => billTable(activeTable!)} disabled={activeOrder.items.length === 0} style={{ padding: '16px', background: activeOrder.items.length > 0 ? 'var(--gold)' : 'var(--dark-surface)', border: 'none', color: activeOrder.items.length > 0 ? 'var(--black)' : 'var(--text-muted)', fontFamily: 'var(--font-sans)', fontSize: '0.85rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', cursor: activeOrder.items.length > 0 ? 'pointer' : 'not-allowed' }}>Generate Bill</button>
                            ) : activeOrder.status === 'billed' ? (
                              <button onClick={() => setShowBillModal(activeTable!)} style={{ padding: '16px', background: 'var(--gold)', border: 'none', color: 'var(--black)', fontFamily: 'var(--font-sans)', fontSize: '0.85rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', cursor: 'pointer' }}>Checkout / Pay</button>
                            ) : (
                              <button onClick={() => handleClearTable(activeTable!)} style={{ padding: '16px', background: '#10b981', border: 'none', color: 'var(--black)', fontFamily: 'var(--font-sans)', fontSize: '0.85rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', cursor: 'pointer' }}>Complete & Clear Table</button>
                            )}
                            {activeOrder.items.length > 0 && (
                              <button onClick={() => printThermalReceipt(activeOrder)} style={{ padding: '14px', background: 'transparent', border: '1px solid var(--gold)', color: 'var(--gold)', fontFamily: 'var(--font-sans)', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                                <ShoppingBag size={14} /> Print Receipt
                              </button>
                            )}
                            <button onClick={() => handleClearTable(activeTable!)} style={{ padding: '14px', background: 'transparent', border: '1px solid rgba(239,68,68,0.3)', color: '#ef4444', fontFamily: 'var(--font-sans)', fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                              <Trash2 size={13} /> Clear Table
                            </button>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* ── MOBILE BOTTOM TAB BAR ── */}
        <div style={{ display: 'flex', borderTop: '1px solid var(--dark-border)', background: 'var(--void)', flexShrink: 0 }}>
          {([
            { id: 'tables', label: 'Tables', icon: Users },
            { id: 'menu',   label: 'Menu',   icon: UtensilsCrossed },
            { id: 'bill',   label: 'Bill',   icon: Receipt },
          ] as const).map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setMobilePanel(id)}
              style={{
                flex: 1, padding: '14px 4px', background: 'transparent', border: 'none',
                color: mobilePanel === id ? 'var(--gold)' : 'var(--text-secondary)',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px',
                fontFamily: 'var(--font-sans)', fontSize: '0.62rem', fontWeight: mobilePanel === id ? 700 : 400,
                cursor: 'pointer', borderTop: `2px solid ${mobilePanel === id ? 'var(--gold)' : 'transparent'}`,
                position: 'relative',
              }}
            >
              {id === 'bill' && itemCount > 0 && (
                <span style={{ position: 'absolute', top: '8px', right: 'calc(50% - 18px)', background: '#ef4444', color: '#fff', borderRadius: '999px', fontSize: '0.55rem', fontWeight: 700, padding: '1px 5px', lineHeight: 1.4 }}>{itemCount}</span>
              )}
              <Icon size={20} />
              {label}
            </button>
          ))}
        </div>

        {/* Bill Modal (Mobile Viewport Rendering) */}
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

          const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
            const file = e.target.files?.[0];
            if (file) {
              const reader = new FileReader();
              reader.onloadend = () => {
                setReceiptPhoto(reader.result as string);
                toast.success("Transaction receipt photo captured!");
              };
              reader.readAsDataURL(file);
            }
          };

          const handleSimulatePhoto = () => {
            setReceiptPhoto("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='150' height='200' viewBox='0 0 150 200'><rect width='100%' height='100%' fill='%2310b981'/><text x='15' y='40' fill='white' font-family='sans-serif' font-weight='bold' font-size='12'>TRANSACTION SLIP</text><text x='15' y='70' fill='white' font-family='sans-serif' font-size='10'>Amount: INR " + grandTotal + "</text><text x='15' y='90' fill='white' font-family='sans-serif' font-size='10'>Status: SUCCESS</text><text x='15' y='110' fill='white' font-family='sans-serif' font-size='9'>Txn ID: 987654321098</text></svg>");
            toast.success("Simulated receipt photo loaded!");
          };

          return (
            <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
              <style>{`
                @keyframes laser-move {
                  0%, 100% { transform: translateY(0); }
                  50% { transform: translateY(180px); }
                }
                @keyframes pulse-light {
                  0%, 100% { opacity: 0.3; }
                  50% { opacity: 0.8; }
                }
              `}</style>
              <div style={{ background: 'var(--dark-card)', border: '1px solid var(--dark-border)', width: '100%', maxWidth: '440px', display: 'flex', flexDirection: 'column', maxHeight: '90vh' }}>
                
                {/* Modal Header */}
                <div style={{ padding: '18px 20px', borderBottom: '1px solid var(--dark-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
                  <div>
                    <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.15rem', color: 'var(--cream)', margin: 0 }}>Checkout — {order.tableNumber}</h2>
                    <span style={{ fontSize: '0.62rem', color: 'var(--text-muted)' }}>PAY BEFORE FOOD SYSTEM</span>
                  </div>
                  <button 
                    onClick={() => {
                      setShowBillModal(null);
                      setBillPaymentMethod(null);
                      setUpiProvider(null);
                      setReceiptPhoto(null);
                    }} 
                    style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}
                  >
                    <X size={18} />
                  </button>
                </div>

                {/* Modal Body */}
                <div style={{ padding: '20px', overflowY: 'auto', flex: 1 }}>
                  
                  {/* ── Bill Summary (Collapsed) ── */}
                  <div style={{ background: 'var(--dark-surface)', padding: '12px 16px', border: '1px solid var(--dark-border)', marginBottom: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                      <span>Table Subtotal:</span>
                      <span>₹{subtotal.toLocaleString('en-IN')}</span>
                    </div>
                    {calculatedAdditives.map((add) => (
                      <div key={add.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                        <span>{add.name}:</span>
                        <span>{add.calculatedValue < 0 ? '-' : ''}₹{Math.abs(add.calculatedValue)}</span>
                      </div>
                    ))}
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px dashed var(--dark-border)', marginTop: '8px', paddingTop: '8px' }}>
                      <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--cream)' }}>Grand Total:</span>
                      <span style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--gold)', fontFamily: 'var(--font-display)' }}>₹{grandTotal.toLocaleString('en-IN')}</span>
                    </div>
                  </div>

                  {/* ── STEP 1: Select Payment Method ── */}
                  {!billPaymentMethod && (
                    <div>
                      <p style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '10px' }}>Select Payment Type</p>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                        <button
                          onClick={() => setBillPaymentMethod('cod')}
                          style={{
                            padding: '24px 16px', background: 'var(--dark-surface)', border: '1px solid var(--dark-border)',
                            color: 'var(--cream)', cursor: 'pointer', textAlign: 'center', transition: 'all 0.2s',
                            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px'
                          }}
                        >
                          <span style={{ fontSize: '1.8rem' }}>💵</span>
                          <span style={{ fontSize: '0.82rem', fontWeight: 700 }}>Cash at Counter</span>
                          <span style={{ fontSize: '0.58rem', color: 'var(--text-muted)' }}>Pay cash directly</span>
                        </button>

                        <button
                          onClick={() => setBillPaymentMethod('upi')}
                          style={{
                            padding: '24px 16px', background: 'var(--dark-surface)', border: '1px solid var(--dark-border)',
                            color: 'var(--cream)', cursor: 'pointer', textAlign: 'center', transition: 'all 0.2s',
                            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px'
                          }}
                        >
                          <span style={{ fontSize: '1.8rem' }}>📱</span>
                          <span style={{ fontSize: '0.82rem', fontWeight: 700 }}>Scan & Pay (UPI)</span>
                          <span style={{ fontSize: '0.58rem', color: 'var(--text-muted)' }}>Google Pay / PhonePe</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* ── STEP 2: UPI flow ── */}
                  {billPaymentMethod === 'upi' && (
                    <div>
                      <button 
                        onClick={() => {
                          setBillPaymentMethod(null);
                          setUpiProvider(null);
                          setReceiptPhoto(null);
                        }}
                        style={{ background: 'transparent', border: 'none', color: 'var(--gold)', cursor: 'pointer', fontSize: '0.72rem', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '14px', padding: 0 }}
                      >
                        ← Back to payment methods
                      </button>

                      {!upiProvider && (
                        <div>
                          <p style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '10px' }}>Choose UPI Provider</p>
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                            <button
                              onClick={() => setUpiProvider('gpay')}
                              style={{
                                padding: '16px', background: 'var(--dark-surface)', border: '1px solid var(--dark-border)',
                                color: 'var(--cream)', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px'
                              }}
                            >
                              <span style={{ fontSize: '1.4rem' }}>📱</span>
                              <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>Google Pay</span>
                              <span style={{ fontSize: '0.55rem', color: 'var(--text-muted)' }}>Show Google Pay QR</span>
                            </button>

                            <button
                              onClick={() => setUpiProvider('phonepe')}
                              style={{
                                padding: '16px', background: 'var(--dark-surface)', border: '1px solid var(--dark-border)',
                                color: 'var(--cream)', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px'
                              }}
                            >
                              <span style={{ fontSize: '1.4rem' }}>🔳</span>
                              <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>PhonePe QR</span>
                              <span style={{ fontSize: '0.55rem', color: 'var(--text-muted)' }}>Show PhonePe QR</span>
                            </button>
                          </div>
                        </div>
                      )}

                      {upiProvider === 'gpay' && (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '10px' }}>
                          <div style={{ background: '#fff', padding: '10px', border: '4px solid #fff', display: 'inline-block' }}>
                            <img 
                              src="/gpay-qr.jpg" 
                              alt="Google Pay QR Code" 
                              style={{ width: '180px', height: 'auto', display: 'block' }}
                            />
                          </div>
                          <p style={{ fontSize: '0.62rem', color: 'var(--text-muted)', margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            Show GPay QR to the customer to scan
                          </p>
                          <span style={{ fontSize: '0.62rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                            UPI ID: gpay-11251382996@okbizaxis
                          </span>
                        </div>
                      )}

                      {upiProvider === 'phonepe' && (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '10px' }}>
                          <div style={{ background: '#fff', padding: '10px', border: '4px solid #fff', display: 'inline-block' }}>
                            <img 
                              src="/phonepe-qr.jpg" 
                              alt="PhonePe Payment QR Code" 
                              style={{ width: '180px', height: 'auto', display: 'block' }}
                            />
                          </div>
                          <p style={{ fontSize: '0.62rem', color: 'var(--text-muted)', margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            Show PhonePe QR code to the customer to scan
                          </p>
                        </div>
                      )}

                      {upiProvider && requireReceiptPhoto && (
                        <div style={{ marginTop: '20px', borderTop: '1px solid var(--dark-border)', paddingTop: '16px' }}>
                          <p style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px' }}>
                            📷 Transaction Proof (Receipt Photo) <span style={{ color: '#ef4444' }}>*</span>
                          </p>

                          {!receiptPhoto ? (
                            <div style={{ display: 'flex', gap: '8px' }}>
                              <button
                                type="button"
                                onClick={() => document.getElementById('receipt-capture-input-mobile')?.click()}
                                style={{
                                  flex: 1, padding: '10px', background: 'var(--dark-surface)', border: '1px dashed var(--gold)',
                                  color: 'var(--gold)', fontFamily: 'var(--font-sans)', fontSize: '0.7rem', fontWeight: 700,
                                  cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px'
                                }}
                              >
                                Take / Upload Photo
                              </button>
                              <button
                                type="button"
                                onClick={handleSimulatePhoto}
                                style={{ padding: '10px', background: 'transparent', border: '1px solid var(--dark-border)', color: 'var(--text-secondary)', fontSize: '0.7rem', cursor: 'pointer' }}
                              >
                                Simulate
                              </button>
                              <input 
                                id="receipt-capture-input-mobile"
                                type="file" 
                                accept="image/*" 
                                capture="environment"
                                onChange={handlePhotoUpload}
                                style={{ display: 'none' }}
                              />
                            </div>
                          ) : (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'var(--dark-surface)', padding: '10px', border: '1px solid var(--dark-border)' }}>
                              <img src={receiptPhoto} alt="Receipt proof" style={{ width: '45px', height: '60px', objectFit: 'cover', border: '1px solid var(--dark-border-2)' }} />
                              <div style={{ flex: 1 }}>
                                <p style={{ fontSize: '0.72rem', color: '#10b981', fontWeight: 600, margin: 0 }}>Receipt Photo Captured</p>
                                <span style={{ fontSize: '0.55rem', color: 'var(--text-secondary)' }}>Ready for verification</span>
                              </div>
                              <button 
                                type="button"
                                onClick={() => setReceiptPhoto(null)}
                                style={{ background: 'transparent', border: 'none', color: '#ef4444', fontSize: '0.65rem', cursor: 'pointer', fontWeight: 'bold' }}
                              >
                                Delete
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {billPaymentMethod === 'cod' && (
                    <div>
                      <button 
                        onClick={() => {
                          setBillPaymentMethod(null);
                          setReceiptPhoto(null);
                        }}
                        style={{ background: 'transparent', border: 'none', color: 'var(--gold)', cursor: 'pointer', fontSize: '0.72rem', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '14px', padding: 0 }}
                      >
                        ← Back to payment methods
                      </button>
                      
                      <div style={{ background: 'rgba(16, 185, 129, 0.05)', border: '1px solid rgba(16, 185, 129, 0.2)', padding: '16px', textAlign: 'center' }}>
                        <span style={{ fontSize: '2rem' }}>💵</span>
                        <h3 style={{ fontSize: '0.9rem', color: 'var(--cream)', margin: '8px 0 4px 0', fontWeight: 700 }}>Counter Pay Selected</h3>
                        <p style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', margin: 0 }}>
                          Verify and accept cash at the counter before marking the order as paid.
                        </p>
                      </div>
                    </div>
                  )}

                </div>

                {/* Modal Footer */}
                <div style={{ padding: '16px 20px', borderTop: '1px solid var(--dark-border)', display: 'flex', flexDirection: 'column', gap: '10px', flexShrink: 0 }}>
                  <button
                    onClick={() => printThermalReceipt(order)}
                    style={{ width: '100%', padding: '10px', background: 'transparent', border: '1px solid var(--gold)', color: 'var(--gold)', fontFamily: 'var(--font-sans)', fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                  >
                    <ShoppingBag size={12} /> Print Receipt / Save PDF
                  </button>

                  <div style={{ display: 'flex', gap: '10px', width: '100%' }}>
                    <button
                      onClick={() => {
                        setShowBillModal(null);
                        setBillPaymentMethod(null);
                        setUpiProvider(null);
                        setReceiptPhoto(null);
                      }}
                      style={{ flex: 1, padding: '11px', background: 'transparent', border: '1px solid var(--dark-border)', color: 'var(--text-secondary)', fontFamily: 'var(--font-sans)', fontSize: '0.7rem', fontWeight: 600, cursor: 'pointer' }}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => markPaid(showBillModal!, billPaymentMethod || 'cod')}
                      disabled={!billPaymentMethod || (billPaymentMethod === 'upi' && requireReceiptPhoto && !receiptPhoto)}
                      style={{
                        flex: 1, padding: '11px', background: (billPaymentMethod && (billPaymentMethod !== 'upi' || !requireReceiptPhoto || receiptPhoto)) ? 'var(--gold)' : 'var(--dark-surface)',
                        border: 'none', color: (billPaymentMethod && (billPaymentMethod !== 'upi' || !requireReceiptPhoto || receiptPhoto)) ? 'var(--black)' : 'var(--text-muted)',
                        fontFamily: 'var(--font-sans)', fontSize: '0.7rem', fontWeight: 700,
                        letterSpacing: '0.08em', textTransform: 'uppercase',
                        cursor: (billPaymentMethod && (billPaymentMethod !== 'upi' || !requireReceiptPhoto || receiptPhoto)) ? 'pointer' : 'not-allowed',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px'
                      }}
                    >
                      <Check size={14} /> Place Order
                    </button>
                  </div>
                </div>

              </div>
            </div>
          );
        })()}

        {/* Portion Selection Modal (Mobile Viewport Rendering) */}
        {portionSelect && (() => {
          const item = portionSelect.item;
          const portions = item.portions || {
            small: { available: false, price: 0 },
            medium: { available: true, price: item.price },
            large: { available: false, price: 0 }
          };
          return (
            <div style={{
              position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 300,
              padding: '16px', backdropFilter: 'blur(4px)'
            }}>
              <div style={{
                background: 'var(--dark-card)', border: '1px solid var(--dark-border)',
                width: '100%', maxWidth: '380px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.15rem', color: 'var(--cream)', margin: 0 }}>
                    Select Portion Size
                  </h3>
                  <button
                    onClick={() => setPortionSelect(null)}
                    style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}
                  >
                    <X size={18} />
                  </button>
                </div>
                
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0 }}>
                  Choose the size for <strong style={{ color: 'var(--cream)' }}>{item.name}</strong>:
                </p>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '4px' }}>
                  {(['small', 'medium', 'large'] as const).map((size) => {
                    const config = portions[size];
                    if (!config?.available) return null;
                    return (
                      <button
                        key={size}
                        onClick={() => {
                          addItemWithPortion(item, size, config.price);
                          setPortionSelect(null);
                        }}
                        style={{
                          padding: '14px',
                          background: 'var(--dark-surface)',
                          border: '1px solid var(--dark-border)',
                          color: 'var(--cream)',
                          fontFamily: 'var(--font-sans)',
                          fontSize: '0.85rem',
                          fontWeight: 600,
                          textAlign: 'left',
                          cursor: 'pointer',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          textTransform: 'capitalize',
                          transition: 'all 0.2s',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.borderColor = 'var(--gold)';
                          e.currentTarget.style.background = 'rgba(197,168,92,0.05)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.borderColor = 'var(--dark-border)';
                          e.currentTarget.style.background = 'var(--dark-surface)';
                        }}
                      >
                        <span>{size} Portion</span>
                        <span style={{ color: 'var(--gold)' }}>₹{config.price}</span>
                      </button>
                    );
                  })}
                </div>
                
                <button
                  onClick={() => setPortionSelect(null)}
                  style={{
                    padding: '10px',
                    background: 'transparent',
                    border: '1px solid var(--dark-border)',
                    color: 'var(--text-secondary)',
                    fontFamily: 'var(--font-sans)',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    marginTop: '6px'
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          );
        })()}
      </div>
    );
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr 320px', gap: '0', height: 'calc(100vh - 124px)', overflow: 'hidden' }}>

      {/* ── LEFT: Table Grid ─────────────────────────────────────────── */}
      <div style={{ borderRight: '1px solid var(--dark-border)', overflowY: 'auto', padding: '20px 16px' }}>
        <p style={{ fontFamily: 'var(--font-sans)', fontSize: '0.58rem', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          Tables
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.55rem', color: isLive ? '#10b981' : '#f59e0b', fontWeight: 600 }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: isLive ? '#10b981' : '#f59e0b', display: 'inline-block', animation: isLive ? 'pulse 2s infinite' : 'none' }} />
            {isLive ? 'LIVE' : 'RECONNECTING'}
          </span>
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
          {TABLES.map((table) => {
            const order   = tableOrders.find((t) => t.tableNumber === table);
            const isOpen  = !!order;
            const isActive = activeTable === table;
            const statusColor = order?.status === 'billed' ? '#f59e0b' : order?.status === 'paid' ? '#10b981' : isOpen ? '#10b981' : 'var(--dark-border)';
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
                  {order.status === 'billed' ? 'BILLED' : order.status === 'paid' ? 'PAID' : `${order.items.reduce((s: number, i: CartItem) => s + i.qty, 0)} items`}
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
                {activeOrder.status === 'paid' && (
                  <div style={{ padding: '8px 12px', background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.2)', marginBottom: '4px', textAlign: 'center' }}>
                    <span style={{ fontSize: '0.7rem', color: '#10b981', fontWeight: 700, letterSpacing: '0.05em' }}>
                      ✓ PAID & SERVING
                    </span>
                  </div>
                )}

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
                ) : activeOrder.status === 'billed' ? (
                  <button
                    onClick={() => setShowBillModal(activeTable!)}
                    style={{
                      padding: '12px', background: 'var(--gold)',
                      border: 'none', color: 'var(--black)',
                      fontFamily: 'var(--font-sans)', fontSize: '0.72rem', fontWeight: 700,
                      letterSpacing: '0.12em', textTransform: 'uppercase', cursor: 'pointer',
                    }}
                  >
                    Checkout / Pay
                  </button>
                ) : (
                  <button
                    onClick={() => handleClearTable(activeTable!)}
                    style={{
                      padding: '12px', background: '#10b981',
                      border: 'none', color: 'var(--black)',
                      fontFamily: 'var(--font-sans)', fontSize: '0.72rem', fontWeight: 700,
                      letterSpacing: '0.12em', textTransform: 'uppercase', cursor: 'pointer',
                    }}
                  >
                    Complete & Clear Table
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
                  onClick={() => handleClearTable(activeTable!)}
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



        const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
          const file = e.target.files?.[0];
          if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
              setReceiptPhoto(reader.result as string);
              toast.success("Transaction receipt photo captured!");
            };
            reader.readAsDataURL(file);
          }
        };

        const handleSimulatePhoto = () => {
          // Generate a fake green transaction slip base64 mock
          setReceiptPhoto("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='150' height='200' viewBox='0 0 150 200'><rect width='100%' height='100%' fill='%2310b981'/><text x='15' y='40' fill='white' font-family='sans-serif' font-weight='bold' font-size='12'>TRANSACTION SLIP</text><text x='15' y='70' fill='white' font-family='sans-serif' font-size='10'>Amount: INR ${grandTotal}</text><text x='15' y='90' fill='white' font-family='sans-serif' font-size='10'>Status: SUCCESS</text><text x='15' y='110' fill='white' font-family='sans-serif' font-size='9'>Txn ID: 987654321098</text></svg>");
          toast.success("Simulated receipt photo loaded!");
        };

        return (
          <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
            <style>{`
              @keyframes laser-move {
                0%, 100% { transform: translateY(0); }
                50% { transform: translateY(180px); }
              }
              @keyframes pulse-light {
                0%, 100% { opacity: 0.3; }
                50% { opacity: 0.8; }
              }
            `}</style>
            <div style={{ background: 'var(--dark-card)', border: '1px solid var(--dark-border)', width: '100%', maxWidth: '440px', display: 'flex', flexDirection: 'column', maxHeight: '90vh' }}>
              
              {/* Modal Header */}
              <div style={{ padding: '18px 20px', borderBottom: '1px solid var(--dark-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
                <div>
                  <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.15rem', color: 'var(--cream)', margin: 0 }}>Checkout — {order.tableNumber}</h2>
                  <span style={{ fontSize: '0.62rem', color: 'var(--text-muted)' }}>PAY BEFORE FOOD SYSTEM</span>
                </div>
                <button 
                  onClick={() => {
                    setShowBillModal(null);
                    setBillPaymentMethod(null);
                    setUpiProvider(null);
                    setReceiptPhoto(null);
                  }} 
                  style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}
                >
                  <X size={18} />
                </button>
              </div>

              {/* Modal Body */}
              <div style={{ padding: '20px', overflowY: 'auto', flex: 1 }}>
                
                {/* ── Bill Summary (Collapsed) ── */}
                <div style={{ background: 'var(--dark-surface)', padding: '12px 16px', border: '1px solid var(--dark-border)', marginBottom: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                    <span>Table Subtotal:</span>
                    <span>₹{subtotal.toLocaleString('en-IN')}</span>
                  </div>
                  {calculatedAdditives.map((add) => (
                    <div key={add.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                      <span>{add.name}:</span>
                      <span>{add.calculatedValue < 0 ? '-' : ''}₹{Math.abs(add.calculatedValue)}</span>
                    </div>
                  ))}
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px dashed var(--dark-border)', marginTop: '8px', paddingTop: '8px' }}>
                    <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--cream)' }}>Grand Total:</span>
                    <span style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--gold)', fontFamily: 'var(--font-display)' }}>₹{grandTotal.toLocaleString('en-IN')}</span>
                  </div>
                </div>

                {/* ── STEP 1: Select Payment Method ── */}
                {!billPaymentMethod && (
                  <div>
                    <p style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '10px' }}>Select Payment Type</p>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                      <button
                        onClick={() => setBillPaymentMethod('cod')}
                        style={{
                          padding: '24px 16px', background: 'var(--dark-surface)', border: '1px solid var(--dark-border)',
                          color: 'var(--cream)', cursor: 'pointer', textAlign: 'center', transition: 'all 0.2s',
                          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px'
                        }}
                      >
                        <span style={{ fontSize: '1.8rem' }}>💵</span>
                        <span style={{ fontSize: '0.82rem', fontWeight: 700 }}>Cash at Counter</span>
                        <span style={{ fontSize: '0.58rem', color: 'var(--text-muted)' }}>Pay cash directly</span>
                      </button>

                      <button
                        onClick={() => setBillPaymentMethod('upi')}
                        style={{
                          padding: '24px 16px', background: 'var(--dark-surface)', border: '1px solid var(--dark-border)',
                          color: 'var(--cream)', cursor: 'pointer', textAlign: 'center', transition: 'all 0.2s',
                          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px'
                        }}
                      >
                        <span style={{ fontSize: '1.8rem' }}>📱</span>
                        <span style={{ fontSize: '0.82rem', fontWeight: 700 }}>Scan & Pay (UPI)</span>
                        <span style={{ fontSize: '0.58rem', color: 'var(--text-muted)' }}>Google Pay / PhonePe</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* ── STEP 2: UPI flow ── */}
                {billPaymentMethod === 'upi' && (
                  <div>
                    
                    {/* Back to payment type selector */}
                    <button 
                      onClick={() => {
                        setBillPaymentMethod(null);
                        setUpiProvider(null);
                        setReceiptPhoto(null);
                      }}
                      style={{ background: 'transparent', border: 'none', color: 'var(--gold)', cursor: 'pointer', fontSize: '0.72rem', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '14px', padding: 0 }}
                    >
                      ← Back to payment methods
                    </button>

                    {/* Select Provider */}
                    {!upiProvider && (
                      <div>
                        <p style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '10px' }}>Choose UPI Provider</p>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                          
                          <button
                            onClick={() => setUpiProvider('gpay')}
                            style={{
                              padding: '16px', background: 'var(--dark-surface)', border: '1px solid var(--dark-border)',
                              color: 'var(--cream)', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px'
                            }}
                          >
                            <span style={{ fontSize: '1.4rem' }}>📱</span>
                            <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>Google Pay</span>
                            <span style={{ fontSize: '0.55rem', color: 'var(--text-muted)' }}>Show Google Pay QR</span>
                          </button>

                          <button
                            onClick={() => setUpiProvider('phonepe')}
                            style={{
                              padding: '16px', background: 'var(--dark-surface)', border: '1px solid var(--dark-border)',
                              color: 'var(--cream)', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px'
                            }}
                          >
                            <span style={{ fontSize: '1.4rem' }}>🔳</span>
                            <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>PhonePe QR</span>
                            <span style={{ fontSize: '0.55rem', color: 'var(--text-muted)' }}>Show PhonePe QR</span>
                          </button>

                        </div>
                      </div>
                    )}

                    {/* Google Pay QR Code Display */}
                    {upiProvider === 'gpay' && (
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '10px' }}>
                        <div style={{ background: '#fff', padding: '10px', border: '4px solid #fff', display: 'inline-block' }}>
                          <img 
                            src="/gpay-qr.jpg" 
                            alt="Google Pay QR Code" 
                            style={{ width: '180px', height: 'auto', display: 'block' }}
                          />
                        </div>
                        <p style={{ fontSize: '0.62rem', color: 'var(--text-muted)', margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                          Show GPay QR to the customer to scan
                        </p>
                        <span style={{ fontSize: '0.62rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                          UPI ID: gpay-11251382996@okbizaxis
                        </span>
                      </div>
                    )}

                    {/* PhonePe QR Image Display */}
                    {upiProvider === 'phonepe' && (
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '10px' }}>
                        <div style={{ background: '#fff', padding: '10px', border: '4px solid #fff', display: 'inline-block' }}>
                          <img 
                            src="/phonepe-qr.jpg" 
                            alt="PhonePe Payment QR Code" 
                            style={{ width: '180px', height: 'auto', display: 'block' }}
                          />
                        </div>
                        <p style={{ fontSize: '0.62rem', color: 'var(--text-muted)', margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                          Show PhonePe QR code to the customer to scan
                        </p>
                      </div>
                    )}

                    {/* Transaction Photo Upload Section (Mandatory for UPI) */}
                    {upiProvider && requireReceiptPhoto && (
                      <div style={{ marginTop: '20px', borderTop: '1px solid var(--dark-border)', paddingTop: '16px' }}>
                        <p style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px' }}>
                          📷 Transaction Proof (Receipt Photo) <span style={{ color: '#ef4444' }}>*</span>
                        </p>

                        {!receiptPhoto ? (
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <button
                              type="button"
                              onClick={() => document.getElementById('receipt-capture-input')?.click()}
                              style={{
                                flex: 1, padding: '10px', background: 'var(--dark-surface)', border: '1px dashed var(--gold)',
                                color: 'var(--gold)', fontFamily: 'var(--font-sans)', fontSize: '0.7rem', fontWeight: 700,
                                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px'
                              }}
                            >
                              Take / Upload Photo
                            </button>
                            <button
                              type="button"
                              onClick={handleSimulatePhoto}
                              style={{ padding: '10px', background: 'transparent', border: '1px solid var(--dark-border)', color: 'var(--text-secondary)', fontSize: '0.7rem', cursor: 'pointer' }}
                            >
                              Simulate
                            </button>
                            <input 
                              id="receipt-capture-input"
                              type="file" 
                              accept="image/*" 
                              capture="environment" // direct environment rear camera trigger on mobile/tablets
                              onChange={handlePhotoUpload}
                              style={{ display: 'none' }}
                            />
                          </div>
                        ) : (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'var(--dark-surface)', padding: '10px', border: '1px solid var(--dark-border)' }}>
                            <img src={receiptPhoto} alt="Receipt proof" style={{ width: '45px', height: '60px', objectFit: 'cover', border: '1px solid var(--dark-border-2)' }} />
                            <div style={{ flex: 1 }}>
                              <p style={{ fontSize: '0.72rem', color: '#10b981', fontWeight: 600, margin: 0 }}>Receipt Photo Captured</p>
                              <span style={{ fontSize: '0.55rem', color: 'var(--text-secondary)' }}>Ready for verification</span>
                            </div>
                            <button 
                              type="button"
                              onClick={() => setReceiptPhoto(null)}
                              style={{ background: 'transparent', border: 'none', color: '#ef4444', fontSize: '0.65rem', cursor: 'pointer', fontWeight: 'bold' }}
                            >
                              Delete
                            </button>
                          </div>
                        )}

                      </div>
                    )}

                  </div>
                )}

                {/* ── STEP 2 (CASH): Cash at Counter flow ── */}
                {billPaymentMethod === 'cod' && (
                  <div>
                    <button 
                      onClick={() => {
                        setBillPaymentMethod(null);
                        setReceiptPhoto(null);
                      }}
                      style={{ background: 'transparent', border: 'none', color: 'var(--gold)', cursor: 'pointer', fontSize: '0.72rem', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '14px', padding: 0 }}
                    >
                      ← Back to payment methods
                    </button>
                    
                    <div style={{ background: 'rgba(16, 185, 129, 0.05)', border: '1px solid rgba(16, 185, 129, 0.2)', padding: '16px', textAlign: 'center' }}>
                      <span style={{ fontSize: '2rem' }}>💵</span>
                      <h3 style={{ fontSize: '0.9rem', color: 'var(--cream)', margin: '8px 0 4px 0', fontWeight: 700 }}>Counter Pay Selected</h3>
                      <p style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', margin: 0 }}>
                        Verify and accept cash at the counter before marking the order as paid.
                      </p>
                    </div>
                  </div>
                )}

              </div>

              {/* Modal Footer */}
              <div style={{ padding: '16px 20px', borderTop: '1px solid var(--dark-border)', display: 'flex', flexDirection: 'column', gap: '10px', flexShrink: 0 }}>
                
                <button
                  onClick={() => printThermalReceipt(order)}
                  style={{ width: '100%', padding: '10px', background: 'transparent', border: '1px solid var(--gold)', color: 'var(--gold)', fontFamily: 'var(--font-sans)', fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                >
                  <ShoppingBag size={12} /> Print Receipt / Save PDF
                </button>

                <div style={{ display: 'flex', gap: '10px', width: '100%' }}>
                  <button
                    onClick={() => {
                      setShowBillModal(null);
                      setBillPaymentMethod(null);
                      setUpiProvider(null);
                      setReceiptPhoto(null);
                    }}
                    style={{ flex: 1, padding: '11px', background: 'transparent', border: '1px solid var(--dark-border)', color: 'var(--text-secondary)', fontFamily: 'var(--font-sans)', fontSize: '0.7rem', fontWeight: 600, cursor: 'pointer' }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => markPaid(showBillModal!, billPaymentMethod || 'cod')}
                    // Disabled if paymentMethod is UPI and no receipt photo has been uploaded/captured
                    disabled={!billPaymentMethod || (billPaymentMethod === 'upi' && requireReceiptPhoto && !receiptPhoto)}
                    style={{
                      flex: 1, padding: '11px', background: (billPaymentMethod && (billPaymentMethod !== 'upi' || !requireReceiptPhoto || receiptPhoto)) ? 'var(--gold)' : 'var(--dark-surface)',
                      border: 'none', color: (billPaymentMethod && (billPaymentMethod !== 'upi' || !requireReceiptPhoto || receiptPhoto)) ? 'var(--black)' : 'var(--text-muted)',
                      fontFamily: 'var(--font-sans)', fontSize: '0.7rem', fontWeight: 700,
                      letterSpacing: '0.08em', textTransform: 'uppercase',
                      cursor: (billPaymentMethod && (billPaymentMethod !== 'upi' || !requireReceiptPhoto || receiptPhoto)) ? 'pointer' : 'not-allowed',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px'
                    }}
                  >
                    <Check size={14} /> Place Order
                  </button>
                </div>
              </div>

            </div>
          </div>
        );
      })()}

      {/* ── PORTION SELECTION MODAL ── */}
      {portionSelect && (() => {
        const item = portionSelect.item;
        const portions = item.portions || {
          small: { available: false, price: 0 },
          medium: { available: true, price: item.price },
          large: { available: false, price: 0 }
        };
        return (
          <div style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 300,
            padding: '16px', backdropFilter: 'blur(4px)'
          }}>
            <div style={{
              background: 'var(--dark-card)', border: '1px solid var(--dark-border)',
              width: '100%', maxWidth: '380px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.15rem', color: 'var(--cream)', margin: 0 }}>
                  Select Portion Size
                </h3>
                <button
                  onClick={() => setPortionSelect(null)}
                  style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}
                >
                  <X size={18} />
                </button>
              </div>
              
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0 }}>
                Choose the size for <strong style={{ color: 'var(--cream)' }}>{item.name}</strong>:
              </p>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '4px' }}>
                {(['small', 'medium', 'large'] as const).map((size) => {
                  const config = portions[size];
                  if (!config?.available) return null;
                  return (
                    <button
                      key={size}
                      onClick={() => {
                        addItemWithPortion(item, size, config.price);
                        setPortionSelect(null);
                      }}
                      style={{
                        padding: '14px',
                        background: 'var(--dark-surface)',
                        border: '1px solid var(--dark-border)',
                        color: 'var(--cream)',
                        fontFamily: 'var(--font-sans)',
                        fontSize: '0.85rem',
                        fontWeight: 600,
                        textAlign: 'left',
                        cursor: 'pointer',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        textTransform: 'capitalize',
                        transition: 'all 0.2s',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = 'var(--gold)';
                        e.currentTarget.style.background = 'rgba(197,168,92,0.05)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = 'var(--dark-border)';
                        e.currentTarget.style.background = 'var(--dark-surface)';
                      }}
                    >
                      <span>{size} Portion</span>
                      <span style={{ color: 'var(--gold)' }}>₹{config.price}</span>
                    </button>
                  );
                })}
              </div>
              
              <button
                onClick={() => setPortionSelect(null)}
                style={{
                  padding: '10px',
                  background: 'transparent',
                  border: '1px solid var(--dark-border)',
                  color: 'var(--text-secondary)',
                  fontFamily: 'var(--font-sans)',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  marginTop: '6px'
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
