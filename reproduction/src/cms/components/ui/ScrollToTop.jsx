import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const ScrollToTop = () => {
    const { pathname, hash } = useLocation();

    useEffect(() => {
        if (!hash) {
            window.scrollTo(0, 0);
        } else {
            // Wait slightly for the page to render before scrolling to hash
            setTimeout(() => {
                const id = hash.replace('#', '');
                const element = document.getElementById(id);
                if (element) {
                    const yOffset = -100; // Account for fixed header
                    const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
                    window.scrollTo({ top: y, behavior: 'smooth' });
                } else {
                    window.scrollTo(0, 0);
                }
            }, 100);
        }
    }, [pathname, hash]);

    return null;
};

export default ScrollToTop;
