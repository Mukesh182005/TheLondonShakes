'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';

export default function MaintenancePage() {
  const [dots, setDots] = useState('');

  // Animated dots
  useEffect(() => {
    const interval = setInterval(() => {
      setDots((d) => (d.length >= 3 ? '' : d + '.'));
    }, 600);
    return () => clearInterval(interval);
  }, []);

  // Poll system settings to auto-restore access when owner resumes server
  useEffect(() => {
    const checkServerStatus = async () => {
      try {
        const res = await fetch(`/api/admin/settings?t=${Date.now()}`, { cache: 'no-store' });
        const data = await res.json();
        if (data.success && data.settings && !data.settings.maintenanceMode) {
          // Clear cookie
          document.cookie = 'tls_maintenance=false; path=/; max-age=31536000; SameSite=Lax';
          // Redirect to home
          window.location.href = '/';
        }
      } catch (err) {
        console.warn('Failed to fetch settings from maintenance page:', err);
      }
    };

    checkServerStatus();
    const interval = setInterval(checkServerStatus, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'var(--black)',
        color: 'var(--cream)',
        fontFamily: 'var(--font-sans)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 24px',
        position: 'relative',
        overflow: 'hidden',
        textAlign: 'center',
      }}
    >
      {/* Background radial glow */}
      <div style={{
        position: 'absolute', top: '20%', left: '50%',
        transform: 'translateX(-50%)',
        width: '60vw', height: '60vw',
        background: 'radial-gradient(circle, rgba(197,168,92,0.07) 0%, transparent 70%)',
        pointerEvents: 'none', filter: 'blur(80px)',
      }} />

      {/* Animated ring */}
      <div style={{ position: 'relative', marginBottom: '40px' }}>
        <div style={{
          width: '100px', height: '100px',
          border: '1px solid rgba(197,168,92,0.2)',
          borderRadius: '50%',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          position: 'relative',
          animation: 'spin 8s linear infinite',
        }}>
          <div style={{
            position: 'absolute', inset: '-8px',
            border: '1px solid transparent',
            borderTopColor: 'rgba(197,168,92,0.5)',
            borderRadius: '50%',
            animation: 'spin 2s linear infinite',
          }} />
          {/* TLS Logo */}
          <div style={{
            width: '60px', height: '60px',
            background: 'linear-gradient(135deg, var(--gold-dark), var(--gold))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1rem', fontWeight: 800,
            color: 'var(--black)', letterSpacing: '0.05em',
          }}>
            TLS
          </div>
        </div>
      </div>

      {/* Eyebrow */}
      <div style={{
        fontSize: '0.65rem', letterSpacing: '0.3em', textTransform: 'uppercase',
        color: 'var(--gold)', fontWeight: 700, marginBottom: '16px',
        display: 'flex', alignItems: 'center', gap: '10px', justifyContent: 'center',
      }}>
        <span style={{
          display: 'inline-block', width: '24px', height: '1px',
          background: 'var(--gold)', opacity: 0.5,
        }} />
        Temporarily Offline
        <span style={{
          display: 'inline-block', width: '24px', height: '1px',
          background: 'var(--gold)', opacity: 0.5,
        }} />
      </div>

      {/* Main heading */}
      <h1 style={{
        fontFamily: 'var(--font-display)',
        fontSize: 'clamp(2.5rem, 6vw, 4.5rem)',
        fontWeight: 400,
        color: 'var(--cream)',
        marginBottom: '8px',
        letterSpacing: '-0.02em',
        lineHeight: 1.1,
      }}>
        We&apos;ll Be Back{dots}
      </h1>

      {/* Gold divider */}
      <div style={{
        width: '48px', height: '1px',
        background: 'linear-gradient(90deg, transparent, var(--gold), transparent)',
        margin: '20px auto',
      }} />

      {/* Subtext */}
      <p style={{
        fontFamily: 'var(--font-serif)',
        fontSize: 'clamp(0.9rem, 2vw, 1.1rem)',
        color: 'var(--text-secondary)',
        maxWidth: '480px',
        lineHeight: 1.8,
        marginBottom: '48px',
      }}>
        The London Shakes is currently undergoing scheduled maintenance.
        We&apos;re polishing every detail to serve you better.
        Please check back shortly.
      </p>

      {/* Status card */}
      <div style={{
        background: 'var(--dark-card)',
        border: '1px solid var(--dark-border)',
        padding: '20px 32px',
        marginBottom: '48px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
      }}>
        <div style={{
          width: '8px', height: '8px', borderRadius: '50%',
          background: '#f59e0b',
          boxShadow: '0 0 0 3px rgba(245,158,11,0.2)',
          animation: 'pulse 2s ease infinite',
          flexShrink: 0,
        }} />
        <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', letterSpacing: '0.05em' }}>
          Maintenance in progress — services will resume soon
        </span>
      </div>

      {/* Contact info */}
      <div style={{
        display: 'flex', gap: '32px', flexWrap: 'wrap', justifyContent: 'center',
        marginBottom: '48px',
      }}>
        {[
          { label: 'Call Us',  value: '+91 98765 43210' },
          { label: 'Email',    value: 'hello@thelondonshakes.com' },
          { label: 'Location', value: 'Premtala, Silchar, Assam' },
        ].map(({ label, value }) => (
          <div key={label} style={{ textAlign: 'center' }}>
            <div style={{
              fontSize: '0.58rem', letterSpacing: '0.2em', textTransform: 'uppercase',
              color: 'var(--gold)', fontWeight: 700, marginBottom: '4px',
            }}>
              {label}
            </div>
            <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
              {value}
            </div>
          </div>
        ))}
      </div>

      {/* Admin link (subtle) */}
      <Link
        href="/admin"
        style={{
          fontSize: '0.62rem', color: 'rgba(255,255,255,0.15)',
          letterSpacing: '0.1em', textTransform: 'uppercase',
          textDecoration: 'none', transition: 'color 0.2s ease',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.color = 'rgba(255,255,255,0.4)')}
        onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(255,255,255,0.15)')}
      >
        Staff Access
      </Link>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.4; }
        }
      `}</style>
    </div>
  );
}
