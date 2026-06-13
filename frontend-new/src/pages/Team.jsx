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

  const topMember = team.find(m => m.isTopMember) || team[0];
  const otherMembers = topMember ? team.filter(m => m._id !== topMember._id) : [];

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

      {/* Team Layout */}
      {team.length === 0 ? (
        <div className="py-24 text-center text-on-surface-variant text-sm font-semibold">
          No team members registered yet.
        </div>
      ) : (
        <div className="space-y-20">
          {/* Featured Top Member */}
          {topMember && (
            <div className="space-y-6">
              <h2 className="text-[10px] font-extrabold uppercase tracking-[0.25em] text-[#00f0ff] text-center md:text-left">
                Leadership / Featured Architect
              </h2>
              <div className="glass-card rounded-[2rem] overflow-hidden p-8 md:p-12 flex flex-col md:flex-row gap-10 items-center border border-white/10 shadow-2xl relative group hover:border-[#00f0ff]/30 transition-all duration-500">
                {/* Floating gradient glow behind top member */}
                <div className="absolute -inset-0.5 bg-gradient-to-r from-[#00f0ff]/10 to-purple-500/10 rounded-[2rem] blur opacity-30 group-hover:opacity-50 transition-opacity duration-500 pointer-events-none -z-10" />
                
                {/* Top Member Image */}
                <div className="relative w-60 h-60 shrink-0 rounded-2xl overflow-hidden bg-black/40 border border-white/10">
                  <img 
                    alt={topMember.name} 
                    className="w-full h-full object-cover filter grayscale group-hover:grayscale-0 transition-all duration-700 ease-in-out" 
                    src={topMember.imageUrl}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                </div>

                {/* Top Member Details */}
                <div className="flex-grow flex flex-col justify-between h-full space-y-6 text-center md:text-left">
                  <div>
                    <div className="flex flex-col md:flex-row md:items-center gap-3 mb-2">
                      <h2 className="font-display-lg text-3xl font-extrabold text-on-surface">{topMember.name}</h2>
                      {topMember.experience && (
                        <span className="self-center md:self-auto px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[10px] font-bold tracking-widest uppercase text-on-surface-variant flex items-center gap-1">
                          <span className="material-symbols-outlined text-[10px]">work</span>
                          {topMember.experience} Experience
                        </span>
                      )}
                    </div>
                    
                    <p className={`font-label-sm text-xs font-extrabold tracking-widest uppercase mb-4 ${
                      theme === 'dark' ? 'text-[#00f0ff]' : 'text-[#0052FF]'
                    }`}>
                      {topMember.role}
                    </p>
                    
                    <p className="text-xs md:text-sm text-on-surface-variant leading-relaxed max-w-3xl">
                      {topMember.bio}
                    </p>
                  </div>

                  {/* Tech Stack tags */}
                  {topMember.techStack && topMember.techStack.length > 0 && (
                    <div className="pt-6 border-t border-black/5 dark:border-white/5">
                      <h4 className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-3">Area of Expertise</h4>
                      <div className="flex flex-wrap justify-center md:justify-start gap-2">
                        {topMember.techStack.map((stack) => (
                          <span key={stack} className="px-3 py-1 bg-white/5 text-on-surface text-xs rounded-lg border border-white/5 hover:border-[#00f0ff]/30 transition-all">
                            {stack}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Other Team Members Grid */}
          {otherMembers.length > 0 && (
            <div className="space-y-8 pt-10 border-t border-black/5 dark:border-white/5">
              <div>
                <h2 className="font-display-lg text-2xl font-bold text-on-surface">Engineering Collective</h2>
                <div className="w-12 h-1 bg-[#00f0ff] mt-3 rounded-full" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-gutter">
                {otherMembers.map((member) => (
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
            </div>
          )}
        </div>
      )}
    </main>
  );
};
