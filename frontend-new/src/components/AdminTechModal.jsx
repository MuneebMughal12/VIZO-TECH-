import React, { useState, useEffect, useRef } from 'react';
import { useTheme } from '../context/ThemeContext';

export const AdminTechModal = ({ isOpen, onClose, onSave, tech = null }) => {
  const { theme } = useTheme();

  // State Management
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [displayOrder, setDisplayOrder] = useState('0');
  const [isActive, setIsActive] = useState(true);

  // File Upload State
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const fileInputRef = useRef(null);

  // Error/Uploading state
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);

  // Sync state with incoming edit tech item or reset on add
  useEffect(() => {
    if (tech) {
      setName(tech.name || '');
      setCategory(tech.category || '');
      setDisplayOrder(tech.displayOrder !== undefined ? String(tech.displayOrder) : '0');
      setIsActive(tech.isActive !== undefined ? tech.isActive : true);
      setPreviewUrl(tech.logoUrl || '');
      setFile(null);
    } else {
      setName('');
      setCategory('');
      setDisplayOrder('0');
      setIsActive(true);
      setPreviewUrl('');
      setFile(null);
    }
    setError('');
  }, [tech, isOpen]);

  if (!isOpen) return null;

  // Handle local file previewing
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    // Strict validation inside UI to prevent invalid uploads early
    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/svg+xml', 'image/avif'];
    if (!allowedTypes.includes(selectedFile.type)) {
      setError('Invalid file type. Only PNG, JPG, JPEG, WEBP, SVG, and AVIF are allowed.');
      setFile(null);
      setPreviewUrl(tech?.logoUrl || '');
      return;
    }

    setError('');
    setFile(selectedFile);

    // Create a local object URL for instant visual preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result);
    };
    reader.readAsDataURL(selectedFile);
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !category) {
      setError('Please complete all required text fields.');
      return;
    }

    if (!tech && !file) {
      setError('Please select a logo image file to upload.');
      return;
    }

    setUploading(true);
    setError('');

    // Prepare multipart FormData
    const formData = new FormData();
    formData.append('name', name);
    formData.append('category', category);
    formData.append('displayOrder', displayOrder);
    formData.append('isActive', isActive);
    if (file) {
      formData.append('logo', file);
    }

    try {
      await onSave(formData);
      onClose();
    } catch (err) {
      setError(err.message || 'Operation failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className={`glass-card rounded-[2.5rem] p-8 max-w-lg w-full max-h-[90vh] overflow-y-auto border shadow-2xl relative transition-colors duration-300 ${
        theme === 'light' ? 'bg-white text-slate-900 border-slate-200/50' : 'bg-[#131313] text-[#e5e2e1] border-white/10'
      }`}>
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold font-headline tracking-wide">
            {tech ? 'Edit Tech Stack Item' : 'Create Tech Stack Item'}
          </h3>
          <button 
            onClick={onClose} 
            className="text-on-surface-variant hover:text-[#00f0ff] p-1.5 rounded-full transition-colors focus:outline-none"
            aria-label="Close modal"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-500 text-xs rounded-xl font-semibold leading-relaxed">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Logo Image Upload Box */}
          <div className="flex flex-col items-center">
            <span className="self-start text-[10px] font-extrabold uppercase tracking-widest text-on-surface-variant mb-2">
              ORIGINAL LOGO IMAGE
            </span>
            <div 
              onClick={triggerFileInput}
              className={`w-full aspect-[2/1] rounded-2xl border-2 border-dashed flex flex-col items-center justify-center p-4 cursor-pointer hover:border-blue-500/50 dark:hover:border-sky-400/50 transition-all duration-300 relative group overflow-hidden ${
                theme === 'light' ? 'bg-slate-50 border-slate-300' : 'bg-black/20 border-white/10'
              }`}
            >
              {previewUrl ? (
                <div className="relative w-full h-full flex items-center justify-center p-2">
                  <img 
                    src={previewUrl} 
                    alt="Logo Preview" 
                    className="max-w-full max-h-full object-contain filter drop-shadow-[0_4px_12px_rgba(0,0,0,0.15)] group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity rounded-2xl">
                    <span className="text-white text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-sm">cloud_upload</span>
                      Change Logo
                    </span>
                  </div>
                </div>
              ) : (
                <div className="text-center space-y-2 select-none">
                  <span className="material-symbols-outlined text-4xl text-on-surface-variant group-hover:text-primary transition-colors">
                    image
                  </span>
                  <p className="text-xs text-on-surface-variant font-medium">Drag & drop or click to upload</p>
                </div>
              )}
              <input 
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                className="hidden"
              />
            </div>
            
            {/* Custom "CHOOSE LOGO" Button with Gradient Borders */}
            <button
              type="button"
              onClick={triggerFileInput}
              className={`mt-4 px-6 py-2.5 rounded-full text-xs font-extrabold uppercase tracking-widest border transition-all duration-300 hover:scale-[1.02] focus:outline-none ${
                theme === 'light' 
                  ? 'border-blue-600/30 text-blue-600 hover:bg-blue-600/5' 
                  : 'border-[#00f0ff]/30 text-[#00f0ff] hover:bg-[#00f0ff]/5'
              }`}
            >
              CHOOSE LOGO
            </button>
          </div>

          {/* Form Fields */}
          <div className="space-y-4">
            <div>
              <label className="block text-[10px] font-extrabold uppercase tracking-widest text-on-surface-variant mb-2">
                PLATFORM / APP / LANGUAGE NAME
              </label>
              <input 
                type="text"
                required
                placeholder="e.g., React, Node.js"
                className={`w-full border rounded-xl px-4 py-3 text-sm focus:outline-none transition-all ${
                  theme === 'light' 
                    ? 'bg-slate-50 border-slate-200 focus:border-blue-600 focus:bg-white' 
                    : 'bg-white/5 border-white/10 focus:border-[#00f0ff] focus:bg-transparent'
                }`}
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-[10px] font-extrabold uppercase tracking-widest text-on-surface-variant mb-2">
                WORK / CATEGORY
              </label>
              <input 
                type="text"
                required
                placeholder="e.g., Frontend, Backend, Devops"
                className={`w-full border rounded-xl px-4 py-3 text-sm focus:outline-none transition-all ${
                  theme === 'light' 
                    ? 'bg-slate-50 border-slate-200 focus:border-blue-600 focus:bg-white' 
                    : 'bg-white/5 border-white/10 focus:border-[#00f0ff] focus:bg-transparent'
                }`}
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-4 items-center">
              <div>
                <label className="block text-[10px] font-extrabold uppercase tracking-widest text-on-surface-variant mb-2">
                  DISPLAY ORDER
                </label>
                <input 
                  type="number"
                  min="0"
                  required
                  className={`w-full border rounded-xl px-4 py-3 text-sm focus:outline-none transition-all ${
                    theme === 'light' 
                      ? 'bg-slate-50 border-slate-200 focus:border-blue-600 focus:bg-white' 
                      : 'bg-white/5 border-white/10 focus:border-[#00f0ff] focus:bg-transparent'
                  }`}
                  value={displayOrder}
                  onChange={(e) => setDisplayOrder(e.target.value)}
                />
              </div>

              <div className="flex flex-col pt-1">
                <span className="block text-[10px] font-extrabold uppercase tracking-widest text-on-surface-variant mb-3 select-none">
                  PUBLISH STATUS
                </span>
                <label className="relative inline-flex items-center cursor-pointer select-none">
                  <input 
                    type="checkbox"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className={`w-11 h-6 rounded-full transition-colors duration-300 peer relative after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all ${
                    isActive 
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-[#00f0ff] dark:to-[#9d05ff] after:translate-x-5' 
                      : 'bg-slate-200 dark:bg-white/10'
                  }`} />
                  <span className="ml-3 text-xs font-bold text-on-surface-variant uppercase tracking-wider">
                    {isActive ? 'Active' : 'Inactive'}
                  </span>
                </label>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex gap-4 pt-4 border-t border-black/5 dark:border-white/5">
            <button
              type="button"
              onClick={onClose}
              disabled={uploading}
              className={`flex-1 py-3.5 rounded-xl text-xs font-bold uppercase tracking-widest border transition-all duration-200 select-none ${
                theme === 'light'
                  ? 'border-slate-200 text-slate-700 hover:bg-slate-50'
                  : 'border-white/10 text-on-surface-variant hover:bg-white/5'
              }`}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={uploading}
              className={`flex-1 py-3.5 rounded-xl text-xs font-bold uppercase tracking-widest text-black flex items-center justify-center gap-2 transition-all duration-300 select-none ${
                theme === 'light'
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'primary-gradient-btn text-black'
              } disabled:opacity-50`}
            >
              {uploading ? (
                <>
                  <span className="material-symbols-outlined animate-spin text-sm">sync</span>
                  Saving...
                </>
              ) : (
                'Save Item'
              )}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
