import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { TeamSummaryCard } from './TeamSummaryCard';
import type { TeamTotalsResult } from './utils';

const buildTotals = (): TeamTotalsResult => ({
  teamKey: 'L1-1',
  teamInfo: {
    teamName: 'Alpha',
    leagueName: 'Premier',
    avatar: undefined,
    leagueId: 'L1',
    rosterId: 1,
  },
  leagueId: 'L1',
  weeks: [1, 2, 3],
  teamTotal: 360,
  opponentTotal: 330,
  gamesPlayed: 3,
  wins: 2,
  losses: 1,
  ties: 0,
  leagueTotals: [360, 340, 300],
  leagueAverageByWeek: [120, 110, 130],
  leagueMedianByWeek: [118, 108, 126],
  leagueAverage: 333.3,
  leagueMedian: 320,
  seasonRank24: 2,
  seasonRankLeague: 1,
  averageOpponentRank: 8,
  consistencyScore: 87,
  topPerformers: [
    {
      playerId: 'p1',
      name: 'MVP Player',
      totalPoints: 75.2,
      team: 'ALP',
      appearances: 3,
    },
  ],
});

describe('TeamSummaryCard', () => {
  it('renders team overview with record and top performers', () => {
    const data = buildTotals();
    render(<TeamSummaryCard fromWeek={1} toWeek={3} data={data} />);

    expect(screen.getByText(/Team Overview/)).toBeInTheDocument();
    expect(screen.getByText(/Alpha/)).toBeInTheDocument();
    expect(screen.getByText('2-1')).toBeInTheDocument();
    expect(screen.getByText('MVP Player')).toBeInTheDocument();
    expect(screen.getByText('75.2')).toBeInTheDocument();
  });
});
