/**
 * Game Schedule Integration
 * Uses ESPN API to determine when each NFL team played
 */

interface GameWindow {
  day: 'Thursday' | 'Sunday' | 'Monday';
  time: 'early' | 'afternoon' | 'night';
  label: string;
}

interface EspnEvent {
  id: string;
  date: string;
  competitions: Array<{
    competitors: Array<{
      team: {
        abbreviation: string;
        displayName: string;
      };
      homeAway: 'home' | 'away';
    }>;
  }>;
}

interface EspnScoreboard {
  events: EspnEvent[];
}

/**
 * Fetch ESPN scoreboard for current week
 */
export const fetchEspnScoreboard = async (): Promise<EspnScoreboard> => {
  const url = 'https://site.api.espn.com/apis/site/v2/sports/football/nfl/scoreboard';
  const response = await fetch(url, {
    signal: AbortSignal.timeout(10000),
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error(`ESPN API returned ${response.status}`);
  }

  return response.json();
};

/**
 * Determine game window based on game time
 * Parses the ISO date string and maps to NFL time windows
 */
const determineGameWindow = (gameDate: Date): GameWindow => {
  const dayOfWeek = gameDate.getUTCDay(); // 0 = Sunday, 4 = Thursday, 1 = Monday
  const hourUTC = gameDate.getUTCHours();

  // Thursday Night Football (typically 8:15 PM ET = 00:15 UTC Friday)
  if (dayOfWeek === 4 || (dayOfWeek === 5 && hourUTC === 0)) {
    return { day: 'Thursday', time: 'night', label: 'Thursday Night' };
  }
  // Sunday games
  else if (dayOfWeek === 0) {
    // Sunday Night Football (8:20 PM ET = 00:20 UTC Monday)
    if (hourUTC === 0 || hourUTC === 1) {
      return { day: 'Sunday', time: 'night', label: 'Sunday Night' };
    }
    // Late afternoon (4:05 or 4:25 PM ET = 20:05 or 20:25 UTC)
    else if (hourUTC >= 20 && hourUTC < 23) {
      return { day: 'Sunday', time: 'afternoon', label: 'Sunday Afternoon' };
    }
    // Early games (1:00 PM ET = 17:00 UTC or 9:30am games = 13:30 UTC)
    else {
      return { day: 'Sunday', time: 'early', label: 'Sunday Early' };
    }
  }
  // Monday Night Football (8:15 PM ET = 00:15 UTC Tuesday)
  else if (dayOfWeek === 1 || (dayOfWeek === 2 && hourUTC === 0)) {
    return { day: 'Monday', time: 'night', label: 'Monday Night' };
  }
  // Saturday games (late season)
  else if (dayOfWeek === 6) {
    // Determine time based on hour
    if (hourUTC >= 20) {
      return { day: 'Sunday', time: 'afternoon', label: 'Saturday' };
    } else {
      return { day: 'Sunday', time: 'early', label: 'Saturday' };
    }
  }
  // Friday games (international/special games)
  else if (dayOfWeek === 5 && hourUTC > 1) {
    return { day: 'Thursday', time: 'night', label: 'Friday Night' };
  }
  // Default fallback
  else {
    return { day: 'Sunday', time: 'early', label: 'Sunday Early' };
  }
};

/**
 * Build a map of NFL team abbreviation to game window
 * Dynamically parses game times from ESPN data
 */
export const buildGameWindowMap = (espnData: EspnScoreboard): Map<string, GameWindow> => {
  const windowMap = new Map<string, GameWindow>();

  for (const event of espnData.events) {
    const competition = event.competitions[0];
    if (!competition?.competitors) continue;

    const gameTime = new Date(event.date);
    const window = determineGameWindow(gameTime);

    // Add both teams to map
    for (const competitor of competition.competitors) {
      const teamAbbrev = competitor.team.abbreviation;
      windowMap.set(teamAbbrev, window);
    }
  }

  return windowMap;
};

/**
 * Normalize NFL team abbreviations to match between Sleeper and ESPN
 */
export const normalizeTeamAbbreviation = (team: string | undefined): string => {
  if (!team) return 'FA';

  const normalized = team.toUpperCase();

  // Handle common mismatches
  const mapping: Record<string, string> = {
    JAC: 'JAX',
    JAX: 'JAX',
    LA: 'LAR',
    LV: 'LV',
  };

  return mapping[normalized] || normalized;
};

/**
 * Get game window label for a player's NFL team
 */
export const getPlayerGameWindow = (
  playerNflTeam: string | undefined,
  windowMap: Map<string, GameWindow>,
): GameWindow | null => {
  if (!playerNflTeam) return null;

  const normalized = normalizeTeamAbbreviation(playerNflTeam);
  return windowMap.get(normalized) || null;
};
