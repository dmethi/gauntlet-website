# Apps/Web: Enterprise Readiness Assessment

**Date**: October 7, 2025  
**Assessed By**: AI Analysis  
**Current Enterprise Score**: **4.5/10** 🟠 MAJOR GAPS

---

## Executive Summary

The `apps/web` Next.js application has **strong domain functionality** but still carries **major architectural and quality issues** that prevent enterprise deployment. Testing, linting, and feature-based patterns now exist for draft analytics, yet most of the codebase continues to operate as a monolithic structure with mega-files, limited coverage, and widespread technical debt.

### Critical Blockers (Must Fix Before Production)

1. 🔴 **Insufficient automated coverage** (Vitest configured, but critical paths remain untested)
2. 🔴 **Mega-files persist** (2,805 lines max, 8 files >1,000 lines still in production)
3. 🔴 **Partial feature architecture** (draft analysis migrated, stats/playoffs untouched)
4. 🔴 **Residual lint suppressions** (`eslint-disable` blocks still guard core logic)
5. 🔴 **Flat data modules** (`data/report-week2.ts` remains a 2,805-line blob)
6. 🔴 **Limited component patterns** (memoized sub-components only adopted in draft analysis)

---

## 📊 Current State Analysis

### File Structure Assessment

**Total TypeScript Files**: 58,542 lines across ~150 files

#### Top 15 Problem Files (Lines of Code)

| Rank | File                                            | Lines | Category  | Priority    |
| ---- | ----------------------------------------------- | ----- | --------- | ----------- |
| 1    | `data/report-week2.ts`                          | 2,805 | Data      | 🔴 Critical |
| 2    | `app/stats/components/TrendsView.tsx`           | 1,586 | Component | 🔴 Critical |
| 3    | `app/league/draft/page.tsx`                     | 1,488 | Page      | 🔴 Critical |
| 4    | `components/playoff-bracket.tsx`                | 1,347 | Component | 🔴 Critical |
| 5    | `app/hall-of-fame-enhanced/page.tsx`            | 1,251 | Page      | 🔴 Critical |
| 6    | `app/draft/analysis/page.tsx`                   | 1,228 | Page      | 🔴 Critical |
| 7    | `app/stats/components/ScheduleAnalysis.tsx`     | 1,221 | Component | 🔴 Critical |
| 8    | `app/competition/reports/2025/week-4/page.tsx`  | 1,172 | Page      | 🟡 High     |
| 9    | `app/stats/components/TeamView.tsx`             | 1,169 | Component | 🟡 High     |
| 10   | `app/league/transactions/page.tsx`              | 1,129 | Page      | 🟡 High     |
| 11   | `components/start-sit-efficiency.tsx`           | 1,092 | Component | 🟡 High     |
| 12   | `app/api/reports/[season]/[week]/route.ts`      | 1,070 | API       | 🟡 High     |
| 13   | `app/matchup/[matchupId]/page.tsx`              | 782   | Page      | 🟡 High     |
| 14   | `app/stats/components/TransactionAnalysis.tsx`  | 852   | Component | 🟡 High     |
| 15   | `features/draft-analysis/utils/calculations.ts` | 757   | Logic     | 🟡 High     |

**Total Lines in Top 15**: 18,949 lines (~32.4% of entire codebase)

### Code Quality Issues

#### 1. Testing Infrastructure: ⚠️ **5/10** (HIGH PRIORITY)

- ✅ Vitest config in place with `happy-dom` and RTL support
- ✅ Shared test setup, factories, and 20+ new specs across hooks/utilities/features
- ⚠️ Coverage <80% (no gating in CI, core pages untested)
- ❌ No integration or API route tests yet
- ❌ No coverage trend reporting

**Impact**: The safety net exists, but critical paths (stats hub, playoff bracket, Next.js pages) still lack regression detection.

#### 2. Code Quality Automation: ⚠️ **6/10** (HIGH PRIORITY)

- ✅ ESLint flat config + Prettier wired through workspace scripts
- ✅ Vitest + lint scripts hooked into package.json with coverage thresholds defined
- ⚠️ Husky/CI enforcement not yet configured
- ⚠️ ESLint suppressions still guard key files (`lib/manager-analytics.ts`, recap prompts)
- ❌ No automated format/lint verification in CI pipelines

**Impact**: Local tooling is healthy, but without enforcement and debt cleanup quality could regress.

#### 3. Component Patterns: ⚠️ **3/10** (HIGH PRIORITY)

- ✅ `ManagerAnalysis` decomposed into memoized sub-components under `features/draft-analysis`
- ✅ Hooks encapsulate stateful logic (`useManagerSorting`, `useManagerFiltering`)
- ⚠️ No `forwardRef` adoption and limited reuse of primitives outside draft analysis
- ❌ TrendsView, ScheduleAnalysis, PlayoffBracket, StartSitEfficiency remain 1k+ line mega-components

**Impact**: Draft analytics is now performant and testable; remaining areas still block maintainability.

#### 4. File Organization: ⚠️ **4/10** (HIGH PRIORITY)

**Current Structure**:

```
apps/web/src/
├── features/
│   ├── draft-analysis/          # ✅ fully migrated (components, hooks, utils, tests)
│   ├── stats/                   # ⚠️ hooks + types migrated, components pending
│   ├── hall-of-fame/            # ✅ utilities + tests migrated
│   └── transactions/            # ✅ utilities migrated, components pending
├── shared/
│   ├── utils/formatting         # ✅ centralized helpers + coverage
│   └── utils/colors             # ✅ consolidated color helpers
├── components/                  # Legacy components (playoff bracket, etc.)
├── app/                         # Next.js routes (many still contain feature logic)
└── data/                        # Flat static/precomputed blobs
```

**Issues**:

- Feature folders exist but only draft analysis is end-to-end migrated
- Stats, playoffs, and matchup features still live under `app/` and legacy `components/`
- `data/` contains multi-thousand line blobs with no loaders or schemas
- Relative imports to `brand/` and `lib/` remain common

**Impact**: Navigating draft analytics is easy; other domains still lack clear boundaries and increase refactor risk.

#### 5. Type System: ⚠️ **6/10** (IMPORTANT)

- ✅ Feature-level `types.ts` files cover draft analysis, stats, hall-of-fame, transactions
- ✅ Shared utilities consume typed contracts and expose inference-friendly signatures
- ⚠️ API schemas and data loaders still live beside implementation logic
- ❌ Remaining `any` usage in report builders and analytics helpers

**Impact**: Core analytics are strongly typed; report/data pipelines still mix types and logic.

#### 6. State Management: ⚠️ **5/10** (IMPORTANT)

- ✅ React Query + custom hooks encapsulate draft analytics and stats data fetching
- ✅ Hook-level tests validate sorting/filtering behavior
- ⚠️ No shared atom/state container for cross-feature data yet
- ❌ Legacy pages continue to manage complex state inline

**Impact**: Draft workflows are predictable; other features remain state-fragmented.

#### 7. Import/Export Conventions: ⚠️ **3/10** (IMPORTANT)

- ✅ Feature and shared barrels introduced (`features/draft-analysis`, `shared/utils`)
- ✅ Path alias `@/*` consistently used in migrated modules
- ⚠️ No lint enforcement for import order or type-only imports yet
- ❌ Legacy modules still rely on deep relative paths to `brand/`
- ❌ `lib/` exports remain dense and unscoped

**Impact**: Migrated areas are cleaner; remaining imports remain brittle.

#### 8. Separation of Concerns: ⚠️ **3/10** (HIGH PRIORITY)

- ✅ Draft analysis isolates hooks, utilities, and UI into discrete modules with tests
- ✅ Shared formatting/color utilities extracted from duplicated inline logic
- ⚠️ Stats, playoffs, and report generation still intermix data shaping, business rules, and presentation
- ❌ Massive data blobs (`data/report-week2.ts`) embed transformation logic alongside data

**Impact**: Draft workflows are maintainable; remaining domains remain brittle and risky to modify.

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

| Metric                    | Current Snapshot         | Target     | Gap          |
| ------------------------- | ------------------------ | ---------- | ------------ |
| **Test Coverage**         | ≈20% (hooks/utilities)   | 80%+       | +60% points  |
| **Largest File**          | 2,805 lines              | <300 lines | -2,505 lines |
| **Avg Component Size**    | ~450 lines (legacy pods) | <200 lines | -250 lines   |
| **Files >1,000 lines**    | 8 files                  | 0 files    | -8 files     |
| **ESLint Violations**     | Tens (mostly suppressed) | <5         | -45+         |
| **Barrel Exports**        | Partial (draft/shared)   | 100%       | +70%         |
| **Feature Organization**  | Draft + shared only      | 100%       | +70%         |
| **Type Separation**       | Feature pods typed       | 90%        | +50%         |
| **Component Memoization** | Draft analysis only      | 80%        | +60%         |
| **Enterprise Score**      | 4.5/10                   | 9.0/10     | +4.5 points  |

---

## 🚦 Enterprise Readiness Scorecard

### Current Snapshot (October 2025): **4.5/10** 🟠

| Category                | Score | Weight   | Weighted   |
| ----------------------- | ----- | -------- | ---------- |
| Testing Infrastructure  | 5/10  | 20%      | 1.00       |
| Code Quality Automation | 6/10  | 15%      | 0.90       |
| Component Patterns      | 3/10  | 15%      | 0.45       |
| File Organization       | 4/10  | 15%      | 0.60       |
| Type System             | 6/10  | 10%      | 0.60       |
| State Management        | 5/10  | 10%      | 0.50       |
| Import Conventions      | 3/10  | 5%       | 0.15       |
| Separation of Concerns  | 3/10  | 10%      | 0.30       |
| **Total**               |       | **100%** | **4.5/10** |

### Target: **9.0/10** ✅

| Category                | Score | Weight   | Weighted   |
| ----------------------- | ----- | -------- | ---------- |
| Testing Infrastructure  | 9/10  | 20%      | 1.80       |
| Code Quality Automation | 10/10 | 15%      | 1.50       |
| Component Patterns      | 9/10  | 15%      | 1.35       |
| File Organization       | 10/10 | 15%      | 1.50       |
| Type System             | 9/10  | 10%      | 0.90       |
| State Management        | 8/10  | 10%      | 0.80       |
| Import Conventions      | 9/10  | 5%       | 0.45       |
| Separation of Concerns  | 9/10  | 10%      | 0.90       |
| **Total**               |       | **100%** | **9.0/10** |

---

## 🚀 Getting Started

### Immediate Next Steps

1. **Review this document + `tasks/PROGRESS.md`** for the refreshed baseline
2. **Skim recent task files** (`WEB-HOOK-00X`, `WEB-COMP-00X`) to understand existing patterns
3. **Prioritize Phase 5 component splits**, starting with `WEB-COMP-002` (TrendsView) and `WEB-COMP-003` (PlayoffBracket)
4. **Plan coverage expansion** alongside each component split (target: add component + integration tests)

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
