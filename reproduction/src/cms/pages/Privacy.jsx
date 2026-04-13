import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useLanguage } from '@/cms/i18n/useLanguage';
import { useScrollReveal } from '@/cms/hooks/useScrollReveal';
import { getPage, PAGE_IDS } from '@/cms/lib/cms';
import useCmsSeo from '@/cms/hooks/useCmsSeo';

const SECTION_HEADINGS = [
    // DE
    'Datenschutzerklärung',
    'Verantwortlicher',
    'Allgemeine Hinweise zur Datenverarbeitung',
    'Hosting',
    'Server-Logfiles',
    'Kontaktformular und Kontaktaufnahme',
    'Cookies',
    'Externe Links',
    'Empfänger der Daten',
    'Speicherdauer',
    'Deine Rechte',
    'Beschwerderecht',
    // FR
    'Politique de confidentialité',
    'Responsable',
    'Informations générales sur le traitement des données',
    'Hébergement',
    'Fichiers journaux du serveur',
    'Formulaire de contact et prise de contact',
    'Liens externes',
    'Destinataires des données',
    'Durée de conservation',
    'Tes droits',
    'Droit de réclamation',
    'Dernière mise à jour',
    'Fournisseur',
    'Sources',
    'Stand',
    'Anbieter',
    'Quellen',
];

const replacePlaceholders = (text, opts) => {
    if (!text || !opts) return text;
    return text
        .replace(/\[Name\s*\/?\s*Firmenname\]/gi, opts.company_name || 'Fabry Baumpflege')
        .replace(/\[Adresse\]/gi, 'Halloux 16')
        .replace(/\[PLZ Ort\]/gi, '4830 Limbourg')
        .replace(/\[E-Mail\]/gi, opts.email || 'info@fabry-baumpflege.be')
        .replace(/\[Telefon\]/gi, opts.phone || '+32 476 32 09 69');
};

const renderContent = (text) => {
    if (!text) return null;
    const lines = text.split('\n');
    const elements = [];
    let currentBlock = [];

    const flushBlock = () => {
        if (currentBlock.length > 0) {
            const blockText = currentBlock.join('\n').trim();
            if (blockText) {
                elements.push(
                    <p key={elements.length} className="whitespace-pre-line break-words">
                        {blockText}
                    </p>
                );
            }
            currentBlock = [];
        }
    };

    for (const line of lines) {
        const trimmed = line.trim().replace(/:$/, '');
        if (SECTION_HEADINGS.includes(trimmed)) {
            flushBlock();
            elements.push(
                <h2 key={elements.length} className="text-lg font-bold text-primary mt-8 mb-3">
                    {line.trim()}
                </h2>
            );
        } else {
            currentBlock.push(line);
        }
    }
    flushBlock();
    return elements;
};

const Privacy = () => {
    const { language, t, globalCmsData, globalSeo, setPageReady } = useLanguage();
    const [content, setContent] = useState('');
    const [rawPage, setRawPage] = useState(null);
    const location = useLocation();
    useScrollReveal([rawPage]);

    // Text-only page — signal ready immediately after useLanguage resets
    // pageReady to false, so no loader/overlay flashes.
    React.useEffect(() => {
        queueMicrotask(() => setPageReady(true));
    }, [location.pathname, setPageReady]);

    useEffect(() => {
        let cancelled = false;
        async function loadContent() {
            try {
                const page = await getPage(PAGE_IDS.privacy, language);
                if (cancelled) return;
                if (page) {
                    setRawPage(page);
                    const datenschutz = page.customFields?.new_field_datenschutz || page.content || '';
                    const opts = globalCmsData?.options || {};
                    setContent(replacePlaceholders(datenschutz, opts));
                }
            } catch (err) {
                console.error('[Privacy] CMS load failed:', err);
            }
        }
        loadContent();
        return () => { cancelled = true; };
    }, [language, globalCmsData]);

    useCmsSeo(rawPage?.seo || globalSeo);

    return (
        <main className="bg-white dark:bg-background-dark">
            <div className="max-w-3xl mx-auto px-6 pt-32 pb-24">
                <h1 className="text-4xl md:text-5xl font-serif text-primary mb-12">
                    {t('footer.privacy')}
                </h1>
                {content ? (
                    <div className="prose prose-slate dark:prose-invert max-w-none text-sm leading-relaxed space-y-4">
                        {renderContent(content)}
                    </div>
                ) : (
                    <div className="min-h-[200px]" />
                )}
            </div>
        </main>
    );
};

export default Privacy;
