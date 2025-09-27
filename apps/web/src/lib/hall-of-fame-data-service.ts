/**
 * Service for fetching and aggregating Hall of Fame data
 * Handles multiple leagues, historical data, and win probability
 */

import { CACHE_DURATIONS, LEAGUE_IDS } from './constants';
import { createServiceClient } from './sleeper/unified-client';
import { PlayerStats } from './sleeper/unified-client';
import { ProcessedMatchup } from './hall-of-fame-calculations';

// All Gauntlet league IDs (current and historical)
export const ALL_GAUNTLET_LEAGUES = {
  '2025': {
    AFC: LEAGUE_IDS.AFC,
    NFC: LEAGUE_IDS.NFC,
  },
  '2024': {
    // Add 2024 league IDs when available
    AFC: '',
    NFC: '',
  },
  // Add more seasons as needed
};

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

export interface EnhancedMatchup extends ProcessedMatchup {
  // Player stats
  playerStats?: Map<string, PlayerStats>;
  playerProjections?: Map<string, PlayerStats>;

  // Win probability data
  winProbSamples?: LiveWinProbSample[];
  maxWinProbSwing?: number;
  excitementScore?: number;

  // Detailed player performances
  topPerformer?: { playerId: string; points: number; position: string };
  worstPerformer?: { playerId: string; points: number; position: string };
  boomPlayers?: string[]; // Players who exceeded projections by 50%+
  bustPlayers?: string[]; // Players who fell short by 50%+
}

class HallOfFameDataService {
  private cache: Map<string, { data: any; timestamp: number }> = new Map();
  private sleeperClient = createServiceClient();

  /**
   * Fetch all historical matchups across all leagues
   */
  async getAllHistoricalMatchups(includeCurrent: boolean = true): Promise<EnhancedMatchup[]> {
    const cacheKey = `all-historical-matchups-${includeCurrent}`;
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    const allMatchups: EnhancedMatchup[] = [];

    // Process each season
    for (const [season, leagues] of Object.entries(ALL_GAUNTLET_LEAGUES)) {
      if (!includeCurrent && season === '2025') continue;

      for (const [leagueName, leagueId] of Object.entries(leagues)) {
        if (!leagueId) continue; // Skip if no league ID

        try {
          const matchups = await this.getLeagueSeasonMatchups(leagueId, season);
          allMatchups.push(...matchups);
        } catch (error) {
          console.error(`Error fetching ${season} ${leagueName}:`, error);
        }
      }
    }

    this.setCache(cacheKey, allMatchups, CACHE_DURATIONS.ONE_WEEK);
    return allMatchups;
  }

  /**
   * Get enhanced matchups for a specific league/season
   */
  async getLeagueSeasonMatchups(leagueId: string, season: string): Promise<EnhancedMatchup[]> {
    const cacheKey = `league-matchups-${leagueId}-${season}`;
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    // Fetch basic matchup data from Sleeper
    const [league, rosters, users] = await Promise.all([
      this.sleeperClient.fetchLeague(leagueId),
      this.sleeperClient.fetchRosters(leagueId),
      this.sleeperClient.fetchUsers(leagueId),
    ]);

    // Determine number of weeks
    const currentWeek = await this.getCurrentWeek();
    const weeksToFetch = season === '2025' ? Math.min(currentWeek, 18) : 18;

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
    const matchups = await this.fetchAllWeekMatchups(leagueId, weeksToFetch, rosterToUser, season);

    // Enhance with player stats and projections
    const enhancedMatchups = await this.enhanceMatchupsWithStats(
      matchups,
      season,
      leagueId,
      league.name
    );

    this.setCache(cacheKey, enhancedMatchups, CACHE_DURATIONS.ONE_DAY);
    return enhancedMatchups;
  }

  /**
   * Fetch matchups for all weeks
   */
  private async fetchAllWeekMatchups(
    leagueId: string,
    weeks: number,
    rosterToUser: Map<number, any>,
    season: string
  ): Promise<ProcessedMatchup[]> {
    const allMatchups: ProcessedMatchup[] = [];

    // Fetch all weeks in parallel
    const weekPromises = Array.from({ length: weeks }, (_, i) => i + 1).map(week =>
      this.sleeperClient
        .fetchMatchups(leagueId, week)
        .then(matchups => ({ week, matchups }))
        .catch(() => ({ week, matchups: [] }))
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
  }

  /**
   * Enhance matchups with player stats and projections
   */
  private async enhanceMatchupsWithStats(
    matchups: ProcessedMatchup[],
    season: string,
    leagueId: string,
    leagueName: string
  ): Promise<EnhancedMatchup[]> {
    // Fetch player data for position mapping
    const playersData = await this.sleeperClient.fetchAllPlayers();
    const playerDataMap = new Map(Object.entries(playersData));
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
        this.sleeperClient.fetchWeeklyPlayerStats(week, season),
        this.sleeperClient.fetchWeeklyProjections(week, season),
      ]);

      // Fetch win probability data if available
      const winProbData = await this.getWinProbabilityData(leagueId, week);

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
          enhancedMatchup.maxWinProbSwing = this.calculateMaxWinProbSwing(matchupWinProb);
          enhancedMatchup.excitementScore = this.calculateExcitementScore(
            matchupWinProb,
            matchup.points || 0,
            matchup.opponentPoints || 0
          );
        }

        // Calculate player performances
        if (matchup.starters && matchup.starters_points) {
          const performances = this.analyzePlayerPerformances(
            matchup.starters,
            matchup.starters_points,
            stats,
            projections
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
  }

  /**
   * Get win probability data from database
   */
  private async getWinProbabilityData(
    leagueId: string,
    week: number
  ): Promise<LiveWinProbSample[]> {
    // Skip for now - would need server-side API or different approach
    // Win probability data would need to be fetched server-side
    return [];
  }

  /**
   * Calculate maximum win probability swing
   */
  private calculateMaxWinProbSwing(samples: LiveWinProbSample[]): number {
    if (samples.length < 2) return 0;

    let maxSwing = 0;
    for (let i = 1; i < samples.length; i++) {
      const swingA = Math.abs(samples[i].winProbA - samples[i - 1].winProbA);
      const swingB = Math.abs(samples[i].winProbB - samples[i - 1].winProbB);
      maxSwing = Math.max(maxSwing, swingA, swingB);
    }

    return maxSwing;
  }

  /**
   * Calculate excitement score based on win probability and score
   */
  private calculateExcitementScore(
    samples: LiveWinProbSample[],
    finalScoreA: number,
    finalScoreB: number
  ): number {
    const totalPoints = finalScoreA + finalScoreB;
    const margin = Math.abs(finalScoreA - finalScoreB);
    const maxSwing = this.calculateMaxWinProbSwing(samples);

    // Normalize components
    const pointsScore = Math.min(totalPoints / 300, 1); // Cap at 300 points
    const marginScore = 1 - Math.min(margin / 50, 1); // Closer is better
    const swingScore = Math.min(maxSwing / 0.5, 1); // 50% swing is max

    // Weighted average
    return (pointsScore * 0.3 + marginScore * 0.4 + swingScore * 0.3) * 100;
  }

  /**
   * Analyze player performances vs projections
   */
  private analyzePlayerPerformances(
    starters: string[],
    starterPoints: number[],
    stats: Record<string, PlayerStats>,
    projections: Record<string, PlayerStats>
  ): {
    top?: { playerId: string; points: number; position: string };
    worst?: { playerId: string; points: number; position: string };
    booms: string[];
    busts: string[];
  } {
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
  }

  /**
   * Get current NFL week
   */
  private async getCurrentWeek(): Promise<number> {
    try {
      const state = await this.sleeperClient.fetchNFLState();
      return state.week || 1;
    } catch {
      return 1;
    }
  }

  /**
   * Cache management
   */
  private getFromCache(key: string): any | null {
    const cached = this.cache.get(key);
    if (!cached) return null;

    const age = Date.now() - cached.timestamp;
    if (age > CACHE_DURATIONS.ONE_WEEK) {
      this.cache.delete(key);
      return null;
    }

    return cached.data;
  }

  private setCache(key: string, data: any, maxAge: number = CACHE_DURATIONS.ONE_HOUR): void {
    this.cache.set(key, { data, timestamp: Date.now() });
  }

  clearCache(): void {
    this.cache.clear();
  }
}

// Export singleton instance
export const hallOfFameDataService = new HallOfFameDataService();
