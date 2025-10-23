/**
 * Player Movement Analysis
 *
 * Track highest volume movers - players involved in most transactions
 */

import type { PlayerMovement, WaiverTransaction } from '../types';

/**
 * Build player movement history showing ownership changes
 */
export const buildPlayerMovement = (
  playerId: string,
  allTransactions: WaiverTransaction[],
): PlayerMovement | null => {
  // Get all transactions for this player
  const playerTxns = allTransactions.filter(t => t.playerId === playerId);

  if (playerTxns.length === 0) return null;

  const firstTxn = playerTxns[0];

  // Separate by transaction type
  const adds = playerTxns.filter(t => t.isWinningBid);
  const drops = playerTxns.filter(t => !t.isWinningBid); // Includes failed bids
  const trades = playerTxns.filter(t => t.transactionType === 'waiver'); // TODO: Add trade detection

  // Calculate FAAB metrics (successful waivers only)
  const successfulWaivers = adds.filter(t => t.transactionType === 'waiver');
  const totalFAABSpent = successfulWaivers.reduce((sum, t) => sum + t.faabBid, 0);
  const avgFAABCost = successfulWaivers.length > 0 ? totalFAABSpent / successfulWaivers.length : 0;
  const highestAcquisitionCost =
    successfulWaivers.length > 0 ? Math.max(...successfulWaivers.map(t => t.faabBid)) : 0;

  // Build ownership timeline
  const ownershipHistory: PlayerMovement['ownershipHistory'] = [];

  // Sort adds by week
  const sortedAdds = adds.sort((a, b) => a.week - b.week);

  sortedAdds.forEach((addTxn, index) => {
    // Check if player was dropped later
    const laterDrops = playerTxns.filter(
      t => !t.isWinningBid && t.rosterId === addTxn.rosterId && t.week > addTxn.week,
    );

    // Check if player was added again by another team
    const nextAdd = sortedAdds[index + 1];
    const weekDropped = nextAdd ? nextAdd.week - 1 : null;

    const weeksOwned = weekDropped ? weekDropped - addTxn.week + 1 : 999; // Still owned

    ownershipHistory.push({
      rosterId: addTxn.rosterId,
      teamName: addTxn.teamName,
      weekAcquired: addTxn.week,
      weekDropped,
      acquisitionType: addTxn.transactionType,
      faabCost: addTxn.transactionType === 'waiver' ? addTxn.faabBid : undefined,
      weeksOwned,
    });
  });

  return {
    playerId,
    playerName: firstTxn.playerName,
    position: firstTxn.position,
    leagueId: firstTxn.leagueId,
    leagueName: firstTxn.leagueName,
    totalTransactions: playerTxns.length,
    addCount: adds.length,
    dropCount: drops.length,
    tradeCount: trades.length,
    totalFAABSpent,
    avgFAABCost,
    highestAcquisitionCost,
    ownershipHistory,
  };
};

/**
 * Find top movers by transaction volume
 */
export const findTopMovers = (
  allTransactions: WaiverTransaction[],
  limit = 50,
): PlayerMovement[] => {
  // Group by player
  const playerMap = new Map<string, WaiverTransaction[]>();

  allTransactions.forEach(txn => {
    if (!playerMap.has(txn.playerId)) {
      playerMap.set(txn.playerId, []);
    }
    playerMap.get(txn.playerId)!.push(txn);
  });

  // Build movement records for all players
  const movements: PlayerMovement[] = [];

  playerMap.forEach((txns, playerId) => {
    const movement = buildPlayerMovement(playerId, allTransactions);
    if (movement) {
      movements.push(movement);
    }
  });

  // Sort by total transaction volume (descending)
  movements.sort((a, b) => b.totalTransactions - a.totalTransactions);

  // Return top N
  return movements.slice(0, limit);
};

/**
 * Find top movers for a specific league
 */
export const findTopMoversByLeague = (
  leagueId: string,
  allTransactions: WaiverTransaction[],
  limit = 20,
): PlayerMovement[] => {
  const leagueTxns = allTransactions.filter(t => t.leagueId === leagueId);
  return findTopMovers(leagueTxns, limit);
};
