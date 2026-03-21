import { useEffect } from 'react';

const registry = new Set();
let rafId = null;
let isRunning = false;
let lastScrollY = 0;
let scrollTimeout = null;

const updateLayouts = () => {
    registry.forEach(item => {
        if (item.ref.current) {
            const rect = item.ref.current.getBoundingClientRect();
            item.layout = {
                top: rect.top + window.pageYOffset,
                height: rect.height
            };
        }
    });
};

const runLoop = () => {
    const scrollY = window.pageYOffset;
    const vh = window.innerHeight;
    const isMobile = window.innerWidth < 768;

    // Only update if we've actually scrolled or are in a small buffer
    registry.forEach(item => {
        const el = item.ref.current;
        if (!el || !item.layout) return;

        const { speed, maxTravel, scale } = item.options;
        const top = item.layout.top - scrollY;
        const bottom = top + item.layout.height;

        if (bottom > -100 && top < vh + 100) {
            const centerOffset = (top + item.layout.height / 2) - (vh / 2);
            
            // Reduced motion on mobile (50%)
            const finalTravel = isMobile ? maxTravel * 0.5 : maxTravel;
            
            const travel = centerOffset * -speed;
            const clampedTravel = Math.max(-finalTravel, Math.min(finalTravel, travel));

            el.style.setProperty('transform', `translate3d(0, ${clampedTravel.toFixed(2)}px, 0) scale(${scale})`, 'important');
        }
    });

    if (isRunning) {
        rafId = requestAnimationFrame(runLoop);
    }
};

const startLoop = () => {
    if (!isRunning) {
        isRunning = true;
        updateLayouts();
        rafId = requestAnimationFrame(runLoop);
    }
};

const stopLoop = () => {
    isRunning = false;
    if (rafId) {
        cancelAnimationFrame(rafId);
        rafId = null;
    }
};

if (typeof window !== 'undefined') {
    const handleScroll = () => {
        startLoop();
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(stopLoop, 1000); // Keep running for 1s after scroll
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', () => {
        updateLayouts();
    }, { passive: true });
}

export const useParallax = (ref, { speed = 0.05, maxTravel = 20, scale = 1.1, disabled = false } = {}) => {
    useEffect(() => {
        const el = ref.current;
        if (!el || disabled) return;

        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (prefersReducedMotion) return;

        // Force transition none to prevent lag
        el.style.setProperty('transition', 'none', 'important');
        el.style.setProperty('will-change', 'transform', 'important');

        const item = {
            ref,
            options: { speed, maxTravel, scale },
            layout: null
        };

        const updateItem = () => {
            const rect = el.getBoundingClientRect();
            item.layout = {
                top: rect.top + window.pageYOffset,
                height: rect.height
            };
        };

        updateItem();
        registry.add(item);

        // Re-calculate after a short delay for lazy-loaded images
        const t1 = setTimeout(updateItem, 500);
        const t2 = setTimeout(updateItem, 1500);

        // Ensure loop starts on first use
        startLoop();

        return () => {
            clearTimeout(t1);
            clearTimeout(t2);
            registry.delete(item);
            if (registry.size === 0) {
                stopLoop();
            }
        };
    }, [ref, speed, maxTravel, scale, disabled]);
};
