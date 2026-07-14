import React, { useState, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';
import API_URL from '../../config/api';

export const AdminServices = () => {
  const { theme } = useTheme();
  const [services, setServices] = useState([]);
  const [selectedService, setSelectedService] = useState(null);
  const [packages, setPackages] = useState([]);
  const [loadingServices, setLoadingServices] = useState(true);
  const [loadingPackages, setLoadingPackages] = useState(false);

  // Service Form States
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [serviceEditId, setServiceEditId] = useState(null);
  const [serviceName, setServiceName] = useState('');
  const [serviceEmoji, setServiceEmoji] = useState('');
  const [serviceDesc, setServiceDesc] = useState('');
  const [serviceActive, setServiceActive] = useState(true);

  // Package Form States
  const [showPackageModal, setShowPackageModal] = useState(false);
  const [packageEditId, setPackageEditId] = useState(null);
  const [pkgName, setPkgName] = useState('');
  const [pkgPrice, setPkgPrice] = useState(0);
  const [pkgPriceType, setPkgPriceType] = useState('one_time');
  const [pkgPriceSuffix, setPkgPriceSuffix] = useState('');
  const [pkgDesc, setPkgDesc] = useState('');
  const [pkgOfferLine, setPkgOfferLine] = useState('');
  const [pkgDisplayOrder, setPkgDisplayOrder] = useState(0);
  const [pkgActive, setPkgActive] = useState(true);
  const [pkgPinned, setPkgPinned] = useState(false);
  const [pkgPinOrder, setPkgPinOrder] = useState(0);
  const [pkgDiscountPercent, setPkgDiscountPercent] = useState(0);
  const [pkgDiscountLabel, setPkgDiscountLabel] = useState('');
  const [pkgDiscountActive, setPkgDiscountActive] = useState(false);
  
  // Nested Arrays Form States
  const [pkgFeatures, setPkgFeatures] = useState([]); // Array of { text, isIncluded, order }
  const [pkgSuitableFor, setPkgSuitableFor] = useState([]); // Array of { text, order }

  // Nested arrays inputs temp states
  const [newFeatureText, setNewFeatureText] = useState('');
  const [newFeatureIncluded, setNewFeatureIncluded] = useState(true);
  const [newSuitableText, setNewSuitableText] = useState('');

  const token = localStorage.getItem('vizo_admin_token');

  // Fetch Services
  const fetchServices = async () => {
    try {
      const res = await fetch(`${API_URL}/api/services`);
      if (res.ok) {
        const data = await res.json();
        setServices(data);
        if (data.length > 0 && !selectedService) {
          setSelectedService(data[0]);
        } else if (selectedService) {
          // Sync updated service data
          const updated = data.find(s => s._id === selectedService._id);
          if (updated) setSelectedService(updated);
        }
      }
    } catch (err) {
      console.error('Error fetching services:', err);
    } finally {
      setLoadingServices(false);
    }
  };

  // Fetch Packages for Selected Service
  const fetchPackages = async (serviceId) => {
    if (!serviceId) return;
    setLoadingPackages(true);
    try {
      const res = await fetch(`${API_URL}/api/packages?serviceId=${serviceId}`);
      if (res.ok) {
        const data = await res.json();
        setPackages(data);
      }
    } catch (err) {
      console.error('Error fetching packages:', err);
    } finally {
      setLoadingPackages(false);
    }
  };

  // Trigger package fetch when selected service changes
  useEffect(() => {
    fetchServices();
  }, []);

  useEffect(() => {
    if (selectedService) {
      fetchPackages(selectedService._id);
    } else {
      setPackages([]);
    }
  }, [selectedService]);

  // Service CRUD handlers
  const handleOpenAddService = () => {
    setServiceEditId(null);
    setServiceName('');
    setServiceEmoji('');
    setServiceDesc('');
    setServiceActive(true);
    setShowServiceModal(true);
  };

  const handleOpenEditService = (service) => {
    setServiceEditId(service._id);
    setServiceName(service.name);
    setServiceEmoji(service.emoji);
    setServiceDesc(service.description);
    setServiceActive(service.is_active);
    setShowServiceModal(true);
  };

  const handleServiceSubmit = async (e) => {
    e.preventDefault();
    if (!serviceName || !serviceEmoji || !serviceDesc) {
      alert('Please fill out all required fields.');
      return;
    }

    const payload = {
      name: serviceName,
      emoji: serviceEmoji,
      description: serviceDesc,
      is_active: serviceActive
    };

    try {
      const url = serviceEditId 
        ? `${API_URL}/api/services/${serviceEditId}`
        : `${API_URL}/api/services`;
      const method = serviceEditId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const data = await res.json();
        setShowServiceModal(false);
        await fetchServices();
        if (!serviceEditId) {
          // If newly created, select it
          setSelectedService(data);
        }
      } else {
        const errData = await res.json();
        alert(errData.msg || 'Failed to save service.');
      }
    } catch (err) {
      console.error('Error saving service:', err);
    }
  };

  const handleDeleteService = async (service) => {
    if (!window.confirm(`Are you sure you want to delete "${service.name}"? This will CASCADE DELETE all packages under this service!`)) {
      return;
    }

    try {
      const res = await fetch(`${API_URL}/api/services/${service._id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (res.ok) {
        if (selectedService && selectedService._id === service._id) {
          setSelectedService(null);
        }
        await fetchServices();
      } else {
        alert('Failed to delete service.');
      }
    } catch (err) {
      console.error('Error deleting service:', err);
    }
  };

  const handleServiceReorder = async (direction, index) => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === services.length - 1) return;

    const newServices = [...services];
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    
    // Swap
    const temp = newServices[index];
    newServices[index] = newServices[targetIdx];
    newServices[targetIdx] = temp;

    const serviceIds = newServices.map(s => s._id);

    try {
      // Optimistic state update
      setServices(newServices);

      const res = await fetch(`${API_URL}/api/services/reorder`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ serviceIds })
      });

      if (!res.ok) {
        // Rollback
        await fetchServices();
      }
    } catch (err) {
      console.error('Error reordering services:', err);
      await fetchServices();
    }
  };

  const handleToggleServiceActive = async (service) => {
    try {
      const res = await fetch(`${API_URL}/api/services/${service._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ is_active: !service.is_active })
      });
      if (res.ok) {
        await fetchServices();
      }
    } catch (err) {
      console.error('Error toggling active status:', err);
    }
  };

  // Package CRUD handlers
  const handleOpenAddPackage = () => {
    if (!selectedService) {
      alert('Please select a service first.');
      return;
    }
    setPackageEditId(null);
    setPkgName('');
    setPkgPrice(0);
    setPkgPriceType('one_time');
    setPkgPriceSuffix('');
    setPkgDesc('');
    setPkgOfferLine('');
    setPkgDisplayOrder(packages.length + 1);
    setPkgActive(true);
    setPkgPinned(false);
    setPkgPinOrder(0);
    setPkgDiscountPercent(0);
    setPkgDiscountLabel('');
    setPkgDiscountActive(false);
    setPkgFeatures([]);
    setPkgSuitableFor([]);
    setShowPackageModal(true);
  };

  const handleOpenEditPackage = (pkg) => {
    setPackageEditId(pkg._id);
    setPkgName(pkg.name);
    setPkgPrice(pkg.price);
    setPkgPriceType(pkg.priceType);
    setPkgPriceSuffix(pkg.priceSuffix || '');
    setPkgDesc(pkg.description);
    setPkgOfferLine(pkg.offerLine || '');
    setPkgDisplayOrder(pkg.displayOrder || 0);
    setPkgActive(pkg.isActive);
    setPkgPinned(pkg.isPinned || false);
    setPkgPinOrder(pkg.pinOrder || 0);
    setPkgDiscountPercent(pkg.discountPercent || 0);
    setPkgDiscountLabel(pkg.discountLabel || '');
    setPkgDiscountActive(pkg.discountActive || false);
    // Sort features and suitableFor by order field
    setPkgFeatures([...pkg.features].sort((a, b) => a.order - b.order));
    setPkgSuitableFor([...pkg.suitableFor].sort((a, b) => a.order - b.order));
    setShowPackageModal(true);
  };

  const handlePackageSubmit = async (e) => {
    e.preventDefault();
    if (!pkgName || pkgPrice === undefined || !pkgPriceType || !pkgDesc) {
      alert('Please fill out all required fields.');
      return;
    }

    const payload = {
      serviceId: selectedService._id,
      name: pkgName,
      price: Number(pkgPrice),
      priceType: pkgPriceType,
      priceSuffix: pkgPriceSuffix,
      description: pkgDesc,
      offerLine: pkgOfferLine,
      displayOrder: Number(pkgDisplayOrder),
      isActive: pkgActive,
      isPinned: pkgPinned,
      pinOrder: Number(pkgPinOrder),
      discountPercent: Number(pkgDiscountPercent),
      discountLabel: pkgDiscountLabel,
      discountActive: pkgDiscountActive,
      features: pkgFeatures,
      suitableFor: pkgSuitableFor
    };

    try {
      const url = packageEditId 
        ? `${API_URL}/api/packages/${packageEditId}`
        : `${API_URL}/api/packages`;
      const method = packageEditId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        setShowPackageModal(false);
        fetchPackages(selectedService._id);
        fetchServices(); // update package counts
      } else {
        const errData = await res.json();
        alert(errData.msg || 'Failed to save package.');
      }
    } catch (err) {
      console.error('Error saving package:', err);
    }
  };

  const handleDeletePackage = async (pkg) => {
    if (!window.confirm(`Are you sure you want to delete "${pkg.name}"?`)) {
      return;
    }

    try {
      const res = await fetch(`${API_URL}/api/packages/${pkg._id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (res.ok) {
        fetchPackages(selectedService._id);
        fetchServices();
      } else {
        alert('Failed to delete package.');
      }
    } catch (err) {
      console.error('Error deleting package:', err);
    }
  };

  const handleDuplicatePackage = async (pkg) => {
    try {
      const res = await fetch(`${API_URL}/api/packages/${pkg._id}/duplicate`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (res.ok) {
        fetchPackages(selectedService._id);
        fetchServices();
      } else {
        alert('Failed to duplicate package.');
      }
    } catch (err) {
      console.error('Error duplicating package:', err);
    }
  };

  const handleTogglePackageActive = async (pkg) => {
    try {
      const res = await fetch(`${API_URL}/api/packages/${pkg._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ isActive: !pkg.isActive })
      });
      if (res.ok) {
        fetchPackages(selectedService._id);
      }
    } catch (err) {
      console.error('Error toggling package status:', err);
    }
  };

  const handleTogglePackagePinned = async (pkg) => {
    const updatedPinned = !pkg.isPinned;
    if (updatedPinned) {
      try {
        const res = await fetch(`${API_URL}/api/packages?isPinned=true`);
        if (res.ok) {
          const pinnedList = await res.json();
          if (pinnedList.length >= 6) {
            if (!window.confirm("Warning: More than 6 packages are currently pinned to the Home page! Only the top 6 will display. Do you want to proceed?")) {
              return;
            }
          }
        }
      } catch (e) {
        console.error('Error checking pinned count:', e);
      }
    }

    try {
      const res = await fetch(`${API_URL}/api/packages/${pkg._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ isPinned: updatedPinned })
      });
      if (res.ok) {
        fetchPackages(selectedService._id);
      }
    } catch (err) {
      console.error('Error toggling package pin status:', err);
    }
  };

  // Helper nested array updates
  const addFeature = () => {
    if (!newFeatureText.trim()) return;
    const newFeature = {
      text: newFeatureText.trim(),
      isIncluded: newFeatureIncluded,
      order: pkgFeatures.length + 1
    };
    setPkgFeatures(prev => [...prev, newFeature]);
    setNewFeatureText('');
    setNewFeatureIncluded(true);
  };

  const removeFeature = (idx) => {
    setPkgFeatures(prev => prev.filter((_, i) => i !== idx));
  };

  const toggleFeatureInclusion = (idx) => {
    setPkgFeatures(prev => prev.map((f, i) => i === idx ? { ...f, isIncluded: !f.isIncluded } : f));
  };

  const addSuitableFor = () => {
    if (!newSuitableText.trim()) return;
    const newTag = {
      text: newSuitableText.trim(),
      order: pkgSuitableFor.length + 1
    };
    setPkgSuitableFor(prev => [...prev, newTag]);
    setNewSuitableText('');
  };

  const removeSuitableFor = (idx) => {
    setPkgSuitableFor(prev => prev.filter((_, i) => i !== idx));
  };

  // Warning check: count pinned packages
  const getPinnedCount = () => {
    return packages.filter(p => p.isPinned).length;
  };

  const isMoreThan6Pinned = pkgPinned && (getPinnedCount() >= 6 || (packageEditId && getPinnedCount() > 6));

  // Preview calculations
  const discountedPrice = pkgPrice - (pkgPrice * pkgDiscountPercent / 100);

  return (
    <div className="space-y-8 pb-12">
      {/* Page Header */}
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="font-display-lg text-3xl md:text-display-lg font-bold">Services & Packages</h2>
          <p className="text-on-surface-variant text-sm mt-1">Configure your product suite catalog, pricing, and discount promotions.</p>
        </div>
        <button
          onClick={handleOpenAddService}
          className="px-6 py-2.5 rounded-full font-bold primary-gradient-btn text-black flex items-center gap-2 active:scale-95 duration-200"
        >
          <span className="material-symbols-outlined text-[18px]">add_circle</span>
          Add Service
        </button>
      </header>

      {/* Main Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        
        {/* Left Column: Services list (1/3 width) */}
        <div className="xl:col-span-1 space-y-6">
          <div className="glass-panel p-6 rounded-3xl glow-border">
            <h3 className="text-xl font-bold mb-4 flex items-center justify-between">
              <span>Services</span>
              <span className="text-xs bg-white/10 px-2 py-0.5 rounded-full text-gray-400">{services.length} Total</span>
            </h3>

            {loadingServices ? (
              <div className="text-center py-12 text-on-surface-variant">Loading services...</div>
            ) : services.length === 0 ? (
              <div className="text-center py-12 text-on-surface-variant">No services registered. Create one to begin.</div>
            ) : (
              <div className="space-y-3">
                {services.map((service, idx) => (
                  <div
                    key={service._id}
                    onClick={() => setSelectedService(service)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer flex justify-between items-center group ${
                      selectedService && selectedService._id === service._id
                        ? 'bg-white/5 border-cyan-500/30'
                        : 'bg-transparent border-white/5 hover:bg-white/5'
                    }`}
                  >
                    <div className="flex items-center gap-3 overflow-hidden">
                      <span className="text-2xl">{service.emoji}</span>
                      <div className="overflow-hidden">
                        <p className="font-bold text-sm truncate">{service.name}</p>
                        <p className="text-xs text-on-surface-variant mt-0.5">{service.packageCount} Package(s)</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 opacity-60 group-hover:opacity-100 transition-opacity" onClick={e => e.stopPropagation()}>
                      {/* Active Status */}
                      <button
                        onClick={() => handleToggleServiceActive(service)}
                        className={`material-symbols-outlined text-[18px] p-1.5 rounded-lg hover:bg-white/10 ${
                          service.is_active ? 'text-emerald-400' : 'text-gray-500'
                        }`}
                        title={service.is_active ? 'Active' : 'Inactive'}
                      >
                        {service.is_active ? 'visibility' : 'visibility_off'}
                      </button>

                      {/* Reordering */}
                      <button
                        onClick={() => handleServiceReorder('up', idx)}
                        disabled={idx === 0}
                        className="material-symbols-outlined text-[18px] p-1.5 rounded-lg hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-transparent"
                      >
                        arrow_upward
                      </button>
                      <button
                        onClick={() => handleServiceReorder('down', idx)}
                        disabled={idx === services.length - 1}
                        className="material-symbols-outlined text-[18px] p-1.5 rounded-lg hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-transparent"
                      >
                        arrow_downward
                      </button>

                      {/* Edit */}
                      <button
                        onClick={() => handleOpenEditService(service)}
                        className="material-symbols-outlined text-[18px] p-1.5 rounded-lg text-cyan-400 hover:bg-white/10"
                      >
                        edit
                      </button>

                      {/* Delete */}
                      <button
                        onClick={() => handleDeleteService(service)}
                        className="material-symbols-outlined text-[18px] p-1.5 rounded-lg text-red-400 hover:bg-white/10"
                      >
                        delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Selected Service Packages (2/3 width) */}
        <div className="xl:col-span-2 space-y-6">
          <div className="glass-panel p-6 rounded-3xl glow-border">
            {selectedService ? (
              <>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 pb-4 border-b border-white/5">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{selectedService.emoji}</span>
                    <div>
                      <h3 className="text-xl font-bold">{selectedService.name}</h3>
                      <p className="text-xs text-on-surface-variant">{selectedService.description}</p>
                    </div>
                  </div>
                  <button
                    onClick={handleOpenAddPackage}
                    className="px-5 py-2 bg-white/10 hover:bg-white/15 text-white border border-white/10 rounded-full font-bold text-xs flex items-center gap-2 transition-colors"
                  >
                    <span className="material-symbols-outlined text-[14px]">add</span>
                    New Package
                  </button>
                </div>

                {loadingPackages ? (
                  <div className="text-center py-16 text-on-surface-variant">Loading packages...</div>
                ) : packages.length === 0 ? (
                  <div className="text-center py-16 text-on-surface-variant">No packages found for this service. Click "New Package" to create one.</div>
                ) : (
                  <div className="space-y-4">
                    {packages.map((pkg) => (
                      <div
                        key={pkg._id}
                        className={`p-5 rounded-2xl bg-white/5 border border-white/5 hover:border-cyan-500/20 transition-all flex flex-col md:flex-row justify-between gap-6 relative overflow-hidden`}
                      >
                        {/* Highlights (Pinned & Discount) */}
                        <div className="absolute top-0 right-0 flex gap-1">
                          {pkg.isPinned && (
                            <span className="bg-purple-500/20 text-purple-300 border-l border-b border-purple-500/30 px-3 py-1 text-[9px] font-bold uppercase tracking-wider rounded-bl-xl">
                              Featured (Pin #{pkg.pinOrder})
                            </span>
                          )}
                          {pkg.discountActive && (
                            <span className="bg-emerald-500/20 text-emerald-300 border-l border-b border-emerald-500/30 px-3 py-1 text-[9px] font-bold uppercase tracking-wider rounded-bl-xl">
                              {pkg.discountLabel || `${pkg.discountPercent}% OFF`}
                            </span>
                          )}
                        </div>

                        {/* Package Info */}
                        <div className="flex-1 space-y-3">
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-bold text-lg">{pkg.name}</h4>
                              <span className={`text-[10px] px-2 py-0.5 rounded uppercase font-semibold ${
                                pkg.isActive ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'
                              }`}>
                                {pkg.isActive ? 'Active' : 'Inactive'}
                              </span>
                            </div>
                            <p className="text-xs text-on-surface-variant mt-1 leading-relaxed">{pkg.description}</p>
                          </div>

                          <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
                            {/* Pricing info */}
                            <div>
                              <span className="text-xs text-on-surface-variant block">Price</span>
                              <span className="text-lg font-extrabold text-cyan-400">
                                ${pkg.price}
                                {pkg.priceSuffix && <span className="text-xs font-normal text-on-surface-variant ml-0.5">{pkg.priceSuffix}</span>}
                              </span>
                              {pkg.discountActive && (
                                <span className="text-xs text-emerald-400 ml-2">
                                  → ${pkg.price - (pkg.price * pkg.discountPercent / 100)} ({pkg.discountPercent}% OFF)
                                </span>
                              )}
                            </div>
                            {/* Features list snapshot */}
                            <div>
                              <span className="text-xs text-on-surface-variant block">Features</span>
                              <span className="text-xs font-semibold">{pkg.features?.length || 0} configured</span>
                            </div>
                            {/* Suitable tags */}
                            <div>
                              <span className="text-xs text-on-surface-variant block">Suitable For</span>
                              <span className="text-xs font-semibold">{pkg.suitableFor?.length || 0} tag(s)</span>
                            </div>
                          </div>
                        </div>

                        {/* Action buttons */}
                        <div className="flex md:flex-col justify-end items-end gap-2 shrink-0 self-end md:self-center">
                          <div className="flex flex-row md:flex-col gap-2">
                            <button
                              onClick={() => handleTogglePackageActive(pkg)}
                              className={`px-3 py-1.5 rounded-lg border text-xs font-bold w-24 transition-colors ${
                                pkg.isActive
                                  ? 'bg-transparent border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10'
                                  : 'bg-transparent border-red-500/30 text-red-400 hover:bg-red-500/10'
                              }`}
                            >
                              {pkg.isActive ? 'Active' : 'Inactive'}
                            </button>

                            <button
                              onClick={() => handleTogglePackagePinned(pkg)}
                              className={`px-3 py-1.5 rounded-lg border text-xs font-bold w-24 flex items-center justify-center gap-1 transition-colors ${
                                pkg.isPinned
                                  ? 'bg-transparent border-purple-500/30 text-purple-400 hover:bg-purple-500/10'
                                  : 'bg-transparent border-gray-500/30 text-gray-400 hover:bg-gray-500/10'
                              }`}
                            >
                              <span className="material-symbols-outlined text-[14px]">
                                {pkg.isPinned ? 'push_pin' : 'push_pin'}
                              </span>
                              {pkg.isPinned ? 'Pinned' : 'Pin'}
                            </button>
                          </div>
                          
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleDuplicatePackage(pkg)}
                              className="p-2 rounded-lg bg-white/5 border border-white/5 hover:border-cyan-500/20 text-cyan-400 text-xs flex items-center gap-1 transition-all"
                              title="Duplicate Package"
                            >
                              <span className="material-symbols-outlined text-[16px]">content_copy</span>
                              Copy
                            </button>
                            <button
                              onClick={() => handleOpenEditPackage(pkg)}
                              className="p-2 rounded-lg bg-white/5 border border-white/5 hover:border-cyan-500/20 text-white text-xs flex items-center gap-1 transition-all"
                              title="Edit Package"
                            >
                              <span className="material-symbols-outlined text-[16px]">edit</span>
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeletePackage(pkg)}
                              className="p-2 rounded-lg bg-white/5 border border-white/5 hover:border-red-500/20 text-red-400 text-xs flex items-center gap-1 transition-all"
                              title="Delete Package"
                            >
                              <span className="material-symbols-outlined text-[16px]">delete</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-16 text-on-surface-variant">Select a Service from the left to view and configure its packages.</div>
            )}
          </div>
        </div>

      </div>

      {/* Service Add/Edit Modal */}
      {showServiceModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-panel p-8 rounded-3xl w-full max-w-lg glow-border animate-fade-in relative">
            <button
              onClick={() => setShowServiceModal(false)}
              className="absolute top-4 right-4 text-on-surface-variant hover:text-white material-symbols-outlined"
            >
              close
            </button>
            <h3 className="text-2xl font-bold mb-6">{serviceEditId ? 'Edit Service' : 'Add New Service'}</h3>
            
            <form onSubmit={handleServiceSubmit} className="space-y-6">
              <div>
                <label className="text-xs text-on-surface-variant font-bold uppercase tracking-wider block mb-2">Service Name</label>
                <input
                  type="text"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-cyan-500"
                  placeholder="e.g. Design Services"
                  value={serviceName}
                  onChange={e => setServiceName(e.target.value)}
                  required
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-1">
                  <label className="text-xs text-on-surface-variant font-bold uppercase tracking-wider block mb-2">Emoji</label>
                  <input
                    type="text"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-cyan-500 text-center"
                    placeholder="🎨"
                    value={serviceEmoji}
                    onChange={e => setServiceEmoji(e.target.value)}
                    required
                  />
                </div>
                <div className="col-span-2 flex items-end">
                  <div className="flex items-center gap-3 py-3">
                    <input
                      type="checkbox"
                      id="serviceActive"
                      className="w-4 h-4 rounded border-gray-300 text-cyan-500 focus:ring-cyan-500"
                      checked={serviceActive}
                      onChange={e => setServiceActive(e.target.checked)}
                    />
                    <label htmlFor="serviceActive" className="text-sm font-semibold select-none cursor-pointer">Active Catalog</label>
                  </div>
                </div>
              </div>

              <div>
                <label className="text-xs text-on-surface-variant font-bold uppercase tracking-wider block mb-2">Description</label>
                <textarea
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-cyan-500 h-28 resize-none"
                  placeholder="Brief overview of the service line..."
                  value={serviceDesc}
                  onChange={e => setServiceDesc(e.target.value)}
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full py-4 rounded-xl font-bold primary-gradient-btn text-black shadow-lg hover:scale-[1.01] transition-transform active:scale-95 duration-200"
              >
                {serviceEditId ? 'Save Changes' : 'Create Service'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Package Add/Edit Modal */}
      {showPackageModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="glass-panel p-8 rounded-3xl w-full max-w-3xl glow-border my-8 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowPackageModal(false)}
              className="absolute top-6 right-6 text-on-surface-variant hover:text-white material-symbols-outlined"
            >
              close
            </button>
            <h3 className="text-2xl font-bold mb-6">{packageEditId ? 'Edit Package' : 'Add New Package'}</h3>

            <form onSubmit={handlePackageSubmit} className="space-y-8">
              
              {/* Basic Fields Section */}
              <div className="space-y-4">
                <h4 className="text-sm font-extrabold uppercase tracking-widest text-cyan-400 border-b border-white/5 pb-2">Basic Info</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-on-surface-variant font-bold uppercase block mb-1">Package Name</label>
                    <input
                      type="text"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-cyan-500"
                      placeholder="e.g. Basic Logo Design"
                      value={pkgName}
                      onChange={e => setPkgName(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label className="text-xs text-on-surface-variant font-bold uppercase block mb-1">Offer Tagline Line</label>
                    <input
                      type="text"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-cyan-500"
                      placeholder="e.g. Professional logo design, starting at..."
                      value={pkgOfferLine}
                      onChange={e => setPkgOfferLine(e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-xs text-on-surface-variant font-bold uppercase block mb-1">Price ($)</label>
                    <input
                      type="number"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-cyan-500"
                      value={pkgPrice}
                      onChange={e => setPkgPrice(Number(e.target.value))}
                      required
                    />
                  </div>
                  <div>
                    <label className="text-xs text-on-surface-variant font-bold uppercase block mb-1">Billing Type</label>
                    <select
                      className="w-full bg-[#131313] border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-cyan-500 text-white"
                      value={pkgPriceType}
                      onChange={e => {
                        setPkgPriceType(e.target.value);
                        if (e.target.value === 'monthly') setPkgPriceSuffix('/mo');
                        else setPkgPriceSuffix('');
                      }}
                    >
                      <option value="one_time">One-Time</option>
                      <option value="monthly">Monthly</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-on-surface-variant font-bold uppercase block mb-1">Price Suffix</label>
                    <input
                      type="text"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-cyan-500"
                      placeholder="e.g. +, /mo, /year"
                      value={pkgPriceSuffix}
                      onChange={e => setPkgPriceSuffix(e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-xs text-on-surface-variant font-bold uppercase block mb-1">Display Order</label>
                    <input
                      type="number"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-cyan-500"
                      value={pkgDisplayOrder}
                      onChange={e => setPkgDisplayOrder(Number(e.target.value))}
                    />
                  </div>
                  <div className="flex items-end pb-3">
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        id="pkgActive"
                        className="w-4 h-4 rounded border-gray-300 text-cyan-500 focus:ring-cyan-500"
                        checked={pkgActive}
                        onChange={e => setPkgActive(e.target.checked)}
                      />
                      <label htmlFor="pkgActive" className="text-sm font-semibold select-none cursor-pointer">Active Package</label>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-xs text-on-surface-variant font-bold uppercase block mb-1">Short Description</label>
                  <textarea
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-cyan-500 h-20 resize-none"
                    placeholder="Brief description of the package inclusions..."
                    value={pkgDesc}
                    onChange={e => setPkgDesc(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Pin to Home page and Discount Setup Section */}
              <div className="space-y-4">
                <h4 className="text-sm font-extrabold uppercase tracking-widest text-cyan-400 border-b border-white/5 pb-2">Home Page Pin & Promotional discounts</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Pin Setup */}
                  <div className="glass-panel p-4 rounded-2xl space-y-4">
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        id="pkgPinned"
                        className="w-4 h-4 rounded border-gray-300 text-cyan-500 focus:ring-cyan-500"
                        checked={pkgPinned}
                        onChange={e => setPkgPinned(e.target.checked)}
                      />
                      <label htmlFor="pkgPinned" className="text-sm font-bold select-none cursor-pointer">Pin to Homepage</label>
                    </div>

                    {pkgPinned && (
                      <div>
                        <label className="text-xs text-on-surface-variant font-bold uppercase block mb-1">Pin Order</label>
                        <input
                          type="number"
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-cyan-500"
                          value={pkgPinOrder}
                          onChange={e => setPkgPinOrder(Number(e.target.value))}
                        />
                      </div>
                    )}

                    {/* Warning toast banner if user pins more than 6 */}
                    {isMoreThan6Pinned && (
                      <div className="p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-xl text-yellow-300 text-xs flex gap-2">
                        <span className="material-symbols-outlined text-[16px] shrink-0">warning</span>
                        <p>More than 6 packages are currently pinned to the Home page! Only the top 6 will display in the "Featured Packages" section.</p>
                      </div>
                    )}
                  </div>

                  {/* Discount Setup */}
                  <div className="glass-panel p-4 rounded-2xl space-y-4">
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        id="pkgDiscountActive"
                        className="w-4 h-4 rounded border-gray-300 text-cyan-500 focus:ring-cyan-500"
                        checked={pkgDiscountActive}
                        onChange={e => setPkgDiscountActive(e.target.checked)}
                      />
                      <label htmlFor="pkgDiscountActive" className="text-sm font-bold select-none cursor-pointer">Activate Discount</label>
                    </div>

                    {pkgDiscountActive && (
                      <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="text-xs text-on-surface-variant font-bold uppercase block mb-1">Percentage (0-100)</label>
                            <input
                              type="number"
                              min="0"
                              max="100"
                              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-cyan-500"
                              value={pkgDiscountPercent}
                              onChange={e => setPkgDiscountPercent(Number(e.target.value))}
                            />
                          </div>
                          <div>
                            <label className="text-xs text-on-surface-variant font-bold uppercase block mb-1">Discount Label</label>
                            <input
                              type="text"
                              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-cyan-500"
                              placeholder="e.g. Limited Offer"
                              value={pkgDiscountLabel}
                              onChange={e => setPkgDiscountLabel(e.target.value)}
                            />
                          </div>
                        </div>

                        {/* Real-time Preview */}
                        <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400 text-xs font-bold text-center">
                          Preview: ${pkgPrice} → ${discountedPrice} ({pkgDiscountPercent}% OFF — {pkgDiscountLabel || 'Offer active'})
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Included / Excluded Features Array Builder */}
              <div className="space-y-4">
                <h4 className="text-sm font-extrabold uppercase tracking-widest text-cyan-400 border-b border-white/5 pb-2">Included / Excluded Features</h4>
                
                {/* Feature Add Input */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    className="flex-grow bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-cyan-500"
                    placeholder="Type feature (e.g. 2 initial logo concepts)..."
                    value={newFeatureText}
                    onChange={e => setNewFeatureText(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addFeature();
                      }
                    }}
                  />
                  <div className="flex items-center gap-2 px-3 bg-white/5 border border-white/10 rounded-xl">
                    <input
                      type="checkbox"
                      id="newFeatureIncluded"
                      className="w-4 h-4 rounded text-cyan-500 focus:ring-cyan-500"
                      checked={newFeatureIncluded}
                      onChange={e => setNewFeatureIncluded(e.target.checked)}
                    />
                    <label htmlFor="newFeatureIncluded" className="text-xs font-semibold select-none cursor-pointer whitespace-nowrap">Include</label>
                  </div>
                  <button
                    type="button"
                    onClick={addFeature}
                    className="px-4 bg-cyan-500 hover:bg-cyan-600 text-black font-bold rounded-xl text-sm transition-colors whitespace-nowrap"
                  >
                    Add
                  </button>
                </div>

                {/* Features List */}
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {pkgFeatures.length === 0 ? (
                    <p className="text-xs text-on-surface-variant italic">No features configured yet.</p>
                  ) : (
                    pkgFeatures.map((feat, idx) => (
                      <div key={idx} className="flex items-center justify-between p-2 rounded-xl bg-white/5 border border-white/5 text-sm gap-4">
                        <div className="flex items-center gap-3 overflow-hidden">
                          <span className={`material-symbols-outlined text-sm ${feat.isIncluded ? 'text-emerald-400' : 'text-red-400'}`}>
                            {feat.isIncluded ? 'check_circle' : 'cancel'}
                          </span>
                          <span className={`${feat.isIncluded ? '' : 'text-on-surface-variant line-through'} truncate`}>{feat.text}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => toggleFeatureInclusion(idx)}
                            className="text-xs hover:underline text-cyan-400"
                          >
                            Toggle
                          </button>
                          <button
                            type="button"
                            onClick={() => removeFeature(idx)}
                            className="material-symbols-outlined text-[16px] text-red-400 hover:bg-white/10 p-1 rounded"
                          >
                            delete
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Suitable For Tags Builder */}
              <div className="space-y-4">
                <h4 className="text-sm font-extrabold uppercase tracking-widest text-cyan-400 border-b border-white/5 pb-2">Suitable For Tags</h4>
                
                {/* Tag Add Input */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    className="flex-grow bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-cyan-500"
                    placeholder="Type target tag (e.g. Startups)..."
                    value={newSuitableText}
                    onChange={e => setNewSuitableText(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addSuitableFor();
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={addSuitableFor}
                    className="px-4 bg-cyan-500 hover:bg-cyan-600 text-black font-bold rounded-xl text-sm transition-colors"
                  >
                    Add Tag
                  </button>
                </div>

                {/* Tags List */}
                <div className="flex flex-wrap gap-2">
                  {pkgSuitableFor.length === 0 ? (
                    <span className="text-xs text-on-surface-variant italic">No tags configured yet.</span>
                  ) : (
                    pkgSuitableFor.map((tag, idx) => (
                      <span key={idx} className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/10 border border-white/10 rounded-full text-xs text-gray-300">
                        {tag.text}
                        <button
                          type="button"
                          onClick={() => removeSuitableFor(idx)}
                          className="material-symbols-outlined text-[12px] hover:text-white"
                        >
                          close
                        </button>
                      </span>
                    ))
                  )}
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full py-4 rounded-xl font-bold primary-gradient-btn text-black shadow-lg hover:scale-[1.01] transition-transform active:scale-95 duration-200"
              >
                {packageEditId ? 'Save Changes' : 'Create Package'}
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
