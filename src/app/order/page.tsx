'use client';

import React, { useState, useEffect } from 'react';
import { useRestaurantStore, useCMSStore } from '@/store/restaurantStore';
import { restaurantInfo as initialRestaurantInfo, chef as initialChef } from '@/data/restaurantData';
import { ShoppingBag, ShieldCheck, Clock, Copy, Check } from 'lucide-react';
import toast from 'react-hot-toast';
import Link from 'next/link';

export default function OrderPage() {
  const storeCart = useRestaurantStore((state) => state.cart);
  const orders = useRestaurantStore((state) => state.orders);
  const placeOrder = useRestaurantStore((state) => state.placeOrder);
  const setDeliveryAddress = useRestaurantStore((state) => state.setDeliveryAddress);
  const updateOrderStatus = useRestaurantStore((state) => state.updateOrderStatus);
  const storeRestaurantInfo = useCMSStore((state) => state.restaurantInfo);
  const storeChef = useCMSStore((state) => state.chef);

  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const cart = isMounted ? storeCart : { items: [], type: 'pickup', address: { name: '', phone: '', email: '', flat: '', street: '', city: '' } };
  const restaurantInfo = isMounted ? storeRestaurantInfo : initialRestaurantInfo;
  const chef = isMounted ? storeChef : initialChef;

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
  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'cod' | 'card_on_delivery'>('upi');
  const [upiTxnId, setUpiTxnId] = useState('');
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [activeOrderId, setActiveOrderId] = useState<string | null>(null);

  const cartSubtotal = cart.items.reduce((sum, item) => sum + item.price * item.qty, 0);
  const deliveryFee = cart.type === 'delivery' ? 30 : 0;
  const cartTotal = cartSubtotal + deliveryFee;

  // Real-time tracking state update simulation
  useEffect(() => {
    if (!activeOrderId) return;

    // Transition order status to simulate kitchen / courier dispatch
    // Preparing -> Out for Delivery -> Delivered
    const timer1 = setTimeout(() => {
      updateOrderStatus(activeOrderId, 'out for delivery');
      toast.success('Your order is out for delivery / ready for pickup!');
    }, 15000); // 15 seconds

    const timer2 = setTimeout(() => {
      updateOrderStatus(activeOrderId, 'delivered');
      toast.success('Your order has been delivered / collected!');
    }, 35000); // 35 seconds

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, [activeOrderId, updateOrderStatus]);

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
    const orderId = placeOrder(paymentMethod, paymentMethod === 'upi' ? upiTxnId.trim() : '');
    setActiveOrderId(orderId);
    toast.success(paymentMethod === 'upi' ? 'Order submitted! Payment verification pending.' : 'Order placed successfully!');
  };

  // Get active order details for tracking
  const currentOrder = orders.find(o => o.id === activeOrderId);

  // If tracking active order
  if (activeOrderId && currentOrder) {
    const steps = [
      { key: 'preparing', label: 'Preparing', desc: `Chef ${chef.name} is searing your embers.` },
      { key: 'out for delivery', label: currentOrder.type === 'delivery' ? 'Out for Delivery' : 'Ready for Pickup', desc: currentOrder.type === 'delivery' ? 'Courier is in transit.' : 'Visit exchange lobby.' },
      { key: 'delivered', label: currentOrder.type === 'delivery' ? 'Delivered' : 'Collected', desc: 'Enjoy your michelin dinner.' }
    ];

    const getStepStatusClass = (stepKey: string) => {
      const currentStatus = currentOrder.status;
      if (currentStatus === 'cancelled') return 'text-red-500';
      if (currentStatus === stepKey) return 'text-gold';
      
      const statusOrder = ['preparing', 'out for delivery', 'delivered'];
      const currentIdx = statusOrder.indexOf(currentStatus);
      const stepIdx = statusOrder.indexOf(stepKey);

      if (stepIdx < currentIdx) return 'text-green-500'; // Past steps
      return 'text-text-muted'; // Future steps
    };

    return (
      <div className="page-wrapper" style={{ background: 'var(--black)', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <div className="container" style={{ maxWidth: '600px', padding: '60px var(--container-px)', textAlign: 'center' }}>
          <div style={{ width: '80px', height: '80px', background: 'var(--gold-muted)', border: '1px solid var(--gold)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
            <Clock size={32} className="animate-spin-slow" color="var(--gold)" />
          </div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', color: 'var(--cream)', marginBottom: '4px' }}>
            Order Tracking Loop
          </h2>
          <div style={{ fontFamily: 'var(--font-sans)', color: 'var(--text-secondary)', fontSize: '0.8rem', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '16px' }}>
            ORDER ID: #{currentOrder.id}
          </div>

          {/* Payment Status Summary Card */}
          <div style={{ background: '#0a0a0a', border: '1px solid var(--dark-border-2)', padding: '20px', marginBottom: '40px', textAlign: 'left' }}>
            <h5 style={{ fontFamily: 'var(--font-sans)', fontSize: '0.68rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: '12px' }}>
              Invoice & Payment status
            </h5>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.78rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Payment Method:</span>
                <span style={{ color: 'var(--cream)', fontWeight: 600 }}>
                  {currentOrder.paymentMethod === 'upi' ? 'UPI Scan & Transfer' : currentOrder.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Card on Delivery'}
                </span>
              </div>
              {currentOrder.paymentMethod === 'upi' && (
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>UPI Txn / UTR ID:</span>
                  <span style={{ color: 'var(--cream)', fontFamily: 'monospace' }}>{currentOrder.upiTxnId}</span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Billing Total:</span>
                <span style={{ color: 'var(--gold)', fontWeight: 600 }}>₹{currentOrder.total}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '8px', borderTop: '1px solid var(--dark-border-2)', marginTop: '4px' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Verification Status:</span>
                <span 
                  style={{ 
                    fontSize: '0.65rem',
                    padding: '2px 8px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    fontWeight: 700,
                    background: currentOrder.paymentStatus === 'paid' ? 'rgba(16,185,129,0.1)' : currentOrder.paymentStatus === 'pending_verification' ? 'rgba(245,158,11,0.1)' : 'rgba(239,68,68,0.1)',
                    color: currentOrder.paymentStatus === 'paid' ? '#10b981' : currentOrder.paymentStatus === 'pending_verification' ? '#f59e0b' : '#ef4444',
                    border: `1px solid ${currentOrder.paymentStatus === 'paid' ? 'rgba(16,185,129,0.3)' : currentOrder.paymentStatus === 'pending_verification' ? 'rgba(245,158,11,0.3)' : 'rgba(239,68,68,0.3)'}`
                  }}
                >
                  {currentOrder.paymentStatus.replace('_', ' ')}
                </span>
              </div>
            </div>
          </div>

          {/* Realtime Socket Simulation Progress Bar */}
          <div style={{ background: '#0d0d0d', border: '1px solid rgba(201,168,76,0.15)', padding: '32px', textAlign: 'left', marginBottom: '32px' }}>
            <h4 style={{ fontFamily: 'var(--font-sans)', fontSize: '0.75rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: '24px' }}>
              Order Status Pipeline
            </h4>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', position: 'relative' }}>
              {/* Connecting line */}
              <div style={{ position: 'absolute', left: '19px', top: '10px', bottom: '10px', width: '2px', background: 'var(--dark-border-2)', zIndex: 0 }} />
              
              {steps.map((step) => {
                const colorClass = getStepStatusClass(step.key);
                const isActiveStep = currentOrder.status === step.key;
                
                return (
                  <div key={step.key} style={{ display: 'flex', gap: '16px', position: 'relative', zIndex: 1 }}>
                    <div 
                      style={{ 
                        width: '40px', 
                        height: '40px', 
                        borderRadius: '50%', 
                        background: isActiveStep ? 'var(--gold)' : 'var(--black)', 
                        border: '2px solid var(--dark-border-2)',
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        color: isActiveStep ? 'var(--black)' : 'var(--text-secondary)'
                      }}
                      className={isActiveStep ? 'animate-pulse-gold' : ''}
                    >
                      {step.key === 'preparing' ? '🔥' : step.key === 'out for delivery' ? '🚴' : '📦'}
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.88rem' }} className={colorClass}>
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
          
          {cart.items.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '100px 0', color: 'var(--text-secondary)' }}>
              <ShoppingBag size={48} className="mx-auto mb-6 text-text-muted" />
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', color: 'var(--cream)', marginBottom: '8px' }}>
                Your Cart is Empty
              </h2>
              <p style={{ fontFamily: 'var(--font-serif)', fontSize: '1rem', marginBottom: '32px' }}>
                Explore our wood-fired options on the menu before checking out.
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
              <div style={{ background: '#0d0d0d', border: '1px solid rgba(201,168,76,0.15)', padding: '48px' }}>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', color: 'var(--gold)', marginBottom: '24px' }}>
                  Delivery Details ({cart.type.toUpperCase()})
                </h3>

                <form onSubmit={handlePlaceOrder} className="flex flex-col gap-6">
                  <div>
                    <label className="form-label">Full Name *</label>
                    <input 
                      name="name"
                      required
                      value={addressForm.name}
                      onChange={handleInputChange}
                      placeholder="Receiver name"
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
                          />
                        </div>
                      </div>
                    </>
                  )}

                  {/* Payment Method Selector */}
                  <div style={{ borderTop: '1px solid var(--dark-border-2)', paddingTop: '24px', marginTop: '12px' }}>
                    <label className="form-label" style={{ marginBottom: '12px', display: 'block' }}>Payment Method</label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
                      {[
                        { key: 'upi', name: 'Scan & Pay (UPI)', desc: 'Instant verification' },
                        { key: 'cod', name: 'Cash on Delivery', desc: 'Pay at your door' },
                        { key: 'card_on_delivery', name: 'Card on Delivery', desc: 'Swipe on delivery' }
                      ].map(method => (
                        <button
                          key={method.key}
                          type="button"
                          onClick={() => setPaymentMethod(method.key as 'upi' | 'cod' | 'card_on_delivery')}
                          style={{
                            padding: '12px',
                            background: paymentMethod === method.key ? 'rgba(201,168,76,0.05)' : 'var(--black)',
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
                          <div style={{ fontSize: '0.62rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                            {method.desc}
                          </div>
                        </button>
                      ))}
                    </div>

                    {/* UPI Details Display */}
                    {paymentMethod === 'upi' && (
                      <div style={{ background: '#0a0a0a', border: '1px solid var(--dark-border-2)', padding: '24px', marginBottom: '24px' }}>
                        <h4 style={{ fontFamily: 'var(--font-sans)', fontSize: '0.72rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: '16px' }}>
                          Scan to Transfer
                        </h4>
                        
                        <div style={{ display: 'flex', flexDirection: 'row', gap: '20px', alignItems: 'center', flexWrap: 'wrap', marginBottom: '20px' }}>
                          {/* QR Code Container */}
                          <div style={{ width: '130px', height: '130px', background: 'var(--black)', border: '1px solid var(--dark-border-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
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
                          <div style={{ background: 'rgba(5,5,5,0.6)', border: '1px solid var(--dark-border-3)', padding: '12px', fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>
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

                  <button type="submit" className="btn-gold" style={{ width: '100%', marginTop: '12px' }}>
                    <span>
                      {paymentMethod === 'upi' ? 'Submit Order for Verification' : `Confirm Checkout · ₹${cartTotal}`}
                    </span>
                  </button>
                </form>
              </div>

              {/* Order Summary Sidebar */}
              <div style={{ background: 'var(--dark-card)', border: '1px solid var(--dark-border)', padding: '40px' }}>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', color: 'var(--cream)', marginBottom: '24px' }}>
                  Dining Invoice Summary
                </h3>

                {/* Items */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '32px' }}>
                  {cart.items.map(item => (
                    <div key={item.id} className="flex justify-between items-center text-sm py-2 border-b border-dark-border-2">
                      <div>
                        <span style={{ color: 'var(--cream)', fontWeight: 500 }}>{item.name}</span>
                        <span style={{ color: 'var(--text-secondary)', fontSize: '0.78rem', marginLeft: '8px' }}>
                          ×{item.qty}
                        </span>
                      </div>
                      <span style={{ color: 'var(--gold)', fontFamily: 'var(--font-display)' }}>
                        ₹{item.price * item.qty}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Math values */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.84rem', color: 'var(--text-secondary)', marginBottom: '32px' }}>
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span style={{ color: 'var(--cream)' }}>₹{cartSubtotal}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>{cart.type === 'delivery' ? 'Delivery Fee' : 'Collection Charge'}</span>
                    <span style={{ color: 'var(--cream)' }}>₹{deliveryFee}</span>
                  </div>
                  <hr style={{ border: 'none', borderTop: '1px solid var(--dark-border-2)' }} />
                  <div className="flex justify-between" style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--cream)' }}>
                    <span>Total Billing</span>
                    <span style={{ color: 'var(--gold)', fontFamily: 'var(--font-display)', fontSize: '1.4rem' }}>
                      ₹{cartTotal}
                    </span>
                  </div>
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
                    Secure transaction. Authorized via SSL encryption. Any simulated billing details will bypass real merchant accounts.
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
