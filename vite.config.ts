import { resolve } from 'node:path'
import dts from 'vite-plugin-dts'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      formats: ['es'],
      name: 'etudes',
    },
    outDir: resolve(__dirname, 'build'),
    rollupOptions: {
      external: [
        'react',
      ],
      output: {
        globals: {
          react: 'React',
        },
      },
      treeshake: true,
    },
    target: 'esnext',
  },
  plugins: [
    dts(),
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
