# Vercel Cron Setup for Live Odds Snapshots

This guide explains how to set up reliable live odds snapshots using Vercel Cron
instead of GitHub Actions.

## Why Vercel Cron?

**Problem with GitHub Actions:**

- ❌ Scheduled workflows are **not guaranteed** to run
- ❌ Delays of 15-30+ minutes are common during peak times
- ❌ Some runs are simply dropped (5-10% success rate observed)
- ❌ No SLA or reliability guarantees

**Benefits of Vercel Cron:**

- ✅ **Guaranteed execution** (SLA-backed on Pro plan)
- ✅ **Accurate timing** (<30 second drift)
- ✅ **Built-in monitoring** in Vercel dashboard
- ✅ **Integrated with existing infrastructure**
- ✅ **Automatic retries** on failures

## Architecture

```
┌─────────────────────────────────────────────────────┐
│  Vercel Cron Scheduler                              │
│  • Every 10 minutes during NFL games                │
│  • Thursday Night → Monday Night Football           │
└──────────────────┬──────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────┐
│  /api/cron/live-odds (Next.js API Route)           │
│  1. Verifies cron secret (security)                │
│  2. Imports snapshot runner                         │
│  3. Executes live snapshot logic                    │
│  4. Returns HTTP response with metrics              │
└──────────────────┬──────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────┐
│  snapshot-runner.ts                                 │
│  1. Fetches current matchup data from Sleeper API   │
│  2. Calls Gauntlet API for simulations              │
│  3. Compares with previous snapshot (deduplication) │
│  4. Writes changed snapshots to PostgreSQL          │
└──────────────────┬──────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────┐
│  PostgreSQL Database (Vercel Postgres/Neon/etc)    │
│  • LiveWinProbSample (time-series data)            │
│  • MatchupOddsHistory (matchup odds tracking)      │
│  • LeagueOddsHistory (league-wide predictions)     │
└─────────────────────────────────────────────────────┘
```

## Setup Instructions

### 1. Environment Variables

Add these to your Vercel project settings (Project Settings → Environment
Variables):

```bash
# Database connection (required)
DATABASE_URL=postgresql://user:pass@host:5432/gauntlet_historical

# Cron security (recommended)
CRON_SECRET=your-random-secret-here

# Optional: Add to all environments (Production, Preview, Development)
```

**Generate a secure CRON_SECRET:**

```bash
openssl rand -base64 32
```

### 2. Database Setup

The live snapshot requires a PostgreSQL database with the historical schema:

```bash
# From project root
cd apps/server

# Run migrations
pnpm prisma:migrate

# Verify schema
pnpm prisma:generate
```

**Database Options:**

- **Vercel Postgres** (easiest, integrated)
- **Neon** (serverless, generous free tier)
- **Supabase** (includes nice dashboard)
- **Railway** (simple setup)

### 3. Install Dependencies

```bash
# From project root
pnpm install
```

This installs the `@gauntlet/server` workspace dependency in the web app.

### 4. Deploy to Vercel

```bash
# Push to main branch (or deploy via Vercel dashboard)
git add .
git commit -m "Setup Vercel Cron for live odds snapshots"
git push origin main
```

Vercel will automatically:

1. Install dependencies (including @gauntlet/server)
2. Generate Prisma client
3. Build Next.js app
4. Configure cron schedules from vercel.json
5. Start running snapshots automatically

### 5. Verify Setup

After deployment:

1. **Check Vercel Dashboard:**
   - Go to Project → Deployments → Your deployment
   - Click "Functions" tab
   - Look for `/api/cron/live-odds`

2. **Test Manual Trigger:**

   ```bash
   # Using curl
   curl -X POST https://your-app.vercel.app/api/cron/live-odds \
     -H "Authorization: Bearer YOUR_CRON_SECRET"

   # Should return:
   # {
   #   "success": true,
   #   "savedCount": 12,
   #   "skippedCount": 0,
   #   "failedCount": 0,
   #   "totalProcessed": 12,
   #   "week": 2,
   #   "duration": 45230,
   #   "triggeredAt": "2025-10-07T10:00:00.000Z"
   # }
   ```

3. **Monitor Cron Logs:**
   - Go to Project → Logs
   - Filter by `/api/cron/live-odds`
   - You should see executions every 10 minutes during game windows

## Cron Schedule

The following schedules are configured in `vercel.json`:

| Day      | Time (ET)     | Time (UTC)                        | Event                           |
| -------- | ------------- | --------------------------------- | ------------------------------- |
| Daily    | 6:00 AM       | 10:00                             | Pre-game update                 |
| Thursday | 8:00-11:30 PM | Fri 00:00-05:59                   | Thursday Night Football         |
| Friday   | 8:00-11:30 PM | Sat 00:00-05:59                   | International/holiday games     |
| Saturday | 1:00-11:59 PM | Sat 17:00-23:59 + Sun 00:00-05:59 | Late-season games (Weeks 15-18) |
| Sunday   | 1:00-11:59 PM | Sun 17:00-23:59 + Mon 00:00-05:59 | Sunday games                    |
| Monday   | 8:15-11:59 PM | Tue 00:00-05:59                   | Monday Night Football           |

Each window runs **every 10 minutes** (6 runs per hour).

## Monitoring & Debugging

### View Cron Execution History

Vercel Dashboard → Project → Cron:

- See all scheduled executions
- View success/failure rates
- Check execution durations
- Review error logs

### Check Database

```bash
# View recent snapshots
cd apps/server
pnpm prisma studio

# Or query directly
psql $DATABASE_URL -c "SELECT * FROM \"LiveWinProbSample\" ORDER BY \"capturedAt\" DESC LIMIT 10;"
```

### Common Issues

**Issue: "Unauthorized" error**

- Solution: Check CRON_SECRET is set correctly in Vercel env vars

**Issue: Database connection failed**

- Solution: Verify DATABASE_URL is set and database is accessible from Vercel

**Issue: Prisma client not found**

- Solution: Check build logs, ensure `prisma generate` ran successfully
- Try: Add `postinstall` script to web package.json

**Issue: Function timeout**

- Solution: Increase maxDuration in vercel.json (currently 60s)

**Issue: No snapshots being saved**

- Solution: Check logs, verify simulations are running
- Note: Snapshots are skipped if data hasn't changed (deduplication feature)

## Cost Considerations

**Vercel Cron Usage:**

- **Hobby Plan**: 1 cron job, limited executions
- **Pro Plan**: Unlimited cron jobs, generous execution quota
- **Enterprise**: Custom limits

**Estimated Usage:**

- ~60 executions per game day (6 windows × 10 executions)
- ~360 executions per week during regular season
- Each execution: ~45-60 seconds
- Total compute: ~6 hours per week

This fits comfortably within Pro plan limits.

## Migration from GitHub Actions

If you want to keep GitHub Actions as a backup:

1. Keep the `.github/workflows/live-odds-updates.yml` file
2. Let Vercel Cron be the primary scheduler
3. GitHub Actions will run less frequently but provide redundancy

Or disable GitHub Actions entirely:

```bash
# Disable the workflow
git mv .github/workflows/live-odds-updates.yml .github/workflows/live-odds-updates.yml.disabled
git commit -m "Disable GitHub Actions cron, using Vercel Cron instead"
```

## Rollback Plan

If you need to roll back to GitHub Actions:

1. Remove cron schedules from `vercel.json`
2. Re-enable GitHub Actions workflow
3. Remove `@gauntlet/server` from web dependencies (optional)
4. Redeploy

## Support

- **Vercel Docs**: https://vercel.com/docs/cron-jobs
- **Discord**: #gauntlet-dev channel
- **Issues**: File a GitHub issue with label `cron`

---

**Last Updated**: October 7, 2025  
**Version**: 1.0.0  
**Maintained By**: @dhruvmethi
