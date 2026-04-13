import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter as Router } from 'react-router-dom'
import './index.css'
import { LanguageProvider } from '@/cms/i18n/useLanguage'
import App from '@/App.jsx'

// ── lacønis signature ────────────────────────────────────────────────────────
if (typeof window !== 'undefined') {
  console.log(
    '%clacønis',
    'font-size:36px;font-weight:700;letter-spacing:3px;color:#dafe02;font-family:Georgia,"Times New Roman",serif;'
  );
  console.log(
    '%cWeb & Graphic Design\n' +
    'Nicolas Spies\n\n' +
    'https://laconis.be\n' +
    'instagram.com/laconis.be',
    'font-size:11px;color:#666;line-height:1.8;'
  );
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Router>
      <LanguageProvider>
        <App />
      </LanguageProvider>
    </Router>
  </StrictMode>,
)
