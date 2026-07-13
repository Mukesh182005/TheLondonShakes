'use client';

import React, { useState } from 'react';
import { useRestaurantStore } from '@/store/restaurantStore';
import { useIsMobile } from '@/hooks/useIsMobile';
import { Users, ShoppingBag, TrendingUp, Search, ChevronDown } from 'lucide-react';

const statusColor: Record<string, string> = { vip: '#f59e0b', regular: '#3b82f6', new: '#10b981' };

export default function CustomersPage() {
  const orders       = useRestaurantStore((s) => s.orders);
  const reservations = useRestaurantStore((s) => s.reservations);
  const isMobile     = useIsMobile();

  const [search, setSearch]     = useState('');
  const [sortBy, setSortBy]     = useState<'spent' | 'orders' | 'name'>('spent');

  // Build a customer profile map from orders + reservations
  type CustomerProfile = {
    name: string;
    email: string;
    phone: string;
    totalOrders: number;
    totalSpent: number;
    reservations: number;
    lastOrderAt: string | null;
    status: 'vip' | 'regular' | 'new';
  };

  const profileMap: Record<string, CustomerProfile> = {};

  orders.forEach((o) => {
    const key = o.address.email || o.customerName || 'Guest';
    if (!profileMap[key]) {
      profileMap[key] = {
        name: o.customerName || o.address.name || 'Guest',
        email: o.address.email || '—',
        phone: o.address.phone || '—',
        totalOrders: 0,
        totalSpent: 0,
        reservations: 0,
        lastOrderAt: null,
        status: 'new',
      };
    }
    profileMap[key].totalOrders += 1;
    profileMap[key].totalSpent  += o.total;
    if (!profileMap[key].lastOrderAt || o.createdAt > profileMap[key].lastOrderAt!) {
      profileMap[key].lastOrderAt = o.createdAt;
    }
    if (o.address.name && profileMap[key].name === 'Guest') profileMap[key].name = o.address.name;
    if (o.address.phone) profileMap[key].phone = o.address.phone;
  });

  reservations.forEach((r) => {
    const key = r.email || r.name;
    if (!profileMap[key]) {
      profileMap[key] = {
        name: r.name, email: r.email || '—', phone: r.phone || '—',
        totalOrders: 0, totalSpent: 0, reservations: 0, lastOrderAt: null, status: 'new',
      };
    }
    profileMap[key].reservations += 1;
    if (r.email && profileMap[key].email === '—') profileMap[key].email = r.email;
    if (r.phone && profileMap[key].phone === '—') profileMap[key].phone = r.phone;
  });

  // Classify status
  Object.values(profileMap).forEach((c) => {
    if (c.totalSpent >= 1000 || c.totalOrders >= 5) c.status = 'vip';
    else if (c.totalOrders >= 2) c.status = 'regular';
    else c.status = 'new';
  });

  let customersList = Object.values(profileMap);

  // Search
  if (search.trim()) {
    const q = search.toLowerCase();
    customersList = customersList.filter((c) =>
      c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q) || c.phone.includes(q)
    );
  }

  // Sort
  const customers = customersList.toSorted((a, b) => {
    if (sortBy === 'spent')  return b.totalSpent - a.totalSpent;
    if (sortBy === 'orders') return b.totalOrders - a.totalOrders;
    return a.name.localeCompare(b.name);
  });

  const totalCustomers = customers.length;
  const vipCount       = customers.filter((c) => c.status === 'vip').length;
  const totalRevenue   = customers.reduce((s, c) => s + c.totalSpent, 0);

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '28px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', color: 'var(--cream)', marginBottom: '4px' }}>Customers</h1>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Guest profiles built from orders and reservations</p>
        </div>
      </div>

      {/* KPI Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1px', background: 'var(--dark-border)', border: '1px solid var(--dark-border)', marginBottom: '28px' }}>
        {[
          { label: 'Total Customers', value: totalCustomers, icon: <Users size={16} />, color: '#3b82f6' },
          { label: 'VIP Guests',      value: vipCount,       icon: <TrendingUp size={16} />, color: '#f59e0b' },
          { label: 'Total Revenue',   value: `₹${totalRevenue.toLocaleString('en-IN')}`, icon: <ShoppingBag size={16} />, color: 'var(--gold)' },
        ].map((kpi, i) => (
          <div key={i} style={{ background: 'var(--dark-card)', padding: '24px', display: 'flex', gap: '16px', alignItems: 'center' }}>
            <div style={{ color: kpi.color, opacity: 0.7 }}>{kpi.icon}</div>
            <div>
              <p style={{ fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--text-secondary)', marginBottom: '4px' }}>{kpi.label}</p>
              <p style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', color: 'var(--cream)', lineHeight: 1 }}>{kpi.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
          <Search size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            style={{
              width: '100%', padding: '10px 14px 10px 36px',
              background: 'var(--dark-surface)', border: '1px solid var(--dark-border)',
              color: 'var(--cream)', fontFamily: 'var(--font-sans)', fontSize: '0.85rem', outline: 'none',
              boxSizing: 'border-box',
            }}
            placeholder="Search name, email or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div style={{ position: 'relative' }}>
          <select
            style={{
              padding: '10px 36px 10px 14px', background: 'var(--dark-surface)',
              border: '1px solid var(--dark-border)', color: 'var(--cream)',
              fontFamily: 'var(--font-sans)', fontSize: '0.82rem', outline: 'none', appearance: 'none', cursor: 'pointer',
            }}
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
          >
            <option value="spent">Sort by Spent</option>
            <option value="orders">Sort by Orders</option>
            <option value="name">Sort by Name</option>
          </select>
          <ChevronDown size={14} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)', pointerEvents: 'none' }} />
        </div>
      </div>

      {/* Customers Table / Card List */}
      {isMobile ? (
        /* Mobile card list */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {customers.length === 0 ? (
            <div style={{ padding: '48px', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
              {search ? 'No customers match your search.' : 'No customer data yet.'}
            </div>
          ) : (
            customers.map((c, idx) => (
              <div key={idx} style={{ background: 'var(--dark-card)', border: '1px solid var(--dark-border)', padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <p style={{ fontFamily: 'var(--font-sans)', fontSize: '0.92rem', fontWeight: 700, color: 'var(--cream)', marginBottom: '2px' }}>{c.name}</p>
                    {c.lastOrderAt && <p style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Last: {new Date(c.lastOrderAt).toLocaleDateString('en-IN')}</p>}
                  </div>
                  <span style={{ padding: '3px 10px', fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', background: `${statusColor[c.status]}15`, color: statusColor[c.status], border: `1px solid ${statusColor[c.status]}30` }}>{c.status.toUpperCase()}</span>
                </div>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{c.email}</span>
                  {c.phone !== '—' && <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{c.phone}</span>}
                </div>
                <div style={{ display: 'flex', gap: '20px' }}>
                  <div><p style={{ fontSize: '0.6rem', color: 'var(--text-muted)', marginBottom: '2px' }}>ORDERS</p><p style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', color: 'var(--cream)' }}>{c.totalOrders}</p></div>
                  <div><p style={{ fontSize: '0.6rem', color: 'var(--text-muted)', marginBottom: '2px' }}>SPENT</p><p style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', color: 'var(--gold)' }}>₹{c.totalSpent.toLocaleString('en-IN')}</p></div>
                  <div><p style={{ fontSize: '0.6rem', color: 'var(--text-muted)', marginBottom: '2px' }}>RESERVATIONS</p><p style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', color: 'var(--cream)' }}>{c.reservations}</p></div>
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        /* Desktop table */
        <div style={{ background: 'var(--dark-card)', border: '1px solid var(--dark-border)' }}>
          {/* Head */}
          <div style={{
            display: 'grid', gridTemplateColumns: '2fr 1.5fr 1fr 1fr 1fr 80px',
            padding: '12px 20px', borderBottom: '1px solid var(--dark-border)',
            fontFamily: 'var(--font-sans)', fontSize: '0.58rem', fontWeight: 700,
            letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--text-muted)',
          }}>
            <span>Customer</span>
            <span>Contact</span>
            <span>Orders</span>
            <span>Spent</span>
            <span>Reservations</span>
            <span>Status</span>
          </div>

          {customers.length === 0 ? (
            <div style={{ padding: '48px', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
              {search ? 'No customers match your search.' : 'No customer data yet. Orders and reservations will appear here.'}
            </div>
          ) : (
            customers.map((c, idx) => (
              <div
                key={idx}
                style={{
                  display: 'grid', gridTemplateColumns: '2fr 1.5fr 1fr 1fr 1fr 80px',
                  padding: '14px 20px', alignItems: 'center',
                  borderBottom: idx < customers.length - 1 ? '1px solid var(--dark-border)' : 'none',
                  transition: 'background 0.15s ease',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--dark-surface)')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
              >
                <div>
                  <p style={{ fontFamily: 'var(--font-sans)', fontSize: '0.86rem', fontWeight: 600, color: 'var(--cream)', marginBottom: '2px' }}>{c.name}</p>
                  {c.lastOrderAt && (
                    <p style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                      Last order: {new Date(c.lastOrderAt).toLocaleDateString('en-IN')}
                    </p>
                  )}
                </div>
                <div>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '2px' }}>{c.email}</p>
                  <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{c.phone}</p>
                </div>
                <p style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', color: 'var(--cream)' }}>{c.totalOrders}</p>
                <p style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', color: 'var(--gold)' }}>₹{c.totalSpent.toLocaleString('en-IN')}</p>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{c.reservations}</p>
                <span style={{
                  padding: '3px 8px', fontSize: '0.55rem', fontWeight: 700, letterSpacing: '0.1em',
                  textTransform: 'uppercase', background: `${statusColor[c.status]}15`,
                  color: statusColor[c.status], border: `1px solid ${statusColor[c.status]}30`,
                }}>
                  {c.status.toUpperCase()}
                </span>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
