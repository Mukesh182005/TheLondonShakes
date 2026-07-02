'use client';

import React, { useState } from 'react';
import { useCMSStore, useIsMounted } from '@/store/restaurantStore';
import { privateEventTypes as initialPrivateEventTypes } from '@/data/restaurantData';
import { Mail, Calendar, Users, Award, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';

const pseudoRandom = (seed: number) => {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
};

const STARS = Array.from({ length: 60 }).map((_, i) => {
  const r1 = pseudoRandom(i * 12.34);
  const r2 = pseudoRandom(i * 56.78);
  const r3 = pseudoRandom(i * 90.12);
  const r4 = pseudoRandom(i * 34.56);
  const r5 = pseudoRandom(i * 78.90);
  return {
    id: i,
    top: `${r1 * 100}%`,
    left: `${r2 * 100}%`,
    size: `${r3 * 2 + 1}px`,
    delay: `${r4 * 5}s`,
    duration: `${r5 * 4 + 4}s`,
  };
});

export default function PrivateEventsPage() {
  const storePrivateEventTypes = useCMSStore((state) => state.privateEventTypes);
  const storeChef = useCMSStore((state) => state.chef);
  
  const isMounted = useIsMounted();
  const stars = STARS;

  const privateEventTypes = isMounted ? storePrivateEventTypes : initialPrivateEventTypes;
  const chef = isMounted ? storeChef : { name: 'Abhik' };
  
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    date: '',
    eventType: 'corporate',
    guests: '6-12',
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
      <div className="page-wrapper" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#0b0412', padding: '40px 24px' }}>
        <div className="container" style={{ textAlign: 'center', maxWidth: '600px', padding: '60px var(--container-px)' }}>
          <div style={{ width: '80px', height: '80px', background: 'linear-gradient(135deg, var(--gold-dark), var(--gold))', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 32px' }}>
            <ShieldCheck size={36} color="var(--black)" />
          </div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '2.5rem', color: 'var(--gold-pale)', marginBottom: '12px' }}>
            Inquiry Logged
          </h2>
          <div style={{ fontFamily: 'var(--font-sans)', color: 'rgba(242, 238, 228, 0.6)', fontSize: '0.8rem', letterSpacing: '0.2em', marginBottom: '32px' }}>
            INQUIRY REFERENCE: #{inquiryId}
          </div>
          
          <div style={{ background: 'rgba(18, 8, 30, 0.75)', border: '1px solid rgba(139, 92, 246, 0.25)', padding: '32px', textAlign: 'left', marginBottom: '32px' }}>
            <p style={{ color: '#F2EEE4', fontSize: '0.9rem', marginBottom: '16px', fontFamily: 'var(--font-serif)', lineHeight: 1.6 }}>
              Dear {form.name},
            </p>
            <p style={{ color: 'rgba(242, 238, 228, 0.7)', fontSize: '0.84rem', lineHeight: 1.7, marginBottom: '16px' }}>
              We have received your private dining request for a **{form.eventType}** event on **{form.date}** catering to **{form.guests} guests**.
            </p>
            <p style={{ color: 'rgba(242, 238, 228, 0.7)', fontSize: '0.84rem', lineHeight: 1.7 }}>
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
    <div className="spooky-events page-wrapper" style={{ background: 'linear-gradient(180deg, #0b0412 0%, #160a22 50%, #050208 100%)', color: '#F2EEE4', position: 'relative', overflow: 'hidden' }}>
      
      {/* Constellation Starlight Background */}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0 }}>
        {stars.map((star) => (
          <div
            key={star.id}
            style={{
              position: 'absolute',
              top: star.top,
              left: star.left,
              width: star.size,
              height: star.size,
              background: '#ffffff',
              borderRadius: '50%',
              boxShadow: '0 0 4px #ffffff, 0 0 8px rgba(139, 92, 246, 0.5)',
              opacity: 0.25,
              animation: `twinkle ${star.duration} ease-in-out infinite alternate`,
              animationDelay: star.delay,
            }}
          />
        ))}
      </div>

      {/* Ambient Spooky Glows */}
      <div style={{
        position: 'absolute', top: '10%', left: '5%',
        width: '45vw', height: '45vw',
        background: 'radial-gradient(circle, rgba(139, 92, 246, 0.12) 0%, transparent 70%)',
        pointerEvents: 'none', filter: 'blur(100px)', zIndex: 0
      }} />
      <div style={{
        position: 'absolute', bottom: '20%', right: '5%',
        width: '50vw', height: '50vw',
        background: 'radial-gradient(circle, rgba(245, 158, 11, 0.06) 0%, transparent 70%)',
        pointerEvents: 'none', filter: 'blur(120px)', zIndex: 0
      }} />

      {/* Page Header */}
      <div 
        style={{ 
          background: 'linear-gradient(180deg, rgba(11, 4, 18, 0.85) 0%, rgba(22, 10, 34, 0.4) 100%)', 
          padding: '80px 0 60px', 
          textAlign: 'center',
          borderBottom: '1px solid rgba(139, 92, 246, 0.15)',
          position: 'relative',
          zIndex: 1
        }}
      >
        <div className="container">
          <div className="section-eyebrow" style={{ justifyContent: 'center', color: 'var(--gold-pale)' }}>Bespoke Celebrations</div>
          <h1 className="section-title" style={{ color: '#F2EEE4' }}>Private Dining & <em>Events</em></h1>
          <div className="gold-divider" style={{ background: 'linear-gradient(90deg, transparent, var(--gold-pale), transparent)' }} />
          <p style={{ fontFamily: 'var(--font-serif)', fontSize: '1.1rem', color: 'rgba(242, 238, 228, 0.75)', maxWidth: '600px', margin: '16px auto 0', lineHeight: 1.6 }}>
            Bespoke configurations for corporate dinners, wedding receptions, and celebratory gatherings.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ padding: '80px 0 120px', position: 'relative', zIndex: 1 }}>
        <div className="container">
          
          {/* Rooms Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-20">
            {privateEventTypes.map((event, idx) => (
              <div 
                key={event.id}
                style={{ 
                  background: 'rgba(18, 8, 30, 0.65)',
                  border: '1px solid rgba(139, 92, 246, 0.2)',
                  backdropFilter: 'blur(10px)',
                  padding: '40px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  minHeight: '420px',
                  transition: 'all 0.3s ease',
                  animation: 'float 7s ease-in-out infinite',
                  animationDelay: `${idx * 1.8}s`
                }}
                className="hover:border-gold transition-colors"
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'var(--gold)';
                  e.currentTarget.style.boxShadow = '0 10px 25px rgba(139, 92, 246, 0.25)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(139, 92, 246, 0.2)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <div>
                  {event.image ? (
                    <div style={{ height: '180px', width: '100%', position: 'relative', overflow: 'hidden', marginBottom: '24px', border: '1px solid rgba(139, 92, 246, 0.15)' }}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={event.image} alt={event.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                  ) : (
                    <div style={{ color: 'var(--gold-pale)', fontSize: '1.8rem', marginBottom: '16px' }}>{event.icon}</div>
                  )}
                  <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', color: '#F2EEE4', marginBottom: '4px' }}>
                    {event.title}
                  </h3>
                  <div style={{ fontFamily: 'var(--font-serif)', color: 'var(--gold-pale)', fontSize: '0.85rem', fontStyle: 'italic', marginBottom: '20px' }}>
                    {event.subtitle}
                  </div>
                  <p style={{ color: 'rgba(242, 238, 228, 0.7)', fontSize: '0.84rem', lineHeight: 1.7, marginBottom: '24px' }}>
                    {event.description}
                  </p>
                  
                  {/* Space details */}
                  <div style={{ margin: '16px 0 24px' }}>
                    <div style={{ color: '#F2EEE4', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>
                      Suitable Spaces:
                    </div>
                    <ul style={{ color: 'rgba(242, 238, 228, 0.7)', fontSize: '0.8rem', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      {event.rooms.map(room => (
                        <li key={room} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ color: 'var(--gold-pale)', fontSize: '0.5rem' }}>■</span>
                          {room}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div style={{ borderTop: '1px solid rgba(139, 92, 246, 0.15)', paddingTop: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem', color: 'rgba(242, 238, 228, 0.6)' }}>
                    <span>Catering Capacity:</span>
                    <span style={{ color: 'var(--gold-pale)', fontWeight: 600 }}>{event.capacity}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <hr style={{ border: 'none', borderTop: '1px solid rgba(139, 92, 246, 0.15)', marginBottom: '80px' }} />

          {/* Inquiry Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
            {/* Left Info Column */}
            <div>
              <div className="section-eyebrow" style={{ color: 'var(--gold-pale)' }}>The Experience</div>
              <h2 className="section-title" style={{ color: '#F2EEE4' }}>Host Your Event <em>With Us</em></h2>
              <div className="gold-divider-left" style={{ background: 'linear-gradient(90deg, var(--gold-pale), transparent)' }} />
              <p style={{ color: 'rgba(242, 238, 228, 0.75)', lineHeight: 1.8, marginBottom: '24px' }}>
                Whether hosting an intimate birthday gathering, a corporate meetup, or a casual party, our team handles every detail. {chef.name} will curate a bespoke selection of premium milkshakes, thick waffles, loaded burgers, and custom dessert platters styled to match your guest preferences.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-10">
                {[
                  { Icon: Award, title: 'Premium Service', desc: 'Flawless service delivery by our floor staff.' },
                  { Icon: Users, title: 'Flexible Hosting', desc: 'Bespoke room partitions and layouts.' },
                  { Icon: Calendar, title: 'Priority Calendar', desc: 'Bookings persistent up to one year in advance.' },
                  { Icon: Mail, title: 'Immediate Response', desc: 'Bespoke consultations scheduled within 24 hours.' }
                ].map(({ Icon, title, desc }) => (
                  <div key={title} className="flex gap-4">
                    <div style={{ width: '36px', height: '36px', background: 'rgba(18, 8, 30, 0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, border: '1px solid rgba(139, 92, 246, 0.15)' }}>
                      <Icon size={14} color="var(--gold-pale)" />
                    </div>
                    <div>
                      <div style={{ color: '#F2EEE4', fontWeight: 600, fontSize: '0.82rem', marginBottom: '4px' }}>{title}</div>
                      <div style={{ color: 'rgba(242, 238, 228, 0.6)', fontSize: '0.78rem', lineHeight: 1.5 }}>{desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Event Form */}
            <div style={{ background: 'rgba(18, 8, 30, 0.75)', border: '1px solid rgba(139, 92, 246, 0.25)', padding: '48px', backdropFilter: 'blur(10px)' }}>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', color: 'var(--gold-pale)', marginBottom: '32px' }}>
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

      {/* Spooky Inputs Style override */}
      <style>{`
        .spooky-events input, 
        .spooky-events select, 
        .spooky-events textarea {
          background: rgba(10, 5, 16, 0.6) !important;
          border: 1px solid rgba(139, 92, 246, 0.25) !important;
          border-bottom: 1px solid rgba(197, 168, 92, 0.4) !important;
          color: #F2EEE4 !important;
        }
        .spooky-events input:focus, 
        .spooky-events select:focus, 
        .spooky-events textarea:focus {
          background: rgba(22, 11, 36, 0.8) !important;
          border-bottom-color: var(--gold) !important;
          box-shadow: 0 0 10px rgba(139, 92, 246, 0.15) !important;
        }
        .spooky-events .form-label {
          color: var(--gold-pale) !important;
        }
        .spooky-events option {
          background: #12071e !important;
          color: #F2EEE4 !important;
        }
        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
          100% { transform: translateY(0px); }
        }
        @keyframes twinkle {
          0% { opacity: 0.15; transform: scale(0.8); }
          100% { opacity: 1; transform: scale(1.3); }
        }
      `}</style>

    </div>
  );
}
