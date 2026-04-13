import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '@/cms/i18n/useLanguage';
import { getLocalizedPath } from '@/cms/i18n/routes';
import { useScrollReveal } from '@/cms/hooks/useScrollReveal';
import { getPage, getLatestReferences, getReferences, getTestimonials, mapReferenceCard, mapPageContent, resolveMedia, PAGE_IDS, decodeHtmlEntities, getSSRData } from '@/cms/lib/cms';
import { definePreview } from '@/cms/lib/preview';

// ── Sections ────────────────────────────────────────────────────────────────
import HeroSection from '@/cms/sections/HeroSection';
import StatsSection from '@/cms/sections/StatsSection';
import HomeIntroSection from '@/cms/sections/HomeIntroSection';
import ServicesSection from '@/cms/sections/ServicesSection';
const ReferencesSection = React.lazy(() => import('@/cms/sections/ReferencesSection'));
const TestimonialsSection = React.lazy(() => import('@/cms/sections/TestimonialsSection'));
const AboutSection = React.lazy(() => import('@/cms/sections/AboutSection'));

import { resolveInstanceProps, resolveInstancePropsAsync, awaitMappings } from '@/cms/bridge-resolver';
import useCmsSeo from '@/cms/hooks/useCmsSeo';
import { Suspense } from 'react';



/**
 * Preview Metadata for ContentBridge scanning.
 * All visible content for the Home page is declared here.
 * Defaults are extracted from the local component content.
 */
export const previewData = definePreview({
    page: 'Home',
    source: '/content-core/v1/post/page/14',
    sections: [
        {
            section: 'HeroSection',
            fields: ['title_top', 'title_main', 'description', 'cta', 'image']
        },
        {
            section: 'StatsSection',
            fields: ['stat1_value', 'stat1_label', 'stat2_value', 'stat2_label', 'stat3_value', 'stat3_label', 'stat4_value', 'stat4_label']
        },
        {
            section: 'HomeIntroSection',
            fields: ['title', 'description']
        },
        {
            section: 'ServicesSection',
            fields: [
                'label', 'title', 
                's1_title', 's1_description', 's1_icon', 
                's2_title', 's2_description', 's2_icon', 
                's3_title', 's3_description', 's3_icon', 
                's4_title', 's4_description', 's4_icon'
            ]
        },
        {
            section: 'ReferencesSection',
            fields: ['label', 'title'],
            components: [
                {
                    component: 'ReferenceCard',
                    isListItem: true,
                    fields: ['id', 'title', 'description', 'location', 'thumbnailImage']
                }
            ]
        },
        {
            section: 'TestimonialsSection',
            fields: ['label', 'title'],
            components: [
                {
                    component: 'TestimonialCard',
                    isListItem: true,
                    fields: ['author', 'rating_raw', 'text']
                }
            ]
        },
        {
            section: 'AboutSection',
            fields: ['label', 'title', 'description', 'quote', 'cta', 'image']
        }
    ],
});

// ─────────────────────────────────────────────────────────────────────────────

const Home = () => {
    const { language, t, globalCmsData, globalSeo, setAlternates, setPageReady } = useLanguage();

    const mergeServicePreviewContent = (content, servicesPage) => {
        if (!servicesPage) return content;

        const cf = servicesPage.customFields || servicesPage.acf || servicesPage.meta || {};

        return {
            ...content,
            services: {
                ...content.services,
                s1_title: content.services.s1_title || cf.titel_leistung_1 || '',
                s1_description: content.services.s1_description || cf.zusammenfassung_baumpflege || cf.beschreibung_leistung_1 || '',
                s2_title: content.services.s2_title || cf.titel_leistung_2 || '',
                s2_description: content.services.s2_description || cf.zusammenfassung_baumfllung || cf.beschreibung_leistung_2 || '',
                s3_title: content.services.s3_title || cf.titel_leistung_3 || '',
                s3_description: content.services.s3_description || cf.zusammenfassung_gartenpflege || cf.beschreibung_leistung_3 || '',
                s4_title: content.services.s4_title || cf.titel_leistung_4 || '',
                s4_description: content.services.s4_description || cf.zusammenfassung_bepflanzung || cf.beschreibung_leistung_4 || '',
            },
        };
    };

    const getInitialContent = () => ({
        hero: {
            title_top: '',
            title_main: '',
            description: '',
            cta: t('nav.contact'),
            ctaHref: getLocalizedPath('contact', language),
            image: '',
        },
        stats: {
            stat1_value: '', stat1_label: '',
            stat2_value: '', stat2_label: '',
            stat3_value: '', stat3_label: '',
            stat4_value: '', stat4_label: '',
        },
        intro: {
            title: '',
            description: '',
        },
        services: {
            label: t('nav.services'),
            title: '',
            s1_title: '', s1_description: '', s1_icon: 'BaumpflegeIcon', s1_id: 'baumpflege',
            s2_title: '', s2_description: '', s2_icon: 'BaumfaellungIcon', s2_id: 'baumfaellung',
            s3_title: '', s3_description: '', s3_icon: 'GartenpflegeIcon', s3_id: 'gartenpflege',
            s4_title: '', s4_description: '', s4_icon: 'BepflanzungIcon', s4_id: 'bepflanzung',
        },
        references: {
            label: t('nav.references'),
            title: '',
            view_all: t('refs.view_all'),
            items: [],
        },
        testimonials: {
            label: t('testimonials.title'),
            title: t('testimonials.subtitle'),
            items: [],
        },
        about: {
            label: t('nav.about'),
            title: '',
            description: '',
            quote: '',
            cta: t('nav.contact'),
            ctaHref: getLocalizedPath('contact', language),
            image: '',
        },
    });

    const getFallbackContent = () => getInitialContent();

    const [pageData, setPageData] = useState(() => {
        const base = getInitialContent();
        try {
            const ssr = getSSRData();
            if (ssr && ssr.page) {
                return mapPageContent(ssr.page, base, 'Home');
            }
        } catch (e) {
            console.warn('[Home] SSR State recovery failed:', e);
        }
        return base;
    });

    const [rawPage, setRawPage] = useState(() => {
        try {
            return getSSRData()?.page || null;
        } catch (e) {
            return null;
        }
    });

    const [refsLoading, setRefsLoading] = useState(true);
    const [hydratedProps, setHydratedProps] = useState({});
    const [mappingsReady, setMappingsReady] = useState(false);
    useScrollReveal([rawPage, pageData.references.items.length, pageData.testimonials.items.length]);

    // Guard to prevent initial state Wipeout during hydration
    const isFirstMount = useRef(true);
    useEffect(() => {
        if (isFirstMount.current) {
            isFirstMount.current = false;
            return;
        }
        setPageData(getInitialContent());
    }, [language, t]);

    // Fetch CMS content and latest references
    useEffect(() => {
        let cancelled = false;
        async function loadPageContent() {
            try {
                await awaitMappings();
                if (cancelled) return;
                setMappingsReady(true);

                const [page, servicesPage] = await Promise.all([
                    getPage(PAGE_IDS.home, language),
                    getPage(PAGE_IDS.services, language)
                ]);

                if (cancelled) return;

                if (page) {
                    setRawPage(page);
                    const mappedWithServices = mergeServicePreviewContent(
                        mapPageContent(page, getFallbackContent(), 'Home'),
                        servicesPage
                    );
                    
                    setPageData(prev => ({ ...prev, ...mappedWithServices }));

                    if (page.cc_alternates || page.pll_translations) {
                        setAlternates(page.cc_alternates || page.pll_translations);
                    }

                    // ─── Async Hydration (Primary Content) ───
                    // These sections are critical for immediate render or soon-after visibility.
                    const [hero, stats, intro, services, about] = await Promise.all([
                        resolveInstancePropsAsync('Home', 'HeroSection', mappedWithServices.hero, page),
                        resolveInstancePropsAsync('Home', 'StatsSection', mappedWithServices.stats, page),
                        resolveInstancePropsAsync('Home', 'HomeIntroSection', mappedWithServices.intro, page),
                        resolveInstancePropsAsync('Home', 'ServicesSection', mappedWithServices.services, page),
                        resolveInstancePropsAsync('Home', 'AboutSection', mappedWithServices.about, page)
                    ]);

                    if (!cancelled) {
                        setHydratedProps(prev => ({
                            ...prev,
                            HeroSection: hero,
                            StatsSection: stats,
                            HomeIntroSection: intro,
                            ServicesSection: services,
                            AboutSection: about
                        }));
                        setPageReady(true);
                    }
                }
            } catch (err) {
                console.error('[Home] CMS load failed:', err);
            }
        }

        loadPageContent();
        return () => { cancelled = true; };
    }, [language, t]);

    useCmsSeo(rawPage?.seo || globalSeo);



    useEffect(() => {
        let cancelled = false;
        let timeoutId = null;

        async function loadDeferredContent() {
            try {
                setRefsLoading(true);
                const [rawRefs, rawTestimonials] = await Promise.all([
                    getLatestReferences(3, language),
                    getTestimonials(language)
                ]);
                
                if (cancelled) return;

                // Map references and resolve their media IDs
                const mappedRefs = await Promise.all((rawRefs || []).map(async (item) => {
                    const mapped = mapReferenceCard(item);
                    if (!mapped) return null;
                    const resolvedThumbnail = await resolveMedia(mapped.thumbnailImage);
                    return { ...mapped, thumbnailImage: resolvedThumbnail || mapped.thumbnailImage, data: item };
                }));

                const filteredRefs = mappedRefs.filter(Boolean);
                
                const mappedTestimonials = await Promise.all((rawTestimonials || []).map(async (item) => {
                    if (!item) return null;
                    const cf = item.customFields || item.acf || item.meta || {};
                    const name = decodeHtmlEntities(
                        item.title?.rendered || 
                        (typeof item.title === 'string' ? item.title : '') ||
                        cf.kundenname || 
                        cf.name ||
                        item.post_title || 
                        ''
                    );
                    
                    const avatar = await resolveMedia(cf.kunden_avatar || cf.avatar || null);

                    return {
                        author: name || t('common.client'),
                        text: decodeHtmlEntities(cf.kundenstimme_text || ''),
                        rating_raw: String(cf.sterne || '5'),
                        avatar, // Add avatar support if relevant
                        data: item
                    };
                }));
                const filteredTestimonials = mappedTestimonials.filter(Boolean);

                if (!cancelled) {
                    setPageData(prev => ({
                        ...prev,
                        references: { ...prev.references, items: filteredRefs, isLoading: false },
                        testimonials: { ...prev.testimonials, items: filteredTestimonials, isLoading: false }
                    }));
                    
                    setRefsLoading(false);
                }
            } catch (err) {
                if (!cancelled) {
                    console.error('[Home] Deferred CMS load failed:', err);
                }
            } finally {
                if (!cancelled) {
                    setRefsLoading(false);
                }
            }
        }

        // Short delay so hero/stats render first, but no requestIdleCallback
        // which can be delayed indefinitely under load
        timeoutId = window.setTimeout(loadDeferredContent, 100);

        return () => {
            cancelled = true;
            if (timeoutId !== null) {
                window.clearTimeout(timeoutId);
            }
        };
    }, [language]);

    const getProps = (instanceName, localProps) => {
        if (hydratedProps[instanceName]) return hydratedProps[instanceName];
        return resolveInstanceProps('Home', instanceName, localProps, rawPage || globalCmsData);
    };

    // No longer blocking the entire page render on rawPage.
    // We render the shell and core sections immediately with localized fallbacks.

    return (
        <main>
            {/* Page: Home → Section: HeroSection */}
            <HeroSection
                {...getProps('HeroSection', pageData.hero)}
            />

            {/* Page: Home → Section: StatsSection */}
            <StatsSection {...getProps('StatsSection', pageData.stats)} compact={true} />

            {/* Page: Home → Section: HomeIntroSection */}
            <HomeIntroSection {...getProps('HomeIntroSection', pageData.intro)} />

            {/* Page: Home → Section: ServicesSection */}
            <ServicesSection
                {...getProps('ServicesSection', pageData.services)}
                getServiceHref={(id) => `${getLocalizedPath('services', language)}#${id}`}
                ctaLabel={t('expertise.learn_more')}
                viewAllLabel={t('nav.services')}
                allServicesHref={getLocalizedPath('services', language)}
                iconVariant="outline"
            />

            {/* Page: Home → Section: ReferencesSection */}
            <Suspense fallback={<div className="h-40" />}>
                <ReferencesSection
                    {...getProps('ReferencesSection', pageData.references)}
                    language={language}
                    allRefsHref={getLocalizedPath('references', language)}
                    isLoading={refsLoading}
                />
            </Suspense>

            {/* Page: Home → Section: TestimonialsSection */}
            <Suspense fallback={<div className="h-40" />}>
                <TestimonialsSection
                    {...getProps('TestimonialsSection', pageData.testimonials)}
                    language={language}
                />
            </Suspense>

            {/* Page: Home → Section: AboutSection */}
            <Suspense fallback={<div className="h-40" />}>
                <AboutSection
                    {...getProps('AboutSection', pageData.about)}
                />
            </Suspense>
        </main>
    );
};

export default Home;
