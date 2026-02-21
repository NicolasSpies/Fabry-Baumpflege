import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../i18n/useLanguage';
import { useScrollReveal } from '../hooks/useScrollReveal';
import BaumpflegeIcon from '../components/BaumpflegeIcon';
import BaumfaellungIcon from '../components/BaumfaellungIcon';
import GartenpflegeIcon from '../components/GartenpflegeIcon';
import BepflanzungIcon from '../components/BepflanzungIcon';
import { useParallax } from '../hooks/useParallax';
import baumpflegeImg from '../assets/images/services/baumpflege.png';
import baumfaellungImg from '../assets/images/services/baumfaellung.png';
import gartenpflegeImg from '../assets/images/services/gartenpflege.png';
import wurzelnImg from '../assets/images/services/wurzeln.png';
import servicesHeroImg from '../assets/images/hero/services_hero.png';

const StatCounter = ({ value, labelKey, t }) => {
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
            <div className="text-xs md:text-sm text-[#9bb221] uppercase tracking-widest font-medium">
                {t(labelKey)}
            </div>
        </div>
    );
};

const ServiceImage = ({ src, alt }) => {
    const ref = useRef(null);
    useParallax(ref, { speed: 0.04, maxTravel: 20, scale: 1.1 });
    return (
        <img
            ref={ref}
            alt={alt}
            className="w-full h-full object-cover"
            src={src}
        />
    );
};

const Services = () => {
    const { language, t } = useLanguage();
    useScrollReveal();

    const servicesList = [
        {
            titleKey: 'services.baumpflege.title',
            id: 'baumpflege',
            descKey: 'services.baumpflege.desc',
            featuresKey: 'services.baumpflege.features',
            image: baumpflegeImg,
            reverse: false
        },
        {
            titleKey: 'services.baumfaellung.title',
            descKey: 'services.baumfaellung.desc',
            featuresKey: 'services.baumfaellung.features',
            image: baumfaellungImg,
            reverse: true,
            id: 'baumfaellung'
        },
        {
            titleKey: 'services.gartenpflege.title',
            id: 'gartenpflege',
            descKey: 'services.gartenpflege.desc',
            featuresKey: 'services.gartenpflege.features',
            image: gartenpflegeImg,
            reverse: false
        },
        {
            titleKey: 'services.bepflanzung.title',
            id: 'bepflanzung',
            descKey: 'services.bepflanzung.desc',
            featuresKey: 'services.bepflanzung.features',
            image: wurzelnImg,
            reverse: true,
            bg: true
        }
    ];

    const heroRef = useRef(null);
    useParallax(heroRef, { speed: 0.08, maxTravel: 40, scale: 1.1 });

    return (
        <main>
            <section className="relative h-[60vh] flex items-center justify-center pt-20 overflow-hidden">
                <img
                    ref={heroRef}
                    alt="Services Hero"
                    className="absolute inset-0 w-full h-full object-cover"
                    src={servicesHeroImg}
                />
                <div className="absolute inset-0 bg-black/30"></div>
                <div className="relative z-10 text-center reveal">
                    <h1 className="text-6xl md:text-7xl font-serif text-white">
                        {t('nav.services')}
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
                                    <div className="relative rounded-xl overflow-hidden shadow-2xl reveal h-[500px]">
                                        <ServiceImage src={service.image} alt={t(service.titleKey)} />
                                    </div>
                                </div>
                                <div className="w-full lg:w-1/2 space-y-8 reveal stagger-1">
                                    <div className="space-y-6">
                                        {service.id === 'baumpflege' ? (
                                            <BaumpflegeIcon className="w-16 h-16 flex items-center justify-center text-6xl text-primary" />
                                        ) : service.id === 'baumfaellung' ? (
                                            <BaumfaellungIcon className="w-16 h-16 text-primary" />
                                        ) : service.id === 'gartenpflege' ? (
                                            <GartenpflegeIcon className="w-16 h-16 flex items-center justify-center text-6xl text-primary" />
                                        ) : service.id === 'bepflanzung' ? (
                                            <BepflanzungIcon className="w-16 h-16 flex items-center justify-center text-6xl text-primary" />
                                        ) : (
                                            <span className="material-symbols-outlined text-primary text-6xl font-light">{service.icon}</span>
                                        )}
                                        <h2 className="text-4xl font-serif text-primary leading-tight font-medium">{t(service.titleKey)}</h2>
                                    </div>
                                    <p className="text-lg leading-relaxed text-slate-600 dark:text-slate-400">
                                        {t(service.descKey)}
                                    </p>
                                    <ul className="space-y-3">
                                        {(t(service.featuresKey) || []).map((feature, fIdx) => (
                                            <li key={fIdx} className="flex items-center gap-3">
                                                <span className="material-symbols-outlined text-[#9bb221]">check_circle</span>
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
                        { v: '500+', k: 'stats.clients' },
                        { v: '2500+', k: 'stats.trees' },
                        { v: '100%', k: 'stats.expertise' },
                        { v: '100%', k: 'stats.safety' },
                    ].map((stat, idx) => (
                        <StatCounter key={idx} value={stat.v} labelKey={stat.k} t={t} />
                    ))}
                </div>
            </section>
        </main>
    );
};

export default Services;
