import type { ProfileTeamOption, SleeperRoster, SleeperUser } from '@gauntlet/types';
import { CURRENT_LEAGUES, type League } from '@/config/leagues';
import { getRosterManagerIds } from '@/lib/sleeper/roster-managers';
import { createServiceClient } from '@/lib/sleeper/unified-client';

export interface ProfileSleeperClient {
  fetchRosters(leagueId: string): Promise<SleeperRoster[]>;
  fetchUsers(leagueId: string): Promise<SleeperUser[]>;
}

export const profileIdentityKey = (
  leagueId: string,
  rosterId: number,
  sleeperUserId: string,
): string => `${leagueId}:${rosterId}:${sleeperUserId}`;

const avatarUrl = (avatar: string | undefined): string | null => {
  if (!avatar) return null;
  return avatar.startsWith('http') ? avatar : `https://sleepercdn.com/avatars/${avatar}`;
};

const teamName = (roster: SleeperRoster, owner: SleeperUser | undefined): string => {
  const rosterName = roster.metadata?.team_name;
  if (typeof rosterName === 'string' && rosterName.trim()) return rosterName;
  if (owner?.metadata?.team_name?.trim()) return owner.metadata.team_name;
  return `Roster ${roster.roster_id}`;
};

export const buildLeagueProfileTeamOptions = (
  league: League,
  rosters: SleeperRoster[],
  users: SleeperUser[],
): ProfileTeamOption[] => {
  const usersById = new Map(users.map(user => [user.user_id, user]));

  return rosters.flatMap(roster => {
    const owner = usersById.get(roster.owner_id);
    const rosterTeamName = teamName(roster, owner);

    return getRosterManagerIds(roster).flatMap(sleeperUserId => {
      const user = usersById.get(sleeperUserId);
      if (!user) return [];

      return [
        {
          key: profileIdentityKey(league.id, roster.roster_id, sleeperUserId),
          leagueId: league.id,
          leagueName: league.name,
          rosterId: roster.roster_id,
          teamName: rosterTeamName,
          sleeperUserId,
          sleeperDisplayName: user.display_name,
          sleeperAvatarUrl: avatarUrl(user.avatar),
        },
      ];
    });
  });
};

export const getProfileTeamOptions = async (
  client: ProfileSleeperClient = createServiceClient(),
): Promise<ProfileTeamOption[]> => {
  const optionsByLeague = await Promise.all(
    CURRENT_LEAGUES.map(async league => {
      const [rosters, users] = await Promise.all([
        client.fetchRosters(league.id),
        client.fetchUsers(league.id),
      ]);
      return buildLeagueProfileTeamOptions(league, rosters, users);
    }),
  );

  return optionsByLeague
    .flat()
    .sort((a, b) => a.leagueName.localeCompare(b.leagueName) || a.rosterId - b.rosterId);
};
