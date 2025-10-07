# WEB-UTIL-001: Formatting Utilities

**Category**: UTIL  
**Priority**: 🔴 CRITICAL (eliminates duplication)  
**Estimated Time**: 50 min  
**Dependencies**: WEB-SETUP-003

---

## Objective

Extract scattered formatting functions from components into centralized, tested
utilities to eliminate duplication and ensure consistency across the
application.

---

## Context Needed

**Read these files** (identify formatting patterns):

1. `components/matchup-odds-preview.tsx` (lines 58-60 - formatOdds)
2. `components/matchup-simulation.tsx` (lines 186-188 - formatOdds duplicate)
3. `components/stats/SummaryTable.tsx` (lines 54-88 - delta formatting)
4. `components/stats/PlayerBreakdown.tsx` (lines 48-70 - formatStatKey)

**Total Context**: ~100 lines

---

## Steps

### 1. Create formatting utilities structure

```bash
cd /Users/dhruv.methi/Documents/GitHub/gauntlet-website/apps/web
mkdir -p src/shared/utils/formatting
```

### 2. Create `shared/utils/formatting/numbers.ts`

```typescript
/**
 * Format a number with fixed decimal places
 */
export const formatNumber = (value: number, decimals = 1): string => {
  return value.toFixed(decimals);
};

/**
 * Format a number as a delta (with + sign for positive values)
 */
export const formatDelta = (value: number, decimals = 1): string => {
  const sign = value > 0 ? '+' : '';
  return `${sign}${value.toFixed(decimals)}`;
};

/**
 * Format a number in compact notation (K, M, B)
 */
export const formatCompact = (value: number): string => {
  if (value >= 1_000_000_000) {
    return `${(value / 1_000_000_000).toFixed(1)}B`;
  }
  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(1)}M`;
  }
  if (value >= 1_000) {
    return `${(value / 1_000).toFixed(1)}K`;
  }
  return value.toFixed(0);
};
```

### 3. Create `shared/utils/formatting/percentages.ts`

```typescript
/**
 * Format a decimal as a percentage (0.5 → "50%")
 */
export const formatPercentage = (value: number, decimals = 0): string => {
  return `${(value * 100).toFixed(decimals)}%`;
};

/**
 * Format a decimal with fixed places (no percentage sign)
 */
export const formatDecimal = (value: number, decimals = 2): string => {
  return value.toFixed(decimals);
};
```

### 4. Create `shared/utils/formatting/odds.ts`

```typescript
/**
 * Format betting odds (American format)
 * Positive odds: +150, Negative odds: -200
 */
export const formatOdds = (odds: number): string => {
  return odds > 0 ? `+${odds}` : `${odds}`;
};

/**
 * Format moneyline with proper sign
 */
export const formatMoneyline = (value: number): string => {
  return formatOdds(Math.round(value));
};
```

### 5. Create `shared/utils/formatting/stats.ts`

```typescript
/**
 * Format stat keys to readable labels
 */
export const formatStatKey = (key: string): string => {
  const statLabels: Record<string, string> = {
    pass_yd: 'Pass Yds',
    pass_td: 'Pass TD',
    pass_int: 'INT',
    rush_yd: 'Rush Yds',
    rush_td: 'Rush TD',
    rec: 'Rec',
    rec_yd: 'Rec Yds',
    rec_td: 'Rec TD',
    fum_lost: 'Fum',
    pts_allow: 'PA',
    sack: 'Sacks',
    int: 'INT',
    fum_rec: 'FR',
    def_td: 'TD',
    safe: 'Sfty',
  };
  return statLabels[key] || key;
};

/**
 * Format stat value with appropriate precision
 */
export const formatStatValue = (value: number, statKey: string): string => {
  // Whole numbers for counting stats
  if (
    ['rec', 'pass_td', 'rush_td', 'rec_td', 'int', 'sack'].includes(statKey)
  ) {
    return value.toFixed(0);
  }
  // One decimal for yards and points
  return value.toFixed(1);
};
```

### 6. Create barrel export `shared/utils/formatting/index.ts`

```typescript
export { formatNumber, formatDelta, formatCompact } from './numbers';
export { formatPercentage, formatDecimal } from './percentages';
export { formatOdds, formatMoneyline } from './odds';
export { formatStatKey, formatStatValue } from './stats';
```

### 7. Create tests `shared/utils/formatting/numbers.test.ts`

```typescript
import { describe, it, expect } from 'vitest';
import { formatNumber, formatDelta, formatCompact } from './numbers';

describe('formatNumber', () => {
  it('formats with default 1 decimal', () => {
    expect(formatNumber(123.456)).toBe('123.5');
  });

  it('formats with custom decimals', () => {
    expect(formatNumber(123.456, 2)).toBe('123.46');
  });
});

describe('formatDelta', () => {
  it('adds + sign for positive', () => {
    expect(formatDelta(10.5)).toBe('+10.5');
  });

  it('keeps - sign for negative', () => {
    expect(formatDelta(-5.2)).toBe('-5.2');
  });

  it('handles zero', () => {
    expect(formatDelta(0)).toBe('0.0');
  });
});

describe('formatCompact', () => {
  it('formats billions', () => {
    expect(formatCompact(1_500_000_000)).toBe('1.5B');
  });

  it('formats millions', () => {
    expect(formatCompact(2_300_000)).toBe('2.3M');
  });

  it('formats thousands', () => {
    expect(formatCompact(45_600)).toBe('45.6K');
  });

  it('formats small numbers', () => {
    expect(formatCompact(123)).toBe('123');
  });
});
```

### 8. Replace inline formatting in components

Update `components/matchup-odds-preview.tsx`:

```typescript
// Remove inline function (lines 58-60)
// Add import:
import { formatOdds } from '@/shared/utils/formatting';
```

Update `components/matchup-simulation.tsx`:

```typescript
// Remove inline function (lines 186-188)
// Add import:
import { formatOdds } from '@/shared/utils/formatting';
```

Update `components/stats/SummaryTable.tsx`:

```typescript
// Replace inline formatting with:
import { formatNumber, formatDelta } from '@/shared/utils/formatting';

// Line 54: formatNumber(row.windowTotal)
// Line 64-65: formatDelta(row.diff)
// Line 75-76: formatDelta(row.avgDelta)
```

### 9. Run tests

```bash
pnpm test shared/utils/formatting
```

---

## Acceptance Criteria

- [x] All formatting utilities created in `shared/utils/formatting/`
- [x] Barrel export `index.ts` created
- [x] 100% test coverage for all formatting functions
- [x] Inline `formatOdds` removed from 2 components
- [x] Inline number formatting replaced in 3+ components
- [x] TypeScript compilation passes
- [x] All tests pass
- [x] No ESLint errors

---

## Verification Commands

```bash
cd /Users/dhruv.methi/Documents/GitHub/gauntlet-website/apps/web
pnpm tsc --noEmit
pnpm test shared/utils/formatting
pnpm lint
```

---

## Cursor Prompt (Copy-Paste Ready)

```
I'm working on WEB-UTIL-001: Formatting Utilities.

Please:
1. Create shared/utils/formatting/ directory structure
2. Create numbers.ts, percentages.ts, odds.ts, stats.ts with functions as specified
3. Create comprehensive tests for all utilities
4. Remove duplicate formatOdds() from matchup-odds-preview.tsx and matchup-simulation.tsx
5. Replace inline formatting in stats components with shared utilities
6. Create barrel export index.ts
7. Run tests and verify all pass

Follow the exact function signatures and implementations in the task file.
```

---

## Related Tasks

**Blocks**: WEB-COMP-001, WEB-COMP-002 (components need these utilities)  
**Blocked By**: WEB-SETUP-003 (test infrastructure)  
**Related**: WEB-UTIL-002 (color utilities), WEB-TEST-003 (utility tests)

---

## Notes

- **Duplication Eliminated**: `formatOdds()` appears in 2 files
- **Inline Patterns**: `.toFixed()` appears 80+ times, should gradually migrate
  to utilities
- **Future Enhancement**: Add currency formatting when needed
- **Performance**: These are pure functions, highly cacheable

---

**Estimated Context Usage**: 100 lines read, 300 lines written, 50 min total
