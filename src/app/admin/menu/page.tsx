'use client';

import React, { useState } from 'react';
import { useCMSStore, useRestaurantStore } from '@/store/restaurantStore';
import ImageUploader from '@/components/ImageUploader';
import { Plus, Pencil, Trash2, X, Check, ChevronDown } from 'lucide-react';
import type { MenuItem, MenuItemPortions } from '@/data/restaurantData';

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

type EditForm = Omit<MenuItem, 'id' | 'gradient'> & { id?: string; gradient?: string; image?: string | null };

const EMPTY_FORM: EditForm = {
  name: '', category: 'shakes', course: '', description: '',
  price: 0, badge: null, dietary: [], allergens: [], image: null,
};

export default function MenuEditorPage() {
  const menuItems       = useCMSStore((s) => s.menuItems);
  const menuCategories  = useCMSStore((s) => s.menuCategories);
  const addMenuItem     = useCMSStore((s) => s.addMenuItem);
  const updateMenuItem  = useCMSStore((s) => s.updateMenuItem);
  const deleteMenuItem  = useCMSStore((s) => s.deleteMenuItem);
  const user            = useRestaurantStore((s) => s.user);

  const [activeTab, setActiveTab]   = useState<string>('shakes');
  const [showForm, setShowForm]     = useState(false);
  const [editingId, setEditingId]   = useState<string | null>(null);
  const [form, setForm]             = useState<EditForm>(EMPTY_FORM);
  const [confirmDel, setConfirmDel] = useState<string | null>(null);

  const filteredItems = menuItems.filter((i) => i.category === activeTab);

  const openAdd = () => {
    setForm({
      ...EMPTY_FORM,
      category: activeTab,
      portions: {
        small: { available: true, price: 0 },
        medium: { available: true, price: 0 },
        large: { available: true, price: 0 },
      }
    });
    setEditingId(null);
    setShowForm(true);
  };

  const openEdit = (item: MenuItem) => {
    const defaultPortions = {
      small: { available: true, price: Math.round(item.price * 0.8) },
      medium: { available: true, price: item.price },
      large: { available: true, price: Math.round(item.price * 1.3) },
    };
    setForm({
      ...item,
      portions: item.portions || defaultPortions,
    });
    setEditingId(item.id);
    setShowForm(true);
  };

  const handleSave = () => {
    if (!form.name.trim()) {
      alert('Please enter a dish name.');
      return;
    }
    if (!form.price || form.price <= 0) {
      alert('Please enter a valid price greater than 0.');
      return;
    }
    if (editingId) {
      updateMenuItem(editingId, form);
      // Log edit
      fetch('/api/admin/logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'EDIT_MENU_ITEM',
          details: `Modified dish "${form.name}" (price: INR ${form.price}, category: ${form.category}).`,
          adminEmail: user?.email || 'unknown@thelondon.co.uk',
        }),
      }).catch((err) => console.warn('Failed to log menu edit:', err));
    } else {
      addMenuItem(form);
      // Log add
      fetch('/api/admin/logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'ADD_MENU_ITEM',
          details: `Added new dish "${form.name}" (price: INR ${form.price}, category: ${form.category}).`,
          adminEmail: user?.email || 'unknown@thelondon.co.uk',
        }),
      }).catch((err) => console.warn('Failed to log menu add:', err));
    }
    setShowForm(false);
    setEditingId(null);
  };

  const handleDelete = (id: string) => {
    const item = menuItems.find((m) => m.id === id);
    deleteMenuItem(id);
    setConfirmDel(null);

    // Log delete
    fetch('/api/admin/logs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'DELETE_MENU_ITEM',
        details: `Deleted dish "${item?.name || id}" from menu.`,
        adminEmail: user?.email || 'unknown@thelondon.co.uk',
      }),
    }).catch((err) => console.warn('Failed to log menu delete:', err));
  };

  const setBadge = (val: string) => setForm((f) => ({ ...f, badge: val || null }));

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '28px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', color: 'var(--cream)', marginBottom: '4px' }}>Menu Editor</h1>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>{menuItems.length} items across {menuCategories.length} categories</p>
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
          <Plus size={14} /> Add Item
        </button>
      </div>

      {/* Category Tabs */}
      <div style={{ display: 'flex', gap: '4px', marginBottom: '24px', flexWrap: 'wrap', borderBottom: '1px solid var(--dark-border)', paddingBottom: '0' }}>
        {menuCategories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveTab(cat.id)}
            style={{
              padding: '10px 18px',
              background: activeTab === cat.id ? 'rgba(197,168,92,0.1)' : 'transparent',
              border: 'none',
              borderBottom: activeTab === cat.id ? '2px solid var(--gold)' : '2px solid transparent',
              color: activeTab === cat.id ? 'var(--gold)' : 'var(--text-secondary)',
              fontFamily: 'var(--font-sans)', fontSize: '0.72rem', fontWeight: 600,
              letterSpacing: '0.1em', textTransform: 'uppercase', cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
          >
            {cat.label} ({menuItems.filter((i) => i.category === cat.id).length})
          </button>
        ))}
      </div>

      {/* Items Table */}
      <div style={{ background: 'var(--dark-card)', border: '1px solid var(--dark-border)' }}>
        {/* Table Head */}
        <div style={{
          display: 'grid', gridTemplateColumns: '1fr 2fr 90px 100px 90px 90px',
          padding: '12px 20px', borderBottom: '1px solid var(--dark-border)',
          fontFamily: 'var(--font-sans)', fontSize: '0.58rem', fontWeight: 700,
          letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--text-muted)',
        }}>
          <span>Name</span>
          <span>Description</span>
          <span>Price</span>
          <span>Badge</span>
          <span>Dietary</span>
          <span style={{ textAlign: 'right' }}>Actions</span>
        </div>

        {filteredItems.length === 0 ? (
          <div style={{ padding: '48px', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
            No items in this category. Click &quot;Add Item&quot; to create one.
          </div>
        ) : (
          filteredItems.map((item, idx) => (
            <div
              key={item.id}
              style={{
                display: 'grid', gridTemplateColumns: '1fr 2fr 90px 100px 90px 90px',
                padding: '14px 20px', alignItems: 'center',
                borderBottom: idx < filteredItems.length - 1 ? '1px solid var(--dark-border)' : 'none',
                transition: 'background 0.15s ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--dark-surface)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
            >
              <p style={{ fontFamily: 'var(--font-sans)', fontSize: '0.85rem', fontWeight: 600, color: 'var(--cream)' }}>
                {item.name}
              </p>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', paddingRight: '12px', lineHeight: 1.5 }}>
                {item.description.slice(0, 60)}{item.description.length > 60 ? '…' : ''}
              </p>
              <p style={{ fontFamily: 'var(--font-display)', fontSize: '0.95rem', color: 'var(--gold)' }}>₹{item.price}</p>
              <span>
                {item.badge ? (
                  <span style={{
                    padding: '2px 8px', background: 'rgba(197,168,92,0.1)',
                    border: '1px solid rgba(197,168,92,0.3)', color: 'var(--gold)',
                    fontSize: '0.58rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase',
                  }}>{item.badge}</span>
                ) : <span style={{ color: 'var(--text-muted)', fontSize: '0.72rem' }}>—</span>}
              </span>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                {item.dietary.length > 0 ? item.dietary.join(', ').toUpperCase() : '—'}
              </span>
              <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                <button
                  onClick={() => openEdit(item)}
                  title="Edit"
                  style={{
                    width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: 'transparent', border: '1px solid var(--dark-border)', color: 'var(--text-secondary)',
                    cursor: 'pointer', transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = 'var(--gold)'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(197,168,92,0.4)'; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = 'var(--text-secondary)'; (e.currentTarget as HTMLElement).style.borderColor = 'var(--dark-border)'; }}
                >
                  <Pencil size={13} />
                </button>
                {confirmDel === item.id ? (
                  <div style={{ display: 'flex', gap: '4px' }}>
                    <button onClick={() => handleDelete(item.id)} title="Confirm delete" style={{ width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.4)', color: '#ef4444', cursor: 'pointer' }}>
                      <Check size={13} />
                    </button>
                    <button onClick={() => setConfirmDel(null)} title="Cancel" style={{ width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'transparent', border: '1px solid var(--dark-border)', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                      <X size={13} />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setConfirmDel(item.id)}
                    title="Delete"
                    style={{
                      width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      background: 'transparent', border: '1px solid var(--dark-border)', color: 'var(--text-secondary)',
                      cursor: 'pointer', transition: 'all 0.2s ease',
                    }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = '#ef4444'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(239,68,68,0.4)'; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = 'var(--text-secondary)'; (e.currentTarget as HTMLElement).style.borderColor = 'var(--dark-border)'; }}
                  >
                    <Trash2 size={13} />
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add / Edit Form Modal */}
      {showForm && (
        <div
          style={{
            position: 'fixed', inset: 0, zIndex: 1000,
            background: 'rgba(0,0,0,0.75)', display: 'flex',
            alignItems: 'center', justifyContent: 'center', padding: '24px',
          }}
          onClick={(e) => { if (e.target === e.currentTarget) setShowForm(false); }}
        >
          <div style={{
            background: 'var(--dark-card)', border: '1px solid var(--dark-border)',
            width: '100%', maxWidth: '560px', maxHeight: '90vh', overflowY: 'auto',
          }}>
            {/* Modal Header */}
            <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--dark-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem', color: 'var(--cream)' }}>
                {editingId ? 'Edit Menu Item' : 'Add New Item'}
              </h2>
              <button onClick={() => setShowForm(false)} style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>

            {/* Form Body */}
            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
              {/* Image Upload */}
              <ImageUploader
                label="Item Photo"
                value={(form as EditForm).image ?? null}
                aspectRatio="4/3"
                onChange={(dataUrl) => setForm((f) => ({ ...f, image: dataUrl }))}
              />

              {/* Name */}
              <div>
                <label style={LABEL}>Item Name *</label>
                <input
                  style={INPUT_STYLE} value={form.name} placeholder="e.g. Strawberry Monster"
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                />
              </div>

              {/* Category & Course */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={LABEL}>Category *</label>
                  <div style={{ position: 'relative' }}>
                    <select
                      style={{ ...INPUT_STYLE, appearance: 'none', paddingRight: '36px' }}
                      value={form.category}
                      onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                    >
                      {menuCategories.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
                    </select>
                    <ChevronDown size={14} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)', pointerEvents: 'none' }} />
                  </div>
                </div>
                <div>
                  <label style={LABEL}>Course / Type</label>
                  <input
                    style={INPUT_STYLE} value={form.course} placeholder="e.g. Thick Shakes"
                    onChange={(e) => setForm((f) => ({ ...f, course: e.target.value }))}
                  />
                </div>
              </div>

              {/* Price & Badge */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={LABEL}>Price (₹) *</label>
                  <input
                    type="number" style={INPUT_STYLE} value={form.price || ''}
                    placeholder="0"
                    onChange={(e) => {
                      const newPrice = Number(e.target.value);
                      setForm((f) => {
                        const p = f.portions || { small: { available: true, price: 0 }, medium: { available: true, price: 0 }, large: { available: true, price: 0 } };
                        const updatedPortions = {
                          small: { available: p.small.available, price: p.small.price || Math.round(newPrice * 0.8) },
                          medium: { available: p.medium.available, price: p.medium.price || newPrice },
                          large: { available: p.large.available, price: p.large.price || Math.round(newPrice * 1.3) },
                        };
                        return { ...f, price: newPrice, portions: updatedPortions };
                      });
                    }}
                  />
                </div>
                <div>
                  <label style={LABEL}>Badge</label>
                  <div style={{ position: 'relative' }}>
                    <select
                      style={{ ...INPUT_STYLE, appearance: 'none', paddingRight: '36px' }}
                      value={form.badge || ''}
                      onChange={(e) => setBadge(e.target.value)}
                    >
                      <option value="">None</option>
                      <option value="Bestseller">Bestseller</option>
                      <option value="Popular">Popular</option>
                      <option value="New">New</option>
                      <option value="Chef's Special">Chef&apos;s Special</option>
                      <option value="Seasonal">Seasonal</option>
                    </select>
                    <ChevronDown size={14} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)', pointerEvents: 'none' }} />
                  </div>
                </div>
              </div>

              {/* Portions Configuration */}
              <div style={{ border: '1px solid var(--dark-border)', padding: '16px', background: 'rgba(255,255,255,0.01)' }}>
                <h3 style={{ ...LABEL, color: 'var(--gold)', marginBottom: '12px', fontSize: '0.68rem' }}>Portion Options & Custom Prices</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {(['small', 'medium', 'large'] as const).map((size) => {
                    const config = form.portions?.[size] || { available: true, price: 0 };
                    return (
                      <div key={size} style={{ display: 'grid', gridTemplateColumns: '120px 1fr 1fr', gap: '16px', alignItems: 'center' }}>
                        <span style={{ fontFamily: 'var(--font-sans)', fontSize: '0.8rem', fontWeight: 600, textTransform: 'capitalize', color: 'var(--cream)' }}>
                          {size} Size
                        </span>
                        
                        {/* Availability Checkbox */}
                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', userSelect: 'none' }}>
                          <input
                            type="checkbox"
                            checked={config.available}
                            onChange={(e) => {
                              const updatedPortions = {
                                ...form.portions,
                                [size]: { ...config, available: e.target.checked }
                              };
                              setForm((f) => ({ ...f, portions: updatedPortions as MenuItemPortions }));
                            }}
                            style={{ accentColor: 'var(--gold)' }}
                          />
                          <span style={{ fontFamily: 'var(--font-sans)', fontSize: '0.72rem', color: 'var(--text-secondary)' }}>Available</span>
                        </label>
                        
                        {/* Price Input */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>₹</span>
                          <input
                            type="number"
                            style={{ ...INPUT_STYLE, padding: '6px 10px' }}
                            value={config.price || ''}
                            disabled={!config.available}
                            placeholder="Price"
                            onChange={(e) => {
                              const updatedPortions = {
                                ...form.portions,
                                [size]: { ...config, price: Number(e.target.value) }
                              };
                              setForm((f) => ({ ...f, portions: updatedPortions as MenuItemPortions }));
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Description */}
              <div>
                <label style={LABEL}>Description</label>
                <textarea
                  style={{ ...INPUT_STYLE, minHeight: '80px', resize: 'vertical' }}
                  value={form.description}
                  placeholder="Describe this item..."
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                />
              </div>

              {/* Dietary */}
              <div>
                <label style={LABEL}>Dietary Tags</label>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {[
                    { val: 'v', label: 'Vegetarian' },
                    { val: 'vg', label: 'Vegan' },
                    { val: 'gf', label: 'Gluten Free' },
                    { val: 'df', label: 'Dairy Free' },
                  ].map(({ val, label }) => {
                    const active = form.dietary.includes(val);
                    return (
                      <button
                        key={val}
                        type="button"
                        onClick={() => setForm((f) => ({
                          ...f,
                          dietary: active ? f.dietary.filter((d) => d !== val) : [...f.dietary, val],
                        }))}
                        style={{
                          padding: '6px 12px',
                          background: active ? 'rgba(16,185,129,0.12)' : 'transparent',
                          border: `1px solid ${active ? 'rgba(16,185,129,0.4)' : 'var(--dark-border)'}`,
                          color: active ? '#10b981' : 'var(--text-secondary)',
                          fontFamily: 'var(--font-sans)', fontSize: '0.7rem', fontWeight: 600,
                          cursor: 'pointer', transition: 'all 0.2s ease',
                        }}
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Allergens */}
              <div>
                <label style={LABEL}>Allergens (comma separated)</label>
                <input
                  style={INPUT_STYLE}
                  value={form.allergens.join(', ')}
                  placeholder="e.g. Dairy, Gluten, Nuts"
                  onChange={(e) => setForm((f) => ({
                    ...f,
                    allergens: e.target.value.split(',').map((a) => a.trim()).filter(Boolean),
                  }))}
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div style={{ padding: '16px 24px', borderTop: '1px solid var(--dark-border)', display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setShowForm(false)}
                style={{ padding: '10px 20px', background: 'transparent', border: '1px solid var(--dark-border)', color: 'var(--text-secondary)', fontFamily: 'var(--font-sans)', fontSize: '0.72rem', fontWeight: 600, cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={!form.name.trim() || !form.price}
                style={{
                  padding: '10px 24px', background: 'var(--gold)', border: 'none',
                  color: 'var(--black)', fontFamily: 'var(--font-sans)', fontSize: '0.72rem',
                  fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase',
                  cursor: form.name.trim() && form.price ? 'pointer' : 'not-allowed',
                  opacity: form.name.trim() && form.price ? 1 : 0.5,
                }}
              >
                {editingId ? 'Save Changes' : 'Add Item'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
