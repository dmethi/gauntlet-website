import 'server-only';

import { getManagerProfilesBySleeperId } from '@/features/profiles/manager-profiles';
import { sleeperClient } from '@/lib/sleeper/unified-client';
import { buildRecapTeamLabels } from './identity-data';
import type { ResolvedTeamLabels, WeeklyRecap } from './types';
import { WEEK_ONE_RECAP } from './week-one-data';

export const loadWeeklyRecapTeamLabels = async (
  report: WeeklyRecap,
  includeProfileNames: boolean,
): Promise<ResolvedTeamLabels> => {
  const fallbackLabels = Object.fromEntries(
    report.leagues.flatMap(league =>
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
      report.leagues.map(async league => {
        const [rosters, users] = await Promise.all([
          sleeperClient.fetchRosters(league.leagueId),
          sleeperClient.fetchUsers(league.leagueId),
        ]);
        return buildRecapTeamLabels(league.leagueId, rosters, users, profileNames);
      }),
    );

    return Object.assign(fallbackLabels, ...leagueLabels);
  } catch (error) {
    console.error(`[Week ${report.week} recap] Falling back to stored team labels:`, error);
    return fallbackLabels;
  }
};

export const loadWeekOneTeamLabels = async (
  includeProfileNames: boolean,
): Promise<ResolvedTeamLabels> => loadWeeklyRecapTeamLabels(WEEK_ONE_RECAP, includeProfileNames);
