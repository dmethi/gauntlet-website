/**
 * Direct Sleeper API client - bypasses database entirely
 * This replaces expensive DB queries with free API calls
 * NO CACHING - Always fetches live data
 */

const DEBUG = process.env.SLEEPER_DEBUG === '1';

/**
 * Fetch directly from Sleeper API (no caching)
 */
async function fetchFromSleeper(url: string): Promise<any> {
  if (DEBUG) console.log(`[SLEEPER API] Fetching ${url} (live data)`);

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Gauntlet-Fantasy/1.0',
      },
      cache: 'no-store', // Ensure no browser/CDN caching
    });

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

    if (DEBUG) {
      console.log(`[FETCH DEBUG] Parsed data:`, {
        type: typeof data,
        isArray: Array.isArray(data),
        length: Array.isArray(data) ? data.length : 'N/A',
        samplePoints: Array.isArray(data) && data.length > 0 ? data[0]?.points : 'N/A',
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
  return fetchFromSleeper(`https://api.sleeper.app/v1/league/${leagueId}`);
}

/**
 * Get rosters directly from Sleeper
 * Replaces: prisma.roster.findMany()
 */
export async function getRosters(leagueId: string) {
  if (DEBUG) console.log(`[DEBUG] getRosters called with leagueId: ${leagueId}`);
  const rosters = await fetchFromSleeper(`https://api.sleeper.app/v1/league/${leagueId}/rosters`);

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
  const users = await fetchFromSleeper(`https://api.sleeper.app/v1/league/${leagueId}/users`);

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
  console.log(`[DEBUG] getMatchups called for league ${leagueId} week ${week}`);
  const matchups = await fetchFromSleeper(
    `https://api.sleeper.app/v1/league/${leagueId}/matchups/${week}`
  );

  console.log(`[DEBUG] getMatchups received:`, {
    type: typeof matchups,
    isArray: Array.isArray(matchups),
    length: Array.isArray(matchups) ? matchups.length : 'N/A',
    samplePoints: Array.isArray(matchups) && matchups.length > 0 ? matchups[0].points : 'N/A',
    sampleRosterId: Array.isArray(matchups) && matchups.length > 0 ? matchups[0].roster_id : 'N/A',
  });

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
  return fetchFromSleeper(`https://api.sleeper.app/v1/projections/nfl/regular/${season}/${week}`);
}

/**
 * Get NFL state (current week, etc)
 */
export async function getNFLState() {
  return fetchFromSleeper(`https://api.sleeper.app/v1/state/nfl`);
}

/**
 * No-op function - cache has been removed for always-live data
 */
export function clearCache() {
  console.log('[SLEEPER] No cache to clear - always fetching live data');
}

/**
 * No cache stats since caching has been removed
 */
export function getCacheStats() {
  return {
    message: 'Caching disabled - all data is fetched live from Sleeper API',
    size: 0,
    entries: [],
  };
}
