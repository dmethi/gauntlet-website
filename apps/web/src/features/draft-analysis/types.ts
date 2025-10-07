/**
 * Draft Analysis Feature Types
 *
 * Comprehensive type definitions for manager analysis components and logic.
 * Extracted from components/manager-analysis.tsx and lib/manager-analytics.ts
 * for better separation of concerns and type reusability.
 */

/**
 * Props for the ManagerAnalysis component
 */
export interface ManagerAnalysisProps {
  analytics: ManagerAnalytics;
}

/**
 * Manager spending distribution by position
 */
export interface ManagerSpendShares {
  pctQB: number;
  pctRB: number;
  pctWR: number;
  pctTE: number;
  pctDEF: number;
  pctStarters: number;
  pctBench: number;
}

/**
 * Measures of how concentrated a manager's spending is
 */
export interface ManagerConcentration {
  top1_share: number; // max player price / team total
  top2_share: number; // top 2 players / team total
  top3_share: number; // top 3 players / team total
  top4_share: number; // top 4 players / team total
  top5_share: number; // top 5 players / team total
  giniSpend: number; // Gini coefficient of team's player prices
}

/**
 * Manager draft pacing and timing metrics
 */
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

/**
 * Similar manager pairing based on draft behavior
 */
export interface ManagerTwin {
  manager: string;
  league: string;
  similarity: number; // cosine similarity score [0,1]
}

/**
 * Player overlap analysis between two managers
 */
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

/**
 * League-wide player overlap analytics
 */
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

/**
 * Individual player analysis across leagues
 */
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

/**
 * Individual draft pick record
 */
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

/**
 * Player-level analytics across both leagues
 */
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

/**
 * Manager behavioral cluster identification
 */
export interface ManagerCluster {
  cluster_label: string; // "Stars & Scrubs", "Balanced", "Patience Snipers", etc.
  cluster_id: number;
  tags?: string[]; // explanatory tags for UI badges
  description: string;
}

/**
 * Manager behavioral outlier flags
 */
export interface ManagerOutlierFlags {
  extreme_top1: boolean; // top1_share > 3 std devs
  ultra_patient: boolean; // patienceQ4 > 3 std devs
  speed_drafter: boolean; // patienceQ1 > 3 std devs
  bench_heavy: boolean; // pctBench > 3 std devs
  position_hero: string | null; // "RB", "WR", etc. if extreme position tilt
}

/**
 * Complete manager profile with all metrics
 */
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

/**
 * Complete manager analytics output
 */
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
