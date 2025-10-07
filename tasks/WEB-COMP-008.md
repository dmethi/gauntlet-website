# WEB-COMP-008: Split LeagueView Component

**Category**: COMP (Component Splitting)  
**Priority**: 🟢 LOW  
**Estimated Time**: 1.5 hours  
**Dependencies**: WEB-EXTRACT-004

---

## Objective

Break down `LeagueView.tsx` (765 lines) into maintainable sub-components for league-wide standings, statistics, and rankings.

---

## Current State

**File**: `apps/web/src/app/stats/components/LeagueView.tsx`  
**Lines**: 765 lines  
**Issues**:
- League standings and multiple stat tables in one component
- Ranking calculations inline
- Repeated table patterns
- No memoization

---

## Target Structure

```
apps/web/src/features/stats/components/
├── LeagueView/
│   ├── LeagueView.tsx                  # Main container (~80 lines)
│   ├── LeagueView.test.tsx
│   ├── StandingsTable.tsx              # Current standings (~150 lines)
│   ├── StandingsTable.test.tsx
│   ├── LeagueLeadersTable.tsx          # Top performers (~120 lines)
│   ├── LeagueLeadersTable.test.tsx
│   ├── PointsScoredTable.tsx           # Points rankings (~120 lines)
│   ├── PointsScoredTable.test.tsx
│   ├── StrengthOfScheduleTable.tsx     # SOS rankings (~100 lines)
│   ├── StrengthOfScheduleTable.test.tsx
│   ├── utils.ts                         # League calculations
│   ├── utils.test.ts
│   └── index.ts
```

---

## Steps

### Step 1: Extract League Utilities (20 min)

Create `utils.ts` with:
- `calculateStandings()` - Win/loss records and rankings
- `calculateLeagueLeaders()` - Top performers by category
- `calculatePointsRankings()` - Points for/against
- `calculateStrengthOfSchedule()` - SOS for all teams
- `sortByRecord()` - Tiebreaker logic

### Step 2: Create Table Components (50 min)

- **StandingsTable**: Current standings with records
- **LeagueLeadersTable**: Top scorers, performers
- **PointsScoredTable**: Points rankings
- **StrengthOfScheduleTable**: SOS breakdown

### Step 3: Main Container and Tests (30 min)

### Step 4: Update Imports (5 min)

---

## Acceptance Criteria

- [ ] Main component <100 lines
- [ ] 4+ sub-components created
- [ ] All league calculations in utils
- [ ] Utils tested
- [ ] All components use `memo()`
- [ ] TypeScript compiles
- [ ] Visual parity maintained

---

## Verification Commands

```bash
pnpm test features/stats/components/LeagueView
pnpm tsc --noEmit
pnpm lint
```

---

## Cursor Prompt

```
I'm working on WEB-COMP-008: Split LeagueView Component.

Please:
1. Read apps/web/src/app/stats/components/LeagueView.tsx
2. Create features/stats/components/LeagueView/ directory
3. Extract league calculation utilities to utils.ts
4. Create StandingsTable and LeagueLeadersTable components
5. Follow arrow function and memo() patterns
```

---

## Related Tasks

**Blocks**: None  
**Blocked By**: WEB-EXTRACT-004  
**Related**: WEB-COMP-004 (Stats component pattern)

---

**Estimated Total Time**: 1.5 hours

