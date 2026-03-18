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
const cmsConfigSrc = readFileSync(
  path.resolve(import.meta.dirname, 'src/cms/lib/cmsConfig.js'),
  'utf8'
)
// Extract: export const CMS_HOST = '...';
const cmsHostMatch = cmsConfigSrc.match(/export\s+const\s+CMS_HOST\s*=\s*['"]([^'"]+)['"]/)
const CMS_HOST = cmsHostMatch
  ? cmsHostMatch[1]
  : 'http://cms.fabry-baumpflege.be' // fallback — keep in sync with cmsConfig.js

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

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), cbMappingsPlugin],
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, './src'),
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
        rewrite: (path) => path.replace(/^\/cms/, '/wp-json'),
      },
    },
  },
})
