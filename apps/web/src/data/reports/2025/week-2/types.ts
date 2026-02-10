export interface BoxscorePlayer {
  playerId: string;
  name: string;
  position: string;
  points: number;
}

export interface ExcitementMetrics {
  leadChanges: number;
  avgDeltaPct: number;
}

export interface GameStory {
  quarter: number;
  timeRemaining: string;
  team1Score: number;
  team2Score: number;
  gameProgress: number;
}

export interface Matchup {
  leagueId: string;
  matchupId: number;
  rosterAId: number;
  rosterBId: number;
  teamAName: string;
  teamBName: string;
  pointsA: number;
  pointsB: number;
  margin: number;
  combinedPoints: number;
  boxscoreA: BoxscorePlayer[];
  boxscoreB: BoxscorePlayer[];
  gameStory: GameStory[];
  excitementMetrics: ExcitementMetrics;
}

export interface LeagueData {
  leagueId: string;
  leagueName: string;
  matchups: Matchup[];
}

export interface PowerRanking {
  leagueId: string;
  rosterId: string;
  name: string;
  rank: number;
  normalized: number;
  wins: number;
  losses: number;
  avgPoints?: number;
  expectedWins?: number;
  rolling3Avg?: number;
  delta?: number;
  deltaLabel?: string;
}

export interface StandingTeam {
  rosterId: number;
  wins: number;
  losses: number;
  ties: number;
  totalPoints: number;
  weeklyScores: number[];
  teamName: string;
  ownerName: string;
  leagueId: string;
  points: number;
}

export interface StandingsData {
  leagueId: string;
  leagueName: string;
  divisions: Record<string, StandingTeam[]>;
}

export interface UpcomingMatchup {
  matchupId: number;
  teamAName: string;
  teamBName: string;
  rosterAId: number;
  rosterBId: number;
}

export interface WeeklyReportData {
  season: string;
  week: number;
  lastUpdated: string;
  dataSource: string;
  leagues: LeagueData[];
  powerRankings: PowerRanking[];
  standings: StandingsData[];
  upcomingMatchups: Record<string, UpcomingMatchup[]>;
}
