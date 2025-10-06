# Refactoring Example: manager-analysis.tsx

This document shows a concrete before/after example of refactoring the
`manager-analysis.tsx` component (1,625 lines) into an enterprise-ready
structure.

---

## Before: Monolithic Component (1,625 lines)

```typescript
// apps/web/src/components/manager-analysis.tsx (1,625 lines)
'use client';

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
// ... 20+ more imports
import { ManagerAnalytics, ManagerProfile } from '@/lib/manager-analytics';

interface ManagerAnalysisProps {
  analytics: ManagerAnalytics;
}

export const ManagerAnalysis: React.FC<ManagerAnalysisProps> = ({ analytics }) => {
  // 🔴 50+ lines of state
  const [selectedCluster, setSelectedCluster] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('concentration');
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);
  // ... 40+ more state declarations

  // 🔴 200+ lines of memoized calculations
  const filteredProfiles = useMemo(() => {
    if (selectedCluster === 'all') return analytics.profiles;
    return analytics.profiles.filter(p => p.cluster.cluster_label === selectedCluster);
  }, [analytics.profiles, selectedCluster]);

  const sortedProfiles = useMemo(() => {
    const sorted = [...filteredProfiles];
    if (sortConfig) {
      sorted.sort((a, b) => {
        // ... 100+ lines of sorting logic
      });
    }
    return sorted;
  }, [filteredProfiles, sortConfig]);

  // ... 15+ more useMemo hooks

  // 🔴 100+ lines of inline helper functions
  const handleSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'desc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'desc') {
      direction = 'asc';
    }
    setSortConfig({ key, direction });
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(value);
  };

  const getClusterBadgeColor = (label: string) => {
    // ... color logic
  };

  // ... 10+ more helper functions

  // 🔴 1000+ lines of JSX
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Manager Behavior Clusters</CardTitle>
          <CardDescription>
            Draft strategy archetypes across both leagues
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* 200+ lines of cluster visualization */}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Manager Profiles</CardTitle>
        </CardHeader>
        <CardContent>
          {/* 800+ lines of table with complex logic */}
          <Table>
            <TableHeader>
              <TableRow>
                {/* Complex header with sorting */}
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedProfiles.map((profile) => (
                <TableRow key={`${profile.manager}-${profile.league}`}>
                  {/* 50+ lines per row */}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};
```

**Problems**:

1. ❌ 1,625 lines in one file
2. ❌ 50+ state variables
3. ❌ 15+ useMemo hooks
4. ❌ 10+ inline helper functions
5. ❌ No sub-components
6. ❌ No custom hooks
7. ❌ No type separation
8. ❌ No tests

---

## After: Feature-based Organization

### 1. Folder Structure

```
apps/web/src/features/manager-analysis/
├── components/
│   ├── ManagerAnalysis/
│   │   ├── ManagerAnalysis.tsx           # Main component (120 lines)
│   │   ├── ManagerAnalysis.test.tsx      # Component tests
│   │   ├── ManagerAnalysis.stories.tsx   # Storybook stories
│   │   ├── types.ts                      # Component-specific types
│   │   └── index.ts
│   ├── ManagerTable/
│   │   ├── ManagerTable.tsx              # Table sub-component (200 lines)
│   │   ├── ManagerTable.test.tsx
│   │   ├── ManagerTableRow.tsx           # Row sub-component (80 lines)
│   │   ├── types.ts
│   │   └── index.ts
│   ├── ManagerFilters/
│   │   ├── ManagerFilters.tsx            # Filter controls (100 lines)
│   │   ├── ManagerFilters.test.tsx
│   │   ├── types.ts
│   │   └── index.ts
│   ├── ClusterVisualization/
│   │   ├── ClusterVisualization.tsx      # Cluster card (150 lines)
│   │   ├── ClusterVisualization.test.tsx
│   │   ├── ClusterBadge.tsx              # Badge component (40 lines)
│   │   ├── types.ts
│   │   └── index.ts
│   └── index.ts
├── hooks/
│   ├── useManagerSorting.ts              # Sorting logic (80 lines)
│   ├── useManagerSorting.test.ts
│   ├── useManagerFiltering.ts            # Filtering logic (60 lines)
│   ├── useManagerFiltering.test.ts
│   └── index.ts
├── utils/
│   ├── formatting.ts                     # formatCurrency, etc (50 lines)
│   ├── formatting.test.ts
│   ├── colors.ts                         # getClusterBadgeColor (30 lines)
│   ├── colors.test.ts
│   ├── sorting.ts                        # Sort functions (100 lines)
│   ├── sorting.test.ts
│   └── index.ts
├── types.ts                              # Feature-level types
└── index.ts                              # ONLY exports main component
```

### 2. Main Component (120 lines)

````typescript
// apps/web/src/features/manager-analysis/components/ManagerAnalysis/ManagerAnalysis.tsx
'use client';

import { useState } from 'react';
import type { ManagerAnalysisProps } from './types';
import { ClusterVisualization } from '../ClusterVisualization';
import { ManagerFilters } from '../ManagerFilters';
import { ManagerTable } from '../ManagerTable';
import { useManagerFiltering } from '../../hooks/useManagerFiltering';
import { useManagerSorting } from '../../hooks/useManagerSorting';

/**
 * Displays comprehensive manager behavior analysis across draft leagues.
 *
 * Includes cluster visualization, filtering, and detailed manager profiles
 * with sortable metrics.
 *
 * @param props - Component props
 * @param props.analytics - Pre-computed manager analytics from draft engine
 *
 * @example
 * ```tsx
 * <ManagerAnalysis analytics={draftAnalytics} />
 * ```
 */
const ManagerAnalysis = (props: ManagerAnalysisProps) => {
  const { analytics } = props;

  // State management
  const [selectedCluster, setSelectedCluster] = useState<string>('all');

  // Custom hooks for business logic
  const { filteredProfiles, filterConfig, updateFilter } = useManagerFiltering({
    profiles: analytics.profiles,
    selectedCluster,
  });

  const { sortedProfiles, sortConfig, handleSort } = useManagerSorting({
    profiles: filteredProfiles,
  });

  return (
    <div className="space-y-6">
      {/* Cluster visualization */}
      <ClusterVisualization
        clusters={analytics.clusters}
        profiles={analytics.profiles}
        selectedCluster={selectedCluster}
        onClusterSelect={setSelectedCluster}
      />

      {/* Filters and table */}
      <ManagerFilters
        selectedCluster={selectedCluster}
        onClusterChange={setSelectedCluster}
        filterConfig={filterConfig}
        onFilterChange={updateFilter}
      />

      <ManagerTable
        profiles={sortedProfiles}
        sortConfig={sortConfig}
        onSort={handleSort}
      />
    </div>
  );
};

// Export memoized version with transparency
const ManagerAnalysisMemo = memo(ManagerAnalysis);
export { ManagerAnalysisMemo as ManagerAnalysis };
````

### 3. Custom Hook: useManagerSorting

```typescript
// apps/web/src/features/manager-analysis/hooks/useManagerSorting.ts
import { useState, useMemo, useCallback } from 'react';
import type { ManagerProfile } from '../types';
import type { SortConfig, SortKey } from './types';
import { sortProfiles } from '../utils/sorting';

interface UseManagerSortingProps {
  profiles: ManagerProfile[];
}

interface UseManagerSortingReturn {
  sortedProfiles: ManagerProfile[];
  sortConfig: SortConfig | null;
  handleSort: (key: SortKey) => void;
}

/**
 * Handles sorting logic for manager profiles.
 *
 * Provides sortable profiles with configurable sort direction toggling.
 *
 * @param props - Hook props
 * @param props.profiles - Manager profiles to sort
 * @returns Sorted profiles, sort config, and sort handler
 */
export const useManagerSorting = (
  props: UseManagerSortingProps
): UseManagerSortingReturn => {
  const { profiles } = props;

  const [sortConfig, setSortConfig] = useState<SortConfig | null>(null);

  const handleSort = useCallback(
    (key: SortKey) => {
      let direction: 'asc' | 'desc' = 'desc';

      if (
        sortConfig &&
        sortConfig.key === key &&
        sortConfig.direction === 'desc'
      ) {
        direction = 'asc';
      }

      setSortConfig({ key, direction });
    },
    [sortConfig]
  );

  const sortedProfiles = useMemo(() => {
    if (!sortConfig) return profiles;
    return sortProfiles(profiles, sortConfig);
  }, [profiles, sortConfig]);

  return {
    sortedProfiles,
    sortConfig,
    handleSort,
  };
};
```

```typescript
// apps/web/src/features/manager-analysis/hooks/useManagerSorting.test.ts
import { renderHook, act } from '@testing-library/react';
import { useManagerSorting } from './useManagerSorting';
import { ManagerProfileFactory } from '../__tests__/factories';

describe('useManagerSorting', () => {
  it('should sort profiles by gini coefficient descending by default', () => {
    const profiles = [
      ManagerProfileFactory.create({ concentration: { giniSpend: 0.3 } }),
      ManagerProfileFactory.create({ concentration: { giniSpend: 0.5 } }),
      ManagerProfileFactory.create({ concentration: { giniSpend: 0.4 } }),
    ];

    const { result } = renderHook(() => useManagerSorting({ profiles }));

    act(() => {
      result.current.handleSort('gini');
    });

    expect(result.current.sortedProfiles[0].concentration.giniSpend).toBe(0.5);
    expect(result.current.sortedProfiles[1].concentration.giniSpend).toBe(0.4);
    expect(result.current.sortedProfiles[2].concentration.giniSpend).toBe(0.3);
  });

  it('should toggle sort direction on second click', () => {
    const profiles = [
      ManagerProfileFactory.create({ concentration: { giniSpend: 0.3 } }),
      ManagerProfileFactory.create({ concentration: { giniSpend: 0.5 } }),
    ];

    const { result } = renderHook(() => useManagerSorting({ profiles }));

    act(() => {
      result.current.handleSort('gini');
    });

    expect(result.current.sortConfig?.direction).toBe('desc');

    act(() => {
      result.current.handleSort('gini');
    });

    expect(result.current.sortConfig?.direction).toBe('asc');
    expect(result.current.sortedProfiles[0].concentration.giniSpend).toBe(0.3);
  });
});
```

### 4. Sub-component: ManagerTable

```typescript
// apps/web/src/features/manager-analysis/components/ManagerTable/ManagerTable.tsx
import type { ManagerTableProps } from './types';
import { ManagerTableRow } from './ManagerTableRow';
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

/**
 * Table component displaying manager profiles with sortable columns.
 *
 * @param props - Component props
 */
const ManagerTable = (props: ManagerTableProps) => {
  const { profiles, sortConfig, onSort } = props;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Manager Profiles</CardTitle>
        <CardDescription>
          Detailed breakdown of manager behavior and draft strategy
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead onClick={() => onSort('manager')}>
                Manager {sortConfig?.key === 'manager' && '↕'}
              </TableHead>
              <TableHead onClick={() => onSort('league')}>
                League {sortConfig?.key === 'league' && '↕'}
              </TableHead>
              <TableHead onClick={() => onSort('gini')}>
                Gini Coefficient {sortConfig?.key === 'gini' && '↕'}
              </TableHead>
              {/* More sortable headers */}
            </TableRow>
          </TableHeader>
          <TableBody>
            {profiles.map((profile) => (
              <ManagerTableRow
                key={`${profile.manager}-${profile.league}`}
                profile={profile}
              />
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

const ManagerTableMemo = memo(ManagerTable);
export { ManagerTableMemo as ManagerTable };
```

### 5. Utility Functions

````typescript
// apps/web/src/features/manager-analysis/utils/formatting.ts

/**
 * Formats a number as USD currency without cents.
 *
 * @param value - Numeric value to format
 * @returns Formatted currency string (e.g., "$100")
 *
 * @example
 * ```typescript
 * formatCurrency(100.5) // "$100"
 * formatCurrency(1234.99) // "$1,235"
 * ```
 */
export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

/**
 * Formats a decimal as a percentage.
 *
 * @param value - Decimal value (0-1)
 * @param decimals - Number of decimal places (default: 1)
 * @returns Formatted percentage string (e.g., "45.2%")
 */
export const formatPercentage = (value: number, decimals = 1): string => {
  return `${(value * 100).toFixed(decimals)}%`;
};
````

```typescript
// apps/web/src/features/manager-analysis/utils/formatting.test.ts
import { formatCurrency, formatPercentage } from './formatting';

describe('formatting utils', () => {
  describe('formatCurrency', () => {
    it('should format whole numbers', () => {
      expect(formatCurrency(100)).toBe('$100');
      expect(formatCurrency(1234)).toBe('$1,234');
    });

    it('should round decimals', () => {
      expect(formatCurrency(100.4)).toBe('$100');
      expect(formatCurrency(100.6)).toBe('$101');
    });

    it('should handle zero', () => {
      expect(formatCurrency(0)).toBe('$0');
    });

    it('should handle negative values', () => {
      expect(formatCurrency(-50)).toBe('-$50');
    });
  });

  describe('formatPercentage', () => {
    it('should format decimals as percentages', () => {
      expect(formatPercentage(0.452)).toBe('45.2%');
      expect(formatPercentage(0.1)).toBe('10.0%');
    });

    it('should respect decimal places', () => {
      expect(formatPercentage(0.12345, 2)).toBe('12.35%');
      expect(formatPercentage(0.12345, 0)).toBe('12%');
    });
  });
});
```

### 6. Types

```typescript
// apps/web/src/features/manager-analysis/types.ts
import type { ManagerProfile } from '@/lib/manager-analytics';

/**
 * Props for ManagerAnalysis component
 */
export interface ManagerAnalysisProps {
  /** Pre-computed manager analytics from draft engine */
  analytics: ManagerAnalytics;
}

/**
 * Sort configuration
 */
export interface SortConfig {
  key: SortKey;
  direction: 'asc' | 'desc';
}

/**
 * Valid sort keys for manager profiles
 */
export type SortKey =
  | 'manager'
  | 'league'
  | 'gini'
  | 'top1'
  | 'top2'
  | 'top3'
  | 'patience_score'
  | 'cluster';

// Re-export for convenience
export type { ManagerProfile, ManagerAnalytics } from '@/lib/manager-analytics';
```

```typescript
// apps/web/src/features/manager-analysis/components/ManagerTable/types.ts
import type { ManagerProfile, SortConfig, SortKey } from '../../types';

/**
 * Props for ManagerTable component
 */
export interface ManagerTableProps {
  /** Manager profiles to display */
  profiles: ManagerProfile[];
  /** Current sort configuration */
  sortConfig: SortConfig | null;
  /** Handler for sort requests */
  onSort: (key: SortKey) => void;
}

/**
 * Props for ManagerTableRow component
 */
export interface ManagerTableRowProps {
  /** Manager profile data for this row */
  profile: ManagerProfile;
}
```

### 7. Barrel Exports

```typescript
// apps/web/src/features/manager-analysis/index.ts
/**
 * IMPORTANT: Features only export components that are used by routes.
 * This prevents cross-feature imports.
 * If you need to break this rule, use eslint-disable statements.
 */
export { ManagerAnalysis } from './components/ManagerAnalysis';
export type { ManagerAnalysisProps } from './types';
```

```typescript
// apps/web/src/features/manager-analysis/components/index.ts
export { ManagerAnalysis } from './ManagerAnalysis';
export { ManagerTable } from './ManagerTable';
export { ManagerFilters } from './ManagerFilters';
export { ClusterVisualization } from './ClusterVisualization';
```

```typescript
// apps/web/src/features/manager-analysis/hooks/index.ts
export { useManagerSorting } from './useManagerSorting';
export { useManagerFiltering } from './useManagerFiltering';
export type {
  UseManagerSortingProps,
  UseManagerSortingReturn,
} from './useManagerSorting';
export type {
  UseManagerFilteringProps,
  UseManagerFilteringReturn,
} from './useManagerFiltering';
```

### 8. Test Factory

```typescript
// apps/web/src/features/manager-analysis/__tests__/factories/managerProfileFactory.ts
import _cloneDeep from 'lodash/cloneDeep';
import _merge from 'lodash/merge';
import type { ManagerProfile } from '../../types';

const DEFAULT_PROFILE: ManagerProfile = {
  manager: 'Test Manager',
  league: 'LEAGUE_A',
  concentration: {
    top1_share: 0.2,
    top2_share: 0.35,
    top3_share: 0.5,
    top4_share: 0.6,
    top5_share: 0.7,
    giniSpend: 0.45,
  },
  pacing: {
    patienceQ1: 0.3,
    patienceQ2: 0.25,
    patienceQ3: 0.25,
    patienceQ4: 0.2,
    patience_score: 0.65,
    time_to_first_30: 5,
    last_starter_index: 12,
    avg_starter_nom_index: 8.5,
    avg_bench_nom_index: 18.2,
  },
  spend_shares: {
    pctQB: 0.15,
    pctRB: 0.35,
    pctWR: 0.35,
    pctTE: 0.08,
    pctDEF: 0.02,
    pctStarters: 0.85,
    pctBench: 0.15,
  },
  cluster: {
    cluster_id: 1,
    cluster_label: 'Balanced Builder',
    silhouette_score: 0.7,
  },
};

/**
 * Factory for creating ManagerProfile test data
 */
export const ManagerProfileFactory = {
  /**
   * Creates a manager profile with optional overrides
   *
   * @param overrides - Partial manager profile to merge with defaults
   * @returns Complete ManagerProfile object
   */
  create: (overrides: Partial<ManagerProfile> = {}): ManagerProfile => {
    return _merge(_cloneDeep(DEFAULT_PROFILE), overrides);
  },

  /**
   * Creates multiple manager profiles
   */
  createMany: (
    count: number,
    overrides: Partial<ManagerProfile> = []
  ): ManagerProfile[] => {
    return Array.from({ length: count }, (_, i) =>
      ManagerProfileFactory.create({
        manager: `Manager ${i + 1}`,
        ...overrides,
      })
    );
  },

  /**
   * Creates a profile with high concentration
   */
  createStarStacker: (): ManagerProfile => {
    return ManagerProfileFactory.create({
      concentration: {
        top1_share: 0.35,
        top2_share: 0.55,
        top3_share: 0.7,
        giniSpend: 0.65,
      },
      cluster: {
        cluster_id: 2,
        cluster_label: 'Star Stacker',
        silhouette_score: 0.75,
      },
    });
  },
};
```

---

## Results: Metrics Comparison

| Metric                | Before      | After          | Improvement                       |
| --------------------- | ----------- | -------------- | --------------------------------- |
| **Total Lines**       | 1,625       | ~1,200         | 🟢 -26% (spread across 15+ files) |
| **Largest File**      | 1,625 lines | 200 lines      | 🟢 -88%                           |
| **Files**             | 1           | 17             | 🟢 Better organization            |
| **Components**        | 1 monolith  | 7 focused      | 🟢 Single Responsibility          |
| **Custom Hooks**      | 0           | 2              | 🟢 Reusable logic                 |
| **Utility Functions** | Inline      | 6 functions    | 🟢 Testable                       |
| **Test Coverage**     | 0%          | 80%+           | 🟢 +80%                           |
| **Type Files**        | 0           | 3              | 🟢 Clear interfaces               |
| **JSDoc Comments**    | 0           | 15+            | 🟢 Self-documenting               |
| **Memoization**       | None        | All components | 🟢 Performance                    |

---

## Benefits Achieved

### 1. Maintainability ✅

- **Single Responsibility**: Each file has one clear purpose
- **Easy Navigation**: Feature-based folders make code easy to find
- **Clear Dependencies**: Import paths show relationships

### 2. Testability ✅

- **Isolated Logic**: Hooks and utils are independently testable
- **Test Factories**: Consistent test data generation
- **Full Coverage**: Every function has tests

### 3. Reusability ✅

- **Custom Hooks**: `useManagerSorting` can be used elsewhere
- **Utility Functions**: `formatCurrency` is shared across features
- **Sub-components**: `ClusterBadge` can be used independently

### 4. Performance ✅

- **Memoization**: All components memoized to prevent re-renders
- **Computed Values**: Moved to custom hooks with proper dependencies
- **Code Splitting**: Smaller components = better tree-shaking

### 5. Developer Experience ✅

- **Type Safety**: Explicit types for all props and returns
- **JSDoc**: Inline documentation with examples
- **Storybook**: Visual component development
- **Clear Patterns**: Easy for new developers to follow

---

## Migration Strategy

### Step 1: Create Folder Structure

```bash
mkdir -p apps/web/src/features/manager-analysis/{components,hooks,utils,__tests__/factories}
mkdir -p apps/web/src/features/manager-analysis/components/{ManagerAnalysis,ManagerTable,ManagerFilters,ClusterVisualization}
```

### Step 2: Extract Types First

- Move all interfaces to `types.ts`
- Update imports in original file
- Verify no TypeScript errors

### Step 3: Extract Utils & Test

- Move helper functions to `utils/`
- Write tests for each utility
- Update imports

### Step 4: Extract Hooks & Test

- Extract sorting logic to `useManagerSorting`
- Extract filtering logic to `useManagerFiltering`
- Write hook tests
- Update main component

### Step 5: Extract Sub-components

- Create `ManagerTable` component
- Create `ManagerFilters` component
- Create `ClusterVisualization` component
- Update main component to use sub-components

### Step 6: Memoize & Polish

- Add `memo()` to all components
- Add JSDoc comments
- Create Storybook stories
- Final testing pass

### Step 7: Update Imports

- Update route files to use new path
- Remove old file
- Run full test suite

---

## Key Takeaways

1. **Start with types** - Establish clear interfaces first
2. **Extract utilities early** - Get testable functions isolated
3. **Custom hooks for logic** - Move complex state management out of components
4. **Sub-components for UI** - Break down JSX into logical pieces
5. **Test as you go** - Write tests while refactoring, not after
6. **Document with JSDoc** - Make code self-documenting
7. **Memoize components** - Prevent unnecessary re-renders

This pattern can be applied to:

- ✅ `manager-analytics.ts` (1,347 lines) → 15+ files
- ✅ `draft-analytics.ts` (650 lines) → 10+ files
- ✅ `hooks.ts` (726 lines) → 15+ hooks
- ✅ All large components in the codebase
