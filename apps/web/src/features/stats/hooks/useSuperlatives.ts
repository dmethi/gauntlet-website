/**
 * Stats Hub Hooks - Season Superlatives
 *
 * Hook for fetching season superlatives (records, best performances)
 */

import { useQuery } from '@tanstack/react-query';
import type { SuperlativesResponse } from '@/shared/types/api';

/**
 * Options for useSuperlatives hook
 */
export interface SuperlativesOptions {
  category?: string;
  limit?: number;
  offset?: number;
  enabled?: boolean;
}

/**
 * Fetch season superlatives (records, best performances)
 *
 * Retrieves notable achievements and records for the season, such as
 * highest scoring weeks, longest streaks, best performances, etc.
 * Supports pagination and filtering by category.
 *
 * @param leagueId - League ID
 * @param season - Season year
 * @param options - Query options (category, limit, offset, enabled)
 * @returns Superlatives with loading/error states
 *
 * @example
 * ```typescript
 * const { data, isLoading } = useSuperlatives('12345', '2025', {
 *   category: 'highest_score',
 *   limit: 10
 * });
 *
 * if (!data?.ok) return <ErrorMessage />;
 *
 * return <SuperlativesList superlatives={data.data} />;
 * ```
 */
export const useSuperlatives = <T = unknown>(
  leagueId: string,
  season: string,
  options?: SuperlativesOptions,
) => {
  const { category, limit, offset, enabled = true } = options || {};

  return useQuery<SuperlativesResponse<T>>({
    queryKey: ['superlatives', leagueId, season, category, limit, offset],
    queryFn: async (): Promise<SuperlativesResponse<T>> => {
      const params = new URLSearchParams();
      if (category) params.set('category', category);
      if (limit) params.set('limit', String(limit));
      if (offset) params.set('offset', String(offset));

      const queryString = params.toString();
      const url = `/api/rollups/${leagueId}/${season}/superlatives${queryString ? `?${queryString}` : ''}`;

      const res = await fetch(url);
      if (!res.ok) throw new Error('Failed to fetch superlatives');
      return res.json();
    },
    enabled: enabled && !!leagueId && !!season,
    staleTime: 15 * 60 * 1000, // 15 minutes (superlatives change less frequently)
    gcTime: 60 * 60 * 1000, // 1 hour
  });
};
