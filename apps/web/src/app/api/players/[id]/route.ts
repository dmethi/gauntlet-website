import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

async function getPrisma() {
  const { prisma } = await import('@/lib/prisma');
  return prisma;
}

export async function GET(_request: Request, { params }: { params: { id: string } }) {
  try {
    const prisma = await getPrisma();
    const player = await prisma.player.findUnique({ where: { id: params.id } });
    if (!player) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json({
      player: {
        id: player.id,
        firstName: player.firstName,
        lastName: player.lastName,
        fullName: player.fullName,
        team: player.team,
        position: player.position,
      },
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('players:[id] error', { id: params.id, message: (error as Error).message });
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
