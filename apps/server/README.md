# Gauntlet Server - Background Jobs & Data Ingestion

⚠️ **This is NOT an HTTP server in production!**

## Purpose

This package contains **background job scripts** and **data ingestion
pipelines** that are executed by GitHub Actions workflows. The HTTP server
routes (`src/routes/*`) are **UNUSED** - the web app uses Next.js API routes
instead.

## Active Components

### ✅ Scripts (Called by GitHub Actions)

#### Data Ingestion (`src/scripts/data-ingestion/`)

- Ingests league, roster, matchup, and player data from Sleeper API
- Writes to PostgreSQL database via Prisma
- **Triggered by:** `.github/workflows/daily-ingestion.yml` (daily at 8am ET)

#### Live Jobs (`src/scripts/jobs/`)

- `comprehensive-live-snapshot.ts` - Captures live matchup data with win
  probabilities
- Runs Monte Carlo simulations for current matchups
- Stores historical odds snapshots
- **Triggered by:** `.github/workflows/live-odds-updates.yml` (every 10 min
  during NFL games)

#### Maintenance (`src/scripts/maintenance/`)

- `sync-team-names.ts` - Syncs team metadata from Sleeper
- `refresh-lineups.ts` - Updates matchup lineups before simulation
- **Triggered by:** `.github/workflows/live-odds-updates.yml` (before each
  snapshot)

### ✅ Database (Prisma)

- Schema: `prisma/schema.prisma` (26 models)
- Used by: Background jobs only
- Stores: Historical matchup data, simulations, player stats, live odds

### ❌ UNUSED: HTTP Server Routes

The following are **NOT used in production**:

- `src/index.ts` - Express server (never started)
- `src/routes/*` - API routes (replaced by Next.js API routes in web app)
- `src/services/*` - Service layer (if unused by scripts)

## Architecture

```
┌──────────────────────────────────────────────────────────────┐
│  Web App (apps/web)                                          │
│  - Next.js frontend + API routes                            │
│  - Calls Sleeper API directly (no database connection)      │
└──────────────────────────────────────────────────────────────┘
                            ↓
                   (NO CONNECTION)
                            ↓
┌──────────────────────────────────────────────────────────────┐
│  Background Jobs (apps/server)                               │
│  - GitHub Actions (cron) trigger scripts                     │
│  - Scripts fetch from Sleeper API                            │
│  - Scripts write to PostgreSQL via Prisma                    │
│  - Stores historical data for analytics                      │
└──────────────────────────────────────────────────────────────┘
```

### Key Insight

- **Web app:** Database-free, API-first (Sleeper API → Next.js API routes →
  Frontend)
- **Background jobs:** Database-driven (Sleeper API → Scripts → PostgreSQL)
- **They don't communicate:** Web app and background jobs are independent

## GitHub Actions Workflows

### 1. Live Odds Updates

**File:** `.github/workflows/live-odds-updates.yml` **Schedule:** Every 10
minutes during NFL game windows **Commands:**

```bash
pnpm --filter @gauntlet/server exec tsx src/scripts/maintenance/sync-team-names.ts
pnpm --filter @gauntlet/server exec tsx src/scripts/maintenance/refresh-lineups.ts
pnpm --filter @gauntlet/server exec tsx src/scripts/jobs/comprehensive-live-snapshot.ts
```

### 2. Live Simulations

**File:** `.github/workflows/live-sims.yml` **Schedule:** Every 10 minutes
during NFL game windows **Commands:**

```bash
pnpm --filter @gauntlet/server live-sims $LEAGUE_ID
```

### 3. Daily Data Ingestion

**File:** `.github/workflows/daily-ingestion.yml` **Schedule:** Daily at 8am ET
during NFL season **Commands:**

```bash
pnpm --filter @gauntlet/server ingest:current
```

## Database Models (Prisma Schema)

### Actively Used Models (by scripts)

- ✅ `League`, `Roster`, `User`, `Matchup` - Core Sleeper data
- ✅ `Transaction`, `TradedPick` - Transaction tracking
- ✅ `Draft`, `DraftPick` - Draft data
- ✅ `Player`, `PlayerStats` - Player information
- ✅ `MatchupSimulation`, `PlayerSimulation` - Live sim results
- ✅ `MatchupOddsHistory`, `LiveWinProbSample` - Historical tracking

### Potentially Unused Models (needs audit)

- ❓ `WeeklyMetrics` - May be computed on-the-fly now
- ❓ `PositionVariance`, `PlayerVariance`, `ProjectionError` - Variance data
- ❓ `MatchupSummary`, `RosterWeekAggregate`, `LeagueWeekSummary` - Aggregates
- ❓ `SeasonSuperlatives` - Season-end awards
- ❓ `HallOfFameCategory`, `HallOfFameRecord` - Hall of Fame tracking
- ❓ `LeagueOddsHistory` - League-wide odds

## Development

### Running Scripts Locally

```bash
# Install dependencies
pnpm install

# Generate Prisma client
pnpm exec prisma generate

# Run data ingestion
pnpm ingest:current

# Run live snapshot
pnpm exec tsx src/scripts/jobs/comprehensive-live-snapshot.ts

# Database operations
pnpm exec prisma studio    # View database
pnpm exec prisma migrate dev  # Run migrations
```

### Environment Variables

Required for scripts:

```bash
DATABASE_URL=postgresql://...  # PostgreSQL connection string
```

## Cleanup Recommendations

### Immediate (Safe):

1. ✅ Add this README
2. ✅ Document architecture in PRISMA_CLEANUP_ANALYSIS.md

### Medium-Term (Low Risk):

1. Remove unused HTTP server files:
   - `src/index.ts` (Express server)
   - `src/routes/*` (API routes)
   - `src/services/*` (if not used by scripts)
2. Audit Prisma schema for unused models
3. Remove web app Prisma generation (not needed)

### Long-Term (Requires Analysis):

1. Audit which models are actively written by scripts
2. Consider exposing historical data to web app
3. Evaluate if database is still needed or if can migrate to:
   - Vercel KV for caching
   - Static files for historical data
   - Real-time API calls only

## Common Questions

### Q: Why do we have a database if the web app doesn't use it?

**A:** Historical data storage for analytics and trends. Background jobs store
simulation results, live odds history, and player stats over time.

### Q: Can I remove the Express server routes?

**A:** Yes! They're not being used. The web app uses Next.js API routes instead.

### Q: How do I know which Prisma models are actually used?

**A:** Run this command to search for Prisma writes in scripts:

```bash
grep -r "prisma\." apps/server/src/scripts/ | grep -E "(create|update|upsert|delete)"
```

### Q: Why does the web app generate Prisma client on build?

**A:** Legacy artifact. It's not needed anymore and can be removed from
`apps/web/package.json`.

## Related Documentation

- [PRISMA_CLEANUP_ANALYSIS.md](../../PRISMA_CLEANUP_ANALYSIS.md) - Detailed
  analysis of database usage
- [DEPLOYMENT_GUIDE.md](../../DEPLOYMENT_GUIDE.md) - Deployment architecture
- [.cursorrules](../../.cursorrules) - Development conventions
