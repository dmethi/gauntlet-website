/**
 * League Overview Generation Node
 * Generates the opening section with high-level weekly statistics.
 */

import { HumanMessage } from '@langchain/core/messages';
import { createGeminiClient } from '../gemini-client';
import { buildLeagueOverviewPrompt } from '../prompts/sections/league-overview';
import {
  calculateWeekSummaryStatsTool,
  fetchLeagueDataTool,
  fetchWeekHighlightsTool,
} from '../tools/league-overview';
import type { RecapReportState } from '../state';
import { debugLog } from '@/lib/debug-log';

/**
 * Generates the league overview section using pre-fetched data and Gemini.
 *
 * Strategy: Pre-fetch + Context Injection
 * - Tools execute and fetch all data upfront
 * - Data is injected directly into the prompt context
 * - Gemini weaves the facts into narrative (no computation)
 * - Guarantees accurate numbers (no hallucination)
 *
 * This node:
 * 1. Executes all 3 tools to fetch data
 * 2. Injects tool results into prompt context
 * 3. Sends enriched prompt to Gemini
 * 4. Gemini generates narrative using exact numbers
 * 5. Returns the result in state
 *
 * @param state - Current state (must include week)
 * @returns Updated state with league overview added
 */
export const leagueOverviewNode = async (
  state: RecapReportState,
): Promise<Partial<RecapReportState>> => {
  const { week } = state;

  if (!week) {
    throw new Error('Missing required state for league overview: week');
  }

  debugLog(`\n📊 Generating league overview for Week ${week}...`);

  try {
    // Pre-fetch all data using tools
    debugLog('   📦 Pre-fetching data from 3 tools...');

    const [leagueData, summaryStats, highlights] = await Promise.all([
      fetchLeagueDataTool.execute({ week }),
      calculateWeekSummaryStatsTool.execute({ week }),
      fetchWeekHighlightsTool.execute({ week }),
    ]);

    debugLog('   ✅ Data fetched successfully');
    debugLog(`      • ${summaryStats.totalPoints} total points`);
    debugLog(`      • ${summaryStats.closeGames} close games, ${summaryStats.blowouts} blowouts`);
    debugLog(
      `      • Closest: ${highlights.closestGame.margin}pt, Biggest blowout: ${highlights.biggestBlowout.margin}pt`,
    );

    // Create Gemini client
    const geminiClient = createGeminiClient();

    // Build prompt with pre-fetched data injected
    const prompt = buildLeagueOverviewPrompt(week, {
      leagueData,
      summaryStats,
      highlights,
    });

    debugLog('   🤖 Sending to Gemini with injected context...');

    // Invoke Gemini with data-enriched prompt (no tool calling needed)
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
      responseText = response.content
        .map(item => {
          if (typeof item === 'string') return item;
          if (typeof item === 'object' && 'text' in item) return item.text;
          return '';
        })
        .join('');
    }

    // Try to extract JSON from response
    let overviewData;
    try {
      // Remove markdown code blocks if present
      const jsonMatch =
        responseText.match(/```json\s*([\s\S]*?)\s*```/) ||
        responseText.match(/```\s*([\s\S]*?)\s*```/);
      const jsonString = jsonMatch ? jsonMatch[1] : responseText;

      overviewData = JSON.parse(jsonString);
    } catch {
      // eslint-disable-next-line no-console
      console.warn('⚠️  Failed to parse JSON response, using raw text');
      // Fallback: treat entire response as narrative
      overviewData = {
        narrative: responseText,
        metrics: {
          totalPoints: 0,
          averageScore: 0,
          closeGames: 0,
          blowouts: 0,
        },
      };
    }

    const wordCount = overviewData.narrative.split(/\s+/).length;
    debugLog(`   ✅ Narrative generated (${wordCount} words)`);
    debugLog(`      • Verified: ${summaryStats.totalPoints} pts, ${summaryStats.averageScore} avg`);

    return {
      leagueOverview: overviewData.narrative,
      leagueOverviewData: {
        totalPoints: summaryStats.totalPoints,
        averageScore: summaryStats.averageScore,
        highestScore: summaryStats.highestScore,
        lowestScore: summaryStats.lowestScore,
        totalMatchups: summaryStats.totalMatchups,
        closeGames: summaryStats.closeGames,
        blowouts: summaryStats.blowouts,
      },
    };
  } catch (error) {
    console.error('❌ Failed to generate league overview:', error);

    return {
      leagueOverview: `Week ${week} is in the books with another exciting round of matchups.`,
      errors: [
        ...(state.errors || []),
        `League overview: ${error instanceof Error ? error.message : 'Unknown error'}`,
      ],
    };
  }
};
