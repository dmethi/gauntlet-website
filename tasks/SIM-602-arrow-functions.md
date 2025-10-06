# Task SIM-602: Convert All Functions to Arrow Functions

**Category:** REFACTOR  
**Priority:** ⚠️ HIGH  
**Estimated Time:** 45 minutes  
**Package:** apps/sim-engine

---

## 📋 Overview

Convert all regular function declarations and async function declarations to arrow functions with explicit return types. This aligns with CODING_CONVENTIONS.MD which mandates 100% arrow functions (no classes, no regular function declarations).

---

## 🎯 Objective

Convert all 18 functions across 4 files from regular/async function declarations to arrow function pattern with explicit return types, achieving 100% compliance with repo conventions.

---

## 📂 Context Needed

**Files to Update:**
- `apps/sim-engine/src/models/matchup.ts` (5 functions: lines 14, 83, 94, 136, 286)
- `apps/sim-engine/src/models/variance.ts` (7 functions: lines 16, 53, 100, 131, 138, 188, 229)
- `apps/sim-engine/src/data/variance-loader.ts` (5 functions: lines 26, 51, 82, 141, 162, 181)
- `apps/sim-engine/src/simulations/season-sim.ts` (1 function: line 1)

**Reference:**
- `CODING_CONVENTIONS.MD` (lines 22-62) - Arrow function patterns
- `apps/server/src/lib/gauntlet-api-client.ts` (lines 50-100) - Example arrow functions

---

## 📝 Steps

### 1. Convert matchup.ts Functions

**Pattern:**
```typescript
// ❌ BEFORE
async function simulateMatchup(
  team1: Lineup,
  team2: Lineup,
  gameProgress: number = 0
): Promise<MatchupResult> {
  // ... implementation
}

// ✅ AFTER
const simulateMatchup = async (
  team1: Lineup,
  team2: Lineup,
  gameProgress: number = 0
): Promise<MatchupResult> => {
  // ... implementation
};
```

**Functions to convert:**
1. `simulateMatchup` (line 14) - Change to `const simulateMatchup = async (...) => { ... };`
2. `probToMoneyLine` (line 83) - Change to `const probToMoneyLine = (probability: number): number => { ... };`
3. `calculateBettingLines` (line 94) - Change to `const calculateBettingLines = (...) => { ... };`
4. `simulateMatchupProbabilityFromPlayers` (line 136) - Already exported, add `const` pattern
5. `simulateMatchupProbability` (line 286) - Already exported, add `const` pattern

### 2. Convert variance.ts Functions

**Functions to convert:**
1. `getPositionStdDev` (line 16) - Change to `const getPositionStdDev = (position: string): number => { ... };`
2. `getPositionDistribution` (line 53) - Change to `const getPositionDistribution = async (...) => { ... };`
3. `getPlayerOutcomes` (line 100) - Change to `const getPlayerOutcomes = async (...) => { ... };`
4. `randomSample` (line 131) - Change to `const randomSample = <T>(arr: T[]): T => { ... };`
5. Keep exports as `export const` for public functions

### 3. Convert variance-loader.ts Functions

**Functions to convert:**
1. `initializeCaches` (line 26) - Change to `const initializeCaches = (): void => { ... };`
2. `getPositionDistribution` (line 51) - Change to `export const getPositionDistribution = async (...) => { ... };`
3. `getPlayerOutcomes` (line 82) - Change to `export const getPlayerOutcomes = async (...) => { ... };`
4. `generateNormalDistribution` (line 141) - Change to `const generateNormalDistribution = (...): number[] => { ... };`
5. `getDefaultPositionVariance` (line 162) - Change to `const getDefaultPositionVariance = (...) => { ... };`
6. `getDataInfo` (line 181) - Change to `export const getDataInfo = () => { ... };`

### 4. Convert season-sim.ts Functions

```typescript
// ❌ BEFORE
export async function runSeasonSimulation(weeks: number) {
  // ...
}

// ✅ AFTER
export const runSeasonSimulation = async (weeks: number): Promise<{
  totalWeeks: number;
  status: string;
  message: string;
}> => {
  // ...
};
```

### 5. Add Explicit Return Types

Ensure ALL exported functions have explicit return types:
- `Promise<MatchupResult>` for async functions
- `number`, `string`, `void` for sync functions
- Full type definitions for complex return objects

### 6. Verify Changes

```bash
pnpm build
pnpm lint
```

---

## ✅ Acceptance Criteria

- [ ] All 18 functions converted to arrow function syntax
- [ ] All exported functions have explicit return types
- [ ] `pnpm build` passes with 0 errors
- [ ] `pnpm lint` shows 0 function declaration violations
- [ ] No functional changes (pure refactor)
- [ ] All function signatures preserved (backwards compatible)

---

## 🔗 Related Tasks

**Depends On:**
- SIM-601: Add ESLint and Prettier Configuration (provides linting)

**Blocks:**
- SIM-603: Add Barrel Exports (cleaner after function refactor)
- SIM-604: Add JSDoc to All Exported Functions (functions finalized)

---

## 📊 Context Usage

- **Files to update:** 4 files (~800 lines total)
- **Functions to convert:** 18 functions
- **Time estimate:** 45 minutes

---

## 🚀 Cursor Prompt

```
I'm working on SIM-602. Please:

1. Read CODING_CONVENTIONS.MD (lines 22-62) for arrow function patterns
2. Read apps/sim-engine/src/models/matchup.ts
3. Read apps/sim-engine/src/models/variance.ts
4. Convert all 18 functions to arrow function syntax
5. Add explicit return types to all exported functions
6. Verify with pnpm build and pnpm lint

Follow the task steps exactly. Use the patterns shown in the task file.
```

---

## ✓ Verification Commands

```bash
# Verify no function declarations remain
grep -r "^function " apps/sim-engine/src/
grep -r "^async function " apps/sim-engine/src/
grep -r "^export function " apps/sim-engine/src/
grep -r "^export async function " apps/sim-engine/src/

# Should return 0 results

# Verify TypeScript compilation
cd apps/sim-engine
pnpm build

# Verify linting
pnpm lint
```

---

## 📝 Commit Message Template

```
refactor(sim-engine): convert all functions to arrow functions (SIM-602)

- Convert 18 functions across 4 files to arrow function syntax
- Add explicit return types to all exported functions
- matchup.ts: 5 functions converted
- variance.ts: 7 functions converted
- variance-loader.ts: 5 functions converted
- season-sim.ts: 1 function converted
- 100% compliance with CODING_CONVENTIONS.MD
- TypeScript compilation passes with 0 errors

Part of sim-engine enterprise readiness initiative
```

