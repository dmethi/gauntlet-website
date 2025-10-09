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
 * Hardcoded Week 5 game windows for 2025 season
 * ESPN API only returns current week, so we need historical data for past weeks
 */
const WEEK_5_2025_WINDOWS: Record<string, GameWindow> = {
  // Thursday Night: 49ers @ Rams
  SF: { day: 'Thursday', time: 'night', label: 'Thursday Night' },
  LAR: { day: 'Thursday', time: 'night', label: 'Thursday Night' },

  // Sunday Early (1:00 PM ET)
  MIN: { day: 'Sunday', time: 'early', label: 'Sunday Early' },
  CLE: { day: 'Sunday', time: 'early', label: 'Sunday Early' },
  TB: { day: 'Sunday', time: 'early', label: 'Sunday Early' },
  ATL: { day: 'Sunday', time: 'early', label: 'Sunday Early' },
  IND: { day: 'Sunday', time: 'early', label: 'Sunday Early' },
  HOU: { day: 'Sunday', time: 'early', label: 'Sunday Early' },
  BAL: { day: 'Sunday', time: 'early', label: 'Sunday Early' },
  CIN: { day: 'Sunday', time: 'early', label: 'Sunday Early' },
  MIA: { day: 'Sunday', time: 'early', label: 'Sunday Early' },
  CAR: { day: 'Sunday', time: 'early', label: 'Sunday Early' },
  CHI: { day: 'Sunday', time: 'early', label: 'Sunday Early' },

  // Sunday Afternoon (4:05/4:25 PM ET)
  GB: { day: 'Sunday', time: 'afternoon', label: 'Sunday Afternoon' },
  ARI: { day: 'Sunday', time: 'afternoon', label: 'Sunday Afternoon' },
  LV: { day: 'Sunday', time: 'afternoon', label: 'Sunday Afternoon' },
  TEN: { day: 'Sunday', time: 'afternoon', label: 'Sunday Afternoon' },
  DEN: { day: 'Sunday', time: 'afternoon', label: 'Sunday Afternoon' },
  NYJ: { day: 'Sunday', time: 'afternoon', label: 'Sunday Afternoon' },
  SEA: { day: 'Sunday', time: 'afternoon', label: 'Sunday Afternoon' },
  DAL: { day: 'Sunday', time: 'afternoon', label: 'Sunday Afternoon' },
  NYG: { day: 'Sunday', time: 'afternoon', label: 'Sunday Afternoon' },
  WAS: { day: 'Sunday', time: 'afternoon', label: 'Sunday Afternoon' },
  PHI: { day: 'Sunday', time: 'afternoon', label: 'Sunday Afternoon' },
  PIT: { day: 'Sunday', time: 'afternoon', label: 'Sunday Afternoon' },

  // Sunday Night (8:20 PM ET): Bills @ Patriots
  BUF: { day: 'Sunday', time: 'night', label: 'Sunday Night' },
  NE: { day: 'Sunday', time: 'night', label: 'Sunday Night' },

  // Monday Night (8:15 PM ET): Chiefs @ Jags, Saints @ Lions
  KC: { day: 'Monday', time: 'night', label: 'Monday Night' },
  JAX: { day: 'Monday', time: 'night', label: 'Monday Night' },
  NO: { day: 'Monday', time: 'night', label: 'Monday Night' },
  DET: { day: 'Monday', time: 'night', label: 'Monday Night' },
};

/**
 * Build a map of NFL team abbreviation to game window
 */
export const buildGameWindowMap = (
  espnData: EspnScoreboard,
  week?: number,
): Map<string, GameWindow> => {
  const windowMap = new Map<string, GameWindow>();

  // Use hardcoded Week 5 data if requested
  if (week === 5) {
    for (const [team, window] of Object.entries(WEEK_5_2025_WINDOWS)) {
      windowMap.set(team, window);
    }
    return windowMap;
  }

  for (const event of espnData.events) {
    const competition = event.competitions[0];
    if (!competition?.competitors) continue;

    const gameTime = new Date(event.date);

    // Get the local date/time components
    // ESPN returns ISO strings in UTC, so we need to handle the timezone offset
    const dateStr = event.date; // e.g., "2025-10-06T17:00Z" for 1pm ET Sunday

    // Determine game window based on the date string pattern
    let window: GameWindow;

    // Check day of week from the date
    const dayOfWeek = gameTime.getUTCDay(); // 0 = Sunday, 4 = Thursday, 1 = Monday
    const hourUTC = gameTime.getUTCHours();

    // Thursday Night Football (typically 8:15 PM ET = 00:15 UTC Friday)
    if (dayOfWeek === 4 || (dayOfWeek === 5 && hourUTC === 0)) {
      window = { day: 'Thursday', time: 'night', label: 'Thursday Night' };
    }
    // Sunday games
    else if (dayOfWeek === 0) {
      // Sunday Night Football (8:20 PM ET = 00:20 UTC Monday)
      if (hourUTC === 0 || hourUTC === 1) {
        window = { day: 'Sunday', time: 'night', label: 'Sunday Night' };
      }
      // Late afternoon (4:05 or 4:25 PM ET = 20:05 or 20:25 UTC)
      else if (hourUTC >= 20 && hourUTC < 23) {
        window = { day: 'Sunday', time: 'afternoon', label: 'Sunday Afternoon' };
      }
      // Early games (1:00 PM ET = 17:00 UTC or 9:30am games = 13:30 UTC)
      else {
        window = { day: 'Sunday', time: 'early', label: 'Sunday Early' };
      }
    }
    // Monday Night Football (8:15 PM ET = 00:15 UTC Tuesday)
    else if (dayOfWeek === 1 || (dayOfWeek === 2 && hourUTC === 0)) {
      window = { day: 'Monday', time: 'night', label: 'Monday Night' };
    }
    // Saturday games (if any)
    else if (dayOfWeek === 6) {
      window = { day: 'Sunday', time: 'early', label: 'Saturday' };
    }
    // Default fallback
    else {
      window = { day: 'Sunday', time: 'early', label: 'Sunday Early' };
    }

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
