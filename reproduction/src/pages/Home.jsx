import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../i18n/useLanguage';
import { useScrollReveal } from '../hooks/useScrollReveal';
import { useParallax } from '../hooks/useParallax';
import { references } from '../data/references';
import ReferenceCard from '../components/ReferenceCard';
import baumpflegeImg from '../assets/images/services/baumpflege.png';

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
        <div ref={countRef} className="text-center px-4 reveal">
            <div className="text-4xl md:text-5xl font-serif text-primary mb-2">
                {count}{value.includes('+') ? '+' : value.includes('%') ? '%' : ''}
            </div>
            <div className="text-xs md:text-sm text-slate-500 uppercase tracking-widest font-medium">
                {label[language]}
            </div>
        </div>
    );
};

const Home = () => {
    const { language } = useLanguage();
    useScrollReveal();

    const stats = [
        { value: '500+', label: { DE: 'Zufriedene Kunden', FR: 'Clients satisfaits' } },
        { value: '2500+', label: { DE: 'Gepflegte Bäume', FR: 'Arbres entretenus' } },
        { value: '100%', label: { DE: 'Fundiertes Fachwissen', FR: 'Expertise approfondie' } },
        { value: '100%', label: { DE: 'Einsatz & Sicherheit', FR: 'Engagement & Sécurité' } },
    ];

    const services = [
        {
            title: { DE: 'Baumpflege', FR: 'Arboriculture' },
            desc: { DE: 'Kronenpflege, Totholzentfernung und Lichtraumprofilschnitt für die Gesundheit deiner Bäume.', FR: 'Taille de la couronne, enlèvement du bois mort et taille de profil pour la santé de vos arbres.' },
            icon: 'park',
            id: 'baumpflege'
        },
        {
            title: { DE: 'Baumfällung', FR: 'Abattage' },
            desc: { DE: 'Sichere Fällungen auch an schwierigen Standorten mittels Seilklettertechnik oder Hubsteiger.', FR: 'Abattage sécurisé même dans des endroits difficiles grâce à la grimpe ou à la nacelle.' },
            icon: 'forest',
            id: 'baumfaellung'
        },
        {
            title: { DE: 'Gartenpflege', FR: 'Entretien de jardin' },
            desc: { DE: 'Ganzheitliche Pflege für deinen Garten, von Hecke schneiden bis zur Rasenpflege.', FR: 'Entretien complet de votre jardin, de la taille des haies à la tonte de la pelouse.' },
            icon: 'yard',
            id: 'gartenpflege'
        },
        {
            title: { DE: 'Bepflanzung', FR: 'Plantation' },
            desc: { DE: 'Fachgerechte Neupflanzungen von Bäumen, Sträuchern und Stauden für nachhaltiges Grün.', FR: 'Plantations expertes d\'arbres, d\'arbustes et de vivaces pour une verdure durable.' },
            icon: 'potted_plant',
            id: 'bepflanzung'
        },
    ];

    const heroRef = useRef(null);
    useParallax(heroRef, { speed: 0.2, scaleBase: 1.1, scaleSpeed: 0.0002 });

    return (
        <main>
            {/* Hero Section */}
            <section className="relative h-screen w-full overflow-hidden flex items-center">
                <div className="absolute inset-0 z-0">
                    <img
                        ref={heroRef}
                        alt="Professional tree work"
                        className="w-full h-full object-cover"
                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuCKWkuceu9VZWOD9mKiRLyewvI7P3g4WSt4KcxdFVfkfQehbCUL6Uybyf9OClVUkICnp1gw08a07G5aj8gos3IJcp84FdxC50xMYpSd2qVlY3QmubVByqpv7PS53aO44xZ_NwCJNg55mmnndIiMoMO7P3P89_1CQklbcu2kOoolomCv8mJdnG_BJKC_slopZSLtQuKBQbJ0VSeQKPXPpxg0sayypaz-apH-zqTY35IrZaKPB1aPu-y5_P9t7ZrDlZw9ZLbgtxiX4MWM"
                        style={{
                            transform: 'translate3d(0, 0, 0) scale(1.1)',
                            willChange: 'transform'
                        }}
                    />
                    {/* Modern cinematic radial/depth overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/30 to-transparent"></div>
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-black/40 via-transparent to-transparent opacity-70"></div>
                </div>
                <div className="relative z-10 max-w-7xl mx-auto px-6 w-full pt-20">
                    <div className="max-w-3xl space-y-6">
                        <h1 className="text-5xl md:text-7xl lg:text-8xl font-serif text-white leading-tight drop-shadow-sm reveal">
                            {language === 'DE' ? <>Präzision <br /><span className="italic text-white/90">trifft Natur</span></> : <>Précision <br /><span className="italic text-white/90">rencontre Nature</span></>}
                        </h1>
                        <p className="text-xl text-white/95 font-sans max-w-xl leading-[1.7] drop-shadow-md reveal stagger-1">
                            {language === 'DE'
                                ? 'Nachhaltige Baumpflege und Fällarbeiten mit höchster Sorgfalt und Expertise. Für gesunde Bäume und sichere Gärten.'
                                : 'Entretien durable des arbres et abattages effectués avec le plus grand soin et expertise. Pour des arbres sains et des jardins sécurisés.'}
                        </p>
                        <div className="pt-8 reveal stagger-2">
                            <Link
                                to="/kontakt"
                                className="inline-block bg-[#3E5F25] text-white px-10 py-4 rounded-full font-bold tracking-widest uppercase text-sm hover:bg-[#2e471b] transition-all transform hover:-translate-y-1 shadow-xl"
                            >
                                {language === 'DE' ? 'Kostenloses Angebot' : 'Devis Gratuit'}
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="py-16 bg-surface-light dark:bg-surface-dark border-b border-slate-100 dark:border-slate-800">
                <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 divide-x divide-slate-200 dark:divide-slate-700/50">
                    {stats.map((stat, idx) => (
                        <StatCounter key={idx} value={stat.value} label={stat.label} language={language} />
                    ))}
                </div>
            </section>

            {/* Services Section */}
            <section className="py-24 px-6 bg-background-light dark:bg-background-dark" id="services">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-20 space-y-4">
                        <span className="text-primary font-bold tracking-widest uppercase text-xs">
                            {language === 'DE' ? 'Unsere Expertise' : 'Notre Expertise'}
                        </span>
                        <h2 className="text-4xl md:text-5xl font-serif text-primary reveal">
                            {language === 'DE' ? 'Leistungen im Überblick' : 'Aperçu de nos Services'}
                        </h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {services.map((service, idx) => (
                            <div key={idx} className={`group p-8 rounded-2xl bg-white dark:bg-surface-dark border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-300 reveal stagger-${(idx % 4) + 1}`}>
                                <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mb-6 group-hover:bg-primary transition-colors">
                                    <span className="material-symbols-outlined text-3xl text-primary group-hover:text-white transition-colors">{service.icon}</span>
                                </div>
                                <h3 className="text-xl font-serif text-primary mb-3">{service.title[language]}</h3>
                                <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed mb-6">
                                    {service.desc[language]}
                                </p>
                                <Link
                                    to={`/leistungen#${service.id}`}
                                    className="inline-flex items-center text-xs font-bold uppercase tracking-widest text-primary hover:text-primary-dark"
                                >
                                    <span className="underline-anim">
                                        {language === 'DE' ? 'Mehr erfahren' : 'En savoir plus'}
                                    </span>
                                    <span className="material-symbols-outlined text-sm ml-1">arrow_forward</span>
                                </Link>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* References Preview Section */}
            <section className="py-24 px-6 bg-surface-light dark:bg-surface-dark/50" id="references-preview">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-20 space-y-4">
                        <span className="text-primary font-bold tracking-widest uppercase text-xs">
                            {language === 'DE' ? 'Ausgewählte Projekte' : 'Projets Sélectionnés'}
                        </span>
                        <h2 className="text-4xl md:text-5xl font-serif text-primary reveal">
                            {language === 'DE' ? 'Neueste Referenzen' : 'Dernières Références'}
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {references.slice(0, 3).map((project) => (
                            <ReferenceCard key={project.id} project={project} language={language} forceSquare={true} />
                        ))}
                    </div>

                    <div className="mt-16 text-center reveal">
                        <Link
                            to="/referenzen"
                            className="inline-flex items-center gap-3 px-10 py-4 border-2 border-primary text-primary font-bold rounded-full hover:bg-primary hover:text-white transition-all duration-300 uppercase tracking-widest text-xs"
                        >
                            {language === 'DE' ? 'Alle Referenzen ansehen' : 'Voir toutes les références'}
                            <span className="material-symbols-outlined">arrow_forward</span>
                        </Link>
                    </div>
                </div>
            </section>

            {/* About Section Teaser */}
            <section className="py-24 px-6 overflow-hidden bg-background-light dark:bg-background-dark" id="about">
                <div className="max-w-7xl mx-auto">
                    <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-24">
                        <div className="w-full lg:w-1/2 relative">
                            <div className="absolute -top-10 -left-10 w-64 h-64 bg-primary/5 dark:bg-primary/10 rounded-full blur-3xl -z-10"></div>
                            <div className="relative rounded-2xl overflow-hidden shadow-2xl group">
                                <img
                                    alt="Professional Arborist Climbing"
                                    className="w-full h-[650px] object-cover transition-transform duration-700 group-hover:scale-105"
                                    src={baumpflegeImg}
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent p-10 flex items-end">
                                    <p className="text-white italic font-serif text-2xl border-l-4 border-primary pl-4 drop-shadow-lg">
                                        {language === 'DE' ? '"Qualität, die über Generationen wächst."' : '"La qualité qui grandit au fil des générations."'}
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="w-full lg:w-1/2 space-y-10">
                            <div className="space-y-4">
                                <span className="text-primary font-bold tracking-widest uppercase text-xs block">
                                    {language === 'DE' ? 'Tradition trifft Präzision' : 'Tradition rencontre Précision'}
                                </span>
                                <h2 className="text-4xl md:text-5xl font-serif text-primary leading-tight reveal">
                                    {language === 'DE' ? 'Expertise in jedem Astschlag' : 'Expertise dans chaque coupe d\'onglet'}
                                </h2>
                            </div>
                            <p className="text-lg leading-[1.8] text-slate-700 dark:text-slate-300 font-sans">
                                {language === 'DE'
                                    ? 'Mit Leidenschaft und Fachkenntnis widmet sich Fabry Baumpflege dem Erhalt und der Pflege urbaner Naturräume. Ich verstehe Bäume nicht nur als Gestaltungselemente, sondern als wertvolle Lebewesen.'
                                    : 'Avec passion et expertise, Fabry Baumpflege se consacre à la préservation et à l\'entretien des espaces naturels urbains. Je considère les arbres non seulement comme des éléments de conception, mais comme des êtres vivants précieux.'}
                            </p>
                            <div className="pt-4">
                                <Link
                                    to="/über-mich"
                                    className="inline-flex items-center gap-2 text-primary font-bold hover:gap-4 transition-all group border-b border-primary/30 pb-1 hover:border-primary"
                                >
                                    {language === 'DE' ? 'Erfahre mehr über mich' : 'En savoir plus sur moi'}
                                    <span className="material-symbols-outlined text-lg group-hover:translate-x-1 transition-transform">arrow_forward</span>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </main>
    );
};

export default Home;
