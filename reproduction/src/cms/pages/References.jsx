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
            intro: '',
            load_more: t('refs.load_more'),
            all: t('refs.all') || 'Alle',
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

                setError(null);
                
                // 1. Kick off all fetches
                const pagePromise = getPage(PAGE_IDS.references, language);
                const refsPromise = getReferences(language);
                const catsPromise = getReferenceCategories(language);

                // 2. Hydrate Page Header as quickly as possible
                const page = await pagePromise;
                if (cancelled) return;

                if (page) {
                    setRawPage(page);
                    const initial = getInitialContent();
                    const pageIntro = decodeHtmlEntities(page?.customFields?.referenzen_field_intro || '');
                    const mappedPageContent = mapPageContent(page, initial, 'References');
                    setPageData(prev => ({ 
                        ...prev, 
                        ...mappedPageContent,
                        header: {
                            ...prev.header,
                            ...mappedPageContent.header,
                            intro: pageIntro || mappedPageContent.header?.intro || initial.header.intro
                        }
                    }));

                    if (page.cc_alternates || page.pll_translations) {
                        setAlternates(page.cc_alternates || page.pll_translations);
                    }
                }

                // 3. Hydrate Refs and Categories
                const [refsRes, catsRes] = await Promise.allSettled([refsPromise, catsPromise]);
                if (cancelled) return;

                const rawRefs = Array.isArray(refsRes.status === 'fulfilled' ? refsRes.value : []) 
                    ? (refsRes.status === 'fulfilled' ? refsRes.value : []) 
                    : [];
                const rawCats = Array.isArray(catsRes.status === 'fulfilled' ? catsRes.value : [])
                    ? (catsRes.status === 'fulfilled' ? catsRes.value : [])
                    : [];

                if (refsRes.status === 'rejected' && (!rawRefs || rawRefs.length === 0)) {
                    setError(true);
                    setIsLoading(false);
                    return;
                }

                const catMap = (Array.isArray(rawCats) ? rawCats : []).reduce((acc, c) => { if (c?.id) acc[String(c.id)] = c.name; return acc; }, {});
                const mappedRefs = (Array.isArray(rawRefs) ? rawRefs : []).map(item => {
                    if (!item) return null;
                    try {
                        return { ...mapReferenceCard(item, catMap), data: item };
                    } catch (e) {
                        return null;
                    }
                }).filter(Boolean);

                setAllRefs(mappedRefs);
                setPageData(prev => ({ ...prev, items: mappedRefs }));

                // 4. Process Categories
                // The taxonomy API returns all categories regardless of active references.
                // We filter out cross-language bleed matching Polylang meta tags.
                const targetLang = String(language).toLowerCase();
                const filteredCats = [];
                const seenCategoryNames = new Set();

                (Array.isArray(rawCats) ? rawCats : []).forEach(c => {
                    const cleanName = decodeHtmlEntities(c.name || '').trim();
                    const n = cleanName.toLowerCase();
                    if (!cleanName || seenCategoryNames.has(n)) return;

                    // 1. Strict metadata match (safest)
                    let matchesLang = true;
                    if (c.pll_lang) matchesLang = String(c.pll_lang).toLowerCase() === targetLang;
                    else if (c.language) matchesLang = String(c.language).toLowerCase() === targetLang;
                    else if (c.lang) matchesLang = String(c.lang).toLowerCase() === targetLang;
                    // 2. Empirical fallback if meta is stripped
                    else {
                        if (targetLang === 'fr') {
                            if (n.includes('pflege') || n.includes('fällung') || n.includes('pflanzung') || n.includes('baum')) matchesLang = false;
                        } else {
                            if (n.includes('entretien') || n.includes('abattage') || n.includes('jardin') || n.includes('plant') || n.includes('tous')) matchesLang = false;
                        }
                    }

                    if (matchesLang) {
                        seenCategoryNames.add(n);
                        filteredCats.push({
                            id: cleanName, // mapReferenceCard coerces IDs to names
                            name: cleanName,
                            slug: c.slug || cleanName.replace(/\s+/g, '-')
                        });
                    }
                });

                const getPriorityScore = (cat) => {
                    const n = (cat?.name || '').toLowerCase();
                    if (language === 'FR') {
                        if (n.includes('entretien')) return 0;
                        if (n.includes('abattage')) return 1;
                        if (n.includes('jardin')) return 2;
                        if (n.includes('plant')) return 3;
                    } else {
                        if (n.includes('baumpflege')) return 0;
                        if (n.includes('baumfällung')) return 1;
                        if (n.includes('gartenpflege')) return 2;
                        if (n.includes('bepflanzung')) return 3;
                    }
                    return 999;
                };

                const finalCats = [...filteredCats]
                    .sort((a, b) => getPriorityScore(a) - getPriorityScore(b) || (a?.name || '').localeCompare(b?.name || ''));

                setCategories(finalCats);

            } catch (err) {
                if (cancelled) return;
                setError(true);
            } finally {
                if (!cancelled) setIsLoading(false);
            }
        }
        loadCollection();
        return () => { cancelled = true; };
    }, [language]);

    useCmsSeo(rawPage?.seo || globalSeo);



    const [displayCount, setDisplayCount] = useState(4);
    const loadMoreTriggerRef = React.useRef(null);

    // Memoized filtering and list slicing
    const filteredRefs = React.useMemo(() => {
        return (allRefs || []).filter(ref => {
            if (!activeCatId) return true;
            const ids = Array.isArray(ref.categoryIds) ? ref.categoryIds : [];
            const selectedCat = categories.find(c => String(c.id) === String(activeCatId));
            if (selectedCat?.altIds) {
                return ids.some(id => selectedCat.altIds.has(String(id)));
            }
            return ids.some(id => String(id) === String(activeCatId));
        });
    }, [allRefs, activeCatId, categories]);

    const visibleRefs = React.useMemo(() => {
        return filteredRefs.slice(0, displayCount);
    }, [filteredRefs, displayCount]);

    const handleLoadMore = () => {
        setDisplayCount(prev => prev + 12);
    };

    // Intersection Observer for scroll-based loading
    useEffect(() => {
        if (isLoading || filteredRefs.length <= displayCount) return;

        const observer = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting) {
                // Debounced/Guarded increment
                setDisplayCount(prev => Math.min(prev + 12, filteredRefs.length));
            }
        }, { rootMargin: '400px', threshold: 0.1 });

        const currentTrigger = loadMoreTriggerRef.current;
        if (currentTrigger) {
            observer.observe(currentTrigger);
        }

        return () => {
            if (currentTrigger) observer.unobserve(currentTrigger);
        };
    }, [isLoading, filteredRefs.length, displayCount]);


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
                    {headerProps?.intro && (
                        <CmsText
                            text={headerProps.intro}
                            className="max-w-2xl mx-auto text-slate-700"
                            paragraphClassName="text-[1.05rem] md:text-lg leading-[1.75]"
                        />
                    )}
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
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 animate-filter-in"
                    >
                        {isLoading && filteredRefs.length === 0 ? (
                            // Stable Skeleton Grid - Updated for overlay style
                            [...Array(6)].map((_, i) => (
                                <div key={`skeleton-${i}`} className="aspect-square rounded-2xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
                            ))
                        ) : (
                            visibleRefs.map((project, index) => (
                                <ReferenceCard
                                    key={`${project.id || index}-${activeCatId}`}
                                    {...project}
                                    language={language}
                                    animateEntry={isInitialRender}
                                    staggerIndex={index}
                                    forceSquare={false} 
                                    compactMobileOverlay={true}
                                    loading={index < 2 ? 'eager' : 'lazy'}
                                    fetchPriority={index < 2 ? 'high' : 'low'}
                                    sizes="(max-width: 768px) 95vw, (max-width: 1200px) 45vw, 30vw"
                                    page="References"
                                    section="ReferencesGridSection"
                                />
                            ))
                        )}
                    </div>
                    {filteredRefs.length > displayCount && (
                        <div ref={loadMoreTriggerRef} className="h-20 flex items-center justify-center mt-12">
                            {isLoading && <Icon name="refresh" className="animate-spin text-primary text-2xl" />}
                        </div>
                    )}
                </div>
            </section>
        </main>
    );
};

export default References;
