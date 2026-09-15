import type { SleeperRoster, SleeperUser } from '@gauntlet/types';
import { resolveRecapTeamLabel } from './identity';
import type { ResolvedTeamLabels } from './types';

export const buildRecapTeamLabels = (
  leagueId: string,
  rosters: SleeperRoster[],
  users: SleeperUser[],
  profileNamesBySleeperId: ReadonlyMap<string, string>,
): ResolvedTeamLabels => {
  const usersById = new Map(users.map(user => [user.user_id, user]));

  return Object.fromEntries(
    rosters.map(roster => {
      const owner = usersById.get(roster.owner_id);
      const rosterTeamName = roster.metadata?.team_name;
      const label = resolveRecapTeamLabel({
        rosterId: roster.roster_id,
        sleeperTeamName:
          owner?.metadata?.team_name ??
          (typeof rosterTeamName === 'string' ? rosterTeamName : undefined),
        profileName: profileNamesBySleeperId.get(roster.owner_id),
        sleeperDisplayName: owner?.display_name,
        sleeperUsername: owner?.username,
      });

      return [`${leagueId}:${roster.roster_id}`, label];
    }),
  );
};
