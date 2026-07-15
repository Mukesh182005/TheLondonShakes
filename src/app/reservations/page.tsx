'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { useRestaurantStore } from '@/store/restaurantStore';
import { useIsMobile } from '@/hooks/useIsMobile';
import toast from 'react-hot-toast';
import { CheckCircle } from 'lucide-react';

const reservationSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  phone: z.string().min(10, { message: 'Please provide a valid contact number.' }),
  email: z.string().email({ message: 'Please provide a valid email address.' }),
  date: z.string().min(1, { message: 'Please select a date.' }),
  time: z.string().min(1, { message: 'Please select a time slot.' }),
  guests: z.string().min(1, { message: 'Please select guest count.' }),
  occasion: z.string().optional(),
  requests: z.string().optional(),
});

type ReservationFormInputs = z.infer<typeof reservationSchema>;

const timeSlots = [
  '12:00', '12:30', '13:00', '13:30', '14:00',
  '18:00', '18:30', '19:00', '19:30', '20:00', '20:30', '21:00', '21:30',
];

const occasions = ['None', 'Birthday', 'Anniversary', 'Corporate Dinner', 'Date Night', 'Celebration'];

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '11px 14px',
  border: '1px solid var(--dark-border)',
  borderRadius: '6px',
  background: 'var(--dark-surface)',
  color: 'var(--text-primary)',
  fontSize: '0.9rem',
  outline: 'none',
  transition: 'border-color 0.2s, background 0.2s',
  fontFamily: 'var(--font-sans)',
  boxSizing: 'border-box',
};

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: '0.72rem',
  fontWeight: 600,
  letterSpacing: '0.06em',
  textTransform: 'uppercase',
  color: 'var(--text-secondary)',
  marginBottom: '6px',
  fontFamily: 'var(--font-sans)',
};

const errorStyle: React.CSSProperties = {
  fontSize: '0.75rem',
  color: 'var(--red-bright)',
  marginTop: '4px',
};

export default function ReservationsPage() {
  const [submitted, setSubmitted] = useState(false);
  const [bookingRef, setBookingRef] = useState('');
  const [formData, setFormData] = useState<ReservationFormInputs | null>(null);
  const addReservation = useRestaurantStore((state) => state.addReservation);
  const isMobile = useIsMobile();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ReservationFormInputs>({
    resolver: zodResolver(reservationSchema),
    defaultValues: { guests: '2', occasion: 'None', requests: '' },
  });

  const onSubmit = async (data: ReservationFormInputs) => {
    try {
      const ref = addReservation({
        name: data.name,
        phone: data.phone,
        email: data.email,
        date: data.date,
        time: data.time,
        guests: parseInt(data.guests, 10),
        occasion: data.occasion || 'None',
        requests: data.requests || '',
      });
      setFormData(data);
      setBookingRef(ref);
      setSubmitted(true);
      toast.success('Table reserved successfully!');
    } catch {
      toast.error('Booking failed. Please try again.');
    }
  };

  const handleReset = () => {
    reset();
    setSubmitted(false);
    setBookingRef('');
    setFormData(null);
  };

  return (
    <div className="page-wrapper" style={{ background: 'var(--black)', color: 'var(--text-primary)', position: 'relative' }}>

      {/* Watercolor background */}
      <div style={{
        position: 'fixed',
        inset: 0,
        backgroundImage: "url('/reservations-watercolor-bg.png')",
        backgroundSize: 'cover',
        backgroundPosition: 'center right',
        backgroundRepeat: 'no-repeat',
        opacity: 0.35,
        pointerEvents: 'none',
        zIndex: 0,
      }} />

      {/* Page Header */}
      <div style={{
        background: 'var(--dark-card)',
        borderBottom: '1px solid var(--dark-border)',
        padding: '64px 24px 48px',
        textAlign: 'center',
        position: 'relative',
        zIndex: 1,
        backdropFilter: 'blur(2px)',
      }}>
        <div style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: '12px', fontFamily: 'var(--font-sans)' }}>
          Reserve a Table
        </div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2rem, 5vw, 2.8rem)', fontWeight: 300, color: 'var(--text-primary)', margin: 0 }}>
          Book Your Experience
        </h1>
        <p style={{ fontFamily: 'var(--font-serif)', color: 'var(--text-muted)', fontSize: '1rem', marginTop: '12px', fontStyle: 'italic' }}>
          Reservations open 30 days in advance &middot; Tables held for 15 minutes
        </p>
      </div>

      {/* Content */}
      <div style={{ maxWidth: '960px', margin: '0 auto', padding: '56px 24px 80px', position: 'relative', zIndex: 1 }}>
        <AnimatePresence mode="wait">
          {submitted && formData ? (
            /* Success State */
            <motion.div
              key="success"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.4 }}
              style={{
                background: 'var(--dark-card)',
                border: '1px solid var(--dark-border)',
                borderRadius: '12px',
                padding: '56px 40px',
                textAlign: 'center',
                maxWidth: '500px',
                margin: '0 auto',
                boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
              }}
            >
              <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'var(--gold-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
                <CheckCircle size={26} color="var(--green)" />
              </div>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', fontWeight: 300, color: 'var(--text-primary)', margin: '0 0 6px' }}>
                Booking Confirmed
              </h2>
              <p style={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.18em', color: 'var(--gold)', textTransform: 'uppercase', marginBottom: '32px', fontFamily: 'var(--font-sans)' }}>
                Ref #{bookingRef}
              </p>

              <div style={{ borderTop: '1px solid var(--dark-border)', paddingTop: '24px', marginBottom: '32px', textAlign: 'left' }}>
                {[
                  ['Name', formData.name],
                  ['Date', formData.date],
                  ['Time', formData.time],
                  ['Guests', `${formData.guests} ${parseInt(formData.guests) === 1 ? 'Guest' : 'Guests'}`],
                  ['Occasion', formData.occasion || 'None'],
                ].map(([label, value]) => (
                  <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--dark-border)' }}>
                    <span style={{ fontSize: '0.72rem', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--text-muted)', fontFamily: 'var(--font-sans)' }}>{label}</span>
                    <span style={{ fontSize: '0.9rem', color: 'var(--text-primary)', fontFamily: 'var(--font-serif)' }}>{value}</span>
                  </div>
                ))}
              </div>

              <p style={{ fontFamily: 'var(--font-serif)', color: 'var(--text-muted)', fontSize: '0.88rem', fontStyle: 'italic', marginBottom: '28px' }}>
                A confirmation has been sent to <strong style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{formData.email}</strong>.
              </p>

              <button
                onClick={handleReset}
                className="res-btn-primary"
                style={{
                  width: '100%', padding: '13px',
                  background: 'var(--gold)', color: 'var(--on-dark)',
                  border: 'none', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700,
                  letterSpacing: '0.15em', textTransform: 'uppercase', cursor: 'pointer',
                  fontFamily: 'var(--font-sans)', transition: 'opacity 0.2s',
                }}
              >
                Make Another Booking
              </button>
            </motion.div>

          ) : (
            /* Form State */
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.4 }}
              style={{
                display: 'grid',
                gridTemplateColumns: isMobile ? '1fr' : 'minmax(0,1fr) 260px',
                gap: '28px',
                alignItems: 'start',
              }}
              className="res-outer"
            >
              {/* Form Card */}
              <div style={{ background: 'var(--dark-card)', borderRadius: '12px', border: '1px solid var(--dark-border)', padding: '36px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem', fontWeight: 400, color: 'var(--text-primary)', margin: '0 0 28px' }}>
                  Your Details
                </h2>

                <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                  {/* Name */}
                  <div>
                    <label style={labelStyle}>Full Name *</label>
                    <input type="text" placeholder="Your full name" style={inputStyle} {...register('name')}
                      onFocus={e => (e.currentTarget.style.borderColor = 'var(--gold)')}
                      onBlur={e => (e.currentTarget.style.borderColor = 'var(--dark-border)')}
                    />
                    {errors.name && <p style={errorStyle}>{errors.name.message}</p>}
                  </div>

                  {/* Phone + Email */}
                  <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '14px' }}>
                    <div>
                      <label style={labelStyle}>Phone *</label>
                      <input type="tel" placeholder="Contact number" style={inputStyle} {...register('phone')}
                        onFocus={e => (e.currentTarget.style.borderColor = 'var(--gold)')}
                        onBlur={e => (e.currentTarget.style.borderColor = 'var(--dark-border)')}
                      />
                      {errors.phone && <p style={errorStyle}>{errors.phone.message}</p>}
                    </div>
                    <div>
                      <label style={labelStyle}>Email *</label>
                      <input type="email" placeholder="you@example.com" style={inputStyle} {...register('email')}
                        onFocus={e => (e.currentTarget.style.borderColor = 'var(--gold)')}
                        onBlur={e => (e.currentTarget.style.borderColor = 'var(--dark-border)')}
                      />
                      {errors.email && <p style={errorStyle}>{errors.email.message}</p>}
                    </div>
                  </div>

                  {/* Date + Time */}
                  <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '14px' }}>
                    <div>
                      <label style={labelStyle}>Date *</label>
                      <input type="date" min={new Date().toISOString().split('T')[0]} style={inputStyle} {...register('date')}
                        onFocus={e => (e.currentTarget.style.borderColor = 'var(--gold)')}
                        onBlur={e => (e.currentTarget.style.borderColor = 'var(--dark-border)')}
                      />
                      {errors.date && <p style={errorStyle}>{errors.date.message}</p>}
                    </div>
                    <div>
                      <label style={labelStyle}>Time *</label>
                      <select style={inputStyle} {...register('time')}
                        onFocus={e => (e.currentTarget.style.borderColor = 'var(--gold)')}
                        onBlur={e => (e.currentTarget.style.borderColor = 'var(--dark-border)')}
                      >
                        <option value="">Choose slot</option>
                        {timeSlots.map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                      {errors.time && <p style={errorStyle}>{errors.time.message}</p>}
                    </div>
                  </div>

                  {/* Guests + Occasion */}
                  <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '14px' }}>
                    <div>
                      <label style={labelStyle}>Guests *</label>
                      <select style={inputStyle} {...register('guests')}
                        onFocus={e => (e.currentTarget.style.borderColor = 'var(--gold)')}
                        onBlur={e => (e.currentTarget.style.borderColor = 'var(--dark-border)')}
                      >
                        {[1,2,3,4,5,6,7,8].map(n => (
                          <option key={n} value={n.toString()}>{n} {n === 1 ? 'Guest' : 'Guests'}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label style={labelStyle}>Occasion</label>
                      <select style={inputStyle} {...register('occasion')}
                        onFocus={e => (e.currentTarget.style.borderColor = 'var(--gold)')}
                        onBlur={e => (e.currentTarget.style.borderColor = 'var(--dark-border)')}
                      >
                        {occasions.map(o => <option key={o} value={o}>{o}</option>)}
                      </select>
                    </div>
                  </div>

                  {/* Special Requests */}
                  <div>
                    <label style={labelStyle}>Special Requests</label>
                    <textarea
                      placeholder="Dietary restrictions, accessibility needs, or anything else..."
                      rows={3}
                      style={{ ...inputStyle, resize: 'vertical' }}
                      {...register('requests')}
                      onFocus={e => (e.currentTarget.style.borderColor = 'var(--gold)')}
                      onBlur={e => (e.currentTarget.style.borderColor = 'var(--dark-border)')}
                    />
                  </div>

                  {/* Submit */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="res-btn-primary"
                    style={{
                      width: '100%', padding: '14px',
                      background: 'var(--gold)',
                      color: 'var(--on-dark)', border: 'none', borderRadius: '6px',
                      fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.15em',
                      textTransform: 'uppercase', cursor: isSubmitting ? 'not-allowed' : 'pointer',
                      fontFamily: 'var(--font-sans)', opacity: isSubmitting ? 0.7 : 1,
                      transition: 'opacity 0.2s',
                    }}
                  >
                    {isSubmitting ? 'Confirming…' : 'Confirm Reservation'}
                  </button>
                </form>
              </div>

              {/* Sidebar */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {/* Policies */}
                <div style={{ background: 'var(--dark-card)', borderRadius: '12px', border: '1px solid var(--dark-border)', padding: '28px', boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
                  <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', fontWeight: 400, color: 'var(--text-primary)', margin: '0 0 18px' }}>
                    Good to Know
                  </h3>
                  {[
                    ['Cancellation', 'Free cancellation up to 24 hours prior.'],
                    ['Grace Period', 'Tables held for 15 minutes.'],
                    ['Large Groups', 'Parties of 8+ please call us directly.'],
                    ['Hours', 'Lunch: 12–14:00 · Dinner: 18–21:30'],
                  ].map(([title, desc]) => (
                    <div key={title} style={{ borderBottom: '1px solid var(--dark-border)', paddingBottom: '12px', marginBottom: '12px' }}>
                      <div style={{ fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--text-secondary)', marginBottom: '3px', fontFamily: 'var(--font-sans)' }}>{title}</div>
                      <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.5, fontFamily: 'var(--font-serif)', fontStyle: 'italic' }}>{desc}</div>
                    </div>
                  ))}
                </div>

                {/* Contact card */}
                <div style={{ background: 'var(--panel-dark)', borderRadius: '12px', padding: '28px' }}>
                  <div style={{ fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: '8px', fontFamily: 'var(--font-sans)' }}>
                    Need Help?
                  </div>
                  <p style={{ fontFamily: 'var(--font-serif)', color: 'var(--on-dark-muted)', fontSize: '0.85rem', fontStyle: 'italic', lineHeight: 1.6, margin: '0 0 16px' }}>
                    Our team can help with special arrangements.
                  </p>
                  <a
                    href="tel:+441234567890"
                    style={{
                      display: 'block', textAlign: 'center', padding: '11px',
                      background: 'var(--gold-muted)', border: '1px solid var(--dark-border-2)',
                      borderRadius: '6px', color: 'var(--gold)', fontSize: '0.72rem',
                      fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase',
                      textDecoration: 'none', fontFamily: 'var(--font-sans)',
                    }}
                  >
                    Call Us
                  </a>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <style>{`
        @media (max-width: 720px) {
          .res-outer { grid-template-columns: 1fr !important; }
        }
        .res-btn-primary:hover {
          opacity: 0.88;
        }
      `}</style>
    </div>
  );
}
