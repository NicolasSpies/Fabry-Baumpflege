import { resolveRouteContext } from './src/cms/lib/seo-logic.mjs';

const CMS_HOST = 'https://cms.fabry-baumpflege.be';

async function testSeoMatching(urlPath) {
    const route = resolveRouteContext(urlPath);
    console.log(`[ROUTE-CONTEXT] Path: ${urlPath}`);
    console.log(`[ROUTE-CONTEXT] Lang: ${route.lang}, Type: ${route.type}, Slug: ${route.slug}`);

    let apiEndpoint = '';
    if (route.type === 'page') {
        const pageSlug = (urlPath === '/' || urlPath === '/fr') ? 'home' : route.slug;
        apiEndpoint = `${CMS_HOST}/wp-json/content-core/v1/posts/page?slug=${pageSlug}&lang=${route.lang.toLowerCase()}&per_page=1`;
    } else {
        apiEndpoint = `${CMS_HOST}/wp-json/content-core/v1/posts/referenzen?slug=${route.slug}&lang=${route.lang.toLowerCase()}&per_page=1`;
    }

    console.log(`[API-FETCH] ${apiEndpoint}`);
    const res = await fetch(apiEndpoint);
    const data = await res.json();
    const first = Array.isArray(data) ? data[0] : data;

    if (!first) {
        console.error(`[API-DATA] No data found!`);
        return;
    }

    console.log(`[API-DATA] Lang: ${first.language.toUpperCase()}, Type: ${first.type}, Slug: ${first.slug}`);
    console.log(`[MATCHING] route.slug (${route.slug || 'home'}) === apiData.slug (${first.slug}): ${ (route.slug || 'home') === first.slug}`);
}

(async () => {
    // Test a French Reference
    await testSeoMatching('/fr/references/ici-la-3e-reference');
    console.log('\n---');
    // Test a German Page
    await testSeoMatching('/leistungen');
})();
