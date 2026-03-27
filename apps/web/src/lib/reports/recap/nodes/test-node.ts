import type { RecapReportState } from '../state';
import { debugLog } from '@/lib/debug-log';

/**
 * Simple test node to verify LangGraph is working.
 * This will be replaced by actual report generation nodes.
 */
export const testNode = async (state: RecapReportState): Promise<Partial<RecapReportState>> => {
  debugLog('[TEST NODE] Executing with state:', {
    week: state.week,
    season: state.season,
  });

  return {
    leagueOverview: `Test overview for Week ${state.week}, ${state.season}`,
  };
};
