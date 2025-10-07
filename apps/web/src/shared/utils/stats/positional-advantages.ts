import type { PlainStatsDataset } from './compose';
import type { TrackedPosition } from './positions';
import { median } from './medians';

export interface PositionalAdvantage {
  position: TrackedPosition;
  teamKey: string;
  teamName: string;
  leagueName: string;
  weeklyAverage: number;
  leagueMedian: number;
  advantage: number; // positive = advantage, negative = disadvantage
  percentageAdvantage: number; // advantage as percentage of median
}

export interface TeamPositionalSummary {
  teamKey: string;
  teamName: string;
  leagueName: string;
  positions: Record<
    TrackedPosition,
    {
      weeklyAverage: number;
      leagueMedian: number;
      advantage: number;
      percentageAdvantage: number;
    }
  >;
  totalAdvantage: number; // sum of all positional advantages
  averageAdvantage: number; // average advantage per position
}

export interface PositionSummary {
  position: TrackedPosition;
  leagueMedian: number;
  teams: Array<{
    teamKey: string;
    teamName: string;
    leagueName: string;
    weeklyAverage: number;
    advantage: number;
    percentageAdvantage: number;
    rank: number; // 1 = best in position
  }>;
}

/**
 * Calculate weekly average positional medians across all teams for each position
 */
export function calculatePositionalMedians(
  dataset: PlainStatsDataset,
  weekRange: { from: number; to: number },
): Record<TrackedPosition, number> {
  const positions: TrackedPosition[] = ['QB', 'RB', 'WR', 'TE', 'DEF'];
  const medians: Record<TrackedPosition, number> = {} as any;

  const positionsMap = new Map(dataset.positions);

  for (const position of positions) {
    const posData = positionsMap.get(position);
    const posTeamsMap = new Map(posData?.teams || []);

    // Get weekly averages for all teams for this position
    const weeklyAverages: number[] = [];

    for (const [, teamPosData] of posTeamsMap.entries()) {
      const validScores = teamPosData.scores.filter(
        d => d.week >= weekRange.from && d.week <= weekRange.to,
      );

      if (validScores.length > 0) {
        const weeklyAverage = validScores.reduce((sum, d) => sum + d.value, 0) / validScores.length;
        weeklyAverages.push(weeklyAverage);
      }
    }

    medians[position] = median(weeklyAverages);
  }

  return medians;
}

/**
 * Calculate positional advantages for all teams
 */
export function calculateAllPositionalAdvantages(
  dataset: PlainStatsDataset,
  weekRange: { from: number; to: number },
): PositionalAdvantage[] {
  const positions: TrackedPosition[] = ['QB', 'RB', 'WR', 'TE', 'DEF'];
  const positionsMap = new Map(dataset.positions);
  const teamsMap = new Map(dataset.teams);
  const medians = calculatePositionalMedians(dataset, weekRange);

  const advantages: PositionalAdvantage[] = [];

  for (const position of positions) {
    const posData = positionsMap.get(position);
    const posTeamsMap = new Map(posData?.teams || []);
    const leagueMedian = medians[position];

    for (const [teamKey, teamPosData] of posTeamsMap.entries()) {
      const teamInfo = teamsMap.get(teamKey);
      if (!teamInfo) continue;

      const validScores = teamPosData.scores.filter(
        d => d.week >= weekRange.from && d.week <= weekRange.to,
      );

      if (validScores.length > 0) {
        const weeklyAverage = validScores.reduce((sum, d) => sum + d.value, 0) / validScores.length;
        const advantage = weeklyAverage - leagueMedian;
        const percentageAdvantage = leagueMedian > 0 ? (advantage / leagueMedian) * 100 : 0;

        advantages.push({
          position,
          teamKey,
          teamName: teamInfo.teamInfo.teamName,
          leagueName: teamInfo.teamInfo.leagueName,
          weeklyAverage,
          leagueMedian,
          advantage,
          percentageAdvantage,
        });
      }
    }
  }

  return advantages;
}

/**
 * Get positional summary for a specific team
 */
export function getTeamPositionalSummary(
  dataset: PlainStatsDataset,
  teamKey: string,
  weekRange: { from: number; to: number },
): TeamPositionalSummary | null {
  const positions: TrackedPosition[] = ['QB', 'RB', 'WR', 'TE', 'DEF'];
  const positionsMap = new Map(dataset.positions);
  const teamsMap = new Map(dataset.teams);
  const medians = calculatePositionalMedians(dataset, weekRange);

  const teamInfo = teamsMap.get(teamKey);
  if (!teamInfo) return null;

  const positionData: Record<TrackedPosition, any> = {} as any;
  let totalAdvantage = 0;
  let validPositions = 0;

  for (const position of positions) {
    const posData = positionsMap.get(position);
    const posTeamsMap = new Map(posData?.teams || []);
    const teamPosData = posTeamsMap.get(teamKey);
    const leagueMedian = medians[position];

    if (teamPosData) {
      const validScores = teamPosData.scores.filter(
        d => d.week >= weekRange.from && d.week <= weekRange.to,
      );

      if (validScores.length > 0) {
        const weeklyAverage = validScores.reduce((sum, d) => sum + d.value, 0) / validScores.length;
        const advantage = weeklyAverage - leagueMedian;
        const percentageAdvantage = leagueMedian > 0 ? (advantage / leagueMedian) * 100 : 0;

        positionData[position] = {
          weeklyAverage,
          leagueMedian,
          advantage,
          percentageAdvantage,
        };

        totalAdvantage += advantage;
        validPositions++;
      } else {
        positionData[position] = {
          weeklyAverage: 0,
          leagueMedian,
          advantage: -leagueMedian,
          percentageAdvantage: -100,
        };
      }
    } else {
      positionData[position] = {
        weeklyAverage: 0,
        leagueMedian,
        advantage: -leagueMedian,
        percentageAdvantage: -100,
      };
    }
  }

  return {
    teamKey,
    teamName: teamInfo.teamInfo.teamName,
    leagueName: teamInfo.teamInfo.leagueName,
    positions: positionData,
    totalAdvantage,
    averageAdvantage: validPositions > 0 ? totalAdvantage / validPositions : 0,
  };
}

/**
 * Get position-by-position summaries with team rankings
 */
export function getPositionSummaries(
  dataset: PlainStatsDataset,
  weekRange: { from: number; to: number },
): PositionSummary[] {
  const positions: TrackedPosition[] = ['QB', 'RB', 'WR', 'TE', 'DEF'];
  const positionsMap = new Map(dataset.positions);
  const teamsMap = new Map(dataset.teams);
  const medians = calculatePositionalMedians(dataset, weekRange);

  const summaries: PositionSummary[] = [];

  for (const position of positions) {
    const posData = positionsMap.get(position);
    const posTeamsMap = new Map(posData?.teams || []);
    const leagueMedian = medians[position];

    const teams: PositionSummary['teams'] = [];

    for (const [teamKey, teamPosData] of posTeamsMap.entries()) {
      const teamInfo = teamsMap.get(teamKey);
      if (!teamInfo) continue;

      const validScores = teamPosData.scores.filter(
        d => d.week >= weekRange.from && d.week <= weekRange.to,
      );

      if (validScores.length > 0) {
        const weeklyAverage = validScores.reduce((sum, d) => sum + d.value, 0) / validScores.length;
        const advantage = weeklyAverage - leagueMedian;
        const percentageAdvantage = leagueMedian > 0 ? (advantage / leagueMedian) * 100 : 0;

        teams.push({
          teamKey,
          teamName: teamInfo.teamInfo.teamName,
          leagueName: teamInfo.teamInfo.leagueName,
          weeklyAverage,
          advantage,
          percentageAdvantage,
          rank: 0, // Will be set below
        });
      }
    }

    // Sort teams by weekly average (descending) and assign ranks
    teams.sort((a, b) => b.weeklyAverage - a.weeklyAverage);
    teams.forEach((team, index) => {
      team.rank = index + 1;
    });

    summaries.push({
      position,
      leagueMedian,
      teams,
    });
  }

  return summaries;
}

/**
 * Get top positional advantages and disadvantages across all teams
 */
export function getTopPositionalAdvantages(
  dataset: PlainStatsDataset,
  weekRange: { from: number; to: number },
  topCount: number = 10,
): {
  topAdvantages: PositionalAdvantage[];
  topDisadvantages: PositionalAdvantage[];
} {
  const allAdvantages = calculateAllPositionalAdvantages(dataset, weekRange);

  // Sort by advantage (descending for advantages, ascending for disadvantages)
  const topAdvantages = allAdvantages
    .filter(a => a.advantage > 0)
    .sort((a, b) => b.advantage - a.advantage)
    .slice(0, topCount);

  const topDisadvantages = allAdvantages
    .filter(a => a.advantage < 0)
    .sort((a, b) => a.advantage - b.advantage)
    .slice(0, topCount);

  return {
    topAdvantages,
    topDisadvantages,
  };
}
