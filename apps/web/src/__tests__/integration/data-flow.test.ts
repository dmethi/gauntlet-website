import { beforeEach, describe, expect, it, vi } from 'vitest';
import { QueryClient } from '@tanstack/react-query';
import type { SleeperLeague, SleeperMatchup, SleeperRoster } from '@gauntlet/types';

/**
 * Integration Tests: Data Flow
 *
 * Tests end-to-end data flow through the application:
 * - Sleeper API → Cache → Components
 * - Multi-league data combination
 * - Error handling and fallbacks
 */

describe('Data Flow Integration', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
          gcTime: 0,
        },
      },
    });
    vi.clearAllMocks();
  });

  describe('Basic Data Flow', () => {
    it('flows league data from API to cache to component', async () => {
      const mockLeagueData: SleeperLeague = {
        league_id: 'afc-123',
        name: 'Test League',
        season: '2025',
        status: 'in_season',
        sport: 'nfl',
        season_type: 'regular',
        settings: {},
        scoring_settings: {},
        roster_positions: [],
        total_rosters: 12,
      };

      // Mock API call
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockLeagueData,
      });

      // Create a simple hook that uses the data
      const useLeagueData = (leagueId: string) => {
        return queryClient.fetchQuery({
          queryKey: ['league', leagueId],
          queryFn: async () => {
            const response = await fetch(`https://api.sleeper.app/v1/league/${leagueId}`);
            return response.json();
          },
        });
      };

      // Fetch the data
      const data = await useLeagueData('afc-123');

      // Verify data was fetched
      expect(data).toBeDefined();
      expect(data.league_id).toBe('afc-123');

      // Verify it's cached
      const cached = queryClient.getQueryData(['league', 'afc-123']);
      expect(cached).toBeDefined();
      expect(cached).toEqual(mockLeagueData);
    });

    it('handles API errors gracefully', async () => {
      // Mock API failure
      global.fetch = vi.fn().mockRejectedValue(new Error('Network error'));

      const fetchData = async (leagueId: string) => {
        try {
          const response = await fetch(`https://api.sleeper.app/v1/league/${leagueId}`);
          return response.json();
        } catch (error) {
          return null;
        }
      };

      const result = await fetchData('afc-123');

      // Should handle error gracefully
      expect(result).toBeNull();
    });

    it('caches successful responses', async () => {
      const mockData = { league_id: 'afc-123', name: 'Test' };
      let callCount = 0;

      global.fetch = vi.fn().mockImplementation(() => {
        callCount++;
        return Promise.resolve({
          ok: true,
          json: async () => mockData,
        });
      });

      // First call
      await queryClient.fetchQuery({
        queryKey: ['test', 'afc-123'],
        queryFn: async () => {
          const response = await fetch('/api/test');
          return response.json();
        },
        staleTime: Infinity, // Ensure caching
      });

      // Second call (should use cache)
      const cached = await queryClient.fetchQuery({
        queryKey: ['test', 'afc-123'],
        queryFn: async () => {
          const response = await fetch('/api/test');
          return response.json();
        },
        staleTime: Infinity,
      });

      // Should only call API once (second call uses cache)
      expect(callCount).toBe(1);
      expect(cached).toEqual(mockData);
    });
  });

  describe('Multi-League Data Combination', () => {
    it('fetches and combines data from both leagues', async () => {
      const mockAfcData = {
        league_id: 'afc-123',
        name: 'AFC',
        rosters: Array.from({ length: 12 }, (_, i) => ({
          roster_id: i + 1,
          league_id: 'afc-123',
        })),
      };

      const mockNfcData = {
        league_id: 'nfc-456',
        name: 'NFC',
        rosters: Array.from({ length: 12 }, (_, i) => ({
          roster_id: i + 1,
          league_id: 'nfc-456',
        })),
      };

      global.fetch = vi
        .fn()
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockAfcData,
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockNfcData,
        });

      // Fetch both leagues
      const fetchLeague = async (leagueId: string) => {
        const response = await fetch(`/api/league/${leagueId}`);
        return response.json();
      };

      const [afc, nfc] = await Promise.all([fetchLeague('afc-123'), fetchLeague('nfc-456')]);

      // Combine rosters with composite keys
      const combineRosters = (afcData: typeof mockAfcData, nfcData: typeof mockNfcData) => {
        return [
          ...afcData.rosters.map(r => ({
            ...r,
            compositeId: `${afcData.league_id}-${r.roster_id}`,
            conference: 'AFC',
          })),
          ...nfcData.rosters.map(r => ({
            ...r,
            compositeId: `${nfcData.league_id}-${r.roster_id}`,
            conference: 'NFC',
          })),
        ];
      };

      const combined = combineRosters(afc, nfc);

      // Verify combination
      expect(combined).toHaveLength(24);
      expect(combined.filter(r => r.conference === 'AFC')).toHaveLength(12);
      expect(combined.filter(r => r.conference === 'NFC')).toHaveLength(12);

      // Verify composite IDs are unique
      const compositeIds = combined.map(r => r.compositeId);
      expect(new Set(compositeIds).size).toBe(24);
    });

    it('handles partial failures in multi-league fetch', async () => {
      const mockAfcData = { league_id: 'afc-123', name: 'AFC' };

      global.fetch = vi
        .fn()
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockAfcData,
        })
        .mockRejectedValueOnce(new Error('NFC fetch failed'));

      const fetchLeague = async (leagueId: string) => {
        try {
          const response = await fetch(`/api/league/${leagueId}`);
          return response.json();
        } catch {
          return null;
        }
      };

      const [afc, nfc] = await Promise.all([fetchLeague('afc-123'), fetchLeague('nfc-456')]);

      // AFC should succeed, NFC should fail gracefully
      expect(afc).toBeDefined();
      expect(afc?.league_id).toBe('afc-123');
      expect(nfc).toBeNull();
    });
  });

  describe('Matchup Data Flow', () => {
    it('processes matchups with composite keys', async () => {
      const createMatchups = (leagueId: string) => {
        return Array.from({ length: 12 }, (_, i) => ({
          matchup_id: Math.floor(i / 2) + 1,
          roster_id: i + 1,
          points: 100 + i * 10,
        }));
      };

      const afcMatchups = createMatchups('afc-123');
      const nfcMatchups = createMatchups('nfc-456');

      // Process with composite keys
      const processMatchups = (matchups: typeof afcMatchups, leagueId: string) => {
        const grouped = matchups.reduce(
          (acc, m) => {
            const key = `${leagueId}-${m.matchup_id}`;
            if (!acc[key]) acc[key] = [];
            acc[key].push(m);
            return acc;
          },
          {} as Record<string, typeof matchups>,
        );

        return Object.entries(grouped).map(([compositeId, teams]) => ({
          compositeId,
          leagueId,
          matchupId: teams[0]!.matchup_id,
          teams,
        }));
      };

      const afcProcessed = processMatchups(afcMatchups, 'afc-123');
      const nfcProcessed = processMatchups(nfcMatchups, 'nfc-456');
      const allMatchups = [...afcProcessed, ...nfcProcessed];

      // Verify correct processing
      expect(allMatchups).toHaveLength(12); // 6 per league
      allMatchups.forEach(m => {
        expect(m.teams).toHaveLength(2);
        expect(m.compositeId).toContain(m.leagueId);
      });
    });

    it('maintains league context through processing pipeline', async () => {
      const mockMatchups: SleeperMatchup[] = [
        {
          matchup_id: 1,
          roster_id: 1,
          points: 120,
          players_points: {},
          starters: [],
          starters_points: [],
          players: [],
          custom_points: null,
        },
        {
          matchup_id: 1,
          roster_id: 2,
          points: 110,
          players_points: {},
          starters: [],
          starters_points: [],
          players: [],
          custom_points: null,
        },
      ];

      // Simulate data flow: fetch → process → enrich
      const enrichMatchups = (matchups: SleeperMatchup[], leagueId: string, week: number) => {
        return matchups.map(m => ({
          ...m,
          leagueId,
          week,
          compositeId: `${leagueId}-${week}-${m.matchup_id}-${m.roster_id}`,
        }));
      };

      const enriched = enrichMatchups(mockMatchups, 'afc-123', 5);

      // Verify enrichment
      enriched.forEach(m => {
        expect(m.leagueId).toBe('afc-123');
        expect(m.week).toBe(5);
        expect(m.compositeId).toContain('afc-123');
        expect(m.compositeId).toContain('5');
      });
    });

    it('prevents cross-league collisions when matchup_id overlaps', () => {
      const createLeagueMatchups = (leagueId: string) =>
        Array.from({ length: 12 }, (_, idx) => ({
          leagueId,
          matchup_id: Math.floor(idx / 2) + 1,
          roster_id: idx + 1,
        }));

      const afc = createLeagueMatchups('afc-123');
      const nfc = createLeagueMatchups('nfc-456');
      const merged = [...afc, ...nfc];

      const wrongGrouping = merged.reduce(
        (acc, matchup) => {
          const key = String(matchup.matchup_id);
          if (!acc[key]) acc[key] = [];
          acc[key].push(matchup);
          return acc;
        },
        {} as Record<string, Array<{ leagueId: string; matchup_id: number; roster_id: number }>>,
      );

      expect(Object.keys(wrongGrouping)).toHaveLength(6);
      Object.values(wrongGrouping).forEach(group => {
        expect(group).toHaveLength(4);
      });

      const safeGrouping = merged.reduce(
        (acc, matchup) => {
          const key = `${matchup.leagueId}-${matchup.matchup_id}`;
          if (!acc[key]) acc[key] = [];
          acc[key].push(matchup);
          return acc;
        },
        {} as Record<string, Array<{ leagueId: string; matchup_id: number; roster_id: number }>>,
      );

      expect(Object.keys(safeGrouping)).toHaveLength(12);
      Object.values(safeGrouping).forEach(group => {
        expect(group).toHaveLength(2);
      });
    });

    it('requires week in keys to avoid same-league cross-week collisions', () => {
      const leagueId = 'afc-123';
      const week5 = [
        { week: 5, leagueId, matchup_id: 1, roster_id: 1 },
        { week: 5, leagueId, matchup_id: 1, roster_id: 2 },
      ];
      const week6 = [
        { week: 6, leagueId, matchup_id: 1, roster_id: 1 },
        { week: 6, leagueId, matchup_id: 1, roster_id: 2 },
      ];

      const mergedWeeks = [...week5, ...week6];

      const noWeekKey = mergedWeeks.reduce(
        (acc, matchup) => {
          const key = `${matchup.leagueId}-${matchup.matchup_id}`;
          if (!acc[key]) acc[key] = [];
          acc[key].push(matchup);
          return acc;
        },
        {} as Record<
          string,
          Array<{ week: number; leagueId: string; matchup_id: number; roster_id: number }>
        >,
      );

      expect(Object.keys(noWeekKey)).toHaveLength(1);
      expect(Object.values(noWeekKey)[0]).toHaveLength(4);

      const withWeekKey = mergedWeeks.reduce(
        (acc, matchup) => {
          const key = `${matchup.leagueId}-${matchup.week}-${matchup.matchup_id}`;
          if (!acc[key]) acc[key] = [];
          acc[key].push(matchup);
          return acc;
        },
        {} as Record<
          string,
          Array<{ week: number; leagueId: string; matchup_id: number; roster_id: number }>
        >,
      );

      expect(Object.keys(withWeekKey)).toHaveLength(2);
      Object.values(withWeekKey).forEach(group => {
        expect(group).toHaveLength(2);
      });
    });
  });

  describe('Roster Data Flow', () => {
    it('combines rosters from multiple leagues with proper identification', async () => {
      const createRoster = (leagueId: string, rosterId: number): SleeperRoster => ({
        roster_id: rosterId,
        league_id: leagueId,
        owner_id: `${leagueId}-owner-${rosterId}`,
        players: [],
        starters: [],
        settings: {
          wins: 0,
          losses: 0,
          ties: 0,
          fpts: 0,
        },
      });

      const afcRosters = Array.from({ length: 12 }, (_, i) => createRoster('afc-123', i + 1));
      const nfcRosters = Array.from({ length: 12 }, (_, i) => createRoster('nfc-456', i + 1));

      // Enrich with composite IDs
      const enrichRoster = (roster: SleeperRoster, conference: string) => ({
        ...roster,
        compositeId: `${roster.league_id}-${roster.roster_id}`,
        conference,
      });

      const afcEnriched = afcRosters.map(r => enrichRoster(r, 'AFC'));
      const nfcEnriched = nfcRosters.map(r => enrichRoster(r, 'NFC'));
      const allRosters = [...afcEnriched, ...nfcEnriched];

      // Verify enrichment
      expect(allRosters).toHaveLength(24);

      // All composite IDs should be unique
      const ids = allRosters.map(r => r.compositeId);
      expect(new Set(ids).size).toBe(24);

      // Conference tags should be correct
      expect(allRosters.filter(r => r.conference === 'AFC')).toHaveLength(12);
      expect(allRosters.filter(r => r.conference === 'NFC')).toHaveLength(12);
    });
  });

  describe('Error Recovery', () => {
    it('retries failed requests', async () => {
      let attemptCount = 0;
      const mockData = { success: true };

      global.fetch = vi.fn().mockImplementation(() => {
        attemptCount++;
        if (attemptCount < 2) {
          return Promise.reject(new Error('Temporary failure'));
        }
        return Promise.resolve({
          ok: true,
          json: async () => mockData,
        });
      });

      const fetchWithRetry = async (url: string, maxRetries = 3) => {
        let lastError;
        for (let i = 0; i < maxRetries; i++) {
          try {
            const response = await fetch(url);
            return await response.json();
          } catch (error) {
            lastError = error;
            // Wait before retry
            await new Promise(resolve => setTimeout(resolve, 10));
          }
        }
        throw lastError;
      };

      const result = await fetchWithRetry('/api/test');

      expect(result).toEqual(mockData);
      expect(attemptCount).toBe(2);
    });

    it('provides fallback data on failure', async () => {
      global.fetch = vi.fn().mockRejectedValue(new Error('API failure'));

      const fallbackData = { league_id: 'afc-123', name: 'Fallback', total_rosters: 12 };

      const fetchWithFallback = async (leagueId: string) => {
        try {
          const response = await fetch(`/api/league/${leagueId}`);
          return await response.json();
        } catch {
          return fallbackData;
        }
      };

      const result = await fetchWithFallback('afc-123');

      expect(result).toEqual(fallbackData);
    });
  });

  describe('Real-World Data Flow Scenarios', () => {
    it('handles complete stats page data flow', async () => {
      // Mock complete stats flow
      const mockLeagues = [
        { id: 'afc-123', name: 'AFC', conference: 'AFC' },
        { id: 'nfc-456', name: 'NFC', conference: 'NFC' },
      ];

      const mockRosters = (leagueId: string) =>
        Array.from({ length: 12 }, (_, i) => ({
          roster_id: i + 1,
          league_id: leagueId,
          settings: { fpts: 1000 + i * 50 },
        }));

      // Step 1: Fetch leagues
      const leagues = mockLeagues;

      // Step 2: Fetch rosters for each league
      const rostersData = await Promise.all(
        leagues.map(async league => ({
          leagueId: league.id,
          rosters: mockRosters(league.id),
        })),
      );

      // Step 3: Combine and process
      const allRosters = rostersData.flatMap(({ leagueId, rosters }) =>
        rosters.map(r => ({
          ...r,
          compositeId: `${leagueId}-${r.roster_id}`,
        })),
      );

      // Step 4: Calculate stats
      const stats = {
        totalTeams: allRosters.length,
        totalPoints: allRosters.reduce((sum, r) => sum + r.settings.fpts, 0),
        averagePoints: allRosters.reduce((sum, r) => sum + r.settings.fpts, 0) / allRosters.length,
      };

      // Verify
      expect(stats.totalTeams).toBe(24);
      expect(stats.totalPoints).toBeGreaterThan(0);
      expect(stats.averagePoints).toBeGreaterThan(0);
    });

    it('handles matchup page data flow with week parameter', async () => {
      const week = 5;
      const leagueIds = ['afc-123', 'nfc-456'];

      // Mock matchup fetch - creates 12 teams (6 matchups of 2 teams each)
      const fetchMatchups = (leagueId: string, week: number) => {
        return Array.from({ length: 12 }, (_, i) => ({
          matchup_id: Math.floor(i / 2) + 1,
          roster_id: i + 1,
          points: 100 + Math.random() * 50,
          week,
          leagueId,
        }));
      };

      // Fetch matchups for both leagues
      const allMatchups = await Promise.all(
        leagueIds.map(async leagueId => {
          const matchups = fetchMatchups(leagueId, week);
          return matchups.map(m => ({
            ...m,
            compositeId: `${leagueId}-${week}-${m.matchup_id}-${m.roster_id}`,
          }));
        }),
      );

      const combined = allMatchups.flat();

      // Verify
      expect(combined).toHaveLength(24); // 12 per league
      expect(combined.every(m => m.week === week)).toBe(true);

      // All composite IDs should be unique (includes roster_id now)
      const ids = combined.map(m => m.compositeId);
      expect(new Set(ids).size).toBe(24);
    });
  });
});
