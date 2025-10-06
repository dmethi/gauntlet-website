# Type Consolidation Inventory

**Generated**: 2025-10-06  
**Purpose**: Identify duplicate/overlapping types across apps for consolidation into `@gauntlet/types`

---

## 🎯 Executive Summary

**Total Type Definitions Found**: 342 across web, server, and sim-engine
- **Web App**: 307 definitions
- **Server App**: 20 definitions (excluding Prisma-generated)
- **Sim Engine**: 15 definitions
- **Central Types Package**: 20 definitions (currently underutilized)

**Key Findings**:
1. ✅ **High-Priority Duplicates**: Sleeper API types defined in 10+ locations
2. ✅ **Simulation Types**: Duplicated between sim-engine and web app
3. ✅ **Domain Types**: Player, Team, Matchup types scattered across apps
4. ⚠️ **UI-Only Types**: Component props, modal states (should stay local)

---

## 🔴 HIGH PRIORITY: Sleeper API Types (Most Duplicated)

### SleeperUser
**Defined in 7 locations**:
1. `apps/web/src/lib/sleeper/types.ts` (canonical, most complete)
2. `apps/web/src/hooks/useHallOfFame.ts`
3. `apps/web/src/hooks/useLeagueOverviewClient.ts`
4. `apps/web/src/hooks/useClientCalculations.ts`
5. `apps/web/src/app/api/team/[id]/route.ts`
6. `apps/server/src/scripts/maintenance/sync-team-names.ts`

**Canonical Definition** (apps/web/src/lib/sleeper/types.ts:38-46):
```typescript
export interface SleeperUser {
  user_id: string;
  username: string;
  display_name: string;
  avatar?: string;
  metadata?: {
    team_name?: string;
  };
}
```

---

### SleeperRoster
**Defined in 6 locations**:
1. `apps/web/src/lib/sleeper/types.ts` (canonical, most complete)
2. `apps/web/src/hooks/useHallOfFame.ts`
3. `apps/web/src/hooks/useLeagueOverviewClient.ts`
4. `apps/web/src/hooks/useClientCalculations.ts`
5. `apps/web/src/app/api/team/[id]/route.ts`
6. `apps/server/src/scripts/maintenance/sync-team-names.ts`

**Canonical Definition** (apps/web/src/lib/sleeper/types.ts:48-68):
```typescript
export interface SleeperRoster {
  roster_id: number;
  owner_id: string;
  players: string[];
  starters: string[];
  settings: {
    wins: number;
    waiver_position: number;
    waiver_budget_used: number;
    total_moves: number;
    ties: number;
    ppts?: number;
    ppts_decimal?: number;
    losses: number;
    fpts_against?: number;
    fpts_against_decimal?: number;
    fpts?: number;
    fpts_decimal?: number;
  };
  metadata?: Record<string, any>;
}
```

---

### SleeperMatchup
**Defined in 5 locations**:
1. `apps/web/src/lib/sleeper/types.ts` (canonical)
2. `apps/web/src/hooks/useHallOfFame.ts`
3. `apps/web/src/hooks/useClientCalculations.ts`
4. `apps/web/src/app/api/team/[id]/route.ts`
5. `apps/web/src/app/api/matchups/[leagueId]/[week]/route.ts` (incomplete subset)

**Canonical Definition** (apps/web/src/lib/sleeper/types.ts:70-79):
```typescript
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
```

---

### SleeperLeague
**Defined in 5 locations**:
1. `apps/web/src/lib/sleeper/types.ts` (canonical, most complete)
2. `apps/web/src/hooks/useHallOfFame.ts`
3. `apps/web/src/hooks/useLeagueOverviewClient.ts`
4. `apps/web/src/hooks/useClientCalculations.ts`
5. `apps/web/src/app/api/team/[id]/route.ts`

**Canonical Definition** (apps/web/src/lib/sleeper/types.ts:16-36):
```typescript
export interface SleeperLeague {
  league_id: string;
  name: string;
  season: string;
  status: string;
  sport: string;
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
```

---

### SleeperPlayer
**Defined in 4 locations**:
1. `apps/web/src/lib/sleeper/types.ts` (canonical, most complete)
2. `apps/web/src/hooks/useClientCalculations.ts`
3. `apps/web/src/lib/draft-data-fetcher.ts` (simplified subset)
4. `apps/web/src/data/players-data.types.ts` (extended with fantasy data)

**Canonical Definition** (apps/web/src/lib/sleeper/types.ts:81-96):
```typescript
export interface SleeperPlayer {
  player_id: string;
  first_name?: string;
  last_name?: string;
  full_name?: string;
  team?: string;
  position?: string;
  age?: number;
  years_exp?: number;
  status?: string;
  injury_status?: string;
  injury_body_part?: string;
  injury_notes?: string;
  fantasy_positions?: string[];
  active?: boolean;
}
```

---

### NFLState
**Defined in 2 locations**:
1. `apps/web/src/lib/sleeper/types.ts` (canonical)
2. `apps/web/src/app/api/matchups/[leagueId]/[week]/[matchupId]/simulate/route.ts` (simplified)

**Canonical Definition** (apps/web/src/lib/sleeper/types.ts:6-14):
```typescript
export interface NFLState {
  week: number;
  season: string;
  season_type: string;
  season_start_date: string;
  leg?: number;
  league_season?: string;
  display_week?: number;
}
```

---

### PlayerStats
**Defined in 1 location (but should be central)**:
- `apps/web/src/lib/sleeper/unified-client.ts:27-130` (comprehensive, 100+ fields)

**Should Move**: This is a core domain type used for analytics across apps

---

## 🟡 MEDIUM PRIORITY: Simulation Types

### LineupPlayer
**Defined in 2 locations**:
1. `apps/sim-engine/src/models/matchup.ts:7-14` (canonical with live support)
2. Implicit in multiple web components

**Canonical Definition**:
```typescript
export interface LineupPlayer {
  id: string;
  name: string;
  position: string;
  projection: number;
  currentScore?: number; // Actual points scored so far (for live simulations)
  nflTeam?: string; // NFL team abbreviation (for selective game progress)
}
```

---

### MatchupSimulationResult
**Defined in 3 locations**:
1. `apps/sim-engine/src/models/matchup.ts:34-56` (canonical with betting lines)
2. `apps/sim-engine/src/index.ts:16-33` (re-export)
3. `packages/types/src/index.d.ts:107-117` (outdated, missing betting lines)

**Canonical Definition** (sim-engine/src/models/matchup.ts:34-56):
```typescript
export interface MatchupSimulationResult {
  team1WinPct: number;
  team2WinPct: number;
  medianMargin: number;
  team1Scores: {
    mean: number;
    median: number;
    p10: number;
    p90: number;
  };
  team2Scores: {
    mean: number;
    median: number;
    p10: number;
    p90: number;
  };
  impliedOdds: {
    team1MoneyLine: number;
    team2MoneyLine: number;
    spread: number;
    total: number;
  };
}
```

---

### MatchupResult
**Defined in 2 locations**:
1. `apps/sim-engine/src/models/matchup.ts:27-32`
2. `apps/sim-engine/src/index.ts:9-14` (re-export)

**Canonical Definition**:
```typescript
export interface MatchupResult {
  team1Score: number;
  team2Score: number;
  winner: 1 | 2;
  margin: number;
}
```

---

### Variance Data Types
**Defined in 1 location (should be central)**:
- `apps/sim-engine/src/data/variance-data.types.ts` (PositionVarianceRecord, PlayerVarianceRecord, ProjectionErrorRecord)

**Should Move**: Used by both sim-engine and potentially server for analytics

---

## 🟢 LOW PRIORITY: Domain-Specific Analytics Types

### TeamInfo (Stats/Analytics Context)
**Defined in 9 locations** (but semantically different - UI-specific):
1. `apps/web/src/app/stats/types.ts:62-67`
2. `apps/web/src/app/stats/components/TeamView.tsx:23-28`
3. `apps/web/src/app/stats/components/TrendsView.tsx:26-30`
4. `apps/web/src/app/stats/components/ScatterAnalysis.tsx:18-22`
5. `apps/web/src/app/stats/components/ScheduleAnalysis.tsx:28-32`
6. `apps/web/src/app/stats/components/LeagueView.tsx:26-30`
7. `apps/web/src/lib/stats/join.ts:7-11`
8. `apps/web/src/app/api/preview/[season]/[week]/route.ts:74-85`

**Note**: These are UI component props with overlapping names but different purposes. Recommend keeping local and using better naming.

---

### Hall of Fame Types
**Defined in 3 locations**:
1. `apps/web/src/lib/hall-of-fame-calculations.ts` (canonical)
   - `HallOfFameRecord`
   - `HallOfFameCategory`
   - `ProcessedMatchup`
2. `apps/web/src/hooks/useHallOfFameEnhanced.ts`
   - `PositionalDifferenceRecord`
   - `ComprehensiveHallOfFameData`
3. `apps/web/src/lib/hall-of-fame-data-service.ts`
   - `LiveWinProbSample`
   - `EnhancedMatchup`

**Recommendation**: Consolidate hall-of-fame types into domain module

---

### Start/Sit Analysis Types
**Defined in 3 locations**:
1. `apps/web/src/lib/start-sit/analysis.ts:14-70` (canonical)
2. `apps/web/src/components/start-sit-efficiency.tsx:18-81` (duplicate)
3. `apps/web/src/components/stats/StartSitEfficiencyTab.tsx:7-15` (simplified)

**Recommendation**: Consolidate into central types (used across multiple features)

---

### Transaction Types
**Defined in 2 locations**:
1. `apps/web/src/app/stats/types.ts` (GradeTxn, RawTxn)
2. `apps/web/src/lib/transactions-facts.ts` (Facts type)

**Recommendation**: Consolidate into central analytics types

---

## 🔵 KEEP LOCAL: UI-Specific Types

These should **NOT** be moved to central types (component-specific):

### Component Props
- `ProgressProps` (components/ui/progress.tsx)
- `SidebarProps` (components/sidebar.tsx)
- `MatchupSimulationProps` (components/matchup-simulation.tsx)
- `RidgePlotProps` (app/stats/components/RidgePlot.tsx)
- All modal/tab component props

### API Route Types
- Route-specific request/response shapes
- Intermediate transformation types

### Page-Specific Types
- Report page box rows
- Preview page interfaces
- One-off data structures

---

## 📋 CONSOLIDATION PLAN

### Phase 1: Sleeper API Types (Highest Impact)
**Target**: `packages/types/src/sleeper.ts` (new file)

Move from `apps/web/src/lib/sleeper/types.ts`:
- ✅ `NFLState`
- ✅ `SleeperLeague`
- ✅ `SleeperUser`
- ✅ `SleeperRoster`
- ✅ `SleeperMatchup`
- ✅ `SleeperPlayer`
- ✅ `PlayerIndex`

Move from `apps/web/src/lib/sleeper/unified-client.ts`:
- ✅ `PlayerStats` (comprehensive stats interface)
- ✅ `ErrorStrategy`, `DebugStrategy`, `CacheStrategy` (type literals)
- ✅ `SleeperClientConfig`

**Impact**: Eliminates 25+ duplicate definitions across 10+ files

---

### Phase 2: Simulation Types
**Target**: `packages/types/src/simulation.ts` (new file)

Move from `apps/sim-engine/src/models/matchup.ts`:
- ✅ `LineupPlayer`
- ✅ `Lineup`
- ✅ `MatchupResult`
- ✅ `MatchupSimulationResult`

Move from `apps/sim-engine/src/data/variance-data.types.ts`:
- ✅ `PositionVarianceRecord`
- ✅ `PlayerVarianceRecord`
- ✅ `ProjectionErrorRecord`
- ✅ `VarianceData`

Move from `apps/sim-engine/src/models/variance.ts`:
- ✅ `SamplingContext`

Update `packages/types/src/index.d.ts`:
- ❌ Remove outdated `SimulationResult`
- ❌ Remove outdated `PlayerProjection`
- ❌ Remove outdated `ProjectionFactor`

**Impact**: Single source of truth for simulation types across web and sim-engine

---

### Phase 3: Analytics & Domain Types
**Target**: `packages/types/src/analytics.ts` (new file)

Move from various stats modules:
- ✅ `WeeklyDataPoint` (lib/stats/compose.ts)
- ✅ `PlayerBreakdown` (lib/stats/compose.ts)
- ✅ `TeamStatsData` (lib/stats/compose.ts)
- ✅ `PositionStatsData` (lib/stats/compose.ts)
- ✅ `StatsDataset` (lib/stats/compose.ts)
- ✅ `PositionalAdvantage` (lib/stats/positional-advantages.ts)

Move from hall-of-fame modules:
- ✅ `HallOfFameRecord` (lib/hall-of-fame-calculations.ts)
- ✅ `HallOfFameCategory` (lib/hall-of-fame-calculations.ts)
- ✅ `ProcessedMatchup` (lib/hall-of-fame-calculations.ts)

Move from start-sit analysis:
- ✅ `ManagerEfficiency` (lib/start-sit/analysis.ts)
- ✅ `PositionDecision` (lib/start-sit/analysis.ts)
- ✅ `StartSitData` (lib/start-sit/analysis.ts)

Move from transactions:
- ✅ `GradeTxn` (app/stats/types.ts)
- ✅ `RawTxn` (app/stats/types.ts)

**Impact**: Centralized analytics types for cross-app usage

---

### Phase 4: Update Type Definitions in Central Package
**Target**: `packages/types/src/index.d.ts` (update existing)

Keep generic fantasy types:
- ✅ `Player` (update with Sleeper compatibility)
- ✅ `Team`
- ✅ `League` (update with Sleeper compatibility)
- ✅ `FantasyTeam`
- ⚠️ Remove/deprecate outdated simulation types

**Impact**: Clean up central package, remove obsolete definitions

---

## 🎯 MIGRATION STRATEGY

### Step 1: Create New Type Modules
1. Create `packages/types/src/sleeper.ts`
2. Create `packages/types/src/simulation.ts`
3. Create `packages/types/src/analytics.ts`
4. Update `packages/types/src/index.ts` to export all

### Step 2: Incremental Migration (by file priority)

**Order of Operations**:
1. ✅ Migrate types to central package
2. ✅ Build `@gauntlet/types` package
3. ✅ Update imports in hooks (most usage)
4. ✅ Update imports in API routes
5. ✅ Update imports in components
6. ✅ Delete old type definitions
7. ✅ Test builds across all apps

**Testing Checkpoints**:
- After each phase, run: `pnpm build` in root
- Verify no TypeScript errors
- Spot-check runtime behavior

### Step 3: Update Cursor Rules
Add to `.cursorrules`:
```
## 🎯 Type System Standards

### Central Type Definitions
**ALWAYS import domain types from `@gauntlet/types`:**

```typescript
// ✅ CORRECT: Import from central package
import type { 
  SleeperLeague, 
  SleeperRoster, 
  SleeperMatchup,
  LineupPlayer,
  MatchupSimulationResult 
} from '@gauntlet/types';

// ❌ WRONG: Redefining types locally
interface SleeperLeague { ... }
```

**When to Define Local Types**:
- Component-specific props (e.g., `ButtonProps`)
- Route-specific request/response shapes
- UI-only state management types
- Temporary transformation types

**When to Use Central Types**:
- Sleeper API responses
- Simulation inputs/outputs
- Analytics data structures
- Cross-app domain models
```

---

## 📊 Impact Analysis

### Files to Update (Estimated)
- **Hooks**: 5 files (high usage of Sleeper types)
- **API Routes**: 8 files
- **Components**: 15 files
- **Lib/Utils**: 10 files
- **Scripts**: 3 files

**Total**: ~41 files to update imports

### Benefits
1. ✅ **Single Source of Truth**: No more drift between definitions
2. ✅ **Type Safety**: Compiler catches mismatches immediately
3. ✅ **Developer Experience**: Auto-complete works across apps
4. ✅ **Maintainability**: Update types once, propagate everywhere
5. ✅ **Documentation**: Central types serve as API documentation

### Risks
- ⚠️ Breaking changes during migration (mitigated by incremental approach)
- ⚠️ Temporarily duplicated imports during transition
- ⚠️ Build system coordination across packages

---

## 🚦 Next Steps

**Approval Required**:
1. Review this inventory for accuracy
2. Confirm priority order (Sleeper → Simulation → Analytics)
3. Approve incremental migration strategy

**Once Approved**:
1. Begin Phase 1: Create sleeper.ts in central package
2. Update top 5 most-used files first
3. Test, iterate, complete phase
4. Repeat for remaining phases

---

**Questions for Review**:
1. Should we keep generic fantasy types in central package or remove them?
2. Any UI types that should actually be centralized?
3. Preference for file structure: single `index.ts` vs separate modules?

