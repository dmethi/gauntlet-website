import { NextRequest, NextResponse } from 'next/server';
import { simulateMatchupProbabilityFromPlayers } from '@gauntlet/sim-engine';
import { calculateLeagueProjections, ScoringSettings } from '@/lib/calculate-league-projections';

// Fetch raw projections from Sleeper
async function fetchRawProjections(season: string, week: number): Promise<any[]> {
  try {
    const response = await fetch(
      `https://api.sleeper.com/projections/nfl/${season}/${week}?season_type=regular&position[]=QB&position[]=RB&position[]=WR&position[]=TE&position[]=K&position[]=DEF&order_by=pts_half_ppr`,
      {
        headers: {
          'User-Agent': 'Gauntlet-Website/1.0.0',
        },
        cache: 'no-store',
      }
    );

    if (!response.ok) {
      console.warn(`🔥 [SIMULATION FALLBACK] Failed to fetch projections: ${response.status}`);
      return [];
    }

    const projections = await response.json();
    console.log(
      `📊 [SIMULATION FALLBACK] Fetched raw projections for ${projections.length} players`
    );
    return projections;
  } catch (error) {
    console.error('❌ [SIMULATION FALLBACK] Error fetching projections:', error);
    return [];
  }
}

// Generate simulation data from projections when no stored simulation exists
async function generateProjectionBasedSimulation(
  prisma: any,
  leagueId: string,
  week: number,
  matchupId: number
) {
  console.log(
    `🧮 [SIMULATION FALLBACK] Generating projection-based simulation for matchup ${matchupId}`
  );

  // Get matchup teams and league info
  const [matchupTeams, league] = await Promise.all([
    prisma.matchup.findMany({
      where: { leagueId, week, matchupId },
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
      orderBy: { rosterId: 'asc' },
    }),
    prisma.league.findUnique({
      where: { id: leagueId },
      select: { season: true, scoringSettings: true },
    }),
  ]);

  if (!matchupTeams || matchupTeams.length !== 2 || !league) {
    console.error(`❌ [SIMULATION FALLBACK] Invalid matchup data or league not found`);
    return null;
  }

  // Fetch projections
  const rawProjections = await fetchRawProjections(league.season || '2025', week);
  if (rawProjections.length === 0) {
    console.warn(`⚠️ [SIMULATION FALLBACK] No projections available for simulation`);
    return null;
  }

  // Calculate league-specific projections
  const scoringSettings = (league.scoringSettings as ScoringSettings) || {};
  const leagueProjections = calculateLeagueProjections(rawProjections, scoringSettings);

  // Get player details
  const allPlayerIds = new Set<string>();
  matchupTeams.forEach((team: any) => {
    [...(team.starters || []), ...(team.players || [])].forEach((playerId: string) => {
      if (playerId) allPlayerIds.add(playerId);
    });
  });

  const players = await prisma.player.findMany({
    where: { id: { in: Array.from(allPlayerIds) } },
    select: { id: true, fullName: true, position: true, team: true },
  });
  const playersMap = new Map(players.map((p: any) => [p.id, p]));

  // Build team lineups with projections
  const [teamA, teamB] = matchupTeams;
  const team1Players = (teamA.starters || []).map((playerId: string) => {
    const player = playersMap.get(playerId) as any;
    const projection = leagueProjections[playerId]?.points || 0;
    return {
      id: playerId,
      name: player?.fullName || 'Unknown Player',
      position: player?.position || 'UNKNOWN',
      projection,
    };
  });

  const team2Players = (teamB.starters || []).map((playerId: string) => {
    const player = playersMap.get(playerId) as any;
    const projection = leagueProjections[playerId]?.points || 0;
    return {
      id: playerId,
      name: player?.fullName || 'Unknown Player',
      position: player?.position || 'UNKNOWN',
      projection,
    };
  });

  // Run simulation
  console.log(
    `🎲 [SIMULATION FALLBACK] Running simulation with ${team1Players.length} vs ${team2Players.length} players`
  );
  const simResult = await simulateMatchupProbabilityFromPlayers(
    team1Players,
    team2Players,
    5000,
    0
  );

  // Build team roster data for frontend
  const getTeamName = (team: any) =>
    team.roster?.owner?.metadata?.team_name ||
    team.roster?.owner?.displayName ||
    team.roster?.owner?.username ||
    `Team ${team.rosterId}`;

  const getOwnerName = (team: any) =>
    team.roster?.owner?.displayName || team.roster?.owner?.username || 'Unknown Owner';

  const teamsData = [
    {
      rosterId: teamA.rosterId,
      teamName: getTeamName(teamA),
      ownerName: getOwnerName(teamA),
      avatar: teamA.roster?.owner?.avatar,
      players: team1Players,
    },
    {
      rosterId: teamB.rosterId,
      teamName: getTeamName(teamB),
      ownerName: getOwnerName(teamB),
      avatar: teamB.roster?.owner?.avatar,
      players: team2Players,
    },
  ];

  // Calculate implied odds (simple approximation)
  const team1WinPct = simResult.team1WinPct;
  const team2WinPct = simResult.team2WinPct;
  const spread = simResult.team1Scores.mean - simResult.team2Scores.mean;
  const total = simResult.team1Scores.mean + simResult.team2Scores.mean;

  const team1MoneyLine =
    team1WinPct >= 0.5
      ? Math.round(-(team1WinPct / (1 - team1WinPct)) * 100)
      : Math.round(((1 - team1WinPct) / team1WinPct) * 100);

  const team2MoneyLine =
    team2WinPct >= 0.5
      ? Math.round(-(team2WinPct / (1 - team2WinPct)) * 100)
      : Math.round(((1 - team2WinPct) / team2WinPct) * 100);

  const simulation = {
    team1Scores: {
      mean: simResult.team1Scores.mean,
      p10: simResult.team1Scores.p10,
      median: simResult.team1Scores.median, // Sim-engine returns median, not p50
      p90: simResult.team1Scores.p90,
      stdDev: (simResult.team1Scores.p90 - simResult.team1Scores.p10) / 2.56, // Rough approximation
    },
    team2Scores: {
      mean: simResult.team2Scores.mean,
      p10: simResult.team2Scores.p10,
      median: simResult.team2Scores.median, // Sim-engine returns median, not p50
      p90: simResult.team2Scores.p90,
      stdDev: (simResult.team2Scores.p90 - simResult.team2Scores.p10) / 2.56,
    },
    team1WinPct,
    team2WinPct,
    medianMargin: Math.abs(simResult.team1Scores.median - simResult.team2Scores.median),
    impliedOdds: {
      spread: Math.round(spread * 10) / 10,
      total: Math.round(total * 10) / 10,
      team1MoneyLine,
      team2MoneyLine,
      overPct: 0.5, // Default
      underPct: 0.5, // Default
    },
    teams: teamsData,
    iterations: 5000,
    computeTimeMs: 0,
    generatedAt: new Date().toISOString(),
  };

  const playersDistributions = [...team1Players, ...team2Players].map((player: any) => ({
    playerId: player.id,
    playerName: player.name,
    position: player.position,
    mean: player.projection,
    p10: Math.max(0, player.projection * 0.7),
    median: player.projection,
    p90: player.projection * 1.3,
    stdDev: player.projection * 0.15,
    projection: player.projection,
    dataSource: 'projection-fallback',
  }));

  return {
    simulation,
    playersDistributions,
  };
}

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
        orderBy: { createdAt: 'desc' },
        include: {
          playerSimulations: true,
        },
      });

      console.log(`🎯 [STORED SIMULATION API] Stored simulation found: ${!!storedSimulation}`);

      if (!storedSimulation) {
        console.warn(
          `⚠️ [STORED SIMULATION API] No stored simulation found for league ${leagueId}, week ${weekNumber}, matchup ${matchupIdNumber}`
        );
        console.log(`🧮 [STORED SIMULATION API] Attempting projection-based fallback...`);

        // Fallback: Generate simulation from current projections
        try {
          const fallbackResult = await generateProjectionBasedSimulation(
            prisma,
            leagueId,
            weekNumber,
            matchupIdNumber
          );

          if (fallbackResult) {
            console.log(
              `✅ [STORED SIMULATION API] Successfully generated projection-based simulation`
            );
            return NextResponse.json({
              success: true,
              simulation: fallbackResult.simulation,
              source: 'projection-fallback',
              playersDistributions: fallbackResult.playersDistributions || [],
            });
          }
        } catch (fallbackError) {
          console.error(`❌ [STORED SIMULATION API] Projection fallback failed:`, fallbackError);
        }

        console.warn(
          `❌ [STORED SIMULATION API] Both stored and projection fallback failed - returning 404`
        );
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
      const playersMap = new Map(players.map((p: any) => [p.id, p]));

      // Build teams data for frontend
      const teamsData = matchupTeams.map((team: any) => {
        const teamMetadata = team.roster.owner?.metadata as any;
        const teamName = teamMetadata?.teamName || team.roster.owner?.displayName || 'Unknown Team';

        const playersWithProjections = (team.starters || [])
          .map((playerId: string) => {
            const player = playersMap.get(playerId) as any;
            const playerSim = storedSimulation.playerSimulations.find(
              (p: any) => p.playerId === playerId
            );

            return {
              id: playerId,
              name: player?.fullName || 'Unknown Player',
              position: player?.position || 'UNKNOWN',
              projection: playerSim?.projection || 0,
            };
          })
          .filter((p: any) => p.name !== 'Unknown Player');

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
        playersDistributions: storedSimulation.playerSimulations.map((player: any) => ({
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
