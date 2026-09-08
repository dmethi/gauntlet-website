import { describe, expect, it } from 'vitest';
import { type ReportListItem, reportsForSeason } from './report-utils';

const reports: ReportListItem[] = [
  {
    title: 'Week 1 Report — 2025',
    href: '/competition/reports/2025/week-1',
    date: '2025-09-09T00:00:00.000Z',
    week: 1,
    season: 2025,
    tags: ['Recap'],
    status: 'success',
  },
  {
    title: 'Week 1 Report — 2026',
    href: '/competition/reports/2026/week-1',
    date: '2026-09-09T00:00:00.000Z',
    week: 1,
    season: 2026,
    tags: ['Recap'],
    status: 'success',
  },
];

describe('reportsForSeason', () => {
  it('keeps archived seasons out of the current recap feed', () => {
    expect(reportsForSeason(reports, 2026).map(report => report.season)).toEqual([2026]);
    expect(reportsForSeason(reports, 2025).map(report => report.season)).toEqual([2025]);
  });
});
