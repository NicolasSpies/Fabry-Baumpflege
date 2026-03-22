import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/cms/i18n/useLanguage';
import { useScrollReveal } from '@/cms/hooks/useScrollReveal';
import { getPage, getHomeStats, mapPageContent, PAGE_IDS } from '@/cms/lib/cms';
import { definePreview } from '@/cms/lib/preview';

// ── Sections ────────────────────────────────────────────────────────────────
import ServicesIntroSection from '@/cms/sections/ServicesIntroSection';
import ServicesBlocksSection from '@/cms/sections/ServicesBlocksSection';
import StatsSection from '@/cms/sections/StatsSection';
import { resolveInstanceProps, awaitMappings } from '@/cms/bridge-resolver';
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

    const [pageData, setPageData] = useState(getInitialContent());
    const [rawPage, setRawPage] = useState(null);
    useScrollReveal([rawPage, statsCmsData]);

    useEffect(() => {
        setPageData(getInitialContent());
        setStatsCmsData(null);
    }, [language, t]);

    useEffect(() => {
        let cancelled = false;
        async function loadAllContent() {
            try {
                // Parallellize both critical page content and secondary stats
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
    }, [language, t]);

    useCmsSeo(rawPage?.seo || globalSeo);



    const getProps = (instanceName, localProps) => 
        resolveInstanceProps('Services', instanceName, localProps, rawPage || globalCmsData);

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
