import { resolve } from 'node:path'
import dts from 'vite-plugin-dts'
import { defineConfig } from 'vitest/config'

import packageJson from './package.json' with { type: 'json' }

const __dirname = import.meta.dirname

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      formats: ['es'],
    },
    outDir: resolve(__dirname, 'build'),
    rollupOptions: {
      external: [
        ...Object.keys(packageJson.dependencies),
        ...Object.keys(packageJson.peerDependencies),
      ].map(name => new RegExp(`^${name}($|/)`)),
      output: {
        entryFileNames: '[name].js',
        preserveModules: true,
        preserveModulesRoot: 'src',
      },
      treeshake: true,
    },
  },
  plugins: [
    dts(),
  ],
  test: {
    coverage: {
      provider: 'v8',
      reportsDirectory: resolve(__dirname, 'coverage'),
    },
    environment: 'happy-dom',
    globals: true,
    include: [
      '**/*.spec.(ts|tsx)',
      '**/*.test.(ts|tsx)',
    ],
    passWithNoTests: true,
    reporters: [
      'tree',
      ...process.env.GITHUB_ACTIONS === 'true' ? ['github-actions'] : [],
    ],
  },
})
