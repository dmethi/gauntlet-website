/**
 * Generate Static Scenario Summaries
 *
 * Generates AI summaries for all teams in both leagues and saves to a JSON file.
 * This runs ONCE (manually or as a build step), not on every page load.
 *
 * Run with: npx tsx scripts/generate-scenario-summaries.ts
 *
 * Output: data/scenario-summaries.json
 */

import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { config } from 'dotenv';
import { resolve } from 'path';
import { writeFileSync } from 'fs';
import { LEAGUE_IDS } from '../src/lib/constants';
import { sleeperClient } from '../src/lib/sleeper/unified-client';

// Load environment variables
config({ path: resolve(__dirname, '../../../.env') });

const GEMINI_CONFIG = {
  model: 'gemini-2.0-flash',
  temperature: 0.3,
  maxOutputTokens: 4096,
};

interface TeamStanding {
  rosterId: number;
  teamName: string;
  ownerName: string;
  division: number;
  wins: number;
  losses: number;
  pointsFor: number;
}

interface Week14Matchup {
  matchupId: number;
  team1RosterId: number;
  team2RosterId: number;
  team1Name: string;
  team2Name: string;
}

interface ScenarioSummary {
  overallSummary: string;
  seedSummaries: Record<string, string>;
  generatedAt: string;
}

interface LeagueSummaries {
  leagueId: string;
  leagueName: string;
  teams: Record<number, ScenarioSummary>; // rosterId -> summary
}

const createClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY not set');
  }
  return new ChatGoogleGenerativeAI({
    apiKey,
    model: GEMINI_CONFIG.model,
    temperature: GEMINI_CONFIG.temperature,
    maxOutputTokens: GEMINI_CONFIG.maxOutputTokens,
  });
};

const fetchStandings = async (leagueId: string, throughWeek: number): Promise<TeamStanding[]> => {
  const [rosters, users] = await Promise.all([
    sleeperClient.fetchRosters(leagueId),
    sleeperClient.fetchUsers(leagueId),
  ]);

  const userMap = new Map(users.map(u => [u.user_id, u]));

  const matchupPromises = Array.from({ length: throughWeek }, (_, i) =>
    sleeperClient.fetchMatchups(leagueId, i + 1),
  );
  const allMatchups = await Promise.all(matchupPromises);

  return rosters.map(roster => {
    let wins = 0;
    let losses = 0;
    let pointsFor = 0;

    allMatchups.forEach(weekMatchups => {
      const teamMatchup = weekMatchups.find(m => m.roster_id === roster.roster_id);
      if (!teamMatchup) return;

      const points = teamMatchup.points || 0;
      pointsFor += points;

      const opponent = weekMatchups.find(
        m => m.matchup_id === teamMatchup.matchup_id && m.roster_id !== roster.roster_id,
      );
      if (!opponent) return;

      if (points > (opponent.points || 0)) wins++;
      else if (points < (opponent.points || 0)) losses++;
    });

    const owner = userMap.get(roster.owner_id);
    const rosterSettings = roster.settings as any;

    return {
      rosterId: roster.roster_id,
      teamName: owner?.metadata?.team_name || owner?.display_name || `Team ${roster.roster_id}`,
      ownerName: owner?.display_name || owner?.username || 'Unknown',
      division: rosterSettings?.division || 1,
      wins,
      losses,
      pointsFor: Math.round(pointsFor * 100) / 100,
    };
  });
};

const fetchMatchups = async (leagueId: string): Promise<Week14Matchup[]> => {
  const [matchups, rosters, users] = await Promise.all([
    sleeperClient.fetchMatchups(leagueId, 14),
    sleeperClient.fetchRosters(leagueId),
    sleeperClient.fetchUsers(leagueId),
  ]);

  const userMap = new Map(users.map(u => [u.user_id, u]));
  const matchupGroups = new Map<number, typeof matchups>();

  matchups.forEach(m => {
    if (!matchupGroups.has(m.matchup_id)) {
      matchupGroups.set(m.matchup_id, []);
    }
    matchupGroups.get(m.matchup_id)!.push(m);
  });

  const week14Matchups: Week14Matchup[] = [];

  matchupGroups.forEach((teams, matchupId) => {
    if (teams.length !== 2) return;
    const [team1, team2] = teams;
    const roster1 = rosters.find(r => r.roster_id === team1.roster_id);
    const roster2 = rosters.find(r => r.roster_id === team2.roster_id);
    const owner1 = roster1 ? userMap.get(roster1.owner_id) : null;
    const owner2 = roster2 ? userMap.get(roster2.owner_id) : null;

    week14Matchups.push({
      matchupId,
      team1RosterId: team1.roster_id,
      team2RosterId: team2.roster_id,
      team1Name: owner1?.metadata?.team_name || owner1?.display_name || `Team ${team1.roster_id}`,
      team2Name: owner2?.metadata?.team_name || owner2?.display_name || `Team ${team2.roster_id}`,
    });
  });

  return week14Matchups;
};

const buildPrompt = (
  team: TeamStanding,
  standings: TeamStanding[],
  matchups: Week14Matchup[],
  leagueName: string,
): string => {
  // Sort standings by wins, then points
  const sortedStandings = [...standings].sort((a, b) => {
    if (b.wins !== a.wins) return b.wins - a.wins;
    return b.pointsFor - a.pointsFor;
  });

  const standingsStr = sortedStandings
    .map(
      (s, idx) =>
        `${idx + 1}. ${s.teamName} (${s.wins}-${s.losses}, ${s.pointsFor.toFixed(1)} pts, Div ${s.division})`,
    )
    .join('\n');

  const matchupsStr = matchups.map(m => `${m.team1Name} vs ${m.team2Name}`).join('\n');

  // Find this team's opponent
  const teamMatchup = matchups.find(
    m => m.team1RosterId === team.rosterId || m.team2RosterId === team.rosterId,
  );
  const opponent = teamMatchup
    ? team.rosterId === teamMatchup.team1RosterId
      ? teamMatchup.team2Name
      : teamMatchup.team1Name
    : 'Unknown';
  const opponentTeam = standings.find(s => s.teamName === opponent);

  // Find teams with same record for tiebreaker context (CRITICAL)
  const sameRecordTeams = standings
    .filter(s => s.rosterId !== team.rosterId && s.wins === team.wins)
    .sort((a, b) => b.pointsFor - a.pointsFor);

  // Same division rivals with same record - KEY for division winner tiebreaks
  const divisionRivals = sameRecordTeams.filter(s => s.division === team.division);

  let tiebreakerContext = '\nCRITICAL TIEBREAKER SCENARIOS:\n';
  tiebreakerContext += `${team.teamName} currently has ${team.pointsFor.toFixed(1)} total season points.\n`;

  if (divisionRivals.length > 0) {
    tiebreakerContext += `\n*** DIVISION RIVALS WITH SAME RECORD (CRITICAL) ***\n`;
    divisionRivals.forEach(rival => {
      const diff = team.pointsFor - rival.pointsFor;
      const ahead = diff > 0;
      const pointGap = Math.abs(diff).toFixed(1);

      tiebreakerContext += `\n${rival.teamName} (${rival.pointsFor.toFixed(1)} pts):\n`;
      tiebreakerContext += `- Point gap: ${team.teamName} is ${pointGap} pts ${ahead ? 'AHEAD' : 'BEHIND'}\n`;
      tiebreakerContext += `- If BOTH WIN: Both are ${team.wins + 1}-${team.losses} (SAME RECORD!).\n`;
      tiebreakerContext += `  Tiebreaker = TOTAL SEASON POINTS (current + week 14 scoring).\n`;
      if (ahead) {
        tiebreakerContext += `  ${team.teamName} wins division UNLESS ${rival.teamName} outscores them by ${pointGap}+ pts this week.\n`;
      } else {
        tiebreakerContext += `  ${rival.teamName} wins division UNLESS ${team.teamName} outscores them by ${pointGap}+ pts this week.\n`;
      }
      tiebreakerContext += `- If BOTH LOSE: Both are ${team.wins}-${team.losses + 1} (SAME RECORD!).\n`;
      tiebreakerContext += `  Same tiebreaker applies - ${ahead ? team.teamName : rival.teamName} wins unless outscored.\n`;
      tiebreakerContext += `- If ${team.teamName} WINS and ${rival.teamName} LOSES: ${team.teamName} wins division outright (better record).\n`;
      tiebreakerContext += `- If ${team.teamName} LOSES and ${rival.teamName} WINS: ${rival.teamName} wins division outright (better record).\n`;
    });
  }

  const otherRivals = sameRecordTeams.filter(s => s.division !== team.division);
  if (otherRivals.length > 0) {
    tiebreakerContext += `\nSame-record teams in OTHER divisions (for wild card):\n`;
    otherRivals.forEach(rival => {
      const diff = team.pointsFor - rival.pointsFor;
      tiebreakerContext += `- ${rival.teamName} (Div ${rival.division}): ${diff > 0 ? '+' : ''}${diff.toFixed(1)} pts difference\n`;
    });
  }

  return `You are a fantasy football analyst. This is Week 14, the FINAL regular season week for ${leagueName}.

STANDINGS (through Week 13):
${standingsStr}

WEEK 14 MATCHUPS:
${matchupsStr}

RULES:
- 12 teams, 3 divisions, top 6 make playoffs
- Seeds 1-3: Division winners (by record, then TOTAL SEASON POINTS)
- Seeds 4-6: Best remaining (wild cards)
- Tiebreaker: TOTAL SEASON POINTS (NOT head-to-head)
${tiebreakerContext}
ANALYZE: ${team.teamName}
- Record: ${team.wins}-${team.losses}, Points: ${team.pointsFor.toFixed(1)}, Division ${team.division}
- Opponent: ${opponent}${opponentTeam ? ` (${opponentTeam.wins}-${opponentTeam.losses})` : ''}
- IMPORTANT: Only explain seeds #2-#6. This team CANNOT be #1 seed unless they have the best record.

CRITICAL RULES - DO NOT HALLUCINATE:
- If both teams WIN or both LOSE, they have THE SAME RECORD. Never say "better record"!
- When same record: tiebreaker = TOTAL SEASON POINTS (current + week 14 scoring)
- ALWAYS include points condition when rival's result is unknown!
- Example: If Team A is 10 pts AHEAD of rival Team B:
  "WIN = #2 seed (unless Team B also wins AND outscores you by 10+ pts)"
- Example: If Team A is 10 pts BEHIND rival Team B:
  "WIN = #2 seed ONLY IF you outscore Team B by 10+ pts (or Team B loses)"
- The team that is BEHIND must outscore to WIN the tiebreaker
- The team that is AHEAD only needs to NOT get outscored by the gap
- Only include realistically achievable seeds

JSON format:
{
  "overallSummary": "One sentence: key matchup and tiebreaker situation",
  "seedSummaries": {
    "2": "1-2 sentences max",
    "3": "1-2 sentences max"
  }
}`;
};

const generateSummary = async (
  client: ChatGoogleGenerativeAI,
  team: TeamStanding,
  standings: TeamStanding[],
  matchups: Week14Matchup[],
  leagueName: string,
  retries: number = 3,
): Promise<ScenarioSummary> => {
  const prompt = buildPrompt(team, standings, matchups, leagueName);

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const response = await client.invoke(prompt);
      let content = response.content.toString().trim();

      // Clean JSON
      if (content.startsWith('```json')) content = content.slice(7);
      if (content.startsWith('```')) content = content.slice(3);
      if (content.endsWith('```')) content = content.slice(0, -3);

      const parsed = JSON.parse(content.trim());

      return {
        overallSummary: parsed.overallSummary || '',
        seedSummaries: parsed.seedSummaries || {},
        generatedAt: new Date().toISOString(),
      };
    } catch (error) {
      if (attempt < retries) {
        console.log(`  Retry ${attempt}/${retries} for ${team.teamName}...`);
        await new Promise(r => setTimeout(r, 2000)); // Wait before retry
      } else {
        console.error(`  Failed after ${retries} attempts for ${team.teamName}:`, error);
        return {
          overallSummary: 'Unable to generate summary',
          seedSummaries: {},
          generatedAt: new Date().toISOString(),
        };
      }
    }
  }

  // Should never reach here, but TypeScript needs a return
  return {
    overallSummary: 'Unable to generate summary',
    seedSummaries: {},
    generatedAt: new Date().toISOString(),
  };
};

const processLeague = async (
  leagueId: string,
  leagueName: 'AFC' | 'NFC',
  throughWeek: number,
): Promise<LeagueSummaries> => {
  console.log(`\n📊 Processing ${leagueName} league...`);

  const [standings, matchups] = await Promise.all([
    fetchStandings(leagueId, throughWeek),
    fetchMatchups(leagueId),
  ]);

  console.log(`  Found ${standings.length} teams, ${matchups.length} matchups`);

  const client = createClient();
  const summaries: Record<number, ScenarioSummary> = {};

  for (let i = 0; i < standings.length; i++) {
    const team = standings[i];
    console.log(`  [${i + 1}/${standings.length}] Generating summary for ${team.teamName}...`);

    summaries[team.rosterId] = await generateSummary(client, team, standings, matchups, leagueName);

    // Rate limit - wait between requests
    if (i < standings.length - 1) {
      await new Promise(r => setTimeout(r, 1500));
    }
  }

  return {
    leagueId,
    leagueName,
    teams: summaries,
  };
};

const main = async () => {
  console.log('🚀 Generating Static Scenario Summaries');
  console.log('This will take a few minutes...\n');

  const throughWeek = 13; // Current completed week

  try {
    // Process both leagues
    const [afcSummaries, nfcSummaries] = await Promise.all([
      processLeague(LEAGUE_IDS.AFC, 'AFC', throughWeek),
      processLeague(LEAGUE_IDS.NFC, 'NFC', throughWeek),
    ]);

    const output = {
      generatedAt: new Date().toISOString(),
      throughWeek,
      afc: afcSummaries,
      nfc: nfcSummaries,
    };

    // Save to file in src/data for proper module resolution
    const outputPath = resolve(__dirname, '../src/data/scenario-summaries.json');
    writeFileSync(outputPath, JSON.stringify(output, null, 2));

    console.log(`\n✅ Summaries saved to: ${outputPath}`);
    console.log(`   AFC: ${Object.keys(afcSummaries.teams).length} teams`);
    console.log(`   NFC: ${Object.keys(nfcSummaries.teams).length} teams`);
  } catch (error) {
    console.error('Failed to generate summaries:', error);
    process.exit(1);
  }
};

main();
