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
    const [items, setItems] = useState(fallbackItems ?? []);
    const [activeIndex, setActiveIndex] = useState(0);
    const scrollRef = useRef(null);
    const trackRef = useRef(null);
    const offsetRef = useRef(0);
    const [isInView, setIsInView] = useState(false);
    const [isPageVisible, setIsPageVisible] = useState(true);
    const teleportTimerRef = useRef(null);

    const displayItems = items.length > 1 ? [...items, ...items, ...items] : items;

    // ── Performance Hooks ────────────────────────────────────────────────────
    useEffect(() => {
        const obs = new IntersectionObserver(([e]) => setIsInView(e.isIntersecting), { threshold: 0.1 });
        if (trackRef.current) obs.observe(trackRef.current);
        return () => obs.disconnect();
    }, []);

    useEffect(() => {
        const handle = () => setIsPageVisible(document.visibilityState === 'visible');
        document.addEventListener('visibilitychange', handle);
        return () => document.removeEventListener('visibilitychange', handle);
    }, []);

    // ── CMS Fetch ────────────────────────────────────────────────────────────
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
            }
        }
        load();
        return () => { cancelled = true; };
    }, [language]);

    // Initialize mobile scroll to middle set (without animation)
    useEffect(() => {
        if (items.length > 1 && scrollRef.current && window.innerWidth < 768) {
            const container = scrollRef.current;
            const card = container.querySelector('[data-testimonial-card]');
            if (!card) return;
            const singleSetWidth = items.length * (card.offsetWidth + 16);
            container.scrollLeft = singleSetWidth;
            
            // Re-sync index
            const newIndex = Math.round((container.scrollLeft % singleSetWidth) / (card.offsetWidth + 16));
            setActiveIndex(newIndex % items.length);
        }
    }, [items.length]);

    // ── Desktop Marquee Logic ────────────────────────────────────────────────
    useEffect(() => {
        const track = trackRef.current;
        if (!track || items.length <= 1 || typeof window === 'undefined' || window.innerWidth < 768) return undefined;
        if (!isInView || !isPageVisible) return undefined;

        let rafId = null;
        let previousTs = null;
        const SPEED_PX_PER_SEC = 22;

        const tick = (ts) => {
            if (previousTs === null) previousTs = ts;
            const delta = (ts - previousTs) / 1000;
            previousTs = ts;

            const singleSetWidth = track.scrollWidth / 3;
            if (singleSetWidth > 0) {
                offsetRef.current += SPEED_PX_PER_SEC * delta;
                if (offsetRef.current >= singleSetWidth) {
                    offsetRef.current -= singleSetWidth;
                }
                track.style.transform = `translate3d(-${offsetRef.current}px, 0, 0)`;
            }
            rafId = window.requestAnimationFrame(tick);
        };

        rafId = window.requestAnimationFrame(tick);
        return () => { if (rafId) window.cancelAnimationFrame(rafId); };
    }, [items.length, isInView, isPageVisible]);

    // ── Mobile Slider Auto-Advance ───────────────────────────────────────────
    useEffect(() => {
        if (!items.length || typeof window === 'undefined' || window.innerWidth >= 768) return undefined;
        
        const interval = setInterval(() => {
            if (!scrollRef.current) return;
            const container = scrollRef.current;
            const card = container.querySelector('[data-testimonial-card]');
            if (!card) return;
            const cardWidth = card.offsetWidth;
            const gap = 16;
            
            // Smooth advance
            container.scrollBy({ left: cardWidth + gap, behavior: 'smooth' });
        }, 6000);

        return () => clearInterval(interval);
    }, [items.length]);

    const handleMobileScroll = () => {
        if (!scrollRef.current) return;
        const container = scrollRef.current;
        const card = container.querySelector('[data-testimonial-card]');
        if (!card) return;
        
        const cardWidth = card.offsetWidth;
        const gap = 16;
        const singleSetWidth = items.length * (cardWidth + gap);

        // Update active index for dots (always relative to Set 2)
        const rawIndex = Math.round(container.scrollLeft / (cardWidth + gap));
        const newIndex = rawIndex % items.length;
        if (newIndex !== activeIndex) setActiveIndex(newIndex);

        // Deferred Teleport: Reset to middle set SILENTLY after scroll has settled
        if (teleportTimerRef.current) clearTimeout(teleportTimerRef.current);
        teleportTimerRef.current = setTimeout(() => {
            if (!scrollRef.current) return;
            const currentLeft = container.scrollLeft;
            // Only teleport if we are in Set 1 or Set 3
            if (currentLeft < singleSetWidth || currentLeft >= singleSetWidth * 2) {
                const normalizedLeft = singleSetWidth + (currentLeft % singleSetWidth);
                container.style.scrollBehavior = 'auto'; // Disable smooth for jump
                container.scrollLeft = normalizedLeft;
                container.style.scrollBehavior = ''; // Re-enable for dots/auto-slide
            }
        }, 600);
    };

    return (
        <section className="py-20 md:py-28 bg-white dark:bg-background-dark overflow-hidden">
            <div className="max-w-7xl mx-auto px-6 mb-12 md:mb-16">
                <div className="text-center space-y-4">
                    <span className="text-accent-label font-bold tracking-widest uppercase text-xs block">{renderCmsInline(label)}</span>
                    <h2 className="text-4xl md:text-5xl font-serif text-primary reveal leading-[1.2]">{renderCmsInline(title)}</h2>
                </div>
            </div>

            {/* Desktop Marquee */}
            <div className="hidden md:block relative overflow-hidden">
                <div ref={trackRef} className="flex gap-8 px-8 w-max items-stretch pb-4 will-change-transform">
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

            {/* Mobile Slider */}
            <div className="md:hidden relative">
                <div 
                    ref={scrollRef}
                    onScroll={handleMobileScroll}
                    className="flex overflow-x-auto snap-x snap-mandatory scroll-smooth no-scrollbar px-[12vw] gap-4 pb-12 cursor-grab active:cursor-grabbing"
                >
                    {displayItems.map((tm, idx) => (
                        <div key={idx} className="snap-center">
                            <TestimonialCard
                                author={tm.author}
                                rating_raw={tm.rating_raw}
                                text={tm.text}
                                data={tm.data}
                                page={page}
                                section={section}
                            />
                        </div>
                    ))}
                </div>
                {items.length > 1 && (
                    <div className="flex justify-center gap-2.5 mt-2">
                        {items.map((_, idx) => (
                            <button
                                key={idx}
                                className={`h-1.5 transition-all duration-300 rounded-full ${
                                    idx === activeIndex ? 'bg-primary w-6' : 'bg-primary/20 w-1.5'
                                }`}
                                onClick={() => {
                                    const container = scrollRef.current;
                                    const card = container.querySelector('[data-testimonial-card]');
                                    if (!card) return;
                                    const step = card.offsetWidth + 16;
                                    const singleShift = items.length * step;
                                    container.scrollTo({ 
                                        left: singleShift + (idx * step), 
                                        behavior: 'smooth' 
                                    });
                                    setActiveIndex(idx);
                                }}
                            />
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
};

export default TestimonialsSection;
