/**
 * Hook for league overview using client-side calculations
 * Replaces DB-dependent data with fresh Sleeper API calculations
 */

import { useQuery } from '@tanstack/react-query';
import { CACHE_DURATIONS, LEAGUE_IDS } from '@/lib/constants';
import { useClientTeamStats, useClientWeeklyAverages } from './useClientCalculations';

interface SleeperLeague {
  league_id: string;
  name: string;
  season: string;
  settings: any;
  scoring_settings: any;
  roster_positions: string[];
  playoff_week_start: number;
  status: string;
  sport: string;
  total_rosters: number;
}

interface SleeperRoster {
  roster_id: number;
  owner_id: string;
  players: string[];
  starters: string[];
  settings: {
    wins: number;
    losses: number;
    ties: number;
    total_points?: number;
    fpts?: number;
    fpts_against?: number;
    division?: number;
  };
}

interface SleeperUser {
  user_id: string;
  username: string;
  display_name: string;
  avatar: string;
  metadata: {
    team_name?: string;
  };
}

interface LeagueOverviewData {
  league: {
    id: string;
    name: string;
    season: string;
    playoff_week_start: number;
    settings: any;
    rosters: Array<{
      id: number;
      owner: {
        id: string;
        username: string;
        displayName: string;
        avatar: string;
        metadata?: {
          team_name?: string;
        };
      };
      settings: any;
      matchups: Array<{
        week: number;
        points: number;
        matchupId: number;
      }>;
    }>;
  };
  teamStats: Array<{
    id: number;
    name: string;
    owner: string;
    wins: number;
    losses: number;
    totalPoints: number;
    expectedWins: number;
    luckRating: number;
    division?: number;
    canonicalRank?: number;
  }>;
  weeklyAverages: Array<{
    week: number;
    averagePoints: number;
    highScore: number;
    lowScore: number;
    totalGames: number;
  }>;
  loading: boolean;
  error?: Error;
}

/**
 * Fetch league data directly from Sleeper API
 */
async function fetchSleeperData<T>(endpoint: string): Promise<T> {
  const response = await fetch(`https://api.sleeper.app/v1/${endpoint}`);
  if (!response.ok) {
    throw new Error(`Sleeper API error: ${response.status}`);
  }
  return response.json();
}

/**
 * Get all matchups for specific rosters
 */
async function getRosterMatchups(
  leagueId: string,
  rosterIds: number[],
  weeks: number
): Promise<Map<number, Array<{ week: number; points: number; matchupId: number }>>> {
  const rosterMatchups = new Map<
    number,
    Array<{ week: number; points: number; matchupId: number }>
  >();

  // Initialize map
  rosterIds.forEach(id => rosterMatchups.set(id, []));

  // Fetch all weeks in parallel
  const promises = Array.from({ length: weeks }, (_, i) => i + 1).map(week =>
    fetchSleeperData<Array<{ roster_id: number; points: number; matchup_id: number }>>(
      `league/${leagueId}/matchups/${week}`
    )
      .then(matchups => ({ week, matchups }))
      .catch(() => ({ week, matchups: [] }))
  );

  const results = await Promise.all(promises);

  results.forEach(({ week, matchups }) => {
    matchups.forEach(matchup => {
      const roster = rosterMatchups.get(matchup.roster_id);
      if (roster) {
        roster.push({
          week,
          points: matchup.points || 0,
          matchupId: matchup.matchup_id,
        });
      }
    });
  });

  return rosterMatchups;
}

/**
 * Enhanced hook for league overview with client-side calculations
 */
export function useLeagueOverviewClient(leagueId?: string): LeagueOverviewData {
  const effectiveLeagueId = leagueId || LEAGUE_IDS.AFC;

  // Use our client-side calculation hooks
  const { data: teamStats, isLoading: teamStatsLoading } = useClientTeamStats(effectiveLeagueId);
  const { data: weeklyAverages, isLoading: averagesLoading } =
    useClientWeeklyAverages(effectiveLeagueId);

  // Fetch league structure data
  const {
    data: leagueData,
    isLoading: leagueLoading,
    error,
  } = useQuery({
    queryKey: ['league-overview-client', effectiveLeagueId],
    queryFn: async () => {
      const [league, rosters, users] = await Promise.all([
        fetchSleeperData<SleeperLeague>(`league/${effectiveLeagueId}`),
        fetchSleeperData<SleeperRoster[]>(`league/${effectiveLeagueId}/rosters`),
        fetchSleeperData<SleeperUser[]>(`league/${effectiveLeagueId}/users`),
      ]);

      // Get current week
      const nflState = await fetchSleeperData<{ week: number }>('state/nfl');
      const currentWeek = Math.min(nflState.week, 14);

      // Get matchups for all rosters
      const rosterIds = rosters.map(r => r.roster_id);
      const rosterMatchups = await getRosterMatchups(effectiveLeagueId, rosterIds, currentWeek);

      // Build user map
      const userMap = new Map(users.map(u => [u.user_id, u]));

      // Transform data to match expected format
      const transformedRosters = rosters.map(roster => {
        const user = userMap.get(roster.owner_id);
        const matchups = rosterMatchups.get(roster.roster_id) || [];

        return {
          id: roster.roster_id,
          owner: {
            id: roster.owner_id,
            username: user?.username || 'Unknown',
            displayName: user?.display_name || user?.username || 'Unknown',
            avatar: user?.avatar || '',
            metadata: user?.metadata,
          },
          settings: roster.settings,
          matchups,
        };
      });

      return {
        id: league.league_id,
        name: league.name,
        season: league.season,
        playoff_week_start: league.playoff_week_start,
        settings: league.settings,
        rosters: transformedRosters,
      };
    },
    staleTime: CACHE_DURATIONS.ONE_HOUR,
    gcTime: CACHE_DURATIONS.ONE_WEEK,
  });

  // Transform team stats to match expected format
  const formattedTeamStats =
    teamStats?.map(team => {
      const roster = leagueData?.rosters.find(r => r.id === team.rosterId);
      const division = roster?.settings?.division;

      return {
        id: team.rosterId,
        name: team.teamName,
        owner: roster?.owner.displayName || roster?.owner.username || 'Unknown',
        wins: team.wins,
        losses: team.losses,
        totalPoints: team.totalPoints,
        expectedWins: team.totalExpectedWins,
        luckRating: team.totalLuck,
        division,
        canonicalRank: 0, // Will be set after sorting
      };
    }) || [];

  // Sort by total points and assign canonical rank
  formattedTeamStats.sort((a, b) => b.totalPoints - a.totalPoints);
  formattedTeamStats.forEach((team, index) => {
    team.canonicalRank = index + 1;
  });

  return {
    league: leagueData || {
      id: effectiveLeagueId,
      name: 'Loading...',
      season: '2024',
      playoff_week_start: 15,
      settings: {},
      rosters: [],
    },
    teamStats: formattedTeamStats,
    weeklyAverages: weeklyAverages || [],
    loading: leagueLoading || teamStatsLoading || averagesLoading,
    error: error as Error | undefined,
  };
}
