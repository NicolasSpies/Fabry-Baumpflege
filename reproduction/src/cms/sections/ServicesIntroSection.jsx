import React, { useRef } from 'react';
import { useSoftEntrance } from '@/cms/hooks/useSoftEntrance';
import CmsText, { renderCmsInline } from '@/cms/components/ui/CmsText';

const ServicesIntroSection = ({
    title,
    description,
}) => {
    const sectionRef = useRef(null);
    useSoftEntrance(sectionRef, { staggerDelayMs: 90, durationMs: 680 });

    return (
        <section 
            className="pt-10 md:pt-16 pb-8 md:pb-20 px-4 md:px-6 text-center bg-white overflow-hidden transition-all duration-300"
        >
            <div ref={sectionRef} className="max-w-7xl mx-auto">
                <div className="space-y-6 md:space-y-10 soft-entrance-item">
                    {title ? (
                        <h1 className="font-serif text-primary leading-[1.05] text-4xl md:text-5xl font-medium tracking-tight max-w-[14em] mx-auto">
                            {renderCmsInline(title)}
                        </h1>
                    ) : null}
                    <CmsText
                        text={description}
                        className="max-w-xl mx-auto space-y-4 text-slate-700 font-light"
                        paragraphClassName="text-[1.05rem] md:text-lg leading-[1.75]"
                    />
                </div>
            </div>
        </section>
    );
};

export default ServicesIntroSection;
