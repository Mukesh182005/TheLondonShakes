'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useRestaurantStore } from '@/store/restaurantStore';
import {
  LayoutDashboard, ShoppingBag, Calendar, UtensilsCrossed,
  MapPin, Users, Truck, ClipboardList, BarChart2, Settings,
  LogOut, ChevronRight, Menu, X, AlertCircle, Image as ImageIcon,
} from 'lucide-react';

const navGroups = [
  {
    label: 'Operations',
    items: [
      { label: 'Dashboard',       href: '/admin',                  icon: LayoutDashboard },
      { label: 'Live Orders',     href: '/admin/orders',            icon: ShoppingBag },
      { label: 'Table Orders',    href: '/admin/table-orders',      icon: ClipboardList },
      { label: 'Kitchen Display', href: '/admin/kds',               icon: UtensilsCrossed },
      { label: 'Floor & POS',     href: '/admin/floor',             icon: MapPin },
      { label: 'Reservations',    href: '/admin/reservations',      icon: Calendar },
      { label: 'Deliveries',      href: '/admin/delivery',          icon: Truck },
    ],
  },
  {
    label: 'Management',
    items: [
      { label: 'Menu Editor',     href: '/admin/menu',      icon: ClipboardList },
      { label: 'Gallery Manager', href: '/admin/gallery',   icon: ImageIcon },
      { label: 'Table Orders',    href: '/admin/table-orders', icon: ClipboardList },
      { label: 'Customers',       href: '/admin/customers', icon: Users },
      { label: 'Analytics',       href: '/admin/analytics', icon: BarChart2 },
      { label: 'Staff & HR',      href: '/admin/hr',        icon: Users },
    ],
  },
  {
    label: 'System',
    items: [
      { label: 'Site Settings', href: '/admin/settings',   icon: Settings },
    ],
  },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router   = useRouter();
  const user     = useRestaurantStore((s) => s.user);
  const logout   = useRestaurantStore((s) => s.logout);
  const orders   = useRestaurantStore((s) => s.orders);
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
  }, []);

  const [sessionVerified, setSessionVerified] = useState(false);

  const isAdmin = user?.email === 'admin@thelondon.co.uk';

  useEffect(() => {
    if (!hydrated) return;
    if (pathname === '/admin/login') return;
    if (!user) {
      router.push('/admin/login');
    } else if (user.email !== 'admin@thelondon.co.uk') {
      router.push('/');
    } else {
      // Verify session cookie on the server
      fetch('/api/admin-auth')
        .then((res) => {
          if (!res.ok) throw new Error('Invalid session');
          setSessionVerified(true);
        })
        .catch(() => {
          logout();
          router.push('/admin/login');
        });
    }
  }, [user, router, pathname, hydrated, logout]);

  const activeOrders = orders.filter((o) => o.status === 'preparing' || o.status === 'out for delivery').length;

  const isActive = (href: string) => {
    if (href === '/admin') return pathname === '/admin';
    return pathname.startsWith(href);
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/admin-auth', { method: 'DELETE' });
    } catch (err) {
      console.error('Logout error:', err);
    }
    logout();
    router.push('/');
  };

  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  if (!hydrated || !user || !sessionVerified) {
    return (
      <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'var(--black)' }}>
        <p style={{ color:'var(--text-secondary)', fontFamily:'var(--font-sans)', fontSize:'0.875rem' }}>Authenticating...</p>
      </div>
    );
  }

  const sidebarContent = (
    <aside style={{
      display:        'flex',
      flexDirection:  'column',
      height:         '100%',
      background:     'var(--void)',
      borderRight:    '1px solid var(--dark-border)',
      width:          collapsed ? '72px' : '260px',
      transition:     'width 0.3s cubic-bezier(0.16,1,0.3,1)',
      overflow:       'hidden',
      flexShrink:     0,
    }}>
      {/* Logo */}
      <div style={{
        padding:      '24px 20px',
        borderBottom: '1px solid var(--dark-border)',
        display:      'flex',
        alignItems:   'center',
        gap:          '12px',
        flexShrink:   0,
      }}>
        <div style={{
          width:      '36px',
          height:     '36px',
          background: 'linear-gradient(135deg, var(--gold-dark), var(--gold))',
          display:    'flex',
          alignItems: 'center',
          justifyContent:'center',
          flexShrink: 0,
          fontSize:   '0.72rem',
          fontWeight: 700,
          color:      'var(--black)',
          letterSpacing:'0.05em',
        }}>
          TLS
        </div>
        {!collapsed && (
          <div>
            <p style={{ fontFamily:'var(--font-display)', fontSize:'0.95rem', color:'var(--cream)', lineHeight:1 }}>
              The London Shakes
            </p>
            <p style={{ fontFamily:'var(--font-sans)', fontSize:'0.56rem', fontWeight:600, letterSpacing:'0.2em', textTransform:'uppercase', color:'var(--gold)', opacity:0.7 }}>
              Admin Panel
            </p>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav style={{ flex:1, overflowY:'auto', padding:'16px 0' }}>
        {navGroups.map((group) => (
          <div key={group.label} style={{ marginBottom:'8px' }}>
            {!collapsed && (
              <p style={{
                fontFamily:    'var(--font-sans)',
                fontSize:      '0.55rem',
                fontWeight:    700,
                letterSpacing: '0.25em',
                textTransform: 'uppercase',
                color:         'var(--text-muted)',
                padding:       '8px 20px 6px',
              }}>
                {group.label}
              </p>
            )}
            {group.items.map((item) => {
              const Icon    = item.icon;
              const active  = isActive(item.href);
              const hasAlert = item.label === 'Live Orders' && activeOrders > 0;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  style={{
                    display:       'flex',
                    alignItems:    'center',
                    gap:           '12px',
                    padding:       collapsed ? '12px 0' : '11px 20px',
                    justifyContent: collapsed ? 'center' : 'flex-start',
                    fontFamily:    'var(--font-sans)',
                    fontSize:      '0.78rem',
                    fontWeight:    active ? 600 : 400,
                    color:         active ? 'var(--gold)' : 'var(--text-secondary)',
                    background:    active ? 'rgba(197,168,92,0.06)' : 'transparent',
                    borderLeft:    active ? '2px solid var(--gold)' : '2px solid transparent',
                    textDecoration:'none',
                    transition:    'all 0.2s ease',
                    position:      'relative',
                  }}
                  onMouseEnter={(e) => { if (!active) { (e.currentTarget as HTMLElement).style.color = 'var(--cream)'; (e.currentTarget as HTMLElement).style.background = 'rgba(197,168,92,0.03)'; }}}
                  onMouseLeave={(e) => { if (!active) { (e.currentTarget as HTMLElement).style.color = 'var(--text-secondary)'; (e.currentTarget as HTMLElement).style.background = 'transparent'; }}}
                >
                  <Icon size={16} style={{ flexShrink:0 }} />
                  {!collapsed && <span style={{ flex:1 }}>{item.label}</span>}
                  {hasAlert && !collapsed && (
                    <span style={{
                      background:  '#f59e0b',
                      color:       '#000',
                      fontSize:    '0.58rem',
                      fontWeight:  700,
                      padding:     '1px 6px',
                      borderRadius:'10px',
                    }}>
                      {activeOrders}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* User & Logout */}
      <div style={{ borderTop:'1px solid var(--dark-border)', padding:'16px', flexShrink:0 }}>
        {!collapsed && (
          <div style={{ marginBottom:'12px', padding:'12px', background:'var(--dark-surface)', border:'1px solid var(--dark-border)' }}>
            <p style={{ fontFamily:'var(--font-sans)', fontSize:'0.78rem', fontWeight:600, color:'var(--cream)', marginBottom:'2px' }}>
              {user.name}
            </p>
            <p style={{ fontSize:'0.68rem', color:'var(--text-secondary)' }}>
              {isAdmin ? 'Administrator' : user.membershipStatus}
            </p>
          </div>
        )}
        <button
          onClick={handleLogout}
          style={{
            display:       'flex',
            alignItems:    'center',
            gap:           '10px',
            justifyContent: collapsed ? 'center' : 'flex-start',
            width:         '100%',
            padding:       '10px 8px',
            background:    'transparent',
            border:        'none',
            color:         'var(--text-secondary)',
            fontSize:      '0.75rem',
            cursor:        'pointer',
            transition:    'color 0.2s ease',
          }}
          onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = '#ef4444')}
          onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = 'var(--text-secondary)')}
        >
          <LogOut size={15} />
          {!collapsed && 'Sign Out'}
        </button>
      </div>
    </aside>
  );

  return (
    <div style={{ display:'flex', height:'100vh', overflow:'hidden', background:'var(--black)' }}>

      {/* Desktop Sidebar */}
      <div className="hidden lg:flex" style={{ height:'100%' }}>
        {sidebarContent}
      </div>

      {/* Mobile Sidebar Overlay */}
      {mobileOpen && (
        <div
          style={{ position:'fixed', inset:0, zIndex:200, display:'flex' }}
          onClick={(e) => { if (e.target === e.currentTarget) setMobileOpen(false); }}
        >
          <div style={{ position:'absolute', inset:0, background:'rgba(0,0,0,0.7)' }} />
          <div style={{ position:'relative', zIndex:1, height:'100%' }}>
            {sidebarContent}
          </div>
        </div>
      )}

      {/* Main area */}
      <div style={{ flex:1, display:'flex', flexDirection:'column', overflow:'hidden', minWidth:0 }}>

        {/* Top bar */}
        <header style={{
          height:       '60px',
          display:      'flex',
          alignItems:   'center',
          justifyContent:'space-between',
          padding:      '0 24px',
          background:   'var(--void)',
          borderBottom: '1px solid var(--dark-border)',
          flexShrink:   0,
          gap:          '16px',
        }}>
          <div style={{ display:'flex', alignItems:'center', gap:'12px' }}>
            {/* Mobile hamburger */}
            <button
              className="lg:hidden"
              onClick={() => setMobileOpen(!mobileOpen)}
              style={{ background:'transparent', border:'none', color:'var(--text-secondary)', cursor:'pointer', display:'flex' }}
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>

            {/* Collapse toggle — desktop */}
            <button
              className="hidden lg:flex"
              onClick={() => setCollapsed(!collapsed)}
              style={{ background:'transparent', border:'none', color:'var(--text-secondary)', cursor:'pointer', display:'flex', alignItems:'center' }}
            >
              <ChevronRight size={16} style={{ transform: collapsed ? 'rotate(0)' : 'rotate(180deg)', transition:'transform 0.3s ease' }} />
            </button>

            {/* Breadcrumb */}
            <div style={{ display:'flex', alignItems:'center', gap:'6px' }}>
              <Link href="/admin" style={{ fontFamily:'var(--font-sans)', fontSize:'0.72rem', color:'var(--text-secondary)', textDecoration:'none' }}>Admin</Link>
              {pathname !== '/admin' && (
                <>
                  <ChevronRight size={12} color="var(--text-muted)" />
                  <span style={{ fontFamily:'var(--font-sans)', fontSize:'0.72rem', color:'var(--cream)', textTransform:'capitalize' }}>
                    {pathname.split('/').pop()?.replace(/-/g, ' ')}
                  </span>
                </>
              )}
            </div>
          </div>

          <div style={{ display:'flex', alignItems:'center', gap:'12px' }}>
            {/* Live alerts */}
            {activeOrders > 0 && (
              <div style={{
                display:    'flex',
                alignItems: 'center',
                gap:        '6px',
                padding:    '6px 12px',
                background: 'rgba(245,158,11,0.1)',
                border:     '1px solid rgba(245,158,11,0.3)',
              }}>
                <AlertCircle size={13} color="#f59e0b" />
                <span style={{ fontFamily:'var(--font-sans)', fontSize:'0.65rem', fontWeight:600, color:'#f59e0b', letterSpacing:'0.08em' }}>
                  {activeOrders} Active Order{activeOrders !== 1 ? 's' : ''}
                </span>
              </div>
            )}

            <Link href="/" style={{
              fontFamily:    'var(--font-sans)',
              fontSize:      '0.65rem',
              fontWeight:    600,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color:         'var(--text-secondary)',
              textDecoration:'none',
              padding:       '6px 12px',
              border:        '1px solid var(--dark-border-2)',
              transition:    'all 0.2s ease',
            }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = 'var(--cream)')}
              onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = 'var(--text-secondary)')}
            >
              View Site
            </Link>
          </div>
        </header>

        {/* Page Content */}
        <main style={{ flex:1, overflowY:'auto', padding:'32px' }}>
          {children}
        </main>
      </div>
    </div>
  );
}
