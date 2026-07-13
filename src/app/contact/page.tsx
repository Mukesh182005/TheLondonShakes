'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import ScrollReveal from '@/components/ScrollReveal';
import { useCMSStore, useIsMounted } from '@/store/restaurantStore';
import { restaurantInfo as initialRestaurantInfo } from '@/data/restaurantData';
import { Phone, Mail, MapPin, Clock, Send, CheckCircle } from 'lucide-react';

const InstagramIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
  </svg>
);

export default function ContactPage() {
  const storeRestaurantInfo = useCMSStore((s) => s.restaurantInfo);
  const isMounted = useIsMounted();
  const restaurantInfo = isMounted ? storeRestaurantInfo : initialRestaurantInfo;

  const [form, setForm] = useState({ name:'', email:'', phone:'', subject:'', message:'' });
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
  };

  return (
    <main className="page-wrapper" style={{ position: 'relative', overflow: 'hidden' }}>
      {/* Background Image Layer */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundImage: "url('/london-contact-bg.jpg')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        opacity: 0.5,
        pointerEvents: 'none',
        zIndex: 0,
      }} />

      {/* Main Content Wrapper */}
      <div style={{ position: 'relative', zIndex: 1 }}>
        {/* Hero */}
        <div style={{ padding:'64px 0 48px', background:`radial-gradient(ellipse 60% 50% at 50% 50%, rgba(197,168,92,0.05) 0%, transparent 70%), transparent`, borderBottom:'1px solid var(--dark-border)' }}>
        <div className="container" style={{ textAlign:'center' }}>
          <ScrollReveal>
            <div className="eyebrow" style={{ justifyContent:'center' }}>Get In Touch</div>
            <h1 className="display-md">Contact <em className="text-shimmer-gold" style={{ fontStyle:'italic' }}>Us</em></h1>
          </ScrollReveal>
        </div>
      </div>

      <div className="container" style={{ padding:'72px var(--container-px)' }}>
        <div className="contact-grid" style={{ alignItems:'start' }}>

          {/* Info Panel */}
          <ScrollReveal y={24}>
            <h2 style={{ fontFamily:'var(--font-display)', fontSize:'1.6rem', color:'var(--cream)', marginBottom:'32px' }}>
              Come <em style={{ color:'var(--gold)', fontStyle:'italic' }}>find us</em>
            </h2>

            <div style={{ display:'flex', flexDirection:'column', gap:'24px', marginBottom:'40px' }}>
              {[
                { icon:<MapPin size={18} />, title:'Address', content: restaurantInfo.location.fullAddress },
                { icon:<Phone size={18} />, title:'Phone', content: restaurantInfo.contact.phone, href:`tel:${restaurantInfo.contact.phone}` },
                { icon:<Mail size={18} />, title:'Email', content: restaurantInfo.contact.email, href:`mailto:${restaurantInfo.contact.email}` },
                { icon:<InstagramIcon />, title:'Instagram', content: restaurantInfo.contact.instagram, href:`https://instagram.com/${restaurantInfo.contact.instagram.replace('@','')}` },
              ].map((item, i) => (
                <motion.div
                  key={i}
                  style={{ display:'flex', gap:'16px', alignItems:'flex-start' }}
                  initial={{ opacity: 0, x: -16 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: '-10% 0px' }}
                  transition={{ duration: 0.6, delay: i * 0.08, ease: [0.19, 1, 0.22, 1] }}
                  whileHover="hover"
                >
                  <motion.div
                    variants={{ hover: { scale: 1.08, borderColor: 'rgba(197,168,92,0.55)', backgroundColor: 'rgba(197,168,92,0.14)' } }}
                    transition={{ duration: 0.3, ease: [0.19, 1, 0.22, 1] }}
                    style={{ width:'44px', height:'44px', background:'rgba(197,168,92,0.08)', border:'1px solid rgba(197,168,92,0.2)', display:'flex', alignItems:'center', justifyContent:'center', color:'var(--gold)', flexShrink:0 }}
                  >
                    {item.icon}
                  </motion.div>
                  <div>
                    <p style={{ fontFamily:'var(--font-sans)', fontSize:'0.6rem', fontWeight:700, letterSpacing:'0.2em', textTransform:'uppercase', color:'var(--text-secondary)', marginBottom:'4px' }}>
                      {item.title}
                    </p>
                    {item.href ? (
                      <a href={item.href} style={{ fontSize:'0.9rem', color:'var(--cream)', textDecoration:'none', transition:'color 0.2s ease' }}
                        onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--gold)')}
                        onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--cream)')}>
                        {item.content}
                      </a>
                    ) : (
                      <p style={{ fontSize:'0.9rem', color:'var(--cream)', lineHeight:1.5 }}>{item.content}</p>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Hours */}
            <motion.div
              whileHover={{ borderColor: 'rgba(197,168,92,0.4)', y: -3 }}
              transition={{ duration: 0.35, ease: [0.19, 1, 0.22, 1] }}
              style={{ padding:'24px', background:'var(--dark-surface)', border:'1px solid var(--dark-border)' }}
            >
              <div style={{ display:'flex', alignItems:'center', gap:'8px', marginBottom:'16px' }}>
                <Clock size={15} color="var(--gold)" />
                <p style={{ fontFamily:'var(--font-sans)', fontSize:'0.62rem', fontWeight:700, letterSpacing:'0.2em', textTransform:'uppercase', color:'var(--gold)' }}>Hours</p>
              </div>
              {restaurantInfo.hours.map((h, i) => (
                <div key={i}>
                  <p style={{ fontFamily:'var(--font-sans)', fontSize:'0.84rem', fontWeight:600, color:'var(--cream)', marginBottom:'4px' }}>{h.days}</p>
                  <p style={{ fontSize:'0.8rem', color:'var(--text-secondary)' }}>{h.lunch}</p>
                  <p style={{ fontSize:'0.8rem', color:'var(--text-secondary)' }}>{h.dinner}</p>
                </div>
              ))}
            </motion.div>
          </ScrollReveal>

          {/* Contact Form */}
          <ScrollReveal y={24} delay={0.1}>
            {sent ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.94 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, ease: [0.19, 1, 0.22, 1] }}
                style={{ textAlign:'center', padding:'80px 40px', border:'1px solid rgba(16,185,129,0.3)', background:'rgba(16,185,129,0.06)' }}
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.15, ease: [0.34, 1.56, 0.64, 1] }}
                  style={{ display: 'inline-flex' }}
                >
                  <CheckCircle size={48} color="#10b981" style={{ margin:'0 auto 20px' }} />
                </motion.div>
                <h3 style={{ fontFamily:'var(--font-display)', fontSize:'1.6rem', color:'var(--cream)', marginBottom:'8px' }}>
                  Message Sent
                </h3>
                <p style={{ color:'var(--text-secondary)', fontSize:'0.875rem' }}>
                  We'll get back to you within 24 hours.
                </p>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit}>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'16px', marginBottom:'16px' }}>
                  <div>
                    <label className="form-label">Name *</label>
                    <input value={form.name} onChange={(e) => setForm({ ...form, name:e.target.value })} placeholder="Your name" required />
                  </div>
                  <div>
                    <label className="form-label">Phone</label>
                    <input value={form.phone} onChange={(e) => setForm({ ...form, phone:e.target.value })} placeholder="+91 ..." type="tel" />
                  </div>
                </div>
                <div style={{ marginBottom:'16px' }}>
                  <label className="form-label">Email *</label>
                  <input value={form.email} onChange={(e) => setForm({ ...form, email:e.target.value })} placeholder="your@email.com" type="email" required />
                </div>
                <div style={{ marginBottom:'16px' }}>
                  <label className="form-label">Subject</label>
                  <select value={form.subject} onChange={(e) => setForm({ ...form, subject:e.target.value })}>
                    <option value="">Select a subject</option>
                    <option>General Inquiry</option>
                    <option>Private Event Booking</option>
                    <option>Feedback</option>
                    <option>Reservation Query</option>
                    <option>Other</option>
                  </select>
                </div>
                <div style={{ marginBottom:'24px' }}>
                  <label className="form-label">Message *</label>
                  <textarea value={form.message} onChange={(e) => setForm({ ...form, message:e.target.value })} rows={5} placeholder="How can we help?" required style={{ resize:'none' }} />
                </div>
                <button type="submit" className="btn-gold" style={{ width:'100%' }}>
                  <span>Send Message</span>
                  <Send size={13} style={{ position:'relative', zIndex:1 }} />
                </button>
              </form>
            )}
          </ScrollReveal>
        </div>

        {/* Google Maps Embed */}
        <ScrollReveal style={{ marginTop:'72px', border:'1px solid rgba(197,168,92,0.3)', overflow:'hidden' }}>

          {/* Header bar */}
          <div style={{
            display:        'flex',
            alignItems:     'center',
            justifyContent: 'space-between',
            padding:        '14px 20px',
            background:     '#1C1915',
            borderBottom:   '1px solid rgba(197,168,92,0.2)',
          }}>
            <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
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
                textDecoration:'none',
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
            height="380"
            style={{
              border:      0,
              display:     'block',
              filter:      'grayscale(35%) contrast(1.1) brightness(0.88) sepia(15%)',
            }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title="The London Shakes — Silchar location on Google Maps"
          />
        </ScrollReveal>
      </div>
      </div>
    </main>
  );
}
