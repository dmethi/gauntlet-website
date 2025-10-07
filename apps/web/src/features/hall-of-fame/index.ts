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

// TODO: Add component exports when components are migrated
// export * from './components';

// TODO: Add hook exports when hooks are migrated
// export * from './hooks';

// TODO: Add utility exports when utilities are migrated
// export * from './utils';
