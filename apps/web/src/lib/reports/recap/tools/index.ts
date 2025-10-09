/**
 * Tool registration module.
 * All report generation tools are imported and registered here.
 */

import { toolRegistry } from './registry';
import { fetchLeagueDataTool, calculateWeekSummaryStatsTool } from './league-overview';
import { gameFlowTool } from './game-flow';
import {
  fetchMatchupBoxScoreTool,
  fetchMatchupRostersTool,
  fetchScoringBreakdownTool,
  fetchPreGameProjectionsTool,
  fetchProjectionVsActualTool,
  fetchTeamRecordsTool,
  fetchH2HHistoryTool,
  fetchPlayoffImplicationsTool,
  fetchPositionBreakdownTool,
  fetchKeyPlayerPerformancesTool,
} from './matchup-data';
// Enhanced Hall of Fame/Shame - checks ALL 68 categories
import {
  checkAllHistoricalRecordsTool,
  calculateTopPositionPerformersEnhanced,
} from './hall-of-fame-enhanced';
import { fetchPowerRankingsTool } from './power-rankings';
import { fetchStandingsTool } from './standings';
import { fetchNextWeekMatchupsTool } from './upcoming';

/**
 * Register all available tools with the registry.
 * This should be called once at application startup.
 */
export const registerAllTools = (): void => {
  // League Overview Tools
  toolRegistry.register(fetchLeagueDataTool);
  toolRegistry.register(calculateWeekSummaryStatsTool);

  // Game Flow Tools
  toolRegistry.register(gameFlowTool);

  // Matchup Data Tools (RECAP-008)
  toolRegistry.register(fetchMatchupBoxScoreTool);
  toolRegistry.register(fetchMatchupRostersTool);
  toolRegistry.register(fetchScoringBreakdownTool);
  toolRegistry.register(fetchPreGameProjectionsTool);
  toolRegistry.register(fetchProjectionVsActualTool);
  toolRegistry.register(fetchTeamRecordsTool);
  toolRegistry.register(fetchH2HHistoryTool);
  toolRegistry.register(fetchPlayoffImplicationsTool);
  toolRegistry.register(fetchPositionBreakdownTool);
  toolRegistry.register(fetchKeyPlayerPerformancesTool);

  // Enhanced Hall of Fame/Shame Tools (RECAP-011)
  // Checks ALL 68 categories (fame + shame) instead of hardcoded subset
  toolRegistry.register(checkAllHistoricalRecordsTool);
  toolRegistry.register(calculateTopPositionPerformersEnhanced);

  // Power Rankings Tools (RECAP-013)
  toolRegistry.register(fetchPowerRankingsTool);

  // Standings Tools (RECAP-014)
  toolRegistry.register(fetchStandingsTool);

  // Upcoming Matchups Tools (RECAP-015)
  toolRegistry.register(fetchNextWeekMatchupsTool);
};

// Auto-register tools on module import
registerAllTools();

// Re-export registry for use in other modules
export { toolRegistry } from './registry';
export type { ReportTool, ToolContext, ToolExecutionResult } from './base';

// Re-export all tools for direct usage
export { fetchLeagueDataTool, calculateWeekSummaryStatsTool } from './league-overview';
export { gameFlowTool } from './game-flow';
export {
  fetchMatchupBoxScoreTool,
  fetchMatchupRostersTool,
  fetchScoringBreakdownTool,
  fetchPreGameProjectionsTool,
  fetchProjectionVsActualTool,
  fetchTeamRecordsTool,
  fetchH2HHistoryTool,
  fetchPlayoffImplicationsTool,
  fetchPositionBreakdownTool,
  fetchKeyPlayerPerformancesTool,
} from './matchup-data';
export {
  checkAllHistoricalRecordsTool,
  calculateTopPositionPerformersEnhanced,
} from './hall-of-fame-enhanced';
export { fetchPowerRankingsTool } from './power-rankings';
export { fetchStandingsTool } from './standings';
export { fetchNextWeekMatchupsTool } from './upcoming';
export { fetchHallOfShameTool } from './hall-of-shame';

// Composite tools for simplified usage
export { fetchLeagueOverviewTool, fetchMatchupDataTool } from './composite-tools';
