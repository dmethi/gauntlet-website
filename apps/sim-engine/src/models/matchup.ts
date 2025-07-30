import { simulatePlayerScore } from './variance';

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

/**
 * Simulate a single matchup between two lineups
 */
async function simulateMatchup(
  team1: Lineup,
  team2: Lineup,
  gameProgress: number = 0
): Promise<MatchupResult> {
  // Validate no duplicate players
  const team1Players = new Set([
    team1.qb.id,
    team1.rb1.id,
    team1.rb2.id,
    team1.wr1.id,
    team1.wr2.id,
    team1.wr3.id,
    team1.te.id,
    team1.flex.id,
  ]);
  const team2Players = new Set([
    team2.qb.id,
    team2.rb1.id,
    team2.rb2.id,
    team2.wr1.id,
    team2.wr2.id,
    team2.wr3.id,
    team2.te.id,
    team2.flex.id,
  ]);

  if (team1Players.size !== 8 || team2Players.size !== 8) {
    throw new Error('Duplicate players detected in lineup');
  }

  // Simulate each player
  const [team1Scores, team2Scores] = await Promise.all([
    Promise.all([
      simulatePlayerScore(team1.qb.id, team1.qb.position, team1.qb.projection, gameProgress),
      simulatePlayerScore(team1.rb1.id, team1.rb1.position, team1.rb1.projection, gameProgress),
      simulatePlayerScore(team1.rb2.id, team1.rb2.position, team1.rb2.projection, gameProgress),
      simulatePlayerScore(team1.wr1.id, team1.wr1.position, team1.wr1.projection, gameProgress),
      simulatePlayerScore(team1.wr2.id, team1.wr2.position, team1.wr2.projection, gameProgress),
      simulatePlayerScore(team1.wr3.id, team1.wr3.position, team1.wr3.projection, gameProgress),
      simulatePlayerScore(team1.te.id, team1.te.position, team1.te.projection, gameProgress),
      simulatePlayerScore(team1.flex.id, team1.flex.position, team1.flex.projection, gameProgress),
    ]),
    Promise.all([
      simulatePlayerScore(team2.qb.id, team2.qb.position, team2.qb.projection, gameProgress),
      simulatePlayerScore(team2.rb1.id, team2.rb1.position, team2.rb1.projection, gameProgress),
      simulatePlayerScore(team2.rb2.id, team2.rb2.position, team2.rb2.projection, gameProgress),
      simulatePlayerScore(team2.wr1.id, team2.wr1.position, team2.wr1.projection, gameProgress),
      simulatePlayerScore(team2.wr2.id, team2.wr2.position, team2.wr2.projection, gameProgress),
      simulatePlayerScore(team2.wr3.id, team2.wr3.position, team2.wr3.projection, gameProgress),
      simulatePlayerScore(team2.te.id, team2.te.position, team2.te.projection, gameProgress),
      simulatePlayerScore(team2.flex.id, team2.flex.position, team2.flex.projection, gameProgress),
    ]),
  ]);

  const team1Total = team1Scores.reduce((sum, score) => sum + score, 0);
  const team2Total = team2Scores.reduce((sum, score) => sum + score, 0);

  return {
    team1Score: team1Total,
    team2Score: team2Total,
    winner: team1Total > team2Total ? 1 : 2,
    margin: Math.abs(team1Total - team2Total),
  };
}

/**
 * Convert win probability to American odds
 */
function probToMoneyLine(probability: number): number {
  if (probability > 0.5) {
    return -Math.round((probability / (1 - probability)) * 100);
  } else {
    return Math.round(((1 - probability) / probability) * 100);
  }
}

/**
 * Calculate betting lines from simulation results
 */
function calculateBettingLines(
  results: MatchupResult[],
  team1Scores: number[],
  team2Scores: number[]
): {
  spread: number;
  total: number;
  team1MoneyLine: number;
  team2MoneyLine: number;
} {
  // Sort margins for median
  const margins = results.map(r => (r.winner === 1 ? r.margin : -r.margin)).sort((a, b) => a - b);

  // Get median margin
  const medianMargin = margins[Math.floor(margins.length / 2)];

  // Round spread to nearest 0.5
  const spread = Math.round(medianMargin * 2) / 2;

  // Calculate over/under from median team scores
  const medianTotal =
    team1Scores[Math.floor(team1Scores.length / 2)] +
    team2Scores[Math.floor(team2Scores.length / 2)];

  // Round total to nearest 0.5
  const total = Math.round(medianTotal * 2) / 2;

  // Calculate money lines from win percentage
  const team1Wins = results.filter(r => r.winner === 1).length;
  const team1WinPct = team1Wins / results.length;

  return {
    spread,
    total,
    team1MoneyLine: probToMoneyLine(team1WinPct),
    team2MoneyLine: probToMoneyLine(1 - team1WinPct),
  };
}

/**
 * Simulate many matchups to get win probabilities and betting lines
 */
export async function simulateMatchupProbability(
  team1: Lineup,
  team2: Lineup,
  iterations: number = 10000,
  gameProgress: number = 0
): Promise<MatchupSimulationResult> {
  const results: MatchupResult[] = [];
  const team1Scores: number[] = [];
  const team2Scores: number[] = [];

  // Run simulations
  for (let i = 0; i < iterations; i++) {
    const result = await simulateMatchup(team1, team2, gameProgress);
    results.push(result);
    team1Scores.push(result.team1Score);
    team2Scores.push(result.team2Score);
  }

  // Sort scores for percentiles
  team1Scores.sort((a, b) => a - b);
  team2Scores.sort((a, b) => a - b);

  // Calculate win percentages
  const team1Wins = results.filter(r => r.winner === 1).length;
  const team1WinPct = team1Wins / iterations;
  const team2WinPct = 1 - team1WinPct;

  // Calculate median margin
  const margins = results.map(r => (r.winner === 1 ? r.margin : -r.margin)).sort((a, b) => a - b);
  const medianMargin = margins[Math.floor(margins.length / 2)];

  // Calculate betting lines
  const impliedOdds = calculateBettingLines(results, team1Scores, team2Scores);

  return {
    team1WinPct,
    team2WinPct,
    medianMargin,
    team1Scores: {
      mean: team1Scores.reduce((sum, s) => sum + s, 0) / iterations,
      median: team1Scores[Math.floor(iterations * 0.5)],
      p10: team1Scores[Math.floor(iterations * 0.1)],
      p90: team1Scores[Math.floor(iterations * 0.9)],
    },
    team2Scores: {
      mean: team2Scores.reduce((sum, s) => sum + s, 0) / iterations,
      median: team2Scores[Math.floor(iterations * 0.5)],
      p10: team2Scores[Math.floor(iterations * 0.1)],
      p90: team2Scores[Math.floor(iterations * 0.9)],
    },
    impliedOdds,
  };
}
