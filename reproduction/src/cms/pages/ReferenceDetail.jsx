import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { useLanguage } from '@/cms/i18n/useLanguage';
import { ROUTES } from '@/cms/i18n/routes';
import { getReference, getReferenceCore, getTermsByIds, resolveMedia, decodeHtmlEntities, translateTaxonomy } from '@/cms/lib/cms';

import { resolveInstanceProps, resolveInstancePropsAsync } from '@/cms/bridge-resolver';
import { useScrollReveal } from '@/cms/hooks/useScrollReveal';
import useCmsSeo from '@/cms/hooks/useCmsSeo';

import { definePreview } from '@/cms/lib/preview';
import Icon from '@/cms/components/ui/Icon';
import CmsImage from '@/cms/components/ui/CmsImage';

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

const ReferenceDetail = () => {
    const { slug } = useParams();
    const location = useLocation();
    const { language, t, globalSeo, setAlternates, setPageReady } = useLanguage();


    // ─── State ───────────────────────────────────────────────────────────────
    const [status, setStatus] = useState('ready');  // Initialized to 'ready' to show shell
    const [project, setProject] = useState(null);
    const [rawProject, setRawProject] = useState(null);
    const [hydratedProps, setHydratedProps] = useState(null);
    const [activeImageIndex, setActiveImageIndex] = useState(null);

    // ─── Data Resolution ─────────────────────────────────────────────────────
    const getLocalContent = () => ({
        hero: {
            title: location.state?.preview?.title || '',
            categoryLabel: location.state?.preview?.categoryLabel || '',
            image: location.state?.preview?.image || ''
        },
        sidebar: {
            title: t('detail.project_details') || 'Projekt Details',
            dateLabel: t('detail.date'),
            dateValue: '',
            serviceLabel: t('detail.service'),
            categories: [],
            locationLabel: t('detail.location'),
            locationValue: '',
            ctaLabel: t('detail.request_similar'),
        },
        content: {
            challengeTitle: t('detail.challenge'),
            description: '',
            beforeImage: '',
            afterImage: '',
            beforeLabel: t('detail.before'),
            afterLabel: t('detail.after'),
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
    const sidebarProps = getSectionProps('ReferenceSidebarSection', project?.sidebar || getLocalContent().sidebar);
    const preselectedServiceKeys = [...new Set(
        (sidebarProps.categories || [])
            .map((category) => String(category).trim().toLowerCase())
            .filter(Boolean)
    )];
    const ctaLink = preselectedServiceKeys.length
        ? `${ROUTES[language].contact}?services=${encodeURIComponent(preselectedServiceKeys.join(','))}#contact-form`
        : `${ROUTES[language].contact}#contact-form`;
    const ctaState = preselectedServiceKeys.length
        ? { preselectedServices: preselectedServiceKeys }
        : undefined;
    
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
    const primaryAbortRef = useRef(null);

    useScrollReveal([project]);

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [slug]);

    // ─── Primary Fetch Effect (Phase 1: Shell & Hero) ──────────────────────────
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
                
                // Phase 0: Check if we have preview state to show a shell immediately
                if (location.state?.preview) {
                    setProject({
                        hero: {
                            ...getLocalContent().hero,
                            title: location.state.preview.title,
                            categoryLabel: location.state.preview.categoryLabel,
                            image: location.state.preview.image
                        },
                        sidebar: getLocalContent().sidebar,
                        content: getLocalContent().content
                    });
                }
                // Keep old project data visible until new data arrives (no flash)

                // Phase 1: Core Fetch (Hero, Title, Meta) - no expensive _embed=1 yet
                const ref = await getReferenceCore(slug, language, controller.signal);

                if (controller.signal.aborted) return;

                if (!ref) {
                    setStatus('notfound');
                    return;
                }

                const cf = ref.customFields || ref.acf || ref.meta || {};

                // Phase 1: Only resolve hero image
                const thumbnail = await resolveMedia(ref.featured_image || ref._embedded?.['wp:featuredmedia']?.[0] || null);

                if (controller.signal.aborted) return;

                // ─── Extract Robust Category Names ──────────────────────────────────
                const tax = ref.taxonomies || ref.taxonomy || {};
                const embeddedTerms = ref._embedded?.['wp:term']?.flat() || [];
                
                let catNames = [];
                if (embeddedTerms.length > 0) {
                    catNames = embeddedTerms.map(t => t.name).filter(Boolean);
                } else {
                    const rawCatData = cf.kategorie || cf.reference_category || cf.categories || tax.kategorie || tax.reference_category || ref.kategorie || ref.reference_category || ref.categories || ref.referenzen_category || [];
                    const rawCatArray = Array.isArray(rawCatData) ? rawCatData : [rawCatData].filter(Boolean);
                    catNames = rawCatArray.map(c => (typeof c === 'object' && c !== null ? c.name : c)).filter(Boolean);
                }
                // Apply language fallback for taxonomy names (e.g. "Baumpflege" → "Entretien d'arbres" on FR)
                catNames = catNames.map(name => translateTaxonomy(name, language));

                // ─── Format Localized Date ───────────────────────────────────────────
                // Pass the raw date string to the sidebar for formatting
                const rawDateStr = cf.referenz_datum || ref.acf?.referenz_datum || ref.date || ref.post_date || '';

                setRawProject(ref);
                
                // Register alternates for API-driven routing
                const translations = ref.cc_alternates || ref.pll_translations || ref.translations || {};
                if (Object.keys(translations).length > 0) {
                    const resolvedAlternates = { ...translations };
                    
                    // If translation values are just IDs, fetch the actual translated reference to get its resolved_path
                    await Promise.all(
                        Object.entries(translations).map(async ([lang, value]) => {
                            if (!value) return;
                            if (typeof value === 'number' || /^\d+$/.test(String(value))) {
                                try {
                                    const targetLangCode = lang.toUpperCase();
                                    const translatedRef = await getReference(value, targetLangCode, controller.signal);
                                    if (translatedRef && !controller.signal.aborted) {
                                        const path = translatedRef.resolved_path || translatedRef.link || '';
                                        resolvedAlternates[lang] = { url: path };
                                    }
                                } catch (err) {
                                    console.trace(`[ReferenceDetail] Failed to resolve translation ID ${value} for ${lang}`);
                                }
                            }
                        })
                    );
                    
                    if (!controller.signal.aborted) {
                        setAlternates(resolvedAlternates);
                    }
                }

                const local = getLocalContent();
                setProject({
                    hero: {
                        ...local.hero,
                        title: decodeHtmlEntities(
                            ref.title?.rendered || (typeof ref.title === 'string' ? ref.title : '') || ref.post_title || ref.name || ''
                        ),
                        image: thumbnail,
                        categoryLabel: catNames[0] || ''
                    },
                    sidebar: { 
                        ...local.sidebar, 
                        dateValue: rawDateStr, 
                        categories: catNames, 
                        locationValue: cf.referenz_ort || ref.acf?.location || '' 
                    },
                    content: { 
                        ...local.content, 
                        description: decodeHtmlEntities(cf.beschreibung || ref.acf?.short_description || ''), 
                        challengeTitle: cf.challenge_title || ref.acf?.challenge_title || local.content.challengeTitle,
                    }
                });

                setStatus('ready');
                setPageReady(true);

                // ─── Phase 2: Deferred Full Data & Asset Loading ───────────────────────────────
                // We load the full reference (with _embed=1) and heavy images after the core is visible
                const loadDeferredAssets = async () => {
                    try {
                        // 1. Fetch the full object for gallery/before-after data
                        const fullRef = await getReference(slug, language, controller.signal);
                        if (controller.signal.aborted || !fullRef) return;

                        const fullCf = fullRef.customFields || fullRef.acf || fullRef.meta || {};

                        // 2. Resolve the heavy images
                        const rawGallery = fullCf.galerie || fullRef.acf?.gallery || [];
                        const [beforeUrl, afterUrl, resolvedGallery] = await Promise.all([
                            resolveMedia(fullCf.bild_vorher || fullRef.acf?.before_image),
                            resolveMedia(fullCf.bild_nachher || fullRef.acf?.after_image),
                            Promise.all((Array.isArray(rawGallery) ? rawGallery : []).map(img => resolveMedia(img)))
                        ]);

                        if (cancelledAssets || controller.signal.aborted) return;

                        setRawProject(fullRef);
                        setProject(prev => {
                            if (!prev) return prev;
                            return {
                                ...prev,
                                content: {
                                    ...prev.content,
                                    challengeTitle: fullCf.challenge_title || fullRef.acf?.challenge_title || prev.content.challengeTitle,
                                    description: decodeHtmlEntities(fullCf.beschreibung || fullRef.acf?.short_description || prev.content.description),
                                    beforeImage: beforeUrl,
                                    afterImage: afterUrl,
                                    gallery: (resolvedGallery || []).filter(Boolean)
                                }
                            };
                        });
                    } catch (deferErr) {
                        if (deferErr.name !== 'AbortError') {
                            console.warn('[ReferenceDetail] Deferred assets failed:', deferErr);
                        }
                    }
                };

                // Use idle period if available, otherwise minor delay
                let cancelledAssets = false;
                if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
                    window.requestIdleCallback(() => loadDeferredAssets());
                } else {
                    setTimeout(() => loadDeferredAssets(), 200);
                }

            } catch (err) {
                if (err.name === 'AbortError') return;
                console.error('[ReferenceDetail] Fetch failed:', err);
                setStatus('error');
            }
        }

        loadData();
        return () => controller.abort();
    }, [slug, language]);

    useCmsSeo(rawProject?.seo || globalSeo);



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

    // ─── Render States ────────────────────────────────────────────────────────
    if ((status === 'loading' || status === 'ready') && !project && !rawProject) {
        // Still waiting for initial shell data
        return <main className="flex-1 pt-28 pb-24 bg-background-light dark:bg-background-dark"><div className="max-w-7xl mx-auto min-h-screen" /></main>;
    }

    if (status === 'notfound') {
        return (
            <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
                <h1 className="text-3xl font-display text-primary mb-4">
                    {t('refs.not_found')}
                </h1>
                <Link to={ROUTES[language].references} className="text-primary hover:underline font-medium uppercase tracking-widest text-sm">
                    {t('refs.back_to_overview')}
                </Link>
            </div>
        );
    }

    if (status === 'error') {
        return (
            <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
                <h1 className="text-3xl font-display text-red-500 mb-4">
                    {t('refs.error_occurred')}
                </h1>
                <button onClick={() => window.location.reload()} className="text-primary hover:underline font-medium uppercase tracking-widest text-sm">
                    {t('refs.try_again')}
                </button>
            </div>
        );
    }

    // ─── Success Layout ───────────────────────────────────────────────────────
    // We render the shell even if the project is partially hydrated
    const heroContent = project?.hero || getLocalContent().hero;
    const sidebarContent = sidebarProps || getLocalContent().sidebar;
    const projectContent = project?.content || getLocalContent().content;

    return (
        <div className="animate-in fade-in duration-500">
            <section className="max-w-7xl mx-auto px-6 pt-12 pb-8 mt-20">
                <Link
                    to={ROUTES[language].references}
                    className="inline-flex items-center gap-2 text-sm font-medium uppercase tracking-widest text-muted-accessible hover:text-primary transition-colors"
                >
                    <Icon name="arrow_back" className="text-sm" />
                    {t('refs.back_to_overview')}
                </Link>
            </section>

            {/* Page: ReferenceDetail → Section: ReferenceHeroSection */}
            <ReferenceHeroSection {...getSectionProps('ReferenceHeroSection', heroContent)} />
            
            <section className="max-w-7xl mx-auto px-6 mb-24 md:mb-32 min-h-[50vh]">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
                    <div className="hidden lg:block lg:col-span-4 lg:sticky lg:top-32 h-fit reveal">
                        <ReferenceSidebarSection 
                            {...sidebarContent} 
                            ctaLink={ctaLink}
                            ctaState={ctaState}
                            language={language}
                        />
                    </div>

            {/* Content Section with sidebar slot */}
            <ReferenceContentSection 
                {...getSectionProps('ReferenceContentSection', projectContent)} 
                sidebar={
                    <ReferenceSidebarSection 
                        {...sidebarContent} 
                        ctaLink={ctaLink}
                        ctaState={ctaState}
                        language={language}
                    />
                }
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
                        className="absolute top-8 right-8 text-white/70 hover:text-white transition-colors z-50"
                    >
                        <Icon name="close" className="text-4xl" />
                    </button>

                    {projectGallery.length > 1 && (
                        <>
                            <button 
                                onClick={prevImage}
                                className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 w-12 md:w-16 h-12 md:h-16 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 text-white transition-all z-50 group"
                            >
                                <Icon name="arrow_back_ios_new" className="text-3xl md:text-4xl group-hover:-translate-x-1 transition-transform" />
                            </button>
                            <button 
                                onClick={nextImage}
                                className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 w-12 md:w-16 h-12 md:h-16 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 text-white transition-all z-50 group"
                            >
                                <Icon name="arrow_forward_ios" className="text-3xl md:text-4xl group-hover:translate-x-1 transition-transform" />
                            </button>
                        </>
                    )}

                    <div className="relative max-w-5xl w-full h-full flex items-center justify-center">
                        {projectGallery[activeImageIndex] && (
                            <CmsImage
                                image={projectGallery[activeImageIndex]}
                                alt="Project Gallery"
                                size="original"
                                className="max-w-full max-h-full object-contain shadow-2xl animate-in zoom-in-95 duration-500"
                                sizes="100vw"
                                onClick={(e) => e.stopPropagation()}
                            />
                        )}
                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/70 text-xs tracking-widest uppercase font-medium">
                            {activeImageIndex + 1} / {projectGallery.length}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ReferenceDetail;
