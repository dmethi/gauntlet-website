# Next Priorities - Task Recommendations

**Date**: October 16, 2025  
**Current Progress**: 62/126 tasks (49.2%)  
**Web Progress**: 32/42 tasks (76.2%)

---

## ✅ Cleanup Complete

Archived completed task files to `tasks/archive/completed/`:
- WEB-COMP-001 through WEB-COMP-010 (10 component splits)
- WEB-HOOK-002, WEB-HOOK-003 (2 hook extractions)

**Total archived**: 12 task files

---

## 📊 Current State Analysis

### By Category (Remaining Work)

| Category | Complete | Remaining | % Done | Priority |
|----------|----------|-----------|--------|----------|
| **TEST** | 4/11 | 7 | 36% | 🔴 CRITICAL |
| **UTIL** | 4/16 | 12 | 25% | 🟡 HIGH |
| **HOOK** | 3/11 | 8 | 27% | 🟡 HIGH |
| **COMP** | 10/15 | 5 | 67% | 🟢 MEDIUM |
| **PAGE** | 0/3 | 3 | 0% | 🟢 MEDIUM |
| **CLEAN** | 5/9 | 4 | 56% | 🟡 MEDIUM |

### Large Components Still Remaining

From codebase analysis:

**In `app/stats/components/`:**
1. ✅ ~~TrendsView.tsx~~ (split, 3-line re-export)
2. ✅ ~~TeamView.tsx~~ (split, feature-based)
3. ✅ ~~ScheduleAnalysis.tsx~~ (split, 3-line re-export)
4. ✅ ~~LeagueView.tsx~~ (split, feature-based)
5. ⚠️ **ScatterAnalysis.tsx** (625 lines) - Original WEB-COMP-010
6. ⚠️ **ManagerDetailModal.tsx** (280 lines) - Not in original plan
7. ⚠️ **RidgePlot.tsx** (240 lines) - Not in original plan
8. ⚠️ **ManagerRankings.tsx** (159 lines) - Not in original plan

**In `components/`:**
1. ⚠️ **RecapReportView.tsx** (644 lines)
2. ⚠️ **league-wide-odds.tsx** (564 lines)
3. ⚠️ **matchup-charts.tsx** (466 lines)
4. ✅ ~~playoff-bracket.tsx~~ (split, 3-line re-export)
5. ✅ ~~start-sit-efficiency.tsx~~ (split, feature-based)

**Note**: We completed MatchupOddsPreview (141 lines) instead of ScatterAnalysis for WEB-COMP-010.

---

## 🎯 Recommended Priorities

### Option A: Testing-First Approach (RECOMMENDED) 🔴

**Rationale**: You've built a lot. Lock it down with tests before building more.

```
Week 1 (Critical):
  1. WEB-TEST-001: Component Tests (3 hours)
     - Test all migrated features: draft-analysis, stats, matchups, transactions
     - Achieve 80%+ coverage on existing components
  
  2. WEB-TEST-002: Hook Tests (2 hours)
     - Test all custom hooks in features/*/hooks/
     - Cover loading/error states
  
  3. WEB-TEST-003: Utility Tests (2 hours)
     - Ensure all utilities are covered
     - Test edge cases

Week 2 (Integration):
  4. WEB-PAGE-001: Migrate Draft Pages (1 hour)
  5. WEB-PAGE-002: Migrate Stats Pages (1 hour)
  6. WEB-PAGE-003: Migrate Matchup Pages (45 min)
  7. WEB-TEST-004: Integration Tests (2 hours)
```

**Impact**:
- ✅ Regression safety for all completed work
- ✅ Confidence to refactor remaining code
- ✅ Clear baseline before adding more features

---

### Option B: Finish Component Splitting (Build Momentum) 🟢

**Rationale**: Complete all component work, then test everything together.

```
Week 1 (Components):
  1. WEB-COMP-011: Split ScatterAnalysis (1.5 hours)
     - 625 lines → feature-based structure
     - 3+ scatter plot sub-components
  
  2. WEB-COMP-012: Split ManagerDetailModal (1 hour)
  3. WEB-COMP-013: Split RidgePlot (1 hour)
  4. WEB-COMP-014: Split LeagueWideOdds (1.5 hours)
  5. WEB-COMP-015: Split MatchupCharts (1.5 hours)

Week 2 (Integration):
  6. Page migrations (WEB-PAGE-001-003)
  7. Testing sweep (WEB-TEST-001-004)
```

**Impact**:
- ✅ All components follow feature architecture
- ⚠️ Risk: More code without safety net
- ⚠️ Harder to fix bugs found in testing

---

### Option C: Utilities + Hooks First (Foundation) 🟡

**Rationale**: Extract shared code before testing or more components.

```
Week 1 (Utilities):
  1. Extract stats utilities (4-5 tasks)
  2. Extract matchup utilities (2-3 tasks)
  3. Extract report utilities (2-3 tasks)

Week 2 (Hooks):
  4. Extract remaining hooks (5-6 tasks)
  5. Hook testing
```

**Impact**:
- ✅ Clean separation of concerns
- ⚠️ Delay validation and integration
- ⚠️ May discover needed refactors during testing

---

## 💡 My Strong Recommendation

### **Go with Option A: Testing-First** 🔴

**Why:**

1. **You've done massive refactoring** (10 components, 32 tasks total)
2. **No regression tests** to protect this work
3. **Testing will reveal issues** that are easier to fix now
4. **Page migrations need tests** to verify correctness
5. **Remaining components can wait** - they're smaller or less critical

**The Risk of Not Testing Now:**
- Build more features on untested foundation
- Find bugs late when context is lost
- Harder to isolate root causes
- More expensive to fix

**The Benefit of Testing Now:**
- Lock in current quality
- Find integration issues early
- Gain confidence for final push
- Clear "done" criteria per feature

---

## 📋 Immediate Next Steps (Today)

### If Testing-First (Recommended):

```bash
# Start with WEB-TEST-001
cd apps/web

# Pick one feature to test first (draft-analysis is fully migrated)
1. Create test for ManagerAnalysis component
2. Create tests for ManagerFiltering/ManagerSorting hooks
3. Verify coverage with: pnpm test:coverage
```

**Focus areas for WEB-TEST-001:**
- `features/draft-analysis/components/ManagerAnalysis/` (already has 8 utility tests)
- `features/stats/components/TeamView/` (already has 2 tests)
- `features/stats/components/TrendsView/` (has utility tests)
- `features/matchups/components/MatchupSimulation/` (has 68 utility tests)
- `features/matchups/components/MatchupOddsPreview/` (has 69 tests)

**Goal**: Add integration/component tests to achieve 80%+ coverage.

---

### If Component-First:

```bash
# Start with WEB-COMP-011: ScatterAnalysis
cd apps/web

# Examine the component
wc -l src/app/stats/components/ScatterAnalysis.tsx
# 625 lines

# Follow the pattern from WEB-COMP-007 to WEB-COMP-010
1. Create features/stats/components/ScatterAnalysis/
2. Extract utilities (prepareScatterData, calculateQuadrants, etc.)
3. Create sub-components (PointsVsWinsScatter, OffenseVsDefenseScatter, etc.)
4. Add tests
5. Update imports
```

---

## 📈 Enterprise Readiness Impact

**Current Score**: 4.5/10  
**After Testing Phase**: ~6.5-7.0/10 (+2 points)  
**After Full Component Split**: ~7.5-8.0/10  
**After Page Migration + Cleanup**: ~9.0/10 🎯

**Testing is the biggest gap** in enterprise readiness right now.

---

## 🎯 Decision Framework

**Choose Testing-First if:**
- ✅ You want safety and confidence
- ✅ You're risk-averse
- ✅ You want clear validation checkpoints
- ✅ You value stability over velocity

**Choose Component-First if:**
- ✅ You want architectural completeness
- ✅ You're comfortable with risk
- ✅ You want all refactoring done together
- ✅ You value velocity over interim validation

**Choose Utilities-First if:**
- ✅ You see lots of duplication
- ✅ Components need shared utilities
- ✅ You want the cleanest possible architecture

---

## 📝 My Vote

**Start with WEB-TEST-001** (Component Tests - Critical Paths)

Then decide: continue testing or switch to remaining components based on what you discover.

Testing will tell you if the architecture is solid or needs adjustments. Better to know now than after building 5 more components.

---

**Questions? Let me know which path you want to take and I'll create the detailed task breakdown!**

