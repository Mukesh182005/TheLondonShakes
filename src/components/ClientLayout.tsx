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
import MouseTrailer from './MouseTrailer';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin  = pathname.startsWith('/admin');

  return (
    <MotionConfig reducedMotion="user">
      <div style={{ display:'flex', flexDirection:'column', minHeight:'100vh', background:'var(--black)', color:'var(--text-primary)' }}>
        {/* Mouse Trailer (Customer pages only) */}
        {!isAdmin && <MouseTrailer />}

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
      </div>
    </MotionConfig>
  );
}

// ── COOKIE & TERMS CONSENT BANNER (BOTTOM LEFT) ──
function CookieConsent() {
  const [show, setShow] = useState(false);
  const [animatingOut, setAnimatingOut] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 40) {
        setShow(true);
        window.removeEventListener('scroll', handleScroll);
      }
    };
    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Check immediately in case page is loaded already scrolled
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleResponse = () => {
    setAnimatingOut(true);
    // fast slide out, slow fade (slide duration: 0.38s, fade duration: 0.8s)
    setTimeout(() => setShow(false), 800);
  };

  if (!show) return null;

  return (
    <div
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
      `}</style>
      <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
        <div style={{ padding: '6px', background: 'rgba(197, 168, 92, 0.1)', color: 'var(--gold)', borderRadius: '2px', flexShrink: 0 }}>
          <Info size={16} />
        </div>
        <div>
          <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '0.95rem', color: '#F2EEE4', marginBottom: '6px', letterSpacing: '0.02em' }}>
            Cookies & Terms Consent
          </h4>
          <p style={{ fontFamily: 'var(--font-sans)', fontSize: '0.72rem', color: 'rgba(242, 238, 228, 0.65)', lineHeight: 1.45 }}>
            We use cookies to refine your dining experience, remember reservation preferences, and optimize online checkouts.
          </p>
        </div>
      </div>
      <div style={{ display: 'flex', gap: '10px', width: '100%', justifyContent: 'flex-end', marginTop: '4px' }}>
        <button
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

