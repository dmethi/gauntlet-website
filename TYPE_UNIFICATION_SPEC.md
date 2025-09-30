# Type Unification Specification

## Executive Summary

This document specifies a comprehensive plan to unify types across the Gauntlet Fantasy Football monorepo. Currently, types are scattered and duplicated across multiple locations, creating maintenance overhead and potential inconsistencies. This specification identifies all type categories, their current locations, and proposes a centralized type system.

## Problem Statement

### Current Issues
1. **Sleeper API Types Duplicated** - `SleeperLeague`, `SleeperRoster`, `SleeperMatchup`, `SleeperUser`, `SleeperPlayer` are defined in 6+ locations
2. **Simulation Types Scattered** - Simulation interfaces exist in both `packages/types` and `apps/sim-engine` with slight differences
3. **No Composite Key Types** - Multi-league composite keys (`TeamKey`, `MatchupKey`) are built ad-hoc throughout the codebase
4. **Draft/Analytics Types Local** - Complex draft and analytics types only exist in feature-specific files
5. **Stats/Projection Types Inconsistent** - Player stats have multiple competing interfaces
6. **Generic Fantasy Types Not Sleeper-Aligned** - `packages/types` contains generic fantasy types that don't match Sleeper API structure

### Impact
- **Development Overhead**: Developers redefine types in each new feature
- **Inconsistency Risk**: Subtle differences between duplicate types can cause bugs
- **Maintenance Burden**: Type changes must be propagated to multiple locations
- **IDE Performance**: Duplicate type definitions slow down TypeScript intellisense

## Current Type Inventory

### 1. Sleeper API Types (External System Integration)
**Current Locations:**
- ✅ `apps/web/src/lib/sleeper/types.ts` (PRIMARY - most complete)
- ⚠️ `apps/web/src/hooks/useLeagueOverviewClient.ts` (redefined)
- ⚠️ `apps/web/src/app/api/matchups/[leagueId]/[week]/route.ts` (partial redefinition)
- ⚠️ `apps/web/src/lib/draft-data-fetcher.ts` (draft-specific types)
- ⚠️ `apps/web/src/data/players-data.types.ts` (player types)
- ⚠️ Multiple API route files with inline type definitions

**Interfaces Identified:**
```typescript
// Core Sleeper API Types
interface NFLState
interface SleeperLeague
interface SleeperUser
interface SleeperRoster
interface SleeperMatchup
interface SleeperPlayer
interface SleeperDraft
interface SleeperDraftPick
interface SleeperTransaction
interface PlayerStats (from unified-client)
```

**Stats/Projections:**
```typescript
interface PlayerStats // 80+ stat categories (passing, rushing, receiving, etc.)
interface ScoringSettings // League-specific scoring rules
```

### 2. Fantasy Football Domain Types
**Current Locations:**
- `apps/sim-engine/src/models/matchup.ts`
- `apps/sim-engine/src/index.ts`
- `packages/types/src/index.ts` (generic, not Sleeper-aligned)
- Various component files

**Interfaces Identified:**
```typescript
// Simulation Engine
interface LineupPlayer
interface Lineup
interface MatchupResult
interface MatchupSimulationResult

// Generic Fantasy (packages/types - needs refactoring)
interface Player // Too generic, conflicts with Sleeper structure
interface FantasyTeam // Too generic
interface League // Too generic
interface LeagueSettings // Doesn't match Sleeper format
```

### 3. Multi-League Composite Types
**Current State:** NO CENTRAL DEFINITION - Built ad-hoc throughout codebase

**Critical Missing Types:**
```typescript
// These should be string template literal types
type TeamKey = `${string}-${number}`; // leagueId-rosterId
type MatchupKey = `${string}-${number}-${number}`; // leagueId-week-matchupId
type PlayerWeekKey = `${number}:${string}`; // week:playerId
```

**Usage Examples Found:**
- `apps/web/src/lib/stats/compose.ts`: `const teamKey = \`${data.leagueId}-${data.rosterId}\``
- `apps/web/src/lib/stats/teams.ts`: `const teamKey = \`${data.leagueId}-${data.rosterId}\``
- Multiple other files with inline template literal construction

### 4. Draft & Analytics Types
**Current Locations:**
- `apps/web/src/lib/draft-analytics.ts`
- `apps/web/src/lib/manager-analytics.ts`
- `apps/web/src/lib/mock-draft-data.ts`

**Interfaces Identified:**
```typescript
// Draft Analysis
interface Player // Draft-specific (different from Sleeper)
interface DraftPick
interface TeamRoster
interface MockDraft
interface DraftAnalytics
interface PositionInflation
interface MarketShape
interface TierAnalysis
interface NominationEffect

// Manager Analytics
interface PlayerAnalysis
interface DraftPickRow
interface PlayerOverlapAnalytics
interface ManagerAnalytics
```

### 5. Stats & Metrics Types
**Current Locations:**
- `apps/web/src/lib/stats/compose.ts`
- `apps/web/src/lib/stats/positions.ts`
- `apps/web/src/lib/stats/teams.ts`
- `apps/web/src/lib/stats/join.ts`
- `apps/web/src/lib/hooks.ts`

**Interfaces Identified:**
```typescript
// Stats Composition
interface PlayerBreakdown
interface WeeklyPlayerData
interface TeamStatsData
interface PositionStatsData
interface StatsDataset
interface PlainStatsDataset
interface TeamInfo
interface TeamWeekData

// Hooks/Client Types
interface WeeklyMetric
interface Roster
interface TeamStats
interface MatchupTeam
interface MatchupData
```

### 6. Transaction & Trade Types
**Current Locations:**
- `apps/web/src/app/stats/types.ts`
- `apps/web/src/components/transactions.tsx`
- Prisma schema

**Interfaces Identified:**
```typescript
interface GradeTxn
interface RawTxn
interface TransactionViewModel
```

### 7. Hall of Fame & Records Types
**Current Locations:**
- `apps/web/src/lib/hall-of-fame-calculations.ts`

**Interfaces Identified:**
```typescript
interface HallOfFameRecord
interface HallOfFameCategory
```

### 8. UI/Component Types
**Current Locations:**
- Individual component files
- `apps/web/src/lib/hooks.ts`

**Interfaces Identified:**
```typescript
interface SidebarTeam (in packages/types)
interface LeagueOverviewData
interface LeagueTransactionsResponse
interface PlayerStatsResponse
```

### 9. API Response Types
**Current Locations:**
- `packages/types/src/index.ts` (generic)
- Individual API route files (ad-hoc)

**Interfaces Identified:**
```typescript
interface ApiResponse<T>
interface PaginatedResponse<T>
```

### 10. Position & NFL Team Types
**Current State:** Scattered string unions and enums

**Types Needed:**
```typescript
type Position = 'QB' | 'RB' | 'WR' | 'TE' | 'K' | 'DEF';
type TrackedPosition = 'QB' | 'RB' | 'WR' | 'TE' | 'DEF'; // K excluded
type NFLTeam = 'ARI' | 'ATL' | 'BAL' | ... // All 32 teams
```

## Proposed Solution: Centralized Type System

### Architecture Overview

```
packages/
  types/
    src/
      index.ts                    # Main export file
      sleeper/                    # Sleeper API types
        api.ts                    # Core API types
        player-stats.ts           # Player stats (80+ fields)
        scoring.ts                # Scoring settings
        draft.ts                  # Draft-related types
      domain/                     # Fantasy football domain
        simulation.ts             # Simulation types
        matchup.ts                # Matchup types
        lineup.ts                 # Lineup types
      multi-league/               # Multi-league utilities
        composite-keys.ts         # TeamKey, MatchupKey, etc.
        aggregations.ts           # Multi-league aggregation types
      analytics/                  # Analytics & stats
        draft.ts                  # Draft analytics types
        manager.ts                # Manager analytics types
        stats.ts                  # Stats composition types
        transactions.ts           # Transaction grading types
      ui/                         # UI/Component types
        components.ts             # Shared component types
        api-responses.ts          # API response wrappers
      constants/                  # Type-related constants
        positions.ts              # Position unions and arrays
        nfl-teams.ts              # NFL team codes
```

### Migration Strategy

#### Phase 1: Create Core Type Package Structure (Week 1)
1. **Setup new directory structure** in `packages/types/src/`
2. **Migrate Sleeper API types** from `apps/web/src/lib/sleeper/types.ts` to `packages/types/src/sleeper/`
3. **Create composite key types** in `packages/types/src/multi-league/composite-keys.ts`
4. **Define position and team constants** in `packages/types/src/constants/`
5. **Build and test** package builds

#### Phase 2: Migrate Domain Types (Week 1-2)
1. **Consolidate simulation types** from `apps/sim-engine` and `packages/types`
2. **Create unified matchup/lineup types**
3. **Update sim-engine to import from packages/types**
4. **Verify simulation accuracy** with existing tests

#### Phase 3: Migrate Analytics Types (Week 2)
1. **Move draft analytics types** from `apps/web/src/lib/draft-analytics.ts`
2. **Move manager analytics types** from `apps/web/src/lib/manager-analytics.ts`
3. **Move stats composition types** from `apps/web/src/lib/stats/compose.ts`
4. **Update all analytics consumers**

#### Phase 4: Migrate Stats & Transaction Types (Week 2-3)
1. **Consolidate stats types** from `apps/web/src/lib/stats/*`
2. **Migrate transaction types** from `apps/web/src/app/stats/types.ts`
3. **Update all stats hub consumers**

#### Phase 5: Update Web App Imports (Week 3)
1. **Update API routes** to use centralized types
2. **Update hooks** to use centralized types
3. **Update components** to use centralized types
4. **Remove duplicate type definitions**

#### Phase 6: Update Server Imports (Week 3-4)
1. **Update server API routes**
2. **Update server services**
3. **Verify server build**

#### Phase 7: Cleanup & Documentation (Week 4)
1. **Remove all duplicate type files**
2. **Update documentation**
3. **Create type usage guide**
4. **Verify all builds and tests pass**

### Priority Order (Most Critical First)

1. **🔴 CRITICAL: Sleeper API Types** - Used everywhere, highest duplication
2. **🔴 CRITICAL: Composite Key Types** - Prevents multi-league bugs
3. **🟡 HIGH: Simulation Types** - Shared across multiple packages
4. **🟡 HIGH: Stats Composition Types** - Large, complex, heavily used
5. **🟢 MEDIUM: Analytics Types** - Feature-specific but duplicated
6. **🟢 MEDIUM: Transaction Types** - Localized to specific features
7. **🟢 LOW: UI Component Types** - Mostly localized

## Detailed Type Specifications

### 1. Sleeper API Types (`packages/types/src/sleeper/`)

#### api.ts
```typescript
/**
 * Core Sleeper API response types
 * https://docs.sleeper.app/
 */

export interface NFLState {
  week: number;
  season: string;
  season_type: 'regular' | 'pre' | 'post';
  season_start_date: string;
  leg?: number;
  league_season?: string;
  display_week?: number;
}

export interface SleeperLeague {
  league_id: string;
  name: string;
  season: string;
  status: 'pre_draft' | 'drafting' | 'in_season' | 'complete';
  sport: 'nfl';
  settings: {
    max_keepers: number;
    draft_rounds: number;
    trade_deadline: number;
    waiver_type: number;
    waiver_day_of_week: number;
    start_week: number;
    playoff_week_start: number;
    num_teams: number;
  };
  roster_positions: string[];
  scoring_settings: Record<string, number>;
  total_rosters: number;
  draft_id: string;
}

export interface SleeperUser {
  user_id: string;
  username: string;
  display_name: string;
  avatar?: string;
  metadata?: {
    team_name?: string;
    [key: string]: any;
  };
}

export interface SleeperRoster {
  roster_id: number;
  owner_id: string;
  players: string[]; // player_ids
  starters: string[]; // player_ids in starting lineup
  settings: {
    wins: number;
    losses: number;
    ties: number;
    fpts?: number;
    fpts_decimal?: number;
    fpts_against?: number;
    fpts_against_decimal?: number;
    ppts?: number;
    ppts_decimal?: number;
    waiver_position: number;
    waiver_budget_used: number;
    total_moves: number;
  };
  metadata?: Record<string, any>;
}

export interface SleeperMatchup {
  roster_id: number;
  matchup_id: number;
  points: number;
  custom_points?: number;
  players: string[];
  starters: string[];
  players_points: Record<string, number>;
  starters_points?: number[];
}

export interface SleeperPlayer {
  player_id: string;
  first_name?: string;
  last_name?: string;
  full_name?: string;
  team?: string | null;
  position?: string;
  age?: number;
  years_exp?: number;
  status?: string;
  injury_status?: string | null;
  injury_body_part?: string | null;
  injury_notes?: string | null;
  fantasy_positions?: string[];
  active?: boolean;
  height?: string;
  weight?: string;
  college?: string;
  birth_date?: string;
  [key: string]: any; // Sleeper has many optional fields
}

export type PlayerIndex = Record<
  string,
  {
    position?: string;
    full_name?: string;
    team?: string;
    fantasy_positions?: string[];
  }
>;
```

#### player-stats.ts
```typescript
/**
 * Sleeper Player Stats Interface
 * Comprehensive stat categories from Sleeper API
 */

export interface PlayerStats {
  // Fantasy points (calculated)
  pts_ppr?: number;
  pts_half_ppr?: number;
  pts_std?: number;

  // Passing stats
  pass_att?: number;
  pass_cmp?: number;
  pass_yd?: number;
  pass_td?: number;
  pass_int?: number;
  pass_sack?: number;
  pass_2pt?: number;
  pass_fd?: number;
  pass_cmp_40p?: number;
  pass_td_40p?: number;
  pass_td_50p?: number;
  pass_yd_300p?: number;
  pass_yd_400p?: number;
  pass_rtg?: number;

  // Rushing stats
  rush_att?: number;
  rush_yd?: number;
  rush_td?: number;
  rush_2pt?: number;
  rush_fd?: number;
  rush_40p?: number;
  rush_td_40p?: number;
  rush_td_50p?: number;
  rush_yd_100p?: number;
  rush_yd_200p?: number;

  // Receiving stats
  rec?: number;
  rec_tgt?: number;
  rec_yd?: number;
  rec_td?: number;
  rec_2pt?: number;
  rec_fd?: number;
  rec_40p?: number;
  rec_td_40p?: number;
  rec_td_50p?: number;
  rec_yd_100p?: number;
  rec_yd_200p?: number;

  // Defensive stats
  def_st_td?: number;
  def_st_fum_rec?: number;
  def_st_td_ret?: number;
  def_int?: number;
  def_int_td?: number;
  def_sack?: number;
  def_forced_fumble?: number;
  idp_tkl?: number;
  idp_tkl_solo?: number;
  idp_tkl_ast?: number;
  idp_tkl_loss?: number;

  // Kicking stats
  fgm?: number;
  fga?: number;
  fgm_0_19?: number;
  fgm_20_29?: number;
  fgm_30_39?: number;
  fgm_40_49?: number;
  fgm_50p?: number;
  fgmiss?: number;
  xpm?: number;
  xpmiss?: number;

  // Special teams
  st_td?: number;
  st_ff?: number;
  st_tkl_solo?: number;
  pr_td?: number;
  kr_td?: number;

  // Misc
  fum?: number;
  fum_lost?: number;
  fum_rec_td?: number;
  penalty?: number;
  penalty_yd?: number;
  snp?: number;
  gms_active?: number;
  gs?: number;
  gp?: number;
}
```

#### scoring.ts
```typescript
/**
 * League Scoring Settings
 * Maps stat categories to point values
 */

export interface ScoringSettings {
  // Passing
  pass_yd?: number;
  pass_td?: number;
  pass_int?: number;
  pass_2pt?: number;
  pass_cmp?: number;
  pass_inc?: number;
  pass_cmp_40p?: number;
  pass_fd?: number;

  // Rushing
  rush_yd?: number;
  rush_td?: number;
  rush_2pt?: number;
  rush_40p?: number;
  rush_fd?: number;

  // Receiving
  rec_yd?: number;
  rec_td?: number;
  rec?: number; // PPR value
  rec_2pt?: number;
  rec_40p?: number;
  rec_fd?: number;

  // Fumbles
  fum?: number;
  fum_lost?: number;
  fum_rec?: number;
  fum_rec_td?: number;

  // Kicking
  xpm?: number;
  xpmiss?: number;
  fgm_0_19?: number;
  fgm_20_29?: number;
  fgm_30_39?: number;
  fgm_40_49?: number;
  fgm_50_59?: number;
  fgm_60p?: number;
  fgmiss?: number;

  // Defense/Special Teams
  pts_allow_0?: number;
  pts_allow_1_6?: number;
  pts_allow_7_13?: number;
  pts_allow_14_20?: number;
  pts_allow_21_27?: number;
  pts_allow_28_34?: number;
  pts_allow_35p?: number;
  def_st_td?: number;
  def_int?: number;
  def_sack?: number;
  def_forced_fumble?: number;
  def_fum_rec?: number;

  [key: string]: number | undefined;
}
```

#### draft.ts
```typescript
/**
 * Sleeper Draft API Types
 */

export interface SleeperDraft {
  draft_id: string;
  type: 'snake' | 'auction' | 'linear';
  status: 'pre_draft' | 'drafting' | 'complete';
  season: string;
  settings: Record<string, any>;
  league_id: string;
  metadata: Record<string, any> | null;
  slot_to_roster_id: number[];
}

export interface SleeperDraftPick {
  pick_no: number;
  round: number;
  roster_id: number;
  player_id: string;
  picked_by: string;
  draft_id: string;
  metadata: {
    amount?: number | string; // Auction price
    [key: string]: any;
  } | null;
  is_keeper: boolean;
}
```

### 2. Multi-League Composite Types (`packages/types/src/multi-league/`)

#### composite-keys.ts
```typescript
/**
 * Multi-League Composite Key Types
 * CRITICAL: These prevent ID collision bugs across multiple leagues
 * 
 * Context: The Gauntlet manages 2 Sleeper leagues (AFC/NFC) as one competition.
 * - Roster IDs: Only unique within a league (both use 1-12)
 * - Matchup IDs: Only unique within a league/week (both use 1-6)
 * - Always use composite keys for cross-league operations
 */

/**
 * Team identifier across leagues
 * Format: "leagueId-rosterId"
 * Example: "1263744209295245312-5"
 */
export type TeamKey = `${string}-${number}`;

/**
 * Matchup identifier across leagues
 * Format: "leagueId-week-matchupId"
 * Example: "1263744209295245312-3-2"
 */
export type MatchupKey = `${string}-${number}-${number}`;

/**
 * Player-week identifier for stats
 * Format: "week:playerId"
 * Example: "3:12345"
 */
export type PlayerWeekKey = `${number}:${string}`;

/**
 * Helper functions to create composite keys
 */
export function createTeamKey(leagueId: string, rosterId: number): TeamKey {
  return `${leagueId}-${rosterId}`;
}

export function createMatchupKey(
  leagueId: string,
  week: number,
  matchupId: number
): MatchupKey {
  return `${leagueId}-${week}-${matchupId}`;
}

export function createPlayerWeekKey(week: number, playerId: string): PlayerWeekKey {
  return `${week}:${playerId}`;
}

/**
 * Parse composite keys back to components
 */
export function parseTeamKey(key: TeamKey): { leagueId: string; rosterId: number } {
  const [leagueId, rosterIdStr] = key.split('-');
  return { leagueId, rosterId: parseInt(rosterIdStr, 10) };
}

export function parseMatchupKey(
  key: MatchupKey
): { leagueId: string; week: number; matchupId: number } {
  const parts = key.split('-');
  return {
    leagueId: parts[0],
    week: parseInt(parts[1], 10),
    matchupId: parseInt(parts[2], 10),
  };
}

export function parsePlayerWeekKey(
  key: PlayerWeekKey
): { week: number; playerId: string } {
  const [weekStr, playerId] = key.split(':');
  return { week: parseInt(weekStr, 10), playerId };
}
```

### 3. Position & Constant Types (`packages/types/src/constants/`)

#### positions.ts
```typescript
/**
 * Fantasy Football Position Types
 */

export type Position = 'QB' | 'RB' | 'WR' | 'TE' | 'K' | 'DEF';

/**
 * Positions tracked in stats (excludes kickers)
 */
export type TrackedPosition = 'QB' | 'RB' | 'WR' | 'TE' | 'DEF';

/**
 * Flex-eligible positions
 */
export type FlexPosition = 'RB' | 'WR' | 'TE';

/**
 * All positions as readonly array (for iteration)
 */
export const ALL_POSITIONS: readonly Position[] = [
  'QB',
  'RB',
  'WR',
  'TE',
  'K',
  'DEF',
] as const;

/**
 * Tracked positions as readonly array
 */
export const TRACKED_POSITIONS: readonly TrackedPosition[] = [
  'QB',
  'RB',
  'WR',
  'TE',
  'DEF',
] as const;

/**
 * Type guard for Position
 */
export function isPosition(value: string): value is Position {
  return ALL_POSITIONS.includes(value as Position);
}

/**
 * Type guard for TrackedPosition
 */
export function isTrackedPosition(value: string): value is TrackedPosition {
  return TRACKED_POSITIONS.includes(value as TrackedPosition);
}
```

#### nfl-teams.ts
```typescript
/**
 * NFL Team Abbreviations
 */

export type NFLTeam =
  | 'ARI' | 'ATL' | 'BAL' | 'BUF'
  | 'CAR' | 'CHI' | 'CIN' | 'CLE'
  | 'DAL' | 'DEN' | 'DET' | 'GB'
  | 'HOU' | 'IND' | 'JAX' | 'KC'
  | 'LAC' | 'LAR' | 'LV' | 'MIA'
  | 'MIN' | 'NE' | 'NO' | 'NYG'
  | 'NYJ' | 'PHI' | 'PIT' | 'SEA'
  | 'SF' | 'TB' | 'TEN' | 'WAS';

export const NFL_TEAMS: readonly NFLTeam[] = [
  'ARI', 'ATL', 'BAL', 'BUF',
  'CAR', 'CHI', 'CIN', 'CLE',
  'DAL', 'DEN', 'DET', 'GB',
  'HOU', 'IND', 'JAX', 'KC',
  'LAC', 'LAR', 'LV', 'MIA',
  'MIN', 'NE', 'NO', 'NYG',
  'NYJ', 'PHI', 'PIT', 'SEA',
  'SF', 'TB', 'TEN', 'WAS',
] as const;

export type Conference = 'AFC' | 'NFC';
export type Division = 'North' | 'South' | 'East' | 'West';
```

## Files to Update (Complete List)

### Priority 1: High Usage Files
1. `apps/web/src/lib/sleeper/unified-client.ts` - Update to export from packages/types
2. `apps/web/src/hooks/useLeagueOverviewClient.ts` - Remove duplicate types
3. `apps/web/src/app/api/matchups/[leagueId]/[week]/route.ts` - Import from packages/types
4. `apps/sim-engine/src/models/matchup.ts` - Update simulation types
5. `apps/sim-engine/src/index.ts` - Update exports

### Priority 2: Stats & Analytics Files
6. `apps/web/src/lib/stats/compose.ts` - Use composite key types
7. `apps/web/src/lib/stats/teams.ts` - Use composite key types
8. `apps/web/src/lib/stats/join.ts` - Import from packages/types
9. `apps/web/src/lib/stats/positions.ts` - Use position types
10. `apps/web/src/lib/draft-analytics.ts` - Move types to packages/types
11. `apps/web/src/lib/manager-analytics.ts` - Move types to packages/types

### Priority 3: Component Files
12. `apps/web/src/lib/hooks.ts` - Import from packages/types
13. `apps/web/src/components/transactions.tsx` - Import from packages/types
14. All API route files in `apps/web/src/app/api/`

### Files to Delete (After Migration)
1. `apps/web/src/data/players-data.types.ts` (merge into sleeper types)
2. Inline type definitions in API routes
3. Duplicate simulation types in packages/types

## Success Criteria

### Functional Requirements
- ✅ All existing tests pass
- ✅ No runtime errors introduced
- ✅ TypeScript builds successfully across all packages
- ✅ Simulation accuracy unchanged (10K iteration tests)

### Type Safety Requirements
- ✅ No `any` types introduced
- ✅ All composite keys use template literal types
- ✅ Proper type exports from packages/types

### Developer Experience
- ✅ Single source of truth for all Sleeper API types
- ✅ IDE autocomplete works for all shared types
- ✅ Type documentation in JSDoc comments
- ✅ Easy import paths: `import { SleeperLeague, TeamKey } from '@gauntlet/types'`

### Performance
- ✅ TypeScript compile time not significantly increased
- ✅ Bundle size not significantly increased

## Risks & Mitigation

### Risk 1: Breaking Changes During Migration
**Mitigation:** 
- Use tactical page-by-page migration as per project rules
- Keep old types temporarily with deprecation comments
- Comprehensive testing at each step

### Risk 2: Simulation Type Changes Breaking Monte Carlo
**Mitigation:**
- Validate simulation outputs match exactly before/after
- Use existing variance data as ground truth
- Run 10K+ iteration tests

### Risk 3: Import Path Changes Causing Build Failures
**Mitigation:**
- Update tsconfig paths to support both old and new imports initially
- Use TypeScript's "find all references" before removing old types
- Gradual rollout with deprecation warnings

### Risk 4: Type Conflicts Between Packages
**Mitigation:**
- Clear naming conventions (Sleeper prefix for API types)
- Separate domain types from API types
- Use namespaces if needed for disambiguation

## Next Steps

1. **Approval** - Review and approve this specification
2. **Phase 1 Implementation** - Create core type structure in packages/types
3. **Validation** - Test with sim-engine as pilot migration
4. **Rollout** - Systematic migration following priority order
5. **Cleanup** - Remove duplicate types and update documentation

## Appendix: Type Usage Examples

### Before (Current State)
```typescript
// File: apps/web/src/lib/stats/teams.ts
const teamKey = `${data.leagueId}-${data.rosterId}`; // Ad-hoc construction

// File: apps/web/src/hooks/useLeagueOverviewClient.ts
interface SleeperLeague { // Duplicate definition
  league_id: string;
  name: string;
  // ...
}
```

### After (Unified State)
```typescript
// File: apps/web/src/lib/stats/teams.ts
import { createTeamKey, TeamKey } from '@gauntlet/types';

const teamKey: TeamKey = createTeamKey(data.leagueId, data.rosterId);

// File: apps/web/src/hooks/useLeagueOverviewClient.ts
import { SleeperLeague } from '@gauntlet/types/sleeper';

// No duplicate definition needed!
```

---

**Document Version:** 1.0  
**Last Updated:** September 29, 2025  
**Author:** AI Assistant based on comprehensive codebase analysis
