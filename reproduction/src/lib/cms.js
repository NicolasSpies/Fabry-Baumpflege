// ─── Single CMS Base ──────────────────────────────────────────────────────────
//
// All REST calls go through the /cms proxy path.
//   Dev  → Vite proxies /cms/* to https://cms.fabry-baumpflege.be/*
//   Prod → Vercel rewrite /cms/* → https://cms.fabry-baumpflege.be/*
//
// This single relative base works identically in both environments and
// eliminates CORS issues without any hostname-sniffing logic.
//
// Language selection is done entirely via the Polylang ?lang= query parameter
// on every request. Do NOT change the path prefix for French — Polylang does
// not map /fr/wp-json to this REST API.
//
const CMS_BASE = '/cms/wp/v2';

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
    const url = `${CMS_BASE}${endpoint}${separator}lang=${langCode}`;
    const response = await fetch(url, signal ? { signal } : undefined);
    if (!response.ok) {
        throw new Error(`CMS fetch failed: ${response.status} ${response.statusText} — ${url}`);
    }
    return response.json();
}

// ─── Categories ───────────────────────────────────────────────────────────────

/** Fetch all reference_category terms for the given language. */
export async function getReferenceCategories(language = 'DE') {
    try {
        const terms = await fetchFromCMS('/reference_category?per_page=100', language);
        return Array.isArray(terms) ? terms : [];
    } catch (error) {
        console.error('[CMS] Failed to load reference categories:', error);
        return [];
    }
}

/** Returns an id→name map built from getReferenceCategories. */
export async function getCategoryMap(language = 'DE') {
    const terms = await getReferenceCategories(language);
    return terms.reduce((acc, term) => {
        acc[term.id] = term.name;
        return acc;
    }, {});
}

// ─── References ───────────────────────────────────────────────────────────────

/** Fetch ALL references for the given language, newest first. */
export async function getReferences(language = 'DE') {
    return fetchFromCMS('/references?_embed=1&per_page=100&orderby=date&order=desc', language);
}

/** Fetch the newest `limit` references for the given language (homepage preview). */
export async function getLatestReferences(limit = 3, language = 'DE') {
    return fetchFromCMS(
        `/references?_embed=1&per_page=${limit}&orderby=date&order=desc`,
        language
    );
}

/** Fetch references filtered to a single category term id, newest first. */
export async function getReferencesByCategory(categoryId, language = 'DE') {
    return fetchFromCMS(
        `/references?_embed=1&per_page=100&orderby=date&order=desc&reference_category=${encodeURIComponent(categoryId)}`,
        language
    );
}

/**
 * Fetch a single reference by slug.
 * Returns the first item from the array, or null if not found.
 */
export async function getReferenceBySlug(slug, language = 'DE', signal = null) {
    const arr = await fetchFromCMS(
        `/references?slug=${encodeURIComponent(slug)}&_embed=1`,
        language,
        signal
    );
    if (!Array.isArray(arr) || arr.length === 0) return null;
    return arr[0];
}

/**
 * Fetch a single reference by numeric WordPress post ID.
 * Used to resolve translated slugs from pll_translations on language switch.
 */
export async function getReferenceById(id, language = 'DE', signal = null) {
    try {
        return await fetchFromCMS(`/references/${id}?_embed=1`, language, signal);
    } catch (error) {
        if (error.name === 'AbortError') throw error;
        console.error(`[CMS] Failed to fetch reference by ID ${id}:`, error);
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
    if (typeof idOrUrl === 'string' && (idOrUrl.startsWith('http') || idOrUrl.startsWith('data:'))) {
        return idOrUrl;
    }
    try {
        const res = await fetch(`${CMS_BASE}/media/${idOrUrl}`);
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
    const thumbnail =
        item._embedded?.['wp:featuredmedia']?.[0]?.source_url || '';

    let catNames = [];
    const embeddedTerms = item._embedded?.['wp:term']?.[0];
    if (Array.isArray(embeddedTerms) && embeddedTerms.length > 0) {
        catNames = embeddedTerms.map(t => t.name).filter(Boolean);
    } else if (Array.isArray(item.reference_category) && item.reference_category.length > 0) {
        catNames = item.reference_category.map(id => catMap[id]).filter(Boolean);
    }

    return {
        id: item.slug,
        slug: item.slug,
        title: item.title?.rendered || '',
        description: item.acf?.short_description || '',
        location: item.acf?.location || '',
        thumbnailImage: thumbnail,
        categories: catNames,
        categoryIds: Array.isArray(item.reference_category) ? item.reference_category : [],
        // Polylang fields — used for language enforcement and slug resolution
        pll_lang: item.pll_lang || null,
        pll_translations: item.pll_translations || null,
    };
}
