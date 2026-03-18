import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/cms/i18n/useLanguage';
import { useScrollReveal } from '@/cms/hooks/useScrollReveal';
import { getPage, mapPageContent } from '@/cms/lib/cms';
import { definePreview } from '@/cms/lib/preview';

// ── Sections ────────────────────────────────────────────────────────────────
import PageHeroSection from '@/cms/sections/PageHeroSection';
import ServicesBlocksSection from '@/cms/sections/ServicesBlocksSection';
import StatsSection from '@/cms/sections/StatsSection';
import { resolveInstanceProps, awaitMappings } from '@/cms/bridge-resolver';


// ── Assets ──────────────────────────────────────────────────────────────────
import baumpflegeImg from '@/assets/images/services/baumpflege.png';
import baumfaellungImg from '@/assets/images/services/baumfaellung.png';
import gartenpflegeImg from '@/assets/images/services/gartenpflege.png';
import wurzelnImg from '@/assets/images/services/wurzeln.png';
import servicesHeroImg from '@/assets/images/hero/services_hero.png';

/**
 * Preview Metadata for ContentBridge scanning.
 */
export const previewData = definePreview({
    page: 'Services',
    source: '/cms/wp/v2/pages?slug=leistungen',
    sections: [
        {
            section: 'PageHeroSection',
            fields: ['title', 'image']
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
    useScrollReveal();

    const getLocalContent = () => ({
        hero: {
            title: t('nav.services'),
            image: servicesHeroImg,
        },
        blocks: {
            s1_title: t('services.baumpflege.title'), s1_description: t('services.baumpflege.desc'), s1_list: t('services.baumpflege.features') || [], s1_image: baumpflegeImg,
            s2_title: t('services.baumfaellung.title'), s2_description: t('services.baumfaellung.desc'), s2_list: t('services.baumfaellung.features') || [], s2_image: baumfaellungImg,
            s3_title: t('services.gartenpflege.title'), s3_description: t('services.gartenpflege.desc'), s3_list: t('services.gartenpflege.features') || [], s3_image: gartenpflegeImg,
            s4_title: t('services.bepflanzung.title'), s4_description: t('services.bepflanzung.desc'), s4_list: t('services.bepflanzung.features') || [], s4_image: wurzelnImg,
        },
        stats: {
            stat1_value: '500+', stat1_label: t('stats.clients'),
            stat2_value: '2500+', stat2_label: t('stats.trees'),
            stat3_value: '100+', stat3_label: t('stats.experience'),
            stat4_value: '100%', stat4_label: t('stats.safety'),
        },
    });

    const [pageData, setPageData] = useState(getLocalContent());
    const [rawPage, setRawPage] = useState(null);

    useEffect(() => {
        setPageData(getLocalContent());
    }, [language, t]);

    useEffect(() => {
        let cancelled = false;
        async function loadContent() {
            try {
                await awaitMappings();
                if (cancelled) return;
                const page = await getPage('leistungen', language);
                if (cancelled) return;
                if (page) {
                    setRawPage(page);
                    setPageData(prev => mapPageContent(page, prev, 'Services'));
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

    return (
        <main>
            {/* Page: Services → Section: PageHeroSection */}
            <PageHeroSection 
                {...getProps('PageHeroSection', pageData.hero)}
            />

            {/* Combined Static Service Blocks */}
            <ServicesBlocksSection {...getProps('ServicesBlocksSection', pageData.blocks)} />

            {/* Page: Services → Section: StatsSection */}
            <StatsSection {...getProps('StatsSection', pageData.stats)} page="Services" section="StatsSection" />
        </main>
    );
};

export default Services;
