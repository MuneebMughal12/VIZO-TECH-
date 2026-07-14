import React, { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useLocation } from 'react-router-dom';
import API_URL from '../config/api';

export const Services = () => {
  const { theme } = useTheme();
  const location = useLocation();
  const [services, setServices] = useState([]);
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');

  // Filter Categories Mapper (maps tab slug to service name/slugs)
  const filterTabs = [
    { name: 'All', slug: 'all' },
    { name: 'Design', slug: 'design' },
    { name: 'AI', slug: 'ai' },
    { name: 'Development', slug: 'development' },
    { name: 'Digital Marketing', slug: 'digital-marketing' },
    { name: 'Video Editing', slug: 'video-editing' },
    { name: 'Shopify', slug: 'shopify' }
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch services
        const sRes = await fetch(`${API_URL}/api/services`);
        // Fetch active packages
        const pRes = await fetch(`${API_URL}/api/packages?isActive=true`);

        if (sRes.ok && pRes.ok) {
          const servicesData = await sRes.json();
          const packagesData = await pRes.json();

          // Only keep active services for the public page
          setServices(servicesData.filter(s => s.is_active));
          setPackages(packagesData);
        }
      } catch (err) {
        console.error('Error fetching services/packages:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tabParam = params.get('tab');
    if (tabParam) {
      setActiveTab(tabParam.toLowerCase());
    }
  }, [location]);

  // Filter logic: Filter services based on activeTab
  const filteredServices = services.filter(service => {
    if (activeTab === 'all') return true;
    return service.slug === activeTab;
  });

  return (
    <main className="relative pt-24 md:pt-36 pb-24 overflow-x-hidden min-h-screen">
      {/* Immersive Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-[15%] left-[-10%] w-[600px] h-[600px] bg-purple-500/5 blur-[130px] rounded-full animate-float" />
        <div className="absolute bottom-[10%] right-[-5%] w-[500px] h-[500px] bg-[#00f0ff]/5 blur-[120px] rounded-full animate-float" style={{ animationDelay: '-3s' }} />
      </div>

      <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop space-y-16">
        
        {/* Header Block */}
        <div className="text-center max-w-3xl mx-auto space-y-6">
          <span className={`font-label-sm text-xs sm:text-sm uppercase tracking-[0.25em] font-semibold block ${
            theme === 'dark' ? 'text-[#00f0ff]' : 'text-[#0052FF]'
          }`}>
            Our Solutions
          </span>
          <h1 className="font-display-xl text-4xl sm:text-5xl font-extrabold tracking-tight">
            Services & Packages
          </h1>
          <p className="text-on-surface-variant text-sm sm:text-base leading-relaxed">
            Choose from our luxury digital transformation packages. Transparent pricing, expert engineering, and elite crafting tailored for global industry leaders.
          </p>
        </div>

        {/* Dynamic Filter Navigation Tabs */}
        <div className="flex justify-center">
          <div className="flex items-center gap-1.5 p-1.5 rounded-full overflow-x-auto max-w-full no-scrollbar glass-panel shadow-2xl border border-white/5">
            {filterTabs.map((tab) => {
              const isActive = activeTab === tab.slug;
              return (
                <button
                  key={tab.slug}
                  onClick={() => setActiveTab(tab.slug)}
                  className={`px-5 py-2.5 rounded-full text-xs font-bold transition-all duration-300 whitespace-nowrap active:scale-95 ${
                    isActive
                      ? theme === 'dark'
                        ? 'bg-[#00f0ff] text-black shadow-[0_0_15px_rgba(0,240,255,0.4)]'
                        : 'bg-[#0052FF] text-white shadow-[0_0_15px_rgba(0,82,255,0.4)]'
                      : 'text-on-surface-variant hover:text-white hover:bg-white/5'
                  }`}
                >
                  {tab.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* Loading Spinner */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 space-y-4">
            <div className="w-12 h-12 rounded-full border-4 border-t-cyan-400 border-white/10 animate-spin" />
            <p className="text-on-surface-variant text-sm font-semibold tracking-wider">Syncing Catalogs...</p>
          </div>
        ) : filteredServices.length === 0 ? (
          <div className="text-center py-24 glass-card rounded-3xl p-8 max-w-md mx-auto">
            <span className="material-symbols-outlined text-4xl text-gray-500 mb-3">inventory_2</span>
            <h3 className="font-bold text-lg">No services found</h3>
            <p className="text-on-surface-variant text-xs mt-2">There are currently no active services listed under this category.</p>
          </div>
        ) : (
          /* Services Catalog List */
          <div className="space-y-24">
            {filteredServices.map((service) => {
              // Filter packages matching this service
              const servicePkgs = packages
                .filter(pkg => pkg.serviceId === service._id)
                .sort((a, b) => a.displayOrder - b.displayOrder);

              if (servicePkgs.length === 0) return null;

              return (
                <section key={service._id} className="space-y-8 animate-fade-in">
                  
                  {/* Service Section Header */}
                  <div className="flex items-center gap-4 border-b border-white/5 pb-4">
                    <span className="text-4xl filter drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]">
                      {service.emoji}
                    </span>
                    <div>
                      <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">{service.name}</h2>
                      <p className="text-on-surface-variant text-xs sm:text-sm mt-1">{service.description}</p>
                    </div>
                  </div>

                  {/* Packages Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                    {servicePkgs.map((pkg) => {
                      const finalPrice = pkg.discountActive 
                        ? pkg.price - (pkg.price * pkg.discountPercent / 100)
                        : pkg.price;

                      // Pre-fill WhatsApp message:
                      const waText = `Hi! I'm interested in the ${pkg.name} package. Can we discuss?`;
                      const waLink = `https://wa.me/15819062494?text=${encodeURIComponent(waText)}`;

                      return (
                        <div
                          key={pkg._id}
                          className={`glass-card rounded-3xl p-8 flex flex-col justify-between hover:-translate-y-2 duration-500 shadow-2xl relative overflow-hidden group ${
                            pkg.isPinned ? 'glow-border' : ''
                          }`}
                        >
                          {/* Featured Ribbon Badge */}
                          {pkg.isPinned && (
                            <span className="absolute top-0 right-0 bg-gradient-to-l from-purple-600 to-indigo-600 text-white text-[9px] font-extrabold uppercase px-4 py-1.5 rounded-bl-2xl tracking-widest">
                              Featured
                            </span>
                          )}

                          <div className="space-y-6">
                            {/* Header details */}
                            <div>
                              <h3 className="text-xl font-bold tracking-tight mb-2 pr-12">{pkg.name}</h3>
                              
                              {/* Price Display */}
                              <div className="flex items-baseline mt-4 mb-2">
                                <span className={`text-4xl font-black tracking-tight ${
                                  theme === 'dark' ? 'text-white' : 'text-[#1a1c1c]'
                                }`}>
                                  ${finalPrice}
                                </span>
                                {pkg.priceSuffix && (
                                  <span className="text-sm text-on-surface-variant font-medium ml-1">
                                    {pkg.priceSuffix}
                                  </span>
                                )}

                                {/* Discount indicators */}
                                {pkg.discountActive && (
                                  <div className="ml-3 flex flex-col">
                                    <span className="text-xs text-on-surface-variant line-through font-semibold">
                                      ${pkg.price}
                                    </span>
                                    <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-1.5 py-0.5 rounded font-extrabold uppercase tracking-wide mt-0.5">
                                      {pkg.discountLabel || `${pkg.discountPercent}% OFF`}
                                    </span>
                                  </div>
                                )}
                              </div>
                              
                              {pkg.offerLine && (
                                <p className="text-xs text-cyan-400 font-semibold italic mt-1 leading-relaxed">
                                  "{pkg.offerLine}"
                                </p>
                              )}

                              <p className="text-xs sm:text-sm text-on-surface-variant mt-3 leading-relaxed">
                                {pkg.description}
                              </p>
                            </div>

                            {/* Features list */}
                            <div className="space-y-3 pt-4 border-t border-white/5">
                              <h4 className="text-[10px] font-extrabold uppercase tracking-wider text-on-surface-variant">Inclusions</h4>
                              <ul className="space-y-2.5">
                                {pkg.features
                                  .sort((a, b) => a.order - b.order)
                                  .map((feat) => (
                                    <li key={feat._id} className="flex items-start gap-2.5 text-xs sm:text-sm leading-relaxed">
                                      {feat.isIncluded ? (
                                        <span className="material-symbols-outlined text-emerald-400 text-lg shrink-0 select-none">check_circle</span>
                                      ) : (
                                        <span className="material-symbols-outlined text-red-500 text-lg shrink-0 select-none">cancel</span>
                                      )}
                                      <span className={feat.isIncluded ? '' : 'text-on-surface-variant/60'}>
                                        {feat.text}
                                      </span>
                                    </li>
                                  ))}
                              </ul>
                            </div>
                          </div>

                          {/* Footer details (Suitable For & CTA) */}
                          <div className="space-y-6 mt-8">
                            
                            {/* Suitable For tags */}
                            {pkg.suitableFor && pkg.suitableFor.length > 0 && (
                              <div className="flex flex-wrap gap-1.5 items-center">
                                <span className="text-[10px] uppercase font-bold text-on-surface-variant tracking-wider mr-1">Best For:</span>
                                {pkg.suitableFor
                                  .sort((a, b) => a.order - b.order)
                                  .map((tag) => (
                                    <span
                                      key={tag._id}
                                      className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold border bg-white/5 border-white/5 text-on-surface-variant"
                                    >
                                      {tag.text}
                                    </span>
                                  ))}
                              </div>
                            )}

                            {/* CTA Link to Whatsapp */}
                            <a
                              href={waLink}
                              target="_blank"
                              rel="noreferrer"
                              className={`w-full py-3.5 rounded-xl font-bold text-sm tracking-wide transition-all duration-300 flex items-center justify-center gap-2 active:scale-[0.98] ${
                                theme === 'dark'
                                  ? 'bg-[#00f0ff] hover:bg-[#00dbe9] text-black shadow-lg shadow-[#00f0ff]/10 hover:shadow-[#00f0ff]/20'
                                  : 'bg-[#0052FF] hover:bg-[#003bbb] text-white shadow-lg shadow-[#0052FF]/10'
                              }`}
                            >
                              <span className="material-symbols-outlined text-[18px]">chat</span>
                              Get Started
                            </a>
                          </div>

                        </div>
                      );
                    })}
                  </div>
                </section>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
};
