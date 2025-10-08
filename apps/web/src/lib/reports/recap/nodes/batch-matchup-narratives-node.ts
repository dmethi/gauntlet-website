/**
 * Batch Matchup Narratives Node
 *
 * Generates narratives for all 12 matchups (6 AFC + 6 NFC) sequentially.
 * Each matchup gets a fresh model instance to avoid context overflow.
 */

import { HumanMessage } from '@langchain/core/messages';
import { createGeminiClient } from '../gemini-client';
import { buildMatchupNarrativePrompt } from '../prompts/sections/matchup-narrative';
import { toolRegistry } from '../tools/registry';
import { convertToolsToLangChain } from '../tools/langchain-adapter';
import { LEAGUE_IDS } from '@/lib/constants';
import type { RecapReportState, MatchupNarrative } from '../state';

/**
 * Processes all 12 matchups (6 AFC + 6 NFC) and generates narratives.
 *
 * Strategy:
 * - Process sequentially to avoid rate limits and token overflow
 * - Create fresh Gemini client for each matchup (clears context)
 * - Track progress and handle failures gracefully
 * - Add 1s delay between calls to respect rate limits
 */
export const batchMatchupNarrativesNode = async (
  state: RecapReportState,
): Promise<Partial<RecapReportState>> => {
  const { week } = state;

  if (!week) {
    throw new Error('Missing required state: week');
  }

  console.log(`\n🎬 Generating narratives for all Week ${week} matchups...`);
  console.log(`   Total: 12 matchups (6 AFC + 6 NFC)\n`);

  const narratives: MatchupNarrative[] = [];
  const failedMatchups: string[] = [];
  let completed = 0;

  // Define all matchups to process
  const matchups = [
    ...Array.from({ length: 6 }, (_, i) => ({ leagueId: LEAGUE_IDS.AFC, matchupId: i + 1 })),
    ...Array.from({ length: 6 }, (_, i) => ({ leagueId: LEAGUE_IDS.NFC, matchupId: i + 1 })),
  ];

  // Get all tools once (will be reused for each matchup)
  const reportTools = toolRegistry.getAllTools();
  const langchainTools = convertToolsToLangChain(reportTools);

  // Process each matchup sequentially
  for (const matchup of matchups) {
    const { leagueId, matchupId } = matchup;
    const matchupKey = `${leagueId === LEAGUE_IDS.AFC ? 'AFC' : 'NFC'}-${matchupId}`;

    console.log(`\n[${completed + 1}/12] Processing ${matchupKey}...`);

    try {
      // Create fresh Gemini client for each matchup (clears context)
      const geminiClient = createGeminiClient();

      // Bind tools to the client
      const clientWithTools = geminiClient.bind({
        tools: langchainTools,
      });

      // Build prompt for this specific matchup
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

      narratives.push({
        leagueId,
        matchupId,
        narrative: narrativeData.narrative,
        metadata: {
          finalScore: narrativeData.metadata.finalScore,
          winner: narrativeData.metadata.winner,
          excitementScore: narrativeData.metadata.excitementScore,
          keyPlayers: narrativeData.metadata.keyPlayers || [],
          wordCount: narrativeData.metadata.wordCount,
        },
      });

      console.log(
        `   ✅ Generated (${narrativeData.metadata.wordCount} words, excitement: ${narrativeData.metadata.excitementScore}/100)`,
      );

      completed++;
    } catch (error) {
      console.error(`   ❌ Failed to generate narrative for ${matchupKey}:`, error);

      // Add a fallback narrative
      narratives.push({
        leagueId,
        matchupId,
        narrative: `Error generating narrative for ${matchupKey}. Data tools may have failed.`,
        metadata: {
          finalScore: 'N/A',
          winner: 'N/A',
          excitementScore: 0,
          keyPlayers: [],
          wordCount: 0,
          error: true,
        },
      });

      failedMatchups.push(matchupKey);
      completed++;
    }

    // Small delay to respect rate limits (1 second between calls)
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  console.log(`\n✅ Batch processing complete!`);
  console.log(`   Successful: ${12 - failedMatchups.length}/12`);
  if (failedMatchups.length > 0) {
    console.log(`   Failed: ${failedMatchups.join(', ')}`);
  }

  return {
    matchupNarratives: narratives,
    progress: {
      totalMatchups: 12,
      completedMatchups: completed,
      failedMatchups,
    },
  };
};
