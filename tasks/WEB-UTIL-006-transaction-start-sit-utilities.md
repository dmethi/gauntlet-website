# WEB-UTIL-006: Transaction & Start/Sit Utilities

**Category**: UTIL  
**Priority**: 🟡 MEDIUM  
**Estimated Time**: 40 min  
**Dependencies**: WEB-SETUP-004 (feature folder structure)

---

## Objective

Extract feature-specific utilities from `lib/` to proper feature directories
(`features/transactions/` and `features/start-sit/`), establishing clear feature
boundaries and improving code organization.

---

## Context Needed

**Files to move**:

1. `lib/transactions-facts.ts` (~200 lines)
   - Exports: `Facts`, `playoffWeight()`, transaction analysis functions
   - Used by: Transaction analysis components, stats hub

2. `lib/start-sit/analysis.ts` (~300 lines)
   - Start/sit efficiency analysis logic
   - Used by: Start-sit efficiency components

**Consuming files** (need import updates):

- `app/stats/components/TransactionAnalysis.tsx`
- `app/stats/utils/computeTransactionGradesForStatsHub.ts`
- `components/start-sit-efficiency.tsx`
- `components/stats/StartSitEfficiencyTab.tsx`

**Total Context**: ~500 lines to move, 5-8 files to update

---

## Steps

### 1. Create feature utility directories

```bash
cd /Users/dhruv.methi/Documents/GitHub/gauntlet-website/apps/web

# Create transaction utilities
mkdir -p src/features/transactions/utils

# Create start-sit utilities
mkdir -p src/features/start-sit/utils
```

### 2. Move transaction utilities

```bash
# Move transactions-facts.ts
mv src/lib/transactions-facts.ts src/features/transactions/utils/facts.ts
```

**Review the file** to ensure it's feature-specific (not shared):

```bash
# Check what it exports
grep "^export" src/features/transactions/utils/facts.ts
```

Expected exports:

- `Facts` interface/type
- `playoffWeight()` function
- Transaction fact building functions

### 3. Move start-sit utilities

```bash
# Move the entire start-sit directory
mv src/lib/start-sit/analysis.ts src/features/start-sit/utils/analysis.ts

# Remove old directory if empty
rmdir src/lib/start-sit 2>/dev/null || true
```

### 4. Create barrel exports

**Create `features/transactions/utils/index.ts`:**

```typescript
/**
 * Transaction analysis utilities
 * Core logic for grading and analyzing waiver wire transactions
 */

export * from './facts';
```

**Create `features/start-sit/utils/index.ts`:**

```typescript
/**
 * Start/Sit efficiency analysis utilities
 * Logic for evaluating lineup decision quality
 */

export * from './analysis';
```

### 5. Find files using these utilities

```bash
# Find transaction utility imports
grep -r "from '@/lib/transactions-facts" src/
grep -r "transactions-facts" src/

# Find start-sit utility imports
grep -r "from '@/lib/start-sit" src/
grep -r "start-sit/analysis" src/
```

### 6. Update transaction utility imports

**Update `app/stats/utils/computeTransactionGradesForStatsHub.ts`:**

```typescript
// OLD
import { Facts, playoffWeight } from '@/lib/transactions-facts';

// NEW
import { Facts, playoffWeight } from '@/features/transactions/utils';
```

**Update `app/stats/components/TransactionAnalysis.tsx`:**

```typescript
// Update import path
import type { Facts } from '@/features/transactions/utils';
```

### 7. Update start-sit utility imports

**Update `components/start-sit-efficiency.tsx`:**

```typescript
// OLD
import { analyzeStartSit } from '@/lib/start-sit/analysis';

// NEW
import { analyzeStartSit } from '@/features/start-sit/utils';
```

**Update `components/stats/StartSitEfficiencyTab.tsx`:**

```typescript
// OLD
import { calculateEfficiency } from '@/lib/start-sit/analysis';

// NEW
import { calculateEfficiency } from '@/features/start-sit/utils';
```

### 8. Add tests for key functions

**Create `features/transactions/utils/facts.test.ts`:**

```typescript
import { describe, it, expect } from 'vitest';
import { playoffWeight } from './facts';

describe('playoffWeight', () => {
  it('returns higher weight for playoff weeks', () => {
    const playoffWeek = playoffWeight(15); // Week 15 is playoffs
    const regularWeek = playoffWeight(5); // Week 5 is regular season

    expect(playoffWeek).toBeGreaterThan(regularWeek);
  });

  it('handles edge cases', () => {
    expect(playoffWeight(1)).toBeGreaterThan(0);
    expect(playoffWeight(18)).toBeGreaterThan(0);
  });
});
```

**Create `features/start-sit/utils/analysis.test.ts`:**

```typescript
import { describe, it, expect } from 'vitest';
import { analyzeStartSit } from './analysis';

describe('analyzeStartSit', () => {
  it('calculates efficiency correctly', () => {
    const result = analyzeStartSit({
      started: [{ points: 20 }, { points: 15 }],
      benched: [{ points: 10 }, { points: 5 }],
    });

    expect(result.efficiency).toBeGreaterThan(0);
  });

  // Add more tests based on actual function signatures
});
```

### 9. Verify relocation

```bash
# Check old files are gone
test ! -f src/lib/transactions-facts.ts && echo "✅ transactions-facts.ts moved"
test ! -f src/lib/start-sit/analysis.ts && echo "✅ start-sit/analysis.ts moved"

# Check new files exist
test -f src/features/transactions/utils/facts.ts && echo "✅ facts.ts in place"
test -f src/features/start-sit/utils/analysis.ts && echo "✅ analysis.ts in place"

# Verify no old imports
grep -r "from '@/lib/transactions-facts" src/ && echo "❌ Old imports found" || echo "✅ No old imports"
grep -r "from '@/lib/start-sit" src/ && echo "❌ Old imports found" || echo "✅ No old imports"
```

### 10. Run tests

```bash
# Test transaction utilities
pnpm test features/transactions

# Test start-sit utilities
pnpm test features/start-sit

# Test consuming components
pnpm test app/stats/components/TransactionAnalysis
pnpm test components/start-sit-efficiency
```

---

## Acceptance Criteria

- [ ] `lib/transactions-facts.ts` moved to
      `features/transactions/utils/facts.ts`
- [ ] `lib/start-sit/analysis.ts` moved to
      `features/start-sit/utils/analysis.ts`
- [ ] Barrel exports created for both features
- [ ] All imports updated (5-8 files)
- [ ] Old files removed from `lib/`
- [ ] Tests added for key utility functions
- [ ] TypeScript compilation passes
- [ ] All tests pass
- [ ] No ESLint errors

---

## Verification Commands

```bash
cd /Users/dhruv.methi/Documents/GitHub/gauntlet-website/apps/web

# Verify files in correct locations
ls -la src/features/transactions/utils/
ls -la src/features/start-sit/utils/

# Verify old files removed
test ! -f src/lib/transactions-facts.ts && echo "✅ Old transaction file removed"
test ! -d src/lib/start-sit && echo "✅ Old start-sit directory removed"

# Verify no old imports
! grep -r "from '@/lib/transactions-facts" src/ && echo "✅ Transaction imports updated"
! grep -r "from '@/lib/start-sit" src/ && echo "✅ Start-sit imports updated"

# TypeScript compilation
pnpm tsc --noEmit

# Run tests
pnpm test features/transactions
pnpm test features/start-sit

# Lint check
pnpm lint
```

---

## Cursor Prompt (Copy-Paste Ready)

```
I'm working on WEB-UTIL-006: Transaction & Start/Sit Utilities.

Please:
1. Create feature utility directories:
   - src/features/transactions/utils/
   - src/features/start-sit/utils/

2. Move utilities to feature directories:
   - src/lib/transactions-facts.ts → src/features/transactions/utils/facts.ts
   - src/lib/start-sit/analysis.ts → src/features/start-sit/utils/analysis.ts

3. Create barrel exports (index.ts) in both utils directories

4. Update imports in consuming files:
   - app/stats/utils/computeTransactionGradesForStatsHub.ts
   - app/stats/components/TransactionAnalysis.tsx
   - components/start-sit-efficiency.tsx
   - components/stats/StartSitEfficiencyTab.tsx
   - Any others found by grep

5. Add basic tests for key functions (playoffWeight, analyzeStartSit)

6. Remove old files from lib/

7. Verify no broken imports with TypeScript compilation

This establishes proper feature-based organization for feature-specific utilities.
```

---

## Related Tasks

**Blocks**: WEB-COMP-001 (component splitting needs organized utils)  
**Blocked By**: WEB-SETUP-004 (feature folder structure)  
**Related**: WEB-UTIL-005 (stats relocation), WEB-EXTRACT-006 (start-sit types),
WEB-EXTRACT-007 (transaction types)

---

## Notes

- **Feature-Specific**: These utilities are only used within their respective
  features
- **Clear Boundaries**: Establishes that transactions and start-sit are distinct
  features
- **Test Coverage**: Add tests for core functions during move
- **Future Work**: Consider if these should be further split into smaller
  utilities

---

## File Size Reference

**Transaction Utilities (~200 lines):**

- `Facts` type definition
- `playoffWeight()` - Weights transaction impact by week
- Transaction fact building and aggregation
- Replacement level calculations

**Start-Sit Utilities (~300 lines):**

- Start/sit decision analysis
- Lineup efficiency calculations
- Opportunity cost calculations
- Position-specific efficiency metrics

---

## Common Issues & Solutions

**Issue**: Import paths break after move  
**Solution**: Use barrel exports to maintain clean import paths

**Issue**: Circular dependencies  
**Solution**: These are leaf utilities, should not import from components

**Issue**: Tests can't find utilities  
**Solution**: Update test imports to use new paths

**Issue**: Type imports fail  
**Solution**: Verify types are also exported from barrel exports

---

**Estimated Context Usage**: 500 lines moved, 5-8 files updated, 40 min total
