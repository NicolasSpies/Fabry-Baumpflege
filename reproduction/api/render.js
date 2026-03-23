import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { resolveRouteContext, resolveMetadata, injectMetadata, getImageVariant, CMS_HOST } from '../src/cms/lib/seo-logic.mjs';
import { PRODUCTION_TEMPLATE } from '../src/cms/lib/template.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Serverless SEO Rendering Function (Vercel Node)
 */
export default async function handler(req, res) {
    const host = req.headers.host || 'fabry-baumpflege.be';
    
    const url = new URL(req.url, `https://${req.headers.host}`);
    const originalPath = url.searchParams.get('path') || url.pathname;
    const route = resolveRouteContext(originalPath);

    let pageData = null;
    let globalSeo = null;

    // 1. Concurrent Fetch: Page Content + Global SEO (in correct language)
    try {
        const fetchers = [
            fetch(`${CMS_HOST}/wp-json/content-core/v1/seo?lang=${route.lang.toLowerCase()}`).then(r => r.json())
        ];

        if (route.type === 'page') {
            const pageSlug = (originalPath === '/' || originalPath === '/fr') ? 'home' : route.slug;
            fetchers.push(fetch(`${CMS_HOST}/wp-json/content-core/v1/posts/page?slug=${pageSlug}&lang=${route.lang.toLowerCase()}&per_page=1`)
                .then(r => r.json())
                .then(arr => Array.isArray(arr) ? arr[0] : null));
        } else if (route.type === 'reference') {
            fetchers.push(fetch(`${CMS_HOST}/wp-json/content-core/v1/posts/referenzen?slug=${route.slug}&lang=${route.lang.toLowerCase()}&per_page=1`)
                .then(r => r.json())
                .then(arr => Array.isArray(arr) ? arr[0] : null));
        }

        const [globalResult, pageResult] = await Promise.all(fetchers);
        globalSeo = globalResult;
        pageData = pageResult;

        // Debug Logs (Priority 1 in Request)
        console.log(`[SEO-RENDER] Route: ${route.lang} ${route.type} /${route.slug || 'home'}`);
        console.log(`[SEO-RENDER] API:   ${pageData?.language || '??'} ${pageData?.type || '??'} /${pageData?.slug || '??'}`);

        // Strict mismatch handling: If non-home route returned no data or wrong slug, alert
        const isMismatched = !route.isHome && (!pageData || pageData.slug !== (route.slug || 'home'));
        if (isMismatched) {
            console.error(`[SEO-RENDER] MISMATCH/MISSING for ${originalPath}`);
        }
    } catch (e) {
        console.error(`[SEO-RENDER] Fetch fail:`, e.message);
    }

    // 2. Resolve Global Metadata Logic
    const metadata = resolveMetadata({ ...route, path: originalPath, isHome: originalPath === '/' || originalPath === '/fr' }, pageData, globalSeo);

    // 3. Transformation: Deterministic Rendering
    let html = PRODUCTION_TEMPLATE;

    // Add Production-Level Debug Markers
    const debugMarker = `<meta name="x-seo-runtime" content="api-ssr-deterministic">`;
    html = html.replace('</head>', `  ${debugMarker}\n</head>`);
    
    // Inject ALL fields (title, description, og, twitter, robots, canonical)
    html = injectMetadata(html, metadata);

    // 4. Final Response (Force Dynamic)
    res.setHeader('Content-Type', 'text/html');
    res.setHeader('Cache-Control', 'no-store, max-age=0, must-revalidate'); 
    res.status(200).send(html);
}
