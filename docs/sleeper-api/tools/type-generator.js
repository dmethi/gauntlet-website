#!/usr/bin/env node

/**
 * TypeScript Type Generator for Sleeper API
 *
 * Generates TypeScript interfaces and types from API response schemas
 * and actual API responses to create a comprehensive type system.
 */

const fs = require('fs').promises;
const path = require('path');

// Configuration
const CONFIG = {
  inputDir: '../testing',
  outputDir: '../schemas',
  typeOutputFile: 'sleeper-api-types.ts',
  jsonSchemaOutputFile: 'sleeper-api-schemas.json',
};

// TypeScript type mapping
const TYPE_MAPPING = {
  string: 'string',
  number: 'number',
  boolean: 'boolean',
  object: 'object',
  array: 'Array',
  null: 'null',
  undefined: 'undefined',
};

// Utility functions
function toCamelCase(str) {
  return str.replace(/_([a-z])/g, (match, letter) => letter.toUpperCase());
}

function toPascalCase(str) {
  return str.charAt(0).toUpperCase() + toCamelCase(str.slice(1));
}

function sanitizeKey(key) {
  // Handle numeric keys or keys with special characters
  if (/^\d/.test(key) || /[^a-zA-Z0-9_]/.test(key)) {
    return `"${key}"`;
  }
  return key;
}

// Generate TypeScript interface from object
function generateInterface(name, obj, depth = 0) {
  if (depth > 5) return 'any'; // Prevent infinite recursion

  if (obj === null || obj === undefined) {
    return 'null';
  }

  if (Array.isArray(obj)) {
    if (obj.length === 0) return 'any[]';
    const itemType = generateInterface(`${name}Item`, obj[0], depth + 1);
    return `${itemType}[]`;
  }

  if (typeof obj !== 'object') {
    return TYPE_MAPPING[typeof obj] || 'any';
  }

  const properties = [];
  const keys = Object.keys(obj);

  for (const key of keys) {
    const value = obj[key];
    const sanitizedKey = sanitizeKey(key);
    const camelKey = toCamelCase(key);

    let type;
    if (value === null) {
      type = 'null';
    } else if (Array.isArray(value)) {
      if (value.length === 0) {
        type = 'any[]';
      } else {
        const itemType = generateInterface(`${name}${toPascalCase(key)}`, value[0], depth + 1);
        type = `${itemType}[]`;
      }
    } else if (typeof value === 'object') {
      type = generateInterface(`${name}${toPascalCase(key)}`, value, depth + 1);
    } else {
      type = TYPE_MAPPING[typeof value] || 'any';
    }

    // Add optional modifier for potentially missing properties
    const optional = Math.random() > 0.8 ? '?' : ''; // Simulate optional fields
    properties.push(`  ${sanitizedKey}${optional}: ${type};`);
  }

  if (depth === 0) {
    return `export interface ${name} {\n${properties.join('\n')}\n}`;
  } else {
    return `{\n${properties.join('\n')}\n}`;
  }
}

// Generate comprehensive stats interface
function generateStatsInterface(statsData) {
  const allStats = new Set();

  // Collect all possible stat keys
  Object.values(statsData).forEach(playerStats => {
    if (typeof playerStats === 'object' && playerStats !== null) {
      Object.keys(playerStats).forEach(stat => allStats.add(stat));
    }
  });

  const properties = Array.from(allStats)
    .sort()
    .map(stat => {
      // Determine type based on common patterns
      let type = 'number';

      if (stat.includes('pct')) {
        type = 'number'; // Percentage
      } else if (stat.includes('rank')) {
        type = 'number'; // Ranking
      } else if (stat.startsWith('pts_')) {
        type = 'number'; // Fantasy points
      } else if (stat === 'gp' || stat === 'gs' || stat === 'gms_active') {
        type = 'number'; // Games
      }

      return `  ${sanitizeKey(stat)}?: ${type};`;
    });

  return `export interface PlayerStats {\n${properties.join('\n')}\n}`;
}

// Generate projections interface
function generateProjectionsInterface(projectionsData) {
  const allProjections = new Set();

  // Collect all possible projection keys
  Object.values(projectionsData).forEach(playerProj => {
    if (typeof playerProj === 'object' && playerProj !== null) {
      Object.keys(playerProj).forEach(proj => allProjections.add(proj));
    }
  });

  const properties = Array.from(allProjections)
    .sort()
    .map(proj => {
      let type = 'number';

      // Special handling for ADP fields
      if (proj.includes('adp')) {
        type = 'number';
      }

      return `  ${sanitizeKey(proj)}?: ${type};`;
    });

  return `export interface PlayerProjections {\n${properties.join('\n')}\n}`;
}

// Generate league-related interfaces
function generateLeagueInterfaces() {
  return `
export interface League {
  total_rosters: number;
  status: 'pre_draft' | 'drafting' | 'in_season' | 'complete';
  sport: 'nfl';
  settings: LeagueSettings;
  season_type: 'regular' | 'pre' | 'post';
  season: string;
  scoring_settings: ScoringSettings;
  roster_positions: string[];
  previous_league_id?: string;
  name: string;
  league_id: string;
  draft_id: string;
  avatar?: string;
}

export interface LeagueSettings {
  max_keepers?: number;
  draft_rounds?: number;
  trade_deadline?: number;
  reserve_allow_cov?: number;
  reserve_slots?: number;
  leg?: number;
  offseason_adds?: number;
  bench_lock?: number;
  reserve_allow_sus?: number;
  reserve_allow_out?: number;
  playoff_round_type?: number;
  daily_waivers_last_ran?: number;
  taxi_deadline?: number;
  reserve_allow_dnr?: number;
  commissioner_direct_invite?: number;
  reserve_allow_doubtful?: number;
  waiver_type?: number;
  taxi_years?: number;
  trade_review_days?: number;
  league_average_match?: number;
  disable_trades?: number;
  taxi_allow_vets?: number;
  best_ball?: number;
  last_report?: number;
  disable_adds?: number;
  taxi_slots?: number;
  playoff_week_start?: number;
  daily_waivers_days?: number;
  daily_waivers_hour?: number;
  waiver_clear_days?: number;
  start_week?: number;
  playoff_teams?: number;
  num_teams?: number;
  reserve_allow_na?: number;
  pick_trading?: number;
  max_subs?: number;
  daily_waivers?: number;
  playoff_type?: number;
  squads?: number;
  trade_deadline_pct?: number;
  waiver_bid_min?: number;
  reserve_allow_cov_2?: number;
  waiver_budget?: number;
  reserve_allow_cov_1?: number;
}

export interface ScoringSettings {
  pass_yd: number;
  pass_td: number;
  pass_int: number;
  pass_2pt: number;
  rush_yd: number;
  rush_td: number;
  rush_2pt: number;
  rec: number;
  rec_yd: number;
  rec_td: number;
  rec_2pt: number;
  fum_lost: number;
  fgm: number;
  fgm_0_19: number;
  fgm_20_29: number;
  fgm_30_39: number;
  fgm_40_49: number;
  fgm_50p: number;
  fgmiss: number;
  xpm: number;
  xpmiss: number;
  def_st_td: number;
  def_st_ff: number;
  def_st_fum_rec: number;
  def_st_tkl_solo: number;
  def_pr_td: number;
  def_kr_td: number;
  def_int: number;
  def_int_td: number;
  def_fum_rec: number;
  def_sack: number;
  def_safe: number;
  def_blk_kick: number;
  def_3_and_out: number;
  def_4_and_stop: number;
  pts_allow_0: number;
  pts_allow_1_6: number;
  pts_allow_7_13: number;
  pts_allow_14_20: number;
  pts_allow_21_27: number;
  pts_allow_28_34: number;
  pts_allow_35p: number;
  yds_allow_0_100: number;
  yds_allow_100_199: number;
  yds_allow_200_299: number;
  yds_allow_300_349: number;
  yds_allow_350_399: number;
  yds_allow_400_449: number;
  yds_allow_450_499: number;
  yds_allow_500_549: number;
  yds_allow_550p: number;
}

export interface Roster {
  starters: string[];
  settings: RosterSettings;
  roster_id: number;
  reserve: string[];
  players: string[];
  owner_id: string;
  league_id: string;
  co_owners?: string[];
  metadata?: {
    streak?: string;
    record?: string;
  };
}

export interface RosterSettings {
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
  ppts?: number;
  ppts_decimal?: number;
}

export interface User {
  user_id: string;
  username: string;
  display_name: string;
  avatar?: string;
  metadata?: {
    team_name?: string;
    mention_pn?: string;
    allow_sms?: string;
    allow_pn?: string;
    phone?: string;
    email?: string;
  };
  is_owner?: boolean;
}

export interface Matchup {
  starters: string[];
  roster_id: number;
  players: string[];
  matchup_id: number;
  points: number;
  custom_points?: number;
  players_points?: { [playerId: string]: number };
  starters_points?: number[];
}

export interface Transaction {
  type: 'trade' | 'waiver' | 'free_agent';
  transaction_id: string;
  status: 'complete' | 'processing';
  settings: TransactionSettings;
  roster_ids: number[];
  metadata?: any;
  leg: number;
  drops?: { [rosterId: string]: string[] };
  draft_picks?: DraftPick[];
  creator: string;
  created: number;
  adds?: { [rosterId: string]: string[] };
  consenter_ids?: string[];
  waiver_budget?: WaiverBudget[];
}

export interface TransactionSettings {
  waiver_bid?: number;
  seq?: number;
}

export interface DraftPick {
  season: string;
  round: number;
  roster_id: number;
  previous_owner_id: number;
  owner_id: number;
}

export interface WaiverBudget {
  sender: number;
  receiver: number;
  amount: number;
}`;
}

// Generate player and draft interfaces
function generatePlayerInterfaces() {
  return `
export interface Player {
  player_id: string;
  hashtag: string;
  depth_chart_position?: number;
  status: 'Active' | 'Inactive' | 'PUP' | 'Suspended' | 'Reserve/COVID-19' | 'Injured Reserve';
  sport: 'nfl';
  fantasy_positions: Position[];
  number: number;
  search_last_name: string;
  injury_start_date?: string;
  weight: string;
  position: Position;
  practice_participation?: string;
  sportradar_id: string;
  team: string;
  last_name: string;
  college: string;
  fantasy_data_id: number;
  injury_status?: string;
  height: string;
  search_full_name: string;
  age: number;
  stats_id: string;
  birth_country: string;
  espn_id: string;
  search_rank: number;
  first_name: string;
  depth_chart_order?: number;
  years_exp: number;
  rotowire_id?: number;
  rotoworld_id?: number;
  search_first_name: string;
  yahoo_id?: number;
  injury_body_part?: string;
  injury_notes?: string;
  news_updated?: number;
  birth_date?: string;
  birth_city?: string;
  birth_state?: string;
  high_school?: string;
}

export type Position = 'QB' | 'RB' | 'WR' | 'TE' | 'K' | 'DEF' | 'DL' | 'LB' | 'DB';

export interface TrendingPlayer {
  player_id: string;
  count: number;
}

export interface Draft {
  type: 'snake' | 'auction' | 'linear';
  status: 'pre_draft' | 'drafting' | 'complete';
  start_time: number;
  sport: 'nfl';
  settings: DraftSettings;
  season_type: 'regular' | 'pre' | 'post';
  season: string;
  metadata: DraftMetadata;
  league_id: string;
  last_picked: number;
  draft_order?: { [rosterId: string]: number };
  slot_to_roster_id?: { [slot: string]: number };
  draft_id: string;
  creators?: string[];
}

export interface DraftSettings {
  teams: number;
  alpha_sort: number;
  reversal_round: number;
  rounds: number;
  nomination_timer: number;
  pick_timer: number;
  autostart: number;
  cpu_autopick: number;
  enforce_position_limits: number;
}

export interface DraftMetadata {
  scoring_type: 'ppr' | 'half_ppr' | 'std';
  name: string;
  description: string;
}

export interface DraftPick {
  player_id: string;
  picked_by: string;
  roster_id: number;
  round: number;
  draft_slot: number;
  pick_no: number;
  metadata: {
    team: string;
    status: string;
    sport: 'nfl';
    position: Position;
    player_id: string;
    number: string;
    news_updated: string;
    last_name: string;
    injury_status: string;
    first_name: string;
  };
  is_keeper?: boolean;
  draft_id: string;
}

export interface NFLState {
  week: number;
  season_type: 'regular' | 'pre' | 'post' | 'off';
  season_start_week: number;
  season: string;
  previous_season: string;
  leg: number;
  league_season: string;
  league_create_season: string;
  display_week: number;
}`;
}

// Generate API response wrapper types
function generateApiTypes() {
  return `
// API Response Types
export type StatsResponse = { [playerId: string]: PlayerStats };
export type ProjectionsResponse = { [playerId: string]: PlayerProjections };
export type PlayersResponse = { [playerId: string]: Player };

// Generic API response wrapper
export interface ApiResponse<T> {
  data: T;
  success: boolean;
  error?: string;
}

// Common API parameter types
export interface StatsParams {
  seasonType: 'regular' | 'pre' | 'post';
  season: number;
  week?: number;
}

export interface ProjectionsParams {
  seasonType: 'regular' | 'pre' | 'post';
  season: number;
  week?: number;
}

// Utility types
export type PlayerId = string;
export type UserId = string;
export type LeagueId = string;
export type DraftId = string;
export type RosterId = number;
export type TransactionId = string;

// Union types for enums
export type LeagueStatus = 'pre_draft' | 'drafting' | 'in_season' | 'complete';
export type SeasonType = 'regular' | 'pre' | 'post';
export type Sport = 'nfl';
export type TransactionType = 'trade' | 'waiver' | 'free_agent';
export type TransactionStatus = 'complete' | 'processing';
export type DraftType = 'snake' | 'auction' | 'linear';
export type DraftStatus = 'pre_draft' | 'drafting' | 'complete';
export type PlayerStatus = 'Active' | 'Inactive' | 'PUP' | 'Suspended' | 'Reserve/COVID-19' | 'Injured Reserve';

// Fantasy scoring types
export interface FantasyPoints {
  ppr: number;
  halfPpr: number;
  standard: number;
}

// Advanced analytics types
export interface PlayerAnalytics {
  playerId: PlayerId;
  week: number;
  season: number;
  projectedPoints: FantasyPoints;
  actualPoints?: FantasyPoints;
  variance?: number;
  consistency?: number;
  ceiling?: number;
  floor?: number;
}`;
}

// Main function to generate all types
async function generateAllTypes(testResults) {
  let output = `/**
 * Sleeper API TypeScript Definitions
 * 
 * Auto-generated from API responses and schemas
 * Generated on: ${new Date().toISOString()}
 */

`;

  // Add imports if needed
  output += `// Core API types\n`;

  // Generate stats interface if we have stats data
  if (testResults && testResults.endpoints) {
    const statsEndpoints = Object.entries(testResults.endpoints).filter(
      ([key]) => key.includes('stats') && !key.includes('projections')
    );

    if (statsEndpoints.length > 0) {
      const [, firstStatsResult] = statsEndpoints[0];
      if (firstStatsResult.success && firstStatsResult.data) {
        output += generateStatsInterface(firstStatsResult.data) + '\n\n';
      }
    }

    // Generate projections interface if we have projection data
    const projectionEndpoints = Object.entries(testResults.endpoints).filter(([key]) =>
      key.includes('projections')
    );

    if (projectionEndpoints.length > 0) {
      const [, firstProjResult] = projectionEndpoints[0];
      if (firstProjResult.success && firstProjResult.data) {
        output += generateProjectionsInterface(firstProjResult.data) + '\n\n';
      }
    }
  }

  // Add league-related interfaces
  output += generateLeagueInterfaces() + '\n\n';

  // Add player and draft interfaces
  output += generatePlayerInterfaces() + '\n\n';

  // Add API wrapper types
  output += generateApiTypes() + '\n\n';

  // Add utility functions
  output += `
// Utility functions for type checking
export function isPlayerStats(obj: any): obj is PlayerStats {
  return typeof obj === 'object' && obj !== null;
}

export function isPlayerProjections(obj: any): obj is PlayerProjections {
  return typeof obj === 'object' && obj !== null;
}

export function isValidPlayerId(id: string): id is PlayerId {
  return typeof id === 'string' && id.length > 0 && !id.startsWith('TEAM_');
}

export function isTeamId(id: string): boolean {
  return typeof id === 'string' && id.startsWith('TEAM_');
}

// Default values
export const DEFAULT_FANTASY_POINTS: FantasyPoints = {
  ppr: 0,
  halfPpr: 0,
  standard: 0
};

export const VALID_POSITIONS: Position[] = ['QB', 'RB', 'WR', 'TE', 'K', 'DEF', 'DL', 'LB', 'DB'];
export const VALID_SEASON_TYPES: SeasonType[] = ['regular', 'pre', 'post'];
export const CURRENT_SEASON = ${new Date().getFullYear()};
`;

  return output;
}

// Load test results from file
async function loadTestResults(filename) {
  try {
    const filePath = path.join(__dirname, CONFIG.inputDir, filename);
    const data = await fs.readFile(filePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.warn(`Could not load test results from ${filename}:`, error.message);
    return null;
  }
}

// Save generated types
async function saveTypes(types) {
  const outputDir = path.join(__dirname, CONFIG.outputDir);

  try {
    await fs.mkdir(outputDir, { recursive: true });

    const outputPath = path.join(outputDir, CONFIG.typeOutputFile);
    await fs.writeFile(outputPath, types);

    console.log(`TypeScript types saved to: ${outputPath}`);
    console.log(`Generated ${types.split('\n').length} lines of TypeScript definitions`);
  } catch (error) {
    console.error('Error saving types:', error);
  }
}

// Main execution
async function main() {
  console.log('Generating TypeScript types for Sleeper API...');

  // Try to load the most recent test results
  const testResults = await loadTestResults('results.json');

  // Generate types
  const types = await generateAllTypes(testResults);

  // Save to file
  await saveTypes(types);

  console.log('Type generation complete!');
}

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}

module.exports = {
  generateAllTypes,
  generateStatsInterface,
  generateProjectionsInterface,
  generateLeagueInterfaces,
  generatePlayerInterfaces,
  generateApiTypes,
  CONFIG,
};
