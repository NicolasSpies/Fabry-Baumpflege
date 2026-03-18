import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import { useParallax } from '@/cms/hooks/useParallax';

const HeroSection = ({ title_top, title_main, description, cta, image, ctaHref }) => {

const heroRef = useRef(null);
    useParallax(heroRef, { speed: 0.08, maxTravel: 40, scale: 1.1 });

    return (
        <section className="relative h-screen w-full overflow-hidden flex items-center">
            <div className="absolute inset-0 z-0">
                <img
                    ref={heroRef}
                    alt="Hero"
                    className="w-full h-[120%] object-cover object-top filter brightness-[0.80] contrast-[1.05]"
                    src={image}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />
            </div>
            <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-10 w-full flex items-center h-full">
                <div className="w-full md:max-w-2xl space-y-6 md:space-y-7 text-left flex flex-col items-start">
                    <h1 className="font-serif text-white leading-[0.95] md:leading-[0.95] reveal">
                        <span className="text-[1.5rem] md:text-[2.25rem] lg:text-[2.5rem] block mb-[0.125rem] md:mb-1 text-white/75 font-light tracking-wide">
                            {title_top}
                        </span>
                        <span className="text-[2.75rem] md:text-[5rem] lg:text-[6.5rem] font-bold block tracking-tight">
                            {title_main}
                        </span>
                    </h1>
                    <p className="text-[0.9375rem] md:text-base text-white/70 font-sans font-normal max-w-[250px] md:max-w-md leading-snug md:leading-relaxed reveal stagger-1">
                        {description}
                    </p>
                    <div className="pt-2 md:pt-4 reveal stagger-2">
                        <Link
                            to={ctaHref}
                            className="inline-block bg-[#3E5F25] text-white px-8 py-3.5 rounded-full font-semibold tracking-widest uppercase text-xs hover:bg-[#2e471b] transition-all transform hover:-translate-y-0.5 shadow-md hover:shadow-lg"
                        >
                            {cta}
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default HeroSection;
