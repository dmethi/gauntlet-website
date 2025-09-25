/**
 * Sleeper API Client for Stats Hub
 * All fetches use no-store cache policy for fresh data
 */

import type {
  NFLState,
  PlayerIndex,
  SleeperLeague,
  SleeperMatchup,
  SleeperRoster,
  SleeperUser,
} from './types';

const SLEEPER_API_BASE = 'https://api.sleeper.app/v1';

/**
 * Fetch NFL state (current week and season)
 */
export async function fetchNFLState(): Promise<NFLState> {
  console.log('[DEBUG] fetchNFLState: starting fetch');
  const response = await fetch(`${SLEEPER_API_BASE}/state/nfl`, {
    cache: 'no-store',
    headers: {
      'User-Agent': 'Gauntlet-Stats-Hub/1.0',
    },
  });

  if (!response.ok) {
    console.error('[DEBUG] fetchNFLState: failed', response.status, response.statusText);
    throw new Error(`Failed to fetch NFL state: ${response.statusText}`);
  }

  const data = await response.json();
  console.log('[DEBUG] fetchNFLState: success', data);
  return data;
}

/**
 * Fetch league details
 */
export async function fetchLeague(leagueId: string): Promise<SleeperLeague> {
  const response = await fetch(`${SLEEPER_API_BASE}/league/${leagueId}`, {
    cache: 'no-store',
    headers: {
      'User-Agent': 'Gauntlet-Stats-Hub/1.0',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch league ${leagueId}: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Fetch users in a league
 */
export async function fetchUsers(leagueId: string): Promise<SleeperUser[]> {
  console.log('[DEBUG] fetchUsers: starting fetch for league', leagueId);
  const response = await fetch(`${SLEEPER_API_BASE}/league/${leagueId}/users`, {
    cache: 'no-store',
    headers: {
      'User-Agent': 'Gauntlet-Stats-Hub/1.0',
    },
  });

  if (!response.ok) {
    console.error(
      '[DEBUG] fetchUsers: failed for league',
      leagueId,
      response.status,
      response.statusText
    );
    throw new Error(`Failed to fetch users for league ${leagueId}: ${response.statusText}`);
  }

  const data = await response.json();
  console.log('[DEBUG] fetchUsers: success for league', leagueId, 'users count:', data?.length);
  return data;
}

/**
 * Fetch rosters in a league
 */
export async function fetchRosters(leagueId: string): Promise<SleeperRoster[]> {
  console.log('[DEBUG] fetchRosters: starting fetch for league', leagueId);
  const response = await fetch(`${SLEEPER_API_BASE}/league/${leagueId}/rosters`, {
    cache: 'no-store',
    headers: {
      'User-Agent': 'Gauntlet-Stats-Hub/1.0',
    },
  });

  if (!response.ok) {
    console.error(
      '[DEBUG] fetchRosters: failed for league',
      leagueId,
      response.status,
      response.statusText
    );
    throw new Error(`Failed to fetch rosters for league ${leagueId}: ${response.statusText}`);
  }

  const data = await response.json();
  console.log('[DEBUG] fetchRosters: success for league', leagueId, 'rosters count:', data?.length);
  return data;
}

/**
 * Fetch matchups for a specific week
 */
export async function fetchMatchups(leagueId: string, week: number): Promise<SleeperMatchup[]> {
  console.log('[DEBUG] fetchMatchups: starting fetch for league', leagueId, 'week', week);
  const response = await fetch(`${SLEEPER_API_BASE}/league/${leagueId}/matchups/${week}`, {
    cache: 'no-store',
    headers: {
      'User-Agent': 'Gauntlet-Stats-Hub/1.0',
    },
  });

  if (!response.ok) {
    console.error(
      '[DEBUG] fetchMatchups: failed for league',
      leagueId,
      'week',
      week,
      response.status,
      response.statusText
    );
    throw new Error(
      `Failed to fetch matchups for league ${leagueId} week ${week}: ${response.statusText}`
    );
  }

  const data = await response.json();
  console.log(
    '[DEBUG] fetchMatchups: success for league',
    leagueId,
    'week',
    week,
    'matchups count:',
    data?.length,
    'sample points:',
    data?.slice(0, 2)?.map((m: any) => m?.points)
  );
  return data;
}

/**
 * Fetch all NFL players
 * Note: This is a large dataset, only fetch the fields we need
 */
export async function fetchPlayersIndex(): Promise<PlayerIndex> {
  const response = await fetch(`${SLEEPER_API_BASE}/players/nfl`, {
    cache: 'no-store',
    headers: {
      'User-Agent': 'Gauntlet-Stats-Hub/1.0',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch players index: ${response.statusText}`);
  }

  const allPlayers = await response.json();

  // Transform to simplified index with only needed fields
  const playerIndex: PlayerIndex = {};

  for (const [playerId, player] of Object.entries(allPlayers)) {
    const p = player as any;
    if (p.position && ['QB', 'RB', 'WR', 'TE', 'DEF'].includes(p.position)) {
      playerIndex[playerId] = {
        position: p.position,
        full_name: p.full_name || `${p.first_name || ''} ${p.last_name || ''}`.trim(),
        team: p.team,
      };
    }
  }

  return playerIndex;
}
