# WEB-TEST-001: Component Tests (Critical Paths)

**Category**: TEST  
**Priority**: 🔴 CRITICAL  
**Status**: ✅ COMPLETED  
**Completion Date**: October 16, 2025  
**Actual Time**: ~3 hours  
**Dependencies**: WEB-COMP-001 through WEB-COMP-010, WEB-SETUP-003

---

## Objective

Add comprehensive integration and component tests for all migrated feature
components to achieve 80%+ test coverage on critical user paths. Focus on
testing component behavior, user interactions, and data flow rather than
implementation details.

---

## Current Test Coverage Status

### ✅ Already Tested (Utilities Only)

- `features/matchups/components/MatchupSimulation/utils.test.ts` (68 tests)
- `features/matchups/components/MatchupOddsPreview/utils.test.ts` (54 tests)
- `features/stats/components/TrendsView/utils.test.ts` (27 tests)
- `features/stats/components/LeagueView/utils.test.ts` (32 tests)
- `features/stats/components/ScheduleAnalysis/utils.test.ts` (22 tests)
- `features/stats/components/TeamView/utils.test.ts` (35 tests)
- `features/transactions/components/TransactionAnalysis/utils.test.ts` (27
  tests)
- `features/start-sit/components/StartSitEfficiency/utils.test.ts` (28 tests)
- `features/hall-of-fame/utils/*.test.ts` (86 tests)

### ⚠️ Partially Tested (Need Integration Tests)

- `features/start-sit/components/StartSitEfficiency/` (3 component tests)
- `features/transactions/components/TransactionAnalysis/` (1 component test)
- `features/stats/components/TeamView/` (2 component tests)
- `features/matchups/components/MatchupOddsPreview/` (7 component tests)

### ❌ Need Component Tests

- `features/draft-analysis/components/ManagerAnalysis/` (0 component tests)
- `features/stats/components/TrendsView/` (0 component tests)
- `features/stats/components/LeagueView/` (0 component tests)
- `features/stats/components/ScheduleAnalysis/` (0 component tests)
- `features/matchups/components/MatchupSimulation/` (0 component tests)
- `features/playoffs/components/PlayoffBracket/` (0 component tests)

---

## Test Strategy

### Focus Areas (Priority Order)

1. **Draft Analysis** (High User Impact)
   - ManagerAnalysis component integration
   - Sorting/filtering interactions
   - Data display accuracy

2. **Stats Components** (Core Features)
   - TeamView: team selection, data rendering
   - TrendsView: trend visualization, filtering
   - LeagueView: rankings display
   - ScheduleAnalysis: schedule calculations

3. **Matchups** (Real-Time Features)
   - MatchupSimulation: probability display, margin calculations
   - MatchupOddsPreview: odds loading and display (already well-tested)

4. **Transactions** (Data Integrity)
   - TransactionAnalysis: grading, filtering, sorting

5. **Playoffs** (Seasonal Feature)
   - PlayoffBracket: bracket rendering, matchup display

---

## Steps

### 1. Create Test for ManagerAnalysis Component (45 min)

**File**:
`src/features/draft-analysis/components/ManagerAnalysis/ManagerAnalysis.test.tsx`

```typescript
import { describe, it, expect, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ManagerAnalysis } from './ManagerAnalysis';
import type { ManagerAnalysisProps } from '../../types';

// Test data
const mockManagers = [
  {
    userId: 'user1',
    managerName: 'Manager 1',
    league: 'AFC',
    giniCoefficient: 0.45,
    top1Concentration: 0.25,
    // ... full mock data
  },
  // ... more managers
];

describe('ManagerAnalysis', () => {
  it('renders manager data correctly', () => {
    render(<ManagerAnalysis managers={mockManagers} />);
    expect(screen.getByText('Manager 1')).toBeInTheDocument();
  });

  it('filters by cluster selection', async () => {
    const user = userEvent.setup();
    render(<ManagerAnalysis managers={mockManagers} />);

    // Click cluster filter
    const clusterButton = screen.getByText(/Cluster/i);
    await user.click(clusterButton);

    // Verify filtered results
    // ...
  });

  it('sorts by different columns', async () => {
    // Test sorting by Gini, Top 1%, etc.
  });

  it('displays concentration metrics table', () => {
    // Verify metrics are calculated and displayed
  });

  it('shows player overlap analysis', () => {
    // Test overlap visualization
  });
});
```

**Test Coverage Goals**:

- [ ] Manager list renders correctly
- [ ] Cluster filtering works
- [ ] Column sorting works
- [ ] All sub-components render without errors
- [ ] Data calculations are accurate

---

### 2. Create Test for TeamView Component (30 min)

**File**: `src/features/stats/components/TeamView/TeamView.test.tsx` (expand
existing)

```typescript
describe('TeamView - Integration', () => {
  it('renders team summary card with correct data', () => {
    // Test TeamSummaryCard integration
  });

  it('displays positional breakdown accurately', () => {
    // Test PositionalBreakdown with real-ish data
  });

  it('calculates weekly performance correctly', () => {
    // Verify WeeklyPerformanceChart data
  });

  it('shows position advantage chart', () => {
    // Test PositionAdvantageChart rendering
  });

  it('compares teams correctly', () => {
    // Test TeamComparisonTable logic
  });

  it('handles team selection changes', async () => {
    // Test team switching behavior
  });

  it('calculates player contributions', () => {
    // Verify PlayerContributions accuracy
  });
});
```

**Test Coverage Goals**:

- [ ] All sub-components integrate correctly
- [ ] Team data calculations are accurate
- [ ] Team selection works
- [ ] Charts render without errors
- [ ] Player contribution calculations verified

---

### 3. Create Test for TrendsView Component (30 min)

**File**: `src/features/stats/components/TrendsView/TrendsView.test.tsx`

```typescript
describe('TrendsView', () => {
  it('renders power rankings evolution', () => {
    // Test PowerRankingsEvolution display
  });

  it('shows weekly performance trends', () => {
    // Test WeeklyPerformanceTrends charts
  });

  it('displays position performance correctly', () => {
    // Test PositionPerformanceTrends
  });

  it('calculates team consistency', () => {
    // Test TeamConsistencyAnalysis
  });

  it('shows position consistency', () => {
    // Test PositionConsistencyAnalysis
  });

  it('renders team scoring distribution', () => {
    // Test TeamScoringDistribution (ridge plots)
  });

  it('displays position scoring distribution', () => {
    // Test PositionScoringDistribution
  });
});
```

**Test Coverage Goals**:

- [ ] All trend visualizations render
- [ ] Data calculations are accurate
- [ ] Ridge plot data is correct
- [ ] Consistency metrics verified
- [ ] Power rankings evolution accurate

---

### 4. Create Test for LeagueView Component (20 min)

**File**: `src/features/stats/components/LeagueView/LeagueView.test.tsx`

```typescript
describe('LeagueView', () => {
  it('displays league rankings table', () => {
    // Test LeagueRankingsTable
  });

  it('shows position rankings sections', () => {
    // Test PositionRankingsSection for each position
  });

  it('calculates positional advantages', () => {
    // Test PositionalAdvantagesCard calculations
  });

  it('renders color legend', () => {
    // Test ColorLegend display
  });

  it('handles team data correctly', () => {
    // Verify all team stats are displayed
  });
});
```

---

### 5. Create Test for ScheduleAnalysis Component (20 min)

**File**:
`src/features/stats/components/ScheduleAnalysis/ScheduleAnalysis.test.tsx`

```typescript
describe('ScheduleAnalysis', () => {
  it('renders schedule matrix table', () => {
    // Test ScheduleMatrixTable
  });

  it('displays schedule strength correctly', () => {
    // Test ScheduleStrengthTable
  });

  it('shows schedule difficulty', () => {
    // Test ScheduleDifficultyTable
  });

  it('calculates expected wins', () => {
    // Test ExpectedWinsTable calculations
  });

  it('renders weekly difficulty chart', () => {
    // Test WeeklyDifficultyChart
  });

  it('shows luck distribution', () => {
    // Test LuckDistributionSection
  });
});
```

---

### 6. Create Test for MatchupSimulation Component (20 min)

**File**:
`src/features/matchups/components/MatchupSimulation/MatchupSimulation.test.tsx`

```typescript
describe('MatchupSimulation', () => {
  it('displays simulation summary', () => {
    // Test SimulationSummary with win probabilities
  });

  it('shows score ranges correctly', () => {
    // Test ScoreRangesDisplay and box plots
  });

  it('renders win margin calculator', () => {
    // Test WinMarginCalculator interactions
  });

  it('displays over/under probabilities', () => {
    // Test OverUnderDisplay
  });

  it('shows NFL game context', () => {
    // Test NFLGameContext transparency
  });

  it('calculates simulation stats', () => {
    // Test SimulationStats accuracy
  });
});
```

---

### 7. Create Test for PlayoffBracket Component (15 min)

**File**:
`src/features/playoffs/components/PlayoffBracket/PlayoffBracket.test.tsx`

```typescript
describe('PlayoffBracket', () => {
  it('renders official bracket when data available', () => {
    // Test OfficialBracketFlow
  });

  it('shows fallback bracket when no data', () => {
    // Test FallbackBracket
  });

  it('displays bracket teams correctly', () => {
    // Test BracketTeam rendering
  });

  it('renders matchups in correct rounds', () => {
    // Test BracketRound and BracketMatchup
  });

  it('shows bracket legend', () => {
    // Test BracketLegend
  });
});
```

---

### 8. Expand TransactionAnalysis Tests (15 min)

**File**: Expand
`src/features/transactions/components/TransactionAnalysis/TransactionAnalysis.test.tsx`

Add tests for:

- Filtering by grade/type
- Sorting transactions
- Transaction details dialog
- Summary card calculations

---

### 9. Run Coverage Report and Fill Gaps (15 min)

```bash
cd apps/web
pnpm test:coverage --run

# Identify files below 80% coverage
# Add missing test cases
```

---

## Acceptance Criteria

### Component Tests

- [ ] All 7 main feature components have integration tests
- [ ] Each component has 5-10 test cases covering:
  - [ ] Basic rendering
  - [ ] User interactions (clicks, selections)
  - [ ] Data calculations
  - [ ] Edge cases (empty data, errors)
  - [ ] Sub-component integration

### Coverage Metrics

- [ ] Overall test coverage ≥80% for features/
- [ ] All critical user paths tested
- [ ] No untested critical calculations

### Test Quality

- [ ] Tests use realistic data (not just empty arrays)
- [ ] Tests verify actual behavior, not implementation
- [ ] Tests are readable and maintainable
- [ ] Tests run fast (<5 seconds total)

### Build Status

- [ ] All tests pass: `pnpm test`
- [ ] Coverage report generated: `pnpm test:coverage`
- [ ] TypeScript compilation passes
- [ ] No console errors during test runs

---

## Test Data Strategy

### Create Shared Test Fixtures

**File**: `src/test/fixtures/stats-data.ts`

```typescript
export const mockTeamData = {
  rosterId: 1,
  teamName: 'Test Team',
  ownerName: 'Test Owner',
  weeklyScores: [120.5, 115.2, 130.8, 105.3],
  // ... complete realistic data
};

export const mockLeagueData = {
  teams: [mockTeamData /* ... more teams */],
  // ... league-level data
};
```

**File**: `src/test/fixtures/draft-data.ts`

```typescript
export const mockManagers = [
  {
    userId: 'user1',
    managerName: 'Manager 1',
    // ... complete draft analysis data
  },
];
```

---

## Verification Commands

```bash
cd /Users/dhruv.methi/Documents/GitHub/gauntlet-website/apps/web

# Run all tests
pnpm test

# Run with coverage
pnpm test:coverage

# Run specific test file
pnpm test ManagerAnalysis.test.tsx

# Run tests in watch mode
pnpm test:watch

# Check TypeScript
pnpm tsc --noEmit

# Verify build still works
pnpm build
```

---

## Coverage Targets by Feature

| Feature                | Current            | Target | Priority    |
| ---------------------- | ------------------ | ------ | ----------- |
| draft-analysis         | ~40% (utils only)  | 80%+   | 🔴 Critical |
| stats/TeamView         | ~50% (2 tests)     | 85%+   | 🔴 Critical |
| stats/TrendsView       | ~30% (utils only)  | 80%+   | 🔴 Critical |
| stats/LeagueView       | ~35% (utils only)  | 80%+   | 🟡 High     |
| stats/ScheduleAnalysis | ~30% (utils only)  | 80%+   | 🟡 High     |
| matchups/Simulation    | ~35% (utils only)  | 80%+   | 🟡 High     |
| matchups/OddsPreview   | ~85% (well tested) | 90%+   | 🟢 Low      |
| transactions           | ~50% (partial)     | 80%+   | 🟡 High     |
| start-sit              | ~60% (partial)     | 85%+   | 🟡 High     |
| playoffs               | ~40% (utils only)  | 75%+   | 🟢 Low      |

---

## Example: Complete Test for One Component

### ManagerAnalysis.test.tsx (Full Example)

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ManagerAnalysis } from './ManagerAnalysis';
import { mockManagers } from '@/test/fixtures/draft-data';

describe('ManagerAnalysis', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders all manager rows', () => {
      render(<ManagerAnalysis managers={mockManagers} />);

      mockManagers.forEach(manager => {
        expect(screen.getByText(manager.managerName)).toBeInTheDocument();
      });
    });

    it('displays concentration metrics table', () => {
      render(<ManagerAnalysis managers={mockManagers} />);

      expect(screen.getByText(/Gini Coefficient/i)).toBeInTheDocument();
      expect(screen.getByText(/Top 1%/i)).toBeInTheDocument();
    });

    it('shows player overlap analysis', () => {
      render(<ManagerAnalysis managers={mockManagers} />);

      expect(screen.getByText(/Player Overlap/i)).toBeInTheDocument();
    });
  });

  describe('Interactions', () => {
    it('filters by cluster when cluster selected', async () => {
      const user = userEvent.setup();
      render(<ManagerAnalysis managers={mockManagers} />);

      // Should show all managers initially
      expect(screen.getAllByRole('row')).toHaveLength(mockManagers.length + 1); // +1 for header

      // Click cluster filter
      const clusterFilter = screen.getByLabelText(/Filter by cluster/i);
      await user.click(clusterFilter);
      await user.click(screen.getByText('Cluster 1'));

      // Should show filtered results
      const cluster1Managers = mockManagers.filter(m => m.cluster === 1);
      expect(screen.getAllByRole('row')).toHaveLength(cluster1Managers.length + 1);
    });

    it('sorts by Gini coefficient', async () => {
      const user = userEvent.setup();
      render(<ManagerAnalysis managers={mockManagers} />);

      const giniHeader = screen.getByText(/Gini/i);
      await user.click(giniHeader);

      // Verify sort order
      const rows = screen.getAllByRole('row');
      // First row should have highest Gini
      // ... verification logic
    });
  });

  describe('Data Accuracy', () => {
    it('calculates concentrations correctly', () => {
      render(<ManagerAnalysis managers={mockManagers} />);

      const manager1 = mockManagers[0];
      const giniCell = screen.getByText(manager1.giniCoefficient.toFixed(3));
      expect(giniCell).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('handles empty managers array', () => {
      render(<ManagerAnalysis managers={[]} />);
      expect(screen.getByText(/No managers/i)).toBeInTheDocument();
    });

    it('handles missing optional fields', () => {
      const incompleteManager = { ...mockManagers[0], cluster: undefined };
      render(<ManagerAnalysis managers={[incompleteManager]} />);
      expect(screen.getByText(incompleteManager.managerName)).toBeInTheDocument();
    });
  });
});
```

---

## Cursor Prompt (Copy-Paste Ready)

```
I'm working on WEB-TEST-001: Component Tests (Critical Paths).

Please:
1. Read the task file at tasks/WEB-TEST-001.md
2. Start with the ManagerAnalysis component test (Step 1)
3. Create test fixtures in src/test/fixtures/ for shared mock data
4. Follow the test pattern shown in the example
5. Run tests after each component to verify they pass

Focus on testing behavior and user interactions, not implementation details.
Target 80%+ coverage for all migrated features.
```

---

## Related Tasks

**Blocks**: WEB-PAGE-001, WEB-PAGE-002, WEB-PAGE-003, WEB-CLEAN-002  
**Blocked By**: WEB-COMP-001 through WEB-COMP-010, WEB-SETUP-003  
**Related**: WEB-TEST-002 (Hook Tests), WEB-TEST-003 (Utility Tests),
WEB-TEST-004 (Integration Tests)

---

## Notes

### Testing Philosophy

**Do Test:**

- ✅ User-visible behavior
- ✅ Data transformations and calculations
- ✅ User interactions (clicks, selections)
- ✅ Edge cases and error states
- ✅ Integration between sub-components

**Don't Test:**

- ❌ Implementation details
- ❌ Third-party library internals
- ❌ CSS/styling (use visual regression tests)
- ❌ Simple prop passing

### Test Naming Convention

```typescript
describe('ComponentName', () => {
  describe('Feature/Section', () => {
    it('does something specific when condition', () => {
      // test
    });
  });
});
```

### Mock Data Guidelines

- Use realistic data (not empty arrays or null everywhere)
- Keep mock data DRY (centralize in fixtures)
- Make mock data representative of production data
- Include edge cases in fixtures (empty, max, min values)

---

**Estimated Context Usage**: ~500 lines read per component, ~100-150 lines
written per test file, 3 hours total

**Success Metric**: 80%+ test coverage on all migrated features, all tests
passing
