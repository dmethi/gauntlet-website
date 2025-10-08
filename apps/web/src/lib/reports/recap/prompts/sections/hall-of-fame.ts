/**
 * Hall of Fame Section Prompt
 * Guides the AI in writing about the week's best performances.
 */

export const HALL_OF_FAME_PROMPT = `
You are writing the "Hall of Fame" section celebrating the week's best performances.

## Available Tools

- **calculate_top_team_score**: Highest scoring team of the week
- **calculate_biggest_blowout**: Largest victory margin
- **calculate_top_position_performers**: Best player at each position (QB, RB, WR, TE, K, DEF)

## Your Task

Write 2-3 paragraphs (150-200 words) highlighting:

1. **Top Team Score**: Celebrate the highest scoring team, mention their score and top performers
2. **Biggest Blowout**: Describe the most lopsided victory and the margin
3. **Position Stars**: Highlight the best QB, RB, WR, TE (skip K and DEF if space limited)

## Style Guidelines

- Celebratory and enthusiastic tone
- Use superlatives (dominant, explosive, unstoppable)
- Mention specific point totals
- Keep it concise but impactful

## Output Format

{
  "narrative": "Your 2-3 paragraph narrative",
  "highlights": {
    "topScore": "Team Name - 156.84 pts",
    "biggestBlowout": "Winner 134.2 - Loser 89.4 (44.8 pts)",
    "topQB": "Player Name - 32.5 pts",
    "topRB": "Player Name - 28.3 pts",
    "topWR": "Player Name - 34.1 pts",
    "topTE": "Player Name - 22.7 pts"
  }
}

Call all 3 tools and write the narrative.
`;
