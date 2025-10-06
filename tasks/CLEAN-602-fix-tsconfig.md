# Task: CLEAN-602-fix-tsconfig

## Overview
Fix TypeScript configuration to match actual source directory structure.

## Context Needed
- File: `apps/server/tsconfig.json` - Current broken config
- Directory: `apps/server/src/` - Actual source structure
- Reference: `tsconfig.base.json` - Base configuration

## Objective
Update `tsconfig.json` to compile the actual source files instead of referencing non-existent paths.

**Current (WRONG)**:
```json
"include": [
  "src/index.ts",       // ❌ Doesn't exist
  "src/lib/**/*.ts",
  "src/routes/**/*.ts",  // ❌ Doesn't exist
  "src/services/**/*.ts" // ❌ Doesn't exist
],
"exclude": ["src/scripts/**"] // ❌ Excluding active code!
```

**Target (CORRECT)**:
```json
"include": [
  "src/lib/**/*.ts",
  "src/scripts/**/*.ts"  // ✅ Include, not exclude!
],
"exclude": ["node_modules", "dist", "**/*.test.ts", "**/*.spec.ts"]
```

## Steps
1. Read current `apps/server/tsconfig.json`
2. Remove references to non-existent files:
   - Remove `src/index.ts`
   - Remove `src/routes/**/*.ts`
   - Remove `src/services/**/*.ts`
3. Move `src/scripts/**` from `exclude` to `include`
4. Keep standard excludes (node_modules, dist, tests)
5. Run `pnpm --filter @gauntlet/server tsc --noEmit` to verify
6. Verify no TypeScript errors
7. Run `pnpm --filter @gauntlet/server build` to test compilation

## Acceptance Criteria
- [ ] `tsconfig.json` includes only existing paths
- [ ] `src/scripts/**` is in `include` array
- [ ] No references to deleted files
- [ ] `pnpm tsc --noEmit` passes with 0 errors
- [ ] `pnpm build` completes successfully
- [ ] All 3 source files compile to dist/

## Estimated Context Usage
- Files to read: 1 (tsconfig.json)
- Lines to process: ~20
- New files: 0 (modify existing)
- Risk: **Low** (TypeScript validates)

## Related Tasks
- **Depends on**: CLEAN-601 (clean dist/ first)
- **Blocks**: EXTRACT-601, EXTRACT-602 (need working build)

## Cursor Prompt
```
I'm working on CLEAN-602. Please:
1. Read tasks/CLEAN-602-fix-tsconfig.md
2. Read apps/server/tsconfig.json
3. Update include/exclude arrays to match actual src/ structure
4. Remove all references to non-existent files
5. Verify with: pnpm --filter @gauntlet/server tsc --noEmit
```

## Commit Message
```
fix(CLEAN-602): update tsconfig to match actual source structure

- Remove references to deleted files (index.ts, routes/, services/)
- Move src/scripts/** from exclude to include
- Fix compilation to process all 3 active TypeScript files
- Verify build passes with updated config
```

## Estimated Time
⏱️ **15 minutes**

## Verification
```bash
cd apps/server
pnpm tsc --noEmit    # Should pass with 0 errors
pnpm build           # Should compile 3 files successfully
```

