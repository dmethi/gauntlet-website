# WEB-COMP-001: Split Manager Analysis Component

**Category**: COMP (Component Splitting)  
**Priority**: 🔴 CRITICAL  
**Estimated Time**: 2.5 hours  
**Dependencies**: WEB-HOOK-001, WEB-HOOK-002

---

## Objective

Break down `manager-analysis.tsx` (1,535 lines) into maintainable sub-components with proper separation of concerns, following the factory pattern and arrow function standards.

---

## Current State

**File**: `apps/web/src/components/manager-analysis.tsx`  
**Lines**: 1,535 lines  
**Issues**:
- Monolithic component with 6 distinct sections
- Helper functions defined inline (200+ lines)
- Complex table rendering logic repeated
- No memoization (performance issues)
- Hard to test individual sections

**Component Structure** (identified sections):
1. **Concentration Metrics Table** (lines 243-482) - Gini coefficient and top N% spending
2. **Player Overlap Analysis** (lines 483-587) - Cross-league player selection patterns
3. **Player Overlap by Count** (lines 588-675) - Manager pairs grouped by shared players
4. **Cross-League Price Differences** (lines 676-929) - Draft price comparisons
5. **Positional Allocation Heatmap** (lines 930-1186) - Position spending heatmap
6. **Detailed Performance Metrics** (lines 1187-1535) - Advanced analytics tables

---

## Context Needed

**Read these files**:
1. `apps/web/src/components/manager-analysis.tsx` (lines 1-100, 230-250, 483-500, 930-950)
2. `apps/web/src/features/draft-analysis/types.ts` (all lines)
3. `apps/web/src/features/draft-analysis/hooks/useManagerFiltering.ts` (all lines)
4. `apps/web/src/features/draft-analysis/hooks/useManagerSorting.ts` (all lines)

**Total Context**: ~400 lines

---

## Target Structure

```
apps/web/src/features/draft-analysis/components/
├── ManagerAnalysis/
│   ├── ManagerAnalysis.tsx              # Main component (~150 lines)
│   ├── ManagerAnalysis.test.tsx         # Tests
│   ├── ConcentrationMetricsTable.tsx    # Table component (~200 lines)
│   ├── ConcentrationMetricsTable.test.tsx
│   ├── PlayerOverlapAnalysis.tsx        # Overlap stats (~150 lines)
│   ├── PlayerOverlapAnalysis.test.tsx
│   ├── PlayerOverlapByCount.tsx         # Grouped overlaps (~120 lines)
│   ├── OverlapCountTable.tsx            # Sub-component (~100 lines)
│   ├── CrossLeaguePriceDiff.tsx         # Price comparison (~200 lines)
│   ├── PriceComparisonTable.tsx         # Sub-component (~150 lines)
│   ├── PositionalAllocationHeatmap.tsx  # Heatmap display (~180 lines)
│   ├── PositionalAllocationHeatmap.test.tsx
│   ├── DetailedPerformanceMetrics.tsx   # Advanced metrics (~250 lines)
│   ├── DetailedPerformanceMetrics.test.tsx
│   ├── utils.ts                          # Shared utilities
│   ├── utils.test.ts
│   └── index.ts                          # Barrel export
```

---

## Steps

### Step 1: Create Directory Structure (5 min)

```bash
cd /Users/dhruv.methi/Documents/GitHub/gauntlet-website/apps/web/src

# Create component directory
mkdir -p features/draft-analysis/components/ManagerAnalysis

# Create barrel export
touch features/draft-analysis/components/ManagerAnalysis/index.ts
```

---

### Step 2: Extract Utility Functions (20 min)

Create `features/draft-analysis/components/ManagerAnalysis/utils.ts`:

```typescript
/**
 * Utility functions for Manager Analysis component
 * Extracted from manager-analysis.tsx for reusability and testing
 */

import { dataVizColors } from '../../../../../../../brand/colors';

/**
 * Generates heatmap color based on value position within min-max range
 * @param value - Current value to color
 * @param max - Maximum value in dataset
 * @param min - Minimum value in dataset
 * @returns CSS color string from brand color palette
 */
export const getHeatmapColor = (value: number, max: number, min: number): string => {
  if (max === min) return dataVizColors.intensity[2];

  const normalized = (value - min) / (max - min);
  const intensity = Math.max(0, Math.min(1, normalized));

  const colorIndex = Math.floor(intensity * (dataVizColors.intensity.length - 1));
  return dataVizColors.intensity[colorIndex];
};

/**
 * Calculate relative luminance using WCAG formula
 * @param r - Red channel (0-255)
 * @param g - Green channel (0-255)
 * @param b - Blue channel (0-255)
 * @returns Relative luminance (0-1)
 */
const calculateLuminance = (r: number, g: number, b: number): number => {
  const [rs, gs, bs] = [r, g, b].map(val => {
    const sRGB = val / 255;
    return sRGB <= 0.03928 ? sRGB / 12.92 : Math.pow((sRGB + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
};

/**
 * Parse RGB values from CSS color string (supports rgb(), rgba(), and hex formats)
 * @param color - CSS color string
 * @returns Object with r, g, b values (0-255)
 */
const parseRgb = (color: string): { r: number; g: number; b: number } => {
  // Handle rgba() format
  const rgbaMatch = color.match(/rgba\\((\\d+),\\s*(\\d+),\\s*(\\d+),\\s*[\\d.]+\\)/);
  if (rgbaMatch) {
    return {
      r: parseInt(rgbaMatch[1]),
      g: parseInt(rgbaMatch[2]),
      b: parseInt(rgbaMatch[3]),
    };
  }

  // Handle rgb() format
  const rgbMatch = color.match(/rgb\\((\\d+),\\s*(\\d+),\\s*(\\d+)\\)/);
  if (rgbMatch) {
    return {
      r: parseInt(rgbMatch[1]),
      g: parseInt(rgbMatch[2]),
      b: parseInt(rgbMatch[3]),
    };
  }

  // Handle hex format
  if (color.startsWith('#')) {
    const hex = color.slice(1);
    const num = parseInt(hex.length === 3 
      ? hex.split('').map(c => c + c).join('')
      : hex, 16);
    return {
      r: (num >> 16) & 255,
      g: (num >> 8) & 255,
      b: num & 255,
    };
  }

  return { r: 255, g: 255, b: 255 };
};

/**
 * Calculate contrast ratio between two luminance values using WCAG formula
 * @param L1 - First luminance value
 * @param L2 - Second luminance value
 * @returns Contrast ratio (1-21)
 */
const contrastRatio = (L1: number, L2: number): number => {
  const lighter = Math.max(L1, L2);
  const darker = Math.min(L1, L2);
  return (lighter + 0.05) / (darker + 0.05);
};

/**
 * Determines text color (white or empty string for default) based on background color
 * Uses WCAG contrast ratio calculation to ensure readability
 * @param backgroundColor - CSS background color string
 * @param debugLabel - Optional label for debugging (not used in production)
 * @returns 'text-white' if white text is needed, '' for default text color
 */
export const getContrastingTextColor = (
  backgroundColor: string,
  debugLabel?: string
): string => {
  if (!backgroundColor || backgroundColor === 'transparent') {
    return '';
  }

  const rgb = parseRgb(backgroundColor);
  const bgLuminance = calculateLuminance(rgb.r, rgb.g, rgb.b);

  const whiteContrast = contrastRatio(1.0, bgLuminance);
  const blackContrast = contrastRatio(0.0, bgLuminance);

  return whiteContrast > blackContrast ? 'text-white' : '';
};

/**
 * Get badge variant for cluster label
 * @param clusterLabel - Cluster name
 * @returns Badge variant string
 */
export const getClusterBadgeVariant = (
  clusterLabel: string
): 'destructive' | 'default' | 'secondary' | 'outline' => {
  switch (clusterLabel) {
    case 'Stars & Scrubs':
      return 'destructive';
    case 'Balanced Build':
      return 'default';
    case 'Patience Sniper':
      return 'secondary';
    case 'Hero RB':
    case 'Ground & Pound':
      return 'outline';
    case 'WR Elite':
    case 'Receiver Corps':
      return 'outline';
    case 'Premium QB':
      return 'secondary';
    case 'TE Premium':
      return 'outline';
    case 'Early Bird':
      return 'destructive';
    case 'Depth Builder':
      return 'secondary';
    default:
      return 'outline';
  }
};

/**
 * Calculate percentage formatting (e.g., 0.234 -> "23.4%")
 * @param value - Decimal value (0-1)
 * @returns Formatted percentage string
 */
export const formatPercentage = (value: number): string => {
  return `${(value * 100).toFixed(1)}%`;
};
```

Create test file `features/draft-analysis/components/ManagerAnalysis/utils.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';
import {
  getHeatmapColor,
  getContrastingTextColor,
  getClusterBadgeVariant,
  formatPercentage,
} from './utils';

describe('ManagerAnalysis Utils', () => {
  describe('getHeatmapColor', () => {
    it('returns middle color when max equals min', () => {
      const result = getHeatmapColor(5, 5, 5);
      expect(result).toBeDefined();
    });

    it('returns color for value in range', () => {
      const result = getHeatmapColor(5, 10, 0);
      expect(result).toBeDefined();
    });
  });

  describe('getContrastingTextColor', () => {
    it('returns empty string for transparent background', () => {
      expect(getContrastingTextColor('transparent')).toBe('');
    });

    it('returns text-white for dark backgrounds', () => {
      expect(getContrastingTextColor('#000000')).toBe('text-white');
    });

    it('returns empty string for light backgrounds', () => {
      expect(getContrastingTextColor('#FFFFFF')).toBe('');
    });
  });

  describe('getClusterBadgeVariant', () => {
    it('returns correct variant for Stars & Scrubs', () => {
      expect(getClusterBadgeVariant('Stars & Scrubs')).toBe('destructive');
    });

    it('returns default for unknown cluster', () => {
      expect(getClusterBadgeVariant('Unknown')).toBe('outline');
    });
  });

  describe('formatPercentage', () => {
    it('formats decimal as percentage', () => {
      expect(formatPercentage(0.234)).toBe('23.4%');
    });
  });
});
```

---

### Step 3: Create ConcentrationMetricsTable Component (30 min)

Create `features/draft-analysis/components/ManagerAnalysis/ConcentrationMetricsTable.tsx`:

```typescript
'use client';

import React, { memo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { InfoTooltip } from '@/components/ui/info-tooltip';
import { Target } from 'lucide-react';
import { getHeatmapColor, getContrastingTextColor } from './utils';
import type { ManagerProfile, SortConfig } from '@/features/draft-analysis/types';

interface ConcentrationMetricsTableProps {
  profiles: ManagerProfile[];
  sortConfig: SortConfig | null;
  onSort: (key: string) => void;
}

export const ConcentrationMetricsTable = memo<ConcentrationMetricsTableProps>(
  ({ profiles, sortConfig, onSort }) => {
    // Calculate ranges for coloring each metric
    const allGini = profiles.map(p => p.concentration.giniSpend);
    const allTop1 = profiles.map(p => p.concentration.top1_share);
    const allTop2 = profiles.map(p => p.concentration.top2_share);
    const allTop3 = profiles.map(p => p.concentration.top3_share);
    const allTop4 = profiles.map(p => p.concentration.top4_share);
    const allTop5 = profiles.map(p => p.concentration.top5_share);

    const maxGini = Math.max(...allGini);
    const minGini = Math.min(...allGini);
    const maxTop1 = Math.max(...allTop1);
    const minTop1 = Math.min(...allTop1);
    const maxTop2 = Math.max(...allTop2);
    const minTop2 = Math.min(...allTop2);
    const maxTop3 = Math.max(...allTop3);
    const minTop3 = Math.min(...allTop3);
    const maxTop4 = Math.max(...allTop4);
    const minTop4 = Math.min(...allTop4);
    const maxTop5 = Math.max(...allTop5);
    const minTop5 = Math.min(...allTop5);

    const getSortIcon = (key: string): string => {
      if (sortConfig?.key !== key) return '';
      return sortConfig.direction === 'asc' ? '↑' : '↓';
    };

    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Concentration Metrics
          </CardTitle>
          <CardDescription>
            Spending concentration by manager - click headers to sort
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => onSort('manager')}
                  >
                    Manager {getSortIcon('manager')}
                  </TableHead>
                  <TableHead
                    className="text-center cursor-pointer hover:bg-muted/50"
                    onClick={() => onSort('league')}
                  >
                    League {getSortIcon('league')}
                  </TableHead>
                  <TableHead
                    className="text-center cursor-pointer hover:bg-muted/50"
                    onClick={() => onSort('gini')}
                  >
                    <InfoTooltip
                      title="Gini Coefficient"
                      description="Measures spending inequality. 0 = perfectly equal, 1 = maximum concentration"
                      interpretation="Higher values indicate more top-heavy spending (stars & scrubs approach)"
                    />
                    Gini {getSortIcon('gini')}
                  </TableHead>
                  <TableHead
                    className="text-center cursor-pointer hover:bg-muted/50"
                    onClick={() => onSort('top1')}
                  >
                    <InfoTooltip
                      title="Top Player %"
                      description="Percentage of budget spent on highest-priced player"
                      interpretation="Stars & Scrubs builds typically show 25%+ on top player"
                    />
                    Top 1% {getSortIcon('top1')}
                  </TableHead>
                  <TableHead
                    className="text-center cursor-pointer hover:bg-muted/50"
                    onClick={() => onSort('top2')}
                  >
                    <InfoTooltip
                      title="Top 2 Players %"
                      description="Percentage of budget spent on two highest-priced players"
                      interpretation="Elite duo approach typically shows 40%+ on top 2"
                    />
                    Top 2% {getSortIcon('top2')}
                  </TableHead>
                  <TableHead
                    className="text-center cursor-pointer hover:bg-muted/50"
                    onClick={() => onSort('top3')}
                  >
                    <InfoTooltip
                      title="Top 3 Players %"
                      description="Percentage of budget spent on three highest-priced players"
                      interpretation="Core trio strategy typically shows 55%+ on top 3"
                    />
                    Top 3% {getSortIcon('top3')}
                  </TableHead>
                  <TableHead
                    className="text-center cursor-pointer hover:bg-muted/50"
                    onClick={() => onSort('top4')}
                  >
                    <InfoTooltip
                      title="Top 4 Players %"
                      description="Percentage of budget spent on four highest-priced players"
                      interpretation="Balanced approach typically shows 60-70% on top 4"
                    />
                    Top 4% {getSortIcon('top4')}
                  </TableHead>
                  <TableHead
                    className="text-center cursor-pointer hover:bg-muted/50"
                    onClick={() => onSort('top5')}
                  >
                    <InfoTooltip
                      title="Top 5 Players %"
                      description="Percentage of budget spent on five highest-priced players"
                      interpretation="Shows how much remains for depth after core investments"
                    />
                    Top 5% {getSortIcon('top5')}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {profiles.slice(0, 100).map((profile, index) => (
                  <TableRow
                    key={`concentration-${profile.manager || 'mgr'}-${profile.league || 'lg'}-${index}`}
                  >
                    <TableCell className="font-medium">
                      {profile.manager || 'Unknown Manager'}
                    </TableCell>
                    <TableCell className="text-center text-sm">{profile.league}</TableCell>

                    {/* Gini */}
                    <TableCell
                      className={`text-center ${getContrastingTextColor(
                        getHeatmapColor(profile.concentration.giniSpend, maxGini, minGini)
                      )}`}
                      style={{
                        backgroundColor: getHeatmapColor(
                          profile.concentration.giniSpend,
                          maxGini,
                          minGini
                        ),
                      }}
                    >
                      {profile.concentration.giniSpend.toFixed(3)}
                    </TableCell>

                    {/* Top 1% */}
                    <TableCell
                      className={`text-center ${getContrastingTextColor(
                        getHeatmapColor(profile.concentration.top1_share, maxTop1, minTop1)
                      )}`}
                      style={{
                        backgroundColor: getHeatmapColor(
                          profile.concentration.top1_share,
                          maxTop1,
                          minTop1
                        ),
                      }}
                    >
                      {(profile.concentration.top1_share * 100).toFixed(1)}%
                    </TableCell>

                    {/* Top 2% */}
                    <TableCell
                      className={`text-center ${getContrastingTextColor(
                        getHeatmapColor(profile.concentration.top2_share, maxTop2, minTop2)
                      )}`}
                      style={{
                        backgroundColor: getHeatmapColor(
                          profile.concentration.top2_share,
                          maxTop2,
                          minTop2
                        ),
                      }}
                    >
                      {(profile.concentration.top2_share * 100).toFixed(1)}%
                    </TableCell>

                    {/* Top 3% */}
                    <TableCell
                      className={`text-center ${getContrastingTextColor(
                        getHeatmapColor(profile.concentration.top3_share, maxTop3, minTop3)
                      )}`}
                      style={{
                        backgroundColor: getHeatmapColor(
                          profile.concentration.top3_share,
                          maxTop3,
                          minTop3
                        ),
                      }}
                    >
                      {(profile.concentration.top3_share * 100).toFixed(1)}%
                    </TableCell>

                    {/* Top 4% */}
                    <TableCell
                      className={`text-center ${getContrastingTextColor(
                        getHeatmapColor(profile.concentration.top4_share, maxTop4, minTop4)
                      )}`}
                      style={{
                        backgroundColor: getHeatmapColor(
                          profile.concentration.top4_share,
                          maxTop4,
                          minTop4
                        ),
                      }}
                    >
                      {(profile.concentration.top4_share * 100).toFixed(1)}%
                    </TableCell>

                    {/* Top 5% */}
                    <TableCell
                      className={`text-center ${getContrastingTextColor(
                        getHeatmapColor(profile.concentration.top5_share, maxTop5, minTop5)
                      )}`}
                      style={{
                        backgroundColor: getHeatmapColor(
                          profile.concentration.top5_share,
                          maxTop5,
                          minTop5
                        ),
                      }}
                    >
                      {(profile.concentration.top5_share * 100).toFixed(1)}%
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    );
  }
);

ConcentrationMetricsTable.displayName = 'ConcentrationMetricsTable';
```

---

### Step 4: Create Remaining Sub-Components (60 min)

Due to space constraints, I'll provide the structure. Each component should follow the pattern above:

1. **PlayerOverlapAnalysis.tsx** (~150 lines)
   - Extract lines 483-587 from original
   - Use `memo()` for performance
   - Props: `analytics: ManagerAnalytics`

2. **PlayerOverlapByCount.tsx** (~120 lines)
   - Extract lines 588-675 from original
   - Use `memo()` for performance
   - Props: `overlaps: PlayerOverlap[]`

3. **CrossLeaguePriceDiff.tsx** (~200 lines)
   - Extract lines 676-929 from original
   - Use `memo()` for performance
   - Sub-component: `PriceComparisonTable` (~100 lines)
   - Props: `analytics: ManagerAnalytics`

4. **PositionalAllocationHeatmap.tsx** (~180 lines)
   - Extract lines 930-1186 from original
   - Use `memo()` for performance
   - Props: `profiles: ManagerProfile[], sortBy: string, onSortChange: (value: string) => void`

5. **DetailedPerformanceMetrics.tsx** (~250 lines)
   - Extract lines 1187-1535 from original
   - Use `memo()` for performance
   - Props: `profiles: ManagerProfile[]`

---

### Step 5: Create Main ManagerAnalysis Component (25 min)

Create `features/draft-analysis/components/ManagerAnalysis/ManagerAnalysis.tsx`:

```typescript
'use client';

import React from 'react';
import { ManagerAnalysisProps } from '@/features/draft-analysis/types';
import { useManagerFiltering, useManagerSorting } from '@/features/draft-analysis/hooks';
import { ConcentrationMetricsTable } from './ConcentrationMetricsTable';
import { PlayerOverlapAnalysis } from './PlayerOverlapAnalysis';
import { PlayerOverlapByCount } from './PlayerOverlapByCount';
import { CrossLeaguePriceDiff } from './CrossLeaguePriceDiff';
import { PositionalAllocationHeatmap } from './PositionalAllocationHeatmap';
import { DetailedPerformanceMetrics } from './DetailedPerformanceMetrics';

export const ManagerAnalysis: React.FC<ManagerAnalysisProps> = ({ analytics }) => {
  // Use custom hooks for filtering and sorting
  const { selectedCluster, setSelectedCluster, filteredProfiles } = useManagerFiltering(
    analytics.profiles
  );

  const { sortConfig, sortBy, setSortBy, handleSort, sortedProfiles } = useManagerSorting(
    filteredProfiles,
    'concentration'
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold mb-2">Manager Behavior Profiles</h2>
        <p className="text-muted-foreground">
          Comprehensive analysis of draft strategies, spending patterns, and roster construction
        </p>
      </div>

      {/* Concentration Metrics */}
      <ConcentrationMetricsTable
        profiles={sortedProfiles}
        sortConfig={sortConfig}
        onSort={handleSort}
      />

      {/* Player Overlap Analysis */}
      <PlayerOverlapAnalysis analytics={analytics} />

      {/* Player Overlap by Count */}
      <PlayerOverlapByCount overlaps={analytics.player_overlaps} />

      {/* Cross-League Price Differences */}
      <CrossLeaguePriceDiff analytics={analytics} />

      {/* Positional Allocation Heatmap */}
      <PositionalAllocationHeatmap
        profiles={sortedProfiles}
        sortBy={sortBy}
        onSortChange={setSortBy}
      />

      {/* Detailed Performance Metrics */}
      <DetailedPerformanceMetrics profiles={sortedProfiles} />
    </div>
  );
};
```

---

### Step 6: Create Barrel Export (5 min)

Create `features/draft-analysis/components/ManagerAnalysis/index.ts`:

```typescript
export { ManagerAnalysis } from './ManagerAnalysis';
export { ConcentrationMetricsTable } from './ConcentrationMetricsTable';
export { PlayerOverlapAnalysis } from './PlayerOverlapAnalysis';
export { PlayerOverlapByCount } from './PlayerOverlapByCount';
export { CrossLeaguePriceDiff } from './CrossLeaguePriceDiff';
export { PositionalAllocationHeatmap } from './PositionalAllocationHeatmap';
export { DetailedPerformanceMetrics } from './DetailedPerformanceMetrics';
export * from './utils';
```

Update `features/draft-analysis/components/index.ts`:

```typescript
export * from './ManagerAnalysis';
```

---

### Step 7: Update Usage in Pages (10 min)

Update `apps/web/src/app/draft/analysis/page.tsx`:

```typescript
// Change from:
import { ManagerAnalysis } from '@/components/manager-analysis';

// To:
import { ManagerAnalysis } from '@/features/draft-analysis/components';
```

---

### Step 8: Add Tests (30 min)

Create basic tests for each component. Example for main component:

```typescript
// features/draft-analysis/components/ManagerAnalysis/ManagerAnalysis.test.tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ManagerAnalysis } from './ManagerAnalysis';
import { mockManagerAnalytics } from '@/shared/test/factories';

describe('ManagerAnalysis', () => {
  it('renders header', () => {
    const analytics = mockManagerAnalytics();
    render(<ManagerAnalysis analytics={analytics} />);
    expect(screen.getByText('Manager Behavior Profiles')).toBeInTheDocument();
  });

  it('renders all sub-components', () => {
    const analytics = mockManagerAnalytics();
    render(<ManagerAnalysis analytics={analytics} />);
    
    expect(screen.getByText('Concentration Metrics')).toBeInTheDocument();
    expect(screen.getByText('Player Overlap Analysis')).toBeInTheDocument();
  });
});
```

---

### Step 9: Remove Deprecated File (5 min)

```bash
# After confirming everything works
cd /Users/dhruv.methi/Documents/GitHub/gauntlet-website/apps/web/src
rm components/manager-analysis.tsx
```

---

## Acceptance Criteria

- [ ] Main `ManagerAnalysis` component <150 lines
- [ ] 6 sub-components created (all <250 lines each)
- [ ] All components use `memo()` for performance
- [ ] All components follow arrow function pattern
- [ ] Utility functions extracted to separate file
- [ ] All sub-components have tests
- [ ] Utils have 100% test coverage
- [ ] TypeScript compilation passes
- [ ] ESLint passes with no warnings
- [ ] Page imports updated to use new location
- [ ] Old file removed
- [ ] Visual regression: component looks identical

---

## Verification Commands

```bash
cd /Users/dhruv.methi/Documents/GitHub/gauntlet-website/apps/web

# Run tests
pnpm test features/draft-analysis/components/ManagerAnalysis

# Type check
pnpm tsc --noEmit

# Lint
pnpm lint

# Build to verify no runtime errors
pnpm build

# Measure bundle size
pnpm run analyze
```

---

## Cursor Prompts

### Copy-Paste Prompt for Step 2-3

```
I'm working on WEB-COMP-001: Split Manager Analysis Component.

Please:
1. Read apps/web/src/components/manager-analysis.tsx (lines 60-228 for utility functions)
2. Create apps/web/src/features/draft-analysis/components/ManagerAnalysis/utils.ts
3. Extract the utility functions: getHeatmapColor, getContrastingTextColor, getClusterBadgeVariant
4. Create utils.test.ts with tests for each function
5. Follow the patterns in the task file
```

### Copy-Paste Prompt for Step 4-5

```
I'm working on WEB-COMP-001: Creating main component.

Please:
1. Read apps/web/src/components/manager-analysis.tsx (lines 230-260)
2. Create apps/web/src/features/draft-analysis/components/ManagerAnalysis/ManagerAnalysis.tsx
3. Import all sub-components (ConcentrationMetricsTable, PlayerOverlapAnalysis, etc.)
4. Create a clean main component that composes sub-components
5. Use hooks from features/draft-analysis/hooks
6. Follow arrow function pattern with memo() for performance
```

---

## Related Tasks

**Blocks**: WEB-PAGE-001 (Draft Analysis Pages migration)  
**Blocked By**: WEB-HOOK-001, WEB-HOOK-002  
**Related**: WEB-COMP-002 (Similar component splitting pattern)

---

## Notes

- **Performance**: Using `memo()` on sub-components prevents unnecessary re-renders when parent state changes
- **Testing Strategy**: Test utils in isolation, test components with mock data
- **Visual Testing**: Compare screenshots before/after to ensure identical appearance
- **Future Enhancement**: Add Storybook stories for each sub-component

---

**Estimated Total Time**: 2.5 hours  
**Actual Time**: ___ (fill in after completion)  
**Completed By**: ___ (fill in after completion)  
**Completion Date**: ___ (fill in after completion)
