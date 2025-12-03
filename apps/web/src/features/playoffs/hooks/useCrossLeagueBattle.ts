/**
 * useCrossLeagueBattle Hook
 *
 * React Query hook for fetching and caching cross-league battle simulation results.
 * Simulates Week 14 head-to-head matchups between AFC and NFC teams by seed.
 */

import { useQuery } from '@tanstack/react-query';
import { runCrossLeagueBattle } from '../simulations';
import type { CrossLeagueBattleResults, CrossLeagueSimulationConfig } from '../types';
import { CACHE_DURATIONS } from '@/lib/constants';

/**
 * Query key for cross-league battle data
 */
const CROSS_LEAGUE_QUERY_KEY = 'cross-league-battle';

/**
 * Default configuration for cross-league battle simulation
 */
const DEFAULT_CONFIG: CrossLeagueSimulationConfig = {
  iterations: 10000,
  useProjections: true,
};

/**
 * Hook to fetch and cache cross-league battle simulation results
 */
export const useCrossLeagueBattle = (
  throughWeek: number = 13,
  config: CrossLeagueSimulationConfig = DEFAULT_CONFIG
) => {
  return useQuery({
    queryKey: [CROSS_LEAGUE_QUERY_KEY, throughWeek, config.iterations],
    queryFn: async (): Promise<CrossLeagueBattleResults> => {
      return runCrossLeagueBattle(throughWeek, config);
    },
    staleTime: CACHE_DURATIONS.FOUR_HOURS, // Results change based on projections
    gcTime: CACHE_DURATIONS.ONE_DAY,
    refetchOnWindowFocus: false, // Don't refetch on focus (expensive simulation)
    retry: 2,
  });
};

/**
 * Format win probability for display
 */
export const formatWinProbability = (probability: number): string => {
  if (probability === 0) return '0%';
  if (probability === 1) return '100%';
  if (probability < 0.01) return '<1%';
  if (probability > 0.99) return '>99%';
  return `${Math.round(probability * 100)}%`;
};

/**
 * Get color for AFC probability bar
 */
export const getAfcColor = (): string => 'bg-red-500';

/**
 * Get color for NFC probability bar
 */
export const getNfcColor = (): string => 'bg-blue-500';

/**
 * Format expected matchup wins
 */
export const formatExpectedWins = (wins: number): string => {
  return wins.toFixed(1);
};

/**
 * Determine which league is favored in a matchup
 */
export const getMatchupFavorite = (
  afcWinProb: number
): 'afc' | 'nfc' | 'even' => {
  if (afcWinProb > 0.55) return 'afc';
  if (afcWinProb < 0.45) return 'nfc';
  return 'even';
};

/**
 * Get matchup indicator color based on favorite
 */
export const getMatchupIndicatorColor = (
  favorite: 'afc' | 'nfc' | 'even'
): string => {
  switch (favorite) {
    case 'afc':
      return 'text-red-500';
    case 'nfc':
      return 'text-blue-500';
    default:
      return 'text-muted-foreground';
  }
};

