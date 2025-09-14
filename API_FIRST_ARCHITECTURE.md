# API-First Architecture Plan

## 🎯 Goal: Reduce Neon Compute to Near-Zero

**Current Problem:** Every page load hits the database for data that's available from Sleeper API

## 📊 New Data Flow

```
Before (Expensive):
User Visit → Vercel → Neon DB → Return Data
  
After (Free):  
User Visit → Vercel → Sleeper API → Return Data
                  ↓
            (Optional: Cache in memory/Redis)
```

## 🔄 Implementation Plan

### Phase 1: Replace DB Reads with Sleeper API

**File:** `apps/web/src/lib/sleeper-client.ts`
```typescript
// Centralized Sleeper API client
export class SleeperClient {
  private cache = new Map();
  
  async getLeague(leagueId: string) {
    // Check memory cache first
    if (this.cache.has(`league:${leagueId}`)) {
      return this.cache.get(`league:${leagueId}`);
    }
    
    // Fetch from Sleeper
    const data = await fetch(`https://api.sleeper.app/v1/league/${leagueId}`)
      .then(r => r.json());
    
    // Cache for 5 minutes
    this.cache.set(`league:${leagueId}`, data);
    setTimeout(() => this.cache.delete(`league:${leagueId}`), 5 * 60 * 1000);
    
    return data;
  }
  
  async getRosters(leagueId: string) {
    // Similar pattern
  }
  
  async getMatchups(leagueId: string, week: number) {
    // Similar pattern
  }
}
```

### Phase 2: Client-Side Simulations

**File:** `apps/web/src/lib/client-simulation.ts`
```typescript
// Run simulations in the browser
export async function simulateMatchup(
  team1Starters: string[],
  team2Starters: string[],
  projections: any
) {
  // Import sim-engine to browser
  const { simulateMatchupProbability } = await import('@gauntlet/sim-engine');
  
  // Run simulation client-side (no DB!)
  return simulateMatchupProbability(
    team1Starters,
    team2Starters,
    1000 // Fewer iterations for browser
  );
}
```

### Phase 3: Database for Reporting Only

**When to use DB:**
- ✅ Historical win probability snapshots (for charts)
- ✅ Weekly reports (persistent records)
- ✅ Season-end analytics
- ✅ Hall of Fame records

**When NOT to use DB:**
- ❌ Current league data → Use Sleeper API
- ❌ Current rosters → Use Sleeper API
- ❌ Current matchups → Use Sleeper API
- ❌ Live simulations → Run client-side

## 🚀 Quick Wins (Do Today)

### 1. Replace League/Roster Queries

**Before:** `apps/web/src/app/page.tsx`
```typescript
// DON'T DO THIS
const league = await prisma.league.findUnique({ where: { id } });
const rosters = await prisma.roster.findMany({ where: { leagueId } });
```

**After:**
```typescript
// DO THIS
const sleeper = new SleeperClient();
const league = await sleeper.getLeague(id);
const rosters = await sleeper.getRosters(id);
```

### 2. API Route Pattern

**File:** `apps/web/src/app/api/league/[id]/route.ts`
```typescript
export async function GET(request: Request, { params }) {
  // No database connection!
  const sleeper = new SleeperClient();
  const league = await sleeper.getLeague(params.id);
  
  return NextResponse.json(league);
}
```

## 📉 Expected Impact

### Current Neon Usage
- Every page visit: 3-5 DB queries
- Each query: Keeps connection active
- Total: 50+ hours/month

### After API-First
- Regular pages: 0 DB queries
- Reports/Analytics: Occasional DB reads
- Total: <1 hour/month

## 🎯 Implementation Priority

1. **TODAY:** Replace league/roster DB queries with Sleeper API
2. **THIS WEEK:** Move simulations to client-side
3. **NEXT WEEK:** Optimize remaining DB usage

## 💡 Key Insight

**The database should be for YOUR data, not Sleeper's data.**

- Sleeper data → Fetch from Sleeper
- Your analytics → Store in database
- Live calculations → Run client-side

This way, you only pay for compute when you're actually using YOUR data!
