'use client';

import React, { useState } from 'react';
import { Clock, Star, Plus, Search, Pencil, Trash2, X, Check, ChevronDown } from 'lucide-react';
import { useIsMounted } from '@/store/restaurantStore';
import { useIsMobile } from '@/hooks/useIsMobile';

type Staff = {
  id:         string;
  name:       string;
  role:       string;
  email:      string;
  phone:      string;
  joinDate:   string;
  status:     'active' | 'on-leave' | 'off-duty';
  shift:      string;
  attendance: number; // percent
  rating:     number;
};

const STAFF: Staff[] = [];

const STATUS_CFG = {
  'active':    { color:'#10b981', label:'Active'    },
  'on-leave':  { color:'#f59e0b', label:'On Leave'  },
  'off-duty':  { color:'#6b7280', label:'Off Duty'  },
};

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

type EditForm = Omit<Staff, 'id' | 'joinDate'> & { id?: string; joinDate?: string };

const EMPTY_FORM: EditForm = {
  name: '',
  role: '',
  email: '',
  phone: '',
  shift: '10:00–22:00',
  status: 'active',
  attendance: 100,
  rating: 5.0,
};

export default function HRPage() {
  const isMounted = useIsMounted();
  const [staffList, setStaffList] = useState<Staff[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('thelondon-staff-list:v1');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {}
      }
    }
    return STAFF;
  });

  const [query, setQuery] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<EditForm>(EMPTY_FORM);
  const [confirmDel, setConfirmDel] = useState<string | null>(null);
  const isMobile = useIsMobile();

  const saveStaffList = (list: Staff[]) => {
    setStaffList(list);
    localStorage.setItem('thelondon-staff-list:v1', JSON.stringify(list));
  };

  const activeStaff = isMounted ? staffList : STAFF;

  const filtered = activeStaff.filter((s) =>
    s.name.toLowerCase().includes(query.toLowerCase()) ||
    s.role.toLowerCase().includes(query.toLowerCase())
  );

  const active   = activeStaff.filter((s) => s.status === 'active').length;
  const onLeave  = activeStaff.filter((s) => s.status === 'on-leave').length;

  const openAdd = () => {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setShowForm(true);
  };

  const openEdit = (staff: Staff) => {
    setForm({ ...staff });
    setEditingId(staff.id);
    setShowForm(true);
  };

  const handleSave = () => {
    if (!form.name.trim() || !form.role.trim()) return;
    let newList: Staff[];
    if (editingId) {
      newList = staffList.map((s) => (s.id === editingId ? { ...s, ...form } as Staff : s));
    } else {
      const newStaff: Staff = {
        ...form,
        id: 's' + Math.random().toString(36).substring(2, 8),
        joinDate: new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
      } as Staff;
      newList = [...staffList, newStaff];
    }
    saveStaffList(newList);
    setShowForm(false);
    setEditingId(null);
  };

  const handleDelete = (id: string) => {
    const newList = staffList.filter((s) => s.id !== id);
    saveStaffList(newList);
    setConfirmDel(null);
  };

  return (
    <div>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'32px', flexWrap:'wrap', gap:'16px' }}>
        <div>
          <h1 style={{ fontFamily:'var(--font-display)', fontSize:'2rem', color:'var(--cream)', marginBottom:'4px' }}>Staff & HR</h1>
          <p style={{ fontSize:'0.78rem', color:'var(--text-secondary)' }}>
            {active} on duty · {onLeave} on leave · {activeStaff.length} total
          </p>
        </div>
        <button className="btn-gold btn-sm" onClick={openAdd}>
          <Plus size={13} style={{ position:'relative', zIndex:1 }} />
          <span>Add Staff</span>
        </button>
      </div>

      {/* Summary */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'1px', background:'var(--dark-border)', border:'1px solid var(--dark-border)', marginBottom:'28px' }}>
        {[
          { label:'Total Staff',  val: activeStaff.length,  color:'var(--gold)'  },
          { label:'Active Today', val: active,         color:'#10b981'      },
          { label:'On Leave',     val: onLeave,        color:'#f59e0b'      },
        ].map((s) => (
          <div key={s.label} style={{ padding:'20px', background:'var(--dark-card)', textAlign:'center' }}>
            <p style={{ fontFamily:'var(--font-display)', fontSize:'2.2rem', color: s.color, lineHeight:1 }}>{s.val}</p>
            <p style={{ fontFamily:'var(--font-sans)', fontSize:'0.6rem', fontWeight:700, letterSpacing:'0.2em', textTransform:'uppercase', color:'var(--text-secondary)', marginTop:'4px' }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Search */}
      <div style={{ position:'relative', marginBottom:'20px' }}>
        <Search size={14} style={{ position:'absolute', left:'14px', top:'50%', transform:'translateY(-50%)', color:'var(--text-secondary)' }} />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search staff by name or role..."
          style={{ paddingLeft:'40px' }}
        />
      </div>

      {/* Staff table / card list */}
      {isMobile ? (
        /* Mobile card list */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {filtered.length === 0 ? (
            <div style={{ padding: '48px', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>No staff found matching the query.</div>
          ) : (
            filtered.map((s) => {
              const cfg = STATUS_CFG[s.status];
              return (
                <div key={s.id} style={{ background: 'var(--dark-card)', border: '1px solid var(--dark-border)', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ width: '44px', height: '44px', flexShrink: 0, background: 'rgba(197,168,92,0.1)', border: '1px solid rgba(197,168,92,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-sans)', fontSize: '0.82rem', fontWeight: 700, color: 'var(--gold)' }}>
                        {s.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                      </div>
                      <div>
                        <p style={{ fontFamily: 'var(--font-sans)', fontSize: '0.92rem', fontWeight: 700, color: 'var(--cream)', marginBottom: '2px' }}>{s.name}</p>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{s.role}</p>
                      </div>
                    </div>
                    <span style={{ padding: '3px 10px', fontSize: '0.58rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: cfg.color, background: `${cfg.color}14`, border: `1px solid ${cfg.color}30` }}>{cfg.label}</span>
                  </div>
                  <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)' }}><Clock size={13} /><span style={{ fontSize: '0.78rem' }}>{s.shift}</span></div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Star size={13} fill="var(--gold)" color="var(--gold)" /><span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--cream)' }}>{s.rating}</span></div>
                    <span style={{ fontSize: '0.82rem', fontWeight: 600, color: s.attendance >= 90 ? '#10b981' : s.attendance >= 80 ? '#f59e0b' : '#ef4444' }}>{s.attendance}% attendance</span>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button onClick={() => openEdit(s)} style={{ flex: 1, padding: '10px', background: 'transparent', border: '1px solid var(--dark-border)', color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontFamily: 'var(--font-sans)', fontSize: '0.72rem' }}><Pencil size={13} /> Edit</button>
                    {confirmDel === s.id ? (
                      <div style={{ display: 'flex', gap: '4px', flex: 1 }}>
                        <button onClick={() => handleDelete(s.id)} style={{ flex: 1, padding: '10px', background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.4)', color: '#ef4444', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontFamily: 'var(--font-sans)', fontSize: '0.72rem' }}><Check size={13} /> Confirm</button>
                        <button onClick={() => setConfirmDel(null)} style={{ flex: 1, padding: '10px', background: 'transparent', border: '1px solid var(--dark-border)', color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontFamily: 'var(--font-sans)', fontSize: '0.72rem' }}><X size={13} /> Cancel</button>
                      </div>
                    ) : (
                      <button onClick={() => setConfirmDel(s.id)} style={{ padding: '10px 16px', background: 'transparent', border: '1px solid rgba(239,68,68,0.3)', color: '#ef4444', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontFamily: 'var(--font-sans)', fontSize: '0.72rem' }}><Trash2 size={13} /></button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      ) : (
        /* Desktop table */
        <div style={{ background:'var(--dark-card)', border:'1px solid var(--dark-border)', overflow:'hidden' }}>
          {/* Table Header */}
          <div style={{
            display:'grid', gridTemplateColumns:'1fr 120px 160px 100px 80px 80px',
            padding:'12px 20px', borderBottom:'1px solid var(--dark-border)',
            background:'var(--dark-surface)',
          }}>
            {['Team Member','Status','Shift','Attendance','Rating','Actions'].map((h) => (
              <p key={h} style={{ fontFamily:'var(--font-sans)', fontSize:'0.58rem', fontWeight:700, letterSpacing:'0.2em', textTransform:'uppercase', color:'var(--text-secondary)' }}>{h}</p>
            ))}
          </div>

          {/* Rows */}
          {filtered.length === 0 ? (
            <div style={{ padding: '48px', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>No staff found matching the query.</div>
          ) : (
            filtered.map((s, i) => {
              const cfg = STATUS_CFG[s.status];
              return (
                <div key={s.id} style={{
                  display:'grid', gridTemplateColumns:'1fr 120px 160px 100px 80px 80px',
                  padding:'16px 20px',
                  borderBottom: i < filtered.length - 1 ? '1px solid var(--dark-border)' : 'none',
                  alignItems:'center',
                }}>
                  <div style={{ display:'flex', alignItems:'center', gap:'14px' }}>
                    <div style={{ width:'38px', height:'38px', flexShrink:0, background:'rgba(197,168,92,0.1)', border:'1px solid rgba(197,168,92,0.2)', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'var(--font-sans)', fontSize:'0.78rem', fontWeight:700, color:'var(--gold)' }}>
                      {s.name.split(' ').map((n) => n[0]).join('').slice(0,2)}
                    </div>
                    <div>
                      <p style={{ fontFamily:'var(--font-sans)', fontSize:'0.84rem', fontWeight:600, color:'var(--cream)', marginBottom:'2px' }}>{s.name}</p>
                      <p style={{ fontSize:'0.72rem', color:'var(--text-secondary)' }}>{s.role}</p>
                    </div>
                  </div>
                  <span style={{ padding:'3px 10px', fontSize:'0.58rem', fontWeight:700, letterSpacing:'0.12em', textTransform:'uppercase', color: cfg.color, background:`${cfg.color}14`, border:`1px solid ${cfg.color}30`, width:'fit-content' }}>{cfg.label}</span>
                  <div style={{ display:'flex', alignItems:'center', gap:'6px', color:'var(--text-secondary)' }}><Clock size={12} /><span style={{ fontSize:'0.75rem' }}>{s.shift}</span></div>
                  <div>
                    <p style={{ fontFamily:'var(--font-sans)', fontSize:'0.82rem', fontWeight:600, color: s.attendance >= 90 ? '#10b981' : s.attendance >= 80 ? '#f59e0b' : '#ef4444' }}>{s.attendance}%</p>
                    <div style={{ height:'3px', background:'var(--dark-border-2)', borderRadius:'2px', marginTop:'4px', width:'60px' }}>
                      <div style={{ height:'3px', width:`${s.attendance}%`, background: s.attendance >= 90 ? '#10b981' : s.attendance >= 80 ? '#f59e0b' : '#ef4444', borderRadius:'2px' }} />
                    </div>
                  </div>
                  <div style={{ display:'flex', alignItems:'center', gap:'4px' }}><Star size={12} fill="var(--gold)" color="var(--gold)" /><span style={{ fontFamily:'var(--font-sans)', fontSize:'0.82rem', fontWeight:600, color:'var(--cream)' }}>{s.rating}</span></div>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button onClick={() => openEdit(s)} title="Edit" style={{ width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'transparent', border: '1px solid var(--dark-border)', color: 'var(--text-secondary)', cursor: 'pointer', transition: 'all 0.2s ease' }} onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = 'var(--gold)'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(197,168,92,0.4)'; }} onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = 'var(--text-secondary)'; (e.currentTarget as HTMLElement).style.borderColor = 'var(--dark-border)'; }}><Pencil size={13} /></button>
                    {confirmDel === s.id ? (
                      <div style={{ display: 'flex', gap: '4px' }}>
                        <button onClick={() => handleDelete(s.id)} title="Confirm delete" style={{ width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.4)', color: '#ef4444', cursor: 'pointer' }}><Check size={13} /></button>
                        <button onClick={() => setConfirmDel(null)} title="Cancel" style={{ width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'transparent', border: '1px solid var(--dark-border)', color: 'var(--text-secondary)', cursor: 'pointer' }}><X size={13} /></button>
                      </div>
                    ) : (
                      <button onClick={() => setConfirmDel(s.id)} title="Delete" style={{ width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'transparent', border: '1px solid var(--dark-border)', color: 'var(--text-secondary)', cursor: 'pointer', transition: 'all 0.2s ease' }} onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = '#ef4444'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(239,68,68,0.4)'; }} onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = 'var(--text-secondary)'; (e.currentTarget as HTMLElement).style.borderColor = 'var(--dark-border)'; }}><Trash2 size={13} /></button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

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
            width: '100%', maxWidth: '500px', maxHeight: '90vh', overflowY: 'auto',
          }}>
            {/* Modal Header */}
            <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--dark-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem', color: 'var(--cream)' }}>
                {editingId ? 'Edit Team Member' : 'Add New Staff'}
              </h2>
              <button onClick={() => setShowForm(false)} style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>

            {/* Form Body */}
            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
              {/* Name */}
              <div>
                <label style={LABEL}>Name *</label>
                <input
                  style={INPUT_STYLE} value={form.name} placeholder="e.g. John Doe"
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                />
              </div>

              {/* Role */}
              <div>
                <label style={LABEL}>Role *</label>
                <input
                  style={INPUT_STYLE} value={form.role} placeholder="e.g. Waiter, Head Chef"
                  onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}
                />
              </div>

              {/* Email & Phone */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={LABEL}>Email</label>
                  <input
                    type="email" style={INPUT_STYLE} value={form.email} placeholder="name@tls.co"
                    onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                  />
                </div>
                <div>
                  <label style={LABEL}>Phone</label>
                  <input
                    style={INPUT_STYLE} value={form.phone} placeholder="+91 98100 12345"
                    onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                  />
                </div>
              </div>

              {/* Shift & Status */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={LABEL}>Shift</label>
                  <input
                    style={INPUT_STYLE} value={form.shift} placeholder="10:00–22:00"
                    onChange={(e) => setForm((f) => ({ ...f, shift: e.target.value }))}
                  />
                </div>
                <div>
                  <label style={LABEL}>Status *</label>
                  <div style={{ position: 'relative' }}>
                    <select
                      style={{ ...INPUT_STYLE, appearance: 'none', paddingRight: '36px' }}
                      value={form.status}
                      onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as Staff['status'] }))}
                    >
                      <option value="active">Active</option>
                      <option value="on-leave">On Leave</option>
                      <option value="off-duty">Off Duty</option>
                    </select>
                    <ChevronDown size={14} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)', pointerEvents: 'none' }} />
                  </div>
                </div>
              </div>

              {/* Attendance & Rating */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={LABEL}>Attendance (%)</label>
                  <input
                    type="number" style={INPUT_STYLE} value={form.attendance} placeholder="100" min="0" max="100"
                    onChange={(e) => setForm((f) => ({ ...f, attendance: Number(e.target.value) }))}
                  />
                </div>
                <div>
                  <label style={LABEL}>Rating (0.0 - 5.0)</label>
                  <input
                    type="number" step="0.1" min="0" max="5" style={INPUT_STYLE} value={form.rating} placeholder="5.0"
                    onChange={(e) => setForm((f) => ({ ...f, rating: Number(e.target.value) }))}
                  />
                </div>
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
                disabled={!form.name.trim() || !form.role.trim()}
                style={{
                  padding: '10px 24px', background: 'var(--gold)', border: 'none',
                  color: 'var(--black)', fontFamily: 'var(--font-sans)', fontSize: '0.72rem',
                  fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase',
                  cursor: form.name.trim() && form.role.trim() ? 'pointer' : 'not-allowed',
                  opacity: form.name.trim() && form.role.trim() ? 1 : 0.5,
                }}
              >
                {editingId ? 'Save Changes' : 'Add Staff'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
