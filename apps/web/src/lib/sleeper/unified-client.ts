/**
 * Unified Sleeper API Client
 *
 * Consolidates all Sleeper API interactions across the codebase with configurable strategies.
 *
 * 🔧 ASSUMPTIONS MADE:
 * 1. All existing clients use 'no-store' cache policy for fetch() - we preserve this
 * 2. Different User-Agent strings serve different purposes - we make this configurable
 * 3. Error handling varies by use case - some need throws, others need graceful returns
 * 4. Debug logging varies - some always on, some environment-based, some off
 * 5. Rate limiting only needed for draft operations - configurable with default 0ms
 * 6. Caching needed for stats service - configurable with memory-based implementation
 * 7. All clients ultimately use the same Sleeper API endpoints - we standardize these
 * 8. Backwards compatibility critical - existing function signatures preserved
 */

import type {
  NFLState,
  PlayerIndex,
  PlayerStats,
  SleeperLeague,
  SleeperMatchup,
  SleeperRoster,
  SleeperUser,
} from '@gauntlet/types';

// Re-export PlayerStats for backwards compatibility
export type { PlayerStats };

// Note: PlayerStats definition moved to @gauntlet/types/sleeper.ts
// Original interface had 100+ fields covering all NFL stat categories

// Base API configuration
const SLEEPER_API_BASE = 'https://api.sleeper.app/v1';

// Cache duration constants (from sleeper-stats-service.ts)
export const CACHE_DURATIONS = {
  NONE: 0,
  FIVE_MINUTES: 5 * 60 * 1000,
  ONE_HOUR: 60 * 60 * 1000,
  ONE_DAY: 24 * 60 * 60 * 1000,
  ONE_WEEK: 7 * 24 * 60 * 60 * 1000, // 7 days - for large static data (players)
} as const;

// Error handling strategies
export type ErrorStrategy =
  | 'throw' // Throw errors (draft-fetcher, sleeper/client)
  | 'graceful' // Return [] for lists, null for objects (sleeper-direct)
  | 'empty_object' // Return {} on errors (stats-service)
  | 'empty_array'; // Always return [] on errors

// Debug logging strategies
export type DebugStrategy =
  | 'off' // No debug logging
  | 'environment' // Based on SLEEPER_DEBUG env var (sleeper-direct)
  | 'always'; // Always log (sleeper/client)

// Cache strategies
export type CacheStrategy =
  | 'none' // No caching (sleeper-direct, draft-fetcher)
  | 'memory'; // In-memory caching (stats-service)

export interface SleeperClientConfig {
  userAgent: string;
  errorStrategy: ErrorStrategy;
  debugStrategy: DebugStrategy;
  cacheStrategy: CacheStrategy;
  rateLimit: number; // ms delay between requests
  defaultCacheDuration: number; // ms
}

// Predefined configurations for backwards compatibility
export const CLIENT_CONFIGS = {
  // For sleeper-direct.ts usage
  direct: {
    userAgent: 'Gauntlet-Fantasy/1.0',
    errorStrategy: 'graceful' as ErrorStrategy,
    debugStrategy: 'environment' as DebugStrategy,
    cacheStrategy: 'none' as CacheStrategy,
    rateLimit: 0,
    defaultCacheDuration: CACHE_DURATIONS.NONE,
  },

  // For sleeper/client.ts usage
  stats: {
    userAgent: 'Gauntlet-Stats-Hub/1.0',
    errorStrategy: 'throw' as ErrorStrategy,
    debugStrategy: 'always' as DebugStrategy,
    cacheStrategy: 'none' as CacheStrategy,
    rateLimit: 0,
    defaultCacheDuration: CACHE_DURATIONS.NONE,
  },

  // For sleeper-draft-fetcher.ts usage
  draft: {
    userAgent: 'Gauntlet-Fantasy/1.0',
    errorStrategy: 'throw' as ErrorStrategy,
    debugStrategy: 'off' as DebugStrategy,
    cacheStrategy: 'none' as CacheStrategy,
    rateLimit: 100, // 100ms delay as in original
    defaultCacheDuration: CACHE_DURATIONS.NONE,
  },

  // For sleeper-stats-service.ts usage
  service: {
    userAgent: 'Gauntlet-Website/1.0.0',
    errorStrategy: 'empty_object' as ErrorStrategy,
    debugStrategy: 'off' as DebugStrategy,
    cacheStrategy: 'memory' as CacheStrategy,
    rateLimit: 0,
    defaultCacheDuration: CACHE_DURATIONS.ONE_HOUR,
  },
} as const;

interface CacheEntry {
  data: any;
  timestamp: number;
  duration: number;
}

export class UnifiedSleeperClient {
  private config: SleeperClientConfig;
  private cache = new Map<string, CacheEntry>();
  private lastRequestTime = 0;

  constructor(config: SleeperClientConfig) {
    this.config = config;
  }

  /**
   * Core fetch method that handles all configuration options
   */
  private async fetchFromSleeper<T = any>(endpoint: string, cacheDuration?: number): Promise<T> {
    const url = endpoint.startsWith('http') ? endpoint : `${SLEEPER_API_BASE}${endpoint}`;
    const cacheKey = `${this.config.userAgent}-${endpoint}`;
    const effectiveCacheDuration = cacheDuration ?? this.config.defaultCacheDuration;

    // Check cache first
    if (this.config.cacheStrategy === 'memory' && effectiveCacheDuration > 0) {
      const cached = this.getFromCache(cacheKey);
      if (cached) {
        this.log(`Cache hit for ${endpoint}`);
        return cached;
      }
    }

    // Rate limiting
    if (this.config.rateLimit > 0) {
      const timeSinceLastRequest = Date.now() - this.lastRequestTime;
      if (timeSinceLastRequest < this.config.rateLimit) {
        await this.delay(this.config.rateLimit - timeSinceLastRequest);
      }
    }

    this.log(`Fetching ${url}`);

    try {
      const response = await fetch(url, {
        headers: {
          'User-Agent': this.config.userAgent,
        },
        cache: 'no-store', // Always no-store as per all current implementations
      });

      this.lastRequestTime = Date.now();

      this.log(`Response: ${response.status} ${response.statusText}`, {
        url,
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
        headers: Object.fromEntries(response.headers.entries()),
      });

      if (!response.ok) {
        const error = new Error(
          `Sleeper API error: ${response.status} ${response.statusText} for ${url}`
        );
        return this.handleError(error, endpoint);
      }

      const text = await response.text();
      this.log(`Response text (first 500 chars): ${text.substring(0, 500)}`);

      let data: T;
      try {
        data = JSON.parse(text);
      } catch (parseError) {
        const error = new Error(`Failed to parse JSON response from ${url}: ${parseError}`);
        this.log(`Parse error: ${error.message}\nResponse text: ${text}`, null, 'error');
        return this.handleError(error, endpoint);
      }

      this.log('Parsed data:', {
        type: typeof data,
        isArray: Array.isArray(data),
        length: Array.isArray(data) ? data.length : 'N/A',
      });

      // Cache if configured
      if (this.config.cacheStrategy === 'memory' && effectiveCacheDuration > 0) {
        this.setCache(cacheKey, data, effectiveCacheDuration);
      }

      return data;
    } catch (error) {
      this.log(`Fetch error for ${url}: ${error}`, null, 'error');
      return this.handleError(error as Error, endpoint);
    }
  }

  /**
   * Handle errors based on configuration
   */
  private handleError(error: Error, endpoint: string): any {
    const isListEndpoint =
      endpoint.includes('/rosters') ||
      endpoint.includes('/users') ||
      endpoint.includes('/matchups') ||
      endpoint.includes('/picks');

    switch (this.config.errorStrategy) {
      case 'throw':
        throw error;

      case 'graceful':
        // sleeper-direct.ts behavior: [] for lists, null for objects
        return isListEndpoint ? [] : null;

      case 'empty_object':
        // stats-service behavior: always return {}
        return {};

      case 'empty_array':
        // Always return []
        return [];

      default:
        throw error;
    }
  }

  /**
   * Debug logging based on configuration
   */
  private log(message: string, data: any = null, level: 'log' | 'error' = 'log'): void {
    const shouldLog =
      this.config.debugStrategy === 'always' ||
      (this.config.debugStrategy === 'environment' && process.env.SLEEPER_DEBUG === '1');

    if (!shouldLog) return;

    const prefix = `[SLEEPER API ${this.config.userAgent}]`;

    if (data) {
      console[level](`${prefix} ${message}`, data);
    } else {
      console[level](`${prefix} ${message}`);
    }
  }

  /**
   * Cache management
   */
  private getFromCache(key: string): any | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    if (Date.now() - entry.timestamp > entry.duration) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  private setCache(key: string, data: any, duration: number): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      duration,
    });
  }

  /**
   * Rate limiting delay
   */
  private async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // ========================
  // STANDARDIZED API METHODS
  // ========================

  /**
   * Core league endpoints
   */
  async fetchLeague(leagueId: string): Promise<SleeperLeague> {
    return this.fetchFromSleeper(`/league/${leagueId}`);
  }

  async fetchUsers(leagueId: string): Promise<SleeperUser[]> {
    return this.fetchFromSleeper(`/league/${leagueId}/users`);
  }

  async fetchRosters(leagueId: string): Promise<SleeperRoster[]> {
    return this.fetchFromSleeper(`/league/${leagueId}/rosters`);
  }

  async fetchMatchups(leagueId: string, week: number): Promise<SleeperMatchup[]> {
    return this.fetchFromSleeper(`/league/${leagueId}/matchups/${week}`);
  }

  /**
   * NFL state and players
   */
  async fetchNFLState(): Promise<NFLState> {
    return this.fetchFromSleeper('/state/nfl');
  }

  async fetchPlayersIndex(): Promise<PlayerIndex> {
    // Cache players for 1 week since most data is static
    const allPlayers = await this.fetchFromSleeper<Record<string, any>>(
      '/players/nfl',
      CACHE_DURATIONS.ONE_WEEK
    );

    // Transform to simplified index (from sleeper/client.ts)
    const playerIndex: PlayerIndex = {};

    for (const [playerId, player] of Object.entries(allPlayers)) {
      if (player.position && ['QB', 'RB', 'WR', 'TE', 'DEF'].includes(player.position)) {
        playerIndex[playerId] = {
          position: player.position,
          full_name:
            player.full_name || `${player.first_name || ''} ${player.last_name || ''}`.trim(),
          team: player.team,
        };
      }
    }

    return playerIndex;
  }

  async fetchAllPlayers(): Promise<Record<string, any>> {
    // Cache full players data for 1 week - it's a massive endpoint (11K+ players)
    // Most data is static (names, positions), only news/depth_chart changes frequently
    return this.fetchFromSleeper('/players/nfl', CACHE_DURATIONS.ONE_WEEK);
  }

  /**
   * Stats and projections
   */
  async fetchWeeklyPlayerStats(
    week: number,
    season = '2025',
    seasonType = 'regular'
  ): Promise<Record<string, any>> {
    return this.fetchFromSleeper(
      `/stats/nfl/${seasonType}/${season}/${week}`,
      CACHE_DURATIONS.ONE_HOUR
    );
  }

  async fetchWeeklyProjections(
    week: number,
    season = '2025',
    seasonType = 'regular'
  ): Promise<Record<string, any>> {
    return this.fetchFromSleeper(
      `/projections/nfl/${seasonType}/${season}/${week}`,
      CACHE_DURATIONS.ONE_HOUR
    );
  }

  async fetchSeasonStats(season = '2025', seasonType = 'regular'): Promise<Record<string, any>> {
    return this.fetchFromSleeper(`/stats/nfl/${seasonType}/${season}`, CACHE_DURATIONS.ONE_DAY);
  }

  /**
   * Draft endpoints
   */
  async fetchDraft(draftId: string): Promise<any> {
    return this.fetchFromSleeper(`/draft/${draftId}`);
  }

  async fetchDraftPicks(draftId: string): Promise<any[]> {
    return this.fetchFromSleeper(`/draft/${draftId}/picks`);
  }

  /**
   * Enhanced methods that combine multiple calls (from sleeper-direct.ts)
   */
  async fetchRostersWithOwners(leagueId: string): Promise<any[]> {
    const [rosters, users] = await Promise.all([
      this.fetchRosters(leagueId),
      this.fetchUsers(leagueId),
    ]);

    if (!Array.isArray(rosters)) {
      this.log(`No rosters found for league ${leagueId}. Response was:`, rosters, 'error');
      return [];
    }

    const usersMap = new Map((users || []).map((u: any) => [u.user_id, u]));

    return rosters.map((roster: any) => ({
      ...roster,
      owner: usersMap.get(roster.owner_id),
    }));
  }
}

// ========================
// CONVENIENCE FACTORY FUNCTIONS
// ========================

// Pre-configured clients for different use cases
export const createDirectClient = () => new UnifiedSleeperClient(CLIENT_CONFIGS.direct);
export const createStatsClient = () => new UnifiedSleeperClient(CLIENT_CONFIGS.stats);
export const createDraftClient = () => new UnifiedSleeperClient(CLIENT_CONFIGS.draft);
export const createServiceClient = () => new UnifiedSleeperClient(CLIENT_CONFIGS.service);

// Default client (uses direct config for backwards compatibility)
export const sleeperClient = createDirectClient();

// ========================
// BACKWARDS COMPATIBILITY EXPORTS
// ========================

/**
 * Drop-in replacements for existing functions
 * These maintain exact function signatures and behavior
 */

// From sleeper-direct.ts
export const getLeague = (leagueId: string) => sleeperClient.fetchLeague(leagueId);
export const getRosters = (leagueId: string) => sleeperClient.fetchRostersWithOwners(leagueId);
export const getMatchups = (leagueId: string, week: number) =>
  sleeperClient.fetchMatchups(leagueId, week);
export const getUsers = (leagueId: string) => sleeperClient.fetchUsers(leagueId);
export const getNFLState = () => sleeperClient.fetchNFLState();
export const getPlayers = () => sleeperClient.fetchAllPlayers();
export const getProjections = (week: number, season = '2025') =>
  sleeperClient.fetchWeeklyProjections(week, season);

// From sleeper/client.ts
export const fetchNFLState = () => createStatsClient().fetchNFLState();
export const fetchLeague = (leagueId: string) => createStatsClient().fetchLeague(leagueId);
export const fetchUsers = (leagueId: string) => createStatsClient().fetchUsers(leagueId);
export const fetchRosters = (leagueId: string) => createStatsClient().fetchRosters(leagueId);
export const fetchMatchups = (leagueId: string, week: number) =>
  createStatsClient().fetchMatchups(leagueId, week);
export const fetchPlayersIndex = () => createStatsClient().fetchPlayersIndex();
export const fetchWeeklyPlayerStats = (week: number) =>
  createStatsClient().fetchWeeklyPlayerStats(week);
