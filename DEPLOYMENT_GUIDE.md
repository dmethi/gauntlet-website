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
1. Every 6 hours: Update league data and player stats
2. Every Monday: Run simulations  
3. Manual triggers available

**Real-time Updates (Sleeper Webhooks):**
1. Trades, pickups, drops trigger immediate updates
2. Waiver processing updates

**Frontend:**
1. Static pages load instantly
2. Data fetched from API routes
3. Cached in Vercel KV

## Storage

Using Vercel KV (Redis-like):
```javascript
// Store league data
await kv.set(`league:${leagueId}`, leagueData);

// Store player stats  
await kv.set(`stats:week:${week}`, statsData);

// Store simulation results
await kv.set(`sims:${leagueId}:${week}`, simResults);
```

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
2. **Connect sim-engine**: Integrate your simulation logic
3. **Add error handling**: Retry logic, dead letter queues
4. **Setup monitoring**: Sentry for error tracking

## Scaling Path

When you need more:
- **Vercel Pro**: $20/month (more bandwidth, KV storage)
- **PlanetScale**: $29/month (proper PostgreSQL)
- **Railway**: $5-20/month (background jobs, more control)

Your current setup will handle 50 users easily. Only upgrade when you actually need it. 