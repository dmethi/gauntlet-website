/**
 * Closing Commentary Generation Node
 * Synthesizes all section context to create a cohesive closing for the recap report.
 */

import { HumanMessage } from '@langchain/core/messages';
import { createGeminiClient } from '../gemini-client';
import { buildClosingPrompt } from '../prompts/sections/closing';
import type { RecapReportState } from '../state';

/**
 * Builds a context summary from all previous sections in the state.
 */
const buildContextSummary = (state: RecapReportState): string => {
  let summary = '';

  // Week info
  summary += `Week ${state.week} of the ${state.season} season\n\n`;

  // League overview
  if (state.leagueOverview) {
    summary += `League Overview:\n${state.leagueOverview}\n\n`;
  }

  // Matchup narratives summary
  if (state.matchupNarratives && state.matchupNarratives.length > 0) {
    const avgExcitement = Math.round(
      state.matchupNarratives.reduce(
        (sum, m) => sum + (m.metadata?.excitementLevel || 'medium'),
        0,
      ) / state.matchupNarratives.length,
    );
    summary += `Matchups: ${state.matchupNarratives.length} games with average excitement score of ${avgExcitement}/100.\n`;

    // Include a few highlights
    const topMatchups = [...state.matchupNarratives]
      .sort(
        (a, b) =>
          (b.metadata?.excitementLevel || 'medium') - (a.metadata?.excitementLevel || 'medium'),
      )
      .slice(0, 3);

    summary += 'Top matchups:\n';
    topMatchups.forEach(m => {
      summary += `- ${m.metadata.finalScore} (${m.metadata.winner} wins, excitement: ${m.metadata.excitementLevel}/100)\n`;
    });
    summary += '\n';
  }

  // Hall of Fame
  if (state.hallOfFame) {
    summary += `Hall of Fame:\n${state.hallOfFame}\n\n`;
  }

  // Hall of Shame
  if (state.hallOfShame) {
    summary += `Hall of Shame:\n${state.hallOfShame}\n\n`;
  }

  // Power Rankings
  if (state.powerRankings) {
    summary += `Power Rankings:\n${state.powerRankings}\n\n`;
  }

  // Standings
  if (state.standings) {
    summary += `Standings & Playoff Picture:\n${state.standings}\n\n`;
  }

  // Upcoming
  if (state.upcoming) {
    summary += `Upcoming Matchups:\n${state.upcoming}\n\n`;
  }

  return summary.trim() || 'Limited context available.';
};

/**
 * Generates the closing commentary that ties together all sections.
 *
 * This node:
 * 1. Builds a context summary from all previous sections
 * 2. Sends it to Gemini with the closing prompt
 * 3. Parses the response
 * 4. Returns the closing commentary in state
 *
 * @param state - Current state (should have all sections populated)
 * @returns Updated state with closing commentary
 */
export const closingCommentaryNode = async (
  state: RecapReportState,
): Promise<Partial<RecapReportState>> => {
  // eslint-disable-next-line no-console
  console.log('\n📝 Generating closing commentary...');

  try {
    // Build context summary from all sections
    const contextSummary = buildContextSummary(state);

    // eslint-disable-next-line no-console
    console.log(
      `   📊 Context built from ${Object.keys(state).filter(k => state[k as keyof RecapReportState] && k !== 'week' && k !== 'season').length} sections`,
    );

    // Create Gemini client
    const geminiClient = createGeminiClient();

    // Build the prompt
    const prompt = buildClosingPrompt(contextSummary);

    // Invoke Gemini
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
    let closingData;
    try {
      // Remove markdown code blocks if present
      const jsonMatch =
        responseText.match(/```json\s*([\s\S]*?)\s*```/) ||
        responseText.match(/```\s*([\s\S]*?)\s*```/);
      const jsonString = jsonMatch ? jsonMatch[1] : responseText;

      closingData = JSON.parse(jsonString);
    } catch {
      // eslint-disable-next-line no-console
      console.warn('⚠️  Failed to parse JSON response, using raw text');
      // Fallback: treat entire response as narrative
      closingData = {
        narrative: responseText,
        themes: [],
        keyTakeaway: 'Another week in the books.',
      };
    }

    const wordCount = closingData.narrative.split(/\s+/).length;
    // eslint-disable-next-line no-console
    console.log(`✅ Closing commentary generated (${wordCount} words)`);
    // eslint-disable-next-line no-console
    console.log(`   Themes: ${closingData.themes.join(', ')}`);
    // eslint-disable-next-line no-console
    console.log(`   Key takeaway: "${closingData.keyTakeaway}"`);

    // Format the closing as a string for consistency with other sections
    const formattedClosing = `${closingData.narrative}

**Key Themes**: ${closingData.themes.join(', ')}

**Key Takeaway**: ${closingData.keyTakeaway}`;

    return {
      closing: formattedClosing,
    };
  } catch (error) {
    console.error('❌ Failed to generate closing commentary:', error);

    return {
      closing: 'Error generating closing commentary. Another eventful week in the books.',
      errors: [
        ...(state.errors || []),
        `Closing commentary: ${error instanceof Error ? error.message : 'Unknown error'}`,
      ],
    };
  }
};
