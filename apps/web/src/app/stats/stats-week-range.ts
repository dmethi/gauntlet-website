interface ResolveStatsWeekRangeOptions {
  currentWeek: number;
  configuredRange: { from: number; to: number };
  scoredWeeks: number[];
}

export const resolveStatsWeekRange = ({
  currentWeek,
  configuredRange,
  scoredWeeks,
}: ResolveStatsWeekRangeOptions) => {
  const from = Math.min(...scoredWeeks, configuredRange.from);
  const latestCompletedWeek = Math.min(configuredRange.to, currentWeek - 1);
  const to = Math.max(from, ...scoredWeeks, latestCompletedWeek);

  return { from, to };
};
