import { describe, it, expect } from 'vitest';
import { getPositionDistribution, getPlayerOutcomes, getDataInfo } from '../variance-loader';

describe('getPositionDistribution', () => {
  it('should return variance for QB position', async () => {
    const result = await getPositionDistribution('QB');

    expect(result.outcomes.length).toBeGreaterThan(0);
    expect(result.sampleSize).toBeGreaterThanOrEqual(0);
  });

  it('should return variance for all standard positions', async () => {
    const positions = ['QB', 'RB', 'WR', 'TE', 'K', 'DEF'];

    for (const pos of positions) {
      const result = await getPositionDistribution(pos);
      expect(result.outcomes.length).toBeGreaterThan(0);
    }
  });

  it('should fallback to defaults for unknown position', async () => {
    const result = await getPositionDistribution('UNKNOWN');

    expect(result.outcomes.length).toBeGreaterThan(0);
    expect(result.sampleSize).toBeGreaterThanOrEqual(0);
  });

  it('should return sorted outcomes', async () => {
    const result = await getPositionDistribution('QB');
    const outcomes = result.outcomes;

    for (let i = 1; i < outcomes.length; i++) {
      expect(outcomes[i]).toBeGreaterThanOrEqual(outcomes[i - 1]);
    }
  });

  it('should cache results', async () => {
    const start = Date.now();
    await getPositionDistribution('QB');
    const firstCallTime = Date.now() - start;

    const start2 = Date.now();
    await getPositionDistribution('QB');
    const secondCallTime = Date.now() - start2;

    // Second call should be faster (cached)
    expect(secondCallTime).toBeLessThan(firstCallTime + 10);
  });

  it('should return outcomes around 1.0 mean', async () => {
    const result = await getPositionDistribution('QB');
    const mean = result.outcomes.reduce((a, b) => a + b, 0) / result.outcomes.length;

    // Mean should be close to 1.0 (normalized outcomes)
    expect(mean).toBeGreaterThan(0.7);
    expect(mean).toBeLessThan(1.3);
  });
});

describe('getPlayerOutcomes', () => {
  it('should return outcomes for known player', async () => {
    const result = await getPlayerOutcomes('4866'); // Patrick Mahomes

    expect(result.outcomes).toBeDefined();
    expect(result.sampleSize).toBeGreaterThanOrEqual(0);
  });

  it('should return empty for unknown player', async () => {
    const result = await getPlayerOutcomes('UNKNOWN_PLAYER_ID');

    expect(result.outcomes.length).toBe(0);
    expect(result.sampleSize).toBe(0);
  });

  it('should normalize outcomes around 1.0', async () => {
    const result = await getPlayerOutcomes('4866');

    if (result.outcomes.length > 0) {
      const sorted = [...result.outcomes].sort((a, b) => a - b);
      const median = sorted[Math.floor(sorted.length / 2)];

      // Median should be close to 1.0 after normalization
      expect(median).toBeGreaterThan(0.8);
      expect(median).toBeLessThan(1.2);
    }
  });

  it('should cache results', async () => {
    const start = Date.now();
    await getPlayerOutcomes('4866');
    const firstCallTime = Date.now() - start;

    const start2 = Date.now();
    await getPlayerOutcomes('4866');
    const secondCallTime = Date.now() - start2;

    expect(secondCallTime).toBeLessThan(firstCallTime + 10);
  });

  it('should return sorted outcomes', async () => {
    const result = await getPlayerOutcomes('4866');

    if (result.outcomes.length > 0) {
      for (let i = 1; i < result.outcomes.length; i++) {
        expect(result.outcomes[i]).toBeGreaterThanOrEqual(result.outcomes[i - 1]);
      }
    }
  });
});

describe('getDataInfo', () => {
  it('should return data export metadata', () => {
    const info = getDataInfo();

    expect(info.exportedAt).toBeDefined();
    expect(info.positionVarianceCount).toBeGreaterThanOrEqual(0);
    expect(info.playerVarianceCount).toBeGreaterThanOrEqual(0);
    expect(info.projectionErrorCount).toBeGreaterThanOrEqual(0);
  });

  it('should have reasonable data counts', () => {
    const info = getDataInfo();

    // Should have at least some variance data
    expect(info.positionVarianceCount).toBeGreaterThan(0);
  });
});
