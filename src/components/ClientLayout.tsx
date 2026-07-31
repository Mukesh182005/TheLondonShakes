'use client';

import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Navbar from './Navbar';
import Footer from './Footer';
import { Toaster } from 'react-hot-toast';
import WelcomeSplashScreen from './WelcomeSplashScreen';
import PageTransition from './PageTransition';
import { Info } from 'lucide-react';
import { MotionConfig } from 'framer-motion';
import { useCMSStore, useIsMounted } from '@/store/restaurantStore';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin  = pathname.startsWith('/admin');
  const loadSystemSettings = useCMSStore((state) => state.loadSystemSettings);
  const loadCategories     = useCMSStore((state) => state.loadCategories);
  const loadMenuItems      = useCMSStore((state) => state.loadMenuItems);
  const acceptingOrders = useCMSStore((state) => state.acceptingOrders);
  const isMounted = useIsMounted();

  useEffect(() => {
    loadSystemSettings();
    loadCategories();
    loadMenuItems();

    // Poll settings, categories, and menu items to keep database sync in real-time
    const interval = setInterval(() => {
      loadSystemSettings();
      loadCategories();
      loadMenuItems();
    }, 8000);

    return () => clearInterval(interval);
  }, [loadSystemSettings, loadCategories, loadMenuItems]);


  return (
    <MotionConfig reducedMotion="user">
      <div style={{ display:'flex', flexDirection:'column', minHeight:'100vh', background:'var(--black)', color:'var(--text-primary)', paddingBottom: (isMounted && !isAdmin && !acceptingOrders) ? '56px' : '0px' }}>
        {/* Site-wide ambient grain (Customer pages only) */}
        {!isAdmin && <div className="lux-grain" aria-hidden />}


        {/* Welcome Screen (Customer pages only) */}
        {!isAdmin && <WelcomeSplashScreen />}

        {/* Toast Notifications */}
        <Toaster
          toastOptions={{
            style: {
              background: 'var(--dark-card)',
              color: 'var(--cream)',
              border: '1px solid var(--dark-border-2)',
              borderRadius: '0px',
              fontFamily: 'var(--font-sans)',
              fontSize: '0.8rem',
              padding: '12px 18px',
            },
            success: {
              iconTheme: {
                primary: 'var(--gold)',
                secondary: 'var(--dark-card)',
              },
            },
          }}
        />

        {/* Customer layout wraps (Navbar + Footer) */}
        {!isAdmin && <Navbar />}

        {/* Page content grows to fill viewport */}
        <div style={{ flex: 1 }}>
          <PageTransition>{children}</PageTransition>
        </div>

        {!isAdmin && <Footer />}

        {/* Sticky Cookie Consent */}
        {!isAdmin && <CookieConsent />}

        {/* Sticky Order Taking Paused Banner */}
        {!isAdmin && !acceptingOrders && (
          <div style={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            zIndex: 9999,
            background: 'linear-gradient(135deg, #FF1E39, #E8102A)',
            color: 'white',
            textAlign: 'center',
            padding: '12px 24px',
            fontSize: '0.75rem',
            fontFamily: 'var(--font-sans)',
            lineHeight: 1.4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 -4px 20px rgba(232, 16, 42, 0.25)',
            borderTop: '1px solid rgba(255,255,255,0.1)'
          }}>
            <span style={{ fontWeight: 600 }}>
              We are not taking orders at this time please give the order from the counter !!
            </span>
            <span style={{ fontWeight: 'bold', textTransform: 'uppercase', fontSize: '0.7rem', letterSpacing: '0.05em', marginTop: '3px' }}>
              SORRY FOR THE INCONVINENCE
            </span>
          </div>
        )}
      </div>
    </MotionConfig>
  );
}

// ── SITE-WIDE SCROLL PROGRESS BAR ──
function ScrollProgress() {
  const [scaleX, setScaleX] = useState(0);

  useEffect(() => {
    let raf = 0;
    const update = () => {
      const el = document.documentElement;
      const max = el.scrollHeight - el.clientHeight;
      setScaleX(max > 0 ? Math.min(1, el.scrollTop / max) : 0);
    };
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(update);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    update();
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);

  return (
    <div
      className="scroll-progress"
      style={{ transform: `scaleX(${scaleX})` }}
      aria-hidden
    />
  );
}

// ── COOKIE & TERMS CONSENT BANNER (BOTTOM LEFT) ──
function CookieConsent() {
  const [show, setShow] = useState(false);
  const [animatingOut, setAnimatingOut] = useState(false);

  useEffect(() => {
    try {
      // 1. Check if user already responded (accepted/declined)
      const responded = localStorage.getItem('tls_consent_responded');
      if (responded === 'true') {
        return;
      }

      // 2. Track and increment visit count (using sessionStorage to avoid incrementing on internal page navigations)
      const visitCountStr = localStorage.getItem('tls_visit_count') || '0';
      let visitCount = parseInt(visitCountStr, 10);

      const sessionCounted = sessionStorage.getItem('tls_session_counted');
      if (!sessionCounted) {
        visitCount += 1;
        localStorage.setItem('tls_visit_count', visitCount.toString());
        sessionStorage.setItem('tls_session_counted', 'true');
      }

      // If the user is coming repeatedly (more than 2 visits), do not show it
      if (visitCount > 2) {
        return;
      }

      // 3. Trigger showing on scroll
      const handleScroll = () => {
        if (window.scrollY > 40) {
          setShow(true);
          window.removeEventListener('scroll', handleScroll);
        }
      };
      window.addEventListener('scroll', handleScroll);
      handleScroll(); // Check immediately in case page is loaded already scrolled
      return () => window.removeEventListener('scroll', handleScroll);
    } catch (e) {
      // Fail-safe fallback if localStorage is blocked
      const handleScroll = () => {
        if (window.scrollY > 40) {
          setShow(true);
          window.removeEventListener('scroll', handleScroll);
        }
      };
      window.addEventListener('scroll', handleScroll);
      handleScroll();
      return () => window.removeEventListener('scroll', handleScroll);
    }
  }, []);

  const handleResponse = () => {
    try {
      localStorage.setItem('tls_consent_responded', 'true');
    } catch (e) {}
    setAnimatingOut(true);
    // fast slide out, slow fade (slide duration: 0.38s, fade duration: 0.8s)
    setTimeout(() => setShow(false), 800);
  };

  if (!show) return null;

  return (
    <div
      className="cookie-consent-container"
      style={{
        position: 'fixed',
        bottom: '24px',
        left: '24px',
        zIndex: 99999,
        maxWidth: '380px',
        width: 'calc(100vw - 48px)',
        background: 'rgba(18, 12, 9, 0.95)',
        backdropFilter: 'blur(12px)',
        border: '1px solid rgba(197, 168, 92, 0.25)',
        padding: '24px',
        boxShadow: '0 20px 50px rgba(0,0,0,0.6)',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        transform: animatingOut ? 'translateX(450px)' : 'translateX(0)',
        opacity: animatingOut ? 0 : 1,
        transition: 'transform 0.38s cubic-bezier(0.25, 1, 0.5, 1), opacity 0.8s cubic-bezier(0.25, 1, 0.5, 1)',
        animation: animatingOut ? 'none' : 'slideInLeft 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
      }}
    >
      <style>{`
        @keyframes slideInLeft {
          0% { transform: translateY(60px); opacity: 0; }
          100% { transform: translateY(0); opacity: 1; }
        }

        @media (max-width: 640px) {
          .cookie-consent-container {
            bottom: 12px !important;
            left: 12px !important;
            width: calc(100vw - 24px) !important;
            max-width: 320px !important;
            padding: 12px 16px !important;
            gap: 10px !important;
          }
          .cookie-consent-icon-wrapper {
            padding: 4px !important;
          }
          .cookie-consent-header {
            font-size: 0.8rem !important;
            margin-bottom: 2px !important;
          }
          .cookie-consent-text {
            font-size: 0.65rem !important;
            line-height: 1.35 !important;
          }
          .cookie-consent-buttons {
            gap: 8px !important;
            margin-top: 0px !important;
          }
          .cookie-consent-btn-decline {
            padding: 6px 12px !important;
            font-size: 0.6rem !important;
          }
          .cookie-consent-btn-agree {
            padding: 6px 16px !important;
            font-size: 0.6rem !important;
          }
        }
      `}</style>
      <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
        <div 
          className="cookie-consent-icon-wrapper"
          style={{ padding: '6px', background: 'rgba(197, 168, 92, 0.1)', color: 'var(--gold)', borderRadius: '2px', flexShrink: 0 }}
        >
          <Info size={16} />
        </div>
        <div>
          <h4 
            className="cookie-consent-header"
            style={{ fontFamily: 'var(--font-display)', fontSize: '0.95rem', color: '#F2EEE4', marginBottom: '6px', letterSpacing: '0.02em' }}
          >
            Cookies & Terms Consent
          </h4>
          <p 
            className="cookie-consent-text"
            style={{ fontFamily: 'var(--font-sans)', fontSize: '0.72rem', color: 'rgba(242, 238, 228, 0.65)', lineHeight: 1.45 }}
          >
            We use cookies to refine your dining experience, remember reservation preferences, and optimize online checkouts.
          </p>
        </div>
      </div>
      <div 
        className="cookie-consent-buttons"
        style={{ display: 'flex', gap: '10px', width: '100%', justifyContent: 'flex-end', marginTop: '4px' }}
      >
        <button
          className="cookie-consent-btn-decline"
          onClick={() => handleResponse()}
          style={{
            padding: '8px 16px',
            background: 'transparent',
            border: '1px solid rgba(242, 238, 228, 0.15)',
            color: 'rgba(242, 238, 228, 0.7)',
            fontSize: '0.68rem',
            fontFamily: 'var(--font-sans)',
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.borderColor = 'rgba(242, 238, 228, 0.4)';
            (e.currentTarget as HTMLElement).style.color = '#F2EEE4';
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.borderColor = 'rgba(242, 238, 228, 0.15)';
            (e.currentTarget as HTMLElement).style.color = 'rgba(242, 238, 228, 0.7)';
          }}
        >
          Decline
        </button>
        <button
          className="cookie-consent-btn-agree"
          onClick={() => handleResponse()}
          style={{
            padding: '8px 20px',
            background: 'var(--gold)',
            border: 'none',
            color: 'rgba(18, 12, 9, 0.95)',
            fontSize: '0.68rem',
            fontFamily: 'var(--font-sans)',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            boxShadow: '0 4px 12px rgba(197, 168, 92, 0.15)',
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.background = 'var(--gold-bright)';
            (e.currentTarget as HTMLElement).style.boxShadow = '0 6px 16px rgba(197, 168, 92, 0.25)';
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.background = 'var(--gold)';
            (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 12px rgba(197, 168, 92, 0.15)';
          }}
        >
          Agree
        </button>
      </div>
    </div>
  );
}

