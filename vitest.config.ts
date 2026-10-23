import { defineConfig } from 'vitest/config';
export default defineConfig({
  test: {
    include: ['tests/unit/**/*.test.{ts,tsx}'],
    environment: 'jsdom',
    coverage: {
      provider: 'v8',
      include: ['packages/echo/src/**/*.{ts,tsx}'],
      exclude: ['packages/echo/src/types.ts'],
      reporter: ['text', 'html', 'json-summary'],
      thresholds: { 'packages/echo/src/core/**': { lines: 90, branches: 90 } },
    },
  },
});
