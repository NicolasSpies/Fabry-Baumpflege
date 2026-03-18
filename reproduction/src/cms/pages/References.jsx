import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/cms/i18n/useLanguage';
import { PLLCode, getReferences, getReferenceCategories, mapReferenceCard } from '@/cms/lib/cms';
import { definePreview } from '@/cms/lib/preview';
import ReferenceCard from '@/cms/components/ui/ReferenceCard';
import { resolveInstanceProps, awaitMappings } from '@/cms/bridge-resolver';

/**
 * Preview Metadata for ContentBridge scanning.
 */
export const previewData = definePreview({
    page: 'References',
    source: '/cms/wp/v2/references?_embed=1&per_page=100',
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
    const pllLang = PLLCode[language];

    const [allRefs, setAllRefs] = useState([]);
    const [categories, setCategories] = useState([]);
    const [activeCatId, setActiveCatId] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isInitialRender, setIsInitialRender] = useState(true);

    const getLocalContent = () => ({
        header: {
            intro: t('refs.intro'),
            load_more: t('refs.load_more'),
            all: t('refs.all'),
        },
        items: []
    });

    const [pageData, setPageData] = useState(getLocalContent());

    useEffect(() => {
        const timer = setTimeout(() => setIsInitialRender(false), 1500);
        return () => clearTimeout(timer);
    }, []);

    useEffect(() => { setActiveCatId(null); }, [language]);

    useEffect(() => {
        let cancelled = false;
        async function loadCollection() {
            try {
                await awaitMappings();
                if (cancelled) return;

                setIsLoading(true);
                setError(null);
                const [rawRefs, rawCats] = await Promise.all([
                    getReferences(language),
                    getReferenceCategories(language),
                ]);
                if (cancelled) return;

                const catMap = rawCats.reduce((acc, c) => { acc[c.id] = c.name; return acc; }, {});
                const refsForLang = Array.isArray(rawRefs)
                    ? rawRefs.filter(item => {
                        if (!item.pll_lang) return true; // Permissive: if no lang set, keep it
                        return item.pll_lang.toLowerCase() === pllLang.toLowerCase();
                    })
                    : [];
                
                if (import.meta.env.DEV) {
                    console.log(`[References] ${Array.isArray(rawRefs) ? rawRefs.length : 0} items from CMS, ${refsForLang.length} kept after lang filter ("${pllLang}").`);
                }

                const mappedRefs = refsForLang.map(item => ({
                    ...mapReferenceCard(item, catMap),
                    data: item
                }));
                
                setAllRefs(mappedRefs);
                setPageData(prev => ({ ...prev, items: mappedRefs }));

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
    }, [language, pllLang]);

    const filteredRefs = activeCatId === null
        ? allRefs
        : allRefs.filter(ref => {
            const ids = Array.isArray(ref.categoryIds) ? ref.categoryIds : [];
            return ids.some(id => String(id) === String(activeCatId));
        });


    const getProps = (instanceName, localProps) => 
        resolveInstanceProps('References', instanceName, localProps, null); // Collections handle their own hydration

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

    const headerProps = getProps('ReferencesHeaderSection', pageData.header);

    return (
        <main className="pt-28">
            {/* Page: References → Section: ReferencesHeaderSection */}
            <section className="pt-8 pb-8 px-6 text-center">
                <div className="max-w-7xl mx-auto space-y-6">
                    <p className="text-lg opacity-90 max-w-2xl mx-auto leading-relaxed">{headerProps.intro}</p>
                </div>
            </section>

            {/* Page: References → Section: ReferencesCategoryFilter */}
            <section className="sticky top-20 z-40 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-sm border-y border-slate-100 dark:border-slate-800 py-4">
                <div className="max-w-7xl mx-auto">
                    <div className="flex flex-nowrap md:flex-wrap items-center justify-start md:justify-center gap-3 md:gap-8 overflow-x-auto px-6 scrollbar-hide">
                        <button
                            onClick={() => setActiveCatId(null)}
                            className={`flex-shrink-0 px-6 py-2 rounded-full text-sm font-medium uppercase tracking-widest transition-all ${activeCatId === null ? 'bg-[#2a411a] text-white shadow-lg' : 'text-slate-500 hover:text-primary'}`}
                        >
                            {headerProps.all}
                        </button>
                        {categories.map(cat => (
                            <button
                                key={cat.id}
                                onClick={() => setActiveCatId(cat.id)}
                                className={`flex-shrink-0 px-6 py-2 rounded-full text-sm font-medium uppercase tracking-widest transition-all ${activeCatId !== null && String(activeCatId) === String(cat.id) ? 'bg-[#2a411a] text-white shadow-lg' : 'text-slate-500 hover:text-primary'}`}
                            >
                                {cat.name}
                            </button>
                        ))}
                    </div>
                </div>
            </section>

            {/* Page: References → Section: ReferencesGridSection → Component: ReferenceCard */}
            <section className="pb-32 px-6 mt-16">
                <div className="max-w-7xl mx-auto">
                    {isLoading ? (
                        <div className="min-h-[40vh] flex items-center justify-center">
                            <div className="w-12 h-12 rounded-full border-4 border-primary border-t-transparent animate-spin" />
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
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
                                    data={project.data}
                                    page="References"
                                    section="ReferencesGridSection"
                                />
                            ))}
                        </div>
                    )}
                    <div className="mt-20 text-center">
                        <button className="inline-flex items-center gap-3 px-12 py-4 border-2 border-primary text-primary font-bold rounded-full hover:bg-primary hover:text-white transition-all duration-300">
                            {headerProps.load_more}
                            <span className="material-symbols-outlined">refresh</span>
                        </button>
                    </div>
                </div>
            </section>
        </main>
    );
};

export default References;
