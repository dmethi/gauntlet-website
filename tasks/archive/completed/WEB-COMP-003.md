# WEB-COMP-003: Split Playoff Bracket Component

**Category**: COMP (Component Splitting)  
**Priority**: 🟡 MEDIUM  
**Estimated Time**: 2 hours  
**Dependencies**: WEB-EXTRACT-005

---

## Objective

Break down `playoff-bracket.tsx` (1,349 lines) into maintainable sub-components
with proper separation of concerns for playoff bracket visualization and toilet
bowl bracket.

---

## Current State

**File**: `apps/web/src/components/playoff-bracket.tsx`  
**Lines**: 1,349 lines  
**Issues**:

- Monolithic component combining regular playoffs and toilet bowl
- Complex matchup rendering logic repeated multiple times
- Helper functions defined inline
- Bracket layout calculations mixed with rendering
- No memoization for team cards

**Component Structure**:

- Matchup component (lines 18-122) - Individual matchup rendering
- Main PlayoffBracket component (lines 1225-1349) - Container with layout
- Bracket generation logic (lines 200-1200) - Complex conditional rendering

---

## Target Structure

```
apps/web/src/features/playoffs/components/
├── PlayoffBracket/
│   ├── PlayoffBracket.tsx              # Main container (~120 lines)
│   ├── PlayoffBracket.test.tsx
│   ├── BracketRound.tsx                # Round container (~80 lines)
│   ├── BracketMatchup.tsx              # Matchup card (~120 lines)
│   ├── BracketMatchup.test.tsx
│   ├── BracketTeam.tsx                 # Team display (~80 lines)
│   ├── BracketTeam.test.tsx
│   ├── ToiletBowlBracket.tsx           # Toilet bowl specific (~150 lines)
│   ├── ToiletBowlBracket.test.tsx
│   ├── ChampionshipBracket.tsx         # Championship specific (~150 lines)
│   ├── ChampionshipBracket.test.tsx
│   ├── BracketLegend.tsx               # Legend/key (~60 lines)
│   ├── utils.ts                         # Bracket logic utilities
│   ├── utils.test.ts
│   └── index.ts
```

---

## Steps

### Step 1: Create Directory Structure

```bash
cd /Users/dhruv.methi/Documents/GitHub/gauntlet-website/apps/web/src
mkdir -p features/playoffs/components/PlayoffBracket
touch features/playoffs/components/PlayoffBracket/index.ts
```

### Step 2: Extract Utility Functions (20 min)

Create `features/playoffs/components/PlayoffBracket/utils.ts`:

```typescript
/**
 * Utility functions for Playoff Bracket component
 */

import type { BracketTeam, PlayoffMatchup } from '@/features/playoffs/types';

/**
 * Determine winner of a matchup
 */
export const getMatchupWinner = (
  team1Score?: number,
  team2Score?: number
): 'team1' | 'team2' | null => {
  if (team1Score === undefined || team2Score === undefined) return null;
  if (team1Score > team2Score) return 'team1';
  if (team2Score > team1Score) return 'team2';
  return null;
};

/**
 * Check if matchup is complete
 */
export const isMatchupComplete = (matchup: PlayoffMatchup): boolean => {
  return (
    matchup.team1Score !== undefined &&
    matchup.team2Score !== undefined &&
    matchup.team1Score > 0 &&
    matchup.team2Score > 0
  );
};

/**
 * Generate bracket layout for responsive display
 */
export const calculateBracketLayout = (
  roundCount: number
): {
  spacing: string;
  width: string;
} => {
  switch (roundCount) {
    case 3:
      return { spacing: 'gap-8', width: 'min-w-[900px]' };
    case 2:
      return { spacing: 'gap-6', width: 'min-w-[600px]' };
    default:
      return { spacing: 'gap-4', width: 'min-w-[400px]' };
  }
};
```

### Step 3: Create BracketTeam Component (15 min)

Extract team display logic into reusable component:

```typescript
'use client';

import React, { memo } from 'react';
import { Badge } from '@/components/ui/badge';
import type { BracketTeam, MatchupResult } from '@/features/playoffs/types';

interface BracketTeamProps {
  team: BracketTeam;
  score?: number;
  isWinner?: boolean;
  isEliminated?: boolean;
  isToiletBowl?: boolean;
}

export const BracketTeam = memo<BracketTeamProps>(
  ({ team, score, isWinner, isEliminated, isToiletBowl }) => {
    const bgClass = isWinner
      ? isToiletBowl
        ? 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800'
        : 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800'
      : isEliminated
        ? 'bg-muted/50 border-muted'
        : 'bg-background border-muted hover:border-muted-foreground/30';

    return (
      <div className={`flex items-center justify-between p-3 rounded-md border ${bgClass}`}>
        <div className="flex items-center space-x-2">
          <Badge variant="secondary" className="text-xs font-medium">
            #{team.seed}
          </Badge>
          <span className="font-medium text-sm">{team.name}</span>
          {isWinner && (
            <Badge
              variant={isToiletBowl ? 'destructive' : 'default'}
              className="text-xs"
            >
              {isToiletBowl ? 'ADVANCES' : 'W'}
            </Badge>
          )}
        </div>
        <div className="flex items-center space-x-2">
          {score !== undefined && (
            <span className="font-mono text-sm font-medium">{score.toFixed(1)}</span>
          )}
          <span className="text-xs text-muted-foreground font-mono">{team.record}</span>
        </div>
      </div>
    );
  }
);

BracketTeam.displayName = 'BracketTeam';
```

### Step 4: Create BracketMatchup Component (20 min)

```typescript
'use client';

import React, { memo } from 'react';
import { BracketTeam } from './BracketTeam';
import type { MatchupProps } from '@/features/playoffs/types';

export const BracketMatchup = memo<MatchupProps>(
  ({ team1, team2, matchupLabel, isBye = false, result, isToiletBowl = false }) => {
    if (isBye && team1) {
      return (
        <div className="flex flex-col items-center space-y-3 p-4 border-2 border-dashed rounded-lg min-w-[220px] bg-muted/20">
          <div className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
            {matchupLabel}
          </div>
          <BracketTeam team={team1} />
        </div>
      );
    }

    return (
      <div className="flex flex-col items-center space-y-3 p-4 border rounded-lg bg-card min-w-[220px] shadow-sm hover:shadow-md transition-shadow duration-200">
        <div className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
          {matchupLabel}
        </div>
        <div className="space-y-2 w-full">
          {team1 && (
            <BracketTeam
              team={team1}
              score={result?.team1Score}
              isWinner={result?.isComplete && result.winnerId === team1.id}
              isEliminated={result?.isComplete && result.winnerId !== team1.id}
              isToiletBowl={isToiletBowl}
            />
          )}
          {team2 && (
            <BracketTeam
              team={team2}
              score={result?.team2Score}
              isWinner={result?.isComplete && result.winnerId === team2.id}
              isEliminated={result?.isComplete && result.winnerId !== team2.id}
              isToiletBowl={isToiletBowl}
            />
          )}
        </div>
      </div>
    );
  }
);

BracketMatchup.displayName = 'BracketMatchup';
```

### Step 5: Create Main PlayoffBracket Component (25 min)

Create main component that orchestrates bracket display using sub-components.

### Step 6: Add Tests (25 min)

Test each component in isolation with mock bracket data.

### Step 7: Update Imports and Remove Old File (10 min)

---

## Acceptance Criteria

- [ ] Main component <150 lines
- [ ] 6+ sub-components created
- [ ] All components use `memo()`
- [ ] Bracket rendering logic extracted to utils
- [ ] Tests for bracket calculations
- [ ] Visual parity with original
- [ ] TypeScript compiles
- [ ] ESLint passes

---

## Verification Commands

```bash
pnpm test features/playoffs/components/PlayoffBracket
pnpm tsc --noEmit
pnpm lint
```

---

## Cursor Prompt

```
I'm working on WEB-COMP-003: Split PlayoffBracket Component.

Please:
1. Read apps/web/src/components/playoff-bracket.tsx (lines 1-120, 1225-1349)
2. Create features/playoffs/components/PlayoffBracket/ directory structure
3. Extract BracketTeam and BracketMatchup components
4. Create utility functions for bracket logic
5. Follow memo() and arrow function patterns
```

---

## Related Tasks

**Blocks**: None  
**Blocked By**: WEB-EXTRACT-005  
**Related**: WEB-COMP-001, WEB-COMP-002

---

**Estimated Total Time**: 2 hours
