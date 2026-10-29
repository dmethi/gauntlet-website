# Deployment Guide

Complete guide for deploying and managing the Gauntlet application in
production.

## Architecture Overview

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Vercel Edge   │────▶│   Next.js API   │────▶│   PostgreSQL    │
│   (Frontend)    │     │   (Backend)     │     │   (Database)    │
└─────────────────┘     └─────────────────┘     └─────────────────┘
         │                       │
         │              ┌────────┴────────┐
         │              │                 │
         ▼              ▼                 ▼
┌─────────────────┐  ┌──────────┐   ┌──────────────┐
│ driveFF         │  │cron-job. │   │ Manual       │
│  (Live Odds)    │  │   org    │   │ scripts      │
└─────────────────┘  │ (Recaps) │   │(Variance,    │
                     └──────────┘   │ odds backup) │
                                    └──────────────┘
```

No GitHub Actions run for this repo. CI runs locally (`scripts/ci-local.sh`, see
`docs/AGENTS.md`), and the former scheduled workflows are now manual scripts.

## How Deploys Happen

Vercel's Git integration deploys this repo. Nothing in the repo triggers a
deploy.

- Two Vercel projects build from `main`, both with root directory `apps/web` and
  the settings in `apps/web/vercel.json`:
  - `gauntlet-website` serves `gauntletff.com` and
    `gauntlet-website.vercel.app`.
  - `gauntlet-website-web` serves `gauntlet-website-web.vercel.app`.
  - Why there are two projects is not documented. Confirm before you delete
    either one.
- A merge to `main` makes a production deployment in both projects. Each one
  posts a `Vercel – <project>` commit status.
- Every pushed branch gets a preview deployment in both projects.
- Merge with `scripts/merge-pr.sh <N>` after
  `scripts/ci-local.sh --pr <N> --post-status` passes. The merge is the deploy.
- Neither project defines Vercel Cron jobs.

To check a deploy, read the statuses on the commit:

```bash
gh api repos/dmethi/gauntlet-website/commits/<sha>/statuses \
  --jq '.[] | "\(.context) \(.state)"'
```

The `vercel` CLI steps below are for first-time setup or a manual deploy. You
don't need them for a normal release.

## Prerequisites

| Tool                                      | Version  | Required | Notes               |
| ----------------------------------------- | -------- | -------- | ------------------- |
| [Vercel CLI](https://vercel.com/docs/cli) | Latest   | Yes      | For deployments     |
| [Node.js](https://nodejs.org/)            | ≥ 20.9.0 | Yes      | LTS recommended     |
| [pnpm](https://pnpm.io/)                  | ≥ 9.0.0  | Yes      | Package manager     |
| [Git](https://git-scm.com/)               | Latest   | Yes      | For version control |
| PostgreSQL                                | 14+      | Yes      | Production database |

### Installing Vercel CLI

```bash
# Using npm
npm install -g vercel

# Using pnpm
pnpm add -g vercel
```

Verify installation:

```bash
vercel --version  # Should show latest version
```

## Initial Deployment

### 1. Login to Vercel

```bash
vercel login
```

This opens a browser window to authenticate with your Vercel account.

### 2. Deploy from apps/web

```bash
cd apps/web
npx vercel
```

Follow the prompts:

- Link to existing project? **Yes** (if project exists) or **No** (to create
  new)
- Set project name and scope

### 3. Configure Build Settings

The project uses a monorepo setup. Ensure these settings in Vercel dashboard:

| Setting          | Value                                                 |
| ---------------- | ----------------------------------------------------- |
| Framework Preset | Next.js                                               |
| Build Command    | `cd ../.. && pnpm turbo build --filter=@gauntlet/web` |
| Install Command  | `cd ../.. && pnpm install`                            |
| Output Directory | `.next`                                               |
| Root Directory   | `apps/web`                                            |

Or use the existing `vercel.json`:

```json
{
  "buildCommand": "cd ../.. && pnpm turbo build --filter=@gauntlet/web",
  "devCommand": "cd ../.. && pnpm dev --filter=@gauntlet/web",
  "installCommand": "cd ../.. && pnpm install",
  "framework": "nextjs",
  "outputDirectory": ".next"
}
```

### 4. Deploy to Production

```bash
# After initial setup, deploy with:
vercel --prod
```

## Environment Variables

### Required Variables (Vercel)

Set these in Vercel Dashboard → Project Settings → Environment Variables:

| Variable                            | Required    | Description                                      | Example                                     |
| ----------------------------------- | ----------- | ------------------------------------------------ | ------------------------------------------- |
| `DATABASE_URL`                      | Yes         | PostgreSQL connection string                     | `postgresql://user:pass@host:5432/gauntlet` |
| `CRON_SECRET`                       | Yes         | Secret for cron authentication                   | `your-random-secret-key`                    |
| `API_SECRET`                        | Yes         | General API authentication                       | `your-api-secret`                           |
| `GEMINI_API_KEY`                    | Conditional | AI-generated recaps (required for recap feature) | `your-gemini-api-key`                       |
| `AI_SUMMARIZE_SECRET`               | Conditional | Bearer capability for playoff scenario summaries | `your-random-capability-key`                |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Yes         | Clerk browser key                                | `pk_live_...`                               |
| `CLERK_SECRET_KEY`                  | Yes         | Clerk server key                                 | `sk_live_...`                               |

### Manual Job Variables

Set these in your shell when you run a manual job. Don't commit them.

| Variable       | Needed by                           |
| -------------- | ----------------------------------- |
| `DATABASE_URL` | `scripts/live-odds-snapshot.sh`     |
| (none)         | `scripts/update-variance-models.sh` |

### Local Testing Variables

For local cron testing, create `.env.local` in `apps/web/`:

```bash
# apps/web/.env.local
CRON_SECRET=your-local-test-secret
GEMINI_API_KEY=your-gemini-key  # Required for recap testing
AI_SUMMARIZE_SECRET=your-local-capability-secret
```

## Cron Job Setup

Scheduled and manual jobs:

### 1. driveFF Scheduler (Live Odds)

**Purpose**: Captures live win probability and score snapshots during NFL games

**Consumer**: Gauntlet reads driveFF's versioned live-odds feed from its matchup
and time-series API routes.

**Configuration**:

- League registration and snapshot scheduling are owned by driveFF.
- Gauntlet does not schedule `/api/cron/live-odds` in `apps/web/vercel.json`.
- `DRIVEFF_API_BASE_URL` may override the default `https://driveff.com` origin.
- Sleeper remains the source for roster identity and current fantasy scores;
  driveFF supplies live projected finals, win probabilities, player
  distributions, and their history.
- The legacy Gauntlet live-odds endpoint remains available for manual recovery
  while migration cleanup is in progress, but it is not a production data
  source.

**Testing locally**:

```bash
./test-cron-local.sh
```

### 2. cron-job.org (Weekly Recaps)

**Purpose**: Generates AI-powered weekly recap reports

**Endpoint**: `POST /api/cron/recap-report`

**Setup steps**:

1. Go to https://cron-job.org and create an account
2. Create a new cron job:
   - **Title**: Gauntlet Weekly Recap
   - **URL**: `https://your-domain.com/api/cron/recap-report`
   - **Method**: POST
   - **Headers**:
     ```
     Authorization: Bearer YOUR_CRON_SECRET
     ```
   - **Schedule**: `0 14 * * 2` (Tuesdays at 2pm UTC / 10am ET)

3. Save and enable the job

**Testing locally**:

```bash
export GEMINI_API_KEY=your-key
./test-recap-cron-local.sh
```

The schedule lives in the cron-job.org account, not in this repo. This doc can't
confirm that the job is still enabled. Check the account.

### 3. Variance Models (manual)

**Purpose**: Updates player variance models from last week's Sleeper stats.

**When**: Weekly, after Monday Night Football. It used to run as a GitHub
Actions job on Tuesdays at 07:00 UTC. Now a person runs it.

**Run**:

```bash
scripts/update-variance-models.sh
```

**Needs**: No secrets. It calls the public Sleeper API.

**What it does**:

1. `pnpm install --frozen-lockfile`
2. Builds `@gauntlet/sim-engine` and `@gauntlet/server`
3. Runs `pnpm --filter @gauntlet/server run update-variance`, which rewrites
   `apps/sim-engine/src/data/variance-data.json`
4. Prints `git status` for `variance-data.json` and `players-cache.json`

It does not commit. Review the diff (`git diff apps/sim-engine/src/data/`). If
it looks right, commit it on a branch and open a normal PR.

### 4. Live Odds Snapshot (manual backup)

**Purpose**: Writes one Gauntlet live-odds snapshot to the historical database.
It replaces the disabled GitHub Actions job that ran every 10 minutes during NFL
game windows. driveFF owns normal live-odds collection (section 1), so run this
only for manual recovery.

**Run**:

```bash
DATABASE_URL=... scripts/live-odds-snapshot.sh
```

**Needs**: `DATABASE_URL` for the historical database. The script stops if it is
not set.

**What it does**:

1. `pnpm install --frozen-lockfile`
2. Generates the Prisma client from `prisma/schema-historical.prisma`
3. Runs `pnpm --filter @gauntlet/server live-snapshot`. For the two leagues
   hardcoded in `apps/server/src/scripts/jobs/comprehensive-live-snapshot.ts`,
   it reads matchup odds from `https://gauntlet-website.vercel.app` and current
   scores from Sleeper.
4. Inserts a `LiveWinProbSample` row for each matchup whose data changed since
   the last sample. It skips unchanged matchups.

To capture a game window, run it again by hand. Nothing schedules it.

## Rollback Procedures

### Vercel Deployment Rollback

**Via CLI**:

```bash
# Rollback to previous deployment
vercel rollback

# List deployments
vercel deployments

# Rollback to specific deployment
vercel rollback <deployment-url>
```

**Via Dashboard**:

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project
3. Go to "Deployments" tab
4. Find the previous working deployment
5. Click "Promote to Production"

### Database Rollback

**Prisma Migrations**:

```bash
# Check migration status
pnpm --filter @gauntlet/server prisma:migrate:status

# Rollback last migration (if not deployed)
pnpm --filter @gauntlet/server prisma:migrate:undo

# Reset database (CAUTION: loses data)
pnpm --filter @gauntlet/server prisma:migrate:reset
```

**Data Recovery**:

- Restore from database backup if available
- Contact your database provider (e.g., Railway, Supabase) for point-in-time
  recovery

### Git Revert for Data Commits

If variance model updates need rollback:

```bash
# Find the commit to revert
git log --oneline apps/sim-engine/src/data/

# Revert the specific commit on a branch
git switch -c revert/variance-<week> origin/main
git revert <commit-hash>
git push -u origin HEAD
```

Open a PR, then run `scripts/ci-local.sh --pr <N> --post-status` and
`scripts/merge-pr.sh <N>`. The merge deploys.

## Monitoring

### Vercel Dashboard

Monitor at [vercel.com/dashboard](https://vercel.com/dashboard):

| Metric          | Location       | Alert Threshold    |
| --------------- | -------------- | ------------------ |
| Function Errors | Functions tab  | > 5% error rate    |
| Response Time   | Analytics tab  | > 1000ms p95       |
| Cron Execution  | Functions logs | Failed invocations |

### Manual Jobs

The manual scripts have no run history. Check their results directly:

| Job                                 | How to check                                          |
| ----------------------------------- | ----------------------------------------------------- |
| `scripts/update-variance-models.sh` | `git log apps/sim-engine/src/data/variance-data.json` |
| `scripts/live-odds-snapshot.sh`     | Script output and new `LiveWinProbSample` rows        |

### Cron Job Monitoring

**cron-job.org**:

- Built-in email notifications for failures
- Execution history and logs

**driveFF live-odds scheduler**:

- Use driveFF's scheduler history and logs to verify collection.
- Verify Gauntlet consumption from a matchup's live model and time-series APIs.

## Common Commands

### Deployment

| Command                 | Description                   |
| ----------------------- | ----------------------------- |
| `vercel`                | Deploy to preview environment |
| `vercel --prod`         | Deploy to production          |
| `vercel --version`      | Check Vercel CLI version      |
| `vercel env ls`         | List environment variables    |
| `vercel env add <name>` | Add environment variable      |

### Testing Cron Jobs

| Command                      | Description                 |
| ---------------------------- | --------------------------- |
| `./test-cron-local.sh`       | Test live odds cron locally |
| `./test-recap-cron-local.sh` | Test recap cron locally     |

### Database

| Command                                                | Description            |
| ------------------------------------------------------ | ---------------------- |
| `pnpm --filter @gauntlet/server prisma:migrate:deploy` | Deploy migrations      |
| `pnpm --filter @gauntlet/server prisma:generate`       | Generate Prisma client |

The web and server Prisma schemas currently share the production database but do
not share one migration history. Do not run `prisma migrate deploy` against
`apps/web/prisma` until those histories are unified. Apply a reviewed web
migration directly and atomically instead:

```bash
psql "$DATABASE_URL" -v ON_ERROR_STOP=1 --single-transaction \
  -f apps/web/prisma/migrations/<migration>/migration.sql
```

## Troubleshooting

### Deployment Fails

**Error**: Build fails with "Cannot find module"

**Solution**:

```bash
# Ensure packages are built
pnpm install
pnpm build --filter @gauntlet/types --filter @gauntlet/lib

# Then redeploy
vercel --prod
```

### Legacy Cron Endpoint Unauthorized

**Error**: `401 Unauthorized` from cron endpoint

**Solution**:

1. This only applies to manual recovery calls to Gauntlet's legacy endpoint;
   normal live-odds collection runs in driveFF.
2. Verify `CRON_SECRET` is set in Vercel environment variables.
3. For external cron services (cron-job.org), ensure header is exactly:
   ```
   Authorization: Bearer YOUR_CRON_SECRET
   ```
4. Test locally first:
   ```bash
   curl -X POST http://localhost:3000/api/cron/live-odds \
     -H "Authorization: Bearer your-test-secret"
   ```

### Database Connection Errors

**Error**: `DATABASE_URL is required` or connection timeout

**Solution**:

1. Verify `DATABASE_URL` is set in Vercel environment variables
2. Check database is accessible from Vercel's IP ranges
3. Verify connection string format:
   ```
   postgresql://user:password@host:port/database?sslmode=require
   ```

### Build Timeout

**Error**: Build exceeds maximum duration

**Solution**:

- Vercel Pro plan has longer build timeouts
- Or optimize build: check for unnecessary dependencies
- Use `pnpm install --frozen-lockfile` for faster installs

### Cron Job Times Out

**Error**: Cron function exceeds maxDuration

**Solution**:

- Check current duration in `vercel.json`:
  ```json
  "src/app/api/cron/recap-report/route.{js,ts}": {
    "maxDuration": 300
  }
  ```
- Increase if needed (max 300s on Vercel)
- For longer jobs, run them as manual scripts like
  `scripts/live-odds-snapshot.sh`

## Security Considerations

1. **Never commit secrets** — Always use environment variables
2. **Rotate CRON_SECRET periodically** — Update in all locations
3. **Restrict cron endpoints** — All cron routes validate `CRON_SECRET`
4. **Database security** — Use SSL connections (`sslmode=require`)
5. **Vercel deployment protection** — Enable password protection for preview
   deployments if needed

## Cost Optimization

**Current Stack (Free Tier)**:

- Vercel Hobby: $0/month (100GB bandwidth, 6,000 build minutes)
- CI: runs locally on the Mac Studio, no hosted CI cost
- PostgreSQL: Varies by provider (Railway ~$5/month)

**Upgrade Path**:

- Vercel Pro: $20/month (more bandwidth, KV storage, longer timeouts)
- Database: Scale as needed with your provider

## Next Steps

After successful deployment:

1. Set up monitoring (Sentry for error tracking)
2. Configure custom domain in Vercel
3. Document any team-specific procedures

## Getting Help

- Check Vercel status: [status.vercel.com](https://status.vercel.com)
- Review function logs in Vercel Dashboard
- For CI failures, rerun `scripts/ci-local.sh` and read its output
- See `docs/runbooks/local-dev.md` for local development help
