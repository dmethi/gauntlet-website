import { beforeEach, describe, expect, it, vi } from 'vitest';
import { buildStatsDataset } from './compose';

const { statsClient } = vi.hoisted(() => ({
  statsClient: {
    fetchNFLState: vi.fn(),
    fetchLeague: vi.fn(),
    fetchPlayersIndex: vi.fn(),
    fetchRosters: vi.fn(),
    fetchUsers: vi.fn(),
    fetchMatchups: vi.fn(),
    fetchWeeklyPlayerStats: vi.fn(),
  },
}));

vi.mock('@/lib/sleeper/browser-client', () => ({
  createBrowserStatsClient: () => statsClient,
}));

describe('buildStatsDataset season window', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    statsClient.fetchPlayersIndex.mockResolvedValue({});
    statsClient.fetchRosters.mockResolvedValue([]);
    statsClient.fetchUsers.mockResolvedValue([]);
    statsClient.fetchMatchups.mockResolvedValue([]);
    statsClient.fetchWeeklyPlayerStats.mockResolvedValue({});
  });

  it('only aggregates completed weeks for the current season', async () => {
    statsClient.fetchNFLState.mockResolvedValue({
      season: '2026',
      league_season: '2026',
      week: 2,
    });
    statsClient.fetchLeague.mockResolvedValue({
      season: '2026',
      status: 'in_season',
      settings: { playoff_week_start: 15 },
    });

    const result = await buildStatsDataset({
      leagueIds: ['league-1'],
      labels: ['League One'],
      weekRange: { from: 1, to: 18 },
    });

    expect(statsClient.fetchMatchups.mock.calls.map(([, week]) => week)).toEqual([1]);
    expect(result.currentWeek).toBe(2);
    expect(result.currentSeason).toBe('2026');
    expect(result.weekRange).toEqual({ from: 1, to: 1 });
  });

  it('uses the requested league season window for archived stats', async () => {
    statsClient.fetchNFLState.mockResolvedValue({
      season: '2026',
      league_season: '2026',
      week: 2,
    });
    statsClient.fetchLeague.mockResolvedValue({
      season: '2025',
      status: 'complete',
      settings: { playoff_week_start: 15 },
    });

    const result = await buildStatsDataset({
      leagueIds: ['league-1'],
      labels: ['League One'],
      weekRange: { from: 1, to: 18 },
    });

    expect(statsClient.fetchMatchups).toHaveBeenCalledTimes(14);
    expect(statsClient.fetchMatchups.mock.calls.at(-1)?.[1]).toBe(14);
    expect(result.currentWeek).toBe(15);
    expect(result.currentSeason).toBe('2025');
    expect(result.weekRange).toEqual({ from: 1, to: 14 });
  });
});
