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
        <section className="pt-6 md:pt-8 pb-6 md:pb-8 px-4 md:px-6 text-center bg-white overflow-hidden">
            <div ref={sectionRef} className="max-w-7xl mx-auto">
                <div className="space-y-6 soft-entrance-item">
                    {title ? (
                        <h1 className="font-serif text-primary leading-[0.95] md:leading-[0.95] text-[2.75rem] md:text-[5rem] lg:text-[6.5rem] font-bold tracking-tight">
                            {renderCmsInline(title)}
                        </h1>
                    ) : null}
                    <CmsText
                        text={description}
                        className="max-w-2xl mx-auto space-y-3 text-slate-600"
                        paragraphClassName="text-base opacity-90 leading-relaxed"
                    />
                </div>
            </div>
        </section>
    );
};

export default ServicesIntroSection;
