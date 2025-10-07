# WEB-COMP-006: Split Start/Sit Efficiency Component

**Category**: COMP (Component Splitting)  
**Priority**: 🟡 MEDIUM  
**Estimated Time**: 1.5 hours  
**Dependencies**: WEB-EXTRACT-006

---

## Objective

Break down `start-sit-efficiency.tsx` (1,093 lines) into maintainable sub-components for analyzing lineup decisions, bench opportunities, and manager efficiency.

---

## Current State

**File**: `apps/web/src/components/start-sit-efficiency.tsx`  
**Lines**: 1,093 lines  
**Issues**:
- Monolithic component with manager selection and multiple analysis tables
- Decision efficiency calculations inline
- Repeated table patterns for different metrics
- Complex sorting/filtering logic mixed with display
- No memoization

---

## Target Structure

```
apps/web/src/features/start-sit/components/
├── StartSitEfficiency/
│   ├── StartSitEfficiency.tsx          # Main container (~100 lines)
│   ├── StartSitEfficiency.test.tsx
│   ├── ManagerSelector.tsx             # Dropdown selector (~60 lines)
│   ├── ManagerSelector.test.tsx
│   ├── EfficiencySummaryCard.tsx       # Overall efficiency (~100 lines)
│   ├── EfficiencySummaryCard.test.tsx
│   ├── WeeklyDecisionsTable.tsx        # Week-by-week (~150 lines)
│   ├── WeeklyDecisionsTable.test.tsx
│   ├── PositionalEfficiencyTable.tsx   # By position (~140 lines)
│   ├── PositionalEfficiencyTable.test.tsx
│   ├── MissedOpportunitiesTable.tsx    # Benched players (~140 lines)
│   ├── MissedOpportunitiesTable.test.tsx
│   ├── OptimalLineupComparison.tsx     # Actual vs optimal (~120 lines)
│   ├── OptimalLineupComparison.test.tsx
│   ├── utils.ts                         # Efficiency calculations
│   ├── utils.test.ts
│   └── index.ts
```

---

## Steps

### Step 1: Extract Efficiency Calculation Utilities (25 min)

Create `utils.ts` with:
- `calculateEfficiencyScore()` - Overall decision quality
- `calculateMissedPoints()` - Points left on bench
- `calculateOptimalLineup()` - Best possible lineup
- `calculatePositionalEfficiency()` - Per-position decisions
- `calculateWeeklyEfficiency()` - Week-by-week analysis
- `calculateReplacementValue()` - Started vs next-best bench

Example:

```typescript
export const calculateEfficiencyScore = (
  startedPoints: number,
  benchPoints: number,
  optimalPoints: number
): number => {
  if (optimalPoints === 0) return 100;
  return (startedPoints / optimalPoints) * 100;
};

export const calculateMissedOpportunities = (
  lineup: Player[],
  bench: Player[]
): MissedOpportunity[] => {
  return bench
    .filter(b => lineup.some(l => b.position === l.position && b.points > l.points))
    .map(player => ({
      player,
      pointsLost: player.points - Math.max(...lineup.filter(l => l.position === player.position).map(l => l.points)),
    }))
    .sort((a, b) => b.pointsLost - a.pointsLost);
};
```

### Step 2: Create ManagerSelector Component (15 min)

Dropdown for selecting which manager to analyze:
- Manager list
- Current selection
- Stats preview on hover
- onChange callback

### Step 3: Create Summary Components (25 min)

- **EfficiencySummaryCard**: Overall metrics, score, rank
- **WeeklyDecisionsTable**: Week-by-week efficiency breakdown

### Step 4: Create Detail Components (35 min)

- **PositionalEfficiencyTable**: Efficiency by position (QB, RB, WR, TE, K)
- **MissedOpportunitiesTable**: Top benched players who outscored starters
- **OptimalLineupComparison**: Side-by-side actual vs optimal lineup

### Step 5: Main Container (10 min)

Compose all components with manager selection state management.

### Step 6: Tests (15 min)

Focus on testing efficiency calculation algorithms.

### Step 7: Update Imports (5 min)

---

## Acceptance Criteria

- [ ] Main component <120 lines
- [ ] 6+ sub-components created
- [ ] All efficiency calculations in utils
- [ ] Utils have 100% test coverage (critical for accuracy)
- [ ] All components use `memo()`
- [ ] Manager selector works smoothly
- [ ] TypeScript compiles
- [ ] Visual parity maintained

---

## Verification Commands

```bash
pnpm test features/start-sit/components
pnpm tsc --noEmit
pnpm lint
pnpm dev # Test start/sit analysis page
```

---

## Cursor Prompt

```
I'm working on WEB-COMP-006: Split StartSitEfficiency Component.

Please:
1. Read apps/web/src/components/start-sit-efficiency.tsx (lines 1-100, 966-1093)
2. Create features/start-sit/components/StartSitEfficiency/ directory
3. Extract efficiency calculation utilities to utils.ts
4. Create ManagerSelector and EfficiencySummaryCard components
5. Follow arrow function and memo() patterns
6. Add comprehensive tests for efficiency algorithms
```

---

## Related Tasks

**Blocks**: None  
**Blocked By**: WEB-EXTRACT-006  
**Related**: WEB-UTIL-002 (Start-sit utilities)

---

**Estimated Total Time**: 1.5 hours

