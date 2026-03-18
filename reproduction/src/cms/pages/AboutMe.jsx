import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/cms/i18n/useLanguage';
import { useScrollReveal } from '@/cms/hooks/useScrollReveal';
import { ROUTES } from '@/cms/i18n/routes';
import { getPage, mapPageContent } from '@/cms/lib/cms';
import { definePreview } from '@/cms/lib/preview';

// ── Sections ────────────────────────────────────────────────────────────────
import PhilosophySection from '@/cms/sections/PhilosophySection';
import ValuesSection from '@/cms/sections/ValuesSection';
import SignatureSection from '@/cms/sections/SignatureSection';
import { resolveInstanceProps, awaitMappings } from '@/cms/bridge-resolver';


// ── Assets ──────────────────────────────────────────────────────────────────
import portrait from '@/assets/images/vincent_portrait.png';
import baumpflegeImg from '@/assets/images/services/baumpflege.png';
import baumfaellungImg from '@/assets/images/services/baumfaellung.png';
import gartenpflegeImg from '@/assets/images/services/gartenpflege.png';

/**
 * Preview Metadata for ContentBridge scanning.
 */
export const previewData = definePreview({
    page: 'AboutMe',
    source: '/cms/wp/v2/pages?slug=ueber-mich',
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

    const getLocalContent = () => ({
        philosophy: {
            label: t('aboutme.philosophy.label'),
            quote: t('aboutme.philosophy.quote'),
            text: t('aboutme.philosophy.text'),
            image: portrait,
        },
        values: {
            val1_title: t('aboutme.values.precision.title'), val1_text: t('aboutme.values.precision.text'), val1_image: baumpflegeImg,
            val2_title: t('aboutme.values.sustainability.title'), val2_text: t('aboutme.values.sustainability.text'), val2_image: baumfaellungImg,
            val3_title: t('aboutme.values.expertise.title'), val3_text: t('aboutme.values.expertise.text'), val3_image: gartenpflegeImg,
        },
        signature: {
            title: t('aboutme.signature.title'),
            name: "Vincent Fabry",
            label: t('aboutme.signature.label'),
            cta: t('aboutme.signature.cta'),
            ctaHref: ROUTES[language].contact,
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
                const page = await getPage('ueber-mich', language);
                if (cancelled) return;
                if (page) {
                    setRawPage(page);
                    setPageData(prev => mapPageContent(page, prev, 'AboutMe'));
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
