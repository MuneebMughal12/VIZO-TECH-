import React, { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import API_URL from '../config/api';

export const ContactModal = ({ isOpen, onClose }) => {
  const { theme } = useTheme();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [message, setMessage] = useState('');
  const [selectedServices, setSelectedServices] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [attachmentUrl, setAttachmentUrl] = useState('');
  const [uploadingAttachment, setUploadingAttachment] = useState(false);

  /* --- Body scroll lock when modal is open --- */
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const services = ['Design', 'AI Integration', 'Technical Development', 'Digital Marketing', 'Video Editing', 'Shopify'];

  const toggleService = (service) => {
    if (selectedServices.includes(service)) {
      setSelectedServices(prev => prev.filter(s => s !== service));
    } else {
      setSelectedServices(prev => [...prev, service]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !whatsapp || !message) {
      setError('Please fill in all required fields.');
      return;
    }
    
    setSubmitting(true);
    setError('');

    try {
      const response = await fetch(`${API_URL}/api/inquiries`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          whatsapp,
          serviceChips: selectedServices,
          message,
          attachmentUrl
        })
      });

      if (!response.ok) {
        throw new Error('Failed to submit proposal');
      }

      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setName('');
        setEmail('');
        setWhatsapp('');
        setMessage('');
        setSelectedServices([]);
        setAttachmentUrl('');
        onClose();
      }, 2000);
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  /* --- Shared input class factory --- */
  const inputClass = `w-full py-3 px-4 text-sm sm:text-base rounded-xl border outline-none transition-all ${
    theme === 'dark'
      ? 'bg-[#0f0f11]/80 border-white/10 text-white focus:border-cyan-500/50 placeholder:text-white/30'
      : 'bg-[#f8f9fa] border-black/10 text-black focus:border-[#0052FF] placeholder:text-black/30'
  }`;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* ── Modal Sheet ── */}
      <div
        className={`glass-panel relative z-10 glow-border transition-all duration-300 scale-100
          w-full max-w-md md:max-w-xl mx-auto
          rounded-2xl md:rounded-3xl
          max-h-[92vh] overflow-y-auto
          p-5 sm:p-6 md:p-8
          flex flex-col
          [&::-webkit-scrollbar]:w-1.5
          [&::-webkit-scrollbar-track]:bg-transparent
          [&::-webkit-scrollbar-thumb]:bg-white/10
          [&::-webkit-scrollbar-thumb]:rounded-full
          ${theme === 'dark' ? 'text-white' : 'text-[#1a1c1c]'}
        `}
      >
        {/* ── Header row ── */}
        <div className="flex items-center justify-between mb-5">
          <h3
            className={`text-xl sm:text-2xl font-bold tracking-tight ${
              theme === 'dark' ? 'text-[#00f0ff]' : 'text-[#0052FF]'
            }`}
          >
            Initialize Inquiry
          </h3>
          <button
            className="material-symbols-outlined text-xl leading-none hover:scale-110 hover:text-red-500 transition-all cursor-pointer shrink-0"
            onClick={onClose}
          >
            close
          </button>
        </div>

        {/* ── Success state ── */}
        {success ? (
          <div className="py-12 text-center flex flex-col items-center gap-4">
            <span className={`material-symbols-outlined text-5xl ${theme === 'dark' ? 'text-[#00f0ff]' : 'text-[#0052FF]'}`}>
              check_circle
            </span>
            <h4 className="text-xl font-bold">Inquiry Transmitted Successfully</h4>
            <p className="text-on-surface-variant text-sm">An engineering architect will contact you shortly.</p>
          </div>
        ) : (
          /* ── Form ── */
          <form onSubmit={handleSubmit} className="space-y-4 md:space-y-5">
            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-500 rounded-lg text-sm">
                {error}
              </div>
            )}

            {/* Full Name */}
            <div>
              <label className="block text-[10px] sm:text-[11px] font-semibold text-on-surface-variant mb-1.5 uppercase tracking-widest">
                Full Name *
              </label>
              <input
                className={inputClass}
                placeholder="John Doe"
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                required
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-[10px] sm:text-[11px] font-semibold text-on-surface-variant mb-1.5 uppercase tracking-widest">
                Email Address *
              </label>
              <input
                className={inputClass}
                placeholder="john@enterprise.com"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
            </div>

            {/* WhatsApp */}
            <div>
              <label className="block text-[10px] sm:text-[11px] font-semibold text-on-surface-variant mb-1.5 uppercase tracking-widest">
                WhatsApp Number *
              </label>
              <input
                className={inputClass}
                placeholder="+41 79 123 45 67"
                type="tel"
                value={whatsapp}
                onChange={e => setWhatsapp(e.target.value)}
                required
              />
            </div>

            {/* Service Chips */}
            <div>
              <label className="block text-[10px] sm:text-[11px] font-semibold text-on-surface-variant mb-1.5 uppercase tracking-widest">
                Select Scope Services
              </label>
              <div className="flex flex-wrap gap-2 md:gap-2.5">
                {services.map(service => {
                  const selected = selectedServices.includes(service);
                  return (
                    <button
                      key={service}
                      type="button"
                      onClick={() => toggleService(service)}
                      className={`px-3 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-semibold border transition-all ${
                        selected
                          ? theme === 'dark'
                            ? 'bg-[#00f0ff]/20 border-[#00f0ff] text-[#00f0ff]'
                            : 'bg-[#0052FF]/20 border-[#0052FF] text-[#0052FF]'
                          : theme === 'dark'
                            ? 'bg-white/5 border-white/10 text-on-surface-variant hover:bg-white/10'
                            : 'bg-black/5 border-black/10 text-on-surface-variant hover:bg-black/10'
                      }`}
                    >
                      {service}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Project Details */}
            <div>
              <label className="block text-[10px] sm:text-[11px] font-semibold text-on-surface-variant mb-1.5 uppercase tracking-widest">
                Project Details *
              </label>
              <textarea
                className={`${inputClass} h-24 sm:h-28 resize-none`}
                placeholder="Describe your architectural design and development requirements..."
                value={message}
                onChange={e => setMessage(e.target.value)}
                required
              />
            </div>

            {/* Attachment — stacks vertically on mobile */}
            <div>
              <label className="block text-[10px] sm:text-[11px] font-semibold text-on-surface-variant mb-1.5 uppercase tracking-widest">
                Attach Document / Image (Link or Upload)
              </label>
              <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center w-full">
                <input
                  type="text"
                  placeholder="Paste document link or image URL..."
                  className={`${inputClass} flex-grow`}
                  value={attachmentUrl}
                  onChange={e => setAttachmentUrl(e.target.value)}
                />
                <label
                  className={`shrink-0 cursor-pointer border rounded-xl px-4 py-3 text-sm font-semibold flex items-center justify-center gap-1.5 transition-all ${
                    theme === 'dark'
                      ? 'bg-white/5 border-white/10 text-white hover:bg-white/10'
                      : 'bg-black/5 border-black/10 text-black hover:bg-black/10'
                  }`}
                >
                  <span className="material-symbols-outlined text-[18px]">
                    {uploadingAttachment ? 'sync' : 'cloud_upload'}
                  </span>
                  {uploadingAttachment ? 'Uploading...' : 'Upload'}
                  <input
                    type="file"
                    accept="image/*,application/pdf,.doc,.docx,.txt"
                    className="hidden"
                    onChange={async (e) => {
                      const file = e.target.files[0];
                      if (!file) return;

                      setUploadingAttachment(true);
                      const formData = new FormData();
                      formData.append('image', file);

                      try {
                        const res = await fetch(`${API_URL}/api/upload`, {
                          method: 'POST',
                          body: formData
                        });

                        if (res.ok) {
                          const data = await res.json();
                          setAttachmentUrl(data.fileUrl);
                        } else {
                          const errData = await res.json();
                          alert(errData.msg || 'Upload failed');
                        }
                      } catch (err) {
                        console.error('File upload failed:', err);
                        alert('Error uploading file');
                      } finally {
                        setUploadingAttachment(false);
                      }
                    }}
                  />
                </label>
              </div>
            </div>

            {/* CTA Submit */}
            <button
              type="submit"
              disabled={submitting || uploadingAttachment}
              className={`mt-4 w-full py-3.5 text-center font-semibold text-sm sm:text-base rounded-xl flex items-center justify-center gap-2 cursor-pointer hover:scale-[1.01] transition-transform disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 ${
                theme === 'dark'
                  ? 'bg-gradient-to-r from-[#00f0ff] to-[#9d05ff] text-black shadow-lg shadow-[#00f0ff]/10 hover:brightness-110'
                  : 'bg-[#0052FF] text-white hover:bg-[#003bbb] shadow-lg shadow-[#0052FF]/20'
              }`}
            >
              {submitting ? 'Transmitting...' : 'Transmit Message'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
