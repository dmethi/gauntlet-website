# WEB-TEST-003: Utility Tests

**Category**: TEST  
**Priority**: 🔴 CRITICAL  
**Estimated Time**: 2 hours  
**Dependencies**: WEB-UTIL-001, WEB-UTIL-002, WEB-UTIL-003, WEB-UTIL-004

---

## Objective

Ensure 100% test coverage on all utility functions across shared/ and features/ directories. Utilities contain pure business logic that must be bulletproof since they're used throughout the application.

---

## Current Utility Test Coverage

### ✅ Excellent Coverage (90-100%)
- `shared/utils/formatting/` - 49 tests ✅
- `shared/utils/colors/` - 44 tests ✅
- `features/draft-analysis/utils/calculations.test.ts` - 28 tests ✅
- `features/hall-of-fame/utils/` - 86 tests (calculations, aggregations, categories) ✅
- `features/matchups/components/MatchupSimulation/utils.test.ts` - 68 tests ✅
- `features/matchups/components/MatchupOddsPreview/utils.test.ts` - 54 tests ✅
- `features/stats/components/TeamView/utils.test.ts` - 35 tests ✅
- `features/stats/components/LeagueView/utils.test.ts` - 32 tests ✅
- `features/transactions/components/TransactionAnalysis/utils.test.ts` - 27 tests ✅
- `features/start-sit/components/StartSitEfficiency/utils.test.ts` - 28 tests ✅

### ⚠️ Partial Coverage (Need Expansion)
- `shared/utils/stats/` - Missing tests ❌
- `features/draft-analysis/utils/analytics.ts` - Missing tests ❌
- `features/reports/utils/narratives.ts` - Missing tests ❌
- `features/matchups/utils/swing-analysis.ts` - Missing tests ❌

### ❌ Zero Coverage (Critical Gap)
- `lib/manager-analytics.ts` - Large file with complex calculations ❌
- `lib/draft-analytics.ts` - Draft analysis calculations ❌
- `lib/hooks.ts` - Data transformation utilities ❌
- `lib/sleeper/unified-client.ts` - API client utilities ❌
- `lib/utils.ts` - cn() helper (has 3 tests) ⚠️

---

## Test Strategy

### Priority 1: Shared Stats Utilities (45 min)

These are used across multiple features and need robust testing:

1. `shared/utils/stats/compose.ts` - Data composition
2. `shared/utils/stats/medians.ts` - Statistical calculations
3. `shared/utils/stats/ranks.ts` - Ranking logic
4. `shared/utils/stats/positional-advantages.ts` - Position analysis
5. `shared/utils/stats/teams.ts` - Team utilities

### Priority 2: Feature Utilities (45 min)

1. `features/draft-analysis/utils/analytics.ts` - Draft analytics calculations
2. `features/matchups/utils/swing-analysis.ts` - Swing point calculations
3. `features/reports/utils/narratives.ts` - Narrative generation helpers

### Priority 3: Legacy Lib Utils (30 min)

Add basic tests to critical lib/ utilities:

1. `lib/manager-analytics.ts` - Core logic (high-priority subset)
2. `lib/draft-analytics.ts` - Draft calculations
3. `lib/utils.ts` - Expand existing tests

---

## Steps

### 1. Test shared/utils/stats/compose.ts (15 min)

**File**: `src/shared/utils/stats/compose.test.ts`

```typescript
import { describe, it, expect } from 'vitest';
import { composeStatsDataset, aggregateWeeklyStats } from './compose';
import { mockRosterData, mockMatchupData } from '@/test/fixtures/stats-data';

describe('Stats Composition Utilities', () => {
  describe('composeStatsDataset', () => {
    it('combines roster and matchup data correctly', () => {
      const result = composeStatsDataset({
        rosters: mockRosterData,
        matchups: mockMatchupData,
      });

      expect(result.teams).toBeDefined();
      expect(result.teams).toHaveLength(mockRosterData.length);
      expect(result.teams[0].weeklyScores).toBeDefined();
    });

    it('handles missing matchup data', () => {
      const result = composeStatsDataset({
        rosters: mockRosterData,
        matchups: [],
      });

      expect(result.teams).toHaveLength(mockRosterData.length);
      expect(result.teams[0].weeklyScores).toEqual([]);
    });

    it('calculates team totals correctly', () => {
      const result = composeStatsDataset({
        rosters: mockRosterData,
        matchups: mockMatchupData,
      });

      const team = result.teams[0];
      expect(team.totalPoints).toBeGreaterThan(0);
      expect(team.avgPoints).toBeGreaterThan(0);
    });

    it('handles empty rosters array', () => {
      const result = composeStatsDataset({
        rosters: [],
        matchups: mockMatchupData,
      });

      expect(result.teams).toEqual([]);
    });
  });

  describe('aggregateWeeklyStats', () => {
    it('aggregates stats by week', () => {
      const result = aggregateWeeklyStats(mockMatchupData);

      expect(result).toBeInstanceOf(Map);
      expect(result.size).toBeGreaterThan(0);
    });

    it('calculates week totals correctly', () => {
      const result = aggregateWeeklyStats(mockMatchupData);
      const week1 = result.get(1);

      expect(week1).toBeDefined();
      expect(week1.totalPoints).toBeGreaterThan(0);
      expect(week1.avgPoints).toBeGreaterThan(0);
    });

    it('handles single week', () => {
      const singleWeek = mockMatchupData.filter(m => m.week === 1);
      const result = aggregateWeeklyStats(singleWeek);

      expect(result.size).toBe(1);
    });
  });
});
```

---

### 2. Test shared/utils/stats/medians.ts (10 min)

**File**: `src/shared/utils/stats/medians.test.ts`

```typescript
describe('Statistical Functions', () => {
  describe('calculateMedian', () => {
    it('calculates median for odd-length array', () => {
      expect(calculateMedian([1, 2, 3, 4, 5])).toBe(3);
    });

    it('calculates median for even-length array', () => {
      expect(calculateMedian([1, 2, 3, 4])).toBe(2.5);
    });

    it('handles single value', () => {
      expect(calculateMedian([42])).toBe(42);
    });

    it('handles unsorted array', () => {
      expect(calculateMedian([5, 1, 3, 2, 4])).toBe(3);
    });

    it('returns 0 for empty array', () => {
      expect(calculateMedian([])).toBe(0);
    });

    it('handles negative numbers', () => {
      expect(calculateMedian([-5, -1, 0, 1, 5])).toBe(0);
    });
  });

  describe('calculatePercentile', () => {
    it('calculates 50th percentile (median)', () => {
      const values = [1, 2, 3, 4, 5];
      expect(calculatePercentile(values, 50)).toBe(3);
    });

    it('calculates 25th percentile', () => {
      const values = [1, 2, 3, 4, 5, 6, 7, 8];
      expect(calculatePercentile(values, 25)).toBeGreaterThanOrEqual(2);
    });

    it('calculates 75th percentile', () => {
      const values = [1, 2, 3, 4, 5, 6, 7, 8];
      expect(calculatePercentile(values, 75)).toBeGreaterThanOrEqual(6);
    });
  });
});
```

---

### 3. Test shared/utils/stats/ranks.ts (10 min)

**File**: `src/shared/utils/stats/ranks.test.ts`

```typescript
describe('Ranking Utilities', () => {
  describe('calculateRanks', () => {
    it('ranks teams by score descending', () => {
      const teams = [
        { id: 1, score: 100 },
        { id: 2, score: 150 },
        { id: 3, score: 120 },
      ];

      const ranked = calculateRanks(teams, 'score');

      expect(ranked[0].rank).toBe(1); // 150
      expect(ranked[1].rank).toBe(2); // 120
      expect(ranked[2].rank).toBe(3); // 100
    });

    it('handles tied scores', () => {
      const teams = [
        { id: 1, score: 100 },
        { id: 2, score: 100 },
        { id: 3, score: 90 },
      ];

      const ranked = calculateRanks(teams, 'score');

      expect(ranked[0].rank).toBe(1);
      expect(ranked[1].rank).toBe(1); // Tied for 1st
      expect(ranked[2].rank).toBe(3); // 3rd (not 2nd)
    });

    it('handles empty array', () => {
      expect(calculateRanks([], 'score')).toEqual([]);
    });

    it('handles single team', () => {
      const ranked = calculateRanks([{ id: 1, score: 100 }], 'score');
      expect(ranked[0].rank).toBe(1);
    });
  });

  describe('getRankPercentile', () => {
    it('calculates rank percentile correctly', () => {
      // Rank 1 of 12 = top 8.3% = ~92nd percentile
      expect(getRankPercentile(1, 12)).toBeGreaterThan(90);
    });

    it('handles last place', () => {
      expect(getRankPercentile(12, 12)).toBeLessThan(10);
    });

    it('handles middle ranks', () => {
      const percentile = getRankPercentile(6, 12);
      expect(percentile).toBeGreaterThan(40);
      expect(percentile).toBeLessThan(60);
    });
  });
});
```

---

### 4. Test shared/utils/stats/positional-advantages.ts (10 min)

**File**: `src/shared/utils/stats/positional-advantages.test.ts`

```typescript
describe('Positional Advantages', () => {
  describe('calculatePositionalAdvantage', () => {
    it('calculates advantage vs league average', () => {
      const teamScore = 25;
      const leagueAvg = 20;

      const advantage = calculatePositionalAdvantage(teamScore, leagueAvg);

      expect(advantage).toBe(5); // +5 advantage
    });

    it('calculates disadvantage', () => {
      const advantage = calculatePositionalAdvantage(15, 20);
      expect(advantage).toBe(-5);
    });

    it('handles zero scores', () => {
      expect(calculatePositionalAdvantage(0, 20)).toBe(-20);
      expect(calculatePositionalAdvantage(20, 0)).toBe(20);
    });
  });

  describe('getPositionalRanks', () => {
    it('ranks teams by position', () => {
      const teams = [
        { id: 1, qbScore: 25 },
        { id: 2, qbScore: 30 },
        { id: 3, qbScore: 20 },
      ];

      const ranks = getPositionalRanks(teams, 'QB');

      expect(ranks.get(2)).toBe(1); // Best QB
      expect(ranks.get(1)).toBe(2);
      expect(ranks.get(3)).toBe(3);
    });
  });
});
```

---

### 5. Test features/draft-analysis/utils/analytics.ts (20 min)

**File**: `src/features/draft-analysis/utils/analytics.test.ts`

```typescript
describe('Draft Analytics Utilities', () => {
  describe('calculateDraftEfficiency', () => {
    it('calculates efficiency based on ADP vs performance', () => {
      const picks = [
        { playerId: '1', adp: 10, actualRank: 5 }, // +5 spots
        { playerId: '2', adp: 20, actualRank: 30 }, // -10 spots
      ];

      const efficiency = calculateDraftEfficiency(picks);

      expect(efficiency).toBeDefined();
      expect(efficiency.hits).toBeGreaterThan(0);
      expect(efficiency.misses).toBeGreaterThan(0);
    });

    it('identifies draft steals', () => {
      const picks = [{ playerId: '1', adp: 100, actualRank: 10 }];
      const efficiency = calculateDraftEfficiency(picks);

      expect(efficiency.steals).toContain('1');
    });

    it('identifies draft busts', () => {
      const picks = [{ playerId: '2', adp: 10, actualRank: 100 }];
      const efficiency = calculateDraftEfficiency(picks);

      expect(efficiency.busts).toContain('2');
    });
  });

  describe('analyzePositionalStrategy', () => {
    it('identifies RB-heavy strategy', () => {
      const draft = {
        picks: [
          { position: 'RB', round: 1 },
          { position: 'RB', round: 2 },
          { position: 'WR', round: 3 },
        ],
      };

      const strategy = analyzePositionalStrategy(draft);

      expect(strategy.primaryStrategy).toBe('RB-heavy');
    });

    it('identifies Zero-RB strategy', () => {
      const draft = {
        picks: [
          { position: 'WR', round: 1 },
          { position: 'WR', round: 2 },
          { position: 'RB', round: 5 },
        ],
      };

      const strategy = analyzePositionalStrategy(draft);

      expect(strategy.primaryStrategy).toBe('Zero-RB');
    });
  });
});
```

---

### 6. Test features/matchups/utils/swing-analysis.ts (15 min)

**File**: `src/features/matchups/utils/swing-analysis.test.ts`

```typescript
describe('Swing Analysis', () => {
  describe('calculateSwingPoints', () => {
    it('identifies moments where lead changed', () => {
      const timeSeries = [
        { time: '13:00', team1: 50, team2: 40 },
        { time: '14:00', team1: 50, team2: 60 }, // Swing!
        { time: '15:00', team1: 70, team2: 60 }, // Swing back!
      ];

      const swings = calculateSwingPoints(timeSeries);

      expect(swings).toHaveLength(2);
      expect(swings[0].time).toBe('14:00');
      expect(swings[1].time).toBe('15:00');
    });

    it('calculates swing magnitude', () => {
      const timeSeries = [
        { time: '13:00', team1: 50, team2: 40 },
        { time: '14:00', team1: 50, team2: 70 }, // +20 swing
      ];

      const swings = calculateSwingPoints(timeSeries);

      expect(swings[0].magnitude).toBe(30); // From +10 to -20
    });

    it('handles no swings', () => {
      const timeSeries = [
        { time: '13:00', team1: 50, team2: 40 },
        { time: '14:00', team1: 60, team2: 45 },
      ];

      const swings = calculateSwingPoints(timeSeries);

      expect(swings).toHaveLength(0);
    });
  });

  describe('identifyKeyMoments', () => {
    it('finds moments with high impact', () => {
      // Test identifying touchdowns, key plays, etc.
    });
  });
});
```

---

### 7. Add Tests for Legacy Lib Utils (30 min)

**Focus**: Test the most critical functions that are still in use

**File**: `src/lib/manager-analytics.test.ts` (create)

```typescript
describe('Manager Analytics (Legacy - Critical Subset)', () => {
  // Test only the most-used exported functions
  describe('analyzeManagerEfficiency', () => {
    it('calculates manager efficiency metrics', () => {
      // Test core manager analysis
    });
  });

  describe('calculateCrosslLeagueMetrics', () => {
    it('compares managers across leagues', () => {
      // Test cross-league comparison
    });
  });
});
```

**File**: `src/lib/draft-analytics.test.ts` (create)

```typescript
describe('Draft Analytics (Legacy - Critical Subset)', () => {
  describe('generateDraftAnalytics', () => {
    it('generates comprehensive draft analysis', () => {
      // Test main analytics generation
    });
  });
});
```

---

## Acceptance Criteria

### Coverage Metrics
- [ ] All shared/utils/ files have tests
- [ ] All features/*/utils/ files have tests
- [ ] Coverage ≥95% on all utility files
- [ ] Critical lib/ utilities have basic tests

### Test Quality
- [ ] Each utility function has 3-5 test cases
- [ ] Edge cases covered (empty, null, undefined)
- [ ] Boundary conditions tested
- [ ] Error cases tested
- [ ] Complex calculations verified with known outputs

### Specific Tests
- [ ] All statistical functions tested with known inputs/outputs
- [ ] All data transformation utilities tested
- [ ] All calculation utilities verified
- [ ] All formatting utilities covered
- [ ] All color utilities tested

### Build Status
- [ ] All tests pass: `pnpm test`
- [ ] Coverage report shows 95%+ on utils
- [ ] TypeScript compilation passes
- [ ] No warnings in test output

---

## Utility Testing Patterns

### Pattern 1: Pure Calculation Function

```typescript
describe('calculateSomething', () => {
  it('calculates correctly with valid inputs', () => {
    expect(calculateSomething(10, 20)).toBe(30);
  });

  it('handles zero values', () => {
    expect(calculateSomething(0, 20)).toBe(20);
  });

  it('handles negative values', () => {
    expect(calculateSomething(-10, 20)).toBe(10);
  });

  it('returns 0 for invalid inputs', () => {
    expect(calculateSomething(NaN, 20)).toBe(0);
  });
});
```

### Pattern 2: Data Transformation

```typescript
describe('transformData', () => {
  it('transforms data correctly', () => {
    const input = { /* ... */ };
    const output = transformData(input);
    
    expect(output).toEqual(expectedOutput);
  });

  it('handles empty input', () => {
    expect(transformData([])).toEqual([]);
  });

  it('filters invalid entries', () => {
    const input = [valid, invalid, valid];
    const output = transformData(input);
    
    expect(output).toHaveLength(2);
  });
});
```

### Pattern 3: Complex Algorithm

```typescript
describe('complexAlgorithm', () => {
  it('produces known output for known input', () => {
    // Use real-world test case with verified result
    const result = complexAlgorithm(knownInput);
    expect(result).toBeCloseTo(knownOutput, 2);
  });

  it('handles edge case A', () => {
    // Test specific edge case
  });

  it('handles edge case B', () => {
    // Test another edge case
  });

  it('maintains invariants', () => {
    // Test that algorithm maintains expected properties
    const result = complexAlgorithm(input);
    expect(result.sum).toBe(input.reduce((a, b) => a + b, 0));
  });
});
```

---

## Verification Commands

```bash
cd /Users/dhruv.methi/Documents/GitHub/gauntlet-website/apps/web

# Run all utility tests
pnpm test utils/

# Run specific utility test
pnpm test compose.test.ts

# Check coverage for utils only
pnpm test:coverage --collectCoverageFrom="**/utils/**/*.ts"

# Run shared utils tests
pnpm test shared/utils

# Run feature utils tests
pnpm test features/*/utils
```

---

## Cursor Prompt (Copy-Paste Ready)

```
I'm working on WEB-TEST-003: Utility Tests.

Please:
1. Read the task file at tasks/WEB-TEST-003.md
2. Start with shared/utils/stats/compose.ts (Step 1)
3. Create comprehensive tests for all utility functions
4. Test edge cases: empty arrays, null values, boundary conditions
5. Use known inputs/outputs to verify calculations
6. Ensure all utilities have 95%+ coverage

These are pure functions so tests should be straightforward.
Target: 95%+ coverage on all utility files.
```

---

## Related Tasks

**Blocks**: WEB-CLEAN-002  
**Blocked By**: WEB-UTIL-001, WEB-UTIL-002, WEB-UTIL-003, WEB-UTIL-004  
**Related**: WEB-TEST-001 (Component Tests), WEB-TEST-002 (Hook Tests)

---

## Notes

### Why 100% Utility Coverage Matters

**Utilities are:**
- ✅ Pure functions (easiest to test)
- ✅ Used everywhere (high impact)
- ✅ Business logic (must be correct)
- ✅ Reused (one bug affects many places)
- ✅ No dependencies (no mocking needed)

**Benefits:**
- Find calculation bugs early
- Document expected behavior
- Enable confident refactoring
- Catch regressions immediately

### Test Data Strategy

For statistical/calculation tests:
- Use small, hand-calculable examples
- Include known edge cases
- Test with realistic data ranges
- Verify with external calculations (Excel, calculator)

### Coverage Philosophy

**Aim for 95-100% because:**
- Utilities are easy to test (pure functions)
- High test value (catch bugs early)
- Low maintenance cost
- Enables confident refactoring

---

**Estimated Context Usage**: ~150 lines read per file, ~100-150 lines written per test file, 2 hours total

**Success Metric**: 95%+ test coverage on all utility files, all tests passing
