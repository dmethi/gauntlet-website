# Task SIM-605: Add Comprehensive Test Suite

**Category:** TEST  
**Priority:** ⚠️ CRITICAL  
**Estimated Time:** 2 hours  
**Package:** apps/sim-engine

---

## 📋 Overview

Add comprehensive test suite with 45+ tests achieving 80%+ coverage. This is CRITICAL for enterprise readiness as sim-engine performs complex Monte Carlo simulations (10,000+ iterations) that must be validated.

---

## 🎯 Objective

Create 3 test files with 45 total tests covering simulation logic, variance calculations, and data loading. Achieve 80%+ code coverage with fast execution (<30 seconds).

---

## 📂 Context Needed

**Files to Test:**
- `apps/sim-engine/src/models/matchup.ts` - Create `__tests__/matchup.test.ts`
- `apps/sim-engine/src/models/variance.ts` - Create `__tests__/variance.test.ts`
- `apps/sim-engine/src/data/variance-loader.ts` - Create `__tests__/variance-loader.test.ts`

**Reference:**
- `apps/server/src/lib/__tests__/gauntlet-api-client.test.ts` - Test patterns
- `apps/server/vitest.config.ts` - Vitest configuration

---

## 📝 Steps

### 1. Create Test Directory Structure

```bash
cd apps/sim-engine
mkdir -p src/models/__tests__
mkdir -p src/data/__tests__
```

### 2. Create matchup.test.ts (15 tests)

Create `src/models/__tests__/matchup.test.ts`:

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import {
  simulateMatchupProbabilityFromPlayers,
  simulateMatchupProbability,
} from '../matchup';
import type { LineupPlayer, Lineup } from '@gauntlet/types';

describe('simulateMatchupProbabilityFromPlayers', () => {
  const mockTeam1Players: LineupPlayer[] = [
    { id: '1', position: 'QB', projection: 24.5 },
    { id: '2', position: 'RB', projection: 15.2 },
    { id: '3', position: 'RB', projection: 12.8 },
    { id: '4', position: 'WR', projection: 14.3 },
    { id: '5', position: 'WR', projection: 11.7 },
    { id: '6', position: 'WR', projection: 9.2 },
    { id: '7', position: 'TE', projection: 8.5 },
    { id: '8', position: 'K', projection: 7.8 },
  ];

  const mockTeam2Players: LineupPlayer[] = [
    { id: '11', position: 'QB', projection: 22.3 },
    { id: '12', position: 'RB', projection: 14.1 },
    { id: '13', position: 'RB', projection: 11.9 },
    { id: '14', position: 'WR', projection: 13.5 },
    { id: '15', position: 'WR', projection: 10.8 },
    { id: '16', position: 'WR', projection: 8.9 },
    { id: '17', position: 'TE', projection: 7.2 },
    { id: '18', position: 'K', projection: 7.5 },
  ];

  it('should return win probabilities that sum to 1.0', async () => {
    const result = await simulateMatchupProbabilityFromPlayers(
      mockTeam1Players,
      mockTeam2Players,
      100 // Small iterations for test speed
    );

    expect(result.team1WinPct + result.team2WinPct).toBeCloseTo(1.0, 2);
  });

  it('should return higher win probability for team with higher projections', async () => {
    const higherTeam: LineupPlayer[] = mockTeam1Players.map(p => ({
      ...p,
      projection: p.projection * 1.5,
    }));

    const result = await simulateMatchupProbabilityFromPlayers(
      higherTeam,
      mockTeam2Players,
      200
    );

    expect(result.team1WinPct).toBeGreaterThan(0.7); // Should win >70%
  });

  it('should return balanced probabilities for equal projections', async () => {
    const result = await simulateMatchupProbabilityFromPlayers(
      mockTeam1Players,
      mockTeam1Players.map(p => ({ ...p, id: `${p.id}_copy` })),
      200
    );

    expect(result.team1WinPct).toBeGreaterThan(0.4);
    expect(result.team1WinPct).toBeLessThan(0.6);
  });

  it('should include score distributions with p10, median, p90', async () => {
    const result = await simulateMatchupProbabilityFromPlayers(
      mockTeam1Players,
      mockTeam2Players,
      100
    );

    expect(result.team1Scores.p10).toBeLessThan(result.team1Scores.median);
    expect(result.team1Scores.median).toBeLessThan(result.team1Scores.p90);
    expect(result.team1Scores.mean).toBeGreaterThan(0);
  });

  it('should include implied betting odds', async () => {
    const result = await simulateMatchupProbabilityFromPlayers(
      mockTeam1Players,
      mockTeam2Players,
      100
    );

    expect(result.impliedOdds.spread).toBeDefined();
    expect(result.impliedOdds.total).toBeGreaterThan(0);
    expect(result.impliedOdds.team1MoneyLine).toBeDefined();
    expect(result.impliedOdds.team2MoneyLine).toBeDefined();
  });

  it('should handle live game with currentScore', async () => {
    const liveTeam1 = mockTeam1Players.map(p => ({
      ...p,
      currentScore: p.projection * 0.6, // 60% of projection already scored
      nflTeam: 'KC',
    }));
    const liveTeam2 = mockTeam2Players.map(p => ({
      ...p,
      currentScore: p.projection * 0.4, // 40% of projection already scored
      nflTeam: 'BUF',
    }));

    const result = await simulateMatchupProbabilityFromPlayers(
      liveTeam1,
      liveTeam2,
      100,
      0.65, // 65% game complete
      new Set(['KC', 'BUF'])
    );

    expect(result.team1WinPct).toBeGreaterThan(0.7); // Team 1 ahead
  });

  it('should reduce variance as gameProgress approaches 1', async () => {
    // Run two simulations: early game vs late game
    const earlyGame = await simulateMatchupProbabilityFromPlayers(
      mockTeam1Players,
      mockTeam2Players,
      100,
      0.1 // 10% complete
    );

    const lateGame = await simulateMatchupProbabilityFromPlayers(
      mockTeam1Players,
      mockTeam2Players,
      100,
      0.9 // 90% complete
    );

    // Score range should be narrower in late game
    const earlyRange = earlyGame.team1Scores.p90 - earlyGame.team1Scores.p10;
    const lateRange = lateGame.team1Scores.p90 - lateGame.team1Scores.p10;

    expect(lateRange).toBeLessThan(earlyRange);
  });

  it('should handle minimum iteration count', async () => {
    const result = await simulateMatchupProbabilityFromPlayers(
      mockTeam1Players,
      mockTeam2Players,
      10 // Minimum iterations
    );

    expect(result.team1WinPct).toBeGreaterThanOrEqual(0);
    expect(result.team1WinPct).toBeLessThanOrEqual(1);
  });

  // Add 7 more tests:
  // - Edge case: zero projections
  // - Edge case: very high projections (100+)
  // - Post-game scenario (gameProgress near 1.0)
  // - Median margin calculation accuracy
  // - Moneyline conversion accuracy
  // - Spread calculation (should be half point increments)
  // - Performance: 1000 iterations completes in <5 seconds
});

describe('simulateMatchupProbability', () => {
  it('should accept Lineup objects', async () => {
    const lineup1: Lineup = {
      qb: { id: '1', position: 'QB', projection: 24 },
      rb1: { id: '2', position: 'RB', projection: 15 },
      rb2: { id: '3', position: 'RB', projection: 12 },
      wr1: { id: '4', position: 'WR', projection: 14 },
      wr2: { id: '5', position: 'WR', projection: 11 },
      wr3: { id: '6', position: 'WR', projection: 9 },
      te: { id: '7', position: 'TE', projection: 8 },
      flex: { id: '8', position: 'RB', projection: 10 },
    };

    const lineup2: Lineup = { ...lineup1 }; // Copy for team 2

    const result = await simulateMatchupProbability(lineup1, lineup2, 50);
    expect(result.team1WinPct).toBeDefined();
  });

  it('should accept LineupPlayer arrays', async () => {
    const team1 = [
      { id: '1', position: 'QB', projection: 24 },
      { id: '2', position: 'RB', projection: 15 },
    ];
    const team2 = [
      { id: '3', position: 'QB', projection: 22 },
      { id: '4', position: 'RB', projection: 14 },
    ];

    const result = await simulateMatchupProbability(team1 as LineupPlayer[], team2 as LineupPlayer[], 50);
    expect(result.team1WinPct).toBeDefined();
  });
});
```

### 3. Create variance.test.ts (18 tests)

Create `src/models/__tests__/variance.test.ts`:

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import {
  buildSamplingContext,
  samplePlayerScoreFromContext,
  simulatePlayerScore,
  simulatePlayerRange,
  getVarianceModel,
} from '../variance';

describe('buildSamplingContext', () => {
  it('should fetch position and player distributions', async () => {
    const ctx = await buildSamplingContext(['4866'], ['QB']);

    expect(ctx.positionToOutcomes.has('QB')).toBe(true);
    expect(ctx.playerToOutcomes.has('4866')).toBe(true);
    expect(ctx.playerSampleCounts.has('4866')).toBe(true);
  });

  it('should handle multiple players and positions', async () => {
    const ctx = await buildSamplingContext(
      ['4866', '7564', '8110'],
      ['QB', 'RB', 'WR']
    );

    expect(ctx.positionToOutcomes.size).toBeGreaterThanOrEqual(3);
    expect(ctx.playerToOutcomes.size).toBeGreaterThanOrEqual(3);
  });

  it('should deduplicate player IDs and positions', async () => {
    const ctx = await buildSamplingContext(
      ['4866', '4866', '4866'], // Duplicates
      ['QB', 'QB', 'QB']
    );

    expect(ctx.positionToOutcomes.size).toBe(1);
  });
});

describe('samplePlayerScoreFromContext', () => {
  it('should return score close to projection', async () => {
    const ctx = await buildSamplingContext(['4866'], ['QB']);
    const projection = 24.5;
    const score = samplePlayerScoreFromContext(ctx, '4866', 'QB', projection);

    // Score should be within reasonable range (0.5x to 2x projection)
    expect(score).toBeGreaterThan(projection * 0.3);
    expect(score).toBeLessThan(projection * 2.5);
  });

  it('should reduce variance with gameProgress', async () => {
    const ctx = await buildSamplingContext(['4866'], ['QB']);
    const projection = 24.5;

    // Sample many times to check variance reduction
    const scores0 = Array.from({ length: 100 }, () =>
      samplePlayerScoreFromContext(ctx, '4866', 'QB', projection, 0)
    );
    const scores90 = Array.from({ length: 100 }, () =>
      samplePlayerScoreFromContext(ctx, '4866', 'QB', projection, 0.9)
    );

    const stdDev0 = standardDeviation(scores0);
    const stdDev90 = standardDeviation(scores90);

    expect(stdDev90).toBeLessThan(stdDev0);
  });

  it('should throw error for negative projection', async () => {
    const ctx = await buildSamplingContext(['4866'], ['QB']);
    expect(() =>
      samplePlayerScoreFromContext(ctx, '4866', 'QB', -5)
    ).toThrow('Invalid projection');
  });

  it('should throw error for invalid gameProgress', async () => {
    const ctx = await buildSamplingContext(['4866'], ['QB']);
    expect(() =>
      samplePlayerScoreFromContext(ctx, '4866', 'QB', 20, 1.5)
    ).toThrow('Invalid game progress');
  });

  // Add 8 more tests:
  // - Zero projection returns zero
  // - Unknown player falls back to position variance
  // - Position variance exists for all positions
  // - gameProgress=1 returns exactly projection
  // - Large projection (100+) scales correctly
  // - Small projection (<1) works correctly
  // - Distribution shape is reasonable (not all same values)
  // - Performance: 10000 samples in <100ms
});

describe('simulatePlayerScore', () => {
  it('should return simulated score for player', async () => {
    const score = await simulatePlayerScore('4866', 'QB', 24.5);
    expect(score).toBeGreaterThan(0);
    expect(score).toBeLessThan(100);
  });

  it('should validate inputs', async () => {
    await expect(simulatePlayerScore('4866', 'QB', -10)).rejects.toThrow();
    await expect(simulatePlayerScore('4866', 'QB', 20, 1.5)).rejects.toThrow();
  });
});

describe('getVarianceModel', () => {
  it('should return percentile distribution', async () => {
    const model = await getVarianceModel('4866', 'QB', 24.5);

    expect(model.p10).toBeLessThan(model.p25);
    expect(model.p25).toBeLessThan(model.median);
    expect(model.median).toBeLessThan(model.p75);
    expect(model.p75).toBeLessThan(model.p90);
    expect(model.mean).toBeGreaterThan(0);
  });

  it('should include sample size metadata', async () => {
    const model = await getVarianceModel('4866', 'QB', 24.5);

    expect(model.positionDist.sampleSize).toBeGreaterThanOrEqual(0);
    expect(model.playerOutcomes.sampleSize).toBeGreaterThanOrEqual(0);
  });
});

// Helper function
const standardDeviation = (values: number[]): number => {
  const mean = values.reduce((a, b) => a + b) / values.length;
  const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
  return Math.sqrt(variance);
};
```

### 4. Create variance-loader.test.ts (12 tests)

Create `src/data/__tests__/variance-loader.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';
import {
  getPositionDistribution,
  getPlayerOutcomes,
  getDataInfo,
} from '../variance-loader';

describe('getPositionDistribution', () => {
  it('should return variance for QB position', async () => {
    const result = await getPositionDistribution('QB');

    expect(result.outcomes.length).toBeGreaterThan(0);
    expect(result.sampleSize).toBeGreaterThanOrEqual(0);
  });

  it('should return variance for all positions', async () => {
    const positions = ['QB', 'RB', 'WR', 'TE', 'K', 'DEF'];

    for (const pos of positions) {
      const result = await getPositionDistribution(pos);
      expect(result.outcomes.length).toBeGreaterThan(0);
    }
  });

  it('should fallback to defaults for unknown position', async () => {
    const result = await getPositionDistribution('UNKNOWN');

    expect(result.outcomes.length).toBeGreaterThan(0);
    expect(result.sampleSize).toBeGreaterThanOrEqual(0);
  });

  it('should return sorted outcomes', async () => {
    const result = await getPositionDistribution('QB');
    const outcomes = result.outcomes;

    for (let i = 1; i < outcomes.length; i++) {
      expect(outcomes[i]).toBeGreaterThanOrEqual(outcomes[i - 1]);
    }
  });

  it('should cache results', async () => {
    const start = Date.now();
    await getPositionDistribution('QB');
    const firstCallTime = Date.now() - start;

    const start2 = Date.now();
    await getPositionDistribution('QB');
    const secondCallTime = Date.now() - start2;

    // Second call should be faster (cached)
    expect(secondCallTime).toBeLessThan(firstCallTime + 5);
  });
});

describe('getPlayerOutcomes', () => {
  it('should return outcomes for known player', async () => {
    const result = await getPlayerOutcomes('4866'); // Patrick Mahomes

    expect(result.outcomes).toBeDefined();
    expect(result.sampleSize).toBeGreaterThanOrEqual(0);
  });

  it('should return empty for unknown player', async () => {
    const result = await getPlayerOutcomes('UNKNOWN_PLAYER_ID');

    expect(result.outcomes.length).toBe(0);
    expect(result.sampleSize).toBe(0);
  });

  it('should normalize outcomes around 1.0', async () => {
    const result = await getPlayerOutcomes('4866');

    if (result.outcomes.length > 0) {
      const sorted = [...result.outcomes].sort((a, b) => a - b);
      const median = sorted[Math.floor(sorted.length / 2)];

      // Median should be close to 1.0 after normalization
      expect(median).toBeGreaterThan(0.8);
      expect(median).toBeLessThan(1.2);
    }
  });

  it('should cache results', async () => {
    const start = Date.now();
    await getPlayerOutcomes('4866');
    const firstCallTime = Date.now() - start;

    const start2 = Date.now();
    await getPlayerOutcomes('4866');
    const secondCallTime = Date.now() - start2;

    expect(secondCallTime).toBeLessThan(firstCallTime + 5);
  });
});

describe('getDataInfo', () => {
  it('should return data export metadata', () => {
    const info = getDataInfo();

    expect(info.exportedAt).toBeDefined();
    expect(info.positionVarianceCount).toBeGreaterThanOrEqual(0);
    expect(info.playerVarianceCount).toBeGreaterThanOrEqual(0);
    expect(info.projectionErrorCount).toBeGreaterThanOrEqual(0);
  });

  it('should have reasonable data counts', () => {
    const info = getDataInfo();

    // Should have at least some variance data
    expect(info.positionVarianceCount).toBeGreaterThan(0);
  });
});
```

### 5. Update package.json Test Scripts

Already configured if SIM-606 (Vitest migration) is done first.

### 6. Run Tests and Verify Coverage

```bash
pnpm test
pnpm test:coverage
```

Target: 80%+ coverage, <30 second execution time.

---

## ✅ Acceptance Criteria

- [ ] 3 test files created with 45+ total tests
- [ ] `matchup.test.ts`: 15 tests covering simulation logic
- [ ] `variance.test.ts`: 18 tests covering variance calculations
- [ ] `variance-loader.test.ts`: 12 tests covering data loading
- [ ] All tests passing: `pnpm test`
- [ ] Coverage ≥80%: `pnpm test:coverage`
- [ ] Test execution <30 seconds
- [ ] Monte Carlo tests use small iterations (10-200) for speed
- [ ] No flaky tests (run 3 times, all pass)

---

## 🔗 Related Tasks

**Depends On:**
- SIM-606: Migrate from Jest to Vitest (testing infrastructure ready)

**Blocks:**
- All other tasks depend on tests for validation

---

## 📊 Context Usage

- **Files to create:** 3 test files (~1000 lines)
- **Time estimate:** 2 hours

---

## 🚀 Cursor Prompt

```
I'm working on SIM-605. Please:

1. Read apps/server/src/lib/__tests__/gauntlet-api-client.test.ts for patterns
2. Create src/models/__tests__/matchup.test.ts with 15 tests
3. Create src/models/__tests__/variance.test.ts with 18 tests
4. Create src/data/__tests__/variance-loader.test.ts with 12 tests
5. Run pnpm test and pnpm test:coverage
6. Verify 80%+ coverage achieved

Use small iteration counts (10-200) for Monte Carlo tests to keep execution fast.
Follow the task steps exactly.
```

---

## ✓ Verification Commands

```bash
# Run all tests
cd apps/sim-engine
pnpm test

# Generate coverage report
pnpm test:coverage

# Verify coverage threshold
# Should show 80%+ overall coverage

# Run tests multiple times to check for flakiness
pnpm test && pnpm test && pnpm test
```

---

## 📝 Commit Message Template

```
test(sim-engine): add comprehensive test suite with 80%+ coverage (SIM-605)

- Create 3 test files with 45 total tests
- matchup.test.ts: 15 tests for simulation logic
- variance.test.ts: 18 tests for variance calculations
- variance-loader.test.ts: 12 tests for data loading
- All tests passing with 80%+ code coverage
- Test execution <30 seconds (optimized iterations)
- Validates Monte Carlo accuracy, variance reduction, edge cases
- Critical foundation for enterprise reliability

Part of sim-engine enterprise readiness initiative
```

