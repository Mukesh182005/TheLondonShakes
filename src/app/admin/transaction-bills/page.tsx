'use client';

import React, { useState, useEffect } from 'react';
import { useRestaurantStore, useIsMounted } from '@/store/restaurantStore';
import {
  Search, Calendar, DollarSign, Users,
  CheckCircle, AlertCircle, Lock, Image as ImageIcon,
  Clock, X, Maximize2, ShieldAlert
} from 'lucide-react';
import { useIsMobile } from '@/hooks/useIsMobile';
import toast from 'react-hot-toast';

export default function TransactionBillsPage() {
  const orders = useRestaurantStore((s) => s.orders);
  const setOrders = useRestaurantStore((s) => s.setOrders);
  const user = useRestaurantStore((s) => s.user);
  const hydrated = useIsMounted();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const isMobile = useIsMobile();

  useEffect(() => {
    if (hydrated && user) {
      const isOwner = user.email === 'thelondonshakes.silchar@gmail.com';
      setIsSuperAdmin(isOwner);
    }
  }, [user, hydrated]);

  useEffect(() => {
    if (isSuperAdmin) {
      setLoading(true);
      fetch('/api/orders?all=true')
        .then((res) => res.json())
        .then((data) => {
          if (Array.isArray(data)) {
            setOrders(data);
          }
        })
        .catch((err) => console.error('Failed to load orders:', err))
        .finally(() => setLoading(false));
    } else if (hydrated && !user) {
      setLoading(false);
    }
  }, [isSuperAdmin, setOrders, hydrated, user]);

  if (!hydrated) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <p style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-sans)', fontSize: '0.9rem' }}>Loading system logs...</p>
      </div>
    );
  }

  // Strictly check if user has access. Only the Super Admin email is allowed.
  if (!isSuperAdmin) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh', padding: '20px', textAlign: 'center' }}>
        <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.25)', display: 'flex', alignItems: 'center', justifyItems: 'center', justifyContent: 'center', color: '#ef4444', marginBottom: '20px' }}>
          <Lock size={32} />
        </div>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', color: 'var(--cream)', marginBottom: '8px' }}>Access Denied</h2>
        <p style={{ fontFamily: 'var(--font-sans)', fontSize: '0.85rem', color: 'var(--text-secondary)', maxWidth: '400px', lineHeight: 1.6, marginBottom: '20px' }}>
          This directory is secure and restricted. The Transaction Bills log can only be accessed by the Super Admin / Owner.
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <p style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-sans)', fontSize: '0.9rem' }}>Loading transaction bills...</p>
      </div>
    );
  }

  // List all transaction bills
  const billOrders = orders;

  const filteredOrders = billOrders.filter((o) => {
    const term = searchTerm.toLowerCase();
    const matchesTable = o.tableNumber?.toLowerCase().includes(term);
    const matchesCustomer = o.customerName?.toLowerCase().includes(term);
    const matchesTotal = String(o.total).includes(term);
    const matchesId = o.id.toLowerCase().includes(term);
    return matchesTable || matchesCustomer || matchesTotal || matchesId;
  });
  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2.4rem', color: 'var(--cream)', lineHeight: 1, marginBottom: '8px' }}>
            Transaction Bills Log
          </h1>
          <p style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: '1rem', color: 'var(--text-secondary)' }}>
            Immutable repository of UPI transaction photos and verified bills
          </p>
        </div>
      </div>

      {/* Info Warning Bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 20px', background: 'rgba(197, 168, 92, 0.04)', border: '1px solid rgba(197, 168, 92, 0.15)', marginBottom: '24px' }}>
        <ShieldAlert size={16} color="var(--gold)" style={{ flexShrink: 0 }} />
        <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
          <strong>Security Protocol:</strong> These transaction proofs are legally binding and immutable. No staff member, manager, or administrator can delete, modify, or clear these logs from the system.
        </span>
      </div>

      {/* Search Bar */}
      <div style={{ position: 'relative', marginBottom: '24px' }}>
        <Search style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} size={16} />
        <input
          type="text"
          placeholder="Search by Table, Customer Name, or Amount..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            width: '100%',
            padding: '14px 14px 14px 44px',
            background: 'var(--dark-card)',
            border: '1px solid var(--dark-border)',
            color: 'var(--cream)',
            fontFamily: 'var(--font-sans)',
            fontSize: '0.85rem',
            outline: 'none',
            boxSizing: 'border-box',
          }}
        />
      </div>

      {/* Grid of logs */}
      {filteredOrders.length === 0 ? (
        <div style={{ background: 'var(--dark-card)', border: '1px solid var(--dark-border)', padding: '60px 20px', textAlign: 'center' }}>
          <span style={{ fontSize: '2rem', display: 'block', marginBottom: '14px' }}>📷</span>
          <h3 style={{ fontSize: '1rem', color: 'var(--cream)', fontWeight: 600, marginBottom: '6px' }}>No Transaction Receipts Found</h3>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0 }}>
            {searchTerm ? 'No bills match your current search criteria.' : 'UPI checkout slips will appear here once waiters capture proof photos during checkout.'}
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '20px' }}>
          {filteredOrders.map((order) => {
            const dateStr = new Date(order.createdAt).toLocaleString('en-IN', {
              dateStyle: 'medium',
              timeStyle: 'short',
            });

            return (
              <div
                key={order.id}
                style={{
                  background: 'var(--dark-card)',
                  border: '1px solid var(--dark-border)',
                  display: isMobile ? 'flex' : 'grid',
                  flexDirection: 'column',
                  gridTemplateColumns: isMobile ? undefined : '1fr 180px',
                  gap: '24px',
                  padding: '24px',
                }}
              >
                {/* Left: Bill info */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px dashed var(--dark-border)', paddingBottom: '12px' }}>
                    <div>
                      <span style={{ fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.1em', color: 'var(--gold)', textTransform: 'uppercase', display: 'block', marginBottom: '2px' }}>
                        {order.tableNumber ? `DINE-IN • ${order.tableNumber.toUpperCase()}` : 'TAKEAWAY / COLLECTION'}
                      </span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px', flexWrap: 'wrap' }}>
                        <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Order ID:</span>
                        <code style={{ fontSize: '0.78rem', fontFamily: 'monospace', color: 'var(--cream)', background: 'var(--dark-surface)', padding: '2px 6px', borderRadius: '4px', border: '1px solid var(--dark-border)', wordBreak: 'break-all' }}>
                          {order.id}
                        </code>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', display: 'block' }}>
                        {dateStr}
                      </span>
                      <span style={{ fontSize: '0.62rem', fontWeight: 700, background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.2)', color: '#10b981', padding: '2px 6px', borderRadius: '2px', textTransform: 'uppercase', marginTop: '4px', display: 'inline-block' }}>
                        ✓ Paid
                      </span>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1.2fr 1fr', gap: '20px', marginBottom: '16px' }}>
                    {/* Customer & items info */}
                    <div>
                      <div style={{ marginBottom: '14px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                        <p style={{ margin: '0 0 4px 0' }}>
                          <strong>Customer Name:</strong> {order.customerName || 'Guest'}
                        </p>
                        {order.address?.phone && (
                          <p style={{ margin: '0 0 4px 0' }}>
                            <strong>Mobile:</strong> {order.address.phone}
                          </p>
                        )}
                        {order.address?.email && (
                          <p style={{ margin: '0 0 0 0' }}>
                            <strong>Email:</strong> {order.address.email}
                          </p>
                        )}
                      </div>
                      
                      <p style={{ margin: '0 0 6px 0', fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.05em', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                        Items Ordered
                      </p>
                      <div style={{ maxHeight: '120px', overflowY: 'auto', paddingRight: '8px' }}>
                        {order.items.map((item, idx) => (
                          <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                            <span>{item.name} <span style={{ color: 'var(--text-muted)' }}>x{item.qty}</span></span>
                            <span>₹{(item.price * item.qty).toLocaleString('en-IN')}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Financial Reconciliation Box */}
                    <div style={{ background: 'var(--dark-surface)', border: '1px solid var(--dark-border)', padding: '14px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                        <span>Payment Method:</span>
                        <span style={{ fontWeight: 600, color: 'var(--cream)', textTransform: 'uppercase' }}>{order.paymentMethod}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-secondary)', marginBottom: '10px' }}>
                        <span>Transaction ID:</span>
                        <span style={{ fontWeight: 600, color: 'var(--cream)' }}>{order.upiTxnId || 'N/A'}</span>
                      </div>
                      <div style={{ borderTop: '1px solid var(--dark-border)', paddingTop: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--cream)' }}>Grand Total:</span>
                        <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', fontWeight: 700, color: 'var(--gold)' }}>
                          ₹{order.total.toLocaleString('en-IN')}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right: Receipt Photo Proof */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', borderLeft: '1px solid var(--dark-border)', paddingLeft: '24px' }}>
                  <p style={{ margin: '0 0 8px 0', fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.15em', color: 'var(--text-secondary)', textTransform: 'uppercase', textAlign: 'center' }}>
                    PROOF PHOTO
                  </p>
                  
                  {order.receiptPhoto ? (
                    <div 
                      onClick={() => setSelectedPhoto(order.receiptPhoto!)}
                      style={{ position: 'relative', width: '120px', height: '150px', cursor: 'zoom-in', border: '1px solid var(--dark-border-2)', overflow: 'hidden', transition: 'transform 0.2s ease' }}
                    >
                      <img 
                        src={order.receiptPhoto} 
                        alt="UPI receipt snapshot" 
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'rgba(0,0,0,0.6)', padding: '4px', textAlign: 'center', color: 'var(--cream)', fontSize: '0.58rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '3px' }}>
                        <Maximize2 size={8} /> Click to expand
                      </div>
                    </div>
                  ) : (
                    <div style={{ width: '120px', height: '150px', background: 'var(--dark-surface)', border: '1px dashed var(--dark-border)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
                      <ImageIcon size={20} />
                      <span style={{ fontSize: '0.58rem', marginTop: '6px' }}>No photo</span>
                    </div>
                  )}
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* Lightbox / Modal for full receipt view */}
      {selectedPhoto && (
        <div 
          onClick={() => setSelectedPhoto(null)}
          style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0, 0, 0, 0.9)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'zoom-out',
            padding: '24px',
          }}
        >
          <button 
            onClick={() => setSelectedPhoto(null)}
            style={{ position: 'absolute', top: '24px', right: '24px', background: 'rgba(255,255,255,0.05)', border: 'none', color: '#fff', padding: '10px', cursor: 'pointer', borderRadius: '50%' }}
          >
            <X size={20} />
          </button>
          <div style={{ maxWidth: '90%', maxHeight: '90%', position: 'relative' }} onClick={(e) => e.stopPropagation()}>
            <img 
              src={selectedPhoto} 
              alt="UPI receipt screen verification proof" 
              style={{ maxWidth: '100%', maxHeight: '80vh', border: '2px solid var(--gold)', objectFit: 'contain', background: '#000' }}
            />
          </div>
        </div>
      )}

    </div>
  );
}
