import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

async function getPrisma() {
  const { prisma } = await import('@/lib/prisma');
  return prisma;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const debug = searchParams.has('debug');
  try {
    const prisma = await getPrisma();
    // Fetch league data directly from database
    // You'll need to adjust this query based on your actual schema
    const leagues = await prisma.league.findMany({
      include: {
        rosters: {
          include: {
            owner: true,
            // Provide matchups used by UI (week + points at minimum)
            matchups: {
              select: {
                week: true,
                points: true,
                matchupId: true,
              },
            },
            // Optional metrics if available
            weeklyMetrics: true,
          },
        },
      },
    });

    // For now, return the first league (adjust as needed)
    const league = leagues[0];

    if (!league) {
      return NextResponse.json({ error: 'No league found' }, { status: 404 });
    }

    return NextResponse.json(league);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('league:overview error', {
      hasDbUrl: Boolean(process.env.DATABASE_URL),
      message: (error as Error).message,
      stack: (error as Error).stack,
    });
    const body = debug
      ? {
          ok: false,
          error: {
            code: 'INTERNAL',
            message: 'Failed to fetch league overview',
            hasDbUrl: Boolean(process.env.DATABASE_URL),
            detail: (error as Error).message,
          },
        }
      : { error: 'Internal Server Error' };
    return NextResponse.json(body, { status: 500 });
  }
}
