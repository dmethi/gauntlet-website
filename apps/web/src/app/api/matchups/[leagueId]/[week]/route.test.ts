import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';

const getMatchupsByWeek = vi.fn();
const getRostersByLeague = vi.fn();
const getUsersByLeague = vi.fn();
const getDriveFFLiveOdds = vi.fn();
const fetchAllPlayers = vi.fn();
const fetchLeague = vi.fn();
const fetchNFLState = vi.fn();
const fetchWeeklyProjections = vi.fn();

vi.mock('@/lib/api-replacements', () => ({
  getMatchupsByWeek,
  getRostersByLeague,
  getUsersByLeague,
}));
vi.mock('@/lib/driveff-live-odds', () => ({ getDriveFFLiveOdds }));
vi.mock('@/lib/sleeper/unified-client', () => ({
  sleeperClient: {
    fetchAllPlayers,
    fetchLeague,
    fetchNFLState,
    fetchWeeklyProjections,
  },
}));

describe('league matchups API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getRostersByLeague.mockResolvedValue([
      { id: 'r1', rosterId: 1, leagueId: 'league-1', ownerId: 'u1' },
      { id: 'r2', rosterId: 2, leagueId: 'league-1', ownerId: 'u2' },
    ]);
    getUsersByLeague.mockResolvedValue([
      { id: 'u1', username: 'one', displayName: 'Team One' },
      { id: 'u2', username: 'two', displayName: 'Team Two' },
    ]);
    getMatchupsByWeek.mockResolvedValue([
      {
        id: 'm1',
        leagueId: 'league-1',
        week: 1,
        rosterId: 1,
        matchupId: 3,
        points: 101.1,
        starters: ['p1'],
        players: ['p1'],
        starterPoints: { 0: 101.1 },
      },
      {
        id: 'm2',
        leagueId: 'league-1',
        week: 1,
        rosterId: 2,
        matchupId: 3,
        points: 80,
        starters: ['p2'],
        players: ['p2'],
        starterPoints: { 0: 80 },
      },
    ]);
    fetchNFLState.mockResolvedValue({ season: '2026', league_season: '2026', week: 2 });
    fetchLeague.mockResolvedValue({
      season: '2026',
      status: 'in_season',
      settings: { playoff_week_start: 15 },
      scoring_settings: {},
    });
    fetchWeeklyProjections.mockResolvedValue({
      p1: { player_id: 'p1', stats: { pts_ppr: 123.6 } },
      p2: { player_id: 'p2', stats: { pts_ppr: 110 } },
    });
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
        playerDistributions: [],
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

  it('uses driveFF live projected finals on matchup cards', async () => {
    const { GET } = await import('./route');
    const response = await GET(new NextRequest('https://gauntlet.test/api/matchups/league-1/1'), {
      params: Promise.resolve({ leagueId: 'league-1', week: '1' }),
    });

    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.matchups[0].teams).toEqual([
      expect.objectContaining({ rosterId: 1, projectedPoints: 170.2, projectionSource: 'driveff' }),
      expect.objectContaining({ rosterId: 2, projectedPoints: 119.5, projectionSource: 'driveff' }),
    ]);
    expect(body.matchups[0]).toEqual(
      expect.objectContaining({
        isComplete: true,
        summary: { winnerRosterId: 1 },
      }),
    );
  });

  it('keeps the current week live until the driveFF matchup is fully progressed', async () => {
    const { GET } = await import('./route');
    const response = await GET(new NextRequest('https://gauntlet.test/api/matchups/league-1/2'), {
      params: Promise.resolve({ leagueId: 'league-1', week: '2' }),
    });

    expect(response.status).toBe(200);
    expect((await response.json()).matchups[0]).toEqual(
      expect.objectContaining({
        isComplete: false,
        summary: { winnerRosterId: null },
      }),
    );
  });

  it('marks a current-week simulation complete when driveFF reaches full progress', async () => {
    const feed = await getDriveFFLiveOdds();
    getDriveFFLiveOdds.mockResolvedValue({
      ...feed,
      latest: {
        ...feed.latest,
        matchup: { ...feed.latest.matchup, gameProgress: 1 },
      },
    });

    const { GET } = await import('./route');
    const response = await GET(new NextRequest('https://gauntlet.test/api/matchups/league-1/2'), {
      params: Promise.resolve({ leagueId: 'league-1', week: '2' }),
    });

    expect(response.status).toBe(200);
    expect((await response.json()).matchups[0]).toEqual(
      expect.objectContaining({
        isComplete: true,
        summary: { winnerRosterId: 1 },
      }),
    );
  });

  it('labels Sleeper projections when the driveFF feed is unavailable', async () => {
    getDriveFFLiveOdds.mockRejectedValueOnce(new Error('offline'));
    const { GET } = await import('./route');
    const response = await GET(new NextRequest('https://gauntlet.test/api/matchups/league-1/1'), {
      params: Promise.resolve({ leagueId: 'league-1', week: '1' }),
    });

    expect(response.status).toBe(200);
    expect((await response.json()).matchups[0].teams).toEqual([
      expect.objectContaining({ projectionSource: 'sleeper' }),
      expect.objectContaining({ projectionSource: 'sleeper' }),
    ]);
  });
});
