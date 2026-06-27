'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useCMSStore } from '@/store/restaurantStore';
import { 
  restaurantInfo as initialRestaurantInfo,
  chef as initialChef 
} from '@/data/restaurantData';
import { MapPin, Clock, Phone, Mail, Star, Award, Heart, Users } from 'lucide-react';

// ── Section Reveal Hook ──────────────────────────────────────────────────────
function useReveal(threshold = 0.15) {
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

// ── Animated Counter ──────────────────────────────────────────────────────────
function Counter({ target, suffix = '' }: { target: number; suffix?: string }) {
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
  return <span ref={ref}>{val.toLocaleString()}{suffix}</span>;
}

export default function AboutPage() {
  const storeRestaurantInfo = useCMSStore((s) => s.restaurantInfo);
  const storeChef           = useCMSStore((s) => s.chef);

  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const restaurantInfo = isMounted ? storeRestaurantInfo : initialRestaurantInfo;
  const chef           = isMounted ? storeChef : initialChef;

  const heroSec    = useReveal(0.1);
  const storySec   = useReveal();
  const statsSec   = useReveal();
  const valuesSec  = useReveal();
  const teamSec    = useReveal();
  const awardsSec  = useReveal();
  const ctaSec     = useReveal();

  const stats = [
    { value: 2021, suffix: '',  label: 'Founded',        icon: <Star size={20} /> },
    { value: 50,   suffix: '+', label: 'Menu Items',     icon: <Heart size={20} /> },
    { value: 4.9,  suffix: '',  label: 'Google Rating',  icon: <Star size={20} /> },
    { value: 5000, suffix: '+', label: 'Happy Customers',icon: <Users size={20} /> },
  ];

  const values = [
    {
      icon: '✦',
      title: 'Quality First',
      body: 'Every ingredient is sourced with care. Fresh milk, premium chocolate, and hand-picked produce arrive daily to ensure every shake is extraordinary.',
    },
    {
      icon: '◈',
      title: 'Crafted With Passion',
      body: 'From our signature thick shakes to stone-baked waffles — each item is prepared with meticulous attention to flavour, texture, and presentation.',
    },
    {
      icon: '◉',
      title: 'Community at Heart',
      body: 'The London Shakes was born in Silchar for Silchar. We take pride in being the go-to hangout for friends, families, and food lovers across the city.',
    },
    {
      icon: '◇',
      title: 'Continuously Evolving',
      body: 'Our menu grows with our guests. From seasonal specials to daily chef picks, we keep the experience fresh, exciting, and always worth returning to.',
    },
  ];

  return (
    <div className="page-wrapper" style={{ background: 'var(--black)', color: 'var(--text-primary)' }}>

      {/* ═══ HERO ═══════════════════════════════════════════════════════════ */}
      <div
        style={{
          position:       'relative',
          background:     'linear-gradient(180deg, #050301 0%, #0d0905 60%, var(--dark-bg) 100%)',
          padding:        '100px 0 80px',
          textAlign:      'center',
          borderBottom:   '1px solid rgba(197,168,92,0.1)',
          overflow:       'hidden',
        }}
      >
        {/* Background decoration */}
        <div style={{
          position:   'absolute',
          inset:      0,
          background: 'radial-gradient(ellipse 70% 60% at 50% 0%, rgba(197,168,92,0.07) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <div ref={heroSec.ref} style={{
            opacity:    heroSec.visible ? 1 : 0,
            transform:  heroSec.visible ? 'none' : 'translateY(20px)',
            transition: 'all 0.9s cubic-bezier(0.16,1,0.3,1)',
          }}>
            <div className="eyebrow">Our Story</div>
            <h1 className="section-title" style={{ fontSize: 'clamp(2.8rem, 6vw, 5rem)', marginBottom: '24px' }}>
              Born from <em>passion</em>,<br />crafted for <em>Silchar</em>
            </h1>
            <div className="gold-divider" />
            <p className="body-lg" style={{ maxWidth: '640px', margin: '0 auto', color: 'var(--text-secondary)' }}>
              {restaurantInfo.description}
            </p>
          </div>
        </div>
      </div>

      {/* ═══ STORY NARRATIVE ════════════════════════════════════════════════ */}
      <section style={{ padding: '100px 0' }}>
        <div className="container">
          <div
            ref={storySec.ref}
            style={{
              display:             'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap:                 '80px',
              alignItems:          'center',
              opacity:             storySec.visible ? 1 : 0,
              transform:           storySec.visible ? 'none' : 'translateY(32px)',
              transition:          'all 0.9s cubic-bezier(0.16,1,0.3,1)',
            }}
          >
            {/* Visual Panel */}
            <div style={{ position: 'relative' }}>
              <div style={{
                width:        '100%',
                aspectRatio:  '3/4',
                background:   'linear-gradient(160deg, #0e0a04, #241806, #0e0a04)',
                border:       '1px solid var(--dark-border)',
                position:     'relative',
                overflow:     'hidden',
                display:      'flex',
                alignItems:   'center',
                justifyContent: 'center',
              }}>
                <div style={{
                  position:   'absolute',
                  inset:      0,
                  background: 'radial-gradient(ellipse at 40% 40%, rgba(197,168,92,0.1) 0%, transparent 60%)',
                }} />
                <div style={{ textAlign: 'center', position: 'relative', zIndex: 1 }}>
                  <div style={{ fontSize: '5rem', marginBottom: '16px' }}>🥤</div>
                  <div style={{
                    fontFamily:    'var(--font-display)',
                    fontSize:      '1.4rem',
                    color:         'var(--cream)',
                    fontStyle:     'italic',
                  }}>
                    Est. {restaurantInfo.founded}
                  </div>
                  <div style={{
                    fontSize:      '0.7rem',
                    letterSpacing: '0.25em',
                    textTransform: 'uppercase',
                    color:         'var(--gold)',
                    marginTop:     '8px',
                  }}>
                    Silchar, Assam
                  </div>
                </div>
              </div>

              {/* Floating quote card */}
              <div style={{
                position:   'absolute',
                bottom:     '-28px',
                right:      '-28px',
                background: 'var(--dark-card-2)',
                border:     '1px solid rgba(197,168,92,0.25)',
                padding:    '24px',
                maxWidth:   '240px',
              }}>
                <div style={{ display: 'flex', gap: '3px', marginBottom: '10px' }}>
                  {[1,2,3,4,5].map(n => <Star key={n} size={12} fill="var(--gold)" color="var(--gold)" />)}
                </div>
                <p style={{
                  fontFamily: 'var(--font-display)',
                  fontSize:   '0.9rem',
                  fontStyle:  'italic',
                  color:      'var(--cream)',
                  lineHeight: 1.5,
                }}>
                  &ldquo;Silchar&rsquo;s finest shakes experience&rdquo;
                </p>
                <p style={{
                  marginTop:     '10px',
                  fontSize:      '0.62rem',
                  color:         'var(--text-secondary)',
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                }}>
                  — Silchar Food Awards
                </p>
              </div>
            </div>

            {/* Story Text */}
            <div>
              <div className="eyebrow">How It Began</div>
              <h2 className="section-title" style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.8rem)' }}>
                Where every sip tells a <em>story</em>
              </h2>
              <div className="gold-divider-left" />

              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', color: 'var(--text-secondary)', lineHeight: 1.85, fontSize: '0.95rem' }}>
                <p>
                  The London Shakes was born in 2021 from a single, unwavering belief — that Silchar deserved a premium food experience that didn&rsquo;t compromise on taste, quality, or ambiance.
                </p>
                <p>
                  Nestled on the 3rd floor of a building near Goldighi Mall, Premtala, our space was designed to feel like an escape — where the chaos of the city gives way to the warmth of beautifully crafted shakes, waffles, and meals.
                </p>
                <p>
                  From a small menu of signature thick shakes, we have grown into a full dining destination, serving over 50 carefully curated items that span milkshakes, burgers, pastas, waffles, and quick bites — all prepared with premium ingredients and a deep love for flavour.
                </p>
              </div>

              <div style={{ marginTop: '40px', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                <Link href="/menu" className="btn-gold"><span>Explore Our Menu</span></Link>
                <Link href="/reservations" className="btn-outline">Reserve a Table</Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ STATS ══════════════════════════════════════════════════════════ */}
      <section style={{ background: 'var(--dark-surface)', borderTop: '1px solid var(--dark-border)', borderBottom: '1px solid var(--dark-border)', padding: '80px 0' }}>
        <div className="container">
          <div
            ref={statsSec.ref}
            style={{
              display:             'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
              gap:                 '40px',
              opacity:             statsSec.visible ? 1 : 0,
              transform:           statsSec.visible ? 'none' : 'translateY(24px)',
              transition:          'all 0.8s cubic-bezier(0.16,1,0.3,1)',
            }}
          >
            {stats.map((s, i) => (
              <div key={i} style={{ textAlign: 'center' }}>
                <div style={{ color: 'var(--gold)', opacity: 0.6, display: 'flex', justifyContent: 'center', marginBottom: '12px' }}>
                  {s.icon}
                </div>
                <div style={{
                  fontFamily: 'var(--font-display)',
                  fontSize:   'clamp(2rem, 4vw, 3rem)',
                  color:      'var(--gold)',
                  lineHeight: 1,
                }}>
                  <Counter target={s.value} suffix={s.suffix} />
                </div>
                <div style={{
                  marginTop:     '8px',
                  fontSize:      '0.7rem',
                  letterSpacing: '0.15em',
                  textTransform: 'uppercase',
                  color:         'var(--text-secondary)',
                }}>
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ CORE VALUES ════════════════════════════════════════════════════ */}
      <section style={{ padding: '100px 0' }}>
        <div className="container">
          <div
            ref={valuesSec.ref}
            style={{
              opacity:    valuesSec.visible ? 1 : 0,
              transform:  valuesSec.visible ? 'none' : 'translateY(28px)',
              transition: 'all 0.8s cubic-bezier(0.16,1,0.3,1)',
            }}
          >
            <div style={{ textAlign: 'center', marginBottom: '60px' }}>
              <div className="eyebrow">What We Stand For</div>
              <h2 className="section-title">Our <em>values</em></h2>
              <div className="gold-divider" />
            </div>

            <div style={{
              display:             'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap:                 '24px',
            }}>
              {values.map((v, i) => (
                <div
                  key={i}
                  style={{
                    background:  'var(--dark-card)',
                    border:      '1px solid var(--dark-border)',
                    padding:     '36px 28px',
                    transition:  'border-color 0.3s ease',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(197,168,92,0.35)')}
                  onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--dark-border)')}
                >
                  <div style={{
                    fontFamily:    'var(--font-display)',
                    fontSize:      '1.5rem',
                    color:         'var(--gold)',
                    marginBottom:  '16px',
                    opacity:       0.7,
                  }}>
                    {v.icon}
                  </div>
                  <h3 style={{
                    fontFamily:    'var(--font-sans)',
                    fontSize:      '0.82rem',
                    fontWeight:    700,
                    letterSpacing: '0.12em',
                    textTransform: 'uppercase',
                    color:         'var(--cream)',
                    marginBottom:  '14px',
                  }}>
                    {v.title}
                  </h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', lineHeight: 1.75 }}>
                    {v.body}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══ MEET THE TEAM / CHEF PREVIEW ═══════════════════════════════════ */}
      <section style={{ background: 'var(--dark-surface)', borderTop: '1px solid var(--dark-border)', padding: '100px 0' }}>
        <div className="container">
          <div
            ref={teamSec.ref}
            style={{
              opacity:    teamSec.visible ? 1 : 0,
              transform:  teamSec.visible ? 'none' : 'translateY(28px)',
              transition: 'all 0.8s cubic-bezier(0.16,1,0.3,1)',
            }}
          >
            <div style={{ textAlign: 'center', marginBottom: '60px' }}>
              <div className="eyebrow">Behind The Magic</div>
              <h2 className="section-title">Meet our <em>creator</em></h2>
              <div className="gold-divider" />
            </div>

            <div style={{
              display:    'flex',
              alignItems: 'center',
              gap:        '60px',
              flexWrap:   'wrap',
              justifyContent: 'center',
            }}>
              {/* Portrait */}
              <div style={{
                width:          '280px',
                height:         '320px',
                background:     'linear-gradient(135deg, #161616, #2d1e11, #0c0805)',
                border:         '1px solid rgba(197,168,92,0.2)',
                display:        'flex',
                flexDirection:  'column',
                alignItems:     'center',
                justifyContent: 'center',
                gap:            '12px',
                flexShrink:     0,
              }}>
                <div style={{ fontSize: '3.5rem' }}>👨‍🍳</div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', color: 'var(--cream)' }}>
                  {chef.name}
                </div>
                <div style={{ fontSize: '0.65rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--gold)' }}>
                  {chef.title}
                </div>
              </div>

              {/* Bio */}
              <div style={{ maxWidth: '540px' }}>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.85, marginBottom: '24px' }}>
                  {chef.bio}
                </p>
                <blockquote style={{
                  borderLeft:  '2px solid var(--gold)',
                  paddingLeft: '20px',
                  fontFamily:  'var(--font-display)',
                  fontSize:    '1rem',
                  fontStyle:   'italic',
                  color:       'var(--cream)',
                  lineHeight:  1.6,
                  marginBottom:'28px',
                }}>
                  {chef.philosophy}
                </blockquote>
                <Link href="/chef" className="btn-outline" style={{ display: 'inline-flex' }}>
                  Full Chef Profile →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ AWARDS & RECOGNITION ════════════════════════════════════════════ */}
      <section style={{ padding: '100px 0' }}>
        <div className="container">
          <div
            ref={awardsSec.ref}
            style={{
              opacity:    awardsSec.visible ? 1 : 0,
              transform:  awardsSec.visible ? 'none' : 'translateY(28px)',
              transition: 'all 0.8s cubic-bezier(0.16,1,0.3,1)',
            }}
          >
            <div style={{ textAlign: 'center', marginBottom: '60px' }}>
              <div className="eyebrow">Recognition</div>
              <h2 className="section-title">Awards &amp; <em>accolades</em></h2>
              <div className="gold-divider" />
            </div>

            <div style={{
              display:             'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              gap:                 '24px',
            }}>
              {restaurantInfo.awards.map((award, i) => (
                <div
                  key={i}
                  style={{
                    background: 'var(--dark-card)',
                    border:     '1px solid var(--dark-border)',
                    padding:    '32px 28px',
                    display:    'flex',
                    gap:        '20px',
                    alignItems: 'flex-start',
                  }}
                >
                  <div style={{ color: 'var(--gold)', flexShrink: 0, opacity: 0.7 }}>
                    <Award size={24} />
                  </div>
                  <div>
                    <div style={{
                      fontSize:      '0.65rem',
                      letterSpacing: '0.15em',
                      textTransform: 'uppercase',
                      color:         'var(--gold)',
                      marginBottom:  '6px',
                    }}>
                      {award.year}
                    </div>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', color: 'var(--cream)', marginBottom: '6px' }}>
                      {award.award}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                      {award.org}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══ VISIT US ════════════════════════════════════════════════════════ */}
      <section style={{
        background:  'var(--dark-surface)',
        borderTop:   '1px solid var(--dark-border)',
        borderBottom:'1px solid var(--dark-border)',
        padding:     '80px 0',
      }}>
        <div className="container">
          <div
            style={{
              display:             'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap:                 '40px',
            }}
          >
            {[
              {
                icon: <MapPin size={22} />,
                label: 'Location',
                lines: [restaurantInfo.location.address, `${restaurantInfo.location.city} — ${restaurantInfo.location.postcode}`],
              },
              {
                icon: <Clock size={22} />,
                label: 'Hours',
                lines: ['Monday — Sunday', '11:00 AM — 10:00 PM'],
              },
              {
                icon: <Phone size={22} />,
                label: 'Call Us',
                lines: [restaurantInfo.contact.phone],
              },
              {
                icon: <Mail size={22} />,
                label: 'Email',
                lines: [restaurantInfo.contact.email],
              },
            ].map((item, i) => (
              <div key={i} style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                <div style={{ color: 'var(--gold)', opacity: 0.7, marginTop: '2px', flexShrink: 0 }}>
                  {item.icon}
                </div>
                <div>
                  <div style={{
                    fontSize:      '0.65rem',
                    letterSpacing: '0.15em',
                    textTransform: 'uppercase',
                    color:         'var(--gold)',
                    marginBottom:  '6px',
                  }}>
                    {item.label}
                  </div>
                  {item.lines.map((line, j) => (
                    <div key={j} style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', lineHeight: 1.6 }}>
                      {line}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ CTA ═════════════════════════════════════════════════════════════ */}
      <section style={{ padding: '100px 0', textAlign: 'center' }}>
        <div className="container">
          <div
            ref={ctaSec.ref}
            style={{
              opacity:    ctaSec.visible ? 1 : 0,
              transform:  ctaSec.visible ? 'none' : 'translateY(24px)',
              transition: 'all 0.8s cubic-bezier(0.16,1,0.3,1)',
            }}
          >
            <div className="eyebrow">Come Experience Us</div>
            <h2 className="section-title">
              Your table <em>awaits</em>
            </h2>
            <div className="gold-divider" />
            <p className="body-lg" style={{ color: 'var(--text-secondary)', maxWidth: '520px', margin: '0 auto 40px' }}>
              Whether it&rsquo;s a quick bite, a family feast, or a special celebration — The London Shakes is ready for you.
            </p>
            <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link href="/reservations" className="btn-gold"><span>Reserve a Table</span></Link>
              <Link href="/menu" className="btn-outline">View Full Menu</Link>
              <Link href="/contact" className="btn-ghost" style={{ color: 'var(--gold)' }}>Contact Us</Link>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
