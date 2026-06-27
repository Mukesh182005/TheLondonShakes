'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useRestaurantStore, useCMSStore } from '@/store/restaurantStore';
import { restaurantInfo as initialRestaurantInfo } from '@/data/restaurantData';
import CartDrawer from './CartDrawer';
import { ShoppingBag, Menu, X, ChevronDown } from 'lucide-react';

const customerLinks = [
  { label: 'Menu',        href: '/menu' },
  { label: 'Order Online', href: '/order' },
  { label: 'Reservations', href: '/reservations' },
  { label: 'About',       href: '/about', children: [
    { label: 'Our Story', href: '/about' },
    { label: 'Gallery',   href: '/gallery' },
    { label: 'Events',    href: '/events' },
  ]},
  { label: 'Gift Cards',  href: '/gift-cards' },
  { label: 'Contact',     href: '/contact' },
];

export default function Navbar() {
  const pathname = usePathname();
  const storeCart = useRestaurantStore((s) => s.cart);
  const storeUser = useRestaurantStore((s) => s.user);
  const storeRestaurantInfo = useCMSStore((s) => s.restaurantInfo);

  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const cart = isMounted ? storeCart : { items: [] };
  const user = isMounted ? storeUser : null;
  const restaurantInfo = isMounted ? storeRestaurantInfo : initialRestaurantInfo;

  const [scrolled, setScrolled]     = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [cartOpen, setCartOpen]     = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  const cartCount = cart.items.reduce((n, i) => n + i.qty, 0);
  const isAdmin   = user?.email === 'admin@thelondon.co.uk';

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setActiveDropdown(null);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  const isActive = (href: string) => pathname === href;

  return (
    <>
      {/* ── Navbar ── */}
      <header
        style={{
          position:  'fixed',
          top:       0,
          left:      0,
          right:     0,
          zIndex:    100,
          height:    'var(--navbar-h)',
          display:   'flex',
          alignItems:'center',
          background: scrolled
            ? 'rgba(0,0,0,0.96)'
            : 'linear-gradient(180deg, rgba(0,0,0,0.85) 0%, transparent 100%)',
          borderBottom: scrolled ? '1px solid rgba(197,168,92,0.08)' : '1px solid transparent',
          backdropFilter: scrolled ? 'blur(20px)' : 'none',
          transition: 'all 0.4s ease',
        }}
      >
        <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '24px' }}>

          {/* Logo */}
          <Link href="/" style={{ display: 'flex', flexDirection: 'column', gap: '1px', textDecoration: 'none', flexShrink: 0 }}>
            <span style={{
              fontFamily:    'var(--font-display)',
              fontSize:      '1.35rem',
              fontWeight:    400,
              color:         'var(--cream)',
              letterSpacing: '-0.01em',
              lineHeight:    1,
            }}>
              {restaurantInfo.name}
            </span>
            <span style={{
              fontFamily:    'var(--font-sans)',
              fontSize:      '0.52rem',
              fontWeight:    600,
              letterSpacing: '0.28em',
              textTransform: 'uppercase',
              color:         'var(--gold)',
              opacity:       0.8,
            }}>
              Silchar
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav style={{ display: 'flex', alignItems: 'center', gap: '4px' }} className="hidden lg:flex">
            {customerLinks.map((link) => (
              <div
                key={link.href}
                style={{ position: 'relative' }}
                onMouseEnter={() => link.children ? setActiveDropdown(link.label) : null}
                onMouseLeave={() => setActiveDropdown(null)}
              >
                <Link
                  href={link.href}
                  style={{
                    display:       'inline-flex',
                    alignItems:    'center',
                    gap:           '4px',
                    padding:       '10px 14px',
                    fontFamily:    'var(--font-sans)',
                    fontSize:      '0.67rem',
                    fontWeight:    500,
                    letterSpacing: '0.12em',
                    textTransform: 'uppercase',
                    color:         isActive(link.href) ? 'var(--gold)' : 'var(--text-secondary)',
                    textDecoration:'none',
                    transition:    'color 0.25s ease',
                    position:      'relative',
                  }}
                  onMouseEnter={(e) => { if (!isActive(link.href)) (e.currentTarget as HTMLElement).style.color = 'var(--cream)'; }}
                  onMouseLeave={(e) => { if (!isActive(link.href)) (e.currentTarget as HTMLElement).style.color = 'var(--text-secondary)'; }}
                >
                  {link.label}
                  {link.children && <ChevronDown size={10} />}
                </Link>

                {/* Dropdown */}
                {link.children && activeDropdown === link.label && (
                  <div style={{
                    position:   'absolute',
                    top:        '100%',
                    left:       '50%',
                    transform:  'translateX(-50%)',
                    paddingTop: '8px',
                    zIndex:     200,
                  }}>
                    <div style={{
                      background:   'rgba(8,8,8,0.98)',
                      border:       '1px solid rgba(197,168,92,0.15)',
                      backdropFilter:'blur(24px)',
                      minWidth:     '180px',
                      padding:      '8px 0',
                    }}>
                      {link.children.map((child) => (
                        <Link key={child.href} href={child.href} style={{
                          display:       'block',
                          padding:       '10px 20px',
                          fontFamily:    'var(--font-sans)',
                          fontSize:      '0.67rem',
                          fontWeight:    500,
                          letterSpacing: '0.1em',
                          textTransform: 'uppercase',
                          color:         'var(--text-secondary)',
                          textDecoration:'none',
                          transition:    'all 0.2s ease',
                        }}
                          onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = 'var(--gold)'; (e.currentTarget as HTMLElement).style.background = 'rgba(197,168,92,0.05)'; }}
                          onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = 'var(--text-secondary)'; (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
                        >
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </nav>

          {/* Right Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
            {/* Cart */}
            <button
              id="cart-button"
              onClick={() => setCartOpen(true)}
              style={{
                position:  'relative',
                display:   'flex',
                alignItems:'center',
                justifyContent:'center',
                width:     '44px',
                height:    '44px',
                background:'transparent',
                border:    '1px solid rgba(197,168,92,0.2)',
                color:     'var(--text-secondary)',
                cursor:    'pointer',
                transition:'all 0.3s ease',
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--gold)'; (e.currentTarget as HTMLElement).style.color = 'var(--gold)'; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(197,168,92,0.2)'; (e.currentTarget as HTMLElement).style.color = 'var(--text-secondary)'; }}
            >
              <ShoppingBag size={16} />
              {cartCount > 0 && (
                <span style={{
                  position:   'absolute',
                  top:        '-6px',
                  right:      '-6px',
                  width:      '18px',
                  height:     '18px',
                  background: 'var(--gold)',
                  color:      'var(--black)',
                  fontSize:   '0.55rem',
                  fontWeight: 700,
                  display:    'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '50%',
                }}>
                  {cartCount}
                </span>
              )}
            </button>

            {/* Reserve CTA — desktop */}
            <Link
              href="/reservations"
              className="btn-gold btn-sm hidden lg:inline-flex"
            >
              <span>Reserve a Table</span>
            </Link>

            {/* Admin link */}
            {isAdmin && (
              <Link
                href="/admin"
                style={{
                  fontFamily:    'var(--font-sans)',
                  fontSize:      '0.62rem',
                  fontWeight:    600,
                  letterSpacing: '0.15em',
                  textTransform: 'uppercase',
                  color:         'var(--gold)',
                  padding:       '8px 14px',
                  border:        '1px solid rgba(197,168,92,0.3)',
                }}
              >
                Admin
              </Link>
            )}

            {/* Account / Login */}
            <Link
              href="/account"
              style={{
                fontFamily:    'var(--font-sans)',
                fontSize:      '0.62rem',
                fontWeight:    600,
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
                color:         user ? 'var(--cream)' : 'var(--text-secondary)',
                padding:       '8px 0',
                transition:    'color 0.25s ease',
              }}
              className="hidden lg:block"
            >
              {user ? user.name.split(' ')[0] : 'Sign In'}
            </Link>

            {/* Hamburger — mobile */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="lg:hidden"
              style={{
                display:   'flex',
                alignItems:'center',
                justifyContent:'center',
                width:     '44px',
                height:    '44px',
                background:'transparent',
                border:    '1px solid rgba(197,168,92,0.2)',
                color:     'var(--text-secondary)',
                cursor:    'pointer',
              }}
            >
              {mobileOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>
      </header>

      {/* ── Mobile Drawer ── */}
      {mobileOpen && (
        <div
          style={{
            position:   'fixed',
            inset:      0,
            zIndex:     99,
            background: 'rgba(0,0,0,0.98)',
            backdropFilter: 'blur(24px)',
            display:    'flex',
            flexDirection:'column',
            paddingTop: 'var(--navbar-h)',
          }}
          className="animate-fade-in"
        >
          <nav style={{ flex: 1, padding: '40px 24px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {customerLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                style={{
                  fontFamily:    'var(--font-display)',
                  fontSize:      '2.2rem',
                  fontWeight:    300,
                  color:         isActive(link.href) ? 'var(--gold)' : 'var(--cream)',
                  textDecoration:'none',
                  padding:       '12px 0',
                  borderBottom:  '1px solid var(--dark-border)',
                  transition:    'color 0.25s ease',
                  lineHeight:    1.1,
                }}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div style={{ padding: '24px', borderTop: '1px solid var(--dark-border)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <Link href="/reservations" className="btn-gold" style={{ textAlign: 'center', width: '100%' }}>
              <span>Reserve a Table</span>
            </Link>
            <Link href="/account" className="btn-outline" style={{ textAlign: 'center', width: '100%' }}>
              {user ? 'My Account' : 'Sign In'}
            </Link>
          </div>
        </div>
      )}

      {/* ── Cart Drawer ── */}
      <CartDrawer isOpen={cartOpen} onClose={() => setCartOpen(false)} />
    </>
  );
}
