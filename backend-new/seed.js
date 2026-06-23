const mongoose = require('mongoose');
const User = require('./models/User');
const TeamMember = require('./models/TeamMember');
const Project = require('./models/Project');
const Review = require('./models/Review');
const Settings = require('./models/Settings');
const connectDB = require('./db');

const seedDatabase = async () => {
  try {
    // Connect using our connection module
    await connectDB();

    // Clean existing data
    await User.deleteMany();
    await TeamMember.deleteMany();
    await Project.deleteMany();
    await Review.deleteMany();
    await Settings.deleteMany();
    console.log('Cleared existing collections');

    // Create Admin User
    const adminUser = new User({
      username: 'admin',
      password: 'admin123' // Will be hashed in User Schema pre-save hook
    });
    await adminUser.save();
    console.log('Seeded Admin: admin / admin123');

    // Create Settings
    const settings = new Settings({
      agencyName: 'VIZO TECH',
      adminEmail: 'admin@vizotech.agency',
      emailAlerts: true,
      systemStatusUpdates: false
    });
    await settings.save();
    console.log('Seeded settings');

    // Seed Team Members
    const team = [
      {
        name: 'Alex Rivera',
        role: 'Lead AI Architect',
        bio: 'Pioneering neural pathing algorithms and custom language models in high-performance enterprise systems.',
        imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCR-QQLeBSJfVl4deUcsv9zPSf5dlfGSor0s5MKL-Sr8KTehTiNEi47kjGPqH5BIK0_ijBF2XdMWCzWKLRMBDPSiW9ZiyWfH4oV1BhXki2_RDS1cYe_vkkcpqSqOUY7IYXGupNVYTAz0mO7Mk-IFNApImSx3rQON3Dr3vHyoZY8J3xVQUJcc60C63fdRxkGG3AnpuKUaGObURiVOL2p-3XkiuRFZCGm7UwWhjom96Rxkup5nl2jYz3sNmgN_ZO92XM_c5RcQShL6-NN',
        isPinnedHome: true
      },
      {
        name: 'Elena Vance',
        role: 'Senior Web3 Engineer',
        bio: 'Architecting decentralized consensus bridges and low-latency digital ledger technologies.',
        imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDes-_WY5tl3yQ-YbBh8xamO2kSRlRL-JsZJVDGmg5QWEj_3iE5Ptlti2yE8U4RxiPBW5tKXkF8b24VUtLVNy2qMhoKxDNa91Z6-m33r8reFzelBC3ZPS0ZMBhcqhXs8t0DqkMfAXxQZWZlc81upEuktkb1Z8hm3T8RRcXNUca36QalVaIuD3ZGS-7X6Fw9z3_5K681U5EpdaGMEKYF5g87Ez5oaaSt3s5EBS5An6nmsVtGuWWMK7rT9NlsF7AKIWM76rDpU9uPV-Qg',
        isPinnedHome: true
      },
      {
        name: 'Marcus Thorne',
        role: 'Creative Director',
        bio: 'Orchestrating premium visual identities and translating brand narratives into pixel-perfect digital systems.',
        imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBjyRilifxVq70Dxy2AuMHFMLjSCo48knRBt0j6fizg3IIxNiDfy6ZqRKKDYCU-t0akas-Rujvyw5GdUE4VhI9eGuY2HC2AQSfS6ZVsEv_yy_VVA-iCBYGNwBianXzzokBo743d3kvWVvBGHVzRSIW6rMmoyUA7fCObNWyXot6iSDdceXhqDATCLDD1UcdLLCM8l8mw3Wzi3Ng0ulc9cSjSN4rjh-fd_uQUiI_p6h8tBTDkFMKNEI-dMe8-qQLCUvXqpuWT_N9X2vut',
        isPinnedHome: true
      },
      {
        name: 'Sonia Park',
        role: 'Cloud Infrastructure Lead',
        bio: 'Scaling elastic distributed cloud layers and designing secure serverless deployment pipelines.',
        imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBsKNFL3LhUnEl-PCo9TTEABQ3VYhWcjMCiYwBVYNv26jTKC311LzkuIJ6X-SI_N2OcoQgbmlzresZJvKS1dDpeRyn8q1EHXbqcdhNWpfR_nn6T4KUnHC2A2pHDQHYck0XCux9b4Sw7-gdQJ6bwe9gEDXsAFZAz63ubE40EARBOtqskKVPIxbC73UPFZedhBdHnT02TboA8HJ1pZbW-JXJEbENZEf-1pxBw9lxR_m8I8cdRC6scSbv54vTXT8t_CGqwbkjur5n6qznS',
        isPinnedHome: false
      },
      {
        name: 'Dimitri Volkov',
        role: 'Cybersecurity Specialist',
        bio: 'Securing edge-node computing arrays and implementing advanced quantum-resistant encryption.',
        imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD0_9RhAdZTNAUkTPQU9d2eGtcRFLgSXPHj9sf3Rh_0_x-jZ4OpP2GbbF4xwPC0y8wZ7-hytgy_uvKkHACt9f5-WBbfw8ae-Wh6nwQd714VDYqiav2tAW203sMk2Qdqvw15CLpsX2QiP5W5s_5H41kGi3Bryz3HsRirxHHuP2FRRtrWs_hbz-cbeJAvgIffu_4vHfeRyr8q3Rik7hi2et_iNuhTA5qmcJM139aKqvY4B5K5tW1MQ2x6bX6gu9jE81UGxds849y6Snol',
        isPinnedHome: false
      },
      {
        name: 'Leila Chen',
        role: 'Principal Systems Architect',
        bio: 'Designing low-latency transaction nodes and core transactional routing layers.',
        imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAP3kFBnfbaTvHu-QVoJGNdEKND4BFufpPapirUWnfmJkLE_xVZbT_YpDMhuBZjurPkTcgL1NSasxNaREMzS5uK0h0twv_3yc0KHciKUJkJQgJfoL0PSvfqfYaVKsaqdbMYFP1pBZmD1y0JlclpSqU-KSiD1GpE76VvqyjTzBdTAQuLA8C2JmuuH0GAaRG_t_wRYq8m_jAgiCLD-9mcH4J8_VYdGKLh451kUexH90PUYUMLRX4_b8ogHmNv_TXP42Fr-lk_LsPqTlDS',
        isPinnedHome: false
      },
      {
        name: 'Jordan Hayes',
        role: 'Operations Lead',
        bio: 'Managing high-performance SLAs, regional team orchestration, and client delivery pipelines.',
        imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAeQ2lm82Y2OGNvunHjEW0FX7E1rk1oWAQfax_J0oMxUM46xTSMzQZzN2y4clNZpkKv953jcMLSIWY3PskbTrn7R-y6L9nUTWZU5z-wVePD5z1Zj0bUBRuusBN47Y3Ta7XCM6C-wAinF0aBvi2c0kwSXMu2bOibCgzOqDIhiLroYO0ZrJ96GtOs08IccgwChSDWcqpQT5I3EcoJdK6U4nH0AZRFStscaw0-TI7Poc86phsxn8xZ77RHxhErt4EdPWtWBCV3KkDxb4Fq',
        isPinnedHome: false
      },
      {
        name: 'Sofia Rossi',
        role: 'Head of Engineering',
        bio: 'Leading state-of-the-art developer pipelines and scaling corporate infrastructure architectures.',
        imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBsib3xfofejssp7MPWrwGut9UWq_qjr7FdX3mpLwsSnImvUOGAq6zZXljStaU55xIhs6X_K8n2gz05EO4-EoKQUoSTtZVVHVY40b7M9BwFCNgrrHJISMi9Kh0WSl25Svjq5A8AXQ1D1TkKOgTD1npr-lRbpHX4TRml4uG1fEfj3pGsQ6ofZe7LPObFtt-UisSIn2MckHP_dZTfPZmpRyd6pf1R9FTxEPZXAkhY4UAnQtM5WbjtG9FoaAGNn80JBuTqKq82K7YSyac_',
        isPinnedHome: false
      }
    ];
    await TeamMember.insertMany(team);
    console.log('Seeded 8 Team Members');

    // Seed Projects
    const projects = [
      {
        category: 'Development',
        title: 'Neural Nexus Core',
        description: 'Enterprise-grade distributed architecture for a global fintech powerhouse, handling millions of transactions with sub-millisecond latency.',
        thumbnail: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCsz_Om8DdQfQGW4mTHVMQv6TeAKidxj9-kHpnEhqVTX2C0Kx3GXbpDzMPYmbwLQWPCUgZoAx0ORfzNyO67b3PxUcB-vfdA6jLNb92erhnFurAb5CgboH_iwDEU2IBuvqrAjVAas0XaH4tMOJ-mojAv9KYBLqb49wsoJqPJbsD0zIv9DXwZ6Qb8VIhP8gn9Z9Slh4zq5x3FoE8dtGLZwbEXCZqqjxyxaiZMz-MccgFGOrAJs5A8C6leyP9nnPMq1jxfWF035wYn-koN',
        gallery: [
          'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=800&q=80'
        ],
        projectLink: 'https://github.com/vizo-tech/neural-nexus-core',
        isPinnedHome: true,
        challenge: 'The client required a system capable of handling 500k+ concurrent transactions without a single millisecond of drift. Legacy infrastructure was failing under peak loads, leading to critical service interruptions during market volatility.',
        solution: 'We architected a distributed core using Rust for performance-critical path-finding and Node.js for scalable orchestration. The entire stack was containerized via Kubernetes, ensuring horizontal scaling that mirrors real-time demand.',
        impact: 'A 94% reduction in systemic latency and 100% uptime through the Q3 fiscal peak. The solution now serves as the backbone for three major international financial institutions.',
        metrics: {
          latency: '0.4ms',
          dailyTxs: '25M+',
          uptime: '99.99%',
          roiMultiplier: '12x'
        },
        techStack: ['Rust', 'Kubernetes', 'Redis Flux', 'gRPC / TLS']
      },
      {
        category: 'AI',
        title: 'AetherMind LLM',
        description: 'Custom fine-tuned large language model specialized in proprietary luxury manufacturing processes and supply chain optimization.',
        thumbnail: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDLfItlr-t_SWK4i3mEMG687_hHK0IFWzRdLBzlGJRcHaX9qqPDVXLOSlPCgcFThyQTG2HtA8rU2cGvHOQ-VIvAnXA5UN_e-Uef81F7KKqPPB5_qVAfZiU3rqQLXWayWgkXTXpK7bzkL_Wt9IjD-CX6E5Ve_OF55aP022K3iLWeKl1Z2fDfxi3xsniT_qx48kKorSQhW0MPT_ChznY8HQyzGT41TZmcvWzbjyCBBiqUe9uOb5L6ZsPzsNOeQgkYk53UGhMAZc85rG-d',
        gallery: [
          'https://images.unsplash.com/photo-1677442136019-21780efad99a?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&w=800&q=80'
        ],
        projectLink: '',
        isPinnedHome: true,
        challenge: 'Our client needed to automate proprietary luxury brand customer inquiries while preserving high brand styling conventions and technical security protocols.',
        solution: 'We deployed a custom fine-tuned LLaMA model utilizing retrieval-augmented generation (RAG) mapped onto private database stores, ensuring data integrity.',
        impact: 'Reduced operational support latency by 80% and increased brand-consistent automation to 95%.',
        metrics: {
          latency: '12ms',
          dailyTxs: '1.2M+',
          uptime: '99.95%',
          roiMultiplier: '8x'
        },
        techStack: ['Python', 'OpenAI', 'PyTorch', 'AWS']
      },
      {
        category: 'Design',
        title: 'Prism Interface',
        description: 'A revolutionary design system for an international luxury real estate platform, blending immersive 3D with ultra-clean usability.',
        thumbnail: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDmuRbyzNZpsorT_2XgtZVrpqwks1dX2_o8EBwcdLATFy73omNoxhext9HaxBnBEte5QNU70qYeKYH-BHuL_WBSRlTurYR8gRJ3I7UTB6PUqtGNcAFbK6ecFwzwf55_i6QO4_ihO046qC63J7Ls-fKbEaKUfkweNzJnWSjnv33URrzvgSmVMHLdFAbCvBc9FlFFCbJwyxAO-EiJwIGCWpRSiRAt4344NOp2N6scNotMKvXNvp-2xZqMtMG8tNkz1sZnFawk4333ApWj',
        gallery: [
          'https://images.unsplash.com/photo-1508921912186-1d1a45ebb3c1?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1541462608143-67571c6738dd?auto=format&fit=crop&w=800&q=80'
        ],
        projectLink: '',
        isPinnedHome: true,
        challenge: 'The client was seeking an ultra-premium visual canvas to display high-end estates without visual lag or generic structures.',
        solution: 'Built a custom glassmorphic layout framework combined with Three.js web rendering engines for immersive property explorations.',
        impact: 'Increased client conversion rates by 45% and session times by 120%.',
        metrics: {
          latency: 'N/A',
          dailyTxs: '100k+',
          uptime: '100%',
          roiMultiplier: '15x'
        },
        techStack: ['React', 'Framer Motion', 'Three.js', 'Figma']
      },
      {
        category: 'Digital Marketing',
        title: 'VIZO Growth Engine',
        description: 'Programmatic ad bidding and hyper-targeted landing page arrays deploying automated lead generation mechanisms.',
        thumbnail: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAazq4gh6y0ckgL9AIJnXfTnJs5sXcXiIJ-Fz1BjP2G_ShaOy3ftv1jdou6X8xYPQ-XqmLFM4l4_DoewBNRzLp1czfFDy0QwH79qjsc9Y1yv0ulZZESd0ZKpuLpaTvxjAgRs-0KgEv1QG1FNIMWLMAfuPQsnmgNqmi3DtCQcil3wMmgvfsqU9kYyo0c0RILroU2Avn31Qovu6fxX01Ge7UM8oinVcnH3METmCsqh1d-32N8GlenRQLbMC6fsYO4b7CXlO6VE2tRmnrG',
        gallery: [
          'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=800&q=80'
        ],
        projectLink: '',
        isPinnedHome: false,
        challenge: 'A global enterprise required a unified B2B lead-generation pipeline with real-time bidding algorithms and custom tracking.',
        solution: 'Developed an automated marketing stack integrating search optimization systems, dynamic target arrays, and programmatic ad APIs.',
        impact: 'Generated over $12M in pipeline revenue in under 6 months with an acquisition cost reduction of 40%.',
        metrics: {
          latency: 'N/A',
          dailyTxs: '5M+',
          uptime: '99.99%',
          roiMultiplier: '4.5x'
        },
        techStack: ['AWS', 'Google Ads API', 'React', 'Meta Graph API']
      }
    ];
    await Project.insertMany(projects);
    console.log('Seeded 4 Projects (including Digital Marketing)');

    // Seed Reviews
    const reviews = [
      {
        name: 'Jonathan Reeve',
        companyWebsite: 'CTO, NexaCorp',
        rating: 5,
        feedback: 'VIZO TECH transformed our legacy architecture into a high-performance ecosystem. Their attention to technical detail is unparalleled.',
        isApproved: true
      },
      {
        name: 'Sarah Jenkins',
        companyWebsite: 'Creative Lead, Luminous',
        rating: 5,
        feedback: 'The design team at VIZO TECH understood our brand aesthetic perfectly. The resulting UI is both futuristic and incredibly intuitive.',
        isApproved: true
      }
    ];
    await Review.insertMany(reviews);
    console.log('Seeded 2 Approved Reviews');

    console.log('Database Seeding Completed Successfully');
    process.exit(0);
  } catch (error) {
    console.error(`Database seeding failed: ${error.message}`);
    process.exit(1);
  }
};

seedDatabase();
