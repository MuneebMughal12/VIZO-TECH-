import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import * as THREE from 'three';
import { useTheme } from '../context/ThemeContext';
import API_URL from '../config/api';
import { ProjectModal } from '../components/ProjectModal';
import { LeaveReviewModal } from '../components/LeaveReviewModal';
import { TeamCarousel } from '../components/TeamCarousel';
import { TechSlider } from '../components/TechSlider';

export const Home = ({ onContactClick }) => {
  const { theme } = useTheme();
  const mountRef = useRef(null);

  // States
  const [pinnedProjects, setPinnedProjects] = useState([]);
  const [pinnedPackages, setPinnedPackages] = useState([]);
  const [servicesMap, setServicesMap] = useState({});
  const [team, setTeam] = useState([]);
  const [reviews, setReviews] = useState([
    {
      _id: 'default-1',
      name: 'Jonathan Reeve',
      companyWebsite: 'CTO, NexaCorp',
      rating: 5,
      feedback: 'VIZO TECH transformed our legacy architecture into a high-performance ecosystem. Their attention to technical detail is unparalleled.'
    },
    {
      _id: 'default-2',
      name: 'Sarah Jenkins',
      companyWebsite: 'Creative Lead, Luminous',
      rating: 5,
      feedback: 'The design team at VIZO TECH understood our brand aesthetic perfectly. The resulting UI is both futuristic and incredibly intuitive.'
    }
  ]);
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
      // Fetch all endpoints concurrently
      const [sRes, pkgRes, pRes, tRes, rRes] = await Promise.all([
        fetch(`${API_URL}/api/services`),
        fetch(`${API_URL}/api/packages?isPinned=true&isActive=true`),
        fetch(`${API_URL}/api/projects`),
        fetch(`${API_URL}/api/team?pinned=true`),
        fetch(`${API_URL}/api/reviews`)
      ]);

      if (sRes.ok) {
        const sData = await sRes.json();
        const sMap = {};
        sData.forEach(s => {
          sMap[s._id] = s.name;
        });
        setServicesMap(sMap);
      }

      if (pkgRes.ok) {
        const pkgData = await pkgRes.json();
        setPinnedPackages(pkgData);
      }

      if (pRes.ok) {
        const pData = await pRes.json();
        setPinnedProjects(pData.filter(p => p.isPinnedHome === true));
      }

      if (tRes.ok) {
        const tData = await tRes.json();
        setTeam(tData);
      }

      if (rRes.ok) {
        const rData = await rRes.json();
        if (rData && rData.length > 0) {
          setReviews(rData);
        }
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
      const res = await fetch(`${API_URL}/api/inquiries`, {
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
          <span className={`font-label-sm uppercase tracking-[0.2em] mb-4 block ${theme === 'dark' ? 'text-[#00f0ff]' : 'text-[#0052FF]'
            }`}>Our Expertise</span>
          <h2 className="font-display-lg text-4xl md:text-display-lg font-bold">What we do</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-gutter">
          {/* Design */}
          <Link to="/services?tab=design" className="glass-card p-10 group hover:-translate-y-2 transition-transform duration-500 rounded-2xl block">
            <div className="w-16 h-16 rounded-2xl bg-[#00f0ff]/10 flex items-center justify-center mb-8 border border-[#00f0ff]/20">
              <span className="material-symbols-outlined text-[#00f0ff] text-3xl">brush</span>
            </div>
            <h3 className="font-headline-lg text-2xl font-bold mb-4">Design</h3>
            <p className="text-on-surface-variant leading-relaxed text-sm">
              Crafting immersive digital experiences through high-fidelity visual narratives and user-centric architecture that resonates globally.
            </p>
          </Link>

          {/* AI Integration */}
          <Link to="/services?tab=ai" className="glass-card p-10 group hover:-translate-y-2 transition-transform duration-500 rounded-2xl block">
            <div className="w-16 h-16 rounded-2xl bg-purple-500/10 flex items-center justify-center mb-8 border border-purple-500/20">
              <span className="material-symbols-outlined text-purple-400 text-3xl">psychology</span>
            </div>
            <h3 className="font-headline-lg text-2xl font-bold mb-4">AI Integration</h3>
            <p className="text-on-surface-variant leading-relaxed text-sm">
              Embedding intelligent automation and predictive modeling into existing workflows to redefine operational efficiency.
            </p>
          </Link>

          {/* Technical Development */}
          <Link to="/services?tab=development" className="glass-card p-10 group hover:-translate-y-2 transition-transform duration-500 rounded-2xl block">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 flex items-center justify-center mb-8 border border-emerald-500/20">
              <span className="material-symbols-outlined text-emerald-400 text-3xl">terminal</span>
            </div>
            <h3 className="font-headline-lg text-2xl font-bold mb-4">Technical Development</h3>
            <p className="text-on-surface-variant leading-relaxed text-sm">
              High-performance engineering that scales. Robust backend architectures built for precision, speed, and absolute reliability.
            </p>
          </Link>

          {/* Digital Marketing */}
          <Link to="/services?tab=digital-marketing" className="glass-card p-10 group hover:-translate-y-2 transition-transform duration-500 rounded-2xl block">
            <div className="w-16 h-16 rounded-2xl bg-orange-500/10 flex items-center justify-center mb-8 border border-orange-500/20">
              <span className="material-symbols-outlined text-orange-400 text-3xl">trending_up</span>
            </div>
            <h3 className="font-headline-lg text-2xl font-bold mb-4">Digital Marketing</h3>
            <p className="text-on-surface-variant leading-relaxed text-sm">
              Accelerating brand authority and organic reach through data-driven SEO, strategic content marketing, and hyper-targeted conversion optimization.
            </p>
          </Link>

          {/* Video Editing */}
          <Link to="/services?tab=video-editing" className="glass-card p-10 group hover:-translate-y-2 transition-transform duration-500 rounded-2xl block">
            <div className="w-16 h-16 rounded-2xl bg-rose-500/10 flex items-center justify-center mb-8 border border-rose-500/20">
              <span className="material-symbols-outlined text-rose-400 text-3xl">video_camera_back</span>
            </div>
            <h3 className="font-headline-lg text-2xl font-bold mb-4">Video Editing</h3>
            <p className="text-on-surface-variant leading-relaxed text-sm">
              Creating high-impact visual narratives, corporate showcase reels, and social media campaigns with cinematic editing, sound design, and color grading.
            </p>
          </Link>

          {/* Shopify */}
          <Link to="/services?tab=shopify" className="glass-card p-10 group hover:-translate-y-2 transition-transform duration-500 rounded-2xl block">
            <div className="w-16 h-16 rounded-2xl bg-[#96bf48]/10 flex items-center justify-center mb-8 border border-[#96bf48]/20">
              <span className="material-symbols-outlined text-[#96bf48] text-3xl">storefront</span>
            </div>
            <h3 className="font-headline-lg text-2xl font-bold mb-4">Shopify Development</h3>
            <p className="text-on-surface-variant leading-relaxed text-sm">
              Custom e-commerce architectures, bespoke theme development, app integrations, and conversion-optimized storefronts designed to scale your global sales.
            </p>
          </Link>
        </div>
      </section>

      {/* Featured Packages Section */}
      {pinnedPackages.length > 0 && (
        <section className="py-section-gap relative max-w-container-max mx-auto px-margin-desktop">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 gap-6">
            <div>
              <span className={`font-label-sm uppercase tracking-[0.2em] mb-4 block ${theme === 'dark' ? 'text-[#00f0ff]' : 'text-[#0052FF]'}`}>
                Specialized Offers
              </span>
              <h2 className="font-display-lg text-4xl md:text-display-lg font-bold">Featured Packages</h2>
            </div>
            <Link
              to="/services"
              className={`font-semibold text-sm transition-all flex items-center gap-1 hover:underline ${
                theme === 'dark' ? 'text-[#00f0ff]' : 'text-[#0052FF]'
              }`}
            >
              View Full Catalog
              <span className="material-symbols-outlined text-[16px]">arrow_right_alt</span>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-gutter">
            {pinnedPackages.map((pkg) => {
              const finalPrice = pkg.discountActive 
                ? pkg.price - (pkg.price * pkg.discountPercent / 100)
                : pkg.price;

              return (
                <div
                  key={pkg._id}
                  className="glass-card rounded-3xl p-8 flex flex-col justify-between hover:-translate-y-2 duration-500 shadow-2xl relative overflow-hidden group"
                >
                  <div className="space-y-6">
                    <div>
                      {/* Service Category Label */}
                      <span className="text-[10px] bg-white/10 border border-white/5 text-gray-300 font-extrabold uppercase px-2.5 py-1 rounded-full tracking-wider inline-block mb-3">
                        {servicesMap[pkg.serviceId] || 'Services'}
                      </span>
                      <h3 className="text-xl font-bold tracking-tight mb-2 truncate">{pkg.name}</h3>

                      {/* Pricing */}
                      <div className="flex items-baseline my-3">
                        <span className={`text-3xl font-black tracking-tight ${theme === 'dark' ? 'text-white' : 'text-[#1a1c1c]'}`}>
                          ${finalPrice}
                        </span>
                        {pkg.priceSuffix && (
                          <span className="text-xs text-on-surface-variant font-medium ml-1">
                            {pkg.priceSuffix}
                          </span>
                        )}
                        {pkg.discountActive && (
                          <div className="ml-2.5 flex flex-col">
                            <span className="text-[10px] text-on-surface-variant line-through font-semibold">
                              ${pkg.price}
                            </span>
                            <span className="text-[9px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-1.5 py-0.5 rounded font-extrabold uppercase tracking-wide mt-0.5">
                              {pkg.discountLabel || 'Sale'}
                            </span>
                          </div>
                        )}
                      </div>

                      <p className="text-xs text-on-surface-variant leading-relaxed line-clamp-2 mt-2">
                        {pkg.description}
                      </p>
                    </div>

                    {/* features (first 3-4 key features) */}
                    <div className="space-y-2.5 pt-4 border-t border-white/5">
                      <ul className="space-y-2">
                        {pkg.features.slice(0, 4).map((feat) => (
                          <li key={feat._id} className="flex items-start gap-2 text-xs truncate">
                            {feat.isIncluded ? (
                              <span className="material-symbols-outlined text-emerald-400 text-base shrink-0 select-none">check_circle</span>
                            ) : (
                              <span className="material-symbols-outlined text-red-500 text-base shrink-0 select-none">cancel</span>
                            )}
                            <span className={feat.isIncluded ? 'text-gray-300' : 'text-on-surface-variant line-through'}>
                              {feat.text}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <Link
                    to="/services"
                    className={`w-full mt-8 py-3 rounded-xl font-bold text-xs tracking-wider transition-all duration-300 flex items-center justify-center gap-1.5 ${
                      theme === 'dark'
                        ? 'bg-[#00f0ff] hover:bg-[#00dbe9] text-black shadow-lg shadow-[#00f0ff]/5'
                        : 'bg-[#0052FF] hover:bg-[#003bbb] text-white shadow-lg shadow-[#0052FF]/5'
                    }`}
                  >
                    Learn More
                    <span className="material-symbols-outlined text-[14px]">arrow_right_alt</span>
                  </Link>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Technology Auto-Slider (Marquee) */}
      <TechSlider />

      {/* 3. The Development Process */}
      <section className="py-section-gap relative overflow-hidden bg-black/5 dark:bg-white/5">
        <div className="max-w-container-max mx-auto px-margin-desktop relative z-10">
          <div className="text-center mb-20">
            <span className={`font-label-sm uppercase tracking-[0.2em] mb-4 block ${theme === 'dark' ? 'text-[#00f0ff]' : 'text-[#0052FF]'
              }`}>Our Workflow</span>
            <h2 className="font-display-lg text-4xl md:text-display-lg font-bold">The Development Process</h2>
          </div>

          <div className="relative grid grid-cols-1 md:grid-cols-4 gap-gutter">
            {/* Neon line connector */}
            <div className={`hidden md:block absolute top-1/2 left-0 w-full h-[1px] -translate-y-1/2 z-0 ${theme === 'dark'
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
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-6 mx-auto border font-bold transition-all ${theme === 'dark'
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

      {/* 5. Featured Showcase Pinned items */}
      <section id="showcase" className="py-section-gap bg-black/5 dark:bg-white/5">
        <div className="w-full px-3 sm:px-4 md:px-margin-desktop mx-auto max-w-container-max">
          <div className="flex justify-between items-end mb-16">
            <div>
              <span className={`font-label-sm uppercase tracking-[0.2em] mb-4 block ${theme === 'dark' ? 'text-[#00f0ff]' : 'text-[#0052FF]'
                }`}>Showcase</span>
              <h2 className="font-display-lg text-4xl md:text-display-lg font-bold">Our Masterpieces</h2>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-gutter">
            {pinnedProjects.map(project => (
              <div
                key={project._id}
                className="group relative flex flex-col bg-[#0d0d11]/90 border border-white/5 rounded-3xl overflow-hidden w-full hover:border-cyan-500/20 hover:shadow-2xl hover:shadow-cyan-500/5 transition-all duration-300"
              >
                <div className="w-full overflow-hidden shrink-0 relative">
                  <img
                    className="w-full h-[240px] md:h-[280px] object-cover object-top border-b border-white/5 group-hover:scale-105 transition-transform duration-700 brightness-75 group-hover:brightness-95"
                    src={project.thumbnail}
                    alt={project.title}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-60" />
                </div>

                <div className="w-full flex flex-col justify-between p-6 md:p-8 flex-grow space-y-4 text-white">
                  <div className="space-y-3">
                    <span className="text-xs font-bold uppercase tracking-widest text-[#00f0ff] block">{project.category}</span>
                    <h3 className="font-display-lg text-xl sm:text-2xl md:text-3xl font-bold tracking-tight leading-tight">{project.title}</h3>
                    <p className="text-gray-300 text-sm max-w-md line-clamp-2 lg:line-clamp-4">{project.description}</p>
                  </div>
                  <div>
                    <button
                      onClick={() => setSelectedProject(project)}
                      className="w-full py-3.5 flex items-center justify-center gap-2 text-sm sm:text-base font-semibold text-neutral-900 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-xl hover:scale-[1.01] transition-transform shadow-lg shadow-cyan-500/10"
                    >
                      View Case Study
                      <svg
                        className="w-4 h-4 stroke-[2.5] shrink-0"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. Core Team Members (3D Stacked Carousel) */}
      {team.length > 0 && (
        <section className="py-section-gap w-full px-3 sm:px-4 md:px-margin-desktop mx-auto max-w-container-max">
          <TeamCarousel members={team} />
        </section>
      )}

      {/* 7. Client Testimonials Slider */}
      {reviews.length > 0 && (
        <section className="py-section-gap relative overflow-hidden bg-black/5 dark:bg-white/5">
          <div className="max-w-container-max mx-auto px-4 sm:px-6 md:px-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 gap-6">
              <div>
                <span className={`font-label-sm uppercase tracking-[0.2em] mb-4 block ${theme === 'dark' ? 'text-[#00f0ff]' : 'text-[#0052FF]'
                  }`}>Feedback</span>
                <h2 className="font-display-lg text-4xl md:text-display-lg font-bold">Client Testimonials & Review Center</h2>
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

            <div className="relative h-auto min-h-[340px] xs:min-h-[295px] sm:min-h-[260px] md:min-h-52 w-full max-w-4xl mx-auto flex items-center justify-center">
              {reviews.map((rev, i) => (
                <div
                  key={rev._id}
                  className={`absolute inset-0 glass-card p-8 md:p-10 rounded-2xl flex flex-col justify-between transition-all duration-700 transform ${i === currentReviewIdx
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
      <section className="py-section-gap relative max-w-3xl mx-auto px-4 sm:px-6 md:px-8">
        <div className="text-center mb-16">
          <span className={`font-label-sm uppercase tracking-[0.2em] mb-4 block ${theme === 'dark' ? 'text-[#00f0ff]' : 'text-[#0052FF]'
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
              className={`accordion-item glass-card rounded-xl border border-white/10 overflow-hidden ${faqActive[i] ? 'active' : ''
                }`}
            >
              <button
                className="w-full p-6 text-left flex items-center justify-between gap-4 focus:outline-none"
                onClick={() => toggleFaq(i)}
              >
                <span className="font-bold text-sm md:text-base leading-snug">{faq.q}</span>
                <span className="material-symbols-outlined accordion-icon transition-transform shrink-0">expand_more</span>
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
      <section className="py-section-gap max-w-container-max mx-auto px-4 sm:px-6 md:px-margin-desktop">
        <div className="glass-card rounded-[2rem] p-6 sm:p-8 md:p-16 flex flex-col md:flex-row gap-10 md:gap-16 overflow-hidden relative">
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-[#00f0ff]/10 blur-[100px] rounded-full pointer-events-none" />

          {/* Contact form */}
          <div className="flex-1 z-10 w-full">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight mb-2">
              Ready to Build the Future?
            </h2>
            <p className="w-full max-w-sm text-sm sm:text-base leading-relaxed text-on-surface-variant mb-6 px-0">
              Fill out the form and an engineering architect will reach you shortly.
            </p>

            {contactSuccess ? (
              <div className="p-8 text-center flex flex-col items-center gap-3 bg-[#00f0ff]/10 border border-[#00f0ff]/20 rounded-2xl">
                <span className="material-symbols-outlined text-[#00f0ff] text-4xl">check_circle</span>
                <h4 className="font-bold text-lg">Proposal Transmitted</h4>
                <p className="text-on-surface-variant text-sm">We'll get back to you shortly.</p>
              </div>
            ) : (
              <form onSubmit={handleContactSubmit} className="space-y-4 md:space-y-5">
                {contactError && (
                  <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-500 rounded-lg text-sm">
                    {contactError}
                  </div>
                )}

                {/* Name / Email / WhatsApp — stacks to columns on md+ */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
                  <input
                    className={`w-full py-3 px-4 text-sm sm:text-base rounded-xl border outline-none transition-all ${
                      theme === 'dark'
                        ? 'bg-[#0f0f11]/80 border-white/10 text-white focus:border-cyan-500/50 placeholder:text-white/30'
                        : 'bg-[#f8f9fa] border-black/10 text-black focus:border-[#0052FF] placeholder:text-black/30'
                    }`}
                    placeholder="Your Name"
                    type="text"
                    value={contactName}
                    onChange={e => setContactName(e.target.value)}
                    required
                  />
                  <input
                    className={`w-full py-3 px-4 text-sm sm:text-base rounded-xl border outline-none transition-all ${
                      theme === 'dark'
                        ? 'bg-[#0f0f11]/80 border-white/10 text-white focus:border-cyan-500/50 placeholder:text-white/30'
                        : 'bg-[#f8f9fa] border-black/10 text-black focus:border-[#0052FF] placeholder:text-black/30'
                    }`}
                    placeholder="Email Address"
                    type="email"
                    value={contactEmail}
                    onChange={e => setContactEmail(e.target.value)}
                    required
                  />
                  <input
                    className={`w-full py-3 px-4 text-sm sm:text-base rounded-xl border outline-none transition-all ${
                      theme === 'dark'
                        ? 'bg-[#0f0f11]/80 border-white/10 text-white focus:border-cyan-500/50 placeholder:text-white/30'
                        : 'bg-[#f8f9fa] border-black/10 text-black focus:border-[#0052FF] placeholder:text-black/30'
                    }`}
                    placeholder="WhatsApp Number"
                    type="tel"
                    value={contactWhatsapp}
                    onChange={e => setContactWhatsapp(e.target.value)}
                    required
                  />
                </div>

                {/* Message */}
                <textarea
                  className={`w-full py-3 px-4 text-sm sm:text-base rounded-xl border outline-none transition-all h-28 sm:h-32 resize-none ${
                    theme === 'dark'
                      ? 'bg-[#0f0f11]/80 border-white/10 text-white focus:border-cyan-500/50 placeholder:text-white/30'
                      : 'bg-[#f8f9fa] border-black/10 text-black focus:border-[#0052FF] placeholder:text-black/30'
                  }`}
                  placeholder="Tell us about your project..."
                  value={contactMsg}
                  onChange={e => setContactMsg(e.target.value)}
                  required
                />

                {/* Attachment — stacks col on mobile */}
                <div>
                  <label className="block text-[10px] sm:text-[11px] font-semibold text-on-surface-variant mb-1.5 uppercase tracking-widest">
                    Attach Document / Image (Link or Upload)
                  </label>
                  <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center w-full">
                    <input
                      type="text"
                      placeholder="Paste document link or image URL..."
                      className={`flex-grow w-full py-3 px-4 text-sm sm:text-base rounded-xl border outline-none transition-all ${
                        theme === 'dark'
                          ? 'bg-[#0f0f11]/80 border-white/10 text-white focus:border-cyan-500/50 placeholder:text-white/30'
                          : 'bg-[#f8f9fa] border-black/10 text-black focus:border-[#0052FF] placeholder:text-black/30'
                      }`}
                      value={contactAttachmentUrl}
                      onChange={e => setContactAttachmentUrl(e.target.value)}
                    />
                    <label className={`shrink-0 cursor-pointer border rounded-xl px-4 py-3 text-sm font-semibold flex items-center justify-center gap-1.5 transition-all ${
                      theme === 'dark'
                        ? 'bg-white/5 border-white/10 text-white hover:bg-white/10'
                        : 'bg-black/5 border-black/10 text-black hover:bg-black/10'
                    }`}>
                      <span className="material-symbols-outlined text-[18px]">
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
                            const res = await fetch(`${API_URL}/api/upload`, {
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

                {/* Submit CTA */}
                <button
                  type="submit"
                  disabled={contactUploading}
                  className={`mt-4 w-full py-3.5 text-center font-semibold text-sm sm:text-base rounded-xl flex items-center justify-center gap-2 cursor-pointer hover:scale-[1.01] transition-transform disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 ${
                    theme === 'dark'
                      ? 'primary-gradient-btn text-black'
                      : 'bg-[#0052FF] text-white hover:bg-[#003bbb] shadow-md shadow-[#0052FF]/20'
                  }`}
                >
                  Send Proposal
                </button>
              </form>
            )}
          </div>

          {/* WhatsApp Direct */}
          <div className="flex-1 flex flex-col justify-center items-center md:items-start text-center md:text-left z-10">
            <div className="mb-8 p-6 sm:p-8 bg-white/5 dark:bg-black/20 rounded-3xl border border-white/10 w-full max-w-sm md:max-w-none">
              <span className={`material-symbols-outlined text-5xl sm:text-6xl mb-4 block ${theme === 'dark' ? 'text-[#00f0ff]' : 'text-[#0052FF]'}`}>
                chat_bubble
              </span>
              <h3 className="font-headline-lg text-xl font-bold mb-2">Instant Consultation</h3>
              <p className="text-on-surface-variant text-sm">Skip the queue and talk to an architect directly about your vision.</p>
            </div>

            <a
              className="inline-flex items-center gap-3 px-8 py-4 bg-[#25D366]/20 border border-[#25D366]/40 hover:bg-[#25D366] hover:text-white transition-all rounded-full text-[#25D366] font-bold group"
              href="https://wa.me/923351912047"
              target="_blank"
              rel="noreferrer"
            >
              <svg className="w-6 h-6 fill-current shrink-0" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
              </svg>
              WhatsApp
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
