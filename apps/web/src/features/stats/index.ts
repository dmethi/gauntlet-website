/**
 * Stats Feature
 *
 * Exports all types and hooks for stats hub components.
 */

export type {
  // Core Data Types
  TeamInfo,
  TeamScore,
  TeamData,
  PlayerScore,
  PositionalTeamData,
  PositionData,

  // Component Props
  TrendsViewProps,
  TeamViewProps,
  ScheduleAnalysisProps,

  // Analysis Types
  PowerRankingTeam,
  RidgeTeamData,
} from './types';

// Hook Exports
export {
  useLeagueStats,
  useSeasonAggregates,
  useWeekStats,
  useSuperlatives,
  type LeagueStatsResult,
  type SeasonAggregatesOptions,
  type WeekStatsOptions,
  type SuperlativesOptions,
} from './hooks';
