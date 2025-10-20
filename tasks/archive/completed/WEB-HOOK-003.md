# WEB-HOOK-003: Stats Hub Hooks

**Category**: HOOK  
**Priority**: 🟡 MEDIUM  
**Estimated Time**: 1 hour  
**Dependencies**: WEB-EXTRACT-003, WEB-EXTRACT-004

---

## Objective

Extract stats-related data fetching hooks from centralized `lib/hooks.ts` (726
lines) into feature-specific hooks in `features/stats/hooks/`. This includes
moving 4 stats-specific hooks (`useLeagueData`, `useSeasonalAggregates`,
`useWeekRollups`, `useSeasonSuperlatives`) to reduce the centralized hooks file
and improve feature co-location.

---

## Context Needed

**Read these files** (with specific line ranges):

1. `apps/web/src/lib/hooks.ts` (lines 41-402) - Stats-related hooks
2. `apps/web/src/features/stats/types.ts` (all) - Stats type definitions
3. `apps/web/src/shared/types/api.ts` (lines 1-150) - API response types

**Total Context**: ~400 lines

---

## Steps

### 1. Create useLeagueStats Hook

Create `apps/web/src/features/stats/hooks/useLeagueStats.ts`:

````typescript
import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import type { LeagueData, Roster, Matchup, TeamStats } from '@/shared/types';

const getLeagueData = async (): Promise<LeagueData> => {
  const res = await fetch('/api/league/overview');
  if (!res.ok) {
    throw new Error('Network response was not ok');
  }
  return res.json();
};

export interface LeagueStatsResult {
  league: LeagueData | undefined;
  teamStats: TeamStats[];
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
}

/**
 * Fetch league data with computed team statistics
 *
 * @returns League data with team stats, loading/error states
 *
 * @example
 * ```typescript
 * const { league, teamStats, isLoading, isError } = useLeagueStats();
 *
 * if (isLoading) return <LoadingSkeleton />;
 * if (isError) return <ErrorMessage />;
 *
 * return <StatsTable teams={teamStats} />;
 * ```
 */
export const useLeagueStats = (): LeagueStatsResult => {
  const {
    data: league,
    isLoading,
    isError,
    error,
  } = useQuery<LeagueData>({
    queryKey: ['leagueData'],
    queryFn: getLeagueData,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
  });

  const teamStats = useMemo(() => {
    if (!league) return [];

    return (league.rosters || []).map((roster: Roster) => {
      const totalPoints = (roster.matchups || []).reduce(
        (sum: number, matchup: Matchup) => sum + matchup.points,
        0
      );

      const wins = roster.settings?.wins || 0;
      const losses = roster.settings?.losses || 0;

      return {
        id: roster.id,
        name: roster.owner?.display_name || `Team ${roster.id}`,
        wins,
        losses,
        pointsFor: totalPoints,
        pointsAgainst: 0, // Calculate from matchups if needed
      };
    });
  }, [league]);

  return {
    league,
    teamStats,
    isLoading,
    isError,
    error,
  };
};
````

### 2. Create useSeasonAggregates Hook

Create `apps/web/src/features/stats/hooks/useSeasonAggregates.ts`:

````typescript
import { useQuery } from '@tanstack/react-query';
import type { SeasonalAggregatesResponse } from '@/shared/types';

export interface SeasonAggregatesOptions {
  enabled?: boolean;
}

/**
 * Fetch seasonal aggregate data for a league
 *
 * @param leagueId - League ID
 * @param season - Season year
 * @param options - Query options
 * @returns Seasonal aggregates with loading/error states
 *
 * @example
 * ```typescript
 * const { data, isLoading, isError } = useSeasonAggregates('12345', '2025');
 *
 * if (!data?.ok) return <ErrorMessage />;
 *
 * return <SeasonStats aggregates={data.data} />;
 * ```
 */
export const useSeasonAggregates = (
  leagueId?: string,
  season?: string,
  options?: SeasonAggregatesOptions
) => {
  const { enabled = true } = options || {};

  return useQuery<SeasonalAggregatesResponse>({
    queryKey: ['seasonal', leagueId, season],
    queryFn: async (): Promise<SeasonalAggregatesResponse> => {
      const res = await fetch(`/api/stats/${leagueId}/${season}/season`);
      if (!res.ok) throw new Error('Failed to fetch seasonal aggregates');
      return res.json();
    },
    enabled: enabled && !!leagueId && !!season,
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 60 * 60 * 1000, // 1 hour
  });
};
````

### 3. Create useWeekStats Hook

Create `apps/web/src/features/stats/hooks/useWeekStats.ts`:

````typescript
import { useQuery } from '@tanstack/react-query';
import { getCurrentWeek } from '@gauntlet/lib';
import type { WeekRollupsResponse } from '@/shared/types';

export interface WeekStatsOptions {
  week?: number;
  enabled?: boolean;
}

/**
 * Fetch weekly rollup statistics for a league
 *
 * @param leagueId - League ID
 * @param season - Season year
 * @param options - Query options (week, enabled)
 * @returns Weekly rollups with loading/error states
 *
 * @example
 * ```typescript
 * const { data, isLoading } = useWeekStats('12345', '2025', { week: 5 });
 *
 * if (!data?.ok) return <ErrorMessage />;
 *
 * return <WeeklyStats rollups={data.data} />;
 * ```
 */
export const useWeekStats = <T = unknown>(
  leagueId: string,
  season: string,
  options?: WeekStatsOptions
) => {
  const { week, enabled = true } = options || {};
  const targetWeek = week ?? getCurrentWeek();

  return useQuery<WeekRollupsResponse<T>>({
    queryKey: ['rollups', leagueId, season, targetWeek],
    queryFn: async (): Promise<WeekRollupsResponse<T>> => {
      const res = await fetch(
        `/api/stats/${leagueId}/${season}/week/${targetWeek}`
      );
      if (!res.ok) throw new Error('Failed to fetch week rollups');
      return res.json();
    },
    enabled: enabled && !!leagueId && !!season,
    staleTime: 2 * 60 * 1000, // 2 minutes (more frequent for weekly data)
    gcTime: 15 * 60 * 1000, // 15 minutes
  });
};
````

### 4. Create useSuperlatives Hook

Create `apps/web/src/features/stats/hooks/useSuperlatives.ts`:

````typescript
import { useQuery } from '@tanstack/react-query';
import type { SuperlativesResponse } from '@/shared/types';

export interface SuperlativesOptions {
  category?: string;
  limit?: number;
  offset?: number;
  enabled?: boolean;
}

/**
 * Fetch season superlatives (records, best performances)
 *
 * @param leagueId - League ID
 * @param season - Season year
 * @param options - Query options (category, limit, offset, enabled)
 * @returns Superlatives with loading/error states
 *
 * @example
 * ```typescript
 * const { data, isLoading } = useSuperlatives('12345', '2025', {
 *   category: 'highest_score',
 *   limit: 10
 * });
 *
 * if (!data?.ok) return <ErrorMessage />;
 *
 * return <SuperlativesList superlatives={data.data} />;
 * ```
 */
export const useSuperlatives = <T = unknown>(
  leagueId: string,
  season: string,
  options?: SuperlativesOptions
) => {
  const { category, limit, offset, enabled = true } = options || {};

  return useQuery<SuperlativesResponse<T>>({
    queryKey: ['superlatives', leagueId, season, category, limit, offset],
    queryFn: async (): Promise<SuperlativesResponse<T>> => {
      const params = new URLSearchParams();
      if (category) params.set('category', category);
      if (limit) params.set('limit', String(limit));
      if (offset) params.set('offset', String(offset));

      const queryString = params.toString();
      const url = `/api/stats/${leagueId}/${season}/superlatives${queryString ? `?${queryString}` : ''}`;

      const res = await fetch(url);
      if (!res.ok) throw new Error('Failed to fetch superlatives');
      return res.json();
    },
    enabled: enabled && !!leagueId && !!season,
    staleTime: 15 * 60 * 1000, // 15 minutes (superlatives change less frequently)
    gcTime: 60 * 60 * 1000, // 1 hour
  });
};
````

### 5. Create Hooks Barrel Export

Create `apps/web/src/features/stats/hooks/index.ts`:

```typescript
/**
 * Stats Hub Custom Hooks
 * Data fetching hooks for statistics and analytics
 */

export { useLeagueStats } from './useLeagueStats';
export { useSeasonAggregates } from './useSeasonAggregates';
export { useWeekStats } from './useWeekStats';
export { useSuperlatives } from './useSuperlatives';

export type { LeagueStatsResult } from './useLeagueStats';
export type { SeasonAggregatesOptions } from './useSeasonAggregates';
export type { WeekStatsOptions } from './useWeekStats';
export type { SuperlativesOptions } from './useSuperlatives';
```

### 6. Add Backwards Compatibility to lib/hooks.ts

Update `apps/web/src/lib/hooks.ts` to re-export from new location:

```typescript
// Re-export stats hooks for backwards compatibility
export { useLeagueStats as useLeagueData } from '@/features/stats/hooks';
export { useSeasonAggregates } from '@/features/stats/hooks';
export { useWeekStats as useWeekRollups } from '@/features/stats/hooks';
export { useSuperlatives as useSeasonSuperlatives } from '@/features/stats/hooks';
```

### 7. Create Comprehensive Tests

Create `apps/web/src/features/stats/hooks/useLeagueStats.test.ts`:

```typescript
import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useLeagueStats } from './useLeagueStats';

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('useLeagueStats', () => {
  it('should fetch and compute team stats', async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            rosters: [
              { id: 1, owner: { display_name: 'Team 1' }, matchups: [{ points: 100 }] },
            ],
          }),
      }),
    ) as any;

    const { result } = renderHook(() => useLeagueStats(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.teamStats).toHaveLength(1);
    expect(result.current.teamStats[0].name).toBe('Team 1');
  });
});
```

Similarly create tests for `useSeasonAggregates.test.ts`,
`useWeekStats.test.ts`, and `useSuperlatives.test.ts` following the same
pattern.

### 8. Update Feature Barrel Export

Update `apps/web/src/features/stats/index.ts`:

```typescript
// Existing type exports...

// Add hook exports
export {
  useLeagueStats,
  useSeasonAggregates,
  useWeekStats,
  useSuperlatives,
  type LeagueStatsResult,
  type SeasonAggregatesOptions,
  type WeekStatsOptions,
  type SuperlativesOptions,
} from './hooks';
```

### 9. Run Tests and Verify

```bash
cd /Users/dhruv.methi/Documents/GitHub/gauntlet-website/apps/web
pnpm test hooks/useLeagueStats
pnpm test hooks/useSeasonAggregates
pnpm test hooks/useWeekStats
pnpm test hooks/useSuperlatives
pnpm tsc --noEmit
pnpm lint
```

---

## Acceptance Criteria

- [ ] 4 stats hooks created (`useLeagueStats`, `useSeasonAggregates`,
      `useWeekStats`, `useSuperlatives`)
- [ ] All hooks properly handle loading, error, and success states
- [ ] Hooks use appropriate cache strategies (2-15 min stale times)
- [ ] Backwards compatibility maintained in `lib/hooks.ts` with re-exports
- [ ] Hooks barrel export created (`features/stats/hooks/index.ts`)
- [ ] 8+ tests created across all 4 hooks
- [ ] All tests passing (100% success rate)
- [ ] TypeScript compilation passes with 0 errors
- [ ] ESLint passes with 0 new violations
- [ ] All hooks properly typed with explicit return types
- [ ] Comprehensive JSDoc added with usage examples
- [ ] `lib/hooks.ts` reduced by ~200 lines (27.5% reduction)

---

## Verification Commands

```bash
cd /Users/dhruv.methi/Documents/GitHub/gauntlet-website/apps/web

# Run all hook tests
pnpm test hooks/useLeagueStats
pnpm test hooks/useSeasonAggregates
pnpm test hooks/useWeekStats
pnpm test hooks/useSuperlatives

# Type check
pnpm tsc --noEmit

# Lint check
pnpm lint

# Full test suite
pnpm test

# Check file size reduction
wc -l src/lib/hooks.ts
# Before: 726 lines
# After: ~520 lines (200 lines removed)

# Verify backwards compatibility
grep -r "useLeagueData" src/lib/hooks.ts
grep -r "useSeasonAggregates" src/lib/hooks.ts
```

---

## Cursor Prompt (Copy-Paste Ready)

```
I'm working on WEB-HOOK-003 (Stats Hub Hooks). Please:

1. Read tasks/WEB-HOOK-003.md (full file)
2. Read apps/web/src/lib/hooks.ts (lines 41-402 only)
3. Read apps/web/src/shared/types/api.ts (lines 1-150 only)

Execute the steps exactly as specified:
- Create 4 stats hooks (useLeagueStats, useSeasonAggregates, useWeekStats, useSuperlatives)
- Create hooks barrel export
- Add backwards compatibility re-exports in lib/hooks.ts
- Create comprehensive tests for all 4 hooks
- Update feature barrel export
- Verify all acceptance criteria

Follow CODING_CONVENTIONS.MD:
- Use arrow functions only
- Add explicit return types
- Use type imports from @/shared/types
- Add comprehensive JSDoc with @example
```

---

## Related Tasks

**Blocks**: WEB-COMP-002 (TrendsView Component Splitting), WEB-COMP-004
(ScheduleAnalysis Component Splitting), WEB-COMP-005 (TeamView Component
Splitting)  
**Blocked By**: WEB-EXTRACT-003 (Hooks Types), WEB-EXTRACT-004 (Stats Component
Types)  
**Related**: WEB-HOOK-001 (Manager Sorting/Filtering), WEB-HOOK-002 (Draft
Analytics Data Hook), WEB-TEST-002 (Hook Tests)

---

## Notes

### Why This Matters

- **Feature Co-location**: Stats hooks grouped with stats components/types
- **Reduced Centralization**: lib/hooks.ts becomes lighter, more maintainable
- **Testability**: Feature-specific hooks can be tested independently
- **Cache Optimization**: Different stale times for different data volatility
- **Backwards Compatibility**: Existing imports continue to work via re-exports

### Cache Strategy by Hook

- **useLeagueStats**: 5 min stale (team data changes occasionally)
- **useSeasonAggregates**: 10 min stale (season data semi-static)
- **useWeekStats**: 2 min stale (weekly data more volatile)
- **useSuperlatives**: 15 min stale (records change least frequently)

### Testing Strategy

- Mock global fetch for API calls
- Create QueryClient wrapper for React Query testing
- Test loading, success, and error states for each hook
- Verify query keys are unique and properly structured
- Test enabled/disabled option behavior

### Migration Pattern

This follows the established pattern:

1. Extract hooks to feature directory
2. Add comprehensive tests
3. Maintain backwards compatibility with re-exports
4. Gradually migrate components to use new imports

---

**Estimated Context Usage**: 400 lines read, 600 lines written, 1 hour total
