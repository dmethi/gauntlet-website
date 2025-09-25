/**
 * Comprehensive Hall of Fame & Shame category definitions
 * Organized by scope and subject as specified
 */

import { HallOfFameCategory, ProcessedMatchup } from './hall-of-fame-calculations';

// Helper function to get positional points from a matchup
function getPositionalPoints(matchup: ProcessedMatchup, position: string): number {
  if (!matchup.starters || !matchup.starters_points || !matchup.playerData) return 0;

  let total = 0;
  matchup.starters.forEach((playerId: string, idx: number) => {
    const player = matchup.playerData?.get(playerId);
    if (player?.position === position) {
      total += matchup.starters_points?.[idx] || 0;
    }
  });
  return total;
}

// Helper to count starters with 0 points
function countDonuts(matchup: ProcessedMatchup): number {
  if (!matchup.starters_points) return 0;
  return matchup.starters_points.filter((pts: number) => pts === 0).length;
}

// Helper to calculate optimal lineup score
function getOptimalScore(matchup: ProcessedMatchup): number {
  if (!matchup.players_points || !matchup.playerData) return matchup.points || 0;

  // Group players by position
  const byPosition = new Map<string, Array<{ id: string; points: number }>>();
  Object.entries(matchup.players_points).forEach(([playerId, points]) => {
    const player = matchup.playerData?.get(playerId);
    if (player) {
      const pos = player.position;
      if (!byPosition.has(pos)) byPosition.set(pos, []);
      byPosition.get(pos)!.push({ id: playerId, points: points as number });
    }
  });

  // Sort each position by points
  byPosition.forEach(players => players.sort((a, b) => b.points - a.points));

  // Select optimal lineup based on standard roster requirements
  // This is simplified - would need actual league settings for perfect accuracy
  let optimal = 0;
  const roster = {
    QB: 1,
    RB: 2,
    WR: 2,
    TE: 1,
    FLEX: 1, // RB/WR/TE
    DEF: 1,
  };

  // Fill required positions
  Object.entries(roster).forEach(([pos, count]) => {
    if (pos === 'FLEX') {
      // FLEX can be RB, WR, or TE
      const flexEligible = [
        ...(byPosition.get('RB') || []).slice(2), // RBs beyond the 2 starters
        ...(byPosition.get('WR') || []).slice(2), // WRs beyond the 2 starters
        ...(byPosition.get('TE') || []).slice(1), // TEs beyond the 1 starter
      ].sort((a, b) => b.points - a.points);
      if (flexEligible[0]) optimal += flexEligible[0].points;
    } else {
      const players = byPosition.get(pos) || [];
      for (let i = 0; i < count && i < players.length; i++) {
        optimal += players[i].points;
      }
    }
  });

  return optimal;
}

/**
 * A. WEEKLY - TEAM SUBJECT
 */
export const WEEKLY_TEAM_CATEGORIES: HallOfFameCategory[] = [
  // 1. Score & Margin
  {
    id: 'highest_team_points',
    name: 'Highest Team Points',
    description: 'Highest team points in any week',
    group: 'weekly_team',
    type: 'highest',
    calculateValue: matchup => matchup.points || 0,
    formatValue: value => `${value.toFixed(2)} pts`,
  },
  {
    id: 'lowest_team_points',
    name: 'Lowest Team Points',
    description: 'Lowest team points in any week (above 0)',
    group: 'weekly_team',
    type: 'lowest',
    calculateValue: matchup => {
      const points = matchup.points || 0;
      return points > 0 ? points : null;
    },
    formatValue: value => `${value.toFixed(2)} pts`,
  },
  {
    id: 'most_points_loss',
    name: 'Most Points in Loss',
    description: 'Highest score by a losing team',
    group: 'weekly_team',
    type: 'highest',
    calculateValue: matchup => {
      if (matchup.won !== false) return null;
      return matchup.points || 0;
    },
    formatValue: value => `Lost with ${value.toFixed(2)} pts`,
  },
  {
    id: 'fewest_points_win',
    name: 'Fewest Points in Win',
    description: 'Lowest score by a winning team',
    group: 'weekly_team',
    type: 'lowest',
    calculateValue: matchup => {
      if (matchup.won !== true) return null;
      return matchup.points || 0;
    },
    formatValue: value => `Won with ${value.toFixed(2)} pts`,
  },
  {
    id: 'largest_margin_victory',
    name: 'Largest Victory Margin',
    description: 'Biggest margin of victory',
    group: 'weekly_team',
    type: 'highest',
    calculateValue: matchup => {
      if (!matchup.opponentPoints || !matchup.won) return null;
      return matchup.points - matchup.opponentPoints;
    },
    formatValue: value => `Won by ${value.toFixed(2)} pts`,
  },
  {
    id: 'smallest_margin_victory',
    name: 'Narrowest Victory',
    description: 'Smallest margin of victory',
    group: 'weekly_team',
    type: 'lowest',
    calculateValue: matchup => {
      if (!matchup.opponentPoints || !matchup.won) return null;
      const margin = matchup.points - matchup.opponentPoints;
      return margin > 0 ? margin : null;
    },
    formatValue: value => `Won by ${value.toFixed(2)} pts`,
  },

  // 2. Lineup Quality
  {
    id: 'bench_blunder',
    name: 'Bench Blunder',
    description: 'Largest difference between optimal and actual lineup',
    group: 'weekly_team',
    type: 'highest',
    calculateValue: matchup => {
      const optimal = getOptimalScore(matchup);
      const actual = matchup.points || 0;
      return optimal - actual;
    },
    formatValue: value => `${value.toFixed(2)} pts left on bench`,
  },
  {
    id: 'total_donuts',
    name: 'Total Donuts',
    description: 'Most starters with 0 points',
    group: 'weekly_team',
    type: 'highest',
    calculateValue: matchup => countDonuts(matchup),
    formatValue: value => `${value} donuts`,
  },
  {
    id: 'most_negative_starters',
    name: 'Negative Starters',
    description: 'Most starters with negative points',
    group: 'weekly_team',
    type: 'highest',
    calculateValue: matchup => {
      if (!matchup.starters_points) return 0;
      return matchup.starters_points.filter((pts: number) => pts < 0).length;
    },
    formatValue: value => `${value} negative starters`,
  },

  // 3. Positional Splits (starters only)
  {
    id: 'qb_points_weekly',
    name: 'QB Points',
    description: 'QB starter points in a week - highest and lowest',
    group: 'weekly_team',
    type: 'both',
    calculateValue: matchup => {
      const pts = getPositionalPoints(matchup, 'QB');
      return pts > 0 ? pts : null; // Exclude weeks with no QB
    },
    formatValue: value => `${value.toFixed(2)} QB pts`,
  },
  {
    id: 'rb_points_weekly',
    name: 'RB Points',
    description: 'RB starter points in a week - highest and lowest',
    group: 'weekly_team',
    type: 'both',
    calculateValue: matchup => {
      const pts = getPositionalPoints(matchup, 'RB');
      return pts > 0 ? pts : null;
    },
    formatValue: value => `${value.toFixed(2)} RB pts`,
  },
  {
    id: 'wr_points_weekly',
    name: 'WR Points',
    description: 'WR starter points in a week - highest and lowest',
    group: 'weekly_team',
    type: 'both',
    calculateValue: matchup => {
      const pts = getPositionalPoints(matchup, 'WR');
      return pts > 0 ? pts : null;
    },
    formatValue: value => `${value.toFixed(2)} WR pts`,
  },
  {
    id: 'te_points_weekly',
    name: 'TE Points',
    description: 'TE starter points in a week - highest and lowest',
    group: 'weekly_team',
    type: 'both',
    calculateValue: matchup => {
      const pts = getPositionalPoints(matchup, 'TE');
      return pts > 0 ? pts : null;
    },
    formatValue: value => `${value.toFixed(2)} TE pts`,
  },
  {
    id: 'def_points_weekly',
    name: 'DEF Points',
    description: 'DEF starter points in a week - highest and lowest',
    group: 'weekly_team',
    type: 'both',
    calculateValue: matchup => {
      const pts = getPositionalPoints(matchup, 'DEF');
      return pts > 0 ? pts : null;
    },
    formatValue: value => `${value.toFixed(2)} DEF pts`,
  },
  {
    id: 'highest_top3_sum',
    name: 'Highest Top 3 Starters',
    description: 'Highest combined points from top 3 starters',
    group: 'weekly_team',
    type: 'highest',
    calculateValue: matchup => {
      if (!matchup.starters_points) return 0;
      const sorted = [...matchup.starters_points].sort((a, b) => b - a);
      return sorted.slice(0, 3).reduce((sum, pts) => sum + pts, 0);
    },
    formatValue: value => `${value.toFixed(2)} pts (top 3)`,
  },
  {
    id: 'lowest_bottom3_sum',
    name: 'Lowest Bottom 3 Starters',
    description: 'Lowest combined points from bottom 3 starters',
    group: 'weekly_team',
    type: 'lowest',
    calculateValue: matchup => {
      if (!matchup.starters_points) return null;
      const sorted = [...matchup.starters_points].sort((a, b) => a - b);
      return sorted.slice(0, 3).reduce((sum, pts) => sum + pts, 0);
    },
    formatValue: value => `${value.toFixed(2)} pts (bottom 3)`,
  },

  // 4. Volatility / Consistency
  {
    id: 'star_concentration',
    name: 'Star Concentration',
    description: 'Highest % of points from top 2 starters',
    group: 'weekly_team',
    type: 'highest',
    calculateValue: matchup => {
      if (!matchup.starters_points || matchup.points === 0) return 0;
      const sorted = [...matchup.starters_points].sort((a, b) => b - a);
      const top2 = sorted.slice(0, 2).reduce((sum, pts) => sum + pts, 0);
      return (top2 / matchup.points) * 100;
    },
    formatValue: value => `${value.toFixed(1)}% from top 2`,
  },
  // Note: Boom/bust counts would require positional baselines which need historical data
];

// Helper to calculate combined positional points for both teams in a matchup
// Note: This will be calculated during the record processing phase where we have access to both teams
function getCombinedPositionalPoints(
  matchup: ProcessedMatchup,
  position: string,
  allMatchups?: ProcessedMatchup[]
): number {
  const teamPoints = getPositionalPoints(matchup, position);

  // If we have access to all matchups, find the opponent
  if (allMatchups && matchup.matchupId && matchup.leagueId && matchup.week) {
    const opponentMatchup = allMatchups.find(
      m =>
        m.matchupId === matchup.matchupId &&
        m.leagueId === matchup.leagueId &&
        m.week === matchup.week &&
        m.rosterId !== matchup.rosterId
    );

    if (opponentMatchup) {
      const opponentPoints = getPositionalPoints(opponentMatchup, position);
      const combined = teamPoints + opponentPoints;
      return combined;
    }
  }

  // Fallback: just return team points if opponent data not available
  return teamPoints;
}

/**
 * B. WEEKLY - MATCHUP SUBJECT
 */
export const WEEKLY_MATCHUP_CATEGORIES: HallOfFameCategory[] = [
  {
    id: 'most_exciting_game',
    name: 'Most Exciting Game',
    description: 'Composite of close margin and high scoring',
    group: 'weekly_matchup',
    type: 'highest',
    calculateValue: matchup => {
      if (!matchup.opponentPoints) return null;
      const totalPoints = matchup.points + matchup.opponentPoints;
      const margin = Math.abs(matchup.points - matchup.opponentPoints);
      // Higher total points and lower margin = more exciting
      // Normalize: (total/300) * (1 - margin/100)
      const excitement = (totalPoints / 300) * (1 - Math.min(margin / 100, 1));
      return excitement * 100; // Convert to percentage
    },
    formatValue: value => `${value.toFixed(1)} excitement score`,
  },
  {
    id: 'biggest_blowout',
    name: 'Biggest Blowout',
    description: 'Largest margin in any matchup',
    group: 'weekly_matchup',
    type: 'highest',
    calculateValue: matchup => {
      if (!matchup.opponentPoints) return null;
      return Math.abs(matchup.points - matchup.opponentPoints);
    },
    formatValue: value => `${value.toFixed(2)} pt margin`,
  },
  {
    id: 'closest_game',
    name: 'Closest Game',
    description: 'Smallest margin in any matchup',
    group: 'weekly_matchup',
    type: 'lowest',
    calculateValue: matchup => {
      if (!matchup.opponentPoints) return null;
      const margin = Math.abs(matchup.points - matchup.opponentPoints);
      return margin > 0 ? margin : null;
    },
    formatValue: value => `${value.toFixed(2)} pt margin`,
  },
  {
    id: 'highest_combined',
    name: 'Highest Combined Score',
    description: 'Most total points in a matchup',
    group: 'weekly_matchup',
    type: 'highest',
    calculateValue: matchup => {
      if (!matchup.opponentPoints) return null;
      return matchup.points + matchup.opponentPoints;
    },
    formatValue: value => `${value.toFixed(2)} combined pts`,
  },
  {
    id: 'lowest_combined',
    name: 'Lowest Combined Score',
    description: 'Fewest total points in a matchup',
    group: 'weekly_matchup',
    type: 'lowest',
    calculateValue: matchup => {
      if (!matchup.opponentPoints) return null;
      const total = matchup.points + matchup.opponentPoints;
      return total > 0 ? total : null;
    },
    formatValue: value => `${value.toFixed(2)} combined pts`,
  },
  {
    id: 'most_one_sided',
    name: 'Most One-Sided',
    description: 'Large margin with embarrassingly low loser score',
    group: 'weekly_matchup',
    type: 'highest',
    calculateValue: matchup => {
      if (!matchup.opponentPoints) return null;
      const loserScore = Math.min(matchup.points, matchup.opponentPoints);
      const margin = Math.abs(matchup.points - matchup.opponentPoints);
      // Penalize low loser scores more heavily
      return margin * (2 - loserScore / 100);
    },
    formatValue: value => `${value.toFixed(1)} dominance score`,
  },

  // Combined Positional Superlatives
  {
    id: 'highest_combined_qb',
    name: 'Highest Combined QB Score',
    description: 'Most QB points from both teams in a matchup',
    group: 'weekly_matchup',
    type: 'highest',
    calculateValue: (matchup, allMatchups) => {
      const combined = getCombinedPositionalPoints(matchup, 'QB', allMatchups);
      return combined > 0 ? combined : null;
    },
    formatValue: value => `${value.toFixed(2)} combined QB pts`,
  },
  {
    id: 'lowest_combined_qb',
    name: 'Lowest Combined QB Score',
    description: 'Fewest QB points from both teams in a matchup',
    group: 'weekly_matchup',
    type: 'lowest',
    calculateValue: (matchup, allMatchups) => {
      const combined = getCombinedPositionalPoints(matchup, 'QB', allMatchups);
      return combined > 0 ? combined : null;
    },
    formatValue: value => `${value.toFixed(2)} combined QB pts`,
  },
  {
    id: 'highest_combined_rb',
    name: 'Highest Combined RB Score',
    description: 'Most RB points from both teams in a matchup',
    group: 'weekly_matchup',
    type: 'highest',
    calculateValue: (matchup, allMatchups) => {
      const combined = getCombinedPositionalPoints(matchup, 'RB', allMatchups);
      return combined > 0 ? combined : null;
    },
    formatValue: value => `${value.toFixed(2)} combined RB pts`,
  },
  {
    id: 'lowest_combined_rb',
    name: 'Lowest Combined RB Score',
    description: 'Fewest RB points from both teams in a matchup',
    group: 'weekly_matchup',
    type: 'lowest',
    calculateValue: (matchup, allMatchups) => {
      const combined = getCombinedPositionalPoints(matchup, 'RB', allMatchups);
      return combined > 0 ? combined : null;
    },
    formatValue: value => `${value.toFixed(2)} combined RB pts`,
  },
  {
    id: 'highest_combined_wr',
    name: 'Highest Combined WR Score',
    description: 'Most WR points from both teams in a matchup',
    group: 'weekly_matchup',
    type: 'highest',
    calculateValue: (matchup, allMatchups) => {
      const combined = getCombinedPositionalPoints(matchup, 'WR', allMatchups);
      return combined > 0 ? combined : null;
    },
    formatValue: value => `${value.toFixed(2)} combined WR pts`,
  },
  {
    id: 'lowest_combined_wr',
    name: 'Lowest Combined WR Score',
    description: 'Fewest WR points from both teams in a matchup',
    group: 'weekly_matchup',
    type: 'lowest',
    calculateValue: (matchup, allMatchups) => {
      const combined = getCombinedPositionalPoints(matchup, 'WR', allMatchups);
      return combined > 0 ? combined : null;
    },
    formatValue: value => `${value.toFixed(2)} combined WR pts`,
  },
  {
    id: 'highest_combined_te',
    name: 'Highest Combined TE Score',
    description: 'Most TE points from both teams in a matchup',
    group: 'weekly_matchup',
    type: 'highest',
    calculateValue: (matchup, allMatchups) => {
      const combined = getCombinedPositionalPoints(matchup, 'TE', allMatchups);
      return combined > 0 ? combined : null;
    },
    formatValue: value => `${value.toFixed(2)} combined TE pts`,
  },
  {
    id: 'lowest_combined_te',
    name: 'Lowest Combined TE Score',
    description: 'Fewest TE points from both teams in a matchup',
    group: 'weekly_matchup',
    type: 'lowest',
    calculateValue: (matchup, allMatchups) => {
      const combined = getCombinedPositionalPoints(matchup, 'TE', allMatchups);
      return combined > 0 ? combined : null;
    },
    formatValue: value => `${value.toFixed(2)} combined TE pts`,
  },
  {
    id: 'highest_combined_def',
    name: 'Highest Combined DEF Score',
    description: 'Most DEF points from both teams in a matchup',
    group: 'weekly_matchup',
    type: 'highest',
    calculateValue: (matchup, allMatchups) => {
      const combined = getCombinedPositionalPoints(matchup, 'DEF', allMatchups);
      return combined > 0 ? combined : null;
    },
    formatValue: value => `${value.toFixed(2)} combined DEF pts`,
  },
  {
    id: 'lowest_combined_def',
    name: 'Lowest Combined DEF Score',
    description: 'Fewest DEF points from both teams in a matchup',
    group: 'weekly_matchup',
    type: 'lowest',
    calculateValue: (matchup, allMatchups) => {
      const combined = getCombinedPositionalPoints(matchup, 'DEF', allMatchups);
      return combined > 0 ? combined : null;
    },
    formatValue: value => `${value.toFixed(2)} combined DEF pts`,
  },
];

/**
 * Export all categories
 * Note: Rolling windows, seasonal, and player-specific categories would require
 * additional data aggregation beyond single matchup data
 */
export const ALL_HALL_OF_FAME_CATEGORIES: HallOfFameCategory[] = [
  ...WEEKLY_TEAM_CATEGORIES,
  ...WEEKLY_MATCHUP_CATEGORIES,
];

/**
 * Get categories grouped by type
 */
export function getCategoriesGrouped(): Map<string, HallOfFameCategory[]> {
  const grouped = new Map<string, HallOfFameCategory[]>();

  // Group A: Weekly Team Subject
  const weeklyTeamScoring = WEEKLY_TEAM_CATEGORIES.filter(c =>
    [
      'highest_team_points',
      'lowest_team_points',
      'most_points_loss',
      'fewest_points_win',
      'largest_margin_victory',
      'smallest_margin_victory',
    ].includes(c.id)
  );
  grouped.set('Score & Margin', weeklyTeamScoring);

  const weeklyTeamLineup = WEEKLY_TEAM_CATEGORIES.filter(c =>
    ['bench_blunder', 'total_donuts', 'most_negative_starters'].includes(c.id)
  );
  grouped.set('Lineup Quality', weeklyTeamLineup);

  const weeklyTeamPositional = WEEKLY_TEAM_CATEGORIES.filter(
    c =>
      c.id.includes('_qb_') ||
      c.id.includes('_rb_') ||
      c.id.includes('_wr_') ||
      c.id.includes('_te_') ||
      c.id.includes('_def_') ||
      c.id.includes('top3') ||
      c.id.includes('bottom3')
  );
  grouped.set('Positional Splits', weeklyTeamPositional);

  const weeklyTeamVolatility = WEEKLY_TEAM_CATEGORIES.filter(c =>
    ['star_concentration'].includes(c.id)
  );
  grouped.set('Volatility/Consistency', weeklyTeamVolatility);

  // Group B: Weekly Matchup Subject
  grouped.set('Matchup Records', WEEKLY_MATCHUP_CATEGORIES);

  return grouped;
}
