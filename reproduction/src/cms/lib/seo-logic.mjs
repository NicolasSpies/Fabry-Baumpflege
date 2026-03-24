/**
 * Shared SEO Constants & Logic
 * ─────────────────────────────────────────────────────────────────────────────
 * Used by Vercel Middleware (Production) and Vite Plugin (Development).
 */

export const CMS_HOST = 'https://cms.fabry-baumpflege.be';

export const PAGE_IDS = {
    home: 14,
    services: 16,
    about: 18,
    contact: 22,
    references: 28
};

export const DEFAULT_SEO = {}; // Legacy - No longer used in conduit mode

/**
 * Path Resolver: Pure Conduit Protocol
 * ─────────────────────────────────────────────────────────────────────────────
 * Maps the public URL to a route context for the CMS API.
 * The root '/' is mapped to an empty slug to fetch the Front Page naturally.
 */
export function resolveRouteContext(path) {
    const p = path.toLowerCase().split('?')[0].split('#')[0].replace(/\/$/, '') || '/';
    const lang = p.startsWith('/fr') ? 'FR' : 'DE';
    
    // Normalize path (Removes /fr/, /de/, index.html, and slashes)
    let cleanPath = p.replace(/^\/fr(\/|$)/, '/').replace(/^\/de(\/|$)/, '/');
    cleanPath = cleanPath.replace(/\/index\.html$/, '/').replace(/\/$/, '') || '/';
    
    // Type Detection
    let route = { type: 'page', lang, isDetail: false };

    // 1. Reference Details Pattern: /referenzen/slug or /fr/references/slug
    if (cleanPath.startsWith('/referenzen/') || cleanPath.startsWith('/references/')) {
        route.type = 'reference';
        route.slug = cleanPath.split('/').pop();
        route.isDetail = true;
    } else if (cleanPath === '/') {
        // 2. Homepage Detection: Map to explicit detail slugs
        route.slug = lang === 'FR' ? 'page-daccueil' : 'startseite';
        route.isDetail = true;
    } else {
        // 3. Everything else is a Page (Slug is the URL segment)
        route.slug = cleanPath.split('/').filter(Boolean)[0];
    }

    return route;
}

export function getImageVariant(image, size = '768') {
    if (!image) return '';
    const variants = image.variants || image.media?.variants || {};
    
    // 1. Explicit requested size (if exists)
    if (variants[size]?.url) return variants[size].url;
    
    // 2. Original escape hatch: Bypass fallbacks if explicitly asking for master
    if (size === 'original') return image.url || image.src || '';
    
    // 3. Performance Fallback chain
    return variants['768']?.url || variants['480']?.url || image.url || image.src || '';
}

/**
 * Shared Metadata Resolver: Pure Conduit Protocol
 * ─────────────────────────────────────────────────────────────────────────────
 * All content-level SEO (titles, descriptions, images) are delivered 1:1 from 
 * the CMS API. The frontend only maintains authority over canonical URLs
 * to ensure they are relative to the production domain.
 */
export function resolveMetadata(route, apiData, globalSeo) {
    const seo = apiData?.seo || {};

    // 1. Direct API Conduit (Zero Transformation)
    const title = seo.title || '';
    const description = seo.description || '';
    const ogImage = seo.og_image_url || globalSeo?.default_og_image_url || '';

    // 2. Canonical Logic (Frontend Authority)
    // Enforce public domain and trailing slashes for indexing consistency
    let cleanPath = (route.path || '/').split('?')[0].split('#')[0];
    if (!cleanPath.endsWith('/')) {
        cleanPath += '/';
    }
    const currentUrl = `https://fabry-baumpflege.be${cleanPath}`;

    const metadata = {
        lang: route.lang.toLowerCase(),
        locale: route.lang === 'FR' ? 'fr_FR' : 'de_DE',
        title: title,
        description: description,
        ogImage: ogImage,
        ogTitle: seo.og_title || title,
        ogDescription: seo.og_description || description,
        url: currentUrl,
        canonical: currentUrl,
        robots: seo.robots || 'index, follow',
        type: route.type === 'reference' ? 'article' : 'website'
    };

    return metadata;
}

/**
 * Perform the Actual Injection Logic on an HTML string
 */
export function injectMetadata(html, metadata) {
    let output = html;

    // 1. HTML Lang (Handles multi-line or complicated attributes)
    const htmlPattern = /<html([^>]*?)lang=".*?"([^>]*?)>/is;
    output = output.replace(htmlPattern, `<html$1lang="${metadata.lang}"$2>`);

    // 2. Title (Handles multi-line titles)
    output = output.replace(/<title>.*?<\/title>/is, `<title>${metadata.title}</title>`);

    // 3. Meta Tags (Grouped for reliability)
    const metaReplacements = [
        { pattern: /<meta name="description" content=".*?" \/>/is, value: `<meta name="description" content="${metadata.description}" />` },
        { pattern: /<meta name="robots" content=".*?" \/>/is, value: `<meta name="robots" content="${metadata.robots}" />` },
        { pattern: /<meta property="og:title" content=".*?" \/>/is, value: `<meta property="og:title" content="${metadata.ogTitle}" />` },
        { pattern: /<meta property="og:description" content=".*?" \/>/is, value: `<meta property="og:description" content="${metadata.ogDescription}" />` },
        { pattern: /<meta property="og:image" content=".*?" \/>/is, value: `<meta property="og:image" content="${metadata.ogImage}" />` },
        { pattern: /<meta property="og:url" content=".*?" \/>/is, value: `<meta property="og:url" content="${metadata.url}" />` },
        { pattern: /<meta property="og:type" content=".*?" \/>/is, value: `<meta property="og:type" content="${metadata.type}" />` },
        { pattern: /<meta property="og:locale" content=".*?" \/>/is, value: `<meta property="og:locale" content="${metadata.locale}" />` },
        { pattern: /<meta name="twitter:title" content=".*?" \/>/is, value: `<meta name="twitter:title" content="${metadata.ogTitle}" />` },
        { pattern: /<meta name="twitter:description" content=".*?" \/>/is, value: `<meta name="twitter:description" content="${metadata.ogDescription}" />` },
        { pattern: /<meta name="twitter:image" content=".*?" \/>/is, value: `<meta name="twitter:image" content="${metadata.ogImage}" />` }
    ];

    for (const { pattern, value } of metaReplacements) {
        output = output.replace(pattern, value);
    }

    // 4. Canonical (Replace if exists, else inject before </head>)
    const canonicalLine = `  <link rel="canonical" href="${metadata.canonical}" />\n`;
    const canonicalPattern = /<link rel="canonical" href=".*?" \/>/is;
    if (canonicalPattern.test(output)) {
        output = output.replace(canonicalPattern, canonicalLine.trim());
    } else {
        output = output.replace('</head>', `${canonicalLine}</head>`);
    }

    // 5. Local Business Schema (Global JSON-LD)
    const localBusinessSchema = `
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "name": "Fabry Baumpflege",
  "url": "https://fabry-baumpflege.be",
  "image": "https://cms.fabry-baumpflege.be/wp-content/uploads/2026/03/Baumpflege-Fabry-Logo-Komplett-verlauf.svg",
  "telephone": "+32476320969",
  "areaServed": "Ostbelgien",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "Halloux 16",
    "postalCode": "4830",
    "addressLocality": "Limbourg",
    "addressCountry": "BE"
  },
  "openingHoursSpecification": [
    {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": ["Monday","Tuesday","Wednesday","Thursday","Friday"],
      "opens": "08:00",
      "closes": "17:00"
    }
  ]
}
</script>
`;
    output = output.replace('</head>', `${localBusinessSchema}</head>`);

    return output;
}
