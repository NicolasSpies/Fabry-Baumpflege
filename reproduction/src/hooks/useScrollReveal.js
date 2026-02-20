import { useEffect } from 'react';

/**
 * Custom hook to trigger appear animations on scroll.
 * Uses IntersectionObserver for efficiency.
 */
export const useScrollReveal = (dependencies = []) => {
    useEffect(() => {
        const observerOptions = {
            root: null,
            rootMargin: '0px',
            threshold: 0.1,
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('reveal-visible');
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);

        const scrollRevealElements = document.querySelectorAll('.reveal');
        scrollRevealElements.forEach((el) => {
            // Only observe if not already visible to avoid re-triggering
            if (!el.classList.contains('reveal-visible')) {
                observer.observe(el);
            }
        });

        return () => observer.disconnect();
    }, dependencies);
};
