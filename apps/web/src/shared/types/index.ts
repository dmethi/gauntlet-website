/**
 * Shared Types
 *
 * Exports all shared type definitions used across the application.
 */

export type {
  // League & Team Types
  Matchup,
  WeeklyMetric,
  Roster,
  TeamStats,
  LeagueData,

  // API Response Types
  WeekRollupsResponse,
  SuperlativesResponse,
  SeasonalAggregatesResponse,
  RosterDetailsResponse,
  LeagueTransactionsResponse,
  PlayoffBracketResponse,
  MatchupsResponse,
  SingleMatchupResponse,
  PlayersResponse,
  PlayerStatsResponse,

  // Data Types
  RosterWeekAggregate,
  PlayoffMatchup,
  MatchupTeam,
  MatchupData,
  PlayerInfo,
  PlayerStats,
} from './api';

export type {
  // Core report types
  BoxRow,
  SeriesPoint,
  MatchupView,
  ApiLeague,
  StandingsTeam,
  StandingsDivision,
  LeagueStandings,
  PowerRanking,
  UpcomingMatchup,
  WeeklyCallout,

  // Response types
  WeeklyReportData,
  ApiResponse,

  // Generation types
  ReportConfig,
  ReportSection,

  // Preview types
  WeekPreviewData,
  PreviewApiResponse,
} from './reports';
