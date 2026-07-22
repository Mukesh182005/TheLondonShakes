'use client';

import React, { useState, useEffect } from 'react';
import { useRestaurantStore, useIsMounted } from '@/store/restaurantStore';
import { Shield, Key, UserPlus, Users, Trash2, Edit2, CheckCircle, XCircle, Check, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';

const SECTION_TITLE: React.CSSProperties = {
  fontFamily: 'var(--font-display)',
  fontSize: '1.25rem',
  fontWeight: 400,
  color: 'var(--cream)',
  marginBottom: '20px',
  borderBottom: '1px solid var(--dark-border)',
  paddingBottom: '10px',
};

const LABEL: React.CSSProperties = {
  display: 'block',
  fontFamily: 'var(--font-sans)',
  fontSize: '0.65rem',
  fontWeight: 700,
  letterSpacing: '0.12em',
  textTransform: 'uppercase',
  color: 'var(--text-secondary)',
  marginBottom: '6px',
};

const INPUT_STYLE: React.CSSProperties = {
  width: '100%',
  padding: '11px 14px',
  background: 'var(--dark-surface)',
  border: '1px solid var(--dark-border)',
  color: 'var(--cream)',
  fontFamily: 'var(--font-sans)',
  fontSize: '0.8rem',
  outline: 'none',
  transition: 'border-color 0.2s',
};

export default function SecurityPage() {
  const user = useRestaurantStore((s) => s.user);
  const isMounted = useIsMounted();

  // Super Admin check
  const SUPER_ADMIN_EMAIL = '';
  const isSuperAdmin = isMounted && user?.email === SUPER_ADMIN_EMAIL;

  // Passcode States
  const [newPasscode, setNewPasscode] = useState('');
  const [showPasscode, setShowPasscode] = useState(false);
  const [passcodeSaving, setPasscodeSaving] = useState(false);

  // Admin Accounts States
  type StaffAccount = { id: string; name: string; email: string; role: string; active: boolean; createdAt: string };
  const [adminAccounts, setAdminAccounts] = useState<StaffAccount[]>([]);
  const [accountsLoading, setAccountsLoading] = useState(false);
  const [newAdmin, setNewAdmin] = useState({ name: '', email: '', password: '' });
  const [adminSaving, setAdminSaving] = useState(false);
  const [adminError, setAdminError] = useState<string | null>(null);
  const [adminSuccess, setAdminSuccess] = useState<string | null>(null);
  const [editingPw, setEditingPw] = useState<string | null>(null);
  const [newPw, setNewPw] = useState('');

  const fetchAdminAccounts = async () => {
    if (!isSuperAdmin) return;
    setAccountsLoading(true);
    try {
      const res = await fetch('/api/admin/staff-accounts', {
        headers: { 'x-admin-email': user?.email || '' },
      });
      const data = await res.json();
      // Filter out only accounts with the "admin" role
      const admins = (data.accounts || []).filter((acc: StaffAccount) => acc.role === 'admin');
      setAdminAccounts(admins);
    } catch (err) {
      console.error('Failed to fetch admin accounts:', err);
    } finally {
      setAccountsLoading(false);
    }
  };

  useEffect(() => {
    if (isSuperAdmin) {
      fetchAdminAccounts();
    }
  }, [isSuperAdmin]);

  const handleUpdatePasscode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPasscode.trim()) {
      toast.error('Passcode cannot be empty.');
      return;
    }

    setPasscodeSaving(true);
    const passcodeVal = newPasscode;
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: 'adminPasscode', value: passcodeVal }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Super Admin passcode updated successfully!');
        setNewPasscode('');

        // Log passcode change to DB
        fetch('/api/admin/logs', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'EDIT_SETTINGS',
            details: `Owner passcode updated successfully to "${passcodeVal}".`,
            adminEmail: user?.email || 'unknown@thelondon.co.uk',
          }),
        }).catch((err) => console.warn('Failed to log passcode change:', err));
      } else {
        toast.error('Failed to update passcode.');
      }
    } catch (err) {
      toast.error('Network error updating passcode.');
    } finally {
      setPasscodeSaving(false);
    }
  };

  const handleCreateAdmin = async () => {
    setAdminError(null);
    setAdminSuccess(null);
    if (!newAdmin.name || !newAdmin.email || !newAdmin.password) {
      setAdminError('All fields are required.');
      return;
    }
    if (newAdmin.password.length < 6) {
      setAdminError('Password must be at least 6 characters.');
      return;
    }

    setAdminSaving(true);
    try {
      const res = await fetch('/api/admin/staff-accounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-admin-email': user?.email || '' },
        body: JSON.stringify({
          ...newAdmin,
          role: 'admin', // Force role to admin
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setAdminError(data.error || 'Failed to generate admin account.');
      } else {
        setAdminSuccess(`Admin account created for ${newAdmin.email}`);
        setNewAdmin({ name: '', email: '', password: '' });
        fetchAdminAccounts();
      }
    } catch (err) {
      setAdminError('Network error creating admin.');
    } finally {
      setAdminSaving(false);
    }
  };

  const handleToggleAdminActive = async (id: string, active: boolean) => {
    try {
      const res = await fetch('/api/admin/staff-accounts', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'x-admin-email': user?.email || '' },
        body: JSON.stringify({ id, active }),
      });
      if (res.ok) {
        toast.success(`Admin account status updated.`);
        fetchAdminAccounts();
      } else {
        toast.error('Failed to update account status.');
      }
    } catch (err) {
      toast.error('Network error updating account status.');
    }
  };

  const handleResetPassword = async (id: string) => {
    if (newPw.length < 6) {
      toast.error('Password must be at least 6 characters.');
      return;
    }
    try {
      const res = await fetch('/api/admin/staff-accounts', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'x-admin-email': user?.email || '' },
        body: JSON.stringify({ id, password: newPw }),
      });
      if (res.ok) {
        setEditingPw(null);
        setNewPw('');
        toast.success('Admin password updated successfully.');
      } else {
        toast.error('Failed to update password.');
      }
    } catch (err) {
      toast.error('Network error resetting password.');
    }
  };

  const handleDeleteAdmin = async (id: string, email: string) => {
    if (!confirm(`Delete admin account for ${email}? This cannot be undone.`)) return;
    try {
      const res = await fetch('/api/admin/staff-accounts', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json', 'x-admin-email': user?.email || '' },
        body: JSON.stringify({ id }),
      });
      if (res.ok) {
        toast.success('Admin account deleted.');
        fetchAdminAccounts();
      } else {
        toast.error('Failed to delete account.');
      }
    } catch (err) {
      toast.error('Network error deleting account.');
    }
  };

  if (isMounted && !isSuperAdmin) {
    return (
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'center', minHeight: '70vh', padding: '40px',
        background: 'var(--dark-card)', border: '1px solid var(--dark-border)',
        textAlign: 'center',
      }}>
        <div style={{
          padding: '20px', background: 'rgba(239,68,68,0.08)', borderRadius: '50%',
          color: '#ef4444', marginBottom: '24px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Shield size={48} />
        </div>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.75rem', fontWeight: 300, color: 'var(--cream)', marginBottom: '8px' }}>
          Access Denied
        </h2>
        <p style={{ fontFamily: 'var(--font-sans)', fontSize: '0.85rem', color: 'var(--text-secondary)', maxWidth: '420px', margin: '0 auto 24px auto', lineHeight: 1.5 }}>
          Only the Super Admin/Owner (<strong>{SUPER_ADMIN_EMAIL}</strong>) has access to security credentials, passcode management, and administrator profiles.
        </p>
      </div>
    );
  }

  return (
    <div style={{ padding: '40px 24px', maxWidth: '1080px', margin: '0 auto' }}>
      
      {/* Title */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2.2rem', fontWeight: 300, color: 'var(--cream)', margin: '0 0 4px 0' }}>
          Security & Credentials
        </h1>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0 }}>
          Manage owner passcodes, generate new admin accounts, or modify/delete credentials.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '32px' }}>

        {/* ── SUPER ADMIN PASSCODE UPDATE ── */}
        <div style={{ background: 'var(--dark-card)', border: '1px solid var(--dark-border)', padding: '24px' }}>
          <h3 style={{ ...SECTION_TITLE, display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Key size={16} style={{ color: 'var(--gold)' }} /> Super Admin Passcode
          </h3>
          
          <form onSubmit={handleUpdatePasscode} style={{ maxWidth: '480px' }}>
            <div style={{ marginBottom: '16px' }}>
              <label style={LABEL}>New Owner Passcode</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPasscode ? 'text' : 'password'}
                  style={{ ...INPUT_STYLE, paddingRight: '45px' }}
                  placeholder="Enter new owner passcode"
                  value={newPasscode}
                  onChange={(e) => setNewPasscode(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPasscode(!showPasscode)}
                  style={{
                    position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)',
                    background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}
                >
                  {showPasscode ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              <span style={{ fontSize: '0.62rem', color: 'var(--text-muted)', display: 'block', marginTop: '6px' }}>
                Note: This changes the main passcode used to unlock site settings override and perform owner overrides.
              </span>
            </div>
            
            <button
              type="submit"
              disabled={passcodeSaving}
              style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                padding: '11px 22px', background: passcodeSaving ? 'var(--dark-border)' : 'var(--gold)',
                border: 'none', color: 'var(--black)', fontFamily: 'var(--font-sans)',
                fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.12em',
                textTransform: 'uppercase', cursor: passcodeSaving ? 'not-allowed' : 'pointer',
              }}
            >
              <Check size={14} /> {passcodeSaving ? 'Saving...' : 'Update Passcode'}
            </button>
          </form>
        </div>

        {/* ── ADMIN ACCOUNT GENERATION ── */}
        <div style={{ background: 'var(--dark-card)', border: '1px solid var(--dark-border)', padding: '24px' }}>
          <h3 style={{ ...SECTION_TITLE, display: 'flex', alignItems: 'center', gap: '10px' }}>
            <UserPlus size={16} style={{ color: 'var(--gold)' }} /> Generate Admin Account
          </h3>

          {adminError && (
            <div style={{ padding: '10px 14px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', color: '#ef4444', fontSize: '0.78rem', marginBottom: '16px' }}>
              {adminError}
            </div>
          )}
          {adminSuccess && (
            <div style={{ padding: '10px 14px', background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.25)', color: '#10b981', fontSize: '0.78rem', marginBottom: '16px' }}>
              {adminSuccess}
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(220px,1fr))', gap: '14px', marginBottom: '16px' }}>
            <div>
              <label style={LABEL}>Admin Full Name</label>
              <input style={INPUT_STYLE} placeholder="e.g. Admin Manager" value={newAdmin.name}
                onChange={(e) => setNewAdmin(p => ({ ...p, name: e.target.value }))} />
            </div>
            <div>
              <label style={LABEL}>Email Address</label>
              <input style={INPUT_STYLE} type="email" placeholder="admin@example.com" value={newAdmin.email}
                onChange={(e) => setNewAdmin(p => ({ ...p, email: e.target.value }))} />
            </div>
            <div>
              <label style={LABEL}>Secure Password</label>
              <input style={INPUT_STYLE} type="password" placeholder="Min. 6 characters" value={newAdmin.password}
                onChange={(e) => setNewAdmin(p => ({ ...p, password: e.target.value }))} />
            </div>
          </div>

          <button
            disabled={adminSaving}
            onClick={handleCreateAdmin}
            style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              padding: '11px 22px', background: adminSaving ? 'var(--dark-border)' : 'var(--gold)',
              border: 'none', color: 'var(--black)', fontFamily: 'var(--font-sans)',
              fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.12em',
              textTransform: 'uppercase', cursor: adminSaving ? 'not-allowed' : 'pointer',
            }}
          >
            <UserPlus size={14} /> {adminSaving ? 'Generating...' : 'Generate Admin Account'}
          </button>
        </div>

        {/* ── ADMIN ACCOUNT LISTING & DELETION ── */}
        <div style={{ background: 'var(--dark-card)', border: '1px solid var(--dark-border)', padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
            <h3 style={{ ...SECTION_TITLE, marginBottom: 0, borderBottom: 'none', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Users size={16} style={{ color: 'var(--gold)' }} /> Admin Accounts ({adminAccounts.length})
            </h3>
            <button onClick={fetchAdminAccounts} style={{ background: 'transparent', border: '1px solid var(--dark-border)', color: 'var(--text-secondary)', padding: '6px 12px', cursor: 'pointer', fontSize: '0.7rem', fontFamily: 'var(--font-sans)' }}>
              Refresh
            </button>
          </div>

          {accountsLoading ? (
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', textAlign: 'center', padding: '24px 0' }}>Loading Admin accounts...</p>
          ) : adminAccounts.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)', fontSize: '0.82rem' }}>
              <Shield size={32} style={{ marginBottom: '12px', opacity: 0.4 }} />
              <p>No extra admin accounts registered. Generate the first one above.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {adminAccounts.map((acc) => (
                <div key={acc.id} style={{
                  padding: '16px', border: `1px solid ${acc.active ? 'var(--dark-border)' : 'rgba(239,68,68,0.3)'}`,
                  background: acc.active ? 'rgba(255,255,255,0.02)' : 'rgba(239,68,68,0.04)',
                  display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '12px',
                }}>
                  {/* Avatar */}
                  <div style={{
                    width: '38px', height: '38px', borderRadius: '50%', flexShrink: 0,
                    background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#f59e0b', fontFamily: 'var(--font-sans)', fontWeight: 700, fontSize: '0.85rem',
                  }}>
                    {acc.name.charAt(0).toUpperCase()}
                  </div>

                  {/* Info */}
                  <div style={{ flex: 1, minWidth: '160px' }}>
                    <p style={{ fontFamily: 'var(--font-sans)', fontSize: '0.85rem', color: 'var(--cream)', fontWeight: 600, marginBottom: '2px' }}>{acc.name}</p>
                    <p style={{ fontFamily: 'var(--font-sans)', fontSize: '0.72rem', color: 'var(--text-secondary)' }}>{acc.email}</p>
                  </div>

                  {/* Status Badge */}
                  <span style={{
                    padding: '3px 10px', fontSize: '0.6rem', fontWeight: 700,
                    letterSpacing: '0.1em', textTransform: 'uppercase',
                    background: acc.active ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
                    border: `1px solid ${acc.active ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}`,
                    color: acc.active ? '#10b981' : '#ef4444', whiteSpace: 'nowrap',
                  }}>
                    {acc.active ? 'Active' : 'Disabled'}
                  </span>

                  {/* Action Buttons */}
                  <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
                    <button
                      title={acc.active ? 'Disable account' : 'Enable account'}
                      onClick={() => handleToggleAdminActive(acc.id, !acc.active)}
                      style={{ background: 'transparent', border: '1px solid var(--dark-border)', color: acc.active ? '#f59e0b' : '#10b981', padding: '6px 8px', cursor: 'pointer' }}
                    >
                      {acc.active ? <XCircle size={14} /> : <CheckCircle size={14} />}
                    </button>

                    <button
                      title="Update password"
                      onClick={() => { setEditingPw(editingPw === acc.id ? null : acc.id); setNewPw(''); }}
                      style={{ background: 'transparent', border: '1px solid var(--dark-border)', color: 'var(--text-secondary)', padding: '6px 8px', cursor: 'pointer' }}
                    >
                      <Edit2 size={14} />
                    </button>

                    <button
                      title="Delete account"
                      onClick={() => handleDeleteAdmin(acc.id, acc.email)}
                      style={{ background: 'transparent', border: '1px solid rgba(239,68,68,0.4)', color: '#ef4444', padding: '6px 8px', cursor: 'pointer' }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>

                  {/* Password Reset Container */}
                  {editingPw === acc.id && (
                    <div style={{ width: '100%', display: 'flex', gap: '8px', marginTop: '8px' }}>
                      <input
                        type="password"
                        placeholder="New password (min. 6 chars)"
                        value={newPw}
                        onChange={(e) => setNewPw(e.target.value)}
                        style={{ ...INPUT_STYLE, flex: 1 }}
                      />
                      <button
                        onClick={() => handleResetPassword(acc.id)}
                        style={{ padding: '0 16px', background: 'var(--gold)', border: 'none', color: 'var(--black)', fontWeight: 700, fontSize: '0.72rem', cursor: 'pointer', whiteSpace: 'nowrap' }}
                      >
                        Save Password
                      </button>
                      <button
                        onClick={() => { setEditingPw(null); setNewPw(''); }}
                        style={{ padding: '0 12px', background: 'transparent', border: '1px solid var(--dark-border)', color: 'var(--text-secondary)', cursor: 'pointer' }}
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
