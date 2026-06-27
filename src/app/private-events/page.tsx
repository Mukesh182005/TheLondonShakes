'use client';

import React, { useState, useEffect } from 'react';
import { useCMSStore } from '@/store/restaurantStore';
import { privateEventTypes as initialPrivateEventTypes } from '@/data/restaurantData';
import { Mail, Calendar, Users, Award, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';

export default function PrivateEventsPage() {
  const storePrivateEventTypes = useCMSStore((state) => state.privateEventTypes);
  const storeChef = useCMSStore((state) => state.chef);
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
  }, []);
  const privateEventTypes = isMounted ? storePrivateEventTypes : initialPrivateEventTypes;
  const chef = isMounted ? storeChef : { name: 'Abhik' };
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    date: '',
    eventType: 'corporate',
    guests: '12',
    details: ''
  });
  const [submitted, setSubmitted] = useState(false);
  const [inquiryId, setInquiryId] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.date) {
      toast.error('Please complete all required fields.');
      return;
    }
    const id = 'INQ-' + Math.random().toString(36).substring(2, 8).toUpperCase();
    setInquiryId(id);
    setSubmitted(true);
    toast.success('Inquiry submitted successfully!');
  };

  if (submitted) {
    return (
      <div className="page-wrapper" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: 'var(--black)' }}>
        <div className="container" style={{ textAlign: 'center', maxWidth: '600px', padding: '60px var(--container-px)' }}>
          <div style={{ width: '80px', height: '80px', background: 'linear-gradient(135deg, var(--gold-dark), var(--gold))', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 32px' }}>
            <ShieldCheck size={36} color="var(--black)" />
          </div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '2.5rem', color: 'var(--gold)', marginBottom: '12px' }}>
            Inquiry Logged
          </h2>
          <div style={{ fontFamily: 'var(--font-sans)', color: 'var(--text-secondary)', fontSize: '0.8rem', letterSpacing: '0.2em', marginBottom: '32px' }}>
            INQUIRY REFERENCE: #{inquiryId}
          </div>
          
          <div style={{ background: '#0d0d0d', border: '1px solid rgba(201,168,76,0.15)', padding: '32px', textAlign: 'left', marginBottom: '32px' }}>
            <p style={{ color: 'var(--cream)', fontSize: '0.9rem', marginBottom: '16px', fontFamily: 'var(--font-serif)', lineHeight: 1.6 }}>
              Dear {form.name},
            </p>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.84rem', lineHeight: 1.7, marginBottom: '16px' }}>
              We have received your private dining request for a **{form.eventType}** event on **{form.date}** catering to **{form.guests} guests**.
            </p>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.84rem', lineHeight: 1.7 }}>
              Our dedicated events coordinator will contact you at **{form.email}** within 24 hours to begin mapping out your bespoke culinary menu.
            </p>
          </div>
          
          <button className="btn-gold" onClick={() => setSubmitted(false)}>
            <span>Close Window</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="page-wrapper" style={{ background: 'var(--black)', color: 'var(--text-primary)' }}>
      
      {/* Page Header */}
      <div 
        style={{ 
          background: 'linear-gradient(180deg, #0a0502 0%, var(--dark-bg) 100%)', 
          padding: '80px 0 60px', 
          textAlign: 'center',
          borderBottom: '1px solid rgba(201, 168, 76, 0.08)'
        }}
      >
        <div className="container">
          <div className="section-eyebrow" style={{ justifyContent: 'center' }}>Bespoke Celebrations</div>
          <h1 className="section-title">Private Dining & <em>Events</em></h1>
          <div className="gold-divider" />
          <p style={{ fontFamily: 'var(--font-serif)', fontSize: '1.1rem', color: 'var(--text-secondary)', maxWidth: '600px', margin: '16px auto 0', lineHeight: 1.6 }}>
            Bespoke configurations for corporate dinners, wedding receptions, and celebratory gatherings.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ padding: '80px 0 120px' }}>
        <div className="container">
          
          {/* Rooms Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-20">
            {privateEventTypes.map((event) => (
              <div 
                key={event.id}
                style={{ 
                  background: 'var(--dark-card)',
                  border: '1px solid var(--dark-border)',
                  padding: '40px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  minHeight: '420px'
                }}
                className="hover:border-gold transition-colors"
              >
                <div>
                  {event.image ? (
                    <div style={{ height: '180px', width: '100%', position: 'relative', overflow: 'hidden', marginBottom: '24px', border: '1px solid var(--dark-border-2)' }}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={event.image} alt={event.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                  ) : (
                    <div style={{ color: 'var(--gold)', fontSize: '1.8rem', marginBottom: '16px' }}>{event.icon}</div>
                  )}
                  <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', color: 'var(--cream)', marginBottom: '4px' }}>
                    {event.title}
                  </h3>
                  <div style={{ fontFamily: 'var(--font-serif)', color: 'var(--gold)', fontSize: '0.85rem', fontStyle: 'italic', marginBottom: '20px' }}>
                    {event.subtitle}
                  </div>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.84rem', lineHeight: 1.7, marginBottom: '24px' }}>
                    {event.description}
                  </p>
                  
                  {/* Space details */}
                  <div style={{ margin: '16px 0 24px' }}>
                    <div style={{ color: 'var(--cream)', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>
                      Suitable Spaces:
                    </div>
                    <ul style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      {event.rooms.map(room => (
                        <li key={room} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ color: 'var(--gold)', fontSize: '0.5rem' }}>■</span>
                          {room}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div style={{ borderTop: '1px solid var(--dark-border-2)', paddingTop: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    <span>Catering Capacity:</span>
                    <span style={{ color: 'var(--gold)', fontWeight: 600 }}>{event.capacity}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <hr style={{ border: 'none', borderTop: '1px solid rgba(201,168,76,0.15)', marginBottom: '80px' }} />

          {/* Inquiry Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
            {/* Left Info Column */}
            <div>
              <div className="section-eyebrow">The Experience</div>
              <h2 className="section-title">Host Your Event <em>With Us</em></h2>
              <div className="gold-divider-left" />
              <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8, marginBottom: '24px' }}>
                Whether hosting a corporate board dinner under the vaulted arches or an intimate wedding reception, our team handles every detail. {chef.name} will curate a bespoke, multi-course wood-fired tasting menu styled to match your guest preferences.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-10">
                {[
                  { Icon: Award, title: 'Michelin Service', desc: 'Flawless service delivery by our floor staff.' },
                  { Icon: Users, title: 'Flexible Hosting', desc: 'Bespoke room partitions and layouts.' },
                  { Icon: Calendar, title: 'Priority Calendar', desc: 'Bookings persistent up to one year in advance.' },
                  { Icon: Mail, title: 'Immediate Response', desc: 'Bespoke consultations scheduled within 24 hours.' }
                ].map(({ Icon, title, desc }) => (
                  <div key={title} className="flex gap-4">
                    <div style={{ width: '36px', height: '36px', background: '#0d0d0d', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, border: '1px solid var(--dark-border)' }}>
                      <Icon size={14} color="var(--gold)" />
                    </div>
                    <div>
                      <div style={{ color: 'var(--cream)', fontWeight: 600, fontSize: '0.82rem', marginBottom: '4px' }}>{title}</div>
                      <div style={{ color: 'var(--text-secondary)', fontSize: '0.78rem', lineHeight: 1.5 }}>{desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Event Form */}
            <div style={{ background: '#0d0d0d', border: '1px solid rgba(201,168,76,0.15)', padding: '48px' }}>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', color: 'var(--gold)', marginBottom: '32px' }}>
                Bespoke Inquiry Form
              </h3>
              
              <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                <div>
                  <label className="form-label">Full Name *</label>
                  <input 
                    name="name"
                    required
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Your name"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="form-label">Email Address *</label>
                    <input 
                      name="email"
                      type="email"
                      required
                      value={form.email}
                      onChange={handleChange}
                      placeholder="you@example.com"
                    />
                  </div>
                  <div>
                    <label className="form-label">Contact Number</label>
                    <input 
                      name="phone"
                      type="tel"
                      value={form.phone}
                      onChange={handleChange}
                      placeholder="Your phone"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="md:col-span-2">
                    <label className="form-label">Date of Event *</label>
                    <input 
                      name="date"
                      type="date"
                      required
                      min={new Date().toISOString().split('T')[0]}
                      value={form.date}
                      onChange={handleChange}
                    />
                  </div>
                  <div>
                    <label className="form-label">Guests *</label>
                    <select name="guests" value={form.guests} onChange={handleChange}>
                      {['6-12', '12-25', '25-50', '50-80', '80+'].map(g => (
                        <option key={g} value={g}>{g} Guests</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="form-label">Event Classification</label>
                  <select name="eventType" value={form.eventType} onChange={handleChange}>
                    {['corporate', 'wedding', 'private', 'custom'].map(type => (
                      <option key={type} value={type}>{type.toUpperCase()}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="form-label">Event Details / Culinary Directives</label>
                  <textarea 
                    name="details"
                    value={form.details}
                    onChange={handleChange}
                    placeholder="Provide menu preferences, special room setups, or specific requests..."
                    rows={4}
                    style={{ resize: 'vertical' }}
                  />
                </div>

                <button type="submit" className="btn-gold" style={{ width: '100%', marginTop: '12px' }}>
                  <span>Submit Event Inquiry</span>
                </button>
              </form>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
}
