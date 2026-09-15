export interface ReportListItem {
  season: number;
  week: number;
  title: string;
  href: string;
  date: string;
  tags: string[];
  status: 'success' | 'partial' | 'failed';
  description?: string;
}

export const DEDICATED_REPORTS: ReportListItem[] = [
  {
    season: 2026,
    week: 1,
    title: 'The Scoreboard Was Lying',
    href: '/competition/reports/2026/week-1',
    date: '2026-09-15T12:00:00-04:00',
    tags: ['Week 1', 'Game flow', 'Record book', '2025 receipts'],
    status: 'success',
    description:
      'A newspaper-style tour of 18 opening-week matchups, from scheduled avalanches to Monday-night heartbreak.',
  },
  {
    season: 2025,
    week: 1,
    title: 'Week 1 Report — 2025',
    href: '/competition/reports/2025/week-1',
    date: '2025-09-13T13:35:44.370Z',
    tags: ['Week 1', 'AFC', 'NFC'],
    status: 'success',
  },
];

export const mergeDedicatedReports = (discovered: ReportListItem[]): ReportListItem[] => {
  const byHref = new Map(discovered.map(report => [report.href, report]));

  for (const report of DEDICATED_REPORTS) byHref.set(report.href, report);

  return [...byHref.values()].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );
};
