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

        const startObserving = () => {
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
            }, { threshold, rootMargin });

            observer.observe(container);
            return observer;
        };

        // Wait for .page-visible before starting — prevents animation
        // from firing while the loader is still covering the page.
        let activeObserver = null;
        let mutObs = null;

        if (document.querySelector('.page-visible')) {
            activeObserver = startObserving();
        } else {
            mutObs = new MutationObserver(() => {
                if (document.querySelector('.page-visible')) {
                    mutObs.disconnect();
                    mutObs = null;
                    activeObserver = startObserving();
                }
            });
            mutObs.observe(document.documentElement, { attributes: true, subtree: true, attributeFilter: ['class'] });
        }

        return () => {
            if (activeObserver) activeObserver.disconnect();
            if (mutObs) mutObs.disconnect();
        };
    }, [ref, threshold, staggerDelayMs, itemSelector, durationMs, easing]);
};
