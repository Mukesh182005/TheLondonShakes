'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useRestaurantStore } from '@/store/restaurantStore';
import { Menu, X, Sun, Moon } from 'lucide-react';

const leftLinks = [
  { label: 'About',       href: '/about' },
  { label: 'Menu',        href: '/menu' },
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
  const storeUser = useRestaurantStore((s) => s.user);
  const logout    = useRestaurantStore((s) => s.logout);


  const [isMounted, setIsMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isDark, setIsDark] = useState(false);

  useEffect(() => { setIsMounted(true); }, []);

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
        // No manual preference — use time-based auto switching
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
    // Re-check every 60 seconds for time boundary crossing
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

  const user = isMounted ? storeUser : null;

  const handleSignOut = async () => {
    try {
      await fetch('/api/admin-auth', { method: 'DELETE' });
    } catch (e) {
      console.warn('Sign out request failed:', e);
    }
    logout();
    window.location.href = '/';
  };

  const [scrolled,    setScrolled]    = useState(false);
  const [mobileOpen,  setMobileOpen]  = useState(false);
  const [navVisible,  setNavVisible]  = useState(false); // hidden until scroll

  const isHome    = pathname === '/';
  const isAdmin   = user?.isAdmin;

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
            : isDark
              ? (scrolled ? 'rgba(14, 12, 9, 0.95)' : 'rgba(14, 12, 9, 0.6)')
              : (scrolled ? 'rgba(242, 238, 228, 0.96)' : 'rgba(242, 238, 228, 0.6)'),
          backdropFilter: 'blur(18px)',
          WebkitBackdropFilter: 'blur(18px)',
          borderBottom:   isPrivateEvents
            ? '1px solid rgba(139, 92, 246, 0.2)'
            : isDark
              ? (scrolled ? '1px solid rgba(242, 238, 228, 0.06)' : '1px solid rgba(242, 238, 228, 0.03)')
              : (scrolled ? '1px solid rgba(28, 24, 16, 0.08)' : '1px solid rgba(28, 24, 16, 0.04)'),
          opacity:        navVisible ? 1 : 0,
          transform:      navVisible ? 'translateY(0)' : 'translateY(-100%)',
          pointerEvents:  navVisible ? 'auto' : 'none',
          transition:     'opacity 0.55s cubic-bezier(0.19,1,0.22,1), transform 0.55s cubic-bezier(0.19,1,0.22,1), background 0.5s ease, border-color 0.5s ease',
        }}
      >
        {/* Brand left · all nav links + actions right */}
        <div style={{
          width:    '100%',
          maxWidth: 'var(--container-max)',
          margin:   '0 auto',
          padding:  isMobile ? '0 16px' : '0 var(--container-px)',
          display:  'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap:      isMobile ? '8px' : '16px',
        }}>

          {/* Brand — left */}
          <Link
            href="/"
            style={{
              display:       'flex',
              flexDirection: 'column',
              alignItems:    'flex-start',
              gap:           '3px',
              textDecoration:'none',
              flexShrink:    0,
            }}
          >
            <span suppressHydrationWarning style={{
              fontFamily:    'var(--font-display)',
              fontSize:      isMobile ? '1.45rem' : '1.9rem',
              fontWeight:    300,
              color:         (isPrivateEvents || isDark) ? '#F2EEE4' : 'var(--cream)',
              letterSpacing: '0.04em',
              lineHeight:    1,
              whiteSpace:    'nowrap',
            }}>
              THE LONDON{' '}<em style={{ fontStyle: 'italic', fontWeight: 500, color: '#E8102A', textShadow: '0 0 18px rgba(232,16,42,0.35)' }}>SHAKES</em>
            </span>
            <span style={{
              fontFamily:    'var(--font-sans)',
              fontSize:      '0.52rem',
              fontWeight:    600,
              letterSpacing: '0.38em',
              textTransform: 'uppercase',
              color:         'var(--gold)',
              opacity:       0.85,
            }}>
              Est. 2021 · Silchar
            </span>
          </Link>

          {/* All nav links + actions — right */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0px' }}>
            {/* Desktop nav */}
            <nav suppressHydrationWarning style={{ display: isMobile ? 'none' : 'flex', alignItems: 'center', gap: '0px' }}>
              {allLinks.map((link) => (
                <NavLink key={link.href} link={link} active={isActive(link.href)} />
              ))}
              {isAdmin && <NavLink link={{ label: 'Admin', href: '/admin' }} active={isActive('/admin')} />}
              {isMounted ? (
                user ? (
                  <button
                    onClick={handleSignOut}
                    style={{
                      marginLeft: '18px',
                      padding: '7px 18px',
                      background: 'transparent',
                      border: '1px solid rgba(232, 16, 42, 0.5)',
                      color: '#E8102A',
                      fontFamily: 'var(--font-sans)',
                      fontSize: '0.6rem',
                      fontWeight: 700,
                      letterSpacing: '0.12em',
                      textTransform: 'uppercase',
                      borderRadius: '2px',
                      cursor: 'pointer',
                      transition: 'all 0.25s ease',
                      whiteSpace: 'nowrap',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'rgba(232, 16, 42, 0.05)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'transparent';
                    }}
                  >
                    Sign Out
                  </button>
                ) : (
                  <a
                    href="/account"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginLeft: '18px',
                      padding: '7px 18px',
                      background: '#E8102A',
                      color: 'white',
                      fontFamily: 'var(--font-sans)',
                      fontSize: '0.6rem',
                      fontWeight: 700,
                      letterSpacing: '0.12em',
                      textTransform: 'uppercase',
                      textDecoration: 'none',
                      borderRadius: '2px',
                      boxShadow: '0 4px 14px rgba(232, 16, 42, 0.25)',
                      transition: 'all 0.25s ease',
                      whiteSpace: 'nowrap',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = '#ff2e48';
                      e.currentTarget.style.boxShadow = '0 6px 18px rgba(232, 16, 42, 0.4)';
                      e.currentTarget.style.transform = 'translateY(-1px)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = '#E8102A';
                      e.currentTarget.style.boxShadow = '0 4px 14px rgba(232, 16, 42, 0.25)';
                      e.currentTarget.style.transform = 'none';
                    }}
                  >
                    Sign In
                  </a>
                )
              ) : null}

              {/* Theme toggle */}
              <button
                onClick={toggleTheme}
                aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
                style={{
                  display:        'flex',
                  alignItems:     'center',
                  justifyContent: 'center',
                  width:          '36px',
                  height:         '36px',
                  background:     'transparent',
                  border:         isPrivateEvents || isDark
                    ? '1px solid rgba(242, 238, 228, 0.2)'
                    : '1px solid rgba(28, 24, 16, 0.15)',
                  borderRadius:   '50%',
                  color:          isPrivateEvents || isDark ? '#F2EEE4' : 'var(--text-muted)',
                  cursor:         'pointer',
                  marginLeft:     '10px',
                  transition:     'all 0.3s ease',
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.borderColor = '#E11D2E';
                  (e.currentTarget as HTMLElement).style.color = '#E11D2E';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.borderColor = (isPrivateEvents || isDark)
                    ? 'rgba(242, 238, 228, 0.2)'
                    : 'rgba(28, 24, 16, 0.15)';
                  (e.currentTarget as HTMLElement).style.color = (isPrivateEvents || isDark) ? '#F2EEE4' : 'var(--text-muted)';
                }}
              >
                {isDark ? <Sun size={14} /> : <Moon size={14} />}
              </button>
            </nav>

            {/* Theme Toggle — mobile */}
            {isMobile && (
              <button
                onClick={toggleTheme}
                aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
                style={{
                  display:        'flex',
                  alignItems:     'center',
                  justifyContent: 'center',
                  width:          '40px',
                  height:         '40px',
                  background:     'transparent',
                  border:         (isPrivateEvents || isDark)
                    ? '1px solid rgba(242, 238, 228, 0.25)' 
                    : '1px solid rgba(28, 24, 16, 0.15)',
                  color:          (isPrivateEvents || isDark) ? '#F2EEE4' : 'var(--text-muted)',
                  cursor:         'pointer',
                  marginLeft:     '8px',
                  transition:     'all 0.3s ease',
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.borderColor = (isPrivateEvents || isDark) ? 'var(--gold-pale)' : 'var(--cream)';
                  (e.currentTarget as HTMLElement).style.color = (isPrivateEvents || isDark) ? 'var(--gold-pale)' : 'var(--cream)';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.borderColor = (isPrivateEvents || isDark)
                    ? 'rgba(242, 238, 228, 0.25)'
                    : 'rgba(28, 24, 16, 0.15)';
                  (e.currentTarget as HTMLElement).style.color = (isPrivateEvents || isDark) ? '#F2EEE4' : 'var(--text-muted)';
                }}
              >
                {isDark ? <Sun size={16} /> : <Moon size={16} />}
              </button>
            )}

            {/* Hamburger — mobile */}
            <button
              suppressHydrationWarning
              onClick={() => setMobileOpen(!mobileOpen)}
              style={{
                display:        isMobile ? 'flex' : 'none',
                alignItems:     'center',
                justifyContent: 'center',
                width:          '40px',
                height:         '40px',
                background:     'transparent',
                border:         (isPrivateEvents || isDark)
                  ? '1px solid rgba(242, 238, 228, 0.25)' 
                  : '1px solid rgba(28, 24, 16, 0.15)',
                color:          (isPrivateEvents || isDark) ? '#F2EEE4' : 'var(--text-muted)',
                cursor:         'pointer',
                marginLeft:     '8px',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor = (isPrivateEvents || isDark) ? 'var(--gold-pale)' : 'var(--cream)';
                (e.currentTarget as HTMLElement).style.color = (isPrivateEvents || isDark) ? 'var(--gold-pale)' : 'var(--cream)';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor = (isPrivateEvents || isDark)
                  ? 'rgba(242, 238, 228, 0.25)' 
                  : 'rgba(28, 24, 16, 0.15)';
                (e.currentTarget as HTMLElement).style.color = (isPrivateEvents || isDark) ? '#F2EEE4' : 'var(--text-muted)';
              }}
            >
              {mobileOpen ? <X size={17} /> : <Menu size={17} />}
            </button>
          </div>
        </div>
      </header>

      {/* ── Mobile Drawer (Redesigned) ── */}
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
        overflow: 'hidden',
      }}>
        {/* Decorative red accent line */}
        <div style={{
          height: '2px',
          background: 'linear-gradient(90deg, transparent, var(--red), var(--gold), transparent)',
          opacity: 0.6,
        }} />

        <nav suppressHydrationWarning style={{
          flex: 1,
          padding: '36px 32px 100px 32px',
          display: 'flex',
          flexDirection: 'column',
          gap: '0px',
          position: 'relative',
          overflowY: 'auto',
          WebkitOverflowScrolling: 'touch',
        }}>
          {/* Mobile theme toggle */}
          <button
            onClick={toggleTheme}
            aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '14px',
              padding: '16px 0',
              background: 'transparent',
              border: 'none',
              borderBottom: `1px solid ${isDark ? 'rgba(242,238,228,0.06)' : 'rgba(28, 24, 16, 0.06)'}`,
              cursor: 'pointer',
              width: '100%',
            }}
          >
            <div style={{
              width: '36px', height: '36px', borderRadius: '50%',
              border: `1px solid ${isDark ? 'rgba(242,238,228,0.15)' : 'rgba(28,24,16,0.12)'}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: isDark ? 'rgba(242,238,228,0.04)' : 'rgba(28,24,16,0.03)',
            }}>
              {isDark ? <Sun size={16} color="#F2EEE4" /> : <Moon size={16} color={drawerText} />}
            </div>
            <span style={{
              fontFamily: 'var(--font-sans)',
              fontSize: '0.7rem',
              fontWeight: 600,
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              color: isDark ? 'rgba(242,238,228,0.6)' : 'rgba(28,24,16,0.5)',
            }}>
              {isDark ? 'Light Mode' : 'Dark Mode'}
            </span>
          </button>

          {/* Nav links with stagger animation feel */}
          {allLinks.map((link, i) => (
            <Link
              key={link.href}
              href={link.href}
              style={{
                fontFamily:    'var(--font-display)',
                fontSize:      '1.6rem',
                fontWeight:    300,
                color:         isActive(link.href) ? 'var(--gold)' : drawerText,
                textDecoration:'none',
                padding:       '16px 0',
                borderBottom:  `1px solid ${isDark ? 'rgba(242,238,228,0.04)' : 'rgba(28,24,16,0.04)'}`,
                display:       'flex',
                alignItems:    'center',
                justifyContent:'space-between',
                transition:    'color 0.3s ease',
              }}
            >
              <span>{link.label}</span>
              {isActive(link.href) && (
                <span style={{
                  width: '6px', height: '6px', borderRadius: '50%',
                  background: 'var(--gold)',
                  boxShadow: '0 0 8px rgba(191,163,114,0.5)',
                }} />
              )}
              {!isActive(link.href) && (
                <span style={{
                  fontFamily: 'var(--font-sans)',
                  fontSize: '0.55rem',
                  fontWeight: 600,
                  letterSpacing: '0.2em',
                  color: isDark ? 'rgba(242,238,228,0.15)' : 'rgba(28,24,16,0.12)',
                }}>
                  {String(i + 1).padStart(2, '0')}
                </span>
              )}
            </Link>
          ))}

          {isAdmin && (
            <Link
              href="/admin"
              style={{
                fontFamily:    'var(--font-display)',
                fontSize:      '1.6rem',
                fontWeight:    300,
                color:         isActive('/admin') ? 'var(--gold)' : drawerText,
                textDecoration:'none',
                padding:       '16px 0',
                borderBottom:  `1px solid ${isDark ? 'rgba(242,238,228,0.04)' : 'rgba(28,24,16,0.04)'}`,
                display:       'flex',
                alignItems:    'center',
                gap:           '10px',
              }}
            >
              Admin Dashboard
              <span style={{
                fontSize: '0.5rem', fontWeight: 700, textTransform: 'uppercase',
                padding: '2px 6px', borderRadius: '3px', letterSpacing: '0.1em',
                background: 'rgba(225,29,46,0.1)', color: 'var(--red)', border: '1px solid rgba(225,29,46,0.2)',
              }}>
                Admin
              </span>
            </Link>
          )}

          {/* Sign In / Account CTA */}
          <div style={{ marginTop: '24px' }}>
            {isMounted ? (
              user ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px', background: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)', border: `1px solid ${isDark ? 'rgba(242,238,228,0.1)' : 'rgba(28,24,16,0.1)'}`, borderRadius: '4px' }}>
                    <span style={{ fontFamily: 'var(--font-sans)', fontSize: '0.75rem', fontWeight: 600, color: drawerText }}>
                      {user.name.split(' ')[0]}
                    </span>
                    <button 
                      onClick={handleSignOut}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: '#E8102A',
                        fontFamily: 'var(--font-sans)',
                        fontSize: '0.65rem',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        letterSpacing: '0.1em',
                        cursor: 'pointer',
                      }}
                    >
                      Sign Out
                    </button>
                  </div>
                </div>
              ) : (
                <a
                  href="/account"
                  onClick={() => setMobileOpen(false)}
                  style={{
                    display: 'inline-block',
                    padding: '12px 28px',
                    background: '#E8102A',
                    color: 'white',
                    fontFamily: 'var(--font-sans)',
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    letterSpacing: '0.15em',
                    textTransform: 'uppercase',
                    textDecoration: 'none',
                    borderRadius: '3px',
                    boxShadow: '0 4px 20px rgba(232, 16, 42, 0.25)',
                  }}
                >
                  Sign In
                </a>
              )
            ) : null}
          </div>
        </nav>

        {/* Bottom branding strip */}
        <div style={{
          padding: '20px 32px',
          borderTop: `1px solid ${isDark ? 'rgba(242,238,228,0.04)' : 'rgba(28,24,16,0.04)'}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <span style={{
            fontFamily: 'var(--font-sans)',
            fontSize: '0.5rem',
            fontWeight: 600,
            letterSpacing: '0.3em',
            textTransform: 'uppercase',
            color: isDark ? 'rgba(242,238,228,0.2)' : 'rgba(28,24,16,0.2)',
          }}>
            Est. 2021 · Silchar
          </span>
          <span style={{
            fontFamily: 'var(--font-display)',
            fontSize: '0.75rem',
            fontStyle: 'italic',
            color: 'var(--gold)',
            opacity: 0.4,
          }}>
            The London Shakes
          </span>
        </div>
      </div>



    </>
  );
}
