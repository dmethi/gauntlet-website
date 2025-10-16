import type { PositionalTeamData, PositionData, RidgeTeamData, TeamData } from '@/features/stats';
import type { TrackedPosition } from '@/shared/utils/stats';

interface RidgeChartResult {
  chartData: Array<
    RidgeTeamData & {
      x: number;
      y: number;
      type: 'ridge';
    }
  >;
  domain: [number, number];
}

const median = (values: number[]): number => {
  if (!values.length) {
    return NaN;
  }
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
};

const linspace = (start: number, end: number, count: number): number[] => {
  if (count <= 1) {
    return [start];
  }
  const step = (end - start) / (count - 1);
  return Array.from({ length: count }, (_, index) => start + index * step);
};

const kde = (samples: number[], xs: number[]): [number, number][] => {
  if (!samples.length) {
    return xs.map(value => [value, 0]);
  }

  const n = samples.length;
  const sampleMean = samples.reduce((sum, value) => sum + value, 0) / n;
  const sampleStd =
    Math.sqrt(
      samples.reduce((sum, value) => sum + (value - sampleMean) ** 2, 0) / Math.max(1, n - 1),
    ) || 1e-6;
  const bandwidth = Math.max(1e-6, 1.06 * sampleStd * Math.pow(n, -1 / 5));
  const inv = 1 / (Math.sqrt(2 * Math.PI) * bandwidth);
  const twoBandwidthSq = 2 * bandwidth * bandwidth;

  return xs.map(x => {
    const value = samples.reduce(
      (acc, sample) => acc + Math.exp(-((x - sample) ** 2) / twoBandwidthSq),
      0,
    );
    return [x, (inv * value) / n];
  });
};

const buildRidgeData = (
  entries: [string, TeamData][],
  getScores: (team: TeamData, teamKey: string) => number[],
  sampleSizeFactory: (scores: number[]) => number,
  padMultiplier: number,
): RidgeTeamData[] => {
  return entries
    .map(([teamKey, team]) => {
      const scores = getScores(team, teamKey)
        .filter(score => score > 0)
        .sort((a, b) => a - b);
      if (!scores.length) {
        return null;
      }

      const min = scores[0];
      const max = scores[scores.length - 1];
      const med = median(scores);
      const pad = Math.max(padMultiplier, (max - min) * 0.05);
      const xs = linspace(min, max, sampleSizeFactory(scores));
      const densityPairs = kde(scores, xs);
      const maxDensity = Math.max(...densityPairs.map(([, density]) => density)) || 1;

      return {
        teamName: team.teamInfo.teamName,
        leagueName: team.teamInfo.leagueName,
        teamKey,
        min,
        max,
        pad,
        median: med,
        range: max - min,
        scores,
        gamesPlayed: scores.length,
        xs,
        densityPairs,
        maxDensity,
      } satisfies RidgeTeamData;
    })
    .filter(Boolean)
    .sort((a, b) => b!.median - a!.median) as RidgeTeamData[];
};

const buildDomain = (
  ridgeData: RidgeTeamData[],
  fallback: [number, number],
  bufferRatio: number,
): [number, number] => {
  if (!ridgeData.length) {
    return fallback;
  }

  const valid = ridgeData.filter(
    entry => Number.isFinite(entry.min) && Number.isFinite(entry.max) && Number.isFinite(entry.pad),
  );

  if (!valid.length) {
    return fallback;
  }

  const mins = valid.map(entry => entry.min - entry.pad);
  const maxs = valid.map(entry => entry.max + entry.pad);

  const min = Math.min(...mins);
  const max = Math.max(...maxs);

  if (!Number.isFinite(min) || !Number.isFinite(max)) {
    return fallback;
  }

  const range = max - min;
  const buffer = range * bufferRatio;

  return [min - buffer, max + buffer];
};

export const buildTeamRidgePlot = (allTeamEntries: [string, TeamData][]): RidgeChartResult => {
  const ridgeData = buildRidgeData(
    allTeamEntries,
    team => team.teamScores.map(score => score.value),
    scores => Math.min(80, 20 + 3 * scores.length),
    2,
  );

  const domain = buildDomain(ridgeData, [80, 180], 0.05);

  const chartData = ridgeData.map((entry, index) => ({
    ...entry,
    x: entry.median,
    y: (ridgeData.length - index) * 3,
    type: 'ridge' as const,
  }));

  return { chartData, domain };
};

export const buildPositionRidgePlot = (
  position: TrackedPosition,
  allTeamEntries: [string, TeamData][],
  positionsMap: Map<TrackedPosition, PositionData>,
): RidgeChartResult => {
  const positionData = positionsMap.get(position);
  const teams = new Map<string, PositionalTeamData>(positionData?.teams ?? []);

  const ridgeData = buildRidgeData(
    allTeamEntries,
    (_team, teamKey) => {
      const scores =
        teams
          .get(teamKey)
          ?.scores.filter(score => score.value !== 0)
          .map(score => score.value) ?? [];
      return scores;
    },
    scores => Math.min(60, 15 + 2 * scores.length),
    1,
  );

  const domain = buildDomain(ridgeData, [0, 50], 0.05);

  const chartData = ridgeData.map((entry, index) => ({
    ...entry,
    x: entry.median,
    y: (ridgeData.length - index) * 2.5,
    type: 'ridge' as const,
  }));

  return { chartData, domain };
};
