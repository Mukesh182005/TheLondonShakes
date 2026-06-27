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
  email: z.string().email({ message: 'Please provide a valid email address.' }),
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
      <div className="page-wrapper" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: 'var(--black)' }}>
        <div style={{ textAlign: 'center', padding: '60px var(--container-px)', maxWidth: '600px' }}>
          <div 
            style={{ 
              width: '80px', 
              height: '80px', 
              background: 'linear-gradient(135deg, var(--gold-dark), var(--gold))', 
              borderRadius: '50%', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              margin: '0 auto 32px' 
            }}
          >
            <CheckCircle size={36} color="var(--black)" />
          </div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '2.5rem', color: 'var(--gold)', marginBottom: '12px' }}>
            Reservation Confirmed
          </h2>
          <div style={{ fontFamily: 'var(--font-sans)', color: 'var(--text-secondary)', fontSize: '0.8rem', letterSpacing: '0.2em', marginBottom: '32px' }}>
            BOOKING REFERENCE: #{bookingRef}
          </div>
          
          <div style={{ background: '#0d0d0d', border: '1px solid rgba(201,168,76,0.15)', padding: '32px', textAlign: 'left', marginBottom: '32px' }}>
            {[['Guest Name', selectedValues.name], 
              ['Date', selectedValues.date], 
              ['Time Slot', selectedValues.time], 
              ['Guests Count', `${selectedValues.guests} Guests`], 
              ['Occasion', selectedValues.occasion || 'None']
             ].map(([label, val]) => (
              <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--dark-border-2)' }}>
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>{label}</span>
                <span style={{ color: 'var(--cream)', fontSize: '0.84rem', fontWeight: 600 }}>{val}</span>
              </div>
            ))}
            {selectedValues.requests && (
              <div style={{ marginTop: '16px', background: 'var(--black)', padding: '12px', border: '1px solid var(--dark-border)' }}>
                <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--gold)', marginBottom: '4px' }}>
                  Special Requests
                </div>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', fontStyle: 'italic', lineHeight: 1.5 }}>
                  &ldquo;{selectedValues.requests}&rdquo;
                </p>
              </div>
            )}
          </div>
          
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', marginBottom: '32px', fontFamily: 'var(--font-serif)', lineHeight: 1.6 }}>
            A confirmation email containing your digital reservation pass has been dispatched to <strong style={{ color: 'var(--gold)' }}>{selectedValues.email}</strong>.
          </p>
          
          <button className="btn-gold" onClick={handleReset}>
            <span>Make Another Booking</span>
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
          background: 'linear-gradient(180deg, #0f0a04 0%, var(--dark-bg) 100%)', 
          padding: '80px 0 60px', 
          textAlign: 'center',
          borderBottom: '1px solid rgba(201, 168, 76, 0.08)'
        }}
      >
        <div className="container">
          <div className="section-eyebrow" style={{ justifyContent: 'center' }}>Secure Your Spot</div>
          <h1 className="section-title">Reserve a <em>Table</em></h1>
          <div className="gold-divider" />
          <p style={{ fontFamily: 'var(--font-serif)', fontSize: '1.1rem', color: 'var(--text-secondary)', maxWidth: '600px', margin: '16px auto 0', lineHeight: 1.6 }}>
            Join us for an evening of exceptional culinary craft. Reservations open 30 days in advance.
          </p>
        </div>
      </div>

      {/* Main Reservation Flow */}
      <div style={{ padding: '80px 0 120px' }}>
        <div className="container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
            {/* Reservation Form */}
            <div>
              <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Name */}
                  <div className="md:col-span-2">
                    <label className="form-label">Full Name *</label>
                    <input 
                      type="text" 
                      placeholder="Your full name"
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
                      {...register('date')}
                    />
                    {errors.date && <span className="text-red-500 text-xs mt-1">{errors.date.message}</span>}
                  </div>

                  {/* Time Slot */}
                  <div>
                    <label className="form-label">Select Time *</label>
                    <select {...register('time')}>
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
                    <select {...register('guests')}>
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
                    <select {...register('occasion')}>
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
                      style={{ resize: 'vertical' }}
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
              <div style={{ background: '#0d0d0d', border: '1px solid rgba(201,168,76,0.15)', padding: '40px' }}>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', color: 'var(--gold)', marginBottom: '32px' }}>
                  Dining Policies
                </h3>
                
                {[
                  { Icon: CalendarIcon, title: 'Cancellation Policy', desc: 'Complimentary cancellations up to 24 hours prior to booking.' },
                  { Icon: Clock, title: 'Grace Period', desc: 'Tables are held for 15 minutes past the reserved arrival time.' },
                  { Icon: Users, title: 'Group Requests', desc: 'For parties larger than 8, please contact our private events team.' },
                  { Icon: MessageSquare, title: 'Cellar Experience', desc: 'Request our Sommelier-hosted cellar table in your special comments.' }
                ].map(({ Icon, title, desc }) => (
                  <div key={title} style={{ display: 'flex', gap: '16px', marginBottom: '24px', paddingBottom: '24px', borderBottom: '1px solid var(--dark-border-2)' }}>
                    <div style={{ width: '40px', height: '40px', background: '#111', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Icon size={16} color="var(--gold)" />
                    </div>
                    <div>
                      <div style={{ fontFamily: 'var(--font-sans)', fontWeight: 600, color: 'var(--cream)', fontSize: '0.85rem', marginBottom: '4px' }}>
                        {title}
                      </div>
                      <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', lineHeight: 1.5 }}>
                        {desc}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Special Accent Panel */}
              <div 
                style={{ 
                  background: 'linear-gradient(135deg, #1c1003, #0a0a0a)', 
                  border: '1px solid rgba(201,168,76,0.3)', 
                  padding: '32px' 
                }}
              >
                <Gift size={24} color="var(--gold)" style={{ marginBottom: '16px' }} />
                <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', color: 'var(--cream)', marginBottom: '12px' }}>
                  Gastronomy Membership
                </h4>
                <p style={{ fontFamily: 'var(--font-serif)', color: 'var(--text-secondary)', lineHeight: 1.8, fontSize: '0.92rem' }}>
                  Sign in or create an account before reserving to earn double dining tier points on your reservations. Accumulated points unlock secret tasting seats.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
