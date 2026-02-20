import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../i18n/useLanguage';
import { useScrollReveal } from '../hooks/useScrollReveal';
import portrait from '../assets/images/vincent_portrait.png';
import baumpflegeImg from '../assets/images/services/baumpflege.png';
import baumfaellungImg from '../assets/images/services/baumfaellung.png';
import gartenpflegeImg from '../assets/images/services/gartenpflege.png';

const AboutMe = () => {
    const { language } = useLanguage();
    useScrollReveal();

    const [scrollY, setScrollY] = useState(0);
    useEffect(() => {
        const handleScroll = () => setScrollY(window.scrollY);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <main className="pt-32">
            {/* Philosophy Section with Portrait Overlap */}
            <section className="relative py-32 px-6 overflow-hidden" id="about">
                <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
                    <div className="relative order-2 lg:order-1">
                        <div className="relative z-10 rounded-2xl overflow-hidden shadow-2xl reveal">
                            <img
                                alt="Vincent Fabry"
                                className="w-full aspect-[3/4] object-cover"
                                src={portrait}
                                style={{
                                    transform: `translateY(${scrollY * -0.05}px)`,
                                    transition: 'transform 0.1s ease-out'
                                }}
                            />
                        </div>
                        {/* Decorative background element for depth */}
                        <div
                            className="absolute -top-10 -left-10 w-40 h-40 bg-primary/10 rounded-full blur-3xl"
                            style={{ transform: `translateY(${scrollY * 0.05}px)` }}
                        ></div>
                    </div>
                    <div className="text-left order-1 lg:order-2">
                        <span className="text-primary font-semibold tracking-[0.3em] uppercase text-xs mb-8 block reveal">
                            {language === 'DE' ? 'Die Philosophie' : 'La Philosophie'}
                        </span>
                        <h2 className="text-4xl md:text-5xl font-serif text-primary mb-12 leading-tight italic reveal stagger-1">
                            {language === 'DE' ? '"Ein Baum ist mehr als nur Holz. Er ist ein Vermächtnis."' : '"Un arbre est plus que du bois. C\'est un héritage."'}
                        </h2>
                        <p className="text-xl leading-relaxed text-slate-600 dark:text-slate-400 font-light reveal stagger-2">
                            {language === 'DE'
                                ? 'Mit Leidenschaft und Fachkenntnis klettere ich in die Kronen, um das Gleichgewicht zwischen urbaner Entwicklung und natürlichem Erhalt zu wahren. Meine Arbeit ist geprägt von tiefem Respekt vor der Vitalität jedes einzelnen Baumes.'
                                : 'C\'est avec passion et expertise que je grimpe dans les cimes pour maintenir l\'équilibre entre le développement urbain et la préservation naturelle. Mon travail est imprégné d\'un profond respect pour la vitalité de chaque arbre.'}
                        </p>
                    </div>
                </div>
            </section>

            {/* Image Grid with Offset */}
            <section className="pb-32 px-6">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                        {/* Column 1 */}
                        <div className="space-y-6 group">
                            <div className="aspect-[4/5] overflow-hidden rounded-xl bg-slate-100 shadow-xl">
                                <img
                                    alt="Detail Tree Care"
                                    className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700 scale-100 group-hover:scale-110"
                                    src={baumpflegeImg}
                                />
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-xl font-serif text-primary">
                                    {language === 'DE' ? 'Präzision' : 'Précision'}
                                </h3>
                                <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
                                    {language === 'DE'
                                        ? 'Jeder Schnitt folgt einer biologischen Notwendigkeit. Seilklettertechnik erlaubt uns, auch die sensibelsten Bereiche sicher zu erreichen.'
                                        : 'Chaque coupe suit une nécessité biologique. Les techniques de grimpe nous permettent d\'atteindre en toute sécurité même les zones les plus sensibles.'}
                                </p>
                            </div>
                        </div>

                        {/* Column 2 (Offset) */}
                        <div className="space-y-6 group md:mt-24 reveal stagger-1">
                            <div className="aspect-[4/5] overflow-hidden rounded-xl bg-slate-100 shadow-xl">
                                <img
                                    alt="Nature conservation"
                                    className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700 scale-100 group-hover:scale-110"
                                    src={baumfaellungImg}
                                />
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-xl font-serif text-primary">
                                    {language === 'DE' ? 'Nachhaltigkeit' : 'Durabilité'}
                                </h3>
                                <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
                                    {language === 'DE'
                                        ? 'Wir pflegen nicht nur für heute, sondern für die Generationen von morgen. Nachhaltiger Erhalt steht vor radikaler Fällung.'
                                        : 'Nous entretenons non seulement pour aujourd\'hui, mais pour les générations de demain. La préservation durable prime sur l\'abattage radical.'}
                                </p>
                            </div>
                        </div>

                        {/* Column 3 */}
                        <div className="space-y-6 group">
                            <div className="aspect-[4/5] overflow-hidden rounded-xl bg-slate-100 shadow-xl">
                                <img
                                    alt="Technical expert"
                                    className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700 scale-100 group-hover:scale-110"
                                    src={gartenpflegeImg}
                                />
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-xl font-serif text-primary">
                                    {language === 'DE' ? 'Expertise' : 'Expertise'}
                                </h3>
                                <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
                                    {language === 'DE'
                                        ? 'Zertifiziertes Fachwissen und modernste Ausrüstung garantieren höchste Sicherheit für Mensch und Baumumfeld.'
                                        : 'Une expertise certifiée et un équipement de pointe garantissent une sécurité maximale pour l\'homme et l\'environnement des arbres.'}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Signature Section */}
            <section className="py-32 bg-surface-light dark:bg-surface-dark/30 border-t border-slate-100 dark:border-slate-800" id="contact">
                <div className="max-w-4xl mx-auto px-6 text-center reveal">
                    <h2 className="text-4xl md:text-5xl font-serif text-primary mb-12">
                        {language === 'DE' ? 'Lass uns gemeinsam für deine Bäume sorgen.' : 'Prenons soin de vos arbres ensemble.'}
                    </h2>
                    <div className="mb-16 reveal stagger-1">
                        <p className="text-primary font-signature text-7xl md:text-9xl select-none leading-none">Fabry</p>
                        <p className="text-xs tracking-[0.4em] uppercase text-slate-400 mt-2">
                            {language === 'DE' ? 'Inhaber & Baumpfleger' : 'Propriétaire & Arboriculteur'}
                        </p>
                    </div>
                    <Link
                        to="/kontakt"
                        className="inline-flex items-center gap-4 bg-primary text-white px-12 py-5 rounded-full text-lg font-bold uppercase tracking-widest hover:bg-opacity-90 transition-all group shadow-xl reveal stagger-2"
                    >
                        {language === 'DE' ? 'Kontakt aufnehmen' : 'Prendre contact'}
                        <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">arrow_forward</span>
                    </Link>
                </div>
            </section>
        </main>
    );
};

export default AboutMe;
