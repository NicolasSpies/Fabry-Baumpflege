import React, { startTransition, useState, useEffect } from 'react';
import { useLanguage } from '@/cms/i18n/useLanguage';
import { getLocalizedPath } from '@/cms/i18n/routes';
import { useScrollReveal } from '@/cms/hooks/useScrollReveal';
import { getPage, getLatestReferences, getTestimonials, mapReferenceCard, mapPageContent, PAGE_IDS, decodeHtmlEntities } from '@/cms/lib/cms';
import { definePreview } from '@/cms/lib/preview';

// ── Sections ────────────────────────────────────────────────────────────────
import HeroSection from '@/cms/sections/HeroSection';
import StatsSection from '@/cms/sections/StatsSection';
import HomeIntroSection from '@/cms/sections/HomeIntroSection';
import ServicesSection from '@/cms/sections/ServicesSection';
import ReferencesSection from '@/cms/sections/ReferencesSection';
import TestimonialsSection from '@/cms/sections/TestimonialsSection';
import AboutSection from '@/cms/sections/AboutSection';
import { resolveInstanceProps, awaitMappings } from '@/cms/bridge-resolver';
import useCmsSeo from '@/cms/hooks/useCmsSeo';



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
    const { language, t, globalCmsData, globalSeo, setAlternates } = useLanguage();

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
            title_top: t('hero.precision'),
            title_main: t('hero.meets'),
            description: t('hero.description'),
            cta: t('hero.cta'),
            ctaHref: getLocalizedPath('contact', language),
            image: '',
        },
        stats: {
            stat1_value: '250', stat1_label: t('stats.projects') || 'Projekte',
            stat2_value: '1200', stat2_label: t('stats.trees'),
            stat3_value: '8', stat3_label: t('stats.experience'),
            stat4_value: '0', stat4_label: t('stats.accidents'),
        },
        intro: {
            title: '',
            description: '',
        },
        services: {
            label: t('expertise.title'),
            title: t('expertise.subtitle'),
            s1_title: t('services.baumpflege.title'), s1_description: t('services.baumpflege.desc'), s1_icon: 'BaumpflegeIcon', s1_id: 'baumpflege',
            s2_title: t('services.baumfaellung.title'), s2_description: t('services.baumfaellung.desc'), s2_icon: 'BaumfaellungIcon', s2_id: 'baumfaellung',
            s3_title: t('services.gartenpflege.title'), s3_description: t('services.gartenpflege.desc'), s3_icon: 'GartenpflegeIcon', s3_id: 'gartenpflege',
            s4_title: t('services.bepflanzung.title'), s4_description: t('services.bepflanzung.desc'), s4_icon: 'BepflanzungIcon', s4_id: 'bepflanzung',
        },
        references: {
            label: t('refs.preview_label') || 'REFERENZEN',
            title: t('refs.preview_title'),
            view_all: t('nav.references'),
            items: [],
        },
        testimonials: {
            label: t('testimonials.title'),
            title: t('testimonials.subtitle'),
            items: [],
        },
        about: {
            label: t('about.teaser_label'),
            title: t('about.teaser_title'),
            description: t('about.teaser_text'),
            quote: t('about.quote'),
            cta: t('about.teaser_cta'),
            ctaHref: getLocalizedPath('contact', language),
            image: '',
        },
    });

    const getFallbackContent = () => getInitialContent();

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

                const page = await getPage(PAGE_IDS.home, language);
                if (cancelled) return;
                if (page) {
                    setRawPage(page);
                    const mappedHome = mapPageContent(page, getFallbackContent(), 'Home');
                    setPageData(prev => ({ ...prev, ...mappedHome }));

                    // Register alternates for API-driven routing
                    if (page.cc_alternates || page.pll_translations) {
                        setAlternates(page.cc_alternates || page.pll_translations);
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
        let idleId = null;

        async function loadDeferredContent() {
            try {
                setRefsLoading(true);
                const [rawRefs, rawTestimonials, servicesPage] = await Promise.all([
                    getLatestReferences(3, language),
                    getTestimonials(language),
                    getPage(PAGE_IDS.services, language)
                ]);
                if (cancelled) return;

                const mappedRefs = rawRefs.map(item => ({
                    ...mapReferenceCard(item),
                    data: item
                }));

                const mappedTestimonials = (rawTestimonials || []).slice(0, 3).map(item => {
                    const cf = item.customFields || item.acf || item.meta || {};
                    const name = decodeHtmlEntities(
                        item.title?.rendered || 
                        (typeof item.title === 'string' ? item.title : '') ||
                        cf.kundenname || 
                        cf.name ||
                        item.post_title || 
                        ''
                    );
                    return {
                        author: name || 'Kunde',
                        text: decodeHtmlEntities(cf.kundenstimme_text || ''),
                        rating_raw: String(cf.sterne || '5'),
                        data: item
                    };
                });

                startTransition(() => {
                    setPageData(prev => {
                        let next = {
                            ...prev,
                            references: { ...prev.references, items: mappedRefs },
                            testimonials: { ...prev.testimonials, items: mappedTestimonials }
                        };
                        if (servicesPage) {
                            next = mergeServicePreviewContent(next, servicesPage);
                        }
                        return next;
                    });
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
