'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRestaurantStore, useCMSStore } from '@/store/restaurantStore';
import { 
  menuItems as initialMenuItems,
  restaurantInfo as initialRestaurantInfo,
  chef as initialChef,
  upcomingEvents as initialUpcomingEvents 
} from '@/data/restaurantData';
import { ArrowRight, Star, Clock, MapPin, ChevronDown } from 'lucide-react';

// ── Animated Number ──
function AnimatedNumber({ target, prefix = '' }: { target: number; prefix?: string }) {
  const [val, setVal] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
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
      },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target]);
  return <span ref={ref}>{prefix}{val.toLocaleString()}</span>;
}

// ── Section Observer ──
function useReveal() {
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } }, { threshold: 0.15 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return { ref, visible };
}

export default function HomePage() {
  const storeRestaurantInfo = useCMSStore((s) => s.restaurantInfo);
  const storeUpcomingEvents = useCMSStore((s) => s.upcomingEvents);
  const storeChef           = useCMSStore((s) => s.chef);
  const storeMenuItems      = useCMSStore((s) => s.menuItems);
  const addToCart           = useRestaurantStore((s) => s.addToCart);

  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const restaurantInfo = isMounted ? storeRestaurantInfo : initialRestaurantInfo;
  const upcomingEvents = isMounted ? storeUpcomingEvents : initialUpcomingEvents;
  const chef           = isMounted ? storeChef : initialChef;
  const menuItems      = isMounted ? storeMenuItems : initialMenuItems;

  const featured = menuItems.filter((m) => m.badge === 'Bestseller' || m.badge === 'Must Try').slice(0, 4);

  const stats = [
    { val: 2021, label: 'Est. Year' },
    { val: 5000, label: 'Happy Guests', prefix: '' },
    { val: 20,   label: 'Signature Drinks' },
    { val: 4.9,  label: 'Avg Rating' },
  ];

  const hero        = useReveal();
  const featSection = useReveal();
  const aboutSec    = useReveal();
  const eventsSec   = useReveal();

  return (
    <main>
      {/* ═══ HERO ═══════════════════════════════════════════════ */}
      <section style={{
        position:   'relative',
        minHeight:  '100vh',
        display:    'flex',
        flexDirection:'column',
        alignItems: 'center',
        justifyContent:'center',
        overflow:   'hidden',
        background: 'var(--black)',
      }}>
        {/* Ambient background */}
        <div style={{
          position:   'absolute',
          inset:      0,
          background: `
            radial-gradient(ellipse 70% 50% at 30% 60%, rgba(197,168,92,0.06) 0%, transparent 60%),
            radial-gradient(ellipse 60% 40% at 70% 30%, rgba(197,168,92,0.04) 0%, transparent 60%),
            var(--black)
          `,
          pointerEvents:'none',
        }} />

        {/* Decorative vertical lines */}
        {[15, 35, 65, 85].map((x) => (
          <div key={x} style={{
            position:  'absolute',
            top:       0,
            bottom:    0,
            left:      `${x}%`,
            width:     '1px',
            background:`linear-gradient(180deg, transparent, rgba(197,168,92,0.06) 30%, rgba(197,168,92,0.06) 70%, transparent)`,
            pointerEvents:'none',
          }} />
        ))}

        <div
          ref={hero.ref}
          className="container"
          style={{
            position:  'relative',
            zIndex:    2,
            textAlign: 'center',
            padding:   '0 var(--container-px)',
            opacity:   hero.visible ? 1 : 0,
            transform: hero.visible ? 'none' : 'translateY(32px)',
            transition:'all 0.9s cubic-bezier(0.16,1,0.3,1)',
          }}
        >
          {/* Eyebrow */}
          <div style={{
            display:       'inline-flex',
            alignItems:    'center',
            gap:           '14px',
            fontFamily:    'var(--font-sans)',
            fontSize:      '0.58rem',
            fontWeight:    700,
            letterSpacing: '0.4em',
            textTransform: 'uppercase',
            color:         'var(--gold)',
            marginBottom:  '32px',
            opacity:       0.85,
          }}>
            <span style={{ display:'block', width:'32px', height:'1px', background:'var(--gold)', opacity:0.5 }} />
            Silchar · Since {restaurantInfo.founded}
            <span style={{ display:'block', width:'32px', height:'1px', background:'var(--gold)', opacity:0.5 }} />
          </div>

          {/* Main Heading */}
          <h1 style={{
            fontFamily:    'var(--font-display)',
            fontSize:      'clamp(3.8rem, 10vw, 9rem)',
            fontWeight:    300,
            color:         'var(--cream)',
            lineHeight:    0.92,
            letterSpacing: '-0.025em',
            marginBottom:  '24px',
          }}>
            The London<br />
            <em style={{ fontStyle:'italic', color:'var(--gold)', fontWeight:300 }}>Shakes</em>
          </h1>

          {/* Tagline */}
          <p style={{
            fontFamily:    'var(--font-serif)',
            fontSize:      'clamp(1.0rem, 2vw, 1.3rem)',
            fontStyle:     'italic',
            color:         'var(--text-secondary)',
            maxWidth:      '500px',
            margin:        '0 auto 48px',
            lineHeight:    1.6,
          }}>
            {restaurantInfo.tagline}
          </p>

          {/* CTAs */}
          <div style={{ display:'flex', gap:'16px', justifyContent:'center', flexWrap:'wrap' }}>
            <Link href="/reservations" className="btn-gold">
              <span>Reserve a Table</span>
              <ArrowRight size={13} style={{ position:'relative', zIndex:1 }} />
            </Link>
            <Link href="/menu" className="btn-outline">
              Explore Menu
            </Link>
          </div>
        </div>

        {/* Scroll indicator */}
        <div style={{
          position:      'absolute',
          bottom:        '40px',
          left:          '50%',
          transform:     'translateX(-50%)',
          display:       'flex',
          flexDirection: 'column',
          alignItems:    'center',
          gap:           '8px',
          opacity:       0.35,
          animation:     'float 2.5s ease-in-out infinite',
        }}>
          <p style={{ fontFamily:'var(--font-sans)', fontSize:'0.55rem', letterSpacing:'0.3em', textTransform:'uppercase', color:'var(--cream)' }}>Scroll</p>
          <ChevronDown size={14} color="var(--cream)" />
        </div>
      </section>

      {/* ═══ STATS STRIP ═════════════════════════════════════════ */}
      <section style={{
        background:   'var(--dark-surface)',
        borderTop:    '1px solid var(--dark-border)',
        borderBottom: '1px solid var(--dark-border)',
        padding:      '40px 0',
      }}>
        <div className="container">
          <div style={{ display:'grid', gridTemplateColumns:'repeat(4, 1fr)', gap:'0' }}>
            {stats.map((s, i) => (
              <div key={i} style={{
                textAlign:   'center',
                padding:     '20px 24px',
                borderRight: i < 3 ? '1px solid var(--dark-border)' : 'none',
              }}>
                <div style={{
                  fontFamily:    'var(--font-display)',
                  fontSize:      'clamp(2rem, 3.5vw, 3rem)',
                  fontWeight:    300,
                  color:         'var(--gold)',
                  lineHeight:    1,
                  marginBottom:  '6px',
                }}>
                  <AnimatedNumber target={s.val} />
                  {i === 3 && '/5'}
                </div>
                <p style={{ fontFamily:'var(--font-sans)', fontSize:'0.62rem', fontWeight:600, letterSpacing:'0.2em', textTransform:'uppercase', color:'var(--text-secondary)' }}>
                  {s.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ FEATURED DISHES ══════════════════════════════════════ */}
      <section
        ref={featSection.ref}
        style={{
          padding:    '120px 0 100px',
          background: 'var(--black)',
          opacity:    featSection.visible ? 1 : 0,
          transform:  featSection.visible ? 'none' : 'translateY(32px)',
          transition: 'all 0.8s cubic-bezier(0.16,1,0.3,1) 0.1s',
        }}
      >
        <div className="container">
          {/* Header */}
          <div style={{ textAlign:'center', marginBottom:'72px' }}>
            <div className="eyebrow" style={{ justifyContent:'center' }}>Signature Selection</div>
            <h2 className="section-title" style={{ marginBottom:'16px' }}>
              Crafted with <em>Precision</em>
            </h2>
            <p className="body-lg" style={{ maxWidth:'500px', margin:'0 auto' }}>
              Every shake, waffle and bite is made from scratch — layers of flavor designed to surprise.
            </p>
          </div>

          {/* Grid */}
          <div style={{
            display:        'flex',
            flexWrap:       'wrap',
            gap:            '24px',
            justifyContent: 'center',
          }}>
            {featured.map((item) => (
              <div key={item.id} style={{
                flex:         '1 1 260px',
                maxWidth:     '300px',
                background:   'var(--dark-card)',
                border:       '1px solid var(--dark-border)',
                padding:      '0',
                display:      'flex',
                flexDirection:'column',
                overflow:     'hidden',
                transition:   'all 0.4s cubic-bezier(0.16,1,0.3,1)',
              }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = 'var(--dark-card-2)'; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'var(--dark-card)'; }}
              >
                {/* Image Area */}
                <div className={`food-photo ${item.gradient}`} style={{ height:'200px', position:'relative' }}>
                  {item.badge && (
                    <span className="badge-gold" style={{ position:'absolute', top:'16px', left:'16px', fontSize:'0.52rem' }}>
                      {item.badge}
                    </span>
                  )}
                  {/* Category label */}
                  <span style={{
                    position:      'absolute',
                    bottom:        '16px',
                    right:         '16px',
                    fontFamily:    'var(--font-sans)',
                    fontSize:      '0.55rem',
                    fontWeight:    700,
                    letterSpacing: '0.2em',
                    textTransform: 'uppercase',
                    color:         'rgba(197,168,92,0.6)',
                  }}>
                    {item.category}
                  </span>
                </div>

                {/* Content */}
                <div style={{ padding:'28px 24px', display:'flex', flexDirection:'column', flex:1 }}>
                  <h3 style={{
                    fontFamily:    'var(--font-display)',
                    fontSize:      '1.35rem',
                    fontWeight:    400,
                    color:         'var(--cream)',
                    marginBottom:  '8px',
                  }}>
                    {item.name}
                  </h3>
                  <p style={{ fontSize:'0.8125rem', color:'var(--text-secondary)', lineHeight:1.6, flex:1, marginBottom:'20px' }}>
                    {item.description}
                  </p>

                  {/* Dietary */}
                  {item.dietary.length > 0 && (
                    <div style={{ display:'flex', gap:'4px', marginBottom:'20px', flexWrap:'wrap' }}>
                      {item.dietary.map((tag) => (
                        <span key={tag} className={`dietary-tag ${tag}`}>{tag.toUpperCase()}</span>
                      ))}
                    </div>
                  )}

                  <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                    <span style={{
                      fontFamily:    'var(--font-display)',
                      fontSize:      '1.5rem',
                      fontWeight:    400,
                      color:         'var(--gold)',
                    }}>
                      ₹{item.price}
                    </span>
                    <button
                      onClick={() => addToCart({ id: item.id, name: item.name, price: item.price, gradient: item.gradient })}
                      className="btn-ghost"
                      style={{ fontSize:'0.62rem' }}
                    >
                      Add to Order
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div style={{ textAlign:'center', marginTop:'48px' }}>
            <Link href="/menu" className="btn-outline">
              View Full Menu
            </Link>
          </div>
        </div>
      </section>

      {/* ═══ ABOUT / STORY ════════════════════════════════════════ */}
      <section
        ref={aboutSec.ref}
        style={{
          padding:    '0 0 120px',
          opacity:    aboutSec.visible ? 1 : 0,
          transform:  aboutSec.visible ? 'none' : 'translateY(24px)',
          transition: 'all 0.8s cubic-bezier(0.16,1,0.3,1) 0.15s',
        }}
      >
        <div className="container">
          <div style={{
            display:  'grid',
            gridTemplateColumns: '1fr 1fr',
            gap:      '80px',
            alignItems:'center',
          }} className="lg:grid-cols-2 grid-cols-1">

            {/* Visuals */}
            <div style={{ position:'relative' }}>
              <div style={{
                width:    '100%',
                aspectRatio:'4/3',
                background:`linear-gradient(160deg, #0e0a04, #241806, #0e0a04)`,
                border:   '1px solid var(--dark-border)',
                position: 'relative',
                overflow: 'hidden',
              }}>
                <div style={{
                  position:   'absolute',
                  inset:      0,
                  background: `radial-gradient(ellipse at 40% 40%, rgba(197,168,92,0.08) 0%, transparent 60%)`,
                }} />
                <div style={{
                  position:      'absolute',
                  bottom:        '24px',
                  right:         '24px',
                  fontFamily:    'var(--font-display)',
                  fontSize:      '0.85rem',
                  fontStyle:     'italic',
                  color:         'rgba(197,168,92,0.5)',
                }}>
                  Est. {restaurantInfo.founded}
                </div>
              </div>
              {/* Floating accent card */}
              <div style={{
                position:      'absolute',
                bottom:        '-28px',
                left:          '-28px',
                background:    'var(--dark-card-2)',
                border:        '1px solid rgba(197,168,92,0.2)',
                padding:       '24px',
                maxWidth:      '220px',
              }}>
                <div style={{ display:'flex', gap:'3px', marginBottom:'8px' }}>
                  {[1,2,3,4,5].map((n) => <Star key={n} size={12} fill="var(--gold)" color="var(--gold)" />)}
                </div>
                <p style={{ fontFamily:'var(--font-display)', fontSize:'0.95rem', fontStyle:'italic', color:'var(--cream)', lineHeight:1.4 }}>
                  "Silchar's finest shakes experience"
                </p>
                <p style={{ marginTop:'8px', fontSize:'0.62rem', color:'var(--text-secondary)', letterSpacing:'0.1em', textTransform:'uppercase' }}>
                  — Silchar Food Awards
                </p>
              </div>
            </div>

            {/* Content */}
            <div>
              <div className="eyebrow">Our Story</div>
              <h2 className="section-title">
                Where every sip tells a <em>story</em>
              </h2>
              <div className="gold-divider-left" />
              <p className="body-lg" style={{ marginBottom:'20px' }}>
                {restaurantInfo.description}
              </p>
              <p className="body-sm" style={{ marginBottom:'40px' }}>
                From signature thick shakes to hand-crafted waffles, every item on our menu carries a story — born from passion and perfected through craft.
              </p>

              {/* Highlights */}
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'20px', marginBottom:'40px' }}>
                {[
                  { icon: <Clock size={16} />, label:'Open Daily', sub:'11:00 AM — 10:00 PM' },
                  { icon: <MapPin size={16} />, label:'Located At', sub:'Premtala, Silchar' },
                  { icon: <Star size={16} />, label:'Top Rated', sub:'4.9/5 on Google' },
                  { icon: <Star size={16} fill="var(--gold)" />, label:'Bestseller', sub:'Strawberry Monster' },
                ].map((item, i) => (
                  <div key={i} style={{
                    display:      'flex',
                    flexDirection:'column',
                    gap:          '4px',
                    padding:      '16px',
                    background:   'var(--dark-surface)',
                    border:       '1px solid var(--dark-border)',
                  }}>
                    <div style={{ color:'var(--gold)', opacity:0.7 }}>{item.icon}</div>
                    <p style={{ fontFamily:'var(--font-sans)', fontSize:'0.62rem', fontWeight:700, letterSpacing:'0.15em', textTransform:'uppercase', color:'var(--cream)', marginTop:'4px' }}>{item.label}</p>
                    <p style={{ fontSize:'0.78rem', color:'var(--text-secondary)' }}>{item.sub}</p>
                  </div>
                ))}
              </div>

              <div style={{ display:'flex', gap:'12px', flexWrap:'wrap' }}>
                <Link href="/about" className="btn-gold"><span>Our Full Story</span></Link>
                <Link href="/menu" className="btn-outline">See The Menu</Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ EVENTS ═══════════════════════════════════════════════ */}
      <section
        ref={eventsSec.ref}
        style={{
          padding:    '100px 0',
          background: 'var(--dark-surface)',
          borderTop:  '1px solid var(--dark-border)',
          opacity:    eventsSec.visible ? 1 : 0,
          transform:  eventsSec.visible ? 'none' : 'translateY(24px)',
          transition: 'all 0.8s cubic-bezier(0.16,1,0.3,1) 0.1s',
        }}
      >
        <div className="container">
          <div style={{ display:'flex', alignItems:'flex-end', justifyContent:'space-between', marginBottom:'56px', flexWrap:'wrap', gap:'20px' }}>
            <div>
              <div className="eyebrow">Upcoming</div>
              <h2 className="section-title" style={{ marginBottom:0 }}>
                Special <em>Events</em>
              </h2>
            </div>
            <Link href="/events" className="btn-ghost" style={{ color:'var(--gold)' }}>
              All Events <ArrowRight size={13} />
            </Link>
          </div>

          <div style={{
            display:        'flex',
            flexWrap:       'wrap',
            gap:            '24px',
            justifyContent: 'center',
          }}>
            {upcomingEvents.map((evt) => (
              <div key={evt.id} style={{
                flex:         '1 1 280px',
                maxWidth:     '380px',
                padding:      '40px 32px',
                background:   'var(--dark-card)',
                border:       '1px solid var(--dark-border)',
                display:      'flex',
                flexDirection:'column',
                gap:          '12px',
                cursor:       'pointer',
                transition:   'background 0.3s ease, border-color 0.3s ease',
              }}
                onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = 'var(--dark-card-2)')}
                onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = 'var(--dark-card)')}
              >
                <span style={{
                  fontFamily:    'var(--font-sans)',
                  fontSize:      '0.58rem',
                  fontWeight:    700,
                  letterSpacing: '0.22em',
                  textTransform: 'uppercase',
                  color:         'var(--gold)',
                  opacity:       0.75,
                }}>
                  {evt.date}
                </span>
                <h3 style={{
                  fontFamily:    'var(--font-display)',
                  fontSize:      '1.5rem',
                  fontWeight:    400,
                  color:         'var(--cream)',
                  lineHeight:    1.1,
                }}>
                  {evt.title}
                </h3>
                <p style={{ fontFamily:'var(--font-serif)', fontStyle:'italic', fontSize:'0.875rem', color:'var(--text-secondary)' }}>
                  {evt.subtitle}
                </p>
                <p style={{ fontSize:'0.8125rem', color:'var(--text-secondary)', lineHeight:1.6, flex:1 }}>
                  {evt.description}
                </p>
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginTop:'8px', paddingTop:'20px', borderTop:'1px solid var(--dark-border)' }}>
                  <span style={{ fontFamily:'var(--font-display)', fontSize:'1.1rem', color:'var(--gold)' }}>{evt.price}</span>
                  <span style={{ fontSize:'0.62rem', fontWeight:600, letterSpacing:'0.15em', textTransform:'uppercase', color:'var(--text-secondary)' }}>
                    {evt.time}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ CHEF ═════════════════════════════════════════════════ */}
      <section style={{
        padding:    '100px 0',
        background: 'var(--black)',
        borderTop:  '1px solid var(--dark-border)',
      }}>
        <div className="container" style={{ textAlign:'center' }}>
          <div className="eyebrow" style={{ justifyContent:'center' }}>The Team</div>
          <h2 className="section-title">
            Meet <em>{chef.name.split(' ')[1]}</em>
          </h2>
          <div className="gold-divider" />
          <p className="body-lg" style={{ maxWidth:'560px', margin:'0 auto 16px' }}>
            {chef.bio.slice(0, 200)}…
          </p>
          <Link href="/about" className="btn-ghost" style={{ color:'var(--gold)' }}>
            Read the full story <ArrowRight size={13} />
          </Link>
        </div>
      </section>

      {/* ═══ CTA BAND ═════════════════════════════════════════════ */}
      <section style={{
        background: `
          radial-gradient(ellipse 80% 60% at 50% 50%, rgba(197,168,92,0.07) 0%, transparent 70%),
          var(--dark-surface)
        `,
        borderTop:  '1px solid var(--dark-border)',
        padding:    '80px 0',
      }}>
        <div className="container" style={{ textAlign:'center' }}>
          <h2 style={{
            fontFamily:    'var(--font-display)',
            fontSize:      'clamp(2rem, 4.5vw, 3.5rem)',
            fontWeight:    300,
            color:         'var(--cream)',
            marginBottom:  '16px',
            lineHeight:    1.1,
          }}>
            Reserve your <em style={{ color:'var(--gold)', fontStyle:'italic' }}>table</em> tonight
          </h2>
          <p className="body-lg" style={{ maxWidth:'420px', margin:'0 auto 40px' }}>
            Gather your friends and family for an evening of premium shakes, artisan waffles, and warm hospitality.
          </p>
          <div style={{ display:'flex', gap:'16px', justifyContent:'center', flexWrap:'wrap' }}>
            <Link href="/reservations" className="btn-gold">
              <span>Book a Table</span>
              <ArrowRight size={13} style={{ position:'relative', zIndex:1 }} />
            </Link>
            <Link href="/order" className="btn-outline">Order Online</Link>
          </div>
        </div>
      </section>
    </main>
  );
}
