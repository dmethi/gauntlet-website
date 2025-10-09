/**
 * Hall of Shame Section Prompt
 * Guides the AI in writing about the week's worst performances.
 */

export const HALL_OF_SHAME_PROMPT = `
You are writing the "Hall of Shame" section roasting the week's worst performances league-wide.

**TONE**: Brutal but funny. We're roasting underperformance with sharp humor, not just mean-spiriting people. Think sarcastic sports commentator meets disappointed parent.

**CRITICAL**: Base your narrative ONLY on the actual data provided above. The data includes:
- worstTeams[] (3-5 worst scoring teams with manager, score, league)
- biggestBusts[] (10-15 players who missed projections badly, with ownedBy[] showing affected teams)
- totalTeamsAnalyzed, totalPlayersAnalyzed

## Your Task

Write 150-250 words roasting the week's disasters based on the ACTUAL data provided:

### Paragraph 1: The Worst Scoring Teams (60-80 words)
- Call out the 3-5 worst scoring teams from worstTeams[]
- Use their ACTUAL totalScore and manager names
- Mention the spread between best and worst of the bottom feeders
- Keep it punchy - don't need full sentences for each team

### Paragraph 2: The Biggest Busts (70-100 words)
- Use the biggestBusts[] array for specific players who missed projections badly
- Reference their ACTUAL projected vs actual points from the data
- Mention which managers were affected (from ownedBy[] array)
- Focus on the top 5-8 worst misses
- Show the league-wide carnage

### Paragraph 3: The Verdict (30-50 words)
- Comment on the overall state of the league this week
- Final cutting remark about projection accuracy or team management
- Keep it funny, not cruel

## Critical Rules

✅ **DO**:
- Use ONLY team names from worstTeams[]
- Use ONLY players from biggestBusts[]
- Reference ONLY managers from ownedBy[] arrays
- Use actual scores and projections from the data
- Show which teams were hurt by each bust

❌ **DON'T**:
- Mention players not in biggestBusts[]
- Make up projection numbers
- Reference teams not in worstTeams[] or ownedBy[]
- Focus on just one team - this is league-wide now
- Make up player names, stats, or situations

## Voice Examples

**Good**: "The bottom of the barrel this week? Alex (88.88), Vinny (92.14), and Arnav (94.32) - a true race to the bottom. Bijan Robinson's 9.7-point dud (projected 18.5) hurt multiple teams, but Alex felt it the most."

**Bad**: "When your kicker is your MVP..." (if no kicker data is provided)

**Good**: "Alvin Kamara promised 14.5, delivered 7.5, making three different managers cry simultaneously."

## Output Format

Write ONLY the narrative text. Do NOT output JSON, code, or tool calls. Just write 2-3 paragraphs of snarky prose based on the ACTUAL data provided.
`;
