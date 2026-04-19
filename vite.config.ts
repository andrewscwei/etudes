import { resolve } from 'node:path'
import { esmExternalRequirePlugin } from 'vite'
import dts from 'vite-plugin-dts'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      formats: ['es', 'umd'],
      name: 'etudes',
    },
    outDir: resolve(__dirname, 'build'),
    rollupOptions: {
      output: {
        globals: {
          react: 'React',
        },
      },
      treeshake: true,
    },
  },
  plugins: [
    dts(),
    esmExternalRequirePlugin({
      external: ['react'],
    }),
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
