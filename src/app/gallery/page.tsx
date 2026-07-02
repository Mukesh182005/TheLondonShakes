'use client';

import React, { useState } from 'react';
import { X, Image as ImageIcon, Upload } from 'lucide-react';
import { useCMSStore, useIsMounted } from '@/store/restaurantStore';
import type { GalleryItem } from '@/store/restaurantStore';

const categories = [
  { id: 'all',      label: 'All Media' },
  { id: 'food',     label: 'Food & Shakes' },
  { id: 'interior', label: 'Interior' },
  { id: 'kitchen',  label: 'The Kitchen' },
  { id: 'events',   label: 'Private Events' },
  { id: 'team',     label: 'Our Team' },
];

export default function GalleryPage() {
  const storeGalleryItems = useCMSStore((s) => s.galleryItems);
  const isMounted = useIsMounted();
  
  const galleryItems = isMounted ? storeGalleryItems : [];

  const [activeCat, setActiveCat]       = useState('all');
  const [lightboxItem, setLightboxItem] = useState<GalleryItem | null>(null);

  const filteredItems = activeCat === 'all'
    ? galleryItems
    : galleryItems.filter((item) => item.category === activeCat);

  return (
    <div className="page-wrapper" style={{ background: 'var(--black)', color: 'var(--text-primary)', position: 'relative', overflow: 'hidden' }}>
      {/* Background Image Layer */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundImage: "url('/london-gallery-bg.jpg')",
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
            padding: '80px 0 60px',
            textAlign: 'center',
            borderBottom: '1px solid var(--dark-border)',
          }}
        >
          <div className="container">
            <div className="section-eyebrow" style={{ justifyContent: 'center' }}>Visual Moments</div>
            <h1 className="section-title" style={{ color: 'var(--cream)' }}>The Media <em>Gallery</em></h1>
            <div className="gold-divider" />
          </div>
        </div>

      {/* Media Filter Tabs */}
      <div style={{ background: 'var(--charcoal)', borderBottom: '1px solid var(--dark-border)', padding: '12px 0' }}>
        <div className="container flex justify-start md:justify-center overflow-x-auto gap-2 py-2">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCat(cat.id)}
              className={`menu-tab ${activeCat === cat.id ? 'active' : ''}`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Gallery Grid */}
      <div style={{ padding: '80px 0 120px' }}>
        <div className="container">
          {filteredItems.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--text-secondary)' }}>
              <Upload size={36} style={{ opacity: 0.3, margin: '0 auto 16px' }} />
              <p style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', marginBottom: '8px' }}>No photos in this category yet</p>
              <p style={{ fontSize: '0.8rem' }}>The admin can add photos from the Gallery Manager.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredItems.map((item) => (
                <div
                  key={item.id}
                  onClick={() => setLightboxItem(item)}
                  style={{
                    background: item.image ? 'transparent' : item.gradient,
                    border: '1px solid var(--dark-border)',
                    aspectRatio: '1.4',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    position: 'relative',
                    overflow: 'hidden',
                  }}
                  className="group food-photo"
                >
                  {item.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={item.image}
                      alt={item.title}
                      style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                    />
                  ) : (
                    <div
                      style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', color: 'var(--gold)', opacity: 0.4 }}
                      className="group-hover:opacity-100 transition-opacity duration-300"
                    >
                      <ImageIcon size={28} />
                      <span style={{ fontSize: '0.62rem', letterSpacing: '0.15em', textTransform: 'uppercase' }}>View Photo</span>
                    </div>
                  )}

                  {/* Hover Overlay */}
                  <div
                    style={{
                      position: 'absolute',
                      inset: 0,
                      background: 'linear-gradient(0deg, rgba(28,24,21,0.95) 0%, rgba(28,24,21,0.3) 60%, transparent 100%)',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'flex-end',
                      padding: '24px',
                      opacity: 0,
                      transition: 'opacity 0.3s ease',
                    }}
                    className="group-hover:opacity-100"
                  >
                    <span style={{ fontSize: '0.62rem', color: 'var(--gold)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '4px' }}>
                      {item.category.toUpperCase()}
                    </span>
                    <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', color: 'var(--on-dark)' }}>
                      {item.title}
                    </h4>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Lightbox Modal */}
      {lightboxItem && (
        <div
          style={{
            position: 'fixed', inset: 0, zIndex: 1200,
            background: 'rgba(0, 0, 0, 0.95)',
            backdropFilter: 'blur(10px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '24px',
          }}
        >
          <div onClick={() => setLightboxItem(null)} style={{ position: 'absolute', inset: 0 }} />

          <div
            style={{
              maxWidth: '900px', width: '100%',
              background: 'var(--black)', border: '1px solid rgba(201, 168, 76, 0.2)',
              position: 'relative', zIndex: 2,
              animation: 'scaleIn 0.3s ease-out',
            }}
          >
            {/* Close Button */}
            <button
              onClick={() => setLightboxItem(null)}
              style={{
                position: 'absolute', top: '-48px', right: '0',
                background: 'none', border: 'none', color: 'var(--on-dark)',
                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px',
              }}
              className="hover:text-gold transition-colors"
            >
              <X size={18} />
              <span style={{ fontSize: '0.72rem', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Close</span>
            </button>

            {/* Image Area */}
            <div
              style={{
                height: 'min(500px, 65vh)',
                background: lightboxItem.image ? '#000' : lightboxItem.gradient,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                position: 'relative', overflow: 'hidden',
              }}
              className="food-photo"
            >
              {lightboxItem.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={lightboxItem.image}
                  alt={lightboxItem.title}
                  style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                />
              ) : (
                <span style={{ fontSize: '4rem', filter: 'drop-shadow(0 15px 30px rgba(0,0,0,0.6))' }}>🖼️</span>
              )}
            </div>

            {/* Caption */}
            <div style={{ padding: '32px', background: 'var(--black)', borderTop: '1px solid var(--dark-border)' }}>
              <span style={{ fontSize: '0.62rem', color: 'var(--gold)', letterSpacing: '0.15em', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>
                {lightboxItem.category} — Media Entry
              </span>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', color: 'var(--cream)', marginBottom: '12px' }}>
                {lightboxItem.title}
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.86rem', lineHeight: 1.7 }}>
                {lightboxItem.desc}
              </p>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.95); }
          to   { opacity: 1; transform: scale(1); }
        }
      `}</style>
      </div>
    </div>
  );
}
