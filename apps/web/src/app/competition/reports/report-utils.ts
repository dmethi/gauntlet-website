export interface ReportListItem {
  title: string;
  href: string;
  date: string;
  week: number;
  season: number;
  tags: string[];
  status: 'success' | 'partial' | 'failed';
  description?: string;
}

export interface ReportsResponse {
  success: boolean;
  count: number;
  reports: ReportListItem[];
}

export const reportsForSeason = (reports: ReportListItem[], season: number) =>
  reports.filter(report => report.season === season);
