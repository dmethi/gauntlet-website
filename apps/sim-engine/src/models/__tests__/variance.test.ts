import { describe, it, expect } from 'vitest';
import {
  buildSamplingContext,
  samplePlayerScoreFromContext,
  simulatePlayerScore,
  simulatePlayerRange,
  getVarianceModel,
  buildSamplingContextSafe,
} from '../variance';
import { isOk, isErr } from '../../lib/result';

// Helper function for standard deviation
const standardDeviation = (values: number[]): number => {
  const mean = values.reduce((a, b) => a + b) / values.length;
  const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
  return Math.sqrt(variance);
};

describe('buildSamplingContext', () => {
  it('should fetch position and player distributions', async () => {
    const ctx = await buildSamplingContext(['4866'], ['QB']);

    expect(ctx.positionToOutcomes.has('QB')).toBe(true);
    expect(ctx.playerToOutcomes.has('4866')).toBe(true);
    expect(ctx.playerSampleCounts.has('4866')).toBe(true);
  });

  it('should handle multiple players and positions', async () => {
    const ctx = await buildSamplingContext(['4866', '7564', '8110'], ['QB', 'RB', 'WR']);

    expect(ctx.positionToOutcomes.size).toBeGreaterThanOrEqual(3);
    expect(ctx.playerToOutcomes.size).toBeGreaterThanOrEqual(3);
  });

  it('should deduplicate player IDs and positions', async () => {
    const ctx = await buildSamplingContext(
      ['4866', '4866', '4866'], // Duplicates
      ['QB', 'QB', 'QB']
    );

    expect(ctx.positionToOutcomes.size).toBe(1);
  });

  it('should return Maps with correct types', async () => {
    const ctx = await buildSamplingContext(['4866'], ['QB']);

    expect(ctx.positionToOutcomes).toBeInstanceOf(Map);
    expect(ctx.playerToOutcomes).toBeInstanceOf(Map);
    expect(ctx.playerSampleCounts).toBeInstanceOf(Map);
    expect(ctx.positionSampleCounts).toBeInstanceOf(Map);
  });
});

describe('samplePlayerScoreFromContext', () => {
  it('should return score close to projection', async () => {
    const ctx = await buildSamplingContext(['4866'], ['QB']);
    const projection = 24.5;
    const score = samplePlayerScoreFromContext(ctx, '4866', 'QB', projection);

    // Score should be within reasonable range (0.3x to 2.5x projection)
    expect(score).toBeGreaterThan(projection * 0.3);
    expect(score).toBeLessThan(projection * 2.5);
  });

  it('should reduce variance with gameProgress', async () => {
    const ctx = await buildSamplingContext(['4866'], ['QB']);
    const projection = 24.5;

    // Sample many times to check variance reduction
    const scores0 = Array.from({ length: 100 }, () =>
      samplePlayerScoreFromContext(ctx, '4866', 'QB', projection, 0)
    );
    const scores90 = Array.from({ length: 100 }, () =>
      samplePlayerScoreFromContext(ctx, '4866', 'QB', projection, 0.9)
    );

    const stdDev0 = standardDeviation(scores0);
    const stdDev90 = standardDeviation(scores90);

    expect(stdDev90).toBeLessThan(stdDev0);
  });

  it('should throw error for negative projection', async () => {
    const ctx = await buildSamplingContext(['4866'], ['QB']);
    expect(() => samplePlayerScoreFromContext(ctx, '4866', 'QB', -5)).toThrow('must be ≥ 0');
  });

  it('should throw error for invalid gameProgress', async () => {
    const ctx = await buildSamplingContext(['4866'], ['QB']);
    expect(() => samplePlayerScoreFromContext(ctx, '4866', 'QB', 20, 1.5)).toThrow(
      'must be between 0'
    );
  });

  it('should return zero for zero projection', async () => {
    const ctx = await buildSamplingContext(['4866'], ['QB']);
    const score = samplePlayerScoreFromContext(ctx, '4866', 'QB', 0);

    expect(score).toBe(0);
  });

  it('should fall back to position variance for unknown player', async () => {
    const ctx = await buildSamplingContext(['UNKNOWN_PLAYER'], ['QB']);
    const projection = 24.5;
    const score = samplePlayerScoreFromContext(ctx, 'UNKNOWN_PLAYER', 'QB', projection);

    // Should still return valid score using position variance
    expect(score).toBeGreaterThan(0);
    expect(score).toBeLessThan(projection * 3);
  });

  it('should have position variance for all common positions', async () => {
    const positions = ['QB', 'RB', 'WR', 'TE', 'K', 'DEF'];
    const ctx = await buildSamplingContext(['test'], positions);

    for (const pos of positions) {
      expect(ctx.positionToOutcomes.has(pos)).toBe(true);
      expect(ctx.positionToOutcomes.get(pos)?.length).toBeGreaterThan(0);
    }
  });

  it('should return projection when gameProgress is 1', async () => {
    const ctx = await buildSamplingContext(['4866'], ['QB']);
    const projection = 24.5;

    // With full game progress, variance should be eliminated
    const scores = Array.from({ length: 50 }, () =>
      samplePlayerScoreFromContext(ctx, '4866', 'QB', projection, 1)
    );

    // All scores should be very close to projection
    scores.forEach(score => {
      expect(Math.abs(score - projection)).toBeLessThan(0.1);
    });
  });

  it('should handle large projections correctly', async () => {
    const ctx = await buildSamplingContext(['4866'], ['QB']);
    const largeProjection = 150;
    const score = samplePlayerScoreFromContext(ctx, '4866', 'QB', largeProjection);

    expect(score).toBeGreaterThan(0);
    expect(score).toBeLessThan(largeProjection * 3);
  });

  it('should handle small projections correctly', async () => {
    const ctx = await buildSamplingContext(['4866'], ['QB']);
    const smallProjection = 0.5;
    const score = samplePlayerScoreFromContext(ctx, '4866', 'QB', smallProjection);

    expect(score).toBeGreaterThanOrEqual(0);
    expect(score).toBeLessThan(10);
  });

  it('should produce varying results on multiple calls', async () => {
    const ctx = await buildSamplingContext(['4866'], ['QB']);
    const projection = 24.5;

    const scores = Array.from({ length: 20 }, () =>
      samplePlayerScoreFromContext(ctx, '4866', 'QB', projection)
    );

    // Not all scores should be identical (variance should exist)
    const uniqueScores = new Set(scores);
    expect(uniqueScores.size).toBeGreaterThan(1);
  });

  it('should complete 10000 samples in reasonable time', () => {
    const startTime = Date.now();

    // Synchronous sampling should be fast
    const ctx = buildSamplingContext(['4866'], ['QB']);
    ctx.then(context => {
      for (let i = 0; i < 10000; i++) {
        samplePlayerScoreFromContext(context, '4866', 'QB', 24.5);
      }

      const duration = Date.now() - startTime;
      expect(duration).toBeLessThan(200); // Should complete in <200ms
    });
  });
});

describe('simulatePlayerScore', () => {
  it('should return simulated score for player', async () => {
    const score = await simulatePlayerScore('4866', 'QB', 24.5);
    expect(score).toBeGreaterThan(0);
    expect(score).toBeLessThan(100);
  });

  it('should validate negative projection', async () => {
    await expect(simulatePlayerScore('4866', 'QB', -10)).rejects.toThrow('Invalid projection');
  });

  it('should validate invalid gameProgress', async () => {
    await expect(simulatePlayerScore('4866', 'QB', 20, 1.5)).rejects.toThrow(
      'Invalid game progress'
    );
  });
});

describe('simulatePlayerRange', () => {
  it('should return percentile distribution', async () => {
    const model = await simulatePlayerRange('4866', 'QB', 24.5, 100);

    expect(model.p10).toBeLessThan(model.p25);
    expect(model.p25).toBeLessThan(model.median);
    expect(model.median).toBeLessThan(model.p75);
    expect(model.p75).toBeLessThan(model.p90);
    expect(model.mean).toBeGreaterThan(0);
  });

  it('should include sample size metadata', async () => {
    const model = await simulatePlayerRange('4866', 'QB', 24.5, 100);

    expect(model.positionDist.sampleSize).toBeGreaterThanOrEqual(0);
    expect(model.playerOutcomes.sampleSize).toBeGreaterThanOrEqual(0);
  });
});

describe('getVarianceModel', () => {
  it('should return percentile distribution', async () => {
    const model = await getVarianceModel('4866', 'QB', 24.5);

    expect(model.p10).toBeLessThan(model.p25);
    expect(model.p25).toBeLessThan(model.median);
    expect(model.median).toBeLessThan(model.p75);
    expect(model.p75).toBeLessThan(model.p90);
    expect(model.mean).toBeGreaterThan(0);
  });

  it('should include sample size metadata', async () => {
    const model = await getVarianceModel('4866', 'QB', 24.5);

    expect(model.positionDist.sampleSize).toBeGreaterThanOrEqual(0);
    expect(model.playerOutcomes.sampleSize).toBeGreaterThanOrEqual(0);
  });
});

describe('buildSamplingContextSafe', () => {
  it('should return Ok result on success', async () => {
    const result = await buildSamplingContextSafe(['4866', '7564'], ['QB', 'RB']);

    expect(isOk(result)).toBe(true);
    if (result.ok) {
      expect(result.value.positionToOutcomes.size).toBeGreaterThan(0);
      expect(result.value.playerToOutcomes.size).toBeGreaterThan(0);
    }
  });

  it('should return Err result on failure', async () => {
    // With invalid inputs like empty arrays, validation catches the error
    const result = await buildSamplingContextSafe([], []);

    // The safe wrapper catches ValidationError and returns Err
    expect(isErr(result)).toBe(true);
    if (!result.ok) {
      expect(result.error).toBeInstanceOf(Error);
      expect(result.error.message).toContain('sampling context');
    }
  });

  it('should allow functional composition with Result', async () => {
    const result = await buildSamplingContextSafe(['4866'], ['QB']);

    // Functional style error handling
    const ctx = result.ok ? result.value : null;
    expect(ctx).not.toBeNull();
    if (ctx) {
      expect(ctx.positionToOutcomes.size).toBeGreaterThan(0);
    }
  });
});
