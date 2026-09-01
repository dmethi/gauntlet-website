import type { GauntletProfile, ProfileTeamOption } from '@gauntlet/types';
import type { ProfileInput } from './validation';
import { getProfileTeamOptions } from './team-options';
import { profileRepository, type ProfileRepository } from './repository';

export type SaveProfileResult =
  | { ok: true; profile: GauntletProfile }
  | { ok: false; code: 'INVALID_IDENTITY' | 'IDENTITY_CLAIMED' };

interface SaveProfileDependencies {
  repository: ProfileRepository;
  getTeamOptions: () => Promise<ProfileTeamOption[]>;
}

const defaultDependencies: SaveProfileDependencies = {
  repository: profileRepository,
  getTeamOptions: getProfileTeamOptions,
};

export const saveProfile = async (
  clerkUserId: string,
  input: ProfileInput,
  dependencies: SaveProfileDependencies = defaultDependencies,
): Promise<SaveProfileResult> => {
  const options = await dependencies.getTeamOptions();
  const identity = options.find(option => option.key === input.identityKey);
  if (!identity) return { ok: false, code: 'INVALID_IDENTITY' };

  const existingClaim = await dependencies.repository.findBySleeperUserId(identity.sleeperUserId);
  if (existingClaim && existingClaim.clerkUserId !== clerkUserId) {
    return { ok: false, code: 'IDENTITY_CLAIMED' };
  }

  const profile = await dependencies.repository.upsert({
    clerkUserId,
    sleeperUserId: identity.sleeperUserId,
    leagueId: identity.leagueId,
    rosterId: identity.rosterId,
    fullName: input.fullName,
    jobTitle: input.jobTitle,
    city: input.city,
    favoriteNflTeam: input.favoriteNflTeam,
    favoritePlayer: input.favoritePlayer,
  });

  return { ok: true, profile };
};
