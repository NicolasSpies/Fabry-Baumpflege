import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useLanguage } from '@/cms/i18n/useLanguage';

const FAQ_CONTENT = {
    de: {
        label: 'Häufige Fragen',
        title: 'Antworten auf häufige Fragen',
        items: [
            {
                q: 'Braucht man in Belgien eine Genehmigung zum Baumfällen?',
                a: 'In Belgien ist für das Fällen geschützter Bäume eine Genehmigung des Gemeindekollegiums erforderlich. In den meisten Gemeinden Ostbelgiens gilt dies ab einem Stammumfang von 50 bis 60 cm. Angepflanzte Bäume benötigen unabhängig von ihrer Größe oft eine Genehmigung. Fabry Baumpflege berät zur geltenden Regelung und hilft bei der Antragstellung.'
            },
            {
                q: 'Was kostet eine Baumfällung?',
                a: 'Die Kosten hängen von Baumhöhe, Standort, Zugänglichkeit und gewünschter Entsorgung ab. Nach einer kostenlosen Vor-Ort-Besichtigung wird ein unverbindliches Angebot erstellt.'
            },
            {
                q: 'Welche Gemeinden und Regionen werden abgedeckt?',
                a: 'Fabry Baumpflege ist in der gesamten Deutschsprachigen Gemeinschaft Belgiens tätig: Eupen, Raeren, Kelmis, Lontzen, Sankt-Vith, Malmedy, Bütgenbach, Büllingen und Umgebung. Auch grenznahe Gebiete in Deutschland und Wallonien werden bedient.'
            },
            {
                q: 'Wann ist der beste Zeitpunkt für einen Baumschnitt?',
                a: 'Leichte Pflegeschnitte sind ganzjährig möglich. Stärkere Eingriffe empfehlen sich in der Vegetationsruhe von November bis Februar. Aus Artenschutzgründen sind starke Schnitte an Hecken und Bäumen von März bis September gesetzlich eingeschränkt. Ausnahmen gelten bei Verkehrssicherung und Gefahrensituationen.'
            },
            {
                q: 'Was tun, wenn ein Baum nach einem Sturm gefährlich wird?',
                a: 'Zunächst den Gefahrenbereich absichern und Abstand halten. Fabry Baumpflege ist für Notfalleinsätze in Ostbelgien erreichbar. Mithilfe der Seilklettertechnik (SKT) und kontrollierter Abseilverfahren werden Sturmschäden sicher und schnell abgetragen.'
            },
            {
                q: 'Ist Baumfällung in den Sommermonaten erlaubt?',
                a: 'Aus Vogelschutz- und Artenschutzgründen sind starke Schnitte an Bäumen und Hecken von März bis September grundsätzlich eingeschränkt. Verkehrssicherungsmaßnahmen und Gefahrenbaumfällungen sind jedoch ganzjährig zulässig. Die rechtliche Situation in der jeweiligen Gemeinde wird auf Anfrage geklärt.'
            },
            {
                q: 'Wird auch Gartenpflege und Bepflanzung angeboten?',
                a: 'Neben Baumpflege und Baumfällung umfasst das Angebot auch vollständige Gartenpflege (Heckenschnitt, Rasenpflege, Beetaufbereitung) sowie fachgerechte Neupflanzungen von Bäumen, Sträuchern und Stauden. Auf Anfrage sind individuelle Pflegepakete erhältlich.'
            },
            {
                q: 'Wie läuft die Angebotsanfrage ab?',
                a: 'Per Anruf oder Kontaktformular auf fabry-baumpflege.be. Fabry Baumpflege kommt für eine kostenlose Vor-Ort-Besichtigung und erstellt ein detailliertes, unverbindliches Angebot in der Regel innerhalb von 24 bis 48 Stunden.'
            },
            {
                q: 'Ist Fabry Baumpflege zertifiziert?',
                a: 'Ja. Vincent Fabry ist zertifizierter Baumpflegeexperte mit anerkannter Ausbildung in Seilklettertechnik (SKT). Alle Arbeiten werden nach geltenden Sicherheitsstandards und den Umweltschutzvorschriften in Belgien ausgeführt.'
            },
            {
                q: 'Wie schnell kommt Fabry Baumpflege vor Ort?',
                a: 'Bei normalen Anfragen wird ein Vor-Ort-Termin innerhalb weniger Werktage vereinbart, das Angebot folgt in der Regel innerhalb von 24 bis 48 Stunden. Bei Notfällen — zum Beispiel nach Sturmschäden — ist eine kurzfristige Reaktion in Ostbelgien möglich.'
            },
            {
                q: 'Arbeitet Fabry Baumpflege auch für Gemeinden und Gewerbebetriebe?',
                a: 'Ja. Fabry Baumpflege übernimmt Aufträge für Privatpersonen, Gemeinden, Gewerbebetriebe und landwirtschaftliche Betriebe in der gesamten Deutschsprachigen Gemeinschaft Belgiens und angrenzenden Regionen.'
            }
        ]
    },
    fr: {
        label: 'Questions fréquentes',
        title: 'Réponses aux questions fréquentes',
        items: [
            {
                q: "Faut-il un permis pour abattre un arbre en Belgique ?",
                a: "En Belgique, l'abattage d'arbres protégés nécessite une autorisation du collège communal. Dans la plupart des communes d'Ostbelgien, cela s'applique à partir d'une circonférence de tronc de 50 à 60 cm. Fabry Baumpflege conseille sur la réglementation en vigueur dans chaque commune et aide dans les démarches administratives."
            },
            {
                q: "Quel est le coût d'un abattage d'arbre ?",
                a: "Les coûts dépendent de la hauteur de l'arbre, de l'emplacement, de l'accessibilité et de l'élimination souhaitée. Après une visite gratuite sur place, un devis sans engagement est établi."
            },
            {
                q: "Quelles communes et régions sont couvertes ?",
                a: "Fabry Baumpflege intervient dans toute la Communauté germanophone de Belgique : Eupen, Raeren, Kelmis, Lontzen, Saint-Vith, Malmedy, Bütgenbach, Büllingen et leurs environs. Les zones frontalières en Allemagne et en Wallonie sont également desservies."
            },
            {
                q: "Quelle est la meilleure période pour la taille des arbres ?",
                a: "Les tailles d'entretien légères sont possibles toute l'année. Les interventions plus importantes sont recommandées pendant la période de repos végétatif, de novembre à février. Pour des raisons de protection des espèces, les tailles importantes sont légalement restreintes de mars à septembre."
            },
            {
                q: "Que faire si un arbre devient dangereux après une tempête ?",
                a: "Sécuriser la zone dangereuse et garder ses distances. Fabry Baumpflege est disponible pour les interventions d'urgence en Ostbelgien. Grâce à la technique de grimpe encordée (SKT) et aux procédés de descente contrôlée, les dégâts sont traités rapidement et en toute sécurité."
            },
            {
                q: "L'abattage d'arbres est-il autorisé pendant les mois d'été ?",
                a: "Pour des raisons de protection des oiseaux, les tailles importantes des arbres et des haies sont généralement restreintes de mars à septembre. Cependant, les mesures de sécurité et les abattages d'arbres dangereux sont autorisés toute l'année. La situation juridique dans chaque commune peut être clarifiée sur demande."
            },
            {
                q: "L'entretien de jardin et la plantation sont-ils également proposés ?",
                a: "En plus de l'arboriculture et de l'abattage, l'offre comprend également un entretien complet du jardin (taille des haies, entretien de la pelouse, préparation des parterres) ainsi que des nouvelles plantations d'arbres, d'arbustes et de vivaces. Des forfaits d'entretien individuels sont disponibles sur demande."
            },
            {
                q: "Comment obtenir un devis ?",
                a: "Par téléphone ou via le formulaire de contact sur fabry-baumpflege.be. Fabry Baumpflege se déplace pour une visite gratuite sur place et établit un devis détaillé et sans engagement, en général dans les 24 à 48 heures."
            },
            {
                q: "Fabry Baumpflege est-il certifié ?",
                a: "Oui. Vincent Fabry est expert arboricole certifié avec une formation reconnue en technique de grimpe encordée (SKT). Tous les travaux sont réalisés conformément aux normes de sécurité en vigueur et aux réglementations environnementales belges."
            },
            {
                q: "Dans quel délai Fabry Baumpflege intervient-il ?",
                a: "Pour les demandes normales, un rendez-vous sur place est organisé dans les quelques jours ouvrables, et le devis suit généralement dans les 24 à 48 heures. En cas d'urgence — par exemple après des dégâts de tempête — une intervention rapide en Ostbelgien est possible."
            },
            {
                q: "Fabry Baumpflege travaille-t-il aussi pour les communes et les entreprises ?",
                a: "Oui. Fabry Baumpflege réalise des travaux pour les particuliers, les communes, les entreprises et les exploitations agricoles dans toute la Communauté germanophone de Belgique et les régions limitrophes."
            }
        ]
    }
};

const FaqItem = ({ question, answer, isOpen, onToggle }) => (
    <div className="border-b border-primary/10 last:border-b-0">
        <button
            onClick={onToggle}
            className="w-full flex items-center justify-between gap-4 py-5 text-left group"
            aria-expanded={isOpen}
        >
            <span className={`font-sans font-semibold text-[0.95rem] md:text-base leading-snug transition-colors duration-200 ${isOpen ? 'text-primary' : 'text-slate-800 dark:text-slate-100 group-hover:text-primary'}`}>
                {question}
            </span>
            <motion.span
                animate={{ rotate: isOpen ? 45 : 0 }}
                transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                className={`flex-shrink-0 text-2xl font-light leading-none select-none transition-colors duration-200 ${isOpen ? 'text-primary' : 'text-primary/40 group-hover:text-primary'}`}
            >
                +
            </motion.span>
        </button>
        <AnimatePresence initial={false}>
            {isOpen && (
                <motion.div
                    key="answer"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                    style={{ overflow: 'hidden' }}
                >
                    <p className="font-sans text-slate-600 dark:text-slate-300 text-[0.875rem] md:text-[0.95rem] leading-relaxed pb-5 pr-10">
                        {answer}
                    </p>
                </motion.div>
            )}
        </AnimatePresence>
    </div>
);

const FaqSection = () => {
    const { language } = useLanguage();
    const [openIndex, setOpenIndex] = useState(0);

    const content = FAQ_CONTENT[language?.toLowerCase()] ?? FAQ_CONTENT.de;

    const toggle = (i) => setOpenIndex(prev => prev === i ? null : i);

    return (
        <section className="py-20 md:py-28 bg-stone-50 dark:bg-surface-dark/60" id="faq">
            <div className="max-w-7xl mx-auto px-6">
                <div className="text-center space-y-4 mb-12 md:mb-16">
                    <span className="text-accent-label font-bold tracking-widest uppercase text-xs block reveal">
                        {content.label}
                    </span>
                    <h2 className="text-4xl md:text-[2.75rem] lg:text-5xl font-serif text-primary reveal leading-[1.2]">
                        {content.title}
                    </h2>
                </div>

                <div className="max-w-3xl mx-auto reveal">
                    {content.items.map((item, i) => (
                        <FaqItem
                            key={i}
                            question={item.q}
                            answer={item.a}
                            isOpen={openIndex === i}
                            onToggle={() => toggle(i)}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
};

export default FaqSection;
