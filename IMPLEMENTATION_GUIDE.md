# Implementation Guide: Database to API Migration

> **Note**: For detailed client-side caching implementation, see [CLIENT_CACHING_STRATEGY.md](./CLIENT_CACHING_STRATEGY.md)

## Quick Start Implementation

### Step 1: Create Sleeper API Service Layer

```typescript
// apps/server/src/services/sleeper/sleeper-api.service.ts

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

export class SleeperAPIService {
  private static instance: SleeperAPIService;
  private cache = new Map<string, CacheEntry<any>>();
  private readonly baseUrl = 'https://api.sleeper.app/v1';
  
  private constructor() {}
  
  static getInstance(): SleeperAPIService {
    if (!this.instance) {
      this.instance = new SleeperAPIService();
    }
    return this.instance;
  }
  
  private async fetchWithCache<T>(
    endpoint: string, 
    ttlSeconds: number = 60
  ): Promise<T> {
    const cacheKey = endpoint;
    const cached = this.cache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < cached.ttl * 1000) {
      console.log(`📦 Cache hit: ${endpoint}`);
      return cached.data;
    }
    
    console.log(`🌐 Fetching: ${endpoint}`);
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      headers: { 'User-Agent': 'Gauntlet-Website/1.0.0' }
    });
    
    if (!response.ok) {
      throw new Error(`Sleeper API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    this.cache.set(cacheKey, {
      data,
      timestamp: Date.now(),
      ttl: ttlSeconds
    });
    
    return data;
  }
  
  // League endpoints
  async getLeague(leagueId: string) {
    return this.fetchWithCache(`/league/${leagueId}`, 300); // 5 min
  }
  
  async getRosters(leagueId: string) {
    return this.fetchWithCache(`/league/${leagueId}/rosters`, 60); // 1 min
  }
  
  async getUsers(leagueId: string) {
    return this.fetchWithCache(`/league/${leagueId}/users`, 300); // 5 min
  }
  
  async getMatchups(leagueId: string, week: number) {
    return this.fetchWithCache(`/league/${leagueId}/matchups/${week}`, 30); // 30s during games
  }
  
  async getTransactions(leagueId: string, week: number) {
    return this.fetchWithCache(`/league/${leagueId}/transactions/${week}`, 60);
  }
  
  // Player endpoints
  async getPlayers() {
    return this.fetchWithCache('/players/nfl', 3600); // 1 hour
  }
  
  async getProjections(week: number, season: string = '2025') {
    return this.fetchWithCache(
      `/projections/nfl/regular/${season}/${week}`, 
      300 // 5 min
    );
  }
  
  // Draft endpoints
  async getDraft(draftId: string) {
    return this.fetchWithCache(`/draft/${draftId}`, 3600); // 1 hour
  }
  
  async getDraftPicks(draftId: string) {
    return this.fetchWithCache(`/draft/${draftId}/picks`, 3600);
  }
  
  // NFL State
  async getNFLState() {
    return this.fetchWithCache('/state/nfl', 60); // 1 min
  }
  
  // Clear cache for specific endpoint or all
  clearCache(endpoint?: string) {
    if (endpoint) {
      this.cache.delete(endpoint);
    } else {
      this.cache.clear();
    }
  }
}
```

### Step 2: Create Archive System for Historical Data

```typescript
// apps/server/src/services/archive/archive.service.ts

import fs from 'fs/promises';
import path from 'path';

export class ArchiveService {
  private readonly archivePath = path.join(process.cwd(), 'data', 'archive');
  
  async ensureDirectory() {
    await fs.mkdir(this.archivePath, { recursive: true });
  }
  
  async saveSnapshot(
    type: 'league' | 'matchups' | 'rosters' | 'transactions',
    identifier: string,
    data: any
  ): Promise<void> {
    await this.ensureDirectory();
    
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `${type}_${identifier}_${timestamp}.json`;
    const filepath = path.join(this.archivePath, type, filename);
    
    await fs.mkdir(path.dirname(filepath), { recursive: true });
    await fs.writeFile(filepath, JSON.stringify(data, null, 2));
    
    console.log(`📁 Archived: ${filename}`);
  }
  
  async loadSnapshot(
    type: string,
    identifier: string,
    date?: string
  ): Promise<any | null> {
    const searchDate = date || new Date().toISOString().split('T')[0];
    const filename = `${type}_${identifier}_${searchDate}.json`;
    const filepath = path.join(this.archivePath, type, filename);
    
    try {
      const data = await fs.readFile(filepath, 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      console.log(`📁 No archive found: ${filename}`);
      return null;
    }
  }
  
  async listArchives(type: string): Promise<string[]> {
    const dirPath = path.join(this.archivePath, type);
    try {
      return await fs.readdir(dirPath);
    } catch {
      return [];
    }
  }
}
```

### Step 3: Migrate First API Endpoint

```typescript
// apps/web/src/app/api/league/overview/route.ts

import { NextResponse } from 'next/server';
import { SleeperAPIService } from '@/services/sleeper/sleeper-api.service';
import { ArchiveService } from '@/services/archive/archive.service';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const leagueId = searchParams.get('leagueId') || '1124062059117969408'; // AFC default
  
  try {
    const sleeper = SleeperAPIService.getInstance();
    const archive = new ArchiveService();
    
    // Parallel fetch all data from Sleeper
    const [league, rosters, users, currentWeekMatchups] = await Promise.all([
      sleeper.getLeague(leagueId),
      sleeper.getRosters(leagueId),
      sleeper.getUsers(leagueId),
      sleeper.getMatchups(leagueId, getCurrentWeek())
    ]);
    
    // Build roster map with owners
    const userMap = new Map(users.map(u => [u.user_id, u]));
    const enrichedRosters = rosters.map(roster => ({
      ...roster,
      owner: userMap.get(roster.owner_id) || null,
      // Note: No ID offset needed anymore!
      id: roster.roster_id 
    }));
    
    // Get all matchups for the season (parallel)
    const weeks = Array.from({ length: 18 }, (_, i) => i + 1);
    const allMatchups = await Promise.all(
      weeks.map(week => sleeper.getMatchups(leagueId, week))
    );
    
    // Format matchups by roster
    const matchupsByRoster = new Map();
    allMatchups.flat().forEach(matchup => {
      const rosterId = matchup.roster_id;
      if (!matchupsByRoster.has(rosterId)) {
        matchupsByRoster.set(rosterId, []);
      }
      matchupsByRoster.get(rosterId).push({
        week: matchup.week,
        points: matchup.points,
        matchupId: matchup.matchup_id
      });
    });
    
    // Add matchups to rosters
    const rostersWithMatchups = enrichedRosters.map(roster => ({
      ...roster,
      matchups: matchupsByRoster.get(roster.roster_id) || []
    }));
    
    const response = {
      ...league,
      rosters: rostersWithMatchups
    };
    
    // Archive for historical tracking (async, don't wait)
    archive.saveSnapshot('league', leagueId, response).catch(console.error);
    
    return NextResponse.json(response);
    
  } catch (error) {
    console.error('API Error:', error);
    
    // Fallback to archived data if available
    const archive = new ArchiveService();
    const archived = await archive.loadSnapshot('league', leagueId);
    
    if (archived) {
      return NextResponse.json(archived);
    }
    
    return NextResponse.json(
      { error: 'Failed to fetch league data' },
      { status: 500 }
    );
  }
}

function getCurrentWeek(): number {
  // Your existing logic or fetch from NFL state
  return 1; 
}
```

### Step 4: Update Simulation System

```typescript
// apps/server/src/scripts/jobs/run-batch-simulations-v2.ts

import { SleeperAPIService } from '../../services/sleeper/sleeper-api.service';
import prisma from '../../lib/prisma';

async function simulateMatchup(
  leagueId: string,
  week: number,
  matchupId: number
) {
  const sleeper = SleeperAPIService.getInstance();
  
  // Fetch fresh data directly from Sleeper
  const [matchups, rosters, projections] = await Promise.all([
    sleeper.getMatchups(leagueId, week),
    sleeper.getRosters(leagueId),
    sleeper.getProjections(week)
  ]);
  
  // Find the specific matchup pair (no ID offset needed!)
  const matchupPair = matchups.filter(m => m.matchup_id === matchupId);
  if (matchupPair.length !== 2) {
    throw new Error(`Invalid matchup: ${matchupId}`);
  }
  
  const [team1, team2] = matchupPair;
  
  // Get rosters
  const roster1 = rosters.find(r => r.roster_id === team1.roster_id);
  const roster2 = rosters.find(r => r.roster_id === team2.roster_id);
  
  // Build lineups with projections
  const team1Players = buildLineup(team1.starters, projections);
  const team2Players = buildLineup(team2.starters, projections);
  
  // Run simulation
  const simResult = await simulateMatchupProbability(
    team1Players,
    team2Players,
    100000 // iterations
  );
  
  // Store ONLY the simulation results in DB
  await prisma.matchupSimulation.upsert({
    where: {
      leagueId_week_matchupId: {
        leagueId,
        week,
        matchupId
      }
    },
    update: {
      teamAMean: simResult.team1Scores.mean,
      teamAP10: simResult.team1Scores.p10,
      teamAMedian: simResult.team1Scores.median,
      teamAP90: simResult.team1Scores.p90,
      teamBMean: simResult.team2Scores.mean,
      teamBP10: simResult.team2Scores.p10,
      teamBMedian: simResult.team2Scores.median,
      teamBP90: simResult.team2Scores.p90,
      teamAWinPct: simResult.team1WinPct,
      teamBWinPct: simResult.team2WinPct,
      updatedAt: new Date()
    },
    create: {
      leagueId,
      week,
      matchupId,
      teamAMean: simResult.team1Scores.mean,
      teamAP10: simResult.team1Scores.p10,
      teamAMedian: simResult.team1Scores.median,
      teamAP90: simResult.team1Scores.p90,
      teamBMean: simResult.team2Scores.mean,
      teamBP10: simResult.team2Scores.p10,
      teamBMedian: simResult.team2Scores.median,
      teamBP90: simResult.team2Scores.p90,
      teamAWinPct: simResult.team1WinPct,
      teamBWinPct: simResult.team2WinPct
    }
  });
  
  console.log(`✅ Simulation complete for matchup ${matchupId}`);
}
```

### Step 5: New Prisma Schema (Minimal)

```prisma
// apps/server/prisma/schema-v2.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// Only keep computed/historical data
model MatchupSimulation {
  id          String   @id @default(cuid())
  leagueId    String
  week        Int
  matchupId   Int
  
  teamAMean   Float
  teamAP10    Float
  teamAMedian Float
  teamAP90    Float
  teamAStdDev Float?
  
  teamBMean   Float
  teamBP10    Float
  teamBMedian Float
  teamBP90    Float
  teamBStdDev Float?
  
  teamAWinPct Float
  teamBWinPct Float
  
  impliedSpread  Float?
  totalLine      Float?
  moneyLineA     Int?
  moneyLineB     Int?
  
  iterations     Int      @default(100000)
  computeTimeMs  Int?
  
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt
  
  @@unique([leagueId, week, matchupId])
  @@index([leagueId, week])
}

model MatchupOddsHistory {
  id             String   @id @default(cuid())
  leagueId       String
  week           Int
  matchupId      Int
  
  team1WinPct    Float
  team2WinPct    Float
  spread         Float
  total          Float
  team1MoneyLine Int
  team2MoneyLine Int
  
  team1Score     Float?
  team2Score     Float?
  gameProgress   Float
  isLive         Boolean  @default(false)
  triggeredBy    String
  
  createdAt      DateTime @default(now())
  
  @@index([leagueId, week, matchupId])
  @@index([createdAt])
}

// Add other odds/simulation tables as needed...
```

## Migration Checklist

### Phase 1: Foundation (Do First)
- [ ] Implement SleeperAPIService
- [ ] Implement ArchiveService  
- [ ] Setup React Query for client-side caching
- [ ] Create new minimal Prisma schema
- [ ] Test multi-layer caching performance

### Phase 2: API Migration (Do Next)
- [ ] Migrate `/api/league/overview`
- [ ] Migrate `/api/matchups/[leagueId]/[week]`
- [ ] Migrate `/api/leagues`
- [ ] Migrate `/api/team/[id]`
- [ ] Remove all roster ID offset logic

### Phase 3: Simulation Updates
- [ ] Update batch simulation script
- [ ] Update live simulation script
- [ ] Ensure odds history continues working
- [ ] Test with both leagues

### Phase 4: Cleanup
- [ ] Remove old ingestion scripts
- [ ] Remove sync/maintenance scripts
- [ ] Drop old database tables
- [ ] Update documentation

## Testing Strategy

```typescript
// Test the new service layer
describe('SleeperAPIService', () => {
  it('should cache responses', async () => {
    const service = SleeperAPIService.getInstance();
    
    // First call - hits API
    const result1 = await service.getLeague('123');
    
    // Second call - uses cache
    const result2 = await service.getLeague('123');
    
    expect(result1).toEqual(result2);
    // Verify only one API call was made
  });
  
  it('should handle API failures gracefully', async () => {
    // Test fallback to archive
  });
});
```

## Monitoring

Add logging to track:
1. Cache hit/miss rates
2. API response times
3. Neon DB usage reduction
4. Error rates

```typescript
// Example monitoring
console.log({
  cacheHitRate: (cacheHits / (cacheHits + cacheMisses)) * 100,
  avgApiResponseTime: apiTimes.reduce((a, b) => a + b) / apiTimes.length,
  dbQueriesReduced: oldQueries - newQueries
});
```

## Rollback Plan

If issues arise:
1. Keep old database tables intact initially
2. Use feature flags to switch between old/new
3. Maintain parallel systems briefly
4. Archive all data before dropping tables

This implementation guide provides the exact code needed to start the migration. Begin with Phase 1 and test thoroughly before proceeding.
