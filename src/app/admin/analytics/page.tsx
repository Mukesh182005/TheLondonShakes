'use client';

import React, { useState } from 'react';
import { useRestaurantStore } from '@/store/restaurantStore';
import { BarChart2, TrendingUp, DollarSign, ShoppingBag, CreditCard, Clock, Utensils, Truck } from 'lucide-react';

export default function AnalyticsPage() {
  const orders = useRestaurantStore((s) => s.orders);
  const [timeRange, setTimeRange] = useState<'today' | 'week' | 'all'>('all');

  // Filter orders based on status (exclude cancelled)
  const validOrders = orders.filter((o) => o.status !== 'cancelled');

  // Time-based filtering
  const now = new Date();
  const filteredOrders = validOrders.filter((o) => {
    if (timeRange === 'all') return true;
    const orderDate = new Date(o.createdAt);
    const diffTime = Math.abs(now.getTime() - orderDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (timeRange === 'today') return diffDays <= 1;
    if (timeRange === 'week') return diffDays <= 7;
    return true;
  });

  // Aggregations
  const totalRevenue = filteredOrders.reduce((sum, o) => sum + o.total, 0);
  const totalOrdersCount = filteredOrders.length;
  const avgOrderValue = totalOrdersCount > 0 ? Math.round(totalRevenue / totalOrdersCount) : 0;

  // Breakdown by Type
  const dineInCount = filteredOrders.filter((o) => o.type === 'dine-in').length;
  const pickupCount = filteredOrders.filter((o) => o.type === 'pickup').length;
  const deliveryCount = filteredOrders.filter((o) => o.type === 'delivery').length;

  // Breakdown by Payment
  const upiCount = filteredOrders.filter((o) => o.paymentMethod === 'upi').length;
  const codCount = filteredOrders.filter((o) => o.paymentMethod === 'cod' || o.paymentMethod === 'card_on_delivery').length;

  // Top Items calculation
  const itemMap: Record<string, { qty: number; sales: number }> = {};
  filteredOrders.forEach((o) => {
    o.items.forEach((item) => {
      if (!itemMap[item.name]) {
        itemMap[item.name] = { qty: 0, sales: 0 };
      }
      itemMap[item.name].qty += item.qty;
      itemMap[item.name].sales += item.price * item.qty;
    });
  });

  const topItems = Object.entries(itemMap)
    .map(([name, data]) => ({ name, ...data }))
    .toSorted((a, b) => b.qty - a.qty)
    .slice(0, 5);

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', color: 'var(--cream)', marginBottom: '4px' }}>Analytics & Reports</h1>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Real-time business performance from order logs</p>
        </div>

        {/* Range Selector */}
        <div style={{ display: 'flex', gap: '4px', background: 'var(--dark-surface)', border: '1px solid var(--dark-border)', padding: '2px' }}>
          {(['today', 'week', 'all'] as const).map((r) => (
            <button
              key={r}
              onClick={() => setTimeRange(r)}
              style={{
                padding: '6px 14px',
                background: timeRange === r ? 'rgba(197,168,92,0.12)' : 'transparent',
                border: 'none',
                color: timeRange === r ? 'var(--gold)' : 'var(--text-secondary)',
                fontFamily: 'var(--font-sans)',
                fontSize: '0.62rem',
                fontWeight: 600,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
            >
              {r === 'today' ? 'Today' : r === 'week' ? 'Last 7 Days' : 'All Time'}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '32px' }}>
        {/* Rev */}
        <div style={{ background: 'var(--dark-card)', border: '1px solid var(--dark-border)', padding: '24px', display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ width: '42px', height: '42px', background: 'rgba(197,168,92,0.08)', border: '1px solid rgba(197,168,92,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--gold)' }}>
            <DollarSign size={20} />
          </div>
          <div>
            <p style={{ fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '4px' }}>Gross Revenue</p>
            <p style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', color: 'var(--cream)', margin: 0 }}>₹{totalRevenue.toLocaleString('en-IN')}</p>
          </div>
        </div>

        {/* Orders */}
        <div style={{ background: 'var(--dark-card)', border: '1px solid var(--dark-border)', padding: '24px', display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ width: '42px', height: '42px', background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3b82f6' }}>
            <ShoppingBag size={20} />
          </div>
          <div>
            <p style={{ fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '4px' }}>Orders Processed</p>
            <p style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', color: 'var(--cream)', margin: 0 }}>{totalOrdersCount}</p>
          </div>
        </div>

        {/* AOV */}
        <div style={{ background: 'var(--dark-card)', border: '1px solid var(--dark-border)', padding: '24px', display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ width: '42px', height: '42px', background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10b981' }}>
            <TrendingUp size={20} />
          </div>
          <div>
            <p style={{ fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '4px' }}>Average Order Value</p>
            <p style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', color: 'var(--cream)', margin: 0 }}>₹{avgOrderValue.toLocaleString('en-IN')}</p>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '24px', flexWrap: 'wrap' }}>
        {/* Left: Top Sellers */}
        <div style={{ background: 'var(--dark-card)', border: '1px solid var(--dark-border)', padding: '28px' }}>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.15rem', color: 'var(--cream)', margin: '0 0 20px', paddingBottom: '12px', borderBottom: '1px solid var(--dark-border)' }}>
            <BarChart2 size={16} style={{ display: 'inline', marginRight: '8px', verticalAlign: 'middle' }} />
            Top Selling Dishes
          </h3>

          {topItems.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.82rem' }}>
              No sales logs recorded for this period.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {topItems.map((item, idx) => (
                <div key={idx}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '0.82rem' }}>
                    <span style={{ color: 'var(--cream)', fontWeight: 600 }}>{item.name}</span>
                    <span style={{ color: 'var(--gold)', fontWeight: 600 }}>{item.qty} sold (₹{item.sales.toLocaleString('en-IN')})</span>
                  </div>
                  <div style={{ height: '4px', background: 'var(--dark-border-2)', width: '100%' }}>
                    <div
                      style={{
                        height: '4px',
                        background: 'var(--gold)',
                        width: `${(item.qty / topItems[0].qty) * 100}%`,
                        transition: 'width 0.5s ease',
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right: Operational Breakdown */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Order Types */}
          <div style={{ background: 'var(--dark-card)', border: '1px solid var(--dark-border)', padding: '28px' }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.15rem', color: 'var(--cream)', margin: '0 0 20px', paddingBottom: '12px', borderBottom: '1px solid var(--dark-border)' }}>
              Operational Channels
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {[
                { label: 'Dine-In Orders', count: dineInCount, icon: <Utensils size={14} />, color: '#10b981' },
                { label: 'Takeaway/Pickup', count: pickupCount, icon: <Clock size={14} />, color: '#f59e0b' },
                { label: 'Home Deliveries', count: deliveryCount, icon: <Truck size={14} />, color: '#3b82f6' },
              ].map((channel, i) => {
                const percent = totalOrdersCount > 0 ? Math.round((channel.count / totalOrdersCount) * 100) : 0;
                return (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '16px', background: 'var(--dark-surface)', padding: '12px 16px', border: '1px solid var(--dark-border)' }}>
                    <div style={{ color: channel.color }}>{channel.icon}</div>
                    <div style={{ flex: 1 }}>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>{channel.label}</span>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontSize: '0.85rem', color: 'var(--cream)', fontWeight: 700 }}>{channel.count}</span>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginLeft: '8px' }}>({percent}%)</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Payment Methods */}
          <div style={{ background: 'var(--dark-card)', border: '1px solid var(--dark-border)', padding: '28px' }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.15rem', color: 'var(--cream)', margin: '0 0 20px', paddingBottom: '12px', borderBottom: '1px solid var(--dark-border)' }}>
              Payment Methods
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {[
                { label: 'UPI / Online Payments', count: upiCount, icon: <CreditCard size={14} />, color: 'var(--gold)' },
                { label: 'Cash / COD Payments', count: codCount, icon: <DollarSign size={14} />, color: 'var(--text-secondary)' },
              ].map((pm, i) => {
                const percent = totalOrdersCount > 0 ? Math.round((pm.count / totalOrdersCount) * 100) : 0;
                return (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '16px', background: 'var(--dark-surface)', padding: '12px 16px', border: '1px solid var(--dark-border)' }}>
                    <div style={{ color: pm.color }}>{pm.icon}</div>
                    <div style={{ flex: 1 }}>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>{pm.label}</span>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontSize: '0.85rem', color: 'var(--cream)', fontWeight: 700 }}>{pm.count}</span>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginLeft: '8px' }}>({percent}%)</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
