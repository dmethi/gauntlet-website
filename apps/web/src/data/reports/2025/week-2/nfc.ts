import reportDataJson from '../../../../../data/report-week2.json';
import type { LeagueData, WeeklyReportData } from './types';

type RawWeeklyReportData = Omit<WeeklyReportData, 'upcomingMatchups'> & {
  upcoming: WeeklyReportData['upcomingMatchups'];
};

const reportData = reportDataJson as RawWeeklyReportData;

const [, nfcLeagueData] = reportData.leagues as [LeagueData, LeagueData];

export const nfcData = nfcLeagueData;

export default nfcData;
