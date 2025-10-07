# WEB-EXTRACT-003: Hooks Types

**Category**: EXTRACT  
**Priority**: 🟡 MEDIUM  
**Estimated Time**: 20 min  
**Dependencies**: WEB-SETUP-004

---

## Objective

Extract cross-feature type definitions from `lib/hooks.ts` to a new
`shared/types/api.ts` file, creating a centralized location for shared API
response types used across multiple features.

---

## Context Needed

**Read these files** (specific sections only):

1. `apps/web/src/lib/hooks.ts` (lines 8-75) - Interface definitions
2. Check `@gauntlet/types` imports to avoid duplication

**Total Context**: ~70 lines to read

---

## Steps

### 1. Create the shared types directory structure

```bash
cd /Users/dhruv.methi/Documents/GitHub/gauntlet-website/apps/web
mkdir -p src/shared/types
touch src/shared/types/api.ts
touch src/shared/types/index.ts
```

### 2. Add API type definitions to `src/shared/types/api.ts`

Create the file with this content:

```typescript
/**
 * Shared API Types
 *
 * Type definitions for API responses and data structures shared across multiple features.
 * These types extend or wrap types from @gauntlet/types for frontend-specific needs.
 */

import type { FantasyTeam, League } from '@gauntlet/types';

/**
 * Individual matchup result for a team
 */
export interface Matchup {
  week: number;
  points: number;
  projected: number;
  result: 'W' | 'L' | 'T';
  matchupId?: number; // For proper linking to matchup details
}

/**
 * Weekly metrics for a team's performance
 */
export interface WeeklyMetric {
  week: number;
  totalPoints: number;
  expectedWins: number;
  luckRating: number;
  opponentPoints: number;
}

/**
 * Extended roster information with matchup history
 *
 * Extends FantasyTeam from @gauntlet/types with frontend-specific fields
 */
export interface Roster extends FantasyTeam {
  matchups: Matchup[];
  weeklyMetrics: WeeklyMetric[];
  league: League;
  settings?: {
    division?: number;
    [key: string]: any; // eslint-disable-line @typescript-eslint/no-explicit-any
  };
  owner: {
    displayName: string;
    username: string;
    avatar?: string;
    metadata: {
      team_name: string;
    };
  };
  coOwnerDetails?: Array<{
    displayName?: string;
    username?: string;
    avatar?: string;
  }>;
}

/**
 * Aggregated team statistics for display
 */
export interface TeamStats {
  id: string;
  name: string;
  owner: string;
  wins: number;
  losses: number;
  totalPoints: number;
  expectedWins: number;
  luckRating: number;
  winPercentage: number;
  canonicalRank: number;
  division?: number | null;
}

/**
 * Extended league data with frontend-specific fields
 */
export interface LeagueData extends League {
  playoff_week_start?: number;
  rosters: Roster[];
  transactions?: Array<{
    id: string;
    type: string;
    createdAt: string;
    rosterIds?: number[];
    adds?: unknown;
    drops?: unknown;
    settings?: {
      waiver_bid?: number;
    };
  }>;
}
```

### 3. Create barrel export for shared types

Add to `src/shared/types/index.ts`:

```typescript
/**
 * Shared Types
 *
 * Exports all shared type definitions used across multiple features.
 */

export type {
  Matchup,
  WeeklyMetric,
  Roster,
  TeamStats,
  LeagueData,
} from './api';
```

### 4. Update `lib/hooks.ts` to use shared types

At the top of `lib/hooks.ts` (around line 6), add:

```typescript
import type {
  Matchup,
  WeeklyMetric,
  Roster,
  TeamStats,
  LeagueData,
} from '@/shared/types';
```

Then remove the inline interface definitions (lines 8-75 approximately):

```typescript
// Remove these:
interface Matchup { ... }
interface WeeklyMetric { ... }
interface Roster extends FantasyTeam { ... }
export interface TeamStats { ... }
interface LeagueData extends League { ... }
```

**Note**: Keep the `export` keyword on `TeamStats` if it's exported, otherwise
import/export it from `@/shared/types`.

### 5. Verify TypeScript compilation

```bash
cd /Users/dhruv.methi/Documents/GitHub/gauntlet-website/apps/web
pnpm tsc --noEmit
```

---

## Acceptance Criteria

- [ ] `src/shared/types/api.ts` created with 5 interface definitions
- [ ] `src/shared/types/index.ts` barrel export created
- [ ] `lib/hooks.ts` imports types from `@/shared/types`
- [ ] Inline interface definitions removed from `lib/hooks.ts`
- [ ] TypeScript compilation passes (`pnpm tsc --noEmit`)
- [ ] No runtime changes (all hooks still work)
- [ ] File size of `hooks.ts` reduced by ~70 lines

---

## Verification Commands

```bash
cd /Users/dhruv.methi/Documents/GitHub/gauntlet-website/apps/web

# Verify TypeScript compilation
pnpm tsc --noEmit

# Verify new files exist
test -f src/shared/types/api.ts && echo "✅ api.ts created"
test -f src/shared/types/index.ts && echo "✅ index.ts created"

# Verify types file has all interfaces
grep -c "^export interface" src/shared/types/api.ts
# Expected: 5 (Matchup, WeeklyMetric, Roster, TeamStats, LeagueData)

# Verify hooks.ts imports from shared
grep "import.*from '@/shared/types'" src/lib/hooks.ts && echo "✅ Import added"

# Verify inline interfaces removed
! grep "^interface Matchup" src/lib/hooks.ts && echo "✅ Inline interfaces removed"

# Count lines saved
wc -l src/lib/hooks.ts
# Expected: ~660 lines (down from ~727)
```

---

## Cursor Prompt (Copy-Paste Ready)

```
I'm working on WEB-EXTRACT-003: Extract Hooks Types.

Context:
- Read apps/web/src/lib/hooks.ts (lines 8-75 only)
- This file has 5 interfaces mixed with hook implementations
- These types are shared across multiple features

Tasks:
1. Create src/shared/types/api.ts with extracted interfaces
2. Add comprehensive JSDoc comments to each interface
3. Create src/shared/types/index.ts barrel export
4. Update lib/hooks.ts to import from @/shared/types
5. Remove inline interface definitions from hooks.ts
6. Verify TypeScript compilation passes

Expected outcome: ~70 lines removed from hooks.ts, centralized in shared types.
```

---

## Related Tasks

**Blocks**: WEB-HOOK-001, WEB-HOOK-002, WEB-HOOK-003 (all hook extractions)  
**Blocked By**: WEB-SETUP-004 (Feature Folder Structure)  
**Related**: WEB-EXTRACT-002 (Manager Analytics Types)

---

## Notes

### Why This Matters

- **Cross-Feature Reusability**: These types are used by multiple features
  (stats, matchups, hall-of-fame)
- **Cleaner Hooks File**: Separates types from hook logic (~70 lines removed)
- **Shared Location**: Establishes `shared/types/` pattern for cross-feature
  types
- **Better Organization**: Types grouped with other shared code

### Interfaces Being Moved

1. **Matchup** (5 fields) - Individual matchup result
2. **WeeklyMetric** (5 fields) - Weekly performance metrics
3. **Roster** (extends FantasyTeam) - Extended roster with frontend fields
4. **TeamStats** (11 fields) - Aggregated team statistics
5. **LeagueData** (extends League) - Extended league with frontend fields

### Design Decision: Why `shared/types/` vs Feature Types?

These types go in `shared/types/` because:

- ✅ Used by multiple features (matchups, stats, hall-of-fame, transactions)
- ✅ Represent core data structures from API responses
- ✅ Not specific to any single feature domain

Types like `ManagerAnalysisProps` went in `features/draft-analysis/types.ts`
because:

- They're specific to one feature
- They represent feature-specific domain models

---

**Estimated Context Usage**: 70 lines read, 150 lines written (including
documentation), 20 min total
