'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import Navbar from './Navbar';
import Footer from './Footer';
import { Toaster } from 'react-hot-toast';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin  = pathname.startsWith('/admin');

  return (
    <div style={{ display:'flex', flexDirection:'column', minHeight:'100vh', background:'var(--black)', color:'var(--text-primary)' }}>
      {/* Toast Notifications */}
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background:  '#0F0F0F',
            color:       'var(--cream)',
            border:      '1px solid rgba(197,168,92,0.2)',
            fontFamily:  'var(--font-sans)',
            fontSize:    '0.8rem',
            borderRadius:'0px',
            boxShadow:   '0 20px 60px rgba(0,0,0,0.8)',
          },
          success: {
            iconTheme: { primary:'var(--gold)', secondary:'#0F0F0F' },
          },
          error: {
            iconTheme: { primary:'#ef4444', secondary:'#0F0F0F' },
          },
        }}
      />

      {/* Customer layout wraps (Navbar + Footer) */}
      {!isAdmin && <Navbar />}

      {/* Page content grows to fill viewport */}
      <div style={{ flex:1 }}>
        {children}
      </div>

      {!isAdmin && <Footer />}
    </div>
  );
}
