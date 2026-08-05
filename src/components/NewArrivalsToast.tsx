'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { X, Sparkles, ShoppingBag, ArrowRight } from 'lucide-react';
import { useCMSStore, useIsMounted, useRestaurantStore } from '@/store/restaurantStore';

export default function NewArrivalsToast() {
  const isMounted = useIsMounted();
  const menuItems = useCMSStore((s) => s.menuItems);
  const newArrivalsDaysThreshold = useCMSStore((s) => s.newArrivalsDaysThreshold) || 10;
  
  const user = useRestaurantStore((s) => s.user);
  const targetUrl = '/menu?tab=new';

  const [hasNew, setHasNew] = useState(false);
  const [newDishes, setNewDishes] = useState<typeof menuItems>([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!isMounted || menuItems.length === 0) return;

    // Filter items added within the threshold days
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - newArrivalsDaysThreshold);

    const newArrivals = menuItems.filter((item) => {
      if (item.active === false || !item.createdAt) return false;
      const createdDate = new Date(item.createdAt);
      return createdDate >= cutoffDate;
    });

    if (newArrivals.length > 0) {
      // Sort to show the latest first
      const sorted = [...newArrivals].sort(
        (a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
      );
      setNewDishes(sorted);
      setHasNew(true);
    } else {
      setHasNew(false);
      setNewDishes([]);
    }
  }, [isMounted, menuItems, newArrivalsDaysThreshold]);

  if (!hasNew || newDishes.length === 0) return null;

  return (
    <>
      <style>{`
        @keyframes pulseGlow {
          0%, 100% { box-shadow: -4px 0 16px rgba(197, 168, 92, 0.4); }
          50% { box-shadow: -6px 0 28px rgba(197, 168, 92, 0.8), -2px 0 8px rgba(197, 168, 92, 0.4); }
        }
        @keyframes floatTab {
          0%, 100% { transform: translateY(-50%) translateX(0); }
          50% { transform: translateY(-50%) translateX(-6px); }
        }
        .new-arrivals-sidebar-tab {
          position: fixed;
          right: 0;
          top: 55%;
          transform: translateY(-50%);
          z-index: 90;
          background: var(--gold, #C5A85C);
          border-left: 1px solid rgba(255, 255, 255, 0.25);
          border-top: 1px solid rgba(255, 255, 255, 0.25);
          border-bottom: 1px solid rgba(255, 255, 255, 0.25);
          padding: 24px 12px;
          cursor: pointer;
          writing-mode: vertical-rl;
          text-orientation: mixed;
          font-family: var(--font-sans);
          font-size: 0.8rem;
          font-weight: 800;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          color: #0E0A04;
          display: flex;
          align-items: center;
          gap: 10px;
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          animation: floatTab 3s ease-in-out infinite, pulseGlow 2s ease-in-out infinite;
          border-top-left-radius: 6px;
          border-bottom-left-radius: 6px;
        }
        .new-arrivals-sidebar-tab:hover {
          background: #E8102A;
          color: #ffffff;
          padding-right: 18px;
          border-color: rgba(255, 255, 255, 0.4);
        }
        .new-sidebar-drawer {
          position: fixed;
          top: 0;
          right: 0;
          bottom: 0;
          width: 380px;
          max-width: 100vw;
          background: var(--dark-bg);
          border-left: 1px solid var(--dark-border-2);
          box-shadow: -10px 0 40px rgba(0, 0, 0, 0.3);
          z-index: 150;
          display: flex;
          flex-direction: column;
          transform: translateX(${isOpen ? '0' : '100%'});
          transition: transform 0.45s cubic-bezier(0.16, 1, 0.3, 1), background 0.3s ease;
          backdrop-filter: blur(12px);
        }
        .new-sidebar-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.5);
          backdrop-filter: blur(4px);
          z-index: 140;
          opacity: ${isOpen ? 1 : 0};
          pointer-events: ${isOpen ? 'auto' : 'none'};
          transition: opacity 0.4s ease;
        }
        .new-item-card {
          border-bottom: 1px solid var(--dark-border);
          padding: 20px 0;
          display: flex;
          gap: 16px;
        }
        .new-item-image {
          width: 80px;
          height: 80px;
          object-fit: cover;
          border: 1px solid var(--dark-border);
          background: var(--dark-card-2);
          flex-shrink: 0;
        }

        /* Large laptop / desktop enhancements */
        @media (min-width: 1024px) {
          .new-arrivals-sidebar-tab {
            padding: 36px 16px;
            font-size: 0.92rem;
            letter-spacing: 0.25em;
          }
          .new-arrivals-sidebar-tab:hover {
            padding-right: 22px;
          }
          .new-sidebar-drawer {
            width: 480px;
          }
          .new-item-image {
            width: 105px;
            height: 105px;
          }
          .new-item-card {
            padding: 26px 0;
            gap: 20px;
          }
        }
      `}</style>

      {/* Trigger Tab */}
      <div className="new-arrivals-sidebar-tab" onClick={() => setIsOpen(true)}>
        <Sparkles size={13} style={{ marginBottom: '6px' }} />
        New Arrivals
      </div>

      {/* Overlay backdrop */}
      <div className="new-sidebar-overlay" onClick={() => setIsOpen(false)} />

      {/* Sidebar Drawer */}
      <div className="new-sidebar-drawer">
        {/* Header */}
        <div style={{
          padding: '24px 28px',
          borderBottom: '1px solid var(--dark-border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div>
            <span style={{
              background: '#E8102A',
              color: 'white',
              fontSize: '0.52rem',
              fontFamily: 'var(--font-sans)',
              fontWeight: 700,
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              padding: '2px 6px',
              borderRadius: '2px',
              display: 'inline-block',
              marginBottom: '6px',
            }}>
              Latest Additions
            </span>
            <h3 style={{
              fontFamily: 'var(--font-display)',
              fontSize: '1.4rem',
              color: 'var(--cream)',
              margin: 0,
              fontWeight: 450,
            }}>
              New Arrivals ✨
            </h3>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              padding: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              opacity: 0.7,
              transition: 'opacity 0.2s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = '0.7')}
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable Content */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '12px 28px',
        }}>
          {newDishes.map((dish) => (
            <div key={dish.id} className="new-item-card">
              {dish.image ? (
                <img
                  src={dish.image}
                  alt={dish.name}
                  className="new-item-image"
                />
              ) : (
                <div className={`new-item-image ${dish.gradient}`} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>
                  🥤
                </div>
              )}
              <div style={{ flex: 1, minWidth: 0 }}>
                <h4 style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '0.95rem',
                  color: 'var(--cream)',
                  margin: '0 0 4px 0',
                  fontWeight: 500,
                }}>
                  {dish.name}
                </h4>
                <p style={{
                  fontFamily: 'var(--font-sans)',
                  fontSize: '0.72rem',
                  color: 'var(--text-secondary)',
                  margin: '0 0 8px 0',
                  lineHeight: 1.45,
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                }}>
                  {dish.description}
                </p>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.05rem', color: 'var(--gold)', fontWeight: 500 }}>
                    ₹{dish.price}
                  </span>
                  <Link
                    href={targetUrl}
                    onClick={() => setIsOpen(false)}
                    style={{
                      fontSize: '0.62rem',
                      fontFamily: 'var(--font-sans)',
                      fontWeight: 700,
                      color: 'var(--text-secondary)',
                      textDecoration: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.08em',
                    }}
                  >
                    View Details <ArrowRight size={10} />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer CTA */}
        <div style={{
          padding: '24px 28px',
          borderTop: '1px solid var(--dark-border)',
          background: 'var(--dark-card)',
        }}>
          <Link
            href={targetUrl}
            onClick={() => setIsOpen(false)}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              background: '#E8102A',
              color: '#ffffff',
              padding: '14px',
              fontFamily: 'var(--font-sans)',
              fontSize: '0.75rem',
              fontWeight: 700,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              textDecoration: 'none',
              borderRadius: '2px',
              boxShadow: '0 4px 14px rgba(232, 16, 42, 0.25)',
              transition: 'all 0.2s',
            }}
          >
            <ShoppingBag size={14} />
            Explore in Menu
          </Link>
        </div>
      </div>
    </>
  );
}
