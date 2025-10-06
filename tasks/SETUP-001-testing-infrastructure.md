# Task: SETUP-001 - Testing Infrastructure

## Overview
Set up Vitest and React Testing Library to enable test-driven refactoring.

## Context Needed
- None (new setup)
- Reference: Similar Next.js + Vitest setups

## Objective
Have a working test infrastructure where `pnpm test` runs tests successfully.

## Steps

### 1. Install Dependencies
```bash
cd apps/web
pnpm add -D vitest @vitejs/plugin-react
pnpm add -D @testing-library/react @testing-library/jest-dom @testing-library/user-event
pnpm add -D jsdom @types/react @types/react-dom
```

### 2. Create Vitest Config
Create `apps/web/vitest.config.ts`:
```typescript
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    globals: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/test/',
        '**/*.d.ts',
        '**/*.config.{js,ts}',
        '**/dist/**',
      ],
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

// Mock environment variables
process.env.NEXT_PUBLIC_API_URL = 'http://localhost:3000';
```

### 4. Add Test Scripts
Add to `apps/web/package.json`:
```json
{
  "scripts": {
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest --coverage"
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
      expect(cn('foo', 'bar')).toBe('foo bar');
    });

    it('should handle conditional classes', () => {
      expect(cn('foo', false && 'bar', 'baz')).toBe('foo baz');
    });

    it('should handle undefined values', () => {
      expect(cn('foo', undefined, 'bar')).toBe('foo bar');
    });
  });
});
```

### 6. Run Tests
```bash
pnpm test
```

## Acceptance Criteria
- [ ] `pnpm test` command works
- [ ] Sample test passes
- [ ] Coverage report generates
- [ ] Test setup file exists
- [ ] No errors in console
- [ ] TypeScript recognizes test globals

## Estimated Context Usage
- Files to read: 0 (creating new)
- Lines to process: ~100
- New files: 3 (config, setup, sample test)
- Risk: **Low** (no existing code changes)

## Related Tasks
- **Blocks**: All TEST-* tasks
- **Blocks**: Refactoring tasks (need tests first)

## Troubleshooting

### Issue: "Cannot find module '@testing-library/jest-dom'"
**Fix**: Ensure `@testing-library/jest-dom` is installed

### Issue: "ReferenceError: describe is not defined"
**Fix**: Add `globals: true` to vitest.config.ts

### Issue: Path aliases not working
**Fix**: Verify `resolve.alias` in vitest.config.ts matches tsconfig.json

## Verification Commands
```bash
# Should pass
pnpm test

# Should show coverage report
pnpm test:coverage

# Should have no TypeScript errors
pnpm tsc --noEmit
```

## Commit Message
```
feat(SETUP-001): add vitest testing infrastructure

- Add Vitest and React Testing Library
- Configure test environment with jsdom
- Add sample test for utils
- Enable coverage reporting
```

## Estimated Time
⏱️ **30-45 minutes**

## Notes
- This is a foundation task—complete before any refactoring
- Keep setup simple; can enhance later
- Don't add complex test utilities yet (that's SETUP-002)

