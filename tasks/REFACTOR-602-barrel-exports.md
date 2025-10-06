# REFACTOR-602: Add Barrel Exports (index.ts)

**Category:** Refactoring  
**Priority:** 🟡 MEDIUM (Convention Compliance)  
**Estimated Time:** 20 minutes  
**Dependencies:** None (can run parallel with REFACTOR-601)  
**Blocks:** REFACTOR-603 (Path Aliases)

---

## 📋 Overview

Add barrel export files (`index.ts`) to enable clean import paths per CODING_CONVENTIONS.MD. This eliminates the need for direct file imports and `.js` extensions.

**Convention Violation:**
```typescript
// ❌ WRONG (current)
import { gauntletAPI } from '../../lib/gauntlet-api-client.js';
import { disconnect } from '../../lib/historical-data.js';

// ✅ CORRECT (target with barrel exports + path aliases)
import { gauntletAPI, disconnect } from '@/lib';
```

---

## 🎯 Objective

Create barrel export files for clean module exports:
- `src/lib/index.ts` - Export all library utilities
- `src/lib/types.ts` - Centralize internal types
- Update imports across codebase to use barrel exports

---

## 📖 Context Needed

**Files to Read:**
- `apps/server/src/lib/gauntlet-api-client.ts` (lines 1-20, exports only)
- `apps/server/src/lib/historical-data.ts` (lines 480-489, exports only)
- `apps/server/src/lib/snapshot-validator.ts` (lines 1-20, exports only)
- `apps/server/src/scripts/jobs/comprehensive-live-snapshot.ts` (lines 1-15, imports only)

**Total Context:** ~80 lines

---

## ✅ Steps

### 1. Create src/lib/types.ts (5 min)

Create `apps/server/src/lib/types.ts` for internal types:

```typescript
/**
 * Internal types for apps/server lib utilities
 * 
 * Note: Most types are imported from @gauntlet/types (centralized)
 * This file contains only server-lib-specific internal types
 */

// Re-export commonly used types from @gauntlet/types for convenience
export type {
  GauntletAPIOptions,
  LeagueOddsResponse,
  MatchupSimulationResponse,
  CompleteSnapshot,
  ValidationResult,
  PreviousSnapshot,
} from '@gauntlet/types';

// Re-export Prisma types
export type {
  LiveWinProbSample,
  MatchupOddsHistory,
  LeagueOddsHistory,
} from '../generated/prisma-historical';
```

### 2. Create src/lib/index.ts (5 min)

Create `apps/server/src/lib/index.ts`:

```typescript
/**
 * Server Library Exports
 * 
 * Barrel export file for all server utilities.
 * Enables clean imports: import { gauntletAPI, disconnect } from '@/lib';
 */

// API Client
export { createGauntletAPIClient, gauntletAPI } from './gauntlet-api-client';

// Historical Data (Database Operations)
export {
  // Write operations
  saveLiveWinProbSample,
  saveMatchupOddsHistory,
  saveLeagueOddsHistory,
  
  // Read operations
  getLastWinProbSample,
  getMatchupWinProbTimeSeries,
  getWeekWinProbSamples,
  getMatchupExcitementMetrics,
  getMatchupOddsHistory,
  getLeagueOddsHistory,
  getLatestLeagueOdds,
  
  // Lifecycle
  disconnect,
} from './historical-data';

// Snapshot Validation
export {
  hasSignificantChange,
  saveSnapshotIfChanged,
} from './snapshot-validator';

// Types
export type * from './types';
```

### 3. Update comprehensive-live-snapshot.ts Imports (5 min)

Update `apps/server/src/scripts/jobs/comprehensive-live-snapshot.ts`:

```typescript
// Before:
import { disconnect } from '../../lib/historical-data.js';
import { gauntletAPI } from '../../lib/gauntlet-api-client.js';
import { saveSnapshotIfChanged } from '../../lib/snapshot-validator.js';
import type { CompleteSnapshot } from '@gauntlet/types';

// After:
import { disconnect, gauntletAPI, saveSnapshotIfChanged } from '../../lib/index.js';
import type { CompleteSnapshot } from '@gauntlet/types';
```

**Note:** Keep `.js` extension for now (will be removed in REFACTOR-603 with path aliases)

### 4. Update Test Imports (3 min)

Update test files to use barrel exports:

**Before:**
```typescript
import { GauntletAPIClient, gauntletAPI } from '../gauntlet-api-client';
import { hasSignificantChange, saveSnapshotIfChanged } from '../snapshot-validator';
import { saveLiveWinProbSample, disconnect } from '../historical-data';
```

**After:**
```typescript
import {
  gauntletAPI,
  hasSignificantChange,
  saveSnapshotIfChanged,
  saveLiveWinProbSample,
  disconnect,
} from '../index';
```

### 5. Verify Exports (2 min)

```bash
cd apps/server

# Check that all exports resolve
pnpm tsc --noEmit

# Run tests with new imports
pnpm test

# Verify build
pnpm build
```

---

## ✅ Acceptance Criteria

- [ ] `src/lib/index.ts` created with all library exports
- [ ] `src/lib/types.ts` created with type re-exports
- [ ] `comprehensive-live-snapshot.ts` updated to use barrel imports
- [ ] Test files updated to use barrel imports
- [ ] `pnpm tsc --noEmit` passes (0 errors)
- [ ] `pnpm test` passes (all 50 tests)
- [ ] `pnpm build` succeeds
- [ ] No breaking changes to external APIs

---

## 🔍 Verification

```bash
cd apps/server

# 1. Check barrel exports exist
ls -la src/lib/index.ts src/lib/types.ts
# Expected: Both files exist

# 2. Verify imports updated
grep -r "from '.*lib/.*\.js'" src/scripts
# Expected: Only '../lib/index.js' (or none if path aliases added)

# 3. Test imports work
pnpm tsc --noEmit
# Expected: 0 errors

# 4. Run tests
pnpm test
# Expected: All 50 tests pass

# 5. Build
pnpm build
# Expected: Successful compilation
```

---

## 📊 Estimated Context Usage

- **Files to create**: 2 (index.ts, types.ts)
- **Files to modify**: 4 (comprehensive-live-snapshot.ts, 3 test files)
- **Lines to read**: ~80
- **Lines to write**: ~70

---

## 🔗 Related Tasks

**Prerequisites:**
- None (independent)

**Enables:**
- REFACTOR-603: Add Path Aliases (builds on barrel exports)
- Cleaner import statements across codebase

**Related:**
- REFACTOR-604: Separate Types Files (types.ts created here)

---

## 💡 Cursor Prompt

```
I'm working on REFACTOR-602 (Add barrel exports to apps/server).

Please:
1. Create src/lib/types.ts with type re-exports from @gauntlet/types
2. Create src/lib/index.ts exporting all lib functions
3. Update src/scripts/jobs/comprehensive-live-snapshot.ts to use barrel import
4. Update test files to use barrel imports

Follow tasks/REFACTOR-602-barrel-exports.md steps exactly.

Pattern:
// Before:
import { gauntletAPI } from '../../lib/gauntlet-api-client.js';

// After:
import { gauntletAPI } from '../../lib/index.js';
```

---

## 📝 Notes

### Why Barrel Exports?

From CODING_CONVENTIONS.MD:
- **Cleaner imports**: One import statement instead of many
- **Encapsulation**: Internal files can remain private
- **Refactoring**: Can reorganize files without breaking imports
- **Discoverability**: Single place to see all public APIs

### What Goes in Barrel Exports?

**Include:**
- ✅ Public functions and utilities
- ✅ Types used by consumers
- ✅ Main entry points

**Exclude:**
- ❌ Internal helpers (not exported publicly)
- ❌ Test utilities
- ❌ Implementation details

### .js Extension Caveat

We're keeping `.js` extensions in imports for now because:
1. TypeScript in ESM mode requires extensions
2. Path aliases (REFACTOR-603) will make them unnecessary
3. Current setup expects `.js` for relative imports

After REFACTOR-603, we can use `@/lib` instead of `../../lib/index.js`

---

## 🎯 Success Metrics

- [ ] 2 barrel export files created
- [ ] All imports working through barrel exports
- [ ] 0 TypeScript errors
- [ ] All tests pass
- [ ] Build succeeds

---

**Status:** ⏭️ Ready to Start  
**Assignee:** _Unassigned_  
**Completed:** _Not Started_

