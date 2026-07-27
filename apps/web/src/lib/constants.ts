/**
 * Core application constants
 */

import { getCurrentLeagues } from '@/config/leagues';

// League IDs, derived from the current season's registered leagues
// (apps/web/src/config/leagues.ts is the source of truth).
const currentLeagues = getCurrentLeagues();
export const LEAGUE_IDS = {
  AFC: currentLeagues.find(l => l.conference === 'AFC')?.id ?? '',
  NFC: currentLeagues.find(l => l.conference === 'NFC')?.id ?? '',
} as const;

// Default league for fallback
export const DEFAULT_LEAGUE_ID = LEAGUE_IDS.AFC;

// Cache durations (in milliseconds)
export const CACHE_DURATIONS = {
  ONE_HOUR: 60 * 60 * 1000,
  FOUR_HOURS: 4 * 60 * 60 * 1000,
  ONE_DAY: 24 * 60 * 60 * 1000,
  ONE_WEEK: 7 * 24 * 60 * 60 * 1000,
  ONE_MONTH: 30 * 24 * 60 * 60 * 1000,
} as const;

// Positions used in the league (kickers excluded as of 2024)
export const VALID_POSITIONS = ['QB', 'RB', 'WR', 'TE', 'DEF'] as const;
export const ALL_POSITIONS_WITH_KICKER = ['QB', 'RB', 'WR', 'TE', 'K', 'DEF'] as const;

// Season configuration
export const CURRENT_SEASON = '2026';
export const REGULAR_SEASON_WEEKS = 14;
export const PLAYOFF_WEEK_START = 15;
