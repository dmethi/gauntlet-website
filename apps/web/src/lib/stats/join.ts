/**
 * Data joining utilities for roster/user/team mapping
 */

import type { SleeperRoster, SleeperUser } from '@gauntlet/types';

export interface TeamInfo {
  leagueId: string;
  leagueName: string;
  rosterId: number;
  teamName: string;
  managerName: string;
  ownerId: string;
  avatar?: string;
}

/**
 * Build team info mapping from rosters and users
 */
export function buildTeamInfoMap({
  leagues,
  rosters,
  users,
}: {
  leagues: Array<{ id: string; name: string }>;
  rosters: Map<string, SleeperRoster[]>; // leagueId -> rosters
  users: Map<string, SleeperUser[]>; // leagueId -> users
}): Map<string, TeamInfo> {
  const teamInfoMap = new Map<string, TeamInfo>();

  for (const league of leagues) {
    const leagueRosters = rosters.get(league.id) || [];
    const leagueUsers = users.get(league.id) || [];

    // Create user lookup
    const userMap = new Map<string, SleeperUser>();
    for (const user of leagueUsers) {
      userMap.set(user.user_id, user);
    }

    // Build team info for each roster
    for (const roster of leagueRosters) {
      const user = userMap.get(roster.owner_id);
      const teamKey = `${league.id}-${roster.roster_id}`;

      // Build avatar URL
      const getAvatarUrl = (user: SleeperUser | undefined) => {
        const teamAvatar = (user?.metadata as any)?.avatar;
        const userAvatar = user?.avatar;
        const avatar = teamAvatar || userAvatar;
        if (!avatar) return undefined;
        if (avatar.startsWith('http')) return avatar;
        return `https://sleepercdn.com/avatars/${avatar}`;
      };

      teamInfoMap.set(teamKey, {
        leagueId: league.id,
        leagueName: league.name,
        rosterId: roster.roster_id,
        teamName: user?.metadata?.team_name || user?.display_name || 'Unknown Team',
        managerName: user?.display_name || user?.username || 'Unknown Manager',
        ownerId: roster.owner_id,
        avatar: getAvatarUrl(user),
      });
    }
  }

  return teamInfoMap;
}

/**
 * Create a simple roster to league mapping
 */
export function buildRosterLeagueMap(
  leagues: Array<{ id: string }>,
  rosters: Map<string, SleeperRoster[]>,
): Map<string, string> {
  const rosterLeagueMap = new Map<string, string>();

  for (const league of leagues) {
    const leagueRosters = rosters.get(league.id) || [];
    for (const roster of leagueRosters) {
      rosterLeagueMap.set(`${roster.roster_id}`, league.id);
    }
  }

  return rosterLeagueMap;
}
