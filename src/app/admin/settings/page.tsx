'use client';

import React, { useState, useEffect } from 'react';
import { useCMSStore, useRestaurantStore, useIsMounted } from '@/store/restaurantStore';
import ImageUploader from '@/components/ImageUploader';
import { Save, RefreshCw, ChefHat, MapPin, Phone, Mail, Clock, AlertCircle, Power, Globe, Server, Terminal, ShieldAlert, Sparkles, Image as ImageIcon, ShoppingBag } from 'lucide-react';

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
  const homepageData      = useCMSStore((s) => s.homepageData);
  const updateRestaurantInfo = useCMSStore((s) => s.updateRestaurantInfo);
  const updateChefInfo       = useCMSStore((s) => s.updateChefInfo);
  const updateHomepageData   = useCMSStore((s) => s.updateHomepageData);
  const menuCategories       = useCMSStore((s) => s.menuCategories);
  const updateMenuCategory   = useCMSStore((s) => s.updateMenuCategory);
  const clearOrders          = useRestaurantStore((s) => s.clearOrders);
  const isMounted            = useIsMounted();

  // Sync states with Zustand store data on client mount/hydration
  useEffect(() => {
    if (isMounted) {
      setInfo({ ...restaurantInfo });
      setContact({ ...restaurantInfo.contact });
      setLocation({ ...restaurantInfo.location });
      setHours(restaurantInfo.hours[0] || { days: 'Mon–Sun', lunch: '11:00', dinner: '22:00' });
      setChefInfo({ ...chef });
      setHomepage({ ...homepageData });
      setCategories([...menuCategories]);
    }
  }, [isMounted, restaurantInfo, chef, homepageData, menuCategories]);



  // Local form state — restaurant
  const [info, setInfo] = useState({ ...restaurantInfo });
  // Flatten contact/location for easier editing
  const [contact, setContact] = useState({ ...restaurantInfo.contact });
  const [location, setLocation] = useState({ ...restaurantInfo.location });
  const [hours, setHours] = useState(restaurantInfo.hours[0] || { days: 'Mon–Sun', lunch: '11:00', dinner: '22:00' });

  // Local form state — chef
  const [chefInfo, setChefInfo] = useState({ ...chef });

  // Local form state — homepage content
  const [homepage, setHomepage] = useState({ ...homepageData });

  // Local form state — categories gutter images
  const [categories, setCategories] = useState([...menuCategories]);

  const [saved, setSaved] = useState(false);
  const [tab, setTab]     = useState<'restaurant' | 'chef' | 'homepage' | 'payments' | 'server' | 'gutters'>('restaurant');
  const maintenanceMode = useCMSStore((s) => s.maintenanceMode);
  const setMaintenanceMode = useCMSStore((s) => s.setMaintenanceMode);
  const acceptingOrders = useCMSStore((s) => s.acceptingOrders);
  const setAcceptingOrders = useCMSStore((s) => s.setAcceptingOrders);

  useEffect(() => {
    // Sync cookie with Zustand store state on load
    document.cookie = `tls_maintenance=${maintenanceMode}; path=/; max-age=31536000; SameSite=Lax`;
  }, [maintenanceMode]);

  const toggleMaintenance = () => {
    const nextVal = !maintenanceMode;
    setMaintenanceMode(nextVal);
    document.cookie = `tls_maintenance=${nextVal}; path=/; max-age=31536000; SameSite=Lax`;
  };

  const handleSave = () => {
    updateRestaurantInfo({
      ...info,
      contact,
      location,
      hours: [hours],
    });
    updateChefInfo(chefInfo);
    updateHomepageData(homepage);
    categories.forEach((cat) => {
      updateMenuCategory(cat.id, cat);
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const tabs = [
    { id: 'restaurant', label: 'Restaurant Info', icon: <MapPin size={14} /> },
    { id: 'chef',       label: 'Chef & About',    icon: <ChefHat size={14} /> },
    { id: 'homepage',   label: 'Homepage Content', icon: <Globe size={14} /> },
    { id: 'payments',   label: 'Payment Details', icon: <AlertCircle size={14} /> },
    { id: 'gutters',    label: 'Menu Gutter Images', icon: <ImageIcon size={14} /> },
    { id: 'server',     label: 'Server Control',  icon: <Power size={14} /> },
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
          {tab !== 'server' && (
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
          )}
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '4px', borderBottom: '1px solid var(--dark-border)', marginBottom: '28px', overflowX: 'auto', paddingBottom: '4px' }}>
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
              whiteSpace: 'nowrap',
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
          {/* About Page Banner Image */}
          <div style={{ background: 'var(--dark-card)', border: '1px solid var(--dark-border)', padding: '28px' }}>
            <h3 style={SECTION_TITLE}><ImageIcon size={14} style={{ display: 'inline', marginRight: '8px' }} />About Page Story Image</h3>
            <ImageUploader
              label="Story Banner Image (replaces the 🥤 cup emoji)"
              value={info.aboutImage || ''}
              aspectRatio="3/4"
              onChange={(dataUrl) => setInfo((f) => ({ ...f, aboutImage: dataUrl }))}
            />
          </div>

          {/* Chef Profile */}
          <div style={{ background: 'var(--dark-card)', border: '1px solid var(--dark-border)', padding: '28px' }}>
            <h3 style={SECTION_TITLE}><ChefHat size={14} style={{ display: 'inline', marginRight: '8px' }} />Chef Profile</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <ImageUploader
                label="Chef Portrait Image (replaces the 👨‍🍳 chef emoji)"
                value={chefInfo.image || ''}
                aspectRatio="28/32"
                onChange={(dataUrl) => setChefInfo((f) => ({ ...f, image: dataUrl }))}
              />
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

      {/* ── HOMEPAGE CONTENT TAB ──────────────────────────────────────── */}
      {tab === 'homepage' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          {/* Hero Section */}
          <div style={{ background: 'var(--dark-card)', border: '1px solid var(--dark-border)', padding: '28px' }}>
            <h3 style={SECTION_TITLE}><Globe size={14} style={{ display: 'inline', marginRight: '8px' }} />Hero Header</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <ImageUploader
                label="Hero Background Image"
                value={homepage.heroBgImage}
                aspectRatio="21/9"
                onChange={(dataUrl) => setHomepage((f) => ({ ...f, heroBgImage: dataUrl }))}
              />
              <div>
                <label style={LABEL}>Hero Eyebrow / Sub-Header</label>
                <input
                  style={INPUT_STYLE}
                  value={homepage.heroEyebrow}
                  onChange={(e) => setHomepage((f) => ({ ...f, heroEyebrow: e.target.value }))}
                  placeholder="e.g. Silchar • Est. 2021"
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={LABEL}>Hero Title Line 1</label>
                  <input
                    style={INPUT_STYLE}
                    value={homepage.heroTitleLine1}
                    onChange={(e) => setHomepage((f) => ({ ...f, heroTitleLine1: e.target.value }))}
                  />
                </div>
                <div>
                  <label style={LABEL}>Hero Title Line 2</label>
                  <input
                    style={INPUT_STYLE}
                    value={homepage.heroTitleLine2}
                    onChange={(e) => setHomepage((f) => ({ ...f, heroTitleLine2: e.target.value }))}
                  />
                </div>
                <div>
                  <label style={LABEL}>Hero Title Italic</label>
                  <input
                    style={INPUT_STYLE}
                    value={homepage.heroTitleItalic}
                    onChange={(e) => setHomepage((f) => ({ ...f, heroTitleItalic: e.target.value }))}
                  />
                </div>
              </div>
              <div>
                <label style={LABEL}>Hero Tagline / Description</label>
                <input
                  style={INPUT_STYLE}
                  value={homepage.heroTagline}
                  onChange={(e) => setHomepage((f) => ({ ...f, heroTagline: e.target.value }))}
                />
              </div>
            </div>
          </div>


          {/* About Space / Quotes Section */}
          <div style={{ background: 'var(--dark-card)', border: '1px solid var(--dark-border)', padding: '28px' }}>
            <h3 style={SECTION_TITLE}><Sparkles size={14} style={{ display: 'inline', marginRight: '8px' }} />About space quote</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <ImageUploader
                label="About Section Background Image"
                value={homepage.aboutBgImage}
                aspectRatio="21/9"
                onChange={(dataUrl) => setHomepage((f) => ({ ...f, aboutBgImage: dataUrl }))}
              />
              <div>
                <label style={LABEL}>Quote Eyebrow</label>
                <input
                  style={INPUT_STYLE}
                  value={homepage.aboutEyebrow}
                  onChange={(e) => setHomepage((f) => ({ ...f, aboutEyebrow: e.target.value }))}
                />
              </div>
              <div>
                <label style={LABEL}>Quote / Founder Philosophy</label>
                <textarea
                  style={{ ...INPUT_STYLE, minHeight: '80px', resize: 'vertical' }}
                  value={homepage.aboutQuote}
                  onChange={(e) => setHomepage((f) => ({ ...f, aboutQuote: e.target.value }))}
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

      {/* ── MENU GUTTER IMAGES TAB ────────────────────────────────────── */}
      {tab === 'gutters' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          <div style={{ background: 'var(--dark-card)', border: '1px solid var(--dark-border)', padding: '28px' }}>
            <h3 style={SECTION_TITLE}><ImageIcon size={14} style={{ display: 'inline', marginRight: '8px' }} />Menu Page Gutter Images</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '24px', lineHeight: 1.5 }}>
              Upload custom, colorful food/drink images for the left and right gutters of each menu category. If left empty, the site will automatically display premium defaults. Use high-contrast colorful graphics that pop on dark screens!
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
              {categories.map((cat, idx) => (
                <div key={cat.id} style={{ borderBottom: idx < categories.length - 1 ? '1px dashed var(--dark-border)' : 'none', paddingBottom: '32px' }}>
                  <h4 style={{ fontFamily: 'var(--font-sans)', fontSize: '0.9rem', color: 'var(--gold)', fontWeight: 600, marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    {cat.label}
                  </h4>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
                    {/* Left Top */}
                    <div>
                      <label style={LABEL}>Left Top Image</label>
                      <ImageUploader
                        value={cat.gutterImageLeftTop || ''}
                        onChange={(val) => {
                          setCategories(prev => prev.map(c => c.id === cat.id ? { ...c, gutterImageLeftTop: val } : c));
                        }}
                      />
                    </div>

                    {/* Left Bottom */}
                    <div>
                      <label style={LABEL}>Left Bottom Image</label>
                      <ImageUploader
                        value={cat.gutterImageLeftBottom || ''}
                        onChange={(val) => {
                          setCategories(prev => prev.map(c => c.id === cat.id ? { ...c, gutterImageLeftBottom: val } : c));
                        }}
                      />
                    </div>

                    {/* Right Top */}
                    <div>
                      <label style={LABEL}>Right Top Image</label>
                      <ImageUploader
                        value={cat.gutterImageRightTop || ''}
                        onChange={(val) => {
                          setCategories(prev => prev.map(c => c.id === cat.id ? { ...c, gutterImageRightTop: val } : c));
                        }}
                      />
                    </div>

                    {/* Right Bottom */}
                    <div>
                      <label style={LABEL}>Right Bottom Image</label>
                      <ImageUploader
                        value={cat.gutterImageRightBottom || ''}
                        onChange={(val) => {
                          setCategories(prev => prev.map(c => c.id === cat.id ? { ...c, gutterImageRightBottom: val } : c));
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── SERVER CONTROL TAB ────────────────────────────────────────── */}
      {tab === 'server' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          {/* Main Status Toggle Card */}
          <div style={{ background: 'var(--dark-card)', border: '1px solid var(--dark-border)', padding: '36px 28px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '24px', marginBottom: '24px' }}>
              <div>
                <h3 style={{ ...SECTION_TITLE, borderBottom: 'none', marginBottom: '8px', paddingBottom: 0 }}>
                  <Server size={16} style={{ display: 'inline', marginRight: '8px', verticalAlign: 'middle' }} />
                  Server Core & Services
                </h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', maxWidth: '480px', lineHeight: 1.5 }}>
                  Control the online accessibility of the restaurant website and customer ordering systems.
                </p>
              </div>

              {/* Status Glow Pill */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                padding: '8px 16px',
                background: maintenanceMode ? 'rgba(239,68,68,0.06)' : 'rgba(16,185,129,0.06)',
                border: `1px solid ${maintenanceMode ? 'rgba(239,68,68,0.25)' : 'rgba(16,185,129,0.25)'}`,
              }}>
                <div style={{
                  width: '8px', height: '8px', borderRadius: '50%',
                  background: maintenanceMode ? '#ef4444' : '#10b981',
                  boxShadow: `0 0 10px ${maintenanceMode ? 'rgba(239,68,68,0.5)' : 'rgba(16,185,129,0.5)'}`,
                  animation: 'pulse 2s infinite',
                }} />
                <span style={{ fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: maintenanceMode ? '#ef4444' : '#10b981' }}>
                  {maintenanceMode ? 'OFFLINE (MAINTENANCE)' : 'ONLINE (LIVE)'}
                </span>
              </div>
            </div>

            {/* Giant Action Button */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyItems: 'center', padding: '24px 0', borderTop: '1px solid var(--dark-border)', borderBottom: '1px solid var(--dark-border)', margin: '12px 0' }}>
              <button
                onClick={toggleMaintenance}
                style={{
                  display: 'flex', alignItems: 'center', gap: '12px',
                  padding: '16px 36px',
                  background: maintenanceMode ? '#10b981' : '#ef4444',
                  border: 'none',
                  color: '#ffffff',
                  fontFamily: 'var(--font-sans)',
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  cursor: 'pointer',
                  boxShadow: maintenanceMode ? '0 8px 24px rgba(16,185,129,0.25)' : '0 8px 24px rgba(239,68,68,0.25)',
                  transition: 'all 0.3s ease',
                }}
              >
                <Power size={18} />
                {maintenanceMode ? 'Start Server (Go Live)' : 'Stop Server (Take Offline)'}
              </button>

              <p style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '16px', fontStyle: 'italic' }}>
                * Toggling server status takes effect instantly across all active customer sessions.
              </p>
            </div>

            {/* Warnings / Explanations */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginTop: '24px' }}>
              <div style={{ padding: '16px', background: 'rgba(255,255,255,0.01)', border: '1px solid var(--dark-border)' }}>
                <h4 style={{ fontSize: '0.8rem', color: 'var(--cream)', fontWeight: 600, marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Globe size={14} color="var(--gold)" /> Public Restaurant Website
                </h4>
                <ul style={{ paddingLeft: '16px', margin: 0, fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                  <li>{maintenanceMode ? 'Public sees the offline / maintenance page.' : 'Public can view menus, events, chef about page, and location.'}</li>
                  <li>{maintenanceMode ? 'Customer ordering and checkout are disabled.' : 'Customers can place orders, select table dine-in, or delivery.'}</li>
                  <li>{maintenanceMode ? 'Table booking / reservations are blocked.' : 'Table reservations form is live and interactive.'}</li>
                </ul>
              </div>

              <div style={{ padding: '16px', background: 'rgba(255,255,255,0.01)', border: '1px solid var(--dark-border)' }}>
                <h4 style={{ fontSize: '0.8rem', color: 'var(--cream)', fontWeight: 600, marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <ShieldAlert size={14} color="var(--gold)" /> Administrator Dashboard
                </h4>
                <ul style={{ paddingLeft: '16px', margin: 0, fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                  <li>Admin and Staff portals remain fully operational.</li>
                  <li>You can still edit the menu, change gallery images, and view orders.</li>
                  <li>Live preview remains accessible via the &quot;Preview Site&quot; button.</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Customer Ordering Status Toggle Card */}
          <div style={{ background: 'var(--dark-card)', border: '1px solid var(--dark-border)', padding: '28px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '24px', marginBottom: '24px' }}>
              <div>
                <h3 style={{ ...SECTION_TITLE, borderBottom: 'none', marginBottom: '8px', paddingBottom: 0 }}>
                  <ShoppingBag size={16} style={{ display: 'inline', marginRight: '8px', verticalAlign: 'middle' }} />
                  Order Taking Status
                </h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', maxWidth: '480px', lineHeight: 1.5 }}>
                  Temporarily pause or resume customer ordering operations. When paused, customers will see a message: <strong>&quot;We are not taking orders at this time&quot;</strong> and will not be able to place new orders.
                </p>
              </div>

              {/* Status Glow Pill */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                padding: '8px 16px',
                background: acceptingOrders ? 'rgba(16,185,129,0.06)' : 'rgba(239,68,68,0.06)',
                border: `1px solid ${acceptingOrders ? 'rgba(16,185,129,0.25)' : 'rgba(239,68,68,0.25)'}`,
              }}>
                <div style={{
                  width: '8px', height: '8px', borderRadius: '50%',
                  background: acceptingOrders ? '#10b981' : '#ef4444',
                  boxShadow: `0 0 10px ${acceptingOrders ? 'rgba(16,185,129,0.5)' : 'rgba(239,68,68,0.5)'}`,
                }} />
                <span style={{ fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: acceptingOrders ? '#10b981' : '#ef4444' }}>
                  {acceptingOrders ? 'ACCEPTING ORDERS' : 'PAUSED (STOPPED)'}
                </span>
              </div>
            </div>

            {/* Giant Action Button for Ordering */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyItems: 'center', padding: '24px 0', borderTop: '1px solid var(--dark-border)', margin: '12px 0 0 0' }}>
              <button
                onClick={() => setAcceptingOrders(!acceptingOrders)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '12px',
                  padding: '16px 36px',
                  background: acceptingOrders ? '#ef4444' : '#10b981',
                  border: 'none',
                  color: '#ffffff',
                  fontFamily: 'var(--font-sans)',
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  cursor: 'pointer',
                  boxShadow: acceptingOrders ? '0 8px 24px rgba(239,68,68,0.25)' : '0 8px 24px rgba(16,185,129,0.25)',
                  transition: 'all 0.3s ease',
                }}
              >
                <Power size={18} />
                {acceptingOrders ? 'Stop Taking Orders' : 'Start Taking Orders'}
              </button>

              <p style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '16px', fontStyle: 'italic' }}>
                * Pausing orders will immediately display a banner to customers and prevent checkouts.
              </p>
            </div>
          </div>

          {/* System Console Output Simulation */}
          <div style={{ background: '#0a0a0c', border: '1px solid var(--dark-border)', borderRadius: '4px', overflow: 'hidden' }}>
            <div style={{ background: '#121216', padding: '10px 16px', borderBottom: '1px solid var(--dark-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.7rem', color: 'var(--cream)', fontFamily: 'monospace', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Terminal size={13} color="var(--gold)" /> system-console --status
              </span>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981' }} />
            </div>
            <div style={{ padding: '16px', fontFamily: 'monospace', fontSize: '0.75rem', color: '#a1a1aa', lineHeight: 1.6 }}>
              <div>[SYSTEM] Fetching cluster details...</div>
              <div>[SYSTEM] Node.js version: v20.11.0</div>
              <div>[SYSTEM] Host: localhost:3000</div>
              <div>[SYSTEM] SSL Status: self-signed/developer</div>
              <div style={{ color: maintenanceMode ? '#ef4444' : '#10b981' }}>
                [ROUTER] Server traffic mode: {maintenanceMode ? 'MAINTENANCE_REDIRECT_ALL' : 'PASS_THROUGH_ACTIVE'}
              </div>
              <div style={{ color: 'var(--gold)' }}>
                [COOKIE] client_tls_maintenance_flag = {String(maintenanceMode)}
              </div>
            </div>
          </div>

          {/* Database Clean & Orders Reset */}
          <div style={{ background: 'var(--dark-card)', border: '1px solid var(--dark-border)', padding: '28px' }}>
            <h3 style={SECTION_TITLE}><ShieldAlert size={14} style={{ display: 'inline', marginRight: '8px' }} />Database Clean</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                You can reset and clear the live orders data (active and historical orders) to start fresh. This action cannot be undone.
              </p>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  onClick={() => {
                    if (window.confirm('Are you sure you want to delete ALL orders? This will clear all current active, preparing, delivered, and cancelled order data from the system.')) {
                      clearOrders();
                      useCMSStore.getState().resetTables();

                      // Directly and synchronously modify local storage to bypass any Zustand debounce lag
                      try {
                        const localData = localStorage.getItem('thelondon-restaurant-store');
                        if (localData) {
                          const parsed = JSON.parse(localData);
                          if (parsed.state) {
                            parsed.state.orders = [];
                            parsed.state.tableOrders = [];
                            parsed.state.activeOrderId = null;
                            localStorage.setItem('thelondon-restaurant-store', JSON.stringify(parsed));
                          }
                        }
                      } catch (err) {
                        console.error('Failed to sync restaurant store to localStorage:', err);
                      }

                      try {
                        const cmsData = localStorage.getItem('thelondon-cms-store');
                        if (cmsData) {
                          const parsed = JSON.parse(cmsData);
                          if (parsed.state) {
                            parsed.state.tables = [
                              { id: 't1',  number: 1,  seats: 2, status: 'available' },
                              { id: 't2',  number: 2,  seats: 4, status: 'available' },
                              { id: 't3',  number: 3,  seats: 4, status: 'available' },
                              { id: 't4',  number: 4,  seats: 6, status: 'available' },
                              { id: 't5',  number: 5,  seats: 2, status: 'available' },
                              { id: 't6',  number: 6,  seats: 4, status: 'available' },
                              { id: 't7',  number: 7,  seats: 2, status: 'available' },
                              { id: 't8',  number: 8,  seats: 8, status: 'available' },
                              { id: 't9',  number: 9,  seats: 4, status: 'available' },
                              { id: 't10', number: 10, seats: 2, status: 'available' },
                              { id: 't11', number: 11, seats: 4, status: 'available' },
                              { id: 't12', number: 12, seats: 6, status: 'available' },
                            ];
                            localStorage.setItem('thelondon-cms-store', JSON.stringify(parsed));
                          }
                        }
                      } catch (err) {
                        console.error('Failed to sync CMS store to localStorage:', err);
                      }

                      alert('All orders data has been cleared successfully.');
                      window.location.reload();
                    }
                  }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '8px',
                    padding: '12px 24px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid #ef4444',
                    color: '#ef4444', fontFamily: 'var(--font-sans)', fontSize: '0.72rem',
                    fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = '#ef4444'; (e.currentTarget as HTMLElement).style.color = '#ffffff'; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'rgba(239, 68, 68, 0.1)'; (e.currentTarget as HTMLElement).style.color = '#ef4444'; }}
                >
                  Clear All Orders
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Save Button (bottom) */}
      {tab !== 'server' && (
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
      )}
    </div>
  );
}
