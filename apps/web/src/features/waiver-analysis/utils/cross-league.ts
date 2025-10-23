/**
 * Cross-League Comparison Utilities
 *
 * Compare waiver spending and player prices between AFC and NFC leagues.
 */

import type {
  CrossLeaguePlayerComparison,
  LeagueWaiverTrends,
  PositionalSpendComparison,
  WaiverTransaction,
  WeeklySpendComparison,
} from '../types';
import { filterSuccessfulWaivers, groupByPosition } from './transformations';

/**
 * Build cross-league player price comparison
 *
 * For players acquired in both leagues, compare pricing and competition
 */
export const buildCrossLeaguePlayerComparisons = (
  afcTransactions: WaiverTransaction[],
  nfcTransactions: WaiverTransaction[],
): CrossLeaguePlayerComparison[] => {
  // Get successful waivers only
  const afcWaivers = filterSuccessfulWaivers(afcTransactions);
  const nfcWaivers = filterSuccessfulWaivers(nfcTransactions);

  // Group by player
  const afcPlayerMap = new Map<string, WaiverTransaction[]>();
  const nfcPlayerMap = new Map<string, WaiverTransaction[]>();

  afcWaivers.forEach(txn => {
    if (!afcPlayerMap.has(txn.playerId)) {
      afcPlayerMap.set(txn.playerId, []);
    }
    afcPlayerMap.get(txn.playerId)!.push(txn);
  });

  nfcWaivers.forEach(txn => {
    if (!nfcPlayerMap.has(txn.playerId)) {
      nfcPlayerMap.set(txn.playerId, []);
    }
    nfcPlayerMap.get(txn.playerId)!.push(txn);
  });

  // Find players in both leagues
  const allPlayerIds = new Set([...afcPlayerMap.keys(), ...nfcPlayerMap.keys()]);

  const comparisons: CrossLeaguePlayerComparison[] = [];

  allPlayerIds.forEach(playerId => {
    const afcTxns = afcPlayerMap.get(playerId);
    const nfcTxns = nfcPlayerMap.get(playerId);

    // Get player info
    const firstTxn = afcTxns?.[0] ?? nfcTxns?.[0];
    if (!firstTxn) return;

    // Build AFC stats
    const afcStats = afcTxns
      ? {
          acquisitions: afcTxns.length,
          totalSpent: afcTxns.reduce((sum, t) => sum + t.faabBid, 0),
          avgCost: afcTxns.reduce((sum, t) => sum + t.faabBid, 0) / afcTxns.length,
          highestBid: Math.max(...afcTxns.map(t => t.faabBid)),
          lowestBid: Math.min(...afcTxns.map(t => t.faabBid)),
          totalAttempts: afcTransactions.filter(t => t.playerId === playerId).length,
          managers: [...new Set(afcTxns.map(t => t.teamName))],
          weeklyPrices: afcTxns.map(t => ({ week: t.week, cost: t.faabBid })),
        }
      : null;

    // Build NFC stats
    const nfcStats = nfcTxns
      ? {
          acquisitions: nfcTxns.length,
          totalSpent: nfcTxns.reduce((sum, t) => sum + t.faabBid, 0),
          avgCost: nfcTxns.reduce((sum, t) => sum + t.faabBid, 0) / nfcTxns.length,
          highestBid: Math.max(...nfcTxns.map(t => t.faabBid)),
          lowestBid: Math.min(...nfcTxns.map(t => t.faabBid)),
          totalAttempts: nfcTransactions.filter(t => t.playerId === playerId).length,
          managers: [...new Set(nfcTxns.map(t => t.teamName))],
          weeklyPrices: nfcTxns.map(t => ({ week: t.week, cost: t.faabBid })),
        }
      : null;

    // Calculate comparison metrics
    const afcAvg = afcStats?.avgCost ?? 0;
    const nfcAvg = nfcStats?.avgCost ?? 0;
    const priceDifference = afcAvg - nfcAvg;
    const absoluteDifference = Math.abs(priceDifference);
    const avgOfBoth = (afcAvg + nfcAvg) / 2;
    const percentDifference = avgOfBoth > 0 ? (priceDifference / avgOfBoth) * 100 : 0;
    const competitionDifference = (afcStats?.totalAttempts ?? 0) - (nfcStats?.totalAttempts ?? 0);

    let whichLeagueValuesMore: 'AFC' | 'NFC' | 'EQUAL';
    if (Math.abs(priceDifference) < 0.01) {
      whichLeagueValuesMore = 'EQUAL';
    } else if (priceDifference > 0) {
      whichLeagueValuesMore = 'AFC';
    } else {
      whichLeagueValuesMore = 'NFC';
    }

    comparisons.push({
      playerId,
      playerName: firstTxn.playerName,
      position: firstTxn.position,
      afcStats,
      nfcStats,
      priceDifference,
      absoluteDifference,
      percentDifference,
      competitionDifference,
      whichLeagueValuesMore,
    });
  });

  // Sort by absolute difference (biggest price differences first)
  return comparisons.sort((a, b) => b.absoluteDifference - a.absoluteDifference);
};

/**
 * Build positional spending comparison between leagues
 */
export const buildPositionalSpendComparison = (
  afcTransactions: WaiverTransaction[],
  nfcTransactions: WaiverTransaction[],
): PositionalSpendComparison[] => {
  const afcWaivers = filterSuccessfulWaivers(afcTransactions);
  const nfcWaivers = filterSuccessfulWaivers(nfcTransactions);

  const afcPositionMap = groupByPosition(afcWaivers);
  const nfcPositionMap = groupByPosition(nfcWaivers);

  const afcTotalSpend = afcWaivers.reduce((sum, t) => sum + t.faabBid, 0);
  const nfcTotalSpend = nfcWaivers.reduce((sum, t) => sum + t.faabBid, 0);

  // Get all positions from both leagues
  const allPositions = new Set([...afcPositionMap.keys(), ...nfcPositionMap.keys()]);

  const comparisons: PositionalSpendComparison[] = [];

  allPositions.forEach(position => {
    const afcTxns = afcPositionMap.get(position) || [];
    const nfcTxns = nfcPositionMap.get(position) || [];

    // AFC stats
    const afcTotal = afcTxns.reduce((sum, t) => sum + t.faabBid, 0);
    const afcAvg = afcTxns.length > 0 ? afcTotal / afcTxns.length : 0;
    const afcCount = afcTxns.length;
    const afcPercent = afcTotalSpend > 0 ? (afcTotal / afcTotalSpend) * 100 : 0;
    const afcTopBid = afcTxns.length > 0 ? Math.max(...afcTxns.map(t => t.faabBid)) : 0;
    const afcTopPlayer =
      afcTxns.length > 0
        ? afcTxns.reduce((max, t) => (t.faabBid > max.faabBid ? t : max)).playerName
        : '';

    // NFC stats
    const nfcTotal = nfcTxns.reduce((sum, t) => sum + t.faabBid, 0);
    const nfcAvg = nfcTxns.length > 0 ? nfcTotal / nfcTxns.length : 0;
    const nfcCount = nfcTxns.length;
    const nfcPercent = nfcTotalSpend > 0 ? (nfcTotal / nfcTotalSpend) * 100 : 0;
    const nfcTopBid = nfcTxns.length > 0 ? Math.max(...nfcTxns.map(t => t.faabBid)) : 0;
    const nfcTopPlayer =
      nfcTxns.length > 0
        ? nfcTxns.reduce((max, t) => (t.faabBid > max.faabBid ? t : max)).playerName
        : '';

    // Comparison
    const totalDifference = afcTotal - nfcTotal;
    const avgDifference = afcAvg - nfcAvg;
    const countDifference = afcCount - nfcCount;

    let whichLeagueSpendsMore: 'AFC' | 'NFC' | 'EQUAL';
    if (Math.abs(totalDifference) < 1) {
      whichLeagueSpendsMore = 'EQUAL';
    } else if (totalDifference > 0) {
      whichLeagueSpendsMore = 'AFC';
    } else {
      whichLeagueSpendsMore = 'NFC';
    }

    comparisons.push({
      position,
      afcSpend: {
        total: afcTotal,
        avg: afcAvg,
        count: afcCount,
        percentOfLeagueTotal: afcPercent,
        topPlayer: afcTopPlayer,
        topBid: afcTopBid,
      },
      nfcSpend: {
        total: nfcTotal,
        avg: nfcAvg,
        count: nfcCount,
        percentOfLeagueTotal: nfcPercent,
        topPlayer: nfcTopPlayer,
        topBid: nfcTopBid,
      },
      totalDifference,
      avgDifference,
      countDifference,
      whichLeagueSpendsMore,
    });
  });

  // Sort by total difference (biggest spenders first)
  return comparisons.sort(
    (a, b) =>
      Math.max(b.afcSpend.total, b.nfcSpend.total) - Math.max(a.afcSpend.total, a.nfcSpend.total),
  );
};

/**
 * Build week-by-week spending comparison
 */
export const buildWeeklySpendComparison = (
  afcTransactions: WaiverTransaction[],
  nfcTransactions: WaiverTransaction[],
  weeks: number[],
): WeeklySpendComparison[] => {
  const afcWaivers = filterSuccessfulWaivers(afcTransactions);
  const nfcWaivers = filterSuccessfulWaivers(nfcTransactions);

  return weeks.map(week => {
    const afcWeekTxns = afcWaivers.filter(t => t.week === week);
    const nfcWeekTxns = nfcWaivers.filter(t => t.week === week);

    // AFC data
    const afcTotalSpent = afcWeekTxns.reduce((sum, t) => sum + t.faabBid, 0);
    const afcWaiverCount = afcWeekTxns.length;
    const afcAvgBid = afcWaiverCount > 0 ? afcTotalSpent / afcWaiverCount : 0;
    const afcTopBid = afcWeekTxns.length > 0 ? Math.max(...afcWeekTxns.map(t => t.faabBid)) : 0;
    const afcTopPlayer =
      afcWeekTxns.length > 0
        ? afcWeekTxns.reduce((max, t) => (t.faabBid > max.faabBid ? t : max)).playerName
        : '';

    // NFC data
    const nfcTotalSpent = nfcWeekTxns.reduce((sum, t) => sum + t.faabBid, 0);
    const nfcWaiverCount = nfcWeekTxns.length;
    const nfcAvgBid = nfcWaiverCount > 0 ? nfcTotalSpent / nfcWaiverCount : 0;
    const nfcTopBid = nfcWeekTxns.length > 0 ? Math.max(...nfcWeekTxns.map(t => t.faabBid)) : 0;
    const nfcTopPlayer =
      nfcWeekTxns.length > 0
        ? nfcWeekTxns.reduce((max, t) => (t.faabBid > max.faabBid ? t : max)).playerName
        : '';

    return {
      week,
      afcData: {
        totalSpent: afcTotalSpent,
        waiverCount: afcWaiverCount,
        avgBid: afcAvgBid,
        topBid: afcTopBid,
        topPlayer: afcTopPlayer,
      },
      nfcData: {
        totalSpent: nfcTotalSpent,
        waiverCount: nfcWaiverCount,
        avgBid: nfcAvgBid,
        topBid: nfcTopBid,
        topPlayer: nfcTopPlayer,
      },
      spendDifference: afcTotalSpent - nfcTotalSpent,
      avgBidDifference: afcAvgBid - nfcAvgBid,
      activityDifference: afcWaiverCount - nfcWaiverCount,
    };
  });
};

/**
 * Get summary stats for league comparison card
 */
export const getLeagueComparisonSummary = (
  afcTrends: LeagueWaiverTrends,
  nfcTrends: LeagueWaiverTrends,
) => {
  return {
    totalSpendDifference: afcTrends.totalFAABSpent - nfcTrends.totalFAABSpent,
    avgSpendDifference: afcTrends.avgFAABPerManager - nfcTrends.avgFAABPerManager,
    activityDifference: afcTrends.totalWaivers - nfcTrends.totalWaivers,
    moreAggressiveLeague: afcTrends.totalFAABSpent > nfcTrends.totalFAABSpent ? 'AFC' : 'NFC',
    moreActiveLeague: afcTrends.totalWaivers > nfcTrends.totalWaivers ? 'AFC' : 'NFC',
  };
};
