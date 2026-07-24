import { describe, expect, it } from 'vitest';
import type { WaiverTransaction } from '../types';
import { buildCrossLeaguePlayerComparisons, buildPositionalSpendComparison } from './cross-league';

/**
 * Multi-league safety for cross-league waiver comparisons: this module takes
 * two positional transaction lists (one per league) rather than an ID-keyed
 * store, so the collision risk isn't "wrong league picked by ID" — it's
 * whether a player/position present in *both* leagues' transactions gets
 * kept as two separate per-league stat blocks (correct: combination only at
 * the presentation layer, i.e. the two stats sitting side by side in one
 * output row) instead of silently summed/merged into a single league's
 * numbers.
 */

const txn = (overrides: Partial<WaiverTransaction>): WaiverTransaction => ({
  transactionId: 'txn',
  week: 1,
  leagueId: 'league',
  leagueName: 'League',
  rosterId: 1,
  teamName: 'Team',
  managerName: 'Manager',
  playerId: 'player_1',
  playerName: 'Player One',
  position: 'RB',
  faabBid: 10,
  status: 'complete',
  transactionType: 'waiver',
  timestamp: new Date('2025-09-01'),
  isWinningBid: true,
  ...overrides,
});

describe('buildCrossLeaguePlayerComparisons: same playerId acquired in both leagues', () => {
  it("keeps each league's acquisition stats separate, not summed together", () => {
    const afcTransactions = [
      txn({ leagueId: 'afc', playerId: 'shared_player', faabBid: 40, teamName: 'AFC Team' }),
    ];
    const nfcTransactions = [
      txn({ leagueId: 'nfc', playerId: 'shared_player', faabBid: 10, teamName: 'NFC Team' }),
    ];

    const comparisons = buildCrossLeaguePlayerComparisons(afcTransactions, nfcTransactions);
    expect(comparisons).toHaveLength(1);

    const comparison = comparisons[0]!;
    expect(comparison.afcStats?.totalSpent).toBe(40);
    expect(comparison.nfcStats?.totalSpent).toBe(10);
    // Neither side should have absorbed the other's bid.
    expect(comparison.afcStats?.totalSpent).not.toBe(50);
    expect(comparison.nfcStats?.totalSpent).not.toBe(50);
  });

  it('does not mix managers across leagues for the same player', () => {
    const afcTransactions = [
      txn({ leagueId: 'afc', playerId: 'shared_player', teamName: 'AFC Team', faabBid: 5 }),
    ];
    const nfcTransactions = [
      txn({ leagueId: 'nfc', playerId: 'shared_player', teamName: 'NFC Team', faabBid: 5 }),
    ];

    const [comparison] = buildCrossLeaguePlayerComparisons(afcTransactions, nfcTransactions);

    expect(comparison!.afcStats?.managers).toEqual(['AFC Team']);
    expect(comparison!.nfcStats?.managers).toEqual(['NFC Team']);
  });

  it('leaves the other side null when only one league acquired the player', () => {
    const afcTransactions = [txn({ leagueId: 'afc', playerId: 'afc_only' })];
    const nfcTransactions: WaiverTransaction[] = [];

    const [comparison] = buildCrossLeaguePlayerComparisons(afcTransactions, nfcTransactions);

    expect(comparison!.afcStats).not.toBeNull();
    expect(comparison!.nfcStats).toBeNull();
  });
});

describe('buildPositionalSpendComparison: same position spent on in both leagues', () => {
  it("keeps each league's positional totals separate, not summed together", () => {
    const afcTransactions = [
      txn({ leagueId: 'afc', position: 'WR', faabBid: 30, playerId: 'p1' }),
      txn({ leagueId: 'afc', position: 'WR', faabBid: 20, playerId: 'p2' }),
    ];
    const nfcTransactions = [txn({ leagueId: 'nfc', position: 'WR', faabBid: 5, playerId: 'p3' })];

    const [comparison] = buildPositionalSpendComparison(afcTransactions, nfcTransactions);

    expect(comparison!.afcSpend.total).toBe(50);
    expect(comparison!.afcSpend.count).toBe(2);
    expect(comparison!.nfcSpend.total).toBe(5);
    expect(comparison!.nfcSpend.count).toBe(1);
    expect(comparison!.afcSpend.total).not.toBe(55);
  });
});
