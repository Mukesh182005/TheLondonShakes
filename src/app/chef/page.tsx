'use client';

import React from 'react';
import Image from 'next/image';
import { useCMSStore, useIsMounted } from '@/store/restaurantStore';
import { chef as initialChef } from '@/data/restaurantData';
import { Award, BookOpen, Quote, Sparkles } from 'lucide-react';

export default function ChefPage() {
  const storeChef = useCMSStore((state) => state.chef);
  const isMounted = useIsMounted();
  const chef = isMounted ? storeChef : initialChef;
  return (
    <div className="page-wrapper" style={{ background: 'var(--black)', color: 'var(--text-primary)', position: 'relative', overflow: 'hidden' }}>
      {/* Background Image Layer */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundImage: "url('/london-chef-bg.jpg')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        opacity: 0.3,
        pointerEvents: 'none',
        zIndex: 0,
      }} />

      {/* Main Content Wrapper */}
      <div style={{ position: 'relative', zIndex: 1 }}>
        {/* Page Header */}
        <div
          style={{
            background: 'linear-gradient(180deg, var(--void) 0%, transparent 100%)',
            padding: '100px 0 60px',
            textAlign: 'center',
            borderBottom: '1px solid rgba(197, 168, 92, 0.12)',
            position: 'relative'
          }}
        >
          <div style={{
            position: 'absolute',
            bottom: '4px',
            left: '24px',
            right: '24px',
            height: '1px',
            background: 'rgba(197, 168, 92, 0.05)',
          }} />
          <div className="container">
            <div className="eyebrow" style={{ justifyContent: 'center' }}>The Kitchen Hearth</div>
            <h1 className="section-title">{chef.title} <em>{chef.name}</em></h1>
            <div className="gold-divider" />
          </div>
        </div>

        {/* Main Content */}
        <div style={{ padding: '80px 0 120px' }}>
          <div className="container">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start mb-20">
              {/* Chef Portrait Panel */}
              <div
                style={{
                  height: '520px',
                  background: 'linear-gradient(135deg, var(--charcoal) 0%, var(--black) 100%)',
                  border: '1px solid rgba(197, 168, 92, 0.22)',
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 30px 60px rgba(0,0,0,0.15)',
                  overflow: 'hidden',
                }}
                className="food-photo"
              >
                {/* Internal framing */}
                <div style={{
                  position: 'absolute',
                  inset: '16px',
                  border: '1px solid rgba(197, 168, 92, 0.08)',
                  pointerEvents: 'none',
                  zIndex: 2,
                }} />

                {chef.image ? (
                  <>
                    <Image
                      src={chef.image}
                      alt={chef.name}
                      fill
                      sizes="(max-width: 768px) 100vw, 50vw"
                      style={{
                        objectFit: 'cover',
                        zIndex: 1,
                      }}
                      unoptimized={chef.image.startsWith('data:') || chef.image.startsWith('blob:')}
                    />
                    <div style={{
                      position: 'absolute',
                      inset: 0,
                      background: 'linear-gradient(180deg, transparent 60%, rgba(0,0,0,0.85) 100%)',
                      zIndex: 2,
                    }} />
                    <div style={{ position: 'absolute', bottom: '32px', left: '32px', right: '32px', zIndex: 3, textAlign: 'center' }}>
                      <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', color: 'var(--cream)', fontWeight: 300, textShadow: '0 2px 4px rgba(0,0,0,0.8)' }}>
                        {chef.name}
                      </div>
                      <div style={{ fontFamily: 'var(--font-sans)', fontSize: '0.58rem', fontWeight: 700, letterSpacing: '0.25em', textTransform: 'uppercase', marginTop: '8px', color: 'var(--crimson)', textShadow: '0 1px 2px rgba(0,0,0,0.8)' }}>
                        {chef.title}
                      </div>
                    </div>
                  </>
                ) : (
                  <div style={{ textAlign: 'center', color: 'var(--gold)', position: 'relative', zIndex: 10 }}>
                    <div style={{ fontSize: '3.5rem', marginBottom: '16px' }}>👩‍🍳</div>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', color: 'var(--cream)', fontWeight: 300 }}>
                      {chef.name}
                    </div>
                    <div style={{ fontFamily: 'var(--font-sans)', fontSize: '0.58rem', fontWeight: 700, letterSpacing: '0.25em', textTransform: 'uppercase', marginTop: '8px', color: 'var(--crimson)' }}>
                      {chef.title}
                    </div>
                  </div>
                )}
              </div>

              {/* Biography */}
              <div className="flex flex-col gap-8">
                <div>
                  <div className="eyebrow">The Biography</div>
                  <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '2.2rem', color: 'var(--cream)', marginBottom: '24px', fontWeight: 300 }}>
                    A Heritage of Craft & Taste
                  </h2>
                  <div style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', color: 'var(--text-primary)', lineHeight: 1.8, display: 'flex', flexDirection: 'column', gap: '16px', fontSize: '0.95rem' }}>
                    {chef.bio.split('\n\n').map((para, i) => (
                      <p key={i}>{para.trim()}</p>
                    ))}
                  </div>
                </div>

                {/* Training History */}
                <div style={{ borderTop: '1px solid rgba(197, 168, 92, 0.1)', paddingTop: '28px' }}>
                  <h4 style={{ fontFamily: 'var(--font-sans)', fontSize: '0.62rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700 }}>
                    <BookOpen size={13} />
                    Professional Background
                  </h4>
                  <ul style={{ display: 'flex', flexDirection: 'column', gap: '10px', color: 'var(--text-secondary)', fontSize: '0.84rem' }}>
                    {chef.education.map(edu => (
                      <li key={edu} style={{ display: 'flex', gap: '10px' }}>
                        <span style={{ color: 'var(--gold)' }}>✦</span>
                        <span>{edu}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Philosophy Block Quote */}
            <div
              style={{
                background: 'var(--dark-card)',
                border: '1px solid rgba(197, 168, 92, 0.18)',
                padding: '60px 40px',
                textAlign: 'center',
                marginBottom: '80px',
                position: 'relative',
                boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
              }}
            >
              <div style={{
                position: 'absolute',
                inset: '12px',
                border: '1px solid rgba(197, 168, 92, 0.05)',
                pointerEvents: 'none',
              }} />

              <div style={{ position: 'absolute', top: '24px', left: '24px', opacity: 0.12 }}>
                <Quote size={40} color="var(--gold)" />
              </div>

              <h3
                style={{
                  fontFamily: 'var(--font-serif)',
                  fontSize: 'clamp(1.4rem, 3vw, 2rem)',
                  color: 'var(--cream)',
                  fontStyle: 'italic',
                  lineHeight: 1.6,
                  maxWidth: '800px',
                  margin: '0 auto 24px',
                  fontWeight: 300,
                  position: 'relative',
                  zIndex: 2,
                }}
              >
                {chef.philosophy}
              </h3>
              <div style={{ fontFamily: 'var(--font-sans)', fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--gold)', position: 'relative', zIndex: 2 }}>
                — {chef.name}
              </div>
            </div>

            {/* Chef Accolades */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
              {/* Signature Dishes */}
              <div style={{ background: 'var(--dark-card)', border: '1px solid var(--dark-border)', padding: '40px' }}>
                <h4 style={{ fontFamily: 'var(--font-sans)', fontSize: '0.78rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--cream)', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Sparkles size={14} color="var(--gold)" />
                  Signature Innovations
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  {chef.signature.map((dish, i) => (
                    <div key={dish} style={{ display: 'flex', gap: '16px', paddingBottom: '16px', borderBottom: i < chef.signature.length - 1 ? '1px solid var(--dark-border-2)' : 'none' }}>
                      <div style={{ width: '30px', height: '30px', background: '#111', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--gold)', fontSize: '0.8rem', fontWeight: 600, flexShrink: 0 }}>
                        0{i + 1}
                      </div>
                      <div>
                        <div style={{ color: 'var(--cream)', fontWeight: 600, fontSize: '0.9rem', marginBottom: '4px' }}>{dish}</div>
                        <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', lineHeight: 1.5 }}>
                          Prepared over selected wood embers utilizing traditional clay-baking or iron plate sear methods.
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Media & Awards */}
              <div style={{ background: 'var(--dark-card)', border: '1px solid var(--dark-border)', padding: '40px' }}>
                <h4 style={{ fontFamily: 'var(--font-sans)', fontSize: '0.78rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--cream)', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Award size={14} color="var(--gold)" />
                  Accolades & Media
                </h4>

                {/* Media links */}
                <div style={{ marginBottom: '24px' }}>
                  <div style={{ color: 'var(--gold)', fontSize: '0.7rem', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '12px' }}>Featured in:</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
                    {chef.media.map(m => (
                      <span key={m} style={{ background: 'var(--black)', border: '1px solid var(--dark-border-2)', padding: '6px 12px', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                        {m}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Culinary guide details */}
                <div style={{ borderTop: '1px solid var(--dark-border-2)', paddingTop: '20px' }}>
                  <div style={{ color: 'var(--gold)', fontSize: '0.7rem', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '8px' }}>Culinary Excellence:</div>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.84rem', lineHeight: 1.6 }}>
                    Under {chef.name}'s direction, The London Shakes was awarded the Gold Medallion for Best Premium Café & Dessert Experience in 2023, retaining it with high distinctions in 2024 and 2025.
                  </p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
