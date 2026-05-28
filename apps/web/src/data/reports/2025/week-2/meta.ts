import reportDataJson from '../../../../../data/report-week2.json';
import type { WeeklyReportData } from './types';

type RawWeeklyReportData = Omit<WeeklyReportData, 'upcomingMatchups'> & {
  upcoming: WeeklyReportData['upcomingMatchups'];
};

const reportData = reportDataJson as RawWeeklyReportData;

export const season = reportData.season;
export const week = reportData.week;
export const lastUpdated = reportData.lastUpdated;
export const dataSource = reportData.dataSource;
export const powerRankings = reportData.powerRankings;
export const standings = reportData.standings;
