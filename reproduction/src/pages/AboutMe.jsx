import { useEffect, useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Link } from 'react-router-dom';
import { useScrollReveal } from '../hooks/useScrollReveal';

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
        <main className="pt-20">
            {/* Cinematic Hero */}
            <section className="relative h-[85vh] flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 z-0">
                    <img
                        alt="Arborist working"
                        className="w-full h-full object-cover"
                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuCKWkuceu9VZWOD9mKiRLyewvI7P3g4WSt4KcxdFVfkfQehbCUL6Uybyf9OClVUkICnp1gw08a07G5aj8gos3IJcp84FdxC50xMYpSd2qVlY3QmubVByqpv7PS53aO44xZ_NwCJNg55mmnndIiMoMO7P3P89_1CQklbcu2kOoolomCv8mJdnG_BJKC_slopZSLtQuKBQbJ0VSeQKPXPpxg0sayypaz-apH-zqTY35IrZaKPB1aPu-y5_P9t7ZrDlZw9ZLbgtxiX4MWM"
                        style={{
                            transform: `scale(${1.1 + scrollY * 0.0002}) translateY(${scrollY * 0.2}px)`,
                            transition: 'transform 0.1s ease-out'
                        }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/20 to-transparent"></div>
                </div>
                <div className="relative z-10 text-center text-white px-6 reveal">
                    <h1 className="text-6xl md:text-8xl font-serif mb-6 drop-shadow-2xl">
                        {language === 'DE' ? 'Leidenschaft in den Wipfeln' : 'La passion dans les cimes'}
                    </h1>
                    <p className="text-xl md:text-2xl font-light tracking-[0.4em] uppercase opacity-90 drop-shadow-lg">
                        Fabry Baumpflege
                    </p>
                </div>
                <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce">
                    <span className="material-symbols-outlined text-white text-4xl">expand_more</span>
                </div>
            </section>

            {/* Philosophy Section with Portrait Overlap */}
            <section className="relative py-32 px-6 overflow-hidden" id="about">
                <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
                    <div className="relative order-2 lg:order-1">
                        <div className="relative z-10 rounded-2xl overflow-hidden shadow-2xl reveal">
                            <img
                                alt="Vincent Fabry"
                                className="w-full aspect-[3/4] object-cover"
                                src="/src/assets/images/vincent_portrait.png"
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
                                    src="/src/assets/images/services/baumpflege.png"
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
                                    src="/src/assets/images/services/baumfaellung.png"
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
                                    src="/src/assets/images/services/gartenpflege.png"
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
