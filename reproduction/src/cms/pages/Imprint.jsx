import React from 'react';
import { useLocation } from 'react-router-dom';
import { useLanguage } from '@/cms/i18n/useLanguage';
import { useScrollReveal } from '@/cms/hooks/useScrollReveal';
import useCmsSeo from '@/cms/hooks/useCmsSeo';

const Imprint = () => {
    const { language, t, globalCmsData, globalSeo, setPageReady } = useLanguage();
    const location = useLocation();
    useScrollReveal([language]);
    useCmsSeo(globalSeo);

    // Imprint is pure text — no CMS fetch needed. Signal ready immediately
    // after useLanguage's own effect resets pageReady to false.
    React.useEffect(() => {
        queueMicrotask(() => setPageReady(true));
    }, [location.pathname, setPageReady]);

    const opts = globalCmsData?.options || {};
    const name = opts.contact_person || 'Vincent Fabry';
    const company = opts.company_name || 'Fabry Baumpflege';
    const address = opts.address || 'Halloux 16, 4830 Limbourg, BE';
    const phone = opts.phone || '+32 476 32 09 69';
    const email = opts.email || 'info@fabry-baumpflege.be';

    const isFR = language === 'FR';

    return (
        <main className="bg-white dark:bg-background-dark">
            <div className="max-w-3xl mx-auto px-6 pt-32 pb-24">
                <h1 className="text-4xl md:text-5xl font-serif text-primary mb-12 hero-enter hero-enter-1">
                    {t('footer.imprint')}
                </h1>
                <div className="prose prose-slate dark:prose-invert max-w-none text-sm leading-relaxed space-y-8">
                    <section>
                        <h2 className="text-lg font-bold text-primary mb-3">
                            {isFR ? 'Responsable du site' : 'Angaben gemäß belgischem Recht'}
                        </h2>
                        <p>
                            {company}<br />
                            {name}<br />
                            {address}
                        </p>
                    </section>

                    <section>
                        <h2 className="text-lg font-bold text-primary mb-3">
                            {isFR ? 'Contact' : 'Kontakt'}
                        </h2>
                        <p>
                            {isFR ? 'Téléphone' : 'Telefon'}: <a href={`tel:${phone.replace(/\s/g, '')}`} className="text-primary hover:opacity-80 no-underline">{phone}</a><br />
                            E-Mail: <a href={`mailto:${email}`} className="text-primary hover:opacity-80 no-underline">{email}</a>
                        </p>
                    </section>

                    <section>
                        <h2 className="text-lg font-bold text-primary mb-3">
                            {isFR ? 'Responsabilité du contenu' : 'Verantwortlich für den Inhalt'}
                        </h2>
                        <p>
                            {name}<br />
                            {address}
                        </p>
                    </section>

                    <section>
                        <h2 className="text-lg font-bold text-primary mb-3">
                            {isFR ? 'Avertissement' : 'Haftungshinweis'}
                        </h2>
                        <p>
                            {isFR
                                ? 'Malgré un contrôle minutieux du contenu, nous déclinons toute responsabilité quant au contenu des liens externes. Seuls les exploitants des sites liés sont responsables de leur contenu.'
                                : 'Trotz sorgfältiger inhaltlicher Kontrolle übernehmen wir keine Haftung für die Inhalte externer Links. Für den Inhalt der verlinkten Seiten sind ausschließlich deren Betreiber verantwortlich.'
                            }
                        </p>
                    </section>

                    <section>
                        <h2 className="text-lg font-bold text-primary mb-3">
                            {isFR ? 'Conception, développement & hébergement' : 'Website-Design, -Entwicklung & Hosting'}
                        </h2>
                        <p>
                            lac&#248;nis &mdash; Nicolas Spies<br />
                            <a href="https://laconis.be" target="_blank" rel="noopener noreferrer" className="text-primary hover:opacity-80 no-underline">laconis.be</a>
                        </p>
                    </section>
                </div>
            </div>
        </main>
    );
};

export default Imprint;
