import React, { useState } from 'react';
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

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm" 
        onClick={onClose}
      />
      
      {/* Modal Card */}
      <div className={`glass-panel w-full max-w-lg rounded-3xl p-8 md:p-10 relative z-10 glow-border transition-all duration-300 scale-100 ${
        theme === 'dark' ? 'text-white' : 'text-[#1a1c1c]'
      }`}>
        <div className="flex justify-between items-center mb-6">
          <h3 className={`font-display-lg text-[28px] font-bold ${
            theme === 'dark' ? 'text-dark-primary' : 'text-[#0052FF]'
          }`}>
            Initialize Inquiry
          </h3>
          <button 
            className="material-symbols-outlined hover:scale-110 hover:text-red-500 transition-all cursor-pointer"
            onClick={onClose}
          >
            close
          </button>
        </div>

        {success ? (
          <div className="py-12 text-center flex flex-col items-center gap-4">
            <span className={`material-symbols-outlined text-5xl ${
              theme === 'dark' ? 'text-[#00f0ff]' : 'text-[#0052FF]'
            }`}>check_circle</span>
            <h4 className="text-xl font-bold">Inquiry Transmitted Successfully</h4>
            <p className="text-on-surface-variant text-sm">An engineering architect will contact you shortly.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-500 rounded-lg text-sm">
                {error}
              </div>
            )}
            
            <div>
              <label className="block text-[11px] font-semibold text-on-surface-variant mb-2 uppercase tracking-widest">Full Name *</label>
              <input 
                className={`w-full border rounded-xl px-4 py-3 text-sm focus:outline-none transition-colors ${
                  theme === 'dark' 
                    ? 'bg-white/5 border-white/10 text-white focus:border-dark-primary' 
                    : 'bg-[#f8f9fa] border-black/10 text-black focus:border-[#0052FF]'
                }`}
                placeholder="John Doe" 
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-on-surface-variant mb-2 uppercase tracking-widest">Email Address *</label>
              <input 
                className={`w-full border rounded-xl px-4 py-3 text-sm focus:outline-none transition-colors ${
                  theme === 'dark' 
                    ? 'bg-white/5 border-white/10 text-white focus:border-dark-primary' 
                    : 'bg-[#f8f9fa] border-black/10 text-black focus:border-[#0052FF]'
                }`}
                placeholder="john@enterprise.com" 
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-on-surface-variant mb-2 uppercase tracking-widest">WhatsApp Number *</label>
              <input 
                className={`w-full border rounded-xl px-4 py-3 text-sm focus:outline-none transition-colors ${
                  theme === 'dark' 
                    ? 'bg-white/5 border-white/10 text-white focus:border-dark-primary' 
                    : 'bg-[#f8f9fa] border-black/10 text-black focus:border-[#0052FF]'
                }`}
                placeholder="+41 79 123 45 67" 
                type="tel"
                value={whatsapp}
                onChange={e => setWhatsapp(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-on-surface-variant mb-2 uppercase tracking-widest">Select Scope Services</label>
              <div className="flex flex-wrap gap-2">
                {services.map(service => {
                  const selected = selectedServices.includes(service);
                  return (
                    <button
                      key={service}
                      type="button"
                      onClick={() => toggleService(service)}
                      className={`px-4 py-2 rounded-full text-xs font-semibold border transition-all ${
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

            <div>
              <label className="block text-[11px] font-semibold text-on-surface-variant mb-2 uppercase tracking-widest">Project Details *</label>
              <textarea 
                className={`w-full border rounded-xl px-4 py-3 text-sm focus:outline-none transition-colors h-24 resize-none ${
                  theme === 'dark' 
                    ? 'bg-white/5 border-white/10 text-white focus:border-dark-primary' 
                    : 'bg-[#f8f9fa] border-black/10 text-black focus:border-[#0052FF]'
                }`}
                placeholder="Describe your architectural design and development requirements..."
                value={message}
                onChange={e => setMessage(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-on-surface-variant mb-2 uppercase tracking-widest">
                Attach Document / Image (Link or Upload)
              </label>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  placeholder="Paste document link or image URL..."
                  className={`flex-grow border rounded-xl px-4 py-3 text-sm focus:outline-none transition-all ${
                    theme === 'dark' 
                      ? 'bg-white/5 border-white/10 text-white focus:border-dark-primary' 
                      : 'bg-[#f8f9fa] border-black/10 text-black focus:border-[#0052FF]'
                  }`}
                  value={attachmentUrl} 
                  onChange={e => setAttachmentUrl(e.target.value)} 
                />
                <label className={`shrink-0 cursor-pointer border rounded-xl px-4 py-3 text-sm font-semibold flex items-center justify-center transition-all ${
                  theme === 'dark' 
                    ? 'bg-white/5 border-white/10 text-white hover:bg-white/10' 
                    : 'bg-black/5 border-black/10 text-black hover:bg-black/10'
                }`}>
                  <span className="material-symbols-outlined text-[18px] mr-1">
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

            <button 
              type="submit" 
              disabled={submitting || uploadingAttachment}
              className={`w-full py-4 rounded-xl font-bold flex items-center justify-center transition-all ${
                theme === 'dark'
                  ? 'bg-gradient-to-r from-[#00f0ff] to-[#9d05ff] text-black hover:brightness-110 shadow-lg shadow-[#00f0ff]/10'
                  : 'bg-[#0052FF] text-white hover:bg-[#003bbb] shadow-lg shadow-[#0052FF]/20'
              } disabled:opacity-50`}
            >
              {submitting ? 'Transmitting...' : 'Transmit Message'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
