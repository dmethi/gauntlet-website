# WEB-TEST-002: Hook Tests

**Category**: TEST  
**Priority**: 🔴 CRITICAL  
**Estimated Time**: 2 hours  
**Dependencies**: WEB-HOOK-001, WEB-HOOK-002, WEB-HOOK-003  
**Status**: ✅ **COMPLETED** - October 16, 2025

---

## Objective

Add comprehensive tests for all custom React hooks across features to ensure
proper state management, data fetching, error handling, and side effects.
Achieve 100% coverage on all custom hooks since they encapsulate critical
business logic.

## Completion Summary

✅ **All 59 tests passing (100%)**  
✅ 5 new test files created covering all priority untested hooks  
✅ Build and TypeScript clean  
✅ Zero tech debt

See: `apps/web/WEB-TEST-002-FINAL-SUMMARY.md`

---

## Current Hook Inventory

### ✅ Already Tested

- `features/matchups/hooks/useMatchupOdds.test.ts` (8 tests) ✅

### ❌ Need Tests

**Draft Analysis** (2 hooks):

- `features/draft-analysis/hooks/useManagerFiltering.ts` (7 existing tests)
- `features/draft-analysis/hooks/useManagerSorting.ts` (13 existing tests)
- `features/draft-analysis/hooks/useDraftAnalytics.ts` (8 existing tests)

**Stats** (4 hooks):

- `features/stats/hooks/useLeagueStats.ts` (6 existing tests)
- `features/stats/hooks/useSeasonAggregates.ts` (3 existing tests)
- `features/stats/hooks/useSuperlatives.ts` (4 existing tests)
- `features/stats/hooks/useWeekStats.ts` (3 existing tests)

**Matchups** (2 hooks):

- `features/matchups/hooks/useMatchupTimeSeries.ts` (0 tests) ❌
- `features/matchups/hooks/useMatchupOdds.ts` (8 tests) ✅

**Transactions** (1 hook):

- `features/transactions/components/TransactionAnalysis/useTransactionAnalysisModel.ts`
  (0 tests) ❌

**Start/Sit** (1 hook):

- `features/start-sit/components/StartSitEfficiency/useStartSitEfficiencyModel.ts`
  (0 tests) ❌

**Stats Components** (2 hooks):

- `features/stats/components/TeamView/useTeamViewModel.ts` (0 tests) ❌

**Hall of Fame** (1 hook):

- `features/hall-of-fame/hooks/useHallOfFameData.ts` (0 tests) ❌

**Legacy (in hooks/)** (5 hooks - deprioritize):

- `hooks/useSleeper.ts` (large, API calls)
- `hooks/useHallOfFame.ts` (superseded by feature hook)
- `hooks/useHallOfFameEnhanced.ts` (superseded)
- `hooks/useClientCalculations.ts`
- `hooks/useLeagueOverviewClient.ts`

---

## Test Strategy

### Priority 1: Untested Feature Hooks (60 min)

Focus on hooks with 0 tests that encapsulate critical logic:

1. `useMatchupTimeSeries` - Real-time matchup data
2. `useTransactionAnalysisModel` - Transaction processing
3. `useStartSitEfficiencyModel` - Lineup decisions
4. `useTeamViewModel` - Team data processing
5. `useHallOfFameData` - Record calculations

### Priority 2: Expand Existing Tests (30 min)

Add missing test cases to hooks with partial coverage:

1. Draft analysis hooks - add edge cases
2. Stats hooks - add error scenarios
3. MatchupOdds - add network failure cases

### Priority 3: Integration Tests (30 min)

Test hook combinations and data flow between hooks.

---

## Steps

### 1. Test useMatchupTimeSeries Hook (15 min)

**File**: `src/features/matchups/hooks/useMatchupTimeSeries.test.ts`

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useMatchupTimeSeries } from './useMatchupTimeSeries';

describe('useMatchupTimeSeries', () => {
  beforeEach(() => {
    global.fetch = vi.fn();
    vi.clearAllMocks();
  });

  it('fetches time series data successfully', async () => {
    const mockData = {
      timeSeries: [
        {
          timestamp: '2024-10-01T12:00:00Z',
          team1WinProb: 0.55,
          team2WinProb: 0.45,
        },
        // ... more data points
      ],
    };

    (global.fetch as any).mockResolvedValue({
      ok: true,
      json: async () => mockData,
    });

    const { result } = renderHook(() =>
      useMatchupTimeSeries({
        leagueId: '123',
        week: 5,
        matchupId: 1,
      })
    );

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.data).toEqual(mockData.timeSeries);
    expect(result.current.error).toBeNull();
  });

  it('handles fetch errors gracefully', async () => {
    (global.fetch as any).mockRejectedValue(new Error('Network error'));

    const { result } = renderHook(() =>
      useMatchupTimeSeries({
        leagueId: '123',
        week: 5,
        matchupId: 1,
      })
    );

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBeTruthy();
    expect(result.current.data).toBeNull();
  });

  it('handles 404 responses (no data yet)', async () => {
    (global.fetch as any).mockResolvedValue({
      ok: false,
      status: 404,
    });

    const { result } = renderHook(() =>
      useMatchupTimeSeries({
        leagueId: '123',
        week: 5,
        matchupId: 1,
      })
    );

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.data).toBeNull();
    expect(result.current.error).toBeNull(); // 404 is not an error state
  });

  it('refetches when parameters change', async () => {
    (global.fetch as any).mockResolvedValue({
      ok: true,
      json: async () => ({ timeSeries: [] }),
    });

    const { rerender } = renderHook(
      ({ leagueId, week, matchupId }) =>
        useMatchupTimeSeries({ leagueId, week, matchupId }),
      {
        initialProps: { leagueId: '123', week: 5, matchupId: 1 },
      }
    );

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledTimes(1);
    });

    // Change week
    rerender({ leagueId: '123', week: 6, matchupId: 1 });

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledTimes(2);
      expect(global.fetch).toHaveBeenLastCalledWith(
        expect.stringContaining('/week/6/')
      );
    });
  });

  it('provides empty array when no data', async () => {
    (global.fetch as any).mockResolvedValue({
      ok: true,
      json: async () => ({ timeSeries: [] }),
    });

    const { result } = renderHook(() =>
      useMatchupTimeSeries({
        leagueId: '123',
        week: 5,
        matchupId: 1,
      })
    );

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.data).toEqual([]);
  });
});
```

**Test Coverage Goals**:

- [ ] Successful data fetch
- [ ] Network errors
- [ ] 404 responses
- [ ] Parameter changes trigger refetch
- [ ] Empty data handling

---

### 2. Test useTransactionAnalysisModel Hook (15 min)

**File**:
`src/features/transactions/components/TransactionAnalysis/useTransactionAnalysisModel.test.ts`

```typescript
import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useTransactionAnalysisModel } from './useTransactionAnalysisModel';
import { mockTransactions } from '@/test/fixtures/transaction-data';

describe('useTransactionAnalysisModel', () => {
  it('initializes with default state', () => {
    const { result } = renderHook(() =>
      useTransactionAnalysisModel({
        transactions: mockTransactions,
        currentNflWeek: 5,
      })
    );

    expect(result.current.selectedManager).toBe('all');
    expect(result.current.filterGrade).toBe('all');
    expect(result.current.sortBy).toBe('score');
  });

  it('filters transactions by manager', () => {
    const { result } = renderHook(() =>
      useTransactionAnalysisModel({
        transactions: mockTransactions,
        currentNflWeek: 5,
      })
    );

    act(() => {
      result.current.setSelectedManager('manager1');
    });

    expect(result.current.filteredTransactions).toHaveLength(
      mockTransactions.filter(t => t.manager === 'manager1').length
    );
  });

  it('filters transactions by grade', () => {
    const { result } = renderHook(() =>
      useTransactionAnalysisModel({
        transactions: mockTransactions,
        currentNflWeek: 5,
      })
    );

    act(() => {
      result.current.setFilterGrade('A');
    });

    expect(
      result.current.filteredTransactions.every(t => t.grade === 'A')
    ).toBe(true);
  });

  it('sorts transactions by score', () => {
    const { result } = renderHook(() =>
      useTransactionAnalysisModel({
        transactions: mockTransactions,
        currentNflWeek: 5,
      })
    );

    act(() => {
      result.current.setSortBy('score');
    });

    const scores = result.current.filteredTransactions.map(t => t.score);
    expect(scores).toEqual([...scores].sort((a, b) => b - a));
  });

  it('calculates summary stats correctly', () => {
    const { result } = renderHook(() =>
      useTransactionAnalysisModel({
        transactions: mockTransactions,
        currentNflWeek: 5,
      })
    );

    const { stats } = result.current;

    expect(stats.total).toBe(mockTransactions.length);
    expect(stats.positive).toBeGreaterThanOrEqual(0);
    expect(stats.negative).toBeGreaterThanOrEqual(0);
    expect(stats.neutral).toBeGreaterThanOrEqual(0);
    expect(stats.positive + stats.negative + stats.neutral).toBe(stats.total);
  });

  it('handles empty transactions array', () => {
    const { result } = renderHook(() =>
      useTransactionAnalysisModel({
        transactions: [],
        currentNflWeek: 5,
      })
    );

    expect(result.current.filteredTransactions).toEqual([]);
    expect(result.current.stats.total).toBe(0);
  });

  it('limits transactions to current week', () => {
    const { result } = renderHook(() =>
      useTransactionAnalysisModel({
        transactions: mockTransactions,
        currentNflWeek: 3,
      })
    );

    expect(result.current.filteredTransactions.every(t => t.week <= 3)).toBe(
      true
    );
  });
});
```

---

### 3. Test useStartSitEfficiencyModel Hook (15 min)

**File**:
`src/features/start-sit/components/StartSitEfficiency/useStartSitEfficiencyModel.test.ts`

```typescript
describe('useStartSitEfficiencyModel', () => {
  it('loads efficiency data successfully', async () => {
    // Test data loading
  });

  it('filters by selected manager', () => {
    // Test manager filtering
  });

  it('calculates efficiency metrics correctly', () => {
    // Verify efficiency calculations
  });

  it('identifies risky decisions', () => {
    // Test risky decision detection
  });

  it('calculates worst decisions', () => {
    // Test worst decision sorting
  });

  it('handles loading state', () => {
    // Test loading state management
  });

  it('handles error state', () => {
    // Test error handling
  });
});
```

---

### 4. Test useTeamViewModel Hook (15 min)

**File**: `src/features/stats/components/TeamView/useTeamViewModel.test.ts`

```typescript
describe('useTeamViewModel', () => {
  it('selects team and loads data', () => {
    // Test team selection
  });

  it('calculates team metrics correctly', () => {
    // Verify metric calculations
  });

  it('computes weekly performance', () => {
    // Test weekly data
  });

  it('calculates positional breakdowns', () => {
    // Test position analysis
  });

  it('handles team changes', () => {
    // Test team switching
  });

  it('memoizes computed values', () => {
    // Test memoization
  });
});
```

---

### 5. Test useHallOfFameData Hook (10 min)

**File**: `src/features/hall-of-fame/hooks/useHallOfFameData.test.ts`

```typescript
describe('useHallOfFameData', () => {
  it('fetches hall of fame records', async () => {
    // Test data fetching
  });

  it('calculates records correctly', () => {
    // Verify record calculations
  });

  it('handles loading state', () => {
    // Test loading
  });

  it('handles errors gracefully', () => {
    // Test error handling
  });

  it('caches results appropriately', () => {
    // Test caching behavior
  });
});
```

---

### 6. Expand Existing Hook Tests (30 min)

Add missing test cases to hooks with partial coverage:

**useManagerFiltering** - Add tests for:

- [ ] Edge case: empty clusters array
- [ ] Multiple cluster selections
- [ ] Clear filters

**useManagerSorting** - Add tests for:

- [ ] Sort stability
- [ ] Toggle sort direction multiple times
- [ ] Sort persistence across renders

**useDraftAnalytics** - Add tests for:

- [ ] Cache invalidation
- [ ] Parallel requests
- [ ] Stale data handling

**Stats hooks** - Add for each:

- [ ] Network timeout scenarios
- [ ] Invalid data responses
- [ ] Retry logic

---

### 7. Integration Tests (20 min)

Test hook combinations and data flow:

**File**: `src/features/draft-analysis/hooks/hooks-integration.test.ts`

```typescript
describe('Draft Analysis Hooks Integration', () => {
  it('filtering and sorting work together', () => {
    // Test useManagerFiltering + useManagerSorting
    const filtering = renderHook(() => useManagerFiltering(mockManagers));
    const sorting = renderHook(() =>
      useManagerSorting(filtering.result.current.filtered)
    );

    // Apply filter
    act(() => {
      filtering.result.current.setCluster(1);
    });

    // Verify sorted filtered results
    expect(sorting.result.current.sorted).toBeDefined();
  });

  it('draft analytics hook provides data for filtering', async () => {
    // Test useDraftAnalytics → useManagerFiltering flow
  });
});
```

---

## Acceptance Criteria

### Hook Coverage

- [ ] All untested hooks have test files (5 hooks)
- [ ] All existing hook tests expanded with edge cases
- [ ] 100% coverage on all custom hooks
- [ ] Integration tests for hook combinations

### Test Quality

- [ ] Each hook has 5-10 test cases covering:
  - [ ] Initial state
  - [ ] State updates
  - [ ] Side effects (fetching, calculations)
  - [ ] Error handling
  - [ ] Edge cases
  - [ ] Cleanup

### Specific Tests

- [ ] Async hooks test loading states
- [ ] Async hooks test error states
- [ ] Async hooks test refetch on param changes
- [ ] State hooks test all update functions
- [ ] Computed hooks test memoization
- [ ] Cleanup functions tested (useEffect cleanup)

### Build Status

- [ ] All tests pass: `pnpm test`
- [ ] Coverage report shows 100% on hooks
- [ ] TypeScript compilation passes
- [ ] No warnings in test output

---

## Hook Testing Patterns

### Pattern 1: Data Fetching Hook

```typescript
describe('useDataHook', () => {
  beforeEach(() => {
    global.fetch = vi.fn();
  });

  it('fetches data successfully', async () => {
    (global.fetch as any).mockResolvedValue({
      ok: true,
      json: async () => ({ data: 'test' }),
    });

    const { result } = renderHook(() => useDataHook());

    expect(result.current.loading).toBe(true);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.data).toEqual({ data: 'test' });
    expect(result.current.error).toBeNull();
  });

  it('handles errors', async () => {
    (global.fetch as any).mockRejectedValue(new Error('Failed'));

    const { result } = renderHook(() => useDataHook());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBeTruthy();
  });
});
```

### Pattern 2: State Management Hook

```typescript
describe('useStateHook', () => {
  it('initializes with default state', () => {
    const { result } = renderHook(() => useStateHook());
    expect(result.current.value).toBe(defaultValue);
  });

  it('updates state correctly', () => {
    const { result } = renderHook(() => useStateHook());

    act(() => {
      result.current.setValue(newValue);
    });

    expect(result.current.value).toBe(newValue);
  });
});
```

### Pattern 3: Computed Hook

```typescript
describe('useComputedHook', () => {
  it('calculates value correctly', () => {
    const { result } = renderHook(() => useComputedHook(input));
    expect(result.current.computed).toBe(expectedValue);
  });

  it('memoizes computed value', () => {
    const { result, rerender } = renderHook(
      ({ input }) => useComputedHook(input),
      { initialProps: { input: value1 } }
    );

    const firstResult = result.current.computed;

    // Re-render with same input
    rerender({ input: value1 });

    // Should be same reference
    expect(result.current.computed).toBe(firstResult);
  });
});
```

---

## Verification Commands

```bash
cd /Users/dhruv.methi/Documents/GitHub/gauntlet-website/apps/web

# Run all hook tests
pnpm test hooks/

# Run specific hook test
pnpm test useMatchupTimeSeries.test.ts

# Check coverage for hooks only
pnpm test:coverage --collectCoverageFrom="**/hooks/**/*.ts"

# Run in watch mode
pnpm test:watch hooks/
```

---

## Cursor Prompt (Copy-Paste Ready)

```
I'm working on WEB-TEST-002: Hook Tests.

Please:
1. Read the task file at tasks/WEB-TEST-002.md
2. Start with useMatchupTimeSeries (Step 1) - it has 0 tests currently
3. Follow the hook testing patterns provided
4. Use renderHook from @testing-library/react
5. Test loading states, error states, and data flow
6. Ensure all async operations use waitFor()

Target: 100% coverage on all custom hooks.
```

---

## Related Tasks

**Blocks**: WEB-CLEAN-002  
**Blocked By**: WEB-HOOK-001, WEB-HOOK-002, WEB-HOOK-003  
**Related**: WEB-TEST-001 (Component Tests), WEB-TEST-003 (Utility Tests)

---

## Notes

### Common Hook Testing Mistakes

**Avoid:**

- ❌ Testing React internals
- ❌ Testing implementation details
- ❌ Not wrapping state updates in `act()`
- ❌ Forgetting to wait for async operations
- ❌ Not mocking external dependencies

**Do:**

- ✅ Test the hook's public API
- ✅ Test return values and behavior
- ✅ Always use `act()` for state updates
- ✅ Use `waitFor()` for async operations
- ✅ Mock fetch, timers, and external services

### React Query Hooks

For hooks using React Query, wrap in QueryClientProvider:

```typescript
const wrapper = ({ children }) => (
  <QueryClientProvider client={queryClient}>
    {children}
  </QueryClientProvider>
);

const { result } = renderHook(() => useQueryHook(), { wrapper });
```

---

**Estimated Context Usage**: ~100 lines read per hook, ~80-120 lines written per
test file, 2 hours total

**Success Metric**: 100% test coverage on all custom hooks, all tests passing
