import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import ManagersIndexPage from './page';
import { listManagers } from '@/lib/leagues/manager-history';
import type { ManagerSummary } from '@/lib/leagues/manager-history';

vi.mock('@/lib/leagues/manager-history', () => ({
  listManagers: vi.fn(),
}));

const mockListManagers = vi.mocked(listManagers);

const MANAGERS: ManagerSummary[] = [
  {
    ownerId: 'owner_1',
    displayName: 'Alice',
    avatarUrl: null,
    seasonsPlayed: 2,
    firstSeason: '2024',
    lastSeason: '2025',
  },
  {
    ownerId: 'owner_2',
    displayName: 'Bob',
    avatarUrl: null,
    seasonsPlayed: 1,
    firstSeason: '2025',
    lastSeason: '2025',
  },
];

describe('ManagersIndexPage', () => {
  it('renders a card per manager linking to their profile', async () => {
    mockListManagers.mockResolvedValue(MANAGERS);

    const jsx = await ManagersIndexPage();
    render(jsx);

    expect(screen.getByText('Alice')).toBeInTheDocument();
    expect(screen.getByText('Bob')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Alice/ })).toHaveAttribute(
      'href',
      '/managers/owner_1',
    );
    expect(screen.getByText('2 seasons · 2024–2025')).toBeInTheDocument();
    expect(screen.getByText('1 season · 2025')).toBeInTheDocument();
  });

  it('renders an empty state when no managers are found', async () => {
    mockListManagers.mockResolvedValue([]);

    const jsx = await ManagersIndexPage();
    render(jsx);

    expect(screen.getByText('No managers found in any registered league.')).toBeInTheDocument();
  });
});
