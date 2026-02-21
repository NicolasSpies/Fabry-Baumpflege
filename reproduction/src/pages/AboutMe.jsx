import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../i18n/useLanguage';
import { useScrollReveal } from '../hooks/useScrollReveal';
import { useParallax } from '../hooks/useParallax';
import { ROUTES } from '../i18n/routes';
import portrait from '../assets/images/vincent_portrait.png';
import baumpflegeImg from '../assets/images/services/baumpflege.png';
import baumfaellungImg from '../assets/images/services/baumfaellung.png';
import gartenpflegeImg from '../assets/images/services/gartenpflege.png';

const ParallaxImage = ({ src, alt, className = "", speed = 0.04, maxTravel = 24 }) => {
    const ref = useRef(null);
    useParallax(ref, { speed, maxTravel, scale: 1.15 });
    return (
        <img
            ref={ref}
            alt={alt}
            className={`w-full h-full object-cover ${className}`}
            src={src}
        />
    );
};

const AboutMe = () => {
    const { language, t } = useLanguage();
    useScrollReveal();

    const heroPortraitRef = useRef(null);
    useParallax(heroPortraitRef, { speed: 0.08, maxTravel: 40, scale: 1.12 });

    return (
        <main className="pt-20">
            {/* Philosophy Section - Desktop Hero (100vh) */}
            <section className="relative lg:min-h-[calc(100vh-80px)] flex items-center py-20 lg:py-0 px-6 overflow-hidden bg-background-light dark:bg-background-dark" id="about">
                <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-20 items-center w-full">
                    <div className="relative order-2 lg:order-1">
                        <div className="relative z-10 rounded-2xl overflow-hidden shadow-2xl reveal">
                            <img
                                ref={heroPortraitRef}
                                alt="Vincent Fabry"
                                className="w-full aspect-square object-cover"
                                src={portrait}
                                style={{ transition: 'none' }}
                            />
                        </div>
                        {/* Decorative background element for depth */}
                        <div
                            className="absolute -top-10 -left-10 w-40 h-40 bg-primary/10 rounded-full blur-3xl -z-10"
                        ></div>
                    </div>
                    <div className="text-left order-1 lg:order-2">
                        <span className="text-[#9bb221] font-bold tracking-widest uppercase text-xs mb-8 block reveal">
                            {t('aboutme.philosophy.label')}
                        </span>
                        <h2 className="text-4xl md:text-5xl lg:text-6xl font-serif text-primary mb-12 leading-tight italic reveal stagger-1">
                            {t('aboutme.philosophy.quote')}
                        </h2>
                        <p className="text-lg md:text-xl leading-relaxed text-slate-600 dark:text-slate-400 font-light reveal stagger-2">
                            {t('aboutme.philosophy.text')}
                        </p>
                    </div>
                </div>
            </section>

            {/* Image Grid with Offset - Increased spacing from hero */}
            <section className="py-24 lg:py-32 px-6">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                        {/* Column 1 */}
                        <div className="space-y-6 group">
                            <div className="aspect-[4/5] overflow-hidden rounded-xl bg-slate-100 shadow-xl">
                                <ParallaxImage
                                    src={baumpflegeImg}
                                    alt="Detail Tree Care"
                                    speed={0.02}
                                    maxTravel={20}
                                    className="grayscale hover:grayscale-0 transition-opacity duration-700 scale-[1.05]"
                                />
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-xl font-serif text-primary">
                                    {t('aboutme.values.precision.title')}
                                </h3>
                                <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
                                    {t('aboutme.values.precision.text')}
                                </p>
                            </div>
                        </div>

                        {/* Column 2 (Offset) */}
                        <div className="space-y-6 group md:mt-24 reveal stagger-1">
                            <div className="aspect-[4/5] overflow-hidden rounded-xl bg-slate-100 shadow-xl">
                                <ParallaxImage
                                    src={baumfaellungImg}
                                    alt="Nature conservation"
                                    speed={0.06}
                                    maxTravel={40}
                                    className="grayscale hover:grayscale-0 transition-opacity duration-700 scale-[1.05]"
                                />
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-xl font-serif text-primary">
                                    {t('aboutme.values.sustainability.title')}
                                </h3>
                                <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
                                    {t('aboutme.values.sustainability.text')}
                                </p>
                            </div>
                        </div>

                        {/* Column 3 */}
                        <div className="space-y-6 group">
                            <div className="aspect-[4/5] overflow-hidden rounded-xl bg-slate-100 shadow-xl">
                                <ParallaxImage
                                    src={gartenpflegeImg}
                                    alt="Technical expert"
                                    speed={0.10}
                                    maxTravel={60}
                                    className="grayscale hover:grayscale-0 transition-opacity duration-700 scale-[1.05]"
                                />
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-xl font-serif text-primary">
                                    {t('aboutme.values.expertise.title')}
                                </h3>
                                <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
                                    {t('aboutme.values.expertise.text')}
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
                        {t('aboutme.signature.title')}
                    </h2>
                    <div className="mb-16 reveal stagger-1">
                        <p className="text-primary font-signature text-5xl md:text-8xl select-none leading-none whitespace-nowrap">Vincent Fabry</p>
                        <p className="text-[10px] tracking-[0.4em] uppercase text-slate-400 mt-6 font-bold">
                            {t('aboutme.signature.label')}
                        </p>
                    </div>
                    <Link
                        to={ROUTES[language].contact}
                        className="inline-flex items-center gap-4 bg-primary text-white px-12 py-5 rounded-full text-lg font-bold uppercase tracking-widest hover:bg-opacity-90 transition-all group shadow-xl reveal stagger-2"
                    >
                        {t('aboutme.signature.cta')}
                        <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">arrow_forward</span>
                    </Link>
                </div>
            </section>
        </main>
    );
};

export default AboutMe;
