import React, { useState, useEffect, useRef, useLayoutEffect } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useLanguage } from '@/cms/i18n/useLanguage';
import { getLocalizedPath } from '@/cms/i18n/routes';
import { definePreview } from '@/cms/lib/preview';
import logo from '@/assets/Baumpflege-Fabry-Logo.svg';
import { resolveInstanceProps } from '@/cms/bridge-resolver';
import Icon from '@/cms/components/ui/Icon';

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
    const navigate = useNavigate();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMode, setIsMobileMode] = useState(() => (
        typeof window !== 'undefined' ? window.innerWidth < 1180 : false
    ));

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
            setIsMobileMode(window.innerWidth < 1180 || requiredWidth >= availableWidth);
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
    const menuButtonLabel = isMenuOpen
        ? (language === 'FR' ? 'Fermer le menu' : 'Menü schließen')
        : (language === 'FR' ? 'Ouvrir le menu' : 'Menü öffnen');
    const deLanguageLabel = language === 'FR' ? 'Passer en allemand' : 'Sprache auf Deutsch wechseln';
    const frLanguageLabel = language === 'FR' ? 'Passer en français' : 'Sprache auf Französisch wechseln';

    const [isClosing, setIsClosing] = useState(false);

    const toggleMenu = () => {
        if (isMenuOpen) {
            animateClose();
        } else {
            setIsMenuOpen(true);
        }
    };

    const animateClose = () => {
        setIsClosing(true);
        setTimeout(() => {
            setIsMenuOpen(false);
            setIsClosing(false);
        }, 280);
    };

    const closeMenu = () => {
        setIsMenuOpen(false);
        setIsClosing(false);
    };

    useEffect(() => {
        if (isMenuOpen && !isClosing && isMobileMode) {
            document.body.style.overflow = 'hidden';
            window.scrollTo({ top: 0, behavior: 'instant' });
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isMenuOpen, isClosing, isMobileMode]);

    useEffect(() => {
        if (!isMobileMode && isMenuOpen) {
            closeMenu();
        }
    }, [isMobileMode, isMenuOpen]);

    const [tappedIdx, setTappedIdx] = useState(null);

    const handleMobileLinkClick = (e, idx) => {
        e.preventDefault();
        const href = e.currentTarget.getAttribute('href');
        setTappedIdx(idx);
        // Navigate immediately so page starts loading in background
        navigate(href);
        // Brief tap highlight, then animate menu closed
        setTimeout(() => {
            setTappedIdx(null);
            animateClose();
        }, 100);
    };

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
                    onClick={isMobile ? (e) => handleMobileLinkClick(e, idx) : undefined}
                    className={({ isActive }) => {
                        // Custom logic to keep parent route active on sub-pages
                        const currentPath = location.pathname;
                        const itemPath = resolved.href || resolved.link || item.href;

                        // "Referenzen" should be active if we are on /referenzen OR /referenzen/*
                        // "Leistungen" should be active if we are on /leistungen OR /leistungen/*
                        const isSubPathActive = itemPath !== '/' && itemPath !== '/fr' && currentPath.startsWith(itemPath);
                        const effectivelyActive = isActive || isSubPathActive;

                        if (isMobile) {
                            const isTapped = tappedIdx === idx;
                            return `text-[1.1rem] font-sans font-medium uppercase tracking-[0.2em] transition-colors duration-150 py-2 px-4 rounded-lg ${
                                isTapped
                                    ? 'text-primary bg-primary/10 scale-[0.97]'
                                    : effectivelyActive
                                        ? 'text-primary'
                                        : 'text-muted-accessible active:text-primary active:bg-primary/10'
                            }`;
                        }
                        return `hover:text-primary transition-colors whitespace-nowrap ${effectivelyActive ? 'text-primary border-b-2 border-primary pb-1' : ''}`;
                    }}
                >
                    {resolved.label || resolved.text || item.label}
                </NavLink>
            );
        });
    };

    return (
        <nav className={`fixed top-0 w-full z-[100] transition-[background-color,border-color,box-shadow,padding] duration-300 ease-out ${isScrolled || isMenuOpen
            ? 'bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 py-0 shadow-sm'
            : 'bg-white dark:bg-slate-900 border-b border-slate-100/60 dark:border-slate-800/60 py-2'
            }`}>
            <div ref={containerRef} className="max-w-7xl mx-auto px-4 md:px-6 h-16 md:h-20 flex items-center justify-between">
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
                        className={`w-auto object-contain transition-[height] duration-300 ${isMobileMode ? 'h-10 md:h-12' : (isScrolled ? 'h-12' : 'h-16')}`}
                        src={logo}
                        width="130"
                        height="64"
                        style={{ aspectRatio: '130 / 64' }}
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
                                aria-label={deLanguageLabel}
                                aria-pressed={language === 'DE'}
                                className={`transition-all duration-300 ${language === 'DE' ? 'opacity-100 text-primary border-b-2 border-primary' : 'opacity-70 hover:opacity-100 text-muted-accessible'}`}
                            >
                                DE
                            </button>
                            <span className="opacity-10 mx-1">|</span>
                            <button
                                onClick={() => setLanguage('FR')}
                                aria-label={frLanguageLabel}
                                aria-pressed={language === 'FR'}
                                className={`transition-all duration-300 ${language === 'FR' ? 'opacity-100 text-primary border-b-2 border-primary' : 'opacity-70 hover:opacity-100 text-muted-accessible'}`}
                            >
                                FR
                            </button>
                        </div>
                        <Link
                            to={getLocalizedPath('contact', language)}
                            className="bg-primary text-white px-6 py-2 rounded-full hover:bg-opacity-90 transition-colors text-xs font-bold uppercase tracking-widest whitespace-nowrap"
                        >
                            {actualCtaLabel}
                        </Link>
                    </div>
                </div>

                {isMobileMode && (
                    <div className="flex items-center gap-2 z-50 relative animate-in fade-in duration-300">
                        <Link
                            to={getLocalizedPath('contact', language)}
                            className="bg-primary text-white px-3 py-1.5 rounded-full transition-colors text-[0.55rem] font-bold uppercase tracking-[0.14em] whitespace-nowrap"
                        >
                            {actualCtaLabel}
                        </Link>
                        <button
                            className="text-primary flex items-center justify-center"
                            onClick={toggleMenu}
                            aria-label={menuButtonLabel}
                            aria-expanded={isMenuOpen}
                            aria-controls="mobile-navigation"
                        >
                            <Icon name={isMenuOpen ? 'close' : 'menu'} className={`text-[1.7rem] transition-transform duration-300 ${isMenuOpen ? 'rotate-90' : 'rotate-0'}`} />
                        </button>
                    </div>
                )}
            </div>

            {((isMenuOpen || isClosing) && isMobileMode) && (
                <div
                    id="mobile-navigation"
                    className={`absolute top-full left-0 w-full bg-white dark:bg-slate-900 shadow-xl border-b border-slate-100 dark:border-slate-800 flex flex-col items-center py-8 gap-8 z-[100] transition-[transform,opacity] duration-300 ease-out origin-top ${
                        isClosing
                            ? 'opacity-0 -translate-y-4 scale-y-95 pointer-events-none'
                            : 'opacity-100 translate-y-0 scale-y-100 animate-in slide-in-from-top duration-300'
                    }`}
                >
                    <div className="flex flex-col items-center gap-6 w-full px-6">
                        {renderLinks(true)}
                    </div>

                    <div className="w-full px-6 flex justify-center mt-2">
                        <Link
                            to={getLocalizedPath('contact', language)}
                            onClick={(e) => { e.preventDefault(); navigate(getLocalizedPath('contact', language)); animateClose(); }}
                            className="bg-primary text-white px-8 py-3 rounded-full text-sm uppercase tracking-widest font-bold shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-[transform,box-shadow,background-color] text-center w-full max-w-[200px]"
                        >
                            {actualCtaLabel}
                        </Link>
                    </div>

                    <div className="flex items-center justify-center gap-6 mt-4 pt-6 border-t border-slate-100 dark:border-slate-800/50 w-full text-sm tracking-[0.3em] font-bold">
                        <button
                            onClick={() => { setLanguage('DE'); animateClose(); }}
                            aria-label={deLanguageLabel}
                            aria-pressed={language === 'DE'}
                            className={`transition-[opacity,color,transform] duration-300 ${language === 'DE' ? 'opacity-100 text-primary scale-110' : 'opacity-70 hover:opacity-100'}`}
                        >
                            DE
                        </button>
                        <span className="opacity-20 text-xl font-light">|</span>
                        <button
                            onClick={() => { setLanguage('FR'); animateClose(); }}
                            aria-label={frLanguageLabel}
                            aria-pressed={language === 'FR'}
                            className={`transition-[opacity,color,transform] duration-300 ${language === 'FR' ? 'opacity-100 text-primary scale-110' : 'opacity-70 hover:opacity-100'}`}
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
