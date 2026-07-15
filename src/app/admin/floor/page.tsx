'use client';

import React, { useState, useEffect } from 'react';
import { useCMSStore, useRestaurantStore, type TableStatus } from '@/store/restaurantStore';
import { useIsMobile } from '@/hooks/useIsMobile';
import { RefreshCw, Users, Trash2, PlusCircle } from 'lucide-react';
import { useTableOrdersSync } from '@/hooks/useTableOrdersSync';
import toast from 'react-hot-toast';

const STATUS_CONFIG: Record<TableStatus, { color: string; bg: string; label: string }> = {
  available: { color: '#10b981', bg: 'rgba(16,185,129,0.08)', label: 'Available' },
  occupied:  { color: '#f59e0b', bg: 'rgba(245,158,11,0.08)', label: 'Occupied'  },
  reserved:  { color: '#3b82f6', bg: 'rgba(59,130,246,0.08)',  label: 'Reserved'  },
  cleaning:  { color: '#6b7280', bg: 'rgba(107,114,128,0.08)', label: 'Cleaning'  },
};

export default function FloorPage() {
  const tables = useCMSStore((s) => s.tables);
  const addTable = useCMSStore((s) => s.addTable);
  const deleteTable = useCMSStore((s) => s.deleteTable);
  const updateTableStatus = useCMSStore((s) => s.updateTableStatus);
  const updateTableSeats = useCMSStore((s) => s.updateTableSeats);
  const resetTables = useCMSStore((s) => s.resetTables);
  const tableOrders = useRestaurantStore((s) => s.tableOrders);
  const setTableOrders = useRestaurantStore((s) => s.setTableOrders);
  const user = useRestaurantStore((s) => s.user);

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTableSeats, setNewTableSeats] = useState(4);
  const [editSeatsVal, setEditSeatsVal] = useState('4');
  const isMobile = useIsMobile();

  // Real-time sync — floor map updates instantly when any tab/device changes a table
  const { isLive } = useTableOrdersSync();

  const selected = tables.find((t) => t.id === selectedId) || null;
  const selectedActiveOrder = selected ? tableOrders.find((to) => to.tableNumber === `Table ${selected.number}`) : null;
  const selectedEffectiveStatus: TableStatus = selected 
    ? (selectedActiveOrder 
        ? (selectedActiveOrder.status === 'billed' ? 'reserved' : 'occupied')
        : selected.status)
    : 'available';

  // Sync local edit input state when selected table changes
  useEffect(() => {
    if (selected) {
      setEditSeatsVal(selected.seats.toString());
    }
  }, [selected]);

  const cycleTo = (id: string, next: TableStatus) => {
    updateTableStatus(id, next);

    const tbl = tables.find((t) => t.id === id);
    if (!tbl) return;

    fetch('/api/admin/logs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'UPDATE_TABLE_STATUS',
        details: `Updated Table ${tbl.number} status to "${next}".`,
        adminEmail: user?.email || 'unknown@thelondon.co.uk',
      }),
    }).catch(() => {});

    const tableNumber = `Table ${tbl.number}`;
    if (next === 'available' || next === 'cleaning') {
      // Clear any open orders for this table
      setTableOrders((prev) => prev.filter((to) => to.tableNumber !== tableNumber));
    } else if (next === 'occupied') {
      // Open an order if none exists
      const exists = tableOrders.some((to) => to.tableNumber === tableNumber);
      if (!exists) {
        setTableOrders((prev) => [
          ...prev,
          { tableNumber, items: [], customerName: 'Walk-in Guest', covers: tbl.seats, status: 'open', openedAt: new Date().toISOString() }
        ]);
      } else {
        setTableOrders((prev) => prev.map((to) => to.tableNumber === tableNumber ? { ...to, status: 'open' } : to));
      }
    } else if (next === 'reserved') {
      // Mark order status as billed (reserved)
      const exists = tableOrders.some((to) => to.tableNumber === tableNumber);
      if (exists) {
        setTableOrders((prev) => prev.map((to) => to.tableNumber === tableNumber ? { ...to, status: 'billed' } : to));
      } else {
        setTableOrders((prev) => [
          ...prev,
          { tableNumber, items: [], customerName: 'Reservation', covers: tbl.seats, status: 'billed', openedAt: new Date().toISOString() }
        ]);
      }
    }
  };

  const counts = tables.reduce((acc, table) => {
    const activeOrder = tableOrders.find((to) => to.tableNumber === `Table ${table.number}`);
    const effectiveStatus: TableStatus = activeOrder 
      ? (activeOrder.status === 'billed' ? 'reserved' : 'occupied')
      : table.status;
    acc[effectiveStatus] = (acc[effectiveStatus] || 0) + 1;
    return acc;
  }, { available: 0, occupied: 0, reserved: 0, cleaning: 0 });

  return (
    <div>
      {/* Header */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'32px', flexWrap:'wrap', gap:'16px' }}>
        <div>
          <h1 style={{ fontFamily:'var(--font-display)', fontSize:'2rem', color:'var(--cream)', marginBottom:'4px' }}>
            Floor Plan & POS
          </h1>
          <p style={{ fontFamily:'var(--font-sans)', fontSize:'0.78rem', color:'var(--text-secondary)' }}>
            Real-time table layout and properties management
          </p>
        </div>
        <button
          onClick={() => {
            if (window.confirm('Are you sure you want to reset all tables to default layout?')) {
              resetTables();
              fetch('/api/admin/logs', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  action: 'RESET_TABLES',
                  details: 'Reset all floor plan tables to default layout.',
                  adminEmail: user?.email || 'unknown@thelondon.co.uk',
                }),
              }).catch(() => {});
              setSelectedId(null);
              setTableOrders([]); // Clear active table orders
              toast.success('Floor plan reset to default layout!');
            }
          }}
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

        {/* Live sync status badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', background: isLive ? 'rgba(16,185,129,0.06)' : 'rgba(245,158,11,0.06)', border: `1px solid ${isLive ? 'rgba(16,185,129,0.2)' : 'rgba(245,158,11,0.2)'}`, borderRadius: '4px' }}>
          <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: isLive ? '#10b981' : '#f59e0b', display: 'inline-block' }} />
          <span style={{ fontFamily: 'var(--font-sans)', fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: isLive ? '#10b981' : '#f59e0b' }}>
            {isLive ? 'Live' : 'Reconnecting'}
          </span>
        </div>
      </div>

      {/* Status Summary */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(110px, 1fr))', gap:'1px', background:'var(--dark-border)', border:'1px solid var(--dark-border)', marginBottom:'32px' }}>
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

      <div style={{ display:'grid', gridTemplateColumns: (selected && !isMobile) ? '1fr 320px' : '1fr', gap:'24px', alignItems:'start' }}>

        {/* Table Grid */}
        <div style={{
          display:             'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
          gap:                 '12px',
        }}>
          {tables.map((table) => {
            const activeOrder = tableOrders.find((to) => to.tableNumber === `Table ${table.number}`);
            // If table has an active dine-in order, force status display to occupied/billed
            const effectiveStatus: TableStatus = activeOrder 
              ? (activeOrder.status === 'billed' ? 'reserved' : 'occupied')
              : table.status;
              
            const cfg      = STATUS_CONFIG[effectiveStatus];
            const isActive = selectedId === table.id;
            
            return (
              <button
                key={table.id}
                onClick={() => setSelectedId(isActive ? null : table.id)}
                style={{
                  display:       'flex',
                  flexDirection: 'column',
                  alignItems:    'center',
                  justifyContent:'center',
                  gap:           '6px',
                  padding:       '20px 16px',
                  background:    isActive ? cfg.bg : 'var(--dark-card)',
                  border:        `1px solid ${isActive ? cfg.color : (effectiveStatus !== 'available' ? `${cfg.color}50` : 'var(--dark-border-2)')}`,
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
                {activeOrder && (
                  <span style={{ fontSize:'0.62rem', color:'var(--gold)', textAlign:'center', fontWeight: 600 }}>
                    Active Order
                  </span>
                )}
              </button>
            );
          })}

          {/* Add Table Card */}
          {showAddForm ? (
            <div style={{
              display:       'flex',
              flexDirection: 'column',
              alignItems:    'center',
              justifyContent:'center',
              gap:           '10px',
              padding:       '20px 16px',
              background:    'var(--dark-surface)',
              border:        '1px solid var(--gold)',
              minHeight:     '120px',
            }}>
              <span style={{ fontSize: '0.62rem', fontWeight: 700, color: 'var(--gold)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                Seats Count
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button 
                  type="button"
                  onClick={() => setNewTableSeats(s => Math.max(1, s - 1))}
                  style={{ width: '24px', height: '24px', background: 'var(--dark-card)', border: '1px solid var(--dark-border)', color: 'var(--cream)', cursor: 'pointer' }}
                >
                  -
                </button>
                <span style={{ fontFamily: 'var(--font-sans)', fontWeight: 700, color: 'var(--cream)' }}>
                  {newTableSeats}
                </span>
                <button 
                  type="button"
                  onClick={() => setNewTableSeats(s => s + 1)}
                  style={{ width: '24px', height: '24px', background: 'var(--dark-card)', border: '1px solid var(--dark-border)', color: 'var(--cream)', cursor: 'pointer' }}
                >
                  +
                </button>
              </div>
              <div style={{ display: 'flex', gap: '6px', width: '100%', marginTop: '4px' }}>
                <button
                  type="button"
                  onClick={() => {
                    const newNum = tables.length > 0 ? Math.max(...tables.map(t => t.number)) + 1 : 1;
                    addTable(newTableSeats);
                    fetch('/api/admin/logs', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        action: 'ADD_TABLE',
                        details: `Added new table (Table ${newNum}) with ${newTableSeats} seats.`,
                        adminEmail: user?.email || 'unknown@thelondon.co.uk',
                      }),
                    }).catch(() => {});
                    setShowAddForm(false);
                    setNewTableSeats(4);
                    toast.success('Table added successfully!');
                  }}
                  style={{ flex: 1, padding: '6px 0', background: 'var(--gold)', border: 'none', color: 'var(--black)', fontSize: '0.62rem', fontWeight: 700, cursor: 'pointer', textTransform: 'uppercase' }}
                >
                  Add
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  style={{ flex: 1, padding: '6px 0', background: 'transparent', border: '1px solid var(--dark-border-2)', color: 'var(--text-secondary)', fontSize: '0.62rem', fontWeight: 600, cursor: 'pointer', textTransform: 'uppercase' }}
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setShowAddForm(true)}
              style={{
                display:       'flex',
                flexDirection: 'column',
                alignItems:    'center',
                justifyContent:'center',
                gap:           '8px',
                padding:       '20px 16px',
                background:    'transparent',
                border:        '1px dashed var(--dark-border-3)',
                color:         'var(--text-secondary)',
                cursor:        'pointer',
                transition:    'all 0.2s ease',
                minHeight:     '120px',
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--gold)'; (e.currentTarget as HTMLElement).style.color = 'var(--gold)'; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--dark-border-3)'; (e.currentTarget as HTMLElement).style.color = 'var(--text-secondary)'; }}
            >
              <PlusCircle size={24} />
              <span style={{ fontFamily:'var(--font-sans)', fontSize:'0.7rem', fontWeight:600, textTransform:'uppercase', letterSpacing:'0.05em' }}>
                Add Table
              </span>
            </button>
          )}
        </div>

        {/* Table Detail Panel */}
        {selected && (
          <div style={{
            background:  'var(--dark-card-2)',
            border:      `1px solid ${STATUS_CONFIG[selectedEffectiveStatus].color}40`,
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
                onClick={() => setSelectedId(null)}
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
                <span style={{ fontSize:'0.75rem', color: STATUS_CONFIG[selectedEffectiveStatus].color, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.1em' }}>
                  {STATUS_CONFIG[selectedEffectiveStatus].label}
                </span>
              </div>
            </div>

            {/* Actions */}
            <p style={{ fontFamily:'var(--font-sans)', fontSize:'0.6rem', fontWeight:700, letterSpacing:'0.2em', textTransform:'uppercase', color:'var(--text-secondary)', marginBottom:'12px' }}>
              Change Status
            </p>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'8px', marginBottom: '24px' }}>
              {(Object.keys(STATUS_CONFIG) as TableStatus[]).map((s) => (
                <button
                  key={s}
                  onClick={() => cycleTo(selected.id, s)}
                  disabled={selectedEffectiveStatus === s}
                  style={{
                    padding:       '10px',
                    background:    selectedEffectiveStatus === s ? `${STATUS_CONFIG[s].color}18` : 'transparent',
                    border:        `1px solid ${selectedEffectiveStatus === s ? STATUS_CONFIG[s].color : 'var(--dark-border-2)'}`,
                    color:         selectedEffectiveStatus === s ? STATUS_CONFIG[s].color : 'var(--text-secondary)',
                    fontFamily:    'var(--font-sans)',
                    fontSize:      '0.62rem',
                    fontWeight:    700,
                    letterSpacing: '0.12em',
                    textTransform: 'uppercase',
                    cursor:        selectedEffectiveStatus === s ? 'default' : 'pointer',
                    opacity:       selectedEffectiveStatus === s ? 0.8 : 1,
                  }}
                >
                  {STATUS_CONFIG[s].label}
                </button>
              ))}
            </div>

            {/* Properties Editing Section */}
            <div style={{ display:'flex', flexDirection:'column', gap:'16px', marginTop: '16px', padding: '16px', background: 'var(--dark-surface)', border: '1px solid var(--dark-border)', marginBottom: '24px' }}>
              <h4 style={{ fontSize: '0.72rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--gold)', margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Users size={12} /> Edit Properties
              </h4>
              
              <div>
                <label style={{ display: 'block', fontSize: '0.62rem', color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '6px' }}>Seats Count</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input 
                    type="number" 
                    min="1"
                    value={editSeatsVal} 
                    onChange={(e) => setEditSeatsVal(e.target.value)} 
                    style={{ 
                      width: '70px', 
                      padding: '6px 10px', 
                      background: 'var(--black)', 
                      border: '1px solid var(--dark-border-2)', 
                      color: 'var(--cream)', 
                      fontSize: '0.8rem',
                      textAlign: 'center',
                      borderRadius: 0,
                      outline: 'none'
                    }} 
                  />
                  <button 
                    type="button" 
                    onClick={() => {
                      const s = parseInt(editSeatsVal);
                      if (!isNaN(s) && s > 0) {
                        updateTableSeats(selected.id, s);
                        fetch('/api/admin/logs', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({
                            action: 'UPDATE_TABLE_SEATS',
                            details: `Updated Table ${selected.number} seats count to ${s}.`,
                            adminEmail: user?.email || 'unknown@thelondon.co.uk',
                          }),
                        }).catch(() => {});
                        toast.success('Table seats count updated!');
                      } else {
                        toast.error('Invalid seats count');
                      }
                    }}
                    style={{ padding: '6px 12px', background: 'var(--gold)', border: 'none', color: 'var(--black)', fontSize: '0.62rem', fontWeight: 700, cursor: 'pointer', textTransform: 'uppercase' }}
                  >
                    Save
                  </button>
                </div>
              </div>
            </div>

            {/* Delete Table Action */}
            <button
              type="button"
              onClick={() => {
                if (window.confirm(`Are you sure you want to delete Table ${selected.number}?`)) {
                  deleteTable(selected.id);
                  fetch('/api/admin/logs', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      action: 'DELETE_TABLE',
                      details: `Deleted Table ${selected.number} from floor plan.`,
                      adminEmail: user?.email || 'unknown@thelondon.co.uk',
                    }),
                  }).catch(() => {});
                  setSelectedId(null);
                  toast.success(`Table ${selected.number} deleted successfully.`);
                }
              }}
              style={{
                width: '100%',
                padding: '12px',
                background: 'rgba(239,68,68,0.06)',
                border: '1px solid #ef4444',
                color: '#ef4444',
                fontFamily: 'var(--font-sans)',
                fontSize: '0.72rem',
                fontWeight: 700,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = '#ef4444'; (e.currentTarget as HTMLElement).style.color = '#ffffff'; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'rgba(239,68,68,0.06)'; (e.currentTarget as HTMLElement).style.color = '#ef4444'; }}
            >
              <Trash2 size={12} />
              Delete Table
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
