import type { GauntletProfile, ManagerProfileDetails, ProfileTeamOption } from '@gauntlet/types';
import { clerkClient } from '@clerk/nextjs/server';
import { profileRepository, type ProfileRepository } from './repository';
import { getProfileTeamOptions, profileIdentityKey } from './team-options';

interface ClerkProfileUser {
  id: string;
  hasImage: boolean;
  imageUrl: string;
}

interface ManagerProfileDependencies {
  repository: ProfileRepository;
  getTeamOptions: () => Promise<ProfileTeamOption[]>;
  getClerkUsers: (userIds: string[]) => Promise<ClerkProfileUser[]>;
}

const getClerkUsers = async (userIds: string[]): Promise<ClerkProfileUser[]> => {
  if (userIds.length === 0) return [];
  const client = await clerkClient();
  const response = await client.users.getUserList({ userId: userIds, limit: 100 });
  return response.data;
};

const defaultDependencies: ManagerProfileDependencies = {
  repository: profileRepository,
  getTeamOptions: getProfileTeamOptions,
  getClerkUsers,
};

export const buildManagerProfilesBySleeperId = (
  profiles: GauntletProfile[],
  teamOptions: ProfileTeamOption[],
  clerkUsers: ClerkProfileUser[],
): Map<string, ManagerProfileDetails> => {
  const optionsByKey = new Map(teamOptions.map(option => [option.key, option]));
  const clerkUsersById = new Map(clerkUsers.map(user => [user.id, user]));

  return new Map(
    profiles.map(profile => {
      const key = profileIdentityKey(profile.leagueId, profile.rosterId, profile.sleeperUserId);
      const identity = optionsByKey.get(key);
      const clerkUser = clerkUsersById.get(profile.clerkUserId);

      return [
        profile.sleeperUserId,
        {
          fullName: profile.fullName,
          jobTitle: profile.jobTitle,
          city: profile.city,
          favoriteNflTeam: profile.favoriteNflTeam,
          favoritePlayer: profile.favoritePlayer,
          teamName: identity?.teamName ?? `Roster ${profile.rosterId}`,
          sleeperDisplayName: identity?.sleeperDisplayName ?? profile.sleeperUserId,
          profileImageUrl:
            clerkUser?.hasImage === true
              ? clerkUser.imageUrl
              : (identity?.sleeperAvatarUrl ?? null),
        },
      ];
    }),
  );
};

export const getManagerProfilesBySleeperId = async (
  dependencies: ManagerProfileDependencies = defaultDependencies,
): Promise<Map<string, ManagerProfileDetails>> => {
  const profiles = await dependencies.repository.list();
  const [teamOptions, clerkUsers] = await Promise.all([
    dependencies.getTeamOptions(),
    dependencies.getClerkUsers(profiles.map(profile => profile.clerkUserId)),
  ]);

  return buildManagerProfilesBySleeperId(profiles, teamOptions, clerkUsers);
};
