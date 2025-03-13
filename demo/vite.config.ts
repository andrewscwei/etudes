import tailwind from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'node:path'
import { defineConfig, loadEnv } from 'vite'
import packageJson from '../package.json'

export default defineConfig(({ mode }) => ({
  root: __dirname,
  base: loadEnv(mode, process.cwd(), '').BASE_PATH ?? '/',
  build: {
    outDir: resolve(__dirname, '../.gh-pages'),
    target: 'esnext',
    rollupOptions: {
      treeshake: 'smallest',
    },
  },
  define: {
    'import.meta.env.VERSION': JSON.stringify(packageJson.version),
  },
  plugins: [
    tailwind(),
    react(),
  ],
  resolve: {
    alias: {
      etudes: resolve(__dirname, '../'),
    },
  },
}))
