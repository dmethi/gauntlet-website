# WEB-SETUP-004: Create Feature Folder Structure

**Category**: SETUP  
**Priority**: 🟡 HIGH  
**Estimated Time**: 30 minutes  
**Dependencies**: None (can run in parallel with other SETUP tasks)

---

## Objective

Create empty feature folders matching the proposed architecture to enable incremental migration from flat structure to feature-based organization.

---

## Context Needed

**Read these files**:
1. `apps/web/ENTERPRISE_READINESS_ASSESSMENT.md` (lines 280-400 - proposed structure)

**Total Context**: ~120 lines

---

## Steps

### 1. Create Features Directory and Subdirectories

```bash
cd /Users/dhruv.methi/Documents/GitHub/gauntlet-website/apps/web/src

# Create main features directory
mkdir -p features

# Create feature subdirectories
mkdir -p features/draft-analysis/{components,hooks,utils}
mkdir -p features/matchups/{components,hooks,utils}
mkdir -p features/stats/{components,hooks,utils}
mkdir -p features/hall-of-fame/{components,hooks,utils}
mkdir -p features/transactions/{components,hooks,utils}
mkdir -p features/start-sit/{components,hooks,utils}
```

### 2. Create Shared Directory Structure

```bash
# Create shared directory structure
mkdir -p shared/{components,hooks,utils,types,atoms}
mkdir -p shared/components/{layouts,charts,primitives}
mkdir -p shared/utils/{formatting,colors,calculations}
```

### 3. Create Empty Barrel Exports

For each feature, create empty `index.ts` and `types.ts` files:

```bash
# Draft Analysis
touch features/draft-analysis/index.ts
touch features/draft-analysis/types.ts
touch features/draft-analysis/components/index.ts
touch features/draft-analysis/hooks/index.ts
touch features/draft-analysis/utils/index.ts

# Matchups
touch features/matchups/index.ts
touch features/matchups/types.ts
touch features/matchups/components/index.ts
touch features/matchups/hooks/index.ts
touch features/matchups/utils/index.ts

# Stats
touch features/stats/index.ts
touch features/stats/types.ts
touch features/stats/components/index.ts
touch features/stats/hooks/index.ts
touch features/stats/utils/index.ts

# Hall of Fame
touch features/hall-of-fame/index.ts
touch features/hall-of-fame/types.ts
touch features/hall-of-fame/components/index.ts
touch features/hall-of-fame/hooks/index.ts
touch features/hall-of-fame/utils/index.ts

# Transactions
touch features/transactions/index.ts
touch features/transactions/types.ts
touch features/transactions/components/index.ts
touch features/transactions/hooks/index.ts
touch features/transactions/utils/index.ts

# Start/Sit
touch features/start-sit/index.ts
touch features/start-sit/types.ts
touch features/start-sit/components/index.ts
touch features/start-sit/hooks/index.ts
touch features/start-sit/utils/index.ts
```

### 4. Create Shared Directory Barrel Exports

```bash
# Shared barrel exports
touch shared/index.ts
touch shared/components/index.ts
touch shared/components/layouts/index.ts
touch shared/components/charts/index.ts
touch shared/components/primitives/index.ts
touch shared/hooks/index.ts
touch shared/utils/index.ts
touch shared/utils/formatting/index.ts
touch shared/utils/colors/index.ts
touch shared/utils/calculations/index.ts
touch shared/types/index.ts
touch shared/atoms/index.ts
```

### 5. Add Placeholder Comments to Key Files

Add placeholder comments to feature-level `index.ts` files:

`features/draft-analysis/index.ts`:
```typescript
/**
 * Draft Analysis Feature
 * 
 * Exports:
 * - Components for manager analysis, position inflation, draft insights
 * - Hooks for draft data fetching and calculations
 * - Utilities for draft calculations and formatting
 * 
 * Note: This feature is currently being migrated from flat structure.
 * Files will be added as part of WEB-EXTRACT-*, WEB-UTIL-*, WEB-HOOK-*, WEB-COMP-* tasks.
 */

// TODO: Add component exports when components are migrated
// export * from './components';

// TODO: Add hook exports when hooks are migrated
// export * from './hooks';

// TODO: Add utility exports when utilities are migrated
// export * from './utils';

// TODO: Add type exports
// export type * from './types';
```

Repeat similar pattern for all feature `index.ts` files.

### 6. Create .gitkeep Files for Empty Directories

```bash
# Add .gitkeep to preserve empty directories in git
find features -type d -empty -exec touch {}/.gitkeep \;
find shared -type d -empty -exec touch {}/.gitkeep \;
```

### 7. Verify Structure

```bash
# List the structure
tree -L 3 features shared

# Or if tree is not available:
find features shared -type d | sort
```

---

## Acceptance Criteria

- [ ] `features/` directory created with 6 feature subdirectories
- [ ] Each feature has `components/`, `hooks/`, `utils/` subdirectories
- [ ] `shared/` directory created with proper subdirectories
- [ ] All directories have `index.ts` files
- [ ] All features have `types.ts` files
- [ ] Placeholder comments added to feature-level `index.ts` files
- [ ] .gitkeep files added to empty directories
- [ ] TypeScript compilation still works (no breaking changes)
- [ ] Next.js build succeeds

---

## Verification Commands

```bash
# Verify directory structure
cd /Users/dhruv.methi/Documents/GitHub/gauntlet-website/apps/web/src
ls -la features/
ls -la features/*/
ls -la shared/

# Verify TypeScript compilation
cd /Users/dhruv.methi/Documents/GitHub/gauntlet-website/apps/web
pnpm tsc --noEmit

# Verify Next.js build (optional - takes time)
# pnpm build
```

---

## Cursor Prompt (Copy-Paste Ready)

```
I'm working on WEB-SETUP-004: Create Feature Folder Structure. Please:

1. Read apps/web/ENTERPRISE_READINESS_ASSESSMENT.md (lines 280-400)

Then:
2. Create features/ directory with 6 feature subdirectories
3. Create shared/ directory with proper subdirectories
4. Create empty index.ts and types.ts files for each feature
5. Add placeholder comments to feature-level index.ts files
6. Add .gitkeep files to preserve empty directories
7. Verify TypeScript compilation still works

Follow the steps in the task file exactly.
```

---

## Related Tasks

**Blocks**:
- All WEB-EXTRACT-* tasks (need directories to extract into)
- All WEB-UTIL-* tasks (need directories for utilities)
- All WEB-HOOK-* tasks (need directories for hooks)
- All WEB-COMP-* tasks (need directories for components)

**Blocked By**: None

**Related**:
- ENTERPRISE_READINESS_ASSESSMENT.md (defines structure)

---

## Notes

- This task creates the skeleton structure without moving any code
- Empty index.ts files have placeholder comments for future exports
- .gitkeep files ensure git tracks empty directories
- TypeScript compilation should succeed (no code changes)
- Next.js build should succeed (no breaking changes)
- This enables parallel work on multiple migration tasks
- Features will be populated gradually through subsequent tasks

---

**Estimated Context Usage**: 120 lines read, 50 commands executed, 30 minutes total

