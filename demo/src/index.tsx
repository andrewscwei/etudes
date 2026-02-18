import { createRoot } from 'react-dom/client'

import { App } from './App.js'

function render() {
  const container = window.document.getElementById('root')
  if (!container) return

  createRoot(container).render((<App/>))
}

render()
