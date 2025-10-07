/**
 * Hall of Fame utilities barrel export
 */

// Calculations
export {
  calculateHallOfFameRecords,
  getCategoryInfo,
  getCategoriesByGroup,
  formatRecord,
  getRankEmoji,
  HALL_OF_FAME_CATEGORIES,
  type HallOfFameRecord,
  type HallOfFameCategory,
  type ProcessedMatchup,
} from './calculations';

// Aggregations
export {
  calculateRollingWindows,
  calculateSeasonalData,
  calculateStreaks,
  findBestRollingWindows,
  findLongestStreaks,
  findSeasonalRecords,
  type RollingWindowData,
  type SeasonalData,
  type StreakData,
  type EnhancedMatchup,
} from './aggregations';

// Categories
export {
  ALL_HALL_OF_FAME_CATEGORIES,
  WEEKLY_TEAM_CATEGORIES,
  WEEKLY_MATCHUP_CATEGORIES,
  getCategoriesGrouped,
} from './categories';

// Expanded categories
export {
  ALL_EXPANDED_CATEGORIES,
  WEEKLY_PLAYER_CATEGORIES,
  WIN_PROBABILITY_CATEGORIES,
  ROLLING_WINDOW_CATEGORIES,
  SEASONAL_CATEGORIES,
  PLAYOFF_CATEGORIES,
  getAllCategories,
  getExpandedCategoriesGrouped,
} from './categories-expanded';
