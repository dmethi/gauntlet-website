/**
 * Matchups Feature
 * Exports all matchup-related types for head-to-head matchups and simulations
 */

// Export types
export type {
  // Core matchup types
  MatchupTeam,
  MatchupData,
  PlayerDetails,
  TeamRoster,
  MatchupDetails,
  LeagueMatchups,

  // Simulation types
  ScoreDistribution,
  SimulationData,
  ScoreBoxPlotProps,
  SimulationRequest,
  SimulationResponse,

  // Odds types
  MatchupOddsData,
  MatchupOddsPreviewProps,
  TeamOdds,
  MatchupOdds,
  LeagueWideOdds,
  LeagueWideOddsProps,
  OddsPreview,

  // Live updates
  LiveMatchupUpdate,
} from './types';
