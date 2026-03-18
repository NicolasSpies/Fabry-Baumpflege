import React, { useRef } from 'react';
import { useParallax } from '@/cms/hooks/useParallax';


const PageHeroSection = ({ title, image }) => {

const heroRef = useRef(null);
    useParallax(heroRef, { speed: 0.08, maxTravel: 40, scale: 1.1 });

    return (
        <section className="relative h-[60vh] flex items-center justify-center pt-20 overflow-hidden">
            <img
                ref={heroRef}
                alt="Hero"
                className="absolute inset-0 w-full h-full object-cover"
                src={image}
            />
            <div className="absolute inset-0 bg-black/30" />
            <div className="relative z-10 text-center reveal">
                <h1 className="text-6xl md:text-7xl font-serif text-white">{title}</h1>
            </div>
        </section>
    );
};

export default PageHeroSection;
