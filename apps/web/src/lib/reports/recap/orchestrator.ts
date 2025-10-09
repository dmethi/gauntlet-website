import { Annotation, END, START, StateGraph } from '@langchain/langgraph';
import type { BatchProgress, MatchupNarrative, RecapReportState, SectionMetadata } from './state';

// Import all section nodes
import { leagueOverviewNode } from './nodes/league-overview-node';
import { batchMatchupNarrativesNode } from './nodes/batch-matchup-narratives-node';
import { hallOfFameNode } from './nodes/hall-of-fame-node';
import { powerRankingsNode } from './nodes/power-rankings-node';
import { standingsNode } from './nodes/standings-node';
import { upcomingMatchupsNode } from './nodes/upcoming-matchups-node';
import { closingCommentaryNode } from './nodes/closing-commentary-node';

/**
 * State annotation for LangGraph.
 * Defines the structure of the state and how updates are merged.
 *
 * Note: For arrays that need to handle concurrent updates from parallel nodes,
 * we use a reducer function to merge the updates.
 */
const RecapStateAnnotation = Annotation.Root({
  // Input parameters
  week: Annotation<number>,
  season: Annotation<number>,
  leagueId: Annotation<string | undefined>,
  matchupId: Annotation<number | undefined>,

  // Section outputs
  leagueOverview: Annotation<string | undefined>,
  matchupNarratives: Annotation<MatchupNarrative[] | undefined>,
  hallOfFame: Annotation<string | undefined>,
  hallOfShame: Annotation<string | undefined>,
  powerRankings: Annotation<string | undefined>,
  standings: Annotation<string | undefined>,
  upcoming: Annotation<string | undefined>,
  closing: Annotation<string | undefined>,

  // Metadata
  generatedAt: Annotation<string | undefined>,
  tokensUsed: Annotation<number | undefined>,

  // Errors array with reducer to handle concurrent updates from parallel nodes
  errors: Annotation<string[]>({
    reducer: (prev: string[], update: string[]) => [...prev, ...update],
    default: () => [],
  }),

  // Section-level metadata with custom merge logic for concurrent updates
  sectionMetadata: Annotation<{
    leagueOverview?: SectionMetadata;
    matchupNarratives?: SectionMetadata;
    hallOfFame?: SectionMetadata;
    hallOfShame?: SectionMetadata;
    powerRankings?: SectionMetadata;
    standings?: SectionMetadata;
    upcoming?: SectionMetadata;
    closing?: SectionMetadata;
  }>({
    reducer: (prev: Record<string, SectionMetadata>, update: Record<string, SectionMetadata>) => ({
      ...prev,
      ...update,
    }),
    default: () => ({}),
  }),

  // Batch processing
  progress: Annotation<BatchProgress | undefined>,
});

/**
 * Helper function to wrap node execution with error boundaries and metadata tracking.
 */
const wrapNodeWithTracking = (
  nodeName: string,
  nodeFunction: (state: RecapReportState) => Promise<Partial<RecapReportState>>,
) => {
  return async (state: RecapReportState): Promise<Partial<RecapReportState>> => {
    const startTime = Date.now();

    // Initialize section metadata
    const sectionMetadata = state.sectionMetadata || {};
    sectionMetadata[nodeName as keyof typeof sectionMetadata] = {
      startTime,
      status: 'in_progress',
    };

    try {
      // eslint-disable-next-line no-console
      console.log(`\n🚀 [${nodeName}] Starting...`);

      // Execute the node
      const result = await nodeFunction(state);

      const endTime = Date.now();
      const duration = endTime - startTime;

      // Update metadata with success
      sectionMetadata[nodeName as keyof typeof sectionMetadata] = {
        startTime,
        endTime,
        duration,
        status: 'completed',
      };

      // eslint-disable-next-line no-console
      console.log(`✅ [${nodeName}] Completed in ${duration}ms`);

      return {
        ...result,
        sectionMetadata: { ...state.sectionMetadata, ...sectionMetadata },
      };
    } catch (error) {
      const endTime = Date.now();
      const duration = endTime - startTime;
      const errorMessage = error instanceof Error ? error.message : String(error);

      // Update metadata with failure
      sectionMetadata[nodeName as keyof typeof sectionMetadata] = {
        startTime,
        endTime,
        duration,
        status: 'failed',
        error: errorMessage,
      };

      console.error(`❌ [${nodeName}] Failed after ${duration}ms:`, error);

      return {
        sectionMetadata: { ...state.sectionMetadata, ...sectionMetadata },
        errors: [...(state.errors || []), `${nodeName}: ${errorMessage}`],
      };
    }
  };
};

/**
 * Creates the LangGraph state machine for recap report generation.
 *
 * Phase 3 Workflow (RECAP-017):
 *
 * START
 *   ↓
 * [Parallel Group 1 - Data Sections]
 *   ├─ league_overview
 *   ├─ hall_of_fame (includes hall of shame)
 *   ├─ power_rankings
 *   ├─ standings
 *   └─ upcoming
 *   ↓
 * batch_matchup_narratives (sequential after data sections)
 *   ↓
 * closing_commentary (depends on all sections)
 *   ↓
 * END
 *
 * Features:
 * - Parallel execution where possible
 * - Section-level error boundaries
 * - Progress tracking and logging
 * - Metadata collection (timing, tokens, errors)
 */
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types, @typescript-eslint/explicit-function-return-type
export const createRecapOrchestrator = () => {
  // Define the graph with the state annotation
  const workflow = new StateGraph(RecapStateAnnotation);

  // Add all section nodes with error boundary wrapping
  // Note: Node names can't match state attribute names, so we use _node suffix
  workflow.addNode(
    'league_overview_node',
    wrapNodeWithTracking('league_overview', leagueOverviewNode),
  );
  workflow.addNode('hall_of_fame_node', wrapNodeWithTracking('hall_of_fame', hallOfFameNode));
  workflow.addNode(
    'power_rankings_node',
    wrapNodeWithTracking('power_rankings', powerRankingsNode),
  );
  workflow.addNode('standings_node', wrapNodeWithTracking('standings', standingsNode));
  workflow.addNode('upcoming_node', wrapNodeWithTracking('upcoming', upcomingMatchupsNode));
  workflow.addNode(
    'batch_matchup_narratives_node',
    wrapNodeWithTracking('batch_matchup_narratives', batchMatchupNarrativesNode),
  );
  workflow.addNode(
    'closing_commentary_node',
    wrapNodeWithTracking('closing_commentary', closingCommentaryNode),
  );

  // Define edges for workflow
  // Note: TypeScript has trouble inferring node types with LangGraph 0.4.9
  // but the code works correctly at runtime

  // Start with all parallel sections
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-expect-error - LangGraph type inference limitation
  workflow.addEdge(START, 'league_overview_node');
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-expect-error - LangGraph type inference limitation
  workflow.addEdge(START, 'hall_of_fame_node');
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-expect-error - LangGraph type inference limitation
  workflow.addEdge(START, 'power_rankings_node');
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-expect-error - LangGraph type inference limitation
  workflow.addEdge(START, 'standings_node');
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-expect-error - LangGraph type inference limitation
  workflow.addEdge(START, 'upcoming_node');

  // All parallel sections flow into batch matchup narratives
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-expect-error - LangGraph type inference limitation
  workflow.addEdge('league_overview_node', 'batch_matchup_narratives_node');
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-expect-error - LangGraph type inference limitation
  workflow.addEdge('hall_of_fame_node', 'batch_matchup_narratives_node');
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-expect-error - LangGraph type inference limitation
  workflow.addEdge('power_rankings_node', 'batch_matchup_narratives_node');
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-expect-error - LangGraph type inference limitation
  workflow.addEdge('standings_node', 'batch_matchup_narratives_node');
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-expect-error - LangGraph type inference limitation
  workflow.addEdge('upcoming_node', 'batch_matchup_narratives_node');

  // Matchup narratives flow into closing commentary
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-expect-error - LangGraph type inference limitation
  workflow.addEdge('batch_matchup_narratives_node', 'closing_commentary_node');

  // Closing commentary is the final node before END
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-expect-error - LangGraph type inference limitation
  workflow.addEdge('closing_commentary_node', END);

  // Compile the graph
  return workflow.compile();
};

/**
 * Main entry point for generating a recap report.
 *
 * @param week - NFL week number
 * @param season - NFL season year
 * @returns Complete recap report state with all sections
 */
export const generateRecapReport = async (
  week: number,
  season: number = 2025,
): Promise<RecapReportState> => {
  const overallStartTime = Date.now();

  // eslint-disable-next-line no-console
  console.log('\n' + '='.repeat(80));
  // eslint-disable-next-line no-console
  console.log(`🏈 GENERATING WEEKLY RECAP REPORT - Week ${week}, ${season} Season`);
  // eslint-disable-next-line no-console
  console.log('='.repeat(80));

  const orchestrator = createRecapOrchestrator();

  const initialState: RecapReportState = {
    week,
    season,
    generatedAt: new Date().toISOString(),
    tokensUsed: 0,
  };

  try {
    const result = await orchestrator.invoke(initialState);

    const overallDuration = Date.now() - overallStartTime;

    // Print summary
    // eslint-disable-next-line no-console
    console.log('\n' + '='.repeat(80));
    // eslint-disable-next-line no-console
    console.log('📊 GENERATION SUMMARY');
    // eslint-disable-next-line no-console
    console.log('='.repeat(80));
    // eslint-disable-next-line no-console
    console.log(`⏱️  Total Duration: ${(overallDuration / 1000).toFixed(2)}s`);
    // eslint-disable-next-line no-console
    console.log(`📝 Sections Generated:`);

    const metadata = result.sectionMetadata || {};
    Object.entries(metadata).forEach(([section, data]) => {
      const status = data.status === 'completed' ? '✅' : data.status === 'failed' ? '❌' : '⏳';
      const duration = data.duration ? `${(data.duration / 1000).toFixed(2)}s` : '---';
      // eslint-disable-next-line no-console
      console.log(`   ${status} ${section}: ${duration}`);
      if (data.error) {
        // eslint-disable-next-line no-console
        console.log(`      Error: ${data.error}`);
      }
    });

    if (result.errors && result.errors.length > 0) {
      // eslint-disable-next-line no-console
      console.log(`\n⚠️  Errors (${result.errors.length}):`);
      // eslint-disable-next-line no-console
      result.errors.forEach(err => console.log(`   - ${err}`));
    }

    // eslint-disable-next-line no-console
    console.log('\n✨ Report generation complete!');
    // eslint-disable-next-line no-console
    console.log('='.repeat(80) + '\n');

    return result;
  } catch (error) {
    const overallDuration = Date.now() - overallStartTime;

    console.error('\n' + '='.repeat(80));
    console.error('❌ GENERATION FAILED');
    console.error('='.repeat(80));
    console.error(`⏱️  Failed after: ${(overallDuration / 1000).toFixed(2)}s`);
    console.error(`Error: ${error instanceof Error ? error.message : String(error)}`);
    console.error('='.repeat(80) + '\n');

    throw error;
  }
};
