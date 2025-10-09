/**
 * Upcoming Matchups Preview Generation Node
 * Generates section previewing next week's matchups.
 */

import { HumanMessage } from '@langchain/core/messages';
import { createGeminiClient } from '../gemini-client';
import { UPCOMING_PROMPT } from '../prompts/sections/upcoming';
import { fetchNextWeekMatchupsTool } from '../tools/upcoming';
import type { RecapReportState } from '../state';

/**
 * Generates the upcoming matchups section using pre-fetched data and Gemini.
 *
 * Strategy: Pre-fetch + Context Injection
 * - Tool executes and fetches next week's matchups
 * - Data is injected directly into the prompt context
 * - Gemini generates preview commentary
 * - Builds anticipation for next week's games
 *
 * This node:
 * 1. Executes upcoming matchups tool to fetch next week's games
 * 2. Injects matchup data with storylines into prompt
 * 3. Sends enriched prompt to Gemini
 * 4. Gemini generates narrative building hype
 * 5. Returns the result in state
 *
 * @param state - Current state (must include week)
 * @returns Updated state with upcoming added
 */
export const upcomingMatchupsNode = async (
  state: RecapReportState,
): Promise<Partial<RecapReportState>> => {
  const { week } = state;

  if (!week) {
    throw new Error('Missing required state for upcoming matchups: week');
  }

  console.log(`\n🔮 Generating upcoming matchups preview for Week ${week + 1}...`);

  try {
    // Pre-fetch upcoming matchups data
    console.log('   📦 Pre-fetching next week matchups...');

    const upcomingData = await fetchNextWeekMatchupsTool.execute({ currentWeek: week });

    const allMatchups = [...upcomingData.afc, ...upcomingData.nfc];

    if (!upcomingData.available || allMatchups.length === 0) {
      console.log('   ⚠️  Next week matchups not available yet');
      return {
        upcoming:
          upcomingData.message ||
          `Week ${week + 1} matchups will be announced soon. Check back for the preview!`,
      };
    }

    console.log('   ✅ Matchups fetched successfully');
    console.log(`      • ${allMatchups.length} matchups scheduled`);

    // Create Gemini client
    const geminiClient = createGeminiClient();

    // Build prompt with pre-fetched data injected
    const context = `
Week ${week + 1} Upcoming Matchups:

## AFC Matchups

${allMatchups
  .filter(m => m.league === 'AFC')
  .map(
    m => `### ${m.team1.teamName} (${m.team1.record}) vs ${m.team2.teamName} (${m.team2.record})
- **Managers**: ${m.team1.ownerName} vs ${m.team2.ownerName}
- **Storyline**: ${m.storyline || 'Standard matchup'}`,
  )
  .join('\n\n')}

## NFC Matchups

${allMatchups
  .filter(m => m.league === 'NFC')
  .map(
    m => `### ${m.team1.teamName} (${m.team1.record}) vs ${m.team2.teamName} (${m.team2.record})
- **Managers**: ${m.team1.ownerName} vs ${m.team2.ownerName}
- **Storyline**: ${m.storyline || 'Standard matchup'}`,
  )
  .join('\n\n')}

${UPCOMING_PROMPT}

Now write the upcoming matchups preview based on this data. Focus on the 2-3 most compelling matchups and build anticipation.`;

    console.log('   🤖 Sending to Gemini with injected context...');

    // Invoke Gemini with data-enriched prompt
    const response = await geminiClient.invoke([
      new HumanMessage({
        content: context,
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
    let upcomingNarrative;
    try {
      // Remove markdown code blocks if present
      const jsonMatch =
        responseText.match(/```json\s*([\s\S]*?)\s*```/) ||
        responseText.match(/```\s*([\s\S]*?)\s*```/);
      const jsonString = jsonMatch ? jsonMatch[1] : responseText;

      const parsedData = JSON.parse(jsonString);
      upcomingNarrative = parsedData.narrative || responseText;
    } catch {
      console.warn('⚠️  Failed to parse JSON response, using raw text');
      upcomingNarrative = responseText;
    }

    const wordCount = upcomingNarrative.split(/\s+/).length;
    console.log(`   ✅ Narrative generated (${wordCount} words)`);

    return {
      upcoming: upcomingNarrative,
    };
  } catch (error) {
    console.error('❌ Failed to generate upcoming matchups:', error);

    return {
      upcoming: `Week ${week + 1} promises more exciting matchups. Stay tuned for the full preview!`,
      errors: [
        ...(state.errors || []),
        `Upcoming matchups: ${error instanceof Error ? error.message : 'Unknown error'}`,
      ],
    };
  }
};
