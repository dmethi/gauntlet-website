/**
 * Waiver Analytics Data Hook
 *
 * React Query hook for fetching and processing comprehensive waiver analysis data.
 * Handles both AFC and NFC leagues with multi-league safe processing.
 */

import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import type { SleeperTransaction } from '@gauntlet/types';
import { CURRENT_LEAGUES } from '@/config/leagues';
import type { WaiverAnalysisData } from '../types';
import { type PlayerDataLoader, processWaiverData } from '../utils/process-waiver-data';
import type { TeamInfo } from '../utils/transformations';

/**
 * Hook options for customizing query behavior
 */
export interface UseWaiverAnalyticsOptions {
  enabled?: boolean;
  staleTime?: number;
  gcTime?: number;
}

/**
 * Hook result with typed data and states
 */
export interface UseWaiverAnalyticsResult {
  data: WaiverAnalysisData | undefined;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => void;
}

/**
 * Fetch transactions for a single league and week
 */
const fetchWeekTransactions = async (
  leagueId: string,
  week: number,
): Promise<SleeperTransaction[]> => {
  const response = await fetch(
    `https://api.sleeper.app/v1/league/${leagueId}/transactions/${week}`,
  );

  if (!response.ok) {
    console.warn(`Failed to fetch week ${week} for league ${leagueId}`);
    return [];
  }

  return response.json();
};

/**
 * Fetch all transactions for a league up to current week
 */
const fetchAllLeagueTransactions = async (
  leagueId: string,
  currentWeek: number,
): Promise<Map<number, SleeperTransaction[]>> => {
  const weeklyTxns = new Map<number, SleeperTransaction[]>();

  // Fetch weeks in parallel (in batches to avoid rate limiting)
  const batchSize = 4;
  const weeks = Array.from({ length: currentWeek }, (_, i) => i + 1);

  for (let i = 0; i < weeks.length; i += batchSize) {
    const batch = weeks.slice(i, i + batchSize);

    const results = await Promise.all(batch.map(week => fetchWeekTransactions(leagueId, week)));

    batch.forEach((week, idx) => {
      weeklyTxns.set(week, results[idx]);
    });

    // Small delay between batches
    if (i + batchSize < weeks.length) {
      await new Promise(resolve => setTimeout(resolve, 200));
    }
  }

  return weeklyTxns;
};

/**
 * Fetch team information for both leagues
 */
const fetchTeamInfo = async (): Promise<Map<string, TeamInfo>> => {
  const response = await fetch('/api/league/teams');

  if (!response.ok) {
    throw new Error('Failed to fetch team information');
  }

  const { teams } = await response.json();
  const teamsMap = new Map<string, TeamInfo>();

  teams.forEach((team: any) => {
    const key = `${team.leagueId}-${team.id}`;
    teamsMap.set(key, {
      rosterId: team.id,
      teamName: team.name,
      managerName: team.owner,
      leagueId: team.leagueId,
      leagueName: team.leagueName,
    });
  });

  return teamsMap;
};

/**
 * Create player data loader using local player data
 */
const createPlayerLoader = (): PlayerDataLoader => {
  // Dynamically import player data
  let playerData: any = null;

  return (playerId: string) => {
    if (!playerData) {
      // Lazy load player data
      try {
        const { getPlayerById } = require('@/data/players-loader');
        playerData = { getPlayerById };
      } catch (error) {
        console.error('Failed to load player data:', error);
        return null;
      }
    }

    const player = playerData.getPlayerById(playerId);

    if (!player) {
      return null;
    }

    return {
      playerId,
      playerName: player.full_name || `Player ${playerId}`,
      position: player.position || 'UNKNOWN',
    };
  };
};

/**
 * Main waiver analytics hook
 *
 * Fetches and processes waiver data from both leagues with multi-league safe logic.
 * Includes competing bids analysis, cross-league comparisons, and player movement tracking.
 *
 * @param currentWeek - Current NFL week to analyze through
 * @param options - React Query options
 * @returns Waiver analysis data with loading/error states
 *
 * @example
 * ```tsx
 * const { data, isLoading, isError } = useWaiverAnalytics(dataset.currentWeek);
 *
 * if (isLoading) return <LoadingSkeleton />;
 * if (isError) return <ErrorMessage />;
 * if (!data) return null;
 *
 * return <WaiverAnalysisHub data={data} />;
 * ```
 */
export const useWaiverAnalytics = (
  currentWeek: number,
  options: UseWaiverAnalyticsOptions = {},
): UseWaiverAnalyticsResult => {
  const {
    enabled = true,
    staleTime = 5 * 60 * 1000, // 5 minutes (transactions update frequently)
    gcTime = 30 * 60 * 1000, // 30 minutes
  } = options;

  const [afcLeague] = CURRENT_LEAGUES.filter(l => l.conference === 'AFC');
  const [nfcLeague] = CURRENT_LEAGUES.filter(l => l.conference === 'NFC');

  const queryResult = useQuery<WaiverAnalysisData, Error>({
    queryKey: ['waiver-analytics', currentWeek],
    queryFn: async (): Promise<WaiverAnalysisData> => {
      if (!afcLeague || !nfcLeague) {
        throw new Error('League configuration not found');
      }

      // Fetch team info
      const teamsMap = await fetchTeamInfo();

      // CRITICAL: Fetch each league separately (multi-league safe)
      const [afcTransactions, nfcTransactions] = await Promise.all([
        fetchAllLeagueTransactions(afcLeague.id, currentWeek),
        fetchAllLeagueTransactions(nfcLeague.id, currentWeek),
      ]);

      // Create player loader
      const playerLoader = createPlayerLoader();

      // Process data (handles multi-league logic internally)
      const analysisData = await processWaiverData(
        afcLeague.id,
        nfcLeague.id,
        afcTransactions,
        nfcTransactions,
        teamsMap,
        playerLoader,
        currentWeek,
      );

      return analysisData;
    },
    enabled: enabled && currentWeek > 0,
    staleTime,
    gcTime,
    refetchOnWindowFocus: false, // Prevent unnecessary refetches
    retry: 2, // Retry failed requests twice
  });

  return {
    data: queryResult.data,
    isLoading: queryResult.isLoading,
    isError: queryResult.isError,
    error: queryResult.error,
    refetch: queryResult.refetch,
  } as UseWaiverAnalyticsResult;
};
