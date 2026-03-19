import React from 'react';
import CmsImage from '@/cms/components/ui/CmsImage';

const ReferenceHeroSection = ({ title, categoryLabel, image }) => {
    return (
        <section className="px-6 mb-24">
            <div className="max-w-7xl mx-auto">
                <div className="relative h-[70vh] w-full rounded-3xl overflow-hidden shadow-2xl reveal">
                    {image && (
                        <CmsImage image={image} alt={title} className="w-full h-full object-cover" sizes="100vw" fetchPriority="high" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-12">
                        <div className="max-w-3xl">
                            {categoryLabel && (
                                <span className="text-white/80 text-sm uppercase tracking-[0.3em] mb-4 block reveal stagger-1">
                                    {categoryLabel}
                                </span>
                            )}
                            <h1 className="text-5xl md:text-7xl font-display text-white leading-tight mb-4 reveal stagger-2">
                                {title}
                            </h1>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default ReferenceHeroSection;
