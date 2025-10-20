import { beforeEach, describe, expect, it, vi } from 'vitest';
import { QueryClient } from '@tanstack/react-query';

/**
 * Integration Tests: Caching
 *
 * Tests that caching mechanisms correctly handle multi-league data:
 * - Cache keys include league context
 * - No cache collisions between leagues
 * - React Query integration works correctly
 */

describe('Caching Integration', () => {
  describe('Cache Key Generation', () => {
    it('generates unique cache keys per league for matchups', () => {
      const getCacheKey = (resource: string, params: Record<string, unknown>) => {
        return [resource, ...Object.entries(params).map(([k, v]) => `${k}:${v}`)].join('-');
      };

      const afcKey = getCacheKey('matchups', { leagueId: 'afc-123', week: 5 });
      const nfcKey = getCacheKey('matchups', { leagueId: 'nfc-456', week: 5 });

      expect(afcKey).not.toBe(nfcKey);
      expect(afcKey).toContain('afc-123');
      expect(nfcKey).toContain('nfc-456');
      expect(afcKey).toContain('week:5');
      expect(nfcKey).toContain('week:5');
    });

    it('includes roster IDs in composite keys', () => {
      const getCacheKey = (resource: string, params: Record<string, unknown>) => {
        return [resource, ...Object.entries(params).map(([k, v]) => `${k}:${v}`)].join('-');
      };

      const afcKey = getCacheKey('roster', { leagueId: 'afc-123', rosterId: 1 });
      const nfcKey = getCacheKey('roster', { leagueId: 'nfc-456', rosterId: 1 });

      expect(afcKey).toMatch(/afc-123.*1/);
      expect(nfcKey).toMatch(/nfc-456.*1/);
      expect(afcKey).not.toBe(nfcKey);
    });

    it('prevents collisions between similar queries', () => {
      const getCacheKey = (resource: string, params: Record<string, unknown>) => {
        // Convert params to sorted array to ensure consistent ordering
        const sortedParams = Object.entries(params)
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([k, v]) => `${k}:${v}`);
        return [resource, ...sortedParams].join('-');
      };

      const keys = [
        getCacheKey('matchups', { leagueId: 'afc-123', week: 5 }),
        getCacheKey('matchups', { leagueId: 'afc-123', week: 6 }),
        getCacheKey('matchups', { leagueId: 'nfc-456', week: 5 }),
        getCacheKey('matchups', { leagueId: 'nfc-456', week: 6 }),
      ];

      // All keys should be unique
      const uniqueKeys = new Set(keys);
      expect(uniqueKeys.size).toBe(keys.length);
    });
  });

  describe('React Query Integration', () => {
    let queryClient: QueryClient;

    beforeEach(() => {
      queryClient = new QueryClient({
        defaultOptions: {
          queries: {
            retry: false,
            gcTime: 0, // Disable cache garbage collection for tests
          },
        },
      });
    });

    it('caches data separately per league', async () => {
      const fetchLeagueStats = async (leagueId: string) => ({
        leagueId,
        totalPoints: 1000,
        averagePoints: 100,
      });

      // Fetch AFC data
      await queryClient.fetchQuery({
        queryKey: ['stats', 'afc-123'],
        queryFn: () => fetchLeagueStats('afc-123'),
      });

      // Fetch NFC data
      await queryClient.fetchQuery({
        queryKey: ['stats', 'nfc-456'],
        queryFn: () => fetchLeagueStats('nfc-456'),
      });

      // Both should be cached
      const afcCache = queryClient.getQueryData(['stats', 'afc-123']);
      const nfcCache = queryClient.getQueryData(['stats', 'nfc-456']);

      expect(afcCache).toBeDefined();
      expect(nfcCache).toBeDefined();
      expect(afcCache).not.toBe(nfcCache);

      // Verify correct data
      expect(afcCache).toEqual({
        leagueId: 'afc-123',
        totalPoints: 1000,
        averagePoints: 100,
      });

      expect(nfcCache).toEqual({
        leagueId: 'nfc-456',
        totalPoints: 1000,
        averagePoints: 100,
      });
    });

    it('invalidates cache correctly for specific league', async () => {
      const fetchData = async (leagueId: string) => ({ leagueId, data: 'test' });

      // Fetch both leagues
      await queryClient.fetchQuery({
        queryKey: ['stats', 'afc-123'],
        queryFn: () => fetchData('afc-123'),
      });

      await queryClient.fetchQuery({
        queryKey: ['stats', 'nfc-456'],
        queryFn: () => fetchData('nfc-456'),
      });

      // Invalidate only AFC cache
      queryClient.invalidateQueries({ queryKey: ['stats', 'afc-123'] });

      // AFC cache should be invalidated
      const afcState = queryClient.getQueryState(['stats', 'afc-123']);
      expect(afcState?.isInvalidated).toBe(true);

      // NFC cache should NOT be invalidated
      const nfcState = queryClient.getQueryState(['stats', 'nfc-456']);
      expect(nfcState?.isInvalidated).toBe(false);
    });

    it('handles parallel queries for both leagues', async () => {
      const fetchLeague = async (leagueId: string) => {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 10));
        return { leagueId, name: `League ${leagueId}` };
      };

      // Fetch both leagues in parallel
      const [afcData, nfcData] = await Promise.all([
        queryClient.fetchQuery({
          queryKey: ['league', 'afc-123'],
          queryFn: () => fetchLeague('afc-123'),
        }),
        queryClient.fetchQuery({
          queryKey: ['league', 'nfc-456'],
          queryFn: () => fetchLeague('nfc-456'),
        }),
      ]);

      expect(afcData.leagueId).toBe('afc-123');
      expect(nfcData.leagueId).toBe('nfc-456');

      // Both should be cached
      const afcCache = queryClient.getQueryData(['league', 'afc-123']);
      const nfcCache = queryClient.getQueryData(['league', 'nfc-456']);

      expect(afcCache).toBeDefined();
      expect(nfcCache).toBeDefined();
    });

    it('supports nested query keys with league context', async () => {
      const fetchMatchups = async (leagueId: string, week: number) => ({
        leagueId,
        week,
        matchups: [],
      });

      // Fetch week 5 for both leagues
      await Promise.all([
        queryClient.fetchQuery({
          queryKey: ['matchups', { leagueId: 'afc-123', week: 5 }],
          queryFn: () => fetchMatchups('afc-123', 5),
        }),
        queryClient.fetchQuery({
          queryKey: ['matchups', { leagueId: 'nfc-456', week: 5 }],
          queryFn: () => fetchMatchups('nfc-456', 5),
        }),
      ]);

      // Both should be cached with different keys
      const afcCache = queryClient.getQueryData(['matchups', { leagueId: 'afc-123', week: 5 }]);
      const nfcCache = queryClient.getQueryData(['matchups', { leagueId: 'nfc-456', week: 5 }]);

      expect(afcCache).toBeDefined();
      expect(nfcCache).toBeDefined();
      expect(afcCache).not.toBe(nfcCache);
    });

    it('invalidates all league queries with wildcard', async () => {
      const fetchData = async (leagueId: string) => ({ leagueId });

      // Fetch data for multiple queries
      await Promise.all([
        queryClient.fetchQuery({
          queryKey: ['stats', 'afc-123'],
          queryFn: () => fetchData('afc-123'),
        }),
        queryClient.fetchQuery({
          queryKey: ['stats', 'nfc-456'],
          queryFn: () => fetchData('nfc-456'),
        }),
        queryClient.fetchQuery({
          queryKey: ['matchups', 'afc-123', 5],
          queryFn: () => fetchData('afc-123'),
        }),
      ]);

      // Invalidate all stats queries
      queryClient.invalidateQueries({ queryKey: ['stats'] });

      // Stats queries should be invalidated
      const afcStatsState = queryClient.getQueryState(['stats', 'afc-123']);
      const nfcStatsState = queryClient.getQueryState(['stats', 'nfc-456']);

      expect(afcStatsState?.isInvalidated).toBe(true);
      expect(nfcStatsState?.isInvalidated).toBe(true);

      // Matchups query should NOT be invalidated
      const matchupsState = queryClient.getQueryState(['matchups', 'afc-123', 5]);
      expect(matchupsState?.isInvalidated).toBe(false);
    });
  });

  describe('Cache Key Patterns', () => {
    it('uses array-based keys for React Query', () => {
      // Recommended React Query pattern
      const createQueryKey = (
        resource: string,
        params: Record<string, string | number>,
      ): (string | Record<string, string | number>)[] => {
        return [resource, params];
      };

      const afcKey = createQueryKey('matchups', { leagueId: 'afc-123', week: 5 });
      const nfcKey = createQueryKey('matchups', { leagueId: 'nfc-456', week: 5 });

      expect(afcKey).toEqual(['matchups', { leagueId: 'afc-123', week: 5 }]);
      expect(nfcKey).toEqual(['matchups', { leagueId: 'nfc-456', week: 5 }]);

      // Keys should be structurally different
      expect(JSON.stringify(afcKey)).not.toBe(JSON.stringify(nfcKey));
    });

    it('maintains consistent key ordering', () => {
      const createQueryKey = (resource: string, params: Record<string, unknown>) => {
        // Sort params to ensure consistency
        const sortedParams = Object.keys(params)
          .sort()
          .reduce(
            (acc, key) => {
              acc[key] = params[key];
              return acc;
            },
            {} as Record<string, unknown>,
          );
        return [resource, sortedParams];
      };

      const key1 = createQueryKey('matchups', { week: 5, leagueId: 'afc-123' });
      const key2 = createQueryKey('matchups', { leagueId: 'afc-123', week: 5 });

      // Keys should be identical regardless of parameter order
      expect(JSON.stringify(key1)).toBe(JSON.stringify(key2));
    });
  });

  describe('Multi-League Cache Scenarios', () => {
    let queryClient: QueryClient;

    beforeEach(() => {
      queryClient = new QueryClient({
        defaultOptions: {
          queries: { retry: false, gcTime: 0 },
        },
      });
    });

    it('handles roster lookups across leagues', async () => {
      const fetchRoster = async (leagueId: string, rosterId: number) => ({
        league_id: leagueId,
        roster_id: rosterId,
        owner_id: `${leagueId}-user-${rosterId}`,
      });

      // Fetch roster 1 from both leagues
      const [afcRoster, nfcRoster] = await Promise.all([
        queryClient.fetchQuery({
          queryKey: ['roster', { leagueId: 'afc-123', rosterId: 1 }],
          queryFn: () => fetchRoster('afc-123', 1),
        }),
        queryClient.fetchQuery({
          queryKey: ['roster', { leagueId: 'nfc-456', rosterId: 1 }],
          queryFn: () => fetchRoster('nfc-456', 1),
        }),
      ]);

      // Both rosters have ID 1, but should be cached separately
      expect(afcRoster.roster_id).toBe(1);
      expect(nfcRoster.roster_id).toBe(1);
      expect(afcRoster.league_id).not.toBe(nfcRoster.league_id);

      // Verify separate caches
      const afcCache = queryClient.getQueryData(['roster', { leagueId: 'afc-123', rosterId: 1 }]);
      const nfcCache = queryClient.getQueryData(['roster', { leagueId: 'nfc-456', rosterId: 1 }]);

      expect(afcCache).toBeDefined();
      expect(nfcCache).toBeDefined();
      expect(afcCache).not.toEqual(nfcCache);
    });

    it('handles weekly data for both leagues', async () => {
      const fetchWeekData = async (leagueId: string, week: number) => ({
        leagueId,
        week,
        timestamp: Date.now(),
      });

      // Fetch week 5 for both leagues
      await Promise.all([
        queryClient.fetchQuery({
          queryKey: ['week', 'afc-123', 5],
          queryFn: () => fetchWeekData('afc-123', 5),
        }),
        queryClient.fetchQuery({
          queryKey: ['week', 'nfc-456', 5],
          queryFn: () => fetchWeekData('nfc-456', 5),
        }),
      ]);

      // Invalidate week 5 for AFC only
      queryClient.invalidateQueries({ queryKey: ['week', 'afc-123', 5] });

      const afcState = queryClient.getQueryState(['week', 'afc-123', 5]);
      const nfcState = queryClient.getQueryState(['week', 'nfc-456', 5]);

      expect(afcState?.isInvalidated).toBe(true);
      expect(nfcState?.isInvalidated).toBe(false);
    });

    it('prevents stale data across leagues', async () => {
      let afcCallCount = 0;
      let nfcCallCount = 0;

      const fetchLeagueData = async (leagueId: string) => {
        if (leagueId === 'afc-123') afcCallCount++;
        if (leagueId === 'nfc-456') nfcCallCount++;
        return { leagueId, timestamp: Date.now() };
      };

      // Initial fetch
      await Promise.all([
        queryClient.fetchQuery({
          queryKey: ['data', 'afc-123'],
          queryFn: () => fetchLeagueData('afc-123'),
        }),
        queryClient.fetchQuery({
          queryKey: ['data', 'nfc-456'],
          queryFn: () => fetchLeagueData('nfc-456'),
        }),
      ]);

      expect(afcCallCount).toBe(1);
      expect(nfcCallCount).toBe(1);

      // Invalidate AFC only
      queryClient.invalidateQueries({ queryKey: ['data', 'afc-123'] });

      // Refetch AFC
      await queryClient.fetchQuery({
        queryKey: ['data', 'afc-123'],
        queryFn: () => fetchLeagueData('afc-123'),
      });

      // AFC should have been fetched twice, NFC only once
      expect(afcCallCount).toBe(2);
      expect(nfcCallCount).toBe(1);
    });
  });
});
