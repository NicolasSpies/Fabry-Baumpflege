import { useEffect } from 'react';

/**
 * Custom hook to trigger appear animations on scroll.
 * Uses IntersectionObserver for efficiency.
 */
export const useScrollReveal = () => {
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
                    // Stop observing once it's visible to trigger animation only once
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);

        const scrollRevealElements = document.querySelectorAll('.reveal');
        scrollRevealElements.forEach((el) => observer.observe(el));

        return () => observer.disconnect();
    }, []);
};
