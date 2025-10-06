# Task SIM-603: Add Barrel Exports (index.ts)

**Category:** REFACTOR  
**Priority:** 🟡 MEDIUM  
**Estimated Time:** 20 minutes  
**Package:** apps/sim-engine

---

## 📋 Overview

Create barrel export files (`index.ts`) for clean import paths throughout the sim-engine package. This enables consistent import patterns and better tree-shaking.

---

## 🎯 Objective

Add barrel exports for models and data modules, update root index.ts with organized exports, enabling clean imports from `@gauntlet/sim-engine` and sub-modules.

---

## 📂 Context Needed

**Files to Read:**
- `apps/sim-engine/src/index.ts` (current exports)
- `apps/sim-engine/src/models/matchup.ts` (exports to barrel)
- `apps/sim-engine/src/models/variance.ts` (exports to barrel)
- `apps/sim-engine/src/data/variance-loader.ts` (exports to barrel)

**Files to Create:**
- `apps/sim-engine/src/models/index.ts` - Models barrel
- `apps/sim-engine/src/data/index.ts` - Data barrel
- Update `apps/sim-engine/src/index.ts` - Root barrel

**Reference:**
- `apps/server/src/lib/index.ts` - Example barrel exports

---

## 📝 Steps

### 1. Create Models Barrel Export

Create `apps/sim-engine/src/models/index.ts`:
```typescript
// Re-export all matchup simulation functions
export {
  simulateMatchupProbabilityFromPlayers,
  simulateMatchupProbability,
} from './matchup';

// Re-export all variance functions
export {
  simulatePlayerScore,
  simulatePlayerRange,
  getVarianceModel,
  buildSamplingContext,
  samplePlayerScoreFromContext,
} from './variance';

// Re-export types from central package
export type {
  LineupPlayer,
  Lineup,
  MatchupResult,
  MatchupSimulationResult,
  SamplingContext,
} from '@gauntlet/types';
```

### 2. Create Data Barrel Export

Create `apps/sim-engine/src/data/index.ts`:
```typescript
// Re-export variance data loader functions
export {
  getPositionDistribution,
  getPlayerOutcomes,
  getDataInfo,
} from './variance-loader';

// Re-export variance data types
export type {
  PositionVarianceRecord,
  PlayerVarianceRecord,
  ProjectionErrorRecord,
  VarianceData,
} from './variance-data.types';
```

### 3. Update Root Barrel Export

Update `apps/sim-engine/src/index.ts`:
```typescript
// ============================================
// SIMULATION FUNCTIONS
// ============================================

// Matchup simulations (primary API)
export {
  simulateMatchupProbabilityFromPlayers,
  simulateMatchupProbability,
} from './models/matchup';

// Player variance simulations
export {
  simulatePlayerScore,
  simulatePlayerRange,
  getVarianceModel,
  buildSamplingContext,
  samplePlayerScoreFromContext,
} from './models/variance';

// Season simulations (experimental)
export { runSeasonSimulation } from './simulations/season-sim';

// ============================================
// DATA FUNCTIONS
// ============================================

export {
  getPositionDistribution,
  getPlayerOutcomes,
  getDataInfo,
} from './data/variance-loader';

// ============================================
// TYPE EXPORTS
// ============================================

export type {
  LineupPlayer,
  Lineup,
  MatchupResult,
  MatchupSimulationResult,
  SamplingContext,
  ScoreDistribution,
  ImpliedOdds,
} from '@gauntlet/types';

export type {
  PositionVarianceRecord,
  PlayerVarianceRecord,
  ProjectionErrorRecord,
  VarianceData,
} from './data/variance-data.types';

// ============================================
// BARREL EXPORTS (for sub-module imports)
// ============================================

export * as models from './models';
export * as data from './data';
```

### 4. Verify Import Paths Work

Test that these import patterns work:
```typescript
// Root package imports
import { simulateMatchupProbabilityFromPlayers } from '@gauntlet/sim-engine';

// Sub-module imports
import { buildSamplingContext } from '@gauntlet/sim-engine/models';
import { getPlayerOutcomes } from '@gauntlet/sim-engine/data';
```

### 5. Update package.json Exports

Update `apps/sim-engine/package.json`:
```json
{
  "exports": {
    ".": {
      "import": "./dist/src/index.js",
      "types": "./dist/src/index.d.ts"
    },
    "./models": {
      "import": "./dist/src/models/index.js",
      "types": "./dist/src/models/index.d.ts"
    },
    "./data": {
      "import": "./dist/src/data/index.js",
      "types": "./dist/src/data/index.d.ts"
    }
  }
}
```

### 6. Build and Verify

```bash
pnpm build
pnpm typecheck
```

---

## ✅ Acceptance Criteria

- [ ] `src/models/index.ts` created with organized exports
- [ ] `src/data/index.ts` created with organized exports
- [ ] `src/index.ts` updated with categorized barrel exports
- [ ] `package.json` exports field configured for sub-modules
- [ ] Can import from `@gauntlet/sim-engine` (root)
- [ ] Can import from `@gauntlet/sim-engine/models` (sub-module)
- [ ] Can import from `@gauntlet/sim-engine/data` (sub-module)
- [ ] TypeScript compilation passes
- [ ] No breaking changes to existing consumers

---

## 🔗 Related Tasks

**Depends On:**
- SIM-602: Convert All Functions to Arrow Functions (function signatures stable)

**Blocks:**
- SIM-604: Add JSDoc to All Exported Functions (exports finalized)

---

## 📊 Context Usage

- **Files to read:** 4 files (~400 lines)
- **Files to create:** 2 files (~80 lines)
- **Files to update:** 2 files (~100 lines)
- **Time estimate:** 20 minutes

---

## 🚀 Cursor Prompt

```
I'm working on SIM-603. Please:

1. Read apps/sim-engine/src/index.ts
2. Read apps/sim-engine/src/models/matchup.ts (exports only)
3. Read apps/sim-engine/src/models/variance.ts (exports only)
4. Create src/models/index.ts with barrel exports
5. Create src/data/index.ts with barrel exports
6. Update src/index.ts with organized categories
7. Update package.json exports field
8. Verify with pnpm build

Follow the task steps exactly.
```

---

## ✓ Verification Commands

```bash
# Verify barrel files exist
ls -la apps/sim-engine/src/models/index.ts
ls -la apps/sim-engine/src/data/index.ts

# Verify TypeScript compilation
cd apps/sim-engine
pnpm build

# Verify exports in dist/
ls -la dist/src/models/index.d.ts
ls -la dist/src/data/index.d.ts

# Test import paths (in apps/web or apps/server)
# Should work without errors
```

---

## 📝 Commit Message Template

```
refactor(sim-engine): add barrel exports for clean import paths (SIM-603)

- Create src/models/index.ts barrel export
- Create src/data/index.ts barrel export
- Update src/index.ts with organized categories
- Add package.json exports for sub-modules
- Enable clean imports: @gauntlet/sim-engine/models, /data
- Improve tree-shaking and code organization
- TypeScript compilation passes with 0 errors

Part of sim-engine enterprise readiness initiative
```

