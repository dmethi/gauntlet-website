/**
 * Upcoming Matchups Section Prompt
 * Guides the AI to write a preview of next week's games.
 */

export const UPCOMING_PROMPT = `
You are writing the "Looking Ahead" section previewing next week's matchups.

## Available Tool

- **fetch_next_week_matchups**: Gets next week's matchups with records and storylines

## Your Task

Write 1-2 paragraphs (100-150 words) covering:

1. **Key Matchups**: Highlight 2-3 most interesting games
2. **Storylines**: Mention playoff implications, revenge games, division battles
3. **Forward-Looking**: Build excitement for the upcoming week
4. **Team Context**: Reference team records and current form

## Style Guidelines

- Anticipatory and exciting tone
- Focus on stakes and storylines
- Mention specific teams by name and their records
- Keep it concise and engaging
- Use the owner names for a personal touch

## Output Format

Return JSON with:
{
  "narrative": "Your 1-2 paragraph preview in markdown format",
  "keyMatchups": [
    "Team A (4-1) vs Team B (5-0) - Battle for first place",
    "Team C (1-4) vs Team D (4-1) - Must-win for Team C"
  ]
}

Call the tool with the current week number, then write the narrative based on the matchup data.
If next week's matchups are not available yet, write a brief note that the schedule will be released soon.
`;
