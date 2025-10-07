/**
 * Shared API Types
 *
 * Type definitions for API responses and data structures used across the application.
 * Consolidates types from hooks.ts and other API consumers.
 */

import type { FantasyTeam, League } from '@gauntlet/types';

/**
 * Individual matchup result for a team in a specific week
 */
export interface Matchup {
  week: number;
  points: number;
  projected: number;
  result: 'W' | 'L' | 'T';
  matchupId?: number;
}

/**
 * Weekly performance metrics for a team
 */
export interface WeeklyMetric {
  week: number;
  totalPoints: number;
  expectedWins: number;
  luckRating: number;
  opponentPoints: number;
}

/**
 * Extended roster with matchup history and metrics
 */
export interface Roster extends FantasyTeam {
  matchups: Matchup[];
  weeklyMetrics: WeeklyMetric[];
  league: League;
  settings?: {
    division?: number;
    [key: string]: any;
  };
  owner: {
    displayName: string;
    username: string;
    avatar?: string;
    metadata: {
      team_name: string;
    };
  };
  coOwnerDetails?: Array<{
    displayName?: string;
    username?: string;
    avatar?: string;
  }>;
}

/**
 * Team statistics and standings
 */
export interface TeamStats {
  id: string;
  name: string;
  owner: string;
  wins: number;
  losses: number;
  totalPoints: number;
  expectedWins: number;
  luckRating: number;
  winPercentage: number;
  canonicalRank: number;
  division?: number | null;
}

/**
 * Extended league data with rosters and transactions
 */
export interface LeagueData extends League {
  playoff_week_start?: number;
  rosters: Roster[];
  transactions?: Array<{
    id: string;
    type: string;
    createdAt: string;
    rosterIds?: number[];
    adds?: unknown;
    drops?: unknown;
    settings?: {
      waiver_bid?: number;
    };
  }>;
}

/**
 * Generic weekly rollups API response
 */
export interface WeekRollupsResponse<T = unknown> {
  ok: boolean;
  data: T[];
  meta: unknown;
}

/**
 * Superlatives API response
 */
export interface SuperlativesResponse<T = unknown> {
  ok: boolean;
  data: T[];
  meta: unknown;
}

/**
 * Roster performance aggregate for a specific week
 */
export interface RosterWeekAggregate {
  leagueId: string;
  rosterId: number;
  week: number;
  wins: number;
  losses: number;
  ties: number;
  fpts: number;
  fpts_against: number;
  points: number;
  projectedPoints?: number | null;
  optimalPoints?: number | null;
  opponentRosterId?: number | null;
  opponentPoints?: number | null;
  won?: boolean | null;
  streak?: number | null;
  expectedWins?: number | null;
  luck?: number | null;
  positionalPoints?: Record<string, number> | null;
  opponentPositionalPoints?: Record<string, number> | null;
  powerRank?: number | null;
}

/**
 * Seasonal aggregates API response
 */
export interface SeasonalAggregatesResponse {
  ok: boolean;
  data: {
    rosterWeekAggregates: RosterWeekAggregate[];
    leagueWeekSummaries: Array<{
      week: number;
      averagePoints: number;
      medianPoints: number;
    }>;
  };
  meta: unknown;
}

/**
 * Roster details with players
 */
export interface RosterDetailsResponse {
  rosterId: number;
  starters: string[];
  players: Array<{ id: string; fullName: string; position: string; team?: string | null }>;
  projectedStarters: string[];
  projectedTotal: number;
  week: number;
}

/**
 * League transactions API response
 */
export interface LeagueTransactionsResponse {
  ok: boolean;
  data: Array<{
    id: string;
    type: string;
    created: number;
    roster_ids?: number[];
    rosterIds?: number[]; // camelCase alias for compatibility
    adds?: Record<string, number>;
    drops?: Record<string, number>;
    settings?: {
      waiver_bid?: number;
    };
  }>;
  meta: unknown;
}

/**
 * Playoff matchup structure
 */
export interface PlayoffMatchup {
  r: number; // round
  m: number; // matchup id
  t1: number; // team 1 roster id
  t2: number; // team 2 roster id
  w?: number; // winner roster id
  l?: number; // loser roster id
  t1_from?: { w?: number; l?: number }; // source matchup for team 1
  t2_from?: { w?: number; l?: number }; // source matchup for team 2
}

/**
 * Playoff bracket API response
 */
export interface PlayoffBracketResponse {
  winners_bracket?: PlayoffMatchup[];
  losers_bracket?: PlayoffMatchup[];
}

/**
 * Matchup team information
 */
export interface MatchupTeam {
  rosterId: number;
  owner: {
    id: string;
    username: string;
    displayName: string;
    avatar?: string;
  } | null;
  teamName?: string;
  points: number;
  customPoints?: number;
  starters: string[];
  startersPoints: number[] | Record<string, number>;
  players: string[];
  playersPoints: Record<string, number>;
  currentPoints?: number;
  projectedPoints?: number;
  rosterSettings?: Record<string, unknown>;
  rosterMetadata?: Record<string, unknown>;
}

/**
 * Complete matchup data
 */
export interface MatchupData {
  matchupId: number;
  teams: MatchupTeam[];
  summary?: {
    spread: number;
    favoredTeamId: number;
    pointsA?: number;
    pointsB?: number;
    winnerRosterId?: number;
    margin?: number;
  } | null;
}

/**
 * Matchups list API response
 */
export interface MatchupsResponse {
  matchups: MatchupData[];
  week: number;
  leagueId: string;
  totalMatchups: number;
}

/**
 * Single matchup API response
 */
export interface SingleMatchupResponse {
  matchup: MatchupData;
  week: number;
  leagueId: string;
}

/**
 * Player information
 */
export interface PlayerInfo {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  position: string;
  team: string | null;
  injuryStatus?: string | null;
}

/**
 * Players API response
 */
export interface PlayersResponse {
  players: Record<string, PlayerInfo>;
  found: number;
  requested: number;
}

/**
 * Player statistics for a specific week
 */
export interface PlayerStats {
  actual: Record<string, number> | null;
  projections: Record<string, number> | null;
  hasActual: boolean;
  hasProjections: boolean;
}

/**
 * Player stats API response
 */
export interface PlayerStatsResponse {
  playerStats: Record<string, PlayerStats>;
  week: number;
  season: string;
  requested: number;
  foundStats: number;
  foundProjections: number;
}
