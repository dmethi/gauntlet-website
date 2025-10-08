# RECAP-009: Matchup Narratives - Generation

**Project**: Weekly Recap Reports  
**Phase**: 2 - Section Implementation  
**Estimated Time**: 1 hour  
**Dependencies**: RECAP-008  
**Status**: 🔴 Not Started

---

## 🎯 Objective

Create the prompt template and generation logic for matchup narratives. This
combines all 11 data tools into a comprehensive prompt that produces engaging,
accurate 200-300 word game recaps with narrative flow and context.

---

## 📋 What to Build

### 1. Matchup Narrative Prompt Template

A structured prompt that:

- Instructs the LLM to call all necessary tools
- Guides narrative structure (setup, key moments, outcome)
- Enforces style guidelines (sports journalism tone)
- Ensures data accuracy (use actual numbers from tools)
- Includes game flow compressed data for color commentary

### 2. Single Matchup Test

Validate narrative generation for one matchup before batch processing
(RECAP-010).

---

## 📁 Files to Create/Modify

### New Files

```
apps/web/src/lib/reports/recap/prompts/sections/
└── matchup-narrative.ts            # Narrative prompt template

apps/web/src/lib/reports/recap/nodes/
└── matchup-narrative-node.ts       # LangGraph node for generation

apps/web/scripts/
└── test-matchup-narrative.ts       # Single matchup test
```

### Modified Files

```
apps/web/src/lib/reports/recap/orchestrator.ts
  - Add matchup narrative node
  - Wire into graph (for testing single matchup)
```

---

## 🛠️ Implementation Steps

### Step 1: Create Narrative Prompt (30 min)

```typescript
// apps/web/src/lib/reports/recap/prompts/sections/matchup-narrative.ts

export const MATCHUP_NARRATIVE_PROMPT = `
You are writing a single matchup recap for a fantasy football weekly report.

## Available Tools

You have access to 11 tools that provide complete matchup data:

1. **fetch_matchup_box_score** - Final scores and basic info
2. **fetch_matchup_rosters** - Team names and managers
3. **fetch_matchup_scoring_breakdown** - Points by player
4. **fetch_pre_game_projections** - Expected scores
5. **fetch_projection_vs_actual** - Over/under performance
6. **fetch_team_records** - Win-loss records
7. **fetch_h2h_history** - Previous matchups
8. **fetch_game_flow_compressed** - Key moments and excitement
9. **fetch_playoff_implications** - Stakes
10. **fetch_position_breakdown** - Points by position
11. **fetch_key_player_performances** - Top 3 per team

## Your Task

Write a 200-300 word narrative recap of this matchup. Follow this structure:

### Paragraph 1: Setup (50-75 words)
- Team names and managers
- Records entering the game
- Pre-game context (projections, stakes, H2H history)
- Set the scene

### Paragraph 2: Game Flow & Key Moments (100-150 words)
- Use compressed game flow data to tell the story
- Highlight lead changes, scoring runs, dramatic moments
- Mention key player performances (top performers from each team)
- Include specific point totals at critical junctures
- Use excitement metrics to guide tone (high excitement = dramatic language)

### Paragraph 3: Outcome & Takeaways (50-75 words)
- Final score
- Winner and margin
- Key factors (position strength, projection performance)
- Forward-looking statement (playoff implications, team trajectory)

## Style Guidelines

- **Tone**: Professional sports journalism, engaging and narrative-driven
- **Accuracy**: Use EXACT numbers from tools (scores, projections, records)
- **Detail**: Mention specific players and their contributions
- **Flow**: Vary sentence structure, avoid repetitive phrasing
- **No bullet points**: Only prose paragraphs

## Example Opening

"In a clash between two 3-1 teams, the Crimson Tide and Blue Devils delivered a Sunday Night thriller that came down to the final quarter. The Tide entered as 8-point favorites, but the Devils had won the last two head-to-head meetings..."

## Output Format

Return a JSON object:
{
  "narrative": "Your 3-paragraph narrative here (200-300 words)",
  "metadata": {
    "finalScore": "118.64 - 112.38",
    "winner": "Team Name",
    "excitementScore": 68,
    "keyPlayers": ["Player 1 (28.5 pts)", "Player 2 (24.2 pts)"],
    "wordCount": 247
  }
}

## Instructions

1. Start by calling fetch_matchup_box_score to get the matchup details
2. Call fetch_matchup_rosters to get team names
3. Call the remaining tools to gather all context
4. Use compressed game flow to structure your narrative
5. Write the 3-paragraph narrative
6. Return the JSON with narrative and metadata

**Begin by calling the tools. Do not make up any data.**
`;

export const buildMatchupNarrativePrompt = (
  leagueId: string,
  week: number,
  matchupId: number
): string => {
  return `${MATCHUP_NARRATIVE_PROMPT}

## Matchup Parameters

- League ID: ${leagueId}
- Week: ${week}
- Matchup ID: ${matchupId}

Call the tools with these parameters and generate the narrative.
`;
};
```

### Step 2: Create LangGraph Node (20 min)

```typescript
// apps/web/src/lib/reports/recap/nodes/matchup-narrative-node.ts

import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { buildMatchupNarrativePrompt } from '../prompts/sections/matchup-narrative';
import { toolRegistry } from '../tools/registry';
import type { RecapState } from '../state';

export const matchupNarrativeNode = async (
  state: RecapState
): Promise<Partial<RecapState>> => {
  const { leagueId, week, matchupId } = state;

  if (!leagueId || !week || !matchupId) {
    throw new Error('Missing required state: leagueId, week, or matchupId');
  }

  console.log(`\n🎬 Generating narrative for Matchup ${matchupId}...`);

  // Initialize Gemini with function calling
  const model = new ChatGoogleGenerativeAI({
    modelName: 'gemini-1.5-pro',
    temperature: 0.7, // Some creativity for narrative
    apiKey: process.env.GEMINI_API_KEY,
  });

  const prompt = buildMatchupNarrativePrompt(leagueId, week, matchupId);

  try {
    // Gemini will call the tools as needed
    const response = await model.invoke(prompt);

    // Parse the JSON response
    const result = JSON.parse(response.content as string);

    console.log(`✅ Narrative generated (${result.metadata.wordCount} words)`);
    console.log(`   Excitement Score: ${result.metadata.excitementScore}/100`);

    return {
      matchupNarratives: [
        ...(state.matchupNarratives || []),
        {
          matchupId,
          narrative: result.narrative,
          metadata: result.metadata,
        },
      ],
    };
  } catch (error) {
    console.error(
      `❌ Failed to generate narrative for Matchup ${matchupId}:`,
      error
    );

    // Return a fallback
    return {
      matchupNarratives: [
        ...(state.matchupNarratives || []),
        {
          matchupId,
          narrative: `Error generating narrative for Matchup ${matchupId}. Data tools may have failed.`,
          metadata: {
            finalScore: 'N/A',
            winner: 'N/A',
            excitementScore: 0,
            keyPlayers: [],
            wordCount: 0,
            error: true,
          },
        },
      ],
    };
  }
};
```

### Step 3: Create Test Script (10 min)

```typescript
// apps/web/scripts/test-matchup-narrative.ts

import { StateGraph } from '@langchain/langgraph';
import { matchupNarrativeNode } from '../src/lib/reports/recap/nodes/matchup-narrative-node';
import type { RecapState } from '../src/lib/reports/recap/state';
import { LEAGUE_IDS } from '../src/lib/constants';

const testMatchupNarrative = async (): Promise<void> => {
  console.log('🧪 Testing Matchup Narrative Generation\n');

  // Create a simple graph with just the matchup node
  const graph = new StateGraph<RecapState>({
    channels: {
      leagueId: { value: null },
      week: { value: null },
      matchupId: { value: null },
      matchupNarratives: { value: [] },
    },
  });

  graph.addNode('matchup_narrative', matchupNarrativeNode);
  graph.setEntryPoint('matchup_narrative');
  graph.setFinishPoint('matchup_narrative');

  const app = graph.compile();

  // Test with Week 5, Matchup 1 from AFC
  const initialState: RecapState = {
    leagueId: LEAGUE_IDS.AFC,
    week: 5,
    matchupId: 1,
    matchupNarratives: [],
  };

  try {
    console.log('📝 Generating narrative for AFC Week 5 Matchup 1...\n');

    const result = await app.invoke(initialState);

    console.log('\n✅ Narrative Generation Complete!\n');
    console.log('='.repeat(60));
    console.log(result.matchupNarratives[0].narrative);
    console.log('='.repeat(60));
    console.log('\n📊 Metadata:');
    console.log(JSON.stringify(result.matchupNarratives[0].metadata, null, 2));
  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
};

testMatchupNarrative();
```

---

## ✅ Validation Checklist

**Before marking complete:**

- [ ] Prompt template created with all 11 tools
- [ ] LangGraph node implemented
- [ ] Test script runs successfully: `npm run test:matchup-narrative`
- [ ] Generated narrative is 200-300 words
- [ ] Narrative includes specific data from tools
- [ ] Narrative follows 3-paragraph structure
- [ ] JSON output matches schema
- [ ] No TypeScript errors
- [ ] GEMINI_API_KEY configured in .env

---

## 📊 Expected Output Example

```json
{
  "matchupId": 1,
  "narrative": "The Crimson Tide and Blue Devils delivered a Sunday thriller that showcased the best of Week 5 fantasy football. Entering the matchup with identical 3-1 records, both teams carried momentum, though the Tide held a slight edge with 112.5 projected points to the Devils' 108.2. These division rivals had split their previous two meetings, adding extra spice to an already pivotal clash.\n\nThe game started as a back-and-forth affair, with the Devils jumping out to an early 18-4 lead behind a monster first quarter from Justin Jefferson. But the Tide responded with a devastating 24-point run spanning the second and third quarters, powered by Jalen Hurts' 28.5-point explosion. The lead changed hands three times, and with 15 minutes remaining, the score sat deadlocked at 94-94. That's when the Tide's depth at running back made the difference—a combined 34 points from their RB duo pushed them ahead for good. The Devils' Ja'Marr Chase tried to mount a late comeback with 24.2 points, but it wasn't enough to overcome the deficit.\n\nFinal score: Crimson Tide 118.64, Blue Devils 112.38. The 6.26-point margin understates how dramatic this one was, with an excitement score of 68/100 reflecting the constant tension. Both teams exceeded projections, but the Tide's +6.14 overperformance edged the Devils' +4.18. This win keeps the Tide in playoff contention at 4-1, while the Devils drop to 3-2 and face a critical stretch ahead.",
  "metadata": {
    "finalScore": "118.64 - 112.38",
    "winner": "Crimson Tide",
    "excitementScore": 68,
    "keyPlayers": [
      "Jalen Hurts (28.5 pts)",
      "Justin Jefferson (26.8 pts)",
      "Ja'Marr Chase (24.2 pts)"
    ],
    "wordCount": 287
  }
}
```

---

## 🎯 Success Criteria

**Task is complete when:**

1. ✅ Prompt template guides LLM to call all tools
2. ✅ Single matchup narrative generated successfully
3. ✅ Narrative is factually accurate (uses real tool data)
4. ✅ Output format matches schema
5. ✅ Code committed with message:
   `feat(recap): implement matchup narrative generation (RECAP-009)`

---

## 🔗 Next Task

**RECAP-010: Matchup Narratives - Batch Processing** - Process all 12 matchups
sequentially with context cleanup

---

**Created**: 2025-10-08  
**Status**: 🔴 Not Started
