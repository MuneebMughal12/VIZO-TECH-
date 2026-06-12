import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';

export const Navbar = ({ onContactClick }) => {
  const { theme, toggleTheme } = useTheme();
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const [customLogo, setCustomLogo] = useState(() => {
    const t = localStorage.getItem('vizo_theme') || 'dark';
    return localStorage.getItem(t === 'dark' ? 'vizo_logo_dark' : 'vizo_logo_light') || '';
  });

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Re-reads the correct logo from localStorage based on current theme
  const refreshLogo = (currentTheme) => {
    const t = currentTheme || localStorage.getItem('vizo_theme') || 'dark';
    setCustomLogo(localStorage.getItem(t === 'dark' ? 'vizo_logo_dark' : 'vizo_logo_light') || '');
  };

  // Listen for admin branding updates (logo change/reset) — pick correct theme variant
  useEffect(() => {
    // Custom event from AdminSettings
    const handleBrandingUpdate = () => refreshLogo();
    // Native storage event — fires when localStorage changes from any part of the app
    const handleStorageChange = (e) => {
      if (e.key === 'vizo_logo_dark' || e.key === 'vizo_logo_light' || e.key === null) {
        refreshLogo();
      }
    };

    // BroadcastChannel for cross-tab instant sync
    const channel = new BroadcastChannel('vizo_branding');
    channel.onmessage = (event) => {
      if (event.data === 'update') {
        refreshLogo();
      }
    };

    window.addEventListener('vizo_branding_updated', handleBrandingUpdate);
    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('vizo_branding_updated', handleBrandingUpdate);
      window.removeEventListener('storage', handleStorageChange);
      channel.close();
    };
  }, []);

  // Swap logo when theme changes (dark↔light)
  useEffect(() => {
    refreshLogo(theme);
  }, [theme]);

  // Re-read on every route change (catches post-admin-upload navigations)
  useEffect(() => {
    refreshLogo();
  }, [location.pathname]);

  const isActive = (path) => {
    return location.pathname === path;
  };

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'About', path: '/about' },
    { name: 'Projects', path: '/projects' },
    { name: 'Team', path: '/team' }
  ];

  return (
    <nav className={`fixed left-1/2 -translate-x-1/2 z-50 transition-all duration-500 ease-in-out ${scrolled
        ? 'top-4 w-[90%] max-w-container-max rounded-full bg-white/5 dark:bg-black/20 backdrop-blur-xl border border-black/10 dark:border-white/10 shadow-2xl py-3 px-8'
        : 'top-0 w-full rounded-none bg-transparent py-5 px-margin-desktop'
      }`}>
      <div className="max-w-container-max mx-auto flex justify-between items-center h-14">
        {/* Dynamic Branding Logo */}
        <Link to="/" className="flex items-center gap-2 select-none">
          {customLogo ? (
            <img
              src={customLogo}
              alt="VIZO TECH Logo"
              className="h-12 md:h-14 max-w-[200px] object-contain"
              style={{ filter: theme === 'dark' ? 'brightness(1)' : 'brightness(0.9)' }}
            />
          ) : (
            <span className={`font-display-lg text-[22px] font-extrabold tracking-[0.15em] ${theme === 'dark' ? 'text-white' : 'text-[#1a1c1c]'
              }`}>
              V
              <span className="relative inline-block px-[2px]">
                I
                <span className={`absolute -top-1.5 left-1/2 -translate-x-1/2 w-[7px] h-[7px] rounded-sm ${theme === 'dark'
                    ? 'bg-[#00E5FF] shadow-[0_0_8px_#00E5FF]'
                    : 'bg-[#0052FF]'
                  }`} />
              </span>
              ZO
            </span>
          )}
          {!customLogo && (
            <span className={`text-[12px] font-bold tracking-widest uppercase ml-1 px-2 py-0.5 rounded ${theme === 'dark' ? 'bg-[#00E5FF]/10 text-[#00E5FF]' : 'bg-[#0052FF]/10 text-[#0052FF]'
              }`}>
              TECH
            </span>
          )}
        </Link>

        {/* Links & Theme Toggle */}
        <div className="flex items-center gap-8">
          <ul className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <li key={link.name}>
                <Link
                  to={link.path}
                  className={`font-body-md text-sm font-semibold transition-all duration-300 relative py-1 ${isActive(link.path)
                      ? theme === 'dark' ? 'text-[#00f0ff]' : 'text-[#0052FF]'
                      : 'text-on-surface-variant hover:text-primary'
                    }`}
                >
                  {link.name}
                  {isActive(link.path) && (
                    <span className={`absolute bottom-0 left-0 w-full h-0.5 rounded-full ${theme === 'dark' ? 'bg-[#00f0ff]' : 'bg-[#0052FF]'
                      }`} />
                  )}
                </Link>
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-4">
            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className={`w-9 h-9 rounded-full flex items-center justify-center border transition-all ${theme === 'dark'
                  ? 'border-white/10 hover:bg-white/5 text-[#00E5FF]'
                  : 'border-black/10 hover:bg-black/5 text-[#0052FF]'
                }`}
              title="Toggle Theme"
            >
              <span className="material-symbols-outlined text-[20px]">
                {theme === 'dark' ? 'light_mode' : 'dark_mode'}
              </span>
            </button>

            {/* Hire Us / Contact Us CTA */}
            <button
              onClick={onContactClick}
              className={`px-6 py-2.5 rounded-full font-bold active:scale-95 duration-200 transition-all ${theme === 'dark'
                  ? 'primary-gradient-btn text-black'
                  : 'bg-[#0052FF] text-white hover:bg-[#003bbb] shadow-md shadow-[#0052FF]/20'
                }`}
            >
              Contact Us
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};
