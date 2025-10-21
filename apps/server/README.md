# @gauntlet/server - Background Jobs

⚠️ **This is NOT an HTTP server** - it's a background jobs package.

## Purpose

Captures live matchup odds snapshots during NFL games for historical analysis and time-series visualization.

## What's Here

### Active Files (3 TypeScript Files)

1. **`src/lib/historical-data.ts`** - Prisma client wrapper for time-series data
2. **`src/scripts/audit-database.ts`** - Database audit utility to analyze usage patterns
3. **`src/scripts/jobs/comprehensive-live-snapshot.ts`** - Live odds capture job with Monte Carlo simulations

### Database (3 Models)

Schema: `prisma/schema-historical.prisma`

1. **`LiveWinProbSample`** - Win probability samples captured during games (every 10 minutes)
   - Time-series data for charts showing how win probability changed during games
   - Used by: Weekly recap reports, matchup excitement metrics

2. **`MatchupOddsHistory`** - Matchup odds over time
   - Tracks how individual matchup odds changed over time
   - Used by: Matchup history charts, odds movement analysis

3. **`LeagueOddsHistory`** - League-wide predictions
   - Stores league-wide odds snapshots (highest scorer, closest matchup, etc.)
   - Used by: Weekly recap reports, league-wide trends

### GitHub Actions (1 Workflow)

**`.github/workflows/live-sims.yml`**

- **Schedule**: Runs every 10 minutes during NFL game windows (Thu-Mon)
- **Command**: `pnpm --filter @gauntlet/server live-snapshot`
- **Purpose**: Captures current matchup states, runs simulations, stores historical data
- **Timeout**: 10 minutes per execution

## Architecture

```
┌─────────────────────────────────────────────────────┐
│  GitHub Actions Scheduler (Cron)                    │
│  • Every 10 minutes during NFL games                │
│  • Thursday Night → Monday Night Football           │
└──────────────────┬──────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────┐
│  comprehensive-live-snapshot.ts                     │
│  1. Fetches current matchup data from Sleeper API   │
│  2. Runs Monte Carlo simulations (10K iterations)   │
│  3. Calculates win probabilities and odds           │
│  4. Writes snapshots to PostgreSQL                  │
└──────────────────┬──────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────┐
│  PostgreSQL Database                                │
│  • LiveWinProbSample (time-series data)            │
│  • MatchupOddsHistory (matchup odds tracking)      │
│  • LeagueOddsHistory (league-wide predictions)     │
└─────────────────────────────────────────────────────┘
```

## Design Decisions

- **Package, not service** – Distributed as a workspace package so web/API layers can import shared DB utilities without duplicating Prisma clients.
- **Resilient fetches** – Sleeper/Gauntlet API calls use `fetchWithRetry` with exponential backoff to tolerate transient failures.
- **Atomic persistence** – `saveSnapshotIfChanged` compares snapshots before writes to avoid noisy history when scores do not change.
- **Metrics hooks** – Jobs optionally emit metrics objects so they can be wired into observability stacks without changing core logic.
- **Environment isolation** – PostgreSQL credentials are required only when running snapshot jobs; the web app consumes historical data through package exports.

## Commands

```bash
pnpm --filter @gauntlet/server build          # Compile TypeScript to dist/
pnpm --filter @gauntlet/server test           # Vitest unit coverage
pnpm --filter @gauntlet/server live-snapshot  # Capture matchups (requires DATABASE_URL)
pnpm --filter @gauntlet/server audit:db       # Inspect historical DB usage
pnpm --filter @gauntlet/server prisma:generate
```

Document job-specific quirks inside `src/scripts/jobs/<name>.ts` so consumers understand scheduling assumptions and data contracts.

## Development

### Scripts

```bash
# Install dependencies
pnpm install

# Generate Prisma client
pnpm prisma:generate

# Compile TypeScript
pnpm build

# Capture current live odds snapshot (requires DATABASE_URL)
pnpm live-snapshot

# Audit database usage patterns (requires DATABASE_URL)
pnpm audit:db

# Run database migrations
pnpm prisma:migrate
```

### Environment Variables

```bash
DATABASE_URL=postgresql://user:pass@host:5432/dbname
```

## Why "server"?

**Legacy naming.** This package was originally an Express HTTP server but has been simplified to background jobs only. The name stuck around.

**Current reality:**

- ❌ No HTTP server running
- ❌ No Express routes
- ❌ No API endpoints
- ✅ Just scheduled background jobs

## How It Works

### Live Snapshot Flow

1. **Trigger**: GitHub Actions cron runs every 10 minutes during NFL games
2. **Fetch**: Script fetches current matchup data from Sleeper API
3. **Simulate**: Runs 10,000 Monte Carlo simulations per matchup
4. **Calculate**: Computes win probabilities, spreads, totals, and money lines
5. **Store**: Writes snapshot to PostgreSQL with timestamp
6. **Repeat**: Process repeats throughout the game (18+ snapshots per 3-hour game)

### Data Usage

The web app (`apps/web`) **does NOT** use this database. It calls the Sleeper API directly.

This database is for:

- **Historical analysis**: "How did win probability change during the game?"
- **Trends over time**: "How accurate were our pre-game predictions?"
- **Excitement metrics**: "Which games had the most volatility?"
- **Narrative generation**: "What were the most dramatic moments?"

## Common Questions

### Q: Why doesn't the web app use this database?

**A:** Design decision to keep the web app database-free and API-first. The web app fetches everything from Sleeper API in real-time. This database is purely for historical analytics that Sleeper doesn't provide (like win probability over time).

### Q: How much data does this generate?

**A:** Approximately:

- **18 snapshots per game** (10-minute intervals × 3-hour game)
- **12 matchups per week** (6 per league × 2 leagues)
- **216 records per week** (18 × 12) in `LiveWinProbSample`
- **Plus** additional records in `MatchupOddsHistory` and `LeagueOddsHistory`

### Q: Can I run this locally?

**A:** Yes, but you need:

1. A PostgreSQL database
2. `DATABASE_URL` environment variable set
3. Run `pnpm live-snapshot` when games are active

**Note:** It won't do anything useful outside of NFL game windows since there's no live data to capture.

### Q: What happened to the other 23 Prisma models?

**A:** They were removed as part of a database cleanup. The old README mentioned "26 models" but only these 3 are actively used. See commit history for details.

## Related Documentation

- [DEPLOYMENT_GUIDE.md](../../DEPLOYMENT_GUIDE.md) - Deployment architecture
- [.cursorrules](../../.cursorrules) - Development conventions
- [TASK_SYSTEM.md](../../TASK_SYSTEM.md) - Task management system

## Notes

This package is intentionally minimal:

- **3 TypeScript files** - Only what's needed for live snapshots
- **3 Prisma models** - Only time-series data Sleeper doesn't provide
- **1 GitHub workflow** - Runs during NFL games only
- **No HTTP server** - Despite the misleading name

If you need to add more background jobs, this is the right place. If you need API endpoints for the web app, use Next.js API routes in `apps/web/src/app/api/` instead.
