import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/cms/i18n/useLanguage';
import { useScrollReveal } from '@/cms/hooks/useScrollReveal';
import { getPage, mapPageContent, getForm } from '@/cms/lib/cms';
import { definePreview } from '@/cms/lib/preview';

// ── Sections ────────────────────────────────────────────────────────────────
import PageHeroSection from '@/cms/sections/PageHeroSection';
import ContactSidebarSection from '@/cms/sections/ContactSidebarSection';
import ContactFormSection from '@/cms/sections/ContactFormSection';
import { resolveInstanceProps, awaitMappings } from '@/cms/bridge-resolver';


// ── Assets ──────────────────────────────────────────────────────────────────
import servicesHeroImg from '@/assets/images/hero/services_hero.png';

/**
 * Preview Metadata for ContentBridge scanning.
 */
export const previewData = definePreview({
    page: 'Contact',
    source: '/cms/wp/v2/pages?slug=kontakt',
    sections: [
        {
            section: 'PageHeroSection',
            fields: ['title', 'image']
        },
        {
            section: 'ContactSidebarSection',
            fields: ['details_label', 'phone', 'email', 'office_label', 'address', 'area_label', 'area_text']
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

    const getLocalContent = () => ({
        hero: {
            title: t('contact.title'),
            image: servicesHeroImg,
        },
        sidebar: {
            details_label: t('contact.details'),
            phone: "+32 476 32 09 69",
            email: "info@fabry-baumpflege.be",
            office_label: t('contact.office'),
            address: "Halloux 16, 4830 Limbourg",
            address_link: "https://www.google.com/maps/dir/?api=1&destination=Halloux+16,+4830+Limbourg",
            area_label: t('contact.area'),
            area_text: t('contact.area_text'),
        },
        form: {
            heading: t('contact.help_heading'),
            button: t('contact.send'),
        },
    });

    const [pageData, setPageData] = useState(getLocalContent());
    const [rawPage, setRawPage] = useState(null);
    const [formSchema, setFormSchema] = useState(null);

    useEffect(() => {
        setPageData(getLocalContent());
    }, [language, t]);

    useEffect(() => {
        let cancelled = false;
        async function loadContent() {
            try {
                await awaitMappings();
                if (cancelled) return;
                
                const [page, form] = await Promise.all([
                    getPage('kontakt', language),
                    getForm('kontakt', language)
                ]);

                if (cancelled) return;
                
                if (page) {
                    setRawPage(page);
                    setPageData(prev => mapPageContent(page, prev, 'Contact'));
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
                    />
                </div>
            </div>
        </main>
    );
};

export default Contact;
