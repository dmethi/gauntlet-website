import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

async function getPrisma() {
  const { prisma } = await import('@/lib/prisma');
  return prisma;
}

export async function GET(
  request: Request,
  { params }: { params: { leagueId: string; week: string } }
) {
  const { leagueId, week } = params;
  const { searchParams } = new URL(request.url);
  const debug = searchParams.has('debug');
  try {
    const weekNumber = parseInt(week);
    if (!leagueId || Number.isNaN(weekNumber)) {
      return NextResponse.json({ error: 'Invalid leagueId or week parameter' }, { status: 400 });
    }

    const prisma = await getPrisma();
    const matchups = await prisma.matchup.findMany({
      where: { leagueId, week: weekNumber },
      include: {
        roster: {
          include: {
            owner: {
              select: { id: true, username: true, displayName: true, avatar: true },
            },
          },
        },
      },
      orderBy: [{ matchupId: 'asc' }, { rosterId: 'asc' }],
    });

    const summaries = await prisma.matchupSummary.findMany({
      where: { leagueId, week: weekNumber },
    });

    const grouped = matchups.reduce(
      (acc: Record<number, typeof matchups>, m) => {
        if (!m.matchupId) return acc;
        if (!acc[m.matchupId]) acc[m.matchupId] = [] as unknown as typeof matchups;
        acc[m.matchupId]!.push(m);
        return acc;
      },
      {} as Record<number, typeof matchups>
    );

    const formatted = Object.entries(grouped).map(([mid, teams]) => {
      const matchupId = Number(mid);
      const summary = summaries.find(s => s.matchupId === matchupId) || null;
      return {
        matchupId,
        teams: teams.map(team => ({
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
