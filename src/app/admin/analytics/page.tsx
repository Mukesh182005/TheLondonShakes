'use client';

import React, { useState, useEffect } from 'react';
import { useRestaurantStore } from '@/store/restaurantStore';
import { BarChart2, TrendingUp, DollarSign, ShoppingBag, CreditCard, Clock, Utensils, Truck, Printer, FileText, Activity, User, ShieldAlert, Calendar } from 'lucide-react';

interface AuditLog {
  id: string;
  action: string;
  details: string;
  adminEmail: string;
  createdAt: string;
}

export default function AnalyticsPage() {
  const orders = useRestaurantStore((s) => s.orders);
  const setOrders = useRestaurantStore((s) => s.setOrders);
  const [timeRange, setTimeRange] = useState<'today' | 'week' | 'month' | 'year' | 'all'>('all');
  const [activeTab, setActiveTab] = useState<'sales' | 'audit'>('sales');
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(false);

  // Fetch orders from database on mount for latest analytics
  useEffect(() => {
    fetch('/api/orders')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setOrders(data);
        }
      })
      .catch((err) => console.warn('Failed to load orders for analytics:', err));
  }, [setOrders]);

  // Fetch audit logs on mount & tab change
  useEffect(() => {
    if (activeTab === 'audit') {
      setLoadingLogs(true);
      fetch('/api/admin/logs')
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.logs) {
            setLogs(data.logs);
          }
        })
        .catch((err) => console.warn('Failed to load audit logs:', err))
        .finally(() => setLoadingLogs(false));
    }
  }, [activeTab]);

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
    if (timeRange === 'month') return diffDays <= 30;
    if (timeRange === 'year') return diffDays <= 365;
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

  // Food Items calculation
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
    .sort((a, b) => b.qty - a.qty);

  // Helper to format action names
  const formatAction = (act: string) => {
    switch (act) {
      case 'START_SERVER': return { label: 'Start Server', color: '#10b981', bg: 'rgba(16,185,129,0.06)' };
      case 'STOP_SERVER': return { label: 'Stop Server', color: '#ef4444', bg: 'rgba(239,68,68,0.06)' };
      case 'CLEAR_ORDERS': return { label: 'Clear All Orders', color: '#f59e0b', bg: 'rgba(245,158,11,0.06)' };
      case 'TOGGLE_ORDER_ACCEPTANCE': return { label: 'Order Settings Toggle', color: '#3b82f6', bg: 'rgba(59,130,246,0.06)' };
      case 'EDIT_SETTINGS': return { label: 'Edit Site Info', color: 'var(--gold)', bg: 'rgba(197,168,92,0.06)' };
      default: return { label: act, color: '#a1a1aa', bg: 'rgba(255,255,255,0.04)' };
    }
  };

  // Printable Iframe generator (For PDF & Print)
  const printReport = () => {
    const printWindow = window.open('about:blank', '_blank', 'left=200,top=200,width=800,height=800');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>The London Shakes - Performance Report</title>
            <style>
              body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 40px; color: #111; background: #fff; line-height: 1.5; }
              .header { border-bottom: 2px solid #c5a85c; padding-bottom: 20px; margin-bottom: 30px; }
              .logo { font-size: 24px; font-weight: bold; color: #111; letter-spacing: 1px; }
              .tagline { font-size: 12px; color: #666; text-transform: uppercase; margin-top: 4px; }
              .title { font-size: 20px; margin-top: 20px; font-weight: 600; }
              .meta { font-size: 13px; color: #555; margin-bottom: 20px; }
              .grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-bottom: 30px; }
              .kpi-card { border: 1px solid #eee; padding: 20px; background: #f9f9f9; }
              .kpi-title { font-size: 11px; text-transform: uppercase; color: #777; font-weight: 700; margin-bottom: 6px; }
              .kpi-value { font-size: 22px; font-weight: bold; color: #111; }
              .section { margin-bottom: 40px; }
              .section-title { font-size: 15px; text-transform: uppercase; border-bottom: 1px solid #eee; padding-bottom: 8px; margin-bottom: 16px; color: #333; }
              table { width: 100%; border-collapse: collapse; }
              th, td { border-bottom: 1px solid #eee; padding: 10px 12px; text-align: left; font-size: 13px; }
              th { background: #f2f2f2; color: #333; font-weight: 600; }
              .footer { font-size: 11px; color: #888; text-align: center; margin-top: 50px; border-top: 1px solid #eee; padding-top: 15px; }
            </style>
          </head>
          <body>
            <div class="header">
              <div class="logo">THE LONDON SHAKES</div>
              <div class="tagline">Gourmet shakes & cafe - Admin Portal</div>
              <div class="title">Performance Analysis Report</div>
              <div class="meta">Report Range: ${timeRange.toUpperCase()} | Generated: ${new Date().toLocaleString()}</div>
            </div>

            <div class="grid">
              <div class="kpi-card">
                <div class="kpi-title">Gross Revenue</div>
                <div class="kpi-value">INR ${totalRevenue.toLocaleString('en-IN')}</div>
              </div>
              <div class="kpi-card">
                <div class="kpi-title">Orders Processed</div>
                <div class="kpi-value">${totalOrdersCount}</div>
              </div>
              <div class="kpi-card">
                <div class="kpi-title">Average Order Value</div>
                <div class="kpi-value">INR ${avgOrderValue.toLocaleString('en-IN')}</div>
              </div>
            </div>

            <div class="section">
              <div class="section-title">Operational breakdown</div>
              <table>
                <thead>
                  <tr>
                    <th>Dining Channel</th>
                    <th>Orders Collected / Processed</th>
                    <th>Percentage of Total</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>In Cafe / Dine-in</td>
                    <td>${dineInCount}</td>
                    <td>${totalOrdersCount > 0 ? Math.round((dineInCount / totalOrdersCount) * 100) : 0}%</td>
                  </tr>
                  <tr>
                    <td>Takeaway / Pickup</td>
                    <td>${pickupCount}</td>
                    <td>${totalOrdersCount > 0 ? Math.round((pickupCount / totalOrdersCount) * 100) : 0}%</td>
                  </tr>
                  <tr>
                    <td>Home Delivery</td>
                    <td>${deliveryCount}</td>
                    <td>${totalOrdersCount > 0 ? Math.round((deliveryCount / totalOrdersCount) * 100) : 0}%</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div class="section">
              <div class="section-title">Dish & Food Item Popularity</div>
              <table>
                <thead>
                  <tr>
                    <th>Item Name</th>
                    <th>Total Qty Ordered</th>
                    <th>Gross Sales Amount</th>
                  </tr>
                </thead>
                <tbody>
                  ${topItems.map(item => `
                    <tr>
                      <td>${item.name}</td>
                      <td>${item.qty}</td>
                      <td>INR ${item.sales.toLocaleString('en-IN')}</td>
                    </tr>
                  `).join('')}
                  ${topItems.length === 0 ? '<tr><td colspan="3" style="text-align:center;">No items ordered in this period.</td></tr>' : ''}
                </tbody>
              </table>
            </div>

            <div class="section">
              <div class="section-title">Detailed Orders Log</div>
              <table>
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Date & Time</th>
                    <th>Customer Name</th>
                    <th>Mobile</th>
                    <th>Email</th>
                    <th>Table No.</th>
                    <th>Created By</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  ${filteredOrders.map(o => {
                    const dateObj = new Date(o.createdAt);
                    const formattedDate = dateObj.toLocaleDateString('en-IN');
                    const formattedTime = dateObj.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
                    
                    const isPlacedByAdmin = o.adminPlaced || o.address.flat === 'ADMIN_PLACED' || o.address.email === 'admin@thelondon.co.uk' || o.address.email === 'thelondonshakesilchar@gmail.com';
                    const creator = isPlacedByAdmin ? 'Admin / Manager' : 'Customer (Online)';
                    
                    return `
                      <tr>
                        <td><strong>${o.id}</strong></td>
                        <td>${formattedDate} ${formattedTime}</td>
                        <td>${o.customerName || o.address.name || 'Guest'}</td>
                        <td>${o.address.phone || 'N/A'}</td>
                        <td>${o.address.email || 'N/A'}</td>
                        <td>${o.tableNumber || 'N/A'}</td>
                        <td style="color: ${isPlacedByAdmin ? '#c5a85c' : '#333'}; font-weight: ${isPlacedByAdmin ? 'bold' : 'normal'};">${creator}</td>
                        <td>INR ${o.total.toLocaleString('en-IN')}</td>
                      </tr>
                    `;
                  }).join('')}
                  ${filteredOrders.length === 0 ? '<tr><td colspan="8" style="text-align:center;">No orders found in this period.</td></tr>' : ''}
                </tbody>
              </table>
            </div>

            <div class="footer">
              * CONFIDENTIAL - Internal Use Only. This report was generated dynamically from live restaurant database logs.
            </div>
            <script>
              window.onload = function() {
                window.print();
                window.close();
              }
            <\/script>
          </body>
        </html>
      `);
      printWindow.document.close();
    }
  };

  // Word Document export (.doc)
  const downloadWordReport = () => {
    const htmlContent = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head>
        <title>The London Shakes - Performance Report</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          .header { border-bottom: 2px solid #c5a85c; padding-bottom: 10px; margin-bottom: 20px; }
          .logo { font-size: 22px; font-weight: bold; }
          .title { font-size: 18px; font-weight: bold; margin-top: 10px; }
          .meta { font-size: 11px; color: #555; }
          table { width: 100%; border-collapse: collapse; margin-top: 15px; margin-bottom: 25px; }
          th, td { border: 1px solid #ccc; padding: 8px; text-align: left; font-size: 12px; }
          th { background-color: #f2f2f2; font-weight: bold; }
          .kpi-box { border: 1px solid #ddd; background-color: #f9f9f9; padding: 12px; margin-bottom: 10px; }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="logo">THE LONDON SHAKES</div>
          <div class="title">Performance Analysis Report</div>
          <div class="meta">Report Range: ${timeRange.toUpperCase()} | Generated: ${new Date().toLocaleString()}</div>
        </div>

        <h3>Key Performance Indicators</h3>
        <div class="kpi-box">
          <strong>Gross Revenue:</strong> INR ${totalRevenue.toLocaleString('en-IN')}
        </div>
        <div class="kpi-box">
          <strong>Orders Processed:</strong> ${totalOrdersCount}
        </div>
        <div class="kpi-box">
          <strong>Average Order Value:</strong> INR ${avgOrderValue.toLocaleString('en-IN')}
        </div>

        <h3>Operational Channels</h3>
        <table>
          <thead>
            <tr>
              <th>Dining Channel</th>
              <th>Orders Collected</th>
              <th>Percentage</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>In Cafe / Dine-in</td>
              <td>${dineInCount}</td>
              <td>${totalOrdersCount > 0 ? Math.round((dineInCount / totalOrdersCount) * 100) : 0}%</td>
            </tr>
            <tr>
              <td>Takeaway / Pickup</td>
              <td>${pickupCount}</td>
              <td>${totalOrdersCount > 0 ? Math.round((pickupCount / totalOrdersCount) * 100) : 0}%</td>
            </tr>
            <tr>
              <td>Home Delivery</td>
              <td>${deliveryCount}</td>
              <td>${totalOrdersCount > 0 ? Math.round((deliveryCount / totalOrdersCount) * 100) : 0}%</td>
            </tr>
          </tbody>
        </table>

        <h3>Ordered Food Items</h3>
        <table>
          <thead>
            <tr>
              <th>Item Name</th>
              <th>Quantity Ordered</th>
              <th>Gross Sales</th>
            </tr>
          </thead>
          <tbody>
            ${topItems.map(item => `
              <tr>
                <td>${item.name}</td>
                <td>${item.qty}</td>
                <td>INR ${item.sales.toLocaleString('en-IN')}</td>
              </tr>
            `).join('')}
            ${topItems.length === 0 ? '<tr><td colspan="3">No items ordered in this period.</td></tr>' : ''}
          </tbody>
        </table>

        <h3>Detailed Orders Log</h3>
        <table>
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Date & Time</th>
              <th>Customer Name</th>
              <th>Mobile</th>
              <th>Email</th>
              <th>Table No.</th>
              <th>Created By</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            ${filteredOrders.map(o => {
              const dateObj = new Date(o.createdAt);
              const formattedDate = dateObj.toLocaleDateString('en-IN');
              const formattedTime = dateObj.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
              
              const isPlacedByAdmin = o.adminPlaced || o.address.flat === 'ADMIN_PLACED' || o.address.email === 'admin@thelondon.co.uk' || o.address.email === 'thelondonshakesilchar@gmail.com';
              const creator = isPlacedByAdmin ? 'Admin / Manager' : 'Customer (Online)';
              
              return `
                <tr>
                  <td><strong>${o.id}</strong></td>
                  <td>${formattedDate} ${formattedTime}</td>
                  <td>${o.customerName || o.address.name || 'Guest'}</td>
                  <td>${o.address.phone || 'N/A'}</td>
                  <td>${o.address.email || 'N/A'}</td>
                  <td>${o.tableNumber || 'N/A'}</td>
                  <td>${creator}</td>
                  <td>INR ${o.total.toLocaleString('en-IN')}</td>
                </tr>
              `;
            }).join('')}
            ${filteredOrders.length === 0 ? '<tr><td colspan="8">No orders found in this period.</td></tr>' : ''}
          </tbody>
        </table>

        <p style="font-size: 9px; color: #888; margin-top: 40px; text-align: center;">
          * CONFIDENTIAL - Internal Use Only. Generated from The London Shakes database.
        </p>
      </body>
      </html>
    `;

    const blob = new Blob(['\ufeff' + htmlContent], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `thelondon_report_${timeRange}_${new Date().toISOString().split('T')[0]}.doc`;
    a.click();
  };

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '32px', flexWrap: 'wrap', gap: '20px' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', color: 'var(--cream)', marginBottom: '4px' }}>Analytics & Reports</h1>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Real-time business performance from order logs</p>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button
            onClick={printReport}
            style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              padding: '10px 18px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--dark-border)',
              color: 'var(--cream)', fontFamily: 'var(--font-sans)', fontSize: '0.7rem',
              fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.08)'; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.03)'; }}
          >
            <Printer size={14} color="var(--gold)" /> Print / Save PDF
          </button>

          <button
            onClick={downloadWordReport}
            style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              padding: '10px 18px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--dark-border)',
              color: 'var(--cream)', fontFamily: 'var(--font-sans)', fontSize: '0.7rem',
              fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.08)'; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.03)'; }}
          >
            <FileText size={14} color="var(--gold)" /> Export Word
          </button>
        </div>
      </div>

      {/* Tabs & Period Selector */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--dark-border)', marginBottom: '28px', flexWrap: 'wrap', gap: '16px', paddingBottom: '4px' }}>
        {/* Tabs */}
        <div style={{ display: 'flex', gap: '4px' }}>
          {[
            { id: 'sales', label: 'Sales & Orders', icon: <BarChart2 size={13} /> },
            { id: 'audit', label: 'System Audit Logs', icon: <Activity size={13} /> },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id as 'sales' | 'audit')}
              style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                padding: '10px 18px', background: 'transparent', border: 'none',
                borderBottom: activeTab === t.id ? '2px solid var(--gold)' : '2px solid transparent',
                color: activeTab === t.id ? 'var(--gold)' : 'var(--text-secondary)',
                fontFamily: 'var(--font-sans)', fontSize: '0.72rem', fontWeight: 600,
                letterSpacing: '0.1em', textTransform: 'uppercase', cursor: 'pointer',
                transition: 'all 0.2s ease',
                whiteSpace: 'nowrap',
              }}
            >
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        {/* Period Selector (Only shown on Sales tab) */}
        {activeTab === 'sales' && (
          <div style={{ display: 'flex', gap: '4px', background: 'var(--dark-surface)', border: '1px solid var(--dark-border)', padding: '2px', marginBottom: '8px' }}>
            {([
              { id: 'today', label: 'Daily (Today)' },
              { id: 'week', label: 'Weekly (7d)' },
              { id: 'month', label: 'Monthly (30d)' },
              { id: 'year', label: 'Yearly (365d)' },
              { id: 'all', label: 'All Time' }
            ] as const).map((r) => (
              <button
                key={r.id}
                onClick={() => setTimeRange(r.id)}
                style={{
                  padding: '6px 12px',
                  background: timeRange === r.id ? 'rgba(197,168,92,0.12)' : 'transparent',
                  border: 'none',
                  color: timeRange === r.id ? 'var(--gold)' : 'var(--text-secondary)',
                  fontFamily: 'var(--font-sans)',
                  fontSize: '0.6rem',
                  fontWeight: 600,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
              >
                {r.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ── SALES TAB CONTENT ── */}
      {activeTab === 'sales' && (
        <div id="report-printable-area">
          {/* KPI Cards Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '32px' }}>
            {/* Revenue */}
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

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
            {/* Top Items Table */}
            <div style={{ background: 'var(--dark-card)', border: '1px solid var(--dark-border)', padding: '28px' }}>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.15rem', color: 'var(--cream)', margin: '0 0 20px', paddingBottom: '12px', borderBottom: '1px solid var(--dark-border)' }}>
                <BarChart2 size={16} style={{ display: 'inline', marginRight: '8px', verticalAlign: 'middle' }} />
                Food & Dish Popularity
              </h3>

              {topItems.length === 0 ? (
                <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.82rem' }}>
                  No item sales logged in this period.
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

            {/* Channels & Payment Breakdown */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {/* Order Channels */}
              <div style={{ background: 'var(--dark-card)', border: '1px solid var(--dark-border)', padding: '28px' }}>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.15rem', color: 'var(--cream)', margin: '0 0 20px', paddingBottom: '12px', borderBottom: '1px solid var(--dark-border)' }}>
                  Dining & Ordering Channels
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {[
                    { label: 'In Cafe / Dine-In', count: dineInCount, icon: <Utensils size={14} />, color: '#10b981' },
                    { label: 'Takeaway / Pickup', count: pickupCount, icon: <Clock size={14} />, color: '#f59e0b' },
                    { label: 'Home Delivery', count: deliveryCount, icon: <Truck size={14} />, color: '#3b82f6' },
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

              {/* Payments */}
              <div style={{ background: 'var(--dark-card)', border: '1px solid var(--dark-border)', padding: '28px' }}>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.15rem', color: 'var(--cream)', margin: '0 0 20px', paddingBottom: '12px', borderBottom: '1px solid var(--dark-border)' }}>
                  Transactions & Payments
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

          {/* Detailed Orders Log Section inside Sales tab */}
          <div style={{ marginTop: '24px', background: 'var(--dark-card)', border: '1px solid var(--dark-border)', padding: '28px' }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.15rem', color: 'var(--cream)', margin: '0 0 20px', paddingBottom: '12px', borderBottom: '1px solid var(--dark-border)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Clock size={16} /> Detailed Orders Log
            </h3>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--dark-border-2)', color: 'var(--text-muted)' }}>
                    <th style={{ padding: '12px 8px' }}>Order ID</th>
                    <th style={{ padding: '12px 8px' }}>Date & Time</th>
                    <th style={{ padding: '12px 8px' }}>Customer Name</th>
                    <th style={{ padding: '12px 8px' }}>Mobile</th>
                    <th style={{ padding: '12px 8px' }}>Email</th>
                    <th style={{ padding: '12px 8px' }}>Table No.</th>
                    <th style={{ padding: '12px 8px' }}>Placed By</th>
                    <th style={{ padding: '12px 8px', textAlign: 'right' }}>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map((o) => {
                    const dateObj = new Date(o.createdAt);
                    const formattedDate = dateObj.toLocaleDateString('en-IN');
                    const formattedTime = dateObj.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
                    
                    const isPlacedByAdmin = o.adminPlaced || o.address.flat === 'ADMIN_PLACED' || o.address.email === 'admin@thelondon.co.uk' || o.address.email === 'thelondonshakesilchar@gmail.com';
                    const creator = isPlacedByAdmin ? 'Admin / Manager' : 'Customer (Online)';

                    return (
                      <tr key={o.id} style={{ borderBottom: '1px solid var(--dark-border)', color: 'var(--cream)' }}>
                        <td style={{ padding: '12px 8px', fontWeight: 'bold', color: 'var(--gold)' }}>{o.id}</td>
                        <td style={{ padding: '12px 8px', color: 'var(--text-secondary)' }}>{formattedDate} {formattedTime}</td>
                        <td style={{ padding: '12px 8px' }}>{o.customerName || o.address.name || 'Guest'}</td>
                        <td style={{ padding: '12px 8px', color: 'var(--text-secondary)' }}>{o.address.phone || 'N/A'}</td>
                        <td style={{ padding: '12px 8px', color: 'var(--text-secondary)' }}>{o.address.email || 'N/A'}</td>
                        <td style={{ padding: '12px 8px', color: 'var(--gold)' }}>{o.tableNumber || 'N/A'}</td>
                        <td style={{ padding: '12px 8px', color: isPlacedByAdmin ? 'var(--gold)' : 'var(--text-secondary)' }}>{creator}</td>
                        <td style={{ padding: '12px 8px', textAlign: 'right', fontWeight: 'bold' }}>₹{o.total.toLocaleString('en-IN')}</td>
                      </tr>
                    );
                  })}
                  {filteredOrders.length === 0 && (
                    <tr>
                      <td colSpan={8} style={{ padding: '30px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                        No orders logged in this period.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ── AUDIT LOGS TAB CONTENT ── */}
      {activeTab === 'audit' && (
        <div style={{ background: 'var(--dark-card)', border: '1px solid var(--dark-border)', padding: '28px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', paddingBottom: '12px', borderBottom: '1px solid var(--dark-border)' }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.15rem', color: 'var(--cream)', margin: 0 }}>
              <ShieldAlert size={16} style={{ display: 'inline', marginRight: '8px', verticalAlign: 'middle' }} />
              Immutable System Audit Logs
            </h3>
            <span style={{ fontSize: '0.62rem', background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.2)', padding: '4px 8px', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>
              Read-Only (Non-deletable)
            </span>
          </div>

          {loadingLogs ? (
            <div style={{ padding: '60px', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
              Retrieving secure system logs...
            </div>
          ) : logs.length === 0 ? (
            <div style={{ padding: '60px', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
              No system modifications have been logged yet.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {logs.map((log) => {
                const actInfo = formatAction(log.action);
                return (
                  <div
                    key={log.id}
                    style={{
                      background: 'var(--dark-surface)',
                      border: '1px solid var(--dark-border)',
                      padding: '16px 20px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      gap: '24px',
                      flexWrap: 'wrap',
                    }}
                  >
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1, minWidth: '240px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span
                          style={{
                            fontSize: '0.6rem',
                            fontWeight: 700,
                            letterSpacing: '0.08em',
                            textTransform: 'uppercase',
                            padding: '3px 8px',
                            color: actInfo.color,
                            background: actInfo.bg,
                            border: `1px solid ${actInfo.color}33`,
                          }}
                        >
                          {actInfo.label}
                        </span>
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <User size={11} /> {log.adminEmail}
                        </span>
                      </div>
                      <p style={{ fontSize: '0.78rem', color: 'var(--cream)', margin: 0, lineHeight: 1.45 }}>
                        {log.details.startsWith('{') || log.details.startsWith('[') ? (
                          <span style={{ fontFamily: 'monospace', fontSize: '0.72rem', color: '#a1a1aa' }}>
                            {log.details}
                          </span>
                        ) : (
                          log.details
                        )}
                      </p>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', fontSize: '0.68rem', whiteSpace: 'nowrap' }}>
                      <Calendar size={12} />
                      {new Date(log.createdAt).toLocaleString()}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
