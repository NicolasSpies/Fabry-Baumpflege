// ─── CMS API Base ─────────────────────────────────────────────────────────────
//
// The CMS host is defined in one central place:
//   src/cms/lib/cmsConfig.js  ← ContentBridge updates that file on commit.
//
// All REST calls use the relative /cms/wp/v2 proxy path so the host never
// leaks into the browser bundle. The dev proxy in vite.config.js forwards
// /cms/* → CMS_HOST/wp-json/* using the same cmsConfig.js value.
//
import { CMS_API_BASE, CMS_HOST } from '@/cms/lib/cmsConfig';

// ─── Language helpers ─────────────────────────────────────────────────────────

/** Language codes used in API query params and legacy Polylang fields. */
export const PLLCode = { DE: 'de', FR: 'fr' };
export const DEFAULT_LANGUAGE = 'DE';
export const PAGE_IDS = {
    home: 14,
    services: 16,
    about: 18,
    contact: 22,
    references: 28,
};

const CMS_CACHE_TTL_MS = 5 * 60 * 1000;
const cmsResponseCache = new Map();
const cmsInflightCache = new Map();

function cloneCmsPayload(payload) {
    if (payload === undefined || payload === null) return payload;
    if (typeof structuredClone === 'function') {
        return structuredClone(payload);
    }
    return JSON.parse(JSON.stringify(payload));
}

export function decodeHtmlEntities(value) {
    if (typeof value !== 'string' || !value.includes('&')) return value;

    if (typeof document !== 'undefined') {
        const textarea = document.createElement('textarea');
        textarea.innerHTML = value;
        return textarea.value;
    }

    return value
        .replace(/&#8211;|&#x2013;/gi, '–')
        .replace(/&#8212;|&#x2014;/gi, '—')
        .replace(/&#038;|&amp;/gi, '&')
        .replace(/&#039;|&apos;/gi, "'")
        .replace(/&quot;/gi, '"')
        .replace(/&lt;/gi, '<')
        .replace(/&gt;/gi, '>');
}

function buildResponsiveSourceList(image) {
    if (!image || typeof image !== 'object') return [];

    const collected = [];
    const pushSource = (entry, key) => {
        if (!entry || typeof entry !== 'object') return;
        const entryUrl = entry.url || entry.source_url || (typeof entry === 'string' ? entry : '');
        if (!entryUrl || typeof entryUrl !== 'string') return;
        
        // Skip if this URL is already collected
        if (collected.some(e => e.url === entryUrl)) return;

        collected.push({
            key,
            url: entryUrl,
            width: Number(entry.width || entry.file_width) || undefined,
            height: Number(entry.height || entry.file_height) || undefined,
            mime_type: entry.mime_type || entry['mime-type'] || '',
        });
    };

    // 1. Content Core 'sources' map
    if (image.sources && typeof image.sources === 'object') {
        Object.entries(image.sources).forEach(([key, entry]) => pushSource(entry, key));
    }

    // 2. Standard WP 'media_details.sizes'
    const wpSizes = image.media_details?.sizes || image.media_details?.image_meta?.sizes;
    if (wpSizes && typeof wpSizes === 'object') {
        Object.entries(wpSizes).forEach(([key, entry]) => pushSource(entry, key));
    }

    // 3. Generic 'sizes' map (common in ACF / some REST payloads)
    if (image.sizes && typeof image.sizes === 'object') {
        Object.entries(image.sizes).forEach(([key, entry]) => {
            // Some payloads have a 'sizes' string or other non-size objects inside 'sizes'
            if (typeof entry === 'object' && entry !== null) {
                pushSource(entry, key);
            }
        });
    }

    // 4. Known variant buckets
    if (image.full) pushSource(image.full, 'full');
    if (image.fallback) pushSource(image.fallback, 'fallback');

    // 5. Main asset source
    const mainUrl = image.src || image.url || image.source_url || image.guid?.rendered || image.guid;
    if (mainUrl && typeof mainUrl === 'string') {
        pushSource({
            url: mainUrl,
            width: image.width || image.media_details?.width,
            height: image.height || image.media_details?.height,
            mime_type: image.mime_type || image.media_details?.mime_type
        }, 'original');
    }

    return collected
        .filter((entry) => entry.url && entry.width)
        .sort((a, b) => (a.width || 0) - (b.width || 0));
}

export function normalizeCmsImage(image) {
    if (!image) return null;

    if (typeof image === 'string') {
        return {
            src: image,
            url: image,
            srcSet: '',
            sizes: '',
            alt: '',
            width: undefined,
            height: undefined,
            full: { url: image },
            sources: {},
            fallback: { url: image },
        };
    }

    if (typeof image !== 'object' || Array.isArray(image)) return null;

    const sourceList = buildResponsiveSourceList(image);
    
    // Preferred candidate for the 'src' attribute fallback
    const preferredSource =
        image.sources?.cc_medium ||
        image.sources?.cc_small ||
        image.media_details?.sizes?.medium ||
        image.sizes?.medium ||
        sourceList.find(s => s.width >= 600 && s.width <= 1200) ||
        image.full ||
        image.fallback ||
        sourceList[0] ||
        null;

    const src =
        preferredSource?.url ||
        image.src ||
        image.url ||
        image.source_url ||
        '';

    const width = Number(image.width) || preferredSource?.width || undefined;
    const height = Number(image.height) || preferredSource?.height || undefined;

    const srcSet =
        image.srcSet ||
        image.srcset ||
        sourceList
            .map((entry) => `${entry.url} ${entry.width}w`)
            .join(', ');

    return {
        ...image,
        src,
        url: image.url || src,
        srcSet,
        sizes: image.sizes || '',
        alt: image.alt || image.title?.rendered || '',
        width,
        height,
        full: image.full || (src ? { url: src, width, height } : null),
        sources: image.sources || {},
        fallback: image.fallback || (src ? { url: src, width, height } : null),
    };
}

export function getCmsImageProps(image, options = {}) {
    const normalized = normalizeCmsImage(image);
    if (!normalized?.src) return null;

    // Use preferences as a hint for the initial fallback 'src' attribute.
    // This is useful for pre-hydration or no-JS scenarios, but should NOT
    // prevent the browser from using the full srcset.
    const preferredMediumSource =
        normalized.sources?.cc_medium ||
        normalized.sources?.cc_large ||
        normalized.full ||
        normalized.fallback ||
        null;
    const preferredMobileSource =
        normalized.sources?.cc_small ||
        normalized.fallback ||
        normalized.full ||
        null;

    const useMediumFallback = Boolean(options.preferMedium && preferredMediumSource?.url);
    const useSmallFallback = Boolean(options.preferSmall && preferredMobileSource?.url);

    const activeFallback = useSmallFallback 
        ? preferredMobileSource 
        : (useMediumFallback ? preferredMediumSource : normalized);

    const props = {
        src: activeFallback.url || activeFallback.src || normalized.src,
        alt: options.alt ?? normalized.alt ?? '',
    };

    // ALWAYS provide srcset and sizes so the browser can make the most efficient choice.
    if (normalized.srcSet) props.srcSet = normalized.srcSet;
    if (options.sizes || normalized.sizes) {
        props.sizes = options.sizes || normalized.sizes;
    }

    if (activeFallback.width || normalized.width) props.width = activeFallback.width || normalized.width;
    if (activeFallback.height || normalized.height) props.height = activeFallback.height || normalized.height;
    
    if (options.loading) props.loading = options.loading;
    if (options.decoding) props.decoding = options.decoding;
    if (options.fetchPriority) props.fetchPriority = options.fetchPriority;

    return props;
}


function getRootApiBase() {
    const base = String(CMS_API_BASE || '').replace(/\/+$/, '');

    if (!base) return '/cms';
    if (base === '/cms' || base.startsWith('/cms/')) {
        return base.replace(/\/wp\/v2$/, '');
    }
    if (base.includes('/wp-json/')) {
        return base.replace(/\/wp\/v2$/, '');
    }
    if (base.endsWith('/wp-json')) {
        return base;
    }
    if (base.endsWith('/wp/v2')) {
        return `${base.slice(0, -'/wp/v2'.length)}/wp-json`;
    }

    return `${base}/wp-json`;
}

function getAbsoluteCmsRootApiBase() {
    const host = String(CMS_HOST || '').replace(/\/+$/, '').replace(/^http:\/\//i, 'https://');

    if (!host) return 'https://cms.fabry-baumpflege.be/wp-json';
    if (host.includes('/wp-json')) return host.replace(/\/wp\/v2$/, '');
    if (host.endsWith('/wp/v2')) return `${host.slice(0, -'/wp/v2'.length)}/wp-json`;

    return `${host}/wp-json`;
}

// ─── Core fetch helper ────────────────────────────────────────────────────────

/**
 * Fetch from the CMS REST API.
 * @param {string} endpoint  - path starting with /  e.g. '/references?_embed=1'
 * @param {string} language  - 'DE' | 'FR'
 * @param {AbortSignal} [signal]
 */
export async function fetchFromCMS(endpoint, language = 'DE', signal = null) {
    const langCode = PLLCode[language] ?? 'de';

    /**
     * Determine the correct API base.
     * Most WP endpoints are under /wp/v2, but custom plugins (like content-core)
     * register their namespaces at the root level of /wp-json/.
     */
    const isRootNamespace = endpoint.startsWith('/content-core') || endpoint.startsWith('/polylang');
    const apiBase = isRootNamespace
        ? CMS_API_BASE.replace('/wp/v2', '') 
        : CMS_API_BASE;
    const separator = endpoint.includes('?') ? '&' : '?';
    const languageParam = `language=${encodeURIComponent(langCode)}`;
    const legacyLangParam = isRootNamespace ? '' : `&lang=${encodeURIComponent(langCode)}`;

    // Content Core expects `language`, while legacy WP endpoints still rely on `lang`.
    const url = `${apiBase}${endpoint}${separator}${languageParam}${legacyLangParam}`;

    const now = Date.now();
    const cached = cmsResponseCache.get(url);
    if (cached && cached.expiresAt > now) {
        return cloneCmsPayload(cached.data);
    }
    if (cached) {
        cmsResponseCache.delete(url);
    }

    if (!signal) {
        const inflight = cmsInflightCache.get(url);
        if (inflight) {
            return cloneCmsPayload(await inflight);
        }
    }

    const requestPromise = (async () => {
        const response = await fetch(url, signal ? { signal } : undefined);

        if (!response.ok) {
            throw new Error(`CMS fetch failed: ${response.status} ${response.statusText} — ${url}`);
        }

        return response.json();
    })();

    if (!signal) {
        cmsInflightCache.set(url, requestPromise);
    }

    try {
        const payload = await requestPromise;
        if (!signal) {
            cmsResponseCache.set(url, {
                data: payload,
                expiresAt: Date.now() + CMS_CACHE_TTL_MS,
            });
        }
        return cloneCmsPayload(payload);
    } finally {
        if (!signal) {
            cmsInflightCache.delete(url);
        }
    }
}

function stripHtml(value) {
    if (typeof value !== 'string') return value;

    if (typeof document !== 'undefined') {
        const div = document.createElement('div');
        div.innerHTML = value;
        return div.textContent || div.innerText || '';
    }

    return value.replace(/<[^>]+>/g, '').trim();
}

export async function submitForm(slug, values, language = 'DE', signal = null) {
    const langCode = PLLCode[language] ?? 'de';
    const apiBase = getAbsoluteCmsRootApiBase();
    const url = `${apiBase}/content-core/v1/forms/${encodeURIComponent(slug)}/submit?language=${encodeURIComponent(langCode)}&lang=${encodeURIComponent(langCode)}`;
    const isFormData = typeof FormData !== 'undefined' && values instanceof FormData;
    const response = await fetch(url, {
        method: 'POST',
        headers: {
            Accept: 'application/json',
        },
        ...(isFormData
            ? { body: values }
            : {
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
                },
                body: new URLSearchParams(values || {}),
            }),
        ...(signal ? { signal } : {}),
    });

    const contentType = response.headers.get('content-type') || '';
    const payload = contentType.includes('application/json')
        ? await response.json()
        : { message: stripHtml(await response.text()) };

    if (!response.ok) {
        const error = new Error(stripHtml(payload?.message) || `Form submit failed: ${response.status}`);
        error.payload = payload;
        error.status = response.status;
        throw error;
    }

    return payload;
}

/**
 * Fetch a specific page by numeric ID through Content Core.
 */
export async function getPage(pageId, language = 'DE', signal = null) {
    if (!pageId) return null;
    const page = await fetchFromCMS(`/content-core/v1/post/page/${pageId}`, language, signal);
    return page;
}


function isEmptyCmsValue(value) {
    if (value === undefined || value === null || value === '') return true;
    if (Array.isArray(value)) return value.length === 0;
    return false;
}

function mergeCmsValues(primary, fallback) {
    if (isEmptyCmsValue(primary)) return fallback;
    if (isEmptyCmsValue(fallback)) return primary;

    if (Array.isArray(primary) || Array.isArray(fallback)) {
        return Array.isArray(primary) && primary.length > 0 ? primary : fallback;
    }

    if (typeof primary === 'object' && typeof fallback === 'object' && primary && fallback) {
        const merged = { ...fallback, ...primary };
        const keys = new Set([...Object.keys(fallback), ...Object.keys(primary)]);

        keys.forEach((key) => {
            merged[key] = mergeCmsValues(primary[key], fallback[key]);
        });

        return merged;
    }

    return primary;
}

export function mergeCmsContent(primary, fallback) {
    if (!primary) return fallback;
    if (!fallback) return primary;
    return mergeCmsValues(primary, fallback);
}

/**
 * Fetch site options (global settings).
 */
export async function getOptions(language = 'DE', signal = null) {
    try {
        const options = await fetchFromCMS('/content-core/v1/options/site', language, signal);
        if (import.meta.env.DEV && options) {
            console.log(`[CMS] Loaded site options.`, options);
        }
        return options;
    } catch (error) {
        if (error?.name === 'AbortError') throw error;
        console.warn('[CMS] getOptions failed:', error?.message);
        return null;
    }
}

/**
 * Fetch global SEO fallbacks.
 */
export async function getGlobalSeo(language = 'DE', signal = null) {
    try {
        const seo = await fetchFromCMS('/content-core/v1/seo', language, signal);
        if (import.meta.env.DEV && seo) {
            console.log(`[CMS] Loaded global SEO fallback.`, seo);
        }
        return seo;
    } catch (error) {
        if (error?.name === 'AbortError') throw error;
        console.warn('[CMS] getGlobalSeo failed:', error?.message);
        return null;
    }
}


/**
 * Fetch a specific form schema by slug.
 */
export async function getForm(slug, language = 'DE', signal = null) {
    try {
        const form = await fetchFromCMS(`/content-core/v1/forms/${slug}`, language, signal);
        if (import.meta.env.DEV && form) {
            console.log(`[CMS] Loaded form schema "${slug}".`, form);
        }
        return form;
    } catch (error) {
        if (error?.name === 'AbortError') throw error;
        console.warn(`[CMS] getForm("${slug}") failed:`, error?.message);
        return null;
    }
}


// ─── Categories ───────────────────────────────────────────────────────────────

/** Fetch all reference_category terms for the given language. */
export async function getReferenceCategories(language = 'DE') {
    const endpoints = [
        '/kategorie', 
        '/reference_category', 
        '/reference-category', 
        '/referenzen_category',
        '/content-core/v1/terms/reference_category'
    ];
    for (const endpoint of endpoints) {
        try {
            const terms = await fetchFromCMS(`${endpoint}?per_page=100`, language);
            if (Array.isArray(terms) && terms.length > 0) {
                return terms.map(cat => ({
                    id: cat.id,
                    name: decodeHtmlEntities(cat.name || ''),
                    slug: cat.slug || ''
                }));
            }
        } catch (error) {
            // Silently try next endpoint
        }
    }
    return [];
}


/** Returns an id→name map built from getReferenceCategories. */
export async function getCategoryMap(language = 'DE') {
    const terms = await getReferenceCategories(language);
    return terms.reduce((acc, term) => {
        acc[term.id] = term.name;
        return acc;
    }, {});
}

/**
 * Fetch only the term names for a specific set of term IDs (include list).
 * Used as a fallback in ReferenceDetail when _embedded terms are missing.
 * Language-scoped so French terms return French names.
 */
export async function getTermsByIds(ids, language = 'DE', signal = null) {
    if (!ids || ids.length === 0) return {};
    try {
        const include = ids.map(Number).filter(Boolean).join(',');
        const terms = await fetchFromCMS(
            `/reference_category?include=${include}&per_page=${ids.length}`,
            language,
            signal
        );
        if (!Array.isArray(terms)) return {};
        return terms.reduce((acc, term) => { acc[term.id] = term.name; return acc; }, {});
    } catch (err) {
        if (err.name === 'AbortError') throw err;
        console.error('[CMS] getTermsByIds failed:', err);
        return {};
    }
}

// ─── Testimonials ─────────────────────────────────────────────────────────────

/**
 * Fetch all published kundenstimmen (testimonials) from the CMS.
 */
export async function getTestimonials(language = 'DE') {
    try {
        const testimonials = await fetchFromCMS('/content-core/v1/posts/kundenstimmen?_embed=1&per_page=50', language);
        if (Array.isArray(testimonials) && testimonials.length > 0) {
            if (import.meta.env.DEV) console.log(`[CMS] Loaded ${testimonials.length} testimonials from CMS.`);
            return testimonials.map(t => ({
                ...t,
                customFields: t.customFields || t.acf || t.meta || {}
            }));
        }
    } catch (err) {
        console.warn('[CMS] getTestimonials from CMS failed:', err?.message);
    }
    return [];
}

/**
 * Modern Content Core based reference fetcher.
 * Uses /content-core/v1/posts and /content-core/v1/post endpoints to ensure
 * trashed translations and multilingual status are correctly handled.
 */
async function fetchReferencesFromCMS(queryParams, language, signal = null, isSingle = false) {
    const base = isSingle ? '/content-core/v1/post/referenzen' : '/content-core/v1/posts/referenzen';
    try {
        const data = await fetchFromCMS(`${base}${queryParams}`, language, signal);
        return data || null;
    } catch (error) {
        if (error?.name === 'AbortError') throw error;
        if (import.meta.env.DEV) console.warn(`[CMS] ${base}${queryParams} failed:`, error?.message);
        return null;
    }
}

/** Fetch ALL references for the given language, newest first. */
export async function getReferences(language = 'DE') {
    const result = await fetchReferencesFromCMS('?_embed=1&per_page=100', language);
    if (result && Array.isArray(result)) {
        if (import.meta.env.DEV) console.log(`[CMS] Loaded ${result.length} references from CMS.`);
        return result;
    }
    return [];
}

/** Fetch the newest `limit` references for the given language (homepage preview). */
export async function getLatestReferences(limit = 3, language = 'DE') {
    const result = await fetchReferencesFromCMS(`?_embed=1&per_page=${limit}`, language);
    if (result && Array.isArray(result)) return result;
    return [];
}

/** Fetch references filtered to a single category term id, newest first. */
export async function getReferencesByCategory(categoryId, language = 'DE') {
    const result = await fetchReferencesFromCMS(`?_embed=1&per_page=100&reference_category=${categoryId}`, language);
    if (result && Array.isArray(result)) return result;
    return [];
}

/** Fetch a single reference by slug. */
export async function getReferenceBySlug(slug, language = 'DE', signal = null) {
    const result = await fetchReferencesFromCMS(`?slug=${encodeURIComponent(slug)}&_embed=1`, language, signal);
    if (Array.isArray(result) && result.length > 0) {
        if (import.meta.env.DEV) console.log(`[CMS] Loaded reference "${slug}" from CMS.`);
        return result[0];
    }
    return null;
}

/** Fetch a single reference by slug or numeric ID. */
export async function getReference(idOrSlug, language = 'DE', signal = null) {
    if (typeof idOrSlug === 'number' || /^\d+$/.test(String(idOrSlug))) {
        const result = await fetchReferencesFromCMS(`/${idOrSlug}?_embed=1`, language, signal, true);
        if (result && !Array.isArray(result)) return result;
    }
    // Slug fallback (still through Content Core)
    return getReferenceBySlug(idOrSlug, language, signal);
}


/** Helper to strip CMS origin from an absolute permalink or media URL. */
export function stripCmsDomain(url) {
    if (!url || typeof url !== 'string') return '';
    if (url.startsWith('/')) return url;
    try {
        const parsed = new URL(url);
        // Ensure we remove trailing slashes to keep React Router consistency
        return parsed.pathname.replace(/\/$/, '') || '/';
    } catch {
        // Fallback for non-standard or relative-looking absolute strings
        return url.replace(/^https?:\/\/[^\/]+/, '').replace(/\/$/, '') || '/';
    }
}

export async function prefetchReferenceDetail(idOrSlug, language = 'DE') {
    if (!idOrSlug) return null;
    try {
        return await getReference(idOrSlug, language);
    } catch (error) {

        if (import.meta.env.DEV) {
            console.warn('[CMS] Reference detail prefetch failed:', error?.message);
        }
        return null;
    }
}


// ─── Media ────────────────────────────────────────────────────────────────────

/**
 * Resolve a media ID (integer) or URL (string) to a source_url.
 * Media is not language-specific — always fetches without a lang param.
 */
export async function resolveMedia(idOrUrl) {
    if (!idOrUrl) return null;
    const normalized = normalizeCmsImage(idOrUrl);
    if (normalized?.src && typeof idOrUrl === 'object') {
        return normalized;
    }
    if (typeof idOrUrl === 'string' && (idOrUrl.startsWith('http') || idOrUrl.startsWith('data:') || idOrUrl.startsWith('/') || idOrUrl.startsWith('./') || idOrUrl.startsWith('../'))) {
        return idOrUrl;
    }
    try {
        // Use the same proxy path — strips /wp/v2 to hit /wp-json/wp/v2/media
        const base = CMS_API_BASE.replace(/\/wp\/v2$/, '');
        const res = await fetch(`${base}/wp/v2/media/${idOrUrl}`);
        if (!res.ok) return null;
        const media = await res.json();
        return media?.source_url || null;
    } catch (error) {
        console.error(`[CMS] Failed to resolve media ID ${idOrUrl}:`, error);
        return null;
    }
}

// ─── Data mapper ──────────────────────────────────────────────────────────────

/**
 * Map a raw WordPress reference item to the shape expected by ReferenceCard.
 * Preserves raw language metadata for diagnostics and backward compatibility.
 */
export function mapReferenceCard(item, catMap = {}) {
    // Thumbnail: check 'featured_image' (returned by some WP REST plugins/themes),
    // then fall back to standard wp:featuredmedia embed.
    const cf = item.customFields || item.acf || item.meta || {};
    const thumbnail =
        item.featured_image ||
        item._embedded?.['wp:featuredmedia']?.[0]?.source_url ||
        item._embedded?.['wp:featuredmedia']?.[0]?.guid?.rendered ||
        '';

    const tax = item.taxonomies || item.taxonomy || {};
    const embeddedTerms = item._embedded?.['wp:term']?.flat() || [];
    
    // Primary source: Content Core 'taxonomies' object (standard in enhanced API)
    // Fallback source: Embedded terms from standard WP REST
    const categoryObjects = [];

    // 1. Process Content Core Strings (Highest priority for enhanced API)
    const ccCats = tax.kategorie || tax.reference_category || item.kategorie || item.reference_category || [];
    const ccArray = Array.isArray(ccCats) ? ccCats : [ccCats].filter(Boolean);
    ccArray.forEach(cat => {
        if (typeof cat === 'string') {
            categoryObjects.push({ id: cat, name: decodeHtmlEntities(cat), slug: cat });
        } else if (typeof cat === 'object' && cat !== null) {
            const name = decodeHtmlEntities(cat.name || '');
            categoryObjects.push({ id: name, name, slug: cat.slug || name });
        }
    });

    // 2. Process Embedded Terms (Standard WP REST fallback)
    if (categoryObjects.length === 0) {
        embeddedTerms.forEach(t => {
            if (!t) return;
            categoryObjects.push({ 
                id: t.name, 
                name: decodeHtmlEntities(t.name || ''), 
                slug: t.slug || t.name 
            });
        });
    }

    // Deduplicate by Name (since we are now string-based)
    const uniqueCats = [];
    const seenNames = new Set();
    categoryObjects.forEach(c => {
        if (c.name && !seenNames.has(c.name)) {
            seenNames.add(c.name);
            uniqueCats.push(c);
        }
    });

    const catNames = uniqueCats.map(c => c.name);
    // categoryIds now contains the string names for comparison in filtering
    const catIds = uniqueCats.map(c => c.name);

    const path = stripCmsDomain(item.resolved_path || item.permalink || item.link || '');
    const slug = item.slug || (item.id ? String(item.id) : '');

    return {
        id: item.id ? String(item.id) : slug,
        slug,
        path,
        title: decodeHtmlEntities(
            item.title?.rendered ||
            (typeof item.title === 'string' ? item.title : '') ||
            item.post_title ||
            item.name ||
            ''
        ),

        description: decodeHtmlEntities(cf.beschreibung || item.acf?.short_description || ''),
        location: cf.referenz_ort || item.acf?.location || '',
        thumbnailImage: thumbnail,
        categories: catNames,
        categoryIds: catIds,
        categoryObjects: uniqueCats,
        pll_lang: item.pll_lang || null,
        pll_translations: item.pll_translations || null,
    };
}



/**
 * High-level helper for Pages to get their structured content.
 * Merges raw CMS data (ACF) into local fallbacks.
 * 
 * V2 ARCHITECTURE:
 * This is now manifest-aware. It applies mappings from bridge-runtime.js
 * before falling back to generic name-based ACF merging.
 * 
 * @param {Object} rawPage - Raw WP REST response
 * @param {Object} localContent - Frontend fallback data
 * @param {string} [pageId] - The logical name of the page in ContentBridge (e.g. "Home")
 */
export function mapPageContent(rawPage, localContent, pageId) {
    if (!rawPage) return localContent;
    
    // Deep clone to avoid mutating the original fallback object
    const content = JSON.parse(JSON.stringify(localContent));

    const pageTitle =
        decodeHtmlEntities(
            rawPage.title?.rendered ||
            (typeof rawPage.title === 'string' ? rawPage.title : '') ||
            rawPage.post_title ||
            rawPage.name ||
            ''
        );

    // Map the page title into the expected hero title fields if available.
    if (pageTitle && content.hero) {
        if ('title' in content.hero) {
            content.hero.title = pageTitle;
        }
        if ('title_main' in content.hero) {
            content.hero.title_main = pageTitle;
        }
    }

    // Generic field source merge: try both rawPage.acf and rawPage.customFields.
    const mergeSource = rawPage.acf || rawPage.customFields;
    if (mergeSource && typeof mergeSource === 'object') {
        Object.entries(mergeSource).forEach(([key, val]) => {
            if (val === undefined || val === null || val === '') return;
            
            // Walk each top-level content section looking for a matching key.
            // CMS data now OVERWRITES local fallback content.
            Object.keys(content).forEach((sectionKey) => {
                const section = content[sectionKey];
                if (section && typeof section === 'object' && !Array.isArray(section)) {
                    if (key in section) {
                        section[key] = val;
                    }
                }
            });
        });
    }

    return content;
}

/**
 * Standardizes passing the raw CMS item as the 'data' prop to a component.
 * This is the entry point for ContentBridge runtime hydration.
 */
export function withHydration(mapped, raw) {
    if (!raw) return mapped;
    if (Array.isArray(mapped)) {
        return mapped.map((item, idx) => ({ ...item, data: Array.isArray(raw) ? raw[idx] : raw }));
    }
    return { ...mapped, data: raw };
}
