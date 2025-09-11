/**
 * Service for fetching detailed player statistics from Sleeper's undocumented API
 * Documentation: https://api.sleeper.app/v1/stats/nfl/{season_type}/{season}/{week}
 */

import { CACHE_DURATIONS } from './constants';

export interface PlayerStats {
  // Fantasy points
  pts_ppr?: number;
  pts_half_ppr?: number;
  pts_std?: number;

  // Passing stats
  pass_att?: number;
  pass_cmp?: number;
  pass_yd?: number;
  pass_td?: number;
  pass_int?: number;
  pass_sack?: number;
  pass_2pt?: number;
  pass_fd?: number;
  pass_cmp_40p?: number;
  pass_td_40p?: number;
  pass_td_50p?: number;
  pass_yd_300p?: number;
  pass_yd_400p?: number;
  pass_rtg?: number;

  // Rushing stats
  rush_att?: number;
  rush_yd?: number;
  rush_td?: number;
  rush_2pt?: number;
  rush_fd?: number;
  rush_40p?: number;
  rush_td_40p?: number;
  rush_td_50p?: number;
  rush_yd_100p?: number;
  rush_yd_200p?: number;

  // Receiving stats
  rec?: number;
  rec_tgt?: number;
  rec_yd?: number;
  rec_td?: number;
  rec_2pt?: number;
  rec_fd?: number;
  rec_40p?: number;
  rec_td_40p?: number;
  rec_td_50p?: number;
  rec_yd_100p?: number;
  rec_yd_200p?: number;

  // Defensive stats
  def_st_td?: number;
  def_st_fum_rec?: number;
  def_st_td_ret?: number;
  def_int?: number;
  def_int_td?: number;
  def_sack?: number;
  def_forced_fumble?: number;
  idp_tkl?: number;
  idp_tkl_solo?: number;
  idp_tkl_ast?: number;
  idp_tkl_loss?: number;

  // Kicking stats
  fgm?: number;
  fga?: number;
  fgm_0_19?: number;
  fgm_20_29?: number;
  fgm_30_39?: number;
  fgm_40_49?: number;
  fgm_50p?: number;
  fgmiss?: number;
  xpm?: number;
  xpmiss?: number;

  // Special teams
  st_td?: number;
  st_ff?: number;
  st_tkl_solo?: number;
  pr_td?: number;
  kr_td?: number;

  // Misc
  fum?: number;
  fum_lost?: number;
  fum_rec_td?: number;
  penalty?: number;
  penalty_yd?: number;
  snp?: number;
  gms_active?: number;
  gs?: number;
  gp?: number;
}

export interface PlayerProjections extends PlayerStats {
  // Additional projection-specific fields
  team?: string;
  player_id?: string;
  sport?: string;
  season_type?: string;
  season?: string;
  week?: number;
}

class SleeperStatsService {
  private cache: Map<string, { data: any; timestamp: number }> = new Map();

  /**
   * Get weekly player stats
   */
  async getWeeklyStats(
    season: string,
    week: number,
    seasonType: 'regular' | 'pre' | 'post' = 'regular'
  ): Promise<Record<string, PlayerStats>> {
    const cacheKey = `stats-${seasonType}-${season}-${week}`;
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    try {
      const response = await fetch(
        `https://api.sleeper.app/v1/stats/nfl/${seasonType}/${season}/${week}`,
        {
          headers: {
            'User-Agent': 'Gauntlet-Website/1.0.0',
          },
        }
      );

      if (!response.ok) {
        console.warn(`Failed to fetch stats: ${response.status}`);
        return {};
      }

      const data = await response.json();
      this.setCache(cacheKey, data, CACHE_DURATIONS.ONE_HOUR);
      return data;
    } catch (error) {
      console.error('Error fetching player stats:', error);
      return {};
    }
  }

  /**
   * Get weekly player projections
   */
  async getWeeklyProjections(
    season: string,
    week: number,
    seasonType: 'regular' | 'pre' | 'post' = 'regular'
  ): Promise<Record<string, PlayerProjections>> {
    const cacheKey = `projections-${seasonType}-${season}-${week}`;
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    try {
      const response = await fetch(
        `https://api.sleeper.app/v1/projections/nfl/${seasonType}/${season}/${week}`,
        {
          headers: {
            'User-Agent': 'Gauntlet-Website/1.0.0',
          },
        }
      );

      if (!response.ok) {
        console.warn(`Failed to fetch projections: ${response.status}`);
        return {};
      }

      const data = await response.json();
      this.setCache(cacheKey, data, CACHE_DURATIONS.FOUR_HOURS);
      return data;
    } catch (error) {
      console.error('Error fetching projections:', error);
      return {};
    }
  }

  /**
   * Get season stats for all weeks
   */
  async getSeasonStats(
    season: string,
    seasonType: 'regular' | 'pre' | 'post' = 'regular'
  ): Promise<Record<string, PlayerStats>> {
    const cacheKey = `season-stats-${seasonType}-${season}`;
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    try {
      const response = await fetch(`https://api.sleeper.app/v1/stats/nfl/${seasonType}/${season}`, {
        headers: {
          'User-Agent': 'Gauntlet-Website/1.0.0',
        },
      });

      if (!response.ok) {
        console.warn(`Failed to fetch season stats: ${response.status}`);
        return {};
      }

      const data = await response.json();
      this.setCache(cacheKey, data, CACHE_DURATIONS.ONE_DAY);
      return data;
    } catch (error) {
      console.error('Error fetching season stats:', error);
      return {};
    }
  }

  /**
   * Get player stats for multiple weeks
   */
  async getMultiWeekStats(
    season: string,
    startWeek: number,
    endWeek: number,
    seasonType: 'regular' | 'pre' | 'post' = 'regular'
  ): Promise<Map<number, Record<string, PlayerStats>>> {
    const results = new Map<number, Record<string, PlayerStats>>();

    // Fetch all weeks in parallel
    const promises = [];
    for (let week = startWeek; week <= endWeek; week++) {
      promises.push(this.getWeeklyStats(season, week, seasonType).then(stats => ({ week, stats })));
    }

    const weekResults = await Promise.all(promises);
    weekResults.forEach(({ week, stats }) => {
      results.set(week, stats);
    });

    return results;
  }

  /**
   * Get specific player's stats across weeks
   */
  async getPlayerSeasonStats(
    playerId: string,
    season: string,
    seasonType: 'regular' | 'pre' | 'post' = 'regular'
  ): Promise<PlayerStats[]> {
    const seasonStats = await this.getSeasonStats(season, seasonType);
    const playerData = seasonStats[playerId];

    if (!playerData) return [];

    // For weekly breakdown, we'd need to fetch each week
    const weeklyStats: PlayerStats[] = [];
    for (let week = 1; week <= 18; week++) {
      const weekStats = await this.getWeeklyStats(season, week, seasonType);
      if (weekStats[playerId]) {
        weeklyStats.push(weekStats[playerId]);
      }
    }

    return weeklyStats;
  }

  /**
   * Cache management
   */
  private getFromCache(key: string): any | null {
    const cached = this.cache.get(key);
    if (!cached) return null;

    const age = Date.now() - cached.timestamp;
    if (age > CACHE_DURATIONS.ONE_DAY) {
      this.cache.delete(key);
      return null;
    }

    return cached.data;
  }

  private setCache(key: string, data: any, maxAge: number = CACHE_DURATIONS.ONE_HOUR): void {
    this.cache.set(key, { data, timestamp: Date.now() });

    // Clean up old cache entries
    if (this.cache.size > 100) {
      const now = Date.now();
      for (const [k, v] of this.cache.entries()) {
        if (now - v.timestamp > maxAge) {
          this.cache.delete(k);
        }
      }
    }
  }

  /**
   * Clear all cached data
   */
  clearCache(): void {
    this.cache.clear();
  }
}

// Export singleton instance
export const sleeperStatsService = new SleeperStatsService();

/**
 * Helper functions for stat calculations
 */

export function calculateBoomBust(
  actualStats: PlayerStats,
  projectedStats: PlayerProjections,
  scoringType: 'ppr' | 'half_ppr' | 'std' = 'half_ppr'
): { boom: boolean; bust: boolean; delta: number } {
  const actualPoints =
    scoringType === 'ppr'
      ? actualStats.pts_ppr
      : scoringType === 'half_ppr'
        ? actualStats.pts_half_ppr
        : actualStats.pts_std || 0;

  const projectedPoints =
    scoringType === 'ppr'
      ? projectedStats.pts_ppr
      : scoringType === 'half_ppr'
        ? projectedStats.pts_half_ppr
        : projectedStats.pts_std || 0;

  const delta = actualPoints - projectedPoints;

  // Boom: exceeded projection by 50% or 10+ points
  const boom = delta > projectedPoints * 0.5 || delta > 10;

  // Bust: fell short of projection by 50% or scored under 5 points
  const bust = actualPoints < projectedPoints * 0.5 || actualPoints < 5;

  return { boom, bust, delta };
}

export function getTopStatPerformers(
  stats: Record<string, PlayerStats>,
  statKey: keyof PlayerStats,
  limit: number = 10
): Array<{ playerId: string; value: number }> {
  const performances = Object.entries(stats)
    .map(([playerId, playerStats]) => ({
      playerId,
      value: (playerStats[statKey] as number) || 0,
    }))
    .filter(p => p.value > 0)
    .sort((a, b) => b.value - a.value)
    .slice(0, limit);

  return performances;
}

export function aggregatePlayerStats(weeklyStats: PlayerStats[]): PlayerStats {
  const aggregated: PlayerStats = {};

  // Sum all numeric stats
  weeklyStats.forEach(week => {
    Object.entries(week).forEach(([key, value]) => {
      if (typeof value === 'number') {
        aggregated[key as keyof PlayerStats] =
          ((aggregated[key as keyof PlayerStats] as number) || 0) + value;
      }
    });
  });

  return aggregated;
}
