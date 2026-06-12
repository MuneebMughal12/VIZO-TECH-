import React, { useEffect } from 'react';
import { Link, useNavigate, useLocation, Outlet } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';

export const AdminLayout = () => {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const token = localStorage.getItem('vizo_admin_token');
    if (!token) {
      navigate('/admin/login');
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('vizo_admin_token');
    localStorage.removeItem('vizo_admin_username');
    navigate('/admin/login');
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  const menuItems = [
    { name: 'Dashboard', path: '/admin', icon: 'dashboard' },
    { name: 'Projects', path: '/admin/projects', icon: 'work' },
    { name: 'Team', path: '/admin/team', icon: 'group' },
    { name: 'Reviews', path: '/admin/reviews', icon: 'rate_review' },
    { name: 'Notifications', path: '/admin/notifications', icon: 'notifications' },
    { name: 'Settings', path: '/admin/settings', icon: 'settings' }
  ];

  return (
    <div className={`relative z-10 flex min-h-screen bg-background overflow-hidden ${
      theme === 'dark' ? 'text-white' : 'text-[#1a1c1c]'
    }`}>
      {/* SideNavBar Component */}
      <aside className="fixed left-0 top-0 h-screen w-64 bg-surface-container-low dark:bg-surface-container-lowest border-r border-black/10 dark:border-white/10 shadow-sm flex flex-col py-8 gap-4 z-50">
        <div className="px-6 mb-8">
          <div className="inline-flex items-center gap-2 select-none mb-3">
            <span className="font-display-lg text-[20px] font-extrabold tracking-[0.1em]">
              V
              <span className="relative inline-block px-[2px]">
                I
                <span className={`absolute -top-1.5 left-1/2 -translate-x-1/2 w-[5px] h-[5px] rounded-sm ${
                  theme === 'dark' ? 'bg-[#00E5FF] shadow-[0_0_8px_#00E5FF]' : 'bg-[#0052FF]'
                }`} />
              </span>
              ZO
            </span>
            <span className={`text-[9px] font-bold tracking-widest uppercase ml-1 px-1.5 py-0.5 rounded bg-[#00f0ff]/10 text-primary-fixed-dim`}>
              ADMIN
            </span>
          </div>
          <p className="font-label-sm text-[10px] text-on-surface-variant uppercase tracking-widest mt-1">Manage Agency</p>
        </div>

        <nav className="flex-1 space-y-1">
          {menuItems.map(item => (
            <Link
              key={item.name}
              to={item.path}
              className={`rounded-xl mx-2 flex items-center px-4 py-3 gap-3 transition-transform hover:translate-x-1 duration-200 ease-in-out ${
                isActive(item.path)
                  ? 'bg-secondary-container text-on-secondary-container shadow-lg'
                  : 'text-on-surface-variant hover:bg-white/5 hover:text-primary'
              }`}
            >
              <span className="material-symbols-outlined" style={{ fontVariationSettings: isActive(item.path) ? '"FILL" 1' : '"FILL" 0' }}>
                {item.icon}
              </span>
              <span className="font-label-sm text-xs font-semibold">{item.name}</span>
            </Link>
          ))}
        </nav>

        <div className="mt-auto border-t border-black/5 dark:border-white/10 pt-4 px-2 space-y-4">
          <button
            onClick={handleLogout}
            className="w-full text-red-500 hover:bg-red-500/10 rounded-xl flex items-center px-4 py-3 gap-3 transition-colors duration-200"
          >
            <span className="material-symbols-outlined">logout</span>
            <span className="font-label-sm text-xs font-semibold">Sign Out</span>
          </button>

          {/* Profile Anchor */}
          <div className="mx-4 mt-6 p-4 rounded-2xl glass-panel flex items-center gap-3">
            <div className="w-10 h-10 rounded-full overflow-hidden border border-outline-variant shrink-0 bg-white/10">
              <img 
                className="w-full h-full object-cover" 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCUaf4Wl9HDeMuB7v2k0g0E1rU3DtUkRywkvLbU5FpVVJJ3eYI2YF4qQodUKkvgNaEOChdArYoz5UuVVs1SlLALgAHuP1krAH9QMMreayhkElKmwLAsVL7b3q5ZlYWQd8jHWSNMH4AoSJHo9VWtW4gSCiFzRQlfSL77lmO9A1nT6ekPdyrHPD7eZmZwJADJpqLLWuJotz2jmcHJzIHd2a5YGll82eydgx6lQFJxpctHLQc6FiYA8E0Ip-nu7li8z4osfiBmjYGWpisJ" 
                alt="Alex Sterling" 
              />
            </div>
            <div className="overflow-hidden">
              <p className="font-label-sm text-xs font-bold truncate">{localStorage.getItem('vizo_admin_username') || 'Alex Sterling'}</p>
              <p className="text-[10px] text-on-surface-variant truncate uppercase tracking-tighter">Chief Architect</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Layout */}
      <main className="flex-grow ml-64 p-8 md:p-margin-desktop overflow-y-auto h-screen">
        <Outlet />
      </main>
    </div>
  );
};
