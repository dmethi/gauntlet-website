# Refactoring Action Plan

**Goal**: Transform Gauntlet codebase to enterprise-ready standards  
**Timeline**: 8 weeks (2 weeks per phase)  
**Strategy**: Incremental refactoring with continuous integration

---

## Phase 1: Foundation & Infrastructure (Week 1-2)

### Week 1: Testing Infrastructure

#### Task 1.1: Set up Testing Framework ⏱️ 4 hours

```bash
# Install dependencies
cd apps/web
pnpm add -D vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom

# Create config
touch vitest.config.ts
```

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
```

**Acceptance Criteria**:

- ✅ Tests run with `pnpm test`
- ✅ Coverage reports generated
- ✅ Can import components with `@/` alias

#### Task 1.2: Create Test Infrastructure ⏱️ 3 hours

```bash
mkdir -p apps/web/src/test/{factories,utils}
touch apps/web/src/test/setup.ts
```

```typescript
// apps/web/src/test/setup.ts
import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

afterEach(() => {
  cleanup();
});
```

**Files to Create**:

1. `src/test/factories/index.ts` - Factory exports
2. `src/test/utils/render.tsx` - Custom render with providers
3. `src/test/utils/mockData.ts` - Common test data

**Acceptance Criteria**:

- ✅ Custom render function with providers
- ✅ Factory pattern documented
- ✅ Example test passes

#### Task 1.3: Write First Tests ⏱️ 4 hours

**Target**: Test 3 utility functions as proof of concept

```typescript
// src/lib/utils.test.ts
import { describe, it, expect } from 'vitest';
import { cn, formatNumber, calculatePercentage } from './utils';

describe('utils', () => {
  describe('cn', () => {
    it('should merge class names', () => {
      expect(cn('foo', 'bar')).toBe('foo bar');
    });
  });

  // Add more tests...
});
```

**Acceptance Criteria**:

- ✅ 3+ utility functions tested
- ✅ 100% coverage on tested functions
- ✅ Tests pass in CI

---

### Week 2: ESLint Rules & Folder Structure

#### Task 2.1: Configure ESLint Rules ⏱️ 3 hours

```bash
pnpm add -D eslint-plugin-import
```

```javascript
// apps/web/.eslintrc.js
module.exports = {
  extends: ['next/core-web-vitals'],
  plugins: ['import'],
  rules: {
    // Import ordering
    'import/order': [
      'error',
      {
        groups: [
          'builtin',
          'external',
          'internal',
          ['parent', 'sibling'],
          'index',
        ],
        pathGroups: [
          {
            pattern: 'react',
            group: 'external',
            position: 'before',
          },
          {
            pattern: '@gauntlet/**',
            group: 'internal',
            position: 'before',
          },
          {
            pattern: '@/**',
            group: 'internal',
            position: 'after',
          },
        ],
        pathGroupsExcludedImportTypes: ['react'],
        'newlines-between': 'always',
        alphabetize: {
          order: 'asc',
          caseInsensitive: true,
        },
      },
    ],

    // Type imports
    '@typescript-eslint/consistent-type-imports': [
      'error',
      {
        prefer: 'type-imports',
        disallowTypeAnnotations: false,
      },
    ],

    // Prevent relative imports beyond parent
    'import/no-relative-parent-imports': 'off', // Will enable after refactoring

    // No unused vars
    '@typescript-eslint/no-unused-vars': [
      'error',
      {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
      },
    ],
  },
};
```

**Acceptance Criteria**:

- ✅ Import ordering enforced
- ✅ Type imports required
- ✅ No eslint-disable without explanation

#### Task 2.2: Create Feature Folder Structure ⏱️ 2 hours

```bash
cd apps/web/src
mkdir -p features/{draft-analysis,matchups,stats,hall-of-fame,transactions}/components
mkdir -p features/{draft-analysis,matchups,stats,hall-of-fame,transactions}/hooks
mkdir -p features/{draft-analysis,matchups,stats,hall-of-fame,transactions}/utils
mkdir -p shared/{components,hooks,utils,types}
```

```typescript
// apps/web/src/features/README.md
# Features Directory

Each feature follows a consistent structure:

```

feature-name/ ├── components/ # UI components │ ├── FeatureMain/ │ │ ├──
FeatureMain.tsx │ │ ├── FeatureMain.test.tsx │ │ ├── types.ts │ │ └── index.ts │
└── index.ts ├── hooks/ # Custom hooks │ ├── useFeatureHook.ts │ ├──
useFeatureHook.test.ts │ └── index.ts ├── utils/ # Utility functions │ ├──
calculations.ts │ ├── calculations.test.ts │ └── index.ts ├── types.ts #
Feature-level types └── index.ts # ONLY exports screens/layouts

```

## Import Rules

- ✅ Features can import from `shared/`
- ✅ Features can import from `@gauntlet/*` packages
- ❌ Features CANNOT import from other features
- ❌ `shared/` CANNOT import from `features/`
```

**Acceptance Criteria**:

- ✅ All feature folders created
- ✅ README documents structure
- ✅ Example index.ts files in place

#### Task 2.3: Update tsconfig Paths ⏱️ 1 hour

```json
// apps/web/tsconfig.json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"],
      "@/features/*": ["./src/features/*"],
      "@/shared/*": ["./src/shared/*"],
      "@/components/*": ["./src/components/*"],
      "@/lib/*": ["./src/lib/*"]
    }
  }
}
```

**Acceptance Criteria**:

- ✅ Path aliases work
- ✅ IDE autocomplete works
- ✅ No TypeScript errors

---

## Phase 2: Component Refactoring (Week 3-4)

### Week 3: Refactor manager-analysis.tsx

#### Task 3.1: Extract Types ⏱️ 2 hours

**File**: Split `manager-analysis.tsx` types

```bash
mkdir -p apps/web/src/features/manager-analysis/components/ManagerAnalysis
touch apps/web/src/features/manager-analysis/types.ts
touch apps/web/src/features/manager-analysis/components/ManagerAnalysis/types.ts
```

**Process**:

1. Copy all interfaces to `types.ts`
2. Update imports in original file
3. Run TypeScript check
4. Commit: `git commit -m "feat: extract manager-analysis types"`

**Acceptance Criteria**:

- ✅ No TypeScript errors
- ✅ Types in separate file
- ✅ Clean git diff

#### Task 3.2: Extract Utility Functions ⏱️ 3 hours

**Files**:

- `utils/formatting.ts` (formatCurrency, formatPercentage)
- `utils/colors.ts` (getClusterBadgeColor, getClusterColor)
- `utils/sorting.ts` (sortProfiles)

**Process**:

1. Create utility files with functions
2. Write tests for each utility
3. Update imports in component
4. Remove inline functions
5. Commit: `git commit -m "feat: extract manager-analysis utils"`

**Acceptance Criteria**:

- ✅ All utilities tested (100% coverage)
- ✅ Utilities work in component
- ✅ Tests pass

#### Task 3.3: Extract Custom Hooks ⏱️ 4 hours

**Files**:

- `hooks/useManagerSorting.ts`
- `hooks/useManagerFiltering.ts`

**Process**:

1. Extract sorting logic to hook
2. Write hook tests
3. Extract filtering logic to hook
4. Write hook tests
5. Update component to use hooks
6. Commit: `git commit -m "feat: extract manager-analysis hooks"`

**Acceptance Criteria**:

- ✅ Hooks tested with renderHook
- ✅ Component logic simplified
- ✅ Tests pass

#### Task 3.4: Extract Sub-components ⏱️ 8 hours

**Components to Create**:

1. `ClusterVisualization.tsx` (200 lines)
2. `ManagerFilters.tsx` (100 lines)
3. `ManagerTable.tsx` (200 lines)
4. `ManagerTableRow.tsx` (80 lines)
5. `ClusterBadge.tsx` (40 lines)

**Process (per component)**:

1. Create component file
2. Create types.ts
3. Move JSX from main component
4. Write component tests
5. Update main component
6. Commit

**Acceptance Criteria**:

- ✅ Main component < 150 lines
- ✅ Each sub-component tested
- ✅ All tests pass
- ✅ No visual regressions

#### Task 3.5: Add Memoization & JSDoc ⏱️ 2 hours

**Process**:

1. Wrap all components in `memo()`
2. Add JSDoc to components
3. Add JSDoc to hooks
4. Add JSDoc to utilities

**Acceptance Criteria**:

- ✅ All components memoized
- ✅ JSDoc on all exports
- ✅ Examples in JSDoc

---

### Week 4: Refactor Additional Components

#### Task 4.1: Refactor start-sit-efficiency.tsx ⏱️ 6 hours

**Target**: 200+ line component

Apply same pattern:

1. Extract types
2. Extract utils
3. Extract hooks
4. Extract sub-components
5. Add tests

**Acceptance Criteria**:

- ✅ Main component < 150 lines
- ✅ 80% test coverage
- ✅ Types separated

#### Task 4.2: Refactor matchup-simulation.tsx ⏱️ 6 hours

Apply same pattern as above.

#### Task 4.3: Refactor team-charts.tsx ⏱️ 4 hours

Apply same pattern as above.

---

## Phase 3: Logic Refactoring (Week 5-6)

### Week 5: Split hooks.ts (726 lines)

#### Task 5.1: Create Feature-Specific Hooks ⏱️ 8 hours

**Target**: Break into 15+ hook files

**Process**:

1. Identify feature groupings:
   - League hooks → `features/league/hooks/`
   - Matchup hooks → `features/matchups/hooks/`
   - Team hooks → `features/stats/hooks/`
   - Player hooks → `shared/hooks/`
   - Rollup hooks → `shared/hooks/`

2. For each hook:
   - Create new file in appropriate feature
   - Move hook implementation
   - Write tests
   - Update imports

**Files to Create**:

```
features/league/hooks/
├── useLeagueData.ts
├── useLeagueData.test.ts
├── useLeagueDataById.ts
├── useLeagueDataById.test.ts
├── useSeasonalAggregates.ts
├── useSeasonalAggregates.test.ts
└── index.ts

features/matchups/hooks/
├── useMatchups.ts
├── useMatchups.test.ts
├── useMatchup.ts
├── useMatchup.test.ts
└── index.ts

features/stats/hooks/
├── useTeamData.ts
├── useTeamData.test.ts
├── useWeekRollups.ts
├── useSeasonSuperlatives.ts
└── index.ts

shared/hooks/
├── usePlayers.ts
├── usePlayer.ts
├── usePlayerStats.ts
└── index.ts
```

**Acceptance Criteria**:

- ✅ Original hooks.ts deleted
- ✅ All hooks tested
- ✅ All imports updated
- ✅ No breaking changes

---

### Week 6: Refactor Mega Logic Files

#### Task 6.1: Refactor manager-analytics.ts (1,347 lines) ⏱️ 12 hours

**Target**: Break into 15+ files

**New Structure**:

```
lib/manager-analytics/
├── types.ts                    # All interfaces (200 lines)
├── calculations/
│   ├── concentration.ts        # Concentration metrics
│   ├── concentration.test.ts
│   ├── pacing.ts              # Pacing metrics
│   ├── pacing.test.ts
│   ├── spendShares.ts         # Spend shares
│   ├── spendShares.test.ts
│   └── index.ts
├── clustering/
│   ├── kMeans.ts              # K-means implementation
│   ├── kMeans.test.ts
│   ├── silhouette.ts          # Silhouette scores
│   ├── silhouette.test.ts
│   └── index.ts
├── overlap/
│   ├── playerOverlap.ts       # Overlap calculations
│   ├── playerOverlap.test.ts
│   ├── twins.ts               # Twin detection
│   ├── twins.test.ts
│   └── index.ts
└── index.ts                   # Main API
```

**Process**:

1. Extract types first
2. Group related functions
3. Create files per group
4. Write tests
5. Update imports

**Acceptance Criteria**:

- ✅ Original file deleted
- ✅ 80%+ test coverage
- ✅ All imports updated
- ✅ No breaking changes

#### Task 6.2: Refactor draft-analytics.ts (650 lines) ⏱️ 8 hours

**Target**: Break into 10+ files

**New Structure**:

```
lib/draft-analytics/
├── types.ts
├── inflation/
│   ├── positionInflation.ts
│   ├── positionInflation.test.ts
│   └── index.ts
├── tiers/
│   ├── tierAssignment.ts
│   ├── tierAssignment.test.ts
│   └── index.ts
├── market/
│   ├── marketShape.ts
│   ├── marketShape.test.ts
│   ├── replacementCost.ts
│   ├── replacementCost.test.ts
│   └── index.ts
└── index.ts
```

**Acceptance Criteria**:

- ✅ Original file deleted
- ✅ 80%+ test coverage
- ✅ All imports updated

---

## Phase 4: Testing & Polish (Week 7-8)

### Week 7: Comprehensive Testing

#### Task 7.1: Test Critical Business Logic ⏱️ 12 hours

**Target**: 80% coverage on critical paths

**Priority Areas**:

1. Matchup calculations
2. Win probability simulations
3. Draft analytics
4. Manager analytics
5. Stats calculations

**Process**:

1. Identify untested functions
2. Write test factories
3. Write unit tests
4. Write integration tests
5. Achieve coverage targets

**Acceptance Criteria**:

- ✅ 80% coverage on critical paths
- ✅ All calculations tested
- ✅ Edge cases covered

#### Task 7.2: Add Integration Tests ⏱️ 8 hours

**Target**: API routes and data flows

**Files to Test**:

```
src/app/api/__tests__/
├── matchups.test.ts
├── league.test.ts
├── players.test.ts
└── rollups.test.ts
```

**Acceptance Criteria**:

- ✅ API routes tested
- ✅ Error cases handled
- ✅ Mock data consistent

---

### Week 8: Documentation & Polish

#### Task 8.1: Add JSDoc to All Public APIs ⏱️ 6 hours

**Target**: Every exported function/component

**Process**:

1. Add JSDoc to hooks
2. Add JSDoc to utilities
3. Add JSDoc to components
4. Add examples

**Acceptance Criteria**:

- ✅ All exports documented
- ✅ Examples included
- ✅ IDE tooltips work

#### Task 8.2: Create Storybook Stories ⏱️ 8 hours

**Target**: Key components

```bash
pnpm add -D @storybook/react @storybook/addon-essentials
npx storybook@latest init
```

**Components to Document**:

1. ManagerAnalysis
2. MatchupSimulation
3. StartSitEfficiency
4. Charts components
5. UI components

**Acceptance Criteria**:

- ✅ Storybook runs locally
- ✅ 10+ stories created
- ✅ Components interactive

#### Task 8.3: Final Cleanup ⏱️ 4 hours

**Tasks**:

1. Remove empty directories
2. Remove unused files
3. Remove all eslint-disable
4. Update README files
5. Run full test suite

**Acceptance Criteria**:

- ✅ No empty directories
- ✅ No eslint violations
- ✅ All tests pass
- ✅ Build successful

---

## Tracking Progress

### Daily Checklist

- [ ] Run tests before commits
- [ ] Keep PRs small (<500 lines)
- [ ] Update documentation
- [ ] No eslint-disable without justification
- [ ] Run full test suite

### Weekly Goals

**Week 1**: Testing infrastructure complete  
**Week 2**: Folder structure established  
**Week 3**: manager-analysis.tsx refactored  
**Week 4**: 3+ components refactored  
**Week 5**: hooks.ts split complete  
**Week 6**: Logic files refactored  
**Week 7**: 80% test coverage  
**Week 8**: Documentation complete

### Success Metrics

| Metric          | Start       | Week 4    | Week 8    | Target     |
| --------------- | ----------- | --------- | --------- | ---------- |
| Largest file    | 1,625 lines | 500 lines | 300 lines | <300 lines |
| Test coverage   | 0%          | 40%       | 80%       | >80%       |
| Feature folders | 0           | 5         | 5         | 5          |
| eslint-disable  | 50+         | 25        | 0         | <5         |
| Component avg   | 400 lines   | 250 lines | 150 lines | <200 lines |

---

## Risk Mitigation

### Risk 1: Breaking Changes

**Mitigation**:

- Write tests BEFORE refactoring
- Test in staging environment
- Keep original files until validated

### Risk 2: Time Overruns

**Mitigation**:

- Start with most critical paths
- Pair program on complex refactors
- Use AI assistance for boilerplate

### Risk 3: Scope Creep

**Mitigation**:

- Stick to action plan
- No new features during refactoring
- Document tech debt for later

---

## Next Steps

1. **Review this plan** with team
2. **Create GitHub issues** for each task
3. **Set up project board** with phases
4. **Schedule kickoff** for Week 1
5. **Begin Phase 1** testing infrastructure

**Ready to start? Begin with Phase 1, Task 1.1! 🚀**
