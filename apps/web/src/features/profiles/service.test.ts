import { describe, expect, it } from 'vitest';
import type { GauntletProfile, ProfileTeamOption } from '@gauntlet/types';
import type { ProfileRepository, ProfileWrite } from './repository';
import { saveProfile } from './service';

const option = (sleeperUserId: string): ProfileTeamOption => ({
  key: `league-1:7:${sleeperUserId}`,
  leagueId: 'league-1',
  leagueName: 'Legion I',
  rosterId: 7,
  teamName: 'The Keepers',
  sleeperUserId,
  sleeperDisplayName: sleeperUserId,
  sleeperAvatarUrl: null,
});

const input = (identityKey: string) => ({
  identityKey,
  fullName: 'Manager Name',
  jobTitle: null,
  city: null,
  favoriteNflTeam: null,
  favoritePlayer: null,
});

const createRepository = (seed: GauntletProfile[] = []) => {
  const records = [...seed];
  const repository: ProfileRepository = {
    findByClerkUserId: async clerkUserId =>
      records.find(profile => profile.clerkUserId === clerkUserId) ?? null,
    findBySleeperUserId: async sleeperUserId =>
      records.find(profile => profile.sleeperUserId === sleeperUserId) ?? null,
    list: async () => records,
    upsert: async (write: ProfileWrite) => {
      const existingIndex = records.findIndex(profile => profile.clerkUserId === write.clerkUserId);
      const record: GauntletProfile = {
        id: existingIndex >= 0 ? records[existingIndex].id : `profile-${records.length + 1}`,
        ...write,
        createdAt: new Date('2026-09-01T00:00:00Z'),
        updatedAt: new Date('2026-09-01T00:00:00Z'),
      };
      if (existingIndex >= 0) records[existingIndex] = record;
      else records.push(record);
      return record;
    },
  };

  return { records, repository };
};

describe('saveProfile', () => {
  it('rejects an identity that is not in the current Sleeper options', async () => {
    const { repository } = createRepository();

    const result = await saveProfile('clerk-1', input('missing'), {
      repository,
      getTeamOptions: async () => [option('sleeper-1')],
    });

    expect(result).toEqual({ ok: false, code: 'INVALID_IDENTITY' });
  });

  it('does not allow one Clerk user to claim another profile’s Sleeper identity', async () => {
    const claimed: GauntletProfile = {
      id: 'profile-1',
      clerkUserId: 'clerk-owner',
      sleeperUserId: 'sleeper-1',
      leagueId: 'league-1',
      rosterId: 7,
      fullName: 'Existing Manager',
      jobTitle: null,
      city: null,
      favoriteNflTeam: null,
      favoritePlayer: null,
      createdAt: new Date('2026-09-01T00:00:00Z'),
      updatedAt: new Date('2026-09-01T00:00:00Z'),
    };
    const { repository } = createRepository([claimed]);

    const result = await saveProfile('clerk-attacker', input('league-1:7:sleeper-1'), {
      repository,
      getTeamOptions: async () => [option('sleeper-1')],
    });

    expect(result).toEqual({ ok: false, code: 'IDENTITY_CLAIMED' });
  });

  it('allows two managers to create profiles for the same roster', async () => {
    const { records, repository } = createRepository();
    const options = [option('sleeper-owner'), option('sleeper-co-owner')];
    const dependencies = { repository, getTeamOptions: async () => options };

    await saveProfile('clerk-owner', input(options[0].key), dependencies);
    await saveProfile('clerk-co-owner', input(options[1].key), dependencies);

    expect(records).toHaveLength(2);
    expect(records.every(profile => profile.leagueId === 'league-1')).toBe(true);
    expect(records.every(profile => profile.rosterId === 7)).toBe(true);
    expect(new Set(records.map(profile => profile.sleeperUserId)).size).toBe(2);
  });
});
