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
  formatPathConditions,
  formatPathCount,
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

// Pre-generated scenario summaries (static, not dynamic)
export {
  useScenarioSummary,
  useLeagueSummaries,
  type ScenarioSummaryOutput,
  type CachedSummaries,
} from './useScenarioSummary';

// League-level summaries
export {
  useLeagueSummary,
  type LeagueSummary,
  type TeamPathData,
} from './useLeagueSummary';
