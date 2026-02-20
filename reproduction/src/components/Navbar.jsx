import React, { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useLanguage } from '../i18n/useLanguage';
import logo from '../assets/Baumpflege-Fabry-Logo.svg';

const Navbar = () => {
    const { language, setLanguage } = useLanguage();
    const [isMenuOpen, setIsMenuOpen] = React.useState(false);
    const [isScrolled, setIsScrolled] = React.useState(false);

    React.useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 20) {
                setIsScrolled(true);
            } else {
                setIsScrolled(false);
            }
        };

        window.addEventListener('scroll', handleScroll);
        // Initial check
        handleScroll();

        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const navItems = [
        { name: { DE: 'Startseite', FR: 'Accueil' }, path: '/' },
        { name: { DE: 'Leistungen', FR: 'Services' }, path: '/leistungen' },
        { name: { DE: 'Über Mich', FR: 'À Propos' }, path: '/über-mich' },
        { name: { DE: 'Referenzen', FR: 'Références' }, path: '/referenzen' },
    ];

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
        if (!isMenuOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
    };

    const closeMenu = () => {
        setIsMenuOpen(false);
        document.body.style.overflow = 'unset';
    };

    return (
        <nav className={`fixed top-0 w-full z-[100] transition-all duration-500 ease-in-out ${isScrolled || isMenuOpen
                ? 'bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-100 dark:border-slate-800 py-0 shadow-sm'
                : 'bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm border-b border-slate-100/50 dark:border-slate-800/50 py-2'
            }`}>
            <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                <Link to="/" className="flex items-center gap-2">
                    <img
                        alt="Fabry Baumpflege Logo"
                        className={`w-auto object-contain transition-all duration-500 ${isScrolled ? 'h-12' : 'h-16'
                            }`}
                        src={logo}
                    />
                </Link>
                <div className="hidden md:flex items-center space-x-10 text-sm font-medium uppercase tracking-widest">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            className={({ isActive }) =>
                                `hover:text-primary transition-colors ${isActive ? 'text-primary border-b-2 border-primary pb-1' : ''}`
                            }
                        >
                            {item.name[language]}
                        </NavLink>
                    ))}

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
                            to="/kontakt"
                            className="bg-primary text-white px-6 py-2 rounded-full hover:bg-opacity-90 transition-all text-xs font-bold uppercase tracking-widest"
                        >
                            {language === 'DE' ? 'Kontakt' : 'Contact'}
                        </Link>
                    </div>
                </div>

                {/* Mobile Toggle */}
                <button
                    className="md:hidden text-primary z-50 relative flex items-center justify-center"
                    onClick={toggleMenu}
                >
                    <span className={`material-symbols-outlined text-3xl transition-transform duration-300 ${isMenuOpen ? 'rotate-90' : 'rotate-0'}`}>
                        {isMenuOpen ? 'close' : 'menu'}
                    </span>
                </button>

                {/* Mobile Menu Overlay */}
                <div
                    className={`fixed inset-0 bg-black/40 backdrop-blur-[2px] z-[90] transition-all duration-500 md:hidden ${isMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
                        }`}
                    onClick={closeMenu}
                ></div>

                {/* Mobile Menu Panel */}
                <div className={`fixed top-0 right-0 h-full w-[300px] bg-white/95 dark:bg-background-dark/95 backdrop-blur-xl z-[100] flex flex-col p-10 transform transition-transform duration-500 ease-in-out md:hidden shadow-2xl ${isMenuOpen ? 'translate-x-0' : 'translate-x-full'
                    }`}>
                    <div className="flex flex-col gap-8 mt-16 flex-grow">
                        {navItems.map((item) => (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                onClick={closeMenu}
                                className={({ isActive }) =>
                                    `text-xl font-serif uppercase tracking-widest transition-colors ${isActive ? 'text-primary' : 'text-slate-500 hover:text-primary'}`
                                }
                            >
                                {item.name[language]}
                            </NavLink>
                        ))}
                        <Link
                            to="/kontakt"
                            onClick={closeMenu}
                            className="bg-primary text-white px-8 py-3 rounded-full text-sm uppercase tracking-widest font-bold mt-4 shadow-lg hover:bg-opacity-90 inline-block text-center"
                        >
                            {language === 'DE' ? 'Kontakt' : 'Contact'}
                        </Link>
                    </div>

                    <div className="flex items-center justify-center gap-8 mt-auto pt-8 border-t border-slate-100 dark:border-slate-800 text-sm tracking-[0.3em] font-bold">
                        <button
                            onClick={() => { setLanguage('DE'); closeMenu(); }}
                            className={`transition-all duration-300 ${language === 'DE' ? 'opacity-100 text-primary scale-110' : 'opacity-40 hover:opacity-60'}`}
                        >
                            DE
                        </button>
                        <span className="opacity-10 text-xl font-light">|</span>
                        <button
                            onClick={() => { setLanguage('FR'); closeMenu(); }}
                            className={`transition-all duration-300 ${language === 'FR' ? 'opacity-100 text-primary scale-110' : 'opacity-40 hover:opacity-60'}`}
                        >
                            FR
                        </button>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
