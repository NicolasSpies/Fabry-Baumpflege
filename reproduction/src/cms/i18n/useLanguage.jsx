import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { translations } from './translations';
import { ROUTES } from './routes';

const LanguageContext = createContext();

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Derive the active language from a pathname. /fr/… → 'FR', anything else → 'DE'. */
export function getLangFromPath(path) {
    return path.startsWith('/fr') ? 'FR' : 'DE';
}

/** Map a pathname + source language + target language to the corresponding target path. */
function mapPathToTargetLang(currentPath, currentLang, targetLang, alternates = null) {
    if (alternates && alternates[targetLang]) {
        // CONTENT CORE / API DRIVEN: 
        // If the current page has already provided its official translated slugs, use them.
        const slug = alternates[targetLang].slug || alternates[targetLang];
        
        // If it's the home page, it might just be / or /fr
        if (slug === '/' || slug === '/fr') return slug;

        // Otherwise, construct the path. 
        // For subpages, we usually prefix /fr for French if it's not already there.
        if (targetLang === 'FR' && !slug.startsWith('/fr')) {
            return `/fr/${slug.replace(/^\//, '')}`;
        }
        if (targetLang === 'DE') {
            return `/${slug.replace(/^\/fr\//, '').replace(/^\//, '')}`;
        }
        return slug.startsWith('/') ? slug : `/${slug}`;
    }

    const targetRoutes = ROUTES[targetLang];
    const currentRoutes = ROUTES[currentLang];

    // Normalize path for comparison (decode and remove trailing slash)
    const normalize = (p) => decodeURIComponent(p).replace(/\/$/, '') || '/';
    const normalizedCurrent = normalize(currentPath);

    // Exact match on a known static route (non-parameterised)
    for (const [key, path] of Object.entries(currentRoutes)) {
        if (!path.includes(':') && normalize(path) === normalizedCurrent) {
            return targetRoutes[key] ?? (targetLang === 'FR' ? '/fr' : '/');
        }
    }

    const currentDetailBase = normalize(currentRoutes.referenceDetail.split('/:')[0]);
    if (normalizedCurrent === currentDetailBase || normalizedCurrent.startsWith(`${currentDetailBase}/`)) {
        const slug = normalizedCurrent.slice(currentDetailBase.length).replace(/^\//, '');
        const targetDetailBase = normalize(targetRoutes.referenceDetail.split('/:')[0]);
        return slug ? `${targetDetailBase}/${slug}` : targetDetailBase;
    }

    // Fallback to home for unknown paths
    return targetLang === 'FR' ? '/fr' : '/';
}

// ─── Provider ─────────────────────────────────────────────────────────────────

export function LanguageProvider({ children }) {
    const location = useLocation();
    const navigate = useNavigate();

    // Language is always derived from URL — never from localStorage or state alone
    const [language, setLanguageState] = useState(() => getLangFromPath(window.location.pathname));

    // Global CMS data (e.g., Site Options, Startseite data) shared across pages
    const [globalCmsData, setGlobalCmsData] = useState(null);
    const [globalSeo, setGlobalSeo] = useState(null);

    // Context-aware alternates (populated by the active page component)
    const [alternates, setAlternates] = useState(null);

    // Sync state whenever the URL changes (e.g., browser back/fwd, external navigate)
    useEffect(() => {
        const newLang = getLangFromPath(location.pathname);
        if (newLang !== language) {
            setLanguageState(newLang);
        }
        // Clear alternates on route change so a new page doesn't inherit old redirects
        setAlternates(null);
    }, [location.pathname]); // eslint-disable-line react-hooks/exhaustive-deps

    // t(key) — look up a string in the active locale, fall back to DE
    const t = useCallback((key) => {
        const langCode = language.toLowerCase();
        return translations[langCode]?.[key] ?? translations['de']?.[key] ?? key;
    }, [language]);

    // setLanguage — navigates to the corresponding localized route and preserves detail ids.
    const setLanguage = useCallback((newLang) => {
        if (newLang === language) return;

        // Static routes — map to the corresponding target language path
        const targetPath = mapPathToTargetLang(location.pathname, language, newLang, alternates);
        navigate(targetPath);
    }, [language, location.pathname, navigate, alternates]);

    return (
        <LanguageContext.Provider value={{ 
            language, 
            setLanguage, 
            t, 
            globalCmsData,
            setGlobalCmsData,
            globalSeo,
            setGlobalSeo,
            alternates,
            setAlternates
        }}>

            {children}
        </LanguageContext.Provider>
    );
}

export function useLanguage() {
    const context = useContext(LanguageContext);
    if (!context) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
}
