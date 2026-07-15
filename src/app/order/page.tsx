'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRestaurantStore, useCMSStore, useIsMounted, Order } from '@/store/restaurantStore';
import { restaurantInfo as initialRestaurantInfo, chef as initialChef } from '@/data/restaurantData';
import { ShoppingBag, Copy, Check, ShieldAlert, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';
import Link from 'next/link';

// ─── Design tokens (cream / warm palette) ──────────────────────────────────
const C = {
  bg:          '#ede9e1',
  card:        '#ffffff',
  text:        '#1c1612',
  textMuted:   '#8a7f72',
  gold:        '#b8973f',
  goldDark:    '#9a7c30',
  inputBg:     '#f3efe8',
  border:      '#ddd6cc',
  btnPrimary:  '#1c1612',
  btnGold:     '#b8973f',
  stepActive:  '#b8973f',
  stepDone:    '#b8973f',
  stepInactive:'#ccc',
  confirmHero: '#1c1612',
};

const INPUT: React.CSSProperties = {
  width: '100%',
  padding: '14px 16px',
  background: C.inputBg,
  border: `1px solid ${C.border}`,
  borderRadius: '8px',
  color: C.text,
  fontFamily: 'var(--font-sans)',
  fontSize: '0.95rem',
  outline: 'none',
  boxSizing: 'border-box',
};

const LABEL: React.CSSProperties = {
  display: 'block',
  fontFamily: 'var(--font-sans)',
  fontSize: '0.62rem',
  fontWeight: 700,
  letterSpacing: '0.14em',
  textTransform: 'uppercase',
  color: C.textMuted,
  marginBottom: '6px',
};

// ── Step indicator component
function StepIndicator({ step, C }: { step: number; C: Record<string, string> }) {
  const steps = [{ n: 1, label: 'Review' }, { n: 2, label: 'Details' }, { n: 3, label: 'Payment' }];
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0', marginBottom: '36px' }}>
      {steps.map((s, idx) => {
        const active = step === s.n;
        const done   = step > s.n;
        return (
          <React.Fragment key={s.n}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '34px', height: '34px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: done ? C.gold : active ? C.text : 'transparent', border: `2px solid ${done || active ? (done ? C.gold : C.text) : C.border}`, color: done || active ? '#fff' : C.textMuted, fontSize: '0.82rem', fontWeight: 700, transition: 'all 0.3s', flexShrink: 0 }}>
                {done ? '✓' : s.n}
              </div>
              <span style={{ fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: active ? C.text : C.textMuted }}>
                {s.label}
              </span>
            </div>
            {idx < steps.length - 1 && (
              <div style={{ width: '32px', height: '1px', background: C.border, margin: '0 8px', flexShrink: 0 }} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

// ── Back button component
function BackBtn({ onClick, C }: { onClick: () => void; C: Record<string, string> }) {
  return (
    <button type="button" onClick={onClick} style={{ padding: '14px 24px', borderRadius: '50px', border: `1px solid ${C.border}`, background: 'transparent', color: C.text, fontFamily: 'var(--font-sans)', fontWeight: 600, fontSize: '0.78rem', cursor: 'pointer', letterSpacing: '0.04em', whiteSpace: 'nowrap' }}>
      ← Back
    </button>
  );
}

export default function OrderPage() {
  const storeCart          = useRestaurantStore((s) => s.cart);
  const user               = useRestaurantStore((s) => s.user);
  const login              = useRestaurantStore((s) => s.login);
  const orders             = useRestaurantStore((s) => s.orders);
  const placeOrder         = useRestaurantStore((s) => s.placeOrder);
  const setDeliveryAddress = useRestaurantStore((s) => s.setDeliveryAddress);
  const setOrderType       = useRestaurantStore((s) => s.setOrderType);
  const tableOrders        = useRestaurantStore((s) => s.tableOrders);
  const activeOrderId      = useRestaurantStore((s) => s.activeOrderId);
  const setActiveOrderId   = useRestaurantStore((s) => s.setActiveOrderId);
  const modifyOrderItems   = useRestaurantStore((s) => s.modifyOrderItems);
  const lockOrder          = useRestaurantStore((s) => s.lockOrder);

  const storeRestaurantInfo = useCMSStore((s) => s.restaurantInfo);
  const storeChef           = useCMSStore((s) => s.chef);
  const acceptingOrders     = useCMSStore((s) => s.acceptingOrders);
  const storeTables         = useCMSStore((s) => s.tables);
  const storeMenuItems      = useCMSStore((s) => s.menuItems);

  const isMounted = useIsMounted();

  const cart           = isMounted ? storeCart : { items: [], type: 'pickup' as const, address: { name: '', phone: '', email: '', flat: '', street: '', city: '' } };
  const restaurantInfo = isMounted ? storeRestaurantInfo : initialRestaurantInfo;
  const chef           = isMounted ? storeChef : initialChef;
  const menuItems      = isMounted ? storeMenuItems : [];

  // ── Wizard step ────────────────────────────────────────────────────────────
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // ── Form state ─────────────────────────────────────────────────────────────
  const [addressForm, setAddressForm] = useState({ name: '', phone: '', email: '', flat: '', street: '', city: '' });
  useEffect(() => {
    if (isMounted) {
      setAddressForm({
        name:   storeCart.address.name   || '',
        phone:  storeCart.address.phone  || '',
        email:  '',
        flat:   storeCart.address.flat   || '',
        street: storeCart.address.street || '',
        city:   storeCart.address.city   || '',
      });
    }
  }, [isMounted, storeCart.address]);

  useEffect(() => {
    if (isMounted && storeCart.type === 'delivery') {
      setOrderType('pickup');
    }
  }, [isMounted, storeCart.type, setOrderType]);

  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'cod' | 'card_on_delivery' | 'pay_later'>('upi');
  const [upiTxnId,   setUpiTxnId]   = useState('');
  const [copiedUpi,  setCopiedUpi]  = useState(false);
  const [selectedTable, setSelectedTable] = useState('Table 1');

  const currentOrder = orders.find(o => o.id === activeOrderId);

  // ── Modification timer ─────────────────────────────────────────────────────
  const [timerSeconds, setTimerSeconds] = useState(0);
  useEffect(() => {
    if (!activeOrderId || !currentOrder) { setTimerSeconds(0); return; }
    const calc = () => Math.max(0, 90 - Math.floor((Date.now() - new Date(currentOrder.createdAt).getTime()) / 1000));
    setTimerSeconds(calc());
    const iv = setInterval(() => { const r = calc(); setTimerSeconds(r); if (r <= 0) clearInterval(iv); }, 1000);
    return () => clearInterval(iv);
  }, [activeOrderId, currentOrder]);

  // ── Status polling ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (!activeOrderId || !currentOrder) return;
    if (currentOrder.status === 'delivered' || currentOrder.status === 'cancelled') return;
    const setOrders = useRestaurantStore.getState().setOrders;
    const poll = async () => {
      if (typeof document !== 'undefined' && document.visibilityState === 'hidden') return;
      try {
        const res = await fetch(`/api/orders?id=${activeOrderId}`);
        if (res.ok) {
          const u = await res.json();
          if (u?.status) setOrders((prev: Order[]) => prev.map(o => o.id === u.id ? { ...o, ...u } : o));
        }
      } catch { /* silent */ }
    };
    poll();
    const iv = setInterval(poll, 10000);
    const onVis = () => { if (document.visibilityState === 'visible') poll(); };
    document.addEventListener('visibilitychange', onVis);
    return () => { clearInterval(iv); document.removeEventListener('visibilitychange', onVis); };
  }, [activeOrderId, currentOrder?.status]);

  // ── Tables ─────────────────────────────────────────────────────────────────
  const occupiedTables  = tableOrders.filter(t => t.status === 'open' || t.status === 'billed').map(t => t.tableNumber);
  const allTables       = storeTables.map(t => `Table ${t.number}`);
  const availableTables = allTables.filter(t => !occupiedTables.includes(t));
  useEffect(() => {
    if (availableTables.length > 0 && !availableTables.includes(selectedTable)) setSelectedTable(availableTables[0]);
  }, [availableTables, selectedTable]);

  useEffect(() => { setPaymentMethod('upi'); setUpiTxnId(''); }, [cart.type]);

  // ── Handlers ───────────────────────────────────────────────────────────────
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setAddressForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const handleCopyUpi = () => {
    if (restaurantInfo?.paymentInfo?.upiId) {
      navigator.clipboard.writeText(restaurantInfo.paymentInfo.upiId);
      setCopiedUpi(true);
      toast.success('UPI ID copied!');
      setTimeout(() => setCopiedUpi(false), 2000);
    }
  };

  const handleStep2Continue = () => {
    if (!addressForm.name.trim() || !addressForm.phone.trim() || !addressForm.email.trim()) {
      toast.error('Please complete all contact details.'); return;
    }
    if (cart.type === 'dine-in' && availableTables.length === 0) {
      toast.error('No tables available. Please choose Pickup.'); return;
    }
    setStep(3);
  };

  const handlePlaceOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (paymentMethod === 'upi' && !upiTxnId.trim()) {
      toast.error('Please enter the UPI Transaction ID / UTR Number.'); return;
    }
    setDeliveryAddress({ name: addressForm.name, phone: addressForm.phone, email: addressForm.email, flat: addressForm.flat, street: addressForm.street, city: addressForm.city });
    const orderEmail = addressForm.email.trim().toLowerCase();
    if (!user && orderEmail !== 'thelondonshakessilchar@gmail.com' && orderEmail !== 'admin@thelondon.co.uk') {
      login(orderEmail, addressForm.name.trim(), addressForm.phone.trim());
    }
    const orderId = placeOrder(paymentMethod, paymentMethod === 'upi' ? upiTxnId.trim() : '', { type: cart.type, tableNumber: cart.type === 'dine-in' ? selectedTable : undefined, customerName: addressForm.name });
    setActiveOrderId(orderId);
    toast.success(paymentMethod === 'upi' ? 'Order submitted! Payment verification pending.' : 'Order placed successfully!');
  };

  // ── Subtotal ───────────────────────────────────────────────────────────────
  const subtotal = cart.items.reduce((s, i) => s + i.price * i.qty, 0);
  const deliveryFee = 0;
  const total = subtotal;

  // ── Payment methods list ───────────────────────────────────────────────────
  const paymentMethods = cart.type === 'dine-in'
    ? [{ key: 'upi', name: 'Scan & Pay (UPI)', emoji: '📱' }]
    : [{ key: 'upi', name: 'Scan & Pay (UPI)', emoji: '📱' }, { key: 'cod', name: 'Cash on Delivery', emoji: '💵' }];

  // ─────────────────────────────────────────────────────────────────────────
  // Shared wrapper style
  const wrapStyle: React.CSSProperties = { background: C.bg, minHeight: '100vh', paddingTop: '48px', paddingBottom: '80px', fontFamily: 'var(--font-sans)' };
  const containerStyle: React.CSSProperties = { maxWidth: '680px', margin: '0 auto', padding: '0 20px' };

  // ─────────────────────────────────────────────────────────────────────────
  // ORDER TRACKING / CONFIRMATION SCREEN
  // ─────────────────────────────────────────────────────────────────────────
  if (activeOrderId && currentOrder) {
    const statusSteps = [
      { key: 'confirmed',        label: 'Confirmed',   icon: '✓'  },
      { key: 'preparing',        label: 'Preparing',   icon: '⏰' },
      { key: 'out for delivery', label: currentOrder.type === 'dine-in' ? 'Serving' : currentOrder.type === 'pickup' ? 'Ready' : 'On the Way', icon: '✦' },
      { key: 'delivered',        label: currentOrder.type === 'dine-in' ? 'Served' : currentOrder.type === 'pickup' ? 'Collected' : 'Delivered', icon: '♡' },
    ];
    const statusOrder = ['confirmed', 'preparing', 'out for delivery', 'delivered'];
    const currentIdx  = statusOrder.indexOf(currentOrder.status === 'cancelled' ? '' : currentOrder.status);

    const orderDateStr = new Date(currentOrder.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
    const orderShortId = currentOrder.id.slice(-4).toUpperCase();

    return (
      <div style={{ background: '#f5f1ea', minHeight: '100vh', fontFamily: 'var(--font-sans)' }}>
        {/* ── Modification Panel (1.5-min window) */}
        {timerSeconds > 0 && (
          <div style={{ background: '#fff8e7', borderBottom: `1px solid ${C.border}`, padding: '12px 20px', textAlign: 'center', fontSize: '0.8rem', color: C.text }}>
            <strong>⏱ Edit window: {Math.floor(timerSeconds / 60)}m {timerSeconds % 60}s</strong>
            &nbsp;— You can still modify your order below.
          </div>
        )}

        {/* ── Hero confirmation banner */}
        <div style={{ background: C.confirmHero, color: '#fff', textAlign: 'center', padding: '48px 24px 40px' }}>
          <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: C.gold, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', fontSize: '1.6rem' }}>✓</div>
          <div style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', color: C.gold, fontSize: '1.4rem', marginBottom: '8px' }}>Thank you</div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.4rem,4vw,2rem)', fontWeight: 700, color: '#ffffff', marginBottom: '10px' }}>
            Order LS-{orderShortId} confirmed
          </h1>
          <div style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.55)' }}>
            Placed at {orderDateStr} · {currentOrder.type}
          </div>
        </div>

        {/* ── Body */}
        <div style={{ maxWidth: '640px', margin: '0 auto', padding: '0 20px 60px' }}>

          {/* Auto-login notice */}
          {!user && (
            <div style={{ background: C.inputBg, border: `1px solid ${C.border}`, borderRadius: '10px', padding: '14px 18px', marginTop: '24px', fontSize: '0.85rem', color: C.text, display: 'flex', gap: '10px', alignItems: 'center' }}>
              <span style={{ color: C.gold, fontSize: '1rem' }}>✦</span>
              An account has been created for <strong>{currentOrder.customerName}</strong> — you&apos;re now signed in and earning points.
            </div>
          )}

          {/* Live status bar */}
          <div style={{ marginTop: '28px', marginBottom: '8px' }}>
            <div style={{ fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: C.textMuted, marginBottom: '20px' }}>Live Status</div>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0' }}>
              {statusSteps.map((s, idx) => {
                const done    = idx <= currentIdx;
                const active  = idx === currentIdx;
                const isLast  = idx === statusSteps.length - 1;
                return (
                  <div key={s.key} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>
                    {/* connector line */}
                    {!isLast && (
                      <div style={{ position: 'absolute', top: '22px', left: '50%', width: '100%', height: '2px', background: done && !active ? C.gold : '#e0d9cf', zIndex: 0 }} />
                    )}
                    <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: done ? C.gold : C.card, border: `2px solid ${done ? C.gold : '#d0c8be'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem', zIndex: 1, color: done ? '#fff' : C.textMuted, transition: 'all 0.3s', boxShadow: active ? `0 0 0 4px rgba(184,151,63,0.2)` : 'none' }}>
                      {s.icon}
                    </div>
                    <div style={{ fontSize: '0.58rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: done ? C.text : C.textMuted, marginTop: '8px', textAlign: 'center' }}>
                      {s.label}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Modification panel */}
          {timerSeconds > 0 && (
            <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: '12px', padding: '20px', marginTop: '28px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <span style={{ fontWeight: 700, fontSize: '0.82rem', color: C.text }}>Modify Your Order</span>
                <span style={{ fontSize: '0.75rem', color: C.gold, fontWeight: 700 }}>⏱ {Math.floor(timerSeconds / 60)}m {timerSeconds % 60}s</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '14px' }}>
                {currentOrder.items.filter((i: any) => !i.isAdditive && i.id !== 'discount' && i.id !== 'tax-cgst' && i.id !== 'tax-sgst').map((item: any) => (
                  <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: C.inputBg, borderRadius: '8px' }}>
                    <span style={{ fontSize: '0.85rem', color: C.text }}>{item.name}</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <button onClick={() => { const u = currentOrder.items.map((i: any) => i.id === item.id ? { ...i, qty: i.qty - 1 } : i).filter((i: any) => i.qty > 0); modifyOrderItems(currentOrder.id, u, 'delete'); }} style={{ width: '26px', height: '26px', borderRadius: '50%', border: `1px solid ${C.border}`, background: C.card, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', color: C.text }}>−</button>
                      <span style={{ fontWeight: 700, fontSize: '0.85rem', color: C.text, minWidth: '16px', textAlign: 'center' }}>{item.qty}</span>
                      <button onClick={() => { const u = currentOrder.items.map((i: any) => i.id === item.id ? { ...i, qty: i.qty + 1 } : i); modifyOrderItems(currentOrder.id, u, 'add'); }} style={{ width: '26px', height: '26px', borderRadius: '50%', border: `1px solid ${C.border}`, background: C.card, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', color: C.text }}>+</button>
                    </div>
                  </div>
                ))}
              </div>
              <select value="" onChange={(e) => { const m = menuItems.find(m => m.id === e.target.value); if (m) { const ex = currentOrder.items.find((i: any) => i.id === m.id); const u = ex ? currentOrder.items.map((i: any) => i.id === m.id ? { ...i, qty: i.qty + 1 } : i) : [...currentOrder.items, { id: m.id, name: m.name, price: m.price, qty: 1, gradient: m.gradient, image: m.image }]; modifyOrderItems(currentOrder.id, u, 'add'); toast.success(`${m.name} added.`); } }} style={{ ...INPUT, marginBottom: '12px', fontSize: '0.82rem' }}>
                <option value="">+ Add a dish...</option>
                {menuItems.map(d => <option key={d.id} value={d.id}>{d.name} (₹{d.price})</option>)}
              </select>
              <button onClick={() => { lockOrder(currentOrder.id); toast.success('Order changes locked!'); }} style={{ width: '100%', padding: '11px', borderRadius: '8px', border: `1px solid ${C.gold}`, background: 'transparent', color: C.gold, fontFamily: 'var(--font-sans)', fontWeight: 700, fontSize: '0.72rem', letterSpacing: '0.1em', textTransform: 'uppercase', cursor: 'pointer' }}>
                Done Editing (Lock Order)
              </button>
            </div>
          )}

          {/* Divider */}
          <div style={{ borderTop: `1px solid ${C.border}`, margin: '28px 0 20px' }} />

          {/* Total Paid */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
            <span style={{ fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: C.textMuted }}>Total Paid</span>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', color: C.text }}>₹{currentOrder.total}</span>
          </div>

          {/* CTA */}
          <button
            onClick={() => setActiveOrderId(null)}
            style={{ width: '100%', padding: '16px', borderRadius: '50px', border: `1px solid ${C.gold}`, background: 'transparent', color: C.gold, fontFamily: 'var(--font-sans)', fontWeight: 700, fontSize: '0.72rem', letterSpacing: '0.14em', textTransform: 'uppercase', cursor: 'pointer' }}
          >
            Order Something Else
          </button>

          <div style={{ display: 'flex', justifyContent: 'center', marginTop: '16px' }}>
            <Link href="/account" style={{ fontSize: '0.75rem', color: C.textMuted, textDecoration: 'underline' }}>View in My Account</Link>
          </div>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  // MAIN CHECKOUT WIZARD
  // ─────────────────────────────────────────────────────────────────────────


  // ── Not accepting orders ───────────────────────────────────────────────────
  if (!acceptingOrders) {
    return (
      <div style={wrapStyle}>
        <div style={containerStyle}>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2.4rem,6vw,3.5rem)', textAlign: 'center', color: C.text, marginBottom: '40px', fontWeight: 400 }}>Checkout</h1>
          <div style={{ textAlign: 'center', padding: '80px 40px', background: C.card, borderRadius: '16px', border: `1px solid ${C.border}` }}>
            <ShieldAlert size={40} style={{ color: '#ef4444', marginBottom: '16px' }} />
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', color: C.text, marginBottom: '8px' }}>Ordering Paused</h2>
            <p style={{ color: C.textMuted, marginBottom: '12px' }}>We are not taking orders at this time please give the order from the counter !!</p>
            <p style={{ fontWeight: 'bold', color: '#ef4444', marginBottom: '28px', textTransform: 'uppercase', fontSize: '0.85rem', letterSpacing: '0.05em' }}>SORRY FOR THE INCONVINENCE</p>
            <Link href="/menu"><button style={{ padding: '14px 32px', borderRadius: '50px', background: C.btnPrimary, border: 'none', color: '#fff', fontFamily: 'var(--font-sans)', fontWeight: 700, fontSize: '0.78rem', letterSpacing: '0.1em', textTransform: 'uppercase', cursor: 'pointer' }}>Explore Menu</button></Link>
          </div>
        </div>
      </div>
    );
  }

  // ── Empty cart ─────────────────────────────────────────────────────────────
  if (cart.items.length === 0) {
    return (
      <div style={wrapStyle}>
        <div style={containerStyle}>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2.4rem,6vw,3.5rem)', textAlign: 'center', color: C.text, marginBottom: '40px', fontWeight: 400 }}>Checkout</h1>
          <div style={{ textAlign: 'center', padding: '80px 40px', background: C.card, borderRadius: '16px', border: `1px solid ${C.border}` }}>
            <ShoppingBag size={40} style={{ color: C.textMuted, marginBottom: '16px' }} />
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', color: C.text, marginBottom: '8px' }}>Your Cart is Empty</h2>
            <p style={{ color: C.textMuted, marginBottom: '28px' }}>Explore our gourmet shakes, burgers, and waffles before checking out.</p>
            <Link href="/menu"><button style={{ padding: '14px 32px', borderRadius: '50px', background: C.btnPrimary, border: 'none', color: '#fff', fontFamily: 'var(--font-sans)', fontWeight: 700, fontSize: '0.78rem', letterSpacing: '0.1em', textTransform: 'uppercase', cursor: 'pointer' }}>Explore Menu</button></Link>
          </div>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div style={wrapStyle}>
      <div style={containerStyle}>

        {/* ── Heading */}
        <div style={{ textAlign: 'center', marginBottom: '8px' }}>
          <div style={{ fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: C.gold, marginBottom: '10px' }}>Order Online</div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2.8rem,6vw,4rem)', fontWeight: 400, color: C.text, margin: 0, lineHeight: 1.1 }}>Checkout</h1>
        </div>

        {/* ── Step indicator */}
        <div style={{ padding: '28px 0 4px' }}>
          <StepIndicator step={step} C={C} />
        </div>

        {/* ── Card */}
        <div style={{ background: C.card, borderRadius: '16px', border: `1px solid ${C.border}`, padding: 'clamp(24px,5vw,40px)', boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }}>

          <AnimatePresence mode="wait">
          {/* ════════════════════════════════════════
              STEP 1 — Review your cart
          ════════════════════════════════════════ */}
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -24 }}
              transition={{ duration: 0.35, ease: [0.19, 1, 0.22, 1] }}
            >
              {cart.items.map((item, idx) => (
                <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: '14px', paddingTop: idx === 0 ? 0 : '16px', marginTop: idx === 0 ? 0 : '16px', borderTop: idx === 0 ? 'none' : `1px solid ${C.border}` }}>
                  {/* Item image or gradient placeholder */}
                  <div style={{ width: '56px', height: '56px', borderRadius: '8px', overflow: 'hidden', background: '#e8e0d4', flexShrink: 0 }}>
                    {item.image
                      ? <img src={item.image} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem' }}>🍽️</div>
                    }
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: '0.95rem', color: C.text }}>{item.name}</div>
                    <div style={{ fontSize: '0.8rem', color: C.textMuted, marginTop: '2px' }}>₹{item.price} × {item.qty}</div>
                  </div>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.05rem', color: C.text, fontWeight: 500, whiteSpace: 'nowrap' }}>
                    ₹{item.price * item.qty}
                  </div>
                </div>
              ))}

              <div style={{ borderTop: `1px solid ${C.border}`, marginTop: '24px', paddingTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: C.textMuted }}>
                  Subtotal · {cart.items.reduce((s, i) => s + i.qty, 0)} items
                </span>
                <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', color: C.text }}>₹{total}</span>
              </div>

              <motion.button
                whileHover={{ scale: 1.015 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setStep(2)}
                style={{ width: '100%', marginTop: '28px', padding: '16px', borderRadius: '50px', background: C.btnPrimary, border: 'none', color: '#fff', fontFamily: 'var(--font-sans)', fontWeight: 700, fontSize: '0.78rem', letterSpacing: '0.14em', textTransform: 'uppercase', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
              >
                Continue <ChevronRight size={15} />
              </motion.button>
            </motion.div>
          )}

          {/* ════════════════════════════════════════
              STEP 2 — Delivery details
          ════════════════════════════════════════ */}
          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -24 }}
              transition={{ duration: 0.35, ease: [0.19, 1, 0.22, 1] }}
            >
              {/* Order type selector */}
              <div style={{ marginBottom: '28px' }}>
                <label style={LABEL}>How would you like it?</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: '10px', marginTop: '8px' }}>
                  {[
                    { key: 'pickup',   label: 'Pickup',   emoji: '🥡' },
                    // { key: 'delivery', label: 'Delivery', emoji: '🛵' }, // Hidden/Deleted for now
                    { key: 'dine-in',  label: 'Dine-in',  emoji: '🍽️' },
                  ].map(t => (
                    <motion.button
                      key={t.key}
                      type="button"
                      whileHover={{ y: -2 }}
                      whileTap={{ scale: 0.96 }}
                      onClick={() => setOrderType(t.key as 'pickup' | 'delivery' | 'dine-in')}
                      style={{ padding: '18px 10px', borderRadius: '10px', border: `1.5px solid ${cart.type === t.key ? C.gold : C.border}`, background: cart.type === t.key ? '#fdf8ed' : C.card, cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', transition: 'border-color 0.2s, background 0.2s' }}
                    >
                      <span style={{ fontSize: '1.5rem' }}>{t.emoji}</span>
                      <span style={{ fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: cart.type === t.key ? C.gold : C.textMuted }}>{t.label}</span>
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Name + Phone */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
                <div>
                  <label style={LABEL}>Name</label>
                  <input name="name" required value={addressForm.name} onChange={handleInputChange} placeholder="Your name" style={INPUT} />
                </div>
                <div>
                  <label style={LABEL}>Phone</label>
                  <input name="phone" type="tel" required value={addressForm.phone} onChange={handleInputChange} placeholder="+91" style={INPUT} />
                </div>
              </div>

              {/* Email */}
              <div style={{ marginBottom: '14px' }}>
                <label style={LABEL}>Email</label>
                <input name="email" type="email" required value={addressForm.email} onChange={handleInputChange} placeholder="you@email.com" style={INPUT} />
              </div>

              {/* Dine-in table picker */}
              {cart.type === 'dine-in' && (
                <div style={{ marginBottom: '14px' }}>
                  <label style={LABEL}>Select Table</label>
                  {availableTables.length > 0 ? (
                    <select value={selectedTable} onChange={e => setSelectedTable(e.target.value)} style={{ ...INPUT, appearance: 'auto', cursor: 'pointer' }}>
                      {availableTables.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  ) : (
                    <div style={{ padding: '14px 16px', borderRadius: '8px', background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)', color: '#ef4444', fontSize: '0.82rem' }}>
                      ⚠️ All tables occupied — please choose Pickup.
                    </div>
                  )}
                </div>
              )}

              {/* Buttons */}
              <div style={{ display: 'flex', gap: '12px', marginTop: '28px' }}>
                <BackBtn onClick={() => setStep(1)} C={C} />
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.015 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={handleStep2Continue}
                  style={{ flex: 1, padding: '16px', borderRadius: '50px', background: C.btnPrimary, border: 'none', color: '#fff', fontFamily: 'var(--font-sans)', fontWeight: 700, fontSize: '0.78rem', letterSpacing: '0.12em', textTransform: 'uppercase', cursor: 'pointer' }}
                >
                  Continue to Payment →
                </motion.button>
              </div>
            </motion.div>
          )}

          {/* ════════════════════════════════════════
              STEP 3 — Payment
          ════════════════════════════════════════ */}
          {step === 3 && (
            <motion.form
              key="step3"
              onSubmit={handlePlaceOrder}
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -24 }}
              transition={{ duration: 0.35, ease: [0.19, 1, 0.22, 1] }}
            >
              {/* Payment method tabs */}
              <div style={{ marginBottom: '24px' }}>
                <label style={LABEL}>Payment Method</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '8px' }}>
                  {paymentMethods.map(m => (
                    <motion.button
                      key={m.key}
                      type="button"
                      whileHover={{ x: 3 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setPaymentMethod(m.key as 'upi' | 'cod' | 'card_on_delivery' | 'pay_later')}
                      style={{ padding: '14px 18px', borderRadius: '10px', border: `1.5px solid ${paymentMethod === m.key ? C.gold : C.border}`, background: paymentMethod === m.key ? '#fdf8ed' : C.inputBg, cursor: 'pointer', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '12px', transition: 'border-color 0.2s, background 0.2s' }}
                    >
                      <span style={{ fontSize: '1.2rem' }}>{m.emoji}</span>
                      <span style={{ fontWeight: 600, fontSize: '0.88rem', color: paymentMethod === m.key ? C.gold : C.text }}>{m.name}</span>
                      {paymentMethod === m.key && <span style={{ marginLeft: 'auto', fontSize: '0.7rem', color: C.gold }}>✓</span>}
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* UPI Details */}
              {paymentMethod === 'upi' && (
                <div style={{ background: C.inputBg, border: `1px solid ${C.border}`, borderRadius: '12px', padding: '20px', marginBottom: '20px' }}>
                  <div style={{ fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: C.textMuted, marginBottom: '16px' }}>Scan to Transfer</div>

                  <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start', flexWrap: 'wrap', marginBottom: '20px' }}>
                    {/* QR Code */}
                    <div style={{ width: '120px', height: '120px', background: '#fff', border: `1px solid ${C.border}`, borderRadius: '10px', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      {restaurantInfo.paymentInfo?.qrCodeImage
                        ? <img src={restaurantInfo.paymentInfo.qrCodeImage} alt="QR" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                        : <span style={{ fontSize: '2.5rem' }}>📱</span>
                      }
                    </div>
                    {/* Details */}
                    <div style={{ flex: 1, minWidth: '160px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      <div>
                        <div style={{ ...LABEL, marginBottom: '2px' }}>Payee</div>
                        <div style={{ fontWeight: 600, fontSize: '0.9rem', color: C.text }}>{restaurantInfo.paymentInfo?.accountHolder || 'The London Shakes'}</div>
                      </div>
                      <div>
                        <div style={{ ...LABEL, marginBottom: '2px' }}>UPI ID</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontFamily: 'monospace', fontSize: '0.88rem', color: C.gold, fontWeight: 600 }}>{restaurantInfo.paymentInfo?.upiId || '9706388102@ybl'}</span>
                          <button type="button" onClick={handleCopyUpi} style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.textMuted, padding: '2px' }}>
                            {copiedUpi ? <Check size={13} style={{ color: '#10b981' }} /> : <Copy size={13} />}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Instructions */}
                  <p style={{ fontSize: '0.78rem', color: C.textMuted, fontStyle: 'italic', lineHeight: 1.5, marginBottom: '16px' }}>
                    {restaurantInfo.paymentInfo?.instructions || 'Scan the QR or use UPI ID to pay, then paste your transaction ID below.'}
                  </p>

                  {/* UTR Input */}
                  <div>
                    <label style={{ ...LABEL, color: C.gold }}>UTR / Transaction ID</label>
                    <input type="text" required={paymentMethod === 'upi'} value={upiTxnId} onChange={e => setUpiTxnId(e.target.value)} placeholder="12-digit reference" style={{ ...INPUT, fontFamily: 'monospace', marginTop: '4px' }} />
                  </div>
                </div>
              )}

              {/* Bank details fallback */}
              {paymentMethod === 'upi' && restaurantInfo.paymentInfo?.bankName && restaurantInfo.paymentInfo?.accountNumber && (
                <div style={{ background: C.inputBg, border: `1px solid ${C.border}`, borderRadius: '10px', padding: '14px 16px', fontSize: '0.78rem', color: C.textMuted, marginBottom: '20px', lineHeight: 1.6 }}>
                  <div style={{ ...LABEL, marginBottom: '6px' }}>Bank Transfer Alternative</div>
                  <strong>Bank:</strong> {restaurantInfo.paymentInfo.bankName} &nbsp;·&nbsp; <strong>A/c:</strong> {restaurantInfo.paymentInfo.accountNumber} &nbsp;·&nbsp; <strong>IFSC:</strong> {restaurantInfo.paymentInfo.ifscCode}
                </div>
              )}

              {/* Divider + Amount */}
              <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <span style={{ fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: C.textMuted }}>Amount</span>
                <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', color: C.text }}>₹{total}</span>
              </div>

              {/* Buttons */}
              <div style={{ display: 'flex', gap: '12px' }}>
                <BackBtn onClick={() => setStep(2)} C={C} />
                <motion.button
                  type="submit"
                  whileHover={cart.type === 'dine-in' && availableTables.length === 0 ? undefined : { scale: 1.015 }}
                  whileTap={cart.type === 'dine-in' && availableTables.length === 0 ? undefined : { scale: 0.97 }}
                  disabled={cart.type === 'dine-in' && availableTables.length === 0}
                  style={{ flex: 1, padding: '16px', borderRadius: '50px', background: C.gold, border: 'none', color: '#fff', fontFamily: 'var(--font-sans)', fontWeight: 700, fontSize: '0.82rem', letterSpacing: '0.1em', textTransform: 'uppercase', cursor: cart.type === 'dine-in' && availableTables.length === 0 ? 'not-allowed' : 'pointer', opacity: cart.type === 'dine-in' && availableTables.length === 0 ? 0.5 : 1 }}
                >
                  {cart.type === 'dine-in' && availableTables.length === 0 ? 'No Tables Available' : `Place Order · ₹${total}`}
                </motion.button>
              </div>

              {!user && (
                <p style={{ fontSize: '0.72rem', color: C.textMuted, textAlign: 'center', marginTop: '14px', fontStyle: 'italic' }}>
                  * Entering your details signs you in automatically.
                </p>
              )}
            </motion.form>
          )}
          </AnimatePresence>
        </div>

      </div>
    </div>
  );
}
