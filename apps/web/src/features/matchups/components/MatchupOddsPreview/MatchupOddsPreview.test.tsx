import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MatchupOddsPreview } from './MatchupOddsPreview';
import * as useMatchupOddsModule from '../../hooks/useMatchupOdds';
import type { MatchupOddsData } from '../../types';

// Mock the hook
vi.mock('../../hooks/useMatchupOdds');

const mockOddsData: MatchupOddsData = {
  team1WinPct: 0.65,
  team2WinPct: 0.35,
  impliedOdds: {
    spread: 3.5,
    total: 45.5,
    team1MoneyLine: -186,
    team2MoneyLine: 156,
  },
  team1ScoreDistribution: {
    mean: 24.5,
    median: 24,
    stdDev: 5.2,
    p10: 18,
    p25: 21,
    p75: 28,
    p90: 31,
  },
  team2ScoreDistribution: {
    mean: 21.0,
    median: 21,
    stdDev: 4.8,
    p10: 15,
    p25: 18,
    p75: 24,
    p90: 27,
  },
};

describe('MatchupOddsPreview', () => {
  it('renders loading state', () => {
    vi.spyOn(useMatchupOddsModule, 'useMatchupOdds').mockReturnValue({
      oddsData: null,
      loading: true,
      error: null,
    });

    render(
      <MatchupOddsPreview
        leagueId="12345"
        week={5}
        matchupId={1}
        teamAName="Chiefs"
        teamBName="Bills"
      />,
    );

    expect(screen.getByText('Loading odds...')).toBeInTheDocument();
  });

  it('renders error state when error occurs', () => {
    vi.spyOn(useMatchupOddsModule, 'useMatchupOdds').mockReturnValue({
      oddsData: null,
      loading: false,
      error: 'Failed to load odds',
    });

    render(
      <MatchupOddsPreview
        leagueId="12345"
        week={5}
        matchupId={1}
        teamAName="Chiefs"
        teamBName="Bills"
      />,
    );

    expect(screen.getByText('Odds unavailable')).toBeInTheDocument();
  });

  it('renders error state when no odds data', () => {
    vi.spyOn(useMatchupOddsModule, 'useMatchupOdds').mockReturnValue({
      oddsData: null,
      loading: false,
      error: null,
    });

    render(
      <MatchupOddsPreview
        leagueId="12345"
        week={5}
        matchupId={1}
        teamAName="Chiefs"
        teamBName="Bills"
      />,
    );

    expect(screen.getByText('Odds unavailable')).toBeInTheDocument();
  });

  it('renders odds data successfully', () => {
    vi.spyOn(useMatchupOddsModule, 'useMatchupOdds').mockReturnValue({
      oddsData: mockOddsData,
      loading: false,
      error: null,
    });

    render(
      <MatchupOddsPreview
        leagueId="12345"
        week={5}
        matchupId={1}
        teamAName="Chiefs"
        teamBName="Bills"
      />,
    );

    // Check header
    expect(screen.getByText('Live Odds')).toBeInTheDocument();
    expect(screen.getByText('10k sims')).toBeInTheDocument();

    // Check team names
    expect(screen.getByText('Chiefs')).toBeInTheDocument();
    expect(screen.getByText('Bills')).toBeInTheDocument();

    // Check win probabilities
    expect(screen.getByText('65%')).toBeInTheDocument();
    expect(screen.getByText('35%')).toBeInTheDocument();

    // Check moneylines
    expect(screen.getByText('-186')).toBeInTheDocument();
    expect(screen.getByText('+156')).toBeInTheDocument();

    // Check spread and total
    expect(screen.getByText(/Spread:/)).toBeInTheDocument();
    expect(screen.getByText(/Chiefs 3.5/)).toBeInTheDocument();
    expect(screen.getByText(/O\/U:/)).toBeInTheDocument();
    expect(screen.getByText(/45.5/)).toBeInTheDocument();
  });

  it('applies custom className', () => {
    vi.spyOn(useMatchupOddsModule, 'useMatchupOdds').mockReturnValue({
      oddsData: mockOddsData,
      loading: false,
      error: null,
    });

    const { container } = render(
      <MatchupOddsPreview
        leagueId="12345"
        week={5}
        matchupId={1}
        teamAName="Chiefs"
        teamBName="Bills"
        className="custom-class"
      />,
    );

    expect(container.firstChild).toHaveClass('custom-class');
  });

  it('passes correct props to useMatchupOdds hook', () => {
    const mockUseMatchupOdds = vi.spyOn(useMatchupOddsModule, 'useMatchupOdds').mockReturnValue({
      oddsData: null,
      loading: true,
      error: null,
    });

    render(
      <MatchupOddsPreview
        leagueId="abc123"
        week={10}
        matchupId={5}
        teamAName="Chiefs"
        teamBName="Bills"
      />,
    );

    expect(mockUseMatchupOdds).toHaveBeenCalledWith({
      leagueId: 'abc123',
      week: 10,
      matchupId: 5,
    });
  });
});
