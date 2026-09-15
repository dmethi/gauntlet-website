export type FlowSectionId =
  | 'prime-time'
  | 'scoreboard-lied'
  | 'sunday-avalanches'
  | 'never-in-doubt'
  | 'final-score-lied';

export type ProbabilityQuality = 'reliable' | 'directional' | 'unreliable';

export interface RecapTeam {
  rosterId: number;
  fallbackLabel: string;
  score: number;
}

export interface WeekOneMatchup {
  key: string;
  leagueId: string;
  matchupId: number;
  teams: readonly [RecapTeam, RecapTeam];
  winnerRosterId: number;
  openingFavoriteRosterId: number;
  openingWinProbability: number;
  headline: string;
  deck: string;
  recap: string;
  decisiveLabel: string;
  probabilityQuality: ProbabilityQuality;
  probabilityNote?: string;
  featured?: boolean;
}

export interface WeekOneLeague {
  leagueId: string;
  name: string;
  shortName: 'Throne' | 'Keep' | 'Forge';
  matchups: readonly WeekOneMatchup[];
}

export interface FlowSection {
  id: FlowSectionId;
  title: string;
  deck: string;
  matchupKeys: readonly string[];
}

export interface RecordBookEntry {
  title: string;
  classification: 'Hall of Fame' | 'Hall of Shame' | 'Statistical oddity';
  rank: number | null;
  rankLabel: string;
  summary: string;
}

export interface LineupAutopsy {
  teamKey: string;
  label: string;
  actualScore: number;
  opponentScore: number;
  revisedScore: number;
  swap: string;
}

export interface HistoricalReceipt {
  title: string;
  summary: string;
  before?: number;
  after?: number;
  beforeLabel?: string;
  afterLabel?: string;
}

export interface WeekOneRecap {
  season: 2026;
  week: 1;
  publishedAt: string;
  headline: string;
  subheadline: string;
  lede: readonly string[];
  leagues: readonly WeekOneLeague[];
  flowSections: readonly FlowSection[];
  records: readonly RecordBookEntry[];
  autopsies: readonly LineupAutopsy[];
  receipts: readonly HistoricalReceipt[];
}

export type ResolvedTeamLabels = Readonly<Record<string, string>>;
