/**
 * Sleeper API Type Definitions
 *
 * Comprehensive type definitions for the Sleeper API.
 * @see https://docs.sleeper.com/
 *
 * These types represent the canonical structure of Sleeper API responses
 * and should be used consistently across all apps (web, server, sim-engine).
 */

// ============================================================================
// Core API Types
// ============================================================================

/**
 * NFL State - Current week/season information
 * @see https://docs.sleeper.com/#get-nfl-state
 */
export interface NFLState {
  week: number;
  season: string;
  season_type: string; // 'regular' | 'pre' | 'post'
  season_start_date: string;
  leg?: number;
  league_season?: string;
  display_week?: number;
}

/**
 * Sleeper League
 * @see https://docs.sleeper.com/#getting-a-specific-league
 */
export interface SleeperLeague {
  league_id: string;
  name: string;
  season: string;
  status: string; // 'pre_draft' | 'drafting' | 'in_season' | 'complete'
  sport: string; // 'nfl'
  season_type: string; // 'regular'
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
  avatar?: string;
  previous_league_id?: string;
}

/**
 * Sleeper User
 * @see https://docs.sleeper.com/#user
 */
export interface SleeperUser {
  user_id: string;
  username: string;
  display_name: string;
  avatar?: string;
  metadata?: {
    team_name?: string;
    [key: string]: any;
  };
  is_owner?: boolean; // Present in league user responses (commissioner flag)
}

/**
 * Sleeper Roster
 * @see https://docs.sleeper.com/#getting-rosters-in-a-league
 */
export interface SleeperRoster {
  roster_id: number;
  owner_id: string;
  players: string[]; // Player IDs
  starters: string[]; // Player IDs in starting lineup
  reserve?: string[]; // Player IDs on reserve/IR
  taxi?: string[]; // Player IDs on taxi squad
  settings: {
    wins: number;
    losses: number;
    ties: number;
    waiver_position: number;
    waiver_budget_used: number;
    total_moves: number;
    fpts?: number; // Points for
    fpts_decimal?: number;
    fpts_against?: number; // Points against
    fpts_against_decimal?: number;
    ppts?: number; // Potential points
    ppts_decimal?: number;
  };
  metadata?: Record<string, any>;
  league_id?: string; // Not in API response, but useful for multi-league contexts
  co_owners?: string[]; // User IDs of co-owners
}

/**
 * Sleeper Matchup
 * @see https://docs.sleeper.com/#getting-matchups-in-a-league
 */
export interface SleeperMatchup {
  roster_id: number;
  matchup_id: number; // 1-6 typically, groups two teams
  points: number;
  custom_points?: number; // If custom scoring is used
  players: string[]; // All player IDs on roster
  starters: string[]; // Player IDs in starting lineup
  players_points: Record<string, number>; // Player ID -> points scored
  starters_points?: number[]; // Array of points for each starter (deprecated)
}

/**
 * Sleeper Player
 * @see https://docs.sleeper.com/#fetch-all-players
 */
export interface SleeperPlayer {
  player_id: string;
  first_name?: string;
  last_name?: string;
  full_name?: string;
  team?: string; // NFL team abbreviation (e.g., 'KC', 'BUF')
  position?: string; // 'QB' | 'RB' | 'WR' | 'TE' | 'K' | 'DEF'
  age?: number;
  years_exp?: number;
  status?: string; // 'Active' | 'Inactive' | 'Injured Reserve'
  injury_status?: string; // 'Out' | 'Questionable' | 'Doubtful' | 'Probable' | 'IR'
  injury_body_part?: string;
  injury_notes?: string;
  injury_start_date?: string | null;
  fantasy_positions?: string[];
  active?: boolean;

  // Additional fields from Sleeper API
  number?: number; // Jersey number
  college?: string;
  height?: string;
  weight?: string;
  depth_chart_position?: number;
  depth_chart_order?: number;
  search_rank?: number;
  birth_country?: string;
  hashtag?: string;

  // External IDs
  espn_id?: string | number;
  yahoo_id?: string | number;
  fantasy_data_id?: number;
  rotowire_id?: number | null;
  rotoworld_id?: number;
  sportradar_id?: string;
  stats_id?: string | number;

  // Search fields
  search_first_name?: string;
  search_last_name?: string;
  search_full_name?: string;
}

/**
 * Player Index - Simplified map for quick lookups
 * Used when you only need basic player info
 */
export type PlayerIndex = Record<
  string,
  {
    position?: string;
    full_name?: string;
    team?: string;
  }
>;

/**
 * Draft Object
 * @see https://docs.sleeper.com/#get-a-specific-draft
 */
export interface SleeperDraft {
  draft_id: string;
  league_id: string;
  status: string; // 'pre_draft' | 'drafting' | 'complete'
  type: string; // 'snake' | 'linear' | 'auction'
  settings: {
    slots_wr: number;
    slots_rb: number;
    slots_qb: number;
    slots_te: number;
    slots_k: number;
    slots_def: number;
    slots_bn: number;
    rounds: number;
    pick_timer: number;
  };
  season: string;
  season_type: string;
  start_time?: number;
  draft_order?: Record<string, number> | null; // user_id -> draft slot
  slot_to_roster_id?: Record<string, number>; // draft slot -> roster_id
  metadata?: Record<string, any>;
}

/**
 * Draft Pick
 * @see https://docs.sleeper.com/#get-all-picks-in-a-draft
 */
export interface SleeperDraftPick {
  player_id: string;
  picked_by: string; // user_id
  roster_id: number;
  round: number;
  draft_slot: number;
  pick_no: number;
  metadata: {
    team?: string;
    status?: string;
    sport?: string;
    position?: string;
    player_id?: string;
    number?: string;
    news_updated?: string;
    last_name?: string;
    injury_status?: string;
    first_name?: string;
    [key: string]: any;
  };
  is_keeper?: boolean | null;
  draft_id: string;
}

/**
 * Traded Pick
 * @see https://docs.sleeper.com/#get-traded-picks
 */
export interface SleeperTradedPick {
  season: string;
  round: number;
  roster_id: number; // Original owner
  previous_owner_id: number;
  owner_id: number; // Current owner
}

/**
 * Transaction
 * @see https://docs.sleeper.com/#get-transactions
 */
export interface SleeperTransaction {
  transaction_id: string;
  type: string; // 'waiver' | 'trade' | 'free_agent'
  status: string; // 'complete' | 'pending'
  leg: number;
  settings?: {
    waiver_bid?: number;
    seq?: number;
  };
  roster_ids: number[];
  consenter_ids?: number[];
  creator?: string; // user_id
  created?: number; // timestamp
  status_updated?: number; // timestamp
  adds?: Record<string, number>; // player_id -> roster_id
  drops?: Record<string, number>; // player_id -> roster_id
  draft_picks?: Array<{
    season: string;
    round: number;
    roster_id: number;
    previous_owner_id: number;
    owner_id: number;
  }>;
  waiver_budget?: Array<{
    sender: number; // roster_id
    receiver: number; // roster_id
    amount: number;
  }>;
  metadata?: Record<string, any>;
}

/**
 * Playoff Bracket
 * @see https://docs.sleeper.com/#get-playoff-bracket
 */
export interface SleeperPlayoffMatchup {
  round: number; // 1 = first round, 2 = semifinals, etc.
  matchup_id: number;
  team_1_roster_id: number;
  team_2_roster_id?: number; // May be null if bye week
  team_1_points?: number;
  team_2_points?: number;
  winner?: number; // roster_id of winner
  loser?: number; // roster_id of loser
}

// ============================================================================
// Player Stats & Projections
// ============================================================================

/**
 * Player Stats - Comprehensive stats from Sleeper
 * @see https://docs.sleeper.com/ (stats endpoint)
 *
 * Note: Sleeper provides weekly stats and projections for players.
 * Not all fields are present for all players (position-dependent).
 */
export interface PlayerStats {
  // Fantasy points (scoring format dependent)
  pts_ppr?: number;
  pts_half_ppr?: number;
  pts_std?: number;

  // Passing stats
  pass_att?: number;
  pass_cmp?: number;
  pass_yd?: number;
  pass_td?: number;
  pass_int?: number;
  pass_sack?: number;
  pass_2pt?: number;
  pass_fd?: number; // First downs
  pass_cmp_40p?: number; // Completions 40+ yards
  pass_td_40p?: number; // TDs 40+ yards
  pass_td_50p?: number; // TDs 50+ yards
  pass_yd_300p?: number; // 300+ yard games
  pass_yd_400p?: number; // 400+ yard games
  pass_rtg?: number; // Passer rating

  // Rushing stats
  rush_att?: number;
  rush_yd?: number;
  rush_td?: number;
  rush_2pt?: number;
  rush_fd?: number; // First downs
  rush_40p?: number; // Rushes 40+ yards
  rush_td_40p?: number; // Rush TDs 40+ yards
  rush_td_50p?: number; // Rush TDs 50+ yards
  rush_yd_100p?: number; // 100+ yard games
  rush_yd_200p?: number; // 200+ yard games

  // Receiving stats
  rec?: number; // Receptions
  rec_tgt?: number; // Targets
  rec_yd?: number;
  rec_td?: number;
  rec_2pt?: number;
  rec_fd?: number; // First downs
  rec_40p?: number; // Receptions 40+ yards
  rec_td_40p?: number; // Rec TDs 40+ yards
  rec_td_50p?: number; // Rec TDs 50+ yards
  rec_yd_100p?: number; // 100+ yard games
  rec_yd_200p?: number; // 200+ yard games

  // Bonus stats
  bonus_rec_rb?: number; // RB reception bonus
  bonus_rec_wr?: number; // WR reception bonus
  bonus_rec_te?: number; // TE reception bonus
  bonus_rush_yd_100?: number;
  bonus_rush_yd_200?: number;
  bonus_rec_yd_100?: number;
  bonus_rec_yd_200?: number;
  bonus_pass_yd_300?: number;
  bonus_pass_yd_400?: number;

  // Fumbles
  fum?: number; // Fumbles
  fum_lost?: number; // Fumbles lost
  fum_rec?: number; // Fumbles recovered
  fum_rec_td?: number; // Fumble recovery TD

  // Special teams
  st_td?: number; // Special teams TD
  st_ff?: number; // Forced fumble
  st_fum_rec?: number; // Fumble recovery
  st_tkl_solo?: number; // Solo tackles

  // Kicking
  fgm?: number; // Field goals made
  fga?: number; // Field goals attempted
  fgm_0_19?: number;
  fgm_20_29?: number;
  fgm_30_39?: number;
  fgm_40_49?: number;
  fgm_50p?: number; // 50+ yards
  fgmiss?: number; // Missed field goals
  xpm?: number; // Extra points made
  xpa?: number; // Extra points attempted
  xpmiss?: number; // Missed extra points

  // Defense/Special Teams
  def_st_td?: number; // Defensive/ST touchdown
  def_st_ff?: number; // Forced fumble
  def_st_fum_rec?: number; // Fumble recovery
  def_st_tkl_solo?: number; // Solo tackle
  def_st_tkl_ast?: number; // Assisted tackle
  def_st_sack?: number; // Sack
  def_st_int?: number; // Interception
  def_st_pass_def?: number; // Pass defended
  def_st_blk_kick?: number; // Blocked kick
  def_st_safety?: number; // Safety
  def_st_td_ret?: number; // Return TD

  // Points allowed (DEF only)
  pts_allow?: number;
  pts_allow_0?: number;
  pts_allow_1_6?: number;
  pts_allow_7_13?: number;
  pts_allow_14_20?: number;
  pts_allow_21_27?: number;
  pts_allow_28_34?: number;
  pts_allow_35p?: number;

  // Yards allowed (DEF only)
  yds_allow?: number;

  // IDP (Individual Defensive Player) stats
  idp_tkl_solo?: number;
  idp_tkl_ast?: number;
  idp_tkl_loss?: number;
  idp_qb_hit?: number;
  idp_sack?: number;
  idp_sack_yd?: number;
  idp_pass_def?: number;
  idp_int?: number;
  idp_int_yd?: number;
  idp_int_td?: number;
  idp_fum_force?: number;
  idp_fum_rec?: number;
  idp_fum_rec_yd?: number;
  idp_fum_rec_td?: number;
  idp_safety?: number;
  idp_blk_kick?: number;
  idp_td?: number;

  // Game metadata
  gp?: number; // Games played
  gs?: number; // Games started
  tm_off_snp?: number; // Team offensive snaps
  tm_def_snp?: number; // Team defensive snaps
  tm_st_snp?: number; // Team special teams snaps
  off_snp?: number; // Offensive snaps
  def_snp?: number; // Defensive snaps
  st_snp?: number; // Special teams snaps

  // Ownership/roster metadata
  pos_rank?: number; // Position rank for the week
  pos_rank_ppr?: number;
  pos_rank_half_ppr?: number;

  // Additional metadata
  date?: string; // Date of stats
  week?: number; // Week number
  season?: string; // Season year
  opponent?: string; // Opponent team abbreviation
  game_id?: string;
}

/**
 * Trending Player
 * @see https://docs.sleeper.com/#trending-players
 */
export interface TrendingPlayer {
  player_id: string;
  count: number; // Number of adds/drops in lookback period
}

// ============================================================================
// Multi-League Composite Keys (Gauntlet-Specific)
// ============================================================================

/**
 * Composite key for uniquely identifying teams across multiple leagues
 * Format: `${leagueId}-${rosterId}`
 */
export type TeamKey = `${string}-${number}`;

/**
 * Composite key for uniquely identifying matchups across multiple leagues
 * Format: `${leagueId}-${week}-${matchupId}`
 */
export type MatchupKey = `${string}-${number}-${number}`;

/**
 * Composite key for player-week combinations
 * Format: `${week}:${playerId}`
 */
export type PlayerWeekKey = `${number}:${string}`;

// ============================================================================
// Utility Types
// ============================================================================

/**
 * League status enum
 */
export type LeagueStatus = 'pre_draft' | 'drafting' | 'in_season' | 'complete';

/**
 * Transaction types
 */
export type TransactionType = 'waiver' | 'trade' | 'free_agent';

/**
 * Transaction status
 */
export type TransactionStatus = 'complete' | 'pending';

/**
 * NFL positions
 */
export type NFLPosition = 'QB' | 'RB' | 'WR' | 'TE' | 'K' | 'DEF';

/**
 * Roster positions (including FLEX, SUPER_FLEX, etc.)
 */
export type RosterPosition =
  | NFLPosition
  | 'FLEX' // RB/WR/TE
  | 'SUPER_FLEX' // QB/RB/WR/TE
  | 'REC_FLEX' // WR/TE
  | 'IDP_FLEX' // Individual defensive player
  | 'BN' // Bench
  | 'IR' // Injured Reserve
  | 'TAXI'; // Taxi squad

/**
 * Season type
 */
export type SeasonType = 'regular' | 'pre' | 'post';
