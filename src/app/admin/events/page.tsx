'use client';

import React, { useState } from 'react';
import { useCMSStore, useRestaurantStore } from '@/store/restaurantStore';
import ImageUploader from '@/components/ImageUploader';
import { Plus, Pencil, Trash2, X, Check, Calendar, Clock, Tag, Users, Image as ImageIcon, Sparkles } from 'lucide-react';
import type { UpcomingEvent, PrivateEventType } from '@/data/restaurantData';

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

type EditForm = Omit<UpcomingEvent, 'id' | 'gradient'> & { id?: string; gradient?: string };

const EMPTY_FORM: EditForm = {
  title: '', subtitle: '', description: '',
  date: '', time: '', price: '', capacity: '',
  type: 'waffles', image: null,
};

const EVENT_TYPES = [
  { value: 'waffles', label: 'Waffles / Food' },
  { value: 'shakes',  label: 'Shakes / Drinks' },
  { value: 'music',   label: 'Live Music' },
  { value: 'other',   label: 'Other' },
];

// Private dining form interface
interface PrivateEditForm {
  id?: string;
  title: string;
  subtitle: string;
  description: string;
  capacity: string;
  roomsInput: string; // text lines for array
  includesInput: string; // text lines for array
  icon: string;
  image: string | null;
}

const EMPTY_PRIVATE_FORM: PrivateEditForm = {
  title: '', subtitle: '', description: '',
  capacity: '', roomsInput: '', includesInput: '',
  icon: '◈', image: null,
};

export default function AdminEventsPage() {
  const [activeTab, setActiveTab] = useState<'public' | 'private'>('public');

  // --- Public Events Hook ---
  const upcomingEvents     = useCMSStore((s) => s.upcomingEvents);
  const addUpcomingEvent   = useCMSStore((s) => s.addUpcomingEvent);
  const updateUpcomingEvent = useCMSStore((s) => s.updateUpcomingEvent);
  const deleteUpcomingEvent = useCMSStore((s) => s.deleteUpcomingEvent);
  const user                = useRestaurantStore((s) => s.user);

  const [showForm, setShowForm]     = useState(false);
  const [editingId, setEditingId]   = useState<string | null>(null);
  const [form, setForm]             = useState<EditForm>(EMPTY_FORM);
  const [confirmDel, setConfirmDel] = useState<string | null>(null);

  // --- Private Dining Packages Hook ---
  const privateEventTypes     = useCMSStore((s) => s.privateEventTypes) || [];
  const addPrivateEventType   = useCMSStore((s) => s.addPrivateEventType);
  const updatePrivateEventType = useCMSStore((s) => s.updatePrivateEventType);
  const deletePrivateEventType = useCMSStore((s) => s.deletePrivateEventType);

  const [showPrivateForm, setShowPrivateForm]     = useState(false);
  const [editingPrivateId, setEditingPrivateId]   = useState<string | null>(null);
  const [privateForm, setPrivateForm]             = useState<PrivateEditForm>(EMPTY_PRIVATE_FORM);
  const [confirmPrivateDel, setConfirmPrivateDel] = useState<string | null>(null);

  const [saved, setSaved] = useState(false);

  // --- Public Event Handlers ---
  const openAdd = () => {
    setForm({ ...EMPTY_FORM });
    setEditingId(null);
    setShowForm(true);
  };

  const openEdit = (evt: UpcomingEvent) => {
    setForm({ ...evt });
    setEditingId(evt.id);
    setShowForm(true);
  };

  const handleSave = () => {
    if (!form.title.trim()) {
      alert('Please enter an event title.');
      return;
    }
    if (!form.date.trim()) {
      alert('Please enter an event date.');
      return;
    }
    if (editingId) {
      updateUpcomingEvent(editingId, form);
      // Log edit
      fetch('/api/admin/logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'EDIT_SETTINGS',
          details: `Modified public event "${form.title}" (date: ${form.date}).`,
          adminEmail: user?.email || 'unknown@thelondon.co.uk',
        }),
      }).catch((err) => console.warn('Failed to log public event edit:', err));
    } else {
      addUpcomingEvent(form);
      // Log add
      fetch('/api/admin/logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'EDIT_SETTINGS',
          details: `Added new public event "${form.title}" (date: ${form.date}).`,
          adminEmail: user?.email || 'unknown@thelondon.co.uk',
        }),
      }).catch((err) => console.warn('Failed to log public event add:', err));
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
    setShowForm(false);
    setEditingId(null);
  };

  const handleDelete = (id: string) => {
    const item = upcomingEvents.find((e) => e.id === id);
    deleteUpcomingEvent(id);
    setConfirmDel(null);

    // Log delete
    fetch('/api/admin/logs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'EDIT_SETTINGS',
        details: `Deleted public event "${item?.title || id}".`,
        adminEmail: user?.email || 'unknown@thelondon.co.uk',
      }),
    }).catch((err) => console.warn('Failed to log public event delete:', err));
  };

  // --- Private Dining Handlers ---
  const openPrivateAdd = () => {
    setPrivateForm({ ...EMPTY_PRIVATE_FORM });
    setEditingPrivateId(null);
    setShowPrivateForm(true);
  };

  const openPrivateEdit = (pkg: PrivateEventType) => {
    setPrivateForm({
      id: pkg.id,
      title: pkg.title,
      subtitle: pkg.subtitle,
      description: pkg.description,
      capacity: pkg.capacity,
      roomsInput: (pkg.rooms || []).join('\n'),
      includesInput: (pkg.includes || []).join('\n'),
      icon: pkg.icon || '◈',
      image: pkg.image || null,
    });
    setEditingPrivateId(pkg.id);
    setShowPrivateForm(true);
  };

  const handlePrivateSave = () => {
    if (!privateForm.title.trim()) {
      alert('Please enter a package title.');
      return;
    }
    if (!privateForm.capacity.trim()) {
      alert('Please enter a package capacity.');
      return;
    }
    const rooms = privateForm.roomsInput.split('\n').map(r => r.trim()).filter(Boolean);
    const includes = privateForm.includesInput.split('\n').map(i => i.trim()).filter(Boolean);

    const data: Omit<PrivateEventType, 'id'> = {
      title: privateForm.title,
      subtitle: privateForm.subtitle,
      description: privateForm.description,
      capacity: privateForm.capacity,
      rooms,
      includes,
      icon: privateForm.icon,
      image: privateForm.image,
    };

    if (editingPrivateId) {
      updatePrivateEventType(editingPrivateId, data);
      // Log edit
      fetch('/api/admin/logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'EDIT_SETTINGS',
          details: `Modified private dining package "${privateForm.title}" (capacity: ${privateForm.capacity}).`,
          adminEmail: user?.email || 'unknown@thelondon.co.uk',
        }),
      }).catch((err) => console.warn('Failed to log private package edit:', err));
    } else {
      addPrivateEventType(data);
      // Log add
      fetch('/api/admin/logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'EDIT_SETTINGS',
          details: `Added new private dining package "${privateForm.title}" (capacity: ${privateForm.capacity}).`,
          adminEmail: user?.email || 'unknown@thelondon.co.uk',
        }),
      }).catch((err) => console.warn('Failed to log private package add:', err));
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
    setShowPrivateForm(false);
    setEditingPrivateId(null);
  };

  const handlePrivateDelete = (id: string) => {
    const item = privateEventTypes.find((p) => p.id === id);
    deletePrivateEventType(id);
    setConfirmPrivateDel(null);

    // Log delete
    fetch('/api/admin/logs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'EDIT_SETTINGS',
        details: `Deleted private dining package "${item?.title || id}".`,
        adminEmail: user?.email || 'unknown@thelondon.co.uk',
      }),
    }).catch((err) => console.warn('Failed to log private package delete:', err));
  };

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '28px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', color: 'var(--cream)', marginBottom: '4px' }}>Events Manager</h1>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
            {activeTab === 'public' 
              ? `${upcomingEvents.length} public event${upcomingEvents.length !== 1 ? 's' : ''} — add images, edit details`
              : `${privateEventTypes.length} private packages — configure zones, catering limits`}
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {saved && (
            <span style={{ fontSize: '0.72rem', color: '#10b981', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Check size={12} /> Saved!
            </span>
          )}
          {activeTab === 'public' ? (
            <button
              onClick={openAdd}
              style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                padding: '10px 20px', background: 'var(--gold)', border: 'none',
                color: 'var(--black)', fontFamily: 'var(--font-sans)', fontSize: '0.72rem',
                fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', cursor: 'pointer',
              }}
            >
              <Plus size={14} /> Add Event
            </button>
          ) : (
            <button
              onClick={openPrivateAdd}
              style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                padding: '10px 20px', background: 'var(--gold)', border: 'none',
                color: 'var(--black)', fontFamily: 'var(--font-sans)', fontSize: '0.72rem',
                fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', cursor: 'pointer',
              }}
            >
              <Plus size={14} /> Add Package
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '20px', borderBottom: '1px solid var(--dark-border)', marginBottom: '24px' }}>
        <button
          onClick={() => setActiveTab('public')}
          style={{
            padding: '12px 24px', background: 'transparent',
            border: 'none',
            borderBottom: activeTab === 'public' ? '2px solid var(--gold)' : '2px solid transparent',
            color: activeTab === 'public' ? 'var(--gold)' : 'var(--text-secondary)',
            fontFamily: 'var(--font-sans)', fontSize: '0.8rem', fontWeight: 600,
            textTransform: 'uppercase', letterSpacing: '0.08em', cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
        >
          Public Events
        </button>
        <button
          onClick={() => setActiveTab('private')}
          style={{
            padding: '12px 24px', background: 'transparent',
            border: 'none',
            borderBottom: activeTab === 'private' ? '2px solid var(--gold)' : '2px solid transparent',
            color: activeTab === 'private' ? 'var(--gold)' : 'var(--text-secondary)',
            fontFamily: 'var(--font-sans)', fontSize: '0.8rem', fontWeight: 600,
            textTransform: 'uppercase', letterSpacing: '0.08em', cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
        >
          Private Dining Packages
        </button>
      </div>

      {/* TAB CONTENT: PUBLIC EVENTS */}
      {activeTab === 'public' && (
        <>
          {upcomingEvents.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '80px 0', border: '1px dashed var(--dark-border)', color: 'var(--text-secondary)' }}>
              <Calendar size={40} style={{ opacity: 0.3, marginBottom: '12px' }} />
              <p style={{ fontSize: '0.9rem' }}>No events yet. Click "Add Event" to get started.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {upcomingEvents.map((evt) => (
                <div
                  key={evt.id}
                  style={{
                    background: 'var(--dark-card)',
                    border: '1px solid var(--dark-border)',
                    display: 'flex',
                    gap: '0',
                    overflow: 'hidden',
                    position: 'relative',
                  }}
                >
                  {/* Image Preview */}
                  <div style={{
                    width: '200px', flexShrink: 0,
                    background: '#0d0d0d',
                    position: 'relative',
                    minHeight: '140px',
                  }}>
                    {evt.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={evt.image}
                        alt={evt.title}
                        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', position: 'absolute', inset: 0 }}
                      />
                    ) : (
                      <div style={{
                        position: 'absolute', inset: 0,
                        display: 'flex', flexDirection: 'column',
                        alignItems: 'center', justifyContent: 'center', gap: '8px',
                        color: 'var(--text-secondary)',
                      }}>
                        <ImageIcon size={24} style={{ opacity: 0.3 }} />
                        <span style={{ fontSize: '0.62rem', opacity: 0.5 }}>No image</span>
                      </div>
                    )}
                    {/* Gradient type badge */}
                    <div style={{
                      position: 'absolute', bottom: 0, left: 0, right: 0,
                      padding: '4px 8px',
                      background: 'rgba(0,0,0,0.7)',
                      fontSize: '0.58rem', color: 'var(--gold)',
                      textTransform: 'uppercase', letterSpacing: '0.1em',
                      textAlign: 'center',
                    }}>
                      {evt.type}
                    </div>
                  </div>

                  {/* Event Info */}
                  <div style={{ flex: 1, padding: '20px 24px', display: 'flex', justifyContent: 'space-between', gap: '24px', flexWrap: 'wrap', alignItems: 'flex-start' }}>
                    <div style={{ flex: 1 }}>
                      <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', color: 'var(--cream)', marginBottom: '4px' }}>{evt.title}</h3>
                      <p style={{ fontSize: '0.72rem', color: 'var(--gold)', marginBottom: '10px', letterSpacing: '0.05em' }}>{evt.subtitle}</p>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '14px', maxWidth: '480px' }}>{evt.description}</p>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
                        {[
                          { Icon: Calendar, val: evt.date },
                          { Icon: Clock,    val: evt.time },
                          { Icon: Tag,      val: evt.price },
                          { Icon: Users,    val: evt.capacity },
                        ].map(({ Icon, val }) => (
                          <div key={val} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                            <Icon size={12} color="var(--gold-dark)" />
                            {val}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Actions */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flexShrink: 0 }}>
                      <button
                        onClick={() => openEdit(evt)}
                        style={{
                          display: 'flex', alignItems: 'center', gap: '6px',
                          padding: '8px 14px', background: 'transparent',
                          border: '1px solid var(--dark-border)',
                          color: 'var(--text-secondary)', fontSize: '0.72rem',
                          fontFamily: 'var(--font-sans)', cursor: 'pointer',
                          transition: 'all 0.2s ease',
                        }}
                        onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(201,168,76,0.4)'; (e.currentTarget as HTMLElement).style.color = 'var(--gold)'; }}
                        onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--dark-border)'; (e.currentTarget as HTMLElement).style.color = 'var(--text-secondary)'; }}
                      >
                        <Pencil size={12} /> Edit
                      </button>

                      {confirmDel === evt.id ? (
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <button
                            onClick={() => handleDelete(evt.id)}
                            style={{ flex: 1, padding: '8px 10px', background: '#ef4444', border: 'none', color: '#fff', fontSize: '0.66rem', fontFamily: 'var(--font-sans)', cursor: 'pointer' }}
                          >
                            Confirm
                          </button>
                          <button
                            onClick={() => setConfirmDel(null)}
                            style={{ padding: '8px 10px', background: 'transparent', border: '1px solid var(--dark-border)', color: 'var(--text-secondary)', fontSize: '0.66rem', fontFamily: 'var(--font-sans)', cursor: 'pointer' }}
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setConfirmDel(evt.id)}
                          style={{
                            display: 'flex', alignItems: 'center', gap: '6px',
                            padding: '8px 14px', background: 'transparent',
                            border: '1px solid var(--dark-border)',
                            color: 'var(--text-secondary)', fontSize: '0.72rem',
                            fontFamily: 'var(--font-sans)', cursor: 'pointer',
                            transition: 'all 0.2s ease',
                          }}
                          onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(239,68,68,0.4)'; (e.currentTarget as HTMLElement).style.color = '#ef4444'; }}
                          onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--dark-border)'; (e.currentTarget as HTMLElement).style.color = 'var(--text-secondary)'; }}
                        >
                          <Trash2 size={12} /> Delete
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* TAB CONTENT: PRIVATE DINING PACKAGES */}
      {activeTab === 'private' && (
        <>
          {privateEventTypes.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '80px 0', border: '1px dashed var(--dark-border)', color: 'var(--text-secondary)' }}>
              <Calendar size={40} style={{ opacity: 0.3, marginBottom: '12px' }} />
              <p style={{ fontSize: '0.9rem' }}>No private event packages yet. Click "Add Package" to create one.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {privateEventTypes.map((pkg) => (
                <div
                  key={pkg.id}
                  style={{
                    background: 'var(--dark-card)',
                    border: '1px solid var(--dark-border)',
                    display: 'flex',
                    gap: '0',
                    overflow: 'hidden',
                    position: 'relative',
                  }}
                >
                  {/* Image Preview */}
                  <div style={{
                    width: '200px', flexShrink: 0,
                    background: '#0d0d0d',
                    position: 'relative',
                    minHeight: '140px',
                  }}>
                    {pkg.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={pkg.image}
                        alt={pkg.title}
                        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', position: 'absolute', inset: 0 }}
                      />
                    ) : (
                      <div style={{
                        position: 'absolute', inset: 0,
                        display: 'flex', flexDirection: 'column',
                        alignItems: 'center', justifyContent: 'center', gap: '8px',
                        color: 'var(--text-secondary)',
                      }}>
                        <span style={{ fontSize: '1.5rem', color: 'var(--gold)' }}>{pkg.icon}</span>
                        <span style={{ fontSize: '0.62rem', opacity: 0.5 }}>No image</span>
                      </div>
                    )}
                  </div>

                  {/* Event Info */}
                  <div style={{ flex: 1, padding: '20px 24px', display: 'flex', justifyContent: 'space-between', gap: '24px', flexWrap: 'wrap', alignItems: 'flex-start' }}>
                    <div style={{ flex: 1 }}>
                      <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', color: 'var(--cream)', marginBottom: '4px' }}>
                        {pkg.title}
                      </h3>
                      <p style={{ fontSize: '0.72rem', color: 'var(--gold)', marginBottom: '10px', letterSpacing: '0.05em' }}>{pkg.subtitle}</p>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '14px' }}>{pkg.description}</p>
                      
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '24px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                          <Users size={12} color="var(--gold-dark)" />
                          Capacity: <strong>{pkg.capacity}</strong>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                          <Sparkles size={12} color="var(--gold-dark)" />
                          Spaces: <strong>{(pkg.rooms || []).length} zones</strong>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flexShrink: 0 }}>
                      <button
                        onClick={() => openPrivateEdit(pkg)}
                        style={{
                          display: 'flex', alignItems: 'center', gap: '6px',
                          padding: '8px 14px', background: 'transparent',
                          border: '1px solid var(--dark-border)',
                          color: 'var(--text-secondary)', fontSize: '0.72rem',
                          fontFamily: 'var(--font-sans)', cursor: 'pointer',
                          transition: 'all 0.2s ease',
                        }}
                        onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(201,168,76,0.4)'; (e.currentTarget as HTMLElement).style.color = 'var(--gold)'; }}
                        onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--dark-border)'; (e.currentTarget as HTMLElement).style.color = 'var(--text-secondary)'; }}
                      >
                        <Pencil size={12} /> Edit
                      </button>

                      {confirmPrivateDel === pkg.id ? (
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <button
                            onClick={() => handlePrivateDelete(pkg.id)}
                            style={{ flex: 1, padding: '8px 10px', background: '#ef4444', border: 'none', color: '#fff', fontSize: '0.66rem', fontFamily: 'var(--font-sans)', cursor: 'pointer' }}
                          >
                            Confirm
                          </button>
                          <button
                            onClick={() => setConfirmPrivateDel(null)}
                            style={{ padding: '8px 10px', background: 'transparent', border: '1px solid var(--dark-border)', color: 'var(--text-secondary)', fontSize: '0.66rem', fontFamily: 'var(--font-sans)', cursor: 'pointer' }}
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setConfirmPrivateDel(pkg.id)}
                          style={{
                            display: 'flex', alignItems: 'center', gap: '6px',
                            padding: '8px 14px', background: 'transparent',
                            border: '1px solid var(--dark-border)',
                            color: 'var(--text-secondary)', fontSize: '0.72rem',
                            fontFamily: 'var(--font-sans)', cursor: 'pointer',
                            transition: 'all 0.2s ease',
                          }}
                          onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(239,68,68,0.4)'; (e.currentTarget as HTMLElement).style.color = '#ef4444'; }}
                          onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--dark-border)'; (e.currentTarget as HTMLElement).style.color = 'var(--text-secondary)'; }}
                        >
                          <Trash2 size={12} /> Delete
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* MODAL: ADD / EDIT PUBLIC EVENT */}
      {showForm && (
        <div
          style={{
            position: 'fixed', inset: 0, zIndex: 1000,
            background: 'rgba(0,0,0,0.8)', display: 'flex',
            alignItems: 'center', justifyContent: 'center', padding: '24px',
          }}
          onClick={(e) => { if (e.target === e.currentTarget) setShowForm(false); }}
        >
          <div style={{
            background: 'var(--dark-card)', border: '1px solid var(--dark-border)',
            width: '100%', maxWidth: '600px', maxHeight: '92vh', overflowY: 'auto',
          }}>
            {/* Modal Header */}
            <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--dark-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem', color: 'var(--cream)' }}>
                {editingId ? 'Edit Event' : 'Add New Event'}
              </h2>
              <button onClick={() => setShowForm(false)} style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>

            {/* Form Body */}
            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <ImageUploader
                label="Event Banner Image"
                value={form.image ?? null}
                aspectRatio="16/7"
                onChange={(dataUrl) => setForm((f) => ({ ...f, image: dataUrl }))}
              />

              <div>
                <label style={LABEL}>Event Title *</label>
                <input
                  style={INPUT_STYLE} value={form.title} placeholder="e.g. Waffle Wednesday Special"
                  onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={LABEL}>Subtitle / Tagline</label>
                  <input
                    style={INPUT_STYLE} value={form.subtitle} placeholder="e.g. Live Music & Shake Grazing"
                    onChange={(e) => setForm((f) => ({ ...f, subtitle: e.target.value }))}
                  />
                </div>
                <div>
                  <label style={LABEL}>Event Type</label>
                  <select
                    style={{ ...INPUT_STYLE, appearance: 'none' }}
                    value={form.type}
                    onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}
                  >
                    {EVENT_TYPES.map((t) => (
                      <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label style={LABEL}>Description</label>
                <textarea
                  style={{ ...INPUT_STYLE, height: '90px', resize: 'vertical' }}
                  value={form.description} placeholder="Describe what makes this event special..."
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={LABEL}>Date *</label>
                  <input
                    style={INPUT_STYLE} value={form.date} placeholder="e.g. Every Friday / 15 June 2026"
                    onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
                  />
                </div>
                <div>
                  <label style={LABEL}>Time</label>
                  <input
                    style={INPUT_STYLE} value={form.time} placeholder="e.g. 7:00 PM — 9:30 PM"
                    onChange={(e) => setForm((f) => ({ ...f, time: e.target.value }))}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={LABEL}>Price / Entry</label>
                  <input
                    style={INPUT_STYLE} value={form.price} placeholder="e.g. Free Entry / ₹199 onwards"
                    onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
                  />
                </div>
                <div>
                  <label style={LABEL}>Capacity</label>
                  <input
                    style={INPUT_STYLE} value={form.capacity} placeholder="e.g. Walk-ins welcome"
                    onChange={(e) => setForm((f) => ({ ...f, capacity: e.target.value }))}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', paddingTop: '8px' }}>
                <button
                  onClick={handleSave}
                  disabled={!form.title.trim() || !form.date.trim()}
                  style={{
                    flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                    padding: '12px 24px', background: 'var(--gold)', border: 'none',
                    color: 'var(--black)', fontFamily: 'var(--font-sans)', fontSize: '0.75rem',
                    fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase',
                    cursor: form.title.trim() && form.date.trim() ? 'pointer' : 'not-allowed',
                    opacity: form.title.trim() && form.date.trim() ? 1 : 0.5,
                  }}
                >
                  <Check size={14} /> {editingId ? 'Update Event' : 'Add Event'}
                </button>
                <button
                  onClick={() => setShowForm(false)}
                  style={{
                    padding: '12px 20px', background: 'transparent', border: '1px solid var(--dark-border)',
                    color: 'var(--text-secondary)', fontFamily: 'var(--font-sans)', fontSize: '0.75rem', cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: ADD / EDIT PRIVATE DINING PACKAGE */}
      {showPrivateForm && (
        <div
          style={{
            position: 'fixed', inset: 0, zIndex: 1000,
            background: 'rgba(0,0,0,0.8)', display: 'flex',
            alignItems: 'center', justifyContent: 'center', padding: '24px',
          }}
          onClick={(e) => { if (e.target === e.currentTarget) setShowPrivateForm(false); }}
        >
          <div style={{
            background: 'var(--dark-card)', border: '1px solid var(--dark-border)',
            width: '100%', maxWidth: '600px', maxHeight: '92vh', overflowY: 'auto',
          }}>
            {/* Modal Header */}
            <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--dark-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem', color: 'var(--cream)' }}>
                {editingPrivateId ? 'Edit Private Package' : 'Add Private Package'}
              </h2>
              <button onClick={() => setShowPrivateForm(false)} style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>

            {/* Form Body */}
            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <ImageUploader
                label="Package Banner Image"
                value={privateForm.image}
                aspectRatio="16/9"
                onChange={(dataUrl) => setPrivateForm((f) => ({ ...f, image: dataUrl }))}
              />

              <div>
                <label style={LABEL}>Package Title *</label>
                <input
                  style={INPUT_STYLE} value={privateForm.title} placeholder="e.g. Group Get-Togethers"
                  onChange={(e) => setPrivateForm((f) => ({ ...f, title: e.target.value }))}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={LABEL}>Subtitle / Eyebrow</label>
                  <input
                    style={INPUT_STYLE} value={privateForm.subtitle} placeholder="e.g. Celebrate Milestones"
                    onChange={(e) => setPrivateForm((f) => ({ ...f, subtitle: e.target.value }))}
                  />
                </div>
                <div>
                  <label style={LABEL}>Max Capacity *</label>
                  <input
                    style={INPUT_STYLE} value={privateForm.capacity} placeholder="e.g. 15 — 40 guests"
                    onChange={(e) => setPrivateForm((f) => ({ ...f, capacity: e.target.value }))}
                  />
                </div>
              </div>

              <div>
                <label style={LABEL}>Description</label>
                <textarea
                  style={{ ...INPUT_STYLE, height: '80px', resize: 'vertical' }}
                  value={privateForm.description} placeholder="Describe the hosting format, food selections, and event setup..."
                  onChange={(e) => setPrivateForm((f) => ({ ...f, description: e.target.value }))}
                />
              </div>

              <div>
                <label style={LABEL}>Suitable Spaces / Rooms (one per line) *</label>
                <textarea
                  style={{ ...INPUT_STYLE, height: '85px', resize: 'vertical', fontFamily: 'monospace' }}
                  value={privateForm.roomsInput} placeholder="e.g.&#10;Main Lounge Area (30 guests)&#10;Reserved Corner Zone (15 guests)"
                  onChange={(e) => setPrivateForm((f) => ({ ...f, roomsInput: e.target.value }))}
                />
              </div>

              <div>
                <label style={LABEL}>Package Inclusions (one per line) *</label>
                <textarea
                  style={{ ...INPUT_STYLE, height: '85px', resize: 'vertical', fontFamily: 'monospace' }}
                  value={privateForm.includesInput} placeholder="e.g.&#10;Dedicated host&#10;Custom shake-and-bite menus&#10;Welcome mojitos for all guests"
                  onChange={(e) => setPrivateForm((f) => ({ ...f, includesInput: e.target.value }))}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={LABEL}>Icon Badge Symbol</label>
                  <select
                    style={{ ...INPUT_STYLE, appearance: 'none' }}
                    value={privateForm.icon}
                    onChange={(e) => setPrivateForm((f) => ({ ...f, icon: e.target.value }))}
                  >
                    {['◈', '◇', '✦', '▲', '▼', '★', '✤', '◆'].map((sym) => (
                      <option key={sym} value={sym}>{sym} Symbol</option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', paddingTop: '8px' }}>
                <button
                  onClick={handlePrivateSave}
                  disabled={!privateForm.title.trim() || !privateForm.capacity.trim()}
                  style={{
                    flex: 1, display: 'flex', alignItems: 'center', justifyItems: 'center', justifyContent: 'center', gap: '8px',
                    padding: '12px 24px', background: 'var(--gold)', border: 'none',
                    color: 'var(--black)', fontFamily: 'var(--font-sans)', fontSize: '0.75rem',
                    fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase',
                    cursor: privateForm.title.trim() && privateForm.capacity.trim() ? 'pointer' : 'not-allowed',
                    opacity: privateForm.title.trim() && privateForm.capacity.trim() ? 1 : 0.5,
                  }}
                >
                  <Check size={14} /> {editingPrivateId ? 'Update Package' : 'Add Package'}
                </button>
                <button
                  onClick={() => setShowPrivateForm(false)}
                  style={{
                    padding: '12px 20px', background: 'transparent', border: '1px solid var(--dark-border)',
                    color: 'var(--text-secondary)', fontFamily: 'var(--font-sans)', fontSize: '0.75rem', cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
