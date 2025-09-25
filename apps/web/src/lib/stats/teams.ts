/**
 * Team-based stats aggregation utilities
 */

import type { SleeperMatchup } from '@/lib/sleeper/types';

export interface TeamWeekData {
  rosterId: number;
  leagueId: string; // Add leagueId to identify which league this roster belongs to
  teamPoints: number;
  opponentPoints: number;
  matchupId: number;
  opponentRosterId?: number;
}

/**
 * Extract team and opponent points for each week
 * Uses matchup_id to pair opponents within each league separately to avoid ID conflicts
 */
export function getTeamAndOpponentPoints({
  matchups,
}: {
  matchups: Map<number, Map<string, SleeperMatchup[]>>; // week -> leagueId -> matchups
}): Map<number, TeamWeekData[]> {
  console.log('[DEBUG] getTeamAndOpponentPoints: starting with', matchups.size, 'weeks');
  const weeklyTeamData = new Map<number, TeamWeekData[]>();

  for (const [week, weekLeagueMatchups] of matchups.entries()) {
    console.log(
      '[DEBUG] getTeamAndOpponentPoints: processing week',
      week,
      'with',
      weekLeagueMatchups.size,
      'leagues'
    );
    const weekTeamData: TeamWeekData[] = [];

    // Process each league separately to avoid matchup_id conflicts
    for (const [leagueId, leagueMatchups] of weekLeagueMatchups.entries()) {
      console.log(
        '[DEBUG] getTeamAndOpponentPoints: processing league',
        leagueId,
        'with',
        leagueMatchups.length,
        'matchups'
      );

      // Group by matchup_id within this league only
      const matchupGroups = new Map<number, SleeperMatchup[]>();
      console.log(
        '[DEBUG] getTeamAndOpponentPoints: league',
        leagueId,
        'matchup_ids:',
        leagueMatchups.map(m => m.matchup_id)
      );

      for (const matchup of leagueMatchups) {
        const group = matchupGroups.get(matchup.matchup_id) || [];
        group.push(matchup);
        matchupGroups.set(matchup.matchup_id, group);
      }

      console.log(
        '[DEBUG] getTeamAndOpponentPoints: league',
        leagueId,
        'grouped into',
        matchupGroups.size,
        'matchup groups'
      );
      console.log(
        '[DEBUG] getTeamAndOpponentPoints: league',
        leagueId,
        'group sizes:',
        Array.from(matchupGroups.values()).map(g => g.length)
      );

      // Process each matchup pair within this league
      for (const [matchupId, pair] of matchupGroups.entries()) {
        if (pair.length === 2) {
          // Regular matchup with 2 teams
          const [team1, team2] = pair;

          weekTeamData.push({
            rosterId: team1.roster_id,
            leagueId,
            teamPoints: team1.points,
            opponentPoints: team2.points,
            matchupId,
            opponentRosterId: team2.roster_id,
          });

          weekTeamData.push({
            rosterId: team2.roster_id,
            leagueId,
            teamPoints: team2.points,
            opponentPoints: team1.points,
            matchupId,
            opponentRosterId: team1.roster_id,
          });
        } else if (pair.length === 1) {
          // Bye week or odd number of teams
          const team = pair[0];
          weekTeamData.push({
            rosterId: team.roster_id,
            leagueId,
            teamPoints: team.points,
            opponentPoints: 0,
            matchupId,
          });
        } else {
          console.warn(
            '[DEBUG] getTeamAndOpponentPoints: unexpected group size',
            pair.length,
            'for matchupId',
            matchupId
          );
        }
      }

      console.log(
        '[DEBUG] getTeamAndOpponentPoints: league',
        leagueId,
        'generated',
        weekTeamData.length - (weekTeamData.length - leagueMatchups.length),
        'team data entries'
      );
    }

    console.log(
      '[DEBUG] getTeamAndOpponentPoints: week',
      week,
      'total generated',
      weekTeamData.length,
      'team data entries'
    );
    weeklyTeamData.set(week, weekTeamData);
  }

  console.log('[DEBUG] getTeamAndOpponentPoints: final result', weeklyTeamData.size, 'weeks');
  return weeklyTeamData;
}

/**
 * Get total team and opponent points across a week range
 */
export function aggregateTeamPoints(
  weeklyData: Map<number, TeamWeekData[]>,
  weekRange: { from: number; to: number }
): Map<string, { teamTotal: number; opponentTotal: number; gamesPlayed: number }> {
  console.log('[DEBUG] aggregateTeamPoints: starting with', weeklyData.size, 'weeks', weekRange);
  const totals = new Map<
    string,
    { teamTotal: number; opponentTotal: number; gamesPlayed: number }
  >();

  for (let week = weekRange.from; week <= weekRange.to; week++) {
    const weekData = weeklyData.get(week);
    console.log('[DEBUG] aggregateTeamPoints: week', week, 'has', weekData?.length || 0, 'entries');
    if (!weekData) continue;

    for (const data of weekData) {
      // Use composite key to avoid roster ID conflicts between leagues
      const teamKey = `${data.leagueId}-${data.rosterId}`;
      const existing = totals.get(teamKey) || {
        teamTotal: 0,
        opponentTotal: 0,
        gamesPlayed: 0,
      };

      totals.set(teamKey, {
        teamTotal: existing.teamTotal + data.teamPoints,
        opponentTotal: existing.opponentTotal + data.opponentPoints,
        gamesPlayed: existing.gamesPlayed + 1,
      });
    }
  }

  console.log('[DEBUG] aggregateTeamPoints: final totals', totals.size, 'rosters');
  return totals;
}
