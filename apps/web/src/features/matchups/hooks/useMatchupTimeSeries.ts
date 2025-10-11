import { useQuery } from '@tanstack/react-query';

/**
 * Time series data point for win probability and score over time charts
 */
export interface TimeSeriesPoint {
  timestamp: string;
  team1Score: number;
  team2Score: number;
  team1WinProbability: number;
  gameProgress: number;
  projectedFinalA: number;
  projectedFinalB: number;
  spread: number;
}

/**
 * API response structure for matchup time series
 */
interface TimeSeriesResponse {
  series: TimeSeriesPoint[];
  metadata: {
    leagueId: string;
    week: number;
    matchupId: number;
    sampleCount: number;
    hasData: boolean;
  };
}

/**
 * Hook to fetch live win probability and score time-series data for a matchup
 *
 * Fetches data from the LiveWinProbSample database table via API endpoint.
 * Data is collected by cron jobs every 10 minutes during games.
 *
 * @param leagueId - Sleeper league ID
 * @param week - NFL week number
 * @param matchupId - Matchup ID within the league (1-6)
 *
 * @returns React Query result with time series data, loading state, and error handling
 *
 * @example
 * ```tsx
 * const { data, isLoading, error } = useMatchupTimeSeries(
 *   '1263744209295245312',
 *   6,
 *   1
 * );
 *
 * if (data?.series.length) {
 *   return <WinProbChart series={data.series} />;
 * }
 * ```
 */
export const useMatchupTimeSeries = (
  leagueId: string,
  week: number,
  matchupId: number,
) => {
  return useQuery<TimeSeriesResponse>({
    queryKey: ['matchup-timeseries', leagueId, week, matchupId],
    queryFn: async () => {
      const res = await fetch(`/api/matchup-timeseries/${leagueId}/${week}/${matchupId}`);

      if (!res.ok) {
        throw new Error(`Failed to fetch time series: ${res.statusText}`);
      }

      return res.json();
    },
    // Refetch every 5 minutes during games
    staleTime: 5 * 60 * 1000,
    // Keep data for 30 minutes when not in use
    gcTime: 30 * 60 * 1000,
    // Retry once on failure
    retry: 1,
  });
};

