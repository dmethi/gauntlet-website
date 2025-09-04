import { NextResponse } from 'next/server';
import { calculateLeagueProjections, ScoringSettings } from '@/lib/calculate-league-projections';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

async function getPrisma() {
  const { prisma } = await import('@/lib/prisma');
  return prisma;
}

// Fetch projections from Sleeper undocumented API
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
      console.warn(`🔥 [INDIVIDUAL PROJECTIONS] Failed to fetch projections: ${response.status}`);
      return [];
    }

    const projections = await response.json();
    console.log(
      `📊 [INDIVIDUAL PROJECTIONS] Fetched raw projections for ${projections.length} players`
    );

    return projections;
  } catch (error) {
    console.error('❌ [INDIVIDUAL PROJECTIONS] Error fetching projections:', error);
    return [];
  }
}

export async function GET(
  request: Request,
  { params }: { params: { leagueId: string; week: string; matchupId: string } }
) {
  console.log('🔍 [INDIVIDUAL MATCHUP API] Route handler called!');
  console.log('🔍 [INDIVIDUAL MATCHUP API] Params:', params);

  const { leagueId, week, matchupId } = params;
  const { searchParams } = new URL(request.url);
  const debug = searchParams.has('debug');

  try {
    const weekNumber = parseInt(week);
    const matchupIdNumber = parseInt(matchupId);

    if (!leagueId || Number.isNaN(weekNumber) || Number.isNaN(matchupIdNumber)) {
      return NextResponse.json({ error: 'Invalid parameters' }, { status: 400 });
    }

    const prisma = await getPrisma();

    // Get league scoring settings
    const league = await prisma.league.findUnique({
      where: { id: leagueId },
      select: { scoringSettings: true },
    });

    if (!league) {
      return NextResponse.json({ error: 'League not found' }, { status: 404 });
    }

    const matchups = await prisma.matchup.findMany({
      where: { leagueId, week: weekNumber, matchupId: matchupIdNumber },
      include: {
        roster: {
          include: {
            owner: {
              select: { id: true, username: true, displayName: true, avatar: true, metadata: true },
            },
          },
        },
      },
      orderBy: { rosterId: 'asc' },
    });

    if (matchups.length === 0) {
      return NextResponse.json({ error: 'Matchup not found' }, { status: 404 });
    }

    const summary = await prisma.matchupSummary.findUnique({
      where: {
        leagueId_week_matchupId: { leagueId, week: weekNumber, matchupId: matchupIdNumber },
      },
    });

    // Fetch raw projections for the week
    const rawProjections = await fetchRawProjections('2025', weekNumber);

    // Calculate league-specific projections using scoring settings
    const scoringSettings = (league.scoringSettings as ScoringSettings) || {};
    const leagueProjections = calculateLeagueProjections(rawProjections, scoringSettings);

    console.log(
      `🎯 [INDIVIDUAL MATCHUP] Processing ${matchups.length} teams with ${Object.keys(leagueProjections).length} league-specific projections`
    );

    // Helper function to get league-specific projection for a player
    const getPlayerProjection = (playerId: string): number => {
      return leagueProjections[playerId]?.points || 0;
    };

    // Helper functions for team data (same as teams page and client)
    const getTeamName = (team: any) =>
      team.roster?.owner?.metadata?.team_name ||
      team.roster?.owner?.displayName ||
      team.roster?.owner?.username ||
      `Team ${team.rosterId}`;

    const getAvatarUrl = (owner: any) => {
      // Prioritize team avatar from metadata over user avatar
      const teamAvatar = owner?.metadata?.avatar;
      const userAvatar = owner?.avatar;
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

    const formattedMatchup = {
      matchupId: matchupIdNumber,
      teams: matchups.map(team => {
        // Calculate projected points for starters
        let projectedPoints = 0;
        const starterProjections: Record<string, number> = {};

        if (team.starters && team.starters.length > 0) {
          team.starters.forEach(playerId => {
            const playerProjection = getPlayerProjection(playerId);
            projectedPoints += playerProjection;
            starterProjections[playerId] = playerProjection;
          });
        }

        // Calculate projected points for all players
        const playerProjections: Record<string, number> = {};
        if (team.players && team.players.length > 0) {
          team.players.forEach(playerId => {
            playerProjections[playerId] = getPlayerProjection(playerId);
          });
        }

        // Convert starter IDs to player objects
        const startersWithDetails = (team.starters || []).map(playerId => {
          const player = playersMap.get(playerId);
          const points = team.playersPoints?.[playerId] || 0;
          const projectedPoints = getPlayerProjection(playerId);

          return {
            id: playerId,
            name: player?.fullName || 'Unknown Player',
            position: player?.position || 'UNKNOWN',
            team: player?.team || '',
            points: points,
            projectedPoints: projectedPoints,
            isStarter: true,
            status: 'active' as const,
          };
        });

        // Convert bench player IDs to player objects (players not in starters)
        const benchPlayerIds = (team.players || []).filter(
          playerId => !(team.starters || []).includes(playerId)
        );
        const benchWithDetails = benchPlayerIds.map(playerId => {
          const player = playersMap.get(playerId);
          const points = team.playersPoints?.[playerId] || 0;
          const projectedPoints = getPlayerProjection(playerId);

          return {
            id: playerId,
            name: player?.fullName || 'Unknown Player',
            position: player?.position || 'UNKNOWN',
            team: player?.team || '',
            points: points,
            projectedPoints: projectedPoints,
            isStarter: false,
            status: 'active' as const,
          };
        });

        return {
          rosterId: team.rosterId,
          teamName: getTeamName(team),
          ownerName: team.roster.owner?.displayName || team.roster.owner?.username || 'Unknown',
          owner: team.roster.owner
            ? {
                ...team.roster.owner,
                avatar: getAvatarUrl(team.roster.owner),
              }
            : null,
          points: team.points,
          projectedPoints: projectedPoints,
          customPoints: team.customPoints,
          starters: startersWithDetails,
          bench: benchWithDetails,
          // Legacy fields for backwards compatibility
          startersPoints: team.startersPoints,
          starterProjections: starterProjections,
          players: team.players,
          playersPoints: team.playersPoints,
          playerProjections: playerProjections,
          rosterSettings: team.roster.settings,
          rosterMetadata: team.roster.metadata,
          // Additional fields for frontend
          remainingPlayers: benchWithDetails.length,
          playersActive: startersWithDetails.length,
        };
      }),
      summary: summary
        ? {
            pointsA: summary.pointsA,
            pointsB: summary.pointsB,
            winnerRosterId: summary.winnerRosterId,
            margin: summary.margin,
          }
        : null,
    };

    return NextResponse.json({ matchup: formattedMatchup, week: weekNumber, leagueId });
  } catch (error) {
    console.error('matchups:[leagueId]/[week]/[matchupId] error', {
      leagueId,
      week,
      matchupId,
      hasDbUrl: Boolean(process.env.DATABASE_URL),
      message: (error as Error).message,
      stack: (error as Error).stack,
    });
    const body = debug
      ? {
          error: 'Failed to fetch matchup',
          detail: (error as Error).message,
          leagueId,
          week,
          matchupId,
          hasDbUrl: Boolean(process.env.DATABASE_URL),
        }
      : { error: 'Failed to fetch matchup' };
    return NextResponse.json(body, { status: 500 });
  }
}
