import { NextRequest, NextResponse } from 'next/server';
import {
  type LineupPlayer,
  type MatchupSimulationResult,
  simulateMatchupProbabilityFromPlayers,
} from '@gauntlet/sim-engine';
import { simulationCache } from '@/lib/simulation-cache';
import { ScoringSettings, calculateLeagueProjections } from '@/lib/calculate-league-projections';

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
      console.warn('Failed to fetch projections:', response.status);
      return [];
    }

    const projections = await response.json();
    return projections;
  } catch (error) {
    console.warn('Error fetching projections:', error);
    return [];
  }
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
      `🎲 [SIMULATION API] Processing simulation for league ${leagueId}, week ${weekNumber}, matchup ${matchupIdNumber}`
    );

    // Check cache first
    const cachedResult = simulationCache.get(leagueId, weekNumber, matchupIdNumber);
    if (cachedResult) {
      console.log(`⚡ [SIMULATION API] Returning cached result`);
      return NextResponse.json({
        success: true,
        simulation: cachedResult,
        metadata: {
          leagueId,
          week: weekNumber,
          matchupId: matchupIdNumber,
          simulationCount: 10000,
          timestamp: new Date().toISOString(),
          engine: '@gauntlet/sim-engine',
          version: '0.1.0',
          cached: true,
        },
      });
    }

    // Import Prisma dynamically to avoid edge runtime issues
    const { PrismaClient } = await import('@prisma/client');
    const prisma = new PrismaClient();

    try {
      // Fetch matchup data
      const matchups = await prisma.matchup.findMany({
        where: {
          leagueId,
          week: weekNumber,
          matchupId: matchupIdNumber,
        },
        include: {
          roster: {
            include: {
              owner: true,
            },
          },
        },
      });

      if (matchups.length === 0) {
        return NextResponse.json({ error: 'Matchup not found' }, { status: 404 });
      }

      if (matchups.length !== 2) {
        return NextResponse.json(
          {
            error: `Expected 2 teams in matchup, found ${matchups.length}`,
          },
          { status: 400 }
        );
      }

      // Get league scoring settings
      const league = await prisma.league.findUnique({
        where: { id: leagueId },
        select: { scoringSettings: true },
      });

      if (!league) {
        return NextResponse.json({ error: 'League not found' }, { status: 404 });
      }

      // Fetch raw projections for the week
      const rawProjections = await fetchRawProjections('2025', weekNumber);

      // Calculate league-specific projections using scoring settings
      const scoringSettings = (league.scoringSettings as ScoringSettings) || {};
      const leagueProjections = calculateLeagueProjections(rawProjections, scoringSettings);

      console.log(
        `📊 [SIMULATION API] Calculated ${Object.keys(leagueProjections).length} league-specific projections`
      );

      // Helper function to get league-specific projection for a player
      const getPlayerProjection = (playerId: string): number => {
        return leagueProjections[playerId]?.points || 0;
      };

      // Helper functions for team data
      const getTeamName = (team: any) =>
        team.roster?.owner?.metadata?.team_name ||
        team.roster?.owner?.displayName ||
        team.roster?.owner?.username ||
        `Team ${team.rosterId}`;

      const getAvatarUrl = (team: any) => {
        const teamAvatar = team.roster?.owner?.metadata?.avatar;
        const userAvatar = team.roster?.owner?.avatar;
        const avatar = teamAvatar || userAvatar;
        if (!avatar) return undefined;
        if (avatar.startsWith('http')) return avatar;
        return `https://sleepercdn.com/avatars/${avatar}`;
      };

      // Get all unique player IDs to fetch player details
      const allPlayerIds = new Set<string>();
      matchups.forEach(matchup => {
        [...(matchup.starters || []), ...(matchup.players || [])].forEach(playerId => {
          if (playerId) allPlayerIds.add(playerId);
        });
      });

      // Fetch player details
      const players = await prisma.player.findMany({
        where: { id: { in: Array.from(allPlayerIds) } },
        select: { id: true, fullName: true, position: true, team: true },
      });
      const playersMap = new Map(players.map(p => [p.id, p]));

      // Transform matchups into simulation teams using the existing sim-engine format
      const simulationTeams: LineupPlayer[][] = matchups.map(team => {
        // Convert starter IDs to LineupPlayer objects for sim-engine
        return (team.starters || []).map(playerId => {
          const player = playersMap.get(playerId);
          const projectedPoints = getPlayerProjection(playerId);

          return {
            id: playerId,
            name: player?.fullName || 'Unknown Player',
            position: player?.position || 'UNKNOWN',
            projection: projectedPoints,
          };
        });
      });

      console.log(
        `🎲 [SIMULATION API] Running simulation for ${getTeamName(matchups[0])} vs ${getTeamName(matchups[1])}`
      );

      // Run Monte Carlo simulation using existing sim-engine
      const simulationResult: MatchupSimulationResult = await simulateMatchupProbabilityFromPlayers(
        simulationTeams[0],
        simulationTeams[1],
        10000, // 10k iterations as specified in V2 requirements
        0 // No game progress for pre-game simulations
      );

      console.log(
        `✅ [SIMULATION API] Simulation complete. Win probabilities: ${(simulationResult.team1WinPct * 100).toFixed(1)}% vs ${(simulationResult.team2WinPct * 100).toFixed(1)}%`
      );

      // Transform the result to include team metadata
      const enrichedResult = {
        ...simulationResult,
        teams: [
          {
            rosterId: matchups[0].rosterId,
            teamName: getTeamName(matchups[0]),
            ownerName:
              matchups[0].roster.owner?.displayName ||
              matchups[0].roster.owner?.username ||
              'Unknown',
            avatar: getAvatarUrl(matchups[0]),
            players: simulationTeams[0],
          },
          {
            rosterId: matchups[1].rosterId,
            teamName: getTeamName(matchups[1]),
            ownerName:
              matchups[1].roster.owner?.displayName ||
              matchups[1].roster.owner?.username ||
              'Unknown',
            avatar: getAvatarUrl(matchups[1]),
            players: simulationTeams[1],
          },
        ],
      };

      // Cache the result
      simulationCache.set(leagueId, weekNumber, matchupIdNumber, enrichedResult);

      return NextResponse.json({
        success: true,
        simulation: enrichedResult,
        metadata: {
          leagueId,
          week: weekNumber,
          matchupId: matchupIdNumber,
          simulationCount: 10000,
          timestamp: new Date().toISOString(),
          engine: '@gauntlet/sim-engine',
          version: '0.1.0',
        },
      });
    } finally {
      await prisma.$disconnect();
    }
  } catch (error) {
    console.error('❌ [SIMULATION API] Error:', error);
    return NextResponse.json({ error: 'Failed to run simulation' }, { status: 500 });
  }
}
