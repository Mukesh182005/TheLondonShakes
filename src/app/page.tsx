'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import MagneticButton from '@/components/MagneticButton';
import { useCMSStore, useRestaurantStore, useIsMounted } from '@/store/restaurantStore';
import {
  restaurantInfo as initialRestaurantInfo,
  chef as initialChef,
  upcomingEvents as initialUpcomingEvents
} from '@/data/restaurantData';
import { ArrowRight, ChevronDown, MapPin, Clock } from 'lucide-react';
import NewArrivalsToast from '@/components/NewArrivalsToast';

/* ══════════════════════════════════════════════════════════════════
   GUCCI OSTERIA-STYLE HOME
   Editorial · restrained · whitespace-forward · image-led.
   Crimson (var(--red)) used sparingly as the single accent.
   ══════════════════════════════════════════════════════════════════ */

// ── Slow scroll-reveal (fade + rise) ──
function useReveal(threshold = 0.14) {
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, visible };
}

// ── Signature Gucci descriptor band: text separated by ✦ stars ──
function DescriptorBand() {
  const phrases = [
    'A contemporary café',
    'Signature milkshakes',
    'Gourmet smash burgers',
    'Artisan coffee',
    'Found in Silchar',
  ];
  const line = [...phrases, ...phrases, ...phrases, ...phrases];

  return (
    <div style={{
      background:    'var(--void)',
      borderTop:     '1px solid var(--dark-border)',
      borderBottom:  '1px solid var(--dark-border)',
      padding:       '26px 0',
      overflow:      'hidden',
      userSelect:    'none',
    }}>
      <style>{`
        @keyframes gucci-band { from { transform: translateX(0); } to { transform: translateX(-50%); } }
      `}</style>
      <div style={{
        display:    'flex',
        width:      'max-content',
        alignItems: 'center',
        animation:  'gucci-band 60s linear infinite',
      }}>
        {line.map((p, i) => (
          <React.Fragment key={`${p}-${i}`}>
            <span style={{
              fontFamily:    'var(--font-display)',
              fontStyle:     'italic',
              fontSize:      'clamp(1rem, 1.6vw, 1.3rem)',
              fontWeight:    400,
              letterSpacing: '0.02em',
              color:         'var(--cream)',
              whiteSpace:    'nowrap',
              padding:       '0 6px',
            }}>{p}</span>
            <span aria-hidden style={{
              margin:   '0 26px',
              color:    'var(--red)',
              fontSize: '0.7rem',
              opacity:  0.85,
            }}>✦</span>
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}

export default function HomePage() {
  const storeRestaurantInfo = useCMSStore((s) => s.restaurantInfo);
  const storeUpcomingEvents = useCMSStore((s) => s.upcomingEvents);
  const storeChef           = useCMSStore((s) => s.chef);
  const storeUser           = useRestaurantStore((s) => s.user);

  const isMounted = useIsMounted();
  const user = isMounted ? storeUser : null;

  const restaurantInfo = isMounted ? storeRestaurantInfo : initialRestaurantInfo;
  const upcomingEvents = isMounted ? storeUpcomingEvents : initialUpcomingEvents;
  const chef           = isMounted ? storeChef : initialChef;

  const introRef  = useReveal();
  const quoteRef  = useReveal();
  const eventsRef = useReveal();
  const ctaRef    = useReveal();

  // Slow hero entrance
  const [heroVisible, setHeroVisible] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setHeroVisible(true), 250);
    return () => clearTimeout(t);
  }, []);

  return (
    <main style={{ background: 'var(--black)', overflowX: 'hidden' }}>

      {/* ══════════════ HERO — café photo behind, wordmark in front ══════════════ */}
      <section style={{
        position:       'relative',
        minHeight:      '100vh',
        display:        'flex',
        flexDirection:  'column',
        alignItems:     'center',
        justifyContent: 'center',
        overflow:       'hidden',
        background:     'var(--panel-dark)',
      }}>
        {/* Café photo — back layer, fixed 0.7 opacity */}
        <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
          <Image
            src="/cafe-interior-3.jpg"
            alt="Inside The London Shakes — Union Jack & Big Ben mural wall, Silchar"
            fill
            priority
            sizes="100vw"
            style={{
              objectFit:      'cover',
              objectPosition: 'center 40%',
              opacity:        0.7,
              transform:      heroVisible ? 'scale(1.03)' : 'scale(1.08)',
              transition:     'transform 2.4s var(--ease-expo)',
            }}
          />
        </div>

        {/* Darkening gradient so the wordmark stays legible in front */}
        <div style={{
          position:   'absolute',
          inset:      0,
          background: `linear-gradient(180deg,
            rgba(14,12,9,0.68) 0%,
            rgba(14,12,9,0.48) 42%,
            rgba(14,12,9,0.72) 78%,
            rgba(14,12,9,0.96) 100%)`,
        }} />
        {/* Extra scrim behind the left CTA column for contrast against the busy photo */}
        <div style={{
          position:   'absolute',
          inset:      0,
          background: 'linear-gradient(90deg, rgba(14,12,9,0.55) 0%, transparent 45%)',
        }} />

        {/* Content — CTAs left, restaurant name right */}
        <div className="home-hero-split" style={{
          position:  'relative',
          zIndex:    2,
          width:     '100%',
          maxWidth:  '1180px',
          padding:   '0 24px',
        }}>
          {/* Left: highlighted CTAs — first thing a visitor can act on */}
          <div className="hero-cta-col" style={{
            display:        'flex',
            flexDirection:  'column',
            gap:            '18px',
            opacity:        heroVisible ? 1 : 0,
            transform:      heroVisible ? 'none' : 'translateY(16px)',
            transition:     'all 1.1s var(--ease-expo) 0.5s',
          }}>
            <MagneticButton strength={0.35}>
              <Link href="/reservations" className="btn-red btn-lift-red sheen">
                <span>Reserve a Table</span>
              </Link>
            </MagneticButton>
            <MagneticButton strength={0.35}>
              <Link href="/menu" className="btn-outline-gold btn-lift sheen">
                <span>Explore Menu</span>
                <ArrowRight size={13} />
              </Link>
            </MagneticButton>
          </div>

          {/* Right: restaurant name — the first thing seen */}
          <div className="hero-name-col">
            <p style={{
              opacity:       heroVisible ? 0.9 : 0,
              transform:     heroVisible ? 'none' : 'translateY(12px)',
              transition:    'all 1s var(--ease-expo)',
              display:       'inline-flex',
              alignItems:    'center',
              gap:           '18px',
              fontFamily:    'var(--font-sans)',
              fontSize:      '0.6rem',
              fontWeight:    600,
              letterSpacing: '0.5em',
              textTransform: 'uppercase',
              color:         'var(--on-dark)',
              marginBottom:  '32px',
            }}>
              Silchar · Est. 2021
              <span style={{ display: 'block', width: '30px', height: '1px', background: 'var(--red)', opacity: 0.8 }} />
            </p>

            <h1 style={{
              fontFamily:    'var(--font-display)',
              fontSize:      'clamp(4.5rem, 11vw, 10rem)',
              fontWeight:    300,
              lineHeight:    0.96,
              letterSpacing: '-0.03em',
              color:         'var(--on-dark)',
              marginBottom:  '28px',
            }}>
              {['The', 'London'].map((word, i) => (
                <span key={word} style={{
                  display:    'block',
                  opacity:    heroVisible ? 1 : 0,
                  transform:  heroVisible ? 'none' : 'translateY(38px)',
                  transition: `opacity 1.1s var(--ease-expo) ${0.2 + i * 0.18}s, transform 1.1s var(--ease-expo) ${0.2 + i * 0.18}s`,
                }}>{word}</span>
              ))}
              <em style={{
                display:    'block',
                fontStyle:  'italic',
                fontWeight: 400,
                color:      '#E8102A',
                textShadow: '0 0 40px rgba(232,16,42,0.4)',
                opacity:    heroVisible ? 1 : 0,
                transform:  heroVisible ? 'none' : 'translateY(38px)',
                transition: 'opacity 1.1s var(--ease-expo) 0.56s, transform 1.1s var(--ease-expo) 0.56s',
              }}>Shakes</em>
            </h1>

            <p style={{
              fontFamily:  'var(--font-serif)',
              fontSize:    'clamp(1rem, 1.8vw, 1.2rem)',
              fontStyle:   'italic',
              color:       'rgba(242,238,228,0.7)',
              lineHeight:  1.75,
              opacity:     heroVisible ? 1 : 0,
              transform:   heroVisible ? 'none' : 'translateY(16px)',
              transition:  'all 1.1s var(--ease-expo) 0.8s',
            }}>
              {restaurantInfo.tagline || 'A contemporary café of premium shakes, gourmet burgers & artisan coffee.'}
            </p>
          </div>
        </div>

        {/* Scroll cue */}
        <div style={{
          position:  'absolute',
          bottom:    '40px',
          left:      '50%',
          transform: 'translateX(-50%)',
          display:   'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap:       '10px',
          opacity:   heroVisible ? 0.5 : 0,
          transition:'opacity 1.2s ease 1.6s',
          animation: 'float 3s ease-in-out infinite',
        }}>
          <span style={{ fontFamily: 'var(--font-sans)', fontSize: '0.5rem', letterSpacing: '0.34em', textTransform: 'uppercase', color: 'var(--on-dark)' }}>Scroll</span>
          <ChevronDown size={14} color="var(--on-dark)" />
        </div>
      </section>

      {/* ══════════════ DESCRIPTOR STAR-BAND (Gucci signature) ══════════════ */}
      <DescriptorBand />

      {/* ══════════════ INTRO — editorial, whitespace-forward ══════════════ */}
      <section style={{ background: 'var(--black)', padding: 'clamp(90px, 12vw, 160px) 0' }}>
        <div className="container" ref={introRef.ref}>
          <div style={{ maxWidth: '820px', margin: '0 auto', textAlign: 'center' }}>
            <p style={{
              fontFamily: 'var(--font-sans)', fontSize: '0.58rem', fontWeight: 600,
              letterSpacing: '0.42em', textTransform: 'uppercase', color: 'var(--red)',
              marginBottom: '32px',
              opacity: introRef.visible ? 1 : 0,
              transition: 'opacity 1s var(--ease-expo)',
            }}>
              The London Shakes
            </p>
            <p style={{
              fontFamily: 'var(--font-display)',
              fontSize:   'clamp(1.7rem, 3.4vw, 2.9rem)',
              fontWeight: 300,
              lineHeight: 1.35,
              letterSpacing: '-0.015em',
              color:      'var(--cream)',
              marginBottom: '40px',
              opacity:    introRef.visible ? 1 : 0,
              transform:  introRef.visible ? 'none' : 'translateY(24px)',
              transition: 'all 1.1s var(--ease-expo) 0.1s',
            }}>
              Nestled in the heart of Silchar, a contemporary café inspired by the grandeur of
              1950s Britain — where every sip tells a story.
            </p>
            <Link href="/about" className="link-underline" style={{
              display: 'inline-flex', alignItems: 'center', gap: '10px',
              opacity: introRef.visible ? 1 : 0, transition: 'opacity 1s var(--ease-expo) 0.3s',
            }}>
              Our Story <ArrowRight size={11} />
            </Link>
          </div>
        </div>
      </section>

      {/* ══════════════ FOUNDER QUOTE — dark, restrained ══════════════ */}
      <section ref={quoteRef.ref} style={{
        background: 'var(--panel-dark)',
        padding:    'clamp(90px, 12vw, 160px) 0',
        position:   'relative',
        overflow:   'hidden',
      }}>
        <div style={{ position: 'absolute', inset: 0 }}>
          <Image src="/cafe-interior-1.jpg" alt="" aria-hidden fill sizes="100vw"
            style={{ objectFit: 'cover', opacity: 0.6, filter: 'grayscale(0.35)' }} />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(14,12,9,0.55) 0%, rgba(14,12,9,0.75) 55%, rgba(14,12,9,0.55) 100%)' }} />
        </div>
        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <div style={{
            maxWidth: '860px', margin: '0 auto', textAlign: 'center',
            opacity: quoteRef.visible ? 1 : 0,
            transform: quoteRef.visible ? 'none' : 'translateY(28px)',
            transition: 'all 1.1s var(--ease-expo)',
          }}>
            <span aria-hidden style={{
              fontFamily: 'var(--font-display)', fontSize: '5rem', lineHeight: 0.5,
              color: 'var(--red)', opacity: 0.55, display: 'block', marginBottom: '8px',
            }}>&ldquo;</span>
            <blockquote style={{
              fontFamily: 'var(--font-display)',
              fontSize:   'clamp(1.8rem, 3.6vw, 3.1rem)',
              fontWeight: 300,
              color:      'var(--on-dark)',
              lineHeight: 1.3,
              letterSpacing: '-0.015em',
              marginBottom: '40px',
            }}>
              We built a café that honours British heritage while celebrating the bold spirit
              of Silchar&rsquo;s food culture.
            </blockquote>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '16px' }}>
              <span style={{ width: '40px', height: '1px', background: 'var(--red)', opacity: 0.6 }} />
              <span style={{
                fontFamily: 'var(--font-sans)', fontSize: '0.62rem', fontWeight: 600,
                letterSpacing: '0.24em', textTransform: 'uppercase', color: 'var(--on-dark-muted)',
              }}>
                {chef.name}, Founder
              </span>
              <span style={{ width: '40px', height: '1px', background: 'var(--red)', opacity: 0.6 }} />
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════ EVENTS — quiet editorial list ══════════════ */}
      {upcomingEvents.length > 0 && (
        <section style={{ background: 'var(--black)', padding: 'clamp(90px, 12vw, 150px) 0' }}>
          <div className="container" ref={eventsRef.ref}>
            <div style={{ textAlign: 'center', marginBottom: '64px' }}>
              <p style={{
                fontFamily: 'var(--font-sans)', fontSize: '0.58rem', fontWeight: 600,
                letterSpacing: '0.42em', textTransform: 'uppercase', color: 'var(--red)',
                marginBottom: '16px',
              }}>Upcoming</p>
              <h2 style={{
                fontFamily: 'var(--font-display)', fontSize: 'clamp(2.2rem, 4.5vw, 3.8rem)',
                fontWeight: 300, color: 'var(--cream)', lineHeight: 1, letterSpacing: '-0.02em',
              }}>
                Events &amp; <em style={{ fontStyle: 'italic', color: 'var(--red)' }}>Experiences</em>
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3" style={{
              gap: '1px', background: 'var(--dark-border)', border: '1px solid var(--dark-border)',
            }}>
              {upcomingEvents.slice(0, 3).map((ev, i) => (
                <div key={ev.id} style={{
                  background: 'var(--dark-card)', padding: '44px 34px',
                  display: 'flex', flexDirection: 'column', gap: '14px',
                  opacity: eventsRef.visible ? 1 : 0,
                  transform: eventsRef.visible ? 'none' : 'translateY(20px)',
                  transition: `all 0.9s var(--ease-expo) ${i * 0.1}s`,
                }}>
                  <p style={{
                    fontFamily: 'var(--font-sans)', fontSize: '0.55rem', fontWeight: 600,
                    letterSpacing: '0.28em', textTransform: 'uppercase', color: 'var(--red)',
                  }}>
                    {(() => {
                      const parsed = new Date(ev.date);
                      return isNaN(parsed.getTime())
                        ? ev.date
                        : parsed.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
                    })()}
                  </p>
                  <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.55rem', fontWeight: 400, color: 'var(--cream)', lineHeight: 1.15 }}>
                    {ev.title}
                  </h3>
                  <p style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.65, flex: 1 }}>
                    {ev.description}
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingTop: '18px', borderTop: '1px solid var(--dark-border)', marginTop: '8px' }}>
                    <Clock size={11} color="var(--text-ghost)" />
                    <span style={{ fontFamily: 'var(--font-sans)', fontSize: '0.6rem', color: 'var(--text-ghost)', letterSpacing: '0.1em' }}>{ev.time}</span>
                    {ev.price !== undefined && (
                      <span style={{ fontFamily: 'var(--font-sans)', fontSize: '0.6rem', color: 'var(--red)', letterSpacing: '0.1em', marginLeft: 'auto' }}>{ev.price}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <div style={{ textAlign: 'center', marginTop: '48px' }}>
              <Link href="/events" className="link-underline">All events <ArrowRight size={11} style={{ display: 'inline', marginLeft: '6px' }} /></Link>
            </div>
          </div>
        </section>
      )}

      {/* ══════════════ LOCATION ══════════════ */}
      <section style={{ background: 'var(--void)', padding: 'clamp(70px, 9vw, 110px) 24px' }}>
        <div className="container" style={{ maxWidth: '1120px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '44px' }}>
            <p style={{
              fontFamily: 'var(--font-sans)', fontSize: '0.58rem', fontWeight: 600,
              letterSpacing: '0.42em', textTransform: 'uppercase', color: 'var(--red)', marginBottom: '14px',
            }}>Visit Us</p>
            <h2 style={{
              fontFamily: 'var(--font-display)', fontSize: 'clamp(2rem, 4vw, 3.2rem)',
              fontWeight: 300, color: 'var(--text-primary)', lineHeight: 1.1, letterSpacing: '-0.015em',
            }}>
              Our Silchar <em style={{ fontStyle: 'italic', color: 'var(--red)' }}>Location</em>
            </h2>
          </div>

          <div style={{ border: '1px solid var(--dark-border)', overflow: 'hidden', boxShadow: '0 12px 40px rgba(28,25,21,0.08)' }}>
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '15px 22px', background: '#1C1915', borderBottom: '1px solid rgba(143,29,47,0.25)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <MapPin size={15} color="var(--red)" />
                <span style={{ fontFamily: 'var(--font-sans)', fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--on-dark)' }}>
                  The London Shakes — Silchar
                </span>
              </div>
              <a href="https://www.google.com/maps/place/The+London+Shakes+Silchar/@24.8227801,92.7972719,17z"
                target="_blank" rel="noopener noreferrer"
                style={{ fontFamily: 'var(--font-sans)', fontSize: '0.58rem', fontWeight: 600, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(242,238,228,0.7)', transition: 'color 0.2s ease' }}
                onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--on-dark)')}
                onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(242,238,228,0.7)')}
              >Open in Maps ↗</a>
            </div>
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3645.6!2d92.7972719!3d24.8227801!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x374e4bd43e738f43%3A0x49c55481d3cdbd9f!2sThe%20London%20Shakes%20Silchar!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin"
              width="100%" height="420"
              style={{ border: 0, display: 'block', filter: 'grayscale(30%) contrast(1.05) brightness(0.95) sepia(10%)' }}
              allowFullScreen loading="lazy" referrerPolicy="no-referrer-when-downgrade"
              title="The London Shakes — Silchar location on Google Maps"
            />
          </div>
        </div>
      </section>

      {/* ══════════════ RESERVE — immersive closing ══════════════ */}
      <section ref={ctaRef.ref} style={{
        position: 'relative', overflow: 'hidden',
        background: 'var(--panel-dark)', padding: 'clamp(110px, 15vw, 180px) 0', textAlign: 'center',
      }}>
        <div style={{ position: 'absolute', inset: 0 }}>
          <Image src="/cafe-interior-3.jpg" alt="" aria-hidden fill sizes="100vw"
            style={{ objectFit: 'cover', opacity: 0.6, filter: 'saturate(0.85)' }} />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(14,12,9,0.65) 0%, rgba(14,12,9,0.94) 100%)' }} />
        </div>
        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <div style={{
            opacity: ctaRef.visible ? 1 : 0,
            transform: ctaRef.visible ? 'none' : 'translateY(28px)',
            transition: 'all 1.1s var(--ease-expo)',
          }}>
            <p style={{
              fontFamily: 'var(--font-sans)', fontSize: '0.58rem', fontWeight: 600,
              letterSpacing: '0.48em', textTransform: 'uppercase', color: 'var(--red)', marginBottom: '30px',
            }}>Reserve Your Experience</p>
            <h2 style={{
              fontFamily: 'var(--font-display)', fontSize: 'clamp(2.8rem, 7vw, 6rem)',
              fontWeight: 300, color: 'var(--on-dark)', lineHeight: 0.98, letterSpacing: '-0.025em', marginBottom: '52px',
            }}>
              Join us for an<br />
              <em style={{ fontStyle: 'italic', color: 'var(--red)' }}>unforgettable</em> evening
            </h2>
            <Link href="/reservations" style={{
              display: 'inline-flex', alignItems: 'center', gap: '12px',
              fontFamily: 'var(--font-sans)', fontSize: '0.64rem', fontWeight: 600,
              letterSpacing: '0.26em', textTransform: 'uppercase', color: 'var(--on-dark)',
              paddingBottom: '6px', borderBottom: '1px solid rgba(242,238,228,0.45)',
            }}>
              Book a Table <ArrowRight size={12} />
            </Link>
          </div>
        </div>
      </section>

      <NewArrivalsToast />
    </main>
  );
}
