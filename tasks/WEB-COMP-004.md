# WEB-COMP-004: Split Schedule Analysis Component

**Category**: COMP (Component Splitting)  
**Priority**: 🟡 MEDIUM  
**Estimated Time**: 2 hours  
**Dependencies**: WEB-EXTRACT-004, WEB-HOOK-003

---

## Objective

Break down `ScheduleAnalysis.tsx` (1,221 lines) into maintainable sub-components
focusing on schedule strength, expected wins, and matchup difficulty analysis.

---

## Current State

**File**: `apps/web/src/app/stats/components/ScheduleAnalysis.tsx`  
**Lines**: 1,221 lines  
**Issues**:

- Single large component with multiple analysis sections
- Complex schedule calculations inline
- Repeated table/chart patterns
- No memoization
- Difficult to test schedule algorithms

---

## Target Structure

```
apps/web/src/features/stats/components/
├── ScheduleAnalysis/
│   ├── ScheduleAnalysis.tsx            # Main container (~100 lines)
│   ├── ScheduleAnalysis.test.tsx
│   ├── ScheduleStrengthTable.tsx       # SOS table (~150 lines)
│   ├── ScheduleStrengthTable.test.tsx
│   ├── ExpectedWinsTable.tsx           # Expected vs actual (~150 lines)
│   ├── ExpectedWinsTable.test.tsx
│   ├── WeeklyDifficultyChart.tsx       # Difficulty by week (~120 lines)
│   ├── WeeklyDifficultyChart.test.tsx
│   ├── MatchupHistoryTable.tsx         # Head-to-head (~150 lines)
│   ├── MatchupHistoryTable.test.tsx
│   ├── FutureSchedulePreview.tsx       # Remaining games (~120 lines)
│   ├── FutureSchedulePreview.test.tsx
│   ├── utils.ts                         # Schedule calculations
│   ├── utils.test.ts
│   └── index.ts
```

---

## Steps

### Step 1: Extract Schedule Calculation Utilities (30 min)

Create `utils.ts` with functions:

- `calculateStrengthOfSchedule()` - SOS based on opponent records
- `calculateExpectedWins()` - Win probability based on projections
- `calculateWeeklyDifficulty()` - Per-week opponent difficulty
- `groupMatchupsByWeek()` - Week-based grouping
- `calculateLuckIndex()` - Actual vs expected wins differential

### Step 2: Create ScheduleStrengthTable Component (25 min)

Display teams ranked by strength of schedule (SOS), showing:

- Opponent win percentage
- Average points faced
- Difficulty rating
- Rank compared to league

### Step 3: Create ExpectedWinsTable Component (25 min)

Compare expected wins (based on projections) vs actual record:

- Expected wins calculation
- Actual wins
- Luck index (difference)
- Win probability percentiles

### Step 4: Create Remaining Components (40 min)

- **WeeklyDifficultyChart**: Chart showing schedule difficulty progression
- **MatchupHistoryTable**: Head-to-head records and point differentials
- **FutureSchedulePreview**: Upcoming opponents and difficulty

### Step 5: Create Main Container (15 min)

Compose all sub-components with proper data flow.

### Step 6: Add Tests (20 min)

Test schedule calculation algorithms thoroughly.

### Step 7: Update Imports (5 min)

---

## Acceptance Criteria

- [ ] Main component <120 lines
- [ ] 5+ sub-components created
- [ ] All schedule calculations in utils
- [ ] Utils have 100% test coverage
- [ ] All components use `memo()`
- [ ] TypeScript compiles
- [ ] Visual parity maintained

---

## Verification Commands

```bash
pnpm test features/stats/components/ScheduleAnalysis
pnpm tsc --noEmit
pnpm lint
pnpm dev # Test schedule calculations manually
```

---

## Cursor Prompt

```
I'm working on WEB-COMP-004: Split ScheduleAnalysis Component.

Please:
1. Read apps/web/src/app/stats/components/ScheduleAnalysis.tsx (first 100 lines)
2. Create features/stats/components/ScheduleAnalysis/ directory
3. Extract schedule calculation utilities to utils.ts
4. Create ScheduleStrengthTable component
5. Follow arrow function and memo() patterns
6. Add comprehensive tests for schedule algorithms
```

---

## Related Tasks

**Blocks**: None  
**Blocked By**: WEB-EXTRACT-004, WEB-HOOK-003  
**Related**: WEB-COMP-002 (Stats component pattern)

---

**Estimated Total Time**: 2 hours
