/**
 * React hook for Hall of Fame data
 * Fetches and calculates records across all Gauntlet leagues
 */

import { useQuery } from '@tanstack/react-query';
import {
  calculateHallOfFameRecords,
  HALL_OF_FAME_CATEGORIES,
  getCategoriesByGroup,
  type ProcessedMatchup,
  type HallOfFameRecord,
} from '@/features/hall-of-fame/utils';
import { CACHE_DURATIONS, LEAGUE_IDS } from '@/lib/constants';
import { calculationCache } from '@/shared/utils/calculations';
import type { SleeperMatchup, SleeperRoster, SleeperUser, SleeperLeague } from '@gauntlet/types';

/**
 * Fetch data from Sleeper API
 */
async function fetchSleeperData<T>(endpoint: string): Promise<T> {
  const response = await fetch(`https://api.sleeper.app/v1/${endpoint}`);
  if (!response.ok) {
    throw new Error(`Sleeper API error: ${response.status}`);
  }
  return response.json();
}

/**
 * Get all matchups for a league and season
 */
async function getLeagueMatchups(leagueId: string, weeks: number): Promise<ProcessedMatchup[]> {
  // Fetch league, rosters, users, and player data
  const [league, rosters, users, playersData] = await Promise.all([
    fetchSleeperData<SleeperLeague>(`league/${leagueId}`),
    fetchSleeperData<SleeperRoster[]>(`league/${leagueId}/rosters`),
    fetchSleeperData<SleeperUser[]>(`league/${leagueId}/users`),
    fetchSleeperData<Record<string, any>>('players/nfl').catch(() => ({})),
  ]);

  // Convert players object to Map for easier access
  const playerMap = new Map(Object.entries(playersData));

  // Build user map
  const userMap = new Map(users.map(u => [u.user_id, u]));
  const rosterToUser = new Map(rosters.map(r => [r.roster_id, r.owner_id]));

  // Get team names
  const getTeamName = (rosterId: number): string => {
    const userId = rosterToUser.get(rosterId);
    if (!userId) return `Team ${rosterId}`;
    const user = userMap.get(userId);
    return user?.metadata?.team_name || user?.display_name || user?.username || `Team ${rosterId}`;
  };

  // Fetch all weeks in parallel
  const weekPromises = Array.from({ length: weeks }, (_, i) => i + 1).map(week =>
    fetchSleeperData<SleeperMatchup[]>(`league/${leagueId}/matchups/${week}`)
      .then(matchups => ({ week, matchups }))
      .catch(() => ({ week, matchups: [] })),
  );

  const weekResults = await Promise.all(weekPromises);
  const processedMatchups: ProcessedMatchup[] = [];

  // Determine playoff start (usually week 15)
  const playoffStart = 15; // This could be fetched from league settings

  // Process each week's matchups
  weekResults.forEach(({ week, matchups }) => {
    if (matchups.length === 0) return;

    // Group by matchup_id to find opponents
    const matchupGroups = new Map<number, SleeperMatchup[]>();
    matchups.forEach(m => {
      if (!matchupGroups.has(m.matchup_id)) {
        matchupGroups.set(m.matchup_id, []);
      }
      matchupGroups.get(m.matchup_id)!.push(m);
    });

    // Process each matchup
    matchups.forEach(matchup => {
      const matchupGroup = matchupGroups.get(matchup.matchup_id) || [];
      const opponent = matchupGroup.find(m => m.roster_id !== matchup.roster_id);

      const processed: ProcessedMatchup = {
        rosterId: matchup.roster_id,
        teamName: getTeamName(matchup.roster_id),
        leagueId: league.league_id,
        leagueName: league.name,
        week,
        season: league.season,
        points: matchup.points || 0,
        opponentId: opponent?.roster_id,
        opponentName: opponent ? getTeamName(opponent.roster_id) : undefined,
        opponentPoints: opponent?.points,
        won: opponent ? matchup.points > opponent.points : undefined,
        starters: matchup.starters,
        starters_points: matchup.starters_points,
        players: matchup.players,
        players_points: matchup.players_points,
        playerData: playerMap,
        matchupId: matchup.matchup_id,
        isPlayoff: week >= playoffStart,
        custom_points: matchup.custom_points,
      };

      processedMatchups.push(processed);
    });
  });

  return processedMatchups;
}

/**
 * Hook to get Hall of Fame records across all leagues
 */
export function useHallOfFame() {
  return useQuery({
    queryKey: ['hall-of-fame', 'all-leagues'],
    queryFn: async () => {
      // Get all league IDs
      const leagueIds = [LEAGUE_IDS.AFC, LEAGUE_IDS.NFC];

      // Get current week from NFL state
      const nflState = await fetchSleeperData<{ week: number }>('state/nfl');
      const currentWeek = Math.min(nflState.week, 14); // Cap at regular season

      // Fetch matchups from all leagues in parallel
      const allMatchupsPromises = leagueIds.map(leagueId =>
        getLeagueMatchups(leagueId, currentWeek),
      );

      const allMatchupsArrays = await Promise.all(allMatchupsPromises);
      const allMatchups = allMatchupsArrays.flat();

      // Calculate Hall of Fame records
      const recordsByCategory = calculateHallOfFameRecords(allMatchups);

      // Format for display
      const formattedData = {
        recordsByCategory,
        categoriesByGroup: getCategoriesByGroup(),
        totalMatchups: allMatchups.length,
        lastUpdated: new Date().toISOString(),
      };

      return formattedData;
    },
    staleTime: CACHE_DURATIONS.ONE_HOUR,
    gcTime: CACHE_DURATIONS.ONE_WEEK,
  });
}

/**
 * Hook to get Hall of Fame records for a specific league
 */
export function useLeagueHallOfFame(leagueId: string) {
  return useQuery({
    queryKey: ['hall-of-fame', leagueId],
    queryFn: async () => {
      // Check cache
      const cacheKey = `hall-of-fame-${leagueId}`;
      const cached = calculationCache.get(cacheKey);
      if (cached) return cached;

      // Get current week
      const nflState = await fetchSleeperData<{ week: number }>('state/nfl');
      const currentWeek = Math.min(nflState.week, 14);

      // Fetch matchups for this league
      const matchups = await getLeagueMatchups(leagueId, currentWeek);

      // Calculate Hall of Fame records
      const recordsByCategory = calculateHallOfFameRecords(matchups);

      // Format for display
      const formattedData = {
        recordsByCategory,
        categoriesByGroup: getCategoriesByGroup(),
        totalMatchups: matchups.length,
        leagueId,
        lastUpdated: new Date().toISOString(),
      };

      // Cache the results
      calculationCache.set(cacheKey, formattedData);

      return formattedData;
    },
    enabled: !!leagueId,
    staleTime: CACHE_DURATIONS.ONE_HOUR,
    gcTime: CACHE_DURATIONS.ONE_WEEK,
  });
}

/**
 * Hook to get Hall of Fame records for a specific team
 */
export function useTeamHallOfFame(leagueId: string, rosterId: number) {
  return useQuery({
    queryKey: ['hall-of-fame', 'team', leagueId, rosterId],
    queryFn: async () => {
      // Check cache
      const cacheKey = `hall-of-fame-team-${leagueId}-${rosterId}`;
      const cached = calculationCache.get(cacheKey);
      if (cached) return cached;

      // Get current week
      const nflState = await fetchSleeperData<{ week: number }>('state/nfl');
      const currentWeek = Math.min(nflState.week, 14);

      // Fetch matchups for the league
      const allMatchups = await getLeagueMatchups(leagueId, currentWeek);

      // Filter for this team's matchups
      const teamMatchups = allMatchups.filter(m => m.rosterId === rosterId);

      // Calculate Hall of Fame records for all (to see where team ranks)
      const allRecords = calculateHallOfFameRecords(allMatchups);

      // Find team's records in each category
      const teamRecords: Map<string, { record: HallOfFameRecord; rank: number } | null> = new Map();

      allRecords.forEach((records, categoryId) => {
        const teamRecord = records.find(r => r.teamId === rosterId);
        if (teamRecord) {
          const rank = records.indexOf(teamRecord) + 1;
          teamRecords.set(categoryId, { record: teamRecord, rank });
        } else {
          teamRecords.set(categoryId, null);
        }
      });

      // Format for display
      const formattedData = {
        teamRecords,
        allRecords,
        categoriesByGroup: getCategoriesByGroup(),
        totalTeamMatchups: teamMatchups.length,
        lastUpdated: new Date().toISOString(),
      };

      // Cache the results
      calculationCache.set(cacheKey, formattedData);

      return formattedData;
    },
    enabled: !!leagueId && !!rosterId,
    staleTime: CACHE_DURATIONS.ONE_HOUR,
    gcTime: CACHE_DURATIONS.ONE_WEEK,
  });
}
