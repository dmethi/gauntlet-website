import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { FantasyTeam, League } from '@gauntlet/types';
import { getCurrentWeek } from '@gauntlet/lib';

interface Matchup {
  week: number;
  points: number;
  projected: number;
  result: 'W' | 'L' | 'T';
  matchupId?: number; // Add this for proper linking
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
    avatar?: string;
    metadata: {
      team_name: string;
    };
  };
  coOwnerDetails?: Array<{
    displayName?: string;
    username?: string;
    avatar?: string;
  }>;
}

export interface TeamStats {
  id: string;
  name: string;
  owner: string;
  wins: number;
  losses: number;
  totalPoints: number;
  expectedWins: number;
  luckRating: number;
  winPercentage: number;
  canonicalRank: number;
  division?: number | null;
}

interface LeagueData extends League {
  playoff_week_start?: number;
  rosters: Roster[];
  transactions?: Array<{
    id: string;
    type: string;
    createdAt: string;
    rosterIds?: number[];
    adds?: unknown;
    drops?: unknown;
    settings?: {
      waiver_bid?: number;
    };
  }>;
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

  // Fetch seasonal aggregates for authoritative record data
  const leagueId = league?.id ? String(league.id) : undefined;
  const season = league?.season ? String(league.season) : undefined;
  const { data: seasonal } = useSeasonalAggregates(leagueId, season);

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
        0
      );

      // Use authoritative record data from RosterWeekAggregate
      // Filter to regular season weeks (we'll use dynamic playoff start if available)
      const playoffStart = Number(league?.playoff_week_start ?? 15);
      const regularSeasonAggregates = (aggregates || []).filter(
        agg => agg.week >= 1 && agg.week < playoffStart
      );

      const wins = (regularSeasonAggregates || []).reduce(
        (count: number, agg: RosterWeekAggregate) => count + (agg.won ? 1 : 0),
        0
      );
      const losses = (regularSeasonAggregates || []).reduce(
        (count: number, agg: RosterWeekAggregate) => count + (agg.won === false ? 1 : 0),
        0
      );

      // Calculate cumulative expected wins and luck from aggregates
      const totalExpectedWins = (regularSeasonAggregates || []).reduce(
        (sum: number, agg: RosterWeekAggregate) => sum + (agg.expectedWins || 0),
        0
      );
      const totalLuck = (regularSeasonAggregates || []).reduce(
        (sum: number, agg: RosterWeekAggregate) => sum + (agg.luck || 0),
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
        (r.matchups || []).filter((m: Matchup) => m.week === weekNumber)
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
    loading: loading || !seasonal, // Loading if either query is loading or seasonal data not available
    teamStats,
    weeklyAverages,
    seasonal: seasonal?.data,
  };
}

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
  const { data: seasonal } = useSeasonalAggregates(leagueId, season);

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
        0
      );

      // Use authoritative record data from RosterWeekAggregate
      // Filter to regular season weeks (we'll use dynamic playoff start if available)
      const playoffStart = Number(league?.playoff_week_start ?? 15);
      const regularSeasonAggregates = (aggregates || []).filter(
        agg => agg.week >= 1 && agg.week < playoffStart
      );

      const wins = (regularSeasonAggregates || []).reduce(
        (count: number, agg: RosterWeekAggregate) => count + (agg.won ? 1 : 0),
        0
      );

      const losses = regularSeasonAggregates.length - wins;

      const expectedWins = (regularSeasonAggregates || []).reduce(
        (sum: number, agg: RosterWeekAggregate) => sum + (agg.expectedWins ?? 0),
        0
      );

      const luckRating = (regularSeasonAggregates || []).reduce(
        (sum: number, agg: RosterWeekAggregate) => sum + (agg.luck ?? 0),
        0
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

export interface RosterWeekAggregate {
  leagueId: string;
  rosterId: number;
  week: number;
  points: number;
  projectedPoints?: number | null;
  optimalPoints?: number | null;
  opponentRosterId?: number | null;
  opponentPoints?: number | null;
  won?: boolean | null;
  streak?: number | null;
  expectedWins?: number | null;
  luck?: number | null;
  positionalPoints?: Record<string, number> | null;
  opponentPositionalPoints?: Record<string, number> | null;
  powerRank?: number | null;
}

export interface SeasonalAggregatesResponse {
  ok: boolean;
  data: {
    rosterWeekAggregates: RosterWeekAggregate[];
    leagueWeekSummaries: Array<{
      week: number;
      averagePoints: number;
      medianPoints: number;
    }>;
  };
  meta: unknown;
}

export function useSeasonalAggregates(leagueId?: string, season?: string) {
  return useQuery<SeasonalAggregatesResponse>({
    queryKey: ['seasonal', leagueId, season],
    queryFn: async () => {
      const res = await fetch(`/api/rollups/${leagueId}/${season}`);
      if (!res.ok) throw new Error('Failed to fetch seasonal aggregates');
      return res.json();
    },
    enabled: Boolean(leagueId && season),
  });
}

export interface RosterDetailsResponse {
  rosterId: number;
  starters: string[];
  players: Array<{ id: string; fullName: string; position: string; team?: string | null }>;
}

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

export interface LeagueTransactionsResponse {
  ok: boolean;
  data: Array<{
    id: string;
    type: string;
    createdAt: string;
    rosterIds: number[];
    adds?: Array<{
      rosterId: number;
      players: Array<{ id: string; fullName: string; position: string; team?: string | null }>;
    }>;
    drops?: Array<{
      rosterId: number;
      players: Array<{ id: string; fullName: string; position: string; team?: string | null }>;
    }>;
    waiver?: unknown;
    settings?: {
      waiver_bid?: number;
    };
  }>;
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

export interface PlayoffMatchup {
  r: number; // round
  m: number; // matchup id
  t1: number; // team 1 roster id
  t2: number; // team 2 roster id
  t1_from?: { w: number; m: number } | { l: number; m: number };
  t2_from?: { w: number; m: number } | { l: number; m: number };
}

export interface PlayoffBracketResponse {
  winners_bracket?: PlayoffMatchup[];
  losers_bracket?: PlayoffMatchup[];
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

// Matchups hook
export interface MatchupTeam {
  rosterId: number;
  owner: {
    id: string;
    username: string;
    displayName: string;
    avatar?: string;
  } | null;
  points: number;
  customPoints?: number;
  starters: string[];
  startersPoints: number[] | Record<string, number>;
  players: string[];
  playersPoints: Record<string, number>;
  rosterSettings?: Record<string, unknown>;
  rosterMetadata?: Record<string, unknown>;
}

export interface MatchupData {
  matchupId: number;
  teams: MatchupTeam[];
  summary?: {
    pointsA: number;
    pointsB: number;
    winnerRosterId?: number;
    margin: number;
  } | null;
}

export interface MatchupsResponse {
  matchups: MatchupData[];
  week: number;
  leagueId: string;
  totalMatchups: number;
}

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

export interface SingleMatchupResponse {
  matchup: MatchupData;
  week: number;
  leagueId: string;
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

// Player data types
export interface PlayerInfo {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  team: string | null;
  position: string;
}

export interface PlayersResponse {
  players: Record<string, PlayerInfo>;
  found: number;
  requested: number;
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

// Player stats types
export interface PlayerStats {
  actual: Record<string, number> | null;
  projections: Record<string, number> | null;
  hasActual: boolean;
  hasProjections: boolean;
}

export interface PlayerStatsResponse {
  playerStats: Record<string, PlayerStats>;
  week: number;
  season: string;
  requested: number;
  foundStats: number;
  foundProjections: number;
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
