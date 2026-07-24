import { beforeEach, describe, expect, it, vi } from 'vitest';

/**
 * Multi-league safety for standings: roster_ids only unique within a league,
 * so two leagues can genuinely collide on roster_id=1. This suite fixtures
 * two colliding leagues and verifies:
 *  - each league's matchups/rosters are fetched and computed separately,
 *    scoped strictly to its own league ID (no cross-league leakage)
 *  - the final `{afc, nfc}` shape is assembled only after each league's
 *    standings are fully computed independently — combination is a
 *    presentation-layer step, not something baked into the per-league
 *    computation itself.
 */

const LEAGUE_A = {
  id: 'league_a',
  name: 'League A',
  season: 2025,
  conference: 'AFC',
  previousLeagueId: null,
};
const LEAGUE_B = {
  id: 'league_b',
  name: 'League B',
  season: 2025,
  conference: 'NFC',
  previousLeagueId: null,
};

vi.mock('@/config/leagues', () => ({
  getCurrentLeagues: () => [LEAGUE_A, LEAGUE_B],
}));

vi.mock('@/lib/username-mapping', () => ({
  getRealNameByRoster: (leagueId: string, rosterId: number) => `${leagueId}-owner-${rosterId}`,
}));

const fetchMatchups = vi.fn();
const fetchRostersWithOwners = vi.fn();

vi.mock('@/lib/sleeper/unified-client', () => ({
  sleeperClient: {
    fetchMatchups: (...args: unknown[]) => fetchMatchups(...args),
    fetchRostersWithOwners: (...args: unknown[]) => fetchRostersWithOwners(...args),
  },
}));

const roster = (rosterId: number, teamName: string) => ({
  roster_id: rosterId,
  metadata: { team_name: teamName },
  settings: {},
});

const matchup = (rosterId: number, matchupId: number, points: number) => ({
  roster_id: rosterId,
  matchup_id: matchupId,
  points,
});

beforeEach(() => {
  fetchMatchups.mockReset();
  fetchRostersWithOwners.mockReset();

  // Both leagues collide on roster_id 1 and 2, with different results:
  // League A: roster 1 beats roster 2 (100-50).
  // League B: roster 1 loses to roster 2 (30-80).
  fetchMatchups.mockImplementation(async (leagueId: string) => {
    if (leagueId === LEAGUE_A.id) return [matchup(1, 1, 100), matchup(2, 1, 50)];
    if (leagueId === LEAGUE_B.id) return [matchup(1, 1, 30), matchup(2, 1, 80)];
    throw new Error(`unexpected leagueId ${leagueId}`);
  });

  fetchRostersWithOwners.mockImplementation(async (leagueId: string) => {
    if (leagueId === LEAGUE_A.id) return [roster(1, 'A-Team-One'), roster(2, 'A-Team-Two')];
    if (leagueId === LEAGUE_B.id) return [roster(1, 'B-Team-One'), roster(2, 'B-Team-Two')];
    throw new Error(`unexpected leagueId ${leagueId}`);
  });
});

describe('fetchStandingsTool: leagues fetched separately', () => {
  it('fetches matchups and rosters once per league, scoped to that league id', async () => {
    const { fetchStandingsTool } = await import('./standings');

    await fetchStandingsTool.execute({ week: 1 });

    expect(fetchMatchups.mock.calls.map(c => c[0]).sort()).toEqual(
      [LEAGUE_A.id, LEAGUE_B.id].sort(),
    );
    expect(fetchRostersWithOwners.mock.calls.map(c => c[0]).sort()).toEqual(
      [LEAGUE_A.id, LEAGUE_B.id].sort(),
    );
  });
});

describe('fetchStandingsTool: colliding roster_ids stay scoped to their own league', () => {
  it("never lets league B's roster 1 leak into league A's standings", async () => {
    const { fetchStandingsTool } = await import('./standings');

    const result = await fetchStandingsTool.execute({ week: 1 });

    const afcTeamNames = result.afc.allTeams.map(t => t.teamName);
    const nfcTeamNames = result.nfc.allTeams.map(t => t.teamName);

    expect(afcTeamNames.sort()).toEqual(['A-Team-One', 'A-Team-Two']);
    expect(nfcTeamNames.sort()).toEqual(['B-Team-One', 'B-Team-Two']);
  });

  it("computes each league's win/loss record from only its own matchups", async () => {
    const { fetchStandingsTool } = await import('./standings');

    const result = await fetchStandingsTool.execute({ week: 1 });

    const afcRosterOne = result.afc.allTeams.find(t => t.rosterId === 1)!;
    const nfcRosterOne = result.nfc.allTeams.find(t => t.rosterId === 1)!;

    // Same rosterId (1) in both leagues, opposite outcomes: A wins, B loses.
    expect(afcRosterOne.wins).toBe(1);
    expect(afcRosterOne.losses).toBe(0);
    expect(nfcRosterOne.wins).toBe(0);
    expect(nfcRosterOne.losses).toBe(1);
  });
});

describe('fetchStandingsTool: {afc, nfc} combination is presentation-layer only', () => {
  it("labels each league's result set with its own conference, not a merged blob", async () => {
    const { fetchStandingsTool } = await import('./standings');

    const result = await fetchStandingsTool.execute({ week: 1 });

    expect(result.afc.league).toBe('AFC');
    expect(result.nfc.league).toBe('NFC');
    expect(result.afc).not.toBe(result.nfc);
  });
});
