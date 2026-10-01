export type FlowSectionId = string;

export type ProbabilityQuality = 'reliable' | 'directional' | 'unreliable';

export interface RecapTeam {
  rosterId: number;
  fallbackLabel: string;
  score: number;
}

export interface WeeklyRecapMatchup {
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

export interface WeeklyRecapLeague {
  leagueId: string;
  name: string;
  shortName: 'Throne' | 'Keep' | 'Forge';
  matchups: readonly WeeklyRecapMatchup[];
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

export interface StatsDeepDiveItem {
  view: string;
  metric: string;
  title: string;
  summary: string;
  href: string;
  linkLabel: string;
}

export interface StatsDeepDive {
  title: string;
  deck: string;
  items: readonly StatsDeepDiveItem[];
  note?: string;
}

export interface WeeklyRecap {
  season: number;
  week: number;
  publishedAt: string;
  headline: string;
  subheadline: string;
  lede: readonly string[];
  leagues: readonly WeeklyRecapLeague[];
  flowSections: readonly FlowSection[];
  records: readonly RecordBookEntry[];
  autopsies: readonly LineupAutopsy[];
  statsDeepDive?: StatsDeepDive;
  receipts: readonly HistoricalReceipt[];
  openingOddsSource?: string;
}

export type WeekOneMatchup = WeeklyRecapMatchup;
export type WeekOneLeague = WeeklyRecapLeague;
export type WeekOneRecap = WeeklyRecap;

export type ResolvedTeamLabels = Readonly<Record<string, string>>;
