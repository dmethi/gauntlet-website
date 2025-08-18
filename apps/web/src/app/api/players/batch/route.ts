import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

async function getPrisma() {
  const { prisma } = await import('@/lib/prisma');
  return prisma;
}

export async function POST(request: Request) {
  try {
    const { playerIds } = (await request.json()) as { playerIds: string[] };
    const ids = Array.isArray(playerIds) ? playerIds.filter(Boolean) : [];
    if (ids.length === 0) {
      return NextResponse.json({ players: {}, found: 0, requested: 0 });
    }
    const prisma = await getPrisma();
    const players = await prisma.player.findMany({ where: { id: { in: ids } } });
    const map = Object.fromEntries(
      players.map(p => [
        p.id,
        {
          id: p.id,
          firstName: p.firstName,
          lastName: p.lastName,
          fullName: p.fullName,
          team: p.team,
          position: p.position,
        },
      ])
    );
    return NextResponse.json({ players: map, found: players.length, requested: ids.length });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('players:batch error', { message: (error as Error).message });
    return NextResponse.json({ error: 'Failed to fetch players' }, { status: 500 });
  }
}
