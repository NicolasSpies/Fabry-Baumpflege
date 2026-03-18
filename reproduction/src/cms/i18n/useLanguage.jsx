import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { translations } from './translations';
import { ROUTES } from './routes';

const LanguageContext = createContext();

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Derive the active language from a pathname. /fr/… → 'FR', anything else → 'DE'. */
export function getLangFromPath(path) {
    return path.startsWith('/fr') ? 'FR' : 'DE';
}

/** Map a pathname + source language + target language to the corresponding target path.
 *  Only handles static routes. Detail pages must use pll_translations for resolution. */
function mapPathToTargetLang(currentPath, currentLang, targetLang) {
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

    // Fallback to home for unknown paths
    return targetLang === 'FR' ? '/fr' : '/';
}

// ─── Provider ─────────────────────────────────────────────────────────────────

export function LanguageProvider({ children }) {
    const location = useLocation();
    const navigate = useNavigate();

    // Language is always derived from URL — never from localStorage or state alone
    const [language, setLanguageState] = useState(() => getLangFromPath(window.location.pathname));

    // Ref to an async handler registered by the active ReferenceDetail component.
    const detailSwitchRef = useRef(null);

    // Global CMS data (e.g., Site Options, Startseite data) shared across pages
    const [globalCmsData, setGlobalCmsData] = useState(null);

    // Sync state whenever the URL changes (e.g., browser back/fwd, external navigate)
    useEffect(() => {
        const newLang = getLangFromPath(location.pathname);
        if (newLang !== language) {
            setLanguageState(newLang);
        }
    }, [location.pathname]); // eslint-disable-line react-hooks/exhaustive-deps

    // t(key) — look up a string in the active locale, fall back to DE
    const t = useCallback((key) => {
        const langCode = language.toLowerCase();
        return translations[langCode]?.[key] ?? translations['de']?.[key] ?? key;
    }, [language]);

    // setLanguage — navigates to the correct route.
    // On detail pages, delegates to the registered detailSwitchRef handler so
    // ReferenceDetail can perform pll_translations resolution first.
    const setLanguage = useCallback((newLang) => {
        if (newLang === language) return;

        if (detailSwitchRef.current) {
            // Let ReferenceDetail handle navigation via pll_translations
            detailSwitchRef.current(newLang);
            return;
        }

        // Static routes — map to the corresponding target language path
        const targetPath = mapPathToTargetLang(location.pathname, language, newLang);
        navigate(targetPath);
    }, [language, location.pathname, navigate]);

    // registerDetailSwitch / unregisterDetailSwitch — called by ReferenceDetail
    // to intercept language switches while a reference is loaded.
    const registerDetailSwitch = useCallback((handler) => {
        detailSwitchRef.current = handler;
    }, []);
    const unregisterDetailSwitch = useCallback(() => {
        detailSwitchRef.current = null;
    }, []);

    return (
        <LanguageContext.Provider value={{ 
            language, 
            setLanguage, 
            t, 
            registerDetailSwitch, 
            unregisterDetailSwitch,
            globalCmsData,
            setGlobalCmsData
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
