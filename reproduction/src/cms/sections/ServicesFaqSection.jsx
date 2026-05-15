import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useLanguage } from '@/cms/i18n/useLanguage';

const FAQ_CONTENT = {
    de: {
        label: 'Fachliche Fragen',
        title: 'Technik & Ablauf',
        items: [
            {
                q: 'Was ist Seilklettertechnik (SKT)?',
                a: 'Bei der Seilklettertechnik (SKT) wird mit Sicherungsseilen und professioneller Kletterausrüstung in die Baumkrone aufgestiegen. So können auch enge Verhältnisse, überbaute Flächen oder schwer zugängliche Standorte ohne Hubsteiger oder Kran sicher bearbeitet werden. SKT ist die schonendste Methode für Baum und Umgebung.'
            },
            {
                q: 'Woran erkennt man, ob ein Baum gefährlich ist?',
                a: 'Anzeichen für einen gefährlichen Baum sind abgestorbene oder hängende Äste, Pilzbefall am Stamm oder an den Wurzeln, tiefe Risse in der Rinde, starke Schieflage sowie freiliegende oder beschädigte Wurzeln. Im Zweifel bietet Fabry Baumpflege eine professionelle Baumkontrolle vor Ort an.'
            },
            {
                q: 'Was passiert mit dem Holz nach der Baumfällung?',
                a: 'Das anfallende Holz und Häckselgut kann auf Wunsch vollständig abtransportiert und entsorgt werden. Alternativ kann das Holz als Brennholz aufbereitet oder das Häckselgut als natürlicher Mulch im Garten verwendet werden. Die bevorzugte Entsorgungsart wird vorab besprochen.'
            },
            {
                q: 'Wie lange dauert eine Baumfällung?',
                a: 'Die Dauer hängt von Baumgröße, Standort und Zugänglichkeit ab. Ein kleiner Baum ist oft innerhalb einer Stunde gefällt, ein großer Baum in schwieriger Lage kann einen ganzen Arbeitstag in Anspruch nehmen. Nach der Vor-Ort-Besichtigung wird eine genaue Zeiteinschätzung gegeben.'
            },
            {
                q: 'Wird auch die Stubbenfräsung übernommen?',
                a: 'Nach einer Baumfällung kann der verbleibende Stumpf auf Wunsch bodenbündig gefräst werden, sodass der Bereich wieder bepflanzbar oder bebaubar ist. Die Stubbenfräsung kann direkt mit der Fällung kombiniert werden.'
            },
            {
                q: 'Was ist der Unterschied zwischen Kronenpflege und Baumschnitt?',
                a: 'Ein Baumschnitt bezeichnet allgemein das Entfernen von Ästen. Kronenpflege ist präziser und umfasst das gezielte Auslichten, Einkürzungen sowie die formgebende Arbeit an der gesamten Baumkrone mit dem Ziel, Vitalität, Standsicherheit und Erscheinungsbild des Baumes langfristig zu erhalten.'
            },
            {
                q: 'Ist Fabry Baumpflege haftpflichtversichert?',
                a: 'Fabry Baumpflege arbeitet mit einer professionellen Betriebshaftpflichtversicherung. Alle Arbeiten werden nach geltenden Sicherheitsstandards ausgeführt. Vor Beginn jedes Auftrags werden potenzielle Risiken besprochen und dokumentiert.'
            },
            {
                q: 'Kann man einen Baum selbst fällen?',
                a: 'Das Fällen großer Bäume ohne Fachkenntnisse und geeignete Ausrüstung ist sehr gefährlich. Bei geschützten Bäumen ist es ohne Genehmigung zudem strafbar. Für Bäume über 5 Meter und in der Nähe von Gebäuden, Leitungen oder öffentlichen Wegen empfiehlt sich stets ein zugelassener Fachbetrieb.'
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
        label: 'Questions techniques',
        title: 'Technique & déroulement',
        items: [
            {
                q: "Qu'est-ce que la technique de grimpe encordée (SKT) ?",
                a: "Avec la technique de grimpe encordée (SKT), l'arboriste monte dans la couronne de l'arbre à l'aide de cordes de sécurité et d'un équipement d'escalade professionnel. Cela permet de travailler en toute sécurité même dans des espaces restreints ou difficiles d'accès, sans nacelle ni grue. C'est la méthode la plus douce pour l'arbre et son environnement."
            },
            {
                q: "Comment reconnaître si un arbre est dangereux ?",
                a: "Les signes d'un arbre dangereux sont des branches mortes ou pendantes, des champignons sur le tronc ou les racines, des fissures profondes dans l'écorce, une forte inclinaison ainsi que des racines exposées ou endommagées. En cas de doute, Fabry Baumpflege propose un contrôle d'arbre professionnel sur place."
            },
            {
                q: "Que se passe-t-il avec le bois après l'abattage ?",
                a: "Le bois et les copeaux peuvent être entièrement évacués sur demande. Alternativement, le bois peut être transformé en bois de chauffage ou les copeaux utilisés comme paillis naturel dans le jardin. La méthode d'élimination préférée est discutée au préalable."
            },
            {
                q: "Combien de temps dure un abattage d'arbre ?",
                a: "La durée dépend de la taille de l'arbre, de son emplacement et de son accessibilité. Un petit arbre peut être abattu en une heure, tandis qu'un grand arbre dans un endroit difficile peut prendre toute une journée de travail. Après la visite sur place, une estimation précise du temps est communiquée."
            },
            {
                q: "Le fraisage de souche est-il également proposé ?",
                a: "Après un abattage, la souche restante peut être fraisée au niveau du sol sur demande, de sorte que la zone redevient plantable ou constructible. Le fraisage de souche peut être combiné directement avec l'abattage."
            },
            {
                q: "Quelle est la différence entre l'entretien de la couronne et l'élagage ?",
                a: "L'élagage désigne en général la suppression de branches. L'entretien de la couronne est plus précis : il comprend l'éclaircissement ciblé, la réduction et le travail de mise en forme de l'ensemble de la couronne avec l'objectif de préserver durablement la vitalité, la stabilité et l'aspect de l'arbre."
            },
            {
                q: "Fabry Baumpflege est-il couvert par une assurance responsabilité civile ?",
                a: "Fabry Baumpflege travaille avec une assurance responsabilité civile professionnelle. Tous les travaux sont effectués selon les normes de sécurité en vigueur. Avant le début de chaque chantier, les risques potentiels sont discutés et documentés."
            },
            {
                q: "Peut-on abattre soi-même un arbre ?",
                a: "L'abattage de grands arbres sans connaissances spécialisées et sans équipement adapté est très dangereux. Pour les arbres protégés, c'est également punissable sans autorisation. Pour les arbres de plus de 5 mètres et à proximité de bâtiments, de lignes ou de voies publiques, il est toujours recommandé de faire appel à un prestataire agréé."
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

const ServicesFaqSection = () => {
    const { language } = useLanguage();
    const [openIndex, setOpenIndex] = useState(null);

    const content = FAQ_CONTENT[language?.toLowerCase()] ?? FAQ_CONTENT.de;

    const toggle = (i) => setOpenIndex(prev => prev === i ? null : i);

    return (
        <section className="py-20 md:py-28 bg-white dark:bg-surface-dark" id="faq-leistungen">
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

export default ServicesFaqSection;
