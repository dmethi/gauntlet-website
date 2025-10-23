/**
 * Waiver Data Transformations
 *
 * Transform raw Sleeper API transactions into enriched waiver analysis data.
 * Handles competing bids, excess spend calculations, and cross-league comparisons.
 */

import type { SleeperTransaction } from '@gauntlet/types';
import type { WaiverTransaction, CompetingBid, PlayerWaiverHistory } from '../types';

/**
 * Team info lookup map
 */
export interface TeamInfo {
  rosterId: number;
  teamName: string;
  managerName: string;
  leagueId: string;
  leagueName: string;
}

/**
 * Player info lookup
 */
export interface PlayerInfo {
  playerId: string;
  playerName: string;
  position: string;
}

/**
 * Transform raw Sleeper transaction to enriched waiver transaction
 */
export const transformSleeperTransaction = (
  txn: SleeperTransaction,
  week: number,
  teamInfo: TeamInfo,
  playerInfo: PlayerInfo,
): WaiverTransaction => {
  const faabBid = txn.settings?.waiver_bid ?? 0;
  const isWaiver = txn.type === 'waiver';
  const isComplete = txn.status === 'complete';

  return {
    transactionId: txn.transaction_id,
    week,
    leagueId: teamInfo.leagueId,
    leagueName: teamInfo.leagueName,
    rosterId: teamInfo.rosterId,
    teamName: teamInfo.teamName,
    managerName: teamInfo.managerName,
    playerId: playerInfo.playerId,
    playerName: playerInfo.playerName,
    position: playerInfo.position,
    faabBid,
    status: isComplete ? 'complete' : 'failed',
    transactionType: isWaiver ? 'waiver' : 'free_agent',
    timestamp: new Date(txn.created ?? 0),
    isWinningBid: isComplete,
    failureReason: txn.status === 'failed' ? (txn.metadata?.notes as string) : undefined,
  };
};

/**
 * Check if a failed waiver was due to being outbid (vs roster/other issues)
 */
const isLegitimateCompetingBid = (failureReason?: string): boolean => {
  if (!failureReason) return true; // Assume competitive if no reason given

  const reason = failureReason.toLowerCase();

  // These are legitimate competitive losses
  if (
    reason.includes('claimed by another owner') ||
    reason.includes('outbid') ||
    reason.includes('higher bid')
  ) {
    return true;
  }

  // These are NOT competitive losses (roster/technical issues)
  if (
    reason.includes('too many players') ||
    reason.includes('roster') ||
    reason.includes('invalid') ||
    reason.includes('cancelled')
  ) {
    return false;
  }

  // Default to true for unknown reasons
  return true;
};

/**
 * Group transactions by player to find competing bids
 *
 * For each player acquisition, finds all failed bids (competing bids)
 * and calculates excess spend metrics.
 */
export const enrichWithCompetingBids = (transactions: WaiverTransaction[]): WaiverTransaction[] => {
  // Group by player + week
  const playerWeekMap = new Map<string, WaiverTransaction[]>();

  transactions.forEach(txn => {
    const key = `${txn.leagueId}-${txn.week}-${txn.playerId}`;
    if (!playerWeekMap.has(key)) {
      playerWeekMap.set(key, []);
    }
    playerWeekMap.get(key)!.push(txn);
  });

  // Process each group
  const enriched: WaiverTransaction[] = [];

  playerWeekMap.forEach(group => {
    // Separate transaction types
    const winningWaivers = group.filter(t => t.isWinningBid && t.transactionType === 'waiver');
    const losingWaivers = group.filter(t => !t.isWinningBid && t.transactionType === 'waiver');
    const freeAgents = group.filter(t => t.isWinningBid && t.transactionType === 'free_agent');

    // Process waiver transactions with competition
    if (winningWaivers.length > 0 && losingWaivers.length > 0) {
      winningWaivers.forEach(winner => {
        // Filter to only legitimate competing bids (not roster issues, etc.)
        const legitimateLosingBids = losingWaivers.filter(loser =>
          isLegitimateCompetingBid(loser.failureReason),
        );

        const competingBids: CompetingBid[] = legitimateLosingBids.map(loser => ({
          rosterId: loser.rosterId,
          teamName: loser.teamName,
          managerName: loser.managerName,
          amount: loser.faabBid,
          failureReason: loser.failureReason || 'Outbid by another team',
          timestamp: loser.timestamp,
        }));

        // Sort competing bids descending
        competingBids.sort((a, b) => b.amount - a.amount);

        // Calculate excess spend based on legitimate competing bids only
        const nextHighestBid = competingBids[0]?.amount ?? 0;
        const excessSpend =
          competingBids.length > 0 ? winner.faabBid - nextHighestBid : winner.faabBid; // No legitimate competition = full bid is excess

        enriched.push({
          ...winner,
          competingBids,
          nextHighestBid,
          excessSpend,
          totalCompetition: competingBids.length + 1, // include winner
        });
      });

      // Also add the losing bids (without enrichment)
      enriched.push(...losingWaivers);
    } else if (winningWaivers.length > 0) {
      // Waiver with no competition - full bid amount is excess (could have gotten for $0)
      winningWaivers.forEach(winner => {
        enriched.push({
          ...winner,
          excessSpend: winner.faabBid, // Full bid is excess when no competition
          nextHighestBid: 0,
          totalCompetition: 1,
          competingBids: [],
        });
      });
      enriched.push(...losingWaivers);
    }

    // Process free agents - no excess spend (they're free)
    if (freeAgents.length > 0) {
      freeAgents.forEach(fa => {
        enriched.push({
          ...fa,
          excessSpend: 0, // Free agents have no excess
          nextHighestBid: 0,
          totalCompetition: 1,
          competingBids: [],
        });
      });
    }
  });

  return enriched;
};

/**
 * Build player waiver history from transactions
 */
export const buildPlayerWaiverHistory = (
  playerId: string,
  transactions: WaiverTransaction[],
): PlayerWaiverHistory => {
  const playerTxns = transactions.filter(t => t.playerId === playerId);

  if (playerTxns.length === 0) {
    throw new Error(`No transactions found for player ${playerId}`);
  }

  const firstTxn = playerTxns[0];

  // Build attempts array
  const allAttempts = playerTxns.map(txn => ({
    week: txn.week,
    rosterId: txn.rosterId,
    teamName: txn.teamName,
    managerName: txn.managerName,
    bidAmount: txn.faabBid,
    result: txn.isWinningBid
      ? ('won' as const)
      : txn.failureReason?.includes('roster')
        ? ('roster_limit' as const)
        : txn.failureReason?.includes('claimed')
          ? ('lost' as const)
          : ('other_failure' as const),
    timestamp: txn.timestamp,
  }));

  // Calculate metrics
  const successfulAcquisitions = allAttempts.filter(a => a.result === 'won');
  const failedAttempts = allAttempts.filter(a => a.result !== 'won');
  const winningBids = successfulAcquisitions.map(a => a.bidAmount);
  const losingBids = failedAttempts.map(a => a.bidAmount);

  const avgWinningBid =
    winningBids.length > 0
      ? winningBids.reduce((sum, bid) => sum + bid, 0) / winningBids.length
      : 0;

  const avgLosingBid =
    losingBids.length > 0 ? losingBids.reduce((sum, bid) => sum + bid, 0) / losingBids.length : 0;

  // Find current owner (most recent successful acquisition)
  const currentOwner =
    successfulAcquisitions.length > 0
      ? (() => {
          const latest = successfulAcquisitions.sort((a, b) => b.week - a.week)[0];
          return {
            rosterId: latest.rosterId,
            teamName: latest.teamName,
            weekAcquired: latest.week,
            costPaid: latest.bidAmount,
          };
        })()
      : null;

  return {
    playerId,
    playerName: firstTxn.playerName,
    position: firstTxn.position,
    leagueId: firstTxn.leagueId,
    leagueName: firstTxn.leagueName,
    allAttempts,
    totalAttempts: allAttempts.length,
    successfulAcquisitions: successfulAcquisitions.length,
    failedAttempts: failedAttempts.length,
    highestBid: Math.max(...allAttempts.map(a => a.bidAmount), 0),
    lowestWinningBid: Math.min(...winningBids, Infinity),
    avgWinningBid,
    avgLosingBid,
    demandIndex:
      successfulAcquisitions.length > 0 ? failedAttempts.length / successfulAcquisitions.length : 0,
    currentOwner,
  };
};

/**
 * Calculate remaining FAAB for a roster
 */
export const calculateRemainingFAAB = (
  rosterId: number,
  transactions: WaiverTransaction[],
  startingBudget = 200,
): number => {
  const rosterTxns = transactions.filter(
    t => t.rosterId === rosterId && t.isWinningBid && t.transactionType === 'waiver',
  );

  const totalSpent = rosterTxns.reduce((sum, txn) => sum + txn.faabBid, 0);

  return startingBudget - totalSpent;
};

/**
 * Group transactions by position
 */
export const groupByPosition = (
  transactions: WaiverTransaction[],
): Map<string, WaiverTransaction[]> => {
  const map = new Map<string, WaiverTransaction[]>();

  transactions.forEach(txn => {
    if (!map.has(txn.position)) {
      map.set(txn.position, []);
    }
    map.get(txn.position)!.push(txn);
  });

  return map;
};

/**
 * Group transactions by week
 */
export const groupByWeek = (
  transactions: WaiverTransaction[],
): Map<number, WaiverTransaction[]> => {
  const map = new Map<number, WaiverTransaction[]>();

  transactions.forEach(txn => {
    if (!map.has(txn.week)) {
      map.set(txn.week, []);
    }
    map.get(txn.week)!.push(txn);
  });

  return map;
};

/**
 * Group transactions by manager/roster
 */
export const groupByManager = (
  transactions: WaiverTransaction[],
): Map<number, WaiverTransaction[]> => {
  const map = new Map<number, WaiverTransaction[]>();

  transactions.forEach(txn => {
    if (!map.has(txn.rosterId)) {
      map.set(txn.rosterId, []);
    }
    map.get(txn.rosterId)!.push(txn);
  });

  return map;
};

/**
 * Filter to only successful waivers (not free agents, not failed)
 */
export const filterSuccessfulWaivers = (transactions: WaiverTransaction[]): WaiverTransaction[] => {
  return transactions.filter(t => t.isWinningBid && t.transactionType === 'waiver');
};

/**
 * Filter to only failed waivers (competing bids)
 */
export const filterFailedWaivers = (transactions: WaiverTransaction[]): WaiverTransaction[] => {
  return transactions.filter(t => !t.isWinningBid && t.transactionType === 'waiver');
};
