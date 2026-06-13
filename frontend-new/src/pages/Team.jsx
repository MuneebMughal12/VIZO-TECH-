import React, { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import API_URL from '../config/api';

export const Team = () => {
  const { theme } = useTheme();
  const [team, setTeam] = useState([]);

  const fetchTeam = async () => {
    try {
      const res = await fetch(`${API_URL}/api/team`);
      if (res.ok) {
        const data = await res.json();
        setTeam(data);
      }
    } catch (err) {
      console.error('Error fetching team:', err);
    }
  };

  useEffect(() => {
    fetchTeam();

    const syncChannel = new BroadcastChannel('vizo_data_sync');
    syncChannel.onmessage = (event) => {
      if (event.data === 'refresh_team') {
        fetchTeam();
      }
    };

    return () => {
      syncChannel.close();
    };
  }, []);

  return (
    <main className="pt-32 pb-section-gap max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop">
      {/* Background Mesh */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute top-[20%] right-[-10%] w-[40%] h-[40%] bg-purple-500/5 blur-[120px] rounded-full animate-float" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-[#00f0ff]/5 blur-[150px] rounded-full animate-float" style={{ animationDelay: '-5s' }} />
      </div>

      {/* Hero Title */}
      <div className="mb-20 text-center space-y-6">
        <h1 className="font-display-xl text-4xl md:text-display-xl text-gradient font-extrabold tracking-tight">Meet the Experts</h1>
        <p className="font-body-lg text-sm md:text-body-lg text-on-surface-variant max-w-2xl mx-auto leading-relaxed">
          The multidisciplinary minds behind VIZO TECH's technological frontier. We merge engineering precision with architectural vision to build the future.
        </p>
      </div>

      {/* Team Grid */}
      {team.length === 0 ? (
        <div className="py-24 text-center text-on-surface-variant text-sm font-semibold">
          No team members registered yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-gutter">
          {team.map((member, idx) => (
            <div 
              key={member._id} 
              className="glass-card rounded-2xl overflow-hidden p-5 group flex flex-col hover:-translate-y-2 hover:scale-[1.01]"
            >
              {/* Image with grayscale-to-color filter */}
              <div className="relative w-full aspect-square mb-6 overflow-hidden rounded-xl bg-black/40 border border-white/5">
                <img 
                  alt={member.name} 
                  className="w-full h-full object-cover filter grayscale group-hover:grayscale-0 transition-all duration-700 ease-in-out" 
                  src={member.imageUrl}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
              </div>

              {/* Text */}
              <div className="px-2 flex-grow flex flex-col justify-between">
                <div>
                  <h3 className="font-headline-lg text-xl font-bold text-on-surface mb-1">{member.name}</h3>
                  <p className={`font-label-sm text-[10px] font-bold tracking-widest uppercase mb-4 ${
                    theme === 'dark' ? 'text-[#00f0ff]' : 'text-[#0052FF]'
                  }`}>
                    {member.role}
                  </p>
                  <p className="text-xs text-on-surface-variant leading-relaxed mb-6">
                    {member.bio}
                  </p>
                </div>
                
                {/* Experience */}
                {member.experience && (
                  <div className="border-t border-black/5 dark:border-white/5 pt-4 text-[10px] font-bold text-on-surface-variant uppercase tracking-widest flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-xs">work</span>
                    <span>{member.experience} Experience</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
};
