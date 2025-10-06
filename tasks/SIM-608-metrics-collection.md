# Task SIM-608: Add Metrics Collection

**Category:** OBSERVABILITY  
**Priority:** 🟡 MEDIUM  
**Estimated Time:** 45 minutes  
**Package:** apps/sim-engine

---

## 📋 Overview

Add metrics collection to track simulation performance, cache effectiveness, and usage patterns. This enables performance monitoring and optimization insights.

---

## 🎯 Objective

Instrument sim-engine with metrics tracking for simulation duration, iterations, cache hits, and live game simulations using the Metrics pattern from @gauntlet/types.

---

## 📂 Context Needed

**Files to Read:**
- `apps/server/src/lib/metrics.ts` (full file) - Metrics factory pattern
- `apps/server/src/lib/gauntlet-api-client.ts` (lines 50-100) - Metrics usage example
- `apps/sim-engine/src/models/matchup.ts` (line 136) - simulateMatchupProbabilityFromPlayers
- `apps/sim-engine/src/models/variance.ts` (line 292) - buildSamplingContext

**Files to Update:**
- `apps/sim-engine/src/models/matchup.ts` - Add simulation metrics
- `apps/sim-engine/src/models/variance.ts` - Add cache metrics
- `apps/sim-engine/src/index.ts` - Export createMetrics

---

## 📝 Steps

### 1. Verify Metrics Available from Types Package

Metrics should already be exported from `@gauntlet/types`:

```typescript
import type { Metrics, MetricsSummary } from '@gauntlet/types';
import { createMetrics } from '@gauntlet/types';
```

If not available, we need to add it to the types package first.

### 2. Add Metrics to simulateMatchupProbabilityFromPlayers

Update `apps/sim-engine/src/models/matchup.ts`:

```typescript
import type { Metrics } from '@gauntlet/types';

export const simulateMatchupProbabilityFromPlayers = async (
  team1Players: LineupPlayer[],
  team2Players: LineupPlayer[],
  iterations: number = 10000,
  gameProgress: number = 0,
  liveNflTeams?: Set<string>,
  metrics?: Metrics // Optional metrics instance
): Promise<MatchupSimulationResult> => {
  const startTime = Date.now();

  // Track if this is a live game simulation
  const isLiveSimulation = liveNflTeams && liveNflTeams.size > 0;
  if (isLiveSimulation && metrics) {
    metrics.increment('simulation.live_game.count');
  }

  // ... existing simulation logic ...

  // Track simulation completion
  if (metrics) {
    metrics.recordTiming('simulation.matchup.duration', Date.now() - startTime);
    metrics.increment('simulation.matchup.iterations', iterations);
    metrics.increment('simulation.matchup.completed');
  }

  return {
    team1WinPct,
    team2WinPct,
    // ... rest of result
  };
};
```

### 3. Add Metrics to buildSamplingContext

Update `apps/sim-engine/src/models/variance.ts`:

```typescript
import type { Metrics } from '@gauntlet/types';

export const buildSamplingContext = async (
  playerIds: string[],
  positions: string[],
  metrics?: Metrics
): Promise<SamplingContext> => {
  const startTime = Date.now();

  const uniquePlayerIds = Array.from(new Set(playerIds));
  const uniquePositions = Array.from(new Set(positions));

  // ... existing fetching logic ...

  // Track context build completion
  if (metrics) {
    metrics.recordTiming('sampling.context.build_duration', Date.now() - startTime);
    metrics.increment('sampling.context.players_fetched', uniquePlayerIds.length);
    metrics.increment('sampling.context.positions_fetched', uniquePositions.length);
  }

  return {
    positionToOutcomes,
    playerToOutcomes,
    playerSampleCounts,
    positionSampleCounts,
  };
};
```

### 4. Add Cache Hit Metrics to variance.ts

Update `getPositionDistribution` function:

```typescript
const getPositionDistribution = async (
  position: string,
  metrics?: Metrics
): Promise<{
  outcomes: number[];
  sampleSize: number;
}> => {
  // Check cache first
  const cached = positionDistributionCache.get(position);
  if (cached && Date.now() - cached.lastUpdated.getTime() < 60 * 60 * 1000) {
    if (metrics) {
      metrics.increment('variance.position_distribution.cache_hit');
    }
    return cached;
  }

  if (metrics) {
    metrics.increment('variance.position_distribution.cache_miss');
  }

  // ... rest of function
};
```

Update `getPlayerOutcomes` function similarly:

```typescript
const getPlayerOutcomes = async (
  playerId: string,
  metrics?: Metrics
): Promise<{
  outcomes: number[];
  sampleSize: number;
}> => {
  const cached = playerOutcomeCache.get(playerId);
  if (cached && Date.now() - cached.lastUpdated.getTime() < 60 * 60 * 1000) {
    if (metrics) {
      metrics.increment('variance.player_outcomes.cache_hit');
    }
    return cached;
  }

  if (metrics) {
    metrics.increment('variance.player_outcomes.cache_miss');
  }

  // ... rest of function
};
```

### 5. Update Function Calls to Thread Metrics

Update `buildSamplingContext` to pass metrics to data fetching functions:

```typescript
export const buildSamplingContext = async (
  playerIds: string[],
  positions: string[],
  metrics?: Metrics
): Promise<SamplingContext> => {
  // ... setup ...

  // Fetch position distributions with metrics
  await Promise.all(
    uniquePositions.map(async pos => {
      const dist = await getPositionDistribution(pos, metrics);
      positionToOutcomes.set(pos, dist.outcomes);
      positionSampleCounts.set(pos, dist.sampleSize);
    })
  );

  // Fetch player outcomes with metrics
  await Promise.all(
    uniquePlayerIds.map(async id => {
      const out = await getPlayerOutcomes(id, metrics);
      playerToOutcomes.set(id, out.outcomes);
      playerSampleCounts.set(id, out.sampleSize);
    })
  );

  // ... rest of function
};
```

### 6. Update simulateMatchupProbabilityFromPlayers to Pass Metrics

```typescript
export const simulateMatchupProbabilityFromPlayers = async (
  team1Players: LineupPlayer[],
  team2Players: LineupPlayer[],
  iterations: number = 10000,
  gameProgress: number = 0,
  liveNflTeams?: Set<string>,
  metrics?: Metrics
): Promise<MatchupSimulationResult> => {
  // ... setup ...

  // Build context with metrics
  const ctx = await buildSamplingContext(playerIds, positions, metrics);

  // ... simulation loop ...
};
```

### 7. Export createMetrics from Barrel

If `createMetrics` is in `@gauntlet/types`, just re-export it:

```typescript
// apps/sim-engine/src/index.ts
export { createMetrics } from '@gauntlet/types';
export type { Metrics, MetricsSummary } from '@gauntlet/types';
```

### 8. Add Usage Example in JSDoc

Update JSDoc for `simulateMatchupProbabilityFromPlayers`:

```typescript
/**
 * @example
 * // With metrics collection
 * import { simulateMatchupProbabilityFromPlayers, createMetrics } from '@gauntlet/sim-engine';
 * 
 * const metrics = createMetrics();
 * const result = await simulateMatchupProbabilityFromPlayers(
 *   team1Players,
 *   team2Players,
 *   10000,
 *   0,
 *   undefined,
 *   metrics
 * );
 * 
 * const summary = metrics.getSummary();
 * console.log('Simulation took:', summary.timers['simulation.matchup.duration']);
 * console.log('Cache hit rate:', summary.counters['variance.position_distribution.cache_hit']);
 */
```

### 9. Add Tests for Metrics

Add test to `matchup.test.ts`:

```typescript
it('should track metrics when provided', async () => {
  const { createMetrics } = await import('@gauntlet/types');
  const metrics = createMetrics();

  await simulateMatchupProbabilityFromPlayers(
    mockTeam1Players,
    mockTeam2Players,
    100,
    0,
    undefined,
    metrics
  );

  const summary = metrics.getSummary();
  expect(summary.counters['simulation.matchup.completed']).toBe(1);
  expect(summary.counters['simulation.matchup.iterations']).toBe(100);
  expect(summary.timers['simulation.matchup.duration']).toBeDefined();
});
```

### 10. Verify Metrics Collection

```bash
pnpm build
pnpm test
```

---

## ✅ Acceptance Criteria

- [ ] Metrics parameter added to simulation functions (optional)
- [ ] 6 metric types tracked:
  - `simulation.matchup.duration`: Timing
  - `simulation.matchup.iterations`: Counter
  - `simulation.matchup.completed`: Counter
  - `simulation.live_game.count`: Counter
  - `sampling.context.build_duration`: Timing
  - `variance.position_distribution.cache_hit/miss`: Counter
  - `variance.player_outcomes.cache_hit/miss`: Counter
- [ ] Metrics threaded through function calls
- [ ] createMetrics exported from barrel file
- [ ] JSDoc updated with metrics usage example
- [ ] Tests validate metrics collection
- [ ] `pnpm build` passes with 0 errors
- [ ] No performance impact (<1% overhead)

---

## 🔗 Related Tasks

**Depends On:**
- SIM-607: Add Structured Logging (observability foundation)

**Blocks:** None

---

## 📊 Context Usage

- **Files to read:** 4 files (~500 lines)
- **Files to update:** 3 files (~100 lines changes)
- **Time estimate:** 45 minutes

---

## 🚀 Cursor Prompt

```
I'm working on SIM-608. Please:

1. Read apps/server/src/lib/metrics.ts for metrics patterns
2. Read apps/sim-engine/src/models/matchup.ts
3. Read apps/sim-engine/src/models/variance.ts
4. Add optional metrics parameter to simulation functions
5. Track 6 metric types (duration, iterations, cache hits)
6. Thread metrics through function calls
7. Export createMetrics from barrel
8. Add metrics test case
9. Verify with pnpm build and pnpm test

Follow the task steps exactly.
```

---

## ✓ Verification Commands

```bash
# Verify TypeScript compilation
cd apps/sim-engine
pnpm build

# Verify tests pass with metrics
pnpm test

# Manual test with metrics
node -e "
const { simulateMatchupProbabilityFromPlayers, createMetrics } = require('./dist/src/index.js');
const metrics = createMetrics();
// ... run simulation ...
console.log(metrics.getSummary());
"
```

---

## 📝 Commit Message Template

```
feat(sim-engine): add metrics collection for performance monitoring (SIM-608)

- Add optional metrics parameter to simulation functions
- Track simulation.matchup.duration and iterations
- Track sampling.context.build_duration
- Track variance cache hit/miss rates for position and player data
- Track simulation.live_game.count for live game simulations
- Export createMetrics from barrel file
- Update JSDoc with metrics usage examples
- Add test case validating metrics collection
- No performance impact (<1% overhead)
- Enables performance monitoring and optimization insights

Part of sim-engine enterprise readiness initiative
```

