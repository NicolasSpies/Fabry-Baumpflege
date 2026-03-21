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
    const safeParagraphs = useMemo(() => paragraphs.slice(0, 4), [paragraphs]);

    useEffect(() => {
        const sectionNode = sectionRef.current;
        const timelineNode = timelineRef.current;
        if (!sectionNode || !timelineNode) return;

        let rafId = null;

        const updateLine = () => {
            const timelineRect = timelineNode.getBoundingClientRect();
            const validDots = dotRefs.current.filter(Boolean);
            if (validDots.length < 2) return;
            const firstRect = validDots[0].getBoundingClientRect();
            const lastRect = validDots[validDots.length - 1].getBoundingClientRect();
            const top = (firstRect.top - timelineRect.top) + (firstRect.height / 2);
            const bottom = (lastRect.top - timelineRect.top) + (lastRect.height / 2);
            setLineMetrics({
                top,
                height: Math.max(0, bottom - top),
            });
        };

        const updateProgress = () => {
            const rect = sectionNode.getBoundingClientRect();
            const viewportHeight = window.innerHeight || 1;
            
            // Refined thresholds for smoother entrance/exit
            const startThreshold = viewportHeight * 0.8;
            const endThreshold = viewportHeight * 0.2;
            const scrollDistance = rect.height + (viewportHeight * 0.1);
            
            const raw = (startThreshold - rect.top) / scrollDistance;
            const smoothed = Math.max(0, Math.min(1, raw));
            
            setLineProgress(Number(smoothed.toFixed(4)));
        };

        const handleScroll = () => {
            updateProgress();
        };

        const handleResize = () => {
            updateLine();
            updateProgress();
        };

        // Initial measurement
        updateLine();
        updateProgress();

        window.addEventListener('scroll', handleScroll, { passive: true });
        window.addEventListener('resize', handleResize, { passive: true });

        // Backup re-calculation for late layout shifts
        const t1 = setTimeout(updateLine, 500);
        const t2 = setTimeout(updateLine, 1500);

        return () => {
            if (rafId !== null) window.cancelAnimationFrame(rafId);
            window.removeEventListener('scroll', handleScroll);
            window.removeEventListener('resize', handleResize);
            clearTimeout(t1);
            clearTimeout(t2);
        };
    }, [safeParagraphs.length]);

    if (!title && !description) {
        return null;
    }

    return (
        <section
            ref={sectionRef}
            className="bg-primary/[0.035] dark:bg-surface-dark/40 border-y border-slate-100 dark:border-slate-800 px-6 py-16 md:py-20 overflow-hidden"
        >
            <div className="max-w-7xl mx-auto">
                <div className="max-w-[72rem] mx-auto">
                    {title ? (
                        <div className="soft-entrance-item mb-10 md:mb-12 grid grid-cols-[2rem_minmax(0,1fr)] gap-5 md:gap-6 max-w-[56rem] mx-auto">
                            <div aria-hidden="true" />
                            <h2 className="text-[1.8rem] leading-[1.08] text-primary md:text-[2rem] lg:text-[2.15rem] font-serif text-left">
                                {renderCmsInline(title)}
                            </h2>
                        </div>
                    ) : null}
                    {safeParagraphs.length > 0 ? (
                        <div ref={timelineRef} className="soft-entrance-item relative max-w-[56rem] mx-auto">
                            <div
                                className="absolute w-[3px] rounded-full bg-primary/14"
                                style={{
                                    top: `${lineMetrics.top}px`,
                                    height: `${lineMetrics.height}px`,
                                    left: 'calc(1rem - 1.5px)',
                                }}
                            />
                            <div
                                className="absolute w-[3px] rounded-full bg-primary origin-top transition-transform duration-100 linear will-change-transform"
                                style={{
                                    top: `${lineMetrics.top}px`,
                                    height: `${lineMetrics.height}px`,
                                    left: 'calc(1rem - 1.5px)',
                                    transform: `scaleY(${lineProgress})`,
                                }}
                            />
                            <div className="space-y-6 md:space-y-7">
                                {safeParagraphs.map((paragraph, index) => (
                                    <div
                                        key={`intro-paragraph-${index}`}
                                        className="grid grid-cols-[2rem_minmax(0,1fr)] items-start gap-5 md:gap-6"
                                    >
                                        <div className="relative flex justify-center pt-[0.72rem]">
                                            <span
                                                ref={(node) => {
                                                    dotRefs.current[index] = node;
                                                }}
                                                className="h-3.5 w-3.5 rounded-full bg-primary transition-opacity duration-500 ease-in-out"
                                                style={{
                                                    opacity: index === 0 ? 1 : (lineProgress >= (safeParagraphs.length === 1 ? 1 : index / (safeParagraphs.length - 1)) ? 1 : 0.28),
                                                }}
                                            />
                                        </div>
                                        <p
                                            className={index === 0
                                                ? 'max-w-[48rem] text-[1rem] leading-[1.72] font-semibold text-slate-700 dark:text-slate-200'
                                                : 'max-w-[48rem] text-[1rem] leading-[1.72] text-slate-600 dark:text-slate-300'}
                                        >
                                            {renderCmsInline(paragraph)}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : null}
                </div>
            </div>
        </section>
    );
};

export default HomeIntroSection;
