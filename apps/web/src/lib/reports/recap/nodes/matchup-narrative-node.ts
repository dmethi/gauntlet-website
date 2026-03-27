/**
 * Matchup Narrative Generation Node
 * Prefetches all matchup data and passes it to Gemini for narrative generation.
 */

import { HumanMessage } from '@langchain/core/messages';
import { createGeminiClient } from '../gemini-client';
import { buildMatchupNarrativePrompt } from '../prompts/sections/matchup-narrative';
import {
  fetchH2HHistoryTool,
  fetchKeyPlayerPerformancesTool,
  fetchMatchupBoxScoreTool,
  fetchMatchupRostersTool,
  fetchPlayoffImplicationsTool,
  fetchPositionBreakdownTool,
  fetchPreGameProjectionsTool,
  fetchProjectionVsActualTool,
  fetchScoringBreakdownTool,
  fetchTeamRecordsTool,
} from '../tools/matchup-data';
import { gameFlowTool } from '../tools/game-flow';
import type { RecapReportState } from '../state';
import { debugLog } from '@/lib/debug-log';

/**
 * Prefetches all matchup data from the 11 data tools.
 *
 * @param leagueId - League ID
 * @param week - Week number
 * @param matchupId - Matchup ID
 * @returns All matchup data bundled together
 */
const prefetchMatchupData = async (
  leagueId: string,
  week: number,
  matchupId: number,
): Promise<{
  boxScore: Awaited<ReturnType<typeof fetchMatchupBoxScoreTool.execute>>;
  rosters: Awaited<ReturnType<typeof fetchMatchupRostersTool.execute>>;
  scoringBreakdown: Awaited<ReturnType<typeof fetchScoringBreakdownTool.execute>>;
  projections: Awaited<ReturnType<typeof fetchPreGameProjectionsTool.execute>>;
  projectionVsActual: Awaited<ReturnType<typeof fetchProjectionVsActualTool.execute>>;
  records: Awaited<ReturnType<typeof fetchTeamRecordsTool.execute>>;
  h2hHistory: Awaited<ReturnType<typeof fetchH2HHistoryTool.execute>>;
  gameFlow: Awaited<ReturnType<typeof gameFlowTool.execute>>;
  playoffImplications: Awaited<ReturnType<typeof fetchPlayoffImplicationsTool.execute>>;
  positionBreakdown: Awaited<ReturnType<typeof fetchPositionBreakdownTool.execute>>;
  keyPlayers: Awaited<ReturnType<typeof fetchKeyPlayerPerformancesTool.execute>>;
}> => {
  // First, fetch box score to get roster IDs
  const boxScore = await fetchMatchupBoxScoreTool.execute({ leagueId, week, matchupId });

  debugLog('   📥 Prefetching all matchup data...');

  // Fetch all remaining data in parallel
  const [
    rosters,
    scoringBreakdown,
    projections,
    projectionVsActual,
    records,
    h2hHistory,
    gameFlow,
    playoffImplications,
    positionBreakdown,
    keyPlayers,
  ] = await Promise.all([
    fetchMatchupRostersTool.execute({ leagueId, week, matchupId }),
    fetchScoringBreakdownTool.execute({ leagueId, week, matchupId }),
    fetchPreGameProjectionsTool.execute({ leagueId, week, matchupId }),
    fetchProjectionVsActualTool.execute({ leagueId, week, matchupId }),
    fetchTeamRecordsTool.execute({
      leagueId,
      week,
      rosterId1: boxScore.team1.rosterId,
      rosterId2: boxScore.team2.rosterId,
    }),
    fetchH2HHistoryTool.execute({
      leagueId,
      currentWeek: week,
      rosterId1: boxScore.team1.rosterId,
      rosterId2: boxScore.team2.rosterId,
    }),
    gameFlowTool.execute({ leagueId, week, matchupId }),
    fetchPlayoffImplicationsTool.execute({
      leagueId,
      week,
      rosterId1: boxScore.team1.rosterId,
      rosterId2: boxScore.team2.rosterId,
    }),
    fetchPositionBreakdownTool.execute({ leagueId, week, matchupId }),
    fetchKeyPlayerPerformancesTool.execute({ leagueId, week, matchupId }),
  ]);

  debugLog('   ✅ All data fetched successfully');

  return {
    boxScore,
    rosters,
    scoringBreakdown,
    projections,
    projectionVsActual,
    records,
    h2hHistory,
    gameFlow,
    playoffImplications,
    positionBreakdown,
    keyPlayers,
  };
};

/**
 * Generates a narrative for a single matchup using Gemini with prefetched data.
 *
 * This node:
 * 1. Prefetches all data from 11 tools
 * 2. Bundles the data into a structured prompt
 * 3. Sends to Gemini for narrative generation
 * 4. Parses and returns the result
 *
 * @param state - Current state (must include week, leagueId, matchupId)
 * @returns Updated state with matchup narrative added
 */
export const matchupNarrativeNode = async (
  state: RecapReportState,
): Promise<Partial<RecapReportState>> => {
  const { week, leagueId, matchupId } = state;

  if (!week || !leagueId || !matchupId) {
    throw new Error('Missing required state for matchup narrative: week, leagueId, or matchupId');
  }

  debugLog(`\n🎬 Generating narrative for Matchup ${matchupId}...`);

  try {
    // Prefetch all matchup data
    const data = await prefetchMatchupData(leagueId, week, matchupId);

    // Create Gemini client (no tool binding needed)
    const geminiClient = createGeminiClient();

    // Build the prompt with all data included
    const prompt = buildMatchupNarrativePrompt(leagueId, week, matchupId, data);

    debugLog('   🤖 Sending to Gemini for narrative generation...');

    // Invoke Gemini with the prompt
    const response = await geminiClient.invoke([
      new HumanMessage({
        content: prompt,
      }),
    ]);

    // Parse the response
    let responseText = '';
    if (typeof response.content === 'string') {
      responseText = response.content;
    } else if (Array.isArray(response.content)) {
      // Handle structured content
      responseText = response.content
        .map(item => {
          if (typeof item === 'string') return item;
          if (typeof item === 'object' && item !== null && 'text' in item) {
            return String(item.text);
          }
          return '';
        })
        .join('');
    }

    // Try to extract JSON from response
    // Gemini might wrap it in markdown code blocks
    let narrativeData;
    try {
      // Remove markdown code blocks if present
      const jsonMatch =
        responseText.match(/```json\s*([\s\S]*?)\s*```/) ||
        responseText.match(/```\s*([\s\S]*?)\s*```/);
      const jsonString = jsonMatch ? jsonMatch[1] : responseText;

      narrativeData = JSON.parse(jsonString);
    } catch {
      // eslint-disable-next-line no-console
      console.warn('⚠️  Failed to parse JSON response, using raw text');
      // Fallback: treat entire response as narrative
      narrativeData = {
        narrative: responseText,
        metadata: {
          finalScore: 'N/A',
          winner: 'N/A',
          excitementLevel: 'low',
          keyPlayers: [],
          wordCount: responseText.split(/\s+/).length,
        },
      };
    }

    debugLog(`✅ Narrative generated (${narrativeData.metadata.wordCount} words)`);
    debugLog(`   Excitement Level: ${narrativeData.metadata.excitementLevel || 'medium'}`);

    return {
      matchupNarratives: [
        ...(state.matchupNarratives || []),
        {
          matchupId,
          leagueId,
          narrative: narrativeData.narrative,
          metadata: {
            finalScore: narrativeData.metadata.finalScore,
            winner: narrativeData.metadata.winner,
            excitementLevel: narrativeData.metadata.excitementLevel || 'medium',
            keyPlayers: narrativeData.metadata.keyPlayers || [],
            wordCount: narrativeData.metadata.wordCount,
          },
        },
      ],
    };
  } catch (error) {
    console.error(`❌ Failed to generate narrative for Matchup ${matchupId}:`, error);

    // Return a fallback narrative
    return {
      matchupNarratives: [
        ...(state.matchupNarratives || []),
        {
          matchupId,
          leagueId,
          narrative: `Error generating narrative for Matchup ${matchupId}. ${error instanceof Error ? error.message : 'Unknown error'}`,
          metadata: {
            finalScore: 'N/A',
            winner: 'N/A',
            excitementLevel: 'low',
            keyPlayers: [],
            wordCount: 0,
            error: true,
          },
        },
      ],
      errors: [
        ...(state.errors || []),
        `Matchup ${matchupId}: ${error instanceof Error ? error.message : 'Unknown error'}`,
      ],
    };
  }
};
