import React from 'react';
import { useTheme } from '../context/ThemeContext';

export const ProjectModal = ({ isOpen, onClose, project }) => {
  const { theme } = useTheme();

  if (!isOpen || !project) return null;

  // Destructure with fallbacks matching seeded data format
  const {
    title = '',
    category = '',
    imageUrl = '',
    challenge = '',
    solution = '',
    impact = '',
    metrics = { latency: '', dailyTxs: '', uptime: '', roiMultiplier: '' },
    techStack = []
  } = project;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/85 backdrop-blur-md" 
        onClick={onClose}
      />

      {/* Modal Card */}
      <div className={`glass-panel w-full max-w-4xl rounded-[2rem] p-6 md:p-10 relative z-10 glow-border max-h-[90vh] overflow-y-auto ${
        theme === 'dark' ? 'text-white' : 'text-[#1a1c1c]'
      }`}>
        {/* Header */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <span className={`text-[11px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full ${
              theme === 'dark' ? 'bg-[#00f0ff]/10 text-[#00f0ff]' : 'bg-[#0052FF]/10 text-[#0052FF]'
            }`}>
              {category}
            </span>
            <h3 className="text-2xl md:text-3xl font-extrabold mt-3 tracking-tight">{title}</h3>
          </div>
          <button 
            className="material-symbols-outlined hover:scale-110 hover:text-red-500 transition-all cursor-pointer p-1 rounded-full bg-white/5"
            onClick={onClose}
          >
            close
          </button>
        </div>

        {/* Content Body */}
        <div className="space-y-8">
          {/* Main Visual Image & Key Stats */}
          <div className="grid md:grid-cols-12 gap-6 items-stretch">
            {/* Project Image */}
            <div className="md:col-span-7 aspect-video md:aspect-auto rounded-2xl overflow-hidden bg-black/40 border border-white/5">
              <img 
                src={imageUrl} 
                alt={title} 
                className="w-full h-full object-cover opacity-80"
              />
            </div>

            {/* Quick Metrics Dashboard */}
            <div className="md:col-span-5 grid grid-cols-2 gap-4">
              <div className="glass-card p-4 rounded-xl text-center flex flex-col justify-center border-l-4 border-l-[#00f0ff]">
                <div className="text-[#00f0ff] font-extrabold text-lg md:text-xl truncate">{metrics.latency || 'N/A'}</div>
                <div className="text-[10px] text-on-surface-variant uppercase tracking-wider mt-1">Latency Avg</div>
              </div>
              <div className="glass-card p-4 rounded-xl text-center flex flex-col justify-center border-l-4 border-l-purple-500">
                <div className="text-purple-400 font-extrabold text-lg md:text-xl truncate">{metrics.dailyTxs || 'N/A'}</div>
                <div className="text-[10px] text-on-surface-variant uppercase tracking-wider mt-1">Daily Txs</div>
              </div>
              <div className="glass-card p-4 rounded-xl text-center flex flex-col justify-center border-l-4 border-l-emerald-500">
                <div className="text-emerald-400 font-extrabold text-lg md:text-xl truncate">{metrics.uptime || '99.99%'}</div>
                <div className="text-[10px] text-on-surface-variant uppercase tracking-wider mt-1">Core Uptime</div>
              </div>
              <div className="glass-card p-4 rounded-xl text-center flex flex-col justify-center border-l-4 border-l-amber-500">
                <div className="text-amber-400 font-extrabold text-lg md:text-xl truncate">{metrics.roiMultiplier || '12x'}</div>
                <div className="text-[10px] text-on-surface-variant uppercase tracking-wider mt-1">ROI Multiplier</div>
              </div>
            </div>
          </div>

          {/* Detailed Narrative segments */}
          <div className="grid md:grid-cols-3 gap-8">
            <div className="space-y-3">
              <h4 className={`text-md font-bold uppercase tracking-wider flex items-center gap-2 ${
                theme === 'dark' ? 'text-[#00f0ff]' : 'text-[#0052FF]'
              }`}>
                <span className="material-symbols-outlined text-[18px]">report_problem</span>
                The Challenge
              </h4>
              <p className="text-sm text-on-surface-variant leading-relaxed">{challenge}</p>
            </div>
            <div className="space-y-3">
              <h4 className="text-md font-bold uppercase tracking-wider text-purple-400 flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px]">insights</span>
                The Solution
              </h4>
              <p className="text-sm text-on-surface-variant leading-relaxed">{solution}</p>
            </div>
            <div className="space-y-3">
              <h4 className="text-md font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px]">task_alt</span>
                The Impact
              </h4>
              <p className="text-sm text-on-surface-variant leading-relaxed">{impact}</p>
            </div>
          </div>

          {/* Tech Stack Chips & Action triggers */}
          <div className="border-t border-white/5 pt-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h5 className="text-xs font-semibold text-on-surface-variant mb-3 uppercase tracking-wider">Architecture Stack</h5>
              <div className="flex flex-wrap gap-2">
                {techStack.map(tech => (
                  <span 
                    key={tech} 
                    className="px-3 py-1 bg-white/5 dark:bg-black/30 border border-white/10 rounded-full text-xs font-medium"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex gap-4 items-center shrink-0">
              <button 
                onClick={onClose}
                className="px-6 py-2.5 glass-card rounded-xl text-sm font-bold hover:bg-white/5 transition-all"
              >
                Close Case Study
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
