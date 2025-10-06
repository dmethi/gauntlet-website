# Task: TEST-601-comprehensive-live-snapshot

## Overview

Add comprehensive tests for the live snapshot job and its extracted utilities.

## Context Needed

- File: `apps/server/src/scripts/jobs/comprehensive-live-snapshot.ts` - Main
  script
- File: `apps/server/src/lib/gauntlet-api-client.ts` - API client (from
  EXTRACT-601)
- File: `apps/server/src/lib/snapshot-validator.ts` - Validator (from
  EXTRACT-602)
- File: `apps/server/src/lib/historical-data.ts` - Database layer

## Objective

Achieve 80%+ test coverage for all server code using Vitest.

## Steps

### 1. Install Test Dependencies

```bash
cd apps/server
pnpm add -D vitest @vitest/ui
```

### 2. Create `vitest.config.ts`

```typescript
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: ['src/generated/**', 'dist/**', 'node_modules/**'],
    },
  },
});
```

### 3. Add Test Scripts to `package.json`

```json
"scripts": {
  "test": "vitest run",
  "test:watch": "vitest",
  "test:coverage": "vitest run --coverage"
}
```

### 4. Create Test for API Client

File: `src/lib/__tests__/gauntlet-api-client.test.ts`

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GauntletAPIClient } from '../gauntlet-api-client';

describe('GauntletAPIClient', () => {
  let client: GauntletAPIClient;

  beforeEach(() => {
    client = new GauntletAPIClient();
    global.fetch = vi.fn();
  });

  describe('getCurrentWeek', () => {
    it('should fetch current NFL week', async () => {
      // Mock Sleeper API response
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ week: 4 }),
      });

      const week = await client.getCurrentWeek();
      expect(week).toBe(4);
    });

    it('should default to week 4 on error', async () => {
      (global.fetch as any).mockRejectedValueOnce(new Error('API error'));
      const week = await client.getCurrentWeek();
      expect(week).toBe(4);
    });
  });

  describe('fetchLeagueOdds', () => {
    it('should fetch league odds with cache busting', async () => {
      // Test implementation
    });

    it('should throw on API error', async () => {
      // Test implementation
    });
  });

  // More tests...
});
```

### 5. Create Test for Snapshot Validator

File: `src/lib/__tests__/snapshot-validator.test.ts`

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { saveSnapshotIfChanged } from '../snapshot-validator';

describe('saveSnapshotIfChanged', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should save snapshot if no previous exists', async () => {
    // Test implementation
  });

  it('should skip snapshot if unchanged', async () => {
    // Test implementation
  });

  it('should save if scores changed significantly', async () => {
    // Test implementation
  });

  it('should save if win probability changed > 1%', async () => {
    // Test implementation
  });
});
```

### 6. Create Test for Historical Data

File: `src/lib/__tests__/historical-data.test.ts`

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import {
  saveLiveWinProbSample,
  getLastWinProbSample,
} from '../historical-data';

describe('historical-data', () => {
  // Mock Prisma client
  // Test save operations
  // Test retrieval operations
});
```

### 7. Run Tests

```bash
pnpm test
pnpm test:coverage
```

### 8. Fix Any Issues

- Adjust mocks as needed
- Ensure 80%+ coverage
- All tests passing

## Acceptance Criteria

- [ ] Vitest installed and configured
- [ ] `vitest.config.ts` created
- [ ] Test scripts added to package.json
- [ ] Tests for `gauntlet-api-client.ts` (5+ tests)
- [ ] Tests for `snapshot-validator.ts` (5+ tests)
- [ ] Tests for `historical-data.ts` (3+ tests)
- [ ] All tests pass: `pnpm test`
- [ ] Coverage >80%: `pnpm test:coverage`
- [ ] No TypeScript errors in tests
- [ ] Build still works: `pnpm build`

## Estimated Context Usage

- Files to read: 3 (the utilities to test)
- Lines to process: ~400
- New files: 4 (config + 3 test files)
- Risk: **Low** (tests don't affect runtime)

## Related Tasks

- **Depends on**: EXTRACT-601, EXTRACT-602 (need extracted code to test)
- **Related**: SETUP-601 (linting helps with test quality)

## Cursor Prompt

```
I'm working on TEST-601. Please:
1. Read tasks/TEST-601-comprehensive-live-snapshot.md
2. Install Vitest and create config
3. Create test files for:
   - gauntlet-api-client.ts
   - snapshot-validator.ts
   - historical-data.ts
4. Mock fetch and Prisma appropriately
5. Aim for 80%+ coverage
6. Ensure all tests pass
```

## Commit Message

```
test(TEST-601): add comprehensive tests for server utilities

- Install Vitest with coverage
- Create vitest.config.ts
- Add tests for GauntletAPIClient (5+ tests)
- Add tests for snapshot validator (5+ tests)
- Add tests for historical-data layer (3+ tests)
- Mock fetch and Prisma appropriately
- Achieve 80%+ test coverage
```

## Estimated Time

⏱️ **2 hours**

## Verification

```bash
cd apps/server
pnpm test              # All tests pass
pnpm test:coverage     # Coverage >80%
pnpm build             # Still compiles
```

## Notes

- Write tests AFTER extracting utilities (EXTRACT-601, EXTRACT-602)
- Smaller functions are easier to test
- Mock external dependencies (fetch, Prisma)
- Focus on happy path + error cases
- Don't need 100% coverage - 80% is excellent
