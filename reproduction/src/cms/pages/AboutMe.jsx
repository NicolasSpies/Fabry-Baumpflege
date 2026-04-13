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

    const [pageData, setPageData] = useState(getInitialContent());
    const [rawPage, setRawPage] = useState(null);
    const [hydratedProps, setHydratedProps] = useState({});
    useScrollReveal([rawPage]);

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

                    if (page.cc_alternates || page.pll_translations) {
                        setAlternates(page.cc_alternates || page.pll_translations);
                    }

                    // ─── Hydration ───
                    const [philosophy, values, signature] = await Promise.all([
                        resolveInstancePropsAsync('AboutMe', 'PhilosophySection', mappedAbout.philosophy, page),
                        resolveInstancePropsAsync('AboutMe', 'ValuesSection', mappedAbout.values, page),
                        resolveInstancePropsAsync('AboutMe', 'SignatureSection', mappedAbout.signature, page)
                    ]);

                    if (!cancelled) {
                        setHydratedProps({
                            PhilosophySection: philosophy,
                            ValuesSection: values,
                            SignatureSection: signature
                        });
                        setPageReady(true);
                    }
                }
            } catch (err) {
                console.error('[AboutMe] CMS load failed:', err);
            }
        }
        loadContent();
        return () => { cancelled = true; };
    }, [language, t, setAlternates]);

    useCmsSeo(rawPage?.seo || globalSeo);



    const getProps = (instanceName, localProps) => {
        if (hydratedProps[instanceName]) return hydratedProps[instanceName];
        return resolveInstanceProps('AboutMe', instanceName, localProps, rawPage);
    };

    return (
        <main className="pt-24 md:pt-32 lg:pt-0">
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
