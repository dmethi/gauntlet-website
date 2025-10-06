/**
 * Gauntlet API Client
 *
 * Client for fetching data from Gauntlet web app API endpoints.
 * Used by background jobs to capture live odds, matchup simulations, and team data.
 */

import { logger } from './logger.js';
import { fetchWithRetry } from './retry.js';
import type {
  GauntletAPIOptions,
  LeagueOddsResponse,
  MatchupSimulationResponse,
  Metrics,
  NFLState,
  SleeperRoster,
  SleeperUser,
} from '@gauntlet/types';

/**
 * Create a Gauntlet API client for interacting with web app API endpoints
 *
 * @param options - Optional configuration for base URL and timeout
 * @param metrics - Optional Metrics instance for tracking API call durations
 * @returns Client object with methods for fetching data from Gauntlet API
 *
 * @example
 * ```typescript
 * const metrics = new Metrics();
 * const client = createGauntletAPIClient({}, metrics);
 * const week = await client.getCurrentWeek();
 * const odds = await client.fetchLeagueOdds(week);
 * const simulation = await client.fetchMatchupSimulation('1263744209295245312', week, 1);
 * ```
 */
export const createGauntletAPIClient = (
  options: GauntletAPIOptions = {},
  metrics?: Metrics
): {
  getCurrentWeek: () => Promise<number>;
  fetchLeagueOdds: (_week: number) => Promise<LeagueOddsResponse>;
  fetchMatchupSimulation: (
    _leagueId: string,
    _week: number,
    _matchupId: number
  ) => Promise<MatchupSimulationResponse>;
  getTeamNames: (_leagueId: string) => Promise<Map<number, string>>;
} => {
  const baseUrl = options.baseUrl || 'https://gauntlet-website.vercel.app';
  const timeout = options.timeout || 30000;

  return {
    /**
     * Get the current NFL week from Sleeper API
     *
     * @returns The current NFL week number, defaults to 4 if fetch fails
     *
     * @example
     * ```typescript
     * const week = await client.getCurrentWeek();
     * console.log(`Current NFL week: ${week}`);
     * ```
     */
    getCurrentWeek: async (): Promise<number> => {
      const start = Date.now();
      try {
        const response = await fetchWithRetry(
          'https://api.sleeper.app/v1/state/nfl',
          {
            maxRetries: 2, // Quick retries for critical path
            initialDelayMs: 500,
            timeout,
          },
          metrics
        );

        const duration = Date.now() - start;
        metrics?.recordDuration('api.sleeper.current_week', duration);

        if (!response.ok) {
          logger.warn({
            event: 'nfl_state_fetch_failed',
            status: response.status,
            duration,
            message: 'Failed to fetch NFL state, using default week 4',
          });
          return 4; // Default fallback
        }
        const data: NFLState = await response.json();
        return data?.week || 4;
      } catch (error) {
        const duration = Date.now() - start;
        metrics?.recordDuration('api.sleeper.current_week', duration);
        metrics?.increment('api.sleeper.current_week.error');
        logger.warn({
          event: 'current_week_error',
          error: error instanceof Error ? error.message : String(error),
          duration,
          message: 'Error fetching current week, using default week 4',
        });
        return 4; // Default fallback
      }
    },

    /**
     * Fetch league-wide odds and team rankings for a given week
     *
     * @param week - The NFL week number
     * @returns League odds data including team projections and rankings
     * @throws Error if the API request fails
     *
     * @example
     * ```typescript
     * const odds = await client.fetchLeagueOdds(5);
     * console.log(`${odds.highestScorer?.length || 0} teams ranked`);
     * ```
     */
    fetchLeagueOdds: async (week: number): Promise<LeagueOddsResponse> => {
      const start = Date.now();
      const cacheBuster = Date.now();
      const url = `${baseUrl}/api/matchups/league-odds/${week}?t=${cacheBuster}`;

      try {
        const response = await fetchWithRetry(
          url,
          {
            headers: {
              'Cache-Control': 'no-cache',
              Pragma: 'no-cache',
            },
            maxRetries: 3,
            timeout,
          },
          metrics
        );

        const duration = Date.now() - start;
        metrics?.recordDuration('api.gauntlet.league_odds', duration);

        if (!response.ok) {
          metrics?.increment('api.gauntlet.league_odds.error');
          throw new Error(`League odds API failed: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        return data;
      } catch (error) {
        const duration = Date.now() - start;
        metrics?.recordDuration('api.gauntlet.league_odds', duration);
        metrics?.increment('api.gauntlet.league_odds.error');
        if (error instanceof Error) {
          throw new Error(`Failed to fetch league odds for week ${week}: ${error.message}`);
        }
        throw error;
      }
    },

    /**
     * Fetch detailed simulation data for a specific matchup
     *
     * @param leagueId - Sleeper league ID
     * @param week - NFL week number
     * @param matchupId - Matchup ID (1-6 in most leagues)
     * @returns Matchup simulation with win probabilities, projections, and player details
     * @throws Error if the API request fails or returns unsuccessful data
     *
     * @example
     * ```typescript
     * const sim = await client.fetchMatchupSimulation('1263744209295245312', 5, 1);
     * if (sim.success) {
     *   console.log(`Team 1 win probability: ${sim.simulation.team1WinPct * 100}%`);
     * }
     * ```
     */
    fetchMatchupSimulation: async (
      leagueId: string,
      week: number,
      matchupId: number
    ): Promise<MatchupSimulationResponse> => {
      const start = Date.now();
      const url = `${baseUrl}/api/matchups/${leagueId}/${week}/${matchupId}/simulate`;

      try {
        const response = await fetchWithRetry(
          url,
          {
            maxRetries: 3,
            timeout,
          },
          metrics
        );

        const duration = Date.now() - start;
        metrics?.recordDuration('api.gauntlet.matchup_simulation', duration);

        if (!response.ok) {
          metrics?.increment('api.gauntlet.matchup_simulation.error');
          throw new Error(
            `Matchup simulation API failed: ${response.status} ${response.statusText}`
          );
        }

        const data: MatchupSimulationResponse = await response.json();

        if (!data.success) {
          metrics?.increment('api.gauntlet.matchup_simulation.error');
          throw new Error('Matchup simulation returned unsuccessful response');
        }

        return data;
      } catch (error) {
        const duration = Date.now() - start;
        metrics?.recordDuration('api.gauntlet.matchup_simulation', duration);
        metrics?.increment('api.gauntlet.matchup_simulation.error');
        if (error instanceof Error) {
          throw new Error(
            `Failed to fetch matchup simulation for league ${leagueId}, week ${week}, matchup ${matchupId}: ${error.message}`
          );
        }
        throw error;
      }
    },

    /**
     * Fetch team names for a league from Sleeper API
     *
     * @param leagueId - Sleeper league ID
     * @returns Map of roster ID to team name
     *
     * @example
     * ```typescript
     * const teamNames = await client.getTeamNames('1263744209295245312');
     * console.log(`Found ${teamNames.size} teams`);
     * ```
     */
    getTeamNames: async (leagueId: string): Promise<Map<number, string>> => {
      const start = Date.now();
      try {
        const [usersResponse, rostersResponse] = await Promise.all([
          fetchWithRetry(
            `https://api.sleeper.app/v1/league/${leagueId}/users`,
            { maxRetries: 2, timeout },
            metrics
          ),
          fetchWithRetry(
            `https://api.sleeper.app/v1/league/${leagueId}/rosters`,
            { maxRetries: 2, timeout },
            metrics
          ),
        ]);

        const duration = Date.now() - start;
        metrics?.recordDuration('api.sleeper.team_names', duration);

        if (!usersResponse.ok || !rostersResponse.ok) {
          metrics?.increment('api.sleeper.team_names.error');
          throw new Error(
            `Failed to fetch team data: users ${usersResponse.status}, rosters ${rostersResponse.status}`
          );
        }

        const users: SleeperUser[] = await usersResponse.json();
        const rosters: SleeperRoster[] = await rostersResponse.json();

        const teamNames = new Map<number, string>();

        for (const roster of rosters) {
          const owner = users.find(u => u.user_id === roster.owner_id);
          const teamName =
            owner?.metadata?.team_name || owner?.display_name || `Team ${roster.roster_id}`;
          teamNames.set(roster.roster_id, teamName);
        }

        return teamNames;
      } catch (error) {
        const duration = Date.now() - start;
        metrics?.recordDuration('api.sleeper.team_names', duration);
        metrics?.increment('api.sleeper.team_names.error');
        logger.error({
          event: 'team_names_fetch_failed',
          leagueId,
          error: error instanceof Error ? error.message : String(error),
          duration,
          message: 'Failed to fetch team names',
        });
        return new Map(); // Return empty map on error
      }
    },
  };
};

/**
 * Default Gauntlet API client instance
 *
 * @example
 * ```typescript
 * import { gauntletAPI } from './gauntlet-api-client';
 *
 * const week = await gauntletAPI.getCurrentWeek();
 * const odds = await gauntletAPI.fetchLeagueOdds(week);
 * ```
 */
export const gauntletAPI = createGauntletAPIClient();
