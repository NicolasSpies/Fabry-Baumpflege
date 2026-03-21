import React, { useState } from 'react';
import Icon from '@/cms/components/ui/Icon';
import CmsImage from '@/cms/components/ui/CmsImage';
import CmsText, { renderCmsInline } from '@/cms/components/ui/CmsText';

const ReferenceContentSection = ({ 
    challengeTitle, 
    description, 
    beforeImage, 
    afterImage,
    beforeLabel = '',
    afterLabel = '',
    gallery = [],
    galleryTitle = '',
    sidebar,
    onOpenLightbox
}) => {
    const [sliderValue, setSliderValue] = useState(50);
    const hasBeforeAfter = beforeImage || afterImage;

    return (
        <div className="lg:col-span-8 reveal stagger-1">
            <div className="prose prose-slate prose-lg dark:prose-invert max-w-none">
                <h2 className="font-display text-3xl text-primary mb-8">{renderCmsInline(challengeTitle)}</h2>
                {description && (
                    <CmsText
                        text={description}
                        className="text-muted-accessible mb-6"
                        paragraphClassName="leading-relaxed"
                    />
                )}
            </div>

            {hasBeforeAfter && (
                <div className="mt-16">
                    <div className="relative w-full aspect-[16/10] overflow-hidden rounded-3xl no-select group shadow-2xl bg-slate-100">
                        {afterImage && <CmsImage image={afterImage} alt={afterLabel} className="absolute inset-0 w-full h-full object-cover" sizes="(max-width: 1280px) 100vw, 1200px" />}
                        <span className="absolute top-6 right-6 font-sans text-[10px] text-white/90 uppercase tracking-[0.2em] z-10 bg-black/20 backdrop-blur-sm px-3 py-1 rounded">{afterLabel}</span>

                        {beforeImage && (
                            <div
                                className="absolute inset-0 overflow-hidden border-r-2 border-primary/30"
                                style={{ clipPath: `inset(0 ${100 - sliderValue}% 0 0)` }}
                            >
                                <CmsImage image={beforeImage} alt={beforeLabel} className="absolute inset-0 w-full h-full object-cover" sizes="(max-width: 1280px) 100vw, 1200px" />
                                <span className="absolute top-6 left-6 font-sans text-[10px] text-white/90 uppercase tracking-[0.2em] z-10 bg-black/20 backdrop-blur-sm px-3 py-1 rounded">{beforeLabel}</span>
                            </div>
                        )}

                        <div className="absolute inset-y-0 -ml-[1px] w-[2px] bg-white cursor-ew-resize z-20" style={{ left: `${sliderValue}%` }}>
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-14 h-14 bg-white rounded-full flex items-center justify-center slider-handle-shadow border-4 border-white transition-transform group-hover:scale-105">
                                <Icon name="swap_horiz" className="text-primary text-3xl font-bold select-none" />
                            </div>
                        </div>

                        <input type="range" min="0" max="100" value={sliderValue} onChange={(e) => setSliderValue(Number(e.target.value))} aria-label="Vorher-Nachher-Vergleich" className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-30" />
                    </div>
                </div>
            )}

            {/* Gallery part within the same column/section */}
            {gallery && gallery.length > 0 && (
                <div className="mt-24">
                   <h3 className="font-display text-2xl text-primary mb-8">{renderCmsInline(galleryTitle)}</h3>
                   <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-6">
                       {gallery.map((img, idx) => (
                           <button 
                               key={idx} 
                               onClick={() => onOpenLightbox(idx)}
                               aria-label={`${galleryTitle} ${idx + 1}`}
                               className="aspect-square rounded-3xl overflow-hidden group shadow-xl hover:shadow-2xl transition-all duration-500 block text-left"
                           >
                               <CmsImage
                                   image={img}
                                   alt={`Project Gallery ${idx + 1}`}
                                   className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                   sizes="(max-width: 768px) 50vw, (max-width: 1280px) 33vw, 25vw"
                                   loading="lazy"
                               />
                           </button>
                       ))}
                   </div>
                </div>
            )}

            {sidebar && (
                <div className="mt-12 md:mt-16 max-w-2xl lg:hidden">
                    {sidebar}
                </div>
            )}
        </div>
    );
};

export default ReferenceContentSection;
