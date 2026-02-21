import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ScrollToTop from './components/ScrollToTop';
import Home from './pages/Home';
import Services from './pages/Services';
import References from './pages/References';
import ReferenceDetail from './pages/ReferenceDetail';
import Contact from './pages/Contact';
import AboutMe from './pages/AboutMe';
import { ROUTES } from './i18n/routes';

function App() {
  return (
    <>
      <ScrollToTop />
      <div className="min-h-screen bg-background-light dark:bg-background-dark text-slate-800 dark:text-slate-200 font-sans transition-colors duration-300">
        <Navbar />
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
        <Footer />
      </div>
    </>
  );
}

export default App;
