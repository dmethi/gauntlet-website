/**
 * Unified Sleeper API Client (server-only)
 *
 * Extends `browser-client.ts`'s `BrowserSleeperClient` with local-dev
 * fixture-replay (`SLEEPER_FIXTURES=1`), which requires Node's `fs/promises`.
 * That import makes this module server-only — browser code ('use client'
 * hooks) must import `browser-client.ts` directly instead. See
 * SCRATCHPAD.md (2026-07-23) for why the split exists.
 *
 * 🔧 ASSUMPTIONS MADE:
 * 1. All existing clients use 'no-store' cache policy for fetch() - we preserve this
 * 2. Different User-Agent strings serve different purposes - we make this configurable
 * 3. Error handling varies by use case - some need throws, others need graceful returns
 * 4. Debug logging varies - some always on, some environment-based, some off
 * 5. Rate limiting only needed for draft operations - configurable with default 0ms
 * 6. Caching needed for stats service - configurable with memory-based implementation
 * 7. All clients ultimately use the same Sleeper API endpoints - we standardize these
 * 8. Backwards compatibility critical - existing function signatures preserved
 */

import { readFile } from 'fs/promises';
import { join } from 'path';
import {
  BrowserSleeperClient,
  CACHE_DURATIONS,
  type CacheStrategy,
  CLIENT_CONFIGS,
  type DebugStrategy,
  type ErrorStrategy,
  type PlayerStats,
  type RosterWithOwner,
  type SleeperClientConfig,
} from './browser-client';

// Re-exported so existing `from '@/lib/sleeper/unified-client'` imports keep working.
export { CACHE_DURATIONS, CLIENT_CONFIGS };
export type {
  CacheStrategy,
  DebugStrategy,
  ErrorStrategy,
  PlayerStats,
  RosterWithOwner,
  SleeperClientConfig,
};

// Local-dev fixture replay (SLEEPER_FIXTURES=1) — mirrors driveff's
// src/lib/sleeper/client.ts pattern. Fixtures live under fixtures/, mirroring
// the endpoint path 1:1 (e.g. /league/123/rosters -> fixtures/league/123/rosters.json).
// process.cwd() is apps/web both under `next dev`/`next start` (run from the
// app package directory) and under vitest — unlike __dirname, which resolves
// to a bundler-rewritten output path under Next.js and silently 404s there.
const FIXTURES_DIR = join(process.cwd(), 'src/lib/sleeper/fixtures');

const isFixturesEnabled = (): boolean => {
  if (process.env.SLEEPER_FIXTURES !== '1') return false;
  if (process.env.VERCEL) {
    throw new Error(
      'SLEEPER_FIXTURES=1 is set but this is running on Vercel (VERCEL env var present) — ' +
        'fixture replay is local-dev-only (`next dev`). Unset SLEEPER_FIXTURES for this environment.',
    );
  }
  return true;
};

const readFixture = async <T>(endpoint: string): Promise<T> => {
  const filePath = join(FIXTURES_DIR, `${endpoint.replace(/^\//, '')}.json`);
  let raw: string;
  try {
    raw = await readFile(filePath, 'utf-8');
  } catch (error) {
    throw new Error(
      `No fixture recorded for ${endpoint} (looked in ${filePath}). Run ` +
        `apps/web/src/scripts/capture-sleeper-fixtures.ts to capture it.`,
      { cause: error },
    );
  }
  try {
    return JSON.parse(raw) as T;
  } catch (error) {
    throw new Error(`Fixture file is not valid JSON: ${filePath}`, { cause: error });
  }
};

export class UnifiedSleeperClient extends BrowserSleeperClient {
  protected override async tryFixture<T>(endpoint: string): Promise<T | undefined> {
    if (!isFixturesEnabled()) return undefined;
    return readFixture<T>(endpoint);
  }
}

// ========================
// CONVENIENCE FACTORY FUNCTIONS
// ========================

// Pre-configured clients for different use cases
export const createDirectClient = () => new UnifiedSleeperClient(CLIENT_CONFIGS.direct);
export const createStatsClient = () => new UnifiedSleeperClient(CLIENT_CONFIGS.stats);
export const createDraftClient = () => new UnifiedSleeperClient(CLIENT_CONFIGS.draft);
export const createServiceClient = () => new UnifiedSleeperClient(CLIENT_CONFIGS.service);

// Default client (uses direct config for backwards compatibility)
export const sleeperClient = createDirectClient();

// ========================
// BACKWARDS COMPATIBILITY EXPORTS
// ========================

/**
 * Drop-in replacements for existing functions
 * These maintain exact function signatures and behavior
 */

// From sleeper-direct.ts
export const getLeague = (leagueId: string) => sleeperClient.fetchLeague(leagueId);
export const getRosters = (leagueId: string) => sleeperClient.fetchRostersWithOwners(leagueId);
export const getMatchups = (leagueId: string, week: number) =>
  sleeperClient.fetchMatchups(leagueId, week);
export const getUsers = (leagueId: string) => sleeperClient.fetchUsers(leagueId);
export const getNFLState = () => sleeperClient.fetchNFLState();
export const getPlayers = () => sleeperClient.fetchAllPlayers();
export const getProjections = (week: number, season = '2025') =>
  sleeperClient.fetchWeeklyProjections(week, season);

// From sleeper/client.ts
export const fetchNFLState = () => createStatsClient().fetchNFLState();
export const fetchLeague = (leagueId: string) => createStatsClient().fetchLeague(leagueId);
export const fetchUsers = (leagueId: string) => createStatsClient().fetchUsers(leagueId);
export const fetchRosters = (leagueId: string) => createStatsClient().fetchRosters(leagueId);
export const fetchMatchups = (leagueId: string, week: number) =>
  createStatsClient().fetchMatchups(leagueId, week);
export const fetchPlayersIndex = () => createStatsClient().fetchPlayersIndex();
export const fetchWeeklyPlayerStats = (week: number) =>
  createStatsClient().fetchWeeklyPlayerStats(week);
