/**
 * Stats Feature Types
 *
 * Type definitions for stats hub components (TrendsView, TeamView, ScheduleAnalysis).
 * Consolidates duplicate types and creates a single source of truth.
 */

import type { PlainStatsDataset, TrackedPosition } from '@/shared/utils/stats';

/**
 * Team identification and display information
 */
export interface TeamInfo {
  teamName: string;
  leagueName: string;
  avatar?: string;
  leagueId?: string;
  rosterId?: number;
}

/**
 * Team score for a specific week
 */
export interface TeamScore {
  week: number;
  value: number;
}

/**
 * Complete team data with scores and opponent information
 * Note: opponentScores is required in TeamView and ScheduleAnalysis
 */
export interface TeamData {
  teamInfo: TeamInfo;
  teamScores: TeamScore[];
  opponentScores: TeamScore[];
}

/**
 * Individual player scoring information
 */
export interface PlayerScore {
  playerName?: string;
  position?: string;
  points?: number;
  week: number;
  value: number;
}

/**
 * Positional team scoring data
 * Note: teamInfo is required in TeamView
 */
export interface PositionalTeamData {
  scores: { week: number; value: number }[];
  teamInfo: TeamInfo;
}

/**
 * Position-level aggregated data
 */
export interface PositionData {
  teams: [string, PositionalTeamData][];
}

/**
 * Props for TrendsView component
 */
export interface TrendsViewProps {
  allTeamEntries: [string, TeamData][];
  positionsMap: Map<TrackedPosition, PositionData>;
  dataset: PlainStatsDataset;
}

/**
 * Power ranking team with calculated metrics
 */
export interface PowerRankingTeam {
  key: string;
  teamInfo: TeamInfo;
  avgPoints: number;
  expectedWins: number;
  rolling3Avg: number;
  weeklyScores: number;
}

/**
 * Ridge plot team data for distribution visualization
 */
export interface RidgeTeamData {
  teamName: string;
  leagueName: string;
  teamKey: string;
  min: number;
  max: number;
  pad: number;
  median: number;
  range: number;
  scores: number[];
  gamesPlayed: number;
  xs: number[];
  densityPairs: [number, number][];
  maxDensity: number;
}

/**
 * Props for TeamView component
 */
export interface TeamViewProps {
  allTeamEntries: [string, TeamData][];
  positionsMap: Map<TrackedPosition, PositionData>;
  dataset: PlainStatsDataset;
  fromWeek: number;
  toWeek: number;
  availableWeeks: number[];
}

/**
 * Props for ScheduleAnalysis component
 */
export interface ScheduleAnalysisProps {
  allTeamEntries: [string, TeamData][];
  dataset: PlainStatsDataset;
}
