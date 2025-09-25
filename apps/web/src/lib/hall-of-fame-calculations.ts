/**
 * Hall of Fame & Shame calculations
 * Cross-league leaderboard for legendary performances and epic fails
 */

import { CACHE_DURATIONS, LEAGUE_IDS } from './constants';

// Types for Hall of Fame records
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

// Import comprehensive categories
import { ALL_HALL_OF_FAME_CATEGORIES, getCategoriesGrouped } from './hall-of-fame-categories';

// Re-export for backward compatibility
export const HALL_OF_FAME_CATEGORIES = ALL_HALL_OF_FAME_CATEGORIES;

// Process matchup data to extract Hall of Fame records
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
  playerData?: Map<string, any>; // Player metadata including position
  matchupId?: number;
  isPlayoff?: boolean;
  custom_points?: number; // For optimal lineup calculations
}

/**
 * Calculate Hall of Fame records from matchup data
 */
export function calculateHallOfFameRecords(
  matchups: ProcessedMatchup[],
  categories: HallOfFameCategory[] = HALL_OF_FAME_CATEGORIES
): Map<string, HallOfFameRecord[]> {
  const recordsByCategory = new Map<string, HallOfFameRecord[]>();

  // Initialize each category
  categories.forEach(category => {
    recordsByCategory.set(category.id, []);
  });

  // For matchup-scoped categories, we need to deduplicate
  const matchupCategories = [
    'biggest_blowout',
    'closest_game',
    'highest_combined',
    'lowest_combined',
    'most_one_sided',
    'most_exciting_game',
    'highest_combined_qb',
    'lowest_combined_qb',
    'highest_combined_rb',
    'lowest_combined_rb',
    'highest_combined_wr',
    'lowest_combined_wr',
    'highest_combined_te',
    'lowest_combined_te',
    'highest_combined_def',
    'lowest_combined_def',
  ];
  const processedMatchupPairs = new Set<string>();

  // Process each matchup against each category
  matchups.forEach(matchup => {
    categories.forEach(category => {
      // For matchup categories, only process once per matchup pair
      if (matchupCategories.includes(category.id)) {
        const matchupKey = `${matchup.leagueId}-${matchup.week}-${matchup.matchupId}-${category.id}`;
        if (processedMatchupPairs.has(matchupKey)) {
          return; // Skip if we've already processed this matchup
        }
        processedMatchupPairs.add(matchupKey);
      }

      const value = category.calculateValue(matchup, matchups);
      if (value !== null && !isNaN(value)) {
        const record: HallOfFameRecord = {
          category: category.id,
          categoryDisplay: category.name,
          description: category.description,
          value,
          teamName: matchup.teamName,
          teamId: matchup.rosterId,
          leagueId: matchup.leagueId,
          leagueName: matchup.leagueName,
          week: matchup.week,
          season: matchup.season,
          opponent: matchup.opponentName,
          opponentId: matchup.opponentId,
          contextData: {
            points: matchup.points,
            opponentPoints: matchup.opponentPoints,
            projectedPoints: matchup.projectedPoints,
            won: matchup.won,
            // Add matchup-specific data for linking
            matchupId: matchup.matchupId,
            isMatchupRecord: matchupCategories.includes(category.id),
            // For matchup records, include both teams
            ...(matchupCategories.includes(category.id) && {
              bothTeams: {
                teamA: {
                  name: matchup.teamName,
                  id: matchup.rosterId,
                  points: matchup.points,
                },
                teamB: {
                  name: matchup.opponentName,
                  id: matchup.opponentId,
                  points: matchup.opponentPoints,
                },
              },
            }),
          },
        };

        recordsByCategory.get(category.id)!.push(record);
      }
    });
  });

  // Sort and limit to top/bottom 5 for each category
  categories.forEach(category => {
    const records = recordsByCategory.get(category.id)!;

    if (category.type === 'highest') {
      records.sort((a, b) => b.value - a.value);
    } else if (category.type === 'lowest') {
      records.sort((a, b) => a.value - b.value);
    } else {
      // 'both' type - keep top 5 and bottom 5
      const sorted = [...records].sort((a, b) => b.value - a.value);
      const top5 = sorted.slice(0, 5);
      const bottom5 = sorted.slice(-5).reverse();
      recordsByCategory.set(category.id, [...top5, ...bottom5]);
      return;
    }

    // Keep only top 5
    recordsByCategory.set(category.id, records.slice(0, 5));
  });

  return recordsByCategory;
}

/**
 * Get category display information
 */
export function getCategoryInfo(categoryId: string): HallOfFameCategory | undefined {
  // Check both base categories and expanded categories
  const baseCategory = HALL_OF_FAME_CATEGORIES.find(c => c.id === categoryId);
  if (baseCategory) return baseCategory;

  // Import expanded categories if not found in base
  try {
    const { ALL_EXPANDED_CATEGORIES } = require('./hall-of-fame-expanded-categories');
    return ALL_EXPANDED_CATEGORIES.find((c: HallOfFameCategory) => c.id === categoryId);
  } catch {
    return undefined;
  }
}

/**
 * Group categories by their group type
 */
export function getCategoriesByGroup(): Map<string, HallOfFameCategory[]> {
  return getCategoriesGrouped();
}

/**
 * Format a record for display
 */
export function formatRecord(record: HallOfFameRecord): string {
  const category = getCategoryInfo(record.category);
  if (!category) return `${record.value}`;
  return category.formatValue(record.value);
}

/**
 * Get emoji for ranking position
 */
export function getRankEmoji(rank: number): string {
  switch (rank) {
    case 1:
      return '🥇';
    case 2:
      return '🥈';
    case 3:
      return '🥉';
    default:
      return `${rank}.`;
  }
}
