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
      reporter: ['text-summary'],
    },
    environment: 'happy-dom',
    include: [
      '**/*.spec.ts',
      '**/*.spec.tsx',
    ],
    passWithNoTests: true,
  },
})
