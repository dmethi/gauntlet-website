import { describe, it, expect } from 'vitest';
import { createMetrics } from '../metrics';

describe('createMetrics', () => {
  it('should create a metrics instance', () => {
    const metrics = createMetrics();
    expect(metrics).toBeDefined();
    expect(metrics.increment).toBeDefined();
    expect(metrics.recordDuration).toBeDefined();
    expect(metrics.getSummary).toBeDefined();
    expect(metrics.reset).toBeDefined();
  });

  it('should increment counters', () => {
    const metrics = createMetrics();
    metrics.increment('test.counter');
    metrics.increment('test.counter');
    metrics.increment('test.counter', 5);

    const summary = metrics.getSummary();
    expect(summary.counters['test.counter']).toBe(7); // 1 + 1 + 5
  });

  it('should record durations', () => {
    const metrics = createMetrics();
    metrics.recordDuration('test.duration', 100);
    metrics.recordDuration('test.duration', 200);
    metrics.recordDuration('test.duration', 150);

    const summary = metrics.getSummary();
    expect(summary.timers['test.duration']).toBeDefined();
    expect(summary.timers['test.duration'].count).toBe(3);
    expect(summary.timers['test.duration'].total).toBe(450);
    expect(summary.timers['test.duration'].avg).toBe(150);
    expect(summary.timers['test.duration'].min).toBe(100);
    expect(summary.timers['test.duration'].max).toBe(200);
  });

  it('should return empty summary when no metrics recorded', () => {
    const metrics = createMetrics();
    const summary = metrics.getSummary();
    expect(summary.counters).toEqual({});
    expect(summary.timers).toEqual({});
  });

  it('should reset all metrics', () => {
    const metrics = createMetrics();
    metrics.increment('test.counter', 10);
    metrics.recordDuration('test.duration', 100);

    let summary = metrics.getSummary();
    expect(summary.counters['test.counter']).toBe(10);
    expect(summary.timers['test.duration']).toBeDefined();

    metrics.reset();

    summary = metrics.getSummary();
    expect(summary.counters).toEqual({});
    expect(summary.timers).toEqual({});
  });

  it('should handle multiple different metrics', () => {
    const metrics = createMetrics();
    metrics.increment('metric1');
    metrics.increment('metric2', 5);
    metrics.recordDuration('timer1', 100);
    metrics.recordDuration('timer2', 200);

    const summary = metrics.getSummary();
    expect(summary.counters['metric1']).toBe(1);
    expect(summary.counters['metric2']).toBe(5);
    expect(summary.timers['timer1'].avg).toBe(100);
    expect(summary.timers['timer2'].avg).toBe(200);
  });
});
