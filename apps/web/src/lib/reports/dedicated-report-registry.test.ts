import { describe, expect, it } from 'vitest';
import {
  DEDICATED_REPORTS,
  getDedicatedReportRoute,
  mergeDedicatedReports,
} from './dedicated-report-registry';

describe('dedicated report registry', () => {
  it('registers the 2026 Week 1 newspaper recap', () => {
    expect(DEDICATED_REPORTS).toContainEqual(
      expect.objectContaining({
        season: 2026,
        week: 1,
        href: '/competition/reports/2026/week-1',
      }),
    );
  });

  it('resolves the canonical dynamic route to the bespoke Week 1 report', () => {
    expect(getDedicatedReportRoute('2026', 'week-1')).toBe('2026-week-1');
    expect(getDedicatedReportRoute('2026', 'week-2')).toBeNull();
    expect(getDedicatedReportRoute('not-a-season', 'week-1')).toBeNull();
  });

  it('deduplicates by href and keeps the dedicated report metadata', () => {
    const discovered = [
      {
        season: 2026,
        week: 1,
        title: 'Generic report',
        href: '/competition/reports/2026/week-1',
        date: '2026-09-14T00:00:00.000Z',
        tags: ['Week 1'],
        status: 'success' as const,
      },
    ];

    const merged = mergeDedicatedReports(discovered);

    expect(merged).toHaveLength(DEDICATED_REPORTS.length);
    expect(merged[0].title).toBe('The Scoreboard Was Lying');
  });

  it('sorts newest reports first', () => {
    const merged = mergeDedicatedReports([
      {
        season: 2025,
        week: 12,
        title: 'Older report',
        href: '/competition/reports/2025/week-12',
        date: '2025-11-25T00:00:00.000Z',
        tags: ['Week 12'],
        status: 'success',
      },
    ]);

    expect(merged[0].season).toBe(2026);
  });
});
