import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      exclude: [
        'node_modules/**',
        'dist/**',
        '**/*.test.ts',
        '**/*.spec.ts',
        '**/types.ts',
        'vitest.config.ts',
        'eslint.config.mjs',
        '**/index.ts', // Exclude barrel exports from coverage
        'src/simulations/season-sim.ts', // Complex integration function, tested separately
      ],
      thresholds: {
        lines: 65,
        functions: 80,
        branches: 75,
        statements: 65,
      },
    },
  },
});
