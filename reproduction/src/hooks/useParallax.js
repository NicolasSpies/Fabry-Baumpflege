import { useEffect } from 'react';

/**
 * useParallax Hook
 * 
 * Provides a high-performance parallax effect using requestAnimationFrame and transform3d.
 * Avoids React state updates on scroll to prevent re-renders.
 * 
 * @param {React.RefObject} ref - The ref of the element to apply parallax to.
 * @param {Object} options - Configuration options.
 * @param {number} options.speed - Speed factor for translation (default: 0.2).
 * @param {number} options.scaleBase - Base scale of the image (default: 1.1).
 * @param {number} options.scaleSpeed - Speed factor for scaling (default: 0.0001).
 * @param {boolean} options.disabled - Manually disable the effect.
 */
export const useParallax = (ref, { speed = 0.2, scaleBase = 1.1, scaleSpeed = 0.0002, disabled = false } = {}) => {
    useEffect(() => {
        if (!ref.current || disabled) return;

        // Check for prefers-reduced-motion
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        // Check for mobile (simple check)
        const isMobile = window.innerWidth < 768;

        if (prefersReducedMotion || isMobile) return;

        let animationFrameId;
        let lastScrollY = window.scrollY;

        const updateParallax = () => {
            const currentScrollY = window.scrollY;

            // Only update if scroll position changed
            if (currentScrollY !== lastScrollY) {
                const yPos = currentScrollY * speed;
                const scale = scaleBase + currentScrollY * scaleSpeed;

                if (ref.current) {
                    // Use translate3d for GPU acceleration
                    ref.current.style.transform = `translate3d(0, ${yPos}px, 0) scale(${scale})`;
                }

                lastScrollY = currentScrollY;
            }

            animationFrameId = requestAnimationFrame(updateParallax);
        };

        animationFrameId = requestAnimationFrame(updateParallax);

        return () => {
            if (animationFrameId) {
                cancelAnimationFrame(animationFrameId);
            }
        };
    }, [ref, speed, scaleBase, scaleSpeed, disabled]);
};
