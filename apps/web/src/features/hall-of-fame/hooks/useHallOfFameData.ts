/**
 * Service for fetching and aggregating Hall of Fame data
 * Handles multiple leagues, historical data, and win probability
 */

import { CACHE_DURATIONS } from '@/lib/constants';
import { getAllSeasons, getLeaguesForSeason } from '@/config/leagues';
import { createBrowserServiceClient as createServiceClient } from '@/lib/sleeper/browser-client';
import { PlayerStats } from '@/lib/sleeper/browser-client';
import { resolveCompletedWeeks } from '@/shared/utils/season-weeks';
import type { ProcessedMatchup } from '@/features/hall-of-fame/types';
import type { EnhancedMatchup } from '../utils/aggregations';

export interface LiveWinProbSample {
  id: string;
  leagueId: string;
  week: number;
  matchupId: number;
  rosterAId: number;
  rosterBId: number;
  timestamp: Date;
  gameProgress: number;
  winProbA: number;
  winProbB: number;
  projectedFinalA: number;
  projectedFinalB: number;
  currentScoreA: number;
  currentScoreB: number;
  spread: number;
  total: number;
}

interface CacheEntry {
  data: any;
  timestamp: number;
}

export interface HallOfFameDataService {
  getAllHistoricalMatchups: (includeCurrent?: boolean) => Promise<EnhancedMatchup[]>;
  getLeagueSeasonMatchups: (leagueId: string, season: string) => Promise<EnhancedMatchup[]>;
  clearCache: () => void;
}

/**
 * Create Hall of Fame data service
 */
export const createHallOfFameDataService = (): HallOfFameDataService => {
  const cache = new Map<string, CacheEntry>();
  const sleeperClient = createServiceClient();

  /**
   * Get from cache
   */
  const getFromCache = (key: string): any | null => {
    const cached = cache.get(key);
    if (!cached) return null;

    const age = Date.now() - cached.timestamp;
    if (age > CACHE_DURATIONS.ONE_WEEK) {
      cache.delete(key);
      return null;
    }

    return cached.data;
  };

  /**
   * Set cache
   */
  const setCache = (key: string, data: any, maxAge: number = CACHE_DURATIONS.ONE_HOUR): void => {
    cache.set(key, { data, timestamp: Date.now() });
  };

  /**
   * Calculate maximum win probability swing
   */
  const calculateMaxWinProbSwing = (samples: LiveWinProbSample[]): number => {
    if (samples.length < 2) return 0;

    let maxSwing = 0;
    for (let i = 1; i < samples.length; i++) {
      const swingA = Math.abs(samples[i].winProbA - samples[i - 1].winProbA);
      const swingB = Math.abs(samples[i].winProbB - samples[i - 1].winProbB);
      maxSwing = Math.max(maxSwing, swingA, swingB);
    }

    return maxSwing;
  };

  /**
   * Calculate excitement score based on win probability and score
   */
  const calculateExcitementScore = (
    samples: LiveWinProbSample[],
    finalScoreA: number,
    finalScoreB: number,
  ): number => {
    const totalPoints = finalScoreA + finalScoreB;
    const margin = Math.abs(finalScoreA - finalScoreB);
    const maxSwing = calculateMaxWinProbSwing(samples);

    // Normalize components
    const pointsScore = Math.min(totalPoints / 300, 1); // Cap at 300 points
    const marginScore = 1 - Math.min(margin / 50, 1); // Closer is better
    const swingScore = Math.min(maxSwing / 0.5, 1); // 50% swing is max

    // Weighted average
    return (pointsScore * 0.3 + marginScore * 0.4 + swingScore * 0.3) * 100;
  };

  /**
   * Analyze player performances vs projections
   */
  const analyzePlayerPerformances = (
    starters: string[],
    starterPoints: number[],
    stats: Record<string, PlayerStats>,
    projections: Record<string, PlayerStats>,
  ): {
    top?: { playerId: string; points: number; position: string };
    worst?: { playerId: string; points: number; position: string };
    booms: string[];
    busts: string[];
  } => {
    const performances: Array<{
      playerId: string;
      points: number;
      projected: number;
      delta: number;
    }> = [];

    const booms: string[] = [];
    const busts: string[] = [];

    starters.forEach((playerId, idx) => {
      const points = starterPoints[idx] || 0;
      const projected = projections[playerId]?.pts_half_ppr || 0;
      const delta = points - projected;

      performances.push({ playerId, points, projected, delta });

      // Boom: exceeded projection by 50% or scored 20+ over projection
      if (delta > projected * 0.5 || delta > 20) {
        booms.push(playerId);
      }

      // Bust: fell short by 50% or scored under 5 points
      if (points < projected * 0.5 || points < 5) {
        busts.push(playerId);
      }
    });

    // Sort by points to find top/worst
    performances.sort((a, b) => b.points - a.points);

    return {
      top: performances[0]
        ? {
            playerId: performances[0].playerId,
            points: performances[0].points,
            position: 'N/A', // Would need player data for position
          }
        : undefined,
      worst: performances[performances.length - 1]
        ? {
            playerId: performances[performances.length - 1].playerId,
            points: performances[performances.length - 1].points,
            position: 'N/A',
          }
        : undefined,
      booms,
      busts,
    };
  };

  /**
   * Get win probability data from database
   */
  const getWinProbabilityData = async (
    leagueId: string,
    week: number,
  ): Promise<LiveWinProbSample[]> => {
    // Skip for now - would need server-side API or different approach
    // Win probability data would need to be fetched server-side
    return [];
  };

  /**
   * Fetch only the players referenced by a set of matchups (starters + full
   * roster), instead of the entire 11,400+ player database. Routes through
   * the static `/api/players/batch` endpoint (backed by the repo's
   * pre-exported player dataset, `@/data/players-loader`) rather than
   * `sleeperClient.fetchAllPlayers()`, which pulls Sleeper's ~2.4 MB
   * `/players/nfl` payload straight into the browser on every cold visit to
   * a manager profile.
   */
  const fetchPlayersForMatchups = async (
    matchups: ProcessedMatchup[],
  ): Promise<Map<string, any>> => {
    const playerIds = new Set<string>();
    matchups.forEach(m => {
      m.starters?.forEach(id => playerIds.add(id));
      m.players?.forEach(id => playerIds.add(id));
    });

    if (playerIds.size === 0) return new Map();

    const response = await fetch('/api/players/batch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ playerIds: Array.from(playerIds) }),
    });
    if (!response.ok) return new Map();

    const { players } = (await response.json()) as { players: Record<string, any> };
    return new Map(Object.entries(players));
  };

  /**
   * Enhance matchups with player stats and projections
   */
  const enhanceMatchupsWithStats = async (
    matchups: ProcessedMatchup[],
    season: string,
    leagueId: string,
    leagueName: string,
  ): Promise<EnhancedMatchup[]> => {
    // Fetch player data for position mapping
    const playerDataMap = await fetchPlayersForMatchups(matchups);
    const enhanced: EnhancedMatchup[] = [];

    // Group matchups by week for efficient stat fetching
    const matchupsByWeek = new Map<number, ProcessedMatchup[]>();
    matchups.forEach(m => {
      if (!matchupsByWeek.has(m.week)) {
        matchupsByWeek.set(m.week, []);
      }
      matchupsByWeek.get(m.week)!.push(m);
    });

    // Process each week
    for (const [week, weekMatchups] of matchupsByWeek.entries()) {
      // Fetch stats and projections for this week
      const [stats, projections] = await Promise.all([
        sleeperClient.fetchWeeklyPlayerStats(week, season),
        sleeperClient.fetchWeeklyProjections(week, season),
      ]);

      // Fetch win probability data if available
      const winProbData = await getWinProbabilityData(leagueId, week);

      // Enhance each matchup
      for (const matchup of weekMatchups) {
        const enhancedMatchup: EnhancedMatchup = {
          ...matchup,
          season,
          leagueName,
          playerData: playerDataMap,
          playerStats: new Map(Object.entries(stats)),
          playerProjections: new Map(Object.entries(projections)),
        };

        // Add win probability data if available
        const matchupWinProb = winProbData.filter(wp => wp.matchupId === matchup.matchupId);
        if (matchupWinProb.length > 0) {
          enhancedMatchup.winProbSamples = matchupWinProb;
          enhancedMatchup.maxWinProbSwing = calculateMaxWinProbSwing(matchupWinProb);
          enhancedMatchup.excitementScore = calculateExcitementScore(
            matchupWinProb,
            matchup.points || 0,
            matchup.opponentPoints || 0,
          );
        }

        // Calculate player performances
        if (matchup.starters && matchup.starters_points) {
          const performances = analyzePlayerPerformances(
            matchup.starters,
            matchup.starters_points,
            stats,
            projections,
          );

          enhancedMatchup.topPerformer = performances.top;
          enhancedMatchup.worstPerformer = performances.worst;
          enhancedMatchup.boomPlayers = performances.booms;
          enhancedMatchup.bustPlayers = performances.busts;
        }

        enhanced.push(enhancedMatchup);
      }
    }

    return enhanced;
  };

  /**
   * Fetch matchups for all weeks
   */
  const fetchAllWeekMatchups = async (
    leagueId: string,
    weeks: number,
    rosterToUser: Map<number, any>,
    season: string,
  ): Promise<ProcessedMatchup[]> => {
    const allMatchups: ProcessedMatchup[] = [];

    // Fetch all weeks in parallel
    const weekPromises = Array.from({ length: weeks }, (_, i) => i + 1).map(week =>
      sleeperClient
        .fetchMatchups(leagueId, week)
        .then(matchups => ({ week, matchups }))
        .catch(() => ({ week, matchups: [] })),
    );

    const weekResults = await Promise.all(weekPromises);

    // Process each week
    for (const { week, matchups } of weekResults) {
      if (!matchups || matchups.length === 0) continue;

      // Group by matchup_id
      const matchupGroups = new Map<number, any[]>();
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

        const teamInfo = rosterToUser.get(matchup.roster_id);
        const opponentInfo = opponent ? rosterToUser.get(opponent.roster_id) : null;

        const processed: ProcessedMatchup = {
          rosterId: matchup.roster_id,
          teamName: teamInfo?.teamName || `Team ${matchup.roster_id}`,
          leagueId,
          leagueName: '',
          week,
          season,
          points: matchup.points || 0,
          opponentId: opponent?.roster_id,
          opponentName:
            opponentInfo?.teamName || (opponent ? `Team ${opponent.roster_id}` : undefined),
          opponentPoints: opponent?.points,
          won: opponent ? matchup.points > opponent.points : undefined,
          starters: matchup.starters,
          starters_points: matchup.starters_points,
          players: matchup.players,
          players_points: matchup.players_points,
          matchupId: matchup.matchup_id,
          isPlayoff: week >= 15,
          custom_points: matchup.custom_points,
        };

        allMatchups.push(processed);
      });
    }

    return allMatchups;
  };

  /**
   * Get enhanced matchups for a specific league/season
   */
  const getLeagueSeasonMatchups = async (
    leagueId: string,
    season: string,
  ): Promise<EnhancedMatchup[]> => {
    const cacheKey = `league-matchups-${leagueId}-${season}`;
    const cached = getFromCache(cacheKey);
    if (cached) return cached;

    // Fetch basic matchup data from Sleeper
    const [league, rosters, users, nflState] = await Promise.all([
      sleeperClient.fetchLeague(leagueId),
      sleeperClient.fetchRosters(leagueId),
      sleeperClient.fetchUsers(leagueId),
      sleeperClient.fetchNFLState(),
    ]);

    // Determine number of weeks. For a finished/past-season league, live NFL
    // state is irrelevant — use the league's own full regular season instead
    // (see season-weeks.ts); it would otherwise collapse to the off-season's
    // reset week.
    const weeksToFetch = resolveCompletedWeeks(league, nflState);

    // Create roster/user mapping for team names
    const rosterToUser = new Map<number, any>();
    rosters.forEach((roster: any) => {
      const user = users.find((u: any) => u.user_id === roster.owner_id);
      rosterToUser.set(roster.roster_id, {
        teamName: user?.metadata?.team_name || user?.display_name || `Team ${roster.roster_id}`,
        userName: user?.display_name || 'Unknown',
        avatar: user?.avatar,
      });
    });

    // Fetch all matchups
    const matchups = await fetchAllWeekMatchups(leagueId, weeksToFetch, rosterToUser, season);

    // Enhance with player stats and projections
    const enhancedMatchups = await enhanceMatchupsWithStats(
      matchups,
      season,
      leagueId,
      league.name,
    );

    setCache(cacheKey, enhancedMatchups, CACHE_DURATIONS.ONE_DAY);
    return enhancedMatchups;
  };

  /**
   * Fetch all historical matchups across all leagues
   */
  const getAllHistoricalMatchups = async (
    includeCurrent: boolean = true,
  ): Promise<EnhancedMatchup[]> => {
    const cacheKey = `all-historical-matchups-${includeCurrent}`;
    const cached = getFromCache(cacheKey);
    if (cached) return cached;

    const allMatchups: EnhancedMatchup[] = [];

    // Process each registered season, one league at a time (never merge raw
    // matchups across leagues before this point — see docs/ETHOS.md).
    const allSeasons = getAllSeasons();
    // "Current" means the most recent season that actually has leagues
    // registered — a season can exist in the registry (e.g. 2026, pending
    // real league IDs) with no leagues yet, which isn't "current" for the
    // purposes of excluding it from historical stats.
    const mostRecentPlayedSeason = [...allSeasons]
      .filter(season => getLeaguesForSeason(season).length > 0)
      .sort()
      .at(-1);
    for (const season of allSeasons) {
      if (!includeCurrent && season === mostRecentPlayedSeason) continue;

      for (const league of getLeaguesForSeason(season)) {
        try {
          const matchups = await getLeagueSeasonMatchups(league.id, season);
          allMatchups.push(...matchups);
        } catch (error) {
          console.error(`Error fetching ${season} ${league.name}:`, error);
        }
      }
    }

    setCache(cacheKey, allMatchups, CACHE_DURATIONS.ONE_WEEK);
    return allMatchups;
  };

  /**
   * Clear cache
   */
  const clearCache = (): void => {
    cache.clear();
  };

  return {
    getAllHistoricalMatchups,
    getLeagueSeasonMatchups,
    clearCache,
  };
};

// Export singleton instance
export const hallOfFameDataService = createHallOfFameDataService();
