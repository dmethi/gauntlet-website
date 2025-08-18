import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

async function getPrisma() {
  const { prisma } = await import('@/lib/prisma');
  return prisma;
}

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const teamId = Number(params.id);

  const { searchParams } = new URL(request.url);
  const debugFlag = searchParams.has('debug');

  try {
    const prisma = await getPrisma();

    const roster = await prisma.roster.findUnique({
      where: { id: teamId },
      include: {
        owner: true,
        weeklyMetrics: true,
        matchups: {
          select: {
            week: true,
            points: true,
            matchupId: true,
          },
          orderBy: { week: 'asc' },
        },
        league: {
          include: {
            rosters: {
              include: { owner: true },
            },
          },
        },
      },
    });

    if (!roster) {
      return NextResponse.json({ error: 'Team not found' }, { status: 404 });
    }

    return NextResponse.json(roster);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('team:[id] error', {
      teamId,
      hasDbUrl: Boolean(process.env.DATABASE_URL),
      message: (error as Error).message,
      stack: (error as Error).stack,
    });
    const body = debugFlag
      ? {
          error: 'Internal Server Error',
          detail: (error as Error).message,
          teamId,
          hasDbUrl: Boolean(process.env.DATABASE_URL),
        }
      : { error: 'Internal Server Error' };
    return NextResponse.json(body, { status: 500 });
  }
}
