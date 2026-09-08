import { beforeEach, describe, expect, it, vi } from 'vitest';

const fetchLeagueOdds = vi.fn();
const fetchMatchupSimulation = vi.fn();
const getTeamNames = vi.fn();
const saveLeagueOddsHistory = vi.fn();
const saveSnapshotIfChanged = vi.fn();
const fetchMatchups = vi.fn(async () =>
  Array.from({ length: 12 }, (_, index) => ({
    matchup_id: Math.floor(index / 2) + 1,
    roster_id: index + 1,
    points: 0,
  })),
);

vi.mock('@gauntlet/server', () => ({
  createChildLogger: () => ({ info: vi.fn(), debug: vi.fn(), warn: vi.fn() }),
  createGauntletAPIClient: () => ({
    getCurrentWeek: async () => 1,
    fetchLeagueOdds,
    fetchMatchupSimulation,
    getTeamNames,
  }),
  createMetrics: () => ({
    increment: vi.fn(),
    recordDuration: vi.fn(),
    getSummary: () => ({ counters: {}, timers: {} }),
  }),
  disconnect: vi.fn(),
  saveLeagueOddsHistory,
  saveSnapshotIfChanged,
}));

vi.mock('@/lib/sleeper/unified-client', () => ({
  sleeperClient: {
    fetchMatchups,
  },
}));

describe('runLiveSnapshot', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getTeamNames.mockResolvedValue(new Map());
    fetchLeagueOdds.mockResolvedValue({
      highestScorer: [{ teamId: 'league:1', probability: 0.1 }],
      lowestScorer: [],
      closestMatchup: [],
      biggestBlowout: [],
      highestScoringMatchup: [],
      lowestScoringMatchup: [],
    });
    fetchMatchupSimulation.mockImplementation(
      async (_leagueId: string, _week: number, matchupId: number) => ({
        success: true,
        simulation: {
          team1WinPct: 0.5,
          team2WinPct: 0.5,
          team1Scores: { mean: 100 },
          team2Scores: { mean: 100 },
          impliedOdds: { spread: 0, total: 200 },
          teams: [
            { rosterId: matchupId * 2 - 1, players: [] },
            { rosterId: matchupId * 2, players: [] },
          ],
        },
      }),
    );
    saveSnapshotIfChanged.mockResolvedValue({ saved: true });
  });

  it('captures all three current leagues and persists one league-wide race snapshot', async () => {
    const { runLiveSnapshot } = await import('./snapshot-runner');

    const result = await runLiveSnapshot({ delayMs: 0 });

    expect(getTeamNames).toHaveBeenCalledTimes(3);
    expect(fetchMatchups).toHaveBeenCalledTimes(3);
    expect(fetchMatchupSimulation).toHaveBeenCalledTimes(18);
    expect(saveLeagueOddsHistory).toHaveBeenCalledWith(
      expect.objectContaining({
        season: 2026,
        week: 1,
        highestScorerOdds: [{ teamId: 'league:1', probability: 0.1 }],
      }),
    );
    expect(result.leagueOddsSaved).toBe(true);
  });
});
