# REFACTOR-601: Convert All Functions to Arrow Functions

**Category:** Refactoring  
**Priority:** ⚠️ HIGH (Convention Compliance)  
**Estimated Time:** 45 minutes  
**Dependencies:** SETUP-602 (ESLint)  
**Blocks:** None (but makes codebase convention-compliant)

---

## 📋 Overview

Convert all 30+ functions in `apps/server/src/lib` from regular function declarations to arrow function expressions. This aligns with CODING_CONVENTIONS.MD and improves consistency.

**Convention Violation:**
```typescript
// ❌ WRONG (current)
export async function saveLiveWinProbSample(data: {...}) { }

// ✅ CORRECT (target)
export const saveLiveWinProbSample = async (data: {...}) => { };
```

---

## 🎯 Objective

Convert all function declarations to arrow function expressions in:
- `src/lib/historical-data.ts` (15 functions)
- `src/lib/gauntlet-api-client.ts` (5 methods in class)
- `src/lib/snapshot-validator.ts` (3 functions)
- `src/scripts/jobs/comprehensive-live-snapshot.ts` (2 functions)

---

## 📖 Context Needed

**Files to Read:**
- `apps/server/src/lib/historical-data.ts` (lines 1-100 to see pattern, then apply to rest)
- `apps/server/src/lib/gauntlet-api-client.ts` (full file, 214 lines)
- `apps/server/src/lib/snapshot-validator.ts` (lines 1-60)
- `apps/server/src/scripts/jobs/comprehensive-live-snapshot.ts` (lines 1-50)

**Total Context:** ~350 lines (spread across 4 files)

---

## ✅ Steps

### 1. Historical Data Functions (15 min)

Convert `src/lib/historical-data.ts`:

**Pattern:**
```typescript
// Before:
export async function saveLiveWinProbSample(data: {
  leagueId: string;
  // ...
}) {
  return prisma.liveWinProbSample.create({ data });
}

// After:
export const saveLiveWinProbSample = async (data: {
  leagueId: string;
  // ...
}): Promise<LiveWinProbSample> => {
  return prisma.liveWinProbSample.create({ data });
};
```

**Functions to convert (15 total):**
- `saveLiveWinProbSample`
- `saveMatchupOddsHistory`
- `saveLeagueOddsHistory`
- `getLastWinProbSample`
- `getMatchupWinProbTimeSeries`
- `getWeekWinProbSamples`
- `getMatchupExcitementMetrics`
- `getMatchupOddsHistory`
- `getLeagueOddsHistory`
- `getLatestLeagueOdds`
- `disconnect`

**⚠️ Important:** Add explicit return types for all functions.

### 2. API Client Class Conversion (20 min)

Convert `src/lib/gauntlet-api-client.ts` from class to functional approach:

**Before (Class-based):**
```typescript
export class GauntletAPIClient {
  private baseUrl: string;
  private timeout: number;

  constructor(options: GauntletAPIOptions = {}) {
    this.baseUrl = options.baseUrl || 'https://gauntlet-website.vercel.app';
    this.timeout = options.timeout || 30000;
  }

  async getCurrentWeek(): Promise<number> {
    // ...
  }
}

export const gauntletAPI = new GauntletAPIClient();
```

**After (Functional):**
```typescript
export const createGauntletAPIClient = (options: GauntletAPIOptions = {}) => {
  const baseUrl = options.baseUrl || 'https://gauntlet-website.vercel.app';
  const timeout = options.timeout || 30000;

  return {
    getCurrentWeek: async (): Promise<number> => {
      // ...
    },
    
    fetchLeagueOdds: async (week: number): Promise<LeagueOddsResponse> => {
      // ...
    },
    
    fetchMatchupSimulation: async (
      leagueId: string,
      week: number,
      matchupId: number
    ): Promise<MatchupSimulationResponse> => {
      // ...
    },
    
    getTeamNames: async (leagueId: string): Promise<Map<number, string>> => {
      // ...
    },
  };
};

export const gauntletAPI = createGauntletAPIClient();
```

**Benefits:**
- Functional composition over inheritance
- Easier to test (can inject dependencies)
- No need for `this` binding

### 3. Snapshot Validator Functions (5 min)

Convert `src/lib/snapshot-validator.ts`:

```typescript
// Before:
export function hasSignificantChange(
  previous: PreviousSnapshot,
  current: CompleteSnapshot,
  threshold = 0.01
): boolean {
  // ...
}

// After:
export const hasSignificantChange = (
  previous: PreviousSnapshot,
  current: CompleteSnapshot,
  threshold = 0.01
): boolean => {
  // ...
};
```

**Functions to convert:**
- `hasSignificantChange`
- `saveSnapshotIfChanged`
- Internal `printPlayerTable` (lines 62-104)

### 4. Script Helper Functions (5 min)

Convert `src/scripts/jobs/comprehensive-live-snapshot.ts`:

```typescript
// Before:
async function captureIndividualMatchup(...) {
  // ...
}

async function main() {
  // ...
}

// After:
const captureIndividualMatchup = async (...): Promise<CompleteSnapshot | null> => {
  // ...
};

const main = async (): Promise<void> => {
  // ...
};
```

### 5. Run Linter and Fix (5 min)

```bash
cd apps/server

# Check for remaining function declarations
pnpm lint

# Auto-fix what's possible
pnpm lint:fix

# Manually fix anything remaining
# Run tests to verify
pnpm test
```

---

## ✅ Acceptance Criteria

- [ ] All functions in `historical-data.ts` converted to arrow functions (15)
- [ ] `GauntletAPIClient` class converted to functional factory
- [ ] All functions in `snapshot-validator.ts` converted (3)
- [ ] Script functions converted (2)
- [ ] All functions have explicit return types
- [ ] `pnpm lint` shows 0 errors related to function style
- [ ] All tests pass (`pnpm test`)
- [ ] TypeScript compilation passes (`pnpm build`)
- [ ] No breaking changes (behavior identical)

---

## 🔍 Verification

```bash
cd apps/server

# 1. Check for function declarations (should find 0)
grep -r "export async function\|export function" src/lib src/scripts
# Expected: No results

# 2. Verify arrow functions present
grep -r "export const.*= async\|export const.*=.*=>" src/lib src/scripts
# Expected: 25+ results

# 3. Run tests
pnpm test
# Expected: All 50 tests pass

# 4. Check linter
pnpm lint
# Expected: 0 errors for func-style, prefer-arrow-callback

# 5. Compile TypeScript
pnpm build
# Expected: Successful compilation
```

---

## 📊 Estimated Context Usage

- **Files to modify**: 4
- **Functions to convert**: 25
- **Lines to read**: ~350
- **Lines to modify**: ~150

---

## 🔗 Related Tasks

**Prerequisites:**
- SETUP-602: ESLint and Prettier ✅ (provides linting rules)

**Enables:**
- Convention compliance
- Easier functional composition
- Better testability

**Related:**
- REFACTOR-602: Add Barrel Exports (both improve imports)

---

## 💡 Cursor Prompt

```
I'm working on REFACTOR-601 (Convert functions to arrow functions).

Please:
1. Read apps/server/src/lib/historical-data.ts (lines 1-100)
2. Convert all function declarations to arrow functions
3. Add explicit return types to all functions
4. Repeat for gauntlet-api-client.ts, snapshot-validator.ts, comprehensive-live-snapshot.ts

Follow tasks/REFACTOR-601-arrow-functions.md steps exactly.

Key pattern:
// Before:
export async function saveLiveWinProbSample(data: {...}) { }

// After:
export const saveLiveWinProbSample = async (data: {...}): Promise<ReturnType> => { };

For gauntlet-api-client.ts, convert class to functional factory pattern.
```

---

## 📝 Notes

### Return Type Inference

While TypeScript can infer return types, CODING_CONVENTIONS.MD prefers explicit types for:
- Better IDE tooltips
- Self-documenting code
- Catching errors earlier

### Class vs Functional Approach

**Why convert class to functional factory?**

1. **Testability**: Easier to mock and inject dependencies
2. **Simplicity**: No `this` binding issues
3. **Conventions**: Aligns with functional programming style
4. **Composition**: Easier to compose multiple clients

### Backward Compatibility

The conversion maintains 100% backward compatibility:

```typescript
// Before:
import { gauntletAPI } from './gauntlet-api-client';
const week = await gauntletAPI.getCurrentWeek();

// After: (identical usage)
import { gauntletAPI } from './gauntlet-api-client';
const week = await gauntletAPI.getCurrentWeek();
```

---

## 🎯 Success Metrics

- [ ] 0 function declarations remaining
- [ ] All tests pass
- [ ] Linter happy (0 func-style errors)
- [ ] TypeScript builds successfully
- [ ] No behavior changes (same output)

---

**Status:** ⏭️ Ready (blocked by SETUP-602)  
**Assignee:** _Unassigned_  
**Completed:** _Not Started_

