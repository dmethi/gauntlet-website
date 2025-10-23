/**
 * Waiver Analysis Types
 *
 * Types for comprehensive waiver wire and FAAB analysis across both leagues.
 * Based on real Sleeper API data including competing bids via failed transactions.
 */

import type { SleeperTransaction } from '@gauntlet/types';

/**
 * Raw waiver transaction with Sleeper API fields
 * Re-exported for convenience
 */
export type RawSleeperTransaction = SleeperTransaction;

/**
 * Enriched waiver transaction with analysis data
 */
export interface WaiverTransaction {
  transactionId: string;
  week: number;
  leagueId: string;
  leagueName: string;
  rosterId: number;
  teamName: string;
  managerName: string;
  playerId: string;
  playerName: string;
  position: string;
  faabBid: number;
  status: 'complete' | 'failed';
  transactionType: 'waiver' | 'free_agent';
  timestamp: Date;
  isWinningBid: boolean;

  // Competing bid analysis (populated for winning bids)
  competingBids?: CompetingBid[];
  excessSpend?: number; // positive = overpaid, negative = steal, 0 = perfect bid
  nextHighestBid?: number;
  totalCompetition?: number; // number of teams that bid on this player

  // Failure reason (for failed bids)
  failureReason?: string;
}

/**
 * A competing (losing) bid for a player
 */
export interface CompetingBid {
  rosterId: number;
  teamName: string;
  managerName: string;
  amount: number;
  failureReason: string;
  timestamp: Date;
}

/**
 * Manager-level waiver analytics
 */
export interface ManagerWaiverStats {
  rosterId: number;
  teamName: string;
  managerName: string;
  leagueId: string;
  leagueName: string;

  // Budget tracking
  totalFAABSpent: number;
  totalFAABAvailable: number; // Starting budget (200)
  remainingFAAB: number;
  percentSpent: number;

  // Transaction counts
  totalWaivers: number; // FAAB bids (won)
  totalFreeAgents: number; // $0 pickups
  totalTransactions: number; // total adds (waiver + FA)
  failedWaivers: number; // Lost bids
  waiverSuccessRate: number; // won / (won + failed)

  // Positional breakdown
  spendByPosition: Record<string, number>; // { QB: 45, RB: 80, ... }
  countByPosition: Record<string, number>; // { QB: 2, RB: 5, ... }

  // Efficiency metrics
  avgFaabPerWaiver: number;
  biggestBid: number;
  smallestBid: number;

  // Excess spend analysis
  totalExcessSpend: number; // sum of all overpayments
  totalSteals: number; // sum of all underpayments (negative excess)
  netExcessSpend: number; // total excess - total steals
  avgExcessSpendPerWaiver: number;
  overbidCount: number; // transactions where excessSpend > 0
  stealCount: number; // transactions where excessSpend < 0

  // Timeline
  weeklyActivity: Array<{
    week: number;
    faabSpent: number;
    playersAdded: number;
    failedBids: number;
  }>;

  // Notable transactions
  biggestBidTransaction: WaiverTransaction | null;
  biggestSteal: WaiverTransaction | null; // most negative excess spend
  biggestOverbid: WaiverTransaction | null; // most positive excess spend
  mostRecentPickup: WaiverTransaction | null;
}

/**
 * League-wide waiver trends
 */
export interface LeagueWaiverTrends {
  leagueId: string;
  leagueName: string;

  // Aggregate stats
  totalFAABSpent: number;
  avgFAABPerManager: number;
  totalWaivers: number; // successful
  totalFreeAgents: number;
  totalFailedWaivers: number;
  totalTransactions: number;

  // Competition metrics
  avgBidsPerPlayer: number;
  mostContestedPlayer: {
    playerId: string;
    playerName: string;
    bidCount: number;
  } | null;

  // Position popularity
  positionTrends: Array<{
    position: string;
    totalSpent: number;
    transactionCount: number;
    avgCost: number;
    percentOfTotalSpend: number;
  }>;

  // Week-by-week activity
  weeklyTrends: Array<{
    week: number;
    totalSpent: number;
    waiverCount: number;
    freeAgentCount: number;
    avgBid: number;
    competitionLevel: number; // avg bids per player
  }>;

  // Manager rankings
  managers: ManagerWaiverStats[];
}

/**
 * Player-specific waiver history
 */
export interface PlayerWaiverHistory {
  playerId: string;
  playerName: string;
  position: string;
  leagueId: string;
  leagueName: string;

  // All attempts to acquire this player
  allAttempts: Array<{
    week: number;
    rosterId: number;
    teamName: string;
    managerName: string;
    bidAmount: number;
    result: 'won' | 'lost' | 'roster_limit' | 'other_failure';
    timestamp: Date;
  }>;

  // Analysis
  totalAttempts: number;
  successfulAcquisitions: number;
  failedAttempts: number;
  highestBid: number;
  lowestWinningBid: number;
  avgWinningBid: number;
  avgLosingBid: number;
  demandIndex: number; // failedAttempts / successfulAcquisitions

  // Current ownership
  currentOwner: {
    rosterId: number;
    teamName: string;
    weekAcquired: number;
    costPaid: number;
  } | null;
}

/**
 * Cross-league player price comparison
 */
export interface CrossLeaguePlayerComparison {
  playerId: string;
  playerName: string;
  position: string;

  // AFC data
  afcStats: {
    acquisitions: number;
    totalSpent: number;
    avgCost: number;
    highestBid: number;
    lowestBid: number;
    totalAttempts: number; // includes failed bids
    managers: string[]; // who acquired
    weeklyPrices: Array<{ week: number; cost: number }>;
  } | null;

  // NFC data
  nfcStats: {
    acquisitions: number;
    totalSpent: number;
    avgCost: number;
    highestBid: number;
    lowestBid: number;
    totalAttempts: number;
    managers: string[];
    weeklyPrices: Array<{ week: number; cost: number }>;
  } | null;

  // Comparison metrics
  priceDifference: number; // AFC avg - NFC avg
  absoluteDifference: number; // |priceDifference|
  percentDifference: number; // (priceDifference / avgOfBoth) * 100
  competitionDifference: number; // AFC attempts - NFC attempts
  whichLeagueValuesMore: 'AFC' | 'NFC' | 'EQUAL';
}

/**
 * Positional spending comparison between leagues
 */
export interface PositionalSpendComparison {
  position: string; // QB, RB, WR, TE, DEF

  afcSpend: {
    total: number;
    avg: number;
    count: number;
    percentOfLeagueTotal: number;
    topPlayer: string;
    topBid: number;
  };

  nfcSpend: {
    total: number;
    avg: number;
    count: number;
    percentOfLeagueTotal: number;
    topPlayer: string;
    topBid: number;
  };

  // Comparison
  totalDifference: number; // AFC - NFC
  avgDifference: number;
  countDifference: number;
  whichLeagueSpendsMore: 'AFC' | 'NFC' | 'EQUAL';
}

/**
 * Week-by-week cross-league comparison
 */
export interface WeeklySpendComparison {
  week: number;

  afcData: {
    totalSpent: number;
    waiverCount: number;
    avgBid: number;
    topBid: number;
    topPlayer: string;
  };

  nfcData: {
    totalSpent: number;
    waiverCount: number;
    avgBid: number;
    topBid: number;
    topPlayer: string;
  };

  // Comparison
  spendDifference: number;
  avgBidDifference: number;
  activityDifference: number; // count difference
}

/**
 * Player movement/volume analysis
 */
export interface PlayerMovement {
  playerId: string;
  playerName: string;
  position: string;
  leagueId: string;
  leagueName: string;

  // Transaction volume
  totalTransactions: number;
  addCount: number;
  dropCount: number;
  tradeCount: number;

  // FAAB data
  totalFAABSpent: number;
  avgFAABCost: number;
  highestAcquisitionCost: number;

  // Ownership timeline
  ownershipHistory: Array<{
    rosterId: number;
    teamName: string;
    weekAcquired: number;
    weekDropped: number | null; // null if still owned
    acquisitionType: 'waiver' | 'free_agent' | 'trade' | 'draft';
    faabCost?: number;
    weeksOwned: number;
  }>;
}

/**
 * Complete waiver analysis dataset
 */
export interface WaiverAnalysisData {
  // By league
  afcTrends: LeagueWaiverTrends;
  nfcTrends: LeagueWaiverTrends;

  // Cross-league comparisons
  playerComparisons: CrossLeaguePlayerComparison[];
  positionComparisons: PositionalSpendComparison[];
  weeklyComparisons: WeeklySpendComparison[];

  // Player movement (top movers)
  topMovers: PlayerMovement[]; // Combined top 50 across both leagues
  topMoversByLeague: {
    afc: PlayerMovement[];
    nfc: PlayerMovement[];
  };

  // All enriched transactions (for detailed views)
  allTransactions: WaiverTransaction[];

  // Metadata
  currentWeek: number;
  weeksAnalyzed: number[];
  lastUpdated: Date;
}

/**
 * Filter options for waiver analysis views
 */
export interface WaiverFilters {
  leagues?: string[]; // league IDs
  positions?: string[];
  weeks?: number[];
  managers?: string[]; // team names
  transactionTypes?: ('waiver' | 'free_agent')[];
  minFAAB?: number;
  maxFAAB?: number;
  showOnlyOverbids?: boolean;
  showOnlySteals?: boolean;
}

/**
 * Sort options for waiver tables
 */
export type WaiverSortField =
  | 'week'
  | 'faabBid'
  | 'excessSpend'
  | 'playerName'
  | 'teamName'
  | 'competition'
  | 'totalSpent'
  | 'remainingFAAB';

export type WaiverSortOrder = 'asc' | 'desc';

export interface WaiverSortOptions {
  field: WaiverSortField;
  order: WaiverSortOrder;
}
