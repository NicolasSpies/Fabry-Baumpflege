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
    const vw = window.innerWidth;
    const isMobile = vw < 768; // Standard breakpoint for mobile disable

    registry.forEach(item => {
        const el = item.ref.current;
        if (!el || !item.layout) return;

        const { speed, maxTravel, scale, desktopOnly } = item.options;
        
        // Strictly honor desktop-only rule if requested (strictly mobile phones < 768)
        if (desktopOnly && isMobile) {
            el.style.setProperty('transform', 'none', 'important');
            return;
        }

        const top = item.layout.top - scrollY;
        const bottom = top + item.layout.height;

        if (bottom > -150 && top < vh + 150) {
            const centerOffset = (top + item.layout.height / 2) - (vh / 2);
            
            // Reduced motion on smaller screens (50%) if not explicitly disabled
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

export const useParallax = (ref, { speed = 0.05, maxTravel = 20, scale = 1.1, disabled = false, desktopOnly = false } = {}) => {
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
            options: { speed, maxTravel, scale, desktopOnly },
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

        // Re-calculate after short delays for lazy-loaded images or reveals
        const t1 = setTimeout(updateItem, 500);
        const t2 = setTimeout(updateItem, 1500);
        const t3 = setTimeout(updateItem, 2500);

        // Ensure loop starts on first use
        startLoop();

        return () => {
            clearTimeout(t1);
            clearTimeout(t2);
            clearTimeout(t3);
            registry.delete(item);
            if (registry.size === 0) {
                stopLoop();
            }
        };
    }, [ref, speed, maxTravel, scale, disabled, desktopOnly]);
};
