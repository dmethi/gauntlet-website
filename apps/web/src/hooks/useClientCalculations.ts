/**
 * React hooks for client-side calculations using Sleeper API data
 */

import { useQuery } from '@tanstack/react-query';
import {
  calculateTeamStats,
  calculatePositionalScoring,
  calculationCache,
  TeamSeasonStats,
  PositionalScoring,
} from '@/lib/client-calculations';
import { CACHE_DURATIONS, LEAGUE_IDS, CURRENT_SEASON } from '@/lib/constants';
import type {
  SleeperLeague,
  SleeperRoster,
  SleeperUser,
  SleeperMatchup,
  SleeperPlayer,
} from '@gauntlet/types';

/**
 * Fetch data directly from Sleeper API
 */
async function fetchSleeperData<T>(endpoint: string): Promise<T> {
  const response = await fetch(`https://api.sleeper.app/v1/${endpoint}`);
  if (!response.ok) {
    throw new Error(`Sleeper API error: ${response.status}`);
  }
  return response.json();
}

/**
 * Get all matchups for a season
 */
async function getAllMatchups(
  leagueId: string,
  weeks: number
): Promise<Map<number, SleeperMatchup[]>> {
  const matchupsByWeek = new Map<number, SleeperMatchup[]>();

  // Fetch all weeks in parallel
  const promises = Array.from({ length: weeks }, (_, i) => i + 1).map(
    week =>
      fetchSleeperData<SleeperMatchup[]>(`league/${leagueId}/matchups/${week}`)
        .then(matchups => ({ week, matchups }))
        .catch(() => ({ week, matchups: [] })) // Handle weeks that haven't happened yet
  );

  const results = await Promise.all(promises);

  results.forEach(({ week, matchups }) => {
    if (matchups.length > 0) {
      matchupsByWeek.set(week, matchups);
    }
  });

  return matchupsByWeek;
}

/**
 * Hook to get team stats with expected wins and luck calculated client-side
 */
export function useClientTeamStats(leagueId?: string) {
  const effectiveLeagueId = leagueId || LEAGUE_IDS.AFC;

  return useQuery({
    queryKey: ['client-team-stats', effectiveLeagueId],
    queryFn: async (): Promise<TeamSeasonStats[]> => {
      // Check cache first
      const cacheKey = `team-stats-${effectiveLeagueId}`;
      const cached = calculationCache.get(cacheKey);
      if (cached) return cached;

      // Fetch all necessary data from Sleeper
      const [league, rosters, users] = await Promise.all([
        fetchSleeperData<SleeperLeague>(`league/${effectiveLeagueId}`),
        fetchSleeperData<SleeperRoster[]>(`league/${effectiveLeagueId}/rosters`),
        fetchSleeperData<SleeperUser[]>(`league/${effectiveLeagueId}/users`),
      ]);

      // Get current week from NFL state
      const nflState = await fetchSleeperData<{ week: number }>('state/nfl');
      // Only count completed weeks - current week minus 1 (since current week is in progress)
      const completedWeeks = Math.min(Math.max(nflState.week - 1, 1), 14);

      // Get all matchups for completed weeks only
      const matchupsByWeek = await getAllMatchups(effectiveLeagueId, completedWeeks);

      // Calculate team stats
      const teamStats = calculateTeamStats(rosters, matchupsByWeek, users);

      // Cache the results
      calculationCache.set(cacheKey, teamStats);

      return teamStats;
    },
    staleTime: CACHE_DURATIONS.ONE_HOUR,
    gcTime: CACHE_DURATIONS.ONE_WEEK,
  });
}

/**
 * Hook to get positional scoring for a specific team
 */
export function useClientPositionalScoring(
  leagueId: string | undefined,
  rosterId: number | undefined
) {
  return useQuery({
    queryKey: ['client-positional-scoring', leagueId, rosterId],
    queryFn: async (): Promise<PositionalScoring[]> => {
      if (!leagueId || !rosterId) throw new Error('Missing required parameters');

      // Check cache
      const cacheKey = `positional-${leagueId}-${rosterId}`;
      const cached = calculationCache.get(cacheKey);
      if (cached) return cached;

      // Get current week
      const nflState = await fetchSleeperData<{ week: number }>('state/nfl');
      const currentWeek = Math.min(nflState.week, 14);

      // Get matchups and players
      const [matchupsByWeek, players] = await Promise.all([
        getAllMatchups(leagueId, currentWeek),
        fetchSleeperData<Record<string, SleeperPlayer>>('players/nfl'),
      ]);

      // Convert players to Map
      const playerMap = new Map(Object.entries(players));

      // Calculate positional scoring
      const positionalScoring = calculatePositionalScoring(matchupsByWeek, playerMap, rosterId);

      // Cache results
      calculationCache.set(cacheKey, positionalScoring);

      return positionalScoring;
    },
    enabled: !!leagueId && !!rosterId,
    staleTime: CACHE_DURATIONS.ONE_HOUR,
    gcTime: CACHE_DURATIONS.ONE_WEEK,
  });
}

/**
 * Hook to get league-wide weekly averages
 */
export function useClientWeeklyAverages(leagueId?: string) {
  const effectiveLeagueId = leagueId || LEAGUE_IDS.AFC;

  return useQuery({
    queryKey: ['client-weekly-averages', effectiveLeagueId],
    queryFn: async () => {
      // Check cache
      const cacheKey = `weekly-avg-${effectiveLeagueId}`;
      const cached = calculationCache.get(cacheKey);
      if (cached) return cached;

      // Get current week
      const nflState = await fetchSleeperData<{ week: number }>('state/nfl');
      const currentWeek = Math.min(nflState.week, 14);

      // Get all matchups
      const matchupsByWeek = await getAllMatchups(effectiveLeagueId, currentWeek);

      // Calculate weekly averages
      const weeklyAverages = Array.from(matchupsByWeek.entries()).map(([week, matchups]) => {
        const scores = matchups.map(m => m.points || 0);
        const total = scores.reduce((sum, score) => sum + score, 0);
        const average = scores.length > 0 ? total / scores.length : 0;

        return {
          week,
          averagePoints: average,
          highScore: Math.max(...scores),
          lowScore: Math.min(...scores),
          totalGames: Math.floor(scores.length / 2),
        };
      });

      // Cache results
      calculationCache.set(cacheKey, weeklyAverages);

      return weeklyAverages;
    },
    staleTime: CACHE_DURATIONS.ONE_HOUR,
    gcTime: CACHE_DURATIONS.ONE_WEEK,
  });
}
