import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';

export const TeamCarousel = ({ members }) => {
  const { theme } = useTheme();
  const [activeIndex, setActiveIndex] = useState(0);

  // Auto-rotation timer (optional, pause on hover)
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (isHovered || members.length <= 1) return;
    const interval = setInterval(() => {
      handleNext();
    }, 5000);
    return () => clearInterval(interval);
  }, [activeIndex, isHovered, members.length]);

  if (!members || members.length === 0) {
    return (
      <div className="py-12 text-center text-on-surface-variant text-sm font-semibold">
        No pinned team members found.
      </div>
    );
  }

  const handlePrev = () => {
    setActiveIndex((prev) => (prev === 0 ? members.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setActiveIndex((prev) => (prev === members.length - 1 ? 0 : prev + 1));
  };

  // Helper to compute circular distance in either direction
  const getCircularDistance = (index, active, total) => {
    let diff = index - active;
    while (diff < -total / 2) diff += total;
    while (diff > total / 2) diff -= total;
    return diff;
  };

  const activeMember = members[activeIndex];

  return (
    <div 
      className="w-full max-w-5xl mx-auto px-4 py-8"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Outer rounded container mirroring the premium design */}
      <div className="relative rounded-[2.5rem] bg-slate-50 dark:bg-zinc-900/40 border border-slate-200/50 dark:border-zinc-800/80 shadow-2xl p-8 md:p-12 overflow-hidden flex flex-col items-center">
        {/* Subtle decorative mesh background inside container */}
        <div className="absolute inset-0 pointer-events-none -z-10 overflow-hidden opacity-30">
          <div className="absolute -top-[10%] -left-[10%] w-[30%] h-[30%] bg-blue-500/10 blur-[80px] rounded-full" />
          <div className="absolute -bottom-[10%] -right-[10%] w-[30%] h-[30%] bg-purple-500/10 blur-[80px] rounded-full" />
        </div>

        {/* Section Title */}
        <h2 className="text-3xl md:text-[44px] font-extrabold tracking-[0.25em] text-center uppercase mb-12 select-none font-display">
          <span className="bg-gradient-to-r from-blue-600 via-indigo-500 to-sky-500 bg-clip-text text-transparent dark:from-sky-400 dark:via-blue-500 dark:to-purple-400">
            OUR TEAM
          </span>
        </h2>

        {/* Main Carousel Stack Area */}
        <div className="relative w-full flex items-center justify-between min-h-[300px] md:min-h-[380px] px-2 md:px-12">
          
          {/* Left Arrow Button */}
          <button
            onClick={handlePrev}
            className="hidden md:flex z-30 w-10 h-10 rounded-full bg-blue-600 hover:bg-blue-700 dark:bg-sky-500 dark:hover:bg-sky-600 items-center justify-center text-white shadow-md hover:scale-110 active:scale-95 transition-all duration-300 focus:outline-none shrink-0"
            aria-label="Previous Team Member"
          >
            <span className="material-symbols-outlined font-bold text-sm">chevron_left</span>
          </button>

          {/* 3D Stack Container */}
          <div 
            className="relative flex-grow flex items-center justify-center h-[260px] md:h-[340px] overflow-visible"
            style={{ perspective: '1200px' }}
          >
            <AnimatePresence initial={false}>
              {members.map((member, i) => {
                const distance = getCircularDistance(i, activeIndex, members.length);
                const absDistance = Math.abs(distance);

                // Hide cards that are too far in the circular buffer (only show center and 2 layers of side cards)
                const isVisible = absDistance <= 2;
                if (!isVisible) return null;

                // 3D positioning config based on circular distance
                // Horizontal spacing scaling down as stack goes deeper
                const spacing = window.innerWidth < 768 ? 55 : 120;
                const xOffset = distance * spacing;

                // Scale decreases for background cards
                const scale = 1 - absDistance * 0.15;

                // Slight 3D rotation inward facing the center card
                const rotateY = distance * -12;

                // Depth position (z-index and translateZ)
                const zIndex = members.length - absDistance;
                const translateZ = -absDistance * 100;

                // Premium visual depth: blur and grayscale on sides
                const blurVal = absDistance > 0 ? `blur(${absDistance * 1.5}px)` : 'blur(0px)';
                const grayscaleVal = absDistance > 0 ? 'grayscale(80%)' : 'grayscale(0%)';
                const opacity = absDistance > 2 ? 0 : 1 - absDistance * 0.25;

                return (
                  <motion.div
                    key={member._id}
                    style={{
                      zIndex,
                      transformStyle: 'preserve-3d',
                    }}
                    initial={{
                      opacity: 0,
                      scale: 0.6,
                      x: xOffset,
                      rotateY: rotateY,
                    }}
                    animate={{
                      opacity,
                      scale,
                      x: xOffset,
                      rotateY,
                      z: translateZ,
                      filter: `${blurVal} ${grayscaleVal}`,
                    }}
                    exit={{
                      opacity: 0,
                      scale: 0.6,
                      x: xOffset * 1.2,
                    }}
                    transition={{
                      type: 'spring',
                      stiffness: 260,
                      damping: 24,
                    }}
                    drag="x"
                    dragConstraints={{ left: 0, right: 0 }}
                    onDragEnd={(e, info) => {
                      const swipeThreshold = 50;
                      if (info.offset.x < -swipeThreshold) {
                        handleNext();
                      } else if (info.offset.x > swipeThreshold) {
                        handlePrev();
                      }
                    }}
                    onClick={() => {
                      if (i !== activeIndex) {
                        setActiveIndex(i);
                      }
                    }}
                    className={`absolute w-[160px] h-[220px] md:w-[220px] md:h-[290px] rounded-2xl overflow-hidden cursor-pointer shadow-xl border ${
                      absDistance === 0 
                        ? 'border-blue-500/40 dark:border-sky-500/40 shadow-blue-500/10' 
                        : 'border-slate-300/40 dark:border-zinc-800/60'
                    }`}
                  >
                    <img
                      src={member.imageUrl}
                      alt={member.name}
                      className="w-full h-full object-cover select-none pointer-events-none"
                    />
                    {/* Dark gradient overlay on card base to soften image edge */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>

          {/* Right Arrow Button */}
          <button
            onClick={handleNext}
            className="hidden md:flex z-30 w-10 h-10 rounded-full bg-blue-600 hover:bg-blue-700 dark:bg-sky-500 dark:hover:bg-sky-600 items-center justify-center text-white shadow-md hover:scale-110 active:scale-95 transition-all duration-300 focus:outline-none shrink-0"
            aria-label="Next Team Member"
          >
            <span className="material-symbols-outlined font-bold text-sm">chevron_right</span>
          </button>
        </div>

        {/* Mobile Slide Arrow Navigation Controls */}
        <div className="flex md:hidden items-center justify-center gap-6 mt-6 z-20">
          <button
            onClick={handlePrev}
            className="w-8 h-8 rounded-full bg-blue-600 hover:bg-blue-700 dark:bg-sky-500 dark:hover:bg-sky-600 flex items-center justify-center text-white shadow-md hover:scale-105 active:scale-95 transition-all duration-300 focus:outline-none"
            aria-label="Previous Team Member"
          >
            <span className="material-symbols-outlined font-bold text-xs">chevron_left</span>
          </button>
          <button
            onClick={handleNext}
            className="w-8 h-8 rounded-full bg-blue-600 hover:bg-blue-700 dark:bg-sky-500 dark:hover:bg-sky-600 flex items-center justify-center text-white shadow-md hover:scale-105 active:scale-95 transition-all duration-300 focus:outline-none"
            aria-label="Next Team Member"
          >
            <span className="material-symbols-outlined font-bold text-xs">chevron_right</span>
          </button>
        </div>

        {/* Selected Member Text Details Underneath Card Layout */}
        <div className="mt-8 text-center flex flex-col items-center select-none">
          <div className="flex items-center justify-center gap-4 my-2 w-full max-w-xs md:max-w-md">
            <div className="h-[1px] flex-grow bg-gradient-to-r from-transparent to-blue-600/50 dark:to-sky-400/50" />
            <h3 className="text-xl md:text-2xl font-extrabold text-blue-600 dark:text-sky-400 font-headline tracking-wide shrink-0">
              {activeMember.name}
            </h3>
            <div className="h-[1px] flex-grow bg-gradient-to-l from-transparent to-blue-600/50 dark:to-sky-400/50" />
          </div>
          <span className="text-xs md:text-sm font-extrabold uppercase tracking-[0.2em] text-slate-500 dark:text-zinc-400 mt-1">
            {activeMember.role}
          </span>
        </div>

        {/* Minimalistic Dot Indicators at the bottom */}
        <div className="flex justify-center items-center gap-2.5 mt-8 z-20">
          {members.map((_, i) => (
            <button
              key={i}
              onClick={() => setActiveIndex(i)}
              className={`h-2.5 rounded-full transition-all duration-500 focus:outline-none ${
                i === activeIndex 
                  ? 'w-6 bg-blue-600 dark:bg-sky-400' 
                  : 'w-2.5 bg-slate-300 dark:bg-zinc-700 hover:bg-slate-400 dark:hover:bg-zinc-600'
              }`}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
