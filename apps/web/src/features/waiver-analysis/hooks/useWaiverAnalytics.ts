/**
 * Waiver Analytics Data Hook
 *
 * React Query hook for fetching and processing comprehensive waiver analysis data.
 * Handles both AFC and NFC leagues with multi-league safe processing.
 */

import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import type { PlayerIndex, SleeperTransaction } from '@gauntlet/types';
import { getLeaguesForSeason } from '@/config/leagues';
import { createBrowserStatsClient } from '@/lib/sleeper/browser-client';
import type { WaiverAnalysisData } from '../types';
import { type PlayerDataLoader, processWaiverData } from '../utils/process-waiver-data';
import type { PlayerInfo, TeamInfo } from '../utils/transformations';

const sleeperClient = createBrowserStatsClient();

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
  try {
    return await sleeperClient.fetchTransactions(leagueId, week);
  } catch (error) {
    console.warn(`Failed to fetch week ${week} for league ${leagueId}`, error);
    return [];
  }
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
  // Matches the hardcoded 2025 leagues this hook fetches transactions from below.
  const response = await fetch('/api/league/teams?season=2025');

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

const isPlainObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const isCompletePlayerIndex = (
  value: unknown,
  requestedIds: readonly string[],
): value is PlayerIndex =>
  isPlainObject(value) &&
  Object.values(value).every(isPlainObject) &&
  requestedIds.every(playerId => isPlainObject(value[playerId]));

/** Fetch only players that occur in these transactions, keeping the full static dataset server-side. */
export const fetchPlayerLoader = async (
  playerIds: ReadonlySet<string>,
): Promise<PlayerDataLoader> => {
  if (playerIds.size === 0) return () => null;

  const requestedIds = Array.from(playerIds);
  const response = await fetch('/api/players/batch', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ playerIds: requestedIds }),
  });
  if (!response.ok) {
    throw new Error(`Player batch lookup failed with HTTP ${response.status}`);
  }

  const payload: unknown = await response.json();
  if (!isPlainObject(payload)) {
    throw new Error('Player batch lookup returned a malformed `players` field');
  }
  const playerIndex = payload.players;
  if (!isCompletePlayerIndex(playerIndex, requestedIds)) {
    throw new Error('Player batch lookup returned incomplete or malformed player data');
  }

  const players = new Map<string, PlayerInfo>();
  requestedIds.forEach(playerId => {
    const player = playerIndex[playerId];
    if (!player) return;
    players.set(playerId, {
      playerId,
      playerName: player.full_name || `Player ${playerId}`,
      position: player.position || 'UNKNOWN',
    });
  });

  return playerId => players.get(playerId) ?? null;
};

const getAddedPlayerIds = (
  ...leagueTransactions: ReadonlyArray<Map<number, SleeperTransaction[]>>
): Set<string> => {
  const playerIds = new Set<string>();
  leagueTransactions.forEach(weeklyTransactions => {
    weeklyTransactions.forEach(transactions => {
      transactions.forEach(transaction => {
        Object.keys(transaction.adds ?? {}).forEach(playerId => playerIds.add(playerId));
      });
    });
  });
  return playerIds;
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

  // Only reachable via the 2025 archive stats page today — pin explicitly
  // rather than reading whatever CURRENT_LEAGUES becomes.
  const archiveLeagues = getLeaguesForSeason('2025');
  const [afcLeague] = archiveLeagues.filter(l => l.conference === 'AFC');
  const [nfcLeague] = archiveLeagues.filter(l => l.conference === 'NFC');

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

      const playerLoader = await fetchPlayerLoader(
        getAddedPlayerIds(afcTransactions, nfcTransactions),
      );

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
