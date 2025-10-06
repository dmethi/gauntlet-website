# Task: CLEAN-601-delete-dead-code

## Overview
Delete the entire `apps/server/dist/` directory and remove dead code artifacts that no longer have source files.

## Context Needed
- Directory: `apps/server/dist/` - Compiled JavaScript (no matching TypeScript sources)
- File: `apps/server/.gitignore` - Verify dist/ is ignored
- File: `apps/server/package.json` - Check build scripts

## Objective
Clean up build artifacts and ensure only source-controlled TypeScript files remain. The `dist/` folder contains old Express server routes and services that no longer have corresponding source files.

## Steps
1. Verify `dist/` is in `.gitignore` (add if missing)
2. Delete entire `apps/server/dist/` directory
3. Run `pnpm --filter @gauntlet/server build` to regenerate from source
4. Verify only 3 TypeScript files compile:
   - `src/lib/historical-data.ts`
   - `src/scripts/audit-database.ts`
   - `src/scripts/jobs/comprehensive-live-snapshot.ts`
5. Confirm new `dist/` structure matches `src/` structure

## Acceptance Criteria
- [ ] Old `dist/` directory deleted
- [ ] `dist/` added to `.gitignore` if missing
- [ ] New `dist/` regenerated from `pnpm build`
- [ ] No `dist/index.js` (Express server) exists
- [ ] No `dist/routes/` directory exists
- [ ] No `dist/services/` directory exists
- [ ] Only 3 source files compile successfully
- [ ] Git status shows no changes to `dist/` (properly ignored)

## Estimated Context Usage
- Files to read: 2 (package.json, .gitignore)
- Lines to process: ~50
- Directories to delete: 1
- Risk: **Low** (can regenerate, old code unused)

## Related Tasks
- **Blocks**: CLEAN-602 (need clean state for tsconfig fix)

## Cursor Prompt
```
I'm working on CLEAN-601. Please:
1. Read tasks/CLEAN-601-delete-dead-code.md
2. Check if apps/server/.gitignore includes dist/
3. Delete apps/server/dist/ directory
4. Show me the build command to regenerate from source
5. Verify the new dist/ structure is correct
```

## Commit Message
```
chore(CLEAN-601): delete dead code from apps/server

- Remove entire dist/ directory with obsolete code
- Add dist/ to .gitignore if missing
- Rebuild from source (only 3 TS files)
- Remove Express server, routes, services artifacts
```

## Estimated Time
⏱️ **15 minutes**

## Notes
- The `dist/` folder contains compiled JavaScript from a deleted Express server
- Only 3 active TypeScript files should exist in source
- This cleanup is safe - all old code is unused in production

