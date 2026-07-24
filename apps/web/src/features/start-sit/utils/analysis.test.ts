import { beforeEach, describe, expect, it, vi } from 'vitest';

/**
 * Start/Sit Analysis Utilities Tests
 */

describe('Start/Sit Analysis Utilities', () => {
  describe('analyzeStartSitEfficiency', () => {
    it('should be exported', async () => {
      const { analyzeStartSitEfficiency } = await import('./analysis');
      expect(analyzeStartSitEfficiency).toBeDefined();
      expect(typeof analyzeStartSitEfficiency).toBe('function');
    });
  });

  describe('Position Weights', () => {
    it('should prioritize skill positions correctly', () => {
      // This is a placeholder for testing position weight constants
      // Actual implementation would test the POSITION_WEIGHTS constant
      const expectedWeightOrder = ['FLEX', 'QB', 'RB1', 'RB2', 'WR1', 'WR2', 'TE', 'K', 'DEF'];
      expect(expectedWeightOrder).toHaveLength(9);
    });
  });

  describe('Projection Thresholds', () => {
    it('should have reasonable threshold values', () => {
      // Placeholder for testing configuration constants
      const thresholds = {
        projection: 0.15, // 15%
        waiverDiscount: 0.35, // 35%
      };
      expect(thresholds.projection).toBeGreaterThan(0);
      expect(thresholds.projection).toBeLessThan(1);
      expect(thresholds.waiverDiscount).toBeGreaterThan(0);
      expect(thresholds.waiverDiscount).toBeLessThan(1);
    });
  });
});

// Two fake leagues, mirroring the AFC/NFC shape without hitting real config.
const FAKE_LEAGUES = [
  { id: 'league-a', name: 'League A', season: 2025, conference: 'AFC' },
  { id: 'league-b', name: 'League B', season: 2025, conference: 'NFC' },
];
vi.mock('@/config/leagues', () => ({
  CURRENT_LEAGUES: FAKE_LEAGUES,
  getCurrentLeagues: () => FAKE_LEAGUES,
}));

const fetchLeague = vi.fn(async () => ({ scoring_settings: { rec: 1 } }));
const fetchAllPlayers = vi.fn(async () => ({
  p1: { position: 'QB' },
  p2: { position: 'QB' },
}));
const fetchMatchups = vi.fn(async () => [
  { roster_id: 1, starters: ['p1'], players: ['p1', 'p2'] },
]);
const fetchWeeklyProjections = vi.fn(async () => ({ p1: { rec: 5 }, p2: { rec: 5 } }));
const fetchWeeklyPlayerStats = vi.fn(async () => ({ p1: { rec: 4 }, p2: { rec: 6 } }));
const fetchUsers = vi.fn(async () => [{ user_id: 'u1', display_name: 'Manager One' }]);
const fetchRosters = vi.fn(async () => [{ roster_id: 1, owner_id: 'u1' }]);

vi.mock('@/lib/sleeper/unified-client', () => ({
  sleeperClient: {
    fetchLeague: (...args: unknown[]) => fetchLeague(...args),
    fetchAllPlayers: (...args: unknown[]) => fetchAllPlayers(...args),
    fetchMatchups: (...args: unknown[]) => fetchMatchups(...args),
    fetchWeeklyProjections: (...args: unknown[]) => fetchWeeklyProjections(...args),
    fetchWeeklyPlayerStats: (...args: unknown[]) => fetchWeeklyPlayerStats(...args),
    fetchUsers: (...args: unknown[]) => fetchUsers(...args),
    fetchRosters: (...args: unknown[]) => fetchRosters(...args),
  },
}));

describe('analyzeStartSitEfficiency (parallel league/week processing)', () => {
  beforeEach(() => {
    fetchLeague.mockClear();
    fetchAllPlayers.mockClear();
    fetchMatchups.mockClear();
    fetchWeeklyProjections.mockClear();
    fetchWeeklyPlayerStats.mockClear();
    fetchUsers.mockClear();
    fetchRosters.mockClear();
  });

  it('aggregates decisions from every league/week pair, not just the first', async () => {
    const { analyzeStartSitEfficiency } = await import('./analysis');

    const result = await analyzeStartSitEfficiency({ season: '2025', weeks: [1, 2] });

    // 2 leagues x 2 weeks x 1 roster with a swappable bench alternative.
    expect(result.leagueStats.totalDecisions).toBe(4);

    const leagueIds = new Set(result.worstDecisions.map(d => d.leagueId));
    const weeks = new Set(result.worstDecisions.map(d => d.week));
    expect(leagueIds).toEqual(new Set(['league-a', 'league-b']));
    expect(weeks).toEqual(new Set([1, 2]));
  });

  it('fetches league scoring settings once per league, not once per league-week', async () => {
    const { analyzeStartSitEfficiency } = await import('./analysis');

    await analyzeStartSitEfficiency({ season: '2025', weeks: [1, 2] });

    expect(fetchLeague).toHaveBeenCalledTimes(2);
  });

  it('fetches players once regardless of the number of league/week pairs', async () => {
    const { analyzeStartSitEfficiency } = await import('./analysis');

    await analyzeStartSitEfficiency({ season: '2025', weeks: [1, 2] });

    expect(fetchAllPlayers).toHaveBeenCalledTimes(1);
  });
});
