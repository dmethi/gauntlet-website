/**
 * Sleeper API Service
 * Centralized service for all Sleeper API interactions with intelligent caching
 */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

export class SleeperAPIService {
  private static instance: SleeperAPIService;
  private cache = new Map<string, CacheEntry<any>>();
  private readonly baseUrl = 'https://api.sleeper.app/v1';

  // League IDs
  public static readonly LEAGUE_IDS = {
    AFC: '1263744209295245312',
    NFC: '1263740549504962561',
  } as const;

  private constructor() {}

  static getInstance(): SleeperAPIService {
    if (!this.instance) {
      this.instance = new SleeperAPIService();
    }
    return this.instance;
  }

  /**
   * Fetch with caching support
   */
  private async fetchWithCache<T>(endpoint: string, ttlSeconds: number = 60): Promise<T> {
    const cacheKey = endpoint;
    const cached = this.cache.get(cacheKey);

    if (cached && Date.now() - cached.timestamp < cached.ttl * 1000) {
      console.log(`📦 Cache hit: ${endpoint}`);
      return cached.data;
    }

    console.log(`🌐 Fetching: ${endpoint}`);
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      headers: {
        'User-Agent': 'Gauntlet-Website/1.0.0',
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Sleeper API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    this.cache.set(cacheKey, {
      data,
      timestamp: Date.now(),
      ttl: ttlSeconds,
    });

    return data;
  }

  /**
   * Batch fetch multiple endpoints in parallel
   */
  async batchFetch<T extends Record<string, any>>(requests: {
    [K in keyof T]: { endpoint: string; ttl?: number };
  }): Promise<T> {
    const entries = Object.entries(requests) as Array<
      [keyof T, { endpoint: string; ttl?: number }]
    >;

    const results = await Promise.all(
      entries.map(([key, { endpoint, ttl }]) =>
        this.fetchWithCache(endpoint, ttl).then(data => ({ key, data }))
      )
    );

    return results.reduce((acc, { key, data }) => {
      acc[key] = data as T[keyof T];
      return acc;
    }, {} as T);
  }

  // ============================================
  // League Endpoints
  // ============================================

  async getLeague(leagueId: string) {
    return this.fetchWithCache(`/league/${leagueId}`, 300); // 5 min cache
  }

  async getRosters(leagueId: string) {
    return this.fetchWithCache<any[]>(`/league/${leagueId}/rosters`, 60); // 1 min cache
  }

  async getUsers(leagueId: string) {
    return this.fetchWithCache<any[]>(`/league/${leagueId}/users`, 300); // 5 min cache
  }

  async getMatchups(leagueId: string, week: number) {
    const isLive = await this.isGameLive();
    const ttl = isLive ? 30 : 60; // 30s if live, 60s otherwise
    return this.fetchWithCache<any[]>(`/league/${leagueId}/matchups/${week}`, ttl);
  }

  async getTransactions(leagueId: string, week: number) {
    return this.fetchWithCache<any[]>(`/league/${leagueId}/transactions/${week}`, 60);
  }

  async getWinnersBracket(leagueId: string) {
    return this.fetchWithCache(`/league/${leagueId}/winners_bracket`, 300);
  }

  async getLosersBracket(leagueId: string) {
    return this.fetchWithCache(`/league/${leagueId}/losers_bracket`, 300);
  }

  // ============================================
  // Player Endpoints
  // ============================================

  async getPlayers() {
    return this.fetchWithCache<Record<string, any>>('/players/nfl', 3600); // 1 hour cache
  }

  async getProjections(week: number, season: string = '2025', seasonType: string = 'regular') {
    return this.fetchWithCache<Record<string, any>>(
      `/projections/nfl/${seasonType}/${season}/${week}`,
      300 // 5 min cache
    );
  }

  async getStats(week: number, season: string = '2025', seasonType: string = 'regular') {
    return this.fetchWithCache<Record<string, any>>(
      `/stats/nfl/${seasonType}/${season}/${week}`,
      300 // 5 min cache
    );
  }

  // ============================================
  // Draft Endpoints
  // ============================================

  async getDraft(draftId: string) {
    return this.fetchWithCache(`/draft/${draftId}`, 3600); // 1 hour cache
  }

  async getDraftPicks(draftId: string) {
    return this.fetchWithCache<any[]>(`/draft/${draftId}/picks`, 3600); // 1 hour cache
  }

  async getTradedPicks(leagueId: string) {
    return this.fetchWithCache<any[]>(`/league/${leagueId}/traded_picks`, 300); // 5 min cache
  }

  // ============================================
  // NFL State
  // ============================================

  async getNFLState() {
    return this.fetchWithCache<{
      week: number;
      season: string;
      season_type: string;
      season_start_date: string;
      leg: number;
      previous_season: string;
      display_week: number;
      league_create_season: string;
      league_season: string;
    }>('/state/nfl', 60); // 1 min cache
  }

  async getCurrentWeek(): Promise<number> {
    const state = await this.getNFLState();
    return state.week;
  }

  async isGameLive(): Promise<boolean> {
    const now = new Date();
    const day = now.getDay();
    const hour = now.getHours();

    // Games are typically:
    // Thursday: 8PM ET
    // Sunday: 1PM, 4PM, 8PM ET
    // Monday: 8PM ET

    // Convert to ET (rough approximation)
    const etHour = hour + now.getTimezoneOffset() / 60 - 5;

    if (day === 0) {
      // Sunday
      return etHour >= 13 && etHour <= 23;
    } else if (day === 1) {
      // Monday
      return etHour >= 20 && etHour <= 23;
    } else if (day === 4) {
      // Thursday
      return etHour >= 20 && etHour <= 23;
    }

    return false;
  }

  // ============================================
  // Cache Management
  // ============================================

  clearCache(endpoint?: string) {
    if (endpoint) {
      this.cache.delete(endpoint);
    } else {
      this.cache.clear();
    }
    console.log(`🗑️ Cache cleared: ${endpoint || 'all'}`);
  }

  getCacheStats() {
    const now = Date.now();
    const stats = {
      totalEntries: this.cache.size,
      entries: Array.from(this.cache.entries()).map(([key, entry]) => ({
        endpoint: key,
        age: Math.round((now - entry.timestamp) / 1000),
        ttl: entry.ttl,
        expired: now - entry.timestamp > entry.ttl * 1000,
      })),
    };
    return stats;
  }

  // ============================================
  // Helper Methods
  // ============================================

  /**
   * Get all data for a league in parallel
   */
  async getLeagueData(leagueId: string, week?: number) {
    const currentWeek = week || (await this.getCurrentWeek());

    const data = await this.batchFetch({
      league: { endpoint: `/league/${leagueId}`, ttl: 300 },
      rosters: { endpoint: `/league/${leagueId}/rosters`, ttl: 60 },
      users: { endpoint: `/league/${leagueId}/users`, ttl: 300 },
      matchups: { endpoint: `/league/${leagueId}/matchups/${currentWeek}`, ttl: 30 },
    });

    return {
      ...data,
      week: currentWeek,
    };
  }

  /**
   * Get matchup data with all related info
   */
  async getMatchupDetails(leagueId: string, week: number, matchupId: number) {
    const [matchups, rosters, users, projections] = await Promise.all([
      this.getMatchups(leagueId, week),
      this.getRosters(leagueId),
      this.getUsers(leagueId),
      this.getProjections(week),
    ]);

    const matchupPair = matchups.filter(m => m.matchup_id === matchupId);
    if (matchupPair.length !== 2) {
      throw new Error(`Invalid matchup ${matchupId}`);
    }

    return {
      matchups: matchupPair,
      rosters,
      users,
      projections,
    };
  }
}

export default SleeperAPIService;
