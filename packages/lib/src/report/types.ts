// Types for report generation inputs/outputs and controls

export type SpiceLevel = 0 | 1 | 2 | 3;
export type Density = 'none' | 'low' | 'medium' | 'high';

export interface ReportControls {
  spiceLevel: SpiceLevel;
  memeDensity: Density;
  emojiDensity: Density;
}

export interface AuthorNotes {
  coldOpen?: string;
  mustInclude?: string[];
  notes?: string[];
}

export interface ReportNotesInput {
  week: number;
  season: number;
  authorNotes?: AuthorNotes;
  controls?: Partial<ReportControls>;
}

export interface MatchupFacts {
  leagueId: string;
  week: number;
  matchupId: number;
  rosterAId: number;
  rosterBId: number;
  teamAName: string;
  teamBName: string;
  scoreA: number;
  scoreB: number;
  winnerRosterId: number | null;
  margin: number;
  decidingFactors?: string[];
  topPerformers?: string[];
  duds?: string[];
  startSitNotes?: string[];
}

export interface TeamFacts {
  rosterId: number;
  name: string;
  owner?: string | null;
  division?: string | null;
  wins: number;
  losses: number;
  totalPoints: number;
  expectedWins: number;
  luckRating: number;
  over110Count?: number;
  over120Count?: number;
  under100Count?: number;
  rollingAvg3?: number;
  volatility?: number;
}

export interface LeagueFeatures {
  parityClusters?: Array<{ label: string; teamIds: number[] }>; // e.g., top/middle/bottom
  matchupOfTheWeek?: number | null; // matchupId
  benchBlunder?: { rosterId: number; delta: number } | null;
}

export interface ReportWeekData {
  leagueId: string;
  season: number;
  week: number;
  matchups: MatchupFacts[];
  teams: TeamFacts[];
  features?: LeagueFeatures;
}

export interface CorpusChunk {
  id: string;
  file: string;
  section: 'intro' | 'matchup' | 'notes' | 'overview' | 'rankings' | 'predictions' | 'other';
  teamsMentioned: string[];
  topics: string[];
  text: string;
  vector: number[]; // embedding or tf-idf style vector
}

export interface CorpusIndex {
  dim: number;
  chunks: CorpusChunk[];
}

export interface RetrievalCriteria {
  section: CorpusChunk['section'];
  teams?: string[];
  topics?: string[];
  limit?: number;
}

export interface RetrievedSnippet {
  id: string;
  text: string;
  score: number;
}
