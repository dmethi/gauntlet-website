# WEB-EXTRACT-004: Stats Component Types

**Category**: EXTRACT  
**Priority**: 🟡 MEDIUM  
**Estimated Time**: 30 min  
**Dependencies**: WEB-SETUP-004

---

## Objective

Extract and consolidate type definitions from 3 large stats components
(`TrendsView.tsx`, `TeamView.tsx`, `ScheduleAnalysis.tsx`) into a centralized
`features/stats/types.ts` file, eliminating duplicate type definitions and
improving maintainability.

---

## Context Needed

**Read these files** (specific sections only):

1. `apps/web/src/app/stats/components/TrendsView.tsx` (lines 26-85) - 8
   interface definitions
2. `apps/web/src/app/stats/components/TeamView.tsx` (lines 23-65) - 7 interface
   definitions
3. `apps/web/src/app/stats/components/ScheduleAnalysis.tsx` (lines 28-47) - 4
   interface definitions

**Total Context**: ~100 lines to read

---

## Steps

### 1. Create the stats feature types file

```bash
cd /Users/dhruv.methi/Documents/GitHub/gauntlet-website/apps/web
mkdir -p src/features/stats
touch src/features/stats/types.ts
touch src/features/stats/index.ts
```

### 2. Add consolidated type definitions to `src/features/stats/types.ts`

Create the file with this content:

```typescript
/**
 * Stats Feature Types
 *
 * Type definitions for stats hub components (TrendsView, TeamView, ScheduleAnalysis).
 * Consolidates duplicate types and creates a single source of truth.
 */

import type { TrackedPosition, PlainStatsDataset } from '@/lib/stats/types';

/**
 * Team identification and display information
 */
export interface TeamInfo {
  teamName: string;
  leagueName: string;
  avatar?: string;
}

/**
 * Team score for a specific week
 */
export interface TeamScore {
  week: number;
  value: number;
}

/**
 * Complete team data with scores and opponent information
 */
export interface TeamData {
  teamInfo: TeamInfo;
  teamScores: TeamScore[];
  opponentScores?: TeamScore[];
}

/**
 * Individual player scoring information
 */
export interface PlayerScore {
  playerName: string;
  position: string;
  points: number;
}

/**
 * Positional team scoring data
 */
export interface PositionalTeamData {
  scores: { week: number; value: number }[];
}

/**
 * Position-level aggregated data
 */
export interface PositionData {
  teams: [string, PositionalTeamData][];
}

/**
 * Props for TrendsView component
 */
export interface TrendsViewProps {
  allTeamEntries: [string, TeamData][];
  positionsMap: Map<TrackedPosition, PositionData>;
  dataset: PlainStatsDataset;
}

/**
 * Power ranking team with calculated metrics
 */
export interface PowerRankingTeam {
  key: string;
  teamInfo: TeamInfo;
  avgPoints: number;
  expectedWins: number;
  rolling3Avg: number;
  weeklyScores: number;
}

/**
 * Ridge plot team data for distribution visualization
 */
export interface RidgeTeamData {
  teamName: string;
  leagueName: string;
  teamKey: string;
  min: number;
  max: number;
  pad: number;
  median: number;
  range: number;
  scores: number[];
  gamesPlayed: number;
}

/**
 * Props for TeamView component
 */
export interface TeamViewProps {
  allTeamEntries: [string, TeamData][];
  positionsMap: Map<TrackedPosition, PositionData>;
  dataset: PlainStatsDataset;
}

/**
 * Props for ScheduleAnalysis component
 */
export interface ScheduleAnalysisProps {
  allTeamEntries: [string, TeamData][];
  dataset: PlainStatsDataset;
}
```

### 3. Create barrel export for stats types

Add to `src/features/stats/index.ts`:

```typescript
/**
 * Stats Feature
 *
 * Exports all types for stats hub components.
 */

export type {
  // Core Data Types
  TeamInfo,
  TeamScore,
  TeamData,
  PlayerScore,
  PositionalTeamData,
  PositionData,

  // Component Props
  TrendsViewProps,
  TeamViewProps,
  ScheduleAnalysisProps,

  // Analysis Types
  PowerRankingTeam,
  RidgeTeamData,
} from './types';
```

### 4. Update `TrendsView.tsx` to use centralized types

At the top of `apps/web/src/app/stats/components/TrendsView.tsx` (around line
20), add:

```typescript
import type {
  TeamInfo,
  TeamScore,
  TeamData,
  PositionalTeamData,
  PositionData,
  TrendsViewProps,
  PowerRankingTeam,
  RidgeTeamData,
} from '@/features/stats';
```

Then remove the inline interface definitions (lines 26-85):

```typescript
// Remove these:
interface TeamInfo { ... }
interface TeamScore { ... }
interface TeamData { ... }
interface PositionalTeamData { ... }
interface PositionData { ... }
interface TrendsViewProps { ... }
interface PowerRankingTeam { ... }
interface RidgeTeamData { ... }
```

### 5. Update `TeamView.tsx` to use centralized types

At the top of `apps/web/src/app/stats/components/TeamView.tsx` (around line 18),
add:

```typescript
import type {
  TeamInfo,
  TeamScore,
  TeamData,
  PlayerScore,
  PositionalTeamData,
  PositionData,
  TeamViewProps,
} from '@/features/stats';
```

Then remove the inline interface definitions (lines 23-65):

```typescript
// Remove these:
interface TeamInfo { ... }
interface TeamScore { ... }
interface TeamData { ... }
interface PlayerScore { ... }
interface PositionTeamData { ... }
interface PositionData { ... }
interface TeamViewProps { ... }
```

### 6. Update `ScheduleAnalysis.tsx` to use centralized types

At the top of `apps/web/src/app/stats/components/ScheduleAnalysis.tsx` (around
line 23), add:

```typescript
import type {
  TeamInfo,
  TeamScore,
  TeamData,
  ScheduleAnalysisProps,
} from '@/features/stats';
```

Then remove the inline interface definitions (lines 28-47):

```typescript
// Remove these:
interface TeamInfo { ... }
interface TeamScore { ... }
interface TeamData { ... }
interface ScheduleAnalysisProps { ... }
```

### 7. Verify TypeScript compilation

```bash
cd /Users/dhruv.methi/Documents/GitHub/gauntlet-website/apps/web
pnpm tsc --noEmit
```

---

## Acceptance Criteria

- [ ] `src/features/stats/types.ts` created with all consolidated types
- [ ] `src/features/stats/index.ts` barrel export created
- [ ] `TrendsView.tsx` imports types from `@/features/stats`
- [ ] `TeamView.tsx` imports types from `@/features/stats`
- [ ] `ScheduleAnalysis.tsx` imports types from `@/features/stats`
- [ ] Duplicate type definitions removed from all 3 components
- [ ] TypeScript compilation passes (`pnpm tsc --noEmit`)
- [ ] No runtime changes (all components still work)
- [ ] Total lines reduced by ~100 lines across 3 files

---

## Verification Commands

```bash
cd /Users/dhruv.methi/Documents/GitHub/gauntlet-website/apps/web

# Verify TypeScript compilation
pnpm tsc --noEmit

# Verify new files exist
test -f src/features/stats/types.ts && echo "✅ types.ts created"
test -f src/features/stats/index.ts && echo "✅ index.ts created"

# Verify types file has all interfaces
grep -c "^export interface" src/features/stats/types.ts
# Expected: 13 interfaces

# Verify TrendsView imports from feature
grep "import.*from '@/features/stats'" src/app/stats/components/TrendsView.tsx && echo "✅ TrendsView imports updated"

# Verify TeamView imports from feature
grep "import.*from '@/features/stats'" src/app/stats/components/TeamView.tsx && echo "✅ TeamView imports updated"

# Verify ScheduleAnalysis imports from feature
grep "import.*from '@/features/stats'" src/app/stats/components/ScheduleAnalysis.tsx && echo "✅ ScheduleAnalysis imports updated"

# Verify inline interfaces removed from TrendsView
! grep "^interface TeamInfo" src/app/stats/components/TrendsView.tsx && echo "✅ TrendsView inline interfaces removed"

# Verify inline interfaces removed from TeamView
! grep "^interface TeamInfo" src/app/stats/components/TeamView.tsx && echo "✅ TeamView inline interfaces removed"

# Verify inline interfaces removed from ScheduleAnalysis
! grep "^interface TeamInfo" src/app/stats/components/ScheduleAnalysis.tsx && echo "✅ ScheduleAnalysis inline interfaces removed"
```

---

## Cursor Prompt (Copy-Paste Ready)

```
I'm working on WEB-EXTRACT-004: Extract Stats Component Types.

Context:
- Read apps/web/src/app/stats/components/TrendsView.tsx (lines 26-85)
- Read apps/web/src/app/stats/components/TeamView.tsx (lines 23-65)
- Read apps/web/src/app/stats/components/ScheduleAnalysis.tsx (lines 28-47)
- These 3 components have duplicate type definitions (TeamInfo, TeamScore, TeamData)

Tasks:
1. Create src/features/stats/types.ts with consolidated interfaces
2. Eliminate duplicate types (TeamInfo, TeamScore, TeamData appear in all 3 files)
3. Add comprehensive JSDoc comments to each interface
4. Create src/features/stats/index.ts barrel export
5. Update all 3 components to import from @/features/stats
6. Remove inline interface definitions from all 3 components
7. Verify TypeScript compilation passes

Expected outcome: ~100 lines removed across 3 components, types centralized in feature directory.
```

---

## Related Tasks

**Blocks**: WEB-COMP-002, WEB-COMP-004, WEB-COMP-005 (component splitting
tasks)  
**Blocked By**: WEB-SETUP-004 (Feature Folder Structure)  
**Related**: WEB-HOOK-003 (Stats Hub Hooks), WEB-PAGE-002 (Migrate Stats Pages)

---

## Notes

### Why This Matters

- **Eliminates Duplication**: `TeamInfo`, `TeamScore`, and `TeamData` are
  defined in all 3 files
- **Single Source of Truth**: Changes to shared types only need to happen once
- **Feature Organization**: Establishes `features/stats/` pattern for stats hub
- **Cleaner Components**: ~30-40 lines removed from each component file
- **Better Maintainability**: Centralized types easier to update and extend

### Type Consolidation Details

**Duplicate Types** (appear in multiple files):

- `TeamInfo` - Appears in all 3 components (TrendsView, TeamView,
  ScheduleAnalysis)
- `TeamScore` - Appears in all 3 components
- `TeamData` - Appears in all 3 components
- `PositionalTeamData` - Appears in TrendsView and TeamView
- `PositionData` - Appears in TrendsView and TeamView

**Unique Types** (component-specific):

- `PowerRankingTeam` - Only in TrendsView
- `RidgeTeamData` - Only in TrendsView
- `PlayerScore` - Only in TeamView

**Component Props** (component-specific but should be centralized):

- `TrendsViewProps` - TrendsView component
- `TeamViewProps` - TeamView component
- `ScheduleAnalysisProps` - ScheduleAnalysis component

### File Size Reductions

- `TrendsView.tsx`: ~60 lines removed (from 1,606 to ~1,546)
- `TeamView.tsx`: ~43 lines removed (from 1,198 to ~1,155)
- `ScheduleAnalysis.tsx`: ~20 lines removed (from 1,243 to ~1,223)

**Total**: ~123 lines of duplicate code eliminated

---

**Estimated Context Usage**: 100 lines read, 250 lines written (including
documentation), 30 min total
