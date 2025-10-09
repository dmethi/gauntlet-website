/**
 * Matchup and simulation types
 * Types for head-to-head matchups, win probabilities, and Monte Carlo simulations
 */

// ============================================================================
// Core Matchup Types
// ============================================================================

/**
 * Represents a team in a matchup with roster and projection information
 */
export interface MatchupTeam {
  rosterId: number;
  teamName: string;
  ownerName: string;
  points: number;
  projectedPoints?: number;
  roster: {
    id: number;
    players: string[];
    starters: string[];
    owner?: {
      id: string;
      username: string;
      displayName: string;
      avatar: string | null;
    };
    playerProjections?: Record<string, number>;
    starterProjections?: Record<string, number>;
  };
}

/**
 * Represents a complete matchup between two teams
 */
export interface MatchupData {
  matchupId: number;
  teams: [MatchupTeam, MatchupTeam];
  winner: MatchupTeam | null;
  isComplete: boolean;
}

/**
 * Player details for matchup display
 */
export interface PlayerDetails {
  id: string;
  name: string;
  position: string;
  team: string;
  points: number;
  projectedPoints: number;
  isStarter: boolean;
  status: 'active' | 'inactive' | 'questionable' | 'out' | 'ir';
}

/**
 * Team roster with full player details
 */
export interface TeamRoster {
  rosterId: number;
  teamName: string;
  ownerName: string;
  points: number;
  projectedPoints: number;
  starters: PlayerDetails[];
  bench: PlayerDetails[];
  remainingPlayers: number;
  playersActive: number;
  owner: {
    id: string;
    username: string;
    displayName: string;
    avatar: string | null;
  };
}

/**
 * Complete matchup details with full roster information
 */
export interface MatchupDetails {
  matchupId: number;
  week: number;
  leagueId: string;
  leagueName: string;
  teams: [TeamRoster, TeamRoster];
  winner: TeamRoster | null;
  isComplete: boolean;
  margin: number;
  gameStatus: 'pre_game' | 'in_progress' | 'final';
}

/**
 * All matchups for a specific league
 */
export interface LeagueMatchups {
  leagueId: string;
  leagueName: string;
  week?: number;
  matchups: MatchupData[];
}

// ============================================================================
// Simulation Types
// ============================================================================

/**
 * Score distribution statistics from Monte Carlo simulation
 */
export interface ScoreDistribution {
  mean: number;
  median: number;
  p10: number;
  p90: number;
}

/**
 * Component props for score box plot visualization
 */
export interface ScoreBoxPlotProps {
  scores: ScoreDistribution;
  maxScale: number;
  teamColor: string;
  width?: number;
  height?: number;
}

/**
 * Simulation data for a matchup including win probabilities and score distributions
 */
export interface SimulationData {
  team1WinPct: number;
  team2WinPct: number;
  medianMargin: number;
  team1Scores: ScoreDistribution;
  team2Scores: ScoreDistribution;
  impliedOdds: {
    team1MoneyLine: number;
    team2MoneyLine: number;
    spread: number;
    total: number;
  };
  teams: Array<{
    rosterId: number;
    teamName: string;
    ownerName: string;
    avatar?: string;
    players: Array<{
      id: string;
      name: string;
      position: string;
      projection: number;
    }>;
  }>;
}

/**
 * Simulation request parameters
 */
export interface SimulationRequest {
  leagueId: string;
  week: number;
  matchupId: number;
  iterations?: number;
  useVariance?: boolean;
}

/**
 * Simulation API response
 */
export interface SimulationResponse {
  ok: boolean;
  data?: SimulationData;
  error?: string;
  cached?: boolean;
  _meta?: {
    source: string;
    responseTime: string;
    iterations: number;
  };
}

// ============================================================================
// Win Probability & Odds Types
// ============================================================================

/**
 * Matchup odds data with win probabilities and betting lines
 */
export interface MatchupOddsData {
  team1WinPct: number;
  team2WinPct: number;
  impliedOdds: {
    team1MoneyLine: number;
    team2MoneyLine: number;
    spread: number;
    total: number;
  };
}

/**
 * Component props for matchup odds preview
 */
export interface MatchupOddsPreviewProps {
  leagueId: string;
  week: number;
  matchupId: number;
  teamAName: string;
  teamBName: string;
  className?: string;
}

/**
 * Team odds for league-wide analysis
 */
export interface TeamOdds {
  teamId: string;
  teamName: string;
  leagueId: string;
  leagueName: string;
  probability: number;
  odds: string; // American odds format (+150, -200, etc.)
  projectedRange: { p10: number; p50: number; p90: number };
  totalProjection: number;
  color: string; // RdYlGn color for heatmap
}

/**
 * Matchup odds for league-wide analysis
 */
export interface MatchupOdds {
  matchupId: number;
  team1: { name: string; leagueId: string; projection: number };
  team2: { name: string; leagueId: string; projection: number };
  projectedMargin: number;
  probability: number;
  odds: string;
  color: string;
}

/**
 * League-wide odds and probabilities
 */
export interface LeagueWideOddsType {
  week: number;
  highestScorer: TeamOdds[];
  lowestScorer: TeamOdds[];
  closestMatchup: MatchupOdds[];
  biggestBlowout: MatchupOdds[];
  highestScoringMatchup: MatchupOdds[];
  lowestScoringMatchup: MatchupOdds[];
  lastUpdated: string;
}

/**
 * Component props for league-wide odds display
 */
export interface LeagueWideOddsProps {
  week: number;
  className?: string;
}

/**
 * Odds preview for quick matchup overview
 */
export interface OddsPreview {
  matchupId: number;
  week: number;
  team1Name: string;
  team2Name: string;
  team1WinPct: number;
  team2WinPct: number;
  favorite: 'team1' | 'team2' | 'even';
  spread: number; // Projected point differential
}

// ============================================================================
// Live Matchup Updates
// ============================================================================

/**
 * Live matchup update with real-time scoring
 */
export interface LiveMatchupUpdate {
  matchupId: number;
  week: number;
  leagueId: string;
  timestamp: string;
  team1: {
    rosterId: number;
    currentScore: number;
    projectedFinalScore: number;
    liveWinProbability: number;
  };
  team2: {
    rosterId: number;
    currentScore: number;
    projectedFinalScore: number;
    liveWinProbability: number;
  };
  gamesInProgress: number;
  gamesCompleted: number;
  totalGames: number;
}
