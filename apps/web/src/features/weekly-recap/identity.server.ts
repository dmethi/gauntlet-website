import 'server-only';

import { getManagerProfilesBySleeperId } from '@/features/profiles/manager-profiles';
import { sleeperClient } from '@/lib/sleeper/unified-client';
import { buildRecapTeamLabels } from './identity-data';
import type { ResolvedTeamLabels } from './types';
import { WEEK_ONE_RECAP } from './week-one-data';

export const loadWeekOneTeamLabels = async (
  includeProfileNames: boolean,
): Promise<ResolvedTeamLabels> => {
  const fallbackLabels = Object.fromEntries(
    WEEK_ONE_RECAP.leagues.flatMap(league =>
      league.matchups.flatMap(matchup =>
        matchup.teams.map(team => [`${league.leagueId}:${team.rosterId}`, team.fallbackLabel]),
      ),
    ),
  );

  if (!includeProfileNames) return fallbackLabels;

  try {
    const profileDetails = await getManagerProfilesBySleeperId();
    const profileNames = new Map(
      [...profileDetails.entries()].map(([sleeperId, profile]) => [sleeperId, profile.fullName]),
    );

    const leagueLabels = await Promise.all(
      WEEK_ONE_RECAP.leagues.map(async league => {
        const [rosters, users] = await Promise.all([
          sleeperClient.fetchRosters(league.leagueId),
          sleeperClient.fetchUsers(league.leagueId),
        ]);
        return buildRecapTeamLabels(league.leagueId, rosters, users, profileNames);
      }),
    );

    return Object.assign(fallbackLabels, ...leagueLabels);
  } catch (error) {
    console.error('[Week 1 recap] Falling back to stored team labels:', error);
    return fallbackLabels;
  }
};
