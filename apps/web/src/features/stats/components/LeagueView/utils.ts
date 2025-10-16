import { rank } from '@/shared/utils/stats';
import type { TrackedPosition } from '@/shared/utils/stats';

/**
 * Team information including name and league
 */
export interface TeamInfo {
  teamName: string;
  leagueName: string;
}

/**
 * Weekly score data point
 */
export interface TeamScore {
  week: number;
  value: number;
}

/**
 * Team data with all weekly scores
 */
export interface TeamData {
  teamInfo: TeamInfo;
  teamScores: TeamScore[];
}

/**
 * Position-specific data for a team
 */
export interface PositionData {
  teams: [string, any][];
}

/**
 * League ranking with all positional breakdowns
 */
export interface LeagueRanking {
  key: string;
  teamInfo: TeamInfo;
  teamTotal: number;
  rank: number;
  positions: Record<TrackedPosition, number>;
  positionRanks: Record<TrackedPosition, number>;
}

/**
 * Position-specific team ranking
 */
export interface PositionRanking {
  key: string;
  teamInfo: TeamInfo;
  posScore: number;
  rank: number;
}

/**
 * Calculate league-wide rankings with positional breakdowns
 *
 * @param allTeamEntries - Array of [key, TeamData] entries
 * @param positionsMap - Map of position to PositionData
 * @param weekNum - Week number (null for season view)
 * @param isSeasonView - Whether this is a season aggregate view
 * @returns Array of LeagueRanking sorted by overall rank
 *
 * @example
 * const rankings = calculateLeagueRankings(
 *   allTeamEntries,
 *   positionsMap,
 *   4,
 *   false
 * );
 */
export const calculateLeagueRankings = (
  allTeamEntries: [string, TeamData][],
  positionsMap: Map<TrackedPosition, PositionData>,
  weekNum: number | null,
  isSeasonView: boolean,
): LeagueRanking[] => {
  const teams = allTeamEntries
    .map(([key, t]) => {
      const teamTotal = isSeasonView
        ? t.teamScores
            .filter((d: TeamScore) => d.value > 0)
            .reduce((a: number, d: TeamScore) => a + d.value, 0)
        : t.teamScores.find((d: TeamScore) => d.week === weekNum)?.value || 0;

      // Get positional data
      const posScores: Record<TrackedPosition, number> = {
        QB: 0,
        RB: 0,
        WR: 0,
        TE: 0,
        DEF: 0,
      };

      for (const position of ['QB', 'RB', 'WR', 'TE', 'DEF'] as TrackedPosition[]) {
        const posData = positionsMap.get(position);
        const posTeamsMap = new Map(posData?.teams || []);
        const teamPosData = posTeamsMap.get(key);

        if (teamPosData) {
          posScores[position] = isSeasonView
            ? teamPosData.scores
                .filter((d: any) => d.value > 0)
                .reduce((a: number, d: any) => a + d.value, 0)
            : teamPosData.scores.find((d: any) => d.week === weekNum)?.value || 0;
        }
      }

      return {
        key,
        teamInfo: t.teamInfo,
        teamTotal,
        positions: posScores,
      };
    })
    .filter(team => team.teamTotal > 0); // Only include teams with data

  // Calculate ranks
  const teamTotals = teams.map(t => t.teamTotal);
  const teamRanks = rank(teamTotals);

  const positionRanks: Record<TrackedPosition, number[]> = {
    QB: rank(teams.map(t => t.positions.QB)),
    RB: rank(teams.map(t => t.positions.RB)),
    WR: rank(teams.map(t => t.positions.WR)),
    TE: rank(teams.map(t => t.positions.TE)),
    DEF: rank(teams.map(t => t.positions.DEF)),
  };

  return teams
    .map((team, index) => ({
      ...team,
      rank: teamRanks[index],
      positionRanks: {
        QB: positionRanks.QB[index],
        RB: positionRanks.RB[index],
        WR: positionRanks.WR[index],
        TE: positionRanks.TE[index],
        DEF: positionRanks.DEF[index],
      },
    }))
    .sort((a, b) => a.rank - b.rank); // Sort by overall rank
};

/**
 * Calculate position-specific rankings
 *
 * @param allTeamEntries - Array of [key, TeamData] entries
 * @param positionsMap - Map of position to PositionData
 * @param position - Position to calculate rankings for
 * @param weekNum - Week number (null for season view)
 * @param isSeasonView - Whether this is a season aggregate view
 * @returns Array of PositionRanking sorted by position rank
 *
 * @example
 * const qbRankings = calculatePositionRankings(
 *   allTeamEntries,
 *   positionsMap,
 *   'QB',
 *   4,
 *   false
 * );
 */
export const calculatePositionRankings = (
  allTeamEntries: [string, TeamData][],
  positionsMap: Map<TrackedPosition, PositionData>,
  position: TrackedPosition,
  weekNum: number | null,
  isSeasonView: boolean,
): PositionRanking[] => {
  const teams = allTeamEntries
    .map(([key, t]) => {
      const posData = positionsMap.get(position);
      const posTeamsMap = new Map(posData?.teams || []);
      const teamPosData = posTeamsMap.get(key);

      if (!teamPosData) return null;

      const posScore = isSeasonView
        ? teamPosData.scores
            .filter((d: any) => d.value > 0)
            .reduce((a: number, d: any) => a + d.value, 0)
        : teamPosData.scores.find((d: any) => d.week === weekNum)?.value || 0;

      return {
        key,
        teamInfo: t.teamInfo,
        posScore,
      };
    })
    .filter(Boolean)
    .filter(team => team!.posScore > 0) as Array<{
    key: string;
    teamInfo: TeamInfo;
    posScore: number;
  }>;

  // Calculate ranks
  const posScores = teams.map(t => t.posScore);
  const posRanks = rank(posScores);

  return teams
    .map((team, index) => ({
      ...team,
      rank: posRanks[index],
    }))
    .sort((a, b) => a.rank - b.rank);
};

/**
 * Get weekly score data for sparkline chart
 *
 * @param teamData - Team data with weekly scores
 * @returns Array of {week, score} objects for chart
 *
 * @example
 * const sparklineData = getSparklineData(teamData);
 */
export const getSparklineData = (
  teamData: TeamData | undefined,
): Array<{ week: number; score: number }> => {
  if (!teamData) return [];

  return teamData.teamScores
    .filter((d: TeamScore) => d.value > 0)
    .map((d: TeamScore) => ({
      week: d.week,
      score: d.value,
    }));
};

/**
 * Get position-specific weekly scores for sparkline chart
 *
 * @param positionsMap - Map of position to PositionData
 * @param position - Position to get data for
 * @param teamKey - Team key
 * @returns Array of {week, score} objects for chart
 *
 * @example
 * const posSparklineData = getPositionSparklineData(positionsMap, 'QB', 'team1');
 */
export const getPositionSparklineData = (
  positionsMap: Map<TrackedPosition, PositionData>,
  position: TrackedPosition,
  teamKey: string,
): Array<{ week: number; score: number }> => {
  const posData = positionsMap.get(position);
  const posTeamsMap = new Map(posData?.teams || []);
  const teamPosData = posTeamsMap.get(teamKey);

  if (!teamPosData) return [];

  return teamPosData.scores
    .filter((d: any) => d.value !== 0)
    .map((d: any) => ({
      week: d.week,
      score: d.value,
    }));
};

/**
 * Get color for position sparkline based on rank
 *
 * @param rank - Position rank
 * @param colors - Color palette
 * @returns Color string
 *
 * @example
 * const color = getPositionSparklineColor(3, colors);
 */
export const getPositionSparklineColor = (rank: number, colors: any): string => {
  if (rank <= 6) {
    return colors.rdylgn[8]; // Elite = green
  } else if (rank <= 12) {
    return colors.rdylgn[5]; // Average = yellow
  } else {
    return colors.rdylgn[2]; // Below average = red
  }
};
