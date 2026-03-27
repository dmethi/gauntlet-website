/**
 * Power Rankings Generation Node
 * Generates commentary on power rankings movement and tier structure.
 */

import { HumanMessage } from '@langchain/core/messages';
import { createGeminiClient } from '../gemini-client';
import { POWER_RANKINGS_PROMPT } from '../prompts/sections/power-rankings';
import { fetchPowerRankingsTool } from '../tools/power-rankings';
import type { RecapReportState } from '../state';
import { debugLog } from '@/lib/debug-log';

/**
 * Generates the power rankings section using pre-fetched data and Gemini.
 *
 * Strategy: Pre-fetch + Context Injection
 * - Tool executes and fetches rankings with movement tracking
 * - Data is injected directly into the prompt context
 * - Gemini generates commentary on movement and tier structure
 * - Covers ALL tiers, not just the top
 *
 * This node:
 * 1. Executes power rankings tool to fetch current rankings
 * 2. Injects rankings data with tier structure into prompt
 * 3. Sends enriched prompt to Gemini
 * 4. Gemini generates narrative covering all tiers
 * 5. Returns the result in state
 *
 * @param state - Current state (must include week)
 * @returns Updated state with powerRankings added
 */
export const powerRankingsNode = async (
  state: RecapReportState,
): Promise<Partial<RecapReportState>> => {
  const { week } = state;

  if (!week) {
    throw new Error('Missing required state for power rankings: week');
  }

  debugLog(`\n📊 Generating power rankings for Week ${week}...`);

  try {
    // Pre-fetch power rankings data
    debugLog('   📦 Pre-fetching power rankings data...');

    const rankingsData = await fetchPowerRankingsTool.execute({ currentWeek: week });

    // Validate tool result
    if (!rankingsData || typeof rankingsData !== 'object') {
      throw new Error(`Power rankings tool returned invalid data: ${JSON.stringify(rankingsData)}`);
    }

    const tiers = rankingsData.changes.tiers || [];
    const biggestRiser = rankingsData.changes.biggestRiser || null;
    const biggestFaller = rankingsData.changes.biggestFaller || null;
    const notableChanges = rankingsData.changes.notableChanges || [];

    debugLog('   ✅ Rankings fetched successfully');
    debugLog(`      • ${tiers.length} tiers identified`);
    debugLog(
      `      • Biggest riser: ${biggestRiser ? `${biggestRiser.teamName} (↑${biggestRiser.movement})` : 'None'}`,
    );
    debugLog(
      `      • Biggest faller: ${biggestFaller ? `${biggestFaller.teamName} (↓${Math.abs(biggestFaller.movement)})` : 'None'}`,
    );

    // Create Gemini client
    const geminiClient = createGeminiClient();

    // Build prompt with pre-fetched data injected
    const context = `
Week ${week} Power Rankings Data:

## Tier Structure (${tiers.length} tiers)

${tiers
  .map(tier => {
    return `### ${tier.label} (${tier.teamCount} teams, scores: ${tier.scoreRange.min.toFixed(1)}-${tier.scoreRange.max.toFixed(1)}, avg: ${tier.avgScore.toFixed(1)})
${tier.teams
  .map(team => {
    const movement =
      team.movement > 0
        ? `↑${team.movement}`
        : team.movement < 0
          ? `↓${Math.abs(team.movement)}`
          : '—';
    return `#${team.rank} ${movement} ${team.ownerName} (${team.teamName}) - ${team.record} - ${team.pointsFor.toFixed(1)} PF - ${team.league}`;
  })
  .join('\n')}`;
  })
  .join('\n\n')}

## Notable Changes

### Biggest Riser
${biggestRiser ? `${biggestRiser.ownerName} (${biggestRiser.teamName}) - Moved from #${biggestRiser.previousRank} to #${biggestRiser.rank} (↑${biggestRiser.movement})` : 'None'}

### Biggest Faller
${biggestFaller ? `${biggestFaller.ownerName} (${biggestFaller.teamName}) - Moved from #${biggestFaller.previousRank} to #${biggestFaller.rank} (↓${Math.abs(biggestFaller.movement)})` : 'None'}

### Other Notable Changes (moved 3+ spots)
${notableChanges.map(team => `- ${team.ownerName} (${team.teamName}): #${team.previousRank} → #${team.rank} (${team.movement > 0 ? `↑${team.movement}` : `↓${Math.abs(team.movement)}`})`).join('\n')}

${POWER_RANKINGS_PROMPT}

**IMPORTANT**: Cover ALL tiers in your narrative, not just the top! Mention teams from the top tier, middle tiers, AND bottom tier.

Now write the power rankings narrative based on this data.`;

    debugLog('   🤖 Sending to Gemini with injected context...');

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
    let rankingsNarrative;
    try {
      // Remove markdown code blocks if present
      const jsonMatch =
        responseText.match(/```json\s*([\s\S]*?)\s*```/) ||
        responseText.match(/```\s*([\s\S]*?)\s*```/);
      const jsonString = jsonMatch ? jsonMatch[1] : responseText;

      const parsedData = JSON.parse(jsonString);
      rankingsNarrative = parsedData.narrative || responseText;
    } catch {
      console.warn('⚠️  Failed to parse JSON response, using raw text');
      rankingsNarrative = responseText;
    }

    const wordCount = rankingsNarrative.split(/\s+/).length;
    debugLog(`   ✅ Narrative generated (${wordCount} words)`);

    // Extract full rankings from tiers for UI rendering
    const allRankings = tiers.flatMap(tier => tier.teams);

    return {
      powerRankings: rankingsNarrative,
      powerRankingsData: {
        rankings: allRankings,
        tiers,
        biggestRiser,
        biggestFaller,
        notableChanges,
      },
    };
  } catch (error) {
    console.error('❌ Failed to generate power rankings:', error);

    return {
      powerRankings: `Power rankings continue to evolve as Week ${week} concludes.`,
      errors: [
        ...(state.errors || []),
        `Power rankings: ${error instanceof Error ? error.message : 'Unknown error'}`,
      ],
    };
  }
};
