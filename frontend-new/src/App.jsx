import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Link } from 'react-router-dom';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { Navbar } from './components/Navbar';
import { ContactModal } from './components/ContactModal';
import { Home } from './pages/Home';
import { About } from './pages/About';
import { Projects } from './pages/Projects';
import { Team } from './pages/Team';

// Admin Pages
import { AdminLogin } from './pages/admin/AdminLogin';
import { AdminLayout } from './pages/admin/AdminLayout';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminNotifications } from './pages/admin/AdminNotifications';
import { AdminSettings } from './pages/admin/AdminSettings';
import { AdminProjects } from './pages/admin/AdminProjects';
import { AdminTeam } from './pages/admin/AdminTeam';
import { AdminReviews } from './pages/admin/AdminReviews';

// Inner App shell to capture location for conditional navbar rendering
const AppContent = () => {
  const { theme } = useTheme();
  const location = useLocation();
  const [isContactOpen, setIsContactOpen] = useState(false);

  // Custom footer logo — mirrors the dark/light logo uploaded by admin
  const [customFooterLogo, setCustomFooterLogo] = useState(() => {
    const t = localStorage.getItem('vizo_theme') || 'dark';
    return localStorage.getItem(t === 'dark' ? 'vizo_logo_dark' : 'vizo_logo_light') || '';
  });

  const refreshFooterLogo = (currentTheme) => {
    const t = currentTheme || localStorage.getItem('vizo_theme') || 'dark';
    setCustomFooterLogo(localStorage.getItem(t === 'dark' ? 'vizo_logo_dark' : 'vizo_logo_light') || '');
  };

  useEffect(() => {
    const handleBrandingUpdate = () => refreshFooterLogo();
    const handleStorageChange = (e) => {
      if (e.key === 'vizo_logo_dark' || e.key === 'vizo_logo_light' || e.key === null) refreshFooterLogo();
    };
    window.addEventListener('vizo_branding_updated', handleBrandingUpdate);
    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('vizo_branding_updated', handleBrandingUpdate);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  useEffect(() => { refreshFooterLogo(theme); }, [theme]);
  useEffect(() => { refreshFooterLogo(); }, [location.pathname]);

  // Hide main Navbar on admin routes
  const isAdminRoute = location.pathname.startsWith('/admin');

  return (
    <div className={`min-h-screen transition-colors duration-500 ease-in-out ${
      theme === 'dark' ? 'bg-[#050505] text-[#e5e2e1]' : 'bg-[#ffffff] text-[#1a1c1c]'
    }`}>
      {!isAdminRoute && (
        <Navbar onContactClick={() => setIsContactOpen(true)} />
      )}

      <Routes>
        {/* Public Client pages */}
        <Route path="/" element={<Home onContactClick={() => setIsContactOpen(true)} />} />
        <Route path="/about" element={<About onContactClick={() => setIsContactOpen(true)} />} />
        <Route path="/projects" element={<Projects />} />
        <Route path="/team" element={<Team />} />

        {/* Administrative panel pages */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="projects" element={<AdminProjects />} />
          <Route path="team" element={<AdminTeam />} />
          <Route path="reviews" element={<AdminReviews />} />
          <Route path="notifications" element={<AdminNotifications />} />
          <Route path="settings" element={<AdminSettings />} />
        </Route>
      </Routes>

      {/* Global Inquiries Overlay Modal */}
      <ContactModal 
        isOpen={isContactOpen} 
        onClose={() => setIsContactOpen(false)} 
      />

      {/* Global Footer (Client side only) */}
      {!isAdminRoute && (
        <footer className="w-full mt-section-gap border-t border-black/10 dark:border-white/10 bg-[#050505] text-white">
          <div className="max-w-container-max mx-auto px-margin-desktop py-16 grid grid-cols-1 md:grid-cols-4 gap-gutter">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center gap-2 select-none mb-6">
                {customFooterLogo ? (
                  <img
                    src={customFooterLogo}
                    alt="VIZO TECH Logo"
                    className="h-8 max-w-[140px] object-contain brightness-100"
                    style={{ filter: 'brightness(1) invert(0)' }}
                  />
                ) : (
                  <>
                    <span className="font-display-lg text-[22px] font-extrabold tracking-[0.15em] text-white">
                      V
                      <span className="relative inline-block px-[2px]">
                        I
                        <span className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-[6px] h-[6px] rounded-sm bg-[#00E5FF] shadow-[0_0_8px_#00E5FF]" />
                      </span>
                      ZO
                    </span>
                    <span className="text-[12px] font-bold tracking-widest uppercase ml-1 px-2 py-0.5 rounded bg-[#00E5FF]/10 text-[#00E5FF]">
                      TECH
                    </span>
                  </>
                )}
              </div>
              <p className="text-gray-400 text-sm max-w-sm mb-8 leading-relaxed">
                Leading the international standard for engineering excellence and luxury digital transformation. Redefining what's possible through code.
              </p>
              <div className="flex gap-4 text-gray-400">
                <span className="material-symbols-outlined p-2 rounded-full border border-white/10 cursor-pointer hover:bg-white/10 hover:text-white" title="Global Connectivity">public</span>
                <span className="material-symbols-outlined p-2 rounded-full border border-white/10 cursor-pointer hover:bg-white/10 hover:text-white" title="Distributed Node Hub">hub</span>
              </div>
            </div>
            
            <div className="flex flex-col gap-4">
              <h5 className="font-label-sm text-xs font-extrabold text-gray-300 uppercase tracking-widest">Navigation</h5>
              <Link to="/team" className="text-gray-400 hover:text-white text-sm transition-colors">Our Team</Link>
              <Link to="/projects" className="text-gray-400 hover:text-white text-sm transition-colors">Project Archive</Link>
              <Link to="/about" className="text-gray-400 hover:text-white text-sm transition-colors">Service Suite</Link>
            </div>
            
            <div className="flex flex-col gap-4">
              <h5 className="font-label-sm text-xs font-extrabold text-gray-300 uppercase tracking-widest">Legal</h5>
              <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">Privacy Policy</a>
              <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">Terms of Service</a>
              <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">Cookie Policy</a>
            </div>
          </div>
          <div className="max-w-container-max mx-auto px-margin-desktop py-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center text-gray-400 text-xs gap-4">
            <span>© 2024 VIZO TECH. Engineering Excellence.</span>
            <span>Based in Zurich • Serving the Globe</span>
          </div>
        </footer>
      )}
    </div>
  );
};

function App() {
  return (
    <ThemeProvider>
      <Router>
        <AppContent />
      </Router>
    </ThemeProvider>
  );
}

export default App;
