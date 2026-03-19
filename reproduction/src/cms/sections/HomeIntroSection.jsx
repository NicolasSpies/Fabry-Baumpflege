import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useSoftEntrance } from '@/cms/hooks/useSoftEntrance';

function normalizeParagraphs(text) {
    if (!text) return [];

    const normalized = String(text)
        .replace(/<\/p>\s*<p>/gi, '\n\n')
        .replace(/<p[^>]*>/gi, '')
        .replace(/<\/p>/gi, '')
        .replace(/<br\s*\/?>\s*<br\s*\/?>/gi, '\n\n')
        .replace(/<br\s*\/?>/gi, '\n')
        .trim();

    const splitByParagraphBreaks = normalized
        .split(/\n\s*\n/)
        .map((paragraph) => paragraph.trim())
        .filter(Boolean);

    if (splitByParagraphBreaks.length > 1) {
        return splitByParagraphBreaks;
    }

    return normalized
        .split('\n')
        .map((paragraph) => paragraph.trim())
        .filter(Boolean);
}

function renderInlineBreaks(text) {
    return String(text)
        .split('\n')
        .map((part, index, arr) => (
            <React.Fragment key={`${part}-${index}`}>
                {part}
                {index < arr.length - 1 ? <br /> : null}
            </React.Fragment>
        ));
}

function normalizeSingleLine(text) {
    if (!text) return '';

    return String(text)
        .replace(/<br\s*\/?>/gi, ' ')
        .replace(/\s+/g, ' ')
        .trim();
}

const HomeIntroSection = ({
    title = '',
    description = '',
}) => {
    const sectionRef = useRef(null);
    const timelineRef = useRef(null);
    const dotRefs = useRef([]);
    useSoftEntrance(sectionRef);
    const paragraphs = normalizeParagraphs(description);
    const [lineProgress, setLineProgress] = useState(0);
    const [lineMetrics, setLineMetrics] = useState({ top: 0, height: 0 });
    const safeParagraphs = useMemo(() => paragraphs.slice(0, 4), [paragraphs]);

    useEffect(() => {
        const sectionNode = sectionRef.current;
        const timelineNode = timelineRef.current;
        if (!sectionNode || !timelineNode) return;

        let rafId = null;

        const updateLine = () => {
            rafId = null;
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
            const start = viewportHeight * 0.72;
            const distance = rect.height + viewportHeight * 0.08;
            const raw = (start - rect.top) / distance;
            setLineProgress(Math.max(0, Math.min(1, raw)));
        };

        const schedule = () => {
            if (rafId !== null) return;
            rafId = window.requestAnimationFrame(() => {
                updateLine();
                updateProgress();
                rafId = null;
            });
        };

        schedule();
        window.addEventListener('scroll', schedule, { passive: true });
        window.addEventListener('resize', schedule);

        return () => {
            if (rafId !== null) window.cancelAnimationFrame(rafId);
            window.removeEventListener('scroll', schedule);
            window.removeEventListener('resize', schedule);
        };
    }, [safeParagraphs.length]);

    if (!title && !description) {
        return null;
    }

    return (
        <section
            ref={sectionRef}
            className="bg-primary/[0.035] border-y border-primary/10 px-6 py-16 md:py-20 overflow-hidden"
        >
            <div className="max-w-7xl mx-auto">
                <div className="max-w-[72rem] mx-auto">
                    {title ? (
                        <div className="soft-entrance-item mb-10 md:mb-12 grid grid-cols-[2rem_minmax(0,1fr)] gap-5 md:gap-6 max-w-[56rem] mx-auto">
                            <div aria-hidden="true" />
                            <h2 className="text-[1.8rem] leading-[1.08] text-primary md:text-[2rem] lg:text-[2.15rem] font-serif text-left">
                                {normalizeSingleLine(title)}
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
                                className="absolute w-[3px] rounded-full bg-primary origin-top transition-transform duration-200 ease-out"
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
                                                className="h-3.5 w-3.5 rounded-full bg-primary transition-opacity duration-200"
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
                                            {renderInlineBreaks(paragraph)}
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
