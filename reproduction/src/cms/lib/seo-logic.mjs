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

export const DEFAULT_SEO = {
    DE: {
        title: 'Fabry Baumpflege | Fachgerechte Baumpflege & Erhaltung',
        description: 'Professionelle Baumpflege, Baumerhaltung und sichere Baumfällung in Ostbelgien und Umgebung. Ihre Experten für gesunde Wälder und Gärten.',
        ogImage: 'https://cms.fabry-baumpflege.be/wp-content/uploads/2026/03/fabry-baumpflege-default-og.jpg',
        url: 'https://fabry-baumpflege.be',
        locale: 'de_DE'
    },
    FR: {
        title: 'Fabry Baumpflege | Soins des arbres et élagage professionnel',
        description: 'Votre expert pour les soins des arbres, la conservation et l\'abattage sécurisé en Communauté germanophone et environs.',
        ogImage: 'https://cms.fabry-baumpflege.be/wp-content/uploads/2026/03/fabry-baumpflege-default-og.jpg',
        url: 'https://fabry-baumpflege.be/fr',
        locale: 'fr_FR'
    }
};

/**
 * Resolves properties about the route
 */
export function resolveRouteContext(path) {
    const p = path.toLowerCase().replace(/\/$/, '') || '/';
    
    // Explicit Language
    const lang = p.startsWith('/fr') ? 'FR' : 'DE';
    const cleanPath = p.replace(/^\/fr(\/|$)/, '/').replace(/^\/de(\/|$)/, '/').replace(/\/$/, '') || '/';
    
    // Exact Matches
    if (cleanPath === '/') return { type: 'page', slug: 'home', lang, isHome: true };
    if (cleanPath === '/services' || cleanPath === '/leistungen') return { type: 'page', slug: cleanPath.substring(1), lang };
    if (cleanPath === '/a-propos' || cleanPath === '/ueber-mich') return { type: 'page', slug: cleanPath.substring(1), lang };
    if (cleanPath === '/contact' || cleanPath === '/kontakt') return { type: 'page', slug: cleanPath.substring(1), lang };
    if (cleanPath === '/references' || cleanPath === '/referenzen') return { type: 'page', slug: cleanPath.substring(1), lang };
    
    // Reference Details
    if (cleanPath.startsWith('/references/') || cleanPath.startsWith('/referenzen/')) {
        const slug = cleanPath.split('/').filter(Boolean).pop();
        return { type: 'reference', slug, lang };
    }

    // Generic fallback: Treat as a page with its slug
    const parts = cleanPath.split('/').filter(Boolean);
    if (parts.length === 1) {
        return { type: 'page', slug: parts[0], lang };
    }

    return { type: 'unknown', lang };
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
 * Shared Metadata Resolver: Prioritizes translated content over generic fallbacks
 */
export function resolveMetadata(route, apiData, globalSeo) {
    const seo = apiData?.seo || {};
    const defaults = DEFAULT_SEO[route.lang];

    // Priority 1: Page-level SEO Title
    // Priority 2: Page-level Native Title
    // Priority 3: Global Site SEO Title
    // Priority 4: Static Default
    let title = seo.title || apiData?.title || globalSeo?.title || defaults.title;
    
    // Safety: If FR but title is German, prefer Native Post Title or Defaults
    if (route.lang === 'FR' && (title.includes('Baumpflege') || title.includes('Gartenpflege'))) {
        title = apiData?.title || defaults.title;
    }

    // Append Site Name if missing and not Home
    if (title && !title.includes('Fabry Baumpflege') && !route.isHome) {
        title = `${title} | Fabry Baumpflege`;
    }

    // Priority 1: Page-level SEO Description
    // Priority 2: Page-level Native Excerpt
    // Priority 3: Global Site SEO Description
    // Priority 4: Static Default
    let description = seo.description || apiData?.excerpt || globalSeo?.description || defaults.description;

    // Safety: If FR but description is German, prefer Post Excerpt or Default FR
    if (route.lang === 'FR' && (description.includes('Baumpflege') || description.includes('Fachgerechte'))) {
        description = apiData?.excerpt || defaults.description;
    }

    // OG Image Priority: SEO Image -> Featured 1280 -> Global Default
    let ogImage = seo.og_image_url;
    if (!ogImage && apiData) {
        ogImage = getImageVariant(apiData.featured_image || apiData, '1280');
    }

    const currentUrl = `https://fabry-baumpflege.be${route.path || '/'}`;

    const metadata = {
        lang: route.lang.toLowerCase(),
        locale: defaults.locale,
        title: title,
        description: description,
        ogImage: ogImage || globalSeo?.og_image_url || defaults.ogImage,
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
