# Task: CLEAN-604-fix-package-json

## Overview
Fix `apps/server/package.json` to reflect that this is a background jobs package, not an HTTP server.

## Context Needed
- File: `apps/server/package.json` - Current configuration
- File: `apps/server/README.md` - Package purpose

## Objective
Update package.json metadata and scripts to match actual usage as a background jobs runner.

**Issues to Fix**:
1. `"main": "dist/index.js"` - This file doesn't exist (HTTP server deleted)
2. Missing script definitions that GitHub Actions calls
3. Misleading package description

## Steps
1. Read current `apps/server/package.json`
2. **Update/Remove `main` field**:
   - Option A: Remove it entirely (not a library)
   - Option B: Change to `"main": "dist/lib/historical-data.js"` (if used as import)
3. **Add missing scripts** referenced in GitHub Actions:
   ```json
   "scripts": {
     "build": "tsc",
     "postinstall": "prisma generate --schema=prisma/schema-historical.prisma",
     "prisma:migrate": "prisma migrate dev --schema=prisma/schema-historical.prisma",
     "prisma:generate": "prisma generate --schema=prisma/schema-historical.prisma",
     "live-snapshot": "tsx src/scripts/jobs/comprehensive-live-snapshot.ts",
     "audit:db": "tsx src/scripts/audit-database.ts"
   }
   ```
4. **Update package metadata**:
   ```json
   "description": "Background jobs for Gauntlet - live odds capture, database audit",
   ```
5. Verify all scripts work:
   ```bash
   pnpm --filter @gauntlet/server build
   pnpm --filter @gauntlet/server audit:db
   ```

## Acceptance Criteria
- [ ] `main` field removed or updated correctly
- [ ] All scripts referenced in GitHub Actions are defined
- [ ] Package description is accurate
- [ ] `pnpm build` works
- [ ] `pnpm live-snapshot` works (with DATABASE_URL)
- [ ] `pnpm audit:db` works (with DATABASE_URL)
- [ ] No script errors in package.json

## Estimated Context Usage
- Files to read: 1 (package.json)
- Lines to process: ~40
- New files: 0
- Risk: **Low** (simple metadata fix)

## Related Tasks
- **Depends on**: CLEAN-603 (dependencies cleaned up)
- **Related**: CLEAN-605 (README should document these scripts)

## Cursor Prompt
```
I'm working on CLEAN-604. Please:
1. Read tasks/CLEAN-604-fix-package-json.md
2. Read apps/server/package.json
3. Remove or fix the "main" field
4. Verify all scripts exist and are correct
5. Update description to match actual purpose
6. Test that scripts run successfully
```

## Commit Message
```
fix(CLEAN-604): update package.json for background jobs usage

- Remove "main" field (not an HTTP server)
- Add accurate package description
- Verify all script definitions match GitHub Actions usage
- Confirm build and audit scripts work
```

## Estimated Time
⏱️ **15 minutes**

## Verification
```bash
cd apps/server
pnpm build           # Should work
pnpm audit:db        # Should work (needs DATABASE_URL)
pnpm live-snapshot   # Should work (needs DATABASE_URL)
```

## Notes
- This package is NOT an HTTP server despite the old "main" field
- GitHub Actions calls these scripts directly via pnpm commands
- The package is used as a monorepo workspace, not a published npm package

