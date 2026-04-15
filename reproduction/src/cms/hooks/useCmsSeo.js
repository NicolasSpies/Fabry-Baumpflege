import { useEffect } from 'react';
import { ROUTES } from '@/cms/i18n/routes';

/**
 * Compute the alternate-language URL for a given path.
 */
function getAlternatePath(pathname) {
  const normalize = (p) => decodeURIComponent(p).replace(/\/$/, '') || '/';
  const norm = normalize(pathname);
  const isFR = norm.startsWith('/fr');
  const currentRoutes = isFR ? ROUTES.FR : ROUTES.DE;
  const targetRoutes = isFR ? ROUTES.DE : ROUTES.FR;

  for (const [key, path] of Object.entries(currentRoutes)) {
    if (!path.includes(':') && normalize(path) === norm) {
      return { de: isFR ? targetRoutes[key] : norm, fr: isFR ? norm : targetRoutes[key] };
    }
  }

  // Detail route matching
  const detailBase = normalize(currentRoutes.referenceDetail?.split('/:')[0] || '');
  if (detailBase && (norm === detailBase || norm.startsWith(`${detailBase}/`))) {
    const slug = norm.slice(detailBase.length).replace(/^\//, '');
    const targetBase = normalize(targetRoutes.referenceDetail?.split('/:')[0] || '');
    const targetPath = slug ? `${targetBase}/${slug}` : targetBase;
    return { de: isFR ? targetPath : norm, fr: isFR ? norm : targetPath };
  }

  return { de: '/', fr: '/fr' };
}

/**
 * Hook to apply SEO metadata from Content Core API to the page head.
 * @param {Object} seo - The seo object from the CMS response.
 */
export function useCmsSeo(seo) {
  useEffect(() => {
    if (!seo) return;

    // 1. Title
    if (seo.title) {
        document.title = seo.title;
    }

    // 2. Meta tags helper
    const head = document.head;
    const updateOrCreateMeta = (name, property, content) => {
        if (!content) return;
        const selector = name ? `meta[name="${name}"]` : `meta[property="${property}"]`;
        let el = head.querySelector(selector);
        if (!el) {
            el = document.createElement('meta');
            if (name) el.setAttribute('name', name);
            if (property) el.setAttribute('property', property);
            head.appendChild(el);
        }
        el.setAttribute('content', content);
    };

    // Description
    updateOrCreateMeta('description', null, seo.description);

    // OG Image
    updateOrCreateMeta(null, 'og:image', seo.og_image_url);

    // Robots
    updateOrCreateMeta('robots', null, seo.robots);

    // 3. Canonical (Build from frontend URL)
    const currentUrlHost = window.location.hostname === 'localhost' ? 'fabry-baumpflege.be' : window.location.hostname;
    const currentUrl = `https://${currentUrlHost}${window.location.pathname}`;
    let canonicalLink = head.querySelector('link[rel="canonical"]');
    if (!canonicalLink) {
        canonicalLink = document.createElement('link');
        canonicalLink.setAttribute('rel', 'canonical');
        head.appendChild(canonicalLink);
    }
    canonicalLink.setAttribute('href', currentUrl);

    // og:url
    updateOrCreateMeta(null, 'og:url', currentUrl);

    // 4. hreflang alternate links (DE ↔ FR)
    const host = `https://${currentUrlHost}`;
    const alts = getAlternatePath(window.location.pathname);

    const updateOrCreateHreflang = (lang, href) => {
        const selector = `link[rel="alternate"][hreflang="${lang}"]`;
        let el = head.querySelector(selector);
        if (!el) {
            el = document.createElement('link');
            el.setAttribute('rel', 'alternate');
            el.setAttribute('hreflang', lang);
            head.appendChild(el);
        }
        el.setAttribute('href', href);
    };

    updateOrCreateHreflang('de', `${host}${alts.de}`);
    updateOrCreateHreflang('fr', `${host}${alts.fr}`);
    updateOrCreateHreflang('x-default', `${host}${alts.de}`);

  }, [seo]);
}

export default useCmsSeo;
