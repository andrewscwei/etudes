import react from '@vitejs/plugin-react'
import autoprefixer from 'autoprefixer'
import path from 'node:path'
import tailwind from 'tailwindcss'
import { defineConfig } from 'vite'
import packageJson from '../package.json'

export default defineConfig(({ mode }) => ({
  root: __dirname,
  base: mode === 'production' ? '/etudes/' : '/',
  build: {
    outDir: path.resolve(__dirname, '../.gh-pages'),
    target: 'esnext',
  },
  css: {
    postcss: {
      plugins: [
        tailwind({
          config: path.resolve(__dirname, 'tailwind.config.ts'),
        }),
        autoprefixer(),
      ],
    },
  },
  define: {
    __VERSION__: JSON.stringify(packageJson.version),
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
