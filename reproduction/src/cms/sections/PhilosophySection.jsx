import React, { useRef } from 'react';
import { useParallax } from '@/cms/hooks/useParallax';
import { useSoftEntrance } from '@/cms/hooks/useSoftEntrance';
import CmsImage from '@/cms/components/ui/CmsImage';
import CmsText, { renderCmsInline } from '@/cms/components/ui/CmsText';


const PhilosophySection = ({ 
    label,
    quote,
    text,
    image 
}) => {
    const sectionRef = useRef(null);
    const heroPortraitRef = useRef(null);
    useSoftEntrance(sectionRef, { staggerDelayMs: 110, durationMs: 720 });
    useParallax(heroPortraitRef, { 
        speed: 0.12, 
        maxTravel: 60, 
        scale: 1.25,
        desktopOnly: true 
    });

    return (
        <section className="relative lg:min-h-[calc(100vh-80px)] flex items-center py-10 md:py-20 lg:py-0 px-6 overflow-hidden bg-background-light dark:bg-background-dark">
            <div ref={sectionRef} className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-16 lg:gap-20 items-center w-full">
                <div className="relative order-2 lg:order-1 soft-entrance-item">
                    <div className="relative z-10 rounded-xl overflow-hidden shadow-sm md:shadow-2xl aspect-square sm:h-[21rem] md:aspect-auto md:h-[min(78vw,32rem)] lg:h-[38rem]">
                        <CmsImage
                            image={image}
                            ref={heroPortraitRef}
                            alt=""
                            className="w-full h-full object-cover"
                            sizes="(max-width: 1024px) 100vw, 50vw"
                            loading="eager"
                            fetchPriority="high"
                            style={{ transition: 'none' }}
                        />
                    </div>
                    <div className="absolute -top-10 -left-10 hidden md:block w-40 h-40 bg-primary/10 rounded-full blur-3xl -z-10" />
                </div>
                <div className="text-left order-1 lg:order-2 soft-entrance-item">
                    <h1 className="text-[2.1rem] sm:text-5xl lg:text-6xl font-serif text-primary mb-5 md:mb-12 leading-[1.02] italic">
                        <CmsText text={quote} className="space-y-2" paragraphClassName="leading-[1.02]" />
                    </h1>
                    <CmsText
                        text={text}
                        className="max-w-[34rem] space-y-4 text-slate-600 dark:text-slate-400 font-light"
                        paragraphClassName="text-base leading-[1.7]"
                    />
                </div>
            </div>
        </section>
    );
};

export default PhilosophySection;
