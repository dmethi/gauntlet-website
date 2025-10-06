import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

export default defineConfig({
  resolve: {
    alias: {
      '@/lib': resolve(__dirname, './src/lib/index.ts'),
      '@/lib/': resolve(__dirname, './src/lib/'),
      '@/scripts': resolve(__dirname, './src/scripts/'),
    },
  },
  test: {
    globals: true,
    environment: 'node',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: ['src/generated/**', 'dist/**', 'node_modules/**'],
      all: true,
      include: ['src/lib/**/*.ts'],
    },
  },
});
