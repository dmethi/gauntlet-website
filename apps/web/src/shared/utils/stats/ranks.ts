/**
 * Ranking utilities for stats calculations
 */

/**
 * Rank values from 1 to N where 1 is the highest value
 * Handles ties by giving them the same rank (dense ranking)
 * @param values Array of numeric values to rank
 * @returns Array of ranks in same order as input
 */
export function rank(values: number[]): number[] {
  // Create array of indices with values
  const indexed = values.map((value, index) => ({ value, index }));

  // Sort by value descending (highest first)
  const sorted = [...indexed].sort((a, b) => b.value - a.value);

  // Assign ranks
  const ranks = new Array(values.length);
  let currentRank = 1;

  for (let i = 0; i < sorted.length; i++) {
    // Check if this value is different from previous
    if (i > 0 && sorted[i].value !== sorted[i - 1].value) {
      currentRank = i + 1; // Next rank
    }
    ranks[sorted[i].index] = currentRank;
  }

  return ranks;
}

/**
 * Get percentile rank (0-100) where 100 is best
 */
export function percentileRank(values: number[]): number[] {
  const ranks = rank(values);
  const n = values.length;

  return ranks.map(r => {
    // Convert rank to percentile
    // rank 1 = 100th percentile, rank n = 0th percentile
    return ((n - r + 1) / n) * 100;
  });
}

/**
 * Rank teams within their leagues
 */
export function rankWithinLeagues(
  values: Map<string, number>,
  leagueRosterMap: Map<string, string>, // rosterId -> leagueId
): Map<string, number> {
  // Group by league
  const leagueGroups = new Map<string, { rosterId: string; value: number }[]>();

  for (const [rosterId, value] of values.entries()) {
    const leagueId = leagueRosterMap.get(rosterId);
    if (!leagueId) continue;

    const group = leagueGroups.get(leagueId) || [];
    group.push({ rosterId, value });
    leagueGroups.set(leagueId, group);
  }

  // Rank within each league
  const leagueRanks = new Map<string, number>();

  for (const [, group] of leagueGroups.entries()) {
    const sortedValues = group.map(g => g.value);
    const ranks = rank(sortedValues);

    group.forEach((item, index) => {
      leagueRanks.set(item.rosterId, ranks[index]);
    });
  }

  return leagueRanks;
}
