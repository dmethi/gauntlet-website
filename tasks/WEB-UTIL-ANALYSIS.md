# WEB-UTIL Tasks: Comprehensive Analysis

**Date**: October 7, 2025  
**Status**: Analysis Complete - Recommendations Below

---

## Current Utility Files Inventory

### ✅ Already Well-Organized

#### `lib/stats/` (7 files - Should move to `shared/utils/stats/`)
- `compose.ts` - Data composition utilities
- `join.ts` - Data joining utilities  
- `medians.ts` - Statistical calculations (median, mean, stddev, percentile)
- `positional-advantages.ts` - Position advantage calculations
- `positions.ts` - Position-specific utilities
- `ranks.ts` - Ranking calculations
- `teams.ts` - Team data utilities

#### `app/stats/utils/` (8 files - Should move to `shared/utils/colors/` or stay in feature)
- `getDivergingBg.ts` - Diverging background colors
- `hexToRgb.ts` - Hex to RGB conversion
- `mixHex.ts` - Color mixing algorithm
- `getRankColor.ts` - Rank-based color assignment
- `getPerformanceColor.ts` - Performance-based colors
- `getTextColor.ts` - Text color for backgrounds
- `getTextColorForBg.ts` - Accessible text color calculation
- `computeTransactionGradesForStatsHub.ts` (407 lines - feature-specific, keep in stats)

#### `lib/chart-colors.ts` (323 lines - Should move to `shared/utils/colors/`)
- `useChartColors()` - Theme-aware chart color hook
- `staticChartColors` - Static chart color constants
- `getChartColor()` - Chart color getter
- `getPerformanceColor()` - Performance color calculation
- `getPositionColor()` - Position-specific colors
- `assignTeamColor()` - Team color assignment
- `getTeamColor()` - Team color retrieval
- `getTeamComparisonPalette()` - Team comparison colors
- `chartColorGuidelines` - Usage documentation

---

## 🔴 Critical: Files Needing Extraction

### 1. **Formatting Utilities** (SCATTERED - HIGH PRIORITY)

**Duplicated Inline Functions:**
- `formatOdds()` - in `matchup-odds-preview.tsx` (line 58) and `matchup-simulation.tsx` (line 186)
  ```typescript
  const formatOdds = (odds: number): string => {
    return odds > 0 ? `+${odds}` : `${odds}`;
  };
  ```

**Inline Number Formatting:**
- `.toFixed(1)` - used 50+ times across components for points
- `.toFixed(0)` - used 30+ times for percentages
- Percentage calculation: `(value * 100).toFixed(0)}%` - 20+ instances
- Delta formatting: `{value > 0 ? '+' : ''}{value.toFixed(1)}` - 15+ instances

**Inline Stat Formatting:**
- `formatStatKey()` in `stats/PlayerBreakdown.tsx` (line 48)
- Currency formatting: `$${value}` - 10+ instances
- Compact numbers: No current implementation (should add)

**Should Extract To:**
- `shared/utils/formatting/numbers.ts`
- `shared/utils/formatting/percentages.ts`  
- `shared/utils/formatting/odds.ts`
- `shared/utils/formatting/stats.ts`

---

### 2. **Mega-Files Needing Splitting**

#### `lib/manager-analytics.ts` (1,346 lines - CRITICAL)
**Contains:**
- Data fetching logic (React Query)
- 15+ calculation functions (pure)
- Type definitions (should be in types.ts)
- Analytics aggregation logic

**Should Split To:**
- `features/draft-analysis/utils/calculations.ts` - Pure calculation functions
- `features/draft-analysis/hooks/useDraftAnalytics.ts` - Data fetching
- `features/draft-analysis/types.ts` - Type definitions

#### `lib/client-calculations.ts` (Unknown size - needs review)
**Should Extract To:**
- `shared/utils/calculations/` or feature-specific utils

#### `lib/draft-analytics.ts` (Unknown size - needs review)  
**Should Extract To:**
- `features/draft-analysis/utils/analytics.ts`

#### `lib/narrative-generators.ts` (Unknown size - needs review)
**Should Extract To:**
- `features/reports/utils/narratives.ts` (feature-specific)

---

### 3. **Hall of Fame Utilities** (5 FILES - NEEDS CONSOLIDATION)

**Current Files in `lib/`:**
1. `hall-of-fame-calculations.ts`
2. `hall-of-fame-aggregations.ts`
3. `hall-of-fame-categories.ts`
4. `hall-of-fame-expanded-categories.ts`
5. `hall-of-fame-data-service.ts`

**Should Consolidate To:**
- `features/hall-of-fame/utils/calculations.ts`
- `features/hall-of-fame/utils/aggregations.ts`
- `features/hall-of-fame/utils/categories.ts`
- `features/hall-of-fame/hooks/useHallOfFameData.ts` (data service)

---

### 4. **Transaction Utilities**

#### `lib/transactions-facts.ts` (Unknown size)
**Should Move To:**
- `features/transactions/utils/facts.ts`

#### `lib/start-sit/analysis.ts` (Unknown size)
**Should Move To:**
- `features/start-sit/utils/analysis.ts`

---

### 5. **Stats Utilities** (RELOCATION NEEDED)

**Current:** `lib/stats/` (7 files)  
**Should Move To:** `shared/utils/stats/` (used across multiple features)

---

## 📊 Assessment: Are Current WEB-UTIL Tasks Comprehensive?

### ❌ **NO - Current tasks are insufficient**

### Current Tasks (4 tasks):
1. ✅ **WEB-UTIL-001**: Formatting Utilities (40 min) - **NEEDS DETAIL**
2. ⚠️ **WEB-UTIL-002**: Color Utilities (35 min) - **MOSTLY DONE, NEEDS RELOCATION**
3. ✅ **WEB-UTIL-003**: Manager Analytics Calculations (1 hour) - **GOOD SCOPE**
4. ✅ **WEB-UTIL-004**: Hall of Fame Utilities (45 min) - **GOOD SCOPE**

---

## 🎯 Recommended Task Structure (7 tasks)

### **Phase 3: Utility Extraction (REVISED)**

#### WEB-UTIL-001: Formatting Utilities (50 min) ⬆️ +10 min
**Extract scattered formatting functions:**
- Create `shared/utils/formatting/numbers.ts` (formatNumber, formatCompact, formatDelta)
- Create `shared/utils/formatting/percentages.ts` (formatPercentage, formatDecimal)
- Create `shared/utils/formatting/odds.ts` (formatOdds, formatMoneyline)
- Create `shared/utils/formatting/stats.ts` (formatStatKey, formatStatValue)
- Write tests for all utilities (100% coverage)
- Replace inline formatting in `matchup-odds-preview.tsx`, `matchup-simulation.tsx`
- **Files to modify**: 10-15 components with inline formatting

#### WEB-UTIL-002: Color Utilities Consolidation (40 min) ⬆️ +5 min
**Relocate and consolidate existing color utilities:**
- Move `lib/chart-colors.ts` → `shared/utils/colors/chart-colors.ts`
- Move `app/stats/utils/getDivergingBg.ts` → `shared/utils/colors/diverging.ts`
- Move `app/stats/utils/getRankColor.ts` → `shared/utils/colors/rank-colors.ts`
- Move `app/stats/utils/hexToRgb.ts`, `mixHex.ts` → `shared/utils/colors/helpers.ts`
- Keep `lib/colors.ts` as re-export for brand colors
- Update all imports (20+ files)
- Add tests

#### WEB-UTIL-003: Manager Analytics Calculations (1 hour) ✅ GOOD
**Split calculation logic from data fetching:**
- Create `features/draft-analysis/utils/calculations.ts`
- Extract 15+ pure functions from `lib/manager-analytics.ts`:
  - `calculateGiniSpend()`, `calculateTopNShares()`, `calculateConcentration()`, etc.
- Keep data fetching in hooks (move to WEB-HOOK-002)
- Write comprehensive tests (80%+ coverage)
- Reduce `manager-analytics.ts` by 200+ lines

#### WEB-UTIL-004: Hall of Fame Utilities (45 min) ✅ GOOD
**Consolidate 5 hall-of-fame files:**
- Move to `features/hall-of-fame/utils/`
- Consolidate:
  - `calculations.ts` (from hall-of-fame-calculations.ts)
  - `aggregations.ts` (from hall-of-fame-aggregations.ts)
  - `categories.ts` (from hall-of-fame-categories.ts + expanded)
- Remove duplicate logic
- Update imports (5-8 files)

#### ⭐ **WEB-UTIL-005: Stats Utilities Relocation** (30 min) 🆕
**Move shared stats utilities:**
- Move `lib/stats/*` → `shared/utils/stats/`
- Update imports in all consuming files (15+ files)
- Add barrel export `shared/utils/stats/index.ts`
- Verify no breaking changes

#### ⭐ **WEB-UTIL-006: Transaction & Start/Sit Utilities** (40 min) 🆕
**Feature-specific utility extraction:**
- Move `lib/transactions-facts.ts` → `features/transactions/utils/facts.ts`
- Move `lib/start-sit/analysis.ts` → `features/start-sit/utils/analysis.ts`
- Update imports
- Add tests for core functions

#### ⭐ **WEB-UTIL-007: Draft & Client Calculation Utilities** (35 min) 🆕
**Extract remaining calculation utilities:**
- Review `lib/draft-analytics.ts` - move to `features/draft-analysis/utils/analytics.ts`
- Review `lib/client-calculations.ts` - move to `shared/utils/calculations/` or feature
- Extract any remaining inline calculations from components
- Add tests

---

## 📋 Updated Task Summary

| Task         | Effort  | Type          | Priority    | Status      |
| ------------ | ------- | ------------- | ----------- | ----------- |
| WEB-UTIL-001 | 50 min  | Extract       | 🔴 CRITICAL | Updated     |
| WEB-UTIL-002 | 40 min  | Relocate      | 🟡 MEDIUM   | Updated     |
| WEB-UTIL-003 | 1 hour  | Split         | 🟡 MEDIUM   | Good        |
| WEB-UTIL-004 | 45 min  | Consolidate   | 🟡 MEDIUM   | Good        |
| WEB-UTIL-005 | 30 min  | Relocate      | 🟡 MEDIUM   | 🆕 New      |
| WEB-UTIL-006 | 40 min  | Extract       | 🟡 MEDIUM   | 🆕 New      |
| WEB-UTIL-007 | 35 min  | Extract       | 🟢 LOW      | 🆕 New      |
| **TOTAL**    | **4.5h**|               |             | 3 new tasks |

**Original Total**: 3 hours (4 tasks)  
**Revised Total**: 4.5 hours (7 tasks)  
**Increase**: +1.5 hours (+50%) for comprehensive coverage

---

## 🎯 Recommendation

### ✅ **APPROVE with expansions:**

1. **Update WEB-UTIL-001** with detailed formatting utilities list
2. **Update WEB-UTIL-002** to focus on relocation (not creation)
3. **Keep WEB-UTIL-003** as-is (good scope)
4. **Keep WEB-UTIL-004** as-is (good scope)
5. **ADD WEB-UTIL-005** for stats utilities relocation
6. **ADD WEB-UTIL-006** for transaction/start-sit utilities
7. **ADD WEB-UTIL-007** for draft/client calculations

### Priority Order:
1. **WEB-UTIL-001** (Critical - eliminates duplication)
2. **WEB-UTIL-003** (High - unblocks component splitting)
3. **WEB-UTIL-004** (High - consolidates 5 files)
4. **WEB-UTIL-002** (Medium - relocation)
5. **WEB-UTIL-005** (Medium - relocation)
6. **WEB-UTIL-006** (Medium - feature organization)
7. **WEB-UTIL-007** (Low - can be done later)

---

## 📝 Next Actions

1. ✅ Create detailed WEB-UTIL-001.md with specific formatting functions
2. ✅ Update WEB-UTIL-002.md to focus on relocation strategy
3. ✅ Keep WEB-UTIL-003.md and WEB-UTIL-004.md (add detail when ready)
4. ✅ Create WEB-UTIL-005.md for stats relocation
5. ✅ Create WEB-UTIL-006.md for transaction utilities
6. ✅ Create WEB-UTIL-007.md for draft calculations
7. ✅ Update WEB-TASKS-SUMMARY.md with new task count

---

**Analysis Complete** ✅  
**Comprehensive Coverage**: YES (with 3 additional tasks)  
**Ready for Execution**: After detailed task files created
