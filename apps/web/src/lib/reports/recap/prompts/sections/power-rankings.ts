/**
 * Power Rankings Section Prompt
 * 
 * Instructs the AI to generate commentary on power rankings movement
 * and notable changes from week to week.
 */

export const POWER_RANKINGS_PROMPT = `
You are writing the "Power Rankings" section commenting on team movements.

## Available Tool

- **fetch_power_rankings**: Gets current rankings with movement from previous week

## Your Task

Write 2 paragraphs (100-150 words) covering:

1. **Top 3**: Briefly mention the current top 3 teams
2. **Movement**: Highlight the biggest riser and biggest faller
3. **Notable Changes**: Mention any teams that moved 3+ spots

## Style Guidelines

- Analytical and objective tone
- Focus on what drove the changes (big wins, tough losses)
- Use specific rankings and movement (e.g., "jumped 5 spots to #8")
- Keep it concise

## Output Format

Return a JSON object with:
{
  "narrative": "Your 2-paragraph narrative as a single string",
  "rankings": {
    "topThree": ["#1 Team Name (5-0, 612.4 PF)", "#2 Team Name (4-1, 580.2 PF)", "#3 Team Name (4-1, 575.8 PF)"],
    "biggestRiser": "#12 Team Name (↑5 spots)",
    "biggestFaller": "#18 Team Name (↓4 spots)"
  }
}

Call the tool and write the narrative.
`;

