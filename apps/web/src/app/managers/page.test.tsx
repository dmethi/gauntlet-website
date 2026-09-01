import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { auth } from '@clerk/nextjs/server';
import type { ManagerProfileDetails } from '@gauntlet/types';
import ManagersIndexPage from './page';
import { getManagerProfilesBySleeperId } from '@/features/profiles/manager-profiles';
import { listManagers } from '@/lib/leagues/manager-history';
import type { ManagerSummary } from '@/lib/leagues/manager-history';

vi.mock('@clerk/nextjs/server', () => ({ auth: vi.fn() }));
vi.mock('@/lib/leagues/manager-history', () => ({
  listManagers: vi.fn(),
}));
vi.mock('@/features/profiles/manager-profiles', () => ({
  getManagerProfilesBySleeperId: vi.fn(),
}));

const mockAuth = vi.mocked(auth);
const mockListManagers = vi.mocked(listManagers);
const mockGetManagerProfiles = vi.mocked(getManagerProfilesBySleeperId);

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

const PROFILE: ManagerProfileDetails = {
  fullName: 'Alice Smith',
  jobTitle: 'Product designer',
  city: 'Brooklyn',
  favoriteNflTeam: 'NYJ',
  favoritePlayer: 'Sauce Gardner',
  teamName: 'Alice',
  sleeperDisplayName: 'alice-sleeper',
  profileImageUrl: 'https://example.com/alice.png',
};

describe('ManagersIndexPage', () => {
  beforeEach(() => vi.clearAllMocks());

  it('renders a card per manager linking to their profile', async () => {
    mockAuth.mockResolvedValue({ userId: null } as Awaited<ReturnType<typeof auth>>);
    mockListManagers.mockResolvedValue(MANAGERS);

    const jsx = await ManagersIndexPage();
    render(jsx);

    expect(screen.getByText('Alice')).toBeInTheDocument();
    expect(screen.getByText('Bob')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'View Alice manager profile' })).toHaveAttribute(
      'href',
      '/managers/owner_1',
    );
    expect(screen.getByText('2 seasons · 2024–2025')).toBeInTheDocument();
    expect(screen.getByText('1 season · 2025')).toBeInTheDocument();
  });

  it('folds personal profile details into the matching manager for signed-in viewers', async () => {
    mockAuth.mockResolvedValue({ userId: 'viewer-1' } as Awaited<ReturnType<typeof auth>>);
    mockListManagers.mockResolvedValue(MANAGERS);
    mockGetManagerProfiles.mockResolvedValue(new Map([['owner_1', PROFILE]]));

    const jsx = await ManagersIndexPage();
    render(jsx);

    expect(screen.getByText('Alice Smith')).toBeInTheDocument();
    expect(screen.getByText('Product designer')).toBeInTheDocument();
    expect(screen.getByText('Brooklyn')).toBeInTheDocument();
    expect(screen.getByText('New York Jets')).toBeInTheDocument();
    expect(screen.getByText('Sauce Gardner')).toBeInTheDocument();
  });

  it('does not load or reveal personal details to signed-out viewers', async () => {
    mockAuth.mockResolvedValue({ userId: null } as Awaited<ReturnType<typeof auth>>);
    mockListManagers.mockResolvedValue(MANAGERS);

    const jsx = await ManagersIndexPage();
    render(jsx);

    expect(mockGetManagerProfiles).not.toHaveBeenCalled();
    expect(screen.queryByText('Product designer')).not.toBeInTheDocument();
  });

  it('renders an empty state when no managers are found', async () => {
    mockAuth.mockResolvedValue({ userId: null } as Awaited<ReturnType<typeof auth>>);
    mockListManagers.mockResolvedValue([]);

    const jsx = await ManagersIndexPage();
    render(jsx);

    expect(screen.getByText('No managers found in any registered league.')).toBeInTheDocument();
  });
});
