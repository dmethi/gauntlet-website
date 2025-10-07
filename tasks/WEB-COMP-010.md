# WEB-COMP-010: Split Scatter Analysis Component

**Category**: COMP (Component Splitting)  
**Priority**: 🟢 LOW  
**Estimated Time**: 1.5 hours  
**Dependencies**: WEB-EXTRACT-004

---

## Objective

Break down `ScatterAnalysis.tsx` (625 lines) into maintainable sub-components for scatter plot visualizations of team performance metrics.

---

## Current State

**File**: `apps/web/src/app/stats/components/ScatterAnalysis.tsx`  
**Lines**: 625 lines  
**Issues**:
- Single component with multiple scatter plot variations
- Chart configuration repeated
- Axis/tooltip logic inline
- No memoization for Recharts

---

## Target Structure

```
apps/web/src/features/stats/components/
├── ScatterAnalysis/
│   ├── ScatterAnalysis.tsx             # Main container (~80 lines)
│   ├── ScatterAnalysis.test.tsx
│   ├── PointsVsWinsScatter.tsx         # Points vs record (~120 lines)
│   ├── PointsVsWinsScatter.test.tsx
│   ├── OffenseVsDefenseScatter.tsx     # Offense vs defense (~120 lines)
│   ├── OffenseVsDefenseScatter.test.tsx
│   ├── ConsistencyVsAverageScatter.tsx # Consistency analysis (~120 lines)
│   ├── ConsistencyVsAverageScatter.test.tsx
│   ├── ScatterPlotBase.tsx             # Reusable scatter plot (~100 lines)
│   ├── ScatterPlotBase.test.tsx
│   ├── utils.ts                         # Chart utilities
│   ├── utils.test.ts
│   └── index.ts
```

---

## Steps

### Step 1: Extract Chart Utilities (15 min)

Create `utils.ts` with:
- `prepareScatterData()` - Format data for Recharts
- `calculateQuadrants()` - Divide plot into quadrants
- `formatAxisLabel()` - Axis formatting
- `calculateTrendLine()` - Linear regression for trend
- `getQuadrantColor()` - Color coding by quadrant

### Step 2: Create ScatterPlotBase Component (25 min)

Reusable scatter plot component with:
- Configurable axes
- Quadrant lines
- Trend line option
- Hover tooltips
- Team labels

### Step 3: Create Specific Scatter Plots (40 min)

- **PointsVsWinsScatter**: Points scored vs wins
- **OffenseVsDefenseScatter**: Points for vs points against
- **ConsistencyVsAverageScatter**: Consistency score vs average

### Step 4: Main Container (10 min)

Compose all scatter plots with toggle/tabs.

### Step 5: Tests (15 min)

Test data preparation and chart rendering.

### Step 6: Update Imports (5 min)

---

## Acceptance Criteria

- [ ] Main component <100 lines
- [ ] ScatterPlotBase reusable component created
- [ ] 3+ specific scatter plots use base
- [ ] All charts use `memo()` for Recharts performance
- [ ] All data prep in utils
- [ ] TypeScript compiles
- [ ] Visual parity maintained

---

## Verification Commands

```bash
pnpm test features/stats/components/ScatterAnalysis
pnpm tsc --noEmit
pnpm lint
pnpm dev # Test scatter plots
```

---

## Cursor Prompt

```
I'm working on WEB-COMP-010: Split ScatterAnalysis Component.

Please:
1. Read apps/web/src/app/stats/components/ScatterAnalysis.tsx
2. Create features/stats/components/ScatterAnalysis/ directory
3. Extract chart utilities to utils.ts
4. Create reusable ScatterPlotBase component
5. Create PointsVsWinsScatter using base component
6. Follow arrow function and memo() patterns for chart performance
```

---

## Related Tasks

**Blocks**: None  
**Blocked By**: WEB-EXTRACT-004  
**Related**: WEB-COMP-002 (Chart component pattern)

---

**Estimated Total Time**: 1.5 hours

