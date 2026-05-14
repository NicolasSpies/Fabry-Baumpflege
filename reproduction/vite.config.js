import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// ── Central CMS host ──────────────────────────────────────────────────────────
// Read directly from the single source-of-truth config file.
// ContentBridge updates src/cms/lib/cmsConfig.js on commit; vite.config.js
// then automatically picks up the new host for the dev proxy.
import { createRequire } from 'module'
const _require = createRequire(import.meta.url)
import { readFileSync, writeFileSync, copyFileSync, mkdirSync, readdirSync, unlinkSync, existsSync } from 'fs'

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

/**
 * Plugin that updates all <lastmod> dates in sitemap.xml to today's build date.
 * Runs after the bundle is written so the sitemap in the output dir is always fresh.
 */
const sitemapLastmodPlugin = {
  name: 'sitemap-lastmod',
  closeBundle() {
    const sitemapPath = path.resolve(import.meta.dirname, '..', 'sitemap.xml');
    if (!existsSync(sitemapPath)) return;
    try {
      const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
      const original = readFileSync(sitemapPath, 'utf8');
      const updated = original.replace(/<lastmod>[^<]+<\/lastmod>/g, `<lastmod>${today}</lastmod>`);
      if (updated !== original) {
        writeFileSync(sitemapPath, updated, 'utf8');
        console.log(`[sitemap-lastmod] Updated all <lastmod> to ${today}`);
      }
    } catch (e) {
      console.warn('[sitemap-lastmod] Failed to update sitemap.xml:', e.message);
    }
  },
};

/**
 * Plugin that cleans old hashed assets from the repo root before each build.
 * Since outDir is the repo root and emptyOutDir is false, old build artifacts
 * accumulate indefinitely. This plugin removes them before Vite writes new ones.
 */
const cleanOldAssetsPlugin = {
  name: 'clean-old-assets',
  buildStart() {
    const assetsDir = path.resolve(import.meta.dirname, '..', 'assets');
    if (!existsSync(assetsDir)) return;
    try {
      const files = readdirSync(assetsDir);
      for (const f of files) {
        try { unlinkSync(path.join(assetsDir, f)); } catch { /* skip */ }
      }
      console.log(`[clean-old-assets] Removed ${files.length} old asset files.`);
    } catch { /* non-fatal */ }
  },
};

import { resolveRouteContext, injectMetadata, resolveMetadata, CMS_HOST, DEFAULT_SEO } from './src/cms/lib/seo-logic.mjs';

// ─── Testimonial Rating Cache ─────────────────────────────────────────────────
// Fetched once per build; auto-updates aggregateRating in LocalBusiness schema.
// No manual edits to index.html needed when new Kundenstimmen are added to CMS.
// undefined = not yet fetched; null = fetched but failed (avoids re-fetching on every route)
let _testimonialRatingCache = undefined;
async function fetchTestimonialRating() {
  if (_testimonialRatingCache !== undefined) return _testimonialRatingCache;
  try {
    const res = await fetch(
      `${CMS_HOST}/wp-json/content-core/v1/posts/kundenstimmen?per_page=50&lang=de`
    );
    if (!res.ok) { _testimonialRatingCache = null; return null; }
    const data = await res.json();
    if (!Array.isArray(data) || !data.length) { _testimonialRatingCache = null; return null; }
    const ratings = data
      .map(t => parseFloat((t.customFields || t.acf || t.meta || {}).sterne || '5'))
      .filter(r => !isNaN(r) && r >= 1 && r <= 5);
    const count = data.length;
    const avgRating = ratings.length > 0
      ? Math.round((ratings.reduce((a, b) => a + b, 0) / ratings.length) * 10) / 10
      : 5;
    _testimonialRatingCache = { count, avgRating };
    console.log(`[seo-plugin] aggregateRating → ${count} Kundenstimmen, Ø ${avgRating} Sterne`);
    return _testimonialRatingCache;
  } catch (e) {
    console.warn('[seo-plugin] Kundenstimmen-Fetch fehlgeschlagen (aggregateRating unverändert):', e.message);
    _testimonialRatingCache = null;
    return null;
  }
}

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

    // Hoisted early so it runs in parallel with the SEO/page fetches below
    const testimonialRatingPromise = fetchTestimonialRating();

    try {
        const fetchers = [
            fetch(`${CMS_HOST}/wp-json/content-core/v1/seo?lang=${route.lang.toLowerCase()}`).then(r => r.json())
        ];

        if (route.type === 'page') {
            const apiPath = route.isDetail 
                ? `${CMS_HOST}/wp-json/content-core/v1/post/page/slug/${route.slug}?lang=${route.lang.toLowerCase()}`
                : `${CMS_HOST}/wp-json/content-core/v1/posts/page?slug=${route.slug}&lang=${route.lang.toLowerCase()}&per_page=1`;

            fetchers.push(fetch(apiPath)
                .then(r => r.json())
                .then(data => {
                    if (Array.isArray(data)) return data[0] || null;
                    return data || null;
                }));
        } else if (route.type === 'reference') {
            fetchers.push(fetch(`${CMS_HOST}/wp-json/content-core/v1/post/referenzen/slug/${route.slug}?lang=${route.lang.toLowerCase()}`)
                .then(r => r.json())
                .then(data => {
                    if (Array.isArray(data)) return data[0] || null;
                    return data || null;
                }));
        }

        const [globalResult, pageResult] = await Promise.all(fetchers);
        globalSeo = globalResult;
        apiData = pageResult;

        // Debug Logs
        console.log(`[SEO-VITE] Route: ${route.lang} ${route.type} /${route.slug}`);
        console.log(`[SEO-VITE] API:   ${apiData?.language || '??'} /${apiData?.slug || '??'}`);

        // Strict mismatch handling: Ensure we have data for the requested slug
        const isMismatched = !apiData || (route.slug !== '' && apiData.slug !== route.slug);
        if (isMismatched) {
            console.error(`[SEO-VITE] MISMATCH/MISSING for ${ctx.originalUrl || ctx.path}`);
        }
    } catch (e) {
        console.error(`[SEO-VITE] Fetch fail:`, e.message);
    }

    // 2. Resolve Metadata Logic
    const metadata = resolveMetadata({ ...route, path: ctx.originalUrl || ctx.path }, apiData, globalSeo);

    console.log(`[SEO-VITE] Serving ${route.lang} ${route.type}: ${metadata.title}`);

    // 3. LCP Hero Image Preload (Homepage only)
    let heroPreload = '';
    if (apiData && (route.slug === 'startseite' || route.slug === 'page-daccueil')) {
        const cf = apiData.customFields || apiData.acf || {};
        const heroImage = cf.startseite_headerbild;
        if (heroImage && typeof heroImage === 'object') {
            // API returns full image object with variants — use 1280 for desktop LCP
            const heroUrl = heroImage.variants?.['1280']?.url || heroImage.full?.url || heroImage.url;
            const srcset = heroImage.srcSet || heroImage.srcset;
            if (heroUrl) {
                // Use imagesrcset + imagesizes for responsive preload
                if (srcset) {
                    heroPreload = `  <link rel="preload" as="image" href="${heroUrl}" imagesrcset="${srcset}" imagesizes="(max-width: 768px) 100vw, (max-width: 1280px) 1280px, 100vw" fetchpriority="high" />\n`;
                } else {
                    heroPreload = `  <link rel="preload" as="image" href="${heroUrl}" fetchpriority="high" />\n`;
                }
                console.log(`[SEO-VITE] Hero preload: ${heroUrl}`);
            }
        }
    }

    // Add Debug Marker + Hero Preload
    const debugMarker = `<meta name="x-seo-runtime" content="api-vite-${route.lang}-${route.type}">`;
    const markedHtml = html.replace(/<\/head>/i, `  ${debugMarker}\n${heroPreload}</head>`);

    const testimonialRating = await testimonialRatingPromise;
    let finalHtml = injectMetadata(markedHtml, metadata);
    if (testimonialRating) {
      finalHtml = finalHtml
        .replace(/"reviewCount":\s*\d+/, `"reviewCount": ${testimonialRating.count}`)
        .replace(/"ratingValue":\s*[\d.]+/, `"ratingValue": ${testimonialRating.avgRating}`);
    }
    return finalHtml;
  }
};

/** Inject font preloads into index.html from the actual bundle (runs after asset hashing). */
const fontPreloadPlugin = {
  name: 'font-preload',
  enforce: 'post',
  generateBundle(_, bundle) {
    const criticalFonts = Object.keys(bundle).filter(f =>
      (f.includes('Inter-latin-') || f.includes('PlayfairDisplay-700-latin-')) &&
      f.endsWith('.woff2')
    );
    if (!criticalFonts.length) return;
    const preloads = criticalFonts.map(f =>
      `  <link rel="preload" as="font" href="/${f}" type="font/woff2" crossorigin />`
    ).join('\n');
    for (const [name, asset] of Object.entries(bundle)) {
      if (name.endsWith('.html') && asset.type === 'asset') {
        asset.source = String(asset.source).replace(/<\/head>/i, `${preloads}\n</head>`);
      }
    }
  }
};

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), cleanOldAssetsPlugin, cbMappingsPlugin, seoVitePlugin, fontPreloadPlugin, sitemapLastmodPlugin],
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, './src'),
    },
  },
  build: {
    // Prevent inlining assets (like fonts) as base64 in CSS.
    // This reduces the initial render-blocking CSS size significantly.
    assetsInlineLimit: 0,
    // Output to repo root for Hostinger git deployment
    outDir: path.resolve(import.meta.dirname, '..'),
    emptyOutDir: false,
    rollupOptions: {
      output: {
        // Split React/router into a separate vendor chunk for better cache reuse.
        // The vendor chunk changes rarely; app chunks change on every deploy.
        manualChunks(id) {
          if (id.includes('node_modules/react') || id.includes('node_modules/react-dom') || id.includes('node_modules/react-router')) {
            return 'vendor-react';
          }
        },
      },
    },
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
