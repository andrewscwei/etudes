import { createRoot } from 'react-dom/client'
import { App } from './App.js'

if (import.meta.env.DEV) {
  window.localStorage.debug = 'demo*,etudes*'
}

const container = document.getElementById('app')

if (container) {
  const root = createRoot(container)
  root.render(<App/>)
}
