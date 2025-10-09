/**
 * League Overview Section Prompt
 * Generates the opening section of weekly recap reports.
 */

export const LEAGUE_OVERVIEW_PROMPT = `
You are writing the opening "League Overview" for The Gauntlet fantasy football weekly recap.

**TONE**: Set the stage with personality. This is league banter, not a press release. Be punchy, observant, and slightly snarky about the week's chaos.

## Your Task

Write a tight 100-150 word opening that captures the week's vibe.

### Paragraph 1: The Big Picture (50-75 words)
- Lead with the most interesting angle (was it a bloodbath? a snooze-fest? chaos?)
- Drop the total points and average (use EXACT numbers)
- Note close games vs blowouts (use EXACT counts)
- Set the tone for what kind of week it was

### Paragraph 2: Standout Games (50-75 words)
- Call out 2-3 specific matchups by MANAGER NAME or team name (NEVER "Matchup 4")
- Mention the nail-biter: "{Manager} edged {Manager}, {score} to {score}"
- Mention the massacre: "{Manager} demolished {Manager}, {score} to {score}"
- Use colorful language: "edged", "demolished", "shellacking", "thriller"

## Voice Examples

**Good**: "Scoring in the NFC felt uneven. A full seven teams cleared 110, but most lineups under-shot projections, and touchdowns came in bunches instead of balance."

**Good**: "The AFC didn't exactly light it up either — lots of teams finished well below projection. The difference? More chaos."

**Bad**: "Week 5 delivered 2,854.44 points across 12 matchups, with teams averaging 118.93 points. The week featured a balanced mix of drama and dominance."

## Style Rules

✅ **DO**:
- Use manager names or real team names
- Be observational ("touchdowns came in bunches", "lots of teams gasped")
- Use exact scores and margins
- Write with personality

❌ **DON'T**:
- Reference "Matchup 4" or matchup IDs
- Sound like a corporate memo
- Use generic sports clichés
- Be overly diplomatic

## Example (100-150 words total)

"Week 5 delivered 2,854.44 points across 12 matchups, with teams averaging 118.93 points. The week featured a balanced mix of drama and dominance, with 4 games decided by 10 points or less and 4 blowouts exceeding 30-point margins.

The closest contest came down to the wire as The Destroyers edged The Warriors 112.23 to 111.51, winning by a mere 0.72 points. On the opposite end, The Titans demolished The Knights 144.56 to 97.87 in a 46-point shellacking. The week's highest-scoring affair saw The Eagles soar past The Ravens 145.96 to 121.46."

## Output Format

Return a JSON object with this structure:
{
  "narrative": "Your 2-paragraph narrative here (100-150 words)",
  "metrics": {
    "totalPoints": number,
    "averageScore": number,
    "closeGames": number,
    "blowouts": number
  }
}

## Instructions

1. Read ALL the data provided in the DATA sections below
2. Use ONLY the exact numbers and team names from the data
3. Write the 2-paragraph narrative (100-150 words total)
4. Reference teams by name (e.g., "The Titans vs The Knights") NOT by matchup ID
5. Include exact scores and margins for 2-3 notable games
6. Return the JSON with narrative and metrics

**CRITICAL: 
- Use actual team names from highlights data (team1Name, team2Name, winnerName)
- DO NOT reference matchup IDs
- DO NOT include competitive ratio or generic playoff commentary
- Keep it concise and factual**
`;

/**
 * Builds a complete prompt for generating a league overview.
 * Injects pre-fetched data directly into the prompt context.
 *
 * @param week - NFL week number
 * @param data - Pre-fetched data from all tools
 */
export const buildLeagueOverviewPrompt = (
  week: number,
  data: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    leagueData: any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    summaryStats: any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    highlights: any;
  },
): string => {
  return `${LEAGUE_OVERVIEW_PROMPT}

## DATA: League Information

\`\`\`json
${JSON.stringify(data.leagueData, null, 2)}
\`\`\`

## DATA: Week ${week} Summary Statistics

\`\`\`json
${JSON.stringify(data.summaryStats, null, 2)}
\`\`\`

## DATA: Week ${week} Highlights

\`\`\`json
${JSON.stringify(data.highlights, null, 2)}
\`\`\`

---

Now write the 2-paragraph league overview narrative using ONLY the exact numbers and team names from the DATA sections above.
Use team names (team1Name, team2Name, winnerName), NOT matchup IDs.
`;
};
