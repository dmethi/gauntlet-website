/**
 * Expanded Hall of Fame categories using player stats and win probability data
 */

import type { HallOfFameCategory } from '@/features/hall-of-fame/types';
import type { EnhancedMatchup, RollingWindowData, SeasonalData } from './aggregations';
import { ALL_HALL_OF_FAME_CATEGORIES } from './categories';

/**
 * E. WEEKLY - PLAYER ON TEAM (Starters Only)
 * These categories require detailed player stats from the undocumented API
 */
export const WEEKLY_PLAYER_CATEGORIES: HallOfFameCategory[] = [
  // Passing - Team Total
  {
    id: 'most_passing_yards',
    name: 'Team Passing Yards',
    description: 'Total passing yards by all starters in a week - highest and lowest',
    group: 'weekly_player',
    type: 'both',
    scope: 'weekly',
    calculateValue: (matchup: EnhancedMatchup) => {
      if (!matchup.starters || !matchup.playerStats) return null;

      let totalPassYards = 0;
      matchup.starters.forEach(playerId => {
        const stats = matchup.playerStats?.get(playerId);
        if (stats?.pass_yd) {
          totalPassYards += stats.pass_yd;
        }
      });

      return totalPassYards > 0 ? totalPassYards : null;
    },
    formatValue: value => `${value} passing yards`,
  },
  {
    id: 'most_passing_tds',
    name: 'Team Passing TDs',
    description: 'Total passing TDs by all starters in a week - highest and lowest',
    group: 'weekly_player',
    type: 'both',
    scope: 'weekly',
    calculateValue: (matchup: EnhancedMatchup) => {
      if (!matchup.starters || !matchup.playerStats) return null;

      let totalPassTDs = 0;
      matchup.starters.forEach(playerId => {
        const stats = matchup.playerStats?.get(playerId);
        if (stats?.pass_td) {
          totalPassTDs += stats.pass_td;
        }
      });

      return totalPassTDs > 0 ? totalPassTDs : null;
    },
    formatValue: value => `${value} passing TDs`,
  },

  // Rushing - Team Total
  {
    id: 'most_rushing_yards',
    name: 'Team Rushing Yards',
    description: 'Total rushing yards by all starters in a week - highest and lowest',
    group: 'weekly_player',
    type: 'both',
    scope: 'weekly',
    calculateValue: (matchup: EnhancedMatchup) => {
      if (!matchup.starters || !matchup.playerStats) return null;

      let totalRushYards = 0;
      matchup.starters.forEach(playerId => {
        const stats = matchup.playerStats?.get(playerId);
        if (stats?.rush_yd) {
          totalRushYards += stats.rush_yd;
        }
      });

      return totalRushYards > 0 ? totalRushYards : null;
    },
    formatValue: value => `${value} rushing yards`,
  },
  {
    id: 'most_rushing_tds',
    name: 'Team Rushing TDs',
    description: 'Total rushing TDs by all starters in a week - highest and lowest',
    group: 'weekly_player',
    type: 'both',
    scope: 'weekly',
    calculateValue: (matchup: EnhancedMatchup) => {
      if (!matchup.starters || !matchup.playerStats) return null;

      let totalRushTDs = 0;
      matchup.starters.forEach(playerId => {
        const stats = matchup.playerStats?.get(playerId);
        if (stats?.rush_td) {
          totalRushTDs += stats.rush_td;
        }
      });

      return totalRushTDs > 0 ? totalRushTDs : null;
    },
    formatValue: value => `${value} rushing TDs`,
  },

  // Receiving - Team Total
  {
    id: 'most_receiving_yards',
    name: 'Team Receiving Yards',
    description: 'Total receiving yards by all starters in a week - highest and lowest',
    group: 'weekly_player',
    type: 'both',
    scope: 'weekly',
    calculateValue: (matchup: EnhancedMatchup) => {
      if (!matchup.starters || !matchup.playerStats) return null;

      let totalRecYards = 0;
      matchup.starters.forEach(playerId => {
        const stats = matchup.playerStats?.get(playerId);
        if (stats?.rec_yd) {
          totalRecYards += stats.rec_yd;
        }
      });

      return totalRecYards > 0 ? totalRecYards : null;
    },
    formatValue: value => `${value} receiving yards`,
  },
  {
    id: 'most_receptions',
    name: 'Team Receptions',
    description: 'Total receptions by all starters in a week - highest and lowest',
    group: 'weekly_player',
    type: 'both',
    scope: 'weekly',
    calculateValue: (matchup: EnhancedMatchup) => {
      if (!matchup.starters || !matchup.playerStats) return null;

      let totalRec = 0;
      matchup.starters.forEach(playerId => {
        const stats = matchup.playerStats?.get(playerId);
        if (stats?.rec) {
          totalRec += stats.rec;
        }
      });

      return totalRec > 0 ? totalRec : null;
    },
    formatValue: value => `${value} receptions`,
  },

  // Passing Completions - Team Total
  {
    id: 'most_pass_completions',
    name: 'Team Pass Completions',
    description: 'Total completions by all starters in a week - highest and lowest',
    group: 'weekly_player',
    type: 'both',
    scope: 'weekly',
    calculateValue: (matchup: EnhancedMatchup) => {
      if (!matchup.starters || !matchup.playerStats) return null;
      let total = 0;
      matchup.starters.forEach(playerId => {
        const stats = matchup.playerStats?.get(playerId);
        if (stats?.pass_cmp) {
          total += stats.pass_cmp;
        }
      });
      return total > 0 ? total : null;
    },
    formatValue: value => `${value} completions`,
  },

  // Passing Attempts - Team Total
  {
    id: 'most_pass_attempts',
    name: 'Team Pass Attempts',
    description: 'Total pass attempts by all starters in a week - highest and lowest',
    group: 'weekly_player',
    type: 'both',
    scope: 'weekly',
    calculateValue: (matchup: EnhancedMatchup) => {
      if (!matchup.starters || !matchup.playerStats) return null;
      let total = 0;
      matchup.starters.forEach(playerId => {
        const stats = matchup.playerStats?.get(playerId);
        if (stats?.pass_att) {
          total += stats.pass_att;
        }
      });
      return total > 0 ? total : null;
    },
    formatValue: value => `${value} attempts`,
  },

  // Rushing Attempts - Team Total
  {
    id: 'most_rush_attempts',
    name: 'Team Rush Attempts',
    description: 'Total rushing attempts by all starters in a week - highest and lowest',
    group: 'weekly_player',
    type: 'both',
    scope: 'weekly',
    calculateValue: (matchup: EnhancedMatchup) => {
      if (!matchup.starters || !matchup.playerStats) return null;
      let total = 0;
      matchup.starters.forEach(playerId => {
        const stats = matchup.playerStats?.get(playerId);
        if (stats?.rush_att) {
          total += stats.rush_att;
        }
      });
      return total > 0 ? total : null;
    },
    formatValue: value => `${value} rushes`,
  },

  // Yards per Rush
  {
    id: 'best_yards_per_rush',
    name: 'Best Yards per Rush',
    description: 'Highest yards per rush (min 5 attempts)',
    group: 'weekly_player',
    type: 'highest',
    scope: 'weekly',
    calculateValue: (matchup: EnhancedMatchup) => {
      if (!matchup.starters || !matchup.playerStats) return null;
      let maxYPC = 0;
      matchup.starters.forEach(playerId => {
        const stats = matchup.playerStats?.get(playerId);
        if (stats?.rush_att && stats.rush_att >= 5 && stats.rush_yd) {
          const ypc = stats.rush_yd / stats.rush_att;
          maxYPC = Math.max(maxYPC, ypc);
        }
      });
      return maxYPC > 0 ? maxYPC : null;
    },
    formatValue: value => `${value.toFixed(1)} YPC`,
  },

  // Total Touchdowns - Team Total
  {
    id: 'total_tds_weekly',
    name: 'Team Total TDs',
    description: 'Total TDs by all starters (pass + rush + rec) - highest and lowest',
    group: 'weekly_player',
    type: 'both',
    scope: 'weekly',
    calculateValue: (matchup: EnhancedMatchup) => {
      if (!matchup.starters || !matchup.playerStats) return null;
      let totalTDs = 0;
      matchup.starters.forEach(playerId => {
        const stats = matchup.playerStats?.get(playerId);
        if (stats) {
          totalTDs += (stats.pass_td || 0) + (stats.rush_td || 0) + (stats.rec_td || 0);
        }
      });
      return totalTDs > 0 ? totalTDs : null;
    },
    formatValue: value => `${value} TDs`,
  },

  // Receiving Targets - Team Total
  {
    id: 'most_targets',
    name: 'Team Targets',
    description: 'Total targets by all starters in a week - highest and lowest',
    group: 'weekly_player',
    type: 'both',
    scope: 'weekly',
    calculateValue: (matchup: EnhancedMatchup) => {
      if (!matchup.starters || !matchup.playerStats) return null;
      let total = 0;
      matchup.starters.forEach(playerId => {
        const stats = matchup.playerStats?.get(playerId);
        if (stats?.rec_tgt) {
          total += stats.rec_tgt;
        }
      });
      return total > 0 ? total : null;
    },
    formatValue: value => `${value} targets`,
  },

  // Yards per Reception
  {
    id: 'best_yards_per_reception',
    name: 'Best Yards per Reception',
    description: 'Highest yards per reception (min 3 catches)',
    group: 'weekly_player',
    type: 'highest',
    scope: 'weekly',
    calculateValue: (matchup: EnhancedMatchup) => {
      if (!matchup.starters || !matchup.playerStats) return null;
      let maxYPR = 0;
      matchup.starters.forEach(playerId => {
        const stats = matchup.playerStats?.get(playerId);
        if (stats?.rec && stats.rec >= 3 && stats.rec_yd) {
          const ypr = stats.rec_yd / stats.rec;
          maxYPR = Math.max(maxYPR, ypr);
        }
      });
      return maxYPR > 0 ? maxYPR : null;
    },
    formatValue: value => `${value.toFixed(1)} YPR`,
  },

  // Pass Interceptions - Team Total
  {
    id: 'most_pass_ints',
    name: 'Team Interceptions Thrown',
    description: 'Total INTs thrown by all starters in a week',
    group: 'weekly_player',
    type: 'highest',
    scope: 'weekly',
    calculateValue: (matchup: EnhancedMatchup) => {
      if (!matchup.starters || !matchup.playerStats) return null;
      let total = 0;
      matchup.starters.forEach(playerId => {
        const stats = matchup.playerStats?.get(playerId);
        if (stats?.pass_int) {
          total += stats.pass_int;
        }
      });
      return total > 0 ? total : null;
    },
    formatValue: value => `${value} INTs`,
  },

  // Defensive Sacks - Team Total
  {
    id: 'most_def_sacks',
    name: 'Team Sacks (Defense)',
    description: 'Total sacks by all defensive starters in a week',
    group: 'weekly_player',
    type: 'highest',
    scope: 'weekly',
    calculateValue: (matchup: EnhancedMatchup) => {
      if (!matchup.starters || !matchup.playerStats) return null;
      let total = 0;
      matchup.starters.forEach(playerId => {
        const stats = matchup.playerStats?.get(playerId);
        if (stats?.def_st_sack) {
          total += stats.def_st_sack;
        }
      });
      return total > 0 ? total : null;
    },
    formatValue: value => `${value} sacks`,
  },

  // Defensive Interceptions - Team Total
  {
    id: 'most_def_ints',
    name: 'Team INTs (Defense)',
    description: 'Total interceptions by all defensive starters in a week',
    group: 'weekly_player',
    type: 'highest',
    scope: 'weekly',
    calculateValue: (matchup: EnhancedMatchup) => {
      if (!matchup.starters || !matchup.playerStats) return null;
      let total = 0;
      matchup.starters.forEach(playerId => {
        const stats = matchup.playerStats?.get(playerId);
        if (stats?.def_st_int) {
          total += stats.def_st_int;
        }
      });
      return total > 0 ? total : null;
    },
    formatValue: value => `${value} INTs`,
  },

  // Fumbles Lost - Team Total
  {
    id: 'most_fumbles_lost',
    name: 'Team Fumbles Lost',
    description: 'Total fumbles lost by all starters',
    group: 'weekly_player',
    type: 'highest',
    scope: 'weekly',
    calculateValue: (matchup: EnhancedMatchup) => {
      if (!matchup.starters || !matchup.playerStats) return null;
      let total = 0;
      matchup.starters.forEach(playerId => {
        const stats = matchup.playerStats?.get(playerId);
        if (stats?.fum_lost) {
          total += stats.fum_lost;
        }
      });
      return total > 0 ? total : null;
    },
    formatValue: value => `${value} fumbles`,
  },

  // Fantasy Points
  {
    id: 'highest_single_player_score',
    name: 'Single Player Score Record',
    description: 'Highest fantasy score by any starter',
    group: 'weekly_player',
    type: 'highest',
    scope: 'weekly',
    calculateValue: (matchup: EnhancedMatchup) => {
      if (!matchup.starters_points) return null;
      const maxScore = Math.max(...matchup.starters_points);
      return maxScore > 0 ? maxScore : null;
    },
    formatValue: value => `${value.toFixed(2)} pts`,
  },
];

/**
 * Win Probability Based Categories
 * Using LiveWinProbSample data from the database
 */
export const WIN_PROBABILITY_CATEGORIES: HallOfFameCategory[] = [
  {
    id: 'most_exciting_game_winprob',
    name: 'Most Exciting Game (Win Prob)',
    description: 'Game with highest excitement score based on win probability swings',
    group: 'weekly_matchup',
    type: 'highest',
    scope: 'weekly',
    calculateValue: (matchup: EnhancedMatchup) => {
      return matchup.excitementScore || null;
    },
    formatValue: value => `${value.toFixed(1)} excitement score`,
  },
  {
    id: 'biggest_comeback',
    name: 'Biggest Comeback',
    description: 'Largest win probability deficit overcome for victory',
    group: 'weekly_matchup',
    type: 'highest',
    scope: 'weekly',
    calculateValue: (matchup: EnhancedMatchup) => {
      if (!matchup.winProbSamples || !matchup.won) return null;

      // Find the lowest win probability for the winning team
      let lowestWinProb = 1.0;
      matchup.winProbSamples.forEach(sample => {
        const winProb = matchup.rosterId === sample.rosterAId ? sample.winProbA : sample.winProbB;
        lowestWinProb = Math.min(lowestWinProb, winProb);
      });

      // Comeback size is 1 - lowest win prob (if they won)
      return matchup.won ? (1 - lowestWinProb) * 100 : null;
    },
    formatValue: value => `${value.toFixed(1)}% comeback`,
  },
  {
    id: 'biggest_collapse',
    name: 'Biggest Collapse',
    description: 'Largest win probability lead blown for a loss',
    group: 'weekly_matchup',
    type: 'highest',
    scope: 'weekly',
    calculateValue: (matchup: EnhancedMatchup) => {
      if (!matchup.winProbSamples || matchup.won !== false) return null;

      // Find the highest win probability for the losing team
      let highestWinProb = 0;
      matchup.winProbSamples.forEach(sample => {
        const winProb = matchup.rosterId === sample.rosterAId ? sample.winProbA : sample.winProbB;
        highestWinProb = Math.max(highestWinProb, winProb);
      });

      // Collapse size is highest win prob (if they lost)
      return !matchup.won ? highestWinProb * 100 : null;
    },
    formatValue: value => `${value.toFixed(1)}% collapse`,
  },
  {
    id: 'most_lead_changes',
    name: 'Most Lead Changes',
    description: 'Game with the most win probability lead changes',
    group: 'weekly_matchup',
    type: 'highest',
    scope: 'weekly',
    calculateValue: (matchup: EnhancedMatchup) => {
      if (!matchup.winProbSamples || matchup.winProbSamples.length < 2) return null;

      let leadChanges = 0;
      let lastLeader = matchup.winProbSamples[0].winProbA > 0.5 ? 'A' : 'B';

      for (let i = 1; i < matchup.winProbSamples.length; i++) {
        const currentLeader = matchup.winProbSamples[i].winProbA > 0.5 ? 'A' : 'B';
        if (currentLeader !== lastLeader) {
          leadChanges++;
          lastLeader = currentLeader;
        }
      }

      return leadChanges;
    },
    formatValue: value => `${value} lead changes`,
  },
];

/**
 * C. ROLLING WINDOWS - TEAM SUBJECT
 * Aggregated stats over multiple weeks
 */
export const ROLLING_WINDOW_CATEGORIES: HallOfFameCategory[] = [
  {
    id: 'highest_3week_total',
    name: 'Highest 3-Week Total',
    description: 'Most points scored over any 3-week span',
    group: 'rolling_windows',
    type: 'highest',
    scope: 'rolling',
    calculateValue: (data: RollingWindowData) => {
      // Use windowSize === 3 and totalPoints
      return data.windowSize === 3 ? data.totalPoints : null;
    },
    formatValue: value => `${value.toFixed(2)} pts (3 weeks)`,
  },
  {
    id: 'lowest_3week_total',
    name: 'Lowest 3-Week Total',
    description: 'Fewest points scored over any 3-week span',
    group: 'rolling_windows',
    type: 'lowest',
    scope: 'rolling',
    calculateValue: (data: RollingWindowData) => {
      return data.windowSize === 3 ? data.totalPoints : null;
    },
    formatValue: value => `${value.toFixed(2)} pts (3 weeks)`,
  },
  {
    id: 'hot_streak',
    name: 'Hot Streak',
    description: 'Most consecutive weeks above league median',
    group: 'rolling_windows',
    type: 'highest',
    scope: 'rolling',
    calculateValue: (data: RollingWindowData) => {
      return data.aboveMedianCount || null;
    },
    formatValue: value => `${value} weeks`,
  },
  {
    id: 'cold_streak',
    name: 'Cold Streak',
    description: 'Most consecutive weeks below league median',
    group: 'rolling_windows',
    type: 'highest',
    scope: 'rolling',
    calculateValue: (data: RollingWindowData) => {
      return data.belowMedianCount || null;
    },
    formatValue: value => `${value} weeks`,
  },
];

/**
 * D. SEASONAL - TEAM SUBJECT
 * Full season aggregated stats
 */
export const SEASONAL_CATEGORIES: HallOfFameCategory[] = [
  {
    id: 'season_total_points',
    name: 'Season Points Record',
    description: 'Most total points in a season',
    group: 'seasonal',
    type: 'highest',
    scope: 'seasonal',
    calculateValue: (data: SeasonalData) => {
      return data.totalPoints || null;
    },
    formatValue: value => `${value.toFixed(2)} pts`,
  },
  {
    id: 'season_wins',
    name: 'Most Wins',
    description: 'Most wins in a regular season',
    group: 'seasonal',
    type: 'highest',
    scope: 'seasonal',
    calculateValue: (data: SeasonalData) => {
      return data.wins || null;
    },
    formatValue: value => `${value} wins`,
  },
  {
    id: 'season_luck_delta',
    name: 'Luckiest Season',
    description: 'Biggest positive luck differential (actual wins - expected wins)',
    group: 'seasonal',
    type: 'highest',
    scope: 'seasonal',
    calculateValue: (data: SeasonalData) => {
      return data.luckDelta || null;
    },
    formatValue: value => `+${value.toFixed(2)} luck`,
  },
  {
    id: 'season_unlucky',
    name: 'Unluckiest Season',
    description: 'Biggest negative luck differential',
    group: 'seasonal',
    type: 'lowest',
    scope: 'seasonal',
    calculateValue: (data: SeasonalData) => {
      return data.luckDelta || null;
    },
    formatValue: value => `${value.toFixed(2)} luck`,
  },
  {
    id: 'total_donuts_season',
    name: 'Season Donut King',
    description: 'Most starters with 0 points across the season',
    group: 'seasonal',
    type: 'highest',
    scope: 'seasonal',
    calculateValue: (data: SeasonalData) => {
      return data.totalDonuts || null;
    },
    formatValue: value => `${value} donuts`,
  },
  {
    id: 'longest_win_streak',
    name: 'Longest Win Streak',
    description: 'Most consecutive wins',
    group: 'seasonal',
    type: 'highest',
    scope: 'seasonal',
    calculateValue: (data: SeasonalData) => {
      return data.longestWinStreak || null;
    },
    formatValue: value => `${value} straight wins`,
  },
  {
    id: 'longest_losing_streak',
    name: 'Longest Losing Streak',
    description: 'Most consecutive losses',
    group: 'seasonal',
    type: 'highest',
    scope: 'seasonal',
    calculateValue: (data: SeasonalData) => {
      return data.longestLosingStreak || null;
    },
    formatValue: value => `${value} straight losses`,
  },
];

/**
 * G. PLAYOFF-SPECIFIC - TEAM SUBJECT
 */
export const PLAYOFF_CATEGORIES: HallOfFameCategory[] = [
  {
    id: 'playoff_high_score',
    name: 'Playoff Points Record',
    description: 'Highest score in a playoff game',
    group: 'playoff',
    type: 'highest',
    scope: 'playoff',
    calculateValue: (matchup: EnhancedMatchup) => {
      if (!matchup.isPlayoff) return null;
      return matchup.points || 0;
    },
    formatValue: value => `${value.toFixed(2)} pts`,
  },
  {
    id: 'playoff_upset',
    name: 'Biggest Playoff Upset',
    description: 'Lowest seed defeating highest seed',
    group: 'playoff',
    type: 'highest',
    scope: 'playoff',
    calculateValue: (matchup: EnhancedMatchup & { upsetMagnitude?: number }) => {
      if (!matchup.upsetMagnitude) return null;
      return matchup.upsetMagnitude;
    },
    formatValue: value => `${value} seed differential`,
  },
];

/**
 * Export all expanded categories
 */
export const ALL_EXPANDED_CATEGORIES: HallOfFameCategory[] = [
  ...WEEKLY_PLAYER_CATEGORIES,
  ...WIN_PROBABILITY_CATEGORIES,
  ...ROLLING_WINDOW_CATEGORIES,
  ...SEASONAL_CATEGORIES,
  ...PLAYOFF_CATEGORIES,
];

/**
 * Combine with existing categories
 */
export const getAllCategories = (): HallOfFameCategory[] => {
  return [...ALL_HALL_OF_FAME_CATEGORIES, ...ALL_EXPANDED_CATEGORIES];
};

/**
 * Get category info from ALL categories (base + expanded)
 * Use this instead of getCategoryInfo when working with expanded categories
 */
export const getCategoryInfoExpanded = (categoryId: string): HallOfFameCategory | undefined => {
  const allCategories = getAllCategories();
  return allCategories.find(c => c.id === categoryId);
};

/**
 * Get expanded categories grouped
 */
export const getExpandedCategoriesGrouped = (): Map<string, HallOfFameCategory[]> => {
  const grouped = new Map<string, HallOfFameCategory[]>();

  grouped.set('Player Records', WEEKLY_PLAYER_CATEGORIES);
  grouped.set('Win Probability', WIN_PROBABILITY_CATEGORIES);
  grouped.set('Rolling Windows', ROLLING_WINDOW_CATEGORIES);
  grouped.set('Season Records', SEASONAL_CATEGORIES);
  grouped.set('Playoff Records', PLAYOFF_CATEGORIES);

  return grouped;
};
