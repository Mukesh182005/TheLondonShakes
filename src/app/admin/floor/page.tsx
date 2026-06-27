'use client';

import React, { useState } from 'react';
import { RefreshCw, Users } from 'lucide-react';

type TableStatus = 'available' | 'occupied' | 'reserved' | 'cleaning';

type Table = {
  id:      string;
  number:  number;
  seats:   number;
  status:  TableStatus;
  guestName?: string;
  since?:  string;
};

const INITIAL_TABLES: Table[] = [
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

const STATUS_CONFIG: Record<TableStatus, { color: string; bg: string; label: string }> = {
  available: { color: '#10b981', bg: 'rgba(16,185,129,0.08)', label: 'Available' },
  occupied:  { color: '#f59e0b', bg: 'rgba(245,158,11,0.08)', label: 'Occupied'  },
  reserved:  { color: '#3b82f6', bg: 'rgba(59,130,246,0.08)',  label: 'Reserved'  },
  cleaning:  { color: '#6b7280', bg: 'rgba(107,114,128,0.08)', label: 'Cleaning'  },
};

export default function FloorPage() {
  const [tables, setTables] = useState<Table[]>(INITIAL_TABLES);
  const [selected, setSelected] = useState<Table | null>(null);

  const cycleTo = (id: string, next: TableStatus) => {
    setTables((prev) => prev.map((t) => t.id === id ? { ...t, status: next } : t));
    if (selected?.id === id) setSelected((prev) => prev ? { ...prev, status: next } : null);
  };

  const counts = {
    available: tables.filter((t) => t.status === 'available').length,
    occupied:  tables.filter((t) => t.status === 'occupied').length,
    reserved:  tables.filter((t) => t.status === 'reserved').length,
    cleaning:  tables.filter((t) => t.status === 'cleaning').length,
  };

  return (
    <div>
      {/* Header */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'32px', flexWrap:'wrap', gap:'16px' }}>
        <div>
          <h1 style={{ fontFamily:'var(--font-display)', fontSize:'2rem', color:'var(--cream)', marginBottom:'4px' }}>
            Floor Plan & POS
          </h1>
          <p style={{ fontFamily:'var(--font-sans)', fontSize:'0.78rem', color:'var(--text-secondary)' }}>
            Real-time table management
          </p>
        </div>
        <button
          onClick={() => setTables(INITIAL_TABLES)}
          style={{
            display:    'flex',
            alignItems: 'center',
            gap:        '8px',
            padding:    '10px 18px',
            background: 'transparent',
            border:     '1px solid var(--dark-border-2)',
            color:      'var(--text-secondary)',
            fontFamily: 'var(--font-sans)',
            fontSize:   '0.7rem',
            fontWeight: 600,
            letterSpacing:'0.12em',
            textTransform:'uppercase',
            cursor:     'pointer',
          }}
        >
          <RefreshCw size={13} />
          Reset
        </button>
      </div>

      {/* Status Summary */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'1px', background:'var(--dark-border)', border:'1px solid var(--dark-border)', marginBottom:'32px' }}>
        {(Object.keys(STATUS_CONFIG) as TableStatus[]).map((s) => (
          <div key={s} style={{ padding:'20px 24px', background:'var(--dark-card)', textAlign:'center' }}>
            <p style={{ fontFamily:'var(--font-display)', fontSize:'2rem', color: STATUS_CONFIG[s].color, lineHeight:1 }}>
              {counts[s]}
            </p>
            <p style={{ fontFamily:'var(--font-sans)', fontSize:'0.6rem', fontWeight:700, letterSpacing:'0.2em', textTransform:'uppercase', color:'var(--text-secondary)', marginTop:'4px' }}>
              {STATUS_CONFIG[s].label}
            </p>
          </div>
        ))}
      </div>

      <div style={{ display:'grid', gridTemplateColumns: selected ? '1fr 320px' : '1fr', gap:'24px', alignItems:'start' }}>

        {/* Table Grid */}
        <div style={{
          display:             'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
          gap:                 '12px',
        }}>
          {tables.map((table) => {
            const cfg      = STATUS_CONFIG[table.status];
            const isActive = selected?.id === table.id;
            return (
              <button
                key={table.id}
                onClick={() => setSelected(isActive ? null : table)}
                style={{
                  display:       'flex',
                  flexDirection: 'column',
                  alignItems:    'center',
                  justifyContent:'center',
                  gap:           '6px',
                  padding:       '20px 16px',
                  background:    isActive ? cfg.bg : 'var(--dark-card)',
                  border:        `1px solid ${isActive ? cfg.color : (table.status !== 'available' ? `${cfg.color}50` : 'var(--dark-border-2)')}`,
                  cursor:        'pointer',
                  transition:    'all 0.2s ease',
                  position:      'relative',
                  minHeight:     '120px',
                }}
              >
                <span style={{
                  fontFamily:    'var(--font-display)',
                  fontSize:      '1.8rem',
                  fontWeight:    300,
                  color:         isActive ? cfg.color : 'var(--cream)',
                  lineHeight:    1,
                }}>
                  {table.number}
                </span>
                <div style={{ display:'flex', alignItems:'center', gap:'4px', color: cfg.color }}>
                  <Users size={11} />
                  <span style={{ fontFamily:'var(--font-sans)', fontSize:'0.62rem', fontWeight:600 }}>
                    {table.seats} seats
                  </span>
                </div>
                <span style={{
                  padding:       '2px 8px',
                  background:    `${cfg.color}18`,
                  border:        `1px solid ${cfg.color}40`,
                  color:         cfg.color,
                  fontSize:      '0.52rem',
                  fontWeight:    700,
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                }}>
                  {cfg.label}
                </span>
                {table.guestName && (
                  <span style={{ fontSize:'0.62rem', color:'var(--text-secondary)', textAlign:'center', maxWidth:'120px', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                    {table.guestName}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Table Detail Panel */}
        {selected && (
          <div style={{
            background:  'var(--dark-card-2)',
            border:      `1px solid ${STATUS_CONFIG[selected.status].color}40`,
            padding:     '28px',
            position:    'sticky',
            top:         '0',
          }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'24px' }}>
              <div>
                <p style={{ fontFamily:'var(--font-sans)', fontSize:'0.58rem', fontWeight:700, letterSpacing:'0.25em', textTransform:'uppercase', color:'var(--gold)', marginBottom:'4px' }}>Table</p>
                <p style={{ fontFamily:'var(--font-display)', fontSize:'3rem', color:'var(--cream)', lineHeight:1 }}>{selected.number}</p>
              </div>
              <button
                onClick={() => setSelected(null)}
                style={{ background:'transparent', border:'none', color:'var(--text-secondary)', cursor:'pointer', fontSize:'1.2rem', lineHeight:1 }}
              >
                ×
              </button>
            </div>

            <div style={{ display:'flex', flexDirection:'column', gap:'12px', marginBottom:'28px' }}>
              <div style={{ display:'flex', justifyContent:'space-between', padding:'10px 0', borderBottom:'1px solid var(--dark-border)' }}>
                <span style={{ fontSize:'0.75rem', color:'var(--text-secondary)' }}>Seats</span>
                <span style={{ fontSize:'0.75rem', color:'var(--cream)', fontWeight:600 }}>{selected.seats}</span>
              </div>
              <div style={{ display:'flex', justifyContent:'space-between', padding:'10px 0', borderBottom:'1px solid var(--dark-border)' }}>
                <span style={{ fontSize:'0.75rem', color:'var(--text-secondary)' }}>Status</span>
                <span style={{ fontSize:'0.75rem', color: STATUS_CONFIG[selected.status].color, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.1em' }}>
                  {STATUS_CONFIG[selected.status].label}
                </span>
              </div>
              {selected.guestName && (
                <div style={{ display:'flex', justifyContent:'space-between', padding:'10px 0', borderBottom:'1px solid var(--dark-border)' }}>
                  <span style={{ fontSize:'0.75rem', color:'var(--text-secondary)' }}>Guest</span>
                  <span style={{ fontSize:'0.75rem', color:'var(--cream)', fontWeight:600 }}>{selected.guestName}</span>
                </div>
              )}
              {selected.since && (
                <div style={{ display:'flex', justifyContent:'space-between', padding:'10px 0', borderBottom:'1px solid var(--dark-border)' }}>
                  <span style={{ fontSize:'0.75rem', color:'var(--text-secondary)' }}>Since</span>
                  <span style={{ fontSize:'0.75rem', color:'var(--cream)', fontWeight:600 }}>{selected.since}</span>
                </div>
              )}
            </div>

            {/* Actions */}
            <p style={{ fontFamily:'var(--font-sans)', fontSize:'0.6rem', fontWeight:700, letterSpacing:'0.2em', textTransform:'uppercase', color:'var(--text-secondary)', marginBottom:'12px' }}>
              Change Status
            </p>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'8px' }}>
              {(Object.keys(STATUS_CONFIG) as TableStatus[]).map((s) => (
                <button
                  key={s}
                  onClick={() => cycleTo(selected.id, s)}
                  disabled={selected.status === s}
                  style={{
                    padding:       '10px',
                    background:    selected.status === s ? `${STATUS_CONFIG[s].color}18` : 'transparent',
                    border:        `1px solid ${selected.status === s ? STATUS_CONFIG[s].color : 'var(--dark-border-2)'}`,
                    color:         selected.status === s ? STATUS_CONFIG[s].color : 'var(--text-secondary)',
                    fontFamily:    'var(--font-sans)',
                    fontSize:      '0.62rem',
                    fontWeight:    700,
                    letterSpacing: '0.12em',
                    textTransform: 'uppercase',
                    cursor:        selected.status === s ? 'default' : 'pointer',
                    opacity:       selected.status === s ? 0.8 : 1,
                  }}
                >
                  {STATUS_CONFIG[s].label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
