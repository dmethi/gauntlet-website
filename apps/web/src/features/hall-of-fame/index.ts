/**
 * Hall of Fame Feature
 *
 * Exports:
 * - Types for hall of fame records, categories, and displays
 * - Components for hall of fame displays and leaderboards (TODO)
 * - Hooks for hall of fame data fetching and aggregations (TODO)
 * - Utilities for calculations, aggregations, categories (TODO)
 *
 * Note: This feature is currently being migrated from flat structure.
 * Files will be added as part of WEB-EXTRACT-*, WEB-UTIL-*, WEB-HOOK-*, WEB-COMP-* tasks.
 */

// ============================================================================
// Type Exports
// ============================================================================

export type {
  // Core types
  HallOfFameRecord,
  HallOfFameCategory,
  ProcessedMatchup,
  // Display types
  HallOfFameEntry,
  HallOfFameSection,
  SeasonalRecord,
  WeeklyHighlight,
  // Aggregation types
  CategoryGroup,
  RecordsByCategory,
  LeaderboardData,
  // Options
  HallOfFameOptions,
} from './types';

// ============================================================================
// Utility Exports
// ============================================================================

export {
  // Calculations
  calculateHallOfFameRecords,
  getCategoryInfo,
  getCategoriesByGroup,
  formatRecord,
  getRankEmoji,
  HALL_OF_FAME_CATEGORIES,
  // Aggregations
  calculateRollingWindows,
  calculateSeasonalData,
  calculateStreaks,
  findBestRollingWindows,
  findLongestStreaks,
  findSeasonalRecords,
  // Categories
  ALL_HALL_OF_FAME_CATEGORIES,
  WEEKLY_TEAM_CATEGORIES,
  WEEKLY_MATCHUP_CATEGORIES,
  getCategoriesGrouped,
  // Expanded categories
  ALL_EXPANDED_CATEGORIES,
  WEEKLY_PLAYER_CATEGORIES,
  WIN_PROBABILITY_CATEGORIES,
  ROLLING_WINDOW_CATEGORIES,
  SEASONAL_CATEGORIES,
  PLAYOFF_CATEGORIES,
  getAllCategories,
  getCategoryInfoExpanded,
  getExpandedCategoriesGrouped,
  // Aggregation types
  type RollingWindowData,
  type SeasonalData,
  type StreakData,
  type EnhancedMatchup,
} from './utils';

// ============================================================================
// Hook Exports
// ============================================================================

export { hallOfFameDataService, createHallOfFameDataService } from './hooks/useHallOfFameData';

// TODO: Add component exports when components are migrated
// export * from './components';
