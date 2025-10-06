# REFACTOR-603: Add Path Aliases

**Category:** Refactoring  
**Priority:** 🟡 MEDIUM (Convention Compliance)  
**Estimated Time:** 15 minutes  
**Dependencies:** REFACTOR-602 (Barrel Exports)  
**Blocks:** None

---

## 📋 Overview

Add TypeScript path aliases to enable clean absolute imports per CODING_CONVENTIONS.MD. This eliminates ugly relative imports with `../../` and `.js` extensions.

**Convention Violation:**
```typescript
// ❌ WRONG (current)
import { gauntletAPI } from '../../lib/index.js';
import { CompleteSnapshot } from '@gauntlet/types';

// ✅ CORRECT (with path aliases)
import { gauntletAPI } from '@/lib';
import type { CompleteSnapshot } from '@gauntlet/types';
```

---

## 🎯 Objective

Configure TypeScript path aliases for clean imports:
- `@/lib/*` → `src/lib/*`
- `@/scripts/*` → `src/scripts/*`
- Remove `.js` extensions from imports

---

## 📖 Context Needed

**Files to Read:**
- `apps/server/tsconfig.json` (20 lines)
- `apps/server/src/scripts/jobs/comprehensive-live-snapshot.ts` (lines 1-15, imports)
- `apps/server/src/lib/__tests__/*.test.ts` (lines 1-10 of each, imports only)

**Total Context:** ~60 lines

---

## ✅ Steps

### 1. Update tsconfig.json (5 min)

Update `apps/server/tsconfig.json`:

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src",
    "declaration": false,
    "noEmit": false,
    "strict": true,
    "module": "ESNext",
    "moduleResolution": "bundler",
    "skipLibCheck": true,
    "resolveJsonModule": true,
    
    // Add path aliases
    "baseUrl": ".",
    "paths": {
      "@/lib": ["./src/lib/index.ts"],
      "@/lib/*": ["./src/lib/*"],
      "@/scripts/*": ["./src/scripts/*"]
    }
  },
  "include": ["src/lib/**/*.ts", "src/scripts/**/*.ts"],
  "exclude": ["node_modules", "dist", "**/*.test.ts", "**/*.spec.ts"],
  "references": [
    { "path": "../../packages/types" },
    { "path": "../sim-engine" }
  ]
}
```

### 2. Update Script Imports (5 min)

Update `apps/server/src/scripts/jobs/comprehensive-live-snapshot.ts`:

```typescript
// Before:
import { disconnect, gauntletAPI, saveSnapshotIfChanged } from '../../lib/index.js';
import type { CompleteSnapshot } from '@gauntlet/types';

// After:
import { disconnect, gauntletAPI, saveSnapshotIfChanged } from '@/lib';
import type { CompleteSnapshot } from '@gauntlet/types';
```

### 3. Update Test Imports (3 min)

Update all test files in `src/lib/__tests__/`:

**gauntlet-api-client.test.ts:**
```typescript
// Before:
import { GauntletAPIClient, gauntletAPI } from '../gauntlet-api-client';

// After:
import { GauntletAPIClient, gauntletAPI } from '@/lib';
```

**snapshot-validator.test.ts:**
```typescript
// Before:
import { hasSignificantChange, saveSnapshotIfChanged } from '../snapshot-validator';

// After:
import { hasSignificantChange, saveSnapshotIfChanged } from '@/lib';
```

**historical-data.test.ts:**
```typescript
// Before:
import { saveLiveWinProbSample, getLastWinProbSample, disconnect } from '../historical-data';

// After:
import { saveLiveWinProbSample, getLastWinProbSample, disconnect } from '@/lib';
```

### 4. Verify Path Resolution (2 min)

```bash
cd apps/server

# Check TypeScript can resolve paths
pnpm tsc --noEmit

# Run tests
pnpm test

# Verify build
pnpm build
```

---

## ✅ Acceptance Criteria

- [ ] Path aliases added to `tsconfig.json` (`@/lib`, `@/scripts`)
- [ ] All imports updated to use path aliases (no `../../`)
- [ ] `.js` extensions removed from imports
- [ ] `pnpm tsc --noEmit` passes (0 errors)
- [ ] `pnpm test` passes (all 50 tests)
- [ ] `pnpm build` succeeds
- [ ] No relative imports remain in production code

---

## 🔍 Verification

```bash
cd apps/server

# 1. Check for relative imports (should find 0)
grep -r "from '\.\./\.\./lib" src/scripts src/lib
# Expected: No results

# 2. Check for .js extensions (should find 0)
grep -r "from '.*\.js'" src/scripts src/lib
# Expected: No results

# 3. Verify path alias usage
grep -r "from '@/lib" src/scripts src/lib
# Expected: Multiple results

# 4. TypeScript checks
pnpm tsc --noEmit
# Expected: 0 errors

# 5. Run tests
pnpm test
# Expected: All 50 tests pass

# 6. Build
pnpm build
# Expected: Successful compilation
```

---

## 📊 Estimated Context Usage

- **Files to modify**: 5 (tsconfig.json, 1 script, 3 test files)
- **Lines to read**: ~60
- **Lines to modify**: ~25

---

## 🔗 Related Tasks

**Prerequisites:**
- REFACTOR-602: Add Barrel Exports ✅ (provides index.ts for clean imports)

**Enables:**
- Convention-compliant imports
- Easier refactoring (paths independent of file structure)
- Better IDE autocomplete

**Related:**
- All future tasks (will use `@/lib` imports)

---

## 💡 Cursor Prompt

```
I'm working on REFACTOR-603 (Add path aliases to apps/server).

Please:
1. Read apps/server/tsconfig.json
2. Add path aliases: @/lib and @/scripts
3. Update all imports in src/scripts and src/lib/__tests__ to use @/lib
4. Remove .js extensions from imports

Follow tasks/REFACTOR-603-path-aliases.md steps exactly.

Pattern:
// Before:
import { gauntletAPI } from '../../lib/index.js';

// After:
import { gauntletAPI } from '@/lib';
```

---

## 📝 Notes

### Why Path Aliases?

From CODING_CONVENTIONS.MD:
- **Readability**: `@/lib` is clearer than `../../lib/index.js`
- **Refactoring**: Move files without breaking imports
- **IDE Support**: Better autocomplete with absolute paths
- **Consistency**: Matches patterns in `apps/web`

### TypeScript Module Resolution

We're using `"moduleResolution": "bundler"` which:
- Allows path aliases
- Supports ESM with imports/exports
- Works with modern TypeScript (5.0+)
- Compatible with Node.js ESM

### Why Remove .js Extensions?

With path aliases:
1. TypeScript resolves paths at compile time
2. `.js` extension no longer needed
3. Cleaner import statements
4. Matches standard TypeScript conventions

### Backward Compatibility

**Internal imports only:**
- This only affects imports within `apps/server`
- External packages still import normally: `import { X } from '@gauntlet/types'`
- No breaking changes to published APIs

---

## 🎯 Success Metrics

- [ ] Path aliases configured in tsconfig.json
- [ ] All imports using `@/lib` instead of relative paths
- [ ] No `.js` extensions in imports
- [ ] 0 TypeScript errors
- [ ] All tests pass

---

**Status:** ⏭️ Ready (blocked by REFACTOR-602)  
**Assignee:** _Unassigned_  
**Completed:** _Not Started_

