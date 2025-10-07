/**
 * Playoff bracket types
 * Types for playoff bracket visualization and management
 */

import type { TeamStats } from '@/lib/hooks';

export interface Matchup {
  week: number;
  points: number;
  projected: number;
  result: 'W' | 'L' | 'T';
}

export interface Roster {
  id: string;
  matchups: Matchup[];
}

export interface LeagueData {
  rosters: Roster[];
}

export interface PlayoffMatchup {
  r: number; // round
  m: number; // matchup id
  t1: number; // team 1 roster id
  t2: number; // team 2 roster id
  t1_from?: { w: number; m: number } | { l: number; m: number }; // where team 1 comes from
  t2_from?: { w: number; m: number } | { l: number; m: number }; // where team 2 comes from
}

export interface PlayoffBracket {
  winners_bracket?: PlayoffMatchup[];
  losers_bracket?: PlayoffMatchup[];
}

export interface BracketTeam {
  id: string;
  name: string;
  seed: number;
  record: string;
  points?: number;
  isWinner?: boolean;
  isEliminated?: boolean;
}

export interface MatchupResult {
  team1Score?: number;
  team2Score?: number;
  winnerId?: string;
  isComplete?: boolean;
}

export interface MatchupProps {
  team1?: BracketTeam;
  team2?: BracketTeam;
  matchupLabel: string;
  isBye?: boolean;
  result?: MatchupResult;
  isToiletBowl?: boolean;
}

export interface PlayoffBracketProps {
  teams: TeamStats[];
  league?: LeagueData;
  playoffBracket?: PlayoffBracket;
}
