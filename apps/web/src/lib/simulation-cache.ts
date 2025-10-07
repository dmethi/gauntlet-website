/**
 * Simulation Results Cache System
 * Stores Monte Carlo simulation results with TTL for performance and odds calculations
 */

interface CachedSimulation {
  leagueId: string;
  week: number;
  matchupId: number;
  result: any; // Full simulation result from @gauntlet/sim-engine
  timestamp: Date;
  expiresAt: Date;
  hitCount: number;
}

interface CacheStats {
  totalEntries: number;
  hitRate: number;
  averageAge: number;
  memoryUsage: number;
}

class SimulationCache {
  private cache: Map<string, CachedSimulation> = new Map();
  private hitCounts: { hits: number; misses: number } = { hits: 0, misses: 0 };

  // Cache configuration
  private readonly DEFAULT_TTL_MS = 10 * 60 * 1000; // 10 minutes default
  private readonly GAME_DAY_TTL_MS = 5 * 60 * 1000; // 5 minutes on game days
  private readonly OFF_SEASON_TTL_MS = 60 * 60 * 1000; // 1 hour in off-season
  private readonly MAX_ENTRIES = 1000; // Memory limit

  /**
   * Generate cache key for a matchup
   */
  private getCacheKey(leagueId: string, week: number, matchupId: number): string {
    return `${leagueId}-${week}-${matchupId}`;
  }

  /**
   * Determine TTL based on context (game day, off-season, etc.)
   */
  private getTTL(): number {
    const now = new Date();
    const day = now.getDay(); // 0 = Sunday, 1 = Monday, etc.
    const hour = now.getHours();

    // Game day logic (Sunday 1PM-11PM, Monday 8PM-11PM, Thursday 8PM-11PM)
    const isSunday = day === 0 && hour >= 13 && hour <= 23;
    const isMonday = day === 1 && hour >= 20 && hour <= 23;
    const isThursday = day === 4 && hour >= 20 && hour <= 23;

    if (isSunday || isMonday || isThursday) {
      return this.GAME_DAY_TTL_MS; // Shorter cache during games
    }

    // Off-season logic (February-August)
    const month = now.getMonth(); // 0 = January
    const isOffSeason = month >= 1 && month <= 7;

    if (isOffSeason) {
      return this.OFF_SEASON_TTL_MS; // Longer cache in off-season
    }

    return this.DEFAULT_TTL_MS;
  }

  /**
   * Store simulation result in cache
   */
  set(leagueId: string, week: number, matchupId: number, result: any): void {
    const key = this.getCacheKey(leagueId, week, matchupId);
    const ttl = this.getTTL();
    const now = new Date();

    const cached: CachedSimulation = {
      leagueId,
      week,
      matchupId,
      result,
      timestamp: now,
      expiresAt: new Date(now.getTime() + ttl),
      hitCount: 0,
    };

    this.cache.set(key, cached);

    // Enforce memory limits
    this.evictExpired();
    this.enforceSizeLimit();

    console.log(
      `📦 [CACHE] Stored simulation for ${leagueId}-W${week}-M${matchupId}, TTL: ${ttl / 1000}s`,
    );
  }

  /**
   * Retrieve simulation result from cache
   */
  get(leagueId: string, week: number, matchupId: number): any | null {
    const key = this.getCacheKey(leagueId, week, matchupId);
    const cached = this.cache.get(key);

    if (!cached) {
      this.hitCounts.misses++;
      console.log(`❌ [CACHE] Miss for ${key}`);
      return null;
    }

    // Check expiration
    if (cached.expiresAt < new Date()) {
      this.cache.delete(key);
      this.hitCounts.misses++;
      console.log(`⏰ [CACHE] Expired for ${key}`);
      return null;
    }

    // Update hit count and return
    cached.hitCount++;
    this.hitCounts.hits++;
    console.log(`✅ [CACHE] Hit for ${key} (${cached.hitCount} times)`);

    return cached.result;
  }

  /**
   * Check if a simulation is cached and fresh
   */
  has(leagueId: string, week: number, matchupId: number): boolean {
    return this.get(leagueId, week, matchupId) !== null;
  }

  /**
   * Invalidate cache entries for a specific matchup
   */
  invalidate(leagueId: string, week: number, matchupId: number): boolean {
    const key = this.getCacheKey(leagueId, week, matchupId);
    const deleted = this.cache.delete(key);

    if (deleted) {
      console.log(`🗑️ [CACHE] Invalidated ${key}`);
    }

    return deleted;
  }

  /**
   * Invalidate all cache entries for a league/week
   */
  invalidateWeek(leagueId: string, week: number): number {
    let deleted = 0;

    for (const [key, cached] of this.cache) {
      if (cached.leagueId === leagueId && cached.week === week) {
        this.cache.delete(key);
        deleted++;
      }
    }

    console.log(`🗑️ [CACHE] Invalidated ${deleted} entries for ${leagueId} Week ${week}`);
    return deleted;
  }

  /**
   * Remove expired entries
   */
  private evictExpired(): void {
    const now = new Date();
    let evicted = 0;

    for (const [key, cached] of this.cache) {
      if (cached.expiresAt < now) {
        this.cache.delete(key);
        evicted++;
      }
    }

    if (evicted > 0) {
      console.log(`🧹 [CACHE] Evicted ${evicted} expired entries`);
    }
  }

  /**
   * Enforce cache size limits using LRU eviction
   */
  private enforceSizeLimit(): void {
    if (this.cache.size <= this.MAX_ENTRIES) return;

    // Sort by hit count (ascending) and timestamp (ascending) for LRU
    const entries = Array.from(this.cache.entries()).sort(([, a], [, b]) => {
      // Prioritize by hit count, then by age
      const hitDiff = a.hitCount - b.hitCount;
      if (hitDiff !== 0) return hitDiff;
      return a.timestamp.getTime() - b.timestamp.getTime();
    });

    // Remove oldest/least-used entries
    const toRemove = this.cache.size - this.MAX_ENTRIES;
    for (let i = 0; i < toRemove; i++) {
      const [key] = entries[i];
      this.cache.delete(key);
    }

    console.log(`🗑️ [CACHE] Evicted ${toRemove} entries to enforce size limit`);
  }

  /**
   * Get cache statistics
   */
  getStats(): CacheStats {
    const entries = Array.from(this.cache.values());
    const now = new Date();

    const totalHits = this.hitCounts.hits + this.hitCounts.misses;
    const hitRate = totalHits > 0 ? this.hitCounts.hits / totalHits : 0;

    const totalAge = entries.reduce((sum, entry) => {
      return sum + (now.getTime() - entry.timestamp.getTime());
    }, 0);
    const averageAge = entries.length > 0 ? totalAge / entries.length : 0;

    // Rough memory usage estimate (KB)
    const memoryUsage = entries.reduce((sum, entry) => {
      // Estimate: ~2KB per simulation result
      return sum + JSON.stringify(entry.result).length / 1024;
    }, 0);

    return {
      totalEntries: this.cache.size,
      hitRate: Math.round(hitRate * 100) / 100,
      averageAge: Math.round(averageAge / 1000), // Convert to seconds
      memoryUsage: Math.round(memoryUsage * 100) / 100,
    };
  }

  /**
   * Clear all cache entries
   */
  clear(): void {
    const size = this.cache.size;
    this.cache.clear();
    this.hitCounts = { hits: 0, misses: 0 };
    console.log(`🧹 [CACHE] Cleared ${size} entries`);
  }

  /**
   * Get all cached matchups for debugging
   */
  getAllKeys(): string[] {
    return Array.from(this.cache.keys());
  }

  /**
   * Warm up cache for a specific week across all leagues
   */
  async warmUpWeek(week: number, leagues: string[]): Promise<void> {
    console.log(`🔥 [CACHE] Warming up cache for Week ${week}...`);

    for (const leagueId of leagues) {
      // This would typically trigger simulation API calls
      // Implementation depends on your specific warming strategy
      console.log(`🔥 [CACHE] Warming ${leagueId} Week ${week}...`);
    }
  }
}

// Singleton instance
const simulationCache = new SimulationCache();

export { simulationCache, type CacheStats, type CachedSimulation };
