'use client';

import React, { useState } from 'react';
import { Truck, MapPin, Phone, Clock, CheckCircle } from 'lucide-react';

type Delivery = {
  id:       string;
  orderId:  string;
  customer: string;
  address:  string;
  phone:    string;
  items:    string[];
  total:    number;
  status:   'picking-up' | 'on-route' | 'delivered' | 'failed';
  rider:    string;
  eta:      string;
  distance: string;
};

const MOCK: Delivery[] = [];

const STATUS_CFG = {
  'picking-up': { color:'#3b82f6', label:'Picking Up', bg:'rgba(59,130,246,0.08)' },
  'on-route':   { color:'#f59e0b', label:'On Route',   bg:'rgba(245,158,11,0.08)' },
  'delivered':  { color:'#10b981', label:'Delivered',  bg:'rgba(16,185,129,0.08)' },
  'failed':     { color:'#ef4444', label:'Failed',     bg:'rgba(239,68,68,0.08)'  },
};

export default function DeliveryPage() {
  const [deliveries, setDeliveries] = useState<Delivery[]>(MOCK);

  const bump = (id: string) => {
    setDeliveries((prev) => prev.map((d) => {
      if (d.id !== id) return d;
      const next = d.status === 'picking-up' ? 'on-route' : d.status === 'on-route' ? 'delivered' : d.status;
      return { ...d, status: next as Delivery['status'] };
    }));
  };

  const counts = {
    active:    deliveries.filter((d) => d.status !== 'delivered' && d.status !== 'failed').length,
    delivered: deliveries.filter((d) => d.status === 'delivered').length,
  };

  return (
    <div>
      <div style={{ marginBottom:'32px' }}>
        <h1 style={{ fontFamily:'var(--font-display)', fontSize:'2rem', color:'var(--cream)', marginBottom:'4px' }}>Delivery Management</h1>
        <p style={{ fontSize:'0.78rem', color:'var(--text-secondary)' }}>Live delivery board · {counts.active} active · {counts.delivered} completed today</p>
      </div>

      {/* Summary Strip */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'1px', background:'var(--dark-border)', border:'1px solid var(--dark-border)', marginBottom:'28px' }}>
        {Object.entries(STATUS_CFG).map(([key, cfg]) => (
          <div key={key} style={{ padding:'18px 20px', background:'var(--dark-card)', textAlign:'center' }}>
            <p style={{ fontFamily:'var(--font-display)', fontSize:'1.8rem', color: cfg.color, lineHeight:1 }}>
              {deliveries.filter((d) => d.status === key).length}
            </p>
            <p style={{ fontFamily:'var(--font-sans)', fontSize:'0.58rem', fontWeight:700, letterSpacing:'0.18em', textTransform:'uppercase', color:'var(--text-secondary)', marginTop:'4px' }}>
              {cfg.label}
            </p>
          </div>
        ))}
      </div>

      {/* Delivery Cards */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(320px,1fr))', gap:'16px' }}>
        {deliveries.map((d) => {
          const cfg = STATUS_CFG[d.status];
          return (
            <div key={d.id} style={{
              background:   'var(--dark-card)',
              border:       `1px solid ${cfg.color}30`,
              overflow:     'hidden',
              opacity:      d.status === 'delivered' ? 0.7 : 1,
              transition:   'border-color 0.3s ease',
            }}>
              {/* Header */}
              <div style={{ padding:'14px 18px', background: cfg.bg, borderBottom:`1px solid ${cfg.color}20`, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                <div>
                  <p style={{ fontFamily:'var(--font-sans)', fontSize:'0.58rem', fontWeight:700, letterSpacing:'0.2em', textTransform:'uppercase', color: cfg.color }}>
                    {d.orderId} · {cfg.label}
                  </p>
                  <p style={{ fontFamily:'var(--font-display)', fontSize:'1.1rem', color:'var(--cream)', marginTop:'2px' }}>{d.customer}</p>
                </div>
                <div style={{ textAlign:'right' }}>
                  <p style={{ fontFamily:'var(--font-display)', fontSize:'1.2rem', color:'var(--gold)' }}>₹{d.total}</p>
                  <p style={{ fontSize:'0.65rem', color:'var(--text-secondary)', marginTop:'2px' }}>{d.distance}</p>
                </div>
              </div>

              {/* Details */}
              <div style={{ padding:'16px 18px', display:'flex', flexDirection:'column', gap:'10px' }}>
                <div style={{ display:'flex', gap:'10px', alignItems:'flex-start' }}>
                  <MapPin size={13} color={cfg.color} style={{ marginTop:'2px', flexShrink:0 }} />
                  <p style={{ fontSize:'0.78rem', color:'var(--text-secondary)', lineHeight:1.5 }}>{d.address}</p>
                </div>
                <div style={{ display:'flex', gap:'10px', alignItems:'center' }}>
                  <Phone size={13} color="var(--text-muted)" style={{ flexShrink:0 }} />
                  <p style={{ fontSize:'0.78rem', color:'var(--text-secondary)' }}>{d.phone}</p>
                </div>
                <div style={{ display:'flex', gap:'10px', alignItems:'center' }}>
                  <Truck size={13} color="var(--text-muted)" style={{ flexShrink:0 }} />
                  <p style={{ fontSize:'0.78rem', color:'var(--text-secondary)' }}>{d.rider}</p>
                </div>
                <div style={{ display:'flex', gap:'10px', alignItems:'center' }}>
                  <Clock size={13} color="var(--text-muted)" style={{ flexShrink:0 }} />
                  <p style={{ fontSize:'0.78rem', color: d.status === 'delivered' ? '#10b981' : 'var(--cream)', fontWeight: d.status !== 'delivered' ? 600 : 400 }}>
                    {d.status === 'delivered' ? 'Delivered' : `ETA: ${d.eta}`}
                  </p>
                </div>

                {/* Order Items */}
                <div style={{ marginTop:'4px', paddingTop:'12px', borderTop:'1px solid var(--dark-border)' }}>
                  {d.items.map((item, i) => (
                    <p key={i} style={{ fontSize:'0.75rem', color:'var(--text-secondary)', marginBottom:'3px' }}>· {item}</p>
                  ))}
                </div>
              </div>

              {/* Actions */}
              {d.status !== 'delivered' && d.status !== 'failed' && (
                <div style={{ padding:'12px 18px', borderTop:'1px solid var(--dark-border)' }}>
                  <button
                    onClick={() => bump(d.id)}
                    style={{
                      width:         '100%',
                      padding:       '10px',
                      background:    `${cfg.color}14`,
                      border:        `1px solid ${cfg.color}40`,
                      color:         cfg.color,
                      fontFamily:    'var(--font-sans)',
                      fontSize:      '0.65rem',
                      fontWeight:    700,
                      letterSpacing: '0.15em',
                      textTransform: 'uppercase',
                      cursor:        'pointer',
                      display:       'flex',
                      alignItems:    'center',
                      justifyContent:'center',
                      gap:           '8px',
                    }}
                  >
                    {d.status === 'picking-up' ? <><Truck size={13} /> Mark On Route</> : <><CheckCircle size={13} /> Mark Delivered</>}
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
