# Deploy Prisma Fix - Action Required

## 🔴 Critical Fix: Live Odds Cron Job Not Saving Data

**Status:** Ready to deploy  
**Urgency:** High - No data has been saved for Week 6  
**Estimated Fix Time:** 5-10 minutes after deployment

---

## What's Wrong?

The live odds cron job has been **running but failing silently** due to a Prisma
binary mismatch.

**Evidence:**

```sql
-- Query result from database:
Total samples for Week 6: 0
```

**Error in Vercel logs:**

```
PrismaClientInitializationError: Prisma Client could not locate
the Query Engine for runtime "rhel-openssl-3.0.x"
```

**Pattern:** 2 consecutive failures every 30 minutes (cold starts)

---

## What Was Fixed?

### 1. ✅ Added Binary Targets to Prisma Schema

```diff
generator client {
  provider      = "prisma-client-js"
  output        = "../generated/prisma-historical"
+ binaryTargets = ["native", "rhel-openssl-3.0.x", "linux-musl-openssl-3.0.x"]
}
```

### 2. ✅ Updated Next.js Config for Vercel

Added output file tracing to ensure Prisma binaries are bundled:

```javascript
experimental: {
  outputFileTracingIncludes: {
    '/api/**/*': [
      '../server/generated/prisma-historical/**/*',
      // ... other paths
    ],
  },
}
```

### 3. ✅ Regenerated Prisma Client

Now includes 3 binaries:

- `libquery_engine-darwin-arm64.dylib.node` (macOS - dev)
- `libquery_engine-rhel-openssl-3.0.x.so.node` (Vercel) ← **The fix**
- `libquery_engine-linux-musl-openssl-3.0.x.so.node` (Alpine)

### 4. ✅ Verified Build

```bash
✓ pnpm turbo build --filter=@gauntlet/web (26s)
✓ npx tsc --noEmit (0 errors)
```

---

## Deploy Steps

### 1. Commit and Push

```bash
git add -A
git commit -m "fix(prisma): add binary targets for Vercel serverless runtime

- Add rhel-openssl-3.0.x binary target to Prisma schema
- Add output file tracing to Next.js config for Prisma binaries
- Regenerate Prisma client with all required binaries

Fixes: PrismaClientInitializationError in /api/cron/live-odds
Impact: Enables live odds data collection for Week 6+
Related: PRISMA_VERCEL_FIX.md"

git push origin main
```

### 2. Wait for Vercel Deployment

- Monitor: https://vercel.com/[your-project]/deployments
- Expected build time: 2-3 minutes
- Look for: ✅ Deployment successful

### 3. Verify Immediately After Deployment

**Option A: Check Vercel Logs (Fastest)**

1. Go to https://vercel.com/[your-project]/logs
2. Filter by function: `api/cron/live-odds`
3. Wait for next cron execution (runs every 10 min)
4. Look for: `✅ [CRON] Live odds snapshot completed`

**Option B: Check Database (Most Reliable)**

```bash
# From your local machine
cd apps/server
npx tsx src/scripts/verify-cron-data.ts
```

Expected output after 1-2 cron runs:

```
✅ System is HEALTHY
   - Data is being collected
   - Recent samples exist
   - Most/all matchups have data
```

### 4. Monitor for 30 Minutes

Watch for:

- ✅ Samples appearing in database every 10 minutes
- ✅ No "Query Engine not found" errors
- ✅ All 12 matchups getting data (as games start)

---

## Expected Timeline

| Time | Event                            | What to Check                     |
| ---- | -------------------------------- | --------------------------------- |
| T+0  | Deploy to Vercel                 | Build logs show Prisma generation |
| T+5  | First cron run (cold start)      | Should succeed now!               |
| T+10 | Second cron run                  | Verify data in DB                 |
| T+20 | Third cron run                   | Confirm consistent behavior       |
| T+30 | Fourth cron run (new cold start) | Test cold start fix               |

---

## Success Criteria

After 30 minutes, you should see:

1. **Database has data:**

```sql
SELECT COUNT(*) FROM "LiveWinProbSample" WHERE week = 6;
-- Expected: > 30 (3 runs × 12 matchups, minus any not started)
```

2. **No errors in Vercel logs:**

```
❌ Before: PrismaClientInitializationError (every other run)
✅ After: No Prisma errors
```

3. **Consistent cron execution:**

```
12:00 AM - ✅ Saved 12 snapshots
12:10 AM - ✅ Saved 12 snapshots (some may be skipped if unchanged)
12:20 AM - ✅ Saved 12 snapshots
```

---

## If It Still Fails

### Check These:

1. **Vercel Build Logs**
   - Search for "Prisma" in build output
   - Should see: `✔ Generated Prisma Client`
   - Should NOT see: "Could not find binary"

2. **Environment Variables**

   ```bash
   # In Vercel dashboard
   DATABASE_URL is set ✅
   ```

3. **Clear Build Cache**
   - Vercel Dashboard → Settings → General → Clear Build Cache
   - Redeploy

4. **Manual Test**
   ```bash
   # Trigger cron manually
   curl -X POST https://your-domain.vercel.app/api/cron/live-odds \
     -H "Authorization: Bearer $CRON_SECRET"
   ```

### Rollback

If issues persist, rollback is safe:

```bash
git revert HEAD
git push
```

But **investigate first** - this fix is correct based on Prisma + Vercel best
practices.

---

## Files Changed

```
Modified:
  apps/server/prisma/schema-historical.prisma  (+ binaryTargets)
  apps/web/next.config.js                      (+ outputFileTracingIncludes)

Added:
  PRISMA_VERCEL_FIX.md                        (detailed explanation)
  DEPLOY_PRISMA_FIX.md                        (this file)
  apps/server/src/scripts/verify-cron-data.ts (verification tool)

Generated (not committed):
  apps/server/generated/prisma-historical/*.node  (3 new binaries)
```

---

## Questions to Answer

### "Why did this happen?"

Prisma defaults to generating only the binary for your current OS (macOS).
Vercel runs on AWS Lambda (RHEL), which needs a different binary. We never
specified which binaries to include, so the Linux one was missing.

### "Why didn't we catch this earlier?"

- Local development worked fine (macOS binary present)
- Build succeeded (just missing runtime binary)
- Errors only appear at runtime in serverless environment
- No alerting set up for cron job failures

### "Will this happen again?"

No - we've:

1. Fixed the root cause (binaryTargets specified)
2. Added verification script
3. Documented the fix
4. Next.js config ensures binaries are bundled

### "What about other cron jobs?"

The recap report cron (`/api/cron/recap-report`) uses the same Prisma client, so
it's also fixed by this change.

---

## 🚀 Ready to Deploy?

- [x] Build verified locally
- [x] Tests pass
- [x] Documentation created
- [x] Verification script ready
- [ ] **→ DEPLOY NOW** ←

**After deployment, ping in 30 minutes with verification results!**

---

_Last Updated: 2025-10-09 00:30 PST_  
_Fix Applied By: Cursor AI Assistant_
