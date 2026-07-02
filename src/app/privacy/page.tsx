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
    title: '1. Information We Collect',
    body: [
      'When you use our website or services, we may collect the following types of information:',
      'Personal identification information: your name, email address, phone number, and delivery address when you place an order or make a reservation.',
      'Transaction data: details of orders and payments you make through our platform, including order history and payment method type (we do not store full card details).',
      'Usage data: how you interact with our website, such as pages visited, time spent, and browser/device information — collected via cookies and similar technologies.',
    ],
  },
  {
    title: '2. How We Use Your Information',
    body: [
      'To process and fulfil your orders and reservations.',
      'To send you order confirmations, updates, and relevant communications about your booking or purchase.',
      'To improve our website, menu offerings, and overall customer experience.',
      'To comply with our legal obligations and resolve any disputes that may arise.',
      'We will never sell, rent, or trade your personal data to third parties for marketing purposes.',
    ],
  },
  {
    title: '3. Cookies & Tracking',
    body: [
      'Our website uses cookies to enhance your browsing experience, remember your preferences, and analyse site traffic.',
      'You may choose to disable cookies through your browser settings. However, doing so may affect the functionality of certain features on our site.',
      'We use essential cookies (required for the site to function), preference cookies (to remember your settings), and analytics cookies (to understand how visitors use our site).',
    ],
  },
  {
    title: '4. Data Sharing',
    body: [
      'We may share your information with trusted third-party service providers who assist us in operating our website and delivering our services — such as payment processors and order management platforms.',
      'These third parties are contractually obligated to keep your information confidential and may only use it in ways we authorise.',
      'We may also disclose your data if required by law or to protect the rights, property, or safety of The London Shakes, our customers, or others.',
    ],
  },
  {
    title: '5. Data Retention',
    body: [
      'We retain your personal data only as long as necessary to fulfil the purposes for which it was collected, or as required by applicable law.',
      'Order records and transaction data may be retained for up to 5 years for accounting and legal compliance purposes.',
      'You may request deletion of your account and associated data at any time by contacting us.',
    ],
  },
  {
    title: '6. Your Rights',
    body: [
      'You have the right to access, correct, or delete any personal information we hold about you.',
      'You may withdraw consent for marketing communications at any time by clicking "unsubscribe" in any email we send, or by contacting us directly.',
      'To exercise any of these rights, please contact us using the details below. We will respond to your request within 30 days.',
    ],
  },
  {
    title: '7. Data Security',
    body: [
      'We implement appropriate technical and organisational measures to protect your personal data against unauthorised access, loss, or misuse.',
      'All transactions on our platform are processed over encrypted HTTPS connections. Payment processing is handled by trusted providers and we do not store sensitive payment credentials.',
      'While we strive to protect your information, no method of electronic transmission is 100% secure. We encourage you to use strong passwords and keep your account credentials confidential.',
    ],
  },
  {
    title: '8. Children\'s Privacy',
    body: [
      'Our services are not directed to individuals under the age of 13. We do not knowingly collect personal information from children.',
      'If you believe we have inadvertently collected such information, please contact us and we will promptly delete it.',
    ],
  },
  {
    title: '9. Changes to This Policy',
    body: [
      'We may update this Privacy Policy from time to time. Any changes will be posted on this page with an updated revision date.',
      'We encourage you to review this policy periodically. Your continued use of our services after any changes constitutes your acceptance of the updated policy.',
    ],
  },
  {
    title: '10. Contact Us',
    body: [
      'If you have any questions, concerns, or requests regarding this Privacy Policy, please contact us at:',
      'Email: hello@thelondon.co.uk | Phone: +91 79063 88182 | Address: 3rd Floor, East Point Mall, Silchar, Assam 788001',
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

export default function PrivacyPage() {
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
              Privacy <em style={{ fontStyle: 'italic', color: 'var(--gold)' }}>Policy</em>
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
              Your privacy matters to us. This policy explains how we collect, use, and protect your personal information. Last updated: June 2025.
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
            <Link href="/terms" style={{
              fontFamily:    'var(--font-sans)',
              fontSize:      '0.65rem',
              fontWeight:    600,
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              color:         'var(--gold)',
              textDecoration:'none',
            }}>
              Terms of Service →
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
