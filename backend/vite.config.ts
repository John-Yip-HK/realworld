import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    setupFiles: './tests/setup.ts',
    restoreMocks: true,
    coverage: {
      reporter: ['text', 'html'],
      enabled: true,
      reportsDirectory: './tests/unit/coverage',
      exclude: [
        '.eslintrc.cjs',
        'app.ts',
        '**/*.d.ts',
        'routes',
        'strategies',
        'prisma',
      ]
    },
  },
})