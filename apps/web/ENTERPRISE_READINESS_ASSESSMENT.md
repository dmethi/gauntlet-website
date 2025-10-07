# Apps/Web: Enterprise Readiness Assessment

**Date**: October 7, 2025  
**Assessed By**: AI Analysis  
**Current Enterprise Score**: **3.5/10** 🔴 CRITICAL GAPS

---

## Executive Summary

The `apps/web` Next.js application has **strong domain functionality** but exhibits **severe architectural and quality issues** that prevent enterprise deployment. The codebase operates as a monolithic flat structure with mega-files, zero tests, no linting automation, and widespread technical debt.

### Critical Blockers (Must Fix Before Production)

1. 🔴 **Zero test coverage** (0% - no test infrastructure)
2. 🔴 **Mega-files** (2,805 lines max, 10+ files >1,000 lines)
3. 🔴 **No linting/formatting** (no ESLint, no Prettier)
4. 🔴 **Flat file organization** (no feature-based architecture)
5. 🔴 **Massive eslint-disable abuse** (widespread suppressions)
6. 🔴 **No component patterns** (no memo, no separation of concerns)

---

## 📊 Current State Analysis

### File Structure Assessment

**Total TypeScript Files**: 58,542 lines across ~150 files

#### Top 15 Problem Files (Lines of Code)

| Rank | File                                           | Lines | Category  | Priority    |
| ---- | ---------------------------------------------- | ----- | --------- | ----------- |
| 1    | `data/report-week2.ts`                         | 2,805 | Data      | 🔴 Critical |
| 2    | `components/manager-analysis.tsx`              | 1,624 | Component | 🔴 Critical |
| 3    | `app/stats/components/TrendsView.tsx`          | 1,606 | Component | 🔴 Critical |
| 4    | `app/league/draft/page.tsx`                    | 1,488 | Page      | 🔴 Critical |
| 5    | `components/playoff-bracket.tsx`               | 1,400 | Component | 🔴 Critical |
| 6    | `lib/manager-analytics.ts`                     | 1,346 | Logic     | 🔴 Critical |
| 7    | `app/hall-of-fame-enhanced/page.tsx`           | 1,251 | Page      | 🔴 Critical |
| 8    | `app/stats/components/ScheduleAnalysis.tsx`    | 1,243 | Component | 🔴 Critical |
| 9    | `app/draft/analysis/page.tsx`                  | 1,228 | Page      | 🔴 Critical |
| 10   | `app/stats/components/TeamView.tsx`            | 1,198 | Component | 🔴 Critical |
| 11   | `app/competition/reports/2025/week-4/page.tsx` | 1,177 | Page      | 🟡 High     |
| 12   | `app/league/transactions/page.tsx`             | 1,169 | Page      | 🟡 High     |
| 13   | `components/start-sit-efficiency.tsx`          | 1,162 | Component | 🟡 High     |
| 14   | `app/api/reports/[season]/[week]/route.ts`     | 1,035 | API       | 🟡 High     |
| 15   | `app/matchup/[matchupId]/page.tsx`             | 957   | Page      | 🟡 High     |

**Total Lines in Top 15**: 19,079 lines (32.6% of entire codebase!)

### Code Quality Issues

#### 1. Testing Infrastructure: ❌ **0/10** (CRITICAL)

- ✅ Zero test files found in entire codebase
- ❌ No Vitest configuration
- ❌ No React Testing Library
- ❌ No test utilities or factories
- ❌ No integration tests
- ❌ No component tests
- ❌ Zero coverage tracking

**Impact**: Cannot safely refactor, no regression detection, unpredictable behavior in production.

#### 2. Code Quality Automation: ❌ **0/10** (CRITICAL)

- ❌ No ESLint configuration file
- ❌ No Prettier configuration
- ❌ Only `next lint` script (minimal Next.js defaults)
- ❌ No format scripts
- ❌ No pre-commit hooks
- ❌ No CI/CD quality gates

**Evidence**:

```typescript
// manager-analysis.tsx line 3
/* eslint-disable @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any, sort-imports, prefer-const */

// hooks.ts line 1
/* eslint-disable @typescript-eslint/no-explicit-any */
```

**Impact**: No automated style enforcement, inconsistent code patterns, technical debt accumulation.

#### 3. Component Patterns: ❌ **1/10** (CRITICAL)

- ❌ No memoization (no `memo()` usage found)
- ❌ No `forwardRef` pattern
- ❌ Props destructured in signatures (violates conventions)
- ✅ Arrow functions used (good!)
- ❌ Inline JSX in mega-components (1,624 lines!)
- ❌ No sub-component extraction

**Evidence**:

```typescript
// manager-analysis.tsx (1,624 lines)
export const ManagerAnalysis: React.FC<ManagerAnalysisProps> = ({ analytics }) => {
  // 50+ lines of useState declarations
  const [selectedCluster, setSelectedCluster] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('concentration');
  // ... 40+ more state variables

  // 200 lines of useMemo calculations
  const filteredProfiles = useMemo(() => { /* ... */ }, []);
  // ... 15+ more useMemo hooks

  // 1000+ lines of inline JSX
  return <div>{/* Massive nested JSX */}</div>;
};
```

**Impact**: Performance issues, hard to maintain, impossible to test in isolation, poor developer experience.

#### 4. File Organization: ❌ **2/10** (CRITICAL)

**Current Structure** (flat, unorganized):

```
apps/web/src/
├── components/          # Flat, mixed concerns (48 files)
│   ├── manager-analysis.tsx (1,624 lines!)
│   ├── playoff-bracket.tsx (1,400 lines!)
│   ├── stats/           # Some organization
│   ├── charts/          # Some organization
│   └── ui/              # shadcn components
├── lib/                 # Flat utilities (35 files, 243 exports!)
│   ├── manager-analytics.ts (1,346 lines!)
│   ├── hall-of-fame-*.ts (5 separate files)
│   ├── stats/           # Minimal sub-organization
│   └── sleeper/         # API client
├── hooks/               # Only 6 files (good!)
├── app/                 # Next.js pages (mixed organization)
│   ├── stats/           # Feature-like structure
│   └── api/             # API routes
└── data/                # Static/precomputed data
```

**Issues**:

- No feature-based organization (everything flat)
- No co-location (components, hooks, utils, types scattered)
- Inconsistent sub-folders (some exist, most don't)
- No barrel exports (`index.ts` missing everywhere)
- Relative path imports to `brand/` directory (e.g., `'../../../../brand/colors'`)

**Impact**: Cannot find code, difficult navigation, circular dependencies, no clear boundaries.

#### 5. Type System: ⚠️ **4/10** (IMPORTANT)

- ✅ Uses `@gauntlet/types` central package (good!)
- ⚠️ Types mixed with implementation (no separate `types.ts` files)
- ⚠️ No API type organization (no `schemas.ts`, `endpoints.ts`)
- ❌ Local type duplication in multiple files
- ❌ Heavy use of `any` type (see eslint-disable comments)

**Evidence**:

```typescript
// hooks.ts - types inline with logic
interface Matchup {
  /* ... */
}
interface WeeklyMetric {
  /* ... */
}
interface Roster extends FantasyTeam {
  /* ... */
}
export interface TeamStats {
  /* ... */
}
// ... 40+ more interfaces in same file!
```

**Impact**: Type pollution, hard to share types, inconsistent contracts.

#### 6. State Management: ⚠️ **5/10** (IMPORTANT)

- ✅ Using React Query (good!)
- ✅ React Query DevTools installed
- ⚠️ No global state library (Jotai/Zustand)
- ⚠️ Local state scattered (useState everywhere)
- ❌ No atom organization
- ❌ Hooks not co-located (centralized in `lib/hooks.ts`)

**Impact**: State scattered, hard to debug, no centralized state management.

#### 7. Import/Export Conventions: ❌ **2/10** (CRITICAL)

- ✅ Path alias `@/*` configured (good!)
- ❌ Relative path imports to monorepo packages (`../../../../brand/colors`)
- ❌ No import ordering enforcement
- ❌ No type-only imports (`import type { }`)
- ❌ No barrel exports (`index.ts` files missing)
- ❌ 243 exports in flat `lib/` directory (unorganized)

**Evidence**:

```typescript
// manager-analysis.tsx line 29
import { colors, dataVizColors } from '../../../../brand/colors';
// Should be: import { colors, dataVizColors } from '@gauntlet/tokens';
```

**Impact**: Fragile imports, refactoring nightmares, poor IDE support.

#### 8. Separation of Concerns: ❌ **1/10** (CRITICAL)

**Example: `manager-analysis.tsx` (1,624 lines)**

- 🔴 Component logic (50+ state variables)
- 🔴 Sorting logic (200+ lines of useMemo)
- 🔴 Filtering logic (150+ lines)
- 🔴 Helper functions (100+ lines inline)
- 🔴 Formatting utilities (50+ lines inline)
- 🔴 Color calculations (80+ lines inline)
- 🔴 1,000+ lines of JSX
- 🔴 All in ONE file!

**Impact**: Impossible to test, hard to maintain, poor performance, violates SOLID principles.

---

## 🎯 Proposed Directory Structure

### Target Architecture (Feature-Based)

```
apps/web/src/
├── features/                          # Feature-based organization
│   ├── draft-analysis/                # Draft analytics feature
│   │   ├── components/
│   │   │   ├── ManagerAnalysis/
│   │   │   │   ├── ManagerAnalysis.tsx          # Main (100 lines)
│   │   │   │   ├── ManagerAnalysis.test.tsx     # Tests
│   │   │   │   ├── ManagerTable.tsx             # Sub-component
│   │   │   │   ├── ManagerTable.test.tsx
│   │   │   │   ├── ManagerFilters.tsx           # Sub-component
│   │   │   │   ├── ClusterBadge.tsx             # Sub-component
│   │   │   │   ├── types.ts                     # Component types
│   │   │   │   ├── utils.ts                     # Formatting helpers
│   │   │   │   └── index.ts                     # Barrel export
│   │   │   ├── PositionInflationChart/
│   │   │   │   ├── PositionInflationChart.tsx
│   │   │   │   ├── types.ts
│   │   │   │   └── index.ts
│   │   │   └── index.ts                         # Barrel export
│   │   ├── hooks/
│   │   │   ├── useManagerSorting.ts
│   │   │   ├── useManagerSorting.test.ts
│   │   │   ├── useManagerFiltering.ts
│   │   │   ├── useDraftAnalytics.ts
│   │   │   └── index.ts
│   │   ├── utils/
│   │   │   ├── calculations.ts
│   │   │   ├── calculations.test.ts
│   │   │   ├── formatters.ts
│   │   │   ├── formatters.test.ts
│   │   │   └── index.ts
│   │   ├── types.ts                             # Feature-level types
│   │   ├── atoms.ts                             # Jotai atoms (if needed)
│   │   └── index.ts                             # Exports ONLY screens
│   │
│   ├── matchups/                      # Matchup feature
│   │   ├── components/
│   │   │   ├── MatchupOddsPreview/
│   │   │   ├── MatchupSimulation/
│   │   │   └── index.ts
│   │   ├── hooks/
│   │   │   ├── useMatchupOdds.ts
│   │   │   └── index.ts
│   │   ├── utils/
│   │   │   ├── odds-calculations.ts
│   │   │   └── index.ts
│   │   ├── types.ts
│   │   └── index.ts
│   │
│   ├── stats/                         # Stats hub feature
│   │   ├── components/
│   │   │   ├── LeagueView/
│   │   │   ├── TeamView/
│   │   │   ├── TrendsView/
│   │   │   ├── ScheduleAnalysis/
│   │   │   └── index.ts
│   │   ├── hooks/
│   │   ├── utils/
│   │   │   ├── getDivergingBg.ts
│   │   │   ├── getRankColor.ts
│   │   │   └── index.ts
│   │   ├── types.ts
│   │   └── index.ts
│   │
│   ├── hall-of-fame/                  # Hall of Fame feature
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── utils/
│   │   │   ├── calculations.ts
│   │   │   ├── aggregations.ts
│   │   │   ├── categories.ts
│   │   │   └── index.ts
│   │   ├── types.ts
│   │   └── index.ts
│   │
│   ├── transactions/                  # Transaction analysis
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── utils/
│   │   ├── types.ts
│   │   └── index.ts
│   │
│   └── start-sit/                     # Start/Sit efficiency
│       ├── components/
│       ├── hooks/
│       ├── utils/
│       ├── types.ts
│       └── index.ts
│
├── shared/                            # Cross-feature shared code
│   ├── components/
│   │   ├── layouts/
│   │   │   ├── ClientLayout/
│   │   │   ├── Sidebar/
│   │   │   ├── MainContent/
│   │   │   └── index.ts
│   │   ├── charts/
│   │   │   ├── LeagueChart/
│   │   │   ├── PlayerBoxPlot/
│   │   │   └── index.ts
│   │   ├── primitives/
│   │   │   ├── Callout/
│   │   │   ├── InfoTooltip/
│   │   │   └── index.ts
│   │   └── index.ts
│   ├── hooks/
│   │   ├── useSleeper.ts
│   │   ├── useSleeper.test.ts
│   │   ├── useClientCalculations.ts
│   │   └── index.ts
│   ├── utils/
│   │   ├── formatting/
│   │   │   ├── currency.ts
│   │   │   ├── percentage.ts
│   │   │   └── index.ts
│   │   ├── colors/
│   │   │   ├── chart-colors.ts
│   │   │   ├── team-colors.ts
│   │   │   └── index.ts
│   │   ├── calculations/
│   │   │   └── index.ts
│   │   └── index.ts
│   ├── types/
│   │   ├── api.ts
│   │   ├── ui.ts
│   │   └── index.ts
│   └── atoms/                         # Global Jotai atoms
│       ├── league.ts
│       ├── filters.ts
│       └── index.ts
│
├── data/                              # Static/precomputed data
│   ├── precomputed/
│   │   └── ...
│   ├── players-loader.ts
│   └── index.ts
│
├── app/                               # Next.js routes (MINIMAL LOGIC)
│   ├── api/                           # API routes
│   │   ├── matchups/
│   │   │   └── [leagueId]/[week]/[matchupId]/route.ts
│   │   └── ...
│   ├── draft/
│   │   └── analysis/page.tsx          # Uses features/draft-analysis
│   ├── matchups/
│   │   └── [leagueId]/[week]/page.tsx # Uses features/matchups
│   ├── stats/
│   │   └── page.tsx                   # Uses features/stats
│   ├── layout.tsx
│   ├── page.tsx
│   └── globals.css
│
└── components/                        # DEPRECATED - remove after migration
    └── ui/                            # shadcn components (keep here)
        ├── button.tsx
        ├── card.tsx
        └── ...
```

### Migration Strategy

**Phase 1**: Infrastructure (Week 1)

- Add testing infrastructure
- Add ESLint/Prettier configuration
- Create folder structure

**Phase 2**: Extract Shared Code (Week 2)

- Move `components/ui/` to `shared/components/primitives/`
- Extract shared hooks to `shared/hooks/`
- Extract shared utils to `shared/utils/`

**Phase 3**: Feature Migration (Week 3-6)

- Migrate one feature at a time (draft-analysis → matchups → stats → hall-of-fame)
- For each feature:
  1. Extract types
  2. Extract utils
  3. Extract hooks
  4. Split components
  5. Add tests

**Phase 4**: Cleanup (Week 7-8)

- Remove deprecated files
- Add comprehensive tests
- Documentation pass

---

## 📋 High-Level Task Breakdown

### Phase 1: Foundation & Infrastructure (Week 1) 🔴 CRITICAL

#### WEB-SETUP-001: Testing Infrastructure Setup

**Effort**: 1 hour  
**Priority**: 🔴 CRITICAL

**Objective**: Set up Vitest and React Testing Library for apps/web

**Deliverables**:

- Install Vitest, @vitest/ui, @vitest/coverage-v8
- Install @testing-library/react, @testing-library/jest-dom
- Create `vitest.config.ts` with Next.js support
- Add test scripts to `package.json`
- Configure 80% coverage thresholds
- Create sample test to verify setup

**Acceptance Criteria**:

- [ ] `pnpm test` runs successfully
- [ ] `pnpm test:coverage` generates report
- [ ] Sample test passes
- [ ] Coverage thresholds configured

---

#### WEB-SETUP-002: Code Quality Automation

**Effort**: 45 minutes  
**Priority**: 🔴 CRITICAL

**Objective**: Add ESLint and Prettier configuration matching CODING_CONVENTIONS.MD

**Deliverables**:

- Install ESLint with TypeScript support
- Install Prettier with ESLint integration
- Create `eslint.config.mjs` (flat config)
- Create `.prettierrc` and `.prettierignore`
- Add lint/format scripts
- Configure rules:
  - Arrow functions enforcement
  - Explicit return types
  - Import ordering
  - No-any rule

**Acceptance Criteria**:

- [ ] `pnpm lint` runs successfully
- [ ] `pnpm format` works
- [ ] Rules match CODING_CONVENTIONS.MD
- [ ] Pre-commit hooks configured (optional)

---

#### WEB-SETUP-003: Test Utilities and Factories

**Effort**: 1 hour  
**Priority**: 🔴 CRITICAL

**Objective**: Create test utilities and data factories

**Deliverables**:

- Create `src/shared/test/` directory
- Create `factories/` with data factories:
  - `teamFactory.ts`
  - `matchupFactory.ts`
  - `managerFactory.ts`
  - `analyticsFactory.ts`
- Create `utils/` with test helpers:
  - `renderWithProviders.tsx` (React Query + Theme wrappers)
  - `mockApiClient.ts`
- Export from `index.ts`

**Acceptance Criteria**:

- [ ] Factories generate valid test data
- [ ] `renderWithProviders` works with React Query
- [ ] Example test uses factories
- [ ] All utilities exported

---

#### WEB-SETUP-004: Create Feature Folder Structure

**Effort**: 30 minutes  
**Priority**: 🟡 HIGH

**Objective**: Create empty feature folders matching proposed structure

**Deliverables**:

- Create `src/features/` directory
- Create subdirectories:
  - `draft-analysis/`, `matchups/`, `stats/`, `hall-of-fame/`, `transactions/`, `start-sit/`
- For each feature, create:
  - `components/`, `hooks/`, `utils/`, `types.ts`, `index.ts`
- Create `src/shared/` directory
- Create subdirectories:
  - `components/`, `hooks/`, `utils/`, `types/`, `atoms/`

**Acceptance Criteria**:

- [ ] All folders created
- [ ] Empty `index.ts` files in place
- [ ] TypeScript compilation still works
- [ ] No breaking changes

---

### Phase 2: Type Extraction (Week 1-2) ⚠️ HIGH PRIORITY

#### WEB-EXTRACT-001: Manager Analysis Types

**Effort**: 20 minutes  
**Priority**: ⚠️ HIGH (Quick Win)

**Objective**: Extract types from `manager-analysis.tsx` to separate file

**Deliverables**:

- Create `features/draft-analysis/types.ts`
- Move all interfaces from `components/manager-analysis.tsx`
- Update imports
- Export types from barrel file

**Acceptance Criteria**:

- [ ] All types extracted
- [ ] Component imports from `types.ts`
- [ ] TypeScript compilation passes
- [ ] No runtime changes

---

#### WEB-EXTRACT-002: Manager Analytics Logic Types

**Effort**: 25 minutes  
**Priority**: ⚠️ HIGH

**Objective**: Extract types from `lib/manager-analytics.ts` (1,346 lines)

**Deliverables**:

- Create `features/draft-analysis/types.ts` (merge with EXTRACT-001)
- Move 18+ interfaces from `manager-analytics.ts`
- Update imports in both files

**Acceptance Criteria**:

- [ ] Types separated from implementation
- [ ] All imports updated
- [ ] TypeScript compilation passes

---

#### WEB-EXTRACT-003: Hooks Types

**Effort**: 20 minutes  
**Priority**: 🟡 MEDIUM

**Objective**: Extract types from `lib/hooks.ts`

**Deliverables**:

- Create `shared/types/api.ts`
- Move interfaces: `Matchup`, `WeeklyMetric`, `Roster`, `TeamStats`, etc.
- Update imports

**Acceptance Criteria**:

- [ ] Types centralized in `shared/types/`
- [ ] Hooks file cleaner
- [ ] TypeScript compilation passes

---

#### WEB-EXTRACT-004: Stats Component Types

**Effort**: 30 minutes  
**Priority**: 🟡 MEDIUM

**Objective**: Extract types from stats components

**Deliverables**:

- Create `features/stats/types.ts`
- Move types from `TrendsView.tsx`, `TeamView.tsx`, `ScheduleAnalysis.tsx`
- Consolidate duplicate types

**Acceptance Criteria**:

- [ ] Feature-level types file created
- [ ] Components import from centralized types
- [ ] No duplicate type definitions

---

### Phase 3: Utility Extraction (Week 2) 🟡 MEDIUM PRIORITY

#### WEB-UTIL-001: Formatting Utilities

**Effort**: 40 minutes  
**Priority**: 🟡 MEDIUM

**Objective**: Extract formatting functions to shared utilities

**Deliverables**:

- Create `shared/utils/formatting/`
- Extract functions:
  - `currency.ts` - `formatCurrency()`, `formatCompactCurrency()`
  - `percentage.ts` - `formatPercentage()`, `formatDecimal()`
  - `numbers.ts` - `formatNumber()`, `formatCompact()`
- Write tests for each utility
- Export from `index.ts`

**Acceptance Criteria**:

- [ ] All formatting functions extracted
- [ ] 100% test coverage on utilities
- [ ] Components use shared formatters
- [ ] All tests passing

---

#### WEB-UTIL-002: Color Utilities

**Effort**: 35 minutes  
**Priority**: 🟡 MEDIUM

**Objective**: Consolidate color utilities

**Deliverables**:

- Create `shared/utils/colors/`
- Extract functions:
  - `chart-colors.ts` - `getClusterBadgeColor()`, `getChartColor()`
  - `team-colors.ts` - Team-specific colors
  - `rank-colors.ts` - `getRankColor()`, `getPerformanceColor()`
  - `diverging.ts` - `getDivergingBg()`, `hexToRgb()`, `mixHex()`
- Write tests
- Export from `index.ts`

**Acceptance Criteria**:

- [ ] Color utilities centralized
- [ ] Duplicate logic removed
- [ ] Tests cover all functions
- [ ] Components use shared utilities

---

#### WEB-UTIL-003: Manager Analytics Calculations

**Effort**: 1 hour  
**Priority**: 🟡 MEDIUM

**Objective**: Extract calculation logic from `manager-analytics.ts`

**Deliverables**:

- Create `features/draft-analysis/utils/calculations.ts`
- Extract pure functions:
  - `calculateGiniSpend()`
  - `calculateTopNShares()`
  - `calculateConcentration()`
  - etc. (15+ functions)
- Write comprehensive tests
- Update `manager-analytics.ts` to use extracted functions

**Acceptance Criteria**:

- [ ] Calculation logic separated from data fetching
- [ ] 80%+ test coverage
- [ ] All pure functions tested
- [ ] Original file reduced by 200+ lines

---

#### WEB-UTIL-004: Hall of Fame Utilities

**Effort**: 45 minutes  
**Priority**: 🟡 MEDIUM

**Objective**: Consolidate 5 hall-of-fame utility files

**Deliverables**:

- Create `features/hall-of-fame/utils/`
- Consolidate files:
  - `calculations.ts` (from `hall-of-fame-calculations.ts`)
  - `aggregations.ts` (from `hall-of-fame-aggregations.ts`)
  - `categories.ts` (from `hall-of-fame-categories.ts`)
  - `expanded-categories.ts` (from `hall-of-fame-expanded-categories.ts`)
- Remove duplicate logic
- Export from `index.ts`

**Acceptance Criteria**:

- [ ] 5 files consolidated to 4
- [ ] Duplicate logic removed
- [ ] Barrel exports in place
- [ ] All imports updated

---

### Phase 4: Hook Extraction (Week 3) 🟡 MEDIUM PRIORITY

#### WEB-HOOK-001: Manager Sorting and Filtering

**Effort**: 1 hour  
**Priority**: 🟡 MEDIUM

**Objective**: Extract sorting/filtering logic from `manager-analysis.tsx`

**Deliverables**:

- Create `features/draft-analysis/hooks/`
- Extract hooks:
  - `useManagerSorting.ts` - Sorting state and logic
  - `useManagerFiltering.ts` - Filter state and logic
- Write tests for both hooks
- Update `manager-analysis.tsx` to use hooks

**Acceptance Criteria**:

- [ ] Hooks extracted and tested
- [ ] Component file reduced by 150+ lines
- [ ] Tests cover sorting/filtering logic
- [ ] Component uses new hooks

---

#### WEB-HOOK-002: Draft Analytics Data Hook

**Effort**: 45 minutes  
**Priority**: 🟡 MEDIUM

**Objective**: Extract data fetching logic from `manager-analytics.ts`

**Deliverables**:

- Create `features/draft-analysis/hooks/useDraftAnalytics.ts`
- Extract React Query logic
- Write tests using mock API client

**Acceptance Criteria**:

- [ ] Data fetching hook extracted
- [ ] Tests cover loading/error states
- [ ] Hook is reusable
- [ ] Original file reduced

---

#### WEB-HOOK-003: Stats Hub Hooks

**Effort**: 1 hour  
**Priority**: 🟡 MEDIUM

**Objective**: Extract hooks from stats components

**Deliverables**:

- Create `features/stats/hooks/`
- Extract hooks:
  - `useLeagueStats.ts`
  - `useTeamStats.ts`
  - `useTrendsData.ts`
  - `useScheduleAnalysis.ts`
- Write tests

**Acceptance Criteria**:

- [ ] All stats hooks extracted
- [ ] Components use new hooks
- [ ] Tests cover data fetching
- [ ] Hooks properly typed

---

### Phase 5: Component Splitting (Week 3-5) 🟢 NORMAL PRIORITY

#### WEB-COMP-001: Split Manager Analysis Component

**Effort**: 2 hours  
**Priority**: 🟢 HIGH (but do after utils/hooks)

**Objective**: Break down `manager-analysis.tsx` (1,624 lines) into sub-components

**Deliverables**:

- Create `features/draft-analysis/components/ManagerAnalysis/`
- Split into sub-components:
  - `ManagerAnalysis.tsx` - Main component (100 lines)
  - `ManagerTable.tsx` - Table display
  - `ManagerFilters.tsx` - Filter UI
  - `ClusterBadge.tsx` - Badge component
  - `ManagerStats.tsx` - Stats display
- Create `types.ts` for component props
- Create `utils.ts` for inline helpers
- Write tests for each component

**Acceptance Criteria**:

- [ ] Main component <150 lines
- [ ] 5+ sub-components created
- [ ] All sub-components tested
- [ ] Visual regression tests pass
- [ ] Performance improved (memo usage)

---

#### WEB-COMP-002: Split TrendsView Component

**Effort**: 2 hours  
**Priority**: 🟢 MEDIUM

**Objective**: Break down `TrendsView.tsx` (1,606 lines)

**Deliverables**:

- Create `features/stats/components/TrendsView/`
- Split into:
  - `TrendsView.tsx` - Main component
  - `TrendChart.tsx` - Chart display
  - `TrendFilters.tsx` - Filter UI
  - `TrendLegend.tsx` - Legend component
- Write tests

**Acceptance Criteria**:

- [ ] Main component <200 lines
- [ ] Sub-components extracted
- [ ] Tests passing
- [ ] Performance improved

---

#### WEB-COMP-003: Split Playoff Bracket Component

**Effort**: 1.5 hours  
**Priority**: 🟢 MEDIUM

**Objective**: Break down `playoff-bracket.tsx` (1,400 lines)

**Deliverables**:

- Create `shared/components/playoffs/PlayoffBracket/`
- Split into:
  - `PlayoffBracket.tsx` - Main layout
  - `BracketRound.tsx` - Round display
  - `BracketMatchup.tsx` - Individual matchup
  - `BracketTeam.tsx` - Team card
- Write tests

**Acceptance Criteria**:

- [ ] Main component <200 lines
- [ ] Reusable sub-components
- [ ] Tests covering bracket logic
- [ ] Visual tests passing

---

#### WEB-COMP-004: Split Schedule Analysis Component

**Effort**: 1.5 hours  
**Priority**: 🟢 MEDIUM

**Objective**: Break down `ScheduleAnalysis.tsx` (1,243 lines)

**Deliverables**:

- Create `features/stats/components/ScheduleAnalysis/`
- Split into sub-components
- Write tests

**Acceptance Criteria**:

- [ ] Main component <200 lines
- [ ] Sub-components extracted
- [ ] Tests passing

---

#### WEB-COMP-005: Split TeamView Component

**Effort**: 1.5 hours  
**Priority**: 🟢 MEDIUM

**Objective**: Break down `TeamView.tsx` (1,198 lines)

**Deliverables**:

- Create `features/stats/components/TeamView/`
- Split into sub-components
- Write tests

**Acceptance Criteria**:

- [ ] Main component <200 lines
- [ ] Sub-components tested
- [ ] Performance improved

---

### Phase 6: Page Migration (Week 4-5) 🟢 NORMAL PRIORITY

#### WEB-PAGE-001: Migrate Draft Analysis Pages

**Effort**: 1 hour  
**Priority**: 🟢 MEDIUM

**Objective**: Migrate draft-related pages to use new feature structure

**Deliverables**:

- Update `app/draft/analysis/page.tsx`
- Update `app/league/draft/page.tsx`
- Import from `features/draft-analysis`
- Remove old imports

**Acceptance Criteria**:

- [ ] Pages use feature exports
- [ ] Old imports removed
- [ ] Pages still functional
- [ ] No breaking changes

---

#### WEB-PAGE-002: Migrate Stats Pages

**Effort**: 1 hour  
**Priority**: 🟢 MEDIUM

**Objective**: Migrate stats pages to use new feature structure

**Deliverables**:

- Update `app/stats/page.tsx`
- Update stats sub-pages
- Import from `features/stats`

**Acceptance Criteria**:

- [ ] Stats pages use feature exports
- [ ] Old imports removed
- [ ] Functionality preserved

---

#### WEB-PAGE-003: Migrate Matchup Pages

**Effort**: 45 minutes  
**Priority**: 🟢 MEDIUM

**Objective**: Migrate matchup pages to use new feature structure

**Deliverables**:

- Update matchup-related pages
- Import from `features/matchups`

**Acceptance Criteria**:

- [ ] Matchup pages use feature exports
- [ ] Old code removed

---

### Phase 7: Testing (Week 5-6) 🔴 CRITICAL

#### WEB-TEST-001: Component Tests (Critical Paths)

**Effort**: 3 hours  
**Priority**: 🔴 CRITICAL

**Objective**: Write tests for critical components

**Deliverables**:

- Test all components in `features/draft-analysis/`
- Test all components in `features/matchups/`
- Test all components in `features/stats/`
- Achieve 80%+ coverage

**Acceptance Criteria**:

- [ ] All critical components tested
- [ ] 80%+ coverage achieved
- [ ] Tests cover edge cases
- [ ] Tests cover user interactions

---

#### WEB-TEST-002: Hook Tests

**Effort**: 2 hours  
**Priority**: 🔴 CRITICAL

**Objective**: Write tests for all custom hooks

**Deliverables**:

- Test all hooks in `features/*/hooks/`
- Test all hooks in `shared/hooks/`
- Cover loading/error states

**Acceptance Criteria**:

- [ ] All hooks tested
- [ ] Loading states covered
- [ ] Error states covered
- [ ] 100% hook coverage

---

#### WEB-TEST-003: Utility Tests

**Effort**: 2 hours  
**Priority**: 🔴 CRITICAL

**Objective**: Write tests for all utility functions

**Deliverables**:

- Test all utilities in `features/*/utils/`
- Test all utilities in `shared/utils/`
- Cover edge cases

**Acceptance Criteria**:

- [ ] All utilities tested
- [ ] Edge cases covered
- [ ] 100% utility coverage

---

#### WEB-TEST-004: Integration Tests (API Routes)

**Effort**: 2 hours  
**Priority**: 🟡 HIGH

**Objective**: Write integration tests for API routes

**Deliverables**:

- Test critical API routes
- Mock external dependencies
- Test error handling

**Acceptance Criteria**:

- [ ] Critical routes tested
- [ ] Error handling covered
- [ ] Mock data factories used

---

### Phase 8: Cleanup & Polish (Week 7-8) 🟢 LOW PRIORITY

#### WEB-CLEAN-001: Remove Deprecated Files

**Effort**: 30 minutes  
**Priority**: 🟢 LOW

**Objective**: Delete old component files after migration

**Deliverables**:

- Delete deprecated components
- Delete old utility files
- Clean up empty directories

**Acceptance Criteria**:

- [ ] All deprecated files removed
- [ ] No broken imports
- [ ] Build passes

---

#### WEB-CLEAN-002: Fix ESLint Violations

**Effort**: 2 hours  
**Priority**: 🟡 HIGH

**Objective**: Fix all ESLint violations

**Deliverables**:

- Remove all `eslint-disable` comments
- Fix underlying issues
- Achieve 0 warnings

**Acceptance Criteria**:

- [ ] Zero ESLint errors
- [ ] <5 warnings
- [ ] No `eslint-disable` comments

---

#### WEB-DOC-001: Add JSDoc Documentation

**Effort**: 2 hours  
**Priority**: 🟢 LOW

**Objective**: Add JSDoc to all exported functions/components

**Deliverables**:

- JSDoc for all exported functions
- JSDoc for all React components
- Examples in JSDoc

**Acceptance Criteria**:

- [ ] All exports documented
- [ ] IDE tooltips show docs
- [ ] Examples included

---

#### WEB-DOC-002: Create Feature READMEs

**Effort**: 1 hour  
**Priority**: 🟢 LOW

**Objective**: Document each feature

**Deliverables**:

- README.md for each feature
- Architecture diagrams
- Usage examples

**Acceptance Criteria**:

- [ ] All features documented
- [ ] Diagrams included
- [ ] Examples provided

---

## 📊 Task Summary

### By Priority

| Priority    | Count  | Total Effort   | Focus                                |
| ----------- | ------ | -------------- | ------------------------------------ |
| 🔴 CRITICAL | 8      | 12 hours       | Testing, Component Patterns, Quality |
| ⚠️ HIGH     | 4      | 1.5 hours      | Type Extraction (Quick Wins)         |
| 🟡 MEDIUM   | 15     | 15 hours       | Utilities, Hooks, Cleanup            |
| 🟢 LOW      | 8      | 12 hours       | Polish, Documentation                |
| **TOTAL**   | **35** | **40.5 hours** | **8 weeks @ 5 hours/week**           |

### By Phase

| Phase                        | Tasks | Effort     | Timeline |
| ---------------------------- | ----- | ---------- | -------- |
| Phase 1: Infrastructure      | 4     | 3.25 hours | Week 1   |
| Phase 2: Type Extraction     | 4     | 1.5 hours  | Week 1-2 |
| Phase 3: Utility Extraction  | 4     | 3 hours    | Week 2   |
| Phase 4: Hook Extraction     | 3     | 2.75 hours | Week 3   |
| Phase 5: Component Splitting | 5     | 9 hours    | Week 3-5 |
| Phase 6: Page Migration      | 3     | 2.75 hours | Week 4-5 |
| Phase 7: Testing             | 4     | 9 hours    | Week 5-6 |
| Phase 8: Cleanup & Polish    | 8     | 5.25 hours | Week 7-8 |

### By Category

| Category               | Tasks | Effort     |
| ---------------------- | ----- | ---------- |
| Setup & Infrastructure | 4     | 3.25 hours |
| Type Extraction        | 4     | 1.5 hours  |
| Utility Extraction     | 4     | 3 hours    |
| Hook Extraction        | 3     | 2.75 hours |
| Component Splitting    | 5     | 9 hours    |
| Page Migration         | 3     | 2.75 hours |
| Testing                | 4     | 9 hours    |
| Cleanup                | 2     | 2.5 hours  |
| Documentation          | 2     | 3 hours    |

---

## 🎯 Recommended Execution Order

### Week 1: Foundation (CRITICAL PATH)

```
Day 1-2:
  WEB-SETUP-001  ⏱️ 1 hour     → Testing infrastructure
  WEB-SETUP-002  ⏱️ 45 min     → ESLint/Prettier
  WEB-SETUP-003  ⏱️ 1 hour     → Test utilities

Day 3-5:
  WEB-SETUP-004  ⏱️ 30 min     → Folder structure
  WEB-EXTRACT-001 ⏱️ 20 min    → Manager types (quick win)
  WEB-EXTRACT-002 ⏱️ 25 min    → Analytics types (quick win)
  WEB-EXTRACT-003 ⏱️ 20 min    → Hooks types (quick win)
```

**Outcome**: Testing works, linting enforced, types extracted ✅

---

### Week 2: Utilities (BUILD MOMENTUM)

```
Day 1-3:
  WEB-UTIL-001   ⏱️ 40 min     → Formatting utilities
  WEB-UTIL-002   ⏱️ 35 min     → Color utilities
  WEB-UTIL-003   ⏱️ 1 hour     → Manager analytics calculations

Day 4-5:
  WEB-UTIL-004   ⏱️ 45 min     → Hall of Fame utilities
  WEB-EXTRACT-004 ⏱️ 30 min    → Stats types
```

**Outcome**: Shared utilities extracted, testable, reusable ✅

---

### Week 3: Hooks (PREPARE FOR COMPONENTS)

```
Day 1-3:
  WEB-HOOK-001   ⏱️ 1 hour     → Manager sorting/filtering hooks
  WEB-HOOK-002   ⏱️ 45 min     → Draft analytics hook

Day 4-5:
  WEB-HOOK-003   ⏱️ 1 hour     → Stats hub hooks
  Start WEB-COMP-001            → Begin manager analysis split
```

**Outcome**: Hooks extracted, ready for component work ✅

---

### Week 4-5: Component Splitting (BIG IMPACT)

```
Week 4:
  WEB-COMP-001   ⏱️ 2 hours    → Split manager analysis
  WEB-COMP-002   ⏱️ 2 hours    → Split TrendsView
  WEB-PAGE-001   ⏱️ 1 hour     → Migrate draft pages

Week 5:
  WEB-COMP-003   ⏱️ 1.5 hours  → Split playoff bracket
  WEB-COMP-004   ⏱️ 1.5 hours  → Split schedule analysis
  WEB-COMP-005   ⏱️ 1.5 hours  → Split TeamView
  WEB-PAGE-002   ⏱️ 1 hour     → Migrate stats pages
```

**Outcome**: Mega-components split, pages migrated ✅

---

### Week 6: Testing (CRITICAL VALIDATION)

```
Day 1-2:
  WEB-TEST-001   ⏱️ 3 hours    → Component tests (critical)

Day 3-4:
  WEB-TEST-002   ⏱️ 2 hours    → Hook tests
  WEB-TEST-003   ⏱️ 2 hours    → Utility tests

Day 5:
  WEB-TEST-004   ⏱️ 2 hours    → Integration tests
```

**Outcome**: 80%+ coverage achieved, confident refactoring ✅

---

### Week 7-8: Cleanup & Polish (PRODUCTION READY)

```
Week 7:
  WEB-CLEAN-001  ⏱️ 30 min     → Remove deprecated files
  WEB-CLEAN-002  ⏱️ 2 hours    → Fix ESLint violations
  WEB-DOC-001    ⏱️ 2 hours    → JSDoc documentation

Week 8:
  WEB-PAGE-003   ⏱️ 45 min     → Migrate remaining pages
  WEB-DOC-002    ⏱️ 1 hour     → Feature READMEs
  Final polish and review
```

**Outcome**: Production-ready, enterprise-grade codebase ✅

---

## 🎯 Success Metrics

### Quantifiable Improvements

| Metric                    | Current     | Target     | Improvement  |
| ------------------------- | ----------- | ---------- | ------------ |
| **Test Coverage**         | 0%          | 80%+       | +80%         |
| **Largest File**          | 2,805 lines | <300 lines | -2,505 lines |
| **Avg Component Size**    | ~600 lines  | <200 lines | -400 lines   |
| **Files >1,000 lines**    | 10 files    | 0 files    | -10 files    |
| **ESLint Violations**     | 100+        | <5         | -95+         |
| **Barrel Exports**        | 0%          | 100%       | +100%        |
| **Feature Organization**  | 0%          | 100%       | +100%        |
| **Type Separation**       | 10%         | 90%        | +80%         |
| **Component Memoization** | 0%          | 80%        | +80%         |
| **Enterprise Score**      | 3.5/10      | 9.0/10     | +5.5 points  |

---

## 🚦 Enterprise Readiness Scorecard

### Before Refactoring: **3.5/10** 🔴

| Category                | Score | Weight   | Weighted   |
| ----------------------- | ----- | -------- | ---------- |
| Testing Infrastructure  | 0/10  | 20%      | 0.0        |
| Code Quality Automation | 0/10  | 15%      | 0.0        |
| Component Patterns      | 1/10  | 15%      | 0.15       |
| File Organization       | 2/10  | 15%      | 0.3        |
| Type System             | 4/10  | 10%      | 0.4        |
| State Management        | 5/10  | 10%      | 0.5        |
| Import Conventions      | 2/10  | 5%       | 0.1        |
| Separation of Concerns  | 1/10  | 10%      | 0.1        |
| **Total**               |       | **100%** | **3.5/10** |

### After Refactoring: **9.0/10** ✅ (Target)

| Category                | Score | Weight   | Weighted   |
| ----------------------- | ----- | -------- | ---------- |
| Testing Infrastructure  | 9/10  | 20%      | 1.8        |
| Code Quality Automation | 10/10 | 15%      | 1.5        |
| Component Patterns      | 9/10  | 15%      | 1.35       |
| File Organization       | 10/10 | 15%      | 1.5        |
| Type System             | 9/10  | 10%      | 0.9        |
| State Management        | 8/10  | 10%      | 0.8        |
| Import Conventions      | 9/10  | 5%       | 0.45       |
| Separation of Concerns  | 9/10  | 10%      | 0.9        |
| **Total**               |       | **100%** | **9.0/10** |

---

## 🚀 Getting Started

### Immediate Next Steps

1. **Read this document completely** to understand scope
2. **Review `CODING_CONVENTIONS.MD`** for coding standards
3. **Review `GAP_ANALYSIS.md`** for context
4. **Review `tasks/README.md`** for task system
5. **Start with WEB-SETUP-001** (Testing Infrastructure)

### First Task: WEB-SETUP-001

```bash
# Read the first task
cat tasks/WEB-SETUP-001-testing-infrastructure.md

# Create task file (if not exists)
# Follow instructions in task
# Complete and mark in PROGRESS.md
```

### Commit Message Template

```
feat(WEB-XXX): [short description]

- Completed [TASK-ID]: [task name]
- [Bullet points of changes]

Acceptance Criteria:
- [x] Criterion 1
- [x] Criterion 2
```

---

## 📋 Next Steps: Drill-Down Task Creation

This assessment identifies **35 high-level tasks**. For each task to be executable by Cursor AI, we need to create detailed task files following the format in `tasks/README.md`:

### Task File Template Structure

````markdown
# [TASK-ID]: [Task Name]

**Category**: [SETUP/EXTRACT/UTIL/HOOK/COMP/TEST/CLEAN/DOC]  
**Priority**: [CRITICAL/HIGH/MEDIUM/LOW]  
**Estimated Time**: [X minutes/hours]  
**Dependencies**: [List of prerequisite tasks]

## Objective

[One sentence describing the goal]

## Context Needed

**Read these files** (with specific line ranges):

1. `file1.ts` (lines 1-100)
2. `file2.tsx` (lines 50-150)

**Total Context**: ~500 lines

## Steps

1. [Step 1 with exact command or action]
2. [Step 2 with exact command or action]
   ...

## Acceptance Criteria

- [ ] Criterion 1
- [ ] Criterion 2
- [ ] Tests pass
- [ ] TypeScript compiles
- [ ] ESLint passes

## Verification Commands

```bash
pnpm test
pnpm tsc --noEmit
pnpm lint
```
````

## Cursor Prompt (Copy-Paste Ready)

```
I'm working on [TASK-ID]. Please:

1. Read [file] (lines X-Y only)
2. [Specific action]
3. Follow the steps exactly
```

## Related Tasks

**Blocks**: [TASK-XXX]  
**Blocked By**: [TASK-XXX]  
**Related**: [TASK-XXX]

```

### Creating Drill-Down Tasks

To create detailed executable tasks from this assessment:

1. **For each high-level task** (WEB-SETUP-001, etc.):
   - Create a detailed task file in `tasks/`
   - Follow the template above
   - Include specific line ranges
   - Provide exact commands
   - Add copy-paste ready prompts

2. **Update `tasks/PROGRESS.md`**:
   - Add new tasks to registry
   - Update category counts
   - Track completion status

3. **Validate task is executable**:
   - Can be completed in <60 minutes
   - Reads <3 files
   - Processes <500 lines
   - Has clear acceptance criteria
   - Includes verification commands

---

## 🎯 Conclusion

The `apps/web` codebase requires **significant refactoring** to achieve enterprise readiness. The proposed **8-week, 35-task roadmap** provides a clear path from the current **3.5/10** score to a target **9.0/10** score.

**Key Priorities**:

1. 🔴 **Week 1**: Testing infrastructure + ESLint/Prettier (CRITICAL)
2. ⚠️ **Week 1-2**: Type extraction (Quick wins)
3. 🟡 **Week 2-3**: Utilities and hooks (Foundation)
4. 🟢 **Week 3-5**: Component splitting (Big impact)
5. 🔴 **Week 6**: Comprehensive testing (Validation)
6. 🟢 **Week 7-8**: Cleanup and polish (Production ready)

**Expected Outcomes**:

- ✅ 80%+ test coverage
- ✅ All files <300 lines
- ✅ Feature-based organization
- ✅ Complete separation of concerns
- ✅ Enterprise-grade code quality
- ✅ Maintainable, scalable, testable codebase

Let's transform this codebase into an enterprise-ready application! 🚀

```
