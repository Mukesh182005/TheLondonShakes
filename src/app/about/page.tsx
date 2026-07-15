'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useCMSStore, useIsMounted } from '@/store/restaurantStore';
import { useIsMobile } from '@/hooks/useIsMobile';
import { 
  restaurantInfo as initialRestaurantInfo,
  chef as initialChef 
} from '@/data/restaurantData';
import { MapPin, Clock, Phone, Mail, Star, Award, Heart, Users } from 'lucide-react';

// ── Section Reveal Hook ──────────────────────────────────────────────────────
function useReveal(threshold = 0.15) {
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const thresholdRef = useRef(threshold);

  const handleIntersect = useCallback(([entry]: IntersectionObserverEntry[], observer: IntersectionObserver) => {
    if (entry.isIntersecting) {
      setVisible(true);
      observer.disconnect();
    }
  }, []);

  useEffect(() => {
    const obs = new IntersectionObserver(handleIntersect, { threshold: thresholdRef.current });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [handleIntersect]);

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

// ── Subcomponents ──────────────────────────────────────────────────────────

function AboutHero({ description }: { description: string }) {
  const heroSec = useReveal(0.1);
  return (
    <div
      style={{
        position:       'relative',
        background:     'linear-gradient(180deg, var(--void) 0%, var(--black) 100%)',
        padding:        '100px 0 80px',
        textAlign:      'center',
        borderBottom:   '1px solid rgba(197, 168, 92, 0.12)',
        overflow:       'hidden',
      }}
    >
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
          transition: 'opacity 0.9s cubic-bezier(0.16,1,0.3,1), transform 0.9s cubic-bezier(0.16,1,0.3,1)',
        }}>
          <div className="eyebrow">Our Story</div>
          <h1 className="section-title" style={{ fontSize: 'clamp(2.8rem, 6vw, 5rem)', marginBottom: '24px' }}>
            Born from <em>passion</em>,<br />crafted for <em>Silchar</em>
          </h1>
          <div className="gold-divider" />
          <p className="body-lg" style={{ maxWidth: '640px', margin: '0 auto', color: 'var(--text-secondary)' }}>
            {description}
          </p>
        </div>
      </div>
    </div>
  );
}


function AboutStory({ founded, image }: { founded: string; image?: string | null }) {
  const storySec = useReveal();
  const isMobile = useIsMobile();
  return (
    <section style={{ padding: '100px 0' }}>
      <div className="container">
        <div
          ref={storySec.ref}
          style={{
            display:             'grid',
            gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(300px, 1fr))',
            gap:                 isMobile ? '40px' : '80px',
            alignItems:          'center',
            opacity:             storySec.visible ? 1 : 0,
            transform:           storySec.visible ? 'none' : 'translateY(32px)',
            transition:          'opacity 0.9s cubic-bezier(0.16,1,0.3,1), transform 0.9s cubic-bezier(0.16,1,0.3,1)',
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
              {image ? (
                <Image
                  src={image}
                  alt="The London Shakes Story"
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  style={{
                    objectFit: 'cover',
                    opacity: 0.85,
                  }}
                  unoptimized={image.startsWith('data:') || image.startsWith('blob:')}
                />
              ) : null}
              <div style={{ textAlign: 'center', position: 'relative', zIndex: 1, padding: '20px', background: image ? 'rgba(0,0,0,0.5)' : 'transparent', width: '100%' }}>
                {!image && <div style={{ fontSize: '5rem', marginBottom: '16px' }}>🥤</div>}
                <div style={{
                  fontFamily:    'var(--font-display)',
                  fontSize:      '1.4rem',
                  color:         'var(--cream)',
                  fontStyle:     'italic',
                  textShadow:    image ? '0 2px 4px rgba(0,0,0,0.8)' : 'none',
                }}>
                  Est. {founded}
                </div>
                <div style={{
                  fontSize:      '0.7rem',
                  letterSpacing: '0.25em',
                  textTransform: 'uppercase',
                  color:         'var(--gold)',
                  marginTop:     '8px',
                  textShadow:    image ? '0 1px 2px rgba(0,0,0,0.8)' : 'none',
                }}>
                  Silchar, Assam
                </div>
              </div>
            </div>
            {/* Floating quote card */}
            <div style={{
              position:   isMobile ? 'relative' : 'absolute',
              bottom:     isMobile ? '0' : '-28px',
              right:      isMobile ? '0' : '-28px',
              background: 'var(--dark-card-2)',
              border:     '1px solid rgba(197,168,92,0.25)',
              padding:    '24px',
              maxWidth:   isMobile ? '100%' : '240px',
              marginTop:  isMobile ? '16px' : '0',
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
  );
}

function AboutStats() {
  const statsSec = useReveal();
  return (
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
            transition:          'opacity 0.8s cubic-bezier(0.16,1,0.3,1), transform 0.8s cubic-bezier(0.16,1,0.3,1)',
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
  );
}

function AboutValues() {
  const valuesSec = useReveal();
  return (
    <section style={{ padding: '100px 0' }}>
      <div className="container">
        <div
          ref={valuesSec.ref}
          style={{
            opacity:    valuesSec.visible ? 1 : 0,
            transform:  valuesSec.visible ? 'none' : 'translateY(28px)',
            transition: 'opacity 0.8s cubic-bezier(0.16,1,0.3,1), transform 0.8s cubic-bezier(0.16,1,0.3,1)',
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
  );
}

function AboutChef({ chef }: { chef: { name: string; title: string; bio: string; philosophy: string; image?: string | null } }) {
  const teamSec = useReveal();
  return (
    <section style={{ background: 'var(--dark-surface)', borderTop: '1px solid var(--dark-border)', padding: '100px 0' }}>
      <div className="container">
        <div
          ref={teamSec.ref}
          style={{
            opacity:    teamSec.visible ? 1 : 0,
            transform:  teamSec.visible ? 'none' : 'translateY(28px)',
            transition: 'opacity 0.8s cubic-bezier(0.16,1,0.3,1), transform 0.8s cubic-bezier(0.16,1,0.3,1)',
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
              position:       'relative',
              overflow:       'hidden',
            }}>
              {chef.image ? (
                <>
                  <Image
                    src={chef.image}
                    alt={chef.name}
                    fill
                    sizes="(max-width: 768px) 100vw, 30vw"
                    style={{
                      objectFit: 'cover',
                    }}
                    unoptimized={chef.image.startsWith('data:') || chef.image.startsWith('blob:')}
                  />
                  <div style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'linear-gradient(180deg, transparent 60%, rgba(0,0,0,0.85) 100%)',
                    zIndex: 1,
                  }} />
                  <div style={{ position: 'absolute', bottom: '16px', left: '16px', right: '16px', zIndex: 2, textAlign: 'center' }}>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', color: 'var(--cream)', textShadow: '0 2px 4px rgba(0,0,0,0.8)' }}>
                      {chef.name}
                    </div>
                    <div style={{ fontSize: '0.65rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--gold)', marginTop: '4px', textShadow: '0 1px 2px rgba(0,0,0,0.8)' }}>
                      {chef.title}
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div style={{ fontSize: '3.5rem' }}>👨‍🍳</div>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', color: 'var(--cream)' }}>
                    {chef.name}
                  </div>
                  <div style={{ fontSize: '0.65rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--gold)' }}>
                    {chef.title}
                  </div>
                </>
              )}
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
  );
}

function AboutAwards({ awards }: { awards: Array<{ year: string; award: string; org: string }> }) {
  const awardsSec = useReveal();
  return (
    <section style={{ padding: '100px 0' }}>
      <div className="container">
        <div
          ref={awardsSec.ref}
          style={{
            opacity:    awardsSec.visible ? 1 : 0,
            transform:  awardsSec.visible ? 'none' : 'translateY(28px)',
            transition: 'opacity 0.8s cubic-bezier(0.16,1,0.3,1), transform 0.8s cubic-bezier(0.16,1,0.3,1)',
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
            {awards.map((award, i) => (
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
  );
}

function AboutVisitUs({ location, contact }: {
  location: { address: string; city: string; postcode: string; googleMapsUrl?: string; fullAddress?: string };
  contact: { phone: string; email: string };
}) {
  return (
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
              lines: [location.address, `${location.city} — ${location.postcode}`],
              href: location.googleMapsUrl || 'https://maps.app.goo.gl/1JdFt5kDFpdefg3j9',
            },
            {
              icon: <Clock size={22} />,
              label: 'Hours',
              lines: ['Monday — Sunday', '11:00 AM — 10:00 PM'],
            },
            {
              icon: <Phone size={22} />,
              label: 'Call Us',
              lines: [contact.phone],
              href: `tel:${contact.phone}`,
            },
            {
              icon: <Mail size={22} />,
              label: 'Email',
              lines: [contact.email],
              href: `mailto:${contact.email}`,
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
                    {item.href ? (
                      <a href={item.href} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--text-secondary)', textDecoration: 'none', transition: 'color 0.2s ease' }}
                        onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--gold)')}
                        onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-secondary)')}>
                        {line}
                      </a>
                    ) : (
                      line
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function AboutCTA() {
  const ctaSec = useReveal();
  return (
    <section style={{ padding: '100px 0', textAlign: 'center' }}>
      <div className="container">
        <div
          ref={ctaSec.ref}
          style={{
            opacity:    ctaSec.visible ? 1 : 0,
            transform:  ctaSec.visible ? 'none' : 'translateY(24px)',
            transition: 'opacity 0.8s cubic-bezier(0.16,1,0.3,1), transform 0.8s cubic-bezier(0.16,1,0.3,1)',
          }}
        >
          <div className="eyebrow">Come Experience Us</div>
          <h2 className="section-title">
            Your table <em style={{ color: '#E8102A', fontStyle: 'italic', textShadow: '0 0 15px rgba(232,16,42,0.25)' }}>awaits</em>
          </h2>
          <div className="gold-divider" style={{ background: '#E8102A' }} />
          <p className="body-lg" style={{ color: 'var(--text-secondary)', maxWidth: '520px', margin: '0 auto 40px' }}>
            Whether it&rsquo;s a quick bite, a family feast, or a special celebration — The London Shakes is ready for you.
          </p>
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link 
              href="/reservations" 
              className="btn-red"
              style={{
                background: 'linear-gradient(135deg, #FF1E39, #E8102A 55%, #B50016)',
                borderColor: '#E8102A',
                boxShadow: '0 8px 28px rgba(232,16,42,0.3)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = '0 18px 44px rgba(232,16,42,0.45)';
                e.currentTarget.style.borderColor = '#FF1E39';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = '0 8px 28px rgba(232,16,42,0.3)';
                e.currentTarget.style.borderColor = '#E8102A';
              }}
            >
              <span>Reserve a Table</span>
            </Link>
            <Link 
              href="/menu" 
              className="btn-outline"
              style={{
                color: '#E8102A',
                borderColor: 'rgba(232,16,42,0.4)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = 'var(--black)';
                e.currentTarget.style.borderColor = '#E8102A';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = '#E8102A';
                e.currentTarget.style.borderColor = 'rgba(232,16,42,0.4)';
              }}
            >
              <span>View Full Menu</span>
            </Link>
            <Link href="/contact" className="btn-ghost" style={{ color: '#E8102A' }}>Contact Us</Link>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function AboutPage() {
  const storeRestaurantInfo = useCMSStore((s) => s.restaurantInfo);
  const storeChef           = useCMSStore((s) => s.chef);

  const isMounted = useIsMounted();

  const restaurantInfo = isMounted ? storeRestaurantInfo : initialRestaurantInfo;
  const chef           = isMounted ? storeChef : initialChef;

  return (
    <div className="page-wrapper" style={{ background: 'var(--black)', color: 'var(--text-primary)' }}>
      <AboutHero description={restaurantInfo.description} />
      <AboutStory founded={restaurantInfo.founded} image={restaurantInfo.aboutImage} />
      <AboutStats />
      <AboutValues />
      <AboutChef chef={chef} />
      <AboutVisitUs location={restaurantInfo.location} contact={restaurantInfo.contact} />
      <AboutCTA />
    </div>
  );
}
