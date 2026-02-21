import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useLanguage } from '../i18n/useLanguage';
import { getReferenceBySlug, getCategoryMap, resolveMedia } from '../lib/cms';
import { useScrollReveal } from '../hooks/useScrollReveal';

const ReferenceDetail = () => {
    const { id } = useParams(); // param name matches App.jsx route "/referenzen/:id" — used as slug
    const { language } = useLanguage();
    // ── All state must be declared unconditionally (Rules of Hooks) ──────────
    const [sliderValue, setSliderValue] = useState(50);
    const [project, setProject] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    // Re-run reveal observer after data loads so .reveal elements in the content are observed.
    // On mount the DOM only has the loading spinner; reveal elements appear after setProject.
    useScrollReveal([project]);

    // ── Scroll to top whenever slug changes ──────────────────────────────────
    useEffect(() => {
        window.scrollTo(0, 0);
    }, [id]);

    // ── Primary data fetch ───────────────────────────────────────────────────
    useEffect(() => {
        if (!id) {
            setError('No slug');
            setIsLoading(false);
            return;
        }

        let cancelled = false;

        async function loadData() {
            try {
                setIsLoading(true);
                setError(null);

                // Fetch reference by slug AND category map concurrently
                const [ref, catMap] = await Promise.all([
                    getReferenceBySlug(id),
                    getCategoryMap()
                ]);

                if (cancelled) return;

                if (!ref) {
                    setError('Not Found');
                    setIsLoading(false);
                    return;
                }

                // ── Featured image ──────────────────────────────────────────
                const thumbnail =
                    ref._embedded?.['wp:featuredmedia']?.[0]?.source_url || null;

                // ── Categories ─────────────────────────────────────────────
                // Prefer embedded wp:term (first group = primary taxonomy)
                let catNames = [];
                const embeddedTerms = ref._embedded?.['wp:term']?.[0];
                if (Array.isArray(embeddedTerms) && embeddedTerms.length > 0) {
                    catNames = embeddedTerms.map(t => t.name).filter(Boolean);
                } else if (Array.isArray(ref.reference_category) && ref.reference_category.length > 0) {
                    // Fall back to resolving IDs via the category map
                    catNames = ref.reference_category.map(catId => catMap[catId]).filter(Boolean);
                }

                // ── Publish date ────────────────────────────────────────────
                let formattedDate = '';
                if (ref.date) {
                    try {
                        formattedDate = new Date(ref.date).toLocaleDateString(
                            language === 'DE' ? 'de-DE' : 'fr-FR',
                            { year: 'numeric', month: 'long' }
                        );
                    } catch {
                        formattedDate = ref.date;
                    }
                }

                // ── Resolve before / after images (may be numeric IDs) ──────
                const beforeUrl = await resolveMedia(ref.acf?.before_image);
                if (cancelled) return;
                const afterUrl = await resolveMedia(ref.acf?.after_image);
                if (cancelled) return;

                setProject({
                    id: ref.slug || id,
                    title: ref.title?.rendered || '',
                    dateFormatted: formattedDate,
                    categories: catNames,
                    location: ref.acf?.location || '',
                    description: ref.acf?.short_description || '',
                    thumbnailImage: thumbnail,
                    beforeImage: beforeUrl,
                    afterImage: afterUrl,
                });

            } catch (err) {
                if (cancelled) return;
                if (import.meta.env.DEV) {
                    console.error('[ReferenceDetail] Failed to load CMS data:', err);
                }
                setError('Error');
            } finally {
                if (!cancelled) setIsLoading(false);
            }
        }

        loadData();

        return () => { cancelled = true; };
    }, [id, language]);

    // ── Loading state ────────────────────────────────────────────────────────
    if (isLoading) {
        return (
            <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
                <div className="w-12 h-12 rounded-full border-4 border-primary border-t-transparent animate-spin mx-auto mb-4" />
            </div>
        );
    }

    // ── Not found / error state ──────────────────────────────────────────────
    if (error || !project) {
        return (
            <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
                <h2 className="text-3xl font-display text-primary mb-4">
                    {language === 'DE' ? 'Referenz nicht gefunden' : 'Référence non trouvée'}
                </h2>
                <Link
                    to="/referenzen"
                    className="text-primary hover:underline font-medium uppercase tracking-widest text-sm"
                >
                    {language === 'DE' ? 'Zurück zur Übersicht' : "Retour à l'aperçu"}
                </Link>
            </div>
        );
    }

    // ── Derived booleans used in JSX ─────────────────────────────────────────
    const hasBeforeAfter = project.beforeImage || project.afterImage;

    // ── Full detail layout ───────────────────────────────────────────────────
    return (
        <>
            {/* ── Back link ── */}
            <section className="max-w-7xl mx-auto px-6 pt-12 pb-8 mt-20">
                <Link
                    to="/referenzen"
                    className="inline-flex items-center gap-2 text-sm font-medium uppercase tracking-widest text-slate-400 hover:text-primary transition-colors"
                >
                    <span className="material-symbols-outlined text-sm">arrow_back</span>
                    {language === 'DE' ? 'Zurück zur Übersicht' : "Retour à l'aperçu"}
                </Link>
            </section>

            {/* ── Hero image + title overlay ── */}
            <section className="px-6 mb-24">
                <div className="max-w-7xl mx-auto">
                    <div className="relative h-[70vh] w-full rounded-3xl overflow-hidden shadow-2xl reveal">
                        {project.thumbnailImage && (
                            <img
                                alt={project.title}
                                className="w-full h-full object-cover"
                                src={project.thumbnailImage}
                            />
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-12">
                            <div className="max-w-3xl">
                                <span className="text-white/80 text-sm uppercase tracking-[0.3em] mb-4 block reveal stagger-1">
                                    {language === 'DE' ? 'Referenzprojekt' : 'Projet de Référence'}
                                </span>
                                <h1 className="text-5xl md:text-7xl font-display text-white leading-tight mb-4 reveal stagger-2">
                                    {project.title}
                                </h1>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── Sidebar + main content ── */}
            <section className="max-w-7xl mx-auto px-6 mb-32">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">

                    {/* Sidebar */}
                    <div className="lg:col-span-4 lg:sticky lg:top-32 h-fit reveal">
                        <div className="bg-surface-light dark:bg-surface-dark p-10 rounded-3xl space-y-8">
                            <h2 className="text-2xl font-display text-primary">
                                {language === 'DE' ? 'Projekt Details' : 'Détails du Projet'}
                            </h2>
                            <div className="space-y-6">

                                {/* Date */}
                                {project.dateFormatted && (
                                    <>
                                        <div>
                                            <span className="text-[10px] uppercase tracking-[0.2em] text-slate-400 block mb-1">
                                                {language === 'DE' ? 'Datum' : 'Date'}
                                            </span>
                                            <p className="text-lg font-medium">{project.dateFormatted}</p>
                                        </div>
                                        <div className="h-px bg-slate-200 dark:bg-slate-700" />
                                    </>
                                )}

                                {/* Categories */}
                                {project.categories.length > 0 && (
                                    <>
                                        <div>
                                            <span className="text-[10px] uppercase tracking-[0.2em] text-slate-400 block mb-1">
                                                {language === 'DE' ? 'Dienstleistung' : 'Service'}
                                            </span>
                                            <div className="flex flex-wrap gap-2 mt-2">
                                                {project.categories.map((cat) => (
                                                    <span
                                                        key={cat}
                                                        className="text-sm font-medium bg-primary/5 text-primary px-3 py-1 rounded-full border border-primary/10"
                                                    >
                                                        {cat}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="h-px bg-slate-200 dark:bg-slate-700" />
                                    </>
                                )}

                                {/* Location */}
                                {project.location && (
                                    <>
                                        <div>
                                            <span className="text-[10px] uppercase tracking-[0.2em] text-slate-400 block mb-1">
                                                {language === 'DE' ? 'Standort' : 'Lieu'}
                                            </span>
                                            <p className="text-lg font-medium">{project.location}</p>
                                        </div>
                                        <div className="h-px bg-slate-200 dark:bg-slate-700" />
                                    </>
                                )}
                            </div>

                            <Link
                                to="/kontakt"
                                className="block w-full text-center py-5 mt-4 border border-primary text-primary hover:bg-primary hover:text-white rounded-full transition-all uppercase text-xs font-bold tracking-widest"
                            >
                                {language === 'DE' ? 'Ähnliches Projekt anfragen' : 'Demander un projet similaire'}
                            </Link>
                        </div>
                    </div>

                    {/* Main content */}
                    <div className="lg:col-span-8 reveal stagger-1">
                        <div className="prose prose-slate prose-lg dark:prose-invert max-w-none">
                            <h2 className="font-display text-3xl text-primary mb-8">
                                {language === 'DE' ? 'Herausforderung & Umsetzung' : 'Défi & Mise en oeuvre'}
                            </h2>
                            {project.description && (
                                <p className="text-slate-600 dark:text-slate-400 leading-relaxed mb-6 whitespace-pre-wrap">
                                    {project.description}
                                </p>
                            )}
                        </div>

                        {/* Before / After Slider — only rendered when both images available */}
                        {hasBeforeAfter && (
                            <div className="mt-16">
                                <div className="relative w-full h-[600px] overflow-hidden rounded-3xl no-select group shadow-2xl bg-slate-100">
                                    {/* After image (background) */}
                                    {project.afterImage && (
                                        <img
                                            alt="Nachher"
                                            className="absolute inset-0 w-full h-full object-cover"
                                            src={project.afterImage}
                                        />
                                    )}
                                    <span className="absolute top-6 right-6 font-montserrat text-[10px] text-white/90 uppercase tracking-[0.2em] z-10 bg-black/20 backdrop-blur-sm px-3 py-1 rounded">
                                        {language === 'DE' ? 'NACHHER' : 'APRÈS'}
                                    </span>

                                    {/* Before image (clipped overlay) */}
                                    {project.beforeImage && (
                                        <div
                                            className="absolute inset-0 overflow-hidden border-r-2 border-primary/30"
                                            style={{ width: `${sliderValue}%` }}
                                        >
                                            <img
                                                alt="Vorher"
                                                className="absolute inset-0 w-[800px] md:w-[1200px] lg:w-[1600px] h-full object-cover max-w-none"
                                                src={project.beforeImage}
                                            />
                                            <span className="absolute top-6 left-6 font-montserrat text-[10px] text-white/90 uppercase tracking-[0.2em] z-10 bg-black/20 backdrop-blur-sm px-3 py-1 rounded">
                                                {language === 'DE' ? 'VORHER' : 'AVANT'}
                                            </span>
                                        </div>
                                    )}

                                    {/* Divider handle */}
                                    <div
                                        className="absolute inset-y-0 -ml-[1px] w-[2px] bg-white cursor-ew-resize z-20"
                                        style={{ left: `${sliderValue}%` }}
                                    >
                                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-14 h-14 bg-white rounded-full flex items-center justify-center slider-handle-shadow border-4 border-white transition-transform group-hover:scale-105">
                                            <span className="material-symbols-outlined text-primary text-3xl font-bold select-none">swap_horiz</span>
                                        </div>
                                    </div>

                                    {/* Range input for dragging */}
                                    <input
                                        type="range"
                                        min="0"
                                        max="100"
                                        value={sliderValue}
                                        onChange={(e) => setSliderValue(Number(e.target.value))}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-30"
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </section>
        </>
    );
};

export default ReferenceDetail;
