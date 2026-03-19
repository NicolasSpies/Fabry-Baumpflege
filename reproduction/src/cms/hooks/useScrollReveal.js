import { useEffect } from 'react';

/**
 * Custom hook to trigger appear animations on scroll.
 * Uses IntersectionObserver for efficiency.
 */
let sharedRevealObserver = null;

function getRevealObserver() {
    if (typeof window === 'undefined' || typeof IntersectionObserver === 'undefined') {
        return null;
    }

    if (sharedRevealObserver) {
        return sharedRevealObserver;
    }

    sharedRevealObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            entry.target.classList.add('reveal-visible');
            entry.target.removeAttribute('data-reveal-bound');
            sharedRevealObserver.unobserve(entry.target);
        });
    }, {
        root: null,
        rootMargin: '0px 0px -8% 0px',
        threshold: 0.05,
    });

    return sharedRevealObserver;
}

function revealIfAlreadyVisible(element) {
    const rect = element.getBoundingClientRect();
    const viewportHeight = window.innerHeight || document.documentElement.clientHeight || 0;
    if (rect.top <= viewportHeight * 0.92) {
        element.classList.add('reveal-visible');
        return true;
    }
    return false;
}

export const useScrollReveal = (dependencies = []) => {
    useEffect(() => {
        if (typeof document === 'undefined') return undefined;

        const observer = getRevealObserver();
        const rafId = window.requestAnimationFrame(() => {
            const scrollRevealElements = document.querySelectorAll('.reveal:not(.reveal-visible):not([data-reveal-bound])');

            scrollRevealElements.forEach((element) => {
                if (revealIfAlreadyVisible(element)) {
                    return;
                }

                if (!observer) {
                    element.classList.add('reveal-visible');
                    return;
                }

                element.setAttribute('data-reveal-bound', 'true');
                observer.observe(element);
            });
        });

        return () => {
            window.cancelAnimationFrame(rafId);
        };
    }, dependencies);
};
