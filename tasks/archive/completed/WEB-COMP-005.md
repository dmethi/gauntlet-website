# WEB-COMP-005: Split TeamView Component

**Category**: COMP (Component Splitting)  
**Priority**: 🟡 MEDIUM  
**Estimated Time**: 2 hours  
**Dependencies**: WEB-EXTRACT-004, WEB-HOOK-003

---

## Objective

Break down `TeamView.tsx` (1,169 lines) into maintainable sub-components for
individual team analysis, including positional breakdowns, weekly performance,
and player contributions.

---

## Current State

**File**: `apps/web/src/app/stats/components/TeamView.tsx`  
**Lines**: 1,169 lines  
**Issues**:

- Single component handling all team detail views
- Position-specific analysis repeated
- Player contribution calculations inline
- Complex charting logic mixed with data prep
- No component-level memoization

---

## Target Structure

```
apps/web/src/features/stats/components/
├── TeamView/
│   ├── TeamView.tsx                    # Main container (~100 lines)
│   ├── TeamView.test.tsx
│   ├── TeamSummaryCard.tsx             # Overview card (~100 lines)
│   ├── TeamSummaryCard.test.tsx
│   ├── PositionalBreakdown.tsx         # Position stats (~150 lines)
│   ├── PositionalBreakdown.test.tsx
│   ├── WeeklyPerformanceChart.tsx      # Week-by-week (~120 lines)
│   ├── WeeklyPerformanceChart.test.tsx
│   ├── PlayerContributions.tsx         # Player breakdown (~150 lines)
│   ├── PlayerContributions.test.tsx
│   ├── PositionAdvantageChart.tsx      # Positional advantages (~120 lines)
│   ├── PositionAdvantageChart.test.tsx
│   ├── TeamComparisonTable.tsx         # vs league average (~100 lines)
│   ├── TeamComparisonTable.test.tsx
│   ├── utils.ts                         # Team analysis utilities
│   ├── utils.test.ts
│   └── index.ts
```

---

## Steps

### Step 1: Extract Team Analysis Utilities (25 min)

Create `utils.ts` with:

- `calculateTeamTotals()` - Aggregate team stats
- `calculatePositionalBreakdown()` - Per-position contributions
- `calculatePlayerContributions()` - Individual player impact
- `calculateTeamAdvantages()` - Position advantages vs league
- `groupByPosition()` - Position-based grouping
- `calculateConsistency()` - Week-to-week consistency score

### Step 2: Create TeamSummaryCard (20 min)

Overview card showing:

- Total points (season and average)
- Record and rank
- Consistency score
- Top performers
- Key stats summary

### Step 3: Create PositionalBreakdown Component (25 min)

Position-by-position analysis:

- Points by position
- Average per week
- Position rank in league
- Strength indicators

### Step 4: Create Player-Focused Components (40 min)

- **PlayerContributions**: Individual player stats and rankings
- **WeeklyPerformanceChart**: Line/bar chart of weekly scores
- **PositionAdvantageChart**: Visual comparison to league averages

### Step 5: Create Comparison Components (20 min)

- **TeamComparisonTable**: Team stats vs league average/median

### Step 6: Main Container and Tests (25 min)

Compose sub-components and add comprehensive tests.

### Step 7: Update Imports (5 min)

---

## Acceptance Criteria

- [ ] Main component <120 lines
- [ ] 6+ sub-components created
- [ ] All team calculations in utils
- [ ] Utils have 90%+ test coverage
- [ ] All components use `memo()`
- [ ] Charts render correctly
- [ ] TypeScript compiles
- [ ] Visual parity maintained

---

## Verification Commands

```bash
pnpm test features/stats/components/TeamView
pnpm tsc --noEmit
pnpm lint
pnpm dev # Navigate to team detail view
```

---

## Cursor Prompt

```
I'm working on WEB-COMP-005: Split TeamView Component.

Please:
1. Read apps/web/src/app/stats/components/TeamView.tsx (first 150 lines)
2. Create features/stats/components/TeamView/ directory
3. Extract team analysis utilities to utils.ts
4. Create TeamSummaryCard and PositionalBreakdown components
5. Follow arrow function and memo() patterns
6. Add tests for team calculation utilities
```

---

## Related Tasks

**Blocks**: None  
**Blocked By**: WEB-EXTRACT-004, WEB-HOOK-003  
**Related**: WEB-COMP-002, WEB-COMP-004

---

**Estimated Total Time**: 2 hours
