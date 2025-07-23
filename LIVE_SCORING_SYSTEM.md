# Live Fantasy Scoring & Excitement Tracking System

## Overview

This system tracks live fantasy football scores and calculates "excitement metrics" to identify the most thrilling matchups during NFL games. It runs every 10 minutes during game windows, stores time-series data, and provides charts showing score progression and win probability changes over time.

## Architecture

```
GitHub Actions (10-min cron) → API Routes → JSON Storage → Charts Frontend
                                  ↓
                            Sleeper API Data
```

**Key Components:**
1. **GitHub Actions Scheduler** - Triggers updates during NFL games
2. **Live Score Tracker** - Fetches and calculates fantasy points
3. **Win Probability Engine** - Calculates matchup win chances
4. **Excitement Metrics** - Identifies most volatile/thrilling games
5. **Time-Series Storage** - JSON files with historical data
6. **Charts Dashboard** - Visual representation of trends

## Why 10-minute intervals?

- **18 data points per 3-hour game** (perfect for trend visualization)
- **50% fewer API calls** than 5-minute intervals (saves GitHub Actions budget)
- **Captures all meaningful momentum swings** without noise
- **~2000 minutes/month** (within GitHub Actions free tier)

## Data Flow

### 1. Scheduled Execution

GitHub Actions runs every 10 minutes during:
- **Thursday Night**: 8-11 PM ET (`*/10 0-3 * * 5`)
- **Sunday Early**: 1-4 PM ET (`*/10 17-20 * * 0`) 
- **Sunday Late**: 4-7 PM ET (`*/10 20-23 * * 0`)
- **Sunday Night**: 8-11 PM ET (`*/10 0-3 * * 1`)
- **Monday Night**: 8-11 PM ET (`*/10 0-3 * * 2`)

### 2. Smart Execution

Each run first calls `/api/games/active` to check if games are actually happening:
- **Time-based check**: Are we in a typical game window?
- **Future enhancement**: Check actual NFL game status via Sleeper API
- **Skips expensive operations** if no games are active

### 3. Data Collection

When games are active:

**Step 1: Live Scores (`/api/update-live-scores`)**
```javascript
// Fetches from Sleeper API
matchups = await fetch(`/league/${leagueId}/matchups/${week}`)
stats = await fetch(`/stats/nfl/regular/${season}/${week}`)

// Calculates fantasy points per player
points = (
  rush_yd * 0.1 + pass_yd * 0.04 + rec_yd * 0.1 +
  rush_td * 6 + pass_td * 4 + rec_td * 6 + rec * 1
)
```

**Step 2: Win Probabilities (`/api/calculate-win-prob`)**
```javascript
// Simple projection (integrate your sim-engine here)
projectedTotal = currentScore + estimateRemainingPoints()
winProbability = Math.min(Math.max(projectedTotal / 120, 0.1), 0.9)
```

### 4. Time-Series Storage

Data is stored in JSON files (not overwritten, appended):

**Score History:**
```json
// data/timeseries-{leagueId}-week-{week}.json
[
  {
    "timestamp": "2024-09-15T21:30:00.000Z",
    "week": 2,
    "season": 2024,
    "matchups": [
      {
        "matchup_id": 1,
        "roster_id": 1,
        "totalLivePoints": 45.2,
        "livePoints": { "4046": 12.5, "421": 8.7 }
      }
    ]
  }
]
```

**Win Probability History:**
```json
// data/winprob-timeseries-{leagueId}-week-{week}.json
[
  {
    "timestamp": "2024-09-15T21:30:00.000Z",
    "week": 2,
    "winProbabilities": [
      {
        "roster_id": 1,
        "currentScore": 45.2,
        "projectedTotal": 78.5,
        "winProbability": 0.65
      }
    ]
  }
]
```

## Excitement Metrics

The system calculates three key metrics to identify thrilling matchups:

### 1. Max Swing
**Definition:** Biggest single change in win probability between data points  
**Example:** 60% → 85% = 25% max swing  
**Interpretation:** Measures dramatic momentum shifts

### 2. Volatility  
**Definition:** Standard deviation of win probabilities over time  
**Calculation:** `sqrt(variance(probabilities))`  
**Interpretation:** Measures overall instability/uncertainty

### 3. Excitement Score
**Definition:** Weighted combination of max swing and volatility  
**Formula:** `(maxSwing * 0.6) + (volatility * 0.4)`  
**Interpretation:** Single metric to rank matchup excitement

### Example Excitement Scenarios

**Low Excitement (Score: 0.08):**
```
85% → 82% → 80% → 78% → 75%
(Steady, predictable decline)
```

**High Excitement (Score: 0.42):**
```
60% → 85% → 45% → 75% → 30%
(Wild swings, major uncertainty)
```

## API Endpoints

### Core Data Collection
- `POST /api/update-leagues` - Updates league/roster data
- `POST /api/update-stats` - Updates player statistics  
- `POST /api/update-live-scores` - Calculates live fantasy scores
- `POST /api/calculate-win-prob` - Calculates win probabilities

### Game Status
- `GET /api/games/active` - Checks if NFL games are currently active

### Chart Data
- `GET /api/charts/[leagueId]/[week]` - Returns time-series data for visualization

### Webhooks (Optional)
- `POST /api/webhook/sleeper` - Handles real-time Sleeper notifications

## Frontend Pages

### `/live` - Live Scores Dashboard
- Current fantasy scores for all matchups
- Real-time win probabilities
- Player-level scoring breakdown
- Auto-refresh capability

### `/charts` - Historical Analysis
- **🥇🥈🥉 Excitement Rankings** - Top 3 most thrilling matchups
- **Score over Time** - Line charts showing point progression
- **Win Probability Trends** - Color-coded probability changes
- **Week Selector** - View historical weeks
- **Excitement Metrics** - Max swing, volatility, excitement scores

## File Structure

```
apps/web/
├── src/app/
│   ├── api/
│   │   ├── calculate-win-prob/route.ts    # Win probability calculation
│   │   ├── update-live-scores/route.ts    # Live score updates
│   │   ├── games/active/route.ts          # Game status check
│   │   ├── charts/[leagueId]/[week]/route.ts  # Chart data API
│   │   └── webhook/sleeper/route.ts       # Sleeper webhooks
│   ├── live/page.tsx                      # Live scores page
│   └── charts/page.tsx                    # Charts/analytics page
├── data/                                  # Time-series JSON storage
│   ├── timeseries-{league}-week-{week}.json
│   ├── winprob-timeseries-{league}-week-{week}.json
│   └── live-scores-{league}-week-{week}.json
└── .github/workflows/
    ├── data-updates.yml                   # Regular data updates
    └── live-games.yml                     # Live game polling
```

## Deployment Setup

### 1. Environment Variables

**Vercel Dashboard:**
```
API_SECRET=your-random-secret-key
```

**GitHub Repository Secrets:**
```
API_BASE_URL=https://your-app.vercel.app
API_SECRET=same-as-vercel-secret
```

### 2. Configure League IDs

Update these files with your actual Sleeper league IDs:
```javascript
const LEAGUE_IDS = [
  '1049321550490456064',  // Replace with real league ID
];
```

**Files to update:**
- `apps/web/src/app/api/update-live-scores/route.ts`
- `apps/web/src/app/api/calculate-win-prob/route.ts`
- `apps/web/src/app/live/page.tsx`
- `apps/web/src/app/charts/page.tsx`

### 3. Deploy to Vercel

```bash
cd apps/web
npx vercel
```

### 4. Test Endpoints

```bash
# Test game status check
curl https://your-app.vercel.app/api/games/active

# Test manual data update (requires auth)
curl -X POST https://your-app.vercel.app/api/update-live-scores \
  -H "Authorization: Bearer your-secret"
```

## Resource Usage

### GitHub Actions Budget
```
Worst case: 13 game windows × 18 runs = 234 runs/week
Average run time: 2 minutes = 468 minutes/week
Monthly usage: ~2000 minutes (within 2000 free tier)
```

### Vercel Limits
```
Function executions: ~1000/week (well under limits)
Storage: JSON files ~1-5MB/week (minimal)
Bandwidth: Negligible for 50 users
```

## Integration Points

### 1. Fantasy Scoring Customization

Modify `calculateLiveScores()` in `/api/update-live-scores/route.ts`:
```javascript
// Current basic scoring - customize for your league
const points = (
  (playerStats.rush_yd || 0) * 0.1 +
  (playerStats.pass_yd || 0) * 0.04 +
  (playerStats.rec_yd || 0) * 0.1 +
  (playerStats.rush_td || 0) * 6 +
  (playerStats.pass_td || 0) * 4 +
  (playerStats.rec_td || 0) * 6 +
  (playerStats.rec || 0) * 1
);
```

### 2. Sim-Engine Integration

Replace placeholder logic in `/api/calculate-win-prob/route.ts`:
```javascript
// Current placeholder - integrate your sim-engine here
const projectedTotal = currentScore + estimateRemainingPoints();
const winProb = Math.min(Math.max(projectedTotal / 120, 0.1), 0.9);

// Replace with actual simulation:
// const simResult = await runMatchupSimulation(matchupData);
// const winProb = simResult.winProbability;
```

### 3. Enhanced Game Detection

Upgrade `/api/games/active/route.ts` to use actual game status:
```javascript
// Current: time-based windows
// Future: check actual NFL game status from Sleeper
const stateResponse = await fetch('https://api.sleeper.app/v1/state/nfl');
const nflState = await stateResponse.json();
// Use nflState to determine if games are actually active
```

## Testing Strategy

### 1. Manual Testing
```bash
# Trigger manual update
curl -X POST https://your-app.vercel.app/api/update-live-scores \
  -H "Authorization: Bearer $API_SECRET"

# Check results
ls apps/web/data/
cat apps/web/data/timeseries-*-week-*.json
```

### 2. GitHub Actions Testing
- Use `workflow_dispatch` to trigger manual runs
- Check action logs for errors
- Verify JSON files are created

### 3. Frontend Testing
- Visit `/live` during game times
- Check `/charts` for historical data
- Test week selector functionality

## Future Enhancements

### 1. Smarter Game Detection
- Parse actual NFL game schedules from Sleeper
- Check individual game start/end times
- Support for weather delays, overtime, etc.

### 2. Advanced Analytics
- **Comeback probability** - chance of trailing team winning
- **Clutch factor** - performance in high-leverage situations
- **Heartbreak index** - how devastating losses were
- **Draft performance tracking** - player vs. expectation

### 3. Real-time Features
- WebSocket connections for live updates
- Push notifications for major swings
- Social features (comments, reactions)
- Betting odds integration

### 4. Mobile Optimization
- Progressive Web App (PWA)
- Push notifications
- Offline data caching
- Native app feel

## Troubleshooting

### Common Issues

**No data appearing:**
- Check if league IDs are correct
- Verify GitHub Actions are running
- Check API authentication
- Ensure data directory exists

**GitHub Actions failing:**
- Check secrets are set correctly
- Verify API endpoints are responding
- Review action logs for specific errors

**Charts not loading:**
- Ensure time-series files exist
- Check console for JavaScript errors
- Verify API route is working

### Debug Commands

```bash
# Check if data files exist
ls -la apps/web/data/

# View latest data
cat apps/web/data/timeseries-*-week-*.json | jq '.[0]'

# Test API endpoints
curl https://your-app.vercel.app/api/games/active
```

## Contributing

When adding features:

1. **Follow the pattern** - append to time-series, don't overwrite
2. **Include timestamps** - every data point needs timing
3. **Handle errors gracefully** - games can be unpredictable
4. **Test during non-game times** - system should handle empty data
5. **Document new metrics** - explain calculation methods

This system provides the foundation for rich fantasy football analytics while staying within free tier limits. The excitement tracking captures the emotional highs and lows that make fantasy football compelling, turning raw data into narrative insights. 