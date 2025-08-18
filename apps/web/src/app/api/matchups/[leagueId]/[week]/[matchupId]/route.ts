import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

async function getPrisma() {
  const { prisma } = await import('@/lib/prisma');
  return prisma;
}

export async function GET(
  request: Request,
  { params }: { params: { leagueId: string; week: string; matchupId: string } }
) {
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
    const matchups = await prisma.matchup.findMany({
      where: { leagueId, week: weekNumber, matchupId: matchupIdNumber },
      include: {
        roster: {
          include: {
            owner: {
              select: { id: true, username: true, displayName: true, avatar: true },
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

    const formattedMatchup = {
      matchupId: matchupIdNumber,
      teams: matchups.map(team => ({
        rosterId: team.rosterId,
        owner: team.roster.owner,
        points: team.points,
        customPoints: team.customPoints,
        starters: team.starters,
        startersPoints: team.startersPoints,
        players: team.players,
        playersPoints: team.playersPoints,
        rosterSettings: team.roster.settings,
        rosterMetadata: team.roster.metadata,
      })),
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
    // eslint-disable-next-line no-console
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
