import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter as Router } from 'react-router-dom'
import './index.css'
import { LanguageProvider } from '@/cms/i18n/useLanguage'
import App from '@/App.jsx'

// ── lacønis signature ────────────────────────────────────────────────────────
if (typeof window !== 'undefined') {
  console.log(
    '%c  lac%cø%cnis  %c\n\n' +
    '%cWeb & Graphic Design\n' +
    'Nicolas Spies\n\n' +
    'https://laconis.be\n' +
    'instagram.com/laconis.be\n',
    'font-size:28px;font-weight:800;color:#395824;letter-spacing:2px;',
    'font-size:28px;font-weight:800;color:#6b8f4a;letter-spacing:2px;',
    'font-size:28px;font-weight:800;color:#395824;letter-spacing:2px;',
    '',
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
