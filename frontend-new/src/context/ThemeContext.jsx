import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem('vizo_theme');
    return saved ? saved : 'dark';
  });

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  // Helper: apply the correct favicon to the document
  const applyFavicon = (currentTheme) => {
    const t = currentTheme || localStorage.getItem('vizo_theme') || 'dark';
    const customFavicon = localStorage.getItem(
      t === 'dark' ? 'vizo_favicon_dark' : 'vizo_favicon_light'
    );
    let faviconHref;
    if (customFavicon) {
      faviconHref = customFavicon;
    } else {
      const darkFavicon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" fill="#050505" rx="8"/><text x="7" y="24" font-family="Inter, sans-serif" font-weight="900" font-size="22" fill="#ffffff">V</text><rect x="18" y="6" width="6" height="6" fill="#00E5FF" rx="1"/></svg>`;
      const lightFavicon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" fill="#ffffff" rx="8" stroke="#1a1c1c" stroke-width="1"/><text x="7" y="24" font-family="Inter, sans-serif" font-weight="900" font-size="22" fill="#1a1c1c">V</text><rect x="18" y="6" width="6" height="6" fill="#0052FF" rx="1"/></svg>`;
      const svgStr = t === 'dark' ? darkFavicon : lightFavicon;
      faviconHref = `data:image/svg+xml;utf8,${encodeURIComponent(svgStr)}`;
    }
    let link = document.querySelector("link[rel~='icon']");
    if (!link) {
      link = document.createElement('link');
      link.rel = 'icon';
      document.getElementsByTagName('head')[0].appendChild(link);
    }
    link.id = 'favicon';
    link.href = faviconHref;
  };

  useEffect(() => {
    localStorage.setItem('vizo_theme', theme);
    const root = window.document.documentElement;
    const body = window.document.body;

    if (theme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
      body.classList.add('dark');
      body.classList.remove('light');
    } else {
      root.classList.add('light');
      root.classList.remove('dark');
      body.classList.add('light');
      body.classList.remove('dark');
    }

    document.title = "VIZO TECH | Engineering the Future";
    applyFavicon(theme);
  }, [theme]);

  // Also update favicon immediately when admin uploads a new one (storage event)
  useEffect(() => {
    const handleBrandingUpdate = () => applyFavicon();
    const handleStorageChange = (e) => {
      if (e.key === 'vizo_favicon_dark' || e.key === 'vizo_favicon_light' || e.key === null) {
        applyFavicon();
      }
    };

    // BroadcastChannel for cross-tab instant sync
    const channel = new BroadcastChannel('vizo_branding');
    channel.onmessage = (event) => {
      if (event.data === 'update') {
        applyFavicon();
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

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
