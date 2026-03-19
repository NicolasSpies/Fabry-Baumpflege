import React, { useRef } from 'react';
import { useSoftEntrance } from '@/cms/hooks/useSoftEntrance';

const ServicesIntroSection = ({
    description,
}) => {
    const sectionRef = useRef(null);
    useSoftEntrance(sectionRef, { staggerDelayMs: 90, durationMs: 680 });

    return (
        <section className="pt-6 md:pt-8 pb-6 md:pb-8 px-4 md:px-6 text-center bg-white overflow-hidden">
            <div ref={sectionRef} className="max-w-7xl mx-auto">
                <div className="space-y-6 soft-entrance-item">
                    <p className="text-base md:text-lg opacity-90 max-w-2xl mx-auto leading-relaxed text-slate-600">
                        {description}
                    </p>
                </div>
            </div>
        </section>
    );
};

export default ServicesIntroSection;
