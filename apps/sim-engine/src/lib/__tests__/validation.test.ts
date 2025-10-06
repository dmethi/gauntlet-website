import { describe, it, expect } from 'vitest';
import {
  ValidationError,
  validateLineupPlayer,
  validateLineupPlayers,
  validateIterations,
  validateGameProgress,
  validateProjection,
  validatePosition,
} from '../validation';
import type { LineupPlayer } from '@gauntlet/types';

describe('validateLineupPlayer', () => {
  it('should pass for valid player', () => {
    const player: LineupPlayer = {
      id: '4866',
      position: 'QB',
      projection: 24.5,
    };

    const errors = validateLineupPlayer(player);
    expect(errors).toHaveLength(0);
  });

  it('should fail for invalid position', () => {
    const player: LineupPlayer = {
      id: '4866',
      position: 'INVALID' as any,
      projection: 24.5,
    };

    const errors = validateLineupPlayer(player);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0]).toContain('position');
  });

  it('should fail for negative projection', () => {
    const player: LineupPlayer = {
      id: '4866',
      position: 'QB',
      projection: -10,
    };

    const errors = validateLineupPlayer(player);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0]).toContain('projection');
  });

  it('should fail for excessive projection', () => {
    const player: LineupPlayer = {
      id: '4866',
      position: 'QB',
      projection: 200, // Unrealistic
    };

    const errors = validateLineupPlayer(player);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0]).toContain('projection');
  });

  it('should fail for missing id', () => {
    const player: LineupPlayer = {
      id: '' as any,
      position: 'QB',
      projection: 24.5,
    };

    const errors = validateLineupPlayer(player);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0]).toContain('id');
  });

  it('should pass for valid player with optional fields', () => {
    const player: LineupPlayer = {
      id: '4866',
      position: 'QB',
      projection: 24.5,
      currentScore: 15.2,
      nflTeam: 'KC',
    };

    const errors = validateLineupPlayer(player);
    expect(errors).toHaveLength(0);
  });

  it('should fail for negative currentScore', () => {
    const player: LineupPlayer = {
      id: '4866',
      position: 'QB',
      projection: 24.5,
      currentScore: -5,
    };

    const errors = validateLineupPlayer(player);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0]).toContain('currentScore');
  });
});

describe('validateIterations', () => {
  it('should pass for valid iterations', () => {
    expect(() => validateIterations(10000)).not.toThrow();
  });

  it('should pass for minimum iterations', () => {
    expect(() => validateIterations(10)).not.toThrow();
  });

  it('should fail for non-integer', () => {
    expect(() => validateIterations(10.5)).toThrow(ValidationError);
  });

  it('should fail for too few iterations', () => {
    expect(() => validateIterations(5)).toThrow(ValidationError);
    expect(() => validateIterations(5)).toThrow('must be ≥ 10');
  });

  it('should fail for negative iterations', () => {
    expect(() => validateIterations(-1)).toThrow(ValidationError);
  });

  it('should warn for high iterations', () => {
    // Should not throw, but will log warning
    expect(() => validateIterations(150000)).not.toThrow();
  });
});

describe('validateGameProgress', () => {
  it('should pass for valid progress', () => {
    expect(() => validateGameProgress(0.5)).not.toThrow();
    expect(() => validateGameProgress(0)).not.toThrow();
    expect(() => validateGameProgress(1)).not.toThrow();
  });

  it('should fail for out of range', () => {
    expect(() => validateGameProgress(-0.1)).toThrow(ValidationError);
    expect(() => validateGameProgress(1.1)).toThrow(ValidationError);
  });

  it('should fail for non-number', () => {
    expect(() => validateGameProgress('0.5' as any)).toThrow(ValidationError);
  });
});

describe('validateLineupPlayers', () => {
  const validPlayers: LineupPlayer[] = [
    { id: '1', position: 'QB', projection: 24 },
    { id: '2', position: 'RB', projection: 15 },
  ];

  it('should pass for valid lineup', () => {
    expect(() => validateLineupPlayers(validPlayers)).not.toThrow();
  });

  it('should fail for non-array', () => {
    expect(() => validateLineupPlayers({} as any)).toThrow(ValidationError);
  });

  it('should fail for empty array', () => {
    expect(() => validateLineupPlayers([])).toThrow(ValidationError);
    expect(() => validateLineupPlayers([])).toThrow('cannot be empty');
  });

  it('should fail for duplicate player IDs', () => {
    const duplicates: LineupPlayer[] = [
      { id: '1', position: 'QB', projection: 24 },
      { id: '1', position: 'RB', projection: 15 }, // Same ID!
    ];

    expect(() => validateLineupPlayers(duplicates)).toThrow(ValidationError);
    expect(() => validateLineupPlayers(duplicates)).toThrow('duplicate');
  });

  it('should fail for invalid players in array', () => {
    const invalidPlayers: LineupPlayer[] = [
      { id: '1', position: 'QB', projection: 24 },
      { id: '2', position: 'INVALID' as any, projection: 15 },
    ];

    expect(() => validateLineupPlayers(invalidPlayers)).toThrow(ValidationError);
  });

  it('should use custom team label in error messages', () => {
    expect(() => validateLineupPlayers([], 'customTeam')).toThrow('customTeam');
  });
});

describe('validateProjection', () => {
  it('should pass for valid projections', () => {
    expect(() => validateProjection(0)).not.toThrow();
    expect(() => validateProjection(24.5)).not.toThrow();
    expect(() => validateProjection(100)).not.toThrow();
  });

  it('should fail for negative projection', () => {
    expect(() => validateProjection(-10)).toThrow(ValidationError);
    expect(() => validateProjection(-10)).toThrow('must be ≥ 0');
  });

  it('should fail for non-number', () => {
    expect(() => validateProjection('24' as any)).toThrow(ValidationError);
  });

  it('should warn for high projection', () => {
    // Should not throw, but will log warning
    expect(() => validateProjection(200)).not.toThrow();
  });

  it('should include player ID in error message when provided', () => {
    try {
      validateProjection(-10, '4866');
      expect.fail('Should have thrown');
    } catch (error) {
      expect(error).toBeInstanceOf(ValidationError);
      expect((error as ValidationError).message).toContain('Player 4866');
    }
  });
});

describe('validatePosition', () => {
  it('should pass for valid positions', () => {
    expect(() => validatePosition('QB')).not.toThrow();
    expect(() => validatePosition('RB')).not.toThrow();
    expect(() => validatePosition('WR')).not.toThrow();
    expect(() => validatePosition('TE')).not.toThrow();
    expect(() => validatePosition('K')).not.toThrow();
    expect(() => validatePosition('DEF')).not.toThrow();
    expect(() => validatePosition('DST')).not.toThrow();
  });

  it('should fail for invalid position', () => {
    expect(() => validatePosition('INVALID')).toThrow(ValidationError);
    expect(() => validatePosition('INVALID')).toThrow('must be one of');
  });

  it('should fail for lowercase position', () => {
    expect(() => validatePosition('qb')).toThrow(ValidationError);
  });
});
