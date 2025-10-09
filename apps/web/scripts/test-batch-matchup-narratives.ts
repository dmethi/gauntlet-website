/**
 * Test script for batch matchup narrative generation.
 *
 * Processes all 12 matchups (6 AFC + 6 NFC) sequentially.
 * This will take approximately 2-3 minutes to complete.
 */

import { config } from 'dotenv';
import { join } from 'path';
import { Annotation, END, START, StateGraph } from '@langchain/langgraph';
import { batchMatchupNarrativesNode } from '../src/lib/reports/recap/nodes/batch-matchup-narratives-node';
import type {
  BatchProgress,
  MatchupNarrative,
  RecapReportState,
} from '../src/lib/reports/recap/state';

// Clear any existing GEMINI_API_KEY to avoid shell environment conflicts
delete process.env.GEMINI_API_KEY;

// Load environment variables from root .env file
const rootEnvPath = join(process.cwd(), '../../.env');
config({ path: rootEnvPath, override: true });

/**
 * State annotation for the test graph.
 */
const TestStateAnnotation = Annotation.Root({
  week: Annotation<number>,
  season: Annotation<number>,
  matchupNarratives: Annotation<MatchupNarrative[] | undefined>,
  progress: Annotation<BatchProgress | undefined>,
});

/**
 * Test batch processing by generating all 12 matchup narratives.
 */
const testBatchProcessing = async (): Promise<void> => {
  console.log('🧪 Testing Batch Matchup Narrative Generation\n');
  console.log('⚠️  This will take ~2-3 minutes to process 12 matchups\n');

  // Create a simple graph with just the batch node
  const graph = new StateGraph(TestStateAnnotation);

  graph.addNode('batch_narratives', batchMatchupNarrativesNode);

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-expect-error - LangGraph type inference limitation
  graph.addEdge(START, 'batch_narratives');
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-expect-error - LangGraph type inference limitation
  graph.addEdge('batch_narratives', END);

  const app = graph.compile();

  const initialState: RecapReportState = {
    week: 5,
    season: 2025,
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
    console.log(`📊 Narratives Generated: ${result.matchupNarratives?.length || 0}`);

    const successful = result.matchupNarratives?.filter(n => !n.metadata.error).length || 0;
    const failed = result.matchupNarratives?.filter(n => n.metadata.error).length || 0;

    console.log(`✅ Successful: ${successful}`);
    console.log(`❌ Failed: ${failed}`);

    // Show first narrative as example
    console.log('\n📖 Sample Narrative (AFC-1):');
    console.log('='.repeat(70));
    const sample = result.matchupNarratives?.find(
      n => n.leagueId.includes('1263744209295245312') && n.matchupId === 1,
    );
    if (sample) {
      console.log(sample.narrative);
      console.log('\n' + '='.repeat(70));
    }

    // Calculate avg word count
    const validNarratives = result.matchupNarratives?.filter(n => !n.metadata.error) || [];
    if (validNarratives.length > 0) {
      const avgWords = Math.round(
        validNarratives.reduce((sum, n) => sum + n.metadata.wordCount, 0) / validNarratives.length,
      );
      console.log(`\n📝 Average Word Count: ${avgWords} words`);

      // Show excitement level distribution
      const excitementLevels = validNarratives.reduce(
        (acc, n) => {
          acc[n.metadata.excitementLevel] = (acc[n.metadata.excitementLevel] || 0) + 1;
          return acc;
        },
        {} as Record<string, number>,
      );
      console.log(`🎉 Excitement Distribution:`, excitementLevels);
    }

    // Show all failed matchups if any
    if (result.progress?.failedMatchups && result.progress.failedMatchups.length > 0) {
      console.log('\n⚠️  Failed Matchups:');
      result.progress.failedMatchups.forEach(key => {
        console.log(`   - ${key}`);
      });
    }
  } catch (error) {
    console.error('❌ Batch test failed:', error);
    process.exit(1);
  }
};

// Run the test
testBatchProcessing();
