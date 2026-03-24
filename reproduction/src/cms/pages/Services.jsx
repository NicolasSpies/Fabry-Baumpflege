import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '@/cms/i18n/useLanguage';
import { useScrollReveal } from '@/cms/hooks/useScrollReveal';
import { getPage, getHomeStats, mapPageContent, resolveMedia, PAGE_IDS, getSSRData } from '@/cms/lib/cms';
import { definePreview } from '@/cms/lib/preview';

// ── Sections ────────────────────────────────────────────────────────────────
import ServicesIntroSection from '@/cms/sections/ServicesIntroSection';
import ServicesBlocksSection from '@/cms/sections/ServicesBlocksSection';
import StatsSection from '@/cms/sections/StatsSection';
import { resolveInstanceProps, resolveInstancePropsAsync, awaitMappings } from '@/cms/bridge-resolver';
import useCmsSeo from '@/cms/hooks/useCmsSeo';



/**
 * Preview Metadata for ContentBridge scanning.
 */
export const previewData = definePreview({
    page: 'Services',
    source: '/content-core/v1/post/page/16',
    sections: [
        {
            section: 'ServicesIntroSection',
            fields: ['title', 'description']
        },
        {
            section: 'ServicesBlocksSection',
            fields: [
                's1_title', 's1_description', 's1_list', 's1_image',
                's2_title', 's2_description', 's2_list', 's2_image',
                's3_title', 's3_description', 's3_list', 's3_image',
                's4_title', 's4_description', 's4_list', 's4_image'
            ]
        },
        {
            section: 'StatsSection',
            fields: [
                'stat1_value', 'stat1_label', 
                'stat2_value', 'stat2_label', 
                'stat3_value', 'stat3_label', 
                'stat4_value', 'stat4_label'
            ]
        },
    ],
});

const Services = () => {
    const { language, t, globalCmsData, globalSeo, setAlternates } = useLanguage();

    const [statsCmsData, setStatsCmsData] = useState(null);

    const mergeHomeStats = (servicesContent, homePage) => {
        if (!homePage) return servicesContent;

        const homeMapped = mapPageContent(homePage, getInitialContent(), 'Home');

        return {
            ...servicesContent,
            stats: {
                stat1_value: servicesContent.stats.stat1_value || homeMapped.stats.stat1_value || '',
                stat1_label: servicesContent.stats.stat1_label || homeMapped.stats.stat1_label || '',
                stat2_value: servicesContent.stats.stat2_value || homeMapped.stats.stat2_value || '',
                stat2_label: servicesContent.stats.stat2_label || homeMapped.stats.stat2_label || '',
                stat3_value: servicesContent.stats.stat3_value || homeMapped.stats.stat3_value || '',
                stat3_label: servicesContent.stats.stat3_label || homeMapped.stats.stat3_label || '',
                stat4_value: servicesContent.stats.stat4_value || homeMapped.stats.stat4_value || '',
                stat4_label: servicesContent.stats.stat4_label || homeMapped.stats.stat4_label || '',
            },
        };
    };

    const getInitialContent = () => ({
        intro: {
            title: '',
            description: '',
        },
        blocks: {
            s1_title: '', s1_description: '', s1_list: [], s1_image: '',
            s2_title: '', s2_description: '', s2_list: [], s2_image: '',
            s3_title: '', s3_description: '', s3_list: [], s3_image: '',
            s4_title: '', s4_description: '', s4_list: [], s4_image: '',
        },
        stats: {
            stat1_value: '', stat1_label: '',
            stat2_value: '', stat2_label: '',
            stat3_value: '', stat3_label: '',
            stat4_value: '', stat4_label: '',
        },
    });

    const [pageData, setPageData] = useState(() => {
        const base = getInitialContent();
        const ssr = getSSRData();
        return ssr?.page ? mapPageContent(ssr.page, base, 'Services') : base;
    });
    const [rawPage, setRawPage] = useState(() => getSSRData()?.page || null);
    const [hydratedProps, setHydratedProps] = useState({});
    useScrollReveal([rawPage, statsCmsData]);

    // Guard to prevent initial state Wipeout during hydration
    const isFirstMount = useRef(true);
    useEffect(() => {
        if (isFirstMount.current) {
            isFirstMount.current = false;
            return;
        }
        setPageData(getInitialContent());
        setStatsCmsData(null);
    }, [language, t]);

    // ─── 1. Content Fetching ───
    useEffect(() => {
        let cancelled = false;
        async function loadAllContent() {
            try {
                // Parallelize critical page content and secondary stats
                const [page, statsData] = await Promise.all([
                    getPage(PAGE_IDS.services, language),
                    getHomeStats(language)
                ]);

                if (cancelled) return;

                if (page) {
                    setRawPage(page);
                    const mappedServices = mapPageContent(page, getInitialContent(), 'Services');
                    
                    // If we have stats from the home fetch, merge them in
                    const finalData = statsData 
                        ? mergeHomeStats(mappedServices, statsData)
                        : mappedServices;
                        
                    setPageData(finalData);

                    if (page.cc_alternates || page.pll_translations) {
                        setAlternates(page.cc_alternates || page.pll_translations);
                    }
                }

                if (statsData) {
                    setStatsCmsData(statsData);
                }
            } catch (err) {
                console.error('[Services] CMS consolidation failed:', err);
            }
        }

        loadAllContent();
        return () => { cancelled = true; };
    }, [language, t, setAlternates]);

    // ─── 2. Data Hydration ───
    useEffect(() => {
        let cancelled = false;
        async function hydrate() {
            if (!rawPage) return;
            try {
                const [intro, blocks, stats] = await Promise.all([
                    resolveInstancePropsAsync('Services', 'ServicesIntroSection', pageData.intro, rawPage),
                    resolveInstancePropsAsync('Services', 'ServicesBlocksSection', pageData.blocks, rawPage),
                    resolveInstancePropsAsync('Services', 'StatsSection', pageData.stats, statsCmsData || rawPage || globalCmsData)
                ]);

                if (!cancelled) {
                    setHydratedProps({
                        ServicesIntroSection: intro,
                        ServicesBlocksSection: blocks,
                        StatsSection: stats
                    });
                }
            } catch (err) {
                console.error('[Services] Hydration failed:', err);
            }
        }
        
        hydrate();
        return () => { cancelled = true; };
    }, [rawPage, statsCmsData, globalCmsData]);

    useCmsSeo(rawPage?.seo || globalSeo);



    const getProps = (instanceName, localProps) => {
        if (hydratedProps[instanceName]) return hydratedProps[instanceName];
        return resolveInstanceProps('Services', instanceName, localProps, rawPage || globalCmsData);
    };

    // No longer blocking on full rawPage or statsCmsData
    // We render immediately with localized fallbacks.

    return (
        <main className="pt-28">
            <ServicesIntroSection {...getProps('ServicesIntroSection', pageData.intro)} />

            {/* Combined Static Service Blocks */}
            <ServicesBlocksSection {...getProps('ServicesBlocksSection', pageData.blocks)} />

            {/* Page: Services → Section: StatsSection */}
            <StatsSection
                {...resolveInstanceProps('Services', 'StatsSection', pageData.stats, statsCmsData || rawPage || globalCmsData)}
                page="Services"
                section="StatsSection"
            />
        </main>
    );
};

export default Services;
