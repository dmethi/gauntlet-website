/**
 * Playoff bracket feature
 * Playoff bracket visualization and management
 */

// Export types
export type {
  Matchup,
  Roster,
  LeagueData,
  PlayoffMatchup,
  PlayoffBracket,
  BracketTeam,
  MatchupResult,
  MatchupProps,
  PlayoffBracketProps,
  // Scenarios types
  TeamStanding,
  Week14Matchup,
  TeamScoringDistribution,
  SeedingSimulationResult,
  SeedScenario,
  ScenarioCondition,
  TeamSeedingProbabilities,
  LeagueSeedingResults,
  CrossLeagueMatchup,
  CrossLeagueBattleResults,
  LockedOutcome,
  ScenarioBuilderState,
  SeedingSimulationConfig,
  CrossLeagueSimulationConfig,
} from './types';

export * from './components';

// Export scenario hooks
export * from './hooks';
