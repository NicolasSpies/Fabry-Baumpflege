import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/cms/i18n/useLanguage';
import { getReferences, getReferenceCategories, mapReferenceCard, getPage, PAGE_IDS, decodeHtmlEntities } from '@/cms/lib/cms';
import { definePreview } from '@/cms/lib/preview';
import ReferenceCard from '@/cms/components/ui/ReferenceCard';
import { resolveInstanceProps, awaitMappings } from '@/cms/bridge-resolver';
import Icon from '@/cms/components/ui/Icon';

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
    const { language, t } = useLanguage();

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
            load_more: '',
            all: '',
        },
        items: []
    });

    const getFallbackContent = () => ({
        header: {
            intro: t('refs.intro'),
            load_more: t('refs.load_more'),
            all: t('refs.all'),
        },
        items: []
    });

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
                const [page, rawRefs, rawCats] = await Promise.all([
                    getPage(PAGE_IDS.references, language),
                    getReferences(language),
                    getReferenceCategories(language),
                ]);
                if (cancelled) return;
                const pageIntro = decodeHtmlEntities(page?.customFields?.referenzen_field_intro || '');

                setRawPage(page || null);

                const catMap = rawCats.reduce((acc, c) => { acc[c.id] = c.name; return acc; }, {});
                const refsForLanguage = Array.isArray(rawRefs) ? rawRefs : [];

                if (import.meta.env.DEV) {
                    console.log(`[References] ${refsForLanguage.length} items loaded for "${language}".`);
                }

                const mappedRefs = refsForLanguage.map(item => ({
                    ...mapReferenceCard(item, catMap),
                    data: item
                }));
                
                setAllRefs(mappedRefs);
                const fallback = getFallbackContent();
                setPageData({
                    header: {
                        ...fallback.header,
                        intro: pageIntro || fallback.header.intro,
                    },
                    items: mappedRefs,
                });

                // ─── Filter Categories by Language ──────────────────────────────────────
                // The /kategorie endpoint often lacks language metadata.
                // We derive the relevant categories from the references that passed the lang filter.
                const usedCategoryIds = new Set();
                mappedRefs.forEach(ref => {
                    if (Array.isArray(ref.categoryIds)) {
                        ref.categoryIds.forEach(id => usedCategoryIds.add(String(id)));
                    }
                });
                const priorityTerms = language === 'FR' 
                    ? ['taille raisonnée', 'abattage', 'entretien de jardin', 'plantation']
                    : ['baumpflege', 'baumfällung', 'gartenpflege', 'bepflanzung'];
                
                const getPriorityScore = (cat) => {
                    const nameLower = (cat.name || '').toLowerCase();
                    const slugLower = (cat.slug || '').toLowerCase();
                    const idxName = priorityTerms.indexOf(nameLower);
                    const idxSlug = priorityTerms.indexOf(slugLower.replace(/-/g, ' '));
                    if (idxName !== -1) return idxName;
                    if (idxSlug !== -1) return idxSlug;
                    return 999;
                };

                const filteredCats = Array.isArray(rawCats)
                    ? rawCats.filter(cat => usedCategoryIds.has(String(cat.id)) || usedCategoryIds.has(String(cat.slug)))
                    : [];

                setCategories([...filteredCats].sort((a, b) => {
                    const scoreA = getPriorityScore(a);
                    const scoreB = getPriorityScore(b);
                    if (scoreA !== scoreB) return scoreA - scoreB;
                    return a.name.localeCompare(b.name);
                }));
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

    const filteredRefs = activeCatId === null
        ? allRefs
        : allRefs.filter(ref => {
            const ids = Array.isArray(ref.categoryIds) ? ref.categoryIds : [];
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

    if (isLoading || !rawPage) {
        return <main className="pt-28 min-h-screen" />;
    }

    const headerProps = getProps('ReferencesHeaderSection', pageData.header);

    return (
        <main className="pt-28">
            {/* Page: References → Section: ReferencesHeaderSection */}
            <section className="pt-6 md:pt-8 pb-6 md:pb-8 px-4 md:px-6 text-center">
                <div className="max-w-7xl mx-auto space-y-6">
                    <p className="text-base md:text-lg opacity-90 max-w-2xl mx-auto leading-relaxed">{headerProps.intro}</p>
                </div>
            </section>

            {/* Page: References → Section: ReferencesCategoryFilter */}
            <section className="relative z-10 bg-background-light dark:bg-background-dark border-y border-slate-100 dark:border-slate-800 py-3 md:py-4">
                <div className="max-w-7xl mx-auto">
                    <div className="flex flex-wrap items-center justify-center gap-2 md:gap-8 px-4 md:px-6">
                        <button
                            onClick={() => setActiveCatId(null)}
                            className={`flex-shrink-0 px-4 md:px-6 py-2 rounded-full text-[0.65rem] md:text-sm font-medium uppercase tracking-[0.16em] md:tracking-widest transition-[background-color,color,box-shadow] ${activeCatId === null ? 'bg-[#2a411a] text-white shadow-lg' : 'text-slate-500 hover:text-primary'}`}
                        >
                            {headerProps.all}
                        </button>
                        {categories.map(cat => (
                            <button
                                key={cat.id}
                                onClick={() => setActiveCatId(cat.id)}
                                className={`flex-shrink-0 px-4 md:px-6 py-2 rounded-full text-[0.65rem] md:text-sm font-medium uppercase tracking-[0.16em] md:tracking-widest transition-[background-color,color,box-shadow] ${activeCatId !== null && String(activeCatId) === String(cat.id) ? 'bg-[#2a411a] text-white shadow-lg' : 'text-slate-500 hover:text-primary'}`}
                            >
                                {cat.name}
                            </button>
                        ))}
                    </div>
                </div>
            </section>

            {/* Page: References → Section: ReferencesGridSection → Component: ReferenceCard */}
            <section className="pb-24 md:pb-32 px-4 md:px-6 mt-10 md:mt-16">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-8">
                        {filteredRefs.map((project, index) => (
                            <ReferenceCard
                                key={project.id}
                                id={project.id}
                                title={project.title}
                                description={project.description}
                                location={project.location}
                                thumbnailImage={project.thumbnailImage}
                                language={language}
                                animateEntry={isInitialRender}
                                staggerIndex={index}
                                forceSquare={true}
                                compactMobileOverlay={true}
                                data={project.data}
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
