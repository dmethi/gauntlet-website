import { describe, expect, it, vi } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithProviders as render } from '@/test/utils/test-wrapper';
import ManagerProfilePage from './page';
import { getManagerHistory } from '@/lib/leagues/manager-history';
import type { ManagerHistory } from '@/lib/leagues/manager-history';

vi.mock('@/lib/leagues/manager-history', () => ({
  getManagerHistory: vi.fn(),
}));

// ManagerHallOfFameBadges (rendered by the page) calls useHallOfFameEnhanced,
// which needs a QueryClientProvider (via renderWithProviders) and hits the
// real Sleeper-backed hall-of-fame data service — irrelevant to what these
// tests assert, so it's mocked to stay loading and render nothing.
vi.mock('@/hooks/useHallOfFameEnhanced', () => ({
  useHallOfFameEnhanced: () => ({ data: undefined, isLoading: true, error: null }),
  findManagerHallOfFameBadges: vi.fn(() => []),
}));

const mockGetManagerHistory = vi.mocked(getManagerHistory);

const HISTORY: ManagerHistory = {
  ownerId: 'owner_42',
  displayName: 'The Commish',
  avatarUrl: null,
  seasons: [
    {
      season: '2025',
      leagueId: 'league_2025_afc',
      leagueLabel: 'Gauntlet AFC',
      rosterId: 1,
      wins: 9,
      losses: 5,
      ties: 0,
      pointsFor: 1500.5,
      pointsAgainst: 1400.25,
      teamName: "Commish's Crew",
    },
    {
      season: '2024',
      leagueId: 'league_2024_afc',
      leagueLabel: 'Gauntlet AFC',
      rosterId: 1,
      wins: 7,
      losses: 7,
      ties: 0,
      pointsFor: 1300,
      pointsAgainst: 1300,
      teamName: null,
    },
  ],
  career: {
    wins: 16,
    losses: 12,
    ties: 0,
    pointsFor: 2800.5,
    pointsAgainst: 2700.25,
    winPct: 16 / 28,
  },
};

describe('ManagerProfilePage', () => {
  it('renders career record and season-by-season history for a known manager', async () => {
    mockGetManagerHistory.mockResolvedValue(HISTORY);

    const jsx = await ManagerProfilePage({ params: { ownerId: 'owner_42' } });
    render(jsx);

    expect(mockGetManagerHistory).toHaveBeenCalledWith('owner_42');
    expect(screen.getByText('The Commish')).toBeInTheDocument();
    expect(screen.getByText('16-12')).toBeInTheDocument();
    expect(screen.getByText("Commish's Crew")).toBeInTheDocument();
    expect(screen.getByText('9-5')).toBeInTheDocument();
    expect(screen.getByText('7-7')).toBeInTheDocument();
  });

  it('resolves a Promise-wrapped params object (Next.js async params)', async () => {
    mockGetManagerHistory.mockResolvedValue(HISTORY);

    const jsx = await ManagerProfilePage({ params: Promise.resolve({ ownerId: 'owner_42' }) });
    render(jsx);

    expect(mockGetManagerHistory).toHaveBeenCalledWith('owner_42');
    expect(screen.getByText('The Commish')).toBeInTheDocument();
  });

  it('renders a not-found state when the owner has no registered-league history', async () => {
    mockGetManagerHistory.mockResolvedValue(null);

    const jsx = await ManagerProfilePage({ params: { ownerId: 'unknown_owner' } });
    render(jsx);

    expect(screen.getByText('Manager not found')).toBeInTheDocument();
  });

  it('renders best/worst season highlights and excludes unplayed (0-0) seasons from ranking', async () => {
    const historyWithUnplayedSeason: ManagerHistory = {
      ...HISTORY,
      seasons: [
        {
          season: '2026',
          leagueId: 'league_2026_legion',
          leagueLabel: 'Legion I: The Throne',
          rosterId: 1,
          wins: 0,
          losses: 0,
          ties: 0,
          pointsFor: 0,
          pointsAgainst: 0,
          teamName: null,
        },
        ...HISTORY.seasons,
      ],
    };
    mockGetManagerHistory.mockResolvedValue(historyWithUnplayedSeason);

    const jsx = await ManagerProfilePage({ params: { ownerId: 'owner_42' } });
    render(jsx);

    expect(screen.getByText('Best Season')).toBeInTheDocument();
    expect(screen.getByText('Toughest Season')).toBeInTheDocument();
    // The unplayed 2026 season must never be marked best or worst.
    const badges = screen.getAllByText(/Best season|Toughest season/);
    expect(badges).toHaveLength(2);
  });

  it('shows no best/worst highlight when only one season has been played', async () => {
    const singlePlayedSeason: ManagerHistory = {
      ...HISTORY,
      seasons: [
        {
          season: '2026',
          leagueId: 'league_2026_legion',
          leagueLabel: 'Legion I: The Throne',
          rosterId: 1,
          wins: 0,
          losses: 0,
          ties: 0,
          pointsFor: 0,
          pointsAgainst: 0,
          teamName: null,
        },
        HISTORY.seasons[0]!,
      ],
    };
    mockGetManagerHistory.mockResolvedValue(singlePlayedSeason);

    const jsx = await ManagerProfilePage({ params: { ownerId: 'owner_42' } });
    render(jsx);

    expect(screen.queryByText('Best Season')).not.toBeInTheDocument();
    expect(screen.queryByText('Toughest Season')).not.toBeInTheDocument();
  });
});
