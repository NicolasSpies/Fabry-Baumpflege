import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { resolveRouteContext, resolveMetadata, injectMetadata, CMS_HOST } from '../src/cms/lib/seo-logic.mjs';
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
            const isHome = originalPath === '/' || originalPath === '/fr';
            const pageSlug = isHome 
                ? (route.lang === 'FR' ? 'page-daccueil' : 'startseite') 
                : route.slug;
            
            fetchers.push(fetch(`${CMS_HOST}/wp-json/content-core/v1/post/page/slug/${pageSlug}?lang=${route.lang.toLowerCase()}`).then(r => r.json()));
        } else if (route.type === 'reference') {
            fetchers.push(fetch(`${CMS_HOST}/wp-json/content-core/v1/post/referenzen/slug/${route.slug}?lang=${route.lang.toLowerCase()}`).then(r => r.json()));
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

    // 3. Asset & Template Discovery
    let html = PRODUCTION_TEMPLATE;
    try {
        const buildPath = path.resolve(__dirname, '../dist/index.html');
        if (fs.existsSync(buildPath)) {
            html = fs.readFileSync(buildPath, 'utf8');
        }
    } catch (e) {
        // Fallback to embedded template
    }

    // Capture the state for hydration handoff
    const ssrState = {
        // For security and performance, we only pass critical IDs and pre-fetched data
        page: pageData,
        global: globalSeo,
        route: route,
        timestamp: Date.now()
    };
    const ssrScript = `<script id="__SSR_DATA__" type="application/json">${JSON.stringify(ssrState)}</script>`;

    // Add Production-Level Debug Markers and SSR Data
    const debugMarker = `<meta name="x-seo-runtime" content="api-ssr-deterministic">`;
    html = html.replace('</head>', `  ${debugMarker}\n  ${ssrScript}\n</head>`);
    
    // Safety: If we're on Vercel but using the fallback template, 
    // remove the dev-only /src/main.jsx script to avoid hydration crashes.
    if (req.headers['x-vercel-id'] && html.includes('/src/main.jsx')) {
        html = html.replace('<script type="module" src="/src/main.jsx"></script>', '');
    }

    // Inject SEO Metadata
    html = injectMetadata(html, metadata);

    // 4. Final Response (Force Dynamic)
    res.setHeader('Content-Type', 'text/html');
    res.setHeader('Cache-Control', 'no-store, max-age=0, must-revalidate'); 
    res.status(200).send(html);
}
