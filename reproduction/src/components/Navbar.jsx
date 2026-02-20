import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';

const Navbar = () => {
    const { language, setLanguage } = useLanguage();
    const [isMenuOpen, setIsMenuOpen] = React.useState(false);

    const navItems = [
        { name: { DE: 'Startseite', FR: 'Accueil' }, path: '/' },
        { name: { DE: 'Leistungen', FR: 'Services' }, path: '/leistungen' },
        { name: { DE: 'Über Mich', FR: 'À Propos' }, path: '/über-mich' },
        { name: { DE: 'Referenzen', FR: 'Références' }, path: '/referenzen' },
    ];

    return (
        <nav className="fixed top-0 w-full z-50 bg-background-light/90 dark:bg-background-dark/90 backdrop-blur-md border-b border-slate-100 dark:border-slate-800">
            <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                <Link to="/" className="flex items-center gap-2">
                    <img
                        alt="Fabry Baumpflege Logo"
                        className="h-14 w-auto object-contain"
                        src="/src/assets/Baumpflege-Fabry-Logo.svg"
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
                    className="md:hidden text-primary z-50 relative"
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                >
                    <span className="material-symbols-outlined text-3xl">
                        {isMenuOpen ? 'close' : 'menu'}
                    </span>
                </button>

                {/* Mobile Menu */}
                <div className={`fixed inset-0 bg-background-light dark:bg-background-dark z-40 flex flex-col items-center justify-center gap-8 transition-all duration-500 md:hidden ${isMenuOpen ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-full pointer-events-none'
                    }`}>
                    {navItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            onClick={() => setIsMenuOpen(false)}
                            className={({ isActive }) =>
                                `text-2xl font-serif uppercase tracking-widest transition-colors ${isActive ? 'text-primary' : 'text-slate-400'}`
                            }
                        >
                            {item.name[language]}
                        </NavLink>
                    ))}
                    <Link
                        to="/kontakt"
                        onClick={() => setIsMenuOpen(false)}
                        className="bg-primary text-white px-10 py-4 rounded-full text-lg uppercase tracking-widest font-bold mt-4"
                    >
                        {language === 'DE' ? 'Kontakt' : 'Contact'}
                    </Link>

                    <div className="flex items-center gap-4 mt-8 text-sm tracking-[0.3em] font-bold">
                        <button
                            onClick={() => { setLanguage('DE'); setIsMenuOpen(false); }}
                            className={`transition-all duration-300 ${language === 'DE' ? 'opacity-100 text-primary' : 'opacity-40'}`}
                        >
                            DE
                        </button>
                        <span className="opacity-20 text-xl">|</span>
                        <button
                            onClick={() => { setLanguage('FR'); setIsMenuOpen(false); }}
                            className={`transition-all duration-300 ${language === 'FR' ? 'opacity-100 text-primary' : 'opacity-40'}`}
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
