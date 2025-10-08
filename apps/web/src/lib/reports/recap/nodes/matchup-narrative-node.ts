/**
 * Matchup Narrative Generation Node
 * Uses Gemini with function calling to generate engaging matchup recaps.
 */

import { HumanMessage } from '@langchain/core/messages';
import { createGeminiClient } from '../gemini-client';
import { buildMatchupNarrativePrompt } from '../prompts/sections/matchup-narrative';
import { toolRegistry } from '../tools/registry';
import { convertToolsToLangChain } from '../tools/langchain-adapter';
import type { RecapReportState } from '../state';

/**
 * Generates a narrative for a single matchup using Gemini and all 11 data tools.
 *
 * This node:
 * 1. Converts all registered tools to LangChain format
 * 2. Binds them to the Gemini client
 * 3. Sends the prompt to Gemini
 * 4. Gemini calls the tools as needed
 * 5. Gemini generates the narrative
 * 6. Returns the result in state
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

  console.log(`\n🎬 Generating narrative for Matchup ${matchupId}...`);

  try {
    // Create Gemini client
    const geminiClient = createGeminiClient();

    // Get all tools from registry and convert to LangChain format
    const reportTools = toolRegistry.getAllTools();
    const langchainTools = convertToolsToLangChain(reportTools);

    console.log(`   🔧 Loaded ${langchainTools.length} tools for function calling`);

    // Bind tools to the client
    const clientWithTools = geminiClient.bind({
      tools: langchainTools,
    });

    // Build the prompt
    const prompt = buildMatchupNarrativePrompt(leagueId, week, matchupId);

    // Invoke Gemini with the prompt
    const response = await clientWithTools.invoke([
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
        .map(item => (typeof item === 'string' ? item : item.text || ''))
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
    } catch (parseError) {
      console.warn('⚠️  Failed to parse JSON response, using raw text');
      // Fallback: treat entire response as narrative
      narrativeData = {
        narrative: responseText,
        metadata: {
          finalScore: 'N/A',
          winner: 'N/A',
          excitementScore: 0,
          keyPlayers: [],
          wordCount: responseText.split(/\s+/).length,
        },
      };
    }

    console.log(`✅ Narrative generated (${narrativeData.metadata.wordCount} words)`);
    console.log(`   Excitement Score: ${narrativeData.metadata.excitementScore}/100`);

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
            excitementScore: narrativeData.metadata.excitementScore,
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
            excitementScore: 0,
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
