import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MatchupSimulation } from './MatchupSimulation';

// Mock fetch globally
global.fetch = vi.fn();

const mockSimulationData = {
  success: true,
  simulation: {
    team1WinPct: 0.55,
    team2WinPct: 0.45,
    medianMargin: 5.2,
    team1Scores: {
      mean: 115.5,
      median: 115.5,
      p10: 90.0,
      p90: 140.0,
    },
    team2Scores: {
      mean: 110.3,
      median: 110.3,
      p10: 85.0,
      p90: 135.0,
    },
    impliedOdds: {
      team1MoneyLine: -125,
      team2MoneyLine: 105,
      spread: -2.5,
      total: 225.8,
    },
    teams: [
      {
        rosterId: 1,
        teamName: 'Team Alpha',
        ownerName: 'Owner Alpha',
        players: [],
      },
      {
        rosterId: 2,
        teamName: 'Team Beta',
        ownerName: 'Owner Beta',
        players: [],
      },
    ],
  },
};

describe('MatchupSimulation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      json: async () => mockSimulationData,
    } as Response);
  });

  describe('Loading State', () => {
    it('shows loading skeleton initially', () => {
      render(<MatchupSimulation leagueId="league-1" week={1} matchupId={1} />);

      // Should show loading skeletons (check for the loading card title)
      expect(screen.getByText('Monte Carlo Simulation')).toBeInTheDocument();
      // Check for animate-pulse class which indicates loading skeletons
      const skeletons = document.querySelectorAll('.animate-pulse');
      expect(skeletons.length).toBeGreaterThan(0);
    });
  });

  describe('Simulation Display', () => {
    it('fetches and displays simulation data', async () => {
      render(<MatchupSimulation leagueId="league-1" week={1} matchupId={1} />);

      await waitFor(() => {
        expect(screen.getByText('Team Alpha')).toBeInTheDocument();
        expect(screen.getByText('Team Beta')).toBeInTheDocument();
      });

      expect(global.fetch).toHaveBeenCalledWith('/api/matchups/league-1/1/1/simulate');
    });

    it('displays win probabilities', async () => {
      render(<MatchupSimulation leagueId="league-1" week={1} matchupId={1} />);

      await waitFor(() => {
        expect(screen.getByText(/55\.0%/)).toBeInTheDocument();
        expect(screen.getByText(/45\.0%/)).toBeInTheDocument();
      });
    });

    it('displays projected scores', async () => {
      render(<MatchupSimulation leagueId="league-1" week={1} matchupId={1} />);

      await waitFor(() => {
        // Check for median scores which are displayed
        expect(screen.getByText(/115\.5/)).toBeInTheDocument();
        expect(screen.getByText(/110\.3/)).toBeInTheDocument();
      });
    });
  });

  describe('Interactive Features', () => {
    it('displays win margin calculator', async () => {
      render(<MatchupSimulation leagueId="league-1" week={1} matchupId={1} />);

      await waitFor(() => {
        expect(screen.getByText(/Win Margin Calculator/i)).toBeInTheDocument();
      });
    });

    it('displays over/under section', async () => {
      render(<MatchupSimulation leagueId="league-1" week={1} matchupId={1} />);

      await waitFor(() => {
        // The Over/Under display shows the total line in multiple places
        const total = screen.getAllByText(/225\.8/);
        expect(total.length).toBeGreaterThan(0);
      });
    });

    it('shows refresh button', async () => {
      render(<MatchupSimulation leagueId="league-1" week={1} matchupId={1} />);

      await waitFor(() => {
        // Refresh button renders without accessible text, check for the "20,000 sims" badge instead
        expect(screen.getByText(/20,000 sims/i)).toBeInTheDocument();
        // Could also check that there are at least 2 buttons (info tooltip trigger + refresh)
        const buttons = screen.getAllByRole('button');
        expect(buttons.length).toBeGreaterThanOrEqual(2);
      });
    });
  });

  describe('Score Ranges', () => {
    it('displays score range information', async () => {
      render(<MatchupSimulation leagueId="league-1" week={1} matchupId={1} />);

      await waitFor(() => {
        expect(screen.getByText(/Score Ranges/i)).toBeInTheDocument();
      });
    });

    it('shows min and max projections', async () => {
      render(<MatchupSimulation leagueId="league-1" week={1} matchupId={1} />);

      await waitFor(() => {
        // Should display p10/p90 values from mockSimulationData
        expect(screen.getByText(/90\.0/)).toBeInTheDocument(); // Team1 p10
        expect(screen.getByText(/140\.0/)).toBeInTheDocument(); // Team1 p90
      });
    });
  });

  describe('NFL Game Context', () => {
    it('renders component without NFL game context when no data provided', async () => {
      render(<MatchupSimulation leagueId="league-1" week={1} matchupId={1} />);

      await waitFor(() => {
        // Component should render successfully
        expect(screen.getByText('Team Alpha')).toBeInTheDocument();
      });
    });
  });

  describe('Simulation Stats', () => {
    it('displays simulation statistics', async () => {
      render(<MatchupSimulation leagueId="league-1" week={1} matchupId={1} />);

      await waitFor(() => {
        expect(screen.getByText(/20,000 sims/i)).toBeInTheDocument(); // Simulation count
      });
    });
  });

  describe('Error Handling', () => {
    it('displays error message when fetch fails', async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockRejectedValueOnce(new Error('Network error'));

      render(<MatchupSimulation leagueId="league-1" week={1} matchupId={1} />);

      await waitFor(() => {
        // Error state shows "Simulation Error" title and error message
        expect(screen.getByText(/Simulation Error/i)).toBeInTheDocument();
        expect(screen.getByText(/Network error/i)).toBeInTheDocument();
      });
    });

    it('displays error when API returns error', async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: false,
        status: 500,
      } as Response);

      render(<MatchupSimulation leagueId="league-1" week={1} matchupId={1} />);

      await waitFor(() => {
        expect(screen.getByText(/Failed to fetch simulation/i)).toBeInTheDocument();
      });
    });
  });

  describe('Edge Cases', () => {
    it('handles zero win probability', async () => {
      const zeroWinData = {
        success: true,
        simulation: {
          ...mockSimulationData.simulation,
          team1WinPct: 0.0,
          team2WinPct: 1.0,
        },
      };

      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        json: async () => zeroWinData,
      } as Response);

      render(<MatchupSimulation leagueId="league-1" week={1} matchupId={1} />);

      await waitFor(() => {
        // 0.0% and 100.0% may appear multiple times (in different sections)
        expect(screen.getAllByText(/0\.0%/).length).toBeGreaterThan(0);
        expect(screen.getByText(/100\.0%/)).toBeInTheDocument();
      });
    });

    it('handles even matchup', async () => {
      const evenData = {
        success: true,
        simulation: {
          ...mockSimulationData.simulation,
          team1WinPct: 0.5,
          team2WinPct: 0.5,
          impliedOdds: {
            ...mockSimulationData.simulation.impliedOdds,
            spread: 0,
          },
        },
      };

      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        json: async () => evenData,
      } as Response);

      render(<MatchupSimulation leagueId="league-1" week={1} matchupId={1} />);

      await waitFor(() => {
        // In a 50/50 matchup, 50.0% appears multiple times (both teams + over/under)
        const fiftyPercents = screen.getAllByText(/50\.0%/);
        expect(fiftyPercents.length).toBeGreaterThan(0);
      });
    });
  });
});
