import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID || 'G-L3ND34TXJE';

function initializeAnalytics() {
  if (window.__vizoAnalyticsInitialized) return;

  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${MEASUREMENT_ID}`;
  script.dataset.googleAnalytics = MEASUREMENT_ID;
  document.head.appendChild(script);

  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag() {
    window.dataLayer.push(arguments);
  };
  window.gtag('js', new Date());
  window.gtag('config', MEASUREMENT_ID, { send_page_view: false });
  window.__vizoAnalyticsInitialized = true;
}

export function GoogleAnalytics() {
  const location = useLocation();

  useEffect(() => {
    if (location.pathname.startsWith('/admin')) return;

    initializeAnalytics();
    const pagePath = `${location.pathname}${location.search}`;

    if (window.__vizoAnalyticsLastPage === pagePath) return;
    window.__vizoAnalyticsLastPage = pagePath;
    window.gtag('event', 'page_view', {
      page_title: document.title,
      page_location: window.location.href,
      page_path: pagePath,
    });
  }, [location.pathname, location.search]);

  return null;
}
