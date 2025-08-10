import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { FantasyTeam, League } from '@gauntlet/types';
import { getCurrentWeek } from '@gauntlet/lib';

interface Matchup {
  week: number;
  points: number;
  projected: number;
  result: 'W' | 'L' | 'T';
}

interface WeeklyMetric {
  week: number;
  totalPoints: number;
  expectedWins: number;
  luckRating: number;
  opponentPoints: number;
}

interface Roster extends FantasyTeam {
  matchups: Matchup[];
  weeklyMetrics: WeeklyMetric[];
  league: League;
  owner: {
    displayName: string;
    username: string;
    metadata: {
      team_name: string;
    };
  };
}

interface LeagueData extends League {
  rosters: Roster[];
}

const getLeagueData = async (): Promise<LeagueData> => {
  const res = await fetch('/api/league/overview');
  if (!res.ok) {
    throw new Error('Network response was not ok');
  }
  return res.json();
};

export function useLeagueData() {
  const { data: league, isLoading: loading } = useQuery<LeagueData>({
    queryKey: ['leagueData'],
    queryFn: getLeagueData,
  });

  const teamStats = useMemo(() => {
    if (!league) return [];
    return league.rosters
      .map((roster: Roster) => {
        const totalPoints = roster.matchups.reduce(
          (sum: number, matchup: Matchup) => sum + matchup.points,
          0
        );
        const wins = roster.matchups.filter((m: Matchup) => m.result === 'W').length;
        const losses = roster.matchups.filter((m: Matchup) => m.result === 'L').length;
        const totalExpectedWins = roster.weeklyMetrics.reduce(
          (sum: number, metric: WeeklyMetric) => sum + metric.expectedWins,
          0
        );
        const totalLuck = roster.weeklyMetrics.reduce(
          (sum: number, metric: WeeklyMetric) => sum + metric.luckRating,
          0
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
        };
      })
      .sort((a, b) => b.totalPoints - a.totalPoints);
  }, [league]);

  const weeklyAverages = useMemo(() => {
    if (!league) return [];
    return Array.from({ length: 18 }, (_, week) => {
      const weekNumber = week + 1;
      const weekMatchups = league.rosters.flatMap((r: Roster) =>
        r.matchups.filter((m: Matchup) => m.week === weekNumber)
      );
      const totalPoints = weekMatchups.reduce((sum: number, m: Matchup) => sum + m.points, 0);
      const averagePoints = weekMatchups.length > 0 ? totalPoints / weekMatchups.length : 0;
      return {
        week: weekNumber,
        averagePoints,
      };
    }).filter(w => w.averagePoints > 0);
  }, [league]);

  return { league, loading, teamStats, weeklyAverages };
}

const getTeamData = async (teamId: string): Promise<Roster> => {
  const res = await fetch(`/api/team/${teamId}`);
  if (!res.ok) {
    throw new Error('Network response was not ok');
  }
  return res.json();
};

export function useTeamData(teamId: string) {
  const { data: team, isLoading: loading } = useQuery<Roster>({
    queryKey: ['teamData', teamId],
    queryFn: () => getTeamData(teamId),
    enabled: !!teamId,
  });

  return { team, loading };
}

// Rollups hooks
export interface WeekRollupsResponse<T = unknown> {
  ok: boolean;
  data: T[];
  meta: unknown;
}

export interface SuperlativesResponse<T = unknown> {
  ok: boolean;
  data: T[];
  meta: unknown;
}

export function useWeekRollups<T = unknown>(leagueId: string, season: string, week?: number) {
  const targetWeek = week ?? getCurrentWeek();
  return useQuery<WeekRollupsResponse<T>>({
    queryKey: ['rollups', leagueId, season, targetWeek],
    queryFn: async () => {
      const res = await fetch(`/api/rollups/${leagueId}/${season}/weeks/${targetWeek}`);
      if (!res.ok) throw new Error('Failed to fetch week rollups');
      return res.json();
    },
    enabled: Boolean(leagueId && season),
  });
}

export function useSeasonSuperlatives<T = unknown>(
  leagueId: string,
  season: string,
  opts?: { category?: string; limit?: number; offset?: number }
) {
  const params = new URLSearchParams();
  if (opts?.category) params.set('category', opts.category);
  if (opts?.limit != null) params.set('limit', String(opts.limit));
  if (opts?.offset != null) params.set('offset', String(opts.offset));
  const qs = params.toString();
  return useQuery<SuperlativesResponse<T>>({
    queryKey: ['superlatives', leagueId, season, qs],
    queryFn: async () => {
      const url = `/api/rollups/${leagueId}/${season}/superlatives${qs ? `?${qs}` : ''}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error('Failed to fetch superlatives');
      return res.json();
    },
    enabled: Boolean(leagueId && season),
  });
}
