# WEB-UTIL Tasks: Complete Updated List

**Date**: October 7, 2025  
**Status**: ✅ Comprehensive Coverage Achieved  
**Total Tasks**: 7 (4 original + 3 new)  
**Total Time**: 4.5 hours

---

## ✅ Task 1: WEB-UTIL-001 - Formatting Utilities

**Status**: ✅ UPDATED (Full detail added)  
**Priority**: 🔴 CRITICAL  
**Time**: 50 min (+10 min from original)

**What Changed:**
- Added specific formatting functions to create (numbers, percentages, odds, stats)
- Listed exact files with duplication (2 files with formatOdds)
- Provided complete implementation code
- Added comprehensive test examples
- Specified which components to update

**Deliverables:**
- `shared/utils/formatting/numbers.ts` - formatNumber, formatDelta, formatCompact
- `shared/utils/formatting/percentages.ts` - formatPercentage, formatDecimal
- `shared/utils/formatting/odds.ts` - formatOdds, formatMoneyline
- `shared/utils/formatting/stats.ts` - formatStatKey, formatStatValue
- Tests for all functions (100% coverage)
- Remove duplication from 2 matchup components

---

## ⚠️ Task 2: WEB-UTIL-002 - Color Utilities (NEEDS UPDATE)

**Status**: ⚠️ NEEDS DETAIL - Focus on Relocation  
**Priority**: 🟡 MEDIUM  
**Time**: 40 min (+5 min from original)

**Key Changes Needed:**
- **NOT creating new utilities** - most already exist!
- **Focus on relocation and consolidation**
- Move `lib/chart-colors.ts` (323 lines) → `shared/utils/colors/`
- Move `app/stats/utils/` color files → `shared/utils/colors/`
- Update 20+ import statements

**Files to Relocate:**

### From `lib/`:
- `chart-colors.ts` → `shared/utils/colors/chart-colors.ts` (323 lines)
- `colors.ts` → Keep as-is (re-exports brand colors)

### From `app/stats/utils/`:
- `getDivergingBg.ts` → `shared/utils/colors/diverging.ts`
- `getRankColor.ts` → `shared/utils/colors/rank-colors.ts`
- `getPerformanceColor.ts` → `shared/utils/colors/performance.ts`
- `getTextColor.ts` + `getTextColorForBg.ts` → `shared/utils/colors/text-colors.ts`
- `hexToRgb.ts` + `mixHex.ts` → `shared/utils/colors/helpers.ts`

**Steps:**
1. Create `shared/utils/colors/` directory
2. Move files with updated imports
3. Create barrel export `shared/utils/colors/index.ts`
4. Update all consuming files (grep for imports)
5. Remove old files
6. Verify no broken imports

**Acceptance Criteria:**
- [ ] All color utilities in `shared/utils/colors/`
- [ ] Barrel export created
- [ ] 20+ import statements updated
- [ ] Old files removed
- [ ] TypeScript compilation passes
- [ ] No broken imports

---

## ✅ Task 3: WEB-UTIL-003 - Manager Analytics Calculations

**Status**: ✅ GOOD SCOPE (needs detail when ready)  
**Priority**: 🟡 MEDIUM  
**Time**: 1 hour

**Objective:**
Split `lib/manager-analytics.ts` (1,346 lines) into:
- Pure calculation functions → `features/draft-analysis/utils/calculations.ts`
- Data fetching logic → Move to WEB-HOOK-002 (useDraftAnalytics hook)
- Type definitions → Already moved in WEB-EXTRACT-002

**Functions to Extract (15+):**
- `calculateGiniSpend()`
- `calculateTopNShares()`
- `calculateConcentration()`
- `calculatePositionalBalance()`
- `calculateDraftStrategy()`
- (10+ more calculation functions)

**Goal**: Reduce main file by 200+ lines, separate concerns

---

## ✅ Task 4: WEB-UTIL-004 - Hall of Fame Utilities

**Status**: ✅ GOOD SCOPE (needs detail when ready)  
**Priority**: 🟡 MEDIUM  
**Time**: 45 min

**Objective:**
Consolidate 5 separate hall-of-fame files in `lib/` into `features/hall-of-fame/utils/`

**Files to Consolidate:**
1. `hall-of-fame-calculations.ts` → `utils/calculations.ts`
2. `hall-of-fame-aggregations.ts` → `utils/aggregations.ts`
3. `hall-of-fame-categories.ts` + `hall-of-fame-expanded-categories.ts` → `utils/categories.ts`
4. `hall-of-fame-data-service.ts` → Move to `hooks/useHallOfFameData.ts` (data fetching)

**Result**: 5 files → 3 utility files + 1 hook

---

## 🆕 Task 5: WEB-UTIL-005 - Stats Utilities Relocation (NEW)

**Status**: 🆕 NEW TASK  
**Priority**: 🟡 MEDIUM  
**Time**: 30 min

**Objective:**
Move shared stats utilities from `lib/stats/` to `shared/utils/stats/` since they're used across multiple features.

**Files to Move (7 files):**
- `lib/stats/compose.ts` → `shared/utils/stats/compose.ts`
- `lib/stats/join.ts` → `shared/utils/stats/join.ts`
- `lib/stats/medians.ts` → `shared/utils/stats/medians.ts`
- `lib/stats/positional-advantages.ts` → `shared/utils/stats/positional-advantages.ts`
- `lib/stats/positions.ts` → `shared/utils/stats/positions.ts`
- `lib/stats/ranks.ts` → `shared/utils/stats/ranks.ts`
- `lib/stats/teams.ts` → `shared/utils/stats/teams.ts`

**Steps:**
1. Create `shared/utils/stats/` directory
2. Move all 7 files
3. Create barrel export `shared/utils/stats/index.ts`
4. Update imports in consuming files (15+ files)
5. Remove `lib/stats/` directory
6. Verify no broken imports

**Acceptance Criteria:**
- [ ] All stats utilities in `shared/utils/stats/`
- [ ] Barrel export created
- [ ] 15+ import statements updated
- [ ] Old directory removed
- [ ] TypeScript compilation passes

---

## 🆕 Task 6: WEB-UTIL-006 - Transaction & Start/Sit Utilities (NEW)

**Status**: 🆕 NEW TASK  
**Priority**: 🟡 MEDIUM  
**Time**: 40 min

**Objective:**
Extract feature-specific utilities from `lib/` to proper feature directories.

**Files to Move:**

### Transaction Utilities:
- `lib/transactions-facts.ts` → `features/transactions/utils/facts.ts`
- Exports: `Facts`, `playoffWeight()`, and related functions

### Start/Sit Utilities:
- `lib/start-sit/analysis.ts` → `features/start-sit/utils/analysis.ts`
- Contains start/sit decision analysis logic

**Steps:**
1. Create feature utility directories
2. Move files with updated imports
3. Update consuming files
4. Add tests for core functions
5. Remove old files

**Acceptance Criteria:**
- [ ] Transaction utilities in `features/transactions/utils/`
- [ ] Start/Sit utilities in `features/start-sit/utils/`
- [ ] All imports updated
- [ ] Old files removed
- [ ] Tests added for key functions

---

## 🆕 Task 7: WEB-UTIL-007 - Draft & Client Calculation Utilities (NEW)

**Status**: 🆕 NEW TASK  
**Priority**: 🟢 LOW (can be done later)  
**Time**: 35 min

**Objective:**
Extract remaining calculation utilities from `lib/` to appropriate locations.

**Files to Review and Move:**

### Draft Analytics:
- `lib/draft-analytics.ts` → `features/draft-analysis/utils/analytics.ts`
- Related to draft analysis features

### Client Calculations:
- `lib/client-calculations.ts` → Review if belongs in `shared/utils/calculations/` or feature-specific
- May contain cross-cutting calculation logic

### Narrative Generators:
- `lib/narrative-generators.ts` → `features/reports/utils/narratives.ts`
- Feature-specific narrative generation

**Steps:**
1. Read each file to understand dependencies
2. Determine if shared or feature-specific
3. Move to appropriate location
4. Update imports
5. Add tests for key functions

**Acceptance Criteria:**
- [ ] All draft analytics in proper feature directory
- [ ] Client calculations properly located
- [ ] Narrative generators in reports feature
- [ ] Imports updated
- [ ] Tests added

---

## 📊 Complete Task Summary

| Task         | Status      | Priority    | Time   | Type        | Blocks            |
| ------------ | ----------- | ----------- | ------ | ----------- | ----------------- |
| WEB-UTIL-001 | ✅ Detailed | 🔴 CRITICAL | 50 min | Extract     | WEB-COMP-001/002  |
| WEB-UTIL-002 | ⚠️ Update   | 🟡 MEDIUM   | 40 min | Relocate    | WEB-COMP-*        |
| WEB-UTIL-003 | ✅ Scoped   | 🟡 MEDIUM   | 1 hour | Split       | WEB-HOOK-002      |
| WEB-UTIL-004 | ✅ Scoped   | 🟡 MEDIUM   | 45 min | Consolidate | WEB-PAGE-*        |
| WEB-UTIL-005 | 🆕 New      | 🟡 MEDIUM   | 30 min | Relocate    | Various           |
| WEB-UTIL-006 | 🆕 New      | 🟡 MEDIUM   | 40 min | Extract     | WEB-COMP-*        |
| WEB-UTIL-007 | 🆕 New      | 🟢 LOW      | 35 min | Extract     | (Optional)        |
| **TOTAL**    |             |             | **4.5h** |             |                   |

---

## 🎯 Execution Priority Order

### Week 2 (Utility Extraction Phase):

**Day 1-2:**
1. ✅ **WEB-UTIL-001** (50 min) - Formatting utilities (CRITICAL - eliminates duplication)
2. ✅ **WEB-UTIL-005** (30 min) - Stats relocation (quick win, unblocks many files)

**Day 3-4:**
3. ✅ **WEB-UTIL-003** (1 hour) - Manager analytics split (unblocks component work)
4. ✅ **WEB-UTIL-004** (45 min) - Hall of Fame consolidation (reduces complexity)

**Day 5:**
5. ✅ **WEB-UTIL-002** (40 min) - Color utilities relocation
6. ✅ **WEB-UTIL-006** (40 min) - Transaction/Start-Sit extraction

**Optional (Week 3):**
7. ⭐ **WEB-UTIL-007** (35 min) - Draft/Client calculations (lower priority)

---

## 📝 Next Steps

### Immediate:
1. ✅ **WEB-UTIL-001** - Already fully detailed and ready to execute
2. ⚠️ **WEB-UTIL-002** - Needs update to focus on relocation (not creation)
3. 📄 **WEB-UTIL-005** - Create new detailed task file
4. 📄 **WEB-UTIL-006** - Create new detailed task file
5. 📄 **WEB-UTIL-007** - Create new detailed task file

### Before Starting Execution:
- Update `WEB-TASKS-SUMMARY.md` with 7 tasks instead of 4
- Update total time: 3 hours → 4.5 hours (+50%)
- Mark WEB-UTIL-001 as ready to execute

---

## ✅ Validation: Are Tasks Now Comprehensive?

**YES** - The expanded task list now covers:

✅ **Formatting utilities** - Eliminates all duplication  
✅ **Color utilities** - Relocates and consolidates  
✅ **Manager analytics** - Splits logic from data fetching  
✅ **Hall of Fame** - Consolidates 5 files  
✅ **Stats utilities** - Relocates shared code  
✅ **Transaction/Start-Sit** - Feature-specific extraction  
✅ **Draft/Client calcs** - Remaining utility cleanup  

**Coverage**: 100% of utility extraction work identified in codebase analysis.

---

**Document Status**: ✅ Complete  
**Ready for Execution**: WEB-UTIL-001 ready now, others need task file creation
