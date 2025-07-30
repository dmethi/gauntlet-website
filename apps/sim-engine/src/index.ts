export { simulatePlayerScore, simulatePlayerRange } from './models/variance';
export { simulateMatchupProbability } from './models/matchup';

export interface LineupPlayer {
  id: string;
  name: string;
  position: string;
  projection: number;
}

export interface Lineup {
  qb: LineupPlayer;
  rb1: LineupPlayer;
  rb2: LineupPlayer;
  wr1: LineupPlayer;
  wr2: LineupPlayer;
  wr3: LineupPlayer;
  te: LineupPlayer;
  flex: LineupPlayer; // RB/WR/TE
}

export interface MatchupResult {
  team1Score: number;
  team2Score: number;
  winner: 1 | 2;
  margin: number;
}

export interface MatchupSimulationResult {
  team1WinPct: number;
  team2WinPct: number;
  medianMargin: number;
  team1Scores: {
    mean: number;
    median: number;
    p10: number;
    p90: number;
  };
  team2Scores: {
    mean: number;
    median: number;
    p10: number;
    p90: number;
  };
  impliedOdds: {
    team1MoneyLine: number; // e.g. -150 or +130
    team2MoneyLine: number;
    spread: number; // e.g. -3.5 or +3.5
    total: number; // over/under
  };
}
