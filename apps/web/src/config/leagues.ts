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

export const ARCHIVED_LEAGUES = [
  // 2024 Season
  { id: '997670420490801152', name: 'Gauntlet AFC', season: 2024, conference: 'AFC' },
  { id: '997670420490801153', name: 'Gauntlet NFC', season: 2024, conference: 'NFC' },

  // Add more historical leagues as needed
  // 2023 Season
  // { id: 'xxx', name: 'Gauntlet AFC', season: 2023, conference: 'AFC' },
  // { id: 'xxx', name: 'Gauntlet NFC', season: 2023, conference: 'NFC' },
];

export const ALL_LEAGUES = [...CURRENT_LEAGUES, ...ARCHIVED_LEAGUES];

/**
 * Get league by ID without database
 */
export function getLeagueConfig(leagueId: string) {
  return ALL_LEAGUES.find(l => l.id === leagueId);
}

/**
 * Get current season leagues
 */
export function getCurrentLeagues() {
  return CURRENT_LEAGUES;
}

/**
 * Get leagues by season
 */
export function getLeaguesBySeason(season: number) {
  return ALL_LEAGUES.filter(l => l.season === season);
}
