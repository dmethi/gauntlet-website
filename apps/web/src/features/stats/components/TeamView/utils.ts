import {
  getTeamPositionalSummary,
  mean,
  median,
  type PlainStatsDataset,
  rank,
} from '@/shared/utils/stats';
import type { PlayerBreakdown, TrackedPosition } from '@/shared/utils/stats';
import type {
  PositionalTeamData,
  PositionData,
  TeamData,
  TeamInfo,
  TeamScore,
} from '@/features/stats/types';

type TeamEntry = [string, TeamData];

export interface TeamTotalsResult {
  teamKey: string;
  teamInfo: TeamInfo;
  leagueId?: string;
  weeks: number[];
  teamTotal: number;
  opponentTotal: number;
  gamesPlayed: number;
  wins: number;
  losses: number;
  ties: number;
  leagueTotals: number[];
  leagueAverageByWeek: number[];
  leagueMedianByWeek: number[];
  leagueAverage: number;
  leagueMedian: number;
  seasonRank24: number;
  seasonRankLeague: number;
  averageOpponentRank: number;
  consistencyScore: number;
  topPerformers: PlayerContributionAggregate[];
}

export interface WeeklyPerformanceRow {
  week: number;
  teamScore: number;
  opponentScore: number;
  rank24: number;
  rankLeague: number;
  opponentRank24: number;
  opponentRankLeague: number;
  vsLeagueAverage: number;
  vsLeagueMedian: number;
  result: 'W' | 'L' | 'T';
  opponentKey?: string;
}

export interface PositionalBreakdownSummary {
  position: TrackedPosition;
  seasonTotal: number;
  gamesPlayed: number;
  rank24: number;
  rankLeague: number;
  opponentTotal: number;
  opponentRank24: number;
  opponentRankLeague: number;
  leagueAverage: number;
  leagueMedian: number;
}

export interface PositionalBreakdownRow {
  week: number;
  teamPoints: number;
  opponentPoints: number;
  rank24: number;
  rankLeague: number;
  opponentRank24: number;
  opponentRankLeague: number;
  vsAverage: number;
  vsMedian: number;
  opponentKey?: string;
}

export interface PositionalBreakdownResult {
  summary: PositionalBreakdownSummary;
  weekly: PositionalBreakdownRow[];
}

export interface PlayerContributionGroup {
  week: number;
  position: TrackedPosition;
  players: PlayerBreakdown[];
}

export interface PlayerContributionAggregate {
  playerId: string;
  name: string;
  totalPoints: number;
  team?: string;
  appearances: number;
}

export interface PlayerContributionsResult {
  groups: PlayerContributionGroup[];
  totals: PlayerContributionAggregate[];
}

export interface TeamAdvantagesResult {
  teamKey: string;
  totalAdvantage: number;
  averageAdvantage: number;
  positions: Record<
    TrackedPosition,
    {
      weeklyAverage: number;
      leagueMedian: number;
      advantage: number;
      percentageAdvantage: number;
    }
  >;
}

export const calculateConsistency = (scores: number[]): number => {
  if (scores.length === 0) {
    return 0;
  }

  const avg = mean(scores);
  if (avg === 0) {
    return 100;
  }

  const variance = scores.reduce((acc, value) => acc + (value - avg) ** 2, 0) / scores.length;
  const stdev = Math.sqrt(variance);

  // Convert coefficient of variation into a 0-100 scale where higher = more consistent
  const coefficient = stdev / avg;
  const consistency = Math.max(0, 100 - coefficient * 100);
  return Math.round(consistency);
};

const findOpponentKeyForWeek = (
  week: number,
  selectedKey: string,
  allTeamEntries: TeamEntry[],
  opponentScore: number,
) => {
  const tolerance = 0.01;

  for (const [candidateKey, data] of allTeamEntries) {
    if (candidateKey === selectedKey) continue;
    const theirScore = data.teamScores.find(score => score.week === week)?.value;
    if (typeof theirScore !== 'number') continue;
    if (Math.abs(theirScore - opponentScore) <= tolerance) {
      return candidateKey;
    }
  }

  return undefined;
};

export const calculatePlayerContributions = (
  dataset: PlainStatsDataset,
  teamKey: string,
  weeks: number[],
): PlayerContributionsResult => {
  const groups: PlayerContributionGroup[] = [];
  const aggregate = new Map<string, PlayerContributionAggregate>();
  const positions: TrackedPosition[] = ['QB', 'RB', 'WR', 'TE', 'DEF'];

  for (const week of weeks) {
    const weekData = dataset.weeklyPlayerData[week]?.[teamKey];
    if (!weekData) continue;

    for (const position of positions) {
      const players = weekData.positions[position] || [];
      if (players.length === 0) continue;

      groups.push({ week, position, players });

      for (const player of players) {
        const existing = aggregate.get(player.playerId);
        if (existing) {
          existing.totalPoints += player.fantasyPoints;
          existing.appearances += 1;
        } else {
          aggregate.set(player.playerId, {
            playerId: player.playerId,
            name: player.name,
            totalPoints: player.fantasyPoints,
            team: player.team,
            appearances: 1,
          });
        }
      }
    }
  }

  const totals = Array.from(aggregate.values()).sort((a, b) => b.totalPoints - a.totalPoints);

  return { groups, totals };
};

export const groupByPosition = <T extends { position: TrackedPosition }>(
  items: T[],
): Map<TrackedPosition, T[]> => {
  const grouped = new Map<TrackedPosition, T[]>();

  for (const item of items) {
    const existing = grouped.get(item.position) || [];
    existing.push(item);
    grouped.set(item.position, existing);
  }

  return grouped;
};

export const calculateTeamTotals = ({
  teamEntry,
  allTeamEntries,
  selectedTeamKey,
  fromWeek,
  toWeek,
  availableWeeks,
  dataset,
}: {
  teamEntry?: TeamEntry;
  allTeamEntries: TeamEntry[];
  selectedTeamKey: string;
  fromWeek: number;
  toWeek: number;
  availableWeeks: number[];
  dataset: PlainStatsDataset;
}): TeamTotalsResult | null => {
  if (!teamEntry) {
    return null;
  }

  const [teamKey, teamData] = teamEntry;
  const weeks = availableWeeks.filter(week => week >= fromWeek && week <= toWeek);
  const teamScoresInRange = teamData.teamScores.filter(
    score => score.week >= fromWeek && score.week <= toWeek,
  );
  const opponentScoresInRange = teamData.opponentScores.filter(
    score => score.week >= fromWeek && score.week <= toWeek,
  );

  const teamTotal = teamScoresInRange.reduce((sum, score) => sum + score.value, 0);
  const opponentTotal = opponentScoresInRange.reduce((sum, score) => sum + score.value, 0);
  const gamesPlayed = teamScoresInRange.length;

  let wins = 0;
  let losses = 0;
  let ties = 0;

  for (const score of teamScoresInRange) {
    const opponentScore = opponentScoresInRange.find(os => os.week === score.week)?.value ?? 0;
    if (score.value > opponentScore) {
      wins += 1;
    } else if (score.value < opponentScore) {
      losses += 1;
    } else {
      ties += 1;
    }
  }

  const leagueTotals = allTeamEntries.map(([, data]) =>
    data.teamScores
      .filter(score => score.week >= fromWeek && score.week <= toWeek)
      .reduce((sum, score) => sum + score.value, 0),
  );

  const leagueAverageByWeek = weeks.map(week => {
    const weeklyScores = allTeamEntries
      .map(([, data]) => data.teamScores.find(score => score.week === week)?.value)
      .filter((value): value is number => typeof value === 'number');
    return weeklyScores.length > 0 ? mean(weeklyScores) : 0;
  });

  const leagueMedianByWeek = weeks.map(week => {
    const weeklyScores = allTeamEntries
      .map(([, data]) => data.teamScores.find(score => score.week === week)?.value)
      .filter((value): value is number => typeof value === 'number');
    return weeklyScores.length > 0 ? median(weeklyScores) : 0;
  });

  const ranks24 = rank(leagueTotals);
  const seasonRank24 = ranks24[allTeamEntries.findIndex(([key]) => key === teamKey)] ?? 0;

  const leagueId = teamData.teamInfo.leagueId;
  const leagueTeams = leagueId
    ? allTeamEntries.filter(([, data]) => data.teamInfo.leagueId === leagueId)
    : [];
  const leagueTotalsOnly = leagueTeams.map(([, data]) =>
    data.teamScores
      .filter(score => score.week >= fromWeek && score.week <= toWeek)
      .reduce((sum, score) => sum + score.value, 0),
  );
  const ranksLeague = leagueTotalsOnly.length > 0 ? rank(leagueTotalsOnly) : [];
  const seasonRankLeague =
    leagueTotalsOnly.length > 0
      ? (ranksLeague[leagueTeams.findIndex(([key]) => key === teamKey)] ?? 0)
      : 0;

  const averageOpponentRank = (() => {
    if (gamesPlayed === 0) return 0;
    let totalRank = 0;
    let counted = 0;

    for (const week of weeks) {
      const myOpponentScore = opponentScoresInRange.find(score => score.week === week)?.value ?? 0;
      if (myOpponentScore === 0) continue;

      const weeklyScores = allTeamEntries.map(([, data]) => ({
        score: data.teamScores.find(s => s.week === week)?.value ?? 0,
      }));
      const weeklyRanks = rank(weeklyScores.map(s => s.score));
      const opponentKey = findOpponentKeyForWeek(week, teamKey, allTeamEntries, myOpponentScore);
      if (!opponentKey) continue;
      const opponentIndex = allTeamEntries.findIndex(([key]) => key === opponentKey);
      if (opponentIndex === -1) continue;
      totalRank += weeklyRanks[opponentIndex] ?? 0;
      counted += 1;
    }

    return counted > 0 ? totalRank / counted : 0;
  })();

  const consistencyScore = calculateConsistency(teamScoresInRange.map(score => score.value));

  const contributions = calculatePlayerContributions(dataset, teamKey, weeks);
  const topPerformers = contributions.totals.slice(0, 5);

  return {
    teamKey,
    teamInfo: teamData.teamInfo,
    leagueId,
    weeks,
    teamTotal,
    opponentTotal,
    gamesPlayed,
    wins,
    losses,
    ties,
    leagueTotals,
    leagueAverageByWeek,
    leagueMedianByWeek,
    leagueAverage: leagueTotals.length > 0 ? mean(leagueTotals) : 0,
    leagueMedian: leagueTotals.length > 0 ? median(leagueTotals) : 0,
    seasonRank24,
    seasonRankLeague,
    averageOpponentRank,
    consistencyScore,
    topPerformers,
  };
};

const toTeamScoreMap = (scores: TeamScore[]) => {
  const map = new Map<number, number>();
  for (const score of scores) {
    map.set(score.week, score.value);
  }
  return map;
};

export const calculateWeeklyPerformance = ({
  teamTotals,
  allTeamEntries,
  selectedTeamKey,
  fromWeek,
  toWeek,
}: {
  teamTotals: TeamTotalsResult;
  allTeamEntries: TeamEntry[];
  selectedTeamKey: string;
  fromWeek: number;
  toWeek: number;
}): WeeklyPerformanceRow[] => {
  const { leagueId, weeks, leagueAverageByWeek, leagueMedianByWeek } = teamTotals;
  const [, teamData] =
    allTeamEntries.find(([key]) => key === selectedTeamKey) ?? ([] as unknown as TeamEntry);
  if (!teamData) return [];

  const teamScoreMap = toTeamScoreMap(
    teamData.teamScores.filter(score => score.week >= fromWeek && score.week <= toWeek),
  );
  const opponentScoreMap = toTeamScoreMap(
    teamData.opponentScores.filter(score => score.week >= fromWeek && score.week <= toWeek),
  );

  return weeks.map((week, index) => {
    const teamScore = teamScoreMap.get(week) ?? 0;
    const opponentScore = opponentScoreMap.get(week) ?? 0;

    const weeklyValues = allTeamEntries.map(
      ([, data]) => data.teamScores.find(score => score.week === week)?.value ?? 0,
    );
    const ranks24 = rank(weeklyValues);
    const teamIndex24 = allTeamEntries.findIndex(([key]) => key === selectedTeamKey);
    const rank24 = ranks24[teamIndex24] ?? 0;

    const leagueEntries = leagueId
      ? allTeamEntries.filter(([, data]) => data.teamInfo.leagueId === leagueId)
      : [];
    const leagueValues = leagueEntries.map(
      ([, data]) => data.teamScores.find(score => score.week === week)?.value ?? 0,
    );
    const leagueRanks = leagueValues.length > 0 ? rank(leagueValues) : [];
    const leagueIndex = leagueEntries.findIndex(([key]) => key === selectedTeamKey);
    const rankLeague = leagueRanks.length > 0 ? (leagueRanks[leagueIndex] ?? 0) : 0;

    const opponentValues = allTeamEntries.map(
      ([, data]) => data.opponentScores.find(score => score.week === week)?.value ?? 0,
    );
    const opponentRanks24 = rank(opponentValues);
    const opponentRank24 = opponentRanks24[teamIndex24] ?? 0;

    const opponentLeagueValues = leagueEntries.map(
      ([, data]) => data.opponentScores.find(score => score.week === week)?.value ?? 0,
    );
    const opponentLeagueRanks = opponentLeagueValues.length > 0 ? rank(opponentLeagueValues) : [];
    const opponentRankLeague =
      opponentLeagueRanks.length > 0 ? (opponentLeagueRanks[leagueIndex] ?? 0) : 0;

    const opponentKey = findOpponentKeyForWeek(
      week,
      selectedTeamKey,
      allTeamEntries,
      opponentScore,
    );

    let result: 'W' | 'L' | 'T' = 'T';
    if (teamScore > opponentScore) result = 'W';
    if (teamScore < opponentScore) result = 'L';

    return {
      week,
      teamScore,
      opponentScore,
      rank24,
      rankLeague,
      opponentRank24,
      opponentRankLeague,
      vsLeagueAverage: teamScore - (leagueAverageByWeek[index] ?? 0),
      vsLeagueMedian: teamScore - (leagueMedianByWeek[index] ?? 0),
      result,
      opponentKey,
    };
  });
};

const getPositionTeamsMap = (positionData?: PositionData): Map<string, PositionalTeamData> => {
  return new Map(positionData?.teams || []);
};

export const calculatePositionalBreakdown = ({
  positions,
  positionsMap,
  selectedTeamKey,
  allTeamEntries,
  fromWeek,
  toWeek,
  weeks,
}: {
  positions: TrackedPosition[];
  positionsMap: Map<TrackedPosition, PositionData>;
  selectedTeamKey: string;
  allTeamEntries: TeamEntry[];
  fromWeek: number;
  toWeek: number;
  weeks: number[];
}): Map<TrackedPosition, PositionalBreakdownResult> => {
  const results = new Map<TrackedPosition, PositionalBreakdownResult>();
  const selectedTeam = allTeamEntries.find(([key]) => key === selectedTeamKey);
  const leagueId = selectedTeam?.[1].teamInfo.leagueId;

  for (const position of positions) {
    const posData = positionsMap.get(position);
    const teamsMap = getPositionTeamsMap(posData);
    const teamPosData = teamsMap.get(selectedTeamKey);

    if (!teamPosData) {
      continue;
    }

    const posSeasonScores = teamPosData.scores.filter(
      score => score.week >= fromWeek && score.week <= toWeek,
    );
    const seasonTotal = posSeasonScores.reduce((sum, score) => sum + score.value, 0);
    const gamesPlayed = posSeasonScores.length;

    const teamsMapEntries = Array.from(teamsMap.entries());
    const allPosTotals = teamsMapEntries.map(([, team]) =>
      team.scores
        .filter(score => score.week >= fromWeek && score.week <= toWeek)
        .reduce((sum, score) => sum + score.value, 0),
    );
    const posRanks24 = rank(allPosTotals);
    const teamKeys = teamsMapEntries.map(([key]) => key);
    const teamIndex24 = teamKeys.findIndex(key => key === selectedTeamKey);
    const rank24 = posRanks24[teamIndex24] ?? 0;

    const leagueTeams =
      leagueId != null
        ? teamsMapEntries.filter(([, data]) => data.teamInfo.leagueId === leagueId)
        : [];
    const leagueTotals = leagueTeams.map(([, data]) =>
      data.scores
        .filter(score => score.week >= fromWeek && score.week <= toWeek)
        .reduce((sum, score) => sum + score.value, 0),
    );
    const leagueRanks = leagueTotals.length > 0 ? rank(leagueTotals) : [];
    const leagueIndex = leagueTeams.findIndex(([key]) => key === selectedTeamKey);
    const rankLeague = leagueRanks.length > 0 ? (leagueRanks[leagueIndex] ?? 0) : 0;

    const leagueAverage = allPosTotals.length > 0 ? mean(allPosTotals) : 0;
    const leagueMedian = allPosTotals.length > 0 ? median(allPosTotals) : 0;

    const weekly: PositionalBreakdownRow[] = [];
    const opponentTotals: number[] = [];
    const opponentRanks24: number[] = [];
    const opponentRanksLeague: number[] = [];

    for (const week of weeks) {
      const teamPoints = teamPosData.scores.find(score => score.week === week)?.value ?? 0;
      const opponentScore =
        selectedTeam?.[1].opponentScores.find(score => score.week === week)?.value ?? 0;
      const opponentKey = findOpponentKeyForWeek(
        week,
        selectedTeamKey,
        allTeamEntries,
        opponentScore,
      );
      const opponentTeam = opponentKey ? teamsMap.get(opponentKey) : undefined;
      const opponentPoints = opponentTeam?.scores.find(score => score.week === week)?.value ?? 0;

      const weeklyAllValues = Array.from(teamsMap.values()).map(
        data => data.scores.find(score => score.week === week)?.value ?? 0,
      );
      const weeklyRanks24 = rank(weeklyAllValues);
      const weeklyRank24 = weeklyRanks24[teamIndex24] ?? 0;

      const weeklyLeagueValues = leagueTeams.map(
        ([, data]) => data.scores.find(score => score.week === week)?.value ?? 0,
      );
      const weeklyLeagueRanks = weeklyLeagueValues.length > 0 ? rank(weeklyLeagueValues) : [];
      const weeklyRankLeague =
        weeklyLeagueRanks.length > 0 && leagueIndex !== -1
          ? (weeklyLeagueRanks[leagueIndex] ?? 0)
          : 0;

      const opponentWeeklyRank24 = opponentKey
        ? (weeklyRanks24[teamKeys.findIndex(key => key === opponentKey)] ?? 0)
        : 0;
      const opponentWeeklyRankLeague =
        opponentKey && leagueId != null
          ? (weeklyLeagueRanks[leagueTeams.findIndex(([key]) => key === opponentKey)] ?? 0)
          : 0;

      const weeklyAvg = weeklyAllValues.length > 0 ? mean(weeklyAllValues) : 0;
      const weeklyMedian = weeklyAllValues.length > 0 ? median(weeklyAllValues) : 0;

      weekly.push({
        week,
        teamPoints,
        opponentPoints,
        rank24: weeklyRank24,
        rankLeague: weeklyRankLeague,
        opponentRank24: opponentWeeklyRank24,
        opponentRankLeague: opponentWeeklyRankLeague,
        vsAverage: teamPoints - weeklyAvg,
        vsMedian: teamPoints - weeklyMedian,
        opponentKey,
      });

      opponentTotals.push(opponentPoints);
      if (opponentWeeklyRank24 > 0) opponentRanks24.push(opponentWeeklyRank24);
      if (opponentWeeklyRankLeague > 0) opponentRanksLeague.push(opponentWeeklyRankLeague);
    }

    const opponentTotal = opponentTotals.reduce((sum, value) => sum + value, 0);
    const opponentRank24 =
      opponentRanks24.length > 0
        ? Math.round(
            opponentRanks24.reduce((sum, value) => sum + value, 0) / opponentRanks24.length,
          )
        : 0;
    const opponentRankLeague =
      opponentRanksLeague.length > 0
        ? Math.round(
            opponentRanksLeague.reduce((sum, value) => sum + value, 0) / opponentRanksLeague.length,
          )
        : 0;

    results.set(position, {
      summary: {
        position,
        seasonTotal,
        gamesPlayed,
        rank24,
        rankLeague,
        opponentTotal,
        opponentRank24,
        opponentRankLeague,
        leagueAverage,
        leagueMedian,
      },
      weekly,
    });
  }

  return results;
};

export const calculateTeamAdvantages = ({
  dataset,
  teamKey,
  fromWeek,
  toWeek,
}: {
  dataset: PlainStatsDataset;
  teamKey: string;
  fromWeek: number;
  toWeek: number;
}): TeamAdvantagesResult | null => {
  const summary = getTeamPositionalSummary(dataset, teamKey, { from: fromWeek, to: toWeek });
  if (!summary) return null;

  return {
    teamKey: summary.teamKey,
    totalAdvantage: summary.totalAdvantage,
    averageAdvantage: summary.averageAdvantage,
    positions: summary.positions,
  };
};
