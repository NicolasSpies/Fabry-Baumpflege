import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useParallax } from '@/cms/hooks/useParallax';
import CmsImage from '@/cms/components/ui/CmsImage';
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

const HeroSection = ({ title_top, title_main, description, cta, image, ctaHref }) => {
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

    const isExternalCta = isExternalHref(ctaHref);

    return (
        <section className="relative h-[82svh] min-h-[34rem] md:h-screen w-full overflow-hidden flex items-center">
            <div className="absolute inset-0 z-0">
                <CmsImage
                    image={image}
                    ref={heroRef}
                    alt=""
                    className="w-full h-[120%] object-cover object-top md:filter md:brightness-[0.80] md:contrast-[1.05]"
                    sizes="100vw"
                    loading="eager"
                    fetchPriority="high"
                    onLoad={() => setIsImageReady(true)}
                    onError={() => setIsImageReady(true)}
                />

                <div className={`absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent transition-opacity duration-500 ${isImageReady ? 'opacity-100' : 'opacity-0'}`} />
            </div>
            <div className={`relative z-10 max-w-7xl mx-auto px-6 md:px-10 w-full flex items-end md:items-center h-full pb-16 md:pb-0 transition-[opacity,transform] duration-700 opacity-100 translate-y-0`}>
                <div className="w-full md:max-w-2xl space-y-6 md:space-y-7 text-left flex flex-col items-start">
                    <h1 className="font-serif text-white leading-[0.95] md:leading-[0.95] reveal">
                        <div className="text-[1.5rem] md:text-[2.25rem] lg:text-[2.5rem] mb-[0.125rem] md:mb-1 text-white/75 font-light tracking-wide">
                            {renderTextWithBreaks(title_top)}
                        </div>
                        <div className="text-[2.75rem] md:text-[5rem] lg:text-[6.5rem] font-bold tracking-tight">
                            {renderTextWithBreaks(title_main)}
                        </div>
                    </h1>
                    <p className="text-[0.9375rem] md:text-base text-white/70 font-sans font-normal max-w-[250px] md:max-w-md leading-snug md:leading-relaxed reveal stagger-1">
                        {renderTextWithBreaks(description)}
                    </p>
                    <div className="pt-2 md:pt-4 reveal stagger-2">
                        {isExternalCta ? (
                            <a
                                href={ctaHref}
                                className="inline-block bg-[#3E5F25] text-white px-8 py-3.5 rounded-full font-semibold tracking-widest uppercase text-xs hover:bg-[#2e471b] transition-all transform hover:-translate-y-0.5 shadow-md hover:shadow-lg"
                                target="_blank"
                                rel="noreferrer"
                            >
                                {cta}
                            </a>
                        ) : (
                            <Link
                                to={ctaHref}
                                className="inline-block bg-[#3E5F25] text-white px-8 py-3.5 rounded-full font-semibold tracking-widest uppercase text-xs hover:bg-[#2e471b] transition-all transform hover:-translate-y-0.5 shadow-md hover:shadow-lg"
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
