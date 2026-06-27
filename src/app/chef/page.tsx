'use client';

import React from 'react';
import { useCMSStore } from '@/store/restaurantStore';
import { chef as initialChef } from '@/data/restaurantData';
import { Award, BookOpen, Quote, Sparkles } from 'lucide-react';

export default function ChefPage() {
  const storeChef = useCMSStore((state) => state.chef);
  const [isMounted, setIsMounted] = React.useState(false);
  React.useEffect(() => {
    setIsMounted(true);
  }, []);
  const chef = isMounted ? storeChef : initialChef;
  return (
    <div className="page-wrapper" style={{ background: 'var(--black)', color: 'var(--text-primary)' }}>
      
      {/* Page Header */}
      <div 
        style={{ 
          background: 'linear-gradient(180deg, #0a0603 0%, var(--dark-bg) 100%)', 
          padding: '80px 0 60px', 
          textAlign: 'center',
          borderBottom: '1px solid rgba(201, 168, 76, 0.08)'
        }}
      >
        <div className="container">
          <div className="section-eyebrow" style={{ justifyContent: 'center' }}>The Kitchen Hearth</div>
          <h1 className="section-title">{chef.title} <em>{chef.name}</em></h1>
          <div className="gold-divider" />
        </div>
      </div>

      {/* Main Content */}
      <div style={{ padding: '80px 0 120px' }}>
        <div className="container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start mb-20">
            {/* Chef Portrait Placeholder (Styled Gradient) */}
            <div 
              style={{ 
                height: '520px',
                background: 'linear-gradient(135deg, #161616, #2d1e11, #0c0805)',
                border: '1px solid rgba(201, 168, 76, 0.2)',
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              className="food-photo"
            >
              <div style={{ textAlign: 'center', color: 'var(--gold)', position: 'relative', zIndex: 10 }}>
                <div style={{ fontSize: '4rem', marginBottom: '16px' }}>👨‍🍳</div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', color: 'var(--cream)' }}>
                  {chef.name}
                </div>
                <div style={{ fontSize: '0.72rem', letterSpacing: '0.25em', textTransform: 'uppercase', marginTop: '8px' }}>
                  {chef.title}
                </div>
              </div>
            </div>

            {/* Biography */}
            <div className="flex flex-col gap-8">
              <div>
                <div className="section-eyebrow">The Biography</div>
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '2.2rem', color: 'var(--cream)', marginBottom: '24px' }}>
                  A Heritage of Smoke & Fire
                </h2>
                <div style={{ color: 'var(--text-secondary)', lineHeight: 1.8, display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {chef.bio.split('\n\n').map((para, i) => (
                    <p key={i}>{para.trim()}</p>
                  ))}
                </div>
              </div>

              {/* Training History */}
              <div style={{ borderTop: '1px solid var(--dark-border-2)', paddingTop: '28px' }}>
                <h4 style={{ fontFamily: 'var(--font-sans)', fontSize: '0.78rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--cream)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <BookOpen size={14} color="var(--gold)" />
                  Professional Background
                </h4>
                <ul style={{ display: 'flex', flexDirection: 'column', gap: '10px', color: 'var(--text-secondary)', fontSize: '0.86rem' }}>
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
              background: '#0d0d0d', 
              border: '1px solid rgba(201,168,76,0.15)', 
              padding: '60px 40px', 
              textAlign: 'center',
              marginBottom: '80px',
              position: 'relative'
            }}
          >
            <div style={{ position: 'absolute', top: '24px', left: '24px', opacity: 0.1 }}>
              <Quote size={48} color="var(--gold)" />
            </div>
            <h3 
              style={{ 
                fontFamily: 'var(--font-serif)', 
                fontSize: 'clamp(1.5rem, 3vw, 2.2rem)', 
                color: 'var(--cream)', 
                fontStyle: 'italic',
                lineHeight: 1.6,
                maxWidth: '800px',
                margin: '0 auto 24px',
                fontWeight: 300
              }}
            >
              {chef.philosophy}
            </h3>
            <div style={{ fontSize: '0.75rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--gold)' }}>
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
                      0{i+1}
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

              {/* Michelin guide details */}
              <div style={{ borderTop: '1px solid var(--dark-border-2)', paddingTop: '20px' }}>
                <div style={{ color: 'var(--gold)', fontSize: '0.7rem', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '8px' }}>Michelin Awards:</div>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.84rem', lineHeight: 1.6 }}>
                  Under {chef.name}'s direction, The London Shakes was awarded its first Michelin Star in 2023, retaining it with high distinctions in 2024 and 2025.
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
}
