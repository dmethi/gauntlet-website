# WEB-TEST-004: Integration & E2E Tests

**Category**: TEST  
**Priority**: 🟡 HIGH  
**Status**: ✅ COMPLETED  
**Estimated Time**: 3 hours  
**Actual Time**: ~2 hours  
**Dependencies**: WEB-TEST-001, WEB-TEST-002, WEB-TEST-003

---

## Objective

Add integration tests for multi-league system interactions and critical user
flows. Ensure that the two-league system (AFC + NFC) works correctly when
processing data together and that key user journeys work end-to-end.

---

## Context

**Multi-League System**:

- Two separate Sleeper leagues: AFC (12 teams) + NFC (12 teams) = 24 teams
- Matchup IDs NOT unique across leagues (both use 1-6)
- Roster IDs only unique within a league
- Must ALWAYS process leagues separately, then combine
- Use composite keys: `${leagueId}-${rosterId}`,
  `${leagueId}-${week}-${matchupId}`

**Critical Bug Pattern**:

```typescript
// WRONG: Combines data, then groups (creates 6 groups of 4 teams)
const all = [...afcMatchups, ...nfcMatchups];
const grouped = groupBy(all, m => m.matchup_id);

// CORRECT: Process separately, then combine
const afcResults = processLeague(afcMatchups);
const nfcResults = processLeague(nfcMatchups);
const combined = [...afcResults, ...nfcResults];
```

---

## Integration Test Strategy

### 1. Multi-League Data Processing (60 min)

Test that all data processing correctly handles two leagues:

**Critical Areas**:

- Stats aggregation across leagues
- Matchup grouping by league
- Roster lookups
- Rankings and comparisons
- Historical data queries

### 2. API Route Integration (45 min)

Test API routes with multi-league data:

**Key Routes**:

- `/api/stats` - League-wide statistics
- `/api/matchups/[leagueId]/[week]` - Matchup data
- `/api/draft/analysis` - Draft analytics
- `/api/transactions` - Transaction processing

### 3. User Flow Tests (45 min)

Test complete user journeys:

**Critical Flows**:

- View stats page → Select team → View details
- View matchups → Simulate matchup → View results
- View draft analysis → Filter managers → Sort by metric
- View transactions → Filter by manager → View details

### 4. Cache Integration (30 min)

Test caching behavior across leagues:

**Cache Scenarios**:

- Data fetched from cache when available
- Cache invalidation on new data
- Multi-league cache keys don't collide

---

## Steps

### 1. Create Multi-League Integration Tests (45 min)

**File**: `src/__tests__/integration/multi-league.test.ts`

```typescript
import { describe, it, expect, beforeAll } from 'vitest';
import {
  fetchAllLeaguesData,
  processMatchups,
  aggregateStats,
} from '@/lib/data-processing';
import { mockAfcLeague, mockNfcLeague } from '@/test/fixtures/league-data';

describe('Multi-League System Integration', () => {
  describe('Data Fetching', () => {
    it('fetches both leagues in parallel', async () => {
      const result = await fetchAllLeaguesData();

      expect(result.afc).toBeDefined();
      expect(result.nfc).toBeDefined();
      expect(result.afc.league_id).not.toBe(result.nfc.league_id);
    });

    it('maintains separate roster IDs per league', async () => {
      const result = await fetchAllLeaguesData();

      const afcRosterIds = result.afc.rosters.map(r => r.roster_id);
      const nfcRosterIds = result.nfc.rosters.map(r => r.roster_id);

      // Roster IDs can overlap between leagues
      expect(afcRosterIds).toContain(1);
      expect(nfcRosterIds).toContain(1);

      // But composite keys must be unique
      const allKeys = [
        ...result.afc.rosters.map(
          r => `${result.afc.league_id}-${r.roster_id}`
        ),
        ...result.nfc.rosters.map(
          r => `${result.nfc.league_id}-${r.roster_id}`
        ),
      ];

      const uniqueKeys = new Set(allKeys);
      expect(uniqueKeys.size).toBe(allKeys.length);
    });
  });

  describe('Matchup Processing', () => {
    it('processes each league separately', () => {
      const afcMatchups = mockAfcLeague.matchups;
      const nfcMatchups = mockNfcLeague.matchups;

      const results = processMatchups({
        afc: afcMatchups,
        nfc: nfcMatchups,
      });

      // Should have 12 matchups (6 per league)
      expect(results).toHaveLength(12);

      // Each matchup should have league context
      results.forEach(matchup => {
        expect(matchup.leagueId).toBeDefined();
        expect(['afc', 'nfc']).toContain(matchup.leagueId);
      });
    });

    it('groups matchups correctly by composite key', () => {
      const afcMatchups = [
        { matchup_id: 1, roster_id: 1, points: 100 },
        { matchup_id: 1, roster_id: 2, points: 90 },
      ];

      const nfcMatchups = [
        { matchup_id: 1, roster_id: 1, points: 110 },
        { matchup_id: 1, roster_id: 2, points: 95 },
      ];

      const results = processMatchups({
        afc: { league_id: 'afc-123', matchups: afcMatchups },
        nfc: { league_id: 'nfc-456', matchups: nfcMatchups },
      });

      // Should create 2 distinct matchup groups, not 1
      const matchupGroups = new Set(results.map(r => r.compositeId));
      expect(matchupGroups.size).toBe(2);

      // Verify composite IDs
      expect(matchupGroups.has('afc-123-1')).toBe(true);
      expect(matchupGroups.has('nfc-456-1')).toBe(true);
    });
  });

  describe('Stats Aggregation', () => {
    it('aggregates stats across both leagues', () => {
      const stats = aggregateStats({
        afc: mockAfcLeague,
        nfc: mockNfcLeague,
      });

      // Should have 24 teams total
      expect(stats.teams).toHaveLength(24);

      // Each team should have league identifier
      const afcTeams = stats.teams.filter(t => t.league === 'afc');
      const nfcTeams = stats.teams.filter(t => t.league === 'nfc');

      expect(afcTeams).toHaveLength(12);
      expect(nfcTeams).toHaveLength(12);
    });

    it('calculates league-wide rankings correctly', () => {
      const stats = aggregateStats({
        afc: mockAfcLeague,
        nfc: mockNfcLeague,
      });

      // Rankings should be 1-24, not 1-12 repeated
      const ranks = stats.teams.map(t => t.overallRank);
      const uniqueRanks = new Set(ranks);

      expect(Math.max(...ranks)).toBeLessThanOrEqual(24);
      expect(uniqueRanks.size).toBe(24); // All unique
    });

    it('preserves within-league rankings', () => {
      const stats = aggregateStats({
        afc: mockAfcLeague,
        nfc: mockNfcLeague,
      });

      const afcRanks = stats.teams
        .filter(t => t.league === 'afc')
        .map(t => t.leagueRank);

      expect(Math.max(...afcRanks)).toBe(12);
      expect(Math.min(...afcRanks)).toBe(1);
    });
  });

  describe('Edge Cases', () => {
    it('handles leagues with different week counts', () => {
      const afcWithExtraWeek = {
        ...mockAfcLeague,
        matchups: [...mockAfcLeague.matchups /* week 15 data */],
      };

      const result = aggregateStats({
        afc: afcWithExtraWeek,
        nfc: mockNfcLeague,
      });

      // Should handle gracefully
      expect(result.teams).toBeDefined();
    });

    it('handles missing data from one league', () => {
      const result = aggregateStats({
        afc: mockAfcLeague,
        nfc: { ...mockNfcLeague, matchups: [] },
      });

      // Should still process AFC data
      const afcTeams = result.teams.filter(t => t.league === 'afc');
      expect(afcTeams.length).toBeGreaterThan(0);
    });
  });
});
```

---

### 2. API Route Integration Tests (45 min)

**File**: `src/__tests__/integration/api-routes.test.ts`

```typescript
import { describe, it, expect } from 'vitest';
import { createMocks } from 'node-mocks-http';
import { GET as getStats } from '@/app/api/stats/route';
import { GET as getMatchups } from '@/app/api/matchups/[leagueId]/[week]/route';

describe('API Routes Integration', () => {
  describe('GET /api/stats', () => {
    it('returns stats for both leagues', async () => {
      const { req, res } = createMocks({ method: 'GET' });

      const response = await getStats(req);
      const data = await response.json();

      expect(data.afc).toBeDefined();
      expect(data.nfc).toBeDefined();
      expect(data.combined).toBeDefined();
    });

    it('includes composite keys for teams', async () => {
      const { req } = createMocks({ method: 'GET' });

      const response = await getStats(req);
      const data = await response.json();

      data.combined.teams.forEach(team => {
        expect(team.compositeId).toMatch(/^(afc|nfc)-\d+-\d+$/);
      });
    });
  });

  describe('GET /api/matchups/[leagueId]/[week]', () => {
    it('returns matchups for specified league', async () => {
      const { req } = createMocks({
        method: 'GET',
        params: { leagueId: 'afc', week: '5' },
      });

      const response = await getMatchups(req, {
        params: { leagueId: 'afc', week: '5' },
      });
      const data = await response.json();

      expect(data.matchups).toBeDefined();
      expect(data.matchups.every(m => m.leagueId === 'afc')).toBe(true);
    });

    it('handles invalid league ID', async () => {
      const { req } = createMocks({
        method: 'GET',
        params: { leagueId: 'invalid', week: '5' },
      });

      const response = await getMatchups(req, {
        params: { leagueId: 'invalid', week: '5' },
      });

      expect(response.status).toBe(400);
    });
  });
});
```

---

### 3. User Flow Integration Tests (45 min)

**File**: `src/__tests__/integration/user-flows.test.tsx`

```typescript
import { describe, it, expect } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import StatsPage from '@/app/stats/page';
import { mockStatsData } from '@/test/fixtures/stats-data';

describe('User Flows', () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });

  const wrapper = ({ children }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );

  describe('Stats Page Flow', () => {
    it('loads stats, selects team, views details', async () => {
      const user = userEvent.setup();

      // Mock API response
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockStatsData,
      });

      render(<StatsPage />, { wrapper });

      // Wait for data to load
      await waitFor(() => {
        expect(screen.getByText(/League View/i)).toBeInTheDocument();
      });

      // Select a team
      const teamButton = screen.getByText('Team 1');
      await user.click(teamButton);

      // Verify team details loaded
      await waitFor(() => {
        expect(screen.getByText(/Weekly Performance/i)).toBeInTheDocument();
      });

      // Verify multi-league context preserved
      expect(screen.getByText(/AFC/i)).toBeInTheDocument();
    });

    it('filters and sorts data correctly', async () => {
      const user = userEvent.setup();

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockStatsData,
      });

      render(<StatsPage />, { wrapper });

      await waitFor(() => {
        expect(screen.getByText(/League View/i)).toBeInTheDocument();
      });

      // Filter by league
      const leagueFilter = screen.getByLabelText(/Filter by league/i);
      await user.click(leagueFilter);
      await user.click(screen.getByText('AFC Only'));

      // Verify only AFC teams shown
      await waitFor(() => {
        const teams = screen.getAllByTestId('team-row');
        expect(teams.length).toBeLessThanOrEqual(12);
      });
    });
  });

  describe('Draft Analysis Flow', () => {
    it('loads managers, filters, sorts', async () => {
      // Similar to stats page but for draft analysis
    });
  });

  describe('Matchup Simulation Flow', () => {
    it('selects matchup, runs simulation, views results', async () => {
      // Test matchup simulation flow
    });
  });
});
```

---

### 4. Cache Integration Tests (30 min)

**File**: `src/__tests__/integration/caching.test.ts`

```typescript
describe('Caching Integration', () => {
  describe('Multi-League Cache Keys', () => {
    it('generates unique cache keys per league', () => {
      const afcKey = getCacheKey('matchups', { leagueId: 'afc', week: 5 });
      const nfcKey = getCacheKey('matchups', { leagueId: 'nfc', week: 5 });

      expect(afcKey).not.toBe(nfcKey);
      expect(afcKey).toContain('afc');
      expect(nfcKey).toContain('nfc');
    });

    it('includes roster IDs in composite keys', () => {
      const key = getCacheKey('roster', { leagueId: 'afc', rosterId: 1 });

      expect(key).toMatch(/afc.*1/);
    });
  });

  describe('React Query Integration', () => {
    it('caches data separately per league', async () => {
      const queryClient = new QueryClient();

      // Fetch AFC data
      await queryClient.fetchQuery({
        queryKey: ['stats', 'afc'],
        queryFn: () => fetchLeagueStats('afc'),
      });

      // Fetch NFC data
      await queryClient.fetchQuery({
        queryKey: ['stats', 'nfc'],
        queryFn: () => fetchLeagueStats('nfc'),
      });

      // Both should be cached
      const afcCache = queryClient.getQueryData(['stats', 'afc']);
      const nfcCache = queryClient.getQueryData(['stats', 'nfc']);

      expect(afcCache).toBeDefined();
      expect(nfcCache).toBeDefined();
      expect(afcCache).not.toBe(nfcCache);
    });

    it('invalidates cache correctly', async () => {
      const queryClient = new QueryClient();

      await queryClient.fetchQuery({
        queryKey: ['stats', 'afc'],
        queryFn: () => fetchLeagueStats('afc'),
      });

      // Invalidate AFC cache
      queryClient.invalidateQueries({ queryKey: ['stats', 'afc'] });

      // AFC cache should be stale
      const afcState = queryClient.getQueryState(['stats', 'afc']);
      expect(afcState?.isInvalidated).toBe(true);
    });
  });
});
```

---

### 5. Data Flow Integration Tests (30 min)

**File**: `src/__tests__/integration/data-flow.test.ts`

```typescript
describe('Data Flow Integration', () => {
  describe('Sleeper API → Cache → Component', () => {
    it('flows data correctly through the stack', async () => {
      // 1. Mock Sleeper API
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockSleeperData,
      });

      // 2. Fetch via unified client
      const client = createSleeperClient();
      const data = await client.getLeague('123');

      expect(data).toBeDefined();

      // 3. Verify React Query caches it
      const queryClient = new QueryClient();
      await queryClient.fetchQuery({
        queryKey: ['league', '123'],
        queryFn: () => client.getLeague('123'),
      });

      const cached = queryClient.getQueryData(['league', '123']);
      expect(cached).toBeDefined();

      // 4. Verify component receives it
      const { result } = renderHook(
        () => useLeague('123'),
        {
          wrapper: ({ children }) => (
            <QueryClientProvider client={queryClient}>
              {children}
            </QueryClientProvider>
          ),
        },
      );

      await waitFor(() => {
        expect(result.current.data).toBeDefined();
      });
    });
  });

  describe('Multi-League Data Combination', () => {
    it('combines data from both leagues correctly', async () => {
      // Mock both APIs
      global.fetch = vi.fn()
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockAfcData,
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockNfcData,
        });

      // Fetch both leagues
      const client = createSleeperClient();
      const [afc, nfc] = await Promise.all([
        client.getLeague('afc-id'),
        client.getLeague('nfc-id'),
      ]);

      // Combine
      const combined = combineLeagueData({ afc, nfc });

      expect(combined.teams).toHaveLength(24);
      expect(combined.teams.every(t => t.compositeId)).toBe(true);
    });
  });
});
```

---

## Acceptance Criteria

### Multi-League Tests

- [ ] All multi-league processing tested
- [ ] Composite key generation verified
- [ ] League separation maintained
- [ ] Cross-league comparisons work
- [ ] Edge cases handled (missing data, mismatched weeks)

### API Integration Tests

- [ ] All critical API routes tested
- [ ] Request/response flow verified
- [ ] Error handling tested
- [ ] Multi-league queries work

### User Flow Tests

- [ ] At least 3 complete user journeys tested
- [ ] Data loading verified
- [ ] User interactions work
- [ ] State management correct

### Cache Tests

- [ ] Cache key generation tested
- [ ] Cache invalidation works
- [ ] No cache collisions
- [ ] React Query integration verified

### Build Status

- [ ] All tests pass: `pnpm test`
- [ ] Integration tests isolated (don't pollute unit tests)
- [ ] Tests run in reasonable time (<30 seconds)
- [ ] TypeScript compilation passes

---

## Testing Patterns

### Multi-League Test Pattern

```typescript
describe('Multi-League Feature', () => {
  it('processes leagues separately', () => {
    const afcResult = processLeague(afcData);
    const nfcResult = processLeague(nfcData);
    const combined = [...afcResult, ...nfcResult];

    // Verify separation maintained
    expect(combined.every(item => item.leagueId)).toBe(true);

    // Verify composite keys unique
    const keys = combined.map(item => item.compositeId);
    expect(new Set(keys).size).toBe(keys.length);
  });
});
```

### API Route Test Pattern

```typescript
describe('API Route', () => {
  it('returns expected data', async () => {
    const { req } = createMocks({
      method: 'GET',
      query: { leagueId: 'afc', week: '5' },
    });

    const response = await routeHandler(req);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toMatchObject({
      success: true,
      data: expect.any(Array),
    });
  });
});
```

---

## Verification Commands

```bash
cd /Users/dhruv.methi/Documents/GitHub/gauntlet-website/apps/web

# Run all integration tests
pnpm test __tests__/integration

# Run specific integration test
pnpm test multi-league.test.ts

# Run with coverage
pnpm test:coverage __tests__/integration

# Watch mode
pnpm test:watch __tests__/integration
```

---

## Cursor Prompt (Copy-Paste Ready)

```
I'm working on WEB-TEST-004: Integration & E2E Tests.

Please:
1. Read the task file at tasks/WEB-TEST-004.md
2. Start with multi-league integration tests (Step 1)
3. Focus on testing that our two-league system (AFC + NFC) processes data correctly
4. Verify that composite keys are used correctly
5. Test that matchup IDs don't collide across leagues
6. Add API route tests for critical endpoints

CRITICAL: Test the multi-league bug pattern shown in the task file.
Ensure we never group by matchup_id alone without including leagueId.
```

---

## Related Tasks

**Blocks**: Future E2E test implementation  
**Blocked By**: WEB-TEST-001, WEB-TEST-002, WEB-TEST-003  
**Related**: All WEB-COMP tasks (test refactored components)

---

## Notes

### Why Integration Tests Matter

**For Multi-League System:**

- Most common bug category is multi-league data mixing
- Composite keys must be verified in integration context
- Cross-league rankings need end-to-end testing

**For User Flows:**

- Unit tests can't catch integration issues
- State management bugs appear in flows
- Data flow through multiple layers needs verification

### Test Isolation

**Keep integration tests separate:**

- Different directory: `__tests__/integration/`
- Can run independently: `pnpm test:integration`
- Longer running (exclude from watch mode)
- May need setup/teardown

### Mock Strategy

**Integration tests use:**

- ✅ Real component composition
- ✅ Real state management
- ✅ Real data flow
- ❌ Mock external APIs
- ❌ Mock databases
- ⚠️ Consider using MSW for API mocking

---

**Estimated Context Usage**: ~300 lines read, ~400 lines written, 3 hours total

**Success Metric**: All critical multi-league scenarios tested, all user flows
verified, no regressions in league data handling
