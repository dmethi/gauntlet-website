/**
 * Complete type definitions for Weekly Recap Reports.
 *
 * These types cover:
 * - Report structure (sections and metadata)
 * - Section-specific data structures
 * - Tool result types
 * - Validation types
 */

// ============================================================================
// CORE REPORT TYPES
// ============================================================================

/**
 * Complete weekly recap report structure.
 * This matches the JSON format we currently use for report-week5.json.
 */
export interface WeeklyRecapReport {
  metadata: ReportMetadata;
  sections: {
    leagueOverview: LeagueOverviewSection;
    matchupNarratives: MatchupNarrativeSection[];
    hallOfFame: HallOfFameSection;
    hallOfShame: HallOfShameSection;
    powerRankings: PowerRankingsSection;
    standings: StandingsSection;
    upcoming: UpcomingMatchupsSection;
    closing: ClosingCommentarySection;
  };
  // Top-level enriched data for UI (Week 5 format compatibility)
  standingsData?: Array<{
    leagueId: string;
    leagueName: string;
    divisions: Record<string, any[]>;
  }>;
}

/**
 * Report metadata and generation info.
 */
export interface ReportMetadata {
  week: number;
  season: number;
  generatedAt: string; // ISO timestamp
  generationTime: number; // milliseconds
  tokensUsed: number;
  version: string; // e.g., "1.0.0"
  status: 'success' | 'partial' | 'failed';
  errors?: string[];
}

// ============================================================================
// SECTION TYPES
// ============================================================================

/**
 * League Overview section.
 * High-level summary of the week's action.
 */
export interface LeagueOverviewSection {
  narrative: string; // Markdown content
  stats: {
    totalGames: number;
    totalPoints: number;
    averageScore: number;
    highestScore: number;
    lowestScore: number;
    blowouts: number; // Games decided by 30+ points
    closeGames: number; // Games decided by < 10 points
  };
  generatedAt: string;
}

/**
 * Individual matchup narrative.
 * One per game (12 total per week).
 */
export interface MatchupNarrativeSection {
  matchupId: string; // e.g., "afc-5-1" (league-week-matchupId)
  narrative: string; // Markdown content
  boxScore: {
    team1: TeamBoxScore;
    team2: TeamBoxScore;
    finalScore: {
      team1: number;
      team2: number;
    };
    winner: 'team1' | 'team2';
    margin: number;
  };
  gameFlow?: {
    leadChanges: number;
    biggestLead: number;
    excitementScore: number; // 0-100
  };
  // Time series data for win probability and score charts
  timeSeries?: Array<{
    timestamp: string;
    team1Score: number;
    team2Score: number;
    team1WinProbability: number;
    gameProgress: number; // 0.0-1.0
  }>;
  generatedAt: string;
}

/**
 * Team box score for a matchup.
 */
export interface TeamBoxScore {
  teamName: string;
  rosterId: number;
  leagueId: string;
  score: number;
  record: string; // e.g., "4-1"
  topPerformers: Array<{
    playerName: string;
    position: string;
    points: number;
  }>;
}

/**
 * Hall of Fame section.
 * Celebrates the week's best performances.
 */
export interface HallOfFameSection {
  narrative: string; // Markdown content
  highlights: {
    topTeamScore: {
      teamName: string;
      score: number;
      leagueId: string;
      rosterId: number;
    };
    biggestBlowout: {
      winner: string;
      loser: string;
      margin: number;
      matchupId: string;
    };
    topPerformers: {
      QB: PlayerPerformance[];
      RB: PlayerPerformance[];
      WR: PlayerPerformance[];
      TE: PlayerPerformance[];
      K: PlayerPerformance[];
      DEF: PlayerPerformance[];
    };
  };
  generatedAt: string;
}

/**
 * Hall of Shame section.
 * Highlights disappointments and bad beats.
 */
export interface HallOfShameSection {
  narrative: string; // Markdown content
  lowlights: {
    lowestTeamScore: {
      teamName: string;
      score: number;
      leagueId: string;
      rosterId: number;
    };
    biggestBusts: PlayerPerformance[];
    badBeatLosses: Array<{
      loser: string;
      loserScore: number;
      winnerScore: number;
      margin: number;
      context: string; // Why it was a bad beat
    }>;
  };
  generatedAt: string;
}

/**
 * Individual player performance.
 */
export interface PlayerPerformance {
  playerName: string;
  playerId: string;
  position: string;
  team: string; // NFL team
  points: number;
  projection?: number; // Expected points
  ownedBy?: string; // Fantasy team name
}

/**
 * Power Rankings section.
 * Commentary on ranking changes.
 */
export interface PowerRankingsSection {
  narrative: string; // Markdown content
  rankings: Array<{
    rank: number;
    previousRank?: number;
    teamName: string;
    leagueId: string;
    rosterId: number;
    record: string;
    points: number;
    tier?: number; // Tier number (1 = best)
    powerScore?: number; // Power ranking score
    movement: 'up' | 'down' | 'same';
    movementAmount?: number;
  }>;
  generatedAt: string;
}

/**
 * Standings section.
 * Current league standings and playoff picture.
 */
export interface StandingsSection {
  narrative: string; // Markdown content
  standings: {
    afc: TeamStanding[];
    nfc: TeamStanding[];
  };
  playoffPicture: {
    clinched: string[]; // Team names
    inHunt: string[];
    eliminated: string[];
  };
  generatedAt: string;
}

/**
 * Team standing information.
 */
export interface TeamStanding {
  rank: number;
  teamName: string;
  record: string;
  pointsFor: number;
  pointsAgainst: number;
  streak: string; // e.g., "W3" or "L2"
}

/**
 * Upcoming matchups section.
 * Brief preview of next week.
 */
export interface UpcomingMatchupsSection {
  narrative: string; // Markdown content
  matchups: Array<{
    team1: string;
    team2: string;
    storyline: string; // One-sentence preview
  }>;
  generatedAt: string;
}

/**
 * Closing commentary section.
 * Big-picture reflections and forward-looking analysis.
 */
export interface ClosingCommentarySection {
  narrative: string; // Markdown content
  generatedAt: string;
}

// ============================================================================
// TOOL RESULT TYPES
// ============================================================================

/**
 * League statistics for a given week.
 */
export interface LeagueStats {
  week: number;
  season: number;
  totalGames: number;
  totalPoints: number;
  averageScore: number;
  highestScore: number;
  lowestScore: number;
  medianScore: number;
  blowouts: number;
  closeGames: number;
}

/**
 * Matchup data with box scores.
 */
export interface MatchupData {
  matchupId: string;
  leagueId: string;
  week: number;
  team1: TeamMatchupData;
  team2: TeamMatchupData;
  winner: 'team1' | 'team2' | 'tie';
  margin: number;
}

/**
 * Team data within a matchup.
 */
export interface TeamMatchupData {
  rosterId: number;
  teamName: string;
  score: number;
  projection: number;
  record: string;
  starters: PlayerInMatchup[];
  bench: PlayerInMatchup[];
}

/**
 * Player within a matchup.
 */
export interface PlayerInMatchup {
  playerId: string;
  playerName: string;
  position: string;
  nflTeam: string;
  points: number;
  projection: number;
}

/**
 * Game flow time-series data.
 */
export interface GameFlowData {
  matchupId: string;
  dataPoints: GameFlowPoint[];
  summary: {
    leadChanges: number;
    biggestLead: number;
    excitementScore: number;
    finalScore: {
      team1: number;
      team2: number;
    };
  };
}

/**
 * Single point in game flow time series.
 */
export interface GameFlowPoint {
  timestamp: string; // ISO timestamp
  team1Score: number;
  team2Score: number;
  team1WinProbability: number;
  gameMinute: number; // 0-180 for 3-hour game
}

// ============================================================================
// GAME FLOW COMPRESSION TYPES
// ============================================================================

/**
 * Raw live matchup update from database.
 * These are captured every ~150 minutes throughout the week.
 */
export interface LiveMatchupUpdate {
  timestamp: Date;
  week: number;
  matchupId: number;
  leagueId: string;
  rosterAId: number;
  rosterBId: number;
  gameProgress: number; // 0.0 = pre-game, 0.0-1.0 = in-game, 1.0 = complete
  winProbA: number;
  winProbB: number;
  currentScoreA: number;
  currentScoreB: number;
  projectedFinalA: number;
  projectedFinalB: number;
  spread: number;
  total: number;
}

/**
 * A single compressed moment in the game flow.
 * Represents a narratively significant event.
 */
export interface CompressedGameFlowPoint {
  timestamp: string; // ISO format
  teamAScore: number;
  teamBScore: number;
  teamAWinProbability: number;
  gameProgress: number; // 0.0-1.0
  significance:
    | 'game_start'
    | 'lead_change'
    | 'scoring_run'
    | 'win_prob_swing'
    | 'comeback'
    | 'game_end';
  description: string; // Human-readable description
}

/**
 * Excitement metrics calculated from full time series.
 */
export interface ExcitementMetrics {
  leadChanges: number; // Number of times the lead switched
  maxComeback: number; // Largest point deficit overcome
  volatility: number; // Average win prob change per sample (0-100)
  maxSwing: number; // Largest single win prob swing (0-100)
  clutchFactor: number; // Drama in final quarter (0-100)
  totalSamples: number; // Number of samples used for calculation
}

/**
 * Compressed game flow with key moments and excitement metrics.
 * This is what gets passed to the LLM for narrative generation.
 */
export interface CompressedGameFlow {
  matchupId: string; // e.g., "afc-5-1"
  leagueId: string;
  week: number;
  keyMoments: CompressedGameFlowPoint[]; // 3-5 key moments
  excitement: ExcitementMetrics;
  compressionRatio: string; // e.g., "62 → 4 points (94% reduction)"
  finalScore: {
    teamA: number;
    teamB: number;
  };
}

// ============================================================================
// VALIDATION TYPES
// ============================================================================

/**
 * Result of narrative validation/audit.
 */
export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
  score: number; // 0-100 quality score
}

/**
 * Validation error (must be fixed).
 */
export interface ValidationError {
  type: 'score_mismatch' | 'missing_data' | 'invalid_name' | 'hallucination';
  message: string;
  location: string; // Section or field
  severity: 'critical' | 'major' | 'minor';
}

/**
 * Validation warning (should be reviewed).
 */
export interface ValidationWarning {
  type: 'style' | 'accuracy' | 'completeness';
  message: string;
  location: string;
  suggestion?: string;
}

// ============================================================================
// MATCHUP DATA TOOL TYPES (RECAP-008)
// ============================================================================

/**
 * Matchup box score with final scores and projections.
 */
export interface MatchupBoxScore {
  leagueId: string;
  week: number;
  matchupId: number;
  team1: {
    rosterId: number;
    score: number;
    projectedScore: number;
  };
  team2: {
    rosterId: number;
    score: number;
    projectedScore: number;
  };
  winner: 'team1' | 'team2' | 'tie';
  margin: number;
}

/**
 * Team record entering a week.
 */
export interface TeamRecord {
  rosterId: number;
  wins: number;
  losses: number;
  ties: number;
  winPct: number;
  pointsFor: number;
  pointsAgainst: number;
}

/**
 * Head-to-head history between two teams.
 */
export interface H2HHistory {
  team1Wins: number;
  team2Wins: number;
  ties: number;
  previousMatchups: Array<{
    week: number;
    team1Score: number;
    team2Score: number;
    winner: 'team1' | 'team2' | 'tie';
  }>;
}

/**
 * Points breakdown by position.
 */
export interface PositionBreakdown {
  rosterId: number;
  positions: {
    QB: number;
    RB: number;
    WR: number;
    TE: number;
    K: number;
    DEF: number;
  };
}

/**
 * Key player performance in a matchup.
 */
export interface KeyPlayerPerformance {
  playerId: string;
  playerName: string;
  position: string;
  points: number;
  projected: number;
  overUnder: number;
}

// ============================================================================
// POWER RANKINGS TYPES (RECAP-013)
// ============================================================================

/**
 * Power ranking for a single team.
 * Includes current rank, previous rank, and movement tracking.
 */
export interface PowerRanking {
  rank: number;
  previousRank: number;
  movement: number; // Positive = moved up, negative = moved down
  rosterId: number;
  leagueId: string;
  teamName: string;
  ownerName: string;
  record: string; // e.g., "4-1"
  pointsFor: number;
  league: string;
  powerScore: number; // Normalized power score (around 100)
  tier: number; // Tier number (1 = best, dynamically assigned)
}

/**
 * Tier summary with team counts and score ranges.
 * Tiers are dynamically generated based on natural clustering in power scores.
 */
export interface TierSummary {
  tier: number; // Tier number (1 = best)
  label: string; // AI-generated or generic label (e.g., "Tier 1", "Elite", etc.)
  teams: PowerRanking[];
  scoreRange: { min: number; max: number };
  avgScore: number;
  teamCount: number;
}

/**
 * Notable changes in power rankings.
 * Highlights biggest movers and top teams.
 */
export interface RankingChange {
  biggestRiser: PowerRanking | null;
  biggestFaller: PowerRanking | null;
  topThree: PowerRanking[];
  notableChanges: PowerRanking[]; // Moved 3+ spots
  tiers: TierSummary[]; // Tier breakdown
}

// ============================================================================
// STANDINGS TYPES (RECAP-014)
// ============================================================================

/**
 * Individual team standing entry.
 * Includes record, points, and playoff seeding.
 */
export interface StandingsEntry {
  rank: number;
  rosterId: number;
  teamName: string;
  ownerName: string;
  wins: number;
  losses: number;
  ties: number;
  winPct: number;
  pointsFor: number;
  pointsAgainst: number;
  playoffSeed: number | null; // 1-6 for playoff teams, null for others
  division: number | null; // Division number (1, 2, 3)
}

/**
 * League standings with playoff picture.
 */
export interface Standings {
  league: string;
  entries: StandingsEntry[];
  playoffLine: number; // Number of teams that make playoffs (typically 6)
}
