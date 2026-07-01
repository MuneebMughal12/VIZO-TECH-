import React from 'react';
import { useTheme } from '../context/ThemeContext';

export const ProjectModal = ({ isOpen, onClose, project }) => {
  const { theme } = useTheme();
  const [currentSlideIndex, setCurrentSlideIndex] = React.useState(0);

  React.useEffect(() => {
    setCurrentSlideIndex(0);
  }, [project?._id]);

  if (!isOpen || !project) return null;

  // Destructure with fallbacks matching seeded data format
  const {
    title = '',
    category = '',
    client = '',
    status = 'Production',
    thumbnail = '',
    imageUrl = '',
    gallery = [],
    challenge = '',
    solution = '',
    impact = '',
    metrics = { latency: '', dailyTxs: '', uptime: '', roiMultiplier: '' },
    techStack = []
  } = project;

  const allImages = [thumbnail || imageUrl, ...(gallery || [])].filter(Boolean);

  const nextSlide = (e) => {
    e.stopPropagation();
    setCurrentSlideIndex((prev) => (prev === allImages.length - 1 ? 0 : prev + 1));
  };

  const prevSlide = (e) => {
    e.stopPropagation();
    setCurrentSlideIndex((prev) => (prev === 0 ? allImages.length - 1 : prev - 1));
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/85 backdrop-blur-md" 
        onClick={onClose}
      />

      {/* Modal Card */}
      <div className={`glass-panel w-full max-w-4xl rounded-[2rem] relative z-10 glow-border max-h-[90vh] flex flex-col overflow-hidden ${
        theme === 'dark' ? 'text-white' : 'text-[#1a1c1c]'
      }`}>
        {/* Scrollable Container */}
        <div className="overflow-y-auto p-6 md:p-10 space-y-8 flex-grow">
          {/* Header */}
          <div className="flex justify-between items-start">
            <div>
              <span className={`text-[11px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full ${
                theme === 'dark' ? 'bg-[#00f0ff]/10 text-[#00f0ff]' : 'bg-[#0052FF]/10 text-[#0052FF]'
              }`}>
                {category}
              </span>
              <h3 className="text-2xl md:text-3xl font-extrabold mt-3 tracking-tight">{title}</h3>
              <div className="flex flex-wrap gap-3 items-center mt-2 text-xs text-on-surface-variant font-medium">
                {client && (
                  <>
                    <span>Client: <strong className={theme === 'dark' ? 'text-white' : 'text-black'}>{client}</strong></span>
                    <span className="opacity-30">•</span>
                  </>
                )}
                <span className="inline-flex items-center gap-1.5">
                  <span className={`w-1.5 h-1.5 rounded-full ${
                    status === 'Production' 
                      ? 'bg-[#00f0ff] animate-pulse' 
                      : status === 'Staging' 
                        ? 'bg-purple-500' 
                        : status === 'Delivered' 
                          ? 'bg-green-500' 
                          : 'bg-gray-500'
                  }`} />
                  {status === 'Production' ? 'In Production' : status === 'Staging' ? 'Staging' : status === 'Delivered' ? 'Delivered' : 'Concept'}
                </span>
              </div>
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
            {/* The Carousel Engine: Full-Width Project Image Slider */}
            <div className="w-full h-[220px] sm:h-[320px] lg:h-[450px] xl:h-[500px] rounded-xl lg:rounded-2xl relative overflow-hidden group bg-black/40 border border-white/5">
              {allImages.length === 0 ? (
                <div className="w-full h-full flex items-center justify-center text-on-surface-variant font-mono text-xs">
                  No preview media available
                </div>
              ) : (
                <>
                  {/* Slides container */}
                  <div 
                    className="w-full h-full flex transition-transform duration-500 ease-out"
                    style={{ transform: `translateX(-${currentSlideIndex * 100}%)` }}
                  >
                    {allImages.map((src, idx) => (
                      <div key={idx} className="w-full h-full shrink-0 relative">
                        <img 
                          src={src} 
                          alt={`${title} slide ${idx + 1}`} 
                          className="w-full h-full object-cover opacity-80"
                        />
                      </div>
                    ))}
                  </div>

                  {/* Navigation Arrows (show on hover) */}
                  {allImages.length > 1 && (
                    <>
                      <button
                        onClick={prevSlide}
                        className="absolute left-4 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/60 border border-white/10 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-[#00f0ff]/15 hover:border-[#00f0ff] hover:text-[#00f0ff] transition-all z-10"
                      >
                        <span className="material-symbols-outlined text-[20px]">chevron_left</span>
                      </button>
                      <button
                        onClick={nextSlide}
                        className="absolute right-4 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/60 border border-white/10 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-[#9d4edd]/15 hover:border-[#9d4edd] hover:text-[#9d4edd] transition-all z-10"
                      >
                        <span className="material-symbols-outlined text-[20px]">chevron_right</span>
                      </button>

                      {/* Pagination Dots */}
                      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 z-10 bg-black/40 px-3 py-1.5 rounded-full border border-white/5 backdrop-blur-sm">
                        {allImages.map((_, idx) => (
                          <button
                            key={idx}
                            onClick={(e) => {
                              e.stopPropagation();
                              setCurrentSlideIndex(idx);
                            }}
                            className={`w-2 h-2 rounded-full transition-all duration-300 ${
                              idx === currentSlideIndex 
                                ? 'bg-[#00f0ff] scale-125 shadow-[0_0_8px_#00f0ff]' 
                                : 'bg-white/40 hover:bg-white/70'
                            }`}
                          />
                        ))}
                      </div>
                    </>
                  )}
                </>
              )}
            </div>

            {/* Restored Metrics Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
              <div className="bg-[#0d0d11]/60 border border-white/5 rounded-xl p-4 flex flex-col items-center justify-center text-center">
                <div className="text-[#00f0ff] font-extrabold text-lg md:text-xl truncate">{metrics.latency || '14ms'}</div>
                <div className="text-[10px] text-on-surface-variant uppercase tracking-wider mt-1">LATENCY AVG</div>
              </div>
              <div className="bg-[#0d0d11]/60 border border-white/5 rounded-xl p-4 flex flex-col items-center justify-center text-center">
                <div className="text-purple-400 font-extrabold text-lg md:text-xl truncate">{metrics.dailyTxs || '320k'}</div>
                <div className="text-[10px] text-on-surface-variant uppercase tracking-wider mt-1">DAILY TXS</div>
              </div>
              <div className="bg-[#0d0d11]/60 border border-white/5 rounded-xl p-4 flex flex-col items-center justify-center text-center">
                <div className="text-emerald-400 font-extrabold text-lg md:text-xl truncate">{metrics.uptime || '99.95%'}</div>
                <div className="text-[10px] text-on-surface-variant uppercase tracking-wider mt-1">CORE UPTIME</div>
              </div>
              <div className="bg-[#0d0d11]/60 border border-white/5 rounded-xl p-4 flex flex-col items-center justify-center text-center">
                <div className="text-amber-400 font-extrabold text-lg md:text-xl truncate">{metrics.roiMultiplier || '12x'}</div>
                <div className="text-[10px] text-on-surface-variant uppercase tracking-wider mt-1">ROI MULTIPLIER</div>
              </div>
            </div>

            {/* Under-Slider Grid: Detailed Narrative segments */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8 mt-8 pt-6 border-t border-white/5">
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
    </div>
  );
};
