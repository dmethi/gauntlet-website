// Manager Behavior Analytics Engine
// Comprehensive team-by-team breakdown analysis

import { MockDraft } from './draft-generator';

export interface ManagerSpendShares {
  pctQB: number;
  pctRB: number;
  pctWR: number;
  pctTE: number;
  pctDEF: number;
  pctStarters: number;
  pctBench: number;
}

export interface ManagerConcentration {
  top1_share: number; // max player price / team total
  top2_share: number; // top 2 players / team total
  top3_share: number; // top 3 players / team total
  top4_share: number; // top 4 players / team total
  top5_share: number; // top 5 players / team total
  giniSpend: number; // Gini coefficient of team's player prices
}

export interface ManagerPacing {
  patienceQ1: number; // % budget spent in Q1 (early draft)
  patienceQ2: number; // % budget spent in Q2
  patienceQ3: number; // % budget spent in Q3
  patienceQ4: number; // % budget spent in Q4 (late draft)
  patience_score: number; // 1 - cumulative_spend_at_Q2 (higher = waited longer)
  time_to_first_30: number | null; // draft pick when first $30+ player acquired
  last_starter_index: number; // draft pick when last starter acquired
  avg_starter_nom_index: number; // average nomination index of starters
  avg_bench_nom_index: number; // average nomination index of bench
}

export interface ManagerTwin {
  manager: string;
  league: string;
  similarity: number; // cosine similarity score [0,1]
}

export interface PlayerOverlap {
  manager_a: string;
  league_a: string;
  manager_b: string;
  league_b: string;
  shared_players: string[]; // array of shared player IDs
  total_unique_players: number;
  overlap_percentage: number; // shared / total unique
  shared_player_names: string[]; // for display
  manager_a_only: string[]; // players only manager A has
  manager_b_only: string[]; // players only manager B has
}

export interface PlayerOverlapAnalytics {
  top_overlaps: PlayerOverlap[]; // top 10 most similar pairs
  avg_overlap_percentage: number;
  copycat_threshold: number; // e.g., 40%+ overlap
  copycat_pairs: PlayerOverlap[];
  maverick_managers: {
    manager: string;
    league: string;
    avg_overlap_with_others: number; // low means maverick
    unique_picks_percentage: number;
  }[];
}

// Player-level analysis interfaces
export interface PlayerAnalysis {
  player_id: string;
  name: string;
  position: string;
  prices: {
    LEAGUE_A: number | null;
    LEAGUE_B: number | null;
  };
  price_gap: number | null; // A - B (if both exist)
  price_gap_abs: number | null; // |A - B|
  price_gap_pct: number | null; // (A - B) / ((A+B)/2)
  price_rank: {
    LEAGUE_A: number | null;
    LEAGUE_B: number | null;
  };
  tiers: {
    LEAGUE_A: number | null;
    LEAGUE_B: number | null;
  };
  tier_shift: number | null; // tier_A - tier_B (positive = higher tier in A)
  nom_quartile: {
    LEAGUE_A: number | null;
    LEAGUE_B: number | null;
  };
  nom_index: {
    LEAGUE_A: number | null;
    LEAGUE_B: number | null;
  };
  z_by_pos: {
    LEAGUE_A: number | null;
    LEAGUE_B: number | null;
  };
  adp_rank_snake: number | null; // mock ADP ranking
  rank_gap: {
    LEAGUE_A: number | null; // price_rank - adp_rank
    LEAGUE_B: number | null;
  };
  only_in_one_league: boolean;
  position_mismatch: boolean;
}

export interface DraftPickRow {
  league: string;
  nom_index: number;
  nom_quartile: number;
  timestamp: string;
  manager: string;
  player_id: string;
  player_name: string;
  position: string;
  price: number;
  starter_flag: boolean;
  price_rank_league: number;
  price_quantile_league: number;
  z_by_pos: number;
  tier: number;
  aav: number;
}

export interface PlayerLevelAnalytics {
  players: PlayerAnalysis[]; // all players analyzed
  draft_picks: DraftPickRow[]; // denormalized table rows
  top_price_gaps: PlayerAnalysis[]; // top 10 largest gaps
  tier_shift_matrix: number[][]; // tier transition counts
  league_tiles: {
    LEAGUE_A: { label: string; value: string }[];
    LEAGUE_B: { label: string; value: string }[];
  };
  badges: { label: string; value: string }[];
  price_gap_histogram: {
    bins: number[];
    counts: number[];
    bin_labels: string[];
  };
}

export interface ManagerCluster {
  cluster_label: string; // "Stars & Scrubs", "Balanced", "Patience Snipers", etc.
  cluster_id: number;
  tags?: string[]; // explanatory tags for UI badges
  description: string;
}

export interface ManagerOutlierFlags {
  extreme_top1: boolean; // top1_share > 3 std devs
  ultra_patient: boolean; // patienceQ4 > 3 std devs
  speed_drafter: boolean; // patienceQ1 > 3 std devs
  bench_heavy: boolean; // pctBench > 3 std devs
  position_hero: string | null; // "RB", "WR", etc. if extreme position tilt
}

export interface ManagerProfile {
  manager: string;
  league: string;
  team_total: number;

  // Spend allocation
  spend_shares: ManagerSpendShares;

  // Concentration metrics
  concentration: ManagerConcentration;

  // Draft pacing & patience
  pacing: ManagerPacing;

  // Feature vector for clustering (standardized)
  feature_vector: number[];

  // Clustering results
  cluster: ManagerCluster;

  // Cross-league similarity
  twins: ManagerTwin[];

  // Outlier identification
  outlier_flags: ManagerOutlierFlags;
}

export interface ManagerAnalytics {
  league_A_name: string;
  league_B_name: string;

  // Individual manager profiles
  profiles: ManagerProfile[];

  // League-level summaries
  league_averages: {
    league_A: ManagerSpendShares & ManagerConcentration;
    league_B: ManagerSpendShares & ManagerConcentration;
  };

  // Clustering summary
  cluster_summary: {
    cluster_id: number;
    cluster_label: string;
    tags?: string[];
    description: string;
    count: number;
    avg_features: ManagerSpendShares & ManagerConcentration;
  }[];

  // Cross-league twins summary
  twins_summary: {
    high_similarity_pairs: number; // pairs with similarity > 0.8
    avg_similarity: number;
    most_similar_pair: {
      manager_A: string;
      manager_B: string;
      similarity: number;
    };
  };

  // Player overlap analysis
  player_overlap_analytics: PlayerOverlapAnalytics;

  // Player-level analysis
  player_level_analytics: PlayerLevelAnalytics;
}

// Helper function to infer starters vs bench
type PositionKey = 'QB' | 'RB' | 'WR' | 'TE' | 'DEF' | 'FLEX';
export function inferStarters(teamPicks: any[]) {
  const starters: any[] = [];
  const bench: any[] = [];

  // Positional requirements for starters
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
    pick => ['RB', 'WR', 'TE'].includes(pick.player.position) && !starters.includes(pick)
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
}

// Calculate Gini coefficient for a team's spending
export function calculateGini(prices: number[]): number {
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
}

// Calculate player overlap analytics
function calculatePlayerOverlap(draft1: MockDraft, draft2: MockDraft): PlayerOverlapAnalytics {
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
    overlap => overlap.overlap_percentage >= copycatThreshold
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
        (!isLeagueA && overlap.manager_b === manager.teamName)
    );

    const avgOverlapWithOthers =
      managerOverlaps.length > 0
        ? managerOverlaps.reduce((sum, overlap) => sum + overlap.overlap_percentage, 0) /
          managerOverlaps.length
        : 0;

    // Calculate unique picks percentage (lower means more overlapping with others)
    const totalPossibleOverlaps = managerOverlaps.length;
    const highOverlapCount = managerOverlaps.filter(
      overlap => overlap.overlap_percentage > avgOverlapPercentage
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
}

// Calculate player-level analytics
function calculatePlayerLevelAnalytics(draft1: MockDraft, draft2: MockDraft): PlayerLevelAnalytics {
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
  const calculatePositionZScores = (draft: MockDraft) => {
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
          prices.reduce((sum, p) => sum + Math.pow(p - mean, 2), 0) / prices.length
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
  const calculateTiers = (draft: MockDraft) => {
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
  const calculateRanks = (draft: MockDraft) => {
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
  const calculateNomQuartiles = (nomIndex: number, totalPicks: number) => {
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
}

// Calculate cosine similarity between two feature vectors
export function cosineSimilarity(vecA: number[], vecB: number[]): number {
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
}

// Simple k-means clustering
export function kMeansCluster(data: number[][], k: number = 4, maxIterations: number = 100) {
  if (data.length === 0) return { clusters: [], centroids: [] };

  const n = data.length;
  const d = data[0].length;

  // Initialize centroids randomly
  let centroids: number[][] = [];
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

  let assignments = new Array(n).fill(0);

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
}

// Generate comprehensive manager analytics
export function generateManagerAnalytics(draft1: MockDraft, draft2: MockDraft): ManagerAnalytics {
  const profiles: ManagerProfile[] = [];

  // Process both leagues
  [draft1, draft2].forEach((draft, leagueIndex) => {
    const leagueName = leagueIndex === 0 ? draft.name : draft.name;

    draft.teams.forEach((team, teamIndex) => {
      const teamPicks = team.picks.map((pick, pickIndex) => ({
        ...pick,
        nomination_index: pickIndex + 1,
      }));

      const teamTotal = team.totalSpent;
      const { starters, bench } = inferStarters(teamPicks);

      // Calculate spend shares
      const positionSpend = { QB: 0, RB: 0, WR: 0, TE: 0, DEF: 0 };
      teamPicks.forEach(pick => {
        positionSpend[pick.player.position] += pick.actualPrice;
      });

      const starterSpend = starters.reduce((sum, pick) => sum + pick.actualPrice, 0);
      const benchSpend = bench.reduce((sum, pick) => sum + pick.actualPrice, 0);

      const spend_shares: ManagerSpendShares = {
        pctQB: positionSpend.QB / teamTotal,
        pctRB: positionSpend.RB / teamTotal,
        pctWR: positionSpend.WR / teamTotal,
        pctTE: positionSpend.TE / teamTotal,
        pctDEF: positionSpend.DEF / teamTotal,
        pctStarters: starterSpend / teamTotal,
        pctBench: benchSpend / teamTotal,
      };

      // Calculate concentration
      const prices = teamPicks.map(pick => pick.actualPrice).sort((a, b) => b - a);
      const top1_share = prices[0] / teamTotal;
      const top2_share = prices.slice(0, 2).reduce((sum, price) => sum + price, 0) / teamTotal;
      const top3_share = prices.slice(0, 3).reduce((sum, price) => sum + price, 0) / teamTotal;
      const top4_share = prices.slice(0, 4).reduce((sum, price) => sum + price, 0) / teamTotal;
      const top5_share = prices.slice(0, 5).reduce((sum, price) => sum + price, 0) / teamTotal;
      const giniSpend = calculateGini(prices);

      const concentration: ManagerConcentration = {
        top1_share,
        top2_share,
        top3_share,
        top4_share,
        top5_share,
        giniSpend,
      };

      // Calculate pacing/patience
      const totalPicks = teamPicks.length;
      const quartileSize = Math.ceil(totalPicks / 4);

      let patienceQ = [0, 0, 0, 0];
      teamPicks.forEach((pick, index) => {
        const quartile = Math.floor(index / quartileSize);
        if (quartile < 4) {
          patienceQ[quartile] += pick.actualPrice / teamTotal;
        }
      });

      const patience_score = 1 - (patienceQ[0] + patienceQ[1]);
      const time_to_first_30 = teamPicks.findIndex(pick => pick.actualPrice >= 30) + 1 || null;
      const last_starter_index = Math.max(
        ...starters.map(pick => teamPicks.findIndex(p => p === pick) + 1)
      );

      const avg_starter_nom_index =
        starters.reduce((sum, starter) => sum + (teamPicks.findIndex(p => p === starter) + 1), 0) /
        starters.length;
      const avg_bench_nom_index =
        bench.length > 0
          ? bench.reduce(
              (sum, benchPlayer) => sum + (teamPicks.findIndex(p => p === benchPlayer) + 1),
              0
            ) / bench.length
          : 0;

      const pacing: ManagerPacing = {
        patienceQ1: patienceQ[0],
        patienceQ2: patienceQ[1],
        patienceQ3: patienceQ[2],
        patienceQ4: patienceQ[3],
        patience_score,
        time_to_first_30,
        last_starter_index,
        avg_starter_nom_index,
        avg_bench_nom_index,
      };

      // Within-position concentration features (distinguish 60/20 vs 40/40 builds)
      const posShares = (pos: 'RB' | 'WR') => {
        const posPicks = teamPicks.filter(p => p.player.position === pos);
        const total = posPicks.reduce((s, p) => s + (p.actualPrice || 0), 0);
        if (total <= 0) return { top1Share: 0, anchorRatio: 0 };
        const sorted = posPicks.map(p => p.actualPrice || 0).sort((a, b) => b - a);
        const top1 = sorted[0] || 0;
        const top2 = sorted[1] || 0;
        const anchorRatio = top1 && top1 + top2 ? top1 / (top1 + top2) : top1 > 0 ? 1 : 0;
        return { top1Share: top1 / total, anchorRatio };
      };

      const rbConc = posShares('RB');
      const wrConc = posShares('WR');

      // Create feature vector for clustering (blend stars/scrubs + positional allocation)
      const feature_vector = [
        // Positional allocation
        spend_shares.pctQB,
        spend_shares.pctRB,
        spend_shares.pctWR,
        spend_shares.pctTE,
        spend_shares.pctDEF,
        // Stars & Scrubs
        concentration.giniSpend,
        concentration.top1_share,
        concentration.top2_share,
        concentration.top3_share,
        // Within-position concentration (RB/WR)
        rbConc.top1Share,
        rbConc.anchorRatio,
        wrConc.top1Share,
        wrConc.anchorRatio,
      ];

      // Ensure manager name is always populated; fallback to team.teamName
      const teamNames = team as unknown as { name?: string; teamName?: string };
      const managerDisplay = teamNames.name ?? teamNames.teamName ?? 'Unknown Manager';
      profiles.push({
        manager: managerDisplay,
        league: leagueName,
        team_total: teamTotal,
        spend_shares,
        concentration,
        pacing,
        feature_vector,
        cluster: { cluster_label: '', cluster_id: 0, description: '' }, // Will be filled later
        twins: [], // Will be filled later
        outlier_flags: {
          extreme_top1: false,
          ultra_patient: false,
          speed_drafter: false,
          bench_heavy: false,
          position_hero: null,
        },
      });
    });
  });

  // Standardize feature vectors
  const featureMatrix = profiles.map(p => p.feature_vector);
  const means = featureMatrix[0].map(
    (_, colIndex) =>
      featureMatrix.reduce((sum, row) => sum + row[colIndex], 0) / featureMatrix.length
  );
  const stds = featureMatrix[0].map((_, colIndex) => {
    const mean = means[colIndex];
    const variance =
      featureMatrix.reduce((sum, row) => sum + Math.pow(row[colIndex] - mean, 2), 0) /
      featureMatrix.length;
    return Math.sqrt(variance);
  });

  profiles.forEach(profile => {
    profile.feature_vector = profile.feature_vector.map((val, index) =>
      stds[index] > 0 ? (val - means[index]) / stds[index] : 0
    );
  });

  // Perform clustering
  const standardizedFeatures = profiles.map(p => p.feature_vector);
  const { clusters } = kMeansCluster(standardizedFeatures, 4);

  // Assign clusters with improved interpretive labels
  const clusterProfiles = new Map<number, ManagerProfile[]>();
  profiles.forEach((profile, index) => {
    const clusterId = clusters[index];
    if (!clusterProfiles.has(clusterId)) {
      clusterProfiles.set(clusterId, []);
    }
    clusterProfiles.get(clusterId)!.push(profile);
  });

  // Analyze cluster characteristics for better labeling
  profiles.forEach((profile, index) => {
    const clusterId = clusters[index];
    const clusterMembers = clusterProfiles.get(clusterId) || [];

    // Calculate cluster averages for comparison
    const avgGini =
      clusterMembers.reduce((sum, p) => sum + p.concentration.giniSpend, 0) / clusterMembers.length;
    const avgTop1 =
      clusterMembers.reduce((sum, p) => sum + p.concentration.top1_share, 0) /
      clusterMembers.length;
    const avgPatienceQ4 =
      clusterMembers.reduce((sum, p) => sum + p.pacing.patienceQ4, 0) / clusterMembers.length;
    const avgRBPct =
      clusterMembers.reduce((sum, p) => sum + p.spend_shares.pctRB, 0) / clusterMembers.length;
    const avgWRPct =
      clusterMembers.reduce((sum, p) => sum + p.spend_shares.pctWR, 0) / clusterMembers.length;
    const avgQBPct =
      clusterMembers.reduce((sum, p) => sum + p.spend_shares.pctQB, 0) / clusterMembers.length;

    // More nuanced labeling based on individual + cluster characteristics
    let label = '';
    let description = '';

    // Stars & Scrubs - high concentration
    if (profile.concentration.top1_share > 0.3 && profile.concentration.giniSpend > 0.35) {
      label = 'Stars & Scrubs';
      description = 'High concentration on elite players with bargain depth';
    }
    // Balanced - low concentration
    else if (profile.concentration.giniSpend < 0.25 && profile.concentration.top1_share < 0.25) {
      label = 'Balanced Build';
      description = 'Even distribution of spending across all roster positions';
    }
    // Patience Snipers - late draft heavy spending
    else if (profile.pacing.patienceQ4 > 0.12 && profile.pacing.patienceQ1 < 0.45) {
      label = 'Patience Sniper';
      description = 'Waited for value opportunities late in the draft';
    }
    // QB Heavy - unusual QB investment
    else if (profile.spend_shares.pctQB > 0.08 && avgQBPct > 0.06) {
      label = 'Premium QB';
      description = 'Invested heavily in quarterback position';
    }
    // Hero RB - but be more specific about cluster context
    else if (profile.spend_shares.pctRB > 0.32 && avgRBPct > 0.3) {
      if (clusterMembers.length > 5) {
        label = 'Ground & Pound';
        description = 'Running back heavy strategy with depth';
      } else {
        label = 'Hero RB';
        description = 'Elite running back as foundation of roster';
      }
    }
    // WR Heavy
    else if (profile.spend_shares.pctWR > 0.4 && avgWRPct > 0.38) {
      if (profile.concentration.giniSpend > 0.35) {
        label = 'WR Elite';
        description = 'Star wide receiver with supporting cast';
      } else {
        label = 'Receiver Corps';
        description = 'Deep investment across wide receiver position';
      }
    }
    // TE Heavy - rare but possible
    else if (profile.spend_shares.pctTE > 0.15) {
      label = 'TE Premium';
      description = 'Significant investment in tight end position';
    }
    // Early Birds - front-loaded spending
    else if (profile.pacing.patienceQ1 > 0.5) {
      label = 'Early Bird';
      description = 'Aggressive early draft spending strategy';
    }
    // Bench Heavy
    else if (profile.spend_shares.pctBench > 0.25) {
      label = 'Depth Builder';
      description = 'Significant investment in bench depth';
    }
    // Default for mixed strategies
    else {
      // Use cluster ID to create more unique labels
      const clusterLabels = [
        'Strategic Mix',
        'Value Hunter',
        'Tactical Build',
        'Flexible Draft',
        'Opportunistic',
      ];
      label = clusterLabels[clusterId % clusterLabels.length] || 'Tactical Build';
      description = 'Balanced approach with mixed strategic tendencies';
    }

    // Explanatory tags for UI badges
    const tags: string[] = [];
    if (label === 'Stars & Scrubs')
      tags.push('High top-1 spend', `Gini ${profile.concentration.giniSpend.toFixed(2)}`);
    if (label === 'Ground & Pound') tags.push('RB-heavy', 'Dual anchors');
    if (label === 'Hero RB') tags.push('RB anchor', 'Top1 >> Top2');
    if (label === 'WR Elite') tags.push('WR-heavy');
    if (label === 'Premium QB') tags.push('QB spend 10%+');
    if (label === 'Balanced Build') tags.push('Even spend distribution');
    if (label === 'Patience Sniper') tags.push('Late spend');

    profile.cluster = {
      cluster_id: clusterId,
      cluster_label: label,
      description,
      tags,
    };
  });

  // Calculate cross-league twins
  const leagueAProfiles = profiles.filter(p => p.league === draft1.name);
  const leagueBProfiles = profiles.filter(p => p.league === draft2.name);

  leagueAProfiles.forEach(profileA => {
    const similarities = leagueBProfiles.map(profileB => ({
      manager: profileB.manager,
      league: profileB.league,
      similarity: cosineSimilarity(profileA.feature_vector, profileB.feature_vector),
    }));

    profileA.twins = similarities.sort((a, b) => b.similarity - a.similarity).slice(0, 3);
  });

  leagueBProfiles.forEach(profileB => {
    const similarities = leagueAProfiles.map(profileA => ({
      manager: profileA.manager,
      league: profileA.league,
      similarity: cosineSimilarity(profileB.feature_vector, profileA.feature_vector),
    }));

    profileB.twins = similarities.sort((a, b) => b.similarity - a.similarity).slice(0, 3);
  });

  // Calculate league averages
  const calculateLeagueAvg = (leagueProfiles: ManagerProfile[]) => {
    const count = leagueProfiles.length;
    if (count === 0) return {} as any;

    return {
      pctQB: leagueProfiles.reduce((sum, p) => sum + p.spend_shares.pctQB, 0) / count,
      pctRB: leagueProfiles.reduce((sum, p) => sum + p.spend_shares.pctRB, 0) / count,
      pctWR: leagueProfiles.reduce((sum, p) => sum + p.spend_shares.pctWR, 0) / count,
      pctTE: leagueProfiles.reduce((sum, p) => sum + p.spend_shares.pctTE, 0) / count,
      pctDEF: leagueProfiles.reduce((sum, p) => sum + p.spend_shares.pctDEF, 0) / count,
      pctStarters: leagueProfiles.reduce((sum, p) => sum + p.spend_shares.pctStarters, 0) / count,
      pctBench: leagueProfiles.reduce((sum, p) => sum + p.spend_shares.pctBench, 0) / count,
      top1_share: leagueProfiles.reduce((sum, p) => sum + p.concentration.top1_share, 0) / count,
      top2_share: leagueProfiles.reduce((sum, p) => sum + p.concentration.top2_share, 0) / count,
      top3_share: leagueProfiles.reduce((sum, p) => sum + p.concentration.top3_share, 0) / count,
      top4_share: leagueProfiles.reduce((sum, p) => sum + p.concentration.top4_share, 0) / count,
      top5_share: leagueProfiles.reduce((sum, p) => sum + p.concentration.top5_share, 0) / count,
      giniSpend: leagueProfiles.reduce((sum, p) => sum + p.concentration.giniSpend, 0) / count,
    };
  };

  const league_averages = {
    league_A: calculateLeagueAvg(leagueAProfiles),
    league_B: calculateLeagueAvg(leagueBProfiles),
  };

  // Generate cluster summary
  const clusterCounts = new Map<string, number>();
  profiles.forEach(p => {
    const key = `${p.cluster.cluster_id}-${p.cluster.cluster_label}`;
    clusterCounts.set(key, (clusterCounts.get(key) || 0) + 1);
  });

  const cluster_summary = Array.from(clusterCounts.entries()).map(([key, count]) => {
    const [clusterId, clusterLabel] = key.split('-', 2);
    const clusterProfiles = profiles.filter(p => p.cluster.cluster_id === parseInt(clusterId));

    return {
      cluster_id: parseInt(clusterId),
      cluster_label: clusterLabel,
      description: clusterProfiles[0]?.cluster.description || '',
      tags: clusterProfiles[0]?.cluster.tags || [],
      count,
      avg_features: calculateLeagueAvg(clusterProfiles),
    };
  });

  // Debug logging to understand clustering and duplicate labels
  try {
    // Assignment per profile
    console.groupCollapsed('🔎 Cluster Debug');
    console.log('Total profiles:', profiles.length);
    console.log('Cluster assignments (manager, league, id → label):');
    console.table(
      profiles.map(p => ({
        manager: p.manager,
        league: p.league,
        cluster_id: p.cluster.cluster_id,
        cluster_label: p.cluster.cluster_label,
        gini: Number(p.concentration.giniSpend.toFixed(3)),
        top1: Number(p.concentration.top1_share.toFixed(3)),
        pctQB: Number(p.spend_shares.pctQB.toFixed(3)),
        pctRB: Number(p.spend_shares.pctRB.toFixed(3)),
        pctWR: Number(p.spend_shares.pctWR.toFixed(3)),
      }))
    );

    // Aggregates by cluster id
    const aggregates = new Map<number, any>();
    profiles.forEach(p => {
      const cid = p.cluster.cluster_id;
      if (!aggregates.has(cid)) {
        aggregates.set(cid, {
          label: p.cluster.cluster_label,
          count: 0,
          gini: 0,
          top1: 0,
          pctQB: 0,
          pctRB: 0,
          pctWR: 0,
          samples: [] as string[],
        });
      }
      const a = aggregates.get(cid);
      a.count += 1;
      a.gini += p.concentration.giniSpend;
      a.top1 += p.concentration.top1_share;
      a.pctQB += p.spend_shares.pctQB;
      a.pctRB += p.spend_shares.pctRB;
      a.pctWR += p.spend_shares.pctWR;
      if (a.samples.length < 3) a.samples.push(`${p.manager} (${p.league})`);
    });
    const aggregateRows = Array.from(aggregates.entries()).map(([cid, a]) => ({
      cluster_id: cid,
      label: a.label,
      count: a.count,
      avg_gini: Number((a.gini / a.count).toFixed(3)),
      avg_top1: Number((a.top1 / a.count).toFixed(3)),
      avg_pctRB: Number((a.pctRB / a.count).toFixed(3)),
      avg_pctWR: Number((a.pctWR / a.count).toFixed(3)),
      samples: a.samples.join(', '),
    }));
    console.log('Cluster aggregates by id:');
    console.table(aggregateRows);

    // Aggregates by label to detect duplicates
    const byLabel = new Map<string, number>();
    cluster_summary.forEach(c => {
      byLabel.set(c.cluster_label, (byLabel.get(c.cluster_label) || 0) + c.count);
    });
    console.log(
      'Label totals across all clusters (duplicates expected if label heuristics overlap):'
    );
    console.table(Array.from(byLabel.entries()).map(([label, total]) => ({ label, total })));
    console.groupEnd();
  } catch (e) {
    console.warn('Cluster debug logging failed:', e);
  }

  // Generate twins summary
  const allSimilarities = profiles.flatMap(p => p.twins.map(t => t.similarity));
  const highSimilarityPairs = allSimilarities.filter(s => s > 0.8).length / 2; // Divide by 2 to avoid double counting
  const avgSimilarity = allSimilarities.reduce((sum, s) => sum + s, 0) / allSimilarities.length;

  let mostSimilarPair = { manager_A: '', manager_B: '', similarity: 0 };
  profiles.forEach(profileA => {
    if (profileA.league === draft1.name && profileA.twins.length > 0) {
      const bestTwin = profileA.twins[0];
      if (bestTwin.similarity > mostSimilarPair.similarity) {
        mostSimilarPair = {
          manager_A: profileA.manager,
          manager_B: bestTwin.manager,
          similarity: bestTwin.similarity,
        };
      }
    }
  });

  const twins_summary = {
    high_similarity_pairs: Math.round(highSimilarityPairs),
    avg_similarity: Math.round(avgSimilarity * 1000) / 1000,
    most_similar_pair: mostSimilarPair,
  };

  // Calculate player overlap analytics
  const player_overlap_analytics = calculatePlayerOverlap(draft1, draft2);

  // Calculate player-level analytics
  const player_level_analytics = calculatePlayerLevelAnalytics(draft1, draft2);

  return {
    league_A_name: draft1.name,
    league_B_name: draft2.name,
    profiles,
    league_averages,
    cluster_summary,
    twins_summary,
    player_overlap_analytics,
    player_level_analytics,
  };
}
