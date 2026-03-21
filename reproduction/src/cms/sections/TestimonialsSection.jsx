import React, { useRef, useEffect, useState } from 'react';
import { getTestimonials, decodeHtmlEntities } from '@/cms/lib/cms';
import TestimonialCard from '@/cms/components/ui/TestimonialCard';
import { renderCmsInline } from '@/cms/components/ui/CmsText';

/**
 * Map a raw kundenstimmen CMS post to the shape used as fallback props.
 * The `data` prop carries the raw post so TestimonialCard's CB hydration block
 * resolves: data.title → author, data.customFields.sterne → rating,
 *           data.customFields.kundenstimme_text → text.
 */
function mapTestimonial(raw) {
    const cf = raw.customFields || raw.acf || raw.meta || {};
    
    // Robust name extraction: Try Title, then specific meta fields, then safe fallback.
    const name = decodeHtmlEntities(
        raw.title?.rendered || 
        (typeof raw.title === 'string' ? raw.title : '') ||
        cf.kundenname || 
        cf.name ||
        raw.post_title || 
        ''
    );

    return {
        // Fallback props — used when CB hydration cannot resolve a value
        author: name || 'Kunde',
        // rating_raw matches the prop name in TestimonialCard
        rating_raw: String(cf.sterne || '5'),
        text: decodeHtmlEntities(cf.kundenstimme_text || ''),
        // Raw CMS post → passed as `data` so the CB hydration block activates
        data: raw,
    };
}

const TestimonialsSection = ({ 
    label, title, 
    items: fallbackItems, 
    language,
    page = 'Home',
    section = 'TestimonialsSection'
}) => {
    const sectionRef = useRef(null);
    const trackRef = useRef(null);
    const offsetRef = useRef(0);
    const [isInView, setIsInView] = useState(false);
    const [isPageVisible, setIsPageVisible] = useState(
        typeof document === 'undefined' ? true : document.visibilityState === 'visible'
    );
    const SPEED_PX_PER_SEC = 22;

    // ── Live CMS testimonials ──────────────────────────────────────────────
    const [items, setItems] = useState(fallbackItems ?? []);
    const displayItems = items.length > 1 ? [...items, ...items] : items;

    // Keep section state in sync with async parent updates.
    // Without this, the section can stay empty until it remounts.
    useEffect(() => {
        setItems(fallbackItems ?? []);
    }, [fallbackItems, language]);

    useEffect(() => {
        let cancelled = false;
        async function load() {
            try {
                const raw = await getTestimonials(language ?? 'DE');
                if (cancelled || !raw.length) return;
                setItems(raw.map(mapTestimonial));
            } catch (err) {
                console.error('[TestimonialsSection] CMS load failed:', err);
                // Silently keep fallback items — no UI change needed
            }
        }
        load();
        return () => { cancelled = true; };
    }, [language]);

    useEffect(() => {
        const section = sectionRef.current;
        if (!section || typeof IntersectionObserver === 'undefined') return undefined;

        const observer = new IntersectionObserver(
            (entries) => {
                setIsInView(entries.some((entry) => entry.isIntersecting));
            },
            { threshold: 0.45, rootMargin: '-8% 0px -8% 0px' }
        );

        observer.observe(section);
        return () => observer.disconnect();
    }, []);

    useEffect(() => {
        if (typeof document === 'undefined') return undefined;

        const handleVisibilityChange = () => {
            setIsPageVisible(document.visibilityState === 'visible');
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
    }, []);

    useEffect(() => {
        const track = trackRef.current;
        if (!track || !isInView || !isPageVisible || items.length <= 1) return undefined;

        let rafId = null;
        let previousTs = null;
        const speed =
            typeof window !== 'undefined' && window.innerWidth < 768
                ? SPEED_PX_PER_SEC * 0.72
                : SPEED_PX_PER_SEC;

        const tick = (ts) => {
            if (previousTs === null) previousTs = ts;
            const delta = (ts - previousTs) / 1000;
            previousTs = ts;

            const singleSetWidth = track.scrollWidth / 2;
            if (singleSetWidth > 0) {
                offsetRef.current += speed * delta;
                if (offsetRef.current >= singleSetWidth) {
                    offsetRef.current -= singleSetWidth;
                }
                track.style.transform = `translate3d(-${offsetRef.current}px, 0, 0)`;
            }

            rafId = window.requestAnimationFrame(tick);
        };

        rafId = window.requestAnimationFrame(tick);
        return () => {
            if (rafId) window.cancelAnimationFrame(rafId);
        };
    }, [isInView, isPageVisible, items.length]);

    return (
        <section ref={sectionRef} className="py-20 md:py-24 bg-background-light dark:bg-background-dark overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 md:px-6 mb-12 md:mb-16">
                <div className="text-center space-y-4">
                    <span className="text-accent-label font-bold tracking-widest uppercase text-xs">{renderCmsInline(label)}</span>
                    <h2 className="text-4xl md:text-5xl font-serif text-primary reveal">{renderCmsInline(title)}</h2>
                </div>
            </div>
            <div className="relative">
                <div className="w-full overflow-hidden">
                    <div ref={trackRef} className="flex gap-4 md:gap-8 px-4 md:px-8 w-max items-stretch pb-2 will-change-transform">
                        {displayItems.map((tm, idx) => (
                            <TestimonialCard
                                key={idx}
                                author={tm.author}
                                rating_raw={tm.rating_raw}
                                text={tm.text}
                                data={tm.data}
                                page={page}
                                section={section}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default TestimonialsSection;
