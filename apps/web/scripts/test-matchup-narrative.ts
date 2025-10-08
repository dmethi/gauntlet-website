/**
 * Test script for matchup narrative generation.
 * Tests single matchup generation before batch processing.
 */

import { Annotation, END, START, StateGraph } from '@langchain/langgraph';
import { matchupNarrativeNode } from '../src/lib/reports/recap/nodes/matchup-narrative-node';
import type { MatchupNarrative, RecapReportState } from '../src/lib/reports/recap/state';
import { LEAGUE_IDS } from '../src/lib/constants';
import '../src/lib/reports/recap/tools'; // Ensure tools are registered

/**
 * State annotation for the test graph.
 */
const TestStateAnnotation = Annotation.Root({
  week: Annotation<number>,
  season: Annotation<number>,
  leagueId: Annotation<string | undefined>,
  matchupId: Annotation<number | undefined>,
  matchupNarratives: Annotation<MatchupNarrative[] | undefined>,
  errors: Annotation<string[] | undefined>,
  generatedAt: Annotation<string | undefined>,
  tokensUsed: Annotation<number | undefined>,
});

/**
 * Tests matchup narrative generation for a single matchup.
 */
const testMatchupNarrative = async (): Promise<void> => {
  console.log('🧪 Testing Matchup Narrative Generation\n');
  console.log('='.repeat(60));

  // Create a simple graph with just the matchup narrative node
  const workflow = new StateGraph(TestStateAnnotation);

  workflow.addNode('matchup_narrative', matchupNarrativeNode);
  // Note: TypeScript has trouble inferring node types with LangGraph 0.4.9
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-expect-error - LangGraph type inference limitation
  workflow.addEdge(START, 'matchup_narrative');
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-expect-error - LangGraph type inference limitation
  workflow.addEdge('matchup_narrative', END);

  const app = workflow.compile();

  // Test with Week 5, Matchup 1 from AFC
  const initialState: RecapReportState = {
    week: 5,
    season: 2025,
    leagueId: LEAGUE_IDS.AFC,
    matchupId: 1,
    matchupNarratives: [],
    errors: [],
    generatedAt: new Date().toISOString(),
    tokensUsed: 0,
  };

  try {
    console.log('📝 Generating narrative for AFC Week 5 Matchup 1...\n');

    const result = await app.invoke(initialState);

    console.log('\n✅ Narrative Generation Complete!\n');
    console.log('='.repeat(60));
    console.log('NARRATIVE:\n');
    console.log(result.matchupNarratives?.[0]?.narrative || 'No narrative generated');
    console.log('\n' + '='.repeat(60));
    console.log('\n📊 Metadata:');
    console.log(JSON.stringify(result.matchupNarratives?.[0]?.metadata || {}, null, 2));

    if (result.errors && result.errors.length > 0) {
      console.log('\n⚠️  Errors:');
      result.errors.forEach(err => console.log(`  - ${err}`));
    }

    console.log('\n✅ Test completed successfully!');
  } catch (error) {
    console.error('\n❌ Test failed:', error);
    if (error instanceof Error) {
      console.error('Error details:', error.message);
      console.error('Stack trace:', error.stack);
    }
    process.exit(1);
  }
};

// Run the test
testMatchupNarrative();
