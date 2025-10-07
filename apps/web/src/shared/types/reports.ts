/**
 * Competition report types
 * Types for weekly competition reports, standings, and power rankings
 */

// ============================================================================
// Core Report Types
// ============================================================================

/**
 * Box score row representing a player's performance
 */
export interface BoxRow {
  playerId: string;
  name: string;
  position: string | null;
  points: number;
}

/**
 * Time series point for win probability tracking
 */
export interface SeriesPoint {
  timestamp: string;
  winProbA: number;
  winProbB: number;
  gameProgress: number;
  team1Score?: number | null;
  team2Score?: number | null;
}

/**
 * Detailed matchup view for reports
 */
export interface MatchupView {
  leagueId: string;
  matchupId: number;
  rosterAId: number;
  rosterBId: number;
  teamAName?: string;
  teamBName?: string;
  pointsA: number;
  pointsB: number;
  margin: number;
  combinedPoints: number;
  excitement: number;
  startersA?: string[];
  startersB?: string[];
  startersPointsA?: Record<string, number>;
  startersPointsB?: Record<string, number>;
  series?: SeriesPoint[];
  boxscoreA?: BoxRow[];
  boxscoreB?: BoxRow[];
  excitementMetrics?: { leadChanges: number; avgDeltaPct: number };
  recap?: string;
  odds?: string[];
  narrativeRecap?: string;
}

/**
 * League with matchups for reports
 */
export interface ApiLeague {
  leagueId: string;
  leagueName: string;
  overview?: string;
  matchups: MatchupView[];
}

/**
 * Standings team information
 */
export interface StandingsTeam {
  rosterId: number;
  name: string;
  wins: number;
  losses: number;
  ties: number;
  pointsFor: number;
  pointsAgainst: number;
  divisionRank?: number;
  playoffSeed?: number;
}

/**
 * Division standings
 */
export interface StandingsDivision {
  divisionName: string;
  teams: StandingsTeam[];
}

/**
 * League standings
 */
export interface LeagueStandings {
  leagueId: string;
  leagueName: string;
  divisions: Record<string, StandingsTeam[]>;
}

/**
 * Power ranking for a team
 */
export interface PowerRanking {
  leagueId: string;
  rosterId: string;
  name: string;
  score: number;
  rank: number;
  change?: number; // Change from previous week
  trend?: 'up' | 'down' | 'stable';
}

/**
 * Upcoming matchup preview
 */
export interface UpcomingMatchup {
  week: number;
  leagueId: string;
  team1: {
    rosterId: number;
    name: string;
    record: string;
  };
  team2: {
    rosterId: number;
    name: string;
    record: string;
  };
  winProbability?: {
    team1: number;
    team2: number;
  };
  preview?: string;
}

/**
 * Weekly callout (praise/roast/prediction)
 */
export interface WeeklyCallout {
  type: 'praise' | 'roast' | 'upset' | 'blowout' | 'prediction';
  title: string;
  content: string;
  targetTeam?: string;
  targetManager?: string;
}

// ============================================================================
// Report Response Types
// ============================================================================

/**
 * Weekly report data structure
 */
export interface WeeklyReportData {
  season: string;
  week: number;
  myIntro?: string; // AI-generated intro (My voice)
  scribeIntro?: string; // AI-generated intro (Scribe voice)
  leagues: ApiLeague[];
  standings?: {
    leagueId: string;
    leagueName: string;
    divisions: Record<string, any[]>;
  }[];
  powerRankings?: {
    leagueId: string;
    rosterId: string;
    name: string;
    score: number;
  }[];
  upcoming?: Record<string, any[]>; // By league ID
  callouts?: Record<string, string>; // By manager ID or team name
  hallOfFame?: Array<{
    category: string;
    player: string;
    team: string;
    value: string;
    isNewThisWeek: boolean;
  }>;
  generatedAt?: string;
}

/**
 * API response wrapper for report data
 */
export interface ApiResponse {
  ok: boolean;
  data?: WeeklyReportData;
  error?: string;
  _meta?: {
    source: string;
    cached: boolean;
    responseTime: string;
  };
}

// ============================================================================
// Report Generation Types
// ============================================================================

/**
 * Configuration for report generation
 */
export interface ReportConfig {
  season: string;
  week: number;
  includeStandings: boolean;
  includePowerRankings: boolean;
  includeUpcoming: boolean;
  includeCallouts: boolean;
  includeHallOfFame: boolean;
  aiVoice: 'my' | 'scribe' | 'both' | 'none';
}

/**
 * Report section definition
 */
export interface ReportSection {
  id: string;
  title: string;
  order: number;
  visible: boolean;
  component: React.ComponentType<any>;
}

// ============================================================================
// Preview Types (for pre-week previews)
// ============================================================================

/**
 * Week preview data
 */
export interface WeekPreviewData {
  season: string;
  week: number;
  intro?: string;
  matchupPreviews: Array<{
    leagueId: string;
    matchupId: number;
    team1: {
      name: string;
      record: string;
      recentForm: string; // e.g., "W-L-W"
    };
    team2: {
      name: string;
      record: string;
      recentForm: string;
    };
    prediction: {
      favorite: 'team1' | 'team2' | 'even';
      confidence: 'high' | 'medium' | 'low';
      reasoning: string;
    };
  }>;
  keyMatchups: string[]; // Array of matchup descriptions
  sleepers: string[]; // Teams/players to watch
  predictions: string[]; // Bold predictions for the week
}

/**
 * Preview API response
 */
export interface PreviewApiResponse {
  ok: boolean;
  data?: WeekPreviewData;
  error?: string;
}
