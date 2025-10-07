# WEB-EXTRACT-002: Manager Analytics Logic Types

**Category**: EXTRACT  
**Priority**: ⚠️ HIGH  
**Estimated Time**: 25 min  
**Dependencies**: WEB-EXTRACT-001

---

## Objective

Extract 13 type definitions from `lib/manager-analytics.ts` (1,346 lines) and
consolidate them into `features/draft-analysis/types.ts`, creating a
comprehensive type definition file for all draft analysis functionality.

---

## Context Needed

**Read these files** (specific sections only):

1. `apps/web/src/lib/manager-analytics.ts` (lines 8-200) - All export interface
   declarations
2. `apps/web/src/features/draft-analysis/types.ts` (all) - Existing types from
   WEB-EXTRACT-001

**Total Context**: ~200 lines to read

---

## Steps

### 1. Update `src/features/draft-analysis/types.ts` with all manager analytics types

Replace the entire contents of `src/features/draft-analysis/types.ts` with:

```typescript
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
  members: { manager: string; league: string }[];
  description: string;
}

/**
 * Manager behavioral outlier flags
 */
export interface ManagerOutlierFlags {
  is_hyper_patient: boolean;
  is_hyper_aggressive: boolean;
  is_stars_scrubs: boolean;
  is_ultra_balanced: boolean;
  is_rb_whale: boolean;
  is_wr_whale: boolean;
  description: string[];
}

/**
 * Complete manager profile with all metrics
 */
export interface ManagerProfile {
  manager: string;
  league: string;
  spends: ManagerSpendShares;
  concentration: ManagerConcentration;
  pacing: ManagerPacing;
  twins: ManagerTwin[];
  cluster: ManagerCluster;
  outlier_flags: ManagerOutlierFlags;
  total_spend: number;
  n_players_drafted: number;
  avg_price_per_player: number;
  n_starters: number;
  n_bench: number;
  avg_starter_price: number;
  avg_bench_price: number;
}

/**
 * Complete manager analytics output
 */
export interface ManagerAnalytics {
  profiles: ManagerProfile[];
  player_overlap: PlayerOverlapAnalytics;
  player_analysis: PlayerLevelAnalytics;
  clusters: ManagerCluster[];
}
```

### 2. Update `src/features/draft-analysis/index.ts` to export all types

Replace contents with:

```typescript
/**
 * Draft Analysis Feature
 *
 * Exports all types for draft analysis components and logic.
 */

export type {
  // Component Props
  ManagerAnalysisProps,

  // Manager Metrics
  ManagerSpendShares,
  ManagerConcentration,
  ManagerPacing,
  ManagerTwin,
  ManagerCluster,
  ManagerOutlierFlags,
  ManagerProfile,

  // Player Analysis
  PlayerOverlap,
  PlayerOverlapAnalytics,
  PlayerAnalysis,
  DraftPickRow,
  PlayerLevelAnalytics,

  // Top-Level Analytics
  ManagerAnalytics,
} from './types';
```

### 3. Update `lib/manager-analytics.ts` to re-export from feature types

At the top of `lib/manager-analytics.ts` (after the eslint disable comment,
around line 6), add:

```typescript
// Re-export types from centralized location
export type {
  ManagerSpendShares,
  ManagerConcentration,
  ManagerPacing,
  ManagerTwin,
  PlayerOverlap,
  PlayerOverlapAnalytics,
  PlayerAnalysis,
  DraftPickRow,
  PlayerLevelAnalytics,
  ManagerCluster,
  ManagerOutlierFlags,
  ManagerProfile,
  ManagerAnalytics,
} from '@/features/draft-analysis/types';
```

Then remove the 13 original interface definitions (lines 8-200 approximately).

### 4. Verify TypeScript compilation

```bash
cd /Users/dhruv.methi/Documents/GitHub/gauntlet-website/apps/web
pnpm tsc --noEmit
```

---

## Acceptance Criteria

- [ ] All 13 interfaces moved from `lib/manager-analytics.ts` to
      `features/draft-analysis/types.ts`
- [ ] `lib/manager-analytics.ts` re-exports types from feature directory
- [ ] Original interface definitions removed from `lib/manager-analytics.ts`
- [ ] Barrel export in `features/draft-analysis/index.ts` includes all types
- [ ] TypeScript compilation passes (`pnpm tsc --noEmit`)
- [ ] No runtime changes (all existing code still works)
- [ ] File size of `manager-analytics.ts` reduced by ~190 lines

---

## Verification Commands

```bash
cd /Users/dhruv.methi/Documents/GitHub/gauntlet-website/apps/web

# Verify TypeScript compilation
pnpm tsc --noEmit

# Verify types file has all interfaces
grep -c "^export interface" src/features/draft-analysis/types.ts
# Expected: 14 (13 from manager-analytics + 1 from manager-analysis)

# Verify manager-analytics.ts re-exports
grep "export type {" src/lib/manager-analytics.ts && echo "✅ Re-exports added"

# Verify original interfaces removed
! grep "^export interface ManagerSpendShares" src/lib/manager-analytics.ts && echo "✅ Original interfaces removed"

# Count lines saved
wc -l src/lib/manager-analytics.ts
# Expected: ~1,150 lines (down from 1,346)
```

---

## Cursor Prompt (Copy-Paste Ready)

```
I'm working on WEB-EXTRACT-002: Extract Manager Analytics Logic Types.

Context:
- Read apps/web/src/lib/manager-analytics.ts (lines 8-200 only)
- Read apps/web/src/features/draft-analysis/types.ts (entire file from WEB-EXTRACT-001)
- This file has 13 exported interfaces that should be centralized

Tasks:
1. Move all 13 interfaces from lib/manager-analytics.ts to features/draft-analysis/types.ts
2. Add comprehensive JSDoc comments to each interface
3. Update features/draft-analysis/index.ts to export all types
4. Update lib/manager-analytics.ts to re-export from @/features/draft-analysis/types
5. Remove original interface definitions from manager-analytics.ts
6. Verify TypeScript compilation passes

Expected outcome: ~190 lines removed from manager-analytics.ts, centralized in feature types.
```

---

## Related Tasks

**Blocks**: WEB-UTIL-003 (Manager Analytics Calculations)  
**Blocked By**: WEB-EXTRACT-001 (Manager Analysis Types)  
**Related**: WEB-COMP-001 (Split Manager Analysis Component), WEB-HOOK-002
(Draft Analytics Data Hook)

---

## Notes

### Why This Matters

- **Major Cleanup**: Removes ~190 lines of type definitions from logic file
- **Single Source of Truth**: All draft analysis types in one location
- **Better IntelliSense**: IDEs can provide better autocomplete from centralized
  types
- **Test Friendliness**: Test files can import types from feature directory
- **Backwards Compatible**: Re-exports maintain existing import paths

### Interfaces Being Moved

1. ManagerSpendShares (7 fields)
2. ManagerConcentration (6 fields)
3. ManagerPacing (9 fields)
4. ManagerTwin (3 fields)
5. PlayerOverlap (10 fields)
6. PlayerOverlapAnalytics (5 fields)
7. PlayerAnalysis (20+ fields)
8. DraftPickRow (15 fields)
9. PlayerLevelAnalytics (6 fields)
10. ManagerCluster (4 fields)
11. ManagerOutlierFlags (7 fields)
12. ManagerProfile (16 fields)
13. ManagerAnalytics (4 fields)

**Total**: 14 interfaces in final types.ts (includes ManagerAnalysisProps from
EXTRACT-001)

---

**Estimated Context Usage**: 200 lines read, 400 lines written (including
documentation), 25 min total
