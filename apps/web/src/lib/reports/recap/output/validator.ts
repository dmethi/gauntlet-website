/**
 * Report Output Validator
 *
 * Validates generated reports against schema and business rules.
 * Ensures data quality and completeness before saving.
 */

import type {
  WeeklyRecapReport,
  ValidationResult,
  ValidationError,
  ValidationWarning,
} from '../types';

/**
 * Validate a complete WeeklyRecapReport structure.
 * Returns validation results with errors and warnings.
 */
export const validateReport = (report: WeeklyRecapReport): ValidationResult => {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];

  // Validate metadata
  validateMetadata(report.metadata, errors, warnings);

  // Validate sections
  validateLeagueOverview(report.sections.leagueOverview, errors, warnings);
  validateMatchupNarratives(report.sections.matchupNarratives, errors, warnings);
  validateHallOfFame(report.sections.hallOfFame, errors, warnings);
  validateHallOfShame(report.sections.hallOfShame, errors, warnings);
  validatePowerRankings(report.sections.powerRankings, errors, warnings);
  validateStandings(report.sections.standings, errors, warnings);
  validateUpcoming(report.sections.upcoming, errors, warnings);
  validateClosing(report.sections.closing, errors, warnings);

  // Calculate quality score (0-100)
  const score = calculateQualityScore(errors, warnings);

  return {
    isValid: errors.filter(e => e.severity === 'critical').length === 0,
    errors,
    warnings,
    score,
  };
};

/**
 * Validate metadata section.
 */
const validateMetadata = (
  metadata: WeeklyRecapReport['metadata'],
  errors: ValidationError[],
  warnings: ValidationWarning[],
): void => {
  // Week number validation
  if (metadata.week < 1 || metadata.week > 18) {
    errors.push({
      type: 'invalid_name',
      message: `Invalid week number: ${metadata.week} (must be 1-18)`,
      location: 'metadata.week',
      severity: 'critical',
    });
  }

  // Season validation
  if (metadata.season < 2024 || metadata.season > 2030) {
    errors.push({
      type: 'invalid_name',
      message: `Invalid season: ${metadata.season}`,
      location: 'metadata.season',
      severity: 'major',
    });
  }

  // Generation time validation
  if (metadata.generationTime <= 0) {
    warnings.push({
      type: 'accuracy',
      message: 'Generation time appears incorrect',
      location: 'metadata.generationTime',
    });
  }

  // Token usage validation
  if (metadata.tokensUsed < 0) {
    warnings.push({
      type: 'accuracy',
      message: 'Token usage appears incorrect',
      location: 'metadata.tokensUsed',
    });
  }

  // Status validation with errors
  if (metadata.status === 'failed' && (!metadata.errors || metadata.errors.length === 0)) {
    warnings.push({
      type: 'completeness',
      message: 'Report marked as failed but no errors listed',
      location: 'metadata.errors',
    });
  }

  if (metadata.status === 'partial' && (!metadata.errors || metadata.errors.length === 0)) {
    warnings.push({
      type: 'completeness',
      message: 'Report marked as partial but no errors listed',
      location: 'metadata.errors',
    });
  }
};

/**
 * Validate League Overview section.
 */
const validateLeagueOverview = (
  section: WeeklyRecapReport['sections']['leagueOverview'],
  errors: ValidationError[],
  warnings: ValidationWarning[],
): void => {
  if (!section.narrative || section.narrative.length < 50) {
    errors.push({
      type: 'missing_data',
      message: 'League overview narrative is too short or missing',
      location: 'sections.leagueOverview.narrative',
      severity: 'major',
    });
  }

  // Validate stats
  if (section.stats.totalGames !== 12) {
    warnings.push({
      type: 'accuracy',
      message: `Expected 12 total games, got ${section.stats.totalGames}`,
      location: 'sections.leagueOverview.stats.totalGames',
    });
  }

  if (section.stats.highestScore < section.stats.lowestScore) {
    errors.push({
      type: 'score_mismatch',
      message: 'Highest score is less than lowest score',
      location: 'sections.leagueOverview.stats',
      severity: 'critical',
    });
  }
};

/**
 * Validate Matchup Narratives section.
 */
const validateMatchupNarratives = (
  sections: WeeklyRecapReport['sections']['matchupNarratives'],
  errors: ValidationError[],
  warnings: ValidationWarning[],
): void => {
  if (!sections || sections.length === 0) {
    errors.push({
      type: 'missing_data',
      message: 'No matchup narratives found',
      location: 'sections.matchupNarratives',
      severity: 'major',
    });
    return;
  }

  if (sections.length !== 12) {
    warnings.push({
      type: 'completeness',
      message: `Expected 12 matchup narratives, got ${sections.length}`,
      location: 'sections.matchupNarratives',
      suggestion: 'Verify all matchups are included for both AFC and NFC leagues',
    });
  }

  sections.forEach((matchup, index) => {
    // Validate narrative content
    if (!matchup.narrative || matchup.narrative.length < 50) {
      errors.push({
        type: 'missing_data',
        message: `Matchup narrative ${matchup.matchupId} is too short or missing`,
        location: `sections.matchupNarratives[${index}].narrative`,
        severity: 'minor',
      });
    }

    // Validate box score
    if (matchup.boxScore.finalScore.team1 === 0 && matchup.boxScore.finalScore.team2 === 0) {
      warnings.push({
        type: 'accuracy',
        message: `Matchup ${matchup.matchupId} has zero scores`,
        location: `sections.matchupNarratives[${index}].boxScore`,
      });
    }
  });
};

/**
 * Validate Hall of Fame section.
 */
const validateHallOfFame = (
  section: WeeklyRecapReport['sections']['hallOfFame'],
  errors: ValidationError[],
  warnings: ValidationWarning[],
): void => {
  if (!section.narrative || section.narrative.length < 50) {
    errors.push({
      type: 'missing_data',
      message: 'Hall of Fame narrative is too short or missing',
      location: 'sections.hallOfFame.narrative',
      severity: 'major',
    });
  }

  // Check for position performer data
  const positions = ['QB', 'RB', 'WR', 'TE', 'K', 'DEF'] as const;
  const emptyPositions = positions.filter(
    pos => section.highlights.topPerformers[pos].length === 0,
  );

  if (emptyPositions.length === positions.length) {
    warnings.push({
      type: 'completeness',
      message: 'No top performers data available',
      location: 'sections.hallOfFame.highlights.topPerformers',
    });
  }
};

/**
 * Validate Hall of Shame section.
 */
const validateHallOfShame = (
  section: WeeklyRecapReport['sections']['hallOfShame'],
  errors: ValidationError[],
  warnings: ValidationWarning[],
): void => {
  if (!section.narrative || section.narrative.length < 50) {
    errors.push({
      type: 'missing_data',
      message: 'Hall of Shame narrative is too short or missing',
      location: 'sections.hallOfShame.narrative',
      severity: 'major',
    });
  }
};

/**
 * Validate Power Rankings section.
 */
const validatePowerRankings = (
  section: WeeklyRecapReport['sections']['powerRankings'],
  errors: ValidationError[],
  warnings: ValidationWarning[],
): void => {
  if (!section.narrative || section.narrative.length < 50) {
    errors.push({
      type: 'missing_data',
      message: 'Power Rankings narrative is too short or missing',
      location: 'sections.powerRankings.narrative',
      severity: 'major',
    });
  }

  if (section.rankings.length > 0 && section.rankings.length !== 24) {
    warnings.push({
      type: 'completeness',
      message: `Expected 24 teams in power rankings, got ${section.rankings.length}`,
      location: 'sections.powerRankings.rankings',
    });
  }
};

/**
 * Validate Standings section.
 */
const validateStandings = (
  section: WeeklyRecapReport['sections']['standings'],
  errors: ValidationError[],
  warnings: ValidationWarning[],
): void => {
  if (!section.narrative || section.narrative.length < 50) {
    errors.push({
      type: 'missing_data',
      message: 'Standings narrative is too short or missing',
      location: 'sections.standings.narrative',
      severity: 'major',
    });
  }

  const afcTeams = section.standings.afc.length;
  const nfcTeams = section.standings.nfc.length;

  if (afcTeams > 0 && afcTeams !== 12) {
    warnings.push({
      type: 'completeness',
      message: `Expected 12 AFC teams, got ${afcTeams}`,
      location: 'sections.standings.standings.afc',
    });
  }

  if (nfcTeams > 0 && nfcTeams !== 12) {
    warnings.push({
      type: 'completeness',
      message: `Expected 12 NFC teams, got ${nfcTeams}`,
      location: 'sections.standings.standings.nfc',
    });
  }
};

/**
 * Validate Upcoming Matchups section.
 */
const validateUpcoming = (
  section: WeeklyRecapReport['sections']['upcoming'],
  errors: ValidationError[],
  warnings: ValidationWarning[],
): void => {
  if (!section.narrative || section.narrative.length < 50) {
    errors.push({
      type: 'missing_data',
      message: 'Upcoming matchups narrative is too short or missing',
      location: 'sections.upcoming.narrative',
      severity: 'major',
    });
  }
};

/**
 * Validate Closing Commentary section.
 */
const validateClosing = (
  section: WeeklyRecapReport['sections']['closing'],
  errors: ValidationError[],
  warnings: ValidationWarning[],
): void => {
  if (!section.narrative || section.narrative.length < 50) {
    errors.push({
      type: 'missing_data',
      message: 'Closing commentary is too short or missing',
      location: 'sections.closing.narrative',
      severity: 'major',
    });
  }

  // Check for excessive length
  if (section.narrative.length > 2000) {
    warnings.push({
      type: 'style',
      message: 'Closing commentary is longer than recommended (max 150 words)',
      location: 'sections.closing.narrative',
    });
  }
};

/**
 * Calculate quality score based on errors and warnings.
 * Score ranges from 0-100, with 100 being perfect.
 */
const calculateQualityScore = (
  errors: ValidationError[],
  warnings: ValidationWarning[],
): number => {
  let score = 100;

  // Deduct points for errors
  errors.forEach(error => {
    switch (error.severity) {
      case 'critical':
        score -= 20;
        break;
      case 'major':
        score -= 10;
        break;
      case 'minor':
        score -= 5;
        break;
    }
  });

  // Deduct points for warnings
  score -= warnings.length * 2;

  return Math.max(0, score);
};

/**
 * Check if report is ready for production use.
 * Returns true if no critical errors and score >= 70.
 */
export const isProductionReady = (validation: ValidationResult): boolean => {
  const hasCriticalErrors = validation.errors.some(e => e.severity === 'critical');
  return !hasCriticalErrors && validation.score >= 70;
};

/**
 * Generate human-readable validation summary.
 */
export const summarizeValidation = (validation: ValidationResult): string => {
  const lines: string[] = [];

  lines.push(`Validation Score: ${validation.score}/100`);
  lines.push(`Status: ${validation.isValid ? '✅ Valid' : '❌ Invalid'}`);

  if (validation.errors.length > 0) {
    lines.push(`\nErrors (${validation.errors.length}):`);
    validation.errors.forEach(error => {
      lines.push(`  [${error.severity.toUpperCase()}] ${error.location}: ${error.message}`);
    });
  }

  if (validation.warnings.length > 0) {
    lines.push(`\nWarnings (${validation.warnings.length}):`);
    validation.warnings.forEach(warning => {
      lines.push(`  [${warning.type}] ${warning.location}: ${warning.message}`);
    });
  }

  return lines.join('\n');
};
