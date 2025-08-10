# Gauntlet Deployment Guide

## Architecture Overview

```
Sleeper Webhooks → Vercel API Routes → Vercel KV
GitHub Actions (cron) → API Routes → Update Data
Next.js Frontend → API Routes → Display Data
```

## Recommended Stack (Free/Cheap)

**Frontend + Backend: Vercel ($0/month)**

- Next.js app with API routes
- Vercel KV for data storage (30MB free)
- Built-in webhooks and cron support

**Job Scheduling: GitHub Actions (Free)**

- Runs your data updates on schedule
- Reliable, version-controlled
- No server costs

## Setup Steps

### 1. Deploy to Vercel

```bash
cd apps/web
npx vercel
```

### 2. Add Environment Variables in Vercel

```
API_SECRET=your-random-secret-key
```

### 3. Set GitHub Repository Secrets

In your GitHub repo settings → Secrets:

```
API_BASE_URL=https://your-app.vercel.app
API_SECRET=same-as-vercel-secret
```

### 4. Update League IDs

Edit these files with your actual Sleeper league IDs:

- `apps/web/src/app/api/update-leagues/route.ts`
- Update the `LEAGUE_IDS` array

### 5. Setup Sleeper Webhooks (Optional)

In Sleeper app settings, add webhook URL:

```
https://your-app.vercel.app/api/webhook/sleeper
```

## Data Flow

**Scheduled Updates (GitHub Actions):**

1. Live win-probability: `.github/workflows/live-sims.yml` runs every 10 minutes during NFL windows (Weeks 1–17) based on the published 2025 schedule ([source](https://operations.nfl.com/gameday/nfl-schedule/2025-nfl-schedule/))
2. Manual trigger: run workflow with `leagueId` input
3. Optional: add weekly ingestion/rollups jobs as needed

**Real-time Updates (Sleeper Webhooks):**

1. Trades, pickups, drops trigger immediate updates
2. Waiver processing updates

**Frontend:**

1. Static pages load instantly
2. Data fetched from API routes
3. Cached in Vercel KV

## Storage

PostgreSQL (Prisma)

- Core domain models (League, Roster, Matchup, Player, PlayerStats)
- Variance models (PositionVariance, PlayerVariance)
- Live win-prob snapshots (LiveWinProbSample)

## Monitoring

**Vercel Dashboard:**

- Function logs
- Performance metrics
- Error tracking

**GitHub Actions:**

- Job status and logs
- Failed run notifications

## Cost Breakdown

```
Vercel Hobby: $0/month
- 100GB bandwidth
- 6,000 build minutes
- 30MB KV storage

GitHub Actions: $0/month
- 2,000 minutes free
- Perfect for your cron jobs

Total: $0/month (until you scale)
```

## Next Steps

1. **Add storage layer**: Implement Vercel KV in your API routes
2. **Connect sim-engine**: Integrate your simulation logic (already integrated, see `apps/server/src/routes/calculate-win-prob.ts`)
3. **Add error handling**: Retry logic, dead letter queues
4. **Setup monitoring**: Sentry for error tracking

## Live Sims: How To Run

### Local

- Ensure `DATABASE_URL` is set
- Ingest and hydrate variance
  - `pnpm --filter @gauntlet/server exec tsx src/scripts/data-ingestion/index.ts`
  - `pnpm --filter @gauntlet/server metrics:calc 2022 && pnpm --filter @gauntlet/server metrics:calc 2023 && pnpm --filter @gauntlet/server metrics:calc 2024`
  - `pnpm --filter @gauntlet/server readiness:variance 2023`
- Run manual live sims job
  - `pnpm --filter @gauntlet/server live-sims <leagueId>`
- Call API
  - `POST /api/calculate-win-prob` with `{ matchups, iterations?, gameProgressOverride? }`

### CI

- Uses ESPN scoreboard for live game state
- Persists time-series to `LiveWinProbSample`
- Safe to over-schedule; job exits if no “in” games

## Scaling Path

When you need more:

- **Vercel Pro**: $20/month (more bandwidth, KV storage)
- **PlanetScale**: $29/month (proper PostgreSQL)
- **Railway**: $5-20/month (background jobs, more control)

Your current setup will handle 50 users easily. Only upgrade when you actually
need it.
