import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/cms/i18n/useLanguage';
import { useScrollReveal } from '@/cms/hooks/useScrollReveal';
import { getPage, mapPageContent, getForm, PAGE_IDS } from '@/cms/lib/cms';
import { definePreview } from '@/cms/lib/preview';

// ── Sections ────────────────────────────────────────────────────────────────
import ContactSidebarSection from '@/cms/sections/ContactSidebarSection';
import ContactFormSection from '@/cms/sections/ContactFormSection';
import { resolveInstanceProps, awaitMappings } from '@/cms/bridge-resolver';
import useCmsSeo from '@/cms/hooks/useCmsSeo';



/**
 * Preview Metadata for ContentBridge scanning.
 */
export const previewData = definePreview({
    page: 'Contact',
    source: '/content-core/v1/post/page/22',
    sections: [
        {
            section: 'ContactSidebarSection',
            fields: ['contact_person', 'phone', 'email', 'office_label', 'address', 'area_label', 'area_text']
        },
        {
            section: 'ContactFormSection',
            fields: ['heading', 'button'],
        },
    ],
});

const Contact = () => {
    const { language, t, globalCmsData, globalSeo, setAlternates } = useLanguage();

    const getInitialContent = () => ({
        hero: {
            title: '',
            image: '',
        },
        sidebar: {
            contact_person: globalCmsData?.options?.contact_person || '',
            phone: globalCmsData?.options?.phone || '',
            email: globalCmsData?.options?.email || '',
            office_label: t('contact.office') || 'Büro',
            address: globalCmsData?.options?.address || '',
            address_link: globalCmsData?.options?.address_link || '#',
            area_label: t('contact.area') || 'Einsatzgebiet',
            area_text: t('contact.area_text') || '',
        },
        form: {
            heading: t('contact.help_heading') || 'Kontakt',
            button: t('contact.send') || 'Absenden',
        },
    });

    const getFallbackContent = () => getInitialContent();

    const [pageData, setPageData] = useState(getInitialContent());
    const [rawPage, setRawPage] = useState(null);
    const [formSchema, setFormSchema] = useState(null);
    useScrollReveal([rawPage, formSchema]);

    useEffect(() => {
        setPageData(getInitialContent());
    }, [language, t]);

    useEffect(() => {
        let cancelled = false;
        async function loadContent() {
            try {
                await awaitMappings();
                if (cancelled) return;
                
                const [page, form] = await Promise.all([
                    getPage(PAGE_IDS.contact, language),
                    getForm('formular', language)
                ]);

                if (cancelled) return;

                if (page) {
                    setRawPage(page);
                    const mappedContact = mapPageContent(page, getFallbackContent(), 'Contact');
                    setPageData(prev => ({ ...prev, ...mappedContact }));

                    // Register alternates for API-driven routing
                    if (page.cc_alternates || page.pll_translations) {
                        setAlternates(page.cc_alternates || page.pll_translations);
                    }
                }
                if (form) {
                    setFormSchema(form);
                }
            } catch (err) {
                console.error('[Contact] CMS load failed:', err);
            }
        }
        loadContent();
        return () => { cancelled = true; };
    }, [language, t]);

    useCmsSeo(rawPage?.seo || globalSeo);



    const getProps = (instanceName, localProps) => {
        return resolveInstanceProps('Contact', instanceName, localProps, rawPage);
    };

    // No longer blocking on rawPage or formSchema
    // We render the sidebar and form shell immediately.

    return (
        <main className="bg-primary/[0.035] dark:bg-background-dark">
            <div className="max-w-7xl mx-auto px-6 pt-32 pb-24">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
                    {/* Page: Contact → Section: ContactSidebarSection */}
                    <ContactSidebarSection {...getProps('ContactSidebarSection', pageData.sidebar)} />

                    {/* Page: Contact → Section: ContactFormSection */}
                    <ContactFormSection 
                        {...getProps('ContactFormSection', pageData.form)} 
                        formSchema={formSchema}
                        language={language}
                    />
                </div>
            </div>
        </main>
    );
};

export default Contact;
