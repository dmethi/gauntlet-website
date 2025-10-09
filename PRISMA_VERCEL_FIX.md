# Prisma Vercel Cron Job Fix

## Problem

The live odds cron job (`/api/cron/live-odds`) was failing intermittently with:

```
PrismaClientInitializationError: Prisma Client could not locate the Query Engine for runtime "rhel-openssl-3.0.x"
```

**Symptoms:**

- Pattern of 2 consecutive failures every 30 minutes
- NO data being saved to database despite successful simulations
- Cold starts failing, warm invocations succeeding (sometimes)
- Error searching for binaries in:
  - `/var/task/apps/web/generated/prisma-historical`
  - `/var/task/apps/web/.next/server`
  - `/vercel/path0/apps/server/generated/prisma-historical`
  - `/var/task/apps/web/.prisma/client`
  - `/tmp/prisma-engines`

## Root Cause

The Prisma schema didn't specify `binaryTargets` for Vercel's serverless
environment (AWS Lambda running on `rhel-openssl-3.0.x`). When Next.js bundled
the code:

1. Only the native (macOS) binary was included
2. Vercel's runtime couldn't find the Linux-compatible query engine
3. Cold starts always failed because the engine wasn't available

The intermittent nature was likely due to:

- Some invocations getting cached/warm containers (still failing but faster)
- Build artifacts sometimes partially succeeding
- Vercel's retry logic creating the "2 failures every 30 min" pattern

## Solution

### 1. Updated Prisma Schema

**File:** `apps/server/prisma/schema-historical.prisma`

```prisma
generator client {
  provider      = "prisma-client-js"
  output        = "../generated/prisma-historical"
  binaryTargets = ["native", "rhel-openssl-3.0.x", "linux-musl-openssl-3.0.x"]
}
```

**Why these targets:**

- `native`: Local development (macOS/Windows)
- `rhel-openssl-3.0.x`: Vercel's AWS Lambda runtime
- `linux-musl-openssl-3.0.x`: Alpine Linux containers (future-proofing)

### 2. Updated Next.js Config

**File:** `apps/web/next.config.js`

Added experimental output file tracing to ensure Prisma binaries are included in
Vercel's function bundles:

```javascript
experimental: {
  outputFileTracingIncludes: {
    '/api/**/*': [
      '../server/generated/prisma-historical/**/*',
      '../server/node_modules/.prisma/client/**/*',
      '../server/node_modules/@prisma/client/**/*',
    ],
  },
}
```

This tells Next.js/Vercel to explicitly include Prisma files when building API
routes.

### 3. Regenerated Prisma Client

```bash
cd apps/server
npx prisma generate --schema=prisma/schema-historical.prisma
```

This downloaded all three query engine binaries:

- `libquery_engine-darwin-arm64.dylib.node` (16MB) - macOS
- `libquery_engine-rhel-openssl-3.0.x.so.node` (15MB) - Vercel
- `libquery_engine-linux-musl-openssl-3.0.x.so.node` (15MB) - Alpine

## Verification

### Pre-Deployment (Local)

1. **Check binaries exist:**

```bash
ls -lh apps/server/generated/prisma-historical/*.node
# Should show 3 binaries
```

2. **Build succeeds:**

```bash
pnpm turbo build --filter=@gauntlet/web
# Should complete without errors
```

3. **Database query works:**

```bash
cd apps/server
npx tsx -e "import {PrismaClient} from './generated/prisma-historical/index.js'; const p = new PrismaClient(); p.liveWinProbSample.count().then(c => console.log('Count:', c)).finally(() => p.\$disconnect());"
```

### Post-Deployment (Production)

1. **Check Vercel deployment logs:**
   - Should see `Prisma schema loaded` during build
   - Should NOT see "Query Engine not found" errors

2. **Monitor cron job execution:**
   - Go to: https://vercel.com/[your-project]/logs
   - Filter by: `@api/cron/live-odds`
   - Should see: `✅ [CRON] Live odds snapshot completed`

3. **Verify database is receiving data:**

```sql
SELECT
  week,
  matchup_id,
  COUNT(*) as sample_count,
  MAX(timestamp) as latest_sample
FROM "LiveWinProbSample"
WHERE week = [CURRENT_WEEK]
GROUP BY week, matchup_id
ORDER BY matchup_id;
```

Expected: 12 matchups × ~N samples per matchup (where N = number of cron runs
since games started)

4. **Check for timestamp gaps** (indicates failures):

```sql
SELECT
  timestamp,
  LAG(timestamp) OVER (ORDER BY timestamp DESC) as next_timestamp,
  EXTRACT(EPOCH FROM (LAG(timestamp) OVER (ORDER BY timestamp DESC) - timestamp))/60 as gap_minutes
FROM "LiveWinProbSample"
WHERE week = [CURRENT_WEEK]
ORDER BY timestamp DESC
LIMIT 50;
```

Look for gaps > 12 minutes (cron runs every 10 min, allow 2 min buffer).

## Deployment Checklist

- [x] Updated `schema-historical.prisma` with `binaryTargets`
- [x] Regenerated Prisma client locally
- [x] Updated `next.config.js` with output file tracing
- [x] Verified build succeeds locally
- [x] Committed changes
- [ ] Deploy to Vercel
- [ ] Monitor first 3 cron executions (30 minutes)
- [ ] Check database for new samples
- [ ] Verify no "Query Engine not found" errors in logs

## Rollback Plan

If issues persist after deployment:

1. Check Vercel build logs for Prisma generation errors
2. Verify environment variable `DATABASE_URL` is set correctly
3. Try clearing Vercel's build cache: Settings → General → Clear Build Cache
4. Worst case: Revert to previous commit, investigate further

## Prevention

- **Always specify `binaryTargets`** when using Prisma in monorepos with
  serverless deployments
- **Test builds locally** before deploying database-dependent code
- **Monitor cron jobs** with alerting (e.g., Vercel Monitoring, Sentry)
- **Add health checks** that verify database connectivity

## Related Files

- `apps/server/prisma/schema-historical.prisma` - Schema definition
- `apps/server/src/lib/historical-data.ts` - Database operations
- `apps/web/src/app/api/cron/live-odds/route.ts` - Cron endpoint
- `apps/web/src/app/api/cron/live-odds/snapshot-runner.ts` - Snapshot logic
- `apps/web/next.config.js` - Build configuration
- `apps/web/vercel.json` - Deployment configuration

## References

- [Prisma Binary Targets](https://www.prisma.io/docs/concepts/components/prisma-engines/query-engine#binary-targets)
- [Next.js Output File Tracing](https://nextjs.org/docs/advanced-features/output-file-tracing)
- [Vercel Serverless Functions](https://vercel.com/docs/concepts/functions/serverless-functions)
- [AWS Lambda Runtime Environments](https://docs.aws.amazon.com/lambda/latest/dg/lambda-runtimes.html)

---

**Fixed:** 2025-10-09  
**Author:** Cursor AI Assistant  
**Verified:** ✅ Build passes, awaiting production deployment verification
