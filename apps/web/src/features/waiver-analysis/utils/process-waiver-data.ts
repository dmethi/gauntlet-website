/**
 * Main Waiver Data Processing Orchestrator
 *
 * Coordinates all transformation, aggregation, and analysis steps to produce
 * the complete WaiverAnalysisData from raw Sleeper transactions.
 */

import type { SleeperTransaction } from '@gauntlet/types';
import type { WaiverAnalysisData, WaiverTransaction } from '../types';
import {
  transformSleeperTransaction,
  enrichWithCompetingBids,
  groupByManager,
  type TeamInfo,
  type PlayerInfo,
} from './transformations';
import { buildManagerWaiverStats, buildLeagueWaiverTrends } from './aggregations';
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

/**
 * Process raw Sleeper transactions into complete waiver analysis
 *
 * Multi-league safe: Process each league separately, then combine
 */
export const processWaiverData = async (
  afcLeagueId: string,
  nfcLeagueId: string,
  afcTransactions: Map<number, SleeperTransaction[]>, // week -> transactions
  nfcTransactions: Map<number, SleeperTransaction[]>,
  teamsMap: Map<string, TeamInfo>, // `${leagueId}-${rosterId}` -> team info
  playerLoader: PlayerDataLoader,
  currentWeek: number,
): Promise<WaiverAnalysisData> => {
  // CRITICAL: Process each league separately (roster IDs only unique within league)
  const afcEnriched = processLeagueTransactions(
    afcLeagueId,
    'Gauntlet AFC',
    afcTransactions,
    teamsMap,
    playerLoader,
  );

  const nfcEnriched = processLeagueTransactions(
    nfcLeagueId,
    'Gauntlet NFC',
    nfcTransactions,
    teamsMap,
    playerLoader,
  );

  // Enrich both with competing bids analysis
  const afcWithBids = enrichWithCompetingBids(afcEnriched);
  const nfcWithBids = enrichWithCompetingBids(nfcEnriched);

  // Build manager stats for each league
  const afcManagerStats = buildManagerStatsForLeague(afcLeagueId, afcWithBids, teamsMap);

  const nfcManagerStats = buildManagerStatsForLeague(nfcLeagueId, nfcWithBids, teamsMap);

  // Build league trends
  const afcTrends = buildLeagueWaiverTrends(
    afcLeagueId,
    'Gauntlet AFC',
    afcWithBids,
    afcManagerStats,
  );

  const nfcTrends = buildLeagueWaiverTrends(
    nfcLeagueId,
    'Gauntlet NFC',
    nfcWithBids,
    nfcManagerStats,
  );

  // Cross-league comparisons
  const playerComparisons = buildCrossLeaguePlayerComparisons(afcWithBids, nfcWithBids);

  const positionComparisons = buildPositionalSpendComparison(afcWithBids, nfcWithBids);

  const weeksAnalyzed = Array.from({ length: currentWeek }, (_, i) => i + 1);
  const weeklyComparisons = buildWeeklySpendComparison(afcWithBids, nfcWithBids, weeksAnalyzed);

  // Player movement analysis
  const allTransactions = [...afcWithBids, ...nfcWithBids];
  const topMovers = findTopMovers(allTransactions, 50);
  const afcTopMovers = findTopMoversByLeague(afcLeagueId, allTransactions, 20);
  const nfcTopMovers = findTopMoversByLeague(nfcLeagueId, allTransactions, 20);

  return {
    afcTrends,
    nfcTrends,
    playerComparisons,
    positionComparisons,
    weeklyComparisons,
    topMovers,
    topMoversByLeague: {
      afc: afcTopMovers,
      nfc: nfcTopMovers,
    },
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
