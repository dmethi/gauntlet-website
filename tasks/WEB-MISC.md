# WEB-MISC: Lower Priority Issues & Technical Debt

**Last Updated**: October 7, 2025  
**Category**: Miscellaneous cleanup and technical debt items  
**Priority**: 🟢 LOW (address after core refactoring complete)

---

## 📋 Overview

This file tracks lower-priority issues discovered during the enterprise readiness assessment that should be addressed eventually, but are not blocking the main refactoring effort.

---

## 🏗️ Classes That Need Refactoring to Arrow Functions

### CODING_CONVENTIONS.MD Violations

The following files use **CLASS-based patterns** instead of the mandated **arrow function factory pattern**:

#### 1. `lib/draft-generator.ts` - DraftGenerator Class

**Current (Class-based):**
```typescript
export class DraftGenerator {
  private generateDraftOrder(): number[] { ... }
  private initializeTeams(): TeamRoster[] { ... }
  private getNextBestPick(...): Player | null { ... }
  
  public generateMockDraft(...): MockDraft { ... }
}

// Usage:
const generator = new DraftGenerator();
const draft = generator.generateMockDraft(...);
```

**Should be (Factory pattern):**
```typescript
export const createDraftGenerator = () => {
  const generateDraftOrder = (): number[] => { ... };
  const initializeTeams = (): TeamRoster[] => { ... };
  const getNextBestPick = (...): Player | null => { ... };
  
  return {
    generateMockDraft: (...): MockDraft => { ... }
  };
};

// Usage:
const generator = createDraftGenerator();
const draft = generator.generateMockDraft(...);
```

**Estimated Effort**: 30 minutes  
**Priority**: 🟡 MEDIUM (affects 2 files: draft-generator.ts, draft-data-fetcher.ts)  
**Blocking**: None (isolated to draft generation logic)

---

#### 2. `lib/simulation-cache.ts` - SimulationCache Class

**Current (Class-based):**
```typescript
class SimulationCache {
  private cache: Map<string, CachedSimulation> = new Map();
  private hitCounts: { hits: number; misses: number } = { hits: 0, misses: 0 };
  
  private getCacheKey(...): string { ... }
  private getTTL(): number { ... }
  
  public set(...): void { ... }
  public get(...): CachedSimulation | null { ... }
  public clear(): void { ... }
  public getStats(): CacheStats { ... }
}

export const simulationCache = new SimulationCache();
```

**Should be (Factory pattern):**
```typescript
export const createSimulationCache = () => {
  const cache = new Map<string, CachedSimulation>();
  const hitCounts = { hits: 0, misses: 0 };
  
  const getCacheKey = (...): string => { ... };
  const getTTL = (): number => { ... };
  
  return {
    set: (...): void => { ... },
    get: (...): CachedSimulation | null => { ... },
    clear: (): void => { ... },
    getStats: (): CacheStats => { ... },
  };
};

export const simulationCache = createSimulationCache();
```

**Estimated Effort**: 25 minutes  
**Priority**: 🟡 MEDIUM (singleton pattern, affects multiple API routes)  
**Blocking**: None (internal caching logic)

---

## 🎨 Component-Specific Types (Inline)

### Low-Value Extractions

These types are **small, component-specific, and not reused**. Extracting them provides minimal benefit:

#### Chart Component Props

**Location**: `components/charts/`

1. **position-inflation-chart.tsx**:
   - `PositionInflationChartProps` (5 fields) - only used in this component

2. **positional-curves-chart.tsx**:
   - `PositionalCurvesChartProps` (4 fields) - only used in this component

3. **team-charts.tsx**:
   - `TeamChartsProps` (1 field: weeklyData)
   - `WeeklyData` (6 fields) - only used in this component

4. **team-distribution-chart.tsx**:
   - `TeamDistribution` (7 fields) - only used in this component

**Recommendation**: Leave inline. These are small, single-use types.

---

#### UI Component Props

**Location**: `components/ui/` and `components/`

1. **info-tooltip.tsx**:
   - `InfoTooltipProps` (4 fields) - small utility component

2. **Callout.tsx**:
   - `CalloutProps` (4 fields) - small utility component

3. **main-content.tsx**:
   - `MainContentProps` (2 fields) - layout-specific

4. **sidebar.tsx**:
   - `SidebarProps` (5 fields) - layout-specific

5. **gauntlet-logo.tsx**:
   - `GauntletLogoProps` (1 field) - logo component

**Recommendation**: Leave inline. These are component-specific props with no reuse.

---

#### Link Components

**Location**: `components/`

1. **matchup-link.tsx**:
   - `MatchupLinkProps` (2 fields)
   - `MatchupLinkInternalProps` (internal only)

2. **MatchupTags.tsx**:
   - `MatchupTagsProps` (inline, single use)

**Recommendation**: Leave inline unless building a link component library.

---

## 📦 Tightly Coupled Types (Keep Co-located)

### Mock Draft Data Types

**Location**: `lib/mock-draft-data.ts`

**Types**:
- `Player`
- `DraftPick`
- `TeamRoster`
- `MockDraft`

**Used by**:
- `lib/draft-generator.ts` (re-exports these types)
- `lib/draft-data-fetcher.ts`

**Recommendation**: Keep co-located with data. Only used in 2 files for mock draft generation. If usage expands beyond mock drafts, consider moving to `features/draft-analysis/types.ts`.

---

### Simulation Cache Types

**Location**: `lib/simulation-cache.ts`

**Types**:
- `CachedSimulation`
- `CacheStats`

**Usage**: Internal to caching system

**Recommendation**: Keep inline. These are implementation details of the caching system.

---

## 🔧 API Route Types

### Inline Response Types

**Location**: `app/api/` routes

**Current State**: Many API routes have inline type definitions for request/response shapes.

**Files**:
- `api/preview/[season]/[week]/route.ts` (8 types)
- `api/matchups/league-odds/[week]/route.ts` (3 types)
- `api/matchups/[leagueId]/[week]/route.ts` (3 types)
- `api/matchups/[leagueId]/[week]/[matchupId]/simulate/route.ts` (1 type)
- `api/matchups/[leagueId]/[week]/[matchupId]/route.ts` (2 types)

**Consideration**: Some of these overlap with:
- WEB-EXTRACT-008 (Matchup types)
- WEB-EXTRACT-010 (Report types)

**Recommendation**: 
- ✅ Major types extracted in WEB-EXTRACT-008 and WEB-EXTRACT-010
- 🟡 API-specific request/response wrappers can stay inline (they're transformations of domain types)
- 🟡 If API contract types become reused (e.g., TypeScript client), consider extracting to `shared/types/api-contracts.ts`

---

## 🎯 Future Consideration: Chart Types Library

If chart components grow or get reused across features, consider creating:

**Location**: `shared/components/charts/types.ts`

**Potential types to centralize**:
- Chart configuration interfaces
- Tooltip props
- Legend props
- Data point interfaces
- Color scheme types

**Trigger**: When 3+ chart components share similar type patterns

**Estimated Effort**: 1 hour  
**Priority**: 🟢 LOW

---

## 📝 Task Creation Checklist

When deciding to create a formal task for any of these items:

- [ ] Used in 3+ files (indicates shared concern)
- [ ] Types are duplicated (DRY violation)
- [ ] Part of a larger refactoring (e.g., CLASS → factory pattern)
- [ ] Blocks other work (creates coupling)
- [ ] Enables better testing

If **2+ checkboxes** are true → Create formal task  
If **<2 checkboxes** → Keep in WEB-MISC.md

---

## 🔄 Refactoring Strategy

### When to Address These Items

1. **After Phase 2** (Type Extraction) complete
2. **During Phase 5** (Component Splitting) - address class-based patterns
3. **During Phase 8** (Cleanup & Polish) - address small inline types if time permits

### Priority Order (if time allows)

1. 🟡 **MEDIUM**: Convert classes to factory pattern (draft-generator, simulation-cache)
2. 🟢 **LOW**: Extract chart types (only if reuse emerges)
3. 🟢 **LOW**: Component prop types (likely never - too small)

---

## 📊 Summary Statistics

| Category                  | Count | Total Effort | Priority |
| ------------------------- | ----- | ------------ | -------- |
| Classes to refactor       | 2     | 55 minutes   | 🟡 MEDIUM |
| Chart component props     | 4     | N/A          | 🟢 SKIP   |
| UI component props        | 5     | N/A          | 🟢 SKIP   |
| Tightly coupled types     | 2     | N/A          | 🟢 SKIP   |
| API route inline types    | 5     | ~1 hour      | 🟡 MAYBE  |
| **Total actionable items** | **2** | **~1 hour**  | **Post-Phase 8** |

---

## 🎓 Lessons Learned

### When NOT to Extract Types

1. **Single-use component props** - Inline is clearer
2. **Implementation details** - Cache internals don't need exposure
3. **Small utilities** - InfoTooltip props are 4 lines, extraction adds overhead
4. **Tight coupling by design** - Mock draft data belongs with mock draft logic

### When TO Extract Types (Already Covered in Tasks)

1. **Multi-file usage** - Stats types used in 3+ files ✅ (WEB-EXTRACT-004)
2. **Domain models** - Matchup types are domain concepts ✅ (WEB-EXTRACT-008)
3. **API contracts** - Transaction types shared by API and UI ✅ (WEB-EXTRACT-007)
4. **Duplicate definitions** - StartSitData defined 4 times ✅ (WEB-EXTRACT-006)

---

**Next Review**: After Phase 8 (Cleanup & Polish) completion  
**Owner**: AI Assistant  
**Status**: 📋 Documented, not blocking current work
