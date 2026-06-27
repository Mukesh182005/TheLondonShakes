'use client';

import React, { useState } from 'react';
import { useCMSStore } from '@/store/restaurantStore';
import { Save, RefreshCw, ChefHat, MapPin, Phone, Mail, Clock, AlertCircle } from 'lucide-react';

const INPUT_STYLE: React.CSSProperties = {
  width: '100%', padding: '10px 14px',
  background: 'var(--dark-surface)', border: '1px solid var(--dark-border)',
  color: 'var(--cream)', fontFamily: 'var(--font-sans)', fontSize: '0.85rem',
  outline: 'none', boxSizing: 'border-box',
};
const LABEL: React.CSSProperties = {
  display: 'block', fontFamily: 'var(--font-sans)', fontSize: '0.62rem',
  fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase',
  color: 'var(--text-secondary)', marginBottom: '6px',
};
const SECTION_TITLE: React.CSSProperties = {
  fontFamily: 'var(--font-display)', fontSize: '1.15rem', color: 'var(--cream)', marginBottom: '20px',
  paddingBottom: '12px', borderBottom: '1px solid var(--dark-border)',
};

export default function SettingsPage() {
  const restaurantInfo    = useCMSStore((s) => s.restaurantInfo);
  const chef              = useCMSStore((s) => s.chef);
  const updateRestaurantInfo = useCMSStore((s) => s.updateRestaurantInfo);
  const updateChefInfo       = useCMSStore((s) => s.updateChefInfo);

  // Local form state — restaurant
  const [info, setInfo] = useState({ ...restaurantInfo });
  // Flatten contact/location for easier editing
  const [contact, setContact] = useState({ ...restaurantInfo.contact });
  const [location, setLocation] = useState({ ...restaurantInfo.location });
  const [hours, setHours] = useState(restaurantInfo.hours[0] || { days: 'Mon–Sun', lunch: '11:00', dinner: '22:00' });

  // Local form state — chef
  const [chefInfo, setChefInfo] = useState({ ...chef });

  const [saved, setSaved] = useState(false);
  const [tab, setTab]     = useState<'restaurant' | 'chef' | 'payments'>('restaurant');

  const handleSave = () => {
    updateRestaurantInfo({
      ...info,
      contact,
      location,
      hours: [hours],
    });
    updateChefInfo(chefInfo);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const tabs = [
    { id: 'restaurant', label: 'Restaurant Info', icon: <MapPin size={14} /> },
    { id: 'chef',       label: 'Chef & About',    icon: <ChefHat size={14} /> },
    { id: 'payments',   label: 'Payment Details', icon: <AlertCircle size={14} /> },
  ] as const;

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '28px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', color: 'var(--cream)', marginBottom: '4px' }}>Site Settings</h1>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Changes here update the live website immediately</p>
        </div>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          {saved && (
            <span style={{ fontSize: '0.72rem', color: '#10b981', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <RefreshCw size={12} /> Saved!
            </span>
          )}
          <button
            onClick={handleSave}
            style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              padding: '10px 20px', background: 'var(--gold)', border: 'none',
              color: 'var(--black)', fontFamily: 'var(--font-sans)', fontSize: '0.72rem',
              fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', cursor: 'pointer',
            }}
          >
            <Save size={14} /> Save All
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '4px', borderBottom: '1px solid var(--dark-border)', marginBottom: '28px' }}>
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              padding: '10px 18px', background: 'transparent', border: 'none',
              borderBottom: tab === t.id ? '2px solid var(--gold)' : '2px solid transparent',
              color: tab === t.id ? 'var(--gold)' : 'var(--text-secondary)',
              fontFamily: 'var(--font-sans)', fontSize: '0.72rem', fontWeight: 600,
              letterSpacing: '0.1em', textTransform: 'uppercase', cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
          >
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* ── RESTAURANT INFO TAB ───────────────────────────────────────── */}
      {tab === 'restaurant' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>

          {/* Basic Info */}
          <div style={{ background: 'var(--dark-card)', border: '1px solid var(--dark-border)', padding: '28px' }}>
            <h3 style={SECTION_TITLE}><MapPin size={14} style={{ display: 'inline', marginRight: '8px' }} />Basic Information</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={LABEL}>Restaurant Name</label>
                  <input style={INPUT_STYLE} value={info.name} onChange={(e) => setInfo((f) => ({ ...f, name: e.target.value }))} />
                </div>
                <div>
                  <label style={LABEL}>Founded Year</label>
                  <input style={INPUT_STYLE} value={info.founded} onChange={(e) => setInfo((f) => ({ ...f, founded: e.target.value }))} />
                </div>
              </div>
              <div>
                <label style={LABEL}>Tagline</label>
                <input style={INPUT_STYLE} value={info.tagline} onChange={(e) => setInfo((f) => ({ ...f, tagline: e.target.value }))} />
              </div>
              <div>
                <label style={LABEL}>Description</label>
                <textarea style={{ ...INPUT_STYLE, minHeight: '90px', resize: 'vertical' }} value={info.description} onChange={(e) => setInfo((f) => ({ ...f, description: e.target.value }))} />
              </div>
            </div>
          </div>

          {/* Location */}
          <div style={{ background: 'var(--dark-card)', border: '1px solid var(--dark-border)', padding: '28px' }}>
            <h3 style={SECTION_TITLE}><MapPin size={14} style={{ display: 'inline', marginRight: '8px' }} />Location</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={LABEL}>Street Address</label>
                <input style={INPUT_STYLE} value={location.address} onChange={(e) => setLocation((f) => ({ ...f, address: e.target.value }))} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={LABEL}>City</label>
                  <input style={INPUT_STYLE} value={location.city} onChange={(e) => setLocation((f) => ({ ...f, city: e.target.value }))} />
                </div>
                <div>
                  <label style={LABEL}>Postcode</label>
                  <input style={INPUT_STYLE} value={location.postcode} onChange={(e) => setLocation((f) => ({ ...f, postcode: e.target.value }))} />
                </div>
                <div>
                  <label style={LABEL}>Full Address (display)</label>
                  <input style={INPUT_STYLE} value={location.fullAddress} onChange={(e) => setLocation((f) => ({ ...f, fullAddress: e.target.value }))} />
                </div>
              </div>
            </div>
          </div>

          {/* Contact */}
          <div style={{ background: 'var(--dark-card)', border: '1px solid var(--dark-border)', padding: '28px' }}>
            <h3 style={SECTION_TITLE}><Phone size={14} style={{ display: 'inline', marginRight: '8px' }} />Contact Details</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={LABEL}><Phone size={12} style={{ display: 'inline', marginRight: '4px' }} />Phone</label>
                  <input style={INPUT_STYLE} value={contact.phone} onChange={(e) => setContact((f) => ({ ...f, phone: e.target.value }))} />
                </div>
                <div>
                  <label style={LABEL}><Mail size={12} style={{ display: 'inline', marginRight: '4px' }} />Email</label>
                  <input style={INPUT_STYLE} value={contact.email} onChange={(e) => setContact((f) => ({ ...f, email: e.target.value }))} />
                </div>
              </div>
              <div>
                <label style={LABEL}>Instagram Handle</label>
                <input style={INPUT_STYLE} value={contact.instagram} onChange={(e) => setContact((f) => ({ ...f, instagram: e.target.value }))} />
              </div>
            </div>
          </div>

          {/* Hours */}
          <div style={{ background: 'var(--dark-card)', border: '1px solid var(--dark-border)', padding: '28px' }}>
            <h3 style={SECTION_TITLE}><Clock size={14} style={{ display: 'inline', marginRight: '8px' }} />Opening Hours</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
              <div>
                <label style={LABEL}>Days</label>
                <input style={INPUT_STYLE} value={hours.days} onChange={(e) => setHours((f) => ({ ...f, days: e.target.value }))} placeholder="e.g. Monday — Sunday" />
              </div>
              <div>
                <label style={LABEL}>Opening Time</label>
                <input style={INPUT_STYLE} value={hours.lunch} onChange={(e) => setHours((f) => ({ ...f, lunch: e.target.value }))} placeholder="e.g. 11:00" />
              </div>
              <div>
                <label style={LABEL}>Closing Time</label>
                <input style={INPUT_STYLE} value={hours.dinner} onChange={(e) => setHours((f) => ({ ...f, dinner: e.target.value }))} placeholder="e.g. 22:00" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── CHEF & ABOUT TAB ─────────────────────────────────────────── */}
      {tab === 'chef' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          <div style={{ background: 'var(--dark-card)', border: '1px solid var(--dark-border)', padding: '28px' }}>
            <h3 style={SECTION_TITLE}><ChefHat size={14} style={{ display: 'inline', marginRight: '8px' }} />Chef Profile</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={LABEL}>Chef Name</label>
                  <input style={INPUT_STYLE} value={chefInfo.name} onChange={(e) => setChefInfo((f) => ({ ...f, name: e.target.value }))} />
                </div>
                <div>
                  <label style={LABEL}>Title / Role</label>
                  <input style={INPUT_STYLE} value={chefInfo.title} onChange={(e) => setChefInfo((f) => ({ ...f, title: e.target.value }))} />
                </div>
              </div>
              <div>
                <label style={LABEL}>Biography</label>
                <textarea style={{ ...INPUT_STYLE, minHeight: '120px', resize: 'vertical' }} value={chefInfo.bio} onChange={(e) => setChefInfo((f) => ({ ...f, bio: e.target.value }))} />
              </div>
              <div>
                <label style={LABEL}>Philosophy / Quote</label>
                <textarea style={{ ...INPUT_STYLE, minHeight: '80px', resize: 'vertical' }} value={chefInfo.philosophy} onChange={(e) => setChefInfo((f) => ({ ...f, philosophy: e.target.value }))} />
              </div>
              <div>
                <label style={LABEL}>Education / Training (one per line)</label>
                <textarea
                  style={{ ...INPUT_STYLE, minHeight: '80px', resize: 'vertical' }}
                  value={chefInfo.education.join('\n')}
                  onChange={(e) => setChefInfo((f) => ({ ...f, education: e.target.value.split('\n').filter(Boolean) }))}
                />
              </div>
              <div>
                <label style={LABEL}>Signature Dishes (one per line)</label>
                <textarea
                  style={{ ...INPUT_STYLE, minHeight: '80px', resize: 'vertical' }}
                  value={chefInfo.signature.join('\n')}
                  onChange={(e) => setChefInfo((f) => ({ ...f, signature: e.target.value.split('\n').filter(Boolean) }))}
                />
              </div>
              <div>
                <label style={LABEL}>Media Features (comma separated)</label>
                <input
                  style={INPUT_STYLE}
                  value={chefInfo.media.join(', ')}
                  onChange={(e) => setChefInfo((f) => ({ ...f, media: e.target.value.split(',').map((s) => s.trim()).filter(Boolean) }))}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── PAYMENTS TAB ─────────────────────────────────────────────── */}
      {tab === 'payments' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          <div style={{ background: 'var(--dark-card)', border: '1px solid var(--dark-border)', padding: '28px' }}>
            <h3 style={SECTION_TITLE}>UPI / Payment Info</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={LABEL}>UPI ID</label>
                  <input style={INPUT_STYLE}
                    value={info.paymentInfo?.upiId || ''}
                    onChange={(e) => setInfo((f) => ({ ...f, paymentInfo: { ...f.paymentInfo, upiId: e.target.value } }))}
                  />
                </div>
                <div>
                  <label style={LABEL}>Account Holder Name</label>
                  <input style={INPUT_STYLE}
                    value={info.paymentInfo?.accountHolder || ''}
                    onChange={(e) => setInfo((f) => ({ ...f, paymentInfo: { ...f.paymentInfo, accountHolder: e.target.value } }))}
                  />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={LABEL}>Bank Name</label>
                  <input style={INPUT_STYLE}
                    value={info.paymentInfo?.bankName || ''}
                    onChange={(e) => setInfo((f) => ({ ...f, paymentInfo: { ...f.paymentInfo, bankName: e.target.value } }))}
                  />
                </div>
                <div>
                  <label style={LABEL}>Account Number</label>
                  <input style={INPUT_STYLE}
                    value={info.paymentInfo?.accountNumber || ''}
                    onChange={(e) => setInfo((f) => ({ ...f, paymentInfo: { ...f.paymentInfo, accountNumber: e.target.value } }))}
                  />
                </div>
                <div>
                  <label style={LABEL}>IFSC Code</label>
                  <input style={INPUT_STYLE}
                    value={info.paymentInfo?.ifscCode || ''}
                    onChange={(e) => setInfo((f) => ({ ...f, paymentInfo: { ...f.paymentInfo, ifscCode: e.target.value } }))}
                  />
                </div>
              </div>
              <div>
                <label style={LABEL}>Payment Instructions</label>
                <textarea
                  style={{ ...INPUT_STYLE, minHeight: '80px', resize: 'vertical' }}
                  value={info.paymentInfo?.instructions || ''}
                  onChange={(e) => setInfo((f) => ({ ...f, paymentInfo: { ...f.paymentInfo, instructions: e.target.value } }))}
                />
              </div>
            </div>
          </div>

          <div style={{ padding: '16px 20px', background: 'rgba(197,168,92,0.06)', border: '1px solid rgba(197,168,92,0.2)', display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
            <AlertCircle size={16} color="var(--gold)" style={{ flexShrink: 0, marginTop: '2px' }} />
            <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              Payment details are used on the Order page for UPI payment instructions shown to customers. Changes take effect immediately on save.
            </p>
          </div>
        </div>
      )}

      {/* Save Button (bottom) */}
      <div style={{ marginTop: '32px', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
        {saved && (
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#10b981', fontSize: '0.78rem' }}>
            <RefreshCw size={13} /> Changes saved successfully
          </span>
        )}
        <button
          onClick={handleSave}
          style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            padding: '12px 28px', background: 'var(--gold)', border: 'none',
            color: 'var(--black)', fontFamily: 'var(--font-sans)', fontSize: '0.72rem',
            fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', cursor: 'pointer',
          }}
        >
          <Save size={14} /> Save All Changes
        </button>
      </div>
    </div>
  );
}
