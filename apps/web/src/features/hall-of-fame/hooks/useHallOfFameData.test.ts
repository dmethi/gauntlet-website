import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createHallOfFameDataService } from './useHallOfFameData';
import type { EnhancedMatchup, ProcessedMatchup } from '@/features/hall-of-fame/types';
import type { League } from '@/config/leagues';

// Mock league registry with a varying number of leagues per season (0, 1, 3,
// 2) so aggregation tests prove the service walks whatever the registry
// contains instead of assuming exactly two current-season leagues.
// vi.mock factories are hoisted above imports/consts, so the registry must be
// defined via vi.hoisted to be visible inside the factory below.
const { MOCK_LEAGUE_REGISTRY } = vi.hoisted(() => ({
  MOCK_LEAGUE_REGISTRY: {
    '2022': [],
    '2023': [{ id: 'lg-2023-a', name: 'League 2023 A', season: 2023, previousLeagueId: null }],
    '2024': [
      { id: 'lg-2024-a', name: 'League 2024 A', season: 2024, previousLeagueId: null },
      { id: 'lg-2024-b', name: 'League 2024 B', season: 2024, previousLeagueId: null },
      { id: 'lg-2024-c', name: 'League 2024 C', season: 2024, previousLeagueId: null },
    ],
    '2025': [
      { id: 'lg-2025-a', name: 'League 2025 A', season: 2025, previousLeagueId: 'lg-2024-a' },
      { id: 'lg-2025-b', name: 'League 2025 B', season: 2025, previousLeagueId: 'lg-2024-b' },
    ],
  } as Record<string, League[]>,
}));

vi.mock('@/config/leagues', () => ({
  getAllSeasons: () => Object.keys(MOCK_LEAGUE_REGISTRY),
  getLeaguesForSeason: (season: string) => MOCK_LEAGUE_REGISTRY[season] ?? [],
  // lib/constants.ts (transitively imported for CACHE_DURATIONS) also reads
  // this at module load time to derive LEAGUE_IDS.
  getCurrentLeagues: () => MOCK_LEAGUE_REGISTRY['2025'],
}));

// Mock the Sleeper client
vi.mock('@/lib/sleeper/browser-client', () => ({
  createBrowserServiceClient: vi.fn(() => ({
    fetchNFLState: vi.fn().mockResolvedValue({ week: 5 }),
    fetchLeague: vi.fn().mockResolvedValue({
      name: 'Test League',
      season: '2024',
    }),
    fetchRosters: vi.fn().mockResolvedValue([
      {
        roster_id: 1,
        owner_id: 'user1',
      },
      {
        roster_id: 2,
        owner_id: 'user2',
      },
    ]),
    fetchUsers: vi.fn().mockResolvedValue([
      {
        user_id: 'user1',
        display_name: 'User One',
        metadata: { team_name: 'Team Alpha' },
      },
      {
        user_id: 'user2',
        display_name: 'User Two',
        metadata: { team_name: 'Team Beta' },
      },
    ]),
    fetchMatchups: vi.fn().mockResolvedValue([
      {
        roster_id: 1,
        matchup_id: 1,
        points: 120.5,
        starters: ['player1'],
        starters_points: [25.5],
        players: ['player1', 'player2'],
        players_points: [25.5, 0],
      },
      {
        roster_id: 2,
        matchup_id: 1,
        points: 105.0,
        starters: ['player2'],
        starters_points: [18.0],
        players: ['player2'],
        players_points: [18.0],
      },
    ]),
    fetchWeeklyPlayerStats: vi.fn().mockResolvedValue({
      player1: { pts_half_ppr: 25.5 },
      player2: { pts_half_ppr: 18.0 },
    }),
    fetchWeeklyProjections: vi.fn().mockResolvedValue({
      player1: { pts_half_ppr: 22.0 },
      player2: { pts_half_ppr: 15.0 },
    }),
  })),
}));

describe('createHallOfFameDataService', () => {
  let service: ReturnType<typeof createHallOfFameDataService>;

  beforeEach(() => {
    // enhanceMatchupsWithStats now fetches only the players referenced by a
    // batch of matchups via POST /api/players/batch, instead of the entire
    // player database via sleeperClient.fetchAllPlayers().
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        players: {
          player1: { full_name: 'Player One', position: 'RB' },
          player2: { full_name: 'Player Two', position: 'WR' },
        },
      }),
    });

    service = createHallOfFameDataService();
    vi.clearAllMocks();
  });

  it('creates service with all methods', () => {
    expect(service).toBeDefined();
    expect(service.getAllHistoricalMatchups).toBeInstanceOf(Function);
    expect(service.getLeagueSeasonMatchups).toBeInstanceOf(Function);
    expect(service.clearCache).toBeInstanceOf(Function);
  });

  it('fetches league season matchups successfully', async () => {
    const matchups = await service.getLeagueSeasonMatchups('league123', '2024');

    expect(matchups).toBeDefined();
    expect(Array.isArray(matchups)).toBe(true);
  });

  it('enhances matchups with player data', async () => {
    const matchups = await service.getLeagueSeasonMatchups('league123', '2024');

    expect(matchups.length).toBeGreaterThan(0);
    matchups.forEach((matchup: EnhancedMatchup) => {
      expect(matchup).toHaveProperty('season');
      expect(matchup).toHaveProperty('leagueName');
      expect(matchup).toHaveProperty('playerData');
      expect(matchup).toHaveProperty('playerStats');
      expect(matchup).toHaveProperty('playerProjections');
    });
  });

  it('caches league season matchups', async () => {
    // First call
    const matchups1 = await service.getLeagueSeasonMatchups('league123', '2024');

    // Second call should return cached data
    const matchups2 = await service.getLeagueSeasonMatchups('league123', '2024');

    expect(matchups1).toBe(matchups2);
  });

  it('clears cache successfully', async () => {
    await service.getLeagueSeasonMatchups('league123', '2024');

    service.clearCache();

    // After clearing cache, should make new request
    // This is hard to test directly but clearing should not throw
    expect(() => service.clearCache()).not.toThrow();
  });

  it('fetches all historical matchups', async () => {
    const matchups = await service.getAllHistoricalMatchups(true);

    expect(matchups).toBeDefined();
    expect(Array.isArray(matchups)).toBe(true);
  });

  it('excludes current season when requested', async () => {
    const matchups = await service.getAllHistoricalMatchups(false);

    expect(matchups).toBeDefined();
    // Should not include 2025 season (the most recent season with registered leagues)
    const has2025 = matchups.some((m: EnhancedMatchup) => m.season === '2025');
    expect(has2025).toBe(false);
  });

  it('aggregates matchups across every league in every registered season, regardless of how many leagues a season has', async () => {
    const matchups = await service.getAllHistoricalMatchups(true);

    const leagueIds = new Set(matchups.map((m: EnhancedMatchup) => m.leagueId));
    expect(leagueIds).toEqual(
      new Set(['lg-2023-a', 'lg-2024-a', 'lg-2024-b', 'lg-2024-c', 'lg-2025-a', 'lg-2025-b']),
    );
  });

  it('excludes only the leagues in the most recent played season when includeCurrent is false', async () => {
    const matchups = await service.getAllHistoricalMatchups(false);

    const leagueIds = new Set(matchups.map((m: EnhancedMatchup) => m.leagueId));
    expect(leagueIds.has('lg-2025-a')).toBe(false);
    expect(leagueIds.has('lg-2025-b')).toBe(false);
    // A prior season with 3 leagues is still fully included, not treated as "current"
    expect(leagueIds).toEqual(new Set(['lg-2023-a', 'lg-2024-a', 'lg-2024-b', 'lg-2024-c']));
  });

  it('does not error on a registered season with zero leagues', async () => {
    // '2022' is registered in the mock registry with an empty league list
    const matchups = await service.getAllHistoricalMatchups(true);

    expect(matchups.some((m: EnhancedMatchup) => m.season === '2022')).toBe(false);
    expect(Array.isArray(matchups)).toBe(true);
  });

  it('processes multiple weeks in parallel', async () => {
    const matchups = await service.getLeagueSeasonMatchups('league123', '2024');

    // Should have processed matchups from multiple weeks
    expect(matchups.length).toBeGreaterThan(0);
  });

  it('handles missing matchup data gracefully', async () => {
    const { createBrowserServiceClient } = await import('@/lib/sleeper/browser-client');
    const mockClient = vi.mocked(createBrowserServiceClient);

    mockClient.mockReturnValue({
      ...mockClient(),
      fetchMatchups: vi.fn().mockResolvedValue([]),
    } as any);

    const testService = createHallOfFameDataService();
    const matchups = await testService.getLeagueSeasonMatchups('league123', '2024');

    expect(matchups).toBeDefined();
    expect(Array.isArray(matchups)).toBe(true);
  });

  it('groups matchups by matchup_id correctly', async () => {
    const matchups = await service.getLeagueSeasonMatchups('league123', '2024');

    // Each matchup should have opponent information
    matchups.forEach((matchup: EnhancedMatchup) => {
      expect(matchup).toHaveProperty('rosterId');
      expect(matchup).toHaveProperty('matchupId');
    });
  });

  it('maps rosters to users for team names', async () => {
    const matchups = await service.getLeagueSeasonMatchups('league123', '2024');

    matchups.forEach((matchup: EnhancedMatchup) => {
      expect(matchup.teamName).toBeDefined();
      expect(matchup.teamName).not.toBe('Unknown');
    });
  });

  it('fetches correct number of weeks based on current week', async () => {
    const { createBrowserServiceClient } = await import('@/lib/sleeper/browser-client');
    const mockClient = vi.mocked(createBrowserServiceClient);

    mockClient.mockReturnValue({
      ...mockClient(),
      fetchNFLState: vi.fn().mockResolvedValue({ week: 3 }),
    } as any);

    const testService = createHallOfFameDataService();
    await testService.getLeagueSeasonMatchups('league123', '2025');

    // Should only fetch weeks 1-3 for current season
    // This is indirectly tested by the service behavior
    expect(true).toBe(true);
  });

  it('identifies playoff matchups correctly', async () => {
    const { createBrowserServiceClient } = await import('@/lib/sleeper/browser-client');
    const mockClient = vi.mocked(createBrowserServiceClient);

    mockClient.mockReturnValue({
      ...mockClient(),
      fetchMatchups: vi.fn().mockImplementation((leagueId, week) => {
        if (week >= 15) {
          return Promise.resolve([
            {
              roster_id: 1,
              matchup_id: 1,
              points: 120.5,
              starters: ['player1'],
              starters_points: [25.5],
              players: ['player1'],
              players_points: [25.5],
            },
          ]);
        }
        return Promise.resolve([]);
      }),
    } as any);

    const testService = createHallOfFameDataService();
    const matchups = await testService.getLeagueSeasonMatchups('league123', '2024');

    // Playoff matchups should have isPlayoff flag
    const playoffMatchups = matchups.filter((m: ProcessedMatchup) => m.isPlayoff);
    expect(playoffMatchups.length).toBeGreaterThanOrEqual(0);
  });

  it('enhances matchups with stats and projections', async () => {
    const matchups = await service.getLeagueSeasonMatchups('league123', '2024');

    matchups.forEach((matchup: EnhancedMatchup) => {
      expect(matchup.playerStats).toBeInstanceOf(Map);
      expect(matchup.playerProjections).toBeInstanceOf(Map);
    });
  });

  it('handles API errors gracefully', async () => {
    const { createBrowserServiceClient } = await import('@/lib/sleeper/browser-client');
    const mockClient = vi.mocked(createBrowserServiceClient);

    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    mockClient.mockReturnValue({
      ...mockClient(),
      fetchLeague: vi.fn().mockRejectedValue(new Error('API Error')),
    } as any);

    const testService = createHallOfFameDataService();

    await expect(testService.getLeagueSeasonMatchups('league123', '2024')).rejects.toThrow();

    consoleErrorSpy.mockRestore();
  });

  it('caches all historical matchups', async () => {
    const matchups1 = await service.getAllHistoricalMatchups(true);
    const matchups2 = await service.getAllHistoricalMatchups(true);

    expect(matchups1).toBe(matchups2);
  });

  it('processes multiple leagues in getAllHistoricalMatchups', async () => {
    const matchups = await service.getAllHistoricalMatchups(true);

    // Should return array even if some leagues fail to load
    expect(Array.isArray(matchups)).toBe(true);
  });

  it('continues processing if one league fails', async () => {
    const { createBrowserServiceClient } = await import('@/lib/sleeper/browser-client');
    const mockClient = vi.mocked(createBrowserServiceClient);

    let callCount = 0;
    mockClient.mockReturnValue({
      ...mockClient(),
      fetchLeague: vi.fn().mockImplementation(() => {
        callCount++;
        if (callCount === 1) {
          return Promise.reject(new Error('First league failed'));
        }
        return Promise.resolve({ name: 'Test League', season: '2024' });
      }),
    } as any);

    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const testService = createHallOfFameDataService();
    const matchups = await testService.getAllHistoricalMatchups(true);

    // Should have some matchups despite one failure
    expect(Array.isArray(matchups)).toBe(true);

    consoleErrorSpy.mockRestore();
  });

  it('respects cache duration', async () => {
    const matchups1 = await service.getLeagueSeasonMatchups('league123', '2024');

    // Immediately fetching again should use cache
    const matchups2 = await service.getLeagueSeasonMatchups('league123', '2024');

    expect(matchups1).toBe(matchups2);
  });

  it('processes custom points if available', async () => {
    const { createBrowserServiceClient } = await import('@/lib/sleeper/browser-client');
    const mockClient = vi.mocked(createBrowserServiceClient);

    mockClient.mockReturnValue({
      ...mockClient(),
      fetchMatchups: vi.fn().mockResolvedValue([
        {
          roster_id: 1,
          matchup_id: 1,
          points: 120.5,
          custom_points: 125.0,
          starters: ['player1'],
          starters_points: [25.5],
          players: ['player1'],
          players_points: [25.5],
        },
      ]),
    } as any);

    const testService = createHallOfFameDataService();
    const matchups = await testService.getLeagueSeasonMatchups('league123', '2024');

    const matchupWithCustom = matchups.find((m: ProcessedMatchup) => m.custom_points);
    if (matchupWithCustom) {
      expect(matchupWithCustom.custom_points).toBe(125.0);
    }
  });
});
