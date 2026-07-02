'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useRestaurantStore, useIsMounted } from '@/store/restaurantStore';
import CartDrawer from './CartDrawer';
import { ShoppingBag, Menu, X } from 'lucide-react';

const leftLinks = [
  { label: 'About',       href: '/about' },
  { label: 'Menu',        href: '/menu' },
  { label: 'Order',       href: '/order' },
  { label: 'Reservations',href: '/reservations' },
];

const rightLinks = [
  { label: 'Gallery',     href: '/gallery' },
  { label: 'Events',      href: '/events' },
  { label: 'Contact',     href: '/contact' },
];

const allLinks = [...leftLinks, ...rightLinks];

/* Gucci-style nav link with animated underline */
function NavLink({ link, active }: { link: { label: string; href: string }; active: boolean }) {
  const pathname = usePathname();
  const isPrivateEvents = pathname === '/private-events';
  const defaultColor = isPrivateEvents ? 'rgba(242, 238, 228, 0.65)' : 'var(--text-muted)';
  const activeColor = isPrivateEvents ? 'var(--gold-pale)' : 'var(--gold)';

  return (
    <Link
      href={link.href}
      style={{
        position:      'relative',
        display:       'inline-block',
        padding:       '8px 14px',
        fontFamily:    'var(--font-sans)',
        fontSize:      '0.6rem',
        fontWeight:    600,
        letterSpacing: '0.2em',
        textTransform: 'uppercase',
        color:         active ? activeColor : defaultColor,
        textDecoration:'none',
        transition:    'color 0.35s ease',
      }}
      onMouseEnter={(e) => {
        if (!active) (e.currentTarget as HTMLElement).style.color = 'var(--gold)';
        const line = (e.currentTarget as HTMLElement).querySelector('.nav-line') as HTMLElement;
        if (line) line.style.transform = 'scaleX(1)';
      }}
      onMouseLeave={(e) => {
        if (!active) (e.currentTarget as HTMLElement).style.color = defaultColor;
        if (!active) {
          const line = (e.currentTarget as HTMLElement).querySelector('.nav-line') as HTMLElement;
          if (line) line.style.transform = 'scaleX(0)';
        }
      }}
    >
      {link.label}
      <span
        className="nav-line"
        style={{
          position:        'absolute',
          bottom:          '2px',
          left:            '14px',
          right:           '14px',
          height:          '1px',
          background:      activeColor,
          transform:       active ? 'scaleX(1)' : 'scaleX(0)',
          transformOrigin: 'left',
          transition:      'transform 0.4s cubic-bezier(0.19,1,0.22,1)',
        }}
      />
    </Link>
  );
}

export default function Navbar() {
  const pathname  = usePathname();
  const storeCart = useRestaurantStore((s) => s.cart);
  const storeUser = useRestaurantStore((s) => s.user);

  const isMounted = useIsMounted();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const cart = isMounted ? storeCart : { items: [] };
  const user = isMounted ? storeUser : null;

  const [scrolled,    setScrolled]    = useState(false);
  const [mobileOpen,  setMobileOpen]  = useState(false);
  const [cartOpen,    setCartOpen]    = useState(false);
  const [navVisible,  setNavVisible]  = useState(false); // hidden until scroll

  const isHome    = pathname === '/';
  const cartCount = cart.items.reduce((n, i) => n + i.qty, 0);
  const isAdmin   = user?.email === 'admin@thelondon.co.uk';

  useEffect(() => {
    if (!isHome) { setNavVisible(true); return; }

    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 80);
      setNavVisible(y > 80);
    };

    setNavVisible(window.scrollY > 80);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [isHome]);

  useEffect(() => { setMobileOpen(false); }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/');
  const isPrivateEvents = pathname === '/private-events';
  const drawerBg = isPrivateEvents ? 'var(--panel-dark)' : 'var(--black)';
  const drawerText = isPrivateEvents ? '#F2EEE4' : 'var(--text-primary)';
  const drawerBorder = isPrivateEvents ? '1px solid var(--dark-border)' : '1px solid rgba(28, 24, 16, 0.08)';

  return (
    <>
      {/* ── Navbar ── */}
      <header
        style={{
          position:       'fixed',
          top:            0,
          left:           0,
          right:          0,
          zIndex:         100,
          height:         'var(--navbar-h)',
          display:        'flex',
          alignItems:     'center',
          background:     isPrivateEvents
            ? (scrolled ? 'rgba(11, 4, 18, 0.95)' : 'rgba(11, 4, 18, 0.75)')
            : (scrolled ? 'rgba(242, 238, 228, 0.96)' : 'rgba(242, 238, 228, 0.6)'),
          backdropFilter: 'blur(18px)',
          WebkitBackdropFilter: 'blur(18px)',
          borderBottom:   isPrivateEvents
            ? '1px solid rgba(139, 92, 246, 0.2)'
            : (scrolled ? '1px solid rgba(28, 24, 16, 0.08)' : '1px solid rgba(28, 24, 16, 0.04)'),
          opacity:        navVisible ? 1 : 0,
          transform:      navVisible ? 'translateY(0)' : 'translateY(-100%)',
          pointerEvents:  navVisible ? 'auto' : 'none',
          transition:     'opacity 0.55s cubic-bezier(0.19,1,0.22,1), transform 0.55s cubic-bezier(0.19,1,0.22,1), background 0.5s ease, border-color 0.5s ease',
        }}
      >
        {/* Gucci-style: left nav + center brand + right nav */}
        <div style={{
          width:    '100%',
          maxWidth: 'var(--container-max)',
          margin:   '0 auto',
          padding:  '0 var(--container-px)',
          display:  'grid',
          gridTemplateColumns: isMobile ? '1fr auto 1fr' : 'minmax(0, 1fr) auto minmax(0, 1fr)',
          alignItems: 'center',
          gap:      '16px',
        }}>

          {/* Left links (Desktop only) */}
          <nav style={{ display: isMobile ? 'none' : 'flex', alignItems: 'center', gap: '0px' }}>
            {leftLinks.map((link) => (
              <NavLink key={link.href} link={link} active={isActive(link.href)} />
            ))}
          </nav>

          {/* Center Brand */}
          <Link
            href="/"
            style={{
              display:       'flex',
              flexDirection: 'column',
              alignItems:    'center',
              gap:           '3px',
              textDecoration:'none',
              flexShrink:    0,
            }}
          >
            <span style={{
              fontFamily:    'var(--font-display)',
              fontSize:      isMobile ? '1.25rem' : '1.55rem',
              fontWeight:    300,
              color:         isPrivateEvents ? '#F2EEE4' : 'var(--cream)',
              letterSpacing: '0.04em',
              lineHeight:    1,
              whiteSpace:    'nowrap',
            }}>
              THE LONDON <em style={{ fontStyle: 'italic', fontWeight: 400 }}>SHAKES</em>
            </span>
            <span style={{
              fontFamily:    'var(--font-sans)',
              fontSize:      '0.5rem',
              fontWeight:    600,
              letterSpacing: '0.38em',
              textTransform: 'uppercase',
              color:         'var(--gold)',
              opacity:       0.85,
            }}>
              Est. 2021 · Silchar
            </span>
          </Link>

          {/* Right links + actions */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0px' }}>
            {/* Desktop right nav */}
            <nav style={{ display: isMobile ? 'none' : 'flex', alignItems: 'center', gap: '0px' }}>
              {rightLinks.map((link) => (
                <NavLink key={link.href} link={link} active={isActive(link.href)} />
              ))}
              {isAdmin && <NavLink link={{ label: 'Admin', href: '/admin' }} active={isActive('/admin')} />}
            </nav>



            {/* Cart */}
            <button
              id="cart-button"
              onClick={() => setCartOpen(true)}
              style={{
                position:       'relative',
                display:        'flex',
                alignItems:     'center',
                justifyContent: 'center',
                width:          '40px',
                height:         '40px',
                background:     'transparent',
                border:         isPrivateEvents 
                  ? '1px solid rgba(242, 238, 228, 0.25)' 
                  : '1px solid rgba(28, 24, 16, 0.15)',
                color:          isPrivateEvents ? '#F2EEE4' : 'var(--text-muted)',
                cursor:         'pointer',
                transition:     'all 0.3s ease',
                marginLeft:     '8px',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor = isPrivateEvents ? 'var(--gold-pale)' : 'var(--cream)';
                (e.currentTarget as HTMLElement).style.color = isPrivateEvents ? 'var(--gold-pale)' : 'var(--cream)';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor = isPrivateEvents 
                  ? 'rgba(242, 238, 228, 0.25)' 
                  : 'rgba(28, 24, 16, 0.15)';
                (e.currentTarget as HTMLElement).style.color = isPrivateEvents ? '#F2EEE4' : 'var(--text-muted)';
              }}
            >
              <ShoppingBag size={15} />
              {cartCount > 0 && (
                <span style={{
                  position:       'absolute',
                  top:            '-7px',
                  right:          '-7px',
                  width:          '17px',
                  height:         '17px',
                  background:     isPrivateEvents ? 'var(--gold-pale)' : 'var(--cream)',
                  color:          isPrivateEvents ? '#0b0412' : 'var(--charcoal)',
                  fontSize:       '0.5rem',
                  fontWeight:     700,
                  display:        'flex',
                  alignItems:     'center',
                  justifyContent: 'center',
                  borderRadius:   '50%',
                }}>
                  {cartCount}
                </span>
              )}
            </button>

            {/* Hamburger — mobile */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              style={{
                display:        'flex',
                alignItems:     'center',
                justifyContent: 'center',
                width:          '40px',
                height:         '40px',
                background:     'transparent',
                border:         isPrivateEvents 
                  ? '1px solid rgba(242, 238, 228, 0.25)' 
                  : '1px solid rgba(28, 24, 16, 0.15)',
                color:          isPrivateEvents ? '#F2EEE4' : 'var(--text-muted)',
                cursor:         'pointer',
                marginLeft:     '8px',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor = isPrivateEvents ? 'var(--gold-pale)' : 'var(--cream)';
                (e.currentTarget as HTMLElement).style.color = isPrivateEvents ? 'var(--gold-pale)' : 'var(--cream)';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor = isPrivateEvents 
                  ? 'rgba(242, 238, 228, 0.25)' 
                  : 'rgba(28, 24, 16, 0.15)';
                (e.currentTarget as HTMLElement).style.color = isPrivateEvents ? '#F2EEE4' : 'var(--text-muted)';
              }}
            >
              {mobileOpen ? <X size={17} /> : <Menu size={17} />}
            </button>
          </div>
        </div>
      </header>

      {/* ── Mobile Drawer ── */}
      <div style={{
        position:   'fixed',
        inset:      0,
        zIndex:     99,
        background: drawerBg,
        display:    mobileOpen ? 'flex' : 'none',
        flexDirection: 'column',
        paddingTop: 'var(--navbar-h)',
        transform:  mobileOpen ? 'translateX(0)' : 'translateX(-100%)',
        transition: 'transform 0.55s cubic-bezier(0.19,1,0.22,1)',
      }}>
        <nav style={{ flex: 1, padding: '48px 32px', display: 'flex', flexDirection: 'column', gap: '0px' }}>
          {allLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              style={{
                fontFamily:    'var(--font-display)',
                fontSize:      '1.4rem',
                fontWeight:    300,
                color:         isActive(link.href) ? 'var(--gold)' : drawerText,
                textDecoration:'none',
                padding:       '12px 0',
                borderBottom:  drawerBorder,
                display:       'block',
              }}
            >
              {link.label}
            </Link>
          ))}
          {isAdmin && (
            <Link
              href="/admin"
              style={{
                fontFamily:    'var(--font-display)',
                fontSize:      '1.4rem',
                fontWeight:    300,
                color:         isActive('/admin') ? 'var(--gold)' : drawerText,
                textDecoration:'none',
                padding:       '12px 0',
                borderBottom:  drawerBorder,
                display:       'block',
              }}
            >
              Admin Dashboard
            </Link>
          )}
          {user ? (
            <Link
              href="/account"
              style={{
                fontFamily:    'var(--font-display)',
                fontSize:      '1.4rem',
                fontWeight:    300,
                color:         isActive('/account') ? 'var(--gold)' : drawerText,
                textDecoration:'none',
                padding:       '12px 0',
                display:       'block',
              }}
            >
              My Account ({user.name.split(' ')[0]})
            </Link>
          ) : (
            <Link
              href="/account"
              style={{
                fontFamily:    'var(--font-display)',
                fontSize:      '1.4rem',
                fontWeight:    300,
                color:         isActive('/account') ? 'var(--gold)' : drawerText,
                textDecoration:'none',
                padding:       '12px 0',
                display:       'block',
              }}
            >
              Sign In
            </Link>
          )}
        </nav>
      </div>

      {/* Cart Drawer */}
      <CartDrawer isOpen={cartOpen} onClose={() => setCartOpen(false)} />
    </>
  );
}
