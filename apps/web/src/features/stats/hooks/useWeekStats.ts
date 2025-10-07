/**
 * Stats Hub Hooks - Weekly Statistics
 *
 * Hook for fetching weekly rollup statistics for a league
 */

import { useQuery } from '@tanstack/react-query';
import { getCurrentWeek } from '@gauntlet/lib';
import type { WeekRollupsResponse } from '@/shared/types/api';

/**
 * Options for useWeekStats hook
 */
export interface WeekStatsOptions {
  week?: number;
  enabled?: boolean;
}

/**
 * Fetch weekly rollup statistics for a league
 *
 * Retrieves week-specific statistics and rollups. If no week is provided,
 * defaults to the current NFL week. Data includes weekly performance metrics,
 * rankings, and comparative statistics across all teams.
 *
 * @param leagueId - League ID
 * @param season - Season year
 * @param options - Query options (week, enabled)
 * @returns Weekly rollups with loading/error states
 *
 * @example
 * ```typescript
 * const { data, isLoading } = useWeekStats('12345', '2025', { week: 5 });
 *
 * if (!data?.ok) return <ErrorMessage />;
 *
 * return <WeeklyStats rollups={data.data} />;
 * ```
 */
export const useWeekStats = <T = unknown>(
  leagueId: string,
  season: string,
  options?: WeekStatsOptions,
) => {
  const { week, enabled = true } = options || {};
  const targetWeek = week ?? getCurrentWeek();

  return useQuery<WeekRollupsResponse<T>>({
    queryKey: ['rollups', leagueId, season, targetWeek],
    queryFn: async (): Promise<WeekRollupsResponse<T>> => {
      const res = await fetch(`/api/rollups/${leagueId}/${season}/weeks/${targetWeek}`);
      if (!res.ok) throw new Error('Failed to fetch week rollups');
      return res.json();
    },
    enabled: enabled && !!leagueId && !!season,
    staleTime: 2 * 60 * 1000, // 2 minutes (more frequent for weekly data)
    gcTime: 15 * 60 * 1000, // 15 minutes
  });
};
