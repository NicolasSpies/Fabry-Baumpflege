import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from '@/cms/components/ui/Navbar';
import Footer from '@/cms/components/ui/Footer';
import ScrollToTop from '@/cms/components/ui/ScrollToTop';
import Home from '@/cms/pages/Home';
import Services from '@/cms/pages/Services';
import References from '@/cms/pages/References';
import ReferenceDetail from '@/cms/pages/ReferenceDetail';
import Contact from '@/cms/pages/Contact';
import AboutMe from '@/cms/pages/AboutMe';
import { ROUTES } from '@/cms/i18n/routes';
import { useLanguage } from '@/cms/i18n/useLanguage';
import { getPage, getOptions } from '@/cms/lib/cms';
import { definePreview } from '@/cms/lib/preview';
import { resolveInstanceProps, awaitMappings, setGlobalCmsData as setBridgeGlobalData, setBridgeLanguage } from '@/cms/bridge-resolver';

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
  const { language, setGlobalCmsData } = useLanguage();
  const [globalData, setGlobalData] = useState({
    navbar: {},
    footer: {}
  });
  const [rawGlobal, setRawGlobal] = useState(null);

  // Fetch global data (from startseite as the primary site-wide source)
  useEffect(() => {
    let cancelled = false;
    async function loadGlobal() {
      try {
        await awaitMappings();
        if (cancelled) return;
        setBridgeLanguage(language);
        
        const [startseite, leistungen, options] = await Promise.all([
          getPage('startseite', language),
          getPage('leistungen', language),
          getOptions(language)
        ]);
        if (cancelled) return;
        
        // Merge page data and options.
        // We include both startseite and leistungen in the global pool so that
        // shared components (like services preview) can resolve their props site-wide.
        const mergedGlobal = {
          ...(startseite || {}),
          ...(leistungen || {}),
          ...(options || {}),
          customFields: {
            ...(startseite?.acf || startseite?.customFields || {}),
            ...(leistungen?.acf || leistungen?.customFields || {}),
            ...(options?.acf || options?.customFields || {}),
          }
        };
        
        setRawGlobal(mergedGlobal);
        setGlobalCmsData(mergedGlobal);
        setBridgeGlobalData(mergedGlobal);
      } catch (err) {
        console.error('[App] Global load failed:', err);
      }
    }
    loadGlobal();
    return () => { cancelled = true; };
  }, [language, setGlobalCmsData]);

  const getShellProps = (instanceName, localProps) => 
    resolveInstanceProps('Global', instanceName, localProps, rawGlobal);

  return (
    <>
      <ScrollToTop />
      <div className="min-h-screen bg-background-light dark:bg-background-dark text-slate-800 dark:text-slate-200 font-sans transition-colors duration-300">
        <Navbar {...getShellProps('Navbar', globalData.navbar)} />
        <Routes>
          {/* German Routes */}
          <Route path={ROUTES.DE.home} element={<Home />} />
          <Route path={ROUTES.DE.services} element={<Services />} />
          <Route path={ROUTES.DE.references} element={<References />} />
          <Route path={ROUTES.DE.referenceDetail} element={<ReferenceDetail />} />
          <Route path={ROUTES.DE.contact} element={<Contact />} />
          <Route path={ROUTES.DE.about} element={<AboutMe />} />

          {/* French Routes */}
          <Route path={ROUTES.FR.home} element={<Home />} />
          <Route path={ROUTES.FR.services} element={<Services />} />
          <Route path={ROUTES.FR.references} element={<References />} />
          <Route path={ROUTES.FR.referenceDetail} element={<ReferenceDetail />} />
          <Route path={ROUTES.FR.contact} element={<Contact />} />
          <Route path={ROUTES.FR.about} element={<AboutMe />} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <Footer {...getShellProps('Footer', globalData.footer)} />
      </div>
    </>
  );
}

export default App;
