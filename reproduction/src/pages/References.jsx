import React, { useState, useEffect } from 'react';
import { useLanguage } from '../i18n/useLanguage';
import { PLLCode, getReferences, getReferenceCategories, mapReferenceCard } from '../lib/cms';
import ReferenceCard from '../components/ReferenceCard';

const References = () => {
    const { language, t } = useLanguage();
    const pllLang = PLLCode[language]; // 'de' | 'fr'

    // ── Data state ───────────────────────────────────────────────────────────
    const [allRefs, setAllRefs] = useState([]);
    const [categories, setCategories] = useState([]);
    const [activeCatId, setActiveCatId] = useState(null); // null = "All"
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    // ── Animation state ──────────────────────────────────────────────────────
    const [isInitialRender, setIsInitialRender] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => setIsInitialRender(false), 1500);
        return () => clearTimeout(timer);
    }, []);

    // Reset category filter when language changes so stale category IDs don't bleed across
    useEffect(() => {
        setActiveCatId(null);
    }, [language]);

    // ── Fetch data whenever language changes ─────────────────────────────────
    useEffect(() => {
        let cancelled = false;

        async function loadData() {
            try {
                setIsLoading(true);
                setError(null);

                const [rawRefs, rawCats] = await Promise.all([
                    getReferences(language),
                    getReferenceCategories(language),
                ]);

                if (cancelled) return;

                // ── Strict pll_lang filter ────────────────────────────────────
                // The CMS base URL already targets the correct language, but
                // Polylang may still return posts from both locales (e.g. when a
                // translation is missing). Enforce the active locale here.
                const refsForLang = Array.isArray(rawRefs)
                    ? rawRefs.filter(item => !item.pll_lang || item.pll_lang === pllLang)
                    : [];

                const catsForLang = Array.isArray(rawCats)
                    ? rawCats.filter(item => !item.pll_lang || item.pll_lang === pllLang)
                    : [];

                // Build id→name map for category resolution in mapReferenceCard
                const catMap = catsForLang.reduce((acc, c) => { acc[c.id] = c.name; return acc; }, {});

                // Sort newest-first (stable client-side guarantee)
                const sorted = [...refsForLang].sort(
                    (a, b) => new Date(b.date) - new Date(a.date)
                );

                setAllRefs(sorted.map(item => mapReferenceCard(item, catMap)));

                // ── Fixed display order for the four core categories ──────────
                const PRIORITY_SLUGS = ['baumpflege', 'baumfaellung', 'gartenpflege', 'bepflanzung'];
                const PRIORITY_NAMES = ['Baumpflege', 'Baumfällung', 'Gartenpflege', 'Bepflanzung'];

                const prioritized = [];
                const rest = [];

                for (const cat of catsForLang) {
                    const idx = PRIORITY_SLUGS.indexOf(cat.slug);
                    if (idx !== -1) {
                        prioritized[idx] = cat;
                    } else {
                        const nameIdx = PRIORITY_NAMES.indexOf(cat.name);
                        if (nameIdx !== -1) {
                            prioritized[nameIdx] = cat;
                        } else {
                            rest.push(cat);
                        }
                    }
                }

                const orderedCats = [
                    ...prioritized.filter(Boolean),
                    ...rest.sort((a, b) => a.name.localeCompare(b.name, 'de')),
                ];

                setCategories(orderedCats);
            } catch (err) {
                if (cancelled) return;
                console.error('[References] Failed to load CMS data:', err);
                setError(true);
            } finally {
                if (!cancelled) setIsLoading(false);
            }
        }

        loadData();
        return () => { cancelled = true; };
    }, [language, pllLang]);

    // ── Client-side filter by term id ────────────────────────────────────────
    const filteredRefs = activeCatId === null
        ? allRefs
        : allRefs.filter(ref => ref.categoryIds.includes(activeCatId));

    // ── Error state ──────────────────────────────────────────────────────────
    if (error) {
        return (
            <main className="pt-28 min-h-[60vh] flex flex-col items-center justify-center p-6 text-center">
                <h2 className="text-3xl font-display text-primary mb-4 p-8">
                    {t('refs.error_loading')}
                </h2>
                <p className="text-slate-500 mb-8 max-w-md mx-auto">
                    {t('refs.error_retry')}
                </p>
                <button
                    onClick={() => window.location.reload()}
                    className="inline-flex items-center gap-3 px-8 py-3 bg-primary text-white font-bold rounded-full hover:bg-primary-dark transition-all duration-300"
                >
                    {t('refs.reload')}
                </button>
            </main>
        );
    }

    return (
        <main className="pt-28">
            {/* Intro text */}
            <section className="pt-8 pb-8 px-6 text-center">
                <div className="max-w-7xl mx-auto text-center space-y-6">
                    <p className="text-lg opacity-90 max-w-2xl mx-auto leading-relaxed">
                        {t('refs.intro')}
                    </p>
                </div>
            </section>

            {/* Sticky filter bar */}
            <section className="sticky top-20 z-40 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-sm border-y border-slate-100 dark:border-slate-800 mb-4 md:mb-8 py-3 md:py-4">
                <div className="max-w-7xl mx-auto">
                    <div className="flex flex-nowrap md:flex-wrap items-center justify-start md:justify-center gap-3 md:gap-8 overflow-x-auto snap-x snap-mandatory px-6 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">

                        {/* "All" tab */}
                        <button
                            key="all"
                            onClick={() => setActiveCatId(null)}
                            className={`flex-shrink-0 snap-start whitespace-nowrap px-6 py-2 rounded-full text-sm font-medium uppercase tracking-widest transition-all ${activeCatId === null
                                ? 'bg-[#2a411a] text-white shadow-lg'
                                : 'text-slate-500 hover:text-primary border border-transparent hover:border-primary/20'
                                }`}
                        >
                            {t('refs.all')}
                        </button>

                        {/* Dynamic tabs — names come from the CMS in the active language */}
                        {categories.map(cat => (
                            <button
                                key={cat.id}
                                onClick={() => setActiveCatId(cat.id)}
                                className={`flex-shrink-0 snap-start whitespace-nowrap px-6 py-2 rounded-full text-sm font-medium uppercase tracking-widest transition-all ${activeCatId === cat.id
                                    ? 'bg-[#2a411a] text-white shadow-lg'
                                    : 'text-slate-500 hover:text-primary border border-transparent hover:border-primary/20'
                                    }`}
                            >
                                {cat.name}
                            </button>
                        ))}
                    </div>
                </div>
            </section>

            {/* Reference cards grid */}
            <section className="pb-32 px-6">
                <div className="max-w-7xl mx-auto">
                    {isLoading ? (
                        <div className="min-h-[40vh] flex items-center justify-center">
                            <div className="w-12 h-12 rounded-full border-4 border-primary border-t-transparent animate-spin" />
                        </div>
                    ) : (
                        <div className="columns-1 md:columns-2 lg:columns-3 gap-8 space-y-8">
                            {filteredRefs.map((project, index) => (
                                <ReferenceCard
                                    key={project.id}
                                    project={project}
                                    language={language}
                                    animateEntry={isInitialRender}
                                    staggerIndex={index}
                                />
                            ))}
                        </div>
                    )}

                    <div className="mt-20 text-center">
                        <button className="inline-flex items-center gap-3 px-12 py-4 border-2 border-primary text-primary font-bold rounded-full hover:bg-primary hover:text-white transition-all duration-300">
                            {t('refs.load_more')}
                            <span className="material-symbols-outlined">refresh</span>
                        </button>
                    </div>
                </div>
            </section>
        </main>
    );
};

export default References;
