import React, { useState, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';

export const AdminProjects = () => {
  const { theme } = useTheme();
  const [projects, setProjects] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);

  // Form States
  const [title, setTitle] = useState('');
  const [client, setClient] = useState('');
  const [category, setCategory] = useState('Development');
  const [status, setStatus] = useState('Production');
  const [imageUrl, setImageUrl] = useState('');
  const [projectLink, setProjectLink] = useState('');
  const [description, setDescription] = useState('');
  const [challenge, setChallenge] = useState('');
  const [solution, setSolution] = useState('');
  const [impact, setImpact] = useState('');
  const [techStack, setTechStack] = useState('');
  const [isPinnedHome, setIsPinnedHome] = useState(false);

  // Metrics
  const [latency, setLatency] = useState('');
  const [dailyTxs, setDailyTxs] = useState('');
  const [uptime, setUptime] = useState('');
  const [roi, setRoi] = useState('');

  const token = localStorage.getItem('vizo_admin_token');
  const categories = ['All', 'Design', 'AI', 'Development', 'Digital Marketing'];

  const fetchProjects = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/projects');
      if (res.ok) {
        const data = await res.json();
        setProjects(data);
      }
    } catch (err) {
      console.error('Error fetching projects:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleOpenAdd = () => {
    setEditId(null);
    setTitle('');
    setClient('');
    setCategory('Development');
    setStatus('Production');
    setImageUrl('');
    setProjectLink('');
    setDescription('');
    setChallenge('');
    setSolution('');
    setImpact('');
    setTechStack('');
    setIsPinnedHome(false);
    setLatency('12ms');
    setDailyTxs('450k');
    setUptime('99.99%');
    setRoi('5.4x');
    setShowModal(true);
  };

  const handleOpenEdit = (proj) => {
    setEditId(proj._id);
    setTitle(proj.title || '');
    setClient(proj.client || '');
    setCategory(proj.category || 'Development');
    setStatus(proj.status || 'Production');
    setImageUrl(proj.imageUrl || '');
    setProjectLink(proj.projectLink || '');
    setDescription(proj.description || '');
    setChallenge(proj.challenge || '');
    setSolution(proj.solution || '');
    setImpact(proj.impact || '');
    setTechStack(Array.isArray(proj.techStack) ? proj.techStack.join(', ') : proj.techStack || '');
    setIsPinnedHome(proj.isPinnedHome || false);
    
    // Metrics fallbacks
    setLatency(proj.metrics?.latency || '12ms');
    setDailyTxs(proj.metrics?.dailyTxs || '450k');
    setUptime(proj.metrics?.uptime || '99.99%');
    setRoi(proj.metrics?.roi || '5.4x');
    
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to remove this project?')) return;
    try {
      const res = await fetch(`http://localhost:5000/api/projects/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setProjects(prev => prev.filter(p => p._id !== id));

        // Broadcast data sync
        const channel = new BroadcastChannel('vizo_data_sync');
        channel.postMessage('refresh_projects');
        channel.close();
      }
    } catch (err) {
      console.error('Failed to delete project:', err);
    }
  };

  const handleTogglePin = async (proj) => {
    try {
      const updatedPin = !proj.isPinnedHome;
      const res = await fetch(`http://localhost:5000/api/projects/${proj._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ isPinnedHome: updatedPin })
      });
      if (res.ok) {
        setProjects(prev => prev.map(p => p._id === proj._id ? { ...p, isPinnedHome: updatedPin } : p));

        // Broadcast data sync
        const channel = new BroadcastChannel('vizo_data_sync');
        channel.postMessage('refresh_projects');
        channel.close();
      }
    } catch (err) {
      console.error('Failed to toggle pin:', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      title,
      client,
      category,
      status,
      imageUrl,
      projectLink,
      description,
      challenge,
      solution,
      impact,
      isPinnedHome,
      techStack: techStack.split(',').map(s => s.trim()).filter(Boolean),
      metrics: {
        latency,
        dailyTxs,
        uptime,
        roi
      }
    };

    try {
      const url = editId 
        ? `http://localhost:5000/api/projects/${editId}` 
        : 'http://localhost:5000/api/projects';
      
      const method = editId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        setShowModal(false);
        fetchProjects();

        // Broadcast data sync
        const channel = new BroadcastChannel('vizo_data_sync');
        channel.postMessage('refresh_projects');
        channel.close();
      }
    } catch (err) {
      console.error('Failed to save project:', err);
    }
  };

  const filteredProjects = projects.filter(p => {
    const matchesSearch = p.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          p.client?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          p.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-12">
      {/* Header Section */}
      <header className="flex justify-between items-end">
        <div>
          <h2 className="font-display-lg text-3xl md:text-display-lg font-bold">Project Repository</h2>
          <p className="text-on-surface-variant text-sm mt-1 max-w-xl">
            Centralized management of active and archived engineering ventures. Control visibility and track deployment status.
          </p>
        </div>
        <button 
          onClick={handleOpenAdd}
          className="bg-gradient-to-r from-[#00dbe9] to-[#9d05ff] text-white px-8 py-3.5 rounded-xl font-bold flex items-center gap-2 shadow-xl hover:scale-[1.02] active:scale-95 transition-all duration-200"
        >
          <span className="material-symbols-outlined">add</span>
          Add New Project
        </button>
      </header>

      {/* Search and Filters */}
      <div className="glass-card rounded-2xl p-6 flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="relative flex-grow w-full max-w-lg">
          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant">search</span>
          <input 
            type="text"
            placeholder="Search projects by name, technology, or client..."
            className={`w-full border rounded-xl py-3 pl-12 pr-4 text-sm focus:outline-none transition-all ${
              theme === 'dark' 
                ? 'bg-white/5 border-white/10 text-white focus:border-[#00f0ff]' 
                : 'bg-[#f8f9fa] border-black/10 text-black focus:border-[#0052FF]'
            }`}
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex gap-2 w-full md:w-auto overflow-x-auto py-1">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-secondary-container text-on-secondary-container shadow-md'
                  : 'text-on-surface-variant hover:bg-white/5'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Projects Table */}
      {loading ? (
        <div className="text-center py-12">Loading project repository...</div>
      ) : (
        <div className="glass-card rounded-2xl overflow-hidden border border-black/10 dark:border-white/10">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5">
                  <th className="px-8 py-5 text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Pin</th>
                  <th className="px-8 py-5 text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Title</th>
                  <th className="px-8 py-5 text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Category</th>
                  <th className="px-8 py-5 text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Status</th>
                  <th className="px-8 py-5 text-[10px] font-bold text-on-surface-variant uppercase tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5 dark:divide-white/5">
                {filteredProjects.map(proj => (
                  <tr key={proj._id} className="group hover:bg-white/5 transition-colors">
                    <td className="px-8 py-6">
                      <label className="relative inline-flex items-center cursor-pointer select-none">
                        <input 
                          type="checkbox"
                          checked={proj.isPinnedHome || false}
                          onChange={() => handleTogglePin(proj)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-white/10 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-gray-400 after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-secondary-container peer-checked:after:bg-[#f7e6ff]" />
                      </label>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden shrink-0">
                          {proj.imageUrl ? (
                            <img src={proj.imageUrl} alt={proj.title} className="w-full h-full object-cover" />
                          ) : (
                            <span className="material-symbols-outlined text-on-surface-variant">architecture</span>
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-sm">{proj.title}</p>
                          <p className="text-[11px] text-on-surface-variant">{proj.client ? `Client: ${proj.client}` : 'Internal Project'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className="px-3 py-1 bg-white/5 text-on-surface-variant rounded-full text-xs font-semibold border border-white/5">
                        {proj.category}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${
                          proj.status === 'Production' ? 'bg-[#00f0ff] animate-pulse' : proj.status === 'Staging' ? 'bg-purple-500' : 'bg-gray-500'
                        }`} />
                        <span className="text-xs font-semibold">{proj.status === 'Production' ? 'In Production' : proj.status === 'Staging' ? 'Staging' : 'Concept'}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex justify-end gap-3">
                        <button 
                          onClick={() => handleOpenEdit(proj)}
                          className="w-9 h-9 rounded-lg flex items-center justify-center text-on-surface-variant hover:text-white hover:bg-white/5 transition-all"
                        >
                          <span className="material-symbols-outlined text-[18px]">edit</span>
                        </button>
                        <button 
                          onClick={() => handleDelete(proj._id)}
                          className="w-9 h-9 rounded-lg flex items-center justify-center text-on-surface-variant hover:text-red-500 hover:bg-red-500/10 transition-all"
                        >
                          <span className="material-symbols-outlined text-[18px]">delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* System Stats Footer */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="glass-card p-6 rounded-2xl flex flex-col gap-2">
          <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Active Builds</span>
          <p className="text-3xl font-extrabold text-[#00f0ff]">12</p>
          <div className="w-full bg-white/10 h-1.5 rounded-full mt-2 overflow-hidden">
            <div className="bg-[#00f0ff] h-full w-3/4" />
          </div>
        </div>
        <div className="glass-card p-6 rounded-2xl flex flex-col gap-2">
          <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Team Capacity</span>
          <p className="text-3xl font-extrabold text-[#9d05ff]">88%</p>
          <div className="w-full bg-white/10 h-1.5 rounded-full mt-2 overflow-hidden">
            <div className="bg-[#9d05ff] h-full w-[88%]" />
          </div>
        </div>
        <div className="glass-card p-6 rounded-2xl flex flex-col gap-2">
          <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Total Value</span>
          <p className="text-3xl font-extrabold">$2.4M</p>
          <p className="text-[11px] text-[#00f0ff] font-bold flex items-center gap-1">
            <span className="material-symbols-outlined text-xs">trending_up</span>
            +12% this quarter
          </p>
        </div>
        <div className="glass-card p-6 rounded-2xl flex flex-col gap-2">
          <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">System Health</span>
          <p className="text-3xl font-extrabold text-emerald-400">99.9%</p>
          <p className="text-[11px] text-on-surface-variant">Last ping 2s ago</p>
        </div>
      </div>

      {/* CRUD Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className={`glass-card rounded-[2rem] p-8 max-w-3xl w-full max-h-[85vh] overflow-y-auto ${
            theme === 'light' ? 'bg-white text-black' : 'bg-[#131313] text-[#e5e2e1]'
          }`}>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold">{editId ? 'Edit Project' : 'Add New Project'}</h3>
              <button onClick={() => setShowModal(false)} className="text-on-surface-variant hover:text-white">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider mb-2">Project Title</label>
                  <input 
                    type="text" 
                    required
                    className={`w-full border rounded-xl px-4 py-3 text-sm focus:outline-none transition-all ${
                      theme === 'dark' ? 'bg-white/5 border-white/10 focus:border-[#00f0ff]' : 'bg-[#f8f9fa] border-black/10 focus:border-[#0052FF]'
                    }`}
                    value={title} 
                    onChange={e => setTitle(e.target.value)} 
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider mb-2">Client Name</label>
                  <input 
                    type="text" 
                    className={`w-full border rounded-xl px-4 py-3 text-sm focus:outline-none transition-all ${
                      theme === 'dark' ? 'bg-white/5 border-white/10 focus:border-[#00f0ff]' : 'bg-[#f8f9fa] border-black/10 focus:border-[#0052FF]'
                    }`}
                    value={client} 
                    onChange={e => setClient(e.target.value)} 
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider mb-2">Category</label>
                  <select 
                    className={`w-full border rounded-xl px-4 py-3 text-sm focus:outline-none transition-all ${
                      theme === 'dark' ? 'bg-[#131313] border-white/10 focus:border-[#00f0ff]' : 'bg-white border-black/10 focus:border-[#0052FF]'
                    }`}
                    value={category} 
                    onChange={e => setCategory(e.target.value)}
                  >
                    {categories.filter(c => c !== 'All').map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider mb-2">Status</label>
                  <select 
                    className={`w-full border rounded-xl px-4 py-3 text-sm focus:outline-none transition-all ${
                      theme === 'dark' ? 'bg-[#131313] border-white/10 focus:border-[#00f0ff]' : 'bg-white border-black/10 focus:border-[#0052FF]'
                    }`}
                    value={status} 
                    onChange={e => setStatus(e.target.value)}
                  >
                    <option value="Production">Production</option>
                    <option value="Staging">Staging</option>
                    <option value="Concept">Concept</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider mb-2">Pin to Homepage</label>
                  <div className="pt-3">
                    <label className="relative inline-flex items-center cursor-pointer select-none">
                      <input 
                        type="checkbox"
                        checked={isPinnedHome}
                        onChange={e => setIsPinnedHome(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-white/10 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-gray-400 after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-secondary-container" />
                    </label>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider mb-2">Image (Upload or Link)</label>
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      placeholder="Paste image URL..."
                      className={`flex-grow border rounded-xl px-4 py-3 text-sm focus:outline-none transition-all ${
                        theme === 'dark' ? 'bg-white/5 border-white/10 focus:border-[#00f0ff]' : 'bg-[#f8f9fa] border-black/10 focus:border-[#0052FF]'
                      }`}
                      value={imageUrl} 
                      onChange={e => setImageUrl(e.target.value)} 
                    />
                    <label className={`shrink-0 cursor-pointer border rounded-xl px-4 py-3 text-sm font-semibold flex items-center justify-center transition-all ${
                      theme === 'dark' 
                        ? 'bg-white/5 border-white/10 text-white hover:bg-white/10' 
                        : 'bg-black/5 border-black/10 text-black hover:bg-black/10'
                    }`}>
                      <span className="material-symbols-outlined text-[18px] mr-1">cloud_upload</span>
                      Upload
                      <input 
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={async (e) => {
                          const file = e.target.files[0];
                          if (!file) return;
                          
                          const formData = new FormData();
                          formData.append('image', file);
                          
                          try {
                            const res = await fetch('http://localhost:5000/api/upload', {
                              method: 'POST',
                              headers: {
                                'Authorization': `Bearer ${token}`
                              },
                              body: formData
                            });
                            
                            if (res.ok) {
                              const data = await res.json();
                              setImageUrl(data.imageUrl);
                            } else {
                              const errData = await res.json();
                              alert(errData.msg || 'Upload failed');
                            }
                          } catch (err) {
                            console.error('Upload error:', err);
                            alert('Failed to upload image');
                          }
                        }}
                      />
                    </label>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider mb-2">Project External Link</label>
                  <input 
                    type="text" 
                    className={`w-full border rounded-xl px-4 py-3 text-sm focus:outline-none transition-all ${
                      theme === 'dark' ? 'bg-white/5 border-white/10 focus:border-[#00f0ff]' : 'bg-[#f8f9fa] border-black/10 focus:border-[#0052FF]'
                    }`}
                    value={projectLink} 
                    onChange={e => setProjectLink(e.target.value)} 
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-2">Tech Stack (comma-separated)</label>
                <input 
                  type="text" 
                  placeholder="e.g. React, Three.js, Tailwind CSS"
                  className={`w-full border rounded-xl px-4 py-3 text-sm focus:outline-none transition-all ${
                    theme === 'dark' ? 'bg-white/5 border-white/10 focus:border-[#00f0ff]' : 'bg-[#f8f9fa] border-black/10 focus:border-[#0052FF]'
                  }`}
                  value={techStack} 
                  onChange={e => setTechStack(e.target.value)} 
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-2">Description</label>
                <textarea 
                  required
                  rows={2}
                  className={`w-full border rounded-xl px-4 py-3 text-sm focus:outline-none transition-all ${
                    theme === 'dark' ? 'bg-white/5 border-white/10 focus:border-[#00f0ff]' : 'bg-[#f8f9fa] border-black/10 focus:border-[#0052FF]'
                  }`}
                  value={description} 
                  onChange={e => setDescription(e.target.value)} 
                />
              </div>

              {/* Case Study Metrics */}
              <div className="border-t border-white/5 pt-6 space-y-4">
                <h4 className="text-sm font-bold">Case Study Metrics</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider mb-1">Latency</label>
                    <input 
                      type="text" 
                      className={`w-full border rounded-xl px-3 py-2 text-xs focus:outline-none ${
                        theme === 'dark' ? 'bg-white/5 border-white/10 focus:border-[#00f0ff]' : 'bg-[#f8f9fa] border-black/10 focus:border-[#0052FF]'
                      }`}
                      value={latency} 
                      onChange={e => setLatency(e.target.value)} 
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider mb-1">Daily Txs</label>
                    <input 
                      type="text" 
                      className={`w-full border rounded-xl px-3 py-2 text-xs focus:outline-none ${
                        theme === 'dark' ? 'bg-white/5 border-white/10 focus:border-[#00f0ff]' : 'bg-[#f8f9fa] border-black/10 focus:border-[#0052FF]'
                      }`}
                      value={dailyTxs} 
                      onChange={e => setDailyTxs(e.target.value)} 
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider mb-1">Uptime</label>
                    <input 
                      type="text" 
                      className={`w-full border rounded-xl px-3 py-2 text-xs focus:outline-none ${
                        theme === 'dark' ? 'bg-white/5 border-white/10 focus:border-[#00f0ff]' : 'bg-[#f8f9fa] border-black/10 focus:border-[#0052FF]'
                      }`}
                      value={uptime} 
                      onChange={e => setUptime(e.target.value)} 
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider mb-1">ROI Multiplier</label>
                    <input 
                      type="text" 
                      className={`w-full border rounded-xl px-3 py-2 text-xs focus:outline-none ${
                        theme === 'dark' ? 'bg-white/5 border-white/10 focus:border-[#00f0ff]' : 'bg-[#f8f9fa] border-black/10 focus:border-[#0052FF]'
                      }`}
                      value={roi} 
                      onChange={e => setRoi(e.target.value)} 
                    />
                  </div>
                </div>
              </div>

              {/* Case Study Details */}
              <div className="border-t border-white/5 pt-6 space-y-4">
                <h4 className="text-sm font-bold">Case Study Context</h4>
                <div className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider mb-1">Challenge</label>
                    <textarea 
                      rows={2}
                      className={`w-full border rounded-xl px-4 py-3 text-sm focus:outline-none ${
                        theme === 'dark' ? 'bg-white/5 border-white/10 focus:border-[#00f0ff]' : 'bg-[#f8f9fa] border-black/10 focus:border-[#0052FF]'
                      }`}
                      value={challenge} 
                      onChange={e => setChallenge(e.target.value)} 
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider mb-1">Solution</label>
                    <textarea 
                      rows={2}
                      className={`w-full border rounded-xl px-4 py-3 text-sm focus:outline-none ${
                        theme === 'dark' ? 'bg-white/5 border-white/10 focus:border-[#00f0ff]' : 'bg-[#f8f9fa] border-black/10 focus:border-[#0052FF]'
                      }`}
                      value={solution} 
                      onChange={e => setSolution(e.target.value)} 
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider mb-1">Impact</label>
                    <textarea 
                      rows={2}
                      className={`w-full border rounded-xl px-4 py-3 text-sm focus:outline-none ${
                        theme === 'dark' ? 'bg-white/5 border-white/10 focus:border-[#00f0ff]' : 'bg-[#f8f9fa] border-black/10 focus:border-[#0052FF]'
                      }`}
                      value={impact} 
                      onChange={e => setImpact(e.target.value)} 
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-4 border-t border-white/5 pt-6">
                <button 
                  type="button" 
                  onClick={() => setShowModal(false)}
                  className="px-6 py-3 rounded-xl border border-white/10 hover:bg-white/5 text-xs font-bold uppercase tracking-wider"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-8 py-3 rounded-xl bg-gradient-to-r from-[#00dbe9] to-[#9d05ff] text-white hover:opacity-90 text-xs font-bold uppercase tracking-wider"
                >
                  Save Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
