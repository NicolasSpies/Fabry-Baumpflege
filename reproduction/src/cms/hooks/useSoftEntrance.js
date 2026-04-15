import { useEffect, useLayoutEffect } from 'react';

export const useSoftEntrance = (ref, options = {}) => {
    const {
        threshold = 0.05,
        rootMargin = '0px 0px -10% 0px',
        staggerDelayMs = 70,
        itemSelector = '.soft-entrance-item',
        durationMs = 600,
        easing = 'cubic-bezier(0.22, 1, 0.36, 1)'
    } = options;

    // Set initial hidden state BEFORE browser paints — prevents flash of
    // unstyled content that then jumps down before animating up.
    useLayoutEffect(() => {
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

        items.forEach((item) => {
            item.style.opacity = '0';
            item.style.transform = 'translateY(16px)';
            item.style.willChange = 'transform, opacity';
            item.style.transition = 'none'; // No transition during init
        });
    }, [ref, itemSelector]);

    // Observe and animate after page is visible.
    useEffect(() => {
        const container = ref.current;
        if (!container) return;

        const items = Array.from(container.querySelectorAll(itemSelector));
        if (items.length === 0) return;

        const prefersReducedMotion = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

        if (prefersReducedMotion || isMobile) return;

        // Enable transitions now (after layout effect set initial state without transition)
        items.forEach((item) => {
            item.style.transition = `opacity ${durationMs}ms ${easing}, transform ${durationMs}ms ${easing}`;
        });

        const startObserving = () => {
            const observer = new IntersectionObserver((entries) => {
                const [entry] = entries;

                if (entry.isIntersecting) {
                    items.forEach((item, index) => {
                        setTimeout(() => {
                            item.style.opacity = '1';
                            item.style.transform = 'translateY(0)';

                            setTimeout(() => {
                                if (item.style) {
                                    item.style.willChange = 'auto';
                                }
                            }, durationMs);

                        }, index * staggerDelayMs);
                    });

                    observer.disconnect();
                }
            }, { threshold, rootMargin });

            observer.observe(container);
            return observer;
        };

        const activeObserver = startObserving();

        return () => {
            if (activeObserver) activeObserver.disconnect();
        };
    }, [ref, threshold, staggerDelayMs, itemSelector, durationMs, easing]);
};
