import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

async function getPrisma() {
  const { prisma } = await import('@/lib/prisma');
  return prisma;
}

export async function GET(
  request: Request,
  { params }: { params: { leagueId: string; rosterId: string } }
) {
  const { leagueId, rosterId } = params;
  const { searchParams } = new URL(request.url);
  const debug = searchParams.has('debug');
  try {
    const prisma = await getPrisma();
    const rid = Number(rosterId);
    const roster = await prisma.roster.findUnique({ where: { id: rid } });
    if (!roster || roster.leagueId !== leagueId) {
      return NextResponse.json({ error: 'Roster not found' }, { status: 404 });
    }
    const playerIds = Array.from(new Set([...(roster.players || []), ...(roster.starters || [])]));
    const players = playerIds.length
      ? await prisma.player.findMany({ where: { id: { in: playerIds } } })
      : [];
    const mapped = players.map(p => ({ id: p.id, fullName: p.fullName, position: p.position, team: p.team }));
    return NextResponse.json({ rosterId: roster.id, starters: roster.starters || [], players: mapped });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('league:[leagueId]/rosters:[rosterId] error', {
      leagueId,
      rosterId,
      hasDbUrl: Boolean(process.env.DATABASE_URL),
      message: (error as Error).message,
    });
    const body = debug
      ? {
          error: 'Internal Server Error',
          detail: (error as Error).message,
          leagueId,
          rosterId,
          hasDbUrl: Boolean(process.env.DATABASE_URL),
        }
      : { error: 'Internal Server Error' };
    return NextResponse.json(body, { status: 500 });
  }
}
