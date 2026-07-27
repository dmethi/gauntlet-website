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
  /** Path under /public to this league's logo, if one exists. */
  logo?: string;
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
  '2026': [
    {
      id: '1387520086092312576',
      name: 'Legion I: The Throne',
      season: 2026,
      conference: 'Legion I',
      previousLeagueId: null,
      logo: '/leagues/legion-i-throne.svg',
    },
    {
      id: '1387520168866885632',
      name: 'Legion II: The Keep',
      season: 2026,
      conference: 'Legion II',
      previousLeagueId: null,
      logo: '/leagues/legion-ii-keep.svg',
    },
    {
      id: '1387520236663615488',
      name: 'Legion III: The Forge',
      season: 2026,
      conference: 'Legion III',
      previousLeagueId: null,
      logo: '/leagues/legion-iii-forge.svg',
    },
  ],
};

/** Leagues registered for a given season, or [] if that season isn't registered yet. */
export const getLeaguesForSeason = (season: SeasonId): League[] => LEAGUE_REGISTRY[season] ?? [];

/** Every league across every registered season. */
export const getAllLeagues = (): League[] => Object.values(LEAGUE_REGISTRY).flat();

/** Every season with at least one registered league. */
export const getAllSeasons = (): SeasonId[] => Object.keys(LEAGUE_REGISTRY);

export const CURRENT_LEAGUES: League[] = getLeaguesForSeason('2026');

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
