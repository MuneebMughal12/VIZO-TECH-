import React, { useState, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';
import API_URL from '../../config/api';
import { AdminTechModal } from '../../components/AdminTechModal';

export const AdminTechnologies = () => {
  const { theme } = useTheme();
  const [technologies, setTechnologies] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [selectedTech, setSelectedTech] = useState(null);

  const token = localStorage.getItem('vizo_admin_token');

  const fetchTechnologies = async () => {
    try {
      const res = await fetch(`${API_URL}/api/technologies/admin`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setTechnologies(data);
      }
    } catch (err) {
      console.error('Error fetching technologies:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTechnologies();
  }, []);

  const handleOpenAdd = () => {
    setSelectedTech(null);
    setShowModal(true);
  };

  const handleOpenEdit = (tech) => {
    setSelectedTech(tech);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to remove this technology?')) return;
    try {
      const res = await fetch(`${API_URL}/api/technologies/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setTechnologies(prev => prev.filter(t => t._id !== id));
        broadcastSync();
      } else {
        const data = await res.json();
        alert(data.msg || 'Deletion failed');
      }
    } catch (err) {
      console.error('Failed to delete technology:', err);
    }
  };

  const handleToggleActive = async (tech) => {
    try {
      const res = await fetch(`${API_URL}/api/technologies/${tech._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ isActive: !tech.isActive })
      });
      if (res.ok) {
        const updated = await res.json();
        setTechnologies(prev => prev.map(t => t._id === tech._id ? updated : t));
        broadcastSync();
      }
    } catch (err) {
      console.error('Failed to toggle active status:', err);
    }
  };

  const handleSave = async (formData) => {
    const url = selectedTech 
      ? `${API_URL}/api/technologies/${selectedTech._id}` 
      : `${API_URL}/api/technologies`;
    
    const method = selectedTech ? 'PUT' : 'POST';

    const res = await fetch(url, {
      method,
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData // Sends multipart FormData (binary logo + text fields)
    });

    if (res.ok) {
      fetchTechnologies();
      broadcastSync();
    } else {
      const data = await res.json();
      throw new Error(data.msg || 'Failed to save technology item');
    }
  };

  const broadcastSync = () => {
    const channel = new BroadcastChannel('vizo_data_sync');
    channel.postMessage('refresh_technologies');
    channel.close();
  };

  return (
    <div className="space-y-12">
      {/* Header Section */}
      <header className="flex justify-between items-end">
        <div>
          <h2 className="font-display-lg text-3xl md:text-display-lg font-bold">Tech Stack & Tools</h2>
          <p className="text-on-surface-variant text-sm mt-1 max-w-xl">
            Curate the agency's tech stack. Manage platform tags, upload logos, set sorting display orders, and toggle items on the homepage infinite marquee.
          </p>
        </div>
        <button 
          onClick={handleOpenAdd}
          className="bg-gradient-to-r from-[#00dbe9] to-[#9d05ff] text-white px-8 py-3.5 rounded-xl font-bold flex items-center gap-2 shadow-xl hover:scale-[1.02] active:scale-95 transition-all duration-200"
        >
          <span className="material-symbols-outlined">add_circle</span>
          Add Stack Item
        </button>
      </header>

      {/* Stats Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-card p-6 rounded-2xl">
          <p className="text-[10px] font-bold text-secondary uppercase mb-1">Total Technologies</p>
          <p className="text-3xl font-extrabold">{technologies.length}</p>
        </div>
        <div className="glass-card p-6 rounded-2xl">
          <p className="text-[10px] font-bold text-[#00f0ff] uppercase mb-1">Published Active</p>
          <p className="text-3xl font-extrabold">{technologies.filter(t => t.isActive).length}</p>
        </div>
        <div className="glass-card p-6 rounded-2xl">
          <p className="text-[10px] font-bold text-on-surface-variant uppercase mb-1">Inactive / Draft</p>
          <p className="text-3xl font-extrabold">{technologies.filter(t => !t.isActive).length}</p>
        </div>
      </div>

      {/* Main Table / Grid of Stack Items */}
      {loading ? (
        <div className="text-center py-12 text-on-surface-variant">Loading tech stack inventory...</div>
      ) : technologies.length === 0 ? (
        <div className="glass-card p-12 text-center text-on-surface-variant rounded-2xl border border-dashed">
          No stack items registered yet. Click "Add Stack Item" above to get started.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {technologies.map(tech => (
            <div 
              key={tech._id} 
              className={`glass-card p-6 rounded-2xl flex flex-col justify-between hover:border-blue-500/30 dark:hover:border-[#00f0ff]/30 transition-all duration-300 relative group ${
                !tech.isActive ? 'opacity-60' : ''
              }`}
            >
              {/* Top Row: Category and Display Order Badge */}
              <div className="flex justify-between items-start mb-4">
                <span className="px-2.5 py-1 bg-white/5 border border-white/5 rounded-lg text-[9px] font-extrabold tracking-wider uppercase text-on-surface-variant">
                  {tech.category}
                </span>
                <span className="text-[10px] font-bold text-on-surface-variant flex items-center gap-1">
                  <span className="material-symbols-outlined text-xs">sort</span>
                  Order: {tech.displayOrder}
                </span>
              </div>

              {/* Logo and Name */}
              <div className="flex flex-col items-center py-4">
                <div className="w-16 h-16 rounded-xl bg-white/5 border border-white/10 p-2 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform duration-300">
                  <img 
                    src={tech.logoUrl} 
                    alt={tech.name} 
                    className="max-w-full max-h-full object-contain filter brightness-[100]" 
                  />
                </div>
                <h4 className="text-base font-bold text-on-surface text-center tracking-wide">{tech.name}</h4>
              </div>

              {/* Bottom Row Actions */}
              <div className="border-t border-black/5 dark:border-white/5 pt-4 mt-4 flex items-center justify-between">
                
                {/* Publish Switch */}
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => handleToggleActive(tech)}
                    className={`px-3 py-1.5 rounded-lg text-[10px] font-extrabold uppercase tracking-wider border transition-colors ${
                      tech.isActive 
                        ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20' 
                        : 'bg-white/5 border-white/10 text-on-surface-variant hover:bg-white/10'
                    }`}
                    title={tech.isActive ? "Hide from website" : "Show on website"}
                  >
                    {tech.isActive ? 'Published' : 'Hidden'}
                  </button>
                </div>

                {/* Edit & Delete Buttons */}
                <div className="flex items-center gap-1.5">
                  <button 
                    onClick={() => handleOpenEdit(tech)}
                    className="p-2 rounded-lg border border-white/10 hover:bg-secondary-container hover:text-on-secondary-container transition-all flex items-center justify-center"
                    title="Edit Item"
                  >
                    <span className="material-symbols-outlined text-[16px]">edit</span>
                  </button>
                  <button 
                    onClick={() => handleDelete(tech._id)}
                    className="p-2 rounded-lg border border-white/10 hover:bg-red-500/20 hover:text-red-500 transition-all flex items-center justify-center"
                    title="Delete Item"
                  >
                    <span className="material-symbols-outlined text-[16px]">delete</span>
                  </button>
                </div>

              </div>
            </div>
          ))}
        </div>
      )}

      {/* AdminTechModal Component */}
      <AdminTechModal 
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSave={handleSave}
        tech={selectedTech}
      />
    </div>
  );
};
