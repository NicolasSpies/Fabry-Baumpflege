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
import baumpflegeImg from '../assets/images/hero/expertise_new.jpg';

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

import homeHeroImg from '../assets/images/hero/vincent-fabry-header3.jpg';

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

    /* ── Safari-Safe Marquee (Transform based with Drag) ── */
    const marqueeContainerRef = useRef(null);
    const marqueeTrackRef = useRef(null);
    const SPEED_PX_PER_SEC = 40;

    // Animation state kept in refs to avoid rerenders
    const offsetRef = useRef(0);
    const isHoveringRef = useRef(false);
    const isDraggingRef = useRef(false);
    const startXRef = useRef(0);
    const isPausedRef = useRef(false);

    useEffect(() => {
        const track = marqueeTrackRef.current;
        if (!track) return;

        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (prefersReducedMotion) return;

        let prevTimestamp = null;
        let rafId;

        const tick = (timestamp) => {
            if (prevTimestamp === null) prevTimestamp = timestamp;
            const deltaTime = (timestamp - prevTimestamp) / 1000;
            prevTimestamp = timestamp;

            if (!isHoveringRef.current && !isDraggingRef.current && !isPausedRef.current) {
                const singleSetWidth = track.scrollWidth / 2;

                if (singleSetWidth > 0) {
                    offsetRef.current += SPEED_PX_PER_SEC * deltaTime;

                    // Seamless midpoint reset for 2 sets
                    if (offsetRef.current >= singleSetWidth) {
                        offsetRef.current -= singleSetWidth;
                    } else if (offsetRef.current < 0) {
                        offsetRef.current += singleSetWidth;
                    }

                    track.style.transform = `translate3d(-${offsetRef.current}px, 0, 0)`;
                }
            }

            rafId = requestAnimationFrame(tick);
        };

        rafId = requestAnimationFrame(tick);

        // Visibility API to pause when off-screen/background tab
        const handleVisibilityChange = () => {
            isPausedRef.current = document.hidden;
            if (!document.hidden) prevTimestamp = null; // Reset delta on resume
        };
        document.addEventListener('visibilitychange', handleVisibilityChange);

        return () => {
            cancelAnimationFrame(rafId);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, []);

    useEffect(() => {
        // Intersection Observer to pause when section is out of view
        const observer = new IntersectionObserver((entries) => {
            isPausedRef.current = !entries[0].isIntersecting;
        }, { threshold: 0 });

        if (marqueeContainerRef.current) observer.observe(marqueeContainerRef.current);
        return () => observer.disconnect();
    }, []);

    // Pointer events for manual drag/swipe override
    const handlePointerDown = (e) => {
        isDraggingRef.current = true;
        startXRef.current = e.clientX;
    };

    const handlePointerMove = (e) => {
        if (!isDraggingRef.current) return;
        const track = marqueeTrackRef.current;
        if (!track) return;

        const deltaX = e.clientX - startXRef.current;
        startXRef.current = e.clientX;

        const singleSetWidth = track.scrollWidth / 2;
        offsetRef.current -= deltaX;

        // Boundary wrapping during drag
        if (offsetRef.current >= singleSetWidth) {
            offsetRef.current -= singleSetWidth;
        } else if (offsetRef.current < 0) {
            offsetRef.current += singleSetWidth;
        }

        track.style.transform = `translate3d(-${offsetRef.current}px, 0, 0)`;
    };

    const handlePointerUp = () => {
        isDraggingRef.current = false;
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
                        alt="Baumpfleger Vincent Fabry working in a tree"
                        className="w-full h-[120%] object-cover object-top filter brightness-[0.80] contrast-[1.05]"
                        src={homeHeroImg}
                    />
                    {/* Subtle gradient — reduced to let more image through */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent"></div>
                </div>
                {/* Desktop: asymmetric left-shifted, Mobile: vertically centered */}
                <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-10 w-full flex items-center h-full">
                    <div className="w-full md:max-w-2xl space-y-6 md:space-y-7 text-left flex flex-col items-start">
                        <h1 className="font-serif text-white leading-[0.95] md:leading-[0.95] reveal">
                            {language === 'DE' ? (
                                <>
                                    <span className="text-[1.5rem] md:text-[2.25rem] lg:text-[2.5rem] block mb-[0.125rem] md:mb-1 text-white/75 font-light tracking-wide">Präzision</span>
                                    <span className="text-[2.75rem] md:text-[5rem] lg:text-[6.5rem] font-bold block tracking-tight">trifft Natur</span>
                                </>
                            ) : (
                                <>
                                    <span className="text-[1.5rem] md:text-[2.25rem] lg:text-[2.5rem] block mb-[0.125rem] md:mb-1 text-white/75 font-light tracking-wide">Précision</span>
                                    <span className="text-[2.75rem] md:text-[5rem] lg:text-[6.5rem] font-bold block tracking-tight">rencontre Nature</span>
                                </>
                            )}
                        </h1>
                        <p className="text-[0.9375rem] md:text-base text-white/70 font-sans font-normal max-w-[250px] md:max-w-md leading-snug md:leading-relaxed reveal stagger-1">
                            {language === 'DE'
                                ? 'Nachhaltige Baumpflege und Fällarbeiten mit höchster Sorgfalt und Expertise. Für gesunde Bäume und sichere Gärten.'
                                : 'Entretien durable des arbres et abattages effectués avec le plus grand soin et expertise. Pour des arbres sains et des jardins sécurisés.'}
                        </p>
                        <div className="pt-2 md:pt-4 reveal stagger-2">
                            <Link
                                to="/kontakt"
                                className="inline-block bg-[#3E5F25] text-white px-8 py-3.5 rounded-full font-semibold tracking-widest uppercase text-xs hover:bg-[#2e471b] transition-all transform hover:-translate-y-0.5 shadow-md hover:shadow-lg"
                            >
                                {language === 'DE' ? 'Kostenloses Angebot' : 'Devis Gratuit'}
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="bg-white dark:bg-slate-900 py-16 md:py-20 border-b border-slate-100 dark:border-slate-800">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-12 md:gap-8">
                        {stats.map((stat, idx) => (
                            <StatCounter key={idx} value={stat.value} label={stat.label} language={language} />
                        ))}
                    </div>
                </div>
            </section>

            {/* Services Section */}
            <section className="py-24 md:py-32 px-6 bg-surface-light dark:bg-background-dark relative overflow-hidden" id="services">
                <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent"></div>
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16 md:mb-24 space-y-4">
                        <span className="text-[#9bb221] font-bold tracking-widest uppercase text-xs reveal">
                            {language === 'DE' ? 'Meine Expertise' : 'Mon Expertise'}
                        </span>
                        <h2 className="text-4xl md:text-5xl font-serif text-primary reveal stagger-1 leading-tight">
                            {language === 'DE' ? 'Professionelle Baumpflege' : 'Arboriculture professionnelle'} <br className="hidden md:block" />
                            {language === 'DE' ? 'auf höchstem Niveau' : 'au plus haut niveau'}
                        </h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 lg:gap-6">
                        {services.map((service, idx) => (
                            <Link
                                to={`/leistungen#${service.id}`}
                                key={idx}
                                className="group relative bg-white dark:bg-surface-dark rounded-[2rem] p-8 md:p-10 hover:-translate-y-2 transition-all duration-500 shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-800 overflow-hidden reveal flex flex-col h-full"
                                style={{ animationDelay: `${idx * 150}ms` }}
                            >
                                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 dark:bg-primary/10 rounded-full blur-3xl -mr-20 -mt-20 group-hover:bg-primary/10 transition-colors duration-500"></div>
                                <div className="relative z-10 flex flex-col flex-grow">
                                    <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800/50 flex items-center justify-center mb-6 text-[#3E5F25] group-hover:bg-[#3E5F25] group-hover:text-white transition-all duration-300">
                                        {idx === 0 && <BaumpflegeIcon className="w-6 h-6 fill-current" />}
                                        {idx === 1 && <BaumfaellungIcon className="w-6 h-6 fill-current" />}
                                        {idx === 2 && <GartenpflegeIcon className="w-6 h-6 fill-current" />}
                                        {idx === 3 && <BepflanzungIcon className="w-6 h-6 fill-current" />}
                                    </div>
                                    <h3 className="text-2xl font-serif text-primary mb-4 group-hover:text-[#3E5F25] dark:group-hover:text-primary transition-colors">{service.title[language]}</h3>
                                    <p className="text-slate-600 dark:text-slate-400 text-[0.9375rem] leading-relaxed font-sans mb-8 flex-grow">
                                        {service.desc[language]}
                                    </p>
                                    <div className="flex items-center text-primary font-bold text-xs tracking-[0.15em] uppercase mt-auto">
                                        <span className="mr-2 group-hover:mr-4 transition-all duration-300">
                                            {language === 'DE' ? 'Mehr erfahren' : 'En savoir plus'}
                                        </span>
                                        <span className="material-symbols-outlined text-base">arrow_forward</span>
                                    </div>
                                </div>
                            </Link>
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

                <div ref={marqueeContainerRef} className="relative">
                    {/* Generous vertical bounds so the shadow doesn't clip */}
                    <div
                        className="w-full relative -my-10 py-10 overflow-hidden cursor-grab active:cursor-grabbing"
                        onMouseEnter={() => isHoveringRef.current = true}
                        onMouseLeave={() => { isHoveringRef.current = false; isDraggingRef.current = false; }}
                        onPointerDown={handlePointerDown}
                        onPointerMove={handlePointerMove}
                        onPointerUp={handlePointerUp}
                        onPointerCancel={handlePointerUp}
                        style={{ touchAction: 'pan-y' }}
                    >
                        <div
                            ref={marqueeTrackRef}
                            className="flex flex-nowrap gap-8 px-6 w-max will-change-transform"
                        >
                            {/* Doubled list for infinite loop feel */}
                            {[...testimonials, ...testimonials].map((t, idx) => (
                                <div
                                    key={idx}
                                    className="flex-shrink-0 w-[90vw] md:w-[450px] bg-white dark:bg-surface-dark p-8 md:p-10 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-lg hover:shadow-xl transition-shadow pointer-events-none"
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
