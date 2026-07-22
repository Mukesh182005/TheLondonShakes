'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useRestaurantStore, useCMSStore, useIsMounted } from '@/store/restaurantStore';
import {
  LayoutDashboard, ShoppingBag, Calendar, UtensilsCrossed,
  MapPin, Users, Truck, ClipboardList, BarChart2, Settings,
  LogOut, ChevronRight, Menu, X, AlertCircle, Image as ImageIcon, Eye, Power, ShieldAlert,
  Sun, Moon,
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
    ],
  },
  {
    label: 'Management',
    items: [
      { label: 'Menu Editor',     href: '/admin/menu',      icon: ClipboardList },
      { label: 'Events Manager',  href: '/admin/events',    icon: Calendar },
      { label: 'Gallery Manager', href: '/admin/gallery',   icon: ImageIcon },
      { label: 'Table Orders',    href: '/admin/table-orders', icon: ClipboardList },
      { label: 'Customers',       href: '/admin/customers', icon: Users },
      { label: 'Staff & HR',      href: '/admin/hr',        icon: Users },
    ],
  },
  {
    label: 'System',
    items: [
      { label: 'Site Settings', href: '/admin/settings',   icon: Settings },
      { label: 'Analytics',       href: '/admin/analytics', icon: BarChart2 },
      { label: 'Transaction Bills', href: '/admin/transaction-bills', icon: ImageIcon },
      { label: 'Security & Admins', href: '/admin/security', icon: ShieldAlert },
      { label: 'All Logs', href: '/admin/all-logs', icon: ClipboardList },
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
  const [isDark, setIsDark] = useState(false);
  const hydrated = useIsMounted();
  const [isMobile, setIsMobile] = useState(false);
  const maintenanceMode = useCMSStore((s) => s.maintenanceMode);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Sync dark mode state on mount + auto time-based switching
  useEffect(() => {
    const applyTimeBasedTheme = () => {
      const stored = localStorage.getItem('theme');
      if (!stored) {
        const hour = new Date().getHours();
        const shouldBeDark = hour >= 19 || hour < 7;
        const html = document.documentElement;
        if (shouldBeDark && !html.classList.contains('dark')) {
          html.classList.add('dark');
          setIsDark(true);
        } else if (!shouldBeDark && html.classList.contains('dark')) {
          html.classList.remove('dark');
          setIsDark(false);
        } else {
          setIsDark(html.classList.contains('dark'));
        }
      } else {
        setIsDark(document.documentElement.classList.contains('dark'));
      }
    };
    applyTimeBasedTheme();
    const interval = setInterval(applyTimeBasedTheme, 60000);
    return () => clearInterval(interval);
  }, []);

  const toggleTheme = () => {
    const html = document.documentElement;
    const next = !isDark;
    if (next) {
      html.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      html.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
    setIsDark(next);
  };

  const [sessionVerified, setSessionVerified] = useState(false);
  const [sessionName, setSessionName] = useState<string>('');
  const [role, setRole] = useState<string>(() => {
    if (user?.isAdmin) {
      return 'owner';
    }
    return 'waiter';
  });

  const getFilteredNavGroups = (currentRole: string) => {
    const isOwner = user?.isAdmin || currentRole === 'owner';
    
    if (maintenanceMode && !isOwner) {
      return [];
    }

    let filtered = navGroups;
    if (currentRole === 'manager') {
      filtered = navGroups.filter(group => group.label !== 'System');
    } else if (currentRole !== 'owner' && currentRole !== 'admin') {
      filtered = navGroups.filter(group => group.label === 'Operations');
    }

    if (!isOwner) {
      filtered = filtered.map(group => {
        if (group.label === 'System') {
          return {
            ...group,
            items: group.items.filter(item => 
              item.label !== 'Transaction Bills' && 
              item.label !== 'Analytics' && 
              item.label !== 'Site Settings' &&
              item.label !== 'Security & Admins' &&
              item.label !== 'All Logs'
            )
          };
        }
        return group;
      }).filter(group => group.items.length > 0);
    }

    return filtered;
  };

  const isPathAllowed = (path: string, currentRole: string): boolean => {
    const isOwner = user?.isAdmin || currentRole === 'owner';
    
    if (maintenanceMode && !isOwner) {
      return path === '/admin/login';
    }

    // These System paths are STRICTLY restricted to only the Owner (Super Admin)
    const systemPaths = [
      '/admin/transaction-bills',
      '/admin/analytics',
      '/admin/settings',
      '/admin/security',
      '/admin/all-logs'
    ];
    if (systemPaths.some(p => path.startsWith(p)) && !isOwner) {
      return false;
    }

    if (currentRole === 'owner' || currentRole === 'admin') return true;
    
    if (currentRole === 'waiter') {
      const managementPaths = [
        '/admin/menu',
        '/admin/events',
        '/admin/gallery',
        '/admin/customers',
        '/admin/hr'
      ];
      if (managementPaths.some(p => path.startsWith(p))) {
        return false;
      }
    }
    
    return true;
  };

  const isAdmin = user?.isAdmin;
  const SUPER_ADMIN_EMAIL = '';
  const isSuperAdmin = hydrated && (user?.email === SUPER_ADMIN_EMAIL || role === 'owner');

  useEffect(() => {
    if (!hydrated) return;
    if (pathname === '/admin/login') return;
    if (!user) {
      router.push('/admin/login');
    } else if (!user.email) {
      router.push('/');
    } else {
      if (sessionVerified) return;
      // Verify session cookie on the server
      fetch('/api/admin-auth')
        .then((res) => {
          if (!res.ok) throw new Error('Invalid session');
          return res.json();
        })
        .then((data) => {
          setRole(data.role || 'waiter');
          // Use the name returned by the server (real DB name for staff, fixed name for owner)
          if (data.name) setSessionName(data.name);
          setSessionVerified(true);
        })
        .catch(() => {
          logout();
          router.push('/admin/login');
        });
    }
  }, [user, router, pathname, hydrated, logout, sessionVerified]);

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
        {getFilteredNavGroups(role).map((group) => (
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
              // Hide Site Settings from non-super-admins
              if (item.href === '/admin/settings' && !isSuperAdmin) return null;
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
              {sessionName || user.name}
            </p>
            <p style={{ fontSize:'0.68rem', color:'var(--text-secondary)', textTransform:'capitalize' }}>
              {role === 'owner' ? 'Super Admin' : role}
            </p>
            {/* Maintenance status badge */}
            <div style={{
              marginTop: '8px', display: 'flex', alignItems: 'center', gap: '6px',
              padding: '4px 8px',
              background: maintenanceMode ? 'rgba(239,68,68,0.08)' : 'rgba(16,185,129,0.08)',
              border: `1px solid ${maintenanceMode ? 'rgba(239,68,68,0.25)' : 'rgba(16,185,129,0.25)'}`,
            }}>
              <div style={{
                width: '6px', height: '6px', borderRadius: '50%',
                background: maintenanceMode ? '#ef4444' : '#10b981',
                boxShadow: `0 0 0 2px ${maintenanceMode ? 'rgba(239,68,68,0.2)' : 'rgba(16,185,129,0.2)'}`,
              }} />
              <span style={{ fontSize: '0.58rem', color: maintenanceMode ? '#ef4444' : '#10b981', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                {maintenanceMode ? 'Offline' : 'Live'}
              </span>
            </div>
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
      {!isMobile && (
        <div style={{ height:'100%' }}>
          {sidebarContent}
        </div>
      )}

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
            {isMobile && (
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                style={{ background:'transparent', border:'none', color:'var(--text-secondary)', cursor:'pointer', display:'flex' }}
              >
                {mobileOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            )}

            {/* Collapse toggle — desktop */}
            {!isMobile && (
              <button
                onClick={() => setCollapsed(!collapsed)}
                style={{ background:'transparent', border:'none', color:'var(--text-secondary)', cursor:'pointer', display:'flex', alignItems:'center' }}
              >
                <ChevronRight size={16} style={{ transform: collapsed ? 'rotate(0)' : 'rotate(180deg)', transition:'transform 0.3s ease' }} />
              </button>
            )}

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

            {/* Maintenance mode status pill */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              padding: '5px 10px',
              background: maintenanceMode ? 'rgba(239,68,68,0.08)' : 'rgba(16,185,129,0.06)',
              border: `1px solid ${maintenanceMode ? 'rgba(239,68,68,0.25)' : 'rgba(16,185,129,0.2)'}`,
            }}>
              <Power size={10} color={maintenanceMode ? '#ef4444' : '#10b981'} />
              <span style={{ fontSize: '0.58rem', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: maintenanceMode ? '#ef4444' : '#10b981' }}>
                {maintenanceMode ? 'Offline' : 'Live'}
              </span>
            </div>

            {/* Preview Site button */}
            <Link
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                fontFamily:    'var(--font-sans)',
                fontSize:      '0.65rem',
                fontWeight:    600,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                color:         'var(--gold)',
                textDecoration:'none',
                padding:       '6px 14px',
                border:        '1px solid rgba(197,168,92,0.35)',
                background:    'rgba(197,168,92,0.05)',
                transition:    'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.background = 'rgba(197,168,92,0.12)';
                (e.currentTarget as HTMLElement).style.borderColor = 'rgba(197,168,92,0.6)';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.background = 'rgba(197,168,92,0.05)';
                (e.currentTarget as HTMLElement).style.borderColor = 'rgba(197,168,92,0.35)';
              }}
            >
              <Eye size={12} />
              Preview Site
            </Link>

            {/* Dark mode toggle */}
            <button
              onClick={toggleTheme}
              aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                width: '36px', height: '36px',
                background: 'transparent',
                border: '1px solid var(--dark-border)',
                color: 'var(--text-secondary)',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                flexShrink: 0,
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor = 'var(--gold)';
                (e.currentTarget as HTMLElement).style.color = 'var(--gold)';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor = 'var(--dark-border)';
                (e.currentTarget as HTMLElement).style.color = 'var(--text-secondary)';
              }}
            >
              {isDark ? <Sun size={15} /> : <Moon size={15} />}
            </button>
          </div>
        </header>

        <main style={{ flex:1, overflowY:'auto', padding: isMobile ? '16px' : '32px' }}>
          {isMobile && (role === 'owner' || user?.isAdmin) ? (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: '60vh',
              textAlign: 'center',
              padding: '40px',
              border: '1px solid rgba(197,168,92,0.15)',
              background: 'rgba(197,168,92,0.02)',
              borderRadius: '4px',
            }}>
              <ShieldAlert size={48} color="var(--gold)" style={{ marginBottom: '20px', opacity: 0.85 }} />
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', color: 'var(--cream)', marginBottom: '12px' }}>
                Desktop Access Only
              </h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', maxWidth: '420px', lineHeight: 1.6, margin: '0 auto 24px' }}>
                For security and layout precision, Super Admin / Owner accounts cannot access the control panel on mobile screens. Please log in using a Tablet, Laptop, or Desktop device.
              </p>
              <button
                onClick={handleLogout}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  padding: '12px 24px',
                  background: 'var(--dark-card)',
                  border: '1px solid var(--dark-border)',
                  color: 'var(--cream)',
                  fontWeight: 700,
                  fontSize: '0.65rem',
                  letterSpacing: '0.15em',
                  textTransform: 'uppercase',
                  cursor: 'pointer',
                  borderRadius: '3px',
                }}
              >
                Log Out
              </button>
            </div>
          ) : maintenanceMode && role !== 'owner' && user?.email !== ('') ? (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: '60vh',
              textAlign: 'center',
              padding: '40px',
              border: '1px solid rgba(245, 158, 11, 0.15)',
              background: 'rgba(245, 158, 11, 0.02)',
              borderRadius: '4px',
            }}>
              <Power size={48} color="#f59e0b" style={{ marginBottom: '20px', opacity: 0.85 }} />
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', color: 'var(--cream)', marginBottom: '12px' }}>
                Server Stopped (Offline)
              </h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', maxWidth: '420px', lineHeight: 1.6, margin: '0 auto 24px' }}>
                The Super Admin / Owner has taken the restaurant server offline for maintenance. Access to Operations and Management consoles is temporarily paused.
              </p>
              <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', margin: 0 }}>
                Please contact the restaurant owner to resume operations.
              </p>
            </div>
          ) : isPathAllowed(pathname, role) ? (
            children
          ) : (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: '60vh',
              textAlign: 'center',
              padding: '40px',
              border: '1px solid rgba(232, 16, 42, 0.15)',
              background: 'rgba(232, 16, 42, 0.02)',
              borderRadius: '4px',
            }}>
              <AlertCircle size={48} color="#E8102A" style={{ marginBottom: '20px', opacity: 0.85 }} />
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', color: 'var(--cream)', marginBottom: '12px' }}>
                Access Restricted
              </h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', maxWidth: '420px', lineHeight: 1.6, margin: '0 auto 24px' }}>
                Your staff account (<strong>{role.toUpperCase()}</strong>) does not have permission to access the <strong>{pathname.split('/').pop()?.replace(/-/g, ' ')}</strong> console.
              </p>
              <Link
                href="/admin"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  padding: '12px 24px',
                  background: 'linear-gradient(135deg, #FF1E39, #E8102A 55%, #B50016)',
                  border: 'none',
                  color: 'white',
                  fontWeight: 700,
                  fontSize: '0.65rem',
                  letterSpacing: '0.15em',
                  textTransform: 'uppercase',
                  textDecoration: 'none',
                  borderRadius: '3px',
                  boxShadow: '0 8px 24px rgba(232, 16, 42, 0.25)',
                }}
              >
                Return to Dashboard
              </Link>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
