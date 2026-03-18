/**
 * ContentBridge V2 Runtime Resolver
 * ─────────────────────────────────────────────────────────────────────────────
 * Mappings are fetched fresh from /cb-mappings.json on every page load so that
 * ContentBridge Publish → browser refresh always reflects the latest manifest.
 *
 * /cb-mappings.json is served by the Vite dev middleware (no proxy interception)
 * and copied to dist/ during build for production.
 *
 * The bundled import below is the fallback used until the fetch resolves, or if
 * /cb-mappings.json is unavailable (e.g. offline / local build without dev server).
 */
import bundledMappings from './config/mappings.json';
import { resolveMedia } from '@/cms/lib/cms';

// ─── Runtime mappings (fetched fresh on page load) ───────────────────────────

let _runtimeMappings: any = null;
let _globalCmsData: any = null;
let _language: string = 'DE';

export function setGlobalCmsData(data: any) {
  _globalCmsData = data;
}

export function setBridgeLanguage(lang: string) {
  _language = lang;
}

const isBridgeDisabled = (typeof window !== 'undefined') && 
  (window.location.search.includes('bridge=off') || window.location.search.includes('cb=baseline'));

const _initPromise: Promise<void> = (typeof window !== 'undefined' && !isBridgeDisabled)
  ? fetch('/cb-mappings.json', {
      cache: 'no-store',
      headers: { Accept: 'application/json' },
    })
      .then(r => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then(data => {
        if (data?.pages) {
          _runtimeMappings = data;
          if ((import.meta as any).env?.DEV) {
            console.log(
              '[Bridge] Runtime mappings loaded from /cb-mappings.json.',
              `Published: ${data.publishedAt ?? 'unknown'}`,
              `Pages: [${Object.keys(data.pages).join(', ')}]`
            );
          }
        } else {
          console.warn('[Bridge] /cb-mappings.json had no pages key — using bundled fallback.');
        }
      })
      .catch(err => {
        console.warn('[Bridge] Could not load /cb-mappings.json:', err?.message ?? err, '— using bundled fallback.');
      })
  : Promise.resolve();


/** Returns the freshest mappings available. */
function getMappings(): typeof bundledMappings {
  return (_runtimeMappings as any) ?? bundledMappings;
}

/**
 * Waits for the runtime mappings fetch to settle.
 * Pages can await this inside their CMS-load useEffect to guarantee the
 * resolver sees the latest manifest before applying it.
 */
export function awaitMappings(): Promise<void> {
  return _initPromise;
}

// ─── Instance mapping lookup ─────────────────────────────────────────────────
 
 /**
  * Returns the merged prop mapping for a given page + instance path.
  * Paths can be hierarchical using slashes, e.g. "Sections/HeroSection/Button"
  * Global (_component) mappings are the base; page-level mappings override per-prop.
  */
 function getInstanceMapping(pageName: string, instancePath: string, mappings: any) {
   const pageMappings   = mappings?.pages?.[pageName];
   const globalMappings = mappings?.pages?.['Global']; // Explicit shared Global mappings
   const techMappings   = mappings?.pages?.['_component']; // Internal defaults
 
   const parts = instancePath.split('/');
 
   const findInInstances = (root: any, pathParts: string[]) => {
     let current = root;
     for (const part of pathParts) {
       current = current?.instances?.[part];
       if (!current) return null;
     }
     return current;
   };
 
   const pageInstance   = findInInstances(pageMappings, parts);
   const globalInstance = findInInstances(globalMappings, parts);
   const techInstance   = findInInstances(techMappings, parts);
 
   if (!pageInstance && !globalInstance && !techInstance) return null;
 
   // Merge properties from all levels: tech < global < specific page instance
   const mergedProps = {
     ...(techInstance?.props ?? {}),
     ...(globalInstance?.props ?? {}),
     ...(pageInstance?.props  ?? {}),
   };
 
   return {
     component: pageInstance?.component ?? globalInstance?.component ?? techInstance?.component,
     props: mergedProps,
   };
 }

// ─── CMS data normalisation ───────────────────────────────────────────────────

/**
 * Merges acf/meta/customFields into a single unified customFields object so
 * all fieldPaths using "customFields.*" work regardless of WP plugin.
 * Explicit customFields wins, then meta, then acf.
 */
function normalizeCmsData(obj: any): any {
  if (!obj || typeof obj !== 'object') return obj;

  const acf = (obj.acf && typeof obj.acf === 'object') ? obj.acf : {};
  const meta = (obj.meta && typeof obj.meta === 'object') ? obj.meta : {};
  const cf = (obj.customFields && typeof obj.customFields === 'object') ? obj.customFields : {};
  const data = (obj.data && typeof obj.data === 'object') ? obj.data : {};

  // Unified pool of all potential fields
  const pool = {
    ...obj,
    ...acf,
    ...meta,
    ...cf,
    ...data
  };

  // We mirror the pool into every possible namespace used in mappings (data.*, customFields.*, acf.*)
  // This makes the resolver extremely resilient to how data is grouped in the JSON.
  return { 
    ...pool, 
    customFields: pool, 
    data: pool,
    acf: pool 
  };
}

// ─── Field path resolution ────────────────────────────────────────────────────

/**
 * Walk a dot-separated field path through a normalised object.
 */
function resolvePath(fieldPath: string, obj: any): any {
  return fieldPath.split('.').reduce((o: any, key: string) => o?.[key], obj);
}

const PAGE_ID_MAP: Record<number, string> = {
  14: 'home',
  16: 'services',
  18: 'about',
  28: 'references',
  22: 'contact'
};

function resolvePageUrl(id: any, lang: string = 'DE'): string {
  const numId = typeof id === 'number' ? id : parseInt(id, 10);
  const routeKey = PAGE_ID_MAP[numId];
  
  // Minimal internal routes logic to avoid circular imports if possible,
  // or use a simplified version.
  const routes: any = {
    DE: { home: '/', services: '/leistungen', about: '/über-mich', references: '/referenzen', contact: '/kontakt' },
    FR: { home: '/fr', services: '/fr/services', about: '/fr/uber-moi', references: '/fr/references', contact: '/fr/contact' }
  };

  const set = routes[lang] || routes['DE'];
  return set[routeKey] || '/kontakt'; // contact is the safest fallback
}

/**
 * Strips the CMS host from a URL and converts it to an internal frontend route.
 * Only applies if the URL actually points to the known CMS domain.
 * Also preserves image URLs if they point to wp-content, as we don't proxy them.
 */
function normalizeUrl(v: string): string {
  if (!v || typeof v !== 'string' || !v.startsWith('http')) return v;
  
  // Known CMS host
  const cmsHost = 'cms.fabry-baumpflege.be';
  
  // Do not normalize if it doesn't contain the host
  if (!v.includes(cmsHost)) return v;

  // Do not normalize if it looks like a direct asset (image, pdf, etc.)
  // These usually live in /wp-content/uploads/ and should stay absolute.
  const assetExtensions = /\.(jpg|jpeg|png|gif|svg|webp|pdf|mp4|zip)$/i;
  if (assetExtensions.test(v)) return v;

  try {
    const urlObj = new URL(v);
    // Return relative path + search + hash
    // Example: https://cms.fabry-baumpflege.be/referenzen/test -> /referenzen/test
    let path = urlObj.pathname + urlObj.search + urlObj.hash;
    
    // Construct local origin if available to provide the full frontend URL
    if (typeof window !== 'undefined') {
        const origin = window.location.origin;
        return origin + path;
    }
    
    return path;
  } catch (e) {
    return v;
  }
}

/**
 * RICH OBJECT UNWRAPPER (Recursive & Semantic)
 */
function unwrap(v: any): any {
  if (v === undefined || v === null) return v;

  // 1. Handle numeric IDs (e.g. page_id: 28)
  if (typeof v === 'number' || (typeof v === 'string' && /^\d+$/.test(v))) {
    return resolvePageUrl(v, _language);
  }

  // 2. Handle general strings (URLs, etc.)
  if (typeof v === 'string') {
    return normalizeUrl(v);
  }

  if (typeof v !== 'object') return v;

  if (Array.isArray(v)) {
    return v.map(item => unwrap(item));
  }

  // 2. Handle Button/Link objects
  // Supports { link_mode: 'page', page_id: 28 } or { link_mode: 'external', url: '...' }
  if (v.link_mode) {
    if (v.link_mode === 'page' || v.link_mode === 'internal') {
      return resolvePageUrl(v.page_id || v.id, _language);
    }
    if (v.link_mode === 'external') {
      return normalizeUrl(v.url || v.href || '#');
    }
  }

  const url = v.url || v.source_url || v.full || v.src || v.imageUrl;
  const text = v.label || v.text || v.title || v.heading || v.caption || v.value;
  const link = v.link || v.permalink || v.href;
  const icon = v.icon || v.glyph || v.svg;

  // A. Semantic structure (Text + Link/Icon) -> Keep cleaned
  if (text && (url || link || icon)) {
    const cleaned: any = { text: unwrap(text) };
    if (link || url) cleaned.link = normalizeUrl(link || url);
    if (icon) cleaned.icon = icon;
    return cleaned;
  }

  // B. Single wrappers
  if (url && !text) return normalizeUrl(url);
  if (text && !url && !link) {
    if (v.rendered && typeof v.rendered === 'string') return v.rendered;
    if (Object.keys(v).length <= 5) return text;
    return v;
  }
  if (v.rendered && typeof v.rendered === 'string') return v.rendered;

  return v;
}

// ─── Image field extraction ───────────────────────────────────────────────────

/**
 * WHY THIS EXISTS
 * ─────────────────────────────────────────────────────────────────────────────
 * WordPress image/attachment fields can arrive in many shapes:
 *
 *   1. URL string       → use directly
 *   2. Media object     → extract from source_url / url / guid.rendered / sizes.*
 *   3. Media ID integer → resolve asynchronously via the WP media endpoint
 *   4. Metadata only    → mime_type, width, height, alt — Not a URL; keep fallback.
 *      A fieldPath like "customFields.headerbild.mime_type" resolves to "image/jpeg"
 *      which is not usable. In this case we also try the parent object
 *      ("customFields.headerbild") in case it has source_url/url.
 *
 * Returns:
 *   { url: string }    — ready to use as <img src>
 *   { mediaId: number} — needs async resolution, sync resolver keeps fallback
 *   { skip: true }     — not resolvable, keep local fallback
 */
function extractImageValue(
  resolvedVal: any
): { url?: string; mediaId?: number; skip?: true } {

  // ── Case 1: direct string (URL or potentially an ID) ──────────────────────
  if (typeof resolvedVal === 'string') {
    const trimmed = resolvedVal.trim();
    if (trimmed.startsWith('http') || trimmed.startsWith('/') || trimmed.startsWith('data:')) {
      return { url: trimmed };
    }
    
    // Numeric string ID (e.g. from some custom field setups)
    const asNum = parseInt(trimmed, 10);
    if (!isNaN(asNum) && String(asNum) === trimmed && asNum > 0) {
      return { mediaId: asNum };
    }

    return { skip: true };
  }

  // ── Case 2: media ID integer → needs async resolution ──────────────────────
  if (typeof resolvedVal === 'number' && Number.isInteger(resolvedVal) && resolvedVal > 0) {
    return { mediaId: resolvedVal };
  }

  // ── Case 3: media object → extract the best available URL ──────────────────
  if (resolvedVal && typeof resolvedVal === 'object') {
    const candidate =
      resolvedVal.source_url                           ||
      resolvedVal.url                                  ||
      resolvedVal.guid?.rendered                       ||
      resolvedVal.guid                                 || // Some setups have raw guid
      resolvedVal.sizes?.full?.source_url              ||
      resolvedVal.sizes?.large?.source_url             ||
      resolvedVal.sizes?.medium_large?.source_url      ||
      resolvedVal.sizes?.medium?.source_url;

    if (typeof candidate === 'string' && (candidate.startsWith('http') || candidate.startsWith('/'))) {
      return { url: candidate };
    }

    // Object might be a simple { id: 123 } reference
    const idCandidate = resolvedVal.id || resolvedVal.ID || resolvedVal.media_id;
    if (typeof idCandidate === 'number' && idCandidate > 0) {
      return { mediaId: idCandidate };
    }
  }

  return { skip: true };
}

/** Returns true if this prop name identifies an image/media field. */
function isImageProp(propName: string): boolean {
  const lower = propName.toLowerCase();
  return (
    lower.includes('image') ||
    lower.includes('photo') ||
    lower.includes('thumbnail') ||
    lower.includes('thumb') ||
    lower.includes('cover') ||
    lower.includes('banner') ||
    lower.includes('bild') ||    // German: "bild" = image
    lower.includes('foto') ||    // German: "foto" = photo
    lower.includes('gallery') || // Gallery support
    lower.includes('galerie')    // Gallery support (German/French)
  );
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Resolves props for a component instance synchronously.
 *
 * - Always reads the latest available mappings (runtime or bundled fallback).
 * - Merges global + page-level prop entries; page-level wins per-prop.
 * - Resolved CMS values always override localProps when non-empty.
 * - Image props are handled via extractImageValue():
 *     • URL string    → applied immediately
 *     • Media object  → URL extracted and applied immediately
 *     • Media ID      → skipped synchronously; use resolveInstancePropsAsync
 *     • Metadata only → parent object tried; if still no URL, local fallback kept
 */
export function resolveInstanceProps(
  pageName: string,
  instanceName: string,
  localProps: any,
  cmsData: any
): any {
  try {
    const mappings = getMappings();
    const instanceMapping = getInstanceMapping(pageName, instanceName, mappings);

    if (isBridgeDisabled || !instanceMapping) return localProps;
    if (!cmsData) return { ...localProps };

    const resolvedProps = { ...localProps };
    const normalizedData = normalizeCmsData(cmsData);
    const normalizedGlobal = _globalCmsData ? normalizeCmsData(_globalCmsData) : null;

    Object.entries(instanceMapping.props).forEach(([propName, mapping]: [string, any]) => {
      const fieldPath = mapping?.fieldPath;
      if (!fieldPath) return;

      // Smart Fallback Detection:
      // If sourceId is '39fpj02s' (Options) or 'nnnd3pjq' (Home/Startseite),
      // this property is intended to be a site-wide shared value.
      const isSharedSource = mapping.sourceId === '39fpj02s' || mapping.sourceId === 'nnnd3pjq';

      // Priority 1: Current page data (cmsData)
      let rawVal = resolvePath(fieldPath, normalizedData);

      // Priority 2: Global data fallback (globalCmsData) — for shared sources
      if ((rawVal === undefined || rawVal === null || rawVal === '') && isSharedSource && normalizedGlobal) {
        rawVal = resolvePath(fieldPath, normalizedGlobal);
      }

      if (isImageProp(propName)) {
        // ── Image prop: robust multi-format extraction ──────────────────────────
        if (Array.isArray(rawVal)) {
          // Gallery / Array of images
          const galleryUrls = rawVal
            .map(item => extractImageValue(item).url)
            .filter((url): url is string => !!url);
          
          if (galleryUrls.length > 0) {
            resolvedProps[propName] = galleryUrls;
          }
        } else {
          // Single image
          const extracted = extractImageValue(rawVal);
          if (extracted.url) {
            resolvedProps[propName] = extracted.url;
          }
        }
      } else {
        // ── Non-image prop: standard text/number/array resolution ──────────────
        if (rawVal === undefined || rawVal === null || rawVal === '') return;
        resolvedProps[propName] = unwrap(rawVal);
      }
    });

    return resolvedProps;
  } catch (err) {
    console.error(`[Bridge] Resolver error for ${pageName}/${instanceName}:`, err);
    return localProps;
  }
}

/**
 * Async variant of resolveInstanceProps.
 * Handles image props that resolved to WP media IDs (integers) by fetching
 * the media endpoint and extracting a usable source_url.
 * All other prop handling is identical to resolveInstanceProps.
 *
 * Use this in page useEffect hooks for sections that may have image mappings.
 */
export async function resolveInstancePropsAsync(
  pageName: string,
  instanceName: string,
  localProps: any,
  cmsData: any
): Promise<any> {
  try {
    await awaitMappings();

    const mappings = getMappings();
    const instanceMapping = getInstanceMapping(pageName, instanceName, mappings);

    if (isBridgeDisabled || !instanceMapping) return localProps;
    if (!cmsData) return localProps;

    const resolvedProps = { ...localProps };
    const asyncTasks: Promise<void>[] = [];
    const normalizedData = normalizeCmsData(cmsData);
    const normalizedGlobal = _globalCmsData ? normalizeCmsData(_globalCmsData) : null;

    Object.entries(instanceMapping.props).forEach(([propName, mapping]: [string, any]) => {
      const fieldPath = mapping?.fieldPath;
      if (!fieldPath) return;

      const isSharedSource = mapping.sourceId === '39fpj02s' || mapping.sourceId === 'nnnd3pjq';
      let rawVal = resolvePath(fieldPath, normalizedData);

      if ((rawVal === undefined || rawVal === null || rawVal === '') && isSharedSource && normalizedGlobal) {
        rawVal = resolvePath(fieldPath, normalizedGlobal);
      }

      if (isImageProp(propName)) {
        if (Array.isArray(rawVal)) {
          // Async Gallery handling
          const galleryPromises = rawVal.map(async (item) => {
            const extracted = extractImageValue(item);
            if (extracted.url) return extracted.url;
            if (extracted.mediaId) return await resolveMedia(extracted.mediaId);
            return null;
          });
          
          asyncTasks.push(
            Promise.all(galleryPromises).then(results => {
              const validUrls = results.filter((url): url is string => !!url);
              if (validUrls.length > 0) {
                resolvedProps[propName] = validUrls;
              }
            })
          );
        } else {
          // Single Image Async
          const extracted = extractImageValue(rawVal);
          if (extracted.url) {
            resolvedProps[propName] = extracted.url;
          } else if (extracted.mediaId) {
            asyncTasks.push(
              resolveMedia(extracted.mediaId).then(url => {
                if (url) resolvedProps[propName] = url;
              })
            );
          }
        }
      } else {
        if (rawVal === undefined || rawVal === null || rawVal === '') return;
        resolvedProps[propName] = unwrap(rawVal);
      }
    });

    await Promise.all(asyncTasks);
    return resolvedProps;
  } catch (err) {
    console.error(`[Bridge] Async resolver error for ${pageName}/${instanceName}:`, err);
    return localProps;
  }
}
