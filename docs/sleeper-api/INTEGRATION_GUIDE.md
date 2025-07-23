# Sleeper API Integration Guide

This guide shows how to integrate the documented Sleeper API endpoints into The Gauntlet's data pipeline, specifically for the scraper service in `apps/scraper/`.

## Quick Start

### 1. Install Dependencies

```bash
cd apps/scraper
npm install node-fetch @types/node-fetch
```

### 2. Basic API Client

Create `src/clients/sleeper-client.ts`:

```typescript
import fetch from 'node-fetch';
import { StatsResponse, ProjectionsResponse, PlayersResponse } from '../../../docs/sleeper-api/schemas/sleeper-api-types';

export class SleeperClient {
  private baseUrl = 'https://api.sleeper.app/v1';
  private rateLimitMs = 100; // Stay under 1000 requests/minute

  private async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private async request<T>(endpoint: string): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    console.log(`Fetching: ${url}`);
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json() as T;
    await this.delay(this.rateLimitMs); // Rate limiting
    
    return data;
  }

  // Official endpoints
  async getUser(userId: string) {
    return this.request(`/user/${userId}`);
  }

  async getAllPlayers(): Promise<PlayersResponse> {
    return this.request('/players/nfl');
  }

  async getTrendingPlayers(type: 'add' | 'drop', hours = 24, limit = 25) {
    return this.request(`/players/nfl/trending/${type}?lookback_hours=${hours}&limit=${limit}`);
  }

  async getNFLState() {
    return this.request('/state/nfl');
  }

  // Undocumented endpoints
  async getWeeklyStats(seasonType: 'regular' | 'pre' | 'post', season: number, week: number): Promise<StatsResponse> {
    return this.request(`/stats/nfl/${seasonType}/${season}/${week}`);
  }

  async getSeasonStats(seasonType: 'regular' | 'pre' | 'post', season: number): Promise<StatsResponse> {
    return this.request(`/stats/nfl/${seasonType}/${season}`);
  }

  async getWeeklyProjections(seasonType: 'regular' | 'pre' | 'post', season: number, week: number): Promise<ProjectionsResponse> {
    return this.request(`/projections/nfl/${seasonType}/${season}/${week}`);
  }

  async getSeasonProjections(seasonType: 'regular' | 'pre' | 'post', season: number): Promise<ProjectionsResponse> {
    return this.request(`/projections/nfl/${seasonType}/${season}`);
  }
}
```

### 3. Enhanced Stats Scraper

Update `src/scrapers/stats-scraper.ts`:

```typescript
import { SleeperClient } from '../clients/sleeper-client';
import { StatsResponse, PlayerStats } from '../../../docs/sleeper-api/schemas/sleeper-api-types';

export class StatsScraperService {
  private sleeper: SleeperClient;

  constructor() {
    this.sleeper = new SleeperClient();
  }

  async scrapeWeeklyStats(season: number, week: number): Promise<void> {
    try {
      console.log(`Scraping stats for ${season} week ${week}...`);
      
      // Get stats from Sleeper API
      const stats = await this.sleeper.getWeeklyStats('regular', season, week);
      
      // Process and save to database
      await this.processStatsData(stats, season, week);
      
      console.log(`Successfully scraped ${Object.keys(stats).length} player records`);
    } catch (error) {
      console.error('Error scraping weekly stats:', error);
      throw error;
    }
  }

  async scrapeProjections(season: number, week: number): Promise<void> {
    try {
      console.log(`Scraping projections for ${season} week ${week}...`);
      
      const projections = await this.sleeper.getWeeklyProjections('regular', season, week);
      
      await this.processProjectionsData(projections, season, week);
      
      console.log(`Successfully scraped ${Object.keys(projections).length} player projections`);
    } catch (error) {
      console.error('Error scraping projections:', error);
      throw error;
    }
  }

  private async processStatsData(stats: StatsResponse, season: number, week: number): Promise<void> {
    const processedStats = [];

    for (const [playerId, playerStats] of Object.entries(stats)) {
      // Skip team-level aggregates if desired
      if (playerId.startsWith('TEAM_')) {
        continue;
      }

      // Only process players with actual fantasy stats
      if (!playerStats.pts_ppr && !playerStats.pts_half_ppr && !playerStats.pts_std) {
        continue;
      }

      const processed = {
        player_id: playerId,
        season,
        week,
        fantasy_points: {
          ppr: playerStats.pts_ppr || 0,
          half_ppr: playerStats.pts_half_ppr || 0,
          standard: playerStats.pts_std || 0
        },
        receiving: {
          receptions: playerStats.rec || 0,
          yards: playerStats.rec_yd || 0,
          touchdowns: playerStats.rec_td || 0,
          targets: playerStats.rec_tgt || 0
        },
        rushing: {
          attempts: playerStats.rush_att || 0,
          yards: playerStats.rush_yd || 0,
          touchdowns: playerStats.rush_td || 0
        },
        passing: {
          attempts: playerStats.pass_att || 0,
          completions: playerStats.pass_cmp || 0,
          yards: playerStats.pass_yd || 0,
          touchdowns: playerStats.pass_td || 0,
          interceptions: playerStats.pass_int || 0
        },
        misc: {
          fumbles_lost: playerStats.fum_lost || 0
        },
        updated_at: new Date()
      };

      processedStats.push(processed);
    }

    // Save to your database (implement based on your schema)
    await this.saveStatsToDatabase(processedStats);
  }

  private async processProjectionsData(projections: any, season: number, week: number): Promise<void> {
    // Similar processing for projections
    // Implementation depends on your database schema
  }

  private async saveStatsToDatabase(stats: any[]): Promise<void> {
    // Implement database save logic here
    // This depends on your chosen database and ORM
    console.log(`Would save ${stats.length} stat records to database`);
  }
}
```

### 4. Scheduled Scraping

Create `src/schedulers/stats-scheduler.ts`:

```typescript
import cron from 'node-cron';
import { StatsScraperService } from '../scrapers/stats-scraper';

export class StatsScheduler {
  private statsScraper: StatsScraperService;

  constructor() {
    this.statsScraper = new StatsScraperService();
  }

  start(): void {
    // Run every Tuesday at 3 AM (after games are final)
    cron.schedule('0 3 * * 2', async () => {
      await this.scrapeCurrentWeek();
    });

    // Run projections twice per week
    cron.schedule('0 2 * * 3,6', async () => {
      await this.scrapeProjections();
    });

    console.log('Stats scheduler started');
  }

  private async scrapeCurrentWeek(): Promise<void> {
    try {
      const currentSeason = new Date().getFullYear();
      const currentWeek = this.getCurrentNFLWeek();
      
      await this.statsScraper.scrapeWeeklyStats(currentSeason, currentWeek);
    } catch (error) {
      console.error('Scheduled stats scraping failed:', error);
    }
  }

  private async scrapeProjections(): Promise<void> {
    try {
      const currentSeason = new Date().getFullYear();
      const currentWeek = this.getCurrentNFLWeek();
      
      await this.statsScraper.scrapeProjections(currentSeason, currentWeek);
    } catch (error) {
      console.error('Scheduled projections scraping failed:', error);
    }
  }

  private getCurrentNFLWeek(): number {
    // Implement logic to determine current NFL week
    // This could call the NFL state endpoint
    return 1; // Placeholder
  }
}
```

## Advanced Integration

### 1. Data Validation

```typescript
import { PlayerStats, PlayerProjections } from '../../../docs/sleeper-api/schemas/sleeper-api-types';

export class DataValidator {
  static validateStats(stats: PlayerStats): boolean {
    // Validate that fantasy points make sense
    if (stats.pts_ppr && stats.pts_ppr < 0) return false;
    if (stats.pts_ppr && stats.pts_ppr > 100) return false; // Sanity check
    
    // Validate receiving stats consistency
    if (stats.rec && stats.rec_yd && stats.rec_yd / stats.rec > 50) {
      console.warn('Unusual yards per reception detected');
    }
    
    return true;
  }

  static validateProjections(projections: PlayerProjections): boolean {
    // Similar validation for projections
    return true;
  }
}
```

### 2. Caching Strategy

```typescript
import { RedisClient } from 'redis';

export class SleeperCache {
  private redis: RedisClient;

  constructor() {
    // Initialize Redis client
  }

  async cacheStats(key: string, data: any, ttl = 3600): Promise<void> {
    await this.redis.setex(key, ttl, JSON.stringify(data));
  }

  async getCachedStats(key: string): Promise<any | null> {
    const cached = await this.redis.get(key);
    return cached ? JSON.parse(cached) : null;
  }

  generateStatsKey(season: number, week: number): string {
    return `sleeper:stats:${season}:${week}`;
  }

  generateProjectionsKey(season: number, week: number): string {
    return `sleeper:projections:${season}:${week}`;
  }
}
```

### 3. Error Handling & Retry Logic

```typescript
export class SleeperClientWithRetry extends SleeperClient {
  private async requestWithRetry<T>(endpoint: string, maxRetries = 3): Promise<T> {
    let lastError: Error;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await this.request<T>(endpoint);
      } catch (error) {
        lastError = error as Error;
        
        if (attempt === maxRetries) {
          break;
        }

        // Exponential backoff
        const delay = Math.pow(2, attempt) * 1000;
        console.log(`Attempt ${attempt} failed, retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    throw new Error(`Failed after ${maxRetries} attempts: ${lastError.message}`);
  }
}
```

## Integration with Existing Services

### 1. Update Player Scraper

Enhance `src/scrapers/player-scraper.ts` to use Sleeper's comprehensive player data:

```typescript
export class PlayerScraperService {
  private sleeper: SleeperClient;

  async syncPlayersFromSleeper(): Promise<void> {
    const players = await this.sleeper.getAllPlayers();
    
    for (const [playerId, player] of Object.entries(players)) {
      await this.upsertPlayer({
        id: playerId,
        name: `${player.first_name} ${player.last_name}`,
        position: player.position,
        team: player.team,
        status: player.status,
        injury_status: player.injury_status,
        // ... other fields
      });
    }
  }
}
```

### 2. Integration with Simulation Engine

Feed the scraped data into your simulation engine:

```typescript
// In apps/sim-engine/src/data/stats-provider.ts
export class SleeperStatsProvider {
  async getPlayerStats(playerId: string, season: number, weeks: number[]): Promise<PlayerStats[]> {
    // Retrieve processed stats from your database
    // that were scraped from Sleeper API
  }

  async getPlayerProjections(playerId: string, season: number, week: number): Promise<PlayerProjections> {
    // Retrieve projections for simulation input
  }
}
```

## Testing

### 1. Unit Tests

```typescript
// tests/sleeper-client.test.ts
import { SleeperClient } from '../src/clients/sleeper-client';

describe('SleeperClient', () => {
  let client: SleeperClient;

  beforeEach(() => {
    client = new SleeperClient();
  });

  it('should fetch weekly stats', async () => {
    const stats = await client.getWeeklyStats('regular', 2024, 1);
    expect(typeof stats).toBe('object');
    expect(Object.keys(stats).length).toBeGreaterThan(0);
  });

  it('should handle API errors gracefully', async () => {
    await expect(
      client.getWeeklyStats('regular', 1999, 1)
    ).rejects.toThrow();
  });
});
```

### 2. Integration Tests

```typescript
// tests/integration/stats-scraper.test.ts
describe('StatsScraperService Integration', () => {
  it('should scrape and process stats end-to-end', async () => {
    const scraper = new StatsScraperService();
    
    // Mock database calls
    jest.spyOn(scraper as any, 'saveStatsToDatabase').mockResolvedValue(undefined);
    
    await scraper.scrapeWeeklyStats(2024, 1);
    
    expect(scraper['saveStatsToDatabase']).toHaveBeenCalled();
  });
});
```

## Monitoring & Alerting

### 1. Health Checks

```typescript
export class SleeperHealthCheck {
  private sleeper: SleeperClient;

  async checkApiHealth(): Promise<boolean> {
    try {
      await this.sleeper.getNFLState();
      return true;
    } catch (error) {
      console.error('Sleeper API health check failed:', error);
      return false;
    }
  }

  async checkDataFreshness(season: number, week: number): Promise<boolean> {
    try {
      const stats = await this.sleeper.getWeeklyStats('regular', season, week);
      return Object.keys(stats).length > 100; // Sanity check
    } catch (error) {
      return false;
    }
  }
}
```

### 2. Metrics Collection

```typescript
export class SleeperMetrics {
  static recordApiCall(endpoint: string, duration: number, success: boolean): void {
    // Send metrics to your monitoring system (Prometheus, DataDog, etc.)
  }

  static recordDataVolume(dataType: 'stats' | 'projections', count: number): void {
    // Track data volume for monitoring
  }
}
```

## Best Practices

1. **Rate Limiting**: Always respect the 1000 requests/minute limit
2. **Caching**: Cache data appropriately to reduce API calls
3. **Error Handling**: Implement retry logic with exponential backoff
4. **Data Validation**: Validate data before processing
5. **Monitoring**: Track API health and data freshness
6. **Testing**: Maintain good test coverage for reliability

## Next Steps

1. **Implement database schema** to store the scraped data
2. **Set up monitoring** for scraping jobs and API health
3. **Create data pipelines** to feed simulation engine
4. **Add historical data backfill** for past seasons
5. **Optimize for performance** with parallel processing where appropriate

This integration guide provides a solid foundation for incorporating Sleeper API data into The Gauntlet's data infrastructure while maintaining reliability and performance. 