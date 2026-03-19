import React, { startTransition, useState, useEffect } from 'react';
import { useLanguage } from '@/cms/i18n/useLanguage';
import { getLocalizedPath } from '@/cms/i18n/routes';
import { useScrollReveal } from '@/cms/hooks/useScrollReveal';
import { getPage, getLatestReferences, getTestimonials, mapReferenceCard, mapPageContent, PAGE_IDS } from '@/cms/lib/cms';
import { definePreview } from '@/cms/lib/preview';

// ── Sections ────────────────────────────────────────────────────────────────
import HeroSection from '@/cms/sections/HeroSection';
import StatsSection from '@/cms/sections/StatsSection';
import ServicesSection from '@/cms/sections/ServicesSection';
import ReferencesSection from '@/cms/sections/ReferencesSection';
import TestimonialsSection from '@/cms/sections/TestimonialsSection';
import AboutSection from '@/cms/sections/AboutSection';
import { resolveInstanceProps, awaitMappings } from '@/cms/bridge-resolver';


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
    const { language, t, globalCmsData } = useLanguage();
    const mergeServicePreviewContent = (content, servicesPage) => {
        if (!servicesPage) return content;

        const cf = servicesPage.customFields || servicesPage.acf || servicesPage.meta || {};

        return {
            ...content,
            services: {
                ...content.services,
                s1_title: content.services.s1_title || cf.titel_leistung_1 || '',
                s1_description: content.services.s1_description || cf.beschreibung_leistung_1 || '',
                s2_title: content.services.s2_title || cf.titel_leistung_2 || '',
                s2_description: content.services.s2_description || cf.beschreibung_leistung_2 || '',
                s3_title: content.services.s3_title || cf.titel_leistung_3 || '',
                s3_description: content.services.s3_description || cf.beschreibung_leistung_3 || '',
                s4_title: content.services.s4_title || cf.titel_leistung_4 || '',
                s4_description: content.services.s4_description || cf.beschreibung_leistung_4 || '',
            },
        };
    };

    const getInitialContent = () => ({
        hero: {
            title_top: '',
            title_main: '',
            description: '',
            cta: '',
            ctaHref: getLocalizedPath('contact', language),
            image: '',
        },
        stats: {
            stat1_value: '', stat1_label: '',
            stat2_value: '', stat2_label: '',
            stat3_value: '', stat3_label: '',
            stat4_value: '', stat4_label: '',
        },
        services: {
            label: '',
            title: '',
            s1_title: '', s1_description: '', s1_icon: 'BaumpflegeIcon', s1_id: 'baumpflege',
            s2_title: '', s2_description: '', s2_icon: 'BaumfaellungIcon', s2_id: 'baumfaellung',
            s3_title: '', s3_description: '', s3_icon: 'GartenpflegeIcon', s3_id: 'gartenpflege',
            s4_title: '', s4_description: '', s4_icon: 'BepflanzungIcon', s4_id: 'bepflanzung',
        },
        references: {
            label: '',
            title: '',
            view_all: '',
            items: [],
        },
        testimonials: {
            label: '',
            title: '',
            items: [],
        },
        about: {
            label: '',
            title: '',
            description: '',
            quote: '',
            cta: '',
            ctaHref: getLocalizedPath('contact', language),
            image: '',
        },
    });

    const getFallbackContent = () => ({
        ...getInitialContent(),
        references: {
            ...getInitialContent().references,
            view_all: t('nav.references'),
        },
        testimonials: {
            ...getInitialContent().testimonials,
            label: t('testimonials.title'),
            title: t('testimonials.subtitle'),
        },
    });

    const [pageData, setPageData] = useState(getInitialContent());
    const [rawPage, setRawPage] = useState(null);
    const [refsLoading, setRefsLoading] = useState(true);
    // Tracks whether runtime mappings have been fetched; triggers a re-render
    // so resolveInstanceProps uses the latest manifest, not the bundled fallback.
    const [mappingsReady, setMappingsReady] = useState(false);
    useScrollReveal([rawPage, pageData.references.items.length, pageData.testimonials.items.length]);

    // Re-apply local content on language change
    useEffect(() => {
        setPageData(getInitialContent());
    }, [language, t]);

    // Fetch CMS content and latest references
    useEffect(() => {
        let cancelled = false;
        async function loadPageContent() {
            try {
                // Ensure runtime mappings are loaded before applying them
                await awaitMappings();
                if (cancelled) return;
                setMappingsReady(true);

                const [page, servicesPage] = await Promise.all([
                    getPage(PAGE_IDS.home, language),
                    getPage(PAGE_IDS.services, language),
                ]);
                if (cancelled) return;
                if (page) {
                    setRawPage(page);
                    const mappedHome = mapPageContent(page, getFallbackContent(), 'Home');
                    setPageData(mergeServicePreviewContent(mappedHome, servicesPage));
                }
            } catch (err) {
                console.error('[Home] CMS load failed:', err);
            }
        }

        loadPageContent();
        return () => { cancelled = true; };
    }, [language, t]);

    useEffect(() => {
        let cancelled = false;
        let timeoutId = null;
        let idleId = null;

        async function loadDeferredContent() {
            try {
                setRefsLoading(true);
                const [rawRefs, rawTestimonials] = await Promise.all([
                    getLatestReferences(3, language),
                    getTestimonials(language)
                ]);
                if (cancelled) return;

                const mappedRefs = rawRefs.map(item => ({
                    ...mapReferenceCard(item),
                    data: item
                }));

                const mappedTestimonials = (rawTestimonials || []).slice(0, 3).map(item => ({
                    author: item.title?.rendered || '',
                    text: item.customFields?.kundenstimme_text || '',
                    rating_raw: String(item.customFields?.sterne || '5'),
                    data: item
                }));

                startTransition(() => {
                    setPageData(prev => ({
                        ...prev,
                        references: {
                            ...prev.references,
                            items: mappedRefs
                        },
                        testimonials: {
                            ...prev.testimonials,
                            items: mappedTestimonials
                        }
                    }));
                });
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

        const scheduleDeferredLoad = () => {
            if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
                idleId = window.requestIdleCallback(() => {
                    loadDeferredContent();
                }, { timeout: 800 });
                return;
            }

            timeoutId = window.setTimeout(() => {
                loadDeferredContent();
            }, 150);
        };

        scheduleDeferredLoad();

        return () => {
            cancelled = true;
            if (timeoutId !== null) {
                window.clearTimeout(timeoutId);
            }
            if (idleId !== null && typeof window !== 'undefined' && 'cancelIdleCallback' in window) {
                window.cancelIdleCallback(idleId);
            }
        };
    }, [language]);

    const getProps = (instanceName, localProps) => 
        resolveInstanceProps('Home', instanceName, localProps, rawPage || globalCmsData);

    if (!rawPage) {
        return <main className="min-h-screen" />;
    }

    return (
        <main>
            {/* Page: Home → Section: HeroSection */}
            <HeroSection
                {...getProps('HeroSection', pageData.hero)}
            />

            {/* Page: Home → Section: StatsSection */}
            <StatsSection {...getProps('StatsSection', pageData.stats)} compact={true} />

            {/* Page: Home → Section: ServicesSection */}
            <ServicesSection
                {...getProps('ServicesSection', pageData.services)}
                getServiceHref={(id) => `${getLocalizedPath('services', language)}#${id}`}
                ctaLabel={t('expertise.learn_more')}
                iconVariant="outline"
            />

            {/* Page: Home → Section: ReferencesSection */}
            <ReferencesSection
                {...getProps('ReferencesSection', pageData.references)}
                language={language}
                allRefsHref={getLocalizedPath('references', language)}
                isLoading={refsLoading}
            />

            {/* Page: Home → Section: TestimonialsSection */}
            <TestimonialsSection
                {...getProps('TestimonialsSection', pageData.testimonials)}
                language={language}
            />

            {/* Page: Home → Section: AboutSection */}
            <AboutSection
                {...getProps('AboutSection', pageData.about)}
            />
        </main>
    );
};

export default Home;
