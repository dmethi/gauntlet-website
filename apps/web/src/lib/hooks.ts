import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { League, FantasyTeam } from '@gauntlet/types';

interface Matchup {
  week: number;
  points: number;
  projected: number;
  result: 'W' | 'L' | 'T';
}

interface WeeklyMetric {
  week: number;
  expectedWins: number;
  luck: number;
}

interface Roster extends FantasyTeam {
  matchups: Matchup[];
  weeklyMetrics: WeeklyMetric[];
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
          (sum: number, metric: WeeklyMetric) => sum + metric.luck,
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
