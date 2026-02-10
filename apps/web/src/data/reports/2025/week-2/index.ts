import { afcData } from './afc';
import { nfcData } from './nfc';
import {
  season,
  week,
  lastUpdated,
  dataSource,
  powerRankings,
  standings,
  upcomingMatchups,
} from './meta';
import type { WeeklyReportData } from './types';

const reportData: WeeklyReportData = {
  season,
  week,
  lastUpdated,
  dataSource,
  leagues: [afcData, nfcData],
  powerRankings,
  standings,
  upcomingMatchups,
};

export default reportData;
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
