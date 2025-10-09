/**
 * Hall of Fame & Hall of Shame Generation Node
 * Generates both sections using the unified enhanced tool.
 */

import { HumanMessage } from '@langchain/core/messages';
import { createGeminiClient } from '../gemini-client';
import { HALL_OF_FAME_PROMPT } from '../prompts/sections/hall-of-fame';
import { HALL_OF_SHAME_PROMPT } from '../prompts/sections/hall-of-shame';
import {
  calculateTopPositionPerformersEnhanced,
  checkAllHistoricalRecordsTool,
} from '../tools/hall-of-fame-enhanced';
import { fetchHallOfShameTool } from '../tools/hall-of-shame';
import type { RecapReportState } from '../state';

/**
 * Generates both Hall of Fame and Hall of Shame sections using enhanced tool.
 *
 * Strategy: Pre-fetch + Context Injection
 * - Tools execute and fetch all data upfront
 * - Data is injected directly into the prompt context
 * - Gemini weaves the facts into narrative (no computation)
 * - Guarantees accurate numbers (no hallucination)
 *
 * This node:
 * 1. Executes both enhanced tools to fetch comprehensive data
 * 2. Generates Hall of Fame narrative (celebrates top performers)
 * 3. Generates Hall of Shame narrative (roasts poor performances)
 * 4. Returns both sections in state
 *
 * @param state - Current state (must include week)
 * @returns Updated state with hallOfFame and hallOfShame added
 */
export const hallOfFameNode = async (
  state: RecapReportState,
): Promise<Partial<RecapReportState>> => {
  const { week } = state;

  if (!week) {
    throw new Error('Missing required state for hall of fame: week');
  }

  console.log(`\n🏆 Generating Hall of Fame & Hall of Shame for Week ${week}...`);

  const errors: string[] = [];
  let hallOfFameNarrative: string | undefined;
  let hallOfShameNarrative: string | undefined;

  try {
    // Pre-fetch all data using enhanced tools
    console.log('   📦 Pre-fetching data from enhanced tools...');

    const [historicalRecords, topPerformers, shameData] = await Promise.all([
      checkAllHistoricalRecordsTool.execute({ week }),
      calculateTopPositionPerformersEnhanced.execute({ week }),
      fetchHallOfShameTool.execute({ week }),
    ]);

    // Validate tool results
    if (!historicalRecords || typeof historicalRecords !== 'object') {
      throw new Error(
        `Historical records tool returned invalid data: ${JSON.stringify(historicalRecords)}`,
      );
    }
    if (!topPerformers || typeof topPerformers !== 'object') {
      throw new Error(
        `Top performers tool returned invalid data: ${JSON.stringify(topPerformers)}`,
      );
    }
    if (!shameData || typeof shameData !== 'object') {
      throw new Error(`Hall of Shame tool returned invalid data: ${JSON.stringify(shameData)}`);
    }

    const recordBreakdowns = historicalRecords.recordBreakdowns || [];

    console.log('   ✅ Data fetched successfully');
    console.log(`      • ${recordBreakdowns.filter(r => r.isRecord).length} new all-time records`);
    console.log(`      • ${recordBreakdowns.filter(r => r.isTopTen).length} top-10 appearances`);
    console.log(`      • Top 5 performers at 6 positions`);
    console.log(`      • ${shameData.biggestBusts.length} biggest busts`);
    console.log(`      • ${shameData.worstTeams.length} worst teams`);

    // Create Gemini client
    const geminiClient = createGeminiClient();

    // ============================================================
    // HALL OF FAME SECTION
    // ============================================================
    try {
      console.log('   🤖 Generating Hall of Fame narrative...');

      // Build context-enriched prompt for Hall of Fame
      const newRecords = recordBreakdowns.filter(r => r.isRecord);
      const top10Appearances = recordBreakdowns.filter(r => r.isTopTen && !r.isRecord);

      const fameContext = `
Week ${week} Data:

## Historical Records
${newRecords.length > 0 ? '### NEW ALL-TIME RECORDS SET:' : '### No New All-Time Records'}
${newRecords.map(record => `- **${record.categoryName}**: ${record.weekValue} (Manager: ${record.manager}, Team: ${record.teamName}, League: ${record.league})`).join('\n')}

${
  top10Appearances.length > 0
    ? `\n### Top 10 Historical Performances:\n${top10Appearances
        .slice(0, 5)
        .map(
          record =>
            `- **${record.categoryName}** (#${record.weekRank}): ${record.weekValue} (${record.manager})`,
        )
        .join('\n')}`
    : ''
}

## Top Position Performers (Top 5 Each)

### Quarterbacks
${
  (topPerformers.QB || []).length > 0
    ? (topPerformers.QB || [])
        .slice(0, 5)
        .map(
          (p, i) =>
            `${i + 1}. ${p.playerName} - ${p.points.toFixed(1)} pts${p.ownership.map((o: any) => `\n   ${o.league}: ${o.manager} (${o.teamName}) - ${o.status}`).join('')}`,
        )
        .join('\n')
    : 'No QB performances to highlight'
}

### Running Backs
${
  (topPerformers.RB || []).length > 0
    ? (topPerformers.RB || [])
        .slice(0, 5)
        .map(
          (p, i) =>
            `${i + 1}. ${p.playerName} - ${p.points.toFixed(1)} pts${p.ownership.map((o: any) => `\n   ${o.league}: ${o.manager} (${o.teamName}) - ${o.status}`).join('')}`,
        )
        .join('\n')
    : 'No RB performances to highlight'
}

### Wide Receivers
${
  (topPerformers.WR || []).length > 0
    ? (topPerformers.WR || [])
        .slice(0, 5)
        .map(
          (p, i) =>
            `${i + 1}. ${p.playerName} - ${p.points.toFixed(1)} pts${p.ownership.map((o: any) => `\n   ${o.league}: ${o.manager} (${o.teamName}) - ${o.status}`).join('')}`,
        )
        .join('\n')
    : 'No WR performances to highlight'
}

### Tight Ends
${
  (topPerformers.TE || []).length > 0
    ? (topPerformers.TE || [])
        .slice(0, 5)
        .map(
          (p, i) =>
            `${i + 1}. ${p.playerName} - ${p.points.toFixed(1)} pts${p.ownership.map((o: any) => `\n   ${o.league}: ${o.manager} (${o.teamName}) - ${o.status}`).join('')}`,
        )
        .join('\n')
    : 'No TE performances to highlight'
}

${HALL_OF_FAME_PROMPT}

Now write the Hall of Fame narrative based on this data.`;

      const fameResponse = await geminiClient.invoke([new HumanMessage({ content: fameContext })]);

      // Parse response
      let fameText = '';
      if (typeof fameResponse.content === 'string') {
        fameText = fameResponse.content;
      } else if (Array.isArray(fameResponse.content)) {
        fameText = fameResponse.content
          .map(item => (typeof item === 'string' ? item : 'text' in item ? item.text : ''))
          .join('');
      }

      // Extract JSON or use raw text
      try {
        const jsonMatch =
          fameText.match(/```json\s*([\s\S]*?)\s*```/) || fameText.match(/```\s*([\s\S]*?)\s*```/);
        const jsonString = jsonMatch ? jsonMatch[1] : fameText;
        const fameData = JSON.parse(jsonString);
        hallOfFameNarrative = fameData.narrative || fameText;
      } catch {
        hallOfFameNarrative = fameText;
      }

      const fameWordCount = (hallOfFameNarrative || '').split(/\s+/).length;
      console.log(`   ✅ Hall of Fame narrative generated (${fameWordCount} words)`);
    } catch (error) {
      console.error('❌ Failed to generate Hall of Fame:', error);
      errors.push(`Hall of Fame: ${error instanceof Error ? error.message : 'Unknown error'}`);
      hallOfFameNarrative = `Week ${week} featured some outstanding performances across the league.`;
    }

    // ============================================================
    // HALL OF SHAME SECTION
    // ============================================================
    try {
      console.log('   🤖 Generating Hall of Shame narrative...');

      // Build context-enriched prompt for Hall of Shame
      const shameRecords = recordBreakdowns.filter(
        r =>
          r.isTopTen &&
          (r.categoryName.toLowerCase().includes('lowest') ||
            r.categoryName.toLowerCase().includes('worst')),
      );

      const shameContext = `
Week ${week} Data:

## Worst Teams (Bottom Scorers)
${shameData.worstTeams.length > 0 ? '### Bottom Teams This Week:' : '### No low scoring teams'}
${shameData.worstTeams
  .slice(0, 5)
  .map(
    team =>
      `${team.rank}. **${team.manager}** (${team.teamName}) - ${team.totalScore.toFixed(2)} pts [${team.league}]`,
  )
  .join('\n')}

## Biggest Busts (Projection Disappointments)
${shameData.biggestBusts.length > 0 ? '### Top 10 Disappointments:' : '### No major busts'}
${shameData.biggestBusts
  .slice(0, 10)
  .map(
    bust =>
      `- **${bust.playerName}** (${bust.position}): ${bust.actual.toFixed(1)} pts (Projected: ${bust.projected.toFixed(1)}, Diff: ${bust.diff.toFixed(1)})${bust.ownedBy.map((o: any) => `\n   ${o.league}: ${o.manager} (${o.teamName}) - ${o.started ? 'Started' : 'Benched'}`).join('')}`,
  )
  .join('\n')}

${shameRecords.length > 0 ? '\n## Historical Low Performances:' : ''}
${shameRecords
  .slice(0, 5)
  .map(
    record =>
      `- **${record.categoryName}** (#${record.weekRank}): ${record.weekValue} (${record.manager})`,
  )
  .join('\n')}

${HALL_OF_SHAME_PROMPT}

Now write the Hall of Shame narrative based on this data.`;

      const shameResponse = await geminiClient.invoke([
        new HumanMessage({ content: shameContext }),
      ]);

      // Parse response
      let shameText = '';
      if (typeof shameResponse.content === 'string') {
        shameText = shameResponse.content;
      } else if (Array.isArray(shameResponse.content)) {
        shameText = shameResponse.content
          .map(item => (typeof item === 'string' ? item : 'text' in item ? item.text : ''))
          .join('');
      }

      // Extract JSON or use raw text
      try {
        const jsonMatch =
          shameText.match(/```json\s*([\s\S]*?)\s*```/) ||
          shameText.match(/```\s*([\s\S]*?)\s*```/);
        const jsonString = jsonMatch ? jsonMatch[1] : shameText;
        const shameData = JSON.parse(jsonString);
        hallOfShameNarrative = shameData.narrative || shameText;
      } catch {
        hallOfShameNarrative = shameText;
      }

      const shameWordCount = (hallOfShameNarrative || '').split(/\s+/).length;
      console.log(`   ✅ Hall of Shame narrative generated (${shameWordCount} words)`);
    } catch (error) {
      console.error('❌ Failed to generate Hall of Shame:', error);
      errors.push(`Hall of Shame: ${error instanceof Error ? error.message : 'Unknown error'}`);
      hallOfShameNarrative = `Week ${week} also had its share of disappointments.`;
    }

    return {
      hallOfFame: hallOfFameNarrative,
      hallOfShame: hallOfShameNarrative,
      hallOfFameData: {
        recordBreakdowns,
        topPerformers,
      },
      hallOfShameData: {
        worstTeams: shameData.worstTeams,
        biggestBusts: shameData.biggestBusts,
      },
      errors: errors.length > 0 ? [...(state.errors || []), ...errors] : state.errors,
    };
  } catch (error) {
    console.error('❌ Failed to generate Hall of Fame/Shame sections:', error);

    return {
      hallOfFame: hallOfFameNarrative || `Week ${week} featured some outstanding performances.`,
      hallOfShame: hallOfShameNarrative || `Week ${week} also had its share of disappointments.`,
      errors: [
        ...(state.errors || []),
        `Hall of Fame/Shame: ${error instanceof Error ? error.message : 'Unknown error'}`,
      ],
    };
  }
};
