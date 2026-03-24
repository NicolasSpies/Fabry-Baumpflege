import { resolveRouteContext, CMS_HOST } from './src/cms/lib/seo-logic.mjs';

const routes = [
    '/',
    '/fr',
    '/leistungen',
    '/fr/services',
    '/referenzen/hier-die-zweite-referenz'
];

async function runAudit() {
    process.stdout.write('# Post-Update SEO & Data Fetching Audit\n\n');

    for (const path of routes) {
        process.stdout.write(`## Route: ${path}\n\n`);
        
        // 1. Route Resolution
        const route = resolveRouteContext(path);
        process.stdout.write('1. Route Resolution:\n');
        process.stdout.write(`   - Slug:      ${route.slug}\n`);
        process.stdout.write(`   - Type:      ${route.type}\n`);
        process.stdout.write(`   - isDetail:  ${route.isDetail}\n`);

        // 2. API Call Construction (matching vite.config.js logic)
        let apiPath;
        if (route.type === 'page') {
            apiPath = route.isDetail 
                ? `${CMS_HOST}/wp-json/content-core/v1/post/page/slug/${route.slug}?lang=${route.lang.toLowerCase()}`
                : `${CMS_HOST}/wp-json/content-core/v1/posts/page?slug=${route.slug}&lang=${route.lang.toLowerCase()}&per_page=1`;
        } else if (route.type === 'reference') {
            apiPath = `${CMS_HOST}/wp-json/content-core/v1/post/referenzen/slug/${route.slug}?lang=${route.lang.toLowerCase()}`;
        }
        process.stdout.write('\n2. API Call:\n');
        process.stdout.write(`   - Endpoint:  ${apiPath}\n`);
        process.stdout.write(`   - Strategy:  ${apiPath.includes('/post/') ? '/post/ (detail)' : '/posts/ (collection)'}\n`);

        // 3. Response Shape Check
        try {
            const res = await fetch(apiPath);
            const data = await res.json();
            const isArray = Array.isArray(data);
            process.stdout.write('\n3. Response Shape:\n');
            process.stdout.write(`   - Format:    ${isArray ? 'Array []' : 'Object {}'}\n`);
            
            // 4. SSR Output Sample (Final Check)
            const apiData = isArray ? data[0] : data;
            const seoTitle = apiData?.seo?.title || '';
            process.stdout.write('\n4. Content Check:\n');
            process.stdout.write(`   - CMS seo.title: "${seoTitle}"\n`);

            // 5. Fallback Check
            const isFallback = (seoTitle === '');
            process.stdout.write('\n5. Errors / Fallbacks:\n');
            process.stdout.write(`   - Fallback Triggered: ${isFallback ? 'YES (Empty SEO)' : 'NO'}\n`);
            process.stdout.write('------------------------------------------------------------\n\n');

        } catch (e) {
            process.stdout.write(`   - FETCH ERROR: ${e.message}\n\n`);
        }
    }
}

runAudit();
