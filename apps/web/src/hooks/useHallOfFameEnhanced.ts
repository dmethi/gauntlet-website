/**
 * Enhanced Hall of Fame hook with all data sources
 * Combines Sleeper stats, win probability, and aggregations
 */

import { useQuery } from '@tanstack/react-query';
import { CACHE_DURATIONS } from '@/lib/constants';
import { hallOfFameDataService } from '@/features/hall-of-fame/hooks/useHallOfFameData';
import {
  calculateRollingWindows,
  calculateSeasonalData,
  calculateStreaks,
  type EnhancedMatchup,
  findBestRollingWindows,
  findLongestStreaks,
  findSeasonalRecords,
  type RollingWindowData,
  type SeasonalData,
  type StreakData,
} from '@/features/hall-of-fame/utils';
import {
  calculateHallOfFameRecords,
  formatRecord,
  type HallOfFameRecord,
} from '@/features/hall-of-fame/utils';
import { getAllCategories } from '@/features/hall-of-fame/utils';

export interface PositionalDifferenceRecord {
  position: string;
  difference: number;
  teamName: string;
  teamId: number;
  teamScore: number;
  opponentName: string;
  opponentId: number;
  opponentScore: number;
  leagueId: string;
  leagueName: string;
  week: number;
  season: string;
  matchupId?: number;
}

/**
 * Calculate positional scoring differences for each matchup
 */
const calculatePositionalDifferences = (
  matchups: EnhancedMatchup[],
): {
  QB: PositionalDifferenceRecord[];
  RB: PositionalDifferenceRecord[];
  WR: PositionalDifferenceRecord[];
  TE: PositionalDifferenceRecord[];
  K: PositionalDifferenceRecord[];
  DEF: PositionalDifferenceRecord[];
} => {
  const positions = ['QB', 'RB', 'WR', 'TE', 'K', 'DEF'] as const;
  const recordsByPosition: Record<string, PositionalDifferenceRecord[]> = {
    QB: [],
    RB: [],
    WR: [],
    TE: [],
    K: [],
    DEF: [],
  };

  // Group matchups by week and matchupId within each league
  const matchupPairs = new Map<string, EnhancedMatchup[]>();

  matchups.forEach(matchup => {
    if (!matchup.matchupId) return;
    const key = `${matchup.leagueId}-${matchup.week}-${matchup.matchupId}`;
    if (!matchupPairs.has(key)) {
      matchupPairs.set(key, []);
    }
    matchupPairs.get(key)!.push(matchup);
  });

  // Process each matchup pair
  matchupPairs.forEach(pair => {
    if (pair.length !== 2) return; // Must be exactly 2 teams

    const [team1, team2] = pair;

    // Calculate position totals for each team
    const team1PosTotals = new Map<string, number>();
    const team2PosTotals = new Map<string, number>();

    positions.forEach(pos => {
      team1PosTotals.set(pos, 0);
      team2PosTotals.set(pos, 0);
    });

    // Calculate team1 position totals
    if (team1.starters && team1.starters_points && team1.playerData) {
      team1.starters.forEach((playerId, idx) => {
        const points = team1.starters_points![idx] || 0;
        const player = team1.playerData!.get(playerId);
        if (!player) return;

        const position = player.position as string;
        if (positions.includes(position as (typeof positions)[number])) {
          team1PosTotals.set(position, (team1PosTotals.get(position) || 0) + points);
        }
      });
    }

    // Calculate team2 position totals
    if (team2.starters && team2.starters_points && team2.playerData) {
      team2.starters.forEach((playerId, idx) => {
        const points = team2.starters_points![idx] || 0;
        const player = team2.playerData!.get(playerId);
        if (!player) return;

        const position = player.position as string;
        if (positions.includes(position as (typeof positions)[number])) {
          team2PosTotals.set(position, (team2PosTotals.get(position) || 0) + points);
        }
      });
    }

    // Calculate differences for each position
    positions.forEach(position => {
      const team1Score = team1PosTotals.get(position) || 0;
      const team2Score = team2PosTotals.get(position) || 0;
      const diff = Math.abs(team1Score - team2Score);

      if (diff === 0) return; // Skip if no difference

      // Determine which team had the higher score
      const [winningTeam, losingTeam, winningScore, losingScore] =
        team1Score > team2Score
          ? [team1, team2, team1Score, team2Score]
          : [team2, team1, team2Score, team1Score];

      const record: PositionalDifferenceRecord = {
        position,
        difference: diff,
        teamName: winningTeam.teamName,
        teamId: winningTeam.rosterId,
        teamScore: winningScore,
        opponentName: losingTeam.teamName,
        opponentId: losingTeam.rosterId,
        opponentScore: losingScore,
        leagueId: team1.leagueId,
        leagueName: team1.leagueName,
        week: team1.week,
        season: team1.season,
        matchupId: team1.matchupId,
      };

      recordsByPosition[position].push(record);
    });
  });

  // Sort each position by difference (descending) and take top 5
  positions.forEach(position => {
    recordsByPosition[position].sort((a, b) => b.difference - a.difference);
    recordsByPosition[position] = recordsByPosition[position].slice(0, 5);
  });

  return recordsByPosition as {
    QB: PositionalDifferenceRecord[];
    RB: PositionalDifferenceRecord[];
    WR: PositionalDifferenceRecord[];
    TE: PositionalDifferenceRecord[];
    K: PositionalDifferenceRecord[];
    DEF: PositionalDifferenceRecord[];
  };
};

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

  // Positional difference records
  positionalDifferences: {
    QB: PositionalDifferenceRecord[];
    RB: PositionalDifferenceRecord[];
    WR: PositionalDifferenceRecord[];
    TE: PositionalDifferenceRecord[];
    K: PositionalDifferenceRecord[];
    DEF: PositionalDifferenceRecord[];
  };

  // Metadata
  totalMatchups: number;
  totalSeasons: number;
  totalLeagues: number;
  lastUpdated: string;
}

/** One (league, roster) pair a manager has played under, across their history. */
export interface ManagerRosterKey {
  leagueId: string;
  rosterId: number;
}

/** A single record-book entry ("Longest Win Streak — 8 weeks") a manager holds. */
export interface ManagerHallOfFameBadge {
  categoryId: string;
  label: string;
  value: string;
  season: string;
  leagueId: string;
  /** 1-indexed position within the category's top-5 (1 = record holder). */
  rank: number;
}

const holdsRecord = (rosterKeys: ManagerRosterKey[], leagueId: string, rosterId: number): boolean =>
  rosterKeys.some(k => k.leagueId === leagueId && k.rosterId === rosterId);

/** Index (0-based) of the first entry belonging to any of the manager's rosters, or null. */
const findRank = <T>(
  records: T[],
  rosterKeys: ManagerRosterKey[],
  getLeagueAndRoster: (record: T) => { leagueId: string; rosterId: number },
): number | null => {
  const index = records.findIndex(record => {
    const { leagueId, rosterId } = getLeagueAndRoster(record);
    return holdsRecord(rosterKeys, leagueId, rosterId);
  });
  return index === -1 ? null : index + 1;
};

/**
 * Finds every top-5 record-book entry (weekly, rolling, streak, seasonal)
 * held by any of a manager's (league, roster) pairs, ranked best-first.
 * Deliberately limited to single-team categories — matchup and
 * positional-difference records involve two teams and don't reduce to a
 * single "this manager holds it" badge.
 */
export const findManagerHallOfFameBadges = (
  data: ComprehensiveHallOfFameData,
  rosterKeys: ManagerRosterKey[],
): ManagerHallOfFameBadge[] => {
  if (rosterKeys.length === 0) return [];
  const badges: ManagerHallOfFameBadge[] = [];

  for (const category of getAllCategories()) {
    const records = data.weeklyRecords.get(category.id) ?? [];
    const rank = findRank(records, rosterKeys, r => ({ leagueId: r.leagueId, rosterId: r.teamId }));
    if (rank !== null) {
      const record = records[rank - 1];
      badges.push({
        categoryId: category.id,
        label: category.name,
        value: formatRecord(record),
        season: record.season,
        leagueId: record.leagueId,
        rank,
      });
    }
  }

  const streakEntries: [string, StreakData[], (s: StreakData) => string][] = [
    ['Longest Win Streak', data.streaks.winStreaks, s => `${s.length} weeks`],
    ['Longest Losing Streak', data.streaks.lossStreaks, s => `${s.length} weeks`],
  ];

  const rollingEntries: [string, RollingWindowData[], (w: RollingWindowData) => string][] = [
    [
      'Best 3-Week Run',
      data.rollingWindows.threeWeek.highest,
      w => `${w.totalPoints.toFixed(2)} pts`,
    ],
    [
      'Worst 3-Week Run',
      data.rollingWindows.threeWeek.lowest,
      w => `${w.totalPoints.toFixed(2)} pts`,
    ],
    [
      'Best 5-Week Run',
      data.rollingWindows.fiveWeek.highest,
      w => `${w.totalPoints.toFixed(2)} pts`,
    ],
    [
      'Worst 5-Week Run',
      data.rollingWindows.fiveWeek.lowest,
      w => `${w.totalPoints.toFixed(2)} pts`,
    ],
  ];

  const seasonalEntries: [string, SeasonalData[], (s: SeasonalData) => string][] = [
    ['Most Wins (Season)', data.seasonal.mostWins, s => `${s.wins} wins`],
    ['Most Points (Season)', data.seasonal.mostPoints, s => `${s.totalPoints.toFixed(2)} pts`],
    ['Luckiest Team', data.seasonal.luckiest, s => `+${s.luckDelta.toFixed(2)} luck`],
    ['Unluckiest Team', data.seasonal.unluckiest, s => `${s.luckDelta.toFixed(2)} luck`],
    ['Most Donuts', data.seasonal.mostDonuts, s => `${s.totalDonuts} donuts`],
    ['Most Blowout Wins', data.seasonal.mostBlowouts, s => `${s.blowoutWins} blowouts`],
  ];

  for (const [label, streaks, formatFn] of streakEntries) {
    const rank = findRank(streaks, rosterKeys, s => ({
      leagueId: s.leagueId,
      rosterId: s.rosterId,
    }));
    if (rank !== null) {
      const streak = streaks[rank - 1];
      badges.push({
        categoryId: `streak-${label}`,
        label,
        value: formatFn(streak),
        season: streak.season,
        leagueId: streak.leagueId,
        rank,
      });
    }
  }

  for (const [label, windows, formatFn] of rollingEntries) {
    const rank = findRank(windows, rosterKeys, w => ({
      leagueId: w.leagueId,
      rosterId: w.rosterId,
    }));
    if (rank !== null) {
      const window = windows[rank - 1];
      badges.push({
        categoryId: `rolling-${label}`,
        label,
        value: formatFn(window),
        season: window.season,
        leagueId: window.leagueId,
        rank,
      });
    }
  }

  for (const [label, records, formatFn] of seasonalEntries) {
    const rank = findRank(records, rosterKeys, s => ({
      leagueId: s.leagueId,
      rosterId: s.rosterId,
    }));
    if (rank !== null) {
      const record = records[rank - 1];
      badges.push({
        categoryId: `seasonal-${label}`,
        label,
        value: formatFn(record),
        season: record.season,
        leagueId: record.leagueId,
        rank,
      });
    }
  }

  return badges.sort((a, b) => a.rank - b.rank);
};

/**
 * Main hook for comprehensive Hall of Fame data
 */
export const useHallOfFameEnhanced = () => {
  return useQuery({
    queryKey: ['hall-of-fame-enhanced', 'all', 'v2'], // Stable key
    queryFn: async (): Promise<ComprehensiveHallOfFameData> => {
      try {
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
          longestLosingStreak: findSeasonalRecords(
            seasonalData,
            'longestLosingStreak',
            'highest',
            5,
          ),
          mostBlowouts: findSeasonalRecords(seasonalData, 'blowoutWins', 'highest', 5),
          strongestSchedule: findSeasonalRecords(seasonalData, 'scheduleStrength', 'highest', 5),
        };

        // Calculate positional differences
        const positionalDifferences = calculatePositionalDifferences(allMatchups);

        // Calculate metadata
        const uniqueSeasons = new Set(allMatchups.map(m => m.season));
        const uniqueLeagues = new Set(allMatchups.map(m => m.leagueId));

        const data = {
          weeklyRecords,
          rollingWindows,
          streaks,
          seasonal,
          positionalDifferences,
          totalMatchups: allMatchups.length,
          totalSeasons: uniqueSeasons.size,
          totalLeagues: uniqueLeagues.size,
          lastUpdated: new Date().toISOString(),
        };

        return data;
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('🚨 ENHANCED HOOK ERROR:', error);
        throw error;
      }
    },
    staleTime: CACHE_DURATIONS.ONE_HOUR,
    gcTime: CACHE_DURATIONS.ONE_WEEK,
  });
};

/**
 * Hook for team-specific Hall of Fame records
 */
export const useTeamHallOfFameEnhanced = (leagueId: string, rosterId: number) => {
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
            5,
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
          r => r.teamId === rosterId && r.leagueId === leagueId,
        );
        if (teamCategoryRecords.length > 0) {
          teamRecords.set(category, teamCategoryRecords);
        }
      });

      // Find team's rolling windows
      const teamWindows = {
        threeWeek: allData.rollingWindows.threeWeek.highest.filter(
          w => w.rosterId === rosterId && w.leagueId === leagueId,
        ),
        fiveWeek: allData.rollingWindows.fiveWeek.highest.filter(
          w => w.rosterId === rosterId && w.leagueId === leagueId,
        ),
      };

      // Find team's streaks
      const teamStreaks = {
        winStreaks: allData.streaks.winStreaks.filter(
          s => s.rosterId === rosterId && s.leagueId === leagueId,
        ),
        lossStreaks: allData.streaks.lossStreaks.filter(
          s => s.rosterId === rosterId && s.leagueId === leagueId,
        ),
        hotStreaks: [], // Removed per requirements
        coldStreaks: [], // Removed per requirements
      };

      // Find team's seasonal records
      const teamSeasonal = allData.seasonal.mostWins.filter(
        s => s.rosterId === rosterId && s.leagueId === leagueId,
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
};

/**
 * Hook for league-specific Hall of Fame records
 */
export const useLeagueHallOfFameEnhanced = (leagueId: string) => {
  return useQuery({
    queryKey: ['hall-of-fame-enhanced', 'league', leagueId],
    queryFn: async () => {
      // Get league-specific matchups
      const currentSeason = new Date().getFullYear().toString();
      const leagueMatchups = await hallOfFameDataService.getLeagueSeasonMatchups(
        leagueId,
        currentSeason,
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
};

/**
 * Hook to get specific category records with filtering
 */
export const useCategoryRecords = (
  categoryId: string,
  scope?: 'weekly' | 'rolling' | 'seasonal' | 'playoff' | 'alltime',
  leagueId?: string,
  season?: string,
) => {
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
};
