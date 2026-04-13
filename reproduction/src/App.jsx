import React, { lazy, Suspense, useState, useEffect, useCallback } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Navbar from '@/cms/components/ui/Navbar';
import Footer from '@/cms/components/ui/Footer';
import PageLoader from '@/cms/components/ui/PageLoader';
import ScrollToTop from '@/cms/components/ui/ScrollToTop';
import { ROUTES } from '@/cms/i18n/routes';
import { useLanguage } from '@/cms/i18n/useLanguage';
import { getOptions, getGlobalSeo } from '@/cms/lib/cms';

import { definePreview } from '@/cms/lib/preview';
import { resolveInstanceProps, awaitMappings, setGlobalCmsData as setBridgeGlobalData, setBridgeLanguage } from '@/cms/bridge-resolver';

const Home = lazy(() => import('@/cms/pages/Home'));
const Services = lazy(() => import('@/cms/pages/Services'));
const References = lazy(() => import('@/cms/pages/References'));
const ReferenceDetail = lazy(() => import('@/cms/pages/ReferenceDetail'));
const Contact = lazy(() => import('@/cms/pages/Contact'));
const AboutMe = lazy(() => import('@/cms/pages/AboutMe'));
const Privacy = lazy(() => import('@/cms/pages/Privacy'));
const Imprint = lazy(() => import('@/cms/pages/Imprint'));

/**
 * Global Preview Metadata for ContentBridge scanning.
 * Defines layout components like Navbar and Footer.
 */
export const previewData = definePreview({
  page: 'Global',
  sections: [
    {
      section: 'Navbar',
      fields: ['ctaLabel'],
      components: [
        {
          component: 'NavLink', // This refers to the logical navigation items
          isListItem: true,
          fields: ['label', 'href']
        }
      ]
    },
    {
      section: 'Footer',
      fields: ['description', 'address', 'phone', 'email', 'instaUrl']
    }
  ]
});

function App() {
  const { language, setGlobalCmsData, setGlobalSeo, pageReady } = useLanguage();
  const [initialLoading, setInitialLoading] = useState(true);
  const [globalReady, setGlobalReady] = useState(false);
  const handleLoaderComplete = useCallback(() => setInitialLoading(false), []);
  const location = useLocation();
  const isHome = location.pathname === '/' || location.pathname === '/fr' || location.pathname === '/fr/';
  const [globalData, setGlobalData] = useState({
    navbar: {
      ctaLabel: language === 'FR' ? 'Contact' : 'Kontakt'
    },
    footer: {}
  });

  const [rawGlobal, setRawGlobal] = useState(null);

  // Sync default labels whenever language changes
  useEffect(() => {
    setGlobalData(prev => ({
      ...prev,
      navbar: {
        ...prev.navbar,
        ctaLabel: language === 'FR' ? 'Contact' : 'Kontakt'
      }
    }));
  }, [language]);

  // Fetch only true global CMS data for shell components.
  useEffect(() => {
    let cancelled = false;
    async function loadGlobal() {
      try {
        await awaitMappings();
        if (cancelled) return;
        setBridgeLanguage(language);

        const [options, seo] = await Promise.all([
          getOptions(language),
          getGlobalSeo(language)
        ]);
        if (cancelled) return;

        setRawGlobal(options);
        setGlobalCmsData(options);
        setGlobalSeo(seo);
        setBridgeGlobalData(options);
        setGlobalReady(true);
      } catch (err) {
        console.error('[App] Global load failed:', err);
      }
    }
    loadGlobal();
    return () => { cancelled = true; };
  }, [language, setGlobalCmsData, setGlobalSeo]);


  const getShellProps = (instanceName, localProps) => 
    resolveInstanceProps('Global', instanceName, localProps, rawGlobal);

  // Transition overlay for SPA navigation (not initial load)
  const showTransition = !initialLoading && !pageReady;

  return (
    <>
      {initialLoading && <PageLoader ready={globalReady && pageReady} onComplete={handleLoaderComplete} fullScreen={isHome} />}
      <ScrollToTop />
        <div className="min-h-screen flex flex-col bg-background-light dark:bg-background-dark text-slate-800 dark:text-slate-200 font-sans transition-colors duration-300">
        <Navbar {...getShellProps('Navbar', globalData.navbar)} />
        <div className="flex-1 flex flex-col relative">
          {/* Light overlay during SPA page transitions */}
          {showTransition && (
            <div className="absolute inset-0 bg-white dark:bg-background-dark z-10 transition-opacity duration-300" />
          )}
          <Suspense fallback={<div className="flex-1" />}>
            <Routes>
              {/* German Routes */}
              <Route path={ROUTES.DE.home} element={<Home />} />
              <Route path={ROUTES.DE.services} element={<Services />} />
              <Route path={ROUTES.DE.references} element={<References />} />
              <Route path={ROUTES.DE.referenceDetail} element={<ReferenceDetail />} />
              <Route path={ROUTES.DE.contact} element={<Contact />} />
              <Route path={ROUTES.DE.about} element={<AboutMe />} />
              <Route path={ROUTES.DE.imprint} element={<Imprint />} />
              <Route path={ROUTES.DE.privacy} element={<Privacy />} />

              {/* French Routes */}
              <Route path={ROUTES.FR.home} element={<Home />} />
              <Route path={ROUTES.FR.services} element={<Services />} />
              <Route path={ROUTES.FR.references} element={<References />} />
              <Route path={ROUTES.FR.referenceDetail} element={<ReferenceDetail />} />
              <Route path={ROUTES.FR.contact} element={<Contact />} />
              <Route path={ROUTES.FR.about} element={<AboutMe />} />
              <Route path={ROUTES.FR.imprint} element={<Imprint />} />
              <Route path={ROUTES.FR.privacy} element={<Privacy />} />

              <Route path="/ueber-uns" element={<Navigate to="/ueber-mich" replace />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
        </div>
        <Footer {...getShellProps('Footer', globalData.footer)} />
      </div>
    </>
  );
}

export default App;
