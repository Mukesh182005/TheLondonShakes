'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useCMSStore } from '@/store/restaurantStore';
import {
  restaurantInfo as initialRestaurantInfo,
  chef as initialChef,
  upcomingEvents as initialUpcomingEvents
} from '@/data/restaurantData';
import { ArrowRight, Clock, ChevronDown, MapPin } from 'lucide-react';

// ── Scroll-Reveal Hook ──
function useReveal(threshold = 0.12) {
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

// ── Animated Counter ──
function AnimatedNumber({ target, prefix = '' }: { target: number; prefix?: string }) {
  const [val, setVal] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        let start = 0;
        const step = target / 60;
        const timer = setInterval(() => {
          start += step;
          if (start >= target) { setVal(target); clearInterval(timer); }
          else setVal(Math.floor(start));
        }, 16);
        observer.disconnect();
      }
    }, { threshold: 0.3 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target]);
  return <span ref={ref}>{prefix}{val.toLocaleString()}</span>;
}

export default function HomePage() {
  const storeRestaurantInfo = useCMSStore((s) => s.restaurantInfo);
  const storeUpcomingEvents = useCMSStore((s) => s.upcomingEvents);
  const storeChef           = useCMSStore((s) => s.chef);

  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => { setIsMounted(true); }, []);

  const restaurantInfo = isMounted ? storeRestaurantInfo : initialRestaurantInfo;
  const upcomingEvents = isMounted ? storeUpcomingEvents : initialUpcomingEvents;
  const chef           = isMounted ? storeChef : initialChef;

  const stats = [
    { val: 2021, label: 'Est. Year', suffix: '' },
    { val: 5000, label: 'Happy Guests', suffix: '+' },
    { val: 20,   label: 'Signature Shakes', suffix: '' },
    { val: 4,    label: 'Stars Rated', suffix: '.9' },
  ];

  // Sections
  const heroRef      = useReveal(0);
  const introRef     = useReveal();
  const aboutRef     = useReveal();
  const eventsRef    = useReveal();
  const ctaRef       = useReveal();

  // Hero words for animated reveal
  const [heroVisible, setHeroVisible] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setHeroVisible(true), 200);
    return () => clearTimeout(t);
  }, []);

  return (
    <main style={{ background: 'var(--black)', overflowX: 'hidden' }}>

      {/* ══════════════════════════════════════════════════
          HERO — Gucci Osteria style: text over cafe image
          ══════════════════════════════════════════════════ */}
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
        {/* Cafe background image */}
        <div style={{
          position:   'absolute',
          inset:      0,
          overflow:   'hidden',
        }}>
          <Image
            src="/cafe-interior-3.jpg"
            alt="The London Shakes interior"
            fill
            priority
            sizes="100vw"
            style={{
              objectFit:  'cover',
              objectPosition: 'center 40%',
              opacity:    0.35,
              filter:     'saturate(0.7) contrast(1.05)',
              transform:  'scale(1.04)',
              transition: 'transform 8s ease',
            }}
          />
        </div>

        {/* Gradient overlay */}
        <div style={{
          position:   'absolute',
          inset:      0,
          background: `
            linear-gradient(180deg,
              rgba(14,12,9,0.65) 0%,
              rgba(14,12,9,0.4) 40%,
              rgba(14,12,9,0.7) 75%,
              rgba(14,12,9,1.0) 100%
            )
          `,
        }} />

        {/* Gucci-style column grid lines */}
        {[16.6, 33.3, 50, 66.6, 83.3].map((x) => (
          <div key={x} style={{
            position:   'absolute',
            top:        0,
            bottom:     0,
            left:       `${x}%`,
            width:      '1px',
            background: 'linear-gradient(180deg, transparent, rgba(158,128,67,0.06) 30%, rgba(158,128,67,0.06) 70%, transparent)',
            pointerEvents: 'none',
          }} />
        ))}

        {/* Center content */}
        <div ref={heroRef.ref} style={{
          position:  'relative',
          zIndex:    2,
          textAlign: 'center',
          padding:   '0 24px',
          maxWidth:  '900px',
        }}>
          {/* Eyebrow */}
          <div style={{
            opacity:    heroVisible ? 1 : 0,
            transform:  heroVisible ? 'none' : 'translateY(12px)',
            transition: 'all 0.8s cubic-bezier(0.19,1,0.22,1)',
            display:    'inline-flex',
            alignItems: 'center',
            gap:        '16px',
            fontFamily: 'var(--font-sans)',
            fontSize:   '0.58rem',
            fontWeight: 600,
            letterSpacing: '0.45em',
            textTransform: 'uppercase',
            color:      'var(--gold)',
            marginBottom: '40px',
          }}>
            <span style={{ display: 'block', width: '28px', height: '1px', background: 'var(--gold)', opacity: 0.5 }} />
            Silchar · Est. 2021
            <span style={{ display: 'block', width: '28px', height: '1px', background: 'var(--gold)', opacity: 0.5 }} />
          </div>

          {/* Main heading — word-by-word reveal */}
          <h1 style={{
            fontFamily:    'var(--font-display)',
            fontSize:      'clamp(4rem, 11vw, 10rem)',
            fontWeight:    300,
            lineHeight:    0.9,
            letterSpacing: '-0.025em',
            color:         'var(--on-dark)',
            marginBottom:  '40px',
          }}>
            {['The', 'London'].map((word, i) => (
              <span
                key={word}
                style={{
                  display:    'block',
                  opacity:    heroVisible ? 1 : 0,
                  transform:  heroVisible ? 'none' : 'translateY(36px)',
                  transition: `opacity 0.9s cubic-bezier(0.19,1,0.22,1) ${0.15 + i * 0.15}s, transform 0.9s cubic-bezier(0.19,1,0.22,1) ${0.15 + i * 0.15}s`,
                }}
              >
                {word}
              </span>
            ))}
            <em style={{
              display:    'block',
              fontStyle:  'italic',
              color:      'var(--gold)',
              fontWeight: 400,
              opacity:    heroVisible ? 1 : 0,
              transform:  heroVisible ? 'none' : 'translateY(36px)',
              transition: 'opacity 0.9s cubic-bezier(0.19,1,0.22,1) 0.45s, transform 0.9s cubic-bezier(0.19,1,0.22,1) 0.45s',
            }}>
              Shakes
            </em>
          </h1>

          {/* Gold line */}
          <div style={{
            width:          '56px',
            height:         '1px',
            background:     'var(--gold)',
            margin:         '0 auto 36px',
            opacity:        heroVisible ? 0.6 : 0,
            transform:      heroVisible ? 'scaleX(1)' : 'scaleX(0)',
            transformOrigin:'left',
            transition:     'all 0.9s cubic-bezier(0.19,1,0.22,1) 0.65s',
          }} />

          {/* Tagline */}
          <p style={{
            fontFamily:    'var(--font-serif)',
            fontSize:      'clamp(1rem, 2.2vw, 1.25rem)',
            fontStyle:     'italic',
            color:         'rgba(242,238,228,0.65)',
            maxWidth:      '520px',
            margin:        '0 auto 56px',
            lineHeight:    1.7,
            opacity:       heroVisible ? 1 : 0,
            transform:     heroVisible ? 'none' : 'translateY(16px)',
            transition:    'all 0.9s cubic-bezier(0.19,1,0.22,1) 0.75s',
          }}>
            {restaurantInfo.tagline || 'Premium Thick Shakes, Gourmet Burgers & Artisan Café Experiences'}
          </p>

          {/* CTAs */}
          <div style={{
            display:    'flex',
            gap:        '16px',
            justifyContent: 'center',
            flexWrap:   'wrap',
            opacity:    heroVisible ? 1 : 0,
            transform:  heroVisible ? 'none' : 'translateY(16px)',
            transition: 'all 0.9s cubic-bezier(0.19,1,0.22,1) 0.9s',
          }}>
            <Link href="/reservations" className="btn-outline-gold">
              <span>Reserve a Table</span>
            </Link>
            <Link href="/menu" style={{
              display:       'inline-flex',
              alignItems:    'center',
              gap:           '10px',
              padding:       '17px 48px',
              fontFamily:    'var(--font-sans)',
              fontSize:      '0.65rem',
              fontWeight:    600,
              letterSpacing: '0.22em',
              textTransform: 'uppercase',
              color:         'rgba(242,238,228,0.55)',
              textDecoration:'none',
              transition:    'color 0.3s ease',
            }}
              onMouseEnter={(e) => (e.currentTarget as HTMLElement).style.color = 'var(--on-dark)'}
              onMouseLeave={(e) => (e.currentTarget as HTMLElement).style.color = 'rgba(242,238,228,0.55)'}
            >
              Explore Menu
              <ArrowRight size={12} />
            </Link>
          </div>
        </div>

        {/* Scroll indicator */}
        <div style={{
          position:      'absolute',
          bottom:        '44px',
          left:          '50%',
          transform:     'translateX(-50%)',
          display:       'flex',
          flexDirection: 'column',
          alignItems:    'center',
          gap:           '10px',
          opacity:       heroVisible ? 0.4 : 0,
          transition:    'opacity 1s ease 1.5s',
          animation:     'float 2.8s ease-in-out infinite',
        }}>
          <p style={{ fontFamily: 'var(--font-sans)', fontSize: '0.5rem', letterSpacing: '0.32em', textTransform: 'uppercase', color: 'var(--on-dark)' }}>
            Scroll
          </p>
          <ChevronDown size={13} color="var(--on-dark)" />
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          INTRO — Gucci Osteria story paragraph style
          ══════════════════════════════════════════════════ */}
      <section style={{
        background: 'var(--black)',
        padding:    '100px 0',
      }}>
        <div className="container" ref={introRef.ref}>
          <div className="home-intro-grid" style={{
            maxWidth:  '960px',
            margin:    '0 auto',
          }}>
            {/* Left: eyebrow + location */}
            <div className="home-intro-left" style={{
              opacity:       introRef.visible ? 1 : 0,
              transform:     introRef.visible ? 'none' : 'translateX(-24px)',
              transition:    'all 1s cubic-bezier(0.19,1,0.22,1)',
            }}>
              <p style={{
                fontFamily:    'var(--font-sans)',
                fontSize:      '0.58rem',
                fontWeight:    600,
                letterSpacing: '0.4em',
                textTransform: 'uppercase',
                color:         'var(--gold)',
                marginBottom:  '20px',
              }}>
                THE LONDON SHAKES
              </p>
              <h2 style={{
                fontFamily:    'var(--font-display)',
                fontSize:      'clamp(2rem, 4vw, 3.2rem)',
                fontWeight:    300,
                color:         'var(--cream)',
                lineHeight:    1.1,
                letterSpacing: '-0.015em',
                marginBottom:  '0',
              }}>
                Where every sip tells a story
              </h2>
            </div>

            {/* Divider */}
            <div className="divider" style={{
              background:  'linear-gradient(180deg, transparent, var(--dark-border) 30%, var(--dark-border) 70%, transparent)',
              margin:      '0 0',
            }} />

            {/* Right: story text */}
            <div className="home-intro-right" style={{
              opacity:       introRef.visible ? 1 : 0,
              transform:     introRef.visible ? 'none' : 'translateX(24px)',
              transition:    'all 1s cubic-bezier(0.19,1,0.22,1) 0.15s',
            }}>
              <p style={{
                fontFamily:  'var(--font-serif)',
                fontSize:    '1.05rem',
                lineHeight:  1.85,
                color:       'var(--text-secondary)',
                marginBottom: '28px',
              }}>
                Nestled in the heart of Silchar, The London Shakes is a contemporary café inspired by the grandeur of the 1950s British aesthetic — newspaper-collage walls, warm Edison glow, and the spirit of bold experimentation.
              </p>
              <Link href="/about" style={{
                display:       'inline-flex',
                alignItems:    'center',
                gap:           '10px',
                fontFamily:    'var(--font-sans)',
                fontSize:      '0.6rem',
                fontWeight:    600,
                letterSpacing: '0.22em',
                textTransform: 'uppercase',
                color:         'var(--cream)',
                position:      'relative',
                textDecoration:'none',
              }}
                className="link-underline"
              >
                Our Story
                <ArrowRight size={11} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          STATS STRIP — Dishoom census style
          ══════════════════════════════════════════════════ */}
      <section style={{
        background:   'var(--panel-dark)',
        padding:      '0',
        borderTop:    '1px solid rgba(158,128,67,0.1)',
        borderBottom: '1px solid rgba(158,128,67,0.1)',
      }}>
        <div className="container">
          <div className="home-stats-grid">
            {stats.map((s, i) => (
              <div key={i} style={{
                textAlign:    'center',
                padding:      '56px 24px',
              }}>
                <div style={{
                  fontFamily:    'var(--font-display)',
                  fontSize:      'clamp(2.2rem, 4vw, 3.6rem)',
                  fontWeight:    300,
                  color:         'var(--gold)',
                  lineHeight:    1,
                  marginBottom:  '10px',
                  letterSpacing: '-0.02em',
                }}>
                  <span style={{ whiteSpace: 'nowrap' }}><AnimatedNumber target={s.val} />{s.suffix}</span>
                </div>
                <p style={{
                  fontFamily:    'var(--font-sans)',
                  fontSize:      '0.58rem',
                  fontWeight:    600,
                  letterSpacing: '0.22em',
                  textTransform: 'uppercase',
                  color:         'var(--on-dark-muted)',
                }}>
                  {s.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>


      {/* ══════════════════════════════════════════════════


      {/* ══════════════════════════════════════════════════
          DARK ABOUT PANEL — Pujol / EMP style
          ══════════════════════════════════════════════════ */}
      <section ref={aboutRef.ref} style={{
        background:  'var(--panel-dark)',
        padding:     'var(--section-padding) 0',
        position:    'relative',
        overflow:    'hidden',
      }}>
        {/* Background cafe image with heavy overlay */}
        <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
          <Image
            src="/cafe-interior-4.jpg"
            alt=""
            aria-hidden
            fill
            sizes="100vw"
            style={{
              objectFit:  'cover',
              opacity:    0.12,
              filter:     'grayscale(0.5)',
            }}
          />
        </div>

        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <div style={{
            maxWidth: '720px',
            opacity:  aboutRef.visible ? 1 : 0,
            transform:aboutRef.visible ? 'none' : 'translateY(32px)',
            transition: 'all 1s cubic-bezier(0.19,1,0.22,1)',
          }}>
            <p style={{
              fontFamily:    'var(--font-sans)',
              fontSize:      '0.58rem',
              fontWeight:    600,
              letterSpacing: '0.42em',
              textTransform: 'uppercase',
              color:         'var(--gold)',
              marginBottom:  '28px',
            }}>
              About the space
            </p>
            <blockquote style={{
              fontFamily:    'var(--font-display)',
              fontSize:      'clamp(1.8rem, 3.5vw, 3rem)',
              fontWeight:    300,
              color:         'var(--on-dark)',
              lineHeight:    1.25,
              letterSpacing: '-0.015em',
              marginBottom:  '40px',
            }}>
              "We built a café that honours British heritage while celebrating the bold spirit of Silchar's food culture."
            </blockquote>
            <div style={{
              display:    'flex',
              alignItems: 'center',
              gap:        '16px',
            }}>
              <div style={{ width: '40px', height: '1px', background: 'var(--gold)', opacity: 0.5 }} />
              <p style={{
                fontFamily:    'var(--font-sans)',
                fontSize:      '0.62rem',
                fontWeight:    600,
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
                color:         'var(--on-dark-muted)',
              }}>
                {chef.name}, Founder
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          UPCOMING EVENTS
          ══════════════════════════════════════════════════ */}
      {upcomingEvents.length > 0 && (
        <section style={{ background: 'var(--black)', padding: 'var(--section-padding) 0' }}>
          <div className="container" ref={eventsRef.ref}>
            <div style={{
              display:       'flex',
              justifyContent:'space-between',
              alignItems:    'flex-end',
              marginBottom:  '64px',
              opacity:       eventsRef.visible ? 1 : 0,
              transform:     eventsRef.visible ? 'none' : 'translateY(20px)',
              transition:    'all 0.9s cubic-bezier(0.19,1,0.22,1)',
            }}>
              <div>
                <p style={{
                  fontFamily:    'var(--font-sans)',
                  fontSize:      '0.58rem',
                  fontWeight:    600,
                  letterSpacing: '0.42em',
                  textTransform: 'uppercase',
                  color:         'var(--gold)',
                  marginBottom:  '16px',
                }}>
                  Upcoming
                </p>
                <h2 style={{
                  fontFamily:    'var(--font-display)',
                  fontSize:      'clamp(2.2rem, 4vw, 3.8rem)',
                  fontWeight:    300,
                  color:         'var(--cream)',
                  lineHeight:    1,
                  letterSpacing: '-0.02em',
                }}>
                  Events & <em style={{ fontStyle: 'italic', color: 'var(--gold)' }}>Experiences</em>
                </h2>
              </div>
              <Link href="/events" className="link-underline" style={{ paddingBottom: '4px', marginBottom: '4px' }}>
                All events <ArrowRight size={11} style={{ display: 'inline', marginLeft: '6px' }} />
              </Link>
            </div>

            <div style={{
              gap:                 '1px',
              background:          'var(--dark-border)',
              border:              '1px solid var(--dark-border)',
            }} className="grid grid-cols-1 md:grid-cols-3">
              {upcomingEvents.slice(0, 3).map((ev, i) => (
                <div key={ev.id} style={{
                  background:    'var(--dark-card)',
                  padding:       '40px 32px',
                  display:       'flex',
                  flexDirection: 'column',
                  gap:           '12px',
                  cursor:        'pointer',
                  transition:    'background 0.4s ease',
                  opacity:       eventsRef.visible ? 1 : 0,
                  transitionDelay: `${i * 0.1}s`,
                }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = 'var(--charcoal)'; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'var(--dark-card)'; }}
                >
                  <p style={{
                    fontFamily:    'var(--font-sans)',
                    fontSize:      '0.55rem',
                    fontWeight:    600,
                    letterSpacing: '0.28em',
                    textTransform: 'uppercase',
                    color:         'var(--gold)',
                  }}>
                    {(() => {
                      const parsed = new Date(ev.date);
                      return isNaN(parsed.getTime())
                        ? ev.date
                        : parsed.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
                    })()}
                  </p>
                  <h3 style={{
                    fontFamily:    'var(--font-display)',
                    fontSize:      '1.5rem',
                    fontWeight:    400,
                    color:         'var(--cream)',
                    lineHeight:    1.15,
                  }}>
                    {ev.title}
                  </h3>
                  <p style={{
                    fontFamily:  'var(--font-serif)',
                    fontStyle:   'italic',
                    fontSize:    '0.875rem',
                    color:       'var(--text-secondary)',
                    lineHeight:  1.65,
                    flex:        1,
                  }}>
                    {ev.description}
                  </p>
                  <div style={{
                    display:     'flex',
                    alignItems:  'center',
                    gap:         '8px',
                    paddingTop:  '16px',
                    borderTop:   '1px solid var(--dark-border)',
                    marginTop:   '8px',
                  }}>
                    <Clock size={11} color="var(--text-ghost)" />
                    <span style={{ fontFamily: 'var(--font-sans)', fontSize: '0.6rem', color: 'var(--text-ghost)', letterSpacing: '0.1em' }}>
                      {ev.time}
                    </span>
                    {ev.price !== undefined && (
                      <span style={{ fontFamily: 'var(--font-sans)', fontSize: '0.6rem', color: 'var(--gold)', letterSpacing: '0.1em', marginLeft: 'auto' }}>
                        {ev.price}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ══════════════════════════════════════════════════
          LOCATION MAP SECTION
          ══════════════════════════════════════════════════ */}
      <section style={{ background: 'var(--void)', padding: '80px 24px' }}>
        <div className="container" style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <p style={{
              fontFamily:    'var(--font-sans)',
              fontSize:      '0.58rem',
              fontWeight:    600,
              letterSpacing: '0.4em',
              textTransform: 'uppercase',
              color:         'var(--gold)',
              marginBottom:  '12px',
            }}>
              VISIT US
            </p>
            <h2 style={{
              fontFamily:    'var(--font-display)',
              fontSize:      'clamp(2rem, 4vw, 3.2rem)',
              fontWeight:    300,
              color:         'var(--text-primary)',
              lineHeight:    1.1,
              letterSpacing: '-0.015em',
            }}>
              Our Silchar <em style={{ color: 'var(--gold)', fontStyle: 'italic' }}>Location</em>
            </h2>
          </div>

          <div style={{ border: '1px solid rgba(197,168,92,0.3)', overflow: 'hidden', borderRadius: '4px', boxShadow: '0 8px 30px rgba(0,0,0,0.05)' }}>
            {/* Header bar */}
            <div style={{
              display:        'flex',
              alignItems:     'center',
              justifyContent: 'space-between',
              padding:        '14px 20px',
              background:     '#1C1915',
              borderBottom:   '1px solid rgba(197,168,92,0.2)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <MapPin size={15} color="var(--gold)" />
                <span style={{
                  fontFamily:    'var(--font-sans)',
                  fontSize:      '0.62rem',
                  fontWeight:    700,
                  letterSpacing: '0.2em',
                  textTransform: 'uppercase',
                  color:         'var(--gold)',
                }}>
                  The London Shakes — Silchar
                </span>
              </div>
              <a
                href="https://www.google.com/maps/place/The+London+Shakes+Silchar/@24.8227801,92.7972719,17z"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  fontFamily:    'var(--font-sans)',
                  fontSize:      '0.58rem',
                  fontWeight:    600,
                  letterSpacing: '0.15em',
                  textTransform: 'uppercase',
                  color:         'rgba(197,168,92,0.7)',
                  textDecoration: 'none',
                  transition:    'color 0.2s ease',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--gold)')}
                onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(197,168,92,0.7)')}
              >
                Open in Maps ↗
              </a>
            </div>

            {/* Iframe */}
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3645.6!2d92.7972719!3d24.8227801!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x374e4bd43e738f43%3A0x49c55481d3cdbd9f!2sThe%20London%20Shakes%20Silchar!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin"
              width="100%"
              height="400"
              style={{
                border: 0,
                display: 'block',
                filter: 'grayscale(35%) contrast(1.1) brightness(0.92) sepia(15%)',
              }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="The London Shakes — Silchar location on Google Maps"
            />
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          BOTTOM CTA — Full-width dark immersive
          ══════════════════════════════════════════════════ */}
      <section ref={ctaRef.ref} style={{
        position:   'relative',
        overflow:   'hidden',
        background: 'var(--panel-dark)',
        padding:    '120px 0',
        textAlign:  'center',
      }}>
        {/* Cafe image bg */}
        <div style={{ position: 'absolute', inset: 0 }}>
          <Image
            src="/cafe-interior-3.jpg"
            alt=""
            aria-hidden
            fill
            sizes="100vw"
            style={{
              objectFit: 'cover',
              opacity:   0.15,
              filter:    'saturate(0.6)',
            }}
          />
          <div style={{
            position:   'absolute',
            inset:      0,
            background: 'linear-gradient(180deg, rgba(14,12,9,0.5) 0%, rgba(14,12,9,0.8) 100%)',
          }} />
        </div>

        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <div style={{
            opacity:    ctaRef.visible ? 1 : 0,
            transform:  ctaRef.visible ? 'none' : 'translateY(28px)',
            transition: 'all 1s cubic-bezier(0.19,1,0.22,1)',
          }}>
            <p style={{
              fontFamily:    'var(--font-sans)',
              fontSize:      '0.58rem',
              fontWeight:    600,
              letterSpacing: '0.45em',
              textTransform: 'uppercase',
              color:         'var(--gold)',
              marginBottom:  '28px',
            }}>
              Reserve Your Experience
            </p>
            <h2 style={{
              fontFamily:    'var(--font-display)',
              fontSize:      'clamp(3rem, 7vw, 6.5rem)',
              fontWeight:    300,
              color:         'var(--on-dark)',
              lineHeight:    0.95,
              letterSpacing: '-0.025em',
              marginBottom:  '48px',
            }}>
              Join us for an<br />
              <em style={{ fontStyle: 'italic', color: 'var(--gold)' }}>unforgettable</em> evening
            </h2>
            <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link href="/reservations" className="btn-outline-gold">
                <span>Book a Table</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

    </main>
  );
}
