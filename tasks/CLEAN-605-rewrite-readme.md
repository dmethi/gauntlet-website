# Task: CLEAN-605-rewrite-readme

## Overview

Rewrite `apps/server/README.md` to accurately document the current minimal
state: 3 TypeScript files, 3 database models, 1 GitHub workflow.

## Context Needed

- File: `apps/server/README.md` - Current outdated documentation
- File: `apps/server/prisma/schema-historical.prisma` - Actual database schema
- File: `.github/workflows/live-sims.yml` - Actual workflow
- File: `apps/server/package.json` - Scripts and metadata

## Objective

Create accurate, concise documentation that reflects reality:

- **NOT** an HTTP server (despite the name)
- Only 3 TypeScript files exist
- Only 3 Prisma models exist
- Only 1 GitHub Actions workflow actively uses this package
- Purpose: Live odds snapshot capture every 10 minutes during NFL games

**Current README Issues**:

- Says "26 models" (WRONG: only 3)
- References `src/scripts/data-ingestion/` (doesn't exist)
- References `src/scripts/maintenance/` (doesn't exist)
- References `.github/workflows/daily-ingestion.yml` (doesn't exist)
- References `.github/workflows/live-odds-updates.yml` (doesn't exist)
- Has outdated "Cleanup Recommendations" section

## Steps

1. Read current `apps/server/README.md` to preserve any valuable content
2. Read `apps/server/prisma/schema-historical.prisma` to verify 3 models
3. Create new README structure:

````markdown
# @gauntlet/server - Background Jobs

⚠️ **This is NOT an HTTP server** - it's a background jobs package.

## Purpose

Captures live matchup odds snapshots during NFL games for historical analysis.

## What's Here

### Active Files (3 TypeScript Files)

1. `src/lib/historical-data.ts` - Prisma client wrapper for time-series data
2. `src/scripts/audit-database.ts` - Database audit utility
3. `src/scripts/jobs/comprehensive-live-snapshot.ts` - Live odds capture job

### Database (3 Models)

1. `LiveWinProbSample` - Win probability samples during games
2. `MatchupOddsHistory` - Matchup odds over time
3. `LeagueOddsHistory` - League-wide predictions

### GitHub Actions (1 Workflow)

- `.github/workflows/live-sims.yml` - Runs every 10 min during NFL games

## Architecture

[Simple diagram showing: GitHub Actions → Runs Scripts → Writes to PostgreSQL]

## Development

### Scripts

```bash
pnpm build           # Compile TypeScript
pnpm live-snapshot   # Capture current odds (needs DATABASE_URL)
pnpm audit:db        # Audit database usage (needs DATABASE_URL)
```
````

### Environment Variables

```
DATABASE_URL=postgresql://...
```

## Why "server"?

Legacy naming. This was originally an Express HTTP server but has been
simplified to background jobs only.

```

4. Write the new README
5. Remove outdated sections about:
   - Data ingestion scripts
   - Maintenance scripts
   - Multiple workflows
   - 26 models

## Acceptance Criteria
- [ ] New README accurately describes 3 TypeScript files
- [ ] Documents 3 Prisma models (not 26)
- [ ] Documents 1 GitHub workflow (not 3)
- [ ] Removes references to non-existent files/directories
- [ ] Clear about NOT being an HTTP server
- [ ] Includes simple development instructions
- [ ] Markdown properly formatted
- [ ] No broken links

## Estimated Context Usage
- Files to read: 3 (old README, schema, workflow)
- Lines to process: ~300
- New files: 1 (replace existing)
- Risk: **Low** (documentation only)

## Related Tasks
- **Depends on**: CLEAN-604 (package.json fixed)

## Cursor Prompt
```

I'm working on CLEAN-605. Please:

1. Read tasks/CLEAN-605-rewrite-readme.md
2. Read apps/server/README.md (current state)
3. Read apps/server/prisma/schema-historical.prisma (3 models)
4. Create new README following the structure in the task
5. Make it accurate, concise, and helpful

```

## Commit Message
```

docs(CLEAN-605): rewrite README to reflect current state

- Document 3 TypeScript files (not Express server)
- Document 3 Prisma models (not 26)
- Document 1 GitHub workflow (not 3)
- Remove references to deleted data ingestion scripts
- Remove references to non-existent maintenance scripts
- Clarify this is background jobs, not HTTP server

```

## Estimated Time
⏱️ **45 minutes**

## Notes
- Current README has good intentions but is 90% incorrect
- New README should be ~100 lines, not 185
- Focus on what EXISTS, not what was planned
- Be brutally honest about the minimal scope

```
