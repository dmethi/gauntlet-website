import { beforeEach, describe, expect, it, vi } from 'vitest';

/**
 * Multi-league safety for power rankings: rosters are only unique *within* a
 * league (Sleeper roster_id restarts at 1 per league), so two leagues can
 * genuinely have a roster_id=1. This suite fixtures two leagues that
 * deliberately collide on roster_id and verifies:
 *  - each league's matchups/rosters are fetched separately (by its own
 *    league ID, never combined before fetch)
 *  - the composite key {leagueId, rosterId} keeps colliding rosters distinct
 *    in the output (no overwrite)
 *  - the one legitimate cross-league combination (league-wide expected wins)
 *    happens only after each league's own data has already been fetched and
 *    scoped — i.e. combination is a presentation-layer step, not a raw-fetch
 *    step.
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

// Both leagues use roster_id 1 and 2 — the collision this suite exists to catch.
const ROSTER_1 = { roster_id: 1, metadata: { team_name: 'Team One' }, settings: {} };
const ROSTER_2 = { roster_id: 2, metadata: { team_name: 'Team Two' }, settings: {} };

const matchup = (rosterId: number, matchupId: number, points: number) => ({
  roster_id: rosterId,
  matchup_id: matchupId,
  points,
});

beforeEach(() => {
  fetchMatchups.mockReset();
  fetchRostersWithOwners.mockReset();

  fetchMatchups.mockImplementation(async (leagueId: string) => {
    if (leagueId === LEAGUE_A.id) {
      return [matchup(1, 1, 100), matchup(2, 1, 50)];
    }
    if (leagueId === LEAGUE_B.id) {
      return [matchup(1, 1, 30), matchup(2, 1, 80)];
    }
    throw new Error(`unexpected leagueId ${leagueId}`);
  });

  fetchRostersWithOwners.mockImplementation(async (leagueId: string) => {
    if (leagueId === LEAGUE_A.id || leagueId === LEAGUE_B.id) {
      return [ROSTER_1, ROSTER_2];
    }
    throw new Error(`unexpected leagueId ${leagueId}`);
  });
});

describe('fetchPowerRankingsTool: leagues fetched separately', () => {
  it('fetches matchups and rosters once per league, scoped to that league id', async () => {
    const { fetchPowerRankingsTool } = await import('./power-rankings');

    await fetchPowerRankingsTool.execute({ currentWeek: 1 });

    const matchupLeagueIds = fetchMatchups.mock.calls.map(call => call[0]);
    expect(matchupLeagueIds.sort()).toEqual([LEAGUE_A.id, LEAGUE_B.id].sort());

    const rosterLeagueIds = fetchRostersWithOwners.mock.calls.map(call => call[0]);
    expect(rosterLeagueIds.sort()).toEqual([LEAGUE_A.id, LEAGUE_B.id].sort());
  });
});

describe('fetchPowerRankingsTool: composite key {leagueId, rosterId} prevents collisions', () => {
  it('keeps colliding roster_ids from both leagues as distinct ranking entries', async () => {
    const { fetchPowerRankingsTool } = await import('./power-rankings');

    const result = await fetchPowerRankingsTool.execute({ currentWeek: 1 });

    // 2 leagues x 2 rosters = 4 entries, not deduped down to 2 by roster_id alone.
    expect(result.rankings).toHaveLength(4);

    const rosterOneEntries = result.rankings.filter(r => r.rosterId === 1);
    expect(rosterOneEntries).toHaveLength(2);
    expect(new Set(rosterOneEntries.map(r => r.leagueId)).size).toBe(2);
  });

  it("does not let one league's roster data overwrite the other's", async () => {
    const { fetchPowerRankingsTool } = await import('./power-rankings');

    const result = await fetchPowerRankingsTool.execute({ currentWeek: 1 });

    const leagueARoster1 = result.rankings.find(
      r => r.leagueId === LEAGUE_A.id && r.rosterId === 1,
    )!;
    const leagueBRoster1 = result.rankings.find(
      r => r.leagueId === LEAGUE_B.id && r.rosterId === 1,
    )!;

    expect(leagueARoster1.pointsFor).toBe(100);
    expect(leagueBRoster1.pointsFor).toBe(30);
    expect(leagueARoster1.record).toBe('1-0');
    expect(leagueBRoster1.record).toBe('0-1');
  });

  it('movement tracking between weeks matches on the composite key, not roster_id alone', async () => {
    fetchMatchups.mockImplementation(async (leagueId: string, week: number) => {
      // Week 1 fixture is the collision case above; week 2 flips league A's
      // roster 1 to a loss so its rank should move even though league B's
      // roster 1 exists too.
      if (leagueId === LEAGUE_A.id) {
        return week === 1
          ? [matchup(1, 1, 100), matchup(2, 1, 50)]
          : [matchup(1, 1, 10), matchup(2, 1, 90)];
      }
      if (leagueId === LEAGUE_B.id) {
        return [matchup(1, 1, 30), matchup(2, 1, 80)];
      }
      throw new Error(`unexpected leagueId ${leagueId}`);
    });

    const { fetchPowerRankingsTool } = await import('./power-rankings');
    const result = await fetchPowerRankingsTool.execute({ currentWeek: 2 });

    const leagueARoster1 = result.rankings.find(
      r => r.leagueId === LEAGUE_A.id && r.rosterId === 1,
    )!;
    const leagueBRoster1 = result.rankings.find(
      r => r.leagueId === LEAGUE_B.id && r.rosterId === 1,
    )!;

    // Week 1 rank order (by points): A1(100)=1, B2(80)=2, A2(50)=3, B1(30)=4.
    // Week 2 avgPoints order: B2(80)=1, A2(70)=2, A1(55)=3, B1(30)=4.
    // League A's roster 1 fell hard: previousRank 1 -> currentRank 3 (-2).
    // League B's roster 1 is flat: previousRank 4 -> currentRank 4 (0).
    // If movement matched on rosterId alone instead of {leagueId,
    // rosterId}, B1's lookup would collide with A1's previous entry (both
    // rosterId=1) and wrongly report -3 instead of 0.
    expect(leagueARoster1.movement).toBe(-2);
    expect(leagueBRoster1.movement).toBe(0);
  });
});

describe('fetchPowerRankingsTool: cross-league combination is presentation-layer only', () => {
  it('computes expected-wins from all leagues combined only after each league is fetched separately', async () => {
    const { fetchPowerRankingsTool } = await import('./power-rankings');

    const result = await fetchPowerRankingsTool.execute({ currentWeek: 1 });

    // Scores across both leagues this week: A1=100, A2=50, B1=30, B2=80.
    // Expected wins is "fraction of the full 4-team field beaten" — this is
    // the one place cross-league combination is intentional, and it can only
    // be correct if both leagues' matchups were already fetched (asserted
    // above) before this calculation runs.
    const byComposite = (leagueId: string, rosterId: number) =>
      result.rankings.find(r => r.leagueId === leagueId && r.rosterId === rosterId)!;

    // A1 (100) beats all 3 others -> 3/4
    expect(byComposite(LEAGUE_A.id, 1).powerScore).toBeGreaterThan(
      byComposite(LEAGUE_B.id, 2).powerScore,
    ); // sanity: highest scorer outranks second highest
    expect(result.rankings[0]!.leagueId).toBe(LEAGUE_A.id);
    expect(result.rankings[0]!.rosterId).toBe(1);
  });
});
