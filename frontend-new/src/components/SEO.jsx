import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { SITE_NAME, SITE_URL, SOCIAL_IMAGE_PATH, canonicalFor, routeSEO, structuredDataFor } from '../config/seo';

const ROBOTS_INDEX = 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1';

function setMeta(selector, attributes) {
  let element = document.head.querySelector(selector);
  if (!element) {
    element = document.createElement('meta');
    document.head.appendChild(element);
  }

  Object.entries(attributes).forEach(([name, value]) => element.setAttribute(name, value));
}

function setLink(selector, attributes) {
  let element = document.head.querySelector(selector);
  if (!element) {
    element = document.createElement('link');
    document.head.appendChild(element);
  }

  Object.entries(attributes).forEach(([name, value]) => element.setAttribute(name, value));
}

export function SEO() {
  const { pathname } = useLocation();

  useEffect(() => {
    const normalizedPath = pathname === '/' ? '/' : pathname.replace(/\/$/, '');
    const isAdmin = normalizedPath.startsWith('/admin');
    const page = routeSEO[normalizedPath];

    if (isAdmin || !page) {
      document.title = isAdmin ? `Admin | ${SITE_NAME}` : `Page Not Found | ${SITE_NAME}`;
      setMeta('meta[name="robots"]', { name: 'robots', content: 'noindex, nofollow' });
      return;
    }

    const canonical = canonicalFor(normalizedPath);
    const socialImage = `${SITE_URL}${SOCIAL_IMAGE_PATH}`;
    const socialDescription = page.ogDescription || page.description;

    document.title = page.title;
    setMeta('meta[name="description"]', { name: 'description', content: page.description });
    setMeta('meta[name="robots"]', { name: 'robots', content: ROBOTS_INDEX });
    setLink('link[rel="canonical"]', { rel: 'canonical', href: canonical });
    setMeta('meta[property="og:type"]', { property: 'og:type', content: 'website' });
    setMeta('meta[property="og:site_name"]', { property: 'og:site_name', content: SITE_NAME });
    setMeta('meta[property="og:title"]', { property: 'og:title', content: page.title });
    setMeta('meta[property="og:description"]', { property: 'og:description', content: socialDescription });
    setMeta('meta[property="og:url"]', { property: 'og:url', content: canonical });
    setMeta('meta[property="og:image"]', { property: 'og:image', content: socialImage });
    setMeta('meta[property="og:image:width"]', { property: 'og:image:width', content: '1200' });
    setMeta('meta[property="og:image:height"]', { property: 'og:image:height', content: '630' });
    setMeta('meta[property="og:image:alt"]', { property: 'og:image:alt', content: 'VIZO TECH — Engineering the Future of Digital Excellence' });
    setMeta('meta[name="twitter:card"]', { name: 'twitter:card', content: 'summary_large_image' });
    setMeta('meta[name="twitter:title"]', { name: 'twitter:title', content: page.title });
    setMeta('meta[name="twitter:description"]', { name: 'twitter:description', content: socialDescription });
    setMeta('meta[name="twitter:image"]', { name: 'twitter:image', content: socialImage });

    let jsonLd = document.head.querySelector('script[data-seo-jsonld]');
    if (!jsonLd) {
      jsonLd = document.createElement('script');
      jsonLd.type = 'application/ld+json';
      jsonLd.dataset.seoJsonld = '';
      document.head.appendChild(jsonLd);
    }
    jsonLd.textContent = JSON.stringify(structuredDataFor(normalizedPath));
  }, [pathname]);

  return null;
}
