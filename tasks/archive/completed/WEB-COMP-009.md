# WEB-COMP-009: Split Matchup Simulation Component

**Category**: COMP (Component Splitting)  
**Priority**: 🟢 LOW  
**Estimated Time**: 1.5 hours  
**Dependencies**: WEB-EXTRACT-008

---

## Objective

Break down `matchup-simulation.tsx` (631 lines) into maintainable sub-components
for Monte Carlo simulation results and win probability analysis.

---

## Current State

**File**: `apps/web/src/components/matchup-simulation.tsx`  
**Lines**: 631 lines  
**Issues**:

- Single component displaying simulation results
- Win probability visualization inline
- Score distribution charts mixed with summary stats
- No memoization for expensive charts

---

## Target Structure

```
apps/web/src/features/matchups/components/
├── MatchupSimulation/
│   ├── MatchupSimulation.tsx           # Main container (~80 lines)
│   ├── MatchupSimulation.test.tsx
│   ├── SimulationSummary.tsx           # Win % and summary (~100 lines)
│   ├── SimulationSummary.test.tsx
│   ├── WinProbabilityChart.tsx         # Probability visualization (~120 lines)
│   ├── WinProbabilityChart.test.tsx
│   ├── ScoreDistributionChart.tsx      # Score histograms (~120 lines)
│   ├── ScoreDistributionChart.test.tsx
│   ├── LineupComparison.tsx            # Side-by-side lineups (~100 lines)
│   ├── LineupComparison.test.tsx
│   ├── utils.ts                         # Simulation utilities
│   ├── utils.test.ts
│   └── index.ts
```

---

## Steps

### Step 1: Extract Simulation Utilities (15 min)

Create `utils.ts` with:

- `formatWinProbability()` - Format percentages
- `calculateConfidenceInterval()` - 95% CI from distribution
- `formatScoreRange()` - Expected score ranges
- `getOutcomeColor()` - Color coding for probabilities

### Step 2: Create Visualization Components (45 min)

- **SimulationSummary**: Win %, key stats, simulation metadata
- **WinProbabilityChart**: Bar/gauge chart for win probability
- **ScoreDistributionChart**: Histogram of score distributions
- **LineupComparison**: Side-by-side lineup display with projections

### Step 3: Main Container (15 min)

Compose all visualization components.

### Step 4: Tests (20 min)

Test formatting and display logic.

### Step 5: Update Imports (5 min)

---

## Acceptance Criteria

- [ ] Main component <100 lines
- [ ] 4+ sub-components created
- [ ] Charts use `memo()` for performance
- [ ] All formatting in utils
- [ ] Utils tested
- [ ] TypeScript compiles
- [ ] Visual parity maintained

---

## Verification Commands

```bash
pnpm test features/matchups/components/MatchupSimulation
pnpm tsc --noEmit
pnpm lint
pnpm dev # Test simulation display
```

---

## Cursor Prompt

```
I'm working on WEB-COMP-009: Split MatchupSimulation Component.

Please:
1. Read apps/web/src/components/matchup-simulation.tsx
2. Create features/matchups/components/MatchupSimulation/ directory
3. Extract formatting utilities to utils.ts
4. Create SimulationSummary and WinProbabilityChart components
5. Follow arrow function and memo() patterns for chart performance
```

---

## Related Tasks

**Blocks**: None  
**Blocked By**: WEB-EXTRACT-008  
**Related**: WEB-COMP-002 (Chart component pattern)

---

**Estimated Total Time**: 1.5 hours
