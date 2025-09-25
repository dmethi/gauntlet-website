# AI Matchup Recap Prompt Template

Use this prompt template with the enhanced matchup context to generate compelling recap narratives.

## System Prompt

You are a fantasy football expert writer who creates engaging, entertaining matchup recaps. Your writing style is:
- Knowledgeable yet accessible
- Entertaining with personality 
- Statistically informed but not dry
- Captures both the drama and the details
- Uses vivid language and storytelling techniques

## User Prompt Template

```
Write an engaging matchup recap for this fantasy football game. Use the provided statistical context to craft a narrative that captures both the drama and the key storylines.

**MATCHUP**: {{teamAName}} vs {{teamBName}}
**FINAL SCORE**: {{finalScore}}
**WEEK**: {{week}} of {{season}}

## Statistical Context

### Game Flow
{{aiContext.flow.gameNarrative}}

**Key Moments:**
{{#each aiContext.flow.keyMoments}}
- {{this}}
{{/each}}

**Pace Analysis:** {{aiContext.flow.paceAnalysis}}

**Momentum Shifts:**
{{#each aiContext.flow.momentumShifts}}
- {{this}}  
{{/each}}

### Stakes & Context
{{aiContext.stakes.contextSummary}}

**Rivalry Level:** {{aiContext.stakes.rivalryLevel}}

**Power Rankings:** {{aiContext.stakes.powerRankingContext}}

**Season Implications:**
{{#each aiContext.stakes.seasonImplications}}
- {{this}}
{{/each}}

**Playoff Implications:**
{{#each aiContext.stakes.playoffImplications}}
- {{this}}
{{/each}}

### Team Performance Analysis

#### {{teamAName}}
{{aiContext.performance.teamAAnalysis.summaryVsExpectations}}

**Key Performers:**
{{#each aiContext.performance.teamAAnalysis.keyPerformers}}
- {{this}}
{{/each}}

**Disappointments:**
{{#each aiContext.performance.teamAAnalysis.disappointments}}
- {{this}}
{{/each}}

**Positional Impact:** {{aiContext.performance.teamAAnalysis.positionalImpact}}

#### {{teamBName}}
{{aiContext.performance.teamBAnalysis.summaryVsExpectations}}

**Key Performers:**
{{#each aiContext.performance.teamBAnalysis.keyPerformers}}
- {{this}}
{{/each}}

**Disappointments:**
{{#each aiContext.performance.teamBAnalysis.disappointments}}
- {{this}}
{{/each}}

**Positional Impact:** {{aiContext.performance.teamBAnalysis.positionalImpact}}

#### Head-to-Head Comparison
{{#each aiContext.performance.headToHeadComparison}}
- {{this}}
{{/each}}

### Statistical Superlatives

**Hall of Fame Worthy:**
{{#each aiContext.superlatives.hallOfFameWorthy}}
- {{this}}
{{/each}}

**Weekly Superlatives:**
{{#each aiContext.superlatives.weeklySuperlatives}}
- {{this}}
{{/each}}

**Unusual Stats:**
{{#each aiContext.superlatives.unusualStats}}
- {{this}}
{{/each}}

**Records Set:**
{{#each aiContext.superlatives.recordsSet}}
- {{this}}
{{/each}}

### Narrative Elements

**Primary Storyline:** {{aiContext.narrativeElements.primaryStoryline}}

**Secondary Storylines:**
{{#each aiContext.narrativeElements.secondaryStorylines}}
- {{this}}
{{/each}}

**Emotional Beats:**
{{#each aiContext.narrativeElements.emotionalBeats}}
- {{this}}
{{/each}}

**Quotable Stats:**
{{#each aiContext.narrativeElements.quotableStats}}
- {{this}}
{{/each}}

**Memory Makers:**
{{#each aiContext.narrativeElements.memoryMakers}}
- {{this}}
{{/each}}

---

## Instructions

Create a compelling 3-4 paragraph matchup recap that:

1. **Opens with drama** - Start with the most compelling angle (upset, thriller, blowout, record-setting performance, etc.)

2. **Tells the story** - Use the game flow data to narrate how the game unfolded, including key momentum shifts and turning points

3. **Highlights heroes and zeros** - Feature the standout performances and disappointments, with statistical context

4. **Provides broader context** - Connect this game to season-long narratives, playoff races, power rankings, and historical context

5. **Ends memorably** - Close with the lasting impact, what this means going forward, or a quotable statistical flourish

**Style Notes:**
- Use active voice and vivid descriptions
- Include specific statistics but weave them into the narrative naturally  
- Create personality through word choice and phrasing
- Balance entertainment with information
- Make it feel like you watched the games, not just read the stats

**Length:** 3-4 substantial paragraphs (300-500 words total)
```

## Example Usage

After running the enhancement script, you can use this template with any LLM by:

1. Loading your enhanced report JSON
2. Substituting the template variables with actual matchup data
3. Feeding the complete prompt to your preferred AI model
4. Getting back a polished, context-rich matchup recap

## Customization Options

You can modify this template to:
- Adjust tone (more serious, more humorous, more technical)
- Change length requirements
- Focus on specific aspects (power rankings, records, individual performances)
- Add team-specific context or rivalry history
- Include league-specific terminology or inside jokes

The statistical context provides rich material - the key is crafting prompts that help the AI use it effectively for engaging storytelling.
