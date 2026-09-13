import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';

const getMatchupsByWeek = vi.fn();
const getRostersByLeague = vi.fn();
const getUsersByLeague = vi.fn();
const getDriveFFLiveOdds = vi.fn();

vi.mock('@/config/leagues', () => ({
  getCurrentLeagues: () => [{ id: 'league-1', name: 'Test Legion', season: 2026 }],
}));
vi.mock('@/lib/api-replacements', () => ({
  getMatchupsByWeek,
  getRostersByLeague,
  getUsersByLeague,
}));
vi.mock('@/lib/driveff-live-odds', async importOriginal => {
  const actual = await importOriginal<typeof import('@/lib/driveff-live-odds')>();
  return { ...actual, getDriveFFLiveOdds };
});

describe('league-wide odds API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getRostersByLeague.mockResolvedValue([
      { rosterId: 1, ownerId: 'u1' },
      { rosterId: 2, ownerId: 'u2' },
    ]);
    getUsersByLeague.mockResolvedValue([
      { id: 'u1', displayName: 'Team One' },
      { id: 'u2', displayName: 'Team Two' },
    ]);
    getMatchupsByWeek.mockResolvedValue([
      { rosterId: 1, matchupId: 3 },
      { rosterId: 2, matchupId: 3 },
    ]);
    getDriveFFLiveOdds.mockResolvedValue({
      schemaVersion: 1,
      provider: 'sleeper',
      leagueId: 'league-1',
      week: 1,
      matchupId: '3',
      samples: [],
      latest: {
        timestamp: '2026-09-13T18:36:06.233Z',
        engineVersion: 'test',
        iterations: 10_000,
        playerDistributions: [
          {
            rosterId: '1',
            playerId: 'p1',
            position: 'QB',
            currentScore: 101.1,
            providerProjection: 123.6,
            remainingProjection: 69.1,
            gameProgress: 0.42,
            mean: 170.2,
            standardDeviation: 10,
            p10: 157.4,
            p25: 163.5,
            p50: 170.2,
            p75: 176.9,
            p90: 183,
          },
          {
            rosterId: '2',
            playerId: 'p2',
            position: 'QB',
            currentScore: 80,
            providerProjection: 110,
            remainingProjection: 39.5,
            gameProgress: 0.42,
            mean: 119.5,
            standardDeviation: 10,
            p10: 106.7,
            p25: 112.8,
            p50: 119.5,
            p75: 126.2,
            p90: 132.3,
          },
        ],
        matchup: {
          timestamp: '2026-09-13T18:36:06.233Z',
          gameProgress: 0.42,
          winProbA: 0.8,
          winProbB: 0.2,
          projectedFinalA: 170.2,
          projectedFinalB: 119.5,
          currentScoreA: 101.1,
          currentScoreB: 80,
          spread: 50.7,
          total: 289.7,
          rosterAId: '1',
          rosterBId: '2',
        },
      },
    });
  });

  it('uses driveFF live projections for the high-scorer field', async () => {
    const { GET } = await import('./route');
    const response = await GET(
      new NextRequest('https://gauntlet.test/api/matchups/league-odds/1'),
      { params: Promise.resolve({ week: '1' }) },
    );

    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.highestScorer).toContainEqual(
      expect.objectContaining({ teamId: 'league-1-1', totalProjection: 170.2 }),
    );
    expect(body.source).toBe('driveff');
  });
});
