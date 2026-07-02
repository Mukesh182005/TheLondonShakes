'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { X, Trash2, Minus, Plus, ShoppingBag } from 'lucide-react';
import { useRestaurantStore, useCMSStore } from '@/store/restaurantStore';

export default function CartDrawer({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const router = useRouter();
  const cart = useRestaurantStore((state) => state.cart);
  const updateQty = useRestaurantStore((state) => state.updateQty);
  const removeFromCart = useRestaurantStore((state) => state.removeFromCart);
  const setOrderType = useRestaurantStore((state) => state.setOrderType);
  const acceptingOrders = useCMSStore((state) => state.acceptingOrders);

  const subtotal = cart.items.reduce((sum, item) => sum + item.price * item.qty, 0);

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1100,
        display: 'flex',
        justifyContent: 'flex-end',
      }}
    >
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'absolute',
          inset: 0,
          background: 'rgba(0,0,0,0.7)',
          backdropFilter: 'blur(8px)',
        }}
      />

      {/* Drawer Body */}
      <div
        style={{
          width: 'min(450px, 100vw)',
          height: '100%',
          background: 'var(--black)',
          borderLeft: '1px solid rgba(201, 168, 76, 0.15)',
          position: 'relative',
          zIndex: 2,
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '-10px 0 50px rgba(0,0,0,0.8)',
          animation: 'slideLeft 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '24px 32px',
            borderBottom: '1px solid var(--dark-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div className="flex items-center gap-3">
            <ShoppingBag size={18} color="var(--gold)" />
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem' }}>Your Order</h3>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}
            className="hover:text-cream transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Order Type Toggle */}
        <div style={{ padding: '20px 32px', borderBottom: '1px solid var(--dark-border)' }}>
          <div className="grid grid-cols-3 gap-2 bg-[var(--dark-surface)] p-1 border border-[var(--dark-border)]">
            {(['pickup', 'delivery', 'dine-in'] as const).map((type) => (
              <button
                key={type}
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

        {/* Item List */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px 32px' }}>
          {cart.items.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--text-secondary)' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '16px' }}>🧺</div>
              <p style={{ fontFamily: 'var(--font-serif)', fontSize: '1.05rem', marginBottom: '24px' }}>
                Your dining basket is empty.
              </p>
              <button
                onClick={onClose}
                className="btn-outline"
                style={{ padding: '10px 24px', fontSize: '0.65rem' }}
              >
                Explore the Menu
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {cart.items.map((item) => (
                <div
                  key={item.id}
                  style={{
                    display: 'flex',
                    gap: '16px',
                    paddingBottom: '20px',
                    borderBottom: '1px solid var(--dark-border-2)',
                  }}
                >
                  {/* Photo Simulation */}
                  {item.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={item.image}
                      alt={item.name}
                      style={{
                        width: '64px',
                        height: '64px',
                        objectFit: 'cover',
                        flexShrink: 0,
                        border: '1px solid var(--dark-border)',
                      }}
                    />
                  ) : (
                    <div
                      className={`food-photo ${item.gradient}`}
                      style={{
                        width: '64px',
                        height: '64px',
                        flexShrink: 0,
                      }}
                    />
                  )}

                  {/* Title & Controls */}
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div className="flex justify-between items-start gap-4">
                      <h4
                        style={{
                          fontFamily: 'var(--font-display)',
                          fontSize: '1.05rem',
                          color: 'var(--cream)',
                        }}
                      >
                        {item.name}
                      </h4>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        style={{ background: 'none', border: 'none', color: '#555', cursor: 'pointer' }}
                        className="hover:text-red-500 transition-colors"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>

                    <div className="flex justify-between items-center mt-2">
                      <div className="flex items-center bg-[var(--dark-surface)] border border-[var(--dark-border)]">
                        <button
                          onClick={() => updateQty(item.id, item.qty - 1)}
                          style={{
                            padding: '4px 10px',
                            border: 'none',
                            background: 'none',
                            color: 'var(--text-secondary)',
                            cursor: 'pointer',
                          }}
                          className="hover:text-[var(--cream)]"
                        >
                          <Minus size={10} />
                        </button>
                        <span style={{ fontSize: '0.8rem', width: '20px', textAlign: 'center', color: 'var(--cream)' }}>
                          {item.qty}
                        </span>
                        <button
                          onClick={() => updateQty(item.id, item.qty + 1)}
                          style={{
                            padding: '4px 10px',
                            border: 'none',
                            background: 'none',
                            color: 'var(--text-secondary)',
                            cursor: 'pointer',
                          }}
                          className="hover:text-[var(--cream)]"
                        >
                          <Plus size={10} />
                        </button>
                      </div>
                      <span
                        style={{
                          fontFamily: 'var(--font-display)',
                          fontSize: '1.1rem',
                          color: 'var(--gold)',
                        }}
                      >
                        ₹{item.price * item.qty}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer summary */}
        {cart.items.length > 0 && (
          <div
            style={{
              padding: '24px 32px 40px',
              borderTop: '1px solid var(--dark-border)',
              background: 'var(--dark-surface)',
            }}
          >
            <div className="flex justify-between items-center mb-6">
              <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Subtotal</span>
              <span
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '1.6rem',
                  color: 'var(--gold)',
                  fontWeight: 600,
                }}
              >
                ₹{subtotal}
              </span>
            </div>
            {!acceptingOrders && (
              <div 
                style={{ 
                  background: 'rgba(239, 68, 68, 0.08)', 
                  border: '1px solid rgba(239, 68, 68, 0.2)', 
                  padding: '12px', 
                  marginBottom: '16px',
                  textAlign: 'center'
                }}
              >
                <p style={{ fontSize: '0.75rem', color: '#ef4444', fontWeight: 600, margin: 0 }}>
                  We are not taking orders at this time.
                </p>
              </div>
            )}
            <button
              onClick={() => {
                if (!acceptingOrders) return;
                onClose();
                router.push('/order');
              }}
              disabled={!acceptingOrders}
              className="btn-gold"
              style={{ 
                width: '100%', 
                padding: '16px 0',
                opacity: acceptingOrders ? 1 : 0.5,
                cursor: acceptingOrders ? 'pointer' : 'not-allowed'
              }}
            >
              <span>{acceptingOrders ? 'Proceed to Checkout' : 'Orders Paused'}</span>
            </button>
          </div>
        )}
      </div>

      <style>{`
        @keyframes slideLeft {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
      `}</style>
    </div>
  );
}
