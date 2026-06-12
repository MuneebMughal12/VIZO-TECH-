import React, { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';
import { useTheme } from '../context/ThemeContext';
import { ProjectModal } from '../components/ProjectModal';
import { LeaveReviewModal } from '../components/LeaveReviewModal';

export const Home = ({ onContactClick }) => {
  const { theme } = useTheme();
  const mountRef = useRef(null);

  // States
  const [pinnedProjects, setPinnedProjects] = useState([]);
  const [pinnedTeam, setPinnedTeam] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [currentReviewIdx, setCurrentReviewIdx] = useState(0);
  const [faqActive, setFaqActive] = useState([true, false, false]);
  
  // Modals
  const [selectedProject, setSelectedProject] = useState(null);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);

  // Contact form states
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactWhatsapp, setContactWhatsapp] = useState('');
  const [contactMsg, setContactMsg] = useState('');
  const [contactSuccess, setContactSuccess] = useState(false);
  const [contactError, setContactError] = useState('');
  const [contactAttachmentUrl, setContactAttachmentUrl] = useState('');
  const [contactUploading, setContactUploading] = useState(false);

  // Fetch baseline data
  const fetchData = async () => {
    try {
      // Projects
      const pRes = await fetch('http://localhost:5000/api/projects');
      if (pRes.ok) {
        const pData = await pRes.json();
        setPinnedProjects(pData.filter(p => p.isPinnedHome === true));
      }
      
      // Team
      const tRes = await fetch('http://localhost:5000/api/team');
      if (tRes.ok) {
        const tData = await tRes.json();
        setPinnedTeam(tData.filter(t => t.isPinnedHome === true));
      }

      // Reviews
      const rRes = await fetch('http://localhost:5000/api/reviews');
      if (rRes.ok) {
        const rData = await rRes.json();
        setReviews(rData);
      }
    } catch (err) {
      console.error('Failed to load homepage data:', err);
    }
  };

  useEffect(() => {
    fetchData();

    const syncChannel = new BroadcastChannel('vizo_data_sync');
    syncChannel.onmessage = (event) => {
      if (['refresh_team', 'refresh_projects', 'refresh_reviews'].includes(event.data)) {
        fetchData();
      }
    };

    return () => {
      syncChannel.close();
    };
  }, []);

  // Three.js 3D Background effect
  useEffect(() => {
    if (!mountRef.current) return;

    const container = mountRef.current;
    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    camera.position.z = 5;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    
    // Clear old canvases
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // Group to hold all neural components
    const group = new THREE.Group();

    // Glowing accent color
    const themeColor = theme === 'dark' ? 0x00f0ff : 0x0052ff;

    // 1. Outer Icosahedron Wireframe (Technical Grid)
    const outerGeo = new THREE.IcosahedronGeometry(2.1, 1);
    const outerMat = new THREE.MeshPhongMaterial({
      color: themeColor,
      wireframe: true,
      transparent: true,
      opacity: theme === 'dark' ? 0.3 : 0.18,
      shininess: 100
    });
    const outerMesh = new THREE.Mesh(outerGeo, outerMat);
    group.add(outerMesh);

    // 2. Inner Glowing Core (Metallic Purple Sphere)
    const innerGeo = new THREE.IcosahedronGeometry(1.2, 0);
    const innerMat = new THREE.MeshStandardMaterial({
      color: 0x9d00ff,
      metalness: 0.8,
      roughness: 0.2,
      emissive: 0x5a009d,
      emissiveIntensity: 0.4
    });
    const innerMesh = new THREE.Mesh(innerGeo, innerMat);
    group.add(innerMesh);

    // 3. Floating Nodes (Orbiting Spheres)
    const nodeGeo = new THREE.SphereGeometry(0.04, 16, 16);
    const nodeMat = new THREE.MeshBasicMaterial({
      color: theme === 'dark' ? 0xffffff : themeColor
    });
    for (let i = 0; i < 20; i++) {
      const node = new THREE.Mesh(nodeGeo, nodeMat);
      const angle = Math.random() * Math.PI * 2;
      const radius = 2.4 + Math.random() * 0.4;
      node.position.set(
        Math.cos(angle) * radius,
        Math.sin(angle) * radius,
        (Math.random() - 0.5) * 2
      );
      group.add(node);
    }

    scene.add(group);

    // Particles (Background field)
    const partGeo = new THREE.BufferGeometry();
    const partCount = 1000;
    const posArray = new Float32Array(partCount * 3);
    for (let i = 0; i < partCount * 3; i++) {
      posArray[i] = (Math.random() - 0.5) * 18;
    }
    partGeo.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    const partMat = new THREE.PointsMaterial({
      size: 0.02,
      color: themeColor,
      transparent: true,
      opacity: theme === 'dark' ? 0.5 : 0.3
    });
    const particles = new THREE.Points(partGeo, partMat);
    scene.add(particles);

    // Lighting
    const ambientLight = new THREE.AmbientLight(theme === 'dark' ? 0x404040 : 0x808080);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1);
    dirLight.position.set(5, 5, 5);
    scene.add(dirLight);

    const pointLight = new THREE.PointLight(themeColor, 1.2);
    pointLight.position.set(-5, 5, -5);
    scene.add(pointLight);

    // Interaction mouse tracker
    let mouseX = 0;
    let mouseY = 0;

    const handleMouseMove = (e) => {
      mouseX = (e.clientX / window.innerWidth) - 0.5;
      mouseY = (e.clientY / window.innerHeight) - 0.5;
    };
    window.addEventListener('mousemove', handleMouseMove);

    // Animation loop
    let reqId;
    const animate = () => {
      reqId = requestAnimationFrame(animate);
      
      group.rotation.y += 0.002;
      group.rotation.x += 0.001;

      // Mouse inertia follow
      group.rotation.x += (mouseY * 0.1 - group.rotation.x) * 0.05;
      group.rotation.y += (mouseX * 0.1 - group.rotation.y) * 0.05;

      // Bouncing / Floating effect
      group.position.y = Math.sin(Date.now() * 0.001) * 0.15;

      particles.rotation.y -= 0.0002;

      renderer.render(scene, camera);
    };
    animate();

    // Resize handler
    const handleResize = () => {
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(reqId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      container.innerHTML = '';
    };
  }, [theme]);

  // Review slider nav
  const prevReview = () => {
    if (reviews.length === 0) return;
    setCurrentReviewIdx(prev => (prev === 0 ? reviews.length - 1 : prev - 1));
  };
  const nextReview = () => {
    if (reviews.length === 0) return;
    setCurrentReviewIdx(prev => (prev === reviews.length - 1 ? 0 : prev + 1));
  };

  // FAQ toggles
  const toggleFaq = (idx) => {
    setFaqActive(prev => {
      const copy = [...prev];
      copy[idx] = !copy[idx];
      return copy;
    });
  };

  // Submit contact form
  const handleContactSubmit = async (e) => {
    e.preventDefault();
    if (!contactName || !contactEmail || !contactWhatsapp || !contactMsg) {
      setContactError('All required fields must be completed.');
      return;
    }
    setContactError('');

    try {
      const res = await fetch('http://localhost:5000/api/inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: contactName,
          email: contactEmail,
          whatsapp: contactWhatsapp,
          message: contactMsg,
          attachmentUrl: contactAttachmentUrl
        })
      });
      if (!res.ok) throw new Error('Transmission failed');
      setContactSuccess(true);
      setContactName('');
      setContactEmail('');
      setContactWhatsapp('');
      setContactMsg('');
      setContactAttachmentUrl('');
      setTimeout(() => setContactSuccess(false), 3000);
    } catch (err) {
      setContactError('Failed to send. Please try again.');
    }
  };

  return (
    <div className="relative overflow-hidden w-full">
      {/* 1. Hero Section */}
      <section className="relative h-screen w-full flex items-center justify-center overflow-hidden bg-transparent">
        {/* ThreeJS Container */}
        <div ref={mountRef} className="absolute inset-0 w-full h-full bg-transparent z-0 pointer-events-none" />

        <div className="relative z-20 max-w-container-max mx-auto px-margin-desktop text-center">
          <h1 className="font-display-xl text-[48px] md:text-display-xl text-gradient mb-8 max-w-4xl mx-auto drop-shadow-2xl">
            Engineering the Future of Digital Excellence
          </h1>
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <button 
              onClick={() => {
                const element = document.getElementById('showcase');
                element?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="primary-gradient-btn px-10 py-4 rounded-full text-lg font-bold text-black shadow-lg"
            >
              View Projects
            </button>
            <button 
              onClick={onContactClick}
              className="glass-card px-10 py-4 rounded-full text-lg font-bold hover:bg-white/10 dark:hover:bg-black/20 transition-all border border-white/20"
            >
              Get in Touch
            </button>
          </div>
        </div>
      </section>

      {/* 2. "What We Do" Grid */}
      <section className="py-section-gap relative max-w-container-max mx-auto px-margin-desktop">
        <div className="mb-16">
          <span className={`font-label-sm uppercase tracking-[0.2em] mb-4 block ${
            theme === 'dark' ? 'text-[#00f0ff]' : 'text-[#0052FF]'
          }`}>Our Expertise</span>
          <h2 className="font-display-lg text-4xl md:text-display-lg font-bold">What we do</h2>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-gutter">
          {/* Design */}
          <div className="glass-card p-10 group hover:-translate-y-2 transition-transform duration-500 rounded-2xl">
            <div className="w-16 h-16 rounded-2xl bg-[#00f0ff]/10 flex items-center justify-center mb-8 border border-[#00f0ff]/20">
              <span className="material-symbols-outlined text-[#00f0ff] text-3xl">brush</span>
            </div>
            <h3 className="font-headline-lg text-2xl font-bold mb-4">Design</h3>
            <p className="text-on-surface-variant leading-relaxed text-sm">
              Crafting immersive digital experiences through high-fidelity visual narratives and user-centric architecture that resonates globally.
            </p>
          </div>

          {/* AI Integration */}
          <div className="glass-card p-10 group hover:-translate-y-2 transition-transform duration-500 rounded-2xl">
            <div className="w-16 h-16 rounded-2xl bg-purple-500/10 flex items-center justify-center mb-8 border border-purple-500/20">
              <span className="material-symbols-outlined text-purple-400 text-3xl">psychology</span>
            </div>
            <h3 className="font-headline-lg text-2xl font-bold mb-4">AI Integration</h3>
            <p className="text-on-surface-variant leading-relaxed text-sm">
              Embedding intelligent automation and predictive modeling into existing workflows to redefine operational efficiency.
            </p>
          </div>

          {/* Technical Development */}
          <div className="glass-card p-10 group hover:-translate-y-2 transition-transform duration-500 rounded-2xl">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 flex items-center justify-center mb-8 border border-emerald-500/20">
              <span className="material-symbols-outlined text-emerald-400 text-3xl">terminal</span>
            </div>
            <h3 className="font-headline-lg text-2xl font-bold mb-4">Technical Development</h3>
            <p className="text-on-surface-variant leading-relaxed text-sm">
              High-performance engineering that scales. Robust backend architectures built for precision, speed, and absolute reliability.
            </p>
          </div>

          {/* Digital Marketing */}
          <div className="glass-card p-10 group hover:-translate-y-2 transition-transform duration-500 rounded-2xl">
            <div className="w-16 h-16 rounded-2xl bg-orange-500/10 flex items-center justify-center mb-8 border border-orange-500/20">
              <span className="material-symbols-outlined text-orange-400 text-3xl">trending_up</span>
            </div>
            <h3 className="font-headline-lg text-2xl font-bold mb-4">Digital Marketing</h3>
            <p className="text-on-surface-variant leading-relaxed text-sm">
              Accelerating brand authority and organic reach through data-driven SEO, strategic content marketing, and hyper-targeted conversion optimization.
            </p>
          </div>
        </div>
      </section>

      {/* 3. The Development Process */}
      <section className="py-section-gap relative overflow-hidden bg-black/5 dark:bg-white/5">
        <div className="max-w-container-max mx-auto px-margin-desktop relative z-10">
          <div className="text-center mb-20">
            <span className={`font-label-sm uppercase tracking-[0.2em] mb-4 block ${
              theme === 'dark' ? 'text-[#00f0ff]' : 'text-[#0052FF]'
            }`}>Our Workflow</span>
            <h2 className="font-display-lg text-4xl md:text-display-lg font-bold">The Development Process</h2>
          </div>

          <div className="relative grid grid-cols-1 md:grid-cols-4 gap-gutter">
            {/* Neon line connector */}
            <div className={`hidden md:block absolute top-1/2 left-0 w-full h-[1px] -translate-y-1/2 z-0 ${
              theme === 'dark' 
                ? 'bg-gradient-to-r from-transparent via-[#00f0ff]/30 to-transparent' 
                : 'bg-gradient-to-r from-transparent via-[#0052FF]/30 to-transparent'
            }`} />

            {[
              { id: '01', title: 'Consultation', desc: 'Deep dive into your vision and technical requirements.' },
              { id: '02', title: 'Strategy', desc: 'Mapping out architecture and scalable solutions.' },
              { id: '03', title: 'Design', desc: 'High-fidelity UI/UX and visual prototyping.' },
              { id: '04', title: 'Live Development', desc: 'Agile engineering and rigorous performance testing.' }
            ].map(step => (
              <div key={step.id} className="relative z-10">
                <div className="glass-card p-8 rounded-2xl text-center hover:shadow-[0_0_30px_rgba(0,240,255,0.15)] hover:-translate-y-2 transition-all duration-500 group">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-6 mx-auto border font-bold transition-all ${
                    theme === 'dark' 
                      ? 'bg-[#00f0ff]/10 border-[#00f0ff]/40 text-[#00f0ff] group-hover:bg-[#00f0ff] group-hover:text-black' 
                      : 'bg-[#0052FF]/10 border-[#0052FF]/40 text-[#0052FF] group-hover:bg-[#0052FF] group-hover:text-white'
                  }`}>
                    {step.id}
                  </div>
                  <h3 className="font-headline-lg text-lg font-bold mb-3">{step.title}</h3>
                  <p className="text-on-surface-variant text-xs">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. Technology Stack Grid */}
      <section className="py-section-gap max-w-container-max mx-auto px-margin-desktop">
        <div className="text-center mb-16">
          <span className={`font-label-sm uppercase tracking-[0.2em] mb-4 block ${
            theme === 'dark' ? 'text-[#00f0ff]' : 'text-[#0052FF]'
          }`}>The Stack</span>
          <h2 className="font-display-lg text-4xl md:text-display-lg font-bold">Powering Digital Innovation</h2>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-6">
          {[
            { name: 'Rust', img: 'https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/rust.svg' },
            { name: 'TypeScript', img: 'https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/typescript.svg' },
            { name: 'React', img: 'https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/react.svg' },
            { name: 'Python', img: 'https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/python.svg' },
            { name: 'AWS', img: 'https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/amazonaws.svg' },
            { name: 'OpenAI', img: 'https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/openai.svg' }
          ].map(tech => (
            <div 
              key={tech.name} 
              className={`glass-card p-6 rounded-2xl flex flex-col items-center justify-center group hover:border-[#00f0ff]/50 transition-all cursor-default`}
            >
              <img 
                alt={tech.name} 
                className="w-10 h-10 mb-3 opacity-60 group-hover:opacity-100 group-hover:scale-110 transition-all filter brightness-[100]" 
                src={tech.img} 
                style={{ filter: theme === 'dark' ? 'brightness(0) invert(1)' : 'none' }}
              />
              <span className="font-label-sm text-[10px] text-on-surface-variant group-hover:text-primary transition-colors uppercase tracking-widest">{tech.name}</span>
            </div>
          ))}
        </div>
      </section>

      {/* 5. Featured Showcase Pinned items */}
      <section id="showcase" className="py-section-gap bg-black/5 dark:bg-white/5">
        <div className="max-w-container-max mx-auto px-margin-desktop">
          <div className="flex justify-between items-end mb-16">
            <div>
              <span className={`font-label-sm uppercase tracking-[0.2em] mb-4 block ${
                theme === 'dark' ? 'text-[#00f0ff]' : 'text-[#0052FF]'
              }`}>Showcase</span>
              <h2 className="font-display-lg text-4xl md:text-display-lg font-bold">Our Masterpieces</h2>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-gutter">
            {pinnedProjects.map(project => (
              <div 
                key={project._id} 
                className="group relative overflow-hidden rounded-[2rem] glass-card h-[500px]"
              >
                <div className="h-full w-full overflow-hidden">
                  <img 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 brightness-75 group-hover:brightness-95" 
                    src={project.imageUrl}
                    alt={project.title}
                  />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
                
                <div className="absolute bottom-0 left-0 p-10 w-full text-white">
                  <span className="text-xs font-bold uppercase tracking-widest text-[#00f0ff] mb-2 block">{project.category}</span>
                  <h3 className="font-headline-lg text-2xl font-bold mb-3">{project.title}</h3>
                  <p className="text-gray-300 text-sm mb-6 max-w-md line-clamp-2">{project.description}</p>
                  <button 
                    onClick={() => setSelectedProject(project)}
                    className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full border border-white/20 hover:bg-white hover:text-black transition-all font-semibold"
                  >
                    View Details 
                    <span className="material-symbols-outlined text-sm">north_east</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. Core Team Members (Pinned) */}
      <section className="py-section-gap max-w-container-max mx-auto px-margin-desktop">
        <div className="text-center mb-16">
          <h2 className="font-display-lg text-4xl md:text-display-lg font-bold mb-4">The Minds Behind the Magic</h2>
          <p className="text-on-surface-variant max-w-2xl mx-auto text-sm">
            A collective of visionary engineers and designers dedicated to pushing the boundaries of what is possible in the digital realm.
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-12">
          {pinnedTeam.map((member, i) => (
            <div key={member._id} className="flex flex-col items-center group">
              <div className={`relative w-48 h-48 mb-6 p-2 rounded-full border transition-colors duration-500 ${
                i % 2 === 0 ? 'border-[#00f0ff]/30 group-hover:border-[#00f0ff]' : 'border-purple-500/30 group-hover:border-purple-500'
              }`}>
                <img 
                  className="w-full h-full object-cover rounded-full filter grayscale group-hover:grayscale-0 transition-all duration-500" 
                  src={member.imageUrl}
                  alt={member.name}
                />
                <div className={`absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity ${
                  i % 2 === 0 ? 'bg-gradient-to-tr from-[#00f0ff]/20 to-transparent' : 'bg-gradient-to-tr from-purple-500/20 to-transparent'
                }`} />
              </div>
              <h4 className="font-headline-lg text-xl font-bold mb-1">{member.name}</h4>
              <span className="text-on-surface-variant font-label-sm uppercase tracking-widest text-[10px]">{member.role}</span>
            </div>
          ))}
        </div>
      </section>

      {/* 7. Client Testimonials Slider */}
      {reviews.length > 0 && (
        <section className="py-section-gap relative overflow-hidden bg-black/5 dark:bg-white/5">
          <div className="max-w-container-max mx-auto px-margin-desktop">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 gap-6">
              <div>
                <span className={`font-label-sm uppercase tracking-[0.2em] mb-4 block ${
                  theme === 'dark' ? 'text-[#00f0ff]' : 'text-[#0052FF]'
                }`}>Feedback</span>
                <h2 className="font-display-lg text-4xl md:text-display-lg font-bold">Client Testimonials</h2>
              </div>
              <div className="flex gap-4">
                <button 
                  onClick={() => setIsReviewModalOpen(true)}
                  className="primary-gradient-btn px-6 py-2.5 rounded-full text-xs font-bold text-black shadow-lg flex items-center gap-2"
                >
                  <span className="material-symbols-outlined text-[16px] fill-1">rate_review</span>
                  Leave a Review
                </button>
                <button 
                  onClick={prevReview}
                  className="w-11 h-11 rounded-full glass-card flex items-center justify-center hover:bg-primary/10 transition-all"
                >
                  <span className="material-symbols-outlined">chevron_left</span>
                </button>
                <button 
                  onClick={nextReview}
                  className="w-11 h-11 rounded-full glass-card flex items-center justify-center hover:bg-primary/10 transition-all"
                >
                  <span className="material-symbols-outlined">chevron_right</span>
                </button>
              </div>
            </div>

            <div className="relative h-64 md:h-52 w-full max-w-4xl mx-auto flex items-center justify-center">
              {reviews.map((rev, i) => (
                <div 
                  key={rev._id}
                  className={`absolute inset-0 glass-card p-8 md:p-10 rounded-2xl flex flex-col justify-between transition-all duration-700 transform ${
                    i === currentReviewIdx 
                      ? 'opacity-100 translate-x-0 scale-100 z-10' 
                      : 'opacity-0 translate-x-12 scale-95 pointer-events-none'
                  }`}
                >
                  <div>
                    <div className="flex text-[#00f0ff] mb-4">
                      {Array.from({ length: rev.rating }).map((_, starIdx) => (
                        <span key={starIdx} className="material-symbols-outlined fill-1 text-sm">star</span>
                      ))}
                    </div>
                    <p className="text-md md:text-lg italic text-on-surface leading-relaxed line-clamp-3">
                      "{rev.feedback}"
                    </p>
                  </div>
                  <div className="flex items-center gap-4 mt-6">
                    <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center border border-white/5">
                      <span className="material-symbols-outlined text-sm">person</span>
                    </div>
                    <div>
                      <h4 className="font-bold text-sm leading-tight">{rev.name}</h4>
                      <span className="text-[10px] text-on-surface-variant uppercase tracking-widest">{rev.companyWebsite}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 8. FAQs Accordion */}
      <section className="py-section-gap relative max-w-3xl mx-auto px-margin-mobile">
        <div className="text-center mb-16">
          <span className={`font-label-sm uppercase tracking-[0.2em] mb-4 block ${
            theme === 'dark' ? 'text-[#00f0ff]' : 'text-[#0052FF]'
          }`}>Knowledge Base</span>
          <h2 className="font-display-lg text-3xl md:text-4xl font-bold">Frequently Asked Questions</h2>
        </div>

        <div className="space-y-4">
          {[
            { q: 'What industries do you specialize in?', a: 'We specialize in FinTech, Logistics, AI-driven Healthcare, and high-end luxury e-commerce. Our solutions are built for global scale and mission-critical reliability.' },
            { q: 'How long does a typical project take?', a: 'Timeline varies based on complexity. MVP development usually takes 8-12 weeks, while full enterprise digital transformations can range from 6 months to a year.' },
            { q: 'Do you offer post-launch support?', a: 'Absolutely. We provide comprehensive SLAs for hosting, maintenance, and continuous optimization to ensure your platform stays ahead of the curve.' }
          ].map((faq, i) => (
            <div 
              key={i} 
              className={`accordion-item glass-card rounded-xl border border-white/10 overflow-hidden ${
                faqActive[i] ? 'active' : ''
              }`}
            >
              <button 
                className="w-full p-6 text-left flex justify-between items-center focus:outline-none"
                onClick={() => toggleFaq(i)}
              >
                <span className="font-bold text-sm md:text-md">{faq.q}</span>
                <span className="material-symbols-outlined accordion-icon transition-transform">expand_more</span>
              </button>
              <div className="accordion-content">
                <div className="p-6 pt-0 text-on-surface-variant text-sm border-t border-white/5 bg-black/5 dark:bg-white/5">
                  {faq.a}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 9. Contact & WhatsApp CTA */}
      <section className="py-section-gap max-w-container-max mx-auto px-margin-desktop">
        <div className="glass-card rounded-[2.5rem] p-8 md:p-16 flex flex-col md:flex-row gap-16 overflow-hidden relative">
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-[#00f0ff]/10 blur-[100px] rounded-full pointer-events-none" />

          {/* Contact form */}
          <div className="flex-1 z-10">
            <h2 className="font-display-lg text-3xl md:text-4xl font-extrabold mb-8 tracking-tight">Ready to Build the Future?</h2>
            
            {contactSuccess ? (
              <div className="p-8 text-center flex flex-col items-center gap-3 bg-[#00f0ff]/10 border border-[#00f0ff]/20 rounded-2xl">
                <span className="material-symbols-outlined text-[#00f0ff] text-4xl">check_circle</span>
                <h4 className="font-bold text-lg">Proposal Transmitted</h4>
                <p className="text-on-surface-variant text-sm">We'll get back to you shortly.</p>
              </div>
            ) : (
              <form onSubmit={handleContactSubmit} className="space-y-6">
                {contactError && (
                  <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-500 rounded-lg text-sm">
                    {contactError}
                  </div>
                )}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <input 
                    className={`border rounded-xl px-6 py-4 focus:outline-none w-full text-sm ${
                      theme === 'dark' ? 'bg-white/5 border-white/10 text-white focus:border-[#00f0ff]' : 'bg-[#f8f9fa] border-black/10 text-black focus:border-[#0052FF]'
                    }`}
                    placeholder="Your Name" 
                    type="text"
                    value={contactName}
                    onChange={e => setContactName(e.target.value)}
                    required
                  />
                  <input 
                    className={`border rounded-xl px-6 py-4 focus:outline-none w-full text-sm ${
                      theme === 'dark' ? 'bg-white/5 border-white/10 text-white focus:border-[#00f0ff]' : 'bg-[#f8f9fa] border-black/10 text-black focus:border-[#0052FF]'
                    }`}
                    placeholder="Email Address" 
                    type="email"
                    value={contactEmail}
                    onChange={e => setContactEmail(e.target.value)}
                    required
                  />
                  <input 
                    className={`border rounded-xl px-6 py-4 focus:outline-none w-full text-sm ${
                      theme === 'dark' ? 'bg-white/5 border-white/10 text-white focus:border-[#00f0ff]' : 'bg-[#f8f9fa] border-black/10 text-black focus:border-[#0052FF]'
                    }`}
                    placeholder="WhatsApp Number" 
                    type="tel"
                    value={contactWhatsapp}
                    onChange={e => setContactWhatsapp(e.target.value)}
                    required
                  />
                </div>
                <textarea 
                  className={`border rounded-xl px-6 py-4 focus:outline-none w-full text-sm h-32 resize-none ${
                    theme === 'dark' ? 'bg-white/5 border-white/10 text-white focus:border-[#00f0ff]' : 'bg-[#f8f9fa] border-black/10 text-black focus:border-[#0052FF]'
                  }`}
                  placeholder="Tell us about your project..." 
                  value={contactMsg}
                  onChange={e => setContactMsg(e.target.value)}
                  required
                />

                <div>
                  <label className="block text-[11px] font-semibold text-on-surface-variant mb-2 uppercase tracking-widest">
                    Attach Document / Image (Link or Upload)
                  </label>
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      placeholder="Paste document link or image URL..."
                      className={`flex-grow border rounded-xl px-6 py-4 focus:outline-none w-full text-sm ${
                        theme === 'dark' 
                          ? 'bg-white/5 border-white/10 text-white focus:border-[#00f0ff]' 
                          : 'bg-[#f8f9fa] border-black/10 text-black focus:border-[#0052FF]'
                      }`}
                      value={contactAttachmentUrl} 
                      onChange={e => setContactAttachmentUrl(e.target.value)} 
                    />
                    <label className={`shrink-0 cursor-pointer border rounded-xl px-4 py-3 text-sm font-semibold flex items-center justify-center transition-all ${
                      theme === 'dark' 
                        ? 'bg-white/5 border-white/10 text-white hover:bg-white/10' 
                        : 'bg-black/5 border-black/10 text-black hover:bg-black/10'
                    }`}>
                      <span className="material-symbols-outlined text-[18px] mr-1">
                        {contactUploading ? 'sync' : 'cloud_upload'}
                      </span>
                      {contactUploading ? 'Uploading...' : 'Upload'}
                      <input 
                        type="file"
                        accept="image/*,application/pdf,.doc,.docx,.txt"
                        className="hidden"
                        onChange={async (e) => {
                          const file = e.target.files[0];
                          if (!file) return;

                          setContactUploading(true);
                          const formData = new FormData();
                          formData.append('image', file);

                          try {
                            const res = await fetch('http://localhost:5000/api/upload', {
                              method: 'POST',
                              body: formData
                            });

                            if (res.ok) {
                              const data = await res.json();
                              setContactAttachmentUrl(data.fileUrl);
                            } else {
                              const errData = await res.json();
                              alert(errData.msg || 'Upload failed');
                            }
                          } catch (err) {
                            console.error('File upload failed:', err);
                            alert('Error uploading file');
                          } finally {
                            setContactUploading(false);
                          }
                        }}
                      />
                    </label>
                  </div>
                </div>

                <button 
                  type="submit"
                  disabled={contactUploading}
                  className={`w-full py-4 rounded-xl font-bold flex items-center justify-center transition-all ${
                    theme === 'dark'
                      ? 'primary-gradient-btn text-black'
                      : 'bg-[#0052FF] text-white hover:bg-[#003bbb] shadow-md shadow-[#0052FF]/20'
                  } disabled:opacity-50`}
                >
                  Send Proposal
                </button>
              </form>
            )}
          </div>

          {/* WhatsApp Direct */}
          <div className="flex-1 flex flex-col justify-center items-center md:items-start text-center md:text-left z-10">
            <div className="mb-8 p-8 bg-white/5 dark:bg-black/20 rounded-3xl border border-white/10">
              <span className={`material-symbols-outlined text-6xl mb-4 ${
                theme === 'dark' ? 'text-[#00f0ff]' : 'text-[#0052FF]'
              }`}>chat_bubble</span>
              <h3 className="font-headline-lg text-xl font-bold mb-2">Instant Consultation</h3>
              <p className="text-on-surface-variant text-sm">Skip the queue and talk to an architect directly about your vision.</p>
            </div>
            
            <a 
              className="inline-flex items-center gap-3 px-8 py-4 bg-[#25D366]/20 border border-[#25D366]/40 hover:bg-[#25D366] hover:text-white transition-all rounded-full text-[#25D366] font-bold group" 
              href="https://wa.me/41221234567" 
              target="_blank" 
              rel="noreferrer"
            >
              <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
              </svg>
              WhatsApp Architect
            </a>
          </div>
        </div>
      </section>

      {/* Case Study Details Modal */}
      <ProjectModal 
        isOpen={selectedProject !== null}
        onClose={() => setSelectedProject(null)}
        project={selectedProject}
      />

      {/* Leave a Review Modal */}
      <LeaveReviewModal 
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
      />
    </div>
  );
};
