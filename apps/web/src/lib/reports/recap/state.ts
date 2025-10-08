/**
 * Metadata for a generated matchup narrative.
 */
export interface MatchupNarrativeMetadata {
  finalScore: string;
  winner: string;
  excitementScore: number;
  keyPlayers: string[];
  wordCount: number;
  error?: boolean;
}

/**
 * A single matchup narrative with its metadata.
 */
export interface MatchupNarrative {
  matchupId: number;
  leagueId: string;
  narrative: string;
  metadata: MatchupNarrativeMetadata;
}

/**
 * Progress tracking for batch processing.
 */
export interface BatchProgress {
  totalMatchups: number;
  completedMatchups: number;
  currentMatchup?: string;
  failedMatchups: string[];
}

/**
 * Central state type for the recap report generation workflow.
 * All nodes read from and write to this state object.
 */
export interface RecapReportState {
  // Input
  week: number;
  season: number;
  leagueId?: string; // Added for matchup narrative generation
  matchupId?: number; // Added for single matchup testing

  // Section outputs (will be populated by nodes)
  leagueOverview?: string;
  matchupNarratives?: MatchupNarrative[];
  hallOfFame?: string;
  hallOfShame?: string;
  powerRankings?: string;
  standings?: string;
  upcoming?: string;
  closing?: string;

  // Metadata
  generatedAt?: string;
  tokensUsed?: number;
  errors?: string[];

  // Batch processing
  progress?: BatchProgress;
}
