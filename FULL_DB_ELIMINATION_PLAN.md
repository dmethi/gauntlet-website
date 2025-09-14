# Complete Database Elimination Plan

## 🎯 Goal: Zero Database Calls from the Website

**New Architecture:**
- Website = Sleeper API + Static Data + Client-side calculations
- Database = Backend scripts only (for your analysis)

## 📝 Migration Checklist

### Phase 1: Core API Routes (Replace with Sleeper)

| Route | Current DB Usage | Replace With |
|-------|-----------------|--------------|
| `/api/leagues` | `prisma.league.findMany()` | Hardcoded league IDs |
| `/api/league/overview` | `prisma.league.findUnique()` | `sleeper.getLeague()` |
| `/api/league/teams` | `prisma.roster.findMany()` | `sleeper.getRosters()` |
| `/api/matchups/[leagueId]/[week]` | `prisma.matchup.findMany()` | `sleeper.getMatchups()` |
| `/api/team/[id]` | `prisma.roster.findUnique()` | `sleeper.getRosters()` |
| `/api/players/[id]` | `prisma.player.findUnique()` | Static player data |
| `/api/league/[leagueId]/transactions` | `prisma.transaction.findMany()` | `sleeper.getTransactions()` |

### Phase 2: Reports (Convert to Static)

**Current:** Database queries for report data
**New:** Import JSON files directly

```typescript
// Instead of:
const data = await prisma.weeklyReport.findUnique()

// Do this:
import weekData from '@/data/reports/2025/week1.json'
```

### Phase 3: Hall of Fame (Client-side)

**Current:** Database aggregations
**New:** Client-side calculations from archived league IDs

```typescript
// Store historical league IDs
const ARCHIVED_LEAGUES = [
  { id: '997670420490801152', season: 2024, name: 'Gauntlet AFC' },
  { id: '997670420490801153', season: 2024, name: 'Gauntlet NFC' },
  // ... previous seasons
];

// Calculate Hall of Fame client-side
async function calculateHallOfFame() {
  const allData = await Promise.all(
    ARCHIVED_LEAGUES.map(league => 
      fetch(`/api/league-direct/${league.id}`)
    )
  );
  // Process in browser
}
```

## 🔧 Implementation Files

### 1. Create League Config
`apps/web/src/config/leagues.ts`
```typescript
export const CURRENT_LEAGUES = [
  { id: '1263740549504962560', name: 'Gauntlet AFC', season: 2025 },
  { id: '1263740549504962561', name: 'Gauntlet NFC', season: 2025 },
];

export const ARCHIVED_LEAGUES = [
  // Add all historical league IDs here
];

export const ALL_LEAGUES = [...CURRENT_LEAGUES, ...ARCHIVED_LEAGUES];
```

### 2. Replace All API Routes
`apps/web/src/lib/api-replacements.ts`
```typescript
import { getLeague, getRosters, getMatchups, getUsers } from './sleeper-direct';
import { CURRENT_LEAGUES } from '@/config/leagues';

// Replace prisma.league.findMany()
export async function getLeagues() {
  return Promise.all(
    CURRENT_LEAGUES.map(l => getLeague(l.id))
  );
}

// Replace prisma.roster.findMany()
export async function getTeams(leagueId: string) {
  return getRosters(leagueId);
}

// Replace prisma.matchup.findMany()
export async function getWeekMatchups(leagueId: string, week: number) {
  return getMatchups(leagueId, week);
}
```

### 3. Static Report Data
`apps/web/src/data/reports/2025/week1.json`
```json
{
  "week": 1,
  "season": 2025,
  "generated": "2025-09-10T12:00:00Z",
  "matchups": [...],
  "standings": [...],
  "highlights": [...]
}
```

### 4. Client-side Simulations
`apps/web/src/lib/client-sim.ts`
```typescript
// Import lightweight sim engine for browser
export async function runClientSimulation(
  team1Starters: string[],
  team2Starters: string[],
  projections: any
) {
  // Run 1000 iterations (fast enough for browser)
  const results = [];
  for (let i = 0; i < 1000; i++) {
    // Simple simulation logic
  }
  return results;
}
```

## 🚀 Execution Order

1. **Replace League/Roster APIs** (30 min)
   - Update all routes to use `sleeper-direct.ts`
   - Test each endpoint

2. **Convert Reports to Static** (1 hour)
   - Export existing reports as JSON
   - Import directly in pages
   - Remove report API routes

3. **Client-side Hall of Fame** (1 hour)
   - List all historical league IDs
   - Move aggregation logic to browser
   - Remove Hall of Fame API routes

4. **Remove Prisma from Web App** (30 min)
   - Delete `apps/web/src/lib/prisma.ts`
   - Remove Prisma dependencies from web package
   - Delete generated Prisma client

## 📊 Final Architecture

```
User Visit → Vercel Static Page
              ↓
         Sleeper API (for live data)
              ↓
         Client-side Processing
              
GitHub Actions → Backend Scripts → Neon DB (for your analysis only)
```

## ✅ Success Metrics

- **Neon compute usage:** 0 hours from website
- **Page load speed:** 10x faster (no DB queries)
- **Cost:** Near zero (just Vercel static hosting)
- **Reliability:** No database = no connection issues

## 🎯 Result

Your website becomes a **pure static site with API calls**, while Neon is only used for backend analytics that YOU run manually or via GitHub Actions.
