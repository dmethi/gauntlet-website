import { NextRequest, NextResponse } from 'next/server';
import { simulateMatchupProbabilityFromPlayers } from '@gauntlet/sim-engine/models';

export async function GET(
  request: NextRequest,
  { params }: { params: { leagueId: string; week: string; matchupId: string } },
) {
  try {
    const { leagueId, week, matchupId } = params;
    const weekNumber = parseInt(week);
    const matchupIdNumber = parseInt(matchupId);

    // Fetch matchup data (reuse logic from existing simulate endpoint)
    const matchupResponse = await fetch(
      `${request.nextUrl.origin}/api/matchups/${leagueId}/${weekNumber}/${matchupIdNumber}`,
      {
        headers: { 'User-Agent': 'Gauntlet-Website/1.0.0' },
      },
    );

    if (!matchupResponse.ok) {
      throw new Error(`Failed to fetch matchup data: ${matchupResponse.status}`);
    }

    const matchupData = await matchupResponse.json();

    if (!matchupData.matchup) {
      throw new Error('Invalid matchup data structure');
    }

    const { teams } = matchupData.matchup;
    const [teamA, teamB] = teams;

    // Extract player projections for simulation (convert to LineupPlayer format)
    const team1Players = teamA.starters.map((player: any) => ({
      id: player.id,
      name: player.name || 'Unknown Player',
      position: player.position,
      projection: player.projectedPoints || 0,
    }));

    const team2Players = teamB.starters.map((player: any) => ({
      id: player.id,
      name: player.name || 'Unknown Player',
      position: player.position,
      projection: player.projectedPoints || 0,
    }));

    // Run simulation to get team distributions
    const simulation = await simulateMatchupProbabilityFromPlayers(
      team1Players,
      team2Players,
      10000,
      0,
    );

    if (!simulation.team1Scores || !simulation.team2Scores) {
      throw new Error('Simulation returned invalid score distributions');
    }

    // Calculate standard deviation from P10-P90 range
    const team1StdDev = (simulation.team1Scores.p90 - simulation.team1Scores.p10) / 2.56;
    const team2StdDev = (simulation.team2Scores.p90 - simulation.team2Scores.p10) / 2.56;

    const distributionData = {
      team1: {
        name: teamA.teamName || teamA.ownerName,
        mean: simulation.team1Scores.mean,
        p10: simulation.team1Scores.p10,
        median: simulation.team1Scores.median,
        p90: simulation.team1Scores.p90,
        stdDev: team1StdDev,
      },
      team2: {
        name: teamB.teamName || teamB.ownerName,
        mean: simulation.team2Scores.mean,
        p10: simulation.team2Scores.p10,
        median: simulation.team2Scores.median,
        p90: simulation.team2Scores.p90,
        stdDev: team2StdDev,
      },
      winProbabilities: {
        team1: simulation.team1WinPct,
        team2: simulation.team2WinPct,
      },
    };

    return NextResponse.json(distributionData);
  } catch (error) {
    console.error('❌ [DISTRIBUTIONS API] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to generate distribution data',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}
