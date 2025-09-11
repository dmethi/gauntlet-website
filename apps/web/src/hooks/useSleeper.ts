/**
 * Custom React Query hooks for Sleeper API data fetching
 */

import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { useEffect } from 'react';

// Query strategies for different data types
export const queryStrategies = {
  // Network-first (for critical/real-time data)
  networkFirst: {
    staleTime: 0,
    gcTime: 5 * 60 * 1000,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  },

  // Cache-first (for static data like players)
  cacheFirst: {
    staleTime: 24 * 60 * 60 * 1000, // 24 hours
    gcTime: 7 * 24 * 60 * 60 * 1000, // 7 days
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  },

  // Stale-while-revalidate (for semi-dynamic like rosters)
  staleWhileRevalidate: {
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
    refetchOnMount: 'always' as const,
    refetchOnWindowFocus: false,
  },

  // Real-time (for live game data)
  realTime: {
    staleTime: 0,
    gcTime: 0,
    refetchInterval: 10 * 1000, // 10 seconds
    refetchIntervalInBackground: true,
  },
};

/**
 * Fetch wrapper for API calls
 */
async function fetchAPI<T>(endpoint: string): Promise<T> {
  const response = await fetch(endpoint);
  if (!response.ok) {
    throw new Error(`API error: ${response.status} ${response.statusText}`);
  }
  return response.json();
}

/**
 * Hook for league overview data
 */
export function useLeagueOverview(leagueId?: string) {
  const endpoint = leagueId ? `/api/league/overview?leagueId=${leagueId}` : '/api/league/overview';

  return useQuery({
    queryKey: ['league-overview', leagueId],
    queryFn: () => fetchAPI(endpoint),
    ...queryStrategies.staleWhileRevalidate,
  });
}

/**
 * Hook for matchups data with intelligent caching
 */
export function useMatchups(leagueId: string, week: number, options?: { isLive?: boolean }) {
  const { isLive = false } = options || {};

  return useQuery({
    queryKey: ['matchups', leagueId, week],
    queryFn: () => fetchAPI(`/api/matchups/${leagueId}/${week}`),
    ...(isLive
      ? {
          staleTime: 10 * 1000, // 10 seconds if live
          refetchInterval: 30 * 1000, // Auto-refresh every 30s
        }
      : {
          staleTime: 60 * 1000, // 1 minute if not live
        }),
  });
}

/**
 * Hook for NFL state
 */
export function useNFLState() {
  return useQuery({
    queryKey: ['nfl-state'],
    queryFn: () => fetchAPI('/api/nfl-state'),
    staleTime: 60 * 1000, // 1 minute
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook for team/roster data
 */
export function useTeam(teamId: string) {
  return useQuery({
    queryKey: ['team', teamId],
    queryFn: () => fetchAPI(`/api/team/${teamId}`),
    ...queryStrategies.staleWhileRevalidate,
  });
}

/**
 * Hook for odds data (no caching, always fresh)
 */
export function useOdds(leagueId: string, week: number, matchupId: number) {
  return useQuery({
    queryKey: ['odds', leagueId, week, matchupId],
    queryFn: () => fetchAPI(`/api/matchups/${leagueId}/${week}/${matchupId}/simulate`),
    staleTime: 0, // Always fresh
    gcTime: 0, // No garbage collection
    refetchInterval: false, // Use SSE/WebSocket instead
  });
}

/**
 * Hook for players data (heavily cached)
 */
export function usePlayers() {
  return useQuery({
    queryKey: ['players'],
    queryFn: () => fetchAPI('/api/players'),
    ...queryStrategies.cacheFirst,
  });
}

/**
 * Hook for transactions
 */
export function useTransactions(leagueId: string) {
  return useQuery({
    queryKey: ['transactions', leagueId],
    queryFn: () => fetchAPI(`/api/league/${leagueId}/transactions`),
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchInterval: 5 * 60 * 1000, // Refresh every 5 minutes
  });
}

/**
 * Hook for draft data
 */
export function useDraft(leagueId: string) {
  return useQuery({
    queryKey: ['draft', leagueId],
    queryFn: () => fetchAPI(`/api/league/draft?leagueId=${leagueId}`),
    ...queryStrategies.cacheFirst, // Draft data doesn't change
  });
}

/**
 * Hook with prefetching for adjacent weeks
 */
export function useMatchupsWithPrefetch(leagueId: string, week: number) {
  const queryClient = useQueryClient();

  // Main query
  const matchupsQuery = useMatchups(leagueId, week);

  // Prefetch adjacent weeks
  useEffect(() => {
    const prefetchWeek = (targetWeek: number) => {
      if (targetWeek >= 1 && targetWeek <= 18) {
        queryClient.prefetchQuery({
          queryKey: ['matchups', leagueId, targetWeek],
          queryFn: () => fetchAPI(`/api/matchups/${leagueId}/${targetWeek}`),
          staleTime: 5 * 60 * 1000, // 5 minutes
        });
      }
    };

    // Prefetch previous and next week
    prefetchWeek(week - 1);
    prefetchWeek(week + 1);
  }, [leagueId, week, queryClient]);

  return matchupsQuery;
}

/**
 * Hook for prefetching on hover
 */
export function usePrefetch() {
  const queryClient = useQueryClient();

  const prefetchMatchup = (leagueId: string, week: number, matchupId: number) => {
    queryClient.prefetchQuery({
      queryKey: ['matchup-detail', leagueId, week, matchupId],
      queryFn: () => fetchAPI(`/api/matchups/${leagueId}/${week}/${matchupId}`),
      staleTime: 60 * 1000,
    });
  };

  const prefetchTeam = (teamId: string) => {
    queryClient.prefetchQuery({
      queryKey: ['team', teamId],
      queryFn: () => fetchAPI(`/api/team/${teamId}`),
      staleTime: 5 * 60 * 1000,
    });
  };

  return {
    prefetchMatchup,
    prefetchTeam,
  };
}

/**
 * Hook for optimistic updates (e.g., roster changes)
 */
export function useOptimisticUpdate() {
  const queryClient = useQueryClient();

  const updateRoster = useMutation({
    mutationFn: async (update: any) => {
      const response = await fetch('/api/roster/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(update),
      });
      if (!response.ok) throw new Error('Update failed');
      return response.json();
    },

    // Optimistic update
    onMutate: async update => {
      await queryClient.cancelQueries({ queryKey: ['rosters'] });

      const previousData = queryClient.getQueryData(['rosters']);

      queryClient.setQueryData(['rosters'], (old: any) => {
        // Apply optimistic update
        return { ...old, ...update };
      });

      return { previousData };
    },

    // Rollback on error
    onError: (err, update, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(['rosters'], context.previousData);
      }
    },

    // Refetch after success
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['rosters'] });
    },
  });

  return { updateRoster };
}

/**
 * Hook for cache statistics (development only)
 */
export function useCacheStats() {
  const queryClient = useQueryClient();

  if (process.env.NODE_ENV === 'production') {
    return null;
  }

  const cache = queryClient.getQueryCache();
  const queries = cache.getAll();

  return {
    totalQueries: queries.length,
    staleQueries: queries.filter(q => q.isStale()).length,
    fetchingQueries: queries.filter(q => q.state.fetchStatus === 'fetching').length,
    errorQueries: queries.filter(q => q.state.status === 'error').length,
    cacheSize: JSON.stringify(cache).length,
  };
}
