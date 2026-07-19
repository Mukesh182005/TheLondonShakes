'use client';

import React, { useState, useEffect } from 'react';
import { useRestaurantStore, useIsMounted } from '@/store/restaurantStore';
import {
  Search, Calendar, User, Clock, ShieldAlert,
  ChevronLeft, ChevronRight, Lock, Activity, Eye, AlertCircle
} from 'lucide-react';
import { useIsMobile } from '@/hooks/useIsMobile';
import toast from 'react-hot-toast';

interface AuditLog {
  id: string;
  action: string;
  details: string;
  adminEmail: string;
  createdAt: string;
}

export default function AllLogsPage() {
  const user = useRestaurantStore((s) => s.user);
  const hydrated = useIsMounted();
  const isMobile = useIsMobile();

  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState('all');
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const logsPerPage = 15;

  const SUPER_ADMIN_EMAIL = process.env.NEXT_PUBLIC_SUPER_ADMIN_EMAIL || '';

  useEffect(() => {
    if (hydrated && user) {
      const isOwner = user.email === SUPER_ADMIN_EMAIL;
      setIsSuperAdmin(isOwner);
    }
  }, [user, hydrated]);

  const fetchLogs = () => {
    setLoading(true);
    fetch('/api/admin/logs')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.logs)) {
          setLogs(data.logs);
        }
      })
      .catch((err) => {
        console.error('Failed to load logs:', err);
        toast.error('Failed to fetch audit logs.');
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (isSuperAdmin) {
      fetchLogs();
    }
  }, [isSuperAdmin]);

  // Extract unique actions for the filter dropdown
  const uniqueActions = Array.from(new Set(logs.map((l) => l.action)));

  // Filter logs
  const filteredLogs = logs.filter((log) => {
    const term = searchTerm.toLowerCase();
    
    // Parse admin name and email
    const emailParts = log.adminEmail.split('|');
    const name = (emailParts[0] || '').trim().toLowerCase();
    const email = (emailParts[1] || emailParts[0] || '').trim().toLowerCase();
    
    const matchesSearch =
      log.action.toLowerCase().includes(term) ||
      log.details.toLowerCase().includes(term) ||
      name.includes(term) ||
      email.includes(term) ||
      new Date(log.createdAt).toLocaleDateString().includes(term);

    const matchesAction = actionFilter === 'all' || log.action === actionFilter;

    return matchesSearch && matchesAction;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredLogs.length / logsPerPage);
  const indexOfLastLog = currentPage * logsPerPage;
  const indexOfFirstLog = indexOfLastLog - logsPerPage;
  const currentLogs = filteredLogs.slice(indexOfFirstLog, indexOfLastLog);

  // Reset page when filter or search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, actionFilter]);

  if (!hydrated) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <p style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-sans)', fontSize: '0.9rem' }}>Loading system logs...</p>
      </div>
    );
  }

  // Strictly check if user has access. Only the Super Admin email is allowed.
  if (!isSuperAdmin) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh', padding: '20px', textAlign: 'center' }}>
        <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.25)', display: 'flex', alignItems: 'center', justifyItems: 'center', justifyContent: 'center', color: '#ef4444', marginBottom: '20px' }}>
          <Lock size={32} />
        </div>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', color: 'var(--cream)', marginBottom: '8px' }}>Access Denied</h2>
        <p style={{ fontFamily: 'var(--font-sans)', fontSize: '0.85rem', color: 'var(--text-secondary)', maxWidth: '400px', lineHeight: 1.6, marginBottom: '20px' }}>
          This directory is secure and restricted. The system Audit Logs can only be accessed by the Super Admin / Owner.
        </p>
      </div>
    );
  }

  const formatLogDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });
  };

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2.4rem', color: 'var(--cream)', lineHeight: 1, marginBottom: '8px' }}>
            System Audit Logs
          </h1>
          <p style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: '1rem', color: 'var(--text-secondary)' }}>
            Real-time track records of all website updates, settings, and orders changes
          </p>
        </div>
      </div>

      {/* Warning Info Bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 20px', background: 'rgba(197, 168, 92, 0.04)', border: '1px solid rgba(197, 168, 92, 0.15)', marginBottom: '24px' }}>
        <ShieldAlert size={16} color="var(--gold)" style={{ flexShrink: 0 }} />
        <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
          <strong>System Protocol:</strong> This category is read-only. Editing, deleting, or modifying these logs is strictly prohibited. Every system action is cryptographically tracked.
        </span>
      </div>

      {/* Filters & Search */}
      <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '280px' }}>
          <Search style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} size={16} />
          <input
            type="text"
            placeholder="Search logs by Action, Details, User name, Email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '14px 14px 14px 44px',
              background: 'var(--dark-card)',
              border: '1px solid var(--dark-border)',
              color: 'var(--cream)',
              fontFamily: 'var(--font-sans)',
              fontSize: '0.85rem',
              outline: 'none',
              boxSizing: 'border-box',
            }}
          />
        </div>

        <div style={{ position: 'relative', minWidth: '200px' }}>
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            style={{
              width: '100%',
              padding: '14px 20px',
              background: 'var(--dark-card)',
              border: '1px solid var(--dark-border)',
              color: 'var(--cream)',
              fontFamily: 'var(--font-sans)',
              fontSize: '0.85rem',
              outline: 'none',
              boxSizing: 'border-box',
              cursor: 'pointer',
              appearance: 'none',
              WebkitAppearance: 'none'
            }}
          >
            <option value="all">All Actions</option>
            {uniqueActions.map((action) => (
              <option key={action} value={action}>
                {action.replace(/_/g, ' ')}
              </option>
            ))}
          </select>
          <div style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none', fontSize: '0.7rem' }}>
            ▼
          </div>
        </div>
      </div>

      {/* Main List */}
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '30vh' }}>
          <p style={{ color: 'var(--text-secondary)' }}>Loading audit records...</p>
        </div>
      ) : filteredLogs.length === 0 ? (
        <div style={{ background: 'var(--dark-card)', border: '1px solid var(--dark-border)', padding: '60px 20px', textAlign: 'center' }}>
          <Activity size={32} color="var(--text-muted)" style={{ marginBottom: '14px', opacity: 0.5 }} />
          <h3 style={{ fontSize: '1rem', color: 'var(--cream)', fontWeight: 600, marginBottom: '6px' }}>No Logs Found</h3>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0 }}>
            {searchTerm || actionFilter !== 'all' ? 'No records match your current search or filter criteria.' : 'System changes will appear here as they are made by admins or staff.'}
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Desktop Table View */}
          {!isMobile ? (
            <div style={{ overflowX: 'auto', background: 'var(--dark-card)', border: '1px solid var(--dark-border)' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontFamily: 'var(--font-sans)', fontSize: '0.82rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--dark-border)', background: 'rgba(255,255,255,0.02)' }}>
                    <th style={{ padding: '16px 20px', color: 'var(--gold)', fontWeight: 600, width: '180px' }}>TIMESTAMP</th>
                    <th style={{ padding: '16px 20px', color: 'var(--gold)', fontWeight: 600, width: '180px' }}>ACTION CATEGORY</th>
                    <th style={{ padding: '16px 20px', color: 'var(--gold)', fontWeight: 600, width: '220px' }}>PERFORMED BY</th>
                    <th style={{ padding: '16px 20px', color: 'var(--gold)', fontWeight: 600 }}>DETAILS</th>
                  </tr>
                </thead>
                <tbody>
                  {currentLogs.map((log) => {
                    const parts = log.adminEmail.split('|');
                    const adminName = (parts[0] || '').trim();
                    const adminMail = (parts[1] || parts[0] || '').trim();

                    return (
                      <tr key={log.id} style={{ borderBottom: '1px solid var(--dark-border)', transition: 'background 0.2s' }}>
                        <td style={{ padding: '16px 20px', color: 'var(--cream)', whiteSpace: 'nowrap' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <Clock size={12} color="var(--text-muted)" />
                            {formatLogDate(log.createdAt)}
                          </div>
                        </td>
                        <td style={{ padding: '16px 20px' }}>
                          <span style={{
                            padding: '3px 8px',
                            background: 'rgba(197, 168, 92, 0.08)',
                            border: '1px solid rgba(197, 168, 92, 0.2)',
                            color: 'var(--gold)',
                            fontSize: '0.62rem',
                            fontWeight: 700,
                            letterSpacing: '0.05em',
                            textTransform: 'uppercase',
                            borderRadius: '3px',
                          }}>
                            {log.action.replace(/_/g, ' ')}
                          </span>
                        </td>
                        <td style={{ padding: '16px 20px' }}>
                          <div>
                            <span style={{ fontWeight: 600, color: 'var(--cream)', display: 'block' }}>{adminName}</span>
                            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{adminMail}</span>
                          </div>
                        </td>
                        <td style={{ padding: '16px 20px', color: 'var(--text-secondary)', lineHeight: 1.5, wordBreak: 'break-word' }}>
                          {log.details}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            /* Mobile list view */
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {currentLogs.map((log) => {
                const parts = log.adminEmail.split('|');
                const adminName = (parts[0] || '').trim();
                const adminMail = (parts[1] || parts[0] || '').trim();

                return (
                  <div key={log.id} style={{ background: 'var(--dark-card)', border: '1px solid var(--dark-border)', padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px' }}>
                      <span style={{
                        padding: '3px 8px',
                        background: 'rgba(197, 168, 92, 0.08)',
                        border: '1px solid rgba(197, 168, 92, 0.2)',
                        color: 'var(--gold)',
                        fontSize: '0.58rem',
                        fontWeight: 700,
                        letterSpacing: '0.05em',
                        textTransform: 'uppercase',
                        borderRadius: '3px',
                      }}>
                        {log.action.replace(/_/g, ' ')}
                      </span>
                      <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                        {formatLogDate(log.createdAt)}
                      </span>
                    </div>

                    <div style={{ borderTop: '1px solid rgba(255,255,255,0.03)', borderBottom: '1px solid rgba(255,255,255,0.03)', padding: '8px 0', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                      <span style={{ fontSize: '0.78rem', color: 'var(--cream)', fontWeight: 600 }}>{adminName}</span>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>{adminMail}</span>
                    </div>

                    <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.5, wordBreak: 'break-word' }}>
                      {log.details}
                    </p>
                  </div>
                );
              })}
            </div>
          )}

          {/* Pagination controls */}
          {totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px', flexWrap: 'wrap', gap: '12px' }}>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                Showing page {currentPage} of {totalPages} ({filteredLogs.length} total entries)
              </span>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  style={{
                    padding: '8px 14px',
                    background: 'var(--dark-card)',
                    border: '1px solid var(--dark-border)',
                    color: currentPage === 1 ? 'var(--text-muted)' : 'var(--cream)',
                    cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  <ChevronLeft size={14} /> Previous
                </button>
                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  style={{
                    padding: '8px 14px',
                    background: 'var(--dark-card)',
                    border: '1px solid var(--dark-border)',
                    color: currentPage === totalPages ? 'var(--text-muted)' : 'var(--cream)',
                    cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  Next <ChevronRight size={14} />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
