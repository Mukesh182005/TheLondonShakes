'use client';

import React from 'react';
import Link from 'next/link';
import { useCMSStore, useIsMounted } from '@/store/restaurantStore';
import { upcomingEvents as initialUpcomingEvents } from '@/data/restaurantData';
import { Calendar, Clock, Users, ArrowRight, Sparkles, Music, Star } from 'lucide-react';

// Map event types to specific icons for extra visual polish
const getEventIcon = (type: string) => {
  switch (type) {
    case 'music': return <Music size={18} color="var(--gold)" />;
    case 'waffles': return <Sparkles size={18} color="var(--gold)" />;
    default: return <Star size={18} color="var(--gold)" />;
  }
};

export default function EventsPage() {
  const storeUpcomingEvents = useCMSStore((state) => state.upcomingEvents);
  const isMounted = useIsMounted();

  const upcomingEvents = isMounted ? storeUpcomingEvents : initialUpcomingEvents;

  return (
    <div className="page-wrapper" style={{ background: 'var(--black)', color: 'var(--text-primary)', minHeight: '100vh', position: 'relative', overflow: 'hidden' }}>
      {/* Full-page 3D Electrifying Background Illustration */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          backgroundImage: 'url(/events-bg.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          opacity: 0.15,
          pointerEvents: 'none',
          zIndex: 0,
          mixBlendMode: 'luminosity',
        }}
      />
      {/* Vignette overlay to keep edges dark */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          background: 'radial-gradient(ellipse at center, transparent 30%, rgba(0,0,0,0.75) 100%)',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />

      {/* Hero Header */}
      <div
        style={{
          background: 'transparent',
          padding: '90px 0 60px',
          textAlign: 'center',
          borderBottom: '1px solid rgba(201, 168, 76, 0.08)',
          position: 'relative',
          zIndex: 1
        }}
      >
        <div className="container">
          <div className="section-eyebrow" style={{ justifyContent: 'center' }}>
            <Sparkles size={12} style={{ marginRight: '6px' }} /> Culinary Experiences
          </div>
          <h1 className="section-title">Upcoming <em>Events</em></h1>
          <div className="gold-divider" />
          <p style={{ fontFamily: 'var(--font-serif)', fontSize: '1.1rem', color: 'var(--text-secondary)', maxWidth: '600px', margin: '16px auto 0', lineHeight: 1.6 }}>
            Join us for curated culinary gatherings, weekly acoustic sessions, and exclusive food festivals at The London Shakes.
          </p>
        </div>
      </div>

      {/* Events Grid Section */}
      <div className="container" style={{ padding: '80px var(--container-px)', position: 'relative', zIndex: 1 }}>
        {upcomingEvents.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 0', border: '1px dashed var(--dark-border)' }}>
            <Calendar size={48} style={{ color: 'var(--text-secondary)', opacity: 0.3, marginBottom: '16px' }} />
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', color: 'var(--cream)', marginBottom: '8px' }}>
              No Scheduled Events
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '24px' }}>
              Check back soon for new workshops, tasting sessions, and acoustic lineups.
            </p>
            <Link href="/" className="btn-gold">
              <span>Back to Home</span>
            </Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '40px', maxWidth: '900px', margin: '0 auto' }}>
            {upcomingEvents.map((evt) => (
              <div
                key={evt.id}
                style={{
                  background: 'var(--dark-bg)',
                  border: '1px solid var(--dark-border)',
                  borderRadius: '1px',
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'all 0.4s ease',
                  position: 'relative'
                }}
                className="event-card-hover"
              >
                {/* Event Image Banner */}
                {evt.image && (
                  <div style={{ position: 'relative', height: '240px', overflow: 'hidden' }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={evt.image}
                      alt={evt.title}
                      style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                    />
                    {/* Gradient overlay from bottom */}
                    <div style={{
                      position: 'absolute', inset: 0,
                      background: 'linear-gradient(to bottom, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.65) 100%)',
                    }} />
                    {/* Event type badge on image */}
                    <div style={{
                      position: 'absolute', top: '16px', left: '16px',
                      display: 'flex', alignItems: 'center', gap: '6px',
                      background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(8px)',
                      border: '1px solid rgba(201,168,76,0.3)',
                      padding: '6px 12px',
                    }}>
                      {getEventIcon(evt.type || '')}
                      <span style={{ fontSize: '0.65rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--gold)', fontWeight: 600 }}>
                        {evt.subtitle || 'Special Event'}
                      </span>
                    </div>
                    {/* Price badge on image */}
                    <div style={{
                      position: 'absolute', top: '16px', right: '16px',
                      background: 'rgba(201,168,76,0.15)', backdropFilter: 'blur(8px)',
                      border: '1px solid rgba(201,168,76,0.4)',
                      padding: '6px 14px',
                      fontSize: '0.75rem', fontWeight: 700, color: 'var(--gold)',
                      letterSpacing: '0.05em',
                    }}>
                      {evt.price}
                    </div>
                  </div>
                )}

                {/* Accent Line */}
                <div style={{
                  height: '3px',
                  background: evt.gradient || 'linear-gradient(90deg, var(--gold-dark), var(--gold))',
                  width: '100%'
                }} />

                <div style={{ padding: '32px 40px', display: 'flex', flexWrap: 'wrap', gap: '32px', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  {/* Left Column: Details */}
                  <div style={{ flex: '1 1 400px' }}>
                    <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', color: 'var(--cream)', marginBottom: '10px', fontWeight: 500 }}>
                      {evt.title}
                    </h2>

                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: '24px', fontFamily: 'var(--font-serif)' }}>
                      {evt.description}
                    </p>

                    {/* Metadata Grid */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '16px', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '20px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <Calendar size={15} color="var(--gold-dark)" />
                        <div>
                          <div style={{ fontSize: '0.62rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Date</div>
                          <div style={{ fontSize: '0.82rem', color: 'var(--cream)' }}>{evt.date}</div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <Clock size={15} color="var(--gold-dark)" />
                        <div>
                          <div style={{ fontSize: '0.62rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Time</div>
                          <div style={{ fontSize: '0.82rem', color: 'var(--cream)' }}>{evt.time}</div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <Users size={15} color="var(--gold-dark)" />
                        <div>
                          <div style={{ fontSize: '0.62rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Capacity</div>
                          <div style={{ fontSize: '0.82rem', color: 'var(--cream)' }}>{evt.capacity || 'Limited Space'}</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Actions */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', minWidth: '180px', alignSelf: 'stretch', justifyContent: 'center' }}>
                    <Link href="/reservations" className="btn-gold" style={{ textAlign: 'center' }}>
                      <span>Book Table</span>
                    </Link>
                    <Link href="/contact" className="btn-ghost" style={{ textAlign: 'center', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                      <span>Inquire Details</span>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Private Events Banner Callout */}
      <div
        style={{
          background: 'transparent',
          borderTop: '1px solid var(--dark-border)',
          padding: '80px 0',
          textAlign: 'center',
          position: 'relative',
          zIndex: 1
        }}
      >
        <div className="container" style={{ maxWidth: '700px' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', color: 'var(--gold)', marginBottom: '16px' }}>
            Planning a Private Event?
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.94rem', lineHeight: 1.7, marginBottom: '32px', fontFamily: 'var(--font-serif)' }}>
            We host bespoke corporate lunches, private anniversary dinners, and milestone parties tailored to your specific preferences. Connect with our dedicated events coordinator to curate your custom menu.
          </p>
          <Link href="/private-events" className="btn-gold">
            <span>Explore Private Dining <ArrowRight size={13} style={{ marginLeft: '6px' }} /></span>
          </Link>
        </div>
      </div>

      <style jsx>{`
        .event-card-hover:hover {
          transform: translateY(-4px);
          border-color: rgba(201, 168, 76, 0.25) !important;
          box-shadow: 0 10px 30px rgba(0,0,0,0.5);
        }
      `}</style>
    </div>
  );
}
