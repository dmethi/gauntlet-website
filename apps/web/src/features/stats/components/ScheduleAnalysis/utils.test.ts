import { describe, expect, it } from 'vitest';
import type { ScheduleAnalysisProps, TeamData } from '@/features/stats/types';
import type { PlainStatsDataset } from '@/shared/utils/stats';
import {
  buildScheduleMatrix,
  calculateHypotheticalSummary,
  calculateLuckAnalysis,
  calculateScheduleDifficulty,
  calculateTeamLuckDistribution,
  calculateWeeklyDifficulty,
} from './utils';

const createTeam = (overrides: Partial<TeamData> & { key: string }): [string, TeamData] => {
  const { key, ...rest } = overrides;
  return [
    key,
    {
      teamInfo: {
        teamName: rest.teamInfo?.teamName ?? `Team ${key}`,
        leagueName: rest.teamInfo?.leagueName ?? 'League',
        avatar: undefined,
        leagueId: undefined,
        rosterId: undefined,
      },
      teamScores:
        rest.teamScores ??
        Array.from({ length: 3 }, (_, index) => ({ week: index + 1, value: 120 + index })),
      opponentScores:
        rest.opponentScores ??
        Array.from({ length: 3 }, (_, index) => ({ week: index + 1, value: 110 + index })),
    },
  ];
};

const createDataset = (
  entries: ScheduleAnalysisProps['allTeamEntries'],
): ScheduleAnalysisProps => ({
  allTeamEntries: entries,
  dataset: {
    currentWeek: 4,
    currentSeason: '2025',
    leagues: [],
    weekRange: { from: 1, to: 18 },
    teams: [],
    positions: [],
    weeklyPlayerData: {},
    weeklyMedians: {},
    weeklyAverages: {
      1: { teamScores: 120, opponentScores: 118, positions: {} },
      2: { teamScores: 122, opponentScores: 119, positions: {} },
      3: { teamScores: 123, opponentScores: 118, positions: {} },
    },
  } as PlainStatsDataset,
});

describe('ScheduleAnalysis utils', () => {
  const teamA = createTeam({ key: 'A', teamInfo: { teamName: 'Alpha', leagueName: 'AFC' } });
  const teamB = createTeam({
    key: 'B',
    teamInfo: { teamName: 'Bravo', leagueName: 'NFC' },
    teamScores: [
      { week: 1, value: 105 },
      { week: 2, value: 108 },
      { week: 3, value: 115 },
    ],
    opponentScores: [
      { week: 1, value: 112 },
      { week: 2, value: 121 },
      { week: 3, value: 118 },
    ],
  });
  const teamC = createTeam({ key: 'C', teamInfo: { teamName: 'Charlie', leagueName: 'AFC' } });

  const entries: ScheduleAnalysisProps['allTeamEntries'] = [teamA, teamB, teamC];
  const dataset = createDataset(entries);

  it('builds schedule matrix with wins/losses records', () => {
    const matrix = buildScheduleMatrix(entries, dataset.dataset.currentWeek);
    const record = matrix.get('A')?.get('B');
    expect(record).toBeDefined();
    expect(record?.totalGames).toBeGreaterThan(0);
  });

  it('produces hypothetical record summary', () => {
    const matrix = buildScheduleMatrix(entries, dataset.dataset.currentWeek);
    const summary = calculateHypotheticalSummary(entries, matrix);
    expect(summary).toHaveLength(3);
    expect(summary[0]).toHaveProperty('winPct');
  });

  it('calculates schedule difficulty rankings', () => {
    const matrix = buildScheduleMatrix(entries, dataset.dataset.currentWeek);
    const difficulty = calculateScheduleDifficulty(entries, matrix);
    expect(difficulty).toHaveLength(3);
  });

  it('computes luck analysis entries', () => {
    const matrix = buildScheduleMatrix(entries, dataset.dataset.currentWeek);
    const summary = calculateHypotheticalSummary(entries, matrix);
    const luck = calculateLuckAnalysis(entries, matrix, summary);
    expect(luck).toHaveLength(3);
    expect(luck[0]).toHaveProperty('expectedWinPct');
  });

  it('builds team luck distribution for selected team', () => {
    const matrix = buildScheduleMatrix(entries, dataset.dataset.currentWeek);
    const summary = calculateHypotheticalSummary(entries, matrix);
    const detail = calculateTeamLuckDistribution('A', entries, matrix, summary);
    expect(detail).not.toBeNull();
    expect(detail?.myDistChart.length).toBeGreaterThan(0);
  });

  it('computes weekly difficulty points', () => {
    const points = calculateWeeklyDifficulty(entries, dataset.dataset);
    expect(points.length).toBeGreaterThan(0);
    expect(points[0]).toHaveProperty('week');
  });
});
