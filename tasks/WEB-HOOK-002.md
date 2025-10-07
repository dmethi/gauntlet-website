# WEB-HOOK-002: Draft Analytics Data Hook

**Category**: HOOK  
**Priority**: 🟡 MEDIUM  
**Estimated Time**: 45 min  
**Dependencies**: WEB-UTIL-003, WEB-EXTRACT-002, WEB-EXTRACT-011

---

## Objective

Extract React Query data fetching logic for draft analytics from pages into a reusable custom hook: `useDraftAnalytics`. This hook will encapsulate API calls, data processing with `generateManagerAnalytics`, loading states, and error handling, making draft analysis pages cleaner and more maintainable.

---

## Context Needed

**Read these files** (with specific line ranges):

1. `apps/web/src/app/draft/analysis/page.tsx` (lines 1-100) - Data fetching pattern
2. `apps/web/src/lib/manager-analytics.ts` (lines 52-60) - generateManagerAnalytics function signature
3. `apps/web/src/features/draft-analysis/types.ts` (ManagerAnalytics type)

**Total Context**: ~150 lines

---

## Steps

### 1. Create useDraftAnalytics Hook

Create `apps/web/src/features/draft-analysis/hooks/useDraftAnalytics.ts`:

```typescript
import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { generateManagerAnalytics } from '@/lib/manager-analytics';
import type { ManagerAnalytics } from '../types';
import type { MockDraft } from '@/lib/draft-generator';

export interface DraftAnalyticsOptions {
  enabled?: boolean;
  staleTime?: number;
  gcTime?: number;
}

export interface DraftAnalyticsResult extends UseQueryResult<ManagerAnalytics, Error> {
  analytics: ManagerAnalytics | undefined;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => void;
}

/**
 * Custom hook for fetching and processing draft analytics data
 *
 * @param draft1 - First draft (AFC League)
 * @param draft2 - Second draft (NFC League)
 * @param options - React Query options (enabled, staleTime, gcTime)
 * @returns Draft analytics with loading/error states
 *
 * @example
 * ```typescript
 * const { analytics, isLoading, isError, error } = useDraftAnalytics(afcDraft, nfcDraft);
 *
 * if (isLoading) return <LoadingSkeleton />;
 * if (isError) return <ErrorMessage error={error} />;
 * if (!analytics) return null;
 *
 * return <ManagerAnalysis analytics={analytics} />;
 * ```
 */
export const useDraftAnalytics = (
  draft1: MockDraft | undefined,
  draft2: MockDraft | undefined,
  options: DraftAnalyticsOptions = {},
): DraftAnalyticsResult => {
  const {
    enabled = true,
    staleTime = 5 * 60 * 1000, // 5 minutes (draft data changes infrequently)
    gcTime = 30 * 60 * 1000, // 30 minutes
  } = options;

  const queryResult = useQuery<ManagerAnalytics, Error>({
    queryKey: ['draftAnalytics', draft1?.name, draft2?.name],
    queryFn: (): ManagerAnalytics => {
      if (!draft1 || !draft2) {
        throw new Error('Both drafts are required for analytics generation');
      }
      return generateManagerAnalytics(draft1, draft2);
    },
    enabled: enabled && !!draft1 && !!draft2,
    staleTime,
    gcTime,
    refetchOnWindowFocus: false, // Draft data doesn't change when window regains focus
    retry: 1, // Retry once on failure (calculation errors are usually not transient)
  });

  return {
    ...queryResult,
    analytics: queryResult.data,
    isLoading: queryResult.isLoading,
    isError: queryResult.isError,
    error: queryResult.error,
    refetch: queryResult.refetch,
  };
};
```

### 2. Update Hooks Barrel Export

Update `apps/web/src/features/draft-analysis/hooks/index.ts`:

```typescript
/**
 * Draft Analysis Custom Hooks
 * Reusable hooks for manager analysis state management
 */

export { useManagerFiltering } from './useManagerFiltering';
export { useManagerSorting } from './useManagerSorting';
export { useDraftAnalytics } from './useDraftAnalytics';

export type {
  ManagerFilterOptions,
  ManagerFilteringResult,
  SortDirection,
  SortConfig,
  ManagerSortingResult,
} from './useManagerFiltering';

export type {
  SortDirection as ManagerSortDirection,
  SortConfig as ManagerSortConfig,
} from './useManagerSorting';

export type {
  DraftAnalyticsOptions,
  DraftAnalyticsResult,
} from './useDraftAnalytics';
```

### 3. Create Comprehensive Tests

Create `apps/web/src/features/draft-analysis/hooks/useDraftAnalytics.test.ts`:

```typescript
import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useDraftAnalytics } from './useDraftAnalytics';
import type { MockDraft } from '@/lib/draft-generator';
import type { ManagerAnalytics } from '../types';

// Mock generateManagerAnalytics
vi.mock('@/lib/manager-analytics', () => ({
  generateManagerAnalytics: vi.fn((draft1, draft2) => ({
    profiles: [],
    copycatPairs: [],
    mavericks: [],
    playerInflationMap: new Map(),
    positionInflation: [],
    playerOverlap: { bestBuddies: [], nemeses: [] },
    playerLevelAnalytics: {},
  })),
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('useDraftAnalytics', () => {
  const mockDraft1: MockDraft = {
    name: 'AFC League',
    teams: [],
    totalPlayers: 0,
    totalSpent: 0,
  };

  const mockDraft2: MockDraft = {
    name: 'NFC League',
    teams: [],
    totalPlayers: 0,
    totalSpent: 0,
  };

  it('should fetch and return analytics data', async () => {
    const { result } = renderHook(() => useDraftAnalytics(mockDraft1, mockDraft2), {
      wrapper: createWrapper(),
    });

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.analytics).toBeDefined();
    expect(result.current.isError).toBe(false);
  });

  it('should handle missing drafts', async () => {
    const { result } = renderHook(() => useDraftAnalytics(undefined, undefined), {
      wrapper: createWrapper(),
    });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.analytics).toBeUndefined();
  });

  it('should respect enabled option', () => {
    const { result } = renderHook(
      () => useDraftAnalytics(mockDraft1, mockDraft2, { enabled: false }),
      { wrapper: createWrapper() },
    );

    expect(result.current.isLoading).toBe(false);
    expect(result.current.analytics).toBeUndefined();
  });

  it('should use custom staleTime', () => {
    const { result } = renderHook(
      () => useDraftAnalytics(mockDraft1, mockDraft2, { staleTime: 10000 }),
      { wrapper: createWrapper() },
    );

    // Query configuration is applied (can't directly test staleTime, but hook initializes)
    expect(result.current).toBeDefined();
  });

  it('should throw error when only one draft is provided', async () => {
    const { result } = renderHook(() => useDraftAnalytics(mockDraft1, undefined), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error?.message).toContain('Both drafts are required');
  });
});
```

### 4. Update Feature Barrel Export

Update `apps/web/src/features/draft-analysis/index.ts`:

```typescript
// Existing type exports...

// Add hook exports
export {
  useManagerFiltering,
  useManagerSorting,
  useDraftAnalytics,
  type ManagerFilterOptions,
  type ManagerFilteringResult,
  type ManagerSortingResult,
  type DraftAnalyticsOptions,
  type DraftAnalyticsResult,
  type SortDirection,
  type SortConfig,
} from './hooks';
```

### 5. Example Usage in Draft Analysis Page

Example of how pages should use the hook (for reference, don't implement unless requested):

```typescript
'use client';

import { useDraftAnalytics } from '@/features/draft-analysis/hooks';
import { ManagerAnalysis } from '@/components/manager-analysis';

const DraftAnalysisPage = () => {
  // Load draft data (existing logic)
  const draft1 = loadDraft('afc');
  const draft2 = loadDraft('nfc');

  // Use hook for analytics
  const { analytics, isLoading, isError, error } = useDraftAnalytics(draft1, draft2);

  if (isLoading) return <LoadingSkeleton />;
  if (isError) return <ErrorMessage error={error} />;
  if (!analytics) return null;

  return <ManagerAnalysis analytics={analytics} />;
};
```

### 6. Run Tests and Verify

```bash
cd /Users/dhruv.methi/Documents/GitHub/gauntlet-website/apps/web
pnpm test hooks/useDraftAnalytics
pnpm tsc --noEmit
pnpm lint
```

---

## Acceptance Criteria

- [ ] `useDraftAnalytics` hook created with React Query integration
- [ ] Hook properly handles loading, error, and success states
- [ ] Hook validates that both drafts are provided
- [ ] Hook uses appropriate cache strategy (5 min stale, 30 min gc)
- [ ] 5+ tests created covering success, error, and edge cases
- [ ] All tests passing (100% success rate)
- [ ] TypeScript compilation passes with 0 errors
- [ ] ESLint passes with 0 new violations
- [ ] Hook properly typed with explicit return type
- [ ] Comprehensive JSDoc added with usage examples

---

## Verification Commands

```bash
cd /Users/dhruv.methi/Documents/GitHub/gauntlet-website/apps/web

# Run hook tests
pnpm test hooks/useDraftAnalytics

# Type check
pnpm tsc --noEmit

# Lint check
pnpm lint

# Full test suite
pnpm test

# Verify hook exports
grep -r "useDraftAnalytics" src/features/draft-analysis/index.ts
```

---

## Cursor Prompt (Copy-Paste Ready)

```
I'm working on WEB-HOOK-002 (Draft Analytics Data Hook). Please:

1. Read tasks/WEB-HOOK-002.md (full file)
2. Read apps/web/src/app/draft/analysis/page.tsx (lines 1-100 only)
3. Read apps/web/src/lib/manager-analytics.ts (lines 52-60 only)

Execute the steps exactly as specified:
- Create useDraftAnalytics hook with React Query
- Update hooks barrel export
- Create comprehensive tests with QueryClient wrapper
- Update feature barrel export
- Verify all acceptance criteria

Follow CODING_CONVENTIONS.MD:
- Use arrow functions only
- Add explicit return types
- Use type imports from @/features/draft-analysis
- Add comprehensive JSDoc with @example
```

---

## Related Tasks

**Blocks**: WEB-PAGE-001 (Draft Analysis Pages)  
**Blocked By**: WEB-UTIL-003 (Manager Analytics Calculations), WEB-EXTRACT-002 (Manager Analytics Types), WEB-EXTRACT-011 (Draft Analytics Types)  
**Related**: WEB-HOOK-001 (Manager Sorting/Filtering), WEB-TEST-002 (Hook Tests)

---

## Notes

### Why This Matters

- **Separation of Concerns**: Data fetching separated from UI presentation
- **Reusability**: Hook can be used in multiple pages (analysis, reports, comparisons)
- **Testability**: Data fetching logic can be tested independently with mocked Query Client
- **Cache Management**: React Query handles caching, preventing redundant calculations
- **Type Safety**: Full TypeScript typing with explicit return types

### React Query Strategy

- **Stale Time**: 5 minutes (draft data changes infrequently during a session)
- **GC Time**: 30 minutes (keep in cache for navigation between pages)
- **Refetch**: Disabled on window focus (draft data doesn't change externally)
- **Retry**: 1 attempt (calculation errors are deterministic, not transient)

### Testing Strategy

- Mock `generateManagerAnalytics` to avoid heavy computation in tests
- Create QueryClient wrapper for React Query testing
- Test loading, success, and error states
- Test enabled/disabled option behavior
- Verify proper error handling for missing drafts

### Migration Pattern

This follows React Query best practices:
1. Encapsulate data fetching in custom hook
2. Return both raw query result and convenience fields
3. Provide sensible defaults for cache configuration
4. Add comprehensive tests with QueryClientProvider wrapper

---

**Estimated Context Usage**: 150 lines read, 250 lines written, 45 min total
