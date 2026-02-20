import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../i18n/useLanguage';
import { useScrollReveal } from '../hooks/useScrollReveal';
import baumpflegeImg from '../assets/images/services/baumpflege.png';
import baumfaellungImg from '../assets/images/services/baumfaellung.png';
import gartenpflegeImg from '../assets/images/services/gartenpflege.png';
import wurzelnImg from '../assets/images/services/wurzeln.png';
import servicesHeroImg from '../assets/images/hero/services_hero.png';

const StatCounter = ({ value, label, language }) => {
    const [count, setCount] = useState(0);
    const countRef = useRef(null);
    const hasAnimated = useRef(false);

    useEffect(() => {
        const observer = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting && !hasAnimated.current) {
                hasAnimated.current = true;
                const target = parseInt(value.replace(/\D/g, ''));
                const duration = 2000;
                const start = 0;
                const end = target;
                let startTime = null;

                const animate = (timestamp) => {
                    if (!startTime) startTime = timestamp;
                    const progress = Math.min((timestamp - startTime) / duration, 1);
                    setCount(Math.floor(progress * (end - start) + start));
                    if (progress < 1) {
                        requestAnimationFrame(animate);
                    } else {
                        setCount(target);
                    }
                };
                requestAnimationFrame(animate);
            }
        }, { threshold: 0.5 });

        if (countRef.current) observer.observe(countRef.current);
        return () => observer.disconnect();
    }, [value]);

    return (
        <div ref={countRef} className="text-center reveal font-sans">
            <div className="text-4xl md:text-5xl font-serif text-primary mb-2">
                {count}{value.includes('+') ? '+' : value.includes('%') ? '%' : ''}
            </div>
            <div className="text-xs md:text-sm text-slate-500 uppercase tracking-widest font-medium">
                {label[language]}
            </div>
        </div>
    );
};

const Services = () => {
    const { language } = useLanguage();
    useScrollReveal();

    const servicesList = [
        {
            title: { DE: 'Professionelle Baumpflege', FR: 'Arboriculture Professionnelle' },
            icon: 'nature',
            desc: {
                DE: 'Eine fachgerechte Baumpflege ist essenziell für die Vitalität und Verkehrssicherheit deiner Bäume. Ich führe Kronenpflege, Totholzbeseitigung und Lichtraumprofilschnitte nach ZTV-Baumpflege Richtlinien durch.',
                FR: 'Un entretien professionnel des arbres est essentiel pour la vitalité et la sécurité de vos arbres. Nous effectuons la taille de la couronne, l\'élimination du bois mort et la taille de profil selon les directives ZTV-Baumpflege.'
            },
            features: {
                DE: ['Fachgerechter Kronenschnitt & Entlastung', 'Seilklettertechnik (SKT) für schwierige Lagen', 'Erhalt der natürlichen Baumarchitektur'],
                FR: ['Taille de couronne et délestage professionnels', 'Grimpe (SKT) pour les endroits difficiles', 'Préservation de l\'architecture naturelle de l\'arbre']
            },
            image: baumpflegeImg,
            reverse: false,
            id: 'baumpflege'
        },
        {
            title: { DE: 'Präzise Baumfällung', FR: 'Abattage Précis' },
            icon: 'psychiatry',
            desc: {
                DE: 'Wenn Bäume zur Gefahr werden oder Platz für Neues weichen müssen, bin ich dein Partner für sichere Fällungen. Ich arbeite präzise, auch auf engstem Raum, und kümmere mich um die Entsorgung.',
                FR: 'Lorsque les arbres deviennent un danger ou doivent laisser place à la nouveauté, nous sommes votre partenaire pour des abattages sûrs. Nous travaillons avec précision, même dans des espaces restreints, et nous occupons de l\'évacuation.'
            },
            features: {
                DE: ['Gefahrenbaumfällung & Sturmschäden', 'Abtragen mittels Seilablassverfahren', 'Wurzelstockfräsen & Standortsanierung'],
                FR: ['Abattage d\'arbres dangereux & dégâts de tempête', 'Démontage par rétention', 'Rognage de souches & assainissement du site']
            },
            image: baumfaellungImg,
            reverse: true,
            id: 'baumfaellung'
        },
        {
            title: { DE: 'Individuelle Gartenpflege', FR: 'Entretien de jardin individuel' },
            icon: 'potted_plant',
            desc: {
                DE: 'Ein schöner Garten braucht regelmäßige Zuwendung. Ich übernehme die Pflege deiner Grünanlagen, damit du deine freie Zeit in deiner persönlichen Oase genießen kannst.',
                FR: 'Un beau jardin nécessite une attention régulière. Nous nous occupons de l\'entretien de vos espaces verts afin que vous puissiez profiter de votre temps libre dans votre oasis personnelle.'
            },
            features: {
                DE: ['Heckenschnitt & Formgehölzpflege', 'Rasenpflege & Beetaufbereitung', 'Jahreszeitliche Gartenpflege-Pakete'],
                FR: ['Taille des haies & entretien des arbustes', 'Entretien de la pelouse & préparation des parterres', 'Forfaits d\'entretien saisonniers']
            },
            image: gartenpflegeImg,
            reverse: false,
            id: 'gartenpflege'
        },
        {
            title: { DE: 'Nachhaltige Bepflanzung', FR: 'Plantation durable' },
            icon: 'garden_cart',
            desc: {
                DE: 'Wir schaffen Lebensräume. Durch die Auswahl standortgerechter Gehölze und Stauden sorgen wir für ein gesundes Wachstum und eine ästhetische Gestaltung deines Außenbereichs.',
                FR: 'Nous créons des habitats. En choisissant des arbustes et des vivaces adaptés au site, nous assurons une croissance saine et un aménagement esthétique de votre espace extérieur.'
            },
            features: {
                DE: ['Beratung bei der Pflanzenauswahl', 'Fachgerechte Neupflanzung von Bäumen', 'Standortoptimierung & Bodenverbesserung'],
                FR: ['Conseils pour le choix des plantes', 'Plantation experte d\'arbres', 'Optimisation du site & amélioration du sol']
            },
            image: wurzelnImg,
            reverse: true,
            bg: true,
            id: 'bepflanzung'
        }
    ];

    const [scrollY, setScrollY] = useState(0);
    useEffect(() => {
        const handleScroll = () => setScrollY(window.scrollY);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <main>
            <section className="relative h-[60vh] flex items-center justify-center pt-20 overflow-hidden">
                <img
                    alt="Lush green canopy"
                    className="absolute inset-0 w-full h-full object-cover"
                    src={servicesHeroImg}
                    style={{
                        transform: `scale(${1.1 + scrollY * 0.0001}) translateY(${scrollY * 0.15}px)`,
                        transition: 'transform 0.1s ease-out'
                    }}
                />
                <div className="absolute inset-0 bg-black/30"></div>
                <div className="relative z-10 text-center reveal">
                    <h1 className="text-6xl md:text-7xl font-serif text-white">
                        {language === 'DE' ? 'Leistungen' : 'Services'}
                    </h1>
                </div>
            </section>

            <div className="space-y-0">
                {servicesList.map((service, idx) => (
                    <section
                        key={idx}
                        id={service.id}
                        className={`py-32 px-6 overflow-hidden ${service.bg ? 'bg-surface-light/50 dark:bg-surface-dark/20' : ''}`}
                    >
                        <div className="max-w-7xl mx-auto">
                            <div className={`flex flex-col lg:flex-row items-center gap-16 ${service.reverse ? 'lg:flex-row-reverse' : ''}`}>
                                <div className="w-full lg:w-1/2">
                                    <div className="relative rounded-xl overflow-hidden shadow-2xl reveal">
                                        <img
                                            alt={service.title[language]}
                                            className="w-full h-[500px] object-cover hover:scale-105 transition-transform duration-700"
                                            src={service.image}
                                        />
                                    </div>
                                </div>
                                <div className="w-full lg:w-1/2 space-y-8 reveal stagger-1">
                                    <div className="space-y-6">
                                        <span className="material-symbols-outlined text-primary text-6xl font-light">{service.icon}</span>
                                        <h2 className="text-4xl font-serif text-primary leading-tight font-medium">{service.title[language]}</h2>
                                    </div>
                                    <p className="text-lg leading-relaxed text-slate-600 dark:text-slate-400">
                                        {service.desc[language]}
                                    </p>
                                    <ul className="space-y-3">
                                        {service.features[language].map((feature, fIdx) => (
                                            <li key={fIdx} className="flex items-center gap-3">
                                                <span className="material-symbols-outlined text-primary">check_circle</span>
                                                <span>{feature}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </section>
                ))}
            </div>

            <section className="py-16 border-y border-slate-100 dark:border-slate-800">
                <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8">
                    {[
                        { v: '500+', l: { DE: 'Zufriedene Kunden', FR: 'Clients satisfaits' } },
                        { v: '2500+', l: { DE: 'Gepflegte Bäume', FR: 'Arbres entretenus' } },
                        { v: '100%', l: { DE: 'Fundiertes Fachwissen', FR: 'Expertise approfondie' } },
                        { v: '100%', l: { DE: 'Einsatz & Sicherheit', FR: 'Engagement & Sécurité' } },
                    ].map((stat, idx) => (
                        <StatCounter key={idx} value={stat.v} label={stat.l} language={language} />
                    ))}
                </div>
            </section>
        </main>
    );
};

export default Services;
