/**
 * Standings & Playoff Picture Generation Node
 * Generates section showing current standings and playoff positioning.
 */

import { HumanMessage } from '@langchain/core/messages';
import { createGeminiClient } from '../gemini-client';
import { buildStandingsPrompt } from '../prompts/sections/standings';
import { fetchStandingsTool } from '../tools/standings';
import { LEAGUE_IDS } from '@/lib/constants';
import type { RecapReportState } from '../state';

/**
 * Generates the standings section using pre-fetched data and Gemini.
 *
 * Strategy: Pre-fetch + Context Injection
 * - Tool executes and fetches standings for both leagues
 * - Data is injected directly into the prompt context
 * - Gemini generates commentary on playoff picture
 * - Covers both AFC and NFC leagues
 *
 * This node:
 * 1. Executes standings tool to fetch current standings
 * 2. Injects standings data with playoff seeding into prompt
 * 3. Sends enriched prompt to Gemini
 * 4. Gemini generates narrative covering both leagues
 * 5. Returns the result in state
 *
 * @param state - Current state (must include week)
 * @returns Updated state with standings added
 */
export const standingsNode = async (
  state: RecapReportState,
): Promise<Partial<RecapReportState>> => {
  const { week } = state;

  if (!week) {
    throw new Error('Missing required state for standings: week');
  }

  console.log(`\n📋 Generating standings for Week ${week}...`);

  try {
    // Pre-fetch standings data
    console.log('   📦 Pre-fetching standings data...');

    const standingsData = await fetchStandingsTool.execute({ week });

    console.log('   ✅ Standings fetched successfully');
    console.log(
      `      • AFC: ${standingsData.afc.allTeams.length} teams in ${standingsData.afc.divisions.length} divisions`,
    );
    console.log(
      `      • NFC: ${standingsData.nfc.allTeams.length} teams in ${standingsData.nfc.divisions.length} divisions`,
    );

    // Create Gemini client
    const geminiClient = createGeminiClient();

    // Helper to format divisions
    const formatDivisions = (divisions: typeof standingsData.afc.divisions) => {
      return divisions
        .map(
          div => `
### ${div.name}
${div.teams
  .map(
    team =>
      `${team.playoffSeed ? `[${team.playoffSeed}] ` : ''}${team.ownerName} (${team.teamName}): ${team.wins}-${team.losses}${team.ties > 0 ? `-${team.ties}` : ''} - ${team.pointsFor.toFixed(1)} PF${team.playoffSeed ? ` (Playoff Seed ${team.playoffSeed})` : ''}`,
  )
  .join('\n')}`,
        )
        .join('\n');
    };

    // Build prompt with division-grouped data
    const context = `
Week ${week} Standings Data:

## Gauntlet AFC
${formatDivisions(standingsData.afc.divisions)}

### Playoff Seeding (AFC)
Division Winners (Seeds 1-3):
${standingsData.afc.allTeams
  .filter(t => t.playoffSeed && t.playoffSeed <= 3)
  .sort((a, b) => (a.playoffSeed || 0) - (b.playoffSeed || 0))
  .map(
    team =>
      `[${team.playoffSeed}] ${team.ownerName} (${team.teamName}) - ${team.wins}-${team.losses}${team.ties > 0 ? `-${team.ties}` : ''}`,
  )
  .join('\n')}

Wild Card (Seeds 4-6):
${standingsData.afc.allTeams
  .filter(t => t.playoffSeed && t.playoffSeed >= 4 && t.playoffSeed <= 6)
  .sort((a, b) => (a.playoffSeed || 0) - (b.playoffSeed || 0))
  .map(
    team =>
      `[${team.playoffSeed}] ${team.ownerName} (${team.teamName}) - ${team.wins}-${team.losses}${team.ties > 0 ? `-${team.ties}` : ''}`,
  )
  .join('\n')}

On the Bubble (Seeds 7-9):
${standingsData.afc.allTeams
  .filter(t => !t.playoffSeed && t.rank <= 9)
  .sort((a, b) => a.rank - b.rank)
  .map(
    team =>
      `#${team.rank} ${team.ownerName} (${team.teamName}) - ${team.wins}-${team.losses}${team.ties > 0 ? `-${team.ties}` : ''}`,
  )
  .join('\n')}

## Gauntlet NFC
${formatDivisions(standingsData.nfc.divisions)}

### Playoff Seeding (NFC)
Division Winners (Seeds 1-3):
${standingsData.nfc.allTeams
  .filter(t => t.playoffSeed && t.playoffSeed <= 3)
  .sort((a, b) => (a.playoffSeed || 0) - (b.playoffSeed || 0))
  .map(
    team =>
      `[${team.playoffSeed}] ${team.ownerName} (${team.teamName}) - ${team.wins}-${team.losses}${team.ties > 0 ? `-${team.ties}` : ''}`,
  )
  .join('\n')}

Wild Card (Seeds 4-6):
${standingsData.nfc.allTeams
  .filter(t => t.playoffSeed && t.playoffSeed >= 4 && t.playoffSeed <= 6)
  .sort((a, b) => (a.playoffSeed || 0) - (b.playoffSeed || 0))
  .map(
    team =>
      `[${team.playoffSeed}] ${team.ownerName} (${team.teamName}) - ${team.wins}-${team.losses}${team.ties > 0 ? `-${team.ties}` : ''}`,
  )
  .join('\n')}

On the Bubble (Seeds 7-9):
${standingsData.nfc.allTeams
  .filter(t => !t.playoffSeed && t.rank <= 9)
  .sort((a, b) => a.rank - b.rank)
  .map(
    team =>
      `#${team.rank} ${team.ownerName} (${team.teamName}) - ${team.wins}-${team.losses}${team.ties > 0 ? `-${team.ties}` : ''}`,
  )
  .join('\n')}

${buildStandingsPrompt(week)}

Now write the standings narrative based on this data. Remember to cover BOTH leagues (AFC and NFC).`;

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
    let standingsNarrative;
    try {
      // Remove markdown code blocks if present
      const jsonMatch =
        responseText.match(/```json\s*([\s\S]*?)\s*```/) ||
        responseText.match(/```\s*([\s\S]*?)\s*```/);
      const jsonString = jsonMatch ? jsonMatch[1] : responseText;

      const parsedData = JSON.parse(jsonString);
      standingsNarrative = parsedData.narrative || responseText;
    } catch {
      console.warn('⚠️  Failed to parse JSON response, using raw text');
      standingsNarrative = responseText;
    }

    const wordCount = standingsNarrative.split(/\s+/).length;
    console.log(`   ✅ Narrative generated (${wordCount} words)`);

    // Convert divisions to the format expected by UI
    const formatLeagueForUI = (
      leagueData: typeof standingsData.afc,
      leagueId: string,
      leagueName: string,
    ) => {
      const divisionsRecord: Record<string, any[]> = {};

      leagueData.divisions.forEach(div => {
        divisionsRecord[div.name] = div.teams.map(team => ({
          rosterId: team.rosterId,
          teamName: team.teamName,
          ownerName: team.ownerName,
          wins: team.wins,
          losses: team.losses,
          ties: team.ties,
          points: team.pointsFor,
          leagueId: leagueId,
          division: team.division,
          playoffSeed: team.playoffSeed,
        }));
      });

      return {
        leagueId,
        leagueName,
        divisions: divisionsRecord,
      };
    };

    return {
      standings: standingsNarrative,
      standingsData: {
        afc: formatLeagueForUI(standingsData.afc, LEAGUE_IDS.AFC, 'Gauntlet AFC'),
        nfc: formatLeagueForUI(standingsData.nfc, LEAGUE_IDS.NFC, 'Gauntlet NFC'),
      },
    };
  } catch (error) {
    console.error('❌ Failed to generate standings:', error);

    // Even if narrative generation fails, try to return the structured data
    try {
      const standingsData = await fetchStandingsTool.execute({ week });

      const formatLeagueForUI = (
        leagueData: typeof standingsData.afc,
        leagueId: string,
        leagueName: string,
      ) => {
        const divisionsRecord: Record<string, any[]> = {};

        leagueData.divisions.forEach(div => {
          divisionsRecord[div.name] = div.teams.map(team => ({
            rosterId: team.rosterId,
            teamName: team.teamName,
            ownerName: team.ownerName,
            wins: team.wins,
            losses: team.losses,
            ties: team.ties,
            points: team.pointsFor,
            leagueId: leagueId,
            division: team.division,
            playoffSeed: team.playoffSeed,
          }));
        });

        return {
          leagueId,
          leagueName,
          divisions: divisionsRecord,
        };
      };

      return {
        standings: `The playoff picture continues to take shape as Week ${week} concludes.`,
        standingsData: {
          afc: formatLeagueForUI(standingsData.afc, LEAGUE_IDS.AFC, 'Gauntlet AFC'),
          nfc: formatLeagueForUI(standingsData.nfc, LEAGUE_IDS.NFC, 'Gauntlet NFC'),
        },
        errors: [
          ...(state.errors || []),
          `Standings: ${error instanceof Error ? error.message : 'Unknown error'}`,
        ],
      };
    } catch (dataError) {
      // If even fetching data fails, return just the error
      console.error('❌ Failed to fetch standings data:', dataError);
      return {
        standings: `The playoff picture continues to take shape as Week ${week} concludes.`,
        errors: [
          ...(state.errors || []),
          `Standings: ${error instanceof Error ? error.message : 'Unknown error'}`,
        ],
      };
    }
  }
};
