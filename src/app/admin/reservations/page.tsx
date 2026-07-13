'use client';

import React, { useState } from 'react';
import { useRestaurantStore } from '@/store/restaurantStore';
import { useIsMobile } from '@/hooks/useIsMobile';
import { Calendar, Users, Phone, Clock, XCircle, Search, Plus } from 'lucide-react';

export default function AdminReservationsPage() {
  const reservations = useRestaurantStore((s) => s.reservations);
  const cancelReservation = useRestaurantStore((s) => s.cancelReservation);
  const isMobile = useIsMobile();
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'confirmed' | 'pending' | 'cancelled'>('all');

  const filtered = reservations.filter((r) => {
    const matchQ = !query || r.name.toLowerCase().includes(query.toLowerCase()) || r.phone.includes(query);
    const matchS = statusFilter === 'all' || r.status === statusFilter;
    return matchQ && matchS;
  });

  const counts = {
    confirmed: reservations.filter((r) => r.status === 'confirmed').length,
    pending:   reservations.filter((r) => r.status === 'pending').length,
    cancelled: reservations.filter((r) => r.status === 'cancelled').length,
  };

  const STATUS_CFG = {
    confirmed: { color:'#10b981', label:'Confirmed' },
    pending:   { color:'#f59e0b', label:'Pending'   },
    cancelled: { color:'#6b7280', label:'Cancelled' },
  };

  return (
    <div>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'32px', flexWrap:'wrap', gap:'16px' }}>
        <div>
          <h1 style={{ fontFamily:'var(--font-display)', fontSize:'2rem', color:'var(--cream)', marginBottom:'4px' }}>Reservations</h1>
          <p style={{ fontSize:'0.78rem', color:'var(--text-secondary)' }}>
            {counts.confirmed} confirmed · {counts.pending} pending · {reservations.length} total
          </p>
        </div>
        <button className="btn-gold btn-sm">
          <Plus size={13} style={{ position:'relative', zIndex:1 }} />
          <span>Add Booking</span>
        </button>
      </div>

      {/* Summary */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(120px, 1fr))', gap:'1px', background:'var(--dark-border)', border:'1px solid var(--dark-border)', marginBottom:'28px' }}>
        {Object.entries(STATUS_CFG).map(([key, cfg]) => (
          <div key={key} style={{ padding:'20px', background:'var(--dark-card)', textAlign:'center' }}>
            <p style={{ fontFamily:'var(--font-display)', fontSize:'2rem', color: cfg.color, lineHeight:1 }}>
              {counts[key as keyof typeof counts]}
            </p>
            <p style={{ fontFamily:'var(--font-sans)', fontSize:'0.6rem', fontWeight:700, letterSpacing:'0.2em', textTransform:'uppercase', color:'var(--text-secondary)', marginTop:'4px' }}>
              {cfg.label}
            </p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display:'flex', gap:'12px', marginBottom:'20px', flexWrap:'wrap' }}>
        <div style={{ position:'relative', flex:1, minWidth:'200px' }}>
          <Search size={14} style={{ position:'absolute', left:'14px', top:'50%', transform:'translateY(-50%)', color:'var(--text-secondary)' }} />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search by name or phone..." style={{ paddingLeft:'40px' }} />
        </div>
        <div style={{ display:'flex', gap:'6px' }}>
          {(['all','confirmed','pending','cancelled'] as const).map((s) => (
            <button key={s} onClick={() => setStatusFilter(s)} style={{
              padding:'14px 16px', background: statusFilter === s ? 'rgba(197,168,92,0.1)' : 'transparent',
              border:`1px solid ${statusFilter === s ? 'rgba(197,168,92,0.4)' : 'var(--dark-border-2)'}`,
              color: statusFilter === s ? 'var(--gold)' : 'var(--text-secondary)',
              fontFamily:'var(--font-sans)', fontSize:'0.65rem', fontWeight:600, letterSpacing:'0.15em', textTransform:'capitalize', cursor:'pointer',
            }}>
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Reservations List */}
      {filtered.length === 0 ? (
        <div style={{ padding:'60px', textAlign:'center', border:'1px dashed var(--dark-border-2)', color:'var(--text-secondary)' }}>
          <Calendar size={36} opacity={0.3} style={{ margin:'0 auto 12px' }} />
          <p style={{ fontFamily:'var(--font-display)', fontSize:'1.3rem', color:'var(--cream)' }}>No reservations found</p>
        </div>
      ) : (
        <div style={{ display:'flex', flexDirection:'column', gap:'8px' }}>
          {filtered.map((res) => {
            const cfg = STATUS_CFG[res.status];
            return (
              <div key={res.id} style={{
                background:'var(--dark-card)', border:`1px solid ${cfg.color}20`,
                padding:'20px 24px', display: isMobile ? 'flex' : 'grid',
                flexDirection: 'column', gap: isMobile ? '12px' : undefined,
                gridTemplateColumns: isMobile ? undefined : '1fr 1fr 1fr auto',
                alignItems:'center',
              }}>
                <div>
                  <p style={{ fontFamily:'var(--font-display)', fontSize:'1.1rem', color:'var(--cream)', marginBottom:'4px' }}>{res.name}</p>
                  <div style={{ display:'flex', gap:'12px', flexWrap:'wrap' }}>
                    <div style={{ display:'flex', alignItems:'center', gap:'5px', color:'var(--text-secondary)', fontSize:'0.75rem' }}>
                      <Phone size={11} />  {res.phone}
                    </div>
                    <div style={{ display:'flex', alignItems:'center', gap:'5px', color:'var(--text-secondary)', fontSize:'0.75rem' }}>
                      <Users size={11} />  {res.guests} guests
                    </div>
                  </div>
                </div>
                <div>
                  <div style={{ display:'flex', alignItems:'center', gap:'6px', marginBottom:'4px' }}>
                    <Calendar size={13} color="var(--gold)" opacity={0.6} />
                    <span style={{ fontSize:'0.84rem', color:'var(--cream)', fontWeight:600 }}>{res.date}</span>
                  </div>
                  <div style={{ display:'flex', alignItems:'center', gap:'6px' }}>
                    <Clock size={13} color="var(--gold)" opacity={0.6} />
                    <span style={{ fontSize:'0.84rem', color:'var(--text-secondary)' }}>{res.time}</span>
                  </div>
                </div>
                <div>
                  <span style={{
                    padding:'3px 10px', fontSize:'0.6rem', fontWeight:700, letterSpacing:'0.12em', textTransform:'uppercase',
                    color: cfg.color, background:`${cfg.color}14`, border:`1px solid ${cfg.color}30`,
                  }}>
                    {cfg.label}
                  </span>
                  {res.occasion && (
                    <p style={{ marginTop:'6px', fontSize:'0.72rem', color:'var(--text-secondary)', fontStyle:'italic' }}>{res.occasion}</p>
                  )}
                </div>
                <div style={{ display:'flex', gap:'8px' }}>
                  {res.status === 'confirmed' && (
                    <button
                      onClick={() => cancelReservation(res.id)}
                      style={{
                        padding:'8px 14px', background:'transparent', border:'1px solid rgba(239,68,68,0.3)',
                        color:'#ef4444', fontFamily:'var(--font-sans)', fontSize:'0.62rem', fontWeight:600,
                        letterSpacing:'0.12em', textTransform:'uppercase', cursor:'pointer', display:'flex', alignItems:'center', gap:'5px',
                      }}
                    >
                      <XCircle size={12} /> Cancel
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
