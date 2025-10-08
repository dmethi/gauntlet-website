# RECAP-016: Closing Commentary

**Project**: Weekly Recap Reports  
**Phase**: 2 - Section Implementation  
**Estimated Time**: 30 minutes  
**Dependencies**: RECAP-015  
**Status**: 🔴 Not Started

---

## 🎯 Objective

Implement the Closing Commentary section that provides a big-picture summary of
the week, key takeaways, and forward-looking perspective. This is the narrative
capstone of the report.

---

## 📋 What to Build

### Closing Commentary Prompt

Unlike other sections, this doesn't need new data tools—it aggregates insights
from all previous sections to create a cohesive closing.

---

## 📁 Files to Create/Modify

### New Files

```
apps/web/src/lib/reports/recap/prompts/sections/
└── closing.ts                          # Closing prompt

apps/web/src/lib/reports/recap/nodes/
└── closing-commentary-node.ts          # LangGraph node

apps/web/scripts/
└── test-closing-commentary.ts          # Validation script
```

---

## 🛠️ Implementation Steps

### Step 1: Create Closing Prompt (15 min)

```typescript
// apps/web/src/lib/reports/recap/prompts/sections/closing.ts

export const CLOSING_COMMENTARY_PROMPT = `
You are writing the "Closing Commentary" section that wraps up the weekly recap.

## Context Available

You have access to summaries from all previous sections:
- League Overview (scoring trends)
- Matchup Narratives (12 game recaps)
- Hall of Fame (week's best)
- Hall of Shame (week's worst)
- Power Rankings (movement)
- Standings (playoff picture)
- Upcoming Matchups (next week preview)

## Your Task

Write 2-3 paragraphs (150-200 words) that:

1. **Big Picture**: Synthesize the week's major themes
   - Was it a high-scoring week? Upset-heavy? Chalk?
   - Which teams are emerging as contenders?
   - Are there clear tiers forming?

2. **Key Takeaways**: Highlight 2-3 major storylines
   - Dominant performances
   - Surprising results
   - Playoff race implications

3. **Forward-Looking**: Build excitement for next week
   - Key matchups to watch
   - Stakes increasing as season progresses
   - Optimistic, engaging tone

## Style Guidelines

- Reflective and analytical tone
- Tie together threads from the week
- Avoid simply repeating facts from earlier sections
- Focus on meaning and context
- End on an anticipatory note

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
```

### Step 2: Create Closing Node (10 min)

```typescript
// apps/web/src/lib/reports/recap/nodes/closing-commentary-node.ts

import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { buildClosingPrompt } from '../prompts/sections/closing';
import type { RecapState } from '../state';

export const closingCommentaryNode = async (
  state: RecapState
): Promise<Partial<RecapState>> => {
  console.log('\n📝 Generating closing commentary...');

  // Build a context summary from all previous sections
  const contextSummary = buildContextSummary(state);

  const model = new ChatGoogleGenerativeAI({
    modelName: 'gemini-1.5-pro',
    temperature: 0.7,
    apiKey: process.env.GEMINI_API_KEY,
  });

  const prompt = buildClosingPrompt(contextSummary);

  try {
    const response = await model.invoke(prompt);
    const result = JSON.parse(response.content as string);

    console.log('✅ Closing commentary generated');
    console.log(`   Themes: ${result.themes.join(', ')}`);
    console.log(`   Key takeaway: "${result.keyTakeaway}"`);

    return {
      closingCommentary: {
        narrative: result.narrative,
        themes: result.themes,
        keyTakeaway: result.keyTakeaway,
      },
    };
  } catch (error) {
    console.error('❌ Failed to generate closing commentary:', error);

    return {
      closingCommentary: {
        narrative: 'Error generating closing commentary.',
        themes: [],
        keyTakeaway: 'An eventful week in the books.',
        error: true,
      },
    };
  }
};

const buildContextSummary = (state: RecapState): string => {
  let summary = '';

  // League overview
  if (state.leagueOverview) {
    summary += `League Overview: ${state.leagueOverview.totalPoints} total points scored across ${state.leagueOverview.totalMatchups} matchups. `;
    summary += `Average score: ${state.leagueOverview.averageScore}. `;
    summary += `${state.leagueOverview.closeGames} close games, ${state.leagueOverview.blowouts} blowouts.\n\n`;
  }

  // Matchup narratives summary
  if (state.matchupNarratives && state.matchupNarratives.length > 0) {
    const avgExcitement = Math.round(
      state.matchupNarratives.reduce(
        (sum, m) => sum + (m.metadata?.excitementScore || 0),
        0
      ) / state.matchupNarratives.length
    );
    summary += `Matchups: ${state.matchupNarratives.length} games with average excitement score of ${avgExcitement}/100.\n\n`;
  }

  // Hall of Fame
  if (state.hallOfFame) {
    summary += `Hall of Fame: Top score was ${state.hallOfFame.topScore?.score || 'N/A'} pts. `;
    summary += `Biggest blowout: ${state.hallOfFame.biggestBlowout?.margin || 'N/A'} pts.\n\n`;
  }

  // Hall of Shame
  if (state.hallOfShame) {
    summary += `Hall of Shame: Lowest score was ${state.hallOfShame.lowestScore?.score || 'N/A'} pts. `;
    summary += `${state.hallOfShame.badBeats?.length || 0} bad beat losses.\n\n`;
  }

  // Power Rankings
  if (state.powerRankings) {
    summary += `Power Rankings: Biggest riser moved up ${state.powerRankings.biggestRiser?.movement || 0} spots. `;
    summary += `Biggest faller dropped ${Math.abs(state.powerRankings.biggestFaller?.movement || 0)} spots.\n\n`;
  }

  // Upcoming
  if (state.upcomingMatchups) {
    summary += `Next Week: ${state.upcomingMatchups.totalMatchups || 0} matchups scheduled.\n\n`;
  }

  return summary.trim() || 'Limited context available.';
};
```

### Step 3: Create Test Script (5 min)

```typescript
// apps/web/scripts/test-closing-commentary.ts

import { StateGraph } from '@langchain/langgraph';
import { closingCommentaryNode } from '../src/lib/reports/recap/nodes/closing-commentary-node';
import type { RecapState } from '../src/lib/reports/recap/state';

const testClosingCommentary = async (): Promise<void> => {
  console.log('🧪 Testing Closing Commentary\n');

  const graph = new StateGraph<RecapState>({
    channels: {
      week: { value: null },
      leagueOverview: { value: null },
      matchupNarratives: { value: [] },
      hallOfFame: { value: null },
      hallOfShame: { value: null },
      powerRankings: { value: null },
      upcomingMatchups: { value: null },
      closingCommentary: { value: null },
    },
  });

  graph.addNode('closing', closingCommentaryNode);
  graph.setEntryPoint('closing');
  graph.setFinishPoint('closing');

  const app = graph.compile();

  // Create mock state with summary data from all sections
  const mockState: RecapState = {
    week: 5,
    leagueOverview: {
      totalPoints: 2847.32,
      averageScore: 118.64,
      totalMatchups: 12,
      closeGames: 4,
      blowouts: 2,
    },
    matchupNarratives: [
      {
        matchupId: 1,
        narrative: '...',
        metadata: {
          excitementScore: 68,
          finalScore: '118-112',
          winner: 'Team A',
          keyPlayers: [],
          wordCount: 287,
        },
      },
      {
        matchupId: 2,
        narrative: '...',
        metadata: {
          excitementScore: 42,
          finalScore: '124-98',
          winner: 'Team B',
          keyPlayers: [],
          wordCount: 264,
        },
      },
    ],
    hallOfFame: {
      topScore: { score: 156.84, teamName: 'Team X' },
      biggestBlowout: { margin: 44.8, winner: 'Team Y', loser: 'Team Z' },
    },
    hallOfShame: {
      lowestScore: { score: 78.42, teamName: 'Team W' },
      badBeats: [{ teamName: 'Team V', score: 124.8 }],
    },
    powerRankings: {
      biggestRiser: { teamName: 'Team R', movement: 5 },
      biggestFaller: { teamName: 'Team F', movement: -4 },
    },
    upcomingMatchups: {
      totalMatchups: 12,
    },
    closingCommentary: null,
  };

  try {
    console.log('📝 Generating closing commentary with mock context...\n');

    const result = await app.invoke(mockState);

    console.log('='.repeat(70));
    console.log('CLOSING COMMENTARY');
    console.log('='.repeat(70));
    console.log(result.closingCommentary.narrative);
    console.log('\n' + '='.repeat(70));

    console.log('\n📊 Metadata:');
    console.log(`   Themes: ${result.closingCommentary.themes.join(', ')}`);
    console.log(`   Key Takeaway: "${result.closingCommentary.keyTakeaway}"`);

    console.log('\n✅ Closing commentary generated successfully!');
  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
};

testClosingCommentary();
```

---

## ✅ Validation Checklist

**Before marking complete:**

- [ ] Closing prompt created
- [ ] Prompt synthesizes context from all sections
- [ ] Closing node implemented
- [ ] Context summary builder works
- [ ] Test script runs successfully: `npm run test:closing`
- [ ] Generated closing is 150-200 words
- [ ] Forward-looking tone
- [ ] No TypeScript errors

---

## 🎯 Success Criteria

**Task is complete when:**

1. ✅ Closing commentary prompt created
2. ✅ LangGraph node aggregates all section context
3. ✅ Test script generates coherent closing
4. ✅ Closing ties together week's themes
5. ✅ Code committed with message:
   `feat(recap): implement closing commentary (RECAP-016)`

---

## 🎉 Phase 2 Complete!

**All 11 section implementation tasks finished:**

- ✅ League Overview (RECAP-006)
- ✅ Game Flow Compression (RECAP-007)
- ✅ Matchup Data Layer (RECAP-008)
- ✅ Matchup Narratives Generation (RECAP-009)
- ✅ Batch Processing (RECAP-010)
- ✅ Hall of Fame (RECAP-011)
- ✅ Hall of Shame (RECAP-012)
- ✅ Power Rankings (RECAP-013)
- ✅ Standings (RECAP-014)
- ✅ Upcoming Matchups (RECAP-015)
- ✅ Closing Commentary (RECAP-016) ✨

---

## 🔗 Next Phase

**PHASE 3: Report Assembly & UI** (RECAP-017 through RECAP-019)

- Orchestrate all sections
- Generate JSON output
- Build React UI component

---

**Created**: 2025-10-08  
**Status**: 🔴 Not Started
