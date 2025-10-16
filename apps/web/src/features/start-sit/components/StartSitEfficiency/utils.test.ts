import { describe, expect, it } from 'vitest';
import type { DecisionDetail, ManagerEfficiency, StartSitData } from '@/features/start-sit/types';
import {
  buildManagerOptions,
  calculateEfficiencyScore,
  calculateMissedPoints,
  calculateOptimalLineup,
  calculatePositionalEfficiency,
  calculateReplacementValue,
  calculateSummaryMetrics,
  calculateWeeklyEfficiency,
  collectPlayerIds,
  getLeagueLabel,
  getPlayerDisplayName,
} from './utils';

const createDecision = (overrides: Partial<DecisionDetail> = {}): DecisionDetail => ({
  managerId: 'manager-1',
  managerName: 'Manager One',
  leagueId: 'league-44209',
  week: 2,
  position: 'RB1',
  selectedPlayer: {
    playerId: 'player-a',
    projectedPoints: 12,
    actualPoints: 10,
  },
  alternatives: [
    {
      playerId: 'player-b',
      projectedPoints: 11,
      actualPoints: 14,
      adjustedActualPoints: 14,
      source: 'bench',
    },
  ],
  optimalPlayer: {
    playerId: 'player-b',
    projectedPoints: 11,
    actualPoints: 14,
    adjustedActualPoints: 14,
    source: 'bench',
  },
  pointsLeft: 4,
  weight: 0.7,
  isRiskyDecision: false,
  projectionDifferential: 0,
  actualOutcome: 0,
  ...overrides,
});

const createManager = (overrides: Partial<ManagerEfficiency> = {}): ManagerEfficiency => ({
  managerId: 'manager-1',
  managerName: 'Manager One',
  leagueId: 'league-44209',
  decisions: [createDecision()],
  overallDecisionRate: 0.6,
  overallEfficiencyRate: 0.55,
  weightedDecisionScore: 0.65,
  pointsImpactScore: 8.2,
  positionBreakdown: {
    QB: {
      decisionRate: 0.7,
      efficiencyRate: 0.68,
      decisionsCount: 5,
      weight: 0.8,
      pointsLost: 3.5,
      pointsLostVsMedian: 2.1,
    },
  },
  ...overrides,
});

describe('Start/Sit efficiency utils', () => {
  it('calculates efficiency score with guard rails', () => {
    expect(calculateEfficiencyScore(0, 0)).toBe(100);
    expect(calculateEfficiencyScore(0, 10)).toBe(0);
    expect(calculateEfficiencyScore(8, 10)).toBeCloseTo(80);
    expect(calculateEfficiencyScore(12, 10)).toBe(100);
  });

  it('aggregates missed points across decisions', () => {
    const decisions = [createDecision({ pointsLeft: 4 }), createDecision({ pointsLeft: 1.5 })];
    expect(calculateMissedPoints(decisions)).toBeCloseTo(5.5);
  });

  it('computes optimal lineup totals and efficiency', () => {
    const decisions = [
      createDecision({
        selectedPlayer: { playerId: 'player-a', projectedPoints: 12, actualPoints: 10 },
        optimalPlayer: {
          playerId: 'player-b',
          projectedPoints: 14,
          actualPoints: 15,
          adjustedActualPoints: 15,
          source: 'bench',
        },
      }),
      createDecision({
        selectedPlayer: { playerId: 'player-c', projectedPoints: 8, actualPoints: 7 },
        optimalPlayer: {
          playerId: 'player-c',
          projectedPoints: 8,
          actualPoints: 7,
          adjustedActualPoints: 7,
          source: 'selected',
        },
      }),
    ];

    const result = calculateOptimalLineup(decisions);
    expect(result.startedPoints).toBe(17);
    expect(result.optimalPoints).toBe(22);
    expect(result.efficiency).toBeCloseTo((17 / 22) * 100);
  });

  it('lists positional efficiency entries', () => {
    const manager = createManager({
      positionBreakdown: {
        QB: {
          decisionRate: 0.7,
          efficiencyRate: 0.68,
          decisionsCount: 5,
          weight: 0.8,
          pointsLost: 3.5,
          pointsLostVsMedian: 2.1,
        },
        RB: {
          decisionRate: 0.6,
          efficiencyRate: 0.55,
          decisionsCount: 10,
          weight: 0.7,
          pointsLost: 7.5,
          pointsLostVsMedian: -1.1,
        },
      },
    });

    const breakdown = calculatePositionalEfficiency(manager);
    expect(breakdown).toHaveLength(2);
    expect(breakdown[0].position).toBe('QB');
  });

  it('computes weekly efficiency scores', () => {
    const decisions = [
      createDecision({ week: 1 }),
      createDecision({
        week: 1,
        selectedPlayer: { playerId: 'player-b', projectedPoints: 10, actualPoints: 9 },
        optimalPlayer: {
          playerId: 'player-b',
          projectedPoints: 10,
          actualPoints: 9,
          adjustedActualPoints: 9,
          source: 'selected',
        },
      }),
      createDecision({ week: 2 }),
    ];

    const weeks = calculateWeeklyEfficiency(decisions);
    expect(weeks).toHaveLength(2);
    expect(weeks[0].week).toBe(1);
    expect(weeks[1].week).toBe(2);
  });

  it('calculates replacement value from alternatives', () => {
    const decision = createDecision({
      selectedPlayer: { playerId: 'player-a', projectedPoints: 10, actualPoints: 8 },
      alternatives: [
        {
          playerId: 'player-b',
          projectedPoints: 9,
          actualPoints: 12,
          adjustedActualPoints: 12,
          source: 'bench',
        },
        {
          playerId: 'player-c',
          projectedPoints: 9.5,
          actualPoints: 11,
          adjustedActualPoints: 11,
          source: 'waiver',
        },
      ],
    });

    expect(calculateReplacementValue(decision)).toBe(4);
  });

  it('collects unique player ids from data sources', () => {
    const data: StartSitData = {
      managerEfficiencies: [
        {
          ...createManager(),
          decisions: [
            createDecision(),
            createDecision({
              selectedPlayer: { playerId: 'player-z', projectedPoints: 10, actualPoints: 9 },
            }),
          ],
        },
      ],
      worstDecisions: [
        createDecision({
          selectedPlayer: { playerId: 'player-x', projectedPoints: 9, actualPoints: 4 },
          optimalPlayer: {
            playerId: 'player-y',
            projectedPoints: 12,
            actualPoints: 16,
            adjustedActualPoints: 16,
            source: 'bench',
          },
        }),
      ],
      bestRiskyDecisions: [],
      rosterContext: [
        {
          managerId: 'manager-1',
          managerName: 'Manager One',
          leagueId: 'league-44209',
          week: 2,
          startingLineup: [{ position: 'QB', player: { playerId: 'player-q' }, pointsScored: 18 }],
          benchPlayers: [{ player: { playerId: 'player-r' }, pointsScored: 12 }],
          waiverAlternatives: [{ player: { playerId: 'player-s' }, adjustedPoints: 14 }],
          decisions: [],
        },
      ],
      leagueStats: {
        totalDecisions: 5,
        avgWeightedScore: 0.65,
        avgPointsImpact: 7.5,
      },
      timestamp: new Date().toISOString(),
      configuration: undefined,
    };

    const ids = collectPlayerIds(data);
    expect(ids).toEqual(
      expect.arrayContaining([
        'player-a',
        'player-b',
        'player-z',
        'player-x',
        'player-y',
        'player-q',
        'player-r',
        'player-s',
      ]),
    );
  });

  it('builds manager options with league labels', () => {
    const options = buildManagerOptions([
      createManager({ managerId: 'a', managerName: 'Alpha', leagueId: 'foo-44209' }),
      createManager({ managerId: 'b', managerName: 'Beta', leagueId: 'foo-999' }),
    ]);

    expect(options).toEqual([
      { value: 'a', label: 'Alpha', leagueLabel: 'AFC' },
      { value: 'b', label: 'Beta', leagueLabel: 'NFC' },
    ]);
  });

  it('derives summary metrics from managers', () => {
    const summary = calculateSummaryMetrics(
      [
        createManager({ weightedDecisionScore: 0.6, pointsImpactScore: 7 }),
        createManager({ weightedDecisionScore: 0.7, pointsImpactScore: 5 }),
      ],
      42,
    );

    expect(summary.averageWeightedScore).toBeCloseTo(0.65);
    expect(summary.averagePointsImpact).toBeCloseTo(6);
    expect(summary.totalDecisions).toBe(42);
    expect(summary.managerCount).toBe(2);
  });

  it('maps league IDs to friendly labels', () => {
    expect(getLeagueLabel('44209')).toBe('AFC');
    expect(getLeagueLabel('some-other')).toBe('NFC');
  });

  it('derives player display names with graceful fallbacks', () => {
    const players = {
      'player-a': { full_name: 'Alpha Runner' },
      'player-b': { firstName: 'Beta', lastName: 'Back' },
    };

    expect(getPlayerDisplayName('player-a', players)).toBe('Alpha Runner');
    expect(getPlayerDisplayName('player-b', players)).toBe('Beta Back');
    expect(getPlayerDisplayName('player-c', players)).toMatch(/^Player /);
  });
});
