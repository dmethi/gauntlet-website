export const buildGauntletMatchupPath = (
  leagueId: string,
  week: number,
  matchupId: number,
): string => `/matchups/${leagueId}/${week}/${matchupId}`;

export const buildSleeperMatchupUrl = (leagueId: string, matchupId: number): string =>
  `https://sleeper.com/leagues/${leagueId}/matchup?matchupId=${matchupId}`;
