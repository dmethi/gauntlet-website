# RECAP-010: Matchup Narratives - Batch Processing

**Project**: Weekly Recap Reports  
**Phase**: 2 - Section Implementation  
**Estimated Time**: 30 minutes  
**Dependencies**: RECAP-009  
**Status**: ✅ Complete

---

## 🎯 Objective

Implement batch processing to generate narratives for all 12 matchups (6 per
league × 2 leagues). This requires context management to avoid token overflow
and progress tracking for debugging.

---

## 📋 What to Build

### 1. Batch Processing Node

Process all matchups sequentially:

- AFC Matchups 1-6
- NFC Matchups 1-6
- Clear context after each matchup (avoid token buildup)
- Track progress with logging
- Handle individual failures gracefully

### 2. Context Management

After each matchup:

- Clear tool call history
- Reset conversation context
- Retain only the generated narrative

---

## 📁 Files to Create/Modify

### New Files

```
apps/web/src/lib/reports/recap/nodes/
└── batch-matchup-narratives-node.ts    # Batch processor

apps/web/scripts/
└── test-batch-matchup-narratives.ts    # Full batch test
```

### Modified Files

```
apps/web/src/lib/reports/recap/orchestrator.ts
  - Add batch node to graph
  - Wire for full week processing

apps/web/src/lib/reports/recap/state.ts
  - Add progress tracking fields
```

---

## 🛠️ Implementation Steps

### Step 1: Update State Type (5 min)

```typescript
// apps/web/src/lib/reports/recap/state.ts (additions)

export interface RecapState {
  // ... existing fields

  // Batch processing
  progress?: {
    totalMatchups: number;
    completedMatchups: number;
    currentMatchup?: string;
    failedMatchups: string[];
  };
}
```

### Step 2: Create Batch Processor (20 min)

```typescript
// apps/web/src/lib/reports/recap/nodes/batch-matchup-narratives-node.ts

import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { buildMatchupNarrativePrompt } from '../prompts/sections/matchup-narrative';
import { LEAGUE_IDS } from '@/lib/constants';
import type { RecapState } from '../state';

interface MatchupNarrative {
  leagueId: string;
  matchupId: number;
  narrative: string;
  metadata: {
    finalScore: string;
    winner: string;
    excitementScore: number;
    keyPlayers: string[];
    wordCount: number;
    error?: boolean;
  };
}

export const batchMatchupNarrativesNode = async (
  state: RecapState
): Promise<Partial<RecapState>> => {
  const { week } = state;

  if (!week) {
    throw new Error('Missing required state: week');
  }

  console.log(`\n🎬 Generating narratives for all Week ${week} matchups...`);
  console.log(`   Total: 12 matchups (6 AFC + 6 NFC)\n`);

  const narratives: MatchupNarrative[] = [];
  const failedMatchups: string[] = [];
  let completed = 0;

  // Define all matchups to process
  const matchups = [
    ...Array.from({ length: 6 }, (_, i) => ({
      leagueId: LEAGUE_IDS.AFC,
      matchupId: i + 1,
    })),
    ...Array.from({ length: 6 }, (_, i) => ({
      leagueId: LEAGUE_IDS.NFC,
      matchupId: i + 1,
    })),
  ];

  // Process each matchup sequentially
  for (const matchup of matchups) {
    const { leagueId, matchupId } = matchup;
    const matchupKey = `${leagueId === LEAGUE_IDS.AFC ? 'AFC' : 'NFC'}-${matchupId}`;

    console.log(`\n[${completed + 1}/12] Processing ${matchupKey}...`);

    try {
      // Create fresh model instance for each matchup (clears context)
      const model = new ChatGoogleGenerativeAI({
        modelName: 'gemini-1.5-pro',
        temperature: 0.7,
        apiKey: process.env.GEMINI_API_KEY,
      });

      const prompt = buildMatchupNarrativePrompt(leagueId, week, matchupId);

      const response = await model.invoke(prompt);
      const result = JSON.parse(response.content as string);

      narratives.push({
        leagueId,
        matchupId,
        narrative: result.narrative,
        metadata: result.metadata,
      });

      console.log(
        `   ✅ Generated (${result.metadata.wordCount} words, excitement: ${result.metadata.excitementScore}/100)`
      );

      completed++;
    } catch (error) {
      console.error(
        `   ❌ Failed to generate narrative for ${matchupKey}:`,
        error
      );

      // Add a fallback narrative
      narratives.push({
        leagueId,
        matchupId,
        narrative: `Error generating narrative for ${matchupKey}. Data tools may have failed.`,
        metadata: {
          finalScore: 'N/A',
          winner: 'N/A',
          excitementScore: 0,
          keyPlayers: [],
          wordCount: 0,
          error: true,
        },
      });

      failedMatchups.push(matchupKey);
      completed++;
    }

    // Small delay to respect rate limits
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  console.log(`\n✅ Batch processing complete!`);
  console.log(`   Successful: ${12 - failedMatchups.length}/12`);
  if (failedMatchups.length > 0) {
    console.log(`   Failed: ${failedMatchups.join(', ')}`);
  }

  return {
    matchupNarratives: narratives,
    progress: {
      totalMatchups: 12,
      completedMatchups: completed,
      failedMatchups,
    },
  };
};
```

### Step 3: Create Batch Test Script (5 min)

```typescript
// apps/web/scripts/test-batch-matchup-narratives.ts

import { StateGraph } from '@langchain/langgraph';
import { batchMatchupNarrativesNode } from '../src/lib/reports/recap/nodes/batch-matchup-narratives-node';
import type { RecapState } from '../src/lib/reports/recap/state';

const testBatchProcessing = async (): Promise<void> => {
  console.log('🧪 Testing Batch Matchup Narrative Generation\n');
  console.log('⚠️  This will take ~2-3 minutes to process 12 matchups\n');

  const graph = new StateGraph<RecapState>({
    channels: {
      week: { value: null },
      matchupNarratives: { value: [] },
      progress: { value: null },
    },
  });

  graph.addNode('batch_narratives', batchMatchupNarrativesNode);
  graph.setEntryPoint('batch_narratives');
  graph.setFinishPoint('batch_narratives');

  const app = graph.compile();

  const initialState: RecapState = {
    week: 5,
    matchupNarratives: [],
    progress: undefined,
  };

  const startTime = Date.now();

  try {
    console.log('📝 Generating narratives for all Week 5 matchups...\n');

    const result = await app.invoke(initialState);

    const elapsedSec = Math.round((Date.now() - startTime) / 1000);

    console.log('\n' + '='.repeat(70));
    console.log('✅ BATCH PROCESSING COMPLETE');
    console.log('='.repeat(70));
    console.log(`\n⏱️  Total Time: ${elapsedSec} seconds`);
    console.log(`📊 Narratives Generated: ${result.matchupNarratives.length}`);
    console.log(
      `✅ Successful: ${result.matchupNarratives.filter(n => !n.metadata.error).length}`
    );
    console.log(
      `❌ Failed: ${result.matchupNarratives.filter(n => n.metadata.error).length}`
    );

    // Show first narrative as example
    console.log('\n📖 Sample Narrative (AFC-1):');
    console.log('='.repeat(70));
    const sample = result.matchupNarratives.find(
      n => n.leagueId.includes('AFC') && n.matchupId === 1
    );
    if (sample) {
      console.log(sample.narrative);
      console.log('\n' + '='.repeat(70));
    }

    // Calculate avg word count
    const avgWords = Math.round(
      result.matchupNarratives
        .filter(n => !n.metadata.error)
        .reduce((sum, n) => sum + n.metadata.wordCount, 0) /
        result.matchupNarratives.filter(n => !n.metadata.error).length
    );
    console.log(`\n📝 Average Word Count: ${avgWords} words`);

    // Calculate avg excitement
    const avgExcitement = Math.round(
      result.matchupNarratives
        .filter(n => !n.metadata.error)
        .reduce((sum, n) => sum + n.metadata.excitementScore, 0) /
        result.matchupNarratives.filter(n => !n.metadata.error).length
    );
    console.log(`🎉 Average Excitement Score: ${avgExcitement}/100`);
  } catch (error) {
    console.error('❌ Batch test failed:', error);
    process.exit(1);
  }
};

testBatchProcessing();
```

---

## ✅ Validation Checklist

**Before marking complete:**

- [ ] Batch processor implemented
- [ ] Processes all 12 matchups sequentially
- [ ] Context cleared after each matchup
- [ ] Progress logging works
- [ ] Test script runs successfully: `npm run test:batch-matchups`
- [ ] Failed matchups handled gracefully
- [ ] Rate limiting respected (1s delay between calls)
- [ ] Total execution time < 3 minutes

---

## 📊 Expected Output Example

```
🧪 Testing Batch Matchup Narrative Generation

⚠️  This will take ~2-3 minutes to process 12 matchups

📝 Generating narratives for all Week 5 matchups...

🎬 Generating narratives for all Week 5 matchups...
   Total: 12 matchups (6 AFC + 6 NFC)

[1/12] Processing AFC-1...
   ✅ Generated (287 words, excitement: 68/100)

[2/12] Processing AFC-2...
   ✅ Generated (264 words, excitement: 42/100)

[3/12] Processing AFC-3...
   ✅ Generated (291 words, excitement: 85/100)

... (8 more matchups)

[12/12] Processing NFC-6...
   ✅ Generated (273 words, excitement: 56/100)

✅ Batch processing complete!
   Successful: 12/12

======================================================================
✅ BATCH PROCESSING COMPLETE
======================================================================

⏱️  Total Time: 142 seconds
📊 Narratives Generated: 12
✅ Successful: 12
❌ Failed: 0

📖 Sample Narrative (AFC-1):
======================================================================
The Crimson Tide and Blue Devils delivered a Sunday thriller...
(full narrative)
======================================================================

📝 Average Word Count: 278 words
🎉 Average Excitement Score: 64/100
```

---

## 🎯 Success Criteria

**Task is complete when:**

1. ✅ Batch processor generates all 12 narratives
2. ✅ Context management prevents token overflow
3. ✅ Progress tracking logs each matchup
4. ✅ Failures handled gracefully (fallback narratives)
5. ✅ Code committed with message:
   `feat(recap): implement batch matchup processing (RECAP-010)`

---

## 🔗 Next Task

**RECAP-011: Hall of Fame Section** - Implement tools for weekly superlatives
(best team, biggest blowout, top performers)

---

**Created**: 2025-10-08  
**Completed**: 2025-10-08  
**Status**: ✅ Complete
