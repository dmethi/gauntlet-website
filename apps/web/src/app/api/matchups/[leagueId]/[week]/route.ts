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
    // FIXED: Use correct Sleeper projections endpoint
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
      console.warn(`🔥 [PROJECTIONS] Failed to fetch projections: ${response.status}`);
      return [];
    }

    const projections = await response.json();
    console.log(`📊 [PROJECTIONS] Fetched raw projections for ${projections.length} players`);

    return projections;
  } catch (error) {
    console.error('❌ [PROJECTIONS] Error fetching projections:', error);
    return [];
  }
}

export async function GET(
  request: Request,
  { params }: { params: { leagueId: string; week: string } }
) {
  const { leagueId, week } = params;
  const { searchParams } = new URL(request.url);
  const debug = searchParams.has('debug');

  console.log('🔍 [MATCHUPS API] Request params:', { leagueId, week, debug });

  try {
    const weekNumber = parseInt(week);
    if (!leagueId || Number.isNaN(weekNumber)) {
      console.log('❌ [MATCHUPS API] Invalid parameters:', { leagueId, week, weekNumber });
      return NextResponse.json({ error: 'Invalid leagueId or week parameter' }, { status: 400 });
    }

    const prisma = await getPrisma();

    // First, let's check what leagues exist in the database
    const allLeagues = await prisma.league.findMany({
      select: { id: true, name: true },
    });
    console.log('🏆 [MATCHUPS API] Available leagues:', allLeagues);

    // Check if this specific league exists and fetch scoring settings
    const targetLeague = await prisma.league.findUnique({
      where: { id: leagueId },
      select: { id: true, name: true, totalRosters: true, scoringSettings: true },
    });
    console.log('🎯 [MATCHUPS API] Target league:', targetLeague);

    if (!targetLeague) {
      console.log('❌ [MATCHUPS API] League not found:', leagueId);
      return NextResponse.json({ error: 'League not found' }, { status: 404 });
    }

    // Check what weeks have data
    const availableWeeks = await prisma.matchup.findMany({
      where: { leagueId },
      select: { week: true },
      distinct: ['week'],
      orderBy: { week: 'asc' },
    });
    console.log(
      '📅 [MATCHUPS API] Available weeks for league:',
      availableWeeks.map(w => w.week)
    );

    const matchups = await prisma.matchup.findMany({
      where: { leagueId, week: weekNumber },
      include: {
        roster: {
          include: {
            owner: {
              select: { id: true, username: true, displayName: true, avatar: true, metadata: true },
            },
          },
        },
      },
      orderBy: [{ matchupId: 'asc' }, { rosterId: 'asc' }],
    });

    console.log('⚔️ [MATCHUPS API] Raw matchups found:', matchups.length);
    console.log(
      '📊 [MATCHUPS API] Sample matchup:',
      matchups[0]
        ? {
            id: matchups[0].id,
            rosterId: matchups[0].rosterId,
            matchupId: matchups[0].matchupId,
            points: matchups[0].points,
            owner: matchups[0].roster.owner?.displayName || 'No owner',
          }
        : 'None found'
    );

    const summaries = await prisma.matchupSummary.findMany({
      where: { leagueId, week: weekNumber },
    });

    console.log('📋 [MATCHUPS API] Summaries found:', summaries.length);

    // Fetch raw projections for the week
    const rawProjections = await fetchRawProjections('2025', weekNumber);

    // Calculate league-specific projections using scoring settings
    const scoringSettings = (targetLeague.scoringSettings as ScoringSettings) || {};
    const leagueProjections = calculateLeagueProjections(rawProjections, scoringSettings);

    console.log(
      `📊 [MATCHUPS API] Calculated ${Object.keys(leagueProjections).length} league-specific projections`
    );

    // Helper function to get league-specific projection for a player
    const getPlayerProjection = (playerId: string): number => {
      return leagueProjections[playerId]?.points || 0;
    };

    // Get all unique player IDs from matchups to calculate projections
    const allPlayerIds = new Set<string>();
    matchups.forEach(matchup => {
      [...(matchup.starters || []), ...(matchup.players || [])].forEach(playerId => {
        if (playerId) allPlayerIds.add(playerId);
      });
    });
    console.log(`🎯 [MATCHUPS API] Found ${allPlayerIds.size} unique players across all matchups`);

    const grouped = matchups.reduce(
      (acc: Record<number, typeof matchups>, m) => {
        if (!m.matchupId) return acc;
        if (!acc[m.matchupId]) acc[m.matchupId] = [] as unknown as typeof matchups;
        acc[m.matchupId]!.push(m);
        return acc;
      },
      {} as Record<number, typeof matchups>
    );

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

    const formatted = Object.entries(grouped).map(([mid, teams]) => {
      const matchupId = Number(mid);
      const summary = summaries.find(s => s.matchupId === matchupId) || null;
      return {
        matchupId,
        teams: teams.map(team => {
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
            starters: team.starters,
            startersPoints: team.startersPoints,
            starterProjections: starterProjections,
            players: team.players,
            playersPoints: team.playersPoints,
            playerProjections: playerProjections,
            rosterSettings: team.roster.settings,
            rosterMetadata: team.roster.metadata,
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
    });

    console.log('🎯 [MATCHUPS API] Final formatted result:', {
      totalMatchups: formatted.length,
      sampleMatchup: formatted[0]
        ? {
            matchupId: formatted[0].matchupId,
            teamsCount: formatted[0].teams.length,
            sampleTeam: formatted[0].teams[0]
              ? {
                  rosterId: formatted[0].teams[0].rosterId,
                  ownerName: formatted[0].teams[0].owner?.displayName || 'No name',
                  points: formatted[0].teams[0].points,
                  projectedPoints: formatted[0].teams[0].projectedPoints,
                  startersCount: formatted[0].teams[0].starters?.length || 0,
                  playersWithProjections: Object.keys(formatted[0].teams[0].playerProjections || {})
                    .length,
                }
              : 'No teams',
          }
        : 'No matchups',
    });

    return NextResponse.json({
      matchups: formatted,
      week: weekNumber,
      leagueId,
      totalMatchups: formatted.length,
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('matchups:[leagueId]/[week] error', {
      leagueId,
      week,
      hasDbUrl: Boolean(process.env.DATABASE_URL),
      message: (error as Error).message,
      stack: (error as Error).stack,
    });
    const body = debug
      ? {
          error: 'Failed to fetch matchups',
          detail: (error as Error).message,
          leagueId,
          week,
          hasDbUrl: Boolean(process.env.DATABASE_URL),
        }
      : { error: 'Failed to fetch matchups' };
    return NextResponse.json(body, { status: 500 });
  }
}
