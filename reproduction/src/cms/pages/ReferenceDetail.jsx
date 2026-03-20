import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useLanguage } from '@/cms/i18n/useLanguage';
import { ROUTES } from '@/cms/i18n/routes';
import { getReference, getTermsByIds, resolveMedia, decodeHtmlEntities } from '@/cms/lib/cms';

import { resolveInstanceProps, resolveInstancePropsAsync } from '@/cms/bridge-resolver';
import { useScrollReveal } from '@/cms/hooks/useScrollReveal';
import useCmsSeo from '@/cms/hooks/useCmsSeo';

import { definePreview } from '@/cms/lib/preview';
import { ReferenceDetailSkeleton } from '@/cms/components/ui/PageSkeleton';
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
    const { language, t, globalSeo } = useLanguage();


    // ─── State ───────────────────────────────────────────────────────────────
    const [status, setStatus] = useState('loading');  // 'loading' | 'ready' | 'error' | 'notfound'
    const [project, setProject] = useState(null);
    const [rawProject, setRawProject] = useState(null);
    const [hydratedProps, setHydratedProps] = useState(null);
    const [activeImageIndex, setActiveImageIndex] = useState(null);

    const detectServiceKey = (value) => {
        const token = String(value || '')
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-z]+/g, ' ');
        const compactToken = token.replace(/\s+/g, '');

        if (token.includes('baum fall') || compactToken.includes('baumfall') || compactToken.includes('baumfaellung') || token.includes('abattage')) return 'baumfaellung';
        if (token.includes('baum pflege') || compactToken.includes('baumpflege') || token.includes('taille raisonnee') || compactToken.includes('tailleraisonnee')) return 'baumpflege';
        if (token.includes('garten pflege') || compactToken.includes('gartenpflege') || token.includes('entretien de jardin') || compactToken.includes('entretiendejardin')) return 'gartenpflege';
        if (token.includes('bepflanz') || compactToken.includes('bepflanz') || token.includes('plantation') || compactToken.includes('plantation')) return 'bepflanzung';

        return null;
    };

    // ─── Data Resolution ─────────────────────────────────────────────────────
    const getLocalContent = () => ({
        hero: {
            title: '',
            categoryLabel: t('refs.reference_project'),
            image: ''
        },
        sidebar: {
            title: t('refs.project_details'),
            dateLabel: t('refs.date'),
            dateValue: '',
            serviceLabel: t('refs.service'),
            categories: [],
            locationLabel: t('refs.location'),
            locationValue: '',
            ctaLabel: t('refs.request_similar'),
        },
        content: {
            challengeTitle: t('refs.challenge'),
            description: '',
            beforeImage: '',
            afterImage: '',
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
    const sidebarProps = getSectionProps('ReferenceSidebarSection', project?.sidebar || getLocalContent().sidebar);
    const preselectedServiceKeys = [...new Set(
        (sidebarProps.categories || [])
            .map((category) => detectServiceKey(category))
            .filter(Boolean)
    )];
    const ctaLink = preselectedServiceKeys.length
        ? `${ROUTES[language].contact}?services=${preselectedServiceKeys.join(',')}`
        : ROUTES[language].contact;
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

                const ref = await getReference(slug, language, controller.signal);

                if (controller.signal.aborted) return;

                if (!ref) {
                    setStatus('notfound');
                    return;
                }

                const cf = ref.customFields || ref.acf || ref.meta || {};

                const [thumbnail, beforeUrl, afterUrl, resolvedGallery] = await Promise.all([
                    resolveMedia(ref.featured_image || ref._embedded?.['wp:featuredmedia']?.[0]?.source_url || null),
                    resolveMedia(cf.bild_vorher || ref.acf?.before_image),
                    resolveMedia(cf.bild_nachher || ref.acf?.after_image),
                    Promise.all((cf.galerie || ref.acf?.gallery || []).map(img => resolveMedia(img)))
                ]);

                if (controller.signal.aborted) return;

                // ─── Extract Robust Category Names ──────────────────────────────────
                // Search across embedded terms, taxonomies, and custom fields
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

                // ─── Format Localized Date ───────────────────────────────────────────
                let formattedDate = '';
                const rawDateStr = cf.referenz_datum || ref.acf?.referenz_datum || ref.date || ref.post_date || '';
                if (rawDateStr) {
                    const dateObj = new Date(rawDateStr);
                    if (!isNaN(dateObj.getTime())) {
                        formattedDate = dateObj.toLocaleDateString(
                            language === 'DE' ? 'de-DE' : 'fr-FR',
                            { year: 'numeric', month: 'long' }
                        );
                    }
                }


                setRawProject(ref);
                
                const local = getLocalContent();
                setProject({
                    hero: {
                        ...local.hero,
                        title: decodeHtmlEntities(
                            ref.title?.rendered ||
                            (typeof ref.title === 'string' ? ref.title : '') ||
                            ref.post_title ||
                            ref.name ||
                            ''
                        ),
                        image: thumbnail,
                        categoryLabel: catNames[0] || ''
                    },

                    sidebar: { 
                        ...local.sidebar, 
                        dateValue: formattedDate, 
                        categories: catNames, 
                        locationValue: cf.referenz_ort || ref.acf?.location || '' 
                    },
                    content: { 
                        ...local.content, 
                        description: decodeHtmlEntities(cf.beschreibung || ref.acf?.short_description || ''), 
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

    if (status === 'loading' || !project) {
        return <ReferenceDetailSkeleton />;
    }

    // ─── Success Layout ───────────────────────────────────────────────────────
    return (
        <div className="animate-in fade-in duration-500">
            <section className="max-w-7xl mx-auto px-6 pt-12 pb-8 mt-20">
                <Link
                    to={ROUTES[language].references}
                    className="inline-flex items-center gap-2 text-sm font-medium uppercase tracking-widest text-slate-400 hover:text-primary transition-colors"
                >
                    <Icon name="arrow_back" className="text-sm" />
                    {t('refs.back_to_overview')}
                </Link>
            </section>

            {/* Page: ReferenceDetail → Section: ReferenceHeroSection */}
            <ReferenceHeroSection {...getSectionProps('ReferenceHeroSection', project.hero)} />

            <section className="max-w-7xl mx-auto px-6 mb-24 md:mb-32">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
                    <div className="hidden lg:block lg:col-span-4 lg:sticky lg:top-32 h-fit reveal">
                        <ReferenceSidebarSection 
                            {...sidebarProps} 
                            ctaLink={ctaLink}
                            ctaState={ctaState}
                        />
                    </div>

                    <ReferenceContentSection 
                        {...getSectionProps('ReferenceContentSection', project.content)} 
                        sidebar={
                            <ReferenceSidebarSection 
                                {...sidebarProps} 
                                ctaLink={ctaLink}
                                ctaState={ctaState}
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
                        className="absolute top-8 right-8 text-white/50 hover:text-white transition-colors z-50"
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
                        <CmsImage
                            image={projectGallery[activeImageIndex]}
                            alt="Project Gallery"
                            className="max-w-full max-h-full object-contain shadow-2xl animate-in zoom-in-95 duration-500"
                            sizes="100vw"
                            onClick={(e) => e.stopPropagation()}
                        />
                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/50 text-xs tracking-widest uppercase font-medium">
                            {activeImageIndex + 1} / {projectGallery.length}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ReferenceDetail;
