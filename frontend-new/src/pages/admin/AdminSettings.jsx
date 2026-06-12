import React, { useState, useEffect, useRef } from 'react';
import { useTheme } from '../../context/ThemeContext';

export const AdminSettings = () => {
  const { theme } = useTheme();
  
  // Settings values from Mongoose API
  const [agencyName, setAgencyName] = useState('VIZO TECH');
  const [adminEmail, setAdminEmail] = useState('admin@vizotech.agency');
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [systemStatusUpdates, setSystemStatusUpdates] = useState(false);
  
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');

  // Appearance — 4 separate SVG uploads (dark logo, light logo, dark favicon, light favicon)
  const [darkLogo,    setDarkLogo]    = useState(() => localStorage.getItem('vizo_logo_dark')    || '');
  const [lightLogo,   setLightLogo]   = useState(() => localStorage.getItem('vizo_logo_light')   || '');
  const [darkFavicon, setDarkFavicon] = useState(() => localStorage.getItem('vizo_favicon_dark')  || '');
  const [lightFavicon,setLightFavicon]= useState(() => localStorage.getItem('vizo_favicon_light') || '');
  const [appearMsg, setAppearMsg] = useState({ key: '', text: '' });
  const [uploading, setUploading] = useState('');
  const [brandingSaved, setBrandingSaved] = useState(false);
  const darkLogoRef    = useRef(null);
  const lightLogoRef   = useRef(null);
  const darkFavRef     = useRef(null);
  const lightFavRef    = useRef(null);

  const token = localStorage.getItem('vizo_admin_token');

  const showMsg = (key, text, isError = false) => {
    setAppearMsg({ key, text: (isError ? '✗ ' : '✓ ') + text });
    setTimeout(() => setAppearMsg({ key: '', text: '' }), 5000);
  };

  // Upload SVG file to backend server — returns the hosted URL (avoids localStorage quota limits)
  const uploadSvgToServer = async (file) => {
    if (!file) throw new Error('No file selected.');
    if (!file.name.toLowerCase().endsWith('.svg')) throw new Error('Please select a valid SVG file.');
    const formData = new FormData();
    formData.append('image', file);
    const res = await fetch('http://localhost:5000/api/upload', {
      method: 'POST',
      body: formData,
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.msg || 'Upload failed. Is the backend running?');
    }
    const data = await res.json();
    return data.fileUrl || data.imageUrl;
  };

  const triggerBrandingUpdate = () => {
    window.dispatchEvent(new Event('vizo_branding_updated'));
    try {
      const channel = new BroadcastChannel('vizo_branding');
      channel.postMessage('update');
      channel.close();
    } catch (err) {
      console.error('BroadcastChannel failed:', err);
    }
  };

  const makeLogoHandler = (lsKey, setter, label, ref) => async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(lsKey);
    try {
      const url = await uploadSvgToServer(file);
      localStorage.setItem(lsKey, url);
      setter(url);
      showMsg(lsKey, label + ' logo uploaded successfully!');
      triggerBrandingUpdate();
    } catch (err) {
      showMsg(lsKey, err.message, true);
    } finally {
      setUploading('');
    }
  };

  const makeLogoReset = (lsKey, setter, label, ref) => () => {
    localStorage.removeItem(lsKey);
    setter('');
    if (ref.current) ref.current.value = '';
    showMsg(lsKey, label + ' logo reset to default.');
    triggerBrandingUpdate();
  };

  const makeFavHandler = (lsKey, setter, label) => async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(lsKey);
    try {
      const url = await uploadSvgToServer(file);
      localStorage.setItem(lsKey, url);
      setter(url);
      showMsg(lsKey, label + ' favicon uploaded! It will show in the browser tab.');
      
      // Apply immediately to current tab if current theme matches
      const currentTheme = localStorage.getItem('vizo_theme') || 'dark';
      const isDarkKey = lsKey.includes('dark');
      if ((currentTheme === 'dark') === isDarkKey) {
        let link = document.querySelector("link[rel~='icon']");
        if (!link) { link = document.createElement('link'); link.rel = 'icon'; document.head.appendChild(link); }
        link.href = url;
      }
      triggerBrandingUpdate();
    } catch (err) {
      showMsg(lsKey, err.message, true);
    } finally {
      setUploading('');
    }
  };

  const makeFavReset = (lsKey, setter, label, ref) => () => {
    localStorage.removeItem(lsKey);
    setter('');
    if (ref.current) ref.current.value = '';
    showMsg(lsKey, label + ' favicon reset to default.');
    triggerBrandingUpdate();
  };

  const handleDarkLogoUpload    = makeLogoHandler('vizo_logo_dark',    setDarkLogo,    'Dark mode', darkLogoRef);
  const handleLightLogoUpload   = makeLogoHandler('vizo_logo_light',   setLightLogo,   'Light mode', lightLogoRef);
  const handleDarkFavUpload     = makeFavHandler('vizo_favicon_dark',   setDarkFavicon, 'Dark mode');
  const handleLightFavUpload    = makeFavHandler('vizo_favicon_light',  setLightFavicon,'Light mode');
  const handleResetDarkLogo     = makeLogoReset('vizo_logo_dark',    setDarkLogo,    'Dark mode', darkLogoRef);
  const handleResetLightLogo    = makeLogoReset('vizo_logo_light',   setLightLogo,   'Light mode', lightLogoRef);
  const handleResetDarkFav      = makeFavReset('vizo_favicon_dark',   setDarkFavicon, 'Dark mode', darkFavRef);
  const handleResetLightFav     = makeFavReset('vizo_favicon_light',  setLightFavicon,'Light mode', lightFavRef);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/settings');
        if (res.ok) {
          const data = await res.json();
          setAgencyName(data.agencyName || 'VIZO TECH');
          setAdminEmail(data.adminEmail || 'admin@vizotech.agency');
          setEmailAlerts(data.emailAlerts ?? true);
          setSystemStatusUpdates(data.systemStatusUpdates ?? false);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    setUpdating(true);
    setMsg('');
    setError('');

    try {
      const res = await fetch('http://localhost:5000/api/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          agencyName,
          adminEmail,
          emailAlerts,
          systemStatusUpdates
        })
      });

      if (!res.ok) throw new Error('Failed to save settings');
      setMsg('Settings successfully persisted.');
      setTimeout(() => setMsg(''), 3000);
    } catch (err) {
      setError(err.message || 'Failed to update configurations.');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return <div className="text-center py-12">Loading system preferences...</div>;
  }

  return (
    <div className="space-y-12">
      <header>
        <h2 className="font-display-lg text-3xl md:text-display-lg font-bold">Settings</h2>
        <p className="text-on-surface-variant text-sm mt-1">Manage agency profiles and notification preferences.</p>
      </header>

      {msg && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl text-sm font-semibold">
          {msg}
        </div>
      )}
      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl text-sm font-semibold">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Profile Card */}
        <section className="lg:col-span-8 glass-card rounded-3xl p-8 shadow-2xl relative overflow-hidden">
          <div className="absolute -top-12 -left-12 w-48 h-48 bg-[#00f0ff]/5 blur-[80px] rounded-full pointer-events-none" />
          
          <form onSubmit={handleSaveSettings} className="space-y-8 relative z-10">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-bold flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#00f0ff]">badge</span>
                  General Profile
                </h3>
                <p className="text-on-surface-variant text-xs mt-1">Primary details for VIZO TECH.</p>
              </div>
              <button 
                type="submit"
                disabled={updating}
                className={`text-xs font-bold border-b transition-all ${
                  theme === 'dark' ? 'text-[#00f0ff] border-[#00f0ff]/30 hover:border-[#00f0ff]' : 'text-[#0052FF] border-[#0052FF]/30 hover:border-[#0052FF]'
                }`}
              >
                {updating ? 'Saving...' : 'Save Changes'}
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-on-surface mb-2">Agency Name</label>
                <input 
                  className={`w-full border rounded-xl px-4 py-3 text-sm focus:outline-none transition-all ${
                    theme === 'dark' 
                      ? 'bg-white/5 border-white/10 text-white focus:border-[#00f0ff]' 
                      : 'bg-[#f8f9fa] border-black/10 text-black focus:border-[#0052FF]'
                  }`}
                  type="text"
                  value={agencyName}
                  onChange={e => setAgencyName(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-on-surface mb-2">Admin Email</label>
                <input 
                  className={`w-full border rounded-xl px-4 py-3 text-sm focus:outline-none transition-all ${
                    theme === 'dark' 
                      ? 'bg-white/5 border-white/10 text-white focus:border-[#00f0ff]' 
                      : 'bg-[#f8f9fa] border-black/10 text-black focus:border-[#0052FF]'
                  }`}
                  type="email"
                  value={adminEmail}
                  onChange={e => setAdminEmail(e.target.value)}
                />
              </div>
            </div>
          </form>
        </section>

        {/* Security & Access */}
        <section className="lg:col-span-4 glass-card rounded-3xl p-8 shadow-2xl relative overflow-hidden">
          <h3 className="text-lg font-bold flex items-center gap-2 mb-6">
            <span className="material-symbols-outlined text-purple-400">lock</span>
            Security
          </h3>
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between">
              <div>
                <p className="font-bold text-xs">Credentials Safe</p>
                <p className="text-[10px] text-on-surface-variant mt-0.5">Password encrypted with bcryptjs</p>
              </div>
              <span className="material-symbols-outlined text-[#00f0ff]">verified_user</span>
            </div>
          </div>
        </section>

        {/* Notifications toggles */}
        <section className="lg:col-span-12 glass-card rounded-3xl p-8 shadow-2xl">
          <h3 className="text-lg font-bold flex items-center gap-2 mb-8">
            <span className="material-symbols-outlined text-[#00f0ff]">notifications_active</span>
            Notifications
          </h3>

          <div className="space-y-4">
            {/* Toggle 1 */}
            <div className="flex items-center justify-between p-5 rounded-2xl bg-white/5 border border-white/5">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-[#00f0ff] border border-white/5">
                  <span className="material-symbols-outlined">mail</span>
                </div>
                <div>
                  <p className="font-bold text-sm">Email Alerts</p>
                  <p className="text-xs text-on-surface-variant mt-0.5">Receive critical updates about system logs and new project proposals.</p>
                </div>
              </div>
              
              <label className="relative inline-flex items-center cursor-pointer select-none">
                <input 
                  type="checkbox"
                  checked={emailAlerts}
                  onChange={e => {
                    setEmailAlerts(e.target.checked);
                    // trigger auto-save or wait for submit. Let's make it stateful and wait for form submit.
                  }}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-gray-400 after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#00f0ff]/20 peer-checked:after:bg-[#00f0ff]" />
              </label>
            </div>

            {/* Toggle 2 */}
            <div className="flex items-center justify-between p-5 rounded-2xl bg-white/5 border border-white/5">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-[#00f0ff] border border-white/5">
                  <span className="material-symbols-outlined">monitor_heart</span>
                </div>
                <div>
                  <p className="font-bold text-sm">System Status Updates</p>
                  <p className="text-xs text-on-surface-variant mt-0.5">Real-time desktop push notifications for service interruptions or deployments.</p>
                </div>
              </div>
              
              <label className="relative inline-flex items-center cursor-pointer select-none">
                <input 
                  type="checkbox"
                  checked={systemStatusUpdates}
                  onChange={e => setSystemStatusUpdates(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-gray-400 after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#00f0ff]/20 peer-checked:after:bg-[#00f0ff]" />
              </label>
            </div>
            
            <div className="pt-4 flex justify-end">
              <button
                onClick={handleSaveSettings}
                disabled={updating}
                className={`px-8 py-3 rounded-xl font-bold transition-all text-xs ${
                  theme === 'dark'
                    ? 'bg-[#00f0ff] text-black hover:brightness-110 shadow-lg shadow-[#00f0ff]/10'
                    : 'bg-[#0052FF] text-white hover:bg-[#003bbb]'
                }`}
              >
                {updating ? 'Persisting...' : 'Save Notification Preferences'}
              </button>
            </div>
          </div>
        </section>
      </div>

      {/* ─────────────────────────────────────────────────────────
          APPEARANCE — Logo & Favicon (Dark + Light)
          ───────────────────────────────────────────────────────── */}
      <div className="space-y-6">
        <header>
          <h3 className="text-xl font-bold flex items-center gap-2">
            <span className="material-symbols-outlined" style={{ color: theme === 'dark' ? '#00f0ff' : '#0052FF' }}>palette</span>
            Appearance
          </h3>
          <p className="text-on-surface-variant text-xs mt-1">
            Upload separate SVG files for <strong>dark mode</strong> and <strong>light mode</strong> — for both the navbar logo and the browser favicon tab icon.
          </p>
        </header>

        {/* ── LOGOS ── */}
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-sm" style={{ color: theme === 'dark' ? '#00f0ff' : '#0052FF' }}>image</span>
            Navbar Logo
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              { label: '🌑 Dark Mode Logo', lsKey: 'vizo_logo_dark',  value: darkLogo,  inputId: 'logo-dark-input',  ref: darkLogoRef,  onUpload: handleDarkLogoUpload,  onReset: handleResetDarkLogo,  bg: '#050505' },
              { label: '☀️ Light Mode Logo', lsKey: 'vizo_logo_light', value: lightLogo, inputId: 'logo-light-input', ref: lightLogoRef, onUpload: handleLightLogoUpload, onReset: handleResetLightLogo, bg: '#ffffff' },
            ].map(({ label, lsKey, value, inputId, ref, onUpload, onReset, bg }) => (
              <div key={lsKey} className="glass-card rounded-3xl p-7 shadow-2xl relative overflow-hidden">
                <div className="absolute -top-8 -right-8 w-32 h-32 blur-[60px] rounded-full pointer-events-none"
                  style={{ background: theme === 'dark' ? 'rgba(0,240,255,0.05)' : 'rgba(0,82,255,0.05)' }} />
                <h4 className="font-bold text-sm mb-4">{label}</h4>

                {/* Preview box with themed background */}
                <div className="w-full h-28 rounded-2xl border-2 border-dashed mb-4 flex items-center justify-center overflow-hidden"
                  style={{ borderColor: theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)', background: bg }}>
                  {value
                    ? <img src={value} alt={label} className="max-h-24 max-w-full object-contain" />
                    : <span className="text-xs" style={{ color: theme === 'dark' ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)' }}>No logo — using default</span>
                  }
                </div>

                <input ref={ref} type="file" accept=".svg,image/svg+xml" id={inputId} className="hidden" onChange={onUpload} disabled={!!uploading} />
                <div className="flex gap-2">
                  <label htmlFor={uploading ? undefined : inputId}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-xs transition-all ${
                      uploading === lsKey ? 'opacity-70 cursor-wait' : 'cursor-pointer'
                    } ${
                      theme === 'dark'
                        ? 'bg-[#00f0ff] text-black hover:brightness-110'
                        : 'bg-[#0052FF] text-white hover:bg-[#003bbb]'
                    }`}>
                    <span className="material-symbols-outlined text-sm">{uploading === lsKey ? 'hourglass_top' : 'upload'}</span>
                    {uploading === lsKey ? 'Uploading...' : 'Upload SVG'}
                  </label>
                  {value && (
                    <button onClick={onReset}
                      className={`px-3 py-2.5 rounded-xl text-xs border transition-all ${
                        theme === 'dark' ? 'border-white/10 text-on-surface-variant hover:bg-white/5' : 'border-black/10 text-gray-500 hover:bg-black/5'
                      }`} title="Reset">
                      <span className="material-symbols-outlined text-sm">restart_alt</span>
                    </button>
                  )}
                </div>
                {appearMsg.key === lsKey && (
                  <p className={`mt-2 text-xs font-semibold ${
                    appearMsg.text.startsWith('✓') ? 'text-emerald-400' : 'text-red-400'
                  }`}>{appearMsg.text}</p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* ── FAVICONS ── */}
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-sm" style={{ color: theme === 'dark' ? '#00f0ff' : '#0052FF' }}>tab</span>
            Browser Favicon (Tab Icon)
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              { label: '🌑 Dark Mode Favicon', lsKey: 'vizo_favicon_dark',  value: darkFavicon,  inputId: 'fav-dark-input',  ref: darkFavRef,  onUpload: handleDarkFavUpload,  onReset: handleResetDarkFav,  bg: '#050505' },
              { label: '☀️ Light Mode Favicon', lsKey: 'vizo_favicon_light', value: lightFavicon, inputId: 'fav-light-input', ref: lightFavRef, onUpload: handleLightFavUpload, onReset: handleResetLightFav, bg: '#ffffff' },
            ].map(({ label, lsKey, value, inputId, ref, onUpload, onReset, bg }) => (
              <div key={lsKey} className="glass-card rounded-3xl p-7 shadow-2xl relative overflow-hidden">
                <div className="absolute -top-8 -left-8 w-32 h-32 blur-[60px] rounded-full pointer-events-none"
                  style={{ background: theme === 'dark' ? 'rgba(0,240,255,0.05)' : 'rgba(0,82,255,0.05)' }} />
                <h4 className="font-bold text-sm mb-4">{label}</h4>

                {/* Preview box with themed background */}
                <div className="w-full h-20 rounded-2xl border-2 border-dashed mb-4 flex items-center justify-center overflow-hidden"
                  style={{ borderColor: theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)', background: bg }}>
                  {value ? (
                    <div className="flex flex-col items-center gap-1">
                      <img src={value} alt={label} className="w-10 h-10 object-contain" />
                      <span className="text-[9px]" style={{ color: lsKey.includes('dark') ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)' }}>favicon</span>
                    </div>
                  ) : (
                    <span className="text-xs" style={{ color: theme === 'dark' ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)' }}>No favicon — using default</span>
                  )}
                </div>

                <input ref={ref} type="file" accept=".svg,image/svg+xml" id={inputId} className="hidden" onChange={onUpload} disabled={!!uploading} />
                <div className="flex gap-2">
                  <label htmlFor={uploading ? undefined : inputId}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-xs transition-all ${
                      uploading === lsKey ? 'opacity-70 cursor-wait' : 'cursor-pointer'
                    } ${
                      theme === 'dark'
                        ? 'bg-[#00f0ff] text-black hover:brightness-110'
                        : 'bg-[#0052FF] text-white hover:bg-[#003bbb]'
                    }`}>
                    <span className="material-symbols-outlined text-sm">{uploading === lsKey ? 'hourglass_top' : 'upload'}</span>
                    {uploading === lsKey ? 'Uploading...' : 'Upload SVG'}
                  </label>
                  {value && (
                    <button onClick={onReset}
                      className={`px-3 py-2.5 rounded-xl text-xs border transition-all ${
                        theme === 'dark' ? 'border-white/10 text-on-surface-variant hover:bg-white/5' : 'border-black/10 text-gray-500 hover:bg-black/5'
                      }`} title="Reset">
                      <span className="material-symbols-outlined text-sm">restart_alt</span>
                    </button>
                  )}
                </div>
                {appearMsg.key === lsKey && (
                  <p className={`mt-2 text-xs font-semibold ${
                    appearMsg.text.startsWith('✓') ? 'text-emerald-400' : 'text-red-400'
                  }`}>{appearMsg.text}</p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* ── SAVE & APPLY BUTTON ── */}
        <div className={`p-6 rounded-2xl border ${
          theme === 'dark' ? 'border-white/5 bg-white/3' : 'border-black/5 bg-black/3'
        }`}>
          {brandingSaved && (
            <div className="mb-4 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-emerald-400">check_circle</span>
                <div>
                  <p className="text-emerald-400 font-bold text-sm">Branding applied successfully!</p>
                  <p className="text-emerald-400/70 text-xs mt-0.5">Your logo and favicon are now live on the website.</p>
                </div>
              </div>
              <a
                href="/"
                target="_blank"
                rel="noopener noreferrer"
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  theme === 'dark'
                    ? 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30'
                    : 'bg-emerald-500/20 text-emerald-700 hover:bg-emerald-500/30'
                }`}
              >
                <span className="material-symbols-outlined text-sm">open_in_new</span>
                View Homepage
              </a>
            </div>
          )}

          <div className="flex items-center justify-between">
            <div>
              <p className="font-bold text-sm">Save & Apply Branding</p>
              <p className="text-on-surface-variant text-xs mt-0.5">Apply all uploaded logos and favicons to the live website instantly.</p>
            </div>
            <button
              onClick={() => {
                triggerBrandingUpdate();
                setBrandingSaved(true);
                setTimeout(() => setBrandingSaved(false), 8000);
              }}
              className={`flex items-center gap-2 px-8 py-3 rounded-xl font-bold text-sm transition-all ${
                theme === 'dark'
                  ? 'bg-[#00f0ff] text-black hover:brightness-110 shadow-lg shadow-[#00f0ff]/10'
                  : 'bg-[#0052FF] text-white hover:bg-[#003bbb]'
              }`}
            >
              <span className="material-symbols-outlined text-base">check_circle</span>
              Save & Apply
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
