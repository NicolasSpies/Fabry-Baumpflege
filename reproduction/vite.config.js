import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// ── Central CMS host ──────────────────────────────────────────────────────────
// Read directly from the single source-of-truth config file.
// ContentBridge updates src/cms/lib/cmsConfig.js on commit; vite.config.js
// then automatically picks up the new host for the dev proxy.
import { createRequire } from 'module'
const _require = createRequire(import.meta.url)
import { readFileSync, copyFileSync, mkdirSync } from 'fs'

const MAPPINGS_SRC = path.resolve(import.meta.dirname, 'src/cms/config/mappings.json');

/**
 * Plugin that serves src/cms/config/mappings.json at /cb-mappings.json in dev.
 * Using /cb- prefix instead of /cms/ so the CMS proxy does NOT intercept it.
 * Also copies the file to dist/ after build so production deployments serve it too.
 */
const cbMappingsPlugin = {
  name: 'cb-serve-mappings',
  configureServer(server) {
    // Serve the live file on every request — always fresh, no caching.
    server.middlewares.use('/cb-mappings.json', (_req, res) => {
      try {
        const data = readFileSync(MAPPINGS_SRC, 'utf8');
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
        res.end(data);
      } catch {
        res.statusCode = 404;
        res.end('{}');
      }
    });
  },
  closeBundle() {
    // After vite build, copy mappings into dist/ so /cb-mappings.json works in prod.
    try {
      mkdirSync(path.resolve(import.meta.dirname, 'dist'), { recursive: true });
      copyFileSync(MAPPINGS_SRC, path.resolve(import.meta.dirname, 'dist/cb-mappings.json'));
    } catch { /* non-fatal — fallback to bundled mappings */ }
  },
};

import { resolveRouteContext, injectMetadata, resolveMetadata, getImageVariant, CMS_HOST, DEFAULT_SEO } from './src/cms/lib/seo-logic.mjs';

/**
 * SEO Injection Plugin for Vite (Dev and Build)
 */
const seoVitePlugin = {
  name: 'seo-injection-plugin',
  async transformIndexHtml(html, ctx) {
    const route = resolveRouteContext(ctx.originalUrl || ctx.path);
    const defaults = DEFAULT_SEO[route.lang];
    
    let apiData = null;
    let globalSeo = null;
    let ogType = 'website';

    try {
        const fetchers = [
            fetch(`${CMS_HOST}/wp-json/content-core/v1/seo?lang=${route.lang.toLowerCase()}`).then(r => r.json())
        ];

        if (route.type === 'page') {
            const pageSlug = route.isHome ? 'home' : route.slug;
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
        apiData = pageResult;

        // Debug Logs
        console.log(`[SEO-VITE] Route: ${route.lang} ${route.type} /${route.slug || 'home'}`);
        console.log(`[SEO-VITE] API:   ${apiData?.language || '??'} ${apiData?.type || '??'} /${apiData?.slug || '??'}`);

        // Strict mismatch handling: If non-home route returned no data or wrong slug, alert
        const isMismatched = !route.isHome && (!apiData || apiData.slug !== (route.slug || 'home'));
        if (isMismatched) {
            console.error(`[SEO-VITE] MISMATCH/MISSING for ${ctx.originalUrl || ctx.path}`);
        }
    } catch (e) {
        console.error(`[SEO-VITE] Fetch fail:`, e.message);
    }

    // 2. Resolve Metadata Logic
    const metadata = resolveMetadata({ ...route, path: ctx.originalUrl || ctx.path }, apiData, globalSeo);

    console.log(`[SEO-VITE] Serving ${route.lang} ${route.type}: ${metadata.title}`);

    // Add Debug Marker
    const debugMarker = `<meta name="x-seo-runtime" content="api-vite-${route.lang}-${route.type}">`;
    const markedHtml = html.replace(/<\/head>/i, `  ${debugMarker}\n</head>`);

    return injectMetadata(markedHtml, metadata);
  }
};

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), cbMappingsPlugin, seoVitePlugin],
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, './src'),
    },
  },
  build: {
    // Prevent inlining assets (like fonts) as base64 in CSS.
    // This reduces the initial render-blocking CSS size significantly.
    assetsInlineLimit: 0,
  },
  base: '/',
  server: {
    proxy: {
      // Proxy /cms/* → CMS_HOST/wp-json/*
      // Host is read from src/cms/lib/cmsConfig.js — the single source of truth.
      // In production, Vercel rewrites /cms/* to CMS_HOST/wp-json/* identically.
      '/cms': {
        target: CMS_HOST,
        changeOrigin: true,
        secure: true,
        followRedirects: true,
        rewrite: (path) => path.replace(/^\/cms/, '/wp-json'),
      },
    },
  },
})
