// Player types
export interface Player {
  id: string;
  name: string;
  position: Position;
  team: Team;
  status: PlayerStatus;
  fantasyPoints: number;
  projectedPoints: number;
  byeWeek: number;
}

export type Position = 'QB' | 'RB' | 'WR' | 'TE' | 'K' | 'DEF';

export type PlayerStatus = 'active' | 'injured' | 'questionable' | 'out' | 'bye';

// Team types
export interface Team {
  id: string;
  name: string;
  abbreviation: string;
  conference: 'AFC' | 'NFC';
  division: 'North' | 'South' | 'East' | 'West';
}

// League types
export interface League {
  id: string;
  name: string;
  ownerId: string;
  teams: FantasyTeam[];
  settings: LeagueSettings;
  season: number;
  currentWeek: number;
  status: LeagueStatus;
}

export interface FantasyTeam {
  id: string;
  name: string;
  ownerId: string;
  roster: Player[];
  wins: number;
  losses: number;
  pointsFor: number;
  pointsAgainst: number;
}

export interface LeagueSettings {
  teamCount: number;
  rosterSize: number;
  startingLineup: LineupSettings;
  scoringSystem: ScoringSystem;
  playoffTeams: number;
  tradeDeadline: number;
  waiverType: 'FAAB' | 'rolling' | 'reverse';
}

export interface LineupSettings {
  QB: number;
  RB: number;
  WR: number;
  TE: number;
  FLEX: number;
  K: number;
  DEF: number;
  BENCH: number;
}

export type LeagueStatus = 'draft' | 'active' | 'playoffs' | 'complete';

// Scoring types
export interface ScoringSystem {
  passing: PassingScoring;
  rushing: RushingScoring;
  receiving: ReceivingScoring;
  kicking: KickingScoring;
  defense: DefenseScoring;
}

export interface PassingScoring {
  passingYards: number; // points per yard
  passingTDs: number;
  passingINTs: number;
  passing2PT: number;
}

export interface RushingScoring {
  rushingYards: number; // points per yard
  rushingTDs: number;
  rushing2PT: number;
}

export interface ReceivingScoring {
  receivingYards: number; // points per yard
  receivingTDs: number;
  receptions: number; // PPR scoring
  receiving2PT: number;
}

export interface KickingScoring {
  extraPoints: number;
  fieldGoals0to39: number;
  fieldGoals40to49: number;
  fieldGoals50plus: number;
  missedExtraPoints: number;
  missedFieldGoals: number;
}

export interface DefenseScoring {
  sacks: number;
  interceptions: number;
  fumbleRecoveries: number;
  safeties: number;
  defensiveTDs: number;
  pointsAllowed0: number;
  pointsAllowed1To6: number;
  pointsAllowed7To13: number;
  pointsAllowed14To20: number;
  pointsAllowed21To27: number;
  pointsAllowed28To34: number;
  pointsAllowed35Plus: number;
}

// Simulation types
export interface SimulationResult {
  matchupId: string;
  week: number;
  team1: FantasyTeam;
  team2: FantasyTeam;
  team1Score: number;
  team2Score: number;
  winner: string;
  confidence: number;
  playerProjections: PlayerProjection[];
}

export interface PlayerProjection {
  playerId: string;
  projectedPoints: number;
  floor: number;
  ceiling: number;
  confidence: number;
  factors: ProjectionFactor[];
}

export interface ProjectionFactor {
  type: 'matchup' | 'weather' | 'injury' | 'form' | 'vegas';
  impact: number; // -1 to 1
  description: string;
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// User types
export interface User {
  id: string;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  createdAt: Date;
  updatedAt: Date;
} 