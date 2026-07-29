/**
 * Hall of Fame types
 * Types for legendary performances and epic fails leaderboards
 */

// ============================================================================
// Core Record Types
// ============================================================================

export interface HallOfFameRecord {
  category: string;
  categoryDisplay: string;
  description: string;
  value: number;
  teamName: string;
  teamId: number;
  leagueId: string;
  leagueName: string;
  week?: number;
  season: string;
  opponent?: string;
  opponentId?: number;
  contextData?: Record<string, any>;
  scope?: 'weekly' | 'rolling' | 'seasonal' | 'playoff' | 'alltime';
}

export interface HallOfFameCategory {
  id: string;
  name: string;
  description: string;
  group: string;
  type: 'highest' | 'lowest' | 'both';
  calculateValue: (data: any, allData?: any[]) => number | null;
  formatValue: (value: number) => string;
  scope?: 'weekly' | 'rolling' | 'seasonal' | 'playoff' | 'alltime';
}

export interface HallOfFamePlayerMetadata {
  position: string;
  full_name?: string;
  team?: string;
}

export interface ProcessedMatchup {
  rosterId: number;
  teamName: string;
  leagueId: string;
  leagueName: string;
  week: number;
  season: string;
  points: number;
  projectedPoints?: number;
  opponentId?: number;
  opponentName?: string;
  opponentPoints?: number;
  won?: boolean;
  starters?: string[];
  starters_points?: number[];
  players?: string[];
  players_points?: Record<string, number>;
  playerData?: Map<string, HallOfFamePlayerMetadata>;
  matchupId?: number;
  isPlayoff?: boolean;
  custom_points?: number; // For optimal lineup calculations
}

// ============================================================================
// Display & UI Types
// ============================================================================

export interface HallOfFameEntry {
  category: string;
  description?: string;
  player: string;
  team: string;
  value: string;
  isNewThisWeek: boolean;
}

export interface HallOfFameSection {
  title: string;
  description: string;
  records: HallOfFameRecord[];
}

export interface SeasonalRecord {
  rank: number;
  teamName: string;
  value: number;
  formattedValue: string;
  season: string;
  context?: string;
}

export interface WeeklyHighlight {
  week: number;
  category: string;
  record: HallOfFameRecord;
  isNewRecord: boolean;
}

// ============================================================================
// Aggregation Types
// ============================================================================

export interface CategoryGroup {
  groupName: string;
  categories: HallOfFameCategory[];
}

export interface RecordsByCategory {
  categoryId: string;
  categoryName: string;
  records: HallOfFameRecord[];
  topRecord: HallOfFameRecord;
  bottomRecord?: HallOfFameRecord; // For 'both' type categories
}

export interface LeaderboardData {
  season: string;
  week?: number;
  categories: RecordsByCategory[];
  lastUpdated: string;
}

// ============================================================================
// Calculation Options
// ============================================================================

export interface HallOfFameOptions {
  includeWeekly?: boolean;
  includeSeasonal?: boolean;
  includePlayoffs?: boolean;
  includeAllTime?: boolean;
  minWeek?: number;
  maxWeek?: number;
  categories?: string[]; // Filter to specific category IDs
}
