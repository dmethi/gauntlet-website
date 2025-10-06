# Task SIM-609: Add Result Types for Error Handling

**Category:** RESILIENCE  
**Priority:** 🟡 MEDIUM  
**Estimated Time:** 30 minutes  
**Package:** apps/sim-engine

---

## 📋 Overview

Add Result<T, E> pattern for error handling as an alternative to throw/catch. This provides type-safe error handling for consumers who prefer explicit error values over exceptions.

---

## 🎯 Objective

Create `*Safe` wrapper functions that return `Result<T, Error>` instead of throwing exceptions, enabling railway-oriented programming patterns.

---

## 📂 Context Needed

**Files to Read:**
- `apps/sim-engine/src/models/matchup.ts` (line 136) - simulateMatchupProbabilityFromPlayers
- `apps/sim-engine/src/models/variance.ts` (lines 138, 292) - simulatePlayerScore, buildSamplingContext

**Files to Create:**
- `apps/sim-engine/src/lib/result.ts` - Result type and utilities (if not in @gauntlet/types)

**Files to Update:**
- `apps/sim-engine/src/models/matchup.ts` - Add safe wrappers
- `apps/sim-engine/src/models/variance.ts` - Add safe wrappers
- `apps/sim-engine/src/data/variance-loader.ts` - Add safe wrappers

---

## 📝 Steps

### 1. Check if Result Type Exists in @gauntlet/types

If Result type doesn't exist in `@gauntlet/types`, create it:

Create `apps/sim-engine/src/lib/result.ts`:

```typescript
/**
 * Result type for functional error handling.
 * Represents either success (Ok) or failure (Err).
 */
export type Result<T, E = Error> =
  | { ok: true; value: T }
  | { ok: false; error: E };

/**
 * Create a successful Result.
 */
export const ok = <T>(value: T): Result<T, never> => ({
  ok: true,
  value,
});

/**
 * Create a failed Result.
 */
export const err = <E>(error: E): Result<never, E> => ({
  ok: false,
  error,
});

/**
 * Check if Result is Ok.
 */
export const isOk = <T, E>(result: Result<T, E>): result is { ok: true; value: T } => {
  return result.ok;
};

/**
 * Check if Result is Err.
 */
export const isErr = <T, E>(result: Result<T, E>): result is { ok: false; error: E } => {
  return !result.ok;
};

/**
 * Unwrap Result value or throw error.
 */
export const unwrap = <T, E>(result: Result<T, E>): T => {
  if (result.ok) {
    return result.value;
  }
  throw result.error;
};

/**
 * Unwrap Result value or return default.
 */
export const unwrapOr = <T, E>(result: Result<T, E>, defaultValue: T): T => {
  if (result.ok) {
    return result.value;
  }
  return defaultValue;
};
```

### 2. Create Safe Wrapper for simulateMatchupProbabilityFromPlayers

Update `apps/sim-engine/src/models/matchup.ts`:

```typescript
import { Result, ok, err } from '../lib/result';

/**
 * Type-safe error for simulation failures.
 */
export class SimulationError extends Error {
  constructor(
    message: string,
    public readonly cause?: unknown
  ) {
    super(message);
    this.name = 'SimulationError';
  }
}

/**
 * Safe version of simulateMatchupProbabilityFromPlayers.
 * Returns Result instead of throwing exceptions.
 * 
 * @example
 * const result = await simulateMatchupProbabilitySafe(...);
 * if (result.ok) {
 *   console.log('Win%:', result.value.team1WinPct);
 * } else {
 *   console.error('Simulation failed:', result.error.message);
 * }
 */
export const simulateMatchupProbabilitySafe = async (
  team1Players: LineupPlayer[],
  team2Players: LineupPlayer[],
  iterations: number = 10000,
  gameProgress: number = 0,
  liveNflTeams?: Set<string>,
  metrics?: Metrics
): Promise<Result<MatchupSimulationResult, SimulationError>> => {
  try {
    const result = await simulateMatchupProbabilityFromPlayers(
      team1Players,
      team2Players,
      iterations,
      gameProgress,
      liveNflTeams,
      metrics
    );
    return ok(result);
  } catch (error) {
    return err(
      new SimulationError(
        'Matchup simulation failed',
        error
      )
    );
  }
};
```

### 3. Create Safe Wrapper for buildSamplingContext

Update `apps/sim-engine/src/models/variance.ts`:

```typescript
import { Result, ok, err } from '../lib/result';
import { SimulationError } from './matchup';

/**
 * Safe version of buildSamplingContext.
 * Returns Result instead of throwing exceptions.
 * 
 * @example
 * const result = await buildSamplingContextSafe(['4866'], ['QB']);
 * if (result.ok) {
 *   const ctx = result.value;
 *   // Use ctx for sampling
 * } else {
 *   console.error('Context build failed:', result.error.message);
 * }
 */
export const buildSamplingContextSafe = async (
  playerIds: string[],
  positions: string[],
  metrics?: Metrics
): Promise<Result<SamplingContext, SimulationError>> => {
  try {
    const context = await buildSamplingContext(playerIds, positions, metrics);
    return ok(context);
  } catch (error) {
    return err(
      new SimulationError(
        'Failed to build sampling context',
        error
      )
    );
  }
};
```

### 4. Create Safe Wrapper for getPositionDistribution

Update `apps/sim-engine/src/data/variance-loader.ts`:

```typescript
import { Result, ok, err } from '../lib/result';
import { SimulationError } from '../models/matchup';

/**
 * Safe version of getPositionDistribution.
 * Returns Result instead of throwing exceptions.
 */
export const getPositionDistributionSafe = async (
  position: string
): Promise<Result<{ outcomes: number[]; sampleSize: number }, SimulationError>> => {
  try {
    const distribution = await getPositionDistribution(position);
    return ok(distribution);
  } catch (error) {
    return err(
      new SimulationError(
        `Failed to get position distribution for ${position}`,
        error
      )
    );
  }
};

/**
 * Safe version of getPlayerOutcomes.
 * Returns Result instead of throwing exceptions.
 */
export const getPlayerOutcomesSafe = async (
  playerId: string
): Promise<Result<{ outcomes: number[]; sampleSize: number }, SimulationError>> => {
  try {
    const outcomes = await getPlayerOutcomes(playerId);
    return ok(outcomes);
  } catch (error) {
    return err(
      new SimulationError(
        `Failed to get player outcomes for ${playerId}`,
        error
      )
    );
  }
};
```

### 5. Export Result Types and Utilities

Update `apps/sim-engine/src/index.ts`:

```typescript
// Error handling utilities
export { Result, ok, err, isOk, isErr, unwrap, unwrapOr } from './lib/result';
export { SimulationError } from './models/matchup';

// Safe wrapper functions
export { simulateMatchupProbabilitySafe } from './models/matchup';
export { buildSamplingContextSafe } from './models/variance';
export {
  getPositionDistributionSafe,
  getPlayerOutcomesSafe,
} from './data/variance-loader';
```

### 6. Add Tests for Safe Wrappers

Add to `src/models/__tests__/matchup.test.ts`:

```typescript
import { simulateMatchupProbabilitySafe } from '../matchup';
import { isOk, isErr } from '../../lib/result';

describe('simulateMatchupProbabilitySafe', () => {
  it('should return Ok result on success', async () => {
    const result = await simulateMatchupProbabilitySafe(
      mockTeam1Players,
      mockTeam2Players,
      100
    );

    expect(isOk(result)).toBe(true);
    if (result.ok) {
      expect(result.value.team1WinPct).toBeDefined();
    }
  });

  it('should return Err result on failure', async () => {
    // Pass invalid data to trigger error
    const result = await simulateMatchupProbabilitySafe(
      [],
      [],
      -1 // Invalid iterations
    );

    expect(isErr(result)).toBe(true);
    if (!result.ok) {
      expect(result.error).toBeInstanceOf(SimulationError);
      expect(result.error.message).toContain('failed');
    }
  });

  it('should allow functional composition', async () => {
    const result = await simulateMatchupProbabilitySafe(
      mockTeam1Players,
      mockTeam2Players,
      100
    );

    // Functional style error handling
    const winPct = result.ok ? result.value.team1WinPct : 0.5;
    expect(winPct).toBeGreaterThanOrEqual(0);
    expect(winPct).toBeLessThanOrEqual(1);
  });
});
```

### 7. Document Usage in JSDoc

Update JSDoc for original functions to mention safe alternatives:

```typescript
/**
 * Simulate a matchup between two teams using Monte Carlo sampling.
 * 
 * ⚠️ This function throws exceptions on error.
 * For type-safe error handling, use {@link simulateMatchupProbabilitySafe}
 * 
 * @throws {Error} If validation fails or simulation errors occur
 * 
 * @see simulateMatchupProbabilitySafe for Result-based error handling
 */
export const simulateMatchupProbabilityFromPlayers = async (
  // ... implementation
);
```

### 8. Verify Build and Tests

```bash
pnpm build
pnpm test
```

---

## ✅ Acceptance Criteria

- [ ] Result type and utilities created (ok, err, isOk, isErr, unwrap, unwrapOr)
- [ ] SimulationError custom error class created
- [ ] 4 safe wrapper functions created:
  - simulateMatchupProbabilitySafe
  - buildSamplingContextSafe
  - getPositionDistributionSafe
  - getPlayerOutcomesSafe
- [ ] All safe wrappers return Result<T, SimulationError>
- [ ] Original functions preserved (backwards compatible)
- [ ] Safe wrappers exported from barrel file
- [ ] JSDoc cross-references between throwing and safe versions
- [ ] Tests validate Result-based error handling
- [ ] `pnpm build` passes with 0 errors
- [ ] No breaking changes to existing API

---

## 🔗 Related Tasks

**Depends On:**
- SIM-604: Add JSDoc to All Exported Functions (documentation foundation)

**Blocks:** None

---

## 📊 Context Usage

- **Files to read:** 3 files (~300 lines)
- **Files to create:** 1 file (~80 lines)
- **Files to update:** 3 files (~200 lines changes)
- **Time estimate:** 30 minutes

---

## 🚀 Cursor Prompt

```
I'm working on SIM-609. Please:

1. Create src/lib/result.ts with Result type and utilities
2. Add SimulationError class to matchup.ts
3. Create 4 safe wrapper functions: *Safe versions
4. Export Result utilities and safe wrappers
5. Add tests for safe wrappers
6. Update JSDoc to cross-reference safe versions
7. Verify with pnpm build and pnpm test

Follow the task steps exactly.
```

---

## ✓ Verification Commands

```bash
# Verify TypeScript compilation
cd apps/sim-engine
pnpm build

# Verify tests pass
pnpm test

# Test Result pattern usage
node -e "
const { simulateMatchupProbabilitySafe, isOk } = require('./dist/src/index.js');
// ... run simulation ...
"
```

---

## 📝 Commit Message Template

```
feat(sim-engine): add Result types for functional error handling (SIM-609)

- Create Result<T, E> type with ok/err constructors
- Add utility functions: isOk, isErr, unwrap, unwrapOr
- Create SimulationError custom error class
- Add 4 safe wrapper functions returning Result:
  - simulateMatchupProbabilitySafe
  - buildSamplingContextSafe
  - getPositionDistributionSafe
  - getPlayerOutcomesSafe
- Preserve original throwing functions for backwards compatibility
- Add tests validating Result-based error handling
- Update JSDoc with cross-references
- Enable railway-oriented programming patterns
- TypeScript compilation passes with 0 errors

Part of sim-engine enterprise readiness initiative
```

