# Quick Start: Deploy Vercel Cron in 5 Minutes

## TL;DR

```bash
# 1. Install dependencies
pnpm install

# 2. Set environment variables in Vercel dashboard
DATABASE_URL=postgresql://...
CRON_SECRET=$(openssl rand -base64 32)

# 3. Deploy
git add .
git commit -m "Add Vercel Cron for live odds snapshots"
git push origin main

# 4. Test
curl -X POST https://your-app.vercel.app/api/cron/live-odds \
  -H "Authorization: Bearer YOUR_CRON_SECRET"

# Done! ✅ Cron will run automatically every 10 minutes during NFL games
```

## Step-by-Step

### 1. Install Dependencies

```bash
cd /Users/dhruv.methi/Documents/GitHub/gauntlet-website
pnpm install
```

This installs the `@gauntlet/server` workspace dependency in the web app.

### 2. Configure Vercel Environment Variables

Go to: https://vercel.com/your-username/gauntlet-website/settings/environment-variables

Add these variables to **all environments** (Production, Preview, Development):

```
DATABASE_URL=postgresql://user:password@host:5432/gauntlet_historical
CRON_SECRET=<paste output of: openssl rand -base64 32>
```

**Where to get DATABASE_URL?**
- If using Vercel Postgres: Already in your env vars
- If using external DB: Copy from your database provider

### 3. Deploy to Vercel

```bash
git add .
git commit -m "Setup Vercel Cron for reliable live odds snapshots"
git push origin main
```

Vercel will automatically:
- ✅ Install all dependencies (including @gauntlet/server)
- ✅ Generate Prisma client
- ✅ Build Next.js app
- ✅ Configure 9 cron schedules from vercel.json
- ✅ Start running snapshots automatically

### 4. Verify It's Working

#### Option A: Check Vercel Dashboard

1. Go to: https://vercel.com/your-username/gauntlet-website
2. Click "Cron" tab (or "Functions" → "Cron Jobs")
3. You should see 9 configured cron jobs
4. Click one to see execution history

#### Option B: Manual Test

```bash
# Generate test request
curl -X POST https://gauntlet-website.vercel.app/api/cron/live-odds \
  -H "Authorization: Bearer YOUR_CRON_SECRET_FROM_STEP_2" \
  -H "Content-Type: application/json"
```

**Expected output:**
```json
{
  "success": true,
  "savedCount": 12,
  "skippedCount": 0,
  "failedCount": 0,
  "totalProcessed": 12,
  "week": 2,
  "duration": 45000,
  "triggeredAt": "2025-10-07T..."
}
```

#### Option C: Check Database

```bash
cd apps/server

# Open Prisma Studio
pnpm prisma studio

# Or query directly
psql $DATABASE_URL -c "SELECT * FROM \"LiveWinProbSample\" ORDER BY \"capturedAt\" DESC LIMIT 5;"
```

You should see new records appearing every 10 minutes during NFL games.

## When Will It Run?

### Automatic Schedule

The cron runs **every 10 minutes** during these windows:

| Day | Time (ET) | Event |
|-----|-----------|-------|
| Daily | 6:00 AM | Pre-game update |
| Thursday | 8:00-11:30 PM | Thursday Night Football |
| Sunday | 1:00-11:59 PM | Sunday games (early + late + night) |
| Monday | 8:15-11:59 PM | Monday Night Football |

### Next Execution

To see when it will run next:
1. Go to Vercel Dashboard → Cron
2. Look at "Next execution" timestamp
3. Or check logs for recent runs

## Troubleshooting

### "Unauthorized" Error

**Cause**: CRON_SECRET not set or incorrect

**Fix**:
1. Go to Vercel Dashboard → Settings → Environment Variables
2. Verify CRON_SECRET is set in Production
3. Redeploy if you just added it

### Database Connection Failed

**Cause**: DATABASE_URL not set or invalid

**Fix**:
1. Verify DATABASE_URL is accessible from Vercel
2. Check if database allows connections from Vercel IPs
3. Try connecting locally: `psql $DATABASE_URL`

### Prisma Client Not Found

**Cause**: Prisma didn't generate during build

**Fix**:
1. Check build logs in Vercel
2. Ensure `postinstall` script ran
3. Manually trigger: `pnpm --filter @gauntlet/server prisma:generate`

### No Snapshots Being Saved

**Cause**: This is NORMAL if no games are active!

The deduplication logic skips saves when:
- No NFL games are currently playing
- Scores/projections haven't changed since last snapshot

**Verify it's working**:
- Check during an active NFL game (Thursday/Sunday/Monday night)
- Look for `skippedCount` > 0 in response (this means it ran but nothing changed)

## What Happens During Non-Game Times?

**Outside game windows:**
- ✅ Cron still runs (daily 6 AM update)
- ✅ Script executes successfully
- ✅ Deduplication catches unchanged data
- ✅ Response shows `skippedCount: 12, savedCount: 0`
- ✅ No database writes (efficient!)

This is **expected behavior** and very efficient!

## Monitoring

### View Execution History

**Vercel Dashboard:**
1. Project → Cron
2. See all executions with timestamps
3. Success/failure rates
4. Execution durations

**Logs:**
1. Project → Logs
2. Filter: `/api/cron/live-odds`
3. See detailed execution logs

### Expected Metrics

**Success Rate**: >99% (Vercel SLA)  
**Execution Time**: 45-60 seconds  
**Snapshots per Run**: 0-12 (depends on deduplication)  
**Database Growth**: ~200 records per week  

## Cost

**Vercel Pro Plan Required:**
- Hobby plan: Limited cron jobs
- Pro plan: Unlimited cron jobs + generous compute quota

**Estimated Usage:**
- ~360 executions per week (regular season)
- ~6 hours compute per week
- Well within Pro plan limits

## Disable GitHub Actions (Optional)

Now that Vercel Cron is working, you can disable the old GitHub Actions workflow:

```bash
git mv .github/workflows/live-odds-updates.yml \
       .github/workflows/live-odds-updates.yml.disabled

git commit -m "Disable GitHub Actions cron (using Vercel instead)"
git push
```

Or keep it as a backup! Both can run simultaneously without conflicts (deduplication handles it).

## Next Steps

1. ✅ **Monitor for a day**: Watch execution logs in Vercel
2. ✅ **Check during games**: Verify snapshots are saved during Sunday NFL games
3. ✅ **Review database**: Ensure data looks correct
4. ✅ **Disable GitHub Actions**: If Vercel is working perfectly

## Support

- **Setup Guide**: See `VERCEL_CRON_SETUP.md`
- **Implementation Details**: See `VERCEL_CRON_IMPLEMENTATION.md`
- **Issues**: GitHub Issues with label `vercel-cron`

---

**Ready to deploy?** Run the TL;DR commands at the top! 🚀
