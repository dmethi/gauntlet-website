/**
 * Waiver Analysis Aggregations
 *
 * Build manager-level and league-level waiver statistics from enriched transactions.
 */

import type { LeagueWaiverTrends, ManagerWaiverStats, WaiverTransaction } from '../types';
import {
  calculateRemainingFAAB,
  filterFailedWaivers,
  filterSuccessfulWaivers,
  groupByManager,
  groupByPosition,
  groupByWeek,
} from './transformations';

/**
 * Build manager-level waiver statistics
 */
export const buildManagerWaiverStats = (
  rosterId: number,
  teamName: string,
  managerName: string,
  leagueId: string,
  leagueName: string,
  allTransactions: WaiverTransaction[],
  startingBudget = 200,
): ManagerWaiverStats => {
  // Filter to this manager's transactions
  const managerTxns = allTransactions.filter(t => t.rosterId === rosterId);
  const successfulWaivers = filterSuccessfulWaivers(managerTxns);
  const failedWaivers = filterFailedWaivers(managerTxns);
  const freeAgents = managerTxns.filter(t => t.isWinningBid && t.transactionType === 'free_agent');

  // Budget tracking
  const totalFAABSpent = successfulWaivers.reduce((sum, t) => sum + t.faabBid, 0);
  const remainingFAAB = calculateRemainingFAAB(rosterId, allTransactions, startingBudget);
  const percentSpent = (totalFAABSpent / startingBudget) * 100;

  // Transaction counts
  const totalWaivers = successfulWaivers.length;
  const totalFreeAgents = freeAgents.length;
  const totalTransactions = totalWaivers + totalFreeAgents;
  const failedWaiversCount = failedWaivers.length;
  const waiverSuccessRate =
    totalWaivers + failedWaiversCount > 0 ? totalWaivers / (totalWaivers + failedWaiversCount) : 0;

  // Positional breakdown
  const spendByPosition: Record<string, number> = {};
  const countByPosition: Record<string, number> = {};

  successfulWaivers.forEach(txn => {
    spendByPosition[txn.position] = (spendByPosition[txn.position] || 0) + txn.faabBid;
    countByPosition[txn.position] = (countByPosition[txn.position] || 0) + 1;
  });

  // Efficiency metrics
  const avgFaabPerWaiver = totalWaivers > 0 ? totalFAABSpent / totalWaivers : 0;
  const allBids = successfulWaivers.map(t => t.faabBid);
  const biggestBid = allBids.length > 0 ? Math.max(...allBids) : 0;
  const smallestBid = allBids.length > 0 ? Math.min(...allBids.filter(b => b > 0)) : 0;

  // Excess spend analysis
  const txnsWithExcess = successfulWaivers.filter(t => t.excessSpend !== undefined);
  const totalExcessSpend = txnsWithExcess
    .filter(t => (t.excessSpend ?? 0) > 0)
    .reduce((sum, t) => sum + (t.excessSpend ?? 0), 0);
  const totalSteals = Math.abs(
    txnsWithExcess
      .filter(t => (t.excessSpend ?? 0) < 0)
      .reduce((sum, t) => sum + (t.excessSpend ?? 0), 0),
  );
  const netExcessSpend = totalExcessSpend - totalSteals;
  const avgExcessSpendPerWaiver =
    txnsWithExcess.length > 0 ? netExcessSpend / txnsWithExcess.length : 0;
  const overbidCount = txnsWithExcess.filter(t => (t.excessSpend ?? 0) > 0).length;
  const stealCount = txnsWithExcess.filter(t => (t.excessSpend ?? 0) < 0).length;

  // Weekly activity
  const weeklyMap = groupByWeek(managerTxns);
  const weeklyActivity = Array.from(weeklyMap.entries())
    .map(([week, txns]) => ({
      week,
      faabSpent: txns
        .filter(t => t.isWinningBid && t.transactionType === 'waiver')
        .reduce((sum, t) => sum + t.faabBid, 0),
      playersAdded: txns.filter(t => t.isWinningBid).length,
      failedBids: txns.filter(t => !t.isWinningBid).length,
    }))
    .sort((a, b) => a.week - b.week);

  // Notable transactions
  const biggestBidTransaction =
    successfulWaivers.length > 0
      ? successfulWaivers.reduce((max, t) => (t.faabBid > max.faabBid ? t : max))
      : null;

  const biggestSteal =
    txnsWithExcess.length > 0
      ? txnsWithExcess.reduce((min, t) => ((t.excessSpend ?? 0) < (min.excessSpend ?? 0) ? t : min))
      : null;

  const biggestOverbid =
    txnsWithExcess.length > 0
      ? txnsWithExcess.reduce((max, t) => ((t.excessSpend ?? 0) > (max.excessSpend ?? 0) ? t : max))
      : null;

  const mostRecentPickup =
    managerTxns.filter(t => t.isWinningBid).length > 0
      ? managerTxns
          .filter(t => t.isWinningBid)
          .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())[0]
      : null;

  return {
    rosterId,
    teamName,
    managerName,
    leagueId,
    leagueName,
    totalFAABSpent,
    totalFAABAvailable: startingBudget,
    remainingFAAB,
    percentSpent,
    totalWaivers,
    totalFreeAgents,
    totalTransactions,
    failedWaivers: failedWaiversCount,
    waiverSuccessRate,
    spendByPosition,
    countByPosition,
    avgFaabPerWaiver,
    biggestBid,
    smallestBid,
    totalExcessSpend,
    totalSteals,
    netExcessSpend,
    avgExcessSpendPerWaiver,
    overbidCount,
    stealCount,
    weeklyActivity,
    biggestBidTransaction,
    biggestSteal,
    biggestOverbid,
    mostRecentPickup,
  };
};

/**
 * Build league-wide waiver trends
 */
export const buildLeagueWaiverTrends = (
  leagueId: string,
  leagueName: string,
  allTransactions: WaiverTransaction[],
  managerStats: ManagerWaiverStats[],
): LeagueWaiverTrends => {
  // Filter to this league
  const leagueTxns = allTransactions.filter(t => t.leagueId === leagueId);
  const successfulWaivers = filterSuccessfulWaivers(leagueTxns);
  const failedWaivers = filterFailedWaivers(leagueTxns);
  const freeAgents = leagueTxns.filter(t => t.isWinningBid && t.transactionType === 'free_agent');

  // Aggregate stats
  const totalFAABSpent = successfulWaivers.reduce((sum, t) => sum + t.faabBid, 0);
  const avgFAABPerManager = managerStats.length > 0 ? totalFAABSpent / managerStats.length : 0;
  const totalWaivers = successfulWaivers.length;
  const totalFreeAgents = freeAgents.length;
  const totalFailedWaivers = failedWaivers.length;
  const totalTransactions = leagueTxns.filter(t => t.isWinningBid).length;

  // Competition metrics
  const playerCompetitionMap = new Map<string, number>();
  leagueTxns.forEach(txn => {
    const key = `${txn.week}-${txn.playerId}`;
    playerCompetitionMap.set(key, (playerCompetitionMap.get(key) || 0) + 1);
  });

  const avgBidsPerPlayer =
    playerCompetitionMap.size > 0
      ? Array.from(playerCompetitionMap.values()).reduce((sum, count) => sum + count, 0) /
        playerCompetitionMap.size
      : 0;

  // Find most contested player
  let mostContestedPlayer: { playerId: string; playerName: string; bidCount: number } | null = null;
  let maxBids = 0;

  playerCompetitionMap.forEach((bidCount, key) => {
    if (bidCount > maxBids) {
      maxBids = bidCount;
      const [, playerId] = key.split('-');
      const txn = leagueTxns.find(t => t.playerId === playerId);
      if (txn) {
        mostContestedPlayer = {
          playerId,
          playerName: txn.playerName,
          bidCount,
        };
      }
    }
  });

  // Position popularity
  const positionMap = groupByPosition(successfulWaivers);
  const positionTrends = Array.from(positionMap.entries())
    .map(([position, txns]) => {
      const totalSpent = txns.reduce((sum, t) => sum + t.faabBid, 0);
      const transactionCount = txns.length;
      const avgCost = transactionCount > 0 ? totalSpent / transactionCount : 0;
      const percentOfTotalSpend = totalFAABSpent > 0 ? (totalSpent / totalFAABSpent) * 100 : 0;

      return {
        position,
        totalSpent,
        transactionCount,
        avgCost,
        percentOfTotalSpend,
      };
    })
    .sort((a, b) => b.totalSpent - a.totalSpent);

  // Week-by-week activity
  const weeklyMap = groupByWeek(leagueTxns);
  const weeklyTrends = Array.from(weeklyMap.entries())
    .map(([week, txns]) => {
      const waivers = txns.filter(t => t.isWinningBid && t.transactionType === 'waiver');
      const freeAgents = txns.filter(t => t.isWinningBid && t.transactionType === 'free_agent');
      const totalSpent = waivers.reduce((sum, t) => sum + t.faabBid, 0);
      const avgBid = waivers.length > 0 ? totalSpent / waivers.length : 0;

      // Competition level for this week
      const weekPlayerMap = new Map<string, number>();
      txns.forEach(txn => {
        weekPlayerMap.set(txn.playerId, (weekPlayerMap.get(txn.playerId) || 0) + 1);
      });
      const competitionLevel =
        weekPlayerMap.size > 0
          ? Array.from(weekPlayerMap.values()).reduce((sum, count) => sum + count, 0) /
            weekPlayerMap.size
          : 0;

      return {
        week,
        totalSpent,
        waiverCount: waivers.length,
        freeAgentCount: freeAgents.length,
        avgBid,
        competitionLevel,
      };
    })
    .sort((a, b) => a.week - b.week);

  return {
    leagueId,
    leagueName,
    totalFAABSpent,
    avgFAABPerManager,
    totalWaivers,
    totalFreeAgents,
    totalFailedWaivers,
    totalTransactions,
    avgBidsPerPlayer,
    mostContestedPlayer,
    positionTrends,
    weeklyTrends,
    managers: managerStats,
  };
};
