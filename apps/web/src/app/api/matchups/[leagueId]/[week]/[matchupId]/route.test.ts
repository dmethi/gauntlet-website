import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';

const getDriveFFLiveOdds = vi.fn();
const fetchAllPlayers = vi.fn();
const fetchLeague = vi.fn();
const fetchMatchups = vi.fn();
const fetchRosters = vi.fn();
const fetchUsers = vi.fn();
const fetchWeeklyProjections = vi.fn();

vi.mock('@/config/leagues', () => ({
  getLeagueConfig: () => ({ id: 'league-1', name: 'Test Legion', season: 2026 }),
}));
vi.mock('@/lib/driveff-live-odds', () => ({ getDriveFFLiveOdds }));
vi.mock('@/lib/sleeper/unified-client', () => ({
  sleeperClient: {
    fetchAllPlayers,
    fetchLeague,
    fetchMatchups,
    fetchRosters,
    fetchUsers,
    fetchWeeklyProjections,
  },
}));

describe('matchup detail API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    fetchLeague.mockResolvedValue({ scoring_settings: {} });
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
});
