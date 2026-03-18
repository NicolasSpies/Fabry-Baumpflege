// ─── CMS API Base ─────────────────────────────────────────────────────────────
//
// The CMS host is defined in one central place:
//   src/cms/lib/cmsConfig.js  ← ContentBridge updates that file on commit.
//
// All REST calls use the relative /cms/wp/v2 proxy path so the host never
// leaks into the browser bundle. The dev proxy in vite.config.js forwards
// /cms/* → CMS_HOST/wp-json/* using the same cmsConfig.js value.
//
import { CMS_API_BASE } from '@/cms/lib/cmsConfig';
import { references as localReferences, referenceCategories as localCategories } from '@/cms/data/references';
import { testimonials as localTestimonials } from '@/cms/data/testimonials';

// ─── Language helpers ─────────────────────────────────────────────────────────

/** Polylang locale codes used in ?lang= query params and pll_lang fields. */
export const PLLCode = { DE: 'de', FR: 'fr' };

// ─── Core fetch helper ────────────────────────────────────────────────────────

/**
 * Fetch from the CMS REST API.
 * @param {string} endpoint  - path starting with /  e.g. '/references?_embed=1'
 * @param {string} language  - 'DE' | 'FR'  — appended as ?lang=de/fr
 * @param {AbortSignal} [signal]
 */
export async function fetchFromCMS(endpoint, language = 'DE', signal = null) {
    const langCode = PLLCode[language] ?? 'de';
    const separator = endpoint.includes('?') ? '&' : '?';
    
    /**
     * Determine the correct API base.
     * Most WP endpoints are under /wp/v2, but custom plugins (like content-core)
     * register their namespaces at the root level of /wp-json/.
     */
    const isRootNamespace = endpoint.startsWith('/content-core') || endpoint.startsWith('/polylang');
    const apiBase = isRootNamespace 
        ? CMS_API_BASE.replace('/wp/v2', '') 
        : CMS_API_BASE;

    const url = `${apiBase}${endpoint}${separator}lang=${langCode}`;
    const response = await fetch(url, signal ? { signal } : undefined);
    
    if (!response.ok) {
        throw new Error(`CMS fetch failed: ${response.status} ${response.statusText} — ${url}`);
    }
    return response.json();
}

/**
 * Fetch a specific page by slug and return its raw data.
 */
export async function getPage(slug, language = 'DE', signal = null) {
    const pages = await fetchFromCMS(`/pages?slug=${encodeURIComponent(slug)}&_embed=1`, language, signal);
    const page = Array.isArray(pages) && pages.length > 0 ? pages[0] : null;

    // ── DEV DIAGNOSTIC: print the exact WP page object shape ─────────────────
    // This tells us definitively which keys the WP REST API returns for this page,
    // so we can confirm whether customFields, acf, meta, etc. actually exist.
    if (import.meta.env.DEV && page) {
        const shape = Object.keys(page).reduce((acc, key) => {
            const val = page[key];
            if (val && typeof val === 'object' && !Array.isArray(val)) {
                acc[key] = `{${Object.keys(val).slice(0, 8).join(', ')}}`;
            } else {
                const str = JSON.stringify(val);
                acc[key] = str ? str.slice(0, 60) : val;
            }
            return acc;
        }, {});
        console.group(`[CMS] getPage("${slug}", "${language}") — raw WP shape`);
        console.table(shape);
        // Also log the full customFields / acf / meta if they exist
        if (page.customFields) console.log('  customFields:', page.customFields);
        if (page.acf)          console.log('  acf:', page.acf);
        if (page.meta)         console.log('  meta:', page.meta);
        console.groupEnd();
    }

    return page;
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
    const lang = PLLCode[language] || 'de';
    const endpoints = ['/kategorie', '/reference_category'];
    for (const endpoint of endpoints) {
        try {
            const terms = await fetchFromCMS(`${endpoint}?per_page=100`, language);
            if (Array.isArray(terms) && terms.length > 0) {
                return terms.map(cat => ({
                    id: cat.id,
                    name: cat.name,
                    slug: cat.slug,
                    pll_lang: cat.pll_lang
                }));
            }
        } catch (error) {
            if (import.meta.env.DEV) console.warn(`[CMS] Failed to load categories from ${endpoint}:`, error?.message);
        }
    }
    // Fallback to local categories
    return localCategories.map(cat => ({
        id: cat.id,
        name: cat.name[lang] || cat.name['de'],
        slug: cat.slug
    }));
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
    const lang = PLLCode[language] || 'de';
    try {
        const testimonials = await fetchFromCMS('/kundenstimmen?_embed=1&per_page=50', language);
        if (Array.isArray(testimonials) && testimonials.length > 0) {
            if (import.meta.env.DEV) console.log(`[CMS] Loaded ${testimonials.length} testimonials from CMS.`);
            // Transform WP shape to include a safe customFields object if it doesn't exist
            return testimonials.map(t => ({
                ...t,
                customFields: t.customFields || t.acf || t.meta || {}
            }));
        }
    } catch (err) {
        console.warn('[CMS] getTestimonials from CMS failed, using local fallback:', err?.message);
    }
    // Fallback
    return localTestimonials.map(t => ({
        id: t.id,
        title: { rendered: t.author },
        customFields: {
            kundenstimme_text: t.text[lang] || t.text['de'],
            sterne: t.rating
        }
    }));
}

function mapLocalToReference(item, lang) {
    return {
        id: item.id,
        slug: item.slug,
        pll_lang: lang,
        date: item.date,
        title: { rendered: item.title[lang] || item.title['de'] },
        acf: {
            short_description: item.description[lang] || item.description['de'],
            location: item.location,
            challenge: item.challenge[lang] || item.challenge['de'],
            before_image: item.beforeImage,
            after_image: item.afterImage,
            gallery: item.gallery || []
        },
        _embedded: {
            'wp:featuredmedia': [{ source_url: item.thumbnailImage }],
            'wp:term': [[...localCategories.filter(c => item.categories.includes(c.id)).map(c => ({ name: c.name[lang] || c.name['de'] }))]]
        },
        reference_category: item.categories
    };
}

/**
 * Try multiple known WordPress post type slugs for references.
 * WP custom post types can be registered with different REST slugs;
 * this function tries each in order and returns the first non-empty result.
 * Slugs tried: referenzen (German plural), referenz (German singular), references (English).
 */
async function fetchReferencesFromCMS(queryParams, language, signal = null) {
    const slugs = ['referenzen', 'referenz', 'references'];
    for (const slug of slugs) {
        try {
            const data = await fetchFromCMS(`/${slug}${queryParams}`, language, signal);
            if (Array.isArray(data) && data.length > 0) {
                if (import.meta.env.DEV) console.log(`[CMS] References found at /${slug} (${data.length} items).`);
                return data;
            }
            if (data && typeof data === 'object' && !Array.isArray(data) && data.id) {
                // Single item endpoint (e.g. /referenzen/123)
                if (import.meta.env.DEV) console.log(`[CMS] Reference item found at /${slug}.`);
                return data;
            }
        } catch (error) {
            if (error?.name === 'AbortError') throw error;
            if (import.meta.env.DEV) console.warn(`[CMS] /${slug}${queryParams} failed:`, error?.message);
        }
    }
    return null;
}

/** Fetch ALL references for the given language, newest first. */
export async function getReferences(language = 'DE') {
    const result = await fetchReferencesFromCMS('?_embed=1&per_page=100', language);
    if (result) {
        if (import.meta.env.DEV) console.log(`[CMS] Loaded ${result.length} references from CMS.`);
        return result;
    }
    console.warn('[CMS] getReferences — all endpoints failed, using local fallback.');
    const lang = PLLCode[language] || 'de';
    return localReferences.map(r => mapLocalToReference(r, lang));
}

/** Fetch the newest `limit` references for the given language (homepage preview). */
export async function getLatestReferences(limit = 3, language = 'DE') {
    const result = await fetchReferencesFromCMS(`?_embed=1&per_page=${limit}`, language);
    if (result) return result;
    const lang = PLLCode[language] || 'de';
    return localReferences.slice(0, limit).map(r => mapLocalToReference(r, lang));
}

/** Fetch references filtered to a single category term id, newest first. */
export async function getReferencesByCategory(categoryId, language = 'DE') {
    const result = await fetchReferencesFromCMS(`?_embed=1&per_page=100&reference_category=${categoryId}`, language);
    if (result) return result;
    const lang = PLLCode[language] || 'de';
    return localReferences
        .filter(r => r.categories.includes(categoryId))
        .map(r => mapLocalToReference(r, lang));
}

/** Fetch a single reference by slug. */
export async function getReferenceBySlug(slug, language = 'DE', signal = null) {
    const result = await fetchReferencesFromCMS(`?slug=${encodeURIComponent(slug)}&_embed=1`, language, signal);
    if (Array.isArray(result) && result.length > 0) {
        if (import.meta.env.DEV) console.log(`[CMS] Loaded reference "${slug}" from CMS.`);
        return result[0];
    }
    const lang = PLLCode[language] || 'de';
    const found = localReferences.find(r => r.slug === slug);
    return found ? mapLocalToReference(found, lang) : null;
}

/** Fetch a single reference by numeric ID. */
export async function getReferenceById(id, language = 'DE', signal = null) {
    // Numeric ID: try direct endpoint
    if (typeof id === 'number' || /^\d+$/.test(String(id))) {
        const result = await fetchReferencesFromCMS(`/${id}?_embed=1`, language, signal);
        if (result && !Array.isArray(result)) return result;
    }
    // Slug fallback
    const result = await fetchReferencesFromCMS(`?slug=${encodeURIComponent(id)}&_embed=1`, language, signal);
    if (Array.isArray(result) && result.length > 0) return result[0];
    const lang = PLLCode[language] || 'de';
    const found = localReferences.find(r => r.id === id || r.slug === id);
    return found ? mapLocalToReference(found, lang) : null;
}

// ─── Media ────────────────────────────────────────────────────────────────────

/**
 * Resolve a media ID (integer) or URL (string) to a source_url.
 * Media is not language-specific — always fetches without a lang param.
 */
export async function resolveMedia(idOrUrl) {
    if (!idOrUrl) return null;
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
 * Preserves pll_lang and pll_translations for language filtering and switching.
 */
export function mapReferenceCard(item, catMap = {}) {
    // Thumbnail: check 'featured_image' (returned by some WP REST plugins/themes),
    // then fall back to standard wp:featuredmedia embed.
    const cf = item.customFields || item.acf || item.meta || {};
    const thumbnail =
        item.featured_image?.url ||
        item.featured_image?.source_url ||
        item._embedded?.['wp:featuredmedia']?.[0]?.source_url ||
        item._embedded?.['wp:featuredmedia']?.[0]?.guid?.rendered ||
        '';

    let catNames = [];
    const embeddedTerms = item._embedded?.['wp:term']?.[0];
    if (Array.isArray(embeddedTerms) && embeddedTerms.length > 0) {
        catNames = embeddedTerms.map(t => t.name).filter(Boolean);
    } else {
        const rawCatIds = item.kategorie || item.reference_category || [];
        if (Array.isArray(rawCatIds) && rawCatIds.length > 0) {
            catNames = rawCatIds.map(id => catMap[id]).filter(Boolean);
        }
    }

    // Use slug as the primary id for URL routing; fall back to numeric id.
    const id = item.slug || (item.id ? String(item.id) : '');

    // Category IDs: Support multiple field names and ensure we have both IDs and slugs for filtering.
    // This makes the filter robust against ID vs Slug mismatches.
    const rawCatIds = (item.kategorie || item.reference_category || []).map(String);
    const embeddedSlugs = item._embedded?.['wp:term']?.[0]?.map(t => t.slug).filter(Boolean) || [];
    
    const catIds = [...new Set([...rawCatIds, ...embeddedSlugs])];


    return {
        id,
        slug: item.slug || (item.id ? String(item.id) : ''),
        title: item.title?.rendered || '',
        // Description: try customFields.beschreibung (CB-mapped field), then acf fallback
        description: cf.beschreibung || item.acf?.short_description || '',
        // Location: try customFields.referenz_ort (CB-mapped field), then acf fallback
        location: cf.referenz_ort || item.acf?.location || '',
        thumbnailImage: thumbnail,
        categories: catNames,
        categoryIds: catIds,
        // Polylang fields — used for language enforcement and slug resolution
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

    // Map WP page title into hero.title_main if available
    if (rawPage.title?.rendered && content.hero) {
        content.hero.title_main = rawPage.title.rendered;
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
