import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { LanguageProvider } from './context/LanguageContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Services from './pages/Services';
import References from './pages/References';
import ReferenceDetail from './pages/ReferenceDetail';
import Contact from './pages/Contact';
import AboutMe from './pages/AboutMe';

function App() {
  return (
    <LanguageProvider>
      <Router>
        <div className="min-h-screen bg-background-light dark:bg-background-dark text-slate-800 dark:text-slate-200 font-sans transition-colors duration-300">
          <Navbar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/leistungen" element={<Services />} />
            <Route path="/referenzen" element={<References />} />
            <Route path="/referenzen/:id" element={<ReferenceDetail />} />
            <Route path="/kontakt" element={<Contact />} />
            <Route path="/über-mich" element={<AboutMe />} />
            {/* Fallback to Home or a 404 can be added here if needed */}
          </Routes>
          <Footer />
        </div>
      </Router>
    </LanguageProvider>
  );
}

export default App;
