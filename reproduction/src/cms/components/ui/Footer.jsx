import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/cms/i18n/useLanguage';
import { getLocalizedPath } from '@/cms/i18n/routes';
import { definePreview } from '@/cms/lib/preview';
import logo from '@/assets/Baumpflege-Fabry-Logo.svg';

/**
 * Preview Metadata for ContentBridge scanning.
 */

const Footer = ({
    description,
    address,
    phone,
    email,
    instaUrl,
    page = 'Global',
    section = 'Footer'
}) => {
    const { language, t } = useLanguage();

    const actualDescription = description || t('footer.description');
    const actualAddress = address || 'Halloux 16, 4830 Limbourg';
    const actualPhone = phone || '+32 476 32 09 69';
    const actualEmail = email || 'info@fabry-baumpflege.be';
    const actualInstaUrl = instaUrl || 'https://www.instagram.com/fabry_baumpflege';

    return (
        <footer className="bg-primary text-white py-8 px-6">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between gap-10 text-center md:text-left items-center md:items-start">
                <div className="space-y-4 flex flex-col items-center md:items-start max-w-sm">
                    <img
                        alt="Fabry Logo White"
                        className="h-8 brightness-0 invert"
                        src={logo}
                    />
                    <p className="text-white/70 leading-relaxed text-xs">
                        {actualDescription}
                    </p>
                    <div className="flex gap-4">
                        <a
                            className="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center hover:bg-white/10 transition-all font-sans"
                            href={actualInstaUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"></path>
                            </svg>
                        </a>
                    </div>
                </div>

                <div className="hidden md:block">
                    <h4 className="font-bold text-[10px] mb-4 tracking-widest uppercase text-white/90">{t('footer.nav')}</h4>
                    <ul className="space-y-2 text-white/60 text-xs text-center md:text-left">
                        <li><Link className="hover:text-white transition-colors" to={getLocalizedPath('home', language)}>{t('nav.home')}</Link></li>
                        <li><Link className="hover:text-white transition-colors" to={getLocalizedPath('services', language)}>{t('nav.services')}</Link></li>
                        <li><Link className="hover:text-white transition-colors" to={getLocalizedPath('about', language)}>{t('nav.about')}</Link></li>
                        <li><Link className="hover:text-white transition-colors" to={getLocalizedPath('references', language)}>{t('nav.references')}</Link></li>
                    </ul>
                </div>

                <div className="space-y-4">
                    <h4 className="font-bold text-[10px] mb-4 tracking-widest uppercase text-white/90">{t('footer.contact')}</h4>
                    <ul className="space-y-2 text-white/60 text-xs flex flex-col items-center md:items-start text-center md:text-left">
                        <li className="flex items-start gap-3 justify-center md:justify-start">
                            <span className="material-symbols-outlined text-white/80 text-sm">location_on</span>
                            <a
                                href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(actualAddress)}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="hover:text-white transition-colors"
                            >
                                {actualAddress}
                            </a>
                        </li>
                        <li className="flex items-center gap-3 justify-center md:justify-start">
                            <span className="material-symbols-outlined text-white/80 text-sm">phone</span>
                            <a href={`tel:${actualPhone.replace(/\s/g, '')}`} className="hover:text-white transition-colors">{actualPhone}</a>
                        </li>
                        <li className="flex items-center gap-3 justify-center md:justify-start">
                            <span className="material-symbols-outlined text-white/80 text-sm">mail</span>
                            <a href={`mailto:${actualEmail}`} className="hover:text-white transition-colors underline decoration-white/20 underline-offset-4">{actualEmail}</a>
                        </li>
                    </ul>
                </div>
            </div>
            <div className="max-w-7xl mx-auto mt-10 pt-4 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4 text-[9px] text-white/30 uppercase tracking-[0.3em]">
                <p>© {new Date().getFullYear()} Fabry Baumpflege. {t('footer.rights')}</p>
                <div className="flex gap-8">
                    <Link className="hover:text-white transition-colors" to="/impressum">{t('footer.imprint')}</Link>
                    <Link className="hover:text-white transition-colors" to="/datenschutz">{t('footer.privacy')}</Link>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
