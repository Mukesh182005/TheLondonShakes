'use client';

import React, { useState, useEffect } from 'react';
import { useRestaurantStore } from '@/store/restaurantStore';
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

  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Handle simulated login
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    
    // Automatically log in
    login(email.trim().toLowerCase(), name.trim() || undefined);
    toast.success(`Welcome back, ${name || 'Valued Guest'}!`);
  };

  // Filter reservations for current user
  const userReservations = user 
    ? reservations.filter(r => r.email.toLowerCase() === user.email.toLowerCase())
    : [];

  // Filter orders for current user
  const userOrders = user 
    ? orders.filter(o => o.address.email?.toLowerCase() === user.email.toLowerCase() || o.address.name === user.name)
    : [];

  const handleCancelBooking = (id: string) => {
    cancelReservation(id);
    toast.success('Reservation successfully cancelled.');
  };

  if (!isMounted) {
    return (
      <div className="page-wrapper" style={{ background: 'var(--black)', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <p style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-sans)', fontSize: '0.875rem' }}>Loading...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="page-wrapper" style={{ background: 'var(--black)', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <div style={{ maxWidth: '450px', width: '100%', padding: '40px var(--container-px)' }}>
          <div style={{ background: '#0d0d0d', border: '1px solid rgba(201,168,76,0.15)', padding: '40px' }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', color: 'var(--gold)', marginBottom: '8px', textAlign: 'center' }}>
              Gastronomy Login
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', textAlign: 'center', lineHeight: 1.5, marginBottom: '32px' }}>
              Sign in to earn reservation points, save culinary preferences, and view your dining histories. (Use `admin@thelondon.co.uk` to test admin privileges).
            </p>

            <form onSubmit={handleLoginSubmit} className="flex flex-col gap-6">
              <div>
                <label className="form-label">Email Address *</label>
                <input 
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                />
              </div>

              <div>
                <label className="form-label">Full Name</label>
                <input 
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                />
              </div>

              <button type="submit" className="btn-gold" style={{ width: '100%', marginTop: '12px' }}>
                <span>Access Profile</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-wrapper" style={{ background: 'var(--black)', color: 'var(--text-primary)' }}>
      
      {/* Profile Header Banner */}
      <div 
        style={{ 
          background: 'linear-gradient(180deg, #090a0c 0%, var(--dark-bg) 100%)', 
          padding: '80px 0 60px',
          borderBottom: '1px solid rgba(201, 168, 76, 0.08)'
        }}
      >
        <div className="container flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
          <div>
            <div className="flex items-center gap-4 mb-2">
              <span className="badge-gold">{user.membershipStatus} Tier Member</span>
              <span style={{ color: 'var(--text-secondary)', fontSize: '0.78rem' }}>Points: {user.tierPoints}</span>
            </div>
            <h1 className="section-title" style={{ marginBottom: '4px' }}>
              Welcome back, <em>{user.name}</em>
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.86rem' }}>
              Account: {user.email} {user.email === 'admin@thelondon.co.uk' && '· (Administrator)'}
            </p>
          </div>
          
          <button onClick={logout} className="btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', fontSize: '0.72rem' }}>
            <LogOut size={12} />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Profile Content Details */}
      <div style={{ padding: '80px 0 120px' }}>
        <div className="container">
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
            
            {/* Active Bookings (Column 1 & 2) */}
            <div className="lg:col-span-2 flex flex-col gap-12">
              
              {/* Active Reservations */}
              <div style={{ background: '#0d0d0d', border: '1px solid var(--dark-border)', padding: '40px' }}>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', color: 'var(--cream)', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Calendar size={18} color="var(--gold)" />
                  Your Table Reservations ({userReservations.length})
                </h3>

                {userReservations.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-secondary)' }}>
                    No active table reservations mapped to this profile.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {userReservations.map(res => (
                      <div key={res.id} style={{ background: 'var(--black)', border: '1px solid var(--dark-border-2)', padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                        <div>
                          <div className="flex justify-between items-center mb-4">
                            <span style={{ fontFamily: 'monospace', color: 'var(--gold)', fontSize: '0.82rem' }}>#{res.id}</span>
                            <span 
                              style={{ 
                                fontSize: '0.62rem', 
                                padding: '2px 8px', 
                                textTransform: 'uppercase', 
                                background: res.status === 'confirmed' ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)', 
                                color: res.status === 'confirmed' ? '#10b981' : '#ef4444', 
                                border: res.status === 'confirmed' ? '1px solid rgba(16,185,129,0.3)' : '1px solid rgba(239,68,68,0.3)' 
                              }}
                            >
                              {res.status}
                            </span>
                          </div>
                          
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '20px' }}>
                            <div>Date: <strong style={{ color: 'var(--cream)' }}>{res.date}</strong></div>
                            <div>Time: <strong style={{ color: 'var(--cream)' }}>{res.time}</strong></div>
                            <div>Guests: <strong style={{ color: 'var(--cream)' }}>{res.guests} Guests</strong></div>
                            <div>Occasion: <strong style={{ color: 'var(--cream)' }}>{res.occasion}</strong></div>
                          </div>
                        </div>

                        {res.status === 'confirmed' && (
                          <button 
                            onClick={() => handleCancelBooking(res.id)} 
                            style={{ 
                              background: 'none', 
                              border: '1px solid rgba(239,68,68,0.3)', 
                              color: '#ef4444', 
                              padding: '8px 0', 
                              fontSize: '0.68rem', 
                              letterSpacing: '0.1em', 
                              textTransform: 'uppercase',
                              cursor: 'pointer'
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
              <div style={{ background: '#0d0d0d', border: '1px solid var(--dark-border)', padding: '40px' }}>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', color: 'var(--cream)', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <History size={18} color="var(--gold)" />
                  Online Order History ({userOrders.length})
                </h3>

                {userOrders.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-secondary)' }}>
                    No delivery or pickup orders found for this profile.
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {userOrders.map(order => (
                      <div key={order.id} style={{ background: 'var(--black)', border: '1px solid var(--dark-border-2)', padding: '24px' }}>
                        <div className="flex flex-wrap justify-between items-center gap-4 mb-4">
                          <div>
                            <span style={{ fontFamily: 'monospace', color: 'var(--cream)', fontWeight: 600 }}>#{order.id}</span>
                            <span style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', marginLeft: '12px' }}>
                              {new Date(order.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          <span 
                            style={{
                              fontSize: '0.62rem',
                              padding: '2px 8px',
                              textTransform: 'uppercase',
                              fontWeight: 600,
                              background: order.status === 'delivered' ? 'rgba(16,185,129,0.1)' : 'rgba(245,158,11,0.1)',
                              color: order.status === 'delivered' ? '#10b981' : '#f59e0b',
                              border: order.status === 'delivered' ? '1px solid rgba(16,185,129,0.3)' : '1px solid rgba(245,158,11,0.3)'
                            }}
                          >
                            {order.status}
                          </span>
                        </div>
                        
                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '16px' }}>
                          {order.items.map(item => (
                            <span key={item.id} style={{ background: '#111', border: '1px solid var(--dark-border-2)', padding: '4px 10px', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                              {item.name} ×{item.qty}
                            </span>
                          ))}
                        </div>

                        <div className="flex justify-between items-center text-sm pt-4 border-t border-dark-border-2">
                          <span style={{ color: 'var(--text-secondary)' }}>Classification: {order.type.toUpperCase()}</span>
                          <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', color: 'var(--gold)' }}>₹{order.total}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>

            {/* Profile Preferences & Loyalty Panel (Column 3) */}
            <div className="flex flex-col gap-8">
              
              {/* Rewards Status */}
              <div style={{ background: 'var(--dark-card)', border: '1px solid var(--dark-border)', padding: '40px' }}>
                <Award size={24} color="var(--gold)" style={{ marginBottom: '16px' }} />
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', color: 'var(--cream)', marginBottom: '8px' }}>
                  Dining Rewards
                </h3>
                <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--gold)', marginBottom: '20px' }}>
                  Current level: {user.membershipStatus} (Multiplier: x2.0)
                </div>

                <p style={{ color: 'var(--text-secondary)', fontSize: '0.84rem', lineHeight: 1.6, marginBottom: '20px' }}>
                  You currently hold **{user.tierPoints} tier points**. Platinum status unlocks at 1,000 points, yielding VIP concierge reservations and entry to private chef tastings.
                </p>

                {/* Progress bar simulation */}
                <div style={{ height: '3px', background: '#222', position: 'relative', overflow: 'hidden' }}>
                  <div style={{ position: 'absolute', top: 0, left: 0, bottom: 0, width: `${Math.min(100, (user.tierPoints / 1000) * 100)}%`, background: 'var(--gold)' }} />
                </div>
                <div className="flex justify-between text-[0.62rem] color-text-secondary mt-2">
                  <span>0 PTS</span>
                  <span>1000 PTS (PLATINUM)</span>
                </div>
              </div>

              {/* Culinary Preferences */}
              <div style={{ background: 'var(--dark-card)', border: '1px solid var(--dark-border)', padding: '40px' }}>
                <Heart size={20} color="var(--gold)" style={{ marginBottom: '16px' }} />
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', color: 'var(--cream)', marginBottom: '16px' }}>
                  Saved Preferences
                </h3>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div>
                    <div style={{ color: 'var(--cream)', fontSize: '0.82rem', fontWeight: 600, marginBottom: '4px' }}>Favorite Dishes</div>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.78rem' }}>Strawberry Monster, Ice Cream Waffle</div>
                  </div>
                  <div>
                    <div style={{ color: 'var(--cream)', fontSize: '0.82rem', fontWeight: 600, marginBottom: '4px' }}>Dietary Constraints</div>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.78rem' }}>Gluten-conscious, Shellfish allergy</div>
                  </div>
                  <div>
                    <div style={{ color: 'var(--cream)', fontSize: '0.82rem', fontWeight: 600, marginBottom: '4px' }}>Preferred Seating</div>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.78rem' }}>Hearth-side Counter / Main Room Vault</div>
                  </div>
                </div>
              </div>

            </div>

          </div>

        </div>
      </div>

    </div>
  );
}
