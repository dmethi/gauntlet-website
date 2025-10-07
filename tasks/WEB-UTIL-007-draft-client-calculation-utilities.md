# WEB-UTIL-007: Draft & Client Calculation Utilities

**Category**: UTIL  
**Priority**: 🟢 LOW (can defer if needed)  
**Estimated Time**: 35 min  
**Dependencies**: WEB-SETUP-004 (feature folder structure)

---

## Objective

Extract remaining calculation and narrative utilities from `lib/` to appropriate
feature directories, completing the utility organization work and establishing
clean feature boundaries.

---

## Context Needed

**Files to review and relocate**:

1. `lib/draft-analytics.ts` (size unknown)
   - Draft-related analytics calculations
   - Move to: `features/draft-analysis/utils/analytics.ts`

2. `lib/client-calculations.ts` (size unknown)
   - Client-side calculation utilities
   - Determine if shared or feature-specific

3. `lib/narrative-generators.ts` (size unknown)
   - Narrative generation for reports
   - Move to: `features/reports/utils/narratives.ts` (feature-specific)

**Strategy**: Review each file to understand dependencies and determine proper
location (shared vs. feature-specific).

**Total Context**: ~300-500 lines estimated

---

## Steps

### 1. Review file contents and dependencies

```bash
cd /Users/dhruv.methi/Documents/GitHub/gauntlet-website/apps/web

# Check what each file exports
echo "=== draft-analytics.ts exports ==="
grep "^export" src/lib/draft-analytics.ts | head -20

echo "=== client-calculations.ts exports ==="
grep "^export" src/lib/client-calculations.ts | head -20

echo "=== narrative-generators.ts exports ==="
grep "^export" src/lib/narrative-generators.ts | head -20

# Find what imports each file
echo "=== Files importing draft-analytics ==="
grep -r "from '@/lib/draft-analytics" src/

echo "=== Files importing client-calculations ==="
grep -r "from '@/lib/client-calculations" src/

echo "=== Files importing narrative-generators ==="
grep -r "from '@/lib/narrative-generators" src/
```

### 2. Create feature directories (if needed)

```bash
# Draft analysis utilities
mkdir -p src/features/draft-analysis/utils

# Reports feature (if doesn't exist)
mkdir -p src/features/reports/utils

# Shared calculations (if needed)
mkdir -p src/shared/utils/calculations
```

### 3. Move draft-analytics.ts

**If file is draft-analysis specific:**

```bash
mv src/lib/draft-analytics.ts src/features/draft-analysis/utils/analytics.ts
```

**Create barrel export `features/draft-analysis/utils/index.ts`:**

```typescript
/**
 * Draft analysis utilities
 * Calculations and analytics for draft evaluation
 */

export * from './analytics';
export * from './calculations'; // If exists from WEB-UTIL-003
```

**Update imports in consuming files:**

```typescript
// OLD
import { calculateDraftValue } from '@/lib/draft-analytics';

// NEW
import { calculateDraftValue } from '@/features/draft-analysis/utils';
```

### 4. Move and categorize client-calculations.ts

**Option A: If calculations are shared across features:**

```bash
mv src/lib/client-calculations.ts src/shared/utils/calculations/index.ts
```

**Option B: If calculations are feature-specific:**

```bash
# Determine which feature and move accordingly
# Example: If used only in matchups
mv src/lib/client-calculations.ts src/features/matchups/utils/calculations.ts
```

**Review the file to decide:**

- Used in 3+ features → `shared/utils/calculations/`
- Used in 1-2 features → Move to primary feature
- Mixed usage → Split file by feature

**After categorization, update imports:**

```typescript
// If shared:
import { calculateProjection } from '@/shared/utils/calculations';

// If feature-specific:
import { calculateProjection } from '@/features/matchups/utils';
```

### 5. Move narrative-generators.ts

**Narratives are feature-specific to reports:**

```bash
mv src/lib/narrative-generators.ts src/features/reports/utils/narratives.ts
```

**Create barrel export `features/reports/utils/index.ts`:**

```typescript
/**
 * Report generation utilities
 * Narrative generation and report formatting
 */

export * from './narratives';
```

**Update imports in report files:**

```typescript
// OLD
import { generateNarrative } from '@/lib/narrative-generators';

// NEW
import { generateNarrative } from '@/features/reports/utils';
```

### 6. Update all consuming files

```bash
# Find and update draft-analytics imports
grep -r "from '@/lib/draft-analytics" src/ | cut -d: -f1 | sort -u
# Update each file found

# Find and update client-calculations imports
grep -r "from '@/lib/client-calculations" src/ | cut -d: -f1 | sort -u
# Update each file found

# Find and update narrative-generators imports
grep -r "from '@/lib/narrative-generators" src/ | cut -d: -f1 | sort -u
# Update each file found
```

### 7. Add tests for key functions

**Test draft analytics:**

```typescript
// features/draft-analysis/utils/analytics.test.ts
import { describe, it, expect } from 'vitest';
import { calculateDraftValue } from './analytics';

describe('calculateDraftValue', () => {
  it('calculates draft value correctly', () => {
    // Add test based on actual function
  });
});
```

**Test calculations:**

```typescript
// shared/utils/calculations/index.test.ts (or feature-specific)
import { describe, it, expect } from 'vitest';
import { calculateProjection } from './index';

describe('calculateProjection', () => {
  it('projects correctly', () => {
    // Add test based on actual function
  });
});
```

**Test narrative generators:**

```typescript
// features/reports/utils/narratives.test.ts
import { describe, it, expect } from 'vitest';
import { generateNarrative } from './narratives';

describe('generateNarrative', () => {
  it('generates narrative text', () => {
    const narrative = generateNarrative({
      /* test data */
    });
    expect(narrative).toBeTruthy();
    expect(typeof narrative).toBe('string');
  });
});
```

### 8. Remove old files

```bash
# Verify files moved
test ! -f src/lib/draft-analytics.ts && echo "✅ draft-analytics.ts moved"
test ! -f src/lib/client-calculations.ts && echo "✅ client-calculations.ts moved"
test ! -f src/lib/narrative-generators.ts && echo "✅ narrative-generators.ts moved"

# Check for remaining files in lib/
ls -la src/lib/
# Should only have essential files left
```

### 9. Verify no broken imports

```bash
# Check for old imports
grep -r "from '@/lib/draft-analytics" src/ && echo "❌ Old imports found" || echo "✅ Imports updated"
grep -r "from '@/lib/client-calculations" src/ && echo "❌ Old imports found" || echo "✅ Imports updated"
grep -r "from '@/lib/narrative-generators" src/ && echo "❌ Old imports found" || echo "✅ Imports updated"

# TypeScript compilation
pnpm tsc --noEmit
```

### 10. Run tests

```bash
# Test draft analysis utilities
pnpm test features/draft-analysis

# Test calculations
pnpm test shared/utils/calculations
# OR
pnpm test features/*/utils/calculations

# Test narrative generators
pnpm test features/reports

# Run all tests
pnpm test
```

---

## Acceptance Criteria

- [ ] `lib/draft-analytics.ts` moved to appropriate feature directory
- [ ] `lib/client-calculations.ts` properly categorized and moved
- [ ] `lib/narrative-generators.ts` moved to `features/reports/utils/`
- [ ] Barrel exports created for all relocated utilities
- [ ] All imports updated in consuming files
- [ ] Old files removed from `lib/`
- [ ] Tests added for key utility functions
- [ ] TypeScript compilation passes
- [ ] All tests pass
- [ ] No ESLint errors

---

## Verification Commands

```bash
cd /Users/dhruv.methi/Documents/GitHub/gauntlet-website/apps/web

# Verify files relocated
test -f src/features/draft-analysis/utils/analytics.ts && echo "✅ Draft analytics relocated"
test -f src/features/reports/utils/narratives.ts && echo "✅ Narratives relocated"

# Verify old files removed
! test -f src/lib/draft-analytics.ts && echo "✅ Old draft-analytics removed"
! test -f src/lib/client-calculations.ts && echo "✅ Old client-calculations removed"
! test -f src/lib/narrative-generators.ts && echo "✅ Old narratives removed"

# Verify no old imports
! grep -r "from '@/lib/draft-analytics" src/ && echo "✅ Draft analytics imports updated"
! grep -r "from '@/lib/client-calculations" src/ && echo "✅ Client calculations imports updated"
! grep -r "from '@/lib/narrative-generators" src/ && echo "✅ Narrative imports updated"

# TypeScript compilation
pnpm tsc --noEmit

# Run tests
pnpm test features/draft-analysis
pnpm test features/reports
pnpm test shared/utils/calculations

# Lint check
pnpm lint
```

---

## Cursor Prompt (Copy-Paste Ready)

```
I'm working on WEB-UTIL-007: Draft & Client Calculation Utilities.

Please:
1. Review the following files to understand their purpose and dependencies:
   - src/lib/draft-analytics.ts
   - src/lib/client-calculations.ts
   - src/lib/narrative-generators.ts

2. For each file, determine if it's:
   - Feature-specific (used by one feature) → move to features/{feature}/utils/
   - Shared (used by multiple features) → move to shared/utils/

3. Create appropriate directories and move files:
   - draft-analytics.ts → features/draft-analysis/utils/analytics.ts
   - narrative-generators.ts → features/reports/utils/narratives.ts
   - client-calculations.ts → (determine location based on usage)

4. Create barrel exports for each feature's utils directory

5. Update all imports in consuming files (find with grep)

6. Add basic tests for key functions

7. Remove old files from lib/

8. Verify no broken imports with TypeScript compilation

This completes the utility extraction and organization work.
```

---

## Related Tasks

**Blocks**: WEB-CLEAN-001 (cleanup needs utilities organized first)  
**Blocked By**: WEB-SETUP-004 (feature folder structure), WEB-UTIL-003 (manager
analytics)  
**Related**: WEB-UTIL-005 (stats relocation), WEB-UTIL-006 (transaction
relocation)

---

## Notes

- **Review First**: This task requires understanding file contents before moving
- **Categorization**: Key decision is whether calculations are shared or
  feature-specific
- **Can Defer**: Marked LOW priority - can be done after component work if
  needed
- **Completes Phase 3**: This is the final utility extraction task

---

## Decision Tree for client-calculations.ts

**Questions to answer:**

1. Which features import this file? (use grep)
2. Are calculations domain-specific or generic?
3. Is there cross-feature usage?

**Decision:**

- **1 feature uses it** → Move to that feature's utils
- **2 features use it** → Move to primary feature, other imports from there
- **3+ features use it** → Move to `shared/utils/calculations/`
- **Mixed domain-specific** → Consider splitting file

---

## Expected lib/ Directory After This Task

**Files that should remain in lib/:**

- `colors.ts` - Re-exports brand colors (appropriate)
- `constants.ts` - App-wide constants (appropriate)
- `fonts.ts` - Font configurations (appropriate)
- `utils.ts` - Generic utilities like `cn()` (appropriate)
- `sleeper/` - API client (appropriate in lib)

**Files that should be gone:**

- ❌ All feature-specific utilities
- ❌ All shared utilities (moved to shared/)
- ❌ All calculation utilities

**Result**: Clean, minimal `lib/` with only infrastructure code.

---

## Common Issues & Solutions

**Issue**: Can't determine if calculation is shared or feature-specific  
**Solution**: Check number of consuming files. If used by 1-2 files in same
feature, it's feature-specific

**Issue**: File has both shared and feature-specific functions  
**Solution**: Split the file - move shared functions to shared/utils/,
feature-specific to feature

**Issue**: Breaking changes when moving files  
**Solution**: Use barrel exports to maintain clean import paths

---

**Estimated Context Usage**: 300-500 lines reviewed and moved, 3-5 files
updated, 35 min total
