import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { leagueId: string; week: string; matchupId: string } }
) {
  console.log('🚀 [STORED SIMULATION API] Function called!');
  console.log('📥 Request params:', {
    leagueId: params.leagueId,
    week: params.week,
    matchupId: params.matchupId,
  });

  try {
    const { leagueId, week, matchupId } = params;
    const weekNumber = parseInt(week);
    const matchupIdNumber = parseInt(matchupId);

    console.log('🔍 [STORED SIMULATION API] Parsed params:', {
      leagueId,
      weekNumber,
      matchupIdNumber,
    });
    console.log(
      `📊 [STORED SIMULATION API] Fetching stored results for league ${leagueId}, week ${weekNumber}, matchup ${matchupIdNumber}`
    );

    // Use same Prisma pattern as working league-wide odds API
    console.log('⚡ [STORED SIMULATION API] Importing Prisma...');
    const { PrismaClient } = await import('@prisma/client');
    console.log('⚡ [STORED SIMULATION API] Creating Prisma client...');
    const prisma = new PrismaClient();
    console.log('✅ [STORED SIMULATION API] Prisma client created successfully');

    try {
      console.log('🔎 [STORED SIMULATION API] Querying database for stored simulation...');

      // First check if any simulations exist at all
      const totalSimulations = await prisma.matchupSimulation.count();
      console.log(`📊 [STORED SIMULATION API] Total simulations in DB: ${totalSimulations}`);

      // Then check for this specific one
      const storedSimulation = await prisma.matchupSimulation.findFirst({
        where: {
          leagueId: leagueId,
          week: weekNumber,
          matchupId: matchupIdNumber,
        },
        include: {
          playerSimulations: true,
        },
      });

      console.log(`🎯 [STORED SIMULATION API] Stored simulation found: ${!!storedSimulation}`);

      if (!storedSimulation) {
        console.warn(
          `❌ [STORED SIMULATION API] No stored simulation found for league ${leagueId}, week ${weekNumber}, matchup ${matchupIdNumber}`
        );
        console.warn(`❌ [STORED SIMULATION API] Returning 404 - simulation not found`);
        return NextResponse.json(
          {
            success: false,
            error: 'Simulation results not found. Please run batch simulations first.',
          },
          { status: 404 }
        );
      }

      console.log(
        `✅ [STORED SIMULATION API] Found stored simulation with ${storedSimulation.iterations} iterations`
      );
      console.log(
        `🎲 [STORED SIMULATION API] Player simulations: ${storedSimulation.playerSimulations?.length || 0}`
      );

      // Fetch team roster data for the frontend
      console.log(`🏈 [STORED SIMULATION API] Fetching team roster data...`);
      const matchupTeams = await prisma.matchup.findMany({
        where: {
          leagueId: leagueId,
          week: weekNumber,
          matchupId: matchupIdNumber,
        },
        include: {
          roster: {
            include: {
              owner: {
                select: {
                  id: true,
                  username: true,
                  displayName: true,
                  avatar: true,
                  metadata: true,
                },
              },
            },
          },
        },
      });

      console.log(`🏈 [STORED SIMULATION API] Found ${matchupTeams.length} teams for this matchup`);

      // Get player details for the teams
      const allPlayerIds = new Set<string>();
      matchupTeams.forEach(team => {
        (team.starters || []).forEach(playerId => {
          if (playerId) allPlayerIds.add(playerId);
        });
      });

      const players = await prisma.player.findMany({
        where: { id: { in: Array.from(allPlayerIds) } },
        select: { id: true, fullName: true, position: true, team: true },
      });
      const playersMap = new Map(players.map(p => [p.id, p]));

      // Build teams data for frontend
      const teamsData = matchupTeams.map(team => {
        const teamMetadata = team.roster.owner?.metadata as any;
        const teamName = teamMetadata?.teamName || team.roster.owner?.displayName || 'Unknown Team';

        const playersWithProjections = (team.starters || [])
          .map(playerId => {
            const player = playersMap.get(playerId);
            const playerSim = storedSimulation.playerSimulations.find(p => p.playerId === playerId);

            return {
              id: playerId,
              name: player?.fullName || 'Unknown Player',
              position: player?.position || 'UNKNOWN',
              projection: playerSim?.projection || 0,
            };
          })
          .filter(p => p.name !== 'Unknown Player');

        return {
          rosterId: team.rosterId,
          teamName: teamName,
          ownerName: team.roster.owner?.displayName || 'Unknown Owner',
          avatar: team.roster.owner?.avatar || undefined,
          players: playersWithProjections,
        };
      });

      console.log(`🏈 [STORED SIMULATION API] Built teams data for ${teamsData.length} teams`);

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
        medianMargin: Math.abs(storedSimulation.teamAMedian - storedSimulation.teamBMedian),
        impliedOdds: {
          spread: storedSimulation.impliedSpread,
          total: storedSimulation.totalLine,
          team1MoneyLine: storedSimulation.moneyLineA,
          team2MoneyLine: storedSimulation.moneyLineB,
          overPct: storedSimulation.overPct,
          underPct: storedSimulation.underPct,
        },
        teams: teamsData, // Include the team roster data
        // Metadata about the simulation
        iterations: storedSimulation.iterations,
        computeTimeMs: storedSimulation.computeTimeMs,
        generatedAt: storedSimulation.createdAt.toISOString(),
      };

      console.log(
        `📊 [STORED SIMULATION API] Returning stored simulation: Team A ${(storedSimulation.teamAWinPct * 100).toFixed(1)}% vs Team B ${(storedSimulation.teamBWinPct * 100).toFixed(1)}%`
      );
      console.log(
        `🎯 [STORED SIMULATION API] Success! Returning stored simulation data with source='stored'`
      );

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
      console.log('🔌 [STORED SIMULATION API] Disconnecting Prisma client...');
      await prisma.$disconnect();
      console.log('✅ [STORED SIMULATION API] Prisma client disconnected');
    }
  } catch (error) {
    console.error('❌ [STORED SIMULATION API] FATAL ERROR:', error);
    console.error('❌ [STORED SIMULATION API] Error type:', typeof error);
    console.error(
      '❌ [STORED SIMULATION API] Error name:',
      error instanceof Error ? error.name : 'unknown'
    );
    console.error(
      '❌ [STORED SIMULATION API] Error message:',
      error instanceof Error ? error.message : String(error)
    );
    if (error instanceof Error && error.stack) {
      console.error('❌ [STORED SIMULATION API] Error stack:', error.stack);
    }

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch stored simulation results',
        apiUsed: 'stored-simulation-api',
      },
      { status: 500 }
    );
  }
}
