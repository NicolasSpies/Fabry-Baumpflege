import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/cms/i18n/useLanguage';
import { getReferences, getReferenceCategories, mapReferenceCard, getPage, mapPageContent, PAGE_IDS, decodeHtmlEntities } from '@/cms/lib/cms';
import { definePreview } from '@/cms/lib/preview';
import ReferenceCard from '@/cms/components/ui/ReferenceCard';
import { resolveInstanceProps, awaitMappings } from '@/cms/bridge-resolver';
import useCmsSeo from '@/cms/hooks/useCmsSeo';

import Icon from '@/cms/components/ui/Icon';
import CmsText from '@/cms/components/ui/CmsText';

/**
 * Preview Metadata for ContentBridge scanning.
 */
export const previewData = definePreview({
    page: 'References',
    source: '/content-core/v1/post/page/28',
    sections: [
        {
            section: 'ReferencesHeaderSection',
            fields: ['intro', 'load_more', 'all']
        },
        {
            section: 'ReferencesGridSection',
            components: [
                {
                    component: 'ReferenceCard',
                    isListItem: true,
                    fields: ['id', 'title', 'description', 'location', 'thumbnailImage', 'categories']
                }
            ]
        }
    ],
});

const References = () => {
    const { language, t, globalCmsData, globalSeo, setAlternates } = useLanguage();


    const [allRefs, setAllRefs] = useState([]);
    const [categories, setCategories] = useState([]);
    const [activeCatId, setActiveCatId] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isInitialRender, setIsInitialRender] = useState(true);
    const [rawPage, setRawPage] = useState(null);

    const getInitialContent = () => ({
        header: {
            intro: t('refs.intro'),
            load_more: t('refs.load_more'),
            all: t('refs.all'),
        },
        items: []
    });

    const getFallbackContent = () => getInitialContent();

    const [pageData, setPageData] = useState(getInitialContent());

    useEffect(() => {
        const timer = setTimeout(() => setIsInitialRender(false), 1500);
        return () => clearTimeout(timer);
    }, []);

    useEffect(() => { setActiveCatId(null); }, [language]);

    useEffect(() => {
        setPageData(getInitialContent());
    }, [language, t]);

    useEffect(() => {
        let cancelled = false;
        async function loadCollection() {
            try {
                await awaitMappings();
                if (cancelled) return;

                setIsLoading(true);
                setError(null);
                
                // 1. Fetch Page, Refs, and Categories concurrently
                const [pageRes, refsRes, catsRes] = await Promise.allSettled([
                    getPage(PAGE_IDS.references, language),
                    getReferences(language),
                    getReferenceCategories(language),
                ]);

                if (cancelled) return;

                const page = pageRes.status === 'fulfilled' ? pageRes.value : null;
                const rawRefs = refsRes.status === 'fulfilled' ? refsRes.value : [];
                const rawCats = catsRes.status === 'fulfilled' ? catsRes.value : [];
                
                if (import.meta.env.DEV) {
                    console.log('[DEBUG-References] Status:', { page: pageRes.status, refs: refsRes.status, cats: catsRes.status });
                    console.log('[DEBUG-References] Count:', Array.isArray(rawRefs) ? rawRefs.length : 'not an array');
                }

                // If the primary list failed significantly (rejected or null/empty)
                // we ONLY set error if rawRefs is actually empty/unreachable
                if (refsRes.status === 'rejected' && (!rawRefs || rawRefs.length === 0)) {
                    console.error('[References] Primary list fetch failed:', refsRes.reason);
                    setError(true);
                    setIsLoading(false);
                    return;
                }

                const initial = getInitialContent();
                const pageIntro = decodeHtmlEntities(page?.customFields?.referenzen_field_intro || '');
                const catMap = rawCats.reduce((acc, c) => { if (c?.id) acc[String(c.id)] = c.name; return acc; }, {});
                
                const refsForLanguage = Array.isArray(rawRefs) ? rawRefs : [];
                const mappedRefs = refsForLanguage.map(item => {
                    if (!item) return null;
                    try {
                        return {
                            ...mapReferenceCard(item, catMap),
                            data: item
                        };
                    } catch (e) {
                        console.warn('[References] Card mapping failed for item:', item.id, e);
                        return null;
                    }
                }).filter(Boolean);

                if (page) {
                    setRawPage(page);
                    const mappedPageContent = mapPageContent(page, initial, 'References');
                    setPageData(prev => ({ ...prev, ...mappedPageContent }));

                    if (page.cc_alternates || page.pll_translations) {
                        setAlternates(page.cc_alternates || page.pll_translations);
                    }
                }
                
                setAllRefs(mappedRefs);
                setPageData(prev => ({
                    ...prev,
                    header: {
                        ...initial.header,
                        ...prev.header,
                        intro: pageIntro || prev.header?.intro || initial.header.intro,
                    },
                    items: mappedRefs,
                }));

                // ─── Extract Unique Categories Safely ─────────────────────────────────
                const derivedCatsMap = new Map();
                const usedCategoryIds = new Set();
                
                // 1. Process all mapped references to find used categories
                mappedRefs.forEach(ref => {
                    if (Array.isArray(ref.categoryIds)) {
                        ref.categoryIds.forEach(id => { if (id) usedCategoryIds.add(String(id)); });
                    }
                    if (Array.isArray(ref.categoryObjects)) {
                        ref.categoryObjects.forEach(cat => {
                            if (!cat || !cat.name) return;
                            // Deduplicate by Name to prevent label repetition in UI
                            const cleanName = decodeHtmlEntities(cat.name).trim();
                            const key = cleanName.toLowerCase();
                            
                            if (key && !derivedCatsMap.has(key)) {
                                derivedCatsMap.set(key, {
                                    ...cat,
                                    name: cleanName,
                                    // Ensure we store all IDs/slugs that might match this name for filtering
                                    altIds: new Set([String(cat.id), String(cat.slug)]) 
                                });
                            } else if (key) {
                                const existing = derivedCatsMap.get(key);
                                existing.altIds.add(String(cat.id));
                                existing.altIds.add(String(cat.slug));
                            }
                        });
                    }
                });

                // 2. Supplement with rawCats from taxonomy endpoint, but ONLY if they match existing names or are relevant
                if (Array.isArray(rawCats)) {
                    rawCats.forEach(cat => {
                        if (!cat || !cat.name) return;
                        const cleanName = decodeHtmlEntities(cat.name).trim();
                        const key = cleanName.toLowerCase();
                        if (derivedCatsMap.has(key)) {
                            const existing = derivedCatsMap.get(key);
                            existing.altIds.add(String(cat.id));
                            if (cat.slug) existing.altIds.add(String(cat.slug));
                        } else {
                            // Only add if it's actually used in the refs (cross-reference by ID)
                            const isUsed = usedCategoryIds.has(String(cat.id)) || (cat.slug && usedCategoryIds.has(String(cat.slug)));
                            if (isUsed) {
                                derivedCatsMap.set(key, {
                                    ...cat,
                                    name: cleanName,
                                    altIds: new Set([String(cat.id), String(cat.slug)])
                                });
                            }
                        }
                    });
                }

                // 3. Final Filter: Only categories that actually have matching items in the current set
                const allAvailableCats = Array.from(derivedCatsMap.values());
                const filteredCats = allAvailableCats.filter(cat => {
                    if (!cat) return false;
                    // Check if any of the IDs/slugs associated with this name are in usedCategoryIds
                    return Array.from(cat.altIds).some(id => usedCategoryIds.has(id));
                });

                const getPriorityScore = (cat) => {
                    const n = (cat?.name || '').toLowerCase();
                    const s = (cat?.slug || '').toLowerCase();
                    if (language === 'FR') {
                        if (n.includes('entretien') && (n.includes('arbre') || s.includes('arbre'))) return 0;
                        if (n.includes('abattage') || s.includes('abattage')) return 1;
                        if (n.includes('jardin')) return 2;
                        if (n.includes('plant') || s.includes('plant')) return 3;
                    } else {
                        if (n.includes('baumpflege') || s.includes('baumpflege')) return 0;
                        if (n.includes('baumfällung') || s.includes('baumfäll')) return 1;
                        if (n.includes('gartenpflege') || s.includes('gartenpf')) return 2;
                        if (n.includes('bepflanzung') || s.includes('bepflanz')) return 3;
                    }
                    return 999;
                };

                // 4. Sort and Set Categories
                const sortedCats = [...filteredCats].sort((a, b) => {
                    const scoreA = getPriorityScore(a);
                    const scoreB = getPriorityScore(b);
                    if (scoreA !== scoreB) return scoreA - scoreB;
                    return (a?.name || '').localeCompare(b?.name || '');
                });

                // Final safety check: if multiple objects with different master IDs ended up in sortedCats,
                // we must ensure setActiveCatId works correctly. 
                // We'll use the FIRST ID in altIds as the primary filter key for that button.
                const finalCats = sortedCats.map(cat => ({
                    ...cat,
                    id: Array.from(cat.altIds).find(id => id !== 'undefined' && id !== 'null') || cat.id
                }));

                setCategories(finalCats);

            } catch (err) {
                if (cancelled) return;
                console.error('[References] Fatal logic error:', err);
                setError(true);
            } finally {
                if (!cancelled) setIsLoading(false);
            }
        }
        loadCollection();
        return () => { cancelled = true; };
    }, [language]);

    useCmsSeo(rawPage?.seo || globalSeo);



    const filteredRefs = (allRefs || []).filter(ref => {
        if (!activeCatId) return true;
        const ids = Array.isArray(ref.categoryIds) ? ref.categoryIds : [];
        
        // Find the full category object to check its associated altIds
        const selectedCat = categories.find(c => String(c.id) === String(activeCatId));
        if (selectedCat?.altIds) {
            return ids.some(id => selectedCat.altIds.has(String(id)));
        }

        return ids.some(id => String(id) === String(activeCatId));
    });


    const getProps = (instanceName, localProps) => 
        resolveInstanceProps('References', instanceName, localProps, rawPage); // Header can hydrate from page data

    if (error) {
        return (
            <main className="pt-28 min-h-[60vh] flex flex-col items-center justify-center p-6 text-center">
                <h2 className="text-3xl font-display text-primary mb-4 p-8">{t('refs.error_loading')}</h2>
                <button onClick={() => window.location.reload()} className="px-8 py-3 bg-primary text-white font-bold rounded-full">
                    {t('refs.reload')}
                </button>
            </main>
        );
    }

    if (isLoading && !rawPage && allRefs.length === 0) {
        // We still render the basic shell to avoid blank screen
    }

    const headerProps = getProps('ReferencesHeaderSection', pageData.header);

    return (
        <main className="pt-28">
            {/* Page: References → Section: ReferencesHeaderSection */}
            <section className="pt-6 md:pt-8 pb-6 md:pb-8 px-4 md:px-6 text-center">
                <div className="max-w-7xl mx-auto space-y-6">
                    <h1 className="text-4xl md:text-5xl font-serif text-primary mb-4">
                        {t('nav.references')}
                    </h1>
                    <CmsText
                        text={headerProps.intro}
                        className="max-w-2xl mx-auto text-base opacity-90"
                        paragraphClassName="leading-relaxed"
                    />
                </div>
            </section>

            {/* Page: References → Section: ReferencesCategoryFilter */}
            <section className="relative z-10 bg-background-light dark:bg-background-dark border-y border-slate-100 dark:border-slate-800 py-3 md:py-4">
                <div className="max-w-7xl mx-auto">
                    <div className="flex flex-wrap items-center justify-center gap-2 md:gap-8 px-4 md:px-6">
                        <button
                            onClick={() => setActiveCatId(null)}
                            className={`flex-shrink-0 px-4 md:px-6 py-2 rounded-full text-[0.65rem] md:text-sm font-medium uppercase tracking-[0.16em] md:tracking-widest transition-[background-color,color,box-shadow] ${activeCatId === null ? 'bg-[#2a411a] text-white shadow-lg' : 'text-muted-accessible hover:text-primary'}`}
                        >
                            {headerProps.all}
                        </button>
                        {categories.map(cat => (
                            <button
                                key={cat.id}
                                onClick={() => setActiveCatId(cat.id)}
                                className={`flex-shrink-0 px-4 md:px-6 py-2 rounded-full text-[0.65rem] md:text-sm font-medium uppercase tracking-[0.16em] md:tracking-widest transition-[background-color,color,box-shadow] ${activeCatId !== null && String(activeCatId) === String(cat.id) ? 'bg-[#2a411a] text-white shadow-lg' : 'text-muted-accessible hover:text-primary'}`}
                            >
                                {cat.name}
                            </button>
                        ))}
                    </div>
                </div>
            </section>

            {/* Page: References → Section: ReferencesGridSection → Component: ReferenceCard */}
            <section className="pb-24 md:pb-32 px-4 md:px-6 mt-10 md:mt-16 overflow-hidden">
                <div className="max-w-7xl mx-auto">
                    {/* Key on grid container re-triggers entrance animation for the set on category change */}
                    <div 
                        key={activeCatId || 'all'}
                        className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-8 animate-filter-in"
                    >
                        {filteredRefs.map((project, index) => (
                            <ReferenceCard
                                key={`${project.id || index}-${activeCatId}`}
                                {...project}
                                animateEntry={isInitialRender}
                                staggerIndex={index}
                                forceSquare={true}
                                compactMobileOverlay={true}
                                page="References"
                                section="ReferencesGridSection"
                            />
                        ))}
                    </div>
                    <div className="mt-14 md:mt-20 text-center">
                        <button className="inline-flex items-center gap-3 px-8 md:px-12 py-3.5 md:py-4 border-2 border-primary text-primary font-bold rounded-full hover:bg-primary hover:text-white transition-colors duration-300 text-xs md:text-base">
                            {headerProps.load_more}
                            <Icon name="refresh" className="text-base" />
                        </button>
                    </div>
                </div>
            </section>
        </main>
    );
};

export default References;
