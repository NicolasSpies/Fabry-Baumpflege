/**
 * CMS Host Configuration
 * ─────────────────────────────────────────────────────────────────────────────
 * THIS IS THE SINGLE SOURCE OF TRUTH for the CMS backend URL.
 *
 * ContentBridge will update CMS_HOST automatically during commit.
 * Do not duplicate this value in any other file.
 *
 * Architecture notes:
 *   - In development, Vite proxies all /cms/* requests to CMS_HOST
 *     (see vite.config.js — it reads CMS_HOST from here via the shared module)
 *   - At runtime the frontend calls the relative path /cms/wp/v2/…
 *     so CMS_HOST never appears in the browser bundle itself.
 *   - CMS_HOST is used by vite.config.js (Node.js) and by the dev proxy only.
 */

// contentbridge:cms-host
export const CMS_HOST = 'http://cms.fabry-baumpflege.be';

/**
 * The WordPress REST API v2 base path, relative to the Vite dev proxy.
 * All fetch calls in cms.js use this path.
 *
 * In production, Vercel rewrites /cms/* → CMS_HOST/wp-json/* identically.
 */
export const CMS_API_BASE = import.meta.env.VITE_API_URL || '/cms/wp/v2';
