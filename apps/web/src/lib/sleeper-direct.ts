/**
 * Direct Sleeper API client - bypasses database entirely
 * This replaces expensive DB queries with free API calls
 */

// Simple in-memory cache to avoid hitting Sleeper too often
const cache = new Map<string, { data: any; expires: number }>();
const DEBUG = process.env.SLEEPER_DEBUG === '1';
const NO_CACHE = process.env.SLEEPER_NO_CACHE === '1';

/**
 * Fetch with caching
 */
async function fetchWithCache(url: string, cacheMinutes = 5): Promise<any> {
  const now = Date.now();
  const cached = cache.get(url);

  if (!NO_CACHE && cached && cached.expires > now) {
    if (DEBUG) console.log(`[CACHE HIT] ${url}`);
    return cached.data;
  }

  if (DEBUG) console.log(`[SLEEPER API] Fetching ${url}`);

  try {
    const response = await fetch(url);

    if (DEBUG)
      console.log(`[DEBUG] Fetch response:`, {
        url,
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
        headers: Object.fromEntries(response.headers.entries()),
      });

    if (!response.ok) {
      console.error(
        `[ERROR] Sleeper API error: ${response.status} ${response.statusText} for URL: ${url}`
      );
      // Return empty array for list endpoints
      if (url.includes('/rosters') || url.includes('/users') || url.includes('/matchups')) {
        return [];
      }
      return null;
    }

    const text = await response.text();
    if (DEBUG) console.log(`[DEBUG] Response text (first 500 chars):`, text.substring(0, 500));

    let data;
    try {
      data = JSON.parse(text);
    } catch (parseError) {
      if (DEBUG) {
        console.error(`[ERROR] Failed to parse JSON response from ${url}:`, parseError);
        console.error(`[ERROR] Response text was:`, text);
      }
      // Return empty array for list endpoints
      if (url.includes('/rosters') || url.includes('/users') || url.includes('/matchups')) {
        return [];
      }
      return null;
    }

    if (DEBUG)
      console.log(`[DEBUG] Parsed data:`, {
        type: typeof data,
        isArray: Array.isArray(data),
        isNull: data === null,
        keys: data && typeof data === 'object' && !Array.isArray(data) ? Object.keys(data) : 'N/A',
      });

    if (!NO_CACHE) {
      cache.set(url, {
        data,
        expires: now + cacheMinutes * 60 * 1000,
      });
    }

    return data;
  } catch (error) {
    console.error(`[ERROR] Failed to fetch from ${url}:`, error);
    // Return empty array for list endpoints to prevent crashes
    if (url.includes('/rosters') || url.includes('/users') || url.includes('/matchups')) {
      return [];
    }
    return null;
  }
}

/**
 * Get league data directly from Sleeper
 * Replaces: prisma.league.findUnique()
 */
export async function getLeague(leagueId: string) {
  return fetchWithCache(
    `https://api.sleeper.app/v1/league/${leagueId}`,
    10 // Cache for 10 minutes
  );
}

/**
 * Get rosters directly from Sleeper
 * Replaces: prisma.roster.findMany()
 */
export async function getRosters(leagueId: string) {
  if (DEBUG) console.log(`[DEBUG] getRosters called with leagueId: ${leagueId}`);
  const rosters = await fetchWithCache(`https://api.sleeper.app/v1/league/${leagueId}/rosters`, 5);

  if (DEBUG)
    console.log(`[DEBUG] Rosters response:`, {
      type: typeof rosters,
      isArray: Array.isArray(rosters),
      isNull: rosters === null,
      isUndefined: rosters === undefined,
      value: rosters,
    });

  // Handle null response from Sleeper API
  if (!rosters || !Array.isArray(rosters)) {
    console.warn(`[SLEEPER API] No rosters found for league ${leagueId}. Response was:`, rosters);
    return [];
  }

  // Add owner info
  const users = await getUsers(leagueId);
  if (DEBUG) console.log(`[DEBUG] Users fetched: ${users.length} users`);

  const usersMap = new Map((users || []).map((u: any) => [u.user_id, u]));

  return rosters.map((roster: any) => ({
    ...roster,
    owner: usersMap.get(roster.owner_id),
  }));
}

/**
 * Get users directly from Sleeper
 * Replaces: prisma.user.findMany()
 */
export async function getUsers(leagueId: string) {
  if (DEBUG) console.log(`[DEBUG] getUsers called with leagueId: ${leagueId}`);
  const users = await fetchWithCache(`https://api.sleeper.app/v1/league/${leagueId}/users`, 10);

  if (DEBUG)
    console.log(`[DEBUG] Users response:`, {
      type: typeof users,
      isArray: Array.isArray(users),
      isNull: users === null,
      isUndefined: users === undefined,
      length: Array.isArray(users) ? users.length : 'N/A',
      sample: Array.isArray(users) && users.length > 0 ? users[0] : 'N/A',
    });

  // Handle null response from Sleeper API
  if (!users || !Array.isArray(users)) {
    console.warn(`[SLEEPER API] No users found for league ${leagueId}. Response was:`, users);
    return [];
  }

  return users;
}

/**
 * Get matchups directly from Sleeper
 * Replaces: prisma.matchup.findMany()
 */
export async function getMatchups(leagueId: string, week: number) {
  const matchups = await fetchWithCache(
    `https://api.sleeper.app/v1/league/${leagueId}/matchups/${week}`,
    2 // Shorter cache during games
  );

  // Handle null response from Sleeper API
  if (!matchups || !Array.isArray(matchups)) {
    console.warn(`[SLEEPER API] No matchups found for league ${leagueId} week ${week}`);
    return [];
  }

  return matchups;
}

/**
 * Get all NFL players
 * Uses static data instead of API to avoid caching 11,400+ players
 */
export async function getPlayers() {
  const { getAllPlayers } = await import('../data/players-loader');
  return getAllPlayers();
}

/**
 * Get current projections from Sleeper
 */
export async function getProjections(week: number, season = '2025') {
  // Use v1 API style to match server-side service shapes
  return fetchWithCache(
    `https://api.sleeper.app/v1/projections/nfl/regular/${season}/${week}`,
    30 // Cache projections longer
  );
}

/**
 * Get NFL state (current week, etc)
 */
export async function getNFLState() {
  return fetchWithCache(
    `https://api.sleeper.app/v1/state/nfl`,
    60 // Cache for 1 hour
  );
}

/**
 * Clear cache (useful for testing or forcing refresh)
 */
export function clearCache() {
  cache.clear();
  console.log('[CACHE] Cleared all cached data');
}

/**
 * Get cache stats (for debugging)
 */
export function getCacheStats() {
  const now = Date.now();
  const entries = Array.from(cache.entries()).map(([key, value]) => ({
    url: key,
    expiresIn: Math.max(0, Math.round((value.expires - now) / 1000)) + 's',
  }));

  return {
    size: cache.size,
    entries,
  };
}
