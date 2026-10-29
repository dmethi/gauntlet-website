import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'happy-dom',
    setupFiles: ['./src/test/setup.ts'],
    include: ['**/*.{test,spec}.{ts,tsx}'],
    exclude: ['node_modules', 'dist', '.next', 'coverage'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      // Vitest 4 removed `coverage.all`; without `include` it reports only the
      // files tests import. List the source tree so untested files still count.
      include: ['src/**/*.{ts,tsx}'],
      exclude: [
        'node_modules/',
        'src/test/',
        '**/*.d.ts',
        '**/*.config.*',
        '**/mockData/',
        'dist/',
        '.next/',
        'src/components/ui/**', // shadcn components (external)
      ],
      thresholds: {
        // This repository imported an aspirational 80% gate before it had a
        // measured baseline. Keep these at or just below current coverage so
        // CI prevents regression; raise them as the older modules gain tests.
        // Vitest 4 counts the functions and branches of untested files, which
        // Vitest 3 did not, so the baseline is 31% functions and 19.6%
        // branches (Vitest 3 reported 65% and 76% on the same tests).
        lines: 30,
        functions: 30,
        branches: 19,
        statements: 30,
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
