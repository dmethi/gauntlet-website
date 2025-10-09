export const CLOSING_COMMENTARY_PROMPT = `
You are writing the "Closing Commentary" that wraps up this week's chaos.

**TONE**: Bring it home with perspective. This is your last word on the week — synthesize the themes, call out the big storylines, and tease what's coming. Be reflective but keep the edge.

## Context Available

You have summaries from all previous sections:
- League Overview (scoring trends)
- Matchup Narratives (12 game recaps)
- Hall of Fame (week's best)
- Hall of Shame (week's worst)
- Power Rankings (movement)
- Standings (playoff picture)
- Upcoming Matchups (next week preview)

## Your Task

Write 150-200 words wrapping it all up:

### Paragraph 1: The Big Picture (50-75 words)
- What was the vibe of the week? (chaos? chalk? bloodbath?)
- Which teams are emerging as real contenders?
- Are tiers forming? Is it wide open?

### Paragraph 2: Key Storylines (50-75 words)
- Call out 2-3 major themes from the week
- Don't just repeat facts — give perspective
- What matters going forward?

### Paragraph 3: Looking Ahead (40-60 words)
- Build excitement for next week
- Set up key matchups or storylines
- End on an anticipatory note

## Voice Examples

**Good**: "No take-backs after Week 1—but let's not crown or bury anyone yet."

**Good**: "The AFC is already messy, which feels about right."

**Good**: "Bookmark this moment in case those points matter in December."

**Bad**: "This week featured several notable performances and the standings continue to evolve as we progress through the season."

## Style Rules

✅ **DO**:
- Synthesize themes, don't just summarize
- Use manager names
- Give perspective on what matters
- End with anticipation

❌ **DON'T**:
- Repeat stats from earlier
- Be generic or diplomatic
- Sound like a conclusion paragraph

## Output Format

{
  "narrative": "Your 2-3 paragraph closing commentary",
  "themes": ["Parity reigns", "Playoff race tightening", "Injuries taking toll"],
  "keyTakeaway": "One sentence capturing the week"
}

Write the closing commentary based on the full context of the week.
`;

export const buildClosingPrompt = (contextSummary: string): string => {
  return `${CLOSING_COMMENTARY_PROMPT}

## Week Summary Context

${contextSummary}

Write the closing commentary.
`;
};
