import { logger } from './logger';
import type { LineupPlayer } from '@gauntlet/types';

/**
 * Validation error with structured details.
 */
export class ValidationError extends Error {
  constructor(
    message: string,
    public readonly field: string,
    public readonly value: unknown
  ) {
    super(message);
    this.name = 'ValidationError';
  }
}

/**
 * Valid NFL positions for fantasy football.
 */
export const VALID_POSITIONS = ['QB', 'RB', 'WR', 'TE', 'K', 'DEF', 'DST'] as const;

/**
 * Validate a LineupPlayer object.
 */
export const validateLineupPlayer = (player: LineupPlayer, index?: number): string[] => {
  const errors: string[] = [];
  const prefix = index !== undefined ? `Player[${index}]` : 'Player';

  if (!player.id || typeof player.id !== 'string') {
    errors.push(`${prefix}.id: required string`);
  }

  if (!VALID_POSITIONS.includes(player.position as (typeof VALID_POSITIONS)[number])) {
    errors.push(
      `${prefix}.position: must be one of ${VALID_POSITIONS.join(', ')} (got: ${player.position})`
    );
  }

  if (typeof player.projection !== 'number') {
    errors.push(`${prefix}.projection: required number`);
  } else {
    if (player.projection < 0) {
      errors.push(`${prefix}.projection: must be ≥ 0 (got: ${player.projection})`);
    }
    if (player.projection > 150) {
      errors.push(
        `${prefix}.projection: exceeds reasonable maximum of 150 (got: ${player.projection})`
      );
    }
  }

  // Optional fields validation
  if (player.currentScore !== undefined) {
    if (typeof player.currentScore !== 'number') {
      errors.push(`${prefix}.currentScore: must be number if provided`);
    }
    // Note: Negative scores are allowed (e.g., defenses can have negative scores)
  }

  if (player.nflTeam !== undefined && typeof player.nflTeam !== 'string') {
    errors.push(`${prefix}.nflTeam: must be string if provided`);
  }

  return errors;
};

/**
 * Validate iteration count for Monte Carlo simulation.
 */
export const validateIterations = (iterations: number): void => {
  if (!Number.isInteger(iterations)) {
    throw new ValidationError('Iterations must be an integer', 'iterations', iterations);
  }

  if (iterations < 10) {
    throw new ValidationError(
      'Iterations must be ≥ 10 for meaningful results',
      'iterations',
      iterations
    );
  }

  if (iterations > 100000) {
    logger.warn(
      {
        event: 'validation_warning',
        field: 'iterations',
        value: iterations,
        recommended: 10000,
      },
      `High iteration count (${iterations}) may cause performance issues. Recommended: 10,000`
    );
  }
};

/**
 * Validate game progress percentage.
 */
export const validateGameProgress = (gameProgress: number): void => {
  if (typeof gameProgress !== 'number') {
    throw new ValidationError('gameProgress must be a number', 'gameProgress', gameProgress);
  }

  if (gameProgress < 0 || gameProgress > 1) {
    throw new ValidationError(
      'gameProgress must be between 0 (start) and 1 (end)',
      'gameProgress',
      gameProgress
    );
  }
};

/**
 * Validate lineup players array.
 */
export const validateLineupPlayers = (
  players: LineupPlayer[],
  teamLabel: string = 'team'
): void => {
  if (!Array.isArray(players)) {
    throw new ValidationError(`${teamLabel} must be an array`, teamLabel, players);
  }

  if (players.length === 0) {
    throw new ValidationError(`${teamLabel} cannot be empty`, teamLabel, players);
  }

  // Collect all validation errors
  const allErrors: string[] = [];
  players.forEach((player, index) => {
    const errors = validateLineupPlayer(player, index);
    allErrors.push(...errors);
  });

  if (allErrors.length > 0) {
    const errorMessage = `${teamLabel} validation failed:\n  - ${allErrors.join('\n  - ')}`;
    logger.error(
      {
        event: 'lineup_validation_failed',
        team: teamLabel,
        errors: allErrors,
      },
      errorMessage
    );
    throw new ValidationError(errorMessage, teamLabel, players);
  }

  // Check for duplicate player IDs
  const playerIds = players.map(p => p.id);
  const duplicates = playerIds.filter((id, index) => playerIds.indexOf(id) !== index);

  if (duplicates.length > 0) {
    throw new ValidationError(
      `${teamLabel} contains duplicate player IDs: ${duplicates.join(', ')}`,
      teamLabel,
      duplicates
    );
  }
};

/**
 * Validate projection value.
 */
export const validateProjection = (projection: number, playerId?: string): void => {
  const label = playerId ? `Player ${playerId} projection` : 'Projection';

  if (typeof projection !== 'number') {
    throw new ValidationError(`${label} must be a number`, 'projection', projection);
  }

  if (projection < 0) {
    throw new ValidationError(`${label} must be ≥ 0`, 'projection', projection);
  }

  if (projection > 150) {
    logger.warn(
      {
        event: 'validation_warning',
        field: 'projection',
        value: projection,
        playerId,
      },
      `${label} exceeds typical maximum (150 points). This may indicate data error.`
    );
  }
};

/**
 * Validate NFL position code.
 */
export const validatePosition = (position: string): void => {
  if (!VALID_POSITIONS.includes(position as (typeof VALID_POSITIONS)[number])) {
    throw new ValidationError(
      `Position must be one of: ${VALID_POSITIONS.join(', ')}`,
      'position',
      position
    );
  }
};
