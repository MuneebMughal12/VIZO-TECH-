import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { DEFAULT_SITE_URL, SITE_NAME, SOCIAL_IMAGE_PATH, canonicalFor, routeSEO, structuredDataFor } from '../src/config/seo.js';

const root = process.cwd();
const dist = path.join(root, 'dist');
const template = await readFile(path.join(dist, 'index.html'), 'utf8');
const siteUrl = (process.env.VITE_SITE_URL || DEFAULT_SITE_URL).replace(/\/$/, '');
const escapeHtml = (value) => value.replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');

function seoBlock(route, page) {
  const canonical = canonicalFor(route, siteUrl);
  const image = `${siteUrl}${SOCIAL_IMAGE_PATH}`;
  const socialDescription = page.ogDescription || page.description;
  return `<!-- SEO:START -->
    <title>${escapeHtml(page.title)}</title>
    <meta name="description" content="${escapeHtml(page.description)}" />
    <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
    <link rel="canonical" href="${canonical}" />
    <meta property="og:type" content="website" />
    <meta property="og:site_name" content="${SITE_NAME}" />
    <meta property="og:title" content="${escapeHtml(page.title)}" />
    <meta property="og:description" content="${escapeHtml(socialDescription)}" />
    <meta property="og:url" content="${canonical}" />
    <meta property="og:image" content="${image}" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta property="og:image:alt" content="VIZO TECH — Engineering the Future of Digital Excellence" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${escapeHtml(page.title)}" />
    <meta name="twitter:description" content="${escapeHtml(socialDescription)}" />
    <meta name="twitter:image" content="${image}" />
    <script type="application/ld+json" data-seo-jsonld>${JSON.stringify(structuredDataFor(route, siteUrl)).replaceAll('<', '\\u003c')}</script>
    <!-- SEO:END -->`;
}

for (const [route, page] of Object.entries(routeSEO)) {
  const html = template.replace(/<!-- SEO:START -->[\s\S]*?<!-- SEO:END -->/, seoBlock(route, page));
  if (route === '/') {
    await writeFile(path.join(dist, 'index.html'), html);
  } else {
    const directory = path.join(dist, route.slice(1));
    await mkdir(directory, { recursive: true });
    await writeFile(path.join(directory, 'index.html'), html);
  }
}

const routes = Object.keys(routeSEO);
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${routes.map((route) => `  <url><loc>${canonicalFor(route, siteUrl)}</loc></url>`).join('\n')}\n</urlset>\n`;
await writeFile(path.join(dist, 'sitemap.xml'), sitemap);
await writeFile(path.join(dist, 'robots.txt'), `User-agent: *\nAllow: /\nDisallow: /admin/\n\nSitemap: ${siteUrl}/sitemap.xml\n`);
