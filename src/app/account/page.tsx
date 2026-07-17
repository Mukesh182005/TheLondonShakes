'use client';

import React, { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useRestaurantStore, useIsMounted, Order } from '@/store/restaurantStore';
import { Calendar, History, LogOut, Award, Heart } from 'lucide-react';
import toast from 'react-hot-toast';

const snakeDishes = [
  'Ferrero Rocher Shake',
  'Tandoori Paneer Pizza',
  'Classic London Shake',
  'Cheese Garlic Bread',
  'KitKat Shake',
  'Blue Lagoon Mocktail',
  'Double Cheese Burger',
  'Veg Steamed Momos',
  'Sizzling Brownie',
  'Peri Peri Fries'
];

function AccountPageContent() {
  const router = useRouter();
  const user = useRestaurantStore((state) => state.user);
  const login = useRestaurantStore((state) => state.login);
  const logout = useRestaurantStore((state) => state.logout);
  const reservations = useRestaurantStore((state) => state.reservations);
  const orders = useRestaurantStore((state) => state.orders);
  const cancelReservation = useRestaurantStore((state) => state.cancelReservation);

  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect');

  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');

  const isMounted = useIsMounted();

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    const cleanEmail = email.trim().toLowerCase();
    
    try {
      const checkRes = await fetch(`/api/auth/check-staff?email=${encodeURIComponent(cleanEmail)}`);
      if (checkRes.ok) {
        const { isStaff } = await checkRes.json();
        if (isStaff) {
          toast.success('Redirecting to Administrative login...');
          router.push(`/admin/login?from=${encodeURIComponent(redirect || '/admin')}`);
          return;
        }
      }
    } catch (err) {
      console.warn('Failed to verify staff status:', err);
    }

    login(cleanEmail, name.trim() || undefined, phone.trim() || undefined);
    toast.success(`Welcome back, ${name || 'Valued Guest'}!`);
    if (redirect) {
      router.push(redirect);
    }
  };

  const userReservations = user
    ? reservations.filter(r => r.email.toLowerCase() === user.email.toLowerCase())
    : [];

  const userOrders = user
    ? orders.filter(o => o.address.email?.toLowerCase() === user.email.toLowerCase() || o.address.name === user.name)
    : [];

  // Background polling for active user orders status
  React.useEffect(() => {
    if (!user) return;
    const activeUserOrders = userOrders.filter(
      (o) => o.status !== 'delivered' && o.status !== 'cancelled'
    );
    if (activeUserOrders.length === 0) return;

    const setOrders = useRestaurantStore.getState().setOrders;

    const pollActiveOrders = async () => {
      // Respect visibility API
      if (typeof document !== 'undefined' && document.visibilityState === 'hidden') {
        return;
      }

      for (const order of activeUserOrders) {
        try {
          const res = await fetch(`/api/orders?id=${order.id}`);
          if (res.ok) {
            const updatedOrder = await res.json();
            if (updatedOrder && updatedOrder.status) {
              setOrders((prev: Order[]) =>
                prev.map((o) => (o.id === updatedOrder.id ? { ...o, ...updatedOrder } : o))
              );
            }
          }
        } catch (err) {
          console.warn('Failed to poll order status for account:', err);
        }
      }
    };

    // Run immediately
    pollActiveOrders();

    const interval = setInterval(pollActiveOrders, 10000); // 10 seconds

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        pollActiveOrders();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [user, userOrders.map(o => `${o.id}-${o.status}`).join(',')]);

  const handleCancelBooking = (id: string) => {
    cancelReservation(id);
    toast.success('Reservation successfully cancelled.');
  };

  /* ─── Loading skeleton ─────────────────────────────────────── */
  if (!isMounted) {
    return (
      <div className="page-wrapper" style={{ background: 'var(--void)', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <p style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-sans)', fontSize: '0.875rem' }}>Loading…</p>
      </div>
    );
  }

  /* ─── Login split screen layout ────────────────────────────── */
  if (!user) {
    const duplicatedDishes = [...snakeDishes, ...snakeDishes];
    return (
      <div className="page-wrapper" style={{
        background:     'var(--void)',
        minHeight:      '100vh',
        display:        'flex',
        flexDirection:  'row',
      }}>
        {/* Left Panel: Brand & Visuals (Desktop only) */}
        <div style={{
          flex: '0 0 42%',
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '60px 48px',
          background: '#0B0412',
          overflow: 'hidden',
          borderRight: '1px solid rgba(197, 168, 92, 0.15)',
        }}
        className="login-visual-panel"
        >
          {/* Background image */}
          <div style={{ position: 'absolute', inset: 0, opacity: 0.45 }}>
            <Image
              src="/london-reservations-bg.jpg"
              alt="The London Shakes Ambiance"
              fill
              priority
              sizes="42vw"
              style={{ objectFit: 'cover' }}
            />
          </div>
          
          {/* Subtle gradient overlay */}
          <div style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(180deg, rgba(11, 4, 18, 0.7) 0%, rgba(11, 4, 18, 0.92) 100%)',
            zIndex: 1,
          }} />

          {/* Logo / Brand top */}
          <div style={{ position: 'relative', zIndex: 2 }}>
            <Link href="/" style={{ textDecoration: 'none' }}>
              <span style={{
                fontFamily: 'var(--font-display)',
                fontSize: '1.45rem',
                fontWeight: 300,
                color: '#FAF7F2',
                letterSpacing: '0.04em',
                lineHeight: 1,
                whiteSpace: 'nowrap',
              }}>
                THE LONDON <em style={{ fontStyle: 'italic', fontWeight: 500, color: '#FF1E39', textShadow: '0 0 20px rgba(255,30,57,0.5)' }}>SHAKES</em>
              </span>
            </Link>
          </div>

          {/* Snake scrolling effect in the wide blank space */}
          <div style={{
            position: 'absolute',
            top: '130px',
            bottom: '245px',
            left: 0,
            right: 0,
            overflow: 'hidden',
            pointerEvents: 'none',
            zIndex: 2,
            maskImage: 'linear-gradient(to bottom, transparent 0%, black 15%, black 85%, transparent 100%)',
            WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 15%, black 85%, transparent 100%)',
          }}>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '24px',
              animation: 'verticalScroll 30s linear infinite',
            }}>
              {duplicatedDishes.map((dish, idx) => (
                <div key={idx} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px', width: '100%' }}>
                  <span
                    style={{
                      display: 'inline-block',
                      fontFamily: 'var(--font-sans)',
                      fontSize: '0.82rem',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      color: '#dfba6b',
                      opacity: 0.85,
                      letterSpacing: '0.12em',
                      textShadow: '0 0 14px rgba(223,186,107,0.45)',
                      animation: 'snakeSway 6s ease-in-out infinite alternate',
                      animationDelay: `${-idx * 0.5}s`,
                    }}
                  >
                    {dish}
                  </span>
                  <span
                    style={{
                      display: 'inline-block',
                      color: '#FF1E39',
                      fontSize: '0.85rem',
                      opacity: 0.75,
                      textShadow: '0 0 10px rgba(255,30,57,0.45)',
                      animation: 'snakeSway 6s ease-in-out infinite alternate',
                      animationDelay: `${-idx * 0.5 - 0.25}s`,
                    }}
                  >
                    ★
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom text */}
          <div style={{ position: 'relative', zIndex: 2, maxWidth: '340px' }}>
            <span style={{
              fontFamily: 'var(--font-sans)',
              fontSize: '0.55rem',
              fontWeight: 700,
              letterSpacing: '0.3em',
              textTransform: 'uppercase',
              color: '#c5a85c',
              display: 'block',
              marginBottom: '14px',
            }}>
              Silchar · Est. 2021
            </span>
            <h2 style={{
              fontFamily: 'var(--font-display)',
              fontSize: '2.5rem',
              color: '#FAF7F2',
              lineHeight: 1.1,
              marginBottom: '16px',
              fontWeight: 300,
            }}>
              Sip, Savour,<br />
              <em style={{ fontStyle: 'italic', color: '#FF1E39', textShadow: '0 0 20px rgba(255,30,57,0.5)' }}>Repeat.</em>
            </h2>
            <p style={{
              fontFamily: 'var(--font-serif)',
              fontSize: '0.85rem',
              color: 'rgba(250, 247, 242, 0.8)',
              lineHeight: 1.6,
              margin: 0,
              fontStyle: 'italic',
            }}>
              Enter your details to view your profile, reservations, and explore our premium menu.
            </p>
          </div>
        </div>

        {/* Right Panel: Form */}
        <div style={{
          flex: '1',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'var(--black)',
          padding: '60px 24px',
          position: 'relative',
          overflow: 'hidden',
        }}>
          {/* Mobile-only snake pattern background */}
          <div
            className="login-mobile-snake"
            style={{
              position: 'absolute',
              inset: 0,
              overflow: 'hidden',
              pointerEvents: 'none',
              zIndex: 0,
              opacity: 0.6,
              maskImage: 'linear-gradient(to bottom, transparent 0%, black 15%, black 85%, transparent 100%)',
              WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 15%, black 85%, transparent 100%)',
            }}
          >
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '24px',
              animation: 'verticalScroll 30s linear infinite',
              paddingTop: '20px',
            }}>
              {duplicatedDishes.map((dish, idx) => (
                <div key={`mobile-snake-${idx}`} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px', width: '100%' }}>
                  <span
                    style={{
                      display: 'inline-block',
                      fontFamily: 'var(--font-sans)',
                      fontSize: '0.82rem',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      color: '#dfba6b',
                      opacity: 0.85,
                      letterSpacing: '0.12em',
                      textShadow: '0 0 14px rgba(223,186,107,0.45)',
                      animation: 'snakeSway 6s ease-in-out infinite alternate',
                      animationDelay: `${-idx * 0.5}s`,
                    }}
                  >
                    {dish}
                  </span>
                  <span
                    style={{
                      display: 'inline-block',
                      color: '#FF1E39',
                      fontSize: '0.85rem',
                      opacity: 0.75,
                      textShadow: '0 0 10px rgba(255,30,57,0.45)',
                      animation: 'snakeSway 6s ease-in-out infinite alternate',
                      animationDelay: `${-idx * 0.5 - 0.25}s`,
                    }}
                  >
                    ★
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Slant decorative elements matching the image */}
          <div style={{
            position: 'absolute',
            top: 0,
            right: 0,
            width: '260px',
            height: '260px',
            background: 'radial-gradient(circle, rgba(232, 16, 42, 0.04) 0%, transparent 70%)',
            pointerEvents: 'none',
          }} />
          
          <div style={{ maxWidth: '420px', width: '100%', padding: '40px 32px', background: 'var(--paper)', border: '1px solid var(--paper-border)', borderRadius: '12px', boxShadow: '0 20px 48px rgba(0, 0, 0, 0.08)', backdropFilter: 'blur(10px)', animation: 'cardFadeIn 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards', position: 'relative', zIndex: 1 }}>
            {/* Header */}
            <div style={{ textAlign: 'center', marginBottom: '32px' }}>
              <span style={{
                fontFamily: 'var(--font-sans)',
                fontSize: '0.6rem',
                fontWeight: 700,
                letterSpacing: '0.3em',
                textTransform: 'uppercase',
                color: 'var(--gold)',
                display: 'block',
                marginBottom: '10px',
              }}>
                Welcome Back
              </span>
              <h1 style={{
                fontFamily: 'var(--font-display)',
                fontSize: '2.4rem',
                color: 'var(--text-primary)',
                fontWeight: 300,
                letterSpacing: '-0.02em',
                margin: 0,
              }}>
                Gastronomy <em style={{ fontStyle: 'italic', color: '#E8102A' }}>Login</em>
              </h1>
              <div style={{ width: '45px', height: '2px', background: '#E8102A', margin: '14px auto 0', borderRadius: '10px' }} />
            </div>

            {/* Form */}
            <form onSubmit={handleLoginSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <label className="form-label" style={{ color: 'var(--text-secondary)', fontWeight: 700, fontSize: '0.65rem', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '8px', display: 'block', fontFamily: 'var(--font-sans)' }}>Email Address *</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  style={{
                    background: 'var(--paper)',
                    border: '1px solid var(--dark-border)',
                    borderRadius: '4px',
                    color: 'var(--text-primary)',
                    padding: '13px 16px',
                    fontSize: '0.85rem',
                    width: '100%',
                    transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                    boxSizing: 'border-box',
                    outline: 'none',
                  }}
                  className="login-input"
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = '#E11D2E';
                    e.currentTarget.style.boxShadow = '0 0 10px rgba(225, 29, 46, 0.15)';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = 'var(--dark-border)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                />
              </div>

              <div>
                <label className="form-label" style={{ color: 'var(--text-secondary)', fontWeight: 700, fontSize: '0.65rem', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '8px', display: 'block', fontFamily: 'var(--font-sans)' }}>Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your full name"
                  style={{
                    background: 'var(--paper)',
                    border: '1px solid var(--dark-border)',
                    borderRadius: '4px',
                    color: 'var(--text-primary)',
                    padding: '13px 16px',
                    fontSize: '0.85rem',
                    width: '100%',
                    transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                    boxSizing: 'border-box',
                    outline: 'none',
                  }}
                  className="login-input"
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = 'var(--gold)';
                    e.currentTarget.style.boxShadow = '0 0 10px rgba(197, 168, 92, 0.15)';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = 'var(--dark-border)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                />
              </div>

              <div>
                <label className="form-label" style={{ color: 'var(--text-secondary)', fontWeight: 700, fontSize: '0.65rem', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '8px', display: 'block', fontFamily: 'var(--font-sans)' }}>Mobile Number</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 XXXXX XXXXX"
                  style={{
                    background: 'var(--paper)',
                    border: '1px solid var(--dark-border)',
                    borderRadius: '4px',
                    color: 'var(--text-primary)',
                    padding: '13px 16px',
                    fontSize: '0.85rem',
                    width: '100%',
                    transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                    boxSizing: 'border-box',
                    outline: 'none',
                  }}
                  className="login-input"
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = 'var(--gold)';
                    e.currentTarget.style.boxShadow = '0 0 10px rgba(197, 168, 92, 0.15)';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = 'var(--dark-border)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                />
              </div>

              <button
                type="submit"
                style={{
                  background: 'linear-gradient(135deg, #FF1E39, #E8102A 55%, #B50016)',
                  border: 'none',
                  borderRadius: '4px',
                  color: '#fff',
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  letterSpacing: '0.2em',
                  padding: '15px',
                  cursor: 'pointer',
                  transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                  boxShadow: '0 8px 24px rgba(232, 16, 42, 0.2)',
                  marginTop: '10px',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 16px 36px rgba(232, 16, 42, 0.35)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 8px 24px rgba(232, 16, 42, 0.2)';
                }}
              >
                Access Profile
              </button>
            </form>
          </div>
        </div>

        {/* CSS for responsiveness */}
        <style>{`
          @media (max-width: 991px) {
            .login-visual-panel {
              display: none !important;
            }
          }
          .login-mobile-snake {
            display: none !important;
          }
          @media (max-width: 991px) {
            .login-mobile-snake {
              display: block !important;
            }
          }
          .login-input:focus {
            outline: none !important;
            border-color: #E8102A !important;
            box-shadow: 0 0 0 3px rgba(232, 16, 42, 0.08) !important;
          }
          @keyframes verticalScroll {
            0% {
              transform: translateY(-50%);
            }
            100% {
              transform: translateY(0%);
            }
          }
          @keyframes snakeSway {
            0% {
              transform: translateX(-40px) rotate(-3deg);
            }
            100% {
              transform: translateX(40px) rotate(3deg);
            }
          }
        `}</style>
      </div>
    );
  }

  /* ─── Logged-in profile ────────────────────────────────────── */
  return (
    <div className="page-wrapper" style={{ background: 'var(--void)', color: 'var(--text-primary)' }}>

      {/* Profile Header Banner */}
      <div style={{
        background:   'var(--void)',
        padding:      '80px 0 60px',
        borderBottom: '1px solid rgba(158,128,67,0.15)',
      }}>
        <div className="container flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
          <div>
            <h1 className="section-title" style={{ marginBottom: '4px', color: 'var(--text-primary)' }}>
              Welcome back, <em style={{ color: 'var(--gold)' }}>{user.name}</em>
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.86rem' }}>
              Account: {user.email} {user.email === 'thelondonshakes.silchar@gmail.com' && '· (Administrator)'}
            </p>
          </div>

          <button onClick={logout} style={{
            display:       'flex',
            alignItems:    'center',
            gap:           '8px',
            padding:       '10px 20px',
            fontSize:      '0.72rem',
            fontFamily:    'var(--font-sans)',
            fontWeight:    600,
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            color:         'var(--text-primary)',
            background:    'transparent',
            border:        '1px solid rgba(28,25,21,0.2)',
            cursor:        'pointer',
            transition:    'all 0.3s ease',
          }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.background = 'var(--text-primary)';
              (e.currentTarget as HTMLElement).style.color = 'var(--on-dark)';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.background = 'transparent';
              (e.currentTarget as HTMLElement).style.color = 'var(--text-primary)';
            }}
          >
            <LogOut size={12} />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Profile Content */}
      <div style={{ padding: '80px 0 120px' }}>
        <div className="container">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">

            {/* Active Bookings (Col 1 & 2) */}
            <div className="lg:col-span-2 flex flex-col gap-12">

              {/* Reservations */}
              <div style={{
                background: 'var(--paper)',
                border:     '1px solid var(--paper-border)',
                padding:    '40px',
                boxShadow:  '0 2px 20px rgba(0,0,0,0.04)',
              }}>
                <h3 style={{
                  fontFamily:   'var(--font-display)',
                  fontSize:     '1.4rem',
                  color:        'var(--text-primary)',
                  marginBottom: '24px',
                  display:      'flex',
                  alignItems:   'center',
                  gap:          '10px',
                }}>
                  <Calendar size={18} color="var(--gold)" />
                  Your Table Reservations ({userReservations.length})
                </h3>

                {userReservations.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-secondary)', fontFamily: 'var(--font-serif)', fontStyle: 'italic' }}>
                    No active table reservations mapped to this profile.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {userReservations.map(res => (
                      <div key={res.id} style={{
                        background:     'var(--dark-card)',
                        border:         '1px solid var(--dark-border)',
                        padding:        '24px',
                        display:        'flex',
                        flexDirection:  'column',
                        justifyContent: 'space-between',
                      }}>
                        <div>
                          <div className="flex justify-between items-center mb-4">
                            <span style={{ fontFamily: 'monospace', color: 'var(--gold)', fontSize: '0.82rem' }}>#{res.id}</span>
                            <span style={{
                              fontSize:       '0.62rem',
                              padding:        '2px 8px',
                              textTransform:  'uppercase',
                              background:     res.status === 'confirmed' ? 'rgba(16,185,129,0.08)' : 'rgba(239,68,68,0.08)',
                              color:          res.status === 'confirmed' ? '#10b981' : '#ef4444',
                              border:         res.status === 'confirmed' ? '1px solid rgba(16,185,129,0.3)' : '1px solid rgba(239,68,68,0.3)',
                            }}>
                              {res.status}
                            </span>
                          </div>

                          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '20px' }}>
                            <div>Date: <strong style={{ color: 'var(--text-primary)' }}>{res.date}</strong></div>
                            <div>Time: <strong style={{ color: 'var(--text-primary)' }}>{res.time}</strong></div>
                            <div>Guests: <strong style={{ color: 'var(--text-primary)' }}>{res.guests} Guests</strong></div>
                            <div>Occasion: <strong style={{ color: 'var(--text-primary)' }}>{res.occasion}</strong></div>
                          </div>
                        </div>

                        {res.status === 'confirmed' && (
                          <button
                            onClick={() => handleCancelBooking(res.id)}
                            style={{
                              background:    'none',
                              border:        '1px solid rgba(239,68,68,0.3)',
                              color:         '#ef4444',
                              padding:       '8px 0',
                              fontSize:      '0.68rem',
                              letterSpacing: '0.1em',
                              textTransform: 'uppercase',
                              cursor:        'pointer',
                            }}
                            className="hover:bg-red-500/10 transition-colors"
                          >
                            Cancel Reservation
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Order History */}
              <div style={{
                background: 'var(--paper)',
                border:     '1px solid var(--paper-border)',
                padding:    '40px',
                boxShadow:  '0 2px 20px rgba(0,0,0,0.04)',
              }}>
                <h3 style={{
                  fontFamily:   'var(--font-display)',
                  fontSize:     '1.4rem',
                  color:        'var(--text-primary)',
                  marginBottom: '24px',
                  display:      'flex',
                  alignItems:   'center',
                  gap:          '10px',
                }}>
                  <History size={18} color="var(--gold)" />
                  Order History ({userOrders.length})
                </h3>

                {userOrders.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-secondary)', fontFamily: 'var(--font-serif)', fontStyle: 'italic' }}>
                    No delivery or pickup orders found for this profile.
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {userOrders.map(order => (
                      <div key={order.id} style={{ background: 'var(--dark-card)', border: '1px solid var(--dark-border)', padding: '24px' }}>
                        <div className="flex flex-wrap justify-between items-center gap-4 mb-4">
                          <div>
                            <span style={{ fontFamily: 'monospace', color: 'var(--text-primary)', fontWeight: 600 }}>#{order.id}</span>
                            <span style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', marginLeft: '12px' }}>
                              {new Date(order.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          <span style={{
                            fontSize:      '0.62rem',
                            padding:       '2px 8px',
                            textTransform: 'uppercase',
                            fontWeight:    600,
                            background:    order.status === 'delivered' ? 'rgba(16,185,129,0.08)' : 'rgba(245,158,11,0.08)',
                            color:         order.status === 'delivered' ? '#10b981' : '#f59e0b',
                            border:        order.status === 'delivered' ? '1px solid rgba(16,185,129,0.3)' : '1px solid rgba(245,158,11,0.3)',
                          }}>
                            {order.status}
                          </span>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
                          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                            {order.items
                              .filter((item: any) => !item.isAdditive && item.id !== 'discount' && item.id !== 'tax-cgst' && item.id !== 'tax-sgst')
                              .map(item => (
                                <span key={item.id} style={{
                                  background: 'var(--paper)',
                                  border:     '1px solid var(--dark-border)',
                                  padding:    '4px 10px',
                                  fontSize:   '0.75rem',
                                  color:      'var(--text-secondary)',
                                }}>
                                  {item.name} ×{item.qty}
                                </span>
                              ))
                            }
                          </div>
                          {order.items.some((item: any) => item.isAdditive || item.id === 'discount' || item.id === 'tax-cgst' || item.id === 'tax-sgst') && (
                            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', fontSize: '0.72rem', color: 'var(--text-secondary)', opacity: 0.85 }}>
                              {order.items
                                .filter((item: any) => item.isAdditive || item.id === 'discount' || item.id === 'tax-cgst' || item.id === 'tax-sgst')
                                .map((item: any, idx: number) => (
                                  <span key={idx} style={{ fontStyle: 'italic' }}>
                                    • {item.name}: {item.price < 0 ? '-' : ''}₹{Math.abs(item.price)}
                                  </span>
                                ))
                              }
                            </div>
                          )}
                        </div>

                        <div className="flex justify-between items-center text-sm pt-4" style={{ borderTop: '1px solid var(--dark-border)' }}>
                          <span style={{ color: 'var(--text-secondary)', fontSize: '0.78rem' }}>Type: {order.type.toUpperCase()}</span>
                          <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', color: 'var(--text-primary)' }}>₹{order.total}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>

            {/* Sidebar — Rewards & Preferences (Col 3) */}
            <div className="flex flex-col gap-8">

              {/* Membership Status */}
              <div style={{
                background: 'var(--paper)',
                border:     '1px solid var(--paper-border)',
                padding:    '40px',
                boxShadow:  '0 2px 20px rgba(0,0,0,0.04)',
              }}>
                <Award size={24} color="var(--gold)" style={{ marginBottom: '16px' }} />
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', marginBottom: '8px' }}>
                  <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', color: 'var(--text-primary)', margin: 0 }}>
                    Gastronomy Membership
                  </h3>
                  <span style={{ fontSize: '0.55rem', background: 'rgba(197,168,92,0.1)', color: 'var(--gold)', padding: '2px 6px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', border: '1px solid rgba(197,168,92,0.2)' }}>
                    Coming Soon
                  </span>
                </div>
                <p style={{ fontFamily: 'var(--font-serif)', color: 'var(--text-secondary)', lineHeight: 1.6, fontSize: '0.82rem', fontStyle: 'italic', margin: 0 }}>
                  Membership tiers and exclusive reservation perks will be launching soon.
                </p>
              </div>

              {/* Preferences */}
              <div style={{
                background: 'var(--paper)',
                border:     '1px solid var(--paper-border)',
                padding:    '40px',
                boxShadow:  '0 2px 20px rgba(0,0,0,0.04)',
              }}>
                <Heart size={20} color="var(--gold)" style={{ marginBottom: '16px' }} />
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', color: 'var(--text-primary)', marginBottom: '16px' }}>
                  Saved Preferences
                </h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {[
                    { label: 'Favourite Dishes', value: 'Strawberry Monster, Ice Cream Waffle' },
                    { label: 'Dietary Constraints', value: 'Gluten-conscious, Shellfish allergy' },
                    { label: 'Preferred Seating', value: 'Hearth-side Counter / Main Room Vault' },
                  ].map(({ label, value }) => (
                    <div key={label} style={{ borderBottom: '1px solid var(--dark-border)', paddingBottom: '12px' }}>
                      <div style={{ color: 'var(--text-primary)', fontSize: '0.82rem', fontWeight: 600, marginBottom: '4px', fontFamily: 'var(--font-sans)' }}>{label}</div>
                      <div style={{ color: 'var(--text-secondary)', fontSize: '0.78rem', fontFamily: 'var(--font-serif)', fontStyle: 'italic' }}>{value}</div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>

    </div>
  );
}

export default function AccountPage() {
  return (
    <Suspense fallback={
      <div className="page-wrapper" style={{ background: 'var(--void)', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <p style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-sans)', fontSize: '0.875rem' }}>Loading…</p>
      </div>
    }>
      <AccountPageContent />
      <style>{`
        @keyframes cardFadeIn {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </Suspense>
  );
}
