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

// Audience measurement: self-hosted Umami through this site's own origin (functions/st). Not on localhost or a *.pages.dev preview, and not
// for a browser sending Do Not Track or Global Privacy Control. Without the Pages settings the function answers an empty script.
const { hostname } = window.location
if (!/^(localhost|127\.|.+\.pages\.dev$)/.test(hostname) && navigator.doNotTrack !== '1' && !navigator.globalPrivacyControl) {
  const s = document.createElement('script')
  Object.assign(s, { defer: true, src: '/st/s.js' })
  document.head.appendChild(s)
}

// Production pages are prerendered (scripts/prerender.mjs); the dev server is not.
if (root.hasChildNodes()) hydrateRoot(root, app)
else createRoot(root).render(app)
