/**
 * Playoff hooks barrel export
 */

// Seeding simulation hook
export {
  usePlayoffSeeding,
  usePlayoffSeedingWithScenarios,
  formatSeedProbability,
  getSeedProbabilityColor,
  formatScenarioConditions,
} from './usePlayoffSeeding';

// Cross-league battle hook
export {
  useCrossLeagueBattle,
  formatWinProbability,
  getAfcColor,
  getNfcColor,
  formatExpectedWins,
  getMatchupFavorite,
  getMatchupIndicatorColor,
} from './useCrossLeagueBattle';

// Scenario builder hook
export {
  useWeek14Scenarios,
  getOutcomeLabel,
  getOutcomeButtonVariant,
} from './useWeek14Scenarios';
