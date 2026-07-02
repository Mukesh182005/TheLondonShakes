'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const words = ['The', 'London', 'Shakes'];

export default function WelcomeSplashScreen() {
  const [show,    setShow]    = useState(false);
  const [exiting, setExiting] = useState(false);

  const dismiss = React.useCallback(() => {
    setExiting((prev) => {
      if (prev) return prev;
      setTimeout(() => {
        setShow(false);
        document.body.style.overflow = '';
      }, 900);
      return true;
    });
  }, [setShow, setExiting]);

  useEffect(() => {
    const hasSeenSplash = sessionStorage.getItem('seen_london_splash_v3');
    if (!hasSeenSplash) {
      setShow(true);
      sessionStorage.setItem('seen_london_splash_v3', 'true');
      document.body.style.overflow = 'hidden';
      const timer = setTimeout(() => dismiss(), 4200);
      return () => clearTimeout(timer);
    }
  }, [dismiss]);

  if (!show) return null;

  return (
    <AnimatePresence>
      {!exiting ? (
        <motion.div
          key="splash"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.9, ease: [0.19, 1, 0.22, 1] } }}
          onClick={dismiss}
          style={{
            position:      'fixed',
            inset:         0,
            zIndex:        9999,
            background:    'var(--panel-dark)',
            display:       'flex',
            flexDirection: 'column',
            alignItems:    'center',
            justifyContent:'center',
            overflow:      'hidden',
            cursor:        'pointer',
          }}
        >
          {/* Subtle vignette */}
          <div style={{
            position:   'absolute',
            inset:      0,
            background: 'radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.6) 100%)',
            pointerEvents: 'none',
          }} />

          {/* Thin border frame */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { delay: 0.3, duration: 1.2 } }}
            style={{
              position:      'absolute',
              inset:         '32px',
              border:        '1px solid rgba(158, 128, 67, 0.2)',
              pointerEvents: 'none',
            }}
          />

          {/* Corner brackets */}
          {[
            { top: '28px', left: '28px', bl: '1px solid var(--gold)', bt: '1px solid var(--gold)' },
            { top: '28px', right: '28px', br: '1px solid var(--gold)', bt: '1px solid var(--gold)' },
            { bottom: '28px', left: '28px', bl: '1px solid var(--gold)', bb: '1px solid var(--gold)' },
            { bottom: '28px', right: '28px', br: '1px solid var(--gold)', bb: '1px solid var(--gold)' },
          ].map((pos, i) => (
            <motion.span
              key={i}
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.7, transition: { delay: 0.5 + i * 0.1, duration: 0.8 } }}
              style={{
                position:   'absolute',
                width:      '14px',
                height:     '14px',
                borderLeft: pos.bl,
                borderTop:  pos.bt,
                borderRight: pos.br,
                borderBottom: pos.bb,
                ...pos,
                pointerEvents: 'none',
              } as React.CSSProperties}
            />
          ))}

          {/* Center content */}
          <div style={{ textAlign: 'center', zIndex: 1, padding: '0 32px' }}>

            {/* Eyebrow */}
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 0.55, y: 0, transition: { delay: 0.4, duration: 0.9 } }}
              style={{
                fontFamily:    'var(--font-sans)',
                fontSize:      '0.58rem',
                fontWeight:    600,
                letterSpacing: '0.42em',
                textTransform: 'uppercase',
                color:         'var(--gold)',
                marginBottom:  '36px',
              }}
            >
              Silchar · Est. 2021
            </motion.p>

            {/* Word-by-word reveal title — Gucci Osteria style */}
            <h1 style={{
              fontFamily:    'var(--font-display)',
              fontSize:      'clamp(2.8rem, 8vw, 6.5rem)',
              fontWeight:    300,
              color:         'var(--on-dark)',
              letterSpacing: '-0.02em',
              lineHeight:    1,
              marginBottom:  '0px',
              display:       'flex',
              justifyContent:'center',
              flexWrap:      'wrap',
              gap:           '0.3em',
            }}>
              {words.map((word, i) => (
                <motion.span
                  key={word}
                  initial={{ opacity: 0, y: 28 }}
                  animate={{
                    opacity: 1,
                    y:       0,
                    transition: {
                      delay:    0.65 + i * 0.18,
                      duration: 0.95,
                      ease:     [0.19, 1, 0.22, 1],
                    },
                  }}
                  style={{
                    display:   'inline-block',
                    color:     i === 2 ? 'var(--gold)' : 'var(--on-dark)',
                    fontStyle: i === 2 ? 'italic' : 'normal',
                  }}
                >
                  {word}
                </motion.span>
              ))}
            </h1>

            {/* Gold line */}
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1, transition: { delay: 1.2, duration: 1.0, ease: [0.19, 1, 0.22, 1] } }}
              style={{
                width:          '56px',
                height:         '1px',
                background:     'var(--gold)',
                margin:         '32px auto',
                opacity:        0.5,
                transformOrigin:'left',
              }}
            />

            {/* Tagline */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.65, transition: { delay: 1.4, duration: 1.0 } }}
              style={{
                fontFamily:    'var(--font-serif)',
                fontSize:      'clamp(0.9rem, 2vw, 1.1rem)',
                fontStyle:     'italic',
                color:         'var(--on-dark)',
                letterSpacing: '0.04em',
                lineHeight:    1.6,
                maxWidth:      '400px',
                margin:        '0 auto',
              }}
            >
              Premium Shakes · Gourmet Burgers · Artisan Café
            </motion.p>
          </div>

          {/* Loading progress bar */}
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 4.0, ease: 'linear' }}
            style={{
              position:        'absolute',
              bottom:          0,
              left:            0,
              right:           0,
              height:          '1px',
              background:      'var(--gold)',
              transformOrigin: 'left',
              opacity:         0.5,
            }}
          />

          {/* Dismiss hint */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.35, transition: { delay: 1.8, duration: 0.8 } }}
            style={{
              position:      'absolute',
              bottom:        '48px',
              fontFamily:    'var(--font-sans)',
              fontSize:      '0.5rem',
              letterSpacing: '0.3em',
              textTransform: 'uppercase',
              color:         'var(--on-dark)',
            }}
          >
            Tap anywhere to enter
          </motion.p>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
