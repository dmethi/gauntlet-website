/**
 * Gauntlet API Client
 *
 * Client for fetching data from Gauntlet web app API endpoints.
 * Used by background jobs to capture live odds, matchup simulations, and team data.
 */

import type {
  GauntletAPIOptions,
  LeagueOddsResponse,
  MatchupSimulationResponse,
  NFLState,
  SleeperRoster,
  SleeperUser,
} from '@gauntlet/types';

/**
 * Client for interacting with Gauntlet web app API endpoints
 *
 * @example
 * ```typescript
 * const client = new GauntletAPIClient();
 * const week = await client.getCurrentWeek();
 * const odds = await client.fetchLeagueOdds(week);
 * const simulation = await client.fetchMatchupSimulation('1263744209295245312', week, 1);
 * ```
 */
export class GauntletAPIClient {
  private baseUrl: string;
  private timeout: number;

  constructor(options: GauntletAPIOptions = {}) {
    this.baseUrl = options.baseUrl || 'https://gauntlet-website.vercel.app';
    this.timeout = options.timeout || 30000;
  }

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
  async getCurrentWeek(): Promise<number> {
    try {
      const response = await fetch('https://api.sleeper.app/v1/state/nfl');
      if (!response.ok) {
        console.warn(`Failed to fetch NFL state: ${response.status}`);
        return 4; // Default fallback
      }
      const data: NFLState = await response.json();
      return data?.week || 4;
    } catch (error) {
      console.warn('Error fetching current week, using default:', error);
      return 4; // Default fallback
    }
  }

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
  async fetchLeagueOdds(week: number): Promise<LeagueOddsResponse> {
    const cacheBuster = Date.now();
    const url = `${this.baseUrl}/api/matchups/league-odds/${week}?t=${cacheBuster}`;

    try {
      const response = await fetch(url, {
        headers: {
          'Cache-Control': 'no-cache',
          Pragma: 'no-cache',
        },
        signal: AbortSignal.timeout(this.timeout),
      });

      if (!response.ok) {
        throw new Error(`League odds API failed: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to fetch league odds for week ${week}: ${error.message}`);
      }
      throw error;
    }
  }

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
  async fetchMatchupSimulation(
    leagueId: string,
    week: number,
    matchupId: number
  ): Promise<MatchupSimulationResponse> {
    const url = `${this.baseUrl}/api/matchups/${leagueId}/${week}/${matchupId}/simulate`;

    try {
      const response = await fetch(url, {
        signal: AbortSignal.timeout(this.timeout),
      });

      if (!response.ok) {
        throw new Error(`Matchup simulation API failed: ${response.status} ${response.statusText}`);
      }

      const data: MatchupSimulationResponse = await response.json();

      if (!data.success) {
        throw new Error('Matchup simulation returned unsuccessful response');
      }

      return data;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(
          `Failed to fetch matchup simulation for league ${leagueId}, week ${week}, matchup ${matchupId}: ${error.message}`
        );
      }
      throw error;
    }
  }

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
  async getTeamNames(leagueId: string): Promise<Map<number, string>> {
    try {
      const [usersResponse, rostersResponse] = await Promise.all([
        fetch(`https://api.sleeper.app/v1/league/${leagueId}/users`, {
          signal: AbortSignal.timeout(this.timeout),
        }),
        fetch(`https://api.sleeper.app/v1/league/${leagueId}/rosters`, {
          signal: AbortSignal.timeout(this.timeout),
        }),
      ]);

      if (!usersResponse.ok || !rostersResponse.ok) {
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
      console.error(`Failed to fetch team names for league ${leagueId}:`, error);
      return new Map(); // Return empty map on error
    }
  }
}

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
export const gauntletAPI = new GauntletAPIClient();
