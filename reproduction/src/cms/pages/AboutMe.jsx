import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/cms/i18n/useLanguage';
import { useScrollReveal } from '@/cms/hooks/useScrollReveal';
import { ROUTES } from '@/cms/i18n/routes';
import { getPage, mapPageContent, PAGE_IDS } from '@/cms/lib/cms';
import { definePreview } from '@/cms/lib/preview';

// ── Sections ────────────────────────────────────────────────────────────────
import PhilosophySection from '@/cms/sections/PhilosophySection';
import ValuesSection from '@/cms/sections/ValuesSection';
import SignatureSection from '@/cms/sections/SignatureSection';
import { resolveInstanceProps, awaitMappings } from '@/cms/bridge-resolver';


/**
 * Preview Metadata for ContentBridge scanning.
 */
export const previewData = definePreview({
    page: 'AboutMe',
    source: '/content-core/v1/post/page/18',
    sections: [
        {
            section: 'PhilosophySection',
            fields: ['label', 'quote', 'text', 'image']
        },
        {
            section: 'ValuesSection',
            fields: ['val1_title', 'val1_text', 'val1_image', 'val2_title', 'val2_text', 'val2_image', 'val3_title', 'val3_text', 'val3_image']
        },
        {
            section: 'SignatureSection',
            fields: ['title', 'name']
        }
    ],
});

const AboutMe = () => {
    const { language, t, globalCmsData } = useLanguage();
    useScrollReveal();

    const getInitialContent = () => ({
        philosophy: {
            label: '',
            quote: '',
            text: '',
            image: '',
        },
        values: {
            val1_title: '', val1_text: '', val1_image: '',
            val2_title: '', val2_text: '', val2_image: '',
            val3_title: '', val3_text: '', val3_image: '',
        },
        signature: {
            title: '',
            name: '',
            label: '',
            cta: '',
            ctaHref: ROUTES[language].contact,
        },
    });

    const getFallbackContent = () => ({
        ...getInitialContent(),
        signature: {
            ...getInitialContent().signature,
            label: t('aboutme.signature.label'),
            cta: t('aboutme.signature.cta'),
        },
    });

    const [pageData, setPageData] = useState(getInitialContent());
    const [rawPage, setRawPage] = useState(null);

    useEffect(() => {
        setPageData(getInitialContent());
    }, [language, t]);

    useEffect(() => {
        let cancelled = false;
        async function loadContent() {
            try {
                await awaitMappings();
                if (cancelled) return;
                const page = await getPage(PAGE_IDS.about, language);
                if (cancelled) return;
                if (page) {
                    setRawPage(page);
                    setPageData(mapPageContent(page, getFallbackContent(), 'AboutMe'));
                }
            } catch (err) {
                console.error('[AboutMe] CMS load failed:', err);
            }
        }
        loadContent();
        return () => { cancelled = true; };
    }, [language, t]);

    const getProps = (instanceName, localProps) => {
        return resolveInstanceProps('AboutMe', instanceName, localProps, rawPage);
    };

    return (
        <main className="pt-20">
            {/* Page: AboutMe → Section: PhilosophySection */}
            <PhilosophySection 
                {...getProps('PhilosophySection', pageData.philosophy)} 
                page="AboutMe"
                section="PhilosophySection"
            />

            {/* Page: AboutMe → Section: ValuesSection */}
            <ValuesSection 
                {...getProps('ValuesSection', pageData.values)} 
                page="AboutMe"
                section="ValuesSection"
            />

            {/* Page: AboutMe → Section: SignatureSection */}
            <SignatureSection
                {...getProps('SignatureSection', pageData.signature)}
                page="AboutMe"
                section="SignatureSection"
            />
        </main>
    );
};

export default AboutMe;
