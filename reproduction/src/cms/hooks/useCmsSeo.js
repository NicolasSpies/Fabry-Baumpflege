import { useEffect } from 'react';

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

  }, [seo]);
}

export default useCmsSeo;
