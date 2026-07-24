/**
 * League Registry
 *
 * The single source of truth for which Sleeper leagues exist, keyed by
 * season. Hardcoded (no database dependency) since league membership only
 * changes once a year when new leagues are created.
 */

export interface League {
  id: string;
  name: string;
  season: number;
  conference?: string;
  /** Sleeper league ID this league continues from, for data lineage — not walked at runtime. */
  previousLeagueId: string | null;
}

export type SeasonId = string;
export type LeagueRegistry = Record<SeasonId, League[]>;

export const LEAGUE_REGISTRY: LeagueRegistry = {
  '2025': [
    {
      id: '1263744209295245312',
      name: 'Gauntlet AFC',
      season: 2025,
      conference: 'AFC',
      previousLeagueId: null,
    },
    {
      id: '1263740549504962561',
      name: 'Gauntlet NFC',
      season: 2025,
      conference: 'NFC',
      previousLeagueId: null,
    },
  ],
  // 2026 season is BLOCKED on 3 new Sleeper league IDs not yet created — see
  // SCRATCHPAD.md's "Blocked" section. Deliberately registered as an empty
  // array (season exists, no leagues yet) rather than left unregistered, so
  // getAllSeasons() and cross-season aggregation (manager-history.ts) know
  // 2026 is a real season. Do not add fake league IDs — every accessor below
  // already handles an empty league list by returning [].
  '2026': [],
};

/** Leagues registered for a given season, or [] if that season isn't registered yet. */
export const getLeaguesForSeason = (season: SeasonId): League[] => LEAGUE_REGISTRY[season] ?? [];

/** Every league across every registered season. */
export const getAllLeagues = (): League[] => Object.values(LEAGUE_REGISTRY).flat();

/** Every season with at least one registered league. */
export const getAllSeasons = (): SeasonId[] => Object.keys(LEAGUE_REGISTRY);

export const CURRENT_LEAGUES: League[] = getLeaguesForSeason('2025');

export const ALL_LEAGUES: League[] = getAllLeagues();

/**
 * Get league by ID without database
 */
export const getLeagueConfig = (leagueId: string) => {
  return ALL_LEAGUES.find(l => l.id === leagueId);
};

/**
 * Get current season leagues
 */
export const getCurrentLeagues = () => {
  return CURRENT_LEAGUES;
};

/**
 * Get leagues by season
 */
export const getLeaguesBySeason = (season: number) => {
  return getLeaguesForSeason(String(season));
};
