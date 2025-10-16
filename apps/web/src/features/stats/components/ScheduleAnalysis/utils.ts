import type { PlainStatsDataset } from '@/shared/utils/stats';
import type { ScheduleAnalysisProps, TeamData, TeamInfo } from '@/features/stats/types';

export interface ScheduleMatrixRecord {
  wins: number;
  losses: number;
  totalGames: number;
}

export type ScheduleMatrix = Map<string, Map<string, ScheduleMatrixRecord>>;

export interface HypotheticalRecordSummary {
  teamKey: string;
  teamInfo: TeamInfo;
  totalWins: number;
  totalLosses: number;
  totalGames: number;
  winPct: number;
}

export interface ScheduleDifficultyEntry {
  scheduleOwnerKey: string;
  scheduleOwnerInfo: TeamInfo;
  avgWinPct: number;
  totalGames: number;
}

export interface LuckAnalysisEntry {
  teamKey: string;
  teamInfo: TeamInfo;
  actualWins: number;
  actualGames: number;
  actualWinPct: number;
  overallWinPct: number;
  scheduleEase: number;
  expectedWinPct: number;
  luckRating: number;
  pointDiff: number;
}

export interface TeamLuckDistribution {
  team: TeamData;
  actualWins: number;
  actualGames: number;
  actualWinPct: number;
  overallWinPct: number;
  expectedWinPct: number;
  pointDiff: number;
  othersWithMyScheduleAvg: number;
  myWithOthersAvg: number;
  scheduleLuck: number;
  performanceLuck: number;
  luckRating: number;
  myDistChart: Array<{ wins: number; count: number; isActual: boolean }>;
  othersDistChart: Array<{ wins: number; count: number; isActual: boolean }>;
}

export interface WeeklyDifficultyPoint {
  week: number;
  difficulty: number;
  teamKey: string;
  teamName: string;
}

const mean = (values: number[]): number => {
  if (!values.length) return 0;
  const total = values.reduce((sum, value) => sum + value, 0);
  return total / values.length;
};

const buildRecord = (): ScheduleMatrixRecord => ({ wins: 0, losses: 0, totalGames: 0 });

export const buildScheduleMatrix = (
  allTeamEntries: ScheduleAnalysisProps['allTeamEntries'],
  currentWeek: number,
): ScheduleMatrix => {
  const matrix: ScheduleMatrix = new Map();

  for (const [teamKey] of allTeamEntries) {
    const row = new Map<string, ScheduleMatrixRecord>();
    for (const [opponentKey] of allTeamEntries) {
      if (teamKey !== opponentKey) {
        row.set(opponentKey, buildRecord());
      }
    }
    matrix.set(teamKey, row);
  }

  for (const [teamAKey, teamA] of allTeamEntries) {
    for (const [teamBKey, teamB] of allTeamEntries) {
      if (teamAKey === teamBKey) continue;

      const record = matrix.get(teamAKey)?.get(teamBKey);
      if (!record) continue;

      for (let week = 1; week <= currentWeek - 1; week++) {
        const teamAScore = teamA.teamScores.find(score => score.week === week)?.value || 0;
        const teamBOppScore = teamB.opponentScores.find(score => score.week === week)?.value || 0;

        if (teamAScore > 0 && teamBOppScore > 0) {
          if (teamAScore > teamBOppScore) {
            record.wins += 1;
          } else if (teamAScore < teamBOppScore) {
            record.losses += 1;
          }
          record.totalGames += 1;
        }
      }
    }
  }

  return matrix;
};

export const calculateHypotheticalSummary = (
  allTeamEntries: ScheduleAnalysisProps['allTeamEntries'],
  scheduleMatrix: ScheduleMatrix,
): HypotheticalRecordSummary[] => {
  return allTeamEntries
    .map(([teamKey, team]) => {
      let totalWins = 0;
      let totalLosses = 0;
      let totalGames = 0;

      const teamRecord = scheduleMatrix.get(teamKey);
      if (teamRecord) {
        for (const record of teamRecord.values()) {
          totalWins += record.wins;
          totalLosses += record.losses;
          totalGames += record.totalGames;
        }
      }

      return {
        teamKey,
        teamInfo: team.teamInfo,
        totalWins,
        totalLosses,
        totalGames,
        winPct: totalGames > 0 ? totalWins / totalGames : 0,
      } satisfies HypotheticalRecordSummary;
    })
    .sort((a, b) => b.winPct - a.winPct);
};

export const calculateScheduleDifficulty = (
  allTeamEntries: ScheduleAnalysisProps['allTeamEntries'],
  scheduleMatrix: ScheduleMatrix,
): ScheduleDifficultyEntry[] => {
  return allTeamEntries
    .map(([scheduleOwnerKey, scheduleOwner]) => {
      let totalWins = 0;
      let totalGames = 0;

      for (const [teamKey] of allTeamEntries) {
        if (teamKey === scheduleOwnerKey) continue;
        const record = scheduleMatrix.get(teamKey)?.get(scheduleOwnerKey);
        if (record) {
          totalWins += record.wins;
          totalGames += record.totalGames;
        }
      }

      return {
        scheduleOwnerKey,
        scheduleOwnerInfo: scheduleOwner.teamInfo,
        avgWinPct: totalGames > 0 ? totalWins / totalGames : 0,
        totalGames,
      } satisfies ScheduleDifficultyEntry;
    })
    .sort((a, b) => a.avgWinPct - b.avgWinPct);
};

const calculateActualRecord = (team: TeamData) => {
  const wins = team.teamScores.filter((score, index) => {
    const oppScore = team.opponentScores[index];
    return score.value > 0 && oppScore && score.value > oppScore.value;
  }).length;

  const games = team.teamScores.filter(score => score.value > 0).length;
  const winPct = games > 0 ? wins / games : 0;

  return { wins, games, winPct };
};

const calculateExpectedWinPct = (team: TeamData) => {
  const teamPoints = team.teamScores.filter(d => d.value > 0).reduce((sum, d) => sum + d.value, 0);
  const oppPoints = team.opponentScores
    .filter(d => d.value > 0)
    .reduce((sum, d) => sum + d.value, 0);
  const totalPoints = teamPoints + oppPoints;

  if (totalPoints === 0) return 0;

  const pointDiff = teamPoints - oppPoints;
  return Math.max(0, Math.min(1, 0.5 + (pointDiff / totalPoints) * 1.5));
};

export const calculateLuckAnalysis = (
  allTeamEntries: ScheduleAnalysisProps['allTeamEntries'],
  scheduleMatrix: ScheduleMatrix,
  summaryStats: HypotheticalRecordSummary[],
): LuckAnalysisEntry[] => {
  return allTeamEntries
    .map(([teamKey, team]) => {
      const {
        wins: actualWins,
        games: actualGames,
        winPct: actualWinPct,
      } = calculateActualRecord(team);

      const teamSummary = summaryStats.find(entry => entry.teamKey === teamKey);
      const overallWinPct = teamSummary?.winPct ?? 0;

      const othersWithMyScheduleWinPcts: number[] = [];
      for (const [otherKey] of allTeamEntries) {
        if (otherKey === teamKey) continue;
        const record = scheduleMatrix.get(otherKey)?.get(teamKey);
        if (record && record.totalGames > 0) {
          othersWithMyScheduleWinPcts.push(record.wins / record.totalGames);
        }
      }

      const scheduleEase = othersWithMyScheduleWinPcts.length
        ? mean(othersWithMyScheduleWinPcts)
        : 0;

      const expectedWinPct = calculateExpectedWinPct(team);
      const luckRating = actualWinPct - expectedWinPct;

      const teamPoints = team.teamScores
        .filter(d => d.value > 0)
        .reduce((sum, d) => sum + d.value, 0);
      const oppPoints = team.opponentScores
        .filter(d => d.value > 0)
        .reduce((sum, d) => sum + d.value, 0);

      return {
        teamKey,
        teamInfo: team.teamInfo,
        actualWins,
        actualGames,
        actualWinPct,
        overallWinPct,
        scheduleEase,
        expectedWinPct,
        luckRating,
        pointDiff: teamPoints - oppPoints,
      } satisfies LuckAnalysisEntry;
    })
    .sort((a, b) => b.luckRating - a.luckRating);
};

export const calculateTeamLuckDistribution = (
  selectedTeamKey: string,
  allTeamEntries: ScheduleAnalysisProps['allTeamEntries'],
  scheduleMatrix: ScheduleMatrix,
  summaryStats: HypotheticalRecordSummary[],
): TeamLuckDistribution | null => {
  const selected = allTeamEntries.find(([key]) => key === selectedTeamKey);
  if (!selected) return null;

  const [, team] = selected;
  const {
    wins: actualWins,
    games: actualGames,
    winPct: actualWinPct,
  } = calculateActualRecord(team);

  const teamSummary = summaryStats.find(entry => entry.teamKey === selectedTeamKey);
  const overallWinPct = teamSummary?.winPct ?? 0;

  const expectedWinPct = calculateExpectedWinPct(team);

  const teamPoints = team.teamScores.filter(d => d.value > 0).reduce((sum, d) => sum + d.value, 0);
  const oppPoints = team.opponentScores
    .filter(d => d.value > 0)
    .reduce((sum, d) => sum + d.value, 0);

  const scheduleLuck = overallWinPct - actualWinPct;
  const performanceLuck = actualWinPct - expectedWinPct;
  const luckRating = performanceLuck;

  const myDistribution = new Map<number, number>();
  const othersDistribution = new Map<number, number>();

  const selectedRecordRow = scheduleMatrix.get(selectedTeamKey);
  if (selectedRecordRow) {
    for (const record of selectedRecordRow.values()) {
      if (record.totalGames > 0) {
        const wins = Math.round((record.wins / record.totalGames) * actualGames);
        myDistribution.set(wins, (myDistribution.get(wins) || 0) + 1);
      }
    }
  }

  for (const [otherKey] of allTeamEntries) {
    if (otherKey === selectedTeamKey) continue;
    const otherRecord = scheduleMatrix.get(otherKey)?.get(selectedTeamKey);
    if (otherRecord && otherRecord.totalGames > 0) {
      const wins = Math.round((otherRecord.wins / otherRecord.totalGames) * actualGames);
      othersDistribution.set(wins, (othersDistribution.get(wins) || 0) + 1);
    }
  }

  const myDistChart = Array.from(myDistribution.entries()).map(([wins, count]) => ({
    wins,
    count,
    isActual: wins === actualWins,
  }));

  const othersDistChart = Array.from(othersDistribution.entries()).map(([wins, count]) => ({
    wins,
    count,
    isActual: wins === actualWins,
  }));

  return {
    team,
    actualWins,
    actualGames,
    actualWinPct,
    overallWinPct,
    expectedWinPct,
    pointDiff: teamPoints - oppPoints,
    othersWithMyScheduleAvg: myDistribution.size
      ? mean(Array.from(myDistribution.entries()).map(([wins]) => wins / Math.max(1, actualGames)))
      : 0,
    myWithOthersAvg: othersDistribution.size
      ? mean(
          Array.from(othersDistribution.entries()).map(([wins]) => wins / Math.max(1, actualGames)),
        )
      : 0,
    scheduleLuck,
    performanceLuck,
    luckRating,
    myDistChart,
    othersDistChart,
  } satisfies TeamLuckDistribution;
};

export const calculateWeeklyDifficulty = (
  allTeamEntries: ScheduleAnalysisProps['allTeamEntries'],
  dataset: PlainStatsDataset,
): WeeklyDifficultyPoint[] => {
  const points: WeeklyDifficultyPoint[] = [];
  const maxWeek = dataset.currentWeek - 1;
  if (maxWeek < 1) return points;

  for (const [teamKey, team] of allTeamEntries) {
    for (let week = 1; week <= maxWeek; week++) {
      const opponentScore = team.opponentScores.find(score => score.week === week)?.value;
      if (!opponentScore) continue;

      const leagueAvg = dataset.weeklyAverages?.[week]?.teamScores ?? 0;
      const difficulty = opponentScore - leagueAvg;

      points.push({
        week,
        difficulty,
        teamKey,
        teamName: team.teamInfo.teamName,
      });
    }
  }

  return points;
};

export const splitTeamsByConference = (allTeamEntries: ScheduleAnalysisProps['allTeamEntries']) => {
  const afcTeams = allTeamEntries.filter(([, team]) => team.teamInfo.leagueName.includes('AFC'));
  const nfcTeams = allTeamEntries.filter(([, team]) => team.teamInfo.leagueName.includes('NFC'));
  return { afcTeams, nfcTeams };
};
