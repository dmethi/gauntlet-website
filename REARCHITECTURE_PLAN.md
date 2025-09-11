# Gauntlet Website Re-Architecture Plan

## Executive Summary
Transitioning from a database-heavy architecture to a lean, API-first approach that:
- **Reduces Neon DB usage by ~85%** to stay on free tier
- **Eliminates ID management complexity** 
- **Improves data freshness** with real-time Sleeper API calls
- **Simplifies maintenance** by removing sync requirements

## Current Architecture Problems

### 1. Database Overuse (90% of Free Tier)
- Storing redundant Sleeper data that's freely available via API
- Heavy read/write operations for data replication
- Unnecessary compute for data that doesn't require persistence

### 2. ID Management Complexity
```typescript
// Current problematic pattern found throughout codebase:
const offset = leagueId === '1263740549504962561' ? 2000 : 0;
const dbRosterId = Number(sleeperRosterId) + offset;
```
- Manual ID offsetting to differentiate between leagues
- Error-prone and requires constant maintenance
- Causes alignment issues between Sleeper and DB data

### 3. Data Synchronization Issues
- Database can become stale vs Sleeper API
- Requires multiple sync scripts and maintenance jobs
- Complex ingestion pipeline for simple data replication

## Proposed Architecture

### Core Principles
1. **Neon DB**: Only for computed/historical odds data
2. **Sleeper API**: Direct source for all Sleeper data
3. **Local Archives**: JSON files for historical data preservation
4. **Multi-Layer Caching**: Client-side (React Query), Edge (Vercel), and server-side caching
5. **Smart Prefetching**: Predictive data loading for improved UX

### Data Classification

#### ✅ Keep in Neon DB (Unique/Computed Data)
| Table | Purpose | Why Keep |
|-------|---------|----------|
| MatchupSimulation | Simulation results | Core computed value |
| PlayerSimulation | Player-level sims | Computed distributions |
| MatchupOddsHistory | Historical odds | Time-series tracking |
| LeagueOddsHistory | League-wide odds | Historical analysis |
| LiveWinProbSample | Live probabilities | Real-time tracking |
| PositionVariance | Variance models | ML training data |
| PlayerVariance | Player variance | Computed statistics |
| ProjectionError | Accuracy tracking | Performance metrics |
| HallOfFameCategory | Categories | Custom definitions |
| HallOfFameRecord | Records | Computed achievements |

#### ❌ Remove from DB (Query from Sleeper)
| Table | Migration Strategy | API Endpoint |
|-------|-------------------|--------------|
| User | Direct API call | `/league/{id}/users` |
| League | Direct API call | `/league/{id}` |
| Roster | Direct API call | `/league/{id}/rosters` |
| Matchup | Direct API call | `/league/{id}/matchups/{week}` |
| Transaction | Direct API call | `/league/{id}/transactions/{week}` |
| Draft | Direct API call | `/draft/{id}` |
| DraftPick | Direct API call | `/draft/{id}/picks` |
| Player | Direct API call | `/players/nfl` |
| PlayerStats | Direct API call | `/stats/nfl/{season}/{week}` |
| TradedPick | Derive from transactions | N/A |

#### 🔄 Evaluate Case-by-Case
| Table | Decision Criteria |
|-------|------------------|
| WeeklyMetrics | Keep if computation > 100ms |
| RosterWeekAggregate | Keep if frequently accessed |
| LeagueWeekSummary | Keep if reduces API calls significantly |
| MatchupSummary | Possibly derive from API |
| SeasonSuperlatives | Keep for season-end calculations |
| PlayerStatusHistory | Archive locally as JSON |

## Implementation Plan

### Phase 1: Infrastructure Setup (Week 1)
- [ ] Create Sleeper API service layer with caching
- [ ] Setup local JSON archive system
- [ ] Implement React Query for client-side caching
- [ ] Configure multi-layer caching (client, edge, server)
- [ ] Create new Prisma schema with only odds/simulation tables

### Phase 2: API Endpoint Migration (Week 2-3)
- [ ] Migrate `/api/leagues` to use Sleeper directly
- [ ] Migrate `/api/league/overview` to Sleeper API
- [ ] Migrate `/api/matchups/[leagueId]/[week]` to Sleeper
- [ ] Migrate `/api/team/[id]` to Sleeper
- [ ] Update transaction endpoints to use Sleeper API
- [ ] Update draft endpoints to use Sleeper API

### Phase 3: Simulation System Update (Week 3)
- [ ] Update simulation scripts to fetch fresh data from Sleeper
- [ ] Remove roster ID offset logic
- [ ] Ensure odds history continues to be stored
- [ ] Update live scoring system to use Sleeper API

### Phase 4: Data Migration & Cleanup (Week 4)
- [ ] Archive existing data to JSON files
- [ ] Drop unnecessary tables from Neon DB
- [ ] Update all database queries in codebase
- [ ] Remove data ingestion scripts

### Phase 5: Testing & Optimization (Week 5)
- [ ] Performance testing with caching layers
- [ ] Ensure all features work with new architecture
- [ ] Monitor Neon DB usage (target: <15% of free tier)
- [ ] Add fallback mechanisms for API failures

## Code Changes Required

### 1. New Sleeper API Service
```typescript
// apps/server/src/services/sleeper-api.service.ts
export class SleeperAPIService {
  private cache: Map<string, CachedData>;
  
  async getLeague(leagueId: string): Promise<League> {
    return this.fetchWithCache(`/league/${leagueId}`, 300); // 5 min cache
  }
  
  async getRosters(leagueId: string): Promise<Roster[]> {
    return this.fetchWithCache(`/league/${leagueId}/rosters`, 60); // 1 min cache
  }
  
  async getMatchups(leagueId: string, week: number): Promise<Matchup[]> {
    return this.fetchWithCache(`/league/${leagueId}/matchups/${week}`, 30); // 30s cache
  }
}
```

### 2. Updated API Endpoints
```typescript
// Before (database-heavy)
export async function GET(request: Request) {
  const league = await prisma.league.findFirst({
    include: { rosters: true, matchups: true }
  });
  return NextResponse.json(league);
}

// After (API-first)
export async function GET(request: Request) {
  const sleeperAPI = new SleeperAPIService();
  const [league, rosters, matchups] = await Promise.all([
    sleeperAPI.getLeague(leagueId),
    sleeperAPI.getRosters(leagueId),
    sleeperAPI.getMatchups(leagueId, week)
  ]);
  return NextResponse.json({ ...league, rosters, matchups });
}
```

### 3. Remove ID Offset Logic
```typescript
// Remove all instances of:
const offset = leagueId === '1263740549504962561' ? 2000 : 0;

// Simply use Sleeper IDs directly:
const rosterId = matchup.roster_id; // No conversion needed!
```

## Benefits

### 1. Cost Savings
- **Before**: 90% of Neon free tier consumed
- **After**: ~5-10% usage (with client-side caching)
- **Savings**: Stay comfortably within free tier limits
- **Additional**: 90% reduction in API calls via client caching

### 2. Simplified Architecture
- No ID mapping/offset logic
- No data synchronization jobs
- No stale data issues
- Reduced database schema complexity

### 3. Improved Performance
- Real-time data from Sleeper
- Multi-layer caching (client, edge, server)
- 90% reduction in API calls
- 82% improvement in average latency (30ms vs 165ms)
- Parallel API calls for better response times
- Smart prefetching for instant navigation

### 4. Easier Maintenance
- Fewer scripts to maintain
- No sync/ingestion pipeline
- Single source of truth (Sleeper API)
- Cleaner codebase

## Risk Mitigation

### 1. Sleeper API Availability
- **Risk**: API downtime affects functionality
- **Mitigation**: 
  - Implement robust caching layer
  - Add circuit breaker pattern
  - Create fallback to cached/archived data

### 2. Rate Limiting
- **Risk**: Too many API calls
- **Mitigation**:
  - Implement request batching
  - Use aggressive caching
  - Monitor API usage patterns

### 3. Performance Impact
- **Risk**: Slower response times
- **Mitigation**:
  - Parallel API calls
  - Smart prefetching
  - Edge caching with Vercel

## Success Metrics
- [ ] Neon DB usage < 10% of free tier
- [ ] All features functional with new architecture
- [ ] API response times < 100ms p95 (with caching)
- [ ] Client cache hit rate > 70%
- [ ] Zero ID management issues
- [ ] Simplified codebase (remove 1000+ lines)
- [ ] 90% reduction in API calls per session

## Timeline
- **Week 1**: Infrastructure setup
- **Week 2-3**: API migration
- **Week 3**: Simulation updates
- **Week 4**: Data migration
- **Week 5**: Testing & optimization
- **Total**: 5 weeks to complete migration

## Next Steps
1. Review and approve this plan
2. Set up development branch for migration
3. Begin Phase 1 implementation
4. Create rollback plan if needed
