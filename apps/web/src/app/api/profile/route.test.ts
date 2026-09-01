import { beforeEach, describe, expect, it, vi } from 'vitest';
import { auth } from '@clerk/nextjs/server';
import { saveProfile } from '@/features/profiles/service';
import { PUT } from './route';

vi.mock('@clerk/nextjs/server', () => ({ auth: vi.fn() }));
vi.mock('@/features/profiles/service', () => ({ saveProfile: vi.fn() }));
vi.mock('@/features/profiles/repository', () => ({
  isProfileIdentityConflict: vi.fn(() => false),
}));

const mockAuth = vi.mocked(auth);
const mockSaveProfile = vi.mocked(saveProfile);

const validBody = {
  identityKey: 'league-1:7:sleeper-1',
  fullName: 'Manager Name',
  jobTitle: '',
  city: '',
  favoriteNflTeam: '',
  favoritePlayer: '',
};

describe('PUT /api/profile', () => {
  beforeEach(() => vi.clearAllMocks());

  it('rejects unauthenticated profile writes', async () => {
    mockAuth.mockResolvedValue({ userId: null } as Awaited<ReturnType<typeof auth>>);

    const response = await PUT(
      new Request('http://localhost/api/profile', {
        method: 'PUT',
        body: JSON.stringify(validBody),
      }),
    );

    expect(response.status).toBe(401);
    expect(mockSaveProfile).not.toHaveBeenCalled();
  });

  it('always scopes the write to the authenticated Clerk user', async () => {
    mockAuth.mockResolvedValue({ userId: 'clerk-current' } as Awaited<ReturnType<typeof auth>>);
    mockSaveProfile.mockResolvedValue({
      ok: true,
      profile: {
        id: 'profile-1',
        clerkUserId: 'clerk-current',
        sleeperUserId: 'sleeper-1',
        leagueId: 'league-1',
        rosterId: 7,
        fullName: 'Manager Name',
        jobTitle: null,
        city: null,
        favoriteNflTeam: null,
        favoritePlayer: null,
        createdAt: new Date('2026-09-01T00:00:00Z'),
        updatedAt: new Date('2026-09-01T00:00:00Z'),
      },
    });

    const response = await PUT(
      new Request('http://localhost/api/profile', {
        method: 'PUT',
        body: JSON.stringify({ ...validBody, clerkUserId: 'clerk-attacker' }),
      }),
    );

    expect(response.status).toBe(200);
    expect(mockSaveProfile).toHaveBeenCalledWith(
      'clerk-current',
      expect.not.objectContaining({ clerkUserId: expect.anything() }),
    );
  });
});
