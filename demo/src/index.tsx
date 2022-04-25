import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './containers/App'

if (process.env.NODE_ENV === 'development') {
  window.localStorage.debug = 'demo*,etudes*'
}

const container = document.getElementById('app')

if (container) {
  const root = createRoot(container)
  root.render(<App/>)
}
