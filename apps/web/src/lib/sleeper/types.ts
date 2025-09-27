/**
 * Sleeper API Types for Stats Hub
 * Strictly typed interfaces for API responses
 */

export interface NFLState {
  week: number;
  season: string;
  season_type: string;
  season_start_date: string;
  leg?: number;
  league_season?: string;
  display_week?: number;
}

export interface SleeperLeague {
  league_id: string;
  name: string;
  season: string;
  status: string;
  sport: string;
  settings: {
    max_keepers: number;
    draft_rounds: number;
    trade_deadline: number;
    waiver_type: number;
    waiver_day_of_week: number;
    start_week: number;
    playoff_week_start: number;
    num_teams: number;
  };
  roster_positions: string[];
  scoring_settings: Record<string, number>;
  total_rosters: number;
  draft_id: string;
}

export interface SleeperUser {
  user_id: string;
  username: string;
  display_name: string;
  avatar?: string;
  metadata?: {
    team_name?: string;
  };
}

export interface SleeperRoster {
  roster_id: number;
  owner_id: string;
  players: string[];
  starters: string[];
  settings: {
    wins: number;
    waiver_position: number;
    waiver_budget_used: number;
    total_moves: number;
    ties: number;
    ppts?: number;
    ppts_decimal?: number;
    losses: number;
    fpts_against?: number;
    fpts_against_decimal?: number;
    fpts?: number;
    fpts_decimal?: number;
  };
  metadata?: Record<string, any>;
}

export interface SleeperMatchup {
  roster_id: number;
  matchup_id: number;
  points: number;
  custom_points?: number;
  players: string[];
  starters: string[];
  players_points: Record<string, number>;
  starters_points?: number[];
}

export interface SleeperPlayer {
  player_id: string;
  first_name?: string;
  last_name?: string;
  full_name?: string;
  team?: string;
  position?: string;
  age?: number;
  years_exp?: number;
  status?: string;
  injury_status?: string;
  injury_body_part?: string;
  injury_notes?: string;
  fantasy_positions?: string[];
  active?: boolean;
}

// Simplified player index for Stats Hub (only what we need)
export type PlayerIndex = Record<
  string,
  {
    position?: string;
    full_name?: string;
    team?: string;
  }
>;
