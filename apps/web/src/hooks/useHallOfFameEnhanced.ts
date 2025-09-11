/**
 * Enhanced Hall of Fame hook with all data sources
 * Combines Sleeper stats, win probability, and aggregations
 */

import { useQuery } from '@tanstack/react-query';
import { CACHE_DURATIONS } from '@/lib/constants';
import { hallOfFameDataService, EnhancedMatchup } from '@/lib/hall-of-fame-data-service';
import {
  calculateRollingWindows,
  calculateStreaks,
  calculateSeasonalData,
  findBestRollingWindows,
  findLongestStreaks,
  findSeasonalRecords,
  RollingWindowData,
  StreakData,
  SeasonalData,
} from '@/lib/hall-of-fame-aggregations';
import { calculateHallOfFameRecords, HallOfFameRecord } from '@/lib/hall-of-fame-calculations';
import { getAllCategories } from '@/lib/hall-of-fame-expanded-categories';

export interface ComprehensiveHallOfFameData {
  // Weekly records
  weeklyRecords: Map<string, HallOfFameRecord[]>;

  // Rolling window records
  rollingWindows: {
    threeWeek: {
      highest: RollingWindowData[];
      lowest: RollingWindowData[];
    };
    fiveWeek: {
      highest: RollingWindowData[];
      lowest: RollingWindowData[];
    };
  };

  // Streak records
  streaks: {
    winStreaks: StreakData[];
    lossStreaks: StreakData[];
    hotStreaks: StreakData[]; // Above median
    coldStreaks: StreakData[]; // Below median
  };

  // Seasonal records
  seasonal: {
    mostWins: SeasonalData[];
    mostPoints: SeasonalData[];
    luckiest: SeasonalData[];
    unluckiest: SeasonalData[];
    mostDonuts: SeasonalData[];
    longestWinStreak: SeasonalData[];
    longestLosingStreak: SeasonalData[];
    mostBlowouts: SeasonalData[];
    strongestSchedule: SeasonalData[];
  };

  // Metadata
  totalMatchups: number;
  totalSeasons: number;
  totalLeagues: number;
  lastUpdated: string;
}

/**
 * Main hook for comprehensive Hall of Fame data
 */
export function useHallOfFameEnhanced() {
  return useQuery({
    queryKey: ['hall-of-fame-enhanced', 'all'],
    queryFn: async (): Promise<ComprehensiveHallOfFameData> => {
      // Fetch all enhanced matchups with player stats and win probability
      const allMatchups = await hallOfFameDataService.getAllHistoricalMatchups(true);

      // Calculate weekly records using all categories
      const allCategories = getAllCategories();
      const weeklyRecords = calculateHallOfFameRecords(allMatchups, allCategories);

      // Calculate rolling windows
      const threeWeekWindows = calculateRollingWindows(allMatchups, 3);
      const fiveWeekWindows = calculateRollingWindows(allMatchups, 5);

      // Find best rolling windows
      const rollingWindows = {
        threeWeek: {
          highest: findBestRollingWindows(threeWeekWindows, 'highest', 5),
          lowest: findBestRollingWindows(threeWeekWindows, 'lowest', 5),
        },
        fiveWeek: {
          highest: findBestRollingWindows(fiveWeekWindows, 'highest', 5),
          lowest: findBestRollingWindows(fiveWeekWindows, 'lowest', 5),
        },
      };

      // Calculate streaks (only win/loss streaks)
      const allStreaks = calculateStreaks(allMatchups);
      const streaks = {
        winStreaks: findLongestStreaks(allStreaks, 'win', 5),
        lossStreaks: findLongestStreaks(allStreaks, 'loss', 5),
        hotStreaks: [], // Removed per requirements
        coldStreaks: [], // Removed per requirements
      };

      // Calculate seasonal data
      const seasonalData = calculateSeasonalData(allMatchups);
      const seasonal = {
        mostWins: findSeasonalRecords(seasonalData, 'wins', 'highest', 5),
        mostPoints: findSeasonalRecords(seasonalData, 'totalPoints', 'highest', 5),
        luckiest: findSeasonalRecords(seasonalData, 'luckDelta', 'highest', 5),
        unluckiest: findSeasonalRecords(seasonalData, 'luckDelta', 'lowest', 5),
        mostDonuts: findSeasonalRecords(seasonalData, 'totalDonuts', 'highest', 5),
        longestWinStreak: findSeasonalRecords(seasonalData, 'longestWinStreak', 'highest', 5),
        longestLosingStreak: findSeasonalRecords(seasonalData, 'longestLosingStreak', 'highest', 5),
        mostBlowouts: findSeasonalRecords(seasonalData, 'blowoutWins', 'highest', 5),
        strongestSchedule: findSeasonalRecords(seasonalData, 'scheduleStrength', 'highest', 5),
      };

      // Calculate metadata
      const uniqueSeasons = new Set(allMatchups.map(m => m.season));
      const uniqueLeagues = new Set(allMatchups.map(m => m.leagueId));

      return {
        weeklyRecords,
        rollingWindows,
        streaks,
        seasonal,
        totalMatchups: allMatchups.length,
        totalSeasons: uniqueSeasons.size,
        totalLeagues: uniqueLeagues.size,
        lastUpdated: new Date().toISOString(),
      };
    },
    staleTime: CACHE_DURATIONS.ONE_HOUR,
    gcTime: CACHE_DURATIONS.ONE_WEEK,
  });
}

/**
 * Hook for team-specific Hall of Fame records
 */
export function useTeamHallOfFameEnhanced(leagueId: string, rosterId: number) {
  // First get the main data
  const mainDataQuery = useHallOfFameEnhanced();

  return useQuery({
    queryKey: ['hall-of-fame-enhanced', 'team', leagueId, rosterId],
    queryFn: async () => {
      // Get all data from the service directly
      const allMatchups = await hallOfFameDataService.getAllHistoricalMatchups(true);
      const allCategories = getAllCategories();
      const weeklyRecords = calculateHallOfFameRecords(allMatchups, allCategories);
      const threeWeekWindows = calculateRollingWindows(allMatchups, 3);
      const fiveWeekWindows = calculateRollingWindows(allMatchups, 5);
      const allStreaks = calculateStreaks(allMatchups);
      const seasonalData = calculateSeasonalData(allMatchups);

      const allData = {
        weeklyRecords,
        rollingWindows: {
          threeWeek: {
            highest: findBestRollingWindows(threeWeekWindows, 'highest', 5),
            lowest: findBestRollingWindows(threeWeekWindows, 'lowest', 5),
          },
          fiveWeek: {
            highest: findBestRollingWindows(fiveWeekWindows, 'highest', 5),
            lowest: findBestRollingWindows(fiveWeekWindows, 'lowest', 5),
          },
        },
        streaks: {
          winStreaks: findLongestStreaks(allStreaks, 'win', 5),
          lossStreaks: findLongestStreaks(allStreaks, 'loss', 5),
          hotStreaks: [], // Removed per requirements
          coldStreaks: [], // Removed per requirements
        },
        seasonal: {
          mostWins: findSeasonalRecords(seasonalData, 'wins', 'highest', 5),
          mostPoints: findSeasonalRecords(seasonalData, 'totalPoints', 'highest', 5),
          luckiest: findSeasonalRecords(seasonalData, 'luckDelta', 'highest', 5),
          unluckiest: findSeasonalRecords(seasonalData, 'luckDelta', 'lowest', 5),
          mostDonuts: findSeasonalRecords(seasonalData, 'totalDonuts', 'highest', 5),
          longestWinStreak: findSeasonalRecords(seasonalData, 'longestWinStreak', 'highest', 5),
          longestLosingStreak: findSeasonalRecords(
            seasonalData,
            'longestLosingStreak',
            'highest',
            5
          ),
          mostBlowouts: findSeasonalRecords(seasonalData, 'blowoutWins', 'highest', 5),
          strongestSchedule: findSeasonalRecords(seasonalData, 'scheduleStrength', 'highest', 5),
        },
        totalMatchups: allMatchups.length,
        totalSeasons: new Set(allMatchups.map(m => m.season)).size,
        totalLeagues: new Set(allMatchups.map(m => m.leagueId)).size,
        lastUpdated: new Date().toISOString(),
      };

      // Filter for this team
      const teamRecords: Map<string, HallOfFameRecord[]> = new Map();

      allData.weeklyRecords.forEach((records, category) => {
        const teamCategoryRecords = records.filter(
          r => r.teamId === rosterId && r.leagueId === leagueId
        );
        if (teamCategoryRecords.length > 0) {
          teamRecords.set(category, teamCategoryRecords);
        }
      });

      // Find team's rolling windows
      const teamWindows = {
        threeWeek: allData.rollingWindows.threeWeek.highest.filter(
          w => w.rosterId === rosterId && w.leagueId === leagueId
        ),
        fiveWeek: allData.rollingWindows.fiveWeek.highest.filter(
          w => w.rosterId === rosterId && w.leagueId === leagueId
        ),
      };

      // Find team's streaks
      const teamStreaks = {
        winStreaks: allData.streaks.winStreaks.filter(
          s => s.rosterId === rosterId && s.leagueId === leagueId
        ),
        lossStreaks: allData.streaks.lossStreaks.filter(
          s => s.rosterId === rosterId && s.leagueId === leagueId
        ),
        hotStreaks: [], // Removed per requirements
        coldStreaks: [], // Removed per requirements
      };

      // Find team's seasonal records
      const teamSeasonal = allData.seasonal.mostWins.filter(
        s => s.rosterId === rosterId && s.leagueId === leagueId
      );

      return {
        records: teamRecords,
        rollingWindows: teamWindows,
        streaks: teamStreaks,
        seasonal: teamSeasonal,
        teamName: teamSeasonal[0]?.teamName || `Team ${rosterId}`,
      };
    },
    enabled: !!leagueId && !!rosterId,
    staleTime: CACHE_DURATIONS.ONE_HOUR,
    gcTime: CACHE_DURATIONS.ONE_WEEK,
  });
}

/**
 * Hook for league-specific Hall of Fame records
 */
export function useLeagueHallOfFameEnhanced(leagueId: string) {
  return useQuery({
    queryKey: ['hall-of-fame-enhanced', 'league', leagueId],
    queryFn: async () => {
      // Get league-specific matchups
      const currentSeason = new Date().getFullYear().toString();
      const leagueMatchups = await hallOfFameDataService.getLeagueSeasonMatchups(
        leagueId,
        currentSeason
      );

      // Calculate all records for this league
      const allCategories = getAllCategories();
      const weeklyRecords = calculateHallOfFameRecords(leagueMatchups, allCategories);

      // Calculate league-specific aggregations
      const rollingWindows = calculateRollingWindows(leagueMatchups, 3);
      const streaks = calculateStreaks(leagueMatchups);
      const seasonalData = calculateSeasonalData(leagueMatchups);

      return {
        weeklyRecords,
        rollingWindows: {
          highest: findBestRollingWindows(rollingWindows, 'highest', 5),
          lowest: findBestRollingWindows(rollingWindows, 'lowest', 5),
        },
        streaks: {
          winStreaks: findLongestStreaks(streaks, 'win', 5),
          lossStreaks: findLongestStreaks(streaks, 'loss', 5),
          hotStreaks: [], // Removed per requirements
          coldStreaks: [], // Removed per requirements
        },
        seasonal: seasonalData,
        leagueId,
        totalMatchups: leagueMatchups.length,
        lastUpdated: new Date().toISOString(),
      };
    },
    enabled: !!leagueId,
    staleTime: CACHE_DURATIONS.ONE_HOUR,
    gcTime: CACHE_DURATIONS.ONE_WEEK,
  });
}

/**
 * Hook to get specific category records with filtering
 */
export function useCategoryRecords(
  categoryId: string,
  scope?: 'weekly' | 'rolling' | 'seasonal' | 'playoff' | 'alltime',
  leagueId?: string,
  season?: string
) {
  return useQuery({
    queryKey: ['hall-of-fame-category', categoryId, scope, leagueId, season],
    queryFn: async () => {
      // Get all enhanced data
      const allMatchups = await hallOfFameDataService.getAllHistoricalMatchups(true);
      const allCategories = getAllCategories();
      const weeklyRecords = calculateHallOfFameRecords(allMatchups, allCategories);

      const allData = {
        weeklyRecords,
        totalMatchups: allMatchups.length,
      };

      // Get records for this category
      let records = allData.weeklyRecords.get(categoryId) || [];

      // Apply filters
      if (leagueId) {
        records = records.filter(r => r.leagueId === leagueId);
      }

      if (season) {
        records = records.filter(r => r.season === season);
      }

      if (scope) {
        records = records.filter(r => r.scope === scope);
      }

      return {
        categoryId,
        records,
        totalRecords: records.length,
      };
    },
    staleTime: CACHE_DURATIONS.ONE_HOUR,
    gcTime: CACHE_DURATIONS.ONE_WEEK,
  });
}
