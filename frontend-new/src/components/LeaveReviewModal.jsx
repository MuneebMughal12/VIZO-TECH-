import React, { useState } from 'react';
import { useTheme } from '../context/ThemeContext';

export const LeaveReviewModal = ({ isOpen, onClose }) => {
  const { theme } = useTheme();
  const [name, setName] = useState('');
  const [companyWebsite, setCompanyWebsite] = useState('');
  const [rating, setRating] = useState(5);
  const [feedback, setFeedback] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const [hoverRating, setHoverRating] = useState(0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !feedback) {
      setError('Please fill in name and review text.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const response = await fetch('http://localhost:5000/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          companyWebsite,
          rating,
          feedback
        })
      });

      if (!response.ok) {
        throw new Error('Failed to submit review');
      }

      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setName('');
        setCompanyWebsite('');
        setRating(5);
        setFeedback('');
        onClose();
      }, 2000);
    } catch (err) {
      setError(err.message || 'Something went wrong.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm" 
        onClick={onClose}
      />

      <div className={`glass-panel w-full max-w-lg rounded-3xl p-8 md:p-10 relative z-10 glow-border transition-all duration-300 ${
        theme === 'dark' ? 'text-white' : 'text-[#1a1c1c]'
      }`}>
        <div className="flex justify-between items-center mb-6">
          <h3 className={`font-display-lg text-[28px] font-bold ${
            theme === 'dark' ? 'text-dark-primary' : 'text-[#0052FF]'
          }`}>
            Submit Testimonial
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
            <h4 className="text-xl font-bold">Review Transmitted</h4>
            <p className="text-on-surface-variant text-sm">Thank you. Your feedback is sent for moderation approval.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-500 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div>
              <label className="block text-[11px] font-semibold text-on-surface-variant mb-2 uppercase tracking-widest">Your Name *</label>
              <input 
                className={`w-full border rounded-xl px-4 py-3 text-sm focus:outline-none transition-colors ${
                  theme === 'dark' 
                    ? 'bg-white/5 border-white/10 text-white focus:border-dark-primary' 
                    : 'bg-[#f8f9fa] border-black/10 text-black focus:border-[#0052FF]'
                }`}
                placeholder="Sarah Jenkins" 
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-on-surface-variant mb-2 uppercase tracking-widest">Company / Website</label>
              <input 
                className={`w-full border rounded-xl px-4 py-3 text-sm focus:outline-none transition-colors ${
                  theme === 'dark' 
                    ? 'bg-white/5 border-white/10 text-white focus:border-dark-primary' 
                    : 'bg-[#f8f9fa] border-black/10 text-black focus:border-[#0052FF]'
                }`}
                placeholder="e.g. Creative Lead, Luminous" 
                type="text"
                value={companyWebsite}
                onChange={e => setCompanyWebsite(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-on-surface-variant mb-2 uppercase tracking-widest">Star Rating *</label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map(star => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="transition-transform duration-100 hover:scale-125 focus:outline-none"
                  >
                    <span className={`material-symbols-outlined text-3xl select-none ${
                      (hoverRating || rating) >= star 
                        ? 'fill-1 text-[#00f0ff] dark:text-[#00f0ff]' 
                        : 'text-on-surface-variant/40'
                    }`}>
                      star
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-on-surface-variant mb-2 uppercase tracking-widest">Feedback Text *</label>
              <textarea 
                className={`w-full border rounded-xl px-4 py-3 text-sm focus:outline-none transition-colors h-24 resize-none ${
                  theme === 'dark' 
                    ? 'bg-white/5 border-white/10 text-white focus:border-dark-primary' 
                    : 'bg-[#f8f9fa] border-black/10 text-black focus:border-[#0052FF]'
                }`}
                placeholder="Share your experience working with VIZO TECH..."
                value={feedback}
                onChange={e => setFeedback(e.target.value)}
                required
              />
            </div>

            <button 
              type="submit" 
              disabled={submitting}
              className={`w-full py-4 rounded-xl font-bold flex items-center justify-center transition-all ${
                theme === 'dark'
                  ? 'bg-gradient-to-r from-[#00f0ff] to-[#9d05ff] text-black hover:brightness-110 shadow-lg shadow-[#00f0ff]/10'
                  : 'bg-[#0052FF] text-white hover:bg-[#003bbb] shadow-lg shadow-[#0052FF]/20'
              } disabled:opacity-50`}
            >
              {submitting ? 'Transmitting...' : 'Transmit Testimonial'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
