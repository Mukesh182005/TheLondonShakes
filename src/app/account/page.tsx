'use client';

import React, { useState } from 'react';
import { useRestaurantStore, useIsMounted } from '@/store/restaurantStore';
import { Calendar, History, LogOut, Award, Heart } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AccountPage() {
  const user = useRestaurantStore((state) => state.user);
  const login = useRestaurantStore((state) => state.login);
  const logout = useRestaurantStore((state) => state.logout);
  const reservations = useRestaurantStore((state) => state.reservations);
  const orders = useRestaurantStore((state) => state.orders);
  const cancelReservation = useRestaurantStore((state) => state.cancelReservation);

  const [email, setEmail] = useState('');
  const [name, setName] = useState('');

  const isMounted = useIsMounted();

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    login(email.trim().toLowerCase(), name.trim() || undefined);
    toast.success(`Welcome back, ${name || 'Valued Guest'}!`);
  };

  const userReservations = user
    ? reservations.filter(r => r.email.toLowerCase() === user.email.toLowerCase())
    : [];

  const userOrders = user
    ? orders.filter(o => o.address.email?.toLowerCase() === user.email.toLowerCase() || o.address.name === user.name)
    : [];

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

  /* ─── Login card ───────────────────────────────────────────── */
  if (!user) {
    return (
      <div className="page-wrapper" style={{
        background:     'var(--void)',
        display:        'flex',
        alignItems:     'center',
        justifyContent: 'center',
        minHeight:      '100vh',
      }}>
        <div style={{ maxWidth: '460px', width: '100%', padding: '40px var(--container-px)' }}>

          {/* Eyebrow */}
          <p style={{
            fontFamily:    'var(--font-sans)',
            fontSize:      '0.55rem',
            fontWeight:    600,
            letterSpacing: '0.42em',
            textTransform: 'uppercase',
            color:         'var(--gold)',
            textAlign:     'center',
            marginBottom:  '20px',
          }}>
            Member Access
          </p>

          {/* Card */}
          <div style={{
            background:  'var(--parchment, #FAF7F2)',
            border:      '1px solid rgba(158,128,67,0.2)',
            padding:     '48px 40px',
            boxShadow:   '0 4px 40px rgba(28,25,21,0.06)',
          }}>
            <h3 style={{
              fontFamily:   'var(--font-display)',
              fontSize:     '2rem',
              fontWeight:   300,
              color:        'var(--text-primary)',
              textAlign:    'center',
              marginBottom: '8px',
              letterSpacing:'-0.01em',
            }}>
              Gastronomy <em style={{ color: 'var(--gold)' }}>Login</em>
            </h3>

            {/* Gold rule */}
            <div style={{ width: '40px', height: '1px', background: 'var(--gold)', margin: '16px auto 20px', opacity: 0.5 }} />

            <p style={{
              color:        'var(--text-secondary)',
              fontSize:     '0.8rem',
              textAlign:    'center',
              lineHeight:   1.65,
              marginBottom: '36px',
              fontFamily:   'var(--font-serif)',
              fontStyle:    'italic',
            }}>
              Sign in to earn reservation points, save culinary preferences, and view your dining history.
            </p>

            <form onSubmit={handleLoginSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <label className="form-label" style={{ color: 'var(--text-primary)' }}>Email Address *</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  style={{ background: '#fff', border: '1px solid rgba(28,25,21,0.15)', color: 'var(--text-primary)' }}
                />
              </div>

              <div>
                <label className="form-label" style={{ color: 'var(--text-primary)' }}>Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  style={{ background: '#fff', border: '1px solid rgba(28,25,21,0.15)', color: 'var(--text-primary)' }}
                />
              </div>

              <button type="submit" className="btn-gold" style={{ width: '100%', marginTop: '8px' }}>
                <span>Access Profile</span>
              </button>
            </form>

            <p style={{
              marginTop:  '24px',
              textAlign:  'center',
              fontSize:   '0.68rem',
              color:      'var(--text-muted)',
              fontFamily: 'var(--font-sans)',
              letterSpacing:'0.04em',
            }}>
              Use <code style={{ color: 'var(--gold)' }}>admin@thelondon.co.uk</code> for admin access
            </p>
          </div>
        </div>
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
            <div className="flex items-center gap-4 mb-2">
              <span className="badge-gold">{user.membershipStatus} Tier Member</span>
              <span style={{ color: 'var(--text-secondary)', fontSize: '0.78rem' }}>Points: {user.tierPoints}</span>
            </div>
            <h1 className="section-title" style={{ marginBottom: '4px', color: 'var(--text-primary)' }}>
              Welcome back, <em style={{ color: 'var(--gold)' }}>{user.name}</em>
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.86rem' }}>
              Account: {user.email} {user.email === 'admin@thelondon.co.uk' && '· (Administrator)'}
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
                background: '#FAF7F2',
                border:     '1px solid rgba(158,128,67,0.15)',
                padding:    '40px',
                boxShadow:  '0 2px 20px rgba(28,25,21,0.04)',
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
                        background:     '#fff',
                        border:         '1px solid rgba(28,25,21,0.08)',
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
                background: '#FAF7F2',
                border:     '1px solid rgba(158,128,67,0.15)',
                padding:    '40px',
                boxShadow:  '0 2px 20px rgba(28,25,21,0.04)',
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
                  Online Order History ({userOrders.length})
                </h3>

                {userOrders.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-secondary)', fontFamily: 'var(--font-serif)', fontStyle: 'italic' }}>
                    No delivery or pickup orders found for this profile.
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {userOrders.map(order => (
                      <div key={order.id} style={{ background: '#fff', border: '1px solid rgba(28,25,21,0.08)', padding: '24px' }}>
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

                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '16px' }}>
                          {order.items.map(item => (
                            <span key={item.id} style={{
                              background: '#FAF7F2',
                              border:     '1px solid rgba(28,25,21,0.1)',
                              padding:    '4px 10px',
                              fontSize:   '0.75rem',
                              color:      'var(--text-secondary)',
                            }}>
                              {item.name} ×{item.qty}
                            </span>
                          ))}
                        </div>

                        <div className="flex justify-between items-center text-sm pt-4" style={{ borderTop: '1px solid rgba(28,25,21,0.08)' }}>
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

              {/* Rewards */}
              <div style={{
                background: '#FAF7F2',
                border:     '1px solid rgba(158,128,67,0.15)',
                padding:    '40px',
                boxShadow:  '0 2px 20px rgba(28,25,21,0.04)',
              }}>
                <Award size={24} color="var(--gold)" style={{ marginBottom: '16px' }} />
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', color: 'var(--text-primary)', marginBottom: '8px' }}>
                  Dining Rewards
                </h3>
                <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--gold)', marginBottom: '20px' }}>
                  {user.membershipStatus} · Multiplier: ×2.0
                </div>

                <p style={{ color: 'var(--text-secondary)', fontSize: '0.84rem', lineHeight: 1.65, marginBottom: '20px', fontFamily: 'var(--font-serif)', fontStyle: 'italic' }}>
                  You hold {user.tierPoints} tier points. Platinum unlocks at 1,000 pts — including VIP concierge reservations and private chef tastings.
                </p>

                {/* Progress bar */}
                <div style={{ height: '3px', background: 'rgba(28,25,21,0.1)', position: 'relative', overflow: 'hidden', borderRadius: '2px' }}>
                  <div style={{
                    position:   'absolute',
                    top:        0, left: 0, bottom: 0,
                    width:      `${Math.min(100, (user.tierPoints / 1000) * 100)}%`,
                    background: 'var(--gold)',
                    transition: 'width 1s ease',
                  }} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.6rem', color: 'var(--text-muted)', marginTop: '8px', letterSpacing: '0.08em' }}>
                  <span>0 PTS</span>
                  <span>1000 PTS (PLATINUM)</span>
                </div>
              </div>

              {/* Preferences */}
              <div style={{
                background: '#FAF7F2',
                border:     '1px solid rgba(158,128,67,0.15)',
                padding:    '40px',
                boxShadow:  '0 2px 20px rgba(28,25,21,0.04)',
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
                    <div key={label} style={{ borderBottom: '1px solid rgba(28,25,21,0.06)', paddingBottom: '12px' }}>
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
