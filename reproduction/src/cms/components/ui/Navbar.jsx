import React, { useState, useEffect, useRef, useLayoutEffect } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { useLanguage } from '@/cms/i18n/useLanguage';
import { getLocalizedPath } from '@/cms/i18n/routes';
import { definePreview } from '@/cms/lib/preview';
import logo from '@/assets/Baumpflege-Fabry-Logo.svg';
import { resolveInstanceProps } from '@/cms/bridge-resolver';

/**
 * Preview Metadata for ContentBridge scanning.
 */

const Navbar = ({ 
    links, 
    ctaLabel,
    page = 'Global',
    section = 'Navbar'
}) => {
    const { language, setLanguage, t, globalCmsData } = useLanguage();
    const location = useLocation();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMode, setIsMobileMode] = useState(false);

    const containerRef = useRef(null);
    const logoRef = useRef(null);
    const desktopNavRef = useRef(null);

    // Dynamic collision detection
    useLayoutEffect(() => {
        const checkCollision = () => {
            if (!containerRef.current || !logoRef.current || !desktopNavRef.current) return;
            const availableWidth = containerRef.current.clientWidth - 48;
            const logoWidth = logoRef.current.getBoundingClientRect().width;
            const navWidth = desktopNavRef.current.scrollWidth;
            const requiredWidth = logoWidth + navWidth + 24;
            setIsMobileMode(requiredWidth >= availableWidth);
        };

        checkCollision();
        const resizeObserver = new ResizeObserver(() => checkCollision());
        if (containerRef.current) resizeObserver.observe(containerRef.current);
        if (logoRef.current) resizeObserver.observe(logoRef.current);
        if (desktopNavRef.current) resizeObserver.observe(desktopNavRef.current);

        return () => resizeObserver.disconnect();
    }, [language, isScrolled]);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll, { passive: true });
        handleScroll();
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Fallback menu items (translatable)
    const fallbackLinks = [
        { label: t('nav.home'), href: getLocalizedPath('home', language), routeKey: 'home' },
        { label: t('nav.services'), href: getLocalizedPath('services', language), routeKey: 'services' },
        { label: t('nav.about'), href: getLocalizedPath('about', language), routeKey: 'about' },
        { label: t('nav.references'), href: getLocalizedPath('references', language), routeKey: 'references' },
    ];

    const actualLinks = links || fallbackLinks;
    const actualCtaLabel = ctaLabel || t('nav.contact');

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
        document.body.style.overflow = !isMenuOpen ? 'hidden' : 'unset';
    };

    const closeMenu = () => {
        setIsMenuOpen(false);
        document.body.style.overflow = 'unset';
    };

    useEffect(() => {
        if (!isMobileMode && isMenuOpen) {
            closeMenu();
        }
    }, [isMobileMode, isMenuOpen]);

    const renderLinks = (isMobile = false) => {
        return actualLinks.map((item, idx) => {
            // Support hierarchical resolution for individual NAV items
            const resolved = resolveInstanceProps(
                page, 
                `${section}/NavLink`, 
                item, 
                globalCmsData
            );
            
            return (
                <NavLink
                    key={idx}
                    to={resolved.href || resolved.link || item.href}
                    end={item.routeKey === 'home' || item.href === '/' || item.href === '/fr'}
                    onClick={isMobile ? closeMenu : undefined}
                    className={({ isActive }) =>
                        isMobile 
                            ? `text-lg font-serif uppercase tracking-widest transition-colors ${isActive ? 'text-primary' : 'text-slate-500 hover:text-primary'}`
                            : `hover:text-primary transition-colors whitespace-nowrap ${isActive ? 'text-primary border-b-2 border-primary pb-1' : ''}`
                    }
                >
                    {resolved.label || resolved.text || item.label}
                </NavLink>
            );
        });
    };

    return (
        <nav className={`fixed top-0 w-full z-[100] transition-all duration-500 ease-in-out ${isScrolled || isMenuOpen
            ? 'bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-100 dark:border-slate-800 py-0 shadow-sm'
            : 'bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm border-b border-slate-100/50 dark:border-slate-800/50 py-2'
            }`}>
            <div ref={containerRef} className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                <Link
                    to={getLocalizedPath('home', language)}
                    className="flex items-center gap-2"
                    onClick={(e) => {
                        const homePath = getLocalizedPath('home', language);
                        if (location.pathname === homePath) {
                            e.preventDefault();
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                        }
                    }}
                >
                    <img
                        ref={logoRef}
                        alt="Fabry Baumpflege Logo"
                        className={`w-auto object-contain transition-all duration-500 ${isScrolled ? 'h-12' : 'h-16'}`}
                        src={logo}
                    />
                </Link>

                <div
                    ref={desktopNavRef}
                    className={`flex items-center space-x-10 text-sm font-medium uppercase tracking-widest ${isMobileMode ? 'absolute opacity-0 pointer-events-none invisible' : 'relative opacity-100 visible'
                        }`}
                >
                    {renderLinks(false)}

                    <div className="flex items-center gap-4 pl-6 border-l border-slate-200 dark:border-slate-700">
                        <div className="flex items-center gap-2 text-xs tracking-[0.2em] font-bold">
                            <button
                                onClick={() => setLanguage('DE')}
                                className={`transition-all duration-300 ${language === 'DE' ? 'opacity-100 text-primary' : 'opacity-40 hover:opacity-70 text-slate-600 dark:text-slate-400'}`}
                            >
                                DE
                            </button>
                            <span className="opacity-20">|</span>
                            <button
                                onClick={() => setLanguage('FR')}
                                className={`transition-all duration-300 ${language === 'FR' ? 'opacity-100 text-primary' : 'opacity-40 hover:opacity-70 text-slate-600 dark:text-slate-400'}`}
                            >
                                FR
                            </button>
                        </div>
                        <Link
                            to={getLocalizedPath('contact', language)}
                            className="bg-primary text-white px-6 py-2 rounded-full hover:bg-opacity-90 transition-all text-xs font-bold uppercase tracking-widest whitespace-nowrap"
                        >
                            {actualCtaLabel}
                        </Link>
                    </div>
                </div>

                {isMobileMode && (
                    <button
                        className="text-primary z-50 relative flex items-center justify-center animate-in fade-in duration-300"
                        onClick={toggleMenu}
                        aria-label="Toggle Menu"
                    >
                        <span className={`material-symbols-outlined text-3xl transition-transform duration-300 ${isMenuOpen ? 'rotate-90' : 'rotate-0'}`}>
                            {isMenuOpen ? 'close' : 'menu'}
                        </span>
                    </button>
                )}
            </div>

            {(isMenuOpen && isMobileMode) && (
                <div className="absolute top-full left-0 w-full bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl shadow-2xl border-b border-slate-100 dark:border-slate-800 flex flex-col items-center py-8 gap-8 z-[100] animate-in slide-in-from-top duration-300">
                    <div className="flex flex-col items-center gap-6 w-full px-6">
                        {renderLinks(true)}
                    </div>

                    <div className="w-full px-6 flex justify-center mt-2">
                        <Link
                            to={getLocalizedPath('contact', language)}
                            onClick={closeMenu}
                            className="bg-primary text-white px-8 py-3 rounded-full text-sm uppercase tracking-widest font-bold shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all text-center w-full max-w-[200px]"
                        >
                            {actualCtaLabel}
                        </Link>
                    </div>

                    <div className="flex items-center justify-center gap-6 mt-4 pt-6 border-t border-slate-100 dark:border-slate-800/50 w-full text-sm tracking-[0.3em] font-bold">
                        <button
                            onClick={() => { setLanguage('DE'); closeMenu(); }}
                            className={`transition-all duration-300 ${language === 'DE' ? 'opacity-100 text-primary scale-110' : 'opacity-40 hover:opacity-60'}`}
                        >
                            DE
                        </button>
                        <span className="opacity-20 text-xl font-light">|</span>
                        <button
                            onClick={() => { setLanguage('FR'); closeMenu(); }}
                            className={`transition-all duration-300 ${language === 'FR' ? 'opacity-100 text-primary scale-110' : 'opacity-40 hover:opacity-60'}`}
                        >
                            FR
                        </button>
                    </div>
                </div>
            )}
        </nav>
    );
};

export default Navbar;
