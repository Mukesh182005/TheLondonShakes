'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';

function useReveal(threshold = 0.1) {
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

const sections = [
  {
    title: '1. Acceptance of Terms',
    body: [
      'By accessing or using the website, placing an order, making a reservation, or using any service offered by The London Shakes ("we", "us", or "our"), you agree to be bound by these Terms of Service.',
      'If you do not agree to these terms, please do not use our services. We reserve the right to update these terms at any time, and your continued use of our services constitutes acceptance of any changes.',
    ],
  },
  {
    title: '2. Orders & Payments',
    body: [
      'All online orders placed through our website are subject to acceptance and availability. We reserve the right to refuse or cancel any order at our discretion.',
      'Payment must be made in full at the time of ordering. We accept UPI, cards, and cash on delivery as listed at checkout. Prices are inclusive of applicable taxes unless stated otherwise.',
      'In the event of a pricing error on our website, we reserve the right to cancel the affected orders and notify you accordingly.',
    ],
  },
  {
    title: '3. Reservations',
    body: [
      'Table reservations are subject to availability. A reservation confirmation does not guarantee a specific table location within the restaurant.',
      'We request that you arrive within 15 minutes of your reserved time. Unreasonable delays may result in the table being released for other guests. We will make reasonable efforts to accommodate late arrivals.',
      'Cancellations must be made at least 2 hours before the reservation time. Repeated no-shows may result in restricted future booking privileges.',
    ],
  },
  {
    title: '4. Food Allergens & Dietary Requirements',
    body: [
      'While we take every precaution, our kitchen handles a variety of allergens including dairy, gluten, nuts, eggs, and soy. We cannot guarantee a completely allergen-free environment.',
      'If you have a food allergy or specific dietary requirement, please inform our staff before ordering. We will do our best to accommodate your needs but cannot be held liable for adverse reactions.',
    ],
  },
  {
    title: '5. Refunds & Cancellations',
    body: [
      'Once an order is confirmed and preparation has begun, cancellations may not be accepted. For delivery/pickup orders, requests for cancellation must be made within 5 minutes of order placement.',
      'Refunds for defective or incorrect items will be processed to the original payment method within 5–7 business days upon our verification of the claim. Please contact us within 24 hours of receiving the order.',
    ],
  },
  {
    title: '6. Intellectual Property',
    body: [
      'All content on this website — including text, images, logos, menu designs, and branding — is the intellectual property of The London Shakes and is protected under applicable copyright laws.',
      'You may not reproduce, distribute, or use any content from this website for commercial purposes without prior written consent from The London Shakes.',
    ],
  },
  {
    title: '7. Limitation of Liability',
    body: [
      'The London Shakes shall not be liable for any indirect, incidental, special, or consequential damages arising from the use of our services, including but not limited to loss of data, business interruption, or personal injury.',
      'Our total liability to you for any claim arising out of the use of our services shall not exceed the amount paid by you for the specific service giving rise to the claim.',
    ],
  },
  {
    title: '8. Governing Law',
    body: [
      'These Terms of Service are governed by the laws of India, and any disputes shall be subject to the exclusive jurisdiction of the courts in Silchar, Assam.',
    ],
  },
  {
    title: '9. Contact Us',
    body: [
      'For any questions regarding these Terms of Service, please reach out to us at hello@thelondon.co.uk or visit us at our restaurant on the 3rd Floor, East Point Mall, Silchar, Assam 788001.',
    ],
  },
];

function Section({ sec, i }: { sec: typeof sections[0]; i: number }) {
  const { ref, visible } = useReveal();
  return (
    <div
      ref={ref}
      style={{
        marginBottom: '52px',
        opacity:      visible ? 1 : 0,
        transform:    visible ? 'none' : 'translateY(20px)',
        transition:   `all 0.7s cubic-bezier(0.16,1,0.3,1) ${i * 0.05}s`,
      }}
    >
      <h2 style={{
        fontFamily:    'var(--font-sans)',
        fontSize:      '0.72rem',
        fontWeight:    700,
        letterSpacing: '0.18em',
        textTransform: 'uppercase',
        color:         'var(--gold)',
        marginBottom:  '16px',
      }}>
        {sec.title}
      </h2>
      {sec.body.map((para, j) => (
        <p key={j} style={{
          fontFamily:   'var(--font-serif)',
          fontSize:     '1rem',
          color:        'var(--text-secondary)',
          lineHeight:   1.85,
          marginBottom: '14px',
        }}>
          {para}
        </p>
      ))}
      {i < sections.length - 1 && (
        <div style={{ height: '1px', background: 'rgba(28,24,16,0.07)', marginTop: '40px' }} />
      )}
    </div>
  );
}

export default function TermsPage() {
  const heroSec = useReveal(0.1);

  return (
    <div className="page-wrapper" style={{ background: 'var(--paper)', color: 'var(--text-primary)' }}>

      {/* ═══ HERO ═══ */}
      <div style={{
        position:    'relative',
        background:  'linear-gradient(180deg, #1C1915 0%, #2a2318 100%)',
        padding:     '100px 0 72px',
        textAlign:   'center',
        borderBottom:'1px solid rgba(197, 168, 92, 0.15)',
        overflow:    'hidden',
      }}>
        <div style={{
          position:      'absolute',
          inset:         0,
          background:    'radial-gradient(ellipse 60% 50% at 50% 0%, rgba(197,168,92,0.08) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />
        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <div ref={heroSec.ref} style={{
            opacity:    heroSec.visible ? 1 : 0,
            transform:  heroSec.visible ? 'none' : 'translateY(20px)',
            transition: 'opacity 0.9s cubic-bezier(0.16,1,0.3,1), transform 0.9s cubic-bezier(0.16,1,0.3,1)',
          }}>
            <div style={{
              fontFamily:    'var(--font-sans)',
              fontSize:      '0.55rem',
              fontWeight:    700,
              letterSpacing: '0.38em',
              textTransform: 'uppercase',
              color:         'var(--gold)',
              marginBottom:  '20px',
            }}>Legal</div>
            <h1 style={{
              fontFamily:    'var(--font-display)',
              fontSize:      'clamp(2.5rem, 5vw, 4rem)',
              fontWeight:    300,
              color:         '#F2EEE4',
              letterSpacing: '0.02em',
              lineHeight:    1.1,
              marginBottom:  '24px',
            }}>
              Terms of <em style={{ fontStyle: 'italic', color: 'var(--gold)' }}>Service</em>
            </h1>
            <div style={{ width: '40px', height: '1px', background: 'var(--gold)', margin: '0 auto 24px', opacity: 0.6 }} />
            <p style={{
              fontFamily:  'var(--font-serif)',
              fontSize:    '1rem',
              fontStyle:   'italic',
              color:       'rgba(242,238,228,0.55)',
              maxWidth:    '520px',
              margin:      '0 auto',
              lineHeight:  1.7,
            }}>
              Please read these terms carefully before using our services. Last updated: June 2025.
            </p>
          </div>
        </div>
      </div>

      {/* ═══ CONTENT ═══ */}
      <section style={{ padding: '80px 0 100px' }}>
        <div className="container" style={{ maxWidth: '800px' }}>
          {sections.map((sec, i) => (
            <Section key={i} sec={sec} i={i} />
          ))}

          {/* Footer links */}
          <div style={{
            marginTop:  '60px',
            paddingTop: '40px',
            borderTop:  '1px solid rgba(28,24,16,0.07)',
            display:    'flex',
            gap:        '24px',
            flexWrap:   'wrap',
          }}>
            <Link href="/privacy" style={{
              fontFamily:    'var(--font-sans)',
              fontSize:      '0.65rem',
              fontWeight:    600,
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              color:         'var(--gold)',
              textDecoration:'none',
            }}>
              Privacy Policy →
            </Link>
            <Link href="/" style={{
              fontFamily:    'var(--font-sans)',
              fontSize:      '0.65rem',
              fontWeight:    600,
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              color:         'var(--text-muted)',
              textDecoration:'none',
            }}>
              ← Back to Home
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
