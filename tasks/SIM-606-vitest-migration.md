# Task SIM-606: Migrate from Jest to Vitest

**Category:** SETUP  
**Priority:** 🟡 MEDIUM  
**Estimated Time:** 30 minutes  
**Package:** apps/sim-engine

---

## 📋 Overview

Migrate testing infrastructure from Jest to Vitest to align with apps/server patterns and leverage faster test execution with native ESM support.

---

## 🎯 Objective

Remove Jest dependencies, install Vitest with coverage tooling, and configure for TypeScript + ESM support matching apps/server setup.

---

## 📂 Context Needed

**Files to Read:**
- `apps/server/vitest.config.ts` (full file) - Reference Vitest config
- `apps/sim-engine/package.json` (lines 1-25) - Current test scripts

**Files to Create:**
- `apps/sim-engine/vitest.config.ts` - Vitest configuration

**Files to Update:**
- `apps/sim-engine/package.json` - Update test scripts and dependencies
- `apps/sim-engine/tsconfig.json` - Exclude test files

---

## 📝 Steps

### 1. Remove Jest Dependencies

```bash
cd apps/sim-engine
pnpm remove jest @types/jest ts-jest
```

### 2. Install Vitest Dependencies

```bash
pnpm add -D vitest @vitest/ui @vitest/coverage-v8
```

### 3. Create vitest.config.ts

Create `apps/sim-engine/vitest.config.ts`:

```typescript
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      exclude: [
        'node_modules/**',
        'dist/**',
        '**/*.test.ts',
        '**/*.spec.ts',
        '**/types.ts',
        'vitest.config.ts',
      ],
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 75,
        statements: 80,
      },
    },
  },
});
```

### 4. Update package.json Scripts

Update `apps/sim-engine/package.json`:

```json
{
  "scripts": {
    "build": "tsc",
    "dev": "tsc -w",
    "test": "vitest run",
    "test:watch": "vitest watch",
    "test:coverage": "vitest run --coverage",
    "test:ui": "vitest --ui"
  }
}
```

### 5. Update tsconfig.json

Update `apps/sim-engine/tsconfig.json` to exclude test files:

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "./dist",
    "declaration": true,
    "noEmit": false,
    "composite": true,
    "resolveJsonModule": true,
    "allowSyntheticDefaultImports": true
  },
  "include": ["src/**/*", "src/**/*.json"],
  "exclude": [
    "node_modules",
    "dist",
    "**/*.test.ts",
    "**/*.spec.ts",
    "**/__tests__/**"
  ]
}
```

### 6. Verify Vitest Works

```bash
# Should run (may have 0 tests before SIM-605)
pnpm test

# Should open UI
pnpm test:ui

# Should generate coverage report
pnpm test:coverage
```

### 7. Update .gitignore

Add to `apps/sim-engine/.gitignore` (or root `.gitignore`):

```
# Test coverage
coverage/
.vitest/
```

---

## ✅ Acceptance Criteria

- [ ] Jest dependencies removed from package.json
- [ ] Vitest dependencies installed (vitest, @vitest/ui, @vitest/coverage-v8)
- [ ] `vitest.config.ts` created with coverage thresholds (80%)
- [ ] Test scripts updated in package.json
- [ ] `pnpm test` runs with Vitest
- [ ] `pnpm test:ui` opens Vitest UI
- [ ] `pnpm test:coverage` generates coverage report
- [ ] TypeScript compilation still works
- [ ] No breaking changes to existing tests (if any)

---

## 🔗 Related Tasks

**Depends On:** None (foundation task)

**Blocks:**
- SIM-605: Add Comprehensive Test Suite (needs Vitest infrastructure)

---

## 📊 Context Usage

- **Files to read:** 2 files (~100 lines)
- **Files to create:** 1 file (~40 lines)
- **Files to update:** 2 files (~50 lines)
- **Time estimate:** 30 minutes

---

## 🚀 Cursor Prompt

```
I'm working on SIM-606. Please:

1. Read apps/server/vitest.config.ts for reference
2. Read apps/sim-engine/package.json
3. Remove Jest dependencies
4. Install Vitest dependencies
5. Create vitest.config.ts with 80% coverage thresholds
6. Update package.json test scripts
7. Verify with pnpm test

Follow the task steps exactly.
```

---

## ✓ Verification Commands

```bash
# Verify Vitest installed
pnpm list vitest

# Verify Jest removed
pnpm list jest  # Should return "not found"

# Verify test scripts work
cd apps/sim-engine
pnpm test
pnpm test:ui

# Verify TypeScript compilation
pnpm build
```

---

## 📝 Commit Message Template

```
build(sim-engine): migrate from Jest to Vitest (SIM-606)

- Remove Jest dependencies (jest, @types/jest, ts-jest)
- Install Vitest with UI and coverage tools
- Create vitest.config.ts with 80% coverage thresholds
- Update test scripts: test, test:watch, test:coverage, test:ui
- Update tsconfig.json to exclude test files
- Aligns with apps/server testing infrastructure
- Foundation ready for comprehensive test suite

Part of sim-engine enterprise readiness initiative
```

