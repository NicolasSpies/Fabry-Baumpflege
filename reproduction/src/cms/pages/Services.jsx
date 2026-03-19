import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/cms/i18n/useLanguage';
import { useScrollReveal } from '@/cms/hooks/useScrollReveal';
import { getPage, mapPageContent, PAGE_IDS } from '@/cms/lib/cms';
import { definePreview } from '@/cms/lib/preview';

// ── Sections ────────────────────────────────────────────────────────────────
import ServicesIntroSection from '@/cms/sections/ServicesIntroSection';
import ServicesBlocksSection from '@/cms/sections/ServicesBlocksSection';
import StatsSection from '@/cms/sections/StatsSection';
import { resolveInstanceProps, awaitMappings } from '@/cms/bridge-resolver';


/**
 * Preview Metadata for ContentBridge scanning.
 */
export const previewData = definePreview({
    page: 'Services',
    source: '/content-core/v1/post/page/16',
    sections: [
        {
            section: 'ServicesIntroSection',
            fields: ['title']
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
    const { language, t, globalCmsData } = useLanguage();
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
        hero: {
            title: '',
            image: '',
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
        async function loadContent() {
            try {
                await awaitMappings();
                if (cancelled) return;
                const [page, homePage] = await Promise.all([
                    getPage(PAGE_IDS.services, language),
                    getPage(PAGE_IDS.home, language),
                ]);
                if (cancelled) return;
                if (page) {
                    setRawPage(page);
                    setStatsCmsData(homePage || page);
                    const mappedServices = mapPageContent(page, getInitialContent(), 'Services');
                    setPageData(mergeHomeStats(mappedServices, homePage));
                }
            } catch (err) {
                console.error('[Services] CMS load failed:', err);
            }
        }
        loadContent();
        return () => { cancelled = true; };
    }, [language, t]);

    const getProps = (instanceName, localProps) => 
        resolveInstanceProps('Services', instanceName, localProps, rawPage || globalCmsData);

    if (!rawPage || !statsCmsData) {
        return <main className="min-h-screen" />;
    }

    return (
        <main className="pt-28">
            <ServicesIntroSection
                description={t('services.page_intro')}
            />

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
