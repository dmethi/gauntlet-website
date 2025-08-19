# Single Vercel Deployment Guide

## 🎯 Everything on Vercel Approach

Your entire Gauntlet application can now be deployed as a single Vercel project!

### ✅ What This Includes

- ✅ Next.js frontend (`apps/web`)
- ✅ All API routes with simulation logic
- ✅ Monte Carlo win probability calculations
- ✅ Database operations via Prisma
- ✅ All server functionality as serverless functions

### 🚀 Deployment Steps

#### 1. Deploy to Vercel

```bash
# From project root
vercel --root-directory=apps/web
```

Or via Vercel Dashboard:

- Set **Root Directory**: `apps/web`
- Framework: Next.js (auto-detected)

#### 2. Set Up Database

**Option A: Vercel Postgres**

```bash
vercel storage create postgres
```

**Option B: External Database (Neon/PlanetScale/Supabase)**

- Create PostgreSQL database
- Copy connection string

#### 3. Configure Environment Variables

In Vercel dashboard, add:

```
DATABASE_URL=your_postgresql_connection_string
NODE_ENV=production
```

#### 4. Run Database Migrations

```bash
# After deployment, run migrations
npx prisma migrate deploy
```

### 🔄 What Changed

**Before:**

```
Web App (Vercel) → Express Server (Railway) → Database
```

**Now:**

```
Web App + API Routes (Vercel) → Database
```

### ⚡ Performance Benefits

- **Faster**: No network calls between web app and API
- **Simpler**: Single deployment and domain
- **Cost-effective**: Free tier handles most use cases
- **Auto-scaling**: Vercel handles traffic spikes

### 🕐 Function Timeouts

Your simulations run well within Vercel limits:

- **Hobby Plan**: 10s (plenty for 2,000 iteration sims)
- **Pro Plan**: 15s (comfortable for 10,000 iteration sims)
- **Enterprise**: 5min (for future complex scenarios)

### 🗂️ Background Jobs

For scheduled jobs (like live win probability updates), use:

**Option A: Vercel Cron Functions**

```typescript
// apps/web/src/app/api/cron/live-sims/route.ts
export async function GET() {
  // Your live simulation logic here
  // Runs on schedule via vercel.json cron config
}
```

**Option B: GitHub Actions (Current)**

- Keep your existing GitHub Actions
- Point them to your Vercel deployment

### 🎉 Final Result

**Single command deployment:**

```bash
vercel --root-directory=apps/web
```

Your entire fantasy football platform runs on Vercel's global edge network with:

- ⚡ Sub-second API responses
- 🌍 Global CDN for frontend assets
- 🔄 Auto-scaling based on traffic
- 💰 Generous free tier

**No separate server needed!**
