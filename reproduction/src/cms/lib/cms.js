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
    privacy: 3,
};

const CMS_CACHE_TTL_MS = import.meta.env.DEV ? 2000 : 5 * 60 * 1000;
const cmsResponseCache = new Map();
const cmsInflightCache = new Map();
const mediaCache = new Map();
const mediaInflight = new Map();

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

/**
 * Retrieve serialized state from the SSR data script injected by the edge renderer.
 */
export function getSSRData() {
    if (typeof window === 'undefined' || typeof document === 'undefined') return null;
    try {
        const script = document.getElementById('__SSR_DATA__');
        if (script) {
            const data = JSON.parse(script.textContent);
            // Verify data exists to avoid poisoned cache
            if (data?.page || data?.global) return data;
        }
    } catch (e) {}
    return null;
}

function buildResponsiveSourceList(image) {
    if (!image || typeof image !== 'object') return [];

    const collected = [];
    const pushSource = (entry, key) => {
        if (!entry) return;

        let entryUrl = '';
        let widthStr = undefined;
        let heightStr = undefined;
        let mimeStr = '';

        if (typeof entry === 'string') {
            entryUrl = entry;
            if (/^\d+$/.test(key)) {
                widthStr = key;
            } else if (key === 'original' || key === 'full' || key === 'main') {
                widthStr = image.width || image.media_details?.width;
            }
        } else if (typeof entry === 'object') {
            entryUrl = entry.url || entry.source_url || (typeof entry.src === 'string' ? entry.src : '');
            widthStr = entry.width || entry.file_width || entry.media_details?.width;
            heightStr = entry.height || entry.file_height || entry.media_details?.height;
            mimeStr = entry.mime_type || entry['mime-type'] || '';
            
            // Fallback for non-numeric keys in object entries
            if (!widthStr && (key === 'original' || key === 'full' || key === 'main')) {
                widthStr = image.width || image.media_details?.width;
            }
        }

        if (!entryUrl || typeof entryUrl !== 'string') return;
        
        // Skip if this URL is already collected with same or larger width
        const existing = collected.find(e => e.url === entryUrl);
        if (existing) {
            if (widthStr && (!existing.width || Number(widthStr) > existing.width)) {
                existing.width = Number(widthStr);
            }
            return;
        }

        collected.push({
            key,
            url: entryUrl,
            width: Number(widthStr) || undefined,
            height: Number(heightStr) || undefined,
            mime_type: mimeStr,
        });
    };

    // 1. Plugin 'variants' / 'sources' map (Prioritize numeric keys 480, 768, 1280)
    if (image.variants && typeof image.variants === 'object') {
        Object.entries(image.variants).forEach(([key, entry]) => pushSource(entry, key));
    }
    if (image.sources && typeof image.sources === 'object') {
        Object.entries(image.sources).forEach(([key, entry]) => pushSource(entry, key));
    }

    // 2. Standard WP 'media_details.sizes'
    const wpSizes = image.media_details?.sizes || image.media_details?.image_meta?.sizes;
    if (wpSizes && typeof wpSizes === 'object') {
        Object.entries(wpSizes).forEach(([key, entry]) => pushSource(entry, key));
    }

    // 3. Generic 'sizes' map
    if (image.sizes && typeof image.sizes === 'object') {
        Object.entries(image.sizes).forEach(([key, entry]) => {
            if ((typeof entry === 'object' && entry !== null) || typeof entry === 'string') {
                pushSource(entry, key);
            }
        });
    }

    // 4. Known variant buckets
    if (image.full) pushSource(image.full, 'full');
    if (image.original) pushSource(image.original, 'original');
    if (image.fallback) pushSource(image.fallback, 'fallback');

    // 5. Main asset source
    const mainUrl = image.src || image.url || image.source_url || image.guid?.rendered || image.guid;
    if (mainUrl && typeof mainUrl === 'string') {
        pushSource(mainUrl, 'main');
    }

    return collected
        .filter((entry) => entry.url && entry.width)
        .sort((a, b) => (a.width || 0) - (b.width || 0));
}

function getUrl(val) {
    if (!val) return '';
    return typeof val === 'string' ? val : (val?.url || val?.src || val?.source_url || '');
}

/**
 * Standardizes raw image data from the CMS into a consistent object.
 * Priority: 
 * 1. Normalized Responsive Variants (1280, 768, 480)
 * 2. High-quality fallback from other sources
 * 3. Original/Master as last resort
 */
// Helper to ensure URL has a ?v= versioning parameter
const buildVersionedUrl = (url, v) => {
    if (!url || typeof url !== 'string') return url;
    // Encode spaces in URLs (CMS sometimes returns unencoded filenames like "Internetseite 02.webp")
    url = url.replace(/ /g, '%20');
    if (url.includes('?v=')) return url; // Already versioned from backend
    if (!v) return url; // Do NOT add static fallback if no version available
    const sep = url.includes('?') ? '&' : '?';
    return `${url}${sep}v=${versionToSlug(v)}`;
};

/**
 * Normalizes a date-like version string into a stable numeric slug.
 */
function versionToSlug(v) {
    if (!v) return '1';
    if (typeof v === 'number') return String(v);
    const date = new Date(v);
    return isNaN(date.getTime()) ? '1' : String(Math.floor(date.getTime() / 1000));
}

export function getImageVariant(image, size = '768') {
    if (!image) return '';
    const variants = image.variants || image.media?.variants || {};
    
    // 1. Explicit requested size (if exists)
    if (variants[size]?.url) return variants[size].url;
    
    // 2. Original escape hatch: Bypass fallbacks if explicitly asking for master
    if (size === 'original') return image.url || image.src || '';
    
    // 3. Performance Fallback chain
    return variants['768']?.url 
        || variants['480']?.url 
        || image.url 
        || image.src 
        || '';
}

export function normalizeCmsImage(image) {
    if (!image) return null;

    if (typeof image === 'string' || typeof image === 'number') {
        const id = typeof image === 'number' ? image : ((/^\d+$/.test(image)) ? parseInt(image, 10) : null);
        const url = typeof image === 'string' && !id ? image : '';
        const versionedUrl = buildVersionedUrl(url, null);
        
        return {
            id,
            src: versionedUrl,
            srcSet: '',
            sizes: '100vw',
            alt: '',
            width: undefined,
            height: undefined,
            variants: url ? { original: versionedUrl } : {}
        };
    }

    if (typeof image !== 'object' || Array.isArray(image)) return null;

    const sourceList = buildResponsiveSourceList(image);
    
    // 1. Identify Canonical src (Medium-quality responsive variant preferred as default base)
    const v = image.variants || image.sources || image.media_details?.sizes || {};
    // Priority: explicit version > modified timestamp > fallback
    const imgVersion = image.version || image.v || (image.modified ? image.modified : null);
    
    // Standardized variant selection via helper: default to performance variant
    const responsiveSrc = getImageVariant(image, '768');
    
    // If no numeric variants provided in the JSON, search responsive sources (wp-v2 sizes)
    let fallbackVariant = null;
    if (!responsiveSrc) {
        // Find smallest source that is at least 700w (medium fallback)
        fallbackVariant = sourceList.find(s => (s.width || 0) >= 700 && s.key !== 'main' && s.key !== 'original');
        if (!fallbackVariant) {
            fallbackVariant = sourceList.find(s => (s.width || 0) >= 400 && s.key !== 'main' && s.key !== 'original');
        }
    }

    const canonicalSrc = responsiveSrc || getUrl(fallbackVariant);

    // Final src: Prioritize responsive variant, fallback sequentially to master only as last resort
    const hasResponsive = !!(v['1280'] || v['768'] || v['480']);
    const nakedMaster = getUrl(v['original'] || image.full || image.original) || image.src || image.url || image.source_url || '';
    const isNakedUnversioned = nakedMaster && !nakedMaster.includes('?v=') && !/-(1280|768|480)\./.test(nakedMaster);

    const rawSrc = canonicalSrc || 
                ((isNakedUnversioned && hasResponsive) ? canonicalSrc : nakedMaster) || 
                nakedMaster;
    
    const src = buildVersionedUrl(rawSrc, imgVersion);

    // 2. Build canonical srcSet
    // We prefer the API's provided srcset if it exists, as it typically includes versioning (?v=).
    // CRITICAL: We sanitize it to remove ANY unversioned naked master URL that might 404.
    const rawApiSrcSet = image.srcSet || image.srcset || '';
    
    const sanitizeSrcSet = (str) => {
        if (!str) return '';
        const entries = str.split(',').map(s => s.trim()).filter(Boolean);
        const hasVariants = entries.some(e => /-(1280|768|480)(x\d+)?\./.test(e));

        // Split each entry into URL + descriptor, handling spaces in filenames.
        // The descriptor is always the last token matching /^\d+w$/ or /^\d+(\.\d+)?x$/.
        const parseEntry = (entry) => {
            const match = entry.match(/^(.+)\s+(\d+w|\d+(?:\.\d+)?x)$/);
            if (match) return { rawUrl: match[1], descriptor: match[2] };
            return { rawUrl: entry, descriptor: null };
        };

        const filtered = entries.filter(entry => {
            const { rawUrl } = parseEntry(entry);
            const isNakedMaster = !/-(1280|768|480)(x\d+)?\./.test(rawUrl);
            const isVersioned = rawUrl.includes('?v=');
            return !isNakedMaster || isVersioned || !hasVariants;
        });

        // Ensure every remaining URL in the srcset is versioned and has a valid width descriptor
        return filtered.map(entry => {
            const { rawUrl, descriptor } = parseEntry(entry);
            const url = buildVersionedUrl(rawUrl, imgVersion);

            if (descriptor) return `${url} ${descriptor}`;

            // Try to extract width from filename (e.g. "image-1280.webp" or "image-768x512.webp")
            const widthMatch = rawUrl.match(/-(\d{3,4})(x\d+)?\.\w+/);
            if (widthMatch) return `${url} ${widthMatch[1]}w`;

            // No valid descriptor — skip this entry
            return null;
        }).filter(Boolean).join(', ');
    };

    const apiSrcSet = sanitizeSrcSet(rawApiSrcSet);

    // Parse apiSrcSet back into entries for rawSrcSetEntries to ensure consistency
    const apiSrcSetEntries = apiSrcSet.split(',').map(s => {
        const match = s.trim().match(/^(.+)\s+(\d+)w$/);
        if (!match) return null;
        return { url: match[1], width: parseInt(match[2]) };
    }).filter(e => e && e.url && e.width);

    const srcSetObject = sourceList
        .filter(s => {
            const isNakedMaster = !/-(1280|768|480)(x\d+)?\./.test(s.url);
            const isVersioned = s.url.includes('?v=');
            const hasResponsive = sourceList.some(o => /-(1280|768|480)(x\d+)?\./.test(o.url));
            return !isNakedMaster || isVersioned || !hasResponsive;
        });

    const srcSet = apiSrcSet || srcSetObject
        .map((entry) => `${buildVersionedUrl(entry.url, imgVersion)} ${entry.width}w`)
        .join(', ');

    // Use API entries if available, fallback to object mappings
    const finalSrcSetEntries = apiSrcSetEntries.length > 0 ? apiSrcSetEntries : srcSetObject.map(s => ({ ...s, url: buildVersionedUrl(s.url, imgVersion) }));

    // 3. Metadata & Attributes
    const width = Number(image.width) || (fallbackVariant?.width) || undefined;
    const height = Number(image.height) || (fallbackVariant?.height) || undefined;

    return {
        ...image,
        src,
        srcSet,
        rawSrcSetEntries: finalSrcSetEntries,
        sizes: (image.sizes && typeof image.sizes === 'string' && image.sizes !== '') ? image.sizes : '100vw',
        alt: image.alt || image.title?.rendered || '',
        width,
        height,
        variants: v,
        imgVersion
    };
}

export function getCmsImageProps(image, options = {}) {
    // 1. Base Normalization (Standardized default to 768px)
    const normalized = normalizeCmsImage(image);
    if (!normalized?.src) return null;

    // 2. Standardization Logic: Prioritize explicit size or hints
    const v = normalized.variants || {};
    
    // Explicit size request via helper
    const explicitSrc = options.size ? getImageVariant(image, options.size) : null;
    
    const hintSource = 
        explicitSrc ||
        (options.preferDesktopSharpness && v['768']) ||
        (options.preferSmall && (v['480'] || v['768'])) ||
        (options.preferMedium && (v['768'] || v['1280'])) ||
        null;

    let src = getUrl(hintSource) || normalized.src;
    let srcSet = normalized.srcSet;

    // Apply maxWidth constraint to limit resolution (e.g. for cards)
    if (options.maxWidth && normalized.rawSrcSetEntries) {
        const filteredEntries = normalized.rawSrcSetEntries.filter(s => (s.width || 0) <= options.maxWidth);
        if (filteredEntries.length > 0) {
            srcSet = filteredEntries.map(s => `${s.url} ${s.width}w`).join(', ');
            // If the current src is larger than maxWidth, downgrade it to the best available
            const currentWidthMatch = src.match(/-(\d+)(x\d+)?\./);
            const currentWidth = currentWidthMatch ? parseInt(currentWidthMatch[1]) : 9999;
            if (currentWidth > options.maxWidth) {
                src = filteredEntries[filteredEntries.length - 1].url;
            }
        }
    }

    const props = {
        src,
        srcSet,
        alt: options.alt ?? normalized.alt ?? '',
        sizes: options.sizes || normalized.sizes,
        width: normalized.width,
        height: normalized.height,
        loading: options.loading || 'lazy'
    };

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
    const langCode = PLLCode[language] ?? (language ? String(language).toLowerCase() : 'de');
    const isCore = endpoint.startsWith('/content-core') || endpoint.startsWith('/polylang');
    let apiBase = String(CMS_API_BASE).replace(/\/+$/, '');
    if (isCore) {
        apiBase = apiBase.replace(/\/wp\/v2\/?$/, '');
    }

    const separator = endpoint.includes('?') ? '&' : '?';
    const languageParam = `language=${encodeURIComponent(langCode)}&lang=${encodeURIComponent(langCode)}`;
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    const url = `${apiBase}${cleanEndpoint}${separator}${languageParam}`;

    const now = Date.now();
    const cached = cmsResponseCache.get(url);
    if (cached && cached.expiresAt > now) return cloneCmsPayload(cached.data);
    if (cached) cmsResponseCache.delete(url);

    if (!signal) {
        const inflight = cmsInflightCache.get(url);
        if (inflight) return cloneCmsPayload(await inflight);
    }

    const requestPromise = (async () => {
        try {
            const response = await fetch(url, signal ? { signal } : undefined);
            
            // Non-critical HTTP errors: return safe empty result without noisy console errors
            if (response.status === 401 || response.status === 403 || response.status === 404) {
                if (import.meta.env?.DEV) {
                    console.warn(`[CMS] ${response.status} for ${cleanEndpoint} — returning empty fallback.`);
                }
                return endpoint.includes('include=') || endpoint.includes('posts/') || endpoint.includes('v1/terms') ? [] : null;
            }

            if (!response.ok) {
                throw new Error(`CMS fetch failed: ${response.status} ${response.statusText} — ${url}`);
            }

            return response.json();
        } catch (err) {
            if (err.name === 'AbortError') throw err;
            console.error(`[CMS] Network failure for ${url}:`, err.message);
            return endpoint.includes('include=') || endpoint.includes('posts/') || endpoint.includes('v1/terms') ? [] : null;
        }
    })();

    if (!signal) cmsInflightCache.set(url, requestPromise);

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

// Removed duplicate getHomeStats block


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
// Removed duplicate placeholder


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
            `/content-core/v1/terms/kategorie?include=${include}&per_page=${ids.length}`,
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
        
        // Fallback to standard WP REST
        const fallback = await fetchFromCMS('/kundenstimmen?_embed=1&per_page=50', language);
        if (Array.isArray(fallback)) {
             return fallback.map(t => ({
                ...t,
                customFields: t.customFields || t.acf || t.meta || {}
            }));
        }
    } catch (err) {
        console.warn('[CMS] getTestimonials failed:', err?.message);
    }
    return [];
}

/**
 * Modern Content Core based reference fetcher.
 * Uses /content-core/v1/posts and /content-core/v1/post endpoints to ensure
 * trashed translations and multilingual status are correctly handled.
 */
async function fetchReferencesFromCMS(queryParams, language, signal = null, isSingle = false) {
    const isCore = !queryParams.includes('wp/v2');
    const base = isSingle 
        ? (isCore ? '/content-core/v1/post/referenzen' : '/wp/v2/referenzen') 
        : (isCore ? '/content-core/v1/posts/referenzen' : '/wp/v2/referenzen');
    
    try {
        const url = `${base}${queryParams}`;
        const rawData = await fetchFromCMS(url, language, signal);
        const data = Array.isArray(rawData) ? rawData : (rawData?.items || rawData?.results || rawData?.data || rawData);
        
        if (data && (Array.isArray(data) && data.length > 0)) {
            return data;
        }

        // Handle case where it's a single object (isSingle: true)
        if (isSingle && data && typeof data === 'object' && !Array.isArray(data)) {
            return data;
        }

        // Second attempt: if core returned nothing, try standard references
        if (isCore) {
            const fallbackUrl = `/referenzen${queryParams}`;
            const fallbackRaw = await fetchFromCMS(fallbackUrl, language, signal);
            const fallback = Array.isArray(fallbackRaw) ? fallbackRaw : (fallbackRaw?.items || fallbackRaw?.results || fallbackRaw?.data || fallbackRaw);
            return fallback || (isSingle ? null : []);
        }

        return isSingle ? null : [];
    } catch (error) {
        if (error?.name === 'AbortError') throw error;
        
        console.warn(`[CMS] Primary fetch failed: ${base}${queryParams}. Error:`, error?.message);

        // Fallback to standard WP REST on hard failure
        try {
            const fallbackPath = isSingle ? `/referenzen${queryParams}` : `/referenzen${queryParams}`;
            const fallback = await fetchFromCMS(fallbackPath, language, signal);
            return fallback || (isSingle ? null : []);
        } catch (fallbackError) {
            console.error('[CMS] All reference endpoints failed:', error?.message, fallbackError?.message);
        }
        
        return isSingle ? null : [];
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
    const result = await fetchReferencesFromCMS(`?_embed=1&per_page=100&kategorie=${categoryId}`, language);
    if (result && Array.isArray(result)) return result;
    return [];
}

/** Fetch a single reference by slug or numeric ID with MINIMAL fields (Hero/Title/Meta only). */
export async function getReferenceCore(idOrSlug, language = 'DE', signal = null) {
    const fields = 'id,slug,title,link,featured_image,customFields,taxonomies,date,cc_alternates,pll_translations';
    const query = `?fields=${fields}&per_page=1`;
    
    if (typeof idOrSlug === 'number' || /^\d+$/.test(String(idOrSlug))) {
        const result = await fetchReferencesFromCMS(`/${idOrSlug}${query}`, language, signal, true);
        if (result && !Array.isArray(result)) return result;
    }
    
    const slugQuery = `?slug=${encodeURIComponent(idOrSlug)}&fields=${fields}`;
    const result = await fetchReferencesFromCMS(slugQuery, language, signal);
    if (Array.isArray(result) && result.length > 0) return result[0];
    return null;
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
    
    // 1. If it's already a normalized object with rich data, return as-is
    if (typeof idOrUrl === 'object' && !Array.isArray(idOrUrl)) {
        if (idOrUrl.srcSet || idOrUrl.variants || idOrUrl.sources) {
            return normalizeCmsImage(idOrUrl);
        }
    }

    // 2. Normalize whatever we have (ID, string, or partial object)
    const normalized = normalizeCmsImage(idOrUrl);
    
    // 3. Extract the numeric ID if any
    const getMediaId = (val) => {
        if (typeof val === 'number') return val;
        if (typeof val === 'string' && /^\d+$/.test(val)) return parseInt(val, 10);
        if (typeof val === 'object' && val !== null) {
            return val.id || val.ID || val.media_id;
        }
        return null;
    };
    
    // 4. Deciding when to fetch:
    // We fetch IF we have a valid ID AND either the object is just a shell or it lacks rich sources.
    const mediaId = normalized.id;
    const isShellOnly = mediaId && !normalized.src && !normalized.srcSet;
    const hasRichSources = normalized && (normalized.srcSet || (normalized.variants && Object.keys(normalized.variants).length > 1));
    
    if (mediaId && (isShellOnly || !hasRichSources)) {
        // Check media cache first (media is language-independent)
        const cached = mediaCache.get(mediaId);
        if (cached) return cloneCmsPayload(cached);

        // Deduplicate inflight requests for the same media ID
        const inflight = mediaInflight.get(mediaId);
        if (inflight) return cloneCmsPayload(await inflight);

        const fetchPromise = (async () => {
            try {
                const base = getAbsoluteCmsRootApiBase();
                const url = `${base}/wp/v2/media/${mediaId}`;
                const res = await fetch(url);
                if (res.ok) {
                    const media = await res.json();
                    const normalizedWithVersion = normalizeCmsImage({
                        ...media,
                        modified: media.modified || media.date || null
                    });
                    mediaCache.set(mediaId, normalizedWithVersion);
                    return normalizedWithVersion;
                }
            } catch (error) {
                console.warn(`[CMS] Failed to resolve media ID ${mediaId}:`, error?.message);
            }
            return null;
        })();

        mediaInflight.set(mediaId, fetchPromise);
        try {
            const result = await fetchPromise;
            if (result) return cloneCmsPayload(result);
        } finally {
            mediaInflight.delete(mediaId);
        }
    }

    // Fallback: return what we have
    return normalized;
}

/** Fetch homepage-specific statistics (Years of experience, etc.) */
export async function getHomeStats(language = 'DE', signal = null) {
    // Note: Homepage fields in the new API use 'startseite_' prefixes.
    const fields = 'customFields.startseite_anzahl_zufriedene_unden,customFields.startseite_zufriedene_kunden,customFields.startseite_anzahl_gepflegte_baeume,customFields.startseite_gepflegte_baeume,customFields.startseite_anzahl_jahre_erfahrung,customFields.startseite_jahre_erfahrung';
    try {
        const stats = await fetchFromCMS(`/content-core/v1/post/page/${PAGE_IDS.home}?fields=${fields}`, language, signal);
        if (stats?.customFields) {
            // Map the new startseite_ keys to the generic stat keys used by the Home component
            return {
                customFields: {
                    stat1_value: stats.customFields.startseite_anzahl_zufriedene_unden || '',
                    stat1_label: stats.customFields.startseite_zufriedene_kunden || '',
                    stat2_value: stats.customFields.startseite_anzahl_gepflegte_baeume || '',
                    stat2_label: stats.customFields.startseite_gepflegte_baeume || '',
                    stat3_value: stats.customFields.startseite_anzahl_jahre_erfahrung || '',
                    stat3_label: stats.customFields.startseite_jahre_erfahrung || '',
                    stat4_value: '', // Missing in new API currently
                    stat4_label: ''
                }
            };
        }
        return stats;
    } catch (err) {
        return null;
    }
}

// ─── Categories ───────────────────────────────────────────────────────────────

/** Fetch all reference_category terms for the given language using the public terms endpoint. */
export async function getReferenceCategories(language = 'DE') {
    try {
        const termsResponse = await fetchFromCMS('/content-core/v1/terms/kategorie?per_page=100', language);
        const terms = Array.isArray(termsResponse) ? termsResponse : (termsResponse?.items || termsResponse?.results || termsResponse?.data || []);
        
        if (Array.isArray(terms)) {
            return terms.map(cat => ({
                id: cat.id,
                name: decodeHtmlEntities(cat.name || ''),
                slug: cat.slug || '',
                pll_lang: cat.pll_lang || cat.language || cat.lang || null,
                translations: cat.translations || cat.pll_translations || null,
            }));
        }
    } catch (error) {
        console.warn('[CMS] getReferenceCategories failed:', error);
    }
    return [];
}

// ─── Data mapper ──────────────────────────────────────────────────────────────

/**
 * Map a raw WordPress reference item to the shape expected by ReferenceCard.
 * Preserves raw language metadata for diagnostics and backward compatibility.
 */
/**
 * Map a raw CMS reference item to the shape expected by ReferenceCard.
 * Supports both nested WP-REST (item.title.rendered) and flat Content-Core (item.title) structures.
 */
export function mapReferenceCard(item, catMap = {}) {
    if (!item) return null;
    
    const cf = item.customFields || item.acf || item.meta || {};
    const thumbnail = item.featured_image || item._embedded?.['wp:featuredmedia']?.[0] || '';

    if (thumbnail && typeof thumbnail === 'object' && item.modified) {
        thumbnail.modified = item.modified;
    }

    const tax = item.taxonomies || item.taxonomy || {};
    const embeddedTerms = item._embedded?.['wp:term']?.flat() || [];
    const categoryObjects = [];

    const ccCats = tax.kategorie || tax.reference_category || tax.categories || item.kategorie || item.reference_category || item.categories || [];
    const ccArray = Array.isArray(ccCats) ? ccCats : [ccCats].filter(Boolean);
    ccArray.forEach(cat => {
        if (typeof cat === 'string') {
            categoryObjects.push({ id: cat, name: decodeHtmlEntities(cat), slug: cat });
        } else if (typeof cat === 'object' && cat !== null) {
            const name = decodeHtmlEntities(cat.name || '');
            categoryObjects.push({ id: name, name, slug: cat.slug || name });
        }
    });

    if (categoryObjects.length === 0) {
        embeddedTerms.forEach(t => {
            if (!t) return;
            categoryObjects.push({ id: t.name, name: decodeHtmlEntities(t.name || ''), slug: t.slug || t.name });
        });
    }

    const uniqueCats = [];
    const seenNames = new Set();
    categoryObjects.forEach(c => {
        if (c.name && !seenNames.has(c.name)) {
            seenNames.add(c.name);
            uniqueCats.push(c);
        }
    });

    const path = stripCmsDomain(item.resolved_path || item.permalink || item.link || '');
    const slug = item.slug || (item.id ? String(item.id) : '');

    return {
        id: item.id ? String(item.id) : slug,
        slug,
        path,
        // Priority: Direct title string (Content-Core) -> Rendered object (WP REST) -> Name fallbacks
        title: decodeHtmlEntities(
            (typeof item.title === 'string' ? item.title : item.title?.rendered) ||
            item.post_title ||
            item.name ||
            ''
        ),
        // Priority: Top-level description (Content-Core) -> Custom Field fallback
        description: decodeHtmlEntities(item.description || cf.beschreibung || item.acf?.short_description || ''),
        location: decodeHtmlEntities(item.location || cf.referenz_ort || item.acf?.location || ''),
        thumbnailImage: thumbnail,
        categories: uniqueCats.map(c => c.name),
        categoryIds: uniqueCats.map(c => c.name),
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
    if (!rawPage || typeof rawPage !== 'object') return localContent;
    
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
