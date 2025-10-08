import { Annotation, END, START, StateGraph } from '@langchain/langgraph';
import type { BatchProgress, MatchupNarrative, RecapReportState } from './state';
import { testNode } from './nodes/test-node';

// Import nodes for future use in orchestration
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { matchupNarrativeNode } from './nodes/matchup-narrative-node';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { batchMatchupNarrativesNode } from './nodes/batch-matchup-narratives-node';

/**
 * State annotation for LangGraph.
 * Defines the structure of the state and how updates are merged.
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
  errors: Annotation<string[] | undefined>,

  // Batch processing
  progress: Annotation<BatchProgress | undefined>,
});

/**
 * Creates the LangGraph state machine for recap report generation.
 *
 * Current workflow (Phase 2):
 * START → test_node → END
 * (matchup_narrative node available for testing)
 *
 * Future workflow will include:
 * - League overview node
 * - Matchup narratives (12×) - IMPLEMENTED, needs batch orchestration
 * - Hall of Fame/Shame nodes
 * - Power rankings node
 * - etc.
 */
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types, @typescript-eslint/explicit-function-return-type
export const createRecapOrchestrator = () => {
  // Define the graph with the state annotation
  const workflow = new StateGraph(RecapStateAnnotation);

  // Add nodes
  workflow.addNode('test_node', testNode);
  // matchup_narrative node available but not wired yet (will be added in RECAP-010)
  // workflow.addNode('matchup_narrative', matchupNarrativeNode);

  // Define edges (still using test_node as default)
  // Note: TypeScript has trouble inferring node types with LangGraph 0.4.9
  // but the code works correctly at runtime
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-expect-error - LangGraph type inference limitation
  workflow.addEdge(START, 'test_node');
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-expect-error - LangGraph type inference limitation
  workflow.addEdge('test_node', END);

  // Compile the graph
  return workflow.compile();
};

/**
 * Main entry point for generating a recap report.
 *
 * @param week - NFL week number
 * @param season - NFL season year
 */
export const generateRecapReport = async (
  week: number,
  season: number = 2025,
): Promise<RecapReportState> => {
  const orchestrator = createRecapOrchestrator();

  const initialState: RecapReportState = {
    week,
    season,
    generatedAt: new Date().toISOString(),
    tokensUsed: 0,
    errors: [],
  };

  const result = await orchestrator.invoke(initialState);
  return result;
};
