import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const ScrollToTop = () => {
    const { pathname, hash } = useLocation();

    useEffect(() => {
        if (!hash) {
            window.scrollTo(0, 0);
            return;
        }

        const id = hash.replace('#', '');
        const targetElement = document.getElementById(id);
        const isMobile = typeof window !== 'undefined' && window.innerWidth < 1024;

        if (!isMobile) {
            window.scrollTo(0, 0);
            return;
        }

        // ─── STICKY SCROLL REFINEMENT ───
        // We use a ResizeObserver on the document's body to catch ANY layout shift
        // that pushes the target element's position.
        let isUserScrolling = false;
        
        const performScroll = () => {
            if (isUserScrolling) return; 
            const element = document.getElementById(id);
            if (!element) return;
            
            const yOffset = -120; // Exact match per user request
            const rect = element.getBoundingClientRect();
            const absoluteY = rect.top + window.pageYOffset + yOffset;
            
            // Only jump if it's currently off-target by more than 10px
            if (Math.abs(window.pageYOffset - absoluteY) > 10) {
                window.scrollTo({ top: absoluteY, behavior: 'auto' });
            }
        };

        // Initial Attempt
        const timer = setTimeout(performScroll, 50);

        // Observer for layout shifts (e.g., sections above finally loading)
        const observer = new ResizeObserver(() => {
            performScroll();
        });

        // Track when user takes over to stop "fighting" them
        const onTouchStart = () => { isUserScrolling = true; };
        window.addEventListener('touchstart', onTouchStart, { passive: true });
        window.addEventListener('wheel', onTouchStart, { passive: true });

        // Observe the main content container if possible, or just the body
        observer.observe(document.body);

        return () => {
            clearTimeout(timer);
            observer.disconnect();
            window.removeEventListener('touchstart', onTouchStart);
            window.removeEventListener('wheel', onTouchStart);
        };
    }, [pathname, hash]);

    return null;
};

export default ScrollToTop;
