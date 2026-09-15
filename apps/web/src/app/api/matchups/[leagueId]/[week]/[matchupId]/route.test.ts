import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';

const getDriveFFLiveOdds = vi.fn();
const fetchAllPlayers = vi.fn();
const fetchLeague = vi.fn();
const fetchMatchups = vi.fn();
const fetchNFLState = vi.fn();
const fetchRosters = vi.fn();
const fetchUsers = vi.fn();
const fetchWeeklyProjections = vi.fn();

vi.mock('@/config/leagues', () => ({
  getLeagueConfig: () => ({ id: 'league-1', name: 'Test Legion', season: 2026 }),
  getCurrentLeagues: () => [],
}));
vi.mock('@/lib/driveff-live-odds', () => ({ getDriveFFLiveOdds }));
vi.mock('@/lib/sleeper/unified-client', () => ({
  sleeperClient: {
    fetchAllPlayers,
    fetchLeague,
    fetchMatchups,
    fetchNFLState,
    fetchRosters,
    fetchUsers,
    fetchWeeklyProjections,
  },
}));

describe('matchup detail API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    fetchLeague.mockResolvedValue({
      season: '2026',
      status: 'in_season',
      settings: { playoff_week_start: 15 },
      scoring_settings: {},
    });
    fetchNFLState.mockResolvedValue({ season: '2026', league_season: '2026', week: 1 });
    fetchMatchups.mockResolvedValue([
      {
        roster_id: 1,
        matchup_id: 3,
        points: 101.1,
        starters: ['p1'],
        starters_points: { 0: 101.1 },
      },
      {
        roster_id: 2,
        matchup_id: 3,
        points: 80,
        starters: ['p2'],
        starters_points: { 0: 80 },
      },
    ]);
    fetchRosters.mockResolvedValue([
      { roster_id: 1, owner_id: 'u1', players: ['p1'] },
      { roster_id: 2, owner_id: 'u2', players: ['p2'] },
    ]);
    fetchUsers.mockResolvedValue([
      { user_id: 'u1', username: 'one', display_name: 'Team One' },
      { user_id: 'u2', username: 'two', display_name: 'Team Two' },
    ]);
    fetchWeeklyProjections.mockResolvedValue({});
    fetchAllPlayers.mockResolvedValue({
      p1: { full_name: 'Player One', position: 'QB', team: 'JAX' },
      p2: { full_name: 'Player Two', position: 'QB', team: 'BAL' },
    });
    getDriveFFLiveOdds.mockResolvedValue({
      latest: {
        matchup: {
          gameProgress: 0.42,
          rosterAId: '1',
          rosterBId: '2',
          projectedFinalA: 170.2,
          projectedFinalB: 119.5,
        },
      },
    });
  });

  it('uses driveFF for the live projection and game state', async () => {
    const { GET } = await import('./route');
    const response = await GET(new NextRequest('https://gauntlet.test/api/matchups/league-1/1/3'), {
      params: Promise.resolve({ leagueId: 'league-1', week: '1', matchupId: '3' }),
    });

    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.gameStatus).toBe('in_progress');
    expect(body.matchup.teams).toEqual([
      expect.objectContaining({ projectedPoints: 170.2, projectionSource: 'driveff' }),
      expect.objectContaining({ projectedPoints: 119.5, projectionSource: 'driveff' }),
    ]);
  });

  it('falls back to the pregame projection and state when driveFF is unavailable', async () => {
    getDriveFFLiveOdds.mockRejectedValueOnce(new Error('offline'));
    const { GET } = await import('./route');
    const response = await GET(new NextRequest('https://gauntlet.test/api/matchups/league-1/1/3'), {
      params: Promise.resolve({ leagueId: 'league-1', week: '1', matchupId: '3' }),
    });

    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.gameStatus).toBe('pre_game');
    expect(body.matchup.teams).toEqual([
      expect.objectContaining({ projectionSource: 'sleeper' }),
      expect.objectContaining({ projectionSource: 'sleeper' }),
    ]);
  });

  it('marks a fully progressed driveFF matchup final', async () => {
    getDriveFFLiveOdds.mockResolvedValueOnce({
      latest: {
        matchup: {
          gameProgress: 1,
          rosterAId: '1',
          rosterBId: '2',
          projectedFinalA: 170.2,
          projectedFinalB: 119.5,
        },
      },
    });
    const { GET } = await import('./route');
    const response = await GET(new NextRequest('https://gauntlet.test/api/matchups/league-1/1/3'), {
      params: Promise.resolve({ leagueId: 'league-1', week: '1', matchupId: '3' }),
    });

    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.gameStatus).toBe('final');
    expect(body.matchup.isComplete).toBe(true);
  });

  it('marks a prior week final even when the last driveFF sample is stale', async () => {
    fetchNFLState.mockResolvedValueOnce({ season: '2026', league_season: '2026', week: 2 });
    const { GET } = await import('./route');
    const response = await GET(new NextRequest('https://gauntlet.test/api/matchups/league-1/1/3'), {
      params: Promise.resolve({ leagueId: 'league-1', week: '1', matchupId: '3' }),
    });

    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.gameStatus).toBe('final');
    expect(body.matchup.isComplete).toBe(true);
    expect(body.matchup.winner.rosterId).toBe(1);
  });
});
