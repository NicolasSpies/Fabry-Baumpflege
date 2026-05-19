import { useEffect } from 'react';

export const useSoftEntrance = (ref, options = {}) => {
    const {
        threshold = 0.05,
        rootMargin = '0px 0px -10% 0px',
        staggerDelayMs = 70,
        itemSelector = '.soft-entrance-item',
        durationMs = 600,
        easing = 'cubic-bezier(0.22, 1, 0.36, 1)'
    } = options;

    // Initial hidden state is now set by CSS (.soft-entrance-item in index.css),
    // scoped to desktop + prefers-reduced-motion: no-preference.
    // This eliminates the useLayoutEffect that previously wrote inline styles
    // synchronously, causing forced reflow after Navbar had read layout geometry.
    useEffect(() => {
        const container = ref.current;
        if (!container) return;

        const items = Array.from(container.querySelectorAll(itemSelector));
        if (items.length === 0) return;

        const prefersReducedMotion = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

        if (prefersReducedMotion || isMobile) return;

        // Enable transitions — CSS already hides items before first paint,
        // so adding transition here won't cause a visible jump.
        items.forEach((item) => {
            item.style.transition = `opacity ${durationMs}ms ${easing}, transform ${durationMs}ms ${easing}`;
        });

        const observer = new IntersectionObserver((entries) => {
            const [entry] = entries;

            if (entry.isIntersecting) {
                items.forEach((item, index) => {
                    setTimeout(() => {
                        item.style.willChange = 'transform, opacity';
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
        return () => {
            if (observer) observer.disconnect();
        };
    }, [ref, threshold, staggerDelayMs, itemSelector, durationMs, easing]);
};
