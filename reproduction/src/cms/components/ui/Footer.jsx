import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/cms/i18n/useLanguage';
import { getLocalizedPath } from '@/cms/i18n/routes';
import { definePreview } from '@/cms/lib/preview';
import Icon from '@/cms/components/ui/Icon';
import { renderCmsInline } from '@/cms/components/ui/CmsText';
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
    const { language, t, globalCmsData } = useLanguage();

    const frDescription = globalCmsData?.data?.cc_876q8v4ei;
    const actualDescription = (language === 'FR' && frDescription) ? frDescription : (description ?? '');
    const actualAddress = address ?? '';
    const actualPhone = phone ?? '';
    const actualEmail = email ?? '';
    const actualInstaUrl = instaUrl ?? '';
    const actualFacebookUrl = globalCmsData?.data?.facebook_url || '';
    const actualLinkedinUrl = globalCmsData?.data?.cc_8msyofywx || '';

    return (
        <>
        <footer className="bg-primary text-white py-8 px-6">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between gap-10 text-center md:text-left items-center md:items-start">
                <div className="space-y-4 flex flex-col items-center md:items-start max-w-sm">
                    <img
                        alt="Fabry Logo White"
                        className="h-8 brightness-0 invert"
                        src={logo}
                        width="65"
                        height="32"
                    />
                    <p className="text-white leading-relaxed text-xs">
                        {renderCmsInline(actualDescription)}
                    </p>
                </div>

                <div className="hidden md:flex flex-col items-center">
                    <h3 className="font-bold text-[10px] mb-4 tracking-widest uppercase text-white">{language === 'FR' ? 'Mes réseaux' : 'Meine Netzwerke'}</h3>
                    <div className="flex gap-3">
                        {actualInstaUrl && (
                            <a className="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center hover:bg-white/10 transition-all" href={actualInstaUrl} target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
                            </a>
                        )}
                        {actualFacebookUrl && (
                            <a className="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center hover:bg-white/10 transition-all" href={actualFacebookUrl} target="_blank" rel="noopener noreferrer" aria-label="Facebook">
                                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                            </a>
                        )}
                        {actualLinkedinUrl && (
                            <a className="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center hover:bg-white/10 transition-all" href={actualLinkedinUrl} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
                                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                            </a>
                        )}
                    </div>
                </div>

                <div className="space-y-4">
                    <h3 className="font-bold text-[10px] mb-4 tracking-widest uppercase text-white">{t('footer.contact')}</h3>
                    <ul className="space-y-2 text-white/95 text-xs flex flex-col items-center md:items-start text-center md:text-left">
                        <li className="flex items-start gap-3 justify-center md:justify-start">
                            <Icon name="location_on" className="text-white text-sm shrink-0" />
                            {actualAddress && (
                                <a
                                    href="https://maps.app.goo.gl/syziuAu3hqbNM2tP6"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="hover:text-white transition-colors"
                                >
                                    {renderCmsInline(actualAddress)}
                                </a>
                            )}
                        </li>
                        <li className="flex items-center gap-3 justify-center md:justify-start">
                            <Icon name="phone" className="text-white/80 text-sm shrink-0" />
                            {actualPhone && <a href={`tel:${actualPhone.replace(/\s/g, '')}`} className="hover:text-white transition-colors">{actualPhone}</a>}
                        </li>
                        <li className="flex items-center gap-3 justify-center md:justify-start">
                            <Icon name="mail" className="text-white/80 text-sm shrink-0" />
                            {actualEmail && <a href={`mailto:${actualEmail}`} className="hover:text-white transition-colors no-underline">{actualEmail}</a>}
                        </li>
                    </ul>
                </div>
            </div>
            <div className="max-w-7xl mx-auto mt-10 pt-4 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4 text-[9px] text-white/90 uppercase tracking-[0.3em]">
                <p>© {new Date().getFullYear()} Fabry Baumpflege. {t('footer.rights')}</p>
                <div className="flex gap-8 items-center">
                    <Link className="hover:text-white transition-colors no-underline" to={getLocalizedPath('imprint', language)}>{t('footer.imprint')}</Link>
                    <Link className="hover:text-white transition-colors no-underline" to={getLocalizedPath('privacy', language)}>{t('footer.privacy')}</Link>
                </div>
            </div>
        </footer>
        <div className="bg-[#2a411a] py-3 text-center text-[9px] text-white/50 tracking-[0.15em]">
            <p>made with <span className="text-white">&#10084;</span> by <a href="https://laconis.be" target="_blank" rel="noopener noreferrer" className="text-white/70 hover:text-white transition-colors no-underline">lac&#248;nis</a></p>
        </div>
        </>
    );
};

export default Footer;
