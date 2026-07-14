const mongoose = require('mongoose');
const User = require('./models/User');
const TeamMember = require('./models/TeamMember');
const Project = require('./models/Project');
const Review = require('./models/Review');
const Settings = require('./models/Settings');
const Service = require('./models/Service');
const Package = require('./models/Package');
const connectDB = require('./db');

const seedDatabase = async () => {
  try {
    // Connect using our connection module
    await connectDB();

    console.log('Checking database state strictly...');

    // 1. Strict User Check: Agar 1 bhi user/admin database mein hai, to seed nahi hoga
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      const adminUser = new User({
        username: 'vizotech.official@gmail.com',
        password: '686332@Vizo' // Will be hashed in User Schema pre-save hook
      });
      await adminUser.save();
      console.log('Seeded Admin: vizotech.official@gmail.com / 686332@Vizo');
    } else {
      console.log(`Skipping Admin Seed: ${userCount} user(s) already exist in database.`);
    }

    // 2. Strict Settings Check: Agar pehle se settings saved hain to bypass karein
    const settingsCount = await Settings.countDocuments();
    if (settingsCount === 0) {
      const settings = new Settings({
        agencyName: 'VIZO TECH',
        adminEmail: 'admin@vizotech.agency',
        emailAlerts: true,
        systemStatusUpdates: false
      });
      await settings.save();
      console.log('Seeded settings');
    } else {
      console.log('Skipping Settings Seed: Settings already configured.');
    }

    // 3. Strict Team Member Check: Agar 1 banda bhi add hai, to dummy data nahi chalega
    const teamCount = await TeamMember.countDocuments();
    if (teamCount === 0) {
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
    } else {
      console.log(`Skipping Team Seed: ${teamCount} team member(s) already exist.`);
    }

    // 4. Strict Project Check: Agar 1 project bhi real wala add ha, tab bhi dummy add nahi hoga
    const projectCount = await Project.countDocuments();
    if (projectCount === 0) {
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
    } else {
      console.log(`Skipping Projects Seed: ${projectCount} project(s) already exist.`);
    }

    // 5. Strict Review Check: Agar 1 review bhi mojud ha to bypass karein
    const reviewCount = await Review.countDocuments();
    if (reviewCount === 0) {
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
    } else {
      console.log(`Skipping Reviews Seed: ${reviewCount} review(s) already exist.`);
    }

    // 6. Services & Packages Seeding
    const serviceCount = await Service.countDocuments();
    if (serviceCount === 0) {
      console.log('Seeding Services and Packages...');
      
      const servicesToSeed = [
        { name: 'Design Services', slug: 'design', emoji: '🎨', description: 'Premium UI/UX, brand identity, and graphical system design.', display_order: 1 },
        { name: 'AI Services', slug: 'ai', emoji: '🤖', description: 'Intelligent custom AI integrations, workflows, and automated bots.', display_order: 2 },
        { name: 'Development Services', slug: 'development', emoji: '💻', description: 'High-performance engineering, scaling custom systems, and premium websites.', display_order: 3 },
        { name: 'Digital Marketing Services', slug: 'digital-marketing', emoji: '📈', description: 'Data-driven growth arrays, management, Google ads, and SEO solutions.', display_order: 4 },
        { name: 'Video Editing Services', slug: 'video-editing', emoji: '🎬', description: 'Cinematic reel, YouTube, promotional, and monthly video content assets.', display_order: 5 },
        { name: 'Shopify Services', slug: 'shopify', emoji: '🛍️', description: 'Custom Shopify development, theme setups, configurations, and optimization.', display_order: 6 }
      ];

      const serviceMap = {};
      for (const s of servicesToSeed) {
        const newService = new Service(s);
        const saved = await newService.save();
        serviceMap[s.slug] = saved._id;
        console.log(`Seeded Service: ${s.name}`);
      }

      const packagesToSeed = [
        // Design Services (1.1 - 1.4)
        {
          serviceId: serviceMap['design'],
          name: 'Logo Design',
          slug: 'logo-design',
          price: 30,
          priceType: 'one_time',
          priceSuffix: '',
          description: 'Professional logo design package.',
          offerLine: 'Professional logo design, starting from just thirty dollars.',
          displayOrder: 1,
          features: [
            { text: '2 initial logo concepts', isIncluded: true, order: 1 },
            { text: '2 revision rounds', isIncluded: true, order: 2 },
            { text: 'Final files in PNG, JPG, SVG', isIncluded: true, order: 3 },
            { text: 'Transparent background version', isIncluded: true, order: 4 },
            { text: 'Black and white version', isIncluded: true, order: 5 },
            { text: 'Brand guidelines document', isIncluded: false, order: 6 },
            { text: 'Social media kit', isIncluded: false, order: 7 },
            { text: 'Stationery design', isIncluded: false, order: 8 },
            { text: 'Animated logo', isIncluded: false, order: 9 }
          ],
          suitableFor: [
            { text: 'Startups', order: 1 },
            { text: 'Small businesses', order: 2 },
            { text: 'Personal brands', order: 3 },
            { text: 'New ventures', order: 4 }
          ]
        },
        {
          serviceId: serviceMap['design'],
          name: 'Brand Identity Package',
          slug: 'brand-identity-package',
          price: 80,
          priceType: 'one_time',
          priceSuffix: '',
          description: 'Complete brand identity solution.',
          offerLine: 'Complete brand identity package, starting from just eighty dollars.',
          displayOrder: 2,
          features: [
            { text: 'Custom logo design (3 concepts)', isIncluded: true, order: 1 },
            { text: 'Color palette with hex codes', isIncluded: true, order: 2 },
            { text: 'Typography selection', isIncluded: true, order: 3 },
            { text: 'Business card design', isIncluded: true, order: 4 },
            { text: 'Letterhead design', isIncluded: true, order: 5 },
            { text: 'Brand guidelines document (1 page)', isIncluded: true, order: 6 },
            { text: 'All source files included', isIncluded: true, order: 7 },
            { text: 'Social media templates', isIncluded: false, order: 8 },
            { text: 'Website design', isIncluded: false, order: 9 },
            { text: 'Packaging design', isIncluded: false, order: 10 },
            { text: 'Animated assets', isIncluded: false, order: 11 }
          ],
          suitableFor: [
            { text: 'New businesses', order: 1 },
            { text: 'Rebranding projects', order: 2 },
            { text: 'Professional services', order: 3 },
            { text: 'Agencies', order: 4 }
          ]
        },
        {
          serviceId: serviceMap['design'],
          name: 'UI/UX Design (Website Mockup)',
          slug: 'ui-ux-design-website-mockup',
          price: 100,
          priceType: 'one_time',
          priceSuffix: '',
          description: 'High-fidelity Figma mockups.',
          offerLine: 'Professional UI/UX website mockup, starting from just one hundred dollars.',
          displayOrder: 3,
          features: [
            { text: 'Complete website mockup (up to 5 pages)', isIncluded: true, order: 1 },
            { text: 'Mobile responsive design preview', isIncluded: true, order: 2 },
            { text: 'Color scheme and typography', isIncluded: true, order: 3 },
            { text: 'Interactive prototype (Figma link)', isIncluded: true, order: 4 },
            { text: '2 revision rounds', isIncluded: true, order: 5 },
            { text: 'Design handoff files', isIncluded: true, order: 6 },
            { text: 'Website development', isIncluded: false, order: 7 },
            { text: 'Backend coding', isIncluded: false, order: 8 },
            { text: 'Content writing', isIncluded: false, order: 9 },
            { text: 'Hosting setup', isIncluded: false, order: 10 }
          ],
          suitableFor: [
            { text: 'Businesses planning a website', order: 1 },
            { text: 'App concepts', order: 2 },
            { text: 'Redesign projects', order: 3 },
            { text: 'Pitch presentations', order: 4 }
          ]
        },
        {
          serviceId: serviceMap['design'],
          name: 'Social Media Design Kit',
          slug: 'social-media-design-kit',
          price: 60,
          priceType: 'one_time',
          priceSuffix: '',
          description: 'Complete kit of 10 customized templates.',
          offerLine: 'Social media design kit, starting from just sixty dollars.',
          displayOrder: 4,
          features: [
            { text: '10 custom social media post templates', isIncluded: true, order: 1 },
            { text: 'Profile picture and cover photo', isIncluded: true, order: 2 },
            { text: 'Story templates (5 designs)', isIncluded: true, order: 3 },
            { text: 'Consistent brand style across all', isIncluded: true, order: 4 },
            { text: 'Editable Canva or Figma files', isIncluded: true, order: 5 },
            { text: 'Size optimized for Instagram, Facebook, LinkedIn', isIncluded: true, order: 6 },
            { text: 'Content writing', isIncluded: false, order: 7 },
            { text: 'Posting and scheduling', isIncluded: false, order: 8 },
            { text: 'Ad campaign management', isIncluded: false, order: 9 },
            { text: 'Video content', isIncluded: false, order: 10 }
          ],
          suitableFor: [
            { text: 'Businesses active on social media', order: 1 },
            { text: 'Influencers', order: 2 },
            { text: 'Marketing teams', order: 3 },
            { text: 'E-commerce brands', order: 4 }
          ]
        },
        // AI Services (2.1 - 2.3)
        {
          serviceId: serviceMap['ai'],
          name: 'AI Chatbot Integration',
          slug: 'ai-chatbot-integration',
          price: 150,
          priceType: 'one_time',
          priceSuffix: '',
          description: 'Smart AI chatbot integrations.',
          offerLine: 'AI chatbot integration, starting from just one hundred and fifty dollars.',
          displayOrder: 1,
          features: [
            { text: 'AI chatbot setup on your website', isIncluded: true, order: 1 },
            { text: 'Custom trained on your business info', isIncluded: true, order: 2 },
            { text: 'Handles FAQs automatically', isIncluded: true, order: 3 },
            { text: 'Lead capture functionality', isIncluded: true, order: 4 },
            { text: 'WhatsApp or website widget', isIncluded: true, order: 5 },
            { text: 'Basic conversation flow setup', isIncluded: true, order: 6 },
            { text: '1 month free support', isIncluded: true, order: 7 },
            { text: 'Advanced multi-language support', isIncluded: false, order: 8 },
            { text: 'CRM integration', isIncluded: false, order: 9 },
            { text: 'Custom AI model training', isIncluded: false, order: 10 },
            { text: 'Voice bot', isIncluded: false, order: 11 }
          ],
          suitableFor: [
            { text: 'Business websites', order: 1 },
            { text: 'E-commerce stores', order: 2 },
            { text: 'Service providers', order: 3 },
            { text: 'Customer support teams', order: 4 }
          ]
        },
        {
          serviceId: serviceMap['ai'],
          name: 'AI Automation Setup',
          slug: 'ai-automation-setup',
          price: 200,
          priceType: 'one_time',
          priceSuffix: '',
          description: 'Business process workflows.',
          offerLine: 'AI automation setup, starting from just two hundred dollars.',
          displayOrder: 2,
          features: [
            { text: 'Workflow automation analysis', isIncluded: true, order: 1 },
            { text: 'Up to 3 automated workflows', isIncluded: true, order: 2 },
            { text: 'Email automation setup', isIncluded: true, order: 3 },
            { text: 'Lead notification system', isIncluded: true, order: 4 },
            { text: 'Form-to-action automation', isIncluded: true, order: 5 },
            { text: 'Integration with existing tools', isIncluded: true, order: 6 },
            { text: 'Documentation and training', isIncluded: true, order: 7 },
            { text: 'Custom software development', isIncluded: false, order: 8 },
            { text: 'Advanced API integrations', isIncluded: false, order: 9 },
            { text: 'Monthly maintenance', isIncluded: false, order: 10 },
            { text: 'Data migration', isIncluded: false, order: 11 }
          ],
          suitableFor: [
            { text: 'Businesses with repetitive tasks', order: 1 },
            { text: 'Marketing teams', order: 2 },
            { text: 'Sales teams', order: 3 },
            { text: 'Operations management', order: 4 }
          ]
        },
        {
          serviceId: serviceMap['ai'],
          name: 'Custom AI Solution',
          slug: 'custom-ai-solution',
          price: 400,
          priceType: 'one_time',
          priceSuffix: '+',
          description: 'Bespoke AI solutions.',
          offerLine: 'Custom AI solutions, starting from four hundred dollars.',
          displayOrder: 3,
          features: [
            { text: 'Custom AI solution design', isIncluded: true, order: 1 },
            { text: 'AI model selection and setup', isIncluded: true, order: 2 },
            { text: 'Integration with your systems', isIncluded: true, order: 3 },
            { text: 'Testing and optimization', isIncluded: true, order: 4 },
            { text: 'User training session', isIncluded: true, order: 5 },
            { text: '30 days post-launch support', isIncluded: true, order: 6 },
            { text: 'Documentation', isIncluded: true, order: 7 },
            { text: 'Ongoing model retraining', isIncluded: false, order: 8 },
            { text: 'Dedicated server costs', isIncluded: false, order: 9 },
            { text: 'Third-party API subscription fees', isIncluded: false, order: 10 }
          ],
          suitableFor: [
            { text: 'Businesses needing unique AI tools', order: 1 },
            { text: 'Data-driven companies', order: 2 },
            { text: 'Tech startups', order: 3 },
            { text: 'Enterprise solutions', order: 4 }
          ]
        },
        // Development Services (3.1 - 3.7)
        {
          serviceId: serviceMap['development'],
          name: 'Starter One-Page Website',
          slug: 'starter-one-page-website',
          price: 60,
          priceType: 'one_time',
          priceSuffix: '',
          description: 'Elegant landing page.',
          offerLine: 'Professional one-page website, starting from just sixty dollars.',
          displayOrder: 1,
          features: [
            { text: 'One complete responsive page', isIncluded: true, order: 1 },
            { text: 'Business or personal introduction', isIncluded: true, order: 2 },
            { text: 'Services section', isIncluded: true, order: 3 },
            { text: 'Basic work gallery', isIncluded: true, order: 4 },
            { text: 'WhatsApp/contact button', isIncluded: true, order: 5 },
            { text: 'Inquiry form', isIncluded: true, order: 6 },
            { text: 'Social media links', isIncluded: true, order: 7 },
            { text: 'Mobile-friendly design', isIncluded: true, order: 8 },
            { text: 'Basic meta title and description', isIncluded: true, order: 9 },
            { text: 'Multiple pages', isIncluded: false, order: 10 },
            { text: 'Admin panel', isIncluded: false, order: 11 },
            { text: 'Cart and checkout', isIncluded: false, order: 12 },
            { text: 'Advanced SEO', isIncluded: false, order: 13 },
            { text: 'Custom dashboard', isIncluded: false, order: 14 }
          ],
          suitableFor: [
            { text: 'Freelancers', order: 1 },
            { text: 'Consultants', order: 2 },
            { text: 'Personal profiles', order: 3 },
            { text: 'Event promotion', order: 4 }
          ]
        },
        {
          serviceId: serviceMap['development'],
          name: 'Standard Business Website',
          slug: 'standard-business-website',
          price: 100,
          priceType: 'one_time',
          priceSuffix: '',
          description: 'Complete business website.',
          offerLine: 'Professional business website, starting from just one hundred dollars.',
          displayOrder: 2,
          features: [
            { text: 'Approximately 4-5 pages (Home, About, Services, Gallery, Contact)', isIncluded: true, order: 1 },
            { text: 'WhatsApp integration', isIncluded: true, order: 2 },
            { text: 'Inquiry form', isIncluded: true, order: 3 },
            { text: 'Google Map', isIncluded: true, order: 4 },
            { text: 'Social links', isIncluded: true, order: 5 },
            { text: 'Mobile-friendly design', isIncluded: true, order: 6 },
            { text: 'Basic SEO setup', isIncluded: true, order: 7 },
            { text: 'Meta title and description', isIncluded: true, order: 8 },
            { text: 'Admin panel', isIncluded: false, order: 9 },
            { text: 'Online store', isIncluded: false, order: 10 },
            { text: 'Customer login', isIncluded: false, order: 11 },
            { text: 'Advanced SEO campaign', isIncluded: false, order: 12 },
            { text: 'Custom integrations', isIncluded: false, order: 13 }
          ],
          suitableFor: [
            { text: 'Small businesses', order: 1 },
            { text: 'Restaurants', order: 2 },
            { text: 'Salons', order: 3 },
            { text: 'Local service providers', order: 4 }
          ]
        },
        {
          serviceId: serviceMap['development'],
          name: 'Premium Business Website',
          slug: 'premium-business-website',
          price: 150,
          priceType: 'one_time',
          priceSuffix: '',
          description: 'SEO optimized premium corporate design.',
          offerLine: 'Premium business website, starting from just one hundred and fifty dollars.',
          displayOrder: 3,
          features: [
            { text: 'Premium custom website design', isIncluded: true, order: 1 },
            { text: 'Approximately 5-7 pages', isIncluded: true, order: 2 },
            { text: 'Detailed service pages', isIncluded: true, order: 3 },
            { text: 'Portfolio or completed projects', isIncluded: true, order: 4 },
            { text: 'Client reviews', isIncluded: true, order: 5 },
            { text: 'Team or professional profiles', isIncluded: true, order: 6 },
            { text: 'FAQs', isIncluded: true, order: 7 },
            { text: 'WhatsApp integration', isIncluded: true, order: 8 },
            { text: 'Contact or quote-request form', isIncluded: true, order: 9 },
            { text: 'Google Map', isIncluded: true, order: 10 },
            { text: 'Mobile optimization', isIncluded: true, order: 11 },
            { text: 'Speed optimization', isIncluded: true, order: 12 },
            { text: 'Meta titles and descriptions', isIncluded: true, order: 13 },
            { text: 'Image alt text', isIncluded: true, order: 14 },
            { text: 'XML sitemap', isIncluded: true, order: 15 },
            { text: 'Robots.txt', isIncluded: true, order: 16 },
            { text: 'Basic schema', isIncluded: true, order: 17 },
            { text: 'Basic on-page SEO', isIncluded: true, order: 18 },
            { text: 'Admin panel', isIncluded: false, order: 19 },
            { text: 'Monthly SEO', isIncluded: false, order: 20 },
            { text: 'Guaranteed Google ranking', isIncluded: false, order: 21 },
            { text: 'Cart and checkout', isIncluded: false, order: 22 }
          ],
          suitableFor: [
            { text: 'Professional services', order: 1 },
            { text: 'Clinics', order: 2 },
            { text: 'Construction firms', order: 3 },
            { text: 'Agencies', order: 4 }
          ]
        },
        {
          serviceId: serviceMap['development'],
          name: 'Dynamic Website with Admin Panel',
          slug: 'dynamic-website-with-admin-panel',
          price: 250,
          priceType: 'one_time',
          priceSuffix: '',
          description: 'Fully manageable dynamic portal.',
          offerLine: 'Dynamic website with admin panel, starting from just two hundred and fifty dollars.',
          displayOrder: 4,
          features: [
            { text: 'Dynamic public website', isIncluded: true, order: 1 },
            { text: 'Secure admin login', isIncluded: true, order: 2 },
            { text: 'Admin dashboard', isIncluded: true, order: 3 },
            { text: 'Services management', isIncluded: true, order: 4 },
            { text: 'Projects management', isIncluded: true, order: 5 },
            { text: 'Team member management', isIncluded: true, order: 6 },
            { text: 'Client review management', isIncluded: true, order: 7 },
            { text: 'Images and media management', isIncluded: true, order: 8 },
            { text: 'Blog or updates management', isIncluded: true, order: 9 },
            { text: 'Inquiry dashboard', isIncluded: true, order: 10 },
            { text: 'Website content editing', isIncluded: true, order: 11 },
            { text: 'Editable SEO fields', isIncluded: true, order: 12 },
            { text: 'WhatsApp integration', isIncluded: true, order: 13 },
            { text: 'Mobile-responsive website and admin panel', isIncluded: true, order: 14 },
            { text: 'Cart and checkout', isIncluded: false, order: 15 },
            { text: 'Customer payment system', isIncluded: false, order: 16 },
            { text: 'Multi-vendor features', isIncluded: false, order: 17 },
            { text: 'Custom business software', isIncluded: false, order: 18 }
          ],
          suitableFor: [
            { text: 'Growing businesses', order: 1 },
            { text: 'Academies', order: 2 },
            { text: 'Real estate', order: 3 },
            { text: 'Marketing agencies', order: 4 }
          ]
        },
        {
          serviceId: serviceMap['development'],
          name: 'Complete E-commerce Website',
          slug: 'complete-e-commerce-website',
          price: 300,
          priceType: 'one_time',
          priceSuffix: '',
          description: 'Direct sales e-commerce flow.',
          offerLine: 'Complete e-commerce website, starting from just three hundred dollars.',
          displayOrder: 5,
          features: [
            { text: 'Product store', isIncluded: true, order: 1 },
            { text: 'Product categories', isIncluded: true, order: 2 },
            { text: 'Product detail pages', isIncluded: true, order: 3 },
            { text: 'Product images and prices', isIncluded: true, order: 4 },
            { text: 'Basic product variants', isIncluded: true, order: 5 },
            { text: 'Shopping cart', isIncluded: true, order: 6 },
            { text: 'Checkout', isIncluded: true, order: 7 },
            { text: 'Customer details form', isIncluded: true, order: 8 },
            { text: 'Delivery address form', isIncluded: true, order: 9 },
            { text: 'Cash-on-delivery flow', isIncluded: true, order: 10 },
            { text: 'WhatsApp ordering', isIncluded: true, order: 11 },
            { text: 'Product management', isIncluded: true, order: 12 },
            { text: 'Basic stock management', isIncluded: true, order: 13 },
            { text: 'Order management dashboard', isIncluded: true, order: 14 },
            { text: 'Order statuses (New, Confirmed, Processing, Completed, Cancelled)', isIncluded: true, order: 15 },
            { text: 'Mobile-friendly store', isIncluded: true, order: 16 },
            { text: 'Basic store SEO', isIncluded: true, order: 17 },
            { text: 'Online payment gateway', isIncluded: false, order: 18 },
            { text: 'Courier API', isIncluded: false, order: 19 },
            { text: 'Customer accounts', isIncluded: false, order: 20 },
            { text: 'Advanced order tracking', isIncluded: false, order: 21 },
            { text: 'Multi-vendor system', isIncluded: false, order: 22 }
          ],
          suitableFor: [
            { text: 'Online stores', order: 1 },
            { text: 'Clothing brands', order: 2 },
            { text: 'Product-based businesses', order: 3 }
          ]
        },
        {
          serviceId: serviceMap['development'],
          name: 'Advanced E-commerce Website',
          slug: 'advanced-e-commerce-website',
          price: 500,
          priceType: 'one_time',
          priceSuffix: '',
          description: 'High performance custom store.',
          offerLine: 'Advanced e-commerce website, starting from just five hundred dollars.',
          displayOrder: 6,
          features: [
            { text: 'Everything from the $300 package plus', isIncluded: true, order: 1 },
            { text: 'Customer registration and login', isIncluded: true, order: 2 },
            { text: 'Customer dashboard', isIncluded: true, order: 3 },
            { text: 'Saved customer details', isIncluded: true, order: 4 },
            { text: 'Order history', isIncluded: true, order: 5 },
            { text: 'Order tracking', isIncluded: true, order: 6 },
            { text: 'Coupons and discount codes', isIncluded: true, order: 7 },
            { text: 'Wishlist', isIncluded: true, order: 8 },
            { text: 'Advanced product variants (size, color)', isIncluded: true, order: 9 },
            { text: 'Advanced stock management', isIncluded: true, order: 10 },
            { text: 'Low-stock alerts', isIncluded: true, order: 11 },
            { text: 'Advanced product search and filters', isIncluded: true, order: 12 },
            { text: 'Online payment integration setup', isIncluded: true, order: 13 },
            { text: 'Courier integration setup', isIncluded: true, order: 14 },
            { text: 'Improved admin dashboard', isIncluded: true, order: 15 },
            { text: 'Better speed optimization', isIncluded: true, order: 16 },
            { text: 'Advanced store structure', isIncluded: true, order: 17 },
            { text: 'Payment gateway fees (separate)', isIncluded: false, order: 18 },
            { text: 'Transaction charges (separate)', isIncluded: false, order: 19 },
            { text: 'Courier charges (separate)', isIncluded: false, order: 20 },
            { text: 'Third-party API fees', isIncluded: false, order: 21 },
            { text: 'Premium plugin subscriptions', isIncluded: false, order: 22 }
          ],
          suitableFor: [
            { text: 'Growing online brands', order: 1 },
            { text: 'Large stores', order: 2 },
            { text: 'Multi-category businesses', order: 3 }
          ]
        },
        {
          serviceId: serviceMap['development'],
          name: 'Custom Web System',
          slug: 'custom-web-system',
          price: 600,
          priceType: 'one_time',
          priceSuffix: '+',
          description: 'Tailored systems built to specifications.',
          offerLine: 'Custom web systems, starting from six hundred dollars.',
          displayOrder: 7,
          features: [
            { text: 'Multiple user roles', isIncluded: true, order: 1 },
            { text: 'Customer, staff, or vendor dashboards', isIncluded: true, order: 2 },
            { text: 'Custom login system', isIncluded: true, order: 3 },
            { text: 'Booking management', isIncluded: true, order: 4 },
            { text: 'Quote-request system', isIncluded: true, order: 5 },
            { text: 'Custom database', isIncluded: true, order: 6 },
            { text: 'Reports', isIncluded: true, order: 7 },
            { text: 'Payment integrations', isIncluded: true, order: 8 },
            { text: 'Third-party API integrations', isIncluded: true, order: 9 },
            { text: 'Email notifications', isIncluded: true, order: 10 },
            { text: 'Business-specific workflow', isIncluded: true, order: 11 },
            { text: 'Role-based access', isIncluded: true, order: 12 },
            { text: 'Custom admin controls', isIncluded: true, order: 13 },
            { text: 'Final price depends on number of dashboards, user roles, database complexity, booking/marketplace logic, payment integrations, API integrations, custom modules, security requirements', isIncluded: false, order: 14 }
          ],
          suitableFor: [
            { text: 'Multi-vendor marketplaces', order: 1 },
            { text: 'Booking portals', order: 2 },
            { text: 'Management systems', order: 3 },
            { text: 'CRM portals', order: 4 }
          ]
        },
        // Digital Marketing (4.1 - 4.4)
        {
          serviceId: serviceMap['digital-marketing'],
          name: 'Social Media Management',
          slug: 'social-media-management',
          price: 150,
          priceType: 'monthly',
          priceSuffix: '/mo',
          description: 'Social platforms management.',
          offerLine: 'Social media management, starting from just one hundred and fifty dollars per month.',
          displayOrder: 1,
          features: [
            { text: '2 platforms managed (Facebook + Instagram)', isIncluded: true, order: 1 },
            { text: '12 posts per month', isIncluded: true, order: 2 },
            { text: 'Content calendar', isIncluded: true, order: 3 },
            { text: 'Post design and copywriting', isIncluded: true, order: 4 },
            { text: 'Hashtag research', isIncluded: true, order: 5 },
            { text: 'Community engagement (replies, comments)', isIncluded: true, order: 6 },
            { text: 'Monthly performance report', isIncluded: true, order: 7 },
            { text: 'Paid ad campaigns', isIncluded: false, order: 8 },
            { text: 'Video production', isIncluded: false, order: 9 },
            { text: 'Influencer outreach', isIncluded: false, order: 10 },
            { text: 'Additional platforms', isIncluded: false, order: 11 }
          ],
          suitableFor: [
            { text: 'Small businesses', order: 1 },
            { text: 'Local services', order: 2 },
            { text: 'Restaurants', order: 3 },
            { text: 'Startups', order: 4 }
          ]
        },
        {
          serviceId: serviceMap['digital-marketing'],
          name: 'Google Ads Management',
          slug: 'google-ads-management',
          price: 200,
          priceType: 'monthly',
          priceSuffix: '/mo',
          description: 'Optimized search advertising campaigns.',
          offerLine: 'Google Ads management, starting from just two hundred dollars per month.',
          displayOrder: 2,
          features: [
            { text: 'Google Ads account setup', isIncluded: true, order: 1 },
            { text: 'Keyword research', isIncluded: true, order: 2 },
            { text: 'Ad copy writing', isIncluded: true, order: 3 },
            { text: 'Campaign setup and optimization', isIncluded: true, order: 4 },
            { text: 'Landing page recommendations', isIncluded: true, order: 5 },
            { text: 'Bi-weekly performance reports', isIncluded: true, order: 6 },
            { text: 'Monthly strategy call', isIncluded: true, order: 7 },
            { text: 'Ad spend budget (paid directly to Google)', isIncluded: false, order: 8 },
            { text: 'Landing page development', isIncluded: false, order: 9 },
            { text: 'Remarketing pixel setup', isIncluded: false, order: 10 }
          ],
          suitableFor: [
            { text: 'Lead generation businesses', order: 1 },
            { text: 'E-commerce', order: 2 },
            { text: 'Service providers', order: 3 },
            { text: 'Local businesses', order: 4 }
          ]
        },
        {
          serviceId: serviceMap['digital-marketing'],
          name: 'SEO Package',
          slug: 'seo-package',
          price: 200,
          priceType: 'monthly',
          priceSuffix: '/mo',
          description: 'Improve organic Google rankings.',
          offerLine: 'Monthly SEO package, starting from just two hundred dollars per month.',
          displayOrder: 3,
          features: [
            { text: 'Website SEO audit', isIncluded: true, order: 1 },
            { text: 'Keyword research (10 keywords)', isIncluded: true, order: 2 },
            { text: 'On-page optimization', isIncluded: true, order: 3 },
            { text: 'Meta titles and descriptions', isIncluded: true, order: 4 },
            { text: 'Google Search Console setup', isIncluded: true, order: 5 },
            { text: 'Google Business Profile optimization', isIncluded: true, order: 6 },
            { text: 'Monthly SEO report with rankings', isIncluded: true, order: 7 },
            { text: 'Technical SEO fixes', isIncluded: true, order: 8 },
            { text: 'Content writing', isIncluded: false, order: 9 },
            { text: 'Link building outreach', isIncluded: false, order: 10 },
            { text: 'Guaranteed rankings', isIncluded: false, order: 11 },
            { text: 'Paid advertising', isIncluded: false, order: 12 }
          ],
          suitableFor: [
            { text: 'Businesses wanting organic traffic', order: 1 },
            { text: 'Service-based companies', order: 2 },
            { text: 'E-commerce', order: 3 },
            { text: 'Blogs', order: 4 }
          ]
        },
        {
          serviceId: serviceMap['digital-marketing'],
          name: 'Full Digital Marketing Package',
          slug: 'full-digital-marketing-package',
          price: 400,
          priceType: 'monthly',
          priceSuffix: '/mo',
          description: 'Complete digital scaling pipeline.',
          offerLine: 'Full digital marketing package, starting from just four hundred dollars per month.',
          displayOrder: 4,
          features: [
            { text: 'Social media management (2 platforms)', isIncluded: true, order: 1 },
            { text: 'Google Ads or Facebook Ads management', isIncluded: true, order: 2 },
            { text: 'Basic SEO optimization', isIncluded: true, order: 3 },
            { text: 'Email marketing setup', isIncluded: true, order: 4 },
            { text: 'Monthly content calendar', isIncluded: true, order: 5 },
            { text: 'Performance dashboard', isIncluded: true, order: 6 },
            { text: 'Monthly strategy meeting', isIncluded: true, order: 7 },
            { text: 'Competitor analysis', isIncluded: true, order: 8 },
            { text: 'Ad spend budget (separate)', isIncluded: false, order: 9 },
            { text: 'Video production', isIncluded: false, order: 10 },
            { text: 'Website development', isIncluded: false, order: 11 },
            { text: 'Influencer marketing', isIncluded: false, order: 12 }
          ],
          suitableFor: [
            { text: 'Serious businesses', order: 1 },
            { text: 'Growing brands', order: 2 },
            { text: 'Companies wanting full online presence', order: 3 }
          ]
        },
        // Video Editing (5.1 - 5.4)
        {
          serviceId: serviceMap['video-editing'],
          name: 'Short Video / Reel Edit',
          slug: 'short-video-reel-edit',
          price: 20,
          priceType: 'one_time',
          priceSuffix: '',
          description: 'High energy short format video assets.',
          offerLine: 'Short video or reel editing, starting from just twenty dollars.',
          displayOrder: 1,
          features: [
            { text: 'Up to 60-second video edit', isIncluded: true, order: 1 },
            { text: 'Cuts, transitions, and effects', isIncluded: true, order: 2 },
            { text: 'Background music', isIncluded: true, order: 3 },
            { text: 'Text overlays and captions', isIncluded: true, order: 4 },
            { text: 'Color correction', isIncluded: true, order: 5 },
            { text: 'Vertical format (9:16) optimized', isIncluded: true, order: 6 },
            { text: '1 revision round', isIncluded: true, order: 7 },
            { text: 'Raw footage shooting', isIncluded: false, order: 8 },
            { text: 'Voiceover recording', isIncluded: false, order: 9 },
            { text: 'Motion graphics', isIncluded: false, order: 10 },
            { text: 'Multiple format exports', isIncluded: false, order: 11 }
          ],
          suitableFor: [
            { text: 'Social media content', order: 1 },
            { text: 'TikTok creators', order: 2 },
            { text: 'Instagram reels', order: 3 },
            { text: 'Product teasers', order: 4 }
          ]
        },
        {
          serviceId: serviceMap['video-editing'],
          name: 'YouTube Video Edit',
          slug: 'youtube-video-edit',
          price: 50,
          priceType: 'one_time',
          priceSuffix: '',
          description: 'Cinematic long-form edits.',
          offerLine: 'YouTube video editing, starting from just fifty dollars.',
          displayOrder: 2,
          features: [
            { text: 'Up to 15-minute video edit', isIncluded: true, order: 1 },
            { text: 'Multi-camera editing', isIncluded: true, order: 2 },
            { text: 'Color grading', isIncluded: true, order: 3 },
            { text: 'Audio cleanup and mixing', isIncluded: true, order: 4 },
            { text: 'Lower thirds and text overlays', isIncluded: true, order: 5 },
            { text: 'Intro and outro', isIncluded: true, order: 6 },
            { text: 'Background music', isIncluded: true, order: 7 },
            { text: 'Thumbnail design (1 design)', isIncluded: true, order: 8 },
            { text: '2 revision rounds', isIncluded: true, order: 9 },
            { text: 'Filming', isIncluded: false, order: 10 },
            { text: 'Script writing', isIncluded: false, order: 11 },
            { text: 'Animation', isIncluded: false, order: 12 },
            { text: 'Channel management', isIncluded: false, order: 13 }
          ],
          suitableFor: [
            { text: 'YouTube creators', order: 1 },
            { text: 'Tutorial channels', order: 2 },
            { text: 'Vlog channels', order: 3 },
            { text: 'Business YouTube channels', order: 4 }
          ]
        },
        {
          serviceId: serviceMap['video-editing'],
          name: 'Promo / Ad Video',
          slug: 'promo-ad-video',
          price: 80,
          priceType: 'one_time',
          priceSuffix: '',
          description: 'Cinematic promotional launch clips.',
          offerLine: 'Promotional video editing, starting from just eighty dollars.',
          displayOrder: 3,
          features: [
            { text: 'Up to 90-second promotional video', isIncluded: true, order: 1 },
            { text: 'Professional editing and pacing', isIncluded: true, order: 2 },
            { text: 'Motion text and titles', isIncluded: true, order: 3 },
            { text: 'Brand colors and logo integration', isIncluded: true, order: 4 },
            { text: 'Licensed background music', isIncluded: true, order: 5 },
            { text: 'Call-to-action end frame', isIncluded: true, order: 6 },
            { text: 'Multiple format exports (16:9, 9:16, 1:1)', isIncluded: true, order: 7 },
            { text: '2 revision rounds', isIncluded: true, order: 8 },
            { text: 'Video shooting', isIncluded: false, order: 9 },
            { text: 'Voiceover talent', isIncluded: false, order: 10 },
            { text: '3D animation', isIncluded: false, order: 11 },
            { text: 'Stock footage licensing', isIncluded: false, order: 12 }
          ],
          suitableFor: [
            { text: 'Business promotions', order: 1 },
            { text: 'Product launches', order: 2 },
            { text: 'Service advertisements', order: 3 },
            { text: 'Social media ads', order: 4 }
          ]
        },
        {
          serviceId: serviceMap['video-editing'],
          name: 'Monthly Video Package (8 Videos)',
          slug: 'monthly-video-package-8-videos',
          price: 150,
          priceType: 'monthly',
          priceSuffix: '/mo',
          description: 'Consistent monthly assets creation.',
          offerLine: 'Monthly video package of 8 videos, starting from just one hundred and fifty dollars per month.',
          displayOrder: 4,
          features: [
            { text: '8 short videos per month (up to 60s each)', isIncluded: true, order: 1 },
            { text: 'Consistent brand style', isIncluded: true, order: 2 },
            { text: 'Captions and text overlays', isIncluded: true, order: 3 },
            { text: 'Background music', isIncluded: true, order: 4 },
            { text: 'Color correction', isIncluded: true, order: 5 },
            { text: 'Content calendar coordination', isIncluded: true, order: 6 },
            { text: 'Multiple format exports', isIncluded: true, order: 7 },
            { text: 'Priority turnaround', isIncluded: true, order: 8 },
            { text: 'Raw footage creation', isIncluded: false, order: 9 },
            { text: 'Voiceover', isIncluded: false, order: 10 },
            { text: 'Long-form video editing', isIncluded: false, order: 11 },
            { text: 'Motion graphics', isIncluded: false, order: 12 }
          ],
          suitableFor: [
            { text: 'Regular content creators', order: 1 },
            { text: 'Businesses needing consistent content', order: 2 },
            { text: 'Marketing teams', order: 3 },
            { text: 'E-commerce brands', order: 4 }
          ]
        },
        // Shopify Services (6.1 - 6.3)
        {
          serviceId: serviceMap['shopify'],
          name: 'Basic Shopify Store Setup',
          slug: 'basic-shopify-store-setup',
          price: 150,
          priceType: 'one_time',
          priceSuffix: '',
          description: 'Professional setup and launch.',
          offerLine: 'Basic Shopify store setup, starting from just one hundred and fifty dollars.',
          displayOrder: 1,
          features: [
            { text: 'Shopify store setup and configuration', isIncluded: true, order: 1 },
            { text: 'Theme selection and basic customization', isIncluded: true, order: 2 },
            { text: 'Up to 15 products uploaded', isIncluded: true, order: 3 },
            { text: 'Collection/category setup', isIncluded: true, order: 4 },
            { text: 'Payment gateway configuration', isIncluded: true, order: 5 },
            { text: 'Shipping zones setup', isIncluded: true, order: 6 },
            { text: 'Basic SEO (meta titles, descriptions)', isIncluded: true, order: 7 },
            { text: 'Contact page', isIncluded: true, order: 8 },
            { text: 'Mobile-responsive check', isIncluded: true, order: 9 },
            { text: 'Custom theme design', isIncluded: false, order: 10 },
            { text: 'App integrations', isIncluded: false, order: 11 },
            { text: 'Product photography', isIncluded: false, order: 12 },
            { text: 'Marketing setup', isIncluded: false, order: 13 },
            { text: 'Content writing', isIncluded: false, order: 14 }
          ],
          suitableFor: [
            { text: 'New online sellers', order: 1 },
            { text: 'Small product catalogs', order: 2 },
            { text: 'Dropshipping starters', order: 3 },
            { text: 'Handmade product sellers', order: 4 }
          ]
        },
        {
          serviceId: serviceMap['shopify'],
          name: 'Standard Shopify Store',
          slug: 'standard-shopify-store',
          price: 250,
          priceType: 'one_time',
          priceSuffix: '',
          description: 'Fully responsive storefront.',
          offerLine: 'Standard Shopify store with products, starting from just two hundred and fifty dollars.',
          displayOrder: 2,
          features: [
            { text: 'Everything in the $150 package plus', isIncluded: true, order: 1 },
            { text: 'Premium theme customization', isIncluded: true, order: 2 },
            { text: 'Up to 50 products uploaded', isIncluded: true, order: 3 },
            { text: 'Product variants (size, color)', isIncluded: true, order: 4 },
            { text: 'Discount codes setup', isIncluded: true, order: 5 },
            { text: 'Email marketing integration', isIncluded: true, order: 6 },
            { text: 'Social media sales channels', isIncluded: true, order: 7 },
            { text: 'Abandoned cart recovery setup', isIncluded: true, order: 8 },
            { text: 'Google Analytics integration', isIncluded: true, order: 9 },
            { text: 'FAQ page', isIncluded: true, order: 10 },
            { text: 'About Us page design', isIncluded: true, order: 11 },
            { text: 'Custom app development', isIncluded: false, order: 12 },
            { text: 'Advanced automations', isIncluded: false, order: 13 },
            { text: 'Monthly management', isIncluded: false, order: 14 },
            { text: 'Paid advertising', isIncluded: false, order: 15 }
          ],
          suitableFor: [
            { text: 'Small to medium businesses', order: 1 },
            { text: 'Fashion brands', order: 2 },
            { text: 'Beauty brands', order: 3 },
            { text: 'Food brands', order: 4 }
          ]
        },
        {
          serviceId: serviceMap['shopify'],
          name: 'Advanced Shopify Store',
          slug: 'advanced-shopify-store',
          price: 400,
          priceType: 'one_time',
          priceSuffix: '+',
          description: 'High volume scaling Shopify store.',
          offerLine: 'Advanced Shopify store, starting from four hundred dollars.',
          displayOrder: 3,
          features: [
            { text: 'Everything in the $250 package plus', isIncluded: true, order: 1 },
            { text: 'Advanced theme customization', isIncluded: true, order: 2 },
            { text: 'Up to 100+ products uploaded', isIncluded: true, order: 3 },
            { text: 'App integrations (reviews, upsell, loyalty)', isIncluded: true, order: 4 },
            { text: 'Advanced SEO optimization', isIncluded: true, order: 5 },
            { text: 'Multi-currency setup', isIncluded: true, order: 6 },
            { text: 'Shipping calculator integration', isIncluded: true, order: 7 },
            { text: 'Custom collection pages', isIncluded: true, order: 8 },
            { text: 'Blog setup', isIncluded: true, order: 9 },
            { text: 'Speed optimization', isIncluded: true, order: 10 },
            { text: 'Training session (1 hour)', isIncluded: true, order: 11 },
            { text: 'Custom Shopify app development', isIncluded: false, order: 12 },
            { text: 'Shopify subscription fees (separate)', isIncluded: false, order: 13 },
            { text: 'Third-party app subscription fees', isIncluded: false, order: 14 },
            { text: 'Ongoing store management', isIncluded: false, order: 15 }
          ],
          suitableFor: [
            { text: 'Established brands', order: 1 },
            { text: 'High-volume sellers', order: 2 },
            { text: 'Multi-product businesses', order: 3 },
            { text: 'International stores', order: 4 }
          ]
        }
      ];

      await Package.insertMany(packagesToSeed);
      console.log('Seeded 25 Packages successfully.');
    } else {
      console.log('Skipping Services/Packages Seed: Services already exist.');
    }

    console.log('Database Seeding Check Completed Successfully (No real data harmed)');
    process.exit(0);
  } catch (error) {
    console.error(`Database seeding failed: ${error.message}`);
    process.exit(1);
  }
};

seedDatabase();