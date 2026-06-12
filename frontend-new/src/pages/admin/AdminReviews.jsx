import React, { useState, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';

export const AdminReviews = () => {
  const { theme } = useTheme();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem('vizo_admin_token');

  const fetchReviews = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/reviews/all', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setReviews(data);
      }
    } catch (err) {
      console.error('Error fetching reviews:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleApprove = async (id) => {
    try {
      const res = await fetch(`http://localhost:5000/api/reviews/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ isApproved: true })
      });
      if (res.ok) {
        fetchReviews();

        // Broadcast data sync
        const channel = new BroadcastChannel('vizo_data_sync');
        channel.postMessage('refresh_reviews');
        channel.close();
      }
    } catch (err) {
      console.error('Failed to approve review:', err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to remove this review?')) return;
    try {
      const res = await fetch(`http://localhost:5000/api/reviews/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setReviews(prev => prev.filter(r => r._id !== id));

        // Broadcast data sync
        const channel = new BroadcastChannel('vizo_data_sync');
        channel.postMessage('refresh_reviews');
        channel.close();
      }
    } catch (err) {
      console.error('Failed to delete review:', err);
    }
  };

  const pendingReviews = reviews.filter(r => !r.isApproved);
  const approvedReviews = reviews.filter(r => r.isApproved);
  const averageRating = reviews.length > 0 
    ? (reviews.reduce((acc, curr) => acc + curr.rating, 0) / reviews.length).toFixed(2)
    : '5.00';

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span 
        key={i} 
        className={`material-symbols-outlined text-sm ${
          i < rating ? 'text-[#00f0ff] fill-1' : 'text-white/20'
        }`}
      >
        star
      </span>
    ));
  };

  return (
    <div className="space-y-12">
      {/* Header Section */}
      <header className="flex justify-between items-end">
        <div>
          <h2 className="font-display-lg text-3xl md:text-display-lg font-bold">Review Management</h2>
          <p className="text-on-surface-variant text-sm mt-1 max-w-xl">
            Curate and monitor client feedback across your global delivery ecosystem. Approve and moderate client entries.
          </p>
        </div>
      </header>

      {/* Metrics Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Metric 1 */}
        <div className="glass-card p-6 rounded-xl flex items-center space-x-6">
          <div className="w-12 h-12 rounded-full bg-[#00f0ff]/10 flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-[#00f0ff] text-xl">rate_review</span>
          </div>
          <div>
            <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Total Reviews</p>
            <h3 className="text-3xl font-extrabold text-on-surface mt-1">{reviews.length}</h3>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="glass-card p-6 rounded-xl flex items-center space-x-6 border-l-4 border-l-[#00f0ff]">
          <div className="w-12 h-12 rounded-full bg-[#00f0ff]/20 flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-[#00f0ff] text-xl">pending_actions</span>
          </div>
          <div>
            <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Pending Approval</p>
            <h3 className="text-3xl font-extrabold text-on-surface mt-1">{pendingReviews.length}</h3>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="glass-card p-6 rounded-xl flex items-center space-x-6">
          <div className="w-12 h-12 rounded-full bg-[#9d05ff]/10 flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-[#9d05ff] text-xl">star</span>
          </div>
          <div>
            <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Average Rating</p>
            <h3 className="text-3xl font-extrabold text-on-surface mt-1">{averageRating}</h3>
            <div className="flex items-center gap-0.5 mt-1">
              {renderStars(Math.round(parseFloat(averageRating)))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Review Section */}
      {loading ? (
        <div className="text-center py-12">Loading client reviews...</div>
      ) : (
        <div className="space-y-12">
          {/* Pending Queue */}
          <section className="space-y-6">
            <div className="flex items-center justify-between px-2">
              <h3 className="text-xl font-bold">Pending Reviews</h3>
              <span className="px-3 py-1 bg-[#00f0ff]/10 text-[#00f0ff] text-[10px] rounded-full font-bold uppercase tracking-widest">
                {pendingReviews.length} In Queue
              </span>
            </div>

            {pendingReviews.length === 0 ? (
              <div className="glass-card rounded-2xl p-8 text-center text-on-surface-variant text-sm">
                No reviews require moderation at this time.
              </div>
            ) : (
              <div className="space-y-4">
                {pendingReviews.map(rev => (
                  <div key={rev._id} className="glass-card rounded-2xl p-8 group hover:border-[#00f0ff]/30 transition-all duration-300">
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                      <div>
                        <h4 className="font-bold text-base">{rev.name}</h4>
                        <p className="text-xs text-on-surface-variant">{rev.companyWebsite || 'Verified Client'}</p>
                      </div>
                      <div className="text-left md:text-right shrink-0">
                        <span className="px-3 py-1 bg-white/5 text-on-surface-variant text-[10px] rounded uppercase font-bold tracking-widest">
                          {new Date(rev.createdAt).toLocaleDateString()}
                        </span>
                        <div className="flex items-center gap-0.5 mt-2 md:justify-end">
                          {renderStars(rev.rating)}
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-end">
                      <div className="lg:col-span-8">
                        <blockquote className="text-sm italic text-on-surface leading-relaxed border-l-2 border-white/10 pl-4">
                          "{rev.feedback}"
                        </blockquote>
                      </div>
                      <div className="lg:col-span-4 flex justify-end gap-3">
                        <button 
                          onClick={() => handleApprove(rev._id)}
                          className="px-6 py-2.5 bg-[#00f0ff] text-black font-bold rounded-lg shadow-lg hover:brightness-110 active:scale-95 transition-all text-xs uppercase tracking-wider"
                        >
                          Approve Review
                        </button>
                        <button 
                          onClick={() => handleDelete(rev._id)}
                          className="px-6 py-2.5 bg-white/5 border border-white/10 text-red-500 font-bold rounded-lg hover:bg-red-500/10 hover:border-red-500/30 transition-all text-xs uppercase tracking-wider"
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Approved Reviews Table */}
          <section className="space-y-6">
            <div className="flex items-center justify-between px-2">
              <h3 className="text-xl font-bold">Approved Reviews</h3>
            </div>

            <div className="glass-card rounded-2xl overflow-hidden border border-black/10 dark:border-white/10">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5">
                      <th className="px-6 py-4 text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Client</th>
                      <th className="px-6 py-4 text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Project / Company</th>
                      <th className="px-6 py-4 text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Rating</th>
                      <th className="px-6 py-4 text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Status</th>
                      <th className="px-6 py-4 text-[10px] font-bold text-on-surface-variant uppercase tracking-wider text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-black/5 dark:divide-white/5">
                    {approvedReviews.map(rev => (
                      <tr key={rev._id} className="hover:bg-white/5 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 rounded-full bg-secondary-container/20 text-[#dfb7ff] flex items-center justify-center text-[10px] font-bold select-none shrink-0">
                              {rev.name.charAt(0).toUpperCase()}
                            </div>
                            <span className="text-sm font-semibold">{rev.name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-xs text-on-surface-variant">
                          {rev.companyWebsite || 'Verified Client'}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1">
                            <span className="text-xs font-bold">{rev.rating.toFixed(1)}</span>
                            <span className="material-symbols-outlined text-[14px] text-[#00f0ff] fill-1">star</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="flex items-center text-[9px] font-bold text-[#00f0ff] uppercase tracking-widest select-none">
                            <span className="w-1.5 h-1.5 bg-[#00f0ff] rounded-full mr-2 animate-pulse" />
                            Published
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button 
                            onClick={() => handleDelete(rev._id)}
                            className="w-9 h-9 rounded-lg flex items-center justify-center text-on-surface-variant hover:text-red-500 hover:bg-red-500/10 transition-all ml-auto"
                            title="Unpublish / Delete"
                          >
                            <span className="material-symbols-outlined text-[18px]">delete</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                    {approvedReviews.length === 0 && (
                      <tr>
                        <td colSpan={5} className="px-6 py-12 text-center text-on-surface-variant text-sm">
                          No published reviews.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        </div>
      )}
    </div>
  );
};
