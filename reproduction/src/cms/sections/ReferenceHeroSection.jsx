import React, { useEffect, useState } from 'react';
import CmsImage from '@/cms/components/ui/CmsImage';
import { renderCmsInline } from '@/cms/components/ui/CmsText';

const ReferenceHeroSection = ({ title, categoryLabel, image }) => {
    const [isImageReady, setIsImageReady] = useState(false);
    const imageKey = typeof image === 'string' ? image : image?.src || image?.url || image?.full?.url || '';

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
        <section className="px-4 md:px-6 mb-16 md:mb-24">
            <div className="max-w-7xl mx-auto">
                <div className="relative h-[42svh] min-h-[18rem] md:h-[70vh] w-full rounded-[1.75rem] md:rounded-3xl overflow-hidden shadow-xl md:shadow-2xl reveal">
                    {image && (
                        <CmsImage image={image} alt={title} size="1280" className="w-full h-full object-cover" sizes="100vw" loading="eager" fetchPriority="high" onLoad={() => setIsImageReady(true)} onError={() => setIsImageReady(true)} />
                    )}
                    <div className={`absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-6 md:p-12 transition-opacity duration-500 ${isImageReady ? 'opacity-100' : 'opacity-0'}`}>
                        <div className="max-w-3xl">
                            {categoryLabel && (
                                <span className="text-white/80 text-sm uppercase tracking-[0.3em] mb-4 block reveal stagger-1">
                                    {renderCmsInline(categoryLabel)}
                                </span>
                            )}
                            <h1 className="text-3xl md:text-7xl font-display text-white leading-tight mb-2 md:mb-4 reveal stagger-2">
                                {renderCmsInline(title)}
                            </h1>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default ReferenceHeroSection;
