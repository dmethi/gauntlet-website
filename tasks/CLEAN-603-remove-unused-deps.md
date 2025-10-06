# Task: CLEAN-603-remove-unused-deps

## Overview
Remove unused dependencies from `apps/server/package.json` that were part of the deleted Express HTTP server.

## Context Needed
- File: `apps/server/package.json` (lines 18-38) - Dependencies section
- File: `apps/server/src/scripts/jobs/comprehensive-live-snapshot.ts` - Check for axios/lodash usage
- File: `apps/server/src/lib/historical-data.ts` - Check dependencies

## Objective
Remove HTTP server dependencies that are no longer needed since the Express server was deleted.

**Definitely Unused** (can remove):
```json
"express": "^4.19.2",    // ❌ No HTTP server
"cors": "^2.8.5",        // ❌ Not needed
"helmet": "^7.1.0",      // ❌ Not needed
"@types/express": "^4.17.21",  // ❌ Dev dependency
```

**Needs Audit** (verify usage):
```json
"axios": "^1.6.0",       // ❓ May be used in comprehensive-live-snapshot.ts
"lodash": "^4.17.21",    // ❓ May be used in scripts
"@types/lodash": "^4.17.20"  // ❓ Dev dependency
```

## Steps
1. Search for `express` usage in `src/`:
   ```bash
   grep -r "from 'express'" apps/server/src/
   ```
2. Search for `cors` usage in `src/`
3. Search for `helmet` usage in `src/`
4. Search for `axios` usage in `src/` (keep if found)
5. Search for `lodash` usage in `src/` (keep if found)
6. Remove confirmed unused dependencies:
   ```bash
   cd apps/server
   pnpm remove express cors helmet @types/express
   ```
7. If axios/lodash are unused, remove them too
8. Run `pnpm install` to update lockfile
9. Run `pnpm build` to verify everything still compiles

## Acceptance Criteria
- [ ] `express` removed from dependencies
- [ ] `cors` removed from dependencies
- [ ] `helmet` removed from dependencies
- [ ] `@types/express` removed from devDependencies
- [ ] Axios kept only if actually used in code
- [ ] Lodash kept only if actually used in code
- [ ] `pnpm build` passes successfully
- [ ] `pnpm-lock.yaml` updated
- [ ] No import errors

## Estimated Context Usage
- Files to read: 2 (package.json + 1 script to check usage)
- Lines to process: ~100
- New files: 0
- Risk: **Low** (can re-add if needed)

## Related Tasks
- **Depends on**: CLEAN-602 (need working build to test)

## Cursor Prompt
```
I'm working on CLEAN-603. Please:
1. Read tasks/CLEAN-603-remove-unused-deps.md
2. Read apps/server/package.json
3. Search for usage of express, cors, helmet, axios, lodash in apps/server/src/
4. Remove confirmed unused dependencies
5. Verify build still works
```

## Commit Message
```
chore(CLEAN-603): remove unused HTTP server dependencies

- Remove express, cors, helmet (HTTP server deleted)
- Remove @types/express (no longer needed)
- [If applicable] Remove axios (not used in scripts)
- [If applicable] Remove lodash (not used in scripts)
- Update pnpm-lock.yaml
```

## Estimated Time
⏱️ **15 minutes**

## Verification
```bash
cd apps/server
pnpm build           # Should pass
pnpm live-snapshot   # Should run without errors (if DATABASE_URL set)
```

## Notes
- Express server was deleted - these deps are definitely unused
- Axios/lodash may be used in background jobs - verify before removing
- Can always re-add if missed something

