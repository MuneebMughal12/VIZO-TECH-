export const SITE_NAME = 'VIZO TECH';
export const DEFAULT_SITE_URL = 'https://vizotech.vercel.app';
export const SITE_URL = (import.meta.env?.VITE_SITE_URL || DEFAULT_SITE_URL).replace(/\/$/, '');
export const SOCIAL_IMAGE_PATH = '/og.png';

export const routeSEO = {
  '/': {
    title: 'VIZO TECH | Web, AI & Software Development Agency',
    description: 'VIZO TECH builds premium websites, AI integrations, custom software and UI/UX experiences for ambitious businesses worldwide.',
    ogDescription: 'Premium web development, AI integration, custom software and UI/UX design for ambitious businesses worldwide.',
  },
  '/about': {
    title: 'About VIZO TECH | Digital Engineering Agency',
    description: 'Discover VIZO TECH, a digital engineering agency combining technical precision, creative design and modern innovation for global brands.',
  },
  '/services': {
    title: 'Web, AI & Software Development Services | VIZO TECH',
    description: 'Explore VIZO TECH services and packages for web development, AI integration, custom software, UI/UX design and digital transformation.',
  },
  '/projects': {
    title: 'Software & Web Development Portfolio | VIZO TECH',
    description: 'View selected VIZO TECH projects across custom software, modern websites, AI solutions, UI/UX design and digital transformation.',
  },
  '/team': {
    title: 'Meet the VIZO TECH Engineering Team',
    description: 'Meet the multidisciplinary designers, developers and technology experts behind VIZO TECH digital products and engineering solutions.',
  },
};

export function canonicalFor(pathname, siteUrl = SITE_URL) {
  const path = pathname === '/' ? '/' : pathname.replace(/\/$/, '');
  return `${siteUrl}${path}`;
}

export function structuredDataFor(pathname, siteUrl = SITE_URL) {
  const page = routeSEO[pathname] || routeSEO['/'];
  const url = canonicalFor(pathname, siteUrl);
  const graph = [
    {
      '@type': 'Organization',
      '@id': `${siteUrl}/#organization`,
      name: SITE_NAME,
      url: `${siteUrl}/`,
      logo: `${siteUrl}/favicon.svg`,
      telephone: '+92 335 1912047',
      areaServed: 'Worldwide',
    },
    {
      '@type': 'WebPage',
      '@id': `${url}#webpage`,
      url,
      name: page.title,
      description: page.description,
      isPartOf: { '@id': `${siteUrl}/#website` },
      about: { '@id': `${siteUrl}/#organization` },
    },
    {
      '@type': 'WebSite',
      '@id': `${siteUrl}/#website`,
      url: `${siteUrl}/`,
      name: SITE_NAME,
      publisher: { '@id': `${siteUrl}/#organization` },
    },
  ];

  if (pathname !== '/') {
    graph.push({
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: `${siteUrl}/` },
        { '@type': 'ListItem', position: 2, name: pathname.slice(1).replace(/^./, (value) => value.toUpperCase()), item: url },
      ],
    });
  }

  return { '@context': 'https://schema.org', '@graph': graph };
}
