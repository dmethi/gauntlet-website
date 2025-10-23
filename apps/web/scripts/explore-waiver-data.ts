/**
 * Waiver Data Exploration Script
 *
 * Explores Sleeper API transaction data to understand:
 * 1. Do failed/pending waiver attempts show up? (competing bids)
 * 2. What data is available for cross-league comparison?
 * 3. Structure of waiver vs free agent transactions
 * 4. FAAB data completeness
 *
 * Run: npx tsx apps/web/scripts/explore-waiver-data.ts
 */

import { CURRENT_LEAGUES } from '../src/config/leagues';

interface SleeperTransaction {
  transaction_id: string;
  type: string; // 'waiver' | 'trade' | 'free_agent'
  status: string; // 'complete' | 'pending' | 'failed'?
  leg: number;
  settings?: {
    waiver_bid?: number;
    seq?: number;
  };
  roster_ids: number[];
  consenter_ids?: number[];
  creator?: string;
  created?: number;
  status_updated?: number;
  adds?: Record<string, number>; // player_id -> roster_id
  drops?: Record<string, number>;
  draft_picks?: any[];
  waiver_budget?: Array<{
    sender: number;
    receiver: number;
    amount: number;
  }>;
  metadata?: Record<string, unknown>;
}

interface TransactionStats {
  total: number;
  byType: Record<string, number>;
  byStatus: Record<string, number>;
  waiverTransactions: SleeperTransaction[];
  failedTransactions: SleeperTransaction[];
  pendingTransactions: SleeperTransaction[];
  uniquePlayers: Set<string>;
  totalFAABSpent: number;
  faabBids: Array<{ amount: number; playerId: string; rosterId: number; week: number }>;
}

/**
 * Fetch transactions for a specific week from Sleeper API
 */
const fetchTransactionsByWeek = async (
  leagueId: string,
  week: number,
): Promise<SleeperTransaction[]> => {
  const url = `https://api.sleeper.app/v1/league/${leagueId}/transactions/${week}`;
  console.log(`  Fetching: ${url}`);

  const response = await fetch(url);
  if (!response.ok) {
    console.warn(`  ⚠️  Failed to fetch week ${week}: ${response.status}`);
    return [];
  }

  const data = await response.json();
  return data;
};

/**
 * Analyze transactions for a league
 */
const analyzeLeagueTransactions = async (
  leagueId: string,
  leagueName: string,
  startWeek: number,
  endWeek: number,
): Promise<TransactionStats> => {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`📊 ANALYZING: ${leagueName} (${leagueId})`);
  console.log(`${'='.repeat(60)}`);

  const stats: TransactionStats = {
    total: 0,
    byType: {},
    byStatus: {},
    waiverTransactions: [],
    failedTransactions: [],
    pendingTransactions: [],
    uniquePlayers: new Set(),
    totalFAABSpent: 0,
    faabBids: [],
  };

  // Fetch transactions for each week
  for (let week = startWeek; week <= endWeek; week++) {
    console.log(`\n📅 Week ${week}:`);

    const transactions = await fetchTransactionsByWeek(leagueId, week);
    console.log(`  Found ${transactions.length} transactions`);

    // Analyze each transaction
    for (const txn of transactions) {
      stats.total++;

      // Count by type
      stats.byType[txn.type] = (stats.byType[txn.type] || 0) + 1;

      // Count by status
      stats.byStatus[txn.status] = (stats.byStatus[txn.status] || 0) + 1;

      // Track waiver transactions
      if (txn.type === 'waiver') {
        stats.waiverTransactions.push(txn);

        // Track FAAB spending
        if (txn.settings?.waiver_bid !== undefined) {
          stats.totalFAABSpent += txn.settings.waiver_bid;

          // Track per-player bids
          if (txn.adds) {
            Object.keys(txn.adds).forEach(playerId => {
              stats.faabBids.push({
                amount: txn.settings!.waiver_bid!,
                playerId,
                rosterId: txn.adds![playerId],
                week,
              });
            });
          }
        }
      }

      // Track failed transactions (competing bids!)
      if (txn.status === 'failed' || txn.status === 'pending') {
        if (txn.status === 'failed') stats.failedTransactions.push(txn);
        if (txn.status === 'pending') stats.pendingTransactions.push(txn);
      }

      // Track unique players
      if (txn.adds) {
        Object.keys(txn.adds).forEach(playerId => stats.uniquePlayers.add(playerId));
      }
    }

    // Small delay to be nice to Sleeper API
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  return stats;
};

/**
 * Compare cross-league player prices
 */
const comparePlayerPrices = (afcStats: TransactionStats, nfcStats: TransactionStats): void => {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`🔄 CROSS-LEAGUE PLAYER COMPARISON`);
  console.log(`${'='.repeat(60)}`);

  // Build player -> bids map for each league
  const afcPlayerBids = new Map<string, number[]>();
  const nfcPlayerBids = new Map<string, number[]>();

  afcStats.faabBids.forEach(bid => {
    if (!afcPlayerBids.has(bid.playerId)) {
      afcPlayerBids.set(bid.playerId, []);
    }
    afcPlayerBids.get(bid.playerId)!.push(bid.amount);
  });

  nfcStats.faabBids.forEach(bid => {
    if (!nfcPlayerBids.has(bid.playerId)) {
      nfcPlayerBids.set(bid.playerId, []);
    }
    nfcPlayerBids.get(bid.playerId)!.push(bid.amount);
  });

  // Find players picked up in both leagues
  const commonPlayers = new Set(
    [...afcPlayerBids.keys()].filter(playerId => nfcPlayerBids.has(playerId)),
  );

  console.log(`\n📊 Players acquired in BOTH leagues: ${commonPlayers.size}`);

  if (commonPlayers.size > 0) {
    console.log(`\nSample cross-league price differences:`);

    const comparisons: Array<{
      playerId: string;
      afcAvg: number;
      nfcAvg: number;
      difference: number;
    }> = [];

    commonPlayers.forEach(playerId => {
      const afcBids = afcPlayerBids.get(playerId) || [];
      const nfcBids = nfcPlayerBids.get(playerId) || [];

      const afcAvg = afcBids.reduce((a, b) => a + b, 0) / afcBids.length;
      const nfcAvg = nfcBids.reduce((a, b) => a + b, 0) / nfcBids.length;

      comparisons.push({
        playerId,
        afcAvg,
        nfcAvg,
        difference: afcAvg - nfcAvg,
      });
    });

    // Sort by absolute difference
    comparisons.sort((a, b) => Math.abs(b.difference) - Math.abs(a.difference));

    // Show top 10
    comparisons.slice(0, 10).forEach((comp, idx) => {
      const sign = comp.difference > 0 ? '+' : '';
      console.log(
        `  ${idx + 1}. Player ${comp.playerId}: AFC $${comp.afcAvg.toFixed(1)} vs NFC $${comp.nfcAvg.toFixed(1)} (${sign}${comp.difference.toFixed(1)})`,
      );
    });
  }
};

/**
 * Print detailed transaction samples
 */
const printSampleTransactions = (stats: TransactionStats): void => {
  console.log(`\n📝 SAMPLE TRANSACTIONS:`);

  // Sample waiver transaction
  if (stats.waiverTransactions.length > 0) {
    console.log(`\n1️⃣  WAIVER TRANSACTION (Complete):`);
    const sample = stats.waiverTransactions[0];
    console.log(JSON.stringify(sample, null, 2));
  }

  // Sample failed transaction
  if (stats.failedTransactions.length > 0) {
    console.log(`\n2️⃣  FAILED TRANSACTION (Competing Bid?):`);
    const sample = stats.failedTransactions[0];
    console.log(JSON.stringify(sample, null, 2));
  }

  // Sample pending transaction
  if (stats.pendingTransactions.length > 0) {
    console.log(`\n3️⃣  PENDING TRANSACTION:`);
    const sample = stats.pendingTransactions[0];
    console.log(JSON.stringify(sample, null, 2));
  }
};

/**
 * Print summary statistics
 */
const printSummary = (leagueName: string, stats: TransactionStats): void => {
  console.log(`\n📊 SUMMARY - ${leagueName}:`);
  console.log(`  Total Transactions: ${stats.total}`);
  console.log(`  By Type:`, stats.byType);
  console.log(`  By Status:`, stats.byStatus);
  console.log(`  Waiver Transactions: ${stats.waiverTransactions.length}`);
  console.log(`  Failed Transactions: ${stats.failedTransactions.length} ⭐`);
  console.log(`  Pending Transactions: ${stats.pendingTransactions.length}`);
  console.log(`  Unique Players: ${stats.uniquePlayers.size}`);
  console.log(`  Total FAAB Spent: $${stats.totalFAABSpent}`);
  console.log(
    `  Avg FAAB per Waiver: $${(stats.totalFAABSpent / stats.faabBids.length).toFixed(1)}`,
  );

  if (stats.failedTransactions.length > 0) {
    console.log(`\n  ⭐ FOUND FAILED TRANSACTIONS! These may contain competing bids.`);
  }
};

/**
 * Main execution
 */
const main = async (): Promise<void> => {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`🔍 WAIVER DATA EXPLORATION SCRIPT`);
  console.log(`${'='.repeat(60)}`);
  console.log(`\nExploring Sleeper API transaction data for:`);
  console.log(`  - AFC League: ${CURRENT_LEAGUES[0].id}`);
  console.log(`  - NFC League: ${CURRENT_LEAGUES[1].id}`);
  console.log(`\nChecking weeks 1-8 for transaction data...`);

  try {
    // Analyze AFC
    const afcStats = await analyzeLeagueTransactions(
      CURRENT_LEAGUES[0].id,
      CURRENT_LEAGUES[0].name,
      1,
      8, // Check first 8 weeks
    );

    printSummary(CURRENT_LEAGUES[0].name, afcStats);

    // Analyze NFC
    const nfcStats = await analyzeLeagueTransactions(
      CURRENT_LEAGUES[1].id,
      CURRENT_LEAGUES[1].name,
      1,
      8,
    );

    printSummary(CURRENT_LEAGUES[1].name, nfcStats);

    // Cross-league comparison
    comparePlayerPrices(afcStats, nfcStats);

    // Print detailed samples
    console.log(`\n${'='.repeat(60)}`);
    console.log(`📋 DETAILED TRANSACTION SAMPLES`);
    console.log(`${'='.repeat(60)}`);

    console.log(`\n--- AFC SAMPLES ---`);
    printSampleTransactions(afcStats);

    console.log(`\n--- NFC SAMPLES ---`);
    printSampleTransactions(nfcStats);

    // Final verdict
    console.log(`\n${'='.repeat(60)}`);
    console.log(`✅ FINDINGS & RECOMMENDATIONS`);
    console.log(`${'='.repeat(60)}`);

    const totalFailed = afcStats.failedTransactions.length + nfcStats.failedTransactions.length;

    if (totalFailed > 0) {
      console.log(`\n✅ GOOD NEWS: Found ${totalFailed} failed transactions!`);
      console.log(`   This means we CAN track competing bids.`);
      console.log(`   Failed transactions likely contain losing waiver bids.`);
    } else {
      console.log(`\n⚠️  WARNING: No failed transactions found.`);
      console.log(`   Either:`);
      console.log(`   1. API doesn't return failed bids (need to verify with Sleeper docs)`);
      console.log(`   2. No competing bids existed in analyzed weeks`);
      console.log(`   3. Failed transactions expire/disappear after some time`);
    }

    console.log(`\n📊 Cross-League Analysis Feasibility:`);
    console.log(
      `   - Can compare same player prices: ${afcStats.uniquePlayers.size > 0 && nfcStats.uniquePlayers.size > 0 ? '✅ YES' : '❌ NO'}`,
    );
    console.log(
      `   - Can track FAAB by position: ${afcStats.faabBids.length > 0 ? '✅ YES (need position data)' : '❌ NO'}`,
    );
    console.log(`   - Can calculate aggregate differences: ✅ YES`);
  } catch (error) {
    console.error(`\n❌ ERROR:`, error);
    throw error;
  }
};

// Run the script
main().catch(error => {
  console.error('Script failed:', error);
  process.exit(1);
});
