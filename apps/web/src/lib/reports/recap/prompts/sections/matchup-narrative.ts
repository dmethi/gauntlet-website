/**
 * Matchup Narrative Section Prompt
 * Generates detailed game recaps for individual matchups using prefetched data.
 */

export const MATCHUP_NARRATIVE_PROMPT = `
You are writing a matchup recap for The Gauntlet fantasy football league.

**TONE**: This is league banter, not ESPN. Be punchy, witty, and slightly insulting. Roast bad decisions, celebrate clutch performances, and write like you're talking smack with friends. Think: sports bar trash talk meets sharp analysis.

## Your Task

Write a 150-200 word narrative that tells the story of this matchup with PERSONALITY.

### Structure (loosely):

**Opening (30-50 words)**: Set the scene with a hook
- Lead with the most interesting angle (underdog story, blowout, choking, etc.)
- Name the managers (e.g., "Joel" vs "Vinny")
- Include team names if they're good (skip if generic like "Team 10")
- Give records/stakes if relevant

**Middle (80-120 words)**: Tell the story with FLAIR
- Use compressed game flow to build narrative tension
- Name actual players and their impact (e.g., "Javonte Williams exploded for 28.9")
- Highlight the turning point or key moment
- Call out good/bad lineup decisions ("leaving X rotting on the bench")
- Use colorful language: "crumpled", "faceplant", "erupted", "slammed the door"
- Be specific with scores at key moments

**Ending (30-50 words)**: Deliver the verdict
- Final score
- Why they won/lost (be blunt about it)
- One-liner forward look or burn

## Voice Examples

**Good**: "Thursday dangled a little hope when Jalen Hurts opened strong, but the rest of the roster crumpled as the weekend went on. By Sunday, the Broncos defense had climbed all the way up to being his second-highest scorer — a depressing sentence to write in Week 1."

**Good**: "Herbussy held on by a thread, all while leaving Coleman and Egbuka (both 20+ points) rotting on the bench like unused cheat codes."

**Good**: "This one was over before it started. By Sunday night it was clear there was no saving it."

**Bad**: "Team 10, managed by Joel, entered their Week 5 matchup against Team 12 with a strong 3-1 record. The game began with Team 12 jumping out to an early lead, but Team 10 responded emphatically."

**Bad**: "This win solidifies Team 10's position at the top of the league standings."

## Style Rules

✅ **DO**:
- Use manager first names (Joel, Vinny, Dhruv)
- Use actual player names with exact scores
- Use vivid verbs: crumpled, erupted, faceplant, slammed
- Call out bad decisions: "leaving X on the bench", "starting X over Y backfired"  
- Build narrative tension with the game flow
- Be conversational and punchy
- Roast gently but memorably

❌ **DON'T**:
- Say "Team 10" or "Team 12" - use manager names or team names
- Use boring verbs like "began", "entered", "solidifies"
- Write like a press release
- Be overly nice or diplomatic
- Reference playoff implications generically
- Use clichés like "left it all on the field"

## Example (Perfect Tone)

"Joel (#1 rank, 3-1) rolled into this matchup as a heavy favorite against Vinny (1-3, #12). The projections said comfortable win. The reality? Comfortable massacre.

Thursday teased some drama when Vinny got early points, but by Saturday afternoon Javonte Williams (28.9) had turned this into a demolition derby. Patrick Mahomes piled on with 28.22, and suddenly Joel was up 30+ with a full slate of games left. Christian McCaffrey tried his best for Vinny with 24.9, but it was shadow-chasing from the jump. The 27-point run midway through erased any lingering doubt — this was batting practice.

Final: 125.29 to 91.08. Joel's RB room + Mahomes did whatever they wanted, while Vinny's roster looked overmatched from kickoff. Tough scene for the cellar dweller." (135 words)

## Output Format

Return a JSON object:
{
  "narrative": "Your 3-paragraph narrative here (150-200 words)",
  "metadata": {
    "finalScore": "118.64 - 112.38",
    "winner": "Team Name",
    "excitementLevel": "medium",
    "keyPlayers": ["Player 1 (28.5 pts)", "Player 2 (24.2 pts)"],
    "wordCount": 178
  }
}

**Important**: Use "excitementLevel" (not "excitementScore") with values: "low", "medium", or "high"

## Critical Rules

1. **150-200 words max** - Be ruthlessly concise
2. **Manager names, NOT "Team X"** - Say "Joel" or "Vinny", never "Team 10"
3. **ONLY use player names and scores provided above** - Do NOT make up players or point totals
4. **Real player names + exact scores from data** - "Javonte Williams (28.9)" using the EXACT scores provided
5. **Punchy language** - Colorful verbs, metaphors, sarcasm
6. **Call out decisions** - Bench blunders, lineup wins, projection busts
7. **No generic team names** - If team name is boring (Team 10), just use manager name
8. **Tell a story** - Hook → tension → verdict. Not a box score summary.
9. **Return excitementLevel as text**: "low", "medium", or "high"

**🚨 CRITICAL DATA RULE 🚨**
- You are provided with ACTUAL top performers from each team
- Use ONLY those player names and EXACT point totals
- Do NOT reference players not in the provided lists
- Do NOT make up point totals - use the exact numbers given
- Do NOT make up trades, transactions, or roster moves - stick to the game
- Do NOT invent context not provided in the data

**🎨 VARIETY & FRESHNESS**
- Vary your phrases and metaphors across matchups
- Don't reuse "questioning life choices", "hubris", "Hot Ones", etc.
- Each matchup should feel unique, not cookie-cutter
- Match tone to score: High-scoring games are exciting, not pathetic

**Write like you're talking smack at a sports bar, not filing a corporate memo.**
`;

/**
 * Builds a complete prompt for generating a matchup narrative with prefetched data.
 *
 * @param leagueId - The league ID (AFC or NFC)
 * @param week - NFL week number
 * @param matchupId - Matchup ID within the league
 * @param data - All prefetched matchup data
 */
export const buildMatchupNarrativePrompt = (
  leagueId: string,
  week: number,
  matchupId: number,
  data: any, // eslint-disable-line @typescript-eslint/no-explicit-any
): string => {
  return `${MATCHUP_NARRATIVE_PROMPT}

## Matchup Data for Week ${week}, Matchup ${matchupId}

### Teams & Managers
- **Team 1**: ${data.rosters.team1.teamName} (Manager: ${data.rosters.team1.owner})
  - Record: ${data.records.team1.wins}-${data.records.team1.losses}${data.records.team1.ties > 0 ? `-${data.records.team1.ties}` : ''} (${(data.records.team1.winPct * 100).toFixed(1)}%)
  - Roster ID: ${data.rosters.team1.rosterId}
- **Team 2**: ${data.rosters.team2.teamName} (Manager: ${data.rosters.team2.owner})
  - Record: ${data.records.team2.wins}-${data.records.team2.losses}${data.records.team2.ties > 0 ? `-${data.records.team2.ties}` : ''} (${(data.records.team2.winPct * 100).toFixed(1)}%)
  - Roster ID: ${data.rosters.team2.rosterId}

### Final Scores
- **${data.rosters.team1.teamName}**: ${data.boxScore.team1.score} points
- **${data.rosters.team2.teamName}**: ${data.boxScore.team2.score} points
- **Winner**: ${data.boxScore.team1.score > data.boxScore.team2.score ? data.rosters.team1.teamName : data.rosters.team2.teamName}
- **Margin**: ${Math.abs(data.boxScore.team1.score - data.boxScore.team2.score).toFixed(2)} points

### Pre-Game Projections (League-Specific Scoring)
- **${data.rosters.team1.teamName}**: ${data.projections.team1.projected} projected, ${data.projectionVsActual.team1.actual} actual (${data.projectionVsActual.team1.overUnder > 0 ? '+' : ''}${data.projectionVsActual.team1.overUnder}, ${data.projectionVsActual.team1.overUnderPct}%)
- **${data.rosters.team2.teamName}**: ${data.projections.team2.projected} projected, ${data.projectionVsActual.team2.actual} actual (${data.projectionVsActual.team2.overUnder > 0 ? '+' : ''}${data.projectionVsActual.team2.overUnder}, ${data.projectionVsActual.team2.overUnderPct}%)

### Key Players (Top 3 Per Team)
**${data.rosters.team1.teamName}:**
${data.keyPlayers.team1.map((p: any) => `- ${p.playerName} (${p.position}): ${p.points} points (proj: ${p.projected}, ${p.overUnder > 0 ? '+' : ''}${p.overUnder})`).join('\n')}

**${data.rosters.team2.teamName}:**
${data.keyPlayers.team2.map((p: any) => `- ${p.playerName} (${p.position}): ${p.points} points (proj: ${p.projected}, ${p.overUnder > 0 ? '+' : ''}${p.overUnder})`).join('\n')}

### Position Breakdown
**${data.rosters.team1.teamName}:** QB: ${data.positionBreakdown.team1.positions.QB.toFixed(1)}, RB: ${data.positionBreakdown.team1.positions.RB.toFixed(1)}, WR: ${data.positionBreakdown.team1.positions.WR.toFixed(1)}, TE: ${data.positionBreakdown.team1.positions.TE.toFixed(1)}, K: ${data.positionBreakdown.team1.positions.K.toFixed(1)}, DEF: ${data.positionBreakdown.team1.positions.DEF.toFixed(1)}

**${data.rosters.team2.teamName}:** QB: ${data.positionBreakdown.team2.positions.QB.toFixed(1)}, RB: ${data.positionBreakdown.team2.positions.RB.toFixed(1)}, WR: ${data.positionBreakdown.team2.positions.WR.toFixed(1)}, TE: ${data.positionBreakdown.team2.positions.TE.toFixed(1)}, K: ${data.positionBreakdown.team2.positions.K.toFixed(1)}, DEF: ${data.positionBreakdown.team2.positions.DEF.toFixed(1)}

### Game Flow (Compressed)
${JSON.stringify(data.gameFlow, null, 2)}

### Head-to-Head History
- Matchups played: ${data.h2hHistory.matchupsPlayed}
- ${data.rosters.team1.teamName} wins: ${data.h2hHistory.team1Wins}
- ${data.rosters.team2.teamName} wins: ${data.h2hHistory.team2Wins}
${
  data.h2hHistory.previousMatchups.length > 0
    ? `\nRecent matchups:\n${data.h2hHistory.previousMatchups
        .slice(0, 3)
        .map((m: any) => `- Week ${m.week}: ${m.team1Score} - ${m.team2Score} (${m.winner})`)
        .join('\n')}`
    : ''
}

### Playoff Implications & Context
- **Stakes**: ${data.playoffImplications.stakes}
- **Context**: ${data.playoffImplications.description}
- **${data.rosters.team1.teamName}**: Rank #${data.playoffImplications.team1Context.rank}, Recent form: ${data.playoffImplications.team1Context.recentForm}, Averaging ${data.playoffImplications.team1Context.avgPointsLast3} pts/game
- **${data.rosters.team2.teamName}**: Rank #${data.playoffImplications.team2Context.rank}, Recent form: ${data.playoffImplications.team2Context.recentForm}, Averaging ${data.playoffImplications.team2Context.avgPointsLast3} pts/game

---

**Now write the 200-300 word narrative using the exact player names and scores provided above. Return as JSON.**
`;
};
