'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useCMSStore } from '@/store/restaurantStore';
import { restaurantInfo as initialRestaurantInfo } from '@/data/restaurantData';
import { Phone, Mail, MapPin } from 'lucide-react';

const footerLinks = {
  explore: [
    { label: 'Our Menu',      href: '/menu' },
    { label: 'Order Online',  href: '/order' },
    { label: 'Reservations',  href: '/reservations' },
    { label: 'Gallery',       href: '/gallery' },
    { label: 'Events',        href: '/events' },
    { label: 'Gift Cards',    href: '/gift-cards' },
  ],
  experience: [
    { label: 'Our Story',     href: '/about' },
    { label: 'Loyalty Rewards',href: '/loyalty' },
    { label: 'Private Events', href: '/private-events' },
    { label: 'Contact',       href: '/contact' },
    { label: 'FAQ',           href: '/contact#faq' },
  ],
};

export default function Footer() {
  const storeRestaurantInfo = useCMSStore((s) => s.restaurantInfo);
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
  }, []);
  const restaurantInfo = isMounted ? storeRestaurantInfo : initialRestaurantInfo;
  const year = new Date().getFullYear();

  return (
    <footer style={{
      background:   'var(--void)',
      borderTop:    '1px solid var(--dark-border)',
      paddingTop:   '80px',
      paddingBottom:'40px',
    }}>
      <div className="container">

        {/* Top Grid */}
        <div style={{
          display:             'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap:                 '56px',
          marginBottom:        '72px',
        }}>

          {/* Brand Column */}
          <div style={{ gridColumn: 'span 1' }}>
            <div style={{ marginBottom: '24px' }}>
              <p style={{
                fontFamily:    'var(--font-display)',
                fontSize:      '1.6rem',
                fontWeight:    400,
                color:         'var(--cream)',
                lineHeight:    1,
                marginBottom:  '6px',
              }}>
                {restaurantInfo.name}
              </p>
              <p style={{
                fontFamily:    'var(--font-sans)',
                fontSize:      '0.58rem',
                fontWeight:    600,
                letterSpacing: '0.28em',
                textTransform: 'uppercase',
                color:         'var(--gold)',
                opacity:       0.7,
              }}>
                Silchar, India
              </p>
            </div>
            <p style={{
              fontSize:   '0.8125rem',
              color:      'var(--text-secondary)',
              lineHeight: 1.7,
              marginBottom:'28px',
              maxWidth:   '260px',
            }}>
              {restaurantInfo.tagline}
            </p>

            {/* Social */}
            <a
              href={`https://instagram.com/${restaurantInfo.contact.instagram.replace('@', '')}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display:    'inline-flex',
                alignItems: 'center',
                gap:        '8px',
                color:      'var(--text-secondary)',
                fontSize:   '0.7rem',
                fontWeight: 600,
                letterSpacing:'0.1em',
                textTransform:'uppercase',
                transition: 'color 0.25s ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--gold)')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-secondary)')}
            >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
              {restaurantInfo.contact.instagram}
            </a>
          </div>

          {/* Explore */}
          <div>
            <p style={{
              fontFamily:    'var(--font-sans)',
              fontSize:      '0.58rem',
              fontWeight:    700,
              letterSpacing: '0.25em',
              textTransform: 'uppercase',
              color:         'var(--gold)',
              marginBottom:  '20px',
            }}>
              Explore
            </p>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {footerLinks.explore.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} style={{
                    fontFamily:    'var(--font-sans)',
                    fontSize:      '0.8125rem',
                    color:         'var(--text-secondary)',
                    textDecoration:'none',
                    transition:    'color 0.2s ease',
                  }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--cream)')}
                    onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-secondary)')}
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Experience */}
          <div>
            <p style={{
              fontFamily:    'var(--font-sans)',
              fontSize:      '0.58rem',
              fontWeight:    700,
              letterSpacing: '0.25em',
              textTransform: 'uppercase',
              color:         'var(--gold)',
              marginBottom:  '20px',
            }}>
              Experience
            </p>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {footerLinks.experience.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} style={{
                    fontFamily:    'var(--font-sans)',
                    fontSize:      '0.8125rem',
                    color:         'var(--text-secondary)',
                    textDecoration:'none',
                    transition:    'color 0.2s ease',
                  }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--cream)')}
                    onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-secondary)')}
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <p style={{
              fontFamily:    'var(--font-sans)',
              fontSize:      '0.58rem',
              fontWeight:    700,
              letterSpacing: '0.25em',
              textTransform: 'uppercase',
              color:         'var(--gold)',
              marginBottom:  '20px',
            }}>
              Visit Us
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <a href={`tel:${restaurantInfo.contact.phone}`} style={{
                display:    'flex',
                alignItems: 'flex-start',
                gap:        '12px',
                color:      'var(--text-secondary)',
                fontSize:   '0.8125rem',
                textDecoration:'none',
                transition: 'color 0.2s ease',
              }}
                onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--cream)')}
                onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-secondary)')}
              >
                <Phone size={13} style={{ marginTop: '2px', flexShrink: 0, color: 'var(--gold)', opacity: 0.6 }} />
                {restaurantInfo.contact.phone}
              </a>
              <a href={`mailto:${restaurantInfo.contact.email}`} style={{
                display:    'flex',
                alignItems: 'flex-start',
                gap:        '12px',
                color:      'var(--text-secondary)',
                fontSize:   '0.8125rem',
                textDecoration:'none',
                transition: 'color 0.2s ease',
              }}
                onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--cream)')}
                onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-secondary)')}
              >
                <Mail size={13} style={{ marginTop: '2px', flexShrink: 0, color: 'var(--gold)', opacity: 0.6 }} />
                {restaurantInfo.contact.email}
              </a>
              <div style={{
                display:    'flex',
                alignItems: 'flex-start',
                gap:        '12px',
                color:      'var(--text-secondary)',
                fontSize:   '0.8125rem',
              }}>
                <MapPin size={13} style={{ marginTop: '2px', flexShrink: 0, color: 'var(--gold)', opacity: 0.6 }} />
                <span>{restaurantInfo.location.fullAddress}</span>
              </div>

              {/* Hours */}
              <div style={{ marginTop: '8px' }}>
                {restaurantInfo.hours.map((h, i) => (
                  <div key={i} style={{ marginBottom: '6px' }}>
                    <p style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--cream)', marginBottom: '2px' }}>
                      {h.days}
                    </p>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                      {h.lunch} &amp; {h.dinner}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Newsletter Bar */}
        <div style={{
          borderTop:    '1px solid var(--dark-border)',
          borderBottom: '1px solid var(--dark-border)',
          padding:      '40px 0',
          marginBottom: '40px',
          display:      'flex',
          alignItems:   'center',
          gap:          '32px',
          flexWrap:     'wrap',
        }}>
          <div style={{ flex: 1, minWidth: '200px' }}>
            <p style={{
              fontFamily:    'var(--font-display)',
              fontSize:      '1.4rem',
              color:         'var(--cream)',
              marginBottom:  '4px',
            }}>
              Stay in the Know
            </p>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
              Receive updates on new menu additions, events, and exclusive offers.
            </p>
          </div>
          <form
            style={{ display: 'flex', gap: '0', flex: 1, minWidth: '280px', maxWidth: '460px' }}
            onSubmit={(e) => e.preventDefault()}
          >
            <input
              type="email"
              placeholder="Your email address"
              style={{
                flex:        1,
                padding:     '14px 18px',
                background:  'rgba(10,10,10,0.95)',
                border:      '1px solid var(--dark-border-2)',
                borderRight: 'none',
                color:       'var(--text-primary)',
                fontSize:    '0.875rem',
                outline:     'none',
              }}
            />
            <button type="submit" className="btn-gold" style={{ padding: '14px 24px', whiteSpace: 'nowrap' }}>
              <span>Subscribe</span>
            </button>
          </form>
        </div>

        {/* Bottom Bar */}
        <div style={{
          display:        'flex',
          alignItems:     'center',
          justifyContent: 'space-between',
          flexWrap:       'wrap',
          gap:            '16px',
        }}>
          <p style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
            © {year} {restaurantInfo.name}. All rights reserved.
          </p>
          <div style={{ display: 'flex', gap: '20px' }}>
            {[{ label: 'Privacy', href: '#' }, { label: 'Terms', href: '#' }, { label: 'Accessibility', href: '#' }].map((l) => (
              <Link key={l.label} href={l.href} style={{
                fontSize:      '0.72rem',
                color:         'var(--text-secondary)',
                textDecoration:'none',
                transition:    'color 0.2s ease',
              }}
                onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--cream)')}
                onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-secondary)')}
              >
                {l.label}
              </Link>
            ))}
          </div>
        </div>

      </div>
    </footer>
  );
}
