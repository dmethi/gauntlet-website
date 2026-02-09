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
│  Vercel Cron    │  │cron-job. │   │  GitHub      │
│  (Live Odds)    │  │   org    │   │  Actions     │
└─────────────────┘  │ (Recaps) │   │(Variance)    │
                     └──────────┘   └──────────────┘
```

## Prerequisites

| Tool                                      | Version  | Required | Notes               |
| ----------------------------------------- | -------- | -------- | ------------------- |
| [Vercel CLI](https://vercel.com/docs/cli) | Latest   | Yes      | For deployments     |
| [Node.js](https://nodejs.org/)            | ≥ 18.0.0 | Yes      | LTS recommended     |
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

| Variable         | Required    | Description                                      | Example                                     |
| ---------------- | ----------- | ------------------------------------------------ | ------------------------------------------- |
| `DATABASE_URL`   | Yes         | PostgreSQL connection string                     | `postgresql://user:pass@host:5432/gauntlet` |
| `CRON_SECRET`    | Yes         | Secret for cron authentication                   | `your-random-secret-key`                    |
| `API_SECRET`     | Yes         | General API authentication                       | `your-api-secret`                           |
| `GEMINI_API_KEY` | Conditional | AI-generated recaps (required for recap feature) | `your-gemini-api-key`                       |

### GitHub Actions Secrets

For scheduled jobs, set these in GitHub → Settings → Secrets and variables →
Actions:

| Variable       | Required | Description                   | Example                       |
| -------------- | -------- | ----------------------------- | ----------------------------- |
| `API_BASE_URL` | Yes      | Production API base URL       | `https://gauntlet.vercel.app` |
| `CRON_SECRET`  | Yes      | Must match Vercel CRON_SECRET | `your-random-secret-key`      |
| `DATABASE_URL` | Yes      | Same as Vercel (for DB jobs)  | `postgresql://...`            |

### Local Testing Variables

For local cron testing, create `.env.local` in `apps/web/`:

```bash
# apps/web/.env.local
CRON_SECRET=your-local-test-secret
GEMINI_API_KEY=your-gemini-key  # Required for recap testing
```

## Cron Job Setup

The application uses three different cron mechanisms:

### 1. Vercel Cron (Live Odds)

**Purpose**: Captures live win probability snapshots during NFL games

**Endpoint**: `GET /api/cron/live-odds`

**Configuration**:

- Configured in `vercel.json` (cron expression)
- Max duration: 60 seconds
- Runs during NFL game windows

**Current config** (update `vercel.json`):

```json
{
  "crons": [
    {
      "path": "/api/cron/live-odds",
      "schedule": "*/10 * * * *"
    }
  ]
}
```

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

### 3. GitHub Actions (Variance Models)

**Purpose**: Updates player variance models weekly

**File**: `.github/workflows/update-variance-models.yml`

**Schedule**: Tuesdays at 7:00 AM UTC (3:00 AM ET)

**Manual trigger**:

```bash
# Via GitHub UI: Actions → Update Variance Models → Run workflow
```

The workflow:

1. Installs dependencies
2. Builds packages
3. Runs variance update job
4. Commits changes to repo if variance data changed

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

# Revert the specific commit
git revert <commit-hash>

# Push to trigger new deployment
git push
```

## Monitoring

### Vercel Dashboard

Monitor at [vercel.com/dashboard](https://vercel.com/dashboard):

| Metric          | Location       | Alert Threshold    |
| --------------- | -------------- | ------------------ |
| Function Errors | Functions tab  | > 5% error rate    |
| Response Time   | Analytics tab  | > 1000ms p95       |
| Cron Execution  | Functions logs | Failed invocations |

### GitHub Actions

Monitor at GitHub → Actions tab:

| Workflow               | Check Frequency   |
| ---------------------- | ----------------- |
| Update Variance Models | Weekly (Tuesdays) |
| Manual cron triggers   | As needed         |

### Cron Job Monitoring

**cron-job.org**:

- Built-in email notifications for failures
- Execution history and logs

**Vercel Cron**:

- View in Vercel Dashboard → Cron Jobs
- Failed executions logged in Functions tab

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

### Cron Job Unauthorized

**Error**: `401 Unauthorized` from cron endpoint

**Solution**:

1. Verify `CRON_SECRET` is set in Vercel environment variables
2. For external cron services (cron-job.org), ensure header is exactly:
   ```
   Authorization: Bearer YOUR_CRON_SECRET
   ```
3. Test locally first:
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
- For longer jobs, consider GitHub Actions instead

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
- GitHub Actions: $0/month (2,000 minutes)
- PostgreSQL: Varies by provider (Railway ~$5/month)

**Upgrade Path**:

- Vercel Pro: $20/month (more bandwidth, KV storage, longer timeouts)
- Database: Scale as needed with your provider

## Next Steps

After successful deployment:

1. Set up monitoring (Sentry for error tracking)
2. Configure custom domain in Vercel
3. Enable preview deployments for PRs
4. Document any team-specific procedures

## Getting Help

- Check Vercel status: [status.vercel.com](https://status.vercel.com)
- Review function logs in Vercel Dashboard
- Check GitHub Actions logs for scheduled job failures
- See `docs/runbooks/local-dev.md` for local development help
