/**
 * Player metadata cache utility
 * Fetches and caches all NFL players from Sleeper API
 * Updates once per year to minimize API calls
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PLAYERS_CACHE_PATH = path.join(__dirname, 'players-cache.json');

export interface SleeperPlayer {
  player_id: string;
  full_name: string;
  position: string;
  team: string | null;
  active: boolean;
  [key: string]: unknown;
}

interface PlayerMetadataCache {
  lastUpdated: string;
  season: number;
  players: Record<string, SleeperPlayer>;
}

/**
 * Get all NFL players from cache or Sleeper API.
 *
 * Checks cache first and reuses if from current year. Otherwise fetches fresh
 * data from Sleeper API and saves to cache. Cache is stored as JSON file in
 * `src/data/players-cache.json`.
 *
 * @returns Promise<Record<string, SleeperPlayer>> - Map of player IDs to player data
 *
 * @throws {Error} If Sleeper API call fails
 *
 * @example
 * const players = await getPlayerMetadata();
 * console.log(`Loaded ${Object.keys(players).length} players`);
 * const mahomes = players['4866'];
 * console.log(`${mahomes.full_name} - ${mahomes.position}`);
 */
export const getPlayerMetadata = async (): Promise<Record<string, SleeperPlayer>> => {
  try {
    // Try to load from cache
    const cacheData = await fs.readFile(PLAYERS_CACHE_PATH, 'utf-8');
    const cache: PlayerMetadataCache = JSON.parse(cacheData);

    const currentYear = new Date().getFullYear();
    const cacheYear = new Date(cache.lastUpdated).getFullYear();

    // Cache is from current year, use it
    if (cacheYear === currentYear) {
      return cache.players;
    }
    // Cache is old, fall through to fetch
  } catch {
    // Cache doesn't exist or is invalid, fall through to fetch
  }

  // Fetch from Sleeper API
  const response = await fetch('https://api.sleeper.app/v1/players/nfl');
  if (!response.ok) {
    throw new Error(`Failed to fetch players: ${response.statusText}`);
  }

  const players = (await response.json()) as Record<string, SleeperPlayer>;

  // Save to cache
  const cache: PlayerMetadataCache = {
    lastUpdated: new Date().toISOString(),
    season: new Date().getFullYear(),
    players,
  };

  await fs.writeFile(PLAYERS_CACHE_PATH, JSON.stringify(cache, null, 2));

  return players;
};
