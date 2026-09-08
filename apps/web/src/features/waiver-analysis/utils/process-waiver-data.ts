/**
 * Main Waiver Data Processing Orchestrator
 *
 * Coordinates all transformation, aggregation, and analysis steps to produce
 * the complete WaiverAnalysisData from raw Sleeper transactions.
 */

import type { SleeperTransaction } from '@gauntlet/types';
import type { WaiverAnalysisData, WaiverTransaction } from '../types';
import {
  enrichWithCompetingBids,
  groupByManager,
  type PlayerInfo,
  type TeamInfo,
  transformSleeperTransaction,
} from './transformations';
import { buildLeagueWaiverTrends, buildManagerWaiverStats } from './aggregations';
import {
  buildCrossLeaguePlayerComparisons,
  buildPositionalSpendComparison,
  buildWeeklySpendComparison,
} from './cross-league';
import { findTopMovers, findTopMoversByLeague } from './player-movement';

/**
 * Player data loader function type
 */
export type PlayerDataLoader = (playerId: string) => PlayerInfo | null;

export interface WaiverLeagueTransactions {
  leagueId: string;
  leagueName: string;
  weeklyTransactions: Map<number, SleeperTransaction[]>;
}

/**
 * Process raw Sleeper transactions into complete waiver analysis
 *
 * Multi-league safe: Process each league separately, then combine
 */
export const processWaiverData = async (
  leagues: WaiverLeagueTransactions[],
  teamsMap: Map<string, TeamInfo>, // `${leagueId}-${rosterId}` -> team info
  playerLoader: PlayerDataLoader,
  currentWeek: number,
): Promise<WaiverAnalysisData> => {
  if (leagues.length < 2) throw new Error('Waiver analysis requires at least two leagues');

  // Roster IDs are only unique inside a league, so enrichment and competing
  // bid analysis must stay isolated until every league has been processed.
  const processedLeagues = leagues.map(league => {
    const enriched = enrichWithCompetingBids(
      processLeagueTransactions(
        league.leagueId,
        league.leagueName,
        league.weeklyTransactions,
        teamsMap,
        playerLoader,
      ),
    );
    const managers = buildManagerStatsForLeague(league.leagueId, enriched, teamsMap);
    const trends = buildLeagueWaiverTrends(league.leagueId, league.leagueName, enriched, managers);
    return { ...league, enriched, trends };
  });

  const [firstLeague, secondLeague] = processedLeagues;
  const leagueTrends = processedLeagues.map(league => league.trends);

  // Preserve the original two-league comparison views for the 2025 archive.
  // Three-league seasons use the generic league summaries and complete table.
  const playerComparisons = buildCrossLeaguePlayerComparisons(
    firstLeague.enriched,
    secondLeague.enriched,
  );

  const positionComparisons = buildPositionalSpendComparison(
    firstLeague.enriched,
    secondLeague.enriched,
  );

  const weeksAnalyzed = Array.from({ length: currentWeek }, (_, i) => i + 1);
  const weeklyComparisons = buildWeeklySpendComparison(
    firstLeague.enriched,
    secondLeague.enriched,
    weeksAnalyzed,
  );

  // Player movement analysis
  const allTransactions = processedLeagues.flatMap(league => league.enriched);
  const topMovers = findTopMovers(allTransactions, 50);
  const topMoversByLeague = Object.fromEntries(
    processedLeagues.map(league => [
      league.leagueId,
      findTopMoversByLeague(league.leagueId, allTransactions, 20),
    ]),
  );

  return {
    leagueTrends,
    afcTrends: firstLeague.trends,
    nfcTrends: secondLeague.trends,
    playerComparisons,
    positionComparisons,
    weeklyComparisons,
    topMovers,
    topMoversByLeague,
    allTransactions,
    currentWeek,
    weeksAnalyzed,
    lastUpdated: new Date(),
  };
};

/**
 * Process transactions for a single league
 */
const processLeagueTransactions = (
  leagueId: string,
  leagueName: string,
  weeklyTransactions: Map<number, SleeperTransaction[]>,
  teamsMap: Map<string, TeamInfo>,
  playerLoader: PlayerDataLoader,
): WaiverTransaction[] => {
  const enriched: WaiverTransaction[] = [];

  weeklyTransactions.forEach((transactions, week) => {
    transactions.forEach(txn => {
      // Only process waiver and free agent transactions
      if (txn.type !== 'waiver' && txn.type !== 'free_agent') {
        return;
      }

      // Extract player IDs from adds
      const playerIds = Object.keys(txn.adds || {});

      playerIds.forEach(playerId => {
        const rosterId = txn.adds![playerId];
        const teamKey = `${leagueId}-${rosterId}`;
        const teamInfo = teamsMap.get(teamKey);

        if (!teamInfo) {
          console.warn(`Team not found: ${teamKey}`);
          return;
        }

        const playerInfo = playerLoader(playerId);
        if (!playerInfo) {
          console.warn(`Player not found: ${playerId}`);
          return;
        }

        const enrichedTxn = transformSleeperTransaction(txn, week, teamInfo, playerInfo);

        enriched.push(enrichedTxn);
      });
    });
  });

  return enriched;
};

/**
 * Build manager stats for all managers in a league
 */
const buildManagerStatsForLeague = (
  leagueId: string,
  transactions: WaiverTransaction[],
  teamsMap: Map<string, TeamInfo>,
): ReturnType<typeof buildManagerWaiverStats>[] => {
  const managerMap = groupByManager(transactions);
  const stats: ReturnType<typeof buildManagerWaiverStats>[] = [];

  managerMap.forEach((txns, rosterId) => {
    const teamKey = `${leagueId}-${rosterId}`;
    const teamInfo = teamsMap.get(teamKey);

    if (!teamInfo) {
      console.warn(`Team info not found for roster ${rosterId}`);
      return;
    }

    const managerStats = buildManagerWaiverStats(
      rosterId,
      teamInfo.teamName,
      teamInfo.managerName,
      leagueId,
      teamInfo.leagueName,
      transactions,
    );

    stats.push(managerStats);
  });

  return stats;
};
