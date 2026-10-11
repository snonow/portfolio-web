import { StrictMode } from 'react'
import { createRoot, hydrateRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

const locale = window.location.pathname.match(/^\/(fr|ja)(\/|$)/)?.[1] ?? 'en'
const root = document.getElementById('root')
const app = (
  <StrictMode>
    <App locale={locale} />
  </StrictMode>
)

// Production pages are prerendered (scripts/prerender.mjs); the dev server is not.
if (root.hasChildNodes()) hydrateRoot(root, app)
else createRoot(root).render(app)
