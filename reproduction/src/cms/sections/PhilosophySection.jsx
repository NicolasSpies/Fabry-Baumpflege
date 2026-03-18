import React, { useRef } from 'react';
import { useParallax } from '@/cms/hooks/useParallax';


const PhilosophySection = ({ 
    label = "Unsere Philosophie", 
    quote = "Bäume sind das Gedächtnis der Erde.", 
    text = "Wir pflegen Ihre Bäume mit Leidenschaft und Fachverstand für eine grüne Zukunft.", 
    image 
}) => {

const heroPortraitRef = useRef(null);
    useParallax(heroPortraitRef, { speed: 0.08, maxTravel: 40, scale: 1.12 });

    return (
        <section className="relative lg:min-h-[calc(100vh-80px)] flex items-center py-20 lg:py-0 px-6 overflow-hidden bg-background-light dark:bg-background-dark">
            <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-20 items-center w-full">
                <div className="relative order-2 lg:order-1">
                    <div className="relative z-10 rounded-2xl overflow-hidden shadow-2xl reveal">
                        <img
                            ref={heroPortraitRef}
                            alt="Portrait"
                            className="w-full aspect-square object-cover"
                            src={image}
                            style={{ transition: 'none' }}
                        />
                    </div>
                    <div className="absolute -top-10 -left-10 w-40 h-40 bg-primary/10 rounded-full blur-3xl -z-10" />
                </div>
                <div className="text-left order-1 lg:order-2">
                    <span className="text-[#9bb221] font-bold tracking-widest uppercase text-xs mb-8 block reveal">
                        {label}
                    </span>
                    <h2 className="text-4xl md:text-5xl lg:text-6xl font-serif text-primary mb-12 leading-tight italic reveal stagger-1">
                        {quote}
                    </h2>
                    <p className="text-lg md:text-xl leading-relaxed text-slate-600 dark:text-slate-400 font-light reveal stagger-2">
                        {text}
                    </p>
                </div>
            </div>
        </section>
    );
};

export default PhilosophySection;
