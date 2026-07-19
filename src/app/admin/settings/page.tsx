'use client';

import React, { useState, useEffect } from 'react';
import { useCMSStore, useRestaurantStore, useIsMounted } from '@/store/restaurantStore';
import { useIsMobile } from '@/hooks/useIsMobile';
import ImageUploader from '@/components/ImageUploader';
import { Save, RefreshCw, ChefHat, MapPin, Phone, Mail, Clock, AlertCircle, Power, Globe, Server, Terminal, ShieldAlert, Sparkles, Image as ImageIcon, ShoppingBag, Lock, KeyRound, Eye, EyeOff, Search, ChevronDown, ChevronUp, Calendar, User, DollarSign, Trash2, UserPlus, Users, Edit2, CheckCircle, XCircle } from 'lucide-react';

const INPUT_STYLE: React.CSSProperties = {
  width: '100%', padding: '10px 14px',
  background: 'var(--dark-surface)', border: '1px solid var(--dark-border)',
  color: 'var(--cream)', fontFamily: 'var(--font-sans)', fontSize: '0.85rem',
  outline: 'none', boxSizing: 'border-box',
};
const LABEL: React.CSSProperties = {
  display: 'block', fontFamily: 'var(--font-sans)', fontSize: '0.62rem',
  fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase',
  color: 'var(--text-secondary)', marginBottom: '6px',
};
const SECTION_TITLE: React.CSSProperties = {
  fontFamily: 'var(--font-display)', fontSize: '1.15rem', color: 'var(--cream)', marginBottom: '20px',
  paddingBottom: '12px', borderBottom: '1px solid var(--dark-border)',
};

export default function SettingsPage() {
  const restaurantInfo    = useCMSStore((s) => s.restaurantInfo);
  const chef              = useCMSStore((s) => s.chef);
  const homepageData      = useCMSStore((s) => s.homepageData);
  const updateRestaurantInfo = useCMSStore((s) => s.updateRestaurantInfo);
  const updateChefInfo       = useCMSStore((s) => s.updateChefInfo);
  const updateHomepageData   = useCMSStore((s) => s.updateHomepageData);
  const menuCategories       = useCMSStore((s) => s.menuCategories);
  const updateMenuCategory   = useCMSStore((s) => s.updateMenuCategory);
  const clearOrders          = useRestaurantStore((s) => s.clearOrders);
  const loadSystemSettings   = useCMSStore((s) => s.loadSystemSettings);
  const isMounted            = useIsMounted();
  const user                 = useRestaurantStore((s) => s.user);
  const newArrivalsDaysThreshold = useCMSStore((s) => s.newArrivalsDaysThreshold);
  const setNewArrivalsDaysThreshold = useCMSStore((s) => s.setNewArrivalsDaysThreshold);

  // Passcode verification state
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [isLockedOverride, setIsLockedOverride] = useState(() => {
    if (typeof window !== 'undefined') {
      return sessionStorage.getItem('settings_locked_override') === 'true';
    }
    return false;
  });
  const [passcode, setPasscode] = useState('');
  const [showPasscode, setShowPasscode] = useState(false);
  const [passcodeLoading, setPasscodeLoading] = useState(false);
  const [passcodeError, setPasscodeError] = useState<string | null>(null);

  // New setting passcode update state
  const [newPasscode, setNewPasscode] = useState('');
  const [passcodeSaved, setPasscodeSaved] = useState(false);

  // Local form state — restaurant
  const [info, setInfo] = useState({ ...restaurantInfo });
  // Flatten contact/location for easier editing
  const [contact, setContact] = useState({ ...restaurantInfo.contact });
  const [location, setLocation] = useState({ ...restaurantInfo.location });
  const [hours, setHours] = useState(restaurantInfo.hours[0] || { days: 'Mon–Sun', lunch: '11:00', dinner: '22:00' });

  // Local form state — chef
  const [chefInfo, setChefInfo] = useState({ ...chef });

  // Local form state — homepage content
  const [homepage, setHomepage] = useState({ ...homepageData });

  // Local form state — categories gutter images
  const [categories, setCategories] = useState([...menuCategories]);

  const [saved, setSaved] = useState(false);
  const [tab, setTab] = useState<'restaurant' | 'chef' | 'homepage' | 'server' | 'gutters' | 'bill-log' | 'staff-accounts'>('restaurant');

  // Bill edit log states
  const [billLogs, setBillLogs] = useState<any[]>([]);
  const [billLogsTotal, setBillLogsTotal] = useState(0);
  const [billLogsPage, setBillLogsPage] = useState(1);
  const [billLogsTotalPages, setBillLogsTotalPages] = useState(1);
  const [billLogsSearch, setBillLogsSearch] = useState('');
  const [billLogsSearchInput, setBillLogsSearchInput] = useState('');
  const [billLogsLoading, setBillLogsLoading] = useState(false);
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);

  // ── Staff Accounts state ──────────────────────────────────────────────────
  type StaffAccount = { id: string; name: string; email: string; role: string; active: boolean; createdAt: string };
  const [staffAccounts, setStaffAccounts] = useState<StaffAccount[]>([]);
  const [staffLoading, setStaffLoading] = useState(false);
  const [newStaff, setNewStaff] = useState({ name: '', email: '', password: '', role: 'manager' });
  const [staffSaving, setStaffSaving] = useState(false);
  const [staffError, setStaffError] = useState<string | null>(null);
  const [staffSuccess, setStaffSuccess] = useState<string | null>(null);
  const [editingPw, setEditingPw] = useState<string | null>(null); // account id being reset
  const [newPw, setNewPw] = useState('');
  const isMobile = useIsMobile();


  const fetchBillLogs = async (p: number, s: string) => {
    setBillLogsLoading(true);
    try {
      const res = await fetch(`/api/admin/bill-logs?page=${p}&limit=20&search=${encodeURIComponent(s)}`);
      const data = await res.json();
      setBillLogs(data.logs || []);
      setBillLogsTotal(data.total || 0);
      setBillLogsTotalPages(data.totalPages || 1);
    } catch (err) {
      console.warn('Failed to fetch bill logs:', err);
    } finally {
      setBillLogsLoading(false);
    }
  };

  const fetchStaffAccounts = async () => {
    setStaffLoading(true);
    try {
      const res = await fetch('/api/admin/staff-accounts', {
        headers: { 'x-admin-email': user?.email || '' },
      });
      const data = await res.json();
      setStaffAccounts(data.accounts || []);
    } catch { /* silent */ } finally {
      setStaffLoading(false);
    }
  };

  useEffect(() => {
    if (tab === 'bill-log') fetchBillLogs(billLogsPage, billLogsSearch);
    if (tab === 'staff-accounts') fetchStaffAccounts();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, billLogsPage, billLogsSearch]);

  useEffect(() => {
    const handler = setTimeout(() => {
      setBillLogsSearch(billLogsSearchInput);
      setBillLogsPage(1);
    }, 400);
    return () => clearTimeout(handler);
  }, [billLogsSearchInput]);

  const handleSearchBillLogs = (val: string) => {
    setBillLogsSearchInput(val);
  };

  // Sync states with Zustand store data on client mount/hydration
  useEffect(() => {
    if (isMounted) {
      setInfo({ ...restaurantInfo });
      setContact({ ...restaurantInfo.contact });
      setLocation({ ...restaurantInfo.location });
      setHours(restaurantInfo.hours[0] || { days: 'Mon–Sun', lunch: '11:00', dinner: '22:00' });
      setChefInfo({ ...chef });
      setHomepage({ ...homepageData });
      setCategories([...menuCategories]);

      // Bypass for Super Admin / Owner, or check sessionStorage unlock
      if (user?.email === (process.env.NEXT_PUBLIC_SUPER_ADMIN_EMAIL || '') && !isLockedOverride) {
        setIsUnlocked(true);
      } else if (sessionStorage.getItem('settings_unlocked') === 'true') {
        setIsUnlocked(true);
      } else {
        setIsUnlocked(false);
      }

      loadSystemSettings();
    }
  }, [isMounted, restaurantInfo, chef, homepageData, menuCategories, user, isLockedOverride, loadSystemSettings]);
  const maintenanceMode = useCMSStore((s) => s.maintenanceMode);
  const setMaintenanceMode = useCMSStore((s) => s.setMaintenanceMode);
  const acceptingOrders = useCMSStore((s) => s.acceptingOrders);
  const setAcceptingOrders = useCMSStore((s) => s.setAcceptingOrders);
  const requireReceiptPhoto = useCMSStore((s) => s.requireReceiptPhoto);
  const setRequireReceiptPhoto = useCMSStore((s) => s.setRequireReceiptPhoto);

  useEffect(() => {
    // Sync cookie with Zustand store state on load
    document.cookie = `tls_maintenance=${maintenanceMode}; path=/; max-age=31536000; SameSite=Lax`;
  }, [maintenanceMode]);

  const toggleMaintenance = () => {
    const nextVal = !maintenanceMode;
    setMaintenanceMode(nextVal);
    document.cookie = `tls_maintenance=${nextVal}; path=/; max-age=31536000; SameSite=Lax`;

    // Log action to DB
    fetch('/api/admin/logs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: nextVal ? 'STOP_SERVER' : 'START_SERVER',
        details: `Server mode toggled. Maintenance Mode is now ${nextVal}.`,
        adminEmail: user?.email || 'unknown@thelondon.co.uk',
      }),
    }).catch((err) => console.warn('Failed to log server toggle:', err));
  };

  const toggleOrdering = () => {
    const nextVal = !acceptingOrders;
    setAcceptingOrders(nextVal);

    // Log action to DB
    fetch('/api/admin/logs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'TOGGLE_ORDER_ACCEPTANCE',
        details: `Order acceptance status toggled. Accepting Orders is now ${nextVal}.`,
        adminEmail: user?.email || 'unknown@thelondon.co.uk',
      }),
    }).catch((err) => console.warn('Failed to log order acceptance toggle:', err));
  };

  const toggleReceiptPhoto = () => {
    const nextVal = !requireReceiptPhoto;
    setRequireReceiptPhoto(nextVal);

    // Log action to DB
    fetch('/api/admin/logs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'TOGGLE_RECEIPT_PHOTO_REQUIREMENT',
        details: `UPI Receipt photo requirement toggled. Required is now ${nextVal}.`,
        adminEmail: user?.email || 'unknown@thelondon.co.uk',
      }),
    }).catch((err) => console.warn('Failed to log receipt photo toggle:', err));
  };

  const handleVerifyPasscode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passcode.trim()) return;
    setPasscodeLoading(true);
    setPasscodeError(null);

    try {
      const res = await fetch('/api/admin/settings/verify-passcode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ passcode }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        if (typeof window !== 'undefined') {
          sessionStorage.removeItem('settings_locked_override');
        }
        setIsLockedOverride(false);
        setIsUnlocked(true);
        sessionStorage.setItem('settings_unlocked', 'true');
      } else {
        setPasscodeError(data.error || 'Incorrect passcode');
      }
    } catch (err) {
      setPasscodeError('Network error verifying passcode. Please try again.');
    } finally {
      setPasscodeLoading(false);
    }
  };

  const handleUpdatePasscode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPasscode.trim()) return;

    const passcodeValue = newPasscode; // copy before clearing
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: 'adminPasscode', value: newPasscode }),
      });
      const data = await res.json();
      if (data.success) {
        setPasscodeSaved(true);
        setNewPasscode('');
        setTimeout(() => setPasscodeSaved(false), 3000);

        // Log passcode change (with the new passcode value)
        fetch('/api/admin/logs', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'EDIT_SETTINGS',
            details: `Owner passcode updated successfully to "${passcodeValue}".`,
            adminEmail: user?.email || 'unknown@thelondon.co.uk',
          }),
        }).catch((err) => console.warn('Failed to log passcode change:', err));
      }
    } catch (err) {
      alert('Failed to update passcode.');
    }
  };

  const handleSave = () => {
    updateRestaurantInfo({
      ...info,
      contact,
      location,
      hours: [hours],
    });
    updateChefInfo(chefInfo);
    updateHomepageData(homepage);
    categories.forEach((cat) => {
      updateMenuCategory(cat.id, cat);
    });

    // Create detailed text log of changes
    const detailsList = [];
    detailsList.push(`Restaurant Name: "${info.name}", Tagline: "${info.tagline}"`);
    detailsList.push(`Contact Phone: "${contact.phone}", Email: "${contact.email}"`);
    detailsList.push(`Location Address: "${location.fullAddress}"`);
    detailsList.push(`Chef Name: "${chefInfo.name}", Chef Title: "${chefInfo.title}"`);
    detailsList.push(`Homepage Title: "${homepage.heroTitleLine1} ${homepage.heroTitleLine2}", Tagline: "${homepage.heroTagline}"`);
    const detailsText = `Updated site settings: ${detailsList.join(' | ')}`;

    // Log changes to DB
    fetch('/api/admin/logs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'EDIT_SETTINGS',
        details: detailsText,
        adminEmail: user?.email || 'unknown@thelondon.co.uk',
      }),
    }).catch((err) => console.warn('Failed to log settings changes:', err));

    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const tabs = [
    { id: 'restaurant', label: 'Restaurant Info', icon: <MapPin size={14} /> },
    { id: 'chef',       label: 'Chef & About',    icon: <ChefHat size={14} /> },
    { id: 'homepage',   label: 'Homepage Content', icon: <Globe size={14} /> },
    { id: 'gutters',    label: 'Menu Gutter Images', icon: <ImageIcon size={14} /> },
    { id: 'server',     label: 'Server Control',  icon: <Power size={14} /> },
    { id: 'bill-log',   label: 'Bill Log',        icon: <ShieldAlert size={14} /> },
    { id: 'staff-accounts', label: 'Staff Accounts', icon: <Users size={14} /> },
  ] as const;

  // ── Super-admin-only hard guard ──────────────────────────────────────────
  // Only the owner may ever access this page.
  // Regular admins see a permanent "Access Denied" screen — no passcode bypass.
  const SUPER_ADMIN_EMAIL = process.env.NEXT_PUBLIC_SUPER_ADMIN_EMAIL || '';
  const isSuperAdmin = isMounted && user?.email === SUPER_ADMIN_EMAIL;

  if (isMounted && !isSuperAdmin) {
    return (
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'center', minHeight: '70vh', padding: '40px',
        background: 'var(--dark-card)', border: '1px solid var(--dark-border)',
        textAlign: 'center',
      }}>
        {/* Shield icon */}
        <div style={{
          padding: '20px', background: 'rgba(239,68,68,0.08)', borderRadius: '50%',
          color: '#ef4444', marginBottom: '24px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <ShieldAlert size={40} />
        </div>

        <h2 style={{
          fontFamily: 'var(--font-display)', fontSize: '1.6rem',
          color: 'var(--cream)', marginBottom: '12px',
        }}>
          Access Denied
        </h2>

        <p style={{
          fontSize: '0.82rem', color: 'var(--text-secondary)',
          maxWidth: '400px', lineHeight: 1.65, marginBottom: '28px',
        }}>
          Site Settings are restricted to the <strong style={{ color: 'var(--gold)' }}>Owner / Super Admin</strong> only.
          You do not have permission to view or modify these settings.
        </p>

        <div style={{
          padding: '12px 20px',
          background: 'rgba(239,68,68,0.06)',
          border: '1px solid rgba(239,68,68,0.2)',
          fontSize: '0.75rem', color: '#ef4444',
          letterSpacing: '0.05em',
        }}>
          Logged in as: <strong>{user?.email || 'unknown'}</strong>
        </div>
      </div>
    );
  }

  if (!isUnlocked) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', padding: '40px', background: 'var(--dark-card)', border: '1px solid var(--dark-border)' }}>
        <div style={{ padding: '16px', background: 'rgba(197, 168, 92, 0.08)', borderRadius: '50%', color: 'var(--gold)', marginBottom: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Lock size={36} />
        </div>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', color: 'var(--cream)', marginBottom: '8px', textAlign: 'center' }}>Owner Verification Required</h2>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', maxWidth: '420px', textAlign: 'center', lineHeight: 1.5, marginBottom: '24px' }}>
          Site settings are restricted. If you are the owner, please enter your passcode to modify system status, payment methods, or website contents.
        </p>
        <form onSubmit={handleVerifyPasscode} style={{ width: '100%', maxWidth: '320px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ position: 'relative' }}>
            <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>
              <KeyRound size={16} />
            </span>
            <input
              type={showPasscode ? 'text' : 'password'}
              value={passcode}
              onChange={(e) => setPasscode(e.target.value)}
              placeholder="Enter owner passcode"
              style={{
                width: '100%', height: '44px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--dark-border)',
                padding: '0 40px', color: 'var(--cream)', fontSize: '0.85rem', outline: 'none',
              }}
              onFocus={(e) => e.currentTarget.style.borderColor = 'var(--gold)'}
              onBlur={(e) => e.currentTarget.style.borderColor = 'var(--dark-border)'}
            />
            <button
              type="button"
              onClick={() => setShowPasscode(!showPasscode)}
              style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
            >
              {showPasscode ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {passcodeError && (
            <p style={{ fontSize: '0.75rem', color: '#ef4444', margin: 0, textAlign: 'center' }}>{passcodeError}</p>
          )}
          <button
            type="submit"
            disabled={passcodeLoading}
            style={{
              height: '44px', background: 'var(--gold)', color: 'var(--black)',
              border: 'none', fontFamily: 'var(--font-sans)', fontSize: '0.75rem',
              fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
            }}
          >
            {passcodeLoading ? 'Verifying...' : 'Unlock Settings'}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '28px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', color: 'var(--cream)', marginBottom: '4px' }}>Site Settings</h1>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Changes here update the live website immediately</p>
        </div>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          {isUnlocked && (
            <button
              onClick={() => {
                if (typeof window !== 'undefined') {
                  sessionStorage.removeItem('settings_unlocked');
                  sessionStorage.setItem('settings_locked_override', 'true');
                }
                setIsLockedOverride(true);
                setIsUnlocked(false);
                setPasscode('');
                alert('Settings panel has been locked successfully.');
              }}
              style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                padding: '10px 18px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid #ef4444',
                color: '#ef4444', fontFamily: 'var(--font-sans)', fontSize: '0.72rem',
                fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = '#ef4444'; (e.currentTarget as HTMLElement).style.color = '#ffffff'; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'rgba(239, 68, 68, 0.1)'; (e.currentTarget as HTMLElement).style.color = '#ef4444'; }}
            >
              <Lock size={13} /> Lock Settings Panel
            </button>
          )}
          {saved && (
            <span style={{ fontSize: '0.72rem', color: '#10b981', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <RefreshCw size={12} /> Saved!
            </span>
          )}
          {tab !== 'server' && tab !== 'bill-log' && tab !== 'staff-accounts' && (
            <button
              onClick={handleSave}
              style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                padding: '10px 20px', background: 'var(--gold)', border: 'none',
                color: 'var(--black)', fontFamily: 'var(--font-sans)', fontSize: '0.72rem',
                fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', cursor: 'pointer',
              }}
            >
              <Save size={14} /> Save All
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '4px', borderBottom: '1px solid var(--dark-border)', marginBottom: '28px', overflowX: 'auto', paddingBottom: '4px' }}>
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              padding: '10px 18px', background: 'transparent', border: 'none',
              borderBottom: tab === t.id ? '2px solid var(--gold)' : '2px solid transparent',
              color: tab === t.id ? 'var(--gold)' : 'var(--text-secondary)',
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

      {/* ── RESTAURANT INFO TAB ───────────────────────────────────────── */}
      {tab === 'restaurant' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>

          {/* Basic Info */}
          <div style={{ background: 'var(--dark-card)', border: '1px solid var(--dark-border)', padding: '28px' }}>
            <h3 style={SECTION_TITLE}><MapPin size={14} style={{ display: 'inline', marginRight: '8px' }} />Basic Information</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={LABEL}>Restaurant Name</label>
                  <input style={INPUT_STYLE} value={info.name} onChange={(e) => setInfo((f) => ({ ...f, name: e.target.value }))} />
                </div>
                <div>
                  <label style={LABEL}>Founded Year</label>
                  <input style={INPUT_STYLE} value={info.founded} onChange={(e) => setInfo((f) => ({ ...f, founded: e.target.value }))} />
                </div>
              </div>
              <div>
                <label style={LABEL}>Tagline</label>
                <input style={INPUT_STYLE} value={info.tagline} onChange={(e) => setInfo((f) => ({ ...f, tagline: e.target.value }))} />
              </div>
              <div>
                <label style={LABEL}>Description</label>
                <textarea style={{ ...INPUT_STYLE, minHeight: '90px', resize: 'vertical' }} value={info.description} onChange={(e) => setInfo((f) => ({ ...f, description: e.target.value }))} />
              </div>
            </div>
          </div>

          {/* Location */}
          <div style={{ background: 'var(--dark-card)', border: '1px solid var(--dark-border)', padding: '28px' }}>
            <h3 style={SECTION_TITLE}><MapPin size={14} style={{ display: 'inline', marginRight: '8px' }} />Location</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={LABEL}>Street Address</label>
                <input style={INPUT_STYLE} value={location.address} onChange={(e) => setLocation((f) => ({ ...f, address: e.target.value }))} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={LABEL}>City</label>
                  <input style={INPUT_STYLE} value={location.city} onChange={(e) => setLocation((f) => ({ ...f, city: e.target.value }))} />
                </div>
                <div>
                  <label style={LABEL}>Postcode</label>
                  <input style={INPUT_STYLE} value={location.postcode} onChange={(e) => setLocation((f) => ({ ...f, postcode: e.target.value }))} />
                </div>
                <div>
                  <label style={LABEL}>Full Address (display)</label>
                  <input style={INPUT_STYLE} value={location.fullAddress} onChange={(e) => setLocation((f) => ({ ...f, fullAddress: e.target.value }))} />
                </div>
              </div>
            </div>
          </div>

          {/* Contact */}
          <div style={{ background: 'var(--dark-card)', border: '1px solid var(--dark-border)', padding: '28px' }}>
            <h3 style={SECTION_TITLE}><Phone size={14} style={{ display: 'inline', marginRight: '8px' }} />Contact Details</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={LABEL}><Phone size={12} style={{ display: 'inline', marginRight: '4px' }} />Phone</label>
                  <input style={INPUT_STYLE} value={contact.phone} onChange={(e) => setContact((f) => ({ ...f, phone: e.target.value }))} />
                </div>
                <div>
                  <label style={LABEL}><Mail size={12} style={{ display: 'inline', marginRight: '4px' }} />Email</label>
                  <input style={INPUT_STYLE} value={contact.email} onChange={(e) => setContact((f) => ({ ...f, email: e.target.value }))} />
                </div>
              </div>
              <div>
                <label style={LABEL}>Instagram Handle</label>
                <input style={INPUT_STYLE} value={contact.instagram} onChange={(e) => setContact((f) => ({ ...f, instagram: e.target.value }))} />
              </div>
            </div>
          </div>

          {/* Hours */}
          <div style={{ background: 'var(--dark-card)', border: '1px solid var(--dark-border)', padding: '28px' }}>
            <h3 style={SECTION_TITLE}><Clock size={14} style={{ display: 'inline', marginRight: '8px' }} />Opening Hours</h3>
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr 1fr', gap: '16px' }}>
              <div>
                <label style={LABEL}>Days</label>
                <input style={INPUT_STYLE} value={hours.days} onChange={(e) => setHours((f) => ({ ...f, days: e.target.value }))} placeholder="e.g. Monday — Sunday" />
              </div>
              <div>
                <label style={LABEL}>Opening Time</label>
                <input style={INPUT_STYLE} value={hours.lunch} onChange={(e) => setHours((f) => ({ ...f, lunch: e.target.value }))} placeholder="e.g. 11:00" />
              </div>
              <div>
                <label style={LABEL}>Closing Time</label>
                <input style={INPUT_STYLE} value={hours.dinner} onChange={(e) => setHours((f) => ({ ...f, dinner: e.target.value }))} placeholder="e.g. 22:00" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── CHEF & ABOUT TAB ─────────────────────────────────────────── */}
      {tab === 'chef' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          {/* About Page Banner Image */}
          <div style={{ background: 'var(--dark-card)', border: '1px solid var(--dark-border)', padding: '28px' }}>
            <h3 style={SECTION_TITLE}><ImageIcon size={14} style={{ display: 'inline', marginRight: '8px' }} />About Page Story Image</h3>
            <ImageUploader
              label="Story Banner Image (replaces the 🥤 cup emoji)"
              value={info.aboutImage || ''}
              aspectRatio="3/4"
              onChange={(dataUrl) => setInfo((f) => ({ ...f, aboutImage: dataUrl }))}
            />
          </div>

          {/* Chef Profile */}
          <div style={{ background: 'var(--dark-card)', border: '1px solid var(--dark-border)', padding: '28px' }}>
            <h3 style={SECTION_TITLE}><ChefHat size={14} style={{ display: 'inline', marginRight: '8px' }} />Chef Profile</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <ImageUploader
                label="Chef Portrait Image (replaces the 👨‍🍳 chef emoji)"
                value={chefInfo.image || ''}
                aspectRatio="28/32"
                onChange={(dataUrl) => setChefInfo((f) => ({ ...f, image: dataUrl }))}
              />
              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={LABEL}>Chef Name</label>
                  <input style={INPUT_STYLE} value={chefInfo.name} onChange={(e) => setChefInfo((f) => ({ ...f, name: e.target.value }))} />
                </div>
                <div>
                  <label style={LABEL}>Title / Role</label>
                  <input style={INPUT_STYLE} value={chefInfo.title} onChange={(e) => setChefInfo((f) => ({ ...f, title: e.target.value }))} />
                </div>
              </div>
              <div>
                <label style={LABEL}>Biography</label>
                <textarea style={{ ...INPUT_STYLE, minHeight: '120px', resize: 'vertical' }} value={chefInfo.bio} onChange={(e) => setChefInfo((f) => ({ ...f, bio: e.target.value }))} />
              </div>
              <div>
                <label style={LABEL}>Philosophy / Quote</label>
                <textarea style={{ ...INPUT_STYLE, minHeight: '80px', resize: 'vertical' }} value={chefInfo.philosophy} onChange={(e) => setChefInfo((f) => ({ ...f, philosophy: e.target.value }))} />
              </div>
              <div>
                <label style={LABEL}>Education / Training (one per line)</label>
                <textarea
                  style={{ ...INPUT_STYLE, minHeight: '80px', resize: 'vertical' }}
                  value={chefInfo.education.join('\n')}
                  onChange={(e) => setChefInfo((f) => ({ ...f, education: e.target.value.split('\n').filter(Boolean) }))}
                />
              </div>
              <div>
                <label style={LABEL}>Signature Dishes (one per line)</label>
                <textarea
                  style={{ ...INPUT_STYLE, minHeight: '80px', resize: 'vertical' }}
                  value={chefInfo.signature.join('\n')}
                  onChange={(e) => setChefInfo((f) => ({ ...f, signature: e.target.value.split('\n').filter(Boolean) }))}
                />
              </div>
              <div>
                <label style={LABEL}>Media Features (comma separated)</label>
                <input
                  style={INPUT_STYLE}
                  value={chefInfo.media.join(', ')}
                  onChange={(e) => setChefInfo((f) => ({ ...f, media: e.target.value.split(',').map((s) => s.trim()).filter(Boolean) }))}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── HOMEPAGE CONTENT TAB ──────────────────────────────────────── */}
      {tab === 'homepage' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          {/* Hero Section */}
          <div style={{ background: 'var(--dark-card)', border: '1px solid var(--dark-border)', padding: '28px' }}>
            <h3 style={SECTION_TITLE}><Globe size={14} style={{ display: 'inline', marginRight: '8px' }} />Hero Header</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <ImageUploader
                label="Hero Background Image"
                value={homepage.heroBgImage}
                aspectRatio="21/9"
                onChange={(dataUrl) => setHomepage((f) => ({ ...f, heroBgImage: dataUrl }))}
              />
              <div>
                <label style={LABEL}>Hero Eyebrow / Sub-Header</label>
                <input
                  style={INPUT_STYLE}
                  value={homepage.heroEyebrow}
                  onChange={(e) => setHomepage((f) => ({ ...f, heroEyebrow: e.target.value }))}
                  placeholder="e.g. Silchar • Est. 2021"
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={LABEL}>Hero Title Line 1</label>
                  <input
                    style={INPUT_STYLE}
                    value={homepage.heroTitleLine1}
                    onChange={(e) => setHomepage((f) => ({ ...f, heroTitleLine1: e.target.value }))}
                  />
                </div>
                <div>
                  <label style={LABEL}>Hero Title Line 2</label>
                  <input
                    style={INPUT_STYLE}
                    value={homepage.heroTitleLine2}
                    onChange={(e) => setHomepage((f) => ({ ...f, heroTitleLine2: e.target.value }))}
                  />
                </div>
                <div>
                  <label style={LABEL}>Hero Title Italic</label>
                  <input
                    style={INPUT_STYLE}
                    value={homepage.heroTitleItalic}
                    onChange={(e) => setHomepage((f) => ({ ...f, heroTitleItalic: e.target.value }))}
                  />
                </div>
              </div>
              <div>
                <label style={LABEL}>Hero Tagline / Description</label>
                <input
                  style={INPUT_STYLE}
                  value={homepage.heroTagline}
                  onChange={(e) => setHomepage((f) => ({ ...f, heroTagline: e.target.value }))}
                />
              </div>
            </div>
          </div>


          {/* About Space / Quotes Section */}
          <div style={{ background: 'var(--dark-card)', border: '1px solid var(--dark-border)', padding: '28px' }}>
            <h3 style={SECTION_TITLE}><Sparkles size={14} style={{ display: 'inline', marginRight: '8px' }} />About space quote</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <ImageUploader
                label="About Section Background Image"
                value={homepage.aboutBgImage}
                aspectRatio="21/9"
                onChange={(dataUrl) => setHomepage((f) => ({ ...f, aboutBgImage: dataUrl }))}
              />
              <div>
                <label style={LABEL}>Quote Eyebrow</label>
                <input
                  style={INPUT_STYLE}
                  value={homepage.aboutEyebrow}
                  onChange={(e) => setHomepage((f) => ({ ...f, aboutEyebrow: e.target.value }))}
                />
              </div>
              <div>
                <label style={LABEL}>Quote / Founder Philosophy</label>
                <textarea
                  style={{ ...INPUT_STYLE, minHeight: '80px', resize: 'vertical' }}
                  value={homepage.aboutQuote}
                  onChange={(e) => setHomepage((f) => ({ ...f, aboutQuote: e.target.value }))}
                />
              </div>
            </div>
          </div>
        </div>
      )}



      {/* ── MENU GUTTER IMAGES TAB ────────────────────────────────────── */}
      {tab === 'gutters' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          <div style={{ background: 'var(--dark-card)', border: '1px solid var(--dark-border)', padding: '28px' }}>
            <h3 style={SECTION_TITLE}><ImageIcon size={14} style={{ display: 'inline', marginRight: '8px' }} />Menu Page Gutter Images</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '24px', lineHeight: 1.5 }}>
              Upload custom, colorful food/drink images for the left and right gutters of each menu category. If left empty, the site will automatically display premium defaults. Use high-contrast colorful graphics that pop on dark screens!
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
              {categories.map((cat, idx) => (
                <div key={cat.id} style={{ borderBottom: idx < categories.length - 1 ? '1px dashed var(--dark-border)' : 'none', paddingBottom: '32px' }}>
                  <h4 style={{ fontFamily: 'var(--font-sans)', fontSize: '0.9rem', color: 'var(--gold)', fontWeight: 600, marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    {cat.label}
                  </h4>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
                    {/* Left Top */}
                    <div>
                      <label style={LABEL}>Left Top Image</label>
                      <ImageUploader
                        value={cat.gutterImageLeftTop || ''}
                        onChange={(val) => {
                          setCategories(prev => prev.map(c => c.id === cat.id ? { ...c, gutterImageLeftTop: val } : c));
                        }}
                      />
                    </div>

                    {/* Left Bottom */}
                    <div>
                      <label style={LABEL}>Left Bottom Image</label>
                      <ImageUploader
                        value={cat.gutterImageLeftBottom || ''}
                        onChange={(val) => {
                          setCategories(prev => prev.map(c => c.id === cat.id ? { ...c, gutterImageLeftBottom: val } : c));
                        }}
                      />
                    </div>

                    {/* Right Top */}
                    <div>
                      <label style={LABEL}>Right Top Image</label>
                      <ImageUploader
                        value={cat.gutterImageRightTop || ''}
                        onChange={(val) => {
                          setCategories(prev => prev.map(c => c.id === cat.id ? { ...c, gutterImageRightTop: val } : c));
                        }}
                      />
                    </div>

                    {/* Right Bottom */}
                    <div>
                      <label style={LABEL}>Right Bottom Image</label>
                      <ImageUploader
                        value={cat.gutterImageRightBottom || ''}
                        onChange={(val) => {
                          setCategories(prev => prev.map(c => c.id === cat.id ? { ...c, gutterImageRightBottom: val } : c));
                        }}
                      />
                    </div>

                    {/* Category Banner Image */}
                    <div style={{ gridColumn: 'span 2' }}>
                      <label style={LABEL}>Category Banner Background Image</label>
                      <ImageUploader
                        value={cat.bannerImage || ''}
                        aspectRatio="21/9"
                        onChange={(val) => {
                          setCategories(prev => prev.map(c => c.id === cat.id ? { ...c, bannerImage: val } : c));
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── SERVER CONTROL TAB ────────────────────────────────────────── */}
      {tab === 'server' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          {/* Main Status Toggle Card */}
          <div style={{ background: 'var(--dark-card)', border: '1px solid var(--dark-border)', padding: '36px 28px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '24px', marginBottom: '24px' }}>
              <div>
                <h3 style={{ ...SECTION_TITLE, borderBottom: 'none', marginBottom: '8px', paddingBottom: 0 }}>
                  <Server size={16} style={{ display: 'inline', marginRight: '8px', verticalAlign: 'middle' }} />
                  Server Core & Services
                </h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', maxWidth: '480px', lineHeight: 1.5 }}>
                  Control the online accessibility of the restaurant website and customer ordering systems.
                </p>
              </div>

              {/* Status Glow Pill */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                padding: '8px 16px',
                background: maintenanceMode ? 'rgba(239,68,68,0.06)' : 'rgba(16,185,129,0.06)',
                border: `1px solid ${maintenanceMode ? 'rgba(239,68,68,0.25)' : 'rgba(16,185,129,0.25)'}`,
              }}>
                <div style={{
                  width: '8px', height: '8px', borderRadius: '50%',
                  background: maintenanceMode ? '#ef4444' : '#10b981',
                  boxShadow: `0 0 10px ${maintenanceMode ? 'rgba(239,68,68,0.5)' : 'rgba(16,185,129,0.5)'}`,
                  animation: 'pulse 2s infinite',
                }} />
                <span style={{ fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: maintenanceMode ? '#ef4444' : '#10b981' }}>
                  {maintenanceMode ? 'OFFLINE (MAINTENANCE)' : 'ONLINE (LIVE)'}
                </span>
              </div>
            </div>

            {/* Giant Action Button */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyItems: 'center', padding: '24px 0', borderTop: '1px solid var(--dark-border)', borderBottom: '1px solid var(--dark-border)', margin: '12px 0' }}>
              <button
                onClick={toggleMaintenance}
                style={{
                  display: 'flex', alignItems: 'center', gap: '12px',
                  padding: '16px 36px',
                  background: maintenanceMode ? '#10b981' : '#ef4444',
                  border: 'none',
                  color: '#ffffff',
                  fontFamily: 'var(--font-sans)',
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  cursor: 'pointer',
                  boxShadow: maintenanceMode ? '0 8px 24px rgba(16,185,129,0.25)' : '0 8px 24px rgba(239,68,68,0.25)',
                  transition: 'all 0.3s ease',
                }}
              >
                <Power size={18} />
                {maintenanceMode ? 'Start Server (Go Live)' : 'Stop Server (Take Offline)'}
              </button>

              <p style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '16px', fontStyle: 'italic' }}>
                * Toggling server status takes effect instantly across all active customer sessions.
              </p>
            </div>

            {/* Warnings / Explanations */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginTop: '24px' }}>
              <div style={{ padding: '16px', background: 'rgba(255,255,255,0.01)', border: '1px solid var(--dark-border)' }}>
                <h4 style={{ fontSize: '0.8rem', color: 'var(--cream)', fontWeight: 600, marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Globe size={14} color="var(--gold)" /> Public Restaurant Website
                </h4>
                <ul style={{ paddingLeft: '16px', margin: 0, fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                  <li>{maintenanceMode ? 'Public sees the offline / maintenance page.' : 'Public can view menus, events, chef about page, and location.'}</li>
                  <li>{maintenanceMode ? 'Customer ordering and checkout are disabled.' : 'Customers can place orders, select table dine-in, or delivery.'}</li>
                  <li>{maintenanceMode ? 'Table booking / reservations are blocked.' : 'Table reservations form is live and interactive.'}</li>
                </ul>
              </div>

              <div style={{ padding: '16px', background: 'rgba(255,255,255,0.01)', border: '1px solid var(--dark-border)' }}>
                <h4 style={{ fontSize: '0.8rem', color: 'var(--cream)', fontWeight: 600, marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <ShieldAlert size={14} color="var(--gold)" /> Administrator Dashboard
                </h4>
                <ul style={{ paddingLeft: '16px', margin: 0, fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                  <li>Admin and Staff portals remain fully operational.</li>
                  <li>You can still edit the menu, change gallery images, and view orders.</li>
                  <li>Live preview remains accessible via the &quot;Preview Site&quot; button.</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Customer Ordering Status Toggle Card */}
          <div style={{ background: 'var(--dark-card)', border: '1px solid var(--dark-border)', padding: '28px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '24px', marginBottom: '24px' }}>
              <div>
                <h3 style={{ ...SECTION_TITLE, borderBottom: 'none', marginBottom: '8px', paddingBottom: 0 }}>
                  <ShoppingBag size={16} style={{ display: 'inline', marginRight: '8px', verticalAlign: 'middle' }} />
                  Order Taking Status
                </h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', maxWidth: '480px', lineHeight: 1.5 }}>
                  Temporarily pause or resume customer ordering operations. When paused, customers will see a message: <strong>&quot;We are not taking orders at this time&quot;</strong> and will not be able to place new orders.
                </p>
              </div>

              {/* Status Glow Pill */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                padding: '8px 16px',
                background: acceptingOrders ? 'rgba(16,185,129,0.06)' : 'rgba(239,68,68,0.06)',
                border: `1px solid ${acceptingOrders ? 'rgba(16,185,129,0.25)' : 'rgba(239,68,68,0.25)'}`,
              }}>
                <div style={{
                  width: '8px', height: '8px', borderRadius: '50%',
                  background: acceptingOrders ? '#10b981' : '#ef4444',
                  boxShadow: `0 0 10px ${acceptingOrders ? 'rgba(16,185,129,0.5)' : 'rgba(239,68,68,0.5)'}`,
                }} />
                <span style={{ fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: acceptingOrders ? '#10b981' : '#ef4444' }}>
                  {acceptingOrders ? 'ACCEPTING ORDERS' : 'PAUSED (STOPPED)'}
                </span>
              </div>
            </div>

            {/* Giant Action Button for Ordering */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyItems: 'center', padding: '24px 0', borderTop: '1px solid var(--dark-border)', margin: '12px 0 0 0' }}>
              <button
                onClick={toggleOrdering}
                style={{
                  display: 'flex', alignItems: 'center', gap: '12px',
                  padding: '16px 36px',
                  background: acceptingOrders ? '#ef4444' : '#10b981',
                  border: 'none',
                  color: '#ffffff',
                  fontFamily: 'var(--font-sans)',
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  cursor: 'pointer',
                  boxShadow: acceptingOrders ? '0 8px 24px rgba(239,68,68,0.25)' : '0 8px 24px rgba(16,185,129,0.25)',
                  transition: 'all 0.3s ease',
                }}
              >
                <Power size={18} />
                {acceptingOrders ? 'Stop Taking Orders' : 'Start Taking Orders'}
              </button>

              <p style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '16px', fontStyle: 'italic' }}>
                * Pausing orders will immediately display a banner to customers and prevent checkouts.
              </p>
            </div>
          </div>

          {/* UPI Transaction Photo Requirement Toggle Card */}
          <div style={{ background: 'var(--dark-card)', border: '1px solid var(--dark-border)', padding: '28px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '24px', marginBottom: '24px' }}>
              <div>
                <h3 style={{ ...SECTION_TITLE, borderBottom: 'none', marginBottom: '8px', paddingBottom: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <ImageIcon size={16} />
                  UPI Transaction Proof (Snapshot)
                </h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', maxWidth: '480px', lineHeight: 1.5 }}>
                  Require staff to upload or capture a photo of the UPI transaction slip (Google Pay or PhonePe) before completing any table order checkout.
                </p>
              </div>

              {/* Status Glow Pill */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                padding: '8px 16px',
                background: requireReceiptPhoto ? 'rgba(16,185,129,0.06)' : 'rgba(239,68,68,0.06)',
                border: `1px solid ${requireReceiptPhoto ? 'rgba(16,185,129,0.25)' : 'rgba(239,68,68,0.25)'}`,
              }}>
                <div style={{
                  width: '8px', height: '8px', borderRadius: '50%',
                  background: requireReceiptPhoto ? '#10b981' : '#ef4444',
                  boxShadow: `0 0 10px ${requireReceiptPhoto ? 'rgba(16,185,129,0.5)' : 'rgba(239,68,68,0.5)'}`,
                }} />
                <span style={{ fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: requireReceiptPhoto ? '#10b981' : '#ef4444' }}>
                  {requireReceiptPhoto ? 'PHOTO REQUIRED' : 'PHOTO OPTIONAL'}
                </span>
              </div>
            </div>

            {/* Action Button */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyItems: 'center', padding: '24px 0', borderTop: '1px solid var(--dark-border)', margin: '12px 0 0 0' }}>
              <button
                type="button"
                onClick={toggleReceiptPhoto}
                style={{
                  display: 'flex', alignItems: 'center', gap: '12px',
                  padding: '16px 36px',
                  background: requireReceiptPhoto ? '#ef4444' : '#10b981',
                  border: 'none',
                  color: '#ffffff',
                  fontFamily: 'var(--font-sans)',
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  cursor: 'pointer',
                  boxShadow: requireReceiptPhoto ? '0 8px 24px rgba(239,68,68,0.25)' : '0 8px 24px rgba(16,185,129,0.25)',
                  transition: 'all 0.3s ease',
                }}
              >
                <Power size={18} />
                {requireReceiptPhoto ? 'Make Photo Optional' : 'Make Photo Mandatory'}
              </button>

              <p style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '16px', fontStyle: 'italic' }}>
                * When mandatory, table checkout will block unless a camera snapshot or receipt upload is supplied for UPI.
              </p>
            </div>
          </div>

          {/* New Arrivals Days Threshold Card */}
          <div style={{ background: 'var(--dark-card)', border: '1px solid var(--dark-border)', padding: '28px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '24px' }}>
              <div>
                <h3 style={{ ...SECTION_TITLE, borderBottom: 'none', marginBottom: '8px', paddingBottom: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Sparkles size={16} color="var(--gold)" />
                  New Arrivals Days Threshold
                </h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', maxWidth: '480px', lineHeight: 1.5, margin: 0 }}>
                  Set the number of days a menu item is considered &quot;new&quot; on the website. Items added within this timeframe will trigger the home page pop-up and show in the &quot;New Arrivals ✨&quot; tab.
                </p>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <input
                  type="number"
                  min="1"
                  max="90"
                  value={newArrivalsDaysThreshold || 10}
                  onChange={(e) => {
                    const val = parseInt(e.target.value, 10);
                    if (!isNaN(val) && val > 0) {
                      setNewArrivalsDaysThreshold(val);
                    }
                  }}
                  style={{
                    width: '80px',
                    height: '40px',
                    background: 'var(--dark-surface)',
                    border: '1px solid var(--dark-border)',
                    color: 'var(--cream)',
                    fontFamily: 'var(--font-sans)',
                    fontSize: '0.9rem',
                    textAlign: 'center',
                    outline: 'none',
                  }}
                />
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>DAYS</span>
              </div>
            </div>
          </div>

          {/* System Console Output Simulation */}
          <div style={{ background: '#0a0a0c', border: '1px solid var(--dark-border)', borderRadius: '4px', overflow: 'hidden' }}>
            <div style={{ background: '#121216', padding: '10px 16px', borderBottom: '1px solid var(--dark-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.7rem', color: 'var(--cream)', fontFamily: 'monospace', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Terminal size={13} color="var(--gold)" /> system-console --status
              </span>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981' }} />
            </div>
            <div style={{ padding: '16px', fontFamily: 'monospace', fontSize: '0.75rem', color: '#a1a1aa', lineHeight: 1.6 }}>
              <div>[SYSTEM] Fetching cluster details...</div>
              <div>[SYSTEM] Node.js version: v20.11.0</div>
              <div>[SYSTEM] Host: localhost:3000</div>
              <div>[SYSTEM] SSL Status: self-signed/developer</div>
              <div style={{ color: maintenanceMode ? '#ef4444' : '#10b981' }}>
                [ROUTER] Server traffic mode: {maintenanceMode ? 'MAINTENANCE_REDIRECT_ALL' : 'PASS_THROUGH_ACTIVE'}
              </div>
              <div style={{ color: 'var(--gold)' }}>
                [COOKIE] client_tls_maintenance_flag = {String(maintenanceMode)}
              </div>
            </div>
          </div>

          {/* Database Clean & Orders Reset */}
          <div style={{ background: 'var(--dark-card)', border: '1px solid var(--dark-border)', padding: '28px' }}>
            <h3 style={SECTION_TITLE}><ShieldAlert size={14} style={{ display: 'inline', marginRight: '8px' }} />Database Clean</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                You can reset and clear the live orders data (active and historical orders) to start fresh. This action cannot be undone.
              </p>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  onClick={async () => {
                    if (window.confirm('Are you sure you want to delete ALL orders, reservations, and logs? This will clear all data from the database.')) {
                      try {
                        const res = await fetch('/api/admin/clear-db', { method: 'POST' });
                        const data = await res.json();
                        if (data.success) {
                          clearOrders();
                          useCMSStore.getState().resetTables();

                          // Directly and synchronously modify local storage to bypass any Zustand debounce lag
                          try {
                            const localData = localStorage.getItem('thelondon-restaurant-store');
                            if (localData) {
                              const parsed = JSON.parse(localData);
                              if (parsed.state) {
                                parsed.state.orders = [];
                                parsed.state.tableOrders = [];
                                parsed.state.activeOrderId = null;
                                localStorage.setItem('thelondon-restaurant-store', JSON.stringify(parsed));
                              }
                            }
                          } catch (err) {
                            console.error('Failed to sync restaurant store to localStorage:', err);
                          }

                          try {
                            const cmsData = localStorage.getItem('thelondon-cms-store');
                            if (cmsData) {
                              const parsed = JSON.parse(cmsData);
                              if (parsed.state) {
                                parsed.state.tables = [
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
                                localStorage.setItem('thelondon-cms-store', JSON.stringify(parsed));
                              }
                            }
                          } catch (err) {
                            console.error('Failed to sync CMS store to localStorage:', err);
                          }

                          alert('All data (orders, table orders, reservations, and audit logs) has been cleared successfully.');
                          window.location.reload();
                        } else {
                          alert('Failed to clear database data: ' + (data.error || 'Unknown error'));
                        }
                      } catch (err) {
                        console.error('Failed to clear database data:', err);
                        alert('An error occurred while clearing the database.');
                      }
                    }
                  }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '8px',
                    padding: '12px 24px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid #ef4444',
                    color: '#ef4444', fontFamily: 'var(--font-sans)', fontSize: '0.72rem',
                    fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = '#ef4444'; (e.currentTarget as HTMLElement).style.color = '#ffffff'; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'rgba(239, 68, 68, 0.1)'; (e.currentTarget as HTMLElement).style.color = '#ef4444'; }}
                >
                  Clear All Orders
                </button>
              </div>
            </div>
          </div>

          {/* Security & Access Code Change */}
          <div style={{ background: 'var(--dark-card)', border: '1px solid var(--dark-border)', padding: '28px', marginTop: '24px' }}>
            <h3 style={SECTION_TITLE}><Lock size={14} style={{ display: 'inline', marginRight: '8px' }} />Owner Passcode Configuration</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                Change the access passcode that normal administrators (managers/staff) must enter to unlock these settings.
              </p>
              <form onSubmit={handleUpdatePasscode} style={{ display: 'flex', gap: '12px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: '200px' }}>
                  <label style={LABEL}>New Owner Passcode</label>
                  <input
                    type="password"
                    value={newPasscode}
                    onChange={(e) => setNewPasscode(e.target.value)}
                    placeholder="Enter new passcode"
                    style={INPUT_STYLE}
                  />
                </div>
                <button
                  type="submit"
                  style={{
                    display: 'flex', alignItems: 'center', gap: '8px',
                    padding: '12px 24px', background: 'var(--gold)', border: 'none',
                    color: 'var(--black)', fontFamily: 'var(--font-sans)', fontSize: '0.72rem',
                    fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', cursor: 'pointer',
                    height: '40px',
                  }}
                >
                  Update Passcode
                </button>
              </form>
              {passcodeSaved && (
                <p style={{ fontSize: '0.75rem', color: '#10b981', margin: 0 }}>Passcode updated successfully.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── BILL LOG TAB ────────────────────────────────────────────── */}
      {tab === 'bill-log' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ background: 'var(--dark-card)', border: '1px solid var(--dark-border)', padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '20px' }}>
              <h3 style={{ ...SECTION_TITLE, marginBottom: 0 }}><ShieldAlert size={14} style={{ display: 'inline', marginRight: '8px' }} />Bill Modification Audit Logs</h3>
              {user?.email === (process.env.NEXT_PUBLIC_SUPER_ADMIN_EMAIL || '') && (
                <button
                  onClick={async () => {
                    if (window.confirm('Are you sure you want to clear ALL bill modification logs? This action cannot be undone.')) {
                      try {
                        const res = await fetch('/api/admin/clear-bill-logs', { method: 'POST' });
                        const data = await res.json();
                        if (data.success) {
                          alert(data.message || 'Bill logs cleared successfully.');
                          fetchBillLogs(1, billLogsSearch);
                          setBillLogsPage(1);
                        } else {
                          alert('Failed to clear bill logs: ' + (data.error || 'Unknown error'));
                        }
                      } catch (err) {
                        console.error(err);
                        alert('An error occurred while clearing bill logs.');
                      }
                    }
                  }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '8px',
                    padding: '8px 16px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid #ef4444',
                    color: '#ef4444', fontFamily: 'var(--font-sans)', fontSize: '0.7rem',
                    fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = '#ef4444'; (e.currentTarget as HTMLElement).style.color = '#ffffff'; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'rgba(239, 68, 68, 0.1)'; (e.currentTarget as HTMLElement).style.color = '#ef4444'; }}
                >
                  <Trash2 size={12} /> Clear All Bill Logs
                </button>
              )}
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '20px', lineHeight: 1.5 }}>
              This log records all instances where an administrator, manager, or cashier modified a bill, including the exact items added or removed, price alterations, customer details, and the mandatory reason provided.
            </p>

            {/* Search Bar */}
            <div style={{ position: 'relative', marginBottom: '20px', maxWidth: '400px' }}>
              <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>
                <Search size={16} />
              </span>
              <input
                type="text"
                value={billLogsSearchInput}
                onChange={(e) => handleSearchBillLogs(e.target.value)}
                placeholder="Search by Order ID, customer, reason, or admin..."
                style={{
                  width: '100%', padding: '10px 14px 10px 38px',
                  background: 'var(--dark-surface)', border: '1px solid var(--dark-border)',
                  color: 'var(--cream)', fontFamily: 'var(--font-sans)', fontSize: '0.82rem',
                  outline: 'none', boxSizing: 'border-box'
                }}
              />
            </div>

            {/* Logs Table */}
            {billLogsLoading ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px', color: 'var(--text-secondary)', gap: '8px' }}>
                <RefreshCw size={16} className="animate-spin" /> Loading logs...
              </div>
            ) : billLogs.length === 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px', border: '1px dashed var(--dark-border)', color: 'var(--text-muted)', gap: '12px' }}>
                <ShieldAlert size={28} style={{ color: 'var(--text-muted)' }} />
                <p style={{ fontSize: '0.85rem', margin: 0 }}>No bill edit logs found.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ overflowX: 'auto', border: '1px solid var(--dark-border)' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem', textAlign: 'left' }}>
                    <thead>
                      <tr style={{ background: 'var(--dark-surface)', borderBottom: '1px solid var(--dark-border)' }}>
                        <th style={{ padding: '12px 16px', color: 'var(--gold)', fontWeight: 700 }}>Timestamp</th>
                        <th style={{ padding: '12px 16px', color: 'var(--gold)', fontWeight: 700 }}>Order ID</th>
                        <th style={{ padding: '12px 16px', color: 'var(--gold)', fontWeight: 700 }}>Customer / Source</th>
                        <th style={{ padding: '12px 16px', color: 'var(--gold)', fontWeight: 700 }}>Admin</th>
                        <th style={{ padding: '12px 16px', color: 'var(--gold)', fontWeight: 700 }}>Amount Change</th>
                        <th style={{ padding: '12px 16px', color: 'var(--gold)', fontWeight: 700 }}>Reason</th>
                        <th style={{ padding: '12px 16px', textAlign: 'right' }}></th>
                      </tr>
                    </thead>
                    <tbody>
                      {billLogs.map((log) => {
                        const isExpanded = expandedLogId === log.id;
                        const diffVal = log.totalDiff || 0;
                        return (
                          <React.Fragment key={log.id}>
                            <tr style={{ borderBottom: '1px solid var(--dark-border)', cursor: 'pointer', background: isExpanded ? 'rgba(212,175,55,0.02)' : 'transparent' }} onClick={() => setExpandedLogId(isExpanded ? null : log.id)}>
                              <td style={{ padding: '14px 16px', color: 'var(--cream)', whiteSpace: 'nowrap' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                  <Calendar size={12} style={{ color: 'var(--text-muted)' }} />
                                  {new Date(log.createdAt).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                                </div>
                              </td>
                              <td style={{ padding: '14px 16px', color: 'var(--gold)', fontWeight: 700 }}>{log.orderId || '—'}</td>
                              <td style={{ padding: '14px 16px', color: 'var(--cream)' }}>
                                <div style={{ fontWeight: 500 }}>{log.customerName || 'Guest'}</div>
                                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                                  {log.customerPhone || 'No Phone'} {log.tableNumber ? `• ${log.tableNumber}` : ''}
                                </div>
                              </td>
                              <td style={{ padding: '14px 16px', color: 'var(--text-secondary)' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                  <User size={12} style={{ color: 'var(--text-muted)' }} />
                                  {log.adminEmail}
                                </div>
                              </td>
                              <td style={{ padding: '14px 16px', whiteSpace: 'nowrap' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--cream)' }}>
                                  <span>₹{log.originalTotal}</span>
                                  <span style={{ color: 'var(--text-muted)' }}>→</span>
                                  <span style={{ fontWeight: 700 }}>₹{log.newTotal}</span>
                                </div>
                                <span style={{ fontSize: '0.7rem', fontWeight: 700, color: diffVal < 0 ? '#ef4444' : '#10b981' }}>
                                  {diffVal > 0 ? '+' : ''}₹{diffVal}
                                </span>
                              </td>
                              <td style={{ padding: '14px 16px', color: 'var(--cream)', fontWeight: 500 }}>{log.reason}</td>
                              <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                                <button style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                                  {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                </button>
                              </td>
                            </tr>

                            {/* Expanded Details Row */}
                            {isExpanded && (
                              <tr style={{ background: 'var(--dark-surface)', borderBottom: '1px solid var(--dark-border)' }}>
                                <td colSpan={7} style={{ padding: '20px 24px' }}>
                                  <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '32px' }}>
                                    {/* Left: Item level changes */}
                                    <div>
                                      <p style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--gold)', textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 12px' }}>Dishes & Quantities Edited</p>
                                      {(!log.itemChanges || log.itemChanges.length === 0) ? (
                                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontStyle: 'italic', margin: 0 }}>No item additions, removals, or quantity changes.</p>
                                      ) : (
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                          {log.itemChanges.map((change: string, idx: number) => {
                                            const isDel = change.startsWith('REMOVED:');
                                            const isAdd = change.startsWith('ADDED:');
                                            return (
                                              <div key={idx} style={{ fontSize: '0.75rem', padding: '6px 10px', background: isDel ? 'rgba(239,68,68,0.04)' : (isAdd ? 'rgba(16,185,129,0.04)' : 'var(--dark-card)'), borderLeft: `3px solid ${isDel ? '#ef4444' : (isAdd ? '#10b981' : 'var(--gold)')}`, color: 'var(--cream)' }}>
                                                {change}
                                              </div>
                                            );
                                          })}
                                        </div>
                                      )}

                                      {/* Tax / Charge / Discount Changes */}
                                      <p style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--gold)', textTransform: 'uppercase', letterSpacing: '0.1em', margin: '18px 0 12px' }}>Charges & Discounts Edited</p>
                                      {(!log.additiveChanges || log.additiveChanges.length === 0) ? (
                                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontStyle: 'italic', margin: 0 }}>No charges, taxes, or discounts added or removed.</p>
                                      ) : (
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                          {log.additiveChanges.map((change: string, idx: number) => {
                                            const isDel = change.startsWith('REMOVED CHARGE:');
                                            return (
                                              <div key={idx} style={{ fontSize: '0.75rem', padding: '6px 10px', background: isDel ? 'rgba(239,68,68,0.04)' : 'rgba(16,185,129,0.04)', borderLeft: `3px solid ${isDel ? '#ef4444' : '#10b981'}`, color: 'var(--cream)' }}>
                                                {change}
                                              </div>
                                            );
                                          })}
                                        </div>
                                      )}
                                    </div>

                                    {/* Right: Comparative Bill Side-by-Side */}
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                      <div>
                                        <p style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 8px' }}>Customer Contact Info</p>
                                        <table style={{ width: '100%', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                                          <tbody>
                                            <tr>
                                              <td style={{ padding: '2px 0', fontWeight: 600 }}>Email:</td>
                                              <td style={{ padding: '2px 0', color: 'var(--cream)', textAlign: 'right' }}>{log.customerEmail || '—'}</td>
                                            </tr>
                                            <tr>
                                              <td style={{ padding: '2px 0', fontWeight: 600 }}>Phone:</td>
                                              <td style={{ padding: '2px 0', color: 'var(--cream)', textAlign: 'right' }}>{log.customerPhone || '—'}</td>
                                            </tr>
                                            <tr>
                                              <td style={{ padding: '2px 0', fontWeight: 600 }}>Type:</td>
                                              <td style={{ padding: '2px 0', color: 'var(--gold)', textAlign: 'right', textTransform: 'uppercase' }}>{log.orderType}</td>
                                            </tr>
                                          </tbody>
                                        </table>
                                      </div>

                                      <div style={{ background: 'var(--dark-card)', border: '1px solid var(--dark-border)', padding: '14px', fontFamily: 'Courier New, monospace' }}>
                                        <p style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--gold)', borderBottom: '1px dashed var(--dark-border)', paddingBottom: '4px', margin: '0 0 8px' }}>BILL SUMMARY INFO</p>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.72rem' }}>
                                          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
                                            <span>Original Total:</span>
                                            <span>₹{log.originalTotal}</span>
                                          </div>
                                          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
                                            <span>New Total:</span>
                                            <span>₹{log.newTotal}</span>
                                          </div>
                                          <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, color: diffVal < 0 ? '#ef4444' : '#10b981', borderTop: '1px dashed var(--dark-border)', paddingTop: '4px' }}>
                                            <span>Difference:</span>
                                            <span>{diffVal > 0 ? '+' : ''}₹{diffVal}</span>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </td>
                              </tr>
                            )}
                          </React.Fragment>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {billLogsTotalPages > 1 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      Showing page {billLogsPage} of {billLogsTotalPages} ({billLogsTotal} total records)
                    </span>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        disabled={billLogsPage === 1}
                        onClick={() => setBillLogsPage(prev => Math.max(1, prev - 1))}
                        style={{
                          padding: '6px 12px', background: 'transparent', border: '1px solid var(--dark-border)',
                          color: billLogsPage === 1 ? 'var(--text-muted)' : 'var(--cream)', fontSize: '0.72rem',
                          cursor: billLogsPage === 1 ? 'not-allowed' : 'pointer'
                        }}
                      >
                        Previous
                      </button>
                      <button
                        disabled={billLogsPage === billLogsTotalPages}
                        onClick={() => setBillLogsPage(prev => Math.min(billLogsTotalPages, prev + 1))}
                        style={{
                          padding: '6px 12px', background: 'transparent', border: '1px solid var(--dark-border)',
                          color: billLogsPage === billLogsTotalPages ? 'var(--text-muted)' : 'var(--cream)', fontSize: '0.72rem',
                          cursor: billLogsPage === billLogsTotalPages ? 'not-allowed' : 'pointer'
                        }}
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Staff Accounts Tab ───────────────────────────────────────────── */}
      {tab === 'staff-accounts' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>

          {/* Create new account */}
          <div style={{ background: 'var(--dark-card)', border: '1px solid var(--dark-border)', padding: '24px' }}>
            <h3 style={{ ...SECTION_TITLE, display: 'flex', alignItems: 'center', gap: '10px' }}>
              <UserPlus size={16} style={{ color: 'var(--gold)' }} /> Create Staff Account
            </h3>

            {staffError && (
              <div style={{ padding: '10px 14px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', color: '#ef4444', fontSize: '0.78rem', marginBottom: '16px' }}>
                {staffError}
              </div>
            )}
            {staffSuccess && (
              <div style={{ padding: '10px 14px', background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.25)', color: '#10b981', fontSize: '0.78rem', marginBottom: '16px' }}>
                {staffSuccess}
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(220px,1fr))', gap: '14px', marginBottom: '16px' }}>
              <div>
                <label style={LABEL}>Full Name</label>
                <input style={INPUT_STYLE} placeholder="e.g. Rahul Sharma" value={newStaff.name}
                  onChange={(e) => setNewStaff(p => ({ ...p, name: e.target.value }))} />
              </div>
              <div>
                <label style={LABEL}>Email Address</label>
                <input style={INPUT_STYLE} type="email" placeholder="staff@example.com" value={newStaff.email}
                  onChange={(e) => setNewStaff(p => ({ ...p, email: e.target.value }))} />
              </div>
              <div>
                <label style={LABEL}>Password</label>
                <input style={INPUT_STYLE} type="password" placeholder="Min. 6 characters" value={newStaff.password}
                  onChange={(e) => setNewStaff(p => ({ ...p, password: e.target.value }))} />
              </div>
              <div>
                <label style={LABEL}>Role</label>
                <select style={{ ...INPUT_STYLE, appearance: 'none' }} value={newStaff.role}
                  onChange={(e) => setNewStaff(p => ({ ...p, role: e.target.value }))}>
                  <option value="manager">Manager</option>
                  <option value="waiter">Waiter</option>
                </select>
              </div>
            </div>

            <button
              disabled={staffSaving}
              onClick={async () => {
                setStaffError(null); setStaffSuccess(null);
                if (!newStaff.name || !newStaff.email || !newStaff.password) {
                  setStaffError('All fields are required.'); return;
                }
                setStaffSaving(true);
                try {
                  const res = await fetch('/api/admin/staff-accounts', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'x-admin-email': user?.email || '' },
                    body: JSON.stringify(newStaff),
                  });
                  const data = await res.json();
                  if (!res.ok) { setStaffError(data.error || 'Failed to create account.'); }
                  else {
                    setStaffSuccess(`Account created for ${newStaff.email}`);
                    setNewStaff({ name: '', email: '', password: '', role: 'manager' });
                    fetchStaffAccounts();
                  }
                } catch { setStaffError('Network error.'); }
                finally { setStaffSaving(false); }
              }}
              style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                padding: '11px 22px', background: staffSaving ? 'var(--dark-border)' : 'var(--gold)',
                border: 'none', color: 'var(--black)', fontFamily: 'var(--font-sans)',
                fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.12em',
                textTransform: 'uppercase', cursor: staffSaving ? 'not-allowed' : 'pointer',
              }}
            >
              <UserPlus size={14} /> {staffSaving ? 'Creating...' : 'Create Account'}
            </button>
          </div>

          {/* Existing accounts list */}
          <div style={{ background: 'var(--dark-card)', border: '1px solid var(--dark-border)', padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
              <h3 style={{ ...SECTION_TITLE, marginBottom: 0, borderBottom: 'none', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Users size={16} style={{ color: 'var(--gold)' }} /> Staff Accounts ({staffAccounts.length})
              </h3>
              <button onClick={fetchStaffAccounts} style={{ background: 'transparent', border: '1px solid var(--dark-border)', color: 'var(--text-secondary)', padding: '6px 12px', cursor: 'pointer', fontSize: '0.7rem', fontFamily: 'var(--font-sans)' }}>
                Refresh
              </button>
            </div>

            {staffLoading ? (
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', textAlign: 'center', padding: '24px 0' }}>Loading accounts...</p>
            ) : staffAccounts.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                <Users size={32} style={{ marginBottom: '12px', opacity: 0.4 }} />
                <p>No staff accounts yet. Create the first one above.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {staffAccounts.map((acc) => {
                  const roleColors: Record<string, string> = {
                    admin: '#f59e0b', manager: '#6366f1', waiter: '#10b981',
                  };
                  const roleColor = roleColors[acc.role] || 'var(--gold)';
                  return (
                    <div key={acc.id} style={{
                      padding: '16px', border: `1px solid ${acc.active ? 'var(--dark-border)' : 'rgba(239,68,68,0.3)'}`,
                      background: acc.active ? 'rgba(255,255,255,0.02)' : 'rgba(239,68,68,0.04)',
                      display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '12px',
                    }}>
                      {/* Avatar */}
                      <div style={{
                        width: '38px', height: '38px', borderRadius: '50%', flexShrink: 0,
                        background: `${roleColor}22`, border: `1px solid ${roleColor}44`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: roleColor, fontFamily: 'var(--font-sans)', fontWeight: 700, fontSize: '0.85rem',
                      }}>
                        {acc.name.charAt(0).toUpperCase()}
                      </div>

                      {/* Info */}
                      <div style={{ flex: 1, minWidth: '160px' }}>
                        <p style={{ fontFamily: 'var(--font-sans)', fontSize: '0.85rem', color: 'var(--cream)', fontWeight: 600, marginBottom: '2px' }}>{acc.name}</p>
                        <p style={{ fontFamily: 'var(--font-sans)', fontSize: '0.72rem', color: 'var(--text-secondary)' }}>{acc.email}</p>
                      </div>

                      {/* Role badge */}
                      <span style={{
                        padding: '3px 10px', fontSize: '0.6rem', fontWeight: 700,
                        letterSpacing: '0.12em', textTransform: 'uppercase',
                        background: `${roleColor}1a`, border: `1px solid ${roleColor}44`,
                        color: roleColor, whiteSpace: 'nowrap',
                      }}>
                        {acc.role}
                      </span>

                      {/* Status badge */}
                      <span style={{
                        padding: '3px 10px', fontSize: '0.6rem', fontWeight: 700,
                        letterSpacing: '0.1em', textTransform: 'uppercase',
                        background: acc.active ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
                        border: `1px solid ${acc.active ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}`,
                        color: acc.active ? '#10b981' : '#ef4444', whiteSpace: 'nowrap',
                      }}>
                        {acc.active ? 'Active' : 'Disabled'}
                      </span>

                      {/* Actions */}
                      <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
                        {/* Toggle active */}
                        <button
                          title={acc.active ? 'Disable account' : 'Enable account'}
                          onClick={async () => {
                            await fetch('/api/admin/staff-accounts', {
                              method: 'PATCH',
                              headers: { 'Content-Type': 'application/json', 'x-admin-email': user?.email || '' },
                              body: JSON.stringify({ id: acc.id, active: !acc.active }),
                            });
                            fetchStaffAccounts();
                          }}
                          style={{ background: 'transparent', border: '1px solid var(--dark-border)', color: acc.active ? '#f59e0b' : '#10b981', padding: '6px 8px', cursor: 'pointer' }}
                        >
                          {acc.active ? <XCircle size={14} /> : <CheckCircle size={14} />}
                        </button>

                        {/* Reset password */}
                        <button
                          title="Reset password"
                          onClick={() => { setEditingPw(editingPw === acc.id ? null : acc.id); setNewPw(''); }}
                          style={{ background: 'transparent', border: '1px solid var(--dark-border)', color: 'var(--text-secondary)', padding: '6px 8px', cursor: 'pointer' }}
                        >
                          <Edit2 size={14} />
                        </button>

                        {/* Delete */}
                        <button
                          title="Delete account"
                          onClick={async () => {
                            if (!confirm(`Delete account for ${acc.email}? This cannot be undone.`)) return;
                            await fetch('/api/admin/staff-accounts', {
                              method: 'DELETE',
                              headers: { 'Content-Type': 'application/json', 'x-admin-email': user?.email || '' },
                              body: JSON.stringify({ id: acc.id }),
                            });
                            fetchStaffAccounts();
                          }}
                          style={{ background: 'transparent', border: '1px solid rgba(239,68,68,0.4)', color: '#ef4444', padding: '6px 8px', cursor: 'pointer' }}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>

                      {/* Inline password reset */}
                      {editingPw === acc.id && (
                        <div style={{ width: '100%', display: 'flex', gap: '8px', marginTop: '4px' }}>
                          <input
                            type="password"
                            placeholder="New password (min. 6 chars)"
                            value={newPw}
                            onChange={(e) => setNewPw(e.target.value)}
                            style={{ ...INPUT_STYLE, flex: 1 }}
                          />
                          <button
                            onClick={async () => {
                              if (newPw.length < 6) { alert('Password must be at least 6 characters.'); return; }
                              const res = await fetch('/api/admin/staff-accounts', {
                                method: 'PATCH',
                                headers: { 'Content-Type': 'application/json', 'x-admin-email': user?.email || '' },
                                body: JSON.stringify({ id: acc.id, password: newPw }),
                              });
                              if (res.ok) { setEditingPw(null); setNewPw(''); setStaffSuccess('Password updated.'); }
                              else setStaffError('Failed to update password.');
                            }}
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
                  );
                })}
              </div>
            )}
          </div>

          {/* Info box */}
          <div style={{ padding: '14px 18px', background: 'rgba(197,168,92,0.06)', border: '1px solid rgba(197,168,92,0.2)', fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            <strong style={{ color: 'var(--gold)' }}>ℹ Note:</strong> Staff accounts allow your team to log in to the admin panel using their own email and password.
            Roles determine what they can access. Only the owner can create or manage these accounts.
          </div>
        </div>
      )}

      {/* Save Button (bottom) */}
      {tab !== 'server' && tab !== 'bill-log' && tab !== 'staff-accounts' && (
        <div style={{ marginTop: '32px', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
          {saved && (
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#10b981', fontSize: '0.78rem' }}>
              <RefreshCw size={13} /> Changes saved successfully
            </span>
          )}
          <button
            onClick={handleSave}
            style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              padding: '12px 28px', background: 'var(--gold)', border: 'none',
              color: 'var(--black)', fontFamily: 'var(--font-sans)', fontSize: '0.72rem',
              fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', cursor: 'pointer',
            }}
          >
            <Save size={14} /> Save All Changes
          </button>
        </div>
      )}
    </div>
  );
}
