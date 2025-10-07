# WEB-SETUP-001: Testing Infrastructure Setup

**Category**: SETUP  
**Priority**: 🔴 CRITICAL  
**Estimated Time**: 1 hour  
**Dependencies**: None (foundation task)

---

## Objective

Set up Vitest and React Testing Library for apps/web to enable comprehensive testing of Next.js components and utilities.

---

## Context Needed

**Read these files**:
1. `apps/web/package.json` (entire file - 63 lines)
2. `apps/web/tsconfig.json` (entire file - 31 lines)
3. `apps/server/vitest.config.ts` (reference implementation - 25 lines)

**Reference**:
- `apps/sim-engine/vitest.config.ts` (another reference)
- `CODING_CONVENTIONS.MD` (testing patterns section)

**Total Context**: ~150 lines

---

## Steps

### 1. Install Testing Dependencies

```bash
cd /Users/dhruv.methi/Documents/GitHub/gauntlet-website/apps/web
pnpm add -D vitest@3.2.4 @vitest/ui@3.2.4 @vitest/coverage-v8@3.2.4
pnpm add -D @testing-library/react@14.0.0 @testing-library/jest-dom@6.1.5
pnpm add -D @testing-library/user-event@14.5.1
pnpm add -D happy-dom@12.10.3
```

### 2. Create Vitest Configuration

Create `apps/web/vitest.config.ts`:

```typescript
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
        lines: 80,
        functions: 80,
        branches: 80,
        statements: 80,
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
```

### 3. Create Test Setup File

Create `apps/web/src/test/setup.ts`:

```typescript
import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

// Cleanup after each test
afterEach(() => {
  cleanup();
});

// Mock Next.js router
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
  }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
}));

// Mock environment variables
process.env.NEXT_PUBLIC_API_URL = 'http://localhost:3000';
```

### 4. Add Test Scripts to package.json

Update `apps/web/package.json` scripts section:

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "type-check": "tsc --noEmit",
    "test": "vitest run",
    "test:watch": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest run --coverage",
    "precompute": "npx tsx src/scripts/precompute-analytics.ts",
    "precompute:real": "npx tsx src/scripts/precompute-real-analytics.ts",
    "precompute:dev": "npm run precompute && npm run dev",
    "precompute:real-dev": "npm run precompute:real && npm run dev"
  }
}
```

### 5. Create Sample Test

Create `apps/web/src/lib/utils.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';
import { cn } from './utils';

describe('utils', () => {
  describe('cn', () => {
    it('should merge class names', () => {
      const result = cn('class1', 'class2');
      expect(result).toBe('class1 class2');
    });

    it('should handle conditional classes', () => {
      const result = cn('base', true && 'conditional', false && 'excluded');
      expect(result).toContain('base');
      expect(result).toContain('conditional');
      expect(result).not.toContain('excluded');
    });

    it('should handle undefined and null', () => {
      const result = cn('class1', undefined, null, 'class2');
      expect(result).toBe('class1 class2');
    });
  });
});
```

### 6. Update TypeScript Configuration

Update `apps/web/tsconfig.json` to exclude test files from build:

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "target": "es2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    },
    "types": ["vitest/globals", "@testing-library/jest-dom"]
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules", "**/*.test.ts", "**/*.test.tsx", "**/*.spec.ts", "**/*.spec.tsx"],
  "references": [{ "path": "../../packages/types" }, { "path": "../../packages/lib" }]
}
```

### 7. Verify Setup

```bash
# Run the sample test
pnpm test

# Run with UI
pnpm test:ui

# Check coverage
pnpm test:coverage
```

---

## Acceptance Criteria

- [ ] Vitest and dependencies installed
- [ ] `vitest.config.ts` created with Next.js support
- [ ] Test setup file (`src/test/setup.ts`) created
- [ ] Test scripts added to `package.json`
- [ ] Sample test (`utils.test.ts`) passes
- [ ] TypeScript configuration updated
- [ ] Coverage thresholds configured (80%)
- [ ] `pnpm test` runs successfully
- [ ] `pnpm test:coverage` generates report
- [ ] No TypeScript errors

---

## Verification Commands

```bash
# Verify TypeScript compilation
cd /Users/dhruv.methi/Documents/GitHub/gauntlet-website/apps/web
pnpm tsc --noEmit

# Run tests
pnpm test

# Check coverage
pnpm test:coverage

# Verify coverage thresholds are met (should fail until more tests added)
# This is expected - we'll add more tests in later tasks
```

---

## Cursor Prompt (Copy-Paste Ready)

```
I'm working on WEB-SETUP-001: Testing Infrastructure Setup. Please:

1. Read apps/web/package.json (entire file)
2. Read apps/web/tsconfig.json (entire file)
3. Read apps/server/vitest.config.ts (for reference)

Then:
4. Install Vitest and React Testing Library dependencies
5. Create vitest.config.ts with Next.js support
6. Create src/test/setup.ts with test setup
7. Add test scripts to package.json
8. Create sample test in src/lib/utils.test.ts
9. Update tsconfig.json to exclude test files

Follow the steps in the task file exactly.
```

---

## Related Tasks

**Blocks**:
- WEB-SETUP-002 (Code Quality Automation)
- WEB-SETUP-003 (Test Utilities and Factories)
- All WEB-TEST-* tasks

**Blocked By**: None (foundation task)

**Related**:
- SETUP-602 (apps/server testing setup - reference)
- SIM-605 (sim-engine testing setup - reference)

---

## Notes

- This task establishes the foundation for all testing in apps/web
- Coverage thresholds will fail initially (expected) - we'll add tests in later tasks
- happy-dom is used instead of jsdom for better Next.js compatibility
- Next.js router is mocked in setup to avoid test failures
- shadcn/ui components are excluded from coverage (external library)

---

**Estimated Context Usage**: 150 lines read, 100 lines written, 1 hour total

