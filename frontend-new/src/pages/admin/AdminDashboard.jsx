import React, { useState, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';

export const AdminDashboard = () => {
  const { theme } = useTheme();
  const [projects, setProjects] = useState([]);
  const [teamCount, setTeamCount] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('vizo_admin_token');
        const headers = { 'Authorization': `Bearer ${token}` };

        // Projects
        const pRes = await fetch('http://localhost:5000/api/projects');
        if (pRes.ok) {
          const pData = await pRes.json();
          setProjects(pData);
        }

        // Team count
        const tRes = await fetch('http://localhost:5000/api/team');
        if (tRes.ok) {
          const tData = await tRes.json();
          setTeamCount(tData.length);
        }
      } catch (err) {
        console.error('Failed to load dashboard metrics:', err);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="space-y-12">
      {/* Overview Title */}
      <header className="flex justify-between items-end">
        <div>
          <h2 className="font-display-lg text-3xl md:text-display-lg font-bold">Overview</h2>
          <p className="text-on-surface-variant text-sm mt-1">Engineering excellence performance metrics.</p>
        </div>
      </header>

      {/* Bento Grid Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Stat Card 1 */}
        <div className="glass-panel p-8 rounded-3xl flex flex-col justify-between group glow-border">
          <div className="flex justify-between items-start">
            <span className="material-symbols-outlined text-[#00f0ff] group-hover:scale-110 transition-transform">rocket_launch</span>
            <span className="text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded text-[10px] font-bold">+12%</span>
          </div>
          <div className="mt-8">
            <h3 className="text-on-surface-variant font-label-sm text-[10px] uppercase tracking-widest">Total Projects</h3>
            <p className="text-4xl font-extrabold mt-2">{projects.length}</p>
          </div>
        </div>

        {/* Stat Card 2 */}
        <div className="glass-panel p-8 rounded-3xl flex flex-col justify-between group glow-border">
          <div className="flex justify-between items-start">
            <span className="material-symbols-outlined text-purple-400 group-hover:scale-110 transition-transform">groups</span>
            <span className="text-purple-400 bg-purple-400/10 px-2 py-0.5 rounded text-[10px] font-bold">Stable</span>
          </div>
          <div className="mt-8">
            <h3 className="text-on-surface-variant font-label-sm text-[10px] uppercase tracking-widest">Team Members</h3>
            <p className="text-4xl font-extrabold mt-2">{teamCount}</p>
          </div>
        </div>

        {/* Stat Card 3 */}
        <div className="glass-panel p-8 rounded-3xl flex flex-col justify-between group glow-border">
          <div className="flex justify-between items-start">
            <span className="material-symbols-outlined text-[#00E5FF] group-hover:scale-110 transition-transform">visibility</span>
            <span className="text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded text-[10px] font-bold">+28%</span>
          </div>
          <div className="mt-8">
            <h3 className="text-on-surface-variant font-label-sm text-[10px] uppercase tracking-widest">Site Visits</h3>
            <p className="text-4xl font-extrabold mt-2">4.2k</p>
          </div>
        </div>

        {/* Stat Card 4 */}
        <div className="bg-[#00f0ff]/10 border border-[#00f0ff]/30 p-8 rounded-3xl flex flex-col justify-center items-center text-center group cursor-pointer hover:bg-[#00f0ff]/20 transition-all">
          <span className="material-symbols-outlined text-[#00f0ff] text-4xl mb-2">add_circle</span>
          <p className="font-label-sm text-xs text-[#00f0ff] font-extrabold uppercase tracking-widest">Quick Task</p>
        </div>
      </div>

      {/* Traffic & Active Projects layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* SVG Chart */}
        <div className="lg:col-span-2 glass-panel p-8 rounded-[2rem] h-[400px] flex flex-col glow-border">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h3 className="text-xl font-bold">Weekly Traffic</h3>
              <p className="text-on-surface-variant text-xs mt-1">Engagement across all platforms</p>
            </div>
            <div className="flex gap-2">
              <div className="flex items-center gap-2 px-3 py-1 bg-white/5 rounded-full text-[10px]">
                <div className="w-1.5 h-1.5 rounded-full bg-[#00f0ff]" />
                <span>Direct</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1 bg-white/5 rounded-full text-[10px]">
                <div className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                <span>Referral</span>
              </div>
            </div>
          </div>

          <div className="flex-grow w-full relative mt-4">
            <svg className="w-full h-full overflow-visible" viewBox="0 0 800 200">
              <line stroke="rgba(255,255,255,0.05)" strokeWidth="1" x1="0" x2="800" y1="180" y2="180" />
              <line stroke="rgba(255,255,255,0.05)" strokeWidth="1" x1="0" x2="800" y1="120" y2="120" />
              <line stroke="rgba(255,255,255,0.05)" strokeWidth="1" x1="0" x2="800" y1="60" y2="60" />
              
              <path 
                className="drop-shadow-[0_0_8px_rgba(0,240,255,0.3)]" 
                d="M0,150 Q100,140 200,80 T400,100 T600,40 T800,60" 
                fill="none" 
                stroke={theme === 'dark' ? '#00f0ff' : '#0052FF'} 
                strokeLinecap="round" 
                strokeWidth="4" 
              />
              <path 
                d="M0,180 Q150,170 300,130 T500,150 T800,90" 
                fill="none" 
                stroke="#9d05ff" 
                strokeDasharray="8 4" 
                strokeLinecap="round" 
                strokeWidth="2" 
              />
              <circle cx="200" cy="80" fill={theme === 'dark' ? '#00f0ff' : '#0052FF'} r="6" />
              <circle cx="600" cy="40" fill={theme === 'dark' ? '#00f0ff' : '#0052FF'} r="6" />
            </svg>
          </div>
          <div className="flex justify-between mt-6 px-2 text-on-surface-variant font-label-sm text-[10px] uppercase tracking-wider">
            <span>Mon</span>
            <span>Tue</span>
            <span>Wed</span>
            <span>Thu</span>
            <span>Fri</span>
            <span>Sat</span>
            <span>Sun</span>
          </div>
        </div>

        {/* Active Projects Panel */}
        <div className="glass-panel p-8 rounded-[2rem] flex flex-col glow-border">
          <h3 className="text-xl font-bold mb-6">Active Repository</h3>
          <div className="space-y-6 flex-grow">
            {projects.slice(0, 3).map((proj, idx) => (
              <div key={proj._id} className="flex items-center gap-4 group">
                <div className={`w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center border border-white/10 group-hover:border-primary transition-colors`}>
                  <span className="material-symbols-outlined text-primary text-lg">
                    {idx === 0 ? 'architecture' : idx === 1 ? 'cloud_done' : 'hub'}
                  </span>
                </div>
                <div className="flex-1 overflow-hidden">
                  <p className="font-label-sm text-sm font-bold truncate">{proj.title}</p>
                  <p className="text-[11px] text-on-surface-variant uppercase tracking-wider mt-0.5">{proj.category}</p>
                </div>
                <div className={`w-1.5 h-8 rounded-full ${
                  idx === 0 ? 'bg-[#00f0ff]' : idx === 1 ? 'bg-purple-500' : 'bg-emerald-500'
                }`} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
