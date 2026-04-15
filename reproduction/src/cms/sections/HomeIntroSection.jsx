import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useSoftEntrance } from '@/cms/hooks/useSoftEntrance';
import { normalizeCmsParagraphs, renderCmsInline } from '@/cms/components/ui/CmsText';

const HomeIntroSection = ({
    title = '',
    description = '',
}) => {
    const sectionRef = useRef(null);
    const timelineRef = useRef(null);
    const dotRefs = useRef([]);
    useSoftEntrance(sectionRef);
    const paragraphs = normalizeCmsParagraphs(description);
    const [lineProgress, setLineProgress] = useState(0);
    const [lineMetrics, setLineMetrics] = useState({ top: 0, height: 0 });
    const [activeIndex, setActiveIndex] = useState(-1);
    const safeParagraphs = useMemo(() => paragraphs.slice(0, 4), [paragraphs]);

    useEffect(() => {
        const timelineNode = timelineRef.current;
        if (!timelineNode) return;

        let rafId = null;
        let ticking = false;

        const updateData = () => {
            ticking = false;
            const timelineRect = timelineNode.getBoundingClientRect();
            const validDots = dotRefs.current.filter(Boolean);
            if (validDots.length < 2) return;

            const firstRect = validDots[0].getBoundingClientRect();
            const lastRect = validDots[validDots.length - 1].getBoundingClientRect();

            const top = (firstRect.top - timelineRect.top) + (firstRect.height / 2);
            const bottom = (lastRect.top - timelineRect.top) + (lastRect.height / 2);
            setLineMetrics({ top, height: Math.max(0, bottom - top) });

            const activationPoint = window.innerHeight * 0.5;
            const firstPixel = firstRect.top + firstRect.height / 2;
            const lastPixel = lastRect.top + lastRect.height / 2;
            const totalTravel = lastPixel - firstPixel;

            if (totalTravel > 0) {
                const travelled = activationPoint - firstPixel;
                const progress = Math.max(0, Math.min(1, travelled / totalTravel));
                setLineProgress(Number(progress.toFixed(4)));
                setActiveIndex(Math.floor(progress * safeParagraphs.length));
            }
        };

        const onScroll = () => {
            if (!ticking) {
                ticking = true;
                rafId = requestAnimationFrame(updateData);
            }
        };

        updateData();
        window.addEventListener('scroll', onScroll, { passive: true });
        window.addEventListener('resize', onScroll, { passive: true });

        return () => {
            window.removeEventListener('scroll', onScroll);
            window.removeEventListener('resize', onScroll);
            if (rafId) cancelAnimationFrame(rafId);
        };
    }, [safeParagraphs.length]);



    return (
        <section
            ref={sectionRef}
            className="bg-primary/[0.035] dark:bg-surface-dark/40 border-y border-slate-100 dark:border-slate-800 px-6 py-16 md:py-24 overflow-hidden"
            style={{ minHeight: '500px' }}
        >
            <div className="max-w-7xl mx-auto">
                <div className="max-w-[72rem] mx-auto">
                    {title && (
                        <div className="soft-entrance-item mb-12 md:mb-16 text-center">
                            <h2 className="text-4xl md:text-5xl font-serif text-primary leading-[1.15] md:leading-tight reveal">
                                {renderCmsInline(title)}
                            </h2>
                        </div>
                    )}
                    
                    {safeParagraphs.length > 0 && (
                        <div ref={timelineRef} className="soft-entrance-item relative max-w-[48rem] mx-auto">
                            {/* Guide Track */}
                            <div
                                className="absolute w-[3px] rounded-full bg-primary/10"
                                style={{
                                    top: `${lineMetrics.top}px`,
                                    height: `${lineMetrics.height}px`,
                                    left: 'calc(1rem - 1.5px)',
                                }}
                            />
                            {/* Actual Growing Line */}
                            <div
                                className="absolute w-[3px] rounded-full bg-primary origin-top will-change-transform"
                                style={{
                                    top: `${lineMetrics.top}px`,
                                    height: `${lineMetrics.height}px`,
                                    left: 'calc(1rem - 1.5px)',
                                    transform: `scaleY(${lineProgress})`,
                                }}
                            />
                            
                            <div className="space-y-8 md:space-y-10">
                                {safeParagraphs.map((paragraph, index) => {
                                    const progressThreshold = safeParagraphs.length <= 1 ? 0 : index / (safeParagraphs.length - 1);
                                    const isActive = lineProgress >= (progressThreshold - 0.01); // 1% earlier for better feel
                                    
                                    return (
                                        <div
                                            key={`intro-paragraph-${index}`}
                                            className="grid grid-cols-[2rem_minmax(0,1fr)] items-start gap-5 md:gap-7"
                                        >
                                            <div className="relative flex items-center justify-center pt-[0.7rem]">
                                                {/* Active Glow Ring — centered on the dot */}
                                                <div
                                                    className={`absolute h-4 w-4 rounded-full border border-primary transition-all duration-700 ease-out ${
                                                        isActive ? 'opacity-100 scale-150' : 'opacity-0 scale-50'
                                                    }`}
                                                />
                                                {/* Solid Dot */}
                                                <span
                                                    ref={(node) => {
                                                        dotRefs.current[index] = node;
                                                    }}
                                                    className={`relative z-10 h-3.5 w-3.5 rounded-full bg-primary transition-all duration-700 cubic-bezier(0.34, 1.56, 0.64, 1) ${
                                                        isActive ? 'opacity-100 scale-100 shadow-[0_0_8px_rgba(62,95,37,0.5)]' : 'opacity-75 scale-75'
                                                    }`}
                                                />
                                            </div>
                                            <p
                                                className={`max-w-[48rem] text-[0.875rem] md:text-[1.1rem] leading-[1.5] md:leading-[1.72] transition-all duration-700 ease-out font-normal ${
                                                    isActive 
                                                        ? 'text-slate-800 dark:text-slate-100 opacity-100 translate-x-1' 
                                                        : 'text-slate-600 dark:text-slate-400 opacity-85 translate-x-0'
                                                }`}
                                            >
                                                {renderCmsInline(paragraph)}
                                            </p>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
};

export default HomeIntroSection;
