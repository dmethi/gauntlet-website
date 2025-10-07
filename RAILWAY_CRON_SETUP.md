# Railway Cron Setup (Free Alternative to Vercel)

Railway offers cron jobs on their **free tier** with better reliability than GitHub Actions.

## Why Railway?

- ✅ **Free tier**: 500 hours/month (plenty for cron jobs)
- ✅ **More reliable** than GitHub Actions (95%+ success rate)
- ✅ **Simple setup**: One command to deploy
- ✅ **Built-in monitoring**: Dashboard with logs
- ✅ **No cold starts**: Faster than serverless

## Quick Setup

### 1. Create Railway Service

```bash
# Install Railway CLI
npm i -g @railway/cli

# Login
railway login

# Create new project
railway init

# Link to your repo
railway link
```

### 2. Deploy the Cron Script

Railway will call your Vercel API endpoint:

Create `railway.json`:
```json
{
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "node scripts/railway-cron.js",
    "restartPolicyType": "ON_FAILURE"
  }
}
```

Create `scripts/railway-cron.js`:
```javascript
const fetch = require('node-fetch');

const CRON_URL = process.env.VERCEL_CRON_URL || 'https://gauntlet-website.vercel.app/api/cron/live-odds';
const CRON_SECRET = process.env.CRON_SECRET;
const CHECK_INTERVAL = 10 * 60 * 1000; // 10 minutes

async function runSnapshot() {
  try {
    console.log(`[${new Date().toISOString()}] Triggering snapshot...`);
    
    const response = await fetch(CRON_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${CRON_SECRET}`,
        'Content-Type': 'application/json'
      }
    });

    const result = await response.json();
    
    if (response.ok) {
      console.log('✅ Snapshot completed:', result);
    } else {
      console.error('❌ Snapshot failed:', result);
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// Run every 10 minutes during game windows
setInterval(async () => {
  const now = new Date();
  const hour = now.getUTCHours();
  const day = now.getUTCDay();
  const month = now.getUTCMonth();
  
  // Only run during NFL season (Sep-Feb) and game windows
  const isNFLSeason = month >= 8 || month <= 1;
  
  if (!isNFLSeason) {
    console.log('⏸️  Off-season, skipping...');
    return;
  }
  
  // Check if it's a game window
  const isGameWindow = (
    // Thursday Night: Friday 00:00-05:59 UTC
    (day === 5 && hour >= 0 && hour <= 5) ||
    // Sunday: Sunday 17:00-23:59 + Monday 00:00-05:59 UTC
    (day === 0 && hour >= 17) ||
    (day === 1 && hour <= 5) ||
    // Monday Night: Tuesday 00:00-05:59 UTC
    (day === 2 && hour >= 0 && hour <= 5)
  );
  
  if (isGameWindow) {
    await runSnapshot();
  } else {
    console.log('⏸️  Outside game window, skipping...');
  }
}, CHECK_INTERVAL);

// Run immediately on start
runSnapshot();
```

### 3. Set Environment Variables

```bash
railway variables set CRON_SECRET="CPjSCzFeMLiPbkACQw0p9t9GZgKG3lHjr6TKIQLIo9U="
railway variables set VERCEL_CRON_URL="https://gauntlet-website.vercel.app/api/cron/live-odds"
```

### 4. Deploy

```bash
railway up
```

**Cost**: FREE (500 hours/month is way more than needed)

---

## Option 2: Cron-job.org (Free External Service)

Free webhook-based cron service:

1. Go to https://cron-job.org/en/
2. Create account (free)
3. Add cron jobs for each window:
   - Thursday: `0,10,20,30,40,50 0-5 * * 5`
   - Sunday: `0,10,20,30,40,50 17-23 * * 0` + `0,10,20,30,40,50 0-5 * * 1`
   - Monday: `0,10,20,30,40,50 0-5 * * 2`
4. Set URL: `https://gauntlet-website.vercel.app/api/cron/live-odds`
5. Add header: `Authorization: Bearer CPjSCzFeMLiPbkACQw0p9t9GZgKG3lHjr6TKIQLIo9U=`

**Pros**: 
- Completely free
- Very reliable
- Simple setup

**Cons**:
- External dependency
- Less control

---

## Option 3: Improve GitHub Actions with Redundancy

Make GitHub Actions more reliable by adding redundant schedules:

```yaml
crons:
  # Monday Night: Run every 5 min (instead of 10) for redundancy
  - cron: "*/5 0-5 * 9-12,1-2 2"
  
  # Also add offset schedules (2 min after each 10 min mark)
  - cron: "2,12,22,32,42,52 0-5 * 9-12,1-2 2"
  
  # And 5 min after
  - cron: "5,15,25,35,45,55 0-5 * 9-12,1-2 2"
```

This way, even if 50% of runs fail, you still get good coverage.

**Cost**: FREE  
**Reliability**: ~50% (but with 3x redundancy = ~87% effective)

---

## Option 4: Upstash QStash (Generous Free Tier)

Serverless queue/cron service:

- **Free tier**: 500 requests/day
- **Reliability**: 99.9%+
- **Setup**: Similar to Railway

---

## Recommended: Railway (Best Free Option)

Railway gives you:
- ✅ FREE (500 hours/month)
- ✅ 95%+ reliability (vs 5-10% with GitHub Actions)
- ✅ Simple setup (5 minutes)
- ✅ No vendor lock-in (just calls your Vercel API)

Want me to set up the Railway solution?
