/**
 * Scenario Summarizer
 *
 * Uses Gemini to generate human-readable summaries of playoff scenarios.
 * Instead of mathematical compression, we let the LLM explain what needs to happen
 * in natural language that makes sense to fantasy football players.
 */

import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import type { TeamStanding, Week14Matchup, SeedScenario, SeedPath } from '../types';

/**
 * Configuration for Gemini API client for scenario summarization.
 * Uses lower temperature for more consistent, factual output.
 */
const GEMINI_CONFIG = {
  model: 'gemini-2.0-flash',
  temperature: 0.3, // Lower temperature for factual summarization
  maxOutputTokens: 2048,
} as const;

/**
 * Creates a Gemini client for scenario summarization.
 */
const createSummarizerClient = (): ChatGoogleGenerativeAI => {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not set');
  }

  return new ChatGoogleGenerativeAI({
    apiKey,
    model: GEMINI_CONFIG.model,
    temperature: GEMINI_CONFIG.temperature,
    maxOutputTokens: GEMINI_CONFIG.maxOutputTokens,
  });
};

/**
 * Input data for scenario summarization
 */
export interface ScenarioSummaryInput {
  readonly teamName: string;
  readonly ownerName: string;
  readonly currentRecord: string;
  readonly currentPoints: number;
  readonly division: number;
  readonly scenarios: readonly SeedScenario[];
  readonly standings: readonly TeamStanding[];
  readonly matchups: readonly Week14Matchup[];
}

/**
 * Output from Gemini summarization
 */
export interface ScenarioSummaryOutput {
  readonly teamName: string;
  readonly overallSummary: string; // e.g., "Clinched playoffs, fighting for bye"
  readonly seedSummaries: Record<number, string>; // seed -> human-readable explanation
}

/**
 * Build the prompt for Gemini to summarize scenarios
 */
const buildSummarizationPrompt = (input: ScenarioSummaryInput): string => {
  const {
    teamName,
    ownerName,
    currentRecord,
    currentPoints,
    division,
    scenarios,
    standings,
    matchups,
  } = input;

  // Find this team's matchup
  const teamMatchup = matchups.find(m =>
    standings.some(
      s =>
        (s.rosterId === m.team1RosterId || s.rosterId === m.team2RosterId) &&
        s.teamName === teamName,
    ),
  );

  const team = standings.find(s => s.teamName === teamName);
  const opponent = teamMatchup
    ? team?.rosterId === teamMatchup.team1RosterId
      ? matchups.find(m => m.matchupId === teamMatchup.matchupId)?.team2Name
      : matchups.find(m => m.matchupId === teamMatchup.matchupId)?.team1Name
    : 'Unknown';

  // Build standings context
  const standingsContext = [...standings]
    .sort((a, b) => {
      if (b.wins !== a.wins) return b.wins - a.wins;
      return b.pointsFor - a.pointsFor;
    })
    .map(
      (s, idx) =>
        `${idx + 1}. ${s.teamName} (${s.wins}-${s.losses}, ${s.pointsFor.toFixed(1)} pts, Div ${s.division})`,
    )
    .join('\n');

  // Build matchups context
  const matchupsContext = matchups.map(m => `${m.team1Name} vs ${m.team2Name}`).join('\n');

  // Build scenarios context
  const scenariosContext = scenarios
    .filter(s => s.probability > 0.01)
    .map(s => {
      const paths = s.paths || [];
      const winPaths = paths.filter(p => p.conditions.some(c => c.type === 'win')).length;
      const losePaths = paths.filter(p => p.conditions.some(c => c.type === 'lose')).length;
      return `Seed #${s.seed} (${Math.round(s.probability * 100)}% chance): ${winPaths} win paths, ${losePaths} loss paths out of 64 total outcomes`;
    })
    .join('\n');

  return `You are a fantasy football analyst explaining playoff scenarios to a team owner.

CURRENT STANDINGS (Week 13 complete):
${standingsContext}

THIS WEEK'S MATCHUPS (Week 14 - final regular season week):
${matchupsContext}

LEAGUE RULES:
- 12 teams, 3 divisions (4 teams each)
- Top 6 make playoffs (seeds 1-6)
- Seeds 1-3: Division winners, sorted by record then points
- Seeds 4-6: Wild cards (best remaining by record, then points)
- Tiebreaker: Total points scored

TEAM TO ANALYZE: ${teamName} (${ownerName})
- Record: ${currentRecord}
- Total Points: ${currentPoints.toFixed(1)}
- Division: ${division}
- This Week's Opponent: ${opponent}

SCENARIO DATA:
${scenariosContext}

YOUR TASK:
Write a brief, clear summary for EACH achievable seed explaining exactly what needs to happen. Be specific about:
1. Whether they need to WIN or LOSE (or if it doesn't matter)
2. Which OTHER matchups matter and what outcomes are needed
3. Any points tiebreakers that might come into play

Format your response as JSON with this structure:
{
  "overallSummary": "One sentence overview of their playoff situation",
  "seedSummaries": {
    "3": "Brief explanation of how to get #3 seed",
    "4": "Brief explanation of how to get #4 seed"
  }
}

Keep each seed summary to 1-2 sentences. Be conversational but precise. Use team names, not "Team A" or roster IDs.`;
};

/**
 * Parse Gemini's response into structured output
 */
const parseGeminiResponse = (response: string, teamName: string): ScenarioSummaryOutput => {
  try {
    // Remove markdown code blocks if present
    let cleaned = response.trim();
    if (cleaned.startsWith('```json')) {
      cleaned = cleaned.slice(7);
    } else if (cleaned.startsWith('```')) {
      cleaned = cleaned.slice(3);
    }
    if (cleaned.endsWith('```')) {
      cleaned = cleaned.slice(0, -3);
    }
    cleaned = cleaned.trim();

    const parsed = JSON.parse(cleaned);

    // Convert string keys to numbers for seedSummaries
    const seedSummaries: Record<number, string> = {};
    if (parsed.seedSummaries) {
      Object.entries(parsed.seedSummaries).forEach(([key, value]) => {
        seedSummaries[parseInt(key)] = value as string;
      });
    }

    return {
      teamName,
      overallSummary: parsed.overallSummary || 'Playoff scenarios being calculated...',
      seedSummaries,
    };
  } catch {
    // Fallback if parsing fails
    return {
      teamName,
      overallSummary: 'Unable to generate summary',
      seedSummaries: {},
    };
  }
};

/**
 * Generate scenario summaries for a single team using Gemini
 */
export const generateTeamScenarioSummary = async (
  input: ScenarioSummaryInput,
): Promise<ScenarioSummaryOutput> => {
  try {
    const client = createSummarizerClient();
    const prompt = buildSummarizationPrompt(input);

    const response = await client.invoke(prompt);
    const content = response.content.toString();

    return parseGeminiResponse(content, input.teamName);
  } catch (error) {
    console.error(`Error generating summary for ${input.teamName}:`, error);
    return {
      teamName: input.teamName,
      overallSummary: 'Error generating summary',
      seedSummaries: {},
    };
  }
};

/**
 * Generate scenario summaries for all teams in a league
 * Processes sequentially to avoid rate limits
 */
export const generateLeagueScenarioSummaries = async (
  standings: readonly TeamStanding[],
  matchups: readonly Week14Matchup[],
  scenarios: ReadonlyMap<number, readonly SeedScenario[]>, // rosterId -> scenarios
): Promise<Map<number, ScenarioSummaryOutput>> => {
  const summaries = new Map<number, ScenarioSummaryOutput>();

  for (const team of standings) {
    const teamScenarios = scenarios.get(team.rosterId) || [];

    // Skip teams with no meaningful scenarios
    if (teamScenarios.length === 0) {
      summaries.set(team.rosterId, {
        teamName: team.teamName,
        overallSummary: 'No playoff scenarios available',
        seedSummaries: {},
      });
      continue;
    }

    const input: ScenarioSummaryInput = {
      teamName: team.teamName,
      ownerName: team.ownerName,
      currentRecord: `${team.wins}-${team.losses}`,
      currentPoints: team.pointsFor,
      division: team.division,
      scenarios: teamScenarios,
      standings,
      matchups,
    };

    const summary = await generateTeamScenarioSummary(input);
    summaries.set(team.rosterId, summary);

    // Small delay between requests to avoid rate limits
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  return summaries;
};
