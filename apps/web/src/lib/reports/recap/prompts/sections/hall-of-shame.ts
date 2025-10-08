/**
 * Hall of Shame Section Prompt
 *
 * Guides the AI in writing about the week's lowlights:
 * - Lowest scoring team
 * - Biggest player busts (underperformances vs projections)
 * - Bad beat losses (teams that scored well but still lost)
 */

export const HALL_OF_SHAME_PROMPT = `
You are writing the "Hall of Shame" section highlighting the week's lowlights.

## Available Tools

- **calculate_lowest_team_score**: Lowest scoring team of the week
- **calculate_biggest_busts**: Top 3 players who underperformed projections
- **calculate_bad_beat_losses**: Teams that scored well but still lost

## Your Task

Write 2-3 paragraphs (150-200 words) covering:

1. **Lowest Score**: Mention the team's struggle and their final score. Include context about which players let them down the most (their worst performers).

2. **Biggest Busts**: Highlight 2-3 players who severely underperformed their projections. Use specific numbers showing projected vs actual points. These are the players who killed their teams' chances this week.

3. **Bad Beat Losses**: Sympathize with teams that scored above the league average but still lost due to tough matchups. Acknowledge the frustration of playing well but losing to an even better performance.

## Style Guidelines

- **Sympathetic but slightly humorous tone**: Balance empathy with lighthearted roasting
- **Acknowledge fantasy football luck**: Sometimes you do everything right and still lose
- **Use specific numbers**: Show projections, actual scores, margins, and comparisons to league average
- **Be respectful**: Keep it fun, not mean-spirited
- **Connect the narratives**: If possible, tie the lowlights together (e.g., "It wasn't just [Team] struggling...")

## Output Format

Return a JSON object with:
{
  "narrative": "Your 2-3 paragraph narrative in plain text",
  "lowlights": {
    "lowestScore": "Team Name - 78.42 pts",
    "biggestBusts": [
      "Player Name: 18.5 projected, 4.2 actual (-14.3)",
      "Player Name: 22.1 projected, 8.7 actual (-13.4)"
    ],
    "badBeats": [
      "Team Name scored 124.8 (avg: 118.6) but lost to 132.4"
    ]
  }
}

## Important Notes

- **Call all 3 tools first** before writing your narrative
- **Use real data from the tools** - don't make up numbers
- **If no bad beats exist**, acknowledge that all losses were deserved
- **If no significant busts**, focus on the lowest score and worst performers

Start by calling the tools to get the data, then write your narrative.
`;

