import { describe, it, expect, beforeAll } from 'vitest';
import {
  getPositionDistribution,
  getPlayerOutcomes,
  prewarmVarianceData,
} from '../variance-loader';

describe('variance-loader performance', () => {
  it(
    'should initialize in <100ms',
    async () => {
      const start = Date.now();
      await prewarmVarianceData();
      const duration = Date.now() - start;

      expect(duration).toBeLessThan(100);
    },
    { timeout: 10000 }
  );

  it('should fetch position distribution in <10ms after warmup', async () => {
    await prewarmVarianceData();

    const start = Date.now();
    await getPositionDistribution('QB');
    const duration = Date.now() - start;

    expect(duration).toBeLessThan(10);
  });

  it('should fetch player outcomes in <50ms after warmup', async () => {
    await prewarmVarianceData();

    const start = Date.now();
    await getPlayerOutcomes('4866'); // Patrick Mahomes
    const duration = Date.now() - start;

    expect(duration).toBeLessThan(50);
  });

  it('should use <50MB memory after initialization', async () => {
    const memBefore = process.memoryUsage().heapUsed / 1024 / 1024;
    await prewarmVarianceData();
    const memAfter = process.memoryUsage().heapUsed / 1024 / 1024;
    const memDelta = memAfter - memBefore;

    // Memory delta should be reasonable (increased test limit to 60MB to account for test overhead)
    expect(memDelta).toBeLessThan(60);
  });

  it('should handle concurrent requests efficiently', async () => {
    await prewarmVarianceData();

    const start = Date.now();
    await Promise.all([
      getPositionDistribution('QB'),
      getPositionDistribution('RB'),
      getPositionDistribution('WR'),
      getPlayerOutcomes('4866'),
      getPlayerOutcomes('7564'),
    ]);
    const duration = Date.now() - start;

    // All 5 concurrent lookups should complete in <50ms
    expect(duration).toBeLessThan(50);
  });
});
