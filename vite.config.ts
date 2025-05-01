import { resolve } from 'node:path'
import dts from 'vite-plugin-dts'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'etudes',
    },
    outDir: resolve(__dirname, 'build'),
    rollupOptions: {
      external: [
        'react',
        'react-router',
      ],
      output: {
        globals: {
          'react': 'React',
          'react-router': 'ReactRouter',
        },
      },
      treeshake: 'smallest',
    },
    target: 'esnext',
  },
  plugins: [
    dts(),
  ],
  test: {
    coverage: {
      reporter: ['text-summary'],
      provider: 'v8',
    },
    passWithNoTests: true,
    include: [
      '**/*.spec.ts',
      '**/*.spec.tsx',
    ],
  },
})
