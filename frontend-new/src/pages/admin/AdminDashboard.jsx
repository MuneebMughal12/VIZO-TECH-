import React, { useState, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';
import API_URL from '../../config/api';

export const AdminDashboard = () => {
  const { theme } = useTheme();
  const [projects, setProjects] = useState([]);
  const [teamCount, setTeamCount] = useState(0);
  const [totalVisits, setTotalVisits] = useState(0);
  const [weeklyTraffic, setWeeklyTraffic] = useState([0, 0, 0, 0, 0, 0, 0]);
  const [daysLabel, setDaysLabel] = useState(['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']);
  const [catalogStats, setCatalogStats] = useState({
    totalServices: 0,
    totalPackages: 0,
    pinnedPackages: 0,
    activeDiscounts: 0
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('vizo_admin_token');
        const headers = { 'Authorization': `Bearer ${token}` };

        // Projects
        const pRes = await fetch(`${API_URL}/api/projects`);
        if (pRes.ok) {
          const pData = await pRes.json();
          setProjects(pData);
        }

        // Team count
        const tRes = await fetch(`${API_URL}/api/team`);
        if (tRes.ok) {
          const tData = await tRes.json();
          setTeamCount(tData.length);
        }

        // Analytics
        const aRes = await fetch(`${API_URL}/api/analytics/stats`, { headers });
        if (aRes.ok) {
          const aData = await aRes.json();
          setTotalVisits(aData.totalVisits);
          setWeeklyTraffic(aData.chartData);
          setDaysLabel(aData.daysLabel);
        }

        // Catalog Stats
        const sRes = await fetch(`${API_URL}/api/admin/dashboard-stats`, { headers });
        if (sRes.ok) {
          const sData = await sRes.json();
          setCatalogStats(sData);
        }
      } catch (err) {
        console.error('Failed to load dashboard metrics:', err);
      }
    };
    fetchData();
  }, []);

  const maxVisits = Math.max(...weeklyTraffic, 10);
  const points = weeklyTraffic.map((count, index) => {
    const x = Math.round((index / 6) * 800);
    const y = Math.round(180 - (count / maxVisits) * 140); // Max height limit is Y=40 for peak traffic
    return { x, y };
  });

  const pathD = points.reduce((acc, p, idx) => {
    if (idx === 0) return `M${p.x},${p.y}`;
    const prev = points[idx - 1];
    const cpX1 = prev.x + 60;
    const cpY1 = prev.y;
    const cpX2 = p.x - 60;
    const cpY2 = p.y;
    return `${acc} C${cpX1},${cpY1} ${cpX2},${cpY2} ${p.x},${p.y}`;
  }, '');

  const pathReferralD = points.reduce((acc, p, idx) => {
    const yRef = Math.min(180, Math.round(180 - (p.y * 0.1))); // Slightly offset/lower Referral line
    if (idx === 0) return `M${p.x},${yRef}`;
    const prev = points[idx - 1];
    const prevYRef = Math.min(180, Math.round(180 - (prev.y * 0.1)));
    const cpX1 = prev.x + 60;
    const cpY1 = prevYRef;
    const cpX2 = p.x - 60;
    const cpY2 = yRef;
    return `${acc} C${cpX1},${cpY1} ${cpX2},${cpY2} ${p.x},${yRef}`;
  }, '');

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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Stat Card 1 */}
        <div className="glass-panel p-6 rounded-3xl flex flex-col justify-between group glow-border">
          <div className="flex justify-between items-start">
            <span className="material-symbols-outlined text-[#00f0ff] group-hover:scale-110 transition-transform">rocket_launch</span>
            <span className="text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded text-[10px] font-bold">Projects</span>
          </div>
          <div className="mt-6">
            <h3 className="text-on-surface-variant font-label-sm text-[10px] uppercase tracking-widest">Total Projects</h3>
            <p className="text-3xl font-extrabold mt-1">{projects.length}</p>
          </div>
        </div>

        {/* Stat Card 2 */}
        <div className="glass-panel p-6 rounded-3xl flex flex-col justify-between group glow-border">
          <div className="flex justify-between items-start">
            <span className="material-symbols-outlined text-purple-400 group-hover:scale-110 transition-transform">groups</span>
            <span className="text-purple-400 bg-purple-400/10 px-2 py-0.5 rounded text-[10px] font-bold">Team</span>
          </div>
          <div className="mt-6">
            <h3 className="text-on-surface-variant font-label-sm text-[10px] uppercase tracking-widest">Team Members</h3>
            <p className="text-3xl font-extrabold mt-1">{teamCount}</p>
          </div>
        </div>

        {/* Stat Card 3 */}
        <div className="glass-panel p-6 rounded-3xl flex flex-col justify-between group glow-border">
          <div className="flex justify-between items-start">
            <span className="material-symbols-outlined text-[#00E5FF] group-hover:scale-110 transition-transform">visibility</span>
            <span className="text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded text-[10px] font-bold">Traffic</span>
          </div>
          <div className="mt-6">
            <h3 className="text-on-surface-variant font-label-sm text-[10px] uppercase tracking-widest">Site Visits</h3>
            <p className="text-3xl font-extrabold mt-1">{totalVisits}</p>
          </div>
        </div>

        {/* Stat Card 4 - Total Services */}
        <div className="glass-panel p-6 rounded-3xl flex flex-col justify-between group glow-border">
          <div className="flex justify-between items-start">
            <span className="material-symbols-outlined text-cyan-400 group-hover:scale-110 transition-transform">design_services</span>
            <span className="text-cyan-400 bg-cyan-400/10 px-2 py-0.5 rounded text-[10px] font-bold">Catalog</span>
          </div>
          <div className="mt-6">
            <h3 className="text-on-surface-variant font-label-sm text-[10px] uppercase tracking-widest">Total Services</h3>
            <p className="text-3xl font-extrabold mt-1">{catalogStats.totalServices}</p>
          </div>
        </div>

        {/* Stat Card 5 - Total Packages */}
        <div className="glass-panel p-6 rounded-3xl flex flex-col justify-between group glow-border">
          <div className="flex justify-between items-start">
            <span className="material-symbols-outlined text-indigo-400 group-hover:scale-110 transition-transform">inventory_2</span>
            <span className="text-indigo-400 bg-indigo-400/10 px-2 py-0.5 rounded text-[10px] font-bold">Packages</span>
          </div>
          <div className="mt-6">
            <h3 className="text-on-surface-variant font-label-sm text-[10px] uppercase tracking-widest">Total Packages</h3>
            <p className="text-3xl font-extrabold mt-1">{catalogStats.totalPackages}</p>
          </div>
        </div>

        {/* Stat Card 6 - Pinned Packages */}
        <div className="glass-panel p-6 rounded-3xl flex flex-col justify-between group glow-border">
          <div className="flex justify-between items-start">
            <span className="material-symbols-outlined text-purple-400 group-hover:scale-110 transition-transform">push_pin</span>
            <span className="text-purple-400 bg-purple-400/10 px-2 py-0.5 rounded text-[10px] font-bold">Featured</span>
          </div>
          <div className="mt-6">
            <h3 className="text-on-surface-variant font-label-sm text-[10px] uppercase tracking-widest">Pinned Packages</h3>
            <p className="text-3xl font-extrabold mt-1">{catalogStats.pinnedPackages}</p>
          </div>
        </div>

        {/* Stat Card 7 - Active Discounts */}
        <div className="glass-panel p-6 rounded-3xl flex flex-col justify-between group glow-border">
          <div className="flex justify-between items-start">
            <span className="material-symbols-outlined text-rose-400 group-hover:scale-110 transition-transform">sell</span>
            <span className="text-rose-400 bg-rose-400/10 px-2 py-0.5 rounded text-[10px] font-bold">Discounts</span>
          </div>
          <div className="mt-6">
            <h3 className="text-on-surface-variant font-label-sm text-[10px] uppercase tracking-widest">Active Discounts</h3>
            <p className="text-3xl font-extrabold mt-1">{catalogStats.activeDiscounts}</p>
          </div>
        </div>

        {/* Stat Card 8 - Quick Task */}
        <div className="bg-[#00f0ff]/10 border border-[#00f0ff]/30 p-6 rounded-3xl flex flex-col justify-center items-center text-center group cursor-pointer hover:bg-[#00f0ff]/20 transition-all">
          <span className="material-symbols-outlined text-[#00f0ff] text-3xl mb-2">add_circle</span>
          <p className="font-label-sm text-[11px] text-[#00f0ff] font-extrabold uppercase tracking-widest">Quick Task</p>
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
              
              {pathD && (
                <path 
                  className="drop-shadow-[0_0_8px_rgba(0,240,255,0.3)]" 
                  d={pathD} 
                  fill="none" 
                  stroke={theme === 'dark' ? '#00f0ff' : '#0052FF'} 
                  strokeLinecap="round" 
                  strokeWidth="4" 
                />
              )}
              {pathReferralD && (
                <path 
                  d={pathReferralD} 
                  fill="none" 
                  stroke="#9d05ff" 
                  strokeDasharray="8 4" 
                  strokeLinecap="round" 
                  strokeWidth="2" 
                />
              )}
              {points.map((p, idx) => (
                <circle 
                  key={idx} 
                  cx={p.x} 
                  cy={p.y} 
                  fill={theme === 'dark' ? '#00f0ff' : '#0052FF'} 
                  r="5" 
                  title={`${weeklyTraffic[idx]} visits`}
                />
              ))}
            </svg>
          </div>
          <div className="flex justify-between mt-6 px-2 text-on-surface-variant font-label-sm text-[10px] uppercase tracking-wider">
            {daysLabel.map((label, idx) => (
              <span key={idx}>{label}</span>
            ))}
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
