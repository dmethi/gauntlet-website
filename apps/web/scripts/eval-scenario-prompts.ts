/**
 * Evaluation Script: Test different prompts for scenario summarization
 * 
 * Tests two approaches:
 * 1. Minimal context: Just standings + matchups (let Gemini figure it out)
 * 2. Full context: Include all calculated paths and ask Gemini to summarize
 * 
 * Run with: npx tsx scripts/eval-scenario-prompts.ts
 */

import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { config } from 'dotenv';
import { resolve } from 'path';

// Load environment variables from root .env
config({ path: resolve(__dirname, '../../../.env') });

const GEMINI_CONFIG = {
  model: 'gemini-2.0-flash',
  temperature: 0.3,
  maxOutputTokens: 4096,
};

// Sample test data (you can replace with real data)
const TEST_DATA = {
  standings: [
    { rank: 1, teamName: 'lol jerry jones', ownerName: 'nkjchamp', record: '8-5', points: 1626.8, division: 1 },
    { rank: 2, teamName: 'Drake Maye Lover', ownerName: 'hunterzogg', record: '8-5', points: 1617.0, division: 1 },
    { rank: 3, teamName: 'To Infinity and Bijan', ownerName: 'kanzelm3', record: '11-2', points: 1568.7, division: 2 },
    { rank: 4, teamName: 'scboom5', ownerName: 'scboom5', record: '8-5', points: 1502.8, division: 3 },
    { rank: 5, teamName: 'vchak', ownerName: 'vchak', record: '7-6', points: 1520.0, division: 1 },
    { rank: 6, teamName: 'NielGetsCarried', ownerName: 'NielGetsCarried', record: '7-6', points: 1480.0, division: 2 },
    { rank: 7, teamName: '2 Dolla Balla$', ownerName: '2dolla', record: '7-6', points: 1450.0, division: 3 },
    { rank: 8, teamName: 'achak7', ownerName: 'achak7', record: '7-6', points: 1498.9, division: 3 },
    { rank: 9, teamName: 'Quonspiracy Theorists', ownerName: 'quon', record: '6-7', points: 1420.0, division: 2 },
    { rank: 10, teamName: 'Team10', ownerName: 'owner10', record: '5-8', points: 1380.0, division: 1 },
    { rank: 11, teamName: 'Team11', ownerName: 'owner11', record: '4-9', points: 1320.0, division: 2 },
    { rank: 12, teamName: 'Team12', ownerName: 'owner12', record: '3-10', points: 1250.0, division: 3 },
  ],
  matchups: [
    { team1: 'lol jerry jones', team2: 'vchak' },
    { team1: 'Drake Maye Lover', team2: 'NielGetsCarried' },
    { team1: 'To Infinity and Bijan', team2: 'Team10' },
    { team1: 'scboom5', team2: '2 Dolla Balla$' },
    { team1: 'achak7', team2: 'Quonspiracy Theorists' },
    { team1: 'Team11', team2: 'Team12' },
  ],
  targetTeam: 'lol jerry jones',
  scenarios: {
    2: { probability: 0.57, winPaths: 32, losePaths: 0 },
    3: { probability: 0.02, winPaths: 0, losePaths: 8 },
    4: { probability: 0.41, winPaths: 0, losePaths: 24 },
  },
};

// Additional context: lol jerry jones has 9.8 more points than Drake Maye Lover
// Both are 8-5. If both win, tiebreaker is total points.

/**
 * PROMPT 1: Minimal Context
 * Just standings and matchups - let Gemini reason about it
 */
const buildMinimalPrompt = () => {
  const standingsStr = TEST_DATA.standings
    .map(s => `${s.rank}. ${s.teamName} (${s.record}, ${s.points} pts, Div ${s.division})`)
    .join('\n');
  
  const matchupsStr = TEST_DATA.matchups
    .map(m => `${m.team1} vs ${m.team2}`)
    .join('\n');

  return `You are a fantasy football analyst. This is the FINAL week of the regular season (Week 14).

CURRENT STANDINGS:
${standingsStr}

THIS WEEK'S MATCHUPS:
${matchupsStr}

LEAGUE RULES:
- 12 teams, 3 divisions (4 teams each)
- Top 6 make playoffs
- Seeds 1-3: Division winners (by record, then total points)
- Seeds 4-6: Wild cards (best remaining by record, then total points)
- Tiebreaker for same record: TOTAL SEASON POINTS (not head-to-head)

ANALYZE: ${TEST_DATA.targetTeam}

For EACH possible seed they can achieve, explain:
1. What needs to happen (their game + other games)
2. Any points tiebreakers that matter (be specific about point gaps)
3. Why certain outcomes lead to certain seeds

IMPORTANT: ${TEST_DATA.targetTeam} and Drake Maye Lover are BOTH 8-5. ${TEST_DATA.targetTeam} has 9.8 MORE total points. If they both win, ${TEST_DATA.targetTeam} wins the tiebreaker. If they both lose, ${TEST_DATA.targetTeam} still wins tiebreaker.

Format as JSON:
{
  "overallSummary": "One sentence overview",
  "seedSummaries": {
    "2": "Detailed explanation for #2 seed",
    "3": "Detailed explanation for #3 seed", 
    "4": "Detailed explanation for #4 seed"
  }
}`;
};

/**
 * PROMPT 2: Full Path Context
 * Include calculated paths and ask Gemini to summarize patterns
 */
const buildFullPathPrompt = () => {
  const standingsStr = TEST_DATA.standings
    .map(s => `${s.rank}. ${s.teamName} (${s.record}, ${s.points} pts, Div ${s.division})`)
    .join('\n');
  
  const matchupsStr = TEST_DATA.matchups
    .map(m => `${m.team1} vs ${m.team2}`)
    .join('\n');

  const pathsStr = Object.entries(TEST_DATA.scenarios)
    .map(([seed, data]) => {
      return `Seed #${seed} (${Math.round(data.probability * 100)}%):
  - ${data.winPaths} paths require WIN
  - ${data.losePaths} paths require LOSE
  - Key insight: ${data.winPaths === 32 ? 'ALL wins lead here' : data.losePaths === 32 ? 'ALL losses lead here' : 'Mixed outcomes'}`;
    })
    .join('\n\n');

  return `You are a fantasy football analyst. This is the FINAL week of the regular season (Week 14).

CURRENT STANDINGS:
${standingsStr}

THIS WEEK'S MATCHUPS:
${matchupsStr}

LEAGUE RULES:
- 12 teams, 3 divisions (4 teams each)  
- Top 6 make playoffs
- Seeds 1-3: Division winners (by record, then total points)
- Seeds 4-6: Wild cards (best remaining by record, then total points)
- Tiebreaker for same record: TOTAL SEASON POINTS

TEAM TO ANALYZE: ${TEST_DATA.targetTeam}
- Record: 8-5
- Total Points: 1626.8
- Division: 1
- Opponent: vchak (7-6)

CRITICAL TIEBREAKER CONTEXT:
- ${TEST_DATA.targetTeam} has 1626.8 points
- Drake Maye Lover has 1617.0 points (9.8 fewer)
- BOTH are 8-5 in Division 1
- If both WIN: ${TEST_DATA.targetTeam} wins Division 1 (more points)
- If both LOSE: ${TEST_DATA.targetTeam} still wins Division 1 (more points)
- Only way Drake Maye Lover wins Division 1: They WIN and ${TEST_DATA.targetTeam} LOSES

PRE-CALCULATED PATH ANALYSIS (64 total possible outcomes):
${pathsStr}

Based on this analysis, explain each seed scenario in plain English:
- What ${TEST_DATA.targetTeam} needs to do
- What other results matter
- Why the points tiebreaker matters

Format as JSON:
{
  "overallSummary": "One sentence overview mentioning the key tiebreaker with Drake Maye Lover",
  "seedSummaries": {
    "2": "Clear explanation - mention if points tiebreaker matters",
    "3": "Clear explanation",
    "4": "Clear explanation"
  }
}`;
};

const createClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY not set in environment');
  }
  return new ChatGoogleGenerativeAI({
    apiKey,
    model: GEMINI_CONFIG.model,
    temperature: GEMINI_CONFIG.temperature,
    maxOutputTokens: GEMINI_CONFIG.maxOutputTokens,
  });
};

const runPrompt = async (name: string, prompt: string) => {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`TESTING: ${name}`);
  console.log('='.repeat(60));
  console.log('\nPrompt length:', prompt.length, 'chars');
  
  try {
    const client = createClient();
    const start = Date.now();
    const response = await client.invoke(prompt);
    const elapsed = Date.now() - start;
    
    console.log(`\nResponse time: ${elapsed}ms`);
    console.log('\n--- RAW RESPONSE ---');
    console.log(response.content.toString());
    
    // Try to parse JSON
    let content = response.content.toString().trim();
    if (content.startsWith('```json')) content = content.slice(7);
    if (content.startsWith('```')) content = content.slice(3);
    if (content.endsWith('```')) content = content.slice(0, -3);
    
    try {
      const parsed = JSON.parse(content.trim());
      console.log('\n--- PARSED JSON ---');
      console.log(JSON.stringify(parsed, null, 2));
      return parsed;
    } catch {
      console.log('\n[Failed to parse as JSON]');
      return null;
    }
  } catch (error) {
    console.error('Error:', error);
    return null;
  }
};

const main = async () => {
  console.log('🧪 Scenario Prompt Evaluation');
  console.log('Testing different prompts for playoff scenario summarization\n');
  
  // Test Prompt 1: Minimal
  const result1 = await runPrompt('MINIMAL CONTEXT', buildMinimalPrompt());
  
  // Small delay between requests
  await new Promise(r => setTimeout(r, 2000));
  
  // Test Prompt 2: Full Path Context
  const result2 = await runPrompt('FULL PATH CONTEXT', buildFullPathPrompt());
  
  // Compare results
  console.log('\n' + '='.repeat(60));
  console.log('COMPARISON');
  console.log('='.repeat(60));
  
  if (result1 && result2) {
    console.log('\n📊 MINIMAL CONTEXT:');
    console.log('Overall:', result1.overallSummary);
    
    console.log('\n📊 FULL PATH CONTEXT:');
    console.log('Overall:', result2.overallSummary);
    
    console.log('\n🎯 Key differences in #2 seed explanation:');
    console.log('Minimal:', result1.seedSummaries?.['2']?.slice(0, 200) + '...');
    console.log('Full:', result2.seedSummaries?.['2']?.slice(0, 200) + '...');
  }
  
  console.log('\n✅ Evaluation complete!');
};

main().catch(console.error);

