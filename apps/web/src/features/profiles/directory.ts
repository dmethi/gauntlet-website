import type { GauntletProfile, MemberDirectoryEntry, ProfileTeamOption } from '@gauntlet/types';
import { clerkClient } from '@clerk/nextjs/server';
import { getProfileTeamOptions, profileIdentityKey } from './team-options';
import { profileRepository, type ProfileRepository } from './repository';

interface ClerkDirectoryUser {
  id: string;
  hasImage: boolean;
  imageUrl: string;
}

interface DirectoryDependencies {
  repository: ProfileRepository;
  getTeamOptions: () => Promise<ProfileTeamOption[]>;
  getClerkUsers: (userIds: string[]) => Promise<ClerkDirectoryUser[]>;
}

const getClerkUsers = async (userIds: string[]): Promise<ClerkDirectoryUser[]> => {
  if (userIds.length === 0) return [];
  const client = await clerkClient();
  const response = await client.users.getUserList({ userId: userIds, limit: 100 });
  return response.data;
};

const defaultDependencies: DirectoryDependencies = {
  repository: profileRepository,
  getTeamOptions: getProfileTeamOptions,
  getClerkUsers,
};

export const buildMemberDirectory = (
  profiles: GauntletProfile[],
  teamOptions: ProfileTeamOption[],
  clerkUsers: ClerkDirectoryUser[],
): MemberDirectoryEntry[] => {
  const optionsByKey = new Map(teamOptions.map(option => [option.key, option]));
  const clerkUsersById = new Map(clerkUsers.map(user => [user.id, user]));

  return profiles.map(profile => {
    const key = profileIdentityKey(profile.leagueId, profile.rosterId, profile.sleeperUserId);
    const identity = optionsByKey.get(key);
    const clerkUser = clerkUsersById.get(profile.clerkUserId);

    return {
      id: profile.id,
      fullName: profile.fullName,
      jobTitle: profile.jobTitle,
      city: profile.city,
      favoriteNflTeam: profile.favoriteNflTeam,
      favoritePlayer: profile.favoritePlayer,
      leagueName: identity?.leagueName ?? 'Current league',
      teamName: identity?.teamName ?? `Roster ${profile.rosterId}`,
      sleeperDisplayName: identity?.sleeperDisplayName ?? profile.sleeperUserId,
      profileImageUrl:
        clerkUser?.hasImage === true ? clerkUser.imageUrl : (identity?.sleeperAvatarUrl ?? null),
    };
  });
};

export const getMemberDirectory = async (
  dependencies: DirectoryDependencies = defaultDependencies,
): Promise<MemberDirectoryEntry[]> => {
  const profiles = await dependencies.repository.list();
  const [teamOptions, clerkUsers] = await Promise.all([
    dependencies.getTeamOptions(),
    dependencies.getClerkUsers(profiles.map(profile => profile.clerkUserId)),
  ]);

  return buildMemberDirectory(profiles, teamOptions, clerkUsers);
};
