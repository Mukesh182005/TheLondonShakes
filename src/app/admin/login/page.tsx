'use client';

import React, { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useRestaurantStore } from '@/store/restaurantStore';
import { KeyRound, Eye, EyeOff, ShieldAlert, ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const login = useRestaurantStore((s) => s.login);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get the redirect path if present (e.g. from middleware)
  const fromPath = searchParams.get('from') || '/admin';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim() || !email.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/admin-auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Incorrect password');
      }

      // Sync user state in Zustand store
      login(email);

      // Redirect to target path
      router.push(fromPath);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Something went wrong. Please try again.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div>
        <label
          htmlFor="email"
          style={{
            display: 'block',
            fontSize: '0.68rem',
            fontWeight: 600,
            color: 'var(--text-secondary)',
            textTransform: 'uppercase',
            letterSpacing: '0.12em',
            marginBottom: '8px',
          }}
        >
          Administrator Email
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter administrator email"
          required
          disabled={loading}
          style={{
            width: '100%',
            height: '46px',
            background: 'rgba(255, 255, 255, 0.02)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            padding: '0 16px',
            fontSize: '0.9rem',
            color: 'var(--cream)',
            outline: 'none',
            transition: 'all 0.3s ease',
          }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = 'var(--gold)';
            e.currentTarget.style.background = 'rgba(197, 168, 92, 0.02)';
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.02)';
          }}
        />
      </div>

      <div>
        <label
          htmlFor="password"
          style={{
            display: 'block',
            fontSize: '0.68rem',
            fontWeight: 600,
            color: 'var(--text-secondary)',
            textTransform: 'uppercase',
            letterSpacing: '0.12em',
            marginBottom: '8px',
          }}
        >
          Access Password
        </label>
        <div style={{ position: 'relative' }}>
          <span
            style={{
              position: 'absolute',
              left: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--text-muted)',
              display: 'flex',
            }}
          >
            <KeyRound size={16} />
          </span>
          <input
            id="password"
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••••••"
            required
            disabled={loading}
            style={{
              width: '100%',
              height: '46px',
              background: 'rgba(255, 255, 255, 0.02)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              padding: '0 44px',
              fontSize: '0.9rem',
              color: 'var(--cream)',
              outline: 'none',
              transition: 'all 0.3s ease',
              fontFamily: 'monospace',
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = 'var(--gold)';
              e.currentTarget.style.background = 'rgba(197, 168, 92, 0.02)';
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.02)';
            }}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            disabled={loading}
            style={{
              position: 'absolute',
              right: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'transparent',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              display: 'flex',
              padding: '4px',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--cream)')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div
          style={{
            background: 'rgba(239, 68, 68, 0.06)',
            border: '1px solid rgba(239, 68, 68, 0.2)',
            padding: '12px',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '10px',
          }}
        >
          <ShieldAlert size={16} style={{ color: '#ef4444', flexShrink: 0, marginTop: '1px' }} />
          <p style={{ fontSize: '0.75rem', color: '#f87171', lineHeight: '1.4', margin: 0 }}>
            {error}
          </p>
        </div>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={loading}
        style={{
          height: '46px',
          background: 'linear-gradient(135deg, var(--gold-dark), var(--gold))',
          border: 'none',
          color: 'var(--black)',
          fontSize: '0.75rem',
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '0.15em',
          cursor: loading ? 'not-allowed' : 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
          position: 'relative',
          overflow: 'hidden',
          marginTop: '8px',
        }}
        onMouseEnter={(e) => {
          if (!loading) {
            e.currentTarget.style.transform = 'translateY(-1px)';
            e.currentTarget.style.boxShadow = '0 8px 20px rgba(197, 168, 92, 0.25)';
          }
        }}
        onMouseLeave={(e) => {
          if (!loading) {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = 'none';
          }
        }}
      >
        {loading ? (
          <>
            <Loader2 size={16} className="animate-spin" />
            Authenticating...
          </>
        ) : (
          'Verify Password'
        )}
      </button>
    </form>
  );
}

export default function AdminLoginPage() {
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
        padding: '24px',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background Decorative Gradients */}
      <div
        style={{
          position: 'absolute',
          top: '-10%',
          right: '-10%',
          width: '50vw',
          height: '50vw',
          background: 'radial-gradient(circle, rgba(197,168,92,0.08) 0%, transparent 70%)',
          pointerEvents: 'none',
          filter: 'blur(60px)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: '-10%',
          left: '-10%',
          width: '50vw',
          height: '50vw',
          background: 'radial-gradient(circle, rgba(197,168,92,0.05) 0%, transparent 70%)',
          pointerEvents: 'none',
          filter: 'blur(60px)',
        }}
      />

      {/* Back to Home Link */}
      <Link
        href="/"
        style={{
          position: 'absolute',
          top: '32px',
          left: '32px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontFamily: 'var(--font-sans)',
          fontSize: '0.75rem',
          fontWeight: 600,
          color: 'var(--text-secondary)',
          textDecoration: 'none',
          textTransform: 'uppercase',
          letterSpacing: '0.15em',
          transition: 'color 0.2s ease',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--gold)')}
        onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-secondary)')}
      >
        <ArrowLeft size={14} />
        Back to restaurant
      </Link>

      {/* Main Container */}
      <div
        style={{
          width: '100%',
          maxWidth: '420px',
          background: 'var(--dark-card)',
          border: '1px solid var(--dark-border)',
          backdropFilter: 'blur(20px)',
          padding: '48px 40px',
          boxShadow: '0 24px 64px rgba(0, 0, 0, 0.6)',
          position: 'relative',
          zIndex: 1,
        }}
      >
        {/* Brand Header */}
        <div style={{ textAlign: 'center', marginBottom: '36px' }}>
          <div
            style={{
              width: '48px',
              height: '48px',
              background: 'linear-gradient(135deg, var(--gold-dark), var(--gold))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
              fontSize: '0.9rem',
              fontWeight: 800,
              color: 'var(--black)',
              letterSpacing: '0.05em',
            }}
          >
            TLS
          </div>
          <h1
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '1.8rem',
              fontWeight: 400,
              color: 'var(--cream)',
              marginBottom: '6px',
              letterSpacing: '-0.02em',
            }}
          >
            Administrator Login
          </h1>
          <p
            style={{
              fontSize: '0.72rem',
              color: 'var(--text-muted)',
              textTransform: 'uppercase',
              letterSpacing: '0.15em',
              fontWeight: 600,
            }}
          >
            Secure Staff Gateway
          </p>
        </div>

        {/* Suspense boundary around form for useSearchParams safety */}
        <Suspense fallback={
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '140px', gap: '12px' }}>
            <Loader2 size={24} className="animate-spin" style={{ color: 'var(--gold)' }} />
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Loading security verification...</p>
          </div>
        }>
          <LoginForm />
        </Suspense>
      </div>

      {/* Footer copyright */}
      <p style={{ fontSize: '0.62rem', color: 'var(--text-muted)', marginTop: '40px', letterSpacing: '0.05em' }}>
        &copy; {new Date().getFullYear()} The London Shakes. Admin Portal.
      </p>
    </div>
  );
}
