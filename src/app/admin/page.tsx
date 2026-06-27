'use client';

import React from 'react';
import Link from 'next/link';
import { useRestaurantStore } from '@/store/restaurantStore';
import {
  TrendingUp, ShoppingBag, Users, Clock,
  ArrowRight, AlertCircle, CheckCircle, Star,
  UtensilsCrossed, Truck, Calendar
} from 'lucide-react';

function StatCard({ label, value, sub, color = 'var(--gold)', icon }: {
  label: string; value: string | number; sub?: string; color?: string; icon: React.ReactNode;
}) {
  return (
    <div style={{
      background: 'var(--dark-card)',
      border:     '1px solid var(--dark-border)',
      padding:    '28px',
      display:    'flex',
      gap:        '20px',
      alignItems: 'flex-start',
    }}>
      <div style={{
        width:   '44px',
        height:  '44px',
        background: `${color}14`,
        border:     `1px solid ${color}30`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color,
        flexShrink: 0,
      }}>
        {icon}
      </div>
      <div>
        <p style={{ fontFamily:'var(--font-sans)', fontSize:'0.6rem', fontWeight:700, letterSpacing:'0.2em', textTransform:'uppercase', color:'var(--text-secondary)', marginBottom:'6px' }}>
          {label}
        </p>
        <p style={{ fontFamily:'var(--font-display)', fontSize:'2rem', color:'var(--cream)', lineHeight:1, marginBottom:'4px' }}>
          {value}
        </p>
        {sub && <p style={{ fontSize:'0.72rem', color:'var(--text-secondary)' }}>{sub}</p>}
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const orders      = useRestaurantStore((s) => s.orders);

  const today       = new Date().toLocaleDateString('en-IN');
  const todayOrders = orders.filter((o) => new Date(o.createdAt).toLocaleDateString('en-IN') === today);
  const revenue     = todayOrders.reduce((sum, o) => sum + o.total, 0);
  const preparing   = orders.filter((o) => o.status === 'preparing').length;
  const pending     = orders.filter((o) => o.status === 'confirmed').length;

  const recentOrders = [...orders].sort((a, b) =>
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  ).slice(0, 6);

  const statusColor: Record<string, string> = {
    confirmed:          '#3b82f6',
    preparing:          '#f59e0b',
    'out for delivery': '#8b5cf6',
    delivered:          '#10b981',
    cancelled:          '#ef4444',
  };

  const quickLinks = [
    { label:'Kitchen Display', href:'/admin/kds',          icon: UtensilsCrossed, color:'#f59e0b' },
    { label:'Floor Plan',       href:'/admin/floor',         icon: Users,          color:'#10b981' },
    { label:'Reservations',     href:'/admin/reservations',  icon: Calendar,       color:'#3b82f6' },
    { label:'Deliveries',       href:'/admin/delivery',      icon: Truck,          color:'#8b5cf6' },
    { label:'Menu Editor',      href:'/admin/menu',          icon: ShoppingBag,    color:'var(--gold)' },
    { label:'Site Settings',    href:'/admin/settings',      icon: Star,           color:'#ec4899' },
  ];

  return (
    <div>
      {/* Welcome */}
      <div style={{ marginBottom:'40px' }}>
        <h1 style={{ fontFamily:'var(--font-display)', fontSize:'2.4rem', color:'var(--cream)', lineHeight:1, marginBottom:'8px' }}>
          Good {new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 17 ? 'Afternoon' : 'Evening'}
        </h1>
        <p style={{ fontFamily:'var(--font-serif)', fontStyle:'italic', fontSize:'1rem', color:'var(--text-secondary)' }}>
          The London Shakes — {new Date().toLocaleDateString('en-IN', { weekday:'long', day:'numeric', month:'long' })}
        </p>
      </div>

      {/* Alerts */}
      {(preparing > 0 || pending > 0) && (
        <div style={{
          display:      'flex',
          alignItems:   'center',
          gap:          '12px',
          padding:      '14px 20px',
          background:   'rgba(245,158,11,0.08)',
          border:       '1px solid rgba(245,158,11,0.3)',
          marginBottom: '28px',
        }}>
          <AlertCircle size={16} color="#f59e0b" />
          <p style={{ fontFamily:'var(--font-sans)', fontSize:'0.78rem', color:'#f59e0b' }}>
            {preparing > 0 && `${preparing} order${preparing > 1 ? 's' : ''} being prepared in kitchen.`}
            {preparing > 0 && pending > 0 && ' '}
            {pending > 0 && `${pending} order${pending > 1 ? 's' : ''} awaiting confirmation.`}
          </p>
          <Link href="/admin/kds" style={{ marginLeft:'auto', fontSize:'0.65rem', fontWeight:700, letterSpacing:'0.15em', textTransform:'uppercase', color:'#f59e0b', textDecoration:'none' }}>
            View KDS →
          </Link>
        </div>
      )}

      {/* KPIs */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))', gap:'1px', background:'var(--dark-border)', border:'1px solid var(--dark-border)', marginBottom:'32px' }}>
        <StatCard label="Today's Revenue"    value={`₹${revenue.toLocaleString('en-IN')}`} sub={`${todayOrders.length} orders`}   color="var(--gold)"  icon={<TrendingUp size={18} />} />
        <StatCard label="Total Orders"       value={orders.length}                           sub="All time"                         color="#3b82f6"       icon={<ShoppingBag size={18} />} />
        <StatCard label="Avg Order Value"    value={orders.length ? `₹${Math.round(orders.reduce((s,o)=>s+o.total,0)/orders.length)}` : '—'} sub="per order" color="#10b981" icon={<Star size={18} />} />
        <StatCard label="Active"             value={preparing + pending}                     sub="Preparing / Pending"             color="#f59e0b"        icon={<Clock size={18} />} />
      </div>

      {/* Main Grid */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 300px', gap:'24px', alignItems:'start' }}>

        {/* Recent Orders */}
        <div style={{ background:'var(--dark-card)', border:'1px solid var(--dark-border)' }}>
          <div style={{ padding:'20px 24px', borderBottom:'1px solid var(--dark-border)', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
            <h2 style={{ fontFamily:'var(--font-display)', fontSize:'1.2rem', color:'var(--cream)' }}>Recent Orders</h2>
            <Link href="/admin/orders" style={{ fontFamily:'var(--font-sans)', fontSize:'0.65rem', fontWeight:600, letterSpacing:'0.15em', textTransform:'uppercase', color:'var(--gold)', textDecoration:'none', display:'flex', alignItems:'center', gap:'4px' }}>
              All Orders <ArrowRight size={12} />
            </Link>
          </div>

          {recentOrders.length === 0 ? (
            <div style={{ padding:'40px', textAlign:'center', color:'var(--text-secondary)', fontSize:'0.875rem' }}>
              No orders yet today.
            </div>
          ) : (
            <div>
              {recentOrders.map((order, i) => (
                <div key={order.id} style={{
                  padding:      '16px 24px',
                  borderBottom: i < recentOrders.length - 1 ? '1px solid var(--dark-border)' : 'none',
                  display:      'flex',
                  alignItems:   'center',
                  gap:          '16px',
                }}>
                  <div style={{
                    width:   '36px',
                    height:  '36px',
                    background: `${statusColor[order.status] || 'var(--gold)'}14`,
                    border:  `1px solid ${statusColor[order.status] || 'var(--gold)'}30`,
                    display: 'flex',
                    alignItems:'center',
                    justifyContent:'center',
                    flexShrink: 0,
                  }}>
                    {order.status === 'delivered' ? <CheckCircle size={14} color="#10b981" /> : <ShoppingBag size={14} color={statusColor[order.status] || 'var(--gold)'} />}
                  </div>

                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'baseline', marginBottom:'2px' }}>
                      <p style={{ fontFamily:'var(--font-sans)', fontSize:'0.82rem', fontWeight:600, color:'var(--cream)' }}>
                        {order.customerName || 'Guest'}
                      </p>
                      <p style={{ fontFamily:'var(--font-display)', fontSize:'0.95rem', color:'var(--gold)' }}>
                        ₹{order.total}
                      </p>
                    </div>
                    <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
                      <span style={{ fontSize:'0.68rem', color:'var(--text-secondary)' }}>
                        {order.items.length} item{order.items.length > 1 ? 's' : ''} · {new Date(order.createdAt).toLocaleTimeString('en-IN', { hour:'2-digit', minute:'2-digit' })}
                      </span>
                      <span style={{
                        padding:    '1px 7px',
                        background: `${statusColor[order.status] || 'var(--gold)'}14`,
                        color:      statusColor[order.status] || 'var(--gold)',
                        fontSize:   '0.55rem',
                        fontWeight: 700,
                        letterSpacing:'0.1em',
                        textTransform:'uppercase',
                      }}>
                        {order.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Links */}
        <div style={{ display:'flex', flexDirection:'column', gap:'8px' }}>
          <p style={{ fontFamily:'var(--font-sans)', fontSize:'0.6rem', fontWeight:700, letterSpacing:'0.25em', textTransform:'uppercase', color:'var(--text-secondary)', marginBottom:'8px' }}>
            Quick Access
          </p>
          {quickLinks.map((l) => {
            const Icon = l.icon;
            return (
              <Link
                key={l.href}
                href={l.href}
                style={{
                  display:    'flex',
                  alignItems: 'center',
                  gap:        '14px',
                  padding:    '16px 20px',
                  background: 'var(--dark-card)',
                  border:     '1px solid var(--dark-border)',
                  textDecoration:'none',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = `${l.color}50`; (e.currentTarget as HTMLElement).style.background = 'var(--dark-card-2)'; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--dark-border)'; (e.currentTarget as HTMLElement).style.background = 'var(--dark-card)'; }}
              >
                <Icon size={16} color={l.color} />
                <span style={{ fontFamily:'var(--font-sans)', fontSize:'0.78rem', fontWeight:500, color:'var(--cream)', flex:1 }}>
                  {l.label}
                </span>
                <ArrowRight size={13} color="var(--text-muted)" />
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
