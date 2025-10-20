import { describe, expect, it } from 'vitest';
import {
  calculateAllPositionalAdvantages,
  calculatePositionalMedians,
  getPositionSummaries,
  getTeamPositionalSummary,
  getTopPositionalAdvantages,
} from './positional-advantages';
import type { PlainStatsDataset } from './compose';

describe('Positional Advantages', () => {
  const createMockDataset = (): PlainStatsDataset => {
    const teams: PlainStatsDataset['teams'] = [
      [
        'afc-1',
        {
          teamInfo: {
            leagueId: 'afc',
            leagueName: 'AFC',
            rosterId: 1,
            teamName: 'Team 1',
            managerName: 'Manager 1',
            ownerId: 'user1',
          },
          teamScores: [],
          opponentScores: [],
          seasonTotals: {
            teamTotal: 1500,
            opponentTotal: 1400,
            diff: 100,
            avgDelta: 10,
            medianDelta: 5,
            rank24: 1,
            rankLeague: 1,
            gamesPlayed: 14,
          },
        },
      ],
      [
        'afc-2',
        {
          teamInfo: {
            leagueId: 'afc',
            leagueName: 'AFC',
            rosterId: 2,
            teamName: 'Team 2',
            managerName: 'Manager 2',
            ownerId: 'user2',
          },
          teamScores: [],
          opponentScores: [],
          seasonTotals: {
            teamTotal: 1400,
            opponentTotal: 1450,
            diff: -50,
            avgDelta: -5,
            medianDelta: -8,
            rank24: 2,
            rankLeague: 2,
            gamesPlayed: 14,
          },
        },
      ],
    ];

    const positions: PlainStatsDataset['positions'] = [
      [
        'QB',
        {
          position: 'QB',
          teams: [
            [
              'afc-1',
              {
                teamInfo: teams[0][1].teamInfo,
                scores: [
                  { week: 1, value: 25 },
                  { week: 2, value: 30 },
                ],
                opponentScores: [],
                seasonTotal: 55,
                opponentTotal: 0,
                diff: 0,
                rank24: 1,
                rankLeague: 1,
              },
            ],
            [
              'afc-2',
              {
                teamInfo: teams[1][1].teamInfo,
                scores: [
                  { week: 1, value: 15 },
                  { week: 2, value: 18 },
                ],
                opponentScores: [],
                seasonTotal: 33,
                opponentTotal: 0,
                diff: 0,
                rank24: 2,
                rankLeague: 2,
              },
            ],
          ],
        },
      ],
      [
        'RB',
        {
          position: 'RB',
          teams: [
            [
              'afc-1',
              {
                teamInfo: teams[0][1].teamInfo,
                scores: [
                  { week: 1, value: 35 },
                  { week: 2, value: 40 },
                ],
                opponentScores: [],
                seasonTotal: 75,
                opponentTotal: 0,
                diff: 0,
                rank24: 1,
                rankLeague: 1,
              },
            ],
            [
              'afc-2',
              {
                teamInfo: teams[1][1].teamInfo,
                scores: [
                  { week: 1, value: 30 },
                  { week: 2, value: 32 },
                ],
                opponentScores: [],
                seasonTotal: 62,
                opponentTotal: 0,
                diff: 0,
                rank24: 2,
                rankLeague: 2,
              },
            ],
          ],
        },
      ],
      [
        'WR',
        {
          position: 'WR',
          teams: [
            [
              'afc-1',
              {
                teamInfo: teams[0][1].teamInfo,
                scores: [
                  { week: 1, value: 30 },
                  { week: 2, value: 35 },
                ],
                opponentScores: [],
                seasonTotal: 65,
                opponentTotal: 0,
                diff: 0,
                rank24: 2,
                rankLeague: 2,
              },
            ],
            [
              'afc-2',
              {
                teamInfo: teams[1][1].teamInfo,
                scores: [
                  { week: 1, value: 40 },
                  { week: 2, value: 45 },
                ],
                opponentScores: [],
                seasonTotal: 85,
                opponentTotal: 0,
                diff: 0,
                rank24: 1,
                rankLeague: 1,
              },
            ],
          ],
        },
      ],
      [
        'TE',
        {
          position: 'TE',
          teams: [
            [
              'afc-1',
              {
                teamInfo: teams[0][1].teamInfo,
                scores: [
                  { week: 1, value: 12 },
                  { week: 2, value: 15 },
                ],
                opponentScores: [],
                seasonTotal: 27,
                opponentTotal: 0,
                diff: 0,
                rank24: 1,
                rankLeague: 1,
              },
            ],
            [
              'afc-2',
              {
                teamInfo: teams[1][1].teamInfo,
                scores: [
                  { week: 1, value: 8 },
                  { week: 2, value: 10 },
                ],
                opponentScores: [],
                seasonTotal: 18,
                opponentTotal: 0,
                diff: 0,
                rank24: 2,
                rankLeague: 2,
              },
            ],
          ],
        },
      ],
      [
        'DEF',
        {
          position: 'DEF',
          teams: [
            [
              'afc-1',
              {
                teamInfo: teams[0][1].teamInfo,
                scores: [
                  { week: 1, value: 8 },
                  { week: 2, value: 10 },
                ],
                opponentScores: [],
                seasonTotal: 18,
                opponentTotal: 0,
                diff: 0,
                rank24: 1,
                rankLeague: 1,
              },
            ],
            [
              'afc-2',
              {
                teamInfo: teams[1][1].teamInfo,
                scores: [
                  { week: 1, value: 6 },
                  { week: 2, value: 7 },
                ],
                opponentScores: [],
                seasonTotal: 13,
                opponentTotal: 0,
                diff: 0,
                rank24: 2,
                rankLeague: 2,
              },
            ],
          ],
        },
      ],
    ];

    return {
      currentWeek: 2,
      currentSeason: '2024',
      leagues: [{ id: 'afc', name: 'AFC' }],
      weekRange: { from: 1, to: 2 },
      teams,
      positions,
      weeklyPlayerData: {},
      weeklyMedians: {},
      weeklyAverages: {},
    };
  };

  describe('calculatePositionalMedians', () => {
    it('calculates median for each position', () => {
      const dataset = createMockDataset();
      const medians = calculatePositionalMedians(dataset, { from: 1, to: 2 });

      expect(medians.QB).toBeDefined();
      expect(medians.RB).toBeDefined();
      expect(medians.WR).toBeDefined();
      expect(medians.TE).toBeDefined();
      expect(medians.DEF).toBeDefined();
    });

    it('calculates correct QB median', () => {
      const dataset = createMockDataset();
      const medians = calculatePositionalMedians(dataset, { from: 1, to: 2 });

      // Team 1: (25 + 30) / 2 = 27.5
      // Team 2: (15 + 18) / 2 = 16.5
      // Median of [27.5, 16.5] = 22
      expect(medians.QB).toBeCloseTo(22, 0);
    });

    it('calculates all position medians', () => {
      const dataset = createMockDataset();
      const medians = calculatePositionalMedians(dataset, { from: 1, to: 2 });

      expect(medians.QB).toBeGreaterThan(0);
      expect(medians.RB).toBeGreaterThan(0);
      expect(medians.WR).toBeGreaterThan(0);
      expect(medians.TE).toBeGreaterThan(0);
      expect(medians.DEF).toBeGreaterThan(0);
    });
  });

  describe('calculateAllPositionalAdvantages', () => {
    it('calculates advantages for all teams and positions', () => {
      const dataset = createMockDataset();
      const advantages = calculateAllPositionalAdvantages(dataset, { from: 1, to: 2 });

      // 2 teams × 5 positions = 10 advantages
      expect(advantages).toHaveLength(10);
    });

    it('includes all required fields', () => {
      const dataset = createMockDataset();
      const advantages = calculateAllPositionalAdvantages(dataset, { from: 1, to: 2 });

      const firstAdvantage = advantages[0];
      expect(firstAdvantage.position).toBeDefined();
      expect(firstAdvantage.teamKey).toBeDefined();
      expect(firstAdvantage.teamName).toBeDefined();
      expect(firstAdvantage.leagueName).toBeDefined();
      expect(firstAdvantage.weeklyAverage).toBeDefined();
      expect(firstAdvantage.leagueMedian).toBeDefined();
      expect(firstAdvantage.advantage).toBeDefined();
      expect(firstAdvantage.percentageAdvantage).toBeDefined();
    });

    it('calculates positive advantages correctly', () => {
      const dataset = createMockDataset();
      const advantages = calculateAllPositionalAdvantages(dataset, { from: 1, to: 2 });

      const qbAdvantages = advantages.filter(a => a.position === 'QB');
      const team1QB = qbAdvantages.find(a => a.teamKey === 'afc-1');

      // Team 1 QB average is 27.5, median is 22, so advantage is positive
      expect(team1QB?.advantage).toBeGreaterThan(0);
    });

    it('calculates negative advantages (disadvantages) correctly', () => {
      const dataset = createMockDataset();
      const advantages = calculateAllPositionalAdvantages(dataset, { from: 1, to: 2 });

      const qbAdvantages = advantages.filter(a => a.position === 'QB');
      const team2QB = qbAdvantages.find(a => a.teamKey === 'afc-2');

      // Team 2 QB average is 16.5, median is 22, so advantage is negative
      expect(team2QB?.advantage).toBeLessThan(0);
    });

    it('calculates percentage advantage', () => {
      const dataset = createMockDataset();
      const advantages = calculateAllPositionalAdvantages(dataset, { from: 1, to: 2 });

      const qbAdvantages = advantages.filter(a => a.position === 'QB');
      const team1QB = qbAdvantages.find(a => a.teamKey === 'afc-1');

      expect(team1QB?.percentageAdvantage).toBeDefined();
      expect(typeof team1QB?.percentageAdvantage).toBe('number');
    });
  });

  describe('getTeamPositionalSummary', () => {
    it('returns summary for valid team', () => {
      const dataset = createMockDataset();
      const summary = getTeamPositionalSummary(dataset, 'afc-1', { from: 1, to: 2 });

      expect(summary).toBeDefined();
      expect(summary?.teamKey).toBe('afc-1');
      expect(summary?.teamName).toBe('Team 1');
      expect(summary?.leagueName).toBe('AFC');
    });

    it('includes all positions in summary', () => {
      const dataset = createMockDataset();
      const summary = getTeamPositionalSummary(dataset, 'afc-1', { from: 1, to: 2 });

      expect(summary?.positions.QB).toBeDefined();
      expect(summary?.positions.RB).toBeDefined();
      expect(summary?.positions.WR).toBeDefined();
      expect(summary?.positions.TE).toBeDefined();
      expect(summary?.positions.DEF).toBeDefined();
    });

    it('calculates total advantage', () => {
      const dataset = createMockDataset();
      const summary = getTeamPositionalSummary(dataset, 'afc-1', { from: 1, to: 2 });

      expect(summary?.totalAdvantage).toBeDefined();
      expect(typeof summary?.totalAdvantage).toBe('number');
    });

    it('calculates average advantage', () => {
      const dataset = createMockDataset();
      const summary = getTeamPositionalSummary(dataset, 'afc-1', { from: 1, to: 2 });

      expect(summary?.averageAdvantage).toBeDefined();
      expect(typeof summary?.averageAdvantage).toBe('number');
    });

    it('returns null for invalid team', () => {
      const dataset = createMockDataset();
      const summary = getTeamPositionalSummary(dataset, 'invalid-team', { from: 1, to: 2 });

      expect(summary).toBeNull();
    });
  });

  describe('getPositionSummaries', () => {
    it('returns summaries for all positions', () => {
      const dataset = createMockDataset();
      const summaries = getPositionSummaries(dataset, { from: 1, to: 2 });

      expect(summaries).toHaveLength(5);
      expect(summaries.map(s => s.position)).toContain('QB');
      expect(summaries.map(s => s.position)).toContain('RB');
      expect(summaries.map(s => s.position)).toContain('WR');
      expect(summaries.map(s => s.position)).toContain('TE');
      expect(summaries.map(s => s.position)).toContain('DEF');
    });

    it('includes league median for each position', () => {
      const dataset = createMockDataset();
      const summaries = getPositionSummaries(dataset, { from: 1, to: 2 });

      summaries.forEach(summary => {
        expect(summary.leagueMedian).toBeDefined();
        expect(typeof summary.leagueMedian).toBe('number');
      });
    });

    it('includes all teams in each position summary', () => {
      const dataset = createMockDataset();
      const summaries = getPositionSummaries(dataset, { from: 1, to: 2 });

      summaries.forEach(summary => {
        expect(summary.teams.length).toBeGreaterThan(0);
      });
    });

    it('assigns ranks to teams by weekly average', () => {
      const dataset = createMockDataset();
      const summaries = getPositionSummaries(dataset, { from: 1, to: 2 });

      const qbSummary = summaries.find(s => s.position === 'QB');
      expect(qbSummary).toBeDefined();
      expect(qbSummary?.teams.every(t => t.rank > 0)).toBe(true);

      // Check ranks are in order
      const ranks = qbSummary?.teams.map(t => t.rank).sort((a, b) => a - b);
      expect(ranks).toEqual([1, 2]);
    });

    it('sorts teams by weekly average descending', () => {
      const dataset = createMockDataset();
      const summaries = getPositionSummaries(dataset, { from: 1, to: 2 });

      const qbSummary = summaries.find(s => s.position === 'QB');
      const teams = qbSummary?.teams || [];

      for (let i = 1; i < teams.length; i++) {
        expect(teams[i - 1].weeklyAverage).toBeGreaterThanOrEqual(teams[i].weeklyAverage);
      }
    });
  });

  describe('getTopPositionalAdvantages', () => {
    it('returns top advantages and disadvantages', () => {
      const dataset = createMockDataset();
      const result = getTopPositionalAdvantages(dataset, { from: 1, to: 2 }, 5);

      expect(result.topAdvantages).toBeDefined();
      expect(result.topDisadvantages).toBeDefined();
    });

    it('filters advantages correctly', () => {
      const dataset = createMockDataset();
      const result = getTopPositionalAdvantages(dataset, { from: 1, to: 2 }, 5);

      // All top advantages should have positive advantage values
      result.topAdvantages.forEach(adv => {
        expect(adv.advantage).toBeGreaterThan(0);
      });
    });

    it('filters disadvantages correctly', () => {
      const dataset = createMockDataset();
      const result = getTopPositionalAdvantages(dataset, { from: 1, to: 2 }, 5);

      // All top disadvantages should have negative advantage values
      result.topDisadvantages.forEach(adv => {
        expect(adv.advantage).toBeLessThan(0);
      });
    });

    it('limits results to specified count', () => {
      const dataset = createMockDataset();
      const result = getTopPositionalAdvantages(dataset, { from: 1, to: 2 }, 3);

      expect(result.topAdvantages.length).toBeLessThanOrEqual(3);
      expect(result.topDisadvantages.length).toBeLessThanOrEqual(3);
    });

    it('sorts advantages by magnitude descending', () => {
      const dataset = createMockDataset();
      const result = getTopPositionalAdvantages(dataset, { from: 1, to: 2 }, 10);

      const advantages = result.topAdvantages;
      for (let i = 1; i < advantages.length; i++) {
        expect(advantages[i - 1].advantage).toBeGreaterThanOrEqual(advantages[i].advantage);
      }
    });

    it('sorts disadvantages by magnitude ascending (most negative first)', () => {
      const dataset = createMockDataset();
      const result = getTopPositionalAdvantages(dataset, { from: 1, to: 2 }, 10);

      const disadvantages = result.topDisadvantages;
      for (let i = 1; i < disadvantages.length; i++) {
        expect(disadvantages[i - 1].advantage).toBeLessThanOrEqual(disadvantages[i].advantage);
      }
    });
  });
});
