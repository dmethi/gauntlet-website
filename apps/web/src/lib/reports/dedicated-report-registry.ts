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

export type DedicatedReportRoute = '2026-week-1' | '2026-week-2' | '2026-week-3' | '2026-week-4';

export const getDedicatedReportRoute = (
  season: string,
  slug: string,
): DedicatedReportRoute | null => {
  if (season === '2026' && slug === 'week-1') return '2026-week-1';
  if (season === '2026' && slug === 'week-2') return '2026-week-2';
  if (season === '2026' && slug === 'week-3') return '2026-week-3';
  if (season === '2026' && slug === 'week-4') return '2026-week-4';
  return null;
};

export const DEDICATED_REPORTS: ReportListItem[] = [
  {
    season: 2026,
    week: 4,
    title: 'The Week the Perfect Records Broke',
    href: '/competition/reports/2026/week-4',
    date: '2026-10-07T12:00:00-04:00',
    tags: ['Week 4', 'Unbeaten teams', 'Close games', 'Lineup autopsy'],
    status: 'success',
    description:
      'Four of five unbeaten teams fell, six games finished within five, and Sid remained perfect.',
  },
  {
    season: 2026,
    week: 3,
    title: 'The Average Came Back. The Middle Did Not.',
    href: '/competition/reports/2026/week-3',
    date: '2026-10-01T12:00:00-04:00',
    tags: ['Week 3', 'Scoring extremes', 'Standings', 'Auction value'],
    status: 'success',
    description:
      'Four teams above 140, fifteen below 100, five unbeaten teams, and four still searching for a win.',
  },
  {
    season: 2026,
    week: 2,
    title: 'The Margin for Error Disappeared',
    href: '/competition/reports/2026/week-2',
    date: '2026-09-22T12:00:00-04:00',
    tags: ['Week 2', 'Close games', 'Lineup autopsy', 'Auction value'],
    status: 'success',
    description:
      'Six close finishes, a league-wide scoring reversal, and a winning lineup on every losing bench.',
  },
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
