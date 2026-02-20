import { useEffect, useRef } from 'react';

export const useParallax = (scaleFactor = 0.0002, translateFactor = 0.2) => {
    const heroRef = useRef(null);

    useEffect(() => {
        let rafId;
        const handleScroll = () => {
            if (!heroRef.current) return;

            const isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
            const isMobile = window.innerWidth <= 768;

            if (isReducedMotion || isMobile) {
                heroRef.current.style.transform = 'scale(1.1) translateY(0px)';
                return;
            }

            const scrollY = window.scrollY;
            const scale = 1.1 + scrollY * scaleFactor;
            const translate = scrollY * translateFactor;

            heroRef.current.style.transform = `scale3d(${scale}, ${scale}, 1) translate3d(0, ${translate}px, 0)`;
        };

        const onScroll = () => {
            cancelAnimationFrame(rafId);
            rafId = requestAnimationFrame(handleScroll);
        };

        window.addEventListener('scroll', onScroll, { passive: true });

        // Initial run
        handleScroll();

        return () => {
            window.removeEventListener('scroll', onScroll);
            cancelAnimationFrame(rafId);
        };
    }, [scaleFactor, translateFactor]);

    return heroRef;
};
