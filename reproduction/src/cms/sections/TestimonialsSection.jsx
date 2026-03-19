import React, { useRef, useEffect, useState } from 'react';
import { getTestimonials } from '@/cms/lib/cms';
import TestimonialCard from '@/cms/components/ui/TestimonialCard';

/**
 * Map a raw kundenstimmen CMS post to the shape used as fallback props.
 * The `data` prop carries the raw post so TestimonialCard's CB hydration block
 * resolves: data.title → author, data.customFields.sterne → rating,
 *           data.customFields.kundenstimme_text → text.
 */
function mapTestimonial(raw) {
    return {
        // Fallback props — used when CB hydration cannot resolve a value
        author: raw.title?.rendered ?? '',
        // rating_raw matches the prop name in TestimonialCard
        rating_raw: raw.customFields?.sterne ?? '5',
        text: raw.customFields?.kundenstimme_text ?? '',
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
    const marqueeTrackRef = useRef(null);
    const SPEED_PX_PER_SEC = 40;
    const offsetRef = useRef(0);
    const isHoveringRef = useRef(false);

    // ── Live CMS testimonials ──────────────────────────────────────────────
    const [items, setItems] = useState(fallbackItems ?? []);

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

    // ── Scroll marquee animation ───────────────────────────────────────────
    useEffect(() => {
        const track = marqueeTrackRef.current;
        if (!track) return;
        let prevTimestamp = null;
        let rafId;
        const tick = (timestamp) => {
            if (prevTimestamp === null) prevTimestamp = timestamp;
            const deltaTime = (timestamp - prevTimestamp) / 1000;
            prevTimestamp = timestamp;
            if (!isHoveringRef.current) {
                const singleSetWidth = track.scrollWidth / 2;
                if (singleSetWidth > 0) {
                    offsetRef.current += SPEED_PX_PER_SEC * deltaTime;
                    if (offsetRef.current >= singleSetWidth) offsetRef.current -= singleSetWidth;
                    track.style.transform = `translate3d(-${offsetRef.current}px, 0, 0)`;
                }
            }
            rafId = requestAnimationFrame(tick);
        };
        rafId = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(rafId);
    }, []);

    return (
        <section className="py-24 bg-background-light dark:bg-background-dark overflow-hidden">
            <div className="max-w-7xl mx-auto px-6 mb-16">
                <div className="text-center space-y-4">
                    <span className="text-[#9bb221] font-bold tracking-widest uppercase text-xs">{label}</span>
                    <h2 className="text-4xl md:text-5xl font-serif text-primary reveal">{title}</h2>
                </div>
            </div>
            <div className="relative">
                <div
                    className="w-full relative -my-10 py-10 overflow-hidden cursor-grab active:cursor-grabbing"
                    onMouseEnter={() => isHoveringRef.current = true}
                    onMouseLeave={() => { isHoveringRef.current = false; }}
                    style={{ touchAction: 'pan-y' }}
                >
                    <div ref={marqueeTrackRef} className="flex flex-nowrap gap-8 px-6 w-max will-change-transform">
                        {[...items, ...items].map((tm, idx) => (
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
