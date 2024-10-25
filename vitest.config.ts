import { defineConfig } from 'vitest/config'

export default defineConfig({
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
