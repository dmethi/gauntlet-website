# TanStack Query Migration Analysis

> **Status**: Proposal  
> **Date**: October 2025  
> **Decision**: Pending Review

## Executive Summary

This document analyzes potential migration strategies from manual data fetching patterns to full TanStack Query adoption in the Gauntlet web app. **Key finding: The repo already has TanStack Query installed but is underutilizing it.** Migration recommendation is **Scenario A: Full TanStack Query adoption** with ~12-16 hour effort for significant UX and DX improvements.

---

## Current State Analysis

### What We Have Now

**✅ Infrastructure Already in Place:**
- TanStack Query v5.83.0 installed (`@tanstack/react-query`)
- QueryClient provider configured in `src/components/providers.tsx`
- Custom query hooks started in `src/hooks/useSleeper.ts`
- Query devtools configured for development

**⚠️ Mixed Data Fetching Patterns:**

| Pattern | Files | % of Pages |
|---------|-------|-----------|
| Manual `useEffect` + `fetch` + `useState` | 8+ pages | ~60% |
| TanStack Query hooks | 2 pages | ~15% |
| Server Components (async) | 0 pages | 0% |
| API Routes + Client fetching | All pages | 100% |

### Pattern Breakdown

#### Pattern 1: Manual Client Fetching (Most Common)

Found in:
- `apps/web/src/app/stats/page.tsx`
- `apps/web/src/app/start-sit/page.tsx`
- `apps/web/src/app/draft/analysis/page.tsx`
- `apps/web/src/app/matchups/[leagueId]/[week]/[matchupId]/page.tsx`
- `apps/web/src/app/team/[id]/page.tsx`

```typescript
'use client';

const [data, setData] = useState(null);
const [loading, setLoading] = useState(true);
const [error, setError] = useState(null);

useEffect(() => {
  const loadData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/stats');
      const result = await response.json();
      setData(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  loadData();
}, []);
```

**Problems:**
- Manual loading/error state management (boilerplate)
- No retry logic
- No caching (some pages roll their own sessionStorage)
- No request deduplication
- No stale-while-revalidate
- No prefetching

#### Pattern 2: TanStack Query (Underutilized)

Found in:
- `apps/web/src/app/competition/reports/page.tsx`
- `apps/web/src/app/competition/page.tsx`

```typescript
'use client';

const { data, isLoading, error } = useQuery({
  queryKey: ['reports'],
  queryFn: fetchReports,
});
```

**This is the pattern we should expand to all pages.**

#### Pattern 3: Server Components (Not Used)

No async server components found fetching data. All pages are `'use client'` directives.

---

## Migration Scenarios

### Scenario A: Full TanStack Query Adoption ⭐ **RECOMMENDED**

**Description**: Convert all manual `useEffect` + `fetch` patterns to TanStack Query hooks. Keep pages as client components.

**Effort**: 12-16 hours  
**Risk**: Low (minimal breaking changes)  
**Value**: High (better UX, simpler code)

#### What Changes

**Phase 1: Expand Query Hooks** (4 hours)

Create centralized hooks in `apps/web/src/hooks/useSleeperQueries.ts`:

```typescript
// Standardized query strategies
export const QUERY_STRATEGIES = {
  // Static data (draft, players)
  static: {
    staleTime: 60 * 60 * 1000, // 1 hour
    gcTime: 24 * 60 * 60 * 1000, // 24 hours
    refetchOnMount: false,
  },
  
  // Semi-dynamic (rosters, standings)
  dynamic: {
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
    refetchOnMount: 'always' as const,
  },
  
  // Real-time (live scores, matchups)
  realtime: {
    staleTime: 10 * 1000, // 10 seconds
    refetchInterval: 30 * 1000, // Auto-refresh every 30s
  },
  
  // Expensive computations (start/sit, simulations)
  expensive: {
    staleTime: 30 * 60 * 1000, // 30 minutes
    gcTime: 60 * 60 * 1000, // 1 hour
    refetchOnMount: false, // Show stale data, don't block
  },
};

// New hooks to create
export const useStats = () => {
  return useQuery({
    queryKey: ['stats'],
    queryFn: () => fetch('/api/stats').then(r => r.json()),
    ...QUERY_STRATEGIES.dynamic,
  });
};

export const useStartSitEfficiency = () => {
  return useQuery({
    queryKey: ['start-sit-efficiency'],
    queryFn: () => fetch('/api/start-sit-efficiency').then(r => r.json()),
    ...QUERY_STRATEGIES.expensive,
  });
};

export const useDraftAnalysis = () => {
  return useQuery({
    queryKey: ['draft-analysis'],
    queryFn: async () => {
      // Keep precomputed data optimization
      const precomputed = await getPrecomputedDrafts();
      if (precomputed) return precomputed;
      
      return fetch('/api/draft-analysis').then(r => r.json());
    },
    ...QUERY_STRATEGIES.static,
  });
};

export const useMatchupDetail = (leagueId: string, week: number, matchupId: number) => {
  return useQuery({
    queryKey: ['matchup-detail', leagueId, week, matchupId],
    queryFn: () => fetch(`/api/matchups/${leagueId}/${week}/${matchupId}`).then(r => r.json()),
    ...QUERY_STRATEGIES.dynamic,
  });
};
```

**Phase 2: Migrate Pages** (6-8 hours)

Convert each page:

```typescript
// BEFORE: apps/web/src/app/stats/page.tsx
'use client';

export default function StatsPage() {
  const [dataset, setDataset] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/stats');
        const data = await response.json();
        setDataset(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);
  
  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;
  
  return <StatsContent data={dataset} />;
}

// AFTER: Much simpler
'use client';

import { useStats } from '@/hooks/useSleeperQueries';

export default function StatsPage() {
  const { data, isLoading, error } = useStats();
  
  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;
  
  return <StatsContent data={data} />;
}
```

**Phase 3: Add Advanced Features** (2-4 hours)

Enable power features:

```typescript
// Prefetching on hover
export const MatchupCard = ({ matchup }) => {
  const queryClient = useQueryClient();
  
  const handleHover = () => {
    queryClient.prefetchQuery({
      queryKey: ['matchup-detail', matchup.leagueId, matchup.week, matchup.id],
      queryFn: () => fetch(`/api/matchups/${matchup.leagueId}/${matchup.week}/${matchup.id}`).then(r => r.json()),
    });
  };
  
  return <Card onMouseEnter={handleHover}>...</Card>;
};

// Optimistic updates for mutations
export const useUpdateRoster = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (update) => fetch('/api/roster/update', {
      method: 'POST',
      body: JSON.stringify(update),
    }).then(r => r.json()),
    
    onMutate: async (update) => {
      // Cancel outgoing queries
      await queryClient.cancelQueries({ queryKey: ['roster'] });
      
      // Snapshot previous value
      const previous = queryClient.getQueryData(['roster']);
      
      // Optimistically update
      queryClient.setQueryData(['roster'], (old) => ({
        ...old,
        ...update,
      }));
      
      return { previous };
    },
    
    onError: (err, update, context) => {
      // Rollback on error
      queryClient.setQueryData(['roster'], context.previous);
    },
    
    onSettled: () => {
      // Refetch after success or failure
      queryClient.invalidateQueries({ queryKey: ['roster'] });
    },
  });
};

// Real-time updates for live scores
export const useLiveMatchups = (leagueId: string, week: number) => {
  return useQuery({
    queryKey: ['matchups', leagueId, week, 'live'],
    queryFn: () => fetch(`/api/matchups/${leagueId}/${week}`).then(r => r.json()),
    ...QUERY_STRATEGIES.realtime,
    // Only poll during game times
    refetchInterval: (data) => {
      const isGameTime = checkIfGameTime(data);
      return isGameTime ? 30 * 1000 : false;
    },
  });
};
```

#### Benefits

**Developer Experience:**
- ✅ Less boilerplate (remove manual loading/error/data state)
- ✅ Declarative data fetching
- ✅ Built-in retry logic (3 retries with exponential backoff)
- ✅ Query devtools for debugging
- ✅ TypeScript inference for query results

**User Experience:**
- ✅ Stale-while-revalidate (show old data while fetching new)
- ✅ Background refetching (data stays fresh)
- ✅ Request deduplication (multiple components, one request)
- ✅ Prefetching on hover (instant navigation)
- ✅ Optimistic updates (instant feedback)
- ✅ Better error handling with retry

**Performance:**
- ✅ Intelligent caching (replaces manual sessionStorage)
- ✅ Garbage collection (automatic memory management)
- ✅ Parallel queries (already doing this, but cleaner)
- ✅ Request cancellation (avoid race conditions)

**Alignment with Architecture:**
- ✅ Parallel processing pattern (multi-league processing)
- ✅ Feature-based organization (hooks in feature folders)
- ✅ Factory pattern (query configs are like factories)
- ✅ Arrow functions (hooks are arrow functions)

#### Migration Checklist

- [ ] **Phase 1: Setup**
  - [ ] Expand `useSleeperQueries.ts` with all endpoints
  - [ ] Define query strategies for each data type
  - [ ] Document query key conventions
  
- [ ] **Phase 2: Page Migration** (8 pages)
  - [ ] `apps/web/src/app/stats/page.tsx`
  - [ ] `apps/web/src/app/start-sit/page.tsx`
  - [ ] `apps/web/src/app/draft/analysis/page.tsx`
  - [ ] `apps/web/src/app/matchups/[leagueId]/[week]/[matchupId]/page.tsx`
  - [ ] `apps/web/src/app/team/[id]/page.tsx`
  - [ ] `apps/web/src/app/charts/page.tsx`
  - [ ] `apps/web/src/app/live/page.tsx`
  - [ ] `apps/web/src/app/matchup/[matchupId]/page.tsx`
  
- [ ] **Phase 3: Optimize**
  - [ ] Add prefetching for navigation (hover states)
  - [ ] Add optimistic updates for mutations
  - [ ] Tune `staleTime` based on real usage
  - [ ] Add conditional refetching (only during game time)
  - [ ] Remove manual sessionStorage caching code
  
- [ ] **Phase 4: Testing**
  - [ ] Test each migrated page
  - [ ] Verify caching behavior
  - [ ] Test error scenarios (network failures)
  - [ ] Test retry logic
  - [ ] Performance testing (compare before/after)
  
- [ ] **Phase 5: Cleanup**
  - [ ] Remove unused manual fetching utilities
  - [ ] Update documentation
  - [ ] Document query patterns in `.cursorrules`

---

### Scenario B: Full Server Components Migration ❌ **NOT RECOMMENDED**

**Description**: Convert pages to async server components that fetch data server-side, use client components only for interactivity.

**Effort**: 40-60 hours  
**Risk**: High (major refactor, breaking changes)  
**Value**: Low (doesn't fit use case)

#### Why NOT Recommended

**1. Your App is Highly Interactive**

Your pages need client-side state:
- Draft analysis: sorting, filtering, toggle switches
- Stats page: view switching, team selection, week navigation
- Matchups: real-time score updates
- Start/Sit: expensive computations that should show stale data

Server Components can't use:
- `useState`, `useEffect`, `useContext`
- Event handlers (`onClick`, `onChange`)
- Browser APIs (`localStorage`, `sessionStorage`)
- React hooks in general

You'd still need client components for everything interactive, so Server Components add complexity without benefit.

**2. Expensive Computations**

Some of your endpoints take **15-30 seconds**:
- `/api/start-sit-efficiency` (complex analysis)
- Draft analytics (multi-league processing)

Server Components would **block page rendering** while waiting:
```typescript
// This would freeze the page for 30 seconds!
export default async function StartSitPage() {
  const data = await fetch('http://localhost:3000/api/start-sit-efficiency')
    .then(r => r.json()); // User sees nothing for 30 seconds
  
  return <StartSitContent data={data} />;
}
```

TanStack Query can show stale data while recomputing in the background.

**3. Real-Time Updates**

You need real-time score updates during games:
- Live matchup scores
- Win probability updates
- Transaction notifications

Server Components require full page refreshes. TanStack Query has `refetchInterval` built-in:

```typescript
// Easy with TanStack Query
const { data } = useQuery({
  queryKey: ['live-scores'],
  queryFn: fetchScores,
  refetchInterval: 30 * 1000, // Poll every 30s during games
});

// Hard with Server Components (need manual refresh or complex streaming)
```

**4. Multi-League Parallel Processing**

Your architecture emphasizes parallel processing (AFC + NFC):

```typescript
// Current pattern (works great)
const [afcData, nfcData] = await Promise.all([
  fetch('/api/leagues/afc'),
  fetch('/api/leagues/nfc'),
]);

// Server Components serialize this on the server
// TanStack Query can parallelize on the client
```

**5. Current Architecture**

All your pages already have `'use client'` directives. You'd need to:
- Split every page into server/client components
- Serialize all data across the boundary
- Manage complex data flow
- Lose access to browser APIs
- Rewrite 100+ components

#### What It Would Look Like (If You Insisted)

```typescript
// apps/web/src/app/stats/page.tsx

// Server Component (can't use hooks, interactivity)
export default async function StatsPage() {
  // Fetch on server
  const stats = await fetch('http://localhost:3000/api/stats', {
    cache: 'no-store', // or next: { revalidate: 300 }
  }).then(r => r.json());
  
  // Must pass to client component for any interactivity
  return <StatsClientContent initialData={stats} />;
}

// apps/web/src/app/stats/stats-client-content.tsx

// Client Component (needed for ALL your interactive features)
'use client';

export const StatsClientContent = ({ initialData }) => {
  const [view, setView] = useState('team'); // ✅ Now you can use hooks
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [week, setWeek] = useState(1);
  
  // But now you need TanStack Query ANYWAY for updates!
  const { data } = useQuery({
    queryKey: ['stats', view, selectedTeam, week],
    queryFn: fetchStats,
    initialData, // Use server data only once
  });
  
  // All your interactive logic
  return (
    <div>
      <TabSelector value={view} onChange={setView} />
      <TeamSelector value={selectedTeam} onChange={setSelectedTeam} />
      <StatsTable data={data} />
    </div>
  );
};
```

**You'd end up with:**
- Server Components doing the initial fetch
- Client Components doing everything else
- TanStack Query needed anyway for updates
- More complexity, minimal benefit

#### When Server Components WOULD Make Sense

Consider them if you add:
- **Blog/content pages** - static, SEO-critical, no interactivity
- **Public profiles** - mostly static, occasional updates
- **Marketing pages** - pure content, no app logic
- **Admin dashboards** - less interactivity, more data display

For your current **interactive, real-time fantasy football dashboard**, Server Components are the wrong tool.

---

### Scenario C: Strategic Hybrid 🤔 **ALTERNATIVE**

**Description**: Use Server Components for initial SSR, then TanStack Query for client-side updates.

**Effort**: 16-24 hours  
**Risk**: Medium (added complexity)  
**Value**: Medium (marginal SEO/performance gains)

#### What It Looks Like

```typescript
// Server Component - initial page load
export default async function StatsPage() {
  // Server-side fetch for SEO and initial render
  const initialStats = await fetch('http://localhost:3000/api/stats', {
    next: { revalidate: 300 }, // Cache for 5 minutes
  }).then(r => r.json());
  
  return <StatsClientWrapper initialData={initialStats} />;
}

// Client Component - hydration and updates
'use client';
const StatsClientWrapper = ({ initialData }) => {
  const { data } = useQuery({
    queryKey: ['stats'],
    queryFn: fetchStats,
    initialData, // Use server data as starting point
    staleTime: 5 * 60 * 1000,
  });
  
  return <StatsContent data={data} />;
};
```

#### Benefits Over Scenario A

- ✅ Faster First Contentful Paint (FCP)
- ✅ Better SEO (fully rendered HTML)
- ✅ Works without JavaScript (progressive enhancement)

#### Downsides

- ❌ More complex data flow (server → client boundary)
- ❌ Need to duplicate fetch logic (server fetch + client fetch)
- ❌ Serialization overhead (server data → JSON → client)
- ❌ Harder to debug (two rendering environments)
- ❌ Marginal SEO benefit (fantasy football dashboard not SEO-critical)

#### Recommendation

**Only pursue if:**
1. SEO becomes critical (e.g., public league pages)
2. You target slow devices (server compute faster than client)
3. You need to reduce client JS bundle significantly

**Otherwise, stick with Scenario A** - simpler and fits your use case better.

---

## Comparison Matrix

| Factor | Current State | Scenario A<br/>(TanStack Query) | Scenario B<br/>(Server Components) | Scenario C<br/>(Hybrid) |
|--------|--------------|------------------|---------------------|-----------------|
| **Effort** | - | 12-16 hours | 40-60 hours | 16-24 hours |
| **Risk** | - | Low | High | Medium |
| **Code Simplicity** | ⚠️ Mixed | ✅ Consistent | ❌ Complex | ⚠️ More complex |
| **Real-time Updates** | ⚠️ Manual | ✅ Built-in | ❌ Hard | ✅ Built-in |
| **Caching** | ⚠️ Manual | ✅ Automatic | ⚠️ Manual | ✅ Automatic |
| **Error Handling** | ⚠️ Manual | ✅ Built-in | ⚠️ Manual | ✅ Built-in |
| **Loading States** | ⚠️ Manual | ✅ Built-in | ⚠️ Manual | ✅ Built-in |
| **Prefetching** | ❌ None | ✅ Easy | ❌ Hard | ✅ Easy |
| **Optimistic Updates** | ❌ None | ✅ Easy | ❌ N/A | ✅ Easy |
| **Initial Page Load** | ⚠️ Slower | ⚠️ Slower | ✅ Faster | ✅ Faster |
| **SEO** | ✅ Good | ✅ Good | ✅ Best | ✅ Best |
| **Interactivity** | ✅ Full | ✅ Full | ⚠️ Split | ⚠️ Split |
| **Expensive Ops** | ⚠️ Blocks | ✅ Background | ❌ Blocks | ✅ Background |
| **Multi-League** | ✅ Parallel | ✅ Parallel | ⚠️ Sequential | ✅ Parallel |
| **Fits Architecture** | ⚠️ | ✅ | ❌ | ⚠️ |

---

## Recommendation: Scenario A

**Adopt TanStack Query fully across all pages.**

### Why

1. **Maximizes existing investment** - already installed and configured
2. **Lowest risk** - incremental migration, easy rollback
3. **Best fit for use case** - interactive, real-time, expensive computations
4. **Quick wins** - immediate UX improvements
5. **Aligns with architecture** - parallel processing, feature-based, arrow functions
6. **Proven pattern** - already working in 2 pages

### Expected Outcomes

**Before:**
- 8+ pages with manual `useEffect` + `fetch` + `useState`
- Manual caching with sessionStorage
- No retry logic
- No request deduplication
- No prefetching
- No optimistic updates

**After:**
- All pages using consistent query hooks
- Automatic caching with TanStack Query
- Built-in retry with exponential backoff
- Request deduplication across components
- Prefetching on hover
- Optimistic updates for mutations
- Better loading states (stale-while-revalidate)

**Metrics to Track:**
- Lines of code removed (boilerplate)
- Time to interactive (should improve with prefetching)
- Cache hit rate (query devtools)
- User-reported loading perception (stale data helps)

---

## Next Steps

### Immediate (Pre-Migration)

1. **Review this document** with team
2. **Decide on scenario** (recommend A)
3. **Prioritize pages** for migration (start with highest traffic)
4. **Set up monitoring** (query devtools, performance metrics)

### Phase 1: Foundation (Week 1)

- [ ] Expand `apps/web/src/hooks/useSleeperQueries.ts`
- [ ] Document query key conventions
- [ ] Create query strategy configs
- [ ] Write migration guide for team

### Phase 2: Migration (Week 2-3)

- [ ] Migrate 2-3 pages per day
- [ ] Test each page thoroughly
- [ ] Monitor for regressions
- [ ] Gather feedback

### Phase 3: Optimization (Week 4)

- [ ] Add prefetching
- [ ] Add optimistic updates
- [ ] Tune cache strategies
- [ ] Remove old manual fetching code

### Phase 4: Documentation (Week 5)

- [ ] Update `.cursorrules` with query patterns
- [ ] Document query strategies in architecture docs
- [ ] Create runbook for common patterns
- [ ] Share learnings with team

---

## Open Questions

1. **Performance**: What's the acceptable cache duration for each endpoint?
2. **Real-time**: Should we use polling, SSE, or WebSockets for live scores?
3. **Testing**: How do we test TanStack Query patterns (MSW, mock queries)?
4. **Monitoring**: What metrics should we track for query performance?
5. **Error Recovery**: What's the retry strategy for critical vs. non-critical queries?

---

## References

- [TanStack Query Docs](https://tanstack.com/query/latest/docs/react/overview)
- [Next.js 14 Data Fetching](https://nextjs.org/docs/app/building-your-application/data-fetching)
- [Current Provider Setup](../apps/web/src/components/providers.tsx)
- [Current Query Hooks](../apps/web/src/hooks/useSleeper.ts)
- [Architecture Docs](./ARCHITECTURE.md)

---

**Document Version**: 1.0  
**Last Updated**: October 23, 2025  
**Owner**: Engineering Team  
**Status**: Awaiting Decision

