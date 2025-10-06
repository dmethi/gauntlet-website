# Task: UTIL-001 - Manager Analysis Formatting Utils

## Overview

Extract formatting helper functions from `manager-analysis.tsx` into testable
utility functions.

## Context Needed

- File: `apps/web/src/components/manager-analysis.tsx` (search for inline
  formatters)
- Look for: formatCurrency-like functions, percentage formatters

## Objective

Create `utils/formatting.ts` with tested formatting functions.

## Steps

### 1. Scan Component for Formatting Logic

Look for inline formatting in `manager-analysis.tsx`:

- Currency formatting (e.g., `$100`)
- Percentage formatting (e.g., `45.2%`)
- Number formatting
- Any `Intl.NumberFormat` usage

### 2. Create Utilities File

Create `apps/web/src/features/manager-analysis/utils/formatting.ts`:

````typescript
/**
 * Formats a number as USD currency without cents.
 *
 * @param value - Numeric value to format
 * @returns Formatted currency string (e.g., "$100")
 *
 * @example
 * ```typescript
 * formatCurrency(100.5)   // "$101"
 * formatCurrency(1234.99) // "$1,235"
 * formatCurrency(0)       // "$0"
 * ```
 */
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

/**
 * Formats a decimal as a percentage.
 *
 * @param value - Decimal value (0-1)
 * @param decimals - Number of decimal places (default: 1)
 * @returns Formatted percentage string (e.g., "45.2%")
 *
 * @example
 * ```typescript
 * formatPercentage(0.452)     // "45.2%"
 * formatPercentage(0.452, 2)  // "45.20%"
 * formatPercentage(1, 0)      // "100%"
 * ```
 */
export function formatPercentage(value: number, decimals = 1): string {
  return `${(value * 100).toFixed(decimals)}%`;
}

/**
 * Formats a number with specified decimal places.
 *
 * @param value - Numeric value
 * @param decimals - Number of decimal places (default: 2)
 * @returns Formatted number string
 *
 * @example
 * ```typescript
 * formatNumber(1234.5678)     // "1,234.57"
 * formatNumber(1234.5678, 1)  // "1,234.6"
 * ```
 */
export function formatNumber(value: number, decimals = 2): string {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}
````

### 3. Create Tests

Create `apps/web/src/features/manager-analysis/utils/formatting.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';
import { formatCurrency, formatPercentage, formatNumber } from './formatting';

describe('formatting utils', () => {
  describe('formatCurrency', () => {
    it('should format whole numbers', () => {
      expect(formatCurrency(100)).toBe('$100');
      expect(formatCurrency(1234)).toBe('$1,234');
    });

    it('should round decimals to nearest dollar', () => {
      expect(formatCurrency(100.4)).toBe('$100');
      expect(formatCurrency(100.6)).toBe('$101');
    });

    it('should handle zero', () => {
      expect(formatCurrency(0)).toBe('$0');
    });

    it('should handle negative values', () => {
      expect(formatCurrency(-50)).toBe('-$50');
    });

    it('should handle large numbers', () => {
      expect(formatCurrency(1234567)).toBe('$1,234,567');
    });
  });

  describe('formatPercentage', () => {
    it('should format decimals as percentages with default precision', () => {
      expect(formatPercentage(0.452)).toBe('45.2%');
      expect(formatPercentage(0.1)).toBe('10.0%');
      expect(formatPercentage(1)).toBe('100.0%');
    });

    it('should respect custom decimal places', () => {
      expect(formatPercentage(0.12345, 2)).toBe('12.35%');
      expect(formatPercentage(0.12345, 0)).toBe('12%');
      expect(formatPercentage(0.12345, 3)).toBe('12.345%');
    });

    it('should handle zero', () => {
      expect(formatPercentage(0)).toBe('0.0%');
    });

    it('should handle values over 1', () => {
      expect(formatPercentage(1.5)).toBe('150.0%');
    });
  });

  describe('formatNumber', () => {
    it('should format numbers with default 2 decimals', () => {
      expect(formatNumber(1234.5678)).toBe('1,234.57');
      expect(formatNumber(1234)).toBe('1,234.00');
    });

    it('should respect custom decimal places', () => {
      expect(formatNumber(1234.5678, 1)).toBe('1,234.6');
      expect(formatNumber(1234.5678, 0)).toBe('1,235');
      expect(formatNumber(1234.5678, 3)).toBe('1,234.568');
    });

    it('should add thousands separators', () => {
      expect(formatNumber(1000000, 0)).toBe('1,000,000');
    });
  });
});
```

### 4. Create Index File

Create `apps/web/src/features/manager-analysis/utils/index.ts`:

```typescript
export * from './formatting';
```

### 5. Run Tests

```bash
pnpm test src/features/manager-analysis/utils/formatting.test.ts
```

### 6. Update Component

Find and replace inline formatting in `manager-analysis.tsx` with:

```typescript
import {
  formatCurrency,
  formatPercentage,
  formatNumber,
} from '@/features/manager-analysis/utils';
```

Look for patterns like:

- `new Intl.NumberFormat(...).format(value)` → `formatCurrency(value)`
- `(value * 100).toFixed(1) + '%'` → `formatPercentage(value)`

**Note**: Update 3-5 usages to start. Don't try to find ALL usages at once.

## Acceptance Criteria

- [ ] `utils/formatting.ts` created with 3 functions
- [ ] All functions have JSDoc with examples
- [ ] Tests written for all functions
- [ ] All tests pass (100% coverage)
- [ ] Index file exports functions
- [ ] At least 3 usages in component updated
- [ ] Component still renders correctly

## Estimated Context Usage

- Files to read: 1 (manager-analysis.tsx - scan only)
- Lines to process: ~100
- New files: 3 (util, test, index)
- Risk: **Low** (pure functions, easy to test)

## Related Tasks

- **Depends on**: EXTRACT-001 (types)
- **Blocks**: None (independent)
- **Related**: UTIL-002 (colors), UTIL-003 (sorting)

## Cursor Prompt

```
I'm working on UTIL-001. Please:

1. Read tasks/UTIL-001-manager-analysis-formatting.md
2. Create utils/formatting.ts with the 3 formatting functions
3. Create utils/formatting.test.ts with comprehensive tests
4. Run tests to verify they pass
5. Find 3-5 places in manager-analysis.tsx where these functions can be used
6. Update those usages with imports

Focus on formatCurrency, formatPercentage, and formatNumber only.
```

## Verification Commands

```bash
# Tests should pass with 100% coverage
pnpm test src/features/manager-analysis/utils/formatting.test.ts --coverage

# Should find the new files
ls apps/web/src/features/manager-analysis/utils/

# Component should still work (manual check)
pnpm dev
```

## Commit Message

```
feat(UTIL-001): extract formatting utilities

- Create formatting.ts with formatCurrency, formatPercentage, formatNumber
- Add comprehensive tests (100% coverage)
- Add JSDoc with usage examples
- Update manager-analysis.tsx to use utilities
```

## Estimated Time

⏱️ **30-40 minutes**

## Notes

- Focus on pure functions (input → output)
- Aim for 100% test coverage
- These utilities can be shared across features later
- Don't try to replace ALL usages at once—start with 3-5
