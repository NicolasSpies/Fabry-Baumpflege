import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useLanguage } from '../i18n/useLanguage';
import { ROUTES } from '../i18n/routes';
import { PLLCode, getReferenceBySlug, getCategoryMap, resolveMedia, getReferenceById } from '../lib/cms';
import { useScrollReveal } from '../hooks/useScrollReveal';

const ReferenceDetail = () => {
    const { slug } = useParams();
    const { language, t, registerDetailSwitch, unregisterDetailSwitch } = useLanguage();
    const navigate = useNavigate();

    // ─── State ───────────────────────────────────────────────────────────────
    const [status, setStatus] = useState('loading');  // 'loading' | 'ready' | 'error' | 'notfound'
    const [project, setProject] = useState(null);
    const [sliderValue, setSliderValue] = useState(50);

    // ─── Refs ─────────────────────────────────────────────────────────────────
    // pllTranslationsRef: { de: numericId, fr: numericId } from Polylang.
    // Set once a post is successfully loaded; cleared on unmount.
    const pllTranslationsRef = useRef(null);
    const primaryAbortRef = useRef(null);
    const switchAbortRef = useRef(null);

    useScrollReveal([project]);

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [slug]);

    // ─── Primary Fetch Effect ─────────────────────────────────────────────────
    // Runs whenever the slug or language in the URL changes.
    // If isSwitchingRef is true, the switch effect is handling navigation; skip.
    useEffect(() => {
        if (!slug) {
            setStatus('notfound');
            return;
        }

        if (primaryAbortRef.current) primaryAbortRef.current.abort();
        const controller = new AbortController();
        primaryAbortRef.current = controller;

        async function loadData() {
            try {
                setStatus('loading');
                setProject(null);

                const [ref, catMap] = await Promise.all([
                    getReferenceBySlug(slug, language, controller.signal),
                    getCategoryMap(language),
                ]);

                if (controller.signal.aborted) return;

                if (!ref) {
                    setStatus('notfound');
                    return;
                }

                // Store pll_translations so the language-switch handler can use them
                pllTranslationsRef.current = ref.pll_translations ?? null;

                // ── Media ────────────────────────────────────────────────────
                const [thumbnail, beforeUrl, afterUrl] = await Promise.all([
                    resolveMedia(ref._embedded?.['wp:featuredmedia']?.[0]?.source_url ?? null),
                    resolveMedia(ref.acf?.before_image),
                    resolveMedia(ref.acf?.after_image),
                ]);

                if (controller.signal.aborted) return;

                // ── Categories ───────────────────────────────────────────────
                let catNames = [];
                const embeddedTerms = ref._embedded?.['wp:term']?.[0];
                if (Array.isArray(embeddedTerms)) {
                    catNames = embeddedTerms.map(t => t.name).filter(Boolean);
                }

                // ── Date ─────────────────────────────────────────────────────
                let formattedDate = '';
                if (ref.date) {
                    formattedDate = new Date(ref.date).toLocaleDateString(
                        language === 'DE' ? 'de-DE' : 'fr-FR',
                        { year: 'numeric', month: 'long' }
                    );
                }

                setProject({
                    title: ref.title?.rendered ?? '',
                    dateFormatted: formattedDate,
                    categories: catNames,
                    location: ref.acf?.location ?? '',
                    description: ref.acf?.short_description ?? '',
                    thumbnailImage: thumbnail,
                    beforeImage: beforeUrl,
                    afterImage: afterUrl,
                });

                setStatus('ready');
            } catch (err) {
                if (err.name === 'AbortError') return;
                console.error('[ReferenceDetail] Fetch failed:', err);
                setStatus('error');
            }
        }

        loadData();
        return () => controller.abort();
    }, [slug, language]);

    // ─── Language-Switch Handler ──────────────────────────────────────────────
    // Registered in the language context so the navbar's language button
    // delegates here instead of navigating to the overview directly.
    // Unregistered on unmount so static pages work normally.
    useEffect(() => {
        const handler = async (targetLang) => {
            if (switchAbortRef.current) switchAbortRef.current.abort();
            const controller = new AbortController();
            switchAbortRef.current = controller;

            try {
                const translations = pllTranslationsRef.current;
                const targetLangCode = PLLCode[targetLang]; // 'de' | 'fr'
                const targetId = translations?.[targetLangCode];

                if (!targetId) {
                    // No translation — fall back to target language overview
                    navigate(ROUTES[targetLang].references);
                    return;
                }

                // Fetch the translated post by ID from the target language
                const translatedRef = await getReferenceById(targetId, targetLang, controller.signal);
                if (controller.signal.aborted) return;

                if (translatedRef?.slug) {
                    const detailBase = ROUTES[targetLang].referenceDetail.split('/:')[0];
                    navigate(`${detailBase}/${translatedRef.slug}`);
                } else {
                    navigate(ROUTES[targetLang].references);
                }
            } catch (err) {
                if (err.name === 'AbortError') return;
                console.error('[ReferenceDetail] Translation resolution failed:', err);
                navigate(ROUTES[targetLang].references);
            }
        };

        registerDetailSwitch(handler);
        return () => {
            unregisterDetailSwitch();
            if (switchAbortRef.current) switchAbortRef.current.abort();
        };
    }, [registerDetailSwitch, unregisterDetailSwitch, navigate]);

    // ─── Render States ────────────────────────────────────────────────────────

    if (status === 'loading') {
        return (
            <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
                <div className="w-12 h-12 rounded-full border-4 border-primary border-t-transparent animate-spin mx-auto mb-4" />
            </div>
        );
    }

    if (status === 'notfound') {
        return (
            <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
                <h2 className="text-3xl font-display text-primary mb-4">
                    {t('refs.not_found')}
                </h2>
                <Link to={ROUTES[language].references} className="text-primary hover:underline font-medium uppercase tracking-widest text-sm">
                    {t('refs.back_to_overview')}
                </Link>
            </div>
        );
    }

    if (status === 'error') {
        return (
            <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
                <h2 className="text-3xl font-display text-red-500 mb-4">
                    {t('refs.error_occurred')}
                </h2>
                <button onClick={() => window.location.reload()} className="text-primary hover:underline font-medium uppercase tracking-widest text-sm">
                    {t('refs.try_again')}
                </button>
            </div>
        );
    }

    if (!project) return null;

    // ─── Success Layout ───────────────────────────────────────────────────────

    const hasBeforeAfter = project.beforeImage || project.afterImage;

    return (
        <>
            <section className="max-w-7xl mx-auto px-6 pt-12 pb-8 mt-20">
                <Link
                    to={ROUTES[language].references}
                    className="inline-flex items-center gap-2 text-sm font-medium uppercase tracking-widest text-slate-400 hover:text-primary transition-colors"
                >
                    <span className="material-symbols-outlined text-sm">arrow_back</span>
                    {t('refs.back_to_overview')}
                </Link>
            </section>

            <section className="px-6 mb-24">
                <div className="max-w-7xl mx-auto">
                    <div className="relative h-[70vh] w-full rounded-3xl overflow-hidden shadow-2xl reveal">
                        {project.thumbnailImage && (
                            <img alt={project.title} className="w-full h-full object-cover" src={project.thumbnailImage} />
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-12">
                            <div className="max-w-3xl">
                                <span className="text-white/80 text-sm uppercase tracking-[0.3em] mb-4 block reveal stagger-1">
                                    {t('refs.reference_project')}
                                </span>
                                <h1 className="text-5xl md:text-7xl font-display text-white leading-tight mb-4 reveal stagger-2">
                                    {project.title}
                                </h1>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section className="max-w-7xl mx-auto px-6 mb-32">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
                    <div className="lg:col-span-4 lg:sticky lg:top-32 h-fit reveal">
                        <div className="bg-surface-light dark:bg-surface-dark p-10 rounded-3xl space-y-8">
                            <h2 className="text-2xl font-display text-primary">
                                {t('refs.project_details')}
                            </h2>
                            <div className="space-y-6">
                                {project.dateFormatted && (
                                    <>
                                        <div>
                                            <span className="text-[10px] uppercase tracking-[0.2em] text-slate-400 block mb-1">{t('refs.date')}</span>
                                            <p className="text-lg font-medium">{project.dateFormatted}</p>
                                        </div>
                                        <div className="h-px bg-slate-200 dark:bg-slate-700" />
                                    </>
                                )}
                                {project.categories.length > 0 && (
                                    <>
                                        <div>
                                            <span className="text-[10px] uppercase tracking-[0.2em] text-slate-400 block mb-1">{t('refs.service')}</span>
                                            <div className="flex flex-wrap gap-2 mt-2">
                                                {project.categories.map((cat) => (
                                                    <span key={cat} className="text-sm font-medium bg-primary/5 text-primary px-3 py-1 rounded-full border border-primary/10">{cat}</span>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="h-px bg-slate-200 dark:bg-slate-700" />
                                    </>
                                )}
                                {project.location && (
                                    <>
                                        <div>
                                            <span className="text-[10px] uppercase tracking-[0.2em] text-slate-400 block mb-1">{t('refs.location')}</span>
                                            <p className="text-lg font-medium">{project.location}</p>
                                        </div>
                                        <div className="h-px bg-slate-200 dark:bg-slate-700" />
                                    </>
                                )}
                            </div>
                            <Link to={ROUTES[language].contact} className="block w-full text-center py-5 mt-4 border border-primary text-primary hover:bg-primary hover:text-white rounded-full transition-all uppercase text-xs font-bold tracking-widest">
                                {t('refs.request_similar')}
                            </Link>
                        </div>
                    </div>

                    <div className="lg:col-span-8 reveal stagger-1">
                        <div className="prose prose-slate prose-lg dark:prose-invert max-w-none">
                            <h2 className="font-display text-3xl text-primary mb-8">{t('refs.challenge')}</h2>
                            {project.description && <p className="text-slate-600 dark:text-slate-400 leading-relaxed mb-6 whitespace-pre-wrap">{project.description}</p>}
                        </div>

                        {hasBeforeAfter && (
                            <div className="mt-16">
                                <div className="relative w-full h-[600px] overflow-hidden rounded-3xl no-select group shadow-2xl bg-slate-100">
                                    {project.afterImage && <img alt="Nachher" className="absolute inset-0 w-full h-full object-cover" src={project.afterImage} />}
                                    <span className="absolute top-6 right-6 font-montserrat text-[10px] text-white/90 uppercase tracking-[0.2em] z-10 bg-black/20 backdrop-blur-sm px-3 py-1 rounded">{t('refs.after')}</span>

                                    {project.beforeImage && (
                                        <div className="absolute inset-0 overflow-hidden border-r-2 border-primary/30" style={{ width: `${sliderValue}%` }}>
                                            <img alt="Vorher" className="absolute inset-0 w-[800px] md:w-[1200px] lg:w-[1600px] h-full object-cover max-w-none" src={project.beforeImage} />
                                            <span className="absolute top-6 left-6 font-montserrat text-[10px] text-white/90 uppercase tracking-[0.2em] z-10 bg-black/20 backdrop-blur-sm px-3 py-1 rounded">{t('refs.before')}</span>
                                        </div>
                                    )}

                                    <div className="absolute inset-y-0 -ml-[1px] w-[2px] bg-white cursor-ew-resize z-20" style={{ left: `${sliderValue}%` }}>
                                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-14 h-14 bg-white rounded-full flex items-center justify-center slider-handle-shadow border-4 border-white transition-transform group-hover:scale-105">
                                            <span className="material-symbols-outlined text-primary text-3xl font-bold select-none">swap_horiz</span>
                                        </div>
                                    </div>

                                    <input type="range" min="0" max="100" value={sliderValue} onChange={(e) => setSliderValue(Number(e.target.value))} className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-30" />
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
