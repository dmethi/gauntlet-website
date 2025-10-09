/**
 * League Configuration
 * Hardcoded league IDs to eliminate database dependency
 */

export const CURRENT_LEAGUES = [
  {
    id: '1263744209295245312',
    name: 'Gauntlet AFC',
    season: 2025,
    conference: 'AFC',
  },
  {
    id: '1263740549504962561',
    name: 'Gauntlet NFC',
    season: 2025,
    conference: 'NFC',
  },
];

export const ALL_LEAGUES = [...CURRENT_LEAGUES];

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
  return ALL_LEAGUES.filter(l => l.season === season);
};
