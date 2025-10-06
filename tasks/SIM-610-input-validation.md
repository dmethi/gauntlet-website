# Task SIM-610: Add Input Validation

**Category:** RESILIENCE  
**Priority:** 🟡 MEDIUM  
**Estimated Time:** 30 minutes  
**Package:** apps/sim-engine

---

## 📋 Overview

Add comprehensive input validation to all simulation functions. Validate early before expensive Monte Carlo operations to provide clear error messages and prevent invalid simulations.

---

## 🎯 Objective

Create validation functions for all input types (LineupPlayer, iterations, gameProgress, positions) and call them at function entry points with descriptive error messages.

---

## 📂 Context Needed

**Files to Read:**
- `apps/sim-engine/src/models/matchup.ts` (line 136) - simulateMatchupProbabilityFromPlayers
- `apps/sim-engine/src/models/variance.ts` (lines 334-346) - samplePlayerScoreFromContext validation

**Files to Create:**
- `apps/sim-engine/src/lib/validation.ts` - Validation functions

**Files to Update:**
- `apps/sim-engine/src/models/matchup.ts` - Add validation calls
- `apps/sim-engine/src/models/variance.ts` - Enhance existing validation

---

## 📝 Steps

### 1. Create Validation Utilities

Create `apps/sim-engine/src/lib/validation.ts`:

```typescript
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

  if (!VALID_POSITIONS.includes(player.position as any)) {
    errors.push(`${prefix}.position: must be one of ${VALID_POSITIONS.join(', ')} (got: ${player.position})`);
  }

  if (typeof player.projection !== 'number') {
    errors.push(`${prefix}.projection: required number`);
  } else {
    if (player.projection < 0) {
      errors.push(`${prefix}.projection: must be ≥ 0 (got: ${player.projection})`);
    }
    if (player.projection > 150) {
      errors.push(`${prefix}.projection: exceeds reasonable maximum of 150 (got: ${player.projection})`);
    }
  }

  // Optional fields validation
  if (player.currentScore !== undefined) {
    if (typeof player.currentScore !== 'number') {
      errors.push(`${prefix}.currentScore: must be number if provided`);
    } else if (player.currentScore < 0) {
      errors.push(`${prefix}.currentScore: must be ≥ 0 (got: ${player.currentScore})`);
    }
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
    throw new ValidationError(
      'Iterations must be an integer',
      'iterations',
      iterations
    );
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
    throw new ValidationError(
      'gameProgress must be a number',
      'gameProgress',
      gameProgress
    );
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
    throw new ValidationError(
      `${teamLabel} must be an array`,
      teamLabel,
      players
    );
  }

  if (players.length === 0) {
    throw new ValidationError(
      `${teamLabel} cannot be empty`,
      teamLabel,
      players
    );
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
    throw new ValidationError(
      `${label} must be a number`,
      'projection',
      projection
    );
  }

  if (projection < 0) {
    throw new ValidationError(
      `${label} must be ≥ 0`,
      'projection',
      projection
    );
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
  if (!VALID_POSITIONS.includes(position as any)) {
    throw new ValidationError(
      `Position must be one of: ${VALID_POSITIONS.join(', ')}`,
      'position',
      position
    );
  }
};
```

### 2. Add Validation to simulateMatchupProbabilityFromPlayers

Update `apps/sim-engine/src/models/matchup.ts`:

```typescript
import {
  validateLineupPlayers,
  validateIterations,
  validateGameProgress,
} from '../lib/validation';

export const simulateMatchupProbabilityFromPlayers = async (
  team1Players: LineupPlayer[],
  team2Players: LineupPlayer[],
  iterations: number = 10000,
  gameProgress: number = 0,
  liveNflTeams?: Set<string>,
  metrics?: Metrics
): Promise<MatchupSimulationResult> => {
  // Validate inputs before expensive operations
  validateLineupPlayers(team1Players, 'team1Players');
  validateLineupPlayers(team2Players, 'team2Players');
  validateIterations(iterations);
  validateGameProgress(gameProgress);

  // Log validation success
  logger.debug(
    {
      event: 'simulation_validation_passed',
      team1Count: team1Players.length,
      team2Count: team2Players.length,
      iterations,
      gameProgress,
    },
    'Input validation passed'
  );

  // ... rest of existing simulation logic ...
};
```

### 3. Enhance Existing Validation in samplePlayerScoreFromContext

Update `apps/sim-engine/src/models/variance.ts`:

```typescript
import { validateProjection, validateGameProgress, validatePosition } from '../lib/validation';

export const samplePlayerScoreFromContext = (
  ctx: SamplingContext,
  playerId: string,
  position: string,
  projection: number,
  gameProgress: number = 0
): number => {
  // Use centralized validation
  validateProjection(projection, playerId);
  validateGameProgress(gameProgress);
  validatePosition(position);

  // ... rest of existing logic ...
};
```

### 4. Add Validation to buildSamplingContext

Update `apps/sim-engine/src/models/variance.ts`:

```typescript
import { validatePosition, ValidationError } from '../lib/validation';

export const buildSamplingContext = async (
  playerIds: string[],
  positions: string[],
  metrics?: Metrics
): Promise<SamplingContext> => {
  // Validate inputs
  if (!Array.isArray(playerIds) || playerIds.length === 0) {
    throw new ValidationError(
      'playerIds must be non-empty array',
      'playerIds',
      playerIds
    );
  }

  if (!Array.isArray(positions) || positions.length === 0) {
    throw new ValidationError(
      'positions must be non-empty array',
      'positions',
      positions
    );
  }

  // Validate all positions
  positions.forEach(pos => validatePosition(pos));

  // ... rest of existing logic ...
};
```

### 5. Export Validation Utilities

Update `apps/sim-engine/src/index.ts`:

```typescript
// Validation utilities
export {
  ValidationError,
  validateLineupPlayer,
  validateLineupPlayers,
  validateIterations,
  validateGameProgress,
  validateProjection,
  validatePosition,
  VALID_POSITIONS,
} from './lib/validation';
```

### 6. Add Validation Tests

Create `src/lib/__tests__/validation.test.ts`:

```typescript
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
});

describe('validateIterations', () => {
  it('should pass for valid iterations', () => {
    expect(() => validateIterations(10000)).not.toThrow();
  });

  it('should fail for non-integer', () => {
    expect(() => validateIterations(10.5)).toThrow(ValidationError);
  });

  it('should fail for too few iterations', () => {
    expect(() => validateIterations(5)).toThrow(ValidationError);
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
});

describe('validateLineupPlayers', () => {
  const validPlayers: LineupPlayer[] = [
    { id: '1', position: 'QB', projection: 24 },
    { id: '2', position: 'RB', projection: 15 },
  ];

  it('should pass for valid lineup', () => {
    expect(() => validateLineupPlayers(validPlayers)).not.toThrow();
  });

  it('should fail for empty array', () => {
    expect(() => validateLineupPlayers([])).toThrow(ValidationError);
  });

  it('should fail for duplicate player IDs', () => {
    const duplicates: LineupPlayer[] = [
      { id: '1', position: 'QB', projection: 24 },
      { id: '1', position: 'RB', projection: 15 }, // Same ID!
    ];

    expect(() => validateLineupPlayers(duplicates)).toThrow(ValidationError);
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
  });

  it('should fail for invalid position', () => {
    expect(() => validatePosition('INVALID')).toThrow(ValidationError);
  });
});
```

### 7. Add Integration Tests

Add to `src/models/__tests__/matchup.test.ts`:

```typescript
describe('simulateMatchupProbabilityFromPlayers validation', () => {
  it('should throw ValidationError for invalid team1', async () => {
    const invalidTeam: LineupPlayer[] = [
      { id: '1', position: 'INVALID' as any, projection: 24 },
    ];

    await expect(
      simulateMatchupProbabilityFromPlayers(invalidTeam, mockTeam2Players, 100)
    ).rejects.toThrow(ValidationError);
  });

  it('should throw ValidationError for duplicate players', async () => {
    const duplicates: LineupPlayer[] = [
      { id: '1', position: 'QB', projection: 24 },
      { id: '1', position: 'RB', projection: 15 },
    ];

    await expect(
      simulateMatchupProbabilityFromPlayers(duplicates, mockTeam2Players, 100)
    ).rejects.toThrow(ValidationError);
  });

  it('should throw ValidationError for invalid iterations', async () => {
    await expect(
      simulateMatchupProbabilityFromPlayers(mockTeam1Players, mockTeam2Players, -1)
    ).rejects.toThrow(ValidationError);
  });

  it('should throw ValidationError for invalid gameProgress', async () => {
    await expect(
      simulateMatchupProbabilityFromPlayers(mockTeam1Players, mockTeam2Players, 100, 1.5)
    ).rejects.toThrow(ValidationError);
  });
});
```

### 8. Verify Build and Tests

```bash
pnpm build
pnpm test
```

---

## ✅ Acceptance Criteria

- [ ] `src/lib/validation.ts` created with 7 validation functions
- [ ] ValidationError custom error class created
- [ ] Validation added to 3 main functions:
  - simulateMatchupProbabilityFromPlayers
  - buildSamplingContext
  - samplePlayerScoreFromContext
- [ ] Early validation before expensive operations
- [ ] Descriptive error messages with field names and values
- [ ] Validation utilities exported from barrel file
- [ ] 20+ validation tests cover all edge cases
- [ ] Integration tests verify validation in simulation flow
- [ ] `pnpm build` passes with 0 errors
- [ ] Validation errors logged with structured data

---

## 🔗 Related Tasks

**Depends On:**
- SIM-607: Add Structured Logging (validation logs events)

**Blocks:** None

---

## 📊 Context Usage

- **Files to read:** 2 files (~300 lines)
- **Files to create:** 2 files (~400 lines)
- **Files to update:** 2 files (~50 lines changes)
- **Time estimate:** 30 minutes

---

## 🚀 Cursor Prompt

```
I'm working on SIM-610. Please:

1. Create src/lib/validation.ts with 7 validation functions
2. Add ValidationError custom error class
3. Add validation to simulateMatchupProbabilityFromPlayers
4. Add validation to buildSamplingContext
5. Enhance validation in samplePlayerScoreFromContext
6. Export validation utilities from barrel
7. Create validation.test.ts with 20+ tests
8. Add integration tests to matchup.test.ts
9. Verify with pnpm build and pnpm test

Follow the task steps exactly.
```

---

## ✓ Verification Commands

```bash
# Verify TypeScript compilation
cd apps/sim-engine
pnpm build

# Verify tests pass
pnpm test

# Test validation errors
node -e "
const { simulateMatchupProbabilityFromPlayers } = require('./dist/src/index.js');
// Try invalid input
simulateMatchupProbabilityFromPlayers([], [], -1).catch(err => {
  console.log('Validation caught:', err.message);
});
"
```

---

## 📝 Commit Message Template

```
feat(sim-engine): add comprehensive input validation (SIM-610)

- Create validation.ts with 7 validation functions
- Add ValidationError custom error class
- Validate lineup players: positions, projections, duplicate IDs
- Validate iterations: integer, ≥10, warn if >100K
- Validate gameProgress: 0-1 range
- Validate projections: ≥0, warn if >150
- Add early validation before expensive operations
- Descriptive error messages with field names and values
- Export validation utilities from barrel
- 20+ tests cover all validation edge cases
- Integration tests verify simulation validation flow
- Structured logging for validation failures
- TypeScript compilation passes with 0 errors

Part of sim-engine enterprise readiness initiative
```

