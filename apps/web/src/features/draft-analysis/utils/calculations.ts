/**
 * Draft Analysis Calculation Utilities
 *
 * Pure calculation functions for manager analytics and draft analysis.
 * Extracted from lib/manager-analytics.ts for better testability and separation of concerns.
 */

import type {
  DraftPickRow,
  PlayerAnalysis,
  PlayerLevelAnalytics,
  PlayerOverlap,
  PlayerOverlapAnalytics,
} from '../types';
import type { MockDraft } from '@/lib/draft-generator';

// ============================================================================
// Lineup Inference
// ============================================================================

/**
 * Helper function to infer starters vs bench based on positional requirements
 *
 * @param teamPicks - Array of team draft picks
 * @returns Object with starters and bench arrays
 *
 * @example
 * ```typescript
 * const { starters, bench } = inferStarters(teamPicks);
 * console.log(`Starters: ${starters.length}, Bench: ${bench.length}`);
 * ```
 */
export const inferStarters = (teamPicks: any[]): { starters: any[]; bench: any[] } => {
  const starters: any[] = [];
  const bench: any[] = [];

  // Positional requirements for starters
  type PositionKey = 'QB' | 'RB' | 'WR' | 'TE' | 'DEF' | 'FLEX';
  const requirements: Record<PositionKey, number> = { QB: 1, RB: 2, WR: 2, TE: 1, DEF: 1, FLEX: 2 };
  const filled: Record<'QB' | 'RB' | 'WR' | 'TE' | 'DEF', number> = {
    QB: 0,
    RB: 0,
    WR: 0,
    TE: 0,
    DEF: 0,
  };

  // Sort picks by price descending to get best players first
  const sortedPicks = [...teamPicks].sort((a, b) => b.actualPrice - a.actualPrice);

  // Fill required positions
  for (const pick of sortedPicks) {
    const pos = pick.player.position as 'QB' | 'RB' | 'WR' | 'TE' | 'DEF' | 'FLEX';
    if ((filled as any)[pos] < (requirements as any)[pos]) {
      starters.push(pick);
      (filled as any)[pos]++;
    }
  }

  // Fill FLEX spots with highest remaining RB/WR/TE
  const flexEligible = sortedPicks.filter(
    pick => ['RB', 'WR', 'TE'].includes(pick.player.position) && !starters.includes(pick),
  );

  for (let i = 0; i < requirements.FLEX && i < flexEligible.length; i++) {
    starters.push(flexEligible[i]);
  }

  // Rest are bench
  for (const pick of teamPicks) {
    if (!starters.includes(pick)) {
      bench.push(pick);
    }
  }

  return { starters, bench };
};

// ============================================================================
// Statistical Calculations
// ============================================================================

/**
 * Calculate Gini coefficient for a team's spending distribution
 *
 * The Gini coefficient measures inequality in spending. Values closer to 1
 * indicate high concentration (stars & scrubs strategy), while values closer
 * to 0 indicate balanced spending.
 *
 * @param prices - Array of player prices
 * @returns Gini coefficient [0, 1]
 *
 * @example
 * ```typescript
 * const gini = calculateGini([60, 50, 30, 20, 10, 10, 10, 10]);
 * console.log(`Gini coefficient: ${gini.toFixed(2)}`); // 0.45
 * ```
 */
export const calculateGini = (prices: number[]): number => {
  if (prices.length <= 1) return 0;

  const sortedPrices = [...prices].sort((a, b) => a - b);
  const n = sortedPrices.length;
  const sum = sortedPrices.reduce((a, b) => a + b, 0);

  if (sum === 0) return 0;

  let gini = 0;
  for (let i = 0; i < n; i++) {
    gini += (2 * (i + 1) - n - 1) * sortedPrices[i];
  }

  return gini / (n * sum);
};

/**
 * Calculate cosine similarity between two feature vectors
 *
 * @param vecA - First feature vector
 * @param vecB - Second feature vector
 * @returns Cosine similarity score [0, 1] where 1 is identical
 *
 * @example
 * ```typescript
 * const similarity = cosineSimilarity([1, 2, 3], [2, 4, 6]);
 * console.log(`Similarity: ${similarity.toFixed(3)}`); // 1.000 (perfect match)
 * ```
 */
export const cosineSimilarity = (vecA: number[], vecB: number[]): number => {
  if (vecA.length !== vecB.length) return 0;

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }

  if (normA === 0 || normB === 0) return 0;

  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
};

// ============================================================================
// Machine Learning Algorithms
// ============================================================================

/**
 * Simple k-means clustering implementation
 *
 * @param data - 2D array of feature vectors
 * @param k - Number of clusters (default: 4)
 * @param maxIterations - Maximum iterations (default: 100)
 * @returns Object with cluster assignments and centroids
 *
 * @example
 * ```typescript
 * const { clusters, centroids } = kMeansCluster(featureMatrix, 4);
 * console.log(`Cluster assignments: ${clusters}`);
 * ```
 */
export const kMeansCluster = (
  data: number[][],
  k: number = 4,
  maxIterations: number = 100,
): { clusters: number[]; centroids: number[][] } => {
  if (data.length === 0) return { clusters: [], centroids: [] };

  const n = data.length;
  const d = data[0].length;

  // Initialize centroids randomly
  const centroids: number[][] = [];
  for (let i = 0; i < k; i++) {
    const centroid: number[] = [];
    for (let j = 0; j < d; j++) {
      const values = data.map(point => point[j]);
      const min = Math.min(...values);
      const max = Math.max(...values);
      centroid.push(Math.random() * (max - min) + min);
    }
    centroids.push(centroid);
  }

  const assignments = new Array(n).fill(0);

  for (let iter = 0; iter < maxIterations; iter++) {
    // Assign points to closest centroid
    let changed = false;
    for (let i = 0; i < n; i++) {
      let bestCluster = 0;
      let bestDistance = Infinity;

      for (let c = 0; c < k; c++) {
        let distance = 0;
        for (let j = 0; j < d; j++) {
          distance += Math.pow(data[i][j] - centroids[c][j], 2);
        }

        if (distance < bestDistance) {
          bestDistance = distance;
          bestCluster = c;
        }
      }

      if (assignments[i] !== bestCluster) {
        assignments[i] = bestCluster;
        changed = true;
      }
    }

    if (!changed) break;

    // Update centroids
    for (let c = 0; c < k; c++) {
      const clusterPoints = data.filter((_, i) => assignments[i] === c);
      if (clusterPoints.length > 0) {
        for (let j = 0; j < d; j++) {
          centroids[c][j] =
            clusterPoints.reduce((sum, point) => sum + point[j], 0) / clusterPoints.length;
        }
      }
    }
  }

  return { clusters: assignments, centroids };
};

// ============================================================================
// Player Overlap Analytics
// ============================================================================

/**
 * Calculate player overlap analytics between two drafts
 *
 * Identifies copycat managers, mavericks, and overall roster similarities.
 *
 * @param draft1 - First draft (typically AFC)
 * @param draft2 - Second draft (typically NFC)
 * @returns Player overlap analytics with top overlaps, copycats, and mavericks
 *
 * @example
 * ```typescript
 * const overlap = calculatePlayerOverlap(afcDraft, nfcDraft);
 * console.log(`Copycat pairs: ${overlap.copycat_pairs.length}`);
 * console.log(`Top maverick: ${overlap.maverick_managers[0].manager}`);
 * ```
 */
export const calculatePlayerOverlap = (
  draft1: MockDraft,
  draft2: MockDraft,
): PlayerOverlapAnalytics => {
  const leagueAManagers = draft1.teams;
  const leagueBManagers = draft2.teams;
  const allOverlaps: PlayerOverlap[] = [];

  // Calculate overlap for each manager pair across leagues
  leagueAManagers.forEach(managerA => {
    const playerSetA = new Set(managerA.picks.map(pick => pick.player.id));

    leagueBManagers.forEach(managerB => {
      const playerSetB = new Set(managerB.picks.map(pick => pick.player.id));

      // Find shared players
      const sharedPlayerIds = [...playerSetA].filter(id => playerSetB.has(id));
      const sharedPlayerNames = sharedPlayerIds
        .map(id => {
          const pick = managerA.picks.find(p => p.player.id === id);
          return pick?.player.name || '';
        })
        .filter(name => name);

      // Find unique players for each manager
      const managerAOnly = [...playerSetA].filter(id => !playerSetB.has(id));
      const managerBOnly = [...playerSetB].filter(id => !playerSetA.has(id));

      // Calculate total unique players and overlap percentage
      const totalUniquePlayerIds = new Set([...playerSetA, ...playerSetB]);
      const totalUnique = totalUniquePlayerIds.size;
      const overlapPercentage = totalUnique > 0 ? (sharedPlayerIds.length / totalUnique) * 100 : 0;

      allOverlaps.push({
        manager_a: managerA.teamName,
        league_a: draft1.name,
        manager_b: managerB.teamName,
        league_b: draft2.name,
        shared_players: sharedPlayerIds,
        total_unique_players: totalUnique,
        overlap_percentage: overlapPercentage,
        shared_player_names: sharedPlayerNames,
        manager_a_only: managerAOnly,
        manager_b_only: managerBOnly,
      });
    });
  });

  // Sort by overlap percentage descending
  allOverlaps.sort((a, b) => b.overlap_percentage - a.overlap_percentage);

  // Get top overlaps
  const topOverlaps = allOverlaps.slice(0, 10);

  // Calculate average overlap
  const avgOverlapPercentage =
    allOverlaps.reduce((sum, overlap) => sum + overlap.overlap_percentage, 0) / allOverlaps.length;

  // Define copycat threshold (40%+ shared players)
  const copycatThreshold = 40;
  const copycatPairs = allOverlaps.filter(
    overlap => overlap.overlap_percentage >= copycatThreshold,
  );

  // Identify maverick managers (those with low average overlap with others)
  const maverickManagers: {
    manager: string;
    league: string;
    avg_overlap_with_others: number;
    unique_picks_percentage: number;
  }[] = [];

  // Calculate average overlap for each manager
  [...leagueAManagers, ...leagueBManagers].forEach(manager => {
    const isLeagueA = leagueAManagers.includes(manager);
    const leagueName = isLeagueA ? draft1.name : draft2.name;

    const managerOverlaps = allOverlaps.filter(
      overlap =>
        (isLeagueA && overlap.manager_a === manager.teamName) ||
        (!isLeagueA && overlap.manager_b === manager.teamName),
    );

    const avgOverlapWithOthers =
      managerOverlaps.length > 0
        ? managerOverlaps.reduce((sum, overlap) => sum + overlap.overlap_percentage, 0) /
          managerOverlaps.length
        : 0;

    // Calculate unique picks percentage (lower means more overlapping with others)
    const totalPossibleOverlaps = managerOverlaps.length;
    const highOverlapCount = managerOverlaps.filter(
      overlap => overlap.overlap_percentage > avgOverlapPercentage,
    ).length;
    const uniquePicksPercentage =
      totalPossibleOverlaps > 0
        ? ((totalPossibleOverlaps - highOverlapCount) / totalPossibleOverlaps) * 100
        : 100;

    maverickManagers.push({
      manager: manager.teamName,
      league: leagueName,
      avg_overlap_with_others: avgOverlapWithOthers,
      unique_picks_percentage: uniquePicksPercentage,
    });
  });

  // Sort mavericks by lowest average overlap (most unique)
  maverickManagers.sort((a, b) => a.avg_overlap_with_others - b.avg_overlap_with_others);

  return {
    top_overlaps: topOverlaps,
    avg_overlap_percentage: avgOverlapPercentage,
    copycat_threshold: copycatThreshold,
    copycat_pairs: copycatPairs,
    maverick_managers: maverickManagers.slice(0, 6), // Top 6 mavericks
  };
};

// ============================================================================
// Player-Level Analytics
// ============================================================================

/**
 * Calculate comprehensive player-level analytics across two drafts
 *
 * Analyzes price gaps, tier shifts, nomination timing, and generates
 * detailed statistics for every player in both leagues.
 *
 * @param draft1 - First draft (typically AFC)
 * @param draft2 - Second draft (typically NFC)
 * @returns Player-level analytics with comparisons, tier analysis, and histograms
 *
 * @example
 * ```typescript
 * const playerAnalytics = calculatePlayerLevelAnalytics(afcDraft, nfcDraft);
 * console.log(`Top price gap: ${playerAnalytics.top_price_gaps[0].name}`);
 * console.log(`Total players analyzed: ${playerAnalytics.players.length}`);
 * ```
 */
export const calculatePlayerLevelAnalytics = (
  draft1: MockDraft,
  draft2: MockDraft,
): PlayerLevelAnalytics => {
  // Get all unique players across both drafts
  const allPlayerIds = new Set<string>();
  const playerData = new Map<string, { name: string; position: string; aav: number }>();

  // Collect player data from both drafts
  [draft1, draft2].forEach(draft => {
    draft.teams.forEach(team => {
      team.picks.forEach(pick => {
        allPlayerIds.add(pick.player.id);
        playerData.set(pick.player.id, {
          name: pick.player.name,
          position: pick.player.position,
          aav: pick.player.aav,
        });
      });
    });
  });

  // Create player price maps for both leagues
  const leagueAPrices = new Map<string, { price: number; nomIndex: number; team: string }>();
  const leagueBPrices = new Map<string, { price: number; nomIndex: number; team: string }>();

  // Fill price maps
  draft1.teams.forEach(team => {
    team.picks.forEach((pick, index) => {
      leagueAPrices.set(pick.player.id, {
        price: pick.actualPrice,
        nomIndex: index + 1,
        team: team.teamName,
      });
    });
  });

  draft2.teams.forEach(team => {
    team.picks.forEach((pick, index) => {
      leagueBPrices.set(pick.player.id, {
        price: pick.actualPrice,
        nomIndex: index + 1,
        team: team.teamName,
      });
    });
  });

  // Calculate position z-scores for normalization
  const calculatePositionZScores = (draft: MockDraft): Map<string, number> => {
    const posByPosition = new Map<string, number[]>();

    draft.teams.forEach(team => {
      team.picks.forEach(pick => {
        const pos = pick.player.position;
        if (!posByPosition.has(pos)) {
          posByPosition.set(pos, []);
        }
        posByPosition.get(pos)!.push(pick.actualPrice);
      });
    });

    const zScores = new Map<string, number>();

    draft.teams.forEach(team => {
      team.picks.forEach(pick => {
        const pos = pick.player.position;
        const prices = posByPosition.get(pos) || [];
        const mean = prices.reduce((sum, p) => sum + p, 0) / prices.length;
        const std = Math.sqrt(
          prices.reduce((sum, p) => sum + Math.pow(p - mean, 2), 0) / prices.length,
        );

        const z = std > 0 ? (pick.actualPrice - mean) / std : 0;
        zScores.set(pick.player.id, z);
      });
    });

    return zScores;
  };

  const zScoresA = calculatePositionZScores(draft1);
  const zScoresB = calculatePositionZScores(draft2);

  // Calculate tiers (price quantiles: 1=top 25%, 2=25-50%, 3=50-75%, 4=bottom 25%)
  const calculateTiers = (draft: MockDraft): Map<string, number> => {
    const allPrices: { id: string; price: number }[] = [];
    draft.teams.forEach(team => {
      team.picks.forEach(pick => {
        allPrices.push({ id: pick.player.id, price: pick.actualPrice });
      });
    });

    allPrices.sort((a, b) => b.price - a.price);
    const tiers = new Map<string, number>();

    allPrices.forEach((item, index) => {
      const percentile = index / allPrices.length;
      let tier = 4;
      if (percentile < 0.25) tier = 1;
      else if (percentile < 0.5) tier = 2;
      else if (percentile < 0.75) tier = 3;

      tiers.set(item.id, tier);
    });

    return tiers;
  };

  const tiersA = calculateTiers(draft1);
  const tiersB = calculateTiers(draft2);

  // Calculate price ranks
  const calculateRanks = (draft: MockDraft): Map<string, number> => {
    const allPrices: { id: string; price: number }[] = [];
    draft.teams.forEach(team => {
      team.picks.forEach(pick => {
        allPrices.push({ id: pick.player.id, price: pick.actualPrice });
      });
    });

    allPrices.sort((a, b) => b.price - a.price);
    const ranks = new Map<string, number>();

    allPrices.forEach((item, index) => {
      ranks.set(item.id, index + 1);
    });

    return ranks;
  };

  const ranksA = calculateRanks(draft1);
  const ranksB = calculateRanks(draft2);

  // Generate FantasyPros ADP rankings
  const realADPRanks = new Map<string, number>();

  // For now, fall back to AAV-based mock rankings
  // TODO: Integrate real FantasyPros ADP once CSV loading is implemented
  const sortedByAAV = Array.from(playerData.entries()).sort((a, b) => b[1].aav - a[1].aav);

  sortedByAAV.forEach(([playerId, _], index) => {
    realADPRanks.set(playerId, index + 1);
  });

  // Calculate nomination quartiles
  const calculateNomQuartiles = (nomIndex: number, totalPicks: number): number => {
    const percentile = nomIndex / totalPicks;
    if (percentile <= 0.25) return 1;
    if (percentile <= 0.5) return 2;
    if (percentile <= 0.75) return 3;
    return 4;
  };

  // Build player analyses
  const players: PlayerAnalysis[] = [];

  Array.from(allPlayerIds).forEach(playerId => {
    const data = playerData.get(playerId);
    if (!data) return;

    const priceA = leagueAPrices.get(playerId);
    const priceB = leagueBPrices.get(playerId);

    const prices = {
      LEAGUE_A: priceA?.price || null,
      LEAGUE_B: priceB?.price || null,
    };

    let price_gap: number | null = null;
    let price_gap_abs: number | null = null;
    let price_gap_pct: number | null = null;

    if (prices.LEAGUE_A !== null && prices.LEAGUE_B !== null) {
      price_gap = prices.LEAGUE_A - prices.LEAGUE_B;
      price_gap_abs = Math.abs(price_gap);
      const avgPrice = (prices.LEAGUE_A + prices.LEAGUE_B) / 2;
      price_gap_pct = avgPrice > 0 ? price_gap / avgPrice : 0;
    }

    const rankA = ranksA.get(playerId);
    const rankB = ranksB.get(playerId);
    const tierA = tiersA.get(playerId);
    const tierB = tiersB.get(playerId);

    const tier_shift = tierA !== undefined && tierB !== undefined ? tierA - tierB : null;

    const adpRank = realADPRanks.get(playerId);

    const analysis: PlayerAnalysis = {
      player_id: playerId,
      name: data.name,
      position: data.position,
      prices,
      price_gap,
      price_gap_abs,
      price_gap_pct,
      price_rank: {
        LEAGUE_A: rankA || null,
        LEAGUE_B: rankB || null,
      },
      tiers: {
        LEAGUE_A: tierA || null,
        LEAGUE_B: tierB || null,
      },
      tier_shift,
      nom_quartile: {
        LEAGUE_A: priceA ? calculateNomQuartiles(priceA.nomIndex, 144) : null,
        LEAGUE_B: priceB ? calculateNomQuartiles(priceB.nomIndex, 144) : null,
      },
      nom_index: {
        LEAGUE_A: priceA?.nomIndex || null,
        LEAGUE_B: priceB?.nomIndex || null,
      },
      z_by_pos: {
        LEAGUE_A: zScoresA.get(playerId) || null,
        LEAGUE_B: zScoresB.get(playerId) || null,
      },
      adp_rank_snake: adpRank || null,
      rank_gap: {
        LEAGUE_A: rankA && adpRank ? rankA - adpRank : null,
        LEAGUE_B: rankB && adpRank ? rankB - adpRank : null,
      },
      only_in_one_league: (priceA !== undefined) !== (priceB !== undefined),
      position_mismatch: false, // Assuming consistent positions
    };

    players.push(analysis);
  });

  // Build denormalized draft pick rows
  const draft_picks: DraftPickRow[] = [];

  [draft1, draft2].forEach((draft, leagueIdx) => {
    const leagueName = leagueIdx === 0 ? 'AFC' : 'NFC';
    const ranks = leagueIdx === 0 ? ranksA : ranksB;
    const tiers = leagueIdx === 0 ? tiersA : tiersB;
    const zScores = leagueIdx === 0 ? zScoresA : zScoresB;

    draft.teams.forEach(team => {
      team.picks.forEach((pick, pickIndex) => {
        const { starters } = inferStarters(team.picks);
        const isStarter = starters.some(s => s.player.id === pick.player.id);

        const totalPicks = draft.teams.reduce((sum, t) => sum + t.picks.length, 0);

        draft_picks.push({
          league: leagueName,
          nom_index: pickIndex + 1,
          nom_quartile: calculateNomQuartiles(pickIndex + 1, 144),
          timestamp: new Date(2025, 8, 1, 12, 0, pickIndex * 2).toISOString(), // Mock timestamps
          manager: team.teamName,
          player_id: pick.player.id,
          player_name: pick.player.name,
          position: pick.player.position,
          price: pick.actualPrice,
          starter_flag: isStarter,
          price_rank_league: ranks.get(pick.player.id) || 0,
          price_quantile_league: (ranks.get(pick.player.id) || 0) / totalPicks,
          z_by_pos: zScores.get(pick.player.id) || 0,
          tier: tiers.get(pick.player.id) || 4,
          aav: pick.player.aav,
        });
      });
    });
  });

  // Top price gaps (largest absolute differences)
  const top_price_gaps = players
    .filter(p => p.price_gap_abs !== null)
    .sort((a, b) => (b.price_gap_abs || 0) - (a.price_gap_abs || 0))
    .slice(0, 10);

  // Price gap histogram
  const priceGaps = players
    .filter(p => p.price_gap !== null)
    .map(p => p.price_gap!)
    .sort((a, b) => a - b);

  const minGap = Math.min(...priceGaps);
  const maxGap = Math.max(...priceGaps);
  const binCount = 15;
  const binSize = (maxGap - minGap) / binCount;

  const bins: number[] = [];
  const counts: number[] = [];
  const bin_labels: string[] = [];

  for (let i = 0; i < binCount; i++) {
    const binStart = minGap + i * binSize;
    const binEnd = binStart + binSize;
    bins.push(binStart);

    const count = priceGaps.filter(gap => gap >= binStart && gap < binEnd).length;
    counts.push(count);

    const label = `$${binStart.toFixed(0)} to $${binEnd.toFixed(0)}`;
    bin_labels.push(label);
  }

  // Tier shift matrix (4x4 for 4 tiers)
  const tier_shift_matrix = Array(4)
    .fill(0)
    .map(() => Array(4).fill(0));

  players.forEach(player => {
    const tierA = player.tiers.LEAGUE_A;
    const tierB = player.tiers.LEAGUE_B;

    if (tierA && tierB) {
      tier_shift_matrix[tierA - 1][tierB - 1]++;
    }
  });

  // League summary tiles
  const league_tiles = {
    LEAGUE_A: [
      {
        label: 'Avg Price',
        value: `$${(draft_picks.filter(p => p.league === 'AFC').reduce((sum, p) => sum + p.price, 0) / draft_picks.filter(p => p.league === 'AFC').length).toFixed(0)}`,
      },
      {
        label: 'Std Dev',
        value: `$${Math.sqrt(draft_picks.filter(p => p.league === 'AFC').reduce((sum, p) => sum + Math.pow(p.price - 16.7, 2), 0) / draft_picks.filter(p => p.league === 'AFC').length).toFixed(0)}`,
      },
      { label: 'Players', value: draft_picks.filter(p => p.league === 'AFC').length.toString() },
    ],
    LEAGUE_B: [
      {
        label: 'Avg Price',
        value: `$${(draft_picks.filter(p => p.league === 'NFC').reduce((sum, p) => sum + p.price, 0) / draft_picks.filter(p => p.league === 'NFC').length).toFixed(0)}`,
      },
      {
        label: 'Std Dev',
        value: `$${Math.sqrt(draft_picks.filter(p => p.league === 'NFC').reduce((sum, p) => sum + Math.pow(p.price - 16.7, 2), 0) / draft_picks.filter(p => p.league === 'NFC').length).toFixed(0)}`,
      },
      { label: 'Players', value: draft_picks.filter(p => p.league === 'NFC').length.toString() },
    ],
  };

  // Generate badges for key insights
  const badges = [
    {
      label: `${top_price_gaps[0]?.name || 'N/A'} Δ$${top_price_gaps[0]?.price_gap_abs?.toFixed(0) || '0'}`,
      value: 'price_gap',
    },
    { label: `${priceGaps.length} Cross-League`, value: 'total_comparisons' },
    {
      label: `Avg Gap $${(priceGaps.reduce((sum, gap) => sum + Math.abs(gap), 0) / priceGaps.length).toFixed(0)}`,
      value: 'avg_gap',
    },
  ];

  return {
    players,
    draft_picks,
    top_price_gaps,
    tier_shift_matrix,
    league_tiles,
    badges,
    price_gap_histogram: {
      bins,
      counts,
      bin_labels,
    },
  };
};
