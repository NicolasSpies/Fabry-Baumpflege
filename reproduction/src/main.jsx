import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter as Router } from 'react-router-dom'
import './index.css'
import { LanguageProvider } from '@/cms/i18n/useLanguage'
import App from '@/App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Router>
      <LanguageProvider>
        <App />
      </LanguageProvider>
    </Router>
  </StrictMode>,
)
