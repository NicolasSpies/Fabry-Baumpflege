import React, { useEffect, useRef, useState } from 'react';
import { useParallax } from '@/cms/hooks/useParallax';
import CmsImage from '@/cms/components/ui/CmsImage';


const PageHeroSection = ({ title, image }) => {
    const heroRef = useRef(null);
    const [isImageReady, setIsImageReady] = useState(false);
    const imageKey = typeof image === 'string' ? image : image?.src || image?.url || image?.full?.url || '';
    useParallax(heroRef, { speed: 0.08, maxTravel: 40, scale: 1.1 });

    useEffect(() => {
        setIsImageReady(false);
        if (!imageKey) {
            setIsImageReady(true);
            return undefined;
        }

        const timeoutId = window.setTimeout(() => {
            setIsImageReady(true);
        }, 80);

        return () => window.clearTimeout(timeoutId);
    }, [imageKey]);

    return (
        <section className="relative h-[38svh] min-h-[15rem] md:h-[60vh] flex items-end md:items-center justify-center pt-20 pb-6 md:pb-0 overflow-hidden">
            <CmsImage
                image={image}
                ref={heroRef}
                alt=""
                className="absolute inset-0 w-full h-full object-cover"
                sizes="100vw"
                loading="eager"
                fetchPriority="high"
                onLoad={() => setIsImageReady(true)}
                onError={() => setIsImageReady(true)}
            />
            <div className={`absolute inset-0 bg-black/30 transition-opacity duration-500 ${isImageReady ? 'opacity-100' : 'opacity-0'}`} />
            <div className={`relative z-10 text-center reveal transition-[opacity,transform] duration-500 ${isImageReady ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3 pointer-events-none'}`}>
                <h1 className="text-4xl md:text-7xl font-serif text-white">{title}</h1>
            </div>
        </section>
    );
};

export default PageHeroSection;
