# WEB-COMP-002: Split TrendsView Component

**Category**: COMP (Component Splitting)  
**Priority**: 🔴 CRITICAL  
**Estimated Time**: 2.5 hours  
**Dependencies**: WEB-HOOK-003, WEB-EXTRACT-004

---

## Objective

Break down `TrendsView.tsx` (1,586 lines) into maintainable sub-components with
proper separation of concerns, following the factory pattern and arrow function
standards.

---

## Current State

**File**: `apps/web/src/app/stats/components/TrendsView.tsx`  
**Lines**: 1,586 lines  
**Issues**:

- Monolithic component with 7 distinct visualization sections
- Complex data calculations inline (300+ lines)
- Repeated chart configuration patterns
- No memoization (performance issues with Recharts)
- Difficult to test individual visualizations

**Component Structure** (identified sections):

1. **Power Rankings Evolution** (lines 67-396) - Week-over-week power ranking
   heatmap
2. **Weekly Performance Trends** (lines 397-611) - Team scoring trends line
   chart
3. **Position Performance Trends** (lines 612-854) - Position-specific trends
4. **Team Consistency Analysis** (lines 855-1051) - Consistency scores and
   distribution
5. **Position Consistency Analysis** (lines 1052-1266) - Position-specific
   consistency
6. **Team Scoring Distribution** (lines 1267-1422) - Ridge plots for score
   distribution
7. **Position Scoring Distribution** (lines 1423-1586) - Position-specific
   distributions

---

## Context Needed

**Read these files**:

1. `apps/web/src/app/stats/components/TrendsView.tsx` (lines 1-65, 67-100,
   397-420)
2. `apps/web/src/features/stats/types.ts` (all lines)
3. `apps/web/src/shared/utils/colors/index.ts` (all lines)

**Total Context**: ~350 lines

---

## Target Structure

```
apps/web/src/features/stats/components/
├── TrendsView/
│   ├── TrendsView.tsx                      # Main component (~120 lines)
│   ├── TrendsView.test.tsx
│   ├── PowerRankingsEvolution.tsx          # Power rankings table (~200 lines)
│   ├── PowerRankingsEvolution.test.tsx
│   ├── WeeklyPerformanceTrends.tsx         # Team trends chart (~150 lines)
│   ├── WeeklyPerformanceTrends.test.tsx
│   ├── PositionPerformanceTrends.tsx       # Position trends (~180 lines)
│   ├── PositionPerformanceTrends.test.tsx
│   ├── TeamConsistencyAnalysis.tsx         # Consistency metrics (~150 lines)
│   ├── TeamConsistencyAnalysis.test.tsx
│   ├── PositionConsistencyAnalysis.tsx     # Position consistency (~160 lines)
│   ├── PositionConsistencyAnalysis.test.tsx
│   ├── ScoringDistributionAnalysis.tsx     # Distribution charts (~150 lines)
│   ├── ScoringDistributionAnalysis.test.tsx
│   ├── PositionScoringDistribution.tsx     # Position distributions (~160 lines)
│   ├── PositionScoringDistribution.test.tsx
│   ├── utils.ts                             # Data transformation utilities
│   ├── utils.test.ts
│   └── index.ts                             # Barrel export
```

---

## Steps

### Step 1: Create Directory Structure (5 min)

```bash
cd /Users/dhruv.methi/Documents/GitHub/gauntlet-website/apps/web/src

# Create component directory
mkdir -p features/stats/components/TrendsView

# Create barrel export
touch features/stats/components/TrendsView/index.ts
```

---

### Step 2: Extract Utility Functions (25 min)

Create `features/stats/components/TrendsView/utils.ts`:

```typescript
/**
 * Utility functions for TrendsView component
 * Data transformation and calculation utilities
 */

import { mean } from '@/shared/utils/stats';
import type { TeamScore, TeamInfo } from '@/features/stats/types';

/**
 * Calculate power ranking score for a team
 * Formula: 50% avg points + 30% expected wins + 20% rolling average
 * @param avgPoints - Average points per game
 * @param expectedWins - Expected win percentage based on schedule
 * @param rollingAvg - Rolling 3-week average
 * @returns Power ranking score (0-100)
 */
export const calculatePowerRanking = (
  avgPoints: number,
  expectedWins: number,
  rollingAvg: number
): number => {
  return avgPoints * 0.5 + expectedWins * 0.3 + rollingAvg * 0.2;
};

/**
 * Calculate consistency score (inverse of coefficient of variation)
 * @param scores - Array of weekly scores
 * @returns Consistency score (0-100, higher = more consistent)
 */
export const calculateConsistencyScore = (scores: number[]): number => {
  if (scores.length === 0) return 0;

  const avg = mean(scores);
  if (avg === 0) return 0;

  const variance = mean(scores.map(s => Math.pow(s - avg, 2)));
  const stdDev = Math.sqrt(variance);
  const coefficientOfVariation = stdDev / avg;

  // Convert to 0-100 scale (lower CV = higher consistency)
  return Math.max(0, Math.min(100, 100 * (1 - coefficientOfVariation)));
};

/**
 * Calculate rolling average for last N weeks
 * @param scores - Array of weekly scores
 * @param windowSize - Number of weeks to include (default: 3)
 * @returns Array of rolling averages
 */
export const calculateRollingAverage = (
  scores: TeamScore[],
  windowSize: number = 3
): number[] => {
  const rollingAvg: number[] = [];

  for (let i = 0; i < scores.length; i++) {
    const window = scores.slice(Math.max(0, i - windowSize + 1), i + 1);
    const validScores = window.filter(s => s.value > 0);

    if (validScores.length > 0) {
      rollingAvg.push(mean(validScores.map(s => s.value)));
    } else {
      rollingAvg.push(0);
    }
  }

  return rollingAvg;
};

/**
 * Format trend indicator (↑↑, ↑, →, ↓, ↓↓)
 * @param trendValue - Numeric trend value (-2 to +2)
 * @returns Trend emoji string
 */
export const formatTrendIndicator = (trendValue: number): string => {
  if (trendValue >= 1.5) return '↑↑';
  if (trendValue >= 0.5) return '↑';
  if (trendValue <= -1.5) return '↓↓';
  if (trendValue <= -0.5) return '↓';
  return '→';
};

/**
 * Group teams into tiers based on power ranking
 * @param teams - Array of teams with rankings
 * @returns Map of tier name to team arrays
 */
export const groupIntoTiers = <T extends { rank: number }>(
  teams: T[]
): Map<string, T[]> => {
  const tiers = new Map<string, T[]>();

  teams.forEach(team => {
    let tierName: string;
    if (team.rank <= 6) {
      tierName = 'Elite (Top 6)';
    } else if (team.rank <= 12) {
      tierName = 'Contenders (7-12)';
    } else if (team.rank <= 18) {
      tierName = 'Middle Pack (13-18)';
    } else {
      tierName = 'Struggling (19-24)';
    }

    if (!tiers.has(tierName)) {
      tiers.set(tierName, []);
    }
    tiers.get(tierName)!.push(team);
  });

  return tiers;
};
```

Create test file:

```typescript
import { describe, it, expect } from 'vitest';
import {
  calculatePowerRanking,
  calculateConsistencyScore,
  calculateRollingAverage,
  formatTrendIndicator,
  groupIntoTiers,
} from './utils';

describe('TrendsView Utils', () => {
  describe('calculatePowerRanking', () => {
    it('calculates weighted power ranking', () => {
      const result = calculatePowerRanking(100, 80, 90);
      expect(result).toBeCloseTo(50 + 24 + 18); // 92
    });
  });

  describe('calculateConsistencyScore', () => {
    it('returns 0 for empty array', () => {
      expect(calculateConsistencyScore([])).toBe(0);
    });

    it('calculates high score for consistent data', () => {
      const consistent = [100, 101, 100, 99, 100];
      expect(calculateConsistencyScore(consistent)).toBeGreaterThan(95);
    });

    it('calculates low score for inconsistent data', () => {
      const inconsistent = [50, 150, 75, 125, 100];
      expect(calculateConsistencyScore(inconsistent)).toBeLessThan(80);
    });
  });

  describe('formatTrendIndicator', () => {
    it('returns correct arrows for trends', () => {
      expect(formatTrendIndicator(2)).toBe('↑↑');
      expect(formatTrendIndicator(1)).toBe('↑');
      expect(formatTrendIndicator(0)).toBe('→');
      expect(formatTrendIndicator(-1)).toBe('↓');
      expect(formatTrendIndicator(-2)).toBe('↓↓');
    });
  });

  describe('groupIntoTiers', () => {
    it('groups teams into tiers', () => {
      const teams = [
        { rank: 1, name: 'Team A' },
        { rank: 7, name: 'Team B' },
        { rank: 15, name: 'Team C' },
        { rank: 24, name: 'Team D' },
      ];

      const tiers = groupIntoTiers(teams);
      expect(tiers.size).toBe(4);
      expect(tiers.get('Elite (Top 6)')).toHaveLength(1);
    });
  });
});
```

---

### Step 3: Create PowerRankingsEvolution Component (30 min)

Create `features/stats/components/TrendsView/PowerRankingsEvolution.tsx`:

```typescript
'use client';

import React, { memo, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { colors } from '../../../../../../../brand/colors';
import { getRankColor, getTextColor } from '@/shared/utils/colors';
import { rank } from '@/shared/utils/stats';
import { calculatePowerRanking, calculateRollingAverage, formatTrendIndicator } from './utils';
import type { TeamData, PlainStatsDataset } from '@/features/stats/types';

interface PowerRankingsEvolutionProps {
  allTeamEntries: [string, TeamData][];
  dataset: PlainStatsDataset;
}

interface PowerRankingTeam {
  key: string;
  teamInfo: TeamData['teamInfo'];
  weeklyScores: number[];
  weeklyRanks: number[];
  trend: string;
}

export const PowerRankingsEvolution = memo<PowerRankingsEvolutionProps>(
  ({ allTeamEntries, dataset }) => {
    const weeklyPowerRankings = useMemo(() => {
      const rankings = new Map<string, PowerRankingTeam>();

      // Calculate power rankings for each week
      allTeamEntries.forEach(([key, teamData]) => {
        const weeklyScores: number[] = [];
        const rollingAvg = calculateRollingAverage(teamData.teamScores, 3);

        for (let week = 1; week < dataset.currentWeek; week++) {
          const weekScore = teamData.teamScores.find(s => s.week === week)?.value || 0;
          const powerScore = calculatePowerRanking(
            weekScore,
            75, // Placeholder for expected wins calculation
            rollingAvg[week - 1] || 0
          );
          weeklyScores.push(powerScore);
        }

        // Calculate trend
        const recentWeeks = weeklyScores.slice(-3);
        const trend =
          recentWeeks.length >= 2
            ? recentWeeks[recentWeeks.length - 1] - recentWeeks[0]
            : 0;

        rankings.set(key, {
          key,
          teamInfo: teamData.teamInfo,
          weeklyScores,
          weeklyRanks: [],
          trend: formatTrendIndicator(trend),
        });
      });

      // Calculate ranks for each week
      for (let week = 1; week < dataset.currentWeek; week++) {
        const weekScores = Array.from(rankings.values()).map(t => t.weeklyScores[week - 1] || 0);
        const weekRanks = rank(weekScores);

        let idx = 0;
        rankings.forEach(team => {
          team.weeklyRanks.push(weekRanks[idx++]);
        });
      }

      return Array.from(rankings.values()).sort(
        (a, b) => a.weeklyRanks[a.weeklyRanks.length - 1] - b.weeklyRanks[b.weeklyRanks.length - 1]
      );
    }, [allTeamEntries, dataset.currentWeek]);

    return (
      <Card>
        <CardHeader>
          <CardTitle>Power Rankings Evolution</CardTitle>
          <CardDescription>
            Advanced power rankings using 50% avg points, 30% expected wins, 20% rolling average.
            Higher scores = stronger teams.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-auto rounded-md border">
            <table className="w-full text-xs">
              <thead className="bg-muted/50">
                <tr>
                  <th className="sticky left-0 z-10 bg-muted px-3 py-3 text-left font-semibold min-w-[140px]">
                    Team
                  </th>
                  {Array.from({ length: dataset.currentWeek - 1 }, (_, i) => i + 1).map(week => (
                    <th
                      key={week}
                      className="px-3 py-3 text-center font-semibold min-w-[50px]"
                      style={{ backgroundColor: colors.core.charcoalSteel, color: 'white' }}
                    >
                      W{week}
                    </th>
                  ))}
                  <th
                    className="px-3 py-3 text-center font-semibold min-w-[80px]"
                    style={{ backgroundColor: colors.core.crimsonRed, color: 'white' }}
                  >
                    Weekly Trend
                  </th>
                </tr>
              </thead>
              <tbody>
                {weeklyPowerRankings.map(team => (
                  <tr key={team.key} className="border-b hover:bg-muted/50">
                    <td className="sticky left-0 bg-background px-3 py-2 font-medium">
                      {team.teamInfo.displayName}
                    </td>
                    {team.weeklyRanks.map((weekRank, weekIdx) => (
                      <td
                        key={weekIdx}
                        className="px-3 py-2 text-center font-mono"
                        style={{
                          backgroundColor: getRankColor(weekRank, 24),
                          color: getTextColor(getRankColor(weekRank, 24)),
                        }}
                      >
                        {weekRank}
                      </td>
                    ))}
                    <td className="px-3 py-2 text-center text-lg">{team.trend}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    );
  }
);

PowerRankingsEvolution.displayName = 'PowerRankingsEvolution';
```

---

### Step 4: Create Remaining Sub-Components (70 min)

Due to space constraints, I'll provide the structure. Each component should
follow the pattern above:

1. **WeeklyPerformanceTrends.tsx** (~150 lines)
   - Extract lines 397-611 from original
   - LineChart with Recharts showing team scoring trends
   - Props: `allTeamEntries, dataset`

2. **PositionPerformanceTrends.tsx** (~180 lines)
   - Extract lines 612-854 from original
   - Position-specific trend charts
   - Props: `positionsMap, dataset`

3. **TeamConsistencyAnalysis.tsx** (~150 lines)
   - Extract lines 855-1051 from original
   - Consistency scores and distribution
   - Props: `allTeamEntries`

4. **PositionConsistencyAnalysis.tsx** (~160 lines)
   - Extract lines 1052-1266 from original
   - Position-specific consistency metrics
   - Props: `positionsMap`

5. **ScoringDistributionAnalysis.tsx** (~150 lines)
   - Extract lines 1267-1422 from original
   - Ridge plots for score distribution
   - Use `RidgePlot` component
   - Props: `allTeamEntries, dataset`

6. **PositionScoringDistribution.tsx** (~160 lines)
   - Extract lines 1423-1586 from original
   - Position-specific distributions
   - Props: `positionsMap, dataset`

---

### Step 5: Create Main TrendsView Component (20 min)

Create `features/stats/components/TrendsView/TrendsView.tsx`:

```typescript
'use client';

import { useMemo } from 'react';
import { PowerRankingsEvolution } from './PowerRankingsEvolution';
import { WeeklyPerformanceTrends } from './WeeklyPerformanceTrends';
import { PositionPerformanceTrends } from './PositionPerformanceTrends';
import { TeamConsistencyAnalysis } from './TeamConsistencyAnalysis';
import { PositionConsistencyAnalysis } from './PositionConsistencyAnalysis';
import { ScoringDistributionAnalysis } from './ScoringDistributionAnalysis';
import { PositionScoringDistribution } from './PositionScoringDistribution';
import type { TrendsViewProps } from '@/features/stats/types';

export const TrendsView: React.FC<TrendsViewProps> = ({
  allTeamEntries,
  positionsMap,
  dataset,
}) => {
  // Pre-sort teams by total score for consistent ordering
  const sortedTeamEntries = useMemo(() => {
    return allTeamEntries.sort((a, b) => {
      const aTotal = a[1].teamScores.reduce((sum, s) => sum + s.value, 0);
      const bTotal = b[1].teamScores.reduce((sum, s) => sum + s.value, 0);
      return bTotal - aTotal;
    });
  }, [allTeamEntries]);

  return (
    <div className="space-y-8">
      {/* Power Rankings Evolution */}
      <PowerRankingsEvolution allTeamEntries={sortedTeamEntries} dataset={dataset} />

      {/* Weekly Performance Trends */}
      <WeeklyPerformanceTrends allTeamEntries={sortedTeamEntries} dataset={dataset} />

      {/* Position Performance Trends */}
      <PositionPerformanceTrends positionsMap={positionsMap} dataset={dataset} />

      {/* Team Consistency Analysis */}
      <TeamConsistencyAnalysis allTeamEntries={sortedTeamEntries} />

      {/* Position Consistency Analysis */}
      <PositionConsistencyAnalysis positionsMap={positionsMap} />

      {/* Scoring Distribution Analysis */}
      <ScoringDistributionAnalysis allTeamEntries={sortedTeamEntries} dataset={dataset} />

      {/* Position Scoring Distribution */}
      <PositionScoringDistribution positionsMap={positionsMap} dataset={dataset} />
    </div>
  );
};
```

---

### Step 6: Create Barrel Export (5 min)

Create `features/stats/components/TrendsView/index.ts`:

```typescript
export { TrendsView } from './TrendsView';
export { PowerRankingsEvolution } from './PowerRankingsEvolution';
export { WeeklyPerformanceTrends } from './WeeklyPerformanceTrends';
export { PositionPerformanceTrends } from './PositionPerformanceTrends';
export { TeamConsistencyAnalysis } from './TeamConsistencyAnalysis';
export { PositionConsistencyAnalysis } from './PositionConsistencyAnalysis';
export { ScoringDistributionAnalysis } from './ScoringDistributionAnalysis';
export { PositionScoringDistribution } from './PositionScoringDistribution';
export * from './utils';
```

Update `features/stats/components/index.ts`:

```typescript
export * from './TrendsView';
// ... other exports
```

---

### Step 7: Update Usage in Stats Page (10 min)

Update `apps/web/src/app/stats/page.tsx`:

```typescript
// Change from:
import { TrendsView } from './components/TrendsView';

// To:
import { TrendsView } from '@/features/stats/components';
```

---

### Step 8: Add Tests (30 min)

Create tests for each component following the pattern from WEB-COMP-001.

---

### Step 9: Remove Deprecated File (5 min)

```bash
cd /Users/dhruv.methi/Documents/GitHub/gauntlet-website/apps/web/src
rm app/stats/components/TrendsView.tsx
```

---

## Acceptance Criteria

- [ ] Main `TrendsView` component <150 lines
- [ ] 7 sub-components created (all <200 lines each)
- [ ] All components use `memo()` for Recharts performance
- [ ] All components follow arrow function pattern
- [ ] Utility functions extracted and tested (100% coverage)
- [ ] All sub-components have tests
- [ ] TypeScript compilation passes
- [ ] ESLint passes with no warnings
- [ ] Stats page imports updated
- [ ] Old file removed
- [ ] Visual regression: Charts render identically

---

## Verification Commands

```bash
cd /Users/dhruv.methi/Documents/GitHub/gauntlet-website/apps/web

# Run tests
pnpm test features/stats/components/TrendsView

# Type check
pnpm tsc --noEmit

# Lint
pnpm lint

# Build
pnpm build

# Test in browser
pnpm dev
# Navigate to /stats and verify all charts render
```

---

## Cursor Prompts

### Copy-Paste Prompt for Step 2-3

```
I'm working on WEB-COMP-002: Split TrendsView Component.

Please:
1. Read apps/web/src/app/stats/components/TrendsView.tsx (lines 1-65, 67-200)
2. Create apps/web/src/features/stats/components/TrendsView/utils.ts
3. Extract utility functions: calculatePowerRanking, calculateConsistencyScore, calculateRollingAverage
4. Create utils.test.ts with comprehensive tests
5. Follow the patterns in the task file
```

### Copy-Paste Prompt for Step 4-5

```
I'm working on WEB-COMP-002: Creating main TrendsView component.

Please:
1. Read apps/web/src/app/stats/components/TrendsView.tsx (lines 1-65)
2. Create apps/web/src/features/stats/components/TrendsView/TrendsView.tsx
3. Import all 7 sub-components
4. Create clean main component that composes sub-components
5. Use memo() for Recharts performance optimization
6. Follow arrow function pattern
```

---

## Related Tasks

**Blocks**: WEB-PAGE-002 (Stats Pages migration)  
**Blocked By**: WEB-HOOK-003, WEB-EXTRACT-004  
**Related**: WEB-COMP-001 (Similar component splitting pattern)

---

## Notes

- **Recharts Performance**: Using `memo()` is critical for chart components to
  prevent unnecessary re-renders
- **Testing Charts**: Use snapshot tests for Recharts components
- **Visual Testing**: Compare screenshots of all 7 charts before/after
- **Data Flow**: All data calculations should be in utility functions for
  testability

---

**Estimated Total Time**: 2.5 hours  
**Actual Time**: **\_ (fill in after completion)  
**Completed By**: \_** (fill in after completion)  
**Completion Date**: \_\_\_ (fill in after completion)
