import { StrictMode } from 'react'
import { renderToString } from 'react-dom/server'
import App from './App.jsx'

export const render = (locale) =>
  renderToString(
    <StrictMode>
      <App locale={locale} />
    </StrictMode>,
  )
