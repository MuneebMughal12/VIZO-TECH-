import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';

export const AdminLogin = () => {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!username || !password) {
      setError('Please enter both username and password.');
      return;
    }
    
    setLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:5000/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.msg || 'Authentication failed');
      }

      // Save token and navigate
      localStorage.setItem('vizo_admin_token', data.token);
      localStorage.setItem('vizo_admin_username', data.user.username);
      navigate('/admin');
    } catch (err) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-background">
      {/* Background blobs */}
      <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-purple-500/10 blur-[100px] rounded-full" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-[#00f0ff]/5 blur-[100px] rounded-full" />

      {/* Login Card */}
      <div className={`glass-panel w-full max-w-md rounded-3xl p-8 md:p-10 relative z-10 glow-border ${
        theme === 'dark' ? 'text-white' : 'text-[#1a1c1c]'
      }`}>
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 select-none mb-3">
            <span className="font-display-lg text-[22px] font-extrabold tracking-[0.15em]">
              V
              <span className="relative inline-block px-[2px]">
                I
                <span className={`absolute -top-1.5 left-1/2 -translate-x-1/2 w-[6px] h-[6px] rounded-sm ${
                  theme === 'dark' ? 'bg-[#00E5FF] shadow-[0_0_8px_#00E5FF]' : 'bg-[#0052FF]'
                }`} />
              </span>
              ZO
            </span>
            <span className={`text-[10px] font-bold tracking-widest uppercase ml-1 px-1.5 py-0.5 rounded ${
              theme === 'dark' ? 'bg-[#00E5FF]/10 text-[#00E5FF]' : 'bg-[#0052FF]/10 text-[#0052FF]'
            }`}>
              TECH
            </span>
          </div>
          <h2 className="text-xl font-bold uppercase tracking-wider text-on-surface-variant">Admin Console</h2>
          <p className="text-xs text-on-surface-variant/70 mt-1">Provide secure access credentials</p>
        </div>

        {error && (
          <div className="mb-6 p-3 bg-red-500/10 border border-red-500/20 text-red-500 rounded-lg text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-2">Username</label>
            <input 
              className={`w-full border rounded-xl px-4 py-3 text-sm focus:outline-none transition-colors ${
                theme === 'dark' 
                  ? 'bg-white/5 border-white/10 text-white focus:border-[#00f0ff]' 
                  : 'bg-[#f8f9fa] border-black/10 text-black focus:border-[#0052FF]'
              }`}
              placeholder="Enter username" 
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-2">Password</label>
            <input 
              className={`w-full border rounded-xl px-4 py-3 text-sm focus:outline-none transition-colors ${
                theme === 'dark' 
                  ? 'bg-white/5 border-white/10 text-white focus:border-[#00f0ff]' 
                  : 'bg-[#f8f9fa] border-black/10 text-black focus:border-[#0052FF]'
              }`}
              placeholder="Enter password" 
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
          </div>

          <button 
            type="submit"
            disabled={loading}
            className={`w-full py-4 rounded-xl font-bold flex items-center justify-center transition-all ${
              theme === 'dark'
                ? 'primary-gradient-btn text-black'
                : 'bg-[#0052FF] text-white hover:bg-[#003bbb] shadow-md shadow-[#0052FF]/20'
            } disabled:opacity-50`}
          >
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
};
