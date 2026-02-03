/**
 * Playoff Simulations Module
 *
 * Export all simulation utilities for playoff scenarios.
 * Note: These utilities run client-side and use the Sleeper API directly.
 * For more complex simulations using the sim-engine, use API routes.
 */

// Standings calculation
export {
  fetchCurrentStandings,
  fetchWeek14Matchups,
  calculatePlayoffSeeds,
  applyWeek14Results,
  getTeamsBySeed,
} from './standings-calculator';

// Seeding simulation
export { runSeedingSimulation, runBothLeagueSimulations } from './seeding-simulator';

// Cross-league battle simulation
export { runCrossLeagueBattle } from './cross-league-simulator';

// AI-powered scenario summarization
export {
  generateTeamScenarioSummary,
  generateLeagueScenarioSummaries,
  type ScenarioSummaryInput,
  type ScenarioSummaryOutput,
} from './scenario-summarizer';
