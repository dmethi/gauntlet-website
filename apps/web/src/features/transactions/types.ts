/**
 * Transaction analysis types
 * Types for waiver wire, trades, and transaction efficiency analysis
 */

/**
 * Represents a single player involved in a transaction
 */
export interface PlayerTransaction {
  playerId: string;
  name: string;
  position: string;
  role: 'add' | 'drop';
  pre: {
    ppg: number; // Points per game before transaction
    pps: number; // Points per snap before transaction
    total: number; // Total points before transaction
  };
  post: {
    poPts: number; // Points of Possession (points scored after acquisition)
  };
  forYou?: {
    starts: number; // Number of games started
    points: number; // Total points scored
    weightedPoints: number; // Points weighted by playoff importance
  };
  afterDrop?: {
    selfHarm: number; // Points lost by dropping this player
    oppHarm: number; // Points opponent gained by picking up this player
    selfHarmWeighted: number; // Self-harm weighted by playoff importance
    oppHarmWeighted: number; // Opponent harm weighted by playoff importance
  };
  weeklyPoints?: Array<{
    week: number;
    points: number;
    replacementLevel?: number; // Position replacement level for this week
    vorp?: number; // Value over replacement player
    started: boolean;
    weight: number; // Playoff importance weight
  }>;
}

/**
 * Graded transaction with performance analysis
 */
export interface GradeTxn {
  id: string;
  type: string; // 'waiver', 'free_agent', 'trade'
  createdAt: string;
  rosterIds?: number[];
  leagueId?: string;
  leagueName?: string;
  teamName?: string;
  faabCost?: number; // FAAB spent on this transaction (0 for free agents/trades)
  rawScore?: number; // Original VORP score before cost adjustment
  costPenalty?: number; // FAAB cost penalty applied
  players: PlayerTransaction[];
  score: number; // Final cost-adjusted score
  grade: string; // Letter grade (A+, A, B+, B, C+, C, D, F)
}

/**
 * Raw transaction data from Sleeper API
 */
export interface RawTxn {
  id: string;
  type: string;
  status: string;
  createdAt: string;
  rosterIds?: number[];
  adds?: Array<{
    rosterId: number;
    players?: Array<{
      id: string;
      fullName: string;
      position: string;
    }>;
  }>;
  drops?: Array<{
    rosterId: number;
    players?: Array<{
      id: string;
      fullName: string;
      position: string;
    }>;
  }>;
  settings?: {
    waiver_bid?: number; // FAAB cost for waiver transactions
  };
}

/**
 * Transaction analysis facts and context
 * Precomputed data for efficient transaction grading
 */
export interface TransactionFacts {
  weeks: number[]; // Weeks included in analysis
  weekRosterPlayers: Map<string, Set<string>>; // `${week}:${rosterId}` -> Set<playerId>
  weekRosterStarters: Map<string, Set<string>>; // `${week}:${rosterId}` -> Set<playerId>
  weekOpponent: Map<string, number>; // `${week}:${rosterId}` -> opponentRosterId
  playerWeekPoints: Map<string, number>; // `${week}:${playerId}` -> points
  replacementByWeekPos: Map<string, number>; // `${week}:${position}` -> replacement level points
  rosterPlayerWeeks: Map<string, Set<number>>; // `${rosterId}:${playerId}` -> set of weeks owned
}

/**
 * Team information for transaction context
 */
export interface TeamInfo {
  rosterId: number;
  teamName: string;
  ownerName: string;
  leagueId: string;
  leagueName: string;
}

/**
 * Aggregate transaction analysis for a manager
 */
export interface ManagerTransactionStats {
  managerId: string;
  managerName: string;
  teamName: string;
  totalTransactions: number;
  avgGrade: string;
  avgScore: number;
  bestTransaction: GradeTxn;
  worstTransaction: GradeTxn;
  netPointsGained: number; // Total VORP from all transactions
  faabSpent: number; // Total FAAB spent
  faabEfficiency: number; // Points gained per FAAB dollar
}

/**
 * League-wide transaction analysis
 */
export interface TransactionAnalysis {
  transactions: GradeTxn[];
  managerStats: ManagerTransactionStats[];
  leagueStats: {
    totalTransactions: number;
    avgScore: number;
    avgFaabSpent: number;
    bestWeek: number;
    worstWeek: number;
    mostActiveManager: string;
  };
}

/**
 * Waiver wire pickup analysis
 */
export interface WaiverPickup {
  playerId: string;
  playerName: string;
  position: string;
  week: number;
  rosterId: number;
  teamName: string;
  faabSpent?: number; // FAAB bid amount
  waiverPriority?: number; // Waiver priority used
  pointsScored: number; // Total points after acquisition
  gamesStarted: number; // Number of games started
  roi: number; // Return on investment (points per FAAB dollar)
  grade: string; // Letter grade for this pickup
}

/**
 * Trade analysis between two teams
 */
export interface TradeAnalysis {
  tradeId: string;
  week: number;
  createdAt: string;
  team1: {
    rosterId: number;
    teamName: string;
    playersGiven: PlayerTransaction[];
    playersReceived: PlayerTransaction[];
    netPoints: number; // Net VORP from trade
  };
  team2: {
    rosterId: number;
    teamName: string;
    playersGiven: PlayerTransaction[];
    playersReceived: PlayerTransaction[];
    netPoints: number; // Net VORP from trade
  };
  winner: 'team1' | 'team2' | 'fair'; // Which team won the trade
  overallGrade: string; // Letter grade for both teams
  verdict: string; // Human-readable verdict
}
