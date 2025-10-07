/**
 * Stats Hub Hooks - League Statistics
 *
 * Hook for fetching league data with computed team statistics
 */

import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import type {
  LeagueData,
  Roster,
  Matchup,
  TeamStats,
  RosterWeekAggregate,
} from '@/shared/types/api';
import { useSeasonAggregates } from './useSeasonAggregates';

/**
 * Fetch league overview data from API
 *
 * @returns Promise resolving to league data
 */
const getLeagueData = async (): Promise<LeagueData> => {
  const res = await fetch('/api/league/overview');
  if (!res.ok) {
    throw new Error('Network response was not ok');
  }
  return res.json();
};

/**
 * Result interface for useLeagueStats hook
 */
export interface LeagueStatsResult {
  league: LeagueData | undefined;
  teamStats: TeamStats[];
  weeklyAverages: Array<{ week: number; averagePoints: number }>;
  seasonal: any;
  loading: boolean;
}

/**
 * Fetch league data with computed team statistics
 *
 * Combines league overview data with seasonal aggregates to compute
 * accurate team statistics, win/loss records, and weekly averages.
 * Uses authoritative RosterWeekAggregate data for record calculation.
 *
 * @returns League data with team stats, weekly averages, loading state
 *
 * @example
 * ```typescript
 * const { league, teamStats, weeklyAverages, loading } = useLeagueStats();
 *
 * if (loading) return <LoadingSkeleton />;
 * if (!league) return <ErrorMessage />;
 *
 * return <StatsTable teams={teamStats} />;
 * ```
 */
export const useLeagueStats = (): LeagueStatsResult => {
  const { data: league, isLoading: loading } = useQuery<LeagueData>({
    queryKey: ['leagueData'],
    queryFn: getLeagueData,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
  });

  // Fetch seasonal aggregates for authoritative record data
  const leagueId = league?.id ? String(league.id) : undefined;
  const season = league?.season ? String(league.season) : undefined;
  const { data: seasonal } = useSeasonAggregates(leagueId, season);

  const teamStats = useMemo((): TeamStats[] => {
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

      // Calculate total points from matchups
      const totalPoints = (roster.matchups || []).reduce(
        (sum: number, matchup: Matchup) => sum + matchup.points,
        0,
      );

      // Use authoritative record data from RosterWeekAggregate
      // Filter to regular season weeks
      const playoffStart = Number(league?.playoff_week_start ?? 15);
      const regularSeasonAggregates = (aggregates || []).filter(
        agg => agg.week >= 1 && agg.week < playoffStart,
      );

      const wins = (regularSeasonAggregates || []).reduce(
        (count: number, agg: RosterWeekAggregate) => count + (agg.won ? 1 : 0),
        0,
      );
      const losses = (regularSeasonAggregates || []).reduce(
        (count: number, agg: RosterWeekAggregate) => count + (agg.won === false ? 1 : 0),
        0,
      );

      // Calculate cumulative expected wins and luck from aggregates
      const totalExpectedWins = (regularSeasonAggregates || []).reduce(
        (sum: number, agg: RosterWeekAggregate) => sum + (agg.expectedWins || 0),
        0,
      );
      const totalLuck = (regularSeasonAggregates || []).reduce(
        (sum: number, agg: RosterWeekAggregate) => sum + (agg.luck || 0),
        0,
      );

      return {
        id: roster.id,
        name:
          roster.owner?.metadata?.team_name ||
          roster.owner?.displayName ||
          roster.owner?.username ||
          `Team ${roster.id}`,
        owner: roster.owner?.displayName || roster.owner?.username || 'Unknown',
        wins,
        losses,
        totalPoints,
        expectedWins: totalExpectedWins,
        luckRating: totalLuck,
        winPercentage: 0, // Set below
        canonicalRank: 0, // Set below
      };
    });

    return teams
      .map(team => {
        // Calculate win percentage for ranking
        const totalGames = team.wins + team.losses;
        const winPercentage = totalGames > 0 ? team.wins / totalGames : 0;
        return {
          ...team,
          winPercentage,
        };
      })
      .sort((a, b) => {
        // Sort by win percentage first (descending), then by total points as tiebreaker
        if (a.winPercentage !== b.winPercentage) {
          return b.winPercentage - a.winPercentage;
        }
        return b.totalPoints - a.totalPoints;
      })
      .map((team, index) => ({
        ...team,
        canonicalRank: index + 1, // Stable rank based on record + points tiebreaker
      }))
      .sort((a, b) => b.totalPoints - a.totalPoints) as TeamStats[]; // Default sort by points for display
  }, [league, seasonal]);

  const weeklyAverages = useMemo(() => {
    if (!league) return [];
    return Array.from({ length: 18 }, (_, week) => {
      const weekNumber = week + 1;
      const weekMatchups = (league.rosters || []).flatMap((r: Roster) =>
        (r.matchups || []).filter((m: Matchup) => m.week === weekNumber),
      );
      const totalPoints = weekMatchups.reduce((sum: number, m: Matchup) => sum + m.points, 0);
      const averagePoints = weekMatchups.length > 0 ? totalPoints / weekMatchups.length : 0;
      return {
        week: weekNumber,
        averagePoints,
      };
    }).filter(w => w.averagePoints > 0);
  }, [league]);

  return {
    league,
    teamStats,
    weeklyAverages,
    seasonal: seasonal?.data,
    loading: loading || !seasonal, // Loading if either query is loading or seasonal data not available
  };
};
