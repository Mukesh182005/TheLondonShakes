'use client';

import React, { useState, useEffect } from 'react';
import { useRestaurantStore, useCMSStore, useIsMounted } from '@/store/restaurantStore';
import { restaurantInfo as initialRestaurantInfo, chef as initialChef } from '@/data/restaurantData';
import { ShoppingBag, ShieldCheck, Clock, Copy, Check, ShieldAlert } from 'lucide-react';
import toast from 'react-hot-toast';
import Link from 'next/link';

export default function OrderPage() {
  const storeCart = useRestaurantStore((state) => state.cart);
  const orders = useRestaurantStore((state) => state.orders);
  const placeOrder = useRestaurantStore((state) => state.placeOrder);
  const setDeliveryAddress = useRestaurantStore((state) => state.setDeliveryAddress);
  const setOrderType = useRestaurantStore((state) => state.setOrderType);
  const tableOrders = useRestaurantStore((state) => state.tableOrders);
  const storeRestaurantInfo = useCMSStore((state) => state.restaurantInfo);
  const storeChef = useCMSStore((state) => state.chef);
  const acceptingOrders = useCMSStore((state) => state.acceptingOrders);
  const storeTables = useCMSStore((state) => state.tables);
  const storeMenuItems = useCMSStore((state) => state.menuItems);

  const isMounted = useIsMounted();

  const cart = isMounted ? storeCart : { items: [], type: 'pickup' as const, address: { name: '', phone: '', email: '', flat: '', street: '', city: '' } };
  const restaurantInfo = isMounted ? storeRestaurantInfo : initialRestaurantInfo;
  const chef = isMounted ? storeChef : initialChef;
  const menuItems = isMounted ? storeMenuItems : [];

  // Form states
  const [addressForm, setAddressForm] = useState({
    name: '',
    phone: '',
    email: '',
    flat: '',
    street: '',
    city: '',
  });

  // Sync form address once client store is hydrated
  useEffect(() => {
    if (isMounted) {
      setAddressForm({
        name: storeCart.address.name || '',
        phone: storeCart.address.phone || '',
        email: '',
        flat: storeCart.address.flat || '',
        street: storeCart.address.street || '',
        city: storeCart.address.city || '',
      });
    }
  }, [isMounted, storeCart.address]);
  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'cod' | 'card_on_delivery' | 'pay_later'>('upi');
  const [upiTxnId, setUpiTxnId] = useState('');
  const [copiedUpi, setCopiedUpi] = useState(false);
  const activeOrderId = useRestaurantStore((s) => s.activeOrderId);
  const setActiveOrderId = useRestaurantStore((s) => s.setActiveOrderId);
  const modifyOrderItems = useRestaurantStore((s) => s.modifyOrderItems);
  const lockOrder = useRestaurantStore((s) => s.lockOrder);
  const [selectedTable, setSelectedTable] = useState('Table 1');
  const currentOrder = orders.find(o => o.id === activeOrderId);

  const [timerSeconds, setTimerSeconds] = useState(0);

  useEffect(() => {
    if (!activeOrderId || !currentOrder) {
      setTimerSeconds(0);
      return;
    }
    
    const calculateRemaining = () => {
      const elapsed = Math.floor((Date.now() - new Date(currentOrder.createdAt).getTime()) / 1000);
      return Math.max(0, 90 - elapsed);
    };

    setTimerSeconds(calculateRemaining());

    const interval = setInterval(() => {
      const rem = calculateRemaining();
      setTimerSeconds(rem);
      if (rem <= 0) {
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [activeOrderId, currentOrder]);

  const occupiedTables = tableOrders
    .filter(t => t.status === 'open' || t.status === 'billed')
    .map(t => t.tableNumber);

  const allTables = storeTables.map((t) => `Table ${t.number}`);
  const availableTables = allTables.filter(tbl => !occupiedTables.includes(tbl));

  // Set default selected table once availableTables is computed
  useEffect(() => {
    if (availableTables.length > 0 && !availableTables.includes(selectedTable)) {
      setSelectedTable(availableTables[0]);
    }
  }, [availableTables, selectedTable]);

  useEffect(() => {
    setPaymentMethod('upi');
    setUpiTxnId('');
  }, [cart.type]);


  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAddressForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleCopyUpi = () => {
    if (restaurantInfo?.paymentInfo?.upiId) {
      navigator.clipboard.writeText(restaurantInfo.paymentInfo.upiId);
      setCopiedUpi(true);
      toast.success('UPI ID copied to clipboard!');
      setTimeout(() => setCopiedUpi(false), 2000);
    }
  };

  const handlePlaceOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.items.length === 0) {
      toast.error('Your dining cart is empty.');
      return;
    }
    if (cart.type === 'delivery' && (!addressForm.flat || !addressForm.street || !addressForm.city)) {
      toast.error('Please complete your delivery address.');
      return;
    }
    if (!addressForm.name || !addressForm.phone || !addressForm.email) {
      toast.error('Please complete all contact details.');
      return;
    }
    if (paymentMethod === 'upi' && !upiTxnId.trim()) {
      toast.error('Please enter the UPI Transaction ID / UTR Number.');
      return;
    }

    // Save address in store
    setDeliveryAddress({
      name: addressForm.name,
      phone: addressForm.phone,
      email: addressForm.email,
      flat: addressForm.flat,
      street: addressForm.street,
      city: addressForm.city,
    });

    // Place the order
    const orderId = placeOrder(
      paymentMethod,
      paymentMethod === 'upi' ? upiTxnId.trim() : '',
      {
        type: cart.type,
        tableNumber: cart.type === 'dine-in' ? selectedTable : undefined,
        customerName: addressForm.name,
      }
    );
    setActiveOrderId(orderId);
    toast.success(paymentMethod === 'upi' ? 'Order submitted! Payment verification pending.' : 'Order placed successfully!');
  };

  // If tracking active order
  if (activeOrderId && currentOrder) {
    const steps = [
      { key: 'preparing', label: 'Preparing', desc: `Chef ${chef.name} is crafting your gourmet shakes and café dishes.` },
      { 
        key: 'out for delivery', 
        label: currentOrder.type === 'delivery' 
          ? 'Out for Delivery' 
          : currentOrder.type === 'dine-in' 
            ? 'Serving' 
            : 'Ready for Pickup', 
        desc: currentOrder.type === 'delivery' 
          ? 'Courier is in transit.' 
          : currentOrder.type === 'dine-in' 
            ? 'Our waiter is bringing it to your table.' 
            : 'Visit exchange lobby.' 
      },
      { 
        key: 'delivered', 
        label: currentOrder.type === 'delivery' 
          ? 'Delivered' 
          : currentOrder.type === 'dine-in' 
            ? 'Served' 
            : 'Collected', 
        desc: 'Enjoy your gourmet café experience.' 
      }
    ];

    const getStepStatusStyle = (stepKey: string) => {
      const currentStatus = currentOrder.status;
      if (currentStatus === 'cancelled') return { color: 'var(--crimson)', fontWeight: 600 };
      if (currentStatus === stepKey) return { color: 'var(--gold)', fontWeight: 700 };
      
      const statusOrder = ['preparing', 'out for delivery', 'delivered'];
      const currentIdx = statusOrder.indexOf(currentStatus);
      const stepIdx = statusOrder.indexOf(stepKey);

      if (stepIdx < currentIdx) return { color: 'var(--green)', fontWeight: 600 }; // Completed steps
      return { color: 'var(--text-muted)' }; // Future steps
    };

    return (
      <div className="page-wrapper" style={{ background: 'var(--black)', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', padding: '40px 20px' }}>
        <div style={{ background: 'var(--dark-card)', border: '1px solid var(--dark-border-2)', padding: '48px 36px', maxWidth: '600px', width: '100%', textAlign: 'center', boxShadow: '0 20px 40px rgba(0,0,0,0.05)', position: 'relative' }}>
          <div style={{ width: '80px', height: '80px', background: 'var(--gold-glow)', border: '2px solid var(--gold)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
            <Clock size={32} className="animate-spin-slow" color="var(--gold)" />
          </div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '2.2rem', color: 'var(--cream)', marginBottom: '4px' }}>
            Order Tracking Loop
          </h2>
          <div style={{ fontFamily: 'var(--font-sans)', color: 'var(--text-secondary)', fontSize: '0.8rem', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '24px' }}>
            ORDER ID: #{currentOrder.id}
          </div>
          {/* Real-time Order Modification Panel */}
          {timerSeconds > 0 && (
            <div style={{ background: 'var(--dark-surface)', border: '1px solid var(--dark-border-2)', padding: '24px', marginBottom: '24px', textAlign: 'left' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <h5 style={{ fontFamily: 'var(--font-sans)', fontSize: '0.72rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--gold)', margin: 0, fontWeight: 700 }}>
                  Modify Your Order
                </h5>
                <span style={{ fontSize: '0.72rem', color: 'var(--cream)', fontWeight: 700, letterSpacing: '0.05em' }}>
                  ⏱️ LOCK IN: {Math.floor(timerSeconds / 60)}m {timerSeconds % 60}s
                </span>
              </div>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '16px', lineHeight: 1.5 }}>
                You can add more dishes or delete items from your order within 1.5 minutes of placing it. Changes will update the kitchen instantly.
              </p>

              {/* Items List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
                {currentOrder.items.map((item) => (
                  <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', background: 'var(--charcoal)', border: '1px solid var(--dark-border)' }}>
                    <span style={{ fontSize: '0.82rem', color: 'var(--cream)', fontWeight: 500 }}>{item.name}</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <button
                        onClick={() => {
                          const updated = currentOrder.items.map(i => i.id === item.id ? { ...i, qty: i.qty - 1 } : i).filter(i => i.qty > 0);
                          modifyOrderItems(currentOrder.id, updated, 'delete');
                          toast.success(`${item.name} quantity reduced.`);
                        }}
                        style={{ width: '22px', height: '22px', background: 'var(--dark-card)', border: '1px solid var(--dark-border)', color: 'var(--cream)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px' }}
                      >
                        −
                      </button>
                      <span style={{ fontSize: '0.82rem', color: 'var(--cream)', fontWeight: 700, minWidth: '16px', textAlign: 'center' }}>{item.qty}</span>
                      <button
                        onClick={() => {
                          const updated = currentOrder.items.map(i => i.id === item.id ? { ...i, qty: i.qty + 1 } : i);
                          modifyOrderItems(currentOrder.id, updated, 'add');
                          toast.success(`Increased ${item.name} quantity.`);
                        }}
                        style={{ width: '22px', height: '22px', background: 'var(--dark-card)', border: '1px solid var(--dark-border)', color: 'var(--cream)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px' }}
                      >
                        +
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Add New Dishes Selector */}
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '0.62rem', color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '6px', fontWeight: 600 }}>+ Add Another Dish</label>
                <select
                  value=""
                  onChange={(e) => {
                    const dishId = e.target.value;
                    if (!dishId) return;
                    const menuItem = menuItems.find(m => m.id === dishId);
                    if (menuItem) {
                      const existing = currentOrder.items.find(i => i.id === dishId);
                      let updated;
                      if (existing) {
                        updated = currentOrder.items.map(i => i.id === dishId ? { ...i, qty: i.qty + 1 } : i);
                      } else {
                        updated = [...currentOrder.items, { id: menuItem.id, name: menuItem.name, price: menuItem.price, qty: 1, gradient: menuItem.gradient, image: menuItem.image }];
                      }
                      modifyOrderItems(currentOrder.id, updated, 'add');
                      toast.success(`${menuItem.name} added to your order.`);
                    }
                  }}
                  style={{ width: '100%', padding: '8px 10px', background: 'var(--black)', border: '1px solid var(--dark-border-2)', color: 'var(--cream)', fontSize: '0.78rem', borderRadius: 0, outline: 'none' }}
                >
                  <option value="">Select dish to add...</option>
                  {menuItems.map((dish) => (
                    <option key={dish.id} value={dish.id}>
                      {dish.name} (₹{dish.price})
                    </option>
                  ))}
                </select>
              </div>

              {/* Done Editing Lock Button */}
              <div style={{ borderTop: '1px solid var(--dark-border)', paddingTop: '12px' }}>
                <button
                  type="button"
                  onClick={() => {
                    lockOrder(currentOrder.id);
                    toast.success('Your order changes have been finalized!');
                  }}
                  className="btn-gold"
                  style={{ width: '100%', fontSize: '0.7rem', letterSpacing: '0.1em', textTransform: 'uppercase', padding: '10px 0', cursor: 'pointer' }}
                >
                  <span>Done Editing (Lock Order)</span>
                </button>
              </div>
            </div>
          )}

          {/* Payment Status Summary Card */}
          <div style={{ background: 'var(--dark-surface)', border: '1px solid var(--dark-border-2)', padding: '20px', marginBottom: '32px', textAlign: 'left' }}>
            <h5 style={{ fontFamily: 'var(--font-sans)', fontSize: '0.68rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: '12px', fontWeight: 700 }}>
              Order & Payment Verification
            </h5>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.78rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Payment Method:</span>
                <span style={{ color: 'var(--cream)', fontWeight: 600 }}>
                  {currentOrder.paymentMethod === 'upi' ? 'UPI Scan & Transfer' : currentOrder.paymentMethod === 'pay_later' ? 'Pay After Food' : currentOrder.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Card on Delivery'}
                </span>
              </div>
              {currentOrder.paymentMethod === 'upi' && (
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>UPI Txn / UTR ID:</span>
                  <span style={{ color: 'var(--cream)', fontFamily: 'monospace' }}>{currentOrder.upiTxnId}</span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '8px', borderTop: '1px solid var(--dark-border)', marginTop: '4px' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Status:</span>
                <span 
                  style={{ 
                    fontSize: '0.65rem',
                    padding: '2px 8px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    fontWeight: 700,
                    background: currentOrder.paymentStatus === 'paid' ? 'rgba(31,84,60,0.1)' : currentOrder.paymentStatus === 'pending_verification' ? 'rgba(245,158,11,0.1)' : 'rgba(143,29,47,0.1)',
                    color: currentOrder.paymentStatus === 'paid' ? 'var(--green)' : currentOrder.paymentStatus === 'pending_verification' ? '#f59e0b' : 'var(--crimson)',
                    border: `1px solid ${currentOrder.paymentStatus === 'paid' ? 'rgba(31,84,60,0.3)' : currentOrder.paymentStatus === 'pending_verification' ? 'rgba(245,158,11,0.3)' : 'rgba(143,29,47,0.3)'}`
                  }}
                >
                  {currentOrder.paymentStatus.replace('_', ' ')}
                </span>
              </div>
            </div>
          </div>

          {/* Realtime Socket Simulation Progress Bar */}
          <div style={{ background: 'var(--dark-surface)', border: '1px solid var(--dark-border-2)', padding: '32px', textAlign: 'left', marginBottom: '32px' }}>
            <h4 style={{ fontFamily: 'var(--font-sans)', fontSize: '0.75rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: '24px', fontWeight: 700 }}>
              Order Status Pipeline
            </h4>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', position: 'relative' }}>
              {/* Connecting line */}
              <div style={{ position: 'absolute', left: '19px', top: '10px', bottom: '10px', width: '2px', background: 'var(--dark-border)', zIndex: 0 }} />
              
              {steps.map((step) => {
                const stepStyle = getStepStatusStyle(step.key);
                const isActiveStep = currentOrder.status === step.key;
                
                return (
                  <div key={step.key} style={{ display: 'flex', gap: '16px', position: 'relative', zIndex: 1 }}>
                    <div 
                       style={{ 
                        width: '40px', 
                        height: '40px', 
                        borderRadius: '50%', 
                        background: isActiveStep ? 'var(--gold)' : 'var(--charcoal)', 
                        border: '2px solid var(--dark-border-2)',
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        color: isActiveStep ? 'var(--white)' : 'var(--text-secondary)'
                      }}
                      className={isActiveStep ? 'animate-pulse-gold' : ''}
                    >
                      {step.key === 'preparing' ? '🔥' : step.key === 'out for delivery' ? '🚴' : '📦'}
                    </div>
                    <div>
                      <div style={{ fontSize: '0.88rem', ...stepStyle }}>
                        {step.label} {isActiveStep && '— Active'}
                      </div>
                      <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginTop: '2px' }}>
                        {step.desc}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
            <Link href="/account">
              <button className="btn-gold">
                <span>View Order in Account</span>
              </button>
            </Link>
            <button className="btn-outline" onClick={() => { setActiveOrderId(null); }}>
              <span>Order Again</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-wrapper" style={{ background: 'var(--black)', color: 'var(--text-primary)' }}>
      
      {/* Page Header */}
      <div 
        style={{ 
          background: 'linear-gradient(180deg, #07090b 0%, var(--dark-bg) 100%)', 
          padding: '80px 0 60px', 
          textAlign: 'center',
          borderBottom: '1px solid rgba(201, 168, 76, 0.08)'
        }}
      >
        <div className="container">
          <div className="section-eyebrow" style={{ justifyContent: 'center' }}>Hearth Order</div>
          <h1 className="section-title">Order <em>Checkout</em></h1>
          <div className="gold-divider" />
        </div>
      </div>

      {/* Main Form/Summary Area */}
      <div style={{ padding: '80px 0 120px' }}>
        <div className="container">
          
          {!acceptingOrders ? (
            <div style={{ textAlign: 'center', padding: '100px 0', color: 'var(--text-secondary)' }}>
              <ShieldAlert size={48} className="mx-auto mb-6 text-red-500" style={{ color: '#ef4444' }} />
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', color: 'var(--cream)', marginBottom: '8px' }}>
                Ordering is Temporarily Paused
              </h2>
              <p style={{ fontFamily: 'var(--font-serif)', fontSize: '1rem', marginBottom: '32px' }}>
                We are not taking orders at this time. Please check back later or explore our menu.
              </p>
              <Link href="/menu">
                <button className="btn-gold">
                  <span>Explore the Menu</span>
                </button>
              </Link>
            </div>
          ) : cart.items.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '100px 0', color: 'var(--text-secondary)' }}>
              <ShoppingBag size={48} className="mx-auto mb-6 text-text-muted" />
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', color: 'var(--cream)', marginBottom: '8px' }}>
                Your Cart is Empty
              </h2>
              <p style={{ fontFamily: 'var(--font-serif)', fontSize: '1rem', marginBottom: '32px' }}>
                Explore our gourmet milkshakes, burgers, and waffles on the menu before checking out.
              </p>
              <Link href="/menu">
                <button className="btn-gold">
                  <span>Explore the Menu</span>
                </button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
              
              {/* Delivery Details Checkout Form */}
              <div style={{ background: 'var(--dark-card)', border: '1px solid var(--dark-border)', padding: '48px' }}>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', color: 'var(--cream)', marginBottom: '24px' }}>
                  {cart.type === 'dine-in' 
                    ? 'In-Café Table Details' 
                    : cart.type === 'pickup' 
                      ? 'Pickup Contact Details' 
                      : 'Delivery Address Details'}
                </h3>

                {/* Order Type Toggle in Checkout */}
                <div style={{ marginBottom: '32px' }}>
                  <label className="form-label" style={{ marginBottom: '8px', display: 'block' }}>Order Service Type</label>
                  <div className="grid grid-cols-3 gap-2 bg-[var(--dark-surface)] p-1 border border-[var(--dark-border)]">
                    {(['pickup', 'delivery', 'dine-in'] as const).map((type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setOrderType(type)}
                        style={{
                          padding: '10px 0',
                          fontSize: '0.68rem',
                          letterSpacing: '0.1em',
                          textTransform: 'uppercase',
                          fontWeight: 600,
                          cursor: 'pointer',
                          border: 'none',
                          background: cart.type === type ? 'var(--gold)' : 'transparent',
                          color: cart.type === type ? 'var(--cream)' : 'var(--text-secondary)',
                          transition: 'all 0.3s ease',
                        }}
                      >
                        {type === 'dine-in' ? 'In-Café' : type}
                      </button>
                    ))}
                  </div>
                </div>

                <form onSubmit={handlePlaceOrder} className="flex flex-col gap-6">
                  <div>
                    <label className="form-label">Full Name *</label>
                    <input 
                      name="name"
                      required
                      value={addressForm.name}
                      onChange={handleInputChange}
                      placeholder="Receiver name"
                      style={{ background: 'var(--black)', border: '1px solid var(--dark-border-2)', color: 'var(--cream)', borderRadius: 0 }}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="form-label">Phone Number *</label>
                      <input 
                        name="phone"
                        type="tel"
                        required
                        value={addressForm.phone}
                        onChange={handleInputChange}
                        placeholder="Contact number"
                        style={{ background: 'var(--black)', border: '1px solid var(--dark-border-2)', color: 'var(--cream)', borderRadius: 0 }}
                      />
                    </div>
                    <div>
                      <label className="form-label">Email Address *</label>
                      <input 
                        name="email"
                        type="email"
                        required
                        value={addressForm.email}
                        onChange={handleInputChange}
                        placeholder="you@example.com"
                        style={{ background: 'var(--black)', border: '1px solid var(--dark-border-2)', color: 'var(--cream)', borderRadius: 0 }}
                      />
                    </div>
                  </div>

                  {cart.type === 'delivery' && (
                    <>
                      <div>
                        <label className="form-label">Flat / House / Suite *</label>
                        <input 
                          name="flat"
                          required
                          value={addressForm.flat}
                          onChange={handleInputChange}
                          placeholder="Flat no. or Suite name"
                          style={{ background: 'var(--black)', border: '1px solid var(--dark-border-2)', color: 'var(--cream)', borderRadius: 0 }}
                        />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="form-label">Street Address *</label>
                          <input 
                            name="street"
                            required
                            value={addressForm.street}
                            onChange={handleInputChange}
                            placeholder="Street name"
                            style={{ background: 'var(--black)', border: '1px solid var(--dark-border-2)', color: 'var(--cream)', borderRadius: 0 }}
                          />
                        </div>
                        <div>
                          <label className="form-label">City *</label>
                          <input 
                            name="city"
                            required
                            value={addressForm.city}
                            onChange={handleInputChange}
                            placeholder="Silchar / Postcode"
                            style={{ background: 'var(--black)', border: '1px solid var(--dark-border-2)', color: 'var(--cream)', borderRadius: 0 }}
                          />
                        </div>
                      </div>
                    </>
                  )}

                  {cart.type === 'dine-in' && (
                    <div>
                      <label className="form-label">Select Your Table *</label>
                      {availableTables.length > 0 ? (
                        <>
                          <select
                            value={selectedTable}
                            onChange={(e) => setSelectedTable(e.target.value)}
                            style={{
                              width: '100%',
                              padding: '12px 14px',
                              background: 'var(--black)',
                              border: '1px solid var(--dark-border-2)',
                              color: 'var(--cream)',
                              fontFamily: 'var(--font-sans)',
                              fontSize: '0.85rem',
                              outline: 'none',
                              borderRadius: 0,
                              cursor: 'pointer',
                            }}
                          >
                            {availableTables.map((tbl) => (
                              <option key={tbl} value={tbl} style={{ background: 'var(--black)', color: 'var(--cream)' }}>
                                {tbl}
                              </option>
                            ))}
                          </select>
                          <p style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '8px', fontStyle: 'italic' }}>
                            * Please verify your physical table number in the café before confirming the order.
                          </p>
                        </>
                      ) : (
                        <div style={{ padding: '12px 16px', background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)', color: '#ef4444', fontSize: '0.82rem', lineHeight: 1.5 }}>
                          ⚠️ All tables are currently occupied. Please choose Pickup or Delivery service type above.
                        </div>
                      )}
                    </div>
                  )}

                  {/* Payment Method Selector */}
                  <div style={{ borderTop: '1px solid var(--dark-border-2)', paddingTop: '24px', marginTop: '12px' }}>
                    <label className="form-label" style={{ marginBottom: '12px', display: 'block' }}>Payment Method</label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
                      {(cart.type === 'dine-in' 
                        ? [
                            { key: 'upi', name: 'Scan & Pay (UPI)', desc: 'Instant verification' },
                            { key: 'pay_later', name: 'Pay After Food', desc: 'Pay at counter after your meal' }
                          ]
                        : [
                            { key: 'upi', name: 'Scan & Pay (UPI)', desc: 'Instant verification' },
                            { key: 'cod', name: 'Cash on Delivery', desc: 'Pay at your door' },
                            { key: 'card_on_delivery', name: 'Card on Delivery', desc: 'Swipe on delivery' }
                          ]
                      ).map(method => (
                        <button
                          key={method.key}
                          type="button"
                          onClick={() => setPaymentMethod(method.key as 'upi' | 'cod' | 'card_on_delivery' | 'pay_later')}
                          style={{
                            padding: '14px',
                            background: paymentMethod === method.key ? 'rgba(201,168,76,0.08)' : 'var(--black)',
                            border: paymentMethod === method.key ? '1px solid var(--gold)' : '1px solid var(--dark-border-2)',
                            color: 'var(--cream)',
                            textAlign: 'left',
                            cursor: 'pointer',
                            transition: 'all 0.3s ease'
                          }}
                        >
                          <div style={{ fontWeight: 600, fontSize: '0.8rem', color: paymentMethod === method.key ? 'var(--gold)' : 'var(--cream)' }}>
                            {method.name}
                          </div>
                          <div style={{ fontSize: '0.62rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                            {method.desc}
                          </div>
                        </button>
                      ))}
                    </div>

                    {/* UPI Details Display */}
                    {paymentMethod === 'upi' && (
                      <div style={{ background: 'var(--dark-surface)', border: '1px solid var(--dark-border-2)', padding: '24px', marginBottom: '24px' }}>
                        <h4 style={{ fontFamily: 'var(--font-sans)', fontSize: '0.72rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: '16px' }}>
                          Scan to Transfer
                        </h4>
                        
                        <div style={{ display: 'flex', flexDirection: 'row', gap: '20px', alignItems: 'center', flexWrap: 'wrap', marginBottom: '20px' }}>
                          {/* QR Code Container */}
                          <div style={{ width: '130px', height: '130px', background: '#ffffff', border: '1px solid var(--dark-border-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
                            {restaurantInfo.paymentInfo?.qrCodeImage ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={restaurantInfo.paymentInfo.qrCodeImage} alt="Payment QR Code" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                            ) : (
                              <div style={{ textAlign: 'center', padding: '10px' }}>
                                <span style={{ fontSize: '2rem', display: 'block', marginBottom: '4px' }}>📱</span>
                                <span style={{ fontSize: '0.58rem', color: 'var(--text-muted)' }}>UPI QR Scan</span>
                              </div>
                            )}
                          </div>

                          {/* Account details */}
                          <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', gap: '10px', minWidth: '200px' }}>
                            <div>
                              <div style={{ fontSize: '0.62rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Payee Name</div>
                              <div style={{ fontSize: '0.84rem', color: 'var(--cream)', fontWeight: 600 }}>{restaurantInfo.paymentInfo?.accountHolder || 'The London Shakes Silchar'}</div>
                            </div>
                            
                            <div>
                              <div style={{ fontSize: '0.62rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>UPI Address / ID</div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '2px' }}>
                                <span style={{ fontSize: '0.84rem', color: 'var(--gold)', fontFamily: 'monospace', fontWeight: 600 }}>
                                  {restaurantInfo.paymentInfo?.upiId || '9706388102@ybl'}
                                </span>
                                <button 
                                  type="button" 
                                  onClick={handleCopyUpi} 
                                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}
                                  className="hover:text-gold"
                                >
                                  {copiedUpi ? <Check size={12} style={{ color: '#10b981' }} /> : <Copy size={12} />}
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Optional Bank Transfer details */}
                        {(restaurantInfo.paymentInfo?.bankName && restaurantInfo.paymentInfo?.accountNumber) && (
                          <div style={{ background: 'rgba(201,168,76,0.05)', border: '1px solid var(--dark-border-3)', padding: '12px', fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>
                            <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '4px' }}>Bank Transfer Alternative:</div>
                            <strong>Bank:</strong> {restaurantInfo.paymentInfo.bankName} <br />
                            <strong>A/c Number:</strong> {restaurantInfo.paymentInfo.accountNumber} <br />
                            <strong>IFSC Code:</strong> {restaurantInfo.paymentInfo.ifscCode}
                          </div>
                        )}

                        <p style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', lineHeight: 1.5, fontStyle: 'italic', marginBottom: '16px' }}>
                          {restaurantInfo.paymentInfo?.instructions || 'Please scan or send the total checkout amount, then paste your Txn ID / UTR number below.'}
                        </p>

                        <div>
                          <label className="form-label" style={{ color: 'var(--gold)' }}>UPI Transaction Reference ID / UTR *</label>
                          <input
                            type="text"
                            required={paymentMethod === 'upi'}
                            value={upiTxnId}
                            onChange={(e) => setUpiTxnId(e.target.value)}
                            placeholder="e.g. 617283928192"
                            style={{ background: 'var(--black)', border: '1px solid var(--dark-border-2)', color: 'var(--cream)', width: '100%', padding: '10px 14px', fontSize: '0.82rem', fontFamily: 'monospace' }}
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  <button 
                    type="submit" 
                    className="btn-gold" 
                    disabled={cart.type === 'dine-in' && availableTables.length === 0}
                    style={{ 
                      width: '100%', 
                      marginTop: '12px',
                      opacity: (cart.type === 'dine-in' && availableTables.length === 0) ? 0.5 : 1,
                      cursor: (cart.type === 'dine-in' && availableTables.length === 0) ? 'not-allowed' : 'pointer'
                    }}
                  >
                    <span>
                      {cart.type === 'dine-in' && availableTables.length === 0 
                        ? 'No Tables Available' 
                        : (paymentMethod === 'upi' ? 'Submit Order for Verification' : 'Confirm Order')}
                    </span>
                  </button>
                </form>
              </div>

              {/* Order Summary Sidebar */}
              <div style={{ background: 'var(--dark-card)', border: '1px solid var(--dark-border)', padding: '40px' }}>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', color: 'var(--cream)', marginBottom: '24px' }}>
                  Review Your Selection
                </h3>

                {/* Items list with no prices shown to customer */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '32px' }}>
                  {cart.items.map(item => (
                    <div key={item.id} className="flex justify-between items-center text-sm py-2 border-b border-dark-border-2" style={{ borderBottom: '1px solid var(--dark-border-2)' }}>
                      <div>
                        <span style={{ color: 'var(--cream)', fontWeight: 500 }}>{item.name}</span>
                      </div>
                      <span style={{ color: 'var(--gold)', fontFamily: 'var(--font-sans)', fontWeight: 600 }}>
                        Qty: {item.qty}
                      </span>
                    </div>
                  ))}
                </div>

                <div 
                  style={{ 
                    background: 'rgba(201,168,76,0.03)', 
                    border: '1px solid rgba(201,168,76,0.15)', 
                    padding: '20px', 
                    display: 'flex', 
                    gap: '12px',
                    alignItems: 'center' 
                  }}
                >
                  <ShieldCheck size={20} color="var(--gold)" />
                  <span style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', lineHeight: 1.5 }}>
                    Thank you for choosing The London Shakes. Your order will be prepared fresh upon confirmation.
                  </span>
                </div>
              </div>

            </div>
          )}

        </div>
      </div>

    </div>
  );
}
