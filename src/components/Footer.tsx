'use client';

import React from 'react';
import Link from 'next/link';
import { useCMSStore, useIsMounted } from '@/store/restaurantStore';
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
    { label: 'Our Story',      href: '/about' },
    { label: 'Loyalty Rewards', href: '/loyalty' },
    { label: 'Private Events', href: '/private-events' },
    { label: 'Contact',        href: '/contact' },
    { label: 'FAQ',            href: '/contact#faq' },
  ],
};

export default function Footer() {
  const storeRestaurantInfo = useCMSStore((s) => s.restaurantInfo);
  const isMounted = useIsMounted();
  const restaurantInfo = isMounted ? storeRestaurantInfo : initialRestaurantInfo;
  const year = new Date().getFullYear();

  return (
    <footer style={{
      background:  'var(--panel-dark)',
      borderTop:   '1px solid rgba(158, 128, 67, 0.15)',
      position:    'relative',
    }}>

      {/* Main footer grid */}
      <div className="container" style={{ paddingTop: '88px', paddingBottom: '72px' }}>
        <div style={{
          display:             'grid',
          gridTemplateColumns: '1.5fr 1fr 1fr 1.2fr',
          gap:                 '48px',
          marginBottom:        '72px',
        }} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4">

          {/* Brand */}
          <div>
            <Link href="/" style={{ display: 'block', marginBottom: '28px', textDecoration: 'none' }}>
              <p style={{
                fontFamily:    'var(--font-display)',
                fontSize:      '1.8rem',
                fontWeight:    300,
                color:         'var(--on-dark)',
                lineHeight:    1,
                marginBottom:  '6px',
                letterSpacing: '0.02em',
              }}>
                The London <em style={{ fontStyle: 'italic', color: 'var(--gold)', fontWeight: 400 }}>Shakes</em>
              </p>
              <p style={{
                fontFamily:    'var(--font-sans)',
                fontSize:      '0.5rem',
                fontWeight:    600,
                letterSpacing: '0.38em',
                textTransform: 'uppercase',
                color:         'var(--gold)',
                opacity:       0.75,
              }}>
                Est. 2021 · Silchar
              </p>
            </Link>

            <p style={{
              fontFamily:   'var(--font-serif)',
              fontStyle:    'italic',
              fontSize:     '0.92rem',
              color:        'var(--on-dark-muted)',
              lineHeight:   1.75,
              marginBottom: '28px',
              maxWidth:     '280px',
            }}>
              {restaurantInfo.tagline || 'Premium Thick Shakes, Gourmet Burgers & Artisan Café Experiences'}
            </p>

            {/* Social links */}
            <div style={{ display: 'flex', gap: '12px' }}>
              {['Instagram', 'Facebook', 'Twitter'].map((social) => (
                <a key={social} href="#" style={{
                  fontFamily:    'var(--font-sans)',
                  fontSize:      '0.55rem',
                  fontWeight:    600,
                  letterSpacing: '0.15em',
                  textTransform: 'uppercase',
                  color:         'var(--on-dark-muted)',
                  padding:       '8px 14px',
                  border:        '1px solid rgba(242,238,228,0.12)',
                  textDecoration:'none',
                  transition:    'all 0.3s ease',
                }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.color = 'var(--gold)';
                    (e.currentTarget as HTMLElement).style.borderColor = 'rgba(158,128,67,0.35)';
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.color = 'var(--on-dark-muted)';
                    (e.currentTarget as HTMLElement).style.borderColor = 'rgba(242,238,228,0.12)';
                  }}
                >
                  {social.charAt(0)}
                </a>
              ))}
            </div>
          </div>

          {/* Explore */}
          <div>
            <p style={{
              fontFamily:    'var(--font-sans)',
              fontSize:      '0.55rem',
              fontWeight:    700,
              letterSpacing: '0.32em',
              textTransform: 'uppercase',
              color:         'var(--gold)',
              marginBottom:  '28px',
            }}>
              Explore
            </p>
            <nav style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {footerLinks.explore.map((link) => (
                <Link key={link.href} href={link.href} style={{
                  fontFamily:    'var(--font-sans)',
                  fontSize:      '0.78rem',
                  color:         'var(--on-dark-muted)',
                  textDecoration:'none',
                  letterSpacing: '0.04em',
                  transition:    'color 0.25s ease',
                }}
                  onMouseEnter={(e) => (e.currentTarget as HTMLElement).style.color = 'var(--on-dark)'}
                  onMouseLeave={(e) => (e.currentTarget as HTMLElement).style.color = 'var(--on-dark-muted)'}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Experience */}
          <div>
            <p style={{
              fontFamily:    'var(--font-sans)',
              fontSize:      '0.55rem',
              fontWeight:    700,
              letterSpacing: '0.32em',
              textTransform: 'uppercase',
              color:         'var(--gold)',
              marginBottom:  '28px',
            }}>
              Experience
            </p>
            <nav style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {footerLinks.experience.map((link) => (
                <Link key={link.href} href={link.href} style={{
                  fontFamily:    'var(--font-sans)',
                  fontSize:      '0.78rem',
                  color:         'var(--on-dark-muted)',
                  textDecoration:'none',
                  letterSpacing: '0.04em',
                  transition:    'color 0.25s ease',
                }}
                  onMouseEnter={(e) => (e.currentTarget as HTMLElement).style.color = 'var(--on-dark)'}
                  onMouseLeave={(e) => (e.currentTarget as HTMLElement).style.color = 'var(--on-dark-muted)'}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Visit */}
          <div>
            <p style={{
              fontFamily:    'var(--font-sans)',
              fontSize:      '0.55rem',
              fontWeight:    700,
              letterSpacing: '0.32em',
              textTransform: 'uppercase',
              color:         'var(--gold)',
              marginBottom:  '28px',
            }}>
              Visit Us
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ display: 'flex', gap: '12px' }}>
                <MapPin size={13} color="var(--gold)" style={{ flexShrink: 0, marginTop: '3px' }} />
                <div>
                  <p style={{ fontFamily: 'var(--font-sans)', fontSize: '0.75rem', color: 'var(--on-dark)', lineHeight: 1.6 }}>
                    {restaurantInfo.location?.fullAddress || restaurantInfo.location?.address || '3rd Floor, East Point Mall, Silchar, Assam 788001'}
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <Phone size={13} color="var(--gold)" style={{ flexShrink: 0 }} />
                <a href={`tel:${restaurantInfo.contact?.phone}`} style={{
                  fontFamily:    'var(--font-sans)',
                  fontSize:      '0.75rem',
                  color:         'var(--on-dark-muted)',
                  textDecoration:'none',
                  transition:    'color 0.25s ease',
                }}
                  onMouseEnter={(e) => (e.currentTarget as HTMLElement).style.color = 'var(--on-dark)'}
                  onMouseLeave={(e) => (e.currentTarget as HTMLElement).style.color = 'var(--on-dark-muted)'}
                >
                  {restaurantInfo.contact?.phone}
                </a>
              </div>

              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <Mail size={13} color="var(--gold)" style={{ flexShrink: 0 }} />
                <a href={`mailto:${restaurantInfo.contact?.email}`} style={{
                  fontFamily:    'var(--font-sans)',
                  fontSize:      '0.75rem',
                  color:         'var(--on-dark-muted)',
                  textDecoration:'none',
                  transition:    'color 0.25s ease',
                }}
                  onMouseEnter={(e) => (e.currentTarget as HTMLElement).style.color = 'var(--on-dark)'}
                  onMouseLeave={(e) => (e.currentTarget as HTMLElement).style.color = 'var(--on-dark-muted)'}
                >
                  {restaurantInfo.contact?.email}
                </a>
              </div>

              {/* Hours */}
              <div style={{
                marginTop:   '8px',
                padding:     '20px',
                border:      '1px solid rgba(158,128,67,0.15)',
                background:  'rgba(158,128,67,0.04)',
              }}>
                <p style={{
                  fontFamily:    'var(--font-sans)',
                  fontSize:      '0.55rem',
                  fontWeight:    700,
                  letterSpacing: '0.22em',
                  textTransform: 'uppercase',
                  color:         'var(--gold)',
                  marginBottom:  '12px',
                }}>
                  Hours
                </p>
                {Array.isArray(restaurantInfo.hours) && restaurantInfo.hours.length > 0
                  ? restaurantInfo.hours.map((h: { days: string; lunch: string; dinner: string }, idx: number) => (
                    <div key={idx} style={{ marginBottom: '8px' }}>
                      <p style={{ fontFamily: 'var(--font-sans)', fontSize: '0.68rem', color: 'var(--on-dark)', letterSpacing: '0.04em', marginBottom: '2px' }}>{h.days}</p>
                      <p style={{ fontFamily: 'var(--font-sans)', fontSize: '0.65rem', color: 'var(--on-dark-muted)', letterSpacing: '0.04em' }}>{h.lunch} · {h.dinner}</p>
                    </div>
                  ))
                  : (
                    <>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                        <span style={{ fontFamily: 'var(--font-sans)', fontSize: '0.7rem', color: 'var(--on-dark-muted)' }}>Mon – Sun</span>
                        <span style={{ fontFamily: 'var(--font-sans)', fontSize: '0.7rem', color: 'var(--on-dark)' }}>11am – 10pm</span>
                      </div>
                    </>
                  )
                }
              </div>
            </div>
          </div>
        </div>

        {/* Bottom rule */}
        <div style={{ height: '1px', background: 'rgba(242,238,228,0.07)', marginBottom: '32px' }} />

        {/* Bottom bar */}
        <div style={{
          display:        'flex',
          justifyContent: 'space-between',
          alignItems:     'center',
          flexWrap:       'wrap',
          gap:            '16px',
        }}>
          <p style={{
            fontFamily:    'var(--font-sans)',
            fontSize:      '0.62rem',
            color:         'rgba(242,238,228,0.3)',
            letterSpacing: '0.06em',
          }}>
            © {year} The London Shakes. All rights reserved.
          </p>
          <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
            {[
              { label: 'Privacy Policy', href: '/privacy' },
              { label: 'Terms of Service', href: '/terms' },
            ].map(({ label, href }) => (
              <Link key={label} href={href} style={{
                fontFamily:    'var(--font-sans)',
                fontSize:      '0.6rem',
                color:         'rgba(242,238,228,0.3)',
                textDecoration:'none',
                letterSpacing: '0.06em',
                transition:    'color 0.25s ease',
              }}
                onMouseEnter={(e) => (e.currentTarget as HTMLElement).style.color = 'var(--on-dark-muted)'}
                onMouseLeave={(e) => (e.currentTarget as HTMLElement).style.color = 'rgba(242,238,228,0.3)'}
              >
                {label}
              </Link>
            ))}
            <p style={{
              fontFamily:    'var(--font-sans)',
              fontSize:      '0.6rem',
              color:         'rgba(242,238,228,0.2)',
              letterSpacing: '0.06em',
            }}>
              Crafted with care in Silchar, Assam
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
