import { NextRequest, NextResponse } from 'next/server';

async function getPrisma() {
  const { PrismaClient } = await import('@prisma/client');
  return new PrismaClient();
}

export async function GET(
  request: NextRequest,
  { params }: { params: { leagueId: string; week: string; matchupId: string } }
) {
  try {
    const { leagueId, week, matchupId } = params;
    const weekNumber = parseInt(week);
    const matchupIdNumber = parseInt(matchupId);

    console.log(
      `📊 [STORED SIMULATION API] Fetching stored results for league ${leagueId}, week ${weekNumber}, matchup ${matchupIdNumber}`
    );

    const prisma = await getPrisma();

    try {
      // Fetch stored simulation results from database
      const storedSimulation = await prisma.matchupSimulation.findFirst({
        where: {
          leagueId: leagueId,
          week: weekNumber,
          matchupId: matchupIdNumber,
        },
        include: {
          playerSimulations: true
        }
      });

      if (!storedSimulation) {
        console.warn(`❌ No stored simulation found for league ${leagueId}, week ${weekNumber}, matchup ${matchupIdNumber}`);
        return NextResponse.json({
          success: false,
          error: 'Simulation results not found. Please run batch simulations first.',
        }, { status: 404 });
      }

      console.log(`✅ Found stored simulation with ${storedSimulation.iterations} iterations`);

      // Convert stored data back to expected simulation result format
      const simulationResult = {
        team1Scores: {
          mean: storedSimulation.teamAMean,
          p10: storedSimulation.teamAP10,
          median: storedSimulation.teamAMedian,
          p90: storedSimulation.teamAP90,
          stdDev: storedSimulation.teamAStdDev,
        },
        team2Scores: {
          mean: storedSimulation.teamBMean,
          p10: storedSimulation.teamBP10,
          median: storedSimulation.teamBMedian,
          p90: storedSimulation.teamBP90,
          stdDev: storedSimulation.teamBStdDev,
        },
        team1WinPct: storedSimulation.teamAWinPct,
        team2WinPct: storedSimulation.teamBWinPct,
        impliedOdds: {
          spread: storedSimulation.impliedSpread,
          total: storedSimulation.totalLine,
          team1MoneyLine: storedSimulation.moneyLineA,
          team2MoneyLine: storedSimulation.moneyLineB,
          overPct: storedSimulation.overPct,
          underPct: storedSimulation.underPct,
        },
        // Metadata about the simulation
        iterations: storedSimulation.iterations,
        computeTimeMs: storedSimulation.computeTimeMs,
        generatedAt: storedSimulation.createdAt.toISOString(),
      };

      console.log(`📊 Returning stored simulation: Team A ${(storedSimulation.teamAWinPct * 100).toFixed(1)}% vs Team B ${(storedSimulation.teamBWinPct * 100).toFixed(1)}%`);

      return NextResponse.json({
        success: true,
        simulation: simulationResult,
        source: 'stored', // Indicate this came from database
        playersDistributions: storedSimulation.playerSimulations.map(player => ({
          playerId: player.playerId,
          playerName: player.playerName,
          position: player.position,
          mean: player.mean,
          p10: player.p10,
          median: player.median,
          p90: player.p90,
          stdDev: player.stdDev,
          projection: player.projection,
          dataSource: player.dataSource,
        })),
      });

    } finally {
      await prisma.$disconnect();
    }

  } catch (error) {
    console.error('❌ [STORED SIMULATION API] Error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch stored simulation results',
    }, { status: 500 });
  }
}