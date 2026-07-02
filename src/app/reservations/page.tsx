'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRestaurantStore } from '@/store/restaurantStore';
import toast from 'react-hot-toast';
import { Calendar as CalendarIcon, Clock, Users, MessageSquare, CheckCircle, Gift } from 'lucide-react';

const reservationSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  phone: z.string().min(10, { message: 'Please provide a valid 10+ digit contact number.' }),
  email: z.email({ message: 'Please provide a valid email address.' }),
  date: z.string().min(1, { message: 'Please select a date.' }),
  time: z.string().min(1, { message: 'Please select a time slot.' }),
  guests: z.string().min(1, { message: 'Please select guest count.' }),
  occasion: z.string().optional(),
  requests: z.string().optional(),
});

type ReservationFormInputs = z.infer<typeof reservationSchema>;

const timeSlots = [
  '12:00', '12:30', '13:00', '13:30', '14:00', // Lunch
  '18:00', '18:30', '19:00', '19:30', '20:00', '20:30', '21:00', '21:30' // Dinner
];

const occasions = ['None', 'Birthday', 'Anniversary', 'Corporate Dinner', 'Date Night', 'Celebration'];

export default function ReservationsPage() {
  const [submitted, setSubmitted] = useState(false);
  const [bookingRef, setBookingRef] = useState('');
  const addReservation = useRestaurantStore((state) => state.addReservation);
  
  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isSubmitting }
  } = useForm<ReservationFormInputs>({
    resolver: zodResolver(reservationSchema),
    defaultValues: {
      guests: '2',
      occasion: 'None',
      requests: '',
    }
  });

  const selectedValues = watch();

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
  };

  if (submitted) {
    return (
      <div className="page-wrapper" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: 'var(--black)', padding: '40px 20px', position: 'relative', overflow: 'hidden' }}>
        {/* Background Image Layer */}
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: "url('/london-reservations-bg.jpg')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          opacity: 0.3,
          pointerEvents: 'none',
          zIndex: 0,
        }} />

        {/* Ticket Wrapper */}
        <div style={{ 
          background: 'var(--dark-card)', 
          border: '1px solid rgba(197, 168, 92, 0.25)', 
          padding: '48px 36px', 
          maxWidth: '550px',
          width: '100%',
          textAlign: 'center',
          position: 'relative',
          boxShadow: '0 30px 60px rgba(0,0,0,0.6), 0 0 40px rgba(197, 168, 92, 0.05)',
          zIndex: 1,
        }}>
          {/* Internal double gold border */}
          <div style={{
            position: 'absolute',
            inset: '12px',
            border: '1px solid rgba(197, 168, 92, 0.08)',
            pointerEvents: 'none',
          }} />

          {/* Ticket notch cutouts */}
          <div style={{
            position: 'absolute',
            left: '-10px',
            top: '32%',
            width: '20px',
            height: '20px',
            borderRadius: '50%',
            background: 'var(--black)',
            borderRight: '1px solid rgba(197, 168, 92, 0.25)',
          }} />
          <div style={{
            position: 'absolute',
            right: '-10px',
            top: '32%',
            width: '20px',
            height: '20px',
            borderRadius: '50%',
            background: 'var(--black)',
            borderLeft: '1px solid rgba(197, 168, 92, 0.25)',
          }} />

          <div 
            style={{ 
              width: '64px', 
              height: '64px', 
              background: 'linear-gradient(135deg, var(--gold-dark), var(--gold))', 
              borderRadius: '50%', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              margin: '0 auto 28px',
              boxShadow: '0 0 20px rgba(197, 168, 92, 0.3)',
            }}
          >
            <CheckCircle size={28} color="var(--black)" />
          </div>

          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '2.4rem', color: 'var(--gold)', marginBottom: '8px', fontWeight: 300 }}>
            Booking Confirmed
          </h2>
          <div style={{ fontFamily: 'var(--font-sans)', color: 'var(--text-secondary)', fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.22em', marginBottom: '28px' }}>
            PASS CODE: #{bookingRef}
          </div>

          {/* Ticket Coupon Dotted Separator */}
          <div style={{
            borderTop: '1.5px dashed rgba(197, 168, 92, 0.18)',
            height: 0,
            margin: '20px -36px 28px',
          }} />
          
          <div style={{ background: 'rgba(14, 13, 11, 0.4)', border: '1px solid rgba(197,168,92,0.12)', padding: '24px', textAlign: 'left', marginBottom: '28px' }}>
            {[['GUEST NAME', selectedValues.name], 
              ['DATE', selectedValues.date], 
              ['TIME SLOT', selectedValues.time], 
              ['TABLE SIZE', `${selectedValues.guests} Guests`], 
              ['OCCASION', selectedValues.occasion || 'None']
             ].map(([label, val]) => (
              <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid rgba(197, 168, 92, 0.05)' }}>
                <span style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-sans)', fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.1em' }}>{label}</span>
                <span style={{ color: 'var(--cream)', fontFamily: 'var(--font-serif)', fontSize: '0.88rem', fontWeight: 400 }}>{val}</span>
              </div>
            ))}
            {selectedValues.requests && (
              <div style={{ marginTop: '16px', background: 'var(--black)', padding: '12px', border: '1px solid rgba(197,168,92,0.08)' }}>
                <div style={{ fontSize: '0.58rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--gold)', marginBottom: '4px' }}>
                  Special Wishes
                </div>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.78rem', fontStyle: 'italic', lineHeight: 1.5 }}>
                  &ldquo;{selectedValues.requests}&rdquo;
                </p>
              </div>
            )}
          </div>
          
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginBottom: '32px', fontFamily: 'var(--font-serif)', lineHeight: 1.6 }}>
            A digital invitation containing your table details has been dispatched to <strong style={{ color: 'var(--gold)', fontWeight: 400 }}>{selectedValues.email}</strong>.
          </p>
          
          <button className="btn-gold" onClick={handleReset} style={{ width: '100%' }}>
            <span>Make Another Booking</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="page-wrapper" style={{ background: 'var(--black)', color: 'var(--text-primary)', position: 'relative', overflow: 'hidden' }}>
      {/* Background Image Layer */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundImage: "url('/london-reservations-bg.jpg')",
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
        {/* Subtle decorative gold line */}
        <div style={{
          position: 'absolute',
          bottom: '4px',
          left: '20px',
          right: '20px',
          height: '1px',
          background: 'rgba(197, 168, 92, 0.05)',
        }} />

        <div className="container">
          <div className="eyebrow" style={{ justifyContent: 'center' }}>Secure Your Spot</div>
          <h1 className="section-title">Reserve a <em>Table</em></h1>
          <div className="gold-divider" />
          <p style={{ fontFamily: 'var(--font-serif)', fontSize: '1.1rem', color: 'var(--text-secondary)', maxWidth: '600px', margin: '16px auto 0', lineHeight: 1.6, fontStyle: 'italic' }}>
            Join us for an evening of exceptional culinary craft. Reservations open 30 days in advance.
          </p>
        </div>
      </div>

      {/* Main Reservation Flow */}
      <div style={{ padding: '80px 0 120px' }}>
        <div className="container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
            {/* Reservation Form */}
            <div style={{
              background: 'var(--dark-card)',
              border: '1px solid rgba(197, 168, 92, 0.12)',
              padding: '40px 32px',
              position: 'relative',
            }}>
              {/* Internal borders */}
              <div style={{
                position: 'absolute',
                inset: '12px',
                border: '1px solid rgba(197, 168, 92, 0.04)',
                pointerEvents: 'none',
              }} />

              <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6" style={{ position: 'relative', zIndex: 2 }}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Name */}
                  <div className="md:col-span-2">
                    <label className="form-label">Full Name *</label>
                    <input 
                      type="text" 
                      placeholder="Your full name"
                      style={{ background: 'var(--charcoal)', border: '1px solid rgba(197,168,92,0.15)' }}
                      {...register('name')}
                    />
                    {errors.name && <span className="text-red-500 text-xs mt-1">{errors.name.message}</span>}
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="form-label">Phone Number *</label>
                    <input 
                      type="tel" 
                      placeholder="Contact number"
                      style={{ background: 'var(--charcoal)', border: '1px solid rgba(197,168,92,0.15)' }}
                      {...register('phone')}
                    />
                    {errors.phone && <span className="text-red-500 text-xs mt-1">{errors.phone.message}</span>}
                  </div>

                  {/* Email */}
                  <div>
                    <label className="form-label">Email Address *</label>
                    <input 
                      type="email" 
                      placeholder="you@example.com"
                      style={{ background: 'var(--charcoal)', border: '1px solid rgba(197,168,92,0.15)' }}
                      {...register('email')}
                    />
                    {errors.email && <span className="text-red-500 text-xs mt-1">{errors.email.message}</span>}
                  </div>

                  {/* Date */}
                  <div>
                    <label className="form-label">Select Date *</label>
                    <input 
                      type="date" 
                      min={new Date().toISOString().split('T')[0]}
                      style={{ background: 'var(--charcoal)', border: '1px solid rgba(197,168,92,0.15)' }}
                      {...register('date')}
                    />
                    {errors.date && <span className="text-red-500 text-xs mt-1">{errors.date.message}</span>}
                  </div>

                  {/* Time Slot */}
                  <div>
                    <label className="form-label">Select Time *</label>
                    <select style={{ background: 'var(--charcoal)', border: '1px solid rgba(197,168,92,0.15)' }} {...register('time')}>
                      <option value="">Choose slot</option>
                      {timeSlots.map(t => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                    {errors.time && <span className="text-red-500 text-xs mt-1">{errors.time.message}</span>}
                  </div>

                  {/* Guest Count */}
                  <div>
                    <label className="form-label">Guests Count *</label>
                    <select style={{ background: 'var(--charcoal)', border: '1px solid rgba(197,168,92,0.15)' }} {...register('guests')}>
                      {[1, 2, 3, 4, 5, 6, 7, 8].map(n => (
                        <option key={n} value={n.toString()}>
                          {n} {n === 1 ? 'Guest' : 'Guests'}
                        </option>
                      ))}
                    </select>
                    {errors.guests && <span className="text-red-500 text-xs mt-1">{errors.guests.message}</span>}
                  </div>

                  {/* Occasion */}
                  <div>
                    <label className="form-label">Occasion</label>
                    <select style={{ background: 'var(--charcoal)', border: '1px solid rgba(197,168,92,0.15)' }} {...register('occasion')}>
                      {occasions.map(o => (
                        <option key={o} value={o}>{o}</option>
                      ))}
                    </select>
                  </div>

                  {/* Special Requests */}
                  <div className="md:col-span-2">
                    <label className="form-label">Special Requests / Dietary Restrictions</label>
                    <textarea 
                      placeholder="Allergen notices, accessibility requests, or celebration milestones..."
                      rows={4}
                      style={{ resize: 'vertical', background: 'var(--charcoal)', border: '1px solid rgba(197,168,92,0.15)' }}
                      {...register('requests')}
                    />
                  </div>
                </div>

                <button 
                  type="submit" 
                  className="btn-gold" 
                  disabled={isSubmitting}
                  style={{ width: '100%', marginTop: '12px' }}
                >
                  <span>{isSubmitting ? 'Confirming...' : 'Confirm Table Booking'}</span>
                </button>
              </form>
            </div>

            {/* Sidebar Details */}
            <div className="flex flex-col gap-8">
              <div style={{ background: 'var(--dark-card)', border: '1px solid rgba(197, 168, 92, 0.12)', padding: '40px 32px', position: 'relative' }}>
                {/* Internal decoration border */}
                <div style={{
                  position: 'absolute',
                  inset: '12px',
                  border: '1px solid rgba(197, 168, 92, 0.04)',
                  pointerEvents: 'none',
                }} />

                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', color: 'var(--gold)', marginBottom: '32px', fontWeight: 400, position: 'relative', zIndex: 2 }}>
                  Dining Policies
                </h3>
                
                <div style={{ position: 'relative', zIndex: 2 }}>
                  {[
                    { Icon: CalendarIcon, title: 'Cancellation Policy', desc: 'Complimentary cancellations up to 24 hours prior to booking.' },
                    { Icon: Clock, title: 'Grace Period', desc: 'Tables are held for 15 minutes past the reserved arrival time.' },
                    { Icon: Users, title: 'Group Requests', desc: 'For parties larger than 8, please contact our private events team.' },
                    { Icon: MessageSquare, title: 'Sommelier Experience', desc: 'Request our Sommelier-hosted cellar table in your special comments.' }
                  ].map(({ Icon, title, desc }) => (
                    <div key={title} style={{ display: 'flex', gap: '16px', marginBottom: '24px', paddingBottom: '24px', borderBottom: '1px solid rgba(197, 168, 92, 0.08)' }}>
                      <div style={{ width: '40px', height: '40px', background: 'rgba(197, 168, 92, 0.05)', border: '1px solid rgba(197, 168, 92, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <Icon size={16} color="var(--gold)" />
                      </div>
                      <div>
                        <div style={{ fontFamily: 'var(--font-sans)', fontWeight: 600, color: 'var(--cream)', fontSize: '0.85rem', marginBottom: '4px', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                          {title}
                        </div>
                        <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', lineHeight: 1.5, fontFamily: 'var(--font-serif)', fontStyle: 'italic' }}>
                          {desc}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Special Accent Panel */}
              <div 
                style={{ 
                  background: 'linear-gradient(135deg, var(--void) 0%, var(--black) 100%)', 
                  border: '1px solid rgba(197, 168, 92, 0.22)', 
                  padding: '36px',
                  position: 'relative'
                }}
              >
                {/* Double frame overlay */}
                <div style={{
                  position: 'absolute',
                  inset: '8px',
                  border: '1px solid rgba(197, 168, 92, 0.05)',
                  pointerEvents: 'none',
                }} />

                <div style={{ position: 'relative', zIndex: 2 }}>
                  <Gift size={24} color="var(--gold)" style={{ marginBottom: '16px' }} />
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', flexWrap: 'wrap' }}>
                    <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', color: 'var(--cream)', margin: 0, fontWeight: 400 }}>
                      Gastronomy Membership
                    </h4>
                    <span style={{ fontSize: '0.55rem', background: 'rgba(197,168,92,0.1)', color: 'var(--gold)', padding: '2px 6px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', border: '1px solid rgba(197,168,92,0.2)' }}>
                      Coming Soon
                    </span>
                  </div>
                  <p style={{ fontFamily: 'var(--font-serif)', color: 'var(--text-secondary)', lineHeight: 1.8, fontSize: '0.9rem', fontStyle: 'italic' }}>
                    Sign in or create an account before reserving to earn double dining tier points on your reservations. Accumulated points unlock secret tasting seats.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}
