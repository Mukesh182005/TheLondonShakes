'use client';

import Link from 'next/link';
import { ShoppingBag } from 'lucide-react';

export default function NotFound() {
  return (
    <div style={{
      minHeight: '80vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 20px',
      textAlign: 'center',
      background: 'var(--pitch-black, #0A0A0A)',
      color: 'var(--cream, #F5F2EB)',
      fontFamily: 'var(--font-sans, sans-serif)'
    }}>
      <h1 style={{
        fontFamily: 'var(--font-display, Georgia, serif)',
        fontSize: '6rem',
        fontWeight: 'bold',
        background: 'linear-gradient(to right, #D4AF37, #F3E5AB)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        marginBottom: '10px',
        lineHeight: 1
      }}>
        404
      </h1>
      <h2 style={{
        fontSize: '1.8rem',
        fontFamily: 'var(--font-display, Georgia, serif)',
        color: 'var(--cream)',
        marginBottom: '16px'
      }}>
        Lost in the Shakes
      </h2>
      <p style={{
        color: 'var(--text-secondary, #A0A0A0)',
        maxWidth: '450px',
        fontSize: '0.95rem',
        lineHeight: 1.6,
        marginBottom: '32px'
      }}>
        The page you are looking for does not exist or has been relocated to another address in our menu.
      </p>
      <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', justifyContent: 'center' }}>
        <Link 
          href="/"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            background: 'linear-gradient(135deg, #C5A850 0%, #9C8036 100%)',
            color: '#0A0A0A',
            padding: '12px 28px',
            borderRadius: '9999px',
            fontSize: '0.88rem',
            fontWeight: '600',
            textDecoration: 'none',
            transition: 'opacity 0.2s',
            boxShadow: '0 4px 20px rgba(197, 168, 80, 0.2)'
          }}
          onMouseOver={(e) => e.currentTarget.style.opacity = '0.9'}
          onMouseOut={(e) => e.currentTarget.style.opacity = '1'}
        >
          Return Home
        </Link>
        <Link 
          href="/menu"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            border: '1px solid rgba(197, 168, 80, 0.4)',
            color: 'var(--cream)',
            padding: '12px 28px',
            borderRadius: '9999px',
            fontSize: '0.88rem',
            fontWeight: '600',
            textDecoration: 'none',
            transition: 'background 0.2s'
          }}
          onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgba(197, 168, 80, 0.1)'}
          onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
        >
          <ShoppingBag size={16} />
          View Menu
        </Link>
      </div>
    </div>
  );
}
