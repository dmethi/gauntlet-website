# Test Cron Endpoint Locally

## Quick Test (2 minutes)

### 1. Start Dev Server
```bash
# Terminal 1
cd apps/web
pnpm dev
```

Wait for: `✓ Ready on http://localhost:3000`

### 2. Trigger Cron Endpoint
```bash
# Terminal 2
curl -X POST http://localhost:3000/api/cron/live-odds \
  -H "Authorization: Bearer ${CRON_SECRET}" \
  -H "Content-Type: application/json"
```

**Without CRON_SECRET (for testing):**
If you don't have CRON_SECRET set, you can temporarily disable auth check:
```bash
# Or just hit it directly (will work in dev if CRON_SECRET is not set)
curl -X POST http://localhost:3000/api/cron/live-odds
```

### 3. Check Response
Should see:
```json
{
  "success": true,
  "savedCount": 12,
  "skippedCount": 0,
  "failedCount": 0,
  "totalProcessed": 12,
  "week": 6,
  "duration": 8234,
  "triggeredAt": "2025-10-09T..."
}
```

### 4. Verify Database
```bash
# Terminal 3
cd apps/server
npx tsx src/scripts/verify-cron-data.ts
```

Should now show:
```
📊 Total samples for Week 6: 12
✅ Latest sample: [just now]
✅ All 12 matchups have data
```

## Detailed Test Steps

### Prerequisites
```bash
# Check environment variables are set
echo $DATABASE_URL
# Should show: postgresql://...

# Check Next.js can see it
cd apps/web
cat .env | grep DATABASE_URL
# Or check root .env
cat ../../.env | grep DATABASE_URL
```

### Full Test Sequence

1. **Clean state (optional):**
```bash
# Delete existing Week 6 data to test fresh
cd apps/server
npx tsx -e "
import {PrismaClient} from './generated/prisma-historical/index.js';
const p = new PrismaClient();
p.liveWinProbSample.deleteMany({where: {week: 6}})
  .then(() => console.log('Deleted Week 6 data'))
  .finally(() => p.\$disconnect());
"
```

2. **Start dev server:**
```bash
cd apps/web
pnpm dev
```

Watch for errors. Should see:
```
✓ Ready on http://localhost:3000
```

3. **Hit endpoint (new terminal):**
```bash
curl -v -X POST http://localhost:3000/api/cron/live-odds \
  -H "Authorization: Bearer test-secret-123"
```

Watch the dev server logs for:
```
🏈 [CRON] Starting live odds snapshot...
✅ [CRON] Live odds snapshot completed: {
  duration: "8234ms",
  saved: 12,
  skipped: 0,
  failed: 0
}
```

4. **Check database:**
```bash
cd apps/server
npx tsx src/scripts/verify-cron-data.ts
```

5. **Hit again (test deduplication):**
```bash
curl -X POST http://localhost:3000/api/cron/live-odds
```

Should see mostly "skipped" since data hasn't changed:
```json
{
  "success": true,
  "savedCount": 0,
  "skippedCount": 12,
  ...
}
```

## Troubleshooting Local Test

### Error: "Cannot find module prisma-historical"
```bash
# Regenerate Prisma client
cd apps/server
npx prisma generate --schema=prisma/schema-historical.prisma
```

### Error: "Connection refused"
Make sure `DATABASE_URL` is set and database is accessible:
```bash
# Test connection
cd apps/server
npx tsx -e "
import {PrismaClient} from './generated/prisma-historical/index.js';
const p = new PrismaClient();
p.\$connect()
  .then(() => console.log('✅ Database connected'))
  .catch(e => console.error('❌ Connection failed:', e))
  .finally(() => p.\$disconnect());
"
```

### Error: "401 Unauthorized"
Either:
1. Set `CRON_SECRET` env var
2. Or temporarily comment out auth check in `apps/web/src/app/api/cron/live-odds/route.ts`:
```typescript
// if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
//   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
// }
```

### Error: "Module not found: @gauntlet/server"
```bash
# Build server package
cd apps/server
pnpm build

# Or build everything
cd ../..
pnpm turbo build
```

## What Success Looks Like

### Dev Server Logs:
```
🏈 [CRON] Starting live odds snapshot...
{"level":30,"time":"...","job":"vercel-cron-snapshot","week":6,"event":"job_started"}
{"level":30,"time":"...","event":"snapshot_saved","matchupId":1,...}
{"level":30,"time":"...","event":"snapshot_saved","matchupId":2,...}
...
✅ [CRON] Live odds snapshot completed: { duration: "8234ms", saved: 12 }
```

### cURL Response:
```json
{
  "success": true,
  "savedCount": 12,
  "skippedCount": 0,
  "failedCount": 0,
  "totalProcessed": 12,
  "week": 6,
  "duration": 8234,
  "metrics": {
    "snapshot.saved": 12,
    "snapshot.skipped": 0,
    ...
  },
  "triggeredAt": "2025-10-09T08:45:23.123Z"
}
```

### Verification Script:
```
🔍 Verifying Live Odds Cron Job Data Collection

📊 Total samples for Week 6: 12

✅ Latest sample: 10/9/2025, 12:45:23 AM
   Age: 0.2 minutes ago

📈 Data by matchup (12 matchups):
   AFC Matchup 1: 1 samples
   AFC Matchup 2: 1 samples
   ...
   NFC Matchup 6: 1 samples

✅ All 12 matchups have data
✅ No significant gaps in recent data
   Cron job appears to be running consistently

============================================================
SUMMARY
============================================================
✅ System is HEALTHY
   - Data is being collected
   - Recent samples exist
   - Most/all matchups have data
```

## Performance Check

First run (cold start):
- Expected: 8-12 seconds
- What's happening: Fetching from Sleeper API, running simulations, saving to DB

Second run (warm):
- Expected: 5-8 seconds
- What's happening: Mostly skipped (data unchanged), faster

If it takes >30 seconds:
- Check Sleeper API response time
- Check database connection latency
- Review simulation settings

## Next Steps After Successful Local Test

1. ✅ **Confirmed it works locally** with proper Prisma binaries
2. 🚀 **Ready to deploy** - the fix will work the same in production
3. 📊 **Deploy and monitor** - follow steps in DEPLOY_PRISMA_FIX.md

---

*This test proves the Prisma binary fix works before deploying to Vercel*

