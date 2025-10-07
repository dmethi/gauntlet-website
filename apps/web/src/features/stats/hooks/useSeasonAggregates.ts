/**
 * Stats Hub Hooks - Season Aggregates
 *
 * Hook for fetching seasonal aggregate data for a league
 */

import { useQuery } from '@tanstack/react-query';
import type { SeasonalAggregatesResponse } from '@/shared/types/api';

/**
 * Options for useSeasonAggregates hook
 */
export interface SeasonAggregatesOptions {
  enabled?: boolean;
}

/**
 * Fetch seasonal aggregate data for a league
 *
 * Retrieves comprehensive seasonal statistics including roster week aggregates
 * and league-wide weekly summaries. Contains authoritative record data,
 * expected wins, luck ratings, and positional scoring breakdowns.
 *
 * @param leagueId - League ID
 * @param season - Season year
 * @param options - Query options (enabled)
 * @returns Seasonal aggregates with loading/error states
 *
 * @example
 * ```typescript
 * const { data, isLoading, isError } = useSeasonAggregates('12345', '2025');
 *
 * if (!data?.ok) return <ErrorMessage />;
 *
 * return <SeasonStats aggregates={data.data} />;
 * ```
 */
export const useSeasonAggregates = (
  leagueId?: string,
  season?: string,
  options?: SeasonAggregatesOptions,
) => {
  const { enabled = true } = options || {};

  return useQuery<SeasonalAggregatesResponse>({
    queryKey: ['seasonal', leagueId, season],
    queryFn: async (): Promise<SeasonalAggregatesResponse> => {
      const res = await fetch(`/api/rollups/${leagueId}/${season}`);
      if (!res.ok) throw new Error('Failed to fetch seasonal aggregates');
      return res.json();
    },
    enabled: enabled && !!leagueId && !!season,
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 60 * 60 * 1000, // 1 hour
  });
};
