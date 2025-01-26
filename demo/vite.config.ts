import tailwind from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import path from 'node:path'
import { defineConfig } from 'vite'
import packageJson from '../package.json'

export default defineConfig({
  root: __dirname,
  build: {
    outDir: path.resolve(__dirname, '../.gh-pages'),
    target: 'esnext',
  },
  define: {
    __VERSION__: JSON.stringify(packageJson.version),
  },
  plugins: [
    tailwind(),
    react(),
  ],
  resolve: {
    alias: {
      etudes: path.resolve(__dirname, '../lib'),
    },
  },
})
