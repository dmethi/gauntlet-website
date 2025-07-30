export * from './models/matchup';
export * from './models/variance';
export * from './simulations/matchup-sim';
export * from './simulations/season-sim';

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
