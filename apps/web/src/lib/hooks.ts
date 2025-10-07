/* eslint-disable @typescript-eslint/no-explicit-any */

import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getCurrentWeek } from '@gauntlet/lib';
import { useSeasonAggregates as useSeasonalAggregatesImport } from '@/features/stats/hooks';
import type {
  LeagueData,
  LeagueTransactionsResponse,
  Matchup,
  MatchupData,
  MatchupsResponse,
  MatchupTeam,
  PlayerInfo,
  PlayersResponse,
  PlayerStats,
  PlayerStatsResponse,
  PlayoffBracketResponse,
  PlayoffMatchup,
  Roster,
  RosterDetailsResponse,
  RosterWeekAggregate,
  SeasonalAggregatesResponse,
  SingleMatchupResponse,
  SuperlativesResponse,
  TeamStats,
  WeeklyMetric,
  WeekRollupsResponse,
} from '@/shared/types';

// Re-export types for backwards compatibility
export type { TeamStats, PlayerInfo, PlayerStats, LeagueTransactionsResponse };

const getLeagueData = async (): Promise<LeagueData> => {
  const res = await fetch('/api/league/overview');
  if (!res.ok) {
    throw new Error('Network response was not ok');
  }
  return res.json();
};

// useLeagueData moved to @/features/stats/hooks/useLeagueStats.ts
// Re-exported at bottom of file for backwards compatibility

// Hook for fetching league data by specific league ID
const getLeagueDataById = async (leagueId: string): Promise<LeagueData> => {
  const res = await fetch(`/api/league/overview?leagueId=${leagueId}`);
  if (!res.ok) {
    throw new Error('Network response was not ok');
  }
  return res.json();
};

export function useLeagueDataById(leagueId?: string) {
  const { data: league, isLoading: loading } = useQuery<LeagueData>({
    queryKey: ['leagueData', leagueId],
    queryFn: () => getLeagueDataById(leagueId!),
    enabled: !!leagueId,
  });

  // Fetch seasonal aggregates for authoritative record data
  const season = league?.season ? String(league.season) : undefined;
  const { data: seasonal } = useSeasonalAggregatesImport(leagueId, season);

  const teamStats = useMemo(() => {
    if (!league || !seasonal?.ok) return [];

    // Create a map of roster aggregates for easier lookup
    const rosterAggregates = new Map<number, RosterWeekAggregate[]>();
    seasonal.data.rosterWeekAggregates.forEach(agg => {
      if (!rosterAggregates.has(agg.rosterId)) {
        rosterAggregates.set(agg.rosterId, []);
      }
      rosterAggregates.get(agg.rosterId)!.push(agg);
    });

    const teams = (league.rosters || []).map((roster: Roster) => {
      const aggregates = rosterAggregates.get(Number(roster.id)) || [];

      // Calculate total points from matchups (unchanged)
      const totalPoints = (roster.matchups || []).reduce(
        (sum: number, matchup: Matchup) => sum + matchup.points,
        0,
      );

      // Use authoritative record data from RosterWeekAggregate
      // Filter to regular season weeks (we'll use dynamic playoff start if available)
      const playoffStart = Number(league?.playoff_week_start ?? 15);
      const regularSeasonAggregates = (aggregates || []).filter(
        agg => agg.week >= 1 && agg.week < playoffStart,
      );

      const wins = (regularSeasonAggregates || []).reduce(
        (count: number, agg: RosterWeekAggregate) => count + (agg.won ? 1 : 0),
        0,
      );

      const losses = regularSeasonAggregates.length - wins;

      const expectedWins = (regularSeasonAggregates || []).reduce(
        (sum: number, agg: RosterWeekAggregate) => sum + (agg.expectedWins ?? 0),
        0,
      );

      const luckRating = (regularSeasonAggregates || []).reduce(
        (sum: number, agg: RosterWeekAggregate) => sum + (agg.luck ?? 0),
        0,
      );

      const name =
        roster.owner?.metadata?.team_name ||
        roster.owner?.displayName ||
        roster.owner?.username ||
        `Team ${roster.id}`;

      // Extract division from roster settings
      const division = roster.settings?.division || null;

      return {
        id: roster.id,
        name,
        totalPoints,
        wins,
        losses,
        expectedWins,
        luckRating,
        division,
        canonicalRank: 1, // Will be set below
      };
    });

    // Sort by total points (descending) and assign canonical rank
    const sorted = teams.sort((a, b) => b.totalPoints - a.totalPoints);
    sorted.forEach((team, index) => {
      team.canonicalRank = index + 1;
    });

    return sorted;
  }, [league, seasonal]);

  const weeklyAverages = useMemo(() => {
    if (!seasonal?.ok) return [];

    return seasonal.data.leagueWeekSummaries.map(summary => ({
      week: summary.week,
      averagePoints: summary.averagePoints,
      medianPoints: summary.medianPoints,
    }));
  }, [seasonal]);

  return {
    league,
    loading: loading || !seasonal, // Loading if either query is loading or seasonal data not available
    teamStats,
    weeklyAverages,
    seasonal: seasonal?.data,
  };
}

const getTeamData = async (teamId: string): Promise<Roster> => {
  const res = await fetch(`/api/team/${teamId}`);
  if (!res.ok) {
    throw new Error('Network response was not ok');
  }
  return res.json();
};

export function useTeamData(teamId: string) {
  const {
    data: team,
    isLoading: loading,
    error,
  } = useQuery<Roster>({
    queryKey: ['teamData', teamId],
    queryFn: () => getTeamData(teamId),
    enabled: !!teamId,
    retry: 0,
  });

  return { team, loading, error };
}

// useSeasonalAggregates moved to @/features/stats/hooks/useSeasonAggregates.ts
// Re-exported at bottom of file for backwards compatibility

export function useRosterDetails(leagueId?: string, rosterId?: number) {
  return useQuery<RosterDetailsResponse>({
    queryKey: ['roster', leagueId, rosterId],
    queryFn: async () => {
      const res = await fetch(`/api/league/${leagueId}/rosters/${rosterId}`);
      if (!res.ok) throw new Error('Failed to fetch roster details');
      return res.json();
    },
    enabled: Boolean(leagueId && rosterId),
  });
}

export function useLeagueTransactions(leagueId?: string) {
  return useQuery<LeagueTransactionsResponse>({
    queryKey: ['transactions', leagueId],
    queryFn: async () => {
      const res = await fetch(`/api/league/${leagueId}/transactions`);
      if (!res.ok) throw new Error('Failed to fetch transactions');
      return res.json();
    },
    enabled: Boolean(leagueId),
  });
}

export function usePlayoffBracket(leagueId?: string) {
  return useQuery<PlayoffBracketResponse>({
    queryKey: ['playoffBracket', leagueId],
    queryFn: async () => {
      // Fetch both winners and losers brackets from Sleeper API
      const [winnersRes, losersRes] = await Promise.allSettled([
        fetch(`https://api.sleeper.app/v1/league/${leagueId}/winners_bracket`),
        fetch(`https://api.sleeper.app/v1/league/${leagueId}/losers_bracket`),
      ]);

      const result: PlayoffBracketResponse = {};

      // Handle winners bracket
      if (winnersRes.status === 'fulfilled' && winnersRes.value.ok) {
        result.winners_bracket = await winnersRes.value.json();
      }

      // Handle losers bracket
      if (losersRes.status === 'fulfilled' && losersRes.value.ok) {
        result.losers_bracket = await losersRes.value.json();
      }

      return result;
    },
    enabled: Boolean(leagueId),
  });
}

// useWeekRollups moved to @/features/stats/hooks/useWeekStats.ts
// useSeasonSuperlatives moved to @/features/stats/hooks/useSuperlatives.ts
// Re-exported at bottom of file for backwards compatibility

// Matchups hook
export function useMatchups(leagueId: string, week: number) {
  return useQuery<MatchupsResponse>({
    queryKey: ['matchups', leagueId, week],
    queryFn: async () => {
      const url = `/api/matchups/${leagueId}/${week}`;
      const res = await fetch(url);

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Failed to fetch matchups: ${res.status} ${errorText}`);
      }

      const data = await res.json();

      return data;
    },
    enabled: Boolean(leagueId && week),
    select: data => ({
      ...data,
      matchups: data.matchups || [],
    }),
    // Note: onError and onSuccess are deprecated in newer versions of React Query
    // Consider using useEffect or error boundaries for error handling
  });
}

export function useMatchup(leagueId: string, week: number, matchupId: number) {
  return useQuery<SingleMatchupResponse>({
    queryKey: ['matchup', leagueId, week, matchupId],
    queryFn: async () => {
      const res = await fetch(`/api/matchups/${leagueId}/${week}/${matchupId}`);
      if (!res.ok) throw new Error('Failed to fetch matchup');
      return res.json();
    },
    enabled: Boolean(leagueId && week && matchupId),
    select: data => data,
  });
}

// Hook for fetching multiple players by IDs
export function usePlayers(playerIds: string[]) {
  return useQuery<PlayersResponse>({
    queryKey: ['players', 'batch', playerIds.sort()], // Sort for consistent cache key
    queryFn: async () => {
      if (playerIds.length === 0) {
        return { players: {}, found: 0, requested: 0 };
      }

      const res = await fetch('/api/players/batch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ playerIds }),
      });

      if (!res.ok) throw new Error('Failed to fetch players');
      const data = await res.json();

      return data;
    },
    enabled: playerIds.length > 0,
    staleTime: 5 * 60 * 1000, // 5 minutes - player data doesn't change often
  });
}

// Hook for fetching a single player
export function usePlayer(playerId: string) {
  return useQuery<{ player: PlayerInfo }>({
    queryKey: ['player', playerId],
    queryFn: async () => {
      const res = await fetch(`/api/players/${playerId}`);
      if (!res.ok) throw new Error('Failed to fetch player');
      return res.json();
    },
    enabled: Boolean(playerId),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Hook for fetching player stats for multiple players
export function usePlayerStats(playerIds: string[], season: string, week: number) {
  return useQuery<PlayerStatsResponse>({
    queryKey: ['playerStats', 'batch', playerIds.sort(), season, week],
    queryFn: async () => {
      if (playerIds.length === 0) {
        return { playerStats: {}, week, season, requested: 0, foundStats: 0, foundProjections: 0 };
      }

      const res = await fetch('/api/players/stats/batch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ playerIds, season, week }),
      });

      if (!res.ok) throw new Error('Failed to fetch player stats');
      const data = await res.json();
      return data;
    },
    enabled: playerIds.length > 0 && Boolean(season) && Boolean(week),
    staleTime: 2 * 60 * 1000, // 2 minutes - stats are more dynamic than player info
  });
}

// Hook for fetching a single player's stats
export function usePlayerStatsSingle(playerId: string, season: string, week: number) {
  return useQuery<PlayerStats & { playerId: string; week: number; season: string }>({
    queryKey: ['playerStats', playerId, season, week],
    queryFn: async () => {
      const res = await fetch(`/api/players/${playerId}/stats/${season}/${week}`);
      if (!res.ok) throw new Error('Failed to fetch player stats');
      return res.json();
    },
    enabled: Boolean(playerId && season && week),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

// Re-export stats hooks for backwards compatibility
export { useLeagueStats as useLeagueData } from '@/features/stats/hooks';
export {
  useSeasonAggregates,
  useSeasonAggregates as useSeasonalAggregates, // Old name for backwards compatibility
} from '@/features/stats/hooks';
export { useWeekStats as useWeekRollups } from '@/features/stats/hooks';
export { useSuperlatives as useSeasonSuperlatives } from '@/features/stats/hooks';
