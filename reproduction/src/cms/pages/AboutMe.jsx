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
import { resolveInstanceProps, resolveInstancePropsAsync, awaitMappings } from '@/cms/bridge-resolver';
import useCmsSeo from '@/cms/hooks/useCmsSeo';



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
    const { language, t, globalCmsData, globalSeo, setAlternates, setPageReady } = useLanguage();

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
            name: globalCmsData?.options?.contact_person || '',
            label: '',
            cta: '',
            ctaHref: ROUTES[language].contact,
        },
    });

    const [pageData, setPageData] = useState(() => {
        // Restore cached text content on second visits to prevent CLS.
        // Text fields (quote, text, labels) go from empty to loaded, causing height growth
        // and layout shift in PhilosophySection + ValuesSection. Cache key is language-scoped.
        try {
            const cached = sessionStorage.getItem(`cms_about_${language}`);
            if (cached) return { ...getInitialContent(), ...JSON.parse(cached) };
        } catch {}
        return getInitialContent();
    });
    const [rawPage, setRawPage] = useState(null);
    const [hydratedProps, setHydratedProps] = useState({});
    useScrollReveal([rawPage]);

    // Effect 1: Fetch — signals PageLoader as soon as text data arrives.
    // Image hydration happens in a separate effect so it never blocks the loader.
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
                    const mappedAbout = mapPageContent(page, getInitialContent(), 'AboutMe');
                    setPageData(prev => ({ ...prev, ...mappedAbout }));
                    try { sessionStorage.setItem(`cms_about_${language}`, JSON.stringify(mappedAbout)); } catch {}

                    if (page.cc_alternates || page.pll_translations) {
                        setAlternates(page.cc_alternates || page.pll_translations);
                    }
                }
            } catch (err) {
                console.error('[AboutMe] CMS load failed:', err);
            } finally {
                if (!cancelled) setPageReady(true);
            }
        }
        loadContent();
        return () => { cancelled = true; };
    }, [language, t, setAlternates]);

    // Effect 2: Hydrate — resolves image URLs after rawPage is available.
    // Runs after the PageLoader is already dismissed, so never delays page reveal.
    useEffect(() => {
        if (!rawPage) return;
        let cancelled = false;
        async function hydrate() {
            try {
                const mappedAbout = mapPageContent(rawPage, getInitialContent(), 'AboutMe');
                const [philosophy, values, signature] = await Promise.all([
                    resolveInstancePropsAsync('AboutMe', 'PhilosophySection', mappedAbout.philosophy, rawPage),
                    resolveInstancePropsAsync('AboutMe', 'ValuesSection', mappedAbout.values, rawPage),
                    resolveInstancePropsAsync('AboutMe', 'SignatureSection', mappedAbout.signature, rawPage)
                ]);
                if (!cancelled) {
                    setHydratedProps({
                        PhilosophySection: philosophy,
                        ValuesSection: values,
                        SignatureSection: signature
                    });
                }
            } catch (err) {
                console.error('[AboutMe] Hydration failed:', err);
            }
        }
        hydrate();
        return () => { cancelled = true; };
    }, [rawPage]);

    useCmsSeo(rawPage?.seo || globalSeo);



    const getProps = (instanceName, localProps) => {
        if (hydratedProps[instanceName]) return hydratedProps[instanceName];
        return resolveInstanceProps('AboutMe', instanceName, localProps, rawPage);
    };

    return (
        <main className="pt-24 md:pt-28 lg:pt-0">
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
