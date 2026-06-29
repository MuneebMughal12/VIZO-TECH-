import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';

export const About = ({ onContactClick }) => {
  const { theme } = useTheme();
  const navigate = useNavigate();

  const milestones = [
    {
      year: '2018',
      title: 'Founding in Zurich',
      desc: 'Launched with a core team of 5 engineers, focusing on high-frequency trading platforms and extreme performance systems.',
      colorClass: theme === 'dark' ? 'bg-[#00f0ff] neon-glow-primary' : 'bg-[#0052FF]'
    },
    {
      year: '2020',
      title: 'The Expansion',
      desc: 'Opened our London and Singapore offices, scaling to over 50 professionals across three continents to support global infrastructure demands.',
      colorClass: 'bg-purple-500 shadow-[0_0_20px_rgba(168,85,247,0.4)]'
    },
    {
      year: '2022',
      title: 'VIZO Protocol Framework',
      desc: 'Developed our proprietary design-to-code framework, reducing deployment cycles for Fortune 500 partners by 60%.',
      colorClass: theme === 'dark' ? 'bg-[#00f0ff] neon-glow-primary' : 'bg-[#0052FF]'
    },
    {
      year: 'Present',
      title: 'Autonomous Intelligence',
      desc: 'Integrating state-of-the-art neural architectures and LLM cognitive layers into mainstream corporate digital infrastructure.',
      colorClass: 'bg-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.4)]'
    }
  ];

  return (
    <main className="relative pt-24 md:pt-32 pb-section-gap">
      {/* Background Blurs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-[10%] right-[-10%] w-[500px] h-[500px] bg-purple-500/10 blur-[120px] rounded-full animate-float" />
        <div className="absolute bottom-[20%] left-[-5%] w-[400px] h-[400px] bg-[#00f0ff]/5 blur-[120px] rounded-full animate-float" style={{ animationDelay: '-4s' }} />
      </div>

      {/* 1. Hero / Our Story */}
      <section className="max-w-container-max mx-auto px-margin-desktop py-12">
        <div className="flex flex-col gap-6 max-w-4xl">
          <span className={`font-label-sm text-sm uppercase tracking-[0.2em] font-semibold ${
            theme === 'dark' ? 'text-[#00f0ff]' : 'text-[#0052FF]'
          }`}>Crafting the future</span>
          <h1 className="font-display-xl text-4xl md:text-display-xl font-extrabold tracking-tight">Our Story</h1>
          <p className="font-body-lg text-md md:text-body-lg text-on-surface-variant leading-relaxed">
            Born from the intersection of architectural precision and digital avant-garde, VIZO TECH began as a small collective of engineering virtuosos in Zurich. We believed that technology should not just function, but inspire—carrying the weight of legacy with the lightness of modern innovation. Today, we stand as an international beacon for brands seeking to transcend the ordinary.
          </p>
        </div>
      </section>

      {/* 2. Mission & Vision */}
      <section className="max-w-container-max mx-auto px-margin-desktop py-section-gap">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-gutter">
          {/* Mission */}
          <div className="glass-card p-10 md:p-12 rounded-2xl flex flex-col gap-6 hover:-translate-y-2 transition-all duration-500 shadow-2xl">
            <div className="w-16 h-16 rounded-full bg-[#00f0ff]/10 flex items-center justify-center border border-[#00f0ff]/20">
              <span className="material-symbols-outlined text-[#00f0ff] text-3xl fill-1">rocket_launch</span>
            </div>
            <h3 className="font-headline-lg text-2xl font-bold">Mission</h3>
            <p className="font-body-md text-sm text-on-surface-variant leading-relaxed">
              To architect digital ecosystems that define the next generation of human-computer interaction, prioritizing elegant engineering and uncompromising aesthetic value for the world's most ambitious organizations.
            </p>
          </div>

          {/* Vision */}
          <div className="glass-card p-10 md:p-12 rounded-2xl flex flex-col gap-6 hover:-translate-y-2 transition-all duration-500 shadow-2xl">
            <div className="w-16 h-16 rounded-full bg-purple-500/10 flex items-center justify-center border border-purple-500/20">
              <span className="material-symbols-outlined text-purple-400 text-3xl fill-1">visibility</span>
            </div>
            <h3 className="font-headline-lg text-2xl font-bold">Vision</h3>
            <p className="font-body-md text-sm text-on-surface-variant leading-relaxed">
              To remain the global standard for engineering excellence, where the complexity of the backend is met with the breathtaking simplicity of the frontend, bridging the gap between imagination and implementation.
            </p>
          </div>
        </div>
      </section>

      {/* 3. Milestone Timeline */}
      <section className="max-w-container-max mx-auto px-margin-desktop py-section-gap">
        <div className="text-center mb-20">
          <h2 className="font-display-lg text-3xl md:text-display-lg font-bold">Defining Moments</h2>
          <div className={`w-20 h-1 mx-auto mt-6 rounded-full ${
            theme === 'dark' ? 'bg-[#00f0ff]' : 'bg-[#0052FF]'
          }`} />
        </div>

        <div className="relative max-w-4xl mx-auto">
          {/* Central Line */}
          <div className="absolute left-1/2 -translate-x-1/2 h-full w-[2px] timeline-line hidden md:block" />

          <div className="space-y-16">
            {milestones.map((milestone, idx) => {
              const isEven = idx % 2 === 0;
              return (
                <div key={idx} className="relative flex flex-col md:flex-row items-center justify-between w-full">
                  {/* Left Column (Desktop) */}
                  <div className={`w-full md:w-[45%] order-2 md:order-1 ${
                    isEven ? 'text-center md:text-right md:pr-12' : 'text-center md:text-left md:pl-12 md:order-3'
                  } mt-4 md:mt-0`}>
                    <span className={`font-label-sm text-sm font-semibold mb-2 block ${
                      theme === 'dark' ? 'text-[#00f0ff]' : 'text-[#0052FF]'
                    }`}>{milestone.year}</span>
                    <h4 className="font-headline-lg text-xl font-bold mb-3">{milestone.title}</h4>
                    <p className="font-body-md text-xs md:text-sm text-on-surface-variant leading-relaxed">{milestone.desc}</p>
                  </div>

                  {/* Graphic Dot */}
                  <div className={`z-10 w-6 h-6 rounded-full border-4 border-black dark:border-[#050505] order-1 md:order-2 ${milestone.colorClass}`} />

                  {/* Right Column Spacer (Desktop) */}
                  <div className={`hidden md:block w-[45%] order-3 ${isEven ? 'md:order-3' : 'md:order-1'}`} />
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 4. CTA Section */}
      <section className="max-w-container-max mx-auto px-margin-desktop py-section-gap">
        <div className="relative glass-card rounded-3xl overflow-hidden p-12 md:p-16 text-center shadow-2xl">
          <div className="absolute -top-12 -left-12 w-48 h-48 bg-purple-500/10 blur-[80px] rounded-full" />
          
          <div className="relative z-10 space-y-8">
            <h2 className="font-display-lg text-3xl md:text-4xl font-extrabold tracking-tight">Ready to Build the Future?</h2>
            <p className="font-body-lg text-sm md:text-body-lg text-on-surface-variant max-w-2xl mx-auto leading-relaxed">
              Partner with a team that views code as craft and every interface as a masterpiece.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-6">
              <button 
                onClick={onContactClick}
                className="px-10 py-4 bg-gradient-to-r from-[#00f0ff] to-[#9d05ff] text-black font-bold rounded-full hover:scale-105 transition-transform duration-300 shadow-md shadow-[#00f0ff]/10"
              >
                Start a Project
              </button>
              <button 
                onClick={() => navigate('/team')}
                className="px-10 py-4 glass-card text-on-surface font-bold rounded-full hover:bg-white/10 dark:hover:bg-black/20 transition-all duration-300"
              >
                Meet the Team
              </button>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};
