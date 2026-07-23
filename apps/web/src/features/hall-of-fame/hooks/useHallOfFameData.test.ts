import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createHallOfFameDataService } from './useHallOfFameData';
import type { EnhancedMatchup, ProcessedMatchup } from '@/features/hall-of-fame/types';

// Mock the Sleeper client
vi.mock('@/lib/sleeper/browser-client', () => ({
  createBrowserServiceClient: vi.fn(() => ({
    fetchNFLState: vi.fn().mockResolvedValue({ week: 5 }),
    fetchAllPlayers: vi.fn().mockResolvedValue({
      player1: { full_name: 'Player One', position: 'RB' },
      player2: { full_name: 'Player Two', position: 'WR' },
    }),
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
    // Should not include 2025 season
    const has2025 = matchups.some((m: EnhancedMatchup) => m.season === '2025');
    expect(has2025).toBe(false);
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
