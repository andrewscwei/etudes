import react from '@vitejs/plugin-react'
import path from 'node:path'
import { defineConfig } from 'vite'

export default defineConfig(({ mode }) => ({
  root: __dirname,
  base: mode === 'production' ? '/etudes/' : '/',
  build: {
    outDir: path.resolve(__dirname, '../.gh-pages'),
    target: 'esnext',
  },
  plugins: [
    react(),
  ],
  resolve: {
    alias: {
      etudes: path.resolve(__dirname, '../lib'),
    },
  },
}))
