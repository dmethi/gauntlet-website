/**
 * Test script for closing commentary generation.
 * Tests the final section that synthesizes all previous sections.
 */

import { Annotation, END, START, StateGraph } from '@langchain/langgraph';
import { closingCommentaryNode } from '../src/lib/reports/recap/nodes/closing-commentary-node';
import type { RecapReportState } from '../src/lib/reports/recap/state';

/**
 * State annotation for the test graph.
 */
const TestStateAnnotation = Annotation.Root({
  week: Annotation<number>,
  season: Annotation<number>,
  leagueId: Annotation<string | undefined>,
  matchupId: Annotation<number | undefined>,
  leagueOverview: Annotation<string | undefined>,
  matchupNarratives: Annotation<any[] | undefined>,
  hallOfFame: Annotation<string | undefined>,
  hallOfShame: Annotation<string | undefined>,
  powerRankings: Annotation<string | undefined>,
  standings: Annotation<string | undefined>,
  upcoming: Annotation<string | undefined>,
  closing: Annotation<string | undefined>,
  errors: Annotation<string[] | undefined>,
  generatedAt: Annotation<string | undefined>,
  tokensUsed: Annotation<number | undefined>,
});

/**
 * Tests closing commentary generation with mock section data.
 */
const testClosingCommentary = async (): Promise<void> => {
  console.log('🧪 Testing Closing Commentary Generation\n');
  console.log('='.repeat(70));

  // Create a simple graph with just the closing commentary node
  const workflow = new StateGraph(TestStateAnnotation);

  workflow.addNode('closing_commentary', closingCommentaryNode);
  // Note: TypeScript has trouble inferring node types with LangGraph 0.4.9
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-expect-error - LangGraph type inference limitation
  workflow.addEdge(START, 'closing_commentary');
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-expect-error - LangGraph type inference limitation
  workflow.addEdge('closing_commentary', END);

  const app = workflow.compile();

  // Create mock state with sample data from all sections
  const initialState: RecapReportState = {
    week: 5,
    season: 2025,

    // League Overview
    leagueOverview: `Week 5 brought high-scoring action with 2,847.32 total points across 12 matchups. 
The average score of 118.64 points was well above the season average, suggesting offensive firepower 
is ramping up. We saw 4 games decided by 10 points or less, keeping things competitive, while 2 
blowouts reminded us that not every week is kind to all.`,

    // Sample matchup narratives (abbreviated for test)
    matchupNarratives: [
      {
        matchupId: 1,
        leagueId: '1263744209295245312',
        narrative: 'Team A pulled off a comeback victory...',
        metadata: {
          finalScore: '124.5-118.2',
          winner: 'Team A',
          excitementLevel: 'high',
          keyPlayers: ['Josh Allen', 'Saquon Barkley'],
          wordCount: 287,
        },
      },
      {
        matchupId: 2,
        leagueId: '1263744209295245312',
        narrative: 'A blowout performance from Team B...',
        metadata: {
          finalScore: '142.8-98.4',
          winner: 'Team B',
          excitementLevel: 'low',
          keyPlayers: ['Patrick Mahomes', 'Tyreek Hill'],
          wordCount: 264,
        },
      },
      {
        matchupId: 3,
        leagueId: '1263744209295245312',
        narrative: 'Nail-biter between Team C and Team D...',
        metadata: {
          finalScore: '115.6-112.4',
          winner: 'Team C',
          excitementLevel: 'high',
          keyPlayers: ['Lamar Jackson'],
          wordCount: 302,
        },
      },
    ],

    // Hall of Fame
    hallOfFame: `**Top Score**: Team Elite put up a league-best 156.84 points, thanks to monster 
performances from their QB and WR corps. **Biggest Blowout**: Team Crusher demolished their opponent 
by 44.8 points in a statement win. **Best Bench**: Team Depth had 78.6 bench points, showing the 
frustration of "playing the wrong guys."`,

    // Hall of Shame
    hallOfShame: `**Lowest Score**: Team Struggling managed just 78.42 points in a week to forget. 
**Bad Beat of the Week**: Team Unlucky scored 124.8 points but still lost to a higher-scoring 
opponent. Would have beaten 8 other teams this week. **Biggest Underperformer**: Star RB Jonathan 
Taylor was expected to score 18.5 but managed only 6.2 points.`,

    // Power Rankings
    powerRankings: `After Week 5, we're seeing clear tiers emerge. **Biggest Riser**: Team Momentum 
jumped 5 spots after their second straight dominant win. **Biggest Faller**: Team Freefall dropped 
4 spots after losing their star QB to injury. The top 6 teams are separating from the pack, with 
playoff positioning becoming clearer each week.`,

    // Standings
    standings: `The playoff race is heating up! AFC has 3 teams at 4-1, while NFC shows more parity 
with 6 teams bunched between 3-2 and 2-3. Four teams have already clinched playoff spots with 
dominant 5-0 starts. Meanwhile, 3 teams sit at 1-4 and need to make a move soon or risk elimination. 
Tie-breakers are going to matter down the stretch.`,

    // Upcoming Matchups
    upcoming: `Week 6 features several potential playoff previews. The marquee matchup pits two 4-1 
teams against each other in what could decide the AFC East. Another battle of unbeatens happens in 
the NFC, where Team Perfect looks to stay undefeated. Three teams on bye weeks will be scoreboard 
watching as the standings continue to take shape.`,

    errors: [],
    generatedAt: new Date().toISOString(),
    tokensUsed: 0,
  };

  try {
    console.log('📝 Generating closing commentary with mock context...\n');

    const result = await app.invoke(initialState);

    console.log('\n✅ Closing Commentary Generation Complete!\n');
    console.log('='.repeat(70));
    console.log('CLOSING COMMENTARY:\n');
    console.log(result.closing || 'No closing generated');
    console.log('\n' + '='.repeat(70));

    if (result.errors && result.errors.length > 0) {
      console.log('\n⚠️  Errors:');
      result.errors.forEach(err => console.log(`  - ${err}`));
    }

    console.log('\n✅ Test completed successfully!');
    console.log('\n💡 The closing commentary should:');
    console.log('   - Synthesize major themes from the week');
    console.log('   - Highlight 2-3 key storylines');
    console.log('   - Build excitement for next week');
    console.log('   - Be 150-200 words in length');
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
testClosingCommentary();
