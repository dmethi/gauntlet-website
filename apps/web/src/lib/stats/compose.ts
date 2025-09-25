/**
 * High-level stats dataset composition
 */

import {
  fetchNFLState,
  fetchLeague,
  fetchRosters,
  fetchUsers,
  fetchMatchups,
  fetchPlayersIndex,
} from '@/lib/sleeper/client';
import { getStarterPositionPoints, aggregatePositionPoints, TRACKED_POSITIONS } from './positions';
import { getTeamAndOpponentPoints, aggregateTeamPoints } from './teams';
import { rank, rankWithinLeagues } from './ranks';
import { median, mean } from './medians';
import { buildTeamInfoMap, buildRosterLeagueMap } from './join';
import type { SleeperMatchup, SleeperRoster, SleeperUser } from '@/lib/sleeper/types';
import type { TrackedPosition, PositionPoints } from './positions';
import type { TeamWeekData } from './teams';
import type { TeamInfo } from './join';

export interface WeeklyDataPoint {
  week: number;
  value: number;
  rank24?: number;
  rankLeague?: number;
}

export interface TeamStatsData {
  teamInfo: TeamInfo;
  teamScores: WeeklyDataPoint[];
  opponentScores: WeeklyDataPoint[];
  seasonTotals: {
    teamTotal: number;
    opponentTotal: number;
    diff: number;
    avgDelta: number;
    medianDelta: number;
    rank24: number;
    rankLeague: number;
    gamesPlayed: number;
  };
}

export interface PositionStatsData {
  position: TrackedPosition;
  teams: Map<
    string,
    {
      teamInfo: TeamInfo;
      scores: WeeklyDataPoint[];
      opponentScores: WeeklyDataPoint[];
      seasonTotal: number;
      opponentTotal: number;
      diff: number;
      rank24: number;
      rankLeague: number;
    }
  >;
}

export interface StatsDataset {
  currentWeek: number;
  currentSeason: string;
  leagues: Array<{ id: string; name: string }>;
  weekRange: { from: number; to: number };
  teams: Map<string, TeamStatsData>;
  positions: Map<TrackedPosition, PositionStatsData>;
  weeklyMedians: Map<
    number,
    {
      teamScores: number;
      opponentScores: number;
      positions: Map<TrackedPosition, number>;
    }
  >;
  weeklyAverages: Map<
    number,
    {
      teamScores: number;
      opponentScores: number;
      positions: Map<TrackedPosition, number>;
    }
  >;
}

// Serializable shape for sending to client components
export interface PlainStatsDataset {
  currentWeek: number;
  currentSeason: string;
  leagues: Array<{ id: string; name: string }>;
  weekRange: { from: number; to: number };
  teams: Array<[string, TeamStatsData]>;
  positions: Array<
    [
      TrackedPosition,
      {
        position: TrackedPosition;
        teams: Array<
          [
            string,
            {
              teamInfo: TeamInfo;
              scores: WeeklyDataPoint[];
              opponentScores: WeeklyDataPoint[];
              seasonTotal: number;
              opponentTotal: number;
              diff: number;
              rank24: number;
              rankLeague: number;
            },
          ]
        >;
      },
    ]
  >;
  weeklyMedians: Record<
    number,
    {
      teamScores: number;
      opponentScores: number;
      positions: Record<TrackedPosition, number>;
    }
  >;
  weeklyAverages: Record<
    number,
    {
      teamScores: number;
      opponentScores: number;
      positions: Record<TrackedPosition, number>;
    }
  >;
}

export async function buildStatsDataset({
  leagueIds,
  labels,
  weekRange,
}: {
  leagueIds: string[];
  labels: string[];
  weekRange: { from: number; to: number };
}): Promise<StatsDataset> {
  console.log('[DEBUG] buildStatsDataset: starting with', { leagueIds, labels, weekRange });

  // 1. Fetch NFL state
  const nflState = await fetchNFLState();
  const stateWeek = Number((nflState as any)?.week);
  const isValidWeek = Number.isFinite(stateWeek) && stateWeek >= 1 && stateWeek <= 18;
  const currentWeek = isValidWeek ? Math.min(stateWeek, 18) : weekRange.to;
  const actualRange = {
    from: weekRange.from,
    to: Math.min(weekRange.to, currentWeek),
  };
  console.log('[DEBUG] buildStatsDataset: NFL state processed', {
    nflState,
    stateWeek,
    currentWeek,
    actualRange,
  });

  // 2. Fetch league data and players index in parallel
  const [leaguesData, playersIndex] = await Promise.all([
    Promise.all(
      leagueIds.map(async (id, i) => ({
        id,
        name: labels[i] || `League ${i + 1}`,
        league: await fetchLeague(id),
      }))
    ),
    fetchPlayersIndex(),
  ]);

  // 3. Fetch rosters and users for each league
  const rostersMap = new Map<string, SleeperRoster[]>();
  const usersMap = new Map<string, SleeperUser[]>();

  await Promise.all(
    leagueIds.map(async leagueId => {
      const [rosters, users] = await Promise.all([fetchRosters(leagueId), fetchUsers(leagueId)]);
      rostersMap.set(leagueId, rosters);
      usersMap.set(leagueId, users);
    })
  );

  // 4. Build team info mapping
  const teamInfoMap = buildTeamInfoMap({
    leagues: leaguesData,
    rosters: rostersMap,
    users: usersMap,
  });
  console.log('[DEBUG] buildStatsDataset: teamInfoMap built', teamInfoMap.size, 'teams');

  const rosterLeagueMap = buildRosterLeagueMap(leaguesData, rostersMap);
  console.log('[DEBUG] buildStatsDataset: rosterLeagueMap built', rosterLeagueMap.size, 'mappings');

  // 5. Fetch matchups for all weeks in range - keep leagues separated
  const allMatchups = new Map<number, Map<string, SleeperMatchup[]>>();

  for (let week = actualRange.from; week <= actualRange.to; week++) {
    const weekLeagueMatchups = new Map<string, SleeperMatchup[]>();

    for (let i = 0; i < leagueIds.length; i++) {
      const leagueId = leagueIds[i];
      const matchups = await fetchMatchups(leagueId, week);
      weekLeagueMatchups.set(leagueId, matchups);
    }

    allMatchups.set(week, weekLeagueMatchups);
  }

  // 6. Calculate team and position points
  console.log(
    '[DEBUG] buildStatsDataset: calling getTeamAndOpponentPoints with',
    allMatchups.size,
    'weeks'
  );
  const teamWeeklyData = getTeamAndOpponentPoints({ matchups: allMatchups });
  console.log(
    '[DEBUG] buildStatsDataset: getTeamAndOpponentPoints returned',
    teamWeeklyData.size,
    'weeks'
  );

  const positionWeeklyData = getStarterPositionPoints({ matchups: allMatchups, playersIndex });
  console.log(
    '[DEBUG] buildStatsDataset: getStarterPositionPoints returned',
    positionWeeklyData.size,
    'weeks'
  );

  // 7. Calculate weekly medians and averages
  const weeklyMedians = new Map<number, any>();
  const weeklyAverages = new Map<number, any>();

  for (let week = actualRange.from; week <= actualRange.to; week++) {
    const weekTeamData = teamWeeklyData.get(week) || [];
    const weekPositionData = positionWeeklyData.get(week) || new Map();

    const teamScores = weekTeamData.map(d => d.teamPoints);
    const oppScores = weekTeamData.map(d => d.opponentPoints);

    const positionMedians = new Map<TrackedPosition, number>();
    const positionAverages = new Map<TrackedPosition, number>();

    for (const position of TRACKED_POSITIONS) {
      const posScores: number[] = [];
      for (const [, points] of weekPositionData) {
        posScores.push(points[position]);
      }
      positionMedians.set(position, median(posScores));
      positionAverages.set(position, mean(posScores));
    }

    weeklyMedians.set(week, {
      teamScores: median(teamScores),
      opponentScores: median(oppScores),
      positions: positionMedians,
    });

    weeklyAverages.set(week, {
      teamScores: mean(teamScores),
      opponentScores: mean(oppScores),
      positions: positionAverages,
    });
  }

  // 8. Calculate season aggregates
  console.log(
    '[DEBUG] buildStatsDataset: calling aggregateTeamPoints with teamWeeklyData',
    teamWeeklyData.size,
    'weeks'
  );
  const teamSeasonTotals = aggregateTeamPoints(teamWeeklyData, actualRange);
  console.log(
    '[DEBUG] buildStatsDataset: aggregateTeamPoints returned',
    teamSeasonTotals.size,
    'rosters'
  );

  const positionSeasonTotals = aggregatePositionPoints(positionWeeklyData, actualRange);

  // 9. Calculate ranks
  const teamTotalValues = new Map<string, number>();
  const totalsArray: Array<{ teamKey: string; value: number }> = [];
  for (const [teamKey, totals] of teamSeasonTotals) {
    teamTotalValues.set(teamKey, totals.teamTotal);
    totalsArray.push({ teamKey, value: totals.teamTotal });
  }
  const allRanksArray = rank(totalsArray.map(t => t.value));
  const allRanksMap = new Map<string, number>();
  totalsArray.forEach((t, i) => allRanksMap.set(t.teamKey, allRanksArray[i]));

  // Build league mapping from teamKey for ranking within leagues
  const teamKeyLeagueMap = new Map<string, string>();
  for (const [teamKey] of teamSeasonTotals) {
    const leagueId = teamKey.split('-')[0]; // Extract leagueId from teamKey
    teamKeyLeagueMap.set(teamKey, leagueId);
  }
  const leagueRanks = rankWithinLeagues(teamTotalValues, teamKeyLeagueMap);

  // 10. Build final dataset
  const teams = new Map<string, TeamStatsData>();
  console.log(
    '[DEBUG] buildStatsDataset: building teams from teamSeasonTotals',
    teamSeasonTotals.size,
    'entries'
  );

  for (const [teamKey, totals] of teamSeasonTotals) {
    const info = teamInfoMap.get(teamKey);
    if (!info) {
      console.log('[DEBUG] buildStatsDataset: no team info found for teamKey', teamKey);
      continue;
    }

    const rosterId = parseInt(teamKey.split('-')[1], 10);

    // Build weekly data points
    const teamScores: WeeklyDataPoint[] = [];
    const opponentScores: WeeklyDataPoint[] = [];

    for (let week = actualRange.from; week <= actualRange.to; week++) {
      const weekData = teamWeeklyData
        .get(week)
        ?.find(d => `${d.leagueId}-${d.rosterId}` === teamKey);
      if (weekData) {
        // Calculate week-specific ranks
        const weekTeamScores = teamWeeklyData.get(week)?.map(d => d.teamPoints) || [];
        const weekOppScores = teamWeeklyData.get(week)?.map(d => d.opponentPoints) || [];
        const teamWeekRanks = rank(weekTeamScores);
        const oppWeekRanks = rank(weekOppScores);

        const teamIdx =
          teamWeeklyData.get(week)?.findIndex(d => `${d.leagueId}-${d.rosterId}` === teamKey) || 0;

        teamScores.push({
          week,
          value: weekData.teamPoints,
          rank24: teamWeekRanks[teamIdx],
        });

        opponentScores.push({
          week,
          value: weekData.opponentPoints,
          rank24: oppWeekRanks[teamIdx],
        });
      }
    }

    const seasonMedians = weeklyMedians.get(actualRange.to) || {
      teamScores: 0,
      opponentScores: 0,
      positions: new Map(),
    };
    const seasonAverages = weeklyAverages.get(actualRange.to) || {
      teamScores: 0,
      opponentScores: 0,
      positions: new Map(),
    };

    teams.set(teamKey, {
      teamInfo: info,
      teamScores,
      opponentScores,
      seasonTotals: {
        teamTotal: totals.teamTotal,
        opponentTotal: totals.opponentTotal,
        diff: totals.teamTotal - totals.opponentTotal,
        avgDelta: totals.teamTotal / totals.gamesPlayed - seasonAverages.teamScores,
        medianDelta: totals.teamTotal / totals.gamesPlayed - seasonMedians.teamScores,
        rank24: allRanksMap.get(teamKey) || 0,
        rankLeague: leagueRanks.get(teamKey) || 0,
        gamesPlayed: totals.gamesPlayed,
      },
    });
  }

  // Ensure all rosters appear in teams map, even if no matchups yet
  for (const [teamKey, info] of teamInfoMap.entries()) {
    if (!teams.has(teamKey)) {
      teams.set(teamKey, {
        teamInfo: info,
        teamScores: [],
        opponentScores: [],
        seasonTotals: {
          teamTotal: 0,
          opponentTotal: 0,
          diff: 0,
          avgDelta: 0,
          medianDelta: 0,
          rank24: 0,
          rankLeague: 0,
          gamesPlayed: 0,
        },
      });
    }
  }

  // 11. Build position data
  const positions = new Map<TrackedPosition, PositionStatsData>();

  for (const position of TRACKED_POSITIONS) {
    const positionTeams = new Map<string, any>();

    for (const [teamKey, positionTotals] of positionSeasonTotals) {
      const info = teamInfoMap.get(teamKey);
      if (!info) continue;

      const scores: WeeklyDataPoint[] = [];

      for (let week = actualRange.from; week <= actualRange.to; week++) {
        const weekData = positionWeeklyData.get(week)?.get(teamKey);
        if (weekData) {
          scores.push({
            week,
            value: weekData[position],
          });
        }
      }

      positionTeams.set(teamKey, {
        teamInfo: info,
        scores,
        opponentScores: [], // Can be calculated if needed
        seasonTotal: positionTotals[position],
        opponentTotal: 0, // Can be calculated if needed
        diff: 0,
        rank24: 0, // Will calculate separately
        rankLeague: 0,
      });
    }

    positions.set(position, {
      position,
      teams: positionTeams,
    });
  }

  console.log('[DEBUG] buildStatsDataset: final dataset built', {
    currentWeek,
    currentSeason: nflState.season,
    leagues: leaguesData.length,
    weekRange: actualRange,
    teamsCount: teams.size,
    positionsCount: positions.size,
    weeklyMediansCount: weeklyMedians.size,
    weeklyAveragesCount: weeklyAverages.size,
  });

  return {
    currentWeek,
    currentSeason: nflState.season,
    leagues: leaguesData,
    weekRange: actualRange,
    teams,
    positions,
    weeklyMedians,
    weeklyAverages,
  };
}

/**
 * Convert non-serializable Maps in StatsDataset to plain arrays/objects for client props
 */
export function serializeStatsDataset(ds: StatsDataset): PlainStatsDataset {
  console.log('[DEBUG] serializeStatsDataset: starting serialization', {
    teamsCount: ds.teams.size,
    positionsCount: ds.positions.size,
  });

  const positionsPlain: PlainStatsDataset['positions'] = [];
  for (const [pos, posData] of ds.positions.entries()) {
    const teamsArr: Array<[string, any]> = [];
    for (const [teamKey, t] of posData.teams.entries()) {
      teamsArr.push([teamKey, t]);
    }
    positionsPlain.push([
      pos,
      {
        position: posData.position,
        teams: teamsArr,
      },
    ]);
  }

  const teamsArr: Array<[string, TeamStatsData]> = Array.from(ds.teams.entries());
  console.log('[DEBUG] serializeStatsDataset: teams array built', teamsArr.length, 'teams');

  const weeklyMediansPlain: PlainStatsDataset['weeklyMedians'] = {};
  for (const [week, w] of ds.weeklyMedians.entries()) {
    const posVals: Record<TrackedPosition, number> = {
      QB: 0 as number,
      RB: 0 as number,
      WR: 0 as number,
      TE: 0 as number,
      DEF: 0 as number,
    } as any;
    for (const p of TRACKED_POSITIONS) {
      posVals[p] = w.positions.get(p) || 0;
    }
    weeklyMediansPlain[week] = {
      teamScores: w.teamScores,
      opponentScores: w.opponentScores,
      positions: posVals,
    };
  }

  const weeklyAveragesPlain: PlainStatsDataset['weeklyAverages'] = {};
  for (const [week, w] of ds.weeklyAverages.entries()) {
    const posVals: Record<TrackedPosition, number> = {
      QB: 0 as number,
      RB: 0 as number,
      WR: 0 as number,
      TE: 0 as number,
      DEF: 0 as number,
    } as any;
    for (const p of TRACKED_POSITIONS) {
      posVals[p] = w.positions.get(p) || 0;
    }
    weeklyAveragesPlain[week] = {
      teamScores: w.teamScores,
      opponentScores: w.opponentScores,
      positions: posVals,
    };
  }

  return {
    currentWeek: ds.currentWeek,
    currentSeason: ds.currentSeason,
    leagues: ds.leagues,
    weekRange: ds.weekRange,
    teams: teamsArr,
    positions: positionsPlain,
    weeklyMedians: weeklyMediansPlain,
    weeklyAverages: weeklyAveragesPlain,
  };
}
