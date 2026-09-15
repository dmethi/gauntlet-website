import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import type { PlainStatsDataset } from '@/shared/utils/stats';
import { StatsContent } from './stats-content';

vi.mock('@/features/stats/components/TeamView', () => ({
  TeamView: () => <div>Team view content</div>,
}));
vi.mock('@/features/stats/components/LeagueView', () => ({
  LeagueView: () => <div>League view content</div>,
}));
vi.mock('./components/ScheduleAnalysis', () => ({
  ScheduleAnalysis: () => <div>Schedule view content</div>,
}));
vi.mock('./components/ScatterAnalysis', () => ({
  ScatterAnalysis: () => <div>Scatter view content</div>,
}));
vi.mock('./components/TrendsView', () => ({
  TrendsView: () => <div>Trends view content</div>,
}));
vi.mock('@/features/transactions/components/TransactionAnalysis', () => ({
  TransactionAnalysis: () => <div>Transactions view content</div>,
}));
vi.mock('@/features/waiver-analysis/components', () => ({
  WaiverAnalysisHub: () => <div>Waiver view content</div>,
}));
vi.mock('@/components/stats/StartSitEfficiencyTab', () => ({
  default: () => <div>Start/Sit view content</div>,
}));

const dataset: PlainStatsDataset = {
  currentWeek: 2,
  currentSeason: '2026',
  leagues: [],
  weekRange: { from: 1, to: 18 },
  teams: [
    [
      'league-1:1',
      {
        teamInfo: {
          teamName: 'Alpha',
          leagueName: 'Premier',
          leagueId: 'league-1',
          rosterId: 1,
        },
        teamScores: [{ week: 1, value: 120 }],
        opponentScores: [{ week: 1, value: 110 }],
        seasonTotals: {
          teamTotal: 120,
          opponentTotal: 110,
          diff: 10,
          avgDelta: 5,
          medianDelta: 4,
          rank24: 1,
          rankLeague: 1,
          gamesPlayed: 1,
        },
      },
    ],
  ],
  positions: [],
  weeklyPlayerData: {},
  weeklyMedians: {},
  weeklyAverages: {},
};

describe('StatsContent navigation', () => {
  it('labels the view navigation and exposes the active view', async () => {
    const user = userEvent.setup();
    render(<StatsContent dataset={dataset} searchParams={{}} leagues={[]} />);

    const navigation = screen.getByRole('navigation', { name: 'Stats views' });
    expect(navigation).toHaveAttribute('tabindex', '0');
    expect(screen.getByRole('button', { name: 'Team Analysis' })).toHaveAttribute(
      'aria-current',
      'page',
    );
    expect(document.querySelector('[data-scroll-cue]')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Trends' }));

    expect(screen.getByRole('button', { name: 'Trends' })).toHaveAttribute('aria-current', 'page');
    expect(screen.getByText('Trends view content')).toBeInTheDocument();
  });

  it('gives every view control a 44px minimum touch target', () => {
    render(<StatsContent dataset={dataset} searchParams={{}} leagues={[]} />);

    for (const button of screen.getAllByRole('button')) {
      expect(button).toHaveClass('min-h-11');
    }
  });
});
