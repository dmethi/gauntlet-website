import reportDataJson from '../../../../../data/report-week2.json';
import type { LeagueData, WeeklyReportData } from './types';

const reportData = reportDataJson as WeeklyReportData & {
  upcoming: WeeklyReportData['upcomingMatchups'];
};

const [afcData, nfcData] = reportData.leagues as [LeagueData, LeagueData];

const {
  season,
  week,
  lastUpdated,
  dataSource,
  powerRankings,
  standings,
  upcoming: upcomingMatchups,
} = reportData;

export default {
  season,
  week,
  lastUpdated,
  dataSource,
  leagues: [afcData, nfcData],
  powerRankings,
  standings,
  upcomingMatchups,
} satisfies WeeklyReportData;

export {
  afcData,
  nfcData,
  season,
  week,
  lastUpdated,
  dataSource,
  powerRankings,
  standings,
  upcomingMatchups,
};

export type { WeeklyReportData } from './types';
