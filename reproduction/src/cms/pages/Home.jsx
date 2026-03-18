import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/cms/i18n/useLanguage';
import { getLocalizedPath } from '@/cms/i18n/routes';
import { useScrollReveal } from '@/cms/hooks/useScrollReveal';
import { getPage, getLatestReferences, getTestimonials, getCategoryMap, mapReferenceCard, mapPageContent, PLLCode, withHydration } from '@/cms/lib/cms';
import { definePreview } from '@/cms/lib/preview';

// ── Sections ────────────────────────────────────────────────────────────────
import HeroSection from '@/cms/sections/HeroSection';
import StatsSection from '@/cms/sections/StatsSection';
import ServicesSection from '@/cms/sections/ServicesSection';
import ReferencesSection from '@/cms/sections/ReferencesSection';
import TestimonialsSection from '@/cms/sections/TestimonialsSection';
import AboutSection from '@/cms/sections/AboutSection';
import { resolveInstanceProps, awaitMappings } from '@/cms/bridge-resolver';


// ── Assets ──────────────────────────────────────────────────────────────────
import baumpflegeImg from '@/assets/images/hero/expertise_new.jpg';
import homeHeroImg from '@/assets/images/hero/vincent-fabry-header3.jpg';

/**
 * Preview Metadata for ContentBridge scanning.
 * All visible content for the Home page is declared here.
 * Defaults are extracted from the local component content.
 */
export const previewData = definePreview({
    page: 'Home',
    source: '/cms/wp/v2/pages?slug=startseite',
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
    useScrollReveal();

    // ── Local fallback content ───────────────────────────────────────────────
    const getLocalContent = () => ({
        hero: {
            title_top: t('hero.precision'),
            title_main: t('hero.meets'),
            description: t('hero.description'),
            cta: t('hero.cta'),
            ctaHref: getLocalizedPath('contact', language),
            image: homeHeroImg,
        },
        stats: {
            stat1_value: '35+', stat1_label: t('stats.clients'),
            stat2_value: '125+', stat2_label: t('stats.trees'),
            stat3_value: '5+', stat3_label: t('stats.experience'),
            stat4_value: '0', stat4_label: t('stats.accidents'),
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
            label: t('refs.preview_title'),
            title: t('refs.preview_subtitle'),
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
            image: baumpflegeImg,
        },
    });

    const [pageData, setPageData] = useState(getLocalContent());
    const [rawPage, setRawPage] = useState(null);
    const [refsLoading, setRefsLoading] = useState(true);
    // Tracks whether runtime mappings have been fetched; triggers a re-render
    // so resolveInstanceProps uses the latest manifest, not the bundled fallback.
    const [mappingsReady, setMappingsReady] = useState(false);

    // Re-apply local content on language change
    useEffect(() => {
        setPageData(getLocalContent());
    }, [language, t]);

    // Fetch CMS content and latest references
    useEffect(() => {
        let cancelled = false;
        async function loadContent() {
            try {
                // Ensure runtime mappings are loaded before applying them
                await awaitMappings();
                if (cancelled) return;
                setMappingsReady(true);

                const page = await getPage('startseite', language);
                if (cancelled) return;
                if (page) {
                    setRawPage(page);
                    setPageData(prev => mapPageContent(page, prev, 'Home'));
                }

                setRefsLoading(true);
                const [rawRefs, catMap, rawTestimonials] = await Promise.all([
                    getLatestReferences(6, language),
                    getCategoryMap(language),
                    getTestimonials(language)
                ]);
                if (cancelled) return;

                const pllLang = PLLCode[language];
                const filtered = rawRefs.filter(item => {
                    if (!item.pll_lang) return true;
                    return item.pll_lang.toLowerCase() === pllLang.toLowerCase();
                });
                
                // Map references and attach raw data for hydration (dynamic list still works in parallel)
                const mappedRefs = filtered.slice(0, 3).map(item => ({
                    ...mapReferenceCard(item, catMap),
                    data: item
                }));

                // Map testimonials and attach raw data for hydration
                const mappedTestimonials = (rawTestimonials || []).slice(0, 3).map(item => ({
                    author: item.title?.rendered || '',
                    text: item.customFields?.kundenstimme_text || '',
                    rating_raw: String(item.customFields?.sterne || '5'),
                    data: item
                }));

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
            } catch (err) {
                console.error('[Home] CMS load failed:', err);
            } finally {
                if (!cancelled) setRefsLoading(false);
            }
        }
        loadContent();
        return () => { cancelled = true; };
    }, [language, t]);

    const getProps = (instanceName, localProps) => 
        resolveInstanceProps('Home', instanceName, localProps, rawPage || globalCmsData);

    return (
        <main>
            {/* Page: Home → Section: HeroSection */}
            <HeroSection
                {...getProps('HeroSection', pageData.hero)}
            />

            {/* Page: Home → Section: StatsSection */}
            <StatsSection {...getProps('StatsSection', pageData.stats)} />

            {/* Page: Home → Section: ServicesSection */}
            <ServicesSection
                {...getProps('ServicesSection', pageData.services)}
                getServiceHref={(id) => `${getLocalizedPath('services', language)}#${id}`}
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
