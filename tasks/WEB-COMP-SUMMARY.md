# Component Splitting Tasks - Comprehensive Summary

**Generated**: October 7, 2025  
**Total Tasks**: 10 detailed task files  
**Total Component Lines**: 11,312 lines to be refactored  
**Estimated Total Time**: 19.5 hours  
**Status**: All task files created ✅

---

## 📊 Overview

This document provides a comprehensive summary of all component splitting tasks for the `apps/web` codebase. These tasks are part of Phase 5 of the enterprise readiness refactoring, focusing on breaking down mega-components (>600 lines) into maintainable, testable sub-components.

---

## 🎯 Component Splitting Strategy

### Priority Levels

**🔴 CRITICAL** (>1,000 lines):
- Immediate performance and maintainability impact
- Blocks other refactoring efforts
- 6 components

**🟡 MEDIUM** (600-1,000 lines):
- Important for code quality
- Improves testability
- 4 components

---

## 📋 Complete Task List

### Critical Priority (6 tasks, 13 hours)

| Task ID       | Component                | Current Lines | Target Main | Sub-Components | Time Est. | Status |
|---------------|--------------------------|---------------|-------------|----------------|-----------|--------|
| WEB-COMP-001  | ManagerAnalysis          | 1,535         | ~150        | 6+             | 2.5h      | ✅      |
| WEB-COMP-002  | TrendsView               | 1,586         | ~150        | 7+             | 2.5h      | ✅      |
| WEB-COMP-003  | PlayoffBracket           | 1,349         | ~120        | 6+             | 2.0h      | ✅      |
| WEB-COMP-004  | ScheduleAnalysis         | 1,221         | ~120        | 5+             | 2.0h      | ✅      |
| WEB-COMP-005  | TeamView                 | 1,169         | ~120        | 6+             | 2.0h      | ✅      |
| WEB-COMP-006  | StartSitEfficiency       | 1,093         | ~120        | 6+             | 2.0h      | ✅      |
| **Subtotal**  |                          | **7,953**     |             | **36+**        | **13h**   |        |

### Medium Priority (4 tasks, 6.5 hours)

| Task ID       | Component                | Current Lines | Target Main | Sub-Components | Time Est. | Status |
|---------------|--------------------------|---------------|-------------|----------------|-----------|--------|
| WEB-COMP-007  | TransactionAnalysis      | 852           | ~100        | 5+             | 1.5h      | ✅      |
| WEB-COMP-008  | LeagueView               | 765           | ~100        | 4+             | 1.5h      | ✅      |
| WEB-COMP-009  | MatchupSimulation        | 631           | ~100        | 4+             | 1.5h      | ✅      |
| WEB-COMP-010  | ScatterAnalysis          | 625           | ~100        | 4+             | 1.5h      | ✅      |
| **Subtotal**  |                          | **2,873**     |             | **17+**        | **6h**    |        |
| **TOTAL**     |                          | **10,826**    |             | **53+**        | **19h**   |        |

---

## 🎯 Component Breakdown Details

### WEB-COMP-001: Manager Analysis (1,535 lines → ~150 lines)

**Current Location**: `apps/web/src/components/manager-analysis.tsx`  
**Target Location**: `apps/web/src/features/draft-analysis/components/ManagerAnalysis/`

**Sub-Components to Create** (6):
1. `ConcentrationMetricsTable.tsx` (~200 lines) - Gini coefficient and spending metrics
2. `PlayerOverlapAnalysis.tsx` (~150 lines) - Cross-league player selection patterns
3. `PlayerOverlapByCount.tsx` (~120 lines) - Manager similarity analysis
4. `CrossLeaguePriceDiff.tsx` (~200 lines) - Draft price comparisons
5. `PositionalAllocationHeatmap.tsx` (~180 lines) - Position spending heatmap
6. `DetailedPerformanceMetrics.tsx` (~250 lines) - Advanced analytics tables

**Utilities**: `utils.ts` (~200 lines)
- `getHeatmapColor()` - Color scaling
- `getContrastingTextColor()` - WCAG contrast calculation
- `getClusterBadgeVariant()` - Badge styling
- `formatPercentage()` - Percentage formatting

**Key Improvements**:
- ✅ Reduce main component from 1,535 to ~150 lines (90% reduction)
- ✅ Extract 200+ lines of inline utility functions
- ✅ Add memoization for performance
- ✅ Enable component-level testing
- ✅ Improve code reusability

---

### WEB-COMP-002: Trends View (1,586 lines → ~150 lines)

**Current Location**: `apps/web/src/app/stats/components/TrendsView.tsx`  
**Target Location**: `apps/web/src/features/stats/components/TrendsView/`

**Sub-Components to Create** (7):
1. `PowerRankingsEvolution.tsx` (~200 lines) - Power ranking heatmap
2. `WeeklyPerformanceTrends.tsx` (~150 lines) - Team scoring trends
3. `PositionPerformanceTrends.tsx` (~180 lines) - Position-specific trends
4. `TeamConsistencyAnalysis.tsx` (~150 lines) - Consistency metrics
5. `PositionConsistencyAnalysis.tsx` (~160 lines) - Position consistency
6. `ScoringDistributionAnalysis.tsx` (~150 lines) - Ridge plots
7. `PositionScoringDistribution.tsx` (~160 lines) - Position distributions

**Utilities**: `utils.ts` (~150 lines)
- `calculatePowerRanking()` - Power ranking formula
- `calculateConsistencyScore()` - Consistency calculation
- `calculateRollingAverage()` - Rolling averages
- `formatTrendIndicator()` - Trend arrows
- `groupIntoTiers()` - Tier grouping

**Key Improvements**:
- ✅ Largest component reduced by 90%
- ✅ Recharts components memoized for performance
- ✅ Complex calculations extracted to testable utils
- ✅ Each chart independently testable

---

### WEB-COMP-003: Playoff Bracket (1,349 lines → ~120 lines)

**Current Location**: `apps/web/src/components/playoff-bracket.tsx`  
**Target Location**: `apps/web/src/features/playoffs/components/PlayoffBracket/`

**Sub-Components to Create** (6):
1. `BracketRound.tsx` (~80 lines) - Round container
2. `BracketMatchup.tsx` (~120 lines) - Matchup card
3. `BracketTeam.tsx` (~80 lines) - Team display
4. `ToiletBowlBracket.tsx` (~150 lines) - Toilet bowl specific
5. `ChampionshipBracket.tsx` (~150 lines) - Championship specific
6. `BracketLegend.tsx` (~60 lines) - Legend/key

**Utilities**: `utils.ts` (~100 lines)
- `getMatchupWinner()` - Winner determination
- `isMatchupComplete()` - Completion check
- `calculateBracketLayout()` - Responsive layout

---

### WEB-COMP-004: Schedule Analysis (1,221 lines → ~120 lines)

**Current Location**: `apps/web/src/app/stats/components/ScheduleAnalysis.tsx`  
**Target Location**: `apps/web/src/features/stats/components/ScheduleAnalysis/`

**Sub-Components to Create** (5):
1. `ScheduleStrengthTable.tsx` (~150 lines) - SOS rankings
2. `ExpectedWinsTable.tsx` (~150 lines) - Expected vs actual
3. `WeeklyDifficultyChart.tsx` (~120 lines) - Difficulty progression
4. `MatchupHistoryTable.tsx` (~150 lines) - Head-to-head records
5. `FutureSchedulePreview.tsx` (~120 lines) - Upcoming opponents

**Utilities**: `utils.ts` (~150 lines)
- `calculateStrengthOfSchedule()` - SOS calculation
- `calculateExpectedWins()` - Win probability
- `calculateWeeklyDifficulty()` - Per-week difficulty
- `calculateLuckIndex()` - Luck metric

---

### WEB-COMP-005: Team View (1,169 lines → ~120 lines)

**Current Location**: `apps/web/src/app/stats/components/TeamView.tsx`  
**Target Location**: `apps/web/src/features/stats/components/TeamView/`

**Sub-Components to Create** (6):
1. `TeamSummaryCard.tsx` (~100 lines) - Overview card
2. `PositionalBreakdown.tsx` (~150 lines) - Position stats
3. `WeeklyPerformanceChart.tsx` (~120 lines) - Week-by-week
4. `PlayerContributions.tsx` (~150 lines) - Player breakdown
5. `PositionAdvantageChart.tsx` (~120 lines) - Position advantages
6. `TeamComparisonTable.tsx` (~100 lines) - vs league average

**Utilities**: `utils.ts` (~150 lines)
- `calculateTeamTotals()` - Aggregate stats
- `calculatePositionalBreakdown()` - Position analysis
- `calculatePlayerContributions()` - Player impact
- `calculateConsistency()` - Consistency score

---

### WEB-COMP-006: Start/Sit Efficiency (1,093 lines → ~120 lines)

**Current Location**: `apps/web/src/components/start-sit-efficiency.tsx`  
**Target Location**: `apps/web/src/features/start-sit/components/StartSitEfficiency/`

**Sub-Components to Create** (6):
1. `ManagerSelector.tsx` (~60 lines) - Manager dropdown
2. `EfficiencySummaryCard.tsx` (~100 lines) - Overall efficiency
3. `WeeklyDecisionsTable.tsx` (~150 lines) - Week-by-week
4. `PositionalEfficiencyTable.tsx` (~140 lines) - By position
5. `MissedOpportunitiesTable.tsx` (~140 lines) - Benched players
6. `OptimalLineupComparison.tsx` (~120 lines) - Actual vs optimal

**Utilities**: `utils.ts` (~120 lines)
- `calculateEfficiencyScore()` - Overall decision quality
- `calculateMissedPoints()` - Points on bench
- `calculateOptimalLineup()` - Best lineup
- `calculatePositionalEfficiency()` - Position decisions

---

### WEB-COMP-007: Transaction Analysis (852 lines → ~100 lines)

**Current Location**: `apps/web/src/app/stats/components/TransactionAnalysis.tsx`  
**Target Location**: `apps/web/src/features/transactions/components/TransactionAnalysis/`

**Sub-Components to Create** (5):
1. `TransactionSummary.tsx` (~100 lines) - Overview stats
2. `AddsDropsTable.tsx` (~150 lines) - Add/drop analysis
3. `TradesTable.tsx` (~150 lines) - Trade analysis
4. `WaiverActivity.tsx` (~120 lines) - Waiver priority
5. `TransactionGrading.tsx` (~120 lines) - Grade by transaction

---

### WEB-COMP-008: League View (765 lines → ~100 lines)

**Current Location**: `apps/web/src/app/stats/components/LeagueView.tsx`  
**Target Location**: `apps/web/src/features/stats/components/LeagueView/`

**Sub-Components to Create** (4):
1. `StandingsTable.tsx` (~150 lines) - Current standings
2. `LeagueLeadersTable.tsx` (~120 lines) - Top performers
3. `PointsScoredTable.tsx` (~120 lines) - Points rankings
4. `StrengthOfScheduleTable.tsx` (~100 lines) - SOS rankings

---

### WEB-COMP-009: Matchup Simulation (631 lines → ~100 lines)

**Current Location**: `apps/web/src/components/matchup-simulation.tsx`  
**Target Location**: `apps/web/src/features/matchups/components/MatchupSimulation/`

**Sub-Components to Create** (4):
1. `SimulationSummary.tsx` (~100 lines) - Win % and summary
2. `WinProbabilityChart.tsx` (~120 lines) - Probability visualization
3. `ScoreDistributionChart.tsx` (~120 lines) - Score histograms
4. `LineupComparison.tsx` (~100 lines) - Side-by-side lineups

---

### WEB-COMP-010: Scatter Analysis (625 lines → ~100 lines)

**Current Location**: `apps/web/src/app/stats/components/ScatterAnalysis.tsx`  
**Target Location**: `apps/web/src/features/stats/components/ScatterAnalysis/`

**Sub-Components to Create** (4):
1. `ScatterPlotBase.tsx` (~100 lines) - Reusable scatter plot
2. `PointsVsWinsScatter.tsx` (~120 lines) - Points vs wins
3. `OffenseVsDefenseScatter.tsx` (~120 lines) - Offense vs defense
4. `ConsistencyVsAverageScatter.tsx` (~120 lines) - Consistency analysis

---

## 📈 Expected Improvements

### Quantitative Metrics

| Metric                        | Before     | After      | Improvement   |
|-------------------------------|------------|------------|---------------|
| **Total Lines**               | 10,826     | ~5,830     | -46%          |
| **Largest Component**         | 1,586      | ~200       | -87%          |
| **Average Component Size**    | 1,083      | ~110       | -90%          |
| **Components >1,000 lines**   | 6          | 0          | -100%         |
| **Components >600 lines**     | 10         | 0          | -100%         |
| **Total Components**          | 10         | 63         | +530%         |
| **Testable Units**            | 10         | 63+        | +530%         |
| **Components with memo()**    | 0          | 63         | +100%         |

### Qualitative Improvements

**Maintainability**:
- ✅ Sub-components <200 lines each (enterprise standard)
- ✅ Single responsibility per component
- ✅ Clear separation of concerns
- ✅ Reusable utility functions

**Testability**:
- ✅ Component-level unit tests
- ✅ Utility function tests (100% coverage goal)
- ✅ Isolated sub-component testing
- ✅ Mock data factories

**Performance**:
- ✅ Memoization prevents unnecessary re-renders
- ✅ Chart components optimized (Recharts)
- ✅ Reduced bundle size per route
- ✅ Improved initial render time

**Developer Experience**:
- ✅ Easier to locate code
- ✅ Faster code reviews
- ✅ Reduced merge conflicts
- ✅ Clear file structure

---

## 🚀 Execution Strategy

### Recommended Order

**Week 1-2** (Critical Priority):
1. WEB-COMP-001 (ManagerAnalysis) - 2.5h
2. WEB-COMP-002 (TrendsView) - 2.5h
3. WEB-COMP-006 (StartSitEfficiency) - 2.0h

**Week 3** (Critical Priority):
4. WEB-COMP-003 (PlayoffBracket) - 2.0h
5. WEB-COMP-004 (ScheduleAnalysis) - 2.0h
6. WEB-COMP-005 (TeamView) - 2.0h

**Week 4** (Medium Priority):
7. WEB-COMP-007 (TransactionAnalysis) - 1.5h
8. WEB-COMP-008 (LeagueView) - 1.5h
9. WEB-COMP-009 (MatchupSimulation) - 1.5h
10. WEB-COMP-010 (ScatterAnalysis) - 1.5h

### Parallel Execution

Tasks can be parallelized by feature:
- **Draft Analysis**: WEB-COMP-001 (independent)
- **Stats Components**: WEB-COMP-002, 004, 005, 008, 010 (can be done together)
- **Playoffs**: WEB-COMP-003 (independent)
- **Start-Sit**: WEB-COMP-006 (independent)
- **Transactions**: WEB-COMP-007 (independent)
- **Matchups**: WEB-COMP-009 (independent)

---

## ✅ Success Criteria

### Per-Task Criteria

Each task must meet:
- [ ] Main component <150 lines
- [ ] All sub-components <250 lines
- [ ] All components use `memo()` for performance
- [ ] All components follow arrow function pattern
- [ ] Utility functions extracted to separate file
- [ ] Utils have 90%+ test coverage
- [ ] All sub-components have tests
- [ ] TypeScript compilation passes
- [ ] ESLint passes with no warnings
- [ ] Visual regression tests pass (identical appearance)
- [ ] Page imports updated
- [ ] Old file removed

### Overall Phase Success

Phase 5 complete when:
- [ ] All 10 components split
- [ ] 53+ sub-components created
- [ ] 10,826 lines reduced to ~5,830 lines
- [ ] Zero components >600 lines
- [ ] All components have tests
- [ ] All utils have >90% coverage
- [ ] Zero visual regressions
- [ ] Build passes
- [ ] Performance metrics improved

---

## 📊 Dependencies

### Blocked By (Prerequisites)

Most component tasks depend on type extraction:
- **WEB-COMP-001**: Requires WEB-HOOK-001, WEB-HOOK-002
- **WEB-COMP-002**: Requires WEB-HOOK-003, WEB-EXTRACT-004
- **WEB-COMP-003**: Requires WEB-EXTRACT-005
- **WEB-COMP-004**: Requires WEB-EXTRACT-004, WEB-HOOK-003
- **WEB-COMP-005**: Requires WEB-EXTRACT-004, WEB-HOOK-003
- **WEB-COMP-006**: Requires WEB-EXTRACT-006
- **WEB-COMP-007**: Requires WEB-EXTRACT-007
- **WEB-COMP-008**: Requires WEB-EXTRACT-004
- **WEB-COMP-009**: Requires WEB-EXTRACT-008
- **WEB-COMP-010**: Requires WEB-EXTRACT-004

**Recommendation**: Complete WEB-EXTRACT-004 early as it blocks 5 component tasks.

### Blocks (Following Tasks)

Component splitting blocks:
- **WEB-PAGE-001**: Draft analysis page migration
- **WEB-PAGE-002**: Stats page migration
- **WEB-PAGE-003**: Matchup page migration
- **WEB-CLEAN-001**: Remove deprecated files
- **WEB-TEST-001**: Component testing phase

---

## 🎓 Pattern Reference

All tasks follow these established patterns from WEB-COMP-001 and WEB-COMP-002:

### Directory Structure Pattern
```
features/{feature}/components/
├── {ComponentName}/
│   ├── {ComponentName}.tsx          # Main (~100-150 lines)
│   ├── {ComponentName}.test.tsx
│   ├── {SubComponent1}.tsx          # Sub-components
│   ├── {SubComponent1}.test.tsx
│   ├── utils.ts                      # Utilities
│   ├── utils.test.ts
│   └── index.ts                      # Barrel export
```

### Component Pattern
```typescript
'use client';

import React, { memo } from 'react';
import type { Props } from '@/features/{feature}/types';

export const ComponentName = memo<Props>(({ prop1, prop2 }) => {
  // Minimal logic, mostly composition
  return (
    <div>
      <SubComponent1 data={prop1} />
      <SubComponent2 data={prop2} />
    </div>
  );
});

ComponentName.displayName = 'ComponentName';
```

### Utility Pattern
```typescript
/**
 * Utility functions for {ComponentName}
 */

/**
 * Calculate something
 * @param input - Description
 * @returns Description
 */
export const calculateSomething = (input: number): number => {
  return input * 2;
};
```

### Test Pattern
```typescript
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ComponentName } from './ComponentName';

describe('ComponentName', () => {
  it('renders correctly', () => {
    render(<ComponentName {...mockProps} />);
    expect(screen.getByText('Expected Text')).toBeInTheDocument();
  });
});
```

---

## 📝 Task File Locations

All task files are located in `/tasks/`:
- `tasks/WEB-COMP-001.md` - ManagerAnalysis (detailed, 350+ lines)
- `tasks/WEB-COMP-002.md` - TrendsView (detailed, 350+ lines)
- `tasks/WEB-COMP-003.md` - PlayoffBracket
- `tasks/WEB-COMP-004.md` - ScheduleAnalysis
- `tasks/WEB-COMP-005.md` - TeamView
- `tasks/WEB-COMP-006.md` - StartSitEfficiency
- `tasks/WEB-COMP-007.md` - TransactionAnalysis
- `tasks/WEB-COMP-008.md` - LeagueView
- `tasks/WEB-COMP-009.md` - MatchupSimulation
- `tasks/WEB-COMP-010.md` - ScatterAnalysis

---

## 🔗 Related Documentation

- **ENTERPRISE_READINESS_ASSESSMENT.md**: Overall strategy and context
- **WEB-TASKS-SUMMARY.md**: All WEB tasks summary
- **CODING_CONVENTIONS.MD**: Coding standards (arrow functions, memo(), etc.)
- **tasks/PROGRESS.md**: Task completion tracking

---

**Generated**: October 7, 2025  
**Status**: All task files created ✅  
**Ready for Execution**: Yes  
**Next Step**: Begin with WEB-COMP-001 or WEB-COMP-002

