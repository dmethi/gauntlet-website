/**
 * Browser-safe Sleeper API client.
 *
 * Same fetch/config/error-handling logic as `unified-client.ts`, minus its
 * local-dev fixture-replay feature — that feature statically imports Node's
 * `fs/promises`, which breaks a Next.js client bundle if pulled in there (see
 * SCRATCHPAD.md, 2026-07-23). `unified-client.ts` (server-only) subclasses
 * `BrowserSleeperClient` and overrides `tryFixture` to layer fixture replay
 * back on top; this module never imports `fs` so it's safe for `'use client'`
 * hooks to import directly.
 */

import type {
  NFLState,
  PlayerIndex,
  PlayerStats,
  SleeperLeague,
  SleeperMatchup,
  SleeperPlayoffMatchup,
  SleeperRoster,
  SleeperTransaction,
  SleeperUser,
} from '@gauntlet/types';

// Re-export PlayerStats for backwards compatibility
export type { PlayerStats };

// The documented shape of fetchRostersWithOwners's result, used by callers
// (e.g. manager-history.ts) that want a typed contract. NOTE: the method
// itself still returns `Promise<any[]>` (pre-existing) rather than
// `Promise<RosterWithOwner[]>` — narrowing that return type cascades type
// errors into standings.ts/power-rankings.ts/matchup-data.ts, which read
// `roster.metadata?.team_name` in ways that assume `any`, not `unknown`.
// Fixing those is out of scope here; this type isn't enforced at the source.
export interface RosterWithOwner extends SleeperRoster {
  owner?: SleeperUser;
  coOwners?: SleeperUser[];
}

// Base API configuration
const SLEEPER_API_BASE = 'https://api.sleeper.app/v1';

/** Sleeper IDs (league/draft) are always numeric strings. */
const assertSleeperId = (id: string, kind: string): void => {
  if (!/^\d+$/.test(id)) {
    throw new Error(`Invalid Sleeper ${kind} ID: ${JSON.stringify(id)}`);
  }
};

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
    // 'memory' (not 'none'): endpoints below with no explicit cache duration
    // (league/rosters/users/matchups/NFL state) keep defaultCacheDuration:
    // NONE, so they stay always-live. Only fetchAllPlayers/fetchPlayersIndex,
    // fetchWeeklyPlayerStats/fetchWeeklyProjections, and fetchSeasonStats pass
    // an explicit duration — those were silently never caching under 'none'
    // despite the durations being coded for them, causing e.g. start-sit to
    // refetch identical weekly stats/projections once per league per week.
    cacheStrategy: 'memory' as CacheStrategy,
    rateLimit: 0,
    defaultCacheDuration: CACHE_DURATIONS.NONE,
  },

  // For sleeper/client.ts usage
  stats: {
    userAgent: 'Gauntlet-Stats-Hub/1.0',
    errorStrategy: 'throw' as ErrorStrategy,
    debugStrategy: 'always' as DebugStrategy,
    // See 'direct' above — same reasoning.
    cacheStrategy: 'memory' as CacheStrategy,
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

export class BrowserSleeperClient {
  protected config: SleeperClientConfig;
  private cache = new Map<string, CacheEntry>();
  // In-flight request de-dupe: when callers running concurrently (e.g. a
  // parallelized per-league/per-week loop) ask for the same endpoint before
  // the first call has resolved, they share that one pending request instead
  // of each firing their own — otherwise memory caching only helps *after*
  // the first request lands, and concurrent callers would stampede the API.
  private pending = new Map<string, Promise<any>>();
  private lastRequestTime = 0;

  constructor(config: SleeperClientConfig) {
    this.config = config;
  }

  /**
   * Local-dev fixture-replay hook. Always a no-op here (browser-safe); the
   * server-only subclass in unified-client.ts overrides this to replay
   * `SLEEPER_FIXTURES=1` fixtures from disk.
   */
  protected async tryFixture<T>(_endpoint: string): Promise<T | undefined> {
    return undefined;
  }

  /**
   * Core fetch method that handles all configuration options
   */
  protected async fetchFromSleeper<T = any>(
    endpoint: string,
    cacheDuration?: number,
    next?: { revalidate?: number | false },
  ): Promise<T> {
    const cacheKey = `${this.config.userAgent}-${endpoint}`;
    const effectiveCacheDuration = cacheDuration ?? this.config.defaultCacheDuration;

    // Check cache first
    if (this.config.cacheStrategy === 'memory' && effectiveCacheDuration > 0) {
      const cached = this.getFromCache(cacheKey);
      if (cached) {
        this.log(`Cache hit for ${endpoint}`);
        return cached;
      }

      const inFlight = this.pending.get(cacheKey);
      if (inFlight) {
        this.log(`Joining in-flight request for ${endpoint}`);
        return inFlight;
      }
    }

    const requestPromise = this.performFetch<T>(endpoint, cacheKey, effectiveCacheDuration, next);

    if (this.config.cacheStrategy === 'memory' && effectiveCacheDuration > 0) {
      this.pending.set(cacheKey, requestPromise);
      requestPromise.finally(() => this.pending.delete(cacheKey));
    }

    return requestPromise;
  }

  private async performFetch<T>(
    endpoint: string,
    cacheKey: string,
    effectiveCacheDuration: number,
    next?: { revalidate?: number | false },
  ): Promise<T> {
    const url = endpoint.startsWith('http') ? endpoint : `${SLEEPER_API_BASE}${endpoint}`;

    const fixtureData = await this.tryFixture<T>(endpoint);
    if (fixtureData !== undefined) {
      if (this.config.cacheStrategy === 'memory' && effectiveCacheDuration > 0) {
        this.setCache(cacheKey, fixtureData, effectiveCacheDuration);
      }
      return fixtureData;
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
        // No default cache/next directive — callers govern freshness via
        // their own `export const dynamic`/`revalidate` (Next.js segment
        // config), matching driveff's client convention. `next` lets a
        // specific call opt into ISR-style ({ revalidate: N }) ala
        // year-in-review's Sleeper reads. See SCRATCHPAD.md (2026-07-23).
        ...(next ? { next } : {}),
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
          `Sleeper API error: ${response.status} ${response.statusText} for ${url}`,
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
    // eslint-disable-next-line no-undef
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // ========================
  // STANDARDIZED API METHODS
  // ========================

  /**
   * Core league endpoints
   */
  async fetchLeague(leagueId: string): Promise<SleeperLeague> {
    assertSleeperId(leagueId, 'league');
    return this.fetchFromSleeper(`/league/${leagueId}`);
  }

  async fetchUsers(
    leagueId: string,
    next?: { revalidate?: number | false },
  ): Promise<SleeperUser[]> {
    assertSleeperId(leagueId, 'league');
    return this.fetchFromSleeper(`/league/${leagueId}/users`, undefined, next);
  }

  async fetchRosters(
    leagueId: string,
    next?: { revalidate?: number | false },
  ): Promise<SleeperRoster[]> {
    assertSleeperId(leagueId, 'league');
    return this.fetchFromSleeper(`/league/${leagueId}/rosters`, undefined, next);
  }

  async fetchMatchups(
    leagueId: string,
    week: number,
    next?: { revalidate?: number | false },
  ): Promise<SleeperMatchup[]> {
    assertSleeperId(leagueId, 'league');
    return this.fetchFromSleeper(`/league/${leagueId}/matchups/${week}`, undefined, next);
  }

  async fetchTransactions(leagueId: string, week: number): Promise<SleeperTransaction[]> {
    assertSleeperId(leagueId, 'league');
    return this.fetchFromSleeper(`/league/${leagueId}/transactions/${week}`);
  }

  async fetchWinnersBracket(
    leagueId: string,
    next?: { revalidate?: number | false },
  ): Promise<SleeperPlayoffMatchup[]> {
    assertSleeperId(leagueId, 'league');
    return this.fetchFromSleeper(`/league/${leagueId}/winners_bracket`, undefined, next);
  }

  async fetchLosersBracket(leagueId: string): Promise<SleeperPlayoffMatchup[]> {
    assertSleeperId(leagueId, 'league');
    return this.fetchFromSleeper(`/league/${leagueId}/losers_bracket`);
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
      CACHE_DURATIONS.ONE_WEEK,
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
    seasonType = 'regular',
  ): Promise<Record<string, any>> {
    return this.fetchFromSleeper(
      `/stats/nfl/${seasonType}/${season}/${week}`,
      CACHE_DURATIONS.ONE_HOUR,
    );
  }

  async fetchWeeklyProjections(
    week: number,
    season = '2025',
    seasonType = 'regular',
  ): Promise<Record<string, any>> {
    return this.fetchFromSleeper(
      `/projections/nfl/${seasonType}/${season}/${week}`,
      CACHE_DURATIONS.ONE_HOUR,
    );
  }

  async fetchSeasonStats(season = '2025', seasonType = 'regular'): Promise<Record<string, any>> {
    return this.fetchFromSleeper(`/stats/nfl/${seasonType}/${season}`, CACHE_DURATIONS.ONE_DAY);
  }

  /**
   * Draft endpoints
   */
  async fetchDraft(draftId: string): Promise<any> {
    assertSleeperId(draftId, 'draft');
    return this.fetchFromSleeper(`/draft/${draftId}`);
  }

  async fetchDraftPicks(draftId: string): Promise<any[]> {
    assertSleeperId(draftId, 'draft');
    return this.fetchFromSleeper(`/draft/${draftId}/picks`);
  }

  /**
   * Enhanced methods that combine multiple calls (from sleeper-direct.ts)
   */
  async fetchRostersWithOwners(leagueId: string): Promise<any[]> {
    assertSleeperId(leagueId, 'league');
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
      coOwners: (roster.co_owners ?? []).flatMap((userId: string) => {
        const user = usersMap.get(userId);
        return user ? [user] : [];
      }),
    }));
  }
}

// ========================
// CONVENIENCE FACTORY FUNCTIONS
// ========================

export const createBrowserSleeperClient = () => new BrowserSleeperClient(CLIENT_CONFIGS.direct);
// 'throw' error strategy — matches the raw-fetch-and-throw-on-!ok behavior
// client hooks previously implemented by hand.
export const createBrowserStatsClient = () => new BrowserSleeperClient(CLIENT_CONFIGS.stats);
export const createBrowserDraftClient = () => new BrowserSleeperClient(CLIENT_CONFIGS.draft);
export const createBrowserServiceClient = () => new BrowserSleeperClient(CLIENT_CONFIGS.service);

// Default browser client (uses direct config, matching sleeperClient's default)
export const browserSleeperClient = createBrowserSleeperClient();
