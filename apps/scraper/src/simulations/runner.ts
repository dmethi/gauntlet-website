export async function runSimulations(leagueId: string) {
  console.log(`Running simulations for league ${leagueId}...`);

  try {
    // This would integrate with your sim-engine
    // For now, just log that we're running sims

    const simulationResults = {
      leagueId,
      week: getCurrentWeek(),
      winProbabilities: {},
      playoffOdds: {},
      projectedStandings: [],
      updatedAt: new Date().toISOString(),
    };

    console.log(`Simulation completed for league ${leagueId}`);
    return simulationResults;
  } catch (error) {
    console.error(`Simulation failed for league ${leagueId}:`, error);
    throw error;
  }
}

function getCurrentWeek(): number {
  const seasonStart = new Date('2024-09-05');
  const now = new Date();
  const diffTime = now.getTime() - seasonStart.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return Math.min(Math.max(Math.ceil(diffDays / 7), 1), 18);
}
