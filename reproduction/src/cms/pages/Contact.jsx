import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/cms/i18n/useLanguage';
import { useScrollReveal } from '@/cms/hooks/useScrollReveal';
import { getPage, mapPageContent, getForm, PAGE_IDS } from '@/cms/lib/cms';
import { definePreview } from '@/cms/lib/preview';

// ── Sections ────────────────────────────────────────────────────────────────
import PageHeroSection from '@/cms/sections/PageHeroSection';
import ContactSidebarSection from '@/cms/sections/ContactSidebarSection';
import ContactFormSection from '@/cms/sections/ContactFormSection';
import { resolveInstanceProps, awaitMappings } from '@/cms/bridge-resolver';


/**
 * Preview Metadata for ContentBridge scanning.
 */
export const previewData = definePreview({
    page: 'Contact',
    source: '/content-core/v1/post/page/22',
    sections: [
        {
            section: 'PageHeroSection',
            fields: ['title', 'image']
        },
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
    const { language, t, globalCmsData } = useLanguage();
    useScrollReveal();

    const getInitialContent = () => ({
        hero: {
            title: '',
            image: '',
        },
        sidebar: {
            contact_person: '',
            phone: '',
            email: '',
            office_label: '',
            address: '',
            address_link: '',
            area_label: '',
            area_text: '',
        },
        form: {
            heading: '',
            button: '',
        },
    });

    const getFallbackContent = () => ({
        ...getInitialContent(),
        sidebar: {
            ...getInitialContent().sidebar,
            office_label: t('contact.office'),
            area_label: t('contact.area'),
        },
        form: {
            ...getInitialContent().form,
            heading: t('contact.help_heading'),
            button: t('contact.send'),
        },
    });

    const [pageData, setPageData] = useState(getInitialContent());
    const [rawPage, setRawPage] = useState(null);
    const [formSchema, setFormSchema] = useState(null);

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
                    setPageData(mapPageContent(page, getFallbackContent(), 'Contact'));
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

    const getProps = (instanceName, localProps) => {
        return resolveInstanceProps('Contact', instanceName, localProps, rawPage);
    };

    return (
        <main className="bg-[#F9FBF7] dark:bg-background-dark">
            {/* Page: Contact → Section: PageHeroSection */}
            <PageHeroSection 
                {...getProps('PageHeroSection', pageData.hero)}
            />

            <div className="max-w-7xl mx-auto px-6 py-24">
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
