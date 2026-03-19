import { useEffect } from 'react';

export const useSoftEntrance = (ref, options = {}) => {
    const {
        threshold = 0.15,
        staggerDelayMs = 70,
        itemSelector = '.soft-entrance-item',
        durationMs = 600,
        easing = 'cubic-bezier(0.22, 1, 0.36, 1)'
    } = options;

    useEffect(() => {
        const container = ref.current;
        if (!container) return;

        const items = Array.from(container.querySelectorAll(itemSelector));
        if (items.length === 0) return;

        const prefersReducedMotion = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

        if (prefersReducedMotion || isMobile) {
            items.forEach((item) => {
                item.style.opacity = '1';
                item.style.transform = 'none';
                item.style.willChange = 'auto';
                item.style.transition = 'none';
            });
            return;
        }

        // Initialize state before animation
        items.forEach((item) => {
            item.style.opacity = '0';
            item.style.transform = 'translateY(16px)';
            item.style.willChange = 'transform, opacity';
            item.style.transition = `opacity ${durationMs}ms ${easing}, transform ${durationMs}ms ${easing}`;
        });

        const observer = new IntersectionObserver((entries) => {
            const [entry] = entries;

            if (entry.isIntersecting) {
                // Trigger staggered reveal
                items.forEach((item, index) => {
                    setTimeout(() => {
                        // Apply final resting state
                        item.style.opacity = '1';
                        item.style.transform = 'translateY(0)';

                        // Clean up will-change after transition duration
                        setTimeout(() => {
                            if (item.style) {
                                item.style.willChange = 'auto';
                            }
                        }, durationMs);

                    }, index * staggerDelayMs);
                });

                // Animate exactly once
                observer.disconnect();
            }
        }, { threshold });

        observer.observe(container);

        return () => observer.disconnect();
    }, [ref, threshold, staggerDelayMs, itemSelector, durationMs, easing]);
};
