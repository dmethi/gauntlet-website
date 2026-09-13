/**
 * Matchups Feature
 * Exports all matchup-related types, components, and hooks for head-to-head matchups and simulations
 */

// Export components
export { MatchupSimulation } from './components';
export { MatchupOddsPreview } from './components';
export { SwingPointsDisplay } from './components';

// Export hooks
export { useMatchupTimeSeries, useMatchupOdds } from './hooks';
export { buildGauntletMatchupPath, buildSleeperMatchupUrl } from './matchup-links';
export { resolveMatchupTeamIdentity } from './team-identity';

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
  LeagueWideOddsType,
  LeagueWideOddsProps,
  OddsPreview,

  // Live updates
  LiveMatchupUpdate,
} from './types';
