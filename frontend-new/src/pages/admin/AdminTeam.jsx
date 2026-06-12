import React, { useState, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';

export const AdminTeam = () => {
  const { theme } = useTheme();
  const [team, setTeam] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);

  // Form States
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [bio, setBio] = useState('');
  const [isPinnedHome, setIsPinnedHome] = useState(false);
  const [techStack, setTechStack] = useState('');
  const [status, setStatus] = useState('Active'); // Active, Away, On Leave

  const token = localStorage.getItem('vizo_admin_token');

  const fetchTeam = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/team');
      if (res.ok) {
        const data = await res.json();
        setTeam(data);
      }
    } catch (err) {
      console.error('Error fetching team:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeam();
  }, []);

  const handleOpenAdd = () => {
    setEditId(null);
    setName('');
    setRole('');
    setImageUrl('');
    setBio('');
    setIsPinnedHome(false);
    setTechStack('');
    setStatus('Active');
    setShowModal(true);
  };

  const handleOpenEdit = (member) => {
    setEditId(member._id);
    setName(member.name || '');
    setRole(member.role || '');
    setImageUrl(member.imageUrl || '');
    setBio(member.bio || '');
    setIsPinnedHome(member.isPinnedHome || false);
    setTechStack(Array.isArray(member.techStack) ? member.techStack.join(', ') : member.techStack || '');
    setStatus(member.status || 'Active');
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to remove this team member?')) return;
    try {
      const res = await fetch(`http://localhost:5000/api/team/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setTeam(prev => prev.filter(m => m._id !== id));
      }
    } catch (err) {
      console.error('Failed to delete team member:', err);
    }
  };

  const handleTogglePin = async (member) => {
    try {
      const res = await fetch(`http://localhost:5000/api/team/${member._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ isPinnedHome: !member.isPinnedHome })
      });
      if (res.ok) {
        const updated = await res.json();
        setTeam(prev => prev.map(m => m._id === member._id ? updated : m));
      }
    } catch (err) {
      console.error('Failed to toggle pin status:', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      name,
      role,
      imageUrl,
      bio,
      isPinnedHome,
      status,
      techStack: techStack.split(',').map(s => s.trim()).filter(Boolean)
    };

    try {
      const url = editId 
        ? `http://localhost:5000/api/team/${editId}` 
        : 'http://localhost:5000/api/team';
      
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
        fetchTeam();
      }
    } catch (err) {
      console.error('Failed to save team member:', err);
    }
  };

  return (
    <div className="space-y-12">
      {/* Header Section */}
      <header className="flex justify-between items-end">
        <div>
          <h2 className="font-display-lg text-3xl md:text-display-lg font-bold">Team Members</h2>
          <p className="text-on-surface-variant text-sm mt-1 max-w-xl">
            Curate and manage your high-performance engineering collective. Control homepage features and details.
          </p>
        </div>
        <button 
          onClick={handleOpenAdd}
          className="bg-gradient-to-r from-[#00dbe9] to-[#9d05ff] text-white px-8 py-3.5 rounded-xl font-bold flex items-center gap-2 shadow-xl hover:scale-[1.02] active:scale-95 transition-all duration-200"
        >
          <span className="material-symbols-outlined">person_add</span>
          Add Team Member
        </button>
      </header>

      {/* Stats Bar */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="glass-card p-6 rounded-2xl">
          <p className="text-[10px] font-bold text-secondary uppercase mb-1">Total Collective</p>
          <p className="text-3xl font-extrabold">{team.length}</p>
        </div>
        <div className="glass-card p-6 rounded-2xl">
          <p className="text-[10px] font-bold text-[#00f0ff] uppercase mb-1">Pinned to Home</p>
          <p className="text-3xl font-extrabold">{team.filter(t => t.isPinnedHome).length}</p>
        </div>
        <div className="glass-card p-6 rounded-2xl">
          <p className="text-[10px] font-bold text-on-surface-variant uppercase mb-1">Utilization</p>
          <p className="text-3xl font-extrabold">94%</p>
        </div>
        <div className="glass-card p-6 rounded-2xl">
          <p className="text-[10px] font-bold text-emerald-400 uppercase mb-1">Active Now</p>
          <p className="text-3xl font-extrabold">{team.filter(t => t.status !== 'On Leave').length}</p>
        </div>
      </div>

      {/* Team Grid */}
      {loading ? (
        <div className="text-center py-12">Loading team roster...</div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {team.map(member => (
            <div key={member._id} className="glass-card p-8 rounded-2xl flex items-center justify-between group hover:border-[#00f0ff]/30 transition-all duration-300">
              <div className="flex items-center gap-6">
                <div className="relative shrink-0">
                  <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-white/10 group-hover:border-[#00f0ff] transition-colors duration-300">
                    {member.imageUrl ? (
                      <img src={member.imageUrl} alt={member.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-white/5 flex items-center justify-center">
                        <span className="material-symbols-outlined text-on-surface-variant text-4xl">person</span>
                      </div>
                    )}
                  </div>
                  <div className={`absolute bottom-1 right-1 w-4 h-4 border-2 border-surface rounded-full ${
                    member.status === 'Active' ? 'bg-green-500' : member.status === 'Away' ? 'bg-amber-500' : 'bg-red-500'
                  }`} />
                </div>
                <div>
                  <h3 className="text-lg font-bold mb-1">{member.name}</h3>
                  <p className="text-xs font-semibold text-[#00f0ff] uppercase tracking-wider mb-2">{member.role}</p>
                  
                  {member.techStack && member.techStack.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {member.techStack.map(stack => (
                        <span key={stack} className="px-2 py-0.5 bg-white/5 text-on-surface-variant text-[10px] rounded border border-white/5">
                          {stack}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <button 
                  onClick={() => handleTogglePin(member)}
                  className={`p-2.5 rounded-xl border transition-all flex items-center justify-center ${
                    member.isPinnedHome 
                      ? 'bg-amber-500/20 border-amber-500/40 text-amber-400 hover:bg-amber-500/30' 
                      : 'border-white/10 hover:bg-white/5 text-on-surface-variant hover:text-white'
                  }`}
                  title={member.isPinnedHome ? "Unpin from Homepage" : "Pin to Homepage"}
                >
                  <span className={`material-symbols-outlined text-[18px] ${member.isPinnedHome ? 'fill-1' : ''}`}>push_pin</span>
                </button>
                <button 
                  onClick={() => handleOpenEdit(member)}
                  className="p-2.5 rounded-xl border border-white/10 hover:bg-secondary-container hover:text-on-secondary-container transition-all flex items-center justify-center"
                >
                  <span className="material-symbols-outlined text-[18px]">edit</span>
                </button>
                <button 
                  onClick={() => handleDelete(member._id)}
                  className="p-2.5 rounded-xl border border-white/10 hover:bg-red-500/20 hover:text-red-500 transition-all flex items-center justify-center"
                >
                  <span className="material-symbols-outlined text-[18px]">delete</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* CRUD Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className={`glass-card rounded-[2rem] p-8 max-w-2xl w-full max-h-[85vh] overflow-y-auto ${
            theme === 'light' ? 'bg-white text-black' : 'bg-[#131313] text-[#e5e2e1]'
          }`}>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold">{editId ? 'Edit Team Member' : 'Add Team Member'}</h3>
              <button onClick={() => setShowModal(false)} className="text-on-surface-variant hover:text-white">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider mb-2">Member Name</label>
                  <input 
                    type="text" 
                    required
                    className={`w-full border rounded-xl px-4 py-3 text-sm focus:outline-none transition-all ${
                      theme === 'dark' ? 'bg-white/5 border-white/10 focus:border-[#00f0ff]' : 'bg-[#f8f9fa] border-black/10 focus:border-[#0052FF]'
                    }`}
                    value={name} 
                    onChange={e => setName(e.target.value)} 
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider mb-2">Role Title</label>
                  <input 
                    type="text" 
                    required
                    className={`w-full border rounded-xl px-4 py-3 text-sm focus:outline-none transition-all ${
                      theme === 'dark' ? 'bg-white/5 border-white/10 focus:border-[#00f0ff]' : 'bg-[#f8f9fa] border-black/10 focus:border-[#0052FF]'
                    }`}
                    value={role} 
                    onChange={e => setRole(e.target.value)} 
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider mb-2">Status</label>
                  <select 
                    className={`w-full border rounded-xl px-4 py-3 text-sm focus:outline-none transition-all ${
                      theme === 'dark' ? 'bg-[#131313] border-white/10 focus:border-[#00f0ff]' : 'bg-white border-black/10 focus:border-[#0052FF]'
                    }`}
                    value={status} 
                    onChange={e => setStatus(e.target.value)}
                  >
                    <option value="Active">Active</option>
                    <option value="Away">Away</option>
                    <option value="On Leave">On Leave</option>
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
                <label className="block text-xs font-bold uppercase tracking-wider mb-2">Technical Stack Tags (comma-separated)</label>
                <input 
                  type="text" 
                  placeholder="e.g. React, Node.js, AWS, Kubernetes"
                  className={`w-full border rounded-xl px-4 py-3 text-sm focus:outline-none transition-all ${
                    theme === 'dark' ? 'bg-white/5 border-white/10 focus:border-[#00f0ff]' : 'bg-[#f8f9fa] border-black/10 focus:border-[#0052FF]'
                  }`}
                  value={techStack} 
                  onChange={e => setTechStack(e.target.value)} 
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-2">Short Bio</label>
                <textarea 
                  rows={3}
                  className={`w-full border rounded-xl px-4 py-3 text-sm focus:outline-none transition-all ${
                    theme === 'dark' ? 'bg-white/5 border-white/10 focus:border-[#00f0ff]' : 'bg-[#f8f9fa] border-black/10 focus:border-[#0052FF]'
                  }`}
                  value={bio} 
                  onChange={e => setBio(e.target.value)} 
                />
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
                  Save Member
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
