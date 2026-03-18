import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useLanguage } from '@/cms/i18n/useLanguage';
import { ROUTES } from '@/cms/i18n/routes';
import { PLLCode, getReferenceBySlug, getTermsByIds, resolveMedia, getReferenceById } from '@/cms/lib/cms';
import { resolveInstanceProps, resolveInstancePropsAsync } from '@/cms/bridge-resolver';
import { useScrollReveal } from '@/cms/hooks/useScrollReveal';
import { definePreview } from '@/cms/lib/preview';

import ReferenceHeroSection from '@/cms/sections/ReferenceHeroSection';
import ReferenceSidebarSection from '@/cms/sections/ReferenceSidebarSection';
import ReferenceContentSection from '@/cms/sections/ReferenceContentSection';


/**
 * Preview Metadata for ContentBridge scanning.
 */
export const previewData = definePreview({
    page: 'ReferenceDetail',
    sections: [
        {
            section: 'ReferenceHeroSection',
            fields: ['title', 'categoryLabel', 'image']
        },
        {
            section: 'ReferenceSidebarSection',
            fields: ['title', 'dateLabel', 'dateValue', 'serviceLabel', 'categories', 'locationLabel', 'locationValue', 'ctaLabel']
        },
        {
            section: 'ReferenceContentSection',
            fields: ['challengeTitle', 'description', 'beforeImage', 'afterImage', 'beforeLabel', 'afterLabel', 'gallery', 'galleryTitle']
        }
    ],
    // Sample source for the scanner to detect fields
    source: '/cms/wp/v2/references?_embed=1&per_page=1'
});

const ReferenceDetail = (props) => {
    const { slug } = useParams();
    const { language, t, registerDetailSwitch, unregisterDetailSwitch } = useLanguage();
    const navigate = useNavigate();

    // ─── State ───────────────────────────────────────────────────────────────
    const [status, setStatus] = useState('loading');  // 'loading' | 'ready' | 'error' | 'notfound'
    const [project, setProject] = useState(null);
    const [rawProject, setRawProject] = useState(null);
    const [hydratedProps, setHydratedProps] = useState(null);
    const [activeImageIndex, setActiveImageIndex] = useState(null);

    // ─── Data Resolution ─────────────────────────────────────────────────────
    const getLocalContent = () => ({
        hero: {
            title: "Beispielprojekt",
            categoryLabel: t('refs.reference_project'),
            image: ""
        },
        sidebar: {
            title: t('refs.project_details'),
            dateLabel: t('refs.date'),
            dateValue: "Januar 2024",
            serviceLabel: t('refs.service'),
            categories: ["Baumpflege"],
            locationLabel: t('refs.location'),
            locationValue: "Halloux",
            ctaLabel: t('refs.request_similar'),
        },
        content: {
            challengeTitle: t('refs.challenge'),
            description: "Detaillierte Projektbeschreibung...",
            beforeImage: "",
            afterImage: "",
            beforeLabel: t('refs.before'),
            afterLabel: t('refs.after'),
            gallery: [],
            galleryTitle: t('refs.gallery'),
        }
    });

    // ─── Mappings ───────────────────────────────────────────────────────────
    
    // We create a helper to resolve section props specifically for this dynamic reference
    const getSectionProps = (sectionName, localData) => {
        // If we have hydrated props from async resolver, they are indexed by section name
        if (hydratedProps?.[sectionName]) return hydratedProps[sectionName];
        
        // Sync fallback:
        return resolveInstanceProps('ReferenceDetail', sectionName, localData, rawProject || project);
    };

    // ─── Lightbox Logic ──────────────────────────────────────────────────────
    const openLightbox = (idx) => setActiveImageIndex(idx);
    const closeLightbox = () => setActiveImageIndex(null);
    
    const projectGallery = getSectionProps('ReferenceContentSection', getLocalContent().content).gallery || [];
    
    const nextImage = (e) => {
        if (e) e.stopPropagation();
        if (projectGallery.length === 0) return;
        setActiveImageIndex((prev) => (prev + 1) % projectGallery.length);
    };
    const prevImage = (e) => {
        if (e) e.stopPropagation();
        if (projectGallery.length === 0) return;
        setActiveImageIndex((prev) => (prev - 1 + projectGallery.length) % projectGallery.length);
    };

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (activeImageIndex === null) return;
            if (e.key === 'Escape') closeLightbox();
            if (e.key === 'ArrowRight') nextImage();
            if (e.key === 'ArrowLeft') prevImage();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [activeImageIndex, projectGallery]);

    // ─── Refs ─────────────────────────────────────────────────────────────────
    const pllTranslationsRef = useRef(null);
    const primaryAbortRef = useRef(null);
    const switchAbortRef = useRef(null);

    useScrollReveal([project]);

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [slug]);

    // ─── Primary Fetch Effect ─────────────────────────────────────────────────
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
                setRawProject(null);

                let ref = await getReferenceBySlug(slug, language, controller.signal);
                if (controller.signal.aborted) return;

                if (!ref) {
                    setStatus('notfound');
                    return;
                }

                const expectedLang = PLLCode[language];
                if (ref.pll_lang && ref.pll_lang !== expectedLang) {
                    const translationId = ref.pll_translations?.[expectedLang];
                    if (translationId) {
                        const translated = await getReferenceById(translationId, language, controller.signal);
                        if (controller.signal.aborted) return;
                        if (translated) ref = translated;
                    } else {
                        setStatus('notfound');
                        return;
                    }
                }

                pllTranslationsRef.current = ref.pll_translations ?? null;

                const cf = ref.customFields || ref.acf || ref.meta || {};

                const [thumbnail, beforeUrl, afterUrl, resolvedGallery] = await Promise.all([
                    resolveMedia(ref.featured_image?.url || ref.featured_image?.source_url || ref._embedded?.['wp:featuredmedia']?.[0]?.source_url || null),
                    resolveMedia(cf.bild_vorher || ref.acf?.before_image),
                    resolveMedia(cf.bild_nachher || ref.acf?.after_image),
                    Promise.all((cf.galerie || ref.acf?.gallery || []).map(img => resolveMedia(img)))
                ]);

                if (controller.signal.aborted) return;

                let catNames = [];
                const embeddedTerms = ref._embedded?.['wp:term']?.[0];
                if (Array.isArray(embeddedTerms) && embeddedTerms.length > 0) {
                    catNames = embeddedTerms.map(term => term.name).filter(Boolean);
                } else if (Array.isArray(ref.reference_category) && ref.reference_category.length > 0) {
                    const termMap = await getTermsByIds(ref.reference_category, language, controller.signal);
                    if (controller.signal.aborted) return;
                    catNames = ref.reference_category.map(id => termMap[id]).filter(Boolean);
                }

                let formattedDate = '';
                if (ref.date) {
                    formattedDate = new Date(ref.date).toLocaleDateString(
                        language === 'DE' ? 'de-DE' : 'fr-FR',
                        { year: 'numeric', month: 'long' }
                    );
                }

                setRawProject(ref);
                
                const local = getLocalContent();
                setProject({
                    hero: { ...local.hero, title: ref.title?.rendered, image: thumbnail },
                    sidebar: { 
                        ...local.sidebar, 
                        dateValue: formattedDate, 
                        categories: catNames, 
                        locationValue: cf.referenz_ort || ref.acf?.location || '' 
                    },
                    content: { 
                        ...local.content, 
                        description: cf.beschreibung || ref.acf?.short_description || '', 
                        beforeImage: beforeUrl, 
                        afterImage: afterUrl,
                        challengeTitle: cf.challenge_title || ref.acf?.challenge_title || local.content.challengeTitle,
                        gallery: (resolvedGallery || []).filter(Boolean)
                    }
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

    // ─── Bridge Hydration Effect ──────────────────────────────────────────────
    useEffect(() => {
        if (!rawProject || !project) return;
        let cancelled = false;

        async function hydrate() {
            try {
                // We resolve all sections for this dynamic reference
                const [hero, sidebar, content] = await Promise.all([
                    resolveInstancePropsAsync('ReferenceDetail', 'ReferenceHeroSection', project.hero, rawProject),
                    resolveInstancePropsAsync('ReferenceDetail', 'ReferenceSidebarSection', project.sidebar, rawProject),
                    resolveInstancePropsAsync('ReferenceDetail', 'ReferenceContentSection', project.content, rawProject),
                ]);

                if (!cancelled) {
                    setHydratedProps({
                        ReferenceHeroSection: hero,
                        ReferenceSidebarSection: sidebar,
                        ReferenceContentSection: content,
                    });
                }
            } catch (err) {
                console.error('[ReferenceDetail] Mapping hydration failed:', err);
            }
        }
        hydrate();
        return () => { cancelled = true; };
    }, [rawProject, project]);

    // ─── Language-Switch Handler ──────────────────────────────────────────────
    useEffect(() => {
        const handler = async (targetLang) => {
            if (switchAbortRef.current) switchAbortRef.current.abort();
            const controller = new AbortController();
            switchAbortRef.current = controller;

            try {
                const translations = pllTranslationsRef.current;
                const targetCodeShort = PLLCode[targetLang].toLowerCase();
                
                let targetId = null;
                if (translations) {
                    targetId = translations[targetCodeShort];
                    if (!targetId) {
                        const matchedKey = Object.keys(translations).find(k => k.startsWith(targetCodeShort));
                        if (matchedKey) targetId = translations[matchedKey];
                    }
                }

                if (!targetId) {
                    navigate(ROUTES[targetLang].references);
                    return;
                }

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

            {/* Page: ReferenceDetail → Section: ReferenceHeroSection */}
            <ReferenceHeroSection {...getSectionProps('ReferenceHeroSection', project.hero)} />

            <section className="max-w-7xl mx-auto px-6 mb-32">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
                    {/* Page: ReferenceDetail → Section: ReferenceSidebarSection */}
                    <div className="lg:col-span-4 lg:sticky lg:top-32 h-fit reveal">
                        <ReferenceSidebarSection 
                            {...getSectionProps('ReferenceSidebarSection', project.sidebar)} 
                            ctaLink={ROUTES[language].contact}
                        />
                    </div>

                    {/* Page: ReferenceDetail → Section: ReferenceContentSection */}
                    <ReferenceContentSection 
                        {...getSectionProps('ReferenceContentSection', project.content)} 
                        onOpenLightbox={openLightbox}
                    />
                </div>
            </section>

            {/* Lightbox Overlay */}
            {activeImageIndex !== null && (
                <div 
                    className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-sm flex items-center justify-center p-4 md:p-12 animate-in fade-in duration-300"
                    onClick={closeLightbox}
                >
                    <button 
                        onClick={closeLightbox}
                        className="absolute top-8 right-8 text-white/50 hover:text-white transition-colors z-50"
                    >
                        <span className="material-symbols-outlined text-4xl">close</span>
                    </button>

                    {projectGallery.length > 1 && (
                        <>
                            <button 
                                onClick={prevImage}
                                className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 w-12 md:w-16 h-12 md:h-16 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 text-white transition-all z-50 group"
                            >
                                <span className="material-symbols-outlined text-3xl md:text-4xl group-hover:-translate-x-1 transition-transform">arrow_back_ios_new</span>
                            </button>
                            <button 
                                onClick={nextImage}
                                className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 w-12 md:w-16 h-12 md:h-16 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 text-white transition-all z-50 group"
                            >
                                <span className="material-symbols-outlined text-3xl md:text-4xl group-hover:translate-x-1 transition-transform">arrow_forward_ios</span>
                            </button>
                        </>
                    )}

                    <div className="relative max-w-5xl w-full h-full flex items-center justify-center">
                        <img 
                            src={projectGallery[activeImageIndex]} 
                            alt="Project Gallery"
                            className="max-w-full max-h-full object-contain shadow-2xl animate-in zoom-in-95 duration-500"
                            onClick={(e) => e.stopPropagation()}
                        />
                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/50 text-xs tracking-widest uppercase font-medium">
                            {activeImageIndex + 1} / {projectGallery.length}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default ReferenceDetail;
