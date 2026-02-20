import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../i18n/useLanguage';
import { useScrollReveal } from '../hooks/useScrollReveal';
import { useParallax } from '../hooks/useParallax';
import { references } from '../data/references';
import ReferenceCard from '../components/ReferenceCard';
import BaumpflegeIcon from '../components/BaumpflegeIcon';
import BaumfaellungIcon from '../components/BaumfaellungIcon';
import GartenpflegeIcon from '../components/GartenpflegeIcon';
import BepflanzungIcon from '../components/BepflanzungIcon';
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

import homeHeroImg from '../assets/images/hero/home_hero_highres.png';

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
            id: 'baumpflege'
        },
        {
            title: { DE: 'Baumfällung', FR: 'Abattage' },
            desc: { DE: 'Sichere Fällungen auch an schwierigen Standorten mittels Seilklettertechnik oder Hubsteiger.', FR: 'Abattage sécurisé même dans des endroits difficiles grâce à la grimpe ou à la nacelle.' },
            id: 'baumfaellung'
        },
        {
            title: { DE: 'Gartenpflege', FR: 'Entretien de jardin' },
            desc: { DE: 'Ganzheitliche Pflege für deinen Garten, von Hecke schneiden bis zur Rasenpflege.', FR: 'Entretien complet de votre jardin, de la taille des haies à la tonte de la pelouse.' },
            id: 'gartenpflege'
        },
        {
            title: { DE: 'Bepflanzung', FR: 'Plantation' },
            desc: { DE: 'Fachgerechte Neupflanzungen von Bäumen, Sträuchern und Stauden für nachhaltiges Grün.', FR: 'Plantations expertes d\'arbres, d\'arbustes et de vivaces pour une verdure durable.' },
            id: 'bepflanzung'
        },
    ];

    const testimonials = [
        {
            author: 'William Wehr',
            rating: 5,
            time: 'il y a 2 semaines',
            text: 'Travail effectué avec professionnalisme dans le respect des délais et du budget. A recommander à 100%.'
        },
        {
            author: 'Natascha Hilbrink',
            label: 'Local Guide',
            rating: 5,
            time: 'il y a 2 semaines',
            text: 'Nos travaux d’abattage d’arbres ont été réalisés avec le plus grand soin. Nous sommes pleinement satisfaits et recommandons Fabry Tree Care sans hésitation. Merci pour l’excellent travail !'
        }
    ];

    /* ── Marquee (pixel-per-second driven + touch drag) ── */
    const marqueeRef = useRef(null);
    const [marqueePaused, setMarqueePaused] = useState(false);
    const SPEED_PX_PER_SEC = 40;

    // Touch state refs to avoid re-triggering dependency array 
    const isDragging = useRef(false);
    const startX = useRef(0);
    const currentOffset = useRef(0);

    useEffect(() => {
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (prefersReducedMotion) return;

        let prevTimestamp = null;
        let rafId;

        const tick = (timestamp) => {
            if (prevTimestamp === null) prevTimestamp = timestamp;
            const delta = (timestamp - prevTimestamp) / 1000; // seconds
            prevTimestamp = timestamp;

            // Only auto-scroll if not hovered AND not currently dragging
            if (!marqueePaused && !isDragging.current && marqueeRef.current) {
                currentOffset.current += SPEED_PX_PER_SEC * delta;

                // Reset seamlessly at one-third of track width (one full set)
                const singleSetWidth = marqueeRef.current.scrollWidth / 3;
                if (singleSetWidth > 0 && currentOffset.current >= singleSetWidth) {
                    currentOffset.current -= singleSetWidth;
                }

                // Handle reverse drag loops
                if (singleSetWidth > 0 && currentOffset.current < 0) {
                    currentOffset.current += singleSetWidth;
                }

                marqueeRef.current.style.transform = `translate3d(-${currentOffset.current}px, 0, 0)`;
            }

            rafId = requestAnimationFrame(tick);
        };

        rafId = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(rafId);
    }, [marqueePaused]);

    // Touch Handlers
    const handleTouchStart = (e) => {
        isDragging.current = true;
        startX.current = e.touches[0].clientX;
    };

    const handleTouchMove = (e) => {
        if (!isDragging.current || !marqueeRef.current) return;

        const currentX = e.touches[0].clientX;
        const diffX = startX.current - currentX;

        // Update offset immediately for smooth drag
        currentOffset.current += diffX;
        marqueeRef.current.style.transform = `translate3d(-${currentOffset.current}px, 0, 0)`;

        // Reset startX for continuous calculation
        startX.current = currentX;
    };

    const handleTouchEnd = () => {
        isDragging.current = false;
        // The rAF loop will automatically pick up from the new currentOffset.current
    };

    const heroRef = useRef(null);
    const expertiseRef = useRef(null);
    useParallax(heroRef, { speed: 0.08, maxTravel: 40, scale: 1.1 });
    useParallax(expertiseRef, { speed: 0.04, maxTravel: 20, scale: 1.1 });

    return (
        <main>
            {/* Hero Section */}
            <section className="relative h-screen w-full overflow-hidden flex items-center">
                <div className="absolute inset-0 z-0">
                    <img
                        ref={heroRef}
                        alt="Professional tree work"
                        className="w-full h-full object-cover"
                        src={homeHeroImg}
                        style={{
                            transform: 'translate3d(0, 0, 0) scale(1.1)',
                            willChange: 'transform'
                        }}
                    />
                    {/* Refined subtle vertical gradient — lets more image through */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-black/10"></div>
                </div>
                <div className="relative z-10 max-w-7xl mx-auto px-6 w-full pt-32">
                    <div className="max-w-3xl space-y-5">
                        <h1 className="text-4xl md:text-6xl lg:text-7xl font-serif text-white leading-[1.1] reveal">
                            {language === 'DE' ? <>Präzision <br /><span className="text-white/90">trifft Natur</span></> : <>Précision <br /><span className="text-white/90">rencontre Nature</span></>}
                        </h1>
                        <p className="text-lg text-white/80 font-sans font-normal max-w-xl leading-relaxed reveal stagger-1">
                            {language === 'DE'
                                ? 'Nachhaltige Baumpflege und Fällarbeiten mit höchster Sorgfalt und Expertise. Für gesunde Bäume und sichere Gärten.'
                                : 'Entretien durable des arbres et abattages effectués avec le plus grand soin et expertise. Pour des arbres sains et des jardins sécurisés.'}
                        </p>
                        <div className="pt-6 reveal stagger-2">
                            <Link
                                to="/kontakt"
                                className="inline-block bg-[#3E5F25] text-white px-10 py-4 rounded-full font-bold tracking-widest uppercase text-sm hover:bg-[#2e471b] transition-all transform hover:-translate-y-0.5 shadow-md hover:shadow-lg"
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
                        <span className="text-[#9bb221] font-bold tracking-widest uppercase text-xs">
                            {language === 'DE' ? 'Unsere Expertise' : 'Notre Expertise'}
                        </span>
                        <h2 className="text-4xl md:text-5xl font-serif text-primary reveal">
                            {language === 'DE' ? 'Leistungen im Überblick' : 'Aperçu de nos Services'}
                        </h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {services.map((service, idx) => (
                            <div key={idx} className={`group p-8 rounded-2xl bg-white dark:bg-surface-dark border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-300 flex flex-col items-center text-center md:items-start md:text-left reveal stagger-${(idx % 4) + 1}`}>
                                <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mb-6 group-hover:bg-primary transition-colors">
                                    {service.id === 'baumpflege' ? (
                                        <BaumpflegeIcon className="w-7 h-7 flex items-center justify-center text-3xl text-primary group-hover:text-white transition-colors" />
                                    ) : service.id === 'baumfaellung' ? (
                                        <BaumfaellungIcon className="w-7 h-7 text-primary group-hover:text-white transition-colors" />
                                    ) : service.id === 'gartenpflege' ? (
                                        <GartenpflegeIcon className="w-7 h-7 flex items-center justify-center text-3xl text-primary group-hover:text-white transition-colors" />
                                    ) : service.id === 'bepflanzung' ? (
                                        <BepflanzungIcon className="w-7 h-7 flex items-center justify-center text-3xl text-primary group-hover:text-white transition-colors" />
                                    ) : (
                                        <span className="material-symbols-outlined text-3xl text-primary group-hover:text-white transition-colors">{service.icon}</span>
                                    )}
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
                        <span className="text-[#9bb221] font-bold tracking-widest uppercase text-xs">
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

            {/* Testimonials Section */}
            <section className="py-24 bg-background-light dark:bg-background-dark overflow-hidden">
                <div className="max-w-7xl mx-auto px-6 mb-16">
                    <div className="text-center space-y-4">
                        <span className="text-[#9bb221] font-bold tracking-widest uppercase text-xs">
                            {language === 'DE' ? 'Kundenstimmen' : 'Témoignages'}
                        </span>
                        <h2 className="text-4xl md:text-5xl font-serif text-primary reveal">
                            {language === 'DE' ? 'Was meine Kunden sagen' : 'Ce que disent nos clients'}
                        </h2>
                    </div>
                </div>

                <div className="relative">
                    <div className="overflow-hidden">
                        <div
                            ref={marqueeRef}
                            className="marquee-track gap-8 px-6 py-6"
                            style={{ touchAction: 'pan-y' }}
                            onMouseEnter={() => setMarqueePaused(true)}
                            onMouseLeave={() => setMarqueePaused(false)}
                            onTouchStart={handleTouchStart}
                            onTouchMove={handleTouchMove}
                            onTouchEnd={handleTouchEnd}
                        >
                            {/* Tripled list for infinite loop feel */}
                            {[...testimonials, ...testimonials, ...testimonials].map((t, idx) => (
                                <div
                                    key={idx}
                                    className="flex-shrink-0 w-[90vw] md:w-[450px] bg-white dark:bg-surface-dark p-8 md:p-10 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-lg hover:shadow-xl transition-shadow"
                                >
                                    <div className="flex items-center gap-1 text-amber-400 mb-4">
                                        {[...Array(t.rating)].map((_, i) => (
                                            <span key={i} className="material-symbols-outlined text-sm icon-fill">star</span>
                                        ))}
                                    </div>
                                    <p className="text-slate-700 dark:text-slate-300 italic mb-8 leading-relaxed font-sans">
                                        "{t.text}"
                                    </p>
                                    <div className="flex items-center justify-between border-t border-slate-50 dark:border-slate-800 pt-6">
                                        <div>
                                            <h4 className="font-serif text-primary text-lg">{t.author}</h4>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* About Section Teaser */}
            <section className="py-24 px-6 overflow-hidden bg-surface-light dark:bg-surface-dark/50" id="about">
                <div className="max-w-7xl mx-auto">
                    <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-24">
                        <div className="w-full lg:w-1/2 relative">
                            <div className="absolute -top-10 -left-10 w-64 h-64 bg-primary/5 dark:bg-primary/10 rounded-full blur-3xl -z-10"></div>
                            <div className="relative rounded-2xl overflow-hidden shadow-2xl group">
                                <img
                                    ref={expertiseRef}
                                    alt="Professional Arborist Climbing"
                                    className="w-full h-[650px] object-cover"
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
                                <span className="text-[#9bb221] font-bold tracking-widest uppercase text-xs block">
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
