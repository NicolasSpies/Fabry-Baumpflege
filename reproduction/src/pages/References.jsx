import React, { useState, useEffect } from 'react';
import { useLanguage } from '../i18n/useLanguage';
import { getReferences, getReferenceCategories, mapReferenceCard } from '../lib/cms';
import ReferenceCard from '../components/ReferenceCard';

const References = () => {
    const { language } = useLanguage();

    // ── Data state ───────────────────────────────────────────────────────────
    const [allRefs, setAllRefs] = useState([]);          // all formatted references
    const [categories, setCategories] = useState([]);    // [{id, name}]
    const [activeCatId, setActiveCatId] = useState(null); // null = "Alle"
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    // ── Animation state ──────────────────────────────────────────────────────
    const [isInitialRender, setIsInitialRender] = useState(true);

    useEffect(() => {
        const t = setTimeout(() => setIsInitialRender(false), 1500);
        return () => clearTimeout(t);
    }, []);

    // ── Fetch data on mount ──────────────────────────────────────────────────
    useEffect(() => {
        async function loadData() {
            try {
                setIsLoading(true);

                // Fetch refs (date DESC) and taxonomy terms in parallel
                const [rawRefs, cats] = await Promise.all([
                    getReferences(),
                    getReferenceCategories(),
                ]);

                // Build id→name map for the fallback path in mapReferenceCard
                const catMap = cats.reduce((acc, c) => { acc[c.id] = c.name; return acc; }, {});

                // Sort by date descending as a stable client-side guarantee
                const sorted = [...rawRefs].sort(
                    (a, b) => new Date(b.date) - new Date(a.date)
                );

                setAllRefs(sorted.map(item => mapReferenceCard(item, catMap)));

                // ── Fixed display order for the four core categories ──────────
                // Priority slugs define the required left-to-right tab order.
                // Fallback matches on German name if slug is absent.
                const PRIORITY_SLUGS = ['baumpflege', 'baumfaellung', 'gartenpflege', 'bepflanzung'];
                const PRIORITY_NAMES = ['Baumpflege', 'Baumfällung', 'Gartenpflege', 'Bepflanzung'];

                const prioritized = [];
                const rest = [];

                for (const cat of cats) {
                    const idx = PRIORITY_SLUGS.indexOf(cat.slug);
                    if (idx !== -1) {
                        prioritized[idx] = cat; // slot into exact position
                    } else {
                        // Slug didn't match — try name fallback
                        const nameIdx = PRIORITY_NAMES.indexOf(cat.name);
                        if (nameIdx !== -1) {
                            prioritized[nameIdx] = cat;
                        } else {
                            rest.push(cat);
                        }
                    }
                }

                // Compact sparse array (some priority slots may be unfilled), then
                // append any future categories sorted alphabetically by name.
                const orderedCats = [
                    ...prioritized.filter(Boolean),
                    ...rest.sort((a, b) => a.name.localeCompare(b.name, 'de')),
                ];

                setCategories(orderedCats);
            } catch (err) {
                console.error('[References] Failed to load CMS data:', err);
                setError(true);
            } finally {
                setIsLoading(false);
            }
        }
        loadData();
    }, []);

    // ── Client-side filter by term id ────────────────────────────────────────
    // categoryIds is kept on the mapped object for this exact purpose
    const filteredRefs = activeCatId === null
        ? allRefs
        : allRefs.filter(ref => ref.categoryIds.includes(activeCatId));

    // ── Error state ──────────────────────────────────────────────────────────
    if (error) {
        return (
            <main className="pt-28 min-h-[60vh] flex flex-col items-center justify-center p-6 text-center">
                <h2 className="text-3xl font-display text-primary mb-4 p-8">
                    {language === 'DE'
                        ? 'Fehler beim Laden der Referenzen.'
                        : 'Erreur lors du chargement des références.'}
                </h2>
                <p className="text-slate-500 mb-8 max-w-md mx-auto">
                    {language === 'DE'
                        ? 'Bitte versuchen Sie es später noch einmal.'
                        : 'Veuillez réessayer plus tard.'}
                </p>
                <button
                    onClick={() => window.location.reload()}
                    className="inline-flex items-center gap-3 px-8 py-3 bg-primary text-white font-bold rounded-full hover:bg-primary-dark transition-all duration-300"
                >
                    {language === 'DE' ? 'Neu laden' : 'Recharger'}
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
                        {language === 'DE'
                            ? 'Entdecke eine Auswahl meiner Arbeiten. Von präziser Baumpflege bis hin zu komplexen Fällungen und hochwertiger Gartengestaltung.'
                            : "Découvrez une sélection de nos travaux. De l'Taille raisonnée précise aux abattages complexes et à l'aménagement paysager de haute qualité."}
                    </p>
                </div>
            </section>

            {/* Sticky filter bar — categories come from WordPress, never hardcoded */}
            <section className="sticky top-20 z-40 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-sm border-y border-slate-100 dark:border-slate-800 mb-4 md:mb-8 py-3 md:py-4">
                <div className="max-w-7xl mx-auto">
                    <div className="flex flex-nowrap md:flex-wrap items-center justify-start md:justify-center gap-3 md:gap-8 overflow-x-auto snap-x snap-mandatory px-6 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">

                        {/* "All" tab — always present */}
                        <button
                            key="all"
                            onClick={() => setActiveCatId(null)}
                            className={`flex-shrink-0 snap-start whitespace-nowrap px-6 py-2 rounded-full text-sm font-medium uppercase tracking-widest transition-all ${activeCatId === null
                                ? 'bg-[#2a411a] text-white shadow-lg'
                                : 'text-slate-500 hover:text-primary border border-transparent hover:border-primary/20'
                                }`}
                        >
                            {language === 'DE' ? 'Alle' : 'Tous'}
                        </button>

                        {/* Dynamic tabs — names from WordPress, no hardcoding */}
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
                            {language === 'DE' ? 'Mehr Projekte laden' : 'Charger plus de projets'}
                            <span className="material-symbols-outlined">refresh</span>
                        </button>
                    </div>
                </div>
            </section>
        </main>
    );
};

export default References;
