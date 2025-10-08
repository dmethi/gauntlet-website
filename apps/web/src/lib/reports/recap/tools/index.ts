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
import {
  calculateTopTeamScoreTool,
  calculateBiggestBlowoutTool,
  calculateTopPositionPerformersTool,
} from './hall-of-fame';
import {
  calculateLowestTeamScoreTool,
  calculateBiggestBustsTool,
  calculateBadBeatLossesTool,
} from './hall-of-shame';
import { fetchPowerRankingsTool } from './power-rankings';
import { fetchStandingsTool } from './standings';

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

  // Hall of Fame Tools (RECAP-011)
  toolRegistry.register(calculateTopTeamScoreTool);
  toolRegistry.register(calculateBiggestBlowoutTool);
  toolRegistry.register(calculateTopPositionPerformersTool);

  // Hall of Shame Tools (RECAP-012)
  toolRegistry.register(calculateLowestTeamScoreTool);
  toolRegistry.register(calculateBiggestBustsTool);
  toolRegistry.register(calculateBadBeatLossesTool);

  // Power Rankings Tools (RECAP-013)
  toolRegistry.register(fetchPowerRankingsTool);

  // Standings Tools (RECAP-014)
  toolRegistry.register(fetchStandingsTool);

  // TODO: Register additional tools as they are implemented
  // - Upcoming matchups preview tools
  // - etc.
};

// Auto-register tools on module import
registerAllTools();

// Re-export registry for use in other modules
export { toolRegistry } from './registry';
export type { ReportTool, ToolContext, ToolExecutionResult } from './base';
