'use client';

import React, { useState } from 'react';
import { useCMSStore, GalleryItem } from '@/store/restaurantStore';
import ImageUploader from '@/components/ImageUploader';
import { Plus, Pencil, Trash2, X, Check, ChevronDown } from 'lucide-react';

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

const CATS = [
  { id: 'food',     label: 'Food' },
  { id: 'interior', label: 'Interior' },
  { id: 'kitchen',  label: 'Kitchen' },
  { id: 'events',   label: 'Events' },
  { id: 'team',     label: 'Team' },
] as const;

type EmptyForm = Omit<GalleryItem, 'id'>;

const EMPTY: EmptyForm = { category: 'food', title: '', desc: '', gradient: 'linear-gradient(135deg, #1f090d, #381219, #1f090d)', image: null };

export default function AdminGalleryPage() {
  const galleryItems       = useCMSStore((s) => s.galleryItems);
  const addGalleryItem     = useCMSStore((s) => s.addGalleryItem);
  const updateGalleryItem  = useCMSStore((s) => s.updateGalleryItem);
  const deleteGalleryItem  = useCMSStore((s) => s.deleteGalleryItem);

  const [filter, setFilter]       = useState<string>('all');
  const [showForm, setShowForm]   = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm]           = useState<EmptyForm>({ ...EMPTY });
  const [confirmDel, setConfirmDel] = useState<string | null>(null);

  const filtered = filter === 'all' ? galleryItems : galleryItems.filter((g) => g.category === filter);

  const openAdd = () => {
    setForm({ ...EMPTY });
    setEditingId(null);
    setShowForm(true);
  };

  const openEdit = (item: GalleryItem) => {
    setForm({ category: item.category, title: item.title, desc: item.desc, gradient: item.gradient, image: item.image });
    setEditingId(item.id);
    setShowForm(true);
  };

  const handleSave = () => {
    if (!form.title.trim()) return;
    if (editingId) {
      updateGalleryItem(editingId, form);
    } else {
      addGalleryItem(form);
    }
    setShowForm(false);
    setEditingId(null);
  };

  const catColor: Record<string, string> = {
    food: '#f59e0b', interior: '#3b82f6', kitchen: '#ef4444', events: '#8b5cf6', team: '#10b981',
  };

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '28px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', color: 'var(--cream)', marginBottom: '4px' }}>Gallery Manager</h1>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>{galleryItems.length} photos — {galleryItems.filter((g) => g.image).length} with uploaded images</p>
        </div>
        <button
          onClick={openAdd}
          style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            padding: '10px 20px', background: 'var(--gold)', border: 'none',
            color: 'var(--black)', fontFamily: 'var(--font-sans)', fontSize: '0.72rem',
            fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', cursor: 'pointer',
          }}
        >
          <Plus size={14} /> Add Photo
        </button>
      </div>

      {/* Category Filter */}
      <div style={{ display: 'flex', gap: '6px', marginBottom: '24px', flexWrap: 'wrap' }}>
        {[{ id: 'all', label: 'All' }, ...CATS].map((cat) => (
          <button
            key={cat.id}
            onClick={() => setFilter(cat.id)}
            style={{
              padding: '7px 16px',
              background: filter === cat.id ? 'rgba(197,168,92,0.1)' : 'transparent',
              border: `1px solid ${filter === cat.id ? 'rgba(197,168,92,0.4)' : 'var(--dark-border)'}`,
              color: filter === cat.id ? 'var(--gold)' : 'var(--text-secondary)',
              fontFamily: 'var(--font-sans)', fontSize: '0.68rem', fontWeight: 600,
              letterSpacing: '0.1em', textTransform: 'uppercase', cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
          >
            {cat.label} {cat.id !== 'all' && `(${galleryItems.filter((g) => g.category === cat.id).length})`}
          </button>
        ))}
      </div>

      {/* Gallery Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '16px' }}>
        {filtered.map((item) => (
          <div
            key={item.id}
            style={{
              background: 'var(--dark-card)',
              border: '1px solid var(--dark-border)',
              overflow: 'hidden',
              transition: 'border-color 0.2s ease',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'rgba(197,168,92,0.3)')}
            onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--dark-border)')}
          >
            {/* Image Area */}
            <div style={{ position: 'relative', aspectRatio: '4/3', overflow: 'hidden', cursor: 'pointer' }}
              onClick={() => openEdit(item)}
            >
              {item.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={item.image} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <div style={{
                  width: '100%', height: '100%', background: item.gradient,
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '8px',
                }}>
                  <div style={{ fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(197,168,92,0.4)' }}>
                    No Image
                  </div>
                  <div style={{ fontSize: '0.58rem', color: 'rgba(255,255,255,0.2)' }}>Click to upload</div>
                </div>
              )}
              {/* Category badge */}
              <span style={{
                position: 'absolute', top: '8px', left: '8px',
                padding: '2px 8px', fontSize: '0.52rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase',
                background: `${catColor[item.category]}22`, color: catColor[item.category],
                border: `1px solid ${catColor[item.category]}40`,
              }}>
                {item.category}
              </span>
            </div>

            {/* Info & Actions */}
            <div style={{ padding: '14px 16px' }}>
              <p style={{ fontFamily: 'var(--font-sans)', fontSize: '0.85rem', fontWeight: 600, color: 'var(--cream)', marginBottom: '4px', lineHeight: 1.3 }}>
                {item.title}
              </p>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '12px' }}>
                {item.desc.slice(0, 60)}{item.desc.length > 60 ? '…' : ''}
              </p>
              <div style={{ display: 'flex', gap: '6px' }}>
                <button
                  onClick={() => openEdit(item)}
                  style={{
                    flex: 1, padding: '7px', background: 'transparent', border: '1px solid var(--dark-border)',
                    color: 'var(--text-secondary)', fontFamily: 'var(--font-sans)', fontSize: '0.65rem',
                    fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = 'var(--gold)'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(197,168,92,0.4)'; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = 'var(--text-secondary)'; (e.currentTarget as HTMLElement).style.borderColor = 'var(--dark-border)'; }}
                >
                  <Pencil size={11} /> Edit / Upload
                </button>
                {confirmDel === item.id ? (
                  <>
                    <button onClick={() => { deleteGalleryItem(item.id); setConfirmDel(null); }} style={{ width: '32px', height: '32px', background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.4)', color: '#ef4444', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Check size={13} />
                    </button>
                    <button onClick={() => setConfirmDel(null)} style={{ width: '32px', height: '32px', background: 'transparent', border: '1px solid var(--dark-border)', color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <X size={13} />
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => setConfirmDel(item.id)}
                    style={{
                      width: '32px', height: '32px', background: 'transparent', border: '1px solid var(--dark-border)',
                      color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      transition: 'all 0.2s ease',
                    }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = '#ef4444'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(239,68,68,0.4)'; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = 'var(--text-secondary)'; (e.currentTarget as HTMLElement).style.borderColor = 'var(--dark-border)'; }}
                  >
                    <Trash2 size={13} />
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}

        {/* Add New Card */}
        <button
          onClick={openAdd}
          style={{
            aspectRatio: '1', background: 'transparent', border: '1px dashed var(--dark-border)',
            color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex',
            flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '10px',
            transition: 'all 0.2s ease', minHeight: '200px',
          }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(197,168,92,0.4)'; (e.currentTarget as HTMLElement).style.color = 'var(--gold)'; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--dark-border)'; (e.currentTarget as HTMLElement).style.color = 'var(--text-secondary)'; }}
        >
          <Plus size={24} style={{ opacity: 0.5 }} />
          <span style={{ fontSize: '0.68rem', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase' }}>Add Photo</span>
        </button>
      </div>

      {/* ── Edit / Add Modal ──────────────────────────────────────────── */}
      {showForm && (
        <div
          style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}
          onClick={(e) => { if (e.target === e.currentTarget) setShowForm(false); }}
        >
          <div style={{ background: 'var(--dark-card)', border: '1px solid var(--dark-border)', width: '100%', maxWidth: '560px', maxHeight: '90vh', overflowY: 'auto' }}>
            {/* Modal Header */}
            <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--dark-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem', color: 'var(--cream)' }}>
                {editingId ? 'Edit Gallery Photo' : 'Add New Photo'}
              </h2>
              <button onClick={() => setShowForm(false)} style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>

            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
              {/* Image Uploader */}
              <ImageUploader
                label="Photo"
                value={form.image}
                aspectRatio="4/3"
                onChange={(dataUrl) => setForm((f) => ({ ...f, image: dataUrl }))}
              />

              {/* Title */}
              <div>
                <label style={LABEL}>Photo Title *</label>
                <input
                  style={INPUT_STYLE}
                  value={form.title}
                  placeholder="e.g. Strawberry Monster Shake"
                  onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                />
              </div>

              {/* Category */}
              <div>
                <label style={LABEL}>Category</label>
                <div style={{ position: 'relative' }}>
                  <select
                    style={{ ...INPUT_STYLE, appearance: 'none', paddingRight: '36px' }}
                    value={form.category}
                    onChange={(e) => setForm((f) => ({ ...f, category: e.target.value as GalleryItem['category'] }))}
                  >
                    {CATS.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
                  </select>
                  <ChevronDown size={14} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)', pointerEvents: 'none' }} />
                </div>
              </div>

              {/* Description */}
              <div>
                <label style={LABEL}>Caption / Description</label>
                <textarea
                  style={{ ...INPUT_STYLE, minHeight: '70px', resize: 'vertical' }}
                  value={form.desc}
                  placeholder="Brief description of this photo..."
                  onChange={(e) => setForm((f) => ({ ...f, desc: e.target.value }))}
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div style={{ padding: '16px 24px', borderTop: '1px solid var(--dark-border)', display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button onClick={() => setShowForm(false)} style={{ padding: '10px 20px', background: 'transparent', border: '1px solid var(--dark-border)', color: 'var(--text-secondary)', fontFamily: 'var(--font-sans)', fontSize: '0.72rem', fontWeight: 600, cursor: 'pointer' }}>
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={!form.title.trim()}
                style={{
                  padding: '10px 24px', background: form.title.trim() ? 'var(--gold)' : 'var(--dark-surface)',
                  border: 'none', color: form.title.trim() ? 'var(--black)' : 'var(--text-muted)',
                  fontFamily: 'var(--font-sans)', fontSize: '0.72rem', fontWeight: 700,
                  letterSpacing: '0.1em', textTransform: 'uppercase',
                  cursor: form.title.trim() ? 'pointer' : 'not-allowed',
                }}
              >
                {editingId ? 'Save Changes' : 'Add Photo'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
