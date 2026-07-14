import React, { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { ProjectModal } from '../components/ProjectModal';
import API_URL from '../config/api';

export const Projects = () => {
  const { theme } = useTheme();
  const [projects, setProjects] = useState([]);
  const [activeCategory, setActiveCategory] = useState('All');
  const [selectedProject, setSelectedProject] = useState(null);
  const [loading, setLoading] = useState(true);

  const categories = ['All', 'Design', 'AI', 'Development', 'Digital Marketing', 'Video Editing', 'Shopify'];

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/projects`);
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

    const syncChannel = new BroadcastChannel('vizo_data_sync');
    syncChannel.onmessage = (event) => {
      if (event.data === 'refresh_projects') {
        fetchProjects();
      }
    };

    return () => {
      syncChannel.close();
    };
  }, []);

  const filteredProjects = activeCategory === 'All' 
    ? projects 
    : projects.filter(p => {
        // Map category strings flexibly to cover spelling variants
        if (activeCategory === 'Development') {
          return p.category === 'Development' || p.category === 'Technical Development';
        }
        return p.category === activeCategory;
      });

  return (
    <main className="relative pt-32 pb-section-gap max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop">
      {/* Background Blobs */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-[#00f0ff]/5 blur-[150px] rounded-full animate-float" />
        <div className="absolute bottom-[20%] right-[-10%] w-[40%] h-[40%] bg-purple-500/5 blur-[150px] rounded-full animate-float" style={{ animationDelay: '-3s' }} />
      </div>

      {/* Hero Header */}
      <header className="mb-16 text-center max-w-3xl mx-auto space-y-6">
        <h1 className="font-display-xl text-4xl md:text-display-xl mb-6 text-gradient font-extrabold tracking-tight">Our Portfolio</h1>
        <p className="font-body-lg text-sm md:text-body-lg text-on-surface-variant leading-relaxed">
          A curated gallery of high-performance technical solutions, aesthetic-led design systems, and advanced AI architectures engineered for the global elite.
        </p>
      </header>

      {/* Tabs Filter */}
      <div className="flex justify-center mb-16">
        <div className="flex items-center gap-1.5 p-1.5 rounded-full overflow-x-auto max-w-full no-scrollbar glass-panel shadow-2xl border border-white/5">
          {categories.map((cat) => {
            const isActive = activeCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-5 py-2.5 rounded-full text-xs font-bold transition-all duration-300 whitespace-nowrap active:scale-95 ${
                  isActive
                    ? theme === 'dark'
                      ? 'bg-[#00f0ff] text-black shadow-[0_0_15px_rgba(0,240,255,0.4)]'
                      : 'bg-[#0052FF] text-white shadow-[0_0_15px_rgba(0,82,255,0.4)]'
                    : 'text-on-surface-variant hover:text-white hover:bg-white/5'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* Projects Grid / Loading State */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 space-y-4">
          <div className="w-12 h-12 rounded-full border-4 border-t-cyan-400 border-white/10 animate-spin" />
          <p className="text-on-surface-variant text-sm font-semibold tracking-wider">Syncing Projects...</p>
        </div>
      ) : filteredProjects.length === 0 ? (
        <div className="py-24 text-center text-on-surface-variant text-sm font-semibold">
          No projects registered in this category yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-gutter">
          {filteredProjects.map(project => (
            <article 
              key={project._id} 
              className="glass-card rounded-2xl overflow-hidden flex flex-col group h-full hover:shadow-2xl"
            >
              {/* Card Image */}
              <div className="aspect-video relative overflow-hidden bg-black/30 border-b border-white/5">
                <img 
                  alt={project.title} 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                  src={project.thumbnail}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-60" />
              </div>

              {/* Card Body */}
              <div className="p-8 flex flex-col flex-grow">
                <span className={`font-label-sm text-[10px] font-bold uppercase tracking-widest mb-3 ${
                  theme === 'dark' ? 'text-[#00f0ff]' : 'text-[#0052FF]'
                }`}>
                  {project.category}
                </span>
                <h3 className="font-headline-lg text-xl font-bold mb-4 text-on-surface line-clamp-1">{project.title}</h3>
                <p className="font-body-md text-xs md:text-sm text-on-surface-variant mb-6 flex-grow line-clamp-3 leading-relaxed">
                  {project.description}
                </p>
                <button 
                  onClick={() => setSelectedProject(project)}
                  className={`w-full py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${
                    theme === 'dark'
                      ? 'btn-primary-gradient text-black font-extrabold'
                      : 'bg-[#0052FF] text-white hover:bg-[#003bbb]'
                  }`}
                >
                  View Case Study
                  <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                </button>
              </div>
            </article>
          ))}
        </div>
      )}

      {/* Case Study Modal */}
      <ProjectModal 
        isOpen={selectedProject !== null}
        onClose={() => setSelectedProject(null)}
        project={selectedProject}
      />
    </main>
  );
};
