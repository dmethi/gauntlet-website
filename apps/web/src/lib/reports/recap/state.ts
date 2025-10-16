/**
 * Metadata for a generated matchup narrative.
 */
export interface MatchupNarrativeMetadata {
  finalScore: string;
  winner: string;
  excitementLevel: 'low' | 'medium' | 'high';
  keyPlayers: string[];
  wordCount: number;
  error?: boolean;
}

/**
 * A single matchup narrative with its metadata and fetched data.
 */
export interface MatchupNarrative {
  matchupId: number;
  leagueId: string;
  narrative: string;
  metadata: MatchupNarrativeMetadata;

  // Fetched matchup data (populated during generation for UI rendering)
  data?: {
    boxScore?: any; // MatchupBoxScore
    rosters?: any; // Team rosters with names
    scoringBreakdown?: any; // Player-by-player scoring
    projections?: any; // Pre-game projections
    projectionVsActual?: any; // Projection accuracy
    records?: any; // Team records entering the week
    h2hHistory?: any; // Head-to-head history
    gameFlow?: any; // CompressedGameFlow with time series
    playoffImplications?: any; // Playoff stakes
    positionBreakdown?: any; // Scoring by position
    keyPlayers?: any; // Top 3 performers per team
  };
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
 * Section-level metadata tracking.
 * Tracks timing, tokens, and status for each section.
 */
export interface SectionMetadata {
  startTime?: number; // Timestamp when section started
  endTime?: number; // Timestamp when section completed
  duration?: number; // Duration in milliseconds
  tokensUsed?: number; // Tokens used by this section
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  error?: string; // Error message if failed
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

  // Structured data for League Overview (for UI rendering)
  leagueOverviewData?: {
    totalPoints: number;
    averageScore: number;
    highestScore: number;
    lowestScore: number;
    totalMatchups: number;
    closeGames: number;
    blowouts: number;
  };

  // Structured data for Hall of Fame/Shame (for UI rendering)
  hallOfFameData?: {
    recordBreakdowns: any[]; // Historical records that week made
    topPerformers: any; // Top 5 at each position
  };
  hallOfShameData?: {
    worstTeams: any[]; // Bottom teams by score
    biggestBusts: any[]; // Biggest disappointments vs projection
  };
  powerRankingsData?: {
    rankings: any[]; // Full rankings with tiers
    tiers: any[]; // Tier summaries
    biggestRiser: any;
    biggestFaller: any;
    notableChanges: any[];
  };
  standingsData?: {
    afc: {
      leagueId: string;
      leagueName: string;
      divisions: Record<string, any[]>; // Division name -> teams
    };
    nfc: {
      leagueId: string;
      leagueName: string;
      divisions: Record<string, any[]>;
    };
  };

  // Metadata
  generatedAt?: string;
  tokensUsed?: number;
  errors?: string[];

  // Section-level metadata
  sectionMetadata?: {
    leagueOverview?: SectionMetadata;
    matchupNarratives?: SectionMetadata;
    hallOfFame?: SectionMetadata;
    hallOfShame?: SectionMetadata;
    powerRankings?: SectionMetadata;
    standings?: SectionMetadata;
    upcoming?: SectionMetadata;
    closing?: SectionMetadata;
  };

  // Batch processing
  progress?: BatchProgress;
}
