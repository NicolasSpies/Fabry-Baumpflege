import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useParallax } from '@/cms/hooks/useParallax';
import CmsImage from '@/cms/components/ui/CmsImage';
import { renderCmsInline } from '@/cms/components/ui/CmsText';
import { isExternalHref } from '@/cms/bridge-resolver';

function renderTextWithBreaks(text) {
    if (!text) return null;
    return String(text)
        .replace(/\r\n/g, '\n')
        .replace(/<\/p>\s*<p>/gi, '\n\n')
        .replace(/<p[^>]*>/gi, '')
        .replace(/<\/p>/gi, '')
        .replace(/<br\s*\/?>/gi, '\n')
        .split('\n')
        .map((part, index, arr) => (
            <React.Fragment key={`${part}-${index}`}>
                {part}
                {index < arr.length - 1 ? <br /> : null}
            </React.Fragment>
        ));
}

const HeroSection = ({ title_top, title_main, description, cta, image, ctaHref, objectPosition = 'object-top' }) => {
    const heroRef = useRef(null);
    const [isImageReady, setIsImageReady] = useState(false);
    const imageKey = typeof image === 'string' ? image : image?.src || image?.url || image?.full?.url || '';
    const isMobile = typeof window !== 'undefined' ? window.innerWidth < 768 : false;
    useParallax(heroRef, { 
        speed: 0.08, 
        maxTravel: 40, 
        scale: 1.1,
        desktopOnly: false 
    });

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

    const isExternalCta = isExternalHref(ctaHref);

    return (
        <section className="relative h-[580px] md:h-[75vh] lg:h-screen w-full overflow-hidden flex items-center">
            <div className="absolute inset-0 z-0">
                <CmsImage
                    image={image}
                    ref={heroRef}
                    alt=""
                    size="1280"
                    className={`w-full h-full object-cover ${objectPosition === 'object-top' ? 'object-center-top scale-[1.4] md:scale-100 origin-left -translate-x-[100px] md:translate-x-0' : objectPosition} md:filter md:brightness-[0.80] md:contrast-[1.05] transition-all duration-700`}
                    sizes="(max-width: 768px) 100vw, 1280px"
                    loading="eager"
                    fetchPriority="high"
                    onLoad={() => setIsImageReady(true)}
                    onError={() => setIsImageReady(true)}
                />

                <div className={`absolute inset-0 bg-gradient-to-t from-black/65 via-black/20 to-transparent transition-opacity duration-500 ${isImageReady ? 'opacity-100' : 'opacity-0'}`} />
            </div>
            <div className={`relative z-10 max-w-7xl mx-auto px-6 md:px-10 w-full flex items-end md:items-center h-full pb-16 md:pb-0 md:pt-0 transition-[opacity,transform] duration-700 opacity-100 translate-y-0`}>
                <div className="w-full md:max-w-2xl space-y-4 md:space-y-7 text-left flex flex-col items-start min-h-[200px] md:min-h-[280px]">
                    <h1 className="font-serif text-white leading-tight md:leading-[0.95] hero-enter hero-enter-1">
                        <span className="block text-[1.8rem] md:text-[2.25rem] lg:text-[2.5rem] mb-1 md:mb-1 text-white/85 font-light tracking-wide italic">
                            {renderCmsInline(title_top)}
                        </span>
                        {' '}
                        <span className="block text-[3.25rem] md:text-[4rem] lg:text-[5rem] xl:text-[6.5rem] font-bold tracking-tight">
                            {renderCmsInline(title_main)}
                        </span>
                    </h1>
                    <p className="text-[0.875rem] md:text-[0.9375rem] lg:text-base text-white/75 font-sans font-normal max-w-[250px] md:max-w-sm lg:max-w-md leading-[1.5] md:leading-relaxed hero-enter hero-enter-2">
                        {renderTextWithBreaks(description)}
                    </p>
                    <div className="hidden md:block pt-4 hero-enter hero-enter-3">
                        {isExternalCta ? (
                            <a
                                href={ctaHref}
                                className="inline-block bg-[#395824] text-white px-8 py-3.5 rounded-full font-semibold tracking-widest uppercase text-xs hover:bg-[#2e471b] transition-all transform hover:-translate-y-0.5 shadow-md hover:shadow-lg"
                                target="_blank"
                                rel="noreferrer"
                            >
                                {cta}
                            </a>
                        ) : (
                            <Link
                                to={ctaHref}
                                className="inline-block bg-[#395824] text-white px-8 py-3.5 rounded-full font-semibold tracking-widest uppercase text-xs hover:bg-[#2e471b] transition-all transform hover:-translate-y-0.5 shadow-md hover:shadow-lg"
                            >
                                {cta}
                            </Link>
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default HeroSection;
