import { describe, expect, it } from 'vitest';
import type { GauntletProfile, ProfileTeamOption } from '@gauntlet/types';
import { buildManagerProfilesBySleeperId } from './manager-profiles';

const profile: GauntletProfile = {
  id: 'profile-1',
  clerkUserId: 'clerk-1',
  sleeperUserId: 'sleeper-1',
  leagueId: 'league-1',
  rosterId: 7,
  fullName: 'Manager Name',
  jobTitle: 'Engineer',
  city: 'New York',
  favoriteNflTeam: 'NYJ',
  favoritePlayer: 'Garrett Wilson',
  createdAt: new Date('2026-09-01T00:00:00Z'),
  updatedAt: new Date('2026-09-01T00:00:00Z'),
};

const identity: ProfileTeamOption = {
  key: 'league-1:7:sleeper-1',
  leagueId: 'league-1',
  leagueName: 'Legion I',
  rosterId: 7,
  teamName: 'The Keepers',
  sleeperUserId: 'sleeper-1',
  sleeperDisplayName: 'sleeper-name',
  sleeperAvatarUrl: 'https://example.com/sleeper.png',
};

describe('buildManagerProfilesBySleeperId', () => {
  it('prefers an uploaded Clerk image over the Sleeper avatar', () => {
    const profiles = buildManagerProfilesBySleeperId(
      [profile],
      [identity],
      [{ id: 'clerk-1', hasImage: true, imageUrl: 'https://example.com/clerk.png' }],
    );

    expect(profiles.get('sleeper-1')?.profileImageUrl).toBe('https://example.com/clerk.png');
  });

  it('uses the Sleeper avatar when Clerk only has a generated avatar', () => {
    const profiles = buildManagerProfilesBySleeperId(
      [profile],
      [identity],
      [{ id: 'clerk-1', hasImage: false, imageUrl: 'https://example.com/generated.png' }],
    );

    expect(profiles.get('sleeper-1')?.profileImageUrl).toBe('https://example.com/sleeper.png');
  });
});
