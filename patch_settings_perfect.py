import os

filepath = r"c:\Users\Asus\Downloads\london\src\app\admin\settings\page.tsx"

with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Lucide icons replacement
old_icons = "import { Save, RefreshCw, ChefHat, MapPin, Phone, Mail, Clock, AlertCircle, Power, Globe, Server, Terminal, ShieldAlert, Sparkles, Image as ImageIcon, ShoppingBag } from 'lucide-react';"
new_icons = "import { Save, RefreshCw, ChefHat, MapPin, Phone, Mail, Clock, AlertCircle, Power, Globe, Server, Terminal, ShieldAlert, Sparkles, Image as ImageIcon, ShoppingBag, Lock, KeyRound, Eye, EyeOff } from 'lucide-react';"
content = content.replace(old_icons, new_icons)

# 2. State variables injection
old_mounted = "  const isMounted            = useIsMounted();"
new_mounted = """  const isMounted            = useIsMounted();
  const user                 = useRestaurantStore((s) => s.user);

  // Passcode verification state
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [passcode, setPasscode] = useState('');
  const [showPasscode, setShowPasscode] = useState(false);
  const [passcodeLoading, setPasscodeLoading] = useState(false);
  const [passcodeError, setPasscodeError] = useState<string | null>(null);

  // New setting passcode update state
  const [newPasscode, setNewPasscode] = useState('');
  const [passcodeSaved, setPasscodeSaved] = useState(false);"""
content = content.replace(old_mounted, new_mounted)

# 3. useEffect sync replacement
old_effect = """  useEffect(() => {
    if (isMounted) {
      setInfo({ ...restaurantInfo });
      setContact({ ...restaurantInfo.contact });
      setLocation({ ...restaurantInfo.location });
      setHours(restaurantInfo.hours[0] || { days: 'Mon–Sun', lunch: '11:00', dinner: '22:00' });
      setChefInfo({ ...chef });
      setHomepage({ ...homepageData });
      setCategories([...menuCategories]);
    }
  }, [isMounted, restaurantInfo, chef, homepageData, menuCategories]);"""

new_effect = """  useEffect(() => {
    if (isMounted) {
      setInfo({ ...restaurantInfo });
      setContact({ ...restaurantInfo.contact });
      setLocation({ ...restaurantInfo.location });
      setHours(restaurantInfo.hours[0] || { days: 'Mon–Sun', lunch: '11:00', dinner: '22:00' });
      setChefInfo({ ...chef });
      setHomepage({ ...homepageData });
      setCategories([...menuCategories]);

      // Bypass for Super Admin / Owner, or check sessionStorage unlock
      if (user?.email === 'admin@thelondon.co.uk') {
        setIsUnlocked(true);
      } else if (sessionStorage.getItem('settings_unlocked') === 'true') {
        setIsUnlocked(true);
      }
    }
  }, [isMounted, restaurantInfo, chef, homepageData, menuCategories, user]);"""
content = content.replace(old_effect, new_effect)

# 4. toggleMaintenance replacement
old_toggle = """  const toggleMaintenance = () => {
    const nextVal = !maintenanceMode;
    setMaintenanceMode(nextVal);
    document.cookie = `tls_maintenance=${nextVal}; path=/; max-age=31536000; SameSite=Lax`;
  };"""

new_toggle = """  const toggleMaintenance = () => {
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

        // Log passcode change
        fetch('/api/admin/logs', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'EDIT_SETTINGS',
            details: 'Owner passcode updated successfully.',
            adminEmail: user?.email || 'unknown@thelondon.co.uk',
          }),
        }).catch((err) => console.warn('Failed to log passcode change:', err));
      }
    } catch (err) {
      alert('Failed to update passcode.');
    }
  };"""
content = content.replace(old_toggle, new_toggle)

# 5. handleSave replacement
old_save = """  const handleSave = () => {
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
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };"""

new_save = """  const handleSave = () => {
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

    // Log changes to DB
    fetch('/api/admin/logs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'EDIT_SETTINGS',
        details: {
          restaurantName: info.name,
          tagline: info.tagline,
          chefName: chefInfo.name,
        },
        adminEmail: user?.email || 'unknown@thelondon.co.uk',
      }),
    }).catch((err) => console.warn('Failed to log settings changes:', err));

    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };"""
content = content.replace(old_save, new_save)

# 6. return ( wrapper replacement
old_return = "  return ("
new_return = """  if (!isUnlocked) {
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

  return ("
content = content.replace(old_return, new_return)

# 7. acceptingOrders onClick toggle
old_click = "onClick={() => setAcceptingOrders(!acceptingOrders)}"
new_click = "onClick={toggleOrdering}"
content = content.replace(old_click, new_click)

# 8. Database Clean & Orders Reset replacement
old_clean_block = """          {/* Database Clean & Orders Reset */}
          <div style={{ background: 'var(--dark-card)', border: '1px solid var(--dark-border)', padding: '28px' }}>
            <h3 style={SECTION_TITLE}><ShieldAlert size={14} style={{ display: 'inline', marginRight: '8px' }} />Database Clean</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                You can reset and clear the live orders data (active and historical orders) to start fresh. This action cannot be undone.
              </p>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  onClick={() => {
                    if (window.confirm('Are you sure you want to delete ALL orders? This will clear all current active, preparing, delivered, and cancelled order data from the system.')) {
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

                      alert('All orders data has been cleared successfully.');
                      window.location.reload();
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
          </div>"""

new_clean_block = """          {/* Database Clean & Orders Reset */}
          <div style={{ background: 'var(--dark-card)', border: '1px solid var(--dark-border)', padding: '28px' }}>
            <h3 style={SECTION_TITLE}><ShieldAlert size={14} style={{ display: 'inline', marginRight: '8px' }} />Database Clean</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                You can reset and clear the live orders data (active and historical orders) to start fresh. This action cannot be undone.
              </p>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  onClick={() => {
                    if (window.confirm('Are you sure you want to delete ALL orders? This will clear all current active, preparing, delivered, and cancelled order data from the system.')) {
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

                      // DB Logging
                      fetch('/api/admin/logs', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                          action: 'CLEAR_ORDERS',
                          details: 'All orders and table orders cleared.',
                          adminEmail: user?.email || 'unknown@thelondon.co.uk',
                        }),
                      }).catch((err) => console.warn('Failed to log clear orders:', err));

                      alert('All orders data has been cleared successfully.');
                      window.location.reload();
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
          </div>"""

content = content.replace(old_clean_block, new_clean_block)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)

print("Patch settings perfect applied successfully!")
