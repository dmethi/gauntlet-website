# Task: EXTRACT-001 - Manager Analysis Types

## Overview

Extract all TypeScript interfaces and types from `manager-analysis.tsx` to a
dedicated `types.ts` file.

## Context Needed

- File: `apps/web/src/components/manager-analysis.tsx` (lines 46-48 ONLY - just
  the props interface)
- Reference: `apps/web/src/lib/manager-analytics.ts` (types are imported from
  here)

## Objective

Separate type definitions from component implementation for better organization.

## Steps

### 1. Identify Types to Extract

Currently in `manager-analysis.tsx` lines 46-48:

```typescript
interface ManagerAnalysisProps {
  analytics: ManagerAnalytics;
}
```

### 2. Create Feature Folder Structure

```bash
mkdir -p apps/web/src/features/manager-analysis/components/ManagerAnalysis
```

### 3. Create Types File

Create `apps/web/src/features/manager-analysis/types.ts`:

```typescript
import type { ManagerAnalytics, ManagerProfile } from '@/lib/manager-analytics';

/**
 * Props for ManagerAnalysis component
 */
export interface ManagerAnalysisProps {
  /** Pre-computed manager analytics from draft engine */
  analytics: ManagerAnalytics;
}

/**
 * Sort configuration for manager table
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
  | 'top4'
  | 'top5'
  | 'patience_score'
  | 'cluster';

// Re-export commonly used types for convenience
export type { ManagerAnalytics, ManagerProfile } from '@/lib/manager-analytics';
```

### 4. Update Component File

In `manager-analysis.tsx`, update the import:

```typescript
// OLD (line 28):
import {
  ManagerAnalytics,
  ManagerProfile,
  PlayerOverlap,
} from '@/lib/manager-analytics';

// NEW:
import type {
  ManagerAnalytics,
  ManagerProfile,
  PlayerOverlap,
} from '@/lib/manager-analytics';
import type {
  ManagerAnalysisProps,
  SortConfig,
  SortKey,
} from '@/features/manager-analysis/types';

// Remove the inline interface (lines 46-48):
// interface ManagerAnalysisProps {
//   analytics: ManagerAnalytics;
// }
```

### 5. Create Index File

Create `apps/web/src/features/manager-analysis/index.ts`:

```typescript
/**
 * Manager Analysis Feature
 *
 * IMPORTANT: Features only export components that are used by routes.
 * This prevents cross-feature imports.
 */
export type { ManagerAnalysisProps } from './types';
// Component export will be added after COMP-001
```

### 6. Verify TypeScript

```bash
cd apps/web
pnpm tsc --noEmit
```

## Acceptance Criteria

- [ ] `types.ts` file created with all type definitions
- [ ] JSDoc comments added to all exported types
- [ ] Original component imports from types.ts
- [ ] No TypeScript errors
- [ ] SortConfig and SortKey types defined (needed for future tasks)
- [ ] Feature folder structure created
- [ ] Index file created

## Estimated Context Usage

- Files to read: 1 (manager-analysis.tsx lines 28, 46-48)
- Lines to process: ~50
- New files: 2 (types.ts, index.ts)
- Risk: **Low** (TypeScript validates everything)

## Related Tasks

- **Depends on**: None (can start immediately)
- **Blocks**: UTIL-001, HOOK-001 (need types first)

## Cursor Prompt

```
I'm working on EXTRACT-001. Please:

1. Read tasks/EXTRACT-001-manager-analysis-types.md
2. Read apps/web/src/components/manager-analysis.tsx lines 28 and 46-48 only
3. Create the types.ts file as specified in the task
4. Update the imports in manager-analysis.tsx
5. Verify no TypeScript errors

Follow the task steps exactly.
```

## Verification Commands

```bash
# Should compile without errors
pnpm tsc --noEmit

# Should find the new types file
ls apps/web/src/features/manager-analysis/types.ts

# Should show the new import in manager-analysis.tsx
grep "from '@/features/manager-analysis/types'" apps/web/src/components/manager-analysis.tsx
```

## Commit Message

```
feat(EXTRACT-001): extract manager-analysis types

- Create features/manager-analysis/types.ts
- Move ManagerAnalysisProps to types file
- Add SortConfig and SortKey types
- Add JSDoc comments
- Update imports in manager-analysis.tsx
```

## Estimated Time

⏱️ **15-20 minutes**

## Notes

- This is a very safe first refactoring task
- TypeScript will catch any mistakes
- Sets up folder structure for future tasks
- Adds types we'll need for hooks/utils extraction
