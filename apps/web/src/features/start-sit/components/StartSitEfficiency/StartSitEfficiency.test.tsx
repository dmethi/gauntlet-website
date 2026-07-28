import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { StartSitData } from '@/features/start-sit/types';
import { StartSitEfficiency } from './StartSitEfficiency';

vi.mock('@/lib/hooks', () => ({
  usePlayers: () => ({
    data: {
      players: {
        'player-a': { full_name: 'Alpha Runner' },
        'player-b': { full_name: 'Beta Back' },
      },
    },
    isLoading: false,
  }),
}));

const createStartSitData = (): StartSitData => ({
  managerEfficiencies: [
    {
      managerId: 'manager-1',
      managerName: 'Manager One',
      leagueId: 'league-44209',
      decisions: [
        {
          managerId: 'manager-1',
          managerName: 'Manager One',
          leagueId: 'league-44209',
          week: 1,
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
        },
      ],
      overallDecisionRate: 0.6,
      overallEfficiencyRate: 0.55,
      weightedDecisionScore: 0.68,
      pointsImpactScore: 5.2,
      positionBreakdown: {
        RB: {
          decisionRate: 0.6,
          efficiencyRate: 0.55,
          decisionsCount: 5,
          weight: 0.7,
          pointsLost: 7.5,
          pointsLostVsMedian: -1.1,
        },
      },
    },
  ],
  worstDecisions: [
    {
      managerId: 'manager-1',
      managerName: 'Manager One',
      leagueId: 'league-44209',
      week: 1,
      position: 'RB1',
      selectedPlayer: {
        playerId: 'player-a',
        projectedPoints: 12,
        actualPoints: 8,
      },
      alternatives: [],
      optimalPlayer: {
        playerId: 'player-b',
        projectedPoints: 11,
        actualPoints: 14,
        adjustedActualPoints: 14,
        source: 'bench',
      },
      pointsLeft: 6,
      weight: 0.7,
      isRiskyDecision: false,
      projectionDifferential: 0,
      actualOutcome: 0,
    },
  ],
  bestRiskyDecisions: [
    {
      managerId: 'manager-1',
      managerName: 'Manager One',
      leagueId: 'league-44209',
      week: 2,
      position: 'RB1',
      selectedPlayer: {
        playerId: 'player-a',
        projectedPoints: 10,
        actualPoints: 15,
      },
      alternatives: [],
      optimalPlayer: {
        playerId: 'player-a',
        projectedPoints: 10,
        actualPoints: 15,
        adjustedActualPoints: 15,
        source: 'selected',
      },
      pointsLeft: 0,
      weight: 0.7,
      isRiskyDecision: true,
      projectionDifferential: 2,
      actualOutcome: 5,
    },
  ],
  rosterContext: [
    {
      managerId: 'manager-1',
      managerName: 'Manager One',
      leagueId: 'league-44209',
      week: 1,
      startingLineup: [{ position: 'RB1', player: { playerId: 'player-a' }, pointsScored: 10 }],
      benchPlayers: [{ player: { playerId: 'player-b' }, pointsScored: 12 }],
      waiverAlternatives: [{ player: { playerId: 'player-b' }, adjustedPoints: 13 }],
      decisions: [
        {
          managerId: 'manager-1',
          managerName: 'Manager One',
          leagueId: 'league-44209',
          week: 1,
          position: 'RB1',
          selectedPlayer: {
            playerId: 'player-a',
            projectedPoints: 12,
            actualPoints: 10,
          },
          alternatives: [],
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
        },
      ],
    },
  ],
  leagueStats: {
    totalDecisions: 10,
    avgWeightedScore: 0.65,
    avgPointsImpact: 7.5,
  },
  timestamp: new Date().toISOString(),
  configuration: {
    projectionThreshold: 0.15,
    waiverDiscount: 0.35,
    weeks: [1, 2],
    season: '2025',
    weightedScoring: true,
  },
});

describe('StartSitEfficiency component', () => {
  it('renders overall summary and manager leaderboard', () => {
    const data = createStartSitData();
    render(<StartSitEfficiency data={data} />);

    expect(screen.getByText(/Manager Rankings/)).toBeInTheDocument();
    expect(screen.getByText(/Manager One/)).toBeInTheDocument();
    expect(screen.getByText(/Worst Decisions/)).toBeInTheDocument();
  });
});
