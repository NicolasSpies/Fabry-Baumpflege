const DEFAULT_BASE_URL = 'https://cms.fabry-baumpflege.be/wp-json/wp/v2';
export const CMS_BASE_URL =
    import.meta.env.VITE_CMS_BASE_URL ||
    import.meta.env.NEXT_PUBLIC_WP_API_BASE ||
    DEFAULT_BASE_URL;

// ─── Core fetch helper ───────────────────────────────────────────────────────

export async function fetchFromCMS(endpoint) {
    const url = `${CMS_BASE_URL}${endpoint}`;
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`CMS fetch failed: ${response.status} ${response.statusText} — ${url}`);
    }
    return response.json();
}

// ─── Categories ──────────────────────────────────────────────────────────────

/**
 * Fetch all reference_category terms from WordPress.
 * Returns an array of { id, name, slug } objects, alphabetically sorted by name.
 */
export async function getReferenceCategories() {
    try {
        const terms = await fetchFromCMS('/reference_category?per_page=100');
        return Array.isArray(terms) ? terms : [];
    } catch (error) {
        console.error('[CMS] Failed to load reference categories:', error);
        return [];
    }
}

/**
 * Returns a Map<id, name> for quick lookup by term id.
 * Built from the same category endpoint as above.
 */
export async function getCategoryMap() {
    const terms = await getReferenceCategories();
    return terms.reduce((acc, term) => {
        acc[term.id] = term.name;
        return acc;
    }, {});
}

// ─── References ──────────────────────────────────────────────────────────────

/**
 * Fetch ALL references, newest first.
 * WordPress default is date DESC, but we pass orderby/order explicitly to be safe.
 */
export async function getReferences() {
    return fetchFromCMS('/references?_embed=1&per_page=100&orderby=date&order=desc');
}

/**
 * Fetch only the newest `limit` references, newest first.
 * Used by the homepage preview section.
 */
export async function getLatestReferences(limit = 3) {
    return fetchFromCMS(`/references?_embed=1&per_page=${limit}&orderby=date&order=desc`);
}

/**
 * Fetch references filtered to a single category term id, newest first.
 */
export async function getReferencesByCategory(categoryId) {
    return fetchFromCMS(
        `/references?_embed=1&per_page=100&orderby=date&order=desc&reference_category=${encodeURIComponent(categoryId)}`
    );
}

/**
 * Fetch a single reference by slug for the detail page.
 * Returns the first item from the array, or null if not found.
 */
export async function getReferenceBySlug(slug) {
    const arr = await fetchFromCMS(`/references?slug=${encodeURIComponent(slug)}&_embed=1`);
    if (!Array.isArray(arr) || arr.length === 0) return null;
    return arr[0];
}

// ─── Media ───────────────────────────────────────────────────────────────────

/**
 * Resolve a media ID (integer) or URL (string) to the full source_url.
 * Returns null if the value is missing or the fetch fails.
 */
export async function resolveMedia(idOrUrl) {
    if (!idOrUrl) return null;
    if (typeof idOrUrl === 'string' && (idOrUrl.startsWith('http') || idOrUrl.startsWith('data:'))) {
        return idOrUrl;
    }
    try {
        const media = await fetchFromCMS(`/media/${idOrUrl}`);
        return media?.source_url || null;
    } catch (error) {
        console.error(`[CMS] Failed to resolve media ID ${idOrUrl}:`, error);
        return null;
    }
}

// ─── Shared data mapper ───────────────────────────────────────────────────────

/**
 * Convert a raw WordPress reference item to the shape expected by ReferenceCard.
 * Pass the category map (id → name) produced by getCategoryMap().
 */
export function mapReferenceCard(item, catMap = {}) {
    const thumbnail =
        item._embedded?.['wp:featuredmedia']?.[0]?.source_url || '';

    // Prefer embedded wp:term[0], fall back to id→name map
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
        location: item.acf?.location || '',
        thumbnailImage: thumbnail,
        categories: catNames,
        // Raw term ids kept for client-side filtering by id
        categoryIds: Array.isArray(item.reference_category) ? item.reference_category : [],
    };
}
