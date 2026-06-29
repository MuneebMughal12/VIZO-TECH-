import React, { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import API_URL from '../config/api';

export const TechSlider = () => {
  const { theme } = useTheme();
  const [technologies, setTechnologies] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchTechs = async () => {
    try {
      const res = await fetch(`${API_URL}/api/technologies`);
      if (res.ok) {
        const data = await res.json();
        setTechnologies(data);
      }
    } catch (err) {
      console.error('Failed to load technologies for slider:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTechs();

    // Cross-tab real-time sync
    const syncChannel = new BroadcastChannel('vizo_data_sync');
    syncChannel.onmessage = (event) => {
      if (event.data === 'refresh_technologies') {
        fetchTechs();
      }
    };

    return () => {
      syncChannel.close();
    };
  }, []);

  // Skeleton Loader to maintain layout stability during fetching
  if (loading) {
    return (
      <div className="w-full py-16 overflow-hidden bg-black/5 dark:bg-white/5 relative">
        <div className="max-w-container-max mx-auto px-margin-desktop mb-10 text-center">
          <div className="h-4 w-32 bg-slate-300 dark:bg-zinc-800 rounded-full mx-auto animate-pulse mb-3" />
          <div className="h-8 w-64 bg-slate-300 dark:bg-zinc-800 rounded-full mx-auto animate-pulse" />
        </div>
        <div className="flex w-max gap-8 px-4 animate-pulse">
          {Array.from({ length: 6 }).map((_, idx) => (
            <div 
              key={`skeleton-${idx}`} 
              className="w-44 h-48 md:w-52 md:h-56 bg-slate-200 dark:bg-zinc-900/50 border border-slate-300/30 dark:border-zinc-800/40 rounded-2xl shrink-0 flex flex-col items-center justify-center p-6"
            >
              <div className="w-14 h-14 md:w-16 md:h-16 rounded-xl bg-slate-300 dark:bg-zinc-800 mb-4" />
              <div className="h-4 w-24 bg-slate-300 dark:bg-zinc-800 rounded-lg mb-2" />
              <div className="h-3 w-16 bg-slate-300 dark:bg-zinc-800 rounded-md" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Do not render anything if there are no technologies registered
  if (technologies.length === 0) {
    return null;
  }

  // Duplicate the list of technologies to create a seamless infinite marquee scroll track
  // Use unique key mapping (e.g. key={`${tech._id}-duplicate`}) to prevent duplicate React keys
  const marqueeItems = [...technologies, ...technologies];

  return (
    <div className="w-full py-16 bg-transparent relative overflow-hidden select-none">
      
      {/* Visual fading gradients on edges to create depth */}
      <div className="absolute left-0 top-0 bottom-0 w-24 md:w-48 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-24 md:w-48 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />

      {/* Title */}
      <div className="max-w-container-max mx-auto px-margin-desktop text-center mb-12">
        <span className={`font-label-sm uppercase tracking-[0.2em] mb-3 block ${
          theme === 'dark' ? 'text-[#00f0ff]' : 'text-[#0052FF]'
        }`}>
          Core Arsenal
        </span>
        <h3 className="font-display-lg text-2xl md:text-3xl font-extrabold tracking-tight">
          Powering Innovation with Modern Stacks
        </h3>
      </div>

      {/* Infinite Marquee Slider track */}
      <div className="w-full flex overflow-hidden">
        <div className="flex w-max gap-8 animate-marquee hover:[animation-play-state:paused] cursor-grab active:cursor-grabbing">
          {marqueeItems.map((tech, idx) => {
            // Determine if this is from the duplicate set
            const isDuplicate = idx >= technologies.length;
            const uniqueKey = isDuplicate ? `${tech._id}-duplicate` : tech._id;

            return (
              <div 
                key={uniqueKey}
                className="w-44 h-48 md:w-52 md:h-56 glass-card rounded-2xl flex flex-col items-center justify-center p-6 shrink-0 transition-all duration-300 hover:scale-[1.03] group border border-slate-200/50 dark:border-zinc-800/80 hover:border-blue-500/40 dark:hover:border-sky-400/40"
              >
                {/* Logo with grayscale transition */}
                <div className="w-14 h-14 md:w-16 md:h-16 flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-110">
                  <img 
                    src={tech.logoUrl} 
                    alt={tech.name} 
                    className="max-w-full max-h-full object-contain filter grayscale opacity-75 dark:brightness-100 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-300"
                  />
                </div>

                {/* Name */}
                <h4 className="text-sm md:text-base font-extrabold text-on-surface text-center tracking-wide">
                  {tech.name}
                </h4>

                {/* Category */}
                <span className="text-[10px] text-on-surface-variant font-bold uppercase tracking-widest mt-1 opacity-70">
                  {tech.category}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
export default TechSlider;
