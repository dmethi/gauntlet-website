import { Prisma } from '../../generated/prisma';

// Sleeper API Types
export interface SleeperUser {
  user_id: string;
  username: string;
  display_name: string;
  avatar: string | null;
  metadata: Record<string, unknown> | null;
  is_bot: boolean;
}

export interface SleeperLeague {
  league_id: string;
  name: string;
  season: string;
  season_type: string;
  status: string;
  sport: string;
  total_rosters: number;
  settings: Record<string, unknown>;
  scoring_settings: Record<string, unknown>;
  roster_positions: string[];
  metadata: Record<string, unknown> | null;
  previous_league_id: string | null;
  draft_id: string | null;
}

export interface SleeperRoster {
  roster_id: number;
  owner_id: string | null;
  league_id: string;
  players: string[];
  starters: string[];
  reserve: string[];
  metadata: Record<string, unknown> | null;
  settings: {
    wins: number;
    waiver_position: number;
    waiver_budget_used: number;
    total_moves: number;
    ties: number;
    losses: number;
    fpts: number;
    fpts_decimal: number;
    fpts_against: number;
    fpts_against_decimal: number;
  };
}

export interface SleeperMatchup {
  matchup_id: number;
  roster_id: number;
  players: string[];
  starters: string[];
  points: number;
  custom_points: number | null;
  players_points: Record<string, number>;
  starters_points: number[];
}

export interface SleeperPlayer {
  player_id: string;
  first_name: string;
  last_name: string;
  full_name: string;
  team: string | null;
  position: string;
  depth_chart_order: number | null;
  status: string | null;
  injury_status: string | null;
  weight: string | null;
  height: string | null;
  number: number | null;
  age: number | null;
  years_exp: number | null;
  hashtag: string | null;
}

export interface SleeperDraft {
  draft_id: string;
  type: string;
  status: string;
  season: string;
  settings: Record<string, unknown>;
  league_id: string;
  metadata: Record<string, unknown> | null;
  slot_to_roster_id: number[];
}

export interface SleeperDraftPick {
  pick_no: number;
  round: number;
  roster_id: number;
  player_id: string;
  picked_by: string | null;
  metadata: Record<string, unknown> | null;
  is_keeper: boolean;
  draft_id: string;
}

export interface SleeperTransaction {
  transaction_id: string;
  type: string;
  status: string;
  roster_ids: number[];
  adds: Record<string, string> | null;
  drops: Record<string, string> | null;
  draft_picks: Record<string, unknown> | null;
  waiver_budget: Record<string, unknown> | null;
  settings: Record<string, unknown> | null;
  leg: number;
  creator: string;
  created: number;
  consenter_ids: string[];
}

// Prisma Input Types
export type JsonInput = Prisma.InputJsonValue;

// Helper Types
export interface IngestionStats {
  startTime: Date;
  endTime?: Date;
  totalProcessed: number;
  successCount: number;
  errorCount: number;
  errors: Error[];
}

export interface IngestionOptions {
  leagueId: string;
  season: string;
  weeks?: number[];
  batchSize?: number;
  retryAttempts?: number;
  retryDelay?: number; // milliseconds
}

export interface IngestionContext {
  stats: IngestionStats;
  options: IngestionOptions;
  logger: Logger;
}

export interface Logger {
  info: (message: string, ...args: unknown[]) => void;
  error: (message: string, error?: Error, ...args: unknown[]) => void;
  warn: (message: string, ...args: unknown[]) => void;
  debug: (message: string, ...args: unknown[]) => void;
}
