// Using global fetch from Node 20
import { resolveMetadata, resolveRouteContext } from './src/cms/lib/seo-logic.mjs';

const API_BASE = 'https://cms.fabry-baumpflege.be/wp-json';

async function fetchRaw(url) {
    const res = await fetch(url);
    if (!res.ok) return null;
    return await res.json();
}

async function fetchGlobalSeo(lang) {
    const url = `${API_BASE}/content-core/v1/seo?language=${lang.toLowerCase()}&lang=${lang.toLowerCase()}`;
    return await fetchRaw(url);
}

const auditPages = [
    { name: 'DE Homepage', path: '/', api: `/content-core/v1/post/page/14?language=de`, lang: 'DE' },
    { name: 'FR Homepage', path: '/fr', api: `/content-core/v1/post/page/14?language=fr`, lang: 'FR' },
    { name: 'DE Services', path: '/leistungen', api: `/content-core/v1/post/page/16?language=de`, lang: 'DE' },
    { name: 'FR Services', path: '/fr/services', api: `/content-core/v1/post/page/16?language=fr`, lang: 'FR' },
    { name: 'DE Reference Detail', path: '/referenzen/hier-die-dritte-referenz', api: `/content-core/v1/post/referenzen/278?language=de`, lang: 'DE' },
    { name: 'FR Reference Detail', path: '/fr/references/ici-la-3e-reference', api: `/content-core/v1/post/referenzen/279?language=fr`, lang: 'FR' },
    { name: 'Overview (Referenzen)', path: '/referenzen', api: `/content-core/v1/post/page/28?language=de`, lang: 'DE' }
];

async function runAudit() {
    const globalSeoDe = await fetchGlobalSeo('DE');
    const globalSeoFr = await fetchGlobalSeo('FR');

    const results = [];

    for (const page of auditPages) {
        console.log(`Auditing: ${page.name}...`);
        const url = `${API_BASE}${page.api}`;
        const raw = await fetchRaw(url);
        
        const route = resolveRouteContext(page.path);
        route.path = page.path; // Ensure path is present for URL generation
        
        const globalSeo = page.lang === 'FR' ? globalSeoFr : globalSeoDe;
        const resolved = resolveMetadata(route, raw, globalSeo);

        results.push({
            name: page.name,
            path: page.path,
            layer1: {
                title: raw?.seo?.title,
                description: raw?.seo?.description,
                canonical: raw?.seo?.canonical,
                og_image_url: raw?.seo?.og_image_url,
                language: raw?.language || raw?.lang || raw?.pll_lang,
                slug: raw?.slug,
                resolved_path: raw?.resolved_path || raw?.link
            },
            layer2: {
                title: resolved.title,
                description: resolved.description,
                canonical: resolved.canonical,
                ogUrl: resolved.url,
                ogImage: resolved.ogImage,
                locale: resolved.locale,
                type: resolved.type
            }
        });
    }

    console.log(JSON.stringify(results, null, 2));
}

runAudit();
