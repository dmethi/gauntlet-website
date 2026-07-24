import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import ManagerProfilePage from './page';
import { getManagerHistory } from '@/lib/leagues/manager-history';
import type { ManagerHistory } from '@/lib/leagues/manager-history';

vi.mock('@/lib/leagues/manager-history', () => ({
  getManagerHistory: vi.fn(),
}));

const mockGetManagerHistory = vi.mocked(getManagerHistory);

const HISTORY: ManagerHistory = {
  ownerId: 'owner_42',
  displayName: 'The Commish',
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
});
