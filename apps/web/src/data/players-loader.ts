/**
 * Static players data loader - replaces caching of 11,400+ player records
 * Uses pre-exported players data stored in the repo
 */

import playersData from './players-data.json';
import type { PlayersData, SleeperPlayer } from './players-data.types';

// Type assertion for imported JSON
const data = playersData as unknown as PlayersData;

// In-memory index for fast lookups (just player IDs, not full data)
const playersById = new Map<string, SleeperPlayer>();

// Initialize index
const initializePlayersIndex = () => {
  for (const [playerId, player] of Object.entries(data.players)) {
    playersById.set(playerId, player);
  }

  console.log(`✅ Loaded ${playersById.size} players from static data`);
  console.log(`✅ Data exported at: ${data.exportedAt}`);
};

// Initialize on module load
initializePlayersIndex();

/**
 * Get all players data (returns the full object)
 * Replaces: fetchWithCache('https://api.sleeper.app/v1/players/nfl')
 */
export const getAllPlayers = (): Record<string, SleeperPlayer> => {
  return data.players;
};

/**
 * Get a specific player by ID
 */
export const getPlayerById = (playerId: string): SleeperPlayer | undefined => {
  return playersById.get(playerId);
};

/**
 * Get multiple players by IDs
 */
export const getPlayersByIds = (playerIds: string[]): Record<string, SleeperPlayer> => {
  const result: Record<string, SleeperPlayer> = {};

  for (const playerId of playerIds) {
    const player = playersById.get(playerId);
    if (player) {
      result[playerId] = player;
    }
  }

  return result;
};

/**
 * Search players by name (case-insensitive)
 */
export const searchPlayersByName = (searchTerm: string): SleeperPlayer[] => {
  const term = searchTerm.toLowerCase();
  const results: SleeperPlayer[] = [];

  for (const player of playersById.values()) {
    if (
      player.full_name?.toLowerCase().includes(term) ||
      player.first_name?.toLowerCase().includes(term) ||
      player.last_name?.toLowerCase().includes(term)
    ) {
      results.push(player);
    }
  }

  return results.slice(0, 50); // Limit results for performance
};

/**
 * Get players by position
 */
export const getPlayersByPosition = (position: string): SleeperPlayer[] => {
  const results: SleeperPlayer[] = [];

  for (const player of playersById.values()) {
    if (player.position === position) {
      results.push(player);
    }
  }

  return results;
};

/**
 * Get players by team
 */
export const getPlayersByTeam = (team: string): SleeperPlayer[] => {
  const results: SleeperPlayer[] = [];

  for (const player of playersById.values()) {
    if (player.team === team) {
      results.push(player);
    }
  }

  return results;
};

/**
 * Get data export info
 */
export const getPlayersDataInfo = () => {
  return {
    exportedAt: data.exportedAt,
    totalPlayers: playersById.size,
  };
};
